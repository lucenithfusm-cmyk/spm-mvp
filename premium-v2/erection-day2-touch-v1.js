/* SPM Digital Wellness — Erección y firmeza, día 2.
 * Las cuatro láminas originales son las superficies completas de las pantallas.
 * Este controlador es exclusivo de día 2; el resto del programa no se altera.
 */
(()=>{
 'use strict';
 if(window.SPM_ED_DAY2_TOUCH)return;
 const BASE='/premium-v2/assets/erection-day2/';
 const IMAGES=[1,2,3,4].map(n=>BASE+`spm-de-day2-screen-0${n}.webp`);
 const ORIGINAL_DAY2_AUDIO='/premium-v2/assets/audio/erection/erection-day-2-20261113.mp3';
 const CONTEXTS=[['spontaneous','Espontánea o al despertar'],['solo','Experiencia individual'],['partner','Experiencia con pareja']];
 const RESPONSES=[['','Elige una respuesta'],['easy','Con facilidad'],['variable','Variable'],['difficult','Con dificultad'],['not_evaluable','No evaluable']];
 const CONDITIONS=[['good_rest','Con buen descanso'],['less_stress','Con menos estrés'],['more_confidence','Con mayor confianza'],['prolonged_stimulation','Con estimulación prolongada'],['with_partner','Con mi pareja'],['relaxation','En momentos de relajación']];
 const ASPECTS=[['initiate','Me cuesta iniciar la erección'],['maintain','Me cuesta mantener la erección'],['recover','Me cuesta recuperarla'],['none','Sin dificultad clara'],['not_evaluable','No evaluable']];
 const PLANS=[['privacy','Más privacidad'],['time','Más tiempo'],['less_interruptions','Menos interrupciones'],['rhythm','Un ritmo cómodo'],['not_possible','No fue posible hoy']];
 const NARRATION={
  1:'Reconoce tus contextos. Recuerda experiencias que ya hayas vivido, sin buscar una nueva respuesta eréctil hoy. En la primera lista indica cómo suelen ser las erecciones espontáneas o al despertar. Después, selecciona qué recuerdas de las experiencias individuales y de las experiencias con pareja. Si no has tenido esa experiencia, usa No evaluable. La variabilidad es posible: no hay una respuesta correcta.',
  2:'Ahora identifica qué condiciones han acompañado una mejor respuesta eréctil en experiencias reales. Puedes marcar varias: buen descanso, menos estrés, confianza, más tiempo de estimulación, estar con tu pareja o momentos de relajación. Marca solo las que reconozcas; no necesitas elegir ninguna si todavía no sabes. Este registro observa el contexto, no establece un diagnóstico.',
  3:'Identifica tu dificultad principal a partir de lo que ya has vivido. Elige una sola opción: te cuesta iniciar, mantener o recuperar la erección, no observas una dificultad clara, o no puedes evaluarlo. No es necesario comprobar tu erección en este momento. Lo que elijas servirá para orientar el entrenamiento.',
  4:'Ponlo en práctica preparando una condición que haya favorecido tu experiencia. Recuerda un momento cómodo y elige un ajuste concreto: más privacidad, más tiempo, menos interrupciones o un ritmo cómodo. Si hoy no fue posible, puedes indicarlo. No necesitas provocar ni comprobar una erección: preparar el contexto ya es una acción útil. Guarda para continuar tu ruta de hoy.'
 };
 const CONTEXT_CUES={spontaneous:'Piensa en ocasiones al despertar o espontáneamente, cuando hayas notado una respuesta.',solo:'Considera experiencias individuales que hayas tenido, sin generar una nueva ahora.',partner:'Recuerda experiencias con tu pareja, cuando hayan ocurrido. Si no puedes valorarlas, selecciona No evaluable.'};
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const rect=(x1,y1,x2,y2)=>`left:${(x1/1080*100).toFixed(3)}%;top:${(y1/1920*100).toFixed(3)}%;width:${((x2-x1)/1080*100).toFixed(3)}%;height:${((y2-y1)/1920*100).toFixed(3)}%;`;
 let active=null;
 const contextMap=x=>Object.fromEntries(CONTEXTS.map(([k])=>[k,RESPONSES.some(([v])=>v&&v===x?.[k])?x[k]:'']));
 function cleanup(m){if(!m)return;stopVoice(m);m.events?.abort?.();m.events=null;}
 function stopVoice(m){if(!m)return;try{m.player?.pause?.();if(m.player)m.player.currentTime=0}catch{}m.player=null;try{window.speechSynthesis?.cancel?.()}catch{}m.voiceKey=null;m.host?.querySelectorAll?.('.spm-ed2-hit.playing').forEach(b=>b.classList.remove('playing'));}
 function stop(){const m=active;active=null;cleanup(m)}
 function pause(){if(active)stopVoice(active)}
 function announce(m,key,txt,{original=false}={}){
  if(!m||!m.valid()||m.busy)return;
  if(m.voiceKey===key){stopVoice(m);return;}
  stopVoice(m);m.voiceKey=key;
  const target=m.host.querySelector(`[data-ed2-audio="${key}"]`);
  const finish=()=>{if(m.voiceKey===key)m.voiceKey=null;target?.classList.remove('playing')};
  const speech=()=>{
   if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=='function'){m.message='La narración no está disponible en este navegador. Lee las instrucciones de la pantalla.';status(m);finish();return;}
   const u=new SpeechSynthesisUtterance(txt);u.lang='es-CO';u.rate=.97;u.pitch=1;
   const v=window.speechSynthesis.getVoices?.()||[];
   u.voice=v.find(x=>/^es-co$/i.test(x.lang)&&/mujer|female|paulina|sofia|helena|maria|monica/i.test(x.name))||v.find(x=>/^es-co$/i.test(x.lang))||v.find(x=>/^es/i.test(x.lang))||null;
   u.onend=finish;u.onerror=finish;
   try{window.speechSynthesis.speak(u);target?.classList.add('playing')}catch{finish();m.message='No se pudo reproducir la indicación.';status(m)}
  };
  if(original && typeof window.Audio==='function'){
   try{
    const a=new Audio(ORIGINAL_DAY2_AUDIO);m.player=a;a.preload='none';a.onended=finish;
    a.onerror=()=>{if(m.voiceKey===key){m.player=null;speech()}};
    const pending=a.play();target?.classList.add('playing');pending?.catch?.(()=>{if(m.voiceKey===key){m.player=null;speech()}});return;
   }catch{}
  }
  speech();
 }
 function button(coords,act,label,options={}){
  const {value=null,audio=null,selected=false,disabled=false}=options;
  return `<button type="button" data-ed2-act="${esc(act)}"${value===null?'':` data-value="${esc(value)}"`}${audio===null?'':` data-ed2-audio="${esc(audio)}"`}${value===null?'':` aria-pressed="${selected?'true':'false'}"`}${disabled?' disabled':''} aria-label="${esc(label)}" class="spm-ed2-hit${selected?' selected':''}${audio?' audio':''}" style="${rect(...coords)}"></button>`;
 }
 function checkCircle(cx,cy,value){return `<span aria-hidden="true" class="spm-ed2-radio-check" style="${rect(cx-28,cy-28,cx+28,cy+28)}" data-selected="${esc(value)}">✓</span>`;}
 function render(m){
  if(!m||!m.host?.isConnected)return;
  let hits='',over='',form='';const page=m.page;
  if(page===1){
   hits+=button([271,385,808,482],'audio','Escuchar guía de contextos',{audio:'guide'});
   const boxes=[[548,673,1023,750],[548,992,1023,1072],[548,1311,1023,1392]];
   const keys=CONTEXTS.map(([key])=>key);
   form=boxes.map((co,i)=>`<label class="spm-ed2-select-label" style="${rect(...co)}"><span class="spm-ed2-sr">${esc(CONTEXTS[i][1])}</span><select data-ed2-context="${keys[i]}" aria-label="${esc(CONTEXTS[i][1])}">${RESPONSES.map(([v,t])=>`<option value="${v}"${m.contexts[keys[i]]===v?' selected':''}>${esc(t)}</option>`).join('')}</select></label>`).join('');
   hits+=button([50,1693,1032,1818],'next','Continuar con los contextos');
  }else if(page===2){
   const xs=[[35,354],[380,704],[724,1048]],ys=[[864,1143],[1167,1445]];
   CONDITIONS.forEach(([key,label],i)=>{const row=Math.floor(i/3),col=i%3,co=[xs[col][0],ys[row][0],xs[col][1],ys[row][1]];hits+=button(co,'condition','Seleccionar '+label,{value:key,selected:m.conditions.includes(key)});
    if(m.conditions.includes(key))over+=checkCircle(xs[col][0]+46,ys[row][0]+39,key);
   });
   hits+=button([53,1696,1031,1819],'next','Continuar a identificar dificultad');
  }else if(page===3){
   hits+=button([271,385,807,482],'audio','Escuchar guía para identificar dificultad',{audio:'guide'});
   const spans=[[780,916],[927,1061],[1075,1210],[1229,1369],[1383,1516]];
   ASPECTS.forEach(([key,label],i)=>{hits+=button([50,spans[i][0],1035,spans[i][1]],'aspect','Seleccionar '+label,{value:key,selected:m.aspect===key});if(m.aspect===key)over+=checkCircle(967,Math.round((spans[i][0]+spans[i][1])/2),key)});
   hits+=button([50,1694,1033,1822],'next','Continuar a preparar mi acción');
  }else if(page===4){
   hits+=button([270,386,810,481],'audio','Escuchar guía para preparar una condición',{audio:'guide'});
   const cells=[[51,1292,533,1384],[550,1292,1030,1384],[51,1397,534,1485],[550,1397,1031,1485],[51,1490,1030,1571]];
   PLANS.forEach(([key,label],i)=>{hits+=button(cells[i],'plan','Seleccionar '+label,{value:key,selected:m.plan===key});if(m.plan===key)over+=checkCircle(cells[i][0]+43,Math.round((cells[i][1]+cells[i][3])/2),key)});
   hits+=button([49,1701,1032,1833],'save','Guardar y continuar mi ruta de hoy',{disabled:m.busy});
  }
  const toolbar=`<nav class="spm-ed2-toolbar" aria-label="Navegación de Erección y firmeza día 2"><button type="button" data-ed2-act="back">${page===1?'← Volver a Hoy':'← Anterior'}</button><span>${page} de 4 · Día 2</span>${page===2?'<button type="button" data-ed2-act="audio" data-ed2-audio="guide" aria-label="Escuchar guía de condiciones">🔊 Guía</button>':'<button type="button" data-ed2-act="exit">Salir a Hoy</button>'}</nav>`;
  m.host.innerHTML=`<section class="spm-ed2-session" data-ed2-session data-screen="${page}" aria-label="Erección y firmeza, día 2, pantalla ${page} de 4"><div class="spm-ed2-artwork" role="group" aria-label="Pantalla aprobada ${page} de 4" style="background-image:url(&quot;${IMAGES[page-1]}&quot;)">${hits}${form}${over}</div>${toolbar}<p class="spm-ed2-status" data-ed2-status role="status" aria-live="polite">${esc(m.message)}</p></section>`;
 }
 function status(m){const p=m?.host?.querySelector('[data-ed2-status]');if(p)p.textContent=m.message||'';}
 function next(m){if(!m.valid()||m.busy)return;stopVoice(m);
  if(m.page===1){const missing=CONTEXTS.filter(([k])=>!m.contexts[k]);if(missing.length){m.message='Selecciona una respuesta en los tres contextos. Si alguno no ocurrió, elige No evaluable.';status(m);return;}}
  if(m.page===3&&!m.aspect){m.message='Elige el aspecto que mejor describe tu experiencia, o No evaluable.';status(m);return;}
  m.page=Math.min(4,m.page+1);m.message='';render(m);m.host.querySelector('.spm-ed2-session')?.scrollIntoView?.({block:'start',behavior:'instant'});
 }
 function previous(m){stopVoice(m);if(m.page===1){m.onBack();return}m.page--;m.message='';render(m)}
 async function save(m){
  if(m.busy||!m.valid())return;
  if(CONTEXTS.some(([k])=>!m.contexts[k])){m.message='Faltan respuestas de la primera pantalla. Vuelve y completa los tres contextos.';status(m);return;}
  if(!m.aspect){m.message='Antes de guardar, elige tu dificultad principal en la pantalla 3.';status(m);return;}
  if(!m.plan){m.message='Elige una condición para preparar, o No fue posible hoy.';status(m);return;}
  const record={...m.prior,source:'erection-practice-v1',erectionPracticeVersion:1,day:2,activity:'Reconoce tus contextos',confirmed:true,anxiety:null,confidence:null,
   date:new Date().toISOString(),contexts:{...m.contexts},responseAspect:m.aspect,
   favourableConditions:m.conditions.slice(),contextPlan:m.plan,contextActionPrepared:m.plan!=='not_possible',lessonFormat:'four-approved-touch-screens'};
  m.busy=true;m.message='Guardando la actividad de hoy…';status(m);const b=m.host.querySelector('[data-ed2-act="save"]');if(b)b.disabled=true;
  stopVoice(m);
  // El propio guardado puede reconstruir Hoy; m.valid() deja de ser cierto
  // al desmontarse la actividad, aunque el registro ya se haya confirmado.
  let saved;
  try{saved=await m.save(record);if(saved===false||saved?.ok===false)throw Error('save-failed');}
  catch{m.busy=false;m.message='No se pudo guardar. Tus respuestas continúan en pantalla; puedes reintentar.';if(m.host.isConnected)status(m);if(b?.isConnected)b.disabled=false;return}
  const c=window.SPM_RESOURCE_CONTEXT?.();
  if(c&&(String(c.userId)+':'+String(c.planId)!==m.scope||Number(c.day)!==2))return;
  m.message='Registro guardado correctamente ✓';
  if(m.host.isConnected)status(m);
  // El guardado de SPM también puede regresar a Hoy y desmontar este host.
  // No duplicar navegación si ese retorno automático ya ocurrió.
  if(m.host.isConnected){try{m.onBack()}catch{window.SPM_DAILY_PRACTICE?.open?.()}}

 }
 function mount({host,prior={},valid=()=>true,save:onSave,onBack=()=>{},scope=''}){
  if(!host||typeof onSave!=='function')return false;
  stop();
  const old=prior&&typeof prior==='object'&&!Array.isArray(prior)?prior:{};
  const m={host,scope,valid,save:onSave,onBack,prior:{...old},page:1,contexts:contextMap(old.contexts),
   conditions:Array.isArray(old.favourableConditions)?old.favourableConditions.filter(x=>CONDITIONS.some(([k])=>k===x)):[],
   aspect:ASPECTS.some(([k])=>k===old.responseAspect)?old.responseAspect:null,
   plan:PLANS.some(([k])=>k===old.contextPlan)?old.contextPlan:null,
   player:null,voiceKey:null,busy:false,message:'',events:new AbortController()};
  active=m;render(m);
  host.addEventListener('change',ev=>{if(active!==m||!m.valid())return;const field=ev.target.closest('[data-ed2-context]');if(!field)return;const key=field.dataset.ed2Context;
   if(!CONTEXTS.some(([k])=>k===key))return;
   if(RESPONSES.some(([v])=>v===field.value)){m.contexts[key]=field.value;m.message='';status(m)}
  },{signal:m.events.signal});
  host.addEventListener('click',ev=>{if(active!==m||!m.valid()||m.busy)return;const el=ev.target.closest('[data-ed2-act]');if(!el||el.disabled)return;
   const act=el.dataset.ed2Act,key=el.dataset.value;
   if(act==='exit'){stopVoice(m);m.onBack();return}
   if(act==='back'){previous(m);return}
   if(act==='next'){next(m);return}
   if(act==='audio'){announce(m,'guide',NARRATION[m.page],{original:m.page===1});return}
   if(act==='condition'){if(!CONDITIONS.some(([k])=>k===key))return;m.conditions=m.conditions.includes(key)?m.conditions.filter(x=>x!==key):[...m.conditions,key];stopVoice(m);m.message='';render(m);return}
   if(act==='aspect'){if(!ASPECTS.some(([k])=>k===key))return;m.aspect=key;stopVoice(m);m.message='';render(m);return}
   if(act==='plan'){if(!PLANS.some(([k])=>k===key))return;m.plan=key;stopVoice(m);m.message='';render(m);return}
   if(act==='save')void save(m);
  },{signal:m.events.signal});
  return true;
 }
 window.addEventListener('pagehide',stop);
 window.SPM_ED_DAY2_TOUCH={mount,stop,pause,images:IMAGES.slice(),audioOriginal:ORIGINAL_DAY2_AUDIO,contexts:CONTEXTS.map(x=>x[0])};
})();