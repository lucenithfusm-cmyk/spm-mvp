(()=>{'use strict';
if(window.SPM_PRACTICE_AUDIO)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon='<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5V4Z"/><path d="M15 8a6 6 0 0 1 0 8M18 4a11 11 0 0 1 0 16"/></svg>';
const installed=new WeakMap();
let current=null;
function within(root,button){
 if(!root)return true;
 if(root===button||root.contains?.(button))return true;
 // A parent dialog contains its iframe, not the iframe's document nodes.
 let win=button.ownerDocument?.defaultView;
 try{
  while(win&&win!==win.parent){
   const frame=win.frameElement;if(!frame)break;
   if(root===frame||root.contains?.(frame))return true;
   win=frame.ownerDocument?.defaultView;
  }
 }catch{}
 return false;
}
function label(button,text,pressed=false){
 button.setAttribute('aria-pressed',String(pressed));button.setAttribute('aria-label',text);button.title=text;
 const copy=button.querySelector('b');if(copy)copy.textContent=text;
}
function reset(button){label(button,button.dataset.audioLabel||'Escuchar indicación');}
function stop(root){
 if(root&&(!current||!within(root,current.button)))return;
 const previous=current;current=null;
 if(previous)reset(previous.button);
 try{window.speechSynthesis?.cancel();}catch{}
}
function button(text,name='Escuchar indicación',options={}){
 const compact=options?.compact===true;
 return `<button type="button" class="spm-audio-action${compact?' spm-audio-action--compact':''}" data-spm-speak="${esc(text)}" data-audio-label="${esc(name)}"${compact?' data-audio-compact="true"':''} aria-label="${esc(name)}" title="${esc(name)}" aria-pressed="false"><span aria-hidden="true">${icon}</span><b>${esc(name)}</b></button>`;
}
function status(button,message){
 let notice=button.nextElementSibling;
 if(!notice?.hasAttribute('data-spm-audio-status')){
  if(!message)return;
  notice=button.ownerDocument.createElement('p');notice.className='spm-audio-status';notice.dataset.spmAudioStatus='';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');button.after(notice);
 }
 notice.textContent=message||'';notice.hidden=!message;
}
function reveal(button,message,retry=true){
 const section=button.closest('[data-video-action]')||button.closest('section,article,form');
 const details=section?.querySelector('details');if(details)details.open=true;
 label(button,retry?'Reintentar audio':'Audio no disponible');
 status(button,message);
}
function pauseMedia(doc){
 try{window.SPM_PROGRAM_VIDEOS?.pause();}catch{}
 for(const owner of new Set([document,doc]))for(const media of owner.querySelectorAll('audio,video')){try{media.pause();}catch{}}
}
function speak(button){
 if(current?.button===button){stop();return;}
 stop();status(button,'');
 const synthesis=window.speechSynthesis,Utterance=window.SpeechSynthesisUtterance;
 if(!synthesis||typeof synthesis.speak!=='function'||typeof Utterance!=='function'){
  reveal(button,'El audio no está disponible. Puedes leer las instrucciones.',false);return;
 }
 // Pause before assigning current: a program player may also stop narration.
 pauseMedia(button.ownerDocument);
 let utterance;
 try{
  utterance=new Utterance(button.dataset.spmSpeak||'');utterance.lang='es-CO';utterance.rate=.92;
  let voices=[];try{voices=synthesis.getVoices?.()||[];}catch{}
  utterance.voice=voices.find(v=>v.lang?.toLowerCase()==='es-co')||voices.find(v=>/^es(?:-|$)/i.test(v.lang))||null;
  current={button,utterance};label(button,'Detener audio',true);
  utterance.onend=()=>{if(current?.utterance===utterance){current=null;reset(button);}};
  utterance.onerror=event=>{
   if(current?.utterance!==utterance)return;
   current=null;reset(button);
   if(!['canceled','interrupted'].includes(event?.error))reveal(button,'No pudimos reproducir el audio. Puedes leer las instrucciones o reintentar.');
  };
  synthesis.speak(utterance);
 }catch{
  if(current?.utterance===utterance)stop();
  reveal(button,'No pudimos reproducir el audio. Puedes leer las instrucciones o reintentar.');
 }
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
 const onPlay=event=>{if(event.target?.matches?.('audio,video'))stop();};
 const stopDocument=()=>{if(doc===document)stop();else stop(doc);};
 const onHidden=()=>{if(doc.hidden)stopDocument();};
 const win=doc.defaultView;
 doc.addEventListener('click',onClick);doc.addEventListener('play',onPlay,true);doc.addEventListener('visibilitychange',onHidden);
 win?.addEventListener('pagehide',stopDocument);win?.addEventListener('spm:session-change',stopDocument);
 const style=doc.createElement('style');style.id='spmPracticeAudioStyles';style.textContent=css;(doc.head||doc.documentElement).appendChild(style);
 const Observer=win?.MutationObserver||window.MutationObserver;
 const observer=new Observer(()=>{if(current?.button.ownerDocument===doc&&!current.button.isConnected)stop();});
 observer.observe(doc.documentElement||doc,{childList:true,subtree:true});
 installed.set(doc,{observer,onClick,onPlay,onHidden,stopDocument});
}
window.SPM_PRACTICE_AUDIO={button,stop,install};
install();
})();
