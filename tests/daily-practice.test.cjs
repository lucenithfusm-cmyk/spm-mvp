const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../labs/breathing/node_modules/jsdom');
const read=f=>fs.readFileSync(path.join(__dirname,'../premium-v2',f),'utf8');
const wait=()=>new Promise(r=>setTimeout(r,40));
function harness(primary='erection',day=12,initialRecords={}){
 const dom=new JSDOM('<section id="plan"><div id="dayGrid"></div><section id="original-library">Library</section></section>',{url:'https://spm.test',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.play=async function(){};w.HTMLMediaElement.prototype.load=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 const observers=[],NativeObserver=w.MutationObserver;
 w.MutationObserver=class extends NativeObserver{constructor(fn){super(fn);observers.push(this);}};
 const c={userId:'qa',planId:'plan',primary,day,secondary:'desire',motives:[primary,'desire'],safety:'none',flags:[],checkins:[],completed:[]},writes=[],opens=[];
 w.SPM_RESOURCE_CONTEXT=()=>c;w.SPM_DAILY_RECORDS={read:async()=>JSON.parse(JSON.stringify(initialRecords)),save:async(...args)=>writes.push(args)};
 w.SPM_ERECTILE_FUNCTION={open:(...args)=>opens.push(['erection',...args])};
 w.SPM_EJACULATORY_CONTROL={schedule:w.eval('('+read('ejaculatory-control.js').match(/const SCHEDULE=(\{[^;]+\});/)[1]+')'),open:(...args)=>opens.push(['ejaculation',...args])};
 for(const lab of ['DESIRE','SENSATE','BREATHING'])w['SPM_'+lab+'_LAB']={open:async o=>opens.push([lab,o])};
 w.SPM_PELVIC_LAB={openScheduled:async o=>opens.push(['PELVIC',o]),close:async()=>true};
 w.SPM_PELVIC_GUIDANCE={definition:intent=>({script:intent==='scheduled'?'Comprueba tu preparación para las contracciones.':'Reconoce, respira y suelta a tu ritmo.',audioSrc:`/test-pelvic-${intent}.mp3`}),firstPractice:()=>({script:'Respira a tu ritmo.',audioSrc:'/test-first-practice.mp3'})};
 w.SPM_RESOURCES={restricted:c=>c.safety!=='none',open:(...args)=>opens.push(['resource',...args])};
 for(const f of ['engine.js','modules.js','practice-audio-v1.js','checkpoint-audio-v1.js','nutrition-daily-cards-v1.js','sleep-library-v1.js','wellness-daily-tip-v1.js','daily-support-plan-v1.js','spm-video-library.js','spm-resources-content.js','erectile-library-v3.js','erection-daily-plan-v1.js','daily-resource-plan-v1.js','program-checkpoint-v1.js','daily-practice-v1.js']){if(f==='daily-practice-v1.js')w.SPM_DE_LIBRARY={days:()=>w.SPM_DE_LIBRARY_V3.days};w.eval(read(f));}
 return{w,c,writes,opens,close:()=>{observers.forEach(o=>o.disconnect());w.close();}};
}
test('all 28 days have concrete launchers; secondary Desire is never the main daily practice',async()=>{
 for(const route of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
  const h=harness(route);try{await wait();for(let day=1;day<=28;day++){
   h.c.day=day;const items=h.w.SPM_DAILY_PRACTICE.assignments();assert.ok(items.length>=2&&items.length<=9);assert.equal(items[0].id,'main');assert.equal(new Set(items.map(x=>x.id)).size,items.length);
   if(route==='erection')assert.equal(items[0].kind,day===6?'pelvic':'erection');if(route==='desire')assert.equal(items[0].kind,'desire');else if(route!=='erection')assert.notEqual(items[0].kind,'desire');
   assert.ok(items.every(x=>x.title&&x.summary));
  }}finally{h.close()}
 }
});
test('Today opens the real current session and keeps the library intact',async()=>{
 const h=harness();try{await wait();h.w.SPM_DAILY_PRACTICE.open();assert.equal(h.w.document.activeElement.id,'spmDailySession');h.w.document.querySelector('[data-daily-open="main"]').click();assert.equal(h.opens[0][0],'erection');assert.equal(h.opens[0][1],12);assert.equal(h.opens[0][2].origin,'dailyPlan');assert.equal(h.writes.length,0);
 h.w.SPM_DAILY_PRACTICE.library();assert.equal(h.w.document.querySelector('#plan').dataset.spmDailyView,'library');assert.ok(h.w.document.querySelector('#original-library'));assert.equal(h.c.day,12);
 }finally{h.close()}
});
test('Desire day one has one entry button and keeps audio and recording inside its practice',async()=>{
 const h=harness('desire',1);try{await wait();const card=h.w.document.querySelector('[data-activity="main"]');
 assert.equal(card.querySelectorAll('button').length,1);
 assert.equal(card.querySelector('[data-daily-open]').textContent,'Iniciar mi práctica de hoy');
 assert.equal(card.querySelector('[data-spm-speak]'),null);
 assert.equal(card.querySelector('[data-daily-confirm]'),null);
 assert.ok(h.w.document.querySelector('.is-nutrition [data-nutrition-library]'));
 card.querySelector('button').click();await wait();assert.equal(h.opens.at(-1)[0],'DESIRE');assert.equal(h.opens.at(-1)[1].origin,'dailyPlan');
 assert.equal(h.writes.length,0);assert.deepEqual(h.c.completed,[]);
 h.w.SPM_DAILY_PRACTICE.showContinuation();const resume=h.w.document.querySelector('[data-next-record]');assert.equal(resume.textContent,'Retomar mi práctica');resume.click();await wait();
 assert.equal(h.opens.at(-1)[0],'DESIRE');assert.equal(h.writes.length,0);assert.equal(h.w.document.querySelector('#spmDailyWorkspace form'),null);
 }finally{h.close()}
});
test('other Desire days retain their audio and route registration through the actual practice',async()=>{
 const h=harness('desire',2);try{await wait();const card=h.w.document.querySelector('[data-activity="main"]');
 assert.ok(card.querySelector('[data-spm-speak]'));card.querySelector('[data-daily-confirm]').click();await wait();
 assert.equal(h.opens.at(-1)[0],'DESIRE');assert.equal(h.writes.length,0);assert.equal(h.w.document.querySelector('#spmDailyWorkspace form'),null);
 }finally{h.close()}
});
test('saving one activity does not complete or advance the day; stale and restricted writes fail',async()=>{
 const h=harness();try{await wait();await h.w.SPM_DAILY_PRACTICE.saveActivity('main',{note:'example'});assert.equal(h.writes.length,1);assert.equal(h.c.day,12);assert.deepEqual(h.c.completed,[]);assert.equal(h.w.document.querySelector('#spmDailyComplete').disabled,true);
 await assert.rejects(h.w.SPM_DAILY_PRACTICE.saveActivity('main',{},'qa:old-plan',12));h.c.safety='review';h.c.day=8;await assert.rejects(h.w.SPM_DAILY_PRACTICE.saveActivity('main'));assert.equal(h.writes.length,1);
 }finally{h.close()}
});
test('shared breathing/focus replaces a duplicate text task and retains the scheduled session',async()=>{
 const h=harness('confidence',16);try{await wait();const items=h.w.SPM_DAILY_PRACTICE.assignments();assert.equal(items.filter(a=>!a.optional&&a.kind!=='video').length,1);assert.equal(items[0].kind,'sensate');h.w.document.querySelector('[data-daily-open="main"]').click();await wait();assert.equal(h.opens[0][0],'SENSATE');assert.equal(h.opens[0][1].day,16);}finally{h.close()}
});

test('wellness rotates over 28 days while the primary and scheduled supports stay separate',async()=>{
 const h=harness('ejaculation');try{await wait();const counts={nutrition:0,movement:0,sleep:0};
 for(let day=1;day<=28;day++){
  const items=h.w.SPM_DAILY_PRACTICE.assignments({...h.c,day}),well=items.filter(a=>a.kind==='wellness');
  assert.ok(well.length>=1&&well.length<=2);for(const a of well){assert.equal(a.optional,true);counts[a.tip.category]++;}
  if([1,14,28].includes(day))assert.ok(items.some(a=>a.kind==='program-checkpoint'));
 }
 assert.deepEqual(counts,{nutrition:10,movement:9,sleep:18});
 for(const [day,kind] of [[3,'pelvic'],[11,'recovery'],[13,'confidence'],[18,'worksheet'],[25,'recovery']]){
  assert.ok(h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary:'desire',day}).some(a=>a.kind===kind));
 }
 }finally{h.close()}
});
test('review flag allows day 14 educational review without clearing the flag or unlocking physical practice',async()=>{
 for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
 const h=harness(primary,14);try{await wait();h.c.safety='review';h.c.flags=['h_cv_event'];h.w.dispatchEvent(new h.w.Event('spm:resourcecontext'));
 assert.equal(h.w.SPM_DAILY_PRACTICE.restricted(h.c,'main'),false);
 await h.w.SPM_DAILY_PRACTICE.saveActivity('main',{confirmed:true});assert.equal(h.writes.length,1);
 assert.equal(h.c.safety,'review');assert.equal(h.c.day,14);
 h.c.day=6;assert.equal(h.w.SPM_DAILY_PRACTICE.restricted(h.c,'main'),true);
 await assert.rejects(h.w.SPM_DAILY_PRACTICE.saveActivity('main'));
 }finally{h.close()}}
});
test('urgent flags cannot be bypassed; blocked buttons explain the restriction and keep library access',async()=>{
 const h=harness('confidence',14);try{await wait();h.c.safety='urgent';h.c.flags=['s_cardiac'];h.w.dispatchEvent(new h.w.Event('spm:resourcecontext'));
 const button=h.w.document.querySelector('[data-daily-open="main"]');assert.equal(button.disabled,false);button.click();
 assert.ok(h.w.document.querySelector('#spmDailyWorkspace [data-daily-library]'));
 assert.match(h.w.document.querySelector('#spmDailyWorkspace').textContent,/dolor en el pecho/);
 await assert.rejects(h.w.SPM_DAILY_PRACTICE.saveActivity('main'));assert.equal(h.writes.length,0);
 h.c.safety='none';assert.equal(h.w.SPM_DAILY_PRACTICE.safety(h.c),'urgent');
 }finally{h.close()}
});
test('new check-in safety flags and unknown status retain the physical pause',async()=>{
 const h=harness('erection',8);try{await wait();h.c.checkins=[{new_safety_flag:true}];assert.equal(h.w.SPM_DAILY_PRACTICE.restricted(h.c,'main'),true);
 h.c.checkins=[];h.c.safety='unknown';assert.equal(h.w.SPM_DAILY_PRACTICE.restricted(h.c,'main'),true);
 assert.equal(h.w.SPM_DAILY_PRACTICE.restricted(null),true);
 }finally{h.close()}
});
test('weekly Lab appears only on days 3, 10, 17 and 24 in six domains',async()=>{
 const h=harness('confidence');try{await wait();
 for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle'])for(let day=1;day<=28;day++){
  const lab=h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary,day}).filter(a=>a.id==='pelvic-daily-lab');
  assert.equal(lab.length,[3,10,17,24].includes(day)?1:0);
  assert.ok(lab.every(a=>a.optional&&a.pelvicIntent==='daily-relax'));
 }
 }finally{h.close()}
});
test('all routes schedule short videos; mixed Desire support never replaces the primary session',async()=>{
 const h=harness('desire');try{await wait();
 for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle','anxiety','optimization','mixed']){
  const days=Array.from({length:28},(_,i)=>h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary,day:i+1}));
  assert.deepEqual(days.flatMap((items,i)=>items.some(a=>a.kind==='video')?[i+1]:[]),['erection','desire','wellbeing','lifestyle','optimization'].includes(primary)?[1,2,3,7,9,10,14,16,18,21,23,28]:[1,3,7,10,14,16,18,21,23,28]);
  assert.ok(days.flat().filter(a=>a.kind==='video').every(a=>h.w.SPM_VIDEO_LIBRARY.some(v=>v.key===a.videoKey)));
  for(const day of [5,15,22]){
   const c={...h.c,primary,day},items=h.w.SPM_DAILY_PRACTICE.assignments(c);
   assert.equal(items.filter(a=>a.kind==='desire').length,1);
   if(!['erection','desire'].includes(primary)){
    assert.notEqual(items[0].kind,'desire');
    assert.equal(h.w.SPM_DAILY_PRACTICE.assignments({...c,secondary:null,motives:[primary]}).some(a=>a.kind==='desire'),false);
   }
  }
  assert.ok(days[10].some(a=>a.kind==='recovery'));
  assert.ok(days[24].some(a=>a.kind==='recovery'));
 }
 }finally{h.close()}
});

