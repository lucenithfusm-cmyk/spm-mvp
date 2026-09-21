(()=>{
'use strict';
if(window.SPM_RECOVERY_MEDIA_LOCAL_V3)return;
window.SPM_RECOVERY_MEDIA_LOCAL_V3=true;
window.SPM_RECOVERY_PATIENT_LOCAL_V2=true;window.SPM_RECOVERY_PATIENT_HEYGEN_STAGING_V1=true;

const MASTER='assets/videos/recovery-patient-master.mp4';
const DOCTOR='assets/videos/dr-spm-performance-anxiety-content.mp4';
const AUDIO={
 condom:'assets/audio/recovery-patient-condom-es.mp3',
 before:'assets/audio/recovery-patient-before-es.mp3',
 during:'assets/audio/recovery-patient-during-es.mp3',
 early:'assets/audio/recovery-patient-early-es.mp3',
 urge:'assets/audio/recovery-patient-urge-es.mp3',
 partner:'assets/audio/recovery-patient-partner-es.mp3',
 next:'assets/audio/recovery-patient-next-es.mp3'
};
function scenario(root){
 const s=(root.querySelector('.spm-v4-head h3')?.textContent||'').toLowerCase();
 if(s.includes('preservativo')||s.includes('condom'))return'condom';
 if(s.includes('antes de penetrar')||s.includes('before penetration'))return'before';
 if(s.includes('durante la penetración')||s.includes('during penetration'))return'during';
 if(s.includes('eyaculé antes')||s.includes('ejaculated sooner'))return'early';
 if(s.includes('iba a eyacular')||s.includes('close to ejaculation'))return'urge';
 if(s.includes('pareja notó')||s.includes('partner noticed'))return'partner';
 if(s.includes('temo que vuelva')||s.includes('afraid it will happen'))return'next';
 return'';
}
function hydrate(){
 document.querySelectorAll('.spm-v4').forEach(root=>{
  const id=scenario(root),audioSrc=AUDIO[id];if(!id||!audioSrc)return;
  root.dataset.spmPatientScenario=id;
  root.dataset.spmPatientAudio=audioSrc;
  let audio=root.querySelector('audio.spm-patient-story-audio');
  if(!audio){
   audio=document.createElement('audio');audio.className='spm-patient-story-audio';audio.hidden=true;
   audio.preload='auto';audio.src=audioSrc;root.appendChild(audio);try{audio.load()}catch{}
  }else if(!audio.src.endsWith(audioSrc)){audio.src=audioSrc;try{audio.load()}catch{}}
  root.querySelectorAll('.spm-v4-card.doctor .spm-v4-visual').forEach(box=>{
   let v=box.querySelector('video');
   if(!v){v=document.createElement('video');box.insertBefore(v,box.firstChild)}
   if(!String(v.getAttribute('src')||'').includes('dr-spm-performance-anxiety-content.mp4'))v.src=DOCTOR;
   v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');
   v.preload='auto';v.loop=true;v.controls=false;
   const prime=()=>{try{if(v.currentTime===0)v.currentTime=.04}catch{}};
   if(v.readyState>=2)prime();else v.addEventListener('loadeddata',prime,{once:true});
   try{v.load()}catch{}
  });
  root.querySelectorAll('.spm-v4-card.patient .spm-v4-visual').forEach(box=>{
   box.querySelectorAll('img').forEach(img=>{img.hidden=true;img.style.display='none'});
   let v=box.querySelector('video.spm-patient-master');
   if(!v){
    box.querySelectorAll('video.spm-patient-heygen').forEach(old=>old.remove());
    v=document.createElement('video');v.className='spm-patient-master';v.src=MASTER;
    v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('playsinline','');
    v.setAttribute('webkit-playsinline','');v.preload='auto';v.loop=true;v.controls=false;
    box.insertBefore(v,box.firstChild);try{v.load()}catch{}
   }
  });
 });
}
const style=document.createElement('style');
style.textContent='.spm-v4-card.patient .spm-v4-visual>img{display:none!important}.spm-v4-visual video.spm-patient-master,.spm-v4-card.doctor .spm-v4-visual>video{width:100%;height:100%;object-fit:cover;display:block;background:#0b2026}';
document.head.appendChild(style);
let queued=false;function run(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;hydrate()})}
new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',()=>setTimeout(run,20),true);
setTimeout(run,0);setTimeout(run,300);
})();