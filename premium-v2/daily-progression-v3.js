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
 const day=M.days?.find(x=>x.d===currentDay)||{},items=A[currentDay]||[];
 hero.innerHTML=`<div class="spm-today-kicker">HOY · DÍA ${currentDay} DE 28</div><h2>${day.title_es||'Tu entrenamiento de hoy'}</h2><p>${day.learn_es||'Continúa con la práctica asignada a tu etapa actual.'}</p><div class="spm-today-list">${items.map((x,i)=>`<div><b>${i+1}</b><span>${x}</span></div>`).join('')}</div><button type="button" class="btn pri" id="spmGoToday">Abrir actividades de hoy</button>`;
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
 if(!card.classList.contains('open'))top?.click();if(scroll)card.scrollIntoView({behavior:'smooth',block:'start'});
}
function openToday(scroll=false){selectPhaseOnce();setTimeout(()=>highlightToday(scroll),180)}
function sync({open=false}={}){
 if(syncing)return;syncing=true;
 try{
  const c=calendarDay(),f=visibleCompletedFloor();currentDay=clamp(Math.max(c,f));const s=loadState()||{};if(currentDay>(s.day||1)){s.day=currentDay;saveState(s)}
  window.SPM_CURRENT_DAY=currentDay;document.documentElement.dataset.spmCurrentDay=String(currentDay);renderHero();
  if(open)openToday(false);
 }finally{syncing=false}
}
const style=document.createElement('style');style.textContent=`.spm-today-hero{border:1px solid rgba(112,221,194,.38)!important;background:linear-gradient(145deg,rgba(112,221,194,.11),rgba(255,255,255,.02))!important}.spm-today-kicker{font-size:12px;font-weight:950;letter-spacing:.13em;color:#70ddc2;margin-bottom:7px}.spm-today-hero h2{margin:0 0 8px}.spm-today-hero p{color:var(--muted);line-height:1.55}.spm-today-list{display:grid;gap:8px;margin:14px 0 16px}.spm-today-list>div{display:grid;grid-template-columns:30px 1fr;gap:9px;align-items:center;padding:9px 10px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.025)}.spm-today-list b{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#1e766e;color:#fff}.spm-current-day{outline:2px solid rgba(112,221,194,.8);box-shadow:0 0 0 5px rgba(112,221,194,.07)}.spm-current-chip{margin-left:auto;background:#70ddc2;color:#05251f;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:950}`;document.head.appendChild(style);
document.addEventListener('click',e=>{
 if(e.target.closest('#navPlan,#goPlan'))setTimeout(()=>sync({open:true}),350);
 if(e.target.closest('.doneBtn'))setTimeout(()=>sync({open:false}),450);
 if(e.target.closest('.phaseBtn'))setTimeout(()=>highlightToday(false),180);
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync({open:false})});
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>sync({open:false}),800),{once:true});
setTimeout(()=>sync({open:false}),1500);
})();