(()=>{'use strict';
if(window.SPM_PRACTICE_AUDIO)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon='<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5V4Z"/><path d="M15 8a6 6 0 0 1 0 8M18 4a11 11 0 0 1 0 16"/></svg>';
let current=null;
function stop(){window.speechSynthesis?.cancel();if(current){current.setAttribute('aria-pressed','false');current.querySelector('b').textContent=current.dataset.audioLabel;current=null;}}
function button(text,label='Escuchar indicación'){return `<button type="button" class="spm-audio-action" data-spm-speak="${esc(text)}" data-audio-label="${esc(label)}" aria-pressed="false"><span>${icon}</span><b>${esc(label)}</b></button>`;}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-spm-speak]');if(!b)return;
 if(current===b){stop();return;}stop();
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){b.querySelector('b').textContent='Audio no disponible · Lee la indicación';b.closest('section,article,form')?.querySelector('details')?.setAttribute('open','');return;}
 const u=new SpeechSynthesisUtterance(b.dataset.spmSpeak);u.lang='es-CO';u.rate=.92;
 const voices=window.speechSynthesis.getVoices();u.voice=voices.find(v=>v.lang==='es-CO')||voices.find(v=>/^es/.test(v.lang))||null;
 current=b;b.setAttribute('aria-pressed','true');b.querySelector('b').textContent='Detener audio';
 u.onend=()=>{if(current===b)stop();};u.onerror=()=>{if(current===b){stop();b.querySelector('b').textContent='Reintentar audio';}};
 window.speechSynthesis.speak(u);
});
window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
const style=document.createElement('style');style.textContent='.spm-audio-action{display:flex!important;align-items:center;gap:12px;min-height:64px;padding:9px 16px!important;margin:12px 0;border:1px solid #bc9a5f!important;border-radius:16px!important;background:linear-gradient(125deg,#2d3027,#132b31)!important;color:#f2ddb3!important;cursor:pointer;font:inherit;text-align:left}.spm-audio-action>span{display:grid;place-items:center;width:46px;height:46px;flex:0 0 46px;background:#e0bd7b;color:#092229;border-radius:50%}.spm-audio-action b{font-size:16px}.spm-audio-action[aria-pressed="true"]{outline:2px solid #e0bd7b;outline-offset:2px}.spm-audio-action:focus-visible{outline:3px solid #fff;outline-offset:3px}';document.head.appendChild(style);
window.SPM_PRACTICE_AUDIO={button,stop};
})();
