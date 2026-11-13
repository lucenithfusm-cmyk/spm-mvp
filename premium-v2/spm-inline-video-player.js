(()=>{
'use strict';
const css=`#spmVideoModal{position:fixed;inset:0;z-index:1500;background:rgba(2,10,15,.9);display:none;align-items:center;justify-content:center;padding:18px}#spmVideoModal.on{display:flex}.spmVpShell{width:min(980px,100%);max-height:calc(100dvh - 36px);display:flex;flex-direction:column;background:#071b27;border:1px solid #c5a46c55;border-radius:20px;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.45)}.spmVpHead{display:flex;flex:none;justify-content:space-between;align-items:center;gap:12px;padding:16px 20px;color:#fff}.spmVpHead b{font-size:17px;line-height:1.5}.spmVpClose{flex:none;min-height:44px;border:0;border-radius:10px;background:#173440;color:#fff;padding:9px 12px;font-weight:800;cursor:pointer}.spmVpClose:focus-visible{outline:3px solid #d8ba75;outline-offset:3px}.spmVpScroll{min-height:0;overflow-y:auto;overscroll-behavior:contain}.spmVpBody{background:#000}.spmVpBody video{display:block;width:100%;max-height:60vh;background:#000}.spmVpShell.spmLowDesire .spmVpBody{aspect-ratio:1.19/1;overflow:hidden;display:flex;align-items:center;justify-content:center}.spmVpShell.spmLowDesire .spmVpBody video{width:100%;height:100%;max-height:none;object-fit:cover;object-position:center}.spmVpAction{padding:0 24px 24px}.spmVpAction[hidden]{display:none}.spmVpFoot{padding:14px 24px;color:#b6c9d1;font-size:14px;line-height:1.6}@media(max-width:540px){#spmVideoModal{padding:12px}.spmVpShell{max-height:calc(100dvh - 24px)}.spmVpHead{padding:12px 16px}.spmVpHead b{font-size:16px}.spmVpAction{padding:0 18px 20px}.spmVpFoot{padding:12px 18px}}`;
let opener=null;
function ensure(){
 if(document.getElementById('spmVideoModal'))return;
 const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
 const m=document.createElement('div');m.id='spmVideoModal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-labelledby','spmVpTitle');
 m.innerHTML=`<div class="spmVpShell"><div class="spmVpHead"><b id="spmVpTitle">Video SPM</b><button type="button" class="spmVpClose">Cerrar ×</button></div><div class="spmVpScroll"><div class="spmVpBody"><video id="spmVpVideo" controls playsinline preload="metadata"></video></div><div class="spmVpAction" hidden></div><div class="spmVpFoot">Estás dentro de SPM. Al terminar, cierra el reproductor y continúa tu actividad.</div></div></div>`;document.body.appendChild(m);
 const close=()=>{const v=document.getElementById('spmVpVideo');v.pause();v.removeAttribute('src');v.load();m.classList.remove('on');if(opener?.isConnected)opener.focus();opener=null;};
 m.querySelector('.spmVpClose').onclick=close;m.addEventListener('click',e=>{if(e.target===m)close();});
 document.addEventListener('keydown',e=>{
  if(!m.classList.contains('on'))return;
  if(e.key==='Escape'){e.preventDefault();close();}
  if(e.key==='Tab'&&e.shiftKey&&document.activeElement===m.querySelector('.spmVpClose')){e.preventDefault();m.querySelector('video').focus();}
 });
 document.addEventListener('focusin',e=>{if(m.classList.contains('on')&&!m.contains(e.target))m.querySelector('.spmVpClose').focus();});
}
function normalized(src){
 try{const url=new URL(src,document.baseURI);return url.origin+url.pathname.replace(/dr-spm-(vascular|metabolic|medications|performance-anxiety)(?:-content)?\.mp4$/,'dr-spm-$1-content.mp4');}catch{return '';}
}
function open(src,title){
 ensure();if(!src)return;
 const modal=document.getElementById('spmVideoModal'),v=document.getElementById('spmVpVideo'),shell=modal.querySelector('.spmVpShell'),action=modal.querySelector('.spmVpAction');
 opener=document.activeElement;document.getElementById('spmVpTitle').textContent=title||'Video SPM';shell.classList.remove('spmPortrait','spmLowDesire');
 const item=(window.SPM_VIDEO_LIBRARY||[]).find(video=>normalized(video.url)===normalized(src));
 action.innerHTML=item?window.SPM_VIDEO_ACTIONS?.markup(item.key)||'':'';action.hidden=!action.firstElementChild;
 modal.querySelector('.spmVpFoot').textContent=item?.action?'Puedes volver a consultar este video y su acción cuando lo necesites.':'Estás dentro de SPM. Al terminar, cierra el reproductor y continúa tu actividad.';
 const lowDesire=/dr-spm-low-desire\.mp4(?:$|\?)/.test(src);shell.classList.toggle('spmLowDesire',lowDesire);
 v.onloadedmetadata=()=>shell.classList.toggle('spmPortrait',v.videoHeight>v.videoWidth);
 const clean=src.replace(/dr-spm-(vascular|metabolic|medications|performance-anxiety)\.mp4$/, 'dr-spm-$1-content.mp4');
 v.onerror=()=>{if(v.getAttribute('src')!==src){v.src=src;v.play().catch(()=>{});}};
 window.SPM_PROGRAM_VIDEOS?.pause();v.src=clean;modal.classList.add('on');modal.querySelector('.spmVpScroll').scrollTop=0;modal.querySelector('.spmVpClose').focus();v.play().catch(()=>{});
}
ensure();window.SPM_NATIVE_VIDEO={open};window.SPM_INLINE_VIDEO_PLAYER={open};
})();
