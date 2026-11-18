/* Adaptador SPM · Erección y firmeza · Sesión 6, día 15.
 * Solo la práctica principal de este día; rutas y datos ajenos intactos.
 */
(()=>{'use strict';
if(window.SPM_ERECTION_DAY6_BRIDGE)return;
const original=window.SPM_ERECTION_PRACTICE,ui=window.SPM_ED_DAY6_TOUCH;
if(!original||!ui)return;
const oldOpen=original.open.bind(original),oldPause=original.pause.bind(original),oldStop=original.stop.bind(original);
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
const scope=c=>c&&typeof c.userId==='string'&&c.userId&&typeof c.planId==='string'&&c.planId?c.userId+':'+c.planId:'';
const assignment=c=>{try{return window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(a=>a.id==='main')}catch{return null}};
function permitted(c,s){
 if(!c||c.primary!=='erection'||Number(c.day)!==15||scope(c)!==s)return false;
 const a=assignment(c);if(a?.id!=='main'||a.kind!=='erection')return false;
 if(window.SPM_DAILY_PRACTICE?.restricted?.(c,a))return false;
 const active=window.SPM_DAILY_PRACTICE?.active?.();
 if(active&&(active.id!=='main'||Number(active.day)!==15||active.scope!==s))return false;
 return true;
}
async function open(a){
 const c=ctx();
 if(c?.primary!=='erection'||Number(c.day)!==15||a?.id!=='main'||a.kind!=='erection')return oldOpen(a);
 const s=scope(c),host=document.getElementById('spmDailyWorkspace');
 if(!s||!host?.isConnected||!permitted(c,s))return false;
 oldStop();ui.stop();host.innerHTML='<p class="spm-erection-status" role="status">Recuperando tus estímulos…</p>';
 let prior={};
 try{
  const rows=await window.SPM_DAILY_RECORDS.read(s,15);
  if(!permitted(ctx(),s)||!host.isConnected)return false;
  const saved=rows?.main;
  if(saved&&typeof saved==='object'&&!Array.isArray(saved)&&saved.erectionLesson===6&&Number(saved.day)===15)prior={...saved};
 }catch{
  if(permitted(ctx(),s)&&host.isConnected)host.innerHTML='<p role="alert">No se pudieron recuperar tus respuestas. Vuelve a Hoy y reintenta; tus datos están intactos.</p>';
  return false;
 }
 if(!permitted(ctx(),s))return false;
 return ui.mount({host,prior,scope:s,calendarDay:15,valid:()=>permitted(ctx(),s)&&host.isConnected,
  save:record=>window.SPM_DAILY_PRACTICE.saveActivity('main',{...record,day:15,erectionLesson:6},s,15),
  onBack:()=>window.SPM_DAILY_PRACTICE?.open?.()});
}
function pause(){ui.pause();oldPause()}
function stop(){ui.stop();oldStop()}
window.SPM_ERECTION_PRACTICE={...original,open,pause,stop};
window.SPM_ERECTION_DAY6_BRIDGE={open,pause,stop};
})();