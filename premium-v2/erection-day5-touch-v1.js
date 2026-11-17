/* SPM Digital Wellness · Erección y firmeza · Sesión 5, calendario día 12.
 * Usa exactamente tres imágenes aprobadas como superficies táctiles.
 * Recupera la narración original del antiguo día 5 en tramos por pantalla.
 */
(()=>{'use strict';
if(window.SPM_ED_DAY5_TOUCH)return;
const BASE=window.SPM_ED_DAY5_IMAGE_BASE||'/premium-v2/assets/erection-day5/';
const IMAGES=window.SPM_ED_DAY5_IMAGE_URLS||[1,2,3].map(n=>BASE+'spm-de-day5-screen-0'+n+'.webp');
const AUDIO=window.SPM_ED_DAY5_AUDIO_SRC||'/premium-v2/assets/audio/erection/erection-day-5-20261113.mp3';
// Segments are thematic passages in the already approved Day 5 source.
// Source: 49.76325 s / narration; see docs/qa/erection-practice-audio-days4-6-20261113.json.
const AUDIO_SECTIONS=[[0,17],[17,33],[33,49.76325]];
const GUIDES={
 1:'Hoy identificarás qué suele facilitar tu respuesta eréctil. Recuerda experiencias que ya hayas vivido; no necesitas provocar una erección para responder. Elige hasta tres factores, por ejemplo contacto agradable, imaginación, anticipación, un ritmo cómodo, privacidad o conexión. Si todavía no puedes reconocer alguno, pulsa Aún no lo identifico. No estamos haciendo una prueba ni buscando una respuesta correcta.',
 2:'Ahora piensa qué condiciones suelen dificultarte la respuesta eréctil. Puedes reconocer presión por responder, prisa, cansancio, estrés o falta de privacidad. Selecciona hasta dos factores que hayas vivido. Si no tienes claro qué te frena, puedes marcar Aún no lo identifico. No necesitas evaluar tu firmeza ni repetir ninguna experiencia sexual ahora.',
 3:'Elige una sola condición que puedas mejorar para una próxima experiencia. Puede ser buscar privacidad, darte más tiempo, ajustar el ritmo o expresar una preferencia. Si puedes, prepara ese cambio desde hoy: reduce interrupciones, reserva un momento sin prisa o piensa en cómo comunicarías lo que te ayuda. Si aún no lo identificas, elige seguir observando, sin forzar. No es necesario provocar una erección para completar el día. Guarda tu decisión y continúa tu ruta del día de hoy.'
};
const FAC=[
 ['contact','Contacto agradable',[39,827,534,963],[499,896]],
 ['imagination','Imaginación o fantasía',[546,827,1044,963],[1008,896]],
 ['anticipation','Anticipación',[39,973,534,1109],[499,1039]],
 ['novelty','Novedad acordada',[546,973,1044,1109],[1008,1039]],
 ['rhythm','Un ritmo cómodo',[39,1119,534,1255],[499,1185]],
 ['privacy','Privacidad',[546,1119,1044,1255],[1008,1185]],
 ['connection','Conexión emocional',[39,1265,534,1403],[499,1333]],
 ['solo','Exploración individual',[546,1265,1044,1403],[1008,1333]],
 ['unknown','Aún no lo identifico',[40,1436,1042,1544],[1008,1490]]
];
const INHIB=[
 ['pressure','Presión por responder',[39,948,534,1082],[499,1016]],
 ['rush','Prisa',[546,948,1044,1082],[1008,1016]],
 ['fatigue','Cansancio',[39,1094,534,1228],[499,1162]],
 ['stress','Estrés',[546,1094,1044,1228],[1008,1162]],
 ['privacy','Falta de privacidad',[39,1239,534,1374],[499,1307]],
 ['unknown','Aún no lo identifico',[546,1239,1044,1374],[1008,1307]]
];
const ADJUST=[
 ['privacy','Buscar privacidad',[40,1002,1040,1135],[992,1070]],
 ['time','Darme más tiempo',[40,1147,1040,1280],[992,1214]],
 ['rhythm','Ajustar el ritmo',[40,1292,1040,1425],[992,1358]],
 ['communicate','Expresar una preferencia',[40,1438,1040,1569],[992,1500]],
 ['observe','Seguir observando sin forzar',[40,1581,1040,1710],[992,1645]]
];
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const rect=(x1,y1,x2,y2)=>`left:${(x1/1080*100).toFixed(3)}%;top:${(y1/1920*100).toFixed(3)}%;width:${((x2-x1)/1080*100).toFixed(3)}%;height:${((y2-y1)/1920*100).toFixed(3)}%`;
let active=null;
function stopAudio(m){
 if(!m)return;
 try{if(m.audio){m.audio.pause();m.audio.currentTime=0}}catch{}
 if(m.timer){clearInterval(m.timer);m.timer=null}
 m.audio=null;
 try{window.speechSynthesis?.cancel?.()}catch{}
 m.audioKey=null;m.host?.querySelectorAll?.('.spm-ed5-hit.playing').forEach(e=>e.classList.remove('playing'));
}
function stop(){let m=active;active=null;if(m){stopAudio(m);m.events?.abort?.()}}
function pause(){if(active)stopAudio(active)}
function message(m,txt){m.status=txt;const p=m.host.querySelector('[data-ed5-status]');if(p)p.textContent=txt||''}
function warn(m,txt){message(m,txt);window.SPM_ERECTION_TOUCH_VIEW?.warn(m.host,txt)}
function speakFallback(m,key){
 if(!m.valid()||m.audioKey!==key)return;
 if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=='function'){
  stopAudio(m);message(m,'No se pudo reproducir el audio. Puedes seguir la información de la pantalla.');return;
 }
 const u=new window.SpeechSynthesisUtterance(GUIDES[m.page]);u.lang='es-CO';u.rate=.95;
 const voices=window.speechSynthesis.getVoices?.()||[];
 u.voice=voices.find(v=>/^es-co$/i.test(v.lang)&&/female|mujer|paulina|sofia|helena|maria|monica/i.test(v.name))||voices.find(v=>/^es(?:-|$)/i.test(v.lang))||null;
 u.onend=()=>{if(m.audioKey===key)stopAudio(m)};u.onerror=()=>{if(m.audioKey===key)stopAudio(m)};
 try{window.speechSynthesis.speak(u)}catch{stopAudio(m);message(m,'No se pudo reproducir la guía.')}
}
function play(m){
 if(!m.valid()||m.saving)return;
 const key='guide-'+m.page;
 if(m.audioKey===key){stopAudio(m);return}
 stopAudio(m);m.audioKey=key;
 const btn=m.host.querySelector('[data-ed5-audio]');btn?.classList.add('playing');
 const [start,end]=AUDIO_SECTIONS[m.page-1];
 if(typeof window.Audio!=='function'){speakFallback(m,key);return}
 try{
  const audio=new window.Audio(AUDIO);m.audio=audio;audio.preload='auto';
  const finish=()=>{if(m.audioKey===key)stopAudio(m)};
  audio.onended=finish;audio.onerror=()=>{if(m.audioKey===key){m.audio=null;speakFallback(m,key)}};
  // iOS Safari exige iniciar audio.play() dentro del gesto táctil; no diferirlo a loadedmetadata.
  const align=()=>{if(m.audioKey!==key)return;try{if(Math.abs(audio.currentTime-start)>.25)audio.currentTime=start}catch{}};
  if(audio.readyState>=1)align();else{
   try{audio.currentTime=start}catch{}
   audio.addEventListener('loadedmetadata',align,{once:true});
  }
  const result=audio.play();result?.catch?.(()=>{if(m.audioKey===key){m.audio=null;speakFallback(m,key)}});
  m.timer=window.setInterval(()=>{if(m.audioKey!==key)return;if(audio.currentTime>=end-0.08)finish()},100);
 }catch{m.audio=null;speakFallback(m,key)}
}
function hotspot(coords,action,label,{value=null,selected=false,audio=false,disabled=false}={}){
 return `<button type="button" class="spm-ed5-hit${selected?' selected':''}${audio?' audio':''}" style="${rect(...coords)}" data-ed5-action="${esc(action)}"${value!==null?` data-value="${esc(value)}" aria-pressed="${selected?'true':'false'}"`:''}${audio?' data-ed5-audio="true"':''}${disabled?' disabled':''} aria-label="${esc(label)}"></button>`;
}
function check(x,y){return `<span class="spm-ed5-check" aria-hidden="true" style="${rect(x-22,y-22,x+22,y+22)}">✓</span>`}
function optionsUI(rows,values,action,multi){let hits='',marks='';rows.forEach(([value,label,coords,center])=>{const on=multi?values.includes(value):values===value;hits+=hotspot(coords,action,(on?'Desmarcar ':'Seleccionar ')+label,{value,selected:on});if(on)marks+=check(...center)});return {hits,marks}}
function render(m){
 if(!m.host?.isConnected)return;
 let hits=hotspot([230,380,850,464],'audio',m.page===3?'Escuchar práctica':'Escuchar guía',{audio:true}),marks='';
 if(m.page===1){const o=optionsUI(FAC,m.facilitators,'fac',true);hits+=o.hits;marks+=o.marks;}
 else if(m.page===2){const o=optionsUI(INHIB,m.inhibitors,'inhib',true);hits+=o.hits;marks+=o.marks;}
 else{const o=optionsUI(ADJUST,m.adjustment,'adjust',false);hits+=o.hits;marks+=o.marks;}
 hits+=hotspot([40,1741,1040,1876],m.page===3?'save':'next',m.page===3?'Guardar y continuar mi ruta de hoy':'Continuar',{disabled:m.saving});
 // The source artwork says Día 5: correct the visible badge without altering any source pixels.
 const dayLabel=`<span class="spm-ed5-calendar-label" style="${rect(822,49,954,96)}" aria-hidden="true">Día ${m.calendarDay}</span>`;
 const toolbar=`<nav class="spm-ed5-toolbar" aria-label="Navegación de Erección y firmeza"><button type="button" data-ed5-action="back">${m.page===1?'← Volver a Hoy':'← Anterior'}</button><span>${m.page} de 3 · Día ${m.calendarDay}</span><button type="button" data-ed5-action="exit">Salir a Hoy</button></nav>`;
 m.host.innerHTML=`<section class="spm-ed5-session spm-er-fullscreen" data-ed5-session data-screen="${m.page}" aria-label="Día ${m.calendarDay}, pantalla ${m.page} de tres"><div class="spm-ed5-artwork" role="group" aria-label="Pantalla original aprobada ${m.page} de 3" style="background-image:url(&quot;${esc(IMAGES[m.page-1])}&quot;)">${hits}${marks}${dayLabel}</div>${toolbar}<p role="status" aria-live="polite" class="spm-ed5-status" data-ed5-status>${esc(m.status)}</p></section>`;
}
function setSelection(m,key){
 if(m.page===1){
  if(!FAC.some(row=>row[0]===key))return;
  if(key==='unknown')m.facilitators=m.facilitators.includes('unknown')?[]:['unknown'];
  else if(m.facilitators.includes(key))m.facilitators=m.facilitators.filter(v=>v!==key);
  else if(m.facilitators.filter(v=>v!=='unknown').length>=3){warn(m,'Marca máximo tres facilitadores.');return}
  else m.facilitators=[...m.facilitators.filter(v=>v!=='unknown'),key];
 }else if(m.page===2){
  if(!INHIB.some(row=>row[0]===key))return;
  if(key==='unknown')m.inhibitors=m.inhibitors.includes('unknown')?[]:['unknown'];
  else if(m.inhibitors.includes(key))m.inhibitors=m.inhibitors.filter(v=>v!==key);
  else if(m.inhibitors.filter(v=>v!=='unknown').length>=2){warn(m,'Marca máximo dos obstáculos.');return}
  else m.inhibitors=[...m.inhibitors.filter(v=>v!=='unknown'),key];
 }else if(m.page===3){if(!ADJUST.some(row=>row[0]===key))return;m.adjustment=key}
 stopAudio(m);m.status='';render(m);
}
function next(m){
 if(m.page===1&&!m.facilitators.length){warn(m,'Elige al menos una opción o «Aún no lo identifico».');return}
 if(m.page===2&&!m.inhibitors.length){warn(m,'Elige al menos una opción o «Aún no lo identifico».');return}
 stopAudio(m);m.page=Math.min(3,m.page+1);m.status='';render(m);window.SPM_ERECTION_TOUCH_VIEW?.resetScroll(m.host);
}
async function save(m){
 if(m.saving||!m.valid())return;
 if(!m.facilitators.length||!m.inhibitors.length||!m.adjustment){warn(m,'Completa tus tres elecciones antes de guardar.');return}
 stopAudio(m);
 const record={...m.prior,source:'erection-practice-v1',erectionPracticeVersion:1,day:m.calendarDay,erectionLesson:5,activity:'Reconoce lo que te ayuda',confirmed:true,anxiety:null,confidence:null,date:new Date().toISOString(),erectionFacilitators:m.facilitators.slice(),erectionInhibitors:m.inhibitors.slice(),microAdjustment:m.adjustment,lessonFormat:'three-approved-touch-screens'};
 m.saving=true;message(m,'Guardando tu mapa personal…');const button=m.host.querySelector('[data-ed5-action="save"]');if(button)button.disabled=true;
 try{const result=await m.save(record);if(result===false||result?.ok===false)throw Error('save-failed')}
 catch{m.saving=false;if(m.host.isConnected)message(m,'No fue posible guardar. Tus selecciones siguen aquí; vuelve a intentarlo.');if(button?.isConnected)button.disabled=false;return}
 const c=window.SPM_RESOURCE_CONTEXT?.();
 if(c&&(String(c.userId)+':'+String(c.planId)!==m.scope||Number(c.day)!==m.calendarDay))return;
 if(m.host.isConnected){try{m.onBack()}catch{window.SPM_DAILY_PRACTICE?.open?.()}}
}
function mount({host,prior={},valid=()=>true,save:onSave,onBack=()=>{},scope='',calendarDay=12}={}){
 if(!host||typeof onSave!=='function')return false;
 stop();const p=prior&&typeof prior==='object'&&!Array.isArray(prior)?prior:{};
 const normalize=(values,rows,max)=>Array.isArray(values)&&values.length<=max&&new Set(values).size===values.length&&values.every(v=>rows.some(row=>row[0]===v))&&(!values.includes('unknown')||values.length===1)?values.slice():[];
 const m={host,prior:{...p},valid,save:onSave,onBack,scope,calendarDay:Number(calendarDay),page:1,facilitators:normalize(p.erectionFacilitators,FAC,3),inhibitors:normalize(p.erectionInhibitors,INHIB,2),adjustment:ADJUST.some(row=>row[0]===p.microAdjustment)?p.microAdjustment:null,audio:null,audioKey:null,timer:null,saving:false,status:'',events:new AbortController()};
 active=m;render(m);
 host.addEventListener('click',e=>{
  if(active!==m||!m.valid()||m.saving)return;
  const b=e.target.closest('[data-ed5-action]');if(!b||b.disabled)return;
  const action=b.dataset.ed5Action,value=b.dataset.value;
  if(action==='audio'){play(m);return}
  if(action==='fac'||action==='inhib'||action==='adjust'){setSelection(m,value);return}
  if(action==='next'){next(m);return}
  if(action==='back'){if(m.page===1){stopAudio(m);m.onBack()}else{stopAudio(m);m.page--;m.status='';render(m)}return}
  if(action==='exit'){stopAudio(m);m.onBack();return}
  if(action==='save')void save(m);
 },{signal:m.events.signal});
 return true;
}
window.addEventListener('pagehide',stop);
window.SPM_ED_DAY5_TOUCH={mount,stop,pause,images:IMAGES.slice(),audioOriginal:AUDIO,fields:['erectionFacilitators','erectionInhibitors','microAdjustment'],guides:{...GUIDES}};
})();
