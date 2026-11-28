const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('../labs/breathing/node_modules/jsdom');
function harness(){
 const dom=new JSDOM('<button id="before">Pregunta</button><div id="quizCard"><span id="qCount">6 / 23</span></div>',{url:'https://spm.test',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 const timers=new Map();let seq=0,plays=0;w.setTimeout=f=>{timers.set(++seq,f);return seq};w.clearTimeout=id=>timers.delete(id);
 w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){plays++;u.onstart?.();}};w.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 w.eval(require('./helpers/device-voice-fixture.cjs').read('premium-v2/device-voice-v1.js'));
 w.document.querySelector('#before').focus();w.eval(fs.readFileSync('premium-v2/evaluation-refresh-v1.js','utf8'));w.SPM_INSIGHTS_PREVIEW.open(1);
 return{w,timers,plays:()=>plays,close:()=>dom.window.close()};
}
test('visible Continue button, image and background all dismiss the insight and restore focus',()=>{
 for(const selector of ['.spmPosterContinue','.spmPoster','.spmRefresh']){const h=harness();try{
  const d=h.w.document;assert.match(d.querySelector('.spmPosterContinue').getAttribute('aria-label'),/Continuar mi evaluación/);assert.equal(d.activeElement,d.querySelector('.spmPosterContinue'));
  d.querySelector(selector).click();assert.equal(d.querySelector('.spmRefresh'),null);assert.equal(d.activeElement.id,'before');assert.equal(h.timers.size,0);
 }finally{h.close()}}
});
test('audio control does not advance; Escape closes and cancels delayed audio',()=>{
 const h=harness();try{const d=h.w.document;d.querySelector('.spmPosterPlay').click();assert.ok(d.querySelector('.spmRefresh'));assert.equal(h.plays(),1);
 d.querySelector('.spmPosterContinue').dispatchEvent(new h.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(d.querySelector('.spmRefresh'),null);assert.equal(h.timers.size,0);
 }finally{h.close()}
});

test('reading the complete Insight never dismisses it or starts voice',()=>{const h=harness();try{const details=h.w.document.querySelector('.spmPosterControls details');details.querySelector('summary').click();assert.equal(details.open,true);assert.ok(h.w.document.querySelector('.spmRefresh'));assert.match(details.textContent,/No estamos mirando/);assert.equal(h.plays(),0);}finally{h.close();}});
