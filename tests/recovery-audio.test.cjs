// Synthetic media and speech only; the production recovery and shared audio
// controllers run unchanged, together, in the same document as live.html.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../labs/breathing/node_modules/jsdom');
const read=file=>fs.readFileSync(path.join(__dirname,'../premium-v2',file),'utf8');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(predicate,message,timeout=1800){
 const start=Date.now();while(!predicate()){if(Date.now()-start>timeout)assert.fail(message);await wait(10);}
}

function harness(scenario='before',options={}){
 const turns=[['patient','Paciente uno'],['doctor','Doctor uno'],['patient','Paciente dos'],['doctor','Doctor dos']];
 const html=`<section class="spm-v4" data-spm-patient-scenario="${scenario}"><div class="spm-v4-head">CASO · HISTORIA GUIADA</div><div class="spm-v4-track">${turns.map(([who,text],i)=>`<article class="spm-v4-card ${who}" data-turn="${i}"><video ${who==='patient'?'class="spm-patient-master"':''} muted></video><div class="spm-v4-copy">${text}: ${scenario}.</div></article>`).join('')}</div><button class="spm-v4-play">Escuchar historia</button><button class="spm-v4-pause">Pausar audio</button><div class="spm-v4-wave"></div><div class="spm-v4-status" role="status"></div><audio class="spm-patient-story-audio" src="/assets/audio/recovery-patient-${scenario}-es.mp3"></audio></section>`;
 const dom=new JSDOM(html,{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only'}),w=dom.window,d=w.document;
 w.HTMLElement.prototype.scrollIntoView=function(){};
 const watchdogs=[],schedule=w.setTimeout.bind(w);
 if(options.captureWatchdogs)w.setTimeout=(callback,delay,...args)=>{
  if(delay>=1000){watchdogs.push(()=>callback(...args));return 1000000+watchdogs.length;}
  return schedule(callback,delay,...args);
 };
 const starts=[],canceled=[],media=new WeakMap();
 const mediaState=el=>{if(!media.has(el))media.set(el,{paused:true,time:0});return media.get(el);};
 Object.defineProperties(w.HTMLMediaElement.prototype,{
  paused:{configurable:true,get(){return mediaState(this).paused;}},
  readyState:{configurable:true,get(){return 4;}},
  duration:{configurable:true,get(){return 20;}},
  currentTime:{configurable:true,get(){return mediaState(this).time;},set(value){mediaState(this).time=value;w.setTimeout(()=>this.dispatchEvent(new w.Event('seeked')),0);}},
  ended:{configurable:true,get(){return mediaState(this).time>=20;}},
 });
 w.HTMLMediaElement.prototype.play=function(){
  const state=mediaState(this);if(state.paused){state.paused=false;if(this.matches('audio.spm-patient-story-audio'))starts.push('P');this.dispatchEvent(new w.Event('play'));}return Promise.resolve();
 };
 w.HTMLMediaElement.prototype.pause=function(){const state=mediaState(this);if(!state.paused){state.paused=true;this.dispatchEvent(new w.Event('pause'));}};
 w.HTMLMediaElement.prototype.load=function(){w.setTimeout(()=>this.dispatchEvent(new w.Event('loadedmetadata')),0);};

 let active=null,queued=[],speechPaused=false,reportedPending=false;
 const pump=()=>{
  if(active||speechPaused||!queued.length)return;
  const utterance=queued.shift();active=utterance;
  w.setTimeout(()=>{
   if(active!==utterance)return;
   if(utterance.text.startsWith('Doctor'))starts.push('D');
   utterance.onstart?.();
   if(utterance.text==='.')w.setTimeout(()=>{if(active===utterance)synthesis.end();},0);
  },0);
 };
 const synthesis={
  get active(){return active;},get speaking(){return !!active;},get pending(){return queued.length>0||reportedPending;},get paused(){return speechPaused;},
  getVoices:()=>[{name:'Jorge',lang:'es-CO'},{name:'Mónica',lang:'es-CO'}],
  speak(utterance){queued.push(utterance);pump();},
  cancel(){const old=active;active=null;queued=[];reportedPending=false;if(old){canceled.push(old.text);w.setTimeout(()=>old.onerror?.({error:'canceled'}),0);}},
  pause(){speechPaused=true;},resume(){speechPaused=false;pump();},
  end(){const old=active;active=null;if(old)old.onend?.();pump();},
  fail(error='synthesis-failed'){const old=active;active=null;if(old)old.onerror?.({error});pump();},
  clearWithoutEvent(pending=false){active=null;reportedPending=pending;},
  setReportedPending(value){reportedPending=value;},
 };
 w.speechSynthesis=synthesis;w.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 // Match the production order: shared narration registers its capture handler
 // before Recovery registers its own story controls.
 w.eval(read('practice-audio-v1.js'));w.eval(read('recovery-audio-controller-staging-v10.js'));
 const story=d.querySelector('.spm-v4'),audio=story.querySelector('audio');
 return {w,d,story,audio,synthesis,starts,canceled,
  activeTurn:()=>Number(story.querySelector('.spm-v4-card.active')?.dataset.turn??-1),
  status:()=>story.querySelector('.spm-v4-status').textContent,
  play:()=>story.querySelector('.spm-v4-play').click(),
  pause:()=>story.querySelector('.spm-v4-pause').click(),
  finishPatient(first){audio.currentTime=first?10:20;audio.dispatchEvent(new w.Event(first?'timeupdate':'ended'));},
  runWatchdog(){const next=watchdogs.shift();assert.ok(next,'A watchdog should have been scheduled');next();},
  close(){w.dispatchEvent(new w.Event('pagehide'));w.close();},
 };
}

for(const scenario of ['before','condom','during','early','urge','partner','next'])test(`${scenario}: all four turns play in patient, doctor, patient, doctor order`,async()=>{
 const h=harness(scenario);try{
  h.play();await until(()=>!h.audio.paused,'The first patient recording did not start');
  assert.equal(h.activeTurn(),0);h.finishPatient(true);
  await until(()=>h.synthesis.active?.text===`Doctor uno: ${scenario}.`&&h.starts.includes('D'),'The first doctor turn was canceled or skipped');
  await wait(30);assert.equal(h.synthesis.active?.text,`Doctor uno: ${scenario}.`,'The silent doctor video must not cancel the doctor voice');
  assert.deepEqual(h.starts,['P','D']);h.synthesis.end();
  await until(()=>h.activeTurn()===2&&!h.audio.paused,'The second patient recording did not start');
  h.finishPatient(false);
  await until(()=>h.synthesis.active?.text===`Doctor dos: ${scenario}.`&&h.starts.length===4,'The second doctor turn was canceled or skipped');
  await wait(30);assert.equal(h.synthesis.active?.text,`Doctor dos: ${scenario}.`);
  assert.deepEqual(h.starts,['P','D','P','D']);assert.deepEqual(h.canceled.filter(text=>text.startsWith('Doctor')),[]);
  h.synthesis.end();await until(()=>h.status().includes('Historia finalizada'),'A successfully completed story did not finish');
  assert.equal(h.story.querySelector('.spm-v4-wave').classList.contains('playing'),false);
 }finally{h.close();}
});

test('pause and resume keep both patient audio and the doctor turn in place; ended advances once',async()=>{
 const h=harness();try{
  h.play();await until(()=>!h.audio.paused,'Patient audio did not start');h.pause();
  assert.equal(h.audio.paused,true);assert.match(h.story.querySelector('.spm-v4-pause').textContent,/Continuar audio/);
  await wait(150);assert.equal(h.activeTurn(),0);
  h.pause();await until(()=>!h.audio.paused,'Patient audio did not resume');h.finishPatient(false);
  await until(()=>h.synthesis.active?.text==='Doctor uno: before.','Doctor voice did not start after ended');
  await wait(20);h.pause();assert.equal(h.synthesis.paused,true);
  await wait(180);assert.equal(h.activeTurn(),1);assert.equal(h.synthesis.active?.text,'Doctor uno: before.');
  h.pause();assert.equal(h.synthesis.paused,false);await wait(30);
  assert.equal(h.synthesis.active?.text,'Doctor uno: before.','Resuming the silent video must leave doctor speech active');
  h.synthesis.end();await until(()=>h.activeTurn()===2&&!h.audio.paused,'Patient two did not follow doctor one');
  assert.equal(h.starts.filter(s=>s==='D').length,1);
 }finally{h.close();}
});

test('a silent video cannot cancel speech owned by another controller',async()=>{
 const h=harness();try{
  const speech=new h.w.SpeechSynthesisUtterance('Narración de otro controlador');h.synthesis.speak(speech);
  await wait(20);const video=h.d.querySelector('.doctor video');video.muted=true;await video.play();await wait(20);
  assert.equal(h.synthesis.active,speech);assert.deepEqual(h.canceled,[]);
 }finally{h.close();}
});

test('shared narration still stops its own speech when another media player starts',async()=>{
 const h=harness();try{
  h.d.body.insertAdjacentHTML('beforeend',h.w.SPM_PRACTICE_AUDIO.button('Instrucción propia'));
  h.d.querySelector('[data-spm-speak]').click();await until(()=>h.synthesis.active?.text==='Instrucción propia','Shared narration did not start');
  await h.d.querySelector('.doctor video').play();await wait(20);
  assert.equal(h.synthesis.active,null);assert.ok(h.canceled.includes('Instrucción propia'));
 }finally{h.close();}
});

test('a doctor speech error stops at that turn without skipping ahead or reporting success',async()=>{
 const h=harness();try{
  h.play();await until(()=>!h.audio.paused,'Patient audio did not start');h.finishPatient(true);
  await until(()=>h.synthesis.active?.text==='Doctor uno: before.','Doctor voice did not start');await wait(20);
  h.synthesis.fail();await wait(400);
  assert.equal(h.activeTurn(),1);assert.deepEqual(h.starts,['P','D']);assert.equal(h.audio.paused,true);
  assert.equal(h.story.querySelector('.spm-v4-wave').classList.contains('playing'),false);
  assert.doesNotMatch(h.status(),/Historia finalizada/);assert.match(h.status(),/reintent|intenta|error|no.*audio|no.*voz|no.*reproducir/i);
 }finally{h.close();}
});

test('a patient recording error stops the story without silently advancing to the doctor',async()=>{
 const h=harness();try{
  h.play();await until(()=>!h.audio.paused,'Patient audio did not start');
  h.audio.dispatchEvent(new h.w.Event('error'));await wait(400);
  assert.equal(h.activeTurn(),0);assert.deepEqual(h.starts,['P']);assert.equal(h.audio.paused,true);
  assert.equal(h.story.querySelector('.spm-v4-wave').classList.contains('playing'),false);
  assert.doesNotMatch(h.status(),/Historia finalizada/);assert.match(h.status(),/reintentar/);
 }finally{h.close();}
});

test('an English doctor error clears queued turns and never reports a finished story',async()=>{
 const h=harness();try{
  h.w.SPM_LANG='en';h.story.querySelector('.spm-v4-head').textContent='CASE · GUIDED STORY';h.story.querySelector('.spm-v4-play').textContent='Listen to story';
  h.play();await until(()=>h.activeTurn()===0&&h.synthesis.active?.text==='Paciente uno: before.','English patient speech did not start');
  h.synthesis.end();await until(()=>h.activeTurn()===1&&h.synthesis.active?.text==='Doctor uno: before.','English doctor speech did not start');
  h.synthesis.fail();await wait(100);
  assert.equal(h.activeTurn(),1);assert.equal(h.synthesis.active,null);assert.equal(h.synthesis.pending,false);
  assert.equal(h.story.querySelector('.spm-v4-wave').classList.contains('playing'),false);
  assert.doesNotMatch(h.status(),/Story finished/);assert.match(h.status(),/retry/);
 }finally{h.close();}
});

test('watchdog keeps speaking or pending turns alive and missing onend becomes an error, not completion',async()=>{
 const h=harness('before',{captureWatchdogs:true});try{
  h.play();await until(()=>!h.audio.paused,'Patient audio did not start');h.finishPatient(true);
  await until(()=>h.synthesis.active?.text==='Doctor uno: before.'&&h.starts.includes('D'),'Doctor voice did not start');
  const voice=h.synthesis.active;h.runWatchdog();
  assert.equal(h.synthesis.active,voice);assert.equal(h.activeTurn(),1);assert.deepEqual(h.starts,['P','D']);
  h.synthesis.clearWithoutEvent(true);h.runWatchdog();
  assert.equal(h.activeTurn(),1);assert.deepEqual(h.starts,['P','D']);assert.doesNotMatch(h.status(),/reintentar/);
  h.synthesis.setReportedPending(false);await wait(400);
  assert.equal(h.activeTurn(),1,'Polling speaking=false must not pretend an onend event occurred');assert.deepEqual(h.starts,['P','D']);
  h.runWatchdog();assert.equal(h.activeTurn(),1);assert.deepEqual(h.starts,['P','D']);
  assert.doesNotMatch(h.status(),/Historia finalizada/);assert.match(h.status(),/reintentar/);
  assert.equal(h.story.querySelector('.spm-v4-wave').classList.contains('playing'),false);
 }finally{h.close();}
});