test('all seven recovery stories and the approved weekly frequencies are real assignments',async()=>{
 const h=harness();try{await wait();const routes={};
 for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
  const rows=Array.from({length:28},(_,i)=>({day:i+1,base:h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary,day:i+1,secondary:null,motives:[primary]}),withDesire:h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary,day:i+1})}));routes[primary]=rows;
  const stories=rows.flatMap(r=>r.base.filter(a=>a.kind==='recovery'));
  assert.equal(stories.length,7);assert.equal(new Set(stories.map(a=>a.scenario)).size,7);
  assert.ok(stories.every(a=>h.w.SPM_RESOURCE_CONTENT.scenarios.some(s=>s.id===a.scenario&&a.title.includes(s.title.es))));
  if(['erection','ejaculation'].includes(primary))for(let week=0;week<4;week++){
   const days=rows.slice(week*7,week*7+7);assert.equal(days.filter(r=>r.base.some(a=>a.kind==='pelvic'&&a.pelvicIntent==='scheduled')).length,2);
   if(primary==='ejaculation'){assert.equal(days.filter(r=>r.base.some(a=>a.kind==='ejaculation')).length,3);assert.ok(days.every(r=>!r.base.some(a=>a.kind==='pelvic'&&a.pelvicIntent==='scheduled')||!r.base.some(a=>a.kind==='ejaculation')));}
  }
 }
 if(process.env.SPM_CALENDAR_EXPORT)fs.writeFileSync(process.env.SPM_CALENDAR_EXPORT,JSON.stringify(routes,null,2));
 }finally{h.close()}
});
test('recovery completion retains the assigned scenario for day-specific tracking',async()=>{
 const h=harness('ejaculation',11);try{await wait();const a=h.w.SPM_DAILY_PRACTICE.assignments().find(a=>a.kind==='recovery');await h.w.SPM_DAILY_PRACTICE.saveActivity(a.id,{confirmed:true});assert.equal(h.writes[0][1].scenario,'early');}finally{h.close()}
});

