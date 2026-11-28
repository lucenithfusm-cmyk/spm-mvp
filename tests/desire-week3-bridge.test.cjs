const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'premium-v2/desire-week3-bridge-v1.js'),'utf8');
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
const plain=v=>JSON.parse(JSON.stringify(v));
function harness(day=15,options={}){
 let context={userId:'qa-user',planId:'qa-plan',primary:'desire',day,safety:'none'};
 let bundle={'spm-desire-program':JSON.stringify({sessions:[],dayDone:{},detailNotes:{},ranking:['massage'],rankPrefs:['massage','words'],details:{tactile:['Caricias lentas']},conditions:['Mejor descanso'],partnerTask:{moment:'Momento anterior'},...options.program}),'spm-desire-state':JSON.stringify({pressure:4,context:'Contexto anterior',stimuli:['tactile'],zones:['back'],...options.state}),'spm-desire-profile':JSON.stringify(options.profile||{})};
 const messages=[],saves=[],completions=[],handlers=new Map(),timeouts=new Map(),intervals=new Map();
 let sequence=0,frame,restricted=false,saveFail=false,dailyFail=false,beforeSave=null,returned=0;
 const host={isConnected:true,replaceChildren(e){if(this.child){this.child.isConnected=false;for(const c of this.child.children)c.isConnected=false}this.child=e}};
 const win={location:{origin:'https://spm.test'},crypto:{randomUUID:()=>`qa-week3-${++sequence}`},SPM_RESOURCE_CONTEXT:()=>context,
  SPM_DESIRE_RECORDS:{read:async()=>plain(bundle),save:async(next,scope,day)=>{if(beforeSave)await beforeSave();if(saveFail)throw Error('Error de almacenamiento');bundle=plain(next);saves.push({scope,day,payload:plain(next)})}},
  SPM_DESIRE_LAB:{open:async()=>{messages.push({type:'legacy'});return true},close:async()=>true},
  SPM_DAILY_PRACTICE:{assignments:()=>[{id:'main',kind:'desire'}],restricted:()=>restricted,safety:c=>c.safety,
   active:()=>({id:'main',scope:context.userId+':'+context.planId,day:context.day}),
   saveActivity:async(id,data,scope,day)=>{if(dailyFail)return false;completions.push({id,data:plain(data),scope,day});return true},open(){returned++},showContinuation(){}},
  addEventListener:(type,fn)=>{const set=handlers.get(type)||new Set();set.add(fn);handlers.set(type,set)},removeEventListener:(type,fn)=>handlers.get(type)?.delete(fn)};
 const document={getElementById:id=>id==='spmDailyWorkspace'?host:null,querySelector:()=>null,createElement:tag=>{
  const el={tag,isConnected:true,children:[],setAttribute(){},append(e){this.children.push(e)},remove(){this.isConnected=false;for(const child of this.children)child.isConnected=false}};
  if(tag==='iframe'){frame=el;el.contentWindow={postMessage(data,origin){messages.push(plain({...data,targetOrigin:origin}))}}}return el;
 }};
 const sandbox={window:win,document,location:win.location,Date,Number,Math,Object,JSON,String,Array,Set,Promise,encodeURIComponent,
  setTimeout:fn=>{const id=++sequence;timeouts.set(id,fn);return id},clearTimeout:id=>timeouts.delete(id),
  setInterval:fn=>{const id=++sequence;intervals.set(id,fn);return id},clearInterval:id=>intervals.delete(id)};
 vm.runInNewContext(source,sandbox,{filename:'desire-week3-bridge-v1.js'});
 const opened=()=>{const init=messages.filter(x=>x.type==='SPM_WEEK3_INIT').at(-1);return init};
 async function msg(type,record,extra={}){
  const sid=new URL(frame.src,'https://spm.test').searchParams.get('sid');
  const event={origin:win.location.origin,source:frame.contentWindow,data:{type,sid,day:context.day,...(record?{record}:{}),...extra.data},...extra.event};
  for(const fn of [...handlers.get('message')||[]])fn(event);await tick();return event;
 }
 return {win,host,messages,saves,completions,msg,init:opened,get returned(){return returned},
  program:()=>JSON.parse(bundle['spm-desire-program']),state:()=>JSON.parse(bundle['spm-desire-state']),
  frame:()=>frame,context:next=>{context={...context,...next}},restrict:v=>{restricted=v},saveFail:v=>{saveFail=v},dailyFail:v=>{dailyFail=v},
  updateProgram:next=>{bundle['spm-desire-program']=JSON.stringify({...JSON.parse(bundle['spm-desire-program']),...next})},
  updateState:next=>{bundle['spm-desire-state']=JSON.stringify({...JSON.parse(bundle['spm-desire-state']),...next})},
  flush:async()=>{const work=[...timeouts.values()];timeouts.clear();work.forEach(fn=>fn());await tick()},
  watch:()=>{for(const fn of intervals.values())fn()},
  open:async()=>{assert.equal(await win.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),true);if(!messages.some(x=>x.type==='legacy'))await msg('SPM_WEEK3_READY');return opened()},
  stop:()=>win.SPM_DESIRE_WEEK3_BRIDGE.stop()};
}
function completed(h,patch={}){return {...h.init().record,status:'completed',step:4,confirm:true,hasStarted:true,elapsed:18,before:0,after:null,...patch}}

