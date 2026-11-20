const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'premium-v2/desire-week4-bridge-v1.js'),'utf8');
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
const plain=v=>JSON.parse(JSON.stringify(v));
const catalogue=JSON.parse(fs.readFileSync(path.join(root,'premium-v2/desire-week4-v1/catalog.json'),'utf8'));
function harness(day=23,options={}){
 let context={userId:'qa-user',planId:'qa-plan',primary:'desire',day,safety:'none'};
 let bundle={'spm-desire-program':JSON.stringify({sessions:[],dayDone:{},detailNotes:{},ranking:['massage'],rankPrefs:['massage','words'],details:{tactile:['Caricias lentas']},conditions:['Mejor descanso'],partnerTask:{moment:'Momento anterior'},...options.program}),'spm-desire-state':JSON.stringify({pressure:4,context:'Contexto anterior',stimuli:['tactile'],zones:['back'],...options.state}),'spm-desire-profile':JSON.stringify(options.profile||{})};
 const messages=[],saves=[],completions=[],launches=[],handlers=new Map(),timeouts=new Map(),intervals=new Map();
 let sequence=0,frame,nativeModal=null,nativeFrame=null,restricted=false,saveFail=false,dailyFail=false,beforeSave=null,returned=0;
 const host={isConnected:true,replaceChildren(e){if(this.child){this.child.isConnected=false;for(const c of this.child.children)c.isConnected=false}this.child=e}};
 const win={SPM_WEEK4_CATALOG:catalogue,location:{origin:'https://spm.test'},crypto:{randomUUID:()=>`qa-week4-${++sequence}`},SPM_RESOURCE_CONTEXT:()=>context,
  SPM_DESIRE_RECORDS:{read:async()=>plain(bundle),save:async(next,scope,day)=>{if(beforeSave)await beforeSave();if(saveFail)throw Error('Error de almacenamiento');bundle=plain(next);saves.push({scope,day,payload:plain(next)})}},
  SPM_DESIRE_LAB:{open:async(opts)=>{messages.push({type:'legacy',opts});if(opts.origin==='library'){nativeFrame={src:''};nativeModal={isConnected:true,querySelector:()=>nativeFrame};}return true},close:async()=>{nativeModal=null;return true}},
  SPM_DAILY_PRACTICE:{assignments:()=>[{id:'main',kind:'desire'},...(options.checkpoint?[{id:'program-checkpoint',kind:'program-checkpoint'}]:[])],restricted:()=>restricted,safety:c=>c.safety,
   active:()=>({id:'main',scope:context.userId+':'+context.planId,day:context.day}),
   saveActivity:async(id,data,scope,day)=>{if(dailyFail)return false;completions.push({id,data:plain(data),scope,day});return true},open(){returned++;if(options.changeOnReturn)context={...context,...options.changeOnReturn}},launch:async id=>{launches.push({id,scope:context.userId+':'+context.planId,day:context.day,savedCount:saves.length})},showContinuation(){}},
  addEventListener:(type,fn)=>{const set=handlers.get(type)||new Set();set.add(fn);handlers.set(type,set)},removeEventListener:(type,fn)=>handlers.get(type)?.delete(fn)};
 const document={getElementById:id=>id==='spmDailyWorkspace'?host:null,querySelector:()=>nativeModal,createElement:tag=>{
  const el={tag,isConnected:true,children:[],setAttribute(){},append(e){this.children.push(e)},remove(){this.isConnected=false;for(const child of this.children)child.isConnected=false}};
  if(tag==='iframe'){frame=el;el.contentWindow={postMessage(data,origin){messages.push(plain({...data,targetOrigin:origin}))}}}return el;
 }};
 const sandbox={window:win,document,location:win.location,Date,Number,Math,Object,JSON,String,Array,Set,Promise,encodeURIComponent,
  setTimeout:fn=>{const id=++sequence;timeouts.set(id,fn);return id},clearTimeout:id=>timeouts.delete(id),
  setInterval:fn=>{const id=++sequence;intervals.set(id,fn);return id},clearInterval:id=>intervals.delete(id)};
 vm.runInNewContext(source,sandbox,{filename:'desire-week4-bridge-v1.js'});
 const opened=()=>{const init=messages.filter(x=>x.type==='SPM_WEEK4_INIT').at(-1);return init};
 async function msg(type,record,extra={}){
  const sid=new URL(frame.src,'https://spm.test').searchParams.get('sid');
  const event={origin:win.location.origin,source:frame.contentWindow,data:{type,sid,day:context.day,...(record?{record}:{}),...extra.data},...extra.event};
  for(const fn of [...handlers.get('message')||[]])fn(event);await tick();return event;
 }
 return {win,host,messages,saves,completions,launches,msg,init:opened,get returned(){return returned},
  program:()=>JSON.parse(bundle['spm-desire-program']),state:()=>JSON.parse(bundle['spm-desire-state']),
  frame:()=>frame,nativeFrame:()=>nativeFrame,closeResource:()=>{nativeModal=null},context:next=>{context={...context,...next}},restrict:v=>{restricted=v},saveFail:v=>{saveFail=v},dailyFail:v=>{dailyFail=v},
  updateProgram:next=>{bundle['spm-desire-program']=JSON.stringify({...JSON.parse(bundle['spm-desire-program']),...next})},
  updateState:next=>{bundle['spm-desire-state']=JSON.stringify({...JSON.parse(bundle['spm-desire-state']),...next})},
  flush:async()=>{const work=[...timeouts.values()];timeouts.clear();work.forEach(fn=>fn());await tick()},
  watch:()=>{for(const fn of intervals.values())fn()},
  open:async()=>{assert.equal(await win.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),true);if(!messages.some(x=>x.type==='legacy'))await msg('SPM_WEEK4_READY');return opened()},
  stop:()=>win.SPM_DESIRE_WEEK4_BRIDGE.stop()};
}
function completed(h,patch={}){return {...h.init().record,status:'completed',step:4,confirm:true,hasStarted:true,elapsed:18,before:0,after:null,...patch}}


