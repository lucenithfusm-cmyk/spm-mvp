-- Additive infrastructure. Payment activation is service-role only.
create table public.spm_payment_orders (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 assessment_id uuid not null references public.assessments(id),
 performance_map_id uuid not null references public.performance_maps(id),
 environment text not null check (environment in ('test','prod')),
 reference text not null unique,
 amount_in_cents bigint not null default 14900000 check (amount_in_cents=14900000),
 currency text not null default 'COP' check(currency='COP'),
 status text not null default 'PENDING' check(status in ('PENDING','APPROVED','DECLINED','VOIDED','ERROR','EXPIRED')),
 transaction_id text,
 profile_snapshot jsonb not null,
 plan_id uuid references public.plans(id),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 verified_at timestamptz,
 unique(environment,transaction_id)
);
create index spm_payment_orders_user_idx on public.spm_payment_orders(user_id,created_at desc);
create unique index spm_payment_orders_one_pending on public.spm_payment_orders(user_id,environment) where status='PENDING';
alter table public.spm_payment_orders enable row level security;
-- Only server functions read orders: the browser receives a minimal owned status.
revoke all on public.spm_payment_orders from anon,authenticated;
grant all on public.spm_payment_orders to service_role;

create table public.spm_program_access (
 plan_id uuid primary key references public.plans(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 source text not null check(source in ('legacy','wompi')),
 order_id uuid unique references public.spm_payment_orders(id),
 status text not null default 'active' check(status in ('active','revoked')),
 created_at timestamptz not null default now()
);
create index spm_program_access_user_idx on public.spm_program_access(user_id,status);
alter table public.spm_program_access enable row level security;
create policy spm_program_access_read_own on public.spm_program_access for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.spm_program_access from anon,authenticated;
grant select on public.spm_program_access to authenticated;
grant all on public.spm_program_access to service_role;

create or replace function public.spm_confirm_wompi_transaction(p_order_id uuid,p_environment text,p_transaction jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.spm_payment_orders%rowtype; v_plan uuid; v_snapshot jsonb; v_status text;
begin
 select * into o from public.spm_payment_orders where id=p_order_id for update;
 if not found then raise exception 'Unknown order'; end if;
 if p_environment is distinct from o.environment or p_transaction->>'reference' is distinct from o.reference
 or p_transaction->>'currency' is distinct from 'COP' or (p_transaction->>'amount_in_cents')::bigint is distinct from 14900000
 or coalesce(p_transaction->>'id','') !~ '^[a-zA-Z0-9-]{5,100}$' then raise exception 'Transaction mismatch'; end if;
 v_status:=p_transaction->>'status';
 if v_status not in ('PENDING','APPROVED','DECLINED','VOIDED','ERROR') or v_status is null then raise exception 'Unknown status'; end if;
 if o.transaction_id is not null and o.transaction_id<>p_transaction->>'id' then raise exception 'Different transaction already recorded'; end if;
 -- Late/out-of-order events never undo an approval. A verified void revokes its access.
 if o.status='VOIDED' or (o.status='APPROVED' and v_status<>'VOIDED') then return jsonb_build_object('status',o.status,'planId',o.plan_id); end if;
 if o.status in ('DECLINED','ERROR') and v_status='PENDING' then return jsonb_build_object('status',o.status); end if;
 -- An old pending event must not resurrect an expired checkout or collide with
 -- a newer pending order. Keep its transaction ID so approval can be recovered.
 if o.status='EXPIRED' and v_status='PENDING' then
  update public.spm_payment_orders set transaction_id=p_transaction->>'id',verified_at=now() where id=o.id;
  return jsonb_build_object('status',o.status);
 end if;
 update public.spm_payment_orders set status=v_status,transaction_id=p_transaction->>'id',verified_at=now() where id=o.id;
 if v_status='VOIDED' then
  update public.spm_program_access set status='revoked' where order_id=o.id;
  return jsonb_build_object('status',v_status);
 end if;
 -- A sandbox approval is recorded but cannot grant a real program.
 if v_status<>'APPROVED' or o.environment<>'prod' then return jsonb_build_object('status',v_status,'environment',o.environment); end if;
 perform pg_advisory_xact_lock(hashtextextended(o.user_id::text,0));
 select plan_id into v_plan from public.spm_program_access where user_id=o.user_id and status='active' order by created_at desc limit 1;
 if v_plan is null then
  if not exists(select 1 from public.assessments where id=o.assessment_id and user_id=o.user_id)
   or not exists(select 1 from public.performance_maps where id=o.performance_map_id and assessment_id=o.assessment_id and user_id=o.user_id) then raise exception 'Assessment ownership mismatch'; end if;
  v_snapshot:=o.profile_snapshot;
  update public.performance_maps set spm_score=(v_snapshot->>'total')::smallint,primary_domain=v_snapshot->>'primary',secondary_domain=v_snapshot->>'secondary',domain_scores=v_snapshot->'scores',safety_level=v_snapshot->>'safety_level',safety_flags=v_snapshot->'safety_flags',explanation='Interpretación educativa de la autoevaluación; no es un diagnóstico.' where id=o.performance_map_id;
  insert into public.plans(user_id,assessment_id,performance_map_id,route_key,cycle_days,current_day,status,plan_snapshot)
   values(o.user_id,o.assessment_id,o.performance_map_id,v_snapshot->>'primary',28,1,'active',jsonb_build_object('version','spm-28-wompi-v1','payment_order',o.id,'primary',v_snapshot->>'primary','secondary',v_snapshot->>'secondary')) returning id into v_plan;
  insert into public.spm_program_access(plan_id,user_id,source,order_id) values(v_plan,o.user_id,'wompi',o.id);
 end if;
 update public.spm_payment_orders set plan_id=v_plan where id=o.id;
 return jsonb_build_object('status',v_status,'planId',v_plan,'environment',o.environment);
end;
$$;
revoke all on function public.spm_confirm_wompi_transaction(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.spm_confirm_wompi_transaction(uuid,text,jsonb) to service_role;

-- Atomic recovery: no progress, plan status, or existing positive flag is cleared.
create or replace function public.spm_complete_missing_answers(p_user_id uuid,p_plan_id uuid,p_expected_answers jsonb,p_answers jsonb,p_map jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare p public.plans%rowtype; a public.assessments%rowtype; m public.performance_maps%rowtype;
begin
 select * into p from public.plans where id=p_plan_id and user_id=p_user_id for update;
 if not found then raise exception 'Plan not found'; end if;
 select * into a from public.assessments where id=p.assessment_id and user_id=p_user_id for update;
 if not found or a.answers is distinct from p_expected_answers then raise exception 'Assessment changed; reload before saving'; end if;
 select * into m from public.performance_maps where id=p.performance_map_id and user_id=p_user_id and assessment_id=a.id for update;
 if not found then raise exception 'Map not found'; end if;
 if exists(select 1 from jsonb_each(a.answers) old where old.value<>'null'::jsonb and old.value<>'""'::jsonb and p_answers->old.key is distinct from old.value) then raise exception 'Existing answers cannot be changed by recovery'; end if;
 if not (coalesce(p_map->'safety_flags','[]'::jsonb) @> m.safety_flags) or (m.safety_level='urgent' and p_map->>'safety_level'<>'urgent') or (m.safety_level='review' and p_map->>'safety_level'='none') then raise exception 'Safety flag cannot be cleared'; end if;
 update public.assessments set answers=p_answers,status='completed',completed_at=coalesce(completed_at,now()) where id=a.id;
 update public.performance_maps set spm_score=(p_map->>'total')::smallint,domain_scores=p_map->'scores',safety_level=p_map->>'safety_level',safety_flags=p_map->'safety_flags' where id=m.id;
 -- Existing priority, calendar day, route, completions and check-ins remain intact.
end;
$$;
revoke all on function public.spm_complete_missing_answers(uuid,uuid,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.spm_complete_missing_answers(uuid,uuid,jsonb,jsonb,jsonb) to service_role;
