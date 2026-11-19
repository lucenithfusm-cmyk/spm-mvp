const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../labs/breathing/node_modules/jsdom');
const root=path.resolve(__dirname,'..');

function openEntry(name,context){
 const file=`premium-v2/${name}/index.html`;
 return new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{
  url:'https://spm.test/'+file,runScripts:'dangerously',
  // External scripts are inspected, not executed: this checks the actual router
  // entry; the controller suites exercise behavior and persistence separately.
  beforeParse(w){w.SPM_PELVIC_LAB_HOST={getContext:()=>context};}
 });
}
function assertLocalResources(doc){
 for(const el of doc.querySelectorAll('script[src],link[rel="stylesheet"]')){
  const url=new URL(el.src||el.href);
  assert.equal(url.origin,'https://spm.test');
  const file=path.resolve(root,'.'+url.pathname);
  assert.ok(file.startsWith(root+path.sep));
  assert.ok(fs.statSync(file).size>0,'Missing active resource: '+url.pathname);
 }
}
test('Focalización uses the approved touch entry and existing assets, not the retained React build',()=>{
 const dom=openEntry('sensate-lab');
 try{
  const doc=dom.window.document;
  assert.ok(doc.querySelector('#sensatePremium'));
  assert.equal(doc.querySelector('#root'),null);
  assert.equal(doc.querySelectorAll('script[src]').length,1);
  assert.equal(new URL(doc.querySelector('script[src]').src).pathname,'/premium-v2/sensate-premium-v1.js');
  assertLocalResources(doc);
 }finally{dom.window.close();}
});
test('Pelvic Floor Lab routes the four assigned weekly sessions to the approved weekly controller',()=>{
 for(const day of [3,10,17,24]){
  const dom=openEntry('pelvic-floor-lab',{origin:'dailyPlan',intent:'daily-relax',activityId:'pelvic-daily-lab',day});
  try{
   const doc=dom.window.document,scripts=[...doc.querySelectorAll('script[src]')];
   assert.equal(scripts.length,1,'one active controller');
   assert.equal(new URL(scripts[0].src).pathname,'/premium-v2/pelvic-floor-lab/pelvic-weekly-flow-v1.js');
   assert.equal(doc.querySelector('script[type="module"]'),null,'weekly entry must not also load the library');
   assertLocalResources(doc);
  }finally{dom.window.close();}
 }
});
test('Pelvic library and non-assigned contexts preserve the approved posture-photo bundle',()=>{
 for(const context of [undefined,{origin:'library',day:3},{origin:'dailyPlan',intent:'daily-relax',activityId:'pelvic-daily-lab',day:6}]){
  const dom=openEntry('pelvic-floor-lab',context);
  try{
   const doc=dom.window.document;
   assert.equal(doc.querySelectorAll('script[src]').length,1);
   assert.equal(new URL(doc.querySelector('script[type="module"]').src).pathname,'/premium-v2/pelvic-floor-lab/assets/index-pf-postures-20261113.js');
   assert.equal(new URL(doc.querySelector('link[rel="stylesheet"]').href).pathname,'/premium-v2/pelvic-floor-lab/assets/index-pf-postures-20261113.css');
   assertLocalResources(doc);
  }finally{dom.window.close();}
 }
});
