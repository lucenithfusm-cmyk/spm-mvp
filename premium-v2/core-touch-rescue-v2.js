(()=>{
'use strict';
if(window.SPM_CORE_TOUCH_RESCUE_V2)return;
window.SPM_CORE_TOUCH_RESCUE_V2=true;

const style=document.createElement('style');
style.textContent=`#appScreen button,#authScreen button,#appScreen input,#appScreen select,#appScreen textarea{touch-action:manipulation!important;-webkit-tap-highlight-color:rgba(112,221,194,.18)}#appScreen button:not(:disabled),#authScreen button:not(:disabled){pointer-events:auto!important;position:relative;z-index:2}`;
document.head.appendChild(style);

const ROOTS=['#ageCard','#motiveCard','#quizCard','.side','#map','#coach','#progressPanel','#authScreen'];
let lastRescue=0;

function visible(el){
  if(!el||el.disabled)return false;
  const r=el.getBoundingClientRect();
  if(!r.width||!r.height)return false;
  const cs=getComputedStyle(el);
  return cs.display!=='none'&&cs.visibility!=='hidden'&&cs.pointerEvents!=='none';
}

function candidates(){
  return [...document.querySelectorAll(ROOTS.map(r=>`${r} button:not(:disabled),${r} [role="button"]`).join(','))].filter(visible);
}

function underPoint(x,y){
  const stack=document.elementsFromPoint?.(x,y)||[];
  for(const node of stack){
    const btn=node.closest?.('button:not(:disabled),[role="button"]');
    if(btn&&ROOTS.some(r=>btn.closest(r))&&visible(btn))return btn;
  }
  return candidates().find(el=>{const r=el.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom})||null;
}

function pointFromEvent(e){
  const t=e.changedTouches?.[0]||e.touches?.[0];
  if(t)return {x:t.clientX,y:t.clientY};
  if(Number.isFinite(e.clientX)&&Number.isFinite(e.clientY))return {x:e.clientX,y:e.clientY};
  return null;
}

function advanceAge(value){
  const age=document.getElementById('ageCard');
  const motive=document.getElementById('motiveCard');
  if(!age||!motive||age.hidden)return false;
  if(String(value)==='1'){
    age.hidden=true;
    motive.hidden=false;
    motive.scrollIntoView?.({block:'start',behavior:'auto'});
  }else{
    const status=document.getElementById('status');
    if(status){status.className='notice warn globalStatus';status.textContent='SPM Premium está disponible únicamente para mayores de 18 años.';status.hidden=false;}
  }
  return true;
}

function invoke(el,event){
  if(!el)return false;
  if(el.matches?.('[data-age]'))return advanceAge(el.dataset.age);
  try{
    if(typeof el.onclick==='function'){
      el.onclick.call(el,event);
      return true;
    }
    el.click?.();
    return true;
  }catch(err){console.error('SPM core interaction rescue',err);return false;}
}

function rescue(e){
  const p=pointFromEvent(e);if(!p)return;
  const el=underPoint(p.x,p.y);if(!el)return;
  if(invoke(el,e)){
    lastRescue=Date.now();
    if(e.cancelable)e.preventDefault();
    e.stopImmediatePropagation?.();
  }
}

// Capture all major interaction paths. This also covers laptop/desktop tests.
window.addEventListener('touchend',rescue,{capture:true,passive:false});
window.addEventListener('pointerup',rescue,{capture:true,passive:false});
window.addEventListener('click',e=>{
  const ageBtn=e.target?.closest?.('[data-age]');
  if(ageBtn){
    if(advanceAge(ageBtn.dataset.age)){
      if(e.cancelable)e.preventDefault();
      e.stopImmediatePropagation?.();
      return;
    }
  }
  if(Date.now()-lastRescue<500){
    if(e.cancelable)e.preventDefault();
    e.stopImmediatePropagation?.();
  }
},{capture:true});

function bindAgeGate(){
  document.querySelectorAll('#ageCard [data-age]').forEach(btn=>{
    if(btn.dataset.spmGateBound)return;
    btn.dataset.spmGateBound='1';
    btn.type='button';
    const go=e=>{
      if(advanceAge(btn.dataset.age)){
        if(e?.cancelable)e.preventDefault();
        e?.stopImmediatePropagation?.();
      }
    };
    btn.addEventListener('pointerdown',go,{capture:true,passive:false});
    btn.addEventListener('touchstart',go,{capture:true,passive:false});
    btn.addEventListener('click',go,{capture:true});
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindAgeGate,{once:true});
else bindAgeGate();
new MutationObserver(bindAgeGate).observe(document.documentElement,{childList:true,subtree:true});
})();