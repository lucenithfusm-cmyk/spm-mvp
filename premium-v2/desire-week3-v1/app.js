/* SPM Digital Wellness — Deseo Semana 3. Pantallas táctiles y revisión independiente.
   Las imágenes y narraciones pertenecen al paquete clínico aportado. */
(()=>{'use strict';
const $=(s,scope=document)=>scope.querySelector(s), $$=(s,scope=document)=>[...scope.querySelectorAll(s)];
const DAYS=[15,16,17,18,19,20,21];
const IDS={15:'intimacy-ladder',16:'sensate-1',17:'foreplay-rhythm',18:'communicate-limits',19:'sensate-2',20:'context-design',21:'week-review'};
const STORE='spm-desire-week3-tactile-preview-v1';
const PRACTICE_NAMES={'intimacy-ladder':'Escalera de intimidad','sensate-1':'Focalización sensorial I','foreplay-rhythm':'Ritmo y juego previo','communicate-limits':'Comunicar deseo y límites','sensate-2':'Focalización sensorial II','context-design':'Contexto favorable','week-review':'Revisión de la semana'};
const practiceName=id=>PRACTICE_NAMES[id]||'Práctica de Deseo';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sleepMS=n=>new Promise(r=>setTimeout(r,n));
const rev=()=>new Date().toISOString();
const fresh=(day)=>({id:'draft-'+day+'-'+Math.random().toString(36).slice(2),day,practiceId:IDS[day],status:'draft',step:1,before:null,after:null,localAfter:null,comfort:null,comfortable:null,comfortableAnswered:false,ready:false,confirm:false,na:{},variant:null,route:null,ladder:null,choices:{},fields:{},elapsed:0,running:false,lastTick:0,hasStarted:false,createdAt:rev(),updatedAt:rev(),completedAt:null});
const app=$('#app'),note=$('#toast'),res=$('#resourceOverlay');
const path=new URLSearchParams(location.search);
const CENTRAL=path.get('spm')==='central',ASSIGNED=Number(path.get('day')),SID=path.get('sid')||'';
const VALID=!CENTRAL||(window.parent!==window&&DAYS.includes(ASSIGNED)&&SID.length>8);
let centralReady=!CENTRAL,pending=false,closing=false,initTimer=0,replyTimer=0;
const programTouched=new Set();
const transmit=(type,fields={})=>{if(CENTRAL&&VALID)window.parent.postMessage({type,sid:SID,day:ASSIGNED,...fields},location.origin)};
const payload=()=>({record:session[ASSIGNED],program,programChanged:[...programTouched]});
let session=Object.fromEntries(DAYS.map(d=>[d,fresh(d)])),archive=[],program={context:'',conditions:[],ranking:[],details:{},detailNotes:{}},safety={acute:false,review:false,pressure:null},day=CENTRAL?ASSIGNED:Number(path.get('dia'))||0,visibleScreen=null;
let SCREENS={},broadcasted=false,modalOpen=false,sourceReady=false,timeout=0,timer=null,voice=null;
if(!DAYS.includes(day))day=0;
if(!CENTRAL)try{const saved=JSON.parse(localStorage.getItem(STORE)||'null');if(saved?.version===1){for(const d of DAYS)if(saved.session?.[d])session[d]={...fresh(d),...saved.session[d],running:false,lastTick:0};archive=Array.isArray(saved.archive)?saved.archive:[];program={...program,...saved.program,detailNotes:{...saved.program?.detailNotes}};safety={...safety,...saved.safety};}}catch{}
const setToast=(s,isBad=false)=>{note.textContent=s;note.dataset.bad=isBad?'1':'0';note.classList.add('show');clearTimeout(timeout);timeout=setTimeout(()=>note.classList.remove('show'),3200)};
function persist(){if(CENTRAL){if(centralReady&&!pending&&!closing)transmit('SPM_WEEK3_CHANGE',payload());return;}try{localStorage.setItem(STORE,JSON.stringify({version:1,session,archive,program,safety}));}catch{if(!broadcasted){broadcasted=true;setToast('El navegador no permite guardar en este dispositivo; los datos duran mientras permanezca abierto.',true)}}}
function stopSpeech(){try{speechSynthesis.cancel()}catch{}voice=null}
function speak(text){stopSpeech();if(!text)return;if(!('speechSynthesis'in window)){setToast('Esta vista no admite voz del dispositivo. El texto clínico sigue disponible.',true);return;}try{const u=new SpeechSynthesisUtterance(text);u.lang='es-CO';u.rate=.93;u.pitch=1;const vs=speechSynthesis.getVoices();u.voice=vs.find(v=>v.lang==='es-CO')||vs.find(v=>v.lang.startsWith('es'))||null;voice=u;speechSynthesis.speak(u);}catch{setToast('No se pudo reproducir la guía de voz.',true)}}
function sentences(t){return String(t||'').replace(/\s+/g,' ').match(/[^.!?¿¡]+[.!?]?/g)?.map(v=>v.trim()).filter(Boolean)||[]}
// Guías específicas por pantalla y control; el texto original queda como respaldo.
function mappedAudio(screen,id){const text=window.SPM_DESIRE_WEEK3_NARRATION?.[screen?.id]?.[id];return typeof text==='string'?text.trim():'';}
function narration(s){const mapped=mappedAudio(s,'audio-guide');if(mapped)return mapped;let phrases=sentences(s.content.audioText);if(s.step>1){const earlier=Object.values(SCREENS).filter(x=>x.day===s.day&&!x.alternate&&x.step<s.step).flatMap(x=>sentences(x.content.audioText).map(t=>t.toLowerCase()));const prior=new Set(earlier);const unique=phrases.filter(t=>!prior.has(t.toLowerCase()));if(unique.length)phrases=unique;}
return phrases.join(' ').trim()||String(s.content.audioText||'');}
function smallAudio(control,screen){
 const mapped=mappedAudio(screen,control.id);if(mapped)return mapped;
 const block=screen.content.blocks?.flatMap(b=>b.options||[]).find(x=>x.id===control.option||x.id===control.id.split('-').slice(-1)[0]);
 const raw=control.audioText||block?.audioText||block?.detail||'';
 const text=sentences(raw);const earlier=sentences(screen.content.audioText).map(x=>x.toLowerCase());
 const unique=text.filter(t=>!earlier.includes(t.toLowerCase()));
 return unique.slice(-2).join(' ')|| (block?.detail ? control.label+'. '+block.detail : control.label);
}
function pause(){if(timer)clearInterval(timer);timer=null;for(const d of DAYS){const s=session[d];if(s.running){s.elapsed+=Math.max(0,(Date.now()-s.lastTick)/1000);s.running=false;s.lastTick=0;s.updatedAt=rev();}}persist();}
function beginClock(){const s=session[day];if(s.running)return;s.running=true;s.hasStarted=true;s.lastTick=Date.now();persist();timer=setInterval(()=>{const r=$('[data-clock]');if(r)r.textContent=fmtTime(elapsedNow(s));},350);}
function elapsedNow(s){return Math.max(0,Math.round(s.elapsed+(s.running?(Date.now()-s.lastTick)/1000:0)))}
function fmtTime(sec){return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`}
function saveChange(){session[day].hasStarted=true;session[day].updatedAt=rev();persist();}
function historySessions(){const rows=[...archive,...DAYS.map(d=>session[d])].filter(x=>x.status==='completed');return [...new Map(rows.map(x=>[x.id||[x.day,x.practiceId,x.completedAt||x.date].join(':'),x])).values()];}
function phase1Done(){return historySessions().some(s=>s.practiceId==='sensate-1'&&s.comfortable===true)}
function currentPressure(){if(safety.pressure!==null)return Number(safety.pressure);if(CENTRAL)return null;const s=session[15];return typeof s.before==='number'?s.before:null}
function gate(){if(safety.acute)return 'Hay una alerta de salud activa';if(safety.review)return 'Hay una revisión clínica pendiente';const p=currentPressure();if(p===null||!Number.isFinite(p))return 'No se ha registrado la presión actual';if(p>=7)return 'La presión registrada es elevada';if(!phase1Done())return 'No hay una fase I completada y marcada como cómoda';return ''}
function hasSafetyBlock(d){return (d===17||d===19&&session[d].practiceId!=='sensate-1')&&(safety.acute||safety.review)}
function screenFor(d,step){if(d===19&&session[d].practiceId==='sensate-1')return SCREENS[`d16_${String(step).padStart(2,'0')}`];let id=`d${d}_${String(step).padStart(2,'0')}`;
 if(d===15&&step===2){if(safety.acute||safety.review)id='d15_02b';else if(currentPressure()!==null&&currentPressure()>=7)id='d15_02a'}
 if(d===18&&step===3&&session[d].route==='solo')id='d18_03a';
 if(d===19&&step===1&&gate())id='d19_00a';
 if(d===21&&step===2&&!historySessions().filter(x=>x.day>=15&&x.day<=20).length)id='d21_02a';
 return SCREENS[id]||SCREENS[`d${d}_${String(step).padStart(2,'0')}`];}
function awaitReply(type){clearTimeout(replyTimer);transmit(type,payload());replyTimer=setTimeout(()=>{if(!pending&&!closing)return;pending=false;closing=false;if(session[ASSIGNED].status==='completed'){session[ASSIGNED].status='draft';session[ASSIGNED].completedAt=null;}setToast('Aún no pudimos confirmar el guardado. Tu avance sigue aquí; puedes reintentar.',true);},15000);}
function closeCentral(){if(!centralReady||pending||closing)return;pause();stopSpeech();closing=true;awaitReply('SPM_WEEK3_CLOSE');setToast('Guardando tu avance…');}
function showHome(){if(CENTRAL){closeCentral();return;}stopSpeech();pause();modalOpen=false;res.hidden=true;day=0;visibleScreen=null;app.innerHTML=`<section class="hero"><span class="logo">SPM <small> DIGITAL WELLNESS</small></span><span class="heading-tag">Deseo · Semana 3</span><h1>Sentir, conectar, elegir</h1><p>Del día 15 al 21. Elige un día para abrir sus pantallas y escuchar cada paso.</p></section><section class="days">${DAYS.map(d=>`<button class="day-card" data-day="${d}"><img src="${SCREENS[`d${d}_01`]?.file||''}" alt="" loading="lazy"><span><strong>Día ${d} · ${esc(SCREENS[`d${d}_01`]?.title)}</strong><small>${session[d].status==='completed'?'Actividad realizada y registrada':session[d].hasStarted?'Continuar sin perder tu avance':'Abrir práctica'}</small></span><span aria-hidden="true">›</span></button>`).join('')}</section><button class="settings-link" data-action="settings">Probar rutas alternativas</button><p class="disclaimer">Vista de revisión · Tus pruebas se guardan en este navegador y se mantienen separadas de las cuentas de pacientes.</p>`;try{if(location.protocol!=='file:')history.replaceState(null,'',location.pathname)}catch{}window.scrollTo({top:0,behavior:'instant'});}
function go(d){if(!DAYS.includes(d)||CENTRAL&&d!==ASSIGNED)return;pause();stopSpeech();day=d;render();try{if(!CENTRAL&&location.protocol!=='file:')history.replaceState(null,'',location.pathname+'?dia='+d)}catch{}}
function screensInfo(d,step){return `<div class="statusbar"><button class="circle" data-action="home" aria-label="Volver a los días">‹</button><span><b>SPM</b> DIGITAL WELLNESS</span><span class="daypill">Día ${d} · Deseo</span></div><div class="meta"><span>Pantalla ${step} de 4</span><span>${session[d].status==='completed'?'Realizada':'En práctica'}</span></div>`}
function shape(c){const n=c.normalized;return `left:${(n.x*100).toFixed(4)}%;top:${(n.y*100).toFixed(4)}%;width:${(n.width*100).toFixed(4)}%;height:${(n.height*100).toFixed(4)}%;`}
function metricId(c){if(c.id.includes('local_after'))return 'localAfter';if(c.id.includes('comfort'))return 'comfort';return c.id.includes('before')?'before':'after'}
function radioId(c){if(c.id.startsWith('ladder-'))return 'ladder';if(c.id.startsWith('variant-'))return 'variant';if(c.id.startsWith('communication_route-'))return 'route';if(c.id.startsWith('comfortable-'))return 'comfortable';return c.id.split('-')[0]}
function radioValue(c){if(c.id.startsWith('comfortable-'))return c.id.endsWith('true')?'true':c.id.endsWith('false')?'false':'null';return String(c.option??c.value??c.id.split('-').at(-1))}
function choiceKey(c){if(c.id.startsWith('context_details-'))return 'context_details';if(c.id.startsWith('rhythm_cues-'))return 'rhythm_cues';if(c.id.startsWith('rhythm_actions-'))return 'rhythm_actions';return c.id.split('-')[0]}
function currentRadio(c,s){const a=radioId(c), val=radioValue(c);const mine=s[a];if(a==='comfortable'&&mine===null&&!s.comfortableAnswered)return false;return String(mine===null?'null':mine)===val}
function choiceActive(c,s){return Boolean(s.choices[choiceKey(c)]?.includes(String(c.option??c.id.split('-').at(-1))))}
function fieldValue(c,s){if(c.id==='context')return program.context||'';if(c.id.startsWith('partner_'))return s.fields[c.id]||'';return s.fields[c.id]||''}
function totalReflection(s,except){return Object.entries(s.fields).filter(([id])=>id!==except&&['reflection','like_phrase','avoid_phrase','partner_solo','reflection_keep','reflection_adapt','reflection_next'].includes(id)).reduce((n,[,v])=>n+String(v).length,0)}
function controlMarkup(c,s){const sty=shape(c),act=esc(c.id),lab=esc(c.label),type=c.type;
 if(type==='text'){const val=esc(fieldValue(c,s)), max=c.id==='context'?140:Math.max(0,400-totalReflection(s,c.id));return `<textarea class="spm-text spm-layer" style="${sty}" data-control="${act}" aria-label="${lab}" maxlength="${max}" placeholder="${lab}">${val}</textarea>`}
 if(type==='slider'){const k=metricId(c),v=s[k],n=c.normalized;return `<div class="spm-layer scale-box" style="${sty}" aria-label="${lab}"><input type="range" min="0" max="10" step="1" value="${v===null?0:v}" aria-label="${lab} · desliza para seleccionar entre 0 y 10" data-control="${act}">${v===null?'':`<span class="scale-dot" style="left:${(v/10*92+4).toFixed(1)}%">${v}</span>`}</div>`}
 if(type==='dynamic'){let value=c.id==='ladder_choice'?['Cercanía','Contacto sensual','Mayor erotismo','Actividad más amplia'][s.ladder??0]||'Aún sin elegir':c.id==='sensate_gate_reason'?('Sensate Focus I · '+gate()):'';return `<div class="spm-layer dynamic-value" style="${sty}">${esc(value)}</div>`}
 let active=false,disabled=false;
 if(type==='radio')active=currentRadio(c,s);
 if(type==='choice')active=choiceActive(c,s);
 if(type==='checkbox')active=Boolean(s[c.id==='partner_consent'?'partnerConsent':c.id]);
 if(type==='nullable')active=Boolean(s.na[metricId(c)]);
 if(type==='radio'&&c.id.startsWith('ladder-')){let n=Number(radioValue(c));if(safety.acute||safety.review)disabled=n>=1;else if(currentPressure()!==null&&currentPressure()>=7)disabled=n>=2;}
 const css=['spm-layer','touch-target',type,'ct-'+act,(type==='radio'||type==='choice'||type==='checkbox'||type==='nullable')&&active?'selected':'',disabled?'disabled':''].filter(Boolean).join(' ');
 return `<button type="button" class="${css}" style="${sty}" data-control="${act}" aria-label="${lab}" ${type==='radio'||type==='choice'||type==='checkbox'||type==='nullable'?`aria-pressed="${active}"`:''} ${disabled?'disabled':''}>${type==='audio'?'🔊':type==='timer'?'':active&&['radio','choice','checkbox'].includes(type)?'<span class="selection-mark">✓</span>':''}</button>`}
function screenFooter(d,step){const s=session[d];return `<section class="screen-footer">${s.practiceId==='sensate-2'&&s.variant==='partner'?`<label class="partner-confirm"><input type="checkbox" data-partner-consent ${s.partnerConsent?'checked':''}> Ambos queremos esta práctica y podemos parar cuando lo necesitemos.</label>`:''}<div class="steps">${[1,2,3,4].map(i=>`<span class="${i===step?'on':''}"></span>`).join('')}</div><div class="quick"><button data-action="back" aria-label="Pantalla anterior">‹ Anterior</button><button data-action="speak" aria-label="Escuchar la explicación del paso">🔊 Guía</button><button data-action="next" aria-label="Ir al siguiente paso">${step===4?'Guardar':'Siguiente ›'}</button></div><p>Puedes volver a escuchar la guía o continuar a tu ritmo.</p></section>`}
function render(resetScroll=true){if(!centralReady||!sourceReady)return;if(!day){showHome();return;}stopSpeech();const s=session[day],d=day;
 if(hasSafetyBlock(d))return renderSafe();
 const view=screenFor(d,s.step);visibleScreen=view;
 const h=`${screensInfo(d,s.step)}${d===19&&s.practiceId==='sensate-1'?'<p class="repeat-note">Hoy repites Focalización I. Tu registro corresponde al día 19.</p>':''}<div class="portrait" data-screen="${view.id}"><img class="backdrop" src="${view.file}" alt="Pantalla ilustrada de ${esc(view.title)}" draggable="false"/>${view.controls.map(c=>controlMarkup(c,s)).join('')}${view.controls.some(c=>c.type==='timer')?`<div class="clock-tag" data-clock>${fmtTime(elapsedNow(s))}</div>`:''}</div>${screenFooter(d,s.step)}`;
 app.innerHTML=h;
 if(s.step===4){const r=s.fields.reflection||'';const reflections=Object.entries(s.fields).filter(([k])=>k.startsWith('reflection_'));if(reflections.length||r){const used=totalReflection(s,null);app.insertAdjacentHTML('beforeend',`<p class="char-info">Reflexión: ${Math.min(used,400)} de 400 caracteres</p>`)} }
 if(resetScroll)window.scrollTo({top:0,behavior:'instant'});}
function renderSafe(){visibleScreen=null;app.innerHTML=`${screensInfo(day,session[day].step)}<section class="safe-state"><div class="safe-icon">✧</div><h2>Hoy, una alternativa sin exigencias</h2><p>${safety.acute?'Esta práctica está detenida por una alerta de salud. Si hay síntomas agudos, busca atención clínica.':'Hay una revisión clínica pendiente. No es el momento de ampliar el contacto.'}</p><p>Puedes realizar una práctica breve de atención a tu comodidad, sin objetivos de respuesta.</p><button data-action="presence">Abrir atención sin examen · 5 min</button><button class="soft" data-action="home">Volver a mis días</button></section>`}
function repeatPhase1(){if(day!==19)return;pause();stopSpeech();const old=session[19];if(old.status==='completed')archive.push({...old,running:false});session[19]={...fresh(19),id:old.id,practiceId:'sensate-1'};saveChange();render();}
function advance(){if(!day||modalOpen||pending||closing||!centralReady)return;const s=session[day];
 if(day===19&&s.practiceId!=='sensate-1'&&s.step===1){if(visibleScreen?.id==='d19_00a'){repeatPhase1();return;}if(gate()){setToast('La fase II no está disponible todavía. Puedes repetir la fase I.',true);return;}if(!s.ready){setToast('Confirma que hoy deseas ampliar y sabes que puedes parar.',true);return;}}
 if(s.practiceId==='sensate-2'&&s.step>=2&&s.variant==='partner'&&!s.partnerConsent){setToast('Confirma que ambos quieren compartir esta práctica o elige la variante individual.',true);return;}
 if(day===15&&s.step===2&&s.ladder===null){setToast('Elige el peldaño que te resulte cómodo.',true);return;}
 if(s.step<4){pause();s.step++;saveChange();render();return;}
 if(!s.confirm){setToast('Marca “Realicé la actividad” para guardarla como completada. También puedes volver sin marcarla.',true);return;}
 pause();s.status='completed';s.completedAt=rev();s.updatedAt=rev();if(day===15&&s.ladder!==null)program.ladder=s.ladder;
 if(CENTRAL){pending=true;awaitReply('SPM_WEEK3_COMPLETE');setToast('Guardando tu actividad en SPM…');return;}
 saveChange();setToast('Actividad registrada en tu revisión local.');showHome();}
function back(){if(!day)return;pause();const s=session[day];if(s.step===1){showHome();return;}s.step--;saveChange();render();}
function newAttempt(d){let old=session[d];if(old.status==='completed')archive.push({...old,running:false});else if(old.status==='draft'&&old.hasStarted)archive.push({...old,status:'interrupted',running:false});session[d]=fresh(d);persist();go(d)}
function openResource(type,label){type=String(type||'').replace(/^r:/,'').replace(/^practice:/,'');pause();stopSpeech();modalOpen=true;res.hidden=false;res.dataset.type=type;res.innerHTML=resourceMarkup(type,label);$('#modalClose')?.focus();}
const vocab=[['partner-visual','Lo visual'],['touch','Texturas y contacto'],['words','Palabras o voces'],['massage','Masaje'],['fantasy','Imaginación'],['foreplay','Ritmo y juego previo'],['ambience','Entorno y privacidad'],['other','Otra preferencia']];
const detailChannels=[['visual','Lo visual'],['tactile','Texturas y contacto'],['verbal','Palabras o voces'],['fantasy','Imaginación'],['context','Entorno y privacidad'],['partnerFavors','Preferencias compartidas']];
const clinicalPhases={sensate1:['Manos y brazos','Hombros y cuello','Espalda','Cierre y respiración'],sensate2:['Repaso fase I','Ampliar','Pausa','Cierre']};
function resourceMarkup(type,label){const s=session[day];let body='';
 if(type==='ladder')body=`<h3>Escalera de intimidad</h3><p>Elige libremente. Puedes permanecer en cualquier paso y volver al anterior.</p>${['Cercanía (abrazos, estar juntos)','Contacto sensual','Mayor erotismo','Actividad más amplia'].map((v,i)=>`<button class="resource-choice" data-resource="ladder" data-value="${i}">${esc(v)} ${s.ladder===i?'✓':''}</button>`).join('')}`;
 else if(type==='sensate_resource')body=`<h3>Focalización sensorial</h3><p>Contacto suave, elegido y consensuado; las sensaciones importan más que el resultado.</p><p><strong>Fase I:</strong> manos, brazos, cuello y espalda, sin contacto genital. <strong>Fase II:</strong> ampliar solo con una fase I completada como cómoda y con disposición actual.</p>`;
 else if(type==='ideas')body=`<h3>Ideas sin exigencias</h3><p>Prueba una sola variación cómoda: más despacio, una pausa o un ritmo diferente. No hay velocidad correcta ni objetivo de rendimiento.</p>`;
 else if(type==='conditions')body=`<h3>Condiciones y rutina previa</h3><p>Marca solo las condiciones que suelen ayudarte. Estas preferencias son diferentes de los detalles elegidos para hoy.</p>${['Menos presión','Más tiempo','Mejor descanso','Más conexión','Menos distracciones'].map(v=>`<button class="resource-choice" data-resource="conditions" data-value="${esc(v)}">${program.conditions.includes(v)?'✓ ':''}${esc(v)}</button>`).join('')}`;
 else if(type==='partner')body=`<h3>Acuerdos sin presión</h3><p>La conversación requiere consentimiento mutuo y puede terminarse cuando cualquiera lo prefiera. No se envía nada a otra persona.</p><label>Momento <input data-resource-field="partner_moment" value="${esc(s.fields.partner_moment||'')}"></label><label>Lo que descubrí <textarea data-resource-field="partner_findings">${esc(s.fields.partner_findings||'')}</textarea></label><label>Lo acordado <textarea data-resource-field="partner_agreed">${esc(s.fields.partner_agreed||'')}</textarea></label><label><input type="checkbox" data-resource-field="partnerConsent" ${s.partnerConsent?'checked':''}> Ambos estuvimos de acuerdo</label>`;
 else if(type==='progress28')body=`<h3>Tu progreso real de la semana</h3>${historySessions().filter(v=>v.day>=15&&v.day<=21).length?historySessions().filter(v=>v.day>=15&&v.day<=21).map(v=>`<article class="logline"><b>Día ${v.day}</b> · ${new Date(v.completedAt||v.updatedAt).toLocaleDateString('es-CO')} · ${esc(practiceName(v.practiceId))}<small>${v.before??'N/A'} → ${v.after??'N/A'} · Realizada</small></article>`).join(''):'<p>Aún no hay sesiones registradas. Puedes recordar una experiencia de esta semana.</p>'}`;
 else if(type==='ranking')body=`<h3>Tu lista de preferencias</h3><p>Hasta cinco. Puedes cambiar el orden sin elegir las cinco.</p>${vocab.map(([v,label])=>`<button class="resource-choice" data-resource="ranking" data-value="${v}">${program.ranking.includes(v)?'✓ ':''}${esc(label)}</button>`).join('')}<ol class="rank-list">${program.ranking.map((v,i)=>`<li>${esc(vocab.find(x=>x[0]===v)?.[1]||v)} <button data-resource="rankup" data-value="${i}" aria-label="Subir">↑</button><button data-resource="rankdown" data-value="${i}" aria-label="Bajar">↓</button></li>`).join('')}</ol>`;
 else if(type==='details')body=`<h3>Detalles por canal</h3><p>Estas notas personales complementan tus preferencias.</p>${detailChannels.map(([k,v])=>`<label>${esc(v)}${Array.isArray(program.details[k])&&program.details[k].length?`<small>${esc(program.details[k].join(' · '))}</small>`:''}<textarea rows="2" maxlength="140" data-detail="${k}">${esc(program.detailNotes[k]||'')}</textarea></label>`).join('')}`;
 else if(type==='presence')body=`<h3>Atención sin examen</h3><p>Dedica unos minutos a observar qué sientes en el cuerpo, sin tratar de provocar una respuesta. Puedes parar cuando quieras.</p><p>La práctica es opcional; no sustituye la revisión clínica cuando está indicada.</p>`;
 else if(type.startsWith('diary:')){const d=Number(type.split(':')[1]),records=historySessions().filter(s=>s.day===d);body=`<h3>Diario del día ${d}</h3>${records.length?records.map(v=>`<article class="logline"><b>${esc(practiceName(v.practiceId))}</b><small>Realizada · ${v.before??'N/A'} → ${v.after??'N/A'} · ${esc(new Date(v.completedAt||v.updatedAt).toLocaleDateString('es-CO'))}</small><p>${esc(v.fields?.reflection||'')}</p></article>`).join(''):'<p>Aún no hay sesiones registradas para ese día.</p>'}`;}
 else body=`<h3>${esc(label)}</h3><p>Este recurso conserva la práctica actual. Puedes volver sin perder tus notas ni el tiempo transcurrido.</p>`;
 return `<div class="modal-card" role="dialog" aria-modal="true" aria-label="${esc(label)}"><button id="modalClose" class="close" data-action="close" aria-label="Cerrar recurso">×</button><div class="modal-head"><strong>SPM · Biblioteca de Deseo</strong><h2>${esc(label)}</h2></div><div class="modal-content">${body}</div><button class="return" data-action="close">‹ Volver a la práctica</button></div>`;
}
function closeResource(){modalOpen=false;res.hidden=true;res.innerHTML='';render();}
function screenControl(e){const ctrl=e.target.closest('[data-control]');if(!ctrl||!day||!visibleScreen)return;
 const c=visibleScreen.controls.find(x=>x.id===ctrl.dataset.control);if(!c)return;
 const s=session[day],type=c.type;
 if(type==='audio'){speak(narration(visibleScreen));return;}
 if(type==='navigation'){if(c.id==='back')back();else advance();return;}
 if(type==='radio'){
  const id=radioId(c),v=radioValue(c);
  if(id==='ladder'){let n=Number(v);if((safety.acute||safety.review)&&n>=1||currentPressure()!==null&&currentPressure()>=7&&n>=2){setToast('Este peldaño está en pausa según las condiciones actuales.',true);return;}s.ladder=n;}
  else if(id==='comfortable'){s.comfortable=v==='true'?true:v==='false'?false:null;s.comfortableAnswered=true;}
  else s[id]=v;
  saveChange();render(false);if(id!=='comfortable')speak(smallAudio(c,visibleScreen));return;}
 if(type==='choice'){
  const k=choiceKey(c),v=String(c.option??c.id.split('-').at(-1));let old=s.choices[k]||[];
  if(k==='context_details'){if(old.includes(v))old=old.filter(t=>t!==v);else if(old.length>=3){setToast('Elige hasta tres detalles para este momento.');return;}else old=[...old,v];}
  else old=[v];const selected=old.includes(v);s.choices[k]=old;saveChange();render(false);if(selected)speak(smallAudio(c,visibleScreen));return;}
 if(type==='nullable'){const k=metricId(c);s[k]=null;s.na[k]=true;saveChange();render(false);return;}
 if(type==='checkbox'){if(c.id==='confirm')s.confirm=!s.confirm;else if(c.id==='ready')s.ready=!s.ready;else if(c.id==='partner_consent')s.partnerConsent=!s.partnerConsent;saveChange();render(false);return;}
 if(type==='timer'){
  if(c.id.endsWith('play'))beginClock();else if(c.id.endsWith('pause'))pause();else if(c.id.endsWith('reset')){pause();s.elapsed=0;s.hasStarted=false;persist()}else if(c.id.endsWith('stop')){pause();s.status='interrupted';saveChange();setToast('El cronómetro se detuvo. El día no se ha marcado como completado.');}
  render(false);if(c.id.endsWith('play'))speak('El tiempo es opcional. Explora a tu propio ritmo y detente cuando lo necesites.');return;}
 if(type==='phase-audio'||type==='step-audio'||type==='audio-explanation'){
  s.lastAudio=c.id;saveChange();render(false);speak(smallAudio(c,visibleScreen));return;}
 if(type==='record-link'){openResource('diary:'+c.id.split('-').at(-1),c.label);return;}
 if(type==='resource'){
  if(c.id==='change_choice'){pause();s.step=2;saveChange();render();return;}
  if(c.id==='repeat_sensate1'){repeatPhase1();return;}
  let target=c.target||c.id;openResource(c.id==='sensate_resource'?'sensate_resource':target,c.label);return;}
 if(type==='dynamic')return;
}
function rangeChanged(e){const ctrl=e.target.closest('[data-control]');if(!ctrl||!day||!visibleScreen)return;
 const c=visibleScreen.controls.find(x=>x.id===ctrl.dataset.control);if(c?.type!=='slider')return;const k=metricId(c),n=Number(ctrl.value);if(!Number.isInteger(n)||n<0||n>10)return;
 session[day][k]=n;session[day].na[k]=false;saveChange();
 const box=ctrl.closest('.scale-box');const mark=box.querySelector('.scale-dot');if(mark){mark.textContent=n;mark.style.left=(n/10*92+4)+'%'}else box.insertAdjacentHTML('beforeend',`<span class="scale-dot" style="left:${n/10*92+4}%">${n}</span>`);
}
function textChanged(e){const input=e.target.closest('textarea[data-control]');if(!input||!day)return;const s=session[day],id=input.dataset.control;
 if(id==='context'){program.context=input.value.slice(0,140);programTouched.add('context');saveChange();return;}
 let value=input.value;
 if(['reflection','like_phrase','avoid_phrase','partner_solo','reflection_keep','reflection_adapt','reflection_next'].includes(id)){
  const max=Math.max(0,400-totalReflection(s,id));if(value.length>max){value=value.slice(0,max);input.value=value;setToast('La reflexión completa admite hasta 400 caracteres.');}}
 s.fields[id]=value;saveChange();}
function changePreviewSettings(){if(CENTRAL)return;pause();stopSpeech();modalOpen=true;res.hidden=false;res.innerHTML=`<div class="modal-card" role="dialog" aria-label="Escenarios de revisión"><button id="modalClose" class="close" data-action="close">×</button><div class="modal-head"><strong>SOLO PARA ESTA VISTA PREVIA</strong><h2>Comprobar rutas alternativas</h2></div><div class="modal-content"><p>Las siguientes condiciones permiten verificar los controles de seguridad. No se registran como información clínica de pacientes.</p><label><input type="checkbox" data-setting="review" ${safety.review?'checked':''}> Revisión clínica pendiente</label><label><input type="checkbox" data-setting="acute" ${safety.acute?'checked':''}> Simular alerta aguda</label><label>Presión actual 0–10 (opcional)<select data-setting="pressure"><option value="" ${safety.pressure===null?'selected':''}>No registrada</option>${Array.from({length:11},(_,i)=>`<option ${safety.pressure===i?'selected':''}>${i}</option>`).join('')}</select></label><p>Para probar la fase II, completa el día 16 con “La fase I me resultó cómoda: Sí” y usa una presión menor que 7. La alternativa individual del día 18 depende de esa selección en su primera pantalla.</p></div><button class="return" data-action="close">Volver a mi recorrido</button></div>`;$('#modalClose')?.focus()}
function resourceButton(b){const type=b.dataset.resource,v=b.dataset.value;
 if(type==='ladder'){let n=Number(v);if((safety.acute||safety.review)&&n>=1||currentPressure()!==null&&currentPressure()>=7&&n>=2){setToast('Este peldaño está temporalmente en pausa.',true);return;}session[day].ladder=n;saveChange();openResource('ladder','Escalera de intimidad');}
 else if(type==='conditions'){if(program.conditions.includes(v))program.conditions=program.conditions.filter(x=>x!==v);else program.conditions.push(v);programTouched.add('conditions');persist();openResource('conditions','Condiciones y rutina previa')}
 else if(type==='ranking'){if(program.ranking.includes(v))program.ranking=program.ranking.filter(x=>x!==v);else if(program.ranking.length>=5){setToast('Hasta cinco preferencias.');return;}else program.ranking.push(v);programTouched.add('ranking');persist();openResource('ranking','Tu lista de preferencias')}
 else if(type==='rankup'||type==='rankdown'){const i=Number(v),j=i+(type==='rankup'?-1:1);if(j<0||j>=program.ranking.length)return;[program.ranking[i],program.ranking[j]]=[program.ranking[j],program.ranking[i]];programTouched.add('ranking');persist();openResource('ranking','Tu lista de preferencias')}
}
app.addEventListener('click',e=>{
 const retry=e.target.closest('[data-action="retry"]');if(retry){if(CENTRAL){transmit('SPM_WEEK3_READY');setToast('Recuperando la práctica…');}else location.reload();return;}
 if(!sourceReady||!centralReady||pending||closing)return;
 const card=e.target.closest('[data-day]');if(card&&card.classList.contains('day-card')){go(Number(card.dataset.day));return;}
 const a=e.target.closest('[data-action]');if(a){switch(a.dataset.action){case'home':showHome();break;case'back':back();break;case'next':advance();break;case'speak':speak(visibleScreen?narration(visibleScreen):'');break;case'settings':changePreviewSettings();break;case'presence':openResource('presence','Atención sin examen');break;case'newAttempt':newAttempt(day);break;}return;}
 if(e.target.closest('button[data-control]'))screenControl(e);
});
app.addEventListener('input',e=>{if(!centralReady||pending||closing)return;if(e.target.matches('[data-partner-consent]')){session[day].partnerConsent=e.target.checked;saveChange();}else if(e.target.matches('input[type=range][data-control]'))rangeChanged(e);else if(e.target.matches('textarea[data-control]'))textChanged(e)});
res.addEventListener('click',e=>{let a=e.target.closest('button[data-action]');if(a?.dataset.action==='close'){closeResource();return;}let b=e.target.closest('button[data-resource]');if(b)resourceButton(b);});
res.addEventListener('input',e=>{const el=e.target;if(el.dataset.setting){if(CENTRAL)return;const id=el.dataset.setting;safety[id]=id==='pressure'?(el.value===''?null:Number(el.value)):el.checked;persist();return;}if(el.dataset.detail){program.detailNotes[el.dataset.detail]=el.value.slice(0,140);programTouched.add('detailNotes');persist();return;}if(el.dataset.resourceField){const id=el.dataset.resourceField;if(id==='partnerConsent')session[day].partnerConsent=el.checked;else session[day].fields[id]=el.value.slice(0,400);saveChange();}});
res.addEventListener('keydown',e=>{if(e.key==='Escape')closeResource()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();stopSpeech();}});
addEventListener('pagehide',()=>{pause();stopSpeech()});
function startupError(message){app.innerHTML=`<section class="safe-state"><h2>Volvamos a abrir tu práctica</h2><p>${esc(message)}</p><button data-action="retry">Reintentar</button><p>En iPhone, abre el enlace de revisión en Safari para usar los audios y botones.</p><a href="index.html" target="_blank" rel="noopener">Abrir la semana 3 en el navegador</a></section>`;}
if(CENTRAL){
 if(!VALID){startupError('Regresa a SPM Central y abre la actividad desde Hoy.');return;}
 app.innerHTML='<section class="safe-state"><h2>Recuperando tu práctica…</h2><p>Estamos abriendo el día que elegiste en SPM.</p></section>';
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==window.parent||event.data?.sid!==SID||event.data?.day!==ASSIGNED)return;
  const m=event.data;
  if(m.type==='SPM_WEEK3_INIT'){
   if(centralReady)return;
   const r=m.record&&typeof m.record==='object'?m.record:{};
   session[ASSIGNED]={...fresh(ASSIGNED),...r,day:ASSIGNED,running:false,lastTick:0,step:Math.max(1,Math.min(4,Number(r.step)||1)),choices:{...r.choices},fields:{...r.fields},na:{...r.na}};
   archive=Array.isArray(m.history)?m.history:[];
   program={...program,...m.program,context:m.program?.context??m.state?.context??'',details:{...m.program?.details},detailNotes:{...m.program?.detailNotes}};
   safety={...safety,...m.safety};day=ASSIGNED;centralReady=true;clearTimeout(initTimer);render();
  }else if(m.type==='SPM_WEEK3_ERROR'){
   pending=false;closing=false;clearTimeout(replyTimer);
   if(session[ASSIGNED].status==='completed'){session[ASSIGNED].status='draft';session[ASSIGNED].completedAt=null;}
   if(m.safety){pause();safety={...safety,...m.safety};if(day===19&&session[19].practiceId==='sensate-2'&&gate()){session[19].step=1;session[19].ready=false;}render();}
   if(!centralReady)startupError(m.message||'No se pudo recuperar tu sesión. Puedes reintentar.');
   else{session[ASSIGNED].status=session[ASSIGNED].status==='completed'?'draft':session[ASSIGNED].status;setToast(m.message||'No se pudo guardar. Tu avance permanece aquí para reintentar.',true);}
  }else if(m.type==='SPM_WEEK3_DONE'){pending=false;closing=false;clearTimeout(replyTimer);session[ASSIGNED].status='completed';setToast('Tu actividad quedó registrada en SPM.');}
 });
 initTimer=setTimeout(()=>{if(!centralReady)startupError('La conexión tardó más de lo esperado. Reintenta para recuperar tu avance.');},10000);
 transmit('SPM_WEEK3_READY');
}
const dataUrl='screens.json';
(window.SPM_WEEK3_SCREENS ? Promise.resolve(window.SPM_WEEK3_SCREENS) : fetch(dataUrl).then(r=>{if(!r.ok)throw Error('No se pudo leer el paquete');return r.json()})).then(all=>{
 if(!Array.isArray(all)||all.length!==33)throw Error('El paquete de pantallas está incompleto');
 SCREENS=Object.fromEntries(all.map(x=>[x.id,{...x,file:window.SPM_WEEK3_IMAGES?.[x.id]||x.file}]));sourceReady=true;
 if(centralReady){if(day)render();else showHome();}
}).catch(()=>startupError('No se pudieron cargar las pantallas. Revisa tu conexión y pulsa Reintentar.'));
window.SPM_WEEK3_REVIEW={getState:()=>JSON.parse(JSON.stringify({session,archive,program,safety})),gate,screenFor,day:()=>day,phase1Done};
})();
