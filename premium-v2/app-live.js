(()=>{
const SB_URL='https://jogirmziqjlsttbbarcx.supabase.co';
const SB_KEY='sb_publishable_jXmxa5K6ThK9C8DPIxmVVQ_mbuLWVaf';
const PUBLIC_ASSESSMENT=document.documentElement.dataset.spmPublicAssessment==='true';
const db=PUBLIC_ASSESSMENT?null:window.supabase.createClient(SB_URL,SB_KEY);
const E=window.ENGINE||{assessment:{questions:[]}}, M=window.SPM_MODULES||{phases:[],days:[],profiles:{}};
const $=id=>document.getElementById(id);
const MEDICATION_NOTE='SPM complementa tu cuidado de la salud. No reemplaza una valoración médica ni tu tratamiento. Si tienes un medicamento prescrito para la función eréctil u otra condición, participar en el programa no es motivo para suspenderlo ni cambiar su dosis. Cualquier ajuste debe acordarse con el profesional que te lo indique.';
const S={user:null,motives:[],queue:[],answers:{},qi:0,map:null,phase:1,assessmentId:null,mapId:null,planId:null,completed:new Set(),checkins:[],epoch:0,plan:null,closures:[]};
const activityRevisions=new Map(),writeTasks=new Map(),writeFingerprints=new Map(),pendingActivityPayloads=new Map();
function recordIntent(record){
 const value={...record};for(const key of ['completedAt','savedAt','at'])delete value[key];
 const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
 return JSON.stringify(stable(value));
}
const contextKey=c=>c?`${c.userId}:${c.planId}`:'';
function assertScope(expected,day,version,epoch){const c=window.SPM_RESOURCE_CONTEXT?.();if(!c||contextKey(c)!==expected||(day!=null&&Number(c.day)!==Number(day))||(version&&c.scheduleVersion!==version)||(epoch!=null&&S.epoch!==epoch))throw Error('La cuenta o el programa cambió. Vuelve a abrir tu actividad.');return c;}
function persistenceError(error){
 const message=String(error?.message||error||'');
 const labels={SPM_CONTEXT_CONFLICT:'La jornada o el programa cambió. Recupera tu programa antes de continuar.',SPM_ACTIVITY_UNAVAILABLE:'Esta actividad no está disponible en la jornada actual. Revisa su indicación antes de continuar.',SPM_INVALID_ACTIVITY_RECORD:'El registro está incompleto o tiene datos incompatibles. Revisa tus respuestas antes de guardar.',SPM_RECORD_REVISION_CONFLICT:'Este registro cambió en otra pestaña. Vuelve a abrirlo para revisar la versión guardada.',SPM_PLAN_REVISION_CONFLICT:'Tu programa cambió en otra pestaña. Recupera tu día antes de continuar.',SPM_PROGRESS_RECONCILIATION_REQUIRED:'El avance guardado necesita una comprobación antes de continuar. Tus registros se conservan.',SPM_REQUIRED_ACTIVITY_PENDING:'Falta guardar uno o más registros requeridos de hoy.',SPM_VOLUNTARY_CONFIRMATION_REQUIRED:'Confirma que quieres cerrar esta jornada voluntaria.',SPM_ASSESSMENT_PENDING:'Completa las respuestas pendientes de tu evaluación para continuar.',SPM_SAFETY_PAUSE:'Tu programa mantiene una indicación de seguridad. Revisa cómo continuar.',SPM_PLAN_ACCESS_DENIED:'No pudimos confirmar el acceso a este programa. Reingresa con tu cuenta.',SPM_OPERATION_CONFLICT:'El intento de guardado cambió. Reabre el registro para recuperar su estado.'};
 const code=Object.keys(labels).find(k=>message.includes(k));
 const e=new Error(code?labels[code]:'No pudimos confirmar el guardado. Conserva esta pantalla y reintenta; si ya se guardó, recuperaremos el mismo registro.');e.code=code||error?.code||'SPM_SAVE_UNCONFIRMED';return e;
}
async function operationFor(key,payload){
 const bytes=new TextEncoder().encode(JSON.stringify(payload));
 const digest=await crypto.subtle.digest('SHA-256',bytes),fingerprint=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
 let prior;try{prior=JSON.parse(sessionStorage.getItem('spm-operation:'+key)||'null')}catch{}
 if(prior?.fingerprint===fingerprint)return prior.id;
 const id=crypto.randomUUID();try{sessionStorage.setItem('spm-operation:'+key,JSON.stringify({id,fingerprint}))}catch{}return id;
}
function clearOperation(key){try{sessionStorage.removeItem('spm-operation:'+key)}catch{}}
function invalidateSession(){
 S.epoch++;S.plan=null;S.planId=null;S.map=null;S.completed=new Set();S.checkins=[];S.closures=[];
 S.assessmentId=null;S.mapId=null;S.answers={};S.motives=[];S.queue=[];S.qi=0;
 activityRevisions.clear();writeTasks.clear();writeFingerprints.clear();pendingActivityPayloads.clear();window.SPM_RESTORE_COMPLETE=false;window.SPM_RESTORED_CONTEXT=null;
 window.SPM_DEVICE_VOICE?.stop?.();window.SPM_PRACTICE_AUDIO?.stop?.();
 restoreState.running=false;restoreState.complete=false;restoreState.hasPlan=false;
 restoreOverlay(false);
 ['domainGrid','whyList','dayGrid','phaseTabs','weekIntro','chart','coachDecision','spmDailyWorkspace','spmDailySession'].forEach(id=>$(id)?.replaceChildren());
 ['scoreValue','profileTitle','profileExplain','stChecks','stAdh','stConf','stOutcome','stDecision'].forEach(id=>{if($(id))$(id).textContent='—'});
 ['note','sleep','stress','confidence','desire','outcome','sexualActivity','completed','newFlag'].forEach(id=>{if($(id))$(id).value=''});if($('coachSave'))$('coachSave').disabled=false;if($('savedState'))$('savedState').textContent='Sin programa recuperado';
 document.querySelectorAll('dialog[open]').forEach(dialog=>{try{dialog.close()}catch{dialog.removeAttribute('open')}});
 nav('intake');
 window.dispatchEvent(new CustomEvent('spm:resourcecontext'));
}
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
  let timer;const result=await Promise.race([task(),new Promise(resolve=>{timer=setTimeout(()=>resolve({error:new Error('La conexión tardó demasiado.')}),8000)})]).finally(()=>clearTimeout(timer));
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
 if(r?.uid===S.user.id&&r.plan?.id)return {userId:r.uid,planId:r.plan.id,day:Math.min(28,Math.max(1,Number(r.plan.current_day)||1)),scheduleVersion:r.plan.schedule_version||'legacy',planRevision:Number(r.plan.revision)||0,cycleStatus:r.plan.cycle_status||'open',planStatus:r.plan.status,answers:r.assessment?.answers||{},motives:r.assessment?.motives||[],primary:r.map?.primary_domain,secondary:r.map?.secondary_domain,safety:r.map?.safety_level||'none',flags:r.map?.safety_flags||[],completed:[...(r.done||[])],closures:r.closures||[],checkins:r.checkins||[]};
 if(!S.planId||!S.map)return null;
 return {userId:S.user.id,planId:S.planId,day:Number(S.plan?.current_day)||1,scheduleVersion:S.plan?.schedule_version||'legacy',planRevision:Number(S.plan?.revision)||0,cycleStatus:S.plan?.cycle_status||'open',planStatus:S.plan?.status||'active',answers:{...S.answers},motives:[...S.motives],primary:S.map.primary,secondary:S.map.secondary,safety:S.map.urgent.length?'urgent':S.map.review.length?'review':'none',flags:[...S.map.urgent,...S.map.review],completed:[...S.completed],closures:[...S.closures],checkins:[...S.checkins]};
};
// Each daily activity is saved separately; resource rows never advance the 28-day plan.
window.SPM_DAILY_RECORDS={
 async readCheckpoints(expectedScope){
  const epoch=S.epoch;
  const c=window.SPM_RESOURCE_CONTEXT();if(!c||expectedScope!==c.userId+':'+c.planId)throw Error('Program changed');
  const {data,error}=await db.from('activity_completions').select('day_number,metadata').eq('user_id',c.userId).eq('plan_id',c.planId).eq('module_key','resource:daily_activity:program-checkpoint').order('day_number');
  if(error)throw error;assertScope(expectedScope,null,null,epoch);return data||[];
 },
 async read(expectedScope,day){
  const epoch=S.epoch;
  const c=window.SPM_RESOURCE_CONTEXT();
  if(!c||expectedScope!==c.userId+':'+c.planId)throw Error('Program changed');
  const {data,error}=await db.from('activity_completions').select('module_key,metadata,record_revision').eq('user_id',c.userId).eq('plan_id',c.planId).eq('day_number',day).like('module_key','resource:daily_activity:%');
  if(error)throw error;
  assertScope(expectedScope,null,null,epoch);
  for(const key of pendingActivityPayloads.keys())if(key.startsWith(`${expectedScope}:${day}:`)&&!writeTasks.has(key))pendingActivityPayloads.delete(key);
  return Object.fromEntries((data||[]).map(r=>{const id=r.module_key.slice('resource:daily_activity:'.length),revision=Number(r.record_revision)||0;activityRevisions.set(`${expectedScope}:${day}:${id}`,revision);return [id,{...r.metadata,_recordRevision:revision}]}));
 },
 async save(id,metadata,expectedScope,day){
  const epoch=S.epoch;
  const c=window.SPM_RESOURCE_CONTEXT();
  if(!c||expectedScope!==c.userId+':'+c.planId||Number(c.day)!==day)throw Error('Program changed');
  if(!/^[a-z0-9-]{1,60}$/.test(id)||!metadata||JSON.stringify(metadata).length>25000)throw Error('Invalid activity');
  if(c.cycleStatus==='completed'||c.completed?.includes(day))throw Error('Esta jornada ya está cerrada. Puedes consultar tus registros y los recursos de la Biblioteca.');if(window.SPM_DAILY_PRACTICE?.restricted(c,id))throw Error('Practice paused');
  const key=`${expectedScope}:${day}:${id}`,version=c.scheduleVersion||'legacy';
  const a=window.SPM_DAILY_PRACTICE?.assignments(c).find(x=>x.id===id);if(!a)throw Error('Esta actividad no pertenece a tu jornada.');
  const state=metadata.activityStatus||(metadata.completed===false?'interrupted':'completed');
  const clean={...metadata,activityKind:a.kind,activityStatus:state,completed:state==='completed',scheduleVersion:version,...(a.assignmentId?{assignmentId:a.assignmentId,contentId:a.contentId,contentVersion:a.contentVersion,sourceDay:a.sourceDay,scheduledDay:day}:{} )};
  delete clean.operationId;delete clean._recordRevision;
  const intent=recordIntent(clean),pending=pendingActivityPayloads.get(key);
  if(pending&&pending.intent!==intent)throw Error('El guardado anterior aún no está confirmado. Reabre la actividad para recuperar lo guardado antes de cambiar sus respuestas.');
  const args=pending?.args||{p_plan_id:c.planId,p_day:day,p_activity_id:id,p_metadata:clean,p_schedule_version:version,p_expected_record_revision:activityRevisions.get(key)||0};
  const fingerprint=JSON.stringify(args);
  if(writeTasks.has(key)){if(writeFingerprints.get(key)!==fingerprint)throw Error('Hay un guardado en curso. Espera su confirmación antes de guardar otros cambios.');return writeTasks.get(key);}
  pendingActivityPayloads.set(key,{intent,args});
  const task=(async()=>{const op=await operationFor(key,args);assertScope(expectedScope,day,version,epoch);const {data,error}=await db.rpc('spm_save_activity',{...args,p_operation_id:op});if(error)throw persistenceError(error);assertScope(expectedScope,day,version,epoch);if(!data?.ok||!data.metadata||!Number.isInteger(Number(data.recordRevision)))throw persistenceError('Invalid activity response');activityRevisions.set(key,Number(data.recordRevision));pendingActivityPayloads.delete(key);clearOperation(key);return data;})();
  writeTasks.set(key,task);writeFingerprints.set(key,fingerprint);try{return await task;}finally{if(writeTasks.get(key)===task){writeTasks.delete(key);writeFingerprints.delete(key);}}
 }
};
window.SPM_RESOURCE_RECORDS={
 async read(){const ctx=window.SPM_RESOURCE_CONTEXT(),epoch=S.epoch;if(!ctx)return [];const {data,error}=await db.from('activity_completions').select('id,day_number,metadata,completed_at').eq('user_id',ctx.userId).eq('plan_id',ctx.planId).like('module_key','resource:%').order('completed_at');if(error)throw error;assertScope(contextKey(ctx),null,null,epoch);return (data||[]).map(x=>({...x.metadata,day:x.day_number,at:x.completed_at,id:x.id}));},
 async save(record,expectedScope){const ctx=window.SPM_RESOURCE_CONTEXT(),epoch=S.epoch;if(!ctx)throw new Error('No active program');if(expectedScope&&expectedScope!==ctx.userId+':'+ctx.planId)throw new Error('Program changed');if(!['response','confidence','movement','recovery','learning'].includes(record.kind)||!Number.isInteger(record.day)||record.day<1||record.day>28)throw new Error('Invalid record');const {error}=await db.from('activity_completions').insert({id:record.id,user_id:ctx.userId,plan_id:ctx.planId,day_number:record.day,module_key:'resource:'+record.kind+':'+record.id,metadata:record,completed_at:record.at});if(error)throw error;assertScope(contextKey(ctx),null,null,epoch);}
};
window.SPM_EP_RECORDS={
 async read(expectedScope){const c=window.SPM_RESOURCE_CONTEXT(),epoch=S.epoch;if(!c||c.userId+':'+c.planId!==expectedScope)throw Error('Program changed');const {data,error}=await db.from('activity_completions').select('metadata').eq('user_id',c.userId).eq('plan_id',c.planId).eq('module_key','resource:ep_checkpoint');if(error)throw error;assertScope(expectedScope,null,null,epoch);return (data||[]).map(x=>x.metadata);},
 async save(record,expectedScope){const c=window.SPM_RESOURCE_CONTEXT(),epoch=S.epoch;if(!c||c.userId+':'+c.planId!==expectedScope||![1,14,28].includes(record.day)||record.day>Number(c.day))throw Error('Program changed');if(typeof record.ielt_evaluable!=='boolean'||(record.ielt_evaluable&&(!Number.isInteger(record.ielt_seconds)||record.ielt_seconds<=0||record.ielt_seconds>3599))||(record.pedt_score!==null&&(!Number.isInteger(record.pedt_score)||record.pedt_score<0||record.pedt_score>20)))throw Error('Invalid checkpoint');const {error}=await db.from('activity_completions').upsert({user_id:c.userId,plan_id:c.planId,day_number:record.day,module_key:'resource:ep_checkpoint',metadata:record,completed_at:new Date().toISOString()},{onConflict:'plan_id,day_number,module_key'});if(error)throw error;assertScope(expectedScope,null,null,epoch);}
};
// The educational Lab saves its own state. It never completes a calendar day.
window.SPM_PELVIC_RECORDS={
 async read(expectedScope){
  const c=window.SPM_RESOURCE_CONTEXT(),epoch=S.epoch;
  if(!c||expectedScope!==c.userId+':'+c.planId)throw new Error('Program changed');
  const {data,error}=await db.from('activity_completions').select('metadata,completed_at').eq('user_id',c.userId).eq('plan_id',c.planId).eq('module_key','resource:pelvic_lab_state').order('completed_at',{ascending:false});
  if(error)throw error;assertScope(expectedScope,null,null,epoch);
  return data?.[0]?.metadata?.state||{};
 },
 async save(state,expectedScope,day){
  const c=window.SPM_RESOURCE_CONTEXT(),epoch=S.epoch;
  if(!c||expectedScope!==c.userId+':'+c.planId)throw new Error('Program changed');
  if(!Number.isInteger(day)||day<1||day>28||!window.SPM_PELVIC_LAB?.validState(state))throw new Error('Invalid pelvic record');
  const {error}=await db.from('activity_completions').upsert({user_id:c.userId,plan_id:c.planId,day_number:day,module_key:'resource:pelvic_lab_state',metadata:{source:'pelvic-floor-lab-v1',state},completed_at:new Date().toISOString()},{onConflict:'plan_id,day_number,module_key'});
  if(error)throw error;assertScope(expectedScope,null,null,epoch);
  return {ok:true};
 }
};
// Desire uses the same authenticated, RLS-protected resource persistence.
window.SPM_DESIRE_RECORDS={
 async read(expectedScope){
  const c=window.SPM_RESOURCE_CONTEXT(),epoch=S.epoch;
  if(!c||expectedScope!==c.userId+':'+c.planId)throw new Error('Program changed');
  const {data,error}=await db.from('activity_completions').select('metadata,completed_at').eq('user_id',c.userId).eq('plan_id',c.planId).eq('module_key','resource:desire_lab_state').order('completed_at',{ascending:false});
  if(error)throw error;assertScope(expectedScope,null,null,epoch);
  return data?.[0]?.metadata?.state||{};
 },
 async save(state,expectedScope,day){
  const c=window.SPM_RESOURCE_CONTEXT(),epoch=S.epoch;
  if(!c||expectedScope!==c.userId+':'+c.planId)throw new Error('Program changed');
  if(!Number.isInteger(day)||day<1||day>28||!window.SPM_DESIRE_LAB?.validState(state))throw new Error('Invalid desire record');
  const {error}=await db.from('activity_completions').upsert({user_id:c.userId,plan_id:c.planId,day_number:day,module_key:'resource:desire_lab_state',metadata:{source:'desire-lab-v1',state},completed_at:new Date().toISOString()},{onConflict:'plan_id,day_number,module_key'});
  if(error)throw error;assertScope(expectedScope,null,null,epoch);
  return {ok:true};
 }
};
window.SPM_SENSATE_RECORDS={
 async read(expectedScope){
  const c=window.SPM_RESOURCE_CONTEXT(),epoch=S.epoch;
  if(!c||expectedScope!==c.userId+':'+c.planId)throw new Error('Program changed');
  const {data,error}=await db.from('activity_completions').select('metadata,completed_at').eq('user_id',c.userId).eq('plan_id',c.planId).eq('module_key','resource:sensate_lab_state').order('completed_at',{ascending:false});
  if(error)throw error;assertScope(expectedScope,null,null,epoch);
  return data?.[0]?.metadata?.state||{};
 },
 async save(state,expectedScope,day){
  const c=window.SPM_RESOURCE_CONTEXT(),epoch=S.epoch;
  if(!c||expectedScope!==c.userId+':'+c.planId)throw new Error('Program changed');
  if(!Number.isInteger(day)||day<1||day>28||!window.SPM_SENSATE_LAB?.validState(state))throw new Error('Invalid sensate record');
  const {error}=await db.from('activity_completions').upsert({user_id:c.userId,plan_id:c.planId,day_number:day,module_key:'resource:sensate_lab_state',metadata:{source:'sensate-lab-v1',state},completed_at:new Date().toISOString()},{onConflict:'plan_id,day_number,module_key'});
  if(error)throw error;assertScope(expectedScope,null,null,epoch);
  return {ok:true};
 }
};
window.SPM_BREATHING_RECORDS={
 async read(expectedScope){
  const c=window.SPM_RESOURCE_CONTEXT(),epoch=S.epoch;
  if(!c||expectedScope!==c.userId+':'+c.planId)throw new Error('Program changed');
  const {data,error}=await db.from('activity_completions').select('metadata,completed_at').eq('user_id',c.userId).eq('plan_id',c.planId).eq('module_key','resource:breathing_lab_state').order('completed_at',{ascending:false});
  if(error)throw error;assertScope(expectedScope,null,null,epoch);
  return data?.[0]?.metadata?.state||{};
 },
 async save(state,expectedScope,day){
  const c=window.SPM_RESOURCE_CONTEXT(),epoch=S.epoch;
  if(!c||expectedScope!==c.userId+':'+c.planId)throw new Error('Program changed');
  if(!Number.isInteger(day)||day<1||day>28||day!==Number(c.day)||!window.SPM_BREATHING_LAB?.validState(state))throw new Error('Invalid breathing record');
  const {error}=await db.from('activity_completions').upsert({user_id:c.userId,plan_id:c.planId,day_number:day,module_key:'resource:breathing_lab_state',metadata:{source:'breathing-lab-v1',state},completed_at:new Date().toISOString()},{onConflict:'plan_id,day_number,module_key'});
  if(error)throw error;assertScope(expectedScope,null,null,epoch);
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
 if(PUBLIC_ASSESSMENT){show('appScreen');renderMotives();resetForAssessment(true);return;}
 const initialEpoch=S.epoch;
 db.auth.onAuthStateChange((event,session)=>{
   window.dispatchEvent(new CustomEvent('spm:session-change',{detail:{userId:session?.user?.id||null}}));
   if(event==='PASSWORD_RECOVERY'){show('authScreen');setTimeout(finishRecovery,100);return}
   if(!session?.user){invalidateSession();S.user=null;show('authScreen');return;}
   if(session.user.id!==S.user?.id){invalidateSession();S.user=session.user;const epoch=S.epoch;setTimeout(()=>{if(S.epoch===epoch)enterApp();},0);}
 });
 const {data:{session}}=await db.auth.getSession();
 if(S.epoch!==initialEpoch||S.user)return;
 if(session?.user){S.user=session.user;await enterApp();}else show('authScreen');
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
 if(S.user?.id!==res.data.user?.id){invalidateSession();S.user=res.data.user;await enterApp();}
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
 const epoch=S.epoch,uid=S.user?.id;
 show('appScreen');$('who').textContent=S.user.email||'Usuario';renderMotives();restoreOverlay(true);
 try{
  const restored=await restore();
  // Existing programs can render without waiting for a secondary profile write.
  if(restored)ensureProfile().catch(error=>console.warn('SPM profile sync delayed',error));
  else if(!restoreState.hasPlan){ensureProfile().catch(()=>{});}
 }catch(error){
  if(epoch!==S.epoch||uid!==S.user?.id)return;
  console.error('SPM authoritative restore',error);
  msg('No pudimos terminar de recuperar tu programa. Tu avance se conserva. Usa «Reintentar acceso» para continuar.','warn');
  let retry=$('spmRestoreRetry');if(!retry){retry=document.createElement('button');retry.id='spmRestoreRetry';retry.className='btn pri';retry.textContent='Reintentar acceso';$('status').after(retry);}retry.onclick=async()=>{retry.disabled=true;await enterApp();retry.disabled=false;};
 }finally{if(epoch===S.epoch&&uid===S.user?.id)restoreOverlay(false);}
}
function showAccessPending(){
 nav('intake');['ageCard','motiveCard','quizCard'].forEach(id=>$(id).hidden=true);
 let card=$('spmAccessPending');if(!card){card=document.createElement('section');card.id='spmAccessPending';card.className='card';$('intake').append(card);}
 card.innerHTML='<h2>Recuperemos tu siguiente paso.</h2><p>Tu cuenta está lista. Si ya pagaste, comprueba la confirmación para recuperar tu programa. Si todavía no has realizado la autoevaluación gratuita, puedes abrirla directamente.</p><p><a class="btn pri" href="free-assessment.html">Abrir mi evaluación gratuita</a></p><button type="button" class="btn sec" data-access-retry>Ya pagué: comprobar mi acceso</button><p role="status"></p>';
 card.querySelector('[data-access-retry]').onclick=async()=>{const b=card.querySelector('button'),status=card.querySelector('[role=status]');b.disabled=true;try{const result=await window.SPM_PAYMENTS.latest(db);if(result.orderId){location.assign('payment-return.html?order='+encodeURIComponent(result.orderId));return;}status.textContent='No encontramos una compra asociada a esta cuenta. Comprueba que usas el mismo correo con el que realizaste el pago.';}catch{status.textContent='No pudimos comprobarlo ahora. Tu pago no se ha repetido; conserva el enlace de confirmación de Wompi y reintenta.';}finally{b.disabled=false;}};
}
window.SPM_PROGRAM_REPAIR={
 async refresh(expectedScope){
  const c=window.SPM_RESOURCE_CONTEXT();if(!c||c.userId+':'+c.planId!==expectedScope)throw Error('Program changed');
  if(restoreState.running)throw Error('Restore in progress');
  if(!await restore())throw Error('Restore failed');
  const after=window.SPM_RESOURCE_CONTEXT();if(!after||after.userId+':'+after.planId!==expectedScope)throw Error('Program changed');
  window.dispatchEvent(new CustomEvent('spm:resourcecontext'));
 },
 async correctMistake(questionId,expectedScope){
  const c=window.SPM_RESOURCE_CONTEXT();if(!c||c.userId+':'+c.planId!==expectedScope)throw Error('Program changed');
  await window.SPM_PAYMENTS.correctMistake(db,c.planId,questionId);
  await this.refresh(expectedScope);
 },
 async save(patch,expectedScope){
  let c=window.SPM_RESOURCE_CONTEXT();if(!c||c.userId+':'+c.planId!==expectedScope)throw Error('Program changed');
  await window.SPM_PAYMENTS.completeMissing(db,c.planId,patch);
  c=window.SPM_RESOURCE_CONTEXT();if(!c||c.userId+':'+c.planId!==expectedScope)throw Error('Program changed');
  await restore();window.dispatchEvent(new CustomEvent('spm:resourcecontext'));
 }
};
async function ensureProfile(){
 const {error}=await db.from('profiles').upsert({id:S.user.id,alias:(S.user.email||'usuario').split('@')[0],locale:'es'},{onConflict:'id'});
 if(error)console.warn('SPM profile sync',error);
}
async function restore(){
 if(restoreState.running)return restoreState.hasPlan;
 const epoch=S.epoch,uid=S.user?.id;
 const current=()=>{if(epoch!==S.epoch||uid!==S.user?.id)throw Error('Program changed');};
 restoreState.running=true;
 try{
  const {data:plans}=await withRetry(()=>db.from('plans').select('*').eq('user_id',uid).order('created_at',{ascending:false}));current();
  if(!plans?.length){restoreState.complete=true;restoreState.hasPlan=false;showAccessPending();return false}
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
    withRetry(()=>db.from('assessments').select('*').eq('id',candidate.assessment_id).eq('user_id',uid).maybeSingle()),
    withRetry(()=>db.from('performance_maps').select('*').eq('id',candidate.performance_map_id).eq('user_id',uid).maybeSingle())
   ]);
   current();
   if(ar.data&&mr.data){p=candidate;a=ar.data;m=mr.data;break}
  }
  if(!p)throw new Error('Se encontró tu cuenta, pero no un conjunto completo de evaluación, Performance Map y plan.');
  const [progress,checkins]=await Promise.all([
   withRetry(()=>db.rpc('spm_get_program_progress',{p_plan_id:p.id})),
   withRetry(()=>db.from('daily_checkins').select('*').eq('user_id',uid).eq('plan_id',p.id).order('day_number'))
  ]);current();
  if(!progress.data?.plan||!Array.isArray(progress.data?.closures))throw Error('No pudimos confirmar el avance de este programa.');
  p=progress.data.plan;S.plan=p;S.closures=progress.data.closures;
  $('spmRestoreRetry')?.remove();$('spmAccessPending')?.remove();
  S.planId=p.id;S.assessmentId=p.assessment_id;S.mapId=p.performance_map_id;
  S.motives=a.motives||[];S.answers=a.answers||{};
  S.map={scores:m.domain_scores||{},primary:m.primary_domain,secondary:m.secondary_domain,total:m.spm_score||0,urgent:m.safety_level==='urgent'?(m.safety_flags||[]):[],review:m.safety_level==='review'?(m.safety_flags||[]):[]};
  S.completed=new Set(S.closures.map(x=>Number(x.day_number)));S.checkins=checkins.data||[];
  restoreState.complete=true;restoreState.hasPlan=true;
  window.SPM_PROGRAM_ENTRY?.remember();
  window.SPM_RESTORE_COMPLETE=true;
  window.SPM_RESTORED_CONTEXT={db,uid,session:null,plan:p,assessment:a,map:m,done:S.completed,closures:S.closures,checkins:S.checkins};
  ['ageCard','motiveCard','quizCard'].forEach(id=>{if($(id))$(id).hidden=true});
  ['navMap','navPlan','navCoach','navProgress'].forEach(id=>{if($(id))$(id).disabled=false});
  S.phase=Math.max(1,Math.min(4,Math.ceil((Number(p.current_day)||1)/7)));
  const welcome=new URLSearchParams(location.search).get('welcome')==='1';
  nav(welcome?'map':'plan');renderMap();renderPlan();populateCoach();renderProgress();if(!welcome)window.SPM_DAILY_PRACTICE?.open();msg(p.cycle_status==='completed'?'Tu ciclo está cerrado. Puedes consultar tus registros, tu informe y los recursos para continuar.':`Tu programa fue recuperado. Continúas en el día ${Number(p.current_day)||1}.`,'good');
  window.dispatchEvent(new CustomEvent('spm:resourcecontext'));
  return true;
 }finally{if(epoch===S.epoch)restoreState.running=false;}
}
async function hydrateProgressInBackground(plan){
 // Kept as a compatibility entry point; the canonical restore now awaits both reads.
 const c=window.SPM_RESOURCE_CONTEXT();if(!c||c.planId!==plan.id)return;
 await restore();
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
function scaleOptions(q){return E.assessment.responseScales[q.response_scale].es.map((label,i)=>({value:i+1,label}))}
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
   let opts=[];if(q.type==='scale5'||q.type==='scale5_reverse')opts=scaleOptions(q);else if(q.type==='boolean')opts=[{value:false,label:'No'},{value:true,label:'Sí'}];else opts=(q.options||[]).map(o=>({value:o.value,label:o.es}));
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
 S.map=scoreMap();
 if(PUBLIC_ASSESSMENT){
  $('quizCard').hidden=true;hideMsg();renderMap();
  window.dispatchEvent(new CustomEvent('spm:public-assessment-complete',{detail:{priorities:[S.map.primary,S.map.secondary].filter(Boolean)}}));
  return;
 }
 // New enrollments are created only by the server after verified payment.
 showAccessPending();
}
function renderMap(){
 if(!S.map)return;const m=S.map;$('scoreValue').textContent=m.total;$('scoreRing').style.setProperty('--pct',m.total);$('profileTitle').textContent=label(m.primary);
 $('profileExplain').textContent=`Según tu autoevaluación, tu área prioritaria de trabajo es ${label(m.primary).toLowerCase()}${m.secondary?`, junto con ${label(m.secondary).toLowerCase()}`:''}. Estas respuestas nos ayudan a organizar tu rutina y explorar factores que pueden relacionarse con tu experiencia sexual. No establecen un diagnóstico ni confirman una causa.`;
 $('safetyBox').innerHTML=m.urgent.length?'<div class="notice danger"><b>Prioridad de seguridad.</b> Tus respuestas incluyen una señal que requiere atención médica urgente antes de continuar.</div>':m.review.length?'<div class="notice warn"><b>Revisión profesional recomendada.</b> Hay datos que conviene revisar externamente mientras usas solo módulos seguros.</div>':'<div class="notice good"><b>No registraste señales de alerta mayores en este cuestionario.</b> Esto no sustituye una valoración médica.</div>';
 const g=$('domainGrid');g.innerHTML='';Object.entries(m.scores).filter(([k])=>['erection','ejaculation','desire','confidence','wellbeing','lifestyle'].includes(k)).forEach(([k,v])=>{g.insertAdjacentHTML('beforeend',`<div class="domain"><div class="domainHead"><b>${label(k)}</b><span>${v}/100</span></div><div class="bar"><i style="width:${v}%"></i></div></div>`)});
 $('whyList').innerHTML=`<div class="mini"><small>Área prioritaria</small><p>${label(m.primary)} es el dominio con mayor margen de trabajo.</p></div>${m.secondary?`<div class="mini"><small>Secundario</small><p>${label(m.secondary)} puede influir en tu experiencia junto con el área prioritaria.</p></div>`:''}`;
 if(!PUBLIC_ASSESSMENT){
  let routine=$('spmMapRoutine');if(!routine){routine=document.createElement('section');routine.id='spmMapRoutine';routine.className='card';$('map').append(routine)}
  const work={erection:'Trabajaremos la comprensión de tu respuesta eréctil, la atención a las sensaciones y la confianza, junto con prácticas y hábitos seleccionados para tu ruta.',ejaculation:'Trabajaremos el reconocimiento de la excitación, el ritmo y las habilidades de control, con prácticas progresivas y descansos dentro de tu calendario.',desire:'Trabajaremos la exploración del deseo, el contexto, las sensaciones y la conexión, sin convertir la experiencia en una exigencia de rendimiento.',confidence:'Trabajaremos la presión de rendimiento, la atención y la confianza mediante recursos guiados y registros de tu experiencia.',wellbeing:'Trabajaremos la satisfacción, la conexión y los hábitos que apoyan tu bienestar sexual.',lifestyle:'Trabajaremos una base de hábitos y bienestar, con recomendaciones de sueño, movimiento y alimentación distribuidas durante el programa.'};
  routine.replaceChildren();const title=document.createElement('h3');title.textContent='Qué vamos a trabajar en tu rutina';routine.append(title);
  for(const key of [...new Set([m.primary,m.secondary].filter(Boolean))]){if(work[key]){const paragraph=document.createElement('p');paragraph.textContent=work[key];routine.append(paragraph)}}
  const schedule=document.createElement('p');schedule.textContent='En «Hoy» encontrarás las actividades asignadas a tu día. El calendario combina tu prioridad con apoyos de otras áreas y seguimiento de tu evolución. Las prácticas se ajustan a las indicaciones de seguridad de tu evaluación.';routine.append(schedule);
  let medication=$('spmMedicationNote');if(!medication){medication=document.createElement('p');medication.id='spmMedicationNote';medication.className='notice'}medication.textContent=MEDICATION_NOTE;medication.hidden=!!window.SPM_PROGRAM_WELCOME;routine.append(medication);
 }
 window.SPM_PROGRAM_WELCOME?.mount();
}
function renderPlan(){
 if(!S.map||!M.days)return;const tabs=$('phaseTabs');tabs.innerHTML='';(M.phases||[]).forEach(ph=>{const b=document.createElement('button');b.className='phaseBtn'+(S.phase===ph.id?' on':'');b.textContent=`${ph.id}. ${ph.name_es}`;b.onclick=()=>{S.phase=ph.id;renderPlan()};tabs.appendChild(b)});
 const ph=(M.phases||[]).find(x=>x.id===S.phase)||{days:[1,2,3,4,5,6,7],name_es:'Fase 1',intro_es:'Construye una línea de base segura.'};$('weekIntro').innerHTML=`<b>${ph.name_es}</b> · ${ph.intro_es}`;
 const g=$('dayGrid');g.innerHTML='';M.days.filter(x=>ph.days.includes(x.d)).forEach(day=>{const c=document.createElement('div');c.className='dayCard';const done=S.completed.has(day.d);
 c.innerHTML=`<div class="dayTop"><div class="dayNum">${day.d}</div><div><h4>${day.title_es}</h4><p>${(day.learn_es||'').slice(0,105)}…</p></div><span class="tag">${done?'Día cerrado ✓':label(S.map.primary)}</span></div><div class="dayBody"><div class="lessonFlow"><div class="lesson"><b>Aprender</b><p>${day.learn_es||''}</p></div><div class="lesson"><b>Practicar</b><p>${day.practice_es||'Practica la habilidad principal del día sin convertirla en una prueba de desempeño.'}</p></div><div class="lesson"><b>Medir</b><p>${day.measure_es||'Registra tu experiencia siguiendo la indicación de esta actividad. Puedes indicar “no evaluable / no aplica”.'}</p></div><div class="lesson"><b>Aplicar</b><p>${day.apply_es||'Aplica la habilidad en un contexto seguro y sin presión.'}</p></div><div class="lesson"><b>Completar</b><p>${day.complete_es||'Marca la práctica al finalizar.'}</p></div></div><div class="interactive"><button class="btn pri doneBtn">${done?'Día cerrado ✓':'Abrir mi jornada'}</button></div></div>`;
 c.querySelector('.dayTop').onclick=()=>c.classList.toggle('open');c.querySelector('.doneBtn').onclick=()=>completeDay(day.d,c).catch(e=>msg(e.message,'danger'));g.appendChild(c)});
}
async function completeDay(){
 // Legacy calendar buttons may open Today, but never bypass its verified close.
 window.SPM_DAILY_PRACTICE?.open();return {ok:false,pending:true};
}
window.SPM_COMPLETE_DAILY_PRACTICE=async(day,expectedScope,options={})=>{
 const epoch=S.epoch,c=assertScope(expectedScope,day),key=`${expectedScope}:close:${day}`;
 if(writeTasks.has(key))return writeTasks.get(key);
 const task=(async()=>{
  const records=await window.SPM_DAILY_RECORDS.read(expectedScope,day),latest=assertScope(expectedScope,day,c.scheduleVersion,epoch);
  const decision=window.SPM_DAILY_PRACTICE?.closeDecision(latest,records,{recordsLoaded:true});
  if(!decision?.allowed)throw Error(decision?.reason||'La jornada no se ha podido comprobar. Recupera tus registros antes de cerrar.');
  const confirmed=options.confirmVoluntary===true||options.voluntaryConfirmed===true;
  if(decision.voluntary&&!confirmed)throw Error('Confirma que quieres cerrar esta jornada voluntaria.');
  const args={p_plan_id:c.planId,p_day:day,p_schedule_version:c.scheduleVersion,p_expected_revision:c.planRevision,p_confirm_voluntary:confirmed};
  const operation=await operationFor(key,args);assertScope(expectedScope,day,c.scheduleVersion,epoch);
  const {data,error}=await db.rpc('spm_close_program_day',{...args,p_operation_id:operation});
  if(error)throw persistenceError(error);
  assertScope(expectedScope,day,c.scheduleVersion,epoch);
  if(!data?.ok||!data.plan||!data.closure)throw persistenceError('Invalid close response');
  S.plan=data.plan;S.completed.add(Number(data.closure.day_number));S.closures=[...S.closures.filter(x=>Number(x.day_number)!==day),data.closure];
  if(window.SPM_RESTORED_CONTEXT?.plan?.id===c.planId){Object.assign(window.SPM_RESTORED_CONTEXT,{plan:S.plan,done:S.completed,closures:S.closures});}
  clearOperation(key);renderPlan();renderProgress();
  msg(data.plan.cycle_status==='completed'?'Ciclo cerrado y guardado. Tus registros y recursos siguen disponibles.':`Día ${day} cerrado y guardado. Continúas en el día ${data.plan.current_day}.`,'good');
  window.dispatchEvent(new CustomEvent('spm:resourcecontext'));
  return data;
 })();writeTasks.set(key,task);try{return await task;}finally{if(writeTasks.get(key)===task)writeTasks.delete(key);}
};
window.SPM_SAVE_MODULE=async function({day,moduleKey,metricValue=null,metadata={}}){
 if(!S.planId||!S.user)throw new Error('No hay un plan activo para guardar esta práctica.');
 const expectedScope=S.user.id+':'+S.planId,epoch=S.epoch;
 const payload={user_id:S.user.id,plan_id:S.planId,day_number:day,module_key:moduleKey,metric_value:metricValue,metadata:{...metadata,source:'premium-v2-live'},completed_at:new Date().toISOString()};
 payload.module_key='resource:library:'+moduleKey;
 const {error}=await db.from('activity_completions').upsert(payload,{onConflict:'plan_id,day_number,module_key'});
 if(error)throw error;assertScope(expectedScope,null,null,epoch);
 msg('Registro de Biblioteca guardado. El cierre de tu jornada se realiza desde Hoy.','good');return {ok:true};
};
function populateCoach(){const s=$('coachDay');s.innerHTML='';for(let i=1;i<=28;i++)s.insertAdjacentHTML('beforeend',`<option value="${i}">Día ${i}</option>`);s.value=String(Math.min(28,Math.max(1,Number(S.plan?.current_day)||1)))}
function coachDecision(v){if(v.flag)return{code:'clinical_review',text:'Pausa el entrenamiento de intensidad y busca revisión profesional externa por la nueva señal de seguridad.'};if([v.outcome,v.stress,v.confidence].some(x=>x===null))return{code:null,text:'Los aspectos no evaluables se conservan sin puntuación. Consulta en Hoy las actividades y las indicaciones de tu ruta.'};if(!v.completed||v.outcome<=3||v.stress>=8)return{code:'repeat_reduce',text:'Repite la habilidad de hoy con menor intensidad. El objetivo es consolidar, no forzar progresión.'};if(v.outcome>=7&&v.confidence>=6)return{code:'progress',text:'Según este registro, puedes continuar con la práctica prevista en tu ruta. Cierra la jornada desde Hoy cuando corresponda.'};return{code:'maintain',text:'Mantén la práctica actual un día más y observa consistencia antes de progresar.'}}
async function saveCoach(){
 if(!S.planId||!S.user)return;
 const expectedScope=S.user.id+':'+S.planId,epoch=S.epoch,button=$('coachSave');if(button.disabled)return;
 const names=['sleep','stress','confidence','desire','outcome'];
 const values=Object.fromEntries(names.map(k=>[k,$(k).value]));
 const day=Number($('coachDay').value);
 if(!Number.isInteger(day)||day<1||day>28||names.some(k=>!['na',...Array.from({length:11},(_,i)=>String(i))].includes(values[k]))||['sexualActivity','completed','newFlag'].some(k=>!['0','1'].includes($(k).value))){msg('Elige una respuesta en cada campo. Puedes indicar «No evaluable o no aplica» sin asignar una puntuación.','warn');return;}
 const v={day,...Object.fromEntries(names.map(k=>[k,values[k]==='na'?null:Number(values[k])])),sexual:$('sexualActivity').value==='1',completed:$('completed').value==='1',flag:$('newFlag').value==='1',note:$('note').value.trim()},d=coachDecision(v);
 const payload={user_id:S.user.id,plan_id:S.planId,day_number:day,sleep:v.sleep,stress:v.stress,confidence:v.confidence,desire:v.desire,outcome:v.outcome,sexual_activity:v.sexual,practice_completed:v.completed,new_safety_flag:v.flag,note:v.note,coach_decision:d.text,decision_code:d.code},key=expectedScope+':coach:'+day;
 button.disabled=true;
 try{
  const id=await operationFor(key,payload);assertScope(expectedScope,null,null,epoch);
  let {data,error}=await db.from('daily_checkins').insert({id,...payload}).select().single();
  if(error?.code==='23505'){
   const prior=await db.from('daily_checkins').select('*').eq('id',id).eq('user_id',payload.user_id).eq('plan_id',payload.plan_id).maybeSingle();
   if(!prior.error&&prior.data&&Object.keys(payload).every(k=>prior.data[k]===payload[k])){data=prior.data;error=null;}
  }
  assertScope(expectedScope,null,null,epoch);
  if(error||!data)throw persistenceError(error||'Unconfirmed check-in');
  if(!S.checkins.some(x=>x.id===data.id))S.checkins.push(data);
  $('coachDecision').innerHTML=`<div class="notice ${d.code==='clinical_review'?'danger':'good'}"><b>Tu registro de hoy:</b> ${d.text}</div>`;renderProgress();
  let weekly;try{weekly=await maybeWeeklyReview(day)}catch{weekly=false}assertScope(expectedScope,null,null,epoch);
  if(weekly!==false)clearOperation(key);
  msg(weekly===false?'Registro de hoy guardado. El resumen semanal no se ha podido actualizar; puedes reintentarlo.':'Registro de hoy guardado. El cierre de la jornada se realiza desde Hoy.',weekly===false?'warn':'good');
  window.dispatchEvent(new CustomEvent('spm:resourcecontext'));
 }catch(error){if(S.epoch===epoch&&contextKey(window.SPM_RESOURCE_CONTEXT?.())===expectedScope)msg('No pudimos confirmar este registro. Tus respuestas siguen aquí; reintenta el guardado.','danger');}
 finally{if(S.epoch===epoch)button.disabled=false;}
}
async function maybeWeeklyReview(day){
 if(day%7!==0)return;const week=Math.ceil(day/7),latest=new Map();
 for(const row of S.checkins.filter(x=>Math.ceil(x.day_number/7)===week)){const prior=latest.get(Number(row.day_number));if(!prior||new Date(row.created_at)>=new Date(prior.created_at))latest.set(Number(row.day_number),row)}
 const rows=[...latest.values()];if(!rows.length)return;
 const adh=Math.round(rows.filter(x=>x.practice_completed).length/7*100),avg=k=>{const values=rows.map(x=>x[k]).filter(v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v)));return values.length?Math.round(values.reduce((sum,v)=>sum+Number(v),0)/values.length*10)/10:null};
 const payload={user_id:S.user.id,plan_id:S.planId,week_number:week,adherence_pct:adh,confidence_avg:avg('confidence'),outcome_avg:avg('outcome'),summary:{checkins:rows.length},next_action:adh<60?'repetir y simplificar':'progresar según respuesta'};
 const {error}=await db.from('weekly_reviews').upsert(payload,{onConflict:'plan_id,week_number'});return !error;
}
function renderProgress(){
 const n=S.checkins.length,adh=S.completed.size?Math.round(S.completed.size/28*100):0,avg=k=>{const values=S.checkins.map(x=>x[k]).filter(v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v)));return values.length?(values.reduce((sum,v)=>sum+Number(v),0)/values.length).toFixed(1):'—'};
 $('stChecks').textContent=n;$('stAdh').textContent=adh+'%';$('stConf').textContent=avg('confidence');$('stOutcome').textContent=avg('outcome');$('stDecision').textContent=n?(S.checkins[n-1].decision_code||'—'):'—';
 const chart=$('chart');chart.innerHTML='';S.checkins.slice(-14).forEach(x=>{const c=document.createElement('div'),hasValue=x.confidence!==null&&x.confidence!==undefined;c.className='col';c.style.height=hasValue?`${Math.max(8,Number(x.confidence)*10)}%`:'8%';c.dataset.v=`D${x.day_number}: ${hasValue?x.confidence:'No evaluable'}`;if(!hasValue){c.dataset.missing='true';c.textContent='—';}chart.appendChild(c)});
 $('savedState').textContent=S.planId?'Guardado en la nube ✓':'Aún sin plan';
}
async function signOut(){invalidateSession();S.user=null;show('authScreen');resetForAssessment(true);await db.auth.signOut();}
document.addEventListener('DOMContentLoaded',()=>{
 $('authBtn').onclick=()=>sign('signin');$('signupBtn').onclick=()=>sign('signup');if($('forgotBtn'))$('forgotBtn').onclick=resetPassword;$('logoutBtn').onclick=signOut;
 const motiveGrid=$('motiveGrid');motiveGrid.addEventListener('click',event=>{const button=event.target.closest('button[data-motive]');if(button&&motiveGrid.contains(button))selectMotive(button.dataset.motive)});
 document.querySelectorAll('[data-age]').forEach(b=>b.onclick=()=>{if(b.dataset.age==='1'){renderMotives();$('ageCard').hidden=true;$('motiveCard').hidden=false}else msg('SPM está diseñado para mayores de 18 años.','warn')});
 $('motiveNext').onclick=()=>{if(!S.motives.length){msg('Selecciona al menos un motivo.','warn');return}buildQueue();S.qi=0;$('motiveCard').hidden=true;$('quizCard').hidden=false;renderQ()};
 $('qBack').onclick=()=>{const prev=prevVisibleIndex(S.qi);if(prev>=0){S.qi=prev;renderQ()}};
 $('qNext').onclick=()=>{const q=S.queue[S.qi],value=S.answers[q.id];if(value===undefined||value===null||(q.type==='text'&&!String(value).trim())){msg(q.type==='text'?'Escribe una respuesta para continuar.':'Selecciona una respuesta.','warn');return}hideMsg();clearHiddenAnswers();S.qi=nextVisibleIndex(S.qi);renderQ()};
 document.querySelectorAll('.navbtn').forEach(b=>b.onclick=()=>!b.disabled&&b.dataset.panel&&nav(b.dataset.panel));$('goPlan').onclick=()=>nav('plan');$('coachSave').onclick=saveCoach;$('newAssessment').onclick=()=>{location.assign('free-assessment.html')};boot();
});
})();
