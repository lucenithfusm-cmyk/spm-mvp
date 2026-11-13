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
  assert.ok(h.w.document.querySelector('#pv2Start'));assert.match(h.w.document.body.textContent,/realiza la serie guiada/);
  assert.equal(h.writes.length,0);assert.equal(h.results.length,0);
  assert.equal(h.w.SPM_PELVIC_V2.close(),true);assert.equal(h.closes(),1);
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
