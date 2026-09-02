(()=>{
const SB_URL='https://jogirmziqjlsttbbarcx.supabase.co';
const SB_KEY='sb_publishable_jXmxa5K6ThK9C8DPIxmVVQ_mbuLWVaf';
const db=window.supabase.createClient(SB_URL,SB_KEY);
const E=window.ENGINE||{assessment:{questions:[]}}, M=window.SPM_MODULES||{phases:[],days:[],profiles:{}};
const $=id=>document.getElementById(id);
const S={user:null,motives:[],queue:[],answers:{},qi:0,map:null,phase:1,assessmentId:null,mapId:null,planId:null,completed:new Set(),checkins:[]};
const motiveDefs=[
 ['erection','Erección o firmeza'],['ejaculation','Control eyaculatorio'],['desire','Deseo o excitación'],
 ['confidence','Confianza / ansiedad de desempeño'],['wellbeing','Satisfacción y conexión'],['optimization','Optimización / prevención']
];
function msg(t,kind='good'){const el=(!$('authScreen').hidden?$('authStatus'):$('status')); if(!el)return; el.className='notice '+kind; el.textContent=t; el.hidden=false;}
function hideMsg(){if($('status'))$('status').hidden=true;if($('authStatus'))$('authStatus').hidden=true}
function show(id){document.querySelectorAll('.screen').forEach(x=>x.hidden=x.id!==id)}
function nav(id){document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('on',p.id===id));document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('on',b.dataset.panel===id));}
function label(k){return (M.profiles?.[k]?.label_es)||({erection:'Rendimiento eréctil',ejaculation:'Control eyaculatorio',desire:'Deseo y excitación',confidence:'Confianza sexual',wellbeing:'Satisfacción y conexión',lifestyle:'Base de rendimiento'}[k]||k)}
async function boot(){
 const {data:{session}}=await db.auth.getSession();
 if(session?.user){S.user=session.user; await enterApp();} else show('authScreen');
 db.auth.onAuthStateChange(async(event,session)=>{
   if(event==='PASSWORD_RECOVERY'){show('authScreen');setTimeout(finishRecovery,100);return}
   if(session?.user&&!S.user){S.user=session.user;await enterApp()}
 });
}
async function sign(mode){
 hideMsg();const email=$('email').value.trim(), password=$('password').value;
 if(!email||password.length<6){msg('Ingresa un correo válido y una contraseña de al menos 6 caracteres.','warn');return}
 const btn=$('authBtn');btn.disabled=true;btn.textContent='Procesando…';
 let res;
 if(mode==='signup') res=await db.auth.signUp({email,password,options:{emailRedirectTo:location.href}});
 else res=await db.auth.signInWithPassword({email,password});
 btn.disabled=false;btn.textContent='Entrar';
 if(res.error){msg(res.error.message,'danger');return}
 if(mode==='signup'&&!res.data.session){msg('Cuenta creada. Revisa tu correo para confirmar y luego vuelve a entrar.','good');return}
 S.user=res.data.user;await enterApp();
}
async function resetPassword(){
 hideMsg();const email=$('email').value.trim();
 if(!email){msg('Escribe primero el correo de tu cuenta.','warn');$('email').focus();return}
 const btn=$('forgotBtn');btn.disabled=true;btn.textContent='Enviando…';
 const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:location.href});
 btn.disabled=false;btn.textContent='¿Olvidaste tu contraseña?';
 if(error){msg('No pudimos enviar el enlace: '+error.message,'danger');return}
 msg('Te enviamos un enlace al correo para crear una nueva contraseña. Revisa también spam o correo no deseado.','good');
}
async function finishRecovery(){
 const first=window.prompt('Crea una nueva contraseña para SPM (mínimo 6 caracteres):');
 if(first===null)return;
 if(first.length<6){msg('La nueva contraseña debe tener al menos 6 caracteres.','warn');return}
 const second=window.prompt('Confirma la nueva contraseña:');
 if(first!==second){msg('Las contraseñas no coinciden. Vuelve a abrir el enlace de recuperación.','warn');return}
 const {error}=await db.auth.updateUser({password:first});
 if(error){msg('No pudimos cambiar la contraseña: '+error.message,'danger');return}
 msg('Contraseña actualizada correctamente. Ya puedes continuar con SPM.','good');
}
async function enterApp(){
 show('appScreen'); $('who').textContent=S.user.email||'Usuario'; await ensureProfile(); await restore(); renderMotives();
}
async function ensureProfile(){await db.from('profiles').upsert({id:S.user.id,alias:(S.user.email||'usuario').split('@')[0],locale:'es'},{onConflict:'id'})}
async function restore(){
 const {data:plans}=await db.from('plans').select('*').eq('user_id',S.user.id).eq('status','active').order('created_at',{ascending:false}).limit(1);
 if(!plans?.length){resetForAssessment();return}
 const p=plans[0];S.planId=p.id;S.assessmentId=p.assessment_id;S.mapId=p.performance_map_id;
 const [{data:a},{data:m},{data:c},{data:d}]=await Promise.all([
   db.from('assessments').select('*').eq('id',S.assessmentId).maybeSingle(),
   db.from('performance_maps').select('*').eq('id',S.mapId).maybeSingle(),
   db.from('activity_completions').select('*').eq('plan_id',S.planId),
   db.from('daily_checkins').select('*').eq('plan_id',S.planId).order('day_number')
 ]);
 if(a){S.motives=a.motives||[];S.answers=a.answers||{}}
 if(m){S.map={scores:m.domain_scores||{},primary:m.primary_domain,secondary:m.secondary_domain,total:m.spm_score||0,urgent:m.safety_level==='urgent'?(m.safety_flags||[]):[],review:m.safety_level==='review'?(m.safety_flags||[]):[]}}
 S.completed=new Set((c||[]).map(x=>x.day_number));S.checkins=d||[];
 ['navMap','navPlan','navCoach','navProgress'].forEach(id=>$(id).disabled=false);
 nav('map');renderMap();renderPlan();populateCoach();renderProgress();msg('Tu progreso anterior se cargó correctamente.','good');
}
function resetForAssessment(){S.motives=[];S.answers={};S.queue=[];S.qi=0;S.map=null;S.assessmentId=S.mapId=S.planId=null;S.completed=new Set();S.checkins=[];nav('intake');$('ageCard').hidden=false;$('motiveCard').hidden=true;$('quizCard').hidden=true;}
function renderMotives(){const g=$('motiveGrid');g.innerHTML='';motiveDefs.forEach(([id,t])=>{const b=document.createElement('button');b.className='choice'+(S.motives.includes(id)?' sel':'');b.innerHTML=`<b>${t}</b>`;b.onclick=()=>{S.motives.includes(id)?S.motives=S.motives.filter(x=>x!==id):S.motives.push(id);renderMotives()};g.appendChild(b)})}
function buildQueue(){const sec=new Set(['goal','lifestyle','health','pelvic_floor','safety']);S.motives.forEach(m=>{if(m!=='optimization')sec.add(m)});if(S.motives.includes('optimization'))['confidence','wellbeing','desire'].forEach(x=>sec.add(x));S.queue=E.assessment.questions.filter(q=>sec.has(q.section))}
function shouldShow(q){if(!q?.show_if)return true;return S.answers[q.show_if.id]===q.show_if.equals}
function nextVisibleIndex(from){for(let i=from+1;i<S.queue.length;i++)if(shouldShow(S.queue[i]))return i;return S.queue.length}
function prevVisibleIndex(from){for(let i=from-1;i>=0;i--)if(shouldShow(S.queue[i]))return i;return -1}
function visibleQueue(){return S.queue.filter(shouldShow)}
function clearHiddenAnswers(){S.queue.forEach(q=>{if(q.show_if&&!shouldShow(q))delete S.answers[q.id]})}
function scaleOptions(){return [1,2,3,4,5].map(v=>({value:v,label:['Muy bajo / nunca','Bajo / rara vez','Intermedio','Bueno / frecuente','Muy bueno / casi siempre'][v-1]}))}
function renderQ(){
 if(S.qi>=S.queue.length)return finishAssessment();
 let q=S.queue[S.qi];if(!shouldShow(q)){S.qi=nextVisibleIndex(S.qi-1);return renderQ()}
 const visible=visibleQueue(),pos=Math.max(0,visible.findIndex(x=>x.id===q.id));
 $('qCount').textContent=`${pos+1} / ${visible.length}`;$('prog').style.width=`${((pos+1)/visible.length)*100}%`;$('qSection').textContent=q.section.replace('_',' ');
 const box=$('qbox');box.innerHTML=`<h3 class="qtitle">${q.prompt_es}</h3>`;
 if(q.type==='text'){
   const input=document.createElement('textarea');input.className='assessmentText';input.rows=3;input.placeholder=q.placeholder_es||'Escribe tu respuesta';input.value=S.answers[q.id]||'';
   input.oninput=()=>{S.answers[q.id]=input.value};box.appendChild(input);setTimeout(()=>input.focus(),50);
 }else{
   let opts=[];if(q.type==='scale5'||q.type==='scale5_reverse')opts=scaleOptions();else if(q.type==='boolean')opts=[{value:false,label:'No'},{value:true,label:'Sí'}];else opts=(q.options||[]).map(o=>({value:o.value,label:o.es}));
   const w=document.createElement('div');w.className='opts '+((q.type||'').startsWith('scale')?'scale':q.type==='boolean'?'binary':'single');
   opts.forEach(o=>{const b=document.createElement('button');b.className='opt'+(String(S.answers[q.id])===String(o.value)?' sel':'');b.innerHTML=`<span>${o.label}</span>`;b.onclick=()=>{S.answers[q.id]=o.value;clearHiddenAnswers();renderQ()};w.appendChild(b)});box.appendChild(w);
 }
 $('qBack').disabled=prevVisibleIndex(S.qi)<0;
}
function scoreMap(){
 const domains={};S.queue.forEach(q=>{if(!q.domain||S.answers[q.id]===undefined)return;let v=Number(S.answers[q.id]);if(!Number.isFinite(v))return;if(q.type==='scale5_reverse')v=6-v;const s=(v-1)*25,w=q.weight||1;(domains[q.domain]??={sum:0,w:0});domains[q.domain].sum+=s*w;domains[q.domain].w+=w});
 const scores={};Object.entries(domains).forEach(([k,v])=>scores[k]=Math.round(v.sum/v.w));
 const core=['erection','ejaculation','desire','confidence','wellbeing','lifestyle'].filter(k=>scores[k]!=null);const ranked=[...core].sort((a,b)=>scores[a]-scores[b]);let primary=ranked[0]||'lifestyle',secondary=ranked[1]||null;if(S.motives.includes('optimization')&&scores[primary]>65)primary='lifestyle';
 const urgent=S.queue.filter(q=>q.safety==='urgent'&&S.answers[q.id]===true).map(q=>q.id),review=S.queue.filter(q=>q.safety==='review'&&S.answers[q.id]===true).map(q=>q.id);
 const total=Math.round(core.reduce((a,k)=>a+scores[k],0)/(core.length||1));return{scores,primary,secondary,urgent,review,total};
}
async function finishAssessment(){
 S.map=scoreMap();msg('Guardando tu evaluación y creando el plan…','good');
 const now=new Date().toISOString();
 const {data:a,error:ae}=await db.from('assessments').insert({user_id:S.user.id,status:'completed',motives:S.motives,answers:S.answers,completed_at:now}).select().single();
 if(ae){msg('No pudimos guardar la evaluación: '+ae.message,'danger');return}S.assessmentId=a.id;
 const safety=S.map.urgent.length?'urgent':S.map.review.length?'review':'none', flags=[...S.map.urgent,...S.map.review];
 const explanation=`Prioridad educativa: ${label(S.map.primary)}${S.map.secondary?`; secundaria: ${label(S.map.secondary)}`:''}.`;
 const {data:m,error:me}=await db.from('performance_maps').insert({user_id:S.user.id,assessment_id:S.assessmentId,spm_score:S.map.total,primary_domain:S.map.primary,secondary_domain:S.map.secondary,domain_scores:S.map.scores,safety_level:safety,safety_flags:flags,explanation}).select().single();
 if(me){msg('La evaluación se guardó, pero el mapa no: '+me.message,'danger');return}S.mapId=m.id;
 const snapshot={version:'SPM-V1-live',primary:S.map.primary,secondary:S.map.secondary,created_at:now};
 const {data:p,error:pe}=await db.from('plans').insert({user_id:S.user.id,assessment_id:S.assessmentId,performance_map_id:S.mapId,route_key:S.map.primary,cycle_days:28,current_day:1,status:'active',plan_snapshot:snapshot}).select().single();
 if(pe){msg('El mapa se guardó, pero el plan no: '+pe.message,'danger');return}S.planId=p.id;
 ['navMap','navPlan','navCoach','navProgress'].forEach(id=>$(id).disabled=false);nav('map');renderMap();renderPlan();populateCoach();renderProgress();msg('Tu evaluación, mapa y programa de 28 días quedaron guardados.','good');
}
function renderMap(){
 if(!S.map)return;const m=S.map;$('scoreValue').textContent=m.total;$('scoreRing').style.setProperty('--pct',m.total);$('profileTitle').textContent=label(m.primary);
 $('profileExplain').textContent=`Tu prioridad educativa principal aparece en ${label(m.primary).toLowerCase()}${m.secondary?`, con un componente secundario en ${label(m.secondary).toLowerCase()}`:''}. El mapa guía el entrenamiento; no es un diagnóstico.`;
 $('safetyBox').innerHTML=m.urgent.length?'<div class="notice danger"><b>Prioridad de seguridad.</b> Tus respuestas incluyen una señal que requiere atención médica urgente antes de continuar.</div>':m.review.length?'<div class="notice warn"><b>Revisión profesional recomendada.</b> Hay datos que conviene revisar externamente mientras usas solo módulos seguros.</div>':'<div class="notice good"><b>Sin banderas mayores detectadas en este tamizaje.</b> Esto no sustituye una valoración médica.</div>';
 const g=$('domainGrid');g.innerHTML='';Object.entries(m.scores).filter(([k])=>['erection','ejaculation','desire','confidence','wellbeing','lifestyle'].includes(k)).forEach(([k,v])=>{g.insertAdjacentHTML('beforeend',`<div class="domain"><div class="domainHead"><b>${label(k)}</b><span>${v}/100</span></div><div class="bar"><i style="width:${v}%"></i></div></div>`)});
 $('whyList').innerHTML=`<div class="mini"><small>Driver principal</small><p>${label(m.primary)} es el dominio con mayor margen de trabajo.</p></div>${m.secondary?`<div class="mini"><small>Secundario</small><p>${label(m.secondary)} puede modificar la respuesta del driver principal.</p></div>`:''}`;
}
function renderPlan(){
 if(!S.map||!M.days)return;const tabs=$('phaseTabs');tabs.innerHTML='';(M.phases||[]).forEach(ph=>{const b=document.createElement('button');b.className='phaseBtn'+(S.phase===ph.id?' on':'');b.textContent=`${ph.id}. ${ph.name_es}`;b.onclick=()=>{S.phase=ph.id;renderPlan()};tabs.appendChild(b)});
 const ph=(M.phases||[]).find(x=>x.id===S.phase)||{days:[1,2,3,4,5,6,7],name_es:'Fase 1',intro_es:'Construye una línea de base segura.'};$('weekIntro').innerHTML=`<b>${ph.name_es}</b> · ${ph.intro_es}`;
 const g=$('dayGrid');g.innerHTML='';M.days.filter(x=>ph.days.includes(x.d)).forEach(day=>{const c=document.createElement('div');c.className='dayCard';const done=S.completed.has(day.d);
 c.innerHTML=`<div class="dayTop"><div class="dayNum">${day.d}</div><div><h4>${day.title_es}</h4><p>${(day.learn_es||'').slice(0,105)}…</p></div><span class="tag">${done?'Completado ✓':label(S.map.primary)}</span></div><div class="dayBody"><div class="lessonFlow"><div class="lesson"><b>Aprender</b><p>${day.learn_es||''}</p></div><div class="lesson"><b>Practicar</b><p>${day.practice_es||'Practica la habilidad principal del día sin convertirla en una prueba de desempeño.'}</p></div><div class="lesson"><b>Medir</b><p>${day.measure_es||'Registra tu experiencia de 0 a 10.'}</p></div><div class="lesson"><b>Aplicar</b><p>${day.apply_es||'Aplica la habilidad en un contexto seguro y sin presión.'}</p></div><div class="lesson"><b>Completar</b><p>${day.complete_es||'Marca la práctica al finalizar.'}</p></div></div><div class="interactive"><button class="btn pri doneBtn">${done?'Completado ✓':'Marcar práctica como completada'}</button></div></div>`;
 c.querySelector('.dayTop').onclick=()=>c.classList.toggle('open');c.querySelector('.doneBtn').onclick=()=>completeDay(day.d,c);g.appendChild(c)});
}
async function completeDay(day,card){
 if(!S.planId)return;const exists=S.completed.has(day);if(!exists){const {error}=await db.from('activity_completions').insert({user_id:S.user.id,plan_id:S.planId,day_number:day,module_key:'daily_practice',metadata:{source:'premium-v2-live'}});if(error){msg(error.message,'danger');return}S.completed.add(day)}
 card.querySelector('.doneBtn').textContent='Completado ✓';card.querySelector('.tag').textContent='Completado ✓';
 const next=Math.min(28,Math.max(...S.completed,1)+1);await db.from('plans').update({current_day:next}).eq('id',S.planId);renderProgress();msg(`Día ${day} guardado correctamente.`,'good');
}
function populateCoach(){const s=$('coachDay');s.innerHTML='';for(let i=1;i<=28;i++)s.insertAdjacentHTML('beforeend',`<option value="${i}">Día ${i}</option>`);if(S.completed.size)s.value=String(Math.min(28,Math.max(...S.completed)))}
function coachDecision(v){if(v.flag)return{code:'clinical_review',text:'Pausa el entrenamiento de intensidad y busca revisión profesional externa por la nueva señal de seguridad.'};if(!v.completed||v.outcome<=3||v.stress>=8)return{code:'repeat_reduce',text:'Repite la habilidad de hoy con menor intensidad. El objetivo es consolidar, no forzar progresión.'};if(v.outcome>=7&&v.confidence>=6)return{code:'progress',text:'Buen patrón de respuesta. Puedes avanzar al siguiente día manteniendo la misma calidad de ejecución.'};return{code:'maintain',text:'Mantén la práctica actual un día más y observa consistencia antes de progresar.'}}
async function saveCoach(){
 if(!S.planId)return;const v={day:+$('coachDay').value,sleep:+$('sleep').value,stress:+$('stress').value,confidence:+$('confidence').value,desire:+$('desire').value,outcome:+$('outcome').value,sexual:$('sexualActivity').value==='1',completed:$('completed').value==='1',flag:$('newFlag').value==='1',note:$('note').value.trim()};const d=coachDecision(v);
 const {data,error}=await db.from('daily_checkins').insert({user_id:S.user.id,plan_id:S.planId,day_number:v.day,sleep:v.sleep,stress:v.stress,confidence:v.confidence,desire:v.desire,outcome:v.outcome,sexual_activity:v.sexual,practice_completed:v.completed,new_safety_flag:v.flag,note:v.note,coach_decision:d.text,decision_code:d.code}).select().single();
 if(error){msg(error.message,'danger');return}S.checkins.push(data);$('coachDecision').innerHTML=`<div class="notice ${d.code==='clinical_review'?'danger':'good'}"><b>Decisión del Daily Coach:</b> ${d.text}</div>`;renderProgress();await maybeWeeklyReview(v.day);msg('Check-in guardado. Tu progreso ya está persistido.','good');
}
async function maybeWeeklyReview(day){
 if(day%7!==0)return;const week=Math.ceil(day/7), rows=S.checkins.filter(x=>Math.ceil(x.day_number/7)===week);if(!rows.length)return;
 const adh=Math.round(rows.filter(x=>x.practice_completed).length/7*100),avg=k=>Math.round(rows.reduce((a,x)=>a+(Number(x[k])||0),0)/rows.length*10)/10;
 const payload={user_id:S.user.id,plan_id:S.planId,week_number:week,adherence_pct:adh,confidence_avg:avg('confidence'),outcome_avg:avg('outcome'),summary:{checkins:rows.length},next_action:adh<60?'repetir y simplificar':'progresar según respuesta'};
 await db.from('weekly_reviews').upsert(payload,{onConflict:'plan_id,week_number'});
}
function renderProgress(){
 const n=S.checkins.length,adh=S.completed.size?Math.round(S.completed.size/28*100):0,avg=k=>n?(S.checkins.reduce((a,x)=>a+(Number(x[k])||0),0)/n).toFixed(1):'—';
 $('stChecks').textContent=n;$('stAdh').textContent=adh+'%';$('stConf').textContent=avg('confidence');$('stOutcome').textContent=avg('outcome');$('stDecision').textContent=n?(S.checkins[n-1].decision_code||'—'):'—';
 const chart=$('chart');chart.innerHTML='';S.checkins.slice(-14).forEach(x=>{const c=document.createElement('div');c.className='col';c.style.height=`${Math.max(8,(Number(x.confidence)||0)*10)}%`;c.dataset.v=`D${x.day_number}: ${x.confidence}`;chart.appendChild(c)});
 $('savedState').textContent=S.planId?'Guardado en la nube ✓':'Aún sin plan';
}
async function signOut(){await db.auth.signOut();S.user=null;show('authScreen');resetForAssessment();}
document.addEventListener('DOMContentLoaded',()=>{
 $('authBtn').onclick=()=>sign('signin');$('signupBtn').onclick=()=>sign('signup');if($('forgotBtn'))$('forgotBtn').onclick=resetPassword;$('logoutBtn').onclick=signOut;
 document.querySelectorAll('[data-age]').forEach(b=>b.onclick=()=>{if(b.dataset.age==='1'){$('ageCard').hidden=true;$('motiveCard').hidden=false}else msg('SPM está diseñado para mayores de 18 años.','warn')});
 $('motiveNext').onclick=()=>{if(!S.motives.length){msg('Selecciona al menos un motivo.','warn');return}buildQueue();S.qi=0;$('motiveCard').hidden=true;$('quizCard').hidden=false;renderQ()};
 $('qBack').onclick=()=>{const prev=prevVisibleIndex(S.qi);if(prev>=0){S.qi=prev;renderQ()}};
 $('qNext').onclick=()=>{const q=S.queue[S.qi],value=S.answers[q.id];if(value===undefined||value===null||(q.type==='text'&&!String(value).trim())){msg(q.type==='text'?'Escribe una respuesta para continuar.':'Selecciona una respuesta.','warn');return}hideMsg();clearHiddenAnswers();S.qi=nextVisibleIndex(S.qi);renderQ()};
 document.querySelectorAll('.navbtn').forEach(b=>b.onclick=()=>!b.disabled&&b.dataset.panel&&nav(b.dataset.panel));$('goPlan').onclick=()=>nav('plan');$('coachSave').onclick=saveCoach;$('newAssessment').onclick=()=>{resetForAssessment();hideMsg()};boot();
});
})();