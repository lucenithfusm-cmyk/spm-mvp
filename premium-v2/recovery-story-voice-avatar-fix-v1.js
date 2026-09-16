(()=>{
'use strict';
if(window.SPM_RECOVERY_VOICE_AVATAR_FIX_V2)return;
window.SPM_RECOVERY_VOICE_AVATAR_FIX_V2=true;

const synth=window.speechSynthesis;
const lang=()=>window.SPM_LANGUAGE?.get?.()||window.SPM_LANG||'es';
const t=(es,en)=>lang()==='en'?en:es;
let root=null,queue=[],index=0,playing=false,paused=false,activeVideo=null;
let cached={key:'',patient:null,doctor:null};

/* Self-contained patient avatar: no broken external image and no dependency on the old insight artwork. */
const PATIENT_SVG=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#102f3a"/><stop offset="1" stop-color="#07171d"/></linearGradient><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#367db1"/><stop offset="1" stop-color="#174c72"/></linearGradient></defs><rect width="720" height="720" fill="url(#b)"/><circle cx="360" cy="290" r="190" fill="#0d2831"/><ellipse cx="360" cy="258" rx="116" ry="139" fill="#c78f6d"/><path d="M246 245c3-105 49-154 118-154 77 0 119 58 116 158-27-25-54-53-75-83-40 39-95 58-159 79z" fill="#202126"/><path d="M266 263c-18-8-31 5-26 31 5 26 21 42 38 39m176-70c18-8 31 5 26 31-5 26-21 42-38 39" fill="#c78f6d"/><ellipse cx="316" cy="267" rx="9" ry="7" fill="#1b2024"/><ellipse cx="405" cy="267" rx="9" ry="7" fill="#1b2024"/><path d="M337 325c17 12 34 12 51 0" fill="none" stroke="#7c4b3c" stroke-width="7" stroke-linecap="round"/><path d="M337 292c8 7 15 8 23 5" fill="none" stroke="#9c674f" stroke-width="5" stroke-linecap="round"/><path d="M297 375c34 34 92 35 127 0l17 76-81 64-81-64z" fill="#bd8264"/><path d="M153 720c11-158 91-247 207-247s196 89 207 247z" fill="url(#s)"/><path d="M281 474l79 62 79-62" fill="none" stroke="#73b6dd" stroke-width="8" opacity=".7"/><circle cx="360" cy="622" r="33" fill="#0d2a3b" opacity=".35"/><text x="360" y="633" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#9de6d5">SPM</text></svg>`;
const patientImage=()=>`data:image/svg+xml;charset=utf-8,${encodeURIComponent(PATIENT_SVG)}`;

const MALE=['jorge','diego','carlos','enrique','juan','miguel','alvaro','álvaro','alejandro','antonio','pablo','andres','andrés','mateo','martin','martín','daniel','alex','aaron','arthur','fred','ralph','tom','oliver','james','gordon','lee'];
const FEMALE=['monica','mónica','paulina','luciana','sofia','sofía','carmen','helena','isabel','laura','maria','maría','salome','salomé','samantha','victoria','karen','moira','tessa','fiona','ava','allison','susan','serena','kate'];
const has=(v,names)=>names.some(n=>String(v?.name||'').toLowerCase().includes(n));
function available(){return synth?.getVoices?.()||[];}
function chooseVoices(){
 const key=lang(),all=available();if(cached.key===key&&cached.patient&&cached.doctor&&all.includes(cached.patient))return cached;
 const prefix=key==='en'?'en':'es',local=all.filter(v=>String(v.lang||'').toLowerCase().startsWith(prefix));
 /* Never intentionally fall back to a known female voice for the patient. */
 const patient=local.find(v=>has(v,MALE))||all.find(v=>has(v,MALE))||local.find(v=>!has(v,FEMALE))||null;
 const doctor=local.find(v=>has(v,FEMALE))||local.find(v=>v!==patient)||all.find(v=>has(v,FEMALE))||null;
 cached={key,patient,doctor};return cached;
}
function waitForVoices(done,tries=0){const vs=chooseVoices();if(vs.patient||tries>=12){done(vs);return;}setTimeout(()=>waitForVoices(done,tries+1),80);}
function stopVideos(r=root){(r?.querySelectorAll?.('.spm-v4-card.doctor video')||[]).forEach(v=>{try{v.pause();v.currentTime=0;}catch{}});activeVideo=null;}
function setCard(r,i){const cards=[...r.querySelectorAll('.spm-v4-card')];cards.forEach((c,n)=>c.classList.toggle('active',n===i));const card=cards[i];if(card)card.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});return card;}
function animateDoctor(card,on){stopVideos(root);if(!on)return;const v=card?.querySelector('video');if(!v)return;activeVideo=v;try{v.loop=false;v.muted=true;v.playbackRate=1.08;v.currentTime=0;v.play().catch(()=>{});}catch{}}
function status(text,strong){const el=root?.querySelector('.spm-v4-status');if(el)el.innerHTML=strong?`<strong>${strong}:</strong> ${text}`:text;}
function finish(){playing=false;paused=false;stopVideos();root?.querySelector('.spm-v4-wave')?.classList.remove('playing');const b=root?.querySelector('.spm-v4-pause');if(b)b.textContent='⏸ '+t('Pausar audio','Pause audio');status(t('Historia finalizada. Puedes escucharla nuevamente cuando quieras.','Story finished. You can listen again whenever you want.'));}
function speakNext(){
 if(!playing||index>=queue.length){finish();return;}
 const item=queue[index],card=setCard(root,index);
 waitForVoices(vs=>{
  if(!playing)return;
  if(!item.doctor&&!vs.patient){playing=false;stopVideos();root?.querySelector('.spm-v4-wave')?.classList.remove('playing');status(t('La voz masculina aún no está disponible en este dispositivo. Toca nuevamente “Escuchar historia”.','The male voice is not ready on this device yet. Tap “Listen to story” again.'));return;}
  const u=new SpeechSynthesisUtterance(item.text);u.lang=lang()==='en'?'en-US':'es-ES';
  if(item.doctor){u.voice=vs.doctor;u.rate=1.04;u.pitch=1.02;}else{u.voice=vs.patient;u.rate=1.0;u.pitch=.78;}
  u.onstart=()=>{if(!playing)return;root?.querySelector('.spm-v4-wave')?.classList.add('playing');animateDoctor(card,item.doctor);status(t('reproduciendo…','playing…'),item.doctor?'Doctor SPM':t('Paciente','Patient'));};
  u.onend=()=>{if(!playing)return;animateDoctor(card,false);index++;setTimeout(speakNext,70);};
  u.onerror=()=>{if(!playing)return;animateDoctor(card,false);playing=false;root?.querySelector('.spm-v4-wave')?.classList.remove('playing');status(t('No pudimos reproducir esta voz. Toca “Escuchar historia” para reintentar.','We could not play this voice. Tap “Listen to story” to retry.'));};
  synth.speak(u);
 });
}
function play(r){if(!synth)return;cancel(false);root=r;queue=[...r.querySelectorAll('.spm-v4-card')].map(c=>({doctor:c.classList.contains('doctor'),text:(c.querySelector('.spm-v4-copy')?.textContent||'').trim()})).filter(x=>x.text);index=0;playing=true;paused=false;r.querySelector('.spm-v4-wave')?.classList.add('playing');speakNext();}
function cancel(show=true){try{synth?.cancel?.()}catch{}playing=false;paused=false;stopVideos();root?.querySelector('.spm-v4-wave')?.classList.remove('playing');if(show&&root)status(t('Audio detenido.','Audio stopped.'));}
function togglePause(r){if(!playing)return;root=r;const b=r.querySelector('.spm-v4-pause');try{if(paused){synth.resume();paused=false;if(activeVideo)activeVideo.play().catch(()=>{});r.querySelector('.spm-v4-wave')?.classList.add('playing');if(b)b.textContent='⏸ '+t('Pausar audio','Pause audio');}else{synth.pause();paused=true;activeVideo?.pause?.();r.querySelector('.spm-v4-wave')?.classList.remove('playing');if(b)b.textContent='▶ '+t('Continuar audio','Resume audio');status(t('Audio en pausa.','Audio paused.'));}}catch{}}
function hydrate(){
 const img=patientImage();document.querySelectorAll('.spm-v4').forEach(r=>{
  r.querySelectorAll('.spm-v4-card.patient img').forEach(el=>{if(el.dataset.spmPatientAvatar!=='male-svg-v2'){el.src=img;el.removeAttribute('srcset');el.alt=t('Paciente masculino SPM con camiseta azul','SPM male patient wearing a blue shirt');el.dataset.spmPatientAvatar='male-svg-v2';}});
  r.querySelectorAll('.spm-v4-card.doctor video').forEach(v=>{v.removeAttribute('autoplay');v.removeAttribute('loop');v.loop=false;try{if(!playing||v!==activeVideo){v.pause();v.currentTime=0;}}catch{}});
  /* Replace the original V4 click callbacks directly, so the old female-first voice selector cannot run. */
  const pb=r.querySelector('.spm-v4-play'),qb=r.querySelector('.spm-v4-pause');if(pb)pb.onclick=e=>{e.preventDefault();e.stopPropagation();play(r)};if(qb)qb.onclick=e=>{e.preventDefault();e.stopPropagation();togglePause(r)};
 });
}
document.addEventListener('click',e=>{if(e.target.closest('[data-scenario],[data-sr-close]'))cancel(false);},true);
new MutationObserver(()=>requestAnimationFrame(hydrate)).observe(document.documentElement,{childList:true,subtree:true});
if(synth){synth.addEventListener?.('voiceschanged',()=>{cached={key:'',patient:null,doctor:null};hydrate();});}
window.addEventListener('pagehide',()=>cancel(false));
setTimeout(hydrate,0);setTimeout(hydrate,150);setTimeout(hydrate,600);
})();