test('week 4 initializes from real records with null scores, immutable baseline, extra fields and own scope',async()=>{
 const baseline={at:'2026-11-01',metrics:{desire:0,frequency:28,fantasies:4,pressure:8}};
 const h=harness(28,{program:{baseline,continuity:{goals:['Reducir un freno concreto'],keep:'Privacidad',space:'Una práctica'},sessions:[{id:'history',day:24,practiceId:'desire-curve',metricKey:'local',status:'completed',extra:{desire:0,curiosity:null,pressure:9}}]},state:{pressure:null,checkins:[{day:'D28',date:'2026-11-17',metrics:{desire:4,pressure:5}}]}});
 const init=await h.open();assert.equal(init.day,28);assert.equal(init.record.day,28);assert.equal(init.record.practiceId,'final-compare');assert.equal(init.record.before,null);assert.equal(init.record.confirm,false);assert.equal(init.safety.phase2Allowed,false);assert.equal(init.safety.pressure,null);
 assert.equal(init.program.baseline.metrics.desire,0);assert.equal(init.program.baseline.metrics.frequency,28);assert.equal(init.program.baseline.metrics.fantasies,4);assert.equal(init.history[0].extra.pressure,9);assert.equal(init.state.checkins[0].metrics.desire,4);assert.equal(h.saves.length,0);h.stop();
});

test('message origin, frame, session, envelope day and record day all bind the write',async()=>{
 const h=harness(27);await h.open();const record=completed(h);
 for(const extra of [{event:{origin:'https://untrusted.test'}},{event:{source:{}}},{data:{sid:'another-session'}},{data:{day:26}}])await h.msg('SPM_WEEK4_COMPLETE',record,extra);
 await h.msg('SPM_WEEK4_COMPLETE',{...record,day:26});assert.equal(h.saves.length,0);assert.equal(h.completions.length,0);
 await h.msg('SPM_WEEK4_COMPLETE',record);assert.equal(h.completions.length,1);assert.equal(h.program().sessions[0].practiceId,'autonomous-rehearsal');assert.equal(h.program().sessions[0].metricKey,'desire');assert.equal(h.program().sessions[0].before,0);assert.equal(h.program().sessions[0].after,null);h.stop();
});

test('six day 24 values persist exactly under extra and never enter comparable central metrics',async()=>{
 const original={id:'day3',day:3,practiceId:'breath-routine',metricKey:'pressure',status:'completed',before:6,after:3};
 const baseline={at:'baseline',metrics:{desire:4,pressure:8}};const checkpoints={28:{at:'official',source:'central'}};
 const h=harness(24,{program:{sessions:[original],baseline,checkpoints}});await h.open();
 const extra={desire:0,curiosity:null,openness:4,enjoyment:5,pressure:9,connection:7};
 await h.msg('SPM_WEEK4_COMPLETE',completed(h,{before:9,after:9,localAfter:10,extra}),{data:{program:{baseline:{at:'overwrite'},checkpoints:{},sessions:[]},programChanged:['baseline','checkpoints','sessions']}});
 const p=h.program(),row=p.sessions[1];assert.deepEqual(p.sessions[0],original);assert.equal(row.metricKey,'local');assert.equal(row.before,null);assert.equal(row.after,null);assert.deepEqual(row.extra,extra);assert.deepEqual(p.baseline,baseline);assert.deepEqual(p.checkpoints,checkpoints);assert.equal(h.completions.length,1);h.stop();
});

test('day 23 uses pressure and days 25,26,28 use local values without rewriting checkins',async()=>{
 for(const day of [23,25,26,28]){
  const h=harness(day,{state:{checkins:[{day:'prior',metrics:{desire:2}}]}});await h.open();await h.msg('SPM_WEEK4_COMPLETE',completed(h,{after:7,localAfter:3}));
  const row=h.program().sessions[0];assert.equal(row.metricKey,day===23?'pressure':'local');assert.equal(row.after,day===23?7:3);assert.deepEqual(h.state().checkins,[{day:'prior',metrics:{desire:2}}]);h.stop();
 }
});

