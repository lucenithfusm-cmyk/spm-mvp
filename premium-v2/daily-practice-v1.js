(()=>{
'use strict';
// Today owns the daily entry; the original calendars and full resources remain in Library.
const $=s=>document?.querySelector(s),ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
const scopeOf=c=>c?`${c.userId}:${c.planId}`:'';
const directErection=(c,a)=>window.SPM_ERECTION_PRACTICE?.supports(c,a)===true;
const pelvicGuide=(c,a)=>c?.primary==='erection'&&Number(c.day)===6&&a?.id==='main'&&a.kind==='pelvic'&&!!window.SPM_ERECTION_PRACTICE?.definition(6);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current='',view='entry',records={},loaded=false,loadError=false,generation=0,active=null;
// A recommendation for review is not a blanket ban on educational work.
// Keep the existing clinical flags; never clear them or change an assessment here.
function safety(c){
 if(!c)return 'unavailable';
 const questions=window.ENGINE?.assessment?.questions||[];
 if(c.safety==='urgent'||questions.some(q=>q.safety==='urgent'&&(c.flags?.includes(q.id)||c.answers?.[q.id]===true)))return 'urgent';
 return (c.safety&&c.safety!=='none')||c.flags?.length||c.checkins?.some(x=>x.new_safety_flag===true)?'review':'none';
}
const educational=new Set(['baseline','context','checklist','review','progress','reassessment','script','planner','priorities','reframe','ifthen']);
function restricted(c,id){
 const level=safety(c);if(level==='unavailable'||level==='urgent')return true;
 if(!id)return false;
 const a=typeof id==='string'?assignments(c).find(x=>x.id===id):id;if(!a)return true;
 if(a.kind==='wellness'&&a.tip.category==='movement'&&window.SPM_RESOURCES?.restricted?.(c)!==false)return true;
 if(window.SPM_PROGRAM_RECOVERY?.blocks(c,a))return true;
 if(level==='none')return false;
 return !(a.kind==='program-checkpoint'||a.kind==='video'||a.kind==='ep-checkpoint'||a.kind==='confidence'||(a.kind==='worksheet'&&educational.has(a.lesson?.interaction))||(a.kind==='wellness'&&a.tip.category!=='movement'));
}
function safetyNotice(c){
 const level=safety(c);if(level==='none')return '';
 const flags=Array.isArray(c?.flags)?c.flags:[],questions=window.ENGINE?.assessment?.questions||[];
 const reasons=flags.map(id=>questions.find(q=>q.id===id)?.prompt_es||'Una respuesta de tu evaluación requiere revisión profesional.');
 if(c?.checkins?.some(x=>x.new_safety_flag===true))reasons.push('En un seguimiento de este programa registraste una nueva señal de seguridad.');
 if(!reasons.length)reasons.push('Tu evaluación guardada indica que conviene una revisión profesional.');
 return `<aside class="notice ${level==='urgent'?'danger':'warn'}" data-daily-safety><b>${level==='urgent'?'Señal que requiere atención médica antes de practicar':'Revisión profesional recomendada'}</b><p>${level==='urgent'?'Las prácticas siguen en pausa. Consulta la indicación de tu Performance Map; la biblioteca educativa está disponible.':'Puedes abrir las revisiones, registros educativos y hábitos permitidos. Solo se pausan las prácticas que requieren aclarar esta señal.'}</p><details><summary>¿Por qué aparece este aviso?</summary><ul>${reasons.map(r=>`<li>${esc(r)}</li>`).join('')}</ul><p>Este aviso viene de tus respuestas guardadas, no de una restricción de acceso a la página.</p></details><p>Tu avance se conserva. Este aviso no aparece por dejar una actividad sin registrar.</p><button type="button" class="btn pri" data-daily-safety-next>Ver cómo continuar</button> <button type="button" class="btn sec" data-daily-safety-map>Ver mi Performance Map</button> <button type="button" class="btn sec" data-daily-library>Biblioteca completa</button></aside>`;
}
function assignments(c=ctx()){
 if(!c||!Number.isInteger(Number(c.day))||c.day<1||c.day>28)return [];
 const day=Number(c.day),base=window.SPM_MODULES?.days?.find(x=>x.d===day);
 if(!base)return [];
 let main={id:'main',kind:'worksheet',title:base.title_es,summary:base.practice_es,lesson:base};
 if(c.primary==='erection'){
  const spec=window.SPM_DE_LIBRARY?.days?.()[day];
  main={...main,kind:'erection',title:spec?.title||window.SPM_ERECTILE_FUNCTION?.days?.[day]?.[1]||base.title_es,summary:spec?.practice||base.practice_es};
 }else if(c.primary==='desire')main={...main,kind:'desire',title:`Tu sesión de deseo · Día ${day}`,summary:'Abre tu práctica de hoy.',...(window.SPM_ERECTION_DAILY?.desireCurriculum[day]||{})};
 else if(c.primary==='ejaculation'&&window.SPM_EJACULATORY_CONTROL?.schedule?.[day]){
  const s=window.SPM_EJACULATORY_CONTROL.schedule[day],names={startstop:'Start/Stop',squeeze:'Stop–Squeeze',combined:'Técnica combinada'};
  main={...main,kind:'ejaculation',title:`${names[s.tech]} · Sesión ${s.session}`,summary:`Semana ${s.week}. Abre la explicación y la práctica guiada de esta sesión.`};
 }
 if(c.primary==='ejaculation'&&[14,28].includes(day))main={...main,kind:'ep-checkpoint',title:day===14?'Revisión intermedia · Día 14':'Reevaluación · Día 28',summary:'Abre el control de seguimiento del programa y registra tu evolución.'};
 let support=(window.SPM_DAILY_SUPPORT?.assignments(day,c)||[]).map(a=>({...a,kind:a.lab}));
 // When the day's core lesson is the scheduled Lab, launch it once, with its existing gates.
 const shared=main.kind==='worksheet'&&support.find(a=>(base.interaction==='breathing'&&a.kind==='breathing')||(base.interaction==='timer'&&a.kind==='sensate'));
 if(shared){main={...shared,id:'main'};support=support.filter(a=>a!==shared);}
 if(main.kind==='worksheet'&&base.interaction==='profileSkill'){
  if(support.some(a=>a.kind==='sensate')){const assigned=support.find(a=>a.kind==='sensate');main={...assigned,id:'main'};support=support.filter(a=>a!==assigned);}
  else main={...main,kind:'confidence',title:'Confianza y atención · práctica de hoy',summary:'Abre la práctica interactiva de confianza y registra cómo respondes.'};
 }
 if(main.kind==='worksheet'){const resource={pelvic:'pelvic',arousal:'response',steps:'recovery',confidence:'confidence'}[base.interaction];if(resource)main={...main,kind:resource};}
 // The route-specific main lesson must not swallow the transverse curriculum.
 // Reuse its original days and omit a second copy when the main lesson covers it.
 const transverse={6:'pelvic',11:'recovery',13:'confidence',18:'worksheet',25:'recovery'}[day];
 const deTool=c.primary==='erection'?window.SPM_DE_LIBRARY?.days?.()[day]?.tool:null;
 const alreadyCovered=main.kind===transverse||(main.kind==='erection'&&['pelvic','recovery','confidence','partner','ifthen'].includes(deTool));
 if(transverse&&!alreadyCovered&&['erection','ejaculation','desire'].includes(main.kind))support.push({id:`support-${transverse}`,kind:transverse,title:base.title_es,summary:base.practice_es,lesson:base});
 // The approved agenda offers pelvic work conditionally on 12/19/24;
 // day 24 uses the scheduled control session for the ejaculation route.
 if([12,19,24].includes(day)&&!(day===24&&c.primary==='ejaculation'))support.push({id:'support-pelvic',kind:'pelvic',title:'Piso pélvico · conciencia y relajación',summary:'Abre la práctica breve adaptada a tu perfil. Sigue la indicación del laboratorio; no añadas fortalecimiento por tu cuenta.',optional:true,optionalLabel:'APOYO SEGÚN TU PERFIL · OPCIONAL'});
 // Review/checkpoint days stay light, including when a non-urgent flag is present.
 if(safety(c)==='review'&&[7,14,21,28].includes(day)&&main.kind!=='ep-checkpoint')main={id:'main',kind:'worksheet',title:base.title_es,summary:base.practice_es,lesson:base};
 if(c.primary==='erection'&&window.SPM_ERECTION_DAILY)({main,support}=window.SPM_ERECTION_DAILY.compose(main,support,c,safety(c)));
 if(window.SPM_DAILY_RESOURCES)({main,support}=window.SPM_DAILY_RESOURCES.compose(main,support,c));
 const tips=window.SPM_WELLNESS_DAILY_TIP_V1?.tipsFor(day)||[];
 const wellness=tips.map(tip=>({id:`wellness-${tip.category}`,kind:'wellness',title:`${tip.label} · ${tip.title}`,summary:tip.body,tip,optional:true}));
 const followup=window.SPM_PROGRAM_CHECKPOINT?.assignment(c);
 if(followup)support.push(followup);
 // Assessments and checkpoint reviews never gate access to the next day.
 if([14,28].includes(day)){
  main={...main,optional:true,optionalLabel:'SEGUIMIENTO · OPCIONAL'};
  support=support.map(a=>a.kind==='confidence'?{...a,optional:true,optionalLabel:'REVISIÓN · OPCIONAL'}:a);
 }

 if(directErection(c,main))main={...main,...window.SPM_ERECTION_PRACTICE.definition(day)};
 return [main,...support,...wellness];
}
function recordComplete(a){const r=records[a.id];if(a.tip&&r?.tipId!==a.tip.id)return false;if(a.kind==='program-checkpoint'&&!window.SPM_PROGRAM_CHECKPOINT?.valid(r))return false;return r?.completed===true&&(!r.activityKind||r.activityKind===a.kind)&&(!a.scenario||r.scenario===a.scenario);}
function focus(el){if(!el)return;el.tabIndex=-1;el.style.scrollMarginTop=(Math.ceil($('.top')?.getBoundingClientRect().height||0)+16)+'px';el.scrollIntoView({behavior:'instant',block:'start'});el.focus({preventScroll:true});}
function status(text,error=false){const el=$('#spmDailyStatus');if(el){el.textContent=text;el.classList.toggle('error',error);}}
function layout(){
 const plan=$('#plan');if(!plan)return;
 plan.dataset.spmDailyView=view;
 let nav=$('#spmDailyViews');if(!nav){nav=document.createElement('nav');nav.id='spmDailyViews';nav.setAttribute('aria-label','Tu programa');nav.innerHTML='<button type="button" data-daily-view="today">Hoy</button><button type="button" data-daily-view="library">Biblioteca completa</button>';plan.prepend(nav);nav.addEventListener('click',e=>{const v=e.target.closest('[data-daily-view]')?.dataset.dailyView;if(v==='today')open({focus:true});if(v==='library')library();});}
 // Existing modules may prepend themselves after hydration. Keep the daily navigation first.
 if(plan.firstElementChild!==nav)plan.prepend(nav);
 nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dailyView===(view==='library'?'library':'today'))));
 let session=$('#spmDailySession');if(!session){session=document.createElement('section');session.id='spmDailySession';session.className='card';plan.appendChild(session);}
 let lib=$('#spmDailyLibraryIntro');if(!lib){lib=document.createElement('section');lib.id='spmDailyLibraryIntro';lib.className='card';lib.innerHTML='<span class="stepBadge">Consulta a tu ritmo</span><h2>Biblioteca completa</h2><p>Programas, recursos y recorrido de 28 días. Tu sesión asignada está en Hoy.</p>';nav.after(lib);}
}
function wellnessCard(a,saved=false){
  if(a.kind==='wellness'&&a.tip.category==='sleep'&&window.SPM_SLEEP_LIBRARY_V1?.dailyCard){return `<article class="spm-daily-activity is-sleep" data-activity="${esc(a.id)}"><small>SUEÑO · OPCIONAL</small>${window.SPM_SLEEP_LIBRARY_V1.dailyCard(a.tip.sleepTipId)}${window.SPM_PRACTICE_AUDIO?.button(window.SPM_SLEEP_LIBRARY_V1.dailyAudio?.(a.tip.sleepTipId)||a.tip.body)||''}<div class="spm-daily-actions"><button type="button" class="btn pri" data-daily-open="${esc(a.id)}">Ver mi acción de sueño →</button>${saved?'<span class="spm-daily-saved">Registrada ✓</span>':''}</div></article>`;}
  if(a.kind==='wellness'&&a.tip.category==='nutrition'&&window.SPM_NUTRITION_DAILY){return `<article class="spm-daily-activity is-nutrition" data-activity="${esc(a.id)}">${window.SPM_NUTRITION_DAILY.card(a.tip)}<div class="spm-daily-actions"><button type="button" class="btn pri" data-daily-open="${esc(a.id)}">Ver preparación →</button><button type="button" class="btn sec" data-nutrition-library>Biblioteca de Nutrición</button>${saved?'<span class="spm-daily-saved">Registrada ✓</span>':''}</div></article>`;}
 return '';
}
function render(){
 layout();const host=$('#spmDailySession'),c=ctx();if(!host)return;if(!c){host.replaceChildren();return;}
 const items=assignments(c),required=items.filter(a=>!a.optional),done=required.filter(recordComplete).length;
 const paused=restricted(c),pending=required.some(a=>restricted(c,a));
 const signature=JSON.stringify([current,c.primary,c.secondary,c.answers,c.safety,c.flags,c.checkins,items.map(a=>[a.id,restricted(c,a)]),loaded,loadError,records,c.completed]);
 if(host.dataset.signature===signature)return;host.dataset.signature=signature;
 window.SPM_ERECTION_PRACTICE?.stop();delete host.dataset.focusedPractice;
 pauseDailyVideo();
 host.innerHTML=`<span class="stepBadge">HOY · DÍA ${c.day} DE 28</span><h2>Lo que vas a hacer hoy</h2><p class="spm-daily-count">${done} de ${required.length} prácticas realizadas</p>${window.SPM_PROGRAM_RECOVERY?.notice(c)||''}${safetyNotice(c)}<div class="spm-daily-activities">${items.map((a,i)=>{
  const blocked=restricted(c,a),saved=recordComplete(a),directDesireEntry=a.kind==='desire'&&Number(c.day)===1,directErectionEntry=directErection(c,a),guidedPelvicEntry=pelvicGuide(c,a),directEntry=directDesireEntry||directErectionEntry||guidedPelvicEntry;
  const guide=guidedPelvicEntry&&!blocked?window.SPM_ERECTION_PRACTICE.definition(6):null;
  const visual=wellnessCard(a,saved);if(visual)return visual;
  return `<article class="spm-daily-activity" data-activity="${esc(a.id)}"${directErectionEntry||guidedPelvicEntry?' data-direct-practice="erection"':''}><span class="spm-daily-number">${i+1}</span><div><small>${a.optional?esc(a.optionalLabel||'BIENESTAR · OPCIONAL'):esc(a.label||(i===0?'PRÁCTICA PRINCIPAL':'APOYO DE HOY'))}${a.kind==='video'&&a.duration?' · '+esc(a.duration):''}</small><h3>${esc(a.title)}</h3>${(a.kind==='program-checkpoint'||directErectionEntry||guidedPelvicEntry)&&!blocked?'':`<p>${esc(blocked?'La práctica requiere revisar primero la indicación de seguridad. Puedes consultar el motivo y el contenido educativo.':a.kind==='desire'?'Tu práctica guiada de hoy.':a.summary)}</p>`}${guide?`<div data-daily-pelvic-guide>${window.SPM_CHECKPOINT_AUDIO?.markup({src:guide.audioSrc,text:guide.script,label:'Escuchar guía de hoy'})||`<details><summary>Leer indicaciones</summary><p>${esc(guide.script)}</p></details>`}</div>`:''}${!['video','program-checkpoint'].includes(a.kind)&&!blocked&&!directEntry?(window.SPM_PRACTICE_AUDIO?.button(a.kind==='desire'?'Abre la actividad para escuchar el paso a paso y realizarla a tu ritmo. Al terminar podrás registrar tu experiencia.':a.summary)||''):''}<div class="spm-daily-actions"><button type="button" class="btn pri" data-daily-open="${esc(a.id)}" ${(directErectionEntry||guidedPelvicEntry)&&!blocked&&!loaded?'disabled':''}>${blocked?(window.SPM_PROGRAM_RECOVERY?.blocks(c,a)?'Completar evaluación pendiente':'Ver indicación y opciones'):saved?'Volver a abrir':directEntry?'Iniciar mi práctica de hoy':a.kind==='video'?'Ver video de hoy':'Abrir actividad'}${directEntry?'':' →'}</button>${blocked?'<span class="spm-daily-paused">Práctica en pausa</span>':saved?'<span class="spm-daily-saved">Registrada ✓</span>':directDesireEntry||directErectionEntry||a.kind==='program-checkpoint'?'':`<button type="button" class="btn sec" data-daily-confirm="${esc(a.id)}" ${!loaded?'disabled':''}>Registrar como realizada</button>`}</div></div></article>`;
 }).join('')}</div><div id="spmDailyWorkspace"></div><div class="spm-daily-footer"><button type="button" class="btn pri" id="spmDailyComplete" ${paused||pending||!loaded||done!==required.length||!required.length||c.completed?.includes(Number(c.day))?'disabled':''}>${c.completed?.includes(Number(c.day))?'Día completado ✓':`Completar día ${c.day}`}</button><button type="button" class="btn sec" id="spmDailyCoach">Registrar cómo fue hoy</button></div><p id="spmDailyStatus" role="status">${loadError?'No pudimos recuperar tus registros. Reintenta antes de completar el día.':loaded?(paused||pending?(window.SPM_PROGRAM_RECOVERY?.pending(c).length?'Completa las respuestas pendientes para revisar cómo continuar. Tu avance se conserva.':'Hay prácticas en pausa por seguridad. Usa «Ver cómo continuar»; tu avance se conserva.'):done!==required.length?`Te faltan ${required.length-done} prácticas por registrar. Abre una actividad pendiente y regístrala cuando la hayas realizado.`:'Tus prácticas están registradas. Ya puedes completar el día.'):'Recuperando tus actividades guardadas…'}</p>${loadError?'<button type="button" class="btn sec" id="spmDailyRetry">Reintentar</button>':''}`;
 host.querySelectorAll('[data-daily-open]').forEach(b=>b.onclick=()=>launch(b.dataset.dailyOpen));
 host.querySelectorAll('[data-daily-confirm]').forEach(b=>b.onclick=()=>confirmActivity(b.dataset.dailyConfirm));
 host.querySelectorAll('[data-nutrition-library]').forEach(b=>b.onclick=()=>window.SPM_RESOURCES?.open('nutrition',Number(c.day),{origin:'dailyPlan'}));
 window.SPM_CHECKPOINT_AUDIO?.bind(host);
 host.querySelector('[data-daily-pelvic-guide] [data-checkpoint-audio-transcript]>summary')?.replaceChildren(document.createTextNode('Leer indicaciones'));
 bindSafety(host);
 $('#spmDailyCoach').onclick=()=>{const select=$('#coachDay');if(select)select.value=String(ctx().day);$('#navCoach')?.click();};
 $('#spmDailyRetry')?.addEventListener('click',()=>load(true));
 $('#spmDailyComplete').onclick=complete;
}
function bindSafety(root){
 root.querySelectorAll('[data-daily-safety-next]').forEach(b=>b.onclick=safetyNext);
 root.querySelectorAll('[data-daily-safety-map]').forEach(b=>b.onclick=()=>$('#navMap')?.click());
 root.querySelectorAll('[data-daily-library]').forEach(b=>b.onclick=library);
}
function safetyNext(){
 const c=ctx(),box=$('#spmDailyWorkspace');if(!c||!box)return;
 const available=assignments(c).filter(a=>!restricted(c,a));
 box.innerHTML=`${window.SPM_PROGRAM_RECOVERY?.notice(c)||''}<section class="spm-daily-work" data-safety-next><h3>Tu siguiente paso</h3><p>${safety(c)==='urgent'?'Antes de retomar prácticas, sigue la indicación de atención médica de tu Performance Map.':'Revisa la respuesta que originó el aviso en tu Performance Map. Si necesita aclaración, coméntala con tu profesional antes de retomar las prácticas en pausa.'}</p><p>No hace falta borrar tu cuenta ni empezar otra vez. Tus registros y tu día actual se conservan. Registrar cómo te sientes no elimina por sí solo una indicación de seguridad.</p>${!window.SPM_PROGRAM_RECOVERY?.pending(c).length?'<p><b>Tu evaluación no tiene respuestas pendientes.</b> La pausa corresponde a una señal de seguridad guardada; completar una práctica o una reevaluación no equivale a resolver esa señal.</p>':''}<button type="button" class="btn pri" data-review-safety-answer>Revisar una respuesta marcada por error</button><button type="button" class="btn sec" data-safety-refresh>Ya completé el requisito: comprobar estado</button><p data-safety-refresh-status role="status"></p><h4>Lo que puedes hacer ahora</h4>${available.length?available.map(a=>`<button type="button" class="btn sec" data-safe-activity="${esc(a.id)}">${esc(a.title)}</button>`).join(''):'<p>Puedes consultar el motivo del aviso y la biblioteca educativa.</p>'}<button type="button" class="btn sec" data-daily-safety-map>Revisar el motivo en mi mapa</button><button type="button" class="btn sec" data-daily-library>Abrir biblioteca educativa</button><button type="button" class="btn sec" data-safety-return>Volver a Hoy</button></section>`;
 box.querySelector('[data-safety-refresh]').onclick=async e=>{
  const button=e.currentTarget,status=box.querySelector('[data-safety-refresh-status]');button.disabled=true;status.textContent='Comprobando tu evaluación guardada…';
  try{
   await window.SPM_PROGRAM_REPAIR.refresh(scopeOf(c));
   const latest=ctx();if(scopeOf(latest)!==scopeOf(c))throw Error('Program changed');
   $('#navPlan')?.click();open();
   const target=$('#spmDailyStatus');if(target)target.textContent=window.SPM_PROGRAM_RECOVERY?.pending(latest).length?'Todavía hay respuestas pendientes. Usa «Completar evaluación pendiente».':safety(latest)==='none'?'Estado actualizado. Puedes continuar con tus actividades.':'Comprobamos tu evaluación: no faltan respuestas, pero la señal de seguridad sigue registrada. Revisa su motivo con tu profesional; tu avance se conserva.';
  }catch{button.disabled=false;status.textContent='No pudimos comprobar el estado. Tu avance se conserva; reintenta cuando tengas conexión.';}
 };
 bindSafety(box);box.querySelectorAll('[data-safe-activity]').forEach(b=>b.onclick=()=>launch(b.dataset.safeActivity));box.querySelector('[data-safety-return]').onclick=()=>{box.replaceChildren();focus($('#spmDailySession'));};focus(box);
}
function pausedActivity(a){
 const box=$('#spmDailyWorkspace'),c=ctx();
 if(window.SPM_PROGRAM_RECOVERY?.blocks(c,a)){window.SPM_PROGRAM_RECOVERY.open();return;}
 box.innerHTML=`<section class="spm-daily-work"><h3>${esc(a.title)}</h3><p>Esta práctica está en pausa. Abrir la biblioteca no elimina la indicación de seguridad.</p>${window.SPM_PROGRAM_RECOVERY?.notice(c)||''}${safetyNotice(c)||'<p>Movimiento mantiene su revisión de seguridad antes de iniciar o registrar actividad física.</p><button type="button" class="btn pri" data-daily-safety-next>Ver cómo continuar</button>'}<button type="button" class="btn sec" data-daily-library>Consultar biblioteca educativa</button></section>`;
 bindSafety(box);focus(box);
}
async function load(force=false){
 const c=ctx(),key=c?`${scopeOf(c)}:${c.day}`:'';
 if(key===current&&!force){render();return;}
 window.SPM_ERECTION_PRACTICE?.stop();delete $('#spmDailySession')?.dataset.focusedPractice;
 current=key;const token=++generation;records={};loaded=false;loadError=false;active=null;render();
 if(!c)return;
 try{const value=await window.SPM_DAILY_RECORDS.read(scopeOf(c),Number(c.day));if(token!==generation)return;records=value;loaded=true;}
 catch{if(token!==generation)return;loadError=true;}
 render();
}
function open({focus:shouldFocus=true}={}){window.SPM_ERECTION_PRACTICE?.stop();window.SPM_PRACTICE_AUDIO?.stop();window.SPM_CHECKPOINT_AUDIO?.stop($('#spmDailyClosing'));$('#spmDailyWorkspace')?.replaceChildren();$('#spmDailyClosing')?.remove();delete $('#spmDailySession')?.dataset.continuation;delete $('#spmDailySession')?.dataset.focusedPractice;pauseDailyVideo();view='today';load();layout();if(shouldFocus)focus($('#spmDailySession'));}
function pauseDailyVideo(){window.SPM_ERECTION_PRACTICE?.pause();window.SPM_CHECKPOINT_AUDIO?.stop($('#spmDailySession'));window.SPM_PRACTICE_AUDIO?.stop($('#spmDailyWorkspace'));document.querySelectorAll('#spmDailyWorkspace video').forEach(v=>v.pause());}
function library(){pauseDailyVideo();view='library';layout();focus($('#spmDailyLibraryIntro'));}
async function saveActivity(id,data={},expectedScope=scopeOf(ctx()),day=Number(ctx()?.day)){
 const c=ctx();if(scopeOf(c)!==expectedScope||Number(c?.day)!==day||restricted(c,id))throw Error('La sesión o su indicación de seguridad ha cambiado.');
 const activity=assignments(c).find(a=>a.id===id);if(!activity)throw Error('Esta actividad no está asignada hoy.');if(activity.kind==='program-checkpoint'&&!window.SPM_PROGRAM_CHECKPOINT?.valid(data))throw Error('Completa la evaluación antes de registrarla.');if(directErection(c,activity)&&!window.SPM_ERECTION_PRACTICE.valid(data,day))throw Error('Completa las acciones de tu práctica antes de guardarla.');data={...data,...(activity.tip?{tipId:activity.tip.id}:{}),activityKind:activity.kind,...(activity.scenario?{scenario:activity.scenario}:{})};
 await window.SPM_DAILY_RECORDS.save(id,{...data,completed:true},expectedScope,day);
 if(scopeOf(ctx())===expectedScope&&Number(ctx()?.day)===day){records[id]={...data,completed:true};render();status('Actividad guardada en tu programa ✓');if(active?.id===id){showContinuation();refreshContinuation();}const a=assignments().find(x=>x.id===id);const module=a&&!directErection(ctx(),a)&&$(moduleSelectors[a.kind]||'#no-spm-module');if(module)focus(module.querySelector('[data-spm-next]'));}
 return {ok:true};
}
function confirmActivity(id){
 const assigned=assignments().find(a=>a.id===id);
 if(directErection(ctx(),assigned)||['program-checkpoint','desire','video'].includes(assigned?.kind)){launch(id);return;}
 pauseDailyVideo();
 const a=assignments().find(x=>x.id===id),box=$('#spmDailyWorkspace');if(!a||!box||restricted(ctx(),a))return;
 const captured=scopeOf(ctx()),day=Number(ctx().day);
 box.innerHTML=`<form class="spm-daily-work"><h3>${esc(a.title)}</h3><label><input type="checkbox" required> Confirmo que realicé esta actividad hoy.</label><p class="micro">Abrir una actividad no la marca como completada.</p><button type="submit" class="btn pri">Guardar actividad</button><p role="status"></p></form>`;
 const form=box.querySelector('form');form.onsubmit=async e=>{e.preventDefault();const b=form.querySelector('button');b.disabled=true;try{await saveActivity(id,{confirmed:true},captured,day);}catch{b.disabled=false;form.querySelector('[role=status]').textContent='No se pudo guardar. Reintenta; el día no ha avanzado.';}};focus(box);
}
function dailyVideo(a){
 const video=window.SPM_VIDEO_LIBRARY?.find(v=>v.key===a.videoKey),box=$('#spmDailyWorkspace');
 if(!video){status('No pudimos encontrar el video de hoy. Reintenta.',true);return;}
 const captured=scopeOf(ctx()),day=Number(ctx().day),prior=records[a.id]||{};
 box.innerHTML=`<form class="spm-daily-work" data-daily-video="${esc(a.videoKey)}"><span class="stepBadge">VIDEO DE HOY · Día ${day}</span><h3>${esc(video.title)}</h3><video controls playsinline preload="metadata" aria-label="${esc(video.title)}"></video><p data-video-error hidden>No pudimos cargar el video. <button type="button" data-video-retry>Reintentar</button></p>${window.SPM_VIDEO_ACTIONS?.markup(a.videoKey)||''}<label class="spm-video-confirm"><input name="confirmed" type="checkbox" required ${prior.confirmed?'checked':''}> <span>Ya revisé este video y la acción propuesta.</span></label><div class="spm-daily-actions"><button type="submit" class="btn pri" ${!loaded?'disabled':''}>Guardar y volver a Hoy</button><button type="button" class="btn sec" data-video-return>Volver sin guardar</button></div><p role="status">${!loaded?'Puedes ver el video. Para guardarlo, vuelve a Hoy y reintenta cargar tus registros.':''}</p></form>`;
 const form=box.querySelector('form'),player=form.querySelector('video'),error=form.querySelector('[data-video-error]');player.src=video.url;
 player.onloadedmetadata=()=>{player.toggleAttribute('data-portrait',player.videoHeight>player.videoWidth);error.hidden=true;};player.onerror=()=>{error.hidden=false;};
 form.querySelector('[data-video-retry]').onclick=()=>{error.hidden=true;player.load();};
 player.onplay=()=>window.SPM_PROGRAM_VIDEOS?.pause();
 form.querySelector('[data-video-return]').onclick=()=>open();
 form.onsubmit=async e=>{e.preventDefault();if(!form.reportValidity()||!loaded)return;const b=form.querySelector('[type=submit]');if(b.disabled)return;b.disabled=true;try{await saveActivity(a.id,{...prior,videoKey:a.videoKey,confirmed:true},captured,day);focus($('#spmDailySession'));}catch{b.disabled=false;form.querySelector('[role=status]').textContent='No se pudo guardar. Tu confirmación se conserva; reintenta.';}};
 focus(box);
}
function wellness(a){
 if(a.tip.category==='sleep'&&window.SPM_SLEEP_LIBRARY_V1){window.SPM_SLEEP_LIBRARY_V1.open({origin:'dailyPlan',tip:a.tip.sleepTipId});return;}
 const box=$('#spmDailyWorkspace'),captured=scopeOf(ctx()),day=Number(ctx().day),nutrition=a.tip.category==='nutrition';
 const steps=Array.isArray(a.tip.steps)?a.tip.steps:[],instructions=steps.length?steps.map((step,i)=>`Paso ${i+1}. ${step}`).join(' '):a.tip.body;
 const content=nutrition&&window.SPM_NUTRITION_DAILY?window.SPM_NUTRITION_DAILY.recipe(a.tip):`<span class="stepBadge">${esc(a.tip.label)} · Día ${day}</span><h3>${esc(a.tip.title)}</h3>${window.SPM_PRACTICE_AUDIO?.button(instructions)||''}${steps.length?`<ol>${steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol>`:`<p>${esc(a.tip.body)}</p>`}`;
 box.innerHTML=`<section class="spm-daily-work" data-wellness-session>${nutrition?'<p>Hoy revisa los pasos y deja listo lo que necesites. Prepara la receta en el momento indicado.</p>':''}${content}<div class="spm-daily-actions"><button type="button" class="btn pri" data-wellness-done>${nutrition?'Preparación revisada · Guardar':'Ya lo hice · Guardar'}</button><button type="button" class="btn sec" data-wellness-return>Volver a Hoy</button></div><button type="button" class="btn sec" data-wellness-library>Biblioteca de ${esc(a.tip.label)}</button><p role="status"></p></section>`;
 box.querySelector('[data-wellness-return]').onclick=()=>open();
 box.querySelector('[data-wellness-library]').onclick=()=>{window.SPM_PRACTICE_AUDIO?.stop();window.SPM_RESOURCES?.open(a.tip.category,day,{origin:'dailyPlan',activityId:a.tip.movementId});};
 box.querySelector('[data-wellness-done]').onclick=async e=>{const button=e.currentTarget;button.disabled=true;try{await saveActivity(a.id,{confirmed:true},captured,day);focus($('#spmDailyWorkspace'));}catch{button.disabled=false;box.querySelector('[role=status]').textContent='No se pudo guardar. Revisa tu conexión y reintenta.';}};focus(box);
}
function worksheet(a){
 const box=$('#spmDailyWorkspace'),d=a.lesson,prior=records[a.id]||{},captured=scopeOf(ctx()),day=Number(ctx().day);
 box.innerHTML=`<form class="spm-daily-work"><span class="stepBadge">Práctica del día ${day}</span><h3>${esc(d.title_es)}</h3><details><summary>Antes de practicar</summary><p>${esc(d.learn_es)}</p></details><h4>Hazlo ahora</h4><p>${esc(d.practice_es)}</p>${window.SPM_PRACTICE_AUDIO?.button(d.practice_es)||''}<label>Tu registro<textarea name="reflection" rows="3" maxlength="2000" required placeholder="Escribe lo que identificaste o practicaste…">${esc(prior.reflection)}</textarea></label><label>${esc(d.measure_es)}<textarea name="measure" rows="2" maxlength="1000" placeholder="Tu medida u observación; puedes indicar no evaluable.">${esc(prior.measure)}</textarea></label><p>${esc(d.apply_es)}</p><label><input name="confirmed" type="checkbox" required> Ya realicé esta práctica.</label><button type="submit" class="btn pri">Guardar práctica y volver a Hoy</button><p role="status"></p></form>`;
 const form=box.querySelector('form');form.onsubmit=async e=>{e.preventDefault();const b=form.querySelector('[type=submit]');b.disabled=true;const fields=new FormData(form);try{await saveActivity(a.id,{reflection:fields.get('reflection'),measure:fields.get('measure'),confirmed:true},captured,day);focus($('#spmDailySession'));}catch{b.disabled=false;form.querySelector('[role=status]').textContent='No se pudo guardar. Tus respuestas siguen aquí; reintenta.';}};focus(box);
}
async function launch(id){
 window.SPM_ERECTION_PRACTICE?.stop();delete $('#spmDailySession')?.dataset.focusedPractice;
 window.SPM_PRACTICE_AUDIO?.stop();pauseDailyVideo();
 const c=ctx(),a=assignments(c).find(x=>x.id===id);if(!a)return;if(restricted(c,a)){pausedActivity(a);return;}
 if((directErection(c,a)||pelvicGuide(c,a))&&!loaded){status(loadError?'No pudimos recuperar tus registros. Pulsa «Reintentar» antes de iniciar.':'Estamos recuperando tus registros. Podrás iniciar en un momento.');return;}
 active={id,scope:scopeOf(c),day:Number(c.day)};
 try{
  if(directErection(c,a)){$('#spmDailySession').dataset.focusedPractice='erection';await window.SPM_ERECTION_PRACTICE.open(a);}
  else if(a.kind==='program-checkpoint')await window.SPM_PROGRAM_CHECKPOINT.open(a);
  else if(a.kind==='video')dailyVideo(a);
  else if(a.kind==='erection')window.SPM_ERECTILE_FUNCTION.open(Number(c.day),{origin:'dailyPlan'});
  else if(a.kind==='ejaculation')window.SPM_EJACULATORY_CONTROL.open(Number(c.day),{origin:'dailyPlan'});
  else if(a.kind==='desire')await window.SPM_DESIRE_LAB.open({origin:'dailyPlan'});
  else if(['confidence','response','recovery'].includes(a.kind))window.SPM_RESOURCES.open(a.kind,Number(c.day),{origin:'dailyPlan'});
  else if(a.kind==='ep-checkpoint')window.SPM_EP_ASSESSMENT.open(Number(c.day));
  else if(a.kind==='pelvic')await window.SPM_PELVIC_LAB.openScheduled({origin:'dailyPlan',day:Number(c.day),preference:a.pelvicPreference||'lab'});
  else if(a.kind==='breathing')await window.SPM_BREATHING_LAB.open({origin:'dailyPlan',day:Number(c.day)});
  else if(a.kind==='sensate')await window.SPM_SENSATE_LAB.open({origin:'dailyPlan',day:Number(c.day)});
  else if(a.kind==='wellness')wellness(a);
  else worksheet(a);
 refreshContinuation();
 }catch{delete $('#spmDailySession')?.dataset.focusedPractice;status('No pudimos abrir la actividad. Vuelve a intentarlo.',true);}
}
const moduleSelectors={desire:'.spm-desire-modal[open]',sensate:'.spm-sensate-modal[open]',breathing:'.spm-breathing-modal[open]',pelvic:'.spm-pf-modal[open],#spmPelvicV2:not([hidden])',erection:'#spmDeModal.on',ejaculation:'#spmEcModal.on',confidence:'.sr-dialog[open]',response:'.sr-dialog[open]',recovery:'.sr-dialog[open]'};
function validActive(){const c=ctx();return active&&active.scope===scopeOf(c)&&active.day===Number(c?.day);}
function nextActivities(){return assignments().filter(a=>!recordComplete(a));}
async function leaveActivity(){
 const a=assignments().find(a=>a.id===active?.id);if(!a)return true;
 if(directErection(ctx(),a)){window.SPM_ERECTION_PRACTICE?.stop();return true;}
 if(a.kind==='pelvic'&&$('#spmPelvicV2:not([hidden])')){window.SPM_PELVIC_V2?.close();return !$('#spmPelvicV2:not([hidden])');}
 const api={desire:'SPM_DESIRE_LAB',sensate:'SPM_SENSATE_LAB',breathing:'SPM_BREATHING_LAB',pelvic:'SPM_PELVIC_LAB'}[a.kind];
 if(api&&window[api]?.close)return await window[api].close()!==false;
 const root=$(moduleSelectors[a.kind]||'#no-spm-module');
 if(root){const close=root.querySelector('.deClose,.ecClose,[data-sr-close]');if(!close)return false;close.click();}
 return true;
}
function continuation(root){
 if(!root||!validActive())return;
 const c=ctx(),items=nextActivities(),a=assignments(c).find(x=>x.id===active.id),currentDone=a&&recordComplete(a);
 let panel=root.querySelector('[data-spm-next]');if(!panel){panel=document.createElement('section');panel.dataset.spmNext='';panel.className='spm-daily-work';root.appendChild(panel);}
 const sig=JSON.stringify([active,items.map(x=>[x.id,restricted(c,x)]),currentDone]);if(panel.dataset.signature===sig)return;panel.dataset.signature=sig;
 panel.innerHTML=`<h3>Continúa tu día ${c.day}</h3>${a&&!currentDone?`<p>«${esc(a.title)}» sigue pendiente. Abrirla o detenerla no la marca como realizada.</p><button type="button" class="btn sec" data-next-record>${a.kind==='desire'||directErection(c,a)?'Retomar mi práctica':'Ya la realicé · Registrar'}</button>`:''}${items.filter(x=>x.id!==active.id).map(x=>wellnessCard(x).replaceAll('data-daily-open=','data-next-id=')||`<div><b>${esc(x.title)}</b><p>${x.optional?'Recomendación opcional':'Actividad pendiente'}</p><button type="button" class="btn pri" data-next-id="${esc(x.id)}">Continuar aquí →</button></div>`).join('')}${items.length===0?'<p>Terminaste las actividades de hoy. Continúa con constancia, a tu ritmo; no necesitas repetirlas ahora.</p>':''}${items.every(x=>x.optional)?'<button type="button" class="btn pri" data-next-day>Completar mi día</button>':''}<button type="button" class="btn sec" data-next-today>Ver todas mis actividades de hoy</button><p role="status"></p>`;
 const go=async fn=>{try{if(!await leaveActivity())throw Error();if(!validActive())throw Error();open({focus:false});fn();}catch{panel.querySelector('[role=status]').textContent='No pudimos guardar o salir. Conserva esta pantalla y vuelve a intentarlo.';}};
 panel.querySelectorAll('[data-nutrition-library]').forEach(b=>b.onclick=()=>go(()=>window.SPM_RESOURCES?.open('nutrition',Number(c.day),{origin:'dailyPlan'})));
 panel.querySelectorAll('[data-next-id]').forEach(b=>b.onclick=()=>go(()=>launch(b.dataset.nextId)));
 panel.querySelector('[data-next-record]')?.addEventListener('click',()=>go(()=>confirmActivity(a.id)));
 panel.querySelector('[data-next-today]').onclick=()=>go(()=>open());
 panel.querySelector('[data-next-day]')?.addEventListener('click',()=>go(complete));
}
function refreshContinuation(){
 if(view!=='today'||!validActive())return;
 const a=assignments().find(x=>x.id===active.id),module=a&&$(moduleSelectors[a.kind]||'#no-spm-module');
 if(directErection(ctx(),a))return;
 // Iframe labs hand off to the daily workspace after closing. An extra footer
 // inside their fixed-height dialogs would squeeze the practice out of view.
 if(['desire','breathing','sensate'].includes(a?.kind)){module?.querySelector('[data-spm-next]')?.remove();return;}
 if(module)continuation(module);
}
function showContinuation(){
 if(!validActive())return;open({focus:false});const box=$('#spmDailyWorkspace');if(!box)return;box.replaceChildren();$('#spmDailySession').dataset.continuation='true';continuation(box);focus(box);
}
const dailyAdvice=[
 ['Si hoy compartes un momento de intimidad, pregunta: «¿Qué te haría sentir a gusto hoy?». Escucha sin intentar resolver ni demostrar nada.','Si estás solo, identifica una cosa que te ayude a sentirte a gusto.'],
 ['Propón unos minutos de cercanía sin pantallas y sin obligación de continuar hacia una actividad sexual. Acuerden juntos qué les apetece.','Dedica esos minutos a una actividad agradable sin pantallas.'],
 ['Durante un encuentro que ambos deseen, vuelve a una sensación agradable —temperatura, textura o cercanía— en lugar de evaluar tu respuesta.','Explora una sensación cotidiana agradable sin buscar excitación.'],
 ['Expresa una preferencia de forma sencilla: «Me gusta cuando…». Invita a tu pareja a compartir la suya.','Escribe una preferencia que te gustaría poder expresar.'],
 ['Si notas presión, puedes decir: «Prefiero ir más despacio». Una pausa también puede formar parte de una experiencia agradable.','Practica esa frase para tenerla disponible cuando la necesites.'],
 ['Agradece un gesto concreto de tu pareja que te haya hecho sentir cuidado. La conexión también se construye fuera de la intimidad.','Reconoce un gesto de cuidado que tuviste contigo hoy.'],
 ['Recuerda una experiencia cómoda de esta semana. Comparte qué te gustó sin convertirla en una exigencia para la próxima vez.','Anota un detalle agradable de la semana que quieras conservar.'],
 ['Si hoy hay disposición de ambos, propón un abrazo o una caricia cómoda. No necesita conducir a nada más.','Elige un gesto de autocuidado que te resulte agradable.'],
 ['Pregunta a tu pareja si hoy prefiere conversar, descansar o compartir cercanía. Las preferencias pueden cambiar de un día a otro.','Pregúntate qué necesitas hoy y respeta esa respuesta.'],
 ['Exploren un detalle diferente que ambos elijan: música, luz o un momento sin interrupciones. Cambien solo una cosa.','Prueba un cambio pequeño en un momento agradable para ti.'],
 ['Si algo no sale como esperabas, prueba decir: «Podemos disfrutar de otra manera». Un momento no define toda la experiencia.','Escribe una forma amable de responderte ante una dificultad.'],
 ['Habla de lo que te gusta en un momento tranquilo, fuera de una situación de presión. Empieza con una sola idea.','Ensaya cómo expresarías esa idea con tus propias palabras.'],
 ['Da espacio a escuchar: pregunta «¿Cómo te sentiste?» y deja que tu pareja termine antes de responder.','Pregúntate cómo te sentiste hoy, sin calificarte.'],
 ['Hoy puedes compartir algo que has aprendido sobre ti. Dos semanas son una oportunidad para observar y seguir aprendiendo, no un examen de resultados.','Anota un aprendizaje, aunque todavía no notes cambios.'],
 ['Si ambos quieren cercanía, acuerden un ritmo cómodo y recuerden que cualquiera puede pedir una pausa o cambiar de idea.','Identifica una señal corporal que te invite a bajar el ritmo.'],
 ['Prueba describir una sensación agradable con palabras sencillas. No hace falta compararla con encuentros anteriores.','Describe una sensación agradable de hoy, sin puntuarla.'],
 ['Ofrece una elección en lugar de adivinar: «¿Te apetece esto o prefieres otra cosa?». Acepta también un no.','Piensa cómo expresarías un sí, un no o un todavía no.'],
 ['Comparte un límite junto con una preferencia: «Esto no me apetece; esto otro sí». La claridad ayuda a cuidarse mutuamente.','Escribe un límite y una preferencia que quieras respetar.'],
 ['Si ambos desean explorar, mantengan la atención en lo que resulta cómodo. No es necesario ampliar ni avanzar por cumplir una meta.','Elige una experiencia que ya sepas que te resulta cómoda.'],
 ['Recupera un detalle del ambiente que les haya ayudado a conectar. Repítelo como invitación, no como fórmula obligatoria.','Prepara un pequeño espacio de calma para ti.'],
 ['Al cerrar la semana, comparte qué te gustaría mantener y qué preferirías cambiar. Escucha también la respuesta de tu pareja.','Anota una cosa para mantener y otra para ajustar.'],
 ['Elige una forma de conexión que te haya resultado agradable y propón repetirla si ambos quieren. No busques reproducir exactamente una respuesta.','Repite una actividad agradable sin exigir que se sienta igual.'],
 ['Cambia «tiene que pasar» por «podemos explorar». Puedes usar esa frase para quitar presión a un encuentro.','Observa una expectativa rígida y reformúlala con más flexibilidad.'],
 ['Si hoy hay menos energía o interés, háblenlo y adapten el plan. Descansar o compartir compañía también son opciones.','Elige lo que encaje con tu energía de hoy.'],
 ['Acuerden un plan sencillo para un momento de presión: pausar, hablar o cambiar de actividad. No hace falta esperar a estar incómodos para conversarlo.','Escribe tu propio plan: «Si siento presión, puedo…».'],
 ['Propón mantener un pequeño hábito de conexión que ambos disfruten. Que sea flexible y posible, sin convertirlo en una obligación.','Elige un hábito pequeño de autocuidado que quieras mantener.'],
 ['Hoy puedes tomar la iniciativa con una invitación abierta: «Me gustaría compartir un rato contigo, ¿qué te apetece?».','Reserva un rato para algo que disfrutes y elige cómo vivirlo.'],
 ['Comparte algo que has reconocido de tu cuerpo y una práctica que quieras seguir realizando. Lleva ese aprendizaje a tu vida diaria con constancia y sin exigirte una respuesta determinada.','Elige una práctica que te haya resultado útil y un momento realista para retomarla.']
];
function closingAdvice(c=ctx(),day=Number(c?.day)){
 const advice=dailyAdvice[Math.min(28,Math.max(1,day||1))-1];
 return {title:'Llévalo a tu vida diaria',text:advice[0],individual:advice[1]};
}
function showClosingAdvice(c,day){
 const host=$('#spmDailySession');if(!host)return;const advice=closingAdvice(c,day),card=document.createElement('section');
 const final=day===28&&window.SPM_PROGRAM_CHECKPOINT;
 card.id='spmDailyClosing';card.className='spm-daily-work';card.innerHTML=`<span class="stepBadge">${day===28?'PROGRAMA DE 28 JORNADAS · COMPLETADO':`DÍA ${day} · COMPLETADO`}</span>${final?window.SPM_PROGRAM_CHECKPOINT.closingMarkup():''}<h3>${esc(advice.title)}</h3>${window.SPM_PRACTICE_AUDIO?.button(advice.text+' '+advice.individual,'Escuchar consejo')||''}<p>${esc(advice.text)}</p><p>${esc(advice.individual)}</p><div class="spm-daily-actions">${final?'<button type="button" class="btn pri" data-closing-report>Ver mi informe final →</button>':''}<button type="button" class="btn ${final?'sec':'pri'}" data-closing-next>${day===28?'Volver a mi programa':'Volver a mi ruta'} →</button></div>`;
 host.appendChild(card);host.dataset.continuation='true';$('#spmDailyWorkspace')?.replaceChildren();window.SPM_CHECKPOINT_AUDIO?.bind(card);
 card.querySelector('[data-closing-next]').onclick=()=>open();
 card.querySelector('[data-closing-report]')?.addEventListener('click',()=>{open({focus:false});launch('program-checkpoint');});focus(card);
}
async function complete(){
 const c=ctx(),completedDay=Number(c?.day),completedContext={...c},items=assignments(c).filter(a=>!a.optional);if(!loaded||restricted(c)||!items.length||items.some(a=>restricted(c,a)||!recordComplete(a)))return;
 const b=$('#spmDailyComplete');b.disabled=true;status('Guardando tu día…');
 try{await window.SPM_COMPLETE_DAILY_PRACTICE(Number(c.day),scopeOf(c));if(scopeOf(ctx())!==scopeOf(completedContext))return;await load(true);status(Number(c.day)===28?'Programa de 28 jornadas completado. Revisa tu informe y sigue poniendo en práctica lo aprendido.':`Día ${c.day} guardado. Tu siguiente sesión está preparada.`);showClosingAdvice(completedContext,completedDay);}
 catch{b.disabled=false;status('No se pudo completar el día. Reintenta; tus actividades permanecen guardadas.',true);}
}
const style=document.createElement('style');style.textContent=`
#plan[data-spm-daily-view="entry"]>:not(#spmTodayHero):not(#spmDailyViews),#plan[data-spm-daily-view="today"]>:not(#spmDailySession):not(#spmDailyViews),#plan[data-spm-daily-view="library"]>#spmTodayHero,#plan[data-spm-daily-view="library"]>#spmDailySession{display:none!important}
#spmDailySession[data-continuation="true"]>.spm-daily-activities,#spmDailySession[data-continuation="true"]>.spm-daily-footer,#spmDailySession[data-continuation="true"]>#spmDailyStatus{display:none!important}
#spmDailySession[data-focused-practice="erection"]>:is(.stepBadge,h2,.spm-daily-count,.spm-daily-activities,.spm-daily-footer,#spmDailyStatus){display:none!important}
.spm-daily-activity[data-direct-practice="erection"] h3{font-size:clamp(23px,4vw,28px);line-height:1.35;color:#fff;font-weight:750;margin:10px 0 22px}.spm-daily-activity[data-direct-practice="erection"] .spm-daily-actions button{min-height:52px;font-size:17px}
#spmDailyViews{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}#spmDailyViews button{border:1px solid #31535b;border-radius:999px;padding:12px 18px;background:#0c242b;color:#bed4d5;font:inherit;cursor:pointer}#spmDailyViews button[aria-pressed="true"]{background:#78dfc5;color:#06231e;font-weight:800}
.spm-daily-activities{display:grid;gap:14px;margin:24px 0}.spm-daily-activity{display:grid;grid-template-columns:36px minmax(0,1fr);gap:15px;padding:20px;border:1px solid #31545c;border-radius:18px;background:linear-gradient(135deg,#102e34,#0a1d25)}.spm-daily-number{display:grid;place-items:center;width:34px;height:34px;background:#d4b879;color:#072620;border-radius:50%;font-weight:900}.spm-daily-activity small{color:#9ae5d0;letter-spacing:.08em;font-size:10px}.spm-daily-activity h3{margin:7px 0 10px}.spm-daily-activity p{color:#b9cdd0;line-height:1.6}.spm-daily-actions,.spm-daily-footer{display:flex;align-items:center;flex-wrap:wrap;gap:10px}.spm-daily-saved{color:#8aebcc}.spm-daily-work{padding:20px;margin:20px 0;border:1px solid #5b817d;border-radius:18px;display:grid;gap:16px}.spm-daily-work label{display:block;line-height:1.6}.spm-daily-work textarea{display:block;width:100%;margin-top:10px;background:#061b23;border:1px solid #42626a;color:#f2f8f8;border-radius:10px;padding:12px;font:inherit}.spm-daily-work input{accent-color:#78dfc5}.spm-daily-work summary{cursor:pointer;color:#93e2ce}.spm-daily-work p{line-height:1.6}#spmDailyStatus{color:#a2c9c3;line-height:1.5}#spmDailyStatus.error{color:#ffd094}#spmDailySession button:disabled{opacity:.5;cursor:not-allowed}
#spmDeModal[data-daily-session="true"] #deRoad,#spmDeModal[data-daily-session="true"] #dePrev,#spmDeModal[data-daily-session="true"] #deNext,#spmDeModal[data-daily-session="true"] .spm-program-videos,#spmEcModal[data-daily-session="true"] .ecPremiumDock,#spmEcModal[data-daily-session="true"] #ecBackProgram{display:none!important}
.spm-daily-work video{display:block;width:100%;max-height:65vh;object-fit:contain;background:#000;border-radius:12px}.spm-daily-work video[data-portrait]{aspect-ratio:9/16;max-width:350px;margin:auto}.spm-daily-work [hidden]{display:none!important}
.spm-daily-work[data-daily-video]{min-width:0;border:0;padding:clamp(16px,3vw,28px);gap:22px;background:#0a1d25;font-size:17px}.spm-daily-work[data-daily-video]>h3{margin:0;font-size:clamp(24px,4vw,30px);line-height:1.3;color:#fff}.spm-daily-work[data-daily-video]>p{margin:0;max-width:65ch;line-height:1.7}.spm-daily-work[data-daily-video] .spm-video-confirm{display:flex;align-items:flex-start;gap:12px;margin-top:12px}.spm-video-confirm input{flex:none;width:20px;height:20px;margin:4px 0 0;accent-color:#d8ba75}.spm-daily-work[data-daily-video] :is(button,input):focus-visible{outline:3px solid #d8ba75;outline-offset:4px}#spmDailyWorkspace:has([data-daily-video]):focus{outline:none}
@media(max-width:540px){.spm-daily-activity{padding:15px;gap:10px;grid-template-columns:28px minmax(0,1fr)}.spm-daily-number{width:28px;height:28px}.spm-daily-actions{align-items:stretch;flex-direction:column}.spm-daily-actions button{width:100%}.spm-daily-work{padding:14px}}
`;document.head.appendChild(style);
document.addEventListener('click',e=>{if(e.target.closest('#navPlan,#goPlan,#navMap,#navCoach,#logoutBtn,#newAssessment'))pauseDailyVideo();if(e.target.closest('#navPlan,#goPlan')){view='entry';layout();}if(e.target.closest('#logoutBtn,#newAssessment')){generation++;current='';records={};loaded=false;active=null;$('#spmDailySession')?.replaceChildren();view='entry';}},true);
window.addEventListener('pagehide',()=>{pauseDailyVideo();generation++;});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseDailyVideo();});
window.addEventListener('spm:resourcecontext',()=>load());
window.addEventListener('spm:session-change',e=>{if(e.detail?.userId&&current.startsWith(e.detail.userId+':'))return;generation++;current='';records={};loaded=false;active=null;$('#spmDailySession')?.replaceChildren();});
window.addEventListener('spm:resource-return',e=>{if(e.detail?.origin==='dailyPlan')open();});
window.addEventListener('spm:de-return',e=>{if(e.detail?.origin==='dailyPlan')open();});
window.SPM_DAILY_PRACTICE={open,library,assignments,saveActivity,showContinuation,nextActivities,launch,closingAdvice,active:()=>active,restricted,safety,openLesson(day){const c=ctx(),a=assignments(c).find(x=>x.id==='main'),lesson=window.SPM_MODULES?.days?.find(x=>x.d===Number(day));if(!c||Number(c.day)!==Number(day)||!a||!lesson||restricted(c,a))return false;open();worksheet({...a,lesson});return true;}};
let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;layout();});}).observe($('#plan')||document.body,{childList:true});
let continuationPending=false;
new MutationObserver(()=>{if(continuationPending||!validActive())return;continuationPending=true;requestAnimationFrame(()=>{continuationPending=false;refreshContinuation();});}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open','hidden','class']});
layout();load();
})();
