(()=>{'use strict';
if(window.SPM_VISUAL_CARDS_STAGING_V6)return;window.SPM_VISUAL_CARDS_STAGING_V6=true;
const ROOT='assets/',ACT=ROOT+'activity/cards-v1/',NUT=ROOT+'nutrition/cards-v1/';
const activityFiles={walk:'01-caminata-cardio-moderado.jpg',strength:'02-entrenamiento-fuerza.jpg',mobility:'03-movilidad-flexibilidad.jpg',kegel:'06-piso-pelvico-kegel.jpg',swim:'04-actividad-en-el-agua.jpg',dance:'05-bailar-y-moverte.jpg'};
const nutritionFiles={vegetables:'02-verduras.jpg',fruit:'03-frutas.jpg',protein:'04-proteinas-saludables.jpg',pulses:'05-legumbres-e-integrales.jpg',fats:'06-grasas-insaturadas.jpg',limit:'07-alimentos-y-bebidas-a-limitar.jpg'};
function activityArt(el,id){const file=activityFiles[id];if(!file)return;
 if(el.dataset.educationalOnly==='true'){
  const a=window.SPM_RESOURCE_CONTENT?.activities.find(x=>x.id===id);
  if(!a||!window.SPM_RESOURCES?.movementVisual)return;
  el.querySelectorAll(':scope > svg,:scope > .spm-activity-v4').forEach(x=>x.remove());
  if(!el.querySelector(':scope > .sr-move-education-visual'))el.insertAdjacentHTML('afterbegin',window.SPM_RESOURCES.movementVisual(a,true));
  return;
 }
 el.querySelectorAll(':scope > svg,:scope > .spm-motion-avatar,:scope > .spm-ap2-visual,:scope > .spm-activity-photo,:scope > .spm-activity-verified-v2,:scope > .spm-activity-v3').forEach(x=>x.remove());let v=el.querySelector(':scope > .spm-activity-v4');if(!v){v=document.createElement('img');v.className='spm-activity-v4';v.alt=(el.textContent||'Actividad física').trim();v.loading='lazy';el.prepend(v)}const src=ACT+file+'?v=20261001-oasis1';if(v.getAttribute('src')!==src)v.setAttribute('src',src)}
function foodArt(el,id){const file=nutritionFiles[id];if(!file)return;el.querySelectorAll(':scope > svg,:scope > .sr-food-art,:scope > .spm-food-photo,:scope > .spm-food-premium-crop,:scope > .spm-food-verified-v2,:scope > .spm-food-v3,:scope > .spm-food-v4').forEach(x=>x.remove());let v=el.querySelector(':scope > .spm-food-card-v5');if(!v){v=document.createElement('img');v.className='spm-food-card-v5';v.alt=(el.textContent||'Nutrición').trim();v.loading='lazy';el.prepend(v)}const src=NUT+file+'?v=20261001-oasis1';if(v.getAttribute('src')!==src)v.setAttribute('src',src)}
function scan(){document.querySelectorAll('.sr-dialog .sr-nut-grid button[data-food]').forEach(el=>foodArt(el,el.dataset.food));document.querySelectorAll('.sr-dialog button[data-activity]').forEach(el=>activityArt(el,el.dataset.activity))}
const s=document.createElement('style');s.textContent='.spm-food-card-v5,.spm-activity-v4{display:block!important;width:100%!important;height:auto!important;object-fit:contain!important;background:#10262d!important;border:1px solid #31515a!important;border-radius:16px!important;box-shadow:0 9px 22px rgba(0,0,0,.24)!important;margin-bottom:9px!important}.sr-nut-grid button[data-food],.sr-dialog button[data-activity]{display:flex!important;flex-direction:column!important;overflow:hidden!important;min-height:0!important}.sr-nut-grid button[data-food]>b,.sr-dialog button[data-activity]>b{display:block!important;width:100%!important}.sr-dialog button[data-activity][hidden]{display:none!important}';document.head.appendChild(s);
new MutationObserver(()=>requestAnimationFrame(scan)).observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('click',()=>setTimeout(scan,20),true);setTimeout(scan,0);setTimeout(scan,250);
})();