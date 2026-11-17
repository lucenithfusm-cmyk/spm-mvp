/* SPM · Adaptador no invasivo: solo Erección y firmeza, día 1. */
(()=>{'use strict';
if(window.SPM_ERECTION_DAY1_BRIDGE)return;
const base=window.SPM_ERECTION_PRACTICE,ui=window.SPM_ED_DAY1_TOUCH;
if(!base||!ui)return;
const opening=base.open.bind(base),pausing=base.pause.bind(base),stopping=base.stop.bind(base);
const context=()=>window.SPM_RESOURCE_CONTEXT?.();
function scopedContext(c){return c&&typeof c.userId==='string'&&c.userId&&typeof c.planId==='string'&&c.planId?c.userId+':'+c.planId:null;}
function assigned(){try{return window.SPM_DAILY_PRACTICE?.assignments?.(context())?.find(x=>x.id==='main')}catch{return null}}
function check(c,scope){
 if(!c||c.primary!=='erection'||Number(c.day)!==1||scopedContext(c)!==scope)return false;
 const a=assigned();if(a?.kind!=='erection'||a.id!=='main')return false;
 if(window.SPM_DAILY_PRACTICE?.restricted?.(c,a))return false;
 const active=window.SPM_DAILY_PRACTICE?.active?.();
 if(active&&(active.id!=='main'||active.scope!==scope||Number(active.day)!==1))return false;
 return true;
}
async function open(a){
 const c=context(),scope=scopedContext(c);
 if(c?.primary!=='erection'||Number(c.day)!==1||a?.id!=='main'||a.kind!=='erection')return opening(a);
 const host=document.getElementById('spmDailyWorkspace');
 if(!scope||!host?.isConnected||!check(c,scope))return false;
 stopping();ui.stop();host.innerHTML='<p class="spm-erection-status" role="status">Recuperando tu práctica de hoy…</p>';
 let prior={};
 try{
  const rows=await window.SPM_DAILY_RECORDS.read(scope,1);
  if(!check(context(),scope)||!host.isConnected)return false;
  const saved=rows?.main;
  if(saved&&typeof saved==='object'&&!Array.isArray(saved))prior={...saved};
 }catch{
  if(check(context(),scope)&&host.isConnected)host.innerHTML='<p class="spm-erection-status" role="alert">No fue posible recuperar tu registro. Vuelve a Hoy y reintenta; no se han modificado tus datos.</p>';
  return false;
 }
 if(!check(context(),scope))return false;
 return ui.mount({host,prior,scope,
  valid:()=>check(context(),scope)&&host.isConnected,
  save:record=>window.SPM_DAILY_PRACTICE.saveActivity('main',record,scope,1),
  onBack:()=>window.SPM_DAILY_PRACTICE?.open?.()
 });
}
function pause(){ui.pause();pausing()}
function stop(){ui.stop();stopping()}
window.SPM_ERECTION_PRACTICE={...base,open,pause,stop};
window.SPM_ERECTION_DAY1_BRIDGE={open,stop};
})();