const {test}=require('node:test'),assert=require('node:assert/strict');
const harness=require('./helpers/agenda-harness.cjs');
const routes=['erection','ejaculation','desire','confidence','wellbeing','lifestyle'];
const plain=v=>JSON.parse(JSON.stringify(v));
test('actual compositor resolves 168 days and three mixed scenarios with one principal and at most one optional support',()=>{
 const h=harness();let checked=0;
 for(const primary of routes)for(const secondary of [null,'desire'])for(const strength of [false,true])for(let day=1;day<=28;day++){
  const c=h.makeContext(primary,day,{secondary,motives:[primary,...(secondary?['desire']:[])]});if(strength)c.answers.pf_awareness='good_control';h.setContext(c);
  const actual=h.window.SPM_DAILY_PRACTICE.agenda(c);assert.equal(actual.ok,true,`${primary}/${secondary}/${day}`);
  const items=actual.assignments;assert.equal(items.filter(a=>a.role==='primary').length,1);assert.ok(items.filter(a=>a.role==='support').length<=1);
  assert.ok(items.filter(a=>a.role!=='primary').every(a=>a.optional===true));assert.equal(new Set(items.map(a=>a.id)).size,items.length);assert.equal(new Set(items.map(a=>a.contentId)).size,items.length);
  assert.ok(items.every(a=>/^[a-z0-9-]{1,60}$/.test(a.id)&&a.sourceActivityId&&a.assignmentId&&a.scheduledDay===day));
  assert.ok(actual.resources.every(a=>a.optional));checked++;
 }
 assert.equal(checked,672);
});
test('the ten erection sessions, twelve control sessions and original focus sequence retain their intended days',()=>{
 const h=harness();const daysFor=(route,fn)=>Array.from({length:28},(_,i)=>{const c=h.makeContext(route,i+1);return fn(h.window.SPM_DAILY_PRACTICE.agenda(c))?i+1:null;}).filter(Boolean);
 assert.deepEqual(daysFor('erection',p=>p.assignments.some(a=>a.role==='primary'&&a.kind==='erection')),[1,3,6,9,12,15,18,21,24,27]);
 assert.deepEqual(daysFor('ejaculation',p=>p.assignments.some(a=>a.role==='primary'&&a.kind==='ejaculation')),[1,3,5,8,10,12,15,17,19,22,24,26]);
 for(const route of routes)assert.deepEqual(daysFor(route,p=>p.assignments.some(a=>a.kind==='sensate')),[4,8,12,19,23,26]);
});
test('all seven former zero-required failures now have a valid voluntary close, without fake activity records',()=>{
 const h=harness();for(const [route,days] of [['erection',[16,19]],['ejaculation',[16]],['confidence',[16,19]],['lifestyle',[16,19]]])for(const day of days){
  const c=h.makeContext(route,day,{scheduleVersion:'legacy'});h.setContext(c);const p=h.window.SPM_DAILY_PRACTICE.agenda(c);assert.equal(p.required.length,0);
  for(const records of [{},Object.fromEntries(p.assignments.filter(a=>a.optional).slice(0,1).map(a=>[a.id,{completed:true}])),Object.fromEntries(p.assignments.filter(a=>a.optional).map(a=>[a.id,{completed:true}]))]){
   const d=h.window.SPM_DAILY_PRACTICE.closeDecision(c,records,{recordsLoaded:true});assert.equal(d.allowed,true,`${route}/${day}`);assert.equal(d.voluntary,true);
  }
 }
});
test('every new day with zero requirements permits deliberate closure, including optional principals',()=>{
 const h=harness();let count=0;for(const route of routes)for(let day=1;day<=28;day++){
  const c=h.makeContext(route,day);h.setContext(c);const p=h.window.SPM_DAILY_PRACTICE.agenda(c);if(p.required.length)continue;
  const d=h.window.SPM_DAILY_PRACTICE.closeDecision(c,{}, {recordsLoaded:true});assert.equal(d.allowed,true,`${route}/${day}`);assert.equal(d.voluntary,true);count++;
 }assert.ok(count>50);
});
test('missing catalogue, unknown version, unloaded records and urgent pause cannot look like an empty valid day',()=>{
 const h=harness(),api=h.window.SPM_DAILY_PRACTICE,c=h.makeContext('confidence',16);h.setContext(c);
 assert.equal(api.closeDecision(c,{},{}).code,'records-unavailable');
 assert.equal(api.closeDecision({...c,scheduleVersion:'unknown'}, {}, {recordsLoaded:true}).code,'version-unknown');
 assert.equal(api.closeDecision({...c,day:0},{},{recordsLoaded:true}).allowed,false);
 assert.equal(api.closeDecision({...c,safety:'urgent'},{},{recordsLoaded:true}).code,'safety-pause');
 const closed=api.closeDecision({...c,cycleStatus:'completed',safety:'urgent'},{},{recordsLoaded:true});assert.equal(closed.alreadyClosed,true);assert.equal(closed.allowed,false,'a historical closure never removes a safety pause');
 const closedUnavailable=api.closeDecision({...c,completed:[16]}, {}, {});assert.equal(closedUnavailable.alreadyClosed,true);assert.equal(closedUnavailable.allowed,false);
 const urgentFocus={...c,day:19,safety:'urgent'};assert.equal(api.restricted(urgentFocus,api.assignments(urgentFocus)[0]),true);
 const prior=h.window.SPM_MODULES;h.window.SPM_MODULES=undefined;assert.equal(api.closeDecision(c,{}, {recordsLoaded:true}).code,'catalog-unavailable');h.window.SPM_MODULES=prior;
 const incomplete={...c,answers:{}};assert.equal(api.closeDecision(incomplete,{}, {recordsLoaded:true}).code,'assessment-pending');
});
test('a required record must match its actual content and assignment version; optional data never replaces it',()=>{
 const h=harness(),api=h.window.SPM_DAILY_PRACTICE,c=h.makeContext('confidence',2);h.setContext(c);const a=api.assignments(c)[0],record={...h.window.SPM_AGENDA.metadata(a),completed:true,confirmed:true,activityKind:a.kind,reflection:'Dato sintético',measure:'Dato sintético'};
 assert.equal(api.closeDecision(c,{}, {recordsLoaded:true}).code,'activities-pending');
 assert.equal(api.closeDecision(c,{[a.id]:record}, {recordsLoaded:true}).allowed,true);
 for(const key of ['contentId','assignmentId','contentVersion','scheduleVersion'])assert.equal(api.closeDecision(c,{[a.id]:{...record,[key]:'wrong'}},{recordsLoaded:true}).allowed,false,key);
 assert.equal(api.recordSatisfies(a,{[a.id]:{...record,scheduledDay:String(c.day)}},c),false,'a string is not the scheduled day integer');
 assert.equal(api.recordSatisfies(a,{[a.id]:{...record,activityKind:''}},c),false,'present empty kinds are invalid');
 assert.equal(api.closeDecision(c,{[a.id]:{...record,completed:false,activityStatus:'interrupted'}},{recordsLoaded:true}).allowed,false);
 for(const activityStatus of ['omitted','interrupted','draft','pending','unknown'])assert.equal(api.recordSatisfies(a,{[a.id]:{...record,activityStatus}},c),false,activityStatus);
 assert.equal(api.recordSatisfies(a,{[a.id]:{...record,activityStatus:'completed'}},c),true);
});
test('source day, scheduled day and connection content day remain distinct when an existing activity moves',()=>{
 const h=harness(),api=h.window.SPM_DAILY_PRACTICE;
 const confidence=api.assignments(h.makeContext('confidence',11))[0];assert.equal(confidence.confidenceDay,12);assert.equal(confidence.sourceDay,12);assert.equal(confidence.scheduledDay,11);
 const end=api.assignments(h.makeContext('desire',28))[0];assert.equal(end.sourceDay,26);assert.equal(end.scheduledDay,28);assert.equal(end.kind,'desire');
 const connection=api.assignments(h.makeContext('ejaculation',11))[0];assert.equal(connection.connectionDay,10);assert.equal(connection.scheduledDay,11);
});
test('recovery is offered only on request; requesting it never changes the closure requirements',()=>{
 const h=harness(),c=h.makeContext('erection',4);h.setContext(c);const before=h.window.SPM_AGENDA.resolve(c);assert.ok(before.conditionalSupport);assert.equal(before.assignments.some(a=>a.kind==='recovery'),false);
 h.window.SPM_AGENDA.requestRecovery(c,before.conditionalSupport.scenario);const after=h.window.SPM_AGENDA.resolve(c);assert.equal(after.assignments.filter(a=>a.kind==='recovery').length,1);assert.equal(after.required.length,before.required.length);assert.ok(after.assignments.find(a=>a.kind==='recovery').optional);
});
test('explanation video belongs to the correct host without another requirement; midpoint reminder is compact and optional',()=>{
 const h=harness(),c=h.makeContext('wellbeing',4),p=h.window.SPM_AGENDA.resolve(c);assert.equal(p.assignments[0].integratedExplanations.length,0);const focus=p.assignments.find(a=>a.kind==='sensate');assert.equal(focus.integratedExplanations[0].videoKey,'sensory-focus');assert.equal(p.assignments.some(a=>a.kind==='video'),false);
 const later=h.window.SPM_AGENDA.resolve(h.makeContext('wellbeing',18));const reminder=later.resources.find(a=>a.reminder);assert.equal(reminder.optional,true);assert.equal(reminder.sourceDay,14);assert.equal(reminder.scheduledDay,18);assert.equal(later.required.some(a=>a.id==='program-checkpoint'),false);
});


