const {JSDOM}=require('jsdom');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.resolve(__dirname,'..');

function setup(language,{blocked=false}={}){
 const dom=new JSDOM('<!doctype html><html><head></head><body><div id="quizCard"><span id="qCount">6 / 31</span><h3>Pending question</h3><button id="qNext">Next question</button></div></body></html>',{url:'https://test.example/premium-v2/',runScripts:'outside-only'});
 const w=dom.window,jobs=new Map(),sounds=[];let timer=0,advances=0;
 w.SPM_LANG=language;w.document.querySelector('#qNext').onclick=()=>advances++;
 w.setInterval=()=>0;w.setTimeout=fn=>{jobs.set(++timer,fn);return timer};w.clearTimeout=id=>jobs.delete(id);
 w.Audio=class{constructor(src){this.src=src;this.currentTime=0;this.pauses=0;this.plays=0;sounds.push(this)}play(){this.plays++;if(blocked)return Promise.reject(Error('Autoplay blocked'));this.onplay?.();return Promise.resolve()}pause(){this.pauses++}};
 for(const file of ['assets/spm-insight-audio-v1.js','evaluation-refresh-v1.js'])w.eval(fs.readFileSync(path.join(dir,file),'utf8'));
 return{w,dom,sounds,q:s=>w.document.querySelector(s),flush(){for(const[id,fn]of [...jobs]){jobs.delete(id);fn()}},get advances(){return advances}};
}

(async()=>{
 for(const language of ['es','en']){
  const t=setup(language),{w,q}=t;
  for(let n=1;n<=4;n++){
   q('#qNext').focus();w.SPM_INSIGHTS_PREVIEW.open(n);
   assert(q('.spmPoster').src.includes(`insight-${n}-${language}.png`));
   const cta=q('.spmPosterContinue');assert(cta.closest('.spmPosterControls'));assert(!cta.closest('.spmPosterViewport'),'continue stays outside the scrolling image');assert(cta.textContent.includes(language==='es'?'Continuar':'Continue'));
   assert.equal(w.document.activeElement,cta);t.flush();const a=t.sounds.at(-1);assert(a.src.includes(`insight-${n}-${language}.mp3`));
   assert.equal(q('.spmInsightListen').getAttribute('aria-pressed'),'true');
   const ended=a.onended;ended();assert(!q('.spmRefresh'),'audio completion reveals the pending question');assert.equal(t.advances,0,'closing an Insight cannot skip an unanswered question');assert(a.pauses>0);assert.equal(a.onended,null);assert.equal(w.document.activeElement,q('#qNext'));
   w.SPM_INSIGHTS_PREVIEW.open(n);ended();assert(q('.spmRefresh'),'a stale audio event cannot dismiss a later Insight');q('.spmPosterContinue').click();assert(!q('.spmRefresh'));
   const before=t.sounds.length;t.flush();assert.equal(t.sounds.length,before,'manual continue cancels delayed autoplay');
   w.SPM_INSIGHTS_PREVIEW.open(n);q('.spmInsightListen').click();const manual=t.sounds.at(-1);t.flush();assert.equal(t.sounds.at(-1),manual,'manual play cannot be followed by a second autoplay');assert(q('.spmRefresh'),'audio controls must not advance');q('.spmInsightListen').click();assert(q('.spmRefresh'));assert.equal(q('.spmInsightListen').getAttribute('aria-pressed'),'false');assert.equal(manual.onended,null);q('.spmPoster').click();assert(!q('.spmRefresh'),'tapping the image continues');
  }
  w.SPM_INSIGHTS_PREVIEW.open(1);const poster=q('.spmPoster');poster.dispatchEvent(new w.MouseEvent('pointerdown',{bubbles:true,clientX:50,clientY:200}));poster.dispatchEvent(new w.MouseEvent('click',{bubbles:true,clientX:50,clientY:50}));assert(q('.spmRefresh'),'a scrolling gesture cannot skip the Insight');poster.click();assert(!q('.spmRefresh'));
  w.SPM_INSIGHTS_PREVIEW.open(2);q('.spmPosterPlay').click();assert(q('.spmRefresh'),'the audio button printed in the approved artwork still controls audio');q('.spmRefresh').click();assert(!q('.spmRefresh'),'tapping the surrounding background also continues');
  w.SPM_INSIGHTS_PREVIEW.open(3);q('.spmPosterContinue').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert(!q('.spmRefresh'));
  w.SPM_INSIGHTS_PREVIEW.open(4);t.flush();const old=t.sounds.at(-1);w.dispatchEvent(new w.Event('spm:languagechange'));assert(!q('.spmRefresh'));assert.equal(old.onended,null);assert.equal(t.advances,0);
  t.dom.window.close();console.log('PASS',language,'all four Insights: audio-end advance, visible button, image/background tap, no skipped questions, audio controls, scroll protection and cleanup');
 }
 const blocked=setup('es',{blocked:true});blocked.w.SPM_INSIGHTS_PREVIEW.open(1);blocked.flush();await Promise.resolve();assert(blocked.q('.spmRefresh'));assert(blocked.q('.spmPosterState').textContent.includes('Pulsa Escuchar'));blocked.q('.spmPosterContinue').click();assert(!blocked.q('.spmRefresh'));blocked.dom.window.close();
 const failed=setup('en');failed.w.SPM_INSIGHTS_PREVIEW.open(2);failed.flush();failed.sounds.at(-1).onerror();assert(failed.q('.spmRefresh'));assert(failed.q('.spmPosterState').textContent.includes('Continue'));failed.q('.spmPosterContinue').click();assert(!failed.q('.spmRefresh'));failed.dom.window.close();
 console.log('PASS autoplay rejection and audio errors leave manual continuation available');
})().catch(error=>{console.error(error);process.exitCode=1});