test('central initializes the assigned day with original data types and no fabricated safety answers',async()=>{
 const h=harness(21,{state:{pressure:null},program:{details:{tactile:['Contacto suave'],custom:['Conservar']},detailNotes:{tactile:'Preferencia previa',old:'No borrar'},ranking:['massage'],rankPrefs:['massage','words']}});
 const init=await h.open();assert.equal(init.day,21);assert.equal(init.record.day,21);assert.equal(init.safety.pressure,null);assert.equal(init.safety.phase2Allowed,false);
 assert.deepEqual(init.program.details,{tactile:['Contacto suave'],custom:['Conservar']});assert.deepEqual(init.program.ranking,['massage']);assert.equal(init.program.detailNotes.tactile,'Preferencia previa');
 assert.equal(init.record.before,null);assert.equal(init.record.comfortableAnswered,false);assert.equal(h.saves.length,0);h.stop();
});

test('messages from the wrong origin, frame, session, envelope day or record day cannot save',async()=>{
 const h=harness(16);await h.open();const record=completed(h,{comfortable:true,comfortableAnswered:true});
 await h.msg('SPM_WEEK3_COMPLETE',record,{event:{origin:'https://untrusted.test'}});
 await h.msg('SPM_WEEK3_COMPLETE',record,{event:{source:{}}});
 await h.msg('SPM_WEEK3_COMPLETE',record,{data:{sid:'another-session'}});
 await h.msg('SPM_WEEK3_COMPLETE',record,{data:{day:17}});
 await h.msg('SPM_WEEK3_COMPLETE',{...record,day:17});
 assert.equal(h.saves.length,0);assert.equal(h.completions.length,0);
 await h.msg('SPM_WEEK3_COMPLETE',record);assert.equal(h.completions.length,1);assert.equal(h.completions[0].day,16);assert.equal(h.program().sessions[0].comfortable,true);assert.equal(h.program().sessions[0].before,0);assert.equal(h.program().sessions[0].after,null);h.stop();
});

test('day 19 fallback repeats phase I under day 19 and cannot invent a comfortable day 16',async()=>{
 const original={id:'prior-16',day:16,date:'2026-11-18',practiceId:'sensate-1',status:'completed',comfortable:false,comfort:10};
 const h=harness(19,{program:{sessions:[original],dayDone:{16:'2026-11-18'},checkpoints:{14:{source:'central',at:'prior'}}}});
 await h.open();assert.equal(h.init().record.practiceId,'sensate-1');assert.equal(h.init().safety.phase1Done,false);
 await h.msg('SPM_WEEK3_COMPLETE',completed(h,{practiceId:'sensate-2',ready:true,comfortable:true}),{data:{program:{sessions:[{...original,comfortable:true}],acute:false},programChanged:['sessions','acute']}});
 assert.equal(h.completions.length,0);assert.equal(h.saves.length,0);assert(h.messages.some(x=>x.type==='SPM_WEEK3_ERROR'));
 await h.msg('SPM_WEEK3_COMPLETE',completed(h,{practiceId:'sensate-1',comfortable:true,comfortableAnswered:true}));
 const p=h.program();assert.equal(h.completions.length,1);assert.equal(p.sessions.length,2);assert.deepEqual(p.sessions[0],original);assert.equal(p.sessions[1].day,19);assert.equal(p.sessions[1].practiceId,'sensate-1');assert.equal(p.sessions[1].comfortable,true);assert.equal(p.dayDone[16],'2026-11-18');assert(p.dayDone[19]);assert.deepEqual(p.checkpoints,{14:{source:'central',at:'prior'}});h.stop();
});

