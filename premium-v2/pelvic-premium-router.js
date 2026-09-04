(()=>{
'use strict';

const pelvicSvg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 520" role="img" aria-label="Ilustración educativa del piso pélvico masculino">
<defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#eff8f5"/><stop offset="1" stop-color="#d9ece6"/></linearGradient><linearGradient id="body" x1="0" x2="1"><stop stop-color="#163f4a"/><stop offset="1" stop-color="#0a5960"/></linearGradient></defs>
<rect width="420" height="520" rx="28" fill="url(#bg)"/><circle cx="210" cy="82" r="45" fill="#d7b195"/>
<path d="M154 139c20-18 92-18 112 0 23 28 31 81 27 131-3 43-16 81-26 111H153c-10-30-23-68-26-111-4-50 4-103 27-131Z" fill="url(#body)"/>
<path d="M153 380h114l22 119h-55l-24-99-24 99h-55z" fill="#17343f"/><path d="M128 177c-22 43-34 89-36 136l31 3c7-45 18-84 37-116zM292 177c22 43 34 89 36 136l-31 3c-7-45-18-84-37-116z" fill="#d7b195"/>
<ellipse cx="210" cy="353" rx="76" ry="32" fill="#2db9a6" opacity=".24"/><path d="M152 350c21-17 95-17 116 0-15 24-38 37-58 37s-43-13-58-37Z" fill="#2db9a6" opacity=".88"/>
<path d="M210 410V365" stroke="#08706b" stroke-width="8" stroke-linecap="round"/><path d="m191 386 19-21 19 21" fill="none" stroke="#08706b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="105" y="20" width="210" height="34" rx="17" fill="#fff" opacity=".92"/><text x="210" y="43" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#075b58">Piso pélvico · control y relajación</text></svg>`;
const pelvicData='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(pelvicSvg);
window.SPM_TRAINING_IMAGES=Object.assign({},window.SPM_TRAINING_IMAGES||{},{pelvic:pelvicData});

if(!document.getElementById('pfiPremiumRouterStyle')){
 const style=document.createElement('style');
 style.id='pfiPremiumRouterStyle';
 style.textContent=`.pfi-mode-panel.pfi-premium-single{background:linear-gradient(145deg,#0b2028,#10353a);border-color:#38717a;padding:16px}.pfi-mode-panel.pfi-premium-single .pfi-mode-grid{grid-template-columns:1fr}.pfi-mode-panel.pfi-premium-single .pfi-guided-wrap{display:none!important}.pfi-mode-panel.pfi-premium-single .pfi-mode-head b{font-size:15px}.pfi-mode-panel.pfi-premium-single .pfi-mode-head span{max-width:720px}.pfi-mode-panel.pfi-premium-single .pfi-launch{min-height:56px;font-size:14px;background:linear-gradient(135deg,#7ce5c8,#4ccbd0);box-shadow:0 10px 24px rgba(53,191,198,.16)}.pfi-mode-panel.pfi-premium-single .pfi-recommended{display:none!important}.pfi-visual img,.pfi-mini-visual img{background:#edf7f4}`;
 document.head.appendChild(style);
}

function normalizePelvicCards(root=document){
 root.querySelectorAll('.dayCard').forEach(card=>{
  if(card.dataset.pfiPremiumNormalized==='1') return;
  const text=(card.textContent||'').toLowerCase();
  if(!/piso p[eé]lvico/.test(text)) return;
  const panel=card.querySelector('.pfi-mode-panel');
  if(!panel) return;
  panel.classList.add('pfi-premium-single');
  const head=panel.querySelector('.pfi-mode-head');
  if(head && head.dataset.pfiPremiumHead!=='1'){
   head.innerHTML='<div><b>Programa interactivo de piso pélvico</b><span>Recorre los 7 pasos en orden: aprende, escucha los audios, practica con temporizador y registra cómo te fue.</span></div>';
   head.dataset.pfiPremiumHead='1';
  }
  const launch=panel.querySelector('.pfi-launch');
  if(launch && launch.dataset.pfiPremiumLaunch!=='1'){
   launch.textContent='▶ Abrir módulo de piso pélvico · 7 pasos';
   launch.setAttribute('aria-label','Abrir programa interactivo de piso pélvico en 7 pasos');
   launch.dataset.pfiPremiumLaunch='1';
  }
  card.dataset.pfiPremiumNormalized='1';
 });
}

function repairOpenVisuals(root=document){
 root.querySelectorAll('.pfi-visual,.pfi-mini-visual').forEach(box=>{
  if(box.dataset.pfiVisualReady==='1') return;
  let img=box.querySelector('img');
  if(!img){
   img=document.createElement('img');
   img.alt='Ilustración educativa del piso pélvico masculino';
   img.src=pelvicData;
   box.prepend(img);
  }else if(!img.getAttribute('src')){
   img.src=pelvicData;
  }
  img.addEventListener('error',()=>{if(img.src!==pelvicData) img.src=pelvicData},{once:true});
  box.dataset.pfiVisualReady='1';
 });
}

let scheduled=false;
function run(root=document){normalizePelvicCards(root);repairOpenVisuals(root)}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;run()})}

document.addEventListener('DOMContentLoaded',schedule,{once:true});
const grid=document.getElementById('dayGrid');
if(grid)new MutationObserver(schedule).observe(grid,{childList:true,subtree:true});
const overlay=document.querySelector('.pfi-overlay');
if(overlay)new MutationObserver(schedule).observe(overlay,{childList:true,subtree:true});
setTimeout(schedule,250);setTimeout(schedule,800);

window.SPM_PELVIC_PREMIUM={image:pelvicData,refresh:schedule};
})();