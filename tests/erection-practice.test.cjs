const {test}=require('node:test'),assert=require('node:assert/strict');
const {harness,answer,saved,assertOnlyMain,days,tick,clone,deferred}=require('./support/erection-touch-harness.cjs');

test('only the ten approved calendar assignments support direct erection practice',async()=>{
 const h=harness(),approvedDays=[1,3,6,9,12,15,18,21,24,27];try{
  for(let day=0;day<=29;day++)assert.equal(h.api.supports({...h.c,day},{...h.activity,erectionLesson:undefined}),approvedDays.includes(day),'day '+day);
  for(const [index,day] of approvedDays.entries()){
   const definition=h.api.definition(day);assert.equal(definition.erectionLesson,index+1);assert.equal(definition.calendarDay,day);
   for(const key of ['title','summary','script'])assert.ok(definition[key]);
   if(index<5)assert.ok(definition.audioSrc);else assert.equal(definition.audioSrc,null,'later sessions use the approved device voice');
   assert.equal(h.api.supports({...h.c,day},{...h.activity,erectionLesson:99}),false);
  }
  for(const primary of ['desire','ejaculation','confidence','wellbeing','lifestyle'])assert.equal(h.api.supports({...h.c,primary},h.activity),false);
  for(const change of [{id:'support'},{kind:'worksheet'}])assert.equal(h.api.supports(h.c,{...h.activity,...change}),false);
  for(const key of ['userId','planId'])for(const value of [undefined,'']){const prior=h.c[key];h.c[key]=value;assert.equal(await h.api.open(h.activity),false);h.c[key]=prior;}
  assert.deepEqual(h.reads,[]);assert.deepEqual(h.attempts,[]);
 }finally{h.close()}
});

for(const lesson of [1,2,3,4]){
 test(`session ${lesson} opens its approved touch surface without default answers, audio or records`,async()=>{
  const h=harness(lesson);try{
   assert.equal(await h.open(),true);assert.ok(h.panel());assert.equal(h.panel().dataset.screen,'1');
   assert.equal(h.host().querySelector('[data-erection-form]'),null);assert.equal(h.host().querySelector('[aria-pressed="true"]'),null);
   assert.deepEqual(h.reads,[{scope:'qa:plan',day:h.day}]);assert.equal(h.played.length,0);assert.equal(h.counts().nativeCalls,0);assert.deepEqual(h.writes,[]);
   if(lesson===1)h.touch('next');h.touch('next');
   assert.ok(h.host().querySelector('[role=alertdialog]'),'unanswered required choice cannot advance');assert.equal(h.writes.length,0);
  }finally{h.close()}
 });
 test(`session ${lesson} saves only its main record after an explicit final action`,async()=>{
  const h=harness(lesson);try{
   await h.open();answer(h);assert.equal(h.writes.length,0);h.touch('save');await tick();assertOnlyMain(h);
   const r=h.writes[0].metadata;assert.equal(r.confirmed,true);assert.equal(r.anxiety,null);assert.equal(r.confidence,null);assert.equal(h.api.valid(r,h.day),true);
   if(lesson>=3)assert.equal(r.seconds,null,'timer is optional');
   if(lesson===1){assert.equal(r.attentionPracticeCompleted,false);assert.equal(h.counts().opens,0);assert.ok(h.w.document.querySelector('.spm-ed1-success-overlay'));h.w.document.querySelector('[data-ed1-success-close]').click();assert.equal(h.counts().opens,1);}
   else assert.equal(h.counts().opens,1);
  }finally{h.close()}
 });
 test(`session ${lesson} preserves answers, unrelated records and metadata across failed save and retry`,async()=>{
  const prior=saved(lesson,{legacyNote:'Conservar',legacyAssessment:{answers:[1,null,3]}}),h=harness(lesson,prior);try{
   h.db[h.day].support={completed:false,custom:'intacto'};await h.open();answer(h);h.failSave=true;
   h.touch('save');await tick();assert.deepEqual(h.db[h.day].main,prior);assert.equal(h.writes.length,0);assert.ok(h.panel());assert.equal(h.el('save').disabled,false);
   h.failSave=false;const button=h.el('save');button.click();button.click();await tick();assertOnlyMain(h);assert.equal(h.attempts.length,2);
   assert.equal(h.writes[0].metadata.legacyNote,prior.legacyNote);assert.deepEqual(h.writes[0].metadata.legacyAssessment,prior.legacyAssessment);assert.deepEqual(h.db[h.day].support,{completed:false,custom:'intacto'});
   if(lesson===1)h.w.document.querySelector('[data-ed1-success-close]').click();
   const before=clone(h.db);await h.open();assert.ok(h.panel());h.touch('exit');assert.deepEqual(h.db,before);assert.equal(h.attempts.length,2);
  }finally{h.close()}
 });
 test(`session ${lesson} failed history read cannot overwrite unseen records and may be retried from Hoy`,async()=>{
  const prior=saved(lesson),h=harness(lesson,prior);try{
   const read=h.w.SPM_DAILY_RECORDS.read;h.w.SPM_DAILY_RECORDS.read=async()=>{throw Error('offline')};
   assert.equal(await h.open(),false);assert.equal(h.panel(),null);assert.ok(h.host().querySelector('[role=alert]'));assert.deepEqual(h.db[h.day].main,prior);assert.deepEqual(h.attempts,[]);
   h.w.SPM_DAILY_RECORDS.read=read;assert.equal(await h.open(),true);assert.ok(h.panel());assert.deepEqual(h.attempts,[]);
  }finally{h.close()}
 });
}