test('phase II requires a real completed comfortable phase I, low pressure and current readiness',async()=>{
 const prior={id:'prior-16',day:16,practiceId:'sensate-1',status:'completed',comfortable:true};
 const h=harness(19,{program:{sessions:[prior]}});await h.open();assert.equal(h.init().safety.phase2Allowed,true);assert.equal(h.init().record.practiceId,'sensate-2');
 await h.msg('SPM_WEEK3_COMPLETE',completed(h,{ready:false}));assert.equal(h.saves.length,0);
 await h.msg('SPM_WEEK3_COMPLETE',completed(h,{ready:true,variant:'partner',partnerConsent:false}));assert.equal(h.saves.length,0);
 await h.msg('SPM_WEEK3_COMPLETE',completed(h,{ready:true,variant:'solo'}));assert.equal(h.completions.length,1);assert.equal(h.program().sessions[1].practiceId,'sensate-2');assert.equal(h.program().sessions[1].ready,true);assert.equal(h.program().sessions[1].comfortable,undefined);h.stop();
 for(const patch of [{pressure:7},{pressure:null},{health:['meds']},{otherClinical:true}]){
  const k=harness(19,{program:{sessions:[prior]},state:patch});await k.open();assert.equal(k.init().safety.phase2Allowed,false);assert.equal(k.init().record.practiceId,'sensate-1');k.stop();
 }
 for(const status of ['paused','interrupted']){const k=harness(19,{program:{sessions:[{...prior,status}]}});await k.open();assert.equal(k.init().safety.phase1Done,false);k.stop()}
 for(const comfortable of [false,null,undefined]){const k=harness(19,{program:{sessions:[{...prior,comfortable,comfort:10}]}});await k.open();assert.equal(k.init().safety.phase1Done,false);k.stop()}
});

test('host rechecks clinical safety when saving instead of trusting initialization or iframe pressure',async()=>{
 const h=harness(19,{program:{sessions:[{id:'old',day:16,practiceId:'sensate-1',status:'completed',comfortable:true}]}});await h.open();assert.equal(h.init().safety.phase2Allowed,true);
 h.updateState({pressure:8});await h.msg('SPM_WEEK3_COMPLETE',completed(h,{ready:true,before:1}),{data:{program:{pressure:1,acute:false},safety:{pressure:1},programChanged:['pressure','acute']}});
 assert.equal(h.saves.length,0);assert.equal(h.completions.length,0);assert.equal(h.messages.at(-1).safety.pressure,8);h.stop();
 const k=harness(15,{state:{pressure:8}});await k.open();await k.msg('SPM_WEEK3_COMPLETE',completed(k,{ladder:3}));assert.equal(k.saves.length,0);await k.msg('SPM_WEEK3_COMPLETE',completed(k,{ladder:1}));assert.equal(k.completions.length,1);k.stop();
 const n=harness(15,{state:{health:['meds']}});await n.open();await n.msg('SPM_WEEK3_COMPLETE',completed(n,{ladder:1}));assert.equal(n.saves.length,0);await n.msg('SPM_WEEK3_COMPLETE',completed(n,{ladder:0}));assert.equal(n.completions.length,1);n.stop();
});

