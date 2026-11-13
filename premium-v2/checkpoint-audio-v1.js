(()=>{'use strict';
if(window.SPM_CHECKPOINT_AUDIO)return;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const instances=new Set(),bound=new WeakMap(),owners=new WeakMap();
let current=null,nextId=0;
const css=`
.spm-checkpoint-audio{max-width:680px;margin:20px 0 28px;color:#e8eef0}
.spm-checkpoint-audio audio[hidden]{display:none!important}
.spm-checkpoint-audio-toggle{display:flex!important;align-items:center;gap:14px;width:100%;min-height:66px;padding:12px 16px!important;border:1px solid #c5a46c88!important;border-radius:16px!important;background:#102c2d!important;color:#f0e1c1!important;cursor:pointer;font:inherit;text-align:left}
.spm-checkpoint-audio-icon{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:50%;background:#d9bd82;color:#092329;font-size:18px;line-height:1}
.spm-checkpoint-audio-toggle b{font-size:17px;font-weight:700;line-height:1.5}
.spm-checkpoint-audio-toggle:focus-visible,.spm-checkpoint-audio summary:focus-visible{outline:3px solid #d9bd82;outline-offset:4px}
.spm-checkpoint-audio-meter{display:flex;align-items:center;gap:14px;margin:12px 2px 6px}
.spm-checkpoint-audio progress{display:block;flex:1;min-width:0;width:100%;height:6px;border:0;border-radius:8px;overflow:hidden;background:#294244;accent-color:#d9bd82}
.spm-checkpoint-audio progress::-webkit-progress-bar{background:#294244;border-radius:8px}
.spm-checkpoint-audio progress::-webkit-progress-value{background:#d9bd82;border-radius:8px}
.spm-checkpoint-audio progress::-moz-progress-bar{background:#d9bd82;border-radius:8px}
.spm-checkpoint-audio-time{flex:none;min-width:42px;color:#b9cecc;font-size:14px;line-height:1.5;font-variant-numeric:tabular-nums}
.spm-checkpoint-audio details{margin-top:12px}
.spm-checkpoint-audio summary{width:fit-content;min-height:44px;padding:9px 0;cursor:pointer;color:#d9c294;font-size:15px;line-height:1.6}
.spm-checkpoint-audio-transcript{margin:12px 0 0!important;max-width:65ch;color:#c9d7dc!important;font-size:16px!important;line-height:1.75!important;white-space:pre-line}
.spm-checkpoint-audio-status{margin:10px 0!important;color:#e8d2a4!important;font-size:15px!important;line-height:1.6!important}
.spm-checkpoint-audio-status[hidden]{display:none!important}
@media(max-width:440px){.spm-checkpoint-audio-toggle{gap:12px;padding:12px!important}.spm-checkpoint-audio-toggle b{font-size:16px}}
`;
function styles(doc){if(doc.getElementById('spmCheckpointAudioStyles'))return;const style=doc.createElement('style');style.id='spmCheckpointAudioStyles';style.textContent=css;(doc.head||doc.documentElement).appendChild(style);}
function markup({src,text,label='Escuchar explicación'}={}){
 if(!src||!text)return '';
 const id='spmCheckpointAudio'+(++nextId);
 return `<div class="spm-checkpoint-audio" data-checkpoint-audio data-checkpoint-audio-src="${esc(src)}" data-audio-label="${esc(label)}"><audio id="${id}" hidden preload="none" src="${esc(src)}" aria-hidden="true"></audio><button type="button" class="spm-checkpoint-audio-toggle" data-checkpoint-audio-toggle aria-controls="${id}" aria-label="${esc(label)}" aria-pressed="false" data-state="idle"><span class="spm-checkpoint-audio-icon" aria-hidden="true">▶</span><b data-checkpoint-audio-label>${esc(label)}</b></button><div class="spm-checkpoint-audio-meter"><progress value="0" max="1" aria-label="Progreso de la explicación"></progress><span class="spm-checkpoint-audio-time" data-checkpoint-audio-time>0:00</span></div><p class="spm-checkpoint-audio-status" data-checkpoint-audio-status role="status" aria-live="polite" hidden></p><details data-checkpoint-audio-transcript><summary>Leer explicación</summary><p class="spm-checkpoint-audio-transcript">${esc(text)}</p></details></div>`;
}
function time(value){const seconds=Math.max(0,Math.floor(Number(value)||0));return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');}
function updateTime(record){
 const duration=Number(record.audio.duration),position=Math.max(0,Number(record.audio.currentTime)||0),hasDuration=Number.isFinite(duration)&&duration>0;
 record.progress.max=hasDuration?duration:1;record.progress.value=hasDuration?Math.min(position,duration):0;
 record.time.textContent=time(position)+(hasDuration?' / '+time(duration):'');
}
function draw(record,state){
 record.state=state;record.button.dataset.state=state;
 const active=state==='playing'||state==='loading';
 const label=state==='playing'?'Pausar explicación':state==='paused'?'Continuar explicación':state==='loading'?'Preparando audio…':state==='error'?'Reintentar audio':record.label;
 record.button.setAttribute('aria-pressed',String(active));record.button.setAttribute('aria-busy',String(state==='loading'));
 record.button.setAttribute('aria-label',state==='loading'?'Cancelar carga del audio':label);
 record.button.querySelector('[data-checkpoint-audio-label]').textContent=label;
 record.button.querySelector('.spm-checkpoint-audio-icon').textContent=state==='playing'?'Ⅱ':state==='loading'?'…':'▶';
}
function status(record,message=''){record.status.textContent=message;record.status.hidden=!message;}
function reset(record){
 record.token++;if(current===record)current=null;
 try{record.audio.pause();record.audio.currentTime=0;}catch{}
 draw(record,'idle');status(record);updateTime(record);
}
function matches(root,record){return !root||root===record.root||root.contains?.(record.root);}
function stop(root){for(const record of instances)if(matches(root,record))reset(record);}
function dispose(record){
 reset(record);record.button.removeEventListener('click',record.toggle);
 for(const [name,handler] of Object.entries(record.handlers))record.audio.removeEventListener(name,handler);
 owners.delete(record.audio);bound.delete(record.root);instances.delete(record);
 record.audio.removeAttribute('src');try{record.audio.load();}catch{}
}
function fail(record,request){
 if(current!==record||record.token!==request||!record.root.isConnected)return;
 record.token++;current=null;try{record.audio.pause();}catch{}draw(record,'error');
 record.transcript.open=true;status(record,'No pudimos reproducir el audio. Puedes leer la explicación o reintentar.');
}
function pauseOtherMedia(record){
 for(const other of instances)if(other!==record)reset(other);
 try{window.SPM_PRACTICE_AUDIO?.stop();}catch{}
 try{window.SPM_PROGRAM_VIDEOS?.pause();}catch{}
 for(const doc of new Set([document,record.root.ownerDocument]))for(const media of doc.querySelectorAll('audio,video'))if(media!==record.audio){try{media.pause();}catch{}}
}
function play(record){
 if(!record.root.isConnected)return;
 pauseOtherMedia(record);status(record);current=record;const request=++record.token;draw(record,'loading');
 try{
  Promise.resolve(record.audio.play()).then(()=>{
   if(current!==record||record.token!==request||!record.root.isConnected||record.root.ownerDocument.hidden){
    // A late result from an older attempt must not pause a newer attempt.
    if((current!==record||record.token===request)&&owners.get(record.audio)===record)try{record.audio.pause();}catch{}
    return;
   }
   draw(record,'playing');updateTime(record);
  }).catch(()=>fail(record,request));
 }catch{fail(record,request);}
}
function bind(root=document){
 if(!root)return;styles(root.ownerDocument||root);
 const nodes=[...(root.matches?.('[data-checkpoint-audio]')?[root]:[]),...root.querySelectorAll('[data-checkpoint-audio]')];
 for(const node of nodes){
  if(bound.has(node))continue;
  const audio=node.querySelector('audio'),button=node.querySelector('[data-checkpoint-audio-toggle]');if(!audio||!button)continue;
  if(!audio.getAttribute('src'))audio.setAttribute('src',node.dataset.checkpointAudioSrc||'');
  const record={root:node,audio,button,label:node.dataset.audioLabel||'Escuchar explicación',progress:node.querySelector('progress'),time:node.querySelector('[data-checkpoint-audio-time]'),status:node.querySelector('[data-checkpoint-audio-status]'),transcript:node.querySelector('[data-checkpoint-audio-transcript]'),token:0,state:'idle'};
  record.toggle=()=>{
   if(current===record&&(record.state==='playing'||record.state==='loading')){record.token++;try{audio.pause();}catch{}draw(record,'paused');updateTime(record);return;}
   play(record);
  };
  record.handlers={
   timeupdate:()=>updateTime(record),loadedmetadata:()=>updateTime(record),
   pause:()=>{if(current===record&&audio.paused&&!audio.error&&!audio.ended&&record.state!=='error'){record.token++;draw(record,'paused');updateTime(record);}},
   ended:()=>{if(current===record&&audio.ended)reset(record);},
   error:()=>{if(audio.error)fail(record,record.token);}
  };
  button.addEventListener('click',record.toggle);
  for(const [name,handler] of Object.entries(record.handlers))audio.addEventListener(name,handler);
  bound.set(node,record);owners.set(audio,record);instances.add(record);updateTime(record);
 }
}
document.addEventListener('play',event=>{
 const media=event.target;if(!media?.matches?.('audio,video'))return;
 const record=owners.get(media);
 if(record){if(current!==record)try{media.pause();}catch{}return;}
 stop();
},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('pagehide',()=>stop());
window.addEventListener('spm:session-change',()=>stop());
window.addEventListener('spm:resourcecontext',()=>stop());
new MutationObserver(()=>{for(const record of instances)if(!record.root.isConnected)dispose(record);}).observe(document.documentElement,{childList:true,subtree:true});
window.SPM_CHECKPOINT_AUDIO={markup,bind,stop};
})();
