/* Adaptador SPM · únicamente Erección y firmeza, día 4, ruta principal de Hoy. */
(()=>{'use strict';
if(window.SPM_ERECTION_DAY4_BRIDGE)return;
const original=window.SPM_ERECTION_PRACTICE,ui=window.SPM_ED_DAY4_TOUCH;
if(!original||!ui)return;
const oldOpen=original.open.bind(original),oldPause=original.pause.bind(original),oldStop=original.stop.bind(original);
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
const scope=c=>c&&typeof c.userId==='string'&&c.userId&&typeof c.planId==='string'&&c.planId?c.userId+':'+c.planId:'';
const assignment=c=>{try{return window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(a=>a.id==='main')}catch{return null}};
function permitted(c,s){
 if(!c||c.primary!=='erection'||Number(c.day)!==9||scope(c)!==s)return false;
 const a=assignment(c);if(a?.id!=='main'||a.kind!=='erection')return false;
 if(window.SPM_DAILY_PRACTICE?.restricted?.(c,a))return false;
 const active=window.SPM_DAILY_PRACTICE?.active?.();
 if(active&&(active.id!=='main'||Number(active.day)!==9||active.scope!==s))return false;
 return true;
}
async function open(a){
 const c=ctx();
 if(c?.primary!=='erection'||Number(c.day)!==9||a?.id!=='main'||a.kind!=='erection')return oldOpen(a);
 const s=scope(c),host=document.getElementById('spmDailyWorkspace');
 if(!s||!host?.isConnected||!permitted(c,s))return false;
 oldStop();ui.stop();host.innerHTML='<p class="spm-erection-status" role="status">Recuperando tus respuestas del día 4…</p>';
 let prior={};
 try{
  const rows=await window.SPM_DAILY_RECORDS.read(s,9);
  if(!permitted(ctx(),s)||!host.isConnected)return false;
  if(rows?.main&&typeof rows.main==='object'&&!Array.isArray(rows.main)&&rows.main.erectionLesson===4&&Number(rows.main.day)===9)prior={...rows.main};
 }catch{
  if(permitted(ctx(),s)&&host.isConnected)host.innerHTML='<p role="alert">No fue posible recuperar el registro. Vuelve a Hoy y reintenta; no se han cambiado tus datos.</p>';
  return false;
 }
 if(!permitted(ctx(),s))return false;
 return ui.mount({host,prior,scope:s,calendarDay:9,valid:()=>permitted(ctx(),s)&&host.isConnected,
  save:record=>window.SPM_DAILY_PRACTICE.saveActivity('main',{...record,day:9,erectionLesson:4},s,9),
  onBack:()=>window.SPM_DAILY_PRACTICE?.open?.()});
}
function pause(){ui.pause();oldPause()}
function stop(){ui.stop();oldStop()}
window.SPM_ERECTION_PRACTICE={...original,open,pause,stop};
window.SPM_ERECTION_DAY4_BRIDGE={open,pause,stop};
})();