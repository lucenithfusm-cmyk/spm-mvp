(()=>{
'use strict';
if(window.SPM_FIRMNESS_GUIDE)return;
const src='/premium-v2/assets/images/erection/response-firmness-spm-20261113.jpg';
const levels=Object.freeze([
 Object.freeze({value:4,label:'Erección completa'}),
 Object.freeze({value:3,label:'Erección incompleta, pero permite penetración'}),
 Object.freeze({value:2,label:'Hay rigidez, pero no es suficiente para la penetración'}),
 Object.freeze({value:1,label:'Aumento de tamaño, pero no es una erección'})
]);
const t=(es,en)=>window.SPM_LANG==='en'?en:es;
let dialog=null,opener=null;
function styles(){
 if(document.getElementById('spmFirmnessGuideStyle'))return;
 const style=document.createElement('style');style.id='spmFirmnessGuideStyle';style.textContent=`
.spm-firmness-guide{margin:0 0 24px;overflow:hidden;border:1px solid #c5a46c80;border-radius:18px;background:#102e4e;color:#f8f7f2}
.spm-firmness-guide .spm-firmness-preview{display:block;width:100%;min-height:0;padding:0;border:0;border-radius:0;background:transparent;cursor:zoom-in;line-height:0}
.spm-firmness-guide img{display:block;width:100%;height:auto;max-width:100%;margin:0;border:0;border-radius:0;object-fit:contain}
.spm-firmness-guide figcaption{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:16px 18px;border-top:1px solid #c5a46c55}
.spm-firmness-guide .spm-firmness-expand{min-height:48px;padding:11px 18px;border:1px solid #d5b57a;border-radius:11px;background:#d5b57a;color:#10283a;font:inherit;font-size:17px;font-weight:700;cursor:pointer;line-height:1.4}
.spm-firmness-guide figcaption p{flex:1 1 230px;margin:0;color:#d5e1e9;font-size:16px;line-height:1.55}
.spm-firmness-guide button:focus-visible,#spmFirmnessGuideDialog button:focus-visible{outline:3px solid #fff1c8;outline-offset:-4px}
#spmFirmnessGuideDialog{width:min(1200px,calc(100% - 24px));max-width:none;max-height:calc(100dvh - 24px);margin:auto;padding:0;overflow:hidden;border:1px solid #d3b476;border-radius:20px;background:#102e4e;color:#f8f7f2;box-sizing:border-box;font-family:inherit}
#spmFirmnessGuideDialog::backdrop{background:#020a13ed}
#spmFirmnessGuideDialog[open]{display:flex;flex-direction:column}
#spmFirmnessGuideDialog .spm-firmness-dialog-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:16px 20px;border-bottom:1px solid #c5a46c60;background:#0a2033;flex:0 0 auto}
#spmFirmnessGuideDialog h2{font-size:20px;line-height:1.35;margin:0;color:#f3e6c7}
#spmFirmnessGuideDialog .spm-firmness-dialog-actions{display:flex;gap:10px;flex-wrap:wrap}
#spmFirmnessGuideDialog button{min-height:48px;padding:10px 16px;border:1px solid #b8a16e;border-radius:10px;background:#15354e;color:#fff;font:inherit;font-size:17px;font-weight:650;cursor:pointer;line-height:1.4}
#spmFirmnessGuideDialog [data-firmness-close]{background:#d5b57a;color:#10283a}
#spmFirmnessGuideDialog .spm-firmness-viewport{overflow:auto;min-height:0;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
#spmFirmnessGuideDialog img{display:block;width:100%;max-width:100%;height:auto;margin:0 auto;object-fit:contain}
#spmFirmnessGuideDialog .is-zoomed img{width:2000px;max-width:none;margin:0}
#spmFirmnessGuideDialog .spm-firmness-zoom-hint{margin:0;padding:10px 20px;background:#0a2033;color:#d5e1e9;font-size:15px;line-height:1.5;flex:0 0 auto}
#spmFirmnessGuideDialog [hidden]{display:none!important}
@media(max-width:540px){#spmFirmnessGuideDialog{width:calc(100% - 12px);max-height:calc(100dvh - 12px);border-radius:16px}#spmFirmnessGuideDialog .spm-firmness-dialog-head{padding:14px}.spm-firmness-guide figcaption{padding:14px}.spm-firmness-guide .spm-firmness-expand{width:100%}}
`;
 document.head.appendChild(style);
}
function html(){
 styles();
 return '<figure class="spm-firmness-guide"><button type="button" class="spm-firmness-preview" data-firmness-expand aria-haspopup="dialog" aria-label="'+t('Ampliar lámina de grados de respuesta eréctil','Enlarge the erection firmness guide')+'"><img src="'+src+'" width="2000" height="1500" loading="lazy" decoding="async" alt="'+t('Lámina SPM de respuesta eréctil: grados 4, 3, 2 y 1. Las descripciones aparecen en las opciones de respuesta.','SPM erection firmness guide: grades 4, 3, 2 and 1. Descriptions are provided in the response options.')+'"></button><figcaption><button type="button" class="spm-firmness-expand" data-firmness-expand aria-haspopup="dialog">'+t('Ampliar lámina','Enlarge guide')+'</button><p>'+t('Elige según la descripción. El ángulo del dibujo es orientativo.','Choose by the description. The angle in the drawing is illustrative.')+'</p></figcaption></figure>';
}
function close(){if(dialog?.open)dialog.close();}
function createDialog(){
 if(dialog)return dialog;
 styles();dialog=document.createElement('dialog');dialog.id='spmFirmnessGuideDialog';dialog.setAttribute('aria-labelledby','spmFirmnessGuideTitle');
 dialog.innerHTML='<header class="spm-firmness-dialog-head"><h2 id="spmFirmnessGuideTitle">'+t('Grados de respuesta eréctil','Erection firmness grades')+'</h2><div class="spm-firmness-dialog-actions"><button type="button" data-firmness-zoom aria-pressed="false">'+t('Acercar','Zoom in')+'</button><button type="button" data-firmness-close>'+t('Cerrar','Close')+'</button></div></header><div class="spm-firmness-viewport" tabindex="0" aria-label="'+t('Lámina ampliable','Zoomable guide')+'"><img src="'+src+'" width="2000" height="1500" alt="'+t('4: Erección completa. 3: Erección incompleta, pero permite penetración. 2: Hay rigidez, pero no es suficiente para la penetración. 1: Aumento de tamaño, pero no es una erección.','4: Fully rigid erection. 3: Firm enough for penetration, but not fully rigid. 2: Some rigidity, but not enough for penetration. 1: Enlargement without an erection.')+'"></div><p class="spm-firmness-zoom-hint" hidden>'+t('Desliza para recorrer la lámina.','Scroll to explore the guide.')+'</p>';
 document.body.appendChild(dialog);
 dialog.querySelector('[data-firmness-close]').addEventListener('click',close);
 dialog.querySelector('[data-firmness-zoom]').addEventListener('click',()=>{
  const viewport=dialog.querySelector('.spm-firmness-viewport'),zoomed=viewport.classList.toggle('is-zoomed'),button=dialog.querySelector('[data-firmness-zoom]');
  button.setAttribute('aria-pressed',String(zoomed));button.textContent=zoomed?t('Ver completa','Fit to view'):t('Acercar','Zoom in');
  dialog.querySelector('.spm-firmness-zoom-hint').hidden=!zoomed;viewport.scrollTop=0;viewport.scrollLeft=0;
 });
 dialog.addEventListener('close',()=>{const previous=opener;opener=null;if(previous?.isConnected)previous.focus({preventScroll:true});});
 return dialog;
}
function open(button){
 const target=createDialog();if(target.open)return;
 opener=button||null;
 target.querySelector('.spm-firmness-viewport').classList.remove('is-zoomed');
 const zoom=target.querySelector('[data-firmness-zoom]');zoom.setAttribute('aria-pressed','false');zoom.textContent=t('Acercar','Zoom in');
 target.querySelector('.spm-firmness-zoom-hint').hidden=true;
 target.showModal();target.querySelector('.spm-firmness-viewport').scrollTop=0;target.querySelector('.spm-firmness-viewport').scrollLeft=0;
 target.querySelector('[data-firmness-close]').focus({preventScroll:true});
}
function bind(root){
 if(!root?.querySelectorAll)return;
 root.querySelectorAll('[data-firmness-expand]').forEach(button=>{
  if(button.dataset.firmnessBound)return;
  button.dataset.firmnessBound='1';button.addEventListener('click',()=>open(button));
 });
}
window.addEventListener('spm:session-change',close);
window.addEventListener('spm:resourcecontext',close);
window.SPM_FIRMNESS_GUIDE={src,levels,html,bind,open,close};
})();
