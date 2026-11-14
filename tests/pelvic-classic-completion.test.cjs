const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');
const source=fs.readFileSync(path.join(__dirname,'../premium-v2/pelvic-module-rebuild-v2.js'),'utf8');
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function setup(){
 const dom=new JSDOM('<body></body>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 let context={userId:'qa',planId:'plan',day:2},restriction='ready',fail=false,tick=null,closes=0;
 const writes=[],results=[];
 w.SPM_RESOURCE_CONTEXT=()=>context;
 w.SPM_SAVE_MODULE=async value=>{if(fail)throw Error('save failed');writes.push(value);return {ok:true};};
 w.setInterval=fn=>{tick=fn;return 1;};w.clearInterval=()=>{tick=null;};
 w.speechSynthesis={cancel(){},speak(){}};w.SpeechSynthesisUtterance=function(text){this.text=text;};
 w.eval(source);w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
 const options={origin:'dailyPlan',intent:'scheduled',activityId:'support-pelvic',readiness:()=>restriction,onResult:r=>{results.push(r);return true;},onClose:()=>closes++};
 const open=()=>w.SPM_PELVIC_V2.open(options);
 const select=step=>w.document.querySelector('[data-step="'+step+'"]').click();
 const complete=()=>{select(5);w.document.querySelector('#pv2Start').click();for(let i=0;i<420;i++){const current=tick;if(!current)break;current();}};
 return {w,writes,results,open,select,complete,closes:()=>closes,setFail:x=>{fail=x;},setRestriction:x=>{restriction=x;},setContext:x=>{context=x;},tick:()=>tick?.(),close:()=>w.close()};
}
test('reading or navigating to the last screen cannot register strength',async()=>{
 const h=setup();try{
  assert.equal(h.open(),true);h.select(6);h.w.document.querySelector('#pv2Next').click();await settle();
  assert.equal(h.w.document.querySelector('#spmPelvicV2').hidden,true);
  assert.equal(h.writes.length,0);assert.equal(h.results.length,0);
  assert.equal(h.closes(),1,'returns to daily callback without saving an incomplete series');
 }finally{h.close();}
});
test('only a completed real sequence with acknowledged save emits the fresh scoped result',async()=>{
 const h=setup();try{
  h.open();h.complete();assert.equal(h.w.document.querySelector('#pv2Phase').textContent,'COMPLETADO');
  assert.equal(h.writes.length,0);assert.equal(h.results.length,0,'the timer does not save by itself');
  h.setFail(true);h.w.document.querySelector('#pv2Save').click();await settle();
  assert.equal(h.writes.length,0);assert.equal(h.results.length,0);assert.match(h.w.document.body.textContent,/No se pudo guardar/);
  h.setFail(false);h.w.document.querySelector('#pv2Save').click();await settle();
  assert.equal(h.writes.length,1);assert.equal(h.results.length,1);
  assert.equal(h.writes[0].metadata.guided_completed,true);
  assert.equal(h.results[0].source,'pelvic-classic-v2');assert.equal(h.results[0].activityId,'support-pelvic');assert.equal(h.results[0].intent,'scheduled');assert.equal(h.results[0].day,2);assert.ok(Date.parse(h.results[0].at));
  assert.match(h.w.document.body.textContent,/Entrenamiento guardado/);
 }finally{h.close();}
});
test('pause, invalid readiness and a changed account cannot emit a completion',async()=>{
 const h=setup();try{
  h.open();h.select(5);h.w.document.querySelector('#pv2Start').click();h.tick();
  h.w.document.querySelector('#pv2Start').click();for(let i=0;i<500;i++)h.tick();
  assert.equal(h.w.document.querySelector('#pv2Phase').textContent,'CONTRAE');assert.equal(h.results.length,0);
  h.setRestriction('relax');h.w.SPM_PELVIC_V2.close();assert.equal(h.open(),false);
  h.setRestriction('ready');h.open();h.complete();h.setContext({userId:'another',planId:'other',day:2});
  h.w.document.querySelector('#pv2Save').click();await settle();assert.equal(h.writes.length,0);assert.equal(h.results.length,0);
 }finally{h.close();}
});

test('the original seven-step strength program uses premium posture images and a visual technique guide',()=>{
 const h=setup();try{
  assert.equal(h.open(),true);
  assert.equal(h.w.document.querySelectorAll('[data-step]').length,7);
  h.select(2);
  assert.match(h.w.document.querySelector('.pv2-main').textContent,/Posición inicial/);
  assert.equal(h.w.document.querySelectorAll('[data-pv2-position]').length,2);
  h.w.document.querySelector('[data-pv2-position="seated"]').click();
  assert.equal(h.w.document.querySelector('[data-pv2-position="seated"]').getAttribute('aria-pressed'),'true');
  assert.match(h.w.document.querySelector('.pv2-image img').getAttribute('src'),/spm-posture-seated/);
  h.select(4);
  assert.equal(h.w.document.querySelectorAll('[data-pv2-technique]').length,2);
  h.w.document.querySelector('[data-pv2-technique="contract"]').click();
  assert.match(h.w.document.querySelector('.pv2-technique-status').textContent,/elevar suavemente/);
  h.w.document.querySelector('[data-pv2-technique="relax"]').click();
  assert.match(h.w.document.querySelector('.pv2-technique-status').textContent,/reposo/);
  assert.equal(h.results.length,0,'learning pages cannot complete strength');
 }finally{h.close()}
});
test('the strength timer displays real contraction, release and rest stages but never completes on reading',()=>{
 const h=setup();try{
  h.open();h.select(5);
  assert.ok(h.w.document.querySelector('#pv2VisualCue'));
  assert.ok(h.w.document.querySelector('#pv2CueToggle'));
  assert.equal(h.w.document.querySelector('#pv2CueToggle').getAttribute('aria-pressed'),'false');
  h.w.document.querySelector('#pv2Start').click();
  assert.equal(h.w.document.querySelector('[data-pv2-state="CONTRAE"]').classList.contains('on'),true);
  for(let i=0;i<5;i++)h.tick();
  assert.equal(h.w.document.querySelector('#pv2Phase').textContent,'RELAJA');
  assert.equal(h.w.document.querySelector('[data-pv2-state="RELAJA"]').classList.contains('on'),true);
  h.w.document.querySelector('#pv2Start').click();
  for(let i=0;i<30;i++)h.tick();
  assert.equal(h.results.length,0);
  assert.equal(h.writes.length,0);
 }finally{h.close()}
});

// The final step is a navigation action, not a false exercise completion.
test('premium step buttons show the active/completed state with readable mobile labels',()=>{
 const h=setup();try{
  h.open();const nav=h.w.document.querySelector('.pv2-progress');
  assert.equal(nav.querySelectorAll('.pv2-step').length,7);
  h.select(3);assert.equal(nav.querySelector('[aria-current="step"]').dataset.step,'3');
  assert.equal(nav.querySelectorAll('.pv2-step.done').length,3);
  assert.match(h.w.document.head.textContent,/white-space:normal/);
  h.select(6);assert.match(h.w.document.querySelector('#pv2Next').textContent,/Finalizar y volver a mi día/);
 }finally{h.close();}
});
test('final button saves a completed sequence then returns to the assigned day',async()=>{
 const h=setup();try{
  h.open();h.complete();h.select(6);h.w.document.querySelector('#pv2Next').click();await settle();
  assert.equal(h.writes.length,1);assert.equal(h.results.length,1);assert.equal(h.closes(),1);
  assert.equal(h.w.document.querySelector('#spmPelvicV2').hidden,true);
 }finally{h.close();}
});
test('final button keeps the session open and retries after a failed save',async()=>{
 const h=setup();try{
  h.open();h.complete();h.select(6);h.setFail(true);
  h.w.document.querySelector('#pv2Next').click();await settle();
  assert.equal(h.w.document.querySelector('#spmPelvicV2').hidden,false);
  assert.equal(h.writes.length,0);assert.equal(h.closes(),0);
  assert.match(h.w.document.querySelector('.pv2-save-status').textContent,/No se pudo guardar/);
  h.setFail(false);h.w.document.querySelector('#pv2Next').click();await settle();
  assert.equal(h.w.document.querySelector('#spmPelvicV2').hidden,true);
  assert.equal(h.writes.length,1);assert.equal(h.results.length,1);assert.equal(h.closes(),1);
 }finally{h.close();}
});