test('the definitive 400-character reflection is retained exactly; excess is rejected visibly',async()=>{
 const h=harness(25);await h.open();const long='á'.repeat(401);
 await h.msg('SPM_WEEK4_COMPLETE',completed(h,{fields:{reflection:long,if_tired:'a',if_pressure:'b',if_low_interest:'c'}}));
 assert.equal(h.saves.length,0);assert.equal(h.completions.length,0);assert.match(h.messages.at(-1).message,/400/);
 const exact='Cansancio: descanso. Presión: respiro. Interés bajo: elijo otra experiencia.';
 await h.msg('SPM_WEEK4_COMPLETE',completed(h,{fields:{reflection:exact,if_tired:'a',if_pressure:'b',if_low_interest:'c'}}));
 assert.equal(h.program().sessions[0].reflection,exact);assert.equal(h.program().sessions[0].reflection.includes(' · '),false);h.stop();
});

test('continuity and the separate three-action plan enforce limits without silent truncation',async()=>{
 const h=harness(26,{program:{continuity:{goals:['Rutina previa de respiración'],keep:'Conservar',space:'Espaciar'},baseline:{at:'frozen'}}});await h.open();
 const program={continuity:{goals:catalogue.continuityGoals.slice(0,3),keep:'nuevo',space:''}};
 await h.msg('SPM_WEEK4_CHANGE',completed(h),{data:{program,programChanged:['continuity']}});await h.flush();assert.equal(h.saves.length,0);assert.match(h.messages.at(-1).message,/dos objetivos/);
 program.continuity.goals=program.continuity.goals.slice(0,2);program.continuity.keep='x'.repeat(301);
 await h.msg('SPM_WEEK4_CHANGE',completed(h),{data:{program,programChanged:['continuity']}});await h.flush();assert.equal(h.saves.length,0);assert.match(h.messages.at(-1).message,/300/);
 program.continuity.keep='x'.repeat(300);program.actions=['stress','talk','context','food'];
 await h.msg('SPM_WEEK4_CHANGE',completed(h),{data:{program,programChanged:['continuity','actions']}});await h.flush();assert.equal(h.saves.length,0);assert.match(h.messages.at(-1).message,/tres acciones/);
 program.actions=['stress','talk','context'];
 await h.msg('SPM_WEEK4_COMPLETE',completed(h),{data:{program,programChanged:['continuity','actions']}});
 assert.deepEqual(h.program().continuity,program.continuity);assert.deepEqual(h.state().actions,program.actions);assert.deepEqual(h.program().baseline,{at:'frozen'});h.stop();
});

test('explicit resource patches preserve untouched preferences and clinical data',async()=>{
 const h=harness(27,{program:{details:{visual:['Miradas'],custom:['Preservar']},detailNotes:{visual:'Antes',custom:'Intacto'},conditions:['Más tiempo'],ranking:['massage']}});await h.open();
 await h.msg('SPM_WEEK4_COMPLETE',completed(h),{data:{program:{context:'Nuevo contexto',details:{visual:['Luz']},detailNotes:{visual:'Después'},conditions:['Mejor descanso'],routineStep:2,nextPractice:'talk',ranking:['fantasy'],baseline:{at:'new'}},programChanged:['context','details','detailNotes','conditions','routineStep','nextPractice']}});
 assert.equal(h.state().context,'Nuevo contexto');assert.equal(h.state().pressure,4);assert.deepEqual(h.program().details,{visual:['Luz'],custom:['Preservar']});assert.equal(h.program().detailNotes.custom,'Intacto');assert.deepEqual(h.program().ranking,['massage']);assert.deepEqual(h.program().conditions,['Mejor descanso']);assert.equal(h.program().routineStep,2);assert.equal(h.program().nextPractice,'talk');h.stop();
});

const historyRow=(id,pid,metric,before,after,extra={})=>({id,day:10,practiceId:pid,metricKey:metric,status:'completed',before,after,...extra});
test('day 22 chooses only actual useful completed activators, or the current assigned route',async()=>{
 const rows=[historyRow('positive','visual-explore','desire',1,5),historyRow('fantasy','fantasy-private','fantasies',0,2),historyRow('bad-metric','sensory-focus','pressure',0,10),historyRow('paused','autonomous-rehearsal','desire',0,10,{status:'paused'}),historyRow('reflective','if-then','local',0,10),historyRow('missing','responsive-window','desire',null,10)];
 const h=harness(22,{program:{sessions:rows}});await h.open();assert.deepEqual(h.init().day22Candidates.map(p=>p.id),['visual-explore','fantasy-private']);assert.equal(h.init().assignedPractice.id,'visual-explore');assert.equal(h.init().record.practiceId,'');assert.equal(h.init().record.confirm,false);
 await h.msg('SPM_WEEK4_COMPLETE',completed(h,{practiceId:'@best',runnerCompleted:true}));assert.equal(h.saves.length,0);
 await h.msg('SPM_WEEK4_COMPLETE',completed(h,{practiceId:'visual-explore',runnerCompleted:false}));assert.equal(h.saves.length,0);
 await h.msg('SPM_WEEK4_COMPLETE',completed(h,{practiceId:'sensory-focus',runnerCompleted:true}));assert.equal(h.saves.length,0);
 await h.msg('SPM_WEEK4_COMPLETE',completed(h,{practiceId:'visual-explore',runnerCompleted:true,fields:{reflection:'Intento nuevo'}}));
 assert.deepEqual(h.program().sessions.slice(0,rows.length),rows);assert.equal(h.program().sessions.at(-1).day,22);assert.equal(h.program().sessions.at(-1).practiceId,'visual-explore');assert.equal(h.program().sessions.at(-1).reflection,'Intento nuevo');h.stop();
 const k=harness(22,{state:{stimuli:[],zones:[]}});await k.open();assert.deepEqual(k.init().day22Candidates,[]);assert.equal(k.init().assignedPractice.id,'responsive-window');assert.equal(k.init().record.before,null);k.stop();
});

