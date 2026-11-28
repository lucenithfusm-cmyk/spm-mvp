/* SPM voice policy 2026-11-27. The system selects the Spanish default.
 * One coordinator across same-origin screens/iframes. No patient responses,
 * microphone, paid TTS service, or practice completion is involved. */
(()=>{'use strict';
if(window.SPM_VOICE)return;
try{if(window.parent!==window&&window.parent.SPM_VOICE?.forWindow){window.SPM_VOICE=window.parent.SPM_VOICE.forWindow(window);return;}}catch{}
const native=window.speechSynthesis,Utterance=window.SpeechSynthesisUtterance;
const supported=!!(native&&typeof native.speak==='function'&&typeof Utterance==='function');
const clients=new WeakMap(),listeners=new Set(),styledDocuments=new WeakSet();
let generation=0,current=null,voices=[],panel=null,preference={lang:'es-CO',voiceURI:''};
const ownershipObserver=new MutationObserver(()=>{if(current&&(current.owner?.nodeType&&!current.owner.isConnected||current.frame&&!current.frame.isConnected))cancel('owner-removed');});
const cancellations=new Set(['canceled','interrupted']);
const errorCopy={
 'not-allowed':'El navegador no permitió iniciar la voz. Pulsa Reintentar.',
 'language-unavailable':'Esta variante de español no está disponible. Puedes elegir otra voz de tu dispositivo.',
 'voice-unavailable':'La voz elegida no está disponible aquí. Vuelve a la voz estándar o elige otra.',
 'synthesis-unavailable':'La voz no está disponible en este dispositivo. La guía escrita sigue disponible.',
 network:'No se pudo conectar el servicio de voz del dispositivo. Puedes reintentar o leer la guía.',
 'audio-busy':'La salida de audio está ocupada. Detén la otra reproducción y reintenta.',
 'audio-hardware':'No se pudo usar la salida de audio. Puedes revisar el sonido del dispositivo o leer la guía.',
 'start-timeout':'La voz no llegó a iniciarse. Puedes reintentar o elegir otra variante de español.'
};
function refreshVoices(){try{voices=native?.getVoices?.()||[];}catch{voices=[];}render();return voices.slice();}
function split(text){
 const result=[];for(const paragraph of String(text||'').split(/\n+/).filter(x=>x.trim())){
  let chunk='';
  for(const word of paragraph.trim().split(/\s+/)){if(chunk.length+word.length>320&&chunk){result.push(chunk);chunk='';}chunk+=(chunk?' ':'')+word;}
  if(chunk)result.push(chunk);
 }return result;
}
function call(source,event,detail={}){try{source?.['on'+event]?.({type:event,target:source,...detail});}catch{}}
function state(record,name,message=''){
 if(!record)return;record.state=name;record.message=message;
 try{record.options?.onstate?.({state:name,message,index:record.index,total:record.chunks.length});}catch{}
 for(const listener of listeners)try{listener({state:name,message,owner:record.owner});}catch{}
 render();
}
function detach(record){clearTimeout(record?.startTimer);if(record?.utterance){record.utterance.onstart=record.utterance.onend=record.utterance.onerror=record.utterance.onboundary=null;}}
function cancel(reason='canceled'){
 // Older consumers clear their own playing button with cancel() in onerror.
 // Keep the common error, readable script and recovery selector available.
 // Explicit lifecycle/user cancellation still removes that failed record.
 if(current?.notifyingError&&reason==='canceled')return;
 const old=current;current=null;generation++;detach(old);
 try{native?.cancel();if(native?.paused)native.resume();}catch{}
 if(old&&!['ended','error','stopped'].includes(old.state)){state(old,'stopped');call(old.source,'cancel',{error:reason});}
 render();
}
function fail(record,code){
 if(current!==record)return;generation++;detach(record);try{native?.cancel();}catch{}
 state(record,'error',errorCopy[code]||'No pudimos reproducir la voz. Puedes leer la guía o reintentar.');
 record.notifyingError=true;call(record.source,'error',{error:code});record.notifyingError=false;
}
function startChunk(record){
 if(current!==record||record.state==='paused')return;
 if(record.index>=record.chunks.length){detach(record);state(record,'ended');call(record.source,'end');return;}
 const token=generation,u=new Utterance(record.chunks[record.index]);record.utterance=u;
 const requested=record.options.lang||record.source.lang||'es-CO';u.lang=/^es(?:-|$)/i.test(requested)?preference.lang:requested;u.rate=Number(record.source.rate)||1;u.pitch=1;u.volume=1;
 // Only an explicit choice in the recovery selector can override the default.
 if(preference.voiceURI&&/^es(?:-|$)/i.test(requested)){const selected=voices.find(v=>v.voiceURI===preference.voiceURI&&/^es(?:-|$)/i.test(v.lang));if(selected)u.voice=selected;else preference.voiceURI='';}
 state(record,'preparing');
 u.onstart=()=>{if(current!==record||token!==generation)return;clearTimeout(record.startTimer);state(record,'playing');if(!record.started){record.started=true;call(record.source,'start');}};
 u.onboundary=e=>{if(current===record&&token===generation)call(record.source,'boundary',{charIndex:e.charIndex,name:e.name});};
 u.onend=()=>{if(current!==record||token!==generation)return;clearTimeout(record.startTimer);record.index++;startChunk(record);};
 u.onerror=e=>{if(current!==record||token!==generation)return;if(cancellations.has(e?.error)){cancel(e.error);return;}fail(record,e?.error||'synthesis-failed');};
 record.startTimer=setTimeout(()=>{if(current===record&&generation===token&&record.state==='preparing')fail(record,'start-timeout');},8000);
 try{if(native.paused)native.resume();native.speak(u);}catch(e){fail(record,e?.name==='NotAllowedError'?'not-allowed':'synthesis-failed');}
}
function speak(source,options={},ownerWindow=window){
 if(typeof source==='string')source={text:source};
 if(!source||!String(source.text||'').trim())return false;
 cancel();refreshVoices();
 for(const doc of new Set([document,ownerWindow.document]))for(const media of doc.querySelectorAll('audio,video'))if(!media.muted&&media.volume!==0&&!media.hasAttribute('data-spm-nonverbal'))try{media.pause();}catch{}

 const record={source,options,ownerWindow,owner:options.owner||null,frame:ownerWindow!==window?ownerWindow.frameElement:null,chunks:split(source.text),index:0,started:false,state:'idle',message:''};current=record;
 // Reading the same approved guide is always possible, including without TTS.
 if(!supported){fail(record,'synthesis-unavailable');return false;}
 startChunk(record);return true;
}
function pause(){
 const record=current;if(!record||!['playing','preparing'].includes(record.state))return;
 generation++;detach(record);try{native?.cancel();}catch{}
 state(record,'paused','Al reanudar se repetirá el párrafo actual.');call(record.source,'pause');
}
function resume(){const record=current;if(!record||record.state!=='paused')return;generation++;state(record,'preparing');call(record.source,'resume');startChunk(record);}
function retry(){const record=current;if(!record)return;const source=record.source,options=record.options,ownerWindow=record.ownerWindow;speak(source,options,ownerWindow);}
function transcript(text,label='Leer guía completa'){
 const escape=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return '<details class="spm-voice-transcript"><summary>'+escape(label)+'</summary><div style="white-space:pre-line">'+escape(text)+'</div></details>';
}
function forWindow(win){
 if(clients.has(win))return clients.get(win);
 const api={supported,forWindow,transcript,getVoices:refreshVoices,
  speak:(source,options)=>speak(source,options||{},win),
  listen:(text,options={})=>speak({text,lang:options.lang,rate:options.rate,onend:options.onend,onerror:options.onerror,oncancel:options.oncancel},options,win),
  cancel,pause,resume,retry,
  subscribe:listener=>{listeners.add(listener);return()=>listeners.delete(listener);},
  get state(){return current?.state||'idle';},get speaking(){return ['preparing','playing'].includes(current?.state);},get pending(){return current?.state==='preparing';},get paused(){return current?.state==='paused';},
  get currentOwner(){return current?.owner||null;}
 };
 clients.set(win,api);
 ownershipObserver.observe(win.document.documentElement,{subtree:true,childList:true});
 const stopOwner=()=>{if(current?.ownerWindow===win||win===window)cancel('context-change');};
 win.addEventListener('pagehide',stopOwner);win.addEventListener('spm:session-change',stopOwner);win.addEventListener('spm:resourcecontext',stopOwner);win.addEventListener('spm:day-change',stopOwner);win.addEventListener('popstate',stopOwner);
 win.document.addEventListener('visibilitychange',()=>{if(win.document.hidden)stopOwner();});
 win.document.addEventListener('close',e=>{if(current?.ownerWindow===win&&current.owner?.closest?.('dialog')===e.target)cancel('owner-closed');},true);
 // Silent visual demonstrations must not cancel the narration they illustrate.
 win.document.addEventListener('play',e=>{const media=e.target;if(media?.matches?.('audio,video')&&!media.muted&&media.volume!==0&&!media.hasAttribute('data-spm-nonverbal'))stopOwner();},true);
 return api;
}
function installPanelStyle(doc){
 if(!doc?.head||styledDocuments.has(doc))return;
 const style=doc.createElement('style');style.textContent='.spm-voice-transcript{box-sizing:border-box;width:min(720px,100%);margin:10px auto;padding:12px 16px;background:#102c32;color:#f4e9d3;border:1px solid #c5a46c;border-radius:12px;font:15px/1.5 system-ui}.spm-voice-transcript summary{cursor:pointer;min-height:36px;font-weight:650}.spm-voice-transcript summary:focus-visible{outline:3px solid #ffe1a3;outline-offset:3px}.spm-device-voice{position:static;box-sizing:border-box;flex:0 0 auto;clear:both;width:min(540px,calc(100% - 20px));max-width:100%;margin:10px auto;background:#102c32;color:#f4e9d3;border:1px solid #c5a46c;border-radius:14px;padding:10px;box-shadow:0 5px 24px #0008;font:14px/1.45 system-ui}.spm-device-voice[hidden]{display:none}.spm-device-voice summary{cursor:pointer;min-height:35px;font-weight:650}.spm-device-voice button,.spm-device-voice select{font:inherit;min-height:40px;padding:7px 10px;background:#183f43;color:#ffedca;border:1px solid #bca16f;border-radius:9px;margin:3px}.spm-device-voice button:focus-visible,.spm-device-voice select:focus-visible{outline:3px solid #ffe1a3;outline-offset:2px}.spm-device-voice p{margin:6px 0}.spm-device-voice [data-voice-text]{white-space:pre-line;max-height:35dvh;overflow:auto}.spm-device-voice select{max-width:100%}.spm-device-voice .spm-voice-controls{display:flex;flex-wrap:wrap;gap:2px}';doc.head.appendChild(style);styledDocuments.add(doc);
}
function ensurePanel(){
 installPanelStyle(document);
 if(panel||!document?.body)return;
 panel=document.createElement('aside');panel.className='spm-device-voice';panel.setAttribute('aria-label','Guía de voz');panel.hidden=true;
 panel.innerHTML='<details><summary>Guía de voz <span data-voice-summary aria-live="polite"></span></summary><p role="status" aria-live="polite" data-voice-status></p><div class="spm-voice-controls"><button type="button" data-voice-toggle>Pausar</button><button type="button" data-voice-stop>Detener</button></div><details><summary>Leer guía completa</summary><p data-voice-text></p></details><details data-voice-recovery><summary>Opciones de voz del dispositivo</summary><label>Variante de español <select data-voice-language><option value="es-CO">Español (Colombia)</option><option value="es-ES">Español (España)</option><option value="es-MX">Español (México)</option><option value="es-US">Español (Estados Unidos)</option></select></label><label>Voz <select data-voice-selection><option value="">Voz estándar del dispositivo</option></select></label><p>El cambio se aplica al volver a escuchar. Las voces disponibles dependen de este dispositivo.</p></details></details>';
 panel.querySelector('[data-voice-toggle]').onclick=()=>current?.state==='paused'?resume():current?.state==='error'||current?.state==='ended'?retry():pause();
 panel.querySelector('[data-voice-stop]').onclick=()=>cancel('user-stopped');
 panel.querySelector('[data-voice-language]').onchange=e=>{preference.lang=e.target.value;preference.voiceURI='';};
 panel.querySelector('[data-voice-selection]').onchange=e=>{preference.voiceURI=e.target.value;};
 document.body.appendChild(panel);
}
function panelTarget(record){
 const doc=record.ownerWindow?.document||document;
 const owner=record.owner?.ownerDocument===doc?record.owner:doc.activeElement;
 // Keep this optional panel in the activity's scroll flow. A fixed overlay
 // covered navigation and original artwork, especially when speech failed.
 const selector='dialog[open],[role=dialog],.spm-er-fullscreen';
 const dialogs=[...doc.querySelectorAll('dialog[open]')];
 const target=owner?.closest?.(selector)||owner?.querySelector?.('.spm-er-fullscreen')||dialogs[dialogs.length-1]||doc.querySelector('.spm-er-fullscreen')||doc.body;
 return {doc,target};
}
function render(){
 ensurePanel();if(!panel||!document?.body)return;panel.hidden=!current;
 if(!current){if(panel.ownerDocument!==document&&document.body)document.body.appendChild(panel);return;}
 const {doc,target}=panelTarget(current);installPanelStyle(doc);
 if(target&&panel.parentElement!==target)target.appendChild(panel);
 const record=current,labels={idle:'',preparing:' · Preparando',playing:' · Reproduciendo',paused:' · Pausada',ended:' · Finalizada',error:' · No disponible',stopped:' · Detenida'};
 panel.querySelector('[data-voice-summary]').textContent=labels[record.state]||'';
 panel.querySelector('[data-voice-status]').textContent=record.message;
 panel.querySelector('[data-voice-text]').textContent=record.source.text;
 panel.querySelector('[data-voice-toggle]').textContent=record.state==='paused'?'Reanudar desde este párrafo':record.state==='error'?'Reintentar':record.state==='ended'?'Escuchar de nuevo':'Pausar';
 const selection=panel.querySelector('[data-voice-selection]');selection.replaceChildren();
 const standard=document.createElement('option');standard.value='';standard.textContent='Voz estándar del dispositivo';selection.appendChild(standard);
 for(const voice of voices.filter(v=>/^es(?:-|$)/i.test(v.lang)).sort((a,b)=>Number(b.localService)-Number(a.localService))){const option=document.createElement('option');option.value=voice.voiceURI;option.textContent=voice.name+' ('+voice.lang+(voice.localService?', local':'')+')';selection.appendChild(option);}selection.value=preference.voiceURI;
 panel.querySelector('[data-voice-language]').value=preference.lang;
 // Expanding controls, transcript and recovery is always an explicit action.
}
window.SPM_VOICE=forWindow(window);
refreshVoices();native?.addEventListener?.('voiceschanged',refreshVoices);
document.addEventListener('DOMContentLoaded',render,{once:true});
})();
