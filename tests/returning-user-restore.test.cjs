// Run with jsdom 26.1.0: NODE_PATH=/tmp/spm-qa-deps/node_modules node --test tests/returning-user-restore.test.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'..','premium-v2');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function harness(primary='erection',options={}){
 const html=read('live.html');
 const consoleErrors=[],observerRuns=new Map(),requests=[];
 const vc=new VirtualConsole();
 vc.on('jsdomError',error=>{if(error.type==='unhandled exception')consoleErrors.push(error.message)});
 vc.on('error',(...args)=>consoleErrors.push(args.map(String).join(' ')));
 const dom=new JSDOM(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window;
 w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
 w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLMediaElement.prototype.load=function(){};
 w.HTMLMediaElement.prototype.pause=function(){};
 w.HTMLMediaElement.prototype.play=async function(){};
 const NativeObserver=w.MutationObserver,observers=[];
 let source='',storm=null;
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
 const user={id:'qa-user',email:'qa@example.test'};
 const plan={id:'qa-plan',user_id:user.id,assessment_id:'qa-assessment',performance_map_id:'qa-map',status:'active',current_day:12,created_at:'2026-09-20T00:00:00Z'};
 const rows={plans:[plan],assessments:{id:plan.assessment_id,user_id:user.id,motives:[primary],answers:{}},performance_maps:{id:plan.performance_map_id,user_id:user.id,domain_scores:{erection:40,ejaculation:80,confidence:55},primary_domain:primary,spm_score:65,safety_level:'none',safety_flags:[]},activity_completions:[],daily_checkins:[],profiles:null};
 const db={auth:{getSession:async()=>({data:{session:{user}}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>({error:null})},from(table){
  const query={};for(const name of ['select','eq','order','maybeSingle','upsert','like'])query[name]=()=>query;
  query.then=(resolve,reject)=>{
   requests.push(table);
   if(options.hangTable===table)return new Promise(()=>{}).then(resolve,reject);
   return Promise.resolve({data:rows[table],error:null}).then(resolve,reject);
  };return query;
 }};
 w.supabase={createClient:()=>db};
 const layers=['engine.js','modules.js','app-live.js','daily-progression-v3.js','ejaculatory-control.js','ejaculatory-control-router.js','erectile-function-route.js'];
 for(const match of html.matchAll(/<script src="([^"?]+)[^"]*"/g)){
  if(/^https?:/.test(match[1]))continue;
  if(!process.env.SPM_QA_ALL_LAYERS&&!layers.includes(match[1]))continue;
  source=match[1];
  try{w.eval(read(source)+'\n//# sourceURL='+source)}catch(error){w.close();throw error;}
 }
 await delay(1800);
 return {w,requests,consoleErrors,observerRuns,storm,plan,close(){observers.forEach(x=>x.disconnect());w.close()}};
}

for(const primary of ['erection','ejaculation'])test(primary+' restores a saved map and keeps the event loop responsive',async()=>{
 const h=await harness(primary);
 try{
  assert.equal(h.storm,null,'Mutation observer loop: '+JSON.stringify([...h.observerRuns]));
  assert.deepEqual(h.consoleErrors,[]);
  assert.equal(h.w.document.querySelector('#map').classList.contains('on'),true);
  assert.equal(h.w.document.querySelector('#scoreValue').textContent,'65');
  const overlay=h.w.document.querySelector('#spmRestoreOverlay');
  assert.ok(!overlay||h.w.getComputedStyle(overlay).display==='none','Restore overlay must stop covering the map');
  assert.ok(h.requests.includes('activity_completions'),'Progress hydration must execute');
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
  assert.equal(h.w.document.querySelector('#map').classList.contains('on'),true);
  assert.equal(h.w.document.querySelector('#scoreValue').textContent,'65');
  assert.equal(h.w.document.querySelector('#spmRestoreOverlay'),null);
  assert.equal(h.w.SPM_CURRENT_DAY,12);
 }finally{h.close()}
});
