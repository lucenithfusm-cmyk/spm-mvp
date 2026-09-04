(()=>{
'use strict';
const id='spmMobileScrollHotfixStyle';
if(document.getElementById(id)) return;
const st=document.createElement('style');
st.id=id;
st.textContent=`
/* Mobile overlay scrolling hotfix: iOS Safari + in-app browser */
.spmIntroOverlay{
  overflow-y:auto!important;
  overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;
  overscroll-behavior:contain!important;
  align-items:flex-start!important;
  justify-items:center!important;
  place-items:start center!important;
  padding:max(10px,env(safe-area-inset-top)) 10px max(16px,env(safe-area-inset-bottom))!important;
  touch-action:pan-y!important;
}
.spmIntroOverlay.on{display:grid!important}
.spmIntroCard{
  width:min(900px,96vw)!important;
  max-height:calc(100dvh - max(20px,env(safe-area-inset-top)) - max(20px,env(safe-area-inset-bottom)))!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;
  overscroll-behavior:contain!important;
  touch-action:pan-y!important;
  margin:auto 0!important;
}
.spmIntroHead{
  position:sticky!important;
  top:0!important;
  z-index:10!important;
}
.spmIntroActions{
  position:sticky!important;
  bottom:0!important;
  z-index:9!important;
  background:rgba(251,250,247,.98)!important;
  padding:12px 0 max(4px,env(safe-area-inset-bottom))!important;
  border-top:1px solid #dce7e2!important;
}
.pfi-overlay{
  overflow-y:auto!important;
  -webkit-overflow-scrolling:touch!important;
  touch-action:pan-y!important;
  align-items:flex-start!important;
  justify-items:center!important;
  padding:max(8px,env(safe-area-inset-top)) 8px max(12px,env(safe-area-inset-bottom))!important;
}
.pfi-shell{
  max-height:calc(100dvh - max(16px,env(safe-area-inset-top)) - max(16px,env(safe-area-inset-bottom)))!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;
  overscroll-behavior:contain!important;
  touch-action:pan-y!important;
}
.pfi-content,.pfi-main{touch-action:pan-y!important}
@media(max-width:820px){
  .spmIntroBody{padding:16px!important}
  .spmIntroCard{border-radius:18px!important}
  .spmIntroHead{padding:14px 16px!important}
  .spmFxArt{min-height:180px!important}
  .spmFxArt svg{max-height:205px!important}
  .spmIntroActions{display:grid!important;grid-template-columns:1fr!important}
  .spmIntroActions .spmFxBtn{width:100%!important;min-height:48px!important}
  .pfi-shell{border-radius:16px!important}
}
`;
document.head.appendChild(st);

function unlockScrollableOverlays(){
  document.querySelectorAll('.spmIntroOverlay,.spmIntroCard,.pfi-overlay,.pfi-shell').forEach(el=>{
    el.style.webkitOverflowScrolling='touch';
    el.style.touchAction='pan-y';
  });
}

document.addEventListener('touchmove',e=>{
  const scrollable=e.target.closest?.('.spmIntroCard,.pfi-shell');
  if(scrollable) e.stopPropagation();
},{passive:true,capture:true});

document.addEventListener('DOMContentLoaded',unlockScrollableOverlays,{once:true});
new MutationObserver(unlockScrollableOverlays).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});
setTimeout(unlockScrollableOverlays,300);
})();