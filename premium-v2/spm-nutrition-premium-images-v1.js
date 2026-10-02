(()=>{'use strict';
if(window.SPM_NUTRITION_PREMIUM_IMAGES_V2)return;window.SPM_NUTRITION_PREMIUM_IMAGES_V2=true;
const PLATE='assets/nutrition/plato-spm-final.jpg?v=20261002-wellness-final';
const lang=()=>window.SPM_LANGUAGE?.get?.()||window.SPM_LANG||'es';
const t=(es,en)=>lang()==='en'?en:es;
function plate(){
 const host=document.querySelector('.sr-dialog .sr-plate');
 if(!host||host.dataset.spmPlateFinal==='1')return;
 host.dataset.spmPlateFinal='1';
 host.classList.add('spm-plate-host');
 host.innerHTML=`<figure class="spm-plate-final"><img src="${PLATE}" alt="${t('Plato SPM: media porción de verduras, un cuarto de leguminosas o carbohidratos integrales y un cuarto de proteína','SPM Plate: half vegetables, one quarter pulses or whole-grain carbohydrates and one quarter protein')}" decoding="async"><figcaption>${t('Toca una sección del plato para explorar','Tap a section of the plate to explore')}</figcaption><button type="button" data-food="vegetables" class="hot veg" aria-label="${t('Explorar verduras','Explore vegetables')}"></button><button type="button" data-food="pulses" class="hot carb" aria-label="${t('Explorar leguminosas e integrales','Explore pulses and whole grains')}"></button><button type="button" data-food="protein" class="hot pro" aria-label="${t('Explorar proteínas','Explore protein')}"></button></figure>`;
}
function scan(){plate()}
const st=document.createElement('style');st.id='spmNutritionPremiumImagesV2CSS';st.textContent=`
.sr .sr-plate.spm-plate-host{display:block!important;width:100%!important;max-width:100%!important;aspect-ratio:auto!important;margin:12px 0 16px!important;padding:0!important;border:0!important;border-radius:0!important;overflow:visible!important;background:transparent!important}
.spm-plate-final{position:relative;width:100%;margin:0;border:1px solid rgba(112,221,194,.34);border-radius:22px;overflow:hidden;background:linear-gradient(145deg,#0b2028,#07151a);box-shadow:0 18px 42px rgba(0,0,0,.34)}
.spm-plate-final img{display:block;width:100%;height:auto;max-width:none;object-fit:contain;object-position:center;background:#07151a}
.spm-plate-final figcaption{position:absolute;left:14px;bottom:12px;z-index:3;padding:7px 10px;border-radius:999px;background:rgba(3,17,22,.84);backdrop-filter:blur(8px);color:#dff8f1;font-size:11px;font-weight:850;border:1px solid rgba(122,223,198,.28)}
.spm-plate-final .hot{position:absolute!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;min-height:0!important;box-shadow:none!important;opacity:.001;z-index:2}
.spm-plate-final .veg{left:0;top:21%;width:51%;height:62%}.spm-plate-final .carb{right:0;top:21%;width:49%;height:31%}.spm-plate-final .pro{right:0;top:52%;width:49%;height:31%}
.spm-plate-final .hot:focus-visible{opacity:1;outline:3px solid #8fe3d0;outline-offset:-5px;background:rgba(143,227,208,.12)!important}
@media(max-width:600px){.spm-plate-final{border-radius:18px}.spm-plate-final figcaption{left:9px;bottom:8px;right:9px;text-align:center}}
`;document.head.appendChild(st);
new MutationObserver(scan).observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('click',e=>{const hot=e.target.closest?.('.spm-plate-final [data-food]');if(!hot)return;e.preventDefault();const target=[...document.querySelectorAll('.sr-dialog .sr-grid [data-food]')].find(b=>b.dataset.food===hot.dataset.food);target?.click()},true);
window.addEventListener('spm:languagechange',()=>setTimeout(scan,0));setTimeout(scan,0);setTimeout(scan,250);
})();