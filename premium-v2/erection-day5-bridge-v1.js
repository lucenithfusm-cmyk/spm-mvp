/* SPM · Sesión 5 de Erección y firmeza · Día de calendario 12. */
(()=>{'use strict';
if(window.SPM_ERECTION_DAY5_BRIDGE)return;
const original=window.SPM_ERECTION_PRACTICE,ui=window.SPM_ED_DAY5_TOUCH;
if(!original||!ui)return;
const oldOpen=original.open.bind(original),oldPause=original.pause.bind(original),oldStop=original.stop.bind(original);
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
const scope=c=>c&&typeof c.userId==='string'&&c.userId&&typeof c.planId==='string'&&c.planId?c.userId+':'+c.planId:'';
const assignment=c=>{try{return window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(a=>a.id==='main')}catch{return null}};
function permitted(c,s){
 if(!c||c.primary!=='erection'||Number(c.day)!==12||scope(c)!==s)return false;
 const a=assignment(c);if(a?.id!=='main'||a.kind!=='erection')return false;
 if(window.SPM_DAILY_PRACTICE?.restricted?.(c,a))return false;
 const active=window.SPM_DAILY_PRACTICE?.active?.();
 if(active&&(active.id!=='main'||Number(active.day)!==12||active.scope!==s))return false;
 return true;
}
async function open(a){
 const c=ctx();
 if(c?.primary!=='erection'||Number(c.day)!==12||a?.id!=='main'||a.kind!=='erection')return oldOpen(a);
 const s=scope(c),host=document.getElementById('spmDailyWorkspace');
 if(!s||!host?.isConnected||!permitted(c,s))return false;
 oldStop();ui.stop();host.innerHTML='<p class="spm-erection-status" role="status">Recuperando tu mapa personal…</p>';
 let prior={};
 try{
  const rows=await window.SPM_DAILY_RECORDS.read(s,12);
  if(!permitted(ctx(),s)||!host.isConnected)return false;
  const saved=rows?.main;
  if(saved&&typeof saved==='object'&&!Array.isArray(saved)&&saved.erectionLesson===5&&Number(saved.day)===12)prior={...saved};
 }catch{
  if(permitted(ctx(),s)&&host.isConnected)host.innerHTML='<p role="alert">No se pudo recuperar tu registro. Vuelve a Hoy y reintenta; tus datos no se han modificado.</p>';
  return false;
 }
 if(!permitted(ctx(),s))return false;
 return ui.mount({host,prior,scope:s,calendarDay:12,valid:()=>permitted(ctx(),s)&&host.isConnected,
  save:record=>window.SPM_DAILY_PRACTICE.saveActivity('main',{...record,day:12,erectionLesson:5},s,12),
  onBack:()=>window.SPM_DAILY_PRACTICE?.open?.()});
}
function pause(){ui.pause();oldPause()}
function stop(){ui.stop();oldStop()}
window.SPM_ERECTION_PRACTICE={...original,open,pause,stop};
window.SPM_ERECTION_DAY5_BRIDGE={open,pause,stop};
})();
