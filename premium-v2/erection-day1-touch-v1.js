(()=>{
'use strict';
if(window.SPM_ED_DAY1_TOUCH)return;
const BASE='/premium-v2/assets/erection-day1/';
const IMAGES=[1,2,3,4,5,6].map(n=>BASE+'spm-de-day1-screen-0'+n+'.webp');
const EHS_AUDIO='/premium-v2/assets/audio/erection/erection-day-1-ehs-20261113.mp3';
const GUIDE_IMAGE='/premium-v2/assets/images/erection/response-firmness-spm-20261113.jpg';
const LABELS={
 '0':['Sin respuesta','No hubo respuesta eréctil en la experiencia recordada.'],
 '1':['Aumento de tamaño','Hubo aumento de tamaño, sin rigidez suficiente para considerarlo una erección.'],
 '2':['Rigidez insuficiente','Apareció rigidez, pero no fue suficiente para la penetración.'],
 '3':['Rigidez incompleta','La firmeza permitió penetración, aunque no fue completa.'],
 '4':['Erección completa','La firmeza fue completa durante la experiencia que recuerdas.'],
 'na':['No evaluable','No has tenido una experiencia reciente que permita valorar la firmeza. No significa ausencia de respuesta.']
};
const TEXT={
 1:'Bienvenido a Erección y firmeza. En este primer día reconocerás tu punto de partida y practicarás una habilidad sencilla: dirigir la atención a un estímulo agradable sin comprobar la erección. No necesitas provocar ninguna respuesta sexual. Primero revisa tu firmeza reciente; luego continúa con la práctica.',
 2:'Vamos a reconocer tu punto de partida. Recuerda una experiencia reciente, sin provocar una erección ni hacer una prueba. Mira la lámina y elige la descripción que corresponde a lo que viviste. Cuatro: erección completa. Tres: erección incompleta, pero con firmeza suficiente para la penetración. Dos: hay rigidez, pero no es suficiente para la penetración. Uno: aumento de tamaño, pero no es una erección. Si en esa experiencia no hubo respuesta, elige Sin respuesta eréctil. Si no tuviste una experiencia que puedas valorar, elige No evaluable. Son opciones diferentes. El dibujo es orientativo: el ángulo no determina tu nivel. Puedes ampliar la imagen para verla mejor.',
 3:'Comprende tu respuesta. La erección es una respuesta en la que participan el flujo sanguíneo, las señales del sistema nervioso y el contexto emocional. No depende solo de tu voluntad. Una experiencia aislada no define tu capacidad sexual. Pulsa una de las tres tarjetas para escuchar cada explicación.',
 4:'Ahora llevarás tu atención a un estímulo agradable, sin comprobar la firmeza. Hay tres momentos: elige un estímulo cómodo y seguro; observa sus detalles y lo que sientes; y, si te distraes, vuelve con calma. Puedes escuchar cada paso o pulsar Comenzar práctica para seguir la guía. El tiempo sugerido es de tres a cinco minutos, pero no es un examen ni un límite obligatorio.',
 5:'Reconoce cómo fue tu práctica, sin calificarte. Puedes indicar si mantuviste la atención, si te distrajiste y volviste, si te costó regresar o si preferiste omitirla. Elige lo que realmente ocurrió. Tu punto de partida ya se registrará con la respuesta de firmeza que seleccionaste.',
 6:'Tu punto de partida ha quedado registrado. Reconociste tu firmeza reciente y elegiste cómo fue la práctica de atención. Hoy puedes continuar con las demás actividades de tu ruta. Mañana seguirás explorando los contextos donde tu respuesta suele ser mejor.'
};
const EXPLAIN={
 blood:'Flujo sanguíneo. Durante la erección aumenta la entrada de sangre al tejido eréctil y cambia su capacidad para mantener la firmeza. No necesitas medirla durante esta práctica.',
 nerves:'Señal nerviosa. El cerebro y el sistema nervioso regulan los estímulos y las respuestas del cuerpo. El estrés y la atención pueden influir, sin que eso defina por sí solo una causa.',
 emotions:'Contexto emocional. La privacidad, la comodidad, el deseo, la conexión y las preocupaciones pueden modificar la experiencia. La variabilidad es posible y una sola situación no te define.'
};
const STEPS=[
 ['Elige un estímulo agradable','Busca privacidad. Elige una sensación, un recuerdo o un contacto que te resulte agradable y seguro. No necesitas conseguir una erección.'],
 ['Mantén la atención en el estímulo','Observa un detalle del estímulo: su textura, temperatura, ritmo o la sensación que despierta. Deja que tu respiración siga su ritmo natural. No compruebes la firmeza.'],
 ['Si te distraes, vuelve con calma','Si aparece la idea de evaluar cómo respondes, reconócela y dirige tu atención otra vez al estímulo. Puedes hacer una pausa, cambiarlo o terminar cuando lo desees.']
];
const OUTCOMES=['maintained','returned','difficult','omitted'];
const OUTCOME_LABELS={maintained:'Pude mantener la atención',returned:'Me distraje y volví',difficult:'Me costó volver',omitted:'Preferí omitir la práctica'};
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const rect=(x1,y1,x2,y2)=>`left:${(x1/941*100).toFixed(3)}%;top:${(y1/1672*100).toFixed(3)}%;width:${((x2-x1)/941*100).toFixed(3)}%;height:${((y2-y1)/1672*100).toFixed(3)}%`;
let instance=null,successOverlay=null;
function stopVoice(m){
 if(!m)return;
 try{m.player?.pause?.();if(m.player)m.player.currentTime=0}catch{}
 m.player=null;
 try{window.speechSynthesis?.cancel?.()}catch{}
 m.voiceKey=null;
 m.host.querySelectorAll('.spm-ed1-hit.playing').forEach(b=>b.classList.remove('playing'));
}
function stopClock(m){if(!m)return;if(m.interval){clearInterval(m.interval);m.interval=null}}
function pause(){if(!instance)return;stopVoice(instance);stopClock(instance)}
function stop(){const m=instance;instance=null;pauseFor(m)}
function pauseFor(m){if(!m)return;stopClock(m);stopVoice(m);m.dialog?.close?.()}
function voice(m,key,text,preferRecording=false){
 if(!m||(key!=='end'&&(m.busy||!m.valid())))return;
 if(m.voiceKey===key){stopVoice(m);return}
 stopVoice(m);m.voiceKey=key;
 const target=key==='end'?successOverlay?.querySelector('[data-ed1-success-audio]'):m.host.querySelector(`[data-ed1-audio="${key}"]`);
 const marked=()=>target?.classList.add('playing');
 const finished=()=>{if(m.voiceKey===key)m.voiceKey=null;target?.classList.remove('playing')};
 function tts(){
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){m.notice='Audio no disponible en este dispositivo. Puedes leer las indicaciones.';updateStatus(m);finished();return}
  const u=new SpeechSynthesisUtterance(text);u.lang='es-CO';u.rate=.94;u.pitch=1;u.volume=1;
  const voices=window.speechSynthesis.getVoices?.()||[];
  const spanish=voices.filter(v=>/^es(?:-|$)/i.test(v.lang||''));
  const voiceMatch=spanish.find(v=>/^es-co$/i.test(v.lang||'')&&/female|mujer|paulina|sofia|helena|maria|luciana|monica/i.test(v.name||''))||spanish.find(v=>/^es-co$/i.test(v.lang||''))||spanish.find(v=>/female|mujer|paulina|sofia|helena|maria/i.test(v.name||''))||spanish[0];
  if(voiceMatch)u.voice=voiceMatch;
  u.onend=finished;u.onerror=finished;
  try{window.speechSynthesis.speak(u);marked()}catch{finished();m.notice='No se pudo iniciar la narración; puedes leer la indicación.';updateStatus(m)}
 }
 if(preferRecording && window.Audio){
   try{const a=new Audio(EHS_AUDIO);m.player=a;a.preload='auto';a.onended=finished;a.onerror=()=>{if(m.voiceKey===key){m.player=null;tts()}};const playing=a.play();marked();if(playing?.catch)playing.catch(()=>{if(m.voiceKey===key){m.player=null;tts()}});return}catch{}
 }
 tts();
}
function hotspot(coords,act,label,extra={}){
 const opts={audio:null,value:null,selected:false,disabled:false};Object.assign(opts,extra);
 return `<button type="button" class="spm-ed1-hit${opts.audio?' audio':''}${opts.selected?' selected':''}" style="${rect(...coords)}" data-ed1-act="${esc(act)}"${opts.audio?` data-ed1-audio="${esc(opts.audio)}"`:''}${opts.value===null?'':` data-value="${esc(opts.value)}"`}${opts.selected?' aria-pressed="true"':opts.value!==null?' aria-pressed="false"':''}${opts.disabled?' disabled':''} aria-label="${esc(label)}"></button>`;
}
function nav(m){
 return `<nav class="spm-ed1-toolbar" aria-label="Navegación de Erección y firmeza"><button type="button" data-ed1-act="back">${m.screen===1?'← Volver a Hoy':'← Anterior'}</button><span>${m.screen} de 6 · Día 1</span><button type="button" data-ed1-act="exit">Salir a Hoy</button></nav>`;
}
function stage(m){let hits='',more='';
 if(m.screen===1){
  hits+=hotspot([165,490,770,604],'audio','Escuchar la introducción',{audio:'intro'});
  hits+=hotspot([35,1455,907,1593],'next','Comenzar: evaluar mi punto de partida');
 }else if(m.screen===2){
  hits+=hotspot([24,23,118,130],'back','Anterior: volver a la introducción');
  hits+=hotspot([45,340,169,427],'audio','Escuchar explicación de escala de firmeza',{audio:'ehs'});
  const ranges=[[20,451,195,721],[202,451,377,721],[379,451,557,721],[560,451,732,721],[736,451,915,721]];
  ranges.forEach((coords,n)=>hits+=hotspot(coords,'ehs',`Elegir nivel ${n}: ${LABELS[n][0]}`,{value:String(n),selected:m.ehs===String(n)}));
  hits+=hotspot([21,739,909,824],'ehs','Elegir No evaluable',{value:'na',selected:m.ehs==='na'});
  hits+=hotspot([369,1122,780,1202],'open-ehs','Ampliar lámina médica de firmeza');
  hits+=hotspot([23,1398,913,1515],'next','Continuar a comprender la respuesta');
  let note=m.ehs===null?['Elige una respuesta','Selecciona 0–4 o No evaluable. El nivel 4 dibujado en la imagen es un ejemplo visual; no queda seleccionado automáticamente.']:LABELS[m.ehs];
  more+=`<div class="spm-ed1-choice-summary" role="status" aria-live="polite"><span>${m.ehs===null?'SIN SELECCIÓN':m.ehs==='na'?'NO EVALUABLE':'NIVEL '+esc(m.ehs)+' SELECCIONADO'}</span><strong>${esc(note[0])}</strong><p>${esc(note[1])}</p></div>`;
 }else if(m.screen===3){
  hits+=hotspot([180,319,735,412],'audio','Escuchar explicación de la respuesta eréctil',{audio:'science'});
  hits+=hotspot([26,834,905,1002],'explain','Escuchar sobre flujo sanguíneo',{value:'blood',audio:'blood'});
  hits+=hotspot([26,1004,905,1175],'explain','Escuchar sobre señal nerviosa',{value:'nerves',audio:'nerves'});
  hits+=hotspot([26,1181,905,1351],'explain','Escuchar sobre contexto emocional',{value:'emotions',audio:'emotions'});
  hits+=hotspot([25,1468,910,1595],'next','Continuar a mi práctica');
 }else if(m.screen===4){
  hits+=hotspot([181,339,735,441],'audio','Escuchar guía de práctica',{audio:'practice'});
  [[26,754,910,949],[26,955,910,1140],[26,1147,910,1346]].forEach((coords,i)=>hits+=hotspot(coords,'step','Escuchar paso '+(i+1)+': '+STEPS[i][0],{value:String(i),audio:'step'+i}));
  hits+=hotspot([26,1458,913,1589],'begin','Comenzar la práctica guiada');
 }else if(m.screen===5){
  hits+=hotspot([185,305,765,415],'audio','Escuchar indicaciones para registrar la práctica',{audio:'review'});
  [[55,541,886,725],[55,742,886,929],[55,936,886,1121],[55,1136,886,1319]].forEach((coords,i)=>hits+=hotspot(coords,'outcome','Elegir '+OUTCOME_LABELS[OUTCOMES[i]],{value:OUTCOMES[i],selected:m.outcome===OUTCOMES[i]}));
  hits+=hotspot([26,1484,915,1606],'save','Guardar mi punto de partida y continuar',{disabled:m.busy});
  // Un único chulito azul se dibuja sobre la opción realmente seleccionada.
  // La lámina original está corregida: la primera opción no trae un check fijo.
  if(m.outcome!==null){
   const radioCenters=[[821,640],[821,842],[821,1044],[821,1242]];
   const idx=OUTCOMES.indexOf(m.outcome);
   if(idx>=0){
    const [cx,cy]=radioCenters[idx];
    more+=`<span class="spm-ed1-radio-check" aria-hidden="true" data-ed1-radio="${esc(m.outcome)}" style="${rect(cx-29,cy-29,cx+29,cy+29)}">✓</span>`;
   }
  }
  more+=`<div class="spm-ed1-answer-label" role="status">${m.outcome===null?'Toca una respuesta para seleccionarla. La primera es ilustrativa.':`Tu respuesta: ${esc(OUTCOME_LABELS[m.outcome])}`}</div>`;
 }
 return `<section class="spm-ed1-session" data-ed1-session data-screen="${m.screen}" aria-label="Erección y firmeza, día 1, pantalla ${m.screen} de 6"><div class="spm-ed1-canvas" style="background-image:url(&quot;${IMAGES[m.screen-1]}&quot;)" role="group" aria-label="Lámina aprobada ${m.screen} de 6"><span class="spm-ed1-sr">${m.screen} de 6</span>${hits}${more}</div>${nav(m)}<p class="spm-ed1-status" data-ed1-status role="status" aria-live="polite">${esc(m.notice)}</p>${dialogs()}</section>`;
}
function dialogs(){
 return `<dialog class="spm-ed1-dialog" data-ed1-guide aria-label="Práctica de atención guiada"><div class="spm-ed1-dialog-head"><strong>Tu práctica · paso <span data-ed1-step-count>1</span> de 3</strong><button data-ed1-act="close-guide" type="button" aria-label="Cerrar práctica guiada">×</button></div><h3 data-ed1-step-title>Elige un estímulo agradable</h3><p data-ed1-step-copy></p><p class="spm-ed1-clock" aria-label="Tiempo transcurrido" data-ed1-time>00:00</p><p class="spm-ed1-time-note">Cronómetro opcional. No hay tiempo obligatorio ni cambio automático.</p><div class="spm-ed1-dialog-actions"><button type="button" data-ed1-act="repeat-step" data-ed1-audio="repeat">🔊 Escuchar paso</button><button type="button" data-ed1-act="pause-clock">Pausar</button></div><button type="button" data-ed1-act="next-step" class="spm-ed1-primary">Siguiente paso →</button><button type="button" data-ed1-act="skip-guide" class="spm-ed1-tertiary">Omitir y registrar lo que ocurrió</button></dialog>
 <dialog class="spm-ed1-dialog spm-ed1-ehs-dialog" data-ed1-ehs-dialog aria-label="Lámina médica ampliada de firmeza"><button type="button" data-ed1-act="close-ehs">× Cerrar</button><h3>Firmeza de la erección · lámina educativa</h3><img src="${GUIDE_IMAGE}" alt="Lámina clínica de respuesta eréctil; usa las descripciones escritas de los cinco niveles para seleccionarlos." loading="lazy"><p>La imagen es orientativa. Selecciona el nivel por su descripción, no por el ángulo de la ilustración.</p></dialog>`;
}
function updateStatus(m){const p=m?.host?.querySelector('[data-ed1-status]');if(p)p.textContent=m.notice||'';}
function paint(m){if(!m||!m.host.isConnected)return;m.host.innerHTML=stage(m);m.panel=m.host.querySelector('[data-ed1-session]');}
function go(m,next){if(!m||!m.valid()||m.busy)return;stopVoice(m);stopClock(m);if(next===3&&m.ehs===null){m.notice='Elige un nivel de firmeza o No evaluable para continuar.';updateStatus(m);return;}m.screen=Math.max(1,Math.min(5,next));m.notice='';paint(m);m.host.querySelector('[data-ed1-session]')?.scrollIntoView?.({block:'start',behavior:'instant'});}
function clockText(s){const v=Math.max(0,Math.floor(s));return String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0')}
function guideUI(m){const d=m.host.querySelector('[data-ed1-guide]');if(!d)return;d.querySelector('[data-ed1-step-count]').textContent=m.step+1;d.querySelector('[data-ed1-step-title]').textContent=STEPS[m.step][0];d.querySelector('[data-ed1-step-copy]').textContent=STEPS[m.step][1];d.querySelector('[data-ed1-time]').textContent=clockText(m.seconds);d.querySelector('[data-ed1-act="pause-clock"]').textContent=m.clockPaused?'Reanudar':'Pausar';d.querySelector('[data-ed1-act="next-step"]').textContent=m.step===2?'Finalizar y registrar →':'Siguiente paso →';}
function openGuide(m){if(!m.valid()||m.busy)return;stopVoice(m);m.step=0;m.practiceStarted=true;m.seconds=0;m.clockPaused=false;paint(m);const d=m.host.querySelector('[data-ed1-guide]');m.dialog=d;guideUI(m);if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');stopClock(m);m.interval=setInterval(()=>{if(!m.valid()){stopClock(m);return}if(!m.clockPaused){m.seconds++;const t=d.querySelector('[data-ed1-time]');if(t)t.textContent=clockText(m.seconds)}},1000);voice(m,'repeat',STEPS[0][1]);}
function closeGuide(m,asOmitted=false){stopVoice(m);stopClock(m);m.dialog?.close?.();m.dialog?.removeAttribute('open');m.dialog=null;if(asOmitted){m.outcome='omitted';go(m,5);}}
function nextGuide(m){if(m.step<2){m.step++;guideUI(m);voice(m,'repeat',STEPS[m.step][1]);return;}m.practiceCompleted=true;closeGuide(m);go(m,5);}
function showSuccess(m){
 if(successOverlay){successOverlay.remove();successOverlay=null}
 const layer=document.createElement('section');layer.className='spm-ed1-success-overlay';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','Práctica registrada, continuar ruta de hoy');
 layer.innerHTML=`<div class="spm-ed1-success-canvas" style="background-image:url(&quot;${IMAGES[5]}&quot;)">${m.outcome==='omitted'?'<div class="spm-ed1-omitted-message"><strong>Punto de partida registrado</strong><span>Omitiste la práctica de atención. No se registró como realizada.</span></div>':''}<button type="button" style="${rect(727,208,851,342)}" data-ed1-success-audio aria-label="Escuchar cierre de la práctica" class="spm-ed1-hit audio"></button><button type="button" style="${rect(22,1270,919,1451)}" data-ed1-success-close aria-label="Continuar mi ruta de hoy" class="spm-ed1-hit"></button></div>`;
 document.body.appendChild(layer);successOverlay=layer;
 const exit=()=>{stopVoice(m);layer.remove();if(successOverlay===layer)successOverlay=null;try{m.onBack()}catch{window.SPM_DAILY_PRACTICE?.open?.()}};
 layer.querySelector('[data-ed1-success-close]').addEventListener('click',exit);
 layer.querySelector('[data-ed1-success-audio]').addEventListener('click',()=>{voice(m,'end',TEXT[6]);const el=layer.querySelector('[data-ed1-success-audio]');if(el)el.classList.add('playing')});
 layer.addEventListener('keydown',ev=>{if(ev.key==='Escape'){ev.preventDefault();exit()}});
 layer.querySelector('[data-ed1-success-close]').focus({preventScroll:true});
}
async function save(m){
 if(m.busy||!m.valid())return;
 if(m.ehs===null){m.notice='Para registrar tu punto de partida, selecciona un nivel o No evaluable en la pantalla 2.';updateStatus(m);return}
 if(m.outcome===null){m.notice='Selecciona cómo fue tu práctica o si preferiste omitirla.';updateStatus(m);return}
 const ehs=m.ehs==='na'?null:Number(m.ehs);
 const record={...m.prior,source:'erection-practice-v1',erectionPracticeVersion:1,day:1,activity:'Reconoce tu punto de partida',confirmed:true,anxiety:null,confidence:null,date:new Date().toISOString(),ehs,ehsEvaluable:m.ehs!=='na',attentionPracticeOutcome:m.outcome,attentionPracticeCompleted:m.outcome!=='omitted',attentionPracticeSeconds:m.practiceStarted?m.seconds:null,lessonFormat:'six-approved-touch-screens',sensateModuleCompleted:null};
 m.busy=true;m.notice='Guardando tu sesión de hoy…';updateStatus(m);const b=m.host.querySelector('[data-ed1-act="save"]');if(b)b.disabled=true;stopVoice(m);stopClock(m);
 try{await m.save(record);
  // El módulo diario puede volver a «Hoy» al guardar. El cierre aprobado
  // se muestra únicamente tras una respuesta positiva del guardado.
  const c=window.SPM_RESOURCE_CONTEXT?.();
  if(c&&String(c.userId)+':'+String(c.planId)!==m.scope)return;
  if(c&&Number(c.day)!==1)return;
  showSuccess(m);
 }catch(e){m.busy=false;m.notice='No se pudo guardar. Conservamos tu selección en esta pantalla; vuelve a intentarlo.';if(m.host.isConnected){updateStatus(m);const b=m.host.querySelector('[data-ed1-act="save"]');if(b)b.disabled=false}}
}
function mount({host,prior={},valid=()=>true,save:onSave,onBack=()=>{},scope=''}){
 if(!host||typeof onSave!=='function')return false;
 stop();
 const old=prior&&typeof prior==='object'?prior:{};
 const ehs=old.ehsEvaluable===false&&old.ehs===null?'na':old.ehsEvaluable===true&&Number.isInteger(old.ehs)&&old.ehs>=0&&old.ehs<=4?String(old.ehs):null;
 const outcome=OUTCOMES.includes(old.attentionPracticeOutcome)?old.attentionPracticeOutcome:null;
 const m={host,prior:{...old},valid,save:onSave,onBack,scope,screen:1,ehs,outcome,step:0,seconds:0,practiceStarted:false,practiceCompleted:false,clockPaused:false,interval:null,dialog:null,player:null,voiceKey:null,notice:'',busy:false};
 instance=m;paint(m);
 host.addEventListener('click',function onClick(event){
  if(instance!==m)return;
  const b=event.target.closest('[data-ed1-act]');if(!b||b.disabled)return;const action=b.dataset.ed1Act;
  if(action==='exit'){pauseFor(m);onBack();return}
  if(action==='back'){if(m.screen===1){pauseFor(m);onBack()}else go(m,m.screen-1);return}
  if(action==='next'){go(m,m.screen+1);return}
  if(action==='audio'){const key=b.dataset.ed1Audio;voice(m,key,TEXT[m.screen],m.screen===2);return}
  if(action==='ehs'){m.ehs=b.dataset.value;m.notice='';stopVoice(m);paint(m);return}
  if(action==='open-ehs'){const dialog=host.querySelector('[data-ed1-ehs-dialog]');if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');return}
  if(action==='close-ehs'){const dialog=host.querySelector('[data-ed1-ehs-dialog]');if(dialog?.close)dialog.close();else dialog?.removeAttribute('open');return}
  if(action==='explain'){const key=b.dataset.value;voice(m,key,EXPLAIN[key]);return}
  if(action==='step'){const n=Number(b.dataset.value);if(n>=0&&n<3)voice(m,'step'+n,STEPS[n][1]);return}
  if(action==='begin'){openGuide(m);return}
  if(action==='close-guide'){closeGuide(m);return}
  if(action==='skip-guide'){closeGuide(m,true);return}
  if(action==='repeat-step'){voice(m,'repeat',STEPS[m.step][1]);return}
  if(action==='pause-clock'){m.clockPaused=!m.clockPaused;guideUI(m);return}
  if(action==='next-step'){nextGuide(m);return}
  if(action==='outcome'){m.outcome=b.dataset.value;m.notice='';paint(m);return}
  if(action==='save'){void save(m);return}
 });
 return true;
}
window.addEventListener('pagehide',()=>{stop();if(successOverlay){successOverlay.remove();successOverlay=null}});
window.SPM_ED_DAY1_TOUCH={mount,stop,pause,images:IMAGES.slice(),audioSrc:EHS_AUDIO};
})();