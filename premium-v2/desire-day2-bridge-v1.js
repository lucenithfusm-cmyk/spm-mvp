/* SPM · puente aislado de Deseo, Día 2. Mantiene las otras rutas intactas.
 * Se monta DESPUÉS del puente de Día 1 para conservarlo.
 */
(()=>{
  'use strict';
  if(window.SPM_DESIRE_DAY2_BRIDGE)return;
  const current=window.SPM_DESIRE_LAB,touch=window.SPM_DESIRE_DAY2_TOUCH;
  if(!current||!touch)return;
  const oldOpen=current.open.bind(current),oldClose=current.close.bind(current);
  const ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
  const scopeOf=c=>c?.userId&&c?.planId?`${c.userId}:${c.planId}`:'';
  const main=c=>window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(a=>a?.id==='main');
  const eligible=(c,opts)=>opts?.origin==='dailyPlan'&&c?.primary==='desire'&&Number(c.day)===2;
  let owns=null;
  function permitted(scope){
    const c=ctx(),a=main(c);
    if(!eligible(c,{origin:'dailyPlan'})||scopeOf(c)!==scope||a?.kind!=='desire')return false;
    if(window.SPM_DAILY_PRACTICE?.restricted?.(c,a))return false;
    const act=window.SPM_DAILY_PRACTICE?.active?.();
    return !act||(act.id==='main'&&act.scope===scope&&Number(act.day)===2);
  }
  async function open(opts={}){
    const c=ctx();if(!eligible(c,opts))return oldOpen(opts);
    const scope=scopeOf(c),host=document.getElementById('spmDailyWorkspace');
    if(!scope||!host?.isConnected||!permitted(scope))return false;
    if(document.querySelector('.spm-desire-modal[open]')&&await oldClose()===false)return false;
    touch.stop();owns={scope,host};
    const onBack=()=>{
      touch.stop();owns=null;
      // El guardado central puede haber reconstruido Hoy; no duplicar el retorno.
      if(host.isConnected&&host.querySelector('[data-ds2-page]'))window.SPM_DAILY_PRACTICE?.open?.({focus:false});
    };
    return touch.mount({host,valid:()=>permitted(scope)&&host.isConnected,
      storage:{read:()=>window.SPM_DESIRE_RECORDS.read(scope),save:value=>window.SPM_DESIRE_RECORDS.save(value,scope,2)},
      onBack,onCompleted:r=>window.SPM_DAILY_PRACTICE.saveActivity('main',r,scope,2)});
  }
  async function close(){if(owns){touch.stop();owns=null;window.SPM_DAILY_PRACTICE?.open?.({focus:false});return true;}return oldClose();}
  function stop(){touch.stop();owns=null;}
  window.SPM_DESIRE_LAB={...current,open,close};
  window.SPM_DESIRE_DAY2_BRIDGE={open,close,stop,eligible,permitted};
})();
