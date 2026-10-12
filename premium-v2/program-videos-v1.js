(()=>{'use strict';
if(window.SPM_PROGRAM_VIDEOS)return;
// Keys resolve against the existing Central catalog. No media copies or progress writes.
const routes=Object.freeze({
 sensate:['sensory-focus','partner-communication','anticipatory-failure','mental-preparation'],
 desire:['sensory-focus'],
 ejaculation:['partner-communication','anticipatory-failure','mental-preparation'],
 erection:['partner-communication','anticipatory-failure','mental-preparation','performance-anxiety','dr-performance-anxiety'],
 anxiety:['partner-communication','anticipatory-failure','mental-preparation','performance-anxiety','dr-performance-anxiety']
});
const base=document.baseURI, mounted=new WeakMap(), players=new Set(), mounts=new Set();
function keysFor(route){return [...(routes[route==='confidence'?'anxiety':route]||[])];}
function pause(root){for(const video of players)if(!root||root.contains(video))video.pause();}
function mount(root,route){
 if(!root)return ()=>{};
 pause();
 const old=mounted.get(root);if(old?.route===route && old.section.isConnected)return old.cleanup;if(old)old.cleanup();
 const catalog=window.SPM_VIDEO_LIBRARY||[],items=keysFor(route).map(key=>catalog.find(v=>v.key===key)).filter(Boolean);
 if(!items.length)return ()=>{};
 const doc=root.ownerDocument,win=doc.defaultView,section=doc.createElement('section');
 section.className='spm-program-videos';section.dataset.programVideos=route;section.setAttribute('aria-label','Videos de apoyo SPM');
 const style=doc.createElement('style');style.textContent='.spm-program-videos{box-sizing:border-box;margin:24px 0;padding:20px;border:1px solid #31545c;border-radius:18px;background:#091d26;color:#eef8f6;text-align:left}.spm-program-videos h3{font-size:20px;margin:0 0 8px;color:#d8ba75}.spm-program-videos p{font-size:14px;line-height:1.55;margin:8px 0 18px}.spm-program-video-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:20px}.spm-program-videos article{min-width:0}.spm-program-videos h4{font-size:15px;line-height:1.5;margin:0 0 10px;color:#eef8f6}.spm-program-videos video{display:block;width:100%;max-height:65vh;aspect-ratio:16/9;object-fit:contain;background:#000;border-radius:12px}.spm-program-videos video[data-portrait]{aspect-ratio:9/16;max-width:350px;margin:auto}.spm-program-videos button{min-height:44px;padding:8px 14px;border:1px solid #d8ba75;border-radius:10px;background:#132f39;color:#fff}.spm-program-videos [hidden]{display:none!important}';
 section.append(style);
 const heading=doc.createElement('h3');heading.textContent='Videos para acompañar tu práctica';
 const intro=doc.createElement('p');intro.textContent='Elige el recurso que necesites. Puedes volver a verlo durante tu programa de 28 días; verlo no completa una práctica ni cambia tu día.';
 const grid=doc.createElement('div');grid.className='spm-program-video-grid';section.append(heading,intro,grid);
 const own=[];
 for(const item of items){
  const card=doc.createElement('article'),title=doc.createElement('h4'),video=doc.createElement('video'),error=doc.createElement('p'),retry=doc.createElement('button');
  card.dataset.videoKey=item.key;title.textContent=item.title;video.controls=true;video.playsInline=true;video.preload='metadata';video.src=new URL(item.url,base).href;video.setAttribute('aria-label',item.title);
  error.hidden=true;error.setAttribute('role','status');error.append('No se pudo cargar el video. ');retry.type='button';retry.textContent='Reintentar';error.append(retry);
  video.addEventListener('loadedmetadata',()=>{video.toggleAttribute('data-portrait',video.videoHeight>video.videoWidth);error.hidden=true;});
  video.addEventListener('error',()=>{error.hidden=false;});
  retry.onclick=()=>{error.hidden=true;video.load();video.play().catch(()=>{error.hidden=false;});};
  video.addEventListener('play',()=>{for(const other of players)if(other!==video)other.pause();});
  own.push(video);players.add(video);card.append(title,video,error);grid.append(card);
 }
 root.append(section);
 const stop=()=>own.forEach(v=>v.pause()),hide=()=>{if(doc.hidden)stop();};
 win.addEventListener('pagehide',stop);doc.addEventListener('visibilitychange',hide);
 let disposed=false;
 function cleanup(){if(disposed)return;disposed=true;stop();own.forEach(v=>{players.delete(v);v.removeAttribute('src');v.load();});win.removeEventListener('pagehide',stop);doc.removeEventListener('visibilitychange',hide);section.remove();mounted.delete(root);mounts.delete(record);}
 const record={root,route,section,cleanup};mounted.set(root,record);mounts.add(record);return cleanup;
}
function unmount(root){if(root)for(const entry of [...mounts])if(root===entry.root||root.contains(entry.root))entry.cleanup();}
window.addEventListener('pagehide',()=>pause());
window.addEventListener('spm:session-change',()=>pause());
window.SPM_PROGRAM_VIDEOS={mount,unmount,pause,keysFor};
})();