test('a newly restricted activity can close to Today with an interrupted draft and no unsafe preference update',async()=>{
 const cases=[
  {day:19,state:{pressure:8},record:{ready:true}},
  {day:17,state:{health:['meds']}},
  {day:16,state:{health:['acute']}},
  {day:15,state:{pressure:8},record:{ladder:3}},
  {day:18,central:true}
 ];
 for(const scenario of cases){
  const prior={id:'previous-day16',day:16,practiceId:'sensate-1',status:'completed',comfortable:true};
  const h=harness(scenario.day,{program:{sessions:[prior],ladder:0}});await h.open();
  const record=completed(h,{fields:{reflection:'Avance antes de la pausa'},...scenario.record});
  await h.msg('SPM_WEEK3_CHANGE',record);
  if(scenario.state)h.updateState(scenario.state);
  if(scenario.central){h.context({safety:'urgent'});h.restrict(true);h.watch();assert.equal(h.frame().isConnected,true,'a safety pause must preserve the ability to close')}
  await h.msg('SPM_WEEK3_CLOSE',record,{data:{program:{context:'No aplicar durante pausa',ranking:['fantasy']},programChanged:['context','ranking']}});
  assert.equal(h.returned,1,'return to Today for day '+scenario.day);assert.equal(h.frame().isConnected,false);assert.equal(h.completions.length,0);
  assert.deepEqual(h.program().sessions,[prior]);assert.deepEqual(h.program().dayDone,{});assert.deepEqual(h.program().ranking,['massage']);assert.equal(h.state().context,'Contexto anterior');
  const draft=JSON.parse(h.program().detailNotes['desireWeek3TouchDay'+scenario.day]);assert.equal(draft.status,'interrupted');assert.equal(draft.fields.reflection,'Avance antes de la pausa');assert.equal(draft.confirm,false);assert.equal(draft.ready,false);assert.equal(draft.completedAt,null);
  if(scenario.day===15){assert.equal(draft.ladder,null);assert.equal(h.program().ladder,0)}h.stop();
 }
});

test('READY retries resend INIT with the same ID and latest unsaved draft while refreshing host safety',async()=>{
 const h=harness(20);await h.open();const first=plain(h.init());
 h.messages.length=0;await h.msg('SPM_WEEK3_READY');assert.equal(h.init().record.id,first.record.id);assert.deepEqual(h.init().record,first.record);assert.equal(h.saves.length,0);
 const draft={...first.record,step:3,hasStarted:true,fields:{reflection:'No perder esta respuesta'},before:0};
 await h.msg('SPM_WEEK3_CHANGE',draft,{data:{program:{context:'Contexto pendiente',detailNotes:{visual:'Nota pendiente'}},programChanged:['context','detailNotes']}});
 h.updateState({pressure:8});await h.msg('SPM_WEEK3_READY');
 const retried=h.init();assert.equal(retried.record.id,first.record.id);assert.equal(retried.record.step,3);assert.equal(retried.record.before,0);assert.equal(retried.record.fields.reflection,'No perder esta respuesta');assert.equal(retried.program.context,'Contexto pendiente');assert.equal(retried.program.detailNotes.visual,'Nota pendiente');assert.equal(retried.safety.pressure,8);assert.equal(h.saves.length,0);h.stop();
});

test('host review criteria match the current clinical evaluate implementation',()=>{
 const clinical=fs.readFileSync(path.join(root,'labs/desire/src/lib/desire-data.ts'),'utf8');
 const monthly=clinical.match(/^export const perMonth = .* => (.*);$/m)?.[1];
 const frequency=clinical.match(/export const freqChange = \(s: DesireState\) => \{([\s\S]*?)\n\};/)?.[1];
 const evaluation=clinical.match(/export function evaluate\(s: DesireState\): Evaluation \{([\s\S]*?)\n\}/)?.[1];
 assert(monthly&&frequency&&evaluation,'read the current clinical functions rather than a copied test implementation');
 const canonical={};vm.runInNewContext(`const perMonth=f=>${monthly};const freqChange=s=>{${frequency}};this.evaluate=s=>{${evaluation.replace('reasons: string[]','reasons')}};`,canonical);
 const base={baseline:{desire:5,energy:5},freqBefore:{value:2,unit:'month'},freqNow:{value:2,unit:'month'},health:[],barriers:[],morning:'',night:'',quality:'',maintain:'',onset:'',fantasiesTrend:'',pressure:4,distress:false,otherClinical:false};
 const cases=[{}, {health:['meds']},{barriers:['meds']},{health:['rapid']},{health:['acute']},{distress:true},{otherClinical:true},
  {quality:'down',onset:'<3m'},{maintain:'yes',onset:'3-12m'},{quality:'down',onset:'>1y'},
  {freqBefore:{value:100,unit:'month'},freqNow:{value:50,unit:'month'},morning:'yes'},
  {freqBefore:{value:100,unit:'month'},freqNow:{value:51,unit:'month'},morning:'yes'},
  {freqBefore:{value:0,unit:'year'},freqNow:{value:0,unit:'month'},morning:'yes'},
  {freqBefore:{value:12,unit:'year'},freqNow:{value:0.5,unit:'month'},night:'yes'},
  {baseline:{desire:3,energy:5},fantasiesTrend:'down',health:['mood','sleep']},
  {health:['fatigue','sleep','strength']},{baseline:{desire:5,energy:2},health:['strength','hair']},
  {health:['fatigue']},{health:['mood','sleep']},{pressure:10},
 ];
 const health=['fatigue','strength','hair','mood','sleep','interest'];
 for(let mask=0;mask<64;mask++)for(const morning of ['', 'yes'])cases.push({health:health.filter((_,i)=>mask&(1<<i)),morning});
 const h=harness();for(const [i,patch] of cases.entries()){
  const state={...plain(base),...patch},expected=canonical.evaluate(state),actual=h.win.SPM_DESIRE_WEEK3_BRIDGE.safetyFrom({safety:'none'},{sessions:[]},state,{});
  assert.equal(actual.review,expected.rec==='clinical-review','clinical review scenario '+i);assert.equal(actual.acute,expected.urgent,'urgent scenario '+i);
 }h.stop();
});

