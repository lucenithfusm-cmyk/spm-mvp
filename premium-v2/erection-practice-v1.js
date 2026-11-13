(()=>{
'use strict';
if(window.SPM_ERECTION_PRACTICE)return;

const scripts={
 1:'Vamos a reconocer tu punto de partida. Recuerda una experiencia reciente, sin provocar una erección ni hacer una prueba. Mira la lámina y elige la descripción que corresponde a lo que viviste. Cuatro: erección completa. Tres: erección incompleta, pero con firmeza suficiente para la penetración. Dos: hay rigidez, pero no es suficiente para la penetración. Uno: aumento de tamaño, pero no es una erección. Si en esa experiencia no hubo respuesta, elige “Sin respuesta eréctil”. Si no tuviste una experiencia que puedas valorar, elige “No evaluable”. Son opciones diferentes. El dibujo es orientativo: el ángulo no determina tu nivel. Puedes ampliar la imagen para verla mejor. Al terminar, confirma que hiciste la observación y pulsa “Guardar práctica y continuar”.',
 2:'Hoy vas a reconocer en qué contextos cambia tu respuesta. Primero, recuerda únicamente situaciones que ya hayas vivido: una erección espontánea o al despertar, una experiencia individual y una experiencia con pareja. Para cada contexto, elige si la respuesta apareció con facilidad, fue variable, hubo dificultad o no puedes evaluarla. Si ese contexto no se presentó, marca «No evaluable». No necesitas buscar una experiencia nueva para responder. Después, elige qué aspecto reconoces más: iniciar la erección, mantenerla, recuperarla, ninguna dificultad o no evaluable. Estas observaciones sirven para conocerte; por sí solas no establecen una causa. Cuando termines, confirma que revisaste tus contextos y pulsa «Guardar práctica y continuar».',
 3:'Vamos a notar la tensión y volver a una sensación cómoda. Primero, siéntate o recuéstate con apoyo y deja que tu respiración siga su ritmo natural. Observa si estás apretando la mandíbula, elevando los hombros o tensando el abdomen. Marca lo que notes; también puedes indicar que no identificas tensión. Después, afloja con suavidad donde te resulte cómodo, sin empujar ni hacer fuerza. Elige un apoyo para tu atención: el contacto de tus manos, el peso del cuerpo sobre la superficie o un sonido del ambiente. Quédate con esa sensación y vuelve a ella cuando aparezca una preocupación por tu respuesta. No busques provocar una erección. El cronómetro es opcional y no hay un tiempo mínimo para guardar. Si aparece dolor, mareo o malestar, detén la práctica. Al terminar, confirma que practicaste a tu ritmo y pulsa «Guardar práctica y continuar».',
 4:"Hoy vas a practicar cómo volver a las sensaciones cuando aparezca la necesidad de comprobar tu respuesta. Busca un momento tranquilo. Elige un contacto cómodo, por ejemplo una mano sobre el antebrazo; si participas con pareja, acuerden juntos lo que resulta agradable. Después, elige en pantalla dónde pondrás la atención: temperatura, contacto o ritmo. Explora esa sensación a tu ritmo. Si aparece «¿cómo estoy respondiendo?», reconoce el pensamiento y vuelve suavemente a lo que sientes. No necesitas provocar una erección ni conseguir una firmeza determinada. Al terminar, indica si pudiste volver a la sensación, si te costó o si no apareció una comprobación. El cronómetro es opcional. Si algo incomoda, puedes detenerte. Confirma que realizaste la práctica y pulsa «Guardar práctica y continuar».",
 5:"Hoy vas a reconocer qué facilita tu respuesta y qué suele frenarla. Usa experiencias que ya hayas vivido; no necesitas hacer una prueba. Primero, elige hasta tres facilitadores que reconozcas, como un contacto agradable, un ritmo cómodo, privacidad o conexión. Después, marca hasta dos factores que suelen dificultarte la experiencia, como prisa, cansancio, estrés o presión por responder. Si todavía no identificas alguno de estos grupos, elige «Aún no lo identifico». No tienes que llenar todas las opciones. Por último, escoge un solo ajuste pequeño para una próxima ocasión. Puede ser disponer de privacidad, dar más tiempo o expresar una preferencia. Si aún no lo sabes, elige seguir observando sin forzar. Confirma que revisaste tu mapa y pulsa «Guardar práctica y continuar».",
 6:"Tu práctica de hoy es reconocer y soltar el piso pélvico. Empieza en una posición cómoda, con apoyo. Antes de iniciar, comprueba mandíbula suelta, abdomen sin empujar y glúteos relajados. Abre la sesión indicada para ti y sigue sus pasos, respirando con comodidad. No sostengas la respiración ni aprietes para provocar una erección. Realiza contracciones únicamente si tu sesión las indica; no añadas fuerza ni repeticiones por tu cuenta. Si aparece dolor, molestia o más tensión, detente y registra esa respuesta. Al terminar, guarda el resultado del entrenador. Vuelve a Hoy y registra solo la práctica que hayas realizado. El apoyo de respiración tiene su propio registro."
};
const definitions={
 1:{title:'Reconoce tu punto de partida',summary:'Observa una experiencia reciente y elige la firmeza que recuerdas, o «No evaluable».'},
 2:{title:'Reconoce tus contextos',summary:'Reconoce cómo cambia tu respuesta en situaciones que ya has vivido.'},
 3:{title:'Reconoce y suelta la tensión',summary:'Observa la tensión, suelta con suavidad y elige una sensación para tu atención.'},
 4:{title:'Vuelve a las sensaciones',summary:'Elige una sensación y vuelve a ella cuando notes que estás comprobando tu respuesta.'},
 5:{title:'Reconoce lo que te ayuda',summary:'Reconoce facilitadores e inhibidores y elige un ajuste pequeño para una próxima ocasión.'},
 6:{title:'Tu práctica de piso pélvico',summary:'Escucha la guía y realiza la única sesión pélvica indicada para ti.'}
};
const contexts=['spontaneous','solo','partner'];
const contextValues=['easy','variable','difficult','not_evaluable'];
const aspects=['initiate','maintain','recover','none','not_evaluable'];
const areas=['jaw','shoulders','abdomen','none'];
const anchors=['hands','support','sound'];
const senses=['temperature','contact','rhythm'];
const experiences=['returned','difficult','no_checking'];
const facilitators=['contact','imagination','anticipation','novelty','rhythm','privacy','connection','solo','unknown'];
const inhibitors=['pressure','rush','fatigue','stress','privacy','unknown'];
const adjustments=['privacy','time','rhythm','communicate','observe'];
const practiceDays=new Set([1,2,3,4,5]);
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const scope=c=>typeof c?.userId==='string'&&c.userId&&typeof c.planId==='string'&&c.planId?c.userId+':'+c.planId:'';
const context=()=>window.SPM_RESOURCE_CONTEXT?.();
let current=null,sequence=0;

function definition(day){
 const item=definitions[Number(day)];
 return item?{...item,script:scripts[Number(day)],audioSrc:Number(day)===1?'/premium-v2/assets/audio/erection/erection-day-1-ehs-20261113.mp3':'/premium-v2/assets/audio/erection/erection-day-'+Number(day)+'-20261113.mp3'}:null;
}
function supports(c,a){return c?.primary==='erection'&&a?.id==='main'&&a.kind==='erection'&&practiceDays.has(Number(c.day));}
function score(value){return value===null||Number.isInteger(value)&&value>=0&&value<=10;}
function selection(value,options,max){return Array.isArray(value)&&value.length>0&&value.length<=max&&new Set(value).size===value.length&&value.every(item=>options.includes(item))&&(!value.includes('unknown')||value.length===1);}
function reflection(record){return typeof record.finalFeeling==='string'&&record.finalFeeling.length<=1000&&(record.seconds===null||Number.isSafeInteger(record.seconds)&&record.seconds>=0);}
function valid(record,day){
 if(!record||Array.isArray(record)||record.erectionPracticeVersion!==1||record.day!==Number(day)||!practiceDays.has(Number(day))||record.confirmed!==true||!score(record.anxiety)||!score(record.confidence))return false;
 if(Number(day)===1)return record.ehs===null?record.ehsEvaluable===false:Number.isInteger(record.ehs)&&record.ehs>=0&&record.ehs<=4&&record.ehsEvaluable===true;
 if(Number(day)===2)return !!record.contexts&&contexts.every(key=>contextValues.includes(record.contexts[key]))&&aspects.includes(record.responseAspect);
 if(Number(day)===3)return Array.isArray(record.tensionAreas)&&record.tensionAreas.length>0&&new Set(record.tensionAreas).size===record.tensionAreas.length&&record.tensionAreas.every(area=>areas.includes(area))&&(!record.tensionAreas.includes('none')||record.tensionAreas.length===1)&&anchors.includes(record.sensoryAnchor)&&reflection(record);
 if(Number(day)===4)return senses.includes(record.attentionSense)&&experiences.includes(record.practiceExperience)&&reflection(record);
 return selection(record.erectionFacilitators,facilitators,3)&&selection(record.erectionInhibitors,inhibitors,2)&&adjustments.includes(record.microAdjustment);
}
function assignment(c){try{return window.SPM_DAILY_PRACTICE?.assignments(c)?.find(a=>a.id==='main');}catch{return null;}}
function allowed(c,a){try{return typeof window.SPM_DAILY_PRACTICE?.restricted==='function'&&!window.SPM_DAILY_PRACTICE.restricted(c,a);}catch{return false;}}
function matches(s,dom=true){
 if(current!==s||s.token!==sequence)return false;
 const c=context(),a=assignment(c),api=window.SPM_DAILY_PRACTICE;
 if(scope(c)!==s.scope||Number(c?.day)!==s.day||!supports(c,a)||!allowed(c,a))return false;
 if(typeof api?.active==='function'){
  const active=api.active();
  if(!active||active.id!=='main'||active.scope!==s.scope||Number(active.day)!==s.day)return false;
 }
 return !dom||s.host.isConnected&&document.getElementById('spmDailyWorkspace')===s.host&&s.panel?.isConnected&&s.host.contains(s.panel);
}
function elapsed(s){return s.clock.total+(s.clock.started===null?0:Math.max(0,performance.now()-s.clock.started));}
function drawTimer(s){
 const output=s.panel?.querySelector('[data-erection-time]');if(!output)return;
 const seconds=Math.floor(elapsed(s)/1000);output.textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
 const button=s.panel.querySelector('[data-erection-timer-toggle]');if(button)button.textContent=s.clock.started!==null?'Pausar':s.clock.used?'Continuar':'Iniciar';
}
function pauseTimer(s){
 if(s.clock.started!==null){s.clock.total=elapsed(s);s.clock.started=null;}
 if(s.clock.interval!==null){clearInterval(s.clock.interval);s.clock.interval=null;}
 drawTimer(s);
}
function stopAudio(s){window.SPM_CHECKPOINT_AUDIO?.stop(s?.panel||s?.host);}
function pause(){if(current){pauseTimer(current);stopAudio(current);}}
function stop(){const previous=current;current=null;sequence++;if(previous){pauseTimer(previous);stopAudio(previous);}}
function message(s,text){const target=s.panel?.querySelector('[data-erection-status]');if(target)target.textContent=text;}
function returnToToday(s){if(!matches(s))return;stop();window.SPM_DAILY_PRACTICE?.open();}
function shell(s,content){
 const item=definition(s.day);
 s.host.innerHTML='<section class="spm-erection-practice" data-erection-practice data-day="'+s.day+'" aria-labelledby="spmErectionPracticeTitle"><header><span class="spm-erection-eyebrow">DÍA '+s.day+' · ERECCIÓN Y FIRMEZA</span><h2 id="spmErectionPracticeTitle">'+esc(item.title)+'</h2></header>'+content+'</section>';
 s.panel=s.host.firstElementChild;
 s.panel.querySelector('[data-erection-back]')?.addEventListener('click',()=>returnToToday(s));
}
const back='<button type="button" class="btn sec" data-erection-back>Volver a mis actividades</button>';
const timerMarkup='<section class="spm-erection-timer" aria-label="Cronómetro opcional"><div><h3>Tu tiempo, a tu ritmo</h3><p>Opcional · sin tiempo mínimo</p></div><output data-erection-time aria-label="Tiempo de práctica">00:00</output><div class="spm-erection-timer-actions"><button type="button" class="btn sec" data-erection-timer-toggle>Iniciar</button><button type="button" class="btn sec" data-erection-timer-reset>Reiniciar</button></div></section>';
function choices(name,options,type='radio'){
 return '<div class="spm-erection-options">'+options.map(([value,label])=>'<label class="spm-erection-option"><input type="'+type+'" name="'+name+'" value="'+value+'"><span>'+label+'</span></label>').join('')+'</div>';
}
function task(day){
 if(day===1)return '<fieldset><legend>¿Qué firmeza recuerdas?</legend><p class="spm-erection-hint">Usa una experiencia que ya hayas vivido.</p>'+(window.SPM_FIRMNESS_GUIDE?.html()||'')+choices('ehs',[
  ['4','<b>4</b> Erección completa'],['3','<b>3</b> Erección incompleta, pero permite penetración'],['2','<b>2</b> Hay rigidez, pero no es suficiente para la penetración'],['1','<b>1</b> Aumento de tamaño, pero no es una erección']
 ])+'<div class="spm-erection-alternatives">'+choices('ehs',[
  ['0','Sin respuesta eréctil'],['na','No evaluable']
 ])+'</div></fieldset>';
 if(day===2)return '<fieldset><legend>1. Recuerda tus contextos</legend><div class="spm-erection-contexts">'+[['spontaneous','Espontánea o al despertar'],['solo','Experiencia individual'],['partner','Experiencia con pareja']].map(([key,label])=>'<label><span>'+label+'</span><select name="context-'+key+'" required><option value="">Elige una opción</option><option value="easy">Con facilidad</option><option value="variable">Variable</option><option value="difficult">Con dificultad</option><option value="not_evaluable">No evaluable</option></select></label>').join('')+'</div></fieldset><fieldset><legend>2. ¿Qué aspecto reconoces más?</legend>'+choices('responseAspect',[
  ['initiate','Iniciar la erección'],['maintain','Mantenerla'],['recover','Recuperarla'],['none','Ninguna dificultad'],['not_evaluable','No evaluable']
 ])+'</fieldset>';
 if(day===4)return '<fieldset><legend>1. Elige dónde poner tu atención</legend>'+choices('attentionSense',[
  ['temperature','Temperatura'],['contact','Contacto'],['rhythm','Ritmo']
 ])+'</fieldset>'+timerMarkup+'<fieldset><legend>2. ¿Qué ocurrió al practicar?</legend>'+choices('practiceExperience',[
  ['returned','Pude volver a la sensación'],['difficult','Me costó volver'],['no_checking','No apareció una comprobación']
 ])+'</fieldset>';
 if(day===5)return '<fieldset><legend>1. ¿Qué suele ayudarte?</legend><p class="spm-erection-hint">Elige hasta 3 facilitadores.</p>'+choices('erectionFacilitators',[
  ['contact','Contacto agradable'],['imagination','Imaginación o fantasía'],['anticipation','Anticipación'],['novelty','Novedad acordada'],['rhythm','Un ritmo cómodo'],['privacy','Privacidad'],['connection','Conexión emocional'],['solo','Exploración individual'],['unknown','Aún no lo identifico']
 ],'checkbox')+'</fieldset><fieldset><legend>2. ¿Qué suele dificultarte la experiencia?</legend><p class="spm-erection-hint">Elige hasta 2 inhibidores.</p>'+choices('erectionInhibitors',[
  ['pressure','Presión por responder'],['rush','Prisa'],['fatigue','Cansancio'],['stress','Estrés'],['privacy','Falta de privacidad'],['unknown','Aún no lo identifico']
 ],'checkbox')+'</fieldset><fieldset><legend>3. Elige un ajuste pequeño</legend>'+choices('microAdjustment',[
  ['privacy','Buscar privacidad'],['time','Darme más tiempo'],['rhythm','Ajustar el ritmo'],['communicate','Expresar una preferencia'],['observe','Seguir observando sin forzar']
 ])+'</fieldset>';
 return '<fieldset><legend>1. Nota dónde hay tensión</legend>'+choices('tensionArea',[
  ['jaw','Mandíbula'],['shoulders','Hombros'],['abdomen','Abdomen'],['none','No identifico tensión']
 ],'checkbox')+'</fieldset><fieldset><legend>2. Suelta con suavidad y elige tu ancla</legend>'+choices('sensoryAnchor',[
  ['hands','El contacto de mis manos'],['support','El apoyo de mi cuerpo'],['sound','Un sonido del ambiente']
 ])+'</fieldset>'+timerMarkup;
}
function optional(day){
 const options='<option value="">Sin registrar</option>'+Array.from({length:11},(_,n)=>'<option value="'+n+'">'+n+'</option>').join('');
 return '<details class="spm-erection-optional"><summary>Cómo te sentiste · opcional</summary><div><label><span>Presión por responder · 0–10</span><select name="anxiety">'+options+'</select></label><label><span>Confianza · 0–10</span><select name="confidence">'+options+'</select></label>'+([3,4].includes(day)?'<label class="spm-erection-full"><span>¿Qué notaste al terminar?</span><textarea name="finalFeeling" maxlength="1000" rows="3"></textarea></label>':'')+'</div></details>';
}
function restore(s,form){
 const prior=s.prior;
 for(const key of ['anxiety','confidence'])if(prior[key]!==null&&score(prior[key]))form.elements.namedItem(key).value=String(prior[key]);
 if(s.day===1){
  const value=prior.ehsEvaluable===true&&Number.isInteger(prior.ehs)&&prior.ehs>=0&&prior.ehs<=4?String(prior.ehs):prior.erectionPracticeVersion===1&&prior.ehs===null&&prior.ehsEvaluable===false?'na':null;
  if(value!==null)form.querySelector('[name="ehs"][value="'+value+'"]').checked=true;
 }else if(s.day===2){
  for(const key of contexts)if(contextValues.includes(prior.contexts?.[key]))form.elements.namedItem('context-'+key).value=prior.contexts[key];
  if(aspects.includes(prior.responseAspect))form.querySelector('[name="responseAspect"][value="'+prior.responseAspect+'"]').checked=true;
 }else if(s.day===3){
  if(Array.isArray(prior.tensionAreas)&&prior.tensionAreas.every(area=>areas.includes(area))&&(!prior.tensionAreas.includes('none')||prior.tensionAreas.length===1))for(const area of prior.tensionAreas)form.querySelector('[name="tensionArea"][value="'+area+'"]').checked=true;
  if(anchors.includes(prior.sensoryAnchor))form.querySelector('[name="sensoryAnchor"][value="'+prior.sensoryAnchor+'"]').checked=true;
 }else if(s.day===4){
  if(senses.includes(prior.attentionSense))form.querySelector('[name="attentionSense"][value="'+prior.attentionSense+'"]').checked=true;
  if(experiences.includes(prior.practiceExperience))form.querySelector('[name="practiceExperience"][value="'+prior.practiceExperience+'"]').checked=true;
 }else if(s.day===5){
  // New selections never infer a category from the mixed legacy stimuli list.
  for(const [name,options,max] of [['erectionFacilitators',facilitators,3],['erectionInhibitors',inhibitors,2]])if(selection(prior[name],options,max))for(const value of prior[name])form.querySelector('[name="'+name+'"][value="'+value+'"]').checked=true;
  if(adjustments.includes(prior.microAdjustment))form.querySelector('[name="microAdjustment"][value="'+prior.microAdjustment+'"]').checked=true;
 }
 if([3,4].includes(s.day)){
  if(typeof prior.finalFeeling==='string'&&prior.finalFeeling.length<=1000)form.elements.namedItem('finalFeeling').value=prior.finalFeeling;
  if((s.day===3||prior.erectionPracticeVersion===1)&&Number.isSafeInteger(prior.seconds)&&prior.seconds>=0){s.clock.total=prior.seconds*1000;s.clock.used=true;}
  drawTimer(s);
 }
 // Confirmation always belongs to this deliberate save, even on reopening.
 form.elements.namedItem('confirmed').checked=false;
}
function recordFrom(s,form){
 const number=name=>{const value=form.elements.namedItem(name).value;return value===''?null:/^(?:[0-9]|10)$/.test(value)?Number(value):undefined;};
 const checked=name=>form.querySelector('[name="'+name+'"]:checked')?.value;
 const selected=name=>[...form.querySelectorAll('[name="'+name+'"]:checked')].map(input=>input.value);
 const record={...s.prior,source:'erection-practice-v1',erectionPracticeVersion:1,day:s.day,activity:definition(s.day).title,confirmed:form.elements.namedItem('confirmed').checked,anxiety:number('anxiety'),confidence:number('confidence'),date:new Date().toISOString()};
 if(s.day===1){const value=checked('ehs');record.ehs=value==='na'?null:/^[0-4]$/.test(value||'')?Number(value):undefined;record.ehsEvaluable=value==='na'?false:value===undefined?undefined:true;}
 else if(s.day===2){record.contexts=Object.fromEntries(contexts.map(key=>[key,form.elements.namedItem('context-'+key).value]));record.responseAspect=checked('responseAspect');}
 else if(s.day===3){record.tensionAreas=selected('tensionArea');record.sensoryAnchor=checked('sensoryAnchor');}
 else if(s.day===4){record.attentionSense=checked('attentionSense');record.practiceExperience=checked('practiceExperience');}
 else if(s.day===5){record.erectionFacilitators=selected('erectionFacilitators');record.erectionInhibitors=selected('erectionInhibitors');record.microAdjustment=checked('microAdjustment');}
 if([3,4].includes(s.day)){record.finalFeeling=form.elements.namedItem('finalFeeling').value.trim();record.seconds=s.clock.used?Math.floor(elapsed(s)/1000):null;}
 return record;
}
function limitMessage(form){
 const manyFacilitators=form.querySelectorAll('[name="erectionFacilitators"]:checked').length>3,manyInhibitors=form.querySelectorAll('[name="erectionInhibitors"]:checked').length>2;
 return manyFacilitators&&manyInhibitors?'Elige como máximo 3 facilitadores y 2 inhibidores. Desmarca alguna opción para guardar.':manyFacilitators?'Elige como máximo 3 facilitadores. Desmarca alguna opción para guardar.':manyInhibitors?'Elige como máximo 2 inhibidores. Desmarca alguna opción para guardar.':'';
}
async function save(s,form){
 if(s.saving||!matches(s))return;
 const record=recordFrom(s,form);
 const limit=s.day===5?limitMessage(form):'';
 if(limit){message(s,limit);return;}
 if(!valid(record,s.day)){message(s,s.day===5?'Elige tus factores o «Aún no lo identifico» en cada grupo, selecciona un ajuste y confirma que revisaste tu mapa.':s.day===4?'Elige una sensación, registra qué ocurrió y confirma que realizaste la práctica.':'Elige tus respuestas y confirma que realizaste la observación. Puedes usar «No evaluable» cuando corresponda.');form.reportValidity();return;}
 s.saving=true;const button=form.querySelector('[data-erection-save]');button.disabled=true;message(s,'Guardando tu práctica…');pauseTimer(s);stopAudio(s);
 try{
  // There is no asynchronous work between this final check and the scoped save.
  if(!matches(s))return;
  await window.SPM_DAILY_PRACTICE.saveActivity('main',record,s.scope,s.day);
  if(matches(s)){s.prior=record;message(s,'Práctica guardada. Puedes continuar con tus actividades.');button.textContent='Práctica guardada ✓';}
 }catch{
  if(!matches(s))return;
  s.saving=false;button.disabled=false;message(s,'No pudimos guardar. Tus respuestas siguen aquí; reintenta. El día no ha avanzado.');
 }
}
function render(s){
 const item=definition(s.day),player=window.SPM_CHECKPOINT_AUDIO?.markup({src:item.audioSrc,text:item.script,label:'Escuchar guía'})||'<details><summary>Leer indicaciones</summary><p>'+esc(item.script)+'</p></details>';
 const confirmation={1:'Confirmo que hice esta observación.',2:'Confirmo que revisé los contextos que he vivido.',3:'Confirmo que practiqué a mi ritmo, sin forzar.',4:'Confirmo que realicé la práctica a mi ritmo.',5:'Confirmo que revisé mi mapa y elegí un ajuste.'}[s.day];
 shell(s,'<form data-erection-form>'+player+task(s.day)+optional(s.day)+'<label class="spm-erection-confirm"><input type="checkbox" name="confirmed" required><span>'+confirmation+'</span></label><div class="spm-erection-actions"><button type="submit" class="btn pri" data-erection-save>Guardar práctica y continuar</button>'+back+'</div><p data-erection-status role="status" aria-live="polite"></p></form>');
 const form=s.panel.querySelector('form');restore(s,form);
 const transcript=form.querySelector('[data-checkpoint-audio-transcript]>summary');if(transcript)transcript.textContent='Leer indicaciones';
 window.SPM_CHECKPOINT_AUDIO?.bind(form);
 window.SPM_FIRMNESS_GUIDE?.bind(form);
 form.addEventListener('submit',event=>{event.preventDefault();save(s,form);});
 if(s.day===3){
  form.querySelectorAll('[name="tensionArea"]').forEach(input=>input.addEventListener('change',()=>{
   if(!input.checked)return;
   if(input.value==='none')form.querySelectorAll('[name="tensionArea"]').forEach(other=>{if(other!==input)other.checked=false;});
   else form.querySelector('[name="tensionArea"][value="none"]').checked=false;
  }));
 }
 if(s.day===5)for(const name of ['erectionFacilitators','erectionInhibitors'])form.querySelectorAll('[name="'+name+'"]').forEach(input=>input.addEventListener('change',()=>{
  if(input.checked){
   if(input.value==='unknown')form.querySelectorAll('[name="'+name+'"]').forEach(other=>{if(other!==input)other.checked=false;});
   else form.querySelector('[name="'+name+'"][value="unknown"]').checked=false;
  }
  message(s,limitMessage(form));
 }));
 if([3,4].includes(s.day)){
  form.querySelector('[data-erection-timer-toggle]').addEventListener('click',()=>{
   if(!matches(s)||s.saving)return;
   if(s.clock.started!==null)pauseTimer(s);
   else{s.clock.used=true;s.clock.started=performance.now();s.clock.interval=setInterval(()=>{if(!matches(s)){stop();return;}drawTimer(s);},1000);drawTimer(s);}
  });
  form.querySelector('[data-erection-timer-reset]').addEventListener('click',()=>{if(!matches(s)||s.saving)return;pauseTimer(s);s.clock.total=0;s.clock.used=false;drawTimer(s);});
 }
 s.panel.tabIndex=-1;s.panel.focus({preventScroll:true});s.panel.scrollIntoView?.({block:'start'});
}
async function load(s){
 if(!matches(s,false))return false;
 const request=++s.request;
 shell(s,'<p role="status" aria-busy="true">Recuperando tu práctica…</p>'+back);
 try{
  const rows=await window.SPM_DAILY_RECORDS.read(s.scope,s.day);
  if(request!==s.request||!matches(s))return false;
  const prior=rows?.main;s.prior=prior&&typeof prior==='object'&&!Array.isArray(prior)?{...prior}:{};
  render(s);return true;
 }catch{
  if(request!==s.request||!matches(s))return false;
  shell(s,'<p role="alert">No pudimos recuperar tu práctica. Reintenta antes de guardar; tus registros se conservan.</p><div class="spm-erection-actions"><button type="button" class="btn pri" data-erection-retry>Reintentar carga</button>'+back+'</div>');
  s.panel.querySelector('[data-erection-retry]').addEventListener('click',()=>{if(matches(s))load(s);});return false;
 }
}
async function open(a){
 stop();const c=context(),actual=assignment(c),host=document.getElementById('spmDailyWorkspace');
 if(!scope(c)||!supports(c,a)||!supports(c,actual)||!allowed(c,actual)||!host?.isConnected)return false;
 styles();
 const s={token:sequence,scope:scope(c),day:Number(c.day),host,panel:null,prior:{},request:0,saving:false,clock:{total:0,started:null,interval:null,used:false}};
 current=s;if(!matches(s,false)){stop();return false;}return load(s);
}
function styles(){
 if(document.getElementById('spmErectionPracticeStyle'))return;
 const style=document.createElement('style');style.id='spmErectionPracticeStyle';style.textContent=`
.spm-erection-practice{max-width:860px;margin:24px auto;padding:clamp(22px,4vw,40px);border:1px solid #c5a46c66;border-radius:24px;background:linear-gradient(145deg,#102d45,#091e29);color:#f3f6f7;font-family:inherit;font-size:18px;line-height:1.65;font-weight:400;box-sizing:border-box}
.spm-erection-practice *{box-sizing:border-box}.spm-erection-practice header{margin-bottom:26px}.spm-erection-eyebrow{font-size:13px;font-weight:750;letter-spacing:.12em;color:#dfc18f}.spm-erection-practice h2{margin:10px 0 0;font-size:clamp(28px,4.5vw,38px);line-height:1.2;letter-spacing:-.02em;color:#fff}.spm-erection-practice form{display:grid;gap:30px}.spm-erection-practice fieldset{min-width:0;margin:0;padding:0;border:0}.spm-erection-practice legend{width:100%;padding:0;margin-bottom:18px;font-size:23px;font-weight:700;line-height:1.35;color:#f3e6c7}.spm-erection-practice .spm-erection-hint{font-size:17px;margin:0 0 18px;color:#c1d2da}
.spm-erection-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.spm-erection-option{display:flex;align-items:center;gap:13px;min-height:78px;padding:18px;border:1px solid #4d6674;border-radius:16px;background:#0a2432;cursor:pointer;font-size:18px;line-height:1.5}.spm-erection-option:has(input:checked){border-color:#e5c58a;background:#24413e;box-shadow:0 0 0 1px #e5c58a}.spm-erection-option input,.spm-erection-confirm input{width:22px;height:22px;flex:0 0 22px;margin:0;accent-color:#dfbf83}.spm-erection-option b{display:block;color:#edcf92;font-size:25px;line-height:1.2;margin-bottom:7px}.spm-erection-option:focus-within{outline:3px solid #dfbf83;outline-offset:4px}
.spm-erection-alternatives{margin-top:22px;padding-top:22px;border-top:1px solid #4d6674}.spm-erection-alternatives .spm-erection-option{min-height:66px}
.spm-erection-contexts{display:grid;gap:22px}.spm-erection-contexts label,.spm-erection-optional label{display:grid;gap:9px;font-size:18px}.spm-erection-practice select,.spm-erection-practice textarea{width:100%;min-height:56px;padding:14px;border:1px solid #5c7481;border-radius:12px;background:#091e2b;color:#fff;font:inherit;font-size:18px;line-height:1.5}.spm-erection-practice textarea{resize:vertical}.spm-erection-practice select:focus-visible,.spm-erection-practice textarea:focus-visible,.spm-erection-practice button:focus-visible,.spm-erection-practice summary:focus-visible{outline:3px solid #dfbf83;outline-offset:4px}
.spm-erection-optional{border-top:1px solid #476270;padding-top:20px}.spm-erection-optional summary{width:fit-content;min-height:48px;padding:8px 0;color:#e1c48c;font-size:19px;cursor:pointer}.spm-erection-optional>div{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:20px}.spm-erection-full{grid-column:1/-1}.spm-erection-confirm{display:flex;align-items:flex-start;gap:14px;padding:20px;border:1px solid #567267;border-radius:16px;background:#15302f;font-size:18px;line-height:1.6}.spm-erection-confirm input{margin-top:4px}
.spm-erection-actions,.spm-erection-timer-actions{display:flex;flex-wrap:wrap;gap:14px}.spm-erection-practice .btn{min-height:56px;padding:14px 20px;font-size:18px;line-height:1.45;white-space:normal}.spm-erection-practice .btn.pri{background:#d7b879;color:#112736;border-color:#d7b879}.spm-erection-practice .btn.sec{background:#102b3c;border:1px solid #617987;color:#f0f4f5}.spm-erection-practice [data-erection-status]{margin:0;font-size:17px;color:#e5d2a5}.spm-erection-practice [data-erection-status]:empty{display:none}
.spm-erection-timer{display:flex;align-items:center;flex-wrap:wrap;gap:20px;padding:22px;border:1px solid #496775;border-radius:18px;background:#0a2331}.spm-erection-timer h3{margin:0;font-size:21px;color:#f0e0bc}.spm-erection-timer p{margin:5px 0 0;font-size:16px;color:#bfd0d9}.spm-erection-timer output{font-size:34px;line-height:1.2;font-variant-numeric:tabular-nums;color:#edcf92}.spm-erection-practice .spm-checkpoint-audio{margin:0;max-width:none}.spm-erection-practice .spm-checkpoint-audio-transcript{font-size:18px!important;line-height:1.75!important}
@media(max-width:540px){.spm-erection-practice{padding:24px 18px;border-radius:20px}.spm-erection-options,.spm-erection-optional>div{grid-template-columns:1fr}.spm-erection-practice legend{font-size:21px}.spm-erection-actions{display:grid}.spm-erection-actions .btn{width:100%}.spm-erection-timer{padding:18px}.spm-erection-option{min-height:72px}}
`;
 document.head.appendChild(style);
}
const checkContext=()=>{if(current&&!matches(current))stop();};
window.addEventListener('spm:resourcecontext',checkContext);
window.addEventListener('spm:session-change',checkContext);
new MutationObserver(checkContext).observe(document.body,{childList:true,subtree:true});
window.SPM_ERECTION_PRACTICE={supports,definition,open,valid,pause,stop};
})();