test('erection Desire is twice weekly, or daily for expressed low Desire, without changing shared cadence',async()=>{
 const h=harness();try{await wait();
 for(const profile of [{secondary:null,motives:['erection'],answers:{}},{secondary:'desire',motives:['erection'],answers:{}},{secondary:null,motives:['erection','desire'],answers:{}},{secondary:null,motives:['erection'],answers:{d_desire:2}},{secondary:null,motives:['erection'],answers:{h_medeffect:'desire'}}]){
 const rows=Array.from({length:28},(_,i)=>h.w.SPM_DAILY_PRACTICE.assignments({...h.c,...profile,day:i+1}));
 const high=profile.secondary==='desire'||profile.motives.includes('desire')||profile.answers.d_desire===2||profile.answers.h_medeffect==='desire';
 assert.deepEqual(rows.flatMap((a,i)=>a.some(x=>x.kind==='desire')?[i+1]:[]),high?Array.from({length:28},(_,i)=>i+1):[2,5,10,12,15,17,22,26]);
 for(let w=0;w<4;w++)assert.equal(rows.slice(w*7,w*7+7).filter(a=>a.some(x=>x.kind==='desire')).length,high?7:2);
 assert.ok(rows.every(a=>a.length<=9));
 assert.deepEqual(rows.flatMap((a,i)=>a.some(x=>x.id==='de-confidence-'+(i+1))?[i+1]:[]),[7,14,21,28]);
 }
 }finally{h.close()}
});

test('safety next steps expose only permitted activities without changing flags or day',async()=>{
 for(const level of ['review','urgent']){
  const h=harness('lifestyle',15);try{
   h.c.safety=level;h.c.flags=['review-test'];await wait();h.w.SPM_DAILY_PRACTICE.open();
   h.w.document.querySelector('[data-daily-safety-next]').click();
   const panel=h.w.document.querySelector('[data-safety-next]');assert.ok(panel);
   const ids=[...panel.querySelectorAll('[data-safe-activity]')].map(b=>b.dataset.safeActivity);
   assert.ok(ids.every(id=>!h.w.SPM_DAILY_PRACTICE.restricted(h.c,id)));if(level==='urgent')assert.equal(ids.length,0);
   assert.equal(h.c.day,15);assert.equal(h.c.safety,level);assert.deepEqual(h.c.flags,['review-test']);assert.equal(h.writes.length,0);
   panel.querySelector('[data-safety-return]').click();assert.equal(h.w.document.querySelector('[data-safety-next]'),null);
  }finally{h.close()}
 }
});

