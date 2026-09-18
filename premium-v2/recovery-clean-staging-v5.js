(()=>{'use strict';
if(window.SPM_RECOVERY_CLEAN_V5)return;window.SPM_RECOVERY_CLEAN_V5=true;
/* One controller only: patient HeyGen audio/video -> Doctor SPM -> patient HeyGen -> Doctor SPM. */
let serial=0,root=null,media=null,utter=null,paused=false;
const isEn=()=>String(window.SPM_LANGUAGE?.get?.()||window.SPM_LANG||'es').toLowerCase().startsWith('en');
const male=/jorge|diego|carlos|enrique|juan|miguel|alvaro|álvaro|alejandro|antonio|pablo|andres|andrés|mateo|martin|martín|daniel|alex|aaron|arthur|fred|ralph|tom|oliver|james|gordon|lee/i;
function stop(){serial++;paused=false;try{speechSynthesis.cancel()}catch{};document.querySelectorAll('.spm-v4 video').forEach(v=>{try{v.pause();v.loop=false}catch{}});media=null;utter=null;if(root)root.querySelector('.spm-v4-wave')?.classList.remove('playing');root=null}
function setCard(r,i){const a=[...r.querySelectorAll('.spm-v4-card')];a.forEach((c,n)=>c.classList.toggle('active',n===i));a[i]?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});return a[i]}
function status(r,who,msg){const s=r.querySelector('.spm-v4-status');if(s)s.innerHTML=who?'<strong>'+who+':</strong> '+(msg||'reproduciendo…'):(msg||'')}
function maleVoice(){const a=speechSynthesis.getVoices?.()||[],p=isEn()?'en':'es',l=a.filter(v=>String(v.lang||'').toLowerCase().startsWith(p));return l.find(v=>male.test(v.name))||a.find(v=>male.test(v.name))||l[0]||a[0]||null}
function patient(card,part,token,next){
 const v=card.querySelector('video.spm-patient-heygen');if(!v){status(card.closest('.spm-v4'),'Paciente','video no disponible');return}
 const r=card.closest('.spm-v4'),pc=[...r.querySelectorAll('.spm-v4-card.patient')];
 const w=pc.map(c=>(c.querySelector('.spm-v4-copy')?.textContent||'').trim().split(/\s+/).filter(Boolean).length||1);
 const begin=()=>{if(token!==serial)return;const d=Number(v.duration)||0;if(!d){v.addEventListener('loadedmetadata',begin,{once:true});return}
   /* Existing HeyGen clip contains the two patient turns. Split once and preserve native 1x audio/lip-sync. */
   const cut=Math.max(.8,Math.min(d-.45,d*w[0]/(w[0]+w[1]))),from=part===0?0:cut,to=part===0?cut:d;
   let done=false;const finish=()=>{if(done)return;done=true;v.removeEventListener('timeupdate',watch);v.removeEventListener('ended',finish);try{v.pause()}catch{};media=null;if(token===serial)setTimeout(next,320)};
   const watch=()=>{if(v.currentTime>=to-.06)finish()};
   try{v.pause();v.loop=false;v.muted=false;v.defaultMuted=false;v.volume=1;v.playbackRate=1;v.currentTime=from;media=v;v.addEventListener('timeupdate',watch);v.addEventListener('ended',finish,{once:true});v.play().catch(()=>{status(r,'Paciente','toca nuevamente “Escuchar historia” para activar el sonido');finish()})}catch{finish()}
 };
 if(v.readyState>=1)begin();else v.addEventListener('loadedmetadata',begin,{once:true});
}
function doctor(card,token,next){
 const r=card.closest('.spm-v4'),text=(card.querySelector('.spm-v4-copy')?.textContent||'').trim(),v=card.querySelector('video');if(!text){next();return}
 try{if(v){v.pause();v.currentTime=0;v.loop=true;v.muted=true;v.playbackRate=.95;v.play().catch(()=>{})}}catch{}
 const u=new SpeechSynthesisUtterance(text);utter=u;u.lang=isEn()?'en-US':'es-CO';u.voice=maleVoice();u.rate=.88;u.pitch=.92;media={pause:()=>speechSynthesis.pause(),play:()=>speechSynthesis.resume()};
 let done=false;const finish=()=>{if(done)return;done=true;try{v?.pause()}catch{};utter=null;media=null;if(token===serial)setTimeout(next,360)};u.onend=finish;u.onerror=finish;speechSynthesis.speak(u);
}
function play(r){stop();root=r;const token=serial,cards=[...r.querySelectorAll('.spm-v4-card')];let i=0,p=0;r.querySelector('.spm-v4-wave')?.classList.add('playing');
 const next=()=>{if(token!==serial)return;if(i>=cards.length){r.querySelector('.spm-v4-wave')?.classList.remove('playing');status(r,'',isEn()?'Story finished. You can listen again whenever you want.':'Historia finalizada. Puedes escucharla nuevamente cuando quieras.');return}
 const c=setCard(r,i),doc=c.classList.contains('doctor');status(r,doc?'Doctor SPM':(isEn()?'Patient':'Paciente'));const done=()=>{i++;next()};doc?doctor(c,token,done):patient(c,p++,token,done)};next()}
function toggle(r){if(root!==r)return;paused=!paused;const b=r.querySelector('.spm-v4-pause');if(paused){try{if(media instanceof HTMLMediaElement)media.pause();else media?.pause?.();speechSynthesis.pause()}catch{};r.querySelector('.spm-v4-wave')?.classList.remove('playing');if(b)b.textContent='▶ '+(isEn()?'Resume audio':'Continuar audio')}else{try{if(media instanceof HTMLMediaElement)media.play().catch(()=>{});else media?.play?.();speechSynthesis.resume()}catch{};r.querySelector('.spm-v4-wave')?.classList.add('playing');if(b)b.textContent='⏸ '+(isEn()?'Pause audio':'Pausar audio')}}
document.addEventListener('click',e=>{const p=e.target.closest('.spm-v4-play'),q=e.target.closest('.spm-v4-pause');if(p){e.preventDefault();e.stopImmediatePropagation();play(p.closest('.spm-v4'));return}if(q){e.preventDefault();e.stopImmediatePropagation();toggle(q.closest('.spm-v4'));return}if(e.target.closest('[data-scenario],[data-sr-close]'))stop()},true);
window.addEventListener('pagehide',stop);
})();