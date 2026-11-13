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
}
async function submit(h,form=h.form()){
 form.dispatchEvent(new h.w.Event('submit',{bubbles:true,cancelable:true}));await tick();
}
function saved(day,extra={}){
 const common={erectionPracticeVersion:1,day,confirmed:true,anxiety:null,confidence:null};
 return{...common,...(day===1?{ehs:null,ehsEvaluable:false}:day===2?{contexts:{spontaneous:'not_evaluable',solo:'not_evaluable',partner:'not_evaluable'},responseAspect:'not_evaluable'}:{tensionAreas:['none'],sensoryAnchor:'hands',finalFeeling:'',seconds:null}),...extra};
}
function assertOnlyMainWrite(h,day){
 assert.equal(h.writes.length,1);assert.equal(h.writes[0].id,'main');assert.equal(h.writes[0].scope,'qa:plan');assert.equal(h.writes[0].day,day);
 assert.equal(h.c.day,day);assert.deepEqual(h.c.completed,[]);
 assert.equal(h.counts().breathingCalls,0);assert.equal(h.counts().completionCalls,0);assert.equal(h.counts().directWrites,0);
}

test('direct erection supports only the assigned main practice on days 1 through 3',async()=>{
 const h=harness();try{
  for(const day of [1,2,3]){
   assert.equal(h.api.supports({...h.c,day},h.activity),true);
   const definition=h.api.definition(day);for(const key of ['title','summary','script','audioSrc'])assert.equal(typeof definition[key],'string',key);
   assert.ok(definition.title.trim());assert.ok(definition.summary.trim());assert.ok(definition.script.trim());assert.match(definition.audioSrc,/\.mp3(?:\?|$)/);
  }
  for(const day of [0,...Array.from({length:25},(_,i)=>i+4),29])assert.equal(h.api.supports({...h.c,day},h.activity),false,'unsupported day '+day);
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

test('each direct practice opens inline with its matching optional audio and no default scores or confirmation',async()=>{
 for(const day of [1,2,3]){
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

test('all three practices require fresh explicit confirmation and save only main without advancing the day',async()=>{
 for(const day of [1,2,3]){
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

test('record validation rejects malformed answers and mismatched days without coercing missing values',()=>{
 const h=harness();try{
  for(const day of [1,2,3]){
   const record=saved(day);assert.equal(h.api.valid(record,day),true);assert.equal(h.api.valid(record,day===3?1:day+1),false);
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
 }finally{h.close();}
});

test('reopening restores each day answers and scores while requiring a new confirmation',async()=>{
 for(const [day,record] of [
  [1,saved(1,{ehs:0,ehsEvaluable:true,anxiety:0,confidence:10})],
  [2,saved(2,{contexts:{spontaneous:'easy',solo:'variable',partner:'not_evaluable'},responseAspect:'maintain',anxiety:3,confidence:6})],
  [3,saved(3,{tensionAreas:['jaw','abdomen'],sensoryAnchor:'sound',finalFeeling:'Reconocí mis apoyos.',seconds:17,anxiety:2,confidence:7})]
 ]){
  const h=harness(day,record);try{
   await h.api.open(h.activity);const form=h.form();assert.ok(form);
   assert.equal(form.querySelector('[name="confirmed"]').checked,false);
   assert.equal(form.querySelector('[name="anxiety"]').value,String(record.anxiety));assert.equal(form.querySelector('[name="confidence"]').value,String(record.confidence));
   if(day===1)assert.equal(form.querySelector('[name="ehs"]:checked').value,'0');
   if(day===2){for(const [context,value] of Object.entries(record.contexts))assert.equal(form.querySelector('[name="context-'+context+'"]').value,value);assert.equal(form.querySelector('[name="responseAspect"]:checked').value,'maintain');}
   if(day===3){assert.deepEqual([...form.querySelectorAll('[name="tensionArea"]:checked')].map(input=>input.value),['jaw','abdomen']);assert.equal(form.querySelector('[name="sensoryAnchor"]:checked').value,'sound');assert.equal(form.querySelector('[name="finalFeeling"]').value,record.finalFeeling);}
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
