(()=>{
'use strict';
const WELCOME_KEY='spm_cycle_welcome_v1';
const BASE='spm_baseline_scores', MID='spm_midpoint_scores', FINAL='spm_final_scores';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const json=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch(e){return{}}};
const dayCard=d=>$$('.dayCard').find(c=>Number($('.dayNum',c)?.textContent||0)===d);
const metric=id=>($(id)?.textContent||'—').trim();
function progressSnapshot(){return{checks:metric('#stChecks'),adh:metric('#stAdh'),conf:metric('#stConf'),outcome:metric('#stOutcome')}}
function openPlan(){const n=$('#navPlan');if(n&&!n.disabled)n.click()}
function ensureWelcome(){
 if($('#spmCycleWelcome'))return;
 const modal=document.createElement('div');modal.id='spmCycleWelcome';modal.className='spmCycleWelcome';modal.innerHTML=`
 <div class="spmCycleWelcomeBox" role="dialog" aria-modal="true" aria-labelledby="spmWelcomeTitle" data-audio-id="core-welcome">
   <button class="spmWelcomeClose" type="button" aria-label="Cerrar">×</button>
   <div class="spmCycleMark">SPM · CICLO INICIAL</div>
   <div class="spmWelcomeDays">28 <span>días</span></div>
   <h2 id="spmWelcomeTitle">Bienvenido. Tu programa empieza con una ruta hecha para ti.</h2>
   <p>Durante las próximas cuatro semanas, SPM utilizará tu evaluación, tu Performance Map™, tus registros y tu respuesta al entrenamiento para decidir <b>qué trabajar cada día</b>.</p>
   <div class="spmWelcomeGrid">
     <div><b>Tu día no será genérico</b><span>Podemos combinar regulación, respiración, piso pélvico, control eyaculatorio, confianza, focalización, recuperación, movimiento, nutrición u otras intervenciones según tu perfil.</span></div>
     <div><b>Vamos a aprender y medir</b><span>Cada práctica aporta información. Tus check-ins y escalas ayudan a decidir si conviene progresar, repetir, bajar intensidad o revisar algo.</span></div>
     <div><b>Esto es un proceso</b><span>Algunos cambios aparecen pronto; otros necesitan repetición. Veintiocho días construyen una base, no prometen una solución instantánea.</span></div>
   </div>
   <div class="spmWelcomeQuote"><b>Ya diste el primer paso.</b><br>No necesitas hacerlo perfecto. Necesitas hacerlo con constancia.</div>
   <button class="spmWelcomeStart" type="button">Entrar a mi Día 1</button>
 </div>`;
 document.body.appendChild(modal);
 const close=()=>{modal.classList.remove('on')};
 $('.spmWelcomeClose',modal).onclick=close;
 $('.spmWelcomeStart',modal).onclick=()=>{localStorage.setItem(WELCOME_KEY,'1');close();setTimeout(openPlan,80)};
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
}
function showWelcome(force=false){ensureWelcome();if(force||localStorage.getItem(WELCOME_KEY)!=='1')$('#spmCycleWelcome')?.classList.add('on')}
function injectPlanIntro(){
 const plan=$('#plan .card');if(!plan||$('#spmCycleIntro'))return;
 const intro=document.createElement('div');intro.id='spmCycleIntro';intro.className='spmCycleIntro';
 intro.innerHTML=`<div><span class="spmCycleMark">TU CICLO SPM</span><b>SPM decide qué trabajar hoy.</b><p>Tu biblioteca es un recurso; tu ruta principal la organiza SPM día a día según tu perfil y evolución.</p></div><button type="button" id="spmReopenWelcome">Cómo funciona mi ciclo</button>`;
 const tabs=$('#phaseTabs');(tabs?.parentNode||plan).insertBefore(intro,tabs||plan.firstChild);
 $('#spmReopenWelcome').onclick=()=>showWelcome(true);
}
function comparison(){
 const b=json(BASE),m=json(MID),f=json(FINAL),p=progressSnapshot();
 return {b,m,f,p,delta14:Number.isFinite(Number(m.change))?Number(m.change):null,delta28:Number.isFinite(Number(f.change))?Number(f.change):null};
}
function statsHtml(p){return `<div class="spmMilestoneStats"><div><strong>${p.adh}</strong><span>adherencia</span></div><div><strong>${p.checks}</strong><span>check-ins</span></div><div><strong>${p.conf}</strong><span>confianza prom.</span></div><div><strong>${p.outcome}</strong><span>respuesta prom.</span></div></div>`}
function milestoneHTML(day){
 const x=comparison(),p=x.p;
 if(day===7)return `<section class="spmMilestone" data-audio-id="milestone-day7"><div class="spmMilestoneBadge">LOGRO SPM · DÍA 7</div><h3>Primera semana completada</h3><p>Ya empezaste a convertir información en práctica. El valor de esta semana no está en hacerlo perfecto, sino en haber comenzado a reconocer patrones y repetir habilidades.</p>${statsHtml(p)}<div class="spmMilestoneNote">La repetición es la que transforma una técnica en una habilidad. Seguimos construyendo.</div></section>`;
 if(day===14){const d=x.delta14;return `<section class="spmMilestone checkpoint" data-audio-id="checkpoint-day14"><div class="spmMilestoneBadge">MITAD DEL CICLO · DÍA 14</div><h3>Veamos cómo estás evolucionando</h3><p>Hoy hacemos una revisión intermedia. SPM combina tu punto de partida con lo que has registrado durante las prácticas para decidir el siguiente tramo.</p>${statsHtml(p)}${d!==null?`<div class="spmDelta"><span>Cambio en registro global desde el inicio</span><strong>${d>0?'+':''}${d} puntos</strong></div>`:''}<div class="spmMilestoneNote"><b>Dos semanas siguen siendo un periodo corto.</b> Podemos observar tendencias, pero no convertir un cambio temprano en una conclusión definitiva. El entrenamiento necesita repetición y tiempo.</div></section>`}
 if(day===21)return `<section class="spmMilestone" data-audio-id="milestone-day21"><div class="spmMilestoneBadge">LOGRO SPM · DÍA 21</div><h3>Tres semanas de constancia</h3><p>Ya tienes suficiente práctica para reconocer qué habilidades se sienten más naturales y cuáles todavía necesitan repetición. SPM puede empezar a espaciar lo dominado y reforzar lo que sigue débil.</p>${statsHtml(p)}<div class="spmMilestoneNote">Consolidar no significa dejar de practicar; significa practicar con más intención y menos dependencia.</div></section>`;
 const d=x.delta28;return `<section class="spmMilestone final" data-audio-id="milestone-day28"><div class="spmMilestoneBadge">CIERRE DEL CICLO INICIAL · DÍA 28</div><h3>Completaste tu primer ciclo SPM</h3><p>Hoy no buscamos una etiqueta de “éxito” o “fracaso”. Comparamos tu línea de base con tu evolución para decidir qué mantener, qué reforzar y qué conviene revisar.</p>${statsHtml(p)}${d!==null?`<div class="spmDelta"><span>Cambio global desde el inicio</span><strong>${d>0?'+':''}${d} puntos</strong></div>`:''}<div class="spmMilestoneNote"><b>SPM 28 termina aquí. Tu entrenamiento no.</b> El siguiente paso puede ser mantenimiento 2–3 veces por semana, un segundo ciclo más específico o una revisión profesional cuando corresponda.</div></section>`;
}
function mountMilestones(){
 [7,14,21,28].forEach(d=>{const card=dayCard(d);if(!card)return;const body=$('.dayBody',card)||card;let host=$(`.spmMilestoneHost[data-day="${d}"]`,card);if(!host){host=document.createElement('div');host.className='spmMilestoneHost';host.dataset.day=String(d);body.prepend(host)}host.innerHTML=milestoneHTML(d)});
}
function refresh(){injectPlanIntro();mountMilestones()}
function guardWelcome(e){
 const target=e.target.closest?.('#goPlan,#navPlan');if(!target||localStorage.getItem(WELCOME_KEY)==='1')return;
 e.preventDefault();e.stopImmediatePropagation();showWelcome(false);
}
document.addEventListener('click',guardWelcome,true);
document.addEventListener('click',e=>{if(e.target.closest?.('#navPlan,#goPlan,.phaseBtn,.doneBtn,#coachSave'))setTimeout(refresh,220)});
window.addEventListener('spm:adaptation',()=>setTimeout(refresh,80));
document.addEventListener('DOMContentLoaded',()=>{ensureWelcome();setTimeout(refresh,900)},{once:true});
setTimeout(()=>{ensureWelcome();refresh()},1700);
new MutationObserver(()=>{clearTimeout(window.__spmCycleRefresh);window.__spmCycleRefresh=setTimeout(refresh,120)}).observe(document.body,{childList:true,subtree:true});
const css=document.createElement('style');css.textContent=`
.spmCycleWelcome{position:fixed;inset:0;z-index:60000;background:rgba(2,10,14,.88);backdrop-filter:blur(12px);display:none;place-items:center;padding:18px}.spmCycleWelcome.on{display:grid}.spmCycleWelcomeBox{position:relative;width:min(820px,96vw);max-height:92vh;overflow:auto;padding:30px;border-radius:28px;border:1px solid rgba(113,224,196,.3);background:radial-gradient(circle at 84% 10%,rgba(113,224,196,.12),transparent 34%),linear-gradient(160deg,#0b2027,#071014 72%);box-shadow:0 32px 100px #000b;color:#f3f7f8}.spmWelcomeClose{position:absolute;right:15px;top:13px;width:38px;height:38px;border:0;border-radius:50%;background:#173039;color:#d8e8e6;font-size:22px}.spmCycleMark,.spmMilestoneBadge{font-size:11px;font-weight:900;letter-spacing:.14em;color:#78e1c4}.spmWelcomeDays{font:800 72px/1 system-ui;margin:15px 0 4px;color:#f4d69a}.spmWelcomeDays span{font-size:18px;color:#a8bbc1}.spmCycleWelcome h2{font-size:clamp(29px,5vw,48px);line-height:1.02;margin:8px 0 16px}.spmCycleWelcomeBox>p{color:#c8d8db;line-height:1.62}.spmWelcomeGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0}.spmWelcomeGrid>div{padding:16px;border-radius:17px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.07)}.spmWelcomeGrid b,.spmWelcomeGrid span{display:block}.spmWelcomeGrid span{margin-top:7px;color:#adc0c4;font-size:13px;line-height:1.5}.spmWelcomeQuote{margin:20px 0;padding:17px;border-left:3px solid #f4d69a;background:rgba(244,214,154,.07);line-height:1.55}.spmWelcomeStart{width:100%;border:0;border-radius:14px;padding:15px;background:#78e1c4;color:#071014;font-weight:900;font-size:15px}.spmCycleIntro{display:flex;justify-content:space-between;gap:18px;align-items:center;padding:17px 18px;margin:16px 0;border-radius:17px;background:linear-gradient(120deg,rgba(120,225,196,.1),rgba(244,214,154,.06));border:1px solid rgba(120,225,196,.18)}.spmCycleIntro b,.spmCycleIntro p{display:block}.spmCycleIntro b{margin:5px 0;font-size:18px}.spmCycleIntro p{margin:0;color:#a8bbc1;font-size:13px}.spmCycleIntro button{flex:0 0 auto;border:1px solid rgba(120,225,196,.35);border-radius:12px;background:#0d252c;color:#dff7f0;padding:10px 12px;font-weight:800}.spmMilestoneHost{margin:4px 0 18px}.spmMilestone{padding:20px;border-radius:20px;border:1px solid rgba(120,225,196,.25);background:radial-gradient(circle at 96% 0,rgba(244,214,154,.1),transparent 33%),linear-gradient(155deg,rgba(12,37,43,.98),rgba(7,16,20,.98));color:#edf7f6}.spmMilestone h3{font-size:24px;margin:8px 0}.spmMilestone p{color:#bfd0d2;line-height:1.55}.spmMilestoneStats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:15px 0}.spmMilestoneStats div{padding:12px 8px;border-radius:13px;background:rgba(255,255,255,.055);text-align:center}.spmMilestoneStats strong,.spmMilestoneStats span{display:block}.spmMilestoneStats strong{font-size:20px;color:#f4d69a}.spmMilestoneStats span{font-size:10px;color:#a8bbc1;margin-top:3px}.spmMilestoneNote{padding:13px;border-radius:13px;background:rgba(120,225,196,.07);color:#d9e8e7;line-height:1.5;font-size:13px}.spmDelta{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px 14px;margin:12px 0;border-radius:13px;background:rgba(244,214,154,.08)}.spmDelta span{font-size:12px;color:#c7d4d5}.spmDelta strong{color:#f4d69a;font-size:20px}.spmMilestone.final{border-color:rgba(244,214,154,.35)}@media(max-width:720px){.spmCycleWelcomeBox{padding:24px 18px}.spmWelcomeGrid{grid-template-columns:1fr}.spmWelcomeDays{font-size:56px}.spmCycleIntro{align-items:flex-start;flex-direction:column}.spmCycleIntro button{width:100%}.spmMilestoneStats{grid-template-columns:1fr 1fr}.spmMilestone h3{font-size:21px}}
`;document.head.appendChild(css);
window.SPM_CYCLE_EXPERIENCE_V1={showWelcome,refresh};
})();