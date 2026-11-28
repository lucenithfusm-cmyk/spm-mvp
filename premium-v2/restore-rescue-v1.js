(()=>{
'use strict';
// Only app-live may restore a signed-in program. A second client must not infer
// completed days from resource records or publish data from an expired session.
if(window.SPM_RESTORE_AUTHORITY_V3)return;
if(window.SPM_RESTORE_RESCUE_V2)return;
window.SPM_RESTORE_RESCUE_V2=true;
function showRecovery(){
 if(window.SPM_RESTORE_AUTHORITY_V3)return;
 const status=document.getElementById('status');if(!status)return;
 status.className='notice warn globalStatus';status.hidden=false;
 status.replaceChildren(document.createTextNode('No pudimos cargar la recuperación de tu programa. Recarga la página para consultar el avance guardado.'));
 const retry=document.createElement('button');retry.type='button';retry.className='btn sec';retry.textContent='Recargar mi programa';retry.onclick=()=>location.reload();status.append(retry);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showRecovery,{once:true});else showRecovery();
})();
