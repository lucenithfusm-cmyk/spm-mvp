(()=>{
'use strict';
const M=window.SPM_MODULES||{};
const agenda={
1:['Línea de base SPM','Respiración de regulación','Guía de bienestar integral'],
2:['Respiración 4/6','Mapa de contexto sexual','Bienestar: sueño y estrés'],
3:['Respiración guiada','Conciencia corporal','Guía de bienestar integral'],
4:['Respiración de regulación','Atención sin examen','Relajación corporal'],
5:['Mapa de facilitadores e inhibidores','Respiración breve','Bienestar integral'],
6:['Piso pélvico · identificación y relajación','Respiración diafragmática','Registro de sensaciones'],
7:['Revisión semanal','Respiración breve','Objetivo de bienestar para Semana 2'],
8:['Habilidad principal según tu perfil','Respiración de regulación','Bienestar integral'],
9:['Escala de excitación 0–10','Respiración lenta','Registro de control'],
10:['Habilidad principal · progresión','Respiración diafragmática','Microacción cardiometabólica'],
11:['Protocolo de recuperación','Respiración de regulación','Confianza sexual'],
12:['Entrenamiento dirigido por perfil','Piso pélvico si corresponde','Bienestar integral'],
13:['Confianza basada en evidencia','Respiración breve','Registro de progreso'],
14:['Revisión semanal','Recuperación activa','Objetivo de bienestar para Semana 3'],
15:['Transferencia gradual','Respiración de regulación','Preparación mental'],
16:['Focalización sensorial I','Respiración diafragmática','Bienestar integral'],
17:['Control de ritmo / Start–Stop si corresponde','Respiración breve','Guía cardioprotectora'],
18:['Comunicación que reduce presión','Regulación respiratoria','Bienestar mental'],
19:['Focalización sensorial II','Piso pélvico si corresponde','Registro de presencia'],
20:['Plan para una experiencia sexual','Respiración de regulación','Hábitos protectores'],
21:['Revisión semanal','Práctica principal del perfil','Recuperación y bienestar'],
22:['Consolidación de habilidad principal','Respiración breve','Registro de confianza'],
23:['Flexibilidad ante variaciones','Regulación corporal','Bienestar integral'],
24:['Práctica dirigida por perfil','Piso pélvico o control eyaculatorio según ruta','Respiración'],
25:['Aplicación en contexto real','Respiración de regulación','Confianza y presencia'],
26:['Repetición de la técnica más útil','Recuperación activa','Hábitos protectores'],
27:['Preparación para reevaluación','Práctica breve favorita','Bienestar integral'],
28:['Reevaluación SPM','Comparación de progreso','Plan de continuidad']
};
function currentDay(){
 const nums=[...document.querySelectorAll('.dayCard .dayNum')].map(x=>Number(x.textContent)).filter(Boolean);
 const completed=[...document.querySelectorAll('.dayCard')].filter(c=>/Completado/.test(c.textContent||'')).map(c=>Number(c.querySelector('.dayNum')?.textContent||0));
 return Math.min(28,Math.max(1,(completed.length?Math.max(...completed)+1:nums.length?Math.min(...nums):1)));
}
function decorate(){
 const grid=document.getElementById('dayGrid');if(!grid)return;
 grid.querySelectorAll('.dayCard').forEach(card=>{
  const d=Number(card.querySelector('.dayNum')?.textContent||0);if(!d||card.querySelector('.spm-agenda'))return;
  const items=agenda[d]||[];const box=document.createElement('div');box.className='spm-agenda';
  box.innerHTML=`<div class="spm-agenda-title">Tu agenda del día</div>${items.map((x,i)=>`<div class="spm-agenda-item"><b>${i+1}</b><span>${x}</span></div>`).join('')}`;
  const body=card.querySelector('.dayBody');if(body)body.insertBefore(box,body.firstChild);
 });
 const today=currentDay();const todayCard=[...grid.querySelectorAll('.dayCard')].find(c=>Number(c.querySelector('.dayNum')?.textContent||0)===today);
 if(todayCard){todayCard.classList.add('spm-today');todayCard.open=true;const top=todayCard.querySelector('.dayTop');if(top&&!top.querySelector('.spm-today-badge'))top.insertAdjacentHTML('beforeend','<span class="spm-today-badge">HOY</span>');}
}
const css=document.createElement('style');css.textContent=`
.spm-agenda{margin:0 0 14px;padding:14px;border:1px solid rgba(82,201,177,.35);border-radius:15px;background:linear-gradient(145deg,rgba(82,201,177,.10),rgba(255,255,255,.025))}.spm-agenda-title{font-weight:900;color:#74dfc7;margin-bottom:9px}.spm-agenda-item{display:grid;grid-template-columns:28px 1fr;align-items:center;gap:9px;padding:7px 0;color:#dcebea}.spm-agenda-item b{display:grid;place-items:center;width:25px;height:25px;border-radius:50%;background:#1e766e;color:white;font-size:12px}.spm-today{outline:2px solid rgba(112,221,194,.7);box-shadow:0 0 0 5px rgba(112,221,194,.07)}.spm-today-badge{margin-left:auto;background:#70ddc2;color:#05251f;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:950}
`;document.head.appendChild(css);
const grid=document.getElementById('dayGrid');if(grid)new MutationObserver(()=>requestAnimationFrame(decorate)).observe(grid,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(decorate,250),{once:true});setTimeout(decorate,700);
window.SPM_DAILY_AGENDA_V2=agenda;
})();