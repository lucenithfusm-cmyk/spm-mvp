const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');

const read=file=>fs.readFileSync(path.join(__dirname,'../premium-v2',file),'utf8');
const clone=value=>JSON.parse(JSON.stringify(value));
const settle=()=>new Promise(resolve=>setTimeout(resolve,40));
const calendar=[
  [1,'dr-performance-anxiety'],[2,'dr-vascular'],[3,'breathing-guided'],
  [7,'anticipatory-failure'],[9,'dr-metabolic'],[10,'anxiety-regulation'],
  [14,'performance-anxiety'],[16,'sensory-focus'],[18,'partner-communication'],
  [21,'dr-medications'],[23,'dr-low-desire'],[28,'mental-preparation']
];

function mockSpeech(w){
  const speech={spoken:[],cancellations:0,current:null};
  w.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
  w.speechSynthesis={
    getVoices:()=>[{name:'Spanish test voice',lang:'es-CO'}],
    speak:utterance=>{speech.current=utterance;speech.spoken.push(utterance);},
    cancel:()=>{speech.cancellations++;speech.current=null;}
  };
  return speech;
}

async function harness({day=1,prior={},readError=false}={}){
  const dom=new JSDOM('<main id="plan"></main><section id="programVideos"></section>',{
    url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true
  });
  const w=dom.window,observers=[],NativeObserver=w.MutationObserver;
  w.MutationObserver=class extends NativeObserver{constructor(fn){super(fn);observers.push(this);}};
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.HTMLMediaElement.prototype.pause=function(){this.pauseCount=(this.pauseCount||0)+1;};
  w.HTMLMediaElement.prototype.load=function(){};
  w.HTMLMediaElement.prototype.play=function(){this.dispatchEvent(new w.Event('play'));return Promise.resolve();};
  const speech=mockSpeech(w);
  const c={userId:'video-qa',planId:'video-plan',primary:'desire',secondary:null,motives:['desire'],day,safety:'none',flags:[],checkins:[],completed:[]};
  const rows=clone(prior),writes=[];
  let failNext=false;
  w.SPM_RESOURCE_CONTEXT=()=>c;
  w.SPM_DAILY_RECORDS={
    read:async()=>{if(readError)throw Error('Synthetic record read failure');return clone(rows);},
    save:async(id,data,scope,savedDay)=>{
      if(failNext){failNext=false;throw Error('Synthetic network failure');}
      writes.push({id,data:clone(data),scope,day:savedDay});rows[id]=clone(data);
    }
  };
  for(const file of ['modules.js','practice-audio-v1.js','spm-video-library.js','program-videos-v1.js','spm-inline-video-player.js','daily-resource-plan-v1.js','daily-practice-v1.js'])w.eval(read(file));
  await settle();
  w.SPM_DAILY_PRACTICE.open({focus:false});
  return {
    w,c,rows,writes,speech,
    failNextSave(){failNext=true;},
    async showDay(nextDay){c.day=nextDay;w.dispatchEvent(new w.Event('spm:resourcecontext'));await settle();w.SPM_DAILY_PRACTICE.open({focus:false});},
    async openVideo(){const a=w.SPM_DAILY_PRACTICE.assignments().find(item=>item.kind==='video');assert.ok(a);await w.SPM_DAILY_PRACTICE.launch(a.id);return {a,form:w.document.querySelector('[data-daily-video]')};},
    close(){w.SPM_PRACTICE_AUDIO?.stop();observers.forEach(observer=>observer.disconnect());w.close();}
  };
}

