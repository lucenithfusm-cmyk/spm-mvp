(()=>{
'use strict';
if(window.SPM_RECOVERY_STORY_PREMIUM_V4)return;
window.SPM_RECOVERY_STORY_PREMIUM_V4=true;

const lang=()=>window.SPM_LANGUAGE?.get?.()||window.SPM_LANG||'es';
const t=(es,en)=>lang()==='en'?en:es;
let pendingScenario='';
let activeRoot=null;
let speaking=false;

const STORIES={
  condom:{title:{es:'La perdí al colocar el preservativo',en:'I lost my erection while putting on a condom'},turns:[
    {who:'patient',label:{es:'ÉL CUENTA',en:'HE SHARES'},sub:{es:'Compartir también ayuda',en:'Sharing can help too'},es:'Todo iba bien. Al colocar el preservativo empecé a preocuparme por la firmeza.',en:'Everything was going well. When I put on the condom, I started worrying about staying firm.'},
    {who:'doctor',label:{es:'DR. SPM RESPONDE',en:'DR. SPM RESPONDS'},sub:{es:'Perspectiva profesional',en:'Professional perspective'},es:'No tienes que demostrar nada. La presión puede cambiar la respuesta eréctil.',en:'You do not have to prove anything. Pressure can change the erectile response.'},
    {who:'patient',label:{es:'ÉL PREGUNTA',en:'HE ASKS'},sub:{es:'Resolver dudas es avanzar',en:'Clarifying doubts is progress'},es:'¿Qué hago en ese momento?',en:'What should I do in that moment?'},
    {who:'doctor',label:{es:'DR. SPM ORIENTA',en:'DR. SPM GUIDES'},sub:{es:'Herramientas para la vida real',en:'Tools for real life'},es:'Pausa la penetración, mantén el contacto, respira y vuelve a sensaciones simples. La intimidad puede continuar sin presión.',en:'Pause penetration, stay connected, breathe and return to simple sensations. Intimacy can continue without pressure.'}
  ]},
  before:{title:{es:'La perdí antes de penetrar',en:'I lost my erection before penetration'},turns:[
    {who:'patient',label:{es:'ÉL CUENTA',en:'HE SHARES'},sub:{es:'Compartir también ayuda',en:'Sharing can help too'},es:'Estaba excitado, había besos y caricias, pero justo cuando pensé en penetrar sentí que la erección empezó a bajar.',en:'I was aroused, there had been kissing and touching, but as soon as I thought about penetration I felt my erection begin to fade.'},
    {who:'doctor',label:{es:'DR. SPM RESPONDE',en:'DR. SPM RESPONDS'},sub:{es:'Perspectiva profesional',en:'Professional perspective'},es:'Eso suele ocurrir cuando la atención pasa del placer al rendimiento. No significa que todo se haya perdido.',en:'That can happen when attention shifts from pleasure to performance. It does not mean everything is lost.'},
    {who:'patient',label:{es:'ÉL PREGUNTA',en:'HE ASKS'},sub:{es:'Resolver dudas es avanzar',en:'Clarifying doubts is progress'},es:'¿Debo intentar penetrar rápido antes de que desaparezca por completo?',en:'Should I try to penetrate quickly before it disappears completely?'},
    {who:'doctor',label:{es:'DR. SPM ORIENTA',en:'DR. SPM GUIDES'},sub:{es:'Herramientas para la vida real',en:'Tools for real life'},es:'No. Quita la urgencia. Mantén la cercanía, baja la exigencia y vuelve a estimular sin convertir la penetración en una prueba.',en:'No. Remove the urgency. Stay close, lower the pressure and return to stimulation without turning penetration into a test.'}
  ]},
  during:{title:{es:'La perdí durante la penetración',en:'I lost my erection during penetration'},turns:[
    {who:'patient',label:{es:'ÉL CUENTA',en:'HE SHARES'},sub:{es:'Compartir también ayuda',en:'Sharing can help too'},es:'Habíamos empezado bien, pero durante la penetración sentí que la firmeza cambió y me frustré.',en:'We had started well, but during penetration I felt the firmness change and I became frustrated.'},
    {who:'doctor',label:{es:'DR. SPM RESPONDE',en:'DR. SPM RESPONDS'},sub:{es:'Perspectiva profesional',en:'Professional perspective'},es:'Una variación durante el encuentro no define tu capacidad sexual. Lo importante es cómo respondes a ese momento.',en:'A change during sex does not define your sexual ability. What matters is how you respond to that moment.'},
    {who:'patient',label:{es:'ÉL PREGUNTA',en:'HE ASKS'},sub:{es:'Resolver dudas es avanzar',en:'Clarifying doubts is progress'},es:'¿Qué hago si ya ocurrió y siento que dañé el momento?',en:'What do I do if it already happened and I feel I ruined the moment?'},
    {who:'doctor',label:{es:'DR. SPM ORIENTA',en:'DR. SPM GUIDES'},sub:{es:'Herramientas para la vida real',en:'Tools for real life'},es:'Detén la presión por continuar igual, conserva la conexión y cambia de ritmo o de forma de estimulación. El encuentro puede seguir de otras maneras.',en:'Stop pressuring yourself to continue in the same way, stay connected and change the pace or type of stimulation. The encounter can continue in other ways.'}
  ]}
};

function addCSS(){
 if(document.getElementById('spmRecoveryPremiumV4CSS'))return;
 const s=document.createElement('style');s.id='spmRecoveryPremiumV4CSS';s.textContent=`
 .sr-scene[data-spm-premium-v4="1"]>.sr-scene-visual,.sr-scene[data-spm-premium-v4="1"]>.spm-rd,.sr-scene[data-spm-premium-v4="1"]>.spm-ms{display:none!important}
 .spm-v4{margin:12px 0 16px;border:1px solid rgba(143,227,208,.34);border-radius:24px;background:linear-gradient(180deg,#071a21,#061218);overflow:hidden;box-shadow:0 18px 42px rgba(0,0,0,.28)}
 .spm-v4-head{padding:16px 16px 13px;border-bottom:1px solid #173740;display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.spm-v4-kicker{display:inline-flex;padding:6px 10px;border-radius:999px;background:#8fe3d0;color:#06231f;font-size:10px;font-weight:950;letter-spacing:.08em}.spm-v4-head h3{margin:9px 0 0!important;color:#f2f8f7!important;font-size:20px!important;line-height:1.18!important}.spm-v4-brand{color:#8fe3d0;font-size:11px;font-weight:950;letter-spacing:.08em;white-space:nowrap;margin-top:5px}
 .spm-v4-track{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;padding:12px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}.spm-v4-card{scroll-snap-align:center;min-width:0;border:1px solid #234850;border-radius:20px;overflow:hidden;background:#0b2229;transition:.22s ease;box-shadow:0 8px 22px rgba(0,0,0,.18)}.spm-v4-card.active{border-color:#8fe3d0;box-shadow:0 0 0 1px rgba(143,227,208,.2),0 14px 30px rgba(0,0,0,.3);transform:translateY(-2px)}
 .spm-v4-meta{padding:11px 12px 8px;min-height:57px;background:#071b21}.spm-v4-step{display:flex;gap:8px;align-items:center;color:#e8f4f2;font-size:12px;font-weight:950}.spm-v4-num{width:25px;height:25px;border:1px solid #8fe3d0;border-radius:50%;display:grid;place-items:center;color:#8fe3d0}.spm-v4-sub{margin:4px 0 0 33px;color:#91aaae;font-size:10px}
 .spm-v4-visual{height:190px;position:relative;overflow:hidden;background:#0b2026}.spm-v4-visual img,.spm-v4-visual video{width:100%;height:100%;object-fit:cover;display:block}.spm-v4-visual video{filter:saturate(.9) contrast(1.04)}.spm-v4-visual:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 42%,rgba(4,17,22,.78));pointer-events:none}.spm-v4-role{position:absolute;z-index:2;left:10px;bottom:9px;padding:5px 8px;border-radius:999px;background:rgba(3,18,22,.78);border:1px solid rgba(143,227,208,.25);color:#dff6f0;font-size:10px;font-weight:900}
 .spm-v4-copy{position:relative;margin:-14px 9px 10px;padding:13px 14px;border-radius:17px;background:linear-gradient(145deg,#132f37,#0d2229);border:1px solid #36565e;color:#eef7f6;line-height:1.46;font-size:13px;min-height:108px;z-index:3}.spm-v4-card.doctor .spm-v4-copy{background:linear-gradient(145deg,#11332f,#0b2422);border-color:#39766a}
 .spm-v4-controls{display:grid;grid-template-columns:auto auto 1fr auto;gap:9px;align-items:center;padding:12px 14px;border-top:1px solid #17343c}.spm-v4-play,.spm-v4-pause,.spm-v4-guide{min-height:44px!important;border-radius:14px!important;font-weight:900!important}.spm-v4-play{background:#8fe3d0!important;border-color:#8fe3d0!important;color:#06231f!important}.spm-v4-pause{background:#0d2730!important;border-color:#35525a!important;color:#dcebea!important}.spm-v4-guide{background:#0a2027!important;border-color:#4eb7a4!important;color:#bff6e9!important}.spm-v4-wave{height:32px;display:flex;gap:3px;justify-content:center;align-items:center}.spm-v4-wave i{width:2px;height:8px;border-radius:2px;background:#2f6d72}.spm-v4-wave.playing i{animation:spmV4Wave .75s ease-in-out infinite alternate}.spm-v4-wave i:nth-child(2n){height:14px}.spm-v4-wave i:nth-child(3n){height:22px}.spm-v4-status{padding:0 14px 13px;color:#91aaae;font-size:11px;min-height:17px}.spm-v4-status strong{color:#8fe3d0}.spm-v4-guidebox{margin:0 12px 14px;border:1px solid #244750;border-radius:17px;background:#071a20;overflow:hidden}.spm-v4-guidebox summary{padding:14px 15px;cursor:pointer;color:#dcebea;font-weight:900;list-style:none}.spm-v4-guidebox summary::-webkit-details-marker{display:none}.spm-v4-guidebox[open] summary{color:#8fe3d0;border-bottom:1px solid #1b3941}.spm-v4-guideinner{padding:12px 14px 15px}.spm-v4-guideinner>.sr-grid{display:grid!important}
 @keyframes spmV4Wave{from{transform:scaleY(.5);opacity:.5}to{transform:scaleY(1.2);opacity:1}}
 @media(max-width:760px){.spm-v4-track{grid-template-columns:repeat(4,84%);padding:11px 12px}.spm-v4-visual{height:250px}.spm-v4-copy{font-size:15px;min-height:110px}.spm-v4-controls{grid-template-columns:1fr 1fr}.spm-v4-wave{grid-column:1/-1;order:3}.spm-v4-guide{grid-column:1/-1;order:4}.spm-v4-brand{display:none}}
 @media(max-width:430px){.spm-v4-track{grid-template-columns:repeat(4,89%)}.spm-v4-visual{height:230px}.spm-v4-head h3{font-size:19px!important}.spm-v4-play,.spm-v4-pause{font-size:12px!important}}
 @media(prefers-reduced-motion:reduce){.spm-v4-card,.spm-v4-wave i{transition:none!important;animation:none!important}}
 `;document.head.appendChild(s);
}

function identify(scene){
 if(STORIES[pendingScenario])return pendingScenario;
 const txt=(scene?.querySelector(':scope > h3')?.textContent||'').toLowerCase();
 if(txt.includes('preservativo')||txt.includes('condom'))return 'condom';
 if(txt.includes('antes de penetrar')||txt.includes('before penetration'))return 'before';
 if(txt.includes('durante el encuentro')||txt.includes('durante la penetración')||txt.includes('during the encounter')||txt.includes('during penetration'))return 'during';
 return '';
}

function patientSrc(index){
 if(window.SPM_REAL_AVATAR)return window.SPM_REAL_AVATAR;
 return `assets/insights/insight-${index}-${lang()==='en'?'en':'es'}.png`;
}
function cancelSpeech(){try{speechSynthesis?.cancel?.()}catch{}speaking=false;if(activeRoot){activeRoot.querySelector('.spm-v4-wave')?.classList.remove('playing');}}
function setActive(root,i,scroll=true){root.querySelectorAll('.spm-v4-card').forEach((c,n)=>c.classList.toggle('active',n===i));const c=root.querySelectorAll('.spm-v4-card')[i];if(scroll&&c)c.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});}
function voices(){const all=speechSynthesis?.getVoices?.()||[];const p=lang()==='en'?'en':'es';const l=all.filter(v=>String(v.lang||'').toLowerCase().startsWith(p));return {patient:l[0]||all[0]||null,doctor:l[1]||l[0]||all[1]||all[0]||null};}
function playStory(root,story){
 if(!('speechSynthesis'in window)){root.querySelector('.spm-v4-status').textContent=t('Este navegador no tiene voz disponible.','This browser has no speech voice available.');return;}
 cancelSpeech();activeRoot=root;speaking=true;const vs=voices();root.querySelector('.spm-v4-wave')?.classList.add('playing');
 story.turns.forEach((turn,i)=>{const u=new SpeechSynthesisUtterance(lang()==='en'?turn.en:turn.es);u.lang=lang()==='en'?'en-US':'es-CO';u.rate=turn.who==='doctor'?.9:.94;u.pitch=turn.who==='doctor'?.9:1;u.voice=turn.who==='doctor'?vs.doctor:vs.patient;u.onstart=()=>{setActive(root,i,true);root.querySelector('.spm-v4-status').innerHTML=`<strong>${turn.who==='doctor'?'Doctor SPM':t('Paciente','Patient')}:</strong> ${t('reproduciendo…','playing…')}`};u.onend=()=>{if(i===story.turns.length-1){speaking=false;root.querySelector('.spm-v4-wave')?.classList.remove('playing');root.querySelector('.spm-v4-status').textContent=t('Historia finalizada. Puedes escucharla nuevamente cuando quieras.','Story finished. You can listen again whenever you want.')}};u.onerror=()=>{speaking=false;root.querySelector('.spm-v4-wave')?.classList.remove('playing');root.querySelector('.spm-v4-status').textContent=t('No pudimos reproducir la voz. Toca “Escuchar historia” para reintentar.','We could not play the voice. Tap “Listen to story” to retry.')};speechSynthesis.speak(u);});
}
function pauseResume(root){if(!speaking)return;try{if(speechSynthesis.paused){speechSynthesis.resume();root.querySelector('.spm-v4-pause').textContent='⏸ '+t('Pausar audio','Pause audio');root.querySelector('.spm-v4-wave')?.classList.add('playing');}else{speechSynthesis.pause();root.querySelector('.spm-v4-pause').textContent='▶ '+t('Continuar audio','Resume audio');root.querySelector('.spm-v4-wave')?.classList.remove('playing');root.querySelector('.spm-v4-status').textContent=t('Audio en pausa.','Audio paused.');}}catch{}}

