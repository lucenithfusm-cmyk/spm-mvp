-- Integration assertions with synthetic data only. Every write is rolled back.
begin;
do $$
declare
 u uuid:=gen_random_uuid(); a uuid:=gen_random_uuid(); m uuid:=gen_random_uuid();
 test_order uuid:=gen_random_uuid(); prod_order uuid:=gen_random_uuid(); expired_order uuid:=gen_random_uuid();
 p uuid; tx jsonb; original jsonb:='{"s_penile":true}'::jsonb; result jsonb;
begin
 insert into auth.users(id,email,raw_user_meta_data) values(u,'spm-rollback-'||u::text||'@example.invalid','{}');
 insert into public.assessments(id,user_id,motives,answers) values(a,u,array['erection'],original);
 insert into public.performance_maps(id,user_id,assessment_id,primary_domain,spm_score,safety_level,safety_flags)
 values(m,u,a,'erection',50,'review','["s_penile"]');
 insert into public.spm_payment_orders(id,user_id,assessment_id,performance_map_id,environment,reference,profile_snapshot,expires_at)
 values(test_order,u,a,m,'test','SPM28-'||test_order::text,'{"primary":"erection","total":50,"scores":{"erection":50},"safety_level":"review","safety_flags":["s_penile"]}',now()+interval '1 hour');
 tx:=jsonb_build_object('id','test-'||test_order::text,'reference','SPM28-'||test_order::text,'amount_in_cents',14900000,'currency','COP','status','APPROVED');
 begin
  perform public.spm_confirm_wompi_transaction(test_order,'prod',tx);
  raise exception 'TEST FAILURE: environment mismatch accepted';
 exception when others then if sqlerrm like 'TEST FAILURE:%' then raise; end if; end;
 begin
  perform public.spm_confirm_wompi_transaction(test_order,'test',tx||'{"amount_in_cents":1}'::jsonb);
  raise exception 'TEST FAILURE: altered amount accepted';
 exception when others then if sqlerrm like 'TEST FAILURE:%' then raise; end if; end;
 perform public.spm_confirm_wompi_transaction(test_order,'test',tx);
 if exists(select 1 from public.plans where user_id=u) then raise exception 'TEST FAILURE: sandbox created a commercial plan'; end if;
 insert into public.spm_payment_orders(id,user_id,assessment_id,performance_map_id,environment,reference,profile_snapshot,expires_at)
 select prod_order,u,a,m,'prod','SPM28-'||prod_order::text,profile_snapshot,now()+interval '1 hour' from public.spm_payment_orders where id=test_order;
 tx:=tx||jsonb_build_object('id','prod-'||prod_order::text,'reference','SPM28-'||prod_order::text);
 result:=public.spm_confirm_wompi_transaction(prod_order,'prod',tx);p:=(result->>'planId')::uuid;
 if p is null or (select current_day from public.plans where id=p)<>1 then raise exception 'TEST FAILURE: approval did not create day 1'; end if;
 perform public.spm_confirm_wompi_transaction(prod_order,'prod',tx);
 if (select count(*) from public.plans where user_id=u)<>1 then raise exception 'TEST FAILURE: repeated approval duplicated a plan'; end if;
 perform public.spm_confirm_wompi_transaction(prod_order,'prod',tx||'{"status":"PENDING"}'::jsonb);
 if (select status from public.spm_payment_orders where id=prod_order)<>'APPROVED' then raise exception 'TEST FAILURE: late event undid approval'; end if;
 update public.plans set current_day=15 where id=p;
 perform public.spm_complete_missing_answers(u,p,original,original||'{"h_has_condition":false}',
 '{"total":50,"scores":{"erection":50},"safety_level":"review","safety_flags":["s_penile"]}');
 if (select current_day from public.plans where id=p)<>15 or (select route_key from public.plans where id=p)<>'erection' then raise exception 'TEST FAILURE: recovery changed the day or route'; end if;
 if (select safety_level from public.performance_maps where id=m)<>'review' then raise exception 'TEST FAILURE: recovery cleared a safety flag'; end if;
 begin
  perform public.spm_complete_missing_answers(u,p,original,original,'{"total":50,"scores":{},"safety_level":"none","safety_flags":[]}');
  raise exception 'TEST FAILURE: stale answers accepted';
 exception when others then if sqlerrm like 'TEST FAILURE:%' then raise; end if; end;
 begin
  perform public.spm_complete_missing_answers(u,p,original||'{"h_has_condition":false}',original||'{"h_has_condition":false}',
  '{"total":50,"scores":{},"safety_level":"none","safety_flags":[]}');
  raise exception 'TEST FAILURE: removal of a safety flag accepted';
 exception when others then if sqlerrm like 'TEST FAILURE:%' then raise; end if; end;
 perform public.spm_confirm_wompi_transaction(prod_order,'prod',tx||'{"status":"VOIDED"}'::jsonb);
 if (select status from public.spm_program_access where plan_id=p)<>'revoked' then raise exception 'TEST FAILURE: void did not revoke access'; end if;
 insert into public.spm_payment_orders(id,user_id,assessment_id,performance_map_id,environment,reference,profile_snapshot,expires_at,status)
 values(expired_order,u,a,m,'test','SPM28-'||expired_order::text,'{}',now()-interval '1 hour','EXPIRED');
 tx:=jsonb_build_object('id','expired-'||expired_order::text,'reference','SPM28-'||expired_order::text,'amount_in_cents',14900000,'currency','COP','status','PENDING');
 perform public.spm_confirm_wompi_transaction(expired_order,'test',tx);
 if (select status from public.spm_payment_orders where id=expired_order)<>'EXPIRED' then raise exception 'TEST FAILURE: late event resurrected expired checkout'; end if;
end $$;
rollback;
select '12 database assertions passed; all fixture writes rolled back' as result;
