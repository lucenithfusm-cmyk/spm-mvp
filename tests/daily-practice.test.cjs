const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../labs/breathing/node_modules/jsdom');
const read=f=>fs.readFileSync(path.join(__dirname,'../premium-v2',f),'utf8');
const wait=()=>new Promise(r=>setTimeout(r,40));
function harness(primary='erection',day=12){
 const dom=new JSDOM('<section id="plan"><div id="dayGrid"></div><section id="original-library">Library</section></section>',{url:'https://spm.test',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLMediaElement.prototype.pause=function(){};
 const observers=[],NativeObserver=w.MutationObserver;
 w.MutationObserver=class extends NativeObserver{constructor(fn){super(fn);observers.push(this);}};
 const c={userId:'qa',planId:'plan',primary,day,secondary:'desire',motives:[primary,'desire'],safety:'none',flags:[],checkins:[],completed:[]},writes=[],opens=[];
 w.SPM_RESOURCE_CONTEXT=()=>c;w.SPM_DAILY_RECORDS={read:async()=>({}),save:async(...args)=>writes.push(args)};
 w.SPM_ERECTILE_FUNCTION={open:(...args)=>opens.push(['erection',...args])};
 w.SPM_EJACULATORY_CONTROL={schedule:w.eval('('+read('ejaculatory-control.js').match(/const SCHEDULE=(\{[^;]+\});/)[1]+')'),open:(...args)=>opens.push(['ejaculation',...args])};
 for(const lab of ['DESIRE','SENSATE','BREATHING'])w['SPM_'+lab+'_LAB']={open:async o=>opens.push([lab,o])};
 w.SPM_RESOURCES={restricted:c=>c.safety!=='none',open:(...args)=>opens.push(['resource',...args])};
 for(const f of ['engine.js','modules.js','wellness-daily-tip-v1.js','daily-support-plan-v1.js','spm-video-library.js','spm-resources-content.js','erectile-library-v3.js','erection-daily-plan-v1.js','daily-resource-plan-v1.js','daily-practice-v1.js']){if(f==='daily-practice-v1.js')w.SPM_DE_LIBRARY={days:()=>w.SPM_DE_LIBRARY_V3.days};w.eval(read(f));}
 return{w,c,writes,opens,close:()=>{observers.forEach(o=>o.disconnect());w.close();}};
}
test('all 28 days have concrete launchers; secondary Desire is never the main daily practice',async()=>{
 for(const route of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
  const h=harness(route);try{await wait();for(let day=1;day<=28;day++){
   h.c.day=day;const items=h.w.SPM_DAILY_PRACTICE.assignments();assert.ok(items.length>=2&&items.length<=5);assert.equal(items[0].id,'main');assert.equal(new Set(items.map(x=>x.id)).size,items.length);
   if(route==='erection')assert.equal(items[0].kind,day===6?'pelvic':'erection');if(route==='desire')assert.equal(items[0].kind,'desire');else if(route!=='erection')assert.notEqual(items[0].kind,'desire');
   assert.ok(items.every(x=>x.title&&x.summary));
  }}finally{h.close()}
 }
});
test('Today opens the real current session and keeps the library intact',async()=>{
 const h=harness();try{await wait();h.w.SPM_DAILY_PRACTICE.open();assert.equal(h.w.document.activeElement.id,'spmDailySession');h.w.document.querySelector('[data-daily-open="main"]').click();assert.equal(h.opens[0][0],'erection');assert.equal(h.opens[0][1],12);assert.equal(h.opens[0][2].origin,'dailyPlan');assert.equal(h.writes.length,0);
 h.w.SPM_DAILY_PRACTICE.library();assert.equal(h.w.document.querySelector('#plan').dataset.spmDailyView,'library');assert.ok(h.w.document.querySelector('#original-library'));assert.equal(h.c.day,12);
 }finally{h.close()}
});
test('saving one activity does not complete or advance the day; stale and restricted writes fail',async()=>{
 const h=harness();try{await wait();await h.w.SPM_DAILY_PRACTICE.saveActivity('main',{note:'example'});assert.equal(h.writes.length,1);assert.equal(h.c.day,12);assert.deepEqual(h.c.completed,[]);assert.equal(h.w.document.querySelector('#spmDailyComplete').disabled,true);
 await assert.rejects(h.w.SPM_DAILY_PRACTICE.saveActivity('main',{},'qa:old-plan',12));h.c.safety='review';h.c.day=8;await assert.rejects(h.w.SPM_DAILY_PRACTICE.saveActivity('main'));assert.equal(h.writes.length,1);
 }finally{h.close()}
});
test('shared breathing/focus replaces a duplicate text task and retains the scheduled session',async()=>{
 const h=harness('confidence',16);try{await wait();const items=h.w.SPM_DAILY_PRACTICE.assignments();assert.equal(items.filter(a=>!a.optional).length,1);assert.equal(items[0].kind,'sensate');h.w.document.querySelector('[data-daily-open="main"]').click();await wait();assert.equal(h.opens[0][0],'SENSATE');assert.equal(h.opens[0][1].day,16);}finally{h.close()}
});

test('wellness rotates over 28 days while the primary and scheduled supports stay separate',async()=>{
 const h=harness('ejaculation');try{await wait();const counts={nutrition:0,movement:0,sleep:0};
 for(let day=1;day<=28;day++){
  const items=h.w.SPM_DAILY_PRACTICE.assignments({...h.c,day}),well=items.filter(a=>a.kind==='wellness');
  assert.equal(well.length,1);assert.equal(well[0].optional,true);counts[well[0].tip.category]++;
  if(day%7===0)assert.equal(items.filter(a=>!a.optional).length,2);
 }
 assert.deepEqual(counts,{nutrition:10,movement:9,sleep:9});
 for(const [day,kind] of [[6,'pelvic'],[11,'recovery'],[13,'confidence'],[18,'worksheet'],[25,'recovery']]){
  assert.ok(h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary:'desire',day}).some(a=>a.kind===kind));
 }
 }finally{h.close()}
});
test('review flag allows day 14 educational review without clearing the flag or unlocking physical practice',async()=>{
 for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
 const h=harness(primary,14);try{await wait();h.c.safety='review';h.c.flags=['h_cv_event'];h.w.dispatchEvent(new h.w.Event('spm:resourcecontext'));
 assert.equal(h.w.SPM_DAILY_PRACTICE.restricted(h.c,'main'),false);
 await h.w.SPM_DAILY_PRACTICE.saveActivity('main',{confirmed:true});assert.equal(h.writes.length,1);
 assert.equal(h.c.safety,'review');assert.equal(h.c.day,14);
 h.c.day=6;assert.equal(h.w.SPM_DAILY_PRACTICE.restricted(h.c,'main'),true);
 await assert.rejects(h.w.SPM_DAILY_PRACTICE.saveActivity('main'));
 }finally{h.close()}}
});
test('urgent flags cannot be bypassed; blocked buttons explain the restriction and keep library access',async()=>{
 const h=harness('confidence',14);try{await wait();h.c.safety='urgent';h.c.flags=['s_cardiac'];h.w.dispatchEvent(new h.w.Event('spm:resourcecontext'));
 const button=h.w.document.querySelector('[data-daily-open="main"]');assert.equal(button.disabled,false);button.click();
 assert.ok(h.w.document.querySelector('#spmDailyWorkspace [data-daily-library]'));
 assert.match(h.w.document.querySelector('#spmDailyWorkspace').textContent,/dolor en el pecho/);
 await assert.rejects(h.w.SPM_DAILY_PRACTICE.saveActivity('main'));assert.equal(h.writes.length,0);
 h.c.safety='none';assert.equal(h.w.SPM_DAILY_PRACTICE.safety(h.c),'urgent');
 }finally{h.close()}
});
test('new check-in safety flags and unknown status retain the physical pause',async()=>{
 const h=harness('erection',8);try{await wait();h.c.checkins=[{new_safety_flag:true}];assert.equal(h.w.SPM_DAILY_PRACTICE.restricted(h.c,'main'),true);
 h.c.checkins=[];h.c.safety='unknown';assert.equal(h.w.SPM_DAILY_PRACTICE.restricted(h.c,'main'),true);
 assert.equal(h.w.SPM_DAILY_PRACTICE.restricted(null),true);
 }finally{h.close()}
});
test('secondary routes keep their conditional pelvic sessions; EF and EP use a twice-weekly calendar',async()=>{
 const h=harness('confidence');try{await wait();
 for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle'])for(const day of [12,19,24]){
  const pelvic=h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary,day}).filter(a=>a.kind==='pelvic');
  assert.equal(pelvic.length,['erection','ejaculation'].includes(primary)?0:1);assert.ok(pelvic.every(a=>a.optional));
 }
 }finally{h.close()}
});

