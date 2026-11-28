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
 const context={module:{exports:{}},require:n=>n==='react'?{}:require(n.startsWith('.')?path.resolve(root,path.dirname(file),n):n),...extra};vm.runInNewContext(code,context);return context.module.exports;
}
function audioHarness(){
 const calls=[],voice={listen(text,options){calls.push({text,options});options.onstate?.({state:'playing'});return true;},pause(){calls.at(-1)?.options.onstate?.({state:'paused'});},resume(){calls.at(-1)?.options.onstate?.({state:'playing'});},cancel(){calls.at(-1)?.options.oncancel?.();}};
 const api=moduleAt('src/lib/pf-audio.ts',{window:{SPM_VOICE:voice}});return{api,calls};
}
test('the authenticated bridge works in an inherited-origin frame and rejects cross-origin access',()=>{
 const bridge={getState:()=>({})};assert.equal(moduleAt('src/lib/pf-host.ts',{window:{parent:{location:{origin:'null'},SPM_PELVIC_LAB_HOST:bridge},location:{origin:'https://spm.test'}}}).host,bridge);
 const parent={};Object.defineProperty(parent,'SPM_PELVIC_LAB_HOST',{get(){throw Error('SecurityError')}});assert.equal(moduleAt('src/lib/pf-host.ts',{window:{parent}}).host,null);
});
test('narration and phase cues use approved full text with the shared coordinator',async()=>{
 const h=audioHarness();assert.equal(await h.api.playAudio('pf.s01.welcome'),true);assert.match(h.calls[0].text,/Vamos a empezar/);assert.equal(h.calls[0].options.lang,'es-CO');h.api.pauseAudio();await h.api.resumeAudio();assert.equal(await h.api.playAudio('pf.cue.rapida'),true);assert.ok(h.calls[1].text);assert.equal(await h.api.playAudio('missing'),false);h.api.stopAudio();
});
test('all 26 approved spoken texts retain provenance; anatomy assets are unchanged',()=>{
 const data=moduleAt('src/lib/pf-data.ts'),audio=audioHarness().api.AUDIO_MANIFEST,provenance=JSON.parse(fs.readFileSync(path.join(root,'audio-provenance.json')));
 assert.equal(Object.keys(audio).length,26);
 for(const screen of data.SCREENS){assert.ok(audio[screen.audioId]);assert.equal(audio[screen.audioId].text,provenance.find(e=>e.id===screen.audioId).text);}
 for(const p of Object.values(data.PRACTICES))for(const phase of data.buildPhases(p.demo))assert.ok(audio[phase.audioId].text);
 for(const [file,hash] of Object.entries({'pelvic-anatomy.jpg':'ebe828651ff5e96a391c83448e472a34b3eb405b2c62b4100451343fc33f48db','spm-trainer.jpg':'92cc823523d5b97082b3bd8f4ecb8d77729025f627b23955214095a0923e292c'})){
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'src/assets',file))).digest('hex'),hash);
 }
});
test('interrupted practices and active red flags never recommend progression',()=>{
 const {recommend}=moduleAt('src/lib/pf-data.ts');const r={practiceId:'contrae',completed:true,cleanContraction:true,fullRelease:true,discomfort:false,postTension:false};
 assert.equal(recommend({...r,completed:false},{flags:false,priorDiscomfort:false}),'repeat');
 assert.equal(recommend(r,{flags:true,priorDiscomfort:false}),'relax');
 assert.equal(recommend({...r,discomfort:true},{flags:true,priorDiscomfort:false}),'clinical-review');
});