test('source hydration is stable when strength readiness changes, while strength stays a separate optional resource',()=>{
 const h=harness(),api=h.window.SPM_DAILY_PRACTICE;
 const base=h.makeContext('confidence',6),ready={...base,answers:{...base.answers,pf_awareness:'good_control'}};
 const before=api.agenda(base),after=api.agenda(ready);
 assert.equal(before.assignments[0].summary,after.assignments[0].summary);assert.equal(before.assignments[0].kind,after.assignments[0].kind);assert.equal(before.assignments[0].contentId,after.assignments[0].contentId);
 assert.equal(before.assignments[0].kind,'confidence');assert.match(after.assignments[0].summary,/sin apretar ni forzar/);
 assert.equal(before.resources.some(a=>a.pelvicIntent==='scheduled'),false);
 assert.equal(after.resources.find(a=>a.pelvicIntent==='scheduled').optional,true);
});

test('source-derived minimal fixtures satisfy the real DE, Connection, checkpoint and generic closure validators',t=>{
 const {validDailyRecord}=require('./helpers/valid-daily-record.cjs'),h=harness(),api=h.window.SPM_DAILY_PRACTICE;let count=0;
 for(const scheduleVersion of ['legacy','spm-20261127-v1'])for(const primary of routes)for(let day=1;day<=28;day++){
  const c=h.makeContext(primary,day,{scheduleVersion});h.setContext(c);
  for(const a of api.assignments(c)){
   const fixture=validDailyRecord(a,day);assert.equal(api.recordSatisfies(a,{[a.id]:fixture},c),true,`${scheduleVersion}/${primary}/${day}/${a.id}/${a.kind}`);count++;
   if(a.kind==='erection'&&a.erectionLesson===1){const omitted=validDailyRecord(a,day,{omittedDE01:true});assert.equal(api.recordSatisfies(a,{[a.id]:omitted},c),true);assert.equal(api.recordComplete(a,{[a.id]:omitted},c),false);}
  }
 }
 assert.ok(count>1000);t.diagnostic(`${count} assigned fixtures accepted by the real validators, with omitted DE01 counted separately.`);
});

