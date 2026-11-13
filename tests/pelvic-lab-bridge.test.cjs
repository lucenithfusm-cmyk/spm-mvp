const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('../labs/breathing/node_modules/jsdom');
const source=fs.readFileSync(require('node:path').join(__dirname,'../premium-v2/pelvic-lab-bridge-v1.js'),'utf8');
function harness(initial={},day=12){
 const dom=new JSDOM('<body><section id="plan"><div class="dayCard"><b class="dayNum">12</b><div class="pfi-mode-panel"><button class="pfi-launch">Entrenamiento actual</button></div></div></section><button id="logoutBtn">Salir</button></body>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 let c={userId:'qa-user',planId:'qa-plan',day,safety:'none',flags:[],checkins:[]};
 const writes=[];
 w.SPM_RESOURCE_CONTEXT=()=>c;
 w.SPM_PELVIC_RECORDS={read:async()=>initial,save:async(state,scope,day)=>{writes.push({state:JSON.parse(JSON.stringify(state)),scope,day});}};
 const classic=[];w.SPM_PELVIC_V2={open:opts=>classic.push(opts)};w.eval(source);
 return {w,writes,classic,setContext:x=>{c=x},trained:()=>classic.length,async close(){await w.SPM_PELVIC_LAB.close();w.close()}};
}
test('Lab saves only the active account/plan/day and preserves the training entry',async()=>{
 const h=harness({},19);try{await h.w.SPM_PELVIC_LAB.open({day:19,origin:'dailyPlan'});
 assert.ok(h.w.document.querySelector('.pfi-launch'));assert.ok(h.w.document.querySelector('iframe'));
 assert.equal(h.w.SPM_PELVIC_LAB_HOST.write('pf-step',3),true);
 await h.w.SPM_PELVIC_LAB.flush();assert.equal(h.writes.length,1);assert.equal(h.writes[0].scope,'qa-user:qa-plan');assert.equal(h.writes[0].day,19);assert.equal(h.writes[0].state['pf-step'],3);
 assert.equal(h.w.localStorage.length,0,'Clinical data must not fall back to unscoped browser storage');
 }finally{await h.close()}
});
test('account changes dispose the Lab before stale changes can be saved',async()=>{
 const h=harness();try{await h.w.SPM_PELVIC_LAB.open();h.w.SPM_PELVIC_LAB_HOST.write('pf-step',2);h.setContext({userId:'other',planId:'other',day:3,safety:'none'});
 h.w.dispatchEvent(new h.w.CustomEvent('spm:session-change',{detail:{userId:'other'}}));
 assert.equal(h.w.SPM_PELVIC_LAB_HOST,undefined);assert.equal(h.w.document.querySelector('iframe'),null);assert.equal(h.writes.length,0);
 }finally{await h.close()}
});
test('a failed cloud save retains the open module and supports retry',async()=>{
 const h=harness();try{await h.w.SPM_PELVIC_LAB.open();h.w.SPM_PELVIC_LAB_HOST.write('pf-step',4);
 let pauses=0;h.w.document.querySelector('iframe').contentWindow.addEventListener('spm:pelvic-pause',()=>pauses++);
 h.w.SPM_PELVIC_RECORDS.save=async()=>{throw Error('offline')};assert.equal(await h.w.SPM_PELVIC_LAB.close(),false);
 assert.equal(pauses,1,'leaving pauses the child even when its pending save fails');assert.ok(h.w.document.querySelector('iframe'));assert.equal(h.w.document.querySelector('[data-pf-retry]').hidden,false);
 h.w.SPM_PELVIC_RECORDS.save=async()=>{};assert.equal(await h.w.SPM_PELVIC_LAB.close(),true);
 }finally{await h.close()}
});
test('the selector retains the existing program and recommends preparation for unknown awareness',async()=>{
 const h=harness();try{await h.w.SPM_PELVIC_HUB.open();assert.match(h.w.document.querySelector('[data-pf-body]').textContent,/DOS VECES POR SEMANA/);assert.match(h.w.document.querySelector('[data-pf-body]').textContent,/Lab diario no sustituye/);assert.match(h.w.document.querySelector('[data-pf-body]').textContent,/RECOMENDADO PARA EMPEZAR/);
 h.w.document.querySelector('[data-pf-training]').click();await new Promise(r=>setTimeout(r,0));assert.equal(h.trained(),0);
 }finally{await h.close()}
});
test('pelvic symptoms and high tension keep contraction training paused',async()=>{
 const h=harness({'pf-checkins':[{at:new Date().toISOString(),tension:8,release:'Difícil'}]});try{await h.w.SPM_PELVIC_HUB.open();assert.equal(h.w.document.querySelector('[data-pf-training]').disabled,true);
 h.w.document.querySelector('[data-pf-education]').click();assert.equal(h.w.SPM_PELVIC_LAB_HOST.getContext().restriction,'relax');
 }finally{await h.close()}
});
test('unknown keys and malformed or oversized clinical values are rejected',async()=>{
 const h=harness();try{const valid=h.w.SPM_PELVIC_LAB.validState;
 assert.equal(valid({}),true);assert.equal(valid({'pf-step':28}),false);assert.equal(valid({password:'x'}),false);
 assert.equal(valid({'pf-results':[{completed:'yes'}]}),false);
 assert.equal(valid({'pf-screening':{aware:'ok',comp:['gluteos','gluteos','gluteos'],releaseOk:'si'}}),false);
 }finally{await h.close()}
});

 test('scheduled contractions stay in the classic module after persisted readiness',async()=>{
 const ready={'pf-screening':{aware:'ok',releaseOk:'si',comp:['mandibula','abdomen','gluteos']}};
 const h=harness(ready,2);try{await h.w.SPM_PELVIC_LAB.openScheduled({origin:'dailyPlan',day:2,activityId:'support-pelvic',intent:'scheduled'});assert.equal(h.trained(),1);assert.equal(h.classic[0].readiness(),'ready');assert.equal(h.classic[0].activityId,'support-pelvic');assert.equal(h.w.document.querySelector('iframe'),null);}finally{await h.close();}
 const beginner=harness({},2);try{await beginner.w.SPM_PELVIC_LAB.openScheduled({origin:'dailyPlan',day:2,intent:'scheduled'});assert.equal(beginner.trained(),0);assert.equal(beginner.w.document.querySelector('iframe'),null);assert.match(beginner.w.document.querySelector('[data-pf-body]').textContent,/reconocer la musculatura/);assert.ok(beginner.w.document.querySelector('[data-pf-daily]'));}finally{await beginner.close();}
 });
 test('original reported-control readiness is preserved and current pelvic tension overrides it',async()=>{
 const c={userId:'qa-user',planId:'qa-plan',day:2,safety:'none',flags:[],checkins:[],answers:{pf_awareness:'good_control',pf_tension:1}};
 const h=harness({},2);try{h.setContext(c);await h.w.SPM_PELVIC_LAB.openScheduled({origin:'dailyPlan',day:2,intent:'scheduled'});assert.equal(h.trained(),1);}finally{await h.close();}
 const ready=harness({'pf-screening':{aware:'ok',releaseOk:'si',comp:['mandibula','abdomen','gluteos']}},2);try{ready.setContext({...c,answers:{...c.answers,pf_tension:5}});await ready.w.SPM_PELVIC_LAB.openScheduled({origin:'dailyPlan',day:2,intent:'scheduled'});assert.equal(ready.trained(),0);assert.match(ready.w.document.querySelector('[data-pf-body]').textContent,/contracciones están en pausa/);}finally{await ready.close();}
 });

const dailyResult=(extra={})=>({practiceId:'percibe',completed:true,cleanContraction:null,fullRelease:true,discomfort:false,postTension:false,recommendation:'repeat',at:new Date().toISOString(),origin:'dailyPlan',day:12,activityId:'pelvic-daily-lab',intent:'daily-relax',...extra});
test('daily awareness remains relaxation-only even after readiness and exposes only ephemeral context',async()=>{
 const h=harness({'pf-screening':{aware:'ok',releaseOk:'si',comp:['mandibula','abdomen','gluteos']}});try{
  await h.w.SPM_PELVIC_LAB.openScheduled({origin:'dailyPlan',day:12,activityId:'pelvic-daily-lab',intent:'daily-relax'});
  const host=h.w.SPM_PELVIC_LAB_HOST,c=host.getContext();assert.equal(c.restriction,'relax');assert.equal(c.intent,'daily-relax');assert.equal(c.activityId,'pelvic-daily-lab');assert.equal(c.day,12);assert.equal(h.trained(),0);
  assert.equal(host.getState().intent,undefined);assert.equal(h.writes.length,0);
 }finally{await h.close();}
});
test('only a new completed matching Lab result offers confirmation; old, wrong-day and strength results do not',async()=>{
 const old=dailyResult({at:'2026-01-01T00:00:00.000Z'}),h=harness({'pf-daily-result':old,'pf-results':[old]}),accepted=[];let returned=0;
 try{await h.w.SPM_PELVIC_LAB.open({origin:'dailyPlan',day:12,activityId:'pelvic-daily-lab',onResult:r=>{accepted.push(r);return true;},onClose:()=>returned++});const host=h.w.SPM_PELVIC_LAB_HOST;
  assert.equal(host.onResult(old),false);
  for(const extra of [{day:11},{activityId:'main'},{intent:'scheduled'},{practiceId:'contrae'},{completed:false}])assert.equal(host.onResult(dailyResult(extra)),false);
  const fresh=dailyResult();assert.equal(host.write('pf-results',[old,fresh]),true);assert.equal(host.write('pf-daily-result',fresh),true);assert.equal(host.onResult(fresh),true);assert.equal(host.onResult(fresh),false);assert.equal(accepted.length,1);assert.equal(returned,0);
  await h.w.SPM_PELVIC_LAB.close();assert.equal(returned,1);assert.equal(h.writes.length,1);assert.equal(h.writes[0].day,12);
 }finally{await h.close();}
});
test('review and a changed plan day cannot accept a Lab completion or stale state write',async()=>{
 const h=harness();try{const c={userId:'qa-user',planId:'qa-plan',day:12,safety:'review',flags:[],checkins:[]};h.setContext(c);
  await h.w.SPM_PELVIC_LAB.open({origin:'dailyPlan',day:12,activityId:'pelvic-daily-lab',onResult:()=>true});const host=h.w.SPM_PELVIC_LAB_HOST;
  assert.equal(host.getContext().restriction,'review');assert.equal(host.onResult(dailyResult()),false);
  c.safety='none';c.day=13;assert.equal(host.onResult(dailyResult()),false);assert.equal(host.write('pf-step',4),false);
  h.w.dispatchEvent(new h.w.Event('spm:resourcecontext'));assert.equal(h.w.SPM_PELVIC_LAB_HOST,undefined);assert.equal(h.writes.length,0);
 }finally{await h.close();}
});
test('result validation preserves historical payloads and checks optional context metadata',async()=>{
 const h=harness();try{const valid=h.w.SPM_PELVIC_LAB.validState,legacy=dailyResult();delete legacy.day;delete legacy.intent;delete legacy.activityId;
  assert.equal(valid({'pf-results':[legacy]}),true);assert.equal(valid({'pf-results':[dailyResult()]}),true);
  for(const extra of [{day:29},{activityId:'another:plan'},{intent:'strength-daily'}])assert.equal(valid({'pf-results':[dailyResult(extra)]}),false);
 }finally{await h.close();}
});
test('classic callbacks reject stale or unrelated results and never substitute a Lab result',async()=>{
 const h=harness({'pf-screening':{aware:'ok',releaseOk:'si',comp:['mandibula','abdomen','gluteos']}},2),accepted=[];let returned=0;
 try{await h.w.SPM_PELVIC_LAB.openScheduled({day:2,activityId:'support-pelvic',intent:'scheduled',onResult:r=>{accepted.push(r);return true;},onClose:()=>returned++});const opened=h.classic[0];
  const r={source:'pelvic-classic-v2',completed:true,at:new Date().toISOString(),day:2,activityId:'support-pelvic',intent:'scheduled'};
  assert.equal(opened.onResult({...r,at:'2026-01-01T00:00:00Z'}),false);assert.equal(opened.onResult({...r,day:1}),false);assert.equal(opened.onResult({...r,source:'pelvic-floor-lab'}),false);
  assert.equal(opened.onResult(r),true);assert.equal(opened.onResult(r),false);assert.equal(accepted.length,1);assert.equal(returned,0);opened.onClose();assert.equal(returned,1);
  h.setContext({userId:'qa-user',planId:'other-plan',day:2,safety:'none'});assert.equal(opened.readiness(),'review');assert.equal(opened.onResult({...r,at:new Date().toISOString()}),false);
 }finally{await h.close();}
});
