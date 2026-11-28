// Synthetic, read-only data for the isolated restoration review page. No real account.
(()=>{
 'use strict';
 const primary=parent.document.getElementById('route').value;
 const user={id:'qa-user',email:'qa@example.test'};
 const plan={id:'qa-plan',user_id:user.id,assessment_id:'qa-assessment',performance_map_id:'qa-map',status:'active',current_day:12,schedule_version:'legacy',revision:0,cycle_status:'open',created_at:'2026-09-20T00:00:00Z'};
 const rows={plans:[plan],assessments:{id:plan.assessment_id,user_id:user.id,motives:[primary],answers:{}},performance_maps:{id:plan.performance_map_id,user_id:user.id,assessment_id:plan.assessment_id,domain_scores:{erection:40,ejaculation:80,desire:70,confidence:55,wellbeing:75,lifestyle:70},primary_domain:primary,spm_score:65,safety_level:'none',safety_flags:[]},activity_completions:[],daily_checkins:[],profiles:null};
 // Explicit synthetic history: restoring day 12 must not invent new closures.
 const closures=Array.from({length:11},(_,index)=>({plan_id:plan.id,user_id:user.id,day_number:index+1,schedule_version:'legacy',reason:'legacy',revision_before:0,revision_after:0,next_day:index+2,cycle_status:'open'}));
 const safety=parent.document.getElementById('safety')?.value||'none';
 if(safety!=='none'){rows.performance_maps.safety_level=safety;rows.performance_maps.safety_flags=['qa-safety-flag'];}
 window.SPM_QA_ERRORS=[];
 window.addEventListener('error',e=>window.SPM_QA_ERRORS.push(e.message));
 window.addEventListener('unhandledrejection',e=>window.SPM_QA_ERRORS.push(String(e.reason)));
 const clone=value=>JSON.parse(JSON.stringify(value));
 function fillAssessment(){
  const questions=window.ENGINE?.assessment?.questions,policy=window.SPM_ASSESSMENT_POLICY,answers=rows.assessments.answers;
  if(!questions||Object.keys(answers).length)return;
  for(const q of policy?policy.queue(questions,rows.assessments.motives):questions){
   if(policy&&!policy.visible(q,answers))continue;
   answers[q.id]=q.type==='boolean'?false:q.type.startsWith('scale5')?3:q.type==='text'?'Dato de prueba':(q.options?.find(o=>['none','no','na','unsure'].includes(o.value))||q.options?.[0])?.value;
  }
  answers.pf_awareness='unsure';answers.pf_tension=1;
 }
 const db={auth:{getSession:async()=>({data:{session:{user}}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>({error:null})},async rpc(name,args){
  fillAssessment();
  if(args.p_plan_id!==plan.id)return {data:null,error:{message:'SPM_PLAN_ACCESS_DENIED'}};
  if(name==='spm_get_program_progress')return {data:clone({plan,closures}),error:null};
  // This review fixture intentionally cannot save activities or close a day.
  if(name==='spm_save_activity'||name==='spm_close_program_day')return {data:null,error:{message:'Read-only QA fixture'}};
  return {data:null,error:{message:'Unexpected synthetic RPC: '+name}};
 },from(table){
  fillAssessment();
  const query={},filters=[];
  for(const name of ['select','order','maybeSingle','single'])query[name]=()=>query;
  query.eq=(key,value)=>{filters.push(row=>row[key]===value);return query;};
  query.like=(key,value)=>{filters.push(row=>String(row[key]||'').startsWith(value.replace(/%$/,'')));return query;};
  query.upsert=()=>{if(table!=='profiles')throw new Error('Read-only QA fixture');return query};
  query.then=(resolve,reject)=>{const data=rows[table]??[];return Promise.resolve({data:clone(Array.isArray(data)?data.filter(row=>filters.every(matches=>matches(row))):data),error:null}).then(resolve,reject);};
  return query;
 }};
 window.supabase={createClient:()=>db};
})();
