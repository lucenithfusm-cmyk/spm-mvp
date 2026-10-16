// Browser-only synthetic Supabase substitute. Never connects to or alters real accounts.
(()=>{
 const config=window.SPM_QA_CONFIG||{primary:'erection',day:12};
 const user={id:'qa-user',email:'qa@example.test'};
 const initial={plans:[{id:'qa-plan',user_id:user.id,assessment_id:'qa-assessment',performance_map_id:'qa-map',status:'active',current_day:config.day,created_at:'2026-09-20T00:00:00Z'}],assessments:[{id:'qa-assessment',user_id:user.id,motives:[config.primary,'desire'],answers:{}}],performance_maps:[{id:'qa-map',user_id:user.id,primary_domain:config.primary,secondary_domain:'desire',domain_scores:{erection:40,ejaculation:80,desire:70,confidence:55,wellbeing:75,lifestyle:70},spm_score:65,safety_level:config.safety||'none',safety_flags:config.flags||[]}],activity_completions:[],daily_checkins:[],profiles:[]};
 const rows=JSON.parse(sessionStorage.getItem('spm-qa-rows')||'null')||initial;
 const qa=window.SPM_QA={rows,writes:[],failNext:false};
 const db={auth:{getSession:async()=>({data:{session:{user}}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>({error:null})},from(table){
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
    sessionStorage.setItem('spm-qa-rows',JSON.stringify(rows));
   }
   data=data.filter(r=>filters.every(f=>f(r)));
   return{data:single?data[0]||null:data,error:null};
  }).then(resolve,reject);return q;
 }};
 window.supabase={createClient:()=>db};
})();