test('all routes schedule short videos; mixed Desire support never replaces the primary session',async()=>{
 const h=harness('desire');try{await wait();
 for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle','anxiety','optimization','mixed']){
  const days=Array.from({length:28},(_,i)=>h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary,day:i+1}));
  assert.deepEqual(days.flatMap((items,i)=>items.some(a=>a.kind==='video')?[i+1]:[]),[1,2,7,9,14,18,21,28]);
  assert.ok(days.flat().filter(a=>a.kind==='video').every(a=>h.w.SPM_VIDEO_LIBRARY.some(v=>v.key===a.videoKey)));
  for(const day of [5,15,22]){
   const c={...h.c,primary,day},items=h.w.SPM_DAILY_PRACTICE.assignments(c);
   assert.equal(items.filter(a=>a.kind==='desire').length,1);
   if(!['erection','desire'].includes(primary)){
    assert.notEqual(items[0].kind,'desire');
    assert.equal(h.w.SPM_DAILY_PRACTICE.assignments({...c,secondary:null,motives:[primary]}).some(a=>a.kind==='desire'),false);
   }
  }
  assert.ok(days[10].some(a=>a.kind==='recovery'));
  assert.ok(days[24].some(a=>a.kind==='recovery'));
 }
 }finally{h.close()}
});

