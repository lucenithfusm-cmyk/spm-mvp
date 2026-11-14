(()=>{
'use strict';
const ASSET='assets/pelvic/';
const IMAGES=[
 '8c01592d-7a59-434e-a0b6-11a7497a0b0d.jpg',
 '88248104-99d8-4340-b161-6e10254cfe18.jpg',
 'c06c0c2c-c127-4ffe-a96b-2763a5a1a535.jpg',
 '3ff4df78-d1cf-445c-b4f3-71872a963cc3.jpg',
 '841613f3-3655-4b84-a4f1-2ba7e6e5d41a.jpg',
 '653bbcb2-4e10-4b7c-8574-d7cbdc0585e9.jpg',
 'dd8b7cf0-25b9-4231-958c-079f9bf886c5.jpg'
].map(x=>ASSET+x);
const STEPS=[
 {title:'Conoce tu piso pélvico',lead:'Una base más fuerte para una mejor vida sexual.',audio:'El piso pélvico masculino participa en el soporte pélvico, el control y la respuesta sexual. En este módulo aprenderás a identificarlo, contraerlo y relajarlo de forma correcta.'},
 {title:'Identifica los músculos',lead:'Aprende qué zona debes activar, sin compensaciones.',audio:'Concéntrate en la musculatura profunda de la base de la pelvis. La sensación correcta se parece a contener gases o detener el flujo de orina, pero no debes practicar interrumpiendo la micción de forma habitual.'},
 {title:'Posición inicial',lead:'Empieza en una postura cómoda y estable.',audio:'Acuéstate boca arriba, flexiona las rodillas y apoya los pies. Mantén hombros, abdomen y glúteos relajados. Respira de forma lenta y cómoda.'},
 {title:'Relajación completa',lead:'Antes de contraer, aprende a soltar.',audio:'Inhala lentamente por la nariz y exhala de forma suave. Observa cómo se relajan abdomen, glúteos, muslos y piso pélvico. Dedica uno o dos minutos a esta preparación.'},
 {title:'Contracción correcta',lead:'Activa solo el piso pélvico y después relaja por completo.',audio:'Contrae de forma suave la musculatura del piso pélvico sin apretar glúteos, abdomen ni muslos. Respira con comodidad y sin retener el aire. Después relaja completamente antes de la siguiente repetición.'},
 {title:'Serie guiada',lead:'Entrena acompañado con temporizador, fases y repeticiones.',audio:'La sesión combina contracciones lentas y rápidas. Sigue el temporizador. Contrae solo el piso pélvico, respira sin retener el aire y respeta cada fase de relajación.'},
 {title:'Práctica autónoma y progreso',lead:'Registra tus sesiones y convierte la práctica en un hábito.',audio:'Realiza tus sesiones estructuradas de entrenamiento y registra tu avance. La constancia es más importante que la intensidad. Si aparece dolor, suspende y solicita valoración profesional.'}
 ];
const SPM_PELVIC_NARRATIONS=["Bienvenido al programa de contracción y fuerza del piso pélvico masculino. Estos músculos contribuyen al soporte de los órganos pélvicos y participan en funciones urinarias y sexuales. Aprenderás a reconocerlos, activarlos con suavidad y relajarlos por completo. La técnica importa más que hacer fuerza. Entrena únicamente cuando tu ruta lo indique.","Estos son los músculos de tu piso pélvico. La lámina identifica el pubococcígeo, iliococcígeo, bulbocavernoso e isquiocavernoso. Contribuyen al soporte de los órganos pélvicos y participan en la continencia urinaria, la erección y el control eyaculatorio. Para localizar la zona, imagina que contienes gases y elevas suavemente el periné. No practiques interrumpiendo el flujo de orina.","Prepara tu cuerpo. Busca un lugar tranquilo y ropa cómoda. Puedes recostarte con cabeza y espalda apoyadas, brazos a los lados, rodillas flexionadas y pies apoyados y separados de manera cómoda. También puedes elegir estar sentado, con la espalda y ambos pies apoyados. Afloja mandíbula, abdomen, glúteos y muslos. Respira sin esfuerzo y elige la postura que te resulte más confortable.","Comienza con relajación completa. Acuéstate sobre una superficie cómoda. Inhala suavemente por la nariz y exhala sin prisa, sin retener el aire ni empujar hacia abajo. Suelta mandíbula, hombros, abdomen, glúteos, muslos y piso pélvico. Mantén la atención durante uno o dos minutos si te resulta cómodo. Si aparece dolor, presión o aumento de tensión, suspende la práctica y solicita valoración profesional.","Para contraer correctamente, imagina que cierras suavemente el paso de gases y elevas la zona pélvica hacia dentro. No aprietes glúteos, abdomen ni muslos, y sigue respirando. En la serie guiada respetarás los tiempos de contracción y una relajación completa antes de cada repetición. Puedes comparar el movimiento con los botones inferiores. La pauta de fuerza SPM es de dos sesiones semanales cuando corresponda, no varias veces al día.","Ahora realizaremos el entrenamiento acompañado, solo si tu programa habilitó la sesión. El cronómetro organiza tres series: diez contracciones lentas de cinco segundos seguidas de cinco segundos de relajación, y diez rápidas de un segundo seguidas de un segundo de relajación. Descansa treinta segundos entre series. Respira normalmente y permite que el músculo se relaje por completo. No es necesario levantar las caderas como en la imagen. Si hay dolor o tensión excesiva, detente.","Has llegado al último paso. La calidad de la técnica y la constancia son más importantes que contraer con fuerza máxima. Realiza solo las dos sesiones semanales de contracción y fuerza asignadas por SPM cuando correspondan. Combínalas con hábitos saludables, movimiento y manejo del estrés. Pelvic Floor Lab es un recurso distinto de conciencia y relajación. Después de practicar y guardar la serie, vuelve a Hoy para confirmar tu actividad. Si solo consultaste las pantallas, regresa sin registrar una sesión no realizada."];
const KEY='spm_pelvic_v2_progress';
let sessionScope='',sessionDay=1,sessionOrigin='library',readiness=null;
let sessionOptions={},sessionToken=0,guidedResult=null,guidedSaved=false,guidedSaving=false,resultReported=false,saveError='';
function progressKey(){const c=window.SPM_RESOURCE_CONTEXT?.();return c?KEY+':'+c.userId+':'+c.planId:KEY+':guest';}
function sessionValid(){const c=window.SPM_RESOURCE_CONTEXT?.();return !!c&&sessionScope===c.userId+':'+c.planId&&sessionDay===Number(c.day)&&(readiness?readiness():window.SPM_PELVIC_LAB?.restriction(c))==='ready';}
const OLD_KEY='spm_pelvic_interactive_sessions_v1';
let step=0, overlay=null, timerId=null, timerState=null, lastFocus=null, posture='reclined', techniquePhase='relax', cueEnabled=false;
const cueAudio=typeof Audio==='function'?new Audio():null;
const cuePaths={CONTRAE:'pelvic-floor-lab/audio/pf/pf.cue.contrae.mp3',RELAJA:'pelvic-floor-lab/audio/pf/pf.cue.suelta-total.mp3',DESCANSA:'pelvic-floor-lab/audio/pf/pf.cue.suelta.mp3'};
function cuePhase(){if(!cueEnabled||!cueAudio)return;try{cueAudio.pause();cueAudio.src=cuePaths[timerState?.phase]||cuePaths.DESCANSA;cueAudio.currentTime=0;const played=cueAudio.play();played?.catch?.(()=>{});}catch{}}
const css=`
#spmPelvicV2[hidden]{display:none!important}#spmPelvicV2{position:fixed;inset:0;z-index:60000;background:rgba(3,13,17,.9);backdrop-filter:blur(12px);display:grid;place-items:center;padding:10px;color:#153c39}.pv2-shell{width:min(1280px,99vw);max-height:97vh;overflow:auto;background:#f7f2e9;border-radius:28px;box-shadow:0 35px 100px #0008;border:1px solid #d9e1dc}.pv2-head{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:center;padding:15px 20px;background:rgba(247,242,233,.96);backdrop-filter:blur(10px);border-bottom:1px solid #d8e0dc}.pv2-brand{font-weight:950;font-size:24px;color:#083f3c}.pv2-brand small{display:block;font-size:10px;font-weight:700;color:#657874}.pv2-count{font-weight:900;color:#0d615b}.pv2-close{width:42px;height:42px;border:1px solid #ccd8d3;border-radius:50%;background:#fff;color:#174c49;font-size:22px;cursor:pointer}.pv2-progress{display:grid;grid-template-columns:repeat(7,minmax(95px,1fr));gap:5px;padding:10px 14px;background:#fff;border-bottom:1px solid #e0e6e2;overflow-x:auto}.pv2-step{border:0;background:transparent;color:#627672;padding:6px;font:800 11px inherit;cursor:pointer;white-space:nowrap}.pv2-step i{display:grid;place-items:center;width:30px;height:30px;margin:0 auto 5px;border-radius:50%;border:1px solid #cbd8d3;background:#fff;font-style:normal}.pv2-step.on{color:#075b56}.pv2-step.on i{background:#08706b;color:#fff;border-color:#08706b}.pv2-main{padding:18px 20px}.pv2-kicker{display:inline-flex;align-items:center;gap:7px;color:#0b6c65;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.pv2-title{font-size:clamp(28px,4vw,44px);line-height:1.03;letter-spacing:-.035em;color:#103f3b;margin:8px 0}.pv2-lead{font-size:17px;color:#506763;margin:0 0 16px}.pv2-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(340px,.95fr);gap:18px}.pv2-card{background:#fff;border:1px solid #dbe4df;border-radius:22px;padding:16px;box-shadow:0 8px 25px rgba(18,73,66,.07)}.pv2-image{padding:0;overflow:hidden;background:#0b2f32}.pv2-image img{display:block;width:100%;height:100%;min-height:460px;object-fit:contain;background:#0b2f32}.pv2-stack{display:grid;gap:10px}.pv2-info{position:relative;border:1px solid #dce6e1;border-radius:15px;padding:14px 54px 14px 15px;background:#fff}.pv2-info b{display:block;color:#0a5550;margin-bottom:4px}.pv2-info p{margin:0;color:#465f5b;font-size:14px;line-height:1.48}.pv2-audio{position:absolute;right:11px;top:50%;transform:translateY(-50%);width:36px;height:36px;border:1px solid #d2dfda;border-radius:50%;background:#fff;color:#075b56;cursor:pointer;font-size:16px}.pv2-audio.on{background:#08706b;color:#fff}.pv2-callout{border:1px solid #bfd8d2;background:#eef7f4;border-radius:14px;padding:12px 14px;color:#315852;font-size:14px;line-height:1.45}.pv2-callout.warn{border-color:#efc7b8;background:#fff3ee;color:#743a2e}.pv2-nav{display:flex;justify-content:space-between;gap:10px;padding:0 20px 20px}.pv2-btn{border:1px solid #0c6c67;border-radius:13px;padding:11px 17px;background:#fff;color:#0a5954;font:850 14px inherit;cursor:pointer}.pv2-btn.primary{background:#b9903f;color:#fff;border-color:#b9903f;min-width:140px}.pv2-btn.teal{background:#08706b;color:#fff}.pv2-btn:disabled{opacity:.4;cursor:not-allowed}.pv2-timer{text-align:center}.pv2-ring{--p:0deg;width:min(280px,72vw);aspect-ratio:1;margin:6px auto 12px;border-radius:50%;background:conic-gradient(#08706b var(--p),#dce8e4 0);display:grid;place-items:center}.pv2-ring:before{content:'';grid-area:1/1;width:82%;aspect-ratio:1;border-radius:50%;background:#fff;box-shadow:inset 0 0 0 1px #e1e8e5}.pv2-ringin{grid-area:1/1;z-index:1}.pv2-phase{font-size:22px;font-weight:950;color:#0c5a55}.pv2-sec{font-size:64px;line-height:1;font-weight:950;color:#0a514c}.pv2-meta{font-size:13px;color:#5a716d}.pv2-controls{display:flex;justify-content:center;gap:8px;flex-wrap:wrap}.pv2-calendar{display:grid;grid-template-columns:repeat(7,1fr);gap:7px}.pv2-day{border:1px solid #d6e1dd;border-radius:11px;background:#fff;padding:9px 4px;color:#4d6661;cursor:pointer;font-weight:800}.pv2-day.done{background:#0b756e;color:#fff;border-color:#0b756e}.pv2-statgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.pv2-stat{border:1px solid #dbe5e1;border-radius:13px;padding:11px;text-align:center;background:#fff}.pv2-stat b{display:block;font-size:22px;color:#0a5853}.pv2-stat span{font-size:11px;color:#6a7d79}.pv2-success{text-align:center;padding:35px 10px}.pv2-success .check{width:78px;height:78px;border-radius:50%;display:grid;place-items:center;margin:auto;background:#dff2eb;color:#08706b;font-size:40px;font-weight:950}.pv2-success h2{font-size:31px;color:#0a4844}.pv2-hidden{display:none!important}@media(max-width:860px){.pv2-grid{grid-template-columns:1fr}.pv2-main{padding:14px}.pv2-nav{padding:0 14px 14px}.pv2-image img{min-height:0}.pv2-head{grid-template-columns:1fr auto}.pv2-count{display:none}.pv2-brand small{display:none}.pv2-statgrid{grid-template-columns:1fr 1fr 1fr}.pv2-calendar{grid-template-columns:repeat(4,1fr)}}`;
const premiumStyle=`
#spmPelvicV2{background:#061821eb;color:#0f2e4f}
.pv2-shell{width:min(1110px,98vw);max-height:96dvh;background:#fcfbf8;border:1px solid #c5a46c66;border-radius:22px}
.pv2-head{background:#0b2937;color:#fff;border-bottom:1px solid #c5a46c55}
.pv2-brand{color:#f5f6f6;font-size:23px}.pv2-brand small{color:#d5b877;letter-spacing:.1em}
.pv2-count{color:#e1c388}.pv2-close{background:#173745;border-color:#c5a46c77;color:#fff}
.pv2-progress{background:#102e3c;border-bottom:1px solid #254d5d;padding:12px}
.pv2-step{color:#ccd9dc;min-width:90px;font-size:12px}.pv2-step i{background:#183847;border-color:#52717c;color:#e8f2f3}
.pv2-step.on{color:#e2be74}.pv2-step.on i{background:#c5a46c;border-color:#c5a46c;color:#0b2937}
.pv2-main{padding:clamp(15px,3vw,30px)}.pv2-kicker{color:#b39050;letter-spacing:.17em}
.pv2-title{color:#0f2e4f;font-size:clamp(30px,4.6vw,47px);line-height:1.12;letter-spacing:-.03em}
.pv2-lead{color:#31475b;font-size:clamp(16px,2.2vw,20px);line-height:1.45}
.pv2-card{background:#fff;border-color:#e6e4dd;border-radius:19px;box-shadow:0 10px 25px #082e4710}
.pv2-image{background:#0b293d;border-color:#173d50;position:relative}
.pv2-image img{object-fit:contain;background:#0b293d;max-height:540px;min-height:260px}
.pv2-info b{color:#0f2e4f;font-size:17px}.pv2-info p{color:#35536a;font-size:15px;line-height:1.55}
.pv2-audio{color:#0f2e4f;border-color:#c5a46c77;background:#f8f1e7;min-width:44px;min-height:44px;border-radius:50%}
.pv2-btn.primary,.pv2-btn.teal{background:#c5a46c;color:#0f2e4f;border-color:#c5a46c;font-weight:900}
.pv2-btn{border-radius:14px;min-height:48px;font-size:15px}
.pv2-positions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:12px;border:1px solid #e1e6e5;border-radius:16px;background:#f9fcfb}
.pv2-position{border:2px solid #d2e0de;border-radius:14px;padding:7px;background:#f0f4f3;color:#0f2e4f;font-weight:850;cursor:pointer;display:grid;gap:8px}
.pv2-position img{display:block;width:100%;height:150px;object-fit:contain;background:#0d2c3c;border-radius:10px}
.pv2-position.on{border-color:#c5a46c;background:#fff7ea;box-shadow:inset 0 0 0 1px #c5a46c}
.pv2-position span{font-size:15px}
.pv2-movement-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.pv2-movement-steps>div{background:#f5f6f4;border:1px solid #dae3df;border-radius:13px;padding:9px;display:grid;gap:5px}
.pv2-movement-steps b{display:grid;place-items:center;width:27px;height:27px;background:#0f6e6a;color:white;border-radius:50%}
.pv2-movement-steps strong{color:#0f2e4f;font-size:13px}.pv2-movement-steps small{color:#425c60;font-size:12px}
.pv2-technique-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.pv2-technique-actions button{flex:1;min-width:140px;min-height:45px;border:1px solid #7da59c;background:#eaf4f1;color:#0b5652;border-radius:11px;font-weight:800;cursor:pointer}
.pv2-technique-actions button.on{background:#0d6460;color:white;border-color:#0d6460}
.pv2-technique-status{font-size:14px;color:#224d4c;min-height:40px;padding:10px;border-radius:12px;background:#e8f7f1}
.pv2-sequence-phases{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:12px 0}
.pv2-sequence-phase{background:#eff3f2;border:1px solid #d1dedb;border-radius:11px;padding:9px 3px;font-size:13px;font-weight:850;color:#627b76}
.pv2-sequence-phase.on{background:#0d6560;color:#fff;border-color:#0d6560}
.pv2-visual-cue{padding:12px 16px;background:#0c2b3c;border-radius:14px;margin:12px 0;color:#fff;font-weight:800;text-align:center}
.pv2-visual-cue>span{display:inline-block;border:2px solid #c5a46c;border-radius:16px;padding:11px 18px;transition:transform .4s ease}
.pv2-visual-cue.contract>span{transform:translateY(-9px);background:#c5a46c35}
.pv2-visual-cue.release>span{transform:translateY(7px);background:#19b5a333}
.pv2-visual-cue.rest>span{transform:translateY(0)}
.pv2-visual-cue small{display:block;color:#e2dfd3;font-weight:500;padding-top:10px}
.pv2-timer .pv2-ring{background:conic-gradient(#c5a46c var(--p),#d8e6e2 0)}
.pv2-timer .pv2-phase{color:#0d625e}.pv2-timer .pv2-sec{color:#0f2e4f}
.pv2-grid{align-items:start}.pv2-nav{padding-top:10px}
@media(max-width:680px){.pv2-shell{width:calc(100vw - 10px);max-height:95dvh;border-radius:18px}.pv2-head{padding:12px}.pv2-progress{padding:8px}.pv2-main{padding:13px}.pv2-image img{min-height:0;max-height:350px}.pv2-position img{height:120px}.pv2-movement-steps{grid-template-columns:repeat(2,minmax(0,1fr))}.pv2-grid{gap:10px}.pv2-step{font-size:11px}.pv2-nav{padding:10px 14px 15px}.pv2-btn{font-size:14px}}

/* SPM Premium · navegación de siete tarjetas, optimizada para móvil */
#spmPelvicV2 .pv2-progress{display:flex;gap:10px;align-items:stretch;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:12px 14px}
#spmPelvicV2 .pv2-progress::-webkit-scrollbar{display:none}
#spmPelvicV2 .pv2-step{box-sizing:border-box;flex:0 0 150px;min-width:0;min-height:100px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:12px 10px;border:1px solid #547483;border-radius:16px;background:#143b4b;color:#eaf1f1;white-space:normal;overflow-wrap:break-word;text-align:center;font:700 13px/1.3 system-ui,-apple-system,sans-serif;scroll-snap-align:center;transition:background .2s,border-color .2s,box-shadow .2s}
#spmPelvicV2 .pv2-step i{box-sizing:border-box;display:grid;place-items:center;flex:0 0 38px;width:38px;height:38px;margin:0;border:1px solid #65828d;border-radius:50%;background:#1b4555;color:#f1f7f7;font-size:18px;font-style:normal;font-weight:800}
#spmPelvicV2 .pv2-step.on{background:linear-gradient(145deg,#f6e7c2,#c5a46c);border-color:#f6e7c2;color:#0f2e4f;box-shadow:0 6px 18px #0003}
#spmPelvicV2 .pv2-step.on i{background:#0f2e4f;border-color:#0f2e4f;color:#fff}
#spmPelvicV2 .pv2-step.done{background:#1d4049;border-color:#83baa9;color:#e2f5ec}
#spmPelvicV2 .pv2-step.done i{background:#83cdb9;border-color:#83cdb9;color:#0a3027}
#spmPelvicV2 .pv2-position.on{border-color:#c5a46c;box-shadow:0 0 0 2px #c5a46c66,0 8px 16px #0f2e4f19;background:#fff6e6}
#spmPelvicV2 .pv2-step:focus-visible,#spmPelvicV2 .pv2-btn:focus-visible{outline:3px solid #f1cf94;outline-offset:3px}
@media(max-width:680px){
 #spmPelvicV2 .pv2-progress{gap:9px;padding:10px}
 #spmPelvicV2 .pv2-step{flex-basis:136px;min-height:90px;font-size:12px;padding:10px 8px}
 #spmPelvicV2 .pv2-step i{flex-basis:35px;width:35px;height:35px;font-size:16px}
 #spmPelvicV2 .pv2-nav{position:sticky;bottom:0;z-index:4;background:#fcfbf8;border-top:1px solid #e1d7c4;box-shadow:0 -6px 16px #0f2e4f16;padding:12px 14px max(14px,env(safe-area-inset-bottom))}
 #spmPelvicV2 #pv2Next{max-width:76%;white-space:normal;text-align:center;line-height:1.25}
}
@media(prefers-reduced-motion:reduce){#spmPelvicV2 .pv2-step{transition:none}}
#spmPelvicV2 .pv2-main.pv2-cover-page{background:#fff;padding:0!important}#spmPelvicV2 .pv2-cover{width:min(100%,742px);margin:0 auto;background:#fff}#spmPelvicV2 .pv2-cover-crop{position:relative;width:100%;aspect-ratio:741 / 1158;overflow:hidden;background:#fff}#spmPelvicV2 .pv2-cover-crop>img{position:absolute;width:138.19%;height:auto;max-width:none;left:-36.03%;top:-9.24%;border:0;box-shadow:none;display:block;background:#fff}#spmPelvicV2 .pv2-cover-audio{position:absolute;right:4.5%;top:7.5%;width:15%;height:13%;min-height:44px;border:0;border-radius:18px;background:transparent;cursor:pointer}#spmPelvicV2 .pv2-cover-audio.on{background:#c5a46c22}#spmPelvicV2 .pv2-cover-audio:focus-visible{outline:3px solid #b99a5b;outline-offset:-3px}
`;
const style=document.createElement('style');style.textContent=css+premiumStyle;document.head.appendChild(style);
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function speak(text,btn){try{speechSynthesis.cancel();document.querySelectorAll('.pv2-audio.on').forEach(x=>x.classList.remove('on'));const u=new SpeechSynthesisUtterance(text);u.lang='es-CO';u.rate=.96;u.pitch=1;btn?.classList.add('on');u.onend=u.onerror=()=>btn?.classList.remove('on');speechSynthesis.speak(u)}catch(_){}}
function info(title,text,audio=text){return `<div class="pv2-info"><b>${esc(title)}</b><p>${esc(text)}</p><button class="pv2-audio" type="button" aria-label="Escuchar explicación" data-say="${esc(audio)}">🔊</button></div>`}

// Select one comfortable starting posture; this is guidance only, not a readiness assessment.
function postureCards(){
 const choices=[['reclined','Recostado','pelvic-floor-lab/assets/spm-posture-reclined-20261113.webp'],['seated','Sentado','pelvic-floor-lab/assets/spm-posture-seated-20261113.webp']];
 return '<section class="pv2-card"><h3>Elige una postura cómoda</h3><div class="pv2-positions">'+choices.map(([id,label,src])=>'<button type="button" class="pv2-position '+(posture===id?'on':'')+'" data-pv2-position="'+id+'" aria-pressed="'+(posture===id)+'"><img src="'+src+'" alt="Posición '+label.toLowerCase()+' con ropa SPM" loading="eager"><span>'+label+'</span></button>').join('')+'</div><p class="pv2-callout">'+(posture==='reclined'?'Apoya cabeza y espalda. Flexiona las rodillas con los pies apoyados.':'Apoya espalda y pies en el suelo, con las rodillas cómodas.')+'</p></section>';
}
function techniqueCards(){
 const labels=[['Identifica','Reconoce la base de la pelvis'],['Contrae','Cierra y eleva suavemente'],['Mantén','Respira sin apnea'],['Relaja','Suelta del todo antes de repetir']];
 const description=techniquePhase==='contract'?'Imagina elevar suavemente la zona pélvica, sin apretar glúteos, abdomen ni muslos.':'Deja volver la zona al reposo. No empujes hacia abajo ni hagas fuerza adicional.';
 return '<section class="pv2-card"><h3>Prueba la guía visual</h3><div class="pv2-movement-steps">'+labels.map((x,i)=>'<div><b>'+(i+1)+'</b><strong>'+x[0]+'</strong><small>'+x[1]+'</small></div>').join('')+'</div><div class="pv2-technique-actions"><button type="button" data-pv2-technique="contract" class="'+(techniquePhase==='contract'?'on':'')+'" aria-pressed="'+(techniquePhase==='contract')+'">Visualizar contracción</button><button type="button" data-pv2-technique="relax" class="'+(techniquePhase==='relax'?'on':'')+'" aria-pressed="'+(techniquePhase==='relax')+'">Visualizar relajación</button></div><p class="pv2-technique-status" role="status">'+description+'</p><p class="pv2-callout warn">La animación es una referencia educativa, no mide la contracción muscular. Si aparece dolor, no entrenes.</p></section>';
}

function coverBody(){
 // Reuse the original approved art from the same repository: crop its white center.
 const heights=[1050,1050,1040,1050,1050,1035,1100],height=heights[step];
 const top=(-200/height*100).toFixed(2)+'%';
 const spoken=SPM_PELVIC_NARRATIONS[step];
 const image='<div class="pv2-cover-crop" style="aspect-ratio:741 / '+height+';--cover-top:'+top+'"><img src="'+IMAGES[step]+'" loading="eager" decoding="async" alt="Lámina SPM del paso '+(step+1)+': '+esc(STEPS[step].title)+'"><button type="button" class="pv2-cover-audio" data-say="'+esc(spoken)+'" aria-label="Escuchar explicación y recomendaciones del paso '+(step+1)+'" title="Escuchar explicación y recomendaciones"></button></div>';
 // The visual art is not a functional button. Preserve real practice controls below it.
 const exercise=step===2?postureCards():step===4?techniqueCards():step===5?timerBody():step===6?practiceBody():'';
 const notes={
  3:'Respira sin retener el aire. La pausa de tres segundos impresa en la lámina no es necesaria.',
  4:'SPM programa las sesiones de fuerza dos veces por semana cuando están indicadas; no varias veces al día.',
  5:'Las contracciones se realizan sin levantar la cadera: la postura de puente es solo ilustrativa.',
  6:'La pauta de fuerza de SPM es de dos sesiones semanales cuando corresponda; no de cuatro a cinco sesiones por semana.'
 };
 const warning=notes[step]?'<aside class="pv2-protocol" role="note"><b>Indicacion actual SPM:</b> '+esc(notes[step])+'</aside>':'';
 return '<section class="pv2-cover" data-pelvic-poster-step="'+(step+1)+'">'+image+warning+(exercise?'<div class="pv2-cover-extras">'+exercise+'</div>':'')+'<details class="pv2-transcript"><summary>Leer explicación y recomendaciones (opcional)</summary><p>'+esc(spoken)+'</p></details></section>';
}
function standardBody(){
 const rows={
 0:[['Qué vas a entrenar','Reconocimiento, control, fuerza funcional y relajación del piso pélvico masculino.'],['Cómo usar este módulo','Avanza en orden. Puedes escuchar cada explicación y volver a cualquier paso cuando necesites repasarlo.']],
 1:[['Identificación útil','Imagina que quieres contener gases o elevar suavemente la base pélvica. Esa es la zona que buscamos activar.'],['Evita este hábito','No uses de forma repetida el corte del chorro urinario como ejercicio; úsalo solo como referencia conceptual.']],
 2:[['Postura',posture==='reclined'?'Recostado boca arriba, rodillas flexionadas y pies apoyados.':'Sentado con espalda apoyada y ambos pies en el suelo.'],['Preparación','Antes de comenzar, afloja mandíbula, hombros, abdomen, glúteos y muslos.']],
 3:[['Respira','Inhala por la nariz y exhala lentamente.'],['Relaja','Suelta abdomen, glúteos, muslos y zona pélvica unos momentos.'],['Señal correcta','Debes sentir descenso y soltura, no esfuerzo.']],
 4:[['Activa','Contrae suavemente el piso pélvico como si quisieras elevarlo hacia dentro.'],['Aísla','No aprietes glúteos, abdomen ni muslos y no contengas la respiración.'],['Relaja','Después de cada contracción, suelta completamente antes de repetir.']]
 };
 return `<div class="pv2-grid"><div class="pv2-card pv2-image"><img src="${step===2?(posture==='reclined'?'pelvic-floor-lab/assets/spm-posture-reclined-20261113.webp':'pelvic-floor-lab/assets/spm-posture-seated-20261113.webp'):IMAGES[step]}" alt="${esc(STEPS[step].title)}"></div><div class="pv2-card"><div class="pv2-stack">${rows[step].map(r=>info(r[0],r[1])).join('')}${step===2?postureCards():step===4?techniqueCards():''}<div class="pv2-callout"><b>Escucha opcional:</b> usa las bocinas 🔊 cuando prefieras seguir la guía sin leer.</div>${step===3?'<div class="pv2-callout warn">Si aparece dolor o molestia pélvica persistente, suspende el ejercicio y solicita valoración profesional.</div>':''}</div></div></div>`
}
function timerBody(){
 const s=timerState||makeTimer();
 return `<div class="pv2-grid"><div class="pv2-card pv2-image"><img src="${IMAGES[5]}" alt="Serie guiada de piso pélvico"></div><div class="pv2-card pv2-timer"><h3>Serie guiada · fuerza y relajación</h3><p class="pv2-callout">Sigue la secuencia automática. El gesto es suave, sin contener el aire; cada repetición incluye relajación completa.</p><div class="pv2-sequence-phases" aria-label="Estados de la serie"><div class="pv2-sequence-phase" data-pv2-state="CONTRAE">Contrae</div><div class="pv2-sequence-phase" data-pv2-state="RELAJA">Relaja</div><div class="pv2-sequence-phase" data-pv2-state="DESCANSA">Descansa</div></div><div class="pv2-visual-cue rest" id="pv2VisualCue" aria-live="polite"><span>Zona pélvica en reposo</span><small>Ilustración orientativa · no mide tus músculos</small></div><div class="pv2-ring" id="pv2Ring"><div class="pv2-ringin"><div class="pv2-phase" id="pv2Phase">${s.phase}</div><div class="pv2-sec" id="pv2Sec">${s.remaining}</div><div class="pv2-meta" id="pv2Meta">Serie ${s.series}/3 · ${s.label}</div></div></div><div class="pv2-controls"><button class="pv2-btn teal" id="pv2Start">${s.running?'Pausar':'Iniciar'}</button><button class="pv2-btn" id="pv2Reset">Reiniciar</button><button class="pv2-btn" id="pv2CueToggle" type="button" aria-pressed="${cueEnabled}">${cueEnabled?'🔊 Señales de voz activas':'🔈 Activar señales de voz'}</button></div><div class="pv2-callout" style="margin-top:12px">Lentas: 10 repeticiones de 5 s de contracción + 5 s de relajación. Rápidas: 10 repeticiones de 1 s + 1 s. Tres series, con 30 s de descanso.</div></div></div>`
}
function progress(){try{return JSON.parse(localStorage.getItem(progressKey())||'{}')}catch(_){return {}}}
function saveProgressData(p){if(!sessionValid())return;localStorage.setItem(progressKey(),JSON.stringify(p))}
function practiceBody(){
 const p=progress(),days=Array.isArray(p.days)?p.days:[],done=days.filter(Boolean).length;
 const weekStart=Math.floor((sessionDay-1)/7)*7,thisWeek=days.slice(weekStart,weekStart+7).filter(Boolean).length;
 return `<div class="pv2-grid"><div class="pv2-card pv2-image"><img src="${IMAGES[6]}" alt="Práctica autónoma y progreso"></div><div class="pv2-card"><div class="pv2-stack">${info('Tu pauta de fuerza','Sigue las dos sesiones semanales que aparecen en Hoy, cuando estén indicadas según tu preparación. El Pelvic Floor Lab semanal es un módulo diferente de conciencia, relajación y coordinación.')}<div class="pv2-statgrid"><div class="pv2-stat"><b>${done}</b><span>días con sesión registrada</span></div><div class="pv2-stat"><b>${thisWeek}</b><span>sesiones esta semana del recorrido</span></div><div class="pv2-stat"><b>2</b><span>sesiones de fuerza por semana</span></div></div><div class="pv2-callout">El registro se realiza al terminar y guardar la serie guiada. Revisa tus actividades y continúa tu recorrido desde Hoy.</div><div class="pv2-callout">La calidad técnica y la constancia importan más que hacer contracciones más fuertes.</div></div></div></div>`;
}
function render(){if(!overlay)return;stopTimer(false);const s=STEPS[step];overlay.querySelector('.pv2-count').textContent=`${step+1} de 7`;overlay.querySelectorAll('.pv2-step').forEach((b,i)=>{b.classList.toggle('on',i===step);b.classList.toggle('done',i<step);if(i===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});const page=overlay.querySelector('.pv2-main');page.classList.toggle('pv2-cover-page',step===0);page.innerHTML=step===0?coverBody():`<span class="pv2-kicker">PISO PÉLVICO · CONTRACCIÓN Y FUERZA · PASO ${step+1} DE 7</span><h1 class="pv2-title">${esc(s.title)}</h1><p class="pv2-lead">${esc(s.lead)}</p>${step<5?standardBody():step===5?timerBody():practiceBody()}`;overlay.querySelector('#pv2Prev').disabled=step===0;overlay.querySelector('#pv2Next').textContent=step===6?'Finalizar y volver a mi día':'Siguiente';bindPage();overlay.querySelector('.pv2-shell').scrollTop=0;const nav=overlay.querySelector('.pv2-progress'),active=nav?.querySelector('.pv2-step.on');if(active)nav.scrollLeft=Math.max(0,active.offsetLeft-nav.offsetLeft-(nav.clientWidth-active.clientWidth)/2)}
function bindPage(){overlay.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>speak(b.dataset.say,b));if(step===2){overlay.querySelectorAll('[data-pv2-position]').forEach(b=>b.onclick=()=>{posture=b.dataset.pv2Position;render();});}
 if(step===4){overlay.querySelectorAll('[data-pv2-technique]').forEach(b=>b.onclick=()=>{techniquePhase=b.dataset.pv2Technique;render();});}
 if(step===5){overlay.querySelector('#pv2Start').onclick=toggleTimer;overlay.querySelector('#pv2CueToggle').onclick=()=>{cueEnabled=!cueEnabled;const b=overlay.querySelector('#pv2CueToggle');b.textContent=cueEnabled?'🔊 Señales de voz activas':'🔈 Activar señales de voz';b.setAttribute('aria-pressed',String(cueEnabled));if(cueEnabled&&timerState?.running)cuePhase();else if(cueAudio?.src){try{cueAudio.pause()}catch{}}};overlay.querySelector('#pv2Reset').onclick=()=>{if(guidedSaving||guidedSaved)return;stopTimer(true);guidedResult=null;saveError='';render()};updateTimerUI();}if(step===6){overlay.querySelectorAll('[data-day]').forEach(b=>{b.disabled=true;});}}
function makeTimer(){return {series:1,block:'slow',rep:1,phase:'CONTRAE',remaining:5,duration:5,running:false,label:'Lenta 1/10'}}
function nextPhase(s){const before=s.phase;if(s.block==='slow'){if(s.phase==='CONTRAE'){s.phase='RELAJA';s.remaining=s.duration=5}else{if(s.rep<10){s.rep++;s.phase='CONTRAE';s.remaining=s.duration=5;s.label=`Lenta ${s.rep}/10`}else{s.block='fast';s.rep=1;s.phase='CONTRAE';s.remaining=s.duration=1;s.label='Rápida 1/10'}}}else if(s.block==='fast'){if(s.phase==='CONTRAE'){s.phase='RELAJA';s.remaining=s.duration=1}else{if(s.rep<10){s.rep++;s.phase='CONTRAE';s.remaining=s.duration=1;s.label=`Rápida ${s.rep}/10`}else if(s.series<3){s.block='rest';s.phase='DESCANSA';s.remaining=s.duration=30;s.label='Descanso entre series'}else{s.block='done';s.phase='COMPLETADO';s.remaining=0;s.running=false;s.label='Serie guiada finalizada';markGuidedDone()}}}else if(s.block==='rest'){s.series++;s.block='slow';s.rep=1;s.phase='CONTRAE';s.remaining=s.duration=5;s.label='Lenta 1/10'}if(s.phase!==before)cuePhase();}
function updateTimerUI(){const s=timerState;if(!s)return;const phase=overlay.querySelector('#pv2Phase'),sec=overlay.querySelector('#pv2Sec'),meta=overlay.querySelector('#pv2Meta'),ring=overlay.querySelector('#pv2Ring'),start=overlay.querySelector('#pv2Start');if(!phase)return;phase.textContent=s.phase;sec.textContent=s.remaining;meta.textContent=`Serie ${s.series}/3 · ${s.label}`;const visual=overlay.querySelector('#pv2VisualCue');if(visual){const action=s.phase==='CONTRAE'?'contract':s.phase==='RELAJA'?'release':'rest';visual.className='pv2-visual-cue '+action;visual.querySelector('span').textContent=s.phase==='CONTRAE'?'Eleva suavemente · sin apretar glúteos':s.phase==='RELAJA'?'Suelta completamente · respira':s.phase==='DESCANSA'?'Descansa y respira con normalidad':'Serie completada';overlay.querySelectorAll('[data-pv2-state]').forEach(el=>el.classList.toggle('on',el.dataset.pv2State===s.phase));}ring.style.setProperty('--p',`${s.duration?360*(1-s.remaining/s.duration):360}deg`);start.textContent=s.block==='done'?'Serie terminada':s.running?'Pausar':'Iniciar';start.disabled=s.block==='done'||guidedSaving;const reset=overlay.querySelector('#pv2Reset');if(reset)reset.disabled=guidedSaving||guidedSaved;if(s.block==='done'){let save=overlay.querySelector('#pv2Save');if(!save){save=document.createElement('button');save.id='pv2Save';save.className='pv2-btn teal';save.type='button';overlay.querySelector('.pv2-controls').append(save);}save.disabled=guidedSaving;save.textContent=guidedSaving?'Guardando…':guidedSaved?'Ver registro':'Guardar entrenamiento';save.onclick=finish;}}
function toggleTimer(){if(!sessionValid()){stopTimer(false);return;}if(!timerState)timerState=makeTimer();const s=timerState;if(s.block==='done'){timerState=makeTimer()}else s.running=!s.running;if(s.running){cuePhase();clearInterval(timerId);timerId=setInterval(()=>{if(!sessionValid()){stopTimer(false);close();return;}if(!timerState?.running)return;timerState.remaining--;if(timerState.remaining<=0)nextPhase(timerState);updateTimerUI()},1000)}else clearInterval(timerId);updateTimerUI()}
function stopTimer(reset){clearInterval(timerId);timerId=null;if(cueEnabled&&cueAudio?.src){try{cueAudio.pause()}catch{}}if(timerState)timerState.running=false;if(reset)timerState=makeTimer()}
function showSaveError(message){if(!overlay||overlay.hidden)return;let note=overlay.querySelector('.pv2-save-status');if(!note){note=document.createElement('p');note.className='pv2-callout warn pv2-save-status';note.setAttribute('role','alert');overlay.querySelector('.pv2-main').append(note);}note.textContent=message;}
function markGuidedDone(){
 if(!sessionValid()||timerState?.block!=='done')return;
 stopTimer(false);
 guidedResult||={source:'pelvic-classic-v2',completed:true,at:new Date().toISOString(),day:sessionDay,activityId:sessionOptions.activityId,intent:sessionOptions.intent==='scheduled'?'scheduled':'library'};
 // Completing the actual sequence makes a result eligible; the user still saves it explicitly.
 updateTimerUI();
}
async function finish(){
 if(guidedSaving)return false;
 if(!sessionValid()){close();return false;}
 if(timerState?.block!=='done'||!guidedResult){step=5;render();showSaveError('Para registrar el entrenamiento, realiza la serie guiada. Leer las indicaciones no cuenta como una sesión.');return false;}
 const token=sessionToken;guidedSaving=true;saveError='';updateTimerUI();
 try{
  if(!guidedSaved){
   if(typeof window.SPM_SAVE_MODULE!=='function')throw Error('Save unavailable');
   const saved=await window.SPM_SAVE_MODULE({day:sessionDay,moduleKey:'pelvic_interactive_v2',metricValue:10,metadata:{completed_at:guidedResult.at,guided_completed:true,version:'v2',origin:sessionOrigin}});
   if(saved!==true&&saved?.ok!==true)throw Error('Save not acknowledged');
   if(token!==sessionToken||!sessionValid())return false;
   guidedSaved=true;
   try{const p=progress();p.guidedCompleted=(p.guidedCompleted||0)+1;p.lastGuidedAt=guidedResult.at;p.moduleCompleted=true;p.completedAt=guidedResult.at;p.days=Array.isArray(p.days)?p.days:Array(28).fill(false);p.days[sessionDay-1]=true;saveProgressData(p);const rows=JSON.parse(localStorage.getItem(OLD_KEY+':'+sessionScope)||'[]');rows.push({date:guidedResult.at,mode:'premium_v2',version:'v2'});localStorage.setItem(OLD_KEY+':'+sessionScope,JSON.stringify(rows.slice(-30)));}catch(_){/* The account record is authoritative; this legacy display cache is optional. */}
  }
  if(token!==sessionToken||!sessionValid())return false;
  if(!resultReported&&typeof sessionOptions.onResult==='function'){const accepted=await sessionOptions.onResult({...guidedResult});if(accepted===false)throw Error('Result not accepted');resultReported=true;}
  if(token!==sessionToken||!sessionValid())return false;
  overlay.querySelector('.pv2-main').innerHTML=`<div class="pv2-success"><div class="check">✓</div><h2>Entrenamiento guardado</h2><p class="pv2-lead">Tu sesión quedó registrada. Vuelve a Hoy para confirmar la actividad de tu recorrido.</p><button class="pv2-btn primary" id="pv2Return">Volver a mi día</button></div>`;overlay.querySelector('.pv2-nav').classList.add('pv2-hidden');overlay.querySelector('.pv2-progress').classList.add('pv2-hidden');overlay.querySelector('#pv2Return').onclick=returnToAssignedDay;return true;
 }catch(_){saveError='No se pudo guardar el entrenamiento. Tu práctica se conserva: pulsa Guardar entrenamiento para reintentar.';showSaveError(saveError);return false;}
 finally{if(token===sessionToken){guidedSaving=false;updateTimerUI();if(!sessionValid())close();}}
}
function returnToAssignedDay(){
 // OnClose leads back to Hoy and reveals the confirmation form. Do not overwrite it.
 const isDaily=sessionOrigin==='dailyPlan',hasCallback=typeof sessionOptions.onClose==='function';
 const closed=close();
 if(closed&&isDaily&&!hasCallback)window.SPM_DAILY_PRACTICE?.open?.({focus:true});
 return closed;
}
async function finalizeStep(){
 if(guidedSaving)return false;
 if(timerState?.block==='done'&&guidedResult){
  const saved=await finish();
  return saved?returnToAssignedDay():false;
 }
 // Visiting the seven explanations does not count as a completed exercise.
 return returnToAssignedDay();
}
function open(opts={}){if(!opts.readiness&&window.SPM_PELVIC_HUB)return window.SPM_PELVIC_HUB.open(opts);const c=window.SPM_RESOURCE_CONTEXT?.();if(!c||guidedSaving)return false;sessionToken++;sessionOptions={...opts};guidedResult=null;guidedSaved=false;guidedSaving=false;resultReported=false;saveError='';sessionScope=c.userId+':'+c.planId;sessionDay=Number(c.day)||1;sessionOrigin=opts.origin||'library';readiness=typeof opts.readiness==='function'?opts.readiness:null;if(!sessionValid())return false;lastFocus=document.activeElement;step=0;posture='reclined';techniquePhase='relax';cueEnabled=false;timerState=makeTimer();overlay.hidden=false;document.body.style.overflow='hidden';overlay.querySelector('.pv2-nav').classList.remove('pv2-hidden');overlay.querySelector('.pv2-progress').classList.remove('pv2-hidden');render();overlay.querySelector('.pv2-close').focus();return true;}
function close(){if(guidedSaving){showSaveError('Espera a que termine el guardado antes de salir.');return false;}if(!overlay||overlay.hidden)return true;stopTimer(false);try{speechSynthesis.cancel()}catch(_){}overlay.hidden=true;document.body.style.overflow='';lastFocus?.focus();const onClose=sessionOptions.onClose;sessionOptions={};sessionToken++;onClose?.();return true;}
function build(){overlay=document.createElement('div');overlay.id='spmPelvicV2';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Entrenamiento premium de piso pélvico masculino');overlay.innerHTML=`<div class="pv2-shell"><header class="pv2-head"><div class="pv2-brand">SPM <small>Premium · Sexual Performance Management</small></div><div class="pv2-count">1 de 7</div><button class="pv2-close" type="button" aria-label="Cerrar">×</button></header><nav class="pv2-progress" aria-label="Pasos">${STEPS.map((s,i)=>`<button class="pv2-step" type="button" data-step="${i}"><i>${i+1}</i>${esc(s.title)}</button>`).join('')}</nav><main class="pv2-main"></main><div class="pv2-nav"><button class="pv2-btn" id="pv2Prev">Anterior</button><button class="pv2-btn primary" id="pv2Next">Siguiente</button></div></div>`;document.body.appendChild(overlay);overlay.querySelector('.pv2-close').onclick=close;overlay.querySelector('#pv2Prev').onclick=()=>{if(step>0){step--;render()}};overlay.querySelector('#pv2Next').onclick=()=>{if(step<6){step++;render()}else finalizeStep()};overlay.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{step=+b.dataset.step;render()});overlay.onclick=e=>{if(e.target===overlay)close()};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)close()});const grid=document.getElementById('dayGrid');if(grid)grid.addEventListener('click',e=>{const launch=e.target.closest('.pfi-launch');if(!launch)return;e.preventDefault();e.stopPropagation();open()},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});else build();
window.addEventListener('spm:session-change',()=>{if(overlay&&!overlay.hidden&&!sessionValid())close();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopTimer(false);});
window.SPM_PELVIC_V2={open,close};
})();
