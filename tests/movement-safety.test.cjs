// Synthetic contexts only. Run with NODE_PATH=/tmp/spm-qa-deps/node_modules node tests/movement-safety.test.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.join(__dirname,'..','premium-v2');
const tick=()=>new Promise(r=>setTimeout(r,25));
async function harness(patch={},adaptation){
 const dom=new JSDOM('<main id="plan"></main>',{url:'https://spm.test',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,c={userId:'qa-user',planId:'qa-plan',day:12,answers:{},checkins:[],safety:'none',flags:[],...patch},saved=[];
 const observers=[],NativeObserver=w.MutationObserver;
 w.MutationObserver=class extends NativeObserver{constructor(cb){super(cb);observers.push(this)}};
 w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
 w.HTMLElement.prototype.scrollTo=function(){};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};
 w.HTMLDialogElement.prototype.close=function(){this.open=false};
 w.SPM_RESOURCE_CONTEXT=()=>c;
 w.SPM_RESOURCE_RECORDS={read:async()=>[],save:async r=>saved.push(r)};
 if(adaptation)w.localStorage.setItem('spm_adaptation_state',JSON.stringify(adaptation));
 for(const file of ['spm-resources-content.js','spm-resources.js','spm-visual-cards-staging-v4.js'])w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 w.SPM_RESOURCES.refresh();await tick();
 w.SPM_RESOURCES.open('movement',12,{origin:'wellnessLibrary'});await tick();
 return {w,c,saved,d:w.document,close:()=>{observers.forEach(o=>o.disconnect());w.close()}};
}
const restrictedCases=[
 ['urgent assessment',{safety:'urgent',flags:['s_cardiac']}],
 ['review assessment',{safety:'review',flags:['s_blood']}],
 ['flag without level',{flags:['s_sudden']}],
 ['unknown safety',{safety:undefined}],
 ['cardiovascular history',{answers:{h_cv:true,h_control_status:'controlled'}}],
 ['major cardiovascular event',{answers:{h_cv_event:true}}],
 ['unconfirmed condition control',{answers:{h_has_condition:true,h_control_status:'unsure'}}],
 ['new check-in flag',{checkins:[{new_safety_flag:true}]}],
 ['legacy unscoped adaptation',{}, {level:'review'}],
 ['current program adaptation',{}, {level:'urgent',userId:'qa-user',planId:'qa-plan'}],
];
for(const [name,patch,adaptation] of restrictedCases)test(name+' retains educational access without routines',async()=>{
 const h=await harness(patch,adaptation);
 try{
  assert.equal(h.w.SPM_RESOURCES.restricted(h.c),true);
  assert.equal(h.d.querySelectorAll('[data-activity]').length,6);
  assert.equal(h.d.querySelectorAll('[data-activity] .sr-move-education-visual img').length,6,'Keep all six approved Premium photographs in the restricted state');
  assert.equal(h.d.querySelectorAll('[data-activity] > svg').length,0,'Never fall back to prototype drawings because of a safety flag');
  assert.ok(h.d.querySelector('[data-movement-safety] details summary'));
  assert.equal(h.d.querySelector('#srEnergy'),null);
  for(const a of h.w.SPM_RESOURCE_CONTENT.activities){
   h.d.querySelector(`[data-activity="${a.id}"]`).click();
   const detail=h.d.querySelector('#srActivityDetail');
   assert.equal(detail.hidden,false);
   assert.ok(detail.textContent.includes(a.benefit.es));
   assert.ok(!detail.textContent.includes(a.dose.es));
   assert.equal(detail.querySelector('#srMoveSave'),null);
   assert.ok(detail.querySelector('.sr-move-education-visual img'),'Keep the Premium photo within the educational viewport');
   assert.ok(detail.querySelector('.sr-move-education-visual').style.getPropertyValue('--sr-photo-ratio'),'The viewport must crop out the embedded instructions');
   detail.querySelector('[data-sr-module-home]').click();
   assert.equal(detail.hidden,true);
  }
  assert.equal(h.saved.length,0);
 }finally{h.close()}
});
test('a notice explicitly belonging to another account or plan is not attributed to this program',async()=>{
 for(const state of [{level:'urgent',userId:'other',planId:'qa-plan'},{level:'review',userId:'qa-user',planId:'other'}]){
  const h=await harness({},state);
  try{assert.equal(h.w.SPM_RESOURCES.restricted(h.c),false);assert.ok(h.d.querySelector('#srEnergy'));}
  finally{h.close()}
 }
});
test('a normal context keeps dosing, records the correct program day and pauses after symptoms',async()=>{
 const h=await harness();
 try{
  assert.equal(h.w.SPM_RESOURCES.restricted(h.c),false);
  h.d.querySelector('[data-activity="walk"]').click();
  assert.ok(h.d.querySelector('#srActivityDetail').textContent.includes(h.w.SPM_RESOURCE_CONTENT.activities[0].dose.es));
  h.d.querySelector('#srMinutes').value='10';h.d.querySelector('#srEffort').value='3';h.d.querySelector('#srTolerance').value='symptoms';
  h.d.querySelector('#srMoveSave').click();await tick();
  assert.equal(h.saved.length,1);assert.equal(h.saved[0].day,12);
  assert.equal(h.w.SPM_RESOURCES.restricted(h.c),true);
  assert.equal(h.d.querySelectorAll('[data-activity]').length,6);
  assert.equal(h.d.querySelector('#srEnergy'),null);
 }finally{h.close()}
});
test('a new safety flag between opening and saving prevents a routine record',async()=>{
 const h=await harness();
 try{
  h.d.querySelector('[data-activity="walk"]').click();
  h.d.querySelector('#srMinutes').value='10';h.d.querySelector('#srEffort').value='3';
  h.c.safety='urgent';h.d.querySelector('#srMoveSave').click();await tick();
  assert.equal(h.saved.length,0);assert.equal(h.d.querySelector('#srMoveSave'),null);
  assert.ok(h.d.querySelector('[data-movement-safety]'));
 }finally{h.close()}
});
test('return from a restricted library keeps the wellness origin',async()=>{
 const h=await harness({safety:'review'});
 try{
  let returns=0;h.w.addEventListener('spm:open-wellness-library',()=>returns++);
  h.d.querySelector('[data-sr-exit]').click();
  assert.equal(returns,1);assert.equal(h.d.querySelector('dialog'),null);
 }finally{h.close()}
});

for(const primary of ['erection','ejaculation'])for(const safety of ['none','review'])test(`${primary} uses the same Premium assets with ${safety} safety`,async()=>{
 const h=await harness({primary,safety});
 try{
  const expected={walk:'01-caminata-cardio-moderado.jpg',strength:'02-entrenamiento-fuerza.jpg',mobility:'03-movilidad-flexibilidad.jpg',kegel:'06-piso-pelvico-kegel.jpg',swim:'04-actividad-en-el-agua.jpg',dance:'05-bailar-y-moverte.jpg'};
  for(const [id,file] of Object.entries(expected)){
   const card=h.d.querySelector(`[data-activity="${id}"]`);
   assert.ok(card.querySelector('img').getAttribute('src').includes('assets/activity/cards-v1/'+file));
   assert.equal(card.querySelector('svg'),null);
   card.click();
   const detail=h.d.querySelector('#srActivityDetail');
   assert.ok(detail.querySelector('img').getAttribute('src').includes(file));
   assert.equal(!!detail.querySelector('.sr-move-education-visual'),safety!=='none');
   assert.equal(!!detail.querySelector('#srMoveSave'),safety==='none');
   detail.querySelector('[data-sr-module-home]').click();
  }
 }finally{h.close()}
});