test('day 22 preserves fantasies 0–4 and frequency 0–60 instead of forcing every measure to 0–10',async()=>{
 for(const scenario of [{pid:'fantasy-private',metric:'fantasies',before:3,after:4,max:4},{pid:'reconnect-gradual',metric:'frequency',before:25,after:36,max:60}]){
  const h=harness(22,{program:{hasPartner:'yes',sessions:[historyRow('history',scenario.pid,scenario.metric,0,scenario.max)]}});await h.open();assert.equal(h.init().assignedPractice.max,scenario.max);
  await h.msg('SPM_WEEK4_COMPLETE',completed(h,{practiceId:scenario.pid,runnerCompleted:true,variant:'partner',before:scenario.before,after:scenario.after}));
  const row=h.program().sessions.at(-1);assert.equal(row.metricKey,scenario.metric);assert.equal(row.before,scenario.before);assert.equal(row.after,scenario.after);h.stop();
 }
});

test('day 22 rechecks practice safety, pressure and consent at the moment of saving',async()=>{
 const prior=[historyRow('phase1','sensate-1','satisfaction',2,3,{comfortable:true}),historyRow('phase2','sensate-2','satisfaction',1,9)];
 const h=harness(22,{program:{sessions:prior}});await h.open();assert.equal(h.init().assignedPractice.id,'sensate-2');
 await h.msg('SPM_WEEK4_COMPLETE',completed(h,{practiceId:'sensate-2',runnerCompleted:true,ready:false}));assert.equal(h.saves.length,0);
 await h.msg('SPM_WEEK4_COMPLETE',completed(h,{practiceId:'sensate-2',runnerCompleted:true,ready:true,variant:'partner',partnerConsent:false}));assert.equal(h.saves.length,0);
 h.updateState({pressure:8});await h.msg('SPM_WEEK4_COMPLETE',completed(h,{practiceId:'sensate-2',runnerCompleted:true,ready:true,variant:'solo'}));assert.equal(h.saves.length,0);assert.equal(h.messages.at(-1).safety.pressure,8);h.stop();
 const k=harness(22,{program:{sessions:[historyRow('verbal','verbal-script','desire',1,8)]},state:{health:['meds']}});await k.open();assert.deepEqual(k.init().day22Candidates,[]);assert.equal(k.init().assignedPractice.safe,true);k.stop();
});

test('the ranking is never refilled with a third historical practice when the first two are blocked',async()=>{
 const rows=[historyRow('s2','sensate-2','satisfaction',0,10),historyRow('verbal','verbal-script','desire',0,9),historyRow('visual','visual-explore','desire',0,8)];
 const h=harness(22,{program:{sessions:rows},state:{health:['meds']}});await h.open();assert.deepEqual(h.init().day22Candidates,[]);assert.notEqual(h.init().assignedPractice.id,'verbal-script');h.stop();
});

test('drafts and official report handoff save work without completing day 28 or writing a checkpoint',async()=>{
 const checkpoint={14:{at:'real',source:'central'}};const h=harness(28,{program:{checkpoints:checkpoint}});await h.open();
 await h.msg('SPM_WEEK4_COMPLETE',completed(h,{confirm:false}));assert.equal(h.saves.length,0);
 await h.msg('SPM_WEEK4_COMPLETE',completed(h,{step:2}));assert.equal(h.saves.length,0);
 await h.msg('SPM_WEEK4_EXIT_TO_TODAY',completed(h,{status:'draft',step:2,confirm:false,fields:{reflection:'Avance guardado'}}),{data:{reason:'report'}});
 assert.equal(h.returned,1);assert.equal(h.completions.length,0);assert.equal(h.program().sessions.length,0);assert.deepEqual(h.program().dayDone,{});assert.deepEqual(h.program().checkpoints,checkpoint);assert.equal(JSON.parse(h.program().detailNotes.desireWeek4TouchDay28).step,2);h.stop();
});

test('resource handoff opens the existing Lab with the same draft and refreshes changes on return',async()=>{
 const h=harness(22,{program:{sessions:[historyRow('old','repertoire-try','desire',1,8)]}});await h.open();const rec=completed(h,{status:'draft',step:3,confirm:false,practiceId:'repertoire-try',fields:{reflection:'Conservar'}});
 await h.msg('SPM_WEEK4_OPEN_RESOURCE',rec,{data:{target:'r:ideas'}});assert.equal(h.program().sessions.length,1);assert.equal(h.completions.length,0);assert.match(h.nativeFrame().src,/resource=r%3Aideas/);assert.equal(h.messages.at(-1).type,'SPM_WEEK4_RESOURCE_OPENED');
 h.updateProgram({conditions:['Menos distracciones']});h.closeResource();h.watch();await tick();assert.equal(h.init().record.id,rec.id);assert.equal(h.init().record.fields.reflection,'Conservar');assert.deepEqual(h.init().program.conditions,['Menos distracciones']);h.stop();
});

