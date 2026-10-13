const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../labs/breathing/node_modules/jsdom');
const source=name=>fs.readFileSync(path.join(__dirname,'../premium-v2',name),'utf8');
function setup(primary='erection',day=10){
 const dom=new JSDOM('<section id="plan"><div id="dayGrid">'+Array.from({length:28},(_,i)=>`<article class="dayCard"><span class="dayNum">${i+1}</span><div class="dayBody"></div></article>`).join('')+'</div></section>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 let c={userId:'qa',planId:'p1',day,primary,motives:[primary],safety:'none',flags:[],completed:[]};const writes=[];
 w.SPM_RESOURCE_CONTEXT=()=>c;
 for(const lab of ['BREATHING','SENSATE'])w['SPM_'+lab+'_RECORDS']={read:async()=>({}),save:async(state,scope,day)=>writes.push({lab,state,scope,day})};
 for(const file of ['daily-support-plan-v1.js','adaptive-daily-plan-v2.js','breathing-lab-bridge-v1.js','sensate-lab-bridge-v1.js'])w.eval(source(file));
 return {w,writes,c,setContext:x=>{c=x;w.dispatchEvent(new w.Event('spm:resourcecontext'))},close:()=>w.close()};
}
const wait=()=>new Promise(r=>setTimeout(r,40));
test('all three routes have alternating sessions over four weeks, with no extra review-day sessions',()=>{
 for(const route of ['erection','ejaculation','desire']){const h=setup(route);try{
  const plan=h.w.SPM_DAILY_SUPPORT;
  assert.deepEqual(Array.from({length:28},(_,i)=>i+1).filter(d=>plan.activity('breathing',d,h.c)),[3,6,10,13,17,20,24,27]);
  assert.deepEqual(Array.from({length:28},(_,i)=>i+1).filter(d=>plan.activity('sensate',d,h.c)),[4,8,12,16,19,23,26]);
  for(let d=1;d<=28;d++){
   const items=plan.assignments(d,h.c);assert.ok(items.length<=1);
   if(d%7===0)assert.equal(items.length,0);
   for(const item of items){assert.ok(item.steps.length<=5);assert.ok(item.minutes<=15);assert.ok(h.w.SPM_DAILY_AGENDA_ITEMS(d).some(x=>x.startsWith(item.title)));}
  }
  assert.equal(plan.assignments(0,h.c).length,0);assert.equal(plan.assignments(29,h.c).length,0);
  assert.equal(plan.assignments(3,{primary:'unrelated'}).length,0);
  assert.equal(h.writes.length,0);assert.equal(h.c.day,10);
 }finally{h.close()}}
});
test('daily buttons match schedule and only the authoritative current day is actionable',async()=>{
 const h=setup();try{await wait();
  const w=h.w,breaths=[...w.document.querySelectorAll('[data-breathing-daily]')],sensate=[...w.document.querySelectorAll('[data-sensate-daily]')];
  assert.equal(breaths.length,8);assert.equal(sensate.length,7);assert.equal(breaths.filter(x=>!x.disabled).length,1);assert.equal(sensate.filter(x=>!x.disabled).length,0);
  await w.SPM_BREATHING_LAB.open({origin:'dailyPlan'});
  assert.equal(w.SPM_BREATHING_LAB_HOST.getContext().mode,'daily');assert.deepEqual([...w.SPM_BREATHING_LAB_HOST.getContext().activity.steps],[11]);
  await w.SPM_BREATHING_LAB_HOST.openLibrary();assert.equal(w.SPM_BREATHING_LAB_HOST.getContext().mode,'library');assert.equal(w.SPM_BREATHING_LAB_HOST.getContext().activity,null);await w.SPM_BREATHING_LAB.close();
  h.setContext({...h.c,day:12});await wait();assert.equal(w.document.querySelectorAll('[data-breathing-daily]:enabled').length,0);assert.equal(w.document.querySelectorAll('[data-sensate-daily]:enabled').length,1);
  await w.SPM_SENSATE_LAB.open({origin:'dailyPlan'});assert.deepEqual([...w.SPM_SENSATE_LAB_HOST.getContext().activity.steps],[3]);await w.SPM_SENSATE_LAB.close();
  assert.equal(h.writes.length,0);
 }finally{h.close()}
});
test('off-schedule entry has no curriculum and a future request never changes Central day',async()=>{
 const h=setup('desire',14);try{
  for(const lab of ['BREATHING','SENSATE']){
   await h.w['SPM_'+lab+'_LAB'].open({origin:'dailyPlan'});assert.equal(h.w['SPM_'+lab+'_LAB_HOST'].getContext().activity,null);await h.w['SPM_'+lab+'_LAB'].close();
  }
  await h.w.SPM_BREATHING_LAB.open({origin:'dailyPlan',day:27});assert.equal(h.w.SPM_BREATHING_LAB_HOST.getContext().day,14);assert.equal(h.w.SPM_BREATHING_LAB_HOST.getContext().activity.day,27);await h.w.SPM_BREATHING_LAB.close();assert.equal(h.writes.length,0);
 }finally{h.close()}
});
