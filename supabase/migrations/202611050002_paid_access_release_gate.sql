-- RELEASE GATE: deploy only with the unified paid-entry frontend, after sandbox QA.
-- Grandfather existing testing/approved programs; their day and records are unchanged.
insert into public.spm_program_access(plan_id,user_id,source)
 select id,user_id,'legacy' from public.plans on conflict(plan_id) do nothing;

drop policy if exists plans_insert_own on public.plans;
drop policy if exists plans_select_own on public.plans;
drop policy if exists plans_update_own on public.plans;
drop policy if exists plans_delete_own on public.plans;
create policy plans_select_entitled on public.plans for select to authenticated using(user_id=(select auth.uid()) and exists(select 1 from public.spm_program_access a where a.plan_id=plans.id and a.user_id=(select auth.uid()) and a.status='active'));
create policy plans_update_entitled on public.plans for update to authenticated using(user_id=(select auth.uid()) and exists(select 1 from public.spm_program_access a where a.plan_id=plans.id and a.user_id=(select auth.uid()) and a.status='active')) with check(user_id=(select auth.uid()));
revoke insert,delete on public.plans from authenticated;

create or replace function public.spm_protect_plan_identity() returns trigger language plpgsql set search_path='' as $$
begin
 if (select auth.role())='authenticated' and (new.id is distinct from old.id or new.user_id is distinct from old.user_id or new.assessment_id is distinct from old.assessment_id or new.performance_map_id is distinct from old.performance_map_id or new.route_key is distinct from old.route_key or new.cycle_days is distinct from old.cycle_days) then raise exception 'Plan identity is server managed'; end if;
 return new;
end;
$$;
create trigger spm_plan_identity_guard before update on public.plans for each row execute function public.spm_protect_plan_identity();
