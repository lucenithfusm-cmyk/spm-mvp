const fs=require('node:fs'),assert=require('node:assert/strict'),{test}=require('node:test');
const {JSDOM}=require('jsdom');
function harness(lang='es'){
 const dom=new JSDOM(`<html lang="${lang}"><button id="qNext">Next</button></html>`,{url:'https://spm.test',runScripts:'outside-only'}),w=dom.window;
 let pending=new Map(),seq=0,plays=0;w.setTimeout=f=>{pending.set(++seq,f);return seq};w.clearTimeout=id=>pending.delete(id);
 w.SPM_INSIGHT_AUDIO={es:{1:'one.mp3'},en:{1:'one.mp3'}};w.Audio=class{play(){plays++;return Promise.resolve()}pause(){}};
 w.eval(fs.readFileSync('premium-v2/evaluation-refresh-v1.js','utf8'));
 const $=s=>w.document.querySelector(s);let continued=0;
 function advance(id){w.SPM_INSIGHT_FLOW.advance(id,()=>continued++)}
 return {w,$,advance,continued:()=>continued,plays:()=>plays,pending,close:()=>w.close()};
}
for(const lang of ['es','en'])test(lang+': four insights with immediate navigation, no polling or repeated answers',()=>{
 const h=harness(lang);try{const shown=[];
 for(let n=1;n<=35;n++){
 h.advance('q'+n);
 if(n%4===0&&n<=16){assert.equal(h.continued(),n-1);shown.push(Number(h.$('.spmPosterWrap').dataset.insight));h.advance('q'+n);assert.equal(h.w.document.querySelectorAll('.spmRefresh').length,1);h.$('.spmPoster').click()}
 assert.equal(h.continued(),n);
 }
 assert.deepEqual(shown,[1,2,3,4]);h.advance('q3');assert.equal(h.$('.spmRefresh'),null);
 }finally{h.close()}
});
test('resume keeps milestones; reloading an open insight does not lose it; new assessment resets',()=>{
 const first=harness();let saved;try{for(let n=1;n<=8;n++){first.advance('q'+n);if(n===4)first.$('.spmPosterContinue').click()}saved=JSON.parse(JSON.stringify(first.w.SPM_INSIGHT_FLOW.snapshot()))}finally{first.close()}
 const second=harness();try{second.w.SPM_INSIGHT_FLOW.restore(saved);second.advance('q8');assert.equal(second.$('.spmPosterWrap').dataset.insight,'2');second.$('.spmPosterContinue').click();second.advance('q7');assert.equal(second.$('.spmRefresh'),null);
 second.w.SPM_INSIGHT_FLOW.reset();for(let n=1;n<=4;n++)second.advance('q'+n);assert.equal(second.$('.spmPosterWrap').dataset.insight,'1');
 }finally{second.close()}
});
test('audio does not advance; changing language keeps the pending step; Escape advances once',()=>{
 const h=harness();try{for(let n=1;n<=4;n++)h.advance('q'+n);h.$('.spmInsightListen').click();assert.equal(h.plays(),1);assert.equal(h.continued(),3);
 h.w.document.documentElement.lang='en';h.w.dispatchEvent(new h.w.Event('spm:languagechange'));assert.equal(h.$('.spmPosterWrap').dataset.lang,'en');assert.equal(h.continued(),3);
 const btn=h.$('.spmPosterContinue');btn.dispatchEvent(new h.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));btn.click();assert.equal(h.continued(),4);assert.equal(h.pending.size,0);
 }finally{h.close()}
});
