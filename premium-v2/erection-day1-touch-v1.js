/* SPM Digital Wellness | Erección y firmeza | Día 1 | Seis pantallas táctiles.
 * Los originales aprobados SON las pantallas, no ilustraciones de formularios.
 * Se carga DESPUÉS de erection-practice-v1.js y ANTES de daily-practice-v1.js.
 * Alcance: únicamente c.primary === 'erection', día 1, actividad main.
 * Las imágenes deben existir en /premium-v2/assets/erection-day1 antes del despliegue.
 * AUDIO_FILES se mantiene vacío mientras las grabaciones MP3 no estén verificadas en SPM.
 */
(()=>{'use strict';
if(window.SPM_ERECTION_DAY1_TOUCH || !window.SPM_ERECTION_PRACTICE) return;
const original=window.SPM_ERECTION_PRACTICE;
const PATH='/premium-v2/assets/erection-day1/';
const IMAGES=Object.freeze([
 null,
 {file:'dia1-01.webp',w:1098,h:1875},
 {file:'dia1-02.webp',w:1200,h:1875},
 {file:'dia1-03.webp',w:1215,h:1875},
 {file:'dia1-04.webp',w:1221,h:1980},
 {file:'dia1-05.webp',w:1170,h:1980},
 {file:'dia1-06.webp',w:1024,h:1536}
]);
const AUDIO_FILES=Object.freeze({}); // Añadir SOLO MP3 auditados y alojados por SPM.
const spoken=Object.freeze({
 1:'Bienvenido a Erección y firmeza. Hoy vamos a reconocer tu punto de partida y practicar una habilidad sencilla. No tienes que demostrar nada.',
 2:'Recuerda una experiencia reciente, sin intentar provocar una erección nueva. Elige el nivel de cero a cuatro que mejor la describa. Cero significa sin respuesta; no evaluable significa que no hubo una experiencia que pudieras valorar. Si tienes dudas, toca Ver guía EHS para consultar la lámina médica de SPM.',
 3:'Conocer tu punto de partida te ayuda a observar tu progreso sin compararte. Comprender tu respuesta y bajar la presión por rendir es parte del entrenamiento.',
 4:'Busca un momento tranquilo y privado. Si te resulta cómodo, elige un estímulo erótico voluntario, como un recuerdo, una fantasía o un contacto suave. Mantén la atención en las sensaciones y no busques una rigidez específica. Si surge la preocupación por el rendimiento, vuelve con suavidad a lo que sientes. Practica a tu ritmo, unos minutos si lo deseas. Si aparece incomodidad, detén la práctica.',
 5:'¿Cómo fue tu práctica? Elige la opción que mejor describa tu experiencia. Si hoy preferiste no realizarla, puedes volver a tus actividades; no quedará registrada como completada.',
 6:'Práctica registrada. Hoy reconociste tu punto de partida y entrenaste la atención sin exigirte una respuesta determinada. Continúa con las demás actividades de hoy; mañana seguirás con el día dos.'
});
const FEEDBACK=['attention','returned','difficult','not_done'];
const LABELS={
 0:'Sin respuesta eréctil',1:'Aumento de tamaño sin erección',2:'Rigidez insuficiente',3:'Firmeza suficiente para penetración',4:'Erección completa',na:'No evaluable'
};
const esc=t=>String(t??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const scopeOf=c=>c&&c.userId&&c.planId?String(c.userId)+':'+String(c.planId):'';
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
let session=null, activeAudio=null, speaker=null, voiceId=0;
const coords=(x,y,w,h)=>`left:${x}%;top:${y}%;width:${w}%;height:${h}%`;
const a11y=(name,kind,value,box,extra='')=>({name,kind,value,box,extra});
const hitZones={
 1:[a11y('Comenzar el día 1','next',null,[7.2,86.8,86,10.6],'glow')],
 2:[
  ...[0,1,2,3,4].map((n,i)=>a11y('Seleccionar nivel '+n+': '+LABELS[n],'level',n,[3.5+i*18.9,25.5,18.3,25.9],String(n) )),
  a11y('Seleccionar No evaluable','level','na',[3.5,53.8,93,10.6]),
  a11y('Ver lámina EHS médica existente','ehs',null,[43.2,74.2,53.2,7.6],'glow'),
  a11y('Información sobre la escala','ehs',null,[89.6,22.4,9.6,5.7]),
  a11y('Continuar','next',null,[7.2,86.5,86.5,10.4],'glow')
 ],
 3:[a11y('Continuar','next',null,[10.0,86.8,82.3,10.4],'glow')],
 4:[a11y('Escuchar o detener la guía','audio',null,[4.1,30.9,50.6,13.5],'glow'),a11y('Realizar práctica y registrar experiencia','next',null,[4.5,88.9,91.2,9.3],'glow')],
 5:[
  ...FEEDBACK.map((k,i)=>a11y(['Pude mantener la atención','Comprobé y volví al estímulo','Me costó dejar de comprobar','Preferí no realizar la práctica'][i],'feedback',k,[5.4,[29.4,41.0,52.6,64.0][i],89.8,10.0])),
  a11y('Continuar y registrar práctica','save',null,[6.7,88.0,86.6,9.5],'glow')
 ],
 6:[a11y('Continuar mi ruta de hoy','finish',null,[3.8,85.2,92.2,11.6],'glow')]
};
function styles(){if(document.getElementById('spmErectionDay1TouchStyle'))return;
 const el=document.createElement('style');el.id='spmErectionDay1TouchStyle';el.textContent=`
.spm-e1-modal{border:0;padding:0;background:transparent;color:#fff;box-sizing:border-box;max-width:none;max-height:100dvh;overflow:visible;position:fixed;inset:0;margin:auto;width:fit-content;height:fit-content;font-family:system-ui,-apple-system,'Segoe UI',sans-serif}
.spm-e1-modal::backdrop{background:radial-gradient(ellipse at 50% 42%,#15537ba6 0%,#021829f3 90%);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.spm-e1-stage{position:relative;isolation:isolate;width:min(calc(100vw - 12px),540px);aspect-ratio:var(--iw)/var(--ih);overflow:hidden;border-radius:clamp(12px,2.5vw,22px);background:linear-gradient(160deg,#0b2741,#77c0e3);box-shadow:0 20px 60px #000b,0 0 0 1px #b8d7ec8c}
.spm-e1-stage img{display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;image-rendering:auto;pointer-events:none;user-select:none;-webkit-user-drag:none}
.spm-e1-hot{position:absolute;z-index:2;display:block;appearance:none;-webkit-appearance:none;box-sizing:border-box;border:2px solid transparent;border-radius:clamp(8px,2.5vw,32px);background:transparent;color:transparent;cursor:pointer;touch-action:manipulation;outline-offset:2px;transition:box-shadow .16s ease,background-color .16s ease,border-color .16s ease;overflow:hidden;font-size:0}
.spm-e1-hot::after{content:'';position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 0 transparent;pointer-events:none}
.spm-e1-hot.glow{animation:spm-e1-halo 2.7s ease-in-out infinite}
.spm-e1-hot:hover,.spm-e1-hot:focus-visible{border-color:#ffda86;box-shadow:0 0 0 2px #e4a83a99,0 0 22px 7px #ffdf855a,inset 0 0 13px #ffd58048}
.spm-e1-hot:focus-visible{outline:3px solid #fff4cc}
.spm-e1-hot[data-kind='level']:not(.is-selected),.spm-e1-hot[data-kind='feedback']:not(.is-selected){animation:none}
.spm-e1-hot.is-selected{border-color:#ffe09c;box-shadow:0 0 0 3px #d99f3caa,0 0 22px 8px #fbd47e91,inset 0 0 12px #fff5ce77;background:rgba(241,203,120,.06);animation:none!important}
.spm-e1-hot[data-kind='level'][data-value='4']:not(.is-selected){backdrop-filter:saturate(.65);-webkit-backdrop-filter:saturate(.65);background:rgba(20,82,125,.06)}
.spm-e1-back{position:absolute;z-index:6;top:-45px;left:12px;display:grid;place-items:center;width:clamp(34px,9%,48px);aspect-ratio:1;border:1.5px solid #f3d28aab;border-radius:999px;background:linear-gradient(140deg,#0c385ccf,#195e86dd);color:white;font-size:clamp(16px,4.5vw,23px);font-weight:800;box-shadow:0 0 15px #79c4ef5c;cursor:pointer;touch-action:manipulation}
.spm-e1-back:hover,.spm-e1-back:focus-visible{outline:2px solid #ffe7ab;box-shadow:0 0 20px 4px #ffe7ab66}
.spm-e1-speaker{position:absolute;z-index:6;right:12px;top:-45px;display:grid;place-items:center;width:clamp(35px,9%,48px);aspect-ratio:1;border:1.5px solid #ffe2a8;border-radius:50%;background:linear-gradient(140deg,#0e3c62e0,#13628fcc);color:#fff;font-size:clamp(16px,4vw,21px);box-shadow:0 0 14px 2px #dfeafe7a;cursor:pointer;touch-action:manipulation}
.spm-e1-speaker[aria-pressed=true]{background:#eec475;color:#082742;box-shadow:0 0 25px 7px #fbd47e80}
.spm-e1-status{position:fixed;z-index:9;left:50%;bottom:max(14px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(88vw,500px);box-sizing:border-box;padding:12px 18px;border:1px solid #f1d69d;border-radius:16px;background:#08273df5;color:#fff7dc;font-size:15px;line-height:1.4;text-align:center;box-shadow:0 8px 25px #0009}
.spm-e1-status[hidden]{display:none!important}
.spm-e1-loading{position:absolute;inset:0;z-index:5;display:grid;place-items:center;text-align:center;padding:30px;color:#fff;background:linear-gradient(135deg,#092b45,#154968);font-size:18px;font-weight:700}
@keyframes spm-e1-halo{0%,100%{box-shadow:0 0 0 1px #e3b65c30,0 0 12px 1px #ffeccf17}50%{box-shadow:0 0 0 2px #fbe2a385,0 0 24px 6px #ffe0a05d}}
.spm-e1-modal.spm-e1-tight .spm-e1-back,.spm-e1-modal.spm-e1-tight .spm-e1-speaker{top:4px;width:34px;opacity:.88}
@media(prefers-reduced-motion:reduce){.spm-e1-modal *{animation:none!important;transition:none!important}}
@media(max-width:420px){.spm-e1-stage{border-radius:12px}.spm-e1-hot{border-width:1.5px}.spm-e1-back{left:10px}}
`;document.head.appendChild(el);
}
function textFor(page){return spoken[page]||'';}
function stopAudio(){voiceId++;try{activeAudio?.pause();activeAudio=null;}catch(_){}try{window.speechSynthesis?.cancel();}catch(_){}speaker=null;try{session?.dialog?.querySelector('.spm-e1-speaker')?.setAttribute('aria-pressed','false');}catch(_){}}
function playAudio(page){const s=session;if(!s||s.page!==page)return false;
 if(speaker===page){stopAudio();return true;}
 stopAudio();const version=voiceId;let target=s.dialog.querySelector('.spm-e1-speaker');if(target)target.setAttribute('aria-pressed','true');speaker=page;
 const url=AUDIO_FILES[page];if(url){let audio=new Audio(url);activeAudio=audio;audio.onended=()=>{if(version===voiceId)stopAudio();};audio.onerror=()=>{if(version===voiceId){stopAudio();speak(page);}};audio.play().catch(()=>{if(version===voiceId){stopAudio();speak(page);}});return true;}
 return speak(page);
}
function speak(page){const t=textFor(page);if(!t||!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance){notice('El audio no está disponible en este dispositivo. Las indicaciones permanecen en la pantalla.');return false;}
 const thisId=voiceId,u=new SpeechSynthesisUtterance(t);u.lang='es-CO';u.rate=.95;u.pitch=1;const voices=window.speechSynthesis.getVoices?.()||[];
 const spanish=voices.filter(v=>/^es([-_]|$)/i.test(v.lang));u.voice=spanish.find(v=>/es[-_]CO/i.test(v.lang))||spanish.find(v=>/monica|paulina|luciana|sofia|female/i.test(v.name))||spanish[0]||null;
 u.onend=u.onerror=()=>{if(thisId===voiceId)stopAudio();};try{window.speechSynthesis.speak(u);speaker=page;return true;}catch(_){stopAudio();notice('No se pudo reproducir el audio.');return false;}
}
function notice(message){const s=session;if(!s?.dialog)return;let el=s.dialog.querySelector('[data-spm-e1-status]');if(!el)return;el.textContent=message||'';el.hidden=!message;}
function matching(s){const c=ctx(),a=window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(x=>x.id==='main');return session===s&&!!s.dialog?.isConnected&&scopeOf(c)===s.scope&&Number(c.day)===1&&c.primary==='erection'&&a?.kind==='erection'&&window.SPM_DAILY_PRACTICE?.restricted?.(c,'main')===false;}
function dispose(skipFocus){const s=session;if(!s)return;session=null;stopAudio();try{s.dialog?.close();}catch(_){}s.dialog?.remove();if(!skipFocus&&s.previous?.isConnected)s.previous.focus({preventScroll:true});}
function back(){const s=session;if(!s||s.saving)return;stopAudio();if(s.page<=1||s.page===6){dispose();window.SPM_DAILY_PRACTICE?.open?.({focus:true});}else show(s.page-1);}
function getCurrentImage(page){return IMAGES[page];}
function fitStage(s){const im=getCurrentImage(s?.page);if(!im||!s?.dialog)return;const stage=s.dialog.querySelector('.spm-e1-stage');if(!stage)return;const target=Math.min(window.innerWidth-12,540,(window.innerHeight-18)*im.w/im.h);stage.style.width=Math.max(240,Math.floor(target))+'px';s.dialog.classList.toggle('spm-e1-tight',(window.innerHeight-(target*im.h/im.w))/2<52);}
function goNext(){const s=session;if(!s||s.saving||!matching(s))return;
 if(s.page===2&&s.ehs===undefined){notice('Selecciona un nivel de 0 a 4 o «No evaluable».');return;}
 if(s.page===4)s.practiced=true;
 if(s.page===5){save();return;}
 if(s.page>=6){dispose();window.SPM_DAILY_PRACTICE?.open?.({focus:true});return;}
 show(s.page+1);
}
function openEHS(button){stopAudio();if(window.SPM_FIRMNESS_GUIDE?.open){window.SPM_FIRMNESS_GUIDE.open(button);return;}
 const file=window.SPM_FIRMNESS_GUIDE?.src||'/premium-v2/assets/images/erection/response-firmness-spm-20261113.jpg';
 let overlay=document.createElement('dialog');overlay.style.cssText='padding:14px;background:#092439;color:white;border:1px solid #e3c47d;border-radius:16px;max-width:96vw;max-height:96dvh;overflow:auto';
 const close=document.createElement('button');close.textContent='Cerrar lámina';close.type='button';close.style.cssText='font:inherit;padding:12px;border-radius:9px';close.onclick=()=>overlay.close();let img=document.createElement('img');img.src=file;img.alt='Lámina EHS educativa existente de SPM';img.style.cssText='display:block;max-width:100%;max-height:80dvh;object-fit:contain';overlay.append(close,img);document.body.appendChild(overlay);overlay.addEventListener('close',()=>overlay.remove(),{once:true});overlay.showModal();
}
function select(kind,value){const s=session;if(!s||s.saving)return;
 if(kind==='level')s.ehs=value;
 if(kind==='feedback')s.feedback=value;
 notice('');updateSelected();}
function updateSelected(){const s=session;if(!s)return;s.dialog.querySelectorAll('.spm-e1-hot[data-kind="level"],.spm-e1-hot[data-kind="feedback"]').forEach(b=>{let choice=b.dataset.kind==='level'?s.ehs:s.feedback;let active=String(choice)===b.dataset.value;b.classList.toggle('is-selected',active);b.setAttribute('aria-pressed',String(active));});}
function buttonFor(entry){const b=document.createElement('button');b.type='button';b.className='spm-e1-hot'+(entry.extra==='glow'?' glow':'');b.style.cssText=coords(...entry.box);b.setAttribute('aria-label',entry.name);b.dataset.kind=entry.kind;if(entry.value!==null)b.dataset.value=String(entry.value);b.title=entry.name;
 if(entry.kind==='level'||entry.kind==='feedback'){b.setAttribute('aria-pressed','false');b.onclick=()=>select(entry.kind,entry.value);}
 else if(entry.kind==='ehs'){b.onclick=()=>openEHS(b);}
 else if(entry.kind==='audio'){b.onclick=()=>playAudio(session?.page);}
 else b.onclick=()=>{if(entry.kind==='finish'){dispose();window.SPM_DAILY_PRACTICE?.open?.({focus:true});}else goNext();};
 return b;}
function show(page){const s=session;if(!s)return;stopAudio();s.page=page;const im=getCurrentImage(page),d=s.dialog;
 d.querySelectorAll('.spm-e1-back,.spm-e1-speaker').forEach(x=>x.remove());const stage=d.querySelector('.spm-e1-stage');fitStage(s);stage.style.setProperty('--ratio',(im.w/im.h).toString());stage.style.setProperty('--iw',im.w);stage.style.setProperty('--ih',im.h);stage.replaceChildren();
 const pic=document.createElement('img');pic.src=PATH+im.file;pic.width=im.w;pic.height=im.h;pic.alt='SPM · Erección y firmeza · día 1 · pantalla '+page+' de 6';pic.loading='eager';pic.decoding='async';stage.appendChild(pic);
 pic.onerror=()=>{if(session!==s||s.page!==page)return;stage.querySelectorAll('.spm-e1-hot').forEach(x=>x.disabled=true);const err=document.createElement('div');err.className='spm-e1-loading';err.textContent='La pantalla aprobada todavía no está alojada en SPM. No se ha modificado tu programa.';stage.appendChild(err);};
 (hitZones[page]||[]).forEach(zone=>stage.appendChild(buttonFor(zone)));
 if(page>1){let prev=document.createElement('button');prev.type='button';prev.className='spm-e1-back';prev.textContent='‹';prev.title='Pantalla anterior';prev.setAttribute('aria-label','Pantalla anterior');prev.onclick=back;d.appendChild(prev);}
 if(page!==4){let voice=document.createElement('button');voice.type='button';voice.className='spm-e1-speaker';voice.textContent='🔊';voice.title='Escuchar indicaciones';voice.setAttribute('aria-label','Escuchar indicaciones de la pantalla '+page);voice.setAttribute('aria-pressed','false');voice.onclick=()=>playAudio(page);d.appendChild(voice);}
 notice('');updateSelected();const first=stage.querySelector('.spm-e1-hot[data-kind="level"],.spm-e1-hot.glow');if(first)first.focus({preventScroll:true});
}
async function save(){const s=session;if(!s||s.saving||!matching(s))return;
 if(s.ehs===undefined){show(2);notice('Elige tu nivel de firmeza o No evaluable.');return;}
 if(!s.feedback){notice('Selecciona cómo fue tu práctica.');return;}
 if(s.feedback==='not_done'){notice('Hoy no se registra como completada una práctica que no realizaste. Puedes volver a Hoy y retomarla después.');setTimeout(()=>{if(session===s&&!s.saving){dispose();window.SPM_DAILY_PRACTICE?.open?.({focus:true});}},1600);return;}
 if(!s.practiced){notice('Realiza primero la práctica guiada antes de guardarla.');show(4);return;}
 s.saving=true;notice('Guardando tu práctica en el programa…');stopAudio();
 const record={...s.prior,source:'erection-practice-v1',erectionPracticeVersion:1,day:1,activity:'Reconoce tu punto de partida',confirmed:true,anxiety:null,confidence:null,ehs:s.ehs==='na'?null:s.ehs,ehsEvaluable:s.ehs!=='na',practiceExperience:s.feedback,date:new Date().toISOString()};
 try{
  if(!original.valid(record,1)||!matching(s))throw Error('Registro inválido o sesión cambiada');
  await window.SPM_DAILY_PRACTICE.saveActivity('main',record,s.scope,1);
  if(session!==s)return;
  s.saved=true;s.saving=false;show(6);
 }catch(err){if(session!==s)return;s.saving=false;show(5);notice('No se pudo guardar. Tu selección sigue aquí y el día no ha avanzado. Reintenta.');}
}
async function open(activity){const c=ctx(),api=window.SPM_DAILY_PRACTICE;const actual=api?.assignments?.(c)?.find(a=>a.id==='main');
 if(!c||Number(c.day)!==1||c.primary!=='erection'||activity?.kind!=='erection'||activity?.id!=='main'||actual?.kind!=='erection')return original.open(activity);
 if(api.restricted?.(c,'main')!==false)return false;
 const captured=scopeOf(c),host=document.getElementById('spmDailyWorkspace');if(!captured||!host?.isConnected)return false;
 dispose(true);original.stop?.();styles();let s={page:1,scope:captured,dialog:null,previous:document.activeElement,ehs:undefined,feedback:null,practiced:false,prior:{},saving:false,saved:false};session=s;
 const dialog=document.createElement('dialog');dialog.className='spm-e1-modal';dialog.setAttribute('aria-label','Erección y firmeza, día 1, pantalla interactiva');dialog.innerHTML='<div class="spm-e1-stage"></div><p class="spm-e1-status" data-spm-e1-status role="status" aria-live="polite" hidden></p>';s.dialog=dialog;document.body.appendChild(dialog);dialog.showModal();
 dialog.addEventListener('cancel',ev=>{ev.preventDefault();if(!s.saving)back();});
 dialog.addEventListener('close',()=>{if(session===s)dispose(true);});
 dialog.addEventListener('keydown',ev=>{if(ev.key==='ArrowLeft'&&ev.altKey){ev.preventDefault();back();}});
 const stage=dialog.querySelector('.spm-e1-stage');stage.style.setProperty('--ratio',String(1098/1875));stage.style.setProperty('--iw','1098');stage.style.setProperty('--ih','1875');
 stage.innerHTML='<div class="spm-e1-loading" aria-busy="true">Recuperando tu práctica…</div>';
 try{const rows=await window.SPM_DAILY_RECORDS.read(captured,1);if(session!==s||!matching(s))return false;
  const prior=rows?.main;s.prior=prior&&typeof prior==='object'&&!Array.isArray(prior)?{...prior}:{};
  if(prior?.erectionPracticeVersion===1){if(prior.ehsEvaluable===false&&prior.ehs===null)s.ehs='na';else if(prior.ehsEvaluable===true&&Number.isInteger(prior.ehs)&&prior.ehs>=0&&prior.ehs<=4)s.ehs=prior.ehs;}
  show(1);return true;
 }catch(_){if(session!==s)return false;stage.innerHTML='<div class="spm-e1-loading">No pudimos recuperar tu práctica. <button type="button" style="padding:12px;border-radius:12px;font:inherit" data-retry>Reintentar</button></div>';stage.querySelector('[data-retry]').onclick=()=>{dispose(true);open(activity);};return false;}
}
function stop(){const s=session;stopAudio();if(s?.saving){ // saveActivity devuelve Hoy; mantener únicamente la pantalla 6 hasta confirmar el guardado.
  return;
 }dispose(true);original.stop?.();}
function pause(){stopAudio();original.pause?.();}
window.addEventListener('spm:session-change',()=>{const s=session;if(s&&scopeOf(ctx())!==s.scope)dispose(true);});
window.addEventListener('spm:resourcecontext',()=>{const s=session;if(s&&scopeOf(ctx())!==s.scope)dispose(true);});
window.addEventListener('resize',()=>{if(session)fitStage(session);});
window.addEventListener('pagehide',()=>{dispose(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio();});
window.SPM_ERECTION_PRACTICE={...original,open,stop,pause};
window.SPM_ERECTION_DAY1_TOUCH=Object.freeze({version:'1.0',images:IMAGES,open,close:()=>dispose(),audioStatus:'browser-tts-provisional',get active(){return session?.page||null;}});
})();