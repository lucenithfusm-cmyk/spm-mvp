(()=>{
'use strict';
// Premium interface for the existing Sensate Focus clinical curriculum.
// State and medical progress stay with the existing SPM_SENSATE_LAB_HOST.
const root=document.getElementById('sensatePremium');
function host(){try{return window.parent!==window?window.parent.SPM_SENSATE_LAB_HOST:null}catch{return null}}
const api=host();
if(!root||!api){if(root)root.innerHTML='<p class="offline">Abre Focalización sensorial desde tu programa SPM.</p>';return}
const KEY='spm-sensate-records';
const PREFIX='../assets/sensate-premium/';
const IMAGES=['focalizacion-inicio.webp','focalizacion-preparacion.webp','focalizacion-guia.webp','focalizacion-cierre.webp'];
const PHASES={
 'sf-solo':[
  ['Llegar al cuerpo','Siéntate o recuéstate. Afloja mandíbula, hombros y abdomen. Observa el apoyo de tu cuerpo.',60],
  ['Respirar','Respira a tu ritmo; nota el contacto con la superficie. No retengas el aire.',60],
  ['Explorar el tacto','Apoya una mano sobre el antebrazo, incluso sobre la ropa. Observa temperatura, presión y textura.',120],
  ['Volver a sentir','Si aparece distracción o autoevaluación, reconoce el pensamiento y vuelve a una sensación cómoda.',60],
  ['Cerrar','Detén el contacto y observa cómo está tu cuerpo. No necesitas conseguir una respuesta sexual.',60]
 ],
 'sf-focus-1':[
  ['Llegar juntos','Ambos han decidido participar. Acomódense y acuerden que cualquiera puede pedir una pausa.',60],
  ['A toca · B recibe','A explora manos, brazos, espalda, cuello o piernas de B. Sin contacto genital ni con el pecho. Perciban temperatura, textura, presión y ritmo.',300],
  ['Pausa breve','Retiren el contacto. Observen qué sensaciones permanecen en la piel.',30],
  ['B toca · A recibe','Cambien los turnos. Exploren por curiosidad, sin buscar excitación ni un resultado.',300],
  ['Cierre compartido','Hagan una pausa cómoda. Agradezcan el encuentro sin evaluarse mutuamente.',60]
 ],
 'sf-focus-2':[
  ['Volver a lo conocido','Comiencen con el contacto no genital que ya practicaron en Focus I.',120],
  ['Explorar opcionalmente','Solo si ambos lo desean y se sienten cómodos, pueden incluir zonas erógenas. No hay objetivo de penetración u orgasmo.',240],
  ['Variar el estímulo','Cambien una cosa: ritmo, presión o zona. Noten cómo cambia la sensación.',120],
  ['Pausa y regulación','Bajen el ritmo o interrumpan el contacto si alguien lo desea.',60],
  ['Cerrar sin expectativas','Terminen cuando lo prefieran. La práctica no tiene que conducir a ninguna actividad sexual.',60]
 ],
 'sf-communication':[
  ['Respira y observa','Siéntate o recuéstate y nota una sensación corporal cómoda.',60],
  ['Más lento','Ensaya en voz alta o mentalmente: «Más lento».',30],
  ['Así está bien','Ensaya: «Así está bien». Identifica cuándo te resulta cómoda esa frase.',30],
  ['Prefiero otro contacto','Ensaya: «Prefiero otro contacto». Pedir un cambio es parte del cuidado.',30],
  ['Pausa','Ensaya: «Pausa». Vuelve a la respiración y a la sensación de apoyo.',60]
 ],
 'sf-recovery':[
  ['Reconocer lo ocurrido','Si la firmeza cambió o apareció presión, observa lo que sucedió sin calificarte.',60],
  ['Reducir la exigencia','Vuelve a contacto no genital, o al apoyo de tu cuerpo si estás solo.',90],
  ['Respirar con naturalidad','Observa temperatura, textura y respiración; no intentes comprobar la erección.',90],
  ['Elegir con libertad','Puedes continuar con un contacto cómodo, cambiar de actividad o terminar.',60],
  ['Cerrar sin examen','Un cambio de firmeza no invalida la práctica. Registra cómo te sentiste.',60]
 ]
};
const LABELS={'sf-solo':'Presencia individual','sf-focus-1':'Focus I · Contacto no genital','sf-focus-2':'Focus II · Progresión opcional','sf-communication':'Comunicación sin presión','sf-recovery':'Recuperar calma y conexión'};
const INTRO='Focalización sensorial no es una prueba de desempeño. El objetivo es volver a percibir temperatura, presión, textura y ritmo del contacto. No necesitas lograr erección, penetración, orgasmo ni una duración concreta. Puedes practicar a solas o, con consentimiento, en pareja.';
const PREP='Busca un lugar cómodo, privado y sin interrupciones. Si estás en pareja, ambos deben querer participar y pueden decir pausa en cualquier momento. Focus I consiste en contacto no genital, sin tocar el pecho. Focus II solo se plantea cuando previamente hubo comodidad y poca presión. Si estás solo, comienza observando tu cuerpo y el contacto de una mano sobre el antebrazo.';
const CLOSING='Evalúa cómo te sentiste, sin exigirte resultados. Un ejercicio difícil también puede darte información útil. Observa presencia, presión, disfrute y comodidad. Si apareció molestia o dolor, no fuerces el contacto. Repetir una práctica cómoda puede ser más útil que avanzar deprisa.';
const API_NOTE='<details class="more"><summary>Aplicaciones clínicas del recurso original</summary><p><b>Firmeza:</b> un cambio en la erección no invalida la práctica. Puedes volver al contacto no genital.</p><p><b>Deseo responsivo:</b> el deseo puede aparecer después del contacto, o no aparecer; ambas respuestas son válidas.</p><p><b>Control eyaculatorio:</b> observar sensaciones puede ayudarte a reconocer cambios de excitación sin convertirlos en una prueba de tiempo.</p></details>';
const META=api.getContext();
const isDaily=META.mode==='daily';
const assigned=META.activity||null;
const safeText=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readRecords(){try{const rows=JSON.parse(api.getState()[KEY]||'[]');return Array.isArray(rows)?rows:[]}catch{return[]}}
function canPractice(){const c=api.getContext();return c?.restriction==='none'&&(!isDaily||(c.activity&&Number(c.activity.day)===Number(c.day)))}
function mayAdvance(){return readRecords().some(r=>r&&r.practiceId==='sf-focus-1'&&r.completed===true&&Number(r.partnerComfort)>=6&&Number(r.pressureAfter)<=3&&r.recommendation==='progress')}
let id=isDaily?(assigned?.practiceId||'sf-solo'):'sf-focus-1';
if(!PHASES[id])id='sf-solo';
let screen=0,phase=0,consent=false,performed=false,saved=false,busy=false,hasPain=false;
let t=0,timer=0,running=false,voiceActive=false,entryId=null,error='',notification='';
let data={presenceBefore:5,pressureBefore:5,presenceAfter:5,pressureAfter:5,enjoyment:5,partnerComfort:7,comfort:'',ease:'',attention:'',repeat:'',discomfort:'',usefulStimuli:[],monitoringIntrusions:0,notes:''};const touched=new Set();
const isPartner=()=>id==='sf-focus-1'||id==='sf-focus-2';
const originalDay=Number(META.day)||1;
const existing=isDaily?readRecords().find(r=>r&&r.day===originalDay&&r.completed===true&&r.origin==='dailyPlan'):null;
if(existing){entryId=existing.id||null;notification='Hay un registro previo de focalización en este día; comprobaré si ya está completado en tu programa.';}
function stopClock(){if(timer)clearInterval(timer);timer=0;running=false}
function startClock(){if(running){stopClock();render();return}running=true;timer=setInterval(()=>{t+=1;const el=root.querySelector('[data-clock]');if(el)el.textContent=clockText(t)},1000);render()}
function clockText(n){return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')}
function stopAudio(){window.speechSynthesis?.cancel();voiceActive=false}
function speech(text){if(voiceActive){stopAudio();render();return}stopAudio();if(!window.speechSynthesis||typeof SpeechSynthesisUtterance==='undefined'){notification='La lectura en voz alta no está disponible. Abre «Leer instrucciones».';render();return}
const utter=new SpeechSynthesisUtterance(text);utter.lang='es-CO';utter.rate=.96;const vs=window.speechSynthesis.getVoices?.()||[];utter.voice=vs.find(v=>v.lang?.toLowerCase()==='es-co')||vs.find(v=>v.lang?.toLowerCase().startsWith('es'))||null;voiceActive=true;utter.onend=utter.onerror=()=>{voiceActive=false;const b=root.querySelector('[data-audio]');if(b)b.classList.remove('playing')};window.speechSynthesis.speak(utter);const b=root.querySelector('[data-audio]');if(b)b.classList.add('playing');}
function audioText(){if(screen===0)return INTRO;if(screen===1)return PREP+' '+(isPartner()?'Confirma primero que ambos están de acuerdo.':'Tu práctica será individual.');if(screen===2)return PHASES[id][phase][1];return CLOSING}
function resetType(next){if(next==='sf-focus-2'&&!mayAdvance())return;stopAudio();stopClock();id=next;phase=0;consent=false;performed=false;notification='';error='';screen=1;render()}
function go(next){stopAudio();stopClock();notification='';error='';screen=Math.max(0,Math.min(3,next));render();}
const isReadonly=()=>!canPractice();
function hero(){return '<div class="hero"><img src="'+PREFIX+IMAGES[screen]+'" alt="SPM focalización sensorial · '+['Presentación','Preparación','Guía clínica','Registro final'][screen]+'" loading="eager"><button type="button" data-act="audio" data-audio class="voice-hotspot" aria-label="Escuchar instrucciones de esta pantalla" title="Escuchar instrucciones"></button></div>'}
function audioControls(){return '<div class="micro-actions"><button type="button" class="audio-control" data-act="audio" data-audio>🔊 Escuchar instrucciones</button><details class="more"><summary>Leer instrucciones</summary><p>'+safeText(audioText())+'</p></details></div>'}
function progress(){return '<div class="progress-rail" role="progressbar" aria-label="Recorrido" aria-valuemin="0" aria-valuemax="4" aria-valuenow="'+(screen+1)+'"><i style="width:'+((screen+1)*25)+'%"></i></div>'}
function selection(){return '<div class="mode-picker"><p class="eyebrow">Elige cómo practicar</p>'+
  ['sf-solo','sf-focus-1','sf-focus-2','sf-communication','sf-recovery'].map(key=>'<button type="button" data-act="mode" data-value="'+key+'" class="mode-card'+(id===key?' selected':'')+'" '+(key==='sf-focus-2'&&!mayAdvance()?'disabled':'')+'>'+safeText(LABELS[key])+(key==='sf-focus-2'&&!mayAdvance()?' · Primero Focus I cómodo':'')+'</button>').join('')+'</div>'}
function introScreen(){return '<section class="card"><p class="eyebrow">SPM · SENSATE FOCUS</p><h2>Sentir, sin demostrar</h2><p>Tu objetivo es percibir, no rendir. Vamos a practicar con el recurso clínico de SPM, paso a paso.</p><p class="note">La biblioteca mantiene Focus I, Focus II, práctica individual, comunicación y recuperación.</p>'+(!isDaily?selection():'')+'</section>'+
API_NOTE;}
function range(name,label,lo,hi){return '<label class="range"><span>'+label+' <strong data-val="'+name+'">'+data[name]+'</strong>/10</span><input type="range" min="0" max="10" step="1" data-field="'+name+'" value="'+data[name]+'" aria-label="'+label+'"><small>'+lo+' <span>'+hi+'</span></small></label>'}
function prepScreen(){const possible=isDaily&&assigned?.practiceId==='sf-focus-1';
return '<section class="card"><p class="eyebrow">'+(isDaily?'DÍA '+originalDay+' · '+safeText(assigned?.title||'Práctica'):'PRÁCTICA A TU RITMO')+'</p>'+
'<h2>Prepárate</h2><p>Privacidad, tranquilidad y ausencia de presión.</p>'+
  (possible?'<div class="small-choices"><button type="button" data-act="mode" data-value="sf-solo" class="'+(id==='sf-solo'?'picked':'')+'">Individual</button><button type="button" data-act="mode" data-value="sf-focus-1" class="'+(id==='sf-focus-1'?'picked':'')+'">En pareja · Focus I</button>'+(assigned.optionalProgression?'<button type="button" data-act="mode" data-value="sf-focus-2" '+(!mayAdvance()?'disabled':'')+' class="'+(id==='sf-focus-2'?'picked':'')+'">Focus II · opcional</button>':'')+'</div>':'')+
  '<div class="clinic-line"><b>'+safeText(LABELS[id])+'</b><p>'+ (id==='sf-focus-1'?'Por turnos: A toca, B recibe y después cambian. Sin genitales ni pecho.':id==='sf-focus-2'?'Solo si ambos desean avanzar. Pueden volver al contacto no genital.':id==='sf-communication'?'Practicarás las cuatro frases de comunicación y luego volverás a las sensaciones.':'Respira y observa un contacto cómodo, sin buscar excitación.')+'</p></div>'+
  (isPartner()?'<label class="consent"><input type="checkbox" data-field="consent" '+(consent?'checked':'')+'> Ambos queremos participar y podemos parar en cualquier momento.</label>':'')+
  '<div class="two-ranges">'+range('presenceBefore','Presencia al empezar','Disperso','Presente')+range('pressureBefore','Presión al empezar','Baja','Alta')+'</div>'+
  '<p class="notice" role="note">Sin obligación de erección, penetración u orgasmo. Si algo incomoda, cambia el contacto o detente.</p></section>';
}
function guideScreen(){const p=PHASES[id][phase];
return '<section class="card"><p class="eyebrow">'+safeText(LABELS[id])+' · PASO '+(phase+1)+'/5</p><h2>'+safeText(p[0])+'</h2><p class="cue">'+safeText(p[1])+'</p>'+
'<div class="steps-progress">'+PHASES[id].map((item,i)=>'<button type="button" data-act="phase" data-value="'+i+'" class="'+(phase===i?'current':i<phase?'done':'')+'" title="'+safeText(item[0])+'">'+(i+1)+'</button>').join('')+'</div>'+
'<div class="time-box"><div><span>Cronómetro opcional</span><strong data-clock>'+clockText(t)+'</strong><small>Referencia para esta fase: '+Math.round(p[2]/60*10)/10+' min · sin obligación de cumplirla</small></div><button data-act="timer" type="button" class="secondary">'+(running?'Pausar':'▶ Iniciar')+'</button></div>'+
'<div class="guide-buttons"><button type="button" data-act="audio" data-audio class="audio-control">🔊 Escuchar este paso</button><button type="button" data-act="nextphase" class="gold">'+(phase===PHASES[id].length-1?'Terminar pasos':'Siguiente paso')+'</button></div>'+
'<div class="guide-buttons"><button type="button" data-act="refocus" class="secondary">Volver a la sensación ('+data.monitoringIntrusions+')</button>'+(id==='sf-focus-2'?'<button type="button" data-act="pressure" class="secondary">La presión aumentó</button>':'')+'</div>'+
'<details class="more"><summary>Leer la instrucción completa</summary><p>'+safeText(p[1])+'</p><p>Cualquiera puede pedir una pausa. La práctica puede terminar cuando lo necesites.</p></details>'+
'<button type="button" data-act="performed" class="full secondary">✓ Ya realicé esta práctica</button>'+
(performed?'<p class="saved-caption">Tu práctica está confirmada. Ya puedes registrar cómo te sentiste.</p>':'')+'</section>'+API_NOTE;
}
function chipField(name,title,options){return '<fieldset class="chips"><legend>'+title+'</legend>'+options.map(x=>'<label class="'+(data[name]===x[0]?'chosen':'')+'"><input type="radio" name="'+name+'" data-field="'+name+'" value="'+x[0]+'" '+(data[name]===x[0]?'checked':'')+'><span>'+x[1]+'</span></label>').join('')+'</fieldset>'}
function closeScreen(){return '<section class="card"><h2>¿Cómo te fue?</h2><p>Registra tu experiencia sin exigirte resultados perfectos.</p>'+
  chipField('comfort','Me sentí',[['comodo','Cómodo'],['neutro','Neutro'],['tenso','Tenso']])+
  chipField('ease','La práctica fue',[['facil','Fácil'],['intermedia','Intermedia'],['dificil','Difícil']])+
  chipField('attention','Noté',[['conexion','Conexión'],['distraccion','Distracción'],['ansiedad','Ansiedad']])+
  chipField('repeat','Quiero repetir',[['si','Sí'],['aun_no','Aún no']])+
  chipField('discomfort','¿Hubo molestia o dolor?',[['ninguna','No'],['molestia','Molestia'],['dolor','Dolor']])+
  (data.discomfort==='dolor'?'<p class="warning">Detén el contacto que causa dolor. Si persiste o reaparece, busca valoración profesional.</p>':'')+
  '<details class="more"><summary>Medidas clínicas de la práctica</summary><div class="two-ranges">'+range('presenceAfter','Presencia al terminar','Disperso','Presente')+range('pressureAfter','Presión al terminar','Baja','Alta')+range('enjoyment','Disfrute','Bajo','Alto')+(isPartner()?range('partnerComfort','Comodidad de tu pareja','Incómoda','Cómoda'):'')+'</div></details>'+
  '<p class="eyebrow">Contacto más fácil de sentir (opcional)</p><div class="stimuli">'+['Caricia lenta','Presión firme','Roce suave','Calor de la mano','Espalda','Brazos','Cuello','Manos','Piernas'].map(s=>'<button type="button" class="'+(data.usefulStimuli.includes(s)?'picked':'')+'" data-act="stimulus" data-value="'+safeText(s)+'">'+safeText(s)+'</button>').join('')+'</div>'+
  '<details class="more"><summary>Añadir una observación</summary><textarea data-field="notes" maxlength="700" placeholder="Algo que quieras recordar…">'+safeText(data.notes)+'</textarea></details>'+
  '<div class="result-preview">Presencia '+data.presenceBefore+' → '+data.presenceAfter+' · Presión '+data.pressureBefore+' → '+data.pressureAfter+'</div>'+
  '<p class="note">La práctica se fortalece con repetición. No necesitas progresar a Focus II si Focus I aún requiere comodidad.</p>'+
  '<button type="button" data-act="save" class="gold full" '+(saved||busy?'disabled':'')+'>'+(saved?'✓ Registro guardado':busy?'Guardando…':'Guardar experiencia')+'</button>'+
  (saved?'<button type="button" data-act="close" class="secondary full">Volver a mi programa</button>':'')+'</section>';
}
function footer(){if(screen===3)return '<div class="foot"><button type="button" data-act="back" class="secondary">Anterior</button><span>4 / 4</span><button type="button" data-act="close" class="secondary">Cerrar</button></div>';
return '<div class="foot"><button type="button" data-act="back" class="secondary" '+(screen===0?'disabled':'')+'>Anterior</button><span>'+(screen+1)+' / 4</span><button type="button" data-act="next" class="gold">'+(screen===0?'Comenzar':screen===1?'Iniciar práctica':performed?'Evaluar':'Continuar')+'</button></div>'}
function render(){const c=api.getContext();const restricted=c?.restriction!=='none';const title=isDaily?safeText(assigned?.title||LABELS[id]):safeText(LABELS[id]);
root.innerHTML='<div class="layout"><header><div class="brand"><b>SPM</b><small>FOCALIZACIÓN SENSORIAL</small></div><div class="header-actions"><button type="button" data-act="library" class="subtle" title="Biblioteca">Biblioteca</button><button type="button" data-act="close" class="close" aria-label="Cerrar">×</button></div></header>'+progress()+
'<main><p class="meta">'+(isDaily?'DÍA '+originalDay+' / 28 · ':'BIBLIOTECA · ')+title+'</p>'+hero()+audioControls()+
(restricted?'<p class="warning">La práctica física está en pausa por una indicación de seguridad. Puedes consultar los recursos educativos, pero no registrar una práctica nueva.</p>':'')+
(screen===0?introScreen():screen===1?prepScreen():screen===2?guideScreen():closeScreen())+
(error?'<p class="warning" role="alert">'+safeText(error)+'</p>':'')+
(notification?'<p class="notify" role="status">'+safeText(notification)+'</p>':'')+
'</main>'+footer()+'</div>';
if(screen===3&&saved){const btn=root.querySelector('[data-act=save]');if(btn)btn.disabled=true;}
}
function readValue(el){const key=el.dataset.field;if(!key)return;if(key==='consent'){consent=el.checked;return}if(['pressureBefore','presenceBefore','presenceAfter','pressureAfter','enjoyment','partnerComfort'].includes(key)){data[key]=Number(el.value);touched.add(key);const label=root.querySelector('[data-val="'+key+'"]');if(label)label.textContent=data[key];return}if(key==='notes'){data.notes=el.value;return}data[key]=el.value;}
function recommendation(){if(data.discomfort==='dolor')return 'reduce-pressure';if(data.pressureAfter>=7||data.monitoringIntrusions>=4)return 'reduce-pressure';if(isPartner()&&['presenceAfter','pressureAfter','enjoyment','partnerComfort'].every(k=>touched.has(k))&&data.presenceAfter>=7&&data.pressureAfter<=3&&data.enjoyment>=6&&data.partnerComfort>=6)return 'progress';return 'repeat'}
async function save(){error='';notification='';if(saved){notification='Esta práctica ya está guardada.';render();return}if(busy)return;
if(!canPractice()){error='Tu programa indica una pausa de seguridad. No es posible registrar esta práctica.';render();return}
if(!performed){error='Primero confirma que realizaste la práctica guiada.';render();return}
if(isPartner()&&!consent){error='Para una práctica en pareja, ambos deben haber aceptado participar.';render();return}
const missing=['comfort','ease','attention','repeat','discomfort'].find(x=>!data[x]);
if(missing){error='Selecciona cómo te sentiste, dificultad, atención, ganas de repetir y molestias.';render();return}
if(isDaily){try{if(await api.isDailyCompleted?.()){saved=true;notification='Esta práctica ya está completada en tu programa. No se duplicó.';render();return;}}catch{error='No pude comprobar si la actividad estaba guardada. Reintenta sin modificar datos.';render();return;}}
busy=true;render();
try{
 const rows=readRecords(),day=Number(api.getContext().day),entry={
  id:entryId||(entryId=(window.crypto?.randomUUID?.()||'sensate-'+Date.now()+'-'+Math.floor(Math.random()*100000))),
  day,origin:isDaily?'dailyPlan':'library',practiceId:id,completed:true,savedAt:new Date().toISOString(),
  presenceBefore:data.presenceBefore,presenceAfter:data.presenceAfter,pressureBefore:data.pressureBefore,pressureAfter:data.pressureAfter,
  enjoyment:data.enjoyment,monitoringIntrusions:data.monitoringIntrusions,partnerComfort:isPartner()?data.partnerComfort:null,
  usefulStimuli:data.usefulStimuli.slice(),recommendation:recommendation(),
  difficulty:data.ease,discomfort:data.discomfort,comfort:data.comfort,attention:data.attention,wantsRepeat:data.repeat,notes:data.notes.trim()
 };
 const index=rows.findIndex(x=>x.id===entry.id);if(index>=0)rows[index]=entry;else rows.push(entry);
 if(!api.write(KEY,JSON.stringify(rows)))throw Error('session');
 await api.flush();
 if(isDaily){const ok=await api.recordDaily();if(ok===false)throw Error('daily')}
 saved=true;notification='Experiencia guardada en tu programa SPM ✓';
}catch(e){error='No se pudo guardar o completar la actividad. Tus respuestas permanecen aquí para reintentar.'}
finally{busy=false;render()}
}
root.addEventListener('click',e=>{const button=e.target.closest('[data-act]');if(!button||button.disabled)return;const act=button.dataset.act;
 if(act==='audio'){speech(audioText());return}
 if(act==='close'){stopAudio();stopClock();api.close();return}
 if(act==='library'){stopAudio();stopClock();if(isDaily){api.openLibrary();return}screen=0;render();return}
 if(act==='back'){if(screen>0)go(screen-1);return}
 if(act==='mode'){resetType(button.dataset.value);return}
 if(act==='next'){error='';if(screen===1){if(!canPractice()){error='La práctica está en pausa por indicación de seguridad.';render();return}if(isPartner()&&!consent){error='Ambos deben aceptar participar antes de empezar.';render();return}}
 if(screen===2&&!performed){error='Marca «Ya realicé esta práctica» cuando hayas terminado; no se registra automáticamente.';render();return}
 if(screen<3)go(screen+1);return}
 if(act==='phase'){stopAudio();phase=Number(button.dataset.value)||0;render();return}
 if(act==='nextphase'){stopAudio();if(phase<PHASES[id].length-1)phase++;else performed=true;render();return}
 if(act==='refocus'){data.monitoringIntrusions++;notification='Vuelve a una sensación cómoda: temperatura, textura o presión.';render();return}
 if(act==='pressure'){phase=0;notification='Vuelvan al contacto no genital y a un ritmo cómodo.';render();return}
 if(act==='timer'){startClock();return}
 if(act==='performed'){performed=true;stopClock();notification='La práctica quedó confirmada. Puedes evaluar tu experiencia.';render();return}
 if(act==='stimulus'){const v=button.dataset.value;data.usefulStimuli=data.usefulStimuli.includes(v)?data.usefulStimuli.filter(x=>x!==v):data.usefulStimuli.concat(v);button.classList.toggle('picked',data.usefulStimuli.includes(v));return}
 if(act==='save'){void save();return}
});
root.addEventListener('input',e=>{const el=e.target.closest('[data-field]');if(el)readValue(el)});
root.addEventListener('change',e=>{const el=e.target.closest('[data-field]');if(el){readValue(el);if(el.type==='radio'){el.closest('fieldset')?.querySelectorAll('label').forEach(label=>label.classList.toggle('chosen',label.querySelector('input')?.checked===true));if(el.name==='discomfort'&&el.value==='dolor')notification='Detén el contacto que causa dolor y consulta si persiste.';}}});
if(isDaily){Promise.resolve().then(()=>api.isDailyCompleted?.()).then(v=>{if(v===true){saved=true;notification='Esta actividad ya está completada en tu programa. No se duplicará.';render();}}).catch(()=>{});}
window.addEventListener('pagehide',()=>{stopAudio();stopClock()});
window.addEventListener('spm:sensate-context',()=>{if(!canPractice()&&running){stopClock()}stopAudio();render()});
render();
})();