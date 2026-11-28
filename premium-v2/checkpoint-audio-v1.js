(()=>{'use strict';
if(window.SPM_CHECKPOINT_AUDIO)return;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
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
function markup({text,label='Escuchar explicación'}={}){
 if(!text)return '';
 return `<div class="spm-checkpoint-audio" data-checkpoint-audio><button type="button" class="spm-checkpoint-audio-toggle" data-checkpoint-audio-toggle data-spm-speak="${esc(text)}" data-audio-label="${esc(label)}" aria-label="${esc(label)}" aria-pressed="false"><span class="spm-checkpoint-audio-icon" aria-hidden="true">▶</span><b data-checkpoint-audio-label>${esc(label)}</b></button><details data-checkpoint-audio-transcript><summary>Leer explicación</summary><p class="spm-checkpoint-audio-transcript">${esc(text)}</p></details></div>`;
}
function bind(root=document){if(!root)return;const doc=root.ownerDocument||root;styles(doc);window.SPM_PRACTICE_AUDIO?.install(doc);}
function stop(root){window.SPM_PRACTICE_AUDIO?.stop(root);}
window.SPM_CHECKPOINT_AUDIO={markup,bind,stop};
})();
