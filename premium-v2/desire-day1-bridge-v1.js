/* SPM Desire Day 1 bridge. Intercepts only the scheduled dailyPlan practice,
 * never the Deseo library or the remaining 27 days / other modules.
 */
(()=>{
  'use strict';
  if(window.SPM_DESIRE_DAY1_BRIDGE)return;
  const lab=window.SPM_DESIRE_LAB,touch=window.SPM_DESIRE_DAY1_TOUCH;
  if(!lab||!touch)return;
  const oldOpen=lab.open.bind(lab),oldClose=lab.close.bind(lab);
  const context=()=>window.SPM_RESOURCE_CONTEXT?.();
  const scopeOf=c=>c?.userId&&c?.planId?String(c.userId)+':'+String(c.planId):'';
  const mainAssignment=c=>window.SPM_DAILY_PRACTICE?.contentAssignment?.('desire',c)||window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(a=>a?.kind==='desire');
  const eligible=(c,opts)=>opts?.origin==='dailyPlan'&&(c?.primary==='desire'||c?.scheduleVersion==='spm-20261127-v1')&&mainAssignment(c)?.kind==='desire'&&Number(mainAssignment(c)?.sourceDay||c.day)===1;
  let ownSession=null;
  function permitted(scope,binding){
    const c=context(),a=mainAssignment(c);
    if(!eligible(c,{origin:'dailyPlan'})||scopeOf(c)!==scope||a?.kind!=='desire')return false;
    if(binding&&((c.scheduleVersion||'legacy')!==binding.scheduleVersion||Number(c.day)!==binding.scheduledDay||a.id!==binding.activityId||(a.assignmentId||null)!==binding.assignmentId))return false;
    if(window.SPM_DAILY_PRACTICE?.restricted?.(c,a))return false;
    const active=window.SPM_DAILY_PRACTICE?.active?.();
    return !active||(active.id===a.id&&active.scope===scope&&Number(active.day)===Number(c.day));
  }
  async function open(opts={}){
    const c=context();if(!eligible(c,opts))return oldOpen(opts);
    const scope=scopeOf(c),scheduledDay=Number(c.day),activityId=mainAssignment(c).id,host=document.getElementById('spmDailyWorkspace');
    if(!scope||!host?.isConnected||!permitted(scope))return false;
    // Only if an old Desire library modal happens to be open; keep its own flush.
    if(document.querySelector('.spm-desire-modal[open]')&&await oldClose()===false)return false;
    touch.stop();const binding={scope,host,scheduledDay,activityId,assignmentId:mainAssignment(c).assignmentId||null,scheduleVersion:c.scheduleVersion||'legacy'};ownSession=binding;
    const onBack=()=>{
      touch.stop();ownSession=null;
      // SPM_DAILY_PRACTICE.saveActivity may already have returned to Hoy.
      if(host.isConnected&&host.querySelector('[data-ds1-page]'))window.SPM_DAILY_PRACTICE?.open?.({focus:false});
    };
    return touch.mount({host,valid:()=>permitted(scope,binding)&&host.isConnected,
      storage:{
        read:()=>window.SPM_DESIRE_RECORDS.read(scope),
        save:value=>{if(!permitted(scope,binding))return Promise.reject(Error('La sesión o su versión cambiaron.'));return window.SPM_DESIRE_RECORDS.save(value,scope,scheduledDay);}
      },
      onBack,
      onCompleted:record=>window.SPM_DAILY_PRACTICE.saveActivity(activityId,record,scope,scheduledDay)
    });
  }
  async function close(){if(ownSession){if(touch.close)return touch.close();touch.stop();ownSession=null;window.SPM_DAILY_PRACTICE?.open?.({focus:false});return true}return oldClose();}
  function stop(){touch.stop();ownSession=null;}
  window.SPM_DESIRE_LAB={...lab,open,close};
  window.SPM_DESIRE_DAY1_BRIDGE={open,close,stop,eligible,permitted};
})();