test('mixed DE plus Desire retains one week-three review and the original Connection closure schema preserves historical validity',()=>{
 const h=harness(),c=h.makeContext('erection',21,{secondary:'desire',motives:['erection','desire']}),p=h.window.SPM_DAILY_PRACTICE.agenda(c);
 assert.equal(p.assignments[0].contentId,'erection:lesson:8');const support=p.assignments.filter(a=>a.role==='support');assert.equal(support.length,1);assert.equal(support[0].contentId,'confidence:content_day:21');assert.equal(support[0].optional,true);assert.equal(p.assignments.some(a=>a.kind==='desire'),false);
 const baseline=require('../docs/qa/spm-connection-contract-legacy.json');
 const current=Object.fromEntries(Object.entries(h.window.SPM_CONNECTION_CONTENT.activities).map(([day,a])=>[day,{fields:a.fields,maxTopics:a.max||null,topics:(a.topics||[]).map(x=>x.label)}]));
 assert.deepEqual(plain(current),baseline.days);
 const {validDailyRecord}=require('./helpers/valid-daily-record.cjs');
 for(const day of Object.keys(baseline.days).map(Number)){
  const item={kind:'connection',id:'conexion-satisfaccion',sourceDay:day,connectionDay:day},record=validDailyRecord(item,day);
  assert.equal(h.window.SPM_CONNECTION.complete(day,record),true);assert.equal(record.scheduleVersion,undefined);
 }
 const incomplete=validDailyRecord({kind:'connection',id:'conexion-satisfaccion',sourceDay:13,connectionDay:13},13);delete incomplete.answers.mode;
 assert.equal(h.window.SPM_CONNECTION.complete(13,incomplete),false,'mode was already a required source field, not introduced by the new selector');
});
