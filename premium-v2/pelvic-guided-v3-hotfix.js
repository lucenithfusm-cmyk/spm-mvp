(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const CONTRACT=3, RELAX=6, REPS=10, TOTAL=REPS*(CONTRACT+RELAX);
let run=null,timer=null;
function speak(text){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='es-CO';u.rate=.9;const vs=speechSynthesis.getVoices();u.voice=vs.find(v=>/es-CO/i.test(v.lang))||vs.find(v=>/^es/i.test(v.lang))||null;speechSynthesis.speak(u)}catch(e){}}
function root(){return document.querySelector('.pfi-overlay:not([hidden])')}
function isStep5(){return /5\s*de\s*7/i.test($('.pfi-count',root())?.textContent||'')}
function patchStep5(){const r=root();if(!r||!isStep5())return;const main=$('.pfi-main',r);if(!main)return;
 const lead=$('.pfi-lead',main);if(lead)lead.textContent='Sigue el ritmo: contrae suavemente durante 3 segundos y relaja por completo durante 6 segundos.';
 const sec=$('#pfiGuidedSeconds',r);if(sec&&!run)sec.textContent='3 s';
 const next=$('#pfiGuidedNext',r);if(next&&!run)next.textContent='Después: RELAJA · 6 s';
 const master=$('[data-pfi-master-audio]',main);if(master){master.onclick=()=>speak('En la serie guiada realizarás contracciones suaves de tres segundos seguidas de seis segundos de relajación. Mantén una respiración natural y continua. La pantalla y el audio te indicarán cada fase.');}
 let stack=$('.pfi-timer-grid .pfi-stack',main);if(stack&&!stack.querySelector('.pfi-v3-audios')){
  const box=document.createElement('div');box.className='pfi-v3-audios';box.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:2px 0 10px';
  box.innerHTML='<button type="button" class="pfi-btn" data-v3-audio="intro">🔊 Escuchar serie</button><button type="button" class="pfi-btn" data-v3-audio="tech">🔊 Técnica correcta</button>';
  stack.insertBefore(box,stack.firstChild);
  $('[data-v3-audio="intro"]',box).onclick=()=>speak('Vamos a realizar diez repeticiones. En cada una contrae con suavidad durante tres segundos y después relaja completamente durante seis segundos. No contengas la respiración.');
  $('[data-v3-audio="tech"]',box).onclick=()=>speak('La contracción debe ser suave y localizada. Mantén abdomen, glúteos y muslos relajados. Respira con normalidad y permite una relajación completa antes de repetir.');
 }
 const audioCard=$$('.pfi-info',main).find(x=>/Audio guiado/i.test(x.textContent||''));if(audioCard&&!audioCard.querySelector('button')){const b=document.createElement('button');b.type='button';b.className='pfi-audio';b.textContent='🔊';b.setAttribute('aria-label','Escuchar guía de la serie');b.onclick=()=>speak('La voz te indicará cuándo contraer durante tres segundos y cuándo relajar durante seis segundos.');audioCard.appendChild(b)}
}
function update(){const r=root();if(!r||!run)return;const phase=$('#pfiGuidedPhase',r),seconds=$('#pfiGuidedSeconds',r),ring=$('#pfiGuidedRing',r),rep=$('#pfiGuidedRep',r),dots=$('#pfiGuidedDots',r),next=$('#pfiGuidedNext',r),instruction=$('#pfiGuidedInstruction',r),start=$('#pfiGuidedStart',r),stage=$('[data-pfi-avatar]',r),caption=$('[data-pfi-caption]',r);
 if(phase)phase.textContent=run.phase==='contract'?'CONTRAE':'RELAJA';if(seconds)seconds.textContent=run.left+' s';if(rep)rep.textContent=`Repetición ${run.rep} de ${REPS}`;
 if(next)next.textContent=run.phase==='contract'?'Después: RELAJA · 6 s':'Después: CONTRAE · 3 s';
 if(instruction)instruction.textContent=run.phase==='contract'?'Contrae suavemente durante 3 segundos mientras continúas respirando.':'Libera la contracción y relaja por completo durante 6 segundos.';
 if(start)start.textContent=run.paused?'▶ Reanudar':'❚❚ Pausar';
 if(dots)dots.innerHTML=Array.from({length:REPS},(_,i)=>`<i class="pfi-dot ${i<run.rep-1?'done':i===run.rep-1?'on':''}"></i>`).join('');
 if(ring){const elapsed=(run.rep-1)*(CONTRACT+RELAX)+(run.phase==='contract'?(CONTRACT-run.left):(CONTRACT+RELAX-run.left));ring.style.setProperty('--pct',`${Math.min(360,elapsed/TOTAL*360)}deg`)}
 if(stage){stage.classList.remove('contract','relax','pfi-pulse');stage.classList.add(run.phase==='contract'?'contract':'relax');if(run.phase==='contract')stage.classList.add('pfi-pulse')}
 if(caption)caption.innerHTML=run.phase==='contract'?'<strong>CONTRAE</strong> · 3 s · elevación suave · respira normalmente':'<strong>RELAJA</strong> · 6 s · suelta por completo';
}
function cue(){speak(run.phase==='contract'?'Contrae suavemente. Mantén tres segundos. Continúa respirando.':'Relaja por completo. Mantén seis segundos de descanso.')}
function start(){stop(false);run={rep:1,phase:'contract',left:CONTRACT,paused:false,running:true};cue();update();timer=setInterval(()=>{if(!run||run.paused)return;run.left--;if(run.left<=0){if(run.phase==='contract'){run.phase='relax';run.left=RELAX}else if(run.rep<REPS){run.rep++;run.phase='contract';run.left=CONTRACT}else{return finish()}cue()}update()},1000)}
function finish(){clearInterval(timer);timer=null;if(!run)return;run.running=false;const r=root();const phase=$('#pfiGuidedPhase',r),seconds=$('#pfiGuidedSeconds',r),ring=$('#pfiGuidedRing',r),next=$('[data-next]',r),stage=$('[data-pfi-avatar]',r),caption=$('[data-pfi-caption]',r);if(phase)phase.textContent='COMPLETADO';if(seconds)seconds.textContent='✓';if(ring)ring.style.setProperty('--pct','360deg');if(next)next.disabled=false;if(stage)stage.classList.remove('contract','relax','pfi-pulse');if(caption)caption.innerHTML='<strong>COMPLETADO ✓</strong> · buen trabajo';speak('Serie guiada completada. Muy bien.');run=null}
function stop(reset=true){clearInterval(timer);timer=null;run=null;const r=root();if(reset&&r){const phase=$('#pfiGuidedPhase',r),seconds=$('#pfiGuidedSeconds',r),ring=$('#pfiGuidedRing',r),rep=$('#pfiGuidedRep',r);if(phase)phase.textContent='LISTO';if(seconds)seconds.textContent='3 s';if(ring)ring.style.setProperty('--pct','0deg');if(rep)rep.textContent='Repetición 1 de 10'}}
function intercept(e){if(!isStep5())return;const t=e.target.closest('#pfiGuidedStart,#pfiGuidedRestart,#pfiGuidedStop');if(!t)return;e.preventDefault();e.stopImmediatePropagation();if(t.id==='pfiGuidedStart'){if(!run)start();else{run.paused=!run.paused;update()}}else if(t.id==='pfiGuidedRestart')start();else{stop(true);speak('Serie detenida. Puedes reiniciar cuando estés cómodo.')}}
function sync(){patchStep5()}
document.addEventListener('click',intercept,true);
new MutationObserver(sync).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('DOMContentLoaded',sync,{once:true});setTimeout(sync,400);setTimeout(sync,900);
})();