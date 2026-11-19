/* SPM Digital Wellness · Deseo 4–7 · Reemplazo aprobado con guardado central
 * Aísla días 1–3, sesiones transversales, calendarios, pagos y datos ajenos.
 */
(()=>{'use strict';
if(window.SPM_DESIRE_WEEK1_BRIDGE)return;
const original=window.SPM_DESIRE_LAB,records=window.SPM_DESIRE_RECORDS;
if(!original||!records)return;
const prevOpen=original.open.bind(original),prevClose=original.close.bind(original);
const DAYS=[4,5,6,7],PRACTICES={4:'presence-5',5:'map-select',6:'body-awareness',7:'week-review'};
const ACC=['Descanso','Privacidad','Tiempo sin prisa','Conexión','Estímulo agradable'];
const BRAKES=['Cansancio','Estrés','Distracciones','Exigencia','Preocupación'];
const RANK=['partner-visual','touch','words','massage','fantasy','foreplay','ambience','other'];
const NOTE='desireWeek1TouchDay';
const context=()=>window.SPM_RESOURCE_CONTEXT?.();
const scopeOf=c=>c?.userId&&c?.planId?String(c.userId)+':'+String(c.planId):'';
const main=c=>window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(a=>a?.id==='main');
const eligible=(c,opts)=>opts?.origin==='dailyPlan'&&c?.primary==='desire'&&DAYS.includes(Number(c?.day));
const safeStr=x=>typeof x==='string'?x.slice(0,400):'';
const clamp=(v,max)=>Math.max(0,Math.min(max,Number(v)||0));
const chosen=(v,allowed,max)=>Array.isArray(v)?[...new Set(v.filter(x=>allowed.includes(x)))].slice(0,max):[];
const metric=v=>v===null?null:Number.isInteger(v)&&v>=0&&v<=10?v:null;
const parse=x=>{try{return JSON.parse(typeof x==='string'?x:'{}')||{}}catch{return {}}};
function sanitize(day,x){
 const v=x&&typeof x==='object'&&!Array.isArray(x)?x:{};
 const clock={elapsed:clamp(v.timer?.elapsed,300),started:v.timer?.started===true,running:false,anchor:0};
 if(day===4)return {before:metric(v.before),after:metric(v.after),metricTouched:{before:v.metricTouched?.before===true,after:v.metricTouched?.after===true},feel:['Agradable','Neutro','Incómodo'].includes(v.feel)?v.feel:null,reflection:safeStr(v.reflection),timer:clock,completed:v.completed===true};
 if(day===5)return {accel:chosen(v.accel,ACC,5),brakes:chosen(v.brakes,BRAKES,5),note:safeStr(v.note),aIndex:clamp(v.aIndex,4),bIndex:clamp(v.bIndex,4),completed:v.completed===true};
 if(day===6)return {before:metric(v.before),after:metric(v.after),metricTouched:{before:v.metricTouched?.before===true,after:v.metricTouched?.after===true},region:Number.isInteger(v.region)&&v.region>=0&&v.region<4?v.region:null,view:v.view==='back'?'back':'front',comfortZone:Number.isInteger(v.comfortZone)&&v.comfortZone>=0&&v.comfortZone<4?v.comfortZone:null,reflection:safeStr(v.reflection),timer:clock,completed:v.completed===true};
 if(day===7){const liked=chosen(v.liked,RANK,8);return {good:safeStr(v.good),adjust:safeStr(v.adjust),liked,ranking:chosen(v.ranking,liked,5),next:safeStr(v.next),completed:v.completed===true}}
 return {};
}
let opened=null;
function permitted(m){
 if(!m||opened!==m)return false;
 const c=context(),a=main(c);
 if(!eligible(c,{origin:'dailyPlan'})||Number(c.day)!==m.day||scopeOf(c)!==m.scope||!m.host.isConnected)return false;
 if(a?.kind!=='desire'||window.SPM_DAILY_PRACTICE?.restricted?.(c,a))return false;
 const activity=window.SPM_DAILY_PRACTICE?.active?.();
 return !activity||(activity.id==='main'&&activity.scope===m.scope&&Number(activity.day)===m.day);
}
function send(m,type,other={}){
 if(m.frame?.isConnected&&m.frame.contentWindow)m.frame.contentWindow.postMessage({type,sid:m.sid,...other},window.location.origin);
}
function tearDown(m){
 if(!m)return;
 clearTimeout(m.wait);
 window.removeEventListener('message',m.onMessage);
 m.frame?.remove();m.wrap?.remove();
 if(opened===m)opened=null;
}
function addSession(p,m){
 const day=m.day,v=m.latest,now=new Date().toISOString(),id=PRACTICES[day];
 const existing=Array.isArray(p.sessions)?p.sessions:[];
 if(!existing.some(x=>x?.day===day&&x?.practiceId===id&&x?.status==='completed')){
  p.sessions=[...existing,{id:'desire-week1-d'+day+'-touch-v1',day,date:now.slice(0,10),practiceId:id,variant:'solo',status:'completed',activeSec:day===4||day===6?Math.round(v.timer?.elapsed||0):0,metricKey:day===4?'pressure':day===6?'satisfaction':'desire',metricLabel:day===4?'Presión antes/después':day===6?'Comodidad corporal':day===5?'Mapa aceleradores y frenos':'Síntesis semana 1',before:day===4||day===6?v.before??null:null,after:day===4||day===6?v.after??null:null,reflection:safeStr(day===4||day===6?v.reflection:day===5?v.note:[v.good,v.adjust,v.next].filter(Boolean).join(' | '))}];
 }else p.sessions=existing;
 p.dayDone={...(p.dayDone||{}),[day]:(p.dayDone||{})[day]||now.slice(0,10)};
 if(day===5){
  const old=p.map&&typeof p.map==='object'?p.map:{};
  const unique=(a,b)=>[...new Set([...(Array.isArray(a)?a:[]),...(Array.isArray(b)?b:[])])];
  p.map={...old,accel:unique(old.accel,v.accel),brake:unique(old.brake,v.brakes),suggestions:safeStr(v.note)||safeStr(old.suggestions)};
 }
 if(day===7){
  p.rankPrefs=[...new Set([...(Array.isArray(p.rankPrefs)?p.rankPrefs:[]),...v.liked])];
  if(v.ranking.length)p.ranking=v.ranking;
 }
}
function write(m,completed=false){
 const job=async()=>{
  if(!permitted(m))throw Error('Cambió el contexto SPM.');
  const bundle=await records.read(m.scope);
  if(!permitted(m))throw Error('Cambió la cuenta o el día de SPM.');
  const p=parse(bundle['spm-desire-program']);
  p.detailNotes={...(p.detailNotes&&typeof p.detailNotes==='object'?p.detailNotes:{}),[NOTE+m.day]:JSON.stringify(m.latest)};
  if(completed)addSession(p,m);
  await records.save({...bundle,'spm-desire-program':JSON.stringify(p)},m.scope,m.day);
 };
 m.queue=m.queue.catch(()=>{}).then(job);
 return m.queue;
}
function schedule(m){
 if(!permitted(m))return;
 clearTimeout(m.wait);
 m.wait=setTimeout(()=>void write(m).catch(()=>send(m,'SPM_WEEK1_ERROR',{message:'No pudimos guardar el avance. Reintenta.'})),800);
}
function setState(m,v){
 if(!permitted(m)||!v||typeof v!=='object'||Array.isArray(v)||JSON.stringify(v).length>15000)return false;
 m.latest=sanitize(m.day,v);return true;
}
async function flush(m){
 clearTimeout(m.wait);
 if(m.latest)await write(m);else await m.queue;
}
function returnToToday(m){
 tearDown(m);
 if(m.host?.isConnected)window.SPM_DAILY_PRACTICE?.open?.({focus:false});
}
async function closeSelected(m,resource=false){
 if(!permitted(m)||m.busy)return false;
 m.busy=true;
 try{await flush(m);if(!permitted(m))return false;returnToToday(m);if(resource)await prevOpen({origin:'library'});return true}
 catch{send(m,'SPM_WEEK1_ERROR',{message:'No se pudo guardar el avance. Reintenta.'});return false}
 finally{m.busy=false}
}
async function complete(m){
 if(!permitted(m)||m.busy||!m.latest)return false;
 m.busy=true;
 try{
  clearTimeout(m.wait);
  m.latest.completed=true;
  await write(m,true);
  if(!permitted(m))return false;
  const ok=await window.SPM_DAILY_PRACTICE.saveActivity('main',{day:m.day,confirmed:true,source:'desire-lab',practiceId:PRACTICES[m.day],desireWeek1TouchVersion:1,activeSec:m.day===4||m.day===6?Math.round(m.latest.timer?.elapsed||0):null},m.scope,m.day);
  if(ok===false)throw Error('No se pudo completar el día.');
  send(m,'SPM_WEEK1_DONE');returnToToday(m);
  window.SPM_DAILY_PRACTICE?.showContinuation?.();
  return true;
 }catch{
  m.latest.completed=false;
  send(m,'SPM_WEEK1_ERROR',{message:'No se pudo completar el guardado. Tus respuestas siguen en pantalla para reintentar.'});return false;
 }finally{m.busy=false}
}
async function onMessage(m,e){
 if(!permitted(m)||e.origin!==window.location.origin||e.source!==m.frame?.contentWindow)return;
 const v=e.data;
 if(!v||typeof v!=='object'||v.sid!==m.sid||typeof v.type!=='string')return;
 if(v.type==='SPM_WEEK1_READY'){
  if(m.loading)return;m.loading=true;
  try{
   const bundle=await records.read(m.scope);
   if(!permitted(m))return;
   const p=parse(bundle['spm-desire-program']);
   const old=parse(p.detailNotes?.[NOTE+m.day]);const has=Object.keys(old).length>0;const seed={};
   if(m.day===5&&!has){seed.accel=(p.map?.accel||[]).filter(x=>ACC.includes(x));seed.brakes=(p.map?.brake||[]).filter(x=>BRAKES.includes(x));seed.note=p.map?.suggestions||''}
   if(m.day===7&&!has){seed.liked=(p.rankPrefs||[]).filter(x=>RANK.includes(x));seed.ranking=(p.ranking||[]).filter(x=>RANK.includes(x)).slice(0,5)}
   m.latest=sanitize(m.day,has?old:seed);
   send(m,'SPM_WEEK1_INIT',{day:m.day,record:m.latest});
  }catch{send(m,'SPM_WEEK1_ERROR',{message:'No se pudo recuperar tu sesión de Deseo.'})}
  finally{m.loading=false}
 }else if(v.type==='SPM_WEEK1_CHANGE'){if(setState(m,v.record))schedule(m)}
 else if(v.type==='SPM_WEEK1_COMPLETE'){if(setState(m,v.record))void complete(m)}
 else if(v.type==='SPM_WEEK1_CLOSE'){if(setState(m,v.record))void closeSelected(m)}
 else if(v.type==='SPM_WEEK1_RESOURCE'){if(setState(m,v.record))void closeSelected(m,true)}
}
async function open(opts={}){
 const c=context();
 if(!eligible(c,opts))return prevOpen(opts);
 const scope=scopeOf(c),day=Number(c.day),host=document.getElementById('spmDailyWorkspace');
 if(!scope||!host?.isConnected)return false;
 if(opened&&!await closeSelected(opened))return false;
 if(document.querySelector('.spm-desire-modal[open]')&&await prevClose()===false)return false;
 const m={scope,day,host,sid:window.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+'spmweek1',frame:null,wrap:null,queue:Promise.resolve(),latest:null,busy:false,loading:false,wait:0,onMessage:null};
 opened=m;
 if(!permitted(m)){opened=null;return false}
 const wrap=document.createElement('section');wrap.className='spm-ds-week1-root';wrap.setAttribute('aria-label','Deseo día '+day+' interactivo');
 const frame=document.createElement('iframe');
 frame.title='SPM Deseo día '+day;frame.allow='autoplay';
 frame.src='/premium-v2/desire-week1-v1/index.html?spm=central&day='+day+'&sid='+encodeURIComponent(m.sid)+'&v=20261119a';
 m.wrap=wrap;m.frame=frame;m.onMessage=e=>void onMessage(m,e);
 window.addEventListener('message',m.onMessage);
 wrap.append(frame);host.replaceChildren(wrap);
 return true;
}
async function close(){if(opened)return closeSelected(opened);return prevClose()}
function stop(){if(opened)tearDown(opened)}
window.SPM_DESIRE_LAB={...original,open,close};
window.SPM_DESIRE_WEEK1_BRIDGE={open,close,stop,eligible,permitted,sanitize};
})();