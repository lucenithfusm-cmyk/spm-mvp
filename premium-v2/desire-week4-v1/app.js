/* SPM Digital Wellness — Deseo, semana 4. Original screens with real controls. */
(() => {
  'use strict';
  const $ = (q, el = document) => el.querySelector(q);
  const C = window.SPM_WEEK4_CORE;
  const {DAYS, IDS} = C;
  const catalog = window.SPM_WEEK4_CATALOG || {practices:{},continuityGoals:[]};
  const PRACTICES = catalog.practices;
  const GOALS = catalog.continuityGoals || [];
  const STORE = 'spm-desire-week4-tactile-preview-v1';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const now = () => new Date().toISOString();
  const app = $('#app'), overlay = $('#resourceOverlay'), toast = $('#toast');
  const query = new URLSearchParams(location.search);
  const CENTRAL = query.get('spm') === 'central', ASSIGNED = Number(query.get('day')), SID = query.get('sid') || '';
  const VALID = !CENTRAL || (window.parent !== window && DAYS.includes(ASSIGNED) && SID.length > 8);
  let day = CENTRAL ? ASSIGNED : Number(query.get('dia')) || 0;
  if (!DAYS.includes(day)) day = 0;
  let sessions = Object.fromEntries(DAYS.map(d => [d, C.fresh(d)])), archive = [];
  let program = {continuity:{goals:[],keep:'',space:''},conditions:[],routineStep:0,details:{},detailNotes:{},ranking:[],actions:[],context:''};
  let state = {checkins:[],actions:[]}, safety = {acute:false,review:false,pressure:null};
  let day22Candidates = [], assignedPractice = null, sourceReady = false, centralReady = !CENTRAL;
  let screens = {}, currentScreen = null, pending = '', initTimer = 0, replyTimer = 0, toastTimer = 0, timer = 0, modalType = '', storageWarning = false;
  let speechControl = '', modalReturn = null, lastFocused = null, resourceOpen = false;
  const touched = new Set();
  const post = (type, fields = {}) => { if (CENTRAL && VALID) window.parent.postMessage({type,sid:SID,day:ASSIGNED,...fields}, location.origin); };
  const payload = () => ({record:sessions[ASSIGNED],program,programChanged:[...touched]});
  function notify(message, bad = false) { toast.textContent = message; toast.dataset.bad = bad ? '1' : '0'; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 4200); }
  if (!CENTRAL) {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (saved?.version === 1) {
        for (const d of DAYS) if (saved.sessions?.[d]) sessions[d] = C.recordFrom(d,saved.sessions[d]);
        archive = Array.isArray(saved.archive) ? saved.archive : [];
        program = {...program,...saved.program,continuity:{...program.continuity,...saved.program?.continuity}};
      }
    } catch {}
  }
  function persist() {
    if (CENTRAL) { if (centralReady && !pending && !resourceOpen) post('SPM_WEEK4_CHANGE', payload()); return; }
    try { localStorage.setItem(STORE,JSON.stringify({version:1,sessions,archive,program})); }
    catch { if (!storageWarning) { storageWarning = true; notify('Esta revisión conserva el avance mientras esté abierta. El navegador no permite guardarlo en el dispositivo.',true); } }
  }
  function changed() { if (!day) return; sessions[day].hasStarted = true; sessions[day].updatedAt = now(); persist(); }
  function programChanged(key) { touched.add(key); changed(); }
  function syncReflection(s) { if (s.reflectionSource !== 'manual') s.fields.reflection = C.composeReflection(s); }
  function stopSpeech() { try { window.speechSynthesis?.cancel(); } catch {} speechControl = ''; document.querySelectorAll?.('.speaking').forEach(el=>el.classList.remove('speaking')); }
  function speak(text, id = '') {
    stopSpeech(); if (!text) return;
    if (!('speechSynthesis' in window)) { openText(text); return; }
    try {
      const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'es-CO'; utterance.rate = .97; utterance.pitch = 1;
      const voices = speechSynthesis.getVoices(); utterance.voice = voices.find(v=>v.lang === 'es-CO') || voices.find(v=>v.lang.startsWith('es')) || null;
      speechControl = id; const button = id ? $(`[data-control="${id}"]`) : null; button?.classList.add('speaking');
      utterance.onend = utterance.onerror = () => { button?.classList.remove('speaking'); if (speechControl === id) speechControl = ''; };
      speechSynthesis.speak(utterance);
    } catch { notify('La voz no está disponible. Puedes abrir el texto de la guía.',true); }
  }
  const AUDIO = {
    d22_01:'Repetir una experiencia permite observar si sigue siendo útil en el contexto de hoy.',
    d22_02:'Abre las prácticas propuestas a partir de tus registros. Si todavía faltan datos, sigue la práctica asignada y observa cómo te resulta.',
    d22_02a:'Si todavía faltan datos, sigue la práctica asignada y observa cómo te resulta.',
    d22_03:'Sigue la guía de la práctica que elegiste. Al terminar, registra tu experiencia en esa misma ficha.',
    d23_01:'Una frase más flexible deja espacio para elegir cómo quieres vivir la intimidad hoy.',
    d24_02:'Piensa cómo te sientes hoy respecto al deseo y la curiosidad. Puedes valorar cada aspecto o dejar en N/A lo que no puedas responder.',
    d24_03:'Ahora observa tu apertura a explorar y el disfrute. Puedes valorar cada aspecto o dejar en N/A lo que no puedas responder.',
    d24_04:'Observa la presión y la conexión. En Tu reflexión puedes anotar qué situaciones acompañaron un cambio, como descanso, privacidad, cercanía o distracciones.',
    d25_01:'Tener una alternativa pensada puede ayudarte a adaptar la práctica cuando cambien tus circunstancias.',
    d25_03:'Prepara una alternativa para el interés bajo: si hoy no me apetece explorar, entonces… Por ejemplo, elegiré descanso o una conversación que sí me apetezca.',
    d26_01:'También puedes elegir continuar con una práctica que ya te resulta útil.',
    d27_01:'Puedes usar lo que has probado y adaptar la experiencia a cómo estás hoy.',
    d27_02:'Elige un estímulo que hayas probado y una condición que te ayude a estar cómodo, como privacidad o tiempo sin interrupciones. Puedes consultar Detalles por canal y Condiciones y rutina previa.'
  };
  function narration(screen) { return AUDIO[screen.id] || screen.content.audioText || ''; }
  const elapsed = s => Math.max(0,Math.floor(s.elapsed + (s.running ? (Date.now()-s.lastTick)/1000 : 0)));
  const clockText = n => `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
  function updateClocks() { document.querySelectorAll?.('[data-clock]').forEach(el => el.textContent = clockText(elapsed(sessions[day]))); }
  function pause(save = true) { clearInterval(timer); timer = 0; for (const d of DAYS) { const s = sessions[d]; if (s.running) { s.elapsed += Math.max(0,(Date.now()-s.lastTick)/1000); s.running = false; s.lastTick = 0; s.updatedAt = now(); } } updateClocks(); if (save) persist(); }
  function startClock() { const s=sessions[day]; if (s.running) return; s.running=true;s.lastTick=Date.now();changed();timer=setInterval(updateClocks,400);updateClocks(); }
  function rows() { return C.sessionRows(archive,sessions); }
  function eligible(p) { if (!p || safety.acute || safety.review && !p.safe) return false; if(p.id==='reconnect-gradual' && program.hasPartner!=='yes') return false; if(p.id==='sensate-2') return CENTRAL && typeof safety.phase2Allowed==='boolean' ? safety.phase2Allowed : !safety.review && typeof safety.pressure==='number' && safety.pressure<7 && rows().some(s=>s.practiceId==='sensate-1'&&s.status==='completed'&&s.comfortable===true); return true; }
  function candidates() { if (CENTRAL) return day22Candidates.filter(eligible).slice(0,2); return C.bestIds(rows(),PRACTICES,eligible).map(id=>PRACTICES[id]); }
  function assigned() { if(CENTRAL) return assignedPractice && eligible(assignedPractice) ? assignedPractice : null; return candidates()[0] || (eligible(PRACTICES['responsive-window'])?PRACTICES['responsive-window']:eligible(PRACTICES['presence-5'])?PRACTICES['presence-5']:null); }
  function activePractice() { const id=sessions[22].practiceId; return [...candidates(),assigned()].find(p=>p?.id===id) || (eligible(PRACTICES[id])?PRACTICES[id]:null); }
  function comparisonAvailable() { const base=program.baseline?.metrics; const latest=[...(state.checkins||[])].filter(x=>x.day==='D14'||x.day==='D28').sort((a,b)=>String(a.date).localeCompare(String(b.date))).pop(); return Boolean(base && latest?.metrics && Object.keys(base).some(k=>typeof base[k]==='number'&&typeof latest.metrics[k]==='number')); }
  function screenFor(d, step) { let id=`d${d}_${String(step).padStart(2,'0')}`; if(d===22&&step===2&&!candidates().length)id='d22_02a';if(d===24&&step===1&&!rows().length)id='d24_01a';if(d===28&&step===2&&!comparisonAvailable())id='d28_02a';return screens[id]; }
  function showHome() { if(CENTRAL){closeCentral();return;}pause();stopSpeech();closeModal(false);day=0;currentScreen=null;app.innerHTML=`<section class="hero"><span class="logo">SPM <small>DIGITAL WELLNESS</small></span><span class="heading-tag">Deseo · Semana 4</span><h1>Lo aprendido continúa contigo</h1><p>Días 22 al 28. Explora cada práctica, escucha sus pasos y elige cómo continuar.</p></section><section class="days">${DAYS.map(d=>`<button class="day-card" data-day="${d}"><img src="${screens[`d${d}_01`].file}" alt="" loading="lazy" width="72" height="105"><span><strong>Día ${d} · ${esc(screens[`d${d}_01`].title)}</strong><small>${sessions[d].status==='completed'?'Actividad realizada y registrada':sessions[d].hasStarted?'Continuar mi práctica':'Abrir práctica'}</small></span><span aria-hidden="true">›</span></button>`).join('')}</section><p class="disclaimer">Vista de revisión. Tus pruebas quedan en este navegador, separadas de las cuentas de pacientes.</p>`;try{history.replaceState(null,'',location.pathname);}catch{}window.scrollTo({top:0,behavior:'instant'}); }
  function go(d) { if(!DAYS.includes(d)||CENTRAL&&d!==ASSIGNED)return;pause();stopSpeech();day=d;render();if(!CENTRAL)try{history.replaceState(null,'',location.pathname+'?dia='+d);}catch{} }
  function shape(c) {
    const n=c.normalized,{top,bottom,left,right}=C.hitGeometry(c,currentScreen?.controls||[],window.innerWidth||390);
    return `left:${n.x*100}%;top:${n.y*100}%;width:${n.width*100}%;height:${n.height*100}%;--hit-top:${-top/n.height*100}%;--hit-bottom:${-bottom/n.height*100}%;--hit-left:${-left/n.width*100}%;--hit-right:${-right/n.width*100}%;`;
  }
  function fieldValue(id,s) { if(id==='continuity_keep')return program.continuity.keep;if(id==='continuity_space')return program.continuity.space;return s.fields[id]||''; }
  function fieldSpec(id) { return currentScreen?.content.blocks?.find(b=>b.type==='field'&&b.id===id); }
  function dynamicText(id,s) {
    if(id==='flexible_phrase')return s.fields.flexible_phrase||'Escribe tu alternativa en la pantalla anterior.';
    if(id==='best_practices')return candidates().map(p=>`<button class="proposal ${s.practiceId===p.id?'chosen':''}" data-practice="${esc(p.id)}" aria-pressed="${s.practiceId===p.id}">${esc(p.title)}</button>`).join('');
    if(id==='assigned_practice')return esc(assigned()?.title||'No hay una práctica disponible en este momento.');
    if(id==='active_practice')return esc(activePractice()?.title||'Elige primero una práctica.');
    if(id==='real_session')return esc(s.runnerCompleted?activePractice()?.title||'Tu práctica registrada':'Completa y confirma la ficha de tu práctica.');
    if(id==='real_history')return esc(rows().length?`${rows().length} registro${rows().length===1?'':'s'} guardado${rows().length===1?'':'s'}. Abre Progreso para revisarlos.`:'Aún no hay registros guardados.');
    return '';
  }
  function controlMarkup(c,s) {
    const style=shape(c),id=esc(c.id),label=esc(c.label),type=c.type;
    if(type==='text'){const spec=fieldSpec(c.id);return `<textarea class="spm-layer spm-text" style="${style}" data-control="${id}" maxlength="${spec?.maxLength||400}" aria-label="${label}" placeholder="${esc(spec?.placeholder||c.label)}">${esc(fieldValue(c.id,s))}</textarea>`;}
    if(type==='slider'){const key=C.metricKey(c.id),v=C.metricValue(s,key);return `<div class="spm-layer scale-box ${v===null?'unanswered':''}" style="${style}"><input type="range" min="0" max="10" step="1" value="${v??0}" data-control="${id}" aria-label="${label}" aria-valuetext="${v===null?'Sin responder':v+' de 10'}"><span class="scale-dot" ${v===null?'hidden':''} style="left:${(v??0)/10*92+4}%">${v??''}</span><span class="sr-only">${v===null?'Sin responder':v}</span></div>`;}
    if(type==='dynamic')return `<div class="spm-layer dynamic-value ${c.id==='best_practices'?'proposals':''}" style="${style}">${dynamicText(c.id,s)}</div>`;
    const choice=c.id.startsWith('continuity_goals-')?GOALS[Number(c.id.replace('continuity_goals-goal_',''))-1]:null;
    const active=type==='multi-choice'?program.continuity.goals.includes(choice):type==='radio'?s.choices.known_stimulus===(c.option||c.id.replace('known_stimulus-','')):type==='checkbox'?s.confirm:type==='nullable'?s.na[C.metricKey(c.id)]===true:false;
    return `<button type="button" class="spm-layer touch-target ${type} ${active?'selected':''}" data-control="${id}" style="${style}" aria-label="${label}" ${['radio','multi-choice','checkbox','nullable'].includes(type)?`aria-pressed="${active}"`:''}><span class="sr-only">${label}</span></button>`;
  }
  function clockOverlay(view) { const c=view.controls.find(x=>x.id==='timer-play');if(!c)return '';return `<div class="clock-tag" data-clock style="left:7%;top:${c.normalized.y*100+1}%;">${clockText(elapsed(sessions[day]))}</div>`; }
  function render(scroll=true) {
    if(!sourceReady||!centralReady)return;if(!day){showHome();return;}stopSpeech();const s=sessions[day];const view=screenFor(day,s.step);currentScreen=view;
    app.innerHTML=`<div class="statusbar"><button class="circle" data-action="home" aria-label="${CENTRAL?'Guardar y volver a Hoy':'Volver a los días'}">‹</button><span><b>SPM</b> DIGITAL WELLNESS</span><span class="daypill">Día ${day} · Deseo</span></div><div class="meta"><span>Pantalla ${s.step} de 4</span><span>${s.status==='completed'?'Realizada':'A tu ritmo'}</span></div><div class="portrait" data-screen="${view.id}"><img class="backdrop" src="${view.file}" alt="${esc(view.title)}" draggable="false" width="1080" height="1920">${view.controls.map(c=>controlMarkup(c,s)).join('')}${clockOverlay(view)}</div><section class="screen-footer"><div class="steps" aria-label="Pantalla ${s.step} de 4">${[1,2,3,4].map(n=>`<span class="${n===s.step?'on':''}"></span>`).join('')}</div><div class="quick"><button data-action="back">‹ Anterior</button><button data-action="speak">🔊 Guía</button><button data-action="next">${s.step===4?'Guardar':'Siguiente ›'}</button></div>${day===28&&s.step<=2?'<button class="resource-shortcut" data-resource="progress28">Consultar mis registros de Deseo</button>':''}<div class="read-guide"><button data-action="guide-text">Leer este paso</button><button data-action="stop-audio">Detener audio</button></div>${s.step===4?`<p class="char-info" data-character-count>Reflexión: ${C.composeReflection(s).length} de 400 caracteres</p>`:'<p>Escucha cada paso cuando lo necesites.</p>'}${s.status==='completed'&&!CENTRAL?'<button class="resource-shortcut" data-action="new-attempt">Hacer una nueva práctica</button>':''}</section>`;
    if(scroll)window.scrollTo({top:0,behavior:'instant'});
  }
  function selectPractice(id) { const p=[...candidates(),assigned()].find(p=>p?.id===id);if(!p)return;const s=sessions[22];if(s.practiceId!==id&&(s.runnerStarted||s.runnerStep>0||s.runnerCompleted||s.confirm)){notify('Conservamos la práctica que ya abriste. Puedes elegir otra en un nuevo intento.',true);return;}s.practiceId=id;s.metricKey=p.metric;s.metricLabel=p.metricLabel;changed();render(false); }
  function advance(fromPrimary=false) {
    if(!day||pending||!centralReady||modalType)return;const s=sessions[day];
    if(s.step===4){complete();return;}
    if(day===22&&s.step===2){if(!s.practiceId){const list=candidates();if(list.length>1){notify('Elige cuál de tus propuestas quieres abrir.');return;}selectPractice((list[0]||assigned())?.id);}if(!activePractice()){notify('Ahora no hay una práctica apta disponible. Vuelve a Hoy para revisar tu ruta.',true);return;}s.step=3;changed();render();openRunner();return;}
    if(day===22&&s.step===3&&!s.runnerCompleted){openRunner();return;}
    if(day===28&&s.step===1&&fromPrimary){s.step=2;changed();render();openOfficialReport();return;}
    pause();s.step++;syncReflection(s);changed();render();
  }
  function back() { if(!day||pending)return;pause();if(sessions[day].step===1){showHome();return;}sessions[day].step--;changed();render(); }
  function complete() {
    const s=sessions[day];syncReflection(s);const error=C.reflectionError(s);if(error){notify(error,true);return;}
    if(day===22&&!s.runnerCompleted){openRunner();notify('Registra y confirma la práctica que realizaste antes de guardar el día.',true);return;}
    if(!s.confirm){notify('Marca “Realicé la actividad” para guardarla como completada. Puedes volver y conservar tu avance sin marcarla.',true);return;}
    if(day===22&&(!activePractice()||!eligible(activePractice()))){notify('Tu práctica debe revisarse antes de continuar.',true);return;}
    pause();s.status='completed';s.updatedAt=s.completedAt=now();s.reflection=s.fields.reflection||'';
    if(CENTRAL){waitReply('complete','SPM_WEEK4_COMPLETE');return;}changed();notify('Actividad guardada en tu revisión.');showHome();
  }
  function waitReply(kind,type,extra={}) { pending=kind;clearTimeout(replyTimer);post(type,{...payload(),...extra});notify(kind==='complete'?'Guardando tu actividad en SPM…':'Guardando tu avance…');replyTimer=setTimeout(()=>{if(!pending)return;pending='';if(sessions[ASSIGNED].status==='completed'){sessions[ASSIGNED].status='draft';sessions[ASSIGNED].completedAt=null;}notify('No pudimos confirmar el guardado. Tu avance sigue aquí; puedes reintentar.',true);},15000); }
  function closeCentral() { if(!centralReady||pending)return;pause();stopSpeech();waitReply('close','SPM_WEEK4_CLOSE'); }
  function newAttempt() { if(CENTRAL||!day)return;pause();const previous=sessions[day];if(previous.hasStarted||previous.status==='completed')archive.push({...previous,status:previous.status==='completed'?'completed':'interrupted',running:false});sessions[day]=C.fresh(day);persist();render(); }
  function metricChanged(el) { const s=sessions[day],key=C.metricKey(el.dataset.control);C.setMetric(s,key,Number(el.value));s.na[key]=false;const box=el.closest('.scale-box'),dot=box?.querySelector('.scale-dot');if(dot){dot.hidden=false;dot.style.left=`${Number(el.value)/10*92+4}%`;dot.textContent=el.value;}el.setAttribute?.('aria-valuetext',el.value+' de 10');changed(); }
  function textChanged(el) { const s=sessions[day],id=el.dataset.control;if(id==='continuity_keep'||id==='continuity_space'){program.continuity[id==='continuity_keep'?'keep':'space']=el.value;touched.add('continuity');}else{s.fields[id]=el.value;if(id==='reflection')s.reflectionSource='manual';else syncReflection(s);}const count=$('[data-character-count]');if(count)count.textContent=`Reflexión: ${C.composeReflection(s).length} de 400 caracteres`;changed(); }
  function screenControl(id) {
    const c=currentScreen.controls.find(x=>x.id===id);if(!c)return;const s=sessions[day];
    if(c.type==='audio'){speak(narration(currentScreen),id);return;}
    if(c.type==='audio-explanation'||c.type==='step-audio'){speak(c.audioText||c.label,id);return;}
    if(c.type==='resource'){openResource(c.target,c.label);return;}
    if(c.type==='navigation'){if(c.id==='back')back();else advance(true);return;}
    if(c.type==='nullable'){const key=C.metricKey(id);C.setMetric(s,key,null);s.na[key]=true;changed();render(false);return;}
    if(c.type==='checkbox'){s.confirm=!s.confirm;changed();render(false);return;}
    if(c.type==='multi-choice'){const value=GOALS[Number(id.replace('continuity_goals-goal_',''))-1];toggleGoal(value);render(false);return;}
    if(c.type==='radio'){s.choices.known_stimulus=c.option||id.replace('known_stimulus-','');syncReflection(s);changed();render(false);return;}
    if(c.type==='timer'){if(id==='timer-play')startClock();else if(id==='timer-reset'){pause(false);s.elapsed=0;changed();updateClocks();}else pause();return;}
  }
  function toggleGoal(value) { if(!GOALS.includes(value))return;const goals=program.continuity.goals;if(goals.includes(value))program.continuity.goals=goals.filter(x=>x!==value);else if(goals.length<2)goals.push(value);else {notify('Puedes elegir hasta dos objetivos. Desmarca uno si quieres cambiarlo.');return;}sessions[day].choices.continuity_goals=[...program.continuity.goals];programChanged('continuity'); }
  function modal(title,html,type,remember=true) { pause();stopSpeech();if(remember)lastFocused=document.activeElement;modalType=type;overlay.hidden=false;overlay.innerHTML=`<section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><button class="close" data-modal-action="close" aria-label="Volver a la práctica">×</button><header class="modal-head"><strong>SPM · DESEO</strong><h2 id="modalTitle">${esc(title)}</h2></header><div class="modal-content">${html}</div><button class="return" data-modal-action="close">Volver a la práctica</button></section>`;$('.close',overlay)?.focus(); }
  function closeModal(refresh=true) { if(!modalType)return;pause();stopSpeech();modalType='';modalReturn=null;overlay.hidden=true;overlay.innerHTML='';if(refresh&&day)render(false);lastFocused?.focus?.(); }
  function openText(text) { modal('Guía de este paso',`<p class="guide-transcript">${esc(text)}</p>`,'guide'); }
  const CONDITIONS=['Menos presión','Más tiempo','Mejor descanso','Más conexión','Menos distracciones'];
  const ROUTINE=[['Soltar presión','Nota si aparece una exigencia, como «tengo que sentir deseo». Reconócela y vuelve la atención a cómo estás ahora.'],['Respirar cómodo','Deja caer los hombros y afloja la mandíbula. Respira con naturalidad y suelta el aire despacio, sin forzar el ritmo.'],['Elegir conexión','Presta atención a una sensación agradable: el apoyo del cuerpo, el contacto de tus manos o un sonido suave. Vuelve a ella cuando te distraigas.']];
  const DETAILS=[['visual','Ver',['Miradas','Ropa','Luz','Actitud','Escenas']],['tactile','Tocar',['Caricias lentas','Masajes','Contacto piel con piel','Zonas','Ritmo','Presión']],['verbal','Escuchar / que te hablen',['Elogios','Tono de voz','Susurros','Conversación','Palabras sugerentes']],['fantasy','Fantasías',['Recuerdos','Escenas imaginadas','Lecturas','Novedad imaginada']],['context','Contexto',['Privacidad','Sin interrupciones','Cambio de ambiente','Juego previo largo']],['partnerFavors','Qué favorece a mi pareja',['Atención plena','Iniciativa','Comunicación abierta']]];
  const STRATEGIES=[['Salud física','Sueño, nutrición y movimiento según tu hábito o recurso SPM. Sin dosis universal.'],['Manejo del estrés','Rutina de respiración y microregulación antes de la intimidad.'],['Estímulos','Usa tu lista de excitación ordenada.'],['Juego previo','Más tiempo, ritmo flexible.'],['Comunicar deseos','Una frase en primera persona.'],['Romper rutina','Cambia un elemento pequeño.'],['Ambiente','Privacidad, luz, sin pantallas.'],['Atención a sensaciones','Volver al cuerpo cuando la mente se va.']];
  const ACTIONS=[['stress','Reducir estrés / mejorar sueño'],['stimuli','Incorporar nuevos estímulos'],['talk','Hablar con mi pareja'],['foreplay','Más tiempo de juego previo'],['fantasy','Explorar fantasías'],['food','Mejorar alimentación'],['exercise','Realizar actividad física'],['context','Crear contexto favorable'],['other','Otra acción']];
  const choiceButton=(kind,value,label,selected)=>`<button class="resource-choice ${selected?'chosen':''}" data-resource-choice="${kind}" data-value="${esc(value)}" aria-pressed="${selected}">${esc(label)}${selected?' ✓':''}</button>`;
  const resourceField=(key,label,value,max=300)=>`<label>${esc(label)}<textarea data-resource-field="${key}" maxlength="${max}">${esc(value||'')}</textarea></label>`;
  function historyMarkup() { return rows().length ? rows().map(s=>`<article class="logline"><strong>Día ${s.day} · ${esc(PRACTICES[s.practiceId]?.title||s.practiceId)}</strong><small>${esc(s.date||String(s.completedAt||s.updatedAt||'').slice(0,10))} · ${s.status==='completed'?'Realizada':s.status==='interrupted'?'Interrumpida':'En pausa'}</small>${s.practiceId==='desire-curve'&&s.extra?`<p>${C.EXTRA.map(k=>`${({desire:'Deseo',curiosity:'Curiosidad',openness:'Apertura',enjoyment:'Disfrute',pressure:'Presión',connection:'Conexión'})[k]}: ${s.extra[k]??'N/A'}`).join(' · ')}</p>`:`<p>${esc(s.metricLabel||PRACTICES[s.practiceId]?.metricLabel||'Registro')}: ${s.before??'N/A'} → ${s.after??s.localAfter??'N/A'}</p>`}${s.reflection||s.fields?.reflection?`<p>${esc(s.reflection||s.fields.reflection)}</p>`:''}</article>`).join(''):'<p>Aún no hay registros para mostrar. Puedes continuar con lo que recuerdes de tu experiencia.</p>'; }
  function comparisonMarkup() { const base=program.baseline?.metrics;const latest=[...(state.checkins||[])].filter(x=>x.day!=='D0').sort((a,b)=>String(a.date).localeCompare(String(b.date))).pop();if(!comparisonAvailable())return '<p>No hay datos suficientes para comparar el inicio con otro registro de Deseo. Tus experiencias siguen siendo útiles para elegir cómo continuar.</p>';const labels={desire:'Deseo',frequency:'Frecuencia mensual',fantasies:'Fantasías',erections:'Erecciones',energy:'Energía',closeness:'Cercanía',satisfaction:'Satisfacción',pressure:'Presión'};return `<p>Registros internos de Deseo. La evaluación oficial se consulta en SPM Central.</p><table class="comparison"><thead><tr><th>Aspecto</th><th>Inicio</th><th>${esc(latest.day)}</th></tr></thead><tbody>${Object.entries(labels).map(([k,label])=>`<tr><th>${label}</th><td>${base[k]??'N/A'}</td><td>${latest.metrics[k]??'N/A'}</td></tr>`).join('')}</tbody></table>`; }
  function openResource(target,label='') {
    if(target==='host:returnToToday'){openOfficialReport();return;}
    const previous=modalType==='runner'?'runner':null;let body='',title=label||target;
    if(target==='progress28'||target==='progress'){title='Progreso 28 días';body=historyMarkup();}
    else if(target==='s:17'){title='Inicio y actual';body=comparisonMarkup();}
    else if(target==='s:18'){title='Tu sexualidad también evoluciona';body='<h3>Antes</h3><p>Podía bastar menos estímulo para sentir ganas.</p><h3>Ahora</h3><p>Puede hacer falta más contexto, tiempo o estimulación.</p><p>Eso no equivale automáticamente a perder el deseo. Aprender a adaptarte evita interpretar cambios normales como una pérdida total.</p><blockquote>Adaptarte no es rendirte; es aprender cómo responde tu deseo hoy.</blockquote><button class="resource-choice" data-resource-speech="evolve">🔊 Sigue cultivándolo</button>';}
    else if(target==='r:strategies'){title='Estrategias para facilitar el deseo';body=STRATEGIES.map(([t,d],i)=>`<article class="logline"><h3>${t}</h3><p>${d}</p><button class="resource-choice" data-strategy-audio="${i}">🔊 Escuchar</button></article>`).join('');}
    else if(target==='r:continuity'){title='Objetivos de continuidad';body=`<p>Elige hasta dos acciones que quieras mantener o explorar.</p>${GOALS.map(x=>choiceButton('goal',x,x,program.continuity.goals.includes(x))).join('')}<p>${program.continuity.goals.length}/2 elegidos</p>${resourceField('continuity.keep','Qué mantener',program.continuity.keep)}${resourceField('continuity.space','Qué espaciar',program.continuity.space)}<button class="resource-choice" data-resource="s:16">Ver mi plan personal de tres acciones</button>`;}
    else if(target==='s:16'){title='Mi plan personal';body=`<p>Elige hasta tres acciones para las próximas semanas. Este plan es independiente de tus dos objetivos de continuidad.</p>${ACTIONS.map(([id,l])=>choiceButton('action',id,l,program.actions.includes(id))).join('')}<p>${program.actions.length}/3 seleccionadas</p>`;}
    else if(target==='r:conditions'){title='Condiciones y rutina previa';body=`<p>Marca las condiciones que te gustaría cuidar.</p>${CONDITIONS.map(x=>choiceButton('condition',x,x,program.conditions.includes(x))).join('')}<h3>Rutina previa</h3>${ROUTINE.map(([t,d],i)=>`<article class="logline"><strong>${i+1}. ${t}${i<program.routineStep?' ✓':''}</strong><p>${d}</p><button class="resource-choice" data-routine-audio="${i}">🔊 Escuchar este paso</button></article>`).join('')}<button class="resource-choice" data-modal-action="routine-next">${program.routineStep>=3?'Rutina recorrida':program.routineStep<2?'Ya hice este paso · Siguiente':'Terminar la rutina'}</button><button class="resource-choice" data-modal-action="routine-reset">Reiniciar rutina</button>`;}
    else if(target==='r:details'){title='Detalles por canal';body='<p>Marca los detalles que favorecen tu deseo y añade los tuyos.</p>'+DETAILS.filter(([k])=>k!=='partnerFavors'||program.hasPartner==='yes').map(([k,l,options])=>`<article class="logline"><h3>${l}</h3>${options.map(x=>choiceButton('detail:'+k,x,x,(program.details[k]||[]).includes(x))).join('')}${resourceField('detailNotes.'+k,'Propio / otros detalles',program.detailNotes[k],400)}</article>`).join('');}
    else if(target==='context'){title='Mi contexto favorable';body=resourceField('context','Contexto en el que te sientes más receptivo',program.context,140);}
    else {title=label||'Recurso de tu práctica';body=`<p>Este recurso forma parte del laboratorio de Deseo. Tu práctica y su avance se conservan al consultarlo.</p>${CENTRAL?`<button class="resource-choice" data-host-resource="${esc(target)}">Abrir el recurso en mi programa</button>`:'<p>En esta vista independiente puedes revisar los pasos completos de la ficha. El recurso personal se abre desde tu actividad en SPM Central.</p>'}`;}
    modal(title,body,target);modalReturn=previous;
  }
  function openOfficialReport() { if(CENTRAL){pause();stopSpeech();waitReply('report','SPM_WEEK4_EXIT_TO_TODAY',{reason:'report'});return;}modal('Mi informe en SPM','<p>El informe oficial reúne la información disponible en tu cuenta, aunque falten evaluaciones.</p><p>En esta revisión no hay una cuenta de paciente conectada. Al abrir el día 28 desde SPM Central podrás volver a Hoy y consultar «Mi informe final y evaluación opcional».</p><p>Puedes continuar ahora con tus registros y observaciones de esta revisión.</p>','report'); }
  function metricField(key,label,value,metric='desire') { if(metric==='fantasies')return `<label>${esc(label)}<select data-runner-metric="${key}"><option value="">N/A / sin responder</option>${['Nunca','Rara vez','A veces','Frecuente','Muy frecuente'].map((x,i)=>`<option value="${i}" ${value===i?'selected':''}>${x}</option>`).join('')}</select></label>`;if(metric==='frequency')return `<label>${esc(label)} · veces al mes<input type="number" data-runner-metric="${key}" min="0" max="60" step="any" value="${value??''}" placeholder="N/A"></label>`;return `<div class="runner-metric"><label>${esc(label)} <output>${value??'N/A'}</output><input type="range" min="0" max="10" step="1" value="${value??0}" data-runner-metric="${key}" aria-valuetext="${value===null?'Sin responder':value+' de 10'}"></label><button class="resource-choice" data-runner-na="${key}">N/A / omitir</button></div>`; }
  function openRunner() {
    const s=sessions[22],p=activePractice();if(!p){notify('Primero elige una práctica disponible.',true);return;}if(!eligible(p)){notify('Esta práctica no está disponible según tu estado actual.',true);return;}
    if(p.id==='reconnect-gradual')s.variant='partner';s.runnerStarted=true;s.metricKey=p.metric;s.metricLabel=p.metricLabel;const n=Math.max(0,Math.min(p.steps.length+1,Number(s.runnerStep)||0));s.runnerStep=n;changed();
    let body=`<p class="runner-scope">${esc(p.duration)} · duración orientativa</p>`;
    if(n===0){body+=`${p.purpose?`<p>${esc(p.purpose)}</p>`:''}${p.prep?`<p>${esc(p.prep)}</p>`:''}${p.note?`<p>${esc(p.note)}</p>`:''}<div class="runner-variant">${p.id==='reconnect-gradual'?'':choiceButton('variant','solo','Individual',s.variant==='solo')}${choiceButton('variant','partner','Con pareja',s.variant==='partner')}</div>${s.variant==='partner'?'<label class="runner-check"><input type="checkbox" data-runner-check="partnerConsent" '+(s.partnerConsent?'checked':'')+'> Ambos queremos participar y podemos parar cuando lo necesitemos.</label>':''}${p.id==='sensate-2'?'<label class="runner-check"><input type="checkbox" data-runner-check="ready" '+(s.ready?'checked':'')+'> Hoy quiero ampliar y sé que puedo parar.</label>':''}${metricField('before',p.metricLabel+' · antes',s.before,p.metric)}<button class="resource-choice primary-resource" data-modal-action="runner-next">Comenzar los pasos</button>`;}
    else if(n<=p.steps.length){body+=`<p class="runner-step">Paso ${n} de ${p.steps.length}</p><p class="runner-instruction">${esc(p.steps[n-1])}</p><button class="resource-choice primary-resource" data-modal-action="runner-audio">🔊 Escuchar este paso</button><div class="runner-clock"><span data-clock>${clockText(elapsed(s))}</span><button data-modal-action="clock-play" aria-label="Iniciar cronómetro opcional">▶</button><button data-modal-action="clock-pause" aria-label="Pausar cronómetro">Ⅱ</button></div><div class="runner-nav"><button class="resource-choice" data-modal-action="runner-back">Anterior</button><button class="resource-choice primary-resource" data-modal-action="runner-next">${n===p.steps.length?'Ya terminé · Registrar':'Siguiente paso'}</button></div>`;}
    else {body+=`${metricField('after',p.metricLabel+' · después',s.after,p.metric)}${p.id.startsWith('sensate')?metricField('comfort','Comodidad',s.comfort)+`<fieldset><legend>¿La práctica fue cómoda?</legend>${choiceButton('comfortable','true','Sí',s.comfortableAnswered&&s.comfortable===true)}${choiceButton('comfortable','false','No',s.comfortableAnswered&&s.comfortable===false)}${choiceButton('comfortable','null','No puedo responder',s.comfortableAnswered&&s.comfortable===null)}</fieldset>`:''}${resourceField('runner.reflection','Tu reflexión (opcional)',s.fields.reflection,400)}<label class="runner-check"><input type="checkbox" data-runner-check="confirm" ${s.confirm?'checked':''}> Realicé la actividad</label><button class="resource-choice primary-resource" data-modal-action="runner-finish">Volver al cierre del día</button><button class="resource-choice" data-modal-action="runner-back">Volver a los pasos</button>`;}
    if(p.resourceLinks?.length)body+=`<h3>Recursos de esta práctica</h3>${p.resourceLinks.map(t=>`<button class="resource-choice" data-resource="${esc(t)}">${esc(resourceLabel(t))}</button>`).join('')}`;
    modal(p.title,body,'runner');
  }
  function resourceLabel(target) { return {'progress28':'Progreso 28 días','r:conditions':'Condiciones y rutina previa','r:details':'Detalles por canal','r:concepts':'Las dos formas del deseo','r:map':'Aceleradores y frenos','r:ideas':'Ideas para tu repertorio','r:partner':'Preferencias y acuerdos','r:strategies':'Estrategias','sensate':'Focalización sensorial','context':'Contexto favorable','s:7':'Zonas y estímulos','s:13':'Mapa personal','r:ladder':'Escalera de intimidad'}[target]||'Consultar recurso'; }
  function runnerNext() { const s=sessions[22],p=activePractice();if(!p)return;if(s.variant==='partner'&&!s.partnerConsent){notify('Confirma que ambos desean participar o elige la variante individual.',true);return;}if(p.id==='sensate-2'&&!s.ready){notify('Confirma si hoy quieres ampliar y sabes que puedes parar.',true);return;}pause();s.runnerStep=Math.min(p.steps.length+1,s.runnerStep+1);changed();openRunner(); }
  function modalAction(action) {
    if(action==='close'){const backToRunner=modalReturn==='runner';closeModal();if(backToRunner)openRunner();return;}
    if(action==='runner-next'){runnerNext();return;}
    if(action==='runner-back'){pause();sessions[22].runnerStep=Math.max(0,sessions[22].runnerStep-1);changed();openRunner();return;}
    if(action==='runner-audio'){speak(activePractice()?.steps[sessions[22].runnerStep-1]||'');return;}
    if(action==='runner-finish'){const s=sessions[22];if(!s.confirm){notify('Marca “Realicé la actividad” si ya la realizaste. Puedes volver sin marcarla para conservar tu avance.',true);return;}pause();s.runnerCompleted=true;s.step=4;changed();closeModal();render();return;}
    if(action==='clock-play'){startClock();return;}if(action==='clock-pause'){pause();return;}
    if(action==='routine-next'){program.routineStep=Math.min(3,(program.routineStep||0)+1);programChanged('routineStep');openResource('r:conditions');return;}
    if(action==='routine-reset'){program.routineStep=0;programChanged('routineStep');openResource('r:conditions');}
  }
  function resourceChoice(button) {
    const kind=button.dataset.resourceChoice,value=button.dataset.value,s=sessions[day];
    if(kind==='goal'){toggleGoal(value);openResource('r:continuity');return;}
    if(kind==='condition'){program.conditions=program.conditions.includes(value)?program.conditions.filter(x=>x!==value):[...program.conditions,value];programChanged('conditions');openResource('r:conditions');return;}
    if(kind==='action'){if(program.actions.includes(value))program.actions=program.actions.filter(x=>x!==value);else if(program.actions.length<3)program.actions.push(value);else{notify('Puedes elegir hasta tres acciones para tu plan personal.');return;}programChanged('actions');openResource('s:16');return;}
    if(kind.startsWith('detail:')){const key=kind.slice(7),values=program.details[key]||[];program.details[key]=values.includes(value)?values.filter(x=>x!==value):[...values,value];programChanged('details');openResource('r:details');return;}
    if(kind==='variant'){s.variant=value;if(value==='solo')s.partnerConsent=false;changed();openRunner();return;}
    if(kind==='comfortable'){s.comfortable=value==='null'?null:value==='true';s.comfortableAnswered=true;changed();openRunner();}
  }
  app.addEventListener('click', event => {
    const retry=event.target.closest('[data-action="retry"]');if(retry){if(CENTRAL)post('SPM_WEEK4_READY');else location.reload();return;}
    if(!sourceReady||!centralReady||pending)return;
    if(event.target.matches?.('input[type=range][data-control]')){metricChanged(event.target);return;}
    const action=event.target.closest('[data-action]');if(action){switch(action.dataset.action){case'home':showHome();break;case'back':back();break;case'next':advance();break;case'speak':speak(narration(currentScreen),'audio-guide');break;case'guide-text':openText(narration(currentScreen));break;case'stop-audio':stopSpeech();break;case'new-attempt':newAttempt();break;}return;}
    const card=event.target.closest('[data-day]');if(card){go(Number(card.dataset.day));return;}
    const practice=event.target.closest('[data-practice]');if(practice){selectPractice(practice.dataset.practice);return;}
    const resource=event.target.closest('[data-resource]');if(resource){openResource(resource.dataset.resource);return;}
    const control=event.target.closest('button[data-control]');if(control)screenControl(control.dataset.control);
  });
  app.addEventListener('input',event=>{if(pending||!centralReady||!day)return;if(event.target.matches('input[type=range][data-control]'))metricChanged(event.target);else if(event.target.matches('textarea[data-control]'))textChanged(event.target);});
  app.addEventListener('keyup',event=>{if(!pending&&day&&event.target.matches?.('input[type=range][data-control]')&&['Home','End','ArrowLeft','ArrowRight','ArrowDown','ArrowUp'].includes(event.key))metricChanged(event.target);});
  overlay.addEventListener('click',event=>{
    if(pending)return;const action=event.target.closest('[data-modal-action]');if(action){modalAction(action.dataset.modalAction);return;}
    const choice=event.target.closest('[data-resource-choice]');if(choice){resourceChoice(choice);return;}
    const resource=event.target.closest('[data-resource]');if(resource){openResource(resource.dataset.resource);return;}
    const strategy=event.target.closest('[data-strategy-audio]');if(strategy){speak(STRATEGIES[Number(strategy.dataset.strategyAudio)].join('. '));return;}
    const routine=event.target.closest('[data-routine-audio]');if(routine){speak(ROUTINE[Number(routine.dataset.routineAudio)].join('. '));return;}
    if(event.target.closest('[data-resource-speech="evolve"]')){speak('Tu deseo se transforma contigo. Lo que aprendiste aquí te acompaña en cada etapa.');return;}
    const na=event.target.closest('[data-runner-na]');if(na){sessions[22][na.dataset.runnerNa]=null;changed();openRunner();return;}
    const hostResource=event.target.closest('[data-host-resource]');if(hostResource){pause();waitReply('resource','SPM_WEEK4_OPEN_RESOURCE',{target:hostResource.dataset.hostResource});}
  });
  overlay.addEventListener('input',event=>{
    if(pending||!day)return;const el=event.target,s=sessions[day];
    if(el.dataset.runnerMetric){const p=activePractice(),max=el.dataset.runnerMetric==='comfort'?10:p?.max||10;const v=Number(el.value);s[el.dataset.runnerMetric]=el.value===''?null:p?.metric==='frequency'&&el.dataset.runnerMetric!=='comfort'?(Number.isFinite(v)&&v>=0&&v<=60?v:null):C.validNumber(v,max);el.closest('.runner-metric')?.querySelector('output')?.replaceChildren(document.createTextNode(String(s[el.dataset.runnerMetric]??'N/A')));changed();return;}
    if(el.dataset.runnerCheck){s[el.dataset.runnerCheck]=el.checked;changed();return;}
    if(el.dataset.resourceField){const key=el.dataset.resourceField;if(key==='runner.reflection'){s.fields.reflection=el.value;s.reflectionSource='manual';changed();return;}if(key.startsWith('continuity.')){program.continuity[key.slice(11)]=el.value;programChanged('continuity');}else if(key.startsWith('detailNotes.')){program.detailNotes[key.slice(12)]=el.value;programChanged('detailNotes');}else if(key==='context'){program.context=el.value;programChanged('context');}}
  });
  overlay.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();modalAction('close');return;}if(event.key==='Tab'){const focusable=[...overlay.querySelectorAll('button:not([disabled]),input,select,textarea,[tabindex="0"]')];const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();stopSpeech();}});
  addEventListener('pagehide',()=>{pause();stopSpeech();});
  function startupError(message) { app.innerHTML=`<section class="safe-state"><h2>Volvamos a abrir tu práctica</h2><p>${esc(message)}</p><button data-action="retry">Reintentar</button><p>En iPhone, abre este enlace en Safari para usar la voz y los botones.</p></section>`; }
  if(CENTRAL){
    if(!VALID){startupError('Regresa a SPM Central y abre la actividad desde Hoy.');return;}
    app.innerHTML='<section class="safe-state"><h2>Recuperando tu práctica…</h2><p>Estamos abriendo el día que elegiste en SPM.</p></section>';
    window.addEventListener('message',event=>{
      if(event.origin!==location.origin||event.source!==window.parent||event.data?.sid!==SID||event.data?.day!==ASSIGNED)return;
      const message=event.data;
      if(message.type==='SPM_WEEK4_INIT'){
        if(centralReady&&!resourceOpen)return;const resumeRunner=resourceOpen;resourceOpen=false;touched.clear();sessions[ASSIGNED]=C.recordFrom(ASSIGNED,message.record);archive=Array.isArray(message.history)?message.history:[];
        program={...program,...message.program,continuity:{...program.continuity,...message.program?.continuity},details:{...message.program?.details},detailNotes:{...message.program?.detailNotes}};program.actions=Array.isArray(program.actions)?program.actions:[];
        state={...state,...message.state};safety={...safety,...message.safety};day22Candidates=Array.isArray(message.day22Candidates)?message.day22Candidates:[];assignedPractice=message.assignedPractice||null;
        day=ASSIGNED;centralReady=true;clearTimeout(initTimer);if(resumeRunner)closeModal(false);render();if(resumeRunner&&day===22&&sessions[22].runnerStarted)openRunner();
      }else if(message.type==='SPM_WEEK4_RESOURCE_OPENED'){
        resourceOpen=true;pending='';clearTimeout(replyTimer);pause(false);stopSpeech();
      }else if(message.type==='SPM_WEEK4_ERROR'){
        pending='';clearTimeout(replyTimer);if(sessions[ASSIGNED].status==='completed'){sessions[ASSIGNED].status='draft';sessions[ASSIGNED].completedAt=null;}
        if(message.safety){pause(false);safety={...safety,...message.safety};if(modalType)closeModal();render();}
        if(!centralReady)startupError(message.message||'No pudimos recuperar tu sesión. Puedes reintentar.');else notify(message.message||'No se pudo guardar. Tu avance permanece aquí.',true);
      }else if(message.type==='SPM_WEEK4_DONE'){
        const was=pending;pending='';clearTimeout(replyTimer);if(was==='complete'){sessions[ASSIGNED].status='completed';notify('Tu actividad quedó registrada en SPM.');}else notify('Tu avance quedó guardado.');
      }
    });
    initTimer=setTimeout(()=>{if(!centralReady)startupError('La conexión tardó más de lo esperado. Reintenta para recuperar tu avance.');},10000);post('SPM_WEEK4_READY');
  }
  (window.SPM_WEEK4_SCREENS?Promise.resolve(window.SPM_WEEK4_SCREENS):fetch('screens.json').then(r=>{if(!r.ok)throw Error('screens');return r.json();})).then(data=>{if(!Array.isArray(data)||data.length!==31)throw Error('incomplete');screens=Object.fromEntries(data.map(x=>[x.id,x]));sourceReady=true;if(centralReady)render();}).catch(()=>startupError('No se pudieron cargar las pantallas. Revisa tu conexión y pulsa Reintentar.'));
  window.SPM_WEEK4_REVIEW={getState:()=>JSON.parse(JSON.stringify({sessions,archive,program,state,safety})),screenFor,day:()=>day,candidates:()=>candidates().map(p=>p.id),activePractice:()=>activePractice()?.id||null,narration:id=>screens[id]?narration(screens[id]):'',pending:()=>pending};
})();
