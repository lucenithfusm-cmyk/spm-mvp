/* SPM Digital Wellness · Deseo días 22–28.
 * Las pantallas usan el día y la seguridad del programa que las abre.
 * Solo el cierre confirmado registra la práctica; los borradores no completan días.
 */
(()=>{'use strict';
if(window.SPM_DESIRE_WEEK4_BRIDGE)return;
const lab=window.SPM_DESIRE_LAB,records=window.SPM_DESIRE_RECORDS;
const catalogue=window.SPM_WEEK4_CATALOG;
if(!lab||!records||!catalogue?.practices)return;
const PRACTICES=catalogue.practices;
const legacyOpen=lab.open.bind(lab),legacyClose=lab.close.bind(lab);
const DAYS=new Set([22,23,24,25,26,27,28]);
const IDS={22:'',23:'flex-script',24:'desire-curve',25:'if-then',26:'continuity-goals',27:'autonomous-rehearsal',28:'final-compare'};
const NOTE='desireWeek4TouchDay';
const RANK=['partner-visual','touch','words','massage','fantasy','foreplay','ambience','other'];
const CHANNELS=['visual','tactile','verbal','fantasy','context','partnerFavors'];
const CONDITIONS=['Menos presión','Más tiempo','Mejor descanso','Más conexión','Menos distracciones'];
const GOALS=catalogue.continuityGoals;
const ACTIONS=['stress','stimuli','talk','foreplay','fantasy','food','exercise','context','other'];
const EXTRA=['desire','curiosity','openness','enjoyment','pressure','connection'];
const METRIC_KEYS=['desire','frequency','fantasies','erections','energy','closeness','satisfaction','pressure'];
const DETAIL_OPTIONS={visual:['Miradas','Ropa','Luz','Actitud','Escenas'],tactile:['Caricias lentas','Masajes','Contacto piel con piel','Zonas','Ritmo','Presión'],verbal:['Elogios','Tono de voz','Susurros','Conversación','Palabras sugerentes'],fantasy:['Recuerdos','Escenas imaginadas','Lecturas','Novedad imaginada'],context:['Privacidad','Sin interrupciones','Cambio de ambiente','Juego previo largo'],partnerFavors:['Atención plena','Iniciativa','Comunicación abierta']};
const FIELD_KEYS=['reflection','demand_phrase','flexible_phrase','if_tired','if_pressure','if_low_interest','continuity_keep','continuity_space','supporting_condition'];
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
const scopeOf=c=>c?.userId&&c?.planId?String(c.userId)+':'+String(c.planId):'';
const main=c=>window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(a=>a?.id==='main');
const eligible=(c,o)=>o?.origin==='dailyPlan'&&c?.primary==='desire'&&DAYS.has(Number(c.day));
const object=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const text=(v,max=400)=>typeof v==='string'?v.slice(0,max):'';
const list=v=>Array.isArray(v)?v.filter(x=>typeof x==='string'):[];
const pick=(v,choices,max=choices.length)=>[...new Set(list(v).filter(x=>choices.includes(x)))].slice(0,max);
const numeric=(v,max=10)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max?v:null;
const number=v=>numeric(v,10);
const maximum=metric=>metric==='fantasies'?4:metric==='frequency'?60:10;
const measurement=(v,metric)=>numeric(v,maximum(metric));
const parse=v=>{try{return object(JSON.parse(typeof v==='string'?v:'{}'))}catch{return {}}};
const date=v=>typeof v==='string'&&Number.isFinite(Date.parse(v))?v:null;
const clone=v=>JSON.parse(JSON.stringify(v));

// Same clinical criteria as desire-data.evaluate; missing answers are never invented.
function needsReview(s){
 const health=list(s.health),h=new Set(health),barriers=list(s.barriers),b=object(s.baseline);
 const monthly=v=>{const f=object(v);return typeof f.value==='number'&&['week','month','year'].includes(f.unit)?(f.unit==='week'?f.value*4.33:f.unit==='year'?f.value/12:f.value):null};
 const before=monthly(s.freqBefore),after=monthly(s.freqNow),change=before>0&&after!==null?Math.round((after-before)/before*100):null;
 const drop=(change!==null&&change<=-50)||h.has('rapid')||(typeof b.desire==='number'&&b.desire<=3&&s.fantasiesTrend==='down');
 const spontaneous=s.morning==='yes'||s.night==='yes';
 const physical=['strength','muscle','hair','fat','height','fatigue'].filter(x=>h.has(x)).length;
 const mood=['mood','sleep','interest','work'].filter(x=>h.has(x)).length;
 const erectile=s.quality==='down'||s.maintain==='yes';
 return h.has('acute')||h.has('meds')||barriers.includes('meds')||(drop&&(spontaneous||physical+mood>=2))||
  (spontaneous&&physical>=2)||(erectile&&['<3m','3-12m'].includes(s.onset))||h.has('rapid')||
  (spontaneous&&erectile&&physical+mood>=2)||(((h.has('fatigue')&&h.has('sleep'))||(typeof b.energy==='number'&&b.energy<=2))&&physical>=2)||s.distress===true||s.otherClinical===true;
}
function safetyFrom(c,p,s,profile={}){
 const central=window.SPM_DAILY_PRACTICE?.safety?.(c)||lab.restriction?.(c)||(c?.safety==='urgent'?'urgent':c?.safety&&c.safety!=='none'?'review':'none');
 const acute=central==='urgent'||central==='unavailable'||p.acute===true||list(s.health).includes('acute');
 const review=central==='review'||profile.recommendation==='clinical-review'||needsReview(s);
 const pressure=number(s.pressure);
 const phase1Done=(Array.isArray(p.sessions)?p.sessions:[]).some(x=>x?.practiceId==='sensate-1'&&x.status==='completed'&&x.comfortable===true);
 const reason=acute?'Hay una alerta de salud activa':review?'Hay una revisión clínica pendiente':pressure===null?'No se ha registrado la presión actual':pressure>=7?'La presión registrada es elevada':!phase1Done?'No hay una fase I completada y marcada como cómoda':'';
 return {acute,review,pressure,phase1Done,phase2Allowed:!reason,reason};
}
// Practice metadata and narration come from the same approved catalogue as the Lab.
function apt(id,p,safety){const pr=PRACTICES[id];return !!pr&&!safety.acute&&(!safety.review||pr.safe===true)&&!(id==='reconnect-gradual'&&p.hasPartner!=='yes')&&(id!=='sensate-2'||safety.phase2Allowed);}
// Mirrors the priority weights in desire-engine.interpret using recorded answers.
function assignedFromState(s,safety){
 const st=new Set(list(s.stimuli)),h=new Set(list(s.health)),barriers=list(s.barriers),brakes=list(s.brakes),b=object(s.baseline),rel=object(s.rel),pool=[];
 const add=(id,role,w)=>pool.push({id,role,w});
 const fi=['Nunca','Rara vez','A veces','Frecuente','Muy frecuente'].indexOf(s.fantasyFreq);
 const monthly=v=>{const f=object(v);return typeof f.value==='number'&&['week','month','year'].includes(f.unit)?(f.unit==='week'?f.value*4.33:f.unit==='year'?f.value/12:f.value):null};
 const before=monthly(s.freqBefore),after=monthly(s.freqNow),change=before>0&&after!==null?Math.round((after-before)/before*100):null;
 if(st.has('visual'))add('visual-explore','driver',3);
 if(st.has('tactile')||st.has('slow')||st.has('zones')||list(s.zones).length)add('sensory-focus','driver',3+(st.has('slow')?1:0));
 if(st.has('verbal')||st.has('auditory'))add('verbal-script','driver',2);
 if(s.fantasiesNow==='yes'||fi>=2)add('fantasy-private','driver',2+(change!==null&&change<=-25?1:0));
 if(typeof b.desire==='number'&&b.desire<=4||s.fantasiesTrend==='down'||fi>=0&&fi<=1)add('responsive-window','driver',3);
 if(s.enjoyment==='no'||s.enjoyment==='sometimes'||typeof b.satisfaction==='number'&&b.satisfaction<=4)add('pleasure-lowpressure','driver',4);
 if(change!==null&&change<=-25)add('reconnect-gradual','transfer',3);
 const stress=barriers.includes('stress')||barriers.includes('pressure')||brakes.some(x=>['Miedo a fallar','Autoexigencia','Estrés laboral','Preocupaciones'].includes(x));
 if(stress||s.pressure>=6||b.stress>=7)add('micro-regulation','modifier',2+(s.pressure>=6?1:0)+(b.stress>=7?1:0));
 if(barriers.includes('tired')||h.has('fatigue')||h.has('sleep')||typeof b.energy==='number'&&b.energy<=4||typeof b.sleep==='number'&&b.sleep<=4)add('lifestyle-modifiers','modifier',2+(typeof b.energy==='number'&&b.energy<=3?1:0));
 if(typeof rel.communication==='number'&&rel.communication<=4||typeof rel.closeness==='number'&&rel.closeness<=4)add('connection-talk','transfer',3);
 if(!pool.some(x=>x.role==='driver'))add('responsive-window','driver',1);
 const filtered=pool.filter(x=>!safety.review||PRACTICES[x.id].safe).sort((a,b)=>b.w-a.w);
 if(safety.review&&!filtered.some(x=>x.id==='micro-regulation'))filtered.push({id:'micro-regulation',role:'modifier',w:1});
 if(safety.review&&!filtered.some(x=>x.id==='sensory-focus'))filtered.push({id:'sensory-focus',role:'driver',w:0});
 const out=[];for(const role of ['driver','modifier','transfer']){const x=filtered.find(x=>x.role===role&&!out.includes(x.id));if(x)out.push(x.id)}
 for(const x of filtered)if(out.length<3&&!out.includes(x.id))out.push(x.id);
 return out;
}
function choicesFor(p,s,safety,excludeId=''){
 const agg={};
 for(const row of Array.isArray(p.sessions)?p.sessions:[]){const pr=PRACTICES[row?.practiceId];
  if(row?.id===excludeId||row?.status!=='completed'||!pr||pr.reflective||['pressure','local'].includes(pr.metric)||row.metricKey!==pr.metric)continue;
  const before=measurement(row.before,pr.metric),after=measurement(row.after,pr.metric);
  if(before===null||after===null)continue;(agg[pr.id]??=[]).push(after-before);
 }
 const ranked=Object.entries(agg).map(([id,values])=>({id,gain:values.reduce((a,b)=>a+b,0)/values.length})).filter(x=>x.gain>0).sort((a,b)=>b.gain-a.gain);
 // Match bestActivators(p,2) before applying today's restrictions; never refill with invented wins.
 const candidates=ranked.slice(0,2).map(x=>x.id).filter(id=>apt(id,p,safety));
 const assigned=candidates[0]||assignedFromState(s,safety).find(id=>apt(id,p,safety))||(apt('responsive-window',p,safety)?'responsive-window':null);
 return {candidates,assigned};
}
function clean(day,src,id){
 const v=object(src),fields={},choices=object(v.choices),na=object(v.na);
 for(const key of FIELD_KEYS)if(Object.hasOwn(v.fields||{},key))fields[key]=text(v.fields[key],4096);
 const pid=day===22&&typeof v.practiceId==='string'&&PRACTICES[v.practiceId]?v.practiceId:IDS[day],metric=PRACTICES[pid]?.metric||'local';
 return {id,day,practiceId:pid,status:['completed','paused','interrupted'].includes(v.status)?v.status:'draft',step:Math.max(1,Math.min(4,Math.floor(Number(v.step)||1))),
  before:measurement(v.before,metric),after:measurement(v.after,metric),localAfter:number(v.localAfter),extra:Object.fromEntries(EXTRA.map(k=>[k,number(v.extra?.[k])])),
  comfort:number(v.comfort),comfortable:typeof v.comfortable==='boolean'?v.comfortable:null,comfortableAnswered:v.comfortableAnswered===true,
  ready:v.ready===true,confirm:v.confirm===true,partnerConsent:v.partnerConsent===true,runnerCompleted:v.runnerCompleted===true,
  runnerStarted:v.runnerStarted===true||v.runnerCompleted===true||Number(v.runnerStep)>0,reflectionSource:v.reflectionSource==='manual'?'manual':'auto',
  runnerStep:Math.max(0,Math.min(20,Math.floor(Number(v.runnerStep)||0))),runnerOpen:v.runnerOpen===true,
  na:Object.fromEntries(['before','after','localAfter','comfort',...EXTRA.map(k=>'extra.'+k)].map(k=>[k,na[k]===true])),
  variant:['solo','partner'].includes(v.variant)?v.variant:null,
  choices:{continuity_goals:pick(choices.continuity_goals,GOALS),known_stimulus:['touch','image','sound','memory'].includes(choices.known_stimulus)?choices.known_stimulus:null},
  fields,elapsed:Math.max(0,Math.min(86400,Number(v.elapsed)||0)),running:false,lastTick:0,hasStarted:v.hasStarted===true,
  createdAt:date(v.createdAt)||new Date().toISOString(),updatedAt:new Date().toISOString(),completedAt:date(v.completedAt)};
}
function baselineFor(p){const b=object(p.baseline);return typeof b.at==='string'?{at:b.at,metrics:Object.fromEntries(METRIC_KEYS.map(k=>[k,measurement(b.metrics?.[k],k)]))}:null;}
function checkinsFor(s){return(Array.isArray(s.checkins)?s.checkins:[]).filter(v=>v&&['D14','D28'].includes(v.day)).map(v=>({day:v.day,date:text(v.date,30),metrics:Object.fromEntries(METRIC_KEYS.map(k=>[k,measurement(v.metrics?.[k],k)]))}));}
function programFor(p,s){
 return {context:text(s.context,140),conditions:list(p.conditions),routineStep:Math.max(0,Math.min(3,Number(p.routineStep)||0)),ranking:list(p.ranking).slice(0,5),rankPrefs:list(p.rankPrefs),
  details:Object.fromEntries(Object.entries(object(p.details)).map(([k,v])=>[k,list(v).map(x=>text(x,140))])),detailNotes:Object.fromEntries(CHANNELS.map(k=>[k,text(p.detailNotes?.[k])])),
  hasPartner:['yes','no'].includes(p.hasPartner)?p.hasPartner:'na',nextPractice:['accel','brake','talk'].includes(p.nextPractice)?p.nextPractice:'',actions:pick(s.actions,ACTIONS,3),
  continuity:{goals:pick(p.continuity?.goals,GOALS,2),keep:text(p.continuity?.keep,300),space:text(p.continuity?.space,300)},baseline:baselineFor(p)};
}
function cleanProgram(src,changed){
 const v=object(src),keys=pick(changed,['context','conditions','routineStep','ranking','rankPrefs','details','detailNotes','continuity','nextPractice','actions']),patch={};
 if(keys.includes('context')&&typeof v.context==='string')patch.context=text(v.context,140);
 if(keys.includes('conditions')&&Array.isArray(v.conditions))patch.conditions=pick(v.conditions,CONDITIONS);
 if(keys.includes('routineStep'))patch.routineStep=Math.max(0,Math.min(3,Math.floor(Number(v.routineStep)||0)));
 if(keys.includes('ranking')&&Array.isArray(v.ranking))patch.ranking=pick(v.ranking,RANK,5);
 if(keys.includes('rankPrefs')&&Array.isArray(v.rankPrefs))patch.rankPrefs=pick(v.rankPrefs,RANK);
 if(keys.includes('nextPractice')&&['','accel','brake','talk'].includes(v.nextPractice))patch.nextPractice=v.nextPractice;
 if(keys.includes('actions')){const actions=pick(v.actions,ACTIONS);if(actions.length>3)throw Error('Elige como máximo tres acciones en tu plan personal.');patch.actions=actions;}
 if(keys.includes('details'))patch.details=Object.fromEntries(CHANNELS.filter(k=>Array.isArray(v.details?.[k])).map(k=>[k,pick(v.details[k],DETAIL_OPTIONS[k])]));
 if(keys.includes('detailNotes'))patch.detailNotes=Object.fromEntries(CHANNELS.filter(k=>typeof v.detailNotes?.[k]==='string').map(k=>[k,text(v.detailNotes[k])]));
 if(keys.includes('continuity')){
  const c=object(v.continuity),goals=pick(c.goals,GOALS);
  if(goals.length>2)throw Error('Elige uno o dos objetivos de continuidad.');
  if(typeof c.keep==='string'&&c.keep.length>300||typeof c.space==='string'&&c.space.length>300)throw Error('Qué mantener y qué espaciar admiten hasta 300 caracteres cada uno.');
  patch.continuity={};if(Array.isArray(c.goals))patch.continuity.goals=goals;
  if(typeof c.keep==='string')patch.continuity.keep=c.keep;if(typeof c.space==='string')patch.continuity.space=c.space;
 }
 return patch;
}
function historyFor(p){return (Array.isArray(p.sessions)?p.sessions:[]).filter(v=>v&&typeof v==='object').map(v=>({
 id:text(v.id,150),day:Math.max(1,Math.min(28,Number(v.day)||1)),date:text(v.date,30),practiceId:text(v.practiceId,80),
 status:['completed','paused','interrupted'].includes(v.status)?v.status:'interrupted',variant:v.variant==='partner'?'partner':'solo',
 before:measurement(v.before,v.metricKey),after:measurement(v.after,v.metricKey),comfort:number(v.comfort),comfortable:typeof v.comfortable==='boolean'?v.comfortable:null,
 activeSec:Math.max(0,Number(v.activeSec)||0),metricKey:text(v.metricKey,30),metricLabel:text(v.metricLabel,100),reflection:text(v.reflection),
 ...(v.extra?{extra:Object.fromEntries(EXTRA.map(k=>[k,number(v.extra[k])]))}:{}),
 fields:{reflection:text(v.reflection)},completedAt:date(v.date),updatedAt:date(v.date)
}));}

let current=null;
function attached(m){
 if(!m||current!==m||!m.host.isConnected||m.iframe&&(!m.iframe.isConnected||!m.wrap?.isConnected))return false;
 const c=ctx();if(!eligible(c,{origin:'dailyPlan'})||Number(c.day)!==m.day||scopeOf(c)!==m.scope)return false;
 const active=window.SPM_DAILY_PRACTICE?.active?.();return !active||(active.id==='main'&&active.scope===m.scope&&Number(active.day)===m.day);
}
function allowed(m){const c=ctx(),a=main(c);return attached(m)&&a?.kind==='desire'&&!window.SPM_DAILY_PRACTICE?.restricted?.(c,a)}
function send(m,type,fields={}){if(m.iframe?.isConnected)m.iframe.contentWindow?.postMessage({type,sid:m.sid,day:m.day,...fields},location.origin)}
function dispose(m){if(!m)return;clearTimeout(m.timer);clearInterval(m.watch);window.removeEventListener('message',m.onMessage);m.iframe?.remove();m.wrap?.remove();if(current===m)current=null}
function checkRecord(m,v,safety,complete,p,s){
 if(safety.acute)throw Error('La práctica está en pausa por una alerta de salud. Vuelve a Hoy.');
 if(v.practiceId&&!apt(v.practiceId,p,safety))throw Error('Esta práctica no está disponible según tus condiciones actuales. Vuelve a Hoy para revisar tu ruta.');
 if(m.day===22&&v.runnerStarted&&!v.practiceId)throw Error('Elige una práctica real para este intento.');
 if(m.day===22&&v.practiceId){const picks=choicesFor(p,s,safety,m.recordId);if(![...picks.candidates,picks.assigned].includes(v.practiceId))throw Error('La propuesta cambió con tus registros. Vuelve a abrir este día para actualizarla.');}
 if((v.fields.reflection||'').length>400)throw Error('Tu reflexión admite hasta 400 caracteres en total. Revisa el texto antes de guardar.');
 if((v.fields.continuity_keep||'').length>300||(v.fields.continuity_space||'').length>300)throw Error('Qué mantener y qué espaciar admiten hasta 300 caracteres cada uno.');
 if(v.choices.continuity_goals.length>2)throw Error('Elige como máximo dos objetivos de continuidad.');
 if(!complete)return;
 if(v.confirm!==true||v.step!==4)throw Error('Confirma que realizaste la actividad en la pantalla de cierre.');
 if(m.day===22&&(!v.practiceId||v.runnerCompleted!==true))throw Error('Abre y realiza una de tus prácticas antes de guardar el día.');
 if(v.practiceId==='sensate-2'&&v.ready!==true)throw Error('Confirma que hoy deseas ampliar y sabes que puedes parar.');
 if(v.practiceId==='sensate-2'&&v.variant==='partner'&&v.partnerConsent!==true)throw Error('Para ampliar en pareja, confirma que ambos quieren hacerlo.');
 if(v.practiceId==='reconnect-gradual'&&v.variant!=='partner')throw Error('Esta práctica requiere una propuesta compartida con tu pareja.');
}
function mergeProgram(p,s,patch){
 for(const key of ['context','actions'])if(Object.hasOwn(patch,key))s[key]=patch[key];
 for(const key of ['conditions','routineStep','ranking','rankPrefs','nextPractice'])if(Object.hasOwn(patch,key))p[key]=patch[key];
 if(Object.hasOwn(patch,'ranking'))p.rankPrefs=[...new Set([...list(p.rankPrefs),...patch.ranking])];
 if(patch.details)p.details={...object(p.details),...patch.details};
 if(patch.detailNotes)p.detailNotes={...object(p.detailNotes),...patch.detailNotes};
 if(patch.continuity)p.continuity={...object(p.continuity),...patch.continuity};
}
function addSession(p,m,v){
 const now=new Date().toISOString(),pr=PRACTICES[v.practiceId];
 if(!pr)throw Error('La práctica no se ha seleccionado.');
 const item={id:m.recordId,day:m.day,date:now.slice(0,10),practiceId:v.practiceId,variant:v.variant==='partner'?'partner':'solo',status:'completed',activeSec:Math.round(v.elapsed),metricKey:pr.metric,metricLabel:pr.metricLabel,before:v.before,after:[25,26,28].includes(m.day)?v.localAfter:v.after,reflection:v.fields.reflection||''};
 if(m.day===24){item.before=null;item.after=null;item.extra={...v.extra};}
 if(v.practiceId==='sensate-1'||v.practiceId==='sensate-2')item.comfort=v.comfort;
 if(v.practiceId==='sensate-1')item.comfortable=v.comfortableAnswered?v.comfortable:null;
 if(v.practiceId==='sensate-2')item.ready=v.ready;
 const all=Array.isArray(p.sessions)?p.sessions:[],i=all.findIndex(x=>x?.id===m.recordId);
 p.sessions=i<0?[...all,item]:all.map((x,n)=>n===i?item:x);
 p.dayDone={...object(p.dayDone),[m.day]:object(p.dayDone)[m.day]||now.slice(0,10)};
 v.status='completed';v.completedAt=now;
}
function enqueue(m,completed=false,closing=false){
 const record=clone(m.latest),patch=clone(m.programPatch);
 const job=async()=>{
  const valid=closing?attached:allowed;
  if(!valid(m))throw Error('La sesión cambió. Vuelve a abrir tu práctica.');
  const bundle=await records.read(m.scope);if(!valid(m))throw Error('La sesión cambió durante el guardado.');
  const p=parse(bundle['spm-desire-program']),s=parse(bundle['spm-desire-state']);
  const profile=parse(bundle['spm-desire-profile']),safety=safetyFrom(ctx(),p,s,profile);m.safety=safety;m.lastData={p,s,profile};
  let interrupted=closing&&!allowed(m);
  try{checkRecord(m,record,safety,completed,p,s)}catch(error){if(!closing)throw error;interrupted=true}
  // Leaving an activity is always possible in the same user/plan/day. If its
  // indication changed, keep an interrupted draft without applying new choices
  // or preferences, adding a completed session, or completing the calendar day.
  if(interrupted){record.status='interrupted';record.confirm=false;record.ready=false;record.completedAt=null}
  else mergeProgram(p,s,patch);
  if(completed)addSession(p,m,record);
  p.detailNotes={...object(p.detailNotes),[NOTE+m.day]:JSON.stringify(record)};
  const next={...bundle,'spm-desire-program':JSON.stringify(p)};
  if(!interrupted&&['context','actions'].some(k=>Object.hasOwn(patch,k)))next['spm-desire-state']=JSON.stringify(s);
  if(!valid(m))throw Error('La sesión cambió antes de guardar.');
  await records.save(next,m.scope,m.day);
  if(completed||interrupted)m.latest=record;
  if(completed)m.completedVerified=true;
 };
 m.queue=m.queue.catch(()=>{}).then(job);return m.queue;
}
function failure(m,error){send(m,'SPM_WEEK4_ERROR',{message:error?.message||'No pudimos guardar. Conserva esta pantalla y reintenta.',safety:m.safety})}
function autosave(m){clearTimeout(m.timer);m.timer=setTimeout(()=>{if(allowed(m)&&m.latest)void enqueue(m).catch(error=>failure(m,error))},700)}
function setLatest(m,v,closing=false){
 if(m.resourceActive||!(closing?attached(m):allowed(m))||!m.initialized||!v.record||typeof v.record!=='object'||Array.isArray(v.record)||v.record.day!==m.day||JSON.stringify(v).length>40000)return false;
 if(m.day===22&&v.record.practiceId&&!PRACTICES[v.record.practiceId])throw Error('Elige una práctica real para este intento.');
 const cleanValue=clean(m.day,v.record,m.recordId),patch=cleanProgram(v.program,v.programChanged);
 if(!closing){const last=m.lastData||{};checkRecord(m,cleanValue,m.safety,false,last.p||{},last.s||{});}
 if(m.day===22&&m.latest?.runnerStarted&&m.latest.practiceId!==cleanValue.practiceId)throw Error('Este intento ya corresponde a una práctica. Guarda o cierra antes de elegir otra.');
 if(!m.completedVerified&&cleanValue.status==='completed'){cleanValue.status='draft';cleanValue.completedAt=null}
 m.latest=cleanValue;m.programPatch={...m.programPatch,...patch};
 return true;
}
async function flush(m,closing=false){clearTimeout(m.timer);if(m.latest&&m.initialized)await enqueue(m,false,closing);else await m.queue}
async function returnToToday(m,reason=''){
 dispose(m);if(!m.host.isConnected)return false;
 const daily=window.SPM_DAILY_PRACTICE;await daily?.open?.({focus:false});
 const c=ctx();
 if(reason==='report'&&m.day===28&&scopeOf(c)===m.scope&&Number(c?.day)===m.day&&c?.primary==='desire'&&typeof daily?.launch==='function'){
  const report=daily.assignments?.(c)?.find(a=>a?.id==='program-checkpoint'&&a.kind==='program-checkpoint');
  if(report&&!daily.restricted?.(c,report))await daily.launch(report.id);
 }
 return true;
}
async function closeActive(m,reason=''){
 if(!attached(m)||m.busy)return false;m.busy=true;
 try{await flush(m,true);if(!attached(m))return false;await returnToToday(m,reason);return true}catch(error){failure(m,error);return false}finally{m.busy=false}
}
async function complete(m){
 if(!allowed(m)||m.busy||!m.latest)return false;m.busy=true;
 try{
  clearTimeout(m.timer);await enqueue(m,true);if(!allowed(m))return false;
  const ok=await window.SPM_DAILY_PRACTICE.saveActivity('main',{day:m.day,confirmed:true,source:'desire-lab',practiceId:m.latest.practiceId,desireWeek4TouchVersion:1,activeSec:Math.round(m.latest.elapsed)},m.scope,m.day);
  if(ok===false)throw Error('La práctica se guardó, pero falta confirmar el cierre del día. Pulsa Guardar para reintentar.');
  send(m,'SPM_WEEK4_DONE');await returnToToday(m);window.SPM_DAILY_PRACTICE?.showContinuation?.();return true;
 }catch(error){failure(m,error);return false}finally{m.busy=false}
}
async function initialize(m){
 if(m.loading)return;m.loading=true;
 try{
  const bundle=await records.read(m.scope);if(!attached(m))return;
  const p=parse(bundle['spm-desire-program']),s=parse(bundle['spm-desire-state']),profile=parse(bundle['spm-desire-profile']);
  m.safety=safetyFrom(ctx(),p,s,profile);m.lastData={p,s,profile};
  if(!m.initialized){
   const old=parse(p.detailNotes?.[NOTE+m.day]);
   const completedBefore=(Array.isArray(p.sessions)?p.sessions:[]).some(x=>x?.id===old.id&&x.day===m.day&&x.status==='completed');
   // A return to a completed day is a fresh, explicitly confirmed attempt. Its
   // previous session remains immutable in the diary, including phase I/II.
   const draft=completedBefore?{}:old;
   m.recordId=typeof draft.id==='string'&&draft.id.startsWith('desire-week4-d'+m.day+'-')?draft.id:'desire-week4-d'+m.day+'-'+m.sid;
   m.latest=clean(m.day,draft,m.recordId);m.completedVerified=false;
   if(m.latest.status==='completed'){m.latest.status='draft';m.latest.completedAt=null}
    m.initialized=true;
  }
  // READY can be retried if INIT was lost. Keep the active draft and its ID,
  // merge only already-requested resource edits, and refresh host safety/history.
  const program=programFor(p,s),patch=m.programPatch;
  for(const key of ['context','conditions','routineStep','ranking','rankPrefs','actions','nextPractice'])if(Object.hasOwn(patch,key))program[key]=clone(patch[key]);
  for(const key of ['details','detailNotes','continuity'])if(patch[key])program[key]={...program[key],...patch[key]};
  const picks=choicesFor(p,s,m.safety,m.recordId);
  send(m,'SPM_WEEK4_INIT',{record:m.latest,program,state:{context:program.context,stimuli:list(s.stimuli),zones:list(s.zones),actions:program.actions,checkins:checkinsFor(s)},safety:m.safety,history:historyFor(p),day22Candidates:picks.candidates.map(id=>PRACTICES[id]),assignedPractice:picks.assigned?PRACTICES[picks.assigned]:null});
 }catch(error){failure(m,error)}finally{m.loading=false}
}
async function openResource(m,target){
 const pr=PRACTICES[m.latest?.practiceId];
 const supported=new Set(['r:concepts','r:influence','r:map','r:ideas','r:partner','r:age','r:ladder','s:7','s:6','s:13','sensate']);
 if(m.day!==22||!supported.has(target)||!pr?.resourceLinks?.includes(target))throw Error('Este recurso no corresponde a la práctica actual.');
 if(!allowed(m)||m.busy||m.resourceActive)return false;
 m.busy=true;
 try{
  await flush(m);if(!allowed(m))return false;
  m.programPatch={};m.resourceActive=true;
  const ok=await legacyOpen({origin:'library'});if(ok===false)throw Error('No pudimos abrir el recurso. Tu avance está guardado.');
  if(!attached(m)){await legacyClose();return false;}
  const modal=document.querySelector('.spm-desire-modal[open]'),frame=modal?.querySelector('iframe');
  if(!frame)throw Error('No pudimos encontrar el recurso. Tu avance está guardado.');
  frame.src='/premium-v2/desire-lab/index.html?v=20261119-w4-resource1&origin=library&resource='+encodeURIComponent(target);
  send(m,'SPM_WEEK4_RESOURCE_OPENED',{target});return true;
 }catch(error){m.resourceActive=false;failure(m,error);return false}finally{m.busy=false}
}
async function onMessage(m,event){
 if(!attached(m)||event.origin!==location.origin||event.source!==m.iframe?.contentWindow)return;
 const v=event.data;if(!v||v.sid!==m.sid||v.day!==m.day||typeof v.type!=='string')return;
 try{
  if(v.type==='SPM_WEEK4_READY')await initialize(m);
  else if(v.type==='SPM_WEEK4_OPEN_RESOURCE'){if(setLatest(m,v))await openResource(m,v.target)}
  else if(v.type==='SPM_WEEK4_CHANGE'){if(setLatest(m,v))autosave(m)}
  else if(v.type==='SPM_WEEK4_COMPLETE'){if(setLatest(m,v))void complete(m)}
  else if(v.type==='SPM_WEEK4_CLOSE'||v.type==='SPM_WEEK4_EXIT_TO_TODAY'){if(setLatest(m,v,true))void closeActive(m,v.type==='SPM_WEEK4_EXIT_TO_TODAY'&&v.reason==='report'?'report':'')}
 }catch(error){failure(m,error)}
}
async function open(opts={}){
 if(current&&!attached(current))dispose(current);
 const c=ctx();if(!eligible(c,opts))return legacyOpen(opts);
 const scope=scopeOf(c),day=Number(c.day);if(!scope)return false;
 if(current&&!await closeActive(current))return false;
 if(document.querySelector('.spm-desire-modal[open]')&&await legacyClose()===false)return false;
 const host=document.getElementById('spmDailyWorkspace');if(!host?.isConnected)return false;
 const sid=window.crypto?.randomUUID?.()||'week4-'+Math.random().toString(36).slice(2);
 const m={scope,day,host,sid,recordId:'',wrap:null,iframe:null,queue:Promise.resolve(),latest:null,programPatch:{},safety:null,busy:false,loading:false,initialized:false,completedVerified:false,timer:0,watch:0,onMessage:null};current=m;
 if(!allowed(m)){current=null;return false}
 try{
  const bundle=await records.read(scope);if(!allowed(m))return false;
  m.safety=safetyFrom(ctx(),parse(bundle['spm-desire-program']),parse(bundle['spm-desire-state']),parse(bundle['spm-desire-profile']));
  if(m.safety.acute){dispose(m);return legacyOpen(opts)}
 }catch{dispose(m);return false}
 const wrap=document.createElement('section');wrap.className='spm-ds-week4-root';wrap.setAttribute('aria-label','Deseo, día '+day+' interactivo');
 const frame=document.createElement('iframe');frame.title='Deseo · Día '+day;frame.allow='autoplay';
 frame.src='/premium-v2/desire-week4-v1/index.html?spm=central&day='+day+'&sid='+encodeURIComponent(sid)+'&v=20261119-w34-fullscreen1';
 m.wrap=wrap;m.iframe=frame;m.onMessage=e=>void onMessage(m,e);window.addEventListener('message',m.onMessage);
 wrap.append(frame);host.replaceChildren(wrap);
 m.watch=setInterval(()=>{
  if(!attached(m)){dispose(m);return}
  if(m.resourceActive){if(!document.querySelector('.spm-desire-modal[open]')){m.resourceActive=false;void initialize(m);}return}
  if(!allowed(m)&&!m.pauseNotified){
   m.pauseNotified=true;const last=m.lastData||{};m.safety=safetyFrom(ctx(),last.p||{},last.s||{},last.profile||{});
   failure(m,Error('La práctica está en pausa. Puedes volver a Hoy conservando tu borrador.'));
  }
 },500);
 return true;
}
async function close(){if(current&&!attached(current))dispose(current);if(current?.resourceActive){if(await legacyClose()===false)return false;current.resourceActive=false;}return current?closeActive(current):legacyClose()}
function stop(){if(current)dispose(current)}
window.SPM_DESIRE_LAB={...lab,open,close};
window.SPM_DESIRE_WEEK4_BRIDGE={open,close,stop,eligible,allowed,clean,cleanProgram,safetyFrom,choicesFor,assignedFromState,historyFor};
})();
