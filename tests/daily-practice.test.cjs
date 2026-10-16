const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../labs/breathing/node_modules/jsdom');
const read=f=>fs.readFileSync(path.join(__dirname,'../premium-v2',f),'utf8');
const wait=()=>new Promise(r=>setTimeout(r,40));
function harness(primary='erection',day=12){
 const dom=new JSDOM('<section id="plan"><div id="dayGrid"></div><section id="original-library">Library</section></section>',{url:'https://spm.test',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};
 const c={userId:'qa',planId:'plan',primary,day,secondary:'desire',motives:[primary,'desire'],safety:'none',flags:[],checkins:[],completed:[]},writes=[],opens=[];
 w.SPM_RESOURCE_CONTEXT=()=>c;w.SPM_DAILY_RECORDS={read:async()=>({}),save:async(...args)=>writes.push(args)};
 w.SPM_ERECTILE_FUNCTION={open:(...args)=>opens.push(['erection',...args])};
 w.SPM_EJACULATORY_CONTROL={schedule:{1:{tech:'startstop',week:1,session:1},12:{tech:'squeeze',week:2,session:3}},open:(...args)=>opens.push(['ejaculation',...args])};
 for(const lab of ['DESIRE','SENSATE','BREATHING'])w['SPM_'+lab+'_LAB']={open:async o=>opens.push([lab,o])};
 w.SPM_RESOURCES={open:(...args)=>opens.push(['resource',...args])};
 for(const f of ['modules.js','daily-support-plan-v1.js','daily-practice-v1.js'])w.eval(read(f));
 return{w,c,writes,opens,close:()=>w.close()};
}
test('all 28 days have concrete launchers; secondary Desire is never the main daily practice',async()=>{
 for(const route of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
  const h=harness(route);try{await wait();for(let day=1;day<=28;day++){
   h.c.day=day;const items=h.w.SPM_DAILY_PRACTICE.assignments();assert.ok(items.length>=1&&items.length<=2);assert.equal(items[0].id,'main');assert.equal(new Set(items.map(x=>x.id)).size,items.length);
   if(route==='erection')assert.equal(items[0].kind,'erection');if(route==='desire')assert.equal(items[0].kind,'desire');else assert.ok(!items.some(x=>x.kind==='desire'));
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
 await assert.rejects(h.w.SPM_DAILY_PRACTICE.saveActivity('main',{},'qa:old-plan',12));h.c.safety='review';await assert.rejects(h.w.SPM_DAILY_PRACTICE.saveActivity('main'));assert.equal(h.writes.length,1);
 }finally{h.close()}
});
test('shared breathing/focus replaces a duplicate text task and retains the scheduled session',async()=>{
 const h=harness('confidence',16);try{await wait();const items=h.w.SPM_DAILY_PRACTICE.assignments();assert.equal(items.length,1);assert.equal(items[0].kind,'sensate');h.w.document.querySelector('[data-daily-open="main"]').click();await wait();assert.equal(h.opens[0][0],'SENSATE');assert.equal(h.opens[0][1].day,16);}finally{h.close()}
});