test('refreshing after a requirement reloads saved state without erasing a clinical flag',async()=>{
 const h=harness('erection',15);try{await wait();h.c.safety='review';h.c.flags=['s_penile'];
 let calls=0;h.w.SPM_PROGRAM_REPAIR={refresh:async scope=>{assert.equal(scope,'qa:plan');calls++;}};
 h.w.SPM_DAILY_PRACTICE.open();h.w.document.querySelector('[data-daily-safety-next]').click();
 h.w.document.querySelector('[data-safety-refresh]').click();await wait();
 assert.equal(calls,1);assert.equal(h.c.day,15);assert.deepEqual(h.c.flags,['s_penile']);assert.equal(h.writes.length,0);
 assert.match(h.w.document.querySelector('#spmDailyStatus').textContent,/señal de seguridad sigue registrada/);
 }finally{h.close();}
});

 test('all 18 sleep cards and both movement alternatives are assigned in every domain',()=>{const h=harness();try{
 for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
 const all=Array.from({length:28},(_,i)=>h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary,day:i+1})).flat();
 const sleep=all.filter(a=>a.tip?.category==='sleep');assert.equal(new Set(sleep.map(a=>a.tip.sleepTipId)).size,18);
 assert.deepEqual(sleep.map(a=>a.tip.sleepTipId).sort(),Array.from(h.w.SPM_SLEEP_LIBRARY_V1.tips,t=>t.id).sort());
 assert.ok(all.some(a=>a.tip?.movementId==='swim'));assert.ok(all.some(a=>a.tip?.movementId==='dance'));
 assert.equal(all.filter(a=>a.tip?.category==='nutrition').length,10);assert.ok(all.filter(a=>a.tip?.category==='nutrition').every(a=>a.tip.steps.length===3));
 assert.equal(all.filter(a=>a.kind==='program-checkpoint').length,16);assert.ok(all.filter(a=>a.kind==='program-checkpoint').every(a=>a.optional));
 }
 }finally{h.close();}});
 test('maintenance difficulty never increases contraction frequency beyond two conditional sessions weekly',()=>{const h=harness();try{
 for(const answers of [{e_maint:1,pf_awareness:'unsure',pf_tension:1},{e_maint:2,pf_awareness:'good_control',pf_tension:1}]){
 for(let week=0;week<4;week++){const sessions=Array.from({length:7},(_,i)=>h.w.SPM_DAILY_PRACTICE.assignments({...h.c,day:week*7+i+1,answers})).flat().filter(a=>a.kind==='pelvic');assert.equal(sessions.filter(a=>a.pelvicIntent==='scheduled').length,2);assert.equal(sessions.filter(a=>a.id==='pelvic-daily-lab').length,1);assert.ok(sessions.every(a=>a.optional));}
 }
 assert.equal(h.w.SPM_DAILY_RESOURCES.pelvicDays({...h.c,answers:{e_maint:1,pf_awareness:'hard_to_relax',pf_tension:5}}).length,8);
 }finally{h.close();}});
 test('checkpoint cannot be marked complete without its actual answers',async()=>{const h=harness('wellbeing',14);try{await wait();await assert.rejects(h.w.SPM_DAILY_PRACTICE.saveActivity('program-checkpoint',{confirmed:true}));assert.equal(h.writes.length,0);
 const record={checkpointVersion:1,metrics:Object.fromEntries(Array.from(h.w.SPM_PROGRAM_CHECKPOINT.metrics,([key])=>[key,null])),reflection:'No evaluable',continuity:'Continuar con comodidad'};
 await h.w.SPM_DAILY_PRACTICE.saveActivity('program-checkpoint',record);assert.equal(h.writes.length,1);assert.equal(h.c.day,14);
 const current={...record,checkpointVersion:2,scaleMax:4,milestone:14,submittedDay:14,metrics:{...record.metrics,confidence:4}};
 await h.w.SPM_DAILY_PRACTICE.saveActivity('program-checkpoint',current);assert.equal(h.writes.length,2);assert.equal(h.writes[1][1].checkpointVersion,2);assert.equal(h.writes[1][1].metrics.confidence,4);
 await assert.rejects(h.w.SPM_DAILY_PRACTICE.saveActivity('program-checkpoint',{...current,metrics:{...current.metrics,confidence:5}}));assert.equal(h.writes.length,2);assert.deepEqual(h.c.completed,[]);
 }finally{h.close();}});