function renderScene(scene){
 if(!scene||scene.dataset.spmPremiumV4==='1')return;
 const id=identify(scene),story=STORIES[id];if(!story)return;
 addCSS();cancelSpeech();pendingScenario=id;scene.dataset.spmPremiumV4='1';
 const oldTitle=scene.querySelector(':scope > h3'),oldStory=scene.querySelector(':scope > p'),oldVisual=scene.querySelector(':scope > .sr-scene-visual');
 const legacy=[...scene.children].filter(el=>el!==oldTitle&&el!==oldStory&&el!==oldVisual);
 if(oldTitle)oldTitle.style.display='none';if(oldStory)oldStory.style.display='none';if(oldVisual)oldVisual.style.display='none';
 const wrapper=document.createElement('section');wrapper.className='spm-v4';
 wrapper.innerHTML=`<div class="spm-v4-head"><div><span class="spm-v4-kicker">${t('CASO · HISTORIA GUIADA','CASE · GUIDED STORY')}</span><h3>${lang()==='en'?story.title.en:story.title.es}</h3></div><span class="spm-v4-brand">SPM PREMIUM</span></div><div class="spm-v4-track">${story.turns.map((turn,i)=>{const d=turn.who==='doctor';const visual=d?`<div class="spm-v4-visual"><video muted playsinline loop autoplay preload="metadata" src="assets/videos/dr-spm-performance-anxiety-content.mp4"></video><span class="spm-v4-role">Doctor SPM</span></div>`:`<div class="spm-v4-visual"><img src="${patientSrc(i%2?2:1)}" alt="${t('Paciente SPM','SPM patient')}"><span class="spm-v4-role">${t('Paciente','Patient')}</span></div>`;return `<article class="spm-v4-card ${d?'doctor':'patient'} ${i===0?'active':''}" data-v4-turn="${i}"><div class="spm-v4-meta"><div class="spm-v4-step"><span class="spm-v4-num">${i+1}</span>${lang()==='en'?turn.label.en:turn.label.es}</div><div class="spm-v4-sub">${lang()==='en'?turn.sub.en:turn.sub.es}</div></div>${visual}<div class="spm-v4-copy">${lang()==='en'?turn.en:turn.es}</div></article>`}).join('')}</div><div class="spm-v4-controls"><button type="button" class="spm-v4-play">▶ ${t('Escuchar historia','Listen to story')}</button><button type="button" class="spm-v4-pause">⏸ ${t('Pausar audio','Pause audio')}</button><div class="spm-v4-wave" aria-hidden="true">${Array.from({length:24},()=>'<i></i>').join('')}</div><button type="button" class="spm-v4-guide">▤ ${t('Ver guía clínica completa','View full clinical guide')} →</button></div><div class="spm-v4-status" role="status" aria-live="polite">${t('Audio opcional. Solo se reproduce cuando tú lo activas.','Optional audio. It only plays when you activate it.')}</div></section>`;
 (oldTitle||scene.firstChild)?.insertAdjacentElement?.('afterend',wrapper);if(!wrapper.parentNode)scene.prepend(wrapper);
 const guide=document.createElement('details');guide.className='spm-v4-guidebox';guide.innerHTML=`<summary>${t('Ver guía clínica completa','View full clinical guide')}</summary><div class="spm-v4-guideinner"></div>`;wrapper.insertAdjacentElement('afterend',guide);legacy.forEach(el=>guide.querySelector('.spm-v4-guideinner').appendChild(el));
 wrapper.querySelectorAll('.spm-v4-card').forEach((c,i)=>c.onclick=()=>setActive(wrapper,i,false));wrapper.querySelector('.spm-v4-play').onclick=()=>playStory(wrapper,story);wrapper.querySelector('.spm-v4-pause').onclick=()=>pauseResume(wrapper);wrapper.querySelector('.spm-v4-guide').onclick=()=>{guide.open=true;guide.scrollIntoView({behavior:'smooth',block:'nearest'});};wrapper.querySelectorAll('video').forEach(v=>v.play().catch(()=>{}));
}

function sweep(){document.querySelectorAll('.sr-dialog #srScenario .sr-scene').forEach(renderScene);}
function watch(){const h=document.getElementById('srScenario');if(!h||h.dataset.spmV4Watch==='1')return;h.dataset.spmV4Watch='1';new MutationObserver(()=>requestAnimationFrame(sweep)).observe(h,{childList:true,subtree:true});sweep();}
document.addEventListener('click',e=>{const b=e.target.closest('[data-scenario]');if(b){pendingScenario=b.dataset.scenario||'';cancelSpeech();setTimeout(()=>{watch();sweep()},20);setTimeout(sweep,120);}if(e.target.closest('[data-sr-open="recovery"]'))setTimeout(watch,50);if(e.target.closest('[data-sr-close]'))cancelSpeech();},true);
window.addEventListener('pagehide',cancelSpeech);
setInterval(()=>{if(document.querySelector('.sr-dialog #srScenario')){watch();sweep()}},900);
})();