/* SPM Digital Wellness · Erección y firmeza · sesión 9, Día 24.
 * Tres imágenes premium aprobadas como superficies táctiles. Sin redibujar.
 * Voces: predeterminada del dispositivo en español, sin forzar proveedor.
 */
(()=>{'use strict';
if(window.SPM_ED_DAY9_TOUCH)return;
const IMAGES=[1,2,3].map(n=>'/premium-v2/assets/erection-day9/spm-de-day9-screen-0'+n+'.webp');
const GUIDES=[
 'Hoy aprenderás qué hacer cuando la firmeza disminuye. Es común que la respuesta eréctil varíe durante una experiencia íntima. Eso no significa fracaso ni exige comprobarla constantemente. Lo importante es cómo respondes: conserva la calma, mantén la atención en algo agradable y haz un ajuste sencillo si lo necesitas. En la siguiente pantalla conocerás un plan de cuatro pasos. Puedes ensayarlo mentalmente ahora, sin provocar una erección ni realizar actividad sexual. Si aparece dolor, malestar o incomodidad, detente.',
 'Este es tu plan en cuatro pasos cuando notes que disminuye la firmeza. Primero, mantén la calma: una variación no significa fracaso. Segundo, ajusta el estímulo: puedes cambiar suavemente el ritmo, la intensidad o la zona de contacto. Tercero, si te ayuda, prueba otra posición que conozcas y que sea cómoda para ti. Cuarto, haz una pausa breve: respira con naturalidad y retoma el contacto solo cuando te sientas listo y lo desees. No tienes que cumplir todos los pasos ni conseguir una erección. Puedes tocar cada tarjeta para escuchar su explicación por separado.',
 'Ahora elige una estrategia que quieras usar cuando notes una variación en la firmeza. Puedes mantener la calma, ajustar el ritmo o el estímulo, cambiar a una posición cómoda que te funcione, hacer una pausa breve o aplicar la secuencia completa. No hay una única respuesta correcta. Elige solo una opción para tu próxima experiencia y luego guarda tu decisión. No necesitas medir tu firmeza ni hacer una prueba ahora.'
];
const STEPS=[
 ['calm','Mantén la calma','Primero, mantén la calma. Una variación de firmeza es frecuente y no significa fracaso. Puedes regresar a la sensación agradable sin evaluarte.'],
 ['stimulus','Ajusta el estímulo','Segundo, ajusta el estímulo. Si lo deseas, cambia solamente una cosa: el ritmo, la intensidad o la zona de contacto. Evita apresurarte.'],
 ['position','Prueba otra posición','Tercero, prueba otra posición. Elige alguna en la que previamente te hayas sentido cómodo y hayas notado que te resulta más favorable. No existe una postura ideal para todos.'],
 ['pause','Haz una pausa breve','Cuarto, haz una pausa breve. Respira sin forzar, relájate y retoma el contacto cuando quieras y te sientas cómodo. Una pausa también es válida.']
];
const STRATEGIES=[
 ['calm','Mantener la calma si noto una variación',[47,570,824,726],[760,665]],
 ['stimulus','Ajustar el ritmo o el tipo de estímulo',[47,728,824,867],[760,799]],
 ['position','Cambiar a una posición que me funcione mejor',[47,870,824,1007],[760,938]],
 ['pause','Hacer una pausa breve y retomar',[47,1011,824,1147],[760,1083]],
 ['sequence','Aplicar la secuencia completa',[47,1150,824,1308],[760,1220]]
];
const STRATEGY_KEYS=STRATEGIES.map(row=>row[0]);
const STEP_HITS=[[43,532,819,704],[43,706,819,863],[43,876,819,1036],[43,1048,819,1212]];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rect=(x1,y1,x2,y2)=>`left:${(x1/864*100).toFixed(4)}%;top:${(y1/1536*100).toFixed(4)}%;width:${((x2-x1)/864*100).toFixed(4)}%;height:${((y2-y1)/1536*100).toFixed(4)}%`;
let active=null;
function stopVoice(m){if(!m)return;try{window.SPM_VOICE?.cancel?.()}catch{}m.voice=null;m.host?.querySelectorAll('.spm-ed9-hit.audio.playing,.spm-ed9-hit.step.playing').forEach(el=>{el.classList.remove('playing');el.setAttribute('aria-pressed','false')});}
function stop(){const m=active;active=null;if(m){stopVoice(m);m.events?.abort?.()}}
function pause(){if(active)stopVoice(active)}
function message(m,v){m.status=String(v||'');const el=m.host?.querySelector('[data-ed9-status]');if(el)el.textContent=m.status}
function warn(m,text){if(!window.SPM_ERECTION_TOUCH_VIEW?.warn?.(m.host,text))message(m,text)}
function speak(m,text,key){
 if(!m.valid()||m.saving)return;
 if(m.voice&&m.voiceKey===key){stopVoice(m);return}
 stopVoice(m);
 if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=='function'){message(m,'La voz del dispositivo no está disponible. Puedes leer las indicaciones de la pantalla.');return}
 try{
  const utterance=new window.SpeechSynthesisUtterance(text);
  utterance.lang='es-CO';utterance.rate=1;utterance.pitch=1;utterance.volume=1;
  // No asignar .voice: la voz estándar del dispositivo se conserva.
  m.voice=utterance;m.voiceKey=key;
  const btn=m.host?.querySelector(`[data-ed9-voice-key="${key}"]`);btn?.classList.add('playing');btn?.setAttribute('aria-pressed','true');
  utterance.onend=()=>{if(m.voice===utterance)stopVoice(m)};
  utterance.onerror=()=>{if(m.voice===utterance){stopVoice(m);message(m,'No se pudo reproducir la guía. Puedes intentarlo nuevamente.')}};
  window.SPM_VOICE.speak(utterance);
 }catch{stopVoice(m);message(m,'No fue posible reproducir la guía.')}
}
function hit(bounds,action,label,{value=null,selected=false,disabled=false,audio=false,step=false,voiceKey=null}={}){
 return `<button type="button" class="spm-ed9-hit${selected?' selected':''}${audio?' audio':''}${step?' step':''}" style="${rect(...bounds)}" data-ed9-action="${esc(action)}"${value===null?'':` data-value="${esc(value)}" aria-pressed="${selected?'true':'false'}"`}${voiceKey===null?'':` data-ed9-voice-key="${esc(voiceKey)}" aria-pressed="false"`}${disabled?' disabled':''} aria-label="${esc(label)}"></button>`;
}
function check(x,y){return `<span class="spm-ed9-check" aria-hidden="true" style="${rect(x-18,y-18,x+18,y+18)}">✓</span>`}
function render(m){
 if(!m.host?.isConnected)return;
 let hits='',marks='',extra='';
 if(m.page===1){
  hits+=hit([184,666,669,760],'audio','Escuchar guía del día 24',{audio:true,voiceKey:'guide-1'});
  hits+=hit([38,1340,351,1444],'back','Volver a Hoy');
  hits+=hit([355,1340,834,1444],'next','Comenzar práctica');
 }else if(m.page===2){
  for(let i=0;i<4;i++)hits+=hit(STEP_HITS[i],'step','Escuchar paso '+(i+1)+': '+STEPS[i][1],{value:String(i),step:true,voiceKey:'step-'+i});
  hits+=hit([40,1356,397,1462],'back','Anterior');
  hits+=hit([398,1356,833,1462],'next','Continuar');
  if(m.stepHeard!==null){const i=m.stepHeard;const b=STEP_HITS[i];marks+=`<span class="spm-ed9-step-tag" style="${rect(716,b[1]+11,798,b[1]+52)}">▶</span>`}
 }else{
  for(const [key,label,coords,center]of STRATEGIES){const yes=m.strategy===key;hits+=hit(coords,'strategy',(yes?'Seleccionada: ':'Elegir ')+label,{value:key,selected:yes});if(yes)marks+=check(...center)}
  hits+=hit([32,1333,835,1458],'save','Guardar y continuar mi ruta de hoy',{disabled:m.saving});
 }
 const nav=`<nav class="spm-ed9-toolbar" aria-label="Navegación Día 24"><button type="button" data-ed9-action="back">${m.page===1?'← Volver a Hoy':'← Anterior'}</button><span>${m.page} de 3 · Día ${m.calendarDay}</span><button type="button" data-ed9-action="guide" aria-label="Escuchar guía de esta pantalla">🔊 Escuchar guía</button><button type="button" data-ed9-action="exit">Salir</button></nav>`;
 m.host.innerHTML=`<section class="spm-ed9-session spm-er-fullscreen" data-ed9-session data-screen="${m.page}" aria-label="Día ${m.calendarDay}: qué hacer cuando disminuye la firmeza, pantalla ${m.page} de 3"><div class="spm-ed9-artwork" style="background-image:url(&quot;${IMAGES[m.page-1]}&quot;)" role="group" aria-label="Imagen premium aprobada de la pantalla ${m.page}">${hits}${marks}${extra}</div>${nav}${window.SPM_VOICE?.transcript([GUIDES[m.page-1],...STEPS.map(row=>row[1])].join("\n\n"))||''}<p class="spm-ed9-status" data-ed9-status role="status" aria-live="polite">${esc(m.status)}</p></section>`;
}
function move(m,next){if(m.saving||!m.valid())return;stopVoice(m);m.page=Math.min(3,Math.max(1,next));m.status='';render(m);window.SPM_ERECTION_TOUCH_VIEW?.resetScroll(m.host)}
async function save(m){
 if(m.saving||!m.valid())return;
 if(!m.strategy){warn(m,'Selecciona una estrategia que quieras aplicar antes de guardar y continuar.');return}
 stopVoice(m);
 const record={...m.prior,source:'erection-practice-v1',erectionPracticeVersion:1,day:m.calendarDay,erectionLesson:9,activity:'Qué hacer cuando disminuye la firmeza',confirmed:true,anxiety:null,confidence:null,date:new Date().toISOString(),erectionResponseStrategy:m.strategy,erectionPlanStepsHeard:m.stepsHeard.slice(),lessonFormat:'three-approved-touch-screens'};
 m.saving=true;message(m,'Guardando tu estrategia…');const b=m.host.querySelector('[data-ed9-action="save"]');if(b)b.disabled=true;
 try{const result=await m.save(record);if(result===false||result?.ok===false)throw Error('save-failed')}
 catch{m.saving=false;if(m.host.isConnected)message(m,'No fue posible guardar. Tu elección sigue aquí; vuelve a intentarlo.');if(b?.isConnected)b.disabled=false;return}
 const c=window.SPM_RESOURCE_CONTEXT?.();
 if(c&&(String(c.userId)+':'+String(c.planId)!==m.scope||Number(c.day)!==m.calendarDay))return;
 if(m.host.isConnected){try{m.onBack()}catch{window.SPM_DAILY_PRACTICE?.open?.()}}
}
function mount({host,prior={},valid=()=>true,save:onSave,onBack=()=>{},scope='',calendarDay=24}={}){
 if(!host||typeof onSave!=='function')return false;
 stop();const p=prior&&typeof prior==='object'&&!Array.isArray(prior)?prior:{};
 const m={host,prior:{...p},valid,save:onSave,onBack,scope,calendarDay:Number(calendarDay),page:1,strategy:STRATEGY_KEYS.includes(p.erectionResponseStrategy)?p.erectionResponseStrategy:null,stepsHeard:[],stepHeard:null,saving:false,status:'',events:new AbortController()};
 active=m;render(m);
 host.addEventListener('click',e=>{
  if(active!==m||!m.valid()||m.saving)return;
  const button=e.target.closest('[data-ed9-action]');if(!button||button.disabled)return;
  const action=button.dataset.ed9Action, key=button.dataset.value;
  if(action==='audio'||action==='guide'){speak(m,GUIDES[m.page-1],'guide-'+m.page);return}
  if(action==='step'){
   const i=Number(key);if(!Number.isInteger(i)||i<0||i>3)return;
   m.stepHeard=i;if(!m.stepsHeard.includes(i))m.stepsHeard.push(i);
   speak(m,STEPS[i][2],'step-'+i);return;
  }
  if(action==='strategy'){
   if(!STRATEGY_KEYS.includes(key))return;m.strategy=key;
   stopVoice(m);m.status='';render(m);return;
  }
  if(action==='next'){move(m,m.page+1);return}
  if(action==='back'){if(m.page===1){stopVoice(m);onBack()}else move(m,m.page-1);return}
  if(action==='exit'){stopVoice(m);onBack();return}
  if(action==='save'){void save(m)}
 },{signal:m.events.signal});
 return true;
}
window.addEventListener('pagehide',stop);
window.SPM_ED_DAY9_TOUCH={mount,pause,stop,images:IMAGES.slice(),fields:['erectionResponseStrategy'],guides:GUIDES.slice(),steps:STEPS.map(row=>row[1]),strategies:STRATEGY_KEYS.slice(),voiceMode:'device-default'};
})();
