(()=>{'use strict';
if(window.SPM_PRACTICE_AUDIO)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon='<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5V4Z"/><path d="M15 8a6 6 0 0 1 0 8M18 4a11 11 0 0 1 0 16"/></svg>';
const installed=new WeakMap();let current=null;
function within(root,button){
 if(!root||root===button||root.contains?.(button))return true;
 let win=button.ownerDocument?.defaultView;
 try{while(win&&win!==win.parent){const frame=win.frameElement;if(!frame)break;if(root===frame||root.contains?.(frame))return true;win=frame.ownerDocument?.defaultView;}}catch{}
 return false;
}
function label(button,text,pressed=false){button.setAttribute('aria-pressed',String(pressed));button.setAttribute('aria-label',text);button.title=text;const copy=button.querySelector('b');if(copy)copy.textContent=text;}
function reset(button){label(button,button.dataset.audioLabel||'Escuchar indicación');button.dataset.audioState='idle';}
function stop(root){if(root&&(!current||!within(root,current.button)))return;const old=current;current=null;if(old){old.voice?.cancel();reset(old.button);}}
function button(text,name='Escuchar indicación',options={}){
 const compact=options?.compact===true;
 // The historical options.src is intentionally not a playback source.
 return `<button type="button" class="spm-audio-action${compact?' spm-audio-action--compact':''}" data-spm-speak="${esc(text)}" data-audio-label="${esc(name)}"${compact?' data-audio-compact="true"':''} aria-label="${esc(name)}" title="${esc(name)}" aria-pressed="false"><span aria-hidden="true">${icon}</span><b>${esc(name)}</b></button>`;
}
function status(button,message){let notice=button.nextElementSibling;if(!notice?.hasAttribute('data-spm-audio-status')){if(!message)return;notice=button.ownerDocument.createElement('p');notice.className='spm-audio-status';notice.dataset.spmAudioStatus='';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');button.after(notice);}notice.textContent=message||'';notice.hidden=!message;}
function transcript(button){
 const section=button.closest('[data-video-action]')||button.closest('section,article,form');let details=section?.querySelector('details');
 if(!details){details=button.ownerDocument.createElement('details');const summary=button.ownerDocument.createElement('summary');summary.textContent='Leer indicación';const copy=button.ownerDocument.createElement('p');copy.textContent=button.dataset.spmSpeak||'';details.append(summary,copy);button.after(details);}
 return details;
}
function speak(button){
 const voice=window.SPM_VOICE?.forWindow?.(button.ownerDocument.defaultView)||window.SPM_VOICE;
 if(current?.button===button&&voice?.state==='paused'){voice.resume();return;}
 if(current?.button===button&&voice?.speaking){voice.pause();return;}
 stop();status(button,'');
 // Keep the readable source available if the operating system has no voice.
 const readable=transcript(button);
 if(!voice){readable.open=true;label(button,'Reintentar audio');status(button,'La voz no está disponible. Puedes leer la indicación.');return;}
 try{window.SPM_PROGRAM_VIDEOS?.pause();}catch{}
 const record={button,voice};current=record;
 voice.listen(button.dataset.spmSpeak||'',{
  owner:button,lang:'es-CO',
  onstate:({state,message})=>{if(current!==record)return;button.dataset.audioState=state;
   if(state==='preparing')label(button,'Preparando voz…',true);
   if(state==='playing')label(button,'Pausar audio',true);
   if(state==='paused')label(button,'Reanudar desde este párrafo');
   if(state==='error'){label(button,'Reintentar audio');readable.open=true;}
   if(state==='ended'||state==='stopped'){current=null;reset(button);}
   status(button,message||'');
  },
  oncancel:()=>{if(current===record)current=null;reset(button);},
  onerror:()=>{readable.open=true;}
 });
}
const css=`
.spm-audio-action{display:flex!important;align-items:center;gap:12px;min-height:64px;padding:9px 16px!important;margin:12px 0;border:1px solid #bc9a5f!important;border-radius:16px!important;background:linear-gradient(125deg,#2d3027,#132b31)!important;color:#f2ddb3!important;cursor:pointer;font:inherit;text-align:left}
.spm-audio-action>span{display:grid;place-items:center;width:46px;height:46px;flex:0 0 46px;background:#e0bd7b;color:#092229;border-radius:50%}
.spm-audio-action b{font-size:16px}.spm-audio-action[aria-pressed="true"]{outline:2px solid #e0bd7b;outline-offset:3px}.spm-audio-action:focus-visible{outline:3px solid #e0bd7b;outline-offset:4px}
.spm-audio-action.spm-audio-action--compact{position:relative;display:inline-flex!important;justify-content:center;width:56px;height:56px;min-height:56px;flex:none;padding:0!important;margin:6px 0 16px;gap:0;border-radius:50%!important}
.spm-audio-action--compact>span{width:54px;height:54px;flex:0 0 54px}.spm-audio-action--compact b{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.spm-audio-status{margin:8px 0 14px!important;color:#e8d2a4!important;font:400 15px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif!important}.spm-audio-status[hidden]{display:none!important}
`;
function install(doc=document){
 if(!doc||installed.has(doc))return;
 const onClick=event=>{const target=event.target?.closest?.('[data-spm-speak]');if(target)speak(target);};
 const stopDocument=()=>{if(doc===document)stop();else stop(doc);};const onHidden=()=>{if(doc.hidden)stopDocument();};const win=doc.defaultView;
 doc.addEventListener('click',onClick);doc.addEventListener('visibilitychange',onHidden);
 win?.addEventListener('pagehide',stopDocument);win?.addEventListener('spm:session-change',stopDocument);win?.addEventListener('spm:resourcecontext',stopDocument);
 const style=doc.createElement('style');style.id='spmPracticeAudioStyles';style.textContent=css;(doc.head||doc.documentElement).appendChild(style);
 const Observer=win?.MutationObserver||window.MutationObserver;const observer=new Observer(()=>{if(current?.button.ownerDocument===doc&&!current.button.isConnected)stop();});observer.observe(doc.documentElement||doc,{childList:true,subtree:true});installed.set(doc,{observer,onClick,onHidden,stopDocument});
}
window.SPM_PRACTICE_AUDIO={button,stop,install};install();
})();
