(()=>{
'use strict';
const PROFILE_SELECTOR='#profileTitle';
function isEpRoute(){
 const title=(document.querySelector(PROFILE_SELECTOR)?.textContent||'').trim();
 return /Control eyaculatorio/i.test(title);
}
function pruneWrongRoute(){
 if(isEpRoute()) return;
 document.querySelectorAll('.ecLaunch').forEach(b=>b.remove());
 document.querySelectorAll('.dayCard').forEach(c=>{delete c.dataset.ecEnhanced});
}
function restoreEpButtons(){
 if(!isEpRoute()) return;
 const api=window.SPM_EJACULATORY_CONTROL;
 if(!api?.schedule) return;
 document.querySelectorAll('.dayCard').forEach(card=>{
   const d=Number(card.querySelector('.dayNum')?.textContent||0), meta=api.schedule[d];
   if(!meta||card.querySelector('.ecLaunch')) return;
   const area=card.querySelector('.interactive'); if(!area) return;
   const b=document.createElement('button');
   b.type='button'; b.className='btn pri ecLaunch';
   const names={startstop:'Start/Stop',squeeze:'Stop–Squeeze',combined:'Técnica combinada'};
   b.textContent=`▶ Control eyaculatorio · S${meta.week}.${meta.session} · ${names[meta.tech]||meta.tech}`;
   b.onclick=e=>{e.stopPropagation();api.open(d)};
   area.prepend(b);
 });
}
function handleTechniqueIntro(){
 const teach=document.getElementById('ecTeach');
 if(!teach?.classList.contains('on')) return;
 const tech=(document.getElementById('ecTechTitle')?.textContent||'').trim();
 if(!tech) return;
 const key='spm_ec_tech_intro_'+tech.toLowerCase().replace(/[^a-z0-9]+/g,'_');
 if(localStorage.getItem(key)==='1') return;
 const btn=document.getElementById('ecTechAudio');
 if(!btn) return;
 localStorage.setItem(key,'1');
 setTimeout(()=>btn.click(),180);
}
function sync(){pruneWrongRoute();restoreEpButtons();handleTechniqueIntro()}
new MutationObserver(sync).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('DOMContentLoaded',sync);
setTimeout(sync,500);
})();