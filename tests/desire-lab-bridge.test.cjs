const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../labs/breathing/node_modules/jsdom');
const source=fs.readFileSync(path.join(__dirname,'../premium-v2/desire-lab-bridge-v1.js'),'utf8');
function harness(extra={}){
 const dom=new JSDOM('<section id="plan"><div class="dayCard"></div></section><button id="logoutBtn">Salir</button>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 let c={userId:'qa',planId:'p1',day:12,safety:'none',flags:[],checkins:[],primary:'erection',secondary:'desire',motives:['erection','desire'],...extra};const writes=[];
 w.SPM_RESOURCE_CONTEXT=()=>c;w.SPM_DESIRE_RECORDS={read:async()=>({}),save:async(state,scope,day)=>writes.push({state,scope,day})};w.eval(source);
 return {w,writes,context:()=>c,setContext:next=>{c=next},async close(){await w.SPM_DESIRE_LAB.close();w.close();}};
}
test('DE + deseo and EP + deseo link to the module using the active Central day',async()=>{
 for(const primary of ['erection','ejaculation']){const h=harness({primary});try{assert.equal(h.w.SPM_DESIRE_LAB.relevant(h.context()),true);await new Promise(r=>setTimeout(r,30));assert.equal(h.w.document.querySelector('[data-desire-daily]'),null);assert.ok(h.w.document.querySelector('#spmDesireLabEntry button'));await h.w.SPM_DESIRE_LAB.open({origin:primary==='erection'?'erectile':'ejaculation',day:27});assert.equal(h.w.SPM_DESIRE_LAB_HOST.getContext().day,12);assert.match(h.w.document.querySelector('iframe').src,/origin=dailyPlan/);}finally{await h.close();}}
});
test('a standalone primary Desire route is relevant; unrelated profiles remain optional',async()=>{const h=harness();try{assert.equal(h.w.SPM_DESIRE_LAB.relevant({primary:'desire'}),true);assert.equal(h.w.SPM_DESIRE_LAB.relevant({primary:'erection'}),false);}finally{await h.close();}});
test('module state is saved under the active user/plan and never browser local storage',async()=>{const h=harness();try{await h.w.SPM_DESIRE_LAB.open();assert.equal(h.w.SPM_DESIRE_LAB_HOST.write('spm-desire-state','{"zones":["neck"]}'),true);await h.w.SPM_DESIRE_LAB.flush();assert.equal(h.writes[0].scope,'qa:p1');assert.equal(h.writes[0].day,12);assert.equal(h.w.localStorage.length,0);assert.equal(h.writes[0].state['spm-desire-state'],'{"zones":["neck"]}');}finally{await h.close();}});
test('account changes invalidate the old bridge and pending writes',async()=>{const h=harness();try{await h.w.SPM_DESIRE_LAB.open();const old=h.w.SPM_DESIRE_LAB_HOST;h.setContext({...h.context(),userId:'other'});assert.equal(old.write('spm-desire-step','7'),false);h.w.dispatchEvent(new h.w.Event('spm:session-change'));assert.equal(h.w.SPM_DESIRE_LAB_HOST,undefined);assert.equal(h.writes.length,0);}finally{await h.close();}});
test('save failure retains the module for retry and does not claim success',async()=>{const h=harness();try{await h.w.SPM_DESIRE_LAB.open();h.w.SPM_DESIRE_LAB_HOST.write('spm-desire-step','7');h.w.SPM_DESIRE_RECORDS.save=async()=>{throw Error('offline')};assert.equal(await h.w.SPM_DESIRE_LAB.close(),false);assert.ok(h.w.document.querySelector('iframe'));assert.equal(h.w.document.querySelector('[data-desire-retry]').hidden,false);h.w.SPM_DESIRE_RECORDS.save=async()=>{};assert.equal(await h.w.SPM_DESIRE_LAB.close(),true);}finally{await h.close();}});
test('clinical review and urgent signals reach the child without changing scores or days',async()=>{const h=harness();try{await h.w.SPM_DESIRE_LAB.open();h.setContext({...h.context(),safety:'review'});assert.equal(h.w.SPM_DESIRE_LAB_HOST.getContext().restriction,'review');h.setContext({...h.context(),safety:'urgent'});assert.equal(h.w.SPM_DESIRE_LAB_HOST.getContext().restriction,'urgent');assert.equal(h.writes.length,0);}finally{await h.close();}});
test('read failures do not initialize empty data over existing progress',async()=>{const h=harness();try{h.w.SPM_DESIRE_RECORDS.read=async()=>{throw Error('offline')};assert.equal(await h.w.SPM_DESIRE_LAB.open(),false);assert.equal(h.w.SPM_DESIRE_LAB_HOST,undefined);assert.equal(h.w.document.querySelector('iframe'),null);assert.equal(h.writes.length,0);}finally{await h.close();}});
test('new transversal events open Desire and unknown state keys are rejected',async()=>{const h=harness();try{h.w.dispatchEvent(new h.w.CustomEvent('spm:open-lab',{detail:{lab:'desire',origin:'erectile'}}));await new Promise(r=>setTimeout(r,0));assert.ok(h.w.document.querySelector('iframe'));assert.equal(h.w.SPM_DESIRE_LAB_HOST.write('userId','other'),false);assert.equal(h.w.SPM_DESIRE_LAB.validState({'spm-desire-program':'x'.repeat(350001)}),false);}finally{await h.close();}});
test('curriculum is unchanged, internal labels removed, and the original Doctor SPM video is anchored',()=>{
 const lab=fs.readFileSync(path.join(__dirname,'../labs/desire/src/components/desire/DesireLab.tsx'),'utf8');assert.match(lab,/Conoce y explora tu deseo/);assert.doesNotMatch(lab,/Recursos recuperados|Simular plan diario|simulación/);assert.match(lab,/view === 1 \|\| view === 20/);
 const video=fs.readFileSync(path.join(__dirname,'../labs/desire/src/components/desire/DoctorDesireVideo.tsx'),'utf8');assert.match(video,/dr-spm-low-desire\.mp4/);assert.match(video,/playsInline/);assert.ok(fs.statSync(path.join(__dirname,'../premium-v2/assets/videos/dr-spm-low-desire.mp4')).size>1000000);
 const cycle=fs.readFileSync(path.join(__dirname,'../labs/desire/src/components/desire/DesireCycle.tsx'),'utf8');assert.match(cycle,/ctx.centralBlocked/);assert.doesNotMatch(cycle,/Selector de día \(QA lab\)/);
});
test('daily handoff preserves incomplete practices and requires both day-one exercises before completion',async()=>{
 const h=harness({day:1,primary:'desire'});let completed=0,next=0;
 h.w.SPM_DAILY_PRACTICE={active:()=>({id:'main',scope:'qa:p1',day:1}),saveActivity:async()=>completed++,showContinuation:()=>next++};
 try{
  await h.w.SPM_DESIRE_LAB.open({origin:'dailyPlan'});
  assert.equal(await h.w.SPM_DESIRE_LAB_HOST.finishDaily(true),false);assert.equal(completed,0);
  h.w.SPM_DESIRE_LAB_HOST.write('spm-desire-program',JSON.stringify({sessions:[{day:1,status:'completed',practiceId:'presence-5'}]}));
  assert.equal(await h.w.SPM_DESIRE_LAB_HOST.finishDaily(true),false);assert.equal(completed,0);
  h.w.SPM_DESIRE_LAB_HOST.write('spm-desire-program',JSON.stringify({sessions:[{day:1,status:'completed',practiceId:'presence-5'},{day:1,status:'completed',practiceId:'explore-new-stimulus'}]}));
  assert.equal(await h.w.SPM_DESIRE_LAB_HOST.finishDaily(true),true);assert.equal(completed,1);assert.equal(next,1);assert(!h.w.document.querySelector('dialog'));
  await h.w.SPM_DESIRE_LAB.open({origin:'dailyPlan'});assert.equal(await h.w.SPM_DESIRE_LAB_HOST.finishDaily(false),true);assert.equal(completed,1);assert.equal(next,2);
 }finally{await h.close();}
});
