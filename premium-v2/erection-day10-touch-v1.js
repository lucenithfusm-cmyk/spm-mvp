/* SPM Digital Wellness · Erección y firmeza · sesión 10 / Día 27.
 * Las dos láminas recibidas son las pantallas: no se re-dibujan ni se repiten
 * la recuperación en encuentro (día 24) ni las siete historias post-caída.
 */
(()=>{'use strict';
if(window.SPM_ED_DAY10_TOUCH)return;
const IMAGES=[1,2].map(n=>'/premium-v2/assets/erection-day10/spm-de-day10-screen-0'+n+'.webp');
const GUIDES=[
 'Después de una experiencia en la que tu firmeza disminuyó, quizá te preocupes por lo que pueda suceder la próxima vez. Es importante reconocer esas señales sin convertirlas en una prueba. Algunas personas comienzan a vigilar su erección, a evitar encuentros o a exigirse demostrar que pueden responder. Otras no notan estos cambios. Selecciona solo lo que reconozcas en ti. No necesitas provocar una erección para responder. Una experiencia aislada no predice necesariamente la siguiente.',
 'Ahora vas a preparar un plan para proteger tus avances. Elige una acción que puedas recordar si reaparece la preocupación. Si te descubres anticipando un fallo, recuerda que una sola experiencia no define tu respuesta. Si vuelves a vigilarte, retoma alguna herramienta que ya hayas aprendido. Si has comenzado a evitar la intimidad, puedes recuperar experiencias agradables a tu ritmo y sin metas obligatorias. Si la dificultad es nueva, persiste o empeora, conviene consultar a un profesional de salud. Guarda tu elección y continúa tu ruta de hoy. La prevención significa prepararte para responder con flexibilidad, no garantizar una erección perfecta.'
];
const SIGNALS=[
 ['fear_repeat','Temo que vuelva a ocurrir',[76,1084,1005,1198],[949,1143]],
 ['checking','Compruebo demasiado mi erección',[76,1206,1005,1318],[949,1265]],
 ['avoidance','Evito nuevas experiencias',[76,1329,1005,1440],[949,1386]],
 ['pressure','Siento que debo demostrar que puedo',[76,1450,1005,1563],[949,1508]],
 ['none','No identifico estas señales',[76,1573,1005,1684],[949,1630]]
];
const STRATEGIES=[
 ['reframe','Recordar que un episodio no predice otro',[76,1056,1005,1178],[950,1114]],
 ['refocus','Retomar una herramienta ya aprendida',[76,1182,1005,1307],[950,1241]],
 ['reconnect','Volver a la intimidad sin metas obligatorias',[76,1315,1005,1439],[950,1374]],
 ['consult','Solicitar valoración si el cambio es nuevo o persiste',[76,1446,1005,1571],[950,1506]],
 ['maintain','Mantener lo que ya me funciona',[76,1579,1005,1704],[950,1637]]
];
const SIGNAL_KEYS=SIGNALS.map(x=>x[0]), STRATEGY_KEYS=STRATEGIES.map(x=>x[0]);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rect=(x1,y1,x2,y2)=>`left:${(x1/1080*100).toFixed(4)}%;top:${(y1/1920*100).toFixed(4)}%;width:${((x2-x1)/1080*100).toFixed(4)}%;height:${((y2-y1)/1920*100).toFixed(4)}%`;
let active=null;
function stopVoice(m){
 if(!m)return;
 try{window.speechSynthesis?.cancel?.()}catch{}
 m.voice=null;
 const b=m.host?.querySelector('[data-ed10-action="audio"]');
 b?.classList.remove('playing');b?.setAttribute('aria-pressed','false');
}
function pause(){if(active)stopVoice(active)}
function stop(){const m=active;active=null;if(m){stopVoice(m);m.events?.abort?.()}}
function status(m,txt){m.status=String(txt||'');const p=m.host?.querySelector('[data-ed10-status]');if(p)p.textContent=m.status}
function required(m,msg){
 if(!window.SPM_ERECTION_TOUCH_VIEW?.warn?.(m.host,msg)){
  // Fallback: keep the warning in the visible current viewport rather than at the foot of an image.
  const root=m.host.querySelector('.spm-ed10-session');
  if(root){const x=document.createElement('div');x.className='spm-ed10-alert-layer';x.setAttribute('role','presentation');x.innerHTML='<section role="alertdialog" aria-modal="true" aria-labelledby="spm-ed10-alert-title" aria-describedby="spm-ed10-alert-msg"><strong id="spm-ed10-alert-title">Selecciona una opción</strong><p id="spm-ed10-alert-msg"></p><button type="button">Entendido</button></section>';x.querySelector('#spm-ed10-alert-msg').textContent=msg;root.append(x);const b=x.querySelector('button');const close=()=>x.remove();b.addEventListener('click',close);x.addEventListener('click',e=>{if(e.target===x)close()});b.focus({preventScroll:true});}
 }
}
function speak(m){
 if(!m.valid()||m.saving)return;
 if(m.voice){stopVoice(m);return}
 if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=='function'){
  status(m,'La voz del dispositivo no está disponible. Puedes leer las instrucciones de esta pantalla.');return;
 }
 try{
  const u=new window.SpeechSynthesisUtterance(GUIDES[m.page-1]);
  u.lang='es-CO';u.rate=1;u.pitch=1;u.volume=1;
  // El guion original requiere Leni. Si ese audio no está disponible,
  // se deja seleccionar la voz habitual del dispositivo: nunca Sofía/Rocío por defecto.
  m.voice=u;
  const btn=m.host.querySelector('[data-ed10-action="audio"]');btn?.classList.add('playing');btn?.setAttribute('aria-pressed','true');
  u.onend=()=>{if(m.voice===u)stopVoice(m)};
  u.onerror=()=>{if(m.voice===u){stopVoice(m);status(m,'No se pudo reproducir la guía. Intenta nuevamente.')}};
  window.speechSynthesis.speak(u);
 }catch{stopVoice(m);status(m,'No se pudo reproducir la guía.')}
}
function hit(box,action,label,{value=null,selected=false,audio=false,disabled=false}={}){
 return `<button type="button" class="spm-ed10-hit${audio?' audio':''}${selected?' selected':''}" data-ed10-action="${esc(action)}" ${value===null?'':`data-value="${esc(value)}" aria-pressed="${selected?'true':'false'}"`} ${audio?'aria-pressed="false"':''}${disabled?' disabled':''} style="${rect(...box)}" aria-label="${esc(label)}"></button>`;
}
function check(x,y){return `<span class="spm-ed10-check" aria-hidden="true" style="${rect(x-19,y-19,x+19,y+19)}">✓</span>`}
function render(m){
 if(!m.host?.isConnected)return;
 let hits=hit([70,458,686,559],'audio','Escuchar guía de la pantalla '+m.page,{audio:true});let checks='';
 const rows=m.page===1?SIGNALS:STRATEGIES;
 for(const [key,label,box,pos] of rows){
  const yes=m.page===1?m.warningSignals.includes(key):m.preventionStrategy===key;
  hits+=hit(box,m.page===1?'signal':'strategy',(yes?'Desmarcar ':'Seleccionar ')+label,{value:key,selected:yes});
  if(yes)checks+=check(...pos);
 }
 hits+=hit([60,1797,1023,1896],m.page===1?'next':'save',m.page===1?'Continuar':'Guardar y continuar mi ruta de hoy',{disabled:m.saving});
 const nav=`<nav class="spm-ed10-toolbar" aria-label="Navegación del día ${m.calendarDay}"><button type="button" data-ed10-action="back">${m.page===1?'← Volver a Hoy':'← Anterior'}</button><span>Pantalla ${m.page} de 2 · Día ${m.calendarDay}</span><button type="button" data-ed10-action="exit">Salir a Hoy</button></nav>`;
 m.host.innerHTML=`<section class="spm-ed10-session spm-er-fullscreen" data-ed10-session data-screen="${m.page}" aria-label="Día ${m.calendarDay}: prevención después de una caída, pantalla ${m.page} de 2"><div class="spm-ed10-artwork" style="background-image:url(&quot;${IMAGES[m.page-1]}&quot;)" role="group" aria-label="Pantalla aprobada ${m.page} de 2">${hits}${checks}</div>${nav}<p class="spm-ed10-status" data-ed10-status role="status" aria-live="polite">${esc(m.status)}</p></section>`;
}
function choose(m,key){
 if(m.page===1){
  if(!SIGNAL_KEYS.includes(key))return;
  if(key==='none'){m.warningSignals=m.warningSignals.includes('none')?[]:['none']}
  else if(m.warningSignals.includes(key)){m.warningSignals=m.warningSignals.filter(x=>x!==key)}
  else{m.warningSignals=[...m.warningSignals.filter(x=>x!=='none'),key]}
 }else{if(!STRATEGY_KEYS.includes(key))return;m.preventionStrategy=key}
 status(m,'');render(m);
}
function advance(m){
 if(!m.warningSignals.length){required(m,'Marca al menos una señal que reconozcas, o «No identifico estas señales», para continuar.');return}
 stopVoice(m);m.page=2;m.status='';render(m);window.SPM_ERECTION_TOUCH_VIEW?.resetScroll(m.host);
}
async function save(m){
 if(m.saving||!m.valid())return;
 if(!m.warningSignals.length){required(m,'Primero selecciona las señales que reconoces o indica que no las identificas.');return}
 if(!m.preventionStrategy){required(m,'Selecciona una estrategia de prevención para guardar y continuar.');return}
 stopVoice(m);
 const record={...m.prior,source:'erection-practice-v1',erectionPracticeVersion:1,day:m.calendarDay,erectionLesson:10,activity:'Prevención después de una caída',confirmed:true,anxiety:null,confidence:null,date:new Date().toISOString(),warningSignals:m.warningSignals.slice(),preventionStrategy:m.preventionStrategy,lessonFormat:'two-approved-touch-screens'};
 m.saving=true;status(m,'Guardando tu plan de prevención…');const b=m.host.querySelector('[data-ed10-action="save"]');if(b)b.disabled=true;
 try{const result=await m.save(record);if(result===false||result?.ok===false)throw Error('save-failed')}
 catch{m.saving=false;if(m.host.isConnected){status(m,'No se pudo guardar. Tus elecciones siguen aquí; vuelve a intentarlo.');if(b?.isConnected)b.disabled=false}return}
 const c=window.SPM_RESOURCE_CONTEXT?.();
 if(c&&(String(c.userId)+':'+String(c.planId)!==m.scope||Number(c.day)!==m.calendarDay))return;
 if(m.host.isConnected){try{m.onBack()}catch{window.SPM_DAILY_PRACTICE?.open?.()}}
}
function mount({host,prior={},valid=()=>true,save:onSave,onBack=()=>{},scope='',calendarDay=27}={}){
 if(!host||typeof onSave!=='function')return false;
 stop();const p=prior&&typeof prior==='object'&&!Array.isArray(prior)?prior:{};
 const priorSignals=Array.isArray(p.warningSignals)?[...new Set(p.warningSignals.filter(key=>SIGNAL_KEYS.includes(key)))]:[];
 const state={host,prior:{...p},valid,save:onSave,onBack,scope,calendarDay:Number(calendarDay),page:1,warningSignals:priorSignals.includes('none')?['none']:priorSignals,preventionStrategy:STRATEGY_KEYS.includes(p.preventionStrategy)?p.preventionStrategy:null,status:'',saving:false,voice:null,events:new AbortController()};
 active=state;render(state);
 host.addEventListener('click',e=>{
  if(active!==state||!state.valid()||state.saving)return;
  const b=e.target.closest('[data-ed10-action]');if(!b||b.disabled)return;
  const action=b.dataset.ed10Action,key=b.dataset.value;
  if(action==='audio'){speak(state);return}
  if(action==='signal'||action==='strategy'){choose(state,key);return}
  if(action==='next'){advance(state);return}
  if(action==='save'){void save(state);return}
  if(action==='back'){if(state.page===2){stopVoice(state);state.page=1;state.status='';render(state)}else {stopVoice(state);onBack()}return}
  if(action==='exit'){stopVoice(state);onBack()}
 },{signal:state.events.signal});
 return true;
}
window.addEventListener('pagehide',stop);
window.SPM_ED_DAY10_TOUCH={mount,pause,stop,images:IMAGES.slice(),guides:GUIDES.slice(),voiceMode:'device-default-pending-Leni',fields:['warningSignals','preventionStrategy'],signals:SIGNAL_KEYS.slice(),strategies:STRATEGY_KEYS.slice()};
})();