test('all twelve videos offer a speaker before optional closed instructions without asking for a written idea',async()=>{
  const h=await harness();
  try{
    const titles=new Set();
    for(const [day,key] of calendar){
      await h.showDay(day);
      const {a,form}=await h.openVideo();
      assert.equal(a.videoKey,key);
      assert.doesNotMatch(a.summary,/anota una idea/i);
      assert.ok(form);
      assert.equal(form.querySelector('textarea'),null);
      const action=form.querySelector('[data-video-action]');
      assert.ok(action,`Day ${day}: the video must provide its action`);
      assert.equal(action.dataset.videoAction,key);
      assert.match(action.textContent,/Ponlo en práctica/);
      const expected=h.w.SPM_VIDEO_LIBRARY.find(video=>video.key===key).action;
      assert.ok(expected&&expected.title&&expected.context);
      assert.ok(action.textContent.includes(expected.title));
      assert.ok(action.textContent.includes(expected.context));
      const title=action.querySelector('.spm-video-action-title');
      const speaker=action.querySelector('button[data-spm-speak]');
      const transcript=action.querySelector('details[data-video-action-transcript]');
      assert.ok(speaker,`${key}: a visible speaker must be available`);
      assert.equal(title.nextElementSibling,speaker,'The speaker follows the action title');
      assert.ok(speaker.querySelector('svg'),'The action uses a speaker icon');
      assert.match(speaker.getAttribute('aria-label'),/Escuchar acción/);
      assert.ok(transcript);
      assert.equal(transcript.open,false,'The written instructions start collapsed');
      assert.equal(transcript.querySelector('summary').textContent,'Leer instrucciones');
      for(const text of action.querySelectorAll('p,ol'))assert.equal(text.closest('details'),transcript,'Long instructions stay inside the optional transcript');
      assert.equal(speaker.dataset.spmSpeak,h.w.SPM_VIDEO_ACTIONS.narration(key));
      for(const content of [expected.title,expected.context,...expected.steps,expected.note])assert.ok(speaker.dataset.spmSpeak.includes(content),`${key}: narration includes its complete instruction`);
      assert.equal(action.querySelectorAll('ol li').length,expected.steps.length);
      assert.ok(expected.steps.length>=2&&expected.steps.length<=3);
      expected.steps.forEach(step=>assert.ok(action.textContent.includes(step)));
      titles.add(expected.title);
      assert.ok(form.querySelector('[name="confirmed"]').required);
      speaker.click();
      assert.equal(h.speech.spoken.at(-1).text,speaker.dataset.spmSpeak);
      assert.equal(speaker.getAttribute('aria-pressed'),'true');
      assert.equal(transcript.open,false,'Playing audio does not force the written instructions open');
      speaker.click();
      assert.equal(speaker.getAttribute('aria-pressed'),'false');
      const player=form.querySelector('video');
      player.dispatchEvent(new h.w.Event('play'));
      player.dispatchEvent(new h.w.Event('ended'));
    }
    assert.equal(titles.size,12,'Each topic needs a distinct action');
    assert.equal(h.speech.spoken.length,12,'Each speaker plays its own action once');
    assert.equal(h.writes.length,0,'Opening or finishing playback never saves a practice');
    assert.deepEqual(h.c.completed,[]);
  }finally{h.close();}
});

test('the video registration shortcut opens its instructions and a checked confirmation saves only that video',async()=>{
  const h=await harness();
  try{
    const assignment=h.w.SPM_DAILY_PRACTICE.assignments().find(item=>item.kind==='video');
    h.w.document.querySelector(`[data-daily-confirm="${assignment.id}"]`).click();
    const form=h.w.document.querySelector('[data-daily-video]');
    assert.ok(form,'The shortcut must not bypass the video and its action');
    assert.ok(form.querySelector('[data-video-action="dr-performance-anxiety"]'));
    assert.equal(h.writes.length,0);
    await form.onsubmit({preventDefault(){}});
    assert.equal(h.writes.length,0,'An unchecked confirmation is not saved');
    form.querySelector('[name="confirmed"]').checked=true;
    await form.onsubmit({preventDefault(){}});
    assert.equal(h.writes.length,1);
    const saved=h.writes[0];
    assert.equal(saved.id,assignment.id);
    assert.equal(saved.data.videoKey,'dr-performance-anxiety');
    assert.equal(saved.data.activityKind,'video');
    assert.equal(saved.data.confirmed,true);
    assert.equal(saved.data.completed,true);
    assert.equal(saved.scope,'video-qa:video-plan');
    assert.equal(saved.day,1);
    assert.equal(saved.data.actionDone,undefined,'Review confirmation does not claim the suggested action was performed');
    assert.equal(saved.data.actionCompleted,undefined);
    assert.equal(h.c.day,1);
    assert.deepEqual(h.c.completed,[]);
    assert.equal(h.w.document.querySelector('#spmDailyComplete').disabled,true);
  }finally{h.close();}
});

