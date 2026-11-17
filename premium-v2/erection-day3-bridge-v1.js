/* SPM · Erección y firmeza, día 3 · puente a Hoy exclusivamente.
 * No duplica la práctica ni se ejecuta en otros perfiles o días.
 */
(()=>{'use strict';
if(window.SPM_ERECTION_DAY3_BRIDGE)return;
const previous=window.SPM_ERECTION_PRACTICE,ui=window.SPM_ED_DAY3_TOUCH;
if(!previous||!ui)return;
const oldOpen=previous.open.bind(previous),oldPause=previous.pause.bind(previous),oldStop=previous.stop.bind(previous);
const context=()=>window.SPM_RESOURCE_CONTEXT?.();
const scoped=c=>c&&typeof c.userId==='string'&&c.userId&&typeof c.planId==='string'&&c.planId?c.userId+':'+c.planId:'';
const assignment=c=>{try{return window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(x=>x.id==='main')}catch{return null}};
function permitted(c,scope){
 if(!c||c.primary!=='erection'||Number(c.day)!==6||scoped(c)!==scope)return false;
 const a=assignment(c);if(a?.id!=='main'||a.kind!=='erection')return false;
 if(window.SPM_DAILY_PRACTICE?.restricted?.(c,a))return false;
 const active=window.SPM_DAILY_PRACTICE?.active?.();
 if(active&&(active.id!=='main'||active.scope!==scope||Number(active.day)!==6))return false;
 return true;
}
async function open(a){
 const c=context();if(c?.primary!=='erection'||Number(c.day)!==6||a?.id!=='main'||a.kind!=='erection')return oldOpen(a);
 const scope=scoped(c),host=document.getElementById('spmDailyWorkspace');
 if(!scope||!host?.isConnected||!permitted(c,scope))return false;
 oldStop();ui.stop();host.innerHTML='<p class="spm-erection-status" role="status">Recuperando tu práctica del día 3…</p>';
 let prior={};
 try{
  const rows=await window.SPM_DAILY_RECORDS.read(scope,6);
  if(!permitted(context(),scope)||!host.isConnected)return false;
  if(rows?.main&&typeof rows.main==='object'&&!Array.isArray(rows.main)&&rows.main.erectionLesson===3&&Number(rows.main.day)===6)prior={...rows.main};
 }catch{
  if(permitted(context(),scope)&&host.isConnected)host.innerHTML='<p role="alert">No fue posible recuperar tus respuestas. Vuelve a Hoy y reintenta; no hemos cambiado tu progreso.</p>';
  return false;
 }
 if(!permitted(context(),scope))return false;
 return ui.mount({host,scope,prior,calendarDay:6,
  valid:()=>permitted(context(),scope)&&host.isConnected,
  save:record=>window.SPM_DAILY_PRACTICE.saveActivity('main',{...record,day:6,erectionLesson:3},scope,6),
  onBack:()=>window.SPM_DAILY_PRACTICE?.open?.()});
}
function pause(){ui.pause();oldPause()}
function stop(){ui.stop();oldStop()}
window.SPM_ERECTION_PRACTICE={...previous,open,pause,stop};
window.SPM_ERECTION_DAY3_BRIDGE={open,pause,stop};
})();