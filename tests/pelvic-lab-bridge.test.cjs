const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const source=fs.readFileSync(require('node:path').join(__dirname,'../premium-v2/pelvic-lab-bridge-v1.js'),'utf8');
function harness(initial={}){
 const dom=new JSDOM('<body><section id="plan"><div class="dayCard"><b class="dayNum">12</b><div class="pfi-mode-panel"><button class="pfi-launch">Entrenamiento actual</button></div></div></section><button id="logoutBtn">Salir</button></body>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 let c={userId:'qa-user',planId:'qa-plan',day:12,safety:'none',flags:[],checkins:[]};
 const writes=[];
 w.SPM_RESOURCE_CONTEXT=()=>c;
 w.SPM_PELVIC_RECORDS={read:async()=>initial,save:async(state,scope,day)=>{writes.push({state:JSON.parse(JSON.stringify(state)),scope,day});}};
 let trained=0;w.SPM_PELVIC_V2={open:()=>trained++};w.eval(source);
 return {w,writes,setContext:x=>{c=x},trained:()=>trained,async close(){await w.SPM_PELVIC_LAB.close();w.close()}};
}
test('Lab saves only the active account/plan/day and preserves the training entry',async()=>{
 const h=harness();try{await h.w.SPM_PELVIC_LAB.open({day:19,origin:'dailyPlan'});
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
 h.w.SPM_PELVIC_RECORDS.save=async()=>{throw Error('offline')};assert.equal(await h.w.SPM_PELVIC_LAB.close(),false);
 assert.ok(h.w.document.querySelector('iframe'));assert.equal(h.w.document.querySelector('[data-pf-retry]').hidden,false);
 h.w.SPM_PELVIC_RECORDS.save=async()=>{};assert.equal(await h.w.SPM_PELVIC_LAB.close(),true);
 }finally{await h.close()}
});
test('the selector retains the existing program and recommends preparation for unknown awareness',async()=>{
 const h=harness();try{await h.w.SPM_PELVIC_HUB.open();assert.match(h.w.document.querySelector('[data-pf-body]').textContent,/28 días/);assert.match(h.w.document.querySelector('[data-pf-body]').textContent,/RECOMENDADO PARA EMPEZAR/);
 h.w.document.querySelector('[data-pf-training]').click();await new Promise(r=>setTimeout(r,0));assert.equal(h.trained(),1);
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