test('resource handoff rejects arbitrary targets and never completes a practice',async()=>{
 const h=harness(22);await h.open();await h.msg('SPM_WEEK4_OPEN_RESOURCE',completed(h,{practiceId:h.init().assignedPractice.id}),{data:{target:'s:17'}});assert.equal(h.saves.length,0);assert.equal(h.completions.length,0);assert.equal(h.nativeFrame(),null);assert.match(h.messages.at(-1).message,/no corresponde/);h.stop();
});

test('READY retries retain the same in-memory draft and pending resource choices',async()=>{
 const h=harness(26);await h.open();const first=plain(h.init());await h.msg('SPM_WEEK4_READY');assert.equal(h.init().record.id,first.record.id);
 await h.msg('SPM_WEEK4_CHANGE',{...first.record,step:3,fields:{reflection:'Borrador'},hasStarted:true},{data:{program:{continuity:{keep:'Pendiente'}},programChanged:['continuity']}});
 await h.msg('SPM_WEEK4_READY');assert.equal(h.init().record.id,first.record.id);assert.equal(h.init().record.step,3);assert.equal(h.init().record.fields.reflection,'Borrador');assert.equal(h.init().program.continuity.keep,'Pendiente');assert.equal(h.saves.length,0);h.stop();
});

test('user, plan, day and iframe detachment invalidate queued saves',async()=>{
 for(const change of [{userId:'another'},{planId:'another'},{day:26}]){
  const h=harness(23);await h.open();await h.msg('SPM_WEEK4_CHANGE',completed(h,{fields:{reflection:'Aislar'}}));h.context(change);await h.flush();assert.equal(h.saves.length,0);h.watch();assert.equal(h.frame().isConnected,false);h.stop();
 }
 const h=harness(23);await h.open();h.frame().remove();await h.msg('SPM_WEEK4_COMPLETE',completed(h));assert.equal(h.saves.length,0);h.stop();
});

test('a newly restricted activity closes as interrupted without applying unsafe updates',async()=>{
 const h=harness(27);await h.open();const rec=completed(h,{fields:{reflection:'Pausa'}});h.updateState({health:['acute']});
 await h.msg('SPM_WEEK4_CLOSE',rec,{data:{program:{continuity:{goals:['Ventana de activación semanal']}},programChanged:['continuity']}});
 assert.equal(h.returned,1);assert.equal(h.completions.length,0);assert.equal(h.program().sessions.length,0);assert.equal(h.program().continuity,undefined);const draft=JSON.parse(h.program().detailNotes.desireWeek4TouchDay27);assert.equal(draft.status,'interrupted');assert.equal(draft.confirm,false);assert.equal(draft.fields.reflection,'Pausa');h.stop();
});

test('daily-close retries are idempotent, and reopening creates a fresh explicitly confirmed attempt',async()=>{
 const h=harness(27);await h.open();h.dailyFail(true);const rec=completed(h,{fields:{reflection:'Primer intento'}});await h.msg('SPM_WEEK4_COMPLETE',rec);assert.equal(h.program().sessions.length,1);assert.equal(h.completions.length,0);assert.equal(h.frame().isConnected,true);
 h.dailyFail(false);await h.msg('SPM_WEEK4_COMPLETE',rec);assert.equal(h.program().sessions.length,1);assert.equal(h.completions.length,1);
 const previous=plain(h.program().sessions[0]);await h.open();assert.notEqual(h.init().record.id,previous.id);assert.equal(h.init().record.confirm,false);assert.equal(h.init().record.before,null);
 await h.msg('SPM_WEEK4_COMPLETE',completed(h,{fields:{reflection:'Segundo intento'}}));assert.equal(h.program().sessions.length,2);assert.deepEqual(h.program().sessions[0],previous);h.stop();
});

test('other days, library entries and an acute flag preserve the original route',async()=>{
 const h=harness(21);await h.open();assert.equal(h.messages[0].type,'legacy');h.stop();
 const k=harness(24,{state:{health:['acute']}});await k.open();assert.equal(k.messages[0].type,'legacy');assert.equal(k.saves.length,0);k.stop();
 const n=harness(23);await n.win.SPM_DESIRE_LAB.open({origin:'library'});assert.equal(n.messages[0].type,'legacy');n.stop();
});

test('bridge-to-core roundtrip keeps manual reflections instead of recomposing the old drafts',async()=>{
 const core=require('../premium-v2/desire-week4-v1/core.js');
 for(const day of [23,25,27]){
  const h=harness(day);await h.open();const reflection='Mi redacción manual: '+day;
  const record={...h.init().record,step:3,reflectionSource:'manual',fields:{reflection,demand_phrase:'antigua',flexible_phrase:'antigua',if_tired:'antigua',if_pressure:'antigua',if_low_interest:'antigua',supporting_condition:'antigua'},choices:{known_stimulus:'image'}};
  await h.msg('SPM_WEEK4_CLOSE',record);await h.open();
  const restored=core.recordFrom(day,h.init().record);assert.equal(restored.reflectionSource,'manual');assert.equal(core.composeReflection(restored),reflection);h.stop();
 }
});

