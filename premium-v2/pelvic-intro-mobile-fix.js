(()=>{
'use strict';
const STYLE_ID='spmPelvicIntroMobileFixStyle';
if(!document.getElementById(STYLE_ID)){
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
  #spmPelvicIntro.spmIntroOverlay{align-items:stretch!important;justify-items:center!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important;padding:12px!important;height:100dvh!important;max-height:100dvh!important;box-sizing:border-box!important}
  #spmPelvicIntro .spmIntroCard{display:flex!important;flex-direction:column!important;width:min(900px,96vw)!important;max-height:none!important;height:auto!important;min-height:0!important;overflow:visible!important;margin:auto 0!important;flex:0 0 auto!important}
  #spmPelvicIntro .spmIntroHead{position:sticky!important;top:0!important;z-index:3!important;flex:0 0 auto!important}
  #spmPelvicIntro .spmIntroBody{overflow:visible!important;max-height:none!important;height:auto!important;flex:0 0 auto!important;padding-bottom:calc(28px + env(safe-area-inset-bottom))!important}
  #spmPelvicIntro .spmIntroActions{position:sticky!important;bottom:0!important;z-index:4!important;background:rgba(251,250,247,.97)!important;padding:12px 0 calc(10px + env(safe-area-inset-bottom))!important;border-top:1px solid #dce7e2!important}
  #spmPelvicIntro #spmPelvicStart{min-height:50px!important}
  #spmPelvicIntro .spmIntroSafety{margin:12px 0 4px;padding:11px 12px;border-radius:12px;background:#eef6f3;color:#315b57;font-size:12px;line-height:1.45;border:1px solid #d6e6df}
  @media(max-width:760px){
    #spmPelvicIntro.spmIntroOverlay{display:none!important;place-items:unset!important}
    #spmPelvicIntro.spmIntroOverlay.on{display:block!important}
    #spmPelvicIntro .spmIntroCard{width:100%!important;border-radius:18px!important;margin:0!important;min-height:max-content!important}
    #spmPelvicIntro .spmIntroBody{padding:16px!important;padding-bottom:calc(90px + env(safe-area-inset-bottom))!important}
    #spmPelvicIntro .spmFxArt{min-height:190px!important}
    #spmPelvicIntro .spmFxArt svg{max-height:220px!important}
    #spmPelvicIntro .spmIntroActions{margin-top:12px!important}
  }
  `;
  document.head.appendChild(s);
}
const NEW_INTRO='Bienvenido al programa de entrenamiento del piso pélvico de SPM. Antes de comenzar, aprenderás a reconocer qué músculos vas a trabajar, cómo activarlos sin involucrar abdomen, glúteos o muslos, y cómo relajarlos por completo. El objetivo no es hacer fuerza máxima. Buscamos conciencia, precisión y control. Luego realizarás una serie guiada, revisarás recomendaciones y finalmente harás una práctica autónoma con registro de progreso. Si antes de iniciar ya vienes presentando dolor pélvico, ardor, molestias urinarias o tensión persistente, es recomendable realizar primero una valoración profesional para orientar la práctica de forma adecuada.';
function speak(){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(NEW_INTRO);u.lang='es-CO';u.rate=.9;const vs=speechSynthesis.getVoices();u.voice=vs.find(v=>/es-CO/i.test(v.lang))||vs.find(v=>/^es/i.test(v.lang))||null;speechSynthesis.speak(u)}catch(e){}}
let lastOpen=false;
function patch(){
  const o=document.getElementById('spmPelvicIntro');
  if(!o)return;
  if(o.dataset.mobileFix!=='1'){
    o.dataset.mobileFix='1';
    ['touchstart','touchmove','wheel'].forEach(type=>o.addEventListener(type,()=>{}, {passive:true}));
  }
  const body=o.querySelector('.spmIntroBody');
  if(body&&!body.querySelector('.spmIntroSafety')){
    const note=document.createElement('div');note.className='spmIntroSafety';note.innerHTML='<b>Antes de practicar:</b> si ya vienes presentando dolor pélvico, ardor, molestias urinarias o tensión persistente, conviene realizar primero una valoración profesional para orientar el entrenamiento.';
    const actions=o.querySelector('.spmIntroActions');body.insertBefore(note,actions||null);
  }
  const audio=document.getElementById('spmPelvicIntroAudio');
  const replay=document.getElementById('spmPelvicReplay');
  if(audio){audio.dataset.newIntro='1';audio.onclick=speak}
  if(replay){replay.dataset.newIntro='1';replay.onclick=speak}
  const open=o.classList.contains('on');
  if(open){
    o.style.overflowY='auto';o.style.webkitOverflowScrolling='touch';o.style.touchAction='pan-y';
    if(!lastOpen){
      requestAnimationFrame(()=>{try{o.scrollTop=0}catch(e){}});
      // Older fidelity code starts the old narration 250 ms after opening.
      // Cancel it afterwards and replace it with the approved wording.
      setTimeout(()=>{if(o.classList.contains('on'))speak()},360);
    }
  }
  lastOpen=open;
}
new MutationObserver(patch).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('DOMContentLoaded',patch,{once:true});
setTimeout(patch,300);setTimeout(patch,900);
})();