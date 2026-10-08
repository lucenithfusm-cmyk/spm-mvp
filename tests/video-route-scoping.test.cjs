const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'../premium-v2/spm-video-library.js'),'utf8');
function setup(){
 const window={};const doc={head:{appendChild(){}},body:{},createElement(){return {style:{}}},
 addEventListener(){},querySelectorAll(){return []},getElementById(){return null}};
 class MutationObserver{observe(){}}
 vm.runInNewContext(src,{window,document:doc,MutationObserver});
 return {window,route:window.SPM_VIDEO_ROUTING.pickVideo};
}
const profile=(primary,extra={})=>({userId:'test',planId:'plan1',primary,secondary:null,motives:[primary],safety:'none',...extra});
const task=(title,practice='')=>({title,practice});
test('library still lists all twelve media resources and local videos exist',()=>{
 const x=setup();assert.equal(x.window.SPM_VIDEO_LIBRARY.length,12);
 for(const v of x.window.SPM_VIDEO_LIBRARY)if(v.url.startsWith('assets/videos/'))
  assert(fs.existsSync(path.join(__dirname,'../premium-v2',v.url)),v.key);
});
test('inline video assignment selects the primary daily activity, not the whole card',()=>{
 const x=setup(),card={textContent:'Bajo deseo sexual; ansiedad; historia secundaria',
 querySelector(s){return {textContent:s==='.dayTop h4'?'Focalización sensorial I':'Contacto sensorial sin presión'}}};
 const activity=x.window.SPM_VIDEO_ROUTING.dayActivity(card);
 assert.equal(x.route(activity,profile('erection')).key,'sensory-focus');
});
test('video assignments respect primary and secondary clinical-educational routes',()=>{
 const x=setup();
 assert.equal(x.route(task('Reactivación del deseo','Explora deseo responsivo'),profile('desire')).key,'dr-low-desire');
 assert.equal(x.route(task('Reactivación del deseo','Explora deseo responsivo'),profile('ejaculation')),null);
 assert.equal(x.route(task('Bajo deseo sexual'),profile('erection',{secondary:'desire'})).key,'dr-low-desire');
 assert.equal(x.route(task('Comunicación con la pareja'),profile('anxiety')).key,'partner-communication');
 assert.equal(x.route(task('Preparación mental antes del encuentro'),profile('ejaculation')).key,'mental-preparation');
 assert.equal(x.route(task('Ansiedad de rendimiento'),profile('confidence')).key,'performance-anxiety');
 assert.equal(x.route(task('Respiración diafragmática'),profile('ejaculation')).key,'breathing-guided');
});
test('no automated practice video without an active plan or with urgent safety flag',()=>{
 const x=setup();
 assert.equal(x.route(task('Foco sensorial'),null),null);
 assert.equal(x.route(task('Bajo deseo'),profile('desire',{planId:null})),null);
 assert.equal(x.route(task('Bajo deseo'),profile('desire',{safety:'urgent'})),null);
});
