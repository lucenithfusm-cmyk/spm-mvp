-- Reviewable implementation, 27 Nov 2026. No production migration is run by this file.
-- Invoker functions and table triggers enforce the same invariants for RPC and direct writes.
-- The protected manifest is generated from the actual versioned client composer.
create table if not exists public.spm_agenda_versions (
 version text primary key, manifest jsonb not null check(jsonb_typeof(manifest)='object'),
 created_at timestamptz not null default now()
);
alter table public.spm_agenda_versions enable row level security;
revoke all on public.spm_agenda_versions from anon, authenticated;
grant select on public.spm_agenda_versions to authenticated;
create policy spm_agenda_read on public.spm_agenda_versions for select to authenticated using(true);

alter table public.plans add column if not exists schedule_version text not null default 'legacy';
alter table public.plans add column if not exists revision bigint not null default 0;
alter table public.plans add column if not exists cycle_status text not null default 'open' check(cycle_status in ('open','completed'));
alter table public.activity_completions add column if not exists record_revision bigint not null default 0;
-- Existing plans retain legacy; only subsequent server-created plans use the new agenda.
alter table public.plans alter column schedule_version set default 'spm-20261127-v1';

create table if not exists public.spm_day_closures (
 plan_id uuid not null references public.plans(id), day_number smallint not null check(day_number between 1 and 28),
 user_id uuid not null, schedule_version text not null, operation_id uuid not null,
 request jsonb not null, reason text not null check(reason in ('requirements_met','voluntary','legacy')),
 realized_count integer not null default 0 check(realized_count>=0),
 revision_before bigint not null, revision_after bigint not null,
 next_day smallint not null check(next_day between 1 and 28), cycle_status text not null,
 closed_at timestamptz not null default now(),
 primary key(plan_id,day_number), unique(user_id,operation_id)
);
alter table public.spm_day_closures enable row level security;
revoke all on public.spm_day_closures from anon,authenticated;
grant select,insert on public.spm_day_closures to authenticated;
create policy spm_closure_read on public.spm_day_closures for select to authenticated using(user_id=(select auth.uid()) and exists(select 1 from public.plans p where p.id=plan_id));
create policy spm_closure_insert on public.spm_day_closures for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.plans p where p.id=plan_id));

create table if not exists public.spm_activity_receipts (
 user_id uuid not null, plan_id uuid not null references public.plans(id), operation_id uuid not null,
 day_number smallint not null, activity_id text not null, request jsonb not null, result jsonb not null,
 created_at timestamptz not null default now(), primary key(user_id,operation_id)
);
alter table public.spm_activity_receipts enable row level security;
revoke all on public.spm_activity_receipts from anon,authenticated;
grant select,insert on public.spm_activity_receipts to authenticated;
create policy spm_receipt_read on public.spm_activity_receipts for select to authenticated using(user_id=(select auth.uid()) and exists(select 1 from public.plans p where p.id=plan_id));
create policy spm_receipt_insert on public.spm_activity_receipts for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.plans p where p.id=plan_id));

-- Preserve only explicit historical day closures. Never infer earlier completions from a later day.
insert into public.spm_day_closures(plan_id,day_number,user_id,schedule_version,operation_id,request,reason,revision_before,revision_after,next_day,cycle_status,closed_at)
 select c.plan_id,c.day_number,c.user_id,'legacy',c.id,'{}','legacy',0,0,least(28,c.day_number+1),case when c.day_number=28 then 'completed' else 'open' end,c.completed_at
 from public.activity_completions c join public.plans p on p.id=c.plan_id and p.user_id=c.user_id
 where c.module_key='daily_practice' and c.day_number between 1 and 28
 on conflict(plan_id,day_number) do nothing;
update public.plans p set cycle_status='completed',status=case when p.status='active' then 'completed' else p.status end where exists(select 1 from public.spm_day_closures d where d.plan_id=p.id and d.day_number=28) and not exists(select 1 from generate_series(1,28) n where not exists(select 1 from public.spm_day_closures d where d.plan_id=p.id and d.day_number=n));

