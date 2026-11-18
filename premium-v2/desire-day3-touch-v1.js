/* SPM Digital Wellness — Deseo Día 3: tres pantallas originales, cronómetro real de 5 minutos.
 * Preserva imágenes 9:16 sin rediseñarlas. Las áreas táctiles se colocan sobre cada barra.
 * La visualización respiratoria es relajación/conciencia corporal, NO fuerza de piso pélvico.
 * La actividad clínica sigue siendo breath-routine, sin crear sesiones transversales duplicadas.
 */
(()=>{
 'use strict';
 if(window.SPM_DESIRE_DAY3_TOUCH)return;
 const DAY=3, NOTE_KEY='desireDay3TouchV1', DURATION=300;
 const IMAGES=[1,2,3].map(n=>`/premium-v2/assets/desire-day3/screen-0${n}.jpg`);
 const CONNECTIONS=[
  {id:'embrace',label:'Abrazo o contacto tranquilo',speech:'Un abrazo o un contacto tranquilo que ambos deseen puede despertar confianza. Percibe la calidez y la tranquilidad, sin convertirlo en una exigencia.'},
  {id:'conversation',label:'Conversación sin distracciones',speech:'Una conversación sin distracciones permite mirar, escuchar y sentir cercanía. No hace falta demostrar deseo ni buscar un resultado inmediato.'},
  {id:'caresses',label:'Caricias suaves sin exigencia',speech:'Una caricia suave y acordada puede ser agradable por sí misma. Presta atención al roce de la piel y al bienestar compartido, sin acelerar el momento.'},
  {id:'trust',label:'Sentirme acompañado y en confianza',speech:'Sentirte acompañado y en confianza significa poder expresar lo que te gusta y también tus límites. La intimidad puede empezar por esa seguridad.'}
 ];
 const ACTIONS=[
  {id:'hug',label:'Tomarnos unos minutos para abrazarnos',speech:'Propón un abrazo cómodo y sin prisa, si ambos lo desean. Percibe la cercanía y recuerda que no tiene que llevar a una actividad sexual.'},
  {id:'talk',label:'Hablar y escucharnos con calma',speech:'Dedica un momento a conversar sin interrupciones. Comparte algo que disfrutas y escucha a tu pareja con atención y sin expectativas.'},
  {id:'touch',label:'Explorar caricias suaves sin presión',speech:'Si ambos quieren, exploren una caricia suave en los brazos, la espalda o el rostro. Ajusten el ritmo a la comodidad de ambos.'},
  {id:'solo',label:'Si estoy solo, conectar conmigo con una experiencia agradable',speech:'Si estás solo, puedes disfrutar de un momento privado, notar una sensación agradable o recordar una experiencia placentera sin evaluarte ni comprobar tu respuesta.'}
 ];
 const GUIDE={
  1:'Hoy vas a reconocer qué tipo de cercanía te ayuda a conectar. Puede ser un abrazo, una conversación sin distracciones, caricias suaves o sentir confianza y compañía. Observa qué opción se parece más a tu experiencia, toca la barra correspondiente y luego pulsa Continuar. No necesitas provocar deseo para responder.',
  2:'Elige ahora qué quieres intentar: abrazarse, hablar con calma, explorar caricias suaves o, si estás solo, conectar contigo mediante una experiencia agradable. El contacto con otra persona siempre requiere acuerdo y comodidad mutua. Toca la barra que prefieras para escuchar su indicación y pulsa Guardar y continuar; después harás la práctica guiada de respiración.',
  3:'Esta práctica dura cinco minutos. Primero, reconoce cualquier exigencia y vuelve tu atención al cuerpo. Después afloja hombros y mandíbula y respira con naturalidad, soltando el aire sin forzarlo. Observa cómo el abdomen y el piso pélvico acompañan suavemente el movimiento, sin apretar los músculos. Por último, elige una sensación cómoda y vuelve a ella cuando te distraigas. Pulsa Iniciar práctica o el botón de reproducción del reloj. Puedes pausar, reanudar y reiniciar el cronómetro. Si necesitas terminar antes, también puedes hacerlo y registrar el tiempo real.'
 };
 const PHASES=[
  {title:'Soltar presión',audio:'Primera parte: soltar presión. Si notas una expectativa, reconócela sin juzgarte y vuelve a cómo se siente tu cuerpo. Busca una postura cómoda.'},
  {title:'Respirar cómodo',audio:'Segunda parte: respirar cómodo. Afloja hombros y mandíbula. Permite que el aire entre y salga sin forzarlo. El abdomen y el piso pélvico se mueven de forma suave y coordinada, sin hacer una contracción de fuerza.'},
  {title:'Elegir conexión',audio:'Tercera parte: elegir conexión. Percibe el apoyo del cuerpo, el contacto de tus manos o una sensación que te resulte agradable. Puedes compartir cercanía si ambos lo desean. Vuelve a esa sensación cuando te distraigas.'}
 ];
 const normal=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const box=(x,y,w,h)=>`left:${(x/864*100).toFixed(4)}%;top:${(y/1536*100).toFixed(4)}%;width:${(w/864*100).toFixed(4)}%;height:${(h/1536*100).toFixed(4)}%;`;
 const option=(items,id)=>items.find(t=>t.id===id)||null;
 const time=v=>`${String(Math.floor(Math.max(0,v)/60)).padStart(2,'0')}:${String(Math.max(0,v)%60).padStart(2,'0')}`;
 const score=v=>(v===null||v===undefined||v===''||v==='na')?null:(Number.isInteger(Number(v))&&Number(v)>=0&&Number(v)<=10?Number(v):null);
 const hit=(x,y,w,h,action,value,label,pressed)=>`<button type="button" class="spm-ds3-hit spm-ds3-hit--${esc(action)}" style="${box(x,y,w,h)}" data-ds3-action="${esc(action)}" data-ds3-value="${esc(value)}" aria-label="${esc(label)}"${pressed===undefined?'':` aria-pressed="${pressed?'true':'false'}"`}></button>`;
 const mark=(cx,cy)=>`<span class="spm-ds3-check" aria-hidden="true" style="${box(cx-13,cy-15,26,30)}">✓</span>`;
 let active=null;
 function hotspots(m){
  let html='';const p=m.page;
  if(p===1||p===2){
   const items=p===1?CONNECTIONS:ACTIONS,ys=p===1?[[776,875],[888,994],[1001,1109],[1119,1233]]:[[758,866],[877,987],[998,1107],[1115,1244]];
   html+=p===1?hit(36,535,371,86,'audio','guide','Escuchar guía de conexión'):hit(35,530,407,84,'audio','guide','Escuchar práctica de cercanía');
   items.forEach((row,i)=>{const [top,bottom]=ys[i],chosen=(p===1?m.connection:m.action)===row.id;
    html+=hit(43,top,780,bottom-top,'choose',row.id,'Seleccionar '+row.label,chosen);
    if(chosen)html+=mark(p===1?771:764,(top+bottom)/2);
   });
   html+=hit(26,1400,810,112,'next','forward',p===1?'Continuar':'Guardar y continuar');
  }else{
   html+=hit(168,301,528,78,'audio','guide','Escuchar instrucciones de práctica de cinco minutos');
   html+=hit(473,668,76,80,'timer','reset','Reiniciar el cronómetro de cinco minutos');
   html+=hit(563,667,82,85,'timer','play','Iniciar o reanudar el cronómetro');
   html+=hit(651,667,77,80,'timer','pause','Pausar el cronómetro');
   html+=hit(27,855,263,384,'phase','0','Escuchar Soltar presión');
   html+=hit(304,855,256,384,'phase','1','Escuchar Respirar cómodo');
   html+=hit(577,855,261,384,'phase','2','Escuchar Elegir conexión');
   html+=hit(86,1278,692,125,'timer','play','Iniciar la práctica de cinco minutos');
  }
  return html;
 }
 function breatheVisual(m){
  const remaining=m.timer.remaining,progress=((DURATION-remaining)/DURATION*100).toFixed(2),running=m.timer.running;
  return `<div class="spm-ds3-breath-motion${running?' is-running':''}" aria-hidden="true"><span class="spm-ds3-lungs"></span><span class="spm-ds3-pelvis"></span><span class="spm-ds3-flow"></span></div>
   <svg class="spm-ds3-ringprogress" viewBox="0 0 430 430" aria-hidden="true"><circle cx="215" cy="215" r="195" fill="none" stroke="rgba(235,197,116,.38)" stroke-width="5"/><circle data-ds3-progress cx="215" cy="215" r="195" fill="none" stroke="#2c805e" stroke-width="7" stroke-linecap="round" transform="rotate(-90 215 215)" stroke-dasharray="${(progress/100*1225.22).toFixed(2)} 1225.22"/></svg>
   <div class="spm-ds3-live-time" role="timer" aria-label="Tiempo restante de la práctica" data-ds3-clock>${time(remaining)}</div>`;
 }
 function measure(name,value){return `<label class="spm-ds3-meter">Presión ${name==='before'?'antes':'después'} <select data-ds3-score="${name}" aria-label="Presión ${name==='before'?'antes':'después'} de 0 a 10, opcional"><option value="na"${value===null?' selected':''}>N/A</option>${Array.from({length:11},(_,n)=>`<option value="${n}"${value===n?' selected':''}>${n}</option>`).join('')}</select></label>`;}
 function extras(m){if(m.page!==3)return '';
  const t=m.timer;
  return `<div class="spm-ds3-practice-info" aria-live="polite"><span data-ds3-phase-label>${t.finished?'Práctica realizada · tiempo registrado':t.started?(t.running?'En curso: ':'En pausa: ')+PHASES[t.phase].title:'Listo para iniciar cuando quieras'}</span><span data-ds3-active>Tiempo activo: ${time(t.elapsed)}</span></div>
   <div class="spm-ds3-practice-options"><details><summary>Registrar presión antes y después (opcional)</summary><div class="spm-ds3-meters">${measure('before',m.before)}${measure('after',m.after)}</div></details>
   <button type="button" data-ds3-action="finish" class="spm-ds3-finish" ${!t.started?'disabled':''}>${t.finished?'Guardar y volver a Actividades de hoy':'Terminé la práctica · Guardar y finalizar'}</button></div>`;
 }
 function render(m){if(!m?.host?.isConnected)return;
  const p=m.page;
  m.host.innerHTML=`<section class="spm-ds3-session" data-ds3-page="${p}" data-running="${p===3&&m.timer.running}" aria-label="Deseo, día 3, pantalla ${p} de 3"><div class="spm-ds3-art"><img src="${esc(m.images[p-1])}" alt="" width="864" height="1536" draggable="false" loading="eager">${p===3?breatheVisual(m):''}${hotspots(m)}</div>${extras(m)}<nav class="spm-ds3-nav" aria-label="Navegación de Deseo día 3"><button type="button" data-ds3-action="back">← ${p===1?'Actividades de hoy':'Anterior'}</button><span>${p} de 3</span><button type="button" data-ds3-action="${p===3?'finish':'next'}">${p===3?'Finalizar ✓':'Siguiente →'}</button></nav><div class="spm-ds3-bottom"><button type="button" data-ds3-action="exit">Salir a Actividades de hoy</button><button type="button" data-ds3-action="audio" data-ds3-value="guide">🔊 Escuchar guía</button></div><p class="spm-ds3-status" role="status" aria-live="polite">${esc(m.message||'')}</p></section>`;
 }
 function status(m,message){m.message=message;const el=m.host?.querySelector('.spm-ds3-status');if(el)el.textContent=message;}
 function stopVoice(m){if(!m)return;try{window.speechSynthesis?.cancel?.()}catch{}m.voiceKey=null;}
 function speak(m,key,text){if(!text||!m.valid()||!m.host?.isConnected)return;
  if(m.voiceKey===key){stopVoice(m);return;}
  stopVoice(m);
  if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=='function'){status(m,'Este dispositivo no tiene disponible la voz. Puedes seguir las indicaciones escritas.');return;}
  const utter=new window.SpeechSynthesisUtterance(text);utter.lang='es-CO';utter.rate=1;utter.pitch=1;
  utter.onend=()=>{if(m.voiceKey===key)m.voiceKey=null;};
  utter.onerror=e=>{if(m.voiceKey===key){m.voiceKey=null;if(!['canceled','interrupted'].includes(e?.error))status(m,'La voz no está disponible en este momento. Puedes seguir los pasos visibles.');}};
  m.voiceKey=key;try{window.speechSynthesis.speak(utter);}catch{m.voiceKey=null;status(m,'No fue posible reproducir la indicación.');}
 }
 const computedPhase=t=>Math.min(2,Math.floor(t.elapsed/100));
 function stamp(m){return {page:m.page,connection:m.connection,action:m.action,completed:m.completed===true,timer:{remaining:m.timer.remaining,elapsed:m.timer.elapsed,started:m.timer.started,finished:m.timer.finished},before:m.before,after:m.after};}
 function saveTx(m,apply){const task=async()=>{
   if(active!==m||!m.valid())throw Error('El contexto del programa ha cambiado.');
   const bundle=normal(await m.storage.read());if(active!==m||!m.valid())throw Error('El contexto cambió mientras se guardaba.');
   let program={};try{program=normal(JSON.parse(bundle['spm-desire-program']||'{}'));}catch{}
   program.detailNotes={...normal(program.detailNotes),[NOTE_KEY]:JSON.stringify(stamp(m))};
   if(typeof apply==='function')apply(program);
   await m.storage.save({...bundle,'spm-desire-program':JSON.stringify(program)});
  };m.queue=m.queue.then(task,task);return m.queue;}
 function schedule(m){clearTimeout(m.pending);m.pending=setTimeout(()=>void saveTx(m).catch(()=>status(m,'No fue posible guardar automáticamente. Puedes reintentar.')),750);}
 function paintClock(m){if(m.page!==3)return;
  const host=m.host;if(!host?.isConnected)return;
  const el=host.querySelector('[data-ds3-clock]');if(el)el.textContent=time(m.timer.remaining);
  const p=host.querySelector('[data-ds3-progress]');if(p){const per=(DURATION-m.timer.remaining)/DURATION;p.setAttribute('stroke-dasharray',`${(per*1225.22).toFixed(2)} 1225.22`);}
  const statusEl=host.querySelector('[data-ds3-phase-label]');if(statusEl)statusEl.textContent=m.timer.finished?'Práctica realizada · tiempo registrado':m.timer.started?(m.timer.running?'En curso: ':'En pausa: ')+PHASES[m.timer.phase].title:'Listo para iniciar cuando quieras';
  const activeEl=host.querySelector('[data-ds3-active]');if(activeEl)activeEl.textContent='Tiempo activo: '+time(m.timer.elapsed);
  const session=host.querySelector('[data-ds3-page]');if(session)session.dataset.running=String(m.timer.running);
 }
 function tick(m){const t=m.timer;if(!t.running||active!==m||!m.valid())return;
  const elapsedNow=Math.max(0,Math.floor((performance.now()-t.fromAt)/1000));
  const realLeft=Math.max(0,t.baseRemaining-elapsedNow);
  if(realLeft===t.remaining)return;
  t.remaining=realLeft;t.elapsed=Math.min(DURATION,DURATION-realLeft);const phase=computedPhase(t),previous=t.phase;
  t.phase=phase;paintClock(m);
  if(phase!==previous&&realLeft>0){speak(m,'phase'+phase,PHASES[phase].audio);schedule(m);}
  if(realLeft===0){t.finished=true;t.running=false;clearInterval(m.interval);m.interval=null;paintClock(m);
   status(m,'Terminaste los cinco minutos. Si lo deseas, registra cómo te sentiste y pulsa Guardar y finalizar.');speak(m,'end','Has completado cinco minutos de práctica. Observa cómo te sientes. Puedes registrar la presión antes y después si lo deseas y finalizar.');schedule(m);}
 }
 function start(m){if(m.page!==3)return;
  const t=m.timer;if(t.finished){status(m,'Esta práctica ya quedó realizada. Puedes guardarla o reiniciar el cronómetro si quieres repetirla.');return;}
  if(t.running){status(m,'El cronómetro ya está en marcha. Puedes pausarlo con el botón del reloj.');return;}
  if(!t.started){t.started=true;t.remaining=DURATION;t.elapsed=0;t.phase=0;}
  t.baseRemaining=t.remaining;t.fromAt=performance.now();t.running=true;
  clearInterval(m.interval);m.interval=setInterval(()=>tick(m),250);
  render(m);schedule(m);
  speak(m,'start',t.elapsed===0?PHASES[0].audio:'Continúa desde donde te detuviste. '+PHASES[t.phase].audio);
 }
 function pause(m){const t=m.timer;if(!t.running)return;tick(m);t.running=false;clearInterval(m.interval);m.interval=null;stopVoice(m);paintClock(m);schedule(m);}
 function reset(m){pause(m);stopVoice(m);m.timer={remaining:DURATION,elapsed:0,started:false,finished:false,running:false,baseRemaining:DURATION,fromAt:0,phase:0};render(m);schedule(m);}
 function move(m,p){pause(m);stopVoice(m);m.page=p;m.message='';render(m);schedule(m);m.host.querySelector('.spm-ds3-session')?.scrollIntoView?.({block:'start',behavior:'instant'});}
 function next(m){if(m.page===1){if(!m.connection){status(m,'Elige el tipo de cercanía que te ayuda más.');return;}move(m,2);return;}
  if(m.page===2){if(!m.action){status(m,'Elige qué te gustaría intentar antes de continuar.');return;}move(m,3);return;}
  if(m.page===3)void complete(m);
 }
 async function exit(m){if(m.busy)return;pause(m);stopVoice(m);clearTimeout(m.pending);m.busy=true;
  try{await saveTx(m);m.onBack?.();}catch{status(m,'No se pudo guardar el avance. Puedes reintentar sin perder tus respuestas.');}finally{m.busy=false;}
 }
 function recorded(program){return (Array.isArray(program.sessions)?program.sessions:[]).find(s=>s?.day===DAY&&s.practiceId==='breath-routine'&&s.status==='completed');}
 function updateProgram(m,p){const date=new Date().toISOString();
  if(!recorded(p)){const ls=Array.isArray(p.sessions)?p.sessions:[],id='breath-routine-d3-touch-v2';
   const row={id,day:DAY,date:date.slice(0,10),practiceId:'breath-routine',variant:'solo',status:'completed',activeSec:m.timer.elapsed,metricKey:'pressure',metricLabel:'Presión antes y después (0–10)',before:m.before,after:m.after,reflection:`Cercanía: ${option(CONNECTIONS,m.connection)?.label}; acción: ${option(ACTIONS,m.action)?.label}. Soltar presión, respirar cómodo y elegir conexión.`};
   const i=ls.findIndex(x=>x?.id===id);p.sessions=i<0?[...ls,row]:ls.map((x,index)=>index===i?row:x);
  }
  p.dayDone={...normal(p.dayDone),[DAY]:normal(p.dayDone)[DAY]||date};
 }
 async function complete(m){if(m.busy)return;
  if(!m.connection||!m.action){status(m,'Completa las elecciones de cercanía y la acción antes de finalizar.');return;}
  if(!m.timer.started&&!m.completed){status(m,'Inicia la práctica guiada de respiración antes de guardar el día.');return;}
  pause(m);stopVoice(m);clearTimeout(m.pending);m.busy=true;status(m,'Guardando tu actividad del Día 3…');
  try{m.timer.finished=true;m.completed=true;
   await saveTx(m,p=>updateProgram(m,p));
   await m.onCompleted?.({day:DAY,confirmed:true,source:'desire-lab',desireDay3TouchVersion:2,connection:m.connection,plannedAction:m.action,activeSec:m.timer.elapsed,pressureBefore:m.before,pressureAfter:m.after});
   m.onBack?.();
  }catch{m.completed=false;m.timer.finished=false;status(m,'No fue posible guardar la práctica. Tus respuestas se conservan y puedes reintentar.');}
  finally{m.busy=false;}
 }
 function delegate(m,e){const el=e.target?.closest?.('[data-ds3-action]');if(!el||!m.host.contains(el)||active!==m||!m.valid()||m.busy)return;
  const act=el.dataset.ds3Action,val=el.dataset.ds3Value;
  if(act==='audio'){speak(m,'guide'+m.page,GUIDE[m.page]);return;}
  if(act==='choose'){const item=option(m.page===1?CONNECTIONS:ACTIONS,val);if(!item)return;
   if(m.page===1)m.connection=val;else m.action=val;
   m.message='';render(m);schedule(m);speak(m,`${m.page}:${val}`,item.speech);return;
  }
  if(act==='phase'){const n=Number(val);if(n>=0&&n<3)speak(m,'step'+n,PHASES[n].audio);return;}
  if(act==='timer'){if(val==='reset')reset(m);else if(val==='pause'){pause(m);status(m,'Práctica en pausa. Pulsa reproducir para continuar.');}else start(m);return;}
  if(act==='next'){next(m);return;}
  if(act==='back'){m.page===1?void exit(m):move(m,m.page-1);return;}
  if(act==='exit'){void exit(m);return;}
  if(act==='finish'){void complete(m);return;}
 }
 async function mount({host,storage,valid=()=>true,onBack=()=>{},onCompleted=()=>{},images=IMAGES,reset:clear=false}={}){
  if(!host?.isConnected||!storage||typeof storage.read!=='function'||typeof storage.save!=='function')return false;
  stop();const m={host,storage,valid,onBack,onCompleted,images,page:1,connection:null,action:null,completed:false,timer:{remaining:DURATION,elapsed:0,started:false,finished:false,running:false,baseRemaining:DURATION,fromAt:0,phase:0},before:null,after:null,pending:null,interval:null,queue:Promise.resolve(),busy:false,voiceKey:null,message:'',events:new AbortController()};
  active=m;host.innerHTML='<p role="status">Recuperando tu progreso del Día 3…</p>';
  try{const bundle=normal(await storage.read());if(active!==m||!valid())return false;
   let p={};try{p=normal(JSON.parse(bundle['spm-desire-program']||'{}'));}catch{}
   let saved={};if(!clear)try{saved=normal(JSON.parse(normal(p.detailNotes)[NOTE_KEY]||'{}'));}catch{}
   m.connection=option(CONNECTIONS,saved.connection)?.id||null;m.action=option(ACTIONS,saved.action)?.id||null;
   m.completed=!!recorded(p)||saved.completed===true;
   m.before=score(saved.before);m.after=score(saved.after);
   const timer=normal(saved.timer),oldSession=recorded(p);
   m.timer.remaining=m.completed?Math.max(0,DURATION-Math.min(DURATION,Math.floor(Number(oldSession?.activeSec)||Number(timer.elapsed)||0))):Math.max(0,Math.min(DURATION,Math.floor(Number(timer.remaining??DURATION)||0)));
   if(!m.completed&&!timer.started&&!timer.finished)m.timer.remaining=DURATION;
   m.timer.elapsed=m.completed?(Number(oldSession?.activeSec)||Number(timer.elapsed)||DURATION):Math.max(0,Math.min(DURATION,Math.floor(Number(timer.elapsed)||0)));
   m.timer.started=m.completed||timer.started===true;m.timer.finished=m.completed||timer.finished===true;
   if(m.timer.finished&&m.timer.elapsed>=DURATION)m.timer.remaining=0;
   m.timer.phase=computedPhase(m.timer);
   m.page=m.completed?3:saved.page===3&&m.connection&&m.action?3:saved.page===2&&m.connection?2:1;
   render(m);
   host.addEventListener('click',e=>delegate(m,e),{signal:m.events.signal});
   host.addEventListener('change',e=>{const el=e.target?.closest?.('[data-ds3-score]');if(!el||active!==m||!m.valid())return;const key=el.dataset.ds3Score;if(!['before','after'].includes(key))return;m[key]=score(el.value);schedule(m);},{signal:m.events.signal});
   document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(m);},{signal:m.events.signal});
   window.addEventListener('pagehide',()=>pause(m),{signal:m.events.signal});
   window.addEventListener('spm:session-change',()=>{if(!m.valid())stop();},{signal:m.events.signal});
   return true;
  }catch{if(active===m)host.innerHTML='<p role="alert">No pudimos recuperar la práctica. Tus registros previos siguen guardados; vuelve a Actividades de hoy y reintenta.</p>';return false;}
 }
 function stop(){const m=active;active=null;if(!m)return;clearTimeout(m.pending);clearInterval(m.interval);m.interval=null;stopVoice(m);m.events.abort();}
 function pauseActive(){if(active){pause(active);stopVoice(active);}}
 window.SPM_DESIRE_DAY3_TOUCH={mount,stop,pause:pauseActive,images:IMAGES.slice(),connections:CONNECTIONS.map(x=>x.id),actions:ACTIONS.map(x=>x.id),curriculum:'breath-routine',durationSec:DURATION,voice:'voz estándar del dispositivo'};
})();
