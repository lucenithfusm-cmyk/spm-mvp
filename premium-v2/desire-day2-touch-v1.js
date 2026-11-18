/* SPM Digital Wellness · Deseo día 2 · dos imágenes 9:16 aprobadas.
 * Las imágenes son cada pantalla completa, nunca una tarjeta ni un fondo recortado.
 * Mantiene practiceId pattern-observe, el progreso y las restricciones clínicas.
 * Narración en español mediante la voz estándar del dispositivo: sin MP3 ni voces añadidas.
 */
(()=>{
  'use strict';
  if(window.SPM_DESIRE_DAY2_TOUCH)return;
  const DAY=2,NOTE_KEY='desireDay2TouchV1';
  const IMAGES=[1,2].map(i=>`/premium-v2/assets/desire-day2/screen-0${i}.jpg`);
  const FACILITATORS=[
    {id:'no_pressure',label:'Sentirme tranquilo y sin presión',speech:'Sentirme tranquilo y sin presión. Cuando no hay que demostrar ni conseguir una respuesta, puedes percibir mejor tus sensaciones y disfrutar la intimidad a tu ritmo.'},
    {id:'closeness',label:'Contacto afectivo y cercanía',speech:'Contacto afectivo y cercanía. La confianza, una conversación cómplice, una mirada o un abrazo pueden favorecer el interés cuando hay disposición mutua.'},
    {id:'fantasy',label:'Fantasías o pensamientos eróticos',speech:'Fantasías o pensamientos eróticos. Un recuerdo sensual o una escena imaginada que te atraiga pueden despertar curiosidad, sin exigirte que actúes sobre ellos.'},
    {id:'caresses',label:'Caricias o estimulación',speech:'Caricias o estimulación. Un beso, la calidez de la piel o el contacto que eliges libremente pueden facilitar que te vayas conectando, sin necesidad de apresurar nada.'},
    {id:'privacy',label:'Tiempo a solas o conmigo',speech:'Tiempo a solas o conmigo. La privacidad puede darte espacio para reconocer lo que te agrada, sin comparaciones, sin interrupciones y a tu propio ritmo.'},
    {id:'unclear',label:'Todavía no lo tengo claro',speech:'Todavía no lo tengo claro. También es válido. Observar con curiosidad, sin presionarte a encontrar una respuesta hoy, ya forma parte de aprender sobre tu deseo.'}
  ];
  const PLANS=[
    {id:'myself',label:'Dedicar unos minutos a conectar conmigo',speech:'Dedicar unos minutos a conectar conmigo. Elige un espacio privado, deja a un lado las distracciones y reconoce qué sensaciones de tu cuerpo te resultan agradables, sin buscar un resultado.'},
    {id:'partner',label:'Buscar un momento sin prisa con mi pareja',speech:'Buscar un momento sin prisa con mi pareja. Propón cercanía que ambos deseen, como un abrazo prolongado, un beso o caricias suaves. Pueden detenerse o cambiar de idea en cualquier momento.'},
    {id:'stimulus',label:'Explorar un estímulo que me resulte agradable',speech:'Explorar un estímulo que me resulte agradable. Puede ser una mirada, una fantasía que te atraiga, un aroma o un contacto elegido. Presta atención a lo que despierta curiosidad, sin forzar el deseo.'},
    {id:'observe',label:'Solo observar sin exigirme respuesta',speech:'Solo observar sin exigirme respuesta. Reconoce tu estado de ánimo y tu nivel de comodidad hoy. No necesitas provocar deseo ni comprobar una erección para que esta observación tenga valor.'}
  ];
  // Guías del contenido clínico aprobado de Día 2 (Tu patrón y tus contextos),
  // segmentadas y adaptadas a las opciones visibles de estas dos pantallas.
  const GUIDE={
    1:'Hoy vas a identificar lo que suele favorecer tu deseo. El descanso, la tranquilidad, la conexión y los estímulos pueden acompañar experiencias distintas. Recuerda momentos que ya hayas vivido: no tienes que provocar ni comprobar una respuesta sexual ahora. Toca una opción para escuchar qué significa y seleccionar la que más se acerque a tu experiencia. Si todavía no lo tienes claro, puedes elegir la opción seis. Después pulsa Continuar.',
    2:'Ahora vas a elegir una acción concreta para crear un contexto más favorable. Puedes conectar contigo, compartir un momento sin prisa con tu pareja, explorar un estímulo agradable o simplemente observar sin exigirte una respuesta. Toca la opción que prefieras para escuchar su indicación. La actividad consiste en elegir cómo acercarte al deseo sin presión; podrás ponerlo en práctica a tu ritmo. Para registrar tu elección, pulsa Guardar y continuar.'
  };
  const normal=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  const pct=(x,y,w,h)=>`left:${(x/864*100).toFixed(4)}%;top:${(y/1536*100).toFixed(4)}%;width:${(w/864*100).toFixed(4)}%;height:${(h/1536*100).toFixed(4)}%;`;
  const keyOf=(list,v)=>list.find(x=>x.id===v)||null;
  const pick=(x,y,w,h,act,label,val,pressed=false)=>`<button type="button" class="spm-ds2-hit spm-ds2-hit--${act}" style="${pct(x,y,w,h)}" data-ds2-action="${esc(act)}" data-ds2-value="${esc(val)}" aria-label="${esc(label)}"${act==='choose'?` aria-pressed="${pressed?'true':'false'}"`:''}></button>`;
  const mark=(x,y)=>`<span class="spm-ds2-check" aria-hidden="true" style="${pct(x-22,y-22,44,44)}">✓</span>`;
  let active=null;
  function actions(m){
    const audio=m.page===1?[34,483,357,84]:[38,506,397,87];
    let markup=pick(...audio,'audio',m.page===1?'Escuchar guía del Día 2':'Escuchar práctica del Día 2','guide');
    const opts=m.page===1?FACILITATORS:PLANS;
    const ys=m.page===1?[[716,799],[804,892],[895,983],[986,1073],[1076,1163],[1166,1254]]:[[758,874],[879,991],[995,1106],[1111,1222]];
    opts.forEach((o,i)=>{
      const [y1,y2]=ys[i];const selected=(m.page===1?m.factor:m.plan)===o.id;
      markup+=pick(45,y1,776,y2-y1,'choose','Seleccionar '+o.label,o.id,selected);
      if(selected)markup+=mark(m.page===1?774:764,Math.round((y1+y2)/2));
    });
    markup+=pick(26,1403,812,113,m.page===1?'next':'save',m.page===1?'Continuar':'Guardar y continuar',m.page===1?'next':'save');
    return markup;
  }
  function render(m){
    if(!m?.host?.isConnected)return;
    const page=m.page;
    m.host.innerHTML=`<section class="spm-ds2-session" data-ds2-page="${page}" aria-label="Deseo, día 2, pantalla ${page} de 2"><div class="spm-ds2-art"><img src="${esc(m.images[page-1])}" width="864" height="1536" alt="" draggable="false" loading="eager">${actions(m)}</div><nav class="spm-ds2-nav" aria-label="Navegación del día 2"><button type="button" data-ds2-action="back">← ${page===1?'Actividades de hoy':'Anterior'}</button><span>${page} de 2</span><button type="button" data-ds2-action="${page===1?'next':'save'}">${page===1?'Siguiente →':'Finalizar ✓'}</button></nav><div class="spm-ds2-bottom"><button type="button" data-ds2-action="exit">Salir a Actividades de hoy</button><button type="button" data-ds2-action="audio" data-ds2-value="guide">🔊 Escuchar guía</button></div><p role="status" class="spm-ds2-status" aria-live="polite">${esc(m.message)}</p></section>`;
  }
  function status(m,msg){m.message=msg;const el=m.host?.querySelector('.spm-ds2-status');if(el)el.textContent=msg;}
  function stopVoice(m){if(!m)return;try{window.speechSynthesis?.cancel?.()}catch{}m.speaking=null;}
  function speak(m,key,txt){
    if(!txt||!m.valid())return;
    if(m.speaking===key){stopVoice(m);return;}
    stopVoice(m);
    if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=='function'){
      status(m,'La voz del dispositivo no está disponible. Consulta las indicaciones de la imagen.');return;
    }
    const utter=new window.SpeechSynthesisUtterance(txt);
    utter.lang='es-CO';utter.rate=1;utter.pitch=1;
    utter.onend=()=>{if(m.speaking===key)m.speaking=null;};
    utter.onerror=e=>{if(m.speaking===key){m.speaking=null;if(!['canceled','interrupted'].includes(e?.error))status(m,'No se pudo reproducir el audio. Puedes continuar con la pantalla.');}};
    m.speaking=key;
    try{window.speechSynthesis.speak(utter);}catch{status(m,'No se pudo iniciar la voz del dispositivo.');m.speaking=null;}
  }
  function selectionState(m){return {page:m.page,factor:m.factor,plan:m.plan,completed:m.completed===true};}
  function schedule(m){clearTimeout(m.pending);m.pending=setTimeout(()=>void saveTx(m).catch(()=>status(m,'No pudimos guardar la selección automáticamente. Puedes volver a intentarlo.')),650);}
  function saveTx(m,apply){
    const task=async()=>{
      if(active!==m||!m.valid())throw Error('Contexto cambiado');
      const bundle=normal(await m.storage.read());
      if(active!==m||!m.valid())throw Error('Contexto cambiado');
      let program={};try{program=normal(JSON.parse(bundle['spm-desire-program']||'{}'));}catch{program={};}
      program.detailNotes={...normal(program.detailNotes),[NOTE_KEY]:JSON.stringify(selectionState(m))};
      if(typeof apply==='function')apply(program);
      await m.storage.save({...bundle,'spm-desire-program':JSON.stringify(program)});
    };
    m.queue=m.queue.then(task,task);
    return m.queue;
  }
  function advance(m){
    if(!m.factor){status(m,'Selecciona qué suele favorecer tu deseo. Si aún no lo sabes, elige «Todavía no lo tengo claro».');return;}
    stopVoice(m);m.page=2;m.message='';render(m);schedule(m);m.host.querySelector('.spm-ds2-session')?.scrollIntoView?.({block:'start',behavior:'instant'});
  }
  async function returnToday(m){
    if(m.busy)return;stopVoice(m);clearTimeout(m.pending);
    m.busy=true;
    try{await saveTx(m);m.onBack?.();}catch{status(m,'No fue posible guardar tus respuestas. Puedes reintentar sin perder la selección.');}finally{m.busy=false;}
  }
  function completedSession(program){return (Array.isArray(program.sessions)?program.sessions:[]).find(s=>s&&s.day===DAY&&s.practiceId==='pattern-observe'&&s.status==='completed');}
  function updateProgram(m,program){
    // Un registro antiguo ya completado no se duplica ni se sobrescribe.
    const prior=completedSession(program),date=new Date().toISOString();
    if(!prior){
      const list=Array.isArray(program.sessions)?program.sessions:[];
      const id='pattern-observe-d2-touch-v1';
      const session={id,day:DAY,date:date.slice(0,10),practiceId:'pattern-observe',variant:'solo',status:'completed',activeSec:0,metricKey:'desire',metricLabel:'Interés hoy (0–10)',before:null,after:null,
        reflection:`Reconozco como facilitador: ${keyOf(FACILITATORS,m.factor)?.label}. Hoy elijo: ${keyOf(PLANS,m.plan)?.label}.`};
      const idx=list.findIndex(s=>s?.id===id);
      program.sessions=idx<0?[...list,session]:list.map((s,i)=>i===idx?session:s);
    }
    program.dayDone={...normal(program.dayDone),[String(DAY)]:normal(program.dayDone)[DAY]||date};
    // NO se inventan valores 0–10 del mapa de influencia clínico.
  }
  async function complete(m){
    if(m.busy)return;
    if(!m.factor){status(m,'Antes de finalizar, elige un factor en la primera pantalla.');return;}
    if(!m.plan){status(m,'Selecciona qué quieres intentar hoy.');return;}
    clearTimeout(m.pending);stopVoice(m);
    m.busy=true;status(m,'Guardando las dos respuestas en tu programa…');
    try{
      m.completed=true;
      await saveTx(m,program=>updateProgram(m,program));
      await m.onCompleted?.({day:DAY,confirmed:true,source:'desire-lab',desireDay2TouchVersion:1,facilitator:m.factor,plannedAction:m.plan});
      m.message='Práctica guardada ✓';
      m.onBack?.();
    }catch{m.completed=false;status(m,'No fue posible finalizar el registro. Tus elecciones se conservan; puedes reintentar.');}
    finally{m.busy=false;}
  }
  function delegate(m,event){
    const b=event.target.closest?.('[data-ds2-action]');
    if(!b||!m.host.contains(b)||active!==m||!m.valid()||m.busy)return;
    const act=b.dataset.ds2Action,val=b.dataset.ds2Value;
    if(act==='audio'){speak(m,`guide-${m.page}`,GUIDE[m.page]);return;}
    if(act==='choose'){
      const list=m.page===1?FACILITATORS:PLANS;
      const picked=keyOf(list,val);if(!picked)return;
      if(m.page===1)m.factor=val;else m.plan=val;
      m.message='';render(m);schedule(m);
      speak(m,`${m.page}:${val}`,picked.speech);return;
    }
    if(act==='next'){advance(m);return;}
    if(act==='back'){if(m.page===1)void returnToday(m);else{stopVoice(m);m.page=1;m.message='';render(m);schedule(m);}return;}
    if(act==='exit'){void returnToday(m);return;}
    if(act==='save'){void complete(m);return;}
  }
  async function mount({host,storage,valid=()=>true,onBack=()=>{},onCompleted=()=>{},images=IMAGES,reset=false}={}){
    if(!host?.isConnected||!storage||typeof storage.read!=='function'||typeof storage.save!=='function')return false;
    stop();
    const m={host,storage,valid,onBack,onCompleted,images,page:1,factor:null,plan:null,completed:false,pending:null,queue:Promise.resolve(),busy:false,speaking:null,message:'',events:new AbortController()};
    active=m;host.innerHTML='<p role="status">Recuperando tus respuestas del Día 2…</p>';
    try{
      const bundle=normal(await storage.read());
      if(active!==m||!valid())return false;
      let program={};try{program=normal(JSON.parse(bundle['spm-desire-program']||'{}'));}catch{}
      let saved={};if(!reset)try{saved=normal(JSON.parse(normal(program.detailNotes)[NOTE_KEY]||'{}'));}catch{}
      m.factor=keyOf(FACILITATORS,saved.factor)?.id||null;
      m.plan=keyOf(PLANS,saved.plan)?.id||null;
      m.completed=saved.completed===true||!!completedSession(program);
      m.page=m.completed&&m.plan?2:saved.page===2&&m.factor?2:1;
      render(m);
      host.addEventListener('click',e=>delegate(m,e),{signal:m.events.signal});
      window.addEventListener('pagehide',()=>stopVoice(m),{signal:m.events.signal});
      document.addEventListener('visibilitychange',()=>{if(document.hidden)stopVoice(m);},{signal:m.events.signal});
      window.addEventListener('spm:session-change',()=>{if(!m.valid())stop();},{signal:m.events.signal});
      return true;
    }catch{if(active===m)host.innerHTML='<p role="alert">No pudimos recuperar tu progreso. Inténtalo nuevamente desde Actividades de hoy; tus respuestas previas se conservan.</p>';return false;}
  }
  function stop(){const m=active;active=null;if(!m)return;clearTimeout(m.pending);stopVoice(m);m.events.abort();}
  function pause(){if(active)stopVoice(active);}
  window.SPM_DESIRE_DAY2_TOUCH={mount,stop,pause,images:IMAGES.slice(),factors:FACILITATORS.map(x=>x.id),plans:PLANS.map(x=>x.id),curriculum:'pattern-observe',audio:'voz estándar del dispositivo; guía aprobada adaptada a las dos pantallas'};
})();
