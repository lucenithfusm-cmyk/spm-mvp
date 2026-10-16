(()=>{
'use strict';
const M=window.SPM_MODULES||{};
const A=window.SPM_DAILY_AGENDA_V2||{};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
let currentDay=1;
let syncing=false;
function clamp(v){return Math.max(1,Math.min(28,Number(v)||1))}
function userKey(){const u=($('#who')?.textContent||'usuario').trim().toLowerCase();return 'spm_daily_progress_v3_'+u}
function loadState(){try{return JSON.parse(localStorage.getItem(userKey())||'null')}catch(_){return null}}
function saveState(s){localStorage.setItem(userKey(),JSON.stringify(s))}
function calendarDay(){
 let s=loadState();const today=new Date();const dateKey=`${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
 if(!s){s={start:dateKey,day:1,last:dateKey};saveState(s);return 1}
 const start=new Date(s.start+'T00:00:00'),now=new Date(dateKey+'T00:00:00');const elapsed=Math.max(0,Math.floor((now-start)/86400000));
 s.day=clamp(Math.max(s.day||1,elapsed+1));s.last=dateKey;saveState(s);return s.day;
}
function visibleCompletedFloor(){
 const done=$$('.dayCard').filter(c=>/Completado ✓/.test(c.textContent||'')).map(c=>Number($('.dayNum',c)?.textContent||0)).filter(Boolean);
 return done.length?clamp(Math.max(...done)+1):1;
}
function phaseFor(day){return Math.ceil(clamp(day)/7)}
function renderHero(){
 const panel=$('#plan');if(!panel)return;let hero=$('#spmTodayHero',panel);if(!hero){hero=document.createElement('div');hero.id='spmTodayHero';hero.className='card spm-today-hero';panel.prepend(hero)}
 const assigned=window.SPM_DAILY_PRACTICE?.assignments?.(),baseDay=M.days?.find(x=>x.d===currentDay)||{},day=assigned?.length?{title_es:assigned[0].title,learn_es:'Abre tus actividades para comenzar la sesión asignada a tu programa.'}:baseDay,items=assigned?.length?assigned.map(x=>x.title):window.SPM_DAILY_AGENDA_ITEMS?.(currentDay)||A[currentDay]||[];
 const signature=JSON.stringify([currentDay,day.title_es,day.learn_es,items]);if(hero.dataset.signature===signature)return;hero.dataset.signature=signature;
 hero.innerHTML=`<div class="spm-today-kicker">HOY · DÍA ${currentDay} DE 28</div><button type="button" class="spm-daily-entry" id="spmGoToday" aria-label="Abrir actividades de hoy · Día ${currentDay} de 28" aria-describedby="spmDailyEntryHint"><span class="spm-daily-entry-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="m9 5 11 7-11 7Z" fill="currentColor"/></svg></span><span class="spm-daily-entry-copy"><span class="spm-daily-entry-kicker">Empieza aquí cada día</span><strong>Tu práctica de hoy</strong><span class="spm-daily-entry-detail">Día ${currentDay} de 28 · Abrir actividades</span></span><span class="spm-daily-entry-arrow" aria-hidden="true">↗</span></button><p class="spm-daily-entry-hint" id="spmDailyEntryHint">Este es tu punto de entrada diario. Pulsa para ir a la práctica que te corresponde hoy.</p><h2>${day.title_es||'Tu entrenamiento de hoy'}</h2><p>${day.learn_es||'Continúa con la práctica asignada a tu etapa actual.'}</p><div class="spm-today-list">${items.map((x,i)=>`<div><b>${i+1}</b><span>${x}</span></div>`).join('')}</div>`;
 $('#spmGoToday',hero)?.addEventListener('click',()=>openToday(true));
}
function selectPhaseOnce(){
 const target=phaseFor(currentDay),tabs=$$('.phaseBtn');
 if(tabs[target-1]&&!tabs[target-1].classList.contains('on'))tabs[target-1].click();
}
function highlightToday(scroll=false){
 const cards=$$('.dayCard');cards.forEach(c=>{c.classList.remove('spm-current-day');$('.spm-current-chip',c)?.remove()});
 const card=cards.find(c=>Number($('.dayNum',c)?.textContent||0)===currentDay);if(!card)return;
 card.classList.add('spm-current-day');const top=$('.dayTop',card);if(top&&!$('.spm-current-chip',top))top.insertAdjacentHTML('beforeend','<span class="spm-current-chip">HOY</span>');
 if(!card.classList.contains('open'))top?.click();if(scroll){card.style.scrollMarginTop=(Math.ceil($('.top')?.getBoundingClientRect().height||0)+16)+'px';card.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});card.tabIndex=-1;card.focus({preventScroll:true});}
}
function openToday(scroll=false){if(window.SPM_DAILY_PRACTICE){window.SPM_DAILY_PRACTICE.open({focus:scroll});return;}selectPhaseOnce();setTimeout(()=>highlightToday(scroll),180)}
function sync({open=false}={}){
 if(syncing)return;syncing=true;
 try{
  const c=calendarDay(),f=visibleCompletedFloor(),saved=Number(window.SPM_RESOURCE_CONTEXT?.()?.day)||1;currentDay=clamp(window.SPM_RESOURCE_CONTEXT?.()?saved:Math.max(c,f));const s=loadState()||{};if(currentDay>(s.day||1)){s.day=currentDay;saveState(s)}
  window.SPM_CURRENT_DAY=currentDay;document.documentElement.dataset.spmCurrentDay=String(currentDay);renderHero();
  if(open){if(!window.SPM_DAILY_PRACTICE)openToday(false);requestAnimationFrame(()=>{const hero=$('#spmTodayHero');if(hero){hero.style.scrollMarginTop=(Math.ceil($('.top')?.getBoundingClientRect().height||0)+16)+'px';hero.scrollIntoView({behavior:'instant',block:'start'});}$('#spmGoToday')?.focus({preventScroll:true});});}
 }finally{syncing=false}
}
const style=document.createElement('style');style.textContent=`.spm-today-hero{border:1px solid rgba(112,221,194,.38)!important;background:linear-gradient(145deg,rgba(112,221,194,.11),rgba(255,255,255,.02))!important}.spm-today-kicker{font-size:12px;font-weight:950;letter-spacing:.13em;color:#70ddc2;margin-bottom:7px}.spm-today-hero h2{margin:0 0 8px}.spm-today-hero p{color:var(--muted);line-height:1.55}.spm-today-list{display:grid;gap:8px;margin:14px 0 16px}.spm-today-list>div{display:grid;grid-template-columns:30px 1fr;gap:9px;align-items:center;padding:9px 10px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.025)}.spm-today-list b{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#1e766e;color:#fff}.spm-current-day{outline:2px solid rgba(112,221,194,.8);box-shadow:0 0 0 5px rgba(112,221,194,.07);scroll-margin-top:100px}.spm-current-chip{margin-left:auto;background:#70ddc2;color:#05251f;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:950}
.spm-daily-entry{position:relative;isolation:isolate;display:flex;align-items:center;gap:16px;width:100%;min-height:114px;margin:16px 0 12px;padding:22px 24px;border:1px solid #71e7c4;border-radius:20px;background:linear-gradient(120deg,#134a44,#0a292f 75%);color:#f4fffa;text-align:left;font:inherit;cursor:pointer;box-shadow:0 0 0 4px #70ddc214,0 12px 32px #0004}
.spm-daily-entry::before{content:'';position:absolute;z-index:-1;inset:-1px;border-radius:inherit;pointer-events:none;box-shadow:0 0 0 5px #71e7c42b,0 0 30px #70ddc254,inset 0 0 20px #70ddc21c;animation:spmDailyGlow 3.2s ease-in-out infinite}
.spm-daily-entry-icon{display:grid;place-items:center;flex:0 0 48px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#f0dba2,#cba557);color:#102d2c;box-shadow:0 4px 18px #dec58b30}.spm-daily-entry-copy{display:grid;gap:5px;min-width:0}.spm-daily-entry-kicker{font-size:11px;font-weight:850;letter-spacing:.13em;text-transform:uppercase;color:#e8cf93}.spm-daily-entry strong{font-size:clamp(21px,3.3vw,29px);line-height:1.15;letter-spacing:-.025em}.spm-daily-entry-detail{font-size:13px;line-height:1.4;color:#c9e8e0}.spm-daily-entry-arrow{margin-left:auto;font-size:26px;color:#91ebd0}.spm-daily-entry:hover{border-color:#fff0c1;background:linear-gradient(120deg,#195b51,#10393d 75%)}.spm-daily-entry:focus-visible{outline:3px solid #f1d996;outline-offset:6px}.spm-today-hero .spm-daily-entry-hint{font-size:12px;margin:0 0 22px;max-width:60ch}.spm-daily-entry:active{background:#15443f}
@keyframes spmDailyGlow{0%,100%{opacity:.25}50%{opacity:1}}@media(max-width:480px){.spm-daily-entry{gap:12px;padding:18px 14px}.spm-daily-entry-icon{flex-basis:40px;width:40px;height:40px}.spm-daily-entry-arrow{font-size:22px}.spm-daily-entry-kicker{font-size:10px;letter-spacing:.1em}.spm-daily-entry-detail{font-size:12px}}@media(prefers-reduced-motion:reduce){.spm-daily-entry::before{animation:none;opacity:.7}}`;document.head.appendChild(style);
document.addEventListener('click',e=>{
 if(e.target.closest('#navPlan,#goPlan'))setTimeout(()=>sync({open:true}),350);
 if(e.target.closest('.doneBtn'))setTimeout(()=>sync({open:false}),450);
 if(e.target.closest('.phaseBtn'))setTimeout(()=>highlightToday(false),180);
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync({open:false})});
window.addEventListener('spm:resourcecontext',()=>sync({open:false}));
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>sync({open:false}),800),{once:true});
setTimeout(()=>sync({open:false}),1500);
})();
