(()=>{'use strict';
if(window.SPM_RECOVERY_AUDIO_CONTROLLER_V10)return;
window.SPM_RECOVERY_AUDIO_CONTROLLER_V10=true;
window.SPM_RECOVERY_AUDIO_CONTROLLER_V9=true;window.SPM_RECOVERY_AUDIO_CONTROLLER_V8=true;window.SPM_RECOVERY_AUDIO_CONTROLLER_V7=true;
let root=null,activeVideo=null,paused=false,run=0;
const isEn=r=>/Listen to story|CASE|HE /i.test((r?.querySelector('.spm-v4-play')?.textContent||'')+' '+(r?.querySelector('.spm-v4-head')?.textContent||''));
function status(r,who,message){const s=r?.querySelector('.spm-v4-status');if(s)s.textContent=(who?who+': ':'')+message;}
function stopVisual(){if(activeVideo){try{activeVideo.pause();}catch{}activeVideo=null;}}
function reset(r){r?.querySelector('.spm-v4-wave')?.classList.remove('playing');const b=r?.querySelector('.spm-v4-pause');if(b)b.textContent=isEn(r)?'Pause audio':'Pausar audio';}
function stop(){run++;paused=false;const old=root;root=null;stopVisual();window.SPM_VOICE?.cancel();reset(old);}
function visual(card){stopVisual();const v=card?.querySelector('video');if(!v)return;v.muted=true;v.defaultMuted=true;v.volume=0;v.loop=true;activeVideo=v;try{v.play()?.catch(()=>{});}catch{}}
function play(r){
 stop();root=r;const token=run,english=isEn(r),cards=[...r.querySelectorAll('.spm-v4-card')];let index=0;
 if(!window.SPM_VOICE){status(r,'',english?'Voice unavailable. Read the story below.':'Voz no disponible. Puedes leer la historia.');return;}
 // Approved text from each visible card replaces all embedded/recorded narration.
 // Visual clips remain silent illustrations; no lip-sync timing is claimed.
 r.querySelectorAll('audio').forEach(a=>{try{a.pause();}catch{}});
 const next=()=>{
  if(token!==run||root!==r||!r.isConnected)return;
  if(index>=cards.length){reset(r);stopVisual();status(r,'',english?'Story finished.':'Historia finalizada. Puedes escucharla de nuevo.');return;}
  const card=cards[index],who=card.classList.contains('doctor')?'Doctor SPM':english?'Patient':'Paciente';
  cards.forEach((node,i)=>node.classList.toggle('active',i===index));card.scrollIntoView?.({behavior:'smooth',block:'nearest',inline:'center'});
  window.SPM_VOICE.listen((card.querySelector('.spm-v4-copy')?.textContent||'').trim(),{
   owner:r,lang:english?'en-US':'es-CO',
   onstate:({state,message})=>{if(token!==run||root!==r)return;if(state==='playing'){visual(card);r.querySelector('.spm-v4-wave')?.classList.add('playing');status(r,who,english?'playing…':'reproduciendo…');}if(state==='error'){stopVisual();reset(r);status(r,who,message);}},
   onend:()=>{if(token!==run)return;stopVisual();index++;next();},
   oncancel:()=>{if(token!==run)return;run++;stopVisual();reset(r);},
  });
 };
 next();
}
function toggle(r){if(root!==r)return;paused=!paused;const b=r.querySelector('.spm-v4-pause');if(paused){window.SPM_VOICE?.pause();activeVideo?.pause();reset(r);if(b)b.textContent=isEn(r)?'Resume this paragraph':'Reanudar desde este párrafo';}else{window.SPM_VOICE?.resume();reset(r);}}
document.addEventListener('click',e=>{const p=e.target.closest('.spm-v4-play'),q=e.target.closest('.spm-v4-pause');if(p){e.preventDefault();e.stopImmediatePropagation();play(p.closest('.spm-v4'));return;}if(q){e.preventDefault();e.stopImmediatePropagation();toggle(q.closest('.spm-v4'));return;}if(e.target.closest('[data-scenario],[data-sr-close]'))stop();},true);
window.addEventListener('pagehide',stop);window.addEventListener('spm:session-change',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
})();
