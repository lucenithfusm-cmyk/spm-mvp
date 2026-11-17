/* SPM: avisos centrados para respuestas requeridas, sin acceder a datos clínicos. */
(()=>{'use strict';
if(window.SPM_ERECTION_TOUCH_VIEW)return;
function resetScroll(host){const view=host?.querySelector?.('.spm-er-fullscreen');if(view)view.scrollTop=0}
function warn(host,message){
 const root=host?.querySelector?.('.spm-er-fullscreen');
 if(!root||!root.isConnected)return false;
 root.querySelector('[data-spm-er-alert]')?.remove();
 const previous=document.activeElement,overlay=document.createElement('div');
 overlay.className='spm-er-alert-layer';overlay.setAttribute('data-spm-er-alert','');
 overlay.innerHTML='<section class="spm-er-alert-card" role="alertdialog" aria-modal="true" aria-label="Selecciona una opción" aria-describedby="spm-er-alert-message"><span class="spm-er-alert-symbol" aria-hidden="true">!</span><strong>Selecciona una opción</strong><p id="spm-er-alert-message"></p><button type="button" data-spm-er-close>Entendido</button></section>';
 overlay.querySelector('#spm-er-alert-message').textContent=String(message||'Selecciona una opción para continuar.');
 const close=()=>{if(!overlay.isConnected)return;overlay.remove();if(previous?.isConnected&&typeof previous.focus==='function')previous.focus({preventScroll:true})};
 const button=overlay.querySelector('[data-spm-er-close]');
 button.addEventListener('click',close);
 overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
 overlay.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close()}if(event.key==='Tab'){event.preventDefault();button.focus({preventScroll:true})}});
 root.appendChild(overlay);button.focus({preventScroll:true});return true;
}
window.SPM_ERECTION_TOUCH_VIEW=Object.freeze({warn,resetScroll});
})();
