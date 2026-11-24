/* SPM Digital Wellness · DESEO · Día 2, versión completa de seis pantallas.
 * Las seis láminas clínicas aprobadas son las pantallas íntegramente; zonas táctiles superpuestas.
 * Se conserva practiceId='pattern-observe' y recurso 'r:influence' sin duplicar sesiones.
 * El mapa mide INFLUENCIA, no carácter favorable/desfavorable ni intensidad del deseo.
 * No usar puntuaciones predefinidas; N/A explícito = null. Voz estándar es-CO.
 */
(()=>{
  'use strict';
  if(window.SPM_DESIRE_DAY2_TOUCH)return;
  const DAY=2,VERSION=2,NOTE_KEY='desireDay2TouchV2';
  const IMAGES=['screen-01.jpg','screen-02.png','screen-03.png','screen-04.png','screen-05.png','screen-06.png'].map(x=>'/premium-v2/assets/desire-day2/'+x);
  const COVER_GIF='/premium-v2/assets/desire-day2/brain-orbit-cover.gif';
  const CONTEXT_GIF='/premium-v2/assets/desire-day2/brain-orbit-context.gif';
  const DIMENSIONS=[[864,1536],...Array.from({length:5},()=>[941,1672])];
  const FACILITATORS=[
    {id:'no_pressure',label:'Tranquilidad, sin presión',speech:'Tranquilidad, sin presión. Cuando no hay exigencias ni necesidad de demostrar algo, puede resultar más fácil descubrir qué te despierta interés.'},
    {id:'closeness',label:'Contacto afectivo y cercanía',speech:'Contacto afectivo y cercanía. La confianza, un abrazo o una mirada compartida, siempre desde el acuerdo mutuo, pueden favorecer tu disposición.'},
    {id:'fantasy',label:'Fantasías o pensamientos eróticos',speech:'Fantasías o pensamientos eróticos. Un recuerdo sensual o una idea que te atraiga puede despertar curiosidad, sin obligación de actuar.'},
    {id:'caresses',label:'Caricias o estimulación',speech:'Caricias o estimulación. Un beso o una caricia que desees puede despertar sensaciones agradables, sin tener que conseguir una respuesta inmediata.'},
    {id:'privacy',label:'Tiempo a solas conmigo',speech:'Tiempo a solas conmigo. Un espacio privado y sin interrupciones puede ayudarte a reconocer tus propias preferencias.'},
    {id:'unclear',label:'Todavía no lo tengo claro',speech:'Todavía no lo tengo claro. También es válido. Este recorrido te ayudará a observar las influencias sin tener que inventar respuestas.'}
  ];
  const PLANS=[
    {id:'myself',label:'Dedicar unos minutos a conectar conmigo',speech:'Dedicar unos minutos a conectar conmigo. Busca un momento privado, sin interrupciones, y descubre qué sensaciones te resultan agradables sin exigirte nada.'},
    {id:'partner',label:'Buscar un momento sin prisa con mi pareja',speech:'Buscar un momento sin prisa con mi pareja. Propón un espacio de cercanía que ambos quieran, con libertad para parar o cambiar de idea.'},
    {id:'stimulus',label:'Explorar un estímulo que me resulte agradable',speech:'Explorar un estímulo que me resulte agradable. Puede ser una fantasía que te atraiga, una mirada cómplice o el contacto que elijas sin presión.'},
    {id:'observe',label:'Solo observar sin exigirme respuesta',speech:'Solo observar sin exigirme respuesta. Nota tu estado de ánimo y tu disposición, sin evaluar tu desempeño sexual ni tu respuesta corporal.'}
  ];
  const INFLUENCE=[
    {id:'stress',label:'Estrés',speech:'Estrés. Valora de cero a diez cuánto influye en tu deseo, sea que lo aumente o lo disminuya.'},
    {id:'tired',label:'Cansancio',speech:'Cansancio. Indica cuánto influye en tu experiencia, sin juzgarlo como bueno o malo.'},
    {id:'partner',label:'Conexión con pareja',speech:'Conexión con pareja. Valora cuánto influye o marca no aplica si hoy no corresponde a tu situación.'},
    {id:'visual',label:'Estímulos visuales',speech:'Estímulos visuales. Indica cuánto influyen en tu deseo, no cuánto deseo tienes.'},
    {id:'touch',label:'Contacto físico',speech:'Contacto físico. Piensa en cuánto influye el contacto que eliges libremente.'},
    {id:'novelty',label:'Novedad / variedad',speech:'Novedad o variedad. Valora si los cambios de contexto influyen mucho, poco o nada.'},
    {id:'mood',label:'Estado de ánimo',speech:'Estado de ánimo. Indica cuánto influye tu estado emocional en la posibilidad de conectar.'}
  ];
  const DETAILS=[{id:'privacy',label:'Privacidad'},{id:'time',label:'Tiempo sin prisa'},{id:'rest',label:'Descanso'},{id:'connection',label:'Conexión'}];
  const CONTEXT_FIELDS={where:{label:'¿Dónde estabas?',hint:'Un lugar privado, tranquilo o cualquier lugar que recuerdes.'},feeling:{label:'¿Cómo te sentías?',hint:'Descansado, curioso, cómodo o como te hayas sentido realmente.'},happening:{label:'¿Qué estaba pasando?',hint:'Una conversación, una mirada u otra circunstancia real.'},reflection:{label:'Mi reflexión (opcional)',hint:'¿Qué detalle de ese contexto quisieras recuperar?'}};
  const GUIDE={
    1:'Día dos. Tu patrón y tus contextos. Vamos a reconocer qué situaciones influyen en tu deseo. Primero observa una forma de sentirte, después explora tu mapa de influencias y finalmente recuerda un contexto real para elegir una acción. No se trata de aprobar un examen ni de forzar el deseo. Si prefieres escuchar las tres ideas de la portada, toca cada tarjeta; después pulsa Comenzar.',
    2:'Piensa qué sueles reconocer en tu experiencia. Puede ser tranquilidad, cercanía afectiva, pensamientos eróticos, caricias, un momento a solas o que todavía no lo tienes claro. Toca una de las seis barras para escucharla y marcarla, y después pulsa Ver mapa de influencia.',
    3:'Mapa de influencia, primera parte. Vamos a valorar cuatro factores: estrés, cansancio, conexión con pareja y estímulos visuales. La escala no mide cuánto deseo sientes ni si algo es positivo o negativo, sino cuánto influye: cero significa nada y diez, mucho. Desliza o toca cada escala; si no sabes evaluarla o no corresponde, pulsa su N A. Debes responder los cuatro factores para continuar.',
    4:'Mapa de influencia, segunda parte. Valora contacto físico, novedad o variedad y estado de ánimo. Cero significa nada, diez significa mucho y N A significa no sé o no aplica. No hay respuestas correctas y no necesitas inventar una puntuación. Registra los tres factores y pulsa Recordar mi contexto.',
    5:'Recuerda un momento real, reciente o pasado, en el que sentiste algo de interés o curiosidad. Puedes tocar dónde estabas, cómo te sentías y qué estaba pasando para guardar tus propias palabras. Luego elige uno o dos detalles que te gustaría recuperar: privacidad, tiempo sin prisa, descanso o conexión. Si aún no recuerdas un momento, puedes señalarlo sin inventar una experiencia.',
    6:'Ahora ponlo en práctica. Elige una acción concreta y flexible: conectar contigo, compartir un momento tranquilo con tu pareja, explorar algo que te resulte agradable o simplemente observar sin exigirte una respuesta. Toca la barra elegida para escuchar una guía breve. Mi reflexión es opcional. Cuando estés listo, pulsa Guardar y continuar para registrar el mapa, el contexto y tu acción.'
  };
  const INTRO=[
    {title:'Reconoce tu patrón',speech:'Primero vas a observar cuándo sueles sentir más o menos interés, sin juzgarte.'},
    {title:'Explora el mapa de influencias',speech:'Segundo: identificarás cuánto influyen siete factores. No vamos a confundir influencia con activadores o frenos; eso se trabaja en otra sesión.'},
    {title:'Encuentra tu contexto favorable',speech:'Tercero: vas a recordar una situación concreta y elegir una acción posible, respetando tu ritmo.'}
  ];
  const esc=x=>String(x??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  const normal=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(normal(o),k);
  const option=(items,id)=>items.find(item=>item.id===id)||null;
  const validNumber=x=>(typeof x==='number'&&Number.isInteger(x)&&x>=0&&x<=10)?x:null;
  const pos=(page,x,y,w,h)=>{const [W,H]=DIMENSIONS[page-1];return `left:${(x/W*100).toFixed(4)}%;top:${(y/H*100).toFixed(4)}%;width:${(w/W*100).toFixed(4)}%;height:${(h/H*100).toFixed(4)}%;`;};
  const hit=(p,x,y,w,h,act,val,label,pressed)=>`<button type="button" class="spm-ds2-hit spm-ds2-hit--${esc(act)}" style="${pos(p,x,y,w,h)}" data-ds2-action="${esc(act)}" data-ds2-value="${esc(val??'')}" aria-label="${esc(label)}"${pressed===undefined?'':` aria-pressed="${pressed?'true':'false'}"`}></button>`;
  const check=(p,x,y)=>`<span class="spm-ds2-check" aria-hidden="true" style="${pos(p,x-14,y-14,28,28)}">✓</span>`;
  let active=null;
  function pageOptions(m,page){return page===2?FACILITATORS:PLANS;}
  function pendingFactors(m,page){return (page===3?INFLUENCE.slice(0,4):INFLUENCE.slice(4)).filter(f=>!m.seen[f.id]);}
  function orbital(page){if(page!==1&&page!==5)return '';const x=page===1?398:444,y=page===1?389:402,w=page===1?441:407,h=page===1?437:341;
    const src=page===1?COVER_GIF:CONTEXT_GIF;
    return `<img class="spm-ds2-orbit-gif spm-ds2-orbit-gif--${page===1?'cover':'context'}" src="${src}" loading="eager" draggable="false" alt="" aria-hidden="true" style="${pos(page,x,y,w,h)}">`;}
  function hotspots(m){const p=m.page;let result='';
    if(p===1){
      result+=hit(p,169,318,523,87,'audio','guide','Escuchar guía');
      [[27,832,265,402],[303,832,260,402],[573,832,263,402]].forEach(([x,y,w,h],i)=>{result+=hit(p,x,y,w,h,'intro',String(i),'Escuchar: '+INTRO[i].title);});
      result+=hit(p,67,1274,728,128,'next','','Comenzar Día 2');
    }else if(p===2){
      result+=hit(p,177,291,569,88,'audio','guide','Escuchar guía');
      const rows=[[844,916],[926,1001],[1008,1082],[1091,1165],[1175,1251],[1264,1339]];
      FACILITATORS.forEach((item,i)=>{const [y1,y2]=rows[i];result+=hit(p,48,y1,828,y2-y1,'choose',item.id,'Seleccionar '+item.label,m.factor===item.id);if(m.factor===item.id)result+=check(p,818,(y1+y2)/2);});
      result+=hit(p,47,1376,832,130,'next','','Ver mapa de influencia');
    }else if(p===3||p===4){
      result+=hit(p,187,312,558,73,'audio','guide','Escuchar guía del mapa');
      const factors=p===3?INFLUENCE.slice(0,4):INFLUENCE.slice(4);
      const rows=p===3?[837,993,1147,1300]:[878,1049,1217];
      factors.forEach((item,i)=>{
        const y=rows[i],value=m.influence[item.id],seen=m.seen[item.id]===true,hasValue=seen&&value!==null;
        result+=`<input type="range" class="spm-ds2-map-slider" min="0" max="10" step="1" value="${hasValue?value:5}" data-ds2-factor="${item.id}" data-chosen="${hasValue}" aria-label="${esc(item.label)}: cuánto influye en tu deseo de 0 a 10" aria-valuetext="${!seen?'Sin responder':value===null?'No aplica':value+' de 10'}" style="${pos(p,161,y-20,548,40)}">`;
        result+=hit(p,745,y-26,105,54,'na',item.id,'Marcar '+item.label+' como N/A',seen&&value===null);
        if(hasValue){result+=`<span class="spm-ds2-map-value" style="${pos(p,743,y-87,102,30)}">${value} / 10</span>`;}
        else if(seen)result+=`<span class="spm-ds2-map-value is-na" style="${pos(p,743,y-87,102,30)}">N/A ✓</span>`;
      });
      const cta=p===3?[100,1398,723,105]:[99,1405,730,107];result+=hit(p,...cta,'next','',p===3?'Continuar mapa':'Recordar mi contexto');
    }else if(p===5){
      result+=hit(p,187,311,559,75,'audio','guide','Escuchar guía del contexto');
      [[47,728,835,122,'where'],[47,862,836,125,'feeling'],[47,1003,836,122,'happening']].forEach(([x,y,w,h,key])=>{result+=hit(p,x,y,w,h,'field',key,'Registrar '+CONTEXT_FIELDS[key].label);if(m.context[key])result+=check(p,835,y+24);});
      const chips=[[61,1217,384,64],[486,1217,382,64],[61,1290,383,63],[486,1290,381,63]];
      DETAILS.forEach((item,i)=>{const [x,y,w,h]=chips[i];result+=hit(p,x,y,w,h,'detail',item.id,'Elegir '+item.label,m.details.includes(item.id));if(m.details.includes(item.id))result+=check(p,x+31,y+h/2);});
      result+=hit(p,98,1405,733,106,'next','','Elegir mi acción');
    }else if(p===6){
      result+=hit(p,186,312,558,74,'audio','guide','Escuchar práctica');
      const rows=[[763,867],[887,992],[1011,1117],[1136,1241]];
      PLANS.forEach((item,i)=>{const [y1,y2]=rows[i];result+=hit(p,45,y1,835,y2-y1,'choose',item.id,'Seleccionar '+item.label,m.plan===item.id);if(m.plan===item.id)result+=check(p,816,(y1+y2)/2);});
      result+=hit(p,52,1274,826,113,'field','reflection','Escribir reflexión opcional');
      if(m.context.reflection)result+=check(p,839,1298);
      result+=hit(p,100,1405,732,110,'save','','Guardar y continuar');
    }
    return result;
  }
  function selectionAlert(m){if(!m.alert)return '';return `<div class="spm-ds2-overlay" role="presentation"><div class="spm-ds2-modal" role="alertdialog" aria-modal="true" aria-labelledby="spm-ds2-alert-heading" aria-describedby="spm-ds2-alert-body"><strong id="spm-ds2-alert-heading">Falta una selección</strong><p id="spm-ds2-alert-body">Selecciona una opción para avanzar.</p><small>${esc(m.alert.detail||'')}</small><div class="spm-ds2-modal-actions"><button type="button" data-ds2-action="dismiss">Entendido</button>${m.alert.allowDefer?'<button type="button" data-ds2-action="defer-context" class="spm-ds2-secondary">Aún no identifico un detalle</button>':''}</div></div></div>`;}
  function fieldModal(m){if(!m.editField)return '';const v=m.context[m.editField]||'',def=CONTEXT_FIELDS[m.editField];return `<div class="spm-ds2-overlay"><div class="spm-ds2-modal spm-ds2-editor" role="dialog" aria-modal="true" aria-labelledby="spm-ds2-editor-title"><strong id="spm-ds2-editor-title">${esc(def.label)}</strong><p>${esc(def.hint)}</p><textarea data-ds2-editor maxlength="400" rows="4" aria-label="${esc(def.label)}" placeholder="Escribe lo que recuerdes, si quieres">${esc(v)}</textarea><div class="spm-ds2-modal-actions"><button type="button" data-ds2-action="save-field">Guardar nota</button><button type="button" data-ds2-action="cancel-field" class="spm-ds2-secondary">Cancelar</button></div></div></div>`;}
  function render(m){if(!m?.host?.isConnected)return;
    const previous=m.host.querySelector('.spm-ds2-session');
    const scrollTop=previous?.dataset?.ds2Page===String(m.page)?(previous.scrollTop||0):0;
    const page=m.page,[w,h]=DIMENSIONS[page-1];
    m.host.innerHTML=`<section class="spm-ds2-session" data-ds2-page="${page}" aria-label="Deseo, día 2, pantalla ${page} de 6"><div class="spm-ds2-art"><img src="${esc(m.images[page-1])}" width="${w}" height="${h}" alt="" draggable="false" loading="eager">${orbital(page)}${hotspots(m)}</div><nav class="spm-ds2-nav" aria-label="Navegación de las seis pantallas"><button type="button" data-ds2-action="back">← ${page===1?'Actividades de hoy':'Anterior'}</button><span>${page} de 6</span><button type="button" data-ds2-action="${page===6?'save':'next'}">${page===6?'Finalizar ✓':'Siguiente →'}</button></nav><div class="spm-ds2-bottom"><button type="button" data-ds2-action="exit">Salir a Actividades de hoy</button><button type="button" data-ds2-action="audio" data-ds2-value="guide">🔊 Escuchar guía</button></div><p class="spm-ds2-status" role="status" aria-live="polite">${esc(m.message||'')}</p>${selectionAlert(m)}${fieldModal(m)}</section>`;
    const current=m.host.querySelector('.spm-ds2-session');
    if(current)current.scrollTop=scrollTop;
  }
  function announce(m,text){m.message=text;const el=m.host?.querySelector('.spm-ds2-status');if(el)el.textContent=text;}
  function alert(m,detail='',allowDefer=false){m.alert={detail,allowDefer};render(m);m.host.querySelector('[data-ds2-action="dismiss"]')?.focus?.();}
  function stopVoice(m){if(!m)return;try{window.speechSynthesis?.cancel?.()}catch{}m.speaking=null;}
  function speak(m,key,text){if(!text||!m.valid())return;
    if(m.speaking===key){stopVoice(m);return;}stopVoice(m);
    if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=='function'){announce(m,'Este navegador no ofrece voz de dispositivo; puedes leer las indicaciones en pantalla.');return;}
    const u=new window.SpeechSynthesisUtterance(text);u.lang='es-CO';u.rate=.97;u.pitch=1;
    u.onend=()=>{if(m.speaking===key)m.speaking=null;};u.onerror=e=>{if(m.speaking===key){m.speaking=null;if(!['interrupted','canceled'].includes(e?.error))announce(m,'No se pudo reproducir la voz. Puedes continuar leyendo la pantalla.');}};
    m.speaking=key;try{window.speechSynthesis.speak(u)}catch{m.speaking=null;announce(m,'No se pudo iniciar la voz del dispositivo.');}
  }
  function serialize(m){return {page:m.page,factor:m.factor,plan:m.plan,seen:{...m.seen},context:{...m.context},details:[...m.details],contextDeferred:m.contextDeferred,completed:m.completed,version:VERSION};}
  function saveTx(m,apply){const task=async()=>{
      if(active!==m||!m.valid())throw Error('Sesión o día cambiado.');
      const bundle=normal(await m.storage.read());if(active!==m||!m.valid())throw Error('Sesión cambiada durante el guardado.');
      let p={};try{p=normal(JSON.parse(bundle['spm-desire-program']||'{}'))}catch{p={}}
      p.detailNotes={...normal(p.detailNotes),[NOTE_KEY]:JSON.stringify(serialize(m))};
      p.influence={...normal(p.influence)};
      for(const f of INFLUENCE)if(m.seen[f.id])p.influence[f.id]=m.influence[f.id]===null?null:m.influence[f.id];
      if(apply)apply(p);
      await m.storage.save({...bundle,'spm-desire-program':JSON.stringify(p)});
    };m.queue=m.queue.then(task,task);return m.queue;
  }
  function schedule(m){clearTimeout(m.pending);m.pending=setTimeout(()=>{void saveTx(m).catch(()=>announce(m,'No pudimos guardar automáticamente. Reintenta al finalizar.'));},560);}
  function move(m,page){stopVoice(m);clearTimeout(m.pending);m.page=page;m.alert=null;m.editField=null;m.message='';render(m);void saveTx(m).catch(()=>announce(m,'No pudimos guardar el avance de esta pantalla. Reintenta al finalizar.'));m.host.querySelector('.spm-ds2-session')?.scrollIntoView?.({block:'start',behavior:'instant'});}
  function setInfluence(m,k,value){if(!INFLUENCE.some(f=>f.id===k))return;
    m.influence[k]=value;m.seen[k]=true;m.message='';render(m);schedule(m);
  }
  function forward(m){if(m.page===1){move(m,2);return;}
    if(m.page===2){if(!m.factor){alert(m,'Elige la opción que más se acerque a tu experiencia, incluso si todavía no lo tienes claro.');return;}move(m,3);return;}
    if(m.page===3||m.page===4){const missing=pendingFactors(m,m.page);if(missing.length){alert(m,'Valora cada factor de este mapa o pulsa N/A. Falta: '+missing.map(f=>f.label).join(', ')+'.');return;}move(m,m.page+1);return;}
    if(m.page===5){if(!m.details.length&&!m.contextDeferred){alert(m,'Elige uno o dos detalles, o indica expresamente si todavía no puedes reconocerlos.',true);return;}move(m,6);return;}
    if(m.page===6)void complete(m);
  }
  function canComplete(m){if(!m.factor){alert(m,'Selecciona una opción en «¿Qué reconoces en ti hoy?»');return false;}
    const pending=INFLUENCE.filter(f=>!m.seen[f.id]);if(pending.length){alert(m,'Debes recorrer las dos partes del Mapa de influencia y valorar o marcar N/A en los siete factores.');return false;}
    if(!m.details.length&&!m.contextDeferred){alert(m,'Elige uno o dos detalles o marca que aún no puedes identificarlos.',true);return false;}
    if(!m.plan){alert(m,'Elige una de las cuatro acciones para guardar tu práctica.');return false;}return true;}
  async function exit(m){if(m.busy)return;stopVoice(m);clearTimeout(m.pending);m.busy=true;
    try{await saveTx(m);m.onBack?.();}catch{announce(m,'No fue posible guardar tu avance. Puedes reintentar sin perder las selecciones.');}finally{m.busy=false;}}
  function previous(m){if(m.page===1){void exit(m);return;}move(m,m.page-1);}
  function updateCompleted(m,p){const now=new Date().toISOString(),list=Array.isArray(p.sessions)?p.sessions:[];
    const ids=INFLUENCE.map(f=>f.label+': '+(m.influence[f.id]===null?'N/A':m.influence[f.id])).join(' · ');
    const txt=[`Factor reconocido: ${option(FACILITATORS,m.factor)?.label}`,`Mapa de influencia: ${ids}`,
      m.context.where?`Dónde: ${m.context.where}`:'',m.context.feeling?`Cómo: ${m.context.feeling}`:'',m.context.happening?`Qué ocurría: ${m.context.happening}`:'',
      m.details.length?'Detalles: '+m.details.map(id=>option(DETAILS,id)?.label).join(', '):'Contexto aún sin identificar',
      `Acción: ${option(PLANS,m.plan)?.label}`,m.context.reflection?`Reflexión: ${m.context.reflection}`:''].filter(Boolean).join(' | ');
    const idx=list.findIndex(s=>s?.day===DAY&&s.practiceId==='pattern-observe'&&s.status==='completed');
    const previous=idx>=0?normal(list[idx]):{};
    const row={...previous,id:previous.id||'pattern-observe-d2-touch-v2',day:DAY,date:previous.date||now.slice(0,10),practiceId:'pattern-observe',variant:previous.variant||'solo',status:'completed',activeSec:previous.activeSec??0,metricKey:previous.metricKey||'desire',metricLabel:previous.metricLabel||'Interés hoy (0–10)',before:previous.before??null,after:previous.after??null,reflection:txt};
    p.sessions=idx>=0?list.map((s,i)=>i===idx?row:s):[...list,row];
    p.dayDone={...normal(p.dayDone),[String(DAY)]:normal(p.dayDone)[DAY]||now};
  }
  async function complete(m){if(m.busy||!canComplete(m))return;clearTimeout(m.pending);stopVoice(m);m.busy=true;announce(m,'Guardando tu Mapa de influencia y las respuestas del Día 2…');
    try{m.completed=true;await saveTx(m,p=>updateCompleted(m,p));
      await m.onCompleted?.({day:DAY,confirmed:true,source:'desire-lab',desireDay2TouchVersion:VERSION,facilitator:m.factor,plannedAction:m.plan,mapCompleted:true,contextDeferred:m.contextDeferred});
      m.onBack?.();
    }catch{m.completed=false;announce(m,'No se pudo completar el guardado. Tus elecciones siguen disponibles para reintentar.');}finally{m.busy=false;}
  }
  function action(m,e){const el=e.target?.closest?.('[data-ds2-action]');if(!el||!m.host.contains(el)||active!==m||!m.valid()||m.busy)return;
    const a=el.dataset.ds2Action,v=el.dataset.ds2Value;
    if(a==='dismiss'){m.alert=null;render(m);return;}
    if(a==='defer-context'){m.contextDeferred=true;m.alert=null;move(m,6);return;}
    if(m.alert)return;
    if(a==='cancel-field'){m.editField=null;render(m);return;}
    if(a==='save-field'){const k=m.editField;if(!k||!CONTEXT_FIELDS[k])return;m.context[k]=m.host.querySelector('[data-ds2-editor]')?.value?.trim().slice(0,400)||'';m.editField=null;render(m);schedule(m);return;}
    if(m.editField)return;
    if(a==='audio'){speak(m,'guide-'+m.page,GUIDE[m.page]);return;}
    if(a==='intro'){const idx=+v;if(INTRO[idx])speak(m,'intro-'+v,INTRO[idx].speech);return;}
    if(a==='choose'){
      const items=pageOptions(m,m.page);const item=option(items,v);if(!item)return;
      if(m.page===2)m.factor=v;else if(m.page===6)m.plan=v;else return;
      m.message='';render(m);schedule(m);speak(m,'option-'+m.page+'-'+v,item.speech);return;
    }
    if(a==='na'){setInfluence(m,v,null);return;}
    if(a==='field'){if(!CONTEXT_FIELDS[v])return;m.editField=v;render(m);m.host.querySelector('[data-ds2-editor]')?.focus?.();return;}
    if(a==='detail'){const has=m.details.includes(v);if(has){m.details=m.details.filter(k=>k!==v);}else if(m.details.length===2){alert(m,'Puedes elegir un máximo de dos detalles. Desmarca uno antes de elegir otro.');return;}else{m.details.push(v);m.contextDeferred=false;}render(m);schedule(m);return;}
    if(a==='next'){forward(m);return;}if(a==='save'){void complete(m);return;}if(a==='back'){previous(m);return;}if(a==='exit'){void exit(m);return;}
  }
  function onPointer(m,e){const el=e.target?.closest?.('[data-ds2-factor]');if(!el||active!==m||!m.valid()||m.editField||m.alert||!m.host.contains(el))return;
    const rect=el.getBoundingClientRect();if(!rect.width)return;
    const amount=Math.max(0,Math.min(10,Math.round((e.clientX-rect.left)/rect.width*10)));
    el.value=String(amount);const k=el.dataset.ds2Factor;m.influence[k]=amount;m.seen[k]=true;el.dataset.chosen='true';schedule(m);
  }
  function onRangeEnd(m,e){const el=e.target?.closest?.('[data-ds2-factor]');if(el&&active===m&&m.valid())render(m);}
  function onRange(m,e){const el=e.target?.closest?.('[data-ds2-factor]');if(!el||active!==m||!m.valid()||m.editField||m.alert)return;
    const val=+el.value;if(Number.isInteger(val)&&val>=0&&val<=10){const key=el.dataset.ds2Factor;m.influence[key]=val;m.seen[key]=true;const valueMarker=m.host.querySelector('[data-ds2-factor="'+key+'"]');if(valueMarker)valueMarker.dataset.chosen='true';schedule(m);}
  }
  async function mount({host,storage,valid=()=>true,onBack=()=>{},onCompleted=()=>{},images=IMAGES,reset=false}={}){
    if(!host?.isConnected||!storage||typeof storage.read!=='function'||typeof storage.save!=='function')return false;
    stop();const m={host,storage,valid,onBack,onCompleted,images,page:1,factor:null,plan:null,influence:{},seen:{},context:{where:'',feeling:'',happening:'',reflection:''},details:[],contextDeferred:false,completed:false,alert:null,editField:null,message:'',speaking:null,pending:null,queue:Promise.resolve(),events:new AbortController(),busy:false};active=m;
    host.innerHTML='<p role="status">Recuperando el Día 2 completo y tu Mapa de influencia…</p>';
    try{const bundle=normal(await m.storage.read());if(active!==m||!m.valid())return false;
      let p={};try{p=normal(JSON.parse(bundle['spm-desire-program']||'{}'))}catch{}
      let note={};if(!reset)try{note=normal(JSON.parse(normal(p.detailNotes)[NOTE_KEY]||'{}'))}catch{}
      let previous={};try{previous=normal(JSON.parse(normal(p.detailNotes).desireDay2TouchV1||'{}'))}catch{}
      m.factor=option(FACILITATORS,note.factor||previous.factor)?.id||null;
      m.plan=option(PLANS,note.plan||previous.plan)?.id||null;
      const map=normal(p.influence),seen=normal(note.seen);
      for(const f of INFLUENCE){const k=f.id;const isKnown=own(map,k)||seen[k]===true;m.seen[k]=isKnown;m.influence[k]=isKnown?validNumber(map[k]):null;}
      m.context={...m.context,...Object.fromEntries(Object.entries(normal(note.context)).filter(([k])=>own(CONTEXT_FIELDS,k)).map(([k,v])=>[k,String(v||'').slice(0,400)]))};
      m.details=Array.isArray(note.details)?note.details.filter(v=>!!option(DETAILS,v)).slice(0,2):[];
      m.contextDeferred=note.contextDeferred===true;m.completed=note.completed===true;
      const requested=Number(note.page)||1;m.page=requested>=1&&requested<=6?requested:1;
      // La versión anterior de 2 pantallas no certifica que se haya realizado el mapa.
      if(!m.factor&&m.page>2)m.page=2;
      if(m.page>3&&pendingFactors(m,3).length)m.page=3;
      if(m.page>4&&pendingFactors(m,4).length)m.page=4;
      render(m);
      host.addEventListener('click',e=>action(m,e),{signal:m.events.signal});
      host.addEventListener('pointerdown',e=>onPointer(m,e),{signal:m.events.signal});
      host.addEventListener('pointerup',e=>onRangeEnd(m,e),{signal:m.events.signal});
      host.addEventListener('input',e=>onRange(m,e),{signal:m.events.signal});
      host.addEventListener('change',e=>{onRange(m,e);onRangeEnd(m,e);},{signal:m.events.signal});
      window.addEventListener('pagehide',()=>stopVoice(m),{signal:m.events.signal});
      document.addEventListener('visibilitychange',()=>{if(document.hidden)stopVoice(m);},{signal:m.events.signal});
      window.addEventListener('spm:session-change',()=>{if(!m.valid())stop();},{signal:m.events.signal});
      return true;
    }catch{if(active===m)host.innerHTML='<p role="alert">No pudimos recuperar el Día 2. Los registros anteriores se conservan; regresa a Actividades de hoy y reintenta.</p>';return false;}
  }
  function stop(){const m=active;active=null;if(!m)return;clearTimeout(m.pending);stopVoice(m);m.events.abort();}
  function pause(){if(active)stopVoice(active);}
  window.SPM_DESIRE_DAY2_TOUCH={mount,stop,pause,images:IMAGES.slice(),curriculum:'pattern-observe',mapKeys:INFLUENCE.map(f=>f.id),voice:'es-CO estándar del dispositivo',version:VERSION};
})();
