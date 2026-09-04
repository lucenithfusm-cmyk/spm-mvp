(()=>{
'use strict';
function getOpen(){return document.querySelector('.pfi-overlay:not([hidden])')}
function currentIndex(root){
 const steps=[...root.querySelectorAll('.pfi-step')];
 const txt=root.querySelector('.pfi-count')?.textContent||'';
 const m=txt.match(/(\d+)\s*de\s*7/i);
 if(m)return Math.max(0,Math.min(6,Number(m[1])-1));
 const idx=steps.findIndex(b=>b.classList.contains('on'));
 return idx<0?0:idx;
}
function invokeStep(target){
 const root=getOpen();if(!root)return;
 const steps=[...root.querySelectorAll('.pfi-step')];
 const btn=steps[target];if(!btn)return;
 // The base module assigns an onclick function on every step during each render.
 // Call it directly so overlays/capture listeners cannot swallow the transition.
 if(typeof btn.onclick==='function'){
   btn.onclick.call(btn,new MouseEvent('click',{bubbles:false,cancelable:true}));
 }else{
   btn.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
 }
 requestAnimationFrame(()=>{
   const shell=root.querySelector('.pfi-shell');
   const content=root.querySelector('.pfi-content');
   try{shell?.scrollTo({top:0,left:0,behavior:'auto'})}catch(e){}
   try{content?.scrollTo({top:0,left:0,behavior:'auto'})}catch(e){}
 });
}
function repairButtons(){
 const root=getOpen();if(!root||currentIndex(root)!==3)return;
 const prev=root.querySelector('[data-prev]');
 const next=root.querySelector('[data-next]');
 if(prev){prev.disabled=false;prev.setAttribute('aria-disabled','false');prev.onclick=(e)=>{e.preventDefault();e.stopPropagation();invokeStep(2)}}
 if(next){next.disabled=false;next.setAttribute('aria-disabled','false');next.onclick=(e)=>{e.preventDefault();e.stopPropagation();invokeStep(4)}}
}
// Capture both click and touch-end specifically on step 4 navigation.
['click','touchend'].forEach(type=>document.addEventListener(type,e=>{
 const root=getOpen();if(!root||currentIndex(root)!==3)return;
 const prev=e.target.closest?.('[data-prev]');
 const next=e.target.closest?.('[data-next]');
 if(!prev&&!next)return;
 e.preventDefault();e.stopImmediatePropagation();
 invokeStep(prev?2:4);
},{capture:true,passive:false}));
new MutationObserver(()=>requestAnimationFrame(repairButtons)).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
document.addEventListener('DOMContentLoaded',repairButtons,{once:true});
setInterval(repairButtons,700);
})();