test('checkpoint entry has one action and no summary text, speaker or shortcut registration',async()=>{
 for(const day of [1,14,28]){
  const h=harness('desire',day);try{await wait();const card=h.w.document.querySelector('[data-activity="program-checkpoint"]');
   assert.ok(card);assert.equal(card.querySelector('[data-spm-speak],.spm-audio-action'),null);assert.equal(card.querySelector('[data-daily-confirm]'),null);
   assert.equal(card.querySelector('p'),null);assert.equal(card.querySelectorAll('button').length,1);assert.ok(card.querySelector('[data-daily-open="program-checkpoint"]'));
   assert.equal(h.writes.length,0);assert.deepEqual(h.c.completed,[]);
  }finally{h.close();}
 }
});

 test('missing followups do not prevent completion or final report in any domain',async()=>{const h=harness();try{await wait();for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle'])for(const day of [14,28]){const items=h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary,day});assert.equal(items[0].optional,true);assert.ok(items.filter(a=>a.kind==='program-checkpoint'||a.kind==='ep-checkpoint').every(a=>a.optional));assert.ok(items.some(a=>!a.optional));}}finally{h.close();}});
test('continuation uses actual pending assignments in all six routes and excludes completed tasks',async()=>{
 for(const route of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
  const h=harness(route,1);try{await wait();h.w.SPM_DAILY_PRACTICE.open();await h.w.SPM_DAILY_PRACTICE.launch('main');await h.w.SPM_DAILY_PRACTICE.saveActivity('main',{confirmed:true});
  const items=h.w.SPM_DAILY_PRACTICE.nextActivities();assert(!items.some(a=>a.id==='main'));
  const panel=h.w.document.querySelector('#spmDailyWorkspace [data-spm-next]');assert(panel);
  for(const a of items){
   assert(panel.querySelector(`[data-next-id="${a.id}"]`),`${route}: ${a.id} is actionable`);
   if(a.kind==='wellness'&&['sleep','nutrition'].includes(a.tip.category)){
    const card=panel.querySelector(`[data-activity="${a.id}"]`);assert(card);
    const title=a.tip.category==='sleep'?h.w.SPM_SLEEP_LIBRARY_V1.tips.find(t=>t.id===a.tip.sleepTipId).title:a.tip.title;
    assert(card.textContent.includes(title),`${route}: the assigned original card is shown`);
   }else assert(panel.textContent.includes(a.title));
  }
  assert(!panel.querySelector('[data-next-id="main"]'));
  assert.equal(h.w.document.querySelector('#spmDailySession').dataset.continuation,'true');assert.equal(h.c.day,1);
  }finally{h.close();}
 }
});
test('every route has a concrete closing advice for each day, with an individual alternative',async()=>{
 const h=harness();try{await wait();for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle'])for(let day=1;day<=28;day++){
 const a=h.w.SPM_DAILY_PRACTICE.closingAdvice({...h.c,primary,day});assert.equal(a.title,'Llévalo a tu vida diaria');assert(a.text.length>35);assert(a.individual.length>20);
 }}finally{h.close();}
});
test('finishing a day presents that day closing advice even when the calendar advances',async()=>{
 const h=harness('desire',1);try{await wait();h.w.SPM_DAILY_PRACTICE.open();await h.w.SPM_DAILY_PRACTICE.launch('main');
 for(const a of h.w.SPM_DAILY_PRACTICE.assignments().filter(a=>!a.optional))await h.w.SPM_DAILY_PRACTICE.saveActivity(a.id,{confirmed:true});
 h.w.SPM_COMPLETE_DAILY_PRACTICE=async()=>{h.c.completed=[1];h.c.day=2;};
 await h.w.document.querySelector('#spmDailyComplete').onclick();
 const advice=h.w.document.querySelector('#spmDailyClosing');assert(advice);assert(advice.textContent.includes('DÍA 1'));assert(advice.textContent.includes('¿Qué te haría sentir a gusto hoy?'));assert.equal(h.c.day,2);
 }finally{h.close();}
});

for(const [kind,day] of [['breathing',3],['sensate',4]])for(const completed of [false,true])test(`${kind} keeps continuation outside its iframe dialog when the assignment is ${completed?'completed':'pending'}`,async()=>{
 const h=harness('desire',day);try{
  await wait();const api=h.w.SPM_DAILY_PRACTICE,d=h.w.document;api.open();
  const activity=api.assignments().find(a=>a.kind===kind);assert.ok(activity);
  let modal;
  h.w['SPM_'+kind.toUpperCase()+'_LAB'].open=async()=>{
   modal=d.createElement('dialog');modal.className=`spm-${kind}-modal`;
   modal.innerHTML='<header>Actividad actual</header><main><iframe title="Práctica asignada"></iframe></main>';
   d.body.append(modal);modal.showModal();return true;
  };
  if(completed)await api.saveActivity(activity.id,{confirmed:true});
  const writesBefore=h.writes.length;
  await api.launch(activity.id);await wait();
  assert.ok(modal.open);assert.ok(modal.querySelector('main > iframe'));
  assert.equal(modal.querySelector('[data-spm-next]'),null,'Opening an iframe must not append a competing continuation panel');
  modal.classList.add('qa-refresh');await wait();
  assert.equal(modal.querySelector('[data-spm-next]'),null,'The global mutation observer must not reinsert the panel');
  assert.equal(api.nextActivities().some(a=>a.id===activity.id),!completed);
  assert.equal(h.writes.length,writesBefore);assert.equal(h.c.day,day);assert.deepEqual(h.c.completed,[]);
  if(!completed){
   modal.close();modal.remove();api.showContinuation();await wait();
   const panel=d.querySelector('#spmDailyWorkspace [data-spm-next]');assert.ok(panel);
   assert.ok(panel.textContent.includes(activity.title));assert.match(panel.textContent,/sigue pendiente/);
   assert.ok(panel.querySelector('[data-next-record]'));
   assert.ok(api.nextActivities().some(a=>a.id===activity.id),'Returning without saveActivity must leave the assignment pending');
   assert.equal(h.writes.length,0);assert.equal(h.c.day,day);assert.deepEqual(h.c.completed,[]);
  }
 }finally{h.close();}
});

test('a finished EP modal shows a working next-activity button and closes through its own lifecycle',async()=>{
 const h=harness('ejaculation',1);try{await wait();h.w.SPM_DAILY_PRACTICE.open();h.w.SPM_EJACULATORY_CONTROL.open=()=>{
 const m=h.w.document.createElement('div');m.id='spmEcModal';m.className='on';m.innerHTML='<button class="ecClose">Cerrar</button>';m.querySelector('button').onclick=()=>m.classList.remove('on');h.w.document.body.append(m);};
 await h.w.SPM_DAILY_PRACTICE.launch('main');await h.w.SPM_DAILY_PRACTICE.saveActivity('main',{confirmed:true});
 const modal=h.w.document.querySelector('#spmEcModal');const button=modal.querySelector('[data-next-id]');assert(button);const id=button.dataset.nextId;button.click();await wait();assert(!modal.classList.contains('on'));assert.equal(h.w.SPM_DAILY_PRACTICE.active().id,id);
 }finally{h.close();}
});

test('day 3 sleep audio keeps only the introduction in Today and its card without changing written steps',async()=>{
 const h=harness('desire',3);try{
  await wait();h.w.SPM_DAILY_PRACTICE.open();const d=h.w.document,library=h.w.SPM_SLEEP_LIBRARY_V1,spoken=[];
  h.w.SpeechSynthesisUtterance=function(text){this.text=text};
  h.w.speechSynthesis={getVoices:()=>[],cancel(){},speak:utterance=>spoken.push(utterance.text)};
  const tip=library.tips.find(t=>t.id==='sl-horario-02'),intro='Si quieres acostarte antes, haz cambios pequeños que puedas sostener. No hay una hora exacta que sirva para todos.';
  assert.equal(tip.body,intro);
  assert.equal(tip.action,'Si quieres acostarte antes, elige para esta noche una hora un poco más temprana que te resulte cómoda.');
  assert.deepEqual(Array.from(tip.steps),[tip.action,'Organiza tus pendientes para poder acostarte a esa hora.']);
  assert.equal(h.w.SPM_DAILY_PRACTICE.assignments().find(a=>a.id==='wellness-sleep').tip.body,`${intro} ${tip.action}`);
  const dailyButton=d.querySelector('.is-sleep [data-spm-speak]');assert(dailyButton);dailyButton.click();
  assert.equal(spoken.at(-1),intro);
  await h.w.SPM_DAILY_PRACTICE.launch('wellness-sleep');
  const detailButton=d.querySelector('.slModal [data-spm-speak]');assert(detailButton);detailButton.click();
  assert.equal(spoken.at(-1),`${tip.title}. ${intro}`);
  assert.deepEqual(Array.from(d.querySelectorAll('.slModal .slSteps li'),li=>li.textContent),Array.from(tip.steps));
  d.querySelector('[data-sl-library]').click();d.querySelector('[data-sl-cat="horario"]').click();
  const libraryButton=d.querySelector('[data-sl-tip="sl-horario-02"]').parentElement.querySelector('[data-spm-speak]');assert(libraryButton);libraryButton.click();
  assert.deepEqual(spoken,[intro,`${tip.title}. ${intro}`,`${tip.title}. ${intro}`]);
  for(const other of library.tips.filter(t=>t.id!==tip.id)){
   assert.equal(library.dailyAudio(other.id),`${other.body} ${other.action}`);
   assert.equal(library.audio(other),`${other.title}. ${other.body} ${other.steps.map((s,i)=>`Paso ${i+1}. ${s}`).join(' ')}`);
  }
 }finally{h.close();}
});

test('Today shows the existing sleep design and practical nutrition with its library link',async()=>{
 const h=harness('desire',1);try{
  await wait();h.w.SPM_DAILY_PRACTICE.open();const d=h.w.document;
  assert(d.querySelector('.is-sleep .slTip'));assert(d.querySelector('.is-nutrition img'));assert(d.querySelector('[data-nutrition-library]'));
  d.querySelector('[data-nutrition-library]').click();assert.equal(h.opens.at(-1)[1],'nutrition');
  await h.w.SPM_DAILY_PRACTICE.launch('wellness-nutrition');assert.equal(d.querySelectorAll('.spm-food-steps li').length,3);assert(d.querySelector('[data-wellness-library]'));assert(d.querySelector('[data-wellness-session] [data-spm-speak]'));assert(!d.querySelector('[data-wellness-next]'));
  d.querySelector('[data-wellness-return]').click();assert.equal(d.querySelector('#spmDailyWorkspace').children.length,0);
  await h.w.SPM_DAILY_PRACTICE.launch('wellness-sleep');assert.equal(d.querySelectorAll('.slModal .slTip').length,1);assert.equal(d.querySelector('.slModal .slTipCopy b').textContent,h.w.SPM_SLEEP_LIBRARY_V1.tips[0].title);assert(d.querySelector('.slModal [data-spm-speak]'));
  d.querySelector('[data-sl-done]').click();await wait();assert.equal(h.writes.at(-1)[0],'wellness-sleep');assert.equal(h.writes.at(-1)[1].tipId,'slp.sl-horario-01');assert.equal(d.querySelector('.slModal'),null);assert(d.querySelector('[data-spm-next] .spm-food-card'));assert(d.querySelector('[data-spm-next] [data-nutrition-library]'));
 }finally{h.close();}
});

test('all six routes receive a weekly Lab and separate strength when indicated',()=>{
 const h=harness();try{for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle'])for(let day=1;day<=28;day++){
  const items=h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary,day});
  const lab=items.filter(a=>a.id==='pelvic-daily-lab'),strength=items.filter(a=>a.kind==='pelvic'&&a.pelvicIntent==='scheduled');
  assert.equal(lab.length,[3,10,17,24].includes(day)?1:0);
  assert.ok(lab.every(a=>a.optional&&a.pelvicIntent==='daily-relax'&&a.pelvicPreference==='lab'));
  assert.equal(strength.length,['erection','ejaculation'].includes(primary)&&[2,6].includes((day-1)%7+1)?1:0);
  assert.ok(strength.every(a=>a.optional&&a.pelvicPreference==='classic'));
 }}finally{h.close();}
});
test('weekly Lab has a single entry and its narration plays only inside the practice',async()=>{
 const h=harness('erection',3);try{await wait();const d=h.w.document,api=h.w.SPM_DAILY_PRACTICE;api.open();
  const card=d.querySelector('[data-activity="pelvic-daily-lab"]');assert.ok(card);assert.equal(card.querySelector('[data-daily-confirm]'),null);
  assert.equal(card.querySelector('[data-spm-speak],audio,[data-checkpoint-audio-toggle]'),null);
  assert.equal(card.querySelector('[data-daily-open]').textContent,'Empezar práctica guiada');
  await api.launch('pelvic-daily-lab');const opts=h.opens.at(-1)[1];
  assert.equal(opts.intent,'daily-relax');assert.equal(opts.activityId,'pelvic-daily-lab');assert.equal(opts.day,3);
  assert.equal(h.writes.length,0);opts.onClose();assert.equal(d.querySelector('[data-pelvic-confirm]'),null);
  assert.ok(api.nextActivities().some(a=>a.id==='pelvic-daily-lab'));
 }finally{h.close();}
});