test('old video notes survive a failed save, a retry, and reopening the new action screen',async()=>{
  const id='route-video-dr-performance-anxiety';
  const note='Mi observación anterior: atención y comodidad <sin presión>.';
  const h=await harness({prior:{[id]:{videoKey:'dr-performance-anxiety',activityKind:'video',reflection:note,confirmed:true,completed:true}}});
  try{
    const {form}=await h.openVideo();
    assert.equal(form.querySelector('textarea'),null);
    form.querySelector('[name="confirmed"]').checked=true;
    h.failNextSave();
    await form.onsubmit({preventDefault(){}});
    assert.equal(h.writes.length,0);
    assert.equal(h.rows[id].reflection,note);
    assert.equal(form.querySelector('[name="confirmed"]').checked,true);
    assert.equal(form.querySelector('[type="submit"]').disabled,false);
    assert.match(form.querySelector('[role="status"]').textContent,/No se pudo guardar/);
    await form.onsubmit({preventDefault(){}});
    assert.equal(h.writes.length,1);
    assert.equal(h.rows[id].reflection,note);
    const reopened=await h.openVideo();
    assert.equal(reopened.form.querySelector('textarea'),null);
    assert.ok(reopened.form.querySelector('[data-video-action="dr-performance-anxiety"]'));
    assert.equal(h.c.day,1);
  }finally{h.close();}
});

test('an open video cannot save into a different account, plan, day, or newly restricted session',async()=>{
  for(const change of [c=>c.userId='another-user',c=>c.planId='another-plan',c=>c.day=2,c=>c.safety='urgent']){
    const h=await harness();
    try{
      const {form}=await h.openVideo();
      form.querySelector('[name="confirmed"]').checked=true;
      change(h.c);
      await form.onsubmit({preventDefault(){}});
      assert.equal(h.writes.length,0);
      assert.match(form.querySelector('[role="status"]').textContent,/No se pudo guardar/);
    }finally{h.close();}
  }
});

test('a failed history load still permits viewing but cannot overwrite an earlier video note',async()=>{
  const id='route-video-dr-performance-anxiety';
  const prior={videoKey:'dr-performance-anxiety',activityKind:'video',reflection:'Nota guardada antes de perder la conexión.',confirmed:true,completed:true};
  const h=await harness({prior:{[id]:prior},readError:true});
  try{
    const {form}=await h.openVideo();
    assert.ok(form.querySelector('video'));
    assert.ok(form.querySelector('[data-video-action]'));
    assert.equal(form.querySelector('[type="submit"]').disabled,true);
    form.querySelector('[name="confirmed"]').checked=true;
    await form.onsubmit({preventDefault(){}});
    assert.equal(h.writes.length,0);
    assert.deepEqual(h.rows[id],prior);
    assert.equal(h.c.day,1);
  }finally{h.close();}
});

test('the shared player keeps the action matched to the video and clears it for unrelated media',async()=>{
  const h=await harness();
  try{
    for(const video of h.w.SPM_VIDEO_LIBRARY){
      h.w.SPM_NATIVE_VIDEO.open(video.url,video.title);
      const modal=h.w.document.querySelector('#spmVideoModal.on');
      const actions=modal.querySelectorAll('[data-video-action]');
      assert.equal(actions.length,1);
      assert.equal(actions[0].dataset.videoAction,video.key);
      assert.ok(actions[0].textContent.includes(video.action.title));
    }
    const video=h.w.SPM_VIDEO_LIBRARY.find(item=>item.key==='dr-performance-anxiety');
    h.w.SPM_NATIVE_VIDEO.open(new URL(video.url,h.w.document.baseURI).href+'?v=qa',video.title);
    assert.equal(h.w.document.querySelector('#spmVideoModal [data-video-action]').dataset.videoAction,video.key);
    h.w.SPM_NATIVE_VIDEO.open('https://spm.test/other-video.mp4','Otro recurso');
    assert.equal(h.w.document.querySelector('#spmVideoModal [data-video-action]'),null);
    h.w.document.querySelector('.spmVpClose').click();
    assert.equal(h.w.document.querySelector('#spmVideoModal.on'),null);
    assert.equal(h.w.document.querySelector('#spmVpVideo').getAttribute('src'),null);
    assert.equal(h.writes.length,0);
    assert.equal(h.c.day,1);
  }finally{h.close();}
});

