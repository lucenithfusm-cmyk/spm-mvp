(()=>{"use strict";
const active=new WeakMap();
function stop(el){const arr=active.get(el)||[];arr.forEach(a=>{try{a.cancel()}catch{}});active.set(el,[])}
function add(el,frames,opts){if(!el||!el.animate)return;const a=el.animate(frames,opts);const arr=active.get(el.closest('.rtsvisual,.bsvisual')||el)||[];arr.push(a);active.set(el.closest('.rtsvisual,.bsvisual')||el,arr)}
function stateOf(v){return [...v.classList].find(x=>x!=='rtsvisual'&&x!=='bsvisual')||'rest'}
function animateReal(v){stop(v);const s=stateOf(v),img=v.querySelector('img'),dia=v.querySelector('.dia,.bsdia'),abd=v.querySelector('.abd,.bsabd'),air=v.querySelector('.air,.bsair'),pel=v.querySelector('.pelvis'),needle=v.querySelector('.needle'),halo=v.querySelector('.halo'),focus=v.querySelector('.focus');
 const ease='cubic-bezier(.45,0,.2,1)';
 if(s==='inhale'){
  add(img,[{transform:'scale(1) translateY(0)'},{transform:'scale(1.045,1.035) translateY(2px)'}],{duration:3900,fill:'forwards',easing:ease});
  add(dia,[{transform:'translateY(0)'},{transform:'translateY(24px)'}],{duration:3900,fill:'forwards',easing:ease});
  add(abd,[{transform:'scale(1)'},{transform:'scale(1.13,1.08)'}],{duration:3900,fill:'forwards',easing:ease});
  add(air,[{opacity:.15,transform:'translateY(-18px) scaleY(.45)'},{opacity:1,transform:'translateY(18px) scaleY(1.12)'}],{duration:1800,direction:'alternate',iterations:2,easing:'ease-in-out'});
 }
 else if(s==='hold'){
  add(img,[{transform:'scale(1.045,1.035)'},{transform:'scale(1.048,1.038)'},{transform:'scale(1.045,1.035)'}],{duration:1900,iterations:1,fill:'forwards',easing:'ease-in-out'});
  add(dia,[{transform:'translateY(24px)'},{transform:'translateY(22px)'},{transform:'translateY(24px)'}],{duration:1900,iterations:1,fill:'forwards'});
 }
 else if(s==='exhale'){
  add(img,[{transform:'scale(1.045,1.035) translateY(2px)'},{transform:'scale(.995,1) translateY(0)'}],{duration:5900,fill:'forwards',easing:ease});
  add(dia,[{transform:'translateY(24px)'},{transform:'translateY(-10px)'}],{duration:5900,fill:'forwards',easing:ease});
  add(abd,[{transform:'scale(1.13,1.08)'},{transform:'scale(.93,.96)'}],{duration:5900,fill:'forwards',easing:ease});
  add(air,[{opacity:1,transform:'translateY(16px) scaleY(1.05)'},{opacity:.1,transform:'translateY(-30px) scaleY(.5)'}],{duration:2800,direction:'alternate',iterations:2,easing:'ease-in-out'});
 }
 else if(s==='pelvic-contract'){
  add(img,[{transform:'translateY(0)'},{transform:'translateY(-3px)'}],{duration:2800,fill:'forwards',easing:ease});
  add(pel,[{transform:'translateY(8px) scaleX(1.08)',opacity:.55},{transform:'translateY(-22px) scaleX(.78)',opacity:1}],{duration:2800,fill:'forwards',easing:ease});
 }
 else if(s==='pelvic-relax'){
  add(pel,[{transform:'translateY(-22px) scaleX(.78)',opacity:1},{transform:'translateY(10px) scaleX(1.12)',opacity:.65}],{duration:7600,fill:'forwards',easing:ease});
  add(img,[{transform:'translateY(-3px)'},{transform:'translateY(0)'}],{duration:3000,fill:'forwards',easing:ease});
 }
 else if(s.startsWith('pelvic-')) add(pel,[{opacity:.45},{opacity:1},{opacity:.45}],{duration:1800,iterations:Infinity,easing:'ease-in-out'});
 else if(s==='arousal-rise'){
  add(needle,[{left:'18%'},{left:'68%'}],{duration:14000,fill:'forwards',easing:ease});
  add(img,[{transform:'scale(1)'},{transform:'scale(1.018)'}],{duration:14000,fill:'forwards',easing:ease});
 }
 else if(s==='arousal-watch') add(needle,[{left:'68%'},{left:'76%'}],{duration:7000,fill:'forwards',easing:ease});
 else if(s==='arousal-stop'||s==='squeeze') add(needle,[{left:'76%'},{left:'72%'}],{duration:1200,fill:'forwards',easing:'ease-out'});
 else if(s==='arousal-release') add(needle,[{left:'72%'},{left:'48%'}],{duration:9000,fill:'forwards',easing:ease});
 else if(s==='arousal-recover') add(needle,[{left:'48%'},{left:'34%'}],{duration:14000,fill:'forwards',easing:ease});
 else if(s==='mind-alert') add(halo,[{transform:'scale(.94)',opacity:.5},{transform:'scale(1.18)',opacity:1},{transform:'scale(.94)',opacity:.5}],{duration:1400,iterations:Infinity,easing:'ease-in-out'});
 else if(s==='mind-release'){
  add(halo,[{transform:'scale(1.15)',opacity:1},{transform:'scale(.95)',opacity:.25}],{duration:7000,fill:'forwards',easing:ease});
  add(img,[{transform:'translateY(-2px)'},{transform:'translateY(4px)'}],{duration:7000,fill:'forwards',easing:ease});
 }
 else if(s==='mind-focus'||s==='mind-present'||s.includes('sensate')||s.includes('erection')||s.includes('desire')) add(focus,[{transform:'scale(.88)',opacity:.35},{transform:'scale(1.15)',opacity:.9},{transform:'scale(.88)',opacity:.35}],{duration:2600,iterations:Infinity,easing:'ease-in-out'});
 else add(img,[{transform:'translateY(0)'},{transform:'translateY(-2px)'},{transform:'translateY(0)'}],{duration:3200,iterations:Infinity,easing:'ease-in-out'});
}
function watch(v){if(v.dataset.motionV2)return;v.dataset.motionV2='1';new MutationObserver(()=>animateReal(v)).observe(v,{attributes:true,attributeFilter:['class']});animateReal(v)}
function scan(){document.querySelectorAll('.rtsvisual,.bsvisual').forEach(watch)}
new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});scan();
window.SPM_REAL_MOTION_V2={scan};
})();