test('a started day 22 runner cannot be relabeled while reusing its completion, clock or record ID',async()=>{
 const rows=[historyRow('visual','visual-explore','desire',0,9),historyRow('fantasy','fantasy-private','fantasies',0,4)];
 const h=harness(22,{program:{sessions:rows}});await h.open();
 const first={...h.init().record,practiceId:'visual-explore',step:3,runnerStep:2,runnerStarted:true,runnerCompleted:false,elapsed:11};
 await h.msg('SPM_WEEK4_CLOSE',first);await h.open();assert.equal(h.init().record.runnerStarted,true);assert.equal(h.init().record.runnerStep,2);
 const saves=h.saves.length;await h.msg('SPM_WEEK4_COMPLETE',completed(h,{practiceId:'fantasy-private',runnerCompleted:true}));assert.equal(h.saves.length,saves);assert.equal(h.completions.length,0);assert.match(h.messages.at(-1).message,/ya corresponde/);
 await h.msg('SPM_WEEK4_COMPLETE',completed(h,{practiceId:'visual-explore',runnerCompleted:true}));assert.equal(h.completions.length,1);assert.equal(h.program().sessions.at(-1).practiceId,'visual-explore');h.stop();
});

test('INIT supplies real checkin dates and ignores malformed checkpoint labels',async()=>{
 const h=harness(28,{state:{checkins:[{day:'D14',date:'2026-11-10',metrics:{desire:4}},{day:'D28',date:'2026-11-19',metrics:{desire:5}},{day:'arbitrary',date:'2026-11-20',metrics:{desire:10}}]}});await h.open();
 assert.deepEqual(h.init().state.checkins.map(x=>[x.day,x.date]),[['D14','2026-11-10'],['D28','2026-11-19']]);h.stop();
});

test('assigned route preserves canonical channel priority weights and ties including saved body zones',()=>{
 const engine=fs.readFileSync(path.join(root,'labs/desire/src/lib/desire-engine.ts'),'utf8');
 const body=engine.match(/export function interpret\(s: DesireState\) \{([\s\S]*?)\n\}/)[1]
  .replace('c: Cand[]','c').replace('const chosen: Cand[]','const chosen').replace(' as Role[]','').replace(/\]!\./g,'].');
 const canonical={practices:catalogue.practices,fantasyOpts:['Nunca','Rara vez','A veces','Frecuente','Muy frecuente'],stimuliOpts:[],barrierOpts:[],healthOpts:[],lbl:()=>[],evaluate:()=>({rec:'continue'}),freqChange:s=>s.freqBefore?.value>0?Math.round((s.freqNow.value-s.freqBefore.value)/s.freqBefore.value*100):null};
 vm.runInNewContext('this.interpret=s=>{'+body+'};',canonical);
 const base={stimuli:[],zones:[],barriers:[],brakes:[],health:[],accelerators:[],baseline:{desire:5,satisfaction:5,stress:5,energy:5,sleep:5,confidence:5},rel:{closeness:5,communication:5},freqBefore:{value:4,unit:'month'},freqNow:{value:4,unit:'month'},fantasyFreq:'A veces',fantasiesNow:'no',fantasiesTrend:'same',enjoyment:'yes',pressure:4};
 const h=harness();
 const cases=[{stimuli:['visual','tactile'],zones:['back']},{stimuli:['visual'],zones:['back']},{stimuli:['visual','tactile','slow'],zones:['back'],enjoyment:'no'},{stimuli:['visual','tactile'],zones:['back'],enjoyment:'no'}];
 for(let mask=0;mask<64;mask++)cases.push({stimuli:['visual','tactile','slow','verbal','auditory','zones'].filter((_,i)=>mask&(1<<i)),zones:mask%2?['back']:[],enjoyment:mask%3?'yes':'no',pressure:mask%5?4:8});
 for(const patch of cases){const state={...plain(base),...patch};assert.deepEqual(plain(h.win.SPM_DESIRE_WEEK4_BRIDGE.assignedFromState(state,{review:false})),plain(canonical.interpret(state).assignedPractices),JSON.stringify(patch));}
 assert.deepEqual(plain(h.win.SPM_DESIRE_WEEK4_BRIDGE.assignedFromState({...base,stimuli:['visual'],zones:['back']},{review:false})).slice(0,2),['visual-explore','sensory-focus']);h.stop();
});