test('drafts, missing confirmation and early closes do not complete sessions or days',async()=>{
 const h=harness(17);await h.open();await h.msg('SPM_WEEK3_COMPLETE',completed(h,{confirm:false}));assert.equal(h.saves.length,0);
 await h.msg('SPM_WEEK3_COMPLETE',completed(h,{step:2}));assert.equal(h.saves.length,0);
 await h.msg('SPM_WEEK3_CHANGE',completed(h,{fields:{reflection:'Un avance sin cierre'}}));await h.flush();
 assert.equal(h.completions.length,0);assert.equal(h.program().sessions.length,0);assert.deepEqual(h.program().dayDone,{});assert.equal(JSON.parse(h.program().detailNotes.desireWeek3TouchDay17).status,'draft');h.stop();
});

test('explicit resource edits preserve other preferences, clinical arrays and unrelated records',async()=>{
 const h=harness(20,{program:{detailNotes:{visual:'Nota visual previa',unrelated:'Conservar'},conditions:['Mejor descanso','Más tiempo'],details:{tactile:['Contacto lento']},ranking:['massage','words'],rankPrefs:['massage','words']}});await h.open();
 await h.msg('SPM_WEEK3_COMPLETE',completed(h,{choices:{context_details:['privacy','time']}}),{data:{program:{context:'Privacidad y calma',conditions:['Menos distracciones'],ranking:['fantasy'],details:{tactile:'no es array'},detailNotes:{visual:'No sobrescribir'}},programChanged:['context']}});
 assert.equal(h.state().context,'Privacidad y calma');assert.equal(h.state().pressure,4);assert.deepEqual(h.program().conditions,['Mejor descanso','Más tiempo']);assert.deepEqual(h.program().ranking,['massage','words']);assert.deepEqual(h.program().details,{tactile:['Contacto lento']});assert.equal(h.program().detailNotes.visual,'Nota visual previa');assert.equal(h.program().detailNotes.unrelated,'Conservar');h.stop();
 const k=harness(21,{program:{detailNotes:{visual:'Antes',unrelated:'No borrar'},details:{visual:['Apariencia']}}});await k.open();
 await k.msg('SPM_WEEK3_COMPLETE',completed(k,{localAfter:3}),{data:{program:{ranking:['touch','words'],rankPrefs:['touch','words','fantasy'],detailNotes:{visual:'Después'}},programChanged:['ranking','rankPrefs','detailNotes']}});
 assert.deepEqual(k.program().ranking,['touch','words']);assert.deepEqual(k.program().details,{visual:['Apariencia']});assert.equal(k.program().detailNotes.visual,'Después');assert.equal(k.program().detailNotes.unrelated,'No borrar');assert.equal(k.program().sessions[0].metricKey,'local');assert.equal(k.program().sessions[0].after,3);assert.equal(k.program().checkpoints,undefined);k.stop();
});

