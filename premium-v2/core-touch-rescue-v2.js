(()=>{
'use strict';
if(window.SPM_CORE_TOUCH_RESCUE_V2)return;
window.SPM_CORE_TOUCH_RESCUE_V2=true;

const style=document.createElement('style');
style.textContent=`#appScreen button,#authScreen button,#appScreen input,#appScreen select,#appScreen textarea{touch-action:manipulation!important;-webkit-tap-highlight-color:rgba(112,221,194,.18)}#appScreen button:not(:disabled),#authScreen button:not(:disabled){pointer-events:auto!important}`;
document.head.appendChild(style);

const CORE='#ageCard,#motiveCard,#quizCard,.side,#map,#coach,#progressPanel,#authScreen';
let lastRescue=0;
function visible(el){
  if(!el||el.disabled)return false;
  const r=el.getBoundingClientRect();
  if(!r.width||!r.height)return false;
  const cs=getComputedStyle(el);
  return cs.display!=='none'&&cs.visibility!=='hidden'&&cs.pointerEvents!=='none';
}
function underPoint(x,y){
  const candidates=[...document.querySelectorAll(`${CORE} button:not(:disabled),${CORE} [role="button"]`)].filter(visible);
  return candidates.find(el=>{const r=el.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom})||null;
}
function invoke(el,event){
  if(!el||!el.closest(CORE))return false;
  try{
    if(typeof el.onclick==='function'){
      el.onclick.call(el,event);
      return true;
    }
    const id=el.id;
    if(id==='motiveNext'){
      const fn=el.onclick; if(typeof fn==='function'){fn.call(el,event);return true;}
    }
  }catch(err){console.error('SPM core touch rescue',err)}
  return false;
}
function pointFromEvent(e){
  const t=e.changedTouches?.[0]||e.touches?.[0];
  if(t)return {x:t.clientX,y:t.clientY};
  if(Number.isFinite(e.clientX)&&Number.isFinite(e.clientY))return {x:e.clientX,y:e.clientY};
  return null;
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
// Capture at window level so this runs before document-level legacy handlers/overlays.
window.addEventListener('touchend',rescue,{capture:true,passive:false});
window.addEventListener('pointerup',e=>{if(e.pointerType==='touch')rescue(e)},{capture:true,passive:false});
window.addEventListener('click',e=>{
  if(Date.now()-lastRescue<700){
    const p=pointFromEvent(e);const el=p?underPoint(p.x,p.y):null;
    if(el){e.preventDefault();e.stopImmediatePropagation?.();}
  }
},{capture:true});

// Hard fallback for the first eligibility step. It does not depend on app-live's click synthesis.
window.addEventListener('touchend',e=>{
  const age=document.getElementById('ageCard');
  const motive=document.getElementById('motiveCard');
  if(!age||age.hidden||!motive)return;
  const p=pointFromEvent(e);if(!p)return;
  const yes=age.querySelector('[data-age="1"]');
  if(!yes)return;
  const r=yes.getBoundingClientRect();
  if(p.x>=r.left&&p.x<=r.right&&p.y>=r.top&&p.y<=r.bottom){
    age.hidden=true;motive.hidden=false;
    if(e.cancelable)e.preventDefault();
    e.stopImmediatePropagation?.();
  }
},{capture:true,passive:false});
})();