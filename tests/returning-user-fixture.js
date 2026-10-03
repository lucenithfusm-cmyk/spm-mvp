// Synthetic, read-only data for the isolated restoration review page. No real account.
(()=>{
 'use strict';
 const primary=parent.document.getElementById('route').value;
 const user={id:'qa-user',email:'qa@example.test'};
 const plan={id:'qa-plan',user_id:user.id,assessment_id:'qa-assessment',performance_map_id:'qa-map',status:'active',current_day:12,created_at:'2026-09-20T00:00:00Z'};
 const rows={plans:[plan],assessments:{id:plan.assessment_id,user_id:user.id,motives:[primary],answers:{}},performance_maps:{id:plan.performance_map_id,user_id:user.id,domain_scores:{erection:40,ejaculation:80,desire:70,confidence:55,wellbeing:75,lifestyle:70},primary_domain:primary,spm_score:65,safety_level:'none',safety_flags:[]},activity_completions:[],daily_checkins:[],profiles:null};
 const safety=parent.document.getElementById('safety')?.value||'none';
 if(safety!=='none'){rows.performance_maps.safety_level=safety;rows.performance_maps.safety_flags=['qa-safety-flag'];}
 window.SPM_QA_ERRORS=[];
 window.addEventListener('error',e=>window.SPM_QA_ERRORS.push(e.message));
 window.addEventListener('unhandledrejection',e=>window.SPM_QA_ERRORS.push(String(e.reason)));
 const db={auth:{getSession:async()=>({data:{session:{user}}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>({error:null})},from(table){
  const query={};
  for(const name of ['select','eq','order','maybeSingle','like'])query[name]=()=>query;
  query.upsert=()=>{if(table!=='profiles')throw new Error('Read-only QA fixture');return query};
  query.then=(resolve,reject)=>Promise.resolve({data:rows[table]??[],error:null}).then(resolve,reject);
  return query;
 }};
 window.supabase={createClient:()=>db};
})();