test('transversal and evaluation days cannot resurrect old forms or overwrite historical data',async()=>{
 const h=harness();try{for(const day of [2,4,5,7,8,10,11,13,14,16,17,19,20,22,23,25,26,28]){h.c.day=day;h.db[day]={main:{notes:'Historia intacta'}};assert.equal(await h.open(),false);assert.equal(h.api.definition(day),null);assert.equal(h.api.valid({...saved(1),day},day),false);assert.deepEqual(h.db[day],{main:{notes:'Historia intacta'}});}assert.deepEqual(h.attempts,[]);assert.deepEqual(h.reads,[]);}finally{h.close()}
});

test('record validation preserves EHS zero/null and rejects malformed scores, contexts, anchors and days',()=>{
 const h=harness();try{
  for(const lesson of [1,2,3,4]){const r=saved(lesson),day=days[lesson-1];assert.equal(h.api.valid(r,day),true);for(const patch of [{day:day+1},{erectionPracticeVersion:2},{confirmed:false},{erectionLesson:99}])assert.equal(h.api.valid({...r,...patch},day),false);
   for(const name of ['anxiety','confidence'])for(const value of [-1,11,1.5,'0',false,undefined])assert.equal(h.api.valid({...r,[name]:value},day),false);
   assert.equal(h.api.valid({...r,anxiety:0,confidence:10},day),true);
   if(lesson>1){const old={...r};delete old.erectionLesson;assert.equal(h.api.valid(old,day),false,'a legacy day record is not another session');}
  }
  for(const ehs of [0,1,2,3,4])assert.equal(h.api.valid(saved(1,{ehs,ehsEvaluable:true}),1),true);
  for(const patch of [{ehs:null,ehsEvaluable:true},{ehs:0,ehsEvaluable:false},{ehs:5,ehsEvaluable:true},{ehs:'0',ehsEvaluable:true}])assert.equal(h.api.valid(saved(1,patch),1),false);
  for(const value of ['easy','variable','difficult','not_evaluable'])assert.equal(h.api.valid(saved(2,{contexts:{spontaneous:value,solo:value,partner:value}}),3),true);
  for(const patch of [{contexts:{spontaneous:'easy'}},{contexts:{spontaneous:'invalid',solo:'easy',partner:'easy'}},{responseAspect:''}])assert.equal(h.api.valid(saved(2,patch),3),false);
  for(const patch of [{tensionAreas:[]},{tensionAreas:['none','jaw']},{tensionAreas:['unknown']},{sensoryAnchor:'invalid'},{seconds:-1},{seconds:'0'},{finalFeeling:'x'.repeat(1001)}])assert.equal(h.api.valid(saved(3,patch),6),false);
  for(const patch of [{attentionSense:''},{attentionSense:'sound'},{practiceExperience:'unknown'},{seconds:-1},{seconds:'0'},{finalFeeling:'x'.repeat(1001)}])assert.equal(h.api.valid(saved(4,patch),9),false);
 }finally{h.close()}
});

for(const lesson of [3,4])test(`session ${lesson} timer counts active time only; pause stops audio and does not save`,async()=>{
 const h=harness(lesson);try{
  await h.open();h.touch(lesson===3?'area':'sense',lesson===3?'shoulders':'temperature');h.touch('audio');
  if(lesson===3){assert.equal(h.played.length,1);assert.equal(h.played[0].paused,false);}else assert.ok(h.counts().nativeCalls>0);
  h.api.pause();assert.ok(h.played.every(audio=>audio.paused));h.touch('next');h.touch('timer');h.advance(2000);h.touch('timer');h.advance(10000);h.touch('timer');h.advance(1000);h.api.pause();h.advance(5000);
  h.touch('next');h.touch(lesson===3?'anchor':'result',lesson===3?'hands':'no_checking');assert.deepEqual(h.writes,[]);h.touch('save');await tick();assertOnlyMain(h);assert.equal(h.writes[0].metadata.seconds,3);
 }finally{h.close()}
});

const changes=[['account',h=>{h.c.userId='other'}],['plan',h=>{h.c.planId='other'}],['day',h=>{h.c.day=28}],['route',h=>{h.c.primary='desire'}],['safety',h=>{h.c.safety='review'}],['assignment',h=>h.setAssignments([{...h.activity,kind:'worksheet'}])],['missing assignment',h=>h.setAssignments([])],['active practice',h=>h.setActive({id:'other',scope:'qa:plan',day:h.day})],['host',h=>{h.host().outerHTML='<div id="spmDailyWorkspace"></div>'}]];
for(const lesson of [1,2,3,4])test(`session ${lesson} rejects stale loads and saves after account, day, safety, assignment or host changes`,async()=>{
 for(const [name,change] of changes){
  const h=harness(lesson);try{const pending=deferred();h.w.SPM_DAILY_RECORDS.read=()=>pending.promise;const opening=h.open();change(h);pending.resolve({main:saved(lesson)});await opening;assert.equal(h.panel(),null,name);assert.deepEqual(h.attempts,[]);}finally{h.close()}
  const j=harness(lesson);try{await j.open();answer(j);const button=j.el('save');change(j);button.click();await tick();assert.equal(j.attempts.length,0,name);assert.deepEqual(j.writes,[]);}finally{j.close()}
 }
});

test('the optional active-practice API is not required with an authoritative assignment and scope',async()=>{
 const h=harness();try{delete h.w.SPM_DAILY_PRACTICE.active;await h.open();answer(h);h.touch('save');await tick();assertOnlyMain(h);}finally{h.close()}
});