test('another activity can supply its recorded guide without a second generic speech button',async()=>{
 const h=harness('erection',2);try{await wait();const original=h.w.SPM_DAILY_SUPPORT.assignments;
  h.w.SPM_DAILY_SUPPORT.assignments=(day,c)=>original(day,c).map(a=>a.lab==='breathing'?{...a,guide:{script:'Guía breve de respiración.',audioSrc:'/breathing-guide.mp3'}}:a);
  h.c.day=3;h.w.dispatchEvent(new h.w.Event('spm:resourcecontext'));await wait();const card=h.w.document.querySelector('[data-activity="breath-learn"]');assert.ok(card);assert.equal(card.querySelector('audio').getAttribute('src'),'/breathing-guide.mp3');assert.equal(card.querySelector('[data-spm-speak]'),null);assert.equal(card.querySelector('details').open,false);assert.equal(h.writes.length,0);
 }finally{h.close();}
});

const labResult=(day=3,extra={})=>({practiceId:'percibe',completed:true,cleanContraction:null,fullRelease:true,discomfort:false,postTension:false,recommendation:'repeat',at:new Date().toISOString(),origin:'dailyPlan',day,activityId:'pelvic-daily-lab',intent:'daily-relax',...extra});
test('fresh Lab completion needs explicit confirmation, survives a failed save, and counts only the Lab',async()=>{
 const h=harness('erection',3);try{await wait();const api=h.w.SPM_DAILY_PRACTICE,d=h.w.document;api.open();
  await assert.rejects(api.saveActivity('pelvic-daily-lab',{confirmed:true}));await api.launch('pelvic-daily-lab');const opts=h.opens.at(-1)[1];
  for(const extra of [{day:1},{activityId:'support-pelvic'},{intent:'scheduled'},{practiceId:'contrae'},{completed:false},{at:'2026-01-01T00:00:00Z'}])assert.equal(opts.onResult(labResult(3,extra)),false);
  const result=labResult();assert.equal(opts.onResult(result),true);assert.equal(h.writes.length,0);opts.onClose();const form=d.querySelector('[data-pelvic-confirm]');assert.ok(form);
  await form.onsubmit({preventDefault(){}});assert.equal(h.writes.length,0);form.querySelector('input').checked=true;
  h.w.SPM_DAILY_RECORDS.save=async()=>{throw Error('offline')};await form.onsubmit({preventDefault(){}});assert.equal(d.querySelector('[data-pelvic-confirm]'),form);assert.match(form.querySelector('[role=status]').textContent,/No se pudo guardar/);assert.equal(form.querySelector('button').disabled,false);assert.equal(h.c.day,3);
  h.w.SPM_DAILY_RECORDS.save=async(...args)=>h.writes.push(args);await form.onsubmit({preventDefault(){}});assert.equal(h.writes.length,1);assert.equal(h.writes[0][0],'pelvic-daily-lab');assert.equal(h.writes[0][2],'qa:plan');assert.equal(h.writes[0][3],3);assert.equal(h.writes[0][1].pelvicResult.practiceId,'percibe');assert.equal(h.c.day,3);assert.deepEqual(h.c.completed,[]);
  assert.ok(api.nextActivities().some(a=>a.id==='main'));assert.ok(api.nextActivities().some(a=>a.id==='main'));assert.equal(api.nextActivities().some(a=>a.id==='pelvic-daily-lab'),false);
 }finally{h.close();}
});

