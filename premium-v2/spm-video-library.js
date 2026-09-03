(()=>{
'use strict';
const videos=[
 {key:'breathing-guided',title:'Respiración diafragmática guiada',tag:'Ejercicio guiado',duration:'1:03',url:'https://app.heygen.com/videos/7a3895fe421a4c8b89ae3faed2fd5dec',desc:'Sesión guiada para aprender postura, respiración abdominal y ritmo respiratorio.'},
 {key:'anxiety-regulation',title:'Respiración para regulación de ansiedad',tag:'Recurso complementario',duration:'0:43',url:'https://app.heygen.com/videos/5fcadd0db6d3490ab4e80fef1b571d02',desc:'Recurso breve para reconocer tensión, relajar hombros y recuperar una respiración más tranquila.'}
];
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function card(v){return `<article class="spmVideoCard"><div><span class="stepBadge">${esc(v.tag)}</span><h3>${esc(v.title)}</h3><p class="micro">${esc(v.desc)}</p><small>${esc(v.duration)}</small></div><a class="btn pri" href="${v.url}" target="_blank" rel="noopener">Ver video</a></article>`;}
function mountLibrary(){
 const plan=document.getElementById('plan'); if(!plan||document.getElementById('spmVideoLibrary'))return;
 const box=document.createElement('div'); box.className='card'; box.id='spmVideoLibrary';
 box.innerHTML=`<span class="stepBadge">Biblioteca SPM</span><h2>Videos guiados</h2><p class="micro">Usa estos recursos cuando aparezcan dentro de tu ruta. Puedes volver a reproducirlos cuando necesites recordar la técnica.</p><div class="spmVideoGrid">${videos.map(card).join('')}</div>`;
 plan.appendChild(box);
}
function decorateDays(){
 document.querySelectorAll('.dayCard').forEach(c=>{
   if(c.dataset.spmVideoDecorated)return;
   const t=(c.textContent||'').toLowerCase(); let v=null;
   if(t.includes('respiración')||t.includes('respiracion')) v=videos[0];
   if(t.includes('ansiedad')||t.includes('regulación')||t.includes('regulacion')) v=videos[1];
   if(!v)return;
   c.dataset.spmVideoDecorated='1'; const a=document.createElement('a'); a.className='btn sec sm'; a.href=v.url; a.target='_blank'; a.rel='noopener'; a.textContent='Ver video SPM'; c.appendChild(a);
 });
}
const style=document.createElement('style');style.textContent='.spmVideoGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:16px}.spmVideoCard{border:1px solid var(--line);border-radius:16px;padding:16px;background:#08171b;display:flex;flex-direction:column;justify-content:space-between;gap:14px}.spmVideoCard h3{margin:10px 0 6px}.spmVideoCard .btn{align-self:flex-start;text-decoration:none}';document.head.appendChild(style);
function run(){mountLibrary();decorateDays();}
document.addEventListener('DOMContentLoaded',()=>{run();new MutationObserver(run).observe(document.body,{childList:true,subtree:true});});
window.SPM_VIDEO_LIBRARY=videos;
})();