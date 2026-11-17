/* SPM Digital Wellness · Erección y firmeza · Día 3
 * Las tres imágenes aprobadas son las superficies táctiles, no ilustraciones sueltas.
 * Un solo registro clínico de la práctica principal, sin cambiar otras rutas.
 */
(()=>{'use strict';
if(window.SPM_ED_DAY3_TOUCH)return;
const IMAGES=[1,2,3].map(n=>`/premium-v2/assets/erection-day3/spm-de-day3-screen-0${n}.webp`);
const ORIGINAL_AUDIO='/premium-v2/assets/audio/erection/erection-day-3-20261113.mp3';
const AREAS=[
 ['jaw','Mandíbula',[28,987,835,1079],[786,1034]],
 ['shoulders','Hombros',[28,1085,836,1175],[786,1129]],
 ['abdomen','Abdomen',[27,1181,836,1273],[787,1226]],
 ['none','No identifico tensión',[28,1278,836,1370],[787,1323]]
];
const ANCHORS=[
 ['hands','Siente tus manos',[25,956,835,1045],[786,1002]],
 ['support','Nota el apoyo del cuerpo',[25,1048,835,1133],[786,1091]],
 ['sound','Escucha el ambiente',[25,1137,835,1225],[786,1182]],
 ['unknown','No lo identifiqué',[25,1228,835,1316],[786,1272]]
];
const STEPS=[
 'Afloja la zona elegida. Nota si hay tensión. Permite que disminuya con suavidad, sin empujar ni forzar el cuerpo.',
 'Deja caer el peso. Apoya cómodamente el cuerpo en la silla o el lugar donde estés sentado. No busques una postura perfecta.',
 'Al exhalar, suelta sin empujar. Deja salir el aire de manera natural y afloja un poco más si te resulta agradable.'
];
const GUIDE={
 1:'Hoy vas a reconocer dónde sientes tensión cuando te preocupa tu respuesta eréctil. Puedes notar tensión en la mandíbula, los hombros o el abdomen. Selecciona la zona que más reconoces. Si no identificas tensión, también está bien: elige esa opción. No intentes provocar ni comprobar una erección.',
 2:'Ahora suelta sin hacer fuerza. Acomódate con apoyo. Afloja la zona que elegiste; deja que el peso descanse. Al exhalar, suelta sin empujar. No hace falta sostener la respiración. Puedes usar el cronómetro de un minuto si te ayuda, pero es opcional. Si aparece dolor, mareo o malestar, detente.',
 3:'Vuelve a una sensación sencilla. Puedes sentir el contacto de tus manos, notar el apoyo de tu cuerpo o escuchar un sonido del ambiente. Si no logras identificar un ancla, también puedes registrarlo. Lo importante no es medir la firmeza, sino practicar el regreso a una sensación cómoda.'
};
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const rect=(x1,y1,x2,y2)=>`left:${(x1/864*100).toFixed(3)}%;top:${(y1/1536*100).toFixed(3)}%;width:${((x2-x1)/864*100).toFixed(3)}%;height:${((y2-y1)/1536*100).toFixed(3)}%`;
let active=null;
function stopAudio(m){
 if(!m)return;
 try{m.player?.pause?.();if(m.player)m.player.currentTime=0}catch{}
 m.player=null;
 try{window.speechSynthesis?.cancel?.()}catch{}
 m.voiceKey=null;
 m.host?.querySelectorAll?.('.spm-ed3-hit.playing').forEach(el=>el.classList.remove('playing'));
}
function stopTimer(m){
 if(!m)return;
 if(m.timer){window.clearInterval(m.timer);m.timer=null}
 if(m.startedAt!==null){m.usedMs=Math.min(60000,m.usedMs+Math.max(0,performance.now()-m.startedAt));m.startedAt=null}
}
function cleanup(m){if(!m)return;stopAudio(m);stopTimer(m);m.events?.abort?.();m.events=null}
function stop(){const m=active;active=null;cleanup(m)}
function pause(){if(active){stopAudio(active);stopTimer(active)}}
function status(m,text){m.message=text;const el=m.host.querySelector('[data-ed3-status]');if(el)el.textContent=text;}
function speak(m,key,text,preferOriginal=false){
 if(!m||!m.valid()||m.busy)return;
 if(m.voiceKey===key){stopAudio(m);return}
 stopAudio(m);m.voiceKey=key;
 const target=m.host.querySelector(`[data-ed3-audio="${key}"]`);
 const mark=()=>target?.classList.add('playing');
 const done=()=>{if(m.voiceKey===key)m.voiceKey=null;target?.classList.remove('playing')};
 const tts=()=>{
  if(!window.speechSynthesis||typeof SpeechSynthesisUtterance!=='function'){
   status(m,'Audio no disponible en este dispositivo. Puedes seguir las indicaciones escritas.');done();return;
  }
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang='es-CO';utterance.rate=.94;utterance.pitch=1;utterance.volume=1;
  const voices=window.speechSynthesis.getVoices?.()||[];
  utterance.voice=voices.find(v=>/^es-co$/i.test(v.lang)&&/female|mujer|paulina|sofia|helena|maria|monica/i.test(v.name))||voices.find(v=>/^es-co$/i.test(v.lang))||voices.find(v=>/^es(?:-|$)/i.test(v.lang))||null;
  utterance.onend=done;utterance.onerror=done;
  try{window.speechSynthesis.speak(utterance);mark()}catch{done();status(m,'No se pudo reproducir el audio. Puedes leer las instrucciones.')}
 };
 if(preferOriginal&&typeof Audio==='function'){
  try{
   const audio=new Audio(ORIGINAL_AUDIO);m.player=audio;audio.preload='none';audio.onended=done;
   audio.onerror=()=>{if(m.voiceKey===key){m.player=null;tts()}};
   const result=audio.play();mark();result?.catch?.(()=>{if(m.voiceKey===key){m.player=null;tts()}});return;
  }catch{}
 }
 tts();
}
function hotspot(box,act,label,options={}){
 const {value=null,audio=null,selected=false,disabled=false}=options;
 return `<button type="button" class="spm-ed3-hit${selected?' selected':''}${audio?' audio':''}" style="${rect(...box)}" data-ed3-action="${esc(act)}"${value===null?'':` data-value="${esc(value)}" aria-pressed="${selected?'true':'false'}"`}${audio?` data-ed3-audio="${esc(audio)}"`:''}${disabled?' disabled':''} aria-label="${esc(label)}"></button>`;
}
function marker(x,y,value){return `<span class="spm-ed3-check" data-selected="${esc(value)}" aria-hidden="true" style="${rect(x-20,y-20,x+20,y+20)}">✓</span>`}
function remaining(m){const passed=m.usedMs+(m.startedAt===null?0:Math.max(0,performance.now()-m.startedAt));return Math.max(0,60000-passed)}
function format(ms){const t=Math.ceil(ms/1000),min=Math.floor(t/60),sec=t%60;return String(min).padStart(2,'0')+':'+String(sec).padStart(2,'0')}
function timerUI(m){
 const counter=m.host.querySelector('[data-ed3-countdown]'),label=m.host.querySelector('[data-ed3-timer-label]');
 if(counter)counter.textContent=format(remaining(m));
 if(label){
  const text=m.startedAt!==null?'Pausar':m.usedMs>=60000?'Reiniciar':m.timerUsed?'Continuar':'';
  label.textContent=text;label.hidden=!text;
 }
 if(m.startedAt!==null&&remaining(m)===0){stopTimer(m);m.usedMs=60000;timerUI(m);status(m,'Cronómetro finalizado. Puedes continuar cuando lo desees.');}
}
function render(m){
 if(!m||!m.host?.isConnected)return;
 let hits='',over='';
 if(m.page===1){
  hits+=hotspot([214,285,652,371],'audio','Escuchar guía de reconocimiento de tensión',{audio:'guide'});
  AREAS.forEach(([value,label,box,center])=>{hits+=hotspot(box,'area','Seleccionar '+label,{value,selected:m.area===value});if(m.area===value)over+=marker(center[0],center[1],value)});
  hits+=hotspot([35,1390,826,1500],'next','Continuar con la práctica');
 }else if(m.page===2){
  hits+=hotspot([210,286,656,373],'audio','Escuchar práctica guiada para soltar sin hacer fuerza',{audio:'guide'});
  const zones=[[30,956,835,1044],[30,1051,835,1135],[30,1142,835,1229]];
  zones.forEach((box,i)=>{hits+=hotspot(box,'step','Escuchar paso '+(i+1),{value:String(i),selected:m.lastStep===i});});
  hits+=hotspot([579,1285,818,1381],'timer','Iniciar, pausar o reiniciar cronómetro');
  hits+=hotspot([35,1400,831,1510],'next','Continuar a elegir un ancla de atención');
  over+=`<output class="spm-ed3-timer-output" data-ed3-countdown aria-label="Tiempo restante del cronómetro" style="${rect(206,1297,431,1380)}">${format(remaining(m))}</output><span class="spm-ed3-timer-label" data-ed3-timer-label ${m.startedAt!==null||m.timerUsed?'':'hidden'} style="${rect(583,1292,813,1376)}">${m.startedAt!==null?'Pausar':m.usedMs>=60000?'Reiniciar':'Continuar'}</span>`;
 }else if(m.page===3){
  hits+=hotspot([213,300,651,383],'audio','Escuchar guía para elegir ancla sensorial',{audio:'guide'});
  ANCHORS.forEach(([value,label,box,center])=>{hits+=hotspot(box,'anchor','Seleccionar '+label,{value,selected:m.anchor===value});if(m.anchor===value)over+=marker(center[0],center[1],value)});
  hits+=hotspot([27,1402,831,1507],'save','Guardar y volver a Hoy',{disabled:m.busy});
 }
 const toolbar=`<nav class="spm-ed3-toolbar" aria-label="Navegación Erección y firmeza, día 3"><button type="button" data-ed3-action="back">${m.page===1?'← Volver a Hoy':'← Anterior'}</button><span>${m.page} de 3 · Día 3</span><button type="button" data-ed3-action="exit">Salir a Hoy</button></nav>`;
 m.host.innerHTML=`<section class="spm-ed3-session" data-ed3-session data-screen="${m.page}" aria-label="Erección y firmeza, día 3, pantalla ${m.page} de 3"><div class="spm-ed3-artwork" style="background-image:url(&quot;${IMAGES[m.page-1]}&quot;)" role="group" aria-label="Lámina médica aprobada ${m.page} de 3">${hits}${over}</div>${toolbar}<p class="spm-ed3-status" data-ed3-status role="status" aria-live="polite">${esc(m.message)}</p></section>`;
 if(m.page===2)timerUI(m);
}
function move(m,target){if(!m||!m.valid()||m.busy)return;
 if(m.page===1&&!m.area){status(m,'Selecciona la zona que sientes más tensa o «No identifico tensión».');return}
 stopAudio(m);stopTimer(m);m.page=Math.max(1,Math.min(3,target));m.message='';render(m);
 m.host.querySelector('[data-ed3-session]')?.scrollIntoView?.({block:'start',behavior:'instant'});
}
function toggleTimer(m){
 if(m.busy||m.page!==2)return;
 if(m.startedAt!==null){stopTimer(m);timerUI(m);return}
 if(m.usedMs>=60000){m.usedMs=0;m.timerUsed=false}
 m.timerUsed=true;m.startedAt=performance.now();
 if(m.timer)window.clearInterval(m.timer);
 m.timer=window.setInterval(()=>timerUI(m),250);timerUI(m);
}
function tryBack(m){if(m.page===1){stopAudio(m);stopTimer(m);m.onBack();return}move(m,m.page-1)}
async function save(m){
 if(m.busy||!m.valid())return;
 if(!m.area){status(m,'Regresa a la pantalla 1 y elige una zona o «No identifico tensión».');return}
 if(!m.anchor){status(m,'Elige un ancla sensorial o «No lo identifiqué».');return}
 stopAudio(m);stopTimer(m);
 const record={...m.prior,source:'erection-practice-v1',erectionPracticeVersion:1,day:3,activity:'Reconoce y suelta la tensión',confirmed:true,anxiety:null,confidence:null,date:new Date().toISOString(),
  tensionAreas:[m.area],sensoryAnchor:m.anchor,finalFeeling:typeof m.prior.finalFeeling==='string'&&m.prior.finalFeeling.length<=1000?m.prior.finalFeeling:'',
  seconds:m.timerUsed?Math.min(60,Math.max(0,Math.round(m.usedMs/1000))):null,lessonFormat:'three-approved-touch-screens'};
 m.busy=true;status(m,'Guardando tu práctica de hoy…');
 const button=m.host.querySelector('[data-ed3-action="save"]');if(button)button.disabled=true;
 let saved;
 try{saved=await m.save(record);if(saved===false||saved?.ok===false)throw Error('save-failed')}
 catch{m.busy=false;if(m.host.isConnected)status(m,'No se pudo guardar. Tus respuestas permanecen aquí; vuelve a intentarlo.');if(button?.isConnected)button.disabled=false;return}
 const c=window.SPM_RESOURCE_CONTEXT?.();
 if(c&&(String(c.userId)+':'+String(c.planId)!==m.scope||Number(c.day)!==3))return;
 // El propio motor de SPM puede cerrar el ejercicio al guardar. No duplicar el retorno.
 if(m.host.isConnected){try{m.onBack()}catch{window.SPM_DAILY_PRACTICE?.open?.()}}
}
function mount({host,prior={},valid=()=>true,save:onSave,onBack=()=>{},scope=''}){
 if(!host||typeof onSave!=='function')return false;
 stop();
 const p=prior&&typeof prior==='object'&&!Array.isArray(prior)?prior:{};
 const first=Array.isArray(p.tensionAreas)?p.tensionAreas.find(x=>AREAS.some(([key])=>key===x)):null;
 const priorAnchor=ANCHORS.some(([key])=>key===p.sensoryAnchor)?p.sensoryAnchor:null;
 const m={host,prior:{...p},valid,save:onSave,onBack,scope,page:1,area:first||null,anchor:priorAnchor,player:null,voiceKey:null,lastStep:-1,
  startedAt:null,usedMs:0,timer:null,timerUsed:false,events:new AbortController(),busy:false,message:''};
 active=m;render(m);
 host.addEventListener('click',ev=>{
  if(active!==m||!m.valid()||m.busy)return;
  const b=ev.target.closest('[data-ed3-action]');if(!b||b.disabled)return;
  const action=b.dataset.ed3Action,v=b.dataset.value;
  if(action==='back'){tryBack(m);return}
  if(action==='exit'){stopAudio(m);stopTimer(m);m.onBack();return}
  if(action==='next'){move(m,m.page+1);return}
  if(action==='area'){if(!AREAS.some(([key])=>key===v))return;m.area=v;stopAudio(m);m.message='';render(m);return}
  if(action==='anchor'){if(!ANCHORS.some(([key])=>key===v))return;m.anchor=v;stopAudio(m);m.message='';render(m);return}
  if(action==='audio'){
   const personalized=m.page===2&&m.area&&m.area!=='none'?`Zona elegida: ${AREAS.find(([key])=>key===m.area)[1]}. `:m.page===2?'Si no identificaste tensión, puedes notar solo el apoyo del cuerpo. ':'';
   speak(m,'guide',personalized+GUIDE[m.page],m.page===1);return;
  }
  if(action==='step'){const n=Number(v);if(!Number.isInteger(n)||n<0||n>=STEPS.length)return;m.lastStep=n;speak(m,'step'+n,STEPS[n]);return}
  if(action==='timer'){toggleTimer(m);return}
  if(action==='save'){void save(m);return}
 },{signal:m.events.signal});
 return true;
}
window.addEventListener('pagehide',stop);
window.SPM_ED_DAY3_TOUCH={mount,stop,pause,images:IMAGES.slice(),audioOriginal:ORIGINAL_AUDIO,areas:AREAS.map(x=>x[0]),anchors:ANCHORS.map(x=>x[0])};
})();