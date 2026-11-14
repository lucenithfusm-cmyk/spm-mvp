(()=>{
'use strict';
if(window.SPM_PELVIC_READINESS)return;
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
const scopeOf=c=>c?.userId&&c?.planId?c.userId+':'+c.planId:'';
let cacheScope='',state=null,loaded=false,version=0,pending=null;
const valid=s=>!!s&&typeof s==='object'&&!Array.isArray(s)&&window.SPM_PELVIC_LAB?.validState?.(s)===true;
const safe=c=>!!scopeOf(c)&&c.safety==='none'&&!c.flags?.length&&!c.checkins?.some(x=>x.new_safety_flag===true);
function goodLabResult(r){
 return !!r&&r.practiceId==='percibe'&&r.completed===true&&r.origin==='dailyPlan'&&r.intent==='daily-relax'&&r.activityId==='pelvic-daily-lab'&&r.fullRelease===true&&r.discomfort===false&&r.postTension===false&&r.weekly?.voluntaryControl==='yes'&&['repeat','progress'].includes(r.recommendation);
}
function eligible(c,saved){
 if(!safe(c))return false;
 const a=c.answers||{},raw=a.pf_tension,t=raw==null?NaN:Number(raw);
 if(Number.isFinite(t)&&t>=4)return false;
 const s=saved===undefined?(cacheScope===scopeOf(c)&&loaded?state:{}):saved;
 if(!s||typeof s!=='object'||Array.isArray(s))return false;
 const sc=s['pf-screening']||{},check=(s['pf-checkins']||[]).at(-1),rows=Array.isArray(s['pf-results'])?s['pf-results']:[];
 const last=rows.at(-1);
 if(s['pf-flags']?.length||s['pf-overload']?.length||sc.releaseOk==='no'||check?.tension>=7||check?.release==='Difícil')return false;
 if(s['pf-screening']&&(sc.aware!=='ok'||sc.releaseOk!=='si'||sc.comp?.length!==3))return false;
 if(last&&(last.fullRelease===false||last.discomfort||last.postTension||['relax','clinical-review'].includes(last.recommendation)))return false;
 // Readiness from the original questionnaire is independent of the main domain.
 if(a.pf_awareness==='good_control'&&[0,1,2].includes(t))return true;
 // A detailed, validated screening in Pelvic Floor Lab can establish readiness.
 if(sc.aware==='ok'&&sc.releaseOk==='si'&&Array.isArray(sc.comp)&&new Set(sc.comp).size===3&&['mandibula','abdomen','gluteos'].every(x=>sc.comp.includes(x)))return true;
 // A patient who initially struggled to relax needs two positive weekly reports.
 // Everyone else can progress after a completed, positive weekly Lab self-report.
 if(a.pf_awareness==='hard_to_relax'&&(!Number.isFinite(t)||t>2))return false;
 if(a.pf_awareness==='hard_to_relax')return rows.length>=2&&goodLabResult(rows.at(-1))&&goodLabResult(rows.at(-2));
 return goodLabResult(last);
}
function reset(){version++;pending=null;cacheScope='';state=null;loaded=false;}
function publish(){window.dispatchEvent(new CustomEvent('spm:pelvic-readiness'));}
function acceptSaved(s,scope){
 if(!scope||scope!==scopeOf(ctx())||!valid(s))return false;
 const encoded=JSON.stringify(s),prior=loaded&&cacheScope===scope?JSON.stringify(state):null;
 cacheScope=scope;state=JSON.parse(encoded);loaded=true;
 if(prior!==encoded)publish();
 return true;
}
async function refresh(){
 const scope=scopeOf(ctx());
 if(!scope||!window.SPM_PELVIC_RECORDS?.read){if(cacheScope)reset();return false;}
 if(pending?.scope===scope)return pending.promise;
 const token=++version;
 const promise=(async()=>{
  try{
   const s=await window.SPM_PELVIC_RECORDS.read(scope);
   if(token!==version||scope!==scopeOf(ctx()))return false;
   return acceptSaved(s||{},scope);
  }catch{return false}
  finally{if(pending?.token===token)pending=null}
 })();
 pending={scope,token,promise};return promise;
}
window.SPM_PELVIC_READINESS={eligible,refresh,acceptSaved,reset};
window.addEventListener('spm:resourcecontext',()=>{if(cacheScope&&cacheScope!==scopeOf(ctx()))reset();void refresh()});
window.addEventListener('spm:session-change',()=>{reset();void refresh()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void refresh()},{once:true});
else Promise.resolve().then(()=>refresh());
})();