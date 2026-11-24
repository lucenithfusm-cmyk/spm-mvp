/* SPM Digital Wellness — Deseo, Día 1 | cinco láminas 9:16 aprobadas.
 * Solo activa zonas táctiles; no vuelve a dibujar ni recorta las láminas.
 * Preserva las sesiones clínicas originales presence-5 y explore-new-stimulus.
 * Narración: textos del módulo existente, voz estándar del navegador (es-CO).
 */
(()=>{
  'use strict';
  if(window.SPM_DESIRE_DAY1_TOUCH)return;
  const DEFAULT_IMAGES=[1,2,3,4,5].map(n=>`/premium-v2/assets/desire-day1/screen-0${n}.jpg`);
  const NOTE_KEY='desireDay1TouchV1';
  const DAY=1;
  const FORM_AUDIO={
    spont:'A veces las ganas aparecen antes de iniciar cualquier contacto. Por ejemplo, recuerdas un momento agradable y notas interés. A esto lo llamamos deseo espontáneo. Si esta forma se parece a ti hoy, toca directamente «Me dan ganas». Tu práctica te ayudará a reconocer qué despierta ese interés y a disfrutarlo sin convertirlo en una obligación.',
    resp:'Otras veces no tienes ganas al principio, pero sí disposición a disfrutar de algo agradable. El interés puede aparecer poco a poco, con tranquilidad y sin presión. A esto lo llamamos deseo responsivo. Si esta forma se parece a ti hoy, toca directamente «Me voy conectando». Tu práctica te ayudará a explorar qué condiciones favorecen la conexión, sin obligarte a sentir deseo ni a continuar.'
  };
  const FORM_STEPS={
    spont:[
      'Primero, recuerda una situación reciente que despertó tu interés. Identifica un detalle: una imagen, una voz, un gesto o un ambiente.',
      'Presta atención a una sensación agradable y cómoda: el contacto de tus manos, la temperatura de tu piel o un aroma. Respira con naturalidad y explora a tu ritmo.',
      'Cuando quieras terminar, observa qué detalle te ayudó a conectar. Puedes anotarlo en tu reflexión. Si no sentiste interés, también es una observación válida.'
    ],
    resp:[
      'Elige una sensación que te resulte agradable y que pueda despertar tu interés: el roce delicado de unas manos sobre la piel, el calor de un abrazo o un aroma que te atraiga. Si estás con tu pareja, exploren solamente el contacto que ambos deseen.',
      'Disfruta a tu ritmo. Observa si aparece un hormigueo suave en el cuello o la espalda con una caricia. Si estás con tu pareja y ambos lo desean, acaricia lentamente su cabello y descubre su suavidad. Si aparece presión o incomodidad, haz una pausa o detente.',
      'Cuando quieras terminar, pregúntate: ¿me sentí más cómodo, curioso o conectado? Puedes anotarlo en tu reflexión. No necesitas sentir deseo para que esta observación tenga valor.'
    ]
  };
  const NARRATION={
    formIntro:'Antes de practicar, vamos a conocer dos formas del deseo. A veces las ganas aparecen antes de empezar. Otras veces el interés surge poco a poco, durante una experiencia agradable que tú eliges. Ambas pueden alternarse. Hoy vamos a reconocer cómo aparece en ti. Escucha ambas opciones. Si esto se parece a ti hoy, toca «Me dan ganas» para el deseo espontáneo, o «Me voy conectando» para el deseo responsivo. Pulsa directamente sobre la opción elegida. Después harás una práctica relacionada con tu elección, a tu propio ritmo.',
    spontIntro:'Vas a reconocer un estímulo que despierta tu interés y explorar una sensación agradable sin presión.',
    respIntro:'Vas a crear un momento agradable para explorar comodidad y conexión, sin exigir que aparezca deseo.',
    preparation:'Busca un lugar cómodo y privado. Silencia las notificaciones y ten a mano lo que quieras explorar.',
    presenceExit:'Cuando termines, puedes anotar qué te resultó útil y qué quieres repetir o adaptar.',
    stimulusIntro:'Ampliar tus posibilidades de disfrute explorando un estímulo diferente. Elige una canción, una imagen que te atraiga o un momento de contacto agradable. No necesitas buscar una respuesta específica.',
    stimulusOptions:'Para esta segunda exploración, elige una sola opción diferente. Música: escucha un ritmo que te resulte atractivo. Imagen agradable: observa una mirada, un gesto o una escena que despierte tu curiosidad. Textura: siente la calidez de tu piel bajo la yema de los dedos o, si ambos lo desean, el roce de los labios durante un beso.',
    stimulusExplore:'Continúa con la opción elegida sin prisa. Deja que el ritmo, una mirada o el contacto despierten una sensación agradable. Quizá notes un escalofrío placentero, esa pequeña corriente de sensibilidad que puede surgir con una caricia inesperada. Si no aparece, también está bien. Respira con naturalidad y observa tu comodidad.',
    stimulusExit:'Cuando termines de explorar, compara con la primera experiencia: ¿qué te resultó agradable, neutro o incómodo? Puedes anotarlo en Tu reflexión al terminar. Si no te gustó, elige otra opción en una próxima práctica.',
    close:'Cuando termines, puedes anotar qué te resultó útil y qué quieres repetir o adaptar.'
  };
  const STIMULI={musica:'escuchar una canción agradable',imagen:'observar una imagen que te guste',textura:'recorrer suavemente la piel de tus brazos con las yemas de los dedos o, si ambos lo desean, disfrutar el contacto de una caricia compartida'};
  const OBS=['Más calma','Más conexión','Sin cambios'];
  const REPEAT=['Sí','Tal vez','No'];
  const clampScore=v=>v!==null&&v!==undefined&&v!==''&&Number.isInteger(Number(v))&&Number(v)>=0&&Number(v)<=10?Number(v):null;
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rect=(x,y,w,h)=>`left:${(x/864*100).toFixed(4)}%;top:${(y/1536*100).toFixed(4)}%;width:${(w/864*100).toFixed(4)}%;height:${(h/1536*100).toFixed(4)}%;`;
  const hit=(x,y,w,h,action,label,value=null)=>`<button type="button" class="spm-ds1-hit" style="${rect(x,y,w,h)}" data-ds1-act="${esc(action)}"${value===null?'':` data-ds1-val="${esc(value)}"`} aria-label="${esc(label)}"></button>`;
  const glow=(x,y,w,h)=>`<span aria-hidden="true" class="spm-ds1-glow" style="${rect(x,y,w,h)}"></span>`;
  const mark=(x,y)=>`<span aria-hidden="true" class="spm-ds1-mark" style="${rect(x-22,y-22,44,44)}">✓</span>`;
  const selected=(x,y,w,h)=>`<span aria-hidden="true" class="spm-ds1-selected" style="${rect(x,y,w,h)}"></span>`;
  const time=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const normal=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
  const legacyRecord=(p,id)=>Array.isArray(p.sessions)?[...p.sessions].reverse().find(s=>s&&s.day===1&&s.practiceId===id&&s.status==='completed'):null;
  const firstForm=p=>['spont','resp'].includes(normal(p.detailNotes).form)?p.detailNotes.form:null;
  let active=null;
  function pageHits(m){
    let h='',s='';
    switch(m.page){
      case 1:
        h+=hit(35,565,370,86,'audio','Escuchar guía para conocer las dos formas de deseo','intro');
        h+=hit(25,737,810,214,'form','Me dan ganas · deseo espontáneo','spont');
        h+=hit(25,967,810,237,'form','Me voy conectando · deseo responsivo','resp');
        if(m.form==='spont')s+=mark(774,840);
        if(m.form==='resp')s+=mark(774,1078);
        h+=hit(28,1400,808,109,'next','Continuar a la práctica de exploración');
        break;
      case 2:
        h+=hit(35,565,410,85,'audio','Escuchar práctica y preparación','practice');
        [[50,801,763,137],[50,948,763,135],[50,1097,763,133]].forEach(([x,y,w,hh],i)=>{h+=hit(x,y,w,hh,'step','Escuchar paso '+(i+1),String(i));if(m.lastStep===i)s+=selected(x+1,y+1,w-2,hh-2)});
        h+=hit(28,1400,808,110,'start','Iniciar práctica corporal de 5 minutos','first');
        if(m.firstTimer.started)s+=glow(28,1400,808,110);
        break;
      case 3:
        for(const [row,key] of [[884,'before'],[1060,'after']]){
          for(let i=0;i<=10;i++){
            const cx=99+i*67.0;
            h+=hit(cx-28,row-29,56,58,'score','Seleccionar '+i+' de 10 para presión '+(key==='before'?'antes':'después'),`${key}:${i}`);
            if(m[key]===i)s+=selected(cx-30,row-30,60,60);
          }
        }
        [[47,1253,252,84],[307,1253,259,84],[570,1253,250,84]].forEach(([x,y,w,hh],i)=>{h+=hit(x,y,w,hh,'observe','Seleccionar '+OBS[i],String(i));if(m.observation===OBS[i])s+=selected(x,y,w,hh)});
        h+=hit(26,1399,813,112,'saveFirst','Guardar registro de la primera práctica');
        break;
      case 4:
        h+=hit(38,523,380,90,'audio','Escuchar guía de la segunda exploración','stimulus');
        [[51,772,763,139],[51,924,763,141],[50,1079,765,141]].forEach(([x,y,w,hh],i)=>{const key=Object.keys(STIMULI)[i];h+=hit(x,y,w,hh,'stimulus','Seleccionar '+['Música','Imagen agradable','Textura'][i],key);if(m.stimulus===key)s+=mark(763,[843,995,1150][i]);});
        h+=hit(27,1400,811,112,'start','Iniciar segunda práctica de 3 minutos','second');
        if(m.secondTimer.started)s+=glow(27,1400,811,112);
        break;
      case 5:
        for(let i=0;i<=10;i++){
          const cx=91+i*69.8;
          h+=hit(cx-29,883-29,58,60,'score','Seleccionar comodidad '+i+' de 10',`comfort:${i}`);
          if(m.comfort===i)s+=selected(cx-30,883-30,60,60);
        }
        [[58,1108,235,89],[311,1108,239,89],[572,1108,239,89]].forEach(([x,y,w,hh],i)=>{h+=hit(x,y,w,hh,'repeat','Seleccionar '+REPEAT[i],String(i));if(m.repeat===REPEAT[i])s+=selected(x,y,w,hh)});
        h+=hit(27,1400,810,110,'saveFinal','Guardar práctica y regresar a Actividades de hoy');
        break;
    }
    return s+h; // marks have pointer-events:none; buttons sit above artwork
  }
  function clock(m){
    if(m.page!==2&&m.page!==4)return '';
    const which=m.page===2?'first':'second',t=which==='first'?m.firstTimer:m.secondTimer;
    if(!t.started)return '';
    return `<div class="spm-ds1-clockbar" role="group" aria-label="Cronómetro opcional de la práctica"><div class="spm-ds1-clock"><span aria-hidden="true">◷</span><strong data-ds1-clock>${time(t.sec)}</strong><span>referencia: ${which==='first'?'05:00':'03:00'}</span></div><div class="spm-ds1-clock-actions"><button type="button" data-ds1-act="${t.running?'pause':'resume'}" data-ds1-val="${which}">${t.running?'Pausar':'Reanudar'}</button><button type="button" class="spm-ds1-complete" data-ds1-act="end" data-ds1-val="${which}">Terminar y registrar</button></div></div>`;
  }
  function render(m){
    if(!m.host?.isConnected)return;
    const previous=m.host.querySelector('.spm-ds1-session');
    const scrollTop=previous?.dataset?.ds1Page===String(m.page)?(previous.scrollTop||0):0;
    const step=m.page,art=m.images[step-1];
    m.host.innerHTML=`<section class="spm-ds1-session" data-ds1-page="${step}" aria-label="Deseo · Día 1 · Pantalla ${step} de 5"><div class="spm-ds1-art"><img src="${esc(art)}" width="864" height="1536" alt="" draggable="false" loading="eager">${pageHits(m)}</div>${clock(m)}<nav class="spm-ds1-nav" aria-label="Navegación de Deseo"><button type="button" data-ds1-act="back">← ${step===1?'Actividades de hoy':'Anterior'}</button><span>Pantalla ${step} de 5</span><button type="button" data-ds1-act="forward">${step===5?'Volver a Hoy':'Siguiente →'}</button></nav><div class="spm-ds1-bottom"><button type="button" class="spm-ds1-exit" data-ds1-act="exit">Salir a Actividades de hoy</button><button type="button" class="spm-ds1-audio" data-ds1-act="audio" data-ds1-val="${step===3?'register':step===5?'close':'guide'}" aria-label="Escuchar instrucciones adicionales">🔊 Escuchar instrucciones</button></div><p class="spm-ds1-status" role="status" aria-live="polite">${esc(m.message||'')}</p></section>`;
    const current=m.host.querySelector('.spm-ds1-session');
    if(current)current.scrollTop=scrollTop;
  }
  function status(m,message){m.message=message;const s=m.host?.querySelector('.spm-ds1-status');if(s)s.textContent=message;}
  function speechText(m,key){
    if(key==='intro'||(key==='guide'&&m.page===1))return NARRATION.formIntro;
    if(key==='practice'||(key==='guide'&&m.page===2))return [m.form==='spont'?NARRATION.spontIntro:NARRATION.respIntro,NARRATION.preparation,'Cuando estés listo, pulsa Iniciar mi práctica.'].join(' ');
    if(key==='stimulus'||(key==='guide'&&m.page===4))return [NARRATION.stimulusIntro,NARRATION.stimulusOptions].join(' ');
    if(key==='register')return NARRATION.presenceExit;
    if(key==='close')return [NARRATION.stimulusExit,NARRATION.close].join(' ');
    if(key==='guide')return NARRATION.presenceExit;
    return '';
  }
  function stopVoice(m){if(!m)return;try{window.speechSynthesis?.cancel?.()}catch{}m.audioKey=null;m.host?.querySelectorAll('.spm-ds1-hit.is-speaking').forEach(el=>el.classList.remove('is-speaking'));}
  function say(m,key,text){
    if(!m||!text)return;
    if(m.audioKey===key){stopVoice(m);return;}
    stopVoice(m);
    if(typeof window.SpeechSynthesisUtterance!=='function'||!window.speechSynthesis){status(m,'La lectura por voz no está disponible en este navegador. Puedes seguir las indicaciones escritas de las pantallas.');return;}
    const utter=new SpeechSynthesisUtterance(text);utter.lang='es-CO';utter.rate=1;utter.pitch=1;
    utter.onend=()=>{if(m.audioKey===key)m.audioKey=null;};
    utter.onerror=evt=>{if(m.audioKey===key){m.audioKey=null;if(evt?.error!=='interrupted'&&evt?.error!=='canceled')status(m,'No se pudo reproducir el audio. Las indicaciones continúan visibles.')}};
    m.audioKey=key;
    try{window.speechSynthesis.speak(utter);}catch{status(m,'No se pudo reproducir la guía en este dispositivo.');m.audioKey=null;}
  }
  function timerObj(raw){const t=normal(raw);return {sec:Math.max(0,Math.min(7200,Math.floor(Number(t.sec)||0))),started:t.started===true,done:t.done===true,running:false,lastAt:0};}
  function stamp(m){return {page:m.page,form:m.form,before:m.before,after:m.after,observation:m.observation,stimulus:m.stimulus,comfort:m.comfort,repeat:m.repeat,lastStep:m.lastStep,firstSaved:m.firstSaved,finalSaved:m.finalSaved,firstTimer:{sec:m.firstTimer.sec,started:m.firstTimer.started,done:m.firstTimer.done},secondTimer:{sec:m.secondTimer.sec,started:m.secondTimer.started,done:m.secondTimer.done}};}
  function saveTx(m,change){
    const task=async()=>{
      if(!m.valid())throw Error('El programa o el día han cambiado.');
      const bundle=normal(await m.storage.read());
      if(!m.valid())throw Error('La sesión cambió durante el guardado.');
      let program={};try{program=normal(JSON.parse(bundle['spm-desire-program']||'{}'));}catch{program={};}
      program.detailNotes={...normal(program.detailNotes),form:m.form||normal(program.detailNotes).form};
      program.detailNotes[NOTE_KEY]=JSON.stringify(stamp(m));
      if(change)change(program);
      await m.storage.save({...bundle,'spm-desire-program':JSON.stringify(program)});
    };
    m.saveQueue=m.saveQueue.then(task,task);
    return m.saveQueue;
  }
  function schedule(m){clearTimeout(m.saveDelay);m.saveDelay=setTimeout(()=>{void saveTx(m).catch(()=>status(m,'No se pudo guardar el avance automáticamente. Puedes reintentar desde esta pantalla.'));},650);}
  function updateClock(m){if(!m||!m.host?.isConnected)return;const t=m.page===2?m.firstTimer:m.page===4?m.secondTimer:null;
    if(!t||!t.running)return;
    const now=performance.now(),dt=Math.max(0,Math.min(2, (now-t.lastAt)/1000));t.lastAt=now;
    t.partial=(t.partial||0)+dt;
    if(t.partial>=1){const n=Math.floor(t.partial);t.sec+=n;t.partial-=n;const label=m.host.querySelector('[data-ds1-clock]');if(label)label.textContent=time(t.sec);}
  }
  function pauseTimer(m,which){const t=which==='first'?m.firstTimer:m.secondTimer;updateClock(m);t.running=false;t.lastAt=0;clearInterval(m.interval);m.interval=null;schedule(m);}
  function startTimer(m,which){const t=which==='first'?m.firstTimer:m.secondTimer;
    if(t.done){t.done=false;t.sec=0;}
    t.started=true;t.running=true;t.lastAt=performance.now();t.partial=0;
    clearInterval(m.interval);m.interval=setInterval(()=>updateClock(m),250);
    m.message='Cronómetro iniciado. Puedes pausar o terminar cuando hayas realizado los pasos; no es obligatorio llegar al tiempo sugerido.';
    render(m);schedule(m);
  }
  function ensure(m,ok,message){if(ok)return true;status(m,message);return false;}
  function move(m,to){pauseIfRunning(m);stopVoice(m);m.page=to;m.message='';render(m);schedule(m);m.host.querySelector('.spm-ds1-session')?.scrollIntoView?.({block:'start',behavior:'instant'});}
  function pauseIfRunning(m){if(m.firstTimer.running)pauseTimer(m,'first');if(m.secondTimer.running)pauseTimer(m,'second');}
  function next(m){
    if(m.page===1){if(!ensure(m,!!m.form,'Elige una forma de deseo para continuar.'))return;move(m,2);return;}
    if(m.page===2){if(!ensure(m,m.firstTimer.done,'Inicia y termina la primera práctica antes de registrar tu experiencia.'))return;move(m,3);return;}
    if(m.page===3){if(!ensure(m,m.firstSaved,'Guarda el primer registro antes de continuar.'))return;move(m,4);return;}
    if(m.page===4){if(!ensure(m,m.secondTimer.done,'Selecciona un estímulo, inicia y termina la segunda exploración.'))return;move(m,5);return;}
    if(m.page===5)void exit(m);
  }
  function prev(m){if(m.page===1){void exit(m);return;}move(m,m.page-1);}
  async function exit(m){pauseIfRunning(m);stopVoice(m);clearTimeout(m.saveDelay);try{await saveTx(m);m.onBack?.();}catch{status(m,'No pudimos guardar el avance. Reintenta para regresar sin perder tus respuestas.');}}
  function sessionId(program,id){const all=Array.isArray(program.sessions)?program.sessions:[];const old=[...all].reverse().find(s=>s&&s.practiceId===id&&s.day===1);return old?.id||`${id}-d1-touch-20261118`;}
  function upsertSession(program,session){const list=Array.isArray(program.sessions)?program.sessions:[];const prior=list.findIndex(s=>s?.id===session.id);program.sessions=prior<0?[...list,session]:list.map((s,i)=>i===prior?session:s);}
  function session(m,id,metric,metricLabel,before,after,reflection,timer){return {id:null,day:DAY,date:new Date().toISOString().slice(0,10),practiceId:id,variant:'solo',status:'completed',activeSec:timer.sec,metricKey:metric,metricLabel,before,after,reflection};}
  async function saveFirst(m){
    if(m.busy)return;
    if(!ensure(m,!!m.form&&m.firstTimer.done,'Termina la práctica de 5 minutos (puedes detener el cronómetro antes de llegar a cinco minutos).'))return;
    if(!ensure(m,m.before!==null&&m.after!==null,'Selecciona Presión antes y Presión después, entre 0 y 10.'))return;
    if(!ensure(m,!!m.observation,'Indica qué notaste después de la primera práctica.'))return;
    m.busy=true;status(m,'Guardando tu primer registro…');clearTimeout(m.saveDelay);
    try{
      await saveTx(m,program=>{
        const r=session(m,'presence-5','pressure','Presión (0–10, menor = más calma)',m.before,m.after,m.observation,m.firstTimer);
        r.id=sessionId(program,'presence-5');upsertSession(program,r);
      });
      m.firstSaved=true;move(m,4);
    }catch{status(m,'No pudimos guardar tu registro. Tus respuestas se conservan y puedes reintentar.');}
    finally{m.busy=false;}
  }
  async function saveFinal(m){
    if(m.busy)return;
    if(!ensure(m,m.firstSaved,'Primero debes guardar la exploración de cinco minutos.'))return;
    if(!ensure(m,!!m.stimulus&&m.secondTimer.done,'Selecciona un estímulo y termina la segunda práctica antes de guardar.'))return;
    if(!ensure(m,m.comfort!==null&&!!m.repeat,'Selecciona una puntuación de comodidad y si repetirías la exploración.'))return;
    m.busy=true;status(m,'Guardando la práctica y regresando a Actividades de hoy…');clearTimeout(m.saveDelay);
    try{
      m.finalSaved=true;
      await saveTx(m,program=>{
        const r=session(m,'explore-new-stimulus','local','Comodidad al explorar (0–10)',null,m.comfort,`${STIMULI[m.stimulus]}. Lo repetirías: ${m.repeat}.`,m.secondTimer);
        r.id=sessionId(program,'explore-new-stimulus');upsertSession(program,r);
        program.dayDone={...normal(program.dayDone),'1':new Date().toISOString()};
      });
      await m.onCompleted?.({day:1,confirmed:true,source:'desire-lab',desireDay1TouchVersion:1,form:m.form,stimulus:m.stimulus,comfort:m.comfort,pressureBefore:m.before,pressureAfter:m.after});
      await m.onBack?.();
    }catch{m.finalSaved=false;status(m,'No pudimos finalizar el guardado completo. Conservamos tus respuestas para reintentar.');}
    finally{m.busy=false;}
  }
  function delegate(m,e){
    const b=e.target.closest('[data-ds1-act]');if(!b||!m.host.contains(b)||m.busy||!m.valid())return;
    const action=b.dataset.ds1Act,val=b.dataset.ds1Val;
    if(action==='audio'){say(m,`page${m.page}:${val}`,speechText(m,val));return;}
    if(action==='form'){
      m.form=val;stopVoice(m);say(m,`form:${val}`,FORM_AUDIO[val]);m.message='';render(m);schedule(m);return;
    }
    if(action==='step'){
      const i=Number(val);if(!m.form||!FORM_STEPS[m.form]?.[i])return;
      m.lastStep=i;say(m,`step${i}`,FORM_STEPS[m.form][i]);render(m);schedule(m);return;
    }
    if(action==='stimulus'){
      if(!STIMULI[val])return;m.stimulus=val;say(m,'stimulus:'+val,STIMULI[val]);m.message='';render(m);schedule(m);return;
    }
    if(action==='score'){
      const [key,v]=val.split(':'),n=clampScore(v);if(n===null||!['before','after','comfort'].includes(key))return;
      m[key]=n;m.message='';render(m);schedule(m);return;
    }
    if(action==='observe'){m.observation=OBS[Number(val)]||null;m.message='';render(m);schedule(m);return;}
    if(action==='repeat'){m.repeat=REPEAT[Number(val)]||null;m.message='';render(m);schedule(m);return;}
    if(action==='next'||action==='forward'){next(m);return;}
    if(action==='back'){prev(m);return;}
    if(action==='exit'){void exit(m);return;}
    if(action==='saveFirst'){void saveFirst(m);return;}
    if(action==='saveFinal'){void saveFinal(m);return;}
    if(action==='start'){
      const which=val;if(which==='first'&&!m.form){status(m,'Antes de iniciar, elige cómo aparece tu deseo.');return;}
      if(which==='second'&&!m.stimulus){status(m,'Elige Música, Imagen agradable o Textura antes de iniciar.');return;}
      stopVoice(m);startTimer(m,which);
      say(m,'running:'+which,which==='first'?'Comienza a tu ritmo. Presta atención a lo que elegiste explorar y permite que aparezca la sensación sin buscar una respuesta determinada. Si necesitas una pausa, puedes hacerla.':NARRATION.stimulusExplore);return;
    }
    if(action==='pause'){pauseTimer(m,val);render(m);return;}
    if(action==='resume'){startTimer(m,val);return;}
    if(action==='end'){
      const t=val==='first'?m.firstTimer:m.secondTimer;
      if(!t.started){status(m,'Inicia primero la práctica.');return;}
      pauseTimer(m,val);t.done=true;stopVoice(m);
      move(m,val==='first'?3:5);
      say(m,'ending:'+val,val==='first'?FORM_STEPS[m.form][2]:NARRATION.stimulusExit);return;
    }
  }
  async function mount({host,storage,onBack=()=>{},onCompleted=()=>{},valid=()=>true,images=DEFAULT_IMAGES,reset=false}={}){
    if(!host||!storage||typeof storage.read!=='function'||typeof storage.save!=='function')return false;
    if(active)stop();
    const m={host,storage,onBack,onCompleted,valid,images,page:1,form:null,before:null,after:null,observation:null,stimulus:null,comfort:null,repeat:null,firstSaved:false,finalSaved:false,lastStep:-1,
      firstTimer:timerObj({}),secondTimer:timerObj({}),interval:null,audioKey:null,saveDelay:null,saveQueue:Promise.resolve(),events:new AbortController(),busy:false,message:''};
    active=m;
    host.innerHTML='<p role="status">Recuperando tu progreso de Deseo…</p>';
    try{
      const bundle=normal(await storage.read());
      if(active!==m||!valid())return false;
      let program={};try{program=normal(JSON.parse(bundle['spm-desire-program']||'{}'));}catch{}
      let cached={};try{cached=normal(JSON.parse(normal(program.detailNotes)[NOTE_KEY]||'{}'));}catch{}
      if(reset)cached={};
      const p1=legacyRecord(program,'presence-5'),p2=legacyRecord(program,'explore-new-stimulus');
      m.form=['spont','resp'].includes(cached.form)?cached.form:firstForm(program);
      m.before=clampScore(cached.before??p1?.before);m.after=clampScore(cached.after??p1?.after);
      m.observation=OBS.includes(cached.observation)?cached.observation:OBS.includes(p1?.reflection)?p1.reflection:null;
      m.stimulus=STIMULI[cached.stimulus]?cached.stimulus:null;
      m.comfort=clampScore(cached.comfort??p2?.after);
      m.repeat=REPEAT.includes(cached.repeat)?cached.repeat:null;
      m.firstTimer=timerObj(cached.firstTimer||{sec:p1?.activeSec,started:!!p1,done:!!p1});
      m.secondTimer=timerObj(cached.secondTimer||{sec:p2?.activeSec,started:!!p2,done:!!p2});
      m.firstSaved=!!p1||cached.firstSaved===true;m.finalSaved=!!p2||cached.finalSaved===true;
      m.lastStep=Number.isInteger(cached.lastStep)?cached.lastStep:-1;
      m.page=m.finalSaved?5:m.firstSaved?Math.min(5,Math.max(4,Number(cached.page)||4)):Math.min(3,Math.max(1,Number(cached.page)||1));
      render(m);
      host.addEventListener('click',e=>delegate(m,e),{signal:m.events.signal});
      document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseIfRunning(m);},{signal:m.events.signal});
      window.addEventListener('pagehide',()=>{pauseIfRunning(m);stopVoice(m);},{signal:m.events.signal});
      return true;
    }catch(e){if(active===m)host.innerHTML='<p role="alert">No se pudo recuperar el programa de Deseo. Vuelve a Actividades de hoy e inténtalo de nuevo; tu progreso original no se ha borrado.</p>';return false;}
  }
  function stop(){const m=active;active=null;if(!m)return;pauseIfRunning(m);stopVoice(m);clearInterval(m.interval);clearTimeout(m.saveDelay);m.events?.abort();}
  function pause(){if(active){pauseIfRunning(active);stopVoice(active)}}
  window.SPM_DESIRE_DAY1_TOUCH={mount,stop,pause,images:DEFAULT_IMAGES.slice(),audioSource:'narraciones aprobadas del programa Deseo, voz estándar del dispositivo',curriculum:['presence-5','explore-new-stimulus']};
})();
