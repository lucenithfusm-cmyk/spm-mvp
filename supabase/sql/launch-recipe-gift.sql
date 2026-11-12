-- Prepared, not applied. Activate only after the sender and private PDF are configured.
-- The worker runs independently of checkout: email failure never blocks paid access.
create table public.spm_recipe_campaign (
 id boolean primary key default true check(id),
 allocated integer not null default 0 check(allocated between 0 and 50)
);
insert into public.spm_recipe_campaign(id) values(true);
create table public.spm_recipe_deliveries (
 id uuid primary key default gen_random_uuid(),
 slot integer not null unique check(slot between 1 and 50),
 user_id uuid not null unique references auth.users(id) on delete cascade,
 order_id uuid not null unique references public.spm_payment_orders(id),
 plan_id uuid not null references public.plans(id),
 recipient text not null,
 sender text,
 state text not null default 'pending' check(state in ('pending','sending','accepted','review','cancelled')),
 first_attempt_at timestamptz,
 lease_until timestamptz,
 lease_token uuid,
 attempts integer not null default 0,
 provider_id text,
 last_error text,
 created_at timestamptz not null default now(),
 accepted_at timestamptz
);
alter table public.spm_recipe_campaign enable row level security;
alter table public.spm_recipe_deliveries enable row level security;
revoke all on public.spm_recipe_campaign,public.spm_recipe_deliveries from public,anon,authenticated;
grant all on public.spm_recipe_campaign,public.spm_recipe_deliveries to service_role;

-- Service-only privileged lookup of order ownership and the account email.
create function public.spm_claim_recipe_gift(p_sender text)
returns setof public.spm_recipe_deliveries language plpgsql security definer set search_path='' as $$
declare n integer; candidate record;
begin
 if coalesce(p_sender,'')='' then raise exception 'Sender required'; end if;
 select allocated into n from public.spm_recipe_campaign where id=true for update;
 -- Lock serializes reservations and prevents a 51st slot, even with concurrent workers.
 for candidate in
  select * from (
   select distinct on (o.user_id) o.user_id,o.id as order_id,o.plan_id,u.email,o.verified_at,o.created_at
   from public.spm_payment_orders o join auth.users u on u.id=o.user_id
   join public.spm_program_access a on a.plan_id=o.plan_id and a.user_id=o.user_id
   where o.environment='prod' and o.status='APPROVED' and o.amount_in_cents=14900000 and o.currency='COP'
    and a.source='wompi' and a.status='active' and u.email is not null
    and not exists(select 1 from public.spm_recipe_deliveries g where g.user_id=o.user_id)
   order by o.user_id,o.verified_at,o.created_at,o.id
  ) candidates order by verified_at,created_at,order_id limit greatest(0,50-n)
 loop
  n:=n+1;
  insert into public.spm_recipe_deliveries(slot,user_id,order_id,plan_id,recipient)
   values(n,candidate.user_id,candidate.order_id,candidate.plan_id,candidate.email);
 end loop;
 update public.spm_recipe_campaign set allocated=n where id=true;
 -- Beyond the provider's deduplication window, require reconciliation instead of resending.
 update public.spm_recipe_deliveries set state='review',last_error='reconcile_provider_before_retry'
 where state in ('pending','sending') and (lease_until is null or lease_until<now())
  and (first_attempt_at<now()-interval '23 hours' or attempts>=5);
 return query
  with next as (
   select id from public.spm_recipe_deliveries
   where state='pending' or (state='sending' and lease_until<now())
   order by slot for update skip locked limit 1
  ) update public.spm_recipe_deliveries g
   set state='sending',sender=coalesce(g.sender,p_sender),first_attempt_at=coalesce(g.first_attempt_at,now()),
    lease_token=gen_random_uuid(),lease_until=now()+interval '5 minutes',attempts=g.attempts+1
   from next where g.id=next.id returning g.*;
end; $$;
revoke all on function public.spm_claim_recipe_gift(text) from public,anon,authenticated;
grant execute on function public.spm_claim_recipe_gift(text) to service_role;
