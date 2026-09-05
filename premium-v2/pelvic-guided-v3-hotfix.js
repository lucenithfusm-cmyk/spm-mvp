(()=>{
'use strict';

// Keep the rebuilt pelvic module loader.
if(!document.querySelector('script[data-spm-pelvic-v2]')){
  const s=document.createElement('script');
  s.src='pelvic-module-rebuild-v2.js';
  s.defer=true;
  s.dataset.spmPelvicV2='1';
  document.head.appendChild(s);
}

// iOS / in-app browser interaction rescue.
// Some late Premium enhancement layers can prevent Safari from synthesizing
// the normal click after a finger tap. Core SPM controls are wired through
// onclick in app-live.js, so invoke that handler directly on touchend.
const style=document.createElement('style');
style.id='spm-ios-touch-rescue-style';
style.textContent=`#appScreen button,#authScreen button,#appScreen input,#appScreen select,#appScreen textarea{touch-action:manipulation;-webkit-tap-highlight-color:rgba(112,221,194,.18)}#appScreen button:not(:disabled),#authScreen button:not(:disabled){pointer-events:auto}`;
document.head.appendChild(style);

let lastTouchAt=0;
function coreControl(el){
  if(!el || el.disabled) return false;
  return !!el.closest('#ageCard,#motiveCard,#quizCard,.side,#map,#coach,#progressPanel,#authScreen');
}
function runDirect(el,event){
  if(!coreControl(el)) return false;
  if(typeof el.onclick==='function'){
    try{ el.onclick.call(el,event); return true; }catch(err){ console.error('SPM touch rescue',err); }
  }
  return false;
}

document.addEventListener('touchend',e=>{
  const el=e.target.closest?.('button');
  if(!el || !coreControl(el)) return;
  lastTouchAt=Date.now();
  if(runDirect(el,e)){
    e.preventDefault();
    e.stopImmediatePropagation();
  }
},{capture:true,passive:false});

// Avoid a duplicate delayed click after the rescued touch.
document.addEventListener('click',e=>{
  if(Date.now()-lastTouchAt>650) return;
  const el=e.target.closest?.('button');
  if(el && coreControl(el)){
    e.preventDefault();
    e.stopImmediatePropagation();
  }
},{capture:true});

window.SPM_IOS_TOUCH_RESCUE=true;
})();