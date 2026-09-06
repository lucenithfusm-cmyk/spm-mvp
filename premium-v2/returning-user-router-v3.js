(()=>{
'use strict';
if(window.SPM_RETURNING_USER_ROUTER_V3)return;
window.SPM_RETURNING_USER_ROUTER_V3=true;
const SB_URL='https://jogirmziqjlsttbbarcx.supabase.co';
const SB_KEY='sb_publishable_jXmxa5K6ThK9C8DPIxmVVQ_mbuLWVaf';
const $=id=>document.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const labels={erection:'Rendimiento eréctil',ejaculation:'Control eyaculatorio',desire:'Deseo y excitación',confidence:'Confianza sexual',wellbeing:'Satisfacción y conexión',lifestyle:'Base de rendimiento'};
const label=k=>window.SPM_MODULES?.profiles?.[k]?.label_es||labels[k]||k||'Programa SPM';
let CTX=null,running=false,restored=false,manualAssessment=false,noPlans=false;

function status(text,kind='good'){
 const e=$('status');if(!e)return;
 e.className=`notice ${kind} globalStatus`;e.textContent=text;e.hidden=false;
}
function activate(id){
 document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('on',p.id===id));
 document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('on',b.dataset.panel===id));
}
function hideIntake(){['ageCard','motiveCard','quizCard'].forEach(id=>{const e=$(id);if(e)e.hidden=true});}
function showNewUserIntake(){
 const age=$('ageCard'),motive=$('motiveCard'),quiz=$('quizCard');
 if(age)age.hidden=false;if(motive)motive.hidden=true;if(quiz)quiz.hidden=true;activate('intake');
}
function enableProgramNav(){
 ['navMap','navPlan','navCoach','navProgress'].forEach(id=>{const e=$(id);if(e)e.disabled=false});
 document.querySelectorAll('.navbtn[data-panel]').forEach(b=>{
   if(b.dataset.spmV3Nav)return;b.dataset.spmV3Nav='1';
   b.addEventListener('click',()=>{if(!b.disabled&&b.dataset.panel)activate(b.dataset.panel)});
 });
}
function mapObj(m){return{scores:m.domain_scores||{},primary:m.primary_domain||'lifestyle',secondary:m.secondary_domain||null,total:Number(m.spm_score)||0,urgent:m.safety_level==='urgent'?(m.safety_flags||[]):[],review:m.safety_level==='review'?(m.safety_flags||[]):[]}}
function renderMap(){
 if(!CTX)return;const x=mapObj(CTX.map);
 if($('scoreValue'))$('scoreValue').textContent=x.total;
 if($('scoreRing'))$('scoreRing').style.setProperty('--pct',x.total);
 if($('profileTitle'))$('profileTitle').textContent=label(x.primary);
 if($('profileExplain'))$('profileExplain').textContent=`Tu prioridad educativa principal aparece en ${label(x.primary).toLowerCase()}${x.secondary?`, con un componente secundario en ${label(x.secondary).toLowerCase()}`:''}. El mapa guía el entrenamiento; no es un diagnóstico.`;
 if($('safetyBox'))$('safetyBox').innerHTML=x.urgent.length?'<div class="notice danger"><b>Prioridad de seguridad.</b> Revisa esta señal con un profesional antes de continuar.</div>':x.review.length?'<div class="notice warn"><b>Revisión profesional recomendada.</b> Hay datos que conviene revisar externamente.</div>':'<div class="notice good"><b>Sin banderas mayores detectadas en este tamizaje.</b> Esto no sustituye una valoración médica.</div>';
 const g=$('domainGrid');if(g){g.innerHTML='';Object.entries(x.scores).filter(([k])=>labels[k]).forEach(([k,v])=>g.insertAdjacentHTML('beforeend',`<div class="domain"><div class="domainHead"><b>${label(k)}</b><span>${v}/100</span></div><div class="bar"><i style="width:${v}%"></i></div></div>`))}
 if($('whyList'))$('whyList').innerHTML=`<div class="mini"><small>Driver principal</small><p>${label(x.primary)} es el dominio con mayor margen de trabajo.</p></div>${x.secondary?`<div class="mini"><small>Secundario</small><p>${label(x.secondary)} puede modificar la respuesta del driver principal.</p></div>`:''}`;
}
function currentPhase(){return Math.max(1,Math.min(4,Math.ceil((Number(CTX?.plan?.current_day)||1)/7)))}
function renderPlan(){
 const M=window.SPM_MODULES;if(!CTX||!M?.days)return;
 const pid=currentPhase(),tabs=$('phaseTabs');
 if(tabs){tabs.innerHTML='';(M.phases||[]).forEach(ph=>{const b=document.createElement('button');b.className='phaseBtn'+(ph.id===pid?' on':'');b.textContent=`${ph.id}. ${ph.name_es}`;b.onclick=()=>renderPhase(ph.id);tabs.appendChild(b)})}
 renderPhase(pid);
}
function renderPhase(pid){
 const M=window.SPM_MODULES,ph=(M?.phases||[]).find(x=>x.id===pid);if(!CTX||!ph)return;
 document.querySelectorAll('.phaseBtn').forEach((b,i)=>b.classList.toggle('on',i===pid-1));
 if($('weekIntro'))$('weekIntro').innerHTML=`<b>${ph.name_es}</b> · ${ph.intro_es}`;
 const g=$('dayGrid');if(!g)return;g.innerHTML='';
 M.days.filter(x=>ph.days.includes(x.d)).forEach(day=>{
  const done=CTX.done.has(day.d),c=document.createElement('div');c.className='dayCard';
  c.innerHTML=`<div class="dayTop"><div class="dayNum">${day.d}</div><div><h4>${day.title_es}</h4><p>${(day.learn_es||'').slice(0,105)}…</p></div><span class="tag">${done?'Completado ✓':label(CTX.map.primary_domain)}</span></div><div class="dayBody"><div class="lessonFlow"><div class="lesson"><b>Aprender</b><p>${day.learn_es||''}</p></div><div class="lesson"><b>Practicar</b><p>${day.practice_es||'Practica la habilidad principal del día sin convertirla en una prueba de desempeño.'}</p></div><div class="lesson"><b>Medir</b><p>${day.measure_es||'Registra tu experiencia de 0 a 10.'}</p></div><div class="lesson"><b>Aplicar</b><p>${day.apply_es||'Aplica la habilidad en un contexto seguro y sin presión.'}</p></div><div class="lesson"><b>Completar</b><p>${day.complete_es||'Marca la práctica al finalizar.'}</p></div></div><div class="interactive"><button class="btn pri doneBtn">${done?'Completado ✓':'Marcar práctica como completada'}</button></div></div>`;
  c.querySelector('.dayTop').onclick=()=>c.classList.toggle('open');c.querySelector('.doneBtn').onclick=()=>completeDay(day.d,c);g.appendChild(c);
 });
}
async function saveModule({day,moduleKey,metricValue=null,metadata={}}){
 if(!CTX)throw new Error('No hay un plan restaurado para guardar esta práctica.');
 const payload={user_id:CTX.uid,plan_id:CTX.plan.id,day_number:day,module_key:moduleKey,metric_value:metricValue,metadata:{...metadata,source:'returning-user-router-v3'},completed_at:new Date().toISOString()};
 const {error}=await CTX.db.from('activity_completions').upsert(payload,{onConflict:'plan_id,day_number,module_key'});if(error)throw error;
 CTX.done.add(day);const next=Math.min(28,Math.max(...CTX.done,1)+1);CTX.plan.current_day=Math.max(Number(CTX.plan.current_day)||1,next);
 await CTX.db.from('plans').update({current_day:CTX.plan.current_day}).eq('id',CTX.plan.id).eq('user_id',CTX.uid);
 renderProgress();return{ok:true};
}
async function completeDay(day,card){
 try{await saveModule({day,moduleKey:'daily_practice'});if(card){const b=card.querySelector('.doneBtn'),t=card.querySelector('.tag');if(b)b.textContent='Completado ✓';if(t)t.textContent='Completado ✓'}status(`Día ${day} guardado correctamente.`)}catch(e){status(e.message||'No se pudo guardar el día.','danger')}
}
function renderCoach(){const s=$('coachDay');if(!s||!CTX)return;s.innerHTML='';for(let i=1;i<=28;i++)s.insertAdjacentHTML('beforeend',`<option value="${i}">Día ${i}</option>`);s.value=String(Math.min(28,Number(CTX.plan.current_day)||1))}
function coachDecision(v){if(v.flag)return{code:'clinical_review',text:'Pausa el entrenamiento de intensidad y busca revisión profesional externa por la nueva señal de seguridad.'};if(!v.completed||v.outcome<=3||v.stress>=8)return{code:'repeat_reduce',text:'Repite la habilidad de hoy con menor intensidad. El objetivo es consolidar, no forzar progresión.'};if(v.outcome>=7&&v.confidence>=6)return{code:'progress',text:'Buen patrón de respuesta. Puedes avanzar al siguiente día manteniendo la misma calidad de ejecución.'};return{code:'maintain',text:'Mantén la práctica actual un día más y observa consistencia antes de progresar.'}}
async function saveCoach(){
 if(!CTX)return;const v={day:+$('coachDay').value,sleep:+$('sleep').value,stress:+$('stress').value,confidence:+$('confidence').value,desire:+$('desire').value,outcome:+$('outcome').value,sexual:$('sexualActivity').value==='1',completed:$('completed').value==='1',flag:$('newFlag').value==='1',note:$('note').value.trim()};const d=coachDecision(v);
 const {data,error}=await CTX.db.from('daily_checkins').insert({user_id:CTX.uid,plan_id:CTX.plan.id,day_number:v.day,sleep:v.sleep,stress:v.stress,confidence:v.confidence,desire:v.desire,outcome:v.outcome,sexual_activity:v.sexual,practice_completed:v.completed,new_safety_flag:v.flag,note:v.note,coach_decision:d.text,decision_code:d.code}).select().single();
 if(error){status(error.message,'danger');return}CTX.checkins.push(data);if($('coachDecision'))$('coachDecision').innerHTML=`<div class="notice ${d.code==='clinical_review'?'danger':'good'}"><b>Decisión del Daily Coach:</b> ${d.text}</div>`;renderProgress();status('Check-in guardado. Tu progreso ya está persistido.');
}
function renderProgress(){
 if(!CTX)return;const n=CTX.checkins.length,avg=k=>n?(CTX.checkins.reduce((a,x)=>a+(Number(x[k])||0),0)/n).toFixed(1):'—';
 if($('stChecks'))$('stChecks').textContent=n;if($('stAdh'))$('stAdh').textContent=Math.round(CTX.done.size/28*100)+'%';if($('stConf'))$('stConf').textContent=avg('confidence');if($('stOutcome'))$('stOutcome').textContent=avg('outcome');if($('stDecision'))$('stDecision').textContent=n?(CTX.checkins[n-1].decision_code||'—'):'—';if($('savedState'))$('savedState').textContent='Guardado en la nube ✓';
 const chart=$('chart');if(chart){chart.innerHTML='';CTX.checkins.slice(-14).forEach(x=>{const c=document.createElement('div');c.className='col';c.style.height=`${Math.max(8,(Number(x.confidence)||0)*10)}%`;c.dataset.v=`D${x.day_number}: ${x.confidence}`;chart.appendChild(c)})}
}
function bindRestoredActions(assessmentCount){
 const gp=$('goPlan');if(gp)gp.onclick=()=>activate('plan');
 const cs=$('coachSave');if(cs)cs.onclick=saveCoach;
 const nb=$('newAssessment');if(nb){
  if(assessmentCount>=2){nb.hidden=true;nb.disabled=true;nb.setAttribute('aria-hidden','true')}
  else{nb.hidden=false;nb.disabled=false;nb.removeAttribute('aria-hidden');nb.addEventListener('click',()=>{manualAssessment=true},{once:true,capture:true})}
 }
 window.SPM_SAVE_MODULE=saveModule;
 window.SPM_RESTORED_CONTEXT=CTX;
}
async function restoreExisting(){
 if(running||restored||!window.supabase)return false;running=true;
 let foundPlans=false;
 try{
  const db=window.supabase.createClient(SB_URL,SB_KEY),{data:{session},error:se}=await db.auth.getSession();
  if(se)throw se;if(!session?.user)return false;const uid=session.user.id;
  hideIntake();status('Restaurando tu análisis y programa guardado…');
  const {data:plans,error:pe}=await db.from('plans').select('*').eq('user_id',uid);if(pe)throw pe;
  if(!plans?.length){noPlans=true;showNewUserIntake();const s=$('status');if(s)s.hidden=true;return false}
  foundPlans=true;
  const ranked=[...plans].sort((a,b)=>(Number(b.current_day||1)-Number(a.current_day||1))||(new Date(b.created_at)-new Date(a.created_at)));
  let plan=null,assessment=null,map=null;
  for(const p of ranked){
   if(!p.assessment_id||!p.performance_map_id)continue;
   const [ar,mr]=await Promise.all([
    db.from('assessments').select('*').eq('id',p.assessment_id).eq('user_id',uid).maybeSingle(),
    db.from('performance_maps').select('*').eq('id',p.performance_map_id).eq('user_id',uid).maybeSingle()
   ]);
   if(!ar.error&&!mr.error&&ar.data&&mr.data){plan=p;assessment=ar.data;map=mr.data;break}
  }
  if(!plan)throw new Error('Tus datos existen, pero no se encontró todavía un conjunto completo de evaluación, mapa y plan.');
  const [cr,dr,ac]=await Promise.all([
   db.from('activity_completions').select('*').eq('user_id',uid).eq('plan_id',plan.id),
   db.from('daily_checkins').select('*').eq('user_id',uid).eq('plan_id',plan.id).order('day_number'),
   db.from('assessments').select('id',{count:'exact',head:true}).eq('user_id',uid)
  ]);
  if(cr.error)throw cr.error;if(dr.error)throw dr.error;if(ac.error)throw ac.error;
  CTX={db,uid,session,plan,assessment,map,done:new Set((cr.data||[]).map(x=>x.day_number)),checkins:dr.data||[]};
  hideIntake();enableProgramNav();renderMap();renderPlan();renderCoach();renderProgress();bindRestoredActions(ac.count||0);activate('map');restored=true;
  status(`Tu análisis y Performance Map fueron restaurados. Tu programa continúa en el día ${Number(plan.current_day)||1}.`);
  return true;
 }catch(e){
  console.error('SPM returning-user router v3',e);
  if(foundPlans){hideIntake();activate('map');status(e.message||'No pudimos reconstruir el programa guardado todavía. Tus datos permanecen almacenados.','warn')}
  return false;
 }finally{running=false}
}
async function boot(){
 for(let i=0;i<60&&!window.supabase;i++)await sleep(100);
 for(let i=0;i<60&&!window.SPM_MODULES;i++)await sleep(100);
 for(let i=0;i<30&&!restored&&!noPlans;i++){await restoreExisting();if(!restored&&!noPlans)await sleep(500)}
}
const guard=new MutationObserver(()=>{
 if(!restored||manualAssessment)return;
 const age=$('ageCard'),intake=$('intake');
 if((age&&!age.hidden)||(intake&&intake.classList.contains('on'))){hideIntake();activate('map')}
});
if(document.documentElement)guard.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['hidden','class']});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('pageshow',()=>setTimeout(boot,100));
})();