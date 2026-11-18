/* SPM Deseo Día 3: adaptador aislado, no sustituye días 1, 2 ni biblioteca. */
(()=>{
 'use strict';
 if(window.SPM_DESIRE_DAY3_BRIDGE)return;
 const original=window.SPM_DESIRE_LAB,ui=window.SPM_DESIRE_DAY3_TOUCH;
 if(!original||!ui)return;
 const legacyOpen=original.open.bind(original),legacyClose=original.close.bind(original);
 const ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
 const scopeOf=c=>c?.userId&&c?.planId?`${c.userId}:${c.planId}`:'';
 const assignment=c=>window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(a=>a?.id==='main');
 const eligible=(c,opts)=>opts?.origin==='dailyPlan'&&c?.primary==='desire'&&Number(c.day)===3;
 let owns=null;
 function permitted(scope){
  const c=ctx(),a=assignment(c);
  if(!eligible(c,{origin:'dailyPlan'})||scopeOf(c)!==scope||a?.kind!=='desire')return false;
  if(window.SPM_DAILY_PRACTICE?.restricted?.(c,a))return false;
  const active=window.SPM_DAILY_PRACTICE?.active?.();
  return !active||(active.id==='main'&&active.scope===scope&&Number(active.day)===3);
 }
 async function open(opts={}){
  const c=ctx();if(!eligible(c,opts))return legacyOpen(opts);
  const scope=scopeOf(c),host=document.getElementById('spmDailyWorkspace');
  if(!scope||!host?.isConnected||!permitted(scope))return false;
  if(document.querySelector('.spm-desire-modal[open]')&&await legacyClose()===false)return false;
  ui.stop();owns={scope,host};
  const onBack=()=>{
   ui.stop();owns=null;
   // SPM Central puede haber reconstruido Hoy tras guardar. No duplicar ese cierre.
   if(host.isConnected&&host.querySelector('[data-ds3-page]'))window.SPM_DAILY_PRACTICE?.open?.({focus:false});
  };
  return ui.mount({host,valid:()=>permitted(scope)&&host.isConnected,
   storage:{read:()=>window.SPM_DESIRE_RECORDS.read(scope),save:value=>window.SPM_DESIRE_RECORDS.save(value,scope,3)},
   onBack,onCompleted:record=>window.SPM_DAILY_PRACTICE.saveActivity('main',record,scope,3)});
 }
 async function close(){if(owns){ui.stop();owns=null;window.SPM_DAILY_PRACTICE?.open?.({focus:false});return true;}return legacyClose();}
 function stop(){ui.stop();owns=null;}
 window.SPM_DESIRE_LAB={...original,open,close};
 window.SPM_DESIRE_DAY3_BRIDGE={open,close,stop,eligible,permitted};
})();
