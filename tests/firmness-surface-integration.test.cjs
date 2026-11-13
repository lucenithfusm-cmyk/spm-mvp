const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');
const read=file=>fs.readFileSync(path.join(__dirname,'../premium-v2',file),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const clone=value=>JSON.parse(JSON.stringify(value));
const levels=[
 {value:4,label:'Erección completa'},
 {value:3,label:'Erección incompleta, pero permite penetración'},
 {value:2,label:'Hay rigidez, pero no es suficiente para la penetración'},
 {value:1,label:'Aumento de tamaño, pero no es una erección'}
];

function harness(){
 const dom=new JSDOM('<main id="plan"></main><div id="profileTitle">Erección</div>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,writes=[],dailyWrites=[],observers=[],guide={opens:0,closes:0,bindings:0};
 const Observer=w.MutationObserver;w.MutationObserver=class extends Observer{constructor(callback){super(callback);observers.push(this);}};
 w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLElement.prototype.scrollTo=function(){};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
 w.SPM_RESOURCE_CONTEXT=()=>({userId:'qa',planId:'plan',day:1,primary:'erection',safety:'none',flags:[],checkins:[],answers:{}});
 w.SPM_RESOURCE_RECORDS={read:async()=>[],save:async(row,scope)=>{writes.push({row:clone(row),scope});}};
 w.SPM_DAILY_PRACTICE={saveActivity:async(...args)=>{dailyWrites.push(clone(args));},open(){}};
 // The shared guide owns the viewer. This contract fixture checks that its
 // image controls are bound without entering either surface's score handlers.
 w.SPM_FIRMNESS_GUIDE={levels:clone(levels),html:()=>'<figure data-guide-contract><img src="/premium-v2/assets/images/erection/response-firmness-spm-20261113.jpg" alt="Guía de firmeza"><button type="button" data-guide-enlarge>Ampliar guía</button></figure>',bind(root){guide.bindings++;root.querySelectorAll('[data-guide-enlarge]').forEach(button=>button.onclick=()=>{guide.opens++;});},close(){guide.closes++;}};
 return{w,writes,dailyWrites,guide,load(file){w.eval(read(file));},close(){observers.forEach(observer=>observer.disconnect());w.close();}};
}

test('the DE modal shows descending grades and a bound image without selecting or saving a response',async()=>{
 const h=harness();try{
  const assessments={baseline:{answers:[3,4,3,4,4],score:18,date:'2026-10-01T00:00:00.000Z'}};
  h.w.localStorage.setItem('spm_de_assessments',JSON.stringify(assessments));h.load('erectile-function-route.js');
  h.w.SPM_ERECTILE_FUNCTION.open(1,{origin:'dailyPlan'});const root=h.w.document.getElementById('deContent');
  assert.equal(root.querySelectorAll('[data-guide-contract] img').length,1);assert.equal(h.guide.bindings,1);
  assert.deepEqual([...root.querySelectorAll('.deFirmnessDegrees [data-ehs]')].map(button=>button.dataset.ehs),['4','3','2','1']);
  assert.deepEqual([...root.querySelectorAll('.deFirmnessDegrees [data-ehs] span')].map(span=>span.textContent),levels.map(level=>level.label));
  assert.deepEqual([...root.querySelectorAll('.deFirmnessOther [data-ehs]')].map(button=>button.dataset.ehs),['0','na']);
  assert.equal(root.querySelectorAll('.deFirmnessViz,.deFirmnessDegrees svg').length,0);assert.equal(root.querySelectorAll('#deIief .deIiefQ').length,5);
  root.querySelector('[data-guide-enlarge]').click();await tick();assert.equal(h.guide.opens,1);
  assert.equal(root.querySelector('#deEhs [aria-pressed="true"]'),null);assert.equal(root.querySelector('#deEhs .on'),null);
  assert.deepEqual(h.dailyWrites,[]);assert.equal(h.w.localStorage.getItem('spm_de_records'),null);
  assert.deepEqual(JSON.parse(h.w.localStorage.getItem('spm_de_assessments')),assessments);
 }finally{h.close();}
});

test('DE selection retains each numeric grade, evaluable zero and distinct not-evaluable null',async()=>{
 for(const [choice,value,evaluable] of [['4',4,true],['3',3,true],['2',2,true],['1',1,true],['0',0,true],['na',null,false]]){
  const h=harness();try{
   h.load('erectile-function-route.js');h.w.SPM_ERECTILE_FUNCTION.open(1,{origin:'dailyPlan'});
   const button=h.w.document.querySelector('#deEhs [data-ehs="'+choice+'"]');button.click();
   h.w.document.querySelector('[data-guide-enlarge]').click();assert.equal(button.getAttribute('aria-pressed'),'true');assert.equal(h.dailyWrites.length,0);
   h.w.document.getElementById('deSave').click();await tick();assert.equal(h.dailyWrites.length,1);
   const [id,record,scope,day]=h.dailyWrites[0];assert.equal(id,'main');assert.equal(scope,'qa:plan');assert.equal(day,1);assert.equal(record.ehs,value);assert.equal(record.ehsEvaluable,evaluable);
   const stored=h.w.SPM_ERECTILE_FUNCTION.records();assert.equal(stored.length,1);assert.equal(stored[0].ehs,value);assert.equal(stored[0].ehsEvaluable,evaluable);
   h.w.SPM_ERECTILE_FUNCTION.open(1,{origin:'dailyPlan'});assert.equal(h.w.document.querySelector('#deEhs [aria-pressed="true"]').dataset.ehs,choice);assert.equal(h.dailyWrites.length,1);
  }finally{h.close();}
 }
});

test('Response Tracker shows grades 4 to 1 without mutating the ascending content or adding another null state',async()=>{
 const h=harness();try{
  h.load('spm-resources-content.js');const before=clone(h.w.SPM_RESOURCE_CONTENT.ehs);h.load('spm-resources.js');h.w.SPM_RESOURCES.open('response',1);await tick();
  const root=h.w.document.getElementById('srContent');assert.equal(root.querySelectorAll('[data-guide-contract] img').length,1);
  assert.deepEqual([...root.querySelectorAll('.sr-firmness-options [data-ehs]')].map(button=>button.dataset.ehs),['4','3','2','1']);
  assert.deepEqual([...root.querySelectorAll('.sr-firmness-options [data-ehs] span')].map(span=>span.textContent),levels.map(level=>level.label));
  assert.equal(root.querySelector('.sr-firmness-options svg'),null);assert.equal(root.querySelectorAll('[data-ehs]').length,5);
  assert.equal(root.querySelector('[data-ehs="none"]').closest('.sr-firmness-options'),null);
  assert.equal(root.querySelector('[data-ehs="0"],[data-ehs="na"]'),null);
  root.querySelector('[data-guide-enlarge]').click();await tick();assert.equal(h.guide.opens,1);assert.equal(h.writes.length,0);
  assert.equal(root.querySelector('[data-ehs][aria-pressed="true"]'),null);
  // Choosing arousal alone still leaves EHS unanswered after enlarging.
  root.querySelector('#srGaugeHost svg').dispatchEvent(new h.w.KeyboardEvent('keydown',{key:'Home',bubbles:true}));root.querySelector('#srSave').click();await tick();assert.equal(h.writes.length,0);
  assert.deepEqual(clone(h.w.SPM_RESOURCE_CONTENT.ehs),before);
  h.w.SPM_LANG='en';h.w.SPM_RESOURCES.open('response',1);
  assert.deepEqual([...h.w.document.querySelectorAll('.sr-firmness-options span')].map(span=>span.textContent),[4,3,2,1].map(value=>before[value-1].en));
  assert.deepEqual(clone(h.w.SPM_RESOURCE_CONTENT.ehs),before);
 }finally{h.close();}
});

test('Response Tracker persists every grade and keeps absence as null with noErection true',async()=>{
 for(const [choice,value,noErection] of [['4',4,false],['3',3,false],['2',2,false],['1',1,false],['none',null,true]]){
  const h=harness();try{
   h.load('spm-resources-content.js');h.load('spm-resources.js');h.w.SPM_RESOURCES.open('response',1);await tick();
   const root=h.w.document.getElementById('srContent');root.querySelector('[data-ehs="'+choice+'"]').click();
   root.querySelector('#srGaugeHost svg').dispatchEvent(new h.w.KeyboardEvent('keydown',{key:'Home',bubbles:true}));
   root.querySelector('[data-guide-enlarge]').click();assert.equal(h.writes.length,0);root.querySelector('#srSave').click();await tick();
   assert.equal(h.writes.length,1);const {row,scope}=h.writes[0];assert.equal(scope,'qa:plan');assert.equal(row.ehs,value);assert.equal(row.noErection,noErection);assert.equal(row.arousal,0);assert.equal(row.day,1);assert.equal(h.w.SPM_RESOURCES.validate(row),true);
   h.w.SPM_RESOURCES.open('history',1);assert.match(h.w.document.getElementById('srContent').textContent,choice==='none'?/No hubo erección/:/EHS/);
   assert.equal(h.writes.length,1,'opening history does not rewrite earlier records');assert.equal(h.w.SPM_RESOURCES.validate({...row,ehs:null,noErection:false}),false);
  }finally{h.close();}
 }
});
