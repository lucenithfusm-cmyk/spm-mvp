(()=>{
'use strict';
if(window.SPM_SINGLE_PROGRAM_LOCK)return;window.SPM_SINGLE_PROGRAM_LOCK=true;
const SB_URL='https://jogirmziqjlsttbbarcx.supabase.co';
const SB_KEY='sb_publishable_jXmxa5K6ThK9C8DPIxmVVQ_mbuLWVaf';
const $=id=>document.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let busy=false,done=false;
function activate(id){document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('on',p.id===id));document.querySelectorAll('.navbtn[data-panel]').forEach(b=>b.classList.toggle('on',b.dataset.panel===id));}
function lockAssessment(){const b=$('newAssessment');if(b){b.hidden=true;b.disabled=true;b.remove();}}
function enableProgram(){['navMap','navPlan','navCoach','navProgress'].forEach(id=>{const b=$(id);if(b)b.disabled=false});lockAssessment();}
async function run(){if(done||busy||!window.supabase)return;busy=true;try{
 const db=window.supabase.createClient(SB_URL,SB_KEY);const {data:{session}}=await db.auth.getSession();if(!session?.user)return;
 const uid=session.user.id;
 const {data:plans,error}=await db.from('plans').select('*').eq('user_id',uid).order('created_at',{ascending:true});if(error)throw error;
 if(!plans?.length){lockAssessment();return;}
 // Product rule: one account = first completed assessment = one program. Later assessments are ignored.
 let plan=plans[0];
 // Preserve the known original EP program if present; otherwise oldest plan remains canonical.
 const ep=plans.find(p=>p.route_key==='ejaculation'&&Number(p.current_day||1)>1);if(ep)plan=ep;
 const [{data:a,error:ae},{data:m,error:me}]=await Promise.all([
   db.from('assessments').select('*').eq('id',plan.assessment_id).eq('user_id',uid).single(),
   db.from('performance_maps').select('*').eq('id',plan.performance_map_id).eq('user_id',uid).single()
 ]);if(ae)throw ae;if(me)throw me;
 // Make the existing app restore() deterministic without deleting historical rows.
 try{await db.from('plans').update({status:'paused'}).eq('user_id',uid).neq('id',plan.id).eq('status','active');await db.from('plans').update({status:'active'}).eq('id',plan.id).eq('user_id',uid)}catch(_){ }
 if(window.S&&typeof window.S==='object'){window.S.plan=plan;window.S.assessment=a;window.S.map=m;}
 ['ageCard','motiveCard','quizCard'].forEach(id=>{const e=$(id);if(e)e.hidden=true});enableProgram();
 // Prefer the app's own renderers/state if they are available after restoration.
 if(typeof window.renderMap==='function')try{window.renderMap()}catch(_){ }
 if(typeof window.renderPlan==='function')try{window.renderPlan()}catch(_){ }
 if(typeof window.renderProgress==='function')try{window.renderProgress()}catch(_){ }
 const status=$('status');if(status){status.hidden=false;status.className='notice good globalStatus';status.textContent=`Programa original restaurado. Continúas en el día ${Number(plan.current_day)||1}.`;}
 activate('map');done=true;
 }catch(e){console.error('SPM single program lock',e)}finally{busy=false}}
async function boot(){for(let i=0;i<80&&!window.supabase;i++)await sleep(100);for(let i=0;i<20&&!done;i++){await run();if(!done)await sleep(400)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.addEventListener('pageshow',()=>setTimeout(boot,100));
})();