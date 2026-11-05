const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('../labs/breathing/node_modules/jsdom');
function harness(){
 const dom=new JSDOM('<button id="before">Pregunta</button><div id="quizCard"><span id="qCount">6 / 23</span></div>',{url:'https://spm.test',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 const timers=new Map();let seq=0,tick,plays=0;w.setInterval=f=>{tick=f};w.setTimeout=f=>{timers.set(++seq,f);return seq};w.clearTimeout=id=>timers.delete(id);
 w.SPM_INSIGHT_AUDIO={es:{1:'message.mp3'}};w.Audio=class{play(){plays++;return Promise.resolve()}pause(){}};
 w.document.querySelector('#before').focus();w.eval(fs.readFileSync('premium-v2/evaluation-refresh-v1.js','utf8'));tick();const show=timers.values().next().value;timers.clear();show();
 return{w,timers,plays:()=>plays,close:()=>dom.window.close()};
}
test('visible Continue button, image and background all dismiss the insight and restore focus',()=>{
 for(const selector of ['.spmPosterContinue','.spmPoster','.spmRefresh']){const h=harness();try{
  const d=h.w.document;assert.match(d.querySelector('.spmPosterContinue').textContent,/Continuar mi evaluación/);assert.equal(d.activeElement,d.querySelector('.spmPosterContinue'));
  d.querySelector(selector).click();assert.equal(d.querySelector('.spmRefresh'),null);assert.equal(d.activeElement.id,'before');assert.equal(h.timers.size,0);
 }finally{h.close()}}
});
test('audio control does not advance; Escape closes and cancels delayed audio',()=>{
 const h=harness();try{const d=h.w.document;d.querySelector('.spmPosterPlay').click();assert.ok(d.querySelector('.spmRefresh'));assert.equal(h.plays(),1);
 d.querySelector('.spmPosterContinue').dispatchEvent(new h.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(d.querySelector('.spmRefresh'),null);assert.equal(h.timers.size,0);
 }finally{h.close()}
});
