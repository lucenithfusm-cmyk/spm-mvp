(()=>{'use strict';
if(window.SPM_PELVIC_LAB)return;
const keys=['pf-step','pf-origin','pf-assignment','pf-results','pf-daily-result','pf-flags','pf-overload','pf-screening','pf-checkins','pf-demo-config'];
const practices=['percibe','contrae','coord','rapidas','sostenidas'];
const recs=['progress','repeat','relax','clinical-review'];
const origins=['lab','library','dailyPlan'];
const intents=['daily-relax','scheduled','library'];
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
const scopeOf=c=>c?c.userId+':'+c.planId:'';
const clone=x=>JSON.parse(JSON.stringify(x));
const ints=(v,max)=>Array.isArray(v)&&v.length<=max+1&&v.every(x=>Number.isInteger(x)&&x>=0&&x<=max);
const result=r=>!!r&&practices.includes(r.practiceId)&&typeof r.completed==='boolean'&&[true,false,null].includes(r.cleanContraction)&&['fullRelease','discomfort','postTension'].every(k=>typeof r[k]==='boolean')&&recs.includes(r.recommendation)&&Number.isFinite(Date.parse(r.at))&&origins.includes(r.origin)&&(r.day===undefined||Number.isInteger(r.day)&&r.day>=1&&r.day<=28)&&(r.activityId===undefined||r.activityId===null||typeof r.activityId==='string'&&/^[a-z0-9-]{1,60}$/.test(r.activityId))&&(r.intent===undefined||intents.includes(r.intent));
function validValue(k,v){
 if(k==='pf-step')return Number.isInteger(v)&&v>=0&&v<16;
 if(k==='pf-origin')return origins.includes(v);
 if(k==='pf-assignment')return v===null||practices.includes(v);
 if(k==='pf-flags'||k==='pf-overload')return ints(v,4);
 if(k==='pf-results')return Array.isArray(v)&&v.length<=60&&v.every(result);
 if(k==='pf-daily-result')return v===null||result(v);
 if(k==='pf-screening')return !!v&&[null,'ok','glut','push','none'].includes(v.aware)&&[null,'si','no','nose'].includes(v.releaseOk)&&Array.isArray(v.comp)&&v.comp.length<=3&&new Set(v.comp).size===v.comp.length&&v.comp.every(x=>['mandibula','abdomen','gluteos'].includes(x));
 if(k==='pf-checkins')return Array.isArray(v)&&v.length<=60&&v.every(x=>Number.isFinite(Date.parse(x.at))&&Number.isInteger(x.tension)&&x.tension>=0&&x.tension<=10&&['Fácil','Regular','Difícil'].includes(x.release));
 if(k==='pf-demo-config')return !!v&&['relax','contract','coord','quick','sustained'].includes(v.mode)&&[1,2,3,4,5].includes(v.contractionSec)&&[2,5,6,8,10].includes(v.releaseSec)&&Number.isInteger(v.reps)&&v.reps>=1&&v.reps<=8&&['suave','moderada'].includes(v.intensityLabel)&&typeof v.cueSet==='string'&&v.cueSet.length<60;
 return false;
}
function validState(s){return !!s&&typeof s==='object'&&!Array.isArray(s)&&JSON.stringify(s).length<80000&&Object.entries(s).every(([k,v])=>keys.includes(k)&&validValue(k,v));}
function restriction(c,s={}){
 const a=c?.answers||{},last=(s['pf-results']||[]).at(-1),check=(s['pf-checkins']||[]).at(-1),sc=s['pf-screening']||{};
 if(!c||c.safety!=='none'||c.flags?.length||c.checkins?.some(x=>x.new_safety_flag))return 'review';
 if(a.pf_awareness==='hard_to_relax'||Number(a.pf_tension)>=4||s['pf-flags']?.length||s['pf-overload']?.length||sc.releaseOk==='no'||check?.tension>=7||check?.release==='Difícil'||last?.discomfort||last?.postTension||['relax','clinical-review'].includes(last?.recommendation))return 'relax';
 if(!s['pf-screening']&&a.pf_awareness==='good_control'&&[1,2].includes(Number(a.pf_tension)))return 'ready';
 if(sc.aware!=='ok'||sc.releaseOk!=='si'||sc.comp?.length!==3)return 'awareness';
 return 'ready';
}
let modal=null,scope='',state={},openDay=1,origin='library',intent='library',activityId=null,openedAt=0,initialResults=new Set(),acceptedResult='',onResult=null,onClose=null,lastFocus=null,dirty=0,saved=0,timer=0,inFlight=null,watch=0,generation=0;
const sameContext=()=>scopeOf(ctx())===scope&&(origin!=='dailyPlan'||Number(ctx()?.day)===openDay);
const effectiveRestriction=()=>{const level=restriction(ctx(),state);return level==='review'?'review':intent==='daily-relax'?'relax':level;};
function status(text,error=false){const el=modal?.querySelector('[data-pf-status]');if(el){el.textContent=text;el.dataset.error=String(error);}const retry=modal?.querySelector('[data-pf-retry]');if(retry)retry.hidden=!error;}
function notifyChild(){modal?.querySelector('iframe')?.contentWindow?.dispatchEvent(new Event('spm:pelvic-context'));}
async function flush(){
 clearTimeout(timer);const token=generation;
 if(inFlight){await inFlight;if(token===generation&&dirty>saved)return flush();return;}
 if(dirty===saved)return;
 const captured=scope,revision=dirty,payload=clone(state);
 if(!sameContext())throw new Error('Program changed');
 status('Guardando en tu programa…');
 const request=window.SPM_PELVIC_RECORDS.save(payload,captured,openDay);inFlight=request;
 try{await request;if(token!==generation||scope!==captured)return;saved=revision;status('Guardado en tu programa ✓');}
 catch(error){if(token===generation&&scope===captured)status('No se pudo guardar. Conserva esta pantalla y reintenta.',true);throw error;}
 finally{if(inFlight===request)inFlight=null;}
 if(token===generation&&dirty>saved)return flush();
}
function write(k,v){
 if(!modal||!sameContext()||!validValue(k,v))return false;
 state[k]=clone(v);dirty++;status('Cambios pendientes de guardar…');
 clearTimeout(timer);timer=setTimeout(()=>flush().catch(()=>{}),700);notifyChild();return true;
}
function dispose(){
 generation++;clearTimeout(timer);clearInterval(watch);timer=watch=0;
 modal?.close();modal?.remove();modal=null;delete window.SPM_PELVIC_LAB_HOST;
 state={};scope='';dirty=saved=0;inFlight=null;onResult=onClose=null;acceptedResult='';initialResults=new Set();lastFocus?.focus?.();
}
async function close(){if(!modal)return;modal.querySelector('iframe')?.contentWindow?.dispatchEvent(new Event('spm:pelvic-pause'));try{await flush();}catch{return false;}const returned=onClose,valid=sameContext();dispose();if(valid)returned?.();return true;}
function shell(){
 lastFocus=document.activeElement;modal=document.createElement('dialog');modal.className='spm-pf-modal';modal.setAttribute('aria-label','Piso Pélvico SPM');
 const back=origin==='dailyPlan'?'Volver a Hoy':origin==='erectile'?'Volver a DE':'Volver a mi programa';
 modal.innerHTML='<div class="spm-pf-shell"><header><button type="button" data-pf-close>← '+back+'</button><span data-pf-status role="status">Cargando tu progreso…</span><button type="button" data-pf-retry hidden>Reintentar guardado</button></header><main data-pf-body></main></div>';
 document.body.appendChild(modal);modal.showModal();modal.querySelector('[data-pf-close]').onclick=close;
 modal.querySelector('[data-pf-retry]').onclick=()=>flush().catch(()=>{});
 modal.addEventListener('cancel',e=>{e.preventDefault();close();});
 let previous=effectiveRestriction();
 watch=setInterval(()=>{if(!sameContext()){dispose();return;}const next=effectiveRestriction();if(next!==previous){previous=next;notifyChild();}},500);
}
async function load(opts){
 if(modal&&!(await close()))return false;
 const c=ctx();if(!c)return false;
 scope=scopeOf(c);openDay=Number.isInteger(opts.day)&&opts.day>=1&&opts.day<=28?opts.day:Math.min(28,Math.max(1,c.day||1));origin=['dailyPlan','erectile','library'].includes(opts.origin)?opts.origin:'library';
 if(origin==='dailyPlan'&&Number(c.day)!==openDay){scope='';return false;}
 intent=origin==='dailyPlan'?(opts.intent==='scheduled'?'scheduled':'daily-relax'):'library';activityId=typeof opts.activityId==='string'&&/^[a-z0-9-]{1,60}$/.test(opts.activityId)?opts.activityId:null;
 onResult=typeof opts.onResult==='function'?opts.onResult:null;onClose=typeof opts.onClose==='function'?opts.onClose:null;openedAt=Date.now();acceptedResult='';initialResults=new Set();
 dirty=saved=0;state={};shell();const token=++generation,captured=scope;
 try{const value=await window.SPM_PELVIC_RECORDS.read(captured);if(token!==generation||!sameContext())return false;if(!validState(value))throw new Error('Invalid saved state');state=clone(value);initialResults=new Set([...(state['pf-results']||[]),state['pf-daily-result']].filter(Boolean).map(r=>JSON.stringify(r)));status('Progreso conectado a tu programa');return true;}
 catch{if(token!==generation)return false;status('No pudimos recuperar tu progreso.',false);modal.querySelector('[data-pf-body]').innerHTML='<section class="spm-pf-choice"><p>Reintenta para continuar con tu información guardada.</p><button type="button" data-pf-load>Volver a cargar</button></section>';modal.querySelector('[data-pf-load]').onclick=()=>opts.hub?openHub(opts):opts.scheduled?openScheduled(opts):open(opts);return false;}
}
function receiveResult(r){
 // Only a result produced by this open practice can offer a daily confirmation.
 // Saved historical results remain readable, but never complete today's activity.
 if(!sameContext()||origin!=='dailyPlan'||intent!=='daily-relax'||!activityId||!result(r)||r.practiceId!=='percibe'||r.completed!==true||r.origin!=='dailyPlan'||r.day!==openDay||r.activityId!==activityId||r.intent!==intent)return false;
 const at=Date.parse(r.at),level=effectiveRestriction(),serialized=JSON.stringify(r);
 if(at<openedAt||at>Date.now()+1000||level==='review'||initialResults.has(serialized)||acceptedResult===serialized)return false;
 if(onResult?.(clone(r))!==true)return false;
 acceptedResult=serialized;status('Práctica realizada. Vuelve a Hoy para confirmarla.');return true;
}
function showLab(){
 const token=generation;
 window.SPM_PELVIC_LAB_HOST={
  getState:()=>token===generation?clone(state):{},write:(k,v)=>token===generation&&write(k,v),close:()=>token===generation?close():Promise.resolve(false),
  getContext:()=>({day:openDay,origin,intent,activityId,restriction:token===generation&&sameContext()?effectiveRestriction():'review'}),
  onResult:r=>token===generation&&receiveResult(r),
 };
 const frame=document.createElement('iframe');frame.title='Pelvic Floor Lab · Conciencia y relajación';frame.allow='autoplay';frame.src='pelvic-floor-lab/index.html?v=20261113-posture-photos1';
 modal.querySelector('[data-pf-body]').replaceChildren(frame);
}
async function open(opts={}){if(await load({...opts,intent:opts.origin==='dailyPlan'?'daily-relax':'library'}))showLab();}
async function openScheduled(opts={}){
 if(opts.intent==='daily-relax'||opts.preference==='lab'&&opts.intent!=='scheduled')return open({...opts,origin:'dailyPlan',intent:'daily-relax'});
 if(!await load({...opts,origin:'dailyPlan',intent:'scheduled',scheduled:true}))return;
 // Contractions stay in their own module, with the original readiness gates.
 // The daily awareness Lab never substitutes for a scheduled strength result.
 if(restriction(ctx(),state)==='ready'&&window.SPM_PELVIC_V2?.open){
  const verified=clone(state),captured=scope,day=openDay,id=activityId,started=openedAt,receive=onResult,returned=onClose;
  await flush();dispose();const token=generation;let accepted='';
  const current=()=>generation===token&&scopeOf(ctx())===captured&&Number(ctx()?.day)===day;
  return window.SPM_PELVIC_V2.open({origin:'dailyPlan',day,activityId:id,intent:'scheduled',readiness:()=>current()?restriction(ctx(),verified):'review',onResult:r=>{
   const at=Date.parse(r?.at),serialized=JSON.stringify(r);
   if(!current()||restriction(ctx(),verified)!=='ready'||!id||r?.source!=='pelvic-classic-v2'||r.completed!==true||r.day!==day||r.activityId!==id||r.intent!=='scheduled'||!Number.isFinite(at)||at<started||at>Date.now()+1000||accepted===serialized)return false;
   if(receive?.(clone(r))!==true)return false;accepted=serialized;return true;
  },onClose:()=>{if(current())returned?.();}});
 }
 const level=restriction(ctx(),state),why=level==='review'?'La práctica de contracciones está en pausa mientras se revisa la información de seguridad.':level==='relax'?'Tus registros indican que conviene seguir con conciencia y relajación. Las contracciones están en pausa.':level==='ready'?'El módulo de entrenamiento todavía está cargando. Vuelve a intentarlo en un momento.':'Antes de entrenar contracciones, necesitas reconocer la musculatura y registrar una relajación cómoda.';
 modal.querySelector('[data-pf-body]').innerHTML='<section class="spm-pf-choice"><span>SEGÚN TU PREPARACIÓN / PAUTA</span><h1>Tu sesión de contracciones</h1><p>'+why+'</p><p>Esta sesión permanece pendiente. El Lab diario es un apoyo diferente y no cuenta como entrenamiento de fuerza.</p><button type="button" data-pf-daily>Abrir el Lab diario</button></section>';
 modal.querySelector('[data-pf-daily]').onclick=async()=>{if(!sameContext())return;const assigned=window.SPM_DAILY_PRACTICE?.assignments()?.some(a=>a.id==='pelvic-daily-lab');if(await close()){if(assigned)window.SPM_DAILY_PRACTICE.launch('pelvic-daily-lab');else open({origin:'library'});}};
}
async function openHub(opts={}){
 if(!await load({...opts,hub:true}))return;
 const route=restriction(ctx(),state),ready=route==='ready';
 const why=route==='review'?'Hay información de seguridad pendiente de revisión. Puedes consultar el contenido educativo; las prácticas quedan en pausa.':route==='relax'?'Tus registros orientan a conciencia y relajación. El entrenamiento de contracciones queda en pausa.':ready?'Tu información permite abrir el entrenamiento de contracciones. Conserva su pauta; el Lab diario tiene un propósito diferente.':'Empieza por reconocer la musculatura y aprender a soltar. Tu preparación y progreso se conservan.';
 modal.querySelector('[data-pf-body]').innerHTML='<section class="spm-pf-choice"><span>SPM · PISO PÉLVICO</span><h1>Dos prácticas con propósitos distintos</h1><p>'+why+'</p><article><small>LAB DIARIO · '+(ready?'APOYO OPCIONAL':'RECOMENDADO PARA EMPEZAR')+'</small><h2>Conciencia, relajación y coordinación</h2><p>Identifica sensaciones y coordina con una respiración cómoda, a tu ritmo. El Lab no añade contracciones de fortalecimiento.</p><button type="button" data-pf-education>Abrir Pelvic Floor Lab</button></article><article><small>CONTRACCIONES · DOS VECES POR SEMANA</small><h2>Entrenamiento de contracciones</h2><p>Tu módulo de entrenamiento conserva su pauta y sus controles de preparación. Realízalo en las sesiones indicadas de tu programa.</p><button type="button" data-pf-training '+(!ready?'disabled':'')+'>Abrir entrenamiento actual</button></article><p class="spm-pf-small">El Lab diario no sustituye ni cuenta como una sesión de contracciones. Cada práctica conserva su propio registro.</p></section>';
 modal.querySelector('[data-pf-education]').onclick=showLab;
 modal.querySelector('[data-pf-training]').onclick=async()=>{const r=restriction(ctx(),state);if(r!=='ready')return;if(!window.SPM_PELVIC_V2?.open){status('El entrenamiento todavía está cargando. Inténtalo de nuevo.',false);return;}const verified=clone(state);if(await close())window.SPM_PELVIC_V2.open({readiness:()=>restriction(ctx(),verified)});};
}
let scheduled=false;
function mount(){
 scheduled=false;const plan=document.getElementById('plan');if(!plan||!ctx())return;
 if(!document.getElementById('spmPelvicLabEntry')){const box=document.createElement('section');box.id='spmPelvicLabEntry';box.className='card spm-pf-entry';box.innerHTML='<div><span>SPM · PISO PÉLVICO</span><h3>Lab diario y entrenamiento de contracciones</h3><p>Conciencia, relajación y coordinación cada día. El módulo de contracciones conserva su pauta aparte.</p></div><button type="button" class="btn sec" data-pf-hub>Abrir Piso Pélvico</button>';plan.appendChild(box);box.querySelector('button').onclick=()=>openHub({origin:'library'});}
 document.querySelectorAll('.dayCard').forEach(card=>{const panel=card.querySelector('.pfi-mode-panel');if(!panel||panel.querySelector('[data-pf-lab]'))return;const b=document.createElement('button');b.type='button';b.className='btn sec';b.dataset.pfLab='1';b.textContent='Conciencia y relajación · Pelvic Floor Lab';b.onclick=()=>open({origin:'library',day:Number(card.querySelector('.dayNum')?.textContent)});panel.appendChild(b);});
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(mount);}
const observer=new MutationObserver(schedule);observer.observe(document.getElementById('plan')||document.body,{childList:true,subtree:true});
document.addEventListener('click',e=>{if(e.target.closest('#logoutBtn,#newAssessment')&&modal)dispose();},true);
window.addEventListener('spm:session-change',e=>{if(modal&&e.detail?.userId!==scope.split(':')[0])dispose();});
window.addEventListener('spm:resourcecontext',()=>{if(modal&&!sameContext())dispose();});
window.addEventListener('spm:open-lab',e=>{if(['pelvic','pelvic-floor'].includes(e.detail?.lab))openHub(e.detail||{});});
window.addEventListener('pagehide',()=>{clearTimeout(timer);});
const style=document.createElement('style');style.textContent='.spm-pf-modal{padding:0;border:1px solid #31545c;border-radius:20px;background:#08151c;color:#edf8f6;width:min(1120px,calc(100vw - 12px));height:94dvh;max-width:100%;max-height:96dvh;overflow:hidden}.spm-pf-modal::backdrop{background:#020a10ec}.spm-pf-shell{height:100%;display:flex;flex-direction:column}.spm-pf-shell>header{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;padding:9px 12px;border-bottom:1px solid #31545c}.spm-pf-shell>header button,.spm-pf-choice button{min-height:44px;border-radius:10px;border:1px solid #42616a;background:#17343e;color:#eef8f6;padding:9px 13px;cursor:pointer}.spm-pf-shell>header span{font-size:11px;color:#88cdbb}.spm-pf-shell>header span[data-error=true]{color:#e5be76}.spm-pf-shell>main{flex:1;min-height:0;overflow:auto}.spm-pf-shell iframe{width:100%;height:100%;border:0;display:block;background:#08151c}.spm-pf-choice{padding:24px;max-width:850px;margin:auto}.spm-pf-choice>span,.spm-pf-choice small,.spm-pf-entry span{color:#d8ba75;font-size:10px;letter-spacing:.09em;font-weight:800}.spm-pf-choice h1{font-size:30px;line-height:1.2}.spm-pf-choice p{line-height:1.6;color:#afc3c7}.spm-pf-choice article{padding:20px;border:1px solid #31545c;border-radius:16px;margin-top:14px;background:#10252e}.spm-pf-choice h2{font-size:23px;margin:8px 0}.spm-pf-choice button{background:#7ee1c5;color:#06221b;font-weight:800}.spm-pf-choice button:disabled{opacity:.5;cursor:not-allowed}.spm-pf-small{font-size:13px}.spm-pf-entry{display:flex;align-items:center;justify-content:space-between;gap:16px}.spm-pf-entry p{color:var(--muted)}[data-pf-lab]{margin-top:12px;width:100%}@media(max-width:600px){.spm-pf-entry{flex-direction:column;align-items:stretch}.spm-pf-choice{padding:18px}.spm-pf-shell>header span{max-width:48%}}';document.head.appendChild(style);
window.SPM_PELVIC_LAB={open,openScheduled,close,flush,validState,restriction};window.SPM_PELVIC_HUB={open:openHub};schedule();
})();