test('classic strength needs its own fresh result and never completes the daily awareness Lab',async()=>{
 const h=harness('erection',2);try{await wait();const api=h.w.SPM_DAILY_PRACTICE;api.open();await api.launch('support-pelvic');const opts=h.opens.at(-1)[1];assert.equal(opts.intent,'scheduled');assert.equal(opts.preference,'classic');
  assert.equal(opts.onResult(labResult(2,{activityId:'support-pelvic',intent:'scheduled'})),false);
  const result={source:'pelvic-classic-v2',completed:true,at:new Date().toISOString(),day:2,activityId:'support-pelvic',intent:'scheduled'};assert.equal(opts.onResult(result),true);assert.equal(h.writes.length,0);opts.onClose();const form=h.w.document.querySelector('[data-pelvic-confirm]');assert.ok(form);form.querySelector('input').checked=true;await form.onsubmit({preventDefault(){}});
  assert.equal(h.writes.length,1);assert.equal(h.writes[0][0],'support-pelvic');assert.equal(api.nextActivities().some(a=>a.id==='pelvic-daily-lab'),false);assert.equal(h.c.day,2);assert.deepEqual(h.c.completed,[]);
 }finally{h.close();}
});

test('changed day, account or safety state invalidates weekly Lab results',async()=>{
 const h=harness('desire',3);try{await wait();const api=h.w.SPM_DAILY_PRACTICE;api.open();await api.launch('pelvic-daily-lab');
 const old=h.opens.at(-1)[1],result=labResult(3);
 h.c.day=10;h.w.dispatchEvent(new h.w.Event('spm:resourcecontext'));await wait();
 assert.equal(old.onResult(result),false);old.onClose();assert.equal(h.w.document.querySelector('[data-pelvic-confirm]'),null);
 await assert.rejects(api.saveActivity('pelvic-daily-lab',{confirmed:true,pelvicResult:result}));
 await api.launch('pelvic-daily-lab');const other=h.opens.at(-1)[1];h.c.planId='other';assert.equal(other.onResult(labResult(10)),false);
 h.c.planId='plan';h.c.safety='review';h.w.dispatchEvent(new h.w.Event('spm:resourcecontext'));await wait();
 await api.launch('pelvic-daily-lab');const educational=h.opens.at(-1)[1];
 assert.equal(educational.intent,'daily-relax');assert.equal(educational.onResult(labResult(10)),false);
 await assert.rejects(api.saveActivity('pelvic-daily-lab',{confirmed:true}));assert.equal(h.writes.length,0);
 }finally{h.close();}
});

