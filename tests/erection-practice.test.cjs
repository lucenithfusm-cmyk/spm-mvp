const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');

const root=path.join(__dirname,'../premium-v2');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const clone=value=>JSON.parse(JSON.stringify(value));
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};

function harness(day=1,prior){
 const dom=new JSDOM('<section id="plan"><section id="spmDailySession"><div id="spmDailyWorkspace"></div></section></section>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,c={userId:'qa',planId:'plan',primary:'erection',day,safety:'none',flags:[],checkins:[],completed:[]};
 const activity={id:'main',kind:'erection',title:'Práctica de erección'};
 let assignments=[activity],active={id:'main',scope:'qa:plan',day},opens=0,nativeCalls=0,breathingCalls=0,completionCalls=0,directWrites=0;
 const db=prior?{[day]:{main:clone(prior)}}:{},reads=[],writes=[],attempts=[],media=new WeakMap();
 const state=element=>{if(!media.has(element))media.set(element,{paused:true,time:0,plays:0});return media.get(element);};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 Object.defineProperty(w.HTMLMediaElement.prototype,'paused',{configurable:true,get(){return state(this).paused;}});
 Object.defineProperty(w.HTMLMediaElement.prototype,'currentTime',{configurable:true,get(){return state(this).time;},set(value){state(this).time=value;}});
 Object.defineProperty(w.HTMLMediaElement.prototype,'duration',{configurable:true,get(){return 42;}});
 w.HTMLMediaElement.prototype.play=function(){const value=state(this);value.paused=false;value.plays++;this.dispatchEvent(new w.Event('play'));return Promise.resolve();};
 w.HTMLMediaElement.prototype.pause=function(){const value=state(this),changed=!value.paused;value.paused=true;if(changed)this.dispatchEvent(new w.Event('pause'));};
 w.HTMLMediaElement.prototype.load=function(){};
 w.speechSynthesis={speak(){nativeCalls++;},cancel(){},getVoices(){return[];},addEventListener(){}};
 w.SpeechSynthesisUtterance=function(text){this.text=text;};
 w.SPM_RESOURCE_CONTEXT=()=>c;
 w.SPM_PRACTICE_AUDIO={stop(){}};
 w.SPM_PROGRAM_VIDEOS={pause(){}};
 w.SPM_BREATHING_LAB={open(){breathingCalls++;}};
 w.SPM_COMPLETE_DAILY_PRACTICE=async()=>{completionCalls++;};
 w.SPM_DAILY_RECORDS={
  read:async(scope,number)=>{reads.push({scope,day:number});return clone(db[number]||{});},
  save:async()=>{directWrites++;}
 };
 w.SPM_DAILY_PRACTICE={
  assignments:()=>assignments,
  active:()=>active,
  restricted:()=>c.safety!=='none'||c.flags.length>0||c.checkins.some(row=>row.new_safety_flag),
  open(){opens++;active=null;w.document.getElementById('spmDailyWorkspace')?.replaceChildren();},
  async saveActivity(id,metadata,scope,number){
   const write={id,metadata:clone(metadata),scope,day:number};attempts.push(write);
   if(h.failSave)throw Error('offline');
   writes.push(write);db[number]={...(db[number]||{}),[id]:clone(metadata)};
   return{ok:true};
  }
 };
 const h={w,c,activity,db,reads,writes,attempts,state,failSave:false,
  form:()=>w.document.querySelector('[data-erection-form]'),
  host:()=>w.document.getElementById('spmDailyWorkspace'),
  setAssignments:value=>{assignments=value;},setActive:value=>{active=value;},
  counts:()=>({opens,nativeCalls,breathingCalls,completionCalls,directWrites}),
  close(){w.SPM_ERECTION_PRACTICE?.stop();w.SPM_CHECKPOINT_AUDIO?.stop();w.close();}
 };
 w.eval(read('checkpoint-audio-v1.js'));
 w.eval(read('erection-practice-v1.js'));
 h.api=w.SPM_ERECTION_PRACTICE;
 return h;
}

function choose(form,name,value){
 const input=[...form.querySelectorAll('input[name="'+name+'"]')].find(item=>item.value===String(value));
 assert.ok(input,'Missing choice '+name+'='+value);input.click();return input;
}
function select(form,name,value){
 const input=form.querySelector('select[name="'+name+'"]');assert.ok(input,'Missing select '+name);
 input.value=String(value);input.dispatchEvent(new input.ownerDocument.defaultView.Event('change',{bubbles:true}));return input;
}
function confirm(form){const input=form.querySelector('[name="confirmed"]');assert.ok(input);if(!input.checked)input.click();}
function answer(form,day){
 if(day===1)choose(form,'ehs','na');
 if(day===2){for(const context of ['spontaneous','solo','partner'])select(form,'context-'+context,'not_evaluable');choose(form,'responseAspect','not_evaluable');}
 if(day===3){choose(form,'tensionArea','none');choose(form,'sensoryAnchor','hands');}
 if(day===4){choose(form,'attentionSense','contact');choose(form,'practiceExperience','no_checking');}
 if(day===5){choose(form,'erectionFacilitators','unknown');choose(form,'erectionInhibitors','unknown');choose(form,'microAdjustment','observe');}
}
async function submit(h,form=h.form()){
 form.dispatchEvent(new h.w.Event('submit',{bubbles:true,cancelable:true}));await tick();
}
function saved(day,extra={}){
 const common={erectionPracticeVersion:1,day,confirmed:true,anxiety:null,confidence:null};
 const fields={
  1:{ehs:null,ehsEvaluable:false},
  2:{contexts:{spontaneous:'not_evaluable',solo:'not_evaluable',partner:'not_evaluable'},responseAspect:'not_evaluable'},
  3:{tensionAreas:['none'],sensoryAnchor:'hands',finalFeeling:'',seconds:null},
  4:{attentionSense:'contact',practiceExperience:'no_checking',finalFeeling:'',seconds:null},
  5:{erectionFacilitators:['unknown'],erectionInhibitors:['unknown'],microAdjustment:'observe'}
 };
 return{...common,...fields[day],...extra};
}
function assertOnlyMainWrite(h,day){
 assert.equal(h.writes.length,1);assert.equal(h.writes[0].id,'main');assert.equal(h.writes[0].scope,'qa:plan');assert.equal(h.writes[0].day,day);
 assert.equal(h.c.day,day);assert.deepEqual(h.c.completed,[]);
 assert.equal(h.counts().breathingCalls,0);assert.equal(h.counts().completionCalls,0);assert.equal(h.counts().directWrites,0);
}

test('direct erection supports only the assigned main practice on days 1 through 5',async()=>{
 const h=harness();try{
  for(const day of [1,2,3,4,5]){
   assert.equal(h.api.supports({...h.c,day},h.activity),true);
   const definition=h.api.definition(day);for(const key of ['title','summary','script','audioSrc'])assert.equal(typeof definition[key],'string',key);
   assert.ok(definition.title.trim());assert.ok(definition.summary.trim());assert.ok(definition.script.trim());assert.match(definition.audioSrc,/\.mp3(?:\?|$)/);
  }
  for(const day of [0,1.5,...Array.from({length:23},(_,i)=>i+6),29])assert.equal(h.api.supports({...h.c,day},h.activity),false,'unsupported day '+day);
  for(const primary of ['desire','ejaculation','confidence','wellbeing','lifestyle'])assert.equal(h.api.supports({...h.c,primary},h.activity),false,primary);
  assert.equal(h.api.supports(h.c,{...h.activity,id:'support'}),false);
  assert.equal(h.api.supports(h.c,{...h.activity,kind:'worksheet'}),false);
  for(const key of ['userId','planId'])for(const value of [undefined,'']){
   const previous=h.c[key];if(value===undefined)delete h.c[key];else h.c[key]=value;
   assert.equal(await h.api.open(h.activity),false,key+' must be present and nonempty');
   assert.equal(h.reads.length,0);assert.equal(h.form(),null);assert.equal(h.attempts.length,0);assert.equal(h.writes.length,0);assert.equal(h.counts().directWrites,0);
   h.c[key]=previous;
  }
 }finally{h.close();}
});

test('day six exposes narration data without accepting or opening an erection or pelvic form',async()=>{
 const h=harness(6);try{
  const definition=h.api.definition(6);assert.equal(definition.title,'Tu práctica de piso pélvico');assert.ok(definition.summary);assert.ok(definition.script);
  assert.equal(definition.audioSrc,'/premium-v2/assets/audio/erection/erection-day-6-20261113.mp3');
  for(const kind of ['erection','pelvic']){
   const activity={...h.activity,kind};h.setAssignments([activity]);assert.equal(h.api.supports(h.c,activity),false);assert.equal(await h.api.open(activity),false);
  }
  assert.equal(h.api.valid(saved(6),6),false);assert.equal(h.form(),null);assert.deepEqual(h.reads,[]);assert.deepEqual(h.attempts,[]);assert.equal(h.counts().directWrites,0);
 }finally{h.close();}
});

test('each direct practice opens inline with its matching optional audio and no default scores or confirmation',async()=>{
 for(const day of [1,2,3,4,5]){
  const h=harness(day);try{
   await h.api.open(h.activity);const form=h.form(),definition=h.api.definition(day);assert.ok(form);
   assert.ok(form.closest('#spmDailyWorkspace'));assert.ok(h.host().querySelector('[data-erection-practice]'));
   assert.deepEqual(h.reads,[{scope:'qa:plan',day}]);
   for(const name of ['anxiety','confidence'])assert.equal(form.querySelector('[name="'+name+'"]').value,'');
   const checkbox=form.querySelector('[name="confirmed"]');assert.equal(checkbox.checked,false);assert.equal(checkbox.required,true);
   const audio=h.host().querySelector('[data-checkpoint-audio] audio');assert.ok(audio);assert.equal(audio.getAttribute('src'),definition.audioSrc);assert.equal(audio.autoplay,false);assert.equal(h.state(audio).plays,0);
   const transcript=h.host().querySelector('.spm-checkpoint-audio-transcript');assert.equal(transcript.textContent,definition.script);assert.equal(transcript.closest('details').open,false);
   assert.equal(h.counts().nativeCalls,0);assert.equal(h.writes.length,0);assert.equal(h.c.day,day);
  }finally{h.close();}
 }
});

test('all five practices require fresh explicit confirmation and save only main without advancing the day',async()=>{
 for(const day of [1,2,3,4,5]){
  const h=harness(day);try{
   await h.api.open(h.activity);const form=h.form();answer(form,day);await submit(h,form);assert.equal(h.writes.length,0,'day '+day+' cannot save without confirmation');
   confirm(form);await submit(h,form);assertOnlyMainWrite(h,day);
   const record=h.writes[0].metadata;assert.equal(record.erectionPracticeVersion,1);assert.equal(record.day,day);assert.equal(record.confirmed,true);assert.equal(record.anxiety,null);assert.equal(record.confidence,null);assert.equal(h.api.valid(record,day),true);
  }finally{h.close();}
 }
});

test('day one requires a firmness choice and preserves zero separately from not evaluable',async()=>{
 for(const [choice,expected,evaluable] of [['0',0,true],['na',null,false]]){
  const h=harness(1);try{
   await h.api.open(h.activity);const form=h.form();
   assert.deepEqual([...form.querySelectorAll('[name="ehs"]')].map(input=>input.value),['0','1','2','3','4','na']);
   assert.equal(form.querySelector('[name="ehs"]:checked'),null);confirm(form);await submit(h,form);assert.equal(h.writes.length,0);
   choose(form,'ehs',choice);if(choice==='0'){select(form,'anxiety','0');select(form,'confidence','10');}
   await submit(h,form);assertOnlyMainWrite(h,1);
   const record=h.writes[0].metadata;assert.equal(record.ehs,expected);assert.equal(record.ehsEvaluable,evaluable);
   assert.equal(record.anxiety,choice==='0'?0:null);assert.equal(record.confidence,choice==='0'?10:null);
  }finally{h.close();}
 }
});

test('day two requires explicit context and response choices while all not-evaluable answers remain valid',async()=>{
 const h=harness(2);try{
  await h.api.open(h.activity);const form=h.form();confirm(form);
  for(const context of ['spontaneous','solo','partner'])assert.equal(form.querySelector('[name="context-'+context+'"]').value,'');
  assert.equal(form.querySelector('[name="responseAspect"]:checked'),null);
  await submit(h,form);assert.equal(h.writes.length,0);
  for(const context of ['spontaneous','solo','partner'])select(form,'context-'+context,'not_evaluable');
  await submit(h,form);assert.equal(h.writes.length,0,'an unanswered response aspect is not inferred');
  choose(form,'responseAspect','not_evaluable');await submit(h,form);assertOnlyMainWrite(h,2);
  assert.deepEqual(h.writes[0].metadata.contexts,{spontaneous:'not_evaluable',solo:'not_evaluable',partner:'not_evaluable'});
  assert.equal(h.writes[0].metadata.responseAspect,'not_evaluable');
 }finally{h.close();}
});

test('day three keeps none exclusive and permits explicit completion without starting a timer',async()=>{
 const h=harness(3);try{
  await h.api.open(h.activity);const form=h.form();confirm(form);await submit(h,form);assert.equal(h.writes.length,0);
  choose(form,'tensionArea','jaw');choose(form,'tensionArea','shoulders');choose(form,'tensionArea','none');
  assert.deepEqual([...form.querySelectorAll('[name="tensionArea"]:checked')].map(input=>input.value),['none']);
  choose(form,'tensionArea','abdomen');assert.deepEqual([...form.querySelectorAll('[name="tensionArea"]:checked')].map(input=>input.value),['abdomen']);
  await submit(h,form);assert.equal(h.writes.length,0,'the sensory anchor must be chosen');
  choose(form,'sensoryAnchor','support');form.querySelector('[name="finalFeeling"]').value='Más cómodo, a mi ritmo.';
  await submit(h,form);assertOnlyMainWrite(h,3);const record=h.writes[0].metadata;
  assert.deepEqual(record.tensionAreas,['abdomen']);assert.equal(record.sensoryAnchor,'support');assert.equal(record.finalFeeling,'Más cómodo, a mi ritmo.');
  assert.ok(record.seconds===null||record.seconds===0,'the optional timer has no minimum duration');
 }finally{h.close();}
});

test('day four requires a chosen sensation and experience while its timer remains optional and supports stay separate',async()=>{
 const h=harness(4,{seconds:0,notes:'Registro anterior',legacyObservation:{value:'conservar'}});try{
  const support={completed:true,source:'sensate-lab'},story={completed:false};h.db[4]['sensate-prepare']=clone(support);h.db[4]['recovery-condom']=clone(story);
  await h.api.open(h.activity);const form=h.form();
  assert.equal(form.querySelector('[name="attentionSense"]:checked'),null);assert.equal(form.querySelector('[name="practiceExperience"]:checked'),null);
  assert.equal(form.querySelector('[data-erection-time]').textContent,'00:00');assert.equal(form.querySelector('[data-erection-timer-toggle]').textContent,'Iniciar');
  confirm(form);await submit(h,form);assert.equal(h.attempts.length,0);
  choose(form,'attentionSense','rhythm');await submit(h,form);assert.equal(h.attempts.length,0);
  choose(form,'practiceExperience','difficult');form.querySelector('[name="finalFeeling"]').value=' Pude volver a mi ritmo. ';
  await submit(h,form);assertOnlyMainWrite(h,4);const record=h.writes[0].metadata;
  assert.equal(record.attentionSense,'rhythm');assert.equal(record.practiceExperience,'difficult');assert.equal(record.finalFeeling,'Pude volver a mi ritmo.');assert.equal(record.seconds,null);
  assert.equal(record.notes,'Registro anterior');assert.deepEqual(record.legacyObservation,{value:'conservar'});assert.equal(record.anxiety,null);assert.equal(record.confidence,null);
  assert.deepEqual(h.db[4]['sensate-prepare'],support);assert.deepEqual(h.db[4]['recovery-condom'],story);
 }finally{h.close();}
});

test('day four counts only active optional timer time and can save after pausing and resuming',async()=>{
 const h=harness(4);try{
  let now=0;Object.defineProperty(h.w.performance,'now',{configurable:true,value:()=>now});
  await h.api.open(h.activity);const form=h.form();answer(form,4);confirm(form);
  const timer=form.querySelector('[data-erection-timer-toggle]'),clock=form.querySelector('[data-erection-time]');timer.click();now=1700;h.api.pause();
  assert.equal(clock.textContent,'00:01');assert.equal(timer.textContent,'Continuar');now=11700;assert.equal(h.writes.length,0);
  timer.click();now=12200;h.api.pause();assert.equal(clock.textContent,'00:02');await submit(h,form);assertOnlyMainWrite(h,4);assert.equal(h.writes[0].metadata.seconds,2);
 }finally{h.close();}
});

test('day five enforces selection limits and keeps unknown exclusive in each group without inferring an adjustment',async()=>{
 const h=harness(5);try{
  await h.api.open(h.activity);const form=h.form();confirm(form);
  for(const name of ['erectionFacilitators','erectionInhibitors','microAdjustment'])assert.equal(form.querySelector('[name="'+name+'"]:checked'),null);
  for(const value of ['contact','rhythm','privacy','connection'])choose(form,'erectionFacilitators',value);
  for(const value of ['pressure','rush','stress'])choose(form,'erectionInhibitors',value);
  const status=form.querySelector('[data-erection-status]');assert.match(status.textContent,/3 facilitadores y 2 inhibidores/);
  await submit(h,form);assert.equal(h.attempts.length,0);assert.match(status.textContent,/Desmarca/);
  choose(form,'erectionFacilitators','connection');await submit(h,form);assert.equal(h.attempts.length,0);assert.match(status.textContent,/máximo 2 inhibidores/);
  for(const name of ['erectionFacilitators','erectionInhibitors']){
   choose(form,name,'unknown');assert.deepEqual([...form.querySelectorAll('[name="'+name+'"]:checked')].map(input=>input.value),['unknown']);
  }
  choose(form,'erectionFacilitators','contact');assert.equal(form.querySelector('[name="erectionFacilitators"][value="unknown"]').checked,false);
  assert.equal(form.querySelector('[name="erectionInhibitors"][value="unknown"]').checked,true,'the two groups are independent');
  choose(form,'erectionFacilitators','unknown');await submit(h,form);assert.equal(h.attempts.length,0,'an adjustment still needs an explicit answer');
  choose(form,'microAdjustment','observe');await submit(h,form);assertOnlyMainWrite(h,5);
  assert.deepEqual(h.writes[0].metadata.erectionFacilitators,['unknown']);assert.deepEqual(h.writes[0].metadata.erectionInhibitors,['unknown']);assert.equal(h.writes[0].metadata.microAdjustment,'observe');
 }finally{h.close();}
});

test('day five preserves legacy text and mixed stimuli through a failed save without preselecting new answers',async()=>{
 const prior={day:5,phase:'PREPARAR',activity:'Mapa anterior',ehs:null,ehsEvaluable:false,anxiety:3,confidence:7,notes:'Anotación personal anterior',date:'2026-10-01T12:00:00.000Z',facilitators:'Privacidad y contacto',inhibitors:'Prisa y cansancio',stimuli:['0','1','8'],thought:'Otra observación',seconds:0,legacyAssessment:{answers:[1,null,3],source:'original'}};
 const h=harness(5,prior);try{
  const desire={completed:false,legacy:'intacto'};h.db[5]['de-desire-5']=clone(desire);
  await h.api.open(h.activity);const form=h.form();
  for(const name of ['erectionFacilitators','erectionInhibitors','microAdjustment'])assert.equal(form.querySelector('[name="'+name+'"]:checked'),null,name+' is not inferred from legacy values');
  choose(form,'erectionFacilitators','contact');choose(form,'erectionFacilitators','privacy');choose(form,'erectionInhibitors','rush');choose(form,'microAdjustment','time');confirm(form);h.failSave=true;
  await submit(h,form);assert.equal(h.writes.length,0);assert.equal(h.form(),form);assert.equal(form.querySelector('[data-erection-save]').disabled,false);assert.deepEqual(h.db[5].main,prior);
  h.failSave=false;await submit(h,form);assertOnlyMainWrite(h,5);const record=h.writes[0].metadata;
  for(const name of ['facilitators','inhibitors','stimuli','notes','thought','seconds','legacyAssessment','anxiety','confidence'])assert.deepEqual(record[name],prior[name],name+' remains intact');
  assert.deepEqual(record.erectionFacilitators,['contact','privacy']);assert.deepEqual(record.erectionInhibitors,['rush']);assert.equal(record.microAdjustment,'time');assert.deepEqual(h.db[5]['de-desire-5'],desire);
 }finally{h.close();}
});

test('record validation rejects malformed answers and mismatched days without coercing missing values',()=>{
 const h=harness();try{
  for(const day of [1,2,3,4,5]){
   const record=saved(day);assert.equal(h.api.valid(record,day),true);assert.equal(h.api.valid(record,day===5?1:day+1),false);
   assert.equal(h.api.valid({...record,erectionPracticeVersion:2},day),false);assert.equal(h.api.valid({...record,confirmed:false},day),false);
   for(const name of ['anxiety','confidence'])for(const value of [-1,11,1.5,'0',false,undefined])assert.equal(h.api.valid({...record,[name]:value},day),false,name+'='+String(value));
   assert.equal(h.api.valid({...record,anxiety:0,confidence:10},day),true);
  }
  for(const ehs of [0,1,2,3,4])assert.equal(h.api.valid(saved(1,{ehs,ehsEvaluable:true}),1),true);
  for(const extra of [{ehs:null,ehsEvaluable:true},{ehs:0,ehsEvaluable:false},{ehs:5,ehsEvaluable:true},{ehs:'0',ehsEvaluable:true}])assert.equal(h.api.valid(saved(1,extra),1),false);
  for(const context of ['easy','variable','difficult','not_evaluable'])assert.equal(h.api.valid(saved(2,{contexts:{spontaneous:context,solo:context,partner:context}}),2),true);
  for(const responseAspect of ['initiate','maintain','recover','none','not_evaluable'])assert.equal(h.api.valid(saved(2,{responseAspect}),2),true);
  assert.equal(h.api.valid(saved(2,{contexts:{spontaneous:'easy',solo:'easy'}}),2),false);
  assert.equal(h.api.valid(saved(2,{contexts:{spontaneous:'unknown',solo:'easy',partner:'easy'}}),2),false);
  assert.equal(h.api.valid(saved(2,{responseAspect:''}),2),false);
  for(const seconds of [null,0,1,300])assert.equal(h.api.valid(saved(3,{seconds}),3),true);
  for(const seconds of [-1,0.5,'1',NaN])assert.equal(h.api.valid(saved(3,{seconds}),3),false);
  for(const tensionAreas of [[],['unknown'],['none','jaw']])assert.equal(h.api.valid(saved(3,{tensionAreas}),3),false);
  assert.equal(h.api.valid(saved(3,{sensoryAnchor:'unknown'}),3),false);
  assert.equal(h.api.valid(saved(3,{finalFeeling:'x'.repeat(1001)}),3),false);
  for(const attentionSense of ['temperature','contact','rhythm'])for(const practiceExperience of ['returned','difficult','no_checking'])assert.equal(h.api.valid(saved(4,{attentionSense,practiceExperience}),4),true);
  for(const extra of [{attentionSense:''},{attentionSense:'sound'},{practiceExperience:undefined},{practiceExperience:'unknown'},{seconds:-1},{seconds:'0'},{finalFeeling:'x'.repeat(1001)}])assert.equal(h.api.valid(saved(4,extra),4),false);
  for(const microAdjustment of ['privacy','time','rhythm','communicate','observe'])assert.equal(h.api.valid(saved(5,{microAdjustment}),5),true);
  assert.equal(h.api.valid(saved(5,{erectionFacilitators:['contact','privacy','solo'],erectionInhibitors:['pressure','fatigue']}),5),true);
  for(const extra of [{erectionFacilitators:[]},{erectionFacilitators:['contact','rhythm','privacy','connection']},{erectionFacilitators:['contact','contact']},{erectionFacilitators:['unknown','contact']},{erectionFacilitators:['invalid']},{erectionInhibitors:[]},{erectionInhibitors:['pressure','rush','stress']},{erectionInhibitors:['unknown','stress']},{erectionInhibitors:['fatigue','fatigue']},{microAdjustment:''}])assert.equal(h.api.valid(saved(5,extra),5),false);
 }finally{h.close();}
});

test('reopening restores each day answers and scores while requiring a new confirmation',async()=>{
 for(const [day,record] of [
  [1,saved(1,{ehs:0,ehsEvaluable:true,anxiety:0,confidence:10})],
  [2,saved(2,{contexts:{spontaneous:'easy',solo:'variable',partner:'not_evaluable'},responseAspect:'maintain',anxiety:3,confidence:6})],
  [3,saved(3,{tensionAreas:['jaw','abdomen'],sensoryAnchor:'sound',finalFeeling:'Reconocí mis apoyos.',seconds:17,anxiety:2,confidence:7})],
  [4,saved(4,{attentionSense:'temperature',practiceExperience:'difficult',finalFeeling:'Volví a la temperatura.',seconds:9,anxiety:0,confidence:6})],
  [5,saved(5,{erectionFacilitators:['privacy','connection'],erectionInhibitors:['rush'],microAdjustment:'time',anxiety:1,confidence:8})]
 ]){
  const h=harness(day,record);try{
   await h.api.open(h.activity);const form=h.form();assert.ok(form);
   assert.equal(form.querySelector('[name="confirmed"]').checked,false);
   assert.equal(form.querySelector('[name="anxiety"]').value,String(record.anxiety));assert.equal(form.querySelector('[name="confidence"]').value,String(record.confidence));
   if(day===1)assert.equal(form.querySelector('[name="ehs"]:checked').value,'0');
   if(day===2){for(const [context,value] of Object.entries(record.contexts))assert.equal(form.querySelector('[name="context-'+context+'"]').value,value);assert.equal(form.querySelector('[name="responseAspect"]:checked').value,'maintain');}
   if(day===3){assert.deepEqual([...form.querySelectorAll('[name="tensionArea"]:checked')].map(input=>input.value),['jaw','abdomen']);assert.equal(form.querySelector('[name="sensoryAnchor"]:checked').value,'sound');assert.equal(form.querySelector('[name="finalFeeling"]').value,record.finalFeeling);}
   if(day===4){assert.equal(form.querySelector('[name="attentionSense"]:checked').value,record.attentionSense);assert.equal(form.querySelector('[name="practiceExperience"]:checked').value,record.practiceExperience);assert.equal(form.querySelector('[name="finalFeeling"]').value,record.finalFeeling);assert.equal(form.querySelector('[data-erection-time]').textContent,'00:09');}
   if(day===5){for(const name of ['erectionFacilitators','erectionInhibitors'])assert.deepEqual([...form.querySelectorAll('[name="'+name+'"]:checked')].map(input=>input.value),record[name]);assert.equal(form.querySelector('[name="microAdjustment"]:checked').value,'time');}
   await submit(h,form);assert.equal(h.writes.length,0);assert.deepEqual(h.db[day].main,record);
  }finally{h.close();}
 }
});

test('a failed save retains the form and answers; retry preserves unknown existing metadata',async()=>{
 const prior=saved(1,{ehs:2,ehsEvaluable:true,anxiety:3,confidence:7,legacyNote:'Conservar este dato',legacyAssessment:{answers:[1,null,3],source:'original'}});
 const h=harness(1,prior);try{
  await h.api.open(h.activity);const form=h.form();choose(form,'ehs','4');select(form,'confidence','8');confirm(form);h.failSave=true;
  await submit(h,form);assert.equal(h.writes.length,0);assert.equal(h.attempts.length,1);assert.equal(h.form(),form);
  assert.equal(form.querySelector('[name="ehs"]:checked').value,'4');assert.equal(form.querySelector('[name="confidence"]').value,'8');assert.equal(form.querySelector('[name="confirmed"]').checked,true);
  assert.equal(form.querySelector('[data-erection-save]').disabled,false);assert.match(h.host().querySelector('[data-erection-status]').textContent,/guardar|reintent/i);
  assert.deepEqual(h.db[1].main,prior);h.failSave=false;await submit(h,form);assertOnlyMainWrite(h,1);
  const record=h.writes[0].metadata;assert.equal(record.ehs,4);assert.equal(record.confidence,8);assert.equal(record.legacyNote,prior.legacyNote);assert.deepEqual(record.legacyAssessment,prior.legacyAssessment);
 }finally{h.close();}
});

test('a failed history read offers retry without allowing unseen records to be overwritten',async()=>{
 const prior=saved(2,{responseAspect:'recover'}),h=harness(2,prior);try{
  const originalRead=h.w.SPM_DAILY_RECORDS.read;h.w.SPM_DAILY_RECORDS.read=async()=>{throw Error('offline');};
  await h.api.open(h.activity);assert.equal(h.form(),null);assert.equal(h.writes.length,0);
  const retry=h.host().querySelector('[data-erection-retry]');assert.ok(retry);
  h.w.SPM_DAILY_RECORDS.read=originalRead;retry.click();await tick();assert.ok(h.form());assert.equal(h.form().querySelector('[name="responseAspect"]:checked').value,'recover');assert.equal(h.form().querySelector('[name="confirmed"]').checked,false);assert.equal(h.writes.length,0);
 }finally{h.close();}
});

const changes=[
 ['account',h=>{h.c.userId='other';}],
 ['plan',h=>{h.c.planId='other';}],
 ['day',h=>{h.c.day=2;}],
 ['primary route',h=>{h.c.primary='desire';}],
 ['safety restriction',h=>{h.c.safety='review';}],
 ['assigned main kind',h=>h.setAssignments([{...h.activity,kind:'worksheet'}])],
 ['missing assignment',h=>h.setAssignments([])],
 ['active practice',h=>h.setActive({id:'other',scope:'qa:plan',day:1})],
 ['workspace replacement',h=>{h.host().outerHTML='<div id="spmDailyWorkspace"></div>';}]
];

test('a deferred history response cannot render after its account, day, safety, assignment, active practice or host changes',async()=>{
 for(const [name,change] of changes){
  const h=harness();try{
   const pending=deferred(),host=h.host();h.w.SPM_DAILY_RECORDS.read=()=>pending.promise;
   const opening=h.api.open(h.activity);change(h);pending.resolve({main:saved(1)});await opening;await tick();
   assert.equal(h.form(),null,name);assert.equal(host.querySelector('[data-erection-form]'),null,name+' must not render into the old host');assert.equal(h.writes.length,0,name);
  }finally{h.close();}
 }
});

test('a previously rendered form cannot save after its account, day, safety, assignment, active practice or host changes',async()=>{
 for(const [name,change] of changes){
  const h=harness();try{
   await h.api.open(h.activity);const form=h.form();answer(form,1);confirm(form);change(h);await submit(h,form);
   assert.equal(h.attempts.length,0,name);assert.equal(h.writes.length,0,name);assert.equal(h.counts().directWrites,0,name);
  }finally{h.close();}
 }
});

test('the optional active-practice API is not required when the authoritative assignment and scope are valid',async()=>{
 const h=harness();try{
  delete h.w.SPM_DAILY_PRACTICE.active;await h.api.open(h.activity);const form=h.form();assert.ok(form);answer(form,1);confirm(form);await submit(h,form);assertOnlyMainWrite(h,1);
 }finally{h.close();}
});

test('pausing day three freezes audio and elapsed time while preserving the current form and its ability to save',async()=>{
 const h=harness(3);try{
  await h.api.open(h.activity);const form=h.form();choose(form,'tensionArea','shoulders');choose(form,'sensoryAnchor','sound');select(form,'anxiety','0');select(form,'confidence','8');
  form.querySelector('[name="finalFeeling"]').value='Reconocí el sonido y relajé los hombros.';confirm(form);
  const clock=h.host().querySelector('[data-erection-time]'),audio=h.host().querySelector('[data-checkpoint-audio] audio');
  h.host().querySelector('[data-checkpoint-audio-toggle]').click();h.host().querySelector('[data-erection-timer-toggle]').click();await tick();assert.equal(audio.paused,false);
  await delay(1100);h.api.pause();await tick();
  const pausedText=clock.textContent,match=pausedText.match(/(\d+):(\d{2})/);assert.ok(match);const pausedSeconds=Number(match[1])*60+Number(match[2]);assert.ok(pausedSeconds>0);
  assert.equal(audio.paused,true);assert.equal(h.form(),form);assert.equal(form.isConnected,true);assert.equal(form.querySelector('[name="confirmed"]').checked,true);
  await delay(1100);assert.equal(clock.textContent,pausedText,'hidden or paused time is not counted');assert.equal(h.writes.length,0);
  await submit(h,form);assertOnlyMainWrite(h,3);const record=h.writes[0].metadata;
  assert.deepEqual(record.tensionAreas,['shoulders']);assert.equal(record.sensoryAnchor,'sound');assert.equal(record.anxiety,0);assert.equal(record.confidence,8);
  assert.equal(record.finalFeeling,'Reconocí el sonido y relajé los hombros.');assert.equal(record.seconds,pausedSeconds);
 }finally{h.close();}
});

test('stopping or leaving day three stops its optional timer and audio without saving or advancing',async()=>{
 const h=harness(3);try{
  for(const exit of ['stop','back']){
   h.setActive({id:'main',scope:'qa:plan',day:3});await h.api.open(h.activity);const form=h.form();answer(form,3);
   const clock=h.host().querySelector('[data-erection-time]'),timer=h.host().querySelector('[data-erection-timer-toggle]');assert.ok(clock);assert.ok(timer);
   const audio=h.host().querySelector('[data-checkpoint-audio] audio'),play=h.host().querySelector('[data-checkpoint-audio-toggle]');play.click();timer.click();await tick();assert.equal(audio.paused,false);
   if(exit==='stop'){await delay(1100);assert.match(clock.textContent,/\d+:\d{2}/);assert.notEqual(Number(clock.textContent.replace(/\D/g,'')),0);h.api.stop();}
   else h.host().querySelector('[data-erection-back]').click();
   await tick();const stopped=clock.textContent;assert.equal(audio.paused,true,exit);await delay(1100);assert.equal(clock.textContent,stopped,exit+' must stop the timer');
   confirm(form);await submit(h,form);assert.equal(h.attempts.length,0,exit+' invalidates the previous form');
   assert.equal(h.writes.length,0);assert.equal(h.c.day,3);assert.deepEqual(h.c.completed,[]);
  }
  assert.equal(h.counts().opens,1);assert.equal(h.counts().nativeCalls,0);assert.equal(h.counts().completionCalls,0);assert.equal(h.counts().breathingCalls,0);
 }finally{h.close();}
});
