-- Explicit patient correction of an accidentally selected answer, not medical clearance.
create table public.spm_safety_answer_corrections (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 plan_id uuid not null references public.plans(id),
 assessment_id uuid not null references public.assessments(id),
 question_id text not null,
 previous_answer boolean not null,
 corrected_answer boolean not null,
 reason text not null check(reason='selected_by_mistake'),
 created_at timestamptz not null default now()
);
alter table public.spm_safety_answer_corrections enable row level security;
revoke all on public.spm_safety_answer_corrections from public,anon,authenticated;
-- Server-only RPC: edge function authenticates owner; no direct client access.
create function public.spm_correct_safety_mistake(p_user_id uuid,p_plan_id uuid,p_question_id text,p_expected_answers jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare p public.plans%rowtype; a public.assessments%rowtype; m public.performance_maps%rowtype;
 flags jsonb; next_level text;
 known text[]:=array['h_cv_event','s_cardiac','s_priapism','s_neuro','s_testis','s_penile','s_blood','s_sudden'];
 urgent text[]:=array['s_cardiac','s_priapism','s_neuro','s_testis'];
begin
 if p_question_id is null or not(p_question_id=any(known)) then raise exception 'Invalid question'; end if;
 select * into p from public.plans where id=p_plan_id and user_id=p_user_id for update;
 if not found then raise exception 'Plan not found'; end if;
 select * into a from public.assessments where id=p.assessment_id and user_id=p_user_id for update;
 if not found or a.answers is distinct from p_expected_answers then raise exception 'Assessment changed'; end if;
 select * into m from public.performance_maps where id=p.performance_map_id and user_id=p_user_id and assessment_id=a.id for update;
 if not found then raise exception 'Map not found'; end if;
 if a.answers->p_question_id is distinct from 'true'::jsonb or not(m.safety_flags ? p_question_id) then raise exception 'Answer not eligible'; end if;
 -- Retain every other flag, including unknown or externally supplied flags.
 -- Reintroduce any positive catalog answer omitted from an old map.
 select coalesce(jsonb_agg(distinct v),'[]'::jsonb) into flags from (
  select value as v from jsonb_array_elements_text(m.safety_flags) where value<>p_question_id
  union select k from unnest(known) k where k<>p_question_id and a.answers->k='true'::jsonb
 ) retained;
 next_level:=case when exists(select 1 from jsonb_array_elements_text(flags) f where f=any(urgent)) then 'urgent'
  when m.safety_level='urgent' and exists(select 1 from jsonb_array_elements_text(flags) f where not(f=any(known))) then 'urgent'
  when jsonb_array_length(flags)>0 then 'review' else 'none' end;
 insert into public.spm_safety_answer_corrections(user_id,plan_id,assessment_id,question_id,previous_answer,corrected_answer,reason)
 values(p_user_id,p.id,a.id,p_question_id,true,false,'selected_by_mistake');
 update public.assessments set answers=jsonb_set(answers,array[p_question_id],'false'::jsonb) where id=a.id;
 update public.performance_maps set safety_flags=flags,safety_level=next_level where id=m.id;
 -- No calendar, score, priority, payment, completion or check-in is modified.
end;
$$;
revoke all on function public.spm_correct_safety_mistake(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.spm_correct_safety_mistake(uuid,uuid,text,jsonb) to service_role;
