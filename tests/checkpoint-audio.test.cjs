const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');
const source=fs.readFileSync(path.join(__dirname,'../premium-v2/checkpoint-audio-v1.js'),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(){
 const dom=new JSDOM('<html><head></head><body><main></main></body></html>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,states=new WeakMap();
 const state=media=>{if(!states.has(media))states.set(media,{paused:true,time:0,duration:42,ended:false,error:null,plays:0,pauses:0,loads:0,pending:null});return states.get(media);};
 for(const [name,key] of Object.entries({paused:'paused',currentTime:'time',duration:'duration',ended:'ended',error:'error'}))Object.defineProperty(w.HTMLMediaElement.prototype,name,{configurable:true,get(){return state(this)[key];},set(value){state(this)[key]=value;}});
 w.HTMLMediaElement.prototype.play=function(){const s=state(this);s.plays++;s.paused=false;s.ended=false;s.error=null;this.dispatchEvent(new w.Event('play'));return s.pending||Promise.resolve();};
 w.HTMLMediaElement.prototype.pause=function(){const s=state(this);s.pauses++;if(!s.paused){s.paused=true;this.dispatchEvent(new w.Event('pause'));}};
 w.HTMLMediaElement.prototype.load=function(){state(this).loads++;};
 let nativeCalls=0,managedStops=0,videoPauses=0;
 w.speechSynthesis={speak(){nativeCalls++;}};
 w.SPM_PRACTICE_AUDIO={stop(){managedStops++;}};
 w.SPM_PROGRAM_VIDEOS={pause(){videoPauses++;}};
 w.eval(source);
 const mount=(key='intro')=>{
  const shell=w.document.createElement('section');
  shell.innerHTML=w.SPM_CHECKPOINT_AUDIO.markup({src:'/premium-v2/assets/audio/checkpoints/'+key+'.mp3',text:'Escucha esta explicación. Elige de cero a cuatro, o no evaluable.'});
  w.document.querySelector('main').append(shell);w.SPM_CHECKPOINT_AUDIO.bind(shell);
  const root=shell.querySelector('[data-checkpoint-audio]'),audio=root.querySelector('audio'),button=root.querySelector('button');
  return{shell,root,audio,button,details:root.querySelector('details'),progress:root.querySelector('progress'),status:root.querySelector('[role=status]')};
 };
 return{dom,w,state,mount,counts:()=>({nativeCalls,managedStops,videoPauses}),close:()=>dom.window.close()};
}
test('checkpoint presents play, progress and a closed transcript without a speaker or native controls',()=>{
 const f=setup();try{
  const r=f.mount();assert.equal(r.details.open,false);assert.equal(r.audio.hidden,true);assert.equal(r.audio.preload,'none');assert.equal(r.audio.controls,false);assert.equal(r.audio.autoplay,false);
  assert.equal(r.button.textContent,'▶Escuchar explicación');assert.equal(r.button.getAttribute('aria-controls'),r.audio.id);assert.equal(r.root.querySelector('svg'),null);assert.doesNotMatch(r.root.textContent,/🔈|🔊|bocina/i);
  assert.equal(r.details.querySelector('summary').textContent,'Leer explicación');assert.match(r.details.textContent,/Elige de cero a cuatro/);assert.equal(f.state(r.audio).plays,0);
  assert.equal(f.w.SPM_CHECKPOINT_AUDIO.markup({text:'Missing source'}),'');
 }finally{f.close();}
});
test('play and pause preserve position, resume continues, and the natural end resets for replay',async()=>{
 const f=setup();try{
  const r=f.mount();f.w.SPM_CHECKPOINT_AUDIO.bind(r.shell);r.button.click();await tick();
  assert.equal(f.state(r.audio).plays,1);assert.equal(r.button.dataset.state,'playing');assert.equal(r.button.getAttribute('aria-pressed'),'true');assert.match(r.button.textContent,/ⅡPausar/);assert.equal(r.details.open,false);
  f.state(r.audio).time=13;r.audio.dispatchEvent(new f.w.Event('timeupdate'));assert.equal(r.progress.value,13);assert.equal(r.root.querySelector('[data-checkpoint-audio-time]').textContent,'0:13 / 0:42');
  r.button.click();assert.equal(r.audio.paused,true);assert.equal(r.audio.currentTime,13);assert.equal(r.button.dataset.state,'paused');assert.match(r.button.textContent,/Continuar/);
  r.button.click();await tick();assert.equal(r.audio.currentTime,13);assert.equal(f.state(r.audio).plays,2);assert.equal(r.audio.paused,false);
  f.state(r.audio).ended=true;f.state(r.audio).paused=true;r.audio.dispatchEvent(new f.w.Event('ended'));assert.equal(r.audio.currentTime,0);assert.equal(r.button.dataset.state,'idle');
  r.button.click();await tick();assert.equal(f.state(r.audio).plays,3);assert.equal(r.audio.currentTime,0);assert.equal(r.button.dataset.state,'playing');
 }finally{f.close();}
});
test('only one explanation plays, scoped stop leaves the other alone, and other media stops narration',async()=>{
 const f=setup();try{
  const a=f.mount('one'),b=f.mount('two');a.button.click();await tick();f.state(a.audio).time=7;b.button.click();await tick();
  assert.equal(a.audio.paused,true);assert.equal(a.audio.currentTime,0);assert.equal(a.button.dataset.state,'idle');assert.equal(b.audio.paused,false);
  f.w.SPM_CHECKPOINT_AUDIO.stop(a.shell);assert.equal(b.audio.paused,false);
  const video=f.w.document.createElement('video');f.w.document.body.append(video);await video.play();assert.equal(b.audio.paused,true);assert.equal(b.button.dataset.state,'idle');
  a.button.click();await tick();assert.equal(video.paused,true);assert.ok(f.counts().managedStops>=3);assert.ok(f.counts().videoPauses>=3);
  f.w.SPM_CHECKPOINT_AUDIO.stop();assert.equal(a.audio.paused,true);assert.equal(a.button.dataset.state,'idle');
 }finally{f.close();}
});
test('recording failures expose the matching explanation without using browser speech',async()=>{
 const f=setup();try{
  const r=f.mount();r.button.click();await tick();f.state(r.audio).error={code:4};r.audio.dispatchEvent(new f.w.Event('error'));
  assert.equal(r.button.dataset.state,'error');assert.equal(r.details.open,true);assert.equal(r.status.hidden,false);assert.match(r.status.textContent,/leer la explicación/);assert.equal(r.audio.paused,true);assert.equal(f.counts().nativeCalls,0);
  r.button.click();await tick();assert.equal(r.button.dataset.state,'playing');assert.equal(r.status.hidden,true);
  r.button.click();const rejected=Promise.reject(new Error('Playback blocked'));f.state(r.audio).pending=rejected;r.button.click();await tick();assert.equal(r.button.dataset.state,'error');assert.equal(r.details.open,true);assert.equal(f.counts().nativeCalls,0);
 }finally{f.close();}
});
test('late play promises and queued events cannot resurrect stopped or superseded playback',async()=>{
 const f=setup();try{
  const r=f.mount();let resolve;f.state(r.audio).pending=new Promise(done=>{resolve=done;});r.button.click();assert.equal(r.button.dataset.state,'loading');
  r.button.click();assert.equal(r.button.dataset.state,'paused');f.state(r.audio).pending=null;r.button.click();await tick();assert.equal(r.button.dataset.state,'playing');resolve();await tick();assert.equal(r.audio.paused,false);assert.equal(r.button.dataset.state,'playing');
  r.audio.dispatchEvent(new f.w.Event('pause'));r.audio.dispatchEvent(new f.w.Event('error'));assert.equal(r.button.dataset.state,'playing');
  f.w.SPM_CHECKPOINT_AUDIO.stop();assert.equal(r.button.dataset.state,'idle');
  let reject;f.state(r.audio).pending=new Promise((_,fail)=>{reject=fail;});r.button.click();f.w.SPM_CHECKPOINT_AUDIO.stop();reject(new Error('Late rejection'));await tick();assert.equal(r.button.dataset.state,'idle');assert.equal(r.status.hidden,true);assert.equal(r.details.open,false);
 }finally{f.close();}
});
test('detaching the source, session/context changes and hiding the page stop playback',async()=>{
 const f=setup();try{
  for(const event of ['spm:session-change','spm:resourcecontext','pagehide']){const r=f.mount(event);r.button.click();await tick();f.state(r.audio).time=9;f.w.dispatchEvent(new f.w.Event(event));assert.equal(r.audio.paused,true);assert.equal(r.audio.currentTime,0);assert.equal(r.button.dataset.state,'idle');}
  const hidden=f.mount('hidden');hidden.button.click();await tick();Object.defineProperty(f.w.document,'hidden',{configurable:true,value:true});f.w.document.dispatchEvent(new f.w.Event('visibilitychange'));assert.equal(hidden.audio.paused,true);assert.equal(hidden.button.dataset.state,'idle');Object.defineProperty(f.w.document,'hidden',{configurable:true,value:false});
  const detached=f.mount('detached');let completeOldPlay;f.state(detached.audio).pending=new Promise(done=>{completeOldPlay=done;});detached.button.click();detached.shell.remove();await tick();assert.equal(detached.audio.paused,true);assert.equal(detached.audio.getAttribute('src'),null);const plays=f.state(detached.audio).plays;detached.button.click();assert.equal(f.state(detached.audio).plays,plays);
  f.state(detached.audio).pending=null;f.w.document.body.append(detached.shell);f.w.SPM_CHECKPOINT_AUDIO.bind(detached.shell);detached.button.click();await tick();assert.equal(f.state(detached.audio).plays,plays+1);assert.equal(detached.button.dataset.state,'playing');completeOldPlay();await tick();assert.equal(detached.audio.paused,false);assert.equal(detached.button.dataset.state,'playing');assert.equal(f.w.document.querySelectorAll('#spmCheckpointAudioStyles').length,1);
 }finally{f.close();}
});
test('all three shipped checkpoint recordings match their current scripts, source paths and verified files at normal playback speed',async()=>{
 const f=setup();try{
  const repo=path.join(__dirname,'..');
  const manifest=JSON.parse(fs.readFileSync(path.join(repo,'docs/qa/checkpoint-audio-20261113.json'),'utf8'));
  assert.deepEqual(manifest.actions.map(action=>action.milestone).sort((a,b)=>a-b),[1,14,28]);
  assert.equal(new Set(manifest.actions.map(action=>action.path)).size,3);assert.equal(new Set(manifest.actions.map(action=>action.verifiedFile.sha256)).size,3);
  const context={userId:'recording-test',planId:'recording-plan',day:1};
  f.w.SPM_RESOURCE_CONTEXT=()=>context;f.w.SPM_DAILY_RECORDS={readCheckpoints:async()=>[]};f.w.SPM_DAILY_PRACTICE={open(){}};
  f.w.HTMLElement.prototype.scrollIntoView=function(){};
  f.w.document.querySelector('main').innerHTML='<div id="spmDailyWorkspace"></div>';
  f.w.eval(fs.readFileSync(path.join(repo,'premium-v2/program-checkpoint-v1.js'),'utf8'));
  for(const action of manifest.actions){
   assert.equal(action.text,f.w.SPM_PROGRAM_CHECKPOINT.narrations[action.milestone]);
   assert.equal(action.path,'premium-v2/assets/audio/checkpoint/checkpoint-'+action.milestone+'-v2.mp3');
   const bytes=fs.readFileSync(path.join(repo,action.path));assert.ok(bytes.length>1000);assert.equal(bytes.length,action.verifiedFile.size);assert.equal(createHash('sha256').update(bytes).digest('hex'),action.verifiedFile.sha256);
   assert.ok(action.verifiedFile.duration>0);assert.ok(Math.abs(action.verifiedFile.duration-action.duration)<0.2);
   context.day=action.milestone;await f.w.SPM_PROGRAM_CHECKPOINT.open({id:'program-checkpoint'},true);
   const wrapper=f.w.document.querySelector('[data-checkpoint-audio]'),audio=wrapper.querySelector('audio'),button=wrapper.querySelector('button');
   assert.equal(audio.getAttribute('src'),'/'+action.path);assert.equal(wrapper.querySelector('.spm-checkpoint-audio-transcript').textContent,action.text);
   button.click();await tick();assert.equal(button.dataset.state,'playing');assert.equal(audio.playbackRate,1,'synthesis speed is not applied again in the player');
   button.click();button.click();await tick();assert.equal(audio.playbackRate,1,'resuming retains normal playback speed');
  }
 }finally{f.close();}
});
