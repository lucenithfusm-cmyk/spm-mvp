/* SPM Digital Wellness · Deseo 8–14: puente aislado para pantallas táctiles.
 * Pantallas aprobadas el 19 de noviembre de 2026; audio de portada revisado.
 * No altera evaluaciones 14/28, registros de otros dominios, seguridad o pausas.
 */
(()=>{'use strict';
if(window.SPM_DESIRE_WEEK2_BRIDGE)return;
const lab=window.SPM_DESIRE_LAB,records=window.SPM_DESIRE_RECORDS;
if(!lab||!records)return;
const legacyOpen=lab.open.bind(lab),legacyClose=lab.close.bind(lab);
const DAYS=new Set([8,9,10,11,12,13,14]);
const P={8:'responsive-window',9:'@channel',10:'repertoire-try',11:'no-desire-today',12:'activation-plan',13:'evidence-confidence',14:'week-review'};
const CHANNEL={'visual':'visual-explore','tactile':'sensory-focus','auditory':'verbal-script','fantasy':'fantasy-private','foreplay':'foreplay-rhythm','context':'context-design'};
const NOTE='desireWeek2TouchDay';
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
const scopeOf=c=>c?.userId&&c?.planId?String(c.userId)+':'+String(c.planId):'';
const main=c=>window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(a=>a?.id==='main');
const eligible=(c,o)=>o?.origin==='dailyPlan'&&c?.primary==='desire'&&DAYS.has(Number(c.day));
const object=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const text=v=>typeof v==='string'?v.slice(0,400):'';
const number=v=>v===null?null:Number.isInteger(v)&&v>=0&&v<=10?v:null;
const clock=v=>({elapsed:Math.max(0,Math.min(900,Number(v?.elapsed)||0)),running:false,anchor:0,started:v?.started===true});
const parse=v=>{try{return object(JSON.parse(typeof v==='string'?v:'{}'))}catch{return {}}};
const pick=(values,allowed)=>Array.isArray(values)?[...new Set(values.filter(k=>allowed.includes(k)))].slice(0,8):[];
const CHOICES={8:['calm','near','privacy','time'],9:['privacy','time','rest','quiet'],10:['less','equal','more'],11:['contact','talk','ambience','imagine','near'],12:['calm','safe','curiosity','near'],13:['privacy','quiet','time'],14:[]};
function clean(day,src){const v=object(src),data={
 choice:pick(v.choice,CHOICES[day]||[]),note:text(v.note),stimulus:text(v.stimulus),channel:CHANNEL[v.channel]?v.channel:'',idea:['ver','tocar','escuchar','hablar','previo','novedad'].includes(v.idea)?v.idea:'',pleasant:['rest','music','talk','alone','contact','none'].includes(v.pleasant)?v.pleasant:'',moment:text(v.moment),place:text(v.place),conditions:text(v.conditions),memory1:text(v.memory1),memory2:text(v.memory2),memory3:text(v.memory3),next:text(v.next),good:text(v.good),adjust:text(v.adjust),repeat:text(v.repeat),
 metricBefore:number(v.metricBefore),metricAfter:number(v.metricAfter),utility:number(v.utility),confidence:number(v.confidence),expected:number(v.expected),actual:number(v.actual),
 timer:clock(v.timer),completed:v.completed===true,checkpoint:v.checkpoint===true,
 page:Math.max(1,Math.min(3,Number(v.page)||1))};return data;
}
let current=null;
function allowed(m){if(!m||current!==m||m.iframe&&(!m.iframe.isConnected||!m.wrap?.isConnected))return false;const c=ctx(),a=main(c);if(!eligible(c,{origin:'dailyPlan'})||Number(c.day)!==m.day||scopeOf(c)!==m.scope||!m.host.isConnected)return false;
 if(a?.kind!=='desire'||window.SPM_DAILY_PRACTICE?.restricted?.(c,a))return false;
 const active=window.SPM_DAILY_PRACTICE?.active?.();return !active||(active.id==='main'&&active.scope===m.scope&&Number(active.day)===m.day);
}
function send(m,type,fields={}){if(m.iframe?.isConnected&&m.iframe.contentWindow)m.iframe.contentWindow.postMessage({type,sid:m.sid,day:m.day,...fields},location.origin)}
function dispose(m){if(!m)return;clearTimeout(m.timer);window.removeEventListener('message',m.onMessage);m.iframe?.remove();m.wrap?.remove();if(current===m)current=null}
function sessionId(day,v){return day===9?CHANNEL[v.channel]||'sensory-focus':P[day]}
function addSession(p,m){const now=new Date().toISOString(),day=m.day,v=m.latest,id=sessionId(day,v),all=Array.isArray(p.sessions)?p.sessions:[];
 if(!all.some(x=>Number(x?.day)===day&&x?.practiceId===id&&x?.status==='completed')){
 const metricKey=day===11?'pressure':day===14?'local':'desire';
 const reflection=[v.note,v.next,v.good,v.adjust,v.repeat,v.memory1,v.memory2,v.memory3].filter(Boolean).join(' · ').slice(0,950);
 const before=day===9||day===11?v.metricBefore:day===12?v.expected:null;
 const after=day===9||day===11?v.metricAfter:day===10?v.utility:day===12?v.actual:day===13?v.confidence:day===8?v.metricAfter:null;
 p.sessions=[...all,{id:'desire-week2-d'+day+'-touch-v1',day,date:now.slice(0,10),practiceId:id,variant:'solo',status:'completed',activeSec:Math.round(v.timer.elapsed||0),metricKey,metricLabel:day===14?'Revisión cualitativa semana 2':day===13?'Confianza':day===11?'Presión antes/después':day===10?'Utilidad de la idea':'Deseo y observación',before,after,reflection}];
 }
 p.dayDone={...object(p.dayDone),[day]:object(p.dayDone)[day]||now.slice(0,10)};
 // Nunca se cambia el checkpoint oficial del día 14 ni su comparación 0–4.
}
function enqueue(m,completed=false){const job=async()=>{if(!allowed(m))throw Error('Contexto cambiado');const bundle=await records.read(m.scope);if(!allowed(m))throw Error('Contexto cambiado durante el guardado');const p=parse(bundle['spm-desire-program']);p.detailNotes={...object(p.detailNotes),[NOTE+m.day]:JSON.stringify(m.latest)};if(completed)addSession(p,m);await records.save({...bundle,'spm-desire-program':JSON.stringify(p)},m.scope,m.day)};
 m.queue=m.queue.catch(()=>{}).then(job);return m.queue;
}
function autosave(m){if(!allowed(m)||!m.latest)return;clearTimeout(m.timer);m.timer=setTimeout(()=>void enqueue(m).catch(()=>send(m,'SPM_WEEK2_ERROR',{message:'No pudimos guardar el avance. Puedes reintentar.'})),850)}
function setLatest(m,record){if(!allowed(m)||!record||typeof record!=='object'||Array.isArray(record)||JSON.stringify(record).length>15000)return false;m.latest=clean(m.day,record);if(m.day===14)m.latest.checkpoint=m.checkpointVerified===true;return true}
async function flush(m){clearTimeout(m.timer);if(m.latest)await enqueue(m);else await m.queue}
function returnToToday(m){dispose(m);if(m.host.isConnected)window.SPM_DAILY_PRACTICE?.open?.({focus:false})}
async function closeActive(m){if(!allowed(m)||m.busy)return false;m.busy=true;try{await flush(m);if(!allowed(m))return false;returnToToday(m);return true}catch{send(m,'SPM_WEEK2_ERROR',{message:'No se pudo guardar el avance. Reintenta sin cerrar.'});return false}finally{m.busy=false}}
async function complete(m){if(!allowed(m)||m.busy||!m.latest)return false;m.busy=true;const v=m.latest;v.completed=true;
 try{clearTimeout(m.timer);await enqueue(m,true);if(!allowed(m))return false;
  const ok=await window.SPM_DAILY_PRACTICE.saveActivity('main',{day:m.day,confirmed:true,source:'desire-lab',practiceId:sessionId(m.day,v),desireWeek2TouchVersion:1,activeSec:Math.round(v.timer.elapsed||0)},m.scope,m.day);
  if(ok===false)throw Error('No se pudo registrar el resultado');send(m,'SPM_WEEK2_DONE');returnToToday(m);window.SPM_DAILY_PRACTICE?.showContinuation?.();return true;
 }catch{v.completed=false;send(m,'SPM_WEEK2_ERROR',{message:'No se pudo completar el guardado. Conserva esta pantalla para reintentar.'});return false}finally{m.busy=false}}
async function openOfficialCheckpoint(m){if(m.day!==14||!allowed(m)||m.busy)return false;
 const c=ctx(),a=window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(x=>x.kind==='program-checkpoint');
 if(!a){send(m,'SPM_WEEK2_ERROR',{message:'No se encontró la evaluación oficial del día 14. Puedes abrirla desde Hoy.'});return false}
 if(!await closeActive(m))return false;
 window.SPM_DAILY_PRACTICE?.open?.({focus:false});
 return window.SPM_DAILY_PRACTICE?.launch?.(a.id);
}
async function onMessage(m,event){if(!allowed(m)||event.origin!==location.origin||event.source!==m.iframe?.contentWindow)return;const v=event.data;if(!v||v.sid!==m.sid||v.day!==m.day||typeof v.type!=='string')return;
 if(v.type==='SPM_WEEK2_READY'){
  if(m.loading)return;m.loading=true;
  try{const bundle=await records.read(m.scope);if(!allowed(m))return;
   const p=parse(bundle['spm-desire-program']),state=parse(bundle['spm-desire-state']);
   const old=parse(p.detailNotes?.[NOTE+m.day]);m.latest=clean(m.day,old);
   let checkpoint=false;if(m.day===14){const entries=await window.SPM_DAILY_RECORDS?.read?.(m.scope,14);const assign=window.SPM_DAILY_PRACTICE?.assignments?.(ctx())?.find(a=>a.kind==='program-checkpoint');checkpoint=!!(assign&&entries?.[assign.id]?.completed===true)}
   m.latest.checkpoint=checkpoint;m.checkpointVerified=checkpoint;
   send(m,'SPM_WEEK2_INIT',{record:m.latest,program:{ranking:Array.isArray(p.ranking)?p.ranking:[],details:object(p.details)},state:{stimuli:Array.isArray(state.stimuli)?state.stimuli:[]},checkpoint});
  }catch{send(m,'SPM_WEEK2_ERROR',{message:'No se pudo recuperar la sesión. Regresa a Hoy y reintenta.'})}finally{m.loading=false}
 }else if(v.type==='SPM_WEEK2_CHANGE'){if(setLatest(m,v.record))autosave(m)}
 else if(v.type==='SPM_WEEK2_COMPLETE'){if(setLatest(m,v.record))void complete(m)}
 else if(v.type==='SPM_WEEK2_CLOSE'){if(setLatest(m,v.record))void closeActive(m)}
 else if(v.type==='SPM_WEEK2_CHECKPOINT'){if(setLatest(m,v.record))void openOfficialCheckpoint(m)}
}
async function open(opts={}){
 // Un cambio externo de día/cuenta o un workspace desmontado invalida esta sesión.
 // Se elimina sin guardar sus respuestas en el contexto nuevo.
 if(current&&!allowed(current))dispose(current);
 const c=ctx();if(!eligible(c,opts))return legacyOpen(opts);const scope=scopeOf(c),day=Number(c.day);if(!scope)return false;
 if(current&&!await closeActive(current))return false;
 if(document.querySelector('.spm-desire-modal[open]')&&await legacyClose()===false)return false;
 const host=document.getElementById('spmDailyWorkspace');if(!host?.isConnected)return false;
 const m={scope,day,host,sid:window.crypto?.randomUUID?.()||'spmweek2-'+Math.random().toString(36).slice(2),wrap:null,iframe:null,queue:Promise.resolve(),latest:null,busy:false,loading:false,checkpointVerified:false,timer:0,onMessage:null};current=m;
 if(!allowed(m)){current=null;return false}
 const wrap=document.createElement('section');wrap.className='spm-ds-week2-root';wrap.setAttribute('aria-label','Deseo, día '+day+' interactivo');
 const iframe=document.createElement('iframe');iframe.title='Deseo · Día '+day;iframe.allow='autoplay';iframe.src='/premium-v2/desire-week2-v1/index.html?spm=central&day='+day+'&sid='+encodeURIComponent(m.sid)+'&v=20261120-audio-fullscreen1';
 m.wrap=wrap;m.iframe=iframe;m.onMessage=e=>void onMessage(m,e);window.addEventListener('message',m.onMessage);wrap.append(iframe);host.replaceChildren(wrap);return true;
}
async function close(){if(current&&!allowed(current))dispose(current);return current?closeActive(current):legacyClose()}
function stop(){if(current)dispose(current)}
window.SPM_DESIRE_LAB={...lab,open,close};
window.SPM_DESIRE_WEEK2_BRIDGE={open,close,stop,eligible,allowed,clean};
})();
