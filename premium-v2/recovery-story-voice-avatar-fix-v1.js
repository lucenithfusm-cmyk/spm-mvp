(()=>{
'use strict';
if(window.SPM_RECOVERY_VOICE_AVATAR_FIX_V1)return;
window.SPM_RECOVERY_VOICE_AVATAR_FIX_V1=true;

const synth=window.speechSynthesis;
const lang=()=>window.SPM_LANGUAGE?.get?.()||window.SPM_LANG||'es';
const t=(es,en)=>lang()==='en'?en:es;
const patientImage=()=>{const parts=window.SPM_BREATH_IMG_PARTS||[];return parts.length>=3?'data:image/jpeg;base64,'+parts.join(''):'';};
let root=null,queue=[],index=0,playing=false,paused=false,activeVideo=null;
let cached={key:'',patient:null,doctor:null};

const MALE_ES=['jorge','diego','carlos','enrique','juan','miguel','alvaro','alejandro','antonio','pablo','andres','andrés','mateo','martin','martín'];
const FEMALE_ES=['monica','mónica','paulina','luciana','sofia','sofía','carmen','helena','isabel','laura','maria','maría','salome','salomé'];
const MALE_EN=['daniel','alex','aaron','arthur','fred','ralph','tom','oliver','jamie','james','gordon','lee'];
const FEMALE_EN=['samantha','victoria','karen','moira','tessa','fiona','ava','allison','susan','serena','kate'];
const has=(voice,names)=>names.some(n=>String(voice?.name||'').toLowerCase().includes(n));
function chooseVoices(){
 const key=lang();if(cached.key===key&&cached.patient&&cached.doctor)return cached;
 const all=synth?.getVoices?.()||[],prefix=key==='en'?'en':'es';
 const local=all.filter(v=>String(v.lang||'').toLowerCase().startsWith(prefix));
 const maleNames=key==='en'?MALE_EN:MALE_ES,femaleNames=key==='en'?FEMALE_EN:FEMALE_ES;
 const patient=local.find(v=>has(v,maleNames))||local.find(v=>!has(v,femaleNames))||local[0]||all[0]||null;
 const doctor=local.find(v=>has(v,femaleNames))||local.find(v=>v!==patient)||local[0]||all[1]||all[0]||null;
 cached={key,patient,doctor};return cached;
}
function stopVideos(r=root){
 (r?.querySelectorAll?.('.spm-v4-card.doctor video')||[]).forEach(v=>{try{v.pause();v.currentTime=0;}catch{}});activeVideo=null;
}
function setCard(r,i){
 const cards=[...r.querySelectorAll('.spm-v4-card')];cards.forEach((c,n)=>c.classList.toggle('active',n===i));
 const card=cards[i];if(card)card.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});return card;
}
function animateDoctor(card,on){
 stopVideos(root);if(!on)return;
 const v=card?.querySelector('video');if(!v)return;activeVideo=v;try{v.loop=false;v.muted=true;v.playbackRate=1.08;v.currentTime=0;v.play().catch(()=>{});}catch{}
}
function status(text,strong){const el=root?.querySelector('.spm-v4-status');if(el)el.innerHTML=strong?`<strong>${strong}:</strong> ${text}`:text;}
function finish(){playing=false;paused=false;stopVideos();root?.querySelector('.spm-v4-wave')?.classList.remove('playing');const b=root?.querySelector('.spm-v4-pause');if(b)b.textContent='⏸ '+t('Pausar audio','Pause audio');status(t('Historia finalizada. Puedes escucharla nuevamente cuando quieras.','Story finished. You can listen again whenever you want.'));}
function speakNext(){
 if(!playing||index>=queue.length){finish();return;}
 const item=queue[index],card=setCard(root,index),vs=chooseVoices();
 const u=new SpeechSynthesisUtterance(item.text);u.lang=lang()==='en'?'en-US':'es-CO';
 if(item.doctor){u.voice=vs.doctor;u.rate=1.04;u.pitch=1.02;}else{u.voice=vs.patient;u.rate=1.0;u.pitch=.82;}
 u.onstart=()=>{if(!playing)return;root?.querySelector('.spm-v4-wave')?.classList.add('playing');animateDoctor(card,item.doctor);status(t('reproduciendo…','playing…'),item.doctor?'Doctor SPM':t('Paciente','Patient'));};
 u.onend=()=>{if(!playing)return;animateDoctor(card,false);index++;setTimeout(speakNext,90);};
 u.onerror=()=>{if(!playing)return;animateDoctor(card,false);playing=false;root?.querySelector('.spm-v4-wave')?.classList.remove('playing');status(t('No pudimos reproducir esta voz. Toca “Escuchar historia” para reintentar.','We could not play this voice. Tap “Listen to story” to retry.'));};
 synth.speak(u);
}
function play(r){
 if(!synth)return;cancel(false);root=r;queue=[...r.querySelectorAll('.spm-v4-card')].map(c=>({doctor:c.classList.contains('doctor'),text:(c.querySelector('.spm-v4-copy')?.textContent||'').trim()})).filter(x=>x.text);index=0;playing=true;paused=false;r.querySelector('.spm-v4-wave')?.classList.add('playing');speakNext();
}
function cancel(show=true){try{synth?.cancel?.()}catch{}playing=false;paused=false;stopVideos();root?.querySelector('.spm-v4-wave')?.classList.remove('playing');if(show&&root)status(t('Audio detenido.','Audio stopped.'));}
function togglePause(r){
 if(!playing)return;root=r;const b=r.querySelector('.spm-v4-pause');
 try{if(paused){synth.resume();paused=false;if(activeVideo)activeVideo.play().catch(()=>{});r.querySelector('.spm-v4-wave')?.classList.add('playing');if(b)b.textContent='⏸ '+t('Pausar audio','Pause audio');}
 else{synth.pause();paused=true;activeVideo?.pause?.();r.querySelector('.spm-v4-wave')?.classList.remove('playing');if(b)b.textContent='▶ '+t('Continuar audio','Resume audio');status(t('Audio en pausa.','Audio paused.'));}}catch{}
}
function hydrate(){
 const img=patientImage();document.querySelectorAll('.spm-v4').forEach(r=>{
  r.querySelectorAll('.spm-v4-card.patient img').forEach(el=>{if(img&&el.src!==img){el.src=img;el.alt=t('Paciente masculino SPM','SPM male patient');el.dataset.spmPatientAvatar='breathing-blue-shirt';}});
  r.querySelectorAll('.spm-v4-card.doctor video').forEach(v=>{v.removeAttribute('autoplay');v.removeAttribute('loop');v.loop=false;try{if(!playing||v!==activeVideo){v.pause();v.currentTime=0;}}catch{}});
 });
}

document.addEventListener('click',e=>{
 const playBtn=e.target.closest('.spm-v4-play');if(playBtn){e.preventDefault();e.stopImmediatePropagation();play(playBtn.closest('.spm-v4'));return;}
 const pauseBtn=e.target.closest('.spm-v4-pause');if(pauseBtn){e.preventDefault();e.stopImmediatePropagation();togglePause(pauseBtn.closest('.spm-v4'));return;}
 if(e.target.closest('[data-scenario],[data-sr-close]'))cancel(false);
},true);
new MutationObserver(()=>requestAnimationFrame(hydrate)).observe(document.documentElement,{childList:true,subtree:true});
if(synth){synth.addEventListener?.('voiceschanged',()=>{cached={key:'',patient:null,doctor:null};});}
window.addEventListener('pagehide',()=>cancel(false));
setTimeout(hydrate,0);setTimeout(hydrate,250);
})();