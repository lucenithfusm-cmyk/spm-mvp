/* Adaptador SPM: intercepta únicamente Erección y firmeza, día 2. */
(()=>{'use strict';
if(window.SPM_ERECTION_DAY2_BRIDGE)return;
const original=window.SPM_ERECTION_PRACTICE,ui=window.SPM_ED_DAY2_TOUCH;
if(!original||!ui)return;
const oldOpen=original.open.bind(original),oldPause=original.pause.bind(original),oldStop=original.stop.bind(original);
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
const scope=c=>c&&typeof c.userId==='string'&&c.userId&&typeof c.planId==='string'&&c.planId?c.userId+':'+c.planId:'';
const assignment=c=>{try{return window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(a=>a.id==='main')}catch{return null}};
function permitted(c,s){
 if(!c||c.primary!=='erection'||Number(c.day)!==2||scope(c)!==s)return false;
 const a=assignment(c);if(a?.id!=='main'||a?.kind!=='erection')return false;
 if(window.SPM_DAILY_PRACTICE?.restricted?.(c,a))return false;
 const active=window.SPM_DAILY_PRACTICE?.active?.();
 if(active&&(active.id!=='main'||Number(active.day)!==2||active.scope!==s))return false;
 return true;
}
async function open(a){
 const c=ctx();if(c?.primary!=='erection'||Number(c.day)!==2||a?.id!=='main'||a.kind!=='erection')return oldOpen(a);
 const s=scope(c),host=document.getElementById('spmDailyWorkspace');
 if(!s||!host?.isConnected||!permitted(c,s))return false;
 oldStop();ui.stop();host.innerHTML='<p class="spm-erection-status" role="status">Recuperando tus respuestas…</p>';
 let prior={};try{
  const rows=await window.SPM_DAILY_RECORDS.read(s,2);
  if(!permitted(ctx(),s)||!host.isConnected)return false;
  const saved=rows?.main;if(saved&&typeof saved==='object'&&!Array.isArray(saved))prior={...saved};
 }catch{
  if(permitted(ctx(),s)&&host.isConnected)host.innerHTML='<p role="alert">No pudimos recuperar tu registro. Vuelve a Hoy y reintenta; tus datos permanecen intactos.</p>';
  return false;
 }
 return ui.mount({host,prior,scope:s,
  valid:()=>permitted(ctx(),s)&&host.isConnected,
  save:record=>window.SPM_DAILY_PRACTICE.saveActivity('main',record,s,2),
  onBack:()=>window.SPM_DAILY_PRACTICE?.open?.()});
}
function pause(){ui.pause();oldPause()}
function stop(){ui.stop();oldStop()}
window.SPM_ERECTION_PRACTICE={...original,open,pause,stop};
window.SPM_ERECTION_DAY2_BRIDGE={open,stop};
})();