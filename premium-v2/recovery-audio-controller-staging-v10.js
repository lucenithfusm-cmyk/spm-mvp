(()=>{'use strict';
if(window.SPM_RECOVERY_AUDIO_CONTROLLER_V10)return;
window.SPM_RECOVERY_AUDIO_CONTROLLER_V10=true;
window.SPM_RECOVERY_AUDIO_CONTROLLER_V9=true;window.SPM_RECOVERY_AUDIO_CONTROLLER_V8=true;window.SPM_RECOVERY_AUDIO_CONTROLLER_V7=true;
const synth=window.speechSynthesis;
let root=null,activeVideo=null,activeAudio=null,paused=false,run=0;
const isEn=r=>{const text=(r?.querySelector('.spm-v4-play')?.textContent||'')+' '+(r?.querySelector('.spm-v4-head')?.textContent||'');if(/Escuchar historia|CASO|ÉL /i.test(text))return false;if(/Listen to story|CASE|HE /i.test(text))return true;return String(window.SPM_LANGUAGE?.get?.()||window.SPM_LANG||'es').toLowerCase().startsWith('en')};
const MALE=/jorge|diego|carlos|enrique|juan|miguel|alvaro|álvaro|alejandro|antonio|pablo|andres|andrés|mateo|martin|martín|daniel|alex|aaron|arthur|fred|ralph|tom|oliver|james|gordon|lee|eddy|reed|rocko/i;
const FEMALE=/monica|mónica|paulina|luciana|sofia|sofía|carmen|helena|isabel|laura|maria|maría|salome|salomé|samantha|victoria|karen|moira|tessa|fiona|ava|allison|susan|serena|kate/i;
const PATIENT_SEGMENTS={before:[7.95,8.23],condom:[5.56,5.84],during:[6.90,7.07],early:[5.50,5.87],next:[7.02,7.17],partner:[5.45,5.88],urge:[6.94,7.21]};
function voices(r){const all=synth?.getVoices?.()||[],prefix=isEn(r)?'en':'es',local=all.filter(v=>String(v.lang||'').toLowerCase().startsWith(prefix));const patient=local.find(v=>MALE.test(v.name))||local.find(v=>!FEMALE.test(v.name))||null;const doctor=local.find(v=>FEMALE.test(v.name)&&v!==patient)||local.find(v=>v!==patient)||local[0]||null;return{patient,doctor}}
function status(r,who,msg){const s=r?.querySelector('.spm-v4-status');if(s)s.innerHTML=who?'<strong>'+who+':</strong> '+msg:msg}
function resetPause(r){const b=r?.querySelector('.spm-v4-pause');if(b)b.textContent='⏸ '+(isEn(r)?'Pause audio':'Pausar audio')}
function resetDoctorFrame(v){try{v.loop=false;const seek=()=>{try{v.currentTime=.04}catch{}};if(v.readyState>=2)seek();else v.addEventListener('loadeddata',seek,{once:true})}catch{}}
function stopVisual(){if(activeVideo){const v=activeVideo;try{v.pause();if(v.closest?.('.spm-v4-card.doctor'))resetDoctorFrame(v)}catch{}activeVideo=null}}
function stop(){run++;paused=false;try{synth?.cancel?.()}catch{};if(activeAudio){try{activeAudio.pause()}catch{}activeAudio=null}stopVisual();document.querySelectorAll('.spm-v4 video').forEach(v=>{try{v.pause();v.muted=true;v.loop=false}catch{}});if(root){root.querySelector('.spm-v4-wave')?.classList.remove('playing');resetPause(root)}root=null}
function setCard(r,i){const cards=[...r.querySelectorAll('.spm-v4-card')];cards.forEach((c,n)=>c.classList.toggle('active',n===i));cards[i]?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});return cards[i]}
function visual(card,patient,second=false){stopVisual();const v=patient?card?.querySelector('video.spm-patient-master'):card?.querySelector('video');if(!v)return;try{v.pause();v.muted=true;v.defaultMuted=true;v.volume=0;v.loop=true;v.playbackRate=patient?1:.95;const d=Number(v.duration)||0;if(patient)v.currentTime=second&&d>1?d*.55:0;else if(v.ended||v.currentTime<=0||(d>0&&v.currentTime>=d-.2))v.currentTime=.04;activeVideo=v;const p=v.play();if(!patient)p?.catch?.(()=>{const retry=()=>{if(activeVideo===v&&!paused)v.play().catch(()=>{})};if(v.readyState>=2)setTimeout(retry,80);else v.addEventListener('canplay',retry,{once:true})})}catch{}}
function prepareDoctor(card){stopVisual();const v=card?.querySelector('video');if(!v)return;try{v.pause();v.muted=true;v.defaultMuted=true;v.volume=0;v.loop=false;v.playbackRate=.95;const d=Number(v.duration)||0;if(v.ended||v.currentTime<=0||(d>0&&v.currentTime>=d-.2))v.currentTime=.04;activeVideo=v}catch{}}
function warmSpeech(r){
 try{const u=new SpeechSynthesisUtterance('.');u.lang=isEn(r)?'en-US':'es-CO';u.volume=.01;u.rate=2;synth.speak(u)}catch{}
}
function utter(card,voice,lang,patient,token,done){
 const text=(card.querySelector('.spm-v4-copy')?.textContent||'').trim(),u=new SpeechSynthesisUtterance(text),r=card.closest('.spm-v4'),who=patient?(lang.startsWith('en')?'Patient':'Paciente'):'Doctor SPM';
 u.lang=lang;u.voice=voice||null;u.rate=patient?.95:.92;u.pitch=patient?.78:1.04;
 let started=false,finished=false,watch=0,resumeTimer=0,maxTimer=0;
 const clear=()=>{if(watch)clearInterval(watch);if(resumeTimer)clearTimeout(resumeTimer);if(maxTimer)clearTimeout(maxTimer)};
 const start=()=>{if(finished||token!==run)return;if(!started){started=true;visual(card,patient)}else if(!patient&&activeVideo?.paused&&!paused){activeVideo.play().catch(()=>{})}status(r,who,lang.startsWith('en')?'playing…':'reproduciendo…')};
 const finish=()=>{if(finished)return;finished=true;clear();if(token!==run)return;stopVisual();if(patient)done();else{try{synth.cancel()}catch{};setTimeout(()=>{if(token===run)done()},220)}};
 if(patient)visual(card,true);else prepareDoctor(card);
 status(r,who,lang.startsWith('en')?'preparing audio…':'preparando audio…');
 u.onstart=start;u.onend=finish;u.onerror=finish;
 try{synth.resume()}catch{};synth.speak(u);
 watch=setInterval(()=>{if(finished||token!==run){clear();return}if(!started&&synth.speaking)start();else if(started&&!paused&&!synth.speaking&&!synth.pending)finish();else if(started&&!patient&&!paused&&activeVideo?.paused)activeVideo.play().catch(()=>{})},120);
 resumeTimer=setTimeout(()=>{if(token===run&&!started){try{synth.resume()}catch{}}},650);
 const maxMs=Math.max(7000,Math.ceil((text.split(/\s+/).filter(Boolean).length/1.6)*1000+4500));
 const guard=()=>{if(finished||token!==run)return;if(paused){maxTimer=setTimeout(guard,1000);return}finish()};
 maxTimer=setTimeout(guard,maxMs)
}
function spanishPatient(r,card,ordinal,token,done){
 const audio=r.querySelector('audio.spm-patient-story-audio');if(!audio){status(r,'Paciente','audio masculino no disponible.');setTimeout(done,350);return}
 const patients=[...r.querySelectorAll('.spm-v4-card.patient')],words=patients.map(c=>(c.querySelector('.spm-v4-copy')?.textContent||'').trim().split(/\s+/).filter(Boolean).length||1);
 const segment=PATIENT_SEGMENTS[r.dataset.spmPatientScenario||''];
 let finished=false,to=Infinity,seekTimer=0,seekHandler=null;
 const cleanup=()=>{audio.removeEventListener('timeupdate',watch);audio.removeEventListener('ended',finish);audio.removeEventListener('error',fail);if(seekHandler)audio.removeEventListener('seeked',seekHandler);if(seekTimer)clearTimeout(seekTimer)};
 const finish=()=>{if(finished)return;finished=true;cleanup();try{audio.pause()}catch{}activeAudio=null;stopVisual();if(token===run)setTimeout(done,60)};
 const fail=()=>{if(finished)return;finished=true;cleanup();try{audio.pause()}catch{}activeAudio=null;stopVisual();status(r,'Paciente','audio masculino no disponible.');if(token===run)setTimeout(done,350)};
 const watch=()=>{if(audio.currentTime>=to-.06)finish()};
 const begin=()=>{if(token!==run)return;const d=Number(audio.duration)||0;if(!d||!isFinite(d)){fail();return}const fallback=Math.max(.6,Math.min(d-.45,d*words[0]/(words[0]+words[1]))),cut=segment?.[0]||fallback,from=ordinal===0?0:(segment?.[1]||cut);to=ordinal===0?cut:d;const playSegment=()=>{if(finished||token!==run)return;if(seekHandler){audio.removeEventListener('seeked',seekHandler);seekHandler=null}if(seekTimer){clearTimeout(seekTimer);seekTimer=0}audio.muted=false;audio.defaultMuted=false;audio.volume=1;activeAudio=audio;visual(card,true,ordinal===1);status(r,'Paciente','reproduciendo…');audio.addEventListener('timeupdate',watch);audio.addEventListener('ended',finish);audio.addEventListener('error',fail);const p=audio.play();p?.catch?.(fail)};try{audio.pause();if(ordinal===1){seekHandler=()=>playSegment();audio.addEventListener('seeked',seekHandler,{once:true});audio.currentTime=from;seekTimer=setTimeout(playSegment,260)}else{audio.currentTime=0;playSegment()}}catch{fail()}};
 if(audio.readyState>=1)begin();else{audio.muted=true;const unlock=audio.play();unlock?.catch?.(()=>{});audio.addEventListener('loadedmetadata',begin,{once:true});try{audio.load()}catch{}}
}
function playSpanish(r){stop();root=r;resetPause(r);warmSpeech(r);const token=run,cards=[...r.querySelectorAll('.spm-v4-card')],vs=voices(r);let patientOrdinal=0,i=0;r.querySelector('.spm-v4-wave')?.classList.add('playing');const next=()=>{if(token!==run)return;if(i>=cards.length){r.querySelector('.spm-v4-wave')?.classList.remove('playing');status(r,'','Historia finalizada. Puedes escucharla nuevamente cuando quieras.');return}const card=setCard(r,i),patient=!card.classList.contains('doctor'),done=()=>{i++;next()};if(patient)spanishPatient(r,card,patientOrdinal++,token,done);else utter(card,vs.doctor,'es-CO',false,token,done)};next()}
function playEnglish(r){stop();root=r;resetPause(r);const token=run,cards=[...r.querySelectorAll('.spm-v4-card')],vs=voices(r);let finished=0;r.querySelector('.spm-v4-wave')?.classList.add('playing');cards.forEach((card,i)=>{const patient=!card.classList.contains('doctor'),text=(card.querySelector('.spm-v4-copy')?.textContent||'').trim(),u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.voice=patient?vs.patient:vs.doctor;u.rate=patient?.95:.92;u.pitch=patient?.78:1.04;u.onstart=()=>{if(token!==run)return;setCard(r,i);visual(card,patient,patient&&i>1);status(r,patient?'Patient':'Doctor SPM','playing…')};u.onend=()=>{if(token!==run)return;stopVisual();finished++;if(finished>=cards.length){r.querySelector('.spm-v4-wave')?.classList.remove('playing');status(r,'','Story finished. You can listen again whenever you want.')}};u.onerror=()=>{if(token!==run)return;stopVisual();finished++};synth.speak(u)})}
function play(r){if(!synth){status(r,'',isEn(r)?'Audio is not available in this browser.':'El audio no está disponible en este navegador.');return}isEn(r)?playEnglish(r):playSpanish(r)}
function toggle(r){if(root!==r)return;paused=!paused;const b=r.querySelector('.spm-v4-pause');try{if(paused){activeAudio?.pause?.();synth?.pause?.();activeVideo?.pause?.();r.querySelector('.spm-v4-wave')?.classList.remove('playing');if(b)b.textContent='▶ '+(isEn(r)?'Resume audio':'Continuar audio')}else{activeAudio?.play?.().catch?.(()=>{});synth?.resume?.();activeVideo?.play?.().catch?.(()=>{});r.querySelector('.spm-v4-wave')?.classList.add('playing');if(b)b.textContent='⏸ '+(isEn(r)?'Pause audio':'Pausar audio')}}catch{}}
document.addEventListener('click',e=>{const p=e.target.closest('.spm-v4-play'),q=e.target.closest('.spm-v4-pause');if(p){e.preventDefault();e.stopImmediatePropagation();play(p.closest('.spm-v4'));return}if(q){e.preventDefault();e.stopImmediatePropagation();toggle(q.closest('.spm-v4'));return}if(e.target.closest('[data-scenario],[data-sr-close]'))stop()},true);
window.addEventListener('pagehide',stop);
})();
