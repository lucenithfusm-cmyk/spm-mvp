(()=>{
const SB_URL='https://jogirmziqjlsttbbarcx.supabase.co';
const SB_KEY='sb_publishable_jXmxa5K6ThK9C8DPIxmVVQ_mbuLWVaf';
const db=window.supabase.createClient(SB_URL,SB_KEY);
const E=window.ENGINE||{assessment:{questions:[]}}, M=window.SPM_MODULES||{phases:[],days:[],profiles:{}};
const $=id=>document.getElementById(id);
const S={user:null,motives:[],queue:[],answers:{},qi:0,map:null,phase:1,assessmentId:null,mapId:null,planId:null,completed:new Set(),checkins:[]};
window.SPM_RESTORE_AUTHORITY_V3=true;
const restoreState={running:false,complete:false,hasPlan:false};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function restoreOverlay(show=true,text='Restaurando tu programa SPM…'){
 let el=$('spmRestoreOverlay');
 // Removing the overlay avoids author display:grid overriding the hidden attribute.
 if(!show){el?.remove();return;}
 if(show&&!el){
  el=document.createElement('div');el.id='spmRestoreOverlay';el.setAttribute('aria-live','polite');
  el.innerHTML='<div class="spmRestoreCard"><div class="spmRestoreSpinner" aria-hidden="true"></div><b></b><p>Estamos recuperando tu evaluación, Performance Map y avance guardado.</p></div>';
  const st=document.createElement('style');st.id='spmRestoreOverlayCSS';st.textContent='#spmRestoreOverlay{position:fixed;inset:0;z-index:65000;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 35%,rgba(117,223,196,.12),transparent 34%),#041015;color:#eef8f6}.spmRestoreCard{width:min(430px,92vw);padding:25px;border:1px solid #31545c;border-radius:22px;background:linear-gradient(145deg,#0a2530,#07161c);text-align:center;box-shadow:0 28px 80px #0008}.spmRestoreSpinner{width:58px;height:58px;margin:0 auto 14px;border-radius:50%;border:3px solid #31515a;border-top-color:#78dfc5;animation:spmRestoreSpin .9s linear infinite}.spmRestoreCard b{display:block;font-size:20px}.spmRestoreCard p{margin:8px 0 0;color:#a9bec0;line-height:1.5}@keyframes spmRestoreSpin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spmRestoreSpinner{animation:none}}';
  if(!$('spmRestoreOverlayCSS'))document.head.appendChild(st);document.body.appendChild(el);
 }
 if(el){const b=el.querySelector('b');if(b)b.textContent=text;el.hidden=!show;}
}
async function withRetry(task,attempts=3){
 let lastError=null;
 for(let i=0;i<attempts;i++){
  const result=await task();
  if(!result?.error)return result;
  lastError=result.error;
  if(i<attempts-1)await wait(300*(i+1));
 }
 throw lastError||new Error('No fue posible recuperar los datos guardados.');
}
// Shared resource integration surface. Resource records never modify scores or daily completion.
window.SPM_RESOURCE_CONTEXT=()=>{
 if(!S.user)return null;
 const r=window.SPM_RESTORED_CONTEXT;
 if(r?.uid===S.user.id&&r.plan?.id)return {userId:r.uid,planId:r.plan.id,day:Number(r.plan.current_day)||1,answers:r.assessment?.answers||{},motives:r.assessment?.motives||[],primary:r.map?.primary_domain,secondary:r.map?.secondary_domain,safety:r.map?.safety_level||'none',flags:r.map?.safety_flags||[],completed:[...(r.done||[])],checkins:r.checkins||[]};
 if(!S.planId||!S.map)return null;
 return {userId:S.user.id,planId:S.planId,day:Math.min(28,Math.max(0,...S.completed)+1),answers:{...S.answers},motives:[...S.motives],primary:S.map.primary,secondary:S.map.secondary,safety:S.map.urgent.length?'urgent':S.map.review.length?'review':'none',flags:[...S.map.urgent,...S.map.review],completed:[...S.completed],checkins:[...S.checkins]};
};
window.SPM_RESOURCE_RECORDS={
 async read(){const ctx=window.SPM_RESOURCE_CONTEXT();if(!ctx)return [];const {data,error}=await db.from('activity_completions').select('id,day_number,metadata,completed_at').eq('user_id',ctx.userId).eq('plan_id',ctx.planId).like('module_key','resource:%').order('completed_at');if(error)throw error;return (data||[]).map(x=>({...x.metadata,day:x.day_number,at:x.completed_at,id:x.id}));},
 async save(record,expectedScope){const ctx=window.SPM_RESOURCE_CONTEXT();if(!ctx)throw new Error('No active program');if(expectedScope&&expectedScope!==ctx.userId+':'+ctx.planId)throw new Error('Program changed');if(!['response','confidence','movement','recovery','learning'].includes(record.kind)||!Number.isInteger(record.day)||record.day<1||record.day>28)throw new Error('Invalid record');const {error}=await db.from('activity_completions').insert({id:record.id,user_id:ctx.userId,plan_id:ctx.planId,day_number:record.day,module_key:'resource:'+record.kind+':'+record.id,metadata:record,completed_at:record.at});if(error)throw error;}
};
// The educational Lab saves its own state. It never completes a calendar day.
window.SPM_PELVIC_RECORDS={
 async read(expectedScope){
  const c=window.SPM_RESOURCE_CONTEXT();
  if(!c||expectedScope!==c.userId+':'+c.planId)throw new Error('Program changed');
  const {data,error}=await db.from('activity_completions').select('metadata,completed_at').eq('user_id',c.userId).eq('plan_id',c.planId).eq('module_key','resource:pelvic_lab_state').order('completed_at',{ascending:false});
  if(error)throw error;
  return data?.[0]?.metadata?.state||{};
 },
 async save(state,expectedScope,day){
  const c=window.SPM_RESOURCE_CONTEXT();
  if(!c||expectedScope!==c.userId+':'+c.planId)throw new Error('Program changed');
  if(!Number.isInteger(day)||day<1||day>28||!window.SPM_PELVIC_LAB?.validState(state))throw new Error('Invalid pelvic record');
  const {error}=await db.from('activity_completions').upsert({user_id:c.userId,plan_id:c.planId,day_number:day,module_key:'resource:pelvic_lab_state',metadata:{source:'pelvic-floor-lab-v1',state},completed_at:new Date().toISOString()},{onConflict:'plan_id,day_number,module_key'});
  if(error)throw error;
  return {ok:true};
 }
};
// Desire uses the same authenticated, RLS-protected resource persistence.
window.SPM_DESIRE_RECORDS={
 async read(expectedScope){
  const c=window.SPM_RESOURCE_CONTEXT();
  if(!c||expectedScope!==c.userId+':'+c.planId)throw new Error('Program changed');
  const {data,error}=await db.from('activity_completions').select('metadata,completed_at').eq('user_id',c.userId).eq('plan_id',c.planId).eq('module_key','resource:desire_lab_state').order('completed_at',{ascending:false});
  if(error)throw error;
  return data?.[0]?.metadata?.state||{};
 },
 async save(state,expectedScope,day){
  const c=window.SPM_RESOURCE_CONTEXT();
  if(!c||expectedScope!==c.userId+':'+c.planId)throw new Error('Program changed');
  if(!Number.isInteger(day)||day<1||day>28||!window.SPM_DESIRE_LAB?.validState(state))throw new Error('Invalid desire record');
  const {error}=await db.from('activity_completions').upsert({user_id:c.userId,plan_id:c.planId,day_number:day,module_key:'resource:desire_lab_state',metadata:{source:'desire-lab-v1',state},completed_at:new Date().toISOString()},{onConflict:'plan_id,day_number,module_key'});
  if(error)throw error;
  return {ok:true};
 }
};
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
   window.dispatchEvent(new CustomEvent('spm:session-change',{detail:{userId:session?.user?.id||null}}));
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
 show('appScreen');$('who').textContent=S.user.email||'Usuario';renderMotives();restoreOverlay(true);
 try{
  const restored=await restore();
  // Existing programs can render without waiting for a secondary profile write.
  if(restored)ensureProfile().catch(error=>console.warn('SPM profile sync delayed',error));
  else if(!restoreState.hasPlan){await ensureProfile();renderMotives();}
 }catch(error){
  console.error('SPM authoritative restore',error);
  msg('No pudimos terminar de restaurar tu programa. Tus datos siguen guardados; vuelve a intentar en unos segundos.','warn');
 }finally{restoreOverlay(false);}
}
async function ensureProfile(){
 const {error}=await db.from('profiles').upsert({id:S.user.id,alias:(S.user.email||'usuario').split('@')[0],locale:'es'},{onConflict:'id'});
 if(error)console.warn('SPM profile sync',error);
}
async function restore(){
 if(restoreState.running)return restoreState.hasPlan;
 restoreState.running=true;
 try{
  const {data:plans}=await withRetry(()=>db.from('plans').select('*').eq('user_id',S.user.id).order('created_at',{ascending:false}));
  if(!plans?.length){restoreState.complete=true;restoreState.hasPlan=false;resetForAssessment(true);return false}
  const ranked=[...plans].sort((a,b)=>{
   const active=(b.status==='active')-(a.status==='active');
   if(active)return active;
   const day=(Number(b.current_day)||1)-(Number(a.current_day)||1);
   if(day)return day;
   return new Date(b.created_at)-new Date(a.created_at);
  });
  let p=null,a=null,m=null;
  for(const candidate of ranked){
   if(!candidate.assessment_id||!candidate.performance_map_id)continue;
   const [ar,mr]=await Promise.all([
    withRetry(()=>db.from('assessments').select('*').eq('id',candidate.assessment_id).eq('user_id',S.user.id).maybeSingle()),
    withRetry(()=>db.from('performance_maps').select('*').eq('id',candidate.performance_map_id).eq('user_id',S.user.id).maybeSingle())
   ]);
   if(ar.data&&mr.data){p=candidate;a=ar.data;m=mr.data;break}
  }
  if(!p)throw new Error('Se encontró tu cuenta, pero no un conjunto completo de evaluación, Performance Map y plan.');
  S.planId=p.id;S.assessmentId=p.assessment_id;S.mapId=p.performance_map_id;
  S.motives=a.motives||[];S.answers=a.answers||{};
  S.map={scores:m.domain_scores||{},primary:m.primary_domain,secondary:m.secondary_domain,total:m.spm_score||0,urgent:m.safety_level==='urgent'?(m.safety_flags||[]):[],review:m.safety_level==='review'?(m.safety_flags||[]):[]};
  S.completed=new Set();S.checkins=[];
  restoreState.complete=true;restoreState.hasPlan=true;
  window.SPM_RESTORE_COMPLETE=true;
  window.SPM_RESTORED_CONTEXT={db,uid:S.user.id,session:null,plan:p,assessment:a,map:m,done:S.completed,checkins:S.checkins};
  ['ageCard','motiveCard','quizCard'].forEach(id=>{if($(id))$(id).hidden=true});
  ['navMap','navPlan','navCoach','navProgress'].forEach(id=>{if($(id))$(id).disabled=false});
  S.phase=Math.max(1,Math.min(4,Math.ceil((Number(p.current_day)||1)/7)));
  nav('map');renderMap();renderPlan();populateCoach();renderProgress();msg(`Tu Performance Map fue restaurado. Tu programa continúa en el día ${Number(p.current_day)||1}.`,'good');
  hydrateProgressInBackground(p).catch(error=>console.warn('SPM progress hydration',error));
  return true;
 }finally{restoreState.running=false;}
}
async function hydrateProgressInBackground(plan){
 const timeout=(promise,ms)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),ms))]);
 try{
  const cr=await timeout(db.from('activity_completions').select('*').eq('user_id',S.user.id).eq('plan_id',S.planId),5000);
  if(!cr.error)S.completed=new Set((cr.data||[]).filter(x=>!x.module_key?.startsWith('resource:')).map(x=>x.day_number));
 }catch(error){console.warn('SPM activity hydration delayed',error)}
 try{
  const dr=await timeout(db.from('daily_checkins').select('*').eq('user_id',S.user.id).eq('plan_id',S.planId).order('day_number'),5000);
  if(!dr.error)S.checkins=dr.data||[];
 }catch(error){console.warn('SPM check-in hydration delayed',error)}
 if(window.SPM_RESTORED_CONTEXT?.plan?.id===plan.id){
  window.SPM_RESTORED_CONTEXT.done=S.completed;
  window.SPM_RESTORED_CONTEXT.checkins=S.checkins;
 }
 renderPlan();populateCoach();renderProgress();
 window.dispatchEvent(new CustomEvent('spm:resourcecontext'));
}
function resetForAssessment(force=false){
 if(!force&&(restoreState.running||restoreState.hasPlan||window.SPM_RESTORED_CONTEXT?.plan?.id))return;
 S.motives=[];S.answers={};S.queue=[];S.qi=0;S.map=null;S.assessmentId=S.mapId=S.planId=null;S.completed=new Set();S.checkins=[];nav('intake');$('ageCard').hidden=false;$('motiveCard').hidden=true;$('quizCard').hidden=true;
}
function renderMotives(){
 const g=$('motiveGrid');if(!g)return;const fragment=document.createDocumentFragment();
 motiveDefs.forEach(([id,t])=>{const b=document.createElement('button');b.type='button';b.className='choice'+(S.motives.includes(id)?' sel':'');b.dataset.motive=id;b.setAttribute('aria-pressed',String(S.motives.includes(id)));b.innerHTML=`<b>${t}</b>`;fragment.appendChild(b)});
 g.replaceChildren(fragment);
}
function selectMotive(id){if(!motiveDefs.some(([key])=>key===id))return;S.motives.includes(id)?S.motives=S.motives.filter(x=>x!==id):S.motives.push(id);renderMotives()}
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
window.SPM_SAVE_MODULE=async function({day,moduleKey,metricValue=null,metadata={}}){
 if(!S.planId||!S.user)throw new Error('No hay un plan activo para guardar esta práctica.');
 const payload={user_id:S.user.id,plan_id:S.planId,day_number:day,module_key:moduleKey,metric_value:metricValue,metadata:{...metadata,source:'premium-v2-live'},completed_at:new Date().toISOString()};
 const {error}=await db.from('activity_completions').upsert(payload,{onConflict:'plan_id,day_number,module_key'});
 if(error)throw error;
 S.completed.add(day);
 const card=[...document.querySelectorAll('.dayCard')].find(x=>Number(x.querySelector('.dayNum')?.textContent||0)===day);
 if(card){const done=card.querySelector('.doneBtn'),tag=card.querySelector('.tag');if(done)done.textContent='Completado ✓';if(tag)tag.textContent='Completado ✓'}
 const next=Math.min(28,Math.max(...S.completed,1)+1);
 await db.from('plans').update({current_day:next}).eq('id',S.planId);
 renderProgress();msg(`Práctica del día ${day} guardada correctamente.`,'good');
 return{ok:true};
};
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
async function signOut(){await db.auth.signOut();S.user=null;restoreState.running=false;restoreState.complete=false;restoreState.hasPlan=false;window.SPM_RESTORE_COMPLETE=false;window.SPM_RESTORED_CONTEXT=null;show('authScreen');resetForAssessment(true);}
document.addEventListener('DOMContentLoaded',()=>{
 $('authBtn').onclick=()=>sign('signin');$('signupBtn').onclick=()=>sign('signup');if($('forgotBtn'))$('forgotBtn').onclick=resetPassword;$('logoutBtn').onclick=signOut;
 const motiveGrid=$('motiveGrid');motiveGrid.addEventListener('click',event=>{const button=event.target.closest('button[data-motive]');if(button&&motiveGrid.contains(button))selectMotive(button.dataset.motive)});
 document.querySelectorAll('[data-age]').forEach(b=>b.onclick=()=>{if(b.dataset.age==='1'){renderMotives();$('ageCard').hidden=true;$('motiveCard').hidden=false}else msg('SPM está diseñado para mayores de 18 años.','warn')});
 $('motiveNext').onclick=()=>{if(!S.motives.length){msg('Selecciona al menos un motivo.','warn');return}buildQueue();S.qi=0;$('motiveCard').hidden=true;$('quizCard').hidden=false;renderQ()};
 $('qBack').onclick=()=>{const prev=prevVisibleIndex(S.qi);if(prev>=0){S.qi=prev;renderQ()}};
 $('qNext').onclick=()=>{const q=S.queue[S.qi],value=S.answers[q.id];if(value===undefined||value===null||(q.type==='text'&&!String(value).trim())){msg(q.type==='text'?'Escribe una respuesta para continuar.':'Selecciona una respuesta.','warn');return}hideMsg();clearHiddenAnswers();S.qi=nextVisibleIndex(S.qi);renderQ()};
 document.querySelectorAll('.navbtn').forEach(b=>b.onclick=()=>!b.disabled&&b.dataset.panel&&nav(b.dataset.panel));$('goPlan').onclick=()=>nav('plan');$('coachSave').onclick=saveCoach;$('newAssessment').onclick=()=>{restoreState.hasPlan=false;window.SPM_RESTORED_CONTEXT=null;resetForAssessment(true);hideMsg()};boot();
});
})();
