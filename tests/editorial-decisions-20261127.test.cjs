const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {JSDOM}=require('../scripts/qa/node_modules/jsdom');
const root=path.resolve(__dirname,'../premium-v2');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function page(files=[]){
 const dom=new JSDOM('<main id="host"></main>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.structuredClone=structuredClone;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.HTMLElement.prototype.scrollTo=function(){};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.SPM_PRACTICE_AUDIO={stop(){},button(){return '<button type="button">Escuchar guía</button>';}};
 // Run the real coordinator without a native speech engine. The written guide
 // and all completion decisions must remain usable in this device state.
 for(const file of ['device-voice-v1.js',...files])vm.runInContext(read(file),dom.getInternalVMContext(),{filename:file});
 return {w,host:w.document.getElementById('host'),close:()=>w.close()};
}
function click(h,selector){const b=h.host.querySelector(selector);assert.ok(b,selector);b.click();return b;}
function de(){
 const h=page(['erection-practice-v1.js','erection-day1-touch-v1.js']);
 h.w.SPM_RESOURCE_CONTEXT=()=>({userId:'synthetic',planId:'editorial',primary:'erection',day:1});
 h.saved=[];h.fail=false;h.allowed=true;
 h.mount=prior=>h.w.SPM_ED_DAY1_TOUCH.mount({host:h.host,prior,scope:'synthetic:editorial',valid:()=>h.allowed,save:async record=>{if(h.fail)throw Error('synthetic offline');h.saved.push(structuredClone(record));}});
 h.mount({});return h;
}
async function saveDecision(h,score,outcome){
 click(h,'[data-ed1-act="next"]');
 if(score==='omitted')click(h,'[data-ed1-act="omit-ehs"]');
 else{click(h,'[data-ed1-act="ehs"][data-value="'+score+'"]');click(h,'[data-ed1-act="next"]');}
 click(h,'[data-ed1-act="next"]');click(h,'[data-ed1-act="next"]');
 click(h,'[data-ed1-act="outcome"][data-value="'+outcome+'"]');click(h,'[data-ed1-act="save"]');await tick();
}
for(const score of ['0','na','omitted'])for(const outcome of ['maintained','omitted']){
 test('DE01 conserva medición '+score+' y decisión '+outcome+' sin audio ni espera',async()=>{
  const h=de();try{
   assert.equal(h.w.SPM_VOICE.supported,false);assert.ok(h.host.querySelector('.spm-voice-transcript'));
   await saveDecision(h,score,outcome);assert.equal(h.saved.length,1);
   const r=h.saved[0];assert.equal(h.w.SPM_ERECTION_PRACTICE.valid(r,1),true);
   assert.equal(r.ehs,score==='0'?0:null);assert.equal(r.ehsEvaluable,score==='0'?true:score==='na'?false:null);
   assert.equal(r.ehsOmitted,score==='omitted');assert.equal(r.ehsStatus,score==='0'?'recorded':score==='na'?'not_evaluable':'omitted');
   assert.equal(r.completionAccepted,true);assert.equal(r.completed,outcome!=='omitted');
   assert.equal(r.attentionPracticeCompleted,outcome!=='omitted');assert.equal(r.activityStatus,outcome==='omitted'?'omitted':'completed');
   h.mount(r);click(h,'[data-ed1-act="next"]');
   const summary=h.host.querySelector('.spm-ed1-choice-summary').textContent;
   assert.match(summary,score==='omitted'?/SIN PUNTUAR/:score==='na'?/NO EVALUABLE/:/NIVEL 0/);
  }finally{h.close();}
 });
}
test('DE01 exige decisión expresa y no transforma un dato ausente en omisión',async()=>{
 const h=de();try{
  click(h,'[data-ed1-act="next"]');click(h,'[data-ed1-act="next"]');
  assert.equal(h.host.querySelector('[data-screen]').dataset.screen,'2');assert.equal(h.saved.length,0);
  assert.match(h.host.textContent,/voluntaria/);
  await saveDecision(deSafe(h),'omitted','omitted');
 }finally{h.close();}
});
function deSafe(h){h.mount({});return h;}
test('DE01 rechaza estados contradictorios y conserva datos tras error de guardado',async()=>{
 const h=de();try{
  h.fail=true;await saveDecision(h,'omitted','omitted');assert.equal(h.saved.length,0);
  assert.equal(h.w.document.querySelector('.spm-ed1-success-overlay'),null);
  assert.match(h.host.textContent,/No se pudo guardar/);h.fail=false;click(h,'[data-ed1-act="save"]');await tick();
  const r=h.saved[0];for(const changes of [{ehs:0},{ehsEvaluable:false},{completed:true},{attentionPracticeCompleted:true},{completionAccepted:false}])assert.equal(h.w.SPM_ERECTION_PRACTICE.valid({...r,...changes},1),false);
  assert.equal(h.w.SPM_ERECTION_PRACTICE.valid({erectionPracticeVersion:1,day:1,confirmed:true,anxiety:null,confidence:null,ehs:0,ehsEvaluable:true},1),true,'el registro histórico sigue legible');
 }finally{h.close();}
});
test('DE01 formulario alternativo conserva omisiones expresas sin atribuir práctica',async()=>{
 const h=page(['erection-practice-v1.js']);try{
  h.host.id='spmDailyWorkspace';const context={userId:'synthetic',planId:'editorial',primary:'erection',day:1};
  const activity={id:'main',kind:'erection',erectionLesson:1};let record;
  h.w.SPM_RESOURCE_CONTEXT=()=>context;
  h.w.SPM_DAILY_RECORDS={read:async()=>({})};
  h.w.SPM_DAILY_PRACTICE={assignments:()=>[activity],restricted:()=>false,active:()=>({id:'main',scope:'synthetic:editorial',day:1}),saveActivity:async(id,r)=>{record=structuredClone(r);}};
  assert.equal(await h.w.SPM_ERECTION_PRACTICE.open(activity),true);
  click(h,'[name="ehs"][value="omitted"]');click(h,'[name="attentionPracticeOutcome"][value="omitted"]');click(h,'[name="confirmed"]');
  h.host.querySelector('form').dispatchEvent(new h.w.Event('submit',{bubbles:true,cancelable:true}));await tick();
  assert.equal(record.ehs,null);assert.equal(record.ehsEvaluable,null);assert.equal(record.ehsOmitted,true);
  assert.equal(record.activityStatus,'omitted');assert.equal(record.completed,false);assert.equal(record.completionAccepted,true);
  assert.equal(h.w.SPM_ERECTION_PRACTICE.valid(record,1),true);
  assert.match(h.host.textContent,/no se cuenta como realizada/);
 }finally{h.close();}
});
const connectionFiles=['conexion-satisfaccion/guiones.js','conexion-satisfaccion/actividades.js','conexion-satisfaccion/pantalla.js'];
test('Conexión distingue ceros, No aplica y falta de datos sin comparar otras dimensiones',()=>{
 const h=page(connectionFiles);try{
  const api=h.w.SPM_CONNECTION;
  for(const v of [0,null]){const answers={score0:v,score1:v,score2:v,score3:v,priority:'Placer'};assert.equal(api.complete(1,{connectionDay:1,answers}),true);assert.equal(api.complete(28,{connectionDay:28,answers}),true);}
  assert.equal(api.complete(1,{connectionDay:1,answers:{priority:'Placer'}}),false);
  api.open({host:h.host,day:28,prior:{},save:async()=>{},exit(){}});
  assert.equal((h.host.textContent.match(/Sin registrar/g)||[]).length,4);
  assert.match(h.w.SPM_CONNECTION_GUIDES[28].guide,/pregunta opcional de hoy; no se compara/);
 }finally{h.close();}
});
test('Conexión día 13 permite elegir modalidad antes del mapa y no infiere pareja',()=>{
 const h=page(connectionFiles);try{
  h.w.SPM_CONNECTION.open({host:h.host,day:13,prior:{},save:async()=>{},exit(){}});
  const mode=h.host.querySelector('[aria-label="Modalidad de la actividad"]');assert.equal(mode.value,'Individual');
  click(h,'[aria-label="Su ritmo"]');assert.equal(h.host.querySelector('.cx-content textarea'),null);assert.match(h.host.querySelector('.cx-content').textContent,/solo lo que la otra persona/);
  h.host.querySelector('.cx-close').click();mode.value='En pareja';mode.dispatchEvent(new h.w.Event('change'));
  click(h,'[aria-label="Su ritmo"]');assert.ok(h.host.querySelector('textarea[name="other"]'));assert.equal(h.host.querySelector('textarea[name="other"]').required,false);
 }finally{h.close();}
});
test('Conexión día 21 No aplica no exige campos ocultos y los cues 10/13 cumplen objetivos distintos',()=>{
 const h=page(connectionFiles);try{
  assert.equal(h.w.SPM_CONNECTION.complete(21,{connectionDay:21,answers:{mode:'No aplica'}}),true);
  const a=h.w.SPM_CONNECTION_CONTENT.activities;assert.notEqual(a[10].topics[3].cue,a[13].topics[2].cue);
  assert.match(a[13].topics[2].cue,/sin atribuirle una respuesta/);
  assert.match(a[16].guide,/estimulación del pene/);
 }finally{h.close();}
});
test('Confianza día 13 acepta sin cambios de forma exclusiva, conservando escala de confianza',async()=>{
 const h=page(['ep-bloque/voice.js','ep-bloque/screen.js']);const saved=[];try{
  h.w.SPM_CONFIDENCE_TOUCH.open({host:h.host,day:13,profile:'confidence',save:async r=>saved.push(r),exit(){}});
  click(h,'[aria-label="Mayor control del tiempo"]');click(h,'[aria-label="No identifico cambios"]');
  assert.equal(h.host.querySelector('[aria-label="Mayor control del tiempo"]').getAttribute('aria-pressed'),'false');
  click(h,'[aria-label="0"]');click(h,'[aria-label="Guardar y continuar"]');await tick();
  assert.equal(saved.length,1);assert.deepEqual(Array.from(saved[0].answers.avances),['No identifico cambios']);assert.equal(saved[0].answers.confianza,0);
 }finally{h.close();}
});
test('Confianza día 24 permite guardar una observación sin mejoría',async()=>{
 const h=page(['confianza-nuevas/activities.js','confianza-nuevas/screen.js']);const saved=[];try{
  h.w.SPM_CONFIDENCE_NEW.open({host:h.host,day:24,save:async r=>saved.push(r),exit(){}});
  click(h,'[aria-label="Otra respuesta"]');[...h.host.querySelectorAll('.conf-editor button')].find(b=>b.textContent==='Aún no puedo valorarlo').click();
  click(h,'[aria-label="Continuar"]');await tick();assert.equal(saved[0].answers.choice,'Aún no puedo valorarlo');
 }finally{h.close();}
});
