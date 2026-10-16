(()=>{
'use strict';
// Today owns the daily entry; the original calendars and full resources remain in Library.
const $=s=>document.querySelector(s),ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
const scopeOf=c=>c?`${c.userId}:${c.planId}`:'';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current='',view='entry',records={},loaded=false,loadError=false,generation=0,active=null;
function restricted(c){return !c||c.safety!=='none'||c.flags?.length>0||c.checkins?.some(x=>x.new_safety_flag);}
function assignments(c=ctx()){
 if(!c||!Number.isInteger(Number(c.day))||c.day<1||c.day>28)return [];
 const day=Number(c.day),base=window.SPM_MODULES?.days?.find(x=>x.d===day);
 if(!base)return [];
 let main={id:'main',kind:'worksheet',title:base.title_es,summary:base.practice_es,lesson:base};
 if(c.primary==='erection'){
  const spec=window.SPM_DE_LIBRARY?.days?.()[day];
  main={...main,kind:'erection',title:spec?.title||window.SPM_ERECTILE_FUNCTION?.days?.[day]?.[1]||base.title_es,summary:spec?.practice||base.practice_es};
 }else if(c.primary==='desire')main={...main,kind:'desire',title:`Tu sesión de deseo · Día ${day}`,summary:'Abre las prácticas de deseo seleccionadas para esta jornada y registra tu experiencia.'};
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
 return [main,...support];
}
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
function render(){
 layout();const host=$('#spmDailySession'),c=ctx();if(!host)return;if(!c){host.replaceChildren();return;}
 const tip=window.SPM_WELLNESS_DAILY_TIP_V1?.tipFor(Number(c.day));
 const items=assignments(c),done=items.filter(a=>records[a.id]?.completed===true).length,paused=restricted(c);
 const signature=JSON.stringify([current,c.primary,c.secondary,c.safety,c.flags,c.checkins?.some(x=>x.new_safety_flag),loaded,loadError,records,c.completed]);
 if(host.dataset.signature===signature)return;host.dataset.signature=signature;
 host.innerHTML=`<span class="stepBadge">HOY · DÍA ${c.day} DE 28</span><h2>Estas son tus actividades de hoy</h2><p>Abre cada actividad y vuelve aquí al terminar. ${done} de ${items.length} registradas.</p>${paused?'<p class="notice warn">La práctica está en pausa por la indicación de seguridad de tu programa. Puedes consultar el contenido educativo en la Biblioteca.</p>':''}<div class="spm-daily-activities">${items.map((a,i)=>`<article class="spm-daily-activity" data-activity="${esc(a.id)}"><span class="spm-daily-number">${i+1}</span><div><small>${i===0?'PRÁCTICA PRINCIPAL':'APOYO DE HOY'}${a.minutes?' · '+a.minutes+' min':''}</small><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p><div class="spm-daily-actions"><button type="button" class="btn pri" data-daily-open="${esc(a.id)}" ${paused?'disabled':''}>${records[a.id]?.completed?'Volver a abrir':'Abrir actividad'} →</button>${records[a.id]?.completed?'<span class="spm-daily-saved">Registrada ✓</span>':`<button type="button" class="btn sec" data-daily-confirm="${esc(a.id)}" ${paused||!loaded?'disabled':''}>Registrar como realizada</button>`}</div></div></article>`).join('')}</div><div id="spmDailyWorkspace"></div>${tip?`<aside class="spm-daily-work"><small>BIENESTAR · ${esc(tip.label)} · OPCIONAL</small><h3>${esc(tip.title)}</h3><p>${esc(tip.body)}</p></aside>`:''}<div class="spm-daily-footer"><button type="button" class="btn pri" id="spmDailyComplete" ${paused||!loaded||done!==items.length||!items.length||c.completed?.includes(Number(c.day))?'disabled':''}>${c.completed?.includes(Number(c.day))?'Día completado ✓':`Completar día ${c.day}`}</button><button type="button" class="btn sec" id="spmDailyCoach">Registrar cómo fue hoy</button></div><p id="spmDailyStatus" role="status">${loadError?'No pudimos recuperar tus registros. Reintenta antes de completar el día.':loaded?'El día avanza cuando eliges completarlo.':'Recuperando tus actividades guardadas…'}</p>${loadError?'<button type="button" class="btn sec" id="spmDailyRetry">Reintentar</button>':''}`;
 host.querySelectorAll('[data-daily-open]').forEach(b=>b.onclick=()=>launch(b.dataset.dailyOpen));
 host.querySelectorAll('[data-daily-confirm]').forEach(b=>b.onclick=()=>confirmActivity(b.dataset.dailyConfirm));
 $('#spmDailyCoach').onclick=()=>{const select=$('#coachDay');if(select)select.value=String(ctx().day);$('#navCoach')?.click();};
 $('#spmDailyRetry')?.addEventListener('click',()=>load(true));
 $('#spmDailyComplete').onclick=complete;
}
async function load(force=false){
 const c=ctx(),key=c?`${scopeOf(c)}:${c.day}`:'';
 if(key===current&&!force){render();return;}
 current=key;const token=++generation;records={};loaded=false;loadError=false;active=null;render();
 if(!c)return;
 try{const value=await window.SPM_DAILY_RECORDS.read(scopeOf(c),Number(c.day));if(token!==generation)return;records=value;loaded=true;}
 catch{if(token!==generation)return;loadError=true;}
 render();
}
function open({focus:shouldFocus=true}={}){view='today';load();layout();if(shouldFocus)focus($('#spmDailySession'));}
function library(){view='library';layout();focus($('#spmDailyLibraryIntro'));}
async function saveActivity(id,data={},expectedScope=scopeOf(ctx()),day=Number(ctx()?.day)){
 const c=ctx();if(scopeOf(c)!==expectedScope||Number(c?.day)!==day||restricted(c))throw Error('La sesión o su indicación de seguridad ha cambiado.');
 if(!assignments(c).some(a=>a.id===id))throw Error('Esta actividad no está asignada hoy.');
 await window.SPM_DAILY_RECORDS.save(id,{...data,completed:true},expectedScope,day);
 if(scopeOf(ctx())===expectedScope&&Number(ctx()?.day)===day){records[id]={...data,completed:true};render();status('Actividad guardada en tu programa ✓');}
 return {ok:true};
}
function confirmActivity(id){
 const a=assignments().find(x=>x.id===id),box=$('#spmDailyWorkspace');if(!a||!box||restricted(ctx()))return;
 const captured=scopeOf(ctx()),day=Number(ctx().day);
 box.innerHTML=`<form class="spm-daily-work"><h3>${esc(a.title)}</h3><label><input type="checkbox" required> Confirmo que realicé esta actividad hoy.</label><p class="micro">Abrir una actividad no la marca como completada.</p><button type="submit" class="btn pri">Guardar actividad</button><p role="status"></p></form>`;
 const form=box.querySelector('form');form.onsubmit=async e=>{e.preventDefault();const b=form.querySelector('button');b.disabled=true;try{await saveActivity(id,{confirmed:true},captured,day);}catch{b.disabled=false;form.querySelector('[role=status]').textContent='No se pudo guardar. Reintenta; el día no ha avanzado.';}};focus(box);
}
function worksheet(a){
 const box=$('#spmDailyWorkspace'),d=a.lesson,prior=records[a.id]||{},captured=scopeOf(ctx()),day=Number(ctx().day);
 box.innerHTML=`<form class="spm-daily-work"><span class="stepBadge">Práctica del día ${day}</span><h3>${esc(d.title_es)}</h3><details><summary>Antes de practicar</summary><p>${esc(d.learn_es)}</p></details><h4>Hazlo ahora</h4><p>${esc(d.practice_es)}</p><label>Tu registro<textarea name="reflection" rows="3" maxlength="2000" required placeholder="Escribe lo que identificaste o practicaste…">${esc(prior.reflection)}</textarea></label><label>${esc(d.measure_es)}<textarea name="measure" rows="2" maxlength="1000" placeholder="Tu medida u observación; puedes indicar no evaluable.">${esc(prior.measure)}</textarea></label><p>${esc(d.apply_es)}</p><label><input name="confirmed" type="checkbox" required> Ya realicé esta práctica.</label><button type="submit" class="btn pri">Guardar práctica y volver a Hoy</button><p role="status"></p></form>`;
 const form=box.querySelector('form');form.onsubmit=async e=>{e.preventDefault();const b=form.querySelector('button');b.disabled=true;const fields=new FormData(form);try{await saveActivity(a.id,{reflection:fields.get('reflection'),measure:fields.get('measure'),confirmed:true},captured,day);focus($('#spmDailySession'));}catch{b.disabled=false;form.querySelector('[role=status]').textContent='No se pudo guardar. Tus respuestas siguen aquí; reintenta.';}};focus(box);
}
async function launch(id){
 const c=ctx(),a=assignments(c).find(x=>x.id===id);if(!a||restricted(c))return;
 active={id,scope:scopeOf(c),day:Number(c.day)};
 try{
  if(a.kind==='erection')window.SPM_ERECTILE_FUNCTION.open(Number(c.day),{origin:'dailyPlan'});
  else if(a.kind==='ejaculation')window.SPM_EJACULATORY_CONTROL.open(Number(c.day),{origin:'dailyPlan'});
  else if(a.kind==='desire')await window.SPM_DESIRE_LAB.open({origin:'dailyPlan'});
  else if(['confidence','response','recovery'].includes(a.kind))window.SPM_RESOURCES.open(a.kind,Number(c.day),{origin:'dailyPlan'});
  else if(a.kind==='ep-checkpoint')window.SPM_EP_ASSESSMENT.open(Number(c.day));
  else if(a.kind==='pelvic')await window.SPM_PELVIC_LAB.open({origin:'dailyPlan',day:Number(c.day)});
  else if(a.kind==='breathing')await window.SPM_BREATHING_LAB.open({origin:'dailyPlan',day:Number(c.day)});
  else if(a.kind==='sensate')await window.SPM_SENSATE_LAB.open({origin:'dailyPlan',day:Number(c.day)});
  else worksheet(a);
 }catch{status('No pudimos abrir la actividad. Vuelve a intentarlo.',true);}
}
async function complete(){
 const c=ctx(),items=assignments(c);if(!loaded||restricted(c)||!items.length||items.some(a=>!records[a.id]?.completed))return;
 const b=$('#spmDailyComplete');b.disabled=true;status('Guardando tu día…');
 try{await window.SPM_COMPLETE_DAILY_PRACTICE(Number(c.day),scopeOf(c));await load(true);status(Number(c.day)===28?'Ciclo inicial completado. Revisa tu progreso y la recomendación de continuidad.':`Día ${c.day} guardado. Tu siguiente sesión está preparada.`);focus($('#spmDailySession'));}
 catch{b.disabled=false;status('No se pudo completar el día. Reintenta; tus actividades permanecen guardadas.',true);}
}
const style=document.createElement('style');style.textContent=`
#plan[data-spm-daily-view="entry"]>:not(#spmTodayHero):not(#spmDailyViews),#plan[data-spm-daily-view="today"]>:not(#spmDailySession):not(#spmDailyViews),#plan[data-spm-daily-view="library"]>#spmTodayHero,#plan[data-spm-daily-view="library"]>#spmDailySession{display:none!important}
#spmDailyViews{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}#spmDailyViews button{border:1px solid #31535b;border-radius:999px;padding:12px 18px;background:#0c242b;color:#bed4d5;font:inherit;cursor:pointer}#spmDailyViews button[aria-pressed="true"]{background:#78dfc5;color:#06231e;font-weight:800}
.spm-daily-activities{display:grid;gap:14px;margin:24px 0}.spm-daily-activity{display:grid;grid-template-columns:36px minmax(0,1fr);gap:15px;padding:20px;border:1px solid #31545c;border-radius:18px;background:linear-gradient(135deg,#102e34,#0a1d25)}.spm-daily-number{display:grid;place-items:center;width:34px;height:34px;background:#d4b879;color:#072620;border-radius:50%;font-weight:900}.spm-daily-activity small{color:#9ae5d0;letter-spacing:.08em;font-size:10px}.spm-daily-activity h3{margin:7px 0 10px}.spm-daily-activity p{color:#b9cdd0;line-height:1.6}.spm-daily-actions,.spm-daily-footer{display:flex;align-items:center;flex-wrap:wrap;gap:10px}.spm-daily-saved{color:#8aebcc}.spm-daily-work{padding:20px;margin:20px 0;border:1px solid #5b817d;border-radius:18px;display:grid;gap:16px}.spm-daily-work label{display:block;line-height:1.6}.spm-daily-work textarea{display:block;width:100%;margin-top:10px;background:#061b23;border:1px solid #42626a;color:#f2f8f8;border-radius:10px;padding:12px;font:inherit}.spm-daily-work input{accent-color:#78dfc5}.spm-daily-work summary{cursor:pointer;color:#93e2ce}.spm-daily-work p{line-height:1.6}#spmDailyStatus{color:#a2c9c3;line-height:1.5}#spmDailyStatus.error{color:#ffd094}#spmDailySession button:disabled{opacity:.5;cursor:not-allowed}
#spmDeModal[data-daily-session="true"] #deRoad,#spmDeModal[data-daily-session="true"] #dePrev,#spmDeModal[data-daily-session="true"] #deNext,#spmDeModal[data-daily-session="true"] .spm-program-videos,#spmEcModal[data-daily-session="true"] .ecPremiumDock,#spmEcModal[data-daily-session="true"] #ecBackProgram{display:none!important}
@media(max-width:540px){.spm-daily-activity{padding:15px;gap:10px;grid-template-columns:28px minmax(0,1fr)}.spm-daily-number{width:28px;height:28px}.spm-daily-actions{align-items:stretch;flex-direction:column}.spm-daily-actions button{width:100%}.spm-daily-work{padding:14px}}
`;document.head.appendChild(style);
document.addEventListener('click',e=>{if(e.target.closest('#navPlan,#goPlan')){view='entry';layout();}if(e.target.closest('#logoutBtn,#newAssessment')){generation++;current='';records={};loaded=false;active=null;$('#spmDailySession')?.replaceChildren();view='entry';}},true);
window.addEventListener('spm:resourcecontext',()=>load());
window.addEventListener('spm:session-change',e=>{if(e.detail?.userId&&current.startsWith(e.detail.userId+':'))return;generation++;current='';records={};loaded=false;active=null;$('#spmDailySession')?.replaceChildren();});
window.addEventListener('spm:de-return',e=>{if(e.detail?.origin==='dailyPlan')open();});
window.SPM_DAILY_PRACTICE={open,library,assignments,saveActivity,active:()=>active,restricted};
let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;layout();});}).observe($('#plan')||document.body,{childList:true});
layout();load();
})();
