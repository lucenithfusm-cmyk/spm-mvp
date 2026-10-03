const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const root=path.join(__dirname,'../labs/pelvic-floor');
const {transformSync}=require(path.join(root,'node_modules/esbuild'));
function moduleAt(file,extra={}){
 const code=transformSync(fs.readFileSync(path.join(root,file),'utf8'),{loader:'ts',format:'cjs',target:'es2022'}).code;
 const context={module:{exports:{}},require:n=>n==='react'?{}:require(n),...extra};vm.runInNewContext(code,context);return context.module.exports;
}
function audioHarness(){
 const elements=[];let defer=null;
 class FakeAudio{
  constructor(){this.dataset={};this.currentTime=0;this.paused=true;this.events={};elements.push(this)}
  addEventListener(k,fn){this.events[k]=fn}load(){}pause(){this.paused=true}
  play(){this.paused=false;return defer?defer.promise:Promise.resolve()}
 }
 const api=moduleAt('src/lib/pf-audio.ts',{window:{},Audio:FakeAudio,document:{body:{appendChild(){}}}});
 return {api,elements,defer(){let resolve;defer={promise:new Promise(r=>resolve=r)};return resolve}};
}
test('the authenticated bridge works in an inherited-origin frame and rejects cross-origin access',()=>{
 const bridge={getState:()=>({})};assert.equal(moduleAt('src/lib/pf-host.ts',{window:{parent:{location:{origin:'null'},SPM_PELVIC_LAB_HOST:bridge},location:{origin:'https://spm.test'}}}).host,bridge);
 const parent={};Object.defineProperty(parent,'SPM_PELVIC_LAB_HOST',{get(){throw Error('SecurityError')}});assert.equal(moduleAt('src/lib/pf-host.ts',{window:{parent}}).host,null);
});
test('narration and phase cues reuse one player at the rendered speed',async()=>{
 const h=audioHarness();assert.equal(await h.api.playAudio('pf.s01.welcome'),true);const a=h.elements[0];a.currentTime=2;
 h.api.pauseAudio();assert.equal(a.paused,true);await h.api.resumeAudio();assert.equal(a.currentTime,2);
 assert.equal(await h.api.playAudio('pf.cue.rapida'),true);assert.equal(h.elements.length,1);assert.equal(a.playbackRate,1);assert.equal(a.currentTime,0);assert.match(a.src,/^audio\/pf\//);
 h.api.stopAudio();assert.equal(a.paused,true);assert.equal(a.currentTime,0);
});
test('pause cancels a still-loading play without reviving it after navigation',async()=>{
 const h=audioHarness(),resolve=h.defer(),play=h.api.playAudio('pf.s02.map');h.api.pauseAudio();resolve();assert.equal(await play,false);assert.equal(h.elements[0].paused,true);
 h.api.stopAudio();assert.equal(h.elements[0].currentTime,0);
});
test('all approved narrations and cues have local assets; short cues fit their phases',()=>{
 const data=moduleAt('src/lib/pf-data.ts'),audio=audioHarness().api.AUDIO_MANIFEST;
 assert.equal(Object.keys(audio).length,26);
 for(const screen of data.SCREENS){assert.ok(audio[screen.audioId]);assert.ok(fs.statSync(path.join(root,'public',audio[screen.audioId].src)).size>1000)}
 for(const p of Object.values(data.PRACTICES))for(const phase of data.buildPhases(p.demo)){
  const a=audio[phase.audioId];assert.ok(a,phase.audioId);assert.ok(a.duration<=phase.sec,`${phase.audioId} must finish within ${phase.sec}s`);assert.ok(fs.existsSync(path.join(root,'public',a.src)));
 }
 for(const [file,hash] of Object.entries({'pelvic-anatomy.jpg':'ebe828651ff5e96a391c83448e472a34b3eb405b2c62b4100451343fc33f48db','spm-trainer.jpg':'92cc823523d5b97082b3bd8f4ecb8d77729025f627b23955214095a0923e292c'}))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'src/assets',file))).digest('hex'),hash);
});
test('interrupted practices and active red flags never recommend progression',()=>{
 const {recommend}=moduleAt('src/lib/pf-data.ts');const r={practiceId:'contrae',completed:true,cleanContraction:true,fullRelease:true,discomfort:false,postTension:false};
 assert.equal(recommend({...r,completed:false},{flags:false,priorDiscomfort:false}),'repeat');
 assert.equal(recommend(r,{flags:true,priorDiscomfort:false}),'relax');
 assert.equal(recommend({...r,discomfort:true},{flags:true,priorDiscomfort:false}),'clinical-review');
});