create or replace function public.spm_answer_valid(q jsonb, v jsonb) returns boolean
language sql immutable security invoker set search_path='' as $$
 select case when q->>'type'='boolean' then jsonb_typeof(v)='boolean'
 when q->>'type'='text' then jsonb_typeof(v)='string' and length(trim(v#>>'{}')) between 1 and 2000
 when q->>'type' like 'scale5%' then jsonb_typeof(v)='number' and (v#>>'{}')::numeric between 1 and 5 and trunc((v#>>'{}')::numeric)=(v#>>'{}')::numeric
 else exists(select 1 from jsonb_array_elements(coalesce(q->'options','[]')) x where x->'value'=v) end
$$;

create or replace function public.spm_good_lab_result(r jsonb) returns boolean
language sql immutable security invoker set search_path='' as $$
 select coalesce(r->>'practiceId'='percibe' and r->'completed'='true' and r->>'origin'='dailyPlan' and r->>'intent'='daily-relax' and r->>'activityId'='pelvic-daily-lab' and r->'fullRelease'='true' and r->'discomfort'='false' and r->'postTension'='false' and r#>>'{weekly,voluntaryControl}'='yes' and r->>'recommendation' in ('repeat','progress'),false)
$$;

create or replace function public.spm_program_context(p_plan_id uuid) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare p public.plans; m public.performance_maps; a public.assessments; q jsonb; catalog jsonb;
level text; missing jsonb:='[]'; missing_sections jsonb:='[]'; selected boolean; visible boolean; low_desire boolean; ready boolean:=false;
 pf jsonb:='{}'; sc jsonb; last_result jsonb; last_check jsonb; tension numeric; invalid_pf boolean;
begin
 if auth.uid() is null then raise exception 'SPM_AUTH_REQUIRED'; end if;
 select * into p from public.plans where id=p_plan_id and user_id=auth.uid();
 if not found or not exists(select 1 from public.spm_program_access x where x.plan_id=p.id and x.user_id=auth.uid() and x.status='active') then raise exception 'SPM_PLAN_ACCESS_DENIED'; end if;
 select * into m from public.performance_maps where id=p.performance_map_id and user_id=auth.uid() for share;
 if not found or m.assessment_id is distinct from p.assessment_id then raise exception 'SPM_CONTEXT_UNAVAILABLE'; end if;
 select * into a from public.assessments where id=p.assessment_id and user_id=auth.uid() for share;
 if not found then raise exception 'SPM_CONTEXT_UNAVAILABLE'; end if;
 select manifest into catalog from public.spm_agenda_versions where version='assessment-20261127';
 if catalog is null or jsonb_typeof(catalog->'questions') is distinct from 'array' then raise exception 'SPM_CATALOG_UNAVAILABLE'; end if;
 if jsonb_array_length(catalog->'questions')=0 then raise exception 'SPM_CATALOG_UNAVAILABLE'; end if;
 level:=case m.safety_level when 'none' then 'none' when 'urgent' then 'urgent' else 'review' end;
 for q in select value from jsonb_array_elements(catalog->'questions') loop
  selected:=q->>'section' in ('goal','lifestyle','health','pelvic_floor','safety') or q->>'section'=any(a.motives) or ('optimization'=any(a.motives) and q->>'section' in ('confidence','wellbeing','desire'));
  visible:=not(q ? 'show_if') or a.answers->(q#>>'{show_if,id}')=q#>'{show_if,equals}';
  if selected and coalesce(visible,false) and not coalesce(public.spm_answer_valid(q,a.answers->(q->>'id')),false) then missing:=missing||jsonb_build_array(q->'id'); missing_sections:=missing_sections||jsonb_build_array(q->'section'); end if;
  if q->>'safety'='urgent' and (a.answers->(q->>'id')='true' or m.safety_flags ? (q->>'id')) then level:='urgent'; end if;
 end loop;
 if level<>'urgent' and (jsonb_array_length(m.safety_flags)>0 or exists(select 1 from public.daily_checkins c where c.plan_id=p.id and c.user_id=auth.uid() and c.new_safety_flag)) then level:='review'; end if;
 low_desire:=m.secondary_domain='desire' or 'desire'=any(a.motives) or a.answers->>'d_desire' in ('1','2') or a.answers->>'h_medeffect'='desire';
 select metadata->'state' into pf from public.activity_completions where plan_id=p.id and user_id=auth.uid() and module_key='resource:pelvic_lab_state' order by completed_at desc limit 1;
 pf:=coalesce(pf,'{}'); sc:=coalesce(pf->'pf-screening','{}'); last_result:=pf->'pf-results'->-1; last_check:=pf->'pf-checkins'->-1;
 if jsonb_typeof(a.answers->'pf_tension')='number' then tension:=(a.answers->>'pf_tension')::numeric; end if;
 invalid_pf:=jsonb_array_length(coalesce(pf->'pf-flags','[]'))>0 or jsonb_array_length(coalesce(pf->'pf-overload','[]'))>0 or sc->>'releaseOk'='no' or (last_check->>'tension')::numeric>=7 or last_check->>'release'='Difícil' or (pf ? 'pf-screening' and (sc->>'aware' is distinct from 'ok' or sc->>'releaseOk' is distinct from 'si' or jsonb_array_length(coalesce(sc->'comp','[]'))<>3)) or last_result->'fullRelease'='false' or last_result->'discomfort'='true' or last_result->'postTension'='true' or last_result->>'recommendation' in ('relax','clinical-review');
 if level='none' and coalesce(tension<4,true) and not coalesce(invalid_pf,false) then
  ready:=(a.answers->>'pf_awareness'='good_control' and tension in (0,1,2)) or (sc->>'aware'='ok' and sc->>'releaseOk'='si' and jsonb_array_length(coalesce(sc->'comp','[]'))=3 and sc->'comp' @> '["mandibula","abdomen","gluteos"]') or (a.answers->>'pf_awareness'='hard_to_relax' and tension<=2 and jsonb_array_length(coalesce(pf->'pf-results','[]'))>=2 and public.spm_good_lab_result(last_result) and public.spm_good_lab_result(pf->'pf-results'->-2)) or (a.answers->>'pf_awareness'<>'hard_to_relax' and public.spm_good_lab_result(last_result));
 end if;
 return jsonb_build_object('planId',p.id,'userId',p.user_id,'day',p.current_day,'scheduleVersion',p.schedule_version,'planRevision',p.revision,'cycleStatus',p.cycle_status,'planStatus',p.status,'primary',coalesce(m.primary_domain,p.route_key),'secondary',m.secondary_domain,'lowDesire',coalesce(low_desire,false),'safety',level,'missing',missing,'missingSections',missing_sections,'strengthEligible',coalesce(ready,false),'movementRestricted',coalesce(level<>'none' or a.answers->'h_cv_event'='true' or a.answers->'h_cv'='true' or (a.answers->'h_has_condition'='true' and a.answers->>'h_control_status' is distinct from 'controlled'),false) or exists(select 1 from public.activity_completions r where r.plan_id=p.id and r.user_id=auth.uid() and r.module_key like 'resource:movement:%' and r.metadata->>'tolerance'='symptoms'));
end $$;

create or replace function public.spm_day_definition(p_plan_id uuid,p_day integer) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare c jsonb; manifest jsonb; entry jsonb; items jsonb; route text; key text;
begin
 if p_day not between 1 and 28 then raise exception 'SPM_INVALID_DAY'; end if;
 c:=public.spm_program_context(p_plan_id); route:=c->>'primary';
 route:=case route when 'anxiety' then 'confidence' when 'optimization' then 'wellbeing' when 'mixed' then 'confidence' else route end;
 select v.manifest into manifest from public.spm_agenda_versions v where v.version=c->>'scheduleVersion';
 if manifest is null then raise exception 'SPM_AGENDA_UNAVAILABLE'; end if;
 if c->>'scheduleVersion'='legacy' then
  key:=route||case when (c->>'lowDesire')::boolean then '-desire' else '' end||'-'||(c->>'safety')||case when (c->>'strengthEligible')::boolean then '-strength' else '' end;
  items:=manifest#>array['allRoutes',key,p_day::text];
 else
  if (c->>'lowDesire')::boolean and manifest->'variants' ? (route||'-desire') then entry:=manifest#>array['variants',route||'-desire',p_day::text]; else entry:=manifest#>array['routes',route,p_day::text]; end if;
  if entry->'primary' is null or entry->'primary'='null' then raise exception 'SPM_AGENDA_UNAVAILABLE'; end if;
  items:=jsonb_build_array(entry->'primary')||case when entry->'support' is not null and entry->'support'<>'null' then jsonb_build_array(entry->'support') else '[]'::jsonb end||coalesce(entry->'resources','[]');
 end if;
 if jsonb_typeof(items) is distinct from 'array' or jsonb_array_length(items)=0 then raise exception 'SPM_AGENDA_UNAVAILABLE'; end if;
 select jsonb_agg(value||jsonb_build_object('scheduledDay',p_day,'sourceDay',coalesce((value->>'sourceDay')::integer,p_day))) into items from jsonb_array_elements(items);
 return c||jsonb_build_object('scheduledDay',p_day,'items',items);
end $$;

create or replace function public.spm_item_restricted(c jsonb,a jsonb) returns boolean
language plpgsql immutable security invoker set search_path='' as $$
declare educational boolean; movement boolean; missing jsonb:=coalesce(c->'missingSections','[]');
begin
 if c->>'safety' in ('urgent','unavailable') then return true; end if;
 if a->>'kind'='erection-support-day' then return false; end if;
 movement:=a->>'kind'='wellness' and (a->>'wellnessCategory'='movement' or coalesce(a->>'wellnessId',a->>'tipId','') like 'mov.%');
 educational:=coalesce(a->>'kind' in ('program-checkpoint','video','ep-checkpoint','confidence') or
 (a->>'kind'='worksheet' and a->>'interaction' in ('baseline','context','checklist','review','progress','reassessment','script','planner','priorities','reframe','ifthen')) or (a->>'kind'='wellness' and not coalesce(movement,false)),false);
 if coalesce(movement,false) and c->'movementRestricted'='true' then return true; end if;
 if not educational and (missing ? 'safety' or (a->>'kind'='pelvic' and missing ? 'pelvic_floor') or (coalesce(movement,false) and missing ? 'health')) then return true; end if;
 if c->>'safety'='review' and not (educational or a->>'kind' in ('sensate','connection')) then return true; end if;
 return coalesce(a->>'condition'='strength' and c->'strengthEligible'<>'true',false);
end
$$;

-- These helpers transcribe the existing browser validators; they add no clinical
-- thresholds or time/listening requirements. The source schemas are versioned below.
create or replace function public.spm_json_integer(v jsonb,low_value numeric,high_value numeric,nullable boolean default false) returns boolean
language plpgsql immutable security invoker set search_path='' as $$
begin
 if v is null then return false; end if;
 if v='null' then return nullable; end if;
 if jsonb_typeof(v)<>'number' then return false; end if;
 return (v#>>'{}')::numeric between low_value and high_value and trunc((v#>>'{}')::numeric)=(v#>>'{}')::numeric;
end $$;

create or replace function public.spm_json_selection(v jsonb,options jsonb,min_items integer,max_items integer,exclusive text default null) returns boolean
language plpgsql immutable security invoker set search_path='' as $$
begin
 if jsonb_typeof(v) is distinct from 'array' or jsonb_typeof(options) is distinct from 'array' then return false; end if;
 if jsonb_array_length(v) not between min_items and max_items then return false; end if;
 if (select count(distinct value) from jsonb_array_elements(v))<>jsonb_array_length(v) then return false; end if;
 if exists(select 1 from jsonb_array_elements(v) x where not options @> jsonb_build_array(x.value)) then return false; end if;
 return exclusive is null or not (v ? exclusive) or jsonb_array_length(v)=1;
end $$;

create or replace function public.spm_erection_record_valid(a jsonb,r jsonb,schema jsonb) returns boolean
language plpgsql immutable security invoker set search_path='' as $$
declare lesson integer:=(a->>'erectionLesson')::integer; e jsonb:=schema#>'{erection,enums}'; v jsonb; practiced boolean; is_reflection boolean;
begin
 if r->'erectionPracticeVersion' is distinct from '1' or r->'confirmed' is distinct from 'true' or r->'day' is distinct from a->'sourceDay' or not public.spm_json_integer(r->'anxiety',0,10,true) or not public.spm_json_integer(r->'confidence',0,10,true) then return false; end if;
 if lesson=1 then
  if r->'erectionLesson' is not null and r->'erectionLesson'<>'null' and r->'erectionLesson'<>'1' then return false; end if;
  if not coalesce((r->>'ehsStatus'='omitted' and r->'ehsOmitted'='true' and r->'ehs'='null' and r->'ehsEvaluable'='null') or
   (r->'ehs'='null' and r->'ehsEvaluable'='false' and r->'ehsOmitted' is distinct from 'true' and coalesce(r->>'ehsStatus','not_evaluable')='not_evaluable') or
   (public.spm_json_integer(r->'ehs',0,4) and r->'ehsEvaluable'='true' and r->'ehsOmitted' is distinct from 'true' and coalesce(r->>'ehsStatus','recorded')='recorded'),false) then return false; end if;
  if r->'completionAccepted'='true' or r->>'ehsStatus' is not null then
   if r->'completionAccepted' is distinct from 'true' or coalesce(r->>'attentionPracticeOutcome','') not in ('maintained','returned','difficult','omitted') then return false; end if;
   practiced:=r->>'attentionPracticeOutcome'<>'omitted';
   return r->'attentionPracticeCompleted'=to_jsonb(practiced) and r->'completed'=to_jsonb(practiced) and r->>'activityStatus'=case when practiced then 'completed' else 'omitted' end;
  end if;
  return true;
 end if;
 if r->'erectionLesson' is distinct from to_jsonb(lesson) then return false; end if;
 is_reflection:=jsonb_typeof(r->'finalFeeling')='string' and length(r->>'finalFeeling')<=1000 and public.spm_json_integer(r->'seconds',0,9007199254740991,true);
 if lesson=2 then
  for v in select value from jsonb_array_elements(e->'contexts') loop if not coalesce((e->'contextValues') @> jsonb_build_array(r->'contexts'->(v#>>'{}')),false) then return false; end if; end loop;
  return (e->'aspects') @> jsonb_build_array(r->'responseAspect');
 elsif lesson=3 then return public.spm_json_selection(r->'tensionAreas',e->'areas',1,4,'none') and (e->'anchors') @> jsonb_build_array(r->'sensoryAnchor') and coalesce(is_reflection,false);
 elsif lesson=4 then return (e->'senses') @> jsonb_build_array(r->'attentionSense') and (e->'experiences') @> jsonb_build_array(r->'practiceExperience') and coalesce(is_reflection,false);
 elsif lesson=5 then return public.spm_json_selection(r->'erectionFacilitators',e->'facilitators',1,3,'unknown') and public.spm_json_selection(r->'erectionInhibitors',e->'inhibitors',1,2,'unknown') and (e->'adjustments') @> jsonb_build_array(r->'microAdjustment');
 elsif lesson=6 then return public.spm_json_selection(r->'erectionStimuli',e->'stimuli',1,6);
 elsif lesson=7 then return public.spm_json_selection(r->'erectionProgress',e->'progressMarkers',1,4,'empezando') and (e->'confidenceIdeas') @> jsonb_build_array(r->'erectionConfidenceStatement') and (e->'nextSteps') @> jsonb_build_array(r->'erectionNextStep');
 elsif lesson=8 then return public.spm_json_selection(r->'erectionFavorablePositions',(e->'positions')||'["no_evaluable"]',1,6,'no_evaluable') and (r->>'erectionLessFavorablePosition' is null or r->>'erectionLessFavorablePosition'='no_identificada' or (e->'positions') @> jsonb_build_array(r->'erectionLessFavorablePosition')) and (e->'positionStrategies') @> jsonb_build_array(r->'erectionChosenStrategy') and (r->>'erectionPracticeStarted' is null or jsonb_typeof(r->'erectionPracticeStarted')='boolean') and (r->>'erectionOptionalTimerSeconds' is null or public.spm_json_integer(r->'erectionOptionalTimerSeconds',0,9007199254740991));
 elsif lesson=9 then return (e->'responseStrategies') @> jsonb_build_array(r->'erectionResponseStrategy') and public.spm_json_selection(r->'erectionPlanStepsHeard','[0,1,2,3]',0,4);
 elsif lesson=10 then return public.spm_json_selection(r->'warningSignals',e->'preventionSignals',1,4,'none') and (e->'preventionStrategies') @> jsonb_build_array(r->'preventionStrategy');
 end if;
 return false;
end $$;

create or replace function public.spm_connection_record_valid(a jsonb,r jsonb,schema jsonb) returns boolean
language plpgsql immutable security invoker set search_path='' as $$
declare source_day integer:=coalesce((a->>'connectionDay')::integer,(a->>'sourceDay')::integer); definition jsonb; answers jsonb:=r->'answers'; f jsonb; v jsonb;
begin
 definition:=schema#>array['connection','days',source_day::text];
 if definition is null or r->'connectionDay' is distinct from to_jsonb(source_day) or jsonb_typeof(answers) is distinct from 'object' then return false; end if;
 if definition->>'maxTopics' is not null and not public.spm_json_selection(answers->'topics',definition->'topics',(definition->>'maxTopics')::integer,(definition->>'maxTopics')::integer) then return false; end if;
 for f in select value from jsonb_array_elements(definition->'fields') loop
  if f->>'when' is not null and answers->>'mode' is distinct from f->>'when' then continue; end if;
  if answers->>'mode'='No aplica' and f->>'key'<>'mode' then continue; end if;
  v:=answers->(f->>'key');
  if f->'optional'='true' and (v is null or v='""') then continue; end if;
  if f->>'values'='scale' then if not public.spm_json_integer(v,0,10,true) then return false; end if;
  elsif f->>'values'='chosen' then if not coalesce((answers->'topics') @> jsonb_build_array(v),false) then return false; end if;
  elsif jsonb_typeof(f->'values')='array' then if not (f->'values') @> jsonb_build_array(v) then return false; end if;
  elsif jsonb_typeof(v) is distinct from 'string' or length(trim(v#>>'{}'))=0 or length(v#>>'{}')>400 then return false;
  end if;
 end loop;
 return true;
end $$;

create or replace function public.spm_checkpoint_record_valid(r jsonb,schema jsonb) returns boolean
language plpgsql immutable security invoker set search_path='' as $$
declare max_score integer; key text;
begin
 if r->'checkpointVersion'='1' then max_score:=10;
 elsif r->'checkpointVersion'='2' and r->'scaleMax'='4' then max_score:=4;
 else return false; end if;
 for key in select value from jsonb_array_elements_text(schema#>'{checkpoint,metrics}') loop if not public.spm_json_integer(r->'metrics'->key,0,max_score,true) then return false; end if; end loop;
 if jsonb_typeof(r->'reflection') is distinct from 'string' or length(r->>'reflection')>2000 or jsonb_typeof(r->'continuity') is distinct from 'string' or length(r->>'continuity')>2000 then return false; end if;
 if r->'legacyCheckpoint' is not null and r->'legacyCheckpoint'<>'null' then return r->'checkpointVersion'='2' and r#>'{legacyCheckpoint,checkpointVersion}'='1' and public.spm_checkpoint_record_valid(r->'legacyCheckpoint',schema); end if;
 return true;
end $$;

create or replace function public.spm_record_satisfies(a jsonb,r jsonb,version text) returns boolean
language plpgsql stable security invoker set search_path='' as $$
declare schema jsonb; pr jsonb; tip text;
begin
 if r is null or r->>'activityStatus' in ('interrupted','draft','pending') then return false; end if;
 if r ? 'activityKind' and r->>'activityKind'<>a->>'kind' then return false; end if;
 if a->>'scenario' is not null and r->>'scenario' is distinct from a->>'scenario' then return false; end if;
 if version<>'legacy' and (r->>'scheduleVersion' is distinct from version or r->>'assignmentId' is distinct from a->>'assignmentId' or r->>'contentId' is distinct from a->>'contentId' or r->>'contentVersion' is distinct from a->>'contentVersion' or r->'scheduledDay' is distinct from a->'scheduledDay') then return false; end if;
 select v.manifest into schema from public.spm_agenda_versions v where v.version='validation-20261127';
 if schema is null then return false; end if;
 if a->>'kind'='erection' and a->>'erectionLesson' is not null and not coalesce(public.spm_erection_record_valid(a,r,schema),false) then return false; end if;
 if a->>'kind'='connection' and not public.spm_connection_record_valid(a,r,schema) then return false; end if;
 if a->>'kind'='program-checkpoint' and not public.spm_checkpoint_record_valid(r,schema) then return false; end if;
 tip:=coalesce(a->>'wellnessId',a->>'tipId'); if tip is not null and r->>'tipId' is distinct from tip then return false; end if;
 if a->>'kind'='pelvic' and a->>'pelvicIntent' is not null then
  pr:=r->'pelvicResult';
  if pr is null or pr->'completed' is distinct from 'true' or pr->'day' is distinct from a->'scheduledDay' or pr->>'activityId' is distinct from a->>'id' or pr->>'intent' is distinct from a->>'pelvicIntent' then return false; end if;
  if a->>'pelvicIntent'='daily-relax' and (pr->>'practiceId' is distinct from 'percibe' or pr->>'origin' is distinct from 'dailyPlan') then return false; end if;
  if a->>'pelvicIntent'='scheduled' and pr->>'source' is distinct from 'pelvic-classic-v2' then return false; end if;
 end if;
 if a->>'kind'='erection' and (a->>'erectionLesson')::integer=1 and r->'completionAccepted'='true' and r->>'activityStatus'='omitted' and r->'attentionPracticeCompleted'='false' then return true; end if;
 return coalesce(r->'completed'='true' and coalesce(r->>'activityStatus','completed')='completed',false);
end $$;

create or replace function public.spm_guard_activity() returns trigger language plpgsql security invoker set search_path='' as $$
declare c jsonb; a jsonb; rid text; receipt public.spm_activity_receipts; closure public.spm_day_closures; old_rev bigint; canonical_summary jsonb;
begin
 if current_user in ('postgres','service_role','supabase_admin') then return case when tg_op='DELETE' then old else new end; end if;
 if auth.uid() is null then raise exception 'SPM_AUTH_REQUIRED'; end if;
 if tg_op='DELETE' then raise exception 'SPM_ACTIVITY_HISTORY_PROTECTED'; end if;
 if new.user_id is distinct from auth.uid() or (tg_op='UPDATE' and (new.id<>old.id or new.user_id<>old.user_id or new.plan_id<>old.plan_id or new.day_number<>old.day_number or new.module_key<>old.module_key)) then raise exception 'SPM_CONTEXT_CONFLICT'; end if;
 perform 1 from public.plans where id=new.plan_id and user_id=auth.uid() for update;
 if not found then raise exception 'SPM_PLAN_ACCESS_DENIED'; end if;
 if new.module_key='daily_practice' then
  -- This is an immutable projection of the actual closure, never a client report.
  -- A no-op UPDATE is also rejected; replay happens through the closure RPC.
  if tg_op='UPDATE' then raise exception 'SPM_DAY_CLOSURE_HISTORY_PROTECTED'; end if;
  select * into closure from public.spm_day_closures d where d.plan_id=new.plan_id and d.day_number=new.day_number and d.user_id=auth.uid() and d.operation_id::text=new.metadata->>'operationId';
  if not found then raise exception 'SPM_USE_ATOMIC_DAY_CLOSE'; end if;
  canonical_summary:=jsonb_build_object('source','atomic-day-close-v1','operationId',closure.operation_id,'dayStatus','closed','reason',closure.reason,'realizedCount',closure.realized_count,'scheduleVersion',closure.schedule_version);
  if new.metadata is distinct from canonical_summary then raise exception 'SPM_INVALID_DAY_CLOSURE_SUMMARY'; end if;
  new.completed_at:=closure.closed_at; new.record_revision:=0; new.metric_value:=null;
  return new;
 end if;
 if new.module_key not like 'resource:%' then raise exception 'SPM_RESOURCE_ID_REQUIRED'; end if;
 if new.module_key not like 'resource:daily_activity:%' then return new; end if;
 c:=public.spm_day_definition(new.plan_id,new.day_number);
 if c->>'planStatus'<>'active' or c->>'cycleStatus'='completed' or (c->>'day')::integer<>new.day_number then raise exception 'SPM_CONTEXT_CONFLICT'; end if;
 rid:=substr(new.module_key,length('resource:daily_activity:')+1);
 select value into a from jsonb_array_elements(c->'items') where value->>'id'=rid;
 if a is null or coalesce(public.spm_item_restricted(c,a),false) then raise exception 'SPM_ACTIVITY_UNAVAILABLE'; end if;
 if new.metadata->>'activityKind' is distinct from a->>'kind' or new.metadata->>'scheduleVersion' is distinct from c->>'scheduleVersion' then raise exception 'SPM_ACTIVITY_VERSION_CONFLICT'; end if;
 if c->>'scheduleVersion'<>'legacy' and (new.metadata->>'assignmentId' is distinct from a->>'assignmentId' or new.metadata->>'contentId' is distinct from a->>'contentId' or new.metadata->>'contentVersion' is distinct from a->>'contentVersion') then raise exception 'SPM_ACTIVITY_VERSION_CONFLICT'; end if;
 if jsonb_typeof(new.metadata) is distinct from 'object' or octet_length(new.metadata::text)>30000 or coalesce(new.metadata->>'activityStatus','') not in ('completed','omitted','interrupted') or new.metadata->>'operationId' is null then raise exception 'SPM_INVALID_ACTIVITY_RECORD'; end if;
 if new.metadata->>'activityStatus'='omitted' and not coalesce((a->>'optional')::boolean,false) and not(a->>'kind'='erection' and (a->>'erectionLesson')::integer=1 and new.metadata->'attentionPracticeCompleted'='false' and new.metadata->'completionAccepted'='true') then raise exception 'SPM_REQUIRED_ACTIVITY_PENDING'; end if;
 new.metadata:=new.metadata||jsonb_build_object('completed',new.metadata->>'activityStatus'='completed');
 if (new.metadata->>'activityStatus'='completed' or (new.metadata->>'activityStatus'='omitted' and not coalesce((a->>'optional')::boolean,false))) and not public.spm_record_satisfies(a,new.metadata,c->>'scheduleVersion') then raise exception 'SPM_INVALID_ACTIVITY_RECORD'; end if;
 old_rev:=case when tg_op='UPDATE' then old.record_revision else 0 end;
 if new.record_revision<>old_rev+1 then raise exception 'SPM_RECORD_REVISION_CONFLICT'; end if;
 new.metadata:=new.metadata||jsonb_build_object('_recordRevision',new.record_revision);
 new.completed_at:=now();
 select * into receipt from public.spm_activity_receipts where user_id=auth.uid() and operation_id=(new.metadata->>'operationId')::uuid;
 if found then raise exception 'SPM_OPERATION_ALREADY_USED'; end if;
 return new;
end $$;
create trigger spm_activity_guard before insert or update or delete on public.activity_completions for each row execute function public.spm_guard_activity();

create or replace function public.spm_guard_receipt() returns trigger language plpgsql security invoker set search_path='' as $$
declare activity public.activity_completions; canonical_request jsonb; canonical_result jsonb;
begin
 if auth.uid() is null or new.user_id is distinct from auth.uid() then raise exception 'SPM_AUTH_REQUIRED'; end if;
 select * into activity from public.activity_completions a where a.user_id=auth.uid() and a.plan_id=new.plan_id and a.day_number=new.day_number and a.module_key='resource:daily_activity:'||new.activity_id and a.metadata->>'operationId'=new.operation_id::text;
 if not found or activity.record_revision<1 then raise exception 'SPM_INVALID_RECEIPT'; end if;
 canonical_request:=jsonb_build_object('plan',activity.plan_id,'day',activity.day_number,'activity',new.activity_id,'metadata',activity.metadata-array['operationId','_recordRevision'],'version',activity.metadata->>'scheduleVersion','revision',activity.record_revision-1);
 canonical_result:=jsonb_build_object('ok',true,'metadata',activity.metadata,'recordRevision',activity.record_revision);
 if new.request is distinct from canonical_request or new.result is distinct from canonical_result then raise exception 'SPM_INVALID_RECEIPT'; end if;
 new.created_at:=activity.completed_at;
 return new;
end $$;
create trigger spm_receipt_guard before insert on public.spm_activity_receipts for each row execute function public.spm_guard_receipt();

create or replace function public.spm_save_activity(p_plan_id uuid,p_day integer,p_activity_id text,p_metadata jsonb,p_schedule_version text,p_expected_record_revision bigint,p_operation_id uuid) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare p public.plans; r public.activity_completions; receipt public.spm_activity_receipts; request jsonb; result jsonb; meta jsonb;
begin
 if auth.uid() is null then raise exception 'SPM_AUTH_REQUIRED'; end if;
 if jsonb_typeof(p_metadata) is distinct from 'object' then raise exception 'SPM_INVALID_ACTIVITY_RECORD'; end if;
 -- Normalize only server-owned fields before hashing/comparing a replay request.
 -- The receipt can then be checked against the persisted row without trusting
 -- a caller-supplied revision, identity, status projection, or result object.
 p_metadata:=(p_metadata-array['operationId','_recordRevision'])||jsonb_build_object('scheduleVersion',p_schedule_version,'completed',p_metadata->>'activityStatus'='completed');
 request:=jsonb_build_object('plan',p_plan_id,'day',p_day,'activity',p_activity_id,'metadata',p_metadata,'version',p_schedule_version,'revision',p_expected_record_revision);
 select * into p from public.plans where id=p_plan_id and user_id=auth.uid() for update;
 if not found then raise exception 'SPM_PLAN_ACCESS_DENIED'; end if;
 select * into receipt from public.spm_activity_receipts where user_id=auth.uid() and operation_id=p_operation_id;
 if found then if receipt.request<>request then raise exception 'SPM_OPERATION_CONFLICT'; end if; return receipt.result; end if;
 if p.schedule_version<>p_schedule_version or p.current_day<>p_day or p_operation_id is null then raise exception 'SPM_CONTEXT_CONFLICT'; end if;
 if p_activity_id !~ '^[a-z0-9-]{1,60}$' then raise exception 'SPM_INVALID_ACTIVITY'; end if;
 select * into r from public.activity_completions where plan_id=p_plan_id and user_id=auth.uid() and day_number=p_day and module_key='resource:daily_activity:'||p_activity_id;
 if coalesce(r.record_revision,0)<>p_expected_record_revision then raise exception 'SPM_RECORD_REVISION_CONFLICT'; end if;
 meta:=p_metadata||jsonb_build_object('operationId',p_operation_id,'scheduleVersion',p_schedule_version,'_recordRevision',p_expected_record_revision+1);
 if r.id is null then
  insert into public.activity_completions(user_id,plan_id,day_number,module_key,metadata,record_revision) values(auth.uid(),p_plan_id,p_day,'resource:daily_activity:'||p_activity_id,meta,p_expected_record_revision+1) returning * into r;
 else
  update public.activity_completions set metadata=meta,record_revision=p_expected_record_revision+1 where id=r.id returning * into r;
 end if;
 result:=jsonb_build_object('ok',true,'metadata',r.metadata,'recordRevision',r.record_revision);
 insert into public.spm_activity_receipts(user_id,plan_id,operation_id,day_number,activity_id,request,result) values(auth.uid(),p_plan_id,p_operation_id,p_day,p_activity_id,request,result);
 return result;
end $$;

create or replace function public.spm_guard_day_closure() returns trigger language plpgsql security invoker set search_path='' as $$
declare p public.plans; c jsonb; a jsonb; r jsonb; required integer:=0; next_open integer; realized integer:=0;
begin
 if auth.uid() is null or new.user_id is distinct from auth.uid() then raise exception 'SPM_AUTH_REQUIRED'; end if;
 select * into p from public.plans where id=new.plan_id and user_id=auth.uid() for update;
 if not found then raise exception 'SPM_PLAN_ACCESS_DENIED'; end if;
 if p.status<>'active' or p.cycle_status='completed' or p.current_day<>new.day_number or p.schedule_version<>new.schedule_version or p.revision<>new.revision_before then raise exception 'SPM_PLAN_REVISION_CONFLICT'; end if;
 select min(n) into next_open from generate_series(1,28) n where not exists(select 1 from public.spm_day_closures d where d.plan_id=p.id and d.day_number=n);
 if next_open is distinct from p.current_day::integer then raise exception 'SPM_PROGRESS_RECONCILIATION_REQUIRED'; end if;
 c:=public.spm_day_definition(p.id,new.day_number);
 if c->>'safety' in ('urgent','unavailable') then raise exception 'SPM_SAFETY_PAUSE'; end if;
 if jsonb_array_length(c->'missing')>0 then raise exception 'SPM_ASSESSMENT_PENDING'; end if;
 for a in select value from jsonb_array_elements(c->'items') loop
  select metadata into r from public.activity_completions where plan_id=p.id and user_id=auth.uid() and day_number=new.day_number and module_key='resource:daily_activity:'||(a->>'id');
  if not coalesce((a->>'optional')::boolean,false) then
   required:=required+1;
   if coalesce(public.spm_item_restricted(c,a),false) then raise exception 'SPM_SAFETY_PAUSE'; end if;
   if not public.spm_record_satisfies(a,r,p.schedule_version) then raise exception 'SPM_REQUIRED_ACTIVITY_PENDING: %',a->>'id'; end if;
  end if;
  if public.spm_record_satisfies(a,r,p.schedule_version) and r->'completed'='true' and coalesce(r->>'activityStatus','completed')='completed' then realized:=realized+1; end if;
 end loop;
 if required=0 and new.request->'confirmVoluntary' is distinct from 'true'::jsonb then raise exception 'SPM_VOLUNTARY_CONFIRMATION_REQUIRED'; end if;
 new.reason:=case when required=0 then 'voluntary' else 'requirements_met' end;
 new.realized_count:=realized; new.revision_after:=p.revision+1; new.closed_at:=now();
 select min(n) into next_open from generate_series(1,28) n where n<>new.day_number and not exists(select 1 from public.spm_day_closures d where d.plan_id=p.id and d.day_number=n);
 new.next_day:=coalesce(next_open,28); new.cycle_status:=case when next_open is null then 'completed' else 'open' end;
 return new;
end $$;
create trigger spm_closure_guard before insert on public.spm_day_closures for each row execute function public.spm_guard_day_closure();

create or replace function public.spm_guard_plan_progress() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if current_user in ('postgres','service_role','supabase_admin') then return new; end if;
 if new.user_id is distinct from auth.uid() then raise exception 'SPM_PLAN_ACCESS_DENIED'; end if;
 if (to_jsonb(new)-array['current_day','revision','cycle_status','status','updated_at']) is distinct from (to_jsonb(old)-array['current_day','revision','cycle_status','status','updated_at']) then raise exception 'SPM_PLAN_SERVER_MANAGED'; end if;
 if new.status is distinct from (case when new.cycle_status='completed' then 'completed' else old.status end) then raise exception 'SPM_PLAN_SERVER_MANAGED'; end if;
 if (new.current_day,new.revision,new.cycle_status,new.status) is distinct from (old.current_day,old.revision,old.cycle_status,old.status) and not exists(select 1 from public.spm_day_closures d where d.plan_id=new.id and d.day_number=old.current_day and d.revision_before=old.revision and d.revision_after=new.revision and d.next_day=new.current_day and d.cycle_status=new.cycle_status) then raise exception 'SPM_USE_ATOMIC_DAY_CLOSE'; end if;
 return new;
end $$;
create trigger spm_plan_progress_guard before update on public.plans for each row execute function public.spm_guard_plan_progress();

create or replace function public.spm_advance_closed_day() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 insert into public.activity_completions(user_id,plan_id,day_number,module_key,metadata) values(new.user_id,new.plan_id,new.day_number,'daily_practice',jsonb_build_object('source','atomic-day-close-v1','operationId',new.operation_id,'dayStatus','closed','reason',new.reason,'realizedCount',new.realized_count,'scheduleVersion',new.schedule_version)) on conflict(plan_id,day_number,module_key) do nothing;
 update public.plans set current_day=new.next_day,revision=new.revision_after,cycle_status=new.cycle_status,status=case when new.cycle_status='completed' then 'completed' else status end where id=new.plan_id and user_id=new.user_id and revision=new.revision_before;
 if not found then raise exception 'SPM_PLAN_REVISION_CONFLICT'; end if;
 return new;
end $$;
create trigger spm_close_and_advance after insert on public.spm_day_closures for each row execute function public.spm_advance_closed_day();

create or replace function public.spm_close_program_day(p_plan_id uuid,p_day integer,p_schedule_version text,p_expected_revision bigint,p_operation_id uuid,p_confirm_voluntary boolean default false) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare p public.plans; d public.spm_day_closures; request jsonb;
begin
 if auth.uid() is null or p_operation_id is null then raise exception 'SPM_AUTH_REQUIRED'; end if;
 select * into p from public.plans where id=p_plan_id and user_id=auth.uid() for update;
 if not found then raise exception 'SPM_PLAN_ACCESS_DENIED'; end if;
 request:=jsonb_build_object('plan',p_plan_id,'day',p_day,'version',p_schedule_version,'revision',p_expected_revision,'confirmVoluntary',p_confirm_voluntary);
 select * into d from public.spm_day_closures where user_id=auth.uid() and operation_id=p_operation_id;
 if found then if d.request<>request then raise exception 'SPM_OPERATION_CONFLICT'; end if; return jsonb_build_object('ok',true,'closure',to_jsonb(d),'plan',to_jsonb(p)); end if;
 select * into d from public.spm_day_closures where plan_id=p_plan_id and day_number=p_day and user_id=auth.uid();
 if found then return jsonb_build_object('ok',true,'alreadyClosed',true,'closure',to_jsonb(d),'plan',to_jsonb(p)); end if;
 insert into public.spm_day_closures(plan_id,day_number,user_id,schedule_version,operation_id,request,reason,revision_before,revision_after,next_day,cycle_status) values(p_plan_id,p_day,auth.uid(),p_schedule_version,p_operation_id,request,'voluntary',p_expected_revision,p_expected_revision+1,least(28,p_day+1),'open') returning * into d;
 select * into p from public.plans where id=p_plan_id and user_id=auth.uid();
 return jsonb_build_object('ok',true,'closure',to_jsonb(d),'plan',to_jsonb(p));
end $$;

create or replace function public.spm_get_program_progress(p_plan_id uuid) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare p public.plans; c jsonb;
begin
 c:=public.spm_program_context(p_plan_id);
 select * into p from public.plans where id=p_plan_id and user_id=auth.uid();
 return jsonb_build_object('plan',to_jsonb(p),'context',c,'closures',coalesce((select jsonb_agg(to_jsonb(d) order by day_number) from public.spm_day_closures d where d.plan_id=p.id and d.user_id=auth.uid()),'[]'));
end $$;

-- Canonical scoring/safety inputs for an assigned plan are changed through the existing
-- server recovery flow; a browser must not rewrite the inputs trusted by the new closure.
create or replace function public.spm_guard_assigned_inputs() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if current_user in ('postgres','service_role','supabase_admin') then return case when tg_op='DELETE' then old else new end; end if;
 if exists(select 1 from public.plans p where p.user_id=auth.uid() and (p.assessment_id=old.id or p.performance_map_id=old.id)) then raise exception 'SPM_ASSIGNED_INPUTS_SERVER_MANAGED'; end if;
 return case when tg_op='DELETE' then old else new end;
end $$;
create trigger spm_assigned_assessment_guard before update or delete on public.assessments for each row execute function public.spm_guard_assigned_inputs();
create trigger spm_assigned_map_guard before update or delete on public.performance_maps for each row execute function public.spm_guard_assigned_inputs();

revoke all on function public.spm_program_context(uuid),public.spm_day_definition(uuid,integer),public.spm_save_activity(uuid,integer,text,jsonb,text,bigint,uuid),public.spm_close_program_day(uuid,integer,text,bigint,uuid,boolean),public.spm_get_program_progress(uuid) from public,anon;
grant execute on function public.spm_program_context(uuid),public.spm_day_definition(uuid,integer),public.spm_save_activity(uuid,integer,text,jsonb,text,bigint,uuid),public.spm_close_program_day(uuid,integer,text,bigint,uuid,boolean),public.spm_get_program_progress(uuid) to authenticated;
revoke all on function public.spm_json_integer(jsonb,numeric,numeric,boolean),public.spm_json_selection(jsonb,jsonb,integer,integer,text),public.spm_erection_record_valid(jsonb,jsonb,jsonb),public.spm_connection_record_valid(jsonb,jsonb,jsonb),public.spm_checkpoint_record_valid(jsonb,jsonb),public.spm_answer_valid(jsonb,jsonb),public.spm_good_lab_result(jsonb),public.spm_item_restricted(jsonb,jsonb),public.spm_record_satisfies(jsonb,jsonb,text),public.spm_guard_activity(),public.spm_guard_receipt(),public.spm_guard_day_closure(),public.spm_guard_plan_progress(),public.spm_advance_closed_day(),public.spm_guard_assigned_inputs() from public,anon;
grant execute on function public.spm_json_integer(jsonb,numeric,numeric,boolean),public.spm_json_selection(jsonb,jsonb,integer,integer,text),public.spm_erection_record_valid(jsonb,jsonb,jsonb),public.spm_connection_record_valid(jsonb,jsonb,jsonb),public.spm_checkpoint_record_valid(jsonb,jsonb),public.spm_answer_valid(jsonb,jsonb),public.spm_good_lab_result(jsonb),public.spm_item_restricted(jsonb,jsonb),public.spm_record_satisfies(jsonb,jsonb,text) to authenticated;
