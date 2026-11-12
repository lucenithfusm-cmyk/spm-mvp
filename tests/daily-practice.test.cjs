const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../labs/breathing/node_modules/jsdom');
const read=f=>fs.readFileSync(path.join(__dirname,'../premium-v2',f),'utf8');
const wait=()=>new Promise(r=>setTimeout(r,40));
function harness(primary='erection',day=12){
 const dom=new JSDOM('<section id="plan"><div id="dayGrid"></div><section id="original-library">Library</section></section>',{url:'https://spm.test',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLMediaElement.prototype.pause=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 const observers=[],NativeObserver=w.MutationObserver;
 w.MutationObserver=class extends NativeObserver{constructor(fn){super(fn);observers.push(this);}};
 const c={userId:'qa',planId:'plan',primary,day,secondary:'desire',motives:[primary,'desire'],safety:'none',flags:[],checkins:[],completed:[]},writes=[],opens=[];
 w.SPM_RESOURCE_CONTEXT=()=>c;w.SPM_DAILY_RECORDS={read:async()=>({}),save:async(...args)=>writes.push(args)};
 w.SPM_ERECTILE_FUNCTION={open:(...args)=>opens.push(['erection',...args])};
 w.SPM_EJACULATORY_CONTROL={schedule:w.eval('('+read('ejaculatory-control.js').match(/const SCHEDULE=(\{[^;]+\});/)[1]+')'),open:(...args)=>opens.push(['ejaculation',...args])};
 for(const lab of ['DESIRE','SENSATE','BREATHING'])w['SPM_'+lab+'_LAB']={open:async o=>opens.push([lab,o])};
 w.SPM_RESOURCES={restricted:c=>c.safety!=='none',open:(...args)=>opens.push(['resource',...args])};
 for(const f of ['engine.js','modules.js','practice-audio-v1.js','nutrition-daily-cards-v1.js','sleep-library-v1.js','wellness-daily-tip-v1.js','daily-support-plan-v1.js','spm-video-library.js','spm-resources-content.js','erectile-library-v3.js','erection-daily-plan-v1.js','daily-resource-plan-v1.js','program-checkpoint-v1.js','daily-practice-v1.js']){if(f==='daily-practice-v1.js')w.SPM_DE_LIBRARY={days:()=>w.SPM_DE_LIBRARY_V3.days};w.eval(read(f));}
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
 for(const [day,kind] of [[6,'pelvic'],[11,'recovery'],[13,'confidence'],[18,'worksheet'],[25,'recovery']]){
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
test('secondary routes keep their conditional pelvic sessions; EF and EP use a twice-weekly calendar',async()=>{
 const h=harness('confidence');try{await wait();
 for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle'])for(const day of [12,19,24]){
  const pelvic=h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary,day}).filter(a=>a.kind==='pelvic');
  assert.equal(pelvic.length,['erection','ejaculation'].includes(primary)?0:1);assert.ok(pelvic.every(a=>a.optional));
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
   const days=rows.slice(week*7,week*7+7);assert.equal(days.filter(r=>r.base.some(a=>a.kind==='pelvic')).length,2);
   if(primary==='ejaculation'){assert.equal(days.filter(r=>r.base.some(a=>a.kind==='ejaculation')).length,3);assert.ok(days.every(r=>!r.base.some(a=>a.kind==='pelvic')||!r.base.some(a=>a.kind==='ejaculation')));}
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
 test('maintenance difficulty selects 3 pelvic sessions weekly and indicated sessions are required',()=>{const h=harness();try{
 for(const answers of [{e_maint:1,pf_awareness:'unsure',pf_tension:1},{e_maint:2,pf_awareness:'good_control',pf_tension:1}]){
 for(let week=0;week<4;week++){const sessions=Array.from({length:7},(_,i)=>h.w.SPM_DAILY_PRACTICE.assignments({...h.c,day:week*7+i+1,answers})).flat().filter(a=>a.kind==='pelvic');assert.equal(sessions.length,3);assert.ok(sessions.every(a=>!a.optional));}
 }
 assert.equal(h.w.SPM_DAILY_RESOURCES.pelvicDays({...h.c,answers:{e_maint:1,pf_awareness:'hard_to_relax',pf_tension:5}}).length,8);
 }finally{h.close();}});
 test('checkpoint cannot be marked complete without its actual answers',async()=>{const h=harness('wellbeing',14);try{await wait();await assert.rejects(h.w.SPM_DAILY_PRACTICE.saveActivity('program-checkpoint',{confirmed:true}));assert.equal(h.writes.length,0);
 const record={checkpointVersion:1,metrics:Object.fromEntries(Array.from(h.w.SPM_PROGRAM_CHECKPOINT.metrics,([key])=>[key,null])),reflection:'No evaluable',continuity:'Continuar con comodidad'};
 await h.w.SPM_DAILY_PRACTICE.saveActivity('program-checkpoint',record);assert.equal(h.writes.length,1);assert.equal(h.c.day,14);
 }finally{h.close();}});

 test('missing followups do not prevent completion or final report in any domain',async()=>{const h=harness();try{await wait();for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle'])for(const day of [14,28]){const items=h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary,day});assert.equal(items[0].optional,true);assert.ok(items.filter(a=>a.kind==='program-checkpoint'||a.kind==='ep-checkpoint').every(a=>a.optional));assert.ok(items.some(a=>!a.optional));}}finally{h.close();}});
test('continuation uses actual pending assignments in all six routes and excludes completed tasks',async()=>{
 for(const route of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
  const h=harness(route,1);try{await wait();h.w.SPM_DAILY_PRACTICE.open();await h.w.SPM_DAILY_PRACTICE.launch('main');await h.w.SPM_DAILY_PRACTICE.saveActivity('main',{confirmed:true});
  const items=h.w.SPM_DAILY_PRACTICE.nextActivities();assert(!items.some(a=>a.id==='main'));
  const panel=h.w.document.querySelector('#spmDailyWorkspace [data-spm-next]');assert(panel);for(const a of items)assert(panel.textContent.includes(a.title));
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
test('a finished EP modal shows a working next-activity button and closes through its own lifecycle',async()=>{
 const h=harness('ejaculation',1);try{await wait();h.w.SPM_DAILY_PRACTICE.open();h.w.SPM_EJACULATORY_CONTROL.open=()=>{
 const m=h.w.document.createElement('div');m.id='spmEcModal';m.className='on';m.innerHTML='<button class="ecClose">Cerrar</button>';m.querySelector('button').onclick=()=>m.classList.remove('on');h.w.document.body.append(m);};
 await h.w.SPM_DAILY_PRACTICE.launch('main');await h.w.SPM_DAILY_PRACTICE.saveActivity('main',{confirmed:true});
 const modal=h.w.document.querySelector('#spmEcModal');const button=modal.querySelector('[data-next-id]');assert(button);const id=button.dataset.nextId;button.click();await wait();assert(!modal.classList.contains('on'));assert.equal(h.w.SPM_DAILY_PRACTICE.active().id,id);
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