test('the same actions accompany program-library videos without recording practice or advancing the day',async()=>{
  const h=await harness();
  try{
    const root=h.w.document.querySelector('#programVideos');
    const cleanup=h.w.SPM_PROGRAM_VIDEOS.mount(root,'erection');
    for(const article of root.querySelectorAll('article[data-video-key]')){
      const key=article.dataset.videoKey;
      const video=h.w.SPM_VIDEO_LIBRARY.find(item=>item.key===key);
      const action=article.querySelector('[data-video-action]');
      assert.ok(action,`${key}: action missing from program library`);
      assert.equal(action.dataset.videoAction,key);
      assert.ok(action.textContent.includes(video.action.title));
      article.querySelector('video').dispatchEvent(new h.w.Event('ended'));
    }
    cleanup();
    h.w.document.querySelector('#spmVideoLibrary [data-key="dr-performance-anxiety"]').click();
    assert.equal(h.w.document.querySelector('#spmVideoModal [data-video-action]').dataset.videoAction,'dr-performance-anxiety');
    assert.equal(h.writes.length,0);
    assert.equal(h.c.day,1);
    assert.deepEqual(h.c.completed,[]);
  }finally{h.close();}
});

test('loading the video catalog after the document is complete mounts one working library with all twelve action summaries',async()=>{
  const dom=new JSDOM('<main id="plan"></main>',{
    url:'https://spm.test/premium-v2/revision-programas-28-dias.html',runScripts:'outside-only',pretendToBeVisual:true
  });
  const w=dom.window,observers=[],NativeObserver=w.MutationObserver;
  w.MutationObserver=class extends NativeObserver{constructor(fn){super(fn);observers.push(this);}};
  w.HTMLMediaElement.prototype.pause=function(){};
  w.HTMLMediaElement.prototype.load=function(){};
  w.HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
  try{
    await new Promise(resolve=>{
      if(w.document.readyState==='complete')resolve();
      else w.addEventListener('load',resolve,{once:true});
    });
    assert.equal(w.document.readyState,'complete');
    w.eval(read('practice-audio-v1.js'));
    w.eval(read('spm-video-library.js'));
    w.eval(read('spm-inline-video-player.js'));
    const library=w.document.querySelector('#spmVideoLibrary');
    assert.ok(library,'The reviewer loads this script after DOMContentLoaded');
    assert.equal(library.querySelectorAll('button.spmPlay').length,12);
    assert.equal(library.querySelectorAll('.spm-video-action-preview').length,12);
    for(const card of library.querySelectorAll('.spmVideoCard')){
      const key=card.querySelector('[data-key]').dataset.key;
      const video=w.SPM_VIDEO_LIBRARY.find(item=>item.key===key);
      assert.ok(card.querySelector('.spm-video-action-preview').textContent.includes(video.action.title));
    }
    w.document.querySelector('#plan').appendChild(w.document.createElement('section'));
    await settle();
    assert.equal(w.document.querySelectorAll('#spmVideoLibrary').length,1);
    assert.equal(library.querySelectorAll('button.spmPlay').length,12);
    library.querySelector('[data-key="partner-communication"]').click();
    const action=w.document.querySelector('#spmVideoModal.on [data-video-action]');
    assert.ok(action);
    assert.equal(action.dataset.videoAction,'partner-communication');
    assert.ok(action.textContent.includes(w.SPM_VIDEO_LIBRARY.find(video=>video.key==='partner-communication').action.title));
  }finally{observers.forEach(observer=>observer.disconnect());w.close();}
});

test('video narration stops when video playback resumes, the daily view changes, or the shared player closes',async()=>{
  const h=await harness();
  try{
    let {form}=await h.openVideo();
    let speaker=form.querySelector('[data-spm-speak]');
    const player=form.querySelector('video'),pauses=player.pauseCount||0;
    speaker.click();
    assert.ok(player.pauseCount>pauses,'Narration pauses the video to avoid overlapping audio');
    player.dispatchEvent(new h.w.Event('play'));
    assert.equal(speaker.getAttribute('aria-pressed'),'false');
    speaker.click();
    h.w.SPM_DAILY_PRACTICE.library();
    assert.equal(speaker.getAttribute('aria-pressed'),'false','Leaving Today stops its narration');
    assert.equal(h.speech.current,null);

    const video=h.w.SPM_VIDEO_LIBRARY.find(item=>item.key==='dr-medications');
    h.w.SPM_NATIVE_VIDEO.open(video.url,video.title);
    const modal=h.w.document.querySelector('#spmVideoModal');
    speaker=modal.querySelector('[data-spm-speak]');
    speaker.click();
    assert.ok(h.speech.current);
    modal.querySelector('.spmVpClose').click();
    assert.equal(speaker.getAttribute('aria-pressed'),'false');
    assert.equal(h.speech.current,null,'Closing the player stops its spoken instruction');
    assert.equal(h.writes.length,0);
    assert.deepEqual(h.c.completed,[]);
  }finally{h.close();}
});

