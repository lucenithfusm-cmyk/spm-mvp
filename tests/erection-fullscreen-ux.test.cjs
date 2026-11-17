const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const defs={
 1:{api:'SPM_ED_DAY1_TOUCH',screen:'[data-ed1-session]',next:'[data-ed1-act="next"]',select:'[data-ed1-act="ehs"][data-value="0"]'},
 2:{api:'SPM_ED_DAY2_TOUCH',screen:'[data-ed2-session]',next:'[data-ed2-act="next"]',select:'[data-ed2-context]'},
 3:{api:'SPM_ED_DAY3_TOUCH',screen:'[data-ed3-session]',next:'[data-ed3-action="next"]',select:'[data-ed3-action="area"][data-value="jaw"]'},
 4:{api:'SPM_ED_DAY4_TOUCH',screen:'[data-ed4-session]',next:'[data-ed4-action="next"]',select:'[data-ed4-action="sense"][data-value="temperature"]'}
};
function harness(day){
 const dom=new JSDOM('<!doctype html><html lang="es"><body><main id="spmDailyWorkspace"></main></body></html>',{
  url:'https://spm.test/premium-v2/revision-ereccion-dia'+day+'.html',runScripts:'outside-only',pretendToBeVisual:true
 });
 const {window:w}=dom;
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.SPM_RESOURCE_CONTEXT=()=>({userId:'review',planId:'mock',day,primary:'erection'});
 w.eval(read('premium-v2/erection-fullscreen-v1.js'));
 w.eval(read('premium-v2/erection-day'+day+'-touch-v1.js'));
 const host=w.document.getElementById('spmDailyWorkspace'),api=w[defs[day].api];
 assert.equal(api.mount({host,prior:{},scope:'review:mock',valid:()=>true,save:async()=>({ok:true}),onBack:()=>{}}),true);
 return {dom,w,host};
}
test('las cuatro sesiones se montan de forma independiente y muestran el aviso centrado al faltar una opción',()=>{
 for(const day of [1,2,3,4]){
  const {dom,w,host}=harness(day),cfg=defs[day];
  try{
   assert.ok(host.querySelector('.spm-er-fullscreen'), 'día '+day+' pantalla completa');
   assert.equal(host.querySelector(cfg.screen).dataset.screen,'1');
   if(day===1)host.querySelector(cfg.next).click(); // la escala requerida está en pantalla 2
   const wanted=day===1?'2':'1';
   assert.equal(host.querySelector(cfg.screen).dataset.screen,wanted);
   host.querySelector(cfg.next).click();
   const alert=host.querySelector('[data-spm-er-alert]');
   assert.ok(alert, 'día '+day+' debe mostrar mensaje centrado');
   assert.equal(alert.querySelector('[role=alertdialog]').getAttribute('aria-modal'),'true');
   assert.equal(alert.querySelector('strong').textContent,'Selecciona una opción');
   assert.ok(alert.querySelector('p').textContent.length>15);
   assert.equal(w.document.activeElement,alert.querySelector('[data-spm-er-close]'));
   alert.querySelector('[data-spm-er-close]').click();
   assert.equal(host.querySelector('[data-spm-er-alert]'),null);
   if(day===2){
    for(const select of host.querySelectorAll(cfg.select)){select.value='easy';select.dispatchEvent(new w.Event('change',{bubbles:true}))}
   }else host.querySelector(cfg.select).click();
   host.querySelector(cfg.next).click();
   assert.equal(host.querySelector(cfg.screen).dataset.screen,String(Number(wanted)+1));
  }finally{dom.window[defs[day].api]?.stop?.();dom.window.close()}
 }
});
test('alerta accesible conserva foco y no bloquea el fondo después de cerrarse',()=>{
 const {dom,host,w}=harness(4);
 try{
  const next=host.querySelector(defs[4].next);next.focus();
  next.click();
  const layer=host.querySelector('[data-spm-er-alert]');
  assert.ok(layer);
  const key=new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true});
  layer.dispatchEvent(key);
  assert.equal(host.querySelector('[data-spm-er-alert]'),null);
  assert.equal(w.document.activeElement,next);
 }finally{dom.window.SPM_ED_DAY4_TOUCH.stop();dom.window.close()}
});
test('el diseño conserva las láminas y usa un viewport móvil sin anchos rígidos',()=>{
 const c=read('premium-v2/erection-fullscreen-v1.css');
 assert.ok(c.includes('position:fixed!important'));
 assert.ok(c.includes('height:100dvh!important'));
 assert.ok(c.includes('max-width:540px!important'));
 assert.ok(c.includes('spm-er-alert-layer'));
 assert.ok(c.includes('background:rgba(2,19,35,.55)'));
});
