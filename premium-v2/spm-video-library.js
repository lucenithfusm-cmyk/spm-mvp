(()=>{
'use strict';
const videos=[
 {key:'breathing-guided',title:'Respiración diafragmática guiada',tag:'Ejercicio guiado',duration:'1:03',url:'https://app.heygen.com/videos/7a3895fe421a4c8b89ae3faed2fd5dec',desc:'Sesión guiada para aprender postura, respiración abdominal y ritmo respiratorio.'},
 {key:'anxiety-regulation',title:'Respiración para regulación de ansiedad',tag:'Recurso complementario',duration:'0:43',url:'https://app.heygen.com/videos/5fcadd0db6d3490ab4e80fef1b571d02',desc:'Recurso breve para reconocer tensión, relajar hombros y recuperar una respiración más tranquila.'},
 {key:'performance-anxiety',title:'Ansiedad de rendimiento: salir del modo examen',tag:'Preparación mental',duration:'1:17',url:'https://app.heygen.com/videos/9064b60b7c5a634e09d4da499b76a372',desc:'Ayuda a reducir la autoevaluación constante y volver a la presencia, la respiración y las sensaciones.'},
 {key:'mental-preparation',title:'Preparación mental antes del encuentro íntimo',tag:'Preparación mental',duration:'1:15',url:'https://app.heygen.com/videos/c2fbaa3a7c75fd5ef4aefc68523ea3db',desc:'Rutina breve para disminuir anticipación, tensión y presión de rendimiento antes del encuentro íntimo.'},
 {key:'anticipatory-failure',title:'Dejar de anticipar el fracaso',tag:'Entrenamiento mental',duration:'1:16',url:'https://app.heygen.com/videos/c9fa1abe3a0d70b67f3bd63dbcfc3a55',desc:'Recurso para reconocer pensamientos anticipatorios y recuperar una respuesta más centrada en el presente.'},
 {key:'sensory-focus',title:'Foco sensorial: volver a las sensaciones',tag:'Foco sensorial',duration:'1:09',url:'https://app.heygen.com/videos/12b658334a357f4ecf6668c8c3ee8dba',desc:'Entrena la atención en sensaciones corporales agradables sin convertir la experiencia en una evaluación del rendimiento.'},
 {key:'partner-communication',title:'Comunicación con la pareja sin presión',tag:'Comunicación',duration:'1:11',url:'https://app.heygen.com/videos/8f13d09e69075f14c363d849a0332b1e',desc:'Orientación para hablar de la experiencia sexual reduciendo presión, expectativas rígidas y sensación de examen.'}
];
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function card(v){return `<article class="spmVideoCard"><div><span class="stepBadge">${esc(v.tag)}</span><h3>${esc(v.title)}</h3><p class="micro">${esc(v.desc)}</p><small>${esc(v.duration)}</small></div><a class="btn pri" href="${v.url}" target="_blank" rel="noopener">Ver video</a></article>`;}
function pickVideo(text){
 const t=(text||'').toLowerCase();
 if(t.includes('foco sensorial')||t.includes('sensaciones')) return videos.find(v=>v.key==='sensory-focus');
 if(t.includes('comunicación')||t.includes('comunicacion')||t.includes('pareja')) return videos.find(v=>v.key==='partner-communication');
 if(t.includes('anticip')||t.includes('fracaso')) return videos.find(v=>v.key==='anticipatory-failure');
 if(t.includes('antes del encuentro')||t.includes('preparación mental')||t.includes('preparacion mental')) return videos.find(v=>v.key==='mental-preparation');
 if(t.includes('ansiedad de rendimiento')||t.includes('modo examen')) return videos.find(v=>v.key==='performance-anxiety');
 if(t.includes('ansiedad')||t.includes('regulación')||t.includes('regulacion')) return videos.find(v=>v.key==='anxiety-regulation');
 if(t.includes('respiración')||t.includes('respiracion')) return videos.find(v=>v.key==='breathing-guided');
 return null;
}
function mountLibrary(){
 const plan=document.getElementById('plan'); if(!plan||document.getElementById('spmVideoLibrary'))return;
 const box=document.createElement('div'); box.className='card'; box.id='spmVideoLibrary';
 box.innerHTML=`<span class="stepBadge">Biblioteca SPM</span><h2>Videos guiados</h2><p class="micro">Usa estos recursos cuando aparezcan dentro de tu ruta. Puedes volver a reproducirlos cuando necesites recordar la técnica.</p><div class="spmVideoGrid">${videos.map(card).join('')}</div>`;
 plan.appendChild(box);
}
function decorateDays(){
 document.querySelectorAll('.dayCard').forEach(c=>{
   if(c.dataset.spmVideoDecorated)return;
   const v=pickVideo(c.textContent||'');
   if(!v)return;
   c.dataset.spmVideoDecorated='1';
   const a=document.createElement('a'); a.className='btn sec sm'; a.href=v.url; a.target='_blank'; a.rel='noopener'; a.textContent='Ver video SPM'; c.appendChild(a);
 });
}
const style=document.createElement('style');style.textContent='.spmVideoGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:16px}.spmVideoCard{border:1px solid var(--line);border-radius:16px;padding:16px;background:#08171b;display:flex;flex-direction:column;justify-content:space-between;gap:14px}.spmVideoCard h3{margin:10px 0 6px}.spmVideoCard .btn{align-self:flex-start;text-decoration:none}';document.head.appendChild(style);
function run(){mountLibrary();decorateDays();}
document.addEventListener('DOMContentLoaded',()=>{run();new MutationObserver(run).observe(document.body,{childList:true,subtree:true});});
window.SPM_VIDEO_LIBRARY=videos;
})();