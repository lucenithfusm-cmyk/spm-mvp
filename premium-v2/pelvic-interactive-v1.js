(()=>{
'use strict';

const STEP_LABELS=[
 'Conoce tu músculo','Cómo identificarlo','Contracción correcta','Relajación completa',
 'Serie guiada','Recomendaciones','Práctica autónoma'
];
const STORAGE_KEY='spm_pelvic_interactive_sessions_v1';
const MODE_COUNT_KEY='spm_pelvic_mode_count';
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];

const css=`
.pfi-mode-panel{margin-top:14px;padding:14px;border:1px solid #2b5661;border-radius:16px;background:linear-gradient(145deg,#0d2229,#102b31)}
.pfi-mode-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px}.pfi-mode-head b{display:block;color:#eefbfc}.pfi-mode-head span{display:block;color:#9fb7bc;font-size:12px;line-height:1.4;margin-top:3px}
.pfi-mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.pfi-mode-choice{position:relative}.pfi-mode-choice .spm4btn,.pfi-launch{margin:0;width:100%;min-height:50px;border:0;border-radius:13px;padding:12px 14px;font:800 14px inherit;cursor:pointer;color:#fff}
.pfi-mode-choice .spm4btn{background:#16343c;border:1px solid #3a6570}.pfi-launch{background:linear-gradient(135deg,#70ddc2,#35bfc6);color:#05251f}
.pfi-recommended{position:absolute;right:8px;top:-8px;z-index:2;background:#f0c568;color:#332607;border-radius:999px;padding:3px 7px;font-size:10px;font-weight:900;box-shadow:0 4px 12px #0005}
.pfi-overlay{position:fixed;inset:0;z-index:40000;background:rgba(2,10,14,.9);backdrop-filter:blur(10px);display:grid;place-items:center;padding:12px;color:#123c3b}
.pfi-overlay .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.pfi-overlay[hidden]{display:none!important}.pfi-shell{width:min(1220px,99vw);max-height:96vh;overflow:auto;background:#fbfaf7;border:1px solid #d9e4df;border-radius:24px;box-shadow:0 35px 100px rgba(0,0,0,.48)}
.pfi-header{position:sticky;top:0;z-index:4;display:grid;grid-template-columns:auto 1fr auto auto;align-items:center;gap:18px;padding:15px 22px;background:rgba(251,250,247,.96);border-bottom:1px solid #dfe7e3;backdrop-filter:blur(10px)}
.pfi-brand{display:flex;align-items:center;gap:11px;padding-right:18px;border-right:1px solid #d7dfdc}.pfi-logo{font-size:30px;line-height:1;font-weight:950;color:#075b58;letter-spacing:-.05em}.pfi-brand small{display:block;color:#425b59;font-size:10px;margin-top:3px}.pfi-titlebar{font-size:20px;font-weight:900;color:#0b4442}.pfi-count{font-weight:900;color:#0b5552;white-space:nowrap}.pfi-close{width:40px;height:40px;border:1px solid #d4dfdb;border-radius:50%;background:#fff;color:#174b49;font-size:22px;cursor:pointer}
.pfi-progress{display:grid;grid-template-columns:repeat(7,minmax(105px,1fr));gap:4px;padding:12px 18px 8px;border-bottom:1px solid #e2e8e5;background:#fff;overflow-x:auto}.pfi-step{border:0;background:transparent;color:#4e6462;padding:4px 3px 10px;font:700 11px inherit;cursor:pointer;white-space:nowrap;border-bottom:3px solid transparent}.pfi-step i{display:grid;place-items:center;width:30px;height:30px;margin:0 auto 5px;border:1px solid #cddbd6;border-radius:50%;font-style:normal;font-size:13px;background:#fff}.pfi-step.on{color:#075b58;border-color:#08706b}.pfi-step.on i{background:#08706b;color:#fff;border-color:#08706b}.pfi-step.done i{background:#dff2eb;color:#075b58;border-color:#8ccfbd}
.pfi-main{padding:20px 24px 16px}.pfi-page-title{font-size:clamp(25px,3vw,36px);line-height:1.1;margin:0;color:#093f3d;letter-spacing:-.03em}.pfi-lead{margin:8px 0 18px;color:#425c5a;font-size:16px;line-height:1.5}.pfi-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(360px,.95fr);gap:16px}.pfi-card{background:#fff;border:1px solid #dbe5e1;border-radius:18px;padding:18px;box-shadow:0 7px 22px rgba(13,67,62,.06)}
.pfi-visual{position:relative;min-height:420px;border-radius:16px;overflow:hidden;background:radial-gradient(circle at 50% 35%,#eff8f5,#dfeee9 75%);display:grid;place-items:center}.pfi-visual img{width:min(360px,82%);max-height:385px;object-fit:contain;border-radius:16px;filter:saturate(.92) contrast(1.02)}.pfi-focus{position:absolute;left:50%;bottom:19%;width:35%;height:15%;transform:translateX(-50%);border:3px solid #2db9a6;border-radius:50%;box-shadow:0 0 24px rgba(45,185,166,.35);background:rgba(45,185,166,.12);transition:.5s}.pfi-focus:after{content:'Piso pélvico';position:absolute;left:50%;top:calc(100% + 8px);transform:translateX(-50%);white-space:nowrap;background:#075b58;color:#fff;border-radius:999px;padding:5px 9px;font-size:11px;font-weight:800}.pfi-visual.contract .pfi-focus{transform:translate(-50%,-17px) scaleX(.88);background:rgba(45,185,166,.35)}.pfi-visual.relax .pfi-focus{transform:translate(-50%,7px) scaleX(1.08);opacity:.7}.pfi-up{position:absolute;left:50%;bottom:34%;transform:translateX(-50%);font-size:44px;font-weight:900;color:#0b7b73;text-shadow:0 4px 18px #fff}.pfi-visual.relax .pfi-up{transform:translateX(-50%) rotate(180deg);opacity:.55}
.pfi-stack{display:grid;gap:10px}.pfi-info,.pfi-row{position:relative;border:1px solid #dce7e2;border-radius:14px;padding:14px 52px 14px 15px;background:#fff}.pfi-info b,.pfi-row b{display:block;color:#0a5551;font-size:15px;margin-bottom:4px}.pfi-info p,.pfi-row p{margin:0;color:#3e5856;font-size:14px;line-height:1.45}.pfi-num{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#08706b;color:#fff;font-weight:900;margin-right:8px}.pfi-audio{position:absolute;right:11px;top:50%;transform:translateY(-50%);width:34px;height:34px;border:1px solid #d5e0dc;border-radius:50%;background:#fff;color:#075b58;cursor:pointer;font-size:15px}.pfi-audio:hover{background:#edf8f4}.pfi-callout{margin-top:12px;border:1px solid #b8d8d9;border-radius:14px;background:#edf7f8;padding:13px 15px;color:#244d4d;font-size:14px;line-height:1.45}.pfi-callout.warn{border-color:#efc6b9;background:#fff2ed;color:#6d3328}.pfi-callout b{color:inherit}
.pfi-compare{display:grid;grid-template-columns:1fr 1fr;gap:12px}.pfi-mini-visual{position:relative;min-height:330px;border:1px solid #dce7e2;border-radius:16px;background:#eff7f4;overflow:hidden;display:grid;place-items:center;padding-bottom:46px}.pfi-mini-visual img{width:min(245px,84%);max-height:275px;object-fit:contain;border-radius:12px}.pfi-mini-label{position:absolute;left:15px;right:15px;bottom:12px;text-align:center;padding:7px;border-radius:999px;font-size:13px;font-weight:900;background:#dcefe8;color:#07564f}.pfi-mini-label.coral{background:#ffe0d7;color:#854034}.pfi-mini-visual .pfi-focus{bottom:25%;width:40%;height:13%}.pfi-mini-visual .pfi-focus:after{display:none}.pfi-mini-visual.contract .pfi-focus{transform:translate(-50%,-14px) scaleX(.88)}.pfi-mini-visual.relax .pfi-focus{transform:translate(-50%,6px) scaleX(1.08)}
.pfi-nav{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:0 24px 20px}.pfi-btn{border:1px solid #0b6a66;border-radius:13px;padding:11px 17px;background:#fff;color:#0a5551;font:850 14px inherit;cursor:pointer}.pfi-btn.primary{background:#08706b;color:#fff;border-color:#08706b;min-width:138px}.pfi-btn.coral{background:#f26b54;border-color:#f26b54;color:#fff}.pfi-btn:disabled{cursor:not-allowed;opacity:.42}.pfi-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}
.pfi-timer-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(330px,.9fr);gap:16px}.pfi-timer-card{text-align:center}.pfi-ring{--pct:0deg;width:min(310px,72vw);aspect-ratio:1;margin:8px auto 12px;border-radius:50%;background:conic-gradient(#08706b var(--pct),#dce9e5 0);display:grid;place-items:center}.pfi-ring:before{content:'';grid-area:1/1;width:82%;aspect-ratio:1;background:#fff;border-radius:50%;box-shadow:inset 0 0 0 1px #e0e9e6}.pfi-ring-content{grid-area:1/1;z-index:1}.pfi-phase{font-size:23px;font-weight:950;color:#0a5551}.pfi-seconds{font-size:70px;line-height:1;font-weight:950;color:#075b58}.pfi-next{display:inline-block;border:1px solid #b8d7d1;background:#edf7f4;border-radius:999px;padding:7px 12px;color:#315b57;font-weight:800;font-size:13px}.pfi-dots{display:flex;justify-content:center;gap:7px;margin:12px 0}.pfi-dot{width:11px;height:11px;border-radius:50%;background:#dbe5e1}.pfi-dot.done{background:#08706b}.pfi-dot.on{outline:3px solid #8fd2c1;background:#fff}.pfi-live{font-size:15px;line-height:1.5;color:#385654}.pfi-live strong{color:#075b58}.pfi-control-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.pfi-goodbad{display:grid;grid-template-columns:1fr 1fr;gap:14px}.pfi-list-head{font-size:19px;font-weight:900;margin-bottom:10px;color:#075b58}.pfi-bad .pfi-list-head{color:#c7513e}.pfi-checkrow{display:grid;grid-template-columns:28px 1fr 36px;align-items:center;gap:9px;padding:10px;border:1px solid #dce7e2;border-radius:12px;background:#fff;margin:7px 0}.pfi-checkrow>i{display:grid;place-items:center;width:25px;height:25px;border-radius:50%;background:#08706b;color:#fff;font-style:normal;font-weight:900}.pfi-bad .pfi-checkrow>i{background:#f26b54}.pfi-checkrow .pfi-audio{position:static;transform:none}.pfi-confirm{display:flex;align-items:flex-start;gap:10px;margin-top:12px;padding:12px;border:1px solid #cbded8;border-radius:12px;background:#fff}.pfi-confirm input{width:20px;height:20px;accent-color:#08706b}
.pfi-practice{display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,1fr);gap:16px}.pfi-summary{display:grid;gap:8px}.pfi-chip{display:flex;align-items:center;gap:8px;border:1px solid #dbe5e1;border-radius:12px;padding:10px 12px;background:#fff;color:#234f4c;font-weight:750}.pfi-mode-select{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pfi-option{border:1px solid #cadbd5;border-radius:12px;background:#fff;color:#315b57;padding:11px;cursor:pointer;font-weight:800}.pfi-option.on{border-color:#08706b;background:#eaf6f1;color:#075b58;box-shadow:inset 0 0 0 1px #08706b}.pfi-question{border:1px solid #dde7e3;border-radius:13px;padding:12px;margin:9px 0;background:#fff}.pfi-question b{display:block;color:#204f4c;margin-bottom:8px}.pfi-segments{display:grid;grid-auto-flow:column;grid-auto-columns:1fr}.pfi-segment{border:1px solid #d8e2de;background:#fff;color:#4b625f;padding:9px;cursor:pointer}.pfi-segment:first-child{border-radius:10px 0 0 10px}.pfi-segment:last-child{border-radius:0 10px 10px 0}.pfi-segment.on{background:#08706b;color:#fff;border-color:#08706b}.pfi-question[aria-disabled="true"]{opacity:.5;pointer-events:none}.pfi-success{text-align:center;padding:45px 20px}.pfi-success-icon{display:grid;place-items:center;width:80px;height:80px;margin:auto;border-radius:50%;background:#dff4eb;color:#08706b;font-size:42px;font-weight:900}.pfi-success h2{font-size:30px;color:#073f3c;margin:16px 0 7px}.pfi-status{min-height:22px;color:#7a3b31;font-size:13px;margin-top:8px}
@media(max-width:820px){.pfi-mode-grid,.pfi-grid,.pfi-timer-grid,.pfi-goodbad,.pfi-practice{grid-template-columns:1fr}.pfi-header{grid-template-columns:auto 1fr auto}.pfi-brand small{display:none}.pfi-count{display:none}.pfi-main{padding:17px 14px 12px}.pfi-nav{padding:0 14px 16px}.pfi-visual{min-height:330px}.pfi-visual img{max-height:300px}.pfi-compare{grid-template-columns:1fr}.pfi-mini-visual{min-height:280px}.pfi-shell{border-radius:18px}.pfi-step{min-width:112px}}
@media(prefers-reduced-motion:reduce){.pfi-focus{transition:none}}
`;
const style=document.createElement('style');
style.textContent=css;
document.head.appendChild(style);

let overlay=null;
let stepIndex=0;
let guidedDone=false;
let recommendationsAccepted=false;
let autonomousDone=false;
let saved=false;
let timer=null;
let run=null;
let signalMode='signals';
let answers={technique:null,relaxation:null,pain:null};
let lastFocus=null;

function escapeHtml(value){
 return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function speak(text){
 if(!('speechSynthesis' in window))return;
 try{
  speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang='es-CO';utterance.rate=.88;utterance.pitch=1;
  const voices=speechSynthesis.getVoices();
  utterance.voice=voices.find(v=>/es-CO/i.test(v.lang))||voices.find(v=>/^es/i.test(v.lang))||null;
  speechSynthesis.speak(utterance);
 }catch(_error){}
}
function audioButton(text,label='Escuchar explicación'){
 return `<button class="pfi-audio" type="button" data-say="${escapeHtml(text)}" aria-label="${label}">🔊</button>`;
}
function visual(state='locate',label='Piso pélvico'){
 const src=window.SPM_TRAINING_IMAGES?.pelvic||'';
 return `<div class="pfi-visual ${state}">${src?`<img src="${src}" alt="Ilustración educativa del piso pélvico masculino">`:''}<span class="pfi-focus"></span>${state==='contract'||state==='relax'?'<span class="pfi-up">↑</span>':''}<span class="sr-only">${label}</span></div>`;
}
function miniVisual(state,label,tone=''){
 const src=window.SPM_TRAINING_IMAGES?.pelvic||'';
 return `<div class="pfi-mini-visual ${state}">${src?`<img src="${src}" alt="${escapeHtml(label)}">`:''}<span class="pfi-focus"></span><span class="pfi-mini-label ${tone}">${label}</span></div>`;
}
function callout(title,body,warn=false){
 return `<div class="pfi-callout ${warn?'warn':''}"><b>${title}</b><br>${body}</div>`;
}
function navMarkup(nextDisabled=false,nextLabel='Siguiente'){
 return `<div class="pfi-nav"><button class="pfi-btn" type="button" data-prev ${stepIndex===0?'disabled':''}>‹ Anterior</button><button class="pfi-btn primary" type="button" data-next ${nextDisabled?'disabled':''}>${nextLabel} ›</button></div>`;
}
function infoRow(title,body,index){
 const spoken=`${title}. ${body}`;
 return `<div class="pfi-row"><b><span class="pfi-num">${index}</span>${title}</b><p>${body}</p>${audioButton(spoken)}</div>`;
}
function pageOne(){
 return `<main class="pfi-main"><h1 class="pfi-page-title">1. Conoce tu músculo</h1><p class="pfi-lead">Comprende qué vas a entrenar antes de empezar a contraer.</p><div class="pfi-grid"><div class="pfi-card">${visual('locate')}</div><div class="pfi-card pfi-stack">
 ${infoRow('Qué es','El piso pélvico es un conjunto de músculos situado en la parte inferior de la pelvis.',1)}
 ${infoRow('Qué aprenderás','Vas a reconocerlo, activarlo con suavidad y permitir que se relaje por completo.',2)}
 ${infoRow('Qué debes sentir','Una elevación interna suave al contraer y una liberación completa al relajar.',3)}
 ${callout('Objetivo inicial','Desarrollar conciencia y control. En esta fase, la técnica importa más que la fuerza.')}
 </div></div></main>${navMarkup()}`;
}
function pageTwo(){
 return `<main class="pfi-main"><h1 class="pfi-page-title">2. Cómo identificarlo</h1><p class="pfi-lead">Aprende a reconocer la zona sin convertir la micción en un ejercicio.</p><div class="pfi-grid"><div class="pfi-card">${visual('locate','Identificación del piso pélvico')}</div><div class="pfi-card pfi-stack">
 ${infoRow('Referencia inicial','Una sola vez, durante la micción, puedes detener brevemente el flujo para reconocer qué músculos se activan. Después continúa orinando normalmente.',1)}
 ${infoRow('Identifícalo fuera del baño','Imagina que evitas la salida de gases y elevas suavemente el periné hacia dentro y arriba.',2)}
 ${infoRow('Comprueba el resto del cuerpo','Mantén abdomen, glúteos, muslos y mandíbula relajados mientras respiras con normalidad.',3)}
 ${callout('Importante','La interrupción del flujo sirve únicamente como prueba inicial de reconocimiento. No hagas tus ejercicios mientras orinas ni interrumpas habitualmente el flujo.',true)}
 </div></div></main>${navMarkup()}`;
}
function pageThree(){
 return `<main class="pfi-main"><h1 class="pfi-page-title">3. Contracción correcta</h1><p class="pfi-lead">La contracción debe sentirse precisa, suave y acompañada de respiración normal.</p><div class="pfi-grid"><div class="pfi-card"><div class="pfi-compare">${miniVisual('locate','Relajado')}${miniVisual('contract','Contraído')}</div></div><div class="pfi-card pfi-stack">
 ${infoRow('Activa con suavidad','Eleva el piso pélvico hacia dentro y arriba, sin empujar hacia abajo.',1)}
 ${infoRow('Mantén durante 2 segundos','Sostén la contracción sin aumentar la fuerza y sin contener el aire.',2)}
 ${infoRow('Aísla el movimiento','No aprietes abdomen, glúteos ni muslos.',3)}
 ${callout('Señal correcta','Debes notar una elevación interna controlada, no una contracción máxima ni dolor.')}
 </div></div></main>${navMarkup()}`;
}
function pageFour(){
 return `<main class="pfi-main"><h1 class="pfi-page-title">4. Relajación completa</h1><p class="pfi-lead">Relajar por completo es tan importante como contraer.</p><div class="pfi-grid"><div class="pfi-card"><div class="pfi-compare">${miniVisual('contract','Tensión residual','coral')}${miniVisual('relax','Relajación completa')}</div></div><div class="pfi-card pfi-stack">
 ${infoRow('Libera lentamente','Después de contraer durante 2 segundos, deja de hacer fuerza de forma suave.',1)}
 ${infoRow('Vuelve al reposo','Siente cómo la zona se suelta y regresa a su estado natural.',2)}
 ${infoRow('Relaja durante 6 segundos','Respira con normalidad y espera antes de iniciar la siguiente repetición.',3)}
 ${infoRow('Comprueba todo el cuerpo','Abdomen, glúteos, muslos y mandíbula deben permanecer libres de tensión.',4)}
 ${callout('Recuerda','Relajar no significa empujar hacia abajo. No hagas fuerza como si fueras a evacuar y no contengas la respiración.',true)}
 </div></div></main>${navMarkup()}`;
}
function dotsMarkup(rep){
 return Array.from({length:10},(_,i)=>`<i class="pfi-dot ${i<rep-1?'done':i===rep-1?'on':''}"></i>`).join('');
}
function pageFive(){
 return `<main class="pfi-main"><h1 class="pfi-page-title">5. Serie guiada</h1><p class="pfi-lead">Sigue el ritmo: contrae con suavidad y relaja por completo.</p><div class="pfi-timer-grid"><section class="pfi-card pfi-timer-card">
 <div class="pfi-ring" id="pfiGuidedRing"><div class="pfi-ring-content"><div class="pfi-phase" id="pfiGuidedPhase">LISTO</div><div class="pfi-seconds" id="pfiGuidedSeconds">2 s</div></div></div>
 <span class="pfi-next" id="pfiGuidedNext">Después: RELAJA · 6 s</span><div class="pfi-dots" id="pfiGuidedDots">${dotsMarkup(1)}</div><b id="pfiGuidedRep">Repetición 1 de 10</b>
 </section><section class="pfi-card pfi-stack"><div class="pfi-info"><b>🔊 Audio guiado</b><p>La voz te indicará cuándo contraer y cuándo relajar.</p></div><div class="pfi-info"><b>Ahora</b><p class="pfi-live" id="pfiGuidedInstruction">Prepárate en una posición cómoda y continúa respirando.</p></div><div class="pfi-info"><b>Mantén relajados</b><p>Abdomen · Glúteos · Muslos · Mandíbula</p></div>${callout('Seguridad','Si aparece dolor, detén el ejercicio.',true)}
 <div class="pfi-control-grid"><button class="pfi-btn primary" type="button" id="pfiGuidedStart">▶ Iniciar</button><button class="pfi-btn" type="button" id="pfiGuidedRestart">↻ Reiniciar</button></div><button class="pfi-btn" type="button" id="pfiGuidedStop">Detener serie</button>
 </section></div></main>${navMarkup(!guidedDone)}`;
}
function recommendationRow(good,text,audio){
 return `<div class="pfi-checkrow"><i>${good?'✓':'×'}</i><span>${text}</span>${audioButton(audio||text)}</div>`;
}
function pageSix(){
 return `<main class="pfi-main"><h1 class="pfi-page-title">6. Recomendaciones</h1><p class="pfi-lead">La calidad del movimiento es más importante que la fuerza.</p><div class="pfi-goodbad"><section class="pfi-card"><div class="pfi-list-head">✓ Hazlo así</div>
 ${recommendationRow(true,'Contrae con suavidad.','Usa solo la intensidad necesaria para sentir una elevación interna.')}
 ${recommendationRow(true,'Respira normalmente.','No contengas el aire durante la contracción ni la relajación.')}
 ${recommendationRow(true,'Relaja por completo.','Respeta los 6 segundos de descanso antes de repetir.')}
 ${recommendationRow(true,'Progresa poco a poco.','La constancia y la técnica correcta son la prioridad.')}
 </section><section class="pfi-card pfi-bad"><div class="pfi-list-head">× Evita estos errores</div>
 ${recommendationRow(false,'Apretar abdomen, glúteos o muslos.')}
 ${recommendationRow(false,'Empujar hacia abajo o hacer fuerza excesiva.')}
 ${recommendationRow(false,'Practicar interrumpiendo habitualmente la orina.')}
 ${recommendationRow(false,'Continuar si aparece dolor o molestia.')}
 </section></div>${callout('Escucha a tu cuerpo','Detén el ejercicio si aparece dolor. Si la molestia persiste o tienes dificultad para orinar, solicita valoración profesional.',true)}
 <label class="pfi-confirm"><input type="checkbox" id="pfiAccept" ${recommendationsAccepted?'checked':''}><span>He leído y comprendido estas recomendaciones.</span></label></main>${navMarkup(!recommendationsAccepted)}`;
}
function question(id,title,options){
 return `<div class="pfi-question" data-question="${id}" aria-disabled="${autonomousDone?'false':'true'}"><b>${title}</b><div class="pfi-segments">${options.map(option=>`<button type="button" class="pfi-segment ${answers[id]===option?'on':''}" data-value="${option}">${option}</button>`).join('')}</div></div>`;
}
function pageSeven(){
 return `<main class="pfi-main"><h1 class="pfi-page-title">7. Práctica autónoma</h1><p class="pfi-lead">Ahora pon en práctica lo aprendido y registra tu progreso.</p><div class="pfi-practice"><section class="pfi-card">
 <div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><h2 style="margin:0;color:#0a5551">Tu práctica de hoy</h2><span class="pfi-next">Nivel inicial</span></div>
 <div class="pfi-ring" id="pfiSoloRing"><div class="pfi-ring-content"><div class="pfi-phase" id="pfiSoloPhase">LISTO</div><div class="pfi-seconds" id="pfiSoloSeconds">01:20</div></div></div>
 <div class="pfi-summary"><div class="pfi-chip">↻ 10 repeticiones</div><div class="pfi-chip">⏱ Contrae 2 s · Relaja 6 s</div><div class="pfi-chip">≋ Intensidad suave</div></div>
 <p style="font-weight:850;color:#315b57;margin-bottom:8px">Elige el nivel de apoyo</p><div class="pfi-mode-select"><button class="pfi-option ${signalMode==='signals'?'on':''}" type="button" data-mode="signals">🔊 Señales discretas</button><button class="pfi-option ${signalMode==='silent'?'on':''}" type="button" data-mode="silent">Sin señales</button></div>
 <div class="pfi-actions"><button class="pfi-btn primary" type="button" id="pfiSoloStart">▶ Iniciar práctica</button><button class="pfi-btn" type="button" id="pfiSoloRestart">↻ Reiniciar</button></div>
 </section><section class="pfi-card"><h2 style="margin-top:0;color:#184f73">Al terminar, registra cómo te fue</h2>
 ${question('technique','¿Cómo sentiste la técnica?',['Fácil','Adecuada','Difícil'])}
 ${question('relaxation','¿Pudiste relajar por completo?',['Sí','A veces','No'])}
 ${question('pain','¿Apareció dolor o molestia?',['No','Sí'])}
 <button class="pfi-btn primary" style="width:100%;margin-top:10px" type="button" id="pfiSave" ${!autonomousDone||saved?'disabled':''}>${saved?'Progreso guardado ✓':'Guardar progreso'}</button><div class="pfi-status" id="pfiStatus"></div>
 </section></div>${callout('Recuerda','No busques hacer más fuerza. Prioriza una contracción suave, respiración normal y relajación completa.')}</main><div class="pfi-nav"><button class="pfi-btn" type="button" data-prev>‹ Anterior</button><button class="pfi-btn primary" type="button" id="pfiFinish" ${saved?'':'disabled'}>Finalizar módulo</button></div>`;
}
function render(){
 stopTimer(false);
 const pages=[pageOne,pageTwo,pageThree,pageFour,pageFive,pageSix,pageSeven];
 $('.pfi-content',overlay).innerHTML=pages[stepIndex]();
 $('.pfi-count',overlay).textContent=`${stepIndex+1} de 7`;
 $$('.pfi-step',overlay).forEach((button,i)=>{
  button.classList.toggle('on',i===stepIndex);button.classList.toggle('done',i<stepIndex);
  button.onclick=()=>{stepIndex=i;render()};
 });
 const active=$$('.pfi-step',overlay)[stepIndex];active?.scrollIntoView({block:'nearest',inline:'center'});
 bindCommon();
 if(stepIndex===4)bindGuided();
 if(stepIndex===5)bindRecommendations();
 if(stepIndex===6)bindAutonomous();
}
function bindCommon(){
 $$('[data-say]',overlay).forEach(button=>button.onclick=()=>speak(button.dataset.say));
 $('[data-prev]',overlay)?.addEventListener('click',()=>{if(stepIndex>0){stepIndex--;render()}});
 $('[data-next]',overlay)?.addEventListener('click',()=>{if(stepIndex<6){stepIndex++;render()}});
}
function startTimer(kind){
 stopTimer(false);
 run={kind,rep:1,phase:'contract',left:2,running:true,paused:false,totalElapsed:0};
 cue();updateTimer();
 timer=setInterval(tick,1000);
}
function tick(){
 if(!run?.running||run.paused)return;
 run.left--;run.totalElapsed++;
 if(run.left<=0){
  if(run.phase==='contract'){run.phase='relax';run.left=6}
  else if(run.rep<10){run.rep++;run.phase='contract';run.left=2}
  else{return completeTimer()}
  cue();
 }
 updateTimer();
}
function cue(){
 if(!run)return;
 if(run.kind==='guided')speak(run.phase==='contract'?'Contrae suavemente. Continúa respirando.':'Relaja por completo.');
 if(run.kind==='solo'&&signalMode==='signals')speak(run.phase==='contract'?'Contrae.':'Relaja.');
}
function updateTimer(){
 if(!run)return;
 const prefix=run.kind==='guided'?'pfiGuided':'pfiSolo';
 const phase=$(`#${prefix}Phase`,overlay),seconds=$(`#${prefix}Seconds`,overlay),ring=$(`#${prefix}Ring`,overlay);
 if(phase)phase.textContent=run.phase==='contract'?'CONTRAE':'RELAJA';
 if(seconds)seconds.textContent=`${run.left} s`;
 if(ring){const elapsed=(run.rep-1)*8+(run.phase==='contract'?(2-run.left):(2+6-run.left));ring.style.setProperty('--pct',`${Math.min(360,elapsed/80*360)}deg`)}
 if(run.kind==='guided'){
  const rep=$('#pfiGuidedRep',overlay),dots=$('#pfiGuidedDots',overlay),next=$('#pfiGuidedNext',overlay),instruction=$('#pfiGuidedInstruction',overlay),start=$('#pfiGuidedStart',overlay);
  if(rep)rep.textContent=`Repetición ${run.rep} de 10`;if(dots)dots.innerHTML=dotsMarkup(run.rep);
  if(next)next.textContent=run.phase==='contract'?'Después: RELAJA · 6 s':'Después: CONTRAE · 2 s';
  if(instruction)instruction.textContent=run.phase==='contract'?'Contrae suavemente el piso pélvico mientras continúas respirando.':'Libera la contracción y permite que el piso pélvico vuelva por completo al reposo.';
  if(start)start.textContent=run.paused?'▶ Reanudar':'❚❚ Pausar';
 }else{
  const start=$('#pfiSoloStart',overlay);if(start)start.textContent=run.paused?'▶ Reanudar':'❚❚ Pausar';
 }
}
function completeTimer(){
 const kind=run.kind;clearInterval(timer);timer=null;run.running=false;
 if(kind==='guided'){
  guidedDone=true;speak('Serie guiada completada. Muy bien.');
  const phase=$('#pfiGuidedPhase',overlay),seconds=$('#pfiGuidedSeconds',overlay),ring=$('#pfiGuidedRing',overlay),next=$('[data-next]',overlay);
  if(phase)phase.textContent='COMPLETADO';if(seconds)seconds.textContent='✓';if(ring)ring.style.setProperty('--pct','360deg');if(next)next.disabled=false;
 }else{
  autonomousDone=true;if(signalMode==='signals')speak('Práctica completada. Registra cómo te fue.');
  const phase=$('#pfiSoloPhase',overlay),seconds=$('#pfiSoloSeconds',overlay),ring=$('#pfiSoloRing',overlay);
  if(phase)phase.textContent='COMPLETADO';if(seconds)seconds.textContent='✓';if(ring)ring.style.setProperty('--pct','360deg');
  $$('.pfi-question',overlay).forEach(q=>q.setAttribute('aria-disabled','false'));const save=$('#pfiSave',overlay);if(save)save.disabled=false;
 }
}
function stopTimer(resetDisplay=true){
 clearInterval(timer);timer=null;
 if(run)run.running=false;
 run=null;
 if(resetDisplay&&stepIndex===4){
  const phase=$('#pfiGuidedPhase',overlay),seconds=$('#pfiGuidedSeconds',overlay),ring=$('#pfiGuidedRing',overlay);
  if(phase)phase.textContent='LISTO';if(seconds)seconds.textContent='2 s';if(ring)ring.style.setProperty('--pct','0deg');
 }
}
function togglePause(){if(!run)return;run.paused=!run.paused;updateTimer()}
function bindGuided(){
 $('#pfiGuidedStart',overlay).onclick=()=>run?togglePause():startTimer('guided');
 $('#pfiGuidedRestart',overlay).onclick=()=>startTimer('guided');
 $('#pfiGuidedStop',overlay).onclick=()=>{stopTimer(true);speak('Serie detenida. Descansa y reinicia solo cuando te sientas cómodo.')};
}
function bindRecommendations(){
 $('#pfiAccept',overlay).onchange=event=>{recommendationsAccepted=event.target.checked;const next=$('[data-next]',overlay);if(next)next.disabled=!recommendationsAccepted};
}
function bindAutonomous(){
 $$('[data-mode]',overlay).forEach(button=>button.onclick=()=>{signalMode=button.dataset.mode;$$('[data-mode]',overlay).forEach(x=>x.classList.toggle('on',x===button))});
 $('#pfiSoloStart',overlay).onclick=()=>run?togglePause():startTimer('solo');
 $('#pfiSoloRestart',overlay).onclick=()=>startTimer('solo');
 $$('.pfi-segment',overlay).forEach(button=>button.onclick=()=>{const question=button.closest('[data-question]');answers[question.dataset.question]=button.dataset.value;$$('.pfi-segment',question).forEach(x=>x.classList.toggle('on',x===button))});
 $('#pfiSave',overlay).onclick=saveProgress;
 $('#pfiFinish',overlay).onclick=showSuccess;
}
async function saveProgress(){
 const status=$('#pfiStatus',overlay),button=$('#pfiSave',overlay);
 if(!answers.technique||!answers.relaxation||!answers.pain){status.textContent='Selecciona una respuesta en las tres preguntas.';return}
 button.disabled=true;button.textContent='Guardando…';
 const record={date:new Date().toISOString(),technique:answers.technique,relaxation:answers.relaxation,pain:answers.pain,mode:signalMode,repetitions:10,contract_seconds:2,relax_seconds:6};
 const rows=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');rows.push(record);localStorage.setItem(STORAGE_KEY,JSON.stringify(rows.slice(-30)));
 try{
  if(typeof window.SPM_SAVE_MODULE==='function')await window.SPM_SAVE_MODULE({day:6,moduleKey:'pelvic_interactive_v1',metricValue:answers.technique==='Fácil'?10:answers.technique==='Adecuada'?8:5,metadata:record});
  saved=true;button.textContent='Progreso guardado ✓';$('#pfiFinish',overlay).disabled=false;status.textContent=answers.pain==='Sí'?'Registro guardado. No repitas el ejercicio si la molestia persiste y solicita valoración profesional.':'';
  incrementModeCount();window.dispatchEvent(new CustomEvent('spm:pelvic-interactive-complete',{detail:record}));
 }catch(_error){
  button.disabled=false;button.textContent='Reintentar guardado';status.textContent='El registro quedó en este dispositivo, pero no pudo sincronizarse. Puedes reintentarlo.';
 }
}
function showSuccess(){
 stopTimer(false);
 $('.pfi-content',overlay).innerHTML=`<div class="pfi-success"><div class="pfi-success-icon">✓</div><h2>Módulo completado</h2><p class="pfi-lead">Tu práctica y tus sensaciones quedaron registradas. La próxima vez SPM podrá proponerte una presentación diferente.</p><button class="pfi-btn primary" type="button" id="pfiReturn">Volver a mi programa</button></div>`;
 $('#pfiReturn',overlay).onclick=closeInteractive;
}
function openInteractive(){
 lastFocus=document.activeElement;stepIndex=0;guidedDone=false;recommendationsAccepted=false;autonomousDone=false;saved=false;answers={technique:null,relaxation:null,pain:null};signalMode='signals';
 overlay.hidden=false;document.body.dataset.pfiOpen='1';document.body.style.overflow='hidden';render();$('.pfi-close',overlay).focus();
}
function closeInteractive(){
 stopTimer(false);try{speechSynthesis.cancel()}catch(_error){};overlay.hidden=true;delete document.body.dataset.pfiOpen;document.body.style.overflow='';lastFocus?.focus();
}
function incrementModeCount(){
 const count=Number(localStorage.getItem(MODE_COUNT_KEY)||0)+1;localStorage.setItem(MODE_COUNT_KEY,String(count));updateRecommendations();
}
function recommendedMode(){return Number(localStorage.getItem(MODE_COUNT_KEY)||0)%2===0?'guided':'interactive'}
function updateRecommendations(){
 const preferred=recommendedMode();$$('.pfi-mode-panel').forEach(panel=>{
  $$('.pfi-recommended',panel).forEach(x=>x.remove());const target=panel.querySelector(preferred==='guided'?'.pfi-guided-wrap':'.pfi-interactive-wrap');if(target)target.insertAdjacentHTML('afterbegin','<span class="pfi-recommended">Recomendado hoy</span>');
 });
}
function decorateCards(){
 $$('.dayCard').forEach(card=>{
  const text=(card.textContent||'').toLowerCase();if(!/piso p[eé]lvico/.test(text))return;
  const area=$('.interactive',card)||card;let panel=$('.pfi-mode-panel',card);
  if(!panel){
   panel=document.createElement('div');panel.className='pfi-mode-panel';panel.innerHTML=`<div class="pfi-mode-head"><div><b>Dos formas de entrenar</b><span>El protocolo es el mismo; cambia la presentación para mantener variedad y facilitar el aprendizaje.</span></div></div><div class="pfi-mode-grid"><div class="pfi-mode-choice pfi-guided-wrap"></div><div class="pfi-mode-choice pfi-interactive-wrap"><button class="pfi-launch" type="button">▦ Abrir experiencia interactiva · 7 pasos</button></div></div>`;area.prepend(panel);$('.pfi-launch',panel).onclick=event=>{event.preventDefault();event.stopPropagation();openInteractive()};
  }
  const guided=$('.spm4btn',card);if(guided&&guided.parentElement!==$('.pfi-guided-wrap',panel)){guided.textContent='▶ Sesión guiada con demostración';$('.pfi-guided-wrap',panel).appendChild(guided)}
  updateRecommendations();
 });
}

overlay=document.createElement('div');
overlay.className='pfi-overlay';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Módulo interactivo de piso pélvico masculino');
overlay.innerHTML=`<div class="pfi-shell"><header class="pfi-header"><div class="pfi-brand"><div><div class="pfi-logo">SPM</div><small>Sexual Performance Management</small></div></div><div class="pfi-titlebar">Piso pélvico masculino</div><div class="pfi-count">1 de 7</div><button class="pfi-close" type="button" aria-label="Cerrar módulo">×</button></header><nav class="pfi-progress" aria-label="Pasos del módulo">${STEP_LABELS.map((label,i)=>`<button class="pfi-step" type="button"><i>${i+1}</i>${label}</button>`).join('')}</nav><div class="pfi-content"></div></div>`;
document.body.appendChild(overlay);
$('.pfi-close',overlay).onclick=closeInteractive;
overlay.addEventListener('click',event=>{if(event.target===overlay)closeInteractive()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!overlay.hidden)closeInteractive()});
document.addEventListener('spm:premium-training-complete',async event=>{
 if(event.detail?.type!=='pelvic')return;
 incrementModeCount();
 try{if(typeof window.SPM_SAVE_MODULE==='function')await window.SPM_SAVE_MODULE({day:6,moduleKey:'pelvic_guided_v4',metricValue:8,metadata:{version:'v4',mode:'guided',completed_at:new Date().toISOString()}})}catch(_error){}
});
const grid=document.getElementById('dayGrid');
if(grid){new MutationObserver(()=>requestAnimationFrame(decorateCards)).observe(grid,{childList:true,subtree:true});decorateCards()}else document.addEventListener('DOMContentLoaded',decorateCards);
setTimeout(decorateCards,450);
})();
