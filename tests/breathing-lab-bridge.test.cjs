const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../labs/breathing/node_modules/jsdom');
const source=fs.readFileSync(path.join(__dirname,'../premium-v2/breathing-lab-bridge-v1.js'),'utf8');
function harness(extra={}){
 const dom=new JSDOM('<section id="plan"><div class="dayCard"></div></section><button id="logoutBtn">Salir</button>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 let c={userId:'qa',planId:'p1',day:12,safety:'none',flags:[],checkins:[],primary:'erection',secondary:'desire',motives:['erection','desire'],...extra};const writes=[];
 w.SPM_RESOURCE_CONTEXT=()=>c;w.SPM_BREATHING_RECORDS={read:async()=>({}),save:async(state,scope,day)=>writes.push({state,scope,day})};w.eval(fs.readFileSync(path.join(__dirname,'../premium-v2/daily-support-plan-v1.js'),'utf8'));w.eval(source);
 return {w,writes,context:()=>c,setContext:next=>{c=next},async close(){await w.SPM_BREATHING_LAB.close();w.close();}};
}
test('DE + deseo and EP + deseo link to the module using the active Central day',async()=>{
 for(const primary of ['erection','ejaculation']){const h=harness({primary,day:10});try{assert.equal(h.w.SPM_BREATHING_LAB.relevant(h.context()),true);await new Promise(r=>setTimeout(r,30));assert.ok(h.w.document.querySelector('[data-breathing-daily]'));await h.w.SPM_BREATHING_LAB.open({origin:primary==='erection'?'erectile':'ejaculation',day:27});assert.equal(h.w.SPM_BREATHING_LAB_HOST.getContext().day,10);assert.match(h.w.document.querySelector('iframe').src,/origin=dailyPlan/);}finally{await h.close();}}
});
test('a standalone primary Breathing route is relevant; unrelated profiles remain optional',async()=>{const h=harness();try{assert.equal(h.w.SPM_BREATHING_LAB.relevant({primary:'desire'}),true);assert.equal(h.w.SPM_BREATHING_LAB.relevant({primary:'unrelated'}),false);}finally{await h.close();}});
test('module state is saved under the active user/plan and never browser local storage',async()=>{const h=harness();try{await h.w.SPM_BREATHING_LAB.open();assert.equal(h.w.SPM_BREATHING_LAB_HOST.write('spmb-step','7'),true);await h.w.SPM_BREATHING_LAB.flush();assert.equal(h.writes[0].scope,'qa:p1');assert.equal(h.writes[0].day,12);assert.equal(h.w.localStorage.length,0);assert.equal(h.writes[0].state['spmb-step'],'7');}finally{await h.close();}});
test('account changes invalidate the old bridge and pending writes',async()=>{const h=harness();try{await h.w.SPM_BREATHING_LAB.open();const old=h.w.SPM_BREATHING_LAB_HOST;h.setContext({...h.context(),userId:'other'});assert.equal(old.write('spmb-step','7'),false);h.w.dispatchEvent(new h.w.Event('spm:session-change'));assert.equal(h.w.SPM_BREATHING_LAB_HOST,undefined);assert.equal(h.writes.length,0);}finally{await h.close();}});
test('save failure retains the module for retry and does not claim success',async()=>{const h=harness();try{await h.w.SPM_BREATHING_LAB.open();h.w.SPM_BREATHING_LAB_HOST.write('spmb-step','7');h.w.SPM_BREATHING_RECORDS.save=async()=>{throw Error('offline')};assert.equal(await h.w.SPM_BREATHING_LAB.close(),false);assert.ok(h.w.document.querySelector('iframe'));assert.equal(h.w.document.querySelector('[data-breathing-retry]').hidden,false);h.w.SPM_BREATHING_RECORDS.save=async()=>{};assert.equal(await h.w.SPM_BREATHING_LAB.close(),true);}finally{await h.close();}});
test('clinical review and urgent signals reach the child without changing scores or days',async()=>{const h=harness();try{await h.w.SPM_BREATHING_LAB.open();h.setContext({...h.context(),safety:'review'});assert.equal(h.w.SPM_BREATHING_LAB_HOST.getContext().restriction,'review');h.setContext({...h.context(),safety:'urgent'});assert.equal(h.w.SPM_BREATHING_LAB_HOST.getContext().restriction,'urgent');assert.equal(h.writes.length,0);}finally{await h.close();}});
test('read failures do not initialize empty data over existing progress',async()=>{const h=harness();try{h.w.SPM_BREATHING_RECORDS.read=async()=>{throw Error('offline')};assert.equal(await h.w.SPM_BREATHING_LAB.open(),false);assert.equal(h.w.SPM_BREATHING_LAB_HOST,undefined);assert.equal(h.w.document.querySelector('iframe'),null);assert.equal(h.writes.length,0);}finally{await h.close();}});
test('new transversal events open Breathing and unknown state keys are rejected',async()=>{const h=harness();try{h.w.dispatchEvent(new h.w.CustomEvent('spm:open-lab',{detail:{lab:'breathing',origin:'erectile'}}));await new Promise(r=>setTimeout(r,0));assert.ok(h.w.document.querySelector('iframe'));assert.equal(h.w.SPM_BREATHING_LAB_HOST.write('userId','other'),false);assert.equal(h.w.SPM_BREATHING_LAB.validState({'spmb-sessions':'x'.repeat(350001)}),false);}finally{await h.close();}});

test('all intended routes share Central day and clinical content stays intact',async()=>{for(const primary of ['erection','ejaculation','desire']){const h=harness({primary});try{assert.equal(h.w.SPM_BREATHING_LAB.relevant(h.context()),true);await h.w.SPM_BREATHING_LAB.open();assert.equal(h.w.SPM_BREATHING_LAB_HOST.getContext().day,12);}finally{await h.close();}} const source=fs.readFileSync(path.join(__dirname,'../labs/breathing/src/components/BreathingLab.tsx'),'utf8');assert.doesNotMatch(source,/<pre|localStorage/);assert.match(source,/day: context.day/);});

test('all 28 Central days remain authoritative despite caller input',async()=>{const h=harness();try{for(let day=1;day<=28;day++){h.setContext({...h.context(),day});await h.w.SPM_BREATHING_LAB.open({day:99});assert.equal(h.w.SPM_BREATHING_LAB_HOST.getContext().day,day);await h.w.SPM_BREATHING_LAB.close();}assert.equal(h.writes.length,0);}finally{await h.close();}});
test('malformed persisted payloads are rejected',async()=>{const h=harness();try{for(const s of [{'spmb-step':'99'},{'spmb-plan':'[29]'},{'spmb-sessions':'{}'},{'spmb-nohold':'"false"'},{'spm_breathing_competency_v1':'{}'},{'spmb-origin':'"invalid"'}])assert.equal(h.w.SPM_BREATHING_LAB.validState(s),false);}finally{await h.close();}});

test('Central persistence writes only breathing resource rows and checks user, plan and day',async()=>{
 const h=harness();try{
  const app=fs.readFileSync(path.join(__dirname,'../premium-v2/app-live.js'),'utf8');const block=app.slice(app.indexOf('window.SPM_BREATHING_RECORDS='),app.indexOf('const motiveDefs='));let row,filter=[];
  h.w.db={from:table=>{assert.equal(table,'activity_completions');return {select(){return this},eq(k,v){filter.push([k,v]);return this},order:async()=>({data:[{metadata:{state:{'spmb-step':'4'}}}]}),upsert:async(value,options)=>{row=value;assert.equal(options.onConflict,'plan_id,day_number,module_key');return {error:null}}}}};h.w.eval(block);
  assert.equal((await h.w.SPM_BREATHING_RECORDS.read('qa:p1'))['spmb-step'],'4');assert.deepEqual(filter,[['user_id','qa'],['plan_id','p1'],['module_key','resource:breathing_lab_state']]);
  await h.w.SPM_BREATHING_RECORDS.save({'spmb-step':'4'},'qa:p1',12);assert.equal(row.module_key,'resource:breathing_lab_state');assert.equal(row.day_number,12);assert.equal(row.user_id,'qa');assert.equal(row.plan_id,'p1');
  await assert.rejects(()=>h.w.SPM_BREATHING_RECORDS.save({'spmb-step':'4'},'qa:p1',13));await assert.rejects(()=>h.w.SPM_BREATHING_RECORDS.save({'spmb-step':'4'},'other:p1',12));
  assert.match(app,/filter\(x=>!x.module_key\?\.startsWith\('resource:'\)\)/);
 }finally{await h.close();}
});

function dailyProbe(h){
 const completions=[],continuations=[],assigned={id:'assigned-breathing',kind:'breathing'};
 const c=h.context(),active={id:assigned.id,scope:c.userId+':'+c.planId,day:c.day};
 h.w.SPM_DAILY_PRACTICE={
  active:()=>active,
  assignments:()=>[{id:'another-activity',kind:'sensate'},assigned],
  saveActivity:async(id,data,scope,day)=>completions.push({id,data:JSON.parse(JSON.stringify(data)),scope,day}),
  showContinuation:()=>continuations.push({outside:h.w.document.querySelector('iframe')===null})
 };
 return {completions,continuations,assigned};
}
function breathingSession(day=12){return {id:'breathing-record',day,date:'2026-11-13T10:00:00.000Z',practice:'guided',seconds:0,comfort:3,dizzy:false,noHold:true};}

test('closing a daily Breathing activity shows continuation outside the module without completing it',async()=>{
 const h=harness(),p=dailyProbe(h);try{
  await h.w.SPM_BREATHING_LAB.open({origin:'dailyPlan'});
  assert.equal(h.w.SPM_BREATHING_LAB_HOST.write('spmb-sessions',JSON.stringify([breathingSession()])),true);
  assert.equal(await h.w.SPM_BREATHING_LAB.close(),true);
  assert.equal(h.w.document.querySelector('dialog'),null);
  assert.equal(h.writes.length,1);
  assert.equal(p.completions.length,0);
  assert.deepEqual(p.continuations,[{outside:true}]);
 }finally{await h.close();}
});

test('Breathing recordDaily requires a real current-day session and completes the assignment by kind without a duration minimum',async()=>{
 const h=harness(),p=dailyProbe(h);try{
  await h.w.SPM_BREATHING_LAB.open({origin:'dailyPlan',day:27});
  const host=h.w.SPM_BREATHING_LAB_HOST;
  assert.equal(await host.recordDaily(),false);
  assert.equal(host.write('spmb-plan','[12]'),true);
  assert.equal(await host.recordDaily(),false);
  assert.equal(host.write('spmb-sessions',JSON.stringify([breathingSession(11)])),true);
  assert.equal(await host.recordDaily(),false);
  assert.equal(p.completions.length,0);
  assert.equal(host.write('spmb-sessions',JSON.stringify([breathingSession()])),true);
  h.setContext({...h.context(),day:13});
  assert.equal(await host.recordDaily(),false);
  h.setContext({...h.context(),day:12});
  assert.equal(await host.recordDaily(),true);
  assert.equal(h.writes.length,1);
  assert.equal(JSON.parse(h.writes[0].state['spmb-sessions'])[0].seconds,0);
  assert.deepEqual(p.completions,[{id:p.assigned.id,data:{confirmed:true,source:'breathing-lab'},scope:'qa:p1',day:12}]);
  assert.ok(h.w.document.querySelector('iframe'));
  assert.equal(p.continuations.length,0);
 }finally{await h.close();}
});

test('Breathing recordDaily retains the module on persistence or completion failure and supports retry',async()=>{
 const h=harness(),p=dailyProbe(h);try{
  await h.w.SPM_BREATHING_LAB.open({origin:'dailyPlan'});
  const host=h.w.SPM_BREATHING_LAB_HOST,persist=h.w.SPM_BREATHING_RECORDS.save,complete=h.w.SPM_DAILY_PRACTICE.saveActivity;
  assert.equal(host.write('spmb-sessions',JSON.stringify([breathingSession()])),true);
  h.w.SPM_BREATHING_RECORDS.save=async()=>{throw Error('offline')};
  assert.equal(await host.recordDaily(),false);
  assert.equal(p.completions.length,0);
  assert.equal(p.continuations.length,0);
  assert.ok(h.w.document.querySelector('iframe'));
  assert.equal(h.w.document.querySelector('[data-breathing-retry]').hidden,false);
  assert.equal(await h.w.SPM_BREATHING_LAB.close(),false);
  assert.equal(p.continuations.length,0);
  h.w.SPM_BREATHING_RECORDS.save=persist;
  h.w.SPM_DAILY_PRACTICE.saveActivity=async()=>{throw Error('completion offline')};
  assert.equal(await host.recordDaily(),false);
  assert.ok(h.w.document.querySelector('iframe'));
  assert.equal(p.completions.length,0);
  assert.equal(p.continuations.length,0);
  h.w.SPM_DAILY_PRACTICE.saveActivity=complete;
  assert.equal(await host.recordDaily(),true);
  assert.equal(p.completions.length,1);
  assert.equal(await h.w.SPM_BREATHING_LAB.close(),true);
  assert.deepEqual(p.continuations,[{outside:true}]);
 }finally{await h.close();}
});

test('Breathing library recording persists the session without completing or continuing a daily assignment',async()=>{
 const h=harness(),p=dailyProbe(h);try{
  await h.w.SPM_BREATHING_LAB.open({origin:'library'});
  const host=h.w.SPM_BREATHING_LAB_HOST;
  assert.equal(host.write('spmb-sessions',JSON.stringify([breathingSession()])),true);
  assert.equal(await host.recordDaily(),true);
  assert.equal(await h.w.SPM_BREATHING_LAB.close(),true);
  assert.equal(h.writes.length,1);
  assert.equal(p.completions.length,0);
  assert.equal(p.continuations.length,0);
 }finally{await h.close();}
});

test('Breathing returnToDesire reopens Desire after disposal without marking or showing daily continuation',async()=>{
 for(const origin of ['desire','dailyPlan']){
  const h=harness(),p=dailyProbe(h),returns=[];
  h.w.SPM_DESIRE_LAB={open:async opts=>returns.push({origin:opts.origin,outside:h.w.document.querySelector('iframe')===null})};
  try{
   await h.w.SPM_BREATHING_LAB.open({origin,returnToDesire:true});
   const host=h.w.SPM_BREATHING_LAB_HOST;
   assert.equal(host.write('spmb-sessions',JSON.stringify([breathingSession()])),true);
   assert.equal(await host.recordDaily(),true);
   assert.equal(await h.w.SPM_BREATHING_LAB.close(),true);
   assert.equal(h.writes.length,1);
   assert.equal(p.completions.length,0);
   assert.equal(p.continuations.length,0);
   assert.deepEqual(returns,[{origin:'dailyPlan',outside:true}]);
  }finally{await h.close();}
 }
});
