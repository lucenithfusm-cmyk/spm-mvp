const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');
const keys=['firmness','control','desire','confidence','comfort','sleep','skill'];
const clone=value=>JSON.parse(JSON.stringify(value));
const activity={id:'program-checkpoint',title:'Mi punto de partida'};
const legacy={checkpointVersion:1,milestone:1,submittedDay:1,metrics:{firmness:8,control:null,desire:4,confidence:4,comfort:6,sleep:7,skill:4},reflection:'Aprendí <algo>',continuity:'Seguir con comodidad',at:'2026-10-01T12:00:00.000Z'};
const currentRecord=(value=2,extra={})=>({checkpointVersion:2,scaleMax:4,milestone:1,submittedDay:1,metrics:Object.fromEntries(keys.map(k=>[k,value])),reflection:'',continuity:'',...extra});
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
function harness(){
 const d=new JSDOM('<div id="plan"><div id="spmDailyWorkspace"></div></div>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true}),w=d.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.load=function(){};w.HTMLMediaElement.prototype.play=async function(){};
 const c={userId:'u',planId:'p',day:1},db={},writes=[];
 w.SPM_RESOURCE_CONTEXT=()=>c;
 w.SPM_DAILY_RECORDS={
  read:async(s,day)=>clone(db[day]||{}),
  readCheckpoints:async()=>Object.entries(db).filter(([,value])=>value['program-checkpoint']).map(([day,value])=>({day_number:Number(day),metadata:clone(value['program-checkpoint'])}))
 };
 w.SPM_DAILY_PRACTICE={open(){},async saveActivity(id,record,scope,day){
  assert.equal(scope,'u:p');assert.equal(day,c.day);
  writes.push(clone(record));db[day]={[id]:clone(record)};
  w.document.getElementById('plan').innerHTML='<div id="spmDailyWorkspace"></div>';
 }};
 for(const file of ['checkpoint-audio-v1.js','program-checkpoint-v1.js'])w.eval(fs.readFileSync(path.join(__dirname,'../premium-v2',file),'utf8'));
 return{w,c,db,writes,close:()=>w.close()};
}
function fill(form,value=2){for(const key of keys)form.querySelector('[name="'+key+'"]').value=key==='control'?'na':String(value);}
function submit(form){return form.onsubmit({preventDefault(){}});}
function reportText(w,rows){const box=w.document.createElement('div');box.innerHTML=w.SPM_PROGRAM_CHECKPOINT.comparison(rows);return box.textContent;}

test('baseline offers only 0–4, no default rating, a non-speaker audio player and closed instructions/notes',async()=>{
 const h=harness();try{
  await h.w.SPM_PROGRAM_CHECKPOINT.open(activity,true);const form=h.w.document.querySelector('[data-program-checkpoint]');
  assert.ok(form);assert.equal(form.querySelectorAll('select').length,7);
  for(const select of form.querySelectorAll('select')){
   assert.deepEqual([...select.options].map(option=>option.value),['','na','0','1','2','3','4']);assert.equal(select.value,'');assert.equal(select.required,true);
  }
  const legend=form.querySelector('.spm-checkpoint-scale');assert.ok(legend);assert.equal(legend.querySelectorAll('li').length,5);
  assert.doesNotMatch(legend.textContent,/muy bajo|muy malo|malo|\b10\b/i);
  assert.equal(form.querySelector('[data-spm-speak],.spm-audio-action'),null);
  assert.ok(form.querySelector('audio'),'the real explanation player is present');
  assert.ok(form.querySelectorAll('details').length>=2);
  for(const details of form.querySelectorAll('details'))assert.equal(details.open,false);
  for(const name of ['reflection','continuity'])assert.ok(form.querySelector('[name="'+name+'"]').closest('details'),'optional notes stay collapsed');
  assert.equal(form.querySelector('button[type=submit]').textContent.trim(),'Guardar mi punto de partida');
  assert.equal(form.querySelector(':scope > p:not([role="status"])'),null,'there is no long visible introduction');
  await submit(form);assert.equal(h.writes.length,0,'unanswered ratings cannot become zeros');
 }finally{h.close();}
});

test('all three checkpoints save version 2, preserve null and reopen without a day advance',async()=>{
 const h=harness();try{
  for(const [day,value] of [[1,0],[14,2],[28,4]]){
   h.c.day=day;await h.w.SPM_PROGRAM_CHECKPOINT.open(activity,true);const form=h.w.document.querySelector('form');fill(form,value);
   form.querySelector('[name=reflection]').value='<script>texto</script>';form.querySelector('[name=continuity]').value='Continuar';
   await submit(form);assert.ok(h.w.document.querySelector('[data-program-report]'));assert.equal(h.c.day,day);
  }
  assert.equal(h.writes.length,3);
  for(const [index,record] of h.writes.entries()){
   assert.equal(record.checkpointVersion,2);assert.equal(record.scaleMax,4);assert.equal(record.metrics.control,null);
   assert.equal(record.metrics.firmness,[0,2,4][index]);assert.equal(record.milestone,[1,14,28][index]);
  }
  assert.equal(h.w.document.querySelectorAll('script').length,0);assert.match(h.w.document.body.textContent,/Tu informe final/);
  assert.match(h.w.document.body.textContent,/Sin dato \/ no evaluable/);
  await h.w.SPM_PROGRAM_CHECKPOINT.open(activity);assert.ok(h.w.document.querySelector('[data-program-report]'));assert.equal(h.writes.length,3);
 }finally{h.close();}
});

test('validation distinguishes legacy 0–10 from version 2 and rejects malformed or incomplete ratings',()=>{
 const h=harness();try{
  const valid=h.w.SPM_PROGRAM_CHECKPOINT.valid;
  assert.equal(valid(legacy),true);assert.equal(valid({...legacy,metrics:{...legacy.metrics,firmness:10}}),true);
  assert.equal(valid(currentRecord(0)),true);assert.equal(valid(currentRecord(4)),true);assert.equal(valid(currentRecord(null)),true);
  assert.equal(valid({...currentRecord(),scaleMax:10}),false);assert.equal(valid({...currentRecord(),scaleMax:undefined}),false);
  for(const value of [-1,5,10,1.5,'2',true,undefined,NaN])assert.equal(valid({...currentRecord(),metrics:Object.fromEntries(keys.map(key=>[key,value]))}),false,'reject '+String(value));
  const missing=currentRecord();delete missing.metrics.sleep;assert.equal(valid(missing),false);
  assert.equal(valid({...currentRecord(),checkpointVersion:3}),false);
  assert.equal(valid({...currentRecord(),reflection:'x'.repeat(2001)}),false);
  assert.equal(valid({...currentRecord(),continuity:'x'.repeat(2001)}),false);
 }finally{h.close();}
});

test('comparison retains raw denominators and identifies mixed scales without inventing missing zeros',()=>{
 const h=harness();try{
  const text=reportText(h.w,{1:legacy,28:currentRecord(4,{milestone:28,submittedDay:28})});
  assert.match(text,/8\s*\/\s*10/);assert.match(text,/4\s*\/\s*4/);
  assert.match(text,/escalas diferentes/i);assert.match(text,/no (?:se )?comparan directamente|no son directamente comparables/i);
  assert.match(text,/Sin dato \/ no evaluable/);assert.doesNotMatch(text,/0\s*\/\s*[14]0?/);
  const empty=reportText(h.w,{});assert.doesNotMatch(empty,/0\s*\/\s*4/);
  const zeros=reportText(h.w,{1:currentRecord(0)});assert.match(zeros,/0\s*\/\s*4/,'an actual zero remains a real answer');
 }finally{h.close();}
});

test('reanswering a legacy checkpoint leaves numeric choices blank and retains one original snapshot',async()=>{
 const h=harness();try{
  h.db[1]={'program-checkpoint':clone(legacy)};
  await h.w.SPM_PROGRAM_CHECKPOINT.open(activity,true);let form=h.w.document.querySelector('form');
  for(const key of keys)assert.equal(form.querySelector('[name="'+key+'"]').value,key==='control'?'na':'');
  assert.equal(form.querySelector('[name=reflection]').value,legacy.reflection);assert.equal(form.querySelector('[name=continuity]').value,legacy.continuity);
  fill(form,2);await submit(form);const first=h.writes[0];
  assert.equal(first.checkpointVersion,2);assert.equal(first.legacyCheckpoint.checkpointVersion,1);
  assert.deepEqual(first.legacyCheckpoint.metrics,legacy.metrics);assert.equal(first.legacyCheckpoint.reflection,legacy.reflection);
  assert.equal(first.legacyCheckpoint.continuity,legacy.continuity);assert.equal(first.legacyCheckpoint.at,legacy.at);
  const archive=[...h.w.document.querySelectorAll('[data-program-report] details')].find(details=>/8\s*\/\s*10/.test(details.textContent));
  assert.ok(archive,'the original scale is available in the report');assert.equal(archive.open,false);
  await h.w.SPM_PROGRAM_CHECKPOINT.open(activity,true);form=h.w.document.querySelector('form');
  assert.equal(form.querySelector('[name=firmness]').value,'2');fill(form,3);await submit(form);
  assert.deepEqual(h.writes[1].legacyCheckpoint,first.legacyCheckpoint);assert.equal(h.writes[1].legacyCheckpoint.legacyCheckpoint,undefined);
  assert.deepEqual(legacy.metrics,{firmness:8,control:null,desire:4,confidence:4,comfort:6,sleep:7,skill:4});
 }finally{h.close();}
});

test('a failed save retains selections and notes, re-enables submission and permits retry',async()=>{
 const h=harness();try{
  await h.w.SPM_PROGRAM_CHECKPOINT.open(activity,true);const form=h.w.document.querySelector('form');fill(form,3);form.querySelector('[name=reflection]').value='Conservar';
  const save=h.w.SPM_DAILY_PRACTICE.saveActivity;h.w.SPM_DAILY_PRACTICE.saveActivity=async()=>{throw Error('offline');};
  await submit(form);assert.equal(form.querySelector('[name=reflection]').value,'Conservar');assert.equal(form.querySelector('[name=firmness]').value,'3');
  assert.equal(form.querySelector('button[type=submit]').disabled,false);assert.match(form.textContent,/No se pudo guardar/);
  h.w.SPM_DAILY_PRACTICE.saveActivity=save;await submit(form);assert.equal(h.writes.length,1);assert.equal(h.writes[0].reflection,'Conservar');
 }finally{h.close();}
});

test('duplicate in-flight submission sends one save and keeps the selected answers',async()=>{
 const h=harness();try{
  await h.w.SPM_PROGRAM_CHECKPOINT.open(activity,true);const form=h.w.document.querySelector('form');fill(form,2);
  const pending=deferred(),save=h.w.SPM_DAILY_PRACTICE.saveActivity;let calls=0;
  h.w.SPM_DAILY_PRACTICE.saveActivity=async(...args)=>{calls++;await pending.promise;return save(...args);};
  const first=submit(form);assert.equal(form.querySelector('button[type=submit]').disabled,true);
  const second=submit(form);assert.equal(calls,1);pending.resolve();await Promise.all([first,second]);assert.equal(h.writes.length,1);
 }finally{h.close();}
});

test('forms from a previous account, plan, day or replaced activity cannot save',async()=>{
 for(const change of [h=>h.c.userId='other',h=>h.c.planId='other',h=>h.c.day=14,h=>h.w.document.getElementById('spmDailyWorkspace').replaceChildren()]){
  const h=harness();try{await h.w.SPM_PROGRAM_CHECKPOINT.open(activity,true);const form=h.w.document.querySelector('form');fill(form,2);change(h);await submit(form);assert.equal(h.writes.length,0);}finally{h.close();}
 }
});

test('failed history read never offers a form that could replace unseen answers',async()=>{
 const h=harness();try{
  h.w.SPM_DAILY_RECORDS.readCheckpoints=async()=>{throw Error('offline');};await h.w.SPM_PROGRAM_CHECKPOINT.open(activity,true);
  assert.equal(h.w.document.querySelector('form'),null);assert.match(h.w.document.body.textContent,/No pudimos cargar/);assert.equal(h.writes.length,0);
 }finally{h.close();}
});

test('a stale history response cannot render a form for a changed account or day',async()=>{
 for(const change of [h=>h.c.userId='other',h=>h.c.day=14]){
  const h=harness();try{const pending=deferred();h.w.SPM_DAILY_RECORDS.readCheckpoints=()=>pending.promise;const open=h.w.SPM_PROGRAM_CHECKPOINT.open(activity,true);change(h);pending.resolve([]);await open;assert.equal(h.w.document.querySelector('form'),null);assert.equal(h.writes.length,0);}finally{h.close();}
 }
});

test('final report remains available without evaluations or writes and retains continuity advice',async()=>{
 const h=harness();try{
  h.c.day=28;await h.w.SPM_PROGRAM_CHECKPOINT.open(activity);assert.ok(h.w.document.querySelector('[data-program-report]'));
  assert.match(h.w.document.body.textContent,/Tu informe reúne las respuestas disponibles/);assert.match(h.w.document.body.textContent,/qué prácticas te resultaron útiles/);
  let copied='';h.w.navigator.clipboard={writeText:async text=>{copied=text;}};
  h.w.document.querySelector('[data-checkpoint-audio] details').open=true;
  await h.w.document.querySelector('[data-checkpoint-copy]').onclick();
  assert.match(copied,/Piensa en el gimnasio/);assert.match(copied,/Sin dato \/ no evaluable/);
  assert.equal(copied.split('Lo aprendido continúa contigo').length-1,1,'the report includes the closing once, independently of the audio transcript');
  assert.doesNotMatch(copied,/Escuchar mensaje de cierre|Copiar mi informe|Completar o revisar evaluación/);
  assert.equal(h.w.document.querySelector('[data-checkpoint-report-status]').textContent,'Informe copiado.');
  assert.equal(h.writes.length,0);assert.equal(h.c.day,28);
 }finally{h.close();}
});

test('late midpoint records the actual response day and is recovered without a new reminder',async()=>{
 const h=harness();try{
  h.c.day=18;await h.w.SPM_PROGRAM_CHECKPOINT.open(activity);const form=h.w.document.querySelector('form');for(const select of form.querySelectorAll('select'))select.value='na';await submit(form);
  assert.equal(h.writes[0].milestone,14);assert.equal(h.writes[0].submittedDay,18);assert.equal(h.writes[0].checkpointVersion,2);
  assert.match(h.w.document.body.textContent,/respondido el día 18/);assert.equal(h.w.SPM_PROGRAM_CHECKPOINT.assignment(h.c),null);
  await h.w.SPM_PROGRAM_CHECKPOINT.open(activity);assert.ok(h.w.document.querySelector('[data-program-report]'));assert.match(h.w.document.body.textContent,/respondido el día 18/);
  assert.equal(h.writes.length,1);
 }finally{h.close();}
});
