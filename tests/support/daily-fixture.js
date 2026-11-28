// Browser-only synthetic Supabase substitute. Never connects to or alters real accounts.
// This transport double follows the RPC response/revision contract. SQL/RLS and
// independent server validation are covered by live-progress-postgres tests.
(()=>{
 const config=window.SPM_QA_CONFIG||{primary:'erection',day:12};
 const user={id:'qa-user',email:'qa@example.test'};
 const clone=value=>JSON.parse(JSON.stringify(value));
 const stable=value=>JSON.stringify(value,(_,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
 const initial={plans:[{id:'qa-plan',user_id:user.id,assessment_id:'qa-assessment',performance_map_id:'qa-map',status:'active',current_day:config.day,schedule_version:'legacy',revision:0,cycle_status:'open',created_at:'2026-09-20T00:00:00Z'}],assessments:[{id:'qa-assessment',user_id:user.id,motives:[config.primary,'desire'],answers:{}}],performance_maps:[{id:'qa-map',user_id:user.id,assessment_id:'qa-assessment',primary_domain:config.primary,secondary_domain:'desire',domain_scores:{erection:40,ejaculation:80,desire:70,confidence:55,wellbeing:75,lifestyle:70},spm_score:65,safety_level:config.safety||'none',safety_flags:config.flags||[]}],activity_completions:[],daily_checkins:[],profiles:[],spm_day_closures:[],spm_activity_receipts:[]};
 // Declare the synthetic history explicitly so the selected day can close
 // without gaps. This is fixture setup, never reconciliation of a real plan.
 for(let day=1;day<config.day;day++){
  const operation='00000000-0000-4000-8000-'+String(day).padStart(12,'0');
  initial.spm_day_closures.push({plan_id:'qa-plan',user_id:user.id,day_number:day,schedule_version:'legacy',operation_id:operation,request:{},reason:'legacy',realized_count:0,revision_before:0,revision_after:0,next_day:day+1,cycle_status:'open',closed_at:'2026-09-20T00:00:00Z'});
  initial.activity_completions.push({id:'qa-history-'+day,plan_id:'qa-plan',user_id:user.id,day_number:day,module_key:'daily_practice',metadata:{source:'synthetic-history',dayStatus:'closed',scheduleVersion:'legacy'},completed_at:'2026-09-20T00:00:00Z'});
 }
 const rows=JSON.parse(sessionStorage.getItem('spm-qa-rows')||'null')||initial;
 rows.spm_day_closures??=[];rows.spm_activity_receipts??=[];
 for(const plan of rows.plans){plan.schedule_version??='legacy';plan.revision??=0;plan.cycle_status??='open';}
 const qa=window.SPM_QA={rows,writes:[],rpcCalls:[],failNext:false};
 const persist=()=>sessionStorage.setItem('spm-qa-rows',JSON.stringify(rows));
 const result=data=>({data:clone(data),error:null});
 const failure=message=>({data:null,error:{message}});
 function fillAssessment(){
  // Only default empty fixture assessments are filled. Existing responses and
  // map safety flags are preserved, including explicit review/urgent cases.
  const questions=window.ENGINE?.assessment?.questions,policy=window.SPM_ASSESSMENT_POLICY;
  if(!questions)return;
  for(const assessment of rows.assessments){
   if(Object.keys(assessment.answers||{}).length)continue;
   const answers=assessment.answers={};
   for(const q of policy?policy.queue(questions,assessment.motives):questions){
    if(policy&&!policy.visible(q,answers))continue;
    answers[q.id]=q.type==='boolean'?false:q.type.startsWith('scale5')?3:q.type==='text'?'Dato de prueba':(q.options?.find(o=>['none','no','na','unsure'].includes(o.value))||q.options?.[0])?.value;
   }
   answers.pf_awareness='unsure';answers.pf_tension=1;
  }
 }
 function contextFor(plan){
  const assessment=rows.assessments.find(row=>row.id===plan.assessment_id),map=rows.performance_maps.find(row=>row.id===plan.performance_map_id);
  if(!assessment||!map)throw Error('SPM_CONTEXT_UNAVAILABLE');
  return {userId:user.id,planId:plan.id,day:plan.current_day,scheduleVersion:plan.schedule_version,planRevision:plan.revision,cycleStatus:plan.cycle_status,planStatus:plan.status,primary:map.primary_domain,secondary:map.secondary_domain,motives:assessment.motives,answers:assessment.answers,safety:map.safety_level,flags:map.safety_flags,completed:rows.spm_day_closures.filter(row=>row.plan_id===plan.id).map(row=>row.day_number),checkins:rows.daily_checkins.filter(row=>row.plan_id===plan.id)};
 }
 const db={auth:{getSession:async()=>({data:{session:{user}}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>({error:null})},async rpc(name,args){
  qa.rpcCalls.push({name,args:clone(args)});fillAssessment();
  try{
   const plan=rows.plans.find(row=>row.id===args.p_plan_id&&row.user_id===user.id);
   if(!plan)throw Error('SPM_PLAN_ACCESS_DENIED');
   if(name==='spm_get_program_progress')return result({plan,context:contextFor(plan),closures:rows.spm_day_closures.filter(row=>row.plan_id===plan.id&&row.user_id===user.id).sort((a,b)=>a.day_number-b.day_number)});
   if(!['spm_save_activity','spm_close_program_day'].includes(name))throw Error('Unexpected synthetic RPC: '+name);
   if(qa.failNext){qa.failNext=false;return failure('Synthetic save failure');}
   if(!args.p_operation_id)throw Error('SPM_AUTH_REQUIRED');
   const day=Number(args.p_day),c=contextFor(plan),api=window.SPM_DAILY_PRACTICE;
   if(name==='spm_save_activity'){
    if(!args.p_metadata||typeof args.p_metadata!=='object'||Array.isArray(args.p_metadata))throw Error('SPM_INVALID_ACTIVITY_RECORD');
    const meta={...args.p_metadata,scheduleVersion:args.p_schedule_version,completed:args.p_metadata.activityStatus==='completed'};delete meta.operationId;delete meta._recordRevision;
    const request={plan:plan.id,day,activity:args.p_activity_id,metadata:meta,version:args.p_schedule_version,revision:args.p_expected_record_revision};
    const receipt=rows.spm_activity_receipts.find(row=>row.user_id===user.id&&row.operation_id===args.p_operation_id);
    if(receipt){if(stable(receipt.request)!==stable(request))throw Error('SPM_OPERATION_CONFLICT');return result(receipt.result);}
    if(plan.current_day!==day||plan.schedule_version!==args.p_schedule_version)throw Error('SPM_CONTEXT_CONFLICT');
    if(plan.status!=='active'||plan.cycle_status==='completed'||c.completed.includes(day))throw Error('SPM_CONTEXT_CONFLICT');
    const activity=api?.assignments(c).find(item=>item.id===args.p_activity_id);
    if(!activity)throw Error('SPM_ACTIVITY_UNAVAILABLE');
    if(api.restricted(c,activity))throw Error('SPM_SAFETY_PAUSE');
    if(!['completed','omitted','interrupted'].includes(meta.activityStatus))throw Error('SPM_INVALID_ACTIVITY_RECORD');
    if(meta.activityStatus==='omitted'&&!activity.optional&&!(activity.kind==='erection'&&activity.erectionLesson===1&&meta.attentionPracticeCompleted===false&&meta.completionAccepted===true))throw Error('SPM_REQUIRED_ACTIVITY_PENDING');
    if((meta.activityStatus==='completed'||meta.activityStatus==='omitted'&&!activity.optional)&&!api.recordSatisfies(activity,{[activity.id]:meta},c))throw Error('SPM_INVALID_ACTIVITY_RECORD');
    const moduleKey='resource:daily_activity:'+args.p_activity_id,index=rows.activity_completions.findIndex(row=>row.plan_id===plan.id&&row.day_number===day&&row.module_key===moduleKey),previous=rows.activity_completions[index];
    if((previous?.record_revision||0)!==args.p_expected_record_revision)throw Error('SPM_RECORD_REVISION_CONFLICT');
    const revision=args.p_expected_record_revision+1,metadata={...meta,operationId:args.p_operation_id,_recordRevision:revision};
    const row={...previous,id:previous?.id||'qa-activity-'+rows.activity_completions.length,user_id:user.id,plan_id:plan.id,day_number:day,module_key:moduleKey,metadata,record_revision:revision,completed_at:new Date().toISOString()};
    if(index<0)rows.activity_completions.push(row);else rows.activity_completions[index]=row;
    const saved={ok:true,metadata,recordRevision:revision};
    rows.spm_activity_receipts.push({user_id:user.id,plan_id:plan.id,operation_id:args.p_operation_id,day_number:day,activity_id:args.p_activity_id,request:clone(request),result:clone(saved)});
    qa.writes.push({table:'activity_completions',op:'rpc',rpc:name,payload:clone(row)});persist();return result(saved);
   }
   const request={plan:plan.id,day,version:args.p_schedule_version,revision:args.p_expected_revision,confirmVoluntary:args.p_confirm_voluntary===true};
   const replay=rows.spm_day_closures.find(row=>row.user_id===user.id&&row.operation_id===args.p_operation_id);
   if(replay){if(stable(replay.request)!==stable(request))throw Error('SPM_OPERATION_CONFLICT');return result({ok:true,closure:replay,plan});}
   const previous=rows.spm_day_closures.find(row=>row.plan_id===plan.id&&row.day_number===day);
   if(previous)return result({ok:true,alreadyClosed:true,closure:previous,plan});
   if(plan.status!=='active'||plan.cycle_status==='completed'||plan.current_day!==day||plan.schedule_version!==args.p_schedule_version||plan.revision!==args.p_expected_revision)throw Error('SPM_PLAN_REVISION_CONFLICT');
   const firstOpen=Array.from({length:28},(_,index)=>index+1).find(value=>!c.completed.includes(value));
   if(firstOpen!==day)throw Error('SPM_PROGRESS_RECONCILIATION_REQUIRED');
   const saved=Object.fromEntries(rows.activity_completions.filter(row=>row.plan_id===plan.id&&row.day_number===day&&row.module_key.startsWith('resource:daily_activity:')).map(row=>[row.module_key.slice('resource:daily_activity:'.length),row.metadata]));
   const decision=api?.closeDecision(c,saved,{recordsLoaded:true});
   if(!decision?.allowed)throw Error(({ 'assessment-pending':'SPM_ASSESSMENT_PENDING','safety-pause':'SPM_SAFETY_PAUSE','practice-restricted':'SPM_SAFETY_PAUSE' })[decision?.code]||'SPM_REQUIRED_ACTIVITY_PENDING');
   if(decision.voluntary&&!request.confirmVoluntary)throw Error('SPM_VOLUNTARY_CONFIRMATION_REQUIRED');
   const next=Array.from({length:28},(_,index)=>index+1).find(value=>value!==day&&!c.completed.includes(value));
   const realized=api.assignments(c).filter(activity=>saved[activity.id]?.completed===true&&api.recordSatisfies(activity,saved,c)).length;
   const closure={plan_id:plan.id,user_id:user.id,day_number:day,schedule_version:plan.schedule_version,operation_id:args.p_operation_id,request,reason:decision.voluntary?'voluntary':'requirements_met',realized_count:realized,revision_before:plan.revision,revision_after:plan.revision+1,next_day:next||28,cycle_status:next?'open':'completed',closed_at:new Date().toISOString()};
   rows.spm_day_closures.push(closure);
   rows.activity_completions.push({id:'qa-close-'+day,user_id:user.id,plan_id:plan.id,day_number:day,module_key:'daily_practice',metadata:{source:'atomic-day-close-v1',operationId:args.p_operation_id,dayStatus:'closed',reason:closure.reason,realizedCount:realized,scheduleVersion:plan.schedule_version},completed_at:closure.closed_at});
   const advanced={...plan,current_day:closure.next_day,revision:closure.revision_after,cycle_status:closure.cycle_status,status:next?plan.status:'completed'};rows.plans[rows.plans.indexOf(plan)]=advanced;
   qa.writes.push({table:'spm_day_closures',op:'rpc',rpc:name,payload:clone(closure)});persist();return result({ok:true,closure,plan:advanced});
  }catch(error){return failure(error.message);}
 },from(table){
  fillAssessment();
  let filters=[],op='read',payload=null,single=false;
  const q={select:()=>q,order:()=>q,eq:(k,v)=>{filters.push(r=>r[k]===v);return q;},like:(k,v)=>{filters.push(r=>String(r[k]||'').startsWith(v.replace(/%$/,'')));return q;},maybeSingle:()=>{single=true;return q;},single:()=>{single=true;return q;}};
  for(const method of ['upsert','insert','update'])q[method]=p=>{op=method;payload=p;return q;};
  q.then=(resolve,reject)=>Promise.resolve().then(()=>{
   let data=rows[table]||[];
   if(op!=='read'){
    if(qa.failNext){qa.failNext=false;return{data:null,error:{message:'Synthetic save failure'}};}
    qa.writes.push({table,op,payload});
    if(op==='update')data.filter(r=>filters.every(f=>f(r))).forEach(r=>Object.assign(r,payload));
    else if(table!=='profiles'){
     const i=op==='upsert'?data.findIndex(r=>r.plan_id===payload.plan_id&&r.day_number===payload.day_number&&r.module_key===payload.module_key):-1;
     if(i<0)data.push({...payload});else data[i]={...data[i],...payload};rows[table]=data;
    }
    persist();
   }
   data=data.filter(r=>filters.every(f=>f(r)));
   return result(single?data[0]||null:data);
  }).then(resolve,reject);return q;
 }};
 window.supabase={createClient:()=>db};
})();
