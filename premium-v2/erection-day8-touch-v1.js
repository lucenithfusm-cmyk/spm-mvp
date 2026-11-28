/* SPM Digital Wellness · Erección y firmeza · Sesión 8, Día 21.
 * Tres láminas originales aprobadas como superficies táctiles 1080x1920.
 * Una sola guía completa por pantalla con voz estándar del dispositivo.
 */
(()=>{'use strict';
if(window.SPM_ED_DAY8_TOUCH)return;
const IMAGES=[1,2,3].map(n=>'/premium-v2/assets/erection-day8/spm-de-day8-screen-0'+n+'.webp');
const GUIDES=[
 'Hoy vamos a practicar cómo sostener una experiencia sexual agradable sin exigir que la firmeza sea idéntica todo el tiempo. Cuando estés en un contexto íntimo que hayas elegido libremente, conserva el estímulo y el ritmo que te resulten cómodos. Si notas que tu erección cambia, evita apresurarte o convertirlo en una prueba. Puedes mantener el contacto, ajustar una sola cosa —como el ritmo o el estímulo— o hacer una pausa. Continúa únicamente mientras exista interés y comodidad. No necesitas tener relaciones sexuales ni provocar una erección ahora. Esta es una habilidad que podrás utilizar cuando surja una oportunidad natural.',
 'No todas las posiciones ofrecen la misma comodidad o la misma experiencia de firmeza para una persona. Algunos hombres reconocen que mantienen mejor la erección en ciertas posturas y que en otras puede disminuir. Eso no significa que una posición aumente el flujo sanguíneo de manera universal. Piensa únicamente en experiencias que ya hayas tenido. Puedes marcar una o varias posiciones donde recuerdes mejor mantenimiento. Si recuerdas una postura que te resulte menos favorable, puedes señalarla también. Si todavía no tienes una referencia clara, elige No evaluable. No necesitas comprobar nada hoy. El propósito es reconocer lo que funciona para ti y evitar posiciones incómodas o dolorosas.',
 'Elige una sola estrategia para tu próxima experiencia íntima. Puedes mantener el estímulo que te resulta agradable, comenzar en una posición que suela favorecer tu respuesta o cambiar suavemente de postura cuando notes que una no te ayuda. También puedes hacer una pausa sin interpretarla como un fracaso. No hay una postura perfecta para todos y no es necesario conseguir una erección ahora. Si todavía no has identificado qué te funciona, esa también es una respuesta válida. Guarda tu elección y continúa con las actividades de hoy.'
];
const FAVORABLE=[
 ['tu_encima','Tú encima de tu pareja',[55,642,365,905],[79,847]],
 ['pareja_encima','Tu pareja encima de ti',[380,642,700,905],[404,847]],
 ['de_lado','Ambos de lado',[709,642,1034,905],[735,847]],
 ['sentado','Sentado',[55,912,365,1165],[79,1111]],
 ['de_pie','De pie',[380,912,700,1165],[404,1111]],
 ['otra','Otra posición',[711,912,1034,1165],[776,1108]],
 ['no_evaluable','Todavía no lo identifico / No evaluable',[55,1180,1030,1254],[78,1214]]
];
const UNFAVORABLE=[
 ['tu_encima','Tú encima de tu pareja'],['pareja_encima','Tu pareja encima de ti'],
 ['de_lado','Ambos de lado'],['sentado','Sentado'],['de_pie','De pie'],['otra','Otra posición']
];
const STRATEGIES=[
 ['maintain_stimulus','Mantener estímulo y ritmo',[35,895,1045,1034],[991,966]],
 ['favor_position','Elegir postura favorable',[35,1041,1045,1170],[991,1115]],
 ['switch_position','Cambiar de posición',[35,1181,1045,1304],[991,1243]],
 ['pause','Hacer una pausa',[35,1316,1045,1450],[991,1385]],
 ['observe','Seguir identificando lo que ayuda',[35,1458,1045,1640],[991,1555]]
];
const FAV_KEYS=FAVORABLE.map(row=>row[0]);
const STRATEGY_KEYS=STRATEGIES.map(row=>row[0]);
const BAD_KEYS=UNFAVORABLE.map(row=>row[0]);
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const pos=(x1,y1,x2,y2)=>`left:${(x1/1080*100).toFixed(3)}%;top:${(y1/1920*100).toFixed(3)}%;width:${((x2-x1)/1080*100).toFixed(3)}%;height:${((y2-y1)/1920*100).toFixed(3)}%`;
let active=null;
function stopVoice(m){
 if(!m)return;
 try{window.SPM_VOICE?.cancel?.()}catch{}
 m.voice=null;
 m.host?.querySelector('[data-ed8-action="audio"]')?.classList.remove('playing');
 m.host?.querySelector('[data-ed8-action="audio"]')?.setAttribute('aria-pressed','false');
}
function pauseTimer(m){if(m?.timer){clearInterval(m.timer);m.timer=null}}
function stop(){const m=active;active=null;if(m){stopVoice(m);pauseTimer(m);m.events?.abort?.()}}
function pause(){if(active){stopVoice(active);pauseTimer(active)}}
function message(m,txt){m.status=String(txt||'');const e=m.host?.querySelector('[data-ed8-status]');if(e)e.textContent=m.status}
function alertRequired(m,txt){if(!window.SPM_ERECTION_TOUCH_VIEW?.warn?.(m.host,txt))message(m,txt)}
function speak(m){
 if(!m.valid()||m.saving)return;
 if(m.voice){stopVoice(m);return}
 if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=='function'){
  message(m,'La voz del dispositivo no está disponible. Sigue la guía escrita de la pantalla.');return;
 }
 try{
  const u=new window.SpeechSynthesisUtterance(GUIDES[m.page-1]);
  u.lang='es-CO';u.rate=1;u.pitch=1;u.volume=1;
  // No elegir una voz femenina, ni reemplazar Lenny por voces de proveedor.
  m.voice=u;
  const button=m.host?.querySelector('[data-ed8-action="audio"]');
  button?.classList.add('playing');button?.setAttribute('aria-pressed','true');
  u.onend=()=>{if(m.voice===u)stopVoice(m)};
  u.onerror=()=>{if(m.voice===u){stopVoice(m);message(m,'No se pudo reproducir la guía. Puedes intentar nuevamente.')}};
  window.SPM_VOICE.speak(u);
 }catch{stopVoice(m);message(m,'No se pudo reproducir la voz del dispositivo.')}
}
function hit(rect,action,label,{value=null,selected=false,audio=false,disabled=false}={}){
 return `<button type="button" class="spm-ed8-hit${selected?' selected':''}${audio?' audio':''}" data-ed8-action="${esc(action)}" ${value===null?'':`data-value="${esc(value)}" aria-pressed="${selected?'true':'false'}"`} ${audio?'aria-pressed="false"':''} ${disabled?'disabled':''} style="${pos(...rect)}" aria-label="${esc(label)}"></button>`;
}
function mark(x,y){return `<span class="spm-ed8-check" aria-hidden="true" style="${pos(x-18,y-18,x+18,y+18)}">✓</span>`}
function render(m){
 if(!m.host?.isConnected)return;
 let hits='',checks='',extra='';
 if(m.page===1){
  hits+=hit([271,870,805,980],'audio','Escuchar práctica completa',{audio:true});
  hits+=hit([30,1492,561,1620],'practice','Iniciar práctica guiada');
  hits+=hit([575,1492,1046,1620],'timer','Cronómetro opcional');
  hits+=hit([31,1750,1048,1890],'next','Continuar');
  if(m.started)extra+='<span class="spm-ed8-practiced" aria-live="polite">Práctica iniciada</span>';
 }else if(m.page===2){
  hits+=hit([313,410,771,514],'audio','Escuchar guía completa sobre posiciones',{audio:true});
  for(const [key,label,box,center]of FAVORABLE){
   const on=m.favorable.includes(key);
   hits+=hit(box,'fav',(on?'Desmarcar ':'Seleccionar ')+label,{value:key,selected:on});
   if(on)checks+=mark(...center);
  }
  const optionHtml=['<option value="">Seleccionar una posición</option>',...UNFAVORABLE.map(([k,l])=>`<option value="${esc(k)}"${m.unfavorable===k?' selected':''}>${esc(l)}</option>`)].join('');
  // El selector nativo es accesible en iPhone; ocupa la zona del selector dibujado.
  extra+=`<select class="spm-ed8-select" data-ed8-select aria-label="Posición menos favorable, opcional" style="${pos(39,1387,692,1489)}">${optionHtml}</select>`;
  if(m.unfavorable&&m.unfavorable!=='no_identificada'){
   const label=UNFAVORABLE.find(row=>row[0]===m.unfavorable)?.[1]||'';
   extra+=`<span class="spm-ed8-select-label" style="${pos(49,1405,650,1468)}">${esc(label)}</span>`;
  }
  hits+=hit([696,1386,1042,1491],'bad-unknown','Todavía no identifico una posición menos favorable',{selected:m.unfavorable==='no_identificada'});
  if(m.unfavorable==='no_identificada')checks+=mark(724,1435);
  hits+=hit([31,1750,1048,1890],'next','Continuar');
 }else{
  hits+=hit([311,676,776,766],'audio','Escuchar guía completa para elegir estrategia',{audio:true});
  for(const [key,label,box,center]of STRATEGIES){
   const on=m.strategy===key;
   hits+=hit(box,'strategy',(on?'Elegida: ':'Elegir ')+label,{value:key,selected:on});
   if(on)checks+=mark(...center);
  }
  hits+=hit([30,1747,1050,1887],'save','Guardar y continuar mi ruta de hoy',{disabled:m.saving});
 }
 const timer=m.page===1&&m.timerVisible?`<div class="spm-ed8-timer-panel" role="group" aria-label="Cronómetro opcional"><span data-ed8-timer>${formatTimer(m.seconds)}</span><button data-ed8-action="timer-toggle" type="button">${m.timer?'Pausar':'Iniciar'}</button><button data-ed8-action="timer-reset" type="button">Reiniciar</button><button data-ed8-action="timer-close" type="button">Cerrar</button></div>`:'';
 const nav=`<nav class="spm-ed8-toolbar" aria-label="Navegación Día 21"><button type="button" data-ed8-action="back">${m.page===1?'← Volver a Hoy':'← Anterior'}</button><span>${m.page} de 3 · Día ${m.calendarDay}</span><button type="button" data-ed8-action="exit">Salir a Hoy</button></nav>`;
 m.host.innerHTML=`<section class="spm-ed8-session spm-er-fullscreen" data-ed8-session data-screen="${m.page}" aria-label="Día ${m.calendarDay}: Sostener la erección, pantalla ${m.page} de 3"><div class="spm-ed8-artwork" style="background-image:url(&quot;${IMAGES[m.page-1]}&quot;)" role="group" aria-label="Imagen premium aprobada de la pantalla ${m.page}">${hits}${checks}${extra}</div>${timer}${nav}${window.SPM_VOICE?.transcript(GUIDES[m.page-1])||''}<p class="spm-ed8-status" data-ed8-status role="status" aria-live="polite">${esc(m.status)}</p></section>`;
 if(m.voice){const btn=m.host.querySelector('[data-ed8-action="audio"]');btn?.classList.add('playing');btn?.setAttribute('aria-pressed','true')}
}
function formatTimer(sec){const n=Math.max(0,Math.floor(sec||0));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')}
function choose(m,key){
 if(m.page===2){
  if(!FAV_KEYS.includes(key))return;
  if(key==='no_evaluable')m.favorable=m.favorable.includes(key)?[]:[key];
  else if(m.favorable.includes(key))m.favorable=m.favorable.filter(k=>k!==key);
  else m.favorable=[...m.favorable.filter(k=>k!=='no_evaluable'),key];
 }else if(m.page===3){if(!STRATEGY_KEYS.includes(key))return;m.strategy=key}
 m.status='';render(m);
}
function move(m,next){
 if(m.saving||!m.valid())return;
 if(next>m.page&&m.page===2&&!m.favorable.length){
  alertRequired(m,'Selecciona una o varias posiciones favorables, o «Todavía no lo identifico / No evaluable», para continuar.');return;
 }
 stopVoice(m);pauseTimer(m);m.page=Math.max(1,Math.min(3,next));m.status='';render(m);
 window.SPM_ERECTION_TOUCH_VIEW?.resetScroll(m.host);
}
async function save(m){
 if(m.saving||!m.valid())return;
 if(!m.favorable.length){alertRequired(m,'Selecciona una posición favorable o «No evaluable» para continuar.');return}
 if(!m.strategy){alertRequired(m,'Elige una estrategia para tu próxima experiencia antes de guardar.');return}
 stopVoice(m);pauseTimer(m);
 const record={...m.prior,source:'erection-practice-v1',erectionPracticeVersion:1,day:m.calendarDay,erectionLesson:8,
  activity:'Sostener la erección sin perseguir firmeza constante',confirmed:true,anxiety:null,confidence:null,
  date:new Date().toISOString(),erectionFavorablePositions:m.favorable.slice(),
  erectionLessFavorablePosition:m.unfavorable||null,erectionChosenStrategy:m.strategy,
  erectionPracticeStarted:Boolean(m.started),erectionOptionalTimerSeconds:m.seconds,
  lessonFormat:'three-approved-touch-screens'};
 m.saving=true;message(m,'Guardando tu práctica de hoy…');
 const btn=m.host.querySelector('[data-ed8-action="save"]');if(btn)btn.disabled=true;
 try{const result=await m.save(record);if(result===false||result?.ok===false)throw Error('save-failed')}
 catch{m.saving=false;if(m.host.isConnected)message(m,'No fue posible guardar. Tus elecciones siguen aquí; vuelve a intentarlo.');if(btn?.isConnected)btn.disabled=false;return}
 const c=window.SPM_RESOURCE_CONTEXT?.();
 if(c&&(String(c.userId)+':'+String(c.planId)!==m.scope||Number(c.day)!==m.calendarDay))return;
 if(m.host.isConnected){try{m.onBack()}catch{window.SPM_DAILY_PRACTICE?.open?.()}}
}
function mount({host,prior={},valid=()=>true,save:onSave,onBack=()=>{},scope='',calendarDay=21}={}){
 if(!host||typeof onSave!=='function')return false;
 stop();const p=prior&&typeof prior==='object'&&!Array.isArray(prior)?prior:{};
 const fav=Array.isArray(p.erectionFavorablePositions)?[...new Set(p.erectionFavorablePositions.filter(k=>FAV_KEYS.includes(k)))]:[];
 const exclusive=fav.includes('no_evaluable')?['no_evaluable']:fav;
 const bad=p.erectionLessFavorablePosition;
 const m={host,prior:{...p},valid,save:onSave,onBack,scope,calendarDay:Number(calendarDay),page:1,
  favorable:exclusive,unfavorable:BAD_KEYS.includes(bad)||bad==='no_identificada'?bad:null,
  strategy:STRATEGY_KEYS.includes(p.erectionChosenStrategy)?p.erectionChosenStrategy:null,
  started:Boolean(p.erectionPracticeStarted),seconds:Number.isInteger(p.erectionOptionalTimerSeconds)&&p.erectionOptionalTimerSeconds>=0?p.erectionOptionalTimerSeconds:0,
  timerVisible:false,timer:null,voice:null,saving:false,status:'',events:new AbortController()};
 active=m;render(m);
 host.addEventListener('click',event=>{
  if(active!==m||!m.valid()||m.saving)return;
  const b=event.target.closest('[data-ed8-action]');if(!b||b.disabled)return;
  const action=b.dataset.ed8Action,key=b.dataset.value;
  if(action==='audio'){speak(m);return}
  if(action==='practice'){m.started=true;message(m,'Práctica iniciada. Sigue la guía a tu ritmo; el cronómetro no es obligatorio.');if(!m.voice)speak(m);render(m);return}
  if(action==='timer'){m.timerVisible=!m.timerVisible;if(!m.timerVisible)pauseTimer(m);render(m);return}
  if(action==='timer-toggle'){
   if(m.timer)pauseTimer(m);else{
    m.timer=setInterval(()=>{m.seconds=Math.min(m.seconds+1,36000);const d=m.host?.querySelector('[data-ed8-timer]');if(d)d.textContent=formatTimer(m.seconds)},1000);
   }render(m);return;
  }
  if(action==='timer-reset'){pauseTimer(m);m.seconds=0;render(m);return}
  if(action==='timer-close'){pauseTimer(m);m.timerVisible=false;render(m);return}
  if(action==='fav'||action==='strategy'){choose(m,key);return}
  if(action==='bad-unknown'){m.unfavorable=m.unfavorable==='no_identificada'?null:'no_identificada';render(m);return}
  if(action==='next'){move(m,m.page+1);return}
  if(action==='back'){if(m.page===1){stopVoice(m);pauseTimer(m);m.onBack()}else move(m,m.page-1);return}
  if(action==='exit'){stopVoice(m);pauseTimer(m);m.onBack();return}
  if(action==='save'){void save(m)}
 },{signal:m.events.signal});
 host.addEventListener('change',event=>{
  if(active!==m||m.saving||!m.valid())return;
  const select=event.target.closest('[data-ed8-select]');if(!select)return;
  const value=select.value;
  m.unfavorable=BAD_KEYS.includes(value)?value:null;
  render(m);
 },{signal:m.events.signal});
 return true;
}
window.addEventListener('pagehide',stop);
window.SPM_ED_DAY8_TOUCH={mount,pause,stop,images:IMAGES.slice(),fields:['erectionFavorablePositions','erectionLessFavorablePosition','erectionChosenStrategy'],guides:GUIDES.slice(),voiceMode:'device-default',favorable:FAV_KEYS.slice(),unfavorable:BAD_KEYS.slice(),strategies:STRATEGY_KEYS.slice()};
})();