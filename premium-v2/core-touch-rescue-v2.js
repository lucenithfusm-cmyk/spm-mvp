(()=>{
'use strict';
// SPM interaction safety v3.
// Previous rescue code intercepted every touch/pointer/click at capture phase.
// That fixed an old age-gate symptom but could prevent normal navigation,
// logout and restored-program controls on mobile Safari.
// Keep only passive mobile interaction styling; app-live owns all behavior.
if(window.SPM_CORE_TOUCH_RESCUE_V3)return;
window.SPM_CORE_TOUCH_RESCUE_V3=true;
const style=document.createElement('style');
style.textContent=`#appScreen button,#authScreen button,#appScreen input,#appScreen select,#appScreen textarea{touch-action:manipulation;-webkit-tap-highlight-color:rgba(112,221,194,.18)}#appScreen button:not(:disabled),#authScreen button:not(:disabled){pointer-events:auto}`;
document.head.appendChild(style);
})();