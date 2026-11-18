/* SPM · Erección y firmeza · sesión 7, día 18.
 * Las tres imágenes originales son las pantallas completas, no recursos decorativos.
 * Voz estándar del dispositivo, sin forzar Sofía/Rocío y sin duplicar el resto de la ruta.
 */
(()=>{'use strict';
if(window.SPM_ED_DAY7_TOUCH)return;
const IMAGES=[1,2,3].map(n=>'/premium-v2/assets/erection-day7/spm-de-day7-screen-0'+n+'.jpg');
const GUIDES=[
 'Hoy vas a reconocer tu progreso. Recuerda lo que has aprendido, sin exigirte una erección determinada. Selecciona uno o varios cambios que notes: comprender mejor tus contextos, soltar tensión, identificar lo que te ayuda o reconocer qué estímulos funcionan mejor. Si todavía estás empezando, también puedes indicarlo. Lo importante es observar con claridad tu punto actual, no evaluarte ni compararte.',
 'Ahora fortalece tu confianza. Elige una sola idea que te gustaría tener presente en tus próximas experiencias. No necesitas perfección para responder. Puedes volver al estímulo con calma, reconocer que tu respuesta puede entrenarse, preparar mejores condiciones o recordar que la presión no ayuda. Selecciona lo que más te sirva hoy.',
 'Para finalizar, define tu siguiente paso. Elige una acción concreta: repetir un contexto favorable, dedicar más tiempo a la estimulación, buscar un momento con menos estrés, mantener un estímulo útil o seguir observando tu patrón. No necesitas medir la firmeza hoy. Guarda tu elección y continúa con las otras actividades que tengas en tu ruta.'
];
const ADVANCES=[
 ['contextos','Reconozco mejor mis contextos'],
 ['tension','Suelto tensión con más facilidad'],
 ['ayuda','Identifico lo que me ayuda'],
 ['estimulos','Uso mejor los estímulos que me funcionan'],
 ['empezando','Aún estoy empezando']
];
const CONFIDENCE=[
 ['sin_perfeccion','No necesito perfección para responder'],
 ['calma','Puedo volver al estímulo con calma'],
 ['entrenarse','Mi respuesta puede entrenarse'],
 ['condiciones','Puedo preparar mejores condiciones'],
 ['presion','La presión no me ayuda']
];
const ACTIONS=[
 ['repetir_contexto','Repetir un contexto favorable'],
 ['mas_tiempo','Dar más tiempo a la estimulación'],
 ['menos_estres','Elegir un momento con menos estrés'],
 ['mantener_estimulo','Mantener un estímulo que me ayude'],
 ['observar_patron','Seguir observando mi patrón']
];
const BOUNDS=[
 [[29,878,834,974],[29,976,834,1074],[29,1076,834,1175],[29,1175,834,1274],[29,1275,834,1375]],
 [[29,878,834,974],[29,976,834,1074],[29,1076,834,1175],[29,1175,834,1274],[29,1275,834,1375]],
 [[29,877,834,963],[29,965,834,1051],[29,1052,834,1138],[29,1140,834,1225],[29,1227,834,1313]]
];
const KEYS=[ADVANCES,CONFIDENCE,ACTIONS].map(rows=>rows.map(([key])=>key));
const LABELS=['Reconoce tu progreso','Fortalece tu confianza','Define tu siguiente paso'];
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;':'&quot;',"'":'&#39;'}[ch]));
const rect=(x1,y1,x2,y2)=>'left:'+(x1/864*100).toFixed(4)+'%;top:'+(y1/1536*100).toFixed(4)+'%;width:'+((x2-x1)/864*100).toFixed(4)+'%;height:'+((y2-y1)/1536*100).toFixed(4)+'%';
let active=null;
function stopAudio(m){
 if(!m)return;
 try{window.speechSynthesis?.cancel?.()}catch{}
 m.utterance=null;
 m.host?.querySelector('.spm-ed7-hit.audio')?.classList.remove('playing');
 m.host?.querySelector('.spm-ed7-hit.audio')?.setAttribute('aria-pressed','false');
}
function cleanup(m){if(!m)return;stopAudio(m);m.events?.abort?.()}
function stop(){const m=active;active=null;cleanup(m)}
function pause(){if(active)stopAudio(active)}
function message(m,text){
 m.note=String(text||'');
 const status=m.host?.querySelector('[data-ed7-status]');if(status)status.textContent=m.note;
}
function required(m,text){
 // Avisos de selección siempre en el centro, con fondo semitransparente.
 if(!window.SPM_ERECTION_TOUCH_VIEW?.warn?.(m.host,text))message(m,text);
}
function speak(m){
 if(!m.valid()||m.saving)return;
 const key=m.page,uCurrent=m.utterance;
 if(uCurrent){stopAudio(m);return}
 if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=='function'){
  message(m,'La voz estándar del dispositivo no está disponible. Puedes leer las indicaciones de la pantalla.');return;
 }
 stopAudio(m);
 try{
  const u=new window.SpeechSynthesisUtterance(GUIDES[key-1]);
  u.lang='es-CO';u.rate=1;u.pitch=1;u.volume=1;
  // No se configura u.voice: el dispositivo selecciona su voz en español.
  m.utterance=u;
  const button=m.host?.querySelector('.spm-ed7-hit.audio');
  button?.classList.add('playing');button?.setAttribute('aria-pressed','true');
  u.onend=()=>{if(m.utterance===u)stopAudio(m)};
  u.onerror=()=>{if(m.utterance===u){stopAudio(m);message(m,'No se pudo reproducir la guía. Puedes intentar nuevamente.')}};
  window.speechSynthesis.speak(u);
 }catch{stopAudio(m);message(m,'No se pudo reproducir la guía.')}
}
function hit(coords,action,label,{value=null,selected=false,disabled=false,audio=false}={}){
 return '<button type="button" class="spm-ed7-hit'+(selected?' selected':'')+(audio?' audio':'')+'" style="'+rect(...coords)+'" data-ed7-action="'+esc(action)+'"'+(value===null?'':' data-value="'+esc(value)+'" aria-pressed="'+selected+'"')+(audio?' aria-pressed="false"':'')+(disabled?' disabled':'')+' aria-label="'+esc(label)+'"></button>';
}
function mark(x,y,key){return '<span class="spm-ed7-mark" data-ed7-marker="'+esc(key)+'" aria-hidden="true" style="'+rect(x-14,y-14,x+14,y+14)+'">✓</span>'}
function selected(m,key){return m.page===1?m.advances.includes(key):m.page===2?m.confidence===key:m.nextStep===key}
function render(m){
 if(!m.host?.isConnected)return;
 const p=m.page,rows=[ADVANCES,CONFIDENCE,ACTIONS][p-1],bounds=BOUNDS[p-1];
 let hits=hit([172,269,693,357],'audio','Escuchar guía de '+LABELS[p-1],{audio:true}),markers='';
 rows.forEach(([key,label],i)=>{
  const yes=selected(m,key),box=bounds[i];
  hits+=hit(box,'select',(yes?'Desmarcar ':'Seleccionar ')+label,{value:key,selected:yes});
  if(yes)markers+=mark(793,(box[1]+box[3])/2,key);
 });
 hits+=hit([17,25,74,112],'back','Anterior');
 hits+=hit(p===3?[29,1406,835,1511]:[29,1399,835,1512],p===3?'save':'next',p===3?'Guardar y continuar mi ruta de hoy':'Continuar',{disabled:m.saving});
 const day='<div class="spm-ed7-calendar-day" aria-hidden="true"><span>Día '+m.calendarDay+'<small>Erección y firmeza</small></span></div>';
 const nav='<nav class="spm-ed7-toolbar" aria-label="Navegación de Erección y firmeza día 18"><button type="button" data-ed7-action="back">'+(p===1?'← Volver a Hoy':'← Anterior')+'</button><span>'+p+' de 3 · Día '+m.calendarDay+'</span><button type="button" data-ed7-action="exit">Salir a Hoy</button></nav>';
 m.host.innerHTML='<section class="spm-ed7-session spm-er-fullscreen" data-ed7-session data-screen="'+p+'" aria-label="Erección y firmeza · Día '+m.calendarDay+' · '+LABELS[p-1]+' · pantalla '+p+' de 3"><div class="spm-ed7-artwork" style="background-image:url(&quot;'+IMAGES[p-1]+'&quot;)" role="group" aria-label="Lámina aprobada '+p+' de 3">'+hits+markers+day+'</div>'+nav+'<p class="spm-ed7-status" data-ed7-status role="status" aria-live="polite">'+esc(m.note)+'</p></section>';
}
function refreshSelections(m){
 m.host.querySelectorAll('[data-ed7-action="select"]').forEach(b=>{
  const yes=selected(m,b.dataset.value);b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes));
 });
 m.host.querySelectorAll('[data-ed7-marker]').forEach(el=>{el.remove()});
 const rows=[ADVANCES,CONFIDENCE,ACTIONS][m.page-1],bounds=BOUNDS[m.page-1];
 const art=m.host.querySelector('.spm-ed7-artwork');
 rows.forEach(([key],i)=>{
  if(!selected(m,key))return;
  const b=bounds[i],area=document.createElement('span');
  area.className='spm-ed7-mark';area.dataset.ed7Marker=key;area.setAttribute('aria-hidden','true');
  area.style.cssText=rect(793-14,(b[1]+b[3])/2-14,793+14,(b[1]+b[3])/2+14);
  area.textContent='✓';art?.appendChild(area);
 });
}
function choose(m,key){
 if(m.page===1){
  if(!KEYS[0].includes(key))return;
  if(key==='empezando')m.advances=m.advances.includes('empezando')?[]:['empezando'];
  else if(m.advances.includes(key))m.advances=m.advances.filter(v=>v!==key);
  else m.advances=[...m.advances.filter(v=>v!=='empezando'),key];
 }else if(m.page===2){if(!KEYS[1].includes(key))return;m.confidence=key}
 else{if(!KEYS[2].includes(key))return;m.nextStep=key}
 refreshSelections(m);message(m,'');
}
function move(m,nextPage){
 if(m.saving||!m.valid())return;
 if(nextPage>m.page){
  if(m.page===1&&!m.advances.length){required(m,'Selecciona al menos un cambio que reconoces en ti, o «Aún estoy empezando», para continuar.');return}
  if(m.page===2&&!m.confidence){required(m,'Elige una idea que quieras conservar esta semana para continuar.');return}
 }
 stopAudio(m);m.page=Math.max(1,Math.min(3,nextPage));m.note='';render(m);
 window.SPM_ERECTION_TOUCH_VIEW?.resetScroll(m.host);
}
async function save(m){
 if(m.saving||!m.valid())return;
 if(!m.advances.length){required(m,'Primero selecciona uno o varios avances o «Aún estoy empezando».');return}
 if(!m.confidence){required(m,'Elige una idea que quieras conservar esta semana.');return}
 if(!m.nextStep){required(m,'Selecciona una acción concreta para guardar y continuar tu ruta de hoy.');return}
 stopAudio(m);
 const record={...m.prior,source:'erection-practice-v1',erectionPracticeVersion:1,day:m.calendarDay,erectionLesson:7,activity:'Reconoce tu progreso',confirmed:true,anxiety:null,confidence:null,date:new Date().toISOString(),erectionProgress:m.advances.slice(),erectionConfidenceStatement:m.confidence,erectionNextStep:m.nextStep,lessonFormat:'three-approved-touch-screens'};
 m.saving=true;message(m,'Guardando tus respuestas de hoy…');
 const b=m.host.querySelector('[data-ed7-action="save"]');if(b)b.disabled=true;
 try{const result=await m.save(record);if(result===false||result?.ok===false)throw Error('save-failed')}
 catch{m.saving=false;if(m.host.isConnected)message(m,'No se pudo guardar. Tus respuestas siguen aquí; inténtalo nuevamente.');if(b?.isConnected)b.disabled=false;return}
 const c=window.SPM_RESOURCE_CONTEXT?.();
 if(c&&(String(c.userId)+':'+String(c.planId)!==m.scope||Number(c.day)!==m.calendarDay))return;
 if(m.host.isConnected){try{m.onBack()}catch{window.SPM_DAILY_PRACTICE?.open?.()}}
}
function mount({host,prior={},valid=()=>true,save:onSave,onBack=()=>{},scope='',calendarDay=18}={}){
 if(!host||typeof onSave!=='function')return false;
 stop();
 const p=prior&&typeof prior==='object'&&!Array.isArray(prior)?prior:{};
 const advances=Array.isArray(p.erectionProgress)?[...new Set(p.erectionProgress.filter(v=>KEYS[0].includes(v)))]:[];
 const restored=advances.includes('empezando')?['empezando']:advances;
 const m={host,prior:{...p},valid,save:onSave,onBack,scope,calendarDay:Number(calendarDay),page:1,advances:restored,confidence:KEYS[1].includes(p.erectionConfidenceStatement)?p.erectionConfidenceStatement:null,nextStep:KEYS[2].includes(p.erectionNextStep)?p.erectionNextStep:null,saving:false,note:'',utterance:null,events:new AbortController()};
 active=m;render(m);
 host.addEventListener('click',e=>{
  if(active!==m||!m.valid()||m.saving)return;
  const b=e.target.closest('[data-ed7-action]');if(!b||b.disabled)return;
  const action=b.dataset.ed7Action,key=b.dataset.value;
  if(action==='audio'){speak(m);return}
  if(action==='select'){choose(m,key);return}
  if(action==='next'){move(m,m.page+1);return}
  if(action==='back'){if(m.page===1){stopAudio(m);m.onBack()}else move(m,m.page-1);return}
  if(action==='exit'){stopAudio(m);m.onBack();return}
  if(action==='save'){void save(m)}
 },{signal:m.events.signal});
 return true;
}
window.addEventListener('pagehide',stop);
window.SPM_ED_DAY7_TOUCH={mount,pause,stop,images:IMAGES.slice(),fields:['erectionProgress','erectionConfidenceStatement','erectionNextStep'],guides:GUIDES.slice(),voiceMode:'device-default',options:{advances:KEYS[0].slice(),confidence:KEYS[1].slice(),nextStep:KEYS[2].slice()}};
})();