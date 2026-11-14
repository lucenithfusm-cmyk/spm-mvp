(()=>{
'use strict';
if(window.SPM_PELVIC_READINESS)return;
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
const scopeOf=c=>c?.userId&&c?.planId?c.userId+':'+c.planId:'';
let cacheScope='',state=null,loaded=false,version=0,pending=null;
const valid=s=>!!s&&typeof s==='object'&&!Array.isArray(s)&&window.SPM_PELVIC_LAB?.validState?.(s)===true;
const safe=c=>!!scopeOf(c)&&c.safety==='none'&&!c.flags?.length&&!c.checkins?.some(x=>x.new_safety_flag===true);
function eligible(c,saved){
 if(!safe(c))return false;
 const a=c.answers||{},t=Number(a.pf_tension);
 if(a.pf_awareness==='hard_to_relax'||(Number.isFinite(t)&&t>=4))return false;
 const s=saved===undefined?(cacheScope===scopeOf(c)&&loaded?state:{}):saved;
 if(!s||typeof s!=='object'||Array.isArray(s))return false;
 const sc=s['pf-screening']||{},check=(s['pf-checkins']||[]).at(-1),last=(s['pf-results']||[]).at(-1);
 if(s['pf-flags']?.length||s['pf-overload']?.length||sc.releaseOk==='no'||check?.tension>=7||check?.release==='Difícil')return false;
 if(last&&(last.fullRelease===false||last.discomfort||last.postTension||['relax','clinical-review'].includes(last.recommendation)))return false;
 if(a.pf_awareness==='good_control'&&[0,1,2].includes(t))return true;
 if(sc.aware==='ok'&&sc.releaseOk==='si'&&Array.isArray(sc.comp)&&new Set(sc.comp).size===3&&['mandibula','abdomen','gluteos'].every(x=>sc.comp.includes(x)))return true;
 return !!last&&last.practiceId==='percibe'&&last.completed===true&&last.intent==='daily-relax'&&last.origin==='dailyPlan'&&last.fullRelease===true&&last.discomfort===false&&last.postTension===false&&last.weekly?.voluntaryControl==='yes'&&['repeat','progress'].includes(last.recommendation);
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