test('speakers inside program iframes work once and stop when their library is removed',async()=>{
  const h=await harness();
  try{
    const frame=h.w.document.createElement('iframe');h.w.document.body.appendChild(frame);
    const doc=frame.contentDocument,win=frame.contentWindow;
    win.HTMLMediaElement.prototype.pause=function(){this.pauseCount=(this.pauseCount||0)+1;};
    win.HTMLMediaElement.prototype.load=function(){};
    const root=doc.createElement('main');doc.body.appendChild(root);
    const cleanup=h.w.SPM_PROGRAM_VIDEOS.mount(root,'sensate');
    h.w.SPM_PRACTICE_AUDIO.install(doc);
    h.w.SPM_PRACTICE_AUDIO.install(doc);
    assert.equal(doc.querySelectorAll('#spmPracticeAudioStyles').length,1,'The embedded document receives one copy of the audio styling');
    const action=root.querySelector('[data-video-action="sensory-focus"]');
    const speaker=action.querySelector('[data-spm-speak]');
    speaker.click();
    assert.equal(h.speech.spoken.length,1,'Repeated installation cannot create duplicate speech handlers');
    assert.equal(h.speech.spoken[0].text,h.w.SPM_VIDEO_ACTIONS.narration('sensory-focus'));
    assert.equal(speaker.getAttribute('aria-pressed'),'true');
    h.w.SPM_PRACTICE_AUDIO.stop(h.w.document.querySelector('#plan'));
    assert.equal(speaker.getAttribute('aria-pressed'),'true','A scoped stop outside this iframe must not stop its audio');
    cleanup();await settle();
    assert.equal(speaker.getAttribute('aria-pressed'),'false');
    assert.equal(h.speech.current,null,'Unmounting the embedded library stops narration');
    assert.equal(h.writes.length,0);
    frame.remove();
  }finally{h.close();}
});

test('late speech callbacks cannot stop a newer utterance from the same speaker',async()=>{
  const h=await harness();
  try{
    const {form}=await h.openVideo();
    const speaker=form.querySelector('[data-spm-speak]');
    h.w.SPM_PRACTICE_AUDIO.install(h.w.document);
    speaker.click();const first=h.speech.spoken.at(-1);
    speaker.click();speaker.click();const second=h.speech.spoken.at(-1);
    assert.notEqual(first,second);
    assert.equal(h.speech.spoken.length,2);
    first.onend?.();first.onerror?.({error:'canceled'});
    assert.equal(speaker.getAttribute('aria-pressed'),'true');
    assert.equal(h.speech.current,second);
    assert.match(speaker.getAttribute('aria-label'),/Detener audio/);
    second.onend?.();
    assert.equal(speaker.getAttribute('aria-pressed'),'false');
    assert.match(speaker.getAttribute('aria-label'),/Escuchar acción/);
  }finally{h.close();}
});

test('unavailable speech and synthesis failures reveal readable instructions with an accessible message',async()=>{
  for(const failure of ['unavailable','synthesis-failed']){
    const h=await harness();
    try{
      const {form}=await h.openVideo();
      const action=form.querySelector('[data-video-action]');
      const speaker=action.querySelector('[data-spm-speak]');
      const transcript=action.querySelector('[data-video-action-transcript]');
      assert.equal(transcript.open,false);
      if(failure==='unavailable')h.w.speechSynthesis=undefined;
      speaker.click();
      if(failure==='synthesis-failed')h.speech.spoken.at(-1).onerror({error:failure});
      assert.equal(transcript.open,true,'The full instruction remains usable when audio fails');
      const status=action.querySelector('[data-spm-audio-status][role="status"]');
      assert.ok(status);
      assert.equal(status.hidden,false);
      assert.match(status.textContent,/audio|escuchar|voz/i);
      assert.equal(speaker.getAttribute('aria-pressed'),'false');
      assert.equal(h.writes.length,0);
    }finally{h.close();}
  }
});
