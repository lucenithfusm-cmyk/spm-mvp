(()=>{'use strict';
if(window.SPM_RECOVERY_RESTORED_V6)return;window.SPM_RECOVERY_RESTORED_V6=true;
/* Restores the known-good audio principle: all four turns are queued from the user's tap.
   Current HeyGen patient and Doctor SPM videos remain as muted speaking visuals only. */
const synth=window.speechSynthesis;
let root=null,activeVideo=null,paused=false,run=0;
const isEn=(r)=>{const b=r?.querySelector('.spm-v4-play')?.textContent||'',h=r?.querySelector('.spm-v4-head')?.textContent||'';if(/Escuchar historia|CASO|ÉL |DR\. SPM (RESPONDE|ORIENTA)/i.test(b+' '+h))return false;if(/Listen to story|CASE|HE (SHARES|ASKS)|DR\. SPM (RESPONDS|GUIDES)/i.test(b+' '+h))return true;return String(window.SPM_LANGUAGE?.get?.()||window.SPM_LANG||'es').toLowerCase().startsWith('en')};
const MALE=/jorge|diego|carlos|enrique|juan|miguel|alvaro|álvaro|alejandro|antonio|pablo|andres|andrés|mateo|martin|martín|daniel|alex|aaron|arthur|fred|ralph|tom|oliver|james|gordon|lee/i;
const FEMALE=/monica|mónica|paulina|luciana|sofia|sofía|carmen|helena|isabel|laura|maria|maría|salome|salomé|samantha|victoria|karen|moira|tessa|fiona|ava|allison|susan|serena|kate/i;
function voices(r){
 const all=synth?.getVoices?.()||[],english=isEn(r),prefix=english?'en':'es',local=all.filter(v=>String(v.lang||'').toLowerCase().startsWith(prefix));
 /* Never cross language families for the patient. Prefer a male voice in the active language, then an unknown-gender LOCAL voice. */
 const patient=local.find(v=>MALE.test(v.name))||local.find(v=>!FEMALE.test(v.name))||local[0]||null;
 /* Keep Doctor SPM on the female voice already approved, but only inside the active language. */
 const doctor=local.find(v=>FEMALE.test(v.name))||local.find(v=>v!==patient)||patient||null;
 return {patient,doctor,english};
}
function status(r,who,msg){const s=r?.querySelector('.spm-v4-status');if(s)s.innerHTML=who?'<strong>'+who+':</strong> '+msg:msg}
function stopVisual(){if(activeVideo){try{activeVideo.pause()}catch{}activeVideo=null}}
function stop(){
 run++;paused=false;try{synth?.cancel?.()}catch{};stopVisual();
 document.querySelectorAll('.spm-v4 video').forEach(v=>{try{v.pause();v.loop=false;v.muted=true}catch{}});
 if(root)root.querySelector('.spm-v4-wave')?.classList.remove('playing');root=null;
}
function setCard(r,i){
 const cards=[...r.querySelectorAll('.spm-v4-card')];cards.forEach((c,n)=>c.classList.toggle('active',n===i));
 cards[i]?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});return cards[i];
}
function patientVisual(card,second){
 const v=card?.querySelector('video.spm-patient-heygen');if(!v)return;
 try{v.pause();v.muted=true;v.defaultMuted=true;v.volume=0;v.loop=true;v.playbackRate=1;
   const d=Number(v.duration)||0;if(second&&d>1)v.currentTime=Math.max(.1,d*.58);else v.currentTime=.01;
   activeVideo=v;v.play().catch(()=>{});
 }catch{}
}
function doctorVisual(card){
 const v=card?.querySelector('video');if(!v)return;
 try{v.pause();v.muted=true;v.defaultMuted=true;v.volume=0;v.loop=true;v.playbackRate=.95;v.currentTime=0;activeVideo=v;v.play().catch(()=>{})}catch{}
}
function play(r){
 if(!synth){status(r,'',isEn(r)?'Audio is not available in this browser.':'El audio no está disponible en este navegador.');return}
 stop();root=r;const token=run,cards=[...r.querySelectorAll('.spm-v4-card')];
 const vs=voices(r);let patientTurn=0,finished=0;
 if(!cards.length)return;
 r.querySelector('.spm-v4-wave')?.classList.add('playing');
 /* Critical Safari behavior: queue EVERY utterance synchronously inside this user click.
    Do not wait for video ended events before starting Doctor SPM. */
 cards.forEach((card,i)=>{
   const doctor=card.classList.contains('doctor'),text=(card.querySelector('.spm-v4-copy')?.textContent||'').trim();if(!text)return;
   const secondPatient=!doctor&&patientTurn++>0;
   const u=new SpeechSynthesisUtterance(text);u.lang=vs.english?'en-US':'es-CO';u.voice=doctor?vs.doctor:vs.patient;
   u.rate=doctor?.92:.96;u.pitch=doctor?1.02:.86;
   u.onstart=()=>{if(token!==run)return;stopVisual();setCard(r,i);doctor?doctorVisual(card):patientVisual(card,secondPatient);
     r.querySelector('.spm-v4-wave')?.classList.add('playing');status(r,doctor?'Doctor SPM':(vs.english?'Patient':'Paciente'),vs.english?'playing…':'reproduciendo…')};
   u.onend=()=>{if(token!==run)return;stopVisual();finished++;if(finished>=cards.length){r.querySelector('.spm-v4-wave')?.classList.remove('playing');status(r,'',vs.english?'Story finished. You can listen again whenever you want.':'Historia finalizada. Puedes escucharla nuevamente cuando quieras.')}};
   u.onerror=()=>{if(token!==run)return;stopVisual();r.querySelector('.spm-v4-wave')?.classList.remove('playing');status(r,'',vs.english?'Audio was interrupted. Tap “Listen to story” to try again.':'El audio se interrumpió. Toca “Escuchar historia” para intentarlo nuevamente.')};
   synth.speak(u);
 });
}
function toggle(r){
 if(root!==r)return;paused=!paused;const b=r.querySelector('.spm-v4-pause');
 try{if(paused){synth.pause();activeVideo?.pause?.();r.querySelector('.spm-v4-wave')?.classList.remove('playing');if(b)b.textContent='▶ '+(isEn(r)?'Resume audio':'Continuar audio')}
 else{synth.resume();activeVideo?.play?.().catch?.(()=>{});r.querySelector('.spm-v4-wave')?.classList.add('playing');if(b)b.textContent='⏸ '+(isEn(r)?'Pause audio':'Pausar audio')}}catch{}
}
function primePatientFrames(){
 document.querySelectorAll('.spm-v4 video.spm-patient-heygen').forEach(v=>{v.muted=true;v.defaultMuted=true;v.playsInline=true;v.preload='auto';try{v.load()}catch{}});
}
document.addEventListener('click',e=>{
 const p=e.target.closest('.spm-v4-play'),q=e.target.closest('.spm-v4-pause');
 if(p){e.preventDefault();e.stopImmediatePropagation();play(p.closest('.spm-v4'));return}
 if(q){e.preventDefault();e.stopImmediatePropagation();toggle(q.closest('.spm-v4'));return}
 if(e.target.closest('[data-scenario],[data-sr-close]')){stop();setTimeout(primePatientFrames,80)}
},true);
new MutationObserver(()=>requestAnimationFrame(primePatientFrames)).observe(document.documentElement,{childList:true,subtree:true});
if(synth?.addEventListener)synth.addEventListener('voiceschanged',primePatientFrames);
setTimeout(primePatientFrames,0);setTimeout(primePatientFrames,400);
window.addEventListener('pagehide',stop);
})();