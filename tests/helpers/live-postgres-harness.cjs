// Tests the shipped app-live adapter against actual local PostgreSQL functions.
// Transport/Auth events are deterministic test doubles, not hosted Supabase certification.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const {PGlite}=require('@electric-sql/pglite');
const agendaHarness=require('./agenda-harness.cjs');
const root=path.resolve(__dirname,'../..'),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(predicate){for(let i=0;i<200;i++){if(predicate())return;await wait(10)}throw Error('Timed out waiting for application state');}
const plain=x=>JSON.parse(JSON.stringify(x));
async function backend(){
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'spm-live-pg-')),db=new PGlite(directory),agenda=agendaHarness();
 await db.exec(fs.readFileSync(path.join(root,'tests/support/progress-schema.sql'),'utf8'));
 const migration=fs.readdirSync(path.join(root,'supabase/migrations')).find(x=>x.endsWith('_spm_versioned_agenda_atomic_progress.sql'));
 await db.exec(fs.readFileSync(path.join(root,'supabase/migrations',migration),'utf8'));
 let queue=Promise.resolve();
 const serialize=fn=>{const result=queue.then(fn);queue=result.catch(()=>{});return result;};
 async function act(user,fn){return serialize(async()=>{await db.exec('reset role;');await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role',$2,false)",[user||'',user?'authenticated':'']);if(user)await db.exec('set role authenticated;');return fn();});}
 async function createPlan(route='wellbeing',version='spm-20261127-v1'){
  const user=crypto.randomUUID(),assessment=crypto.randomUUID(),map=crypto.randomUUID(),plan=crypto.randomUUID();
  const catalog=require('../../supabase/functions/_shared/question-catalog.json');
  const answers=Object.fromEntries(catalog.map(q=>[q.id,q.type==='boolean'?false:q.type.startsWith('scale5')?3:q.type==='text'?'Dato sintético QA':(q.options?.find(o=>['none','no','na','unsure'].includes(o.value))||q.options?.[0])?.value]));
  answers.pf_awareness='unsure';answers.pf_tension=1;answers.h_followup='none';delete answers.h_medeffect;delete answers.h_mednames;delete answers.h_medchange;
  await act(null,async()=>{await db.query('insert into auth.users values($1)',[user]);await db.query('insert into public.assessments(id,user_id,motives,answers) values($1,$2,$3,$4)',[assessment,user,[route],JSON.stringify(answers)]);await db.query('insert into public.performance_maps(id,user_id,assessment_id,primary_domain,domain_scores,spm_score) values($1,$2,$3,$4,$5,65)',[map,user,assessment,route,JSON.stringify({[route]:65})]);await db.query('insert into public.plans(id,user_id,assessment_id,performance_map_id,route_key,schedule_version) values($1,$2,$3,$4,$5,$6)',[plan,user,assessment,map,route,version]);await db.query('insert into public.spm_program_access(plan_id,user_id) values($1,$2)',[plan,user]);});
  return {user,assessment,map,plan,route,version};
 }
 async function state(p){return act(p.user,async()=>(await db.query('select public.spm_get_program_progress($1) data',[p.plan])).rows[0].data);}
 async function app(initial){
  let sessionUser={id:initial.user,email:initial.user+'@qa.invalid'},authCallback;
  const requests=[],errors=[],hooks=new Map();
  const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(e.type==='unhandled exception')errors.push(e.message)});
  const html=fs.readFileSync(path.join(root,'premium-v2/live.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
  const dom=new JSDOM(html,{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),w=dom.window;
  w.TextEncoder=TextEncoder;w.structuredClone=structuredClone;Object.defineProperty(w,'crypto',{value:crypto.webcrypto});
  w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.HTMLElement.prototype.scrollIntoView=function(){};
  w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};
  w.SPM_DAILY_PRACTICE={assignments:c=>agenda.window.SPM_DAILY_PRACTICE.assignments(c),restricted:(c,id)=>agenda.window.SPM_DAILY_PRACTICE.restricted(c,id),closeDecision:(c,r,o)=>agenda.window.SPM_DAILY_PRACTICE.closeDecision(c,r,o),open(){}};
  async function deliver(name,request,action){requests.push({name,request:plain(request)});let result;try{result={data:await action(),error:null}}catch(error){result={data:null,error:{message:error.message,code:error.code}}}const hook=hooks.get(name);if(hook){hooks.delete(name);return hook(result,request)}return result;}
  const client={auth:{getSession:async()=>({data:{session:sessionUser?{user:sessionUser}:null}}),onAuthStateChange:fn=>{authCallback=fn;return {data:{subscription:{unsubscribe(){}}}}},signOut:async()=>{sessionUser=null;authCallback('SIGNED_OUT',null);return {error:null}}},
   rpc(name,args){const user=sessionUser?.id;const definitions={spm_get_program_progress:['p_plan_id'],spm_save_activity:['p_plan_id','p_day','p_activity_id','p_metadata','p_schedule_version','p_expected_record_revision','p_operation_id'],spm_close_program_day:['p_plan_id','p_day','p_schedule_version','p_expected_revision','p_operation_id','p_confirm_voluntary']};if(!definitions[name])throw Error('Unexpected RPC: '+name);const params=definitions[name].map(k=>typeof args[k]==='object'?JSON.stringify(args[k]):args[k]);return deliver(name,args,()=>act(user,async()=>(await db.query('select public.'+name+'('+params.map((_,i)=>'$'+(i+1)).join(',')+') data',params)).rows[0].data));},
   from(table){const user=sessionUser?.id,filters=[],params=[];let singleton=false,upsert=null,insert=null;
    if(!['plans','assessments','performance_maps','activity_completions','daily_checkins','weekly_reviews','profiles'].includes(table))throw Error('Unexpected table: '+table);
    const query={select(){return query},order(){return query},maybeSingle(){singleton=true;return query},single(){singleton=true;return query},eq(k,v){if(!/^[a-z_]+$/.test(k))throw Error('Invalid key');params.push(v);filters.push(k+'=$'+params.length);return query},like(k,v){params.push(v);filters.push(k+' like $'+params.length);return query},upsert(value){upsert=value;return query},insert(value){insert=value;return query},
     then(resolve,reject){return deliver('table:'+table,{filters,upsert,insert},()=>act(user,async()=>{
      if(table==='profiles')return null; // Background profile sync is outside this progress contract.
      if(upsert){if(!['activity_completions','weekly_reviews'].includes(table))throw Error('Unexpected write: '+table);const keys=Object.keys(upsert);for(const k of keys)if(!/^[a-z_]+$/.test(k))throw Error('Invalid key');const conflict=table==='weekly_reviews'?'(plan_id,week_number) do update set adherence_pct=excluded.adherence_pct,confidence_avg=excluded.confidence_avg,outcome_avg=excluded.outcome_avg,summary=excluded.summary,next_action=excluded.next_action':'(plan_id,day_number,module_key) do update set metadata=excluded.metadata,completed_at=excluded.completed_at';await db.query('insert into public.'+table+'('+keys.join(',')+') values('+keys.map((_,i)=>'$'+(i+1)).join(',')+') on conflict'+conflict,keys.map(k=>upsert[k]!==null&&typeof upsert[k]==='object'?JSON.stringify(upsert[k]):upsert[k]));return null;}
      if(insert){if(!['daily_checkins','activity_completions'].includes(table))throw Error('Unexpected write: '+table);const keys=Object.keys(insert);for(const k of keys)if(!/^[a-z_]+$/.test(k))throw Error('Invalid key');const rows=(await db.query('insert into public.'+table+'('+keys.join(',')+') values('+keys.map((_,i)=>'$'+(i+1)).join(',')+') returning *',keys.map(k=>insert[k]!==null&&typeof insert[k]==='object'?JSON.stringify(insert[k]):insert[k]))).rows;return singleton?rows[0]:rows;}
      const rows=(await db.query('select * from public.'+table+(filters.length?' where '+filters.join(' and '):''),params)).rows;return singleton?rows[0]||null:rows;
     })).then(resolve,reject);}
    };return query;
   }
  };
  w.supabase={createClient:()=>client};
  for(const file of ['engine.js','health-intake-v2.js','modules.js','app-live.js'])w.eval(fs.readFileSync(path.join(root,'premium-v2',file),'utf8')+'\n//# sourceURL='+file);
  await until(()=>w.SPM_RESOURCE_CONTEXT?.()?.planId===initial.plan);
  return {w,requests,errors,hook(name,fn){hooks.set(name,fn)},async switchTo(p){sessionUser=p?{id:p.user,email:p.user+'@qa.invalid'}:null;authCallback(p?'SIGNED_IN':'SIGNED_OUT',p?{user:sessionUser}:null);if(p)await until(()=>w.SPM_RESOURCE_CONTEXT?.()?.planId===p.plan);else await until(()=>w.SPM_RESOURCE_CONTEXT?.()===null)},close(){w.close()}};
 }
 return {db,createPlan,state,app,act,agenda,async close(){await queue;await db.close();fs.rmSync(directory,{recursive:true,force:true})}};
}
module.exports={backend,until,plain};
