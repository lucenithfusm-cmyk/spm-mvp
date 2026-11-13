const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../labs/sensate/node_modules/jsdom');
const source=fs.readFileSync(path.join(__dirname,'../premium-v2/sensate-lab-bridge-v1.js'),'utf8');
function harness(extra={}){
 const dom=new JSDOM('<section id="plan"><div class="dayCard"></div></section><button id="logoutBtn">Salir</button>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 let c={userId:'qa',planId:'p1',day:12,safety:'none',flags:[],checkins:[],primary:'erection',secondary:'desire',motives:['erection','desire'],...extra};const writes=[];
 w.SPM_RESOURCE_CONTEXT=()=>c;w.SPM_SENSATE_RECORDS={read:async()=>({}),save:async(state,scope,day)=>writes.push({state,scope,day})};w.eval(fs.readFileSync(path.join(__dirname,'../premium-v2/daily-support-plan-v1.js'),'utf8'));w.eval(source);
 return {w,writes,context:()=>c,setContext:next=>{c=next},async close(){await w.SPM_SENSATE_LAB.close();w.close();}};
}
test('DE + deseo and EP + deseo link to the module using the active Central day',async()=>{
 for(const primary of ['erection','ejaculation']){const h=harness({primary});try{assert.equal(h.w.SPM_SENSATE_LAB.relevant(h.context()),true);await new Promise(r=>setTimeout(r,30));assert.ok(h.w.document.querySelector('[data-sensate-daily]'));await h.w.SPM_SENSATE_LAB.open({origin:primary==='erection'?'erectile':'ejaculation',day:27});assert.equal(h.w.SPM_SENSATE_LAB_HOST.getContext().day,12);assert.match(h.w.document.querySelector('iframe').src,/origin=dailyPlan/);}finally{await h.close();}}
});
test('a standalone primary Sensate route is relevant; unrelated profiles remain optional',async()=>{const h=harness();try{assert.equal(h.w.SPM_SENSATE_LAB.relevant({primary:'desire'}),true);assert.equal(h.w.SPM_SENSATE_LAB.relevant({primary:'unrelated'}),false);}finally{await h.close();}});
test('module state is saved under the active user/plan and never browser local storage',async()=>{const h=harness();try{await h.w.SPM_SENSATE_LAB.open();assert.equal(h.w.SPM_SENSATE_LAB_HOST.write('spm-sensate-state','{"zones":["neck"]}'),true);await h.w.SPM_SENSATE_LAB.flush();assert.equal(h.writes[0].scope,'qa:p1');assert.equal(h.writes[0].day,12);assert.equal(h.w.localStorage.length,0);assert.equal(h.writes[0].state['spm-sensate-state'],'{"zones":["neck"]}');}finally{await h.close();}});
test('account changes invalidate the old bridge and pending writes',async()=>{const h=harness();try{await h.w.SPM_SENSATE_LAB.open();const old=h.w.SPM_SENSATE_LAB_HOST;h.setContext({...h.context(),userId:'other'});assert.equal(old.write('spm-sensate-state','7'),false);h.w.dispatchEvent(new h.w.Event('spm:session-change'));assert.equal(h.w.SPM_SENSATE_LAB_HOST,undefined);assert.equal(h.writes.length,0);}finally{await h.close();}});
test('save failure retains the module for retry and does not claim success',async()=>{const h=harness();try{await h.w.SPM_SENSATE_LAB.open();h.w.SPM_SENSATE_LAB_HOST.write('spm-sensate-state','7');h.w.SPM_SENSATE_RECORDS.save=async()=>{throw Error('offline')};assert.equal(await h.w.SPM_SENSATE_LAB.close(),false);assert.ok(h.w.document.querySelector('iframe'));assert.equal(h.w.document.querySelector('[data-sensate-retry]').hidden,false);h.w.SPM_SENSATE_RECORDS.save=async()=>{};assert.equal(await h.w.SPM_SENSATE_LAB.close(),true);}finally{await h.close();}});
test('clinical review and urgent signals reach the child without changing scores or days',async()=>{const h=harness();try{await h.w.SPM_SENSATE_LAB.open();h.setContext({...h.context(),safety:'review'});assert.equal(h.w.SPM_SENSATE_LAB_HOST.getContext().restriction,'review');h.setContext({...h.context(),safety:'urgent'});assert.equal(h.w.SPM_SENSATE_LAB_HOST.getContext().restriction,'urgent');assert.equal(h.writes.length,0);}finally{await h.close();}});
test('read failures do not initialize empty data over existing progress',async()=>{const h=harness();try{h.w.SPM_SENSATE_RECORDS.read=async()=>{throw Error('offline')};assert.equal(await h.w.SPM_SENSATE_LAB.open(),false);assert.equal(h.w.SPM_SENSATE_LAB_HOST,undefined);assert.equal(h.w.document.querySelector('iframe'),null);assert.equal(h.writes.length,0);}finally{await h.close();}});
test('new transversal events open Sensate and unknown state keys are rejected',async()=>{const h=harness();try{h.w.dispatchEvent(new h.w.CustomEvent('spm:open-lab',{detail:{lab:'sensate',origin:'erectile'}}));await new Promise(r=>setTimeout(r,0));assert.ok(h.w.document.querySelector('iframe'));assert.equal(h.w.SPM_SENSATE_LAB_HOST.write('userId','other'),false);assert.equal(h.w.SPM_SENSATE_LAB.validState({'spm-sensate-records':'x'.repeat(350001)}),false);}finally{await h.close();}});

test('all intended routes share Central day and clinical content stays intact',async()=>{for(const primary of ['erection','ejaculation','desire','confidence','anxiety']){const h=harness({primary});try{assert.equal(h.w.SPM_SENSATE_LAB.relevant(h.context()),true);await h.w.SPM_SENSATE_LAB.open();assert.equal(h.w.SPM_SENSATE_LAB_HOST.getContext().day,12);}finally{await h.close();}} const source=fs.readFileSync(path.join(__dirname,'../labs/sensate/src/components/SensateLab.tsx'),'utf8');assert.doesNotMatch(source,/<pre|localStorage/);assert.match(source,/day: centralContext\(\).day/);assert.match(source,/await host\(\)\?\.flush/);});

function dailyProbe(h){
 const completions=[],continuations=[],assigned={id:'assigned-sensate',kind:'sensate'};
 const c=h.context(),active={id:assigned.id,scope:c.userId+':'+c.planId,day:c.day};
 h.w.SPM_DAILY_PRACTICE={
  active:()=>active,
  assignments:()=>[{id:'another-activity',kind:'breathing'},assigned],
  saveActivity:async(id,data,scope,day)=>completions.push({id,data:JSON.parse(JSON.stringify(data)),scope,day}),
  showContinuation:()=>continuations.push({outside:h.w.document.querySelector('iframe')===null})
 };
 return {completions,continuations,assigned};
}
function sensateRecord(day=12,completed=true){return {id:'sensate-record',day,practiceId:'sf-focus-1',completed,presenceBefore:4,presenceAfter:6,pressureBefore:4,pressureAfter:2,enjoyment:5,monitoringIntrusions:1,partnerComfort:6,usefulStimuli:[],recommendation:'repeat',origin:'dailyPlan',savedAt:'2026-11-13T10:00:00.000Z'};}

test('closing a daily Sensate activity shows continuation outside the module without completing it',async()=>{
 const h=harness(),p=dailyProbe(h);try{
  await h.w.SPM_SENSATE_LAB.open({origin:'dailyPlan'});
  assert.equal(h.w.SPM_SENSATE_LAB_HOST.write('spm-sensate-records',JSON.stringify([sensateRecord()])),true);
  assert.equal(await h.w.SPM_SENSATE_LAB.close(),true);
  assert.equal(h.w.document.querySelector('dialog'),null);
  assert.equal(h.writes.length,1);
  assert.equal(p.completions.length,0);
  assert.deepEqual(p.continuations,[{outside:true}]);
 }finally{await h.close();}
});

test('Sensate recordDaily requires a completed current-day record and completes the assignment by kind',async()=>{
 const h=harness(),p=dailyProbe(h);try{
  await h.w.SPM_SENSATE_LAB.open({origin:'dailyPlan',day:27});
  const host=h.w.SPM_SENSATE_LAB_HOST;
  assert.equal(await host.recordDaily(),false);
  assert.equal(host.write('spm-sensate-records',JSON.stringify([sensateRecord(11)])),true);
  assert.equal(await host.recordDaily(),false);
  for(const completed of [false,'true']){
   assert.equal(host.write('spm-sensate-records',JSON.stringify([sensateRecord(12,completed)])),true);
   assert.equal(await host.recordDaily(),false);
  }
  assert.equal(p.completions.length,0);
  assert.equal(host.write('spm-sensate-records',JSON.stringify([sensateRecord()])),true);
  h.setContext({...h.context(),day:13});
  assert.equal(await host.recordDaily(),false);
  h.setContext({...h.context(),day:12});
  assert.equal(await host.recordDaily(),true);
  assert.equal(h.writes.length,1);
  assert.deepEqual(p.completions,[{id:p.assigned.id,data:{confirmed:true,source:'sensate-lab'},scope:'qa:p1',day:12}]);
  assert.ok(h.w.document.querySelector('iframe'));
  assert.equal(p.continuations.length,0);
 }finally{await h.close();}
});

test('Sensate recordDaily retains the module on persistence or completion failure and supports retry',async()=>{
 const h=harness(),p=dailyProbe(h);try{
  await h.w.SPM_SENSATE_LAB.open({origin:'dailyPlan'});
  const host=h.w.SPM_SENSATE_LAB_HOST,persist=h.w.SPM_SENSATE_RECORDS.save,complete=h.w.SPM_DAILY_PRACTICE.saveActivity;
  assert.equal(host.write('spm-sensate-records',JSON.stringify([sensateRecord()])),true);
  h.w.SPM_SENSATE_RECORDS.save=async()=>{throw Error('offline')};
  assert.equal(await host.recordDaily(),false);
  assert.equal(p.completions.length,0);
  assert.equal(p.continuations.length,0);
  assert.ok(h.w.document.querySelector('iframe'));
  assert.equal(h.w.document.querySelector('[data-sensate-retry]').hidden,false);
  assert.equal(await h.w.SPM_SENSATE_LAB.close(),false);
  assert.equal(p.continuations.length,0);
  h.w.SPM_SENSATE_RECORDS.save=persist;
  h.w.SPM_DAILY_PRACTICE.saveActivity=async()=>{throw Error('completion offline')};
  assert.equal(await host.recordDaily(),false);
  assert.ok(h.w.document.querySelector('iframe'));
  assert.equal(p.completions.length,0);
  assert.equal(p.continuations.length,0);
  h.w.SPM_DAILY_PRACTICE.saveActivity=complete;
  assert.equal(await host.recordDaily(),true);
  assert.equal(p.completions.length,1);
  assert.equal(await h.w.SPM_SENSATE_LAB.close(),true);
  assert.deepEqual(p.continuations,[{outside:true}]);
 }finally{await h.close();}
});

test('Sensate library recording persists the record without completing or continuing a daily assignment',async()=>{
 const h=harness(),p=dailyProbe(h);try{
  await h.w.SPM_SENSATE_LAB.open({origin:'library'});
  const host=h.w.SPM_SENSATE_LAB_HOST;
  assert.equal(host.write('spm-sensate-records',JSON.stringify([{...sensateRecord(),origin:'library'}])),true);
  assert.equal(await host.recordDaily(),true);
  assert.equal(await h.w.SPM_SENSATE_LAB.close(),true);
  assert.equal(h.writes.length,1);
  assert.equal(p.completions.length,0);
  assert.equal(p.continuations.length,0);
 }finally{await h.close();}
});
