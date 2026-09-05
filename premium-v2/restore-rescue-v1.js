(()=>{
'use strict';
if(window.SPM_RESTORE_RESCUE_V1)return;
window.SPM_RESTORE_RESCUE_V1=true;
const SB_URL='https://jogirmziqjlsttbbarcx.supabase.co';
const SB_KEY='sb_publishable_jXmxa5K6ThK9C8DPIxmVVQ_mbuLWVaf';
const $=id=>document.getElementById(id);
let running=false,restored=false;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function status(text,kind='good'){
 const el=$('status');if(!el)return;el.className=`notice ${kind} globalStatus`;el.textContent=text;el.hidden=false;
}
function enableProgramNav(){['navMap','navPlan','navCoach','navProgress'].forEach(id=>{const el=$(id);if(el)el.disabled=false});}
function activate(panel){
 document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('on',p.id===panel));
 document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('on',b.dataset.panel===panel));
}
function mapFromRow(m){return{scores:m.domain_scores||{},primary:m.primary_domain||'lifestyle',secondary:m.secondary_domain||null,total:Number(m.spm_score)||0,urgent:m.safety_level==='urgent'?(m.safety_flags||[]):[],review:m.safety_level==='review'?(m.safety_flags||[]):[]}}
function hideIntake(){['ageCard','motiveCard','quizCard'].forEach(id=>{const el=$(id);if(el)el.hidden=true});}
async function restorePersistedProgram(){
 if(running||restored||!window.supabase)return;
 running=true;
 try{
  const db=window.supabase.createClient(SB_URL,SB_KEY);
  const {data:{session},error:se}=await db.auth.getSession();
  if(se||!session?.user){running=false;return}
  const uid=session.user.id;
  const {data:plans,error:pe}=await db.from('plans').select('*').eq('user_id',uid).order('created_at',{ascending:false});
  if(pe)throw pe;
  if(!plans?.length){running=false;return}
  // Prefer the newest complete plan. If several remain active, preserve all records but restore one deterministically.
  let chosen=null,assessment=null,map=null;
  for(const p of plans){
   if(!p.assessment_id||!p.performance_map_id)continue;
   const [{data:a,error:ae},{data:m,error:me}]=await Promise.all([
    db.from('assessments').select('*').eq('id',p.assessment_id).eq('user_id',uid).maybeSingle(),
    db.from('performance_maps').select('*').eq('id',p.performance_map_id).eq('user_id',uid).maybeSingle()
   ]);
   if(!ae&&!me&&a&&m){chosen=p;assessment=a;map=m;break}
  }
  if(!chosen)throw new Error('No se encontró un programa completo asociado a las evaluaciones guardadas.');
  const [{data:completions,error:ce},{data:checkins,error:de}]=await Promise.all([
   db.from('activity_completions').select('*').eq('user_id',uid).eq('plan_id',chosen.id),
   db.from('daily_checkins').select('*').eq('user_id',uid).eq('plan_id',chosen.id).order('day_number')
  ]);
  if(ce)throw ce;if(de)throw de;
  const state=window.SPM_APP_STATE;
  if(state){
   state.user=session.user;state.planId=chosen.id;state.assessmentId=chosen.assessment_id;state.mapId=chosen.performance_map_id;
   state.motives=assessment.motives||[];state.answers=assessment.answers||{};state.map=mapFromRow(map);
   state.completed=new Set((completions||[]).map(x=>x.day_number));state.checkins=checkins||[];
   state.phase=Math.max(1,Math.min(4,Math.ceil((Number(chosen.current_day)||1)/7)));
  }
  hideIntake();enableProgramNav();
  // Give app-live a moment to finish its own boot, then force render from persisted data.
  await sleep(50);
  if(typeof window.SPM_RENDER_RESTORED_PROGRAM==='function')window.SPM_RENDER_RESTORED_PROGRAM();
  enableProgramNav();activate('plan');
  const newBtn=$('newAssessment');if(newBtn&&plans.length>=2){newBtn.hidden=true;newBtn.disabled=true}
  restored=true;
  status(plans.length>=2?'Tus evaluaciones están conservadas. SPM restauró tu programa guardado y mantuvo el historial.':'Tu programa y progreso guardados fueron restaurados.');
 }catch(err){console.error('SPM restore rescue',err);status('SPM encontró tu sesión, pero no pudo reconstruir el programa guardado. Tus datos permanecen almacenados.','warn')}
 finally{running=false}
}
async function boot(){for(let i=0;i<50&&!window.supabase;i++)await sleep(100);await sleep(150);restorePersistedProgram();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('pageshow',()=>setTimeout(restorePersistedProgram,100));
})();