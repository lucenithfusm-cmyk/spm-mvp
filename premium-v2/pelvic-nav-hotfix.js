(()=>{
'use strict';
function getOpen(){return document.querySelector('.pfi-overlay:not([hidden])')}
function currentIndex(root){
 const steps=[...root.querySelectorAll('.pfi-step')];
 let idx=steps.findIndex(b=>b.classList.contains('on'));
 if(idx<0){const txt=root.querySelector('.pfi-count')?.textContent||'';const m=txt.match(/(\d+)\s*de\s*7/i);idx=m?Math.max(0,Math.min(6,Number(m[1])-1)):0}
 return idx;
}
function go(delta){
 const root=getOpen();if(!root)return;
 const steps=[...root.querySelectorAll('.pfi-step')];if(!steps.length)return;
 const idx=currentIndex(root),target=Math.max(0,Math.min(6,idx+delta));
 if(target===idx)return;
 steps[target].click();
 requestAnimationFrame(()=>{try{root.querySelector('.pfi-shell')?.scrollTo({top:0,behavior:'smooth'})}catch(e){}});
}
document.addEventListener('click',e=>{
 const root=getOpen();if(!root)return;
 const prev=e.target.closest('[data-prev]');
 const next=e.target.closest('[data-next]');
 if(!prev&&!next)return;
 const btn=prev||next;
 if(btn.disabled||btn.getAttribute('aria-disabled')==='true')return;
 const idx=currentIndex(root);
 if(idx!==3)return; // robust fix for step 4 without bypassing gated later steps
 e.preventDefault();e.stopPropagation();
 go(prev?-1:1);
},true);
})();