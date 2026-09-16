(()=>{
'use strict';
if(window.SPM_RECOVERY_STORY_PREMIUM_V3)return;
window.SPM_RECOVERY_STORY_PREMIUM_V3=true;

const lang=()=>window.SPM_LANGUAGE?.get?.()||window.SPM_LANG||'es';
const t=(es,en)=>lang()==='en'?en:es;
let scenarioId='';
let activeRoot=null;
let speaking=false;
let paused=false;
let currentTurn=0;
let speechQueue=[];

const STORIES={
  condom:{
    title:{es:'La perdí al colocar el preservativo',en:'I lost my erection while putting on a condom'},
    image:1,
    turns:[
      {who:'patient',label:{es:'ÉL CUENTA',en:'HE SHARES'},sub:{es:'Compartir también ayuda',en:'Sharing can help too'},es:'Todo iba bien. Al colocar el preservativo empecé a preocuparme por la firmeza.',en:'Everything was going well. When I put on the condom, I started worrying about staying firm.'},
      {who:'doctor',label:{es:'DR. SPM RESPONDE',en:'DR. SPM RESPONDS'},sub:{es:'Perspectiva profesional',en:'Professional perspective'},es:'No tienes que demostrar nada. La presión puede cambiar la respuesta eréctil.',en:'You do not have to prove anything. Pressure can change the erectile response.'},
      {who:'patient',label:{es:'ÉL PREGUNTA',en:'HE ASKS'},sub:{es:'Resolver dudas es avanzar',en:'Clarifying doubts is progress'},es:'¿Qué hago en ese momento?',en:'What should I do in that moment?'},
      {who:'doctor',label:{es:'DR. SPM ORIENTA',en:'DR. SPM GUIDES'},sub:{es:'Herramientas para la vida real',en:'Tools for real life'},es:'Pausa la penetración, mantén el contacto, respira y vuelve a sensaciones simples. La intimidad puede continuar sin presión.',en:'Pause penetration, stay connected, breathe and return to simple sensations. Intimacy can continue without pressure.'}
    ]
  },
  before:{
    title:{es:'La perdí antes de penetrar',en:'I lost my erection before penetration'},
    image:2,
    turns:[
      {who:'patient',label:{es:'ÉL CUENTA',en:'HE SHARES'},sub:{es:'Compartir también ayuda',en:'Sharing can help too'},es:'Estaba excitado, había besos y caricias, pero justo cuando pensé en penetrar sentí que la erección empezó a bajar.',en:'I was aroused, there had been kissing and touching, but as soon as I thought about penetration I felt my erection begin to fade.'},
      {who:'doctor',label:{es:'DR. SPM RESPONDE',en:'DR. SPM RESPONDS'},sub:{es:'Perspectiva profesional',en:'Professional perspective'},es:'Eso suele ocurrir cuando la atención pasa del placer al rendimiento. No significa que todo se haya perdido.',en:'That can happen when attention shifts from pleasure to performance. It does not mean everything is lost.'},
      {who:'patient',label:{es:'ÉL PREGUNTA',en:'HE ASKS'},sub:{es:'Resolver dudas es avanzar',en:'Clarifying doubts is progress'},es:'¿Debo intentar penetrar rápido antes de que desaparezca por completo?',en:'Should I try to penetrate quickly before it disappears completely?'},
      {who:'doctor',label:{es:'DR. SPM ORIENTA',en:'DR. SPM GUIDES'},sub:{es:'Herramientas para la vida real',en:'Tools for real life'},es:'No. Quita la urgencia. Mantén la cercanía, baja la exigencia y vuelve a estimular sin convertir la penetración en una prueba.',en:'No. Remove the urgency. Stay close, lower the pressure and return to stimulation without turning penetration into a test.'}
    ]
  },
  during:{
    title:{es:'La perdí durante la penetración',en:'I lost my erection during penetration'},
    image:3,
    turns:[
      {who:'patient',label:{es:'ÉL CUENTA',en:'HE SHARES'},sub:{es:'Compartir también ayuda',en:'Sharing can help too'},es:'Habíamos empezado bien, pero durante la penetración sentí que la firmeza cambió y me frustré.',en:'We had started well, but during penetration I felt the firmness change and I became frustrated.'},
      {who:'doctor',label:{es:'DR. SPM RESPONDE',en:'DR. SPM RESPONDS'},sub:{es:'Perspectiva profesional',en:'Professional perspective'},es:'Una variación durante el encuentro no define tu capacidad sexual. Lo importante es cómo respondes a ese momento.',en:'A change during sex does not define your sexual ability. What matters is how you respond to that moment.'},
      {who:'patient',label:{es:'ÉL PREGUNTA',en:'HE ASKS'},sub:{es:'Resolver dudas es avanzar',en:'Clarifying doubts is progress'},es:'¿Qué hago si ya ocurrió y siento que dañé el momento?',en:'What do I do if it already happened and I feel I ruined the moment?'},
      {who:'doctor',label:{es:'DR. SPM ORIENTA',en:'DR. SPM GUIDES'},sub:{es:'Herramientas para la vida real',en:'Tools for real life'},es:'Detén la presión por continuar igual, conserva la conexión y cambia de ritmo o de forma de estimulación. El encuentro puede seguir de otras maneras.',en:'Stop pressuring yourself to continue in the same way, stay connected and change the pace or type of stimulation. The encounter can continue in other ways.'}
    ]
  }
};

function css(){
  if(document.getElementById('spmRecoveryPremiumV3CSS'))return;
  const s=document.createElement('style');
  s.id='spmRecoveryPremiumV3CSS';
  s.textContent=`
  .sr-scene[data-spm-premium-story="1"]>.sr-scene-visual,.sr-scene[data-spm-premium-story="1"]>.spm-rd,.sr-scene[data-spm-premium-story="1"]>.spm-ms{display:none!important}
  .spm-v3{margin:14px 0 18px;border:1px solid rgba(143,227,208,.28);border-radius:25px;background:linear-gradient(180deg,#071b22,#06151b);overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,.25)}
  .spm-v3-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:17px 17px 13px;border-bottom:1px solid #17343c}
  .spm-v3-kicker{display:inline-flex;align-items:center;gap:7px;padding:6px 9px;border-radius:999px;background:#8fe3d0;color:#07221f;font-size:10px;font-weight:950;letter-spacing:.08em}
  .spm-v3-head h3{margin:9px 0 0!important;font-size:20px!important;line-height:1.18!important;color:#f1f8f7!important}
  .spm-v3-brand{color:#8fe3d0;font-size:11px;font-weight:900;letter-spacing:.08em;white-space:nowrap;margin-top:6px}
  .spm-v3-track{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;padding:12px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
  .spm-v3-card{min-width:0;position:relative;border:1px solid #21444d;border-radius:20px;overflow:hidden;background:#0b2229;scroll-snap-align:center;transition:.25s ease;box-shadow:0 8px 24px rgba(0,0,0,.18)}
  .spm-v3-card.active{border-color:#8fe3d0;box-shadow:0 0 0 1px rgba(143,227,208,.22),0 14px 30px rgba(0,0,0,.28);transform:translateY(-2px)}
  .spm-v3-meta{padding:12px 13px 8px;min-height:55px;background:linear-gradient(180deg,rgba(5,21,27,.98),rgba(8,29,35,.92))}
  .spm-v3-step{display:flex;align-items:center;gap:8px;color:#e7f3f1;font-weight:900;font-size:12px;letter-spacing:.02em}.spm-v3-num{width:25px;height:25px;border:1px solid #8fe3d0;border-radius:50%;display:grid;place-items:center;color:#8fe3d0;font-weight:950}.spm-v3-sub{margin:4px 0 0 33px;color:#9eb4b8;font-size:10px}
  .spm-v3-visual{position:relative;height:185px;overflow:hidden;background:#0a1b21}
  .spm-v3-visual.patient{background-size:cover;background-position:center}
  .spm-v3-visual.patient:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,17,22,.04),rgba(4,17,22,.18) 52%,rgba(4,17,22,.78))}
  .spm-v3-visual video{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.9) contrast(1.02)}
  .spm-v3-visual:before{content:'';position:absolute;z-index:2;inset:0;border-bottom:1px solid rgba(143,227,208,.08);pointer-events:none}
  .spm-v3-role{position:absolute;z-index:3;left:11px;bottom:9px;padding:5px 8px;border-radius:999px;background:rgba(4,19,24,.78);backdrop-filter:blur(5px);border:1px solid rgba(143,227,208,.24);color:#dff6f0;font-size:10px;font-weight:900}
  .spm-v3-copy{position:relative;margin:-16px 10px 10px;padding:13px 14px;border-radius:17px;background:linear-gradient(145deg,#132d35,#0d222a);border:1px solid #35545c;color:#eef7f6;line-height:1.45;font-size:13px;min-height:106px;z-index:5}
  .spm-v3-card.doctor .spm-v3-copy{border-color:#39766b;background:linear-gradient(145deg,#11332f,#0b2423)}
  .spm-v3-controls{display:grid;grid-template-columns:auto auto 1fr auto;gap:9px;align-items:center;padding:12px 14px 14px;border-top:1px solid #16353d;background:#06171d}
  .spm-v3-play,.spm-v3-pause,.spm-v3-guide{border-radius:14px!important;font-weight:900!important;min-height:44px!important}.spm-v3-play{background:#8fe3d0!important;color:#06231f!important;border-color:#8fe3d0!important}.spm-v3-pause{background:#0d2730!important;color:#dcebea!important;border-color:#35525a!important}.spm-v3-guide{background:#0a2027!important;color:#bff6e9!important;border-color:#4eb7a4!important}
  .spm-v3-wave{height:34px;display:flex;align-items:center;gap:3px;justify-content:center;overflow:hidden}.spm-v3-wave i{display:block;width:2px;border-radius:2px;background:#2c6970;height:7px}.spm-v3-wave.playing i{animation:spmV3Wave .8s ease-in-out infinite alternate}.spm-v3-wave i:nth-child(2n){height:15px;animation-delay:.1s}.spm-v3-wave i:nth-child(3n){height:23px;animation-delay:.18s}.spm-v3-wave i:nth-child(5n){height:12px;animation-delay:.25s}
  .spm-v3-status{padding:0 14px 13px;color:#90a9ad;font-size:11px;min-height:17px}.spm-v3-status strong{color:#8fe3d0}
  .spm-v3-guidebox{margin:0 12px 14px;border:1px solid #23464f;border-radius:18px;background:#071a20;overflow:hidden}.spm-v3-guidebox summary{cursor:pointer;padding:14px 15px;color:#dcebea;font-weight:900;list-style:none}.spm-v3-guidebox summary::-webkit-details-marker{display:none}.spm-v3-guidebox[open] summary{border-bottom:1px solid #1b3941;color:#8fe3d0}.spm-v3-guideinner{padding:12px 14px 15px}.spm-v3-guideinner .sr-grid{display:grid!important}.spm-v3-guideinner .sr-card{background:#0b2228!important}
  @keyframes spmV3Wave{from{transform:scaleY(.55);opacity:.55}to{transform:scaleY(1.15);opacity:1}}
  @media(max-width:760px){.spm-v3-track{grid-template-columns:repeat(4,82%);padding:11px 12px}.spm-v3-card{min-width:0}.spm-v3-visual{height:230px}.spm-v3-copy{font-size:15px;min-height:112px}.spm-v3-controls{grid-template-columns:1fr 1fr}.spm-v3-wave{grid-column:1/-1;order:3}.spm-v3-guide{grid-column:1/-1;order:4}.spm-v3-brand{display:none}}
  @media(max-width:430px){.spm-v3-track{grid-template-columns:repeat(4,88%)}.spm-v3-visual{height:220px}.spm-v3-head h3{font-size:19px!important}.spm-v3-controls{gap:8px}.spm-v3-play,.spm-v3-pause{font-size:12px!important}}
  @media(prefers-reduced-motion:reduce){.spm-v3-card,.spm-v3-wave i{transition:none!important;animation:none!important}}
  `;
  document.head.appendChild(s);
}

function patientImage(index){
  const l=lang()==='en'?'en':'es';
  return `assets/insights/insight-${index}-${l}.png`;
}

function chooseVoices(){
  const all=window.speechSynthesis?.getVoices?.()||[];
  const prefix=lang()==='en'?'en':'es';
  const list=all.filter(v=>String(v.lang||'').toLowerCase().startsWith(prefix));
  return {patient:list[0]||all[0]||null,doctor:list[1]||list[0]||all[1]||all[0]||null};
}

function resetSpeech(){
  try{window.speechSynthesis?.cancel?.()}catch{}
  speaking=false;paused=false;speechQueue=[];currentTurn=0;
  if(activeRoot){activeRoot.querySelector('.spm-v3-wave')?.classList.remove('playing');const st=activeRoot.querySelector('.spm-v3-status');if(st)st.textContent=t('Audio detenido.','Audio stopped.');}
}

function setActive(root,i,scroll=true){
  currentTurn=i;
  root.querySelectorAll('.spm-v3-card').forEach((c,n)=>c.classList.toggle('active',n===i));
  const card=root.querySelectorAll('.spm-v3-card')[i];
  if(scroll&&card)card.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
}

function speakStory(root,story){
  if(!('speechSynthesis' in window)){
    root.querySelector('.spm-v3-status').textContent=t('Este navegador no tiene voz disponible.','This browser has no speech voice available.');return;
  }
  resetSpeech();activeRoot=root;speaking=true;paused=false;
  const voices=chooseVoices();
  speechQueue=story.turns.map((turn,i)=>{
    const u=new SpeechSynthesisUtterance(lang()==='en'?turn.en:turn.es);
    u.lang=lang()==='en'?'en-US':'es-CO';
    u.rate=turn.who==='doctor'?.9:.94;
    u.pitch=turn.who==='doctor'?.88:1.0;
    u.voice=turn.who==='doctor'?voices.doctor:voices.patient;
    u.onstart=()=>{setActive(root,i,true);root.querySelector('.spm-v3-wave')?.classList.add('playing');root.querySelector('.spm-v3-status').innerHTML=`<strong>${turn.who==='doctor'?'Doctor SPM':t('Paciente','Patient')}:</strong> ${t('reproduciendo…','playing…')}`};
    u.onend=()=>{if(i===story.turns.length-1){speaking=false;paused=false;root.querySelector('.spm-v3-wave')?.classList.remove('playing');root.querySelector('.spm-v3-status').textContent=t('Historia finalizada. Puedes escucharla nuevamente cuando quieras.','Story finished. You can listen again whenever you want.')}};
    u.onerror=()=>{speaking=false;root.querySelector('.spm-v3-wave')?.classList.remove('playing');root.querySelector('.spm-v3-status').textContent=t('No pudimos reproducir la voz. Toca “Escuchar historia” para reintentar.','We could not play the voice. Tap “Listen to story” to retry.')};
    return u;
  });
  speechQueue.forEach(u=>window.speechSynthesis.speak(u));
}

function pauseResume(root){
  if(!speaking)return;
  try{
    if(window.speechSynthesis.paused){window.speechSynthesis.resume();paused=false;root.querySelector('.spm-v3-pause').textContent='⏸ '+t('Pausar audio','Pause audio');root.querySelector('.spm-v3-wave')?.classList.add('playing');}
    else{window.speechSynthesis.pause();paused=true;root.querySelector('.spm-v3-pause').textContent='▶ '+t('Continuar audio','Resume audio');root.querySelector('.spm-v3-wave')?.classList.remove('playing');root.querySelector('.spm-v3-status').textContent=t('Audio en pausa.','Audio paused.');}
  }catch{}
}

function enhance(){
  const scene=document.querySelector('.sr-dialog #srScenario .sr-scene');
  const story=STORIES[scenarioId];
  if(!scene||!story||scene.dataset.spmPremiumStory==='1')return;
  css();resetSpeech();activeRoot=null;
  scene.dataset.spmPremiumStory='1';
  const title=scene.querySelector(':scope > h3');
  const storyParagraph=scene.querySelector(':scope > p');
  if(storyParagraph)storyParagraph.style.display='none';
  const rawGrid=scene.querySelector(':scope > .sr-grid');
  const existingDetails=scene.querySelector('.spm-rd-details');
  const wrapper=document.createElement('section');
  wrapper.className='spm-v3';
  wrapper.innerHTML=`
    <div class="spm-v3-head">
      <div><span class="spm-v3-kicker">${t('CASO · HISTORIA GUIADA','CASE · GUIDED STORY')}</span><h3>${lang()==='en'?story.title.en:story.title.es}</h3></div>
      <span class="spm-v3-brand">SPM PREMIUM</span>
    </div>
    <div class="spm-v3-track" aria-label="${t('Historia guiada en cuatro momentos','Guided story in four moments')}">
      ${story.turns.map((turn,i)=>{
        const doctor=turn.who==='doctor';
        const visual=doctor
          ? `<div class="spm-v3-visual doctor"><video muted playsinline loop autoplay preload="metadata" src="assets/videos/dr-spm-performance-anxiety-content.mp4"></video><span class="spm-v3-role">Doctor SPM</span></div>`
          : `<div class="spm-v3-visual patient" style="background-image:linear-gradient(rgba(4,17,22,.08),rgba(4,17,22,.08)),url('${patientImage(story.image)}')"><span class="spm-v3-role">${t('Paciente','Patient')}</span></div>`;
        return `<article class="spm-v3-card ${doctor?'doctor':'patient'} ${i===0?'active':''}" data-turn="${i}"><div class="spm-v3-meta"><div class="spm-v3-step"><span class="spm-v3-num">${i+1}</span>${lang()==='en'?turn.label.en:turn.label.es}</div><div class="spm-v3-sub">${lang()==='en'?turn.sub.en:turn.sub.es}</div></div>${visual}<div class="spm-v3-copy">${lang()==='en'?turn.en:turn.es}</div></article>`
      }).join('')}
    </div>
    <div class="spm-v3-controls">
      <button type="button" class="spm-v3-play">▶ ${t('Escuchar historia','Listen to story')}</button>
      <button type="button" class="spm-v3-pause">⏸ ${t('Pausar audio','Pause audio')}</button>
      <div class="spm-v3-wave" aria-hidden="true">${Array.from({length:26},()=>'<i></i>').join('')}</div>
      <button type="button" class="spm-v3-guide">▤ ${t('Ver guía clínica completa','View full clinical guide')} →</button>
    </div>
    <div class="spm-v3-status" role="status" aria-live="polite">${t('Audio opcional. Solo se reproduce cuando tú lo activas.','Optional audio. It only plays when you activate it.')}</div>
  `;
  title?.insertAdjacentElement('afterend',wrapper);
  const cards=[...wrapper.querySelectorAll('.spm-v3-card')];
  cards.forEach((c,i)=>c.addEventListener('click',()=>setActive(wrapper,i,false)));
  wrapper.querySelector('.spm-v3-play').onclick=()=>speakStory(wrapper,story);
  wrapper.querySelector('.spm-v3-pause').onclick=()=>pauseResume(wrapper);
  wrapper.querySelector('.spm-v3-guide').onclick=()=>{
    const d=scene.querySelector('.spm-v3-guidebox')||existingDetails;
    if(d){d.open=true;d.scrollIntoView({behavior:'smooth',block:'nearest'});}
  };
  if(existingDetails){existingDetails.classList.add('spm-v3-guidebox');existingDetails.querySelector('summary').textContent=t('Ver guía clínica completa','View full clinical guide');}
  else if(rawGrid){const d=document.createElement('details');d.className='spm-v3-guidebox';d.innerHTML=`<summary>${t('Ver guía clínica completa','View full clinical guide')}</summary><div class="spm-v3-guideinner"></div>`;rawGrid.parentNode.insertBefore(d,rawGrid);d.querySelector('.spm-v3-guideinner').appendChild(rawGrid);}
  const opts=scene.querySelector('.spm-rd-options');if(opts){const d=scene.querySelector('.spm-v3-guidebox');if(d&&!d.contains(opts)){let inner=d.querySelector('.spm-v3-guideinner');if(!inner){inner=document.createElement('div');inner.className='spm-v3-guideinner';d.appendChild(inner)}inner.appendChild(opts)}}
  wrapper.querySelectorAll('video').forEach(v=>{v.play().catch(()=>{})});
}

function watchScenarioHost(){
  const host=document.getElementById('srScenario');
  if(!host||host.dataset.spmV3Watch==='1')return;
  host.dataset.spmV3Watch='1';
  new MutationObserver(ms=>{if(ms.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.sr-scene')||n.querySelector?.('.sr-scene')))))requestAnimationFrame(enhance)}).observe(host,{childList:true,subtree:true});
}

document.addEventListener('click',e=>{
  const s=e.target.closest('[data-scenario]');
  if(s){scenarioId=s.dataset.scenario||'';resetSpeech();setTimeout(()=>{watchScenarioHost();enhance()},110)}
  if(e.target.closest('[data-sr-open="recovery"]'))setTimeout(watchScenarioHost,100);
  if(e.target.closest('[data-sr-close]'))resetSpeech();
});
window.addEventListener('pagehide',resetSpeech);
})();