test('expired day, user or detached iframe cannot leak draft answers into another context',async()=>{
 for(const change of [{day:17},{userId:'other-user'},{planId:'other-plan'}]){
  const h=harness(16);await h.open();const record=completed(h,{fields:{reflection:'Respuesta privada sintética'}});await h.msg('SPM_WEEK3_CHANGE',record);h.context(change);await h.flush();assert.equal(h.saves.length,0);h.watch();assert.equal(h.frame().isConnected,false);h.stop();
 }
 const h=harness(16);await h.open();const record=completed(h);h.frame().remove();await h.msg('SPM_WEEK3_COMPLETE',record);assert.equal(h.completions.length,0);assert.equal(h.saves.length,0);h.stop();
});

test('a failed daily close retries idempotently without duplicate completed sessions',async()=>{
 const h=harness(16);await h.open();h.dailyFail(true);const record=completed(h,{comfortable:true,comfortableAnswered:true});await h.msg('SPM_WEEK3_COMPLETE',record);
 assert.equal(h.program().sessions.length,1);assert.equal(h.completions.length,0);assert.equal(h.frame().isConnected,true);assert(h.messages.some(x=>x.type==='SPM_WEEK3_ERROR'));
 h.dailyFail(false);await h.msg('SPM_WEEK3_COMPLETE',record);assert.equal(h.program().sessions.length,1);assert.equal(h.completions.length,1);assert.equal(h.frame().isConnected,false);h.stop();
});

test('reopening a completed day creates a new draft and preserves every previous session',async()=>{
 const h=harness(19,{program:{sessions:[{id:'prior16',day:16,practiceId:'sensate-1',status:'completed',comfortable:true}]}});await h.open();
 await h.msg('SPM_WEEK3_COMPLETE',completed(h,{ready:true,variant:'solo',fields:{reflection:'Fase II anterior'}}));
 const prior=plain(h.program().sessions),firstId=prior[1].id;
 await h.open();assert.equal(h.init().record.status,'draft');assert.notEqual(h.init().record.id,firstId);assert.equal(h.init().record.confirm,false);assert.equal(h.init().record.ready,false);assert.equal(h.init().record.before,null);
 await h.msg('SPM_WEEK3_COMPLETE',completed(h,{practiceId:'sensate-1',comfortable:true,comfortableAnswered:true,fields:{reflection:'Repetición de fase I'}}));
 const now=h.program().sessions;assert.equal(now.length,3);assert.deepEqual(now.slice(0,2),prior);assert.equal(now[2].day,19);assert.equal(now[2].practiceId,'sensate-1');assert.notEqual(now[2].id,firstId);h.stop();
});

test('other days, library access and existing clinical fallback keep their original route',async()=>{
 const h=harness(14);assert.equal(await h.win.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),true);assert.equal(h.messages[0].type,'legacy');h.stop();
 const k=harness(17,{state:{health:['meds']}});await k.open();assert(k.messages.some(x=>x.type==='legacy'));assert.equal(k.saves.length,0);k.stop();
 const n=harness(16,{state:{health:['acute']}});await n.open();assert(n.messages.some(x=>x.type==='legacy'));assert.equal(n.saves.length,0);n.stop();
 const q=harness(18);assert.equal(await q.win.SPM_DESIRE_LAB.open({origin:'library'}),true);assert(q.messages.some(x=>x.type==='legacy'));q.stop();
});

test('live and review include the same week 3 bridge after week 2, without changing commercial routes',()=>{
 const live=fs.readFileSync(path.join(root,'premium-v2/live.html'),'utf8'),review=fs.readFileSync(path.join(root,'premium-v2/program-review-v1.js'),'utf8'),html=fs.readFileSync(path.join(root,'premium-v2/revision-programas-28-dias.html'),'utf8');
 const name='desire-week3-bridge-v1.js?v=20261127-technical';assert(live.includes(name));assert(review.includes(name));
 assert(live.indexOf(name)>live.indexOf('desire-week2-bridge-v1.js'));assert(review.indexOf(name)>review.indexOf('desire-week2-bridge-v1.js'));
 const stylesheet=live.match(/href="(desire-week3-bridge-v1\.css\?v=[^"]+)"/)?.[1];assert.ok(stylesheet);assert.ok(html.includes('href="'+stylesheet+'"'));
 assert(fs.readFileSync(path.join(root,'vercel.json'),'utf8').includes('program-paused.html'));
});
