begin;
do $$
declare u uuid:=gen_random_uuid(); a uuid:=gen_random_uuid(); m uuid:=gen_random_uuid(); p uuid:=gen_random_uuid(); answers jsonb:='{"s_penile":true,"s_cardiac":true}';
begin
 insert into auth.users(id,email,raw_user_meta_data) values(u,'spm-rollback-'||u::text||'@example.invalid','{}');
 insert into public.assessments(id,user_id,motives,answers) values(a,u,array['erection'],answers);
 insert into public.performance_maps(id,user_id,assessment_id,primary_domain,spm_score,safety_level,safety_flags) values(m,u,a,'erection',50,'urgent','["s_penile","s_cardiac"]');
 insert into public.plans(id,user_id,assessment_id,performance_map_id,route_key,current_day) values(p,u,a,m,'erection',15);
 begin
 perform public.spm_correct_safety_mistake(gen_random_uuid(),p,'s_penile',answers);
 raise exception 'TEST FAILURE: wrong owner';
 exception when others then if sqlerrm like 'TEST FAILURE:%' then raise; end if; end;
 begin
 perform public.spm_correct_safety_mistake(u,p,'unknown',answers);
 raise exception 'TEST FAILURE: unknown question';
 exception when others then if sqlerrm like 'TEST FAILURE:%' then raise; end if; end;
 perform public.spm_correct_safety_mistake(u,p,'s_penile',answers);
 if (select safety_level from public.performance_maps where id=m)<>'urgent' then raise exception 'TEST FAILURE: other urgent flag removed'; end if;
 if (select assessments.answers->'s_penile' from public.assessments where id=a)<>'false' then raise exception 'TEST FAILURE: answer not saved'; end if;
 begin
 perform public.spm_correct_safety_mistake(u,p,'s_cardiac',answers);
 raise exception 'TEST FAILURE: stale answers accepted';
 exception when others then if sqlerrm like 'TEST FAILURE:%' then raise; end if; end;
 answers:=jsonb_set(answers,'{s_penile}','false');
 perform public.spm_correct_safety_mistake(u,p,'s_cardiac',answers);
 if (select safety_level from public.performance_maps where id=m)<>'none' then raise exception 'TEST FAILURE: persisted pause'; end if;
 if (select current_day from public.plans where id=p)<>15 then raise exception 'TEST FAILURE: day changed'; end if;
 if (select count(*) from public.spm_safety_answer_corrections where user_id=u)<>2 then raise exception 'TEST FAILURE: audit missing'; end if;
 if has_function_privilege('authenticated','public.spm_correct_safety_mistake(uuid,uuid,text,jsonb)','execute') then raise exception 'TEST FAILURE: client can call privileged function'; end if;
end $$;
rollback;
select '9 assertions passed; all synthetic data rolled back' result;
