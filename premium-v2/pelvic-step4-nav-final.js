(()=>{
'use strict';
const sel=(s,r=document)=>r.querySelector(s);
function openRoot(){return sel('.pfi-overlay:not([hidden])')}
function activeIndex(root){
  const steps=[...root.querySelectorAll('.pfi-step')];
  const byClass=steps.findIndex(b=>b.classList.contains('on'));
  if(byClass>=0)return byClass;
  const m=(sel('.pfi-count',root)?.textContent||'').match(/(\d+)\s*de\s*7/i);
  return m?Math.max(0,Math.min(6,Number(m[1])-1)):0;
}
function jump(root,index){
  const steps=[...root.querySelectorAll('.pfi-step')];
  const target=steps[index];
  if(!target)return;
  target.disabled=false;
  target.removeAttribute('aria-disabled');
  target.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
  requestAnimationFrame(()=>{
    const shell=sel('.pfi-shell',root);
    if(shell){try{shell.scrollTop=0}catch(e){}}
  });
}
function patch(){
  const root=openRoot();
  if(!root)return;
  if(activeIndex(root)!==3)return;
  const nav=sel('.pfi-nav',root);
  if(!nav)return;
  if(nav.dataset.step4Final==='1')return;
  nav.dataset.step4Final='1';
  const oldPrev=sel('[data-prev]',nav), oldNext=sel('[data-next]',nav);
  const prev=document.createElement('button');
  prev.type='button';prev.className=oldPrev?.className||'pfi-btn';prev.textContent='‹ Anterior';
  const next=document.createElement('button');
  next.type='button';next.className=(oldNext?.className||'pfi-btn primary');next.textContent='Siguiente ›';
  prev.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();jump(root,2)},true);
  next.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();jump(root,4)},true);
  prev.addEventListener('touchend',e=>{e.preventDefault();e.stopImmediatePropagation();jump(root,2)},{capture:true,passive:false});
  next.addEventListener('touchend',e=>{e.preventDefault();e.stopImmediatePropagation();jump(root,4)},{capture:true,passive:false});
  nav.replaceChildren(prev,next);
}
const obs=new MutationObserver(()=>requestAnimationFrame(patch));
obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});
document.addEventListener('click',()=>requestAnimationFrame(patch),true);
document.addEventListener('DOMContentLoaded',patch,{once:true});
setInterval(patch,500);
})();