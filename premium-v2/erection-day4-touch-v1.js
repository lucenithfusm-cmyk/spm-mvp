/* SPM Digital Wellness · Erección y firmeza · Día 4
 * Las tres imágenes aprobadas son las superficies táctiles originales.
 * Solo intercepta la práctica principal del día 4; no altera otros días.
 */
(()=>{'use strict';
if(window.SPM_ED_DAY4_TOUCH)return;
const IMAGES=[1,2,3].map(n=>`/premium-v2/assets/erection-day4/spm-de-day4-screen-0${n}.webp`);
const SENSES=[
 ['temperature','Temperatura',[40,1144,1040,1293],[978,1216]],
 ['contact','Contacto',[40,1298,1040,1447],[978,1370]],
 ['rhythm','Ritmo',[40,1453,1040,1600],[978,1526]]
];
const RESULTS=[
 ['returned','Pude volver a la sensación',[40,1035,1040,1181],[977,1108]],
 ['difficult','Me costó regresar',[40,1207,1040,1356],[977,1280]],
 ['no_checking','No apareció la comprobación',[40,1376,1040,1527],[977,1449]]
];
const GUIDES={
 1:'Hoy vas a entrenar una habilidad propia de Erección y firmeza: reconocer cuándo tu atención se desplaza del estímulo hacia la preocupación por tu rigidez. No necesitas provocar una erección ni comprobarla hoy. Piensa en una experiencia cómoda y elige una sensación a la que puedas regresar si aparece una pregunta como «¿estará firme?». Puedes elegir temperatura, contacto o ritmo. Toca tu elección y continúa.',
 2:'Busca privacidad y elige una experiencia erótica cómoda o imagina un estímulo que te resulte agradable. No necesitas llegar a ninguna respuesta física. Durante unos minutos, dirige tu atención a la sensación que elegiste. Si aparece el pensamiento «¿cómo está mi erección?», reconócelo como un pensamiento, sin comprobar ni juzgar. Después vuelve a la temperatura, al contacto o al ritmo que hayas elegido. Puedes repetir ese regreso cuantas veces lo necesites. El cronómetro es opcional y puedes detener la práctica en cualquier momento si resulta incómoda.',
 3:'Si realizaste la práctica, elige lo que mejor describa tu experiencia: pude volver a la sensación, me costó regresar o no apareció la comprobación. No vamos a repetir la escala de firmeza. Guarda tu respuesta para volver a Hoy. Si no practicaste, puedes volver a Hoy sin registrar una realización.'
};
const STEPS=[
 'Elige un estímulo agradable. Puede ser un contacto cómodo contigo mismo, un recuerdo o una fantasía erótica que te resulte agradable. Si compartes la experiencia con alguien, acuerden juntos lo que sea cómodo. No es necesario buscar una erección.',
 'Reconoce la comprobación. Si aparece la pregunta «¿cómo está mi erección?», obsérvala como un pensamiento. No necesitas responderla, medir la firmeza ni juzgar tu cuerpo.',
 'Vuelve a la señal elegida. Dirige tu atención otra vez a la temperatura, al contacto o al ritmo. Puedes repetir el regreso tantas veces como necesites. Si algo incomoda, detente.'
];
const SENSE_AUDIO={
 temperature:'Temperatura. Puedes observar el calor o la frescura de un contacto agradable, sin examinar tu respuesta física.',
 contact:'Contacto. Nota la sensación del roce o la presión suave en una zona cómoda, sin exigir un resultado.',
 rhythm:'Ritmo. Reconoce un ritmo agradable, natural y sin prisa. No necesitas modificarlo para demostrar nada.'
};
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const rect=(x1,y1,x2,y2)=>`left:${(x1/1080*100).toFixed(3)}%;top:${(y1/1920*100).toFixed(3)}%;width:${((x2-x1)/1080*100).toFixed(3)}%;height:${((y2-y1)/1920*100).toFixed(3)}%`;
const MAX_MS=300000;
let active=null;
function stopAudio(m){
 if(!m)return;
 try{window.SPM_VOICE?.cancel?.()}catch{}
 m.voiceKey=null;
 m.host?.querySelectorAll?.('.spm-ed4-hit.playing').forEach(b=>b.classList.remove('playing'));
}
function pauseTimer(m){
 if(!m)return;
 if(m.timer){window.clearInterval(m.timer);m.timer=null}
 if(m.timerStart!==null){m.timerTotal=Math.min(MAX_MS,m.timerTotal+Math.max(0,performance.now()-m.timerStart));m.timerStart=null}
}
function cleanup(m){if(!m)return;stopAudio(m);pauseTimer(m);m.events?.abort?.();m.events=null}
function stop(){const m=active;active=null;cleanup(m)}
function pause(){if(active){stopAudio(active);pauseTimer(active)}}
function status(m,txt){m.message=txt;const el=m.host?.querySelector('[data-ed4-status]');if(el)el.textContent=txt||''}
function required(m,txt){status(m,txt);window.SPM_ERECTION_TOUCH_VIEW?.warn(m.host,txt)}
function talk(m,key,script){
 if(!m||!m.valid()||m.busy)return;
 if(m.voiceKey===key){stopAudio(m);return}
 stopAudio(m);m.voiceKey=key;
 const target=m.host.querySelector(`[data-ed4-audio="${key}"]`);
 const finish=()=>{if(m.voiceKey===key)m.voiceKey=null;target?.classList.remove('playing')};
 if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=='function'){
  finish();status(m,'La guía hablada no está disponible. Puedes leer las indicaciones de la pantalla.');return;
 }
 const u=new window.SpeechSynthesisUtterance(script);
 u.lang='es-CO';u.rate=.95;u.pitch=1;u.volume=1;

 u.onend=finish;u.onerror=finish;
 try{window.SPM_VOICE.speak(u);target?.classList.add('playing')}catch{finish();status(m,'No se pudo iniciar la guía. Puedes leer las indicaciones de la pantalla.')}
}
function button(coords,act,label,{value=null,audio=null,selected=false,disabled=false}={}){
 return `<button type="button" class="spm-ed4-hit${selected?' selected':''}${audio?' audio':''}" style="${rect(...coords)}" data-ed4-action="${esc(act)}"${value===null?'':` data-value="${esc(value)}" aria-pressed="${selected?'true':'false'}"`}${audio===null?'':` data-ed4-audio="${esc(audio)}"`}${disabled?' disabled':''} aria-label="${esc(label)}"></button>`;
}
function marker(x,y,value){return `<span class="spm-ed4-check" aria-hidden="true" data-selected="${esc(value)}" style="${rect(x-28,y-28,x+28,y+28)}">✓</span>`}
function elapsed(m){return Math.min(MAX_MS,m.timerTotal+(m.timerStart===null?0:Math.max(0,performance.now()-m.timerStart)))}
function timeString(ms){const s=Math.floor(ms/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function clockUI(m){
 const out=m.host?.querySelector('[data-ed4-timer-output]');if(out)out.textContent=timeString(elapsed(m));
 const play=m.host?.querySelector('[data-ed4-timer-state]');if(play)play.textContent=m.timerStart!==null?'❚❚':m.timerTotal>=MAX_MS?'↺':'▶';
 if(m.timerStart!==null&&elapsed(m)>=MAX_MS){pauseTimer(m);m.timerTotal=MAX_MS;clockUI(m);status(m,'Cinco minutos transcurridos. Puedes continuar cuando quieras.')}
}
function render(m){
 if(!m||!m.host?.isConnected)return;
 const p=m.page;let hits='',over='';
 hits+=button([237,454,842,547],'audio',p===2?'Escuchar la práctica guiada':'Escuchar guía',{audio:'guide'});
 if(p===1){
  SENSES.forEach(([v,label,coords,center])=>{hits+=button(coords,'sense','Elegir '+label,{value:v,selected:m.sense===v});if(m.sense===v)over+=marker(...center,v)});
  hits+=button([40,1741,1041,1881],'next','Continuar al entrenamiento');
 }else if(p===2){
  [[42,1003,1038,1148],[42,1160,1038,1310],[42,1318,1038,1463]].forEach((coords,i)=>{hits+=button(coords,'step','Escuchar instrucción '+(i+1),{value:String(i),audio:'step'+i})});
  hits+=button([936,1494,1042,1625],'timer','Iniciar, pausar o reiniciar el cronómetro opcional');
  over+=`<output class="spm-ed4-timer-output" data-ed4-timer-output style="${rect(792,1515,930,1592)}" aria-label="Tiempo transcurrido">${timeString(elapsed(m))}</output>`;
  over+=`<span class="spm-ed4-timer-state" data-ed4-timer-state style="${rect(941,1513,1030,1604)}" aria-hidden="true">${m.timerStart!==null?'❚❚':m.timerTotal>=MAX_MS?'↺':'▶'}</span>`;
  hits+=button([40,1744,1041,1879],'next','Continuar a registrar mi experiencia');
 }else{
  RESULTS.forEach(([v,label,coords,center])=>{hits+=button(coords,'result','Elegir '+label,{value:v,selected:m.result===v});if(m.result===v)over+=marker(...center,v)});
  hits+=button([39,1743,1041,1881],'save','Guardar y regresar a Hoy',{disabled:m.busy});
 }
 const toolbar=`<nav class="spm-ed4-toolbar" aria-label="Navegación Erección y firmeza día 4"><button type="button" data-ed4-action="back">${p===1?'← Volver a Hoy':'← Anterior'}</button><span>${p} de 3 · Día ${m.calendarDay}</span><button type="button" data-ed4-action="exit">Salir a Hoy</button></nav>`;
 m.host.innerHTML=`<section class="spm-ed4-session spm-er-fullscreen" data-ed4-session data-screen="${p}" aria-label="Erección y firmeza, día ${m.calendarDay}, pantalla ${p} de 3"><div class="spm-ed4-artwork" role="group" aria-label="Pantalla original aprobada ${p} de 3" style="background-image:url(&quot;${IMAGES[p-1]}&quot;)">${hits}${over}</div>${toolbar}${window.SPM_VOICE?.transcript([GUIDES[m.page],...STEPS].join("\n\n"))||''}<p class="spm-ed4-status" data-ed4-status role="status" aria-live="polite">${esc(m.message)}</p></section>`;
 if(p===2)clockUI(m);
}
function move(m,target){
 if(!m.valid()||m.busy)return;
 if(m.page===1&&!m.sense){required(m,'Elige temperatura, contacto o ritmo para continuar.');return}
 stopAudio(m);pauseTimer(m);m.page=Math.max(1,Math.min(3,target));m.message='';render(m);
 window.SPM_ERECTION_TOUCH_VIEW?.resetScroll(m.host);
}
function timer(m){
 if(m.page!==2||m.busy)return;
 if(m.timerStart!==null){pauseTimer(m);clockUI(m);return}
 if(m.timerTotal>=MAX_MS){m.timerTotal=0;m.timerUsed=false}
 m.timerStart=performance.now();m.timerUsed=true;
 if(m.timer)window.clearInterval(m.timer);
 m.timer=window.setInterval(()=>clockUI(m),250);clockUI(m);
}
async function save(m){
 if(m.busy||!m.valid())return;
 if(!m.sense){required(m,'Regresa a la primera pantalla y elige una señal de atención.');return}
 if(!m.result){required(m,'Elige cómo fue tu experiencia antes de guardar.');return}
 stopAudio(m);pauseTimer(m);
 const record={...m.prior,source:'erection-practice-v1',erectionPracticeVersion:1,day:m.calendarDay,erectionLesson:4,activity:'Vuelve a las sensaciones',confirmed:true,anxiety:null,confidence:null,date:new Date().toISOString(),attentionSense:m.sense,practiceExperience:m.result,finalFeeling:typeof m.prior.finalFeeling==='string'&&m.prior.finalFeeling.length<=1000?m.prior.finalFeeling:'',seconds:m.timerUsed?Math.min(300,Math.max(0,Math.floor(m.timerTotal/1000))):null,lessonFormat:'three-approved-touch-screens'};
 m.busy=true;status(m,'Guardando tu registro de hoy…');const b=m.host.querySelector('[data-ed4-action="save"]');if(b)b.disabled=true;
 let saved;
 try{saved=await m.save(record);if(saved===false||saved?.ok===false)throw Error('save-failed')}
 catch{m.busy=false;if(m.host.isConnected)status(m,'No se pudo guardar. Tus respuestas siguen en pantalla; puedes intentarlo otra vez.');if(b?.isConnected)b.disabled=false;return}
 const c=window.SPM_RESOURCE_CONTEXT?.();
 if(c&&(String(c.userId)+':'+String(c.planId)!==m.scope||Number(c.day)!==m.calendarDay))return;
 // Guardar en el motor central puede reconstruir Hoy y desmontar este visor.
 if(m.host.isConnected){try{m.onBack()}catch{window.SPM_DAILY_PRACTICE?.open?.()}}
}
function mount({host,prior={},valid=()=>true,save:onSave,onBack=()=>{},scope='',calendarDay=4}){
 if(!host||typeof onSave!=='function')return false;
 stop();const p=prior&&typeof prior==='object'&&!Array.isArray(prior)?prior:{};
 const m={calendarDay:Number(calendarDay),host,prior:{...p},valid,save:onSave,onBack,scope,page:1,sense:SENSES.some(([v])=>v===p.attentionSense)?p.attentionSense:null,result:RESULTS.some(([v])=>v===p.practiceExperience)?p.practiceExperience:null,timerTotal:0,timerStart:null,timerUsed:false,timer:null,voiceKey:null,busy:false,message:'',events:new AbortController()};
 active=m;render(m);
 host.addEventListener('click',ev=>{
  if(active!==m||!m.valid()||m.busy)return;
  const el=ev.target.closest('[data-ed4-action]');if(!el||el.disabled)return;
  const act=el.dataset.ed4Action,val=el.dataset.value;
  if(act==='exit'){stopAudio(m);pauseTimer(m);m.onBack();return}
  if(act==='back'){if(m.page===1){stopAudio(m);pauseTimer(m);m.onBack()}else move(m,m.page-1);return}
  if(act==='next'){move(m,m.page+1);return}
  if(act==='sense'){if(!SENSES.some(([v])=>v===val))return;m.sense=val;m.message='';render(m);return}
  if(act==='result'){if(!RESULTS.some(([v])=>v===val))return;m.result=val;m.message='';render(m);return}
  if(act==='audio'){const selected=m.page===2&&m.sense?`Tu señal elegida es ${SENSES.find(([v])=>v===m.sense)?.[1].toLowerCase()}. `:'';talk(m,'guide',selected+GUIDES[m.page]);return}
  if(act==='step'){const index=Number(val);if(!Number.isInteger(index)||index<0||index>2)return;talk(m,'step'+index,STEPS[index]);return}
  if(act==='timer'){timer(m);return}
  if(act==='save'){void save(m)}
 },{signal:m.events.signal});
 return true;
}
window.addEventListener('pagehide',stop);
window.SPM_ED_DAY4_TOUCH={mount,pause,stop,images:IMAGES.slice(),senses:SENSES.map(([v])=>v),results:RESULTS.map(([v])=>v),guides:{...GUIDES}};
})();
