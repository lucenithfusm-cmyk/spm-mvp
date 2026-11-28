/* SPM Deseo Día 3: adaptador aislado, no sustituye días 1, 2 ni biblioteca. */
(()=>{
 'use strict';
 if(window.SPM_DESIRE_DAY3_BRIDGE)return;
 const original=window.SPM_DESIRE_LAB,ui=window.SPM_DESIRE_DAY3_TOUCH;
 if(!original||!ui)return;
 const legacyOpen=original.open.bind(original),legacyClose=original.close.bind(original);
 const ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
 const scopeOf=c=>c?.userId&&c?.planId?`${c.userId}:${c.planId}`:'';
 const assignment=c=>window.SPM_DAILY_PRACTICE?.contentAssignment?.('desire',c)||window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(a=>a?.kind==='desire');
 const eligible=(c,opts)=>opts?.origin==='dailyPlan'&&(c?.primary==='desire'||c?.scheduleVersion==='spm-20261127-v1')&&assignment(c)?.kind==='desire'&&Number(assignment(c)?.sourceDay||c.day)===3;
 let owns=null;
 function permitted(scope,binding){
  const c=ctx(),a=assignment(c);
  if(!eligible(c,{origin:'dailyPlan'})||scopeOf(c)!==scope||a?.kind!=='desire')return false;
    if(binding&&((c.scheduleVersion||'legacy')!==binding.scheduleVersion||Number(c.day)!==binding.scheduledDay||a.id!==binding.activityId||(a.assignmentId||null)!==binding.assignmentId))return false;
  if(window.SPM_DAILY_PRACTICE?.restricted?.(c,a))return false;
  const active=window.SPM_DAILY_PRACTICE?.active?.();
  return !active||(active.id===a.id&&active.scope===scope&&Number(active.day)===Number(c.day));
 }
 async function open(opts={}){
  const c=ctx();if(!eligible(c,opts))return legacyOpen(opts);
  const scope=scopeOf(c),scheduledDay=Number(c.day),activityId=assignment(c).id,host=document.getElementById('spmDailyWorkspace');
  if(!scope||!host?.isConnected||!permitted(scope))return false;
  if(document.querySelector('.spm-desire-modal[open]')&&await legacyClose()===false)return false;
  ui.stop();const binding={scope,host,scheduledDay,activityId,assignmentId:assignment(c).assignmentId||null,scheduleVersion:c.scheduleVersion||'legacy'};owns=binding;
  const onBack=()=>{
   ui.stop();owns=null;
   // SPM Central puede haber reconstruido Hoy tras guardar. No duplicar ese cierre.
   if(host.isConnected&&host.querySelector('[data-ds3-page]'))window.SPM_DAILY_PRACTICE?.open?.({focus:false});
  };
  return ui.mount({host,valid:()=>permitted(scope,binding)&&host.isConnected,
   storage:{read:()=>window.SPM_DESIRE_RECORDS.read(scope),save:value=>{if(!permitted(scope,binding))return Promise.reject(Error('La sesión o su versión cambiaron.'));return window.SPM_DESIRE_RECORDS.save(value,scope,scheduledDay);}},
   onBack,onCompleted:record=>window.SPM_DAILY_PRACTICE.saveActivity(activityId,record,scope,scheduledDay)});
 }
 async function close(){if(owns){if(ui.close)return ui.close();ui.stop();owns=null;window.SPM_DAILY_PRACTICE?.open?.({focus:false});return true;}return legacyClose();}
 function stop(){ui.stop();owns=null;}
 window.SPM_DESIRE_LAB={...original,open,close};
 window.SPM_DESIRE_DAY3_BRIDGE={open,close,stop,eligible,permitted};
})();
