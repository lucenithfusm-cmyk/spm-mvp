// Run with jsdom 26.1.0: NODE_PATH=/tmp/spm-qa-deps/node_modules node --test tests/returning-user-restore.test.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'..');
const liveUrl='https://spm.test/premium-v2/live.html';
// Resolve script URLs as the browser does, including /premium-v2/... entries.
const read=name=>fs.readFileSync(path.resolve(root,'.'+new URL(name,liveUrl).pathname),'utf8');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function harness(primary='erection',options={}){
 const html=read('live.html');
 const consoleErrors=[],observerRuns=new Map(),requests=[];
 const vc=new VirtualConsole();
 vc.on('jsdomError',error=>{if(error.type==='unhandled exception')consoleErrors.push(error.message)});
 vc.on('error',(...args)=>consoleErrors.push(args.map(String).join(' ')));
 const dom=new JSDOM(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:'https://spm.test/premium-v2/live.html'+(options.welcome?'?welcome=1':''),runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window;
 w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
 w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLMediaElement.prototype.load=function(){};
 w.HTMLMediaElement.prototype.pause=function(){};
 w.HTMLMediaElement.prototype.play=async function(){};
 const NativeObserver=w.MutationObserver,observers=[];
 let source='',storm=null,currentScript=null;
 Object.defineProperty(w.document,'currentScript',{configurable:true,get:()=>currentScript});
 w.MutationObserver=class extends NativeObserver{
  constructor(callback){
   const owner=source;
   super((records,observer)=>{
    const count=(observerRuns.get(owner)||0)+1;observerRuns.set(owner,count);
    if(count>40){storm=owner;observers.forEach(x=>x.disconnect());return}
    callback(records,observer);
   });observers.push(this);
  }
 };
 w.TextEncoder=TextEncoder;Object.defineProperty(w,'crypto',{value:require('node:crypto').webcrypto});
 const user={id:'qa-user',email:'qa@example.test'};
 const plan={id:'qa-plan',user_id:user.id,assessment_id:'qa-assessment',performance_map_id:'qa-map',status:'active',current_day:12,revision:11,schedule_version:'legacy',cycle_status:'open',created_at:'2026-09-20T00:00:00Z'};
 const policy=require('../supabase/functions/_shared/assessment-policy.js'),catalog=require('../supabase/functions/_shared/question-catalog.json'),answers={};
 for(const q of policy.queue(catalog,[primary]))if(policy.visible(q,answers))answers[q.id]=q.type==='boolean'?false:q.type.startsWith('scale5')?3:q.type==='text'?'No recuerdo':q.options[0].value;
 const rows={plans:[plan],assessments:{id:plan.assessment_id,user_id:user.id,motives:[primary],answers},performance_maps:{id:plan.performance_map_id,user_id:user.id,domain_scores:{erection:40,ejaculation:80,confidence:55},primary_domain:primary,spm_score:65,safety_level:'none',safety_flags:[]},activity_completions:[],daily_checkins:[],profiles:null};
 const closures=Array.from({length:11},(_,i)=>({day_number:i+1,reason:'legacy'}));
 // This suite checks DOM restoration with a transport double. Real SQL/RLS is
 // exercised in atomic-progress-database and live-progress-postgres.
 const db={auth:{getSession:async()=>({data:{session:{user}}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>({error:null})},async rpc(name,args){requests.push(name);if(name==='spm_get_program_progress')return {data:structuredClone({plan,closures}),error:null};if(name==='spm_save_activity'){const metadata={...args.p_metadata,_recordRevision:1};rows.activity_completions.push({user_id:user.id,plan_id:plan.id,day_number:args.p_day,module_key:'resource:daily_activity:'+args.p_activity_id,metadata,record_revision:1});return {data:{ok:true,metadata,recordRevision:1},error:null};}if(name==='spm_close_program_day'){const closure={day_number:args.p_day};closures.push(closure);plan.current_day=Math.min(args.p_day+1,28);plan.revision++;return {data:structuredClone({ok:true,plan,closure}),error:null};}throw Error('Unexpected RPC: '+name);},from(table){
  const query={},filters=[];let upsert=null;
  for(const name of ['select','order','maybeSingle','update','insert'])query[name]=()=>query;
  query.eq=(key,value)=>{filters.push(row=>row[key]===value);return query;};
  query.like=(key,value)=>{filters.push(row=>String(row[key]||'').startsWith(value.replace(/%$/,'')));return query;};
  query.upsert=payload=>{upsert=payload;return query;};
  query.then=(resolve,reject)=>{
   requests.push(table);
   if(options.hangTable===table)return new Promise(()=>{}).then(resolve,reject);
   let data=rows[table];
   if(table==='activity_completions'){
    if(upsert){
     const index=data.findIndex(row=>row.plan_id===upsert.plan_id&&row.day_number===upsert.day_number&&row.module_key===upsert.module_key);
     if(index<0)data.push({...upsert});else data[index]={...upsert};
    }
    data=data.filter(row=>filters.every(matches=>matches(row)));
   }
   return Promise.resolve({data:structuredClone(data),error:null}).then(resolve,reject);
  };return query;
 }};
 w.supabase={createClient:()=>db};
 const layers=['program-entry-v1.js','engine.js','modules.js','app-live.js','daily-progression-v3.js','ejaculatory-control.js','ejaculatory-control-router.js','erectile-function-route.js'];
 for(const match of html.matchAll(/<script src="([^"?]+)[^"]*"/g)){
  if(/^https?:/.test(match[1]))continue;
  if(!process.env.SPM_QA_ALL_LAYERS&&!layers.includes(match[1]))continue;
  source=match[1];
  currentScript=w.document.createElement('script');currentScript.src=new URL(source,liveUrl).href;
  try{vm.runInContext(read(source),dom.getInternalVMContext(),{filename:source});}catch(error){w.close();throw error;}finally{currentScript=null;}
 }
 await delay(1800);
 return {w,requests,consoleErrors,observerRuns,storm,plan,close(){observers.forEach(x=>x.disconnect());w.close()}};
}

for(const primary of ['erection','ejaculation'])test(primary+' restores a saved map and keeps the event loop responsive',async()=>{
 const h=await harness(primary);
 try{
  assert.equal(h.storm,null,'Mutation observer loop: '+JSON.stringify([...h.observerRuns]));
  assert.deepEqual(h.consoleErrors,[]);
  assert.equal(h.w.document.querySelector('#plan').classList.contains('on'),true);
  assert.equal(h.w.document.querySelector('#scoreValue').textContent,'65');
  const overlay=h.w.document.querySelector('#spmRestoreOverlay');
  assert.ok(!overlay||h.w.getComputedStyle(overlay).display==='none','Restore overlay must stop covering the map');
  assert.ok(h.requests.includes('spm_get_program_progress'),'Canonical progress hydration must execute');
  h.w.document.querySelector('#goPlan').click();await delay(700);
  assert.equal(h.w.document.querySelector('#plan').classList.contains('on'),true);
  assert.equal(h.w.SPM_CURRENT_DAY,12,'Saved day must not regress after opening the plan');
  assert.equal(h.w.document.querySelectorAll(primary==='erection'?'.ecLaunch':'.deLaunch').length,0,'No buttons from the other route');
  assert.ok(h.w.document.querySelector(primary==='erection'?'.deLaunch':'.ecLaunch'),'Correct route has activities');
 }finally{h.close()}
});

test('a stalled profile sync does not block a restored program',async()=>{
 const h=await harness('erection',{hangTable:'profiles'});
 try{
  assert.equal(h.storm,null);
  assert.equal(h.w.document.querySelector('#plan').classList.contains('on'),true);
  assert.equal(h.w.document.querySelector('#scoreValue').textContent,'65');
  assert.equal(h.w.document.querySelector('#spmRestoreOverlay'),null);
  assert.equal(h.w.SPM_CURRENT_DAY,12);
 }finally{h.close()}
});

test('a restored program keeps Library records separate and advances only through explicit daily closure',async()=>{
 const h=await harness('desire');
 try{
  assert.equal(h.w.SPM_RESOURCE_CONTEXT().day,12);
  await h.w.SPM_SAVE_MODULE({day:12,moduleKey:'qa-daily-practice'});
  if(h.w.SPM_DAILY_PRACTICE){
   assert.equal(h.w.SPM_RESOURCE_CONTEXT().day,12,'A library save must not complete the day');
   const context=h.w.SPM_RESOURCE_CONTEXT(),scope=context.userId+':'+context.planId;
   await assert.rejects(h.w.SPM_COMPLETE_DAILY_PRACTICE(12,scope),/falta guardar|registro de la práctica/i);
   const required=h.w.SPM_DAILY_PRACTICE.assignments(context).filter(activity=>!activity.optional);
   assert.ok(required.length>0);
   for(const activity of required)await h.w.SPM_DAILY_PRACTICE.saveActivity(activity.id,require('./helpers/valid-daily-record.cjs').validDailyRecord(activity,12));
   assert.equal(h.w.SPM_RESOURCE_CONTEXT().day,12,'Saving assigned activities waits for explicit day completion');
   await h.w.SPM_COMPLETE_DAILY_PRACTICE(12,scope);
  }
  const expected=h.w.SPM_DAILY_PRACTICE?13:12;
  assert.equal(h.w.SPM_RESOURCE_CONTEXT().day,expected);
  assert.equal(h.w.SPM_CURRENT_DAY,expected);
  assert.ok(h.w.document.querySelector('#spmTodayHero').textContent.includes('DÍA '+expected+' DE 28'));
  assert.deepEqual(h.consoleErrors,[]);
 }finally{h.close()}
});

test('first paid welcome remains available while later visits open the saved daily route',async()=>{const h=await harness('erection',{welcome:true});try{assert.equal(h.w.document.querySelector('#map').classList.contains('on'),true);assert.equal(h.w.localStorage.getItem('spm_program_return_v1'),'1');assert.equal(h.w.SPM_CURRENT_DAY,12)}finally{h.close()}});