test('real Lab bridge hands a fresh result to Today only after its state save and close',async()=>{
 const h=harness('erection',3),labWrites=[];try{await wait();delete h.w.SPM_PELVIC_LAB;
  h.w.SPM_PELVIC_RECORDS={read:async()=>({}),save:async(...args)=>labWrites.push(args)};h.w.eval(read('pelvic-lab-bridge-v1.js'));
  const api=h.w.SPM_DAILY_PRACTICE;api.open();await api.launch('pelvic-daily-lab');const host=h.w.SPM_PELVIC_LAB_HOST;assert.equal(host.getContext().intent,'daily-relax');assert.equal(host.getContext().activityId,'pelvic-daily-lab');
  const result=labResult();assert.equal(host.write('pf-results',[result]),true);assert.equal(host.write('pf-daily-result',result),true);assert.equal(host.onResult(result),true);assert.equal(h.writes.length,0);
  h.w.SPM_PELVIC_RECORDS.save=async()=>{throw Error('offline')};assert.equal(await host.close(),false);assert.ok(h.w.document.querySelector('iframe'));assert.equal(h.w.document.querySelector('[data-pelvic-confirm]'),null);
  h.w.SPM_PELVIC_RECORDS.save=async(...args)=>labWrites.push(args);assert.equal(await host.close(),true);assert.equal(labWrites.length,1);assert.equal(labWrites[0][1],'qa:plan');assert.equal(labWrites[0][2],3);assert.equal(h.writes.length,0);
  const form=h.w.document.querySelector('[data-pelvic-confirm]');assert.ok(form);form.querySelector('input').checked=true;await form.onsubmit({preventDefault(){}});assert.equal(h.writes.length,1);assert.equal(h.writes[0][0],'pelvic-daily-lab');assert.equal(h.c.day,3);assert.deepEqual(h.c.completed,[]);assert.ok(api.nextActivities().some(a=>a.id==='main'));
 }finally{await h.w.SPM_PELVIC_LAB?.close?.();h.close();}
});

test('historical day-six Lab records never appear as the newly separated strength activity',async()=>{
 const original={completed:true,activityKind:'pelvic',confirmed:true};
 const cases=[original,{...original,pelvicResult:labResult(6,{activityId:'main'})},{...original,pelvicResult:{source:'pelvic-classic-v2',completed:true,at:'2026-11-01T00:00:00Z',day:5,activityId:'main',intent:'scheduled'}},{...original,pelvicResult:{source:'pelvic-classic-v2',completed:true,at:'2026-11-01T00:00:00Z',day:6,activityId:'support-pelvic',intent:'scheduled'}}];
 for(const prior of cases){const snapshot=JSON.stringify(prior),h=harness('erection',6,{main:prior});try{h.c.completed=[6];await wait();h.w.SPM_DAILY_PRACTICE.open();
  const card=h.w.document.querySelector('[data-activity="main"]');assert.equal(card.querySelector('.spm-daily-saved'),null);assert.ok(h.w.SPM_DAILY_PRACTICE.nextActivities().some(a=>a.id==='main'));assert.equal(h.writes.length,0);assert.equal(JSON.stringify(prior),snapshot);assert.deepEqual(h.c.completed,[6]);
 }finally{h.close();}}
});

test('a persisted matching classic result is recognized after reopening without rewriting history',async()=>{
 const prior={completed:true,activityKind:'pelvic',confirmed:true,pelvicResult:{source:'pelvic-classic-v2',completed:true,at:'2026-11-01T00:00:00Z',day:6,activityId:'main',intent:'scheduled'}},h=harness('erection',6,{main:prior});try{await wait();h.w.SPM_DAILY_PRACTICE.open();
  assert.ok(h.w.document.querySelector('[data-activity="main"] .spm-daily-saved'));assert.equal(h.w.SPM_DAILY_PRACTICE.nextActivities().some(a=>a.id==='main'),false);assert.equal(h.w.SPM_DAILY_PRACTICE.nextActivities().some(a=>a.id==='pelvic-daily-lab'),false);assert.equal(h.writes.length,0);assert.deepEqual(h.c.completed,[]);
  h.w.SPM_DAILY_PRACTICE.library();h.w.SPM_DAILY_PRACTICE.open();assert.ok(h.w.document.querySelector('[data-activity="main"] .spm-daily-saved'));assert.equal(h.writes.length,0);
 }finally{h.close();}
});
