/* SPM Digital Wellness · Erección y firmeza · Sesión 6 · día 15.
 * La lámina premium aprobada es toda la pantalla. Se activan zonas táctiles
 * sin redibujar el contenido ni duplicar prácticas transversales.
 */
(()=>{'use strict';
if(window.SPM_ED_DAY6_TOUCH)return;
const IMAGE='/premium-v2/assets/erection-day6/spm-de-day6-screen-01.webp';
const AUDIO='/premium-v2/assets/audio/erection/erection-day15-stimuli-20261117.mp3';
const GUIDE='Hoy identificarás qué estímulos suelen favorecer tu excitación y tu respuesta sexual. Cada persona responde de manera diferente, y no necesitas provocar una erección ni medir su firmeza para completar esta actividad. Recuerda experiencias que ya hayas vivido y selecciona los estímulos que más te han ayudado: contacto físico, sonidos agradables, estímulos visuales, un ambiente cómodo, fantasías sexuales u otros. Puedes elegir varios. En una próxima experiencia, incorpora de forma consciente alguno de ellos, a tu ritmo, sin presionarte por conseguir una respuesta específica. Si compartes la experiencia con otra persona, acuerden lo que ambos disfrutan. Cuando estés listo, guarda tu selección y continúa con tu ruta de hoy.';
const OPTIONS=[
 {key:'contacto',label:'Contacto físico',box:[30,1086,421,1144],check:[72,1112],card:[32,753,230,980]},
 {key:'audio',label:'Estímulos auditivos',box:[442,1086,832,1144],check:[488,1112],card:[242,753,432,980]},
 {key:'visual',label:'Estímulos visuales',box:[30,1149,421,1203],check:[72,1174],card:[442,753,630,980]},
 {key:'ambiente',label:'Ambiente',box:[442,1149,832,1203],check:[488,1174]},
 {key:'fantasias',label:'Fantasías sexuales',box:[30,1207,421,1266],check:[72,1234],card:[640,753,832,980]},
 {key:'otros',label:'Otros',box:[442,1207,832,1266],check:[488,1234]}
];
const KEYS=OPTIONS.map(o=>o.key);
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rect=(a,b,c,d)=>'left:'+(a/864*100).toFixed(4)+'%;top:'+(b/1536*100).toFixed(4)+'%;width:'+((c-a)/864*100).toFixed(4)+'%;height:'+((d-b)/1536*100).toFixed(4)+'%';
let active=null;
function stopAudio(m){
 if(!m)return;
 try{m.audio?.pause?.();if(m.audio)m.audio.currentTime=0}catch{}
 m.audio=null;m.playing=false;
 try{window.speechSynthesis?.cancel?.()}catch{}
 m.voice=null;
 const b=m.host?.querySelector('[data-ed6-action="audio"]');
 b?.classList.remove('playing');b?.setAttribute('aria-pressed','false');
}
function stop(){const m=active;active=null;if(m){stopAudio(m);m.events?.abort?.()}}
function pause(){if(active)stopAudio(active)}
function message(m,text){m.note=text;const target=m.host?.querySelector('[data-ed6-status]');if(target)target.textContent=text||''}
function warn(m,text){message(m,text);window.SPM_ERECTION_TOUCH_VIEW?.warn(m.host,text)}
function speakFallback(m){
 if(!m.valid()||m.saving)return;
 if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=='function'){
  stopAudio(m);message(m,'No se pudo reproducir la guía. Puedes seguir las instrucciones escritas.');return;
 }
 try{
  const u=new window.SpeechSynthesisUtterance(GUIDE);
  m.voice=u;u.lang='es-CO';u.rate=.96;u.pitch=1;u.volume=1;
  const voices=window.speechSynthesis.getVoices?.()||[];
  u.voice=voices.find(v=>/^es-co$/i.test(v.lang)&&/female|mujer|sofia|paulina|maria|helena/i.test(v.name))||voices.find(v=>/^es-co$/i.test(v.lang))||voices.find(v=>/^es(?:-|$)/i.test(v.lang))||null;
  u.onend=()=>{if(m.voice===u){m.voice=null;m.playing=false;const b=m.host?.querySelector('[data-ed6-action="audio"]');b?.classList.remove('playing');b?.setAttribute('aria-pressed','false')}};
  u.onerror=()=>{if(m.voice===u){stopAudio(m);message(m,'No se pudo escuchar esta guía en el dispositivo.')}};
  window.speechSynthesis.speak(u);
 }catch{stopAudio(m);message(m,'No se pudo reproducir el audio.')}
}
function audio(m){
 if(!m.valid()||m.saving)return;
 if(m.playing){m.playing=false;stopAudio(m);return}
 stopAudio(m);m.playing=true;
 const b=m.host.querySelector('[data-ed6-action="audio"]');
 b?.classList.add('playing');b?.setAttribute('aria-pressed','true');
 if(typeof window.Audio!=='function'){speakFallback(m);return}
 try{
  const player=new window.Audio(AUDIO);m.audio=player;player.preload='auto';
  player.onended=()=>{if(m.audio===player){m.playing=false;stopAudio(m)}};
  player.onerror=()=>{if(m.audio===player){m.audio=null;speakFallback(m)}};
  const result=player.play();
  result?.catch?.(()=>{if(m.audio===player){m.audio=null;speakFallback(m)}});
 }catch{m.audio=null;speakFallback(m)}
}
function hotspot(coords,action,label,{value=null,selected=false,extra='',disabled=false,audio=false}={}){
 return '<button type="button" class="spm-ed6-hit'+(selected?' selected':'')+(audio?' audio':'')+(extra?' '+extra:'')+'" style="'+rect(...coords)+'" data-ed6-action="'+escapeHtml(action)+'"'+(value===null?'':' data-value="'+escapeHtml(value)+'" aria-pressed="'+selected+'"')+(audio?' aria-pressed="false"':'')+(disabled?' disabled':'')+' aria-label="'+escapeHtml(label)+'"></button>';
}
function mark(x,y,key,checked){
 return '<span class="spm-ed6-check" data-ed6-check="'+escapeHtml(key)+'"'+(checked?'':' hidden')+' aria-hidden="true" style="'+rect(x-12,y-12,x+12,y+12)+'">✓</span>';
}
function render(m){
 if(!m.host?.isConnected)return;
 let hits=hotspot([214,298,650,389],'audio','Escuchar guía completa del día 15',{audio:true});
 let marks='';
 for(const opt of OPTIONS){
  const checked=m.selected.includes(opt.key);
  hits+=hotspot(opt.box,'select','Elegir '+opt.label,{value:opt.key,selected:checked});
  if(opt.card)hits+=hotspot(opt.card,'select','Ejemplo: '+opt.label,{value:opt.key,selected:checked,extra:'art-card'});
  marks+=mark(...opt.check,opt.key,checked);
 }
 hits+=hotspot([30,1413,830,1524],'save','Guardar mi selección y continuar mi ruta de hoy',{disabled:m.saving});
 // La imagen original dice Día 6 / 1-3: solo se superponen etiquetas del calendario actual.
 const currentDay='<div class="spm-ed6-calendar-day" aria-hidden="true">Día '+m.calendarDay+'<small>Erección y firmeza</small></div><div class="spm-ed6-calendar-step" aria-hidden="true">1/1</div>';
 const toolbar='<nav class="spm-ed6-toolbar" aria-label="Navegación del Día '+m.calendarDay+'"><button type="button" data-ed6-action="back">← Volver a Hoy</button><span>Día '+m.calendarDay+' · Actividad única</span><button type="button" data-ed6-action="exit">Salir a Hoy</button></nav>';
 m.host.innerHTML='<section class="spm-ed6-session spm-er-fullscreen" data-ed6-session data-screen="1" aria-label="Erección y firmeza día '+m.calendarDay+', estímulos que funcionan"><div class="spm-ed6-artwork" role="group" aria-label="Pantalla visual aprobada del Día '+m.calendarDay+'" style="background-image:url(&quot;'+IMAGE+'&quot;)">'+hits+marks+currentDay+'</div>'+toolbar+'<p class="spm-ed6-status" role="status" aria-live="polite" data-ed6-status>'+escapeHtml(m.note)+'</p></section>';
}
function refreshSelections(m){
 m.host.querySelectorAll('[data-ed6-action="select"]').forEach(btn=>{
  const chosen=m.selected.includes(btn.dataset.value);
  btn.classList.toggle('selected',chosen);btn.setAttribute('aria-pressed',String(chosen));
 });
 m.host.querySelectorAll('[data-ed6-check]').forEach(el=>{el.hidden=!m.selected.includes(el.dataset.ed6Check)});
}
async function save(m){
 if(m.saving||!m.valid())return;
 if(!m.selected.length){warn(m,'Selecciona por lo menos un estímulo que reconozcas antes de continuar.');return}
 stopAudio(m);m.playing=false;
 const record={...m.prior,source:'erection-practice-v1',erectionPracticeVersion:1,day:m.calendarDay,erectionLesson:6,activity:'Activa tu respuesta con estímulos que funcionan',confirmed:true,anxiety:null,confidence:null,date:new Date().toISOString(),erectionStimuli:m.selected.slice(),lessonFormat:'one-approved-touch-screen'};
 m.saving=true;message(m,'Guardando tu selección de hoy…');
 const b=m.host.querySelector('[data-ed6-action="save"]');if(b)b.disabled=true;
 try{const result=await m.save(record);if(result===false||result?.ok===false)throw Error('save-failed')}
 catch{m.saving=false;if(m.host.isConnected)message(m,'No fue posible guardar. Tus selecciones siguen aquí; vuelve a intentarlo.');if(b?.isConnected)b.disabled=false;return}
 const c=window.SPM_RESOURCE_CONTEXT?.();
 if(c&&(String(c.userId)+':'+String(c.planId)!==m.scope||Number(c.day)!==m.calendarDay))return;
 if(m.host.isConnected){try{m.onBack()}catch{window.SPM_DAILY_PRACTICE?.open?.()}}
}
function mount({host,prior={},valid=()=>true,save:onSave,onBack=()=>{},scope='',calendarDay=15}={}){
 if(!host||typeof onSave!=='function')return false;
 stop();const p=prior&&typeof prior==='object'&&!Array.isArray(prior)?prior:{};
 const choices=Array.isArray(p.erectionStimuli)?[...new Set(p.erectionStimuli.filter(x=>KEYS.includes(x)))]:[];
 const m={host,prior:{...p},valid,save:onSave,onBack,scope,calendarDay:Number(calendarDay),selected:choices,note:'',saving:false,audio:null,playing:false,voice:null,events:new AbortController()};
 active=m;render(m);
 host.addEventListener('click',ev=>{
  if(active!==m||!m.valid()||m.saving)return;
  const b=ev.target.closest('[data-ed6-action]');if(!b||b.disabled)return;
  const action=b.dataset.ed6Action,key=b.dataset.value;
  if(action==='audio'){audio(m);return}
  if(action==='select'){
   if(!KEYS.includes(key))return;
   if(m.selected.includes(key))m.selected=m.selected.filter(v=>v!==key);else m.selected.push(key);
   refreshSelections(m);message(m,m.selected.length+' estímulo'+(m.selected.length===1?'':'s')+' seleccionado'+(m.selected.length===1?'':'s')+'.');
   return;
  }
  if(action==='save'){void save(m);return}
  if(action==='back'||action==='exit'){stopAudio(m);m.playing=false;m.onBack()}
 },{signal:m.events.signal});
 return true;
}
window.addEventListener('pagehide',stop);
window.SPM_ED_DAY6_TOUCH={mount,pause,stop,images:[IMAGE],fields:['erectionStimuli'],options:KEYS.slice(),audioSrc:AUDIO,guide:GUIDE};
})();