(()=>{
'use strict';
const ID='spmPriceCardV1';
const lang=()=>window.SPM_LANGUAGE?.get?.()||(String(window.SPM_LANG||document.documentElement.lang).toLowerCase().startsWith('en')?'en':'es');
const t=(es,en)=>lang()==='en'?en:es;
function mount(){const pay=document.querySelector('.spmPayment');if(!pay||document.getElementById(ID))return;const box=document.createElement('div');box.id=ID;box.innerHTML=`<small>${t('ACCESO AL CICLO INICIAL SPM','ACCESS TO THE SPM INITIAL CYCLE')}</small><strong>US$39</strong><span>${t('Pago único por el ciclo inicial de 28 días. Precio piloto sujeto a validación antes del lanzamiento comercial. La pasarela definitiva aún no está conectada.','One-time payment for the initial 28-day cycle. Pilot price subject to validation before commercial launch. The final payment gateway is not connected yet.')}</span>`;box.style.cssText='margin:16px 0;padding:17px;border-radius:17px;background:#0d262d;border:1px solid #21444b;display:grid;gap:5px';box.querySelector('small').style.cssText='color:#90a8ad;font-weight:800;letter-spacing:.06em';box.querySelector('strong').style.cssText='font-size:32px;color:#f5fbfa';box.querySelector('span').style.cssText='color:#91a7ac;font-size:12px;line-height:1.45';const steps=pay.querySelector('.spmSteps');pay.insertBefore(box,steps||pay.firstChild)}
const obs=new MutationObserver(mount);obs.observe(document.documentElement,{childList:true,subtree:true});mount();
})();
