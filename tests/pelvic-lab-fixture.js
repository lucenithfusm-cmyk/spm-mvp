// Isolated synthetic adapter. The QA page replaces Supabase before any app code runs.
(()=>{'use strict';
const primary=parent.document.getElementById('route').value,user={id:'qa-'+primary,email:'qa@example.test'};
const plan={id:'qa-plan-'+primary,user_id:user.id,assessment_id:'qa-assessment',performance_map_id:'qa-map',status:'active',current_day:12,created_at:'2026-09-20T00:00:00Z'};
const cloud=parent.SPM_QA_DATABASE[primary]||(parent.SPM_QA_DATABASE[primary]={activity_completions:[]});
const rows={plans:[plan],assessments:{id:plan.assessment_id,user_id:user.id,motives:[primary],answers:{}},performance_maps:{id:plan.performance_map_id,user_id:user.id,domain_scores:{erection:40,ejaculation:80,desire:70,confidence:55,wellbeing:75,lifestyle:70},primary_domain:primary,spm_score:65,safety_level:parent.document.getElementById('safety').value,safety_flags:[]},activity_completions:cloud.activity_completions,daily_checkins:[],profiles:null};
if(rows.performance_maps.safety_level!=='none')rows.performance_maps.safety_flags=['qa-safety-flag'];
window.SPM_QA_ERRORS=[];window.addEventListener('error',e=>window.SPM_QA_ERRORS.push(e.message));window.addEventListener('unhandledrejection',e=>window.SPM_QA_ERRORS.push(String(e.reason)));
const db={auth:{getSession:async()=>({data:{session:{user}}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>({error:null})},from(table){
 const filters=[],query={};let write=null,sort=null;
 query.select=()=>query;query.eq=(k,v)=>{filters.push(r=>r[k]===v);return query};query.like=(k,v)=>{filters.push(r=>String(r[k]||'').startsWith(v.replace(/%$/,'')));return query};query.order=(k,o)=>{sort={k,asc:o?.ascending};return query};query.maybeSingle=()=>query;
 query.upsert=value=>{if(table==='profiles')return query;if(table!=='activity_completions'||value.user_id!==user.id||value.plan_id!==plan.id||value.module_key!=='resource:pelvic_lab_state')throw Error('QA blocks unrelated writes');write=value;return query};
 query.then=(resolve,reject)=>Promise.resolve().then(()=>{
  if(write){if(parent.document.getElementById('offline').checked)return {data:null,error:{message:'Synthetic offline'}};const found=rows[table].find(r=>r.plan_id===write.plan_id&&r.day_number===write.day_number&&r.module_key===write.module_key);if(found)Object.assign(found,structuredClone(write));else rows[table].push(structuredClone(write));}
  let data=rows[table]??[];if(Array.isArray(data)){data=data.filter(r=>filters.every(f=>f(r)));if(sort)data.sort((a,b)=>String(a[sort.k]).localeCompare(String(b[sort.k]))*(sort.asc?1:-1));}
  return {data,error:null};
 }).then(resolve,reject);return query;
}};window.supabase={createClient:()=>db};
})();
