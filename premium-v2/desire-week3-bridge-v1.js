/* SPM Digital Wellness · Deseo días 15–21.
 * Las pantallas usan el día y la seguridad del programa que las abre.
 * Solo el cierre confirmado registra la práctica; los borradores no completan días.
 */
(()=>{'use strict';
if(window.SPM_DESIRE_WEEK3_BRIDGE)return;
const lab=window.SPM_DESIRE_LAB,records=window.SPM_DESIRE_RECORDS;
if(!lab||!records)return;
const legacyOpen=lab.open.bind(lab),legacyClose=lab.close.bind(lab);
const DAYS=new Set([15,16,17,18,19,20,21]);
const IDS={15:'intimacy-ladder',16:'sensate-1',17:'foreplay-rhythm',18:'communicate-limits',19:'sensate-2',20:'context-design',21:'week-review'};
const METRICS={15:['pressure','Presión (0–10, menor = más calma)'],16:['satisfaction','Disfrute (0–10)'],17:['satisfaction','Disfrute (0–10)'],18:['closeness','Cercanía (0–10)'],19:['satisfaction','Disfrute (0–10)'],20:['desire','Deseo (0–10)'],21:['local','Interés hoy (0–10)']};
const NOTE='desireWeek3TouchDay';
const RANK=['partner-visual','touch','words','massage','fantasy','foreplay','ambience','other'];
const CHANNELS=['visual','tactile','verbal','fantasy','context','partnerFavors'];
const CONDITIONS=['Menos presión','Más tiempo','Mejor descanso','Más conexión','Menos distracciones'];
const FIELD_KEYS=['reflection','like_phrase','avoid_phrase','partner_solo','reflection_keep','reflection_adapt','reflection_next','partner_moment','partner_findings','partner_agreed'];
const REFLECTION_KEYS=['reflection','like_phrase','avoid_phrase','partner_solo','reflection_keep','reflection_adapt','reflection_next'];
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
const scopeOf=c=>c?.userId&&c?.planId?String(c.userId)+':'+String(c.planId):'';
const main=c=>window.SPM_DAILY_PRACTICE?.contentAssignment?.('desire',c)||window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(a=>a?.kind==='desire');
const eligible=(c,o)=>o?.origin==='dailyPlan'&&(c?.primary==='desire'||c?.scheduleVersion==='spm-20261127-v1')&&main(c)?.kind==='desire'&&DAYS.has(Number(main(c)?.sourceDay||c.day));
const object=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const text=(v,max=400)=>typeof v==='string'?v.slice(0,max):'';
const list=v=>Array.isArray(v)?v.filter(x=>typeof x==='string'):[];
const pick=(v,choices,max=choices.length)=>[...new Set(list(v).filter(x=>choices.includes(x)))].slice(0,max);
const number=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=10?v:null;
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
function clean(day,src,id){
 const v=object(src),fields={};
 for(const key of FIELD_KEYS)if(Object.hasOwn(v.fields||{},key))fields[key]=text(v.fields[key]);
 let left=400;for(const key of REFLECTION_KEYS)if(key in fields){fields[key]=fields[key].slice(0,left);left-=fields[key].length}
 const choices=object(v.choices),na=object(v.na);
 return {id,day,practiceId:day===19&&v.practiceId==='sensate-1'?'sensate-1':IDS[day],
  status:['completed','paused','interrupted'].includes(v.status)?v.status:'draft',step:Math.max(1,Math.min(4,Math.floor(Number(v.step)||1))),
  before:number(v.before),after:number(v.after),localAfter:number(v.localAfter),comfort:number(v.comfort),
  comfortable:typeof v.comfortable==='boolean'?v.comfortable:null,comfortableAnswered:v.comfortableAnswered===true,
  ready:v.ready===true,confirm:v.confirm===true,partnerConsent:v.partnerConsent===true,
  na:Object.fromEntries(['before','after','localAfter','comfort'].map(k=>[k,na[k]===true])),
  variant:['solo','partner'].includes(v.variant)?v.variant:null,route:['solo','partner'].includes(v.route)?v.route:null,
  ladder:Number.isInteger(v.ladder)&&v.ladder>=0&&v.ladder<=3?v.ladder:null,
  choices:{rhythm_cues:pick(choices.rhythm_cues,['slower','pause','vary']),rhythm_actions:pick(choices.rhythm_actions,['maintain','simple','pause']),context_details:pick(choices.context_details,['time','privacy','rest','ambience','screens','worries'])},
  fields,elapsed:Math.max(0,Math.min(86400,Number(v.elapsed)||0)),running:false,lastTick:0,hasStarted:v.hasStarted===true,
  createdAt:date(v.createdAt)||new Date().toISOString(),updatedAt:new Date().toISOString(),completedAt:date(v.completedAt)};
}
function programFor(p,s){
 const details=Object.fromEntries(Object.entries(object(p.details)).map(([k,v])=>[k,list(v).map(x=>text(x,140))]));
 return {context:text(s.context,140),conditions:list(p.conditions),ranking:list(p.ranking).slice(0,5),rankPrefs:list(p.rankPrefs),details,
  detailNotes:Object.fromEntries(CHANNELS.map(k=>[k,text(p.detailNotes?.[k])])),
  ladder:Number.isInteger(p.ladder)&&p.ladder>=0&&p.ladder<=3?p.ladder:null,
  hasPartner:['yes','no'].includes(p.hasPartner)?p.hasPartner:'na',
  partnerTask:{moment:text(p.partnerTask?.moment),findings:text(p.partnerTask?.findings),agreed:text(p.partnerTask?.agreed),solo:text(p.partnerTask?.solo),consent:p.partnerTask?.consent===true}};
}
function cleanProgram(src,changed){
 const v=object(src),keys=pick(changed,['context','conditions','ranking','rankPrefs','detailNotes']),patch={};
 if(keys.includes('context')&&typeof v.context==='string')patch.context=text(v.context,140);
 if(keys.includes('conditions')&&Array.isArray(v.conditions))patch.conditions=pick(v.conditions,CONDITIONS);
 if(keys.includes('ranking')&&Array.isArray(v.ranking))patch.ranking=pick(v.ranking,RANK,5);
 if(keys.includes('rankPrefs')&&Array.isArray(v.rankPrefs))patch.rankPrefs=pick(v.rankPrefs,RANK);
 if(keys.includes('detailNotes'))patch.detailNotes=Object.fromEntries(CHANNELS.filter(k=>typeof v.detailNotes?.[k]==='string').map(k=>[k,text(v.detailNotes[k])]));
 return patch;
}
function historyFor(p){return (Array.isArray(p.sessions)?p.sessions:[]).filter(v=>v&&typeof v==='object').map(v=>({
 id:text(v.id,150),day:Math.max(1,Math.min(28,Number(v.day)||1)),date:text(v.date,30),practiceId:text(v.practiceId,80),
 status:['completed','paused','interrupted'].includes(v.status)?v.status:'interrupted',variant:v.variant==='partner'?'partner':'solo',
 before:number(v.before),after:number(v.after),comfort:number(v.comfort),comfortable:typeof v.comfortable==='boolean'?v.comfortable:null,
 activeSec:Math.max(0,Number(v.activeSec)||0),metricKey:text(v.metricKey,30),metricLabel:text(v.metricLabel,100),reflection:text(v.reflection),
 fields:{reflection:text(v.reflection)},completedAt:date(v.date),updatedAt:date(v.date)
}));}

let current=null;
function attached(m){
 if(!m||current!==m||!m.host.isConnected||m.iframe&&(!m.iframe.isConnected||!m.wrap?.isConnected))return false;
 const c=ctx();if((c?.scheduleVersion||'legacy')!==m.scheduleVersion||(main(c)?.assignmentId||null)!==(m.assignmentId||null)||!eligible(c,{origin:'dailyPlan'})||Number(c.day)!==m.scheduledDay||scopeOf(c)!==m.scope)return false;
 const active=window.SPM_DAILY_PRACTICE?.active?.();return !active||(active.id===m.activityId&&active.scope===m.scope&&Number(active.day)===m.scheduledDay);
}
function allowed(m){const c=ctx(),a=main(c);return attached(m)&&a?.kind==='desire'&&!window.SPM_DAILY_PRACTICE?.restricted?.(c,a)}
function send(m,type,fields={}){if(m.iframe?.isConnected)m.iframe.contentWindow?.postMessage({type,sid:m.sid,day:m.day,...fields},location.origin)}
function dispose(m){if(!m)return;clearTimeout(m.timer);clearInterval(m.watch);window.removeEventListener('message',m.onMessage);m.iframe?.remove();m.wrap?.remove();if(current===m)current=null}
function checkRecord(m,v,safety,complete){
 if(safety.acute)throw Error('La práctica está en pausa por una alerta de salud. Vuelve a Hoy.');
 if(m.day===17&&safety.review)throw Error('Hay una revisión clínica pendiente. Vuelve a Hoy para abrir la alternativa de atención sin examen.');
 if(v.practiceId==='sensate-2'&&!safety.phase2Allowed)throw Error('La fase II no está disponible. Puedes repetir la fase I en este mismo día.');
 if(m.day===15&&v.ladder!==null&&((safety.review&&v.ladder>0)||(safety.pressure!==null&&safety.pressure>=7&&v.ladder>1)))throw Error('El contacto elegido está en pausa según las condiciones actuales. Elige uno más sencillo.');
 if(!complete)return;
 if(v.confirm!==true||v.step!==4)throw Error('Confirma que realizaste la actividad en la pantalla de cierre.');
 if(m.day===15&&v.ladder===null)throw Error('Elige el contacto que te resultó cómodo antes de cerrar.');
 if(v.practiceId==='sensate-2'&&v.ready!==true)throw Error('Confirma que hoy deseas ampliar y sabes que puedes parar.');
 if(v.practiceId==='sensate-2'&&v.variant==='partner'&&v.partnerConsent!==true)throw Error('Para ampliar en pareja, confirma que ambos quieren hacerlo.');
}
function mergeProgram(p,s,patch,v,day){
 if(Object.hasOwn(patch,'context'))s.context=patch.context;
 for(const key of ['conditions','ranking','rankPrefs'])if(Object.hasOwn(patch,key))p[key]=patch[key];
 if(Object.hasOwn(patch,'ranking'))p.rankPrefs=[...new Set([...list(p.rankPrefs),...patch.ranking])];
 if(patch.detailNotes)p.detailNotes={...object(p.detailNotes),...patch.detailNotes};
 if(day===15&&v.ladder!==null)p.ladder=v.ladder;
 if(day===18){
  const pt={...object(p.partnerTask)},f=v.fields;
  for(const [key,field] of [['moment','partner_moment'],['findings','partner_findings'],['agreed','partner_agreed'],['solo','partner_solo']])if(Object.hasOwn(f,field))pt[key]=f[field];
  if(v.route==='partner'){pt.consent=v.partnerConsent;p.hasPartner='yes'}
  // The solo alternative does not imply the person has no partner.
  p.partnerTask=pt;
 }
}
function addSession(p,m,v){
 const now=new Date().toISOString(),metric=METRICS[m.day],reflection=REFLECTION_KEYS.map(k=>v.fields[k]).filter(Boolean).join(' · ').slice(0,400);
 const item={id:m.recordId,day:m.day,sourceDay:m.day,scheduledDay:m.scheduledDay,assignmentId:m.assignmentId,date:now.slice(0,10),practiceId:v.practiceId,variant:v.variant==='partner'||v.route==='partner'?'partner':'solo',status:'completed',activeSec:Math.round(v.elapsed),metricKey:metric[0],metricLabel:metric[1],before:v.before,after:m.day===21?v.localAfter??v.after:v.after,reflection};
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
  try{checkRecord(m,record,safety,completed)}catch(error){if(!closing)throw error;interrupted=true}
  // Leaving an activity is always possible in the same user/plan/day. If its
  // indication changed, keep an interrupted draft without applying new choices
  // or preferences, adding a completed session, or completing the calendar day.
  if(interrupted){record.status='interrupted';record.confirm=false;record.ready=false;record.completedAt=null;if(m.day===15)record.ladder=null}
  else mergeProgram(p,s,patch,record,m.day);
  if(completed)addSession(p,m,record);
  p.detailNotes={...object(p.detailNotes),[NOTE+m.day]:JSON.stringify(record)};
  const next={...bundle,'spm-desire-program':JSON.stringify(p)};
  if(!interrupted&&Object.hasOwn(patch,'context'))next['spm-desire-state']=JSON.stringify(s);
  if(!valid(m))throw Error('La sesión cambió antes de guardar.');
  await records.save(next,m.scope,m.scheduledDay);
  if(completed||interrupted)m.latest=record;
  if(completed)m.completedVerified=true;
 };
 m.queue=m.queue.catch(()=>{}).then(job);return m.queue;
}
function failure(m,error){send(m,'SPM_WEEK3_ERROR',{message:error?.message||'No pudimos guardar. Conserva esta pantalla y reintenta.',safety:m.safety})}
function autosave(m){clearTimeout(m.timer);m.timer=setTimeout(()=>{if(allowed(m)&&m.latest)void enqueue(m).catch(error=>failure(m,error))},700)}
function setLatest(m,v,closing=false){
 if(!(closing?attached(m):allowed(m))||!m.initialized||!v.record||typeof v.record!=='object'||Array.isArray(v.record)||v.record.day!==m.day||JSON.stringify(v).length>40000)return false;
 const cleanValue=clean(m.day,v.record,m.recordId);
 if(!m.completedVerified&&cleanValue.status==='completed'){cleanValue.status='draft';cleanValue.completedAt=null}
 m.latest=cleanValue;m.programPatch={...m.programPatch,...cleanProgram(v.program,v.programChanged)};
 return true;
}
async function flush(m,closing=false){clearTimeout(m.timer);if(m.latest&&m.initialized)await enqueue(m,false,closing);else await m.queue}
function returnToToday(m){dispose(m);if(m.host.isConnected)window.SPM_DAILY_PRACTICE?.open?.({focus:false})}
async function closeActive(m){
 if(!attached(m)||m.busy)return false;m.busy=true;
 try{await flush(m,true);if(!attached(m))return false;returnToToday(m);return true}catch(error){failure(m,error);return false}finally{m.busy=false}
}
async function complete(m){
 if(!allowed(m)||m.busy||!m.latest)return false;m.busy=true;
 try{
  clearTimeout(m.timer);await enqueue(m,true);if(!allowed(m))return false;
  const ok=await window.SPM_DAILY_PRACTICE.saveActivity(m.activityId,{day:m.day,confirmed:true,source:'desire-lab',practiceId:m.latest.practiceId,desireWeek3TouchVersion:1,activeSec:Math.round(m.latest.elapsed)},m.scope,m.scheduledDay);
  if(ok===false)throw Error('La práctica se guardó, pero falta confirmar el cierre del día. Pulsa Guardar para reintentar.');
  if(!allowed(m))return false;send(m,'SPM_WEEK3_DONE');returnToToday(m);window.SPM_DAILY_PRACTICE?.showContinuation?.();return true;
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
   m.recordId=typeof draft.id==='string'&&draft.id.startsWith('desire-week3-d'+m.day+'-')?draft.id:'desire-week3-d'+m.day+'-'+m.sid;
   m.latest=clean(m.day,draft,m.recordId);m.completedVerified=false;
   if(m.latest.status==='completed'){m.latest.status='draft';m.latest.completedAt=null}
   if(m.day===19&&!m.safety.phase2Allowed){m.latest.practiceId='sensate-1';if(draft.practiceId!=='sensate-1'){m.latest.step=1;m.latest.ready=false;m.latest.confirm=false}}
   m.initialized=true;
  }
  // READY can be retried if INIT was lost. Keep the active draft and its ID,
  // merge only already-requested resource edits, and refresh host safety/history.
  const program=programFor(p,s),patch=m.programPatch;
  for(const key of ['context','conditions','ranking','rankPrefs'])if(Object.hasOwn(patch,key))program[key]=clone(patch[key]);
  if(patch.detailNotes)program.detailNotes={...program.detailNotes,...patch.detailNotes};
  send(m,'SPM_WEEK3_INIT',{record:m.latest,program,state:{context:program.context,stimuli:list(s.stimuli),zones:list(s.zones)},safety:m.safety,history:historyFor(p)});
 }catch(error){failure(m,error)}finally{m.loading=false}
}
async function onMessage(m,event){
 if(!attached(m)||event.origin!==location.origin||event.source!==m.iframe?.contentWindow)return;
 const v=event.data;if(!v||v.sid!==m.sid||v.day!==m.day||typeof v.type!=='string')return;
 if(v.type==='SPM_WEEK3_READY')await initialize(m);
 else if(v.type==='SPM_WEEK3_CHANGE'){if(setLatest(m,v))autosave(m)}
 else if(v.type==='SPM_WEEK3_COMPLETE'){if(setLatest(m,v))void complete(m)}
 else if(v.type==='SPM_WEEK3_CLOSE'){if(setLatest(m,v,true))void closeActive(m)}
}
async function open(opts={}){
 if(current&&!attached(current))dispose(current);
 const c=ctx();if(!eligible(c,opts))return legacyOpen(opts);
 const scope=scopeOf(c),day=Number(main(c)?.sourceDay||c.day),scheduledDay=Number(c.day),activityId=main(c).id,assignmentId=main(c).assignmentId;if(!scope)return false;
 if(current&&!await closeActive(current))return false;
 if(document.querySelector('.spm-desire-modal[open]')&&await legacyClose()===false)return false;
 const host=document.getElementById('spmDailyWorkspace');if(!host?.isConnected)return false;
 const sid=window.crypto?.randomUUID?.()||'week3-'+Math.random().toString(36).slice(2);
 const m={scope,day,scheduledDay,activityId,assignmentId,scheduleVersion:c.scheduleVersion||'legacy',host,sid,recordId:'',wrap:null,iframe:null,queue:Promise.resolve(),latest:null,programPatch:{},safety:null,busy:false,loading:false,initialized:false,completedVerified:false,timer:0,watch:0,onMessage:null};current=m;
 if(!allowed(m)){current=null;return false}
 try{
  const bundle=await records.read(scope);if(!allowed(m))return false;
  m.safety=safetyFrom(ctx(),parse(bundle['spm-desire-program']),parse(bundle['spm-desire-state']),parse(bundle['spm-desire-profile']));
  if(m.safety.acute||(day===17&&m.safety.review)){dispose(m);return legacyOpen(opts)}
 }catch{dispose(m);return false}
 const wrap=document.createElement('section');wrap.className='spm-ds-week3-root';wrap.setAttribute('aria-label','Deseo, día '+day+' interactivo');
 const frame=document.createElement('iframe');frame.title='Deseo · Día '+day;frame.allow='autoplay';
 frame.src='/premium-v2/desire-week3-v1/index.html?spm=central&day='+day+'&sid='+encodeURIComponent(sid)+'&v=20261119-w34-fullscreen1';
 m.wrap=wrap;m.iframe=frame;m.onMessage=e=>void onMessage(m,e);window.addEventListener('message',m.onMessage);
 wrap.append(frame);host.replaceChildren(wrap);
 m.watch=setInterval(()=>{
  if(!attached(m)){dispose(m);return}
  if(!allowed(m)&&!m.pauseNotified){
   m.pauseNotified=true;const last=m.lastData||{};m.safety=safetyFrom(ctx(),last.p||{},last.s||{},last.profile||{});
   failure(m,Error('La práctica está en pausa. Puedes volver a Hoy conservando tu borrador.'));
  }
 },500);
 return true;
}
async function close(){if(current&&!attached(current))dispose(current);return current?closeActive(current):legacyClose()}
function stop(){if(current)dispose(current)}
window.SPM_DESIRE_LAB={...lab,open,close};
window.SPM_DESIRE_WEEK3_BRIDGE={open,close,stop,eligible,allowed,clean,cleanProgram,safetyFrom};
})();