test('all seven recovery stories and the approved weekly frequencies are real assignments',async()=>{
 const h=harness();try{await wait();const routes={};
 for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
  const rows=Array.from({length:28},(_,i)=>({day:i+1,base:h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary,day:i+1,secondary:null,motives:[primary]}),withDesire:h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary,day:i+1})}));routes[primary]=rows;
  const stories=rows.flatMap(r=>r.base.filter(a=>a.kind==='recovery'));
  assert.equal(stories.length,7);assert.equal(new Set(stories.map(a=>a.scenario)).size,7);
  assert.ok(stories.every(a=>h.w.SPM_RESOURCE_CONTENT.scenarios.some(s=>s.id===a.scenario&&a.title.includes(s.title.es))));
  if(['erection','ejaculation'].includes(primary))for(let week=0;week<4;week++){
   const days=rows.slice(week*7,week*7+7);assert.equal(days.filter(r=>r.base.some(a=>a.kind==='pelvic')).length,2);
   if(primary==='ejaculation'){assert.equal(days.filter(r=>r.base.some(a=>a.kind==='ejaculation')).length,3);assert.ok(days.every(r=>!r.base.some(a=>a.kind==='pelvic')||!r.base.some(a=>a.kind==='ejaculation')));}
  }
 }
 if(process.env.SPM_CALENDAR_EXPORT)fs.writeFileSync(process.env.SPM_CALENDAR_EXPORT,JSON.stringify(routes,null,2));
 }finally{h.close()}
});
test('recovery completion retains the assigned scenario for day-specific tracking',async()=>{
 const h=harness('ejaculation',11);try{await wait();const a=h.w.SPM_DAILY_PRACTICE.assignments().find(a=>a.kind==='recovery');await h.w.SPM_DAILY_PRACTICE.saveActivity(a.id,{confirmed:true});assert.equal(h.writes[0][1].scenario,'early');}finally{h.close()}
});

test('erection Desire is twice weekly, or three times for expressed low Desire, without changing shared cadence',async()=>{
 const h=harness();try{await wait();
 for(const profile of [{secondary:null,motives:['erection'],answers:{}},{secondary:'desire',motives:['erection'],answers:{}},{secondary:null,motives:['erection','desire'],answers:{}},{secondary:null,motives:['erection'],answers:{d_desire:2}},{secondary:null,motives:['erection'],answers:{h_medeffect:'desire'}}]){
 const rows=Array.from({length:28},(_,i)=>h.w.SPM_DAILY_PRACTICE.assignments({...h.c,...profile,day:i+1}));
 const high=profile.secondary==='desire'||profile.motives.includes('desire')||profile.answers.d_desire===2||profile.answers.h_medeffect==='desire';
 assert.deepEqual(rows.flatMap((a,i)=>a.some(x=>x.kind==='desire')?[i+1]:[]),high?[2,5,7,10,11,12,15,17,21,22,25,26]:[2,5,10,12,15,17,22,26]);
 for(let w=0;w<4;w++)assert.equal(rows.slice(w*7,w*7+7).filter(a=>a.some(x=>x.kind==='desire')).length,high?3:2);
 assert.ok(rows.every(a=>a.length<=5));
 assert.deepEqual(rows.flatMap((a,i)=>a.some(x=>x.id==='de-confidence-'+(i+1))?[i+1]:[]),[7,14,21,28]);
 }
 }finally{h.close()}
});
