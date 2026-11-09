(()=>{'use strict';
const base=new URL('assets/videos/techniques/',document.currentScript.src),players=new Set();
function pause(){for(const v of players){v.pause();if(!v.isConnected)players.delete(v);}}
function mount(root,key){
 if(!root||!['stop-squeeze','pelvic-contraction'].includes(key)||root.querySelector('[data-technique-clip]'))return;
 const title=key==='stop-squeeze'?'Stop–Squeeze':'Contracción del piso pélvico';
 const card=document.createElement('aside');card.dataset.techniqueClip=key;card.className='spm-technique-clip';
 const heading=document.createElement('h4');heading.textContent='Mira la técnica · 5 segundos';
 const video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload='none';video.src=new URL(key+'.mp4',base).href;video.poster=new URL(key+'.jpg',base).href;video.setAttribute('aria-label',title+' · demostración visual');
 const note=document.createElement('p');note.textContent='Apoyo visual. Sigue las instrucciones y los tiempos de tu sesión. Ver el clip no registra una práctica.';
 const error=document.createElement('p');error.hidden=true;error.setAttribute('role','status');error.textContent='No se pudo cargar el clip. Puedes seguir consultando las instrucciones.';
 video.addEventListener('error',()=>error.hidden=false);video.addEventListener('loadeddata',()=>error.hidden=true);
 video.addEventListener('play',()=>{for(const other of players)if(other!==video)other.pause();window.SPM_PROGRAM_VIDEOS?.pause();});
 players.add(video);card.append(heading,video,note,error);root.prepend(card);
}
const style=document.createElement('style');style.textContent='.spm-technique-clip{box-sizing:border-box;float:right;width:min(240px,40%);margin:0 0 20px 24px;padding:14px;border:1px solid #9c875e;border-radius:16px;background:#f6f4ed;color:#173b3c}.spm-technique-clip h4{font-size:16px!important;color:#173b3c!important;margin:0 0 12px!important}.spm-technique-clip video{width:100%;max-height:340px;aspect-ratio:9/16;object-fit:contain;display:block;border-radius:10px;background:#000}.spm-technique-clip p{font-size:12px!important;color:#355453!important;line-height:1.5!important}.ecCard:has(.spm-technique-clip),.pfi-main:has(.spm-technique-clip){display:flow-root}@media(max-width:600px){.spm-technique-clip{float:none;width:100%;max-width:280px;margin:16px auto}}';document.head.append(style);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',pause);
document.addEventListener('click',e=>{if(e.target.closest('.ecClose,.pfi-btn,.pfi-step,#ecGoPractice,#ecBackTeach,#ecBackProgram,#ecBreathing,#logoutBtn,#navPlan,#navMap'))pause();},true);
window.SPM_TECHNIQUE_CLIPS={mount,pause};
})();
