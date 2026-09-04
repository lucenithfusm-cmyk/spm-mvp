(()=>{
'use strict';

const INTRO=`Bienvenido al entrenamiento Start Stop. Este ejercicio está diseñado para ayudarte a reconocer con mayor anticipación el aumento de tu nivel de excitación y las sensaciones que aparecen antes de alcanzar el punto de no retorno eyaculatorio. A través de la práctica aprenderás a identificar esas señales, detener la estimulación en el momento adecuado, permitir que la excitación disminuya y posteriormente reiniciar. Con el entrenamiento progresivo buscamos desarrollar una mayor conciencia de tu respuesta sexual y mejorar tu capacidad de regulación y control eyaculatorio. Hay algo importante que debes saber antes de comenzar. El objetivo del entrenamiento es que progresivamente puedas realizar entre cuatro y seis paradas durante una sesión de autoestimulación antes de la eyaculación. Pero no esperamos que lo consigas desde las primeras sesiones. Al comienzo, lograr identificar correctamente una sola parada ya es parte del progreso. Con la práctica podrás reconocer las señales cada vez con mayor anticipación, realizar una segunda parada, luego una tercera y avanzar progresivamente hacia el objetivo. Por eso recomendamos realizar este entrenamiento tres veces por semana. La constancia es más importante que intentar hacerlo perfecto desde el primer día. No tengas prisa. Tu objetivo inicial es aprender a reconocer tu cuerpo y anticiparte al punto de no retorno. El control se entrena de manera progresiva. Cuando estés listo, comenzaremos paso a paso con la técnica Start Stop.`;

const STEPS=[
 {n:'01',t:'Prepárate',d:'Elige un momento tranquilo y sin prisa. El objetivo es entrenar reconocimiento y control, no evaluar tu rendimiento.'},
 {n:'02',t:'Inicia de forma gradual',d:'Comienza la autoestimulación a una intensidad cómoda y presta atención a cómo aumenta tu excitación.'},
 {n:'03',t:'Reconoce tu umbral',d:'Usa una escala de 0 a 10. Cuando te aproximes a 8/10, anticípate: no esperes a llegar al punto de no retorno.'},
 {n:'04',t:'STOP',d:'Detén completamente la estimulación. Mantén respiración natural y dirige la atención a cómo disminuye la excitación.'},
 {n:'05',t:'Espera el descenso',d:'Reinicia solo cuando percibas una reducción clara de la excitación y recuperes sensación de control.'},
 {n:'06',t:'Reinicia y repite',d:'Vuelve a estimular de forma gradual. El objetivo progresivo es alcanzar de 4 a 6 paradas antes de la eyaculación.'}
];

const css=`
#spmEcModal{position:fixed;inset:0;z-index:1000;background:rgba(4,12,18,.82);backdrop-filter:blur(8px);display:none;overflow:auto;padding:22px}
#spmEcModal.on{display:block}.ecShell{width:min(980px,100%);margin:18px auto;background:#f7fafc;color:#0c2230;border-radius:24px;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.38)}
.ecHead{background:#071b27;color:white;padding:24px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px}.ecHead small{display:block;color:#8fb7c8;text-transform:uppercase;letter-spacing:.12em;font-weight:800}.ecHead h2{margin:4px 0 0;font-size:28px}.ecClose{border:1px solid rgba(255,255,255,.18);background:transparent;color:white;border-radius:12px;padding:9px 12px;cursor:pointer}
.ecBody{padding:28px}.ecIntro{display:grid;grid-template-columns:1.25fr .75fr;gap:18px}.ecCard{background:white;border:1px solid #dbe7ed;border-radius:18px;padding:20px}.ecAudio{display:flex;gap:12px;align-items:center}.ecAudioIcon{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:#0b5d7b;color:white;font-size:23px}.ecAudioText b{display:block;font-size:17px}.ecAudioText span{font-size:13px;color:#5e7480}.ecProgress{height:7px;background:#dfe9ee;border-radius:20px;overflow:hidden;margin:16px 0}.ecProgress i{display:block;height:100%;width:0;background:#0b6f94;transition:width .35s}.ecActions{display:flex;gap:10px;flex-wrap:wrap}.ecBtn{border:0;border-radius:12px;padding:12px 16px;font-weight:800;cursor:pointer}.ecBtn.pri{background:#0b6687;color:white}.ecBtn.sec{background:#e8f1f5;color:#153747}.ecBtn:disabled{opacity:.42;cursor:not-allowed}.ecNote{background:#eef7fb;border-left:4px solid #1682aa;border-radius:12px;padding:14px;font-size:14px;line-height:1.45}.ecKey{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}.ecKey div{background:#f0f6f8;border-radius:12px;padding:12px}.ecKey b{display:block;font-size:20px;color:#0b6687}.ecKey span{font-size:12px;color:#58707c}
.ecTeach{display:none}.ecTeach.on{display:block}.ecSteps{display:grid;gap:10px;margin-top:16px}.ecStep{display:grid;grid-template-columns:46px 1fr;gap:12px;align-items:start;border:1px solid #dbe7ed;border-radius:14px;padding:14px;background:white}.ecStep .num{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:#e6f3f8;color:#0b6687;font-weight:900}.ecStep h4{margin:0 0 5px}.ecStep p{margin:0;color:#526b77;line-height:1.45}.ecScale{display:flex;gap:5px;margin:14px 0}.ecScale span{flex:1;text-align:center;padding:9px 2px;background:#e9f1f4;border-radius:9px;font-size:12px;font-weight:800}.ecScale span.hot{background:#ffe8c8;color:#7d4700}.ecFooter{margin-top:18px;padding-top:16px;border-top:1px solid #dce7ec;color:#607783;font-size:12px}
.ecLaunch{margin-top:10px;width:100%;background:linear-gradient(135deg,#0d6686,#0b829c)!important;color:white!important;border:0!important}
@media(max-width:720px){#spmEcModal{padding:8px}.ecShell{margin:4px auto;border-radius:18px}.ecBody{padding:18px}.ecIntro{grid-template-columns:1fr}.ecKey{grid-template-columns:1fr}.ecHead{padding:18px}.ecHead h2{font-size:22px}}
`;

function mount(){
 if(document.getElementById('spmEcModal'))return;
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const m=document.createElement('div');m.id='spmEcModal';m.innerHTML=`<div class="ecShell" role="dialog" aria-modal="true" aria-label="Entrenamiento Start Stop">
  <div class="ecHead"><div><small>SPM · Programa de control eyaculatorio</small><h2>Técnica Start/Stop</h2></div><button class="ecClose" type="button">Cerrar ×</button></div>
  <div class="ecBody">
   <section class="ecIntro" id="ecIntro">
    <div class="ecCard"><div class="ecAudio"><div class="ecAudioIcon">🔊</div><div class="ecAudioText"><b>Antes de comenzar, escucha esta introducción</b><span>Te explicará qué estás entrenando y qué esperar de tus primeras sesiones.</span></div></div><div class="ecProgress"><i id="ecAudioProgress"></i></div><div id="ecAudioState" class="ecNote">El objetivo es progresivo. No necesitas conseguir 4–6 paradas desde la primera sesión.</div><div class="ecActions" style="margin-top:14px"><button class="ecBtn sec" id="ecReplay">🔊 Volver a escuchar</button><button class="ecBtn pri" id="ecBegin" disabled>▶ Comenzar entrenamiento</button></div></div>
    <aside class="ecCard"><b>Tu objetivo de entrenamiento</b><div class="ecKey"><div><b>8/10</b><span>Anticipa la parada antes del punto de no retorno</span></div><div><b>4–6</b><span>Paradas como meta progresiva por sesión</span></div><div><b>3×</b><span>Sesiones de práctica por semana</span></div></div><div class="ecNote" style="margin-top:14px">Una primera parada bien identificada ya cuenta como progreso. La habilidad se construye con repetición y constancia.</div></aside>
   </section>
   <section class="ecTeach" id="ecTeach"><div class="ecCard"><small style="font-weight:900;color:#0b6687;text-transform:uppercase;letter-spacing:.08em">Educación paso a paso</small><h3 style="margin:6px 0">Cómo realizar Start/Stop</h3><p style="color:#59717d">Aprende primero la secuencia. Después podrás pasar a la práctica guiada con contador de paradas.</p><div class="ecScale">${[0,1,2,3,4,5,6,7,8,9,10].map(n=>`<span class="${n===8?'hot':''}">${n}</span>`).join('')}</div><div class="ecSteps">${STEPS.map(s=>`<div class="ecStep"><div class="num">${s.n}</div><div><h4>${s.t}</h4><p>${s.d}</p></div></div>`).join('')}</div><div class="ecActions" style="margin-top:18px"><button class="ecBtn sec" id="ecBack">← Volver a introducción</button><button class="ecBtn pri" id="ecPractice">Continuar a práctica guiada →</button></div><div class="ecFooter">Entrenamiento educativo para adultos. Detén la práctica si aparece dolor, irritación o malestar importante.</div></div></section>
  </div></div>`;
 document.body.appendChild(m);
 m.querySelector('.ecClose').onclick=close;
 m.onclick=e=>{if(e.target===m)close()};
 document.getElementById('ecReplay').onclick=playIntro;
 document.getElementById('ecBegin').onclick=()=>showTeach();
 document.getElementById('ecBack').onclick=()=>showIntro(false);
 document.getElementById('ecPractice').onclick=()=>{
   document.getElementById('ecAudioState').textContent='La práctica guiada completa se integrará en este mismo módulo con contador de paradas y registro de sesión.';
   showIntro(false);
 };
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
}

let utterance=null,progressTimer=null,startAt=0,durationEstimate=1;
function stopAudio(){if('speechSynthesis'in window)window.speechSynthesis.cancel();clearInterval(progressTimer);progressTimer=null;}
function playIntro(){
 const state=document.getElementById('ecAudioState'),bar=document.getElementById('ecAudioProgress'),begin=document.getElementById('ecBegin');
 stopAudio();begin.disabled=true;bar.style.width='0%';state.textContent='Reproduciendo introducción…';
 if(!('speechSynthesis'in window)){state.textContent='Tu navegador no permite reproducir el audio. Puedes continuar con el entrenamiento.';begin.disabled=false;bar.style.width='100%';return;}
 utterance=new SpeechSynthesisUtterance(INTRO);utterance.lang='es-CO';utterance.rate=.94;utterance.pitch=1;
 const voices=window.speechSynthesis.getVoices();const es=voices.find(v=>/es[-_]CO/i.test(v.lang))||voices.find(v=>/^es/i.test(v.lang));if(es)utterance.voice=es;
 durationEstimate=Math.max(55,INTRO.split(/\s+/).length/2.25);startAt=Date.now();
 progressTimer=setInterval(()=>{const p=Math.min(96,((Date.now()-startAt)/1000)/durationEstimate*100);bar.style.width=p+'%'},300);
 utterance.onend=()=>{clearInterval(progressTimer);bar.style.width='100%';state.textContent='Introducción finalizada. Ya puedes comenzar el entrenamiento paso a paso.';begin.disabled=false;localStorage.setItem('spm_startstop_intro_heard','1')};
 utterance.onerror=()=>{clearInterval(progressTimer);bar.style.width='100%';state.textContent='No fue posible completar el audio. Puedes volver a intentarlo o continuar.';begin.disabled=false};
 window.speechSynthesis.speak(utterance);
}
function showIntro(play=false){document.getElementById('ecIntro').style.display='grid';document.getElementById('ecTeach').classList.remove('on');if(play)playIntro()}
function showTeach(){stopAudio();document.getElementById('ecIntro').style.display='none';document.getElementById('ecTeach').classList.add('on');}
function open(){mount();document.getElementById('spmEcModal').classList.add('on');document.body.style.overflow='hidden';showIntro(true)}
function close(){stopAudio();const m=document.getElementById('spmEcModal');if(m)m.classList.remove('on');document.body.style.overflow='';}

function enhance(){
 document.querySelectorAll('.dayCard').forEach(card=>{
   if(card.dataset.ecEnhanced)return;
   const tag=card.querySelector('.tag')?.textContent||'';const day=Number(card.querySelector('.dayNum')?.textContent||0);
   if(/Control eyaculatorio/i.test(tag)&&[8,10,12,17].includes(day)){
     card.dataset.ecEnhanced='1';const area=card.querySelector('.interactive');if(!area)return;
     const b=document.createElement('button');b.type='button';b.className='btn pri ecLaunch';b.textContent='▶ Abrir entrenamiento Start/Stop';b.onclick=e=>{e.stopPropagation();open()};area.prepend(b);
   }
 });
}

mount();enhance();
const obs=new MutationObserver(()=>enhance());obs.observe(document.body,{childList:true,subtree:true});
window.SPM_EJACULATORY_CONTROL={open,playIntro};
})();