// Execute both real scripts and pass their actual postMessage payloads between VMs.
// This verifies the data contract; the synthetic DOM does not claim mobile-layout QA.
async function viewerFor(host,day){
 const dir=path.join(root,'premium-v2/desire-week4-v1'),callbacks={},inbound=[],outgoing=[];
 const sid=new URL(host.frame().src,'https://spm.test').searchParams.get('sid');
 const mk=()=>({innerHTML:'',textContent:'',hidden:false,dataset:{},classList:{add(){},remove(){}},querySelector:()=>null,querySelectorAll:()=>[],focus(){}});
 const app=mk(),overlay=mk(),toast=mk();for(const [name,el] of [['app',app],['overlay',overlay]])el.addEventListener=(event,fn)=>callbacks[name+'_'+event]=fn;
 const location={origin:'https://spm.test',pathname:'/premium-v2/desire-week4-v1/index.html',protocol:'https:',search:'?spm=central&day='+day+'&sid='+sid};
 const document={hidden:false,activeElement:null,querySelector:q=>({'#app':app,'#resourceOverlay':overlay,'#toast':toast}[q]||null),querySelectorAll:()=>[],createTextNode:x=>x,addEventListener:(name,fn)=>callbacks['document_'+name]=fn};
 const parent={postMessage(data,origin){assert.equal(origin,location.origin);outgoing.push(plain(data));inbound.push(host.msg(data.type,data.record,{data:plain(data)}));}};
 const window={location,document,parent,SPM_WEEK4_CORE:require('../premium-v2/desire-week4-v1/core.js'),SPM_WEEK4_CATALOG:plain(catalogue),SPM_WEEK4_SCREENS:JSON.parse(fs.readFileSync(path.join(dir,'screens.json'),'utf8')),scrollTo(){},addEventListener:(name,fn)=>callbacks['window_'+name]=fn};
 let timer=0,processed=0;
 const sandbox={window,document,location,history:{replaceState(){}},URLSearchParams,Date,Math,Object,Array,Set,Map,Number,String,JSON,Intl,Promise,
  setTimeout:()=>++timer,clearTimeout(){},setInterval:()=>++timer,clearInterval(){},addEventListener:(name,fn)=>callbacks['window_'+name]=fn};
 Object.defineProperty(sandbox,'localStorage',{get(){throw Error('Central must not access preview storage');}});
 vm.runInNewContext(fs.readFileSync(path.join(dir,'app.js'),'utf8'),sandbox,{filename:'actual-week4-app.js'});
 async function pump(){for(let n=0;n<20;n++){await Promise.all(inbound.splice(0));await tick();const msgs=host.messages.slice(processed);processed=host.messages.length;for(const message of msgs)if(message.type.startsWith('SPM_WEEK4_'))callbacks.window_message?.({origin:location.origin,source:parent,data:plain(message)});if(!inbound.length&&host.messages.length===processed){await tick();if(host.messages.length===processed)break;}}}
 const decode=s=>s.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
 function element(name,value,where=app){const target='data-'+name+'="'+value+'"';const tag=(where.innerHTML.match(/<[^>]+>/g)||[]).find(x=>x.includes(target));assert(tag,'Visible actual viewer '+target);const dataset={};for(const match of tag.matchAll(/data-([\w-]+)="([^"]*)"/g))dataset[match[1].replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=decode(match[2]);return {dataset,tag,setAttribute(){},matches(q){return name==='control'&&(q==='textarea[data-control]'&&tag.startsWith('<textarea')||q==='input[type=range][data-control]'&&tag.includes('type="range"'));},closest(q){if(q.includes('['+target+']')||q==='[data-'+name+']'||q==='button[data-'+name+']')return this;return null;}};}
 async function click(name,value,where=app){const el=element(name,value,where);callbacks[(where===overlay?'overlay':'app')+'_click']({target:el});await pump();}
 async function input(name,value,answer,where=app){const el=element(name,value,where);el.value=String(answer);el.checked=answer===true;callbacks[(where===overlay?'overlay':'app')+'_input']({target:el});await pump();}
 await pump();return {app,overlay,toast,outgoing,pump,click,input,control:id=>click('control',id),action:id=>click('action',id),modal:id=>click('modal-action',id,overlay),state:()=>plain(window.SPM_WEEK4_REVIEW.getState()),screen:()=>app.innerHTML.match(/data-screen="([^"]+)"/)?.[1],pending:()=>window.SPM_WEEK4_REVIEW.pending()};
}

test('actual viewer and host complete day 25 with edited reflection and its local confidence',async()=>{
 const h=harness(25);await h.open();const v=await viewerFor(h,25);assert.equal(v.screen(),'d25_01');
 await v.control('primary');await v.input('control','if_tired','Descansar');await v.input('control','if_pressure','Respirar');await v.control('primary');await v.input('control','if_low_interest','Conversar');await v.control('primary');
 assert.equal(v.screen(),'d25_04');await v.input('control','reflection','Mi plan editado manualmente');await v.input('control','metric-local_after-scale',6);await v.control('confirm');await v.control('primary');
 assert.equal(h.completions.length,1);assert.equal(h.program().sessions[0].reflection,'Mi plan editado manualmente');assert.equal(h.program().sessions[0].metricKey,'local');assert.equal(h.program().sessions[0].after,6);h.stop();
});

test('actual viewer and host retain a manual phrase after closing and reopening day 23',async()=>{
 const h=harness(23);await h.open();let v=await viewerFor(h,23);await v.control('primary');await v.input('control','demand_phrase','Tengo que');await v.input('control','flexible_phrase','Puedo');await v.control('primary');await v.control('primary');await v.input('control','reflection','Mi formulación personal');await v.action('home');assert.equal(h.returned,1);assert.equal(h.completions.length,0);
 await h.open();v=await viewerFor(h,23);assert.equal(v.state().sessions[23].reflectionSource,'manual');await v.control('confirm');await v.control('primary');assert.equal(h.program().sessions[0].reflection,'Mi formulación personal');h.stop();
});

test('actual viewer and host preserve six independent nullable day 24 observations',async()=>{
 const h=harness(24);await h.open();const v=await viewerFor(h,24);await v.control('primary');await v.input('control','metric-extra.desire-scale',0);await v.control('primary');await v.input('control','metric-extra.openness-scale',4);await v.input('control','metric-extra.enjoyment-scale',5);await v.control('primary');await v.input('control','metric-extra.pressure-scale',8);await v.input('control','metric-extra.connection-scale',6);await v.control('confirm');await v.control('primary');
 assert.deepEqual(h.program().sessions[0].extra,{desire:0,curiosity:null,openness:4,enjoyment:5,pressure:8,connection:6});assert.equal(h.program().sessions[0].after,null);h.stop();
});

test('actual day 22 runner completes its assigned real practice once with the same record ID',async()=>{
 const h=harness(22,{state:{stimuli:[],zones:[]}});await h.open();const v=await viewerFor(h,22),id=v.state().sessions[22].id;await v.control('primary');assert.equal(v.screen(),'d22_02a');await v.control('primary');
 assert.equal(v.state().sessions[22].practiceId,'responsive-window');assert(v.overlay.innerHTML.includes('Comenzar los pasos'));await v.input('runner-metric','before',2,v.overlay);
 const steps=catalogue.practices['responsive-window'].steps.length;for(let i=0;i<=steps;i++)await v.modal('runner-next');await v.input('runner-metric','after',4,v.overlay);await v.input('runner-check','confirm',true,v.overlay);await v.modal('runner-finish');assert.equal(v.screen(),'d22_04');await v.control('primary');
 const row=h.program().sessions[0];assert.equal(row.id,id);assert.equal(row.practiceId,'responsive-window');assert.equal(row.before,2);assert.equal(row.after,4);assert.equal(h.program().sessions.length,1);assert.equal(h.completions.length,1);h.stop();
});

test('actual app resource handoff resumes the same runner with refreshed resource data',async()=>{
 const h=harness(22,{program:{sessions:[historyRow('past','repertoire-try','desire',1,7)]}});await h.open();const v=await viewerFor(h,22);await v.control('primary');await v.control('primary');const id=v.state().sessions[22].id;
 await v.click('resource','r:ideas',v.overlay);await v.click('host-resource','r:ideas',v.overlay);assert.equal(v.pending(),'');assert(h.nativeFrame().src.includes('resource=r%3Aideas'));
 h.updateProgram({conditions:['Menos distracciones']});h.closeResource();h.watch();await v.pump();assert.equal(v.state().sessions[22].id,id);assert.equal(v.state().sessions[22].runnerStarted,true);assert.deepEqual(v.state().program.conditions,['Menos distracciones']);assert(v.overlay.innerHTML.includes('Comenzar los pasos'));assert.equal(h.completions.length,0);h.stop();
});

test('actual day 28 official-report action exits to Today with a draft, no completion or comparison invented',async()=>{
 const h=harness(28);await h.open();const v=await viewerFor(h,28);await v.control('primary');assert.equal(h.returned,1);assert.equal(h.completions.length,0);assert.equal(h.program().sessions.length,0);assert.equal(h.program().checkpoints,undefined);assert.equal(JSON.parse(h.program().detailNotes.desireWeek4TouchDay28).step,2);h.stop();
});

test('day 28 report opens its existing assigned checkpoint only after the draft is saved',async()=>{
 const h=harness(28,{checkpoint:true});await h.open();const v=await viewerFor(h,28);await v.control('primary');
 assert.equal(h.returned,1);assert.equal(h.launches.length,1);assert.deepEqual(h.launches[0],{id:'program-checkpoint',scope:'qa-user:qa-plan',day:28,savedCount:1});assert.equal(h.completions.length,0);assert.equal(h.program().sessions.length,0);assert.equal(h.program().checkpoints,undefined);h.stop();
});

test('report handoff never navigates into another user, plan or day after returning to Today',async()=>{
 for(const changeOnReturn of [{userId:'someone-else'},{planId:'different-plan'},{day:27}]){
  const h=harness(28,{checkpoint:true,changeOnReturn});await h.open();await h.msg('SPM_WEEK4_EXIT_TO_TODAY',{...h.init().record,step:2},{data:{reason:'report'}});
  assert.equal(h.saves.length,1);assert.equal(h.launches.length,0);assert.equal(h.completions.length,0);h.stop();
 }
 const h=harness(28,{checkpoint:true});await h.open();h.saveFail(true);await h.msg('SPM_WEEK4_EXIT_TO_TODAY',{...h.init().record,step:2},{data:{reason:'report'}});assert.equal(h.returned,0);assert.equal(h.launches.length,0);assert.equal(h.frame().isConnected,true);h.stop();
});
