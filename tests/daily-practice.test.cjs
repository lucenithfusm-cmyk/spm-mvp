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
 w.SPM_EJACULATORY_CONTROL={schedule:{1:{tech:'startstop',week:1,session:1},12:{tech:'squeeze',week:2,session:3}},open:(...args)=>opens.push(['ejaculation',...args])};
 for(const lab of ['DESIRE','SENSATE','BREATHING'])w['SPM_'+lab+'_LAB']={open:async o=>opens.push([lab,o])};
 w.SPM_RESOURCES={restricted:c=>c.safety!=='none',open:(...args)=>opens.push(['resource',...args])};
 for(const f of ['engine.js','modules.js','wellness-daily-tip-v1.js','daily-support-plan-v1.js','spm-video-library.js','erectile-library-v3.js','erection-daily-plan-v1.js','daily-practice-v1.js'])w.eval(read(f));
 return{w,c,writes,opens,close:()=>{observers.forEach(o=>o.disconnect());w.close();}};
}
test('all 28 days have concrete launchers; secondary Desire is never the main daily practice',async()=>{
 for(const route of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
  const h=harness(route);try{await wait();for(let day=1;day<=28;day++){
   h.c.day=day;const items=h.w.SPM_DAILY_PRACTICE.assignments();assert.ok(items.length>=2&&items.length<=4);assert.equal(items[0].id,'main');assert.equal(new Set(items.map(x=>x.id)).size,items.length);
   if(route==='erection')assert.equal(items[0].kind,'erection');if(route==='desire')assert.equal(items[0].kind,'desire');else if(route!=='erection')assert.ok(!items.some(x=>x.kind==='desire'));
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
  if(day%7===0)assert.equal(items.filter(a=>!a.optional).length,1);
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
test('conditional pelvic sessions retain the original agenda days and the EP day 24 alternative',async()=>{
 const h=harness('confidence');try{await wait();
 for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle'])for(const day of [12,19,24]){
  const pelvic=h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary,day}).filter(a=>a.kind==='pelvic');
  assert.equal(pelvic.length,primary==='ejaculation'&&day===24?0:1);assert.ok(pelvic.every(a=>a.optional));
 }
 }finally{h.close()}
});
