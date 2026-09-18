(()=>{'use strict';
if(window.SPM_RECOVERY_SEQUENCE_STAGING_V2)return;window.SPM_RECOVERY_SEQUENCE_STAGING_V2=true;
let token=0,paused=false,currentMedia=null,currentRoot=null;
const lang=()=>String(window.SPM_LANGUAGE?.get?.()||window.SPM_LANG||'es').toLowerCase().startsWith('en')?'en':'es';
const maleNames=/jorge|diego|carlos|enrique|juan|miguel|alvaro|álvaro|alejandro|antonio|pablo|andres|andrés|mateo|martin|martín|daniel|alex|aaron|arthur|fred|ralph|tom|oliver|james|gordon|lee/i;
function voices(){const a=speechSynthesis?.getVoices?.()||[], l=a.filter(v=>String(v.lang||'').toLowerCase().startsWith(lang()));return l.find(v=>maleNames.test(v.name))||l[0]||a[0]||null}
function stop(reset=true){token++;paused=false;try{speechSynthesis?.cancel()}catch{};document.querySelectorAll('.spm-v4 video').forEach(v=>{try{v.pause();if(reset)v.currentTime=0;}catch{}});currentMedia=null;if(currentRoot){currentRoot.querySelector('.spm-v4-wave')?.classList.remove('playing')}currentRoot=null}
function active(r,i){const cards=[...r.querySelectorAll('.spm-v4-card')];cards.forEach((c,n)=>c.classList.toggle('active',n===i));cards[i]?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});return cards[i]}
function status(r,who,msg='reproduciendo…'){const s=r.querySelector('.spm-v4-status');if(s)s.innerHTML=who?'<strong>'+who+':</strong> '+msg:msg}
function patientSegment(card,which,myToken,next){
 const v=card?.querySelector('video.spm-patient-heygen');if(!v){next();return}
 const cards=[...card.closest('.spm-v4').querySelectorAll('.spm-v4-card.patient')], first=cards[0], second=cards[1];
 const w1=((first?.querySelector('.spm-v4-copy')?.textContent||'').trim().split(/\s+/).filter(Boolean).length||1);
 const w2=((second?.querySelector('.spm-v4-copy')?.textContent||'').trim().split(/\s+/).filter(Boolean).length||1);
 const go=()=>{if(myToken!==token)return;const d=Number(v.duration)||0;if(!d){next();return}const cut=Math.max(.8,Math.min(d-.45,d*(w1/(w1+w2))));const start=which===0?0:cut,end=which===0?cut:d+.05;try{v.pause();v.loop=false;v.muted=false;v.defaultMuted=false;v.volume=1;v.currentTime=start}catch{}
 currentMedia=v;let done=false;const finish=()=>{if(done)return;done=true;v.removeEventListener('timeupdate',watch);v.removeEventListener('ended',finish);try{v.pause()}catch{};currentMedia=null;if(myToken===token)next()};
 const watch=()=>{if(v.currentTime>=end-.06)finish()};v.addEventListener('timeupdate',watch);v.addEventListener('ended',finish,{once:true});v.play().catch(()=>{status(card.closest('.spm-v4'),'Paciente','toca nuevamente “Escuchar historia” para activar el audio');finish()});};
 if(v.readyState>=1)go();else v.addEventListener('loadedmetadata',go,{once:true});
}
function doctorTurn(card,myToken,next){const text=(card?.querySelector('.spm-v4-copy')?.textContent||'').trim();if(!text){next();return}const v=card.querySelector('video');if(v){try{v.pause();v.currentTime=0;v.muted=true;v.loop=false;v.play().catch(()=>{})}catch{}}
 const u=new SpeechSynthesisUtterance(text);u.lang=lang()==='en'?'en-US':'es-CO';u.voice=voices();u.rate=1;u.pitch=.92;currentMedia={pause:()=>speechSynthesis.pause(),play:()=>speechSynthesis.resume()};
 u.onend=()=>{try{v?.pause()}catch{};currentMedia=null;if(myToken===token)next()};u.onerror=()=>{try{v?.pause()}catch{};currentMedia=null;if(myToken===token)next()};speechSynthesis.speak(u)}
function play(r){stop();currentRoot=r;const myToken=token,cards=[...r.querySelectorAll('.spm-v4-card')];if(!cards.length)return;r.querySelector('.spm-v4-wave')?.classList.add('playing');let i=0,p=0;
 const next=()=>{if(myToken!==token)return;if(i>=cards.length){r.querySelector('.spm-v4-wave')?.classList.remove('playing');status(r,'','Historia finalizada. Puedes escucharla nuevamente cuando quieras.');return}const c=active(r,i),doc=c.classList.contains('doctor');status(r,doc?'Doctor SPM':(lang()==='en'?'Patient':'Paciente'));const done=()=>{i++;setTimeout(next,90)};if(doc)doctorTurn(c,myToken,done);else patientSegment(c,p++,myToken,done)};next()}
function toggle(r){if(!currentRoot||currentRoot!==r)return;paused=!paused;const b=r.querySelector('.spm-v4-pause');if(paused){try{if(currentMedia instanceof HTMLMediaElement)currentMedia.pause();else currentMedia?.pause?.()}catch{};try{speechSynthesis.pause()}catch{};r.querySelector('.spm-v4-wave')?.classList.remove('playing');if(b)b.textContent='▶ '+(lang()==='en'?'Resume audio':'Continuar audio')}else{try{if(currentMedia instanceof HTMLMediaElement)currentMedia.play().catch(()=>{});else currentMedia?.play?.()}catch{};try{speechSynthesis.resume()}catch{};r.querySelector('.spm-v4-wave')?.classList.add('playing');if(b)b.textContent='⏸ '+(lang()==='en'?'Pause audio':'Pausar audio')}}
function quiet(){document.querySelectorAll('.spm-v4 video.spm-patient-heygen').forEach(v=>{if(v!==currentMedia){try{v.pause();v.loop=false;v.muted=false;v.defaultMuted=false}catch{}}})}
document.addEventListener('click',e=>{const p=e.target.closest('.spm-v4-play'),q=e.target.closest('.spm-v4-pause');if(p){e.preventDefault();e.stopImmediatePropagation();play(p.closest('.spm-v4'));return}if(q){e.preventDefault();e.stopImmediatePropagation();toggle(q.closest('.spm-v4'));return}if(e.target.closest('[data-scenario],[data-sr-close]'))setTimeout(()=>{stop();quiet()},0)},true);
new MutationObserver(()=>requestAnimationFrame(quiet)).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
window.addEventListener('pagehide',()=>stop());setTimeout(quiet,0);setTimeout(quiet,400);
})();