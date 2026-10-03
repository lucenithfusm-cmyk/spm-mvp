(()=>{'use strict';
if(window.SPM_PELVIC_LAB)return;
const keys=['pf-step','pf-origin','pf-assignment','pf-results','pf-daily-result','pf-flags','pf-overload','pf-screening','pf-checkins','pf-demo-config'];
const practices=['percibe','contrae','coord','rapidas','sostenidas'];
const recs=['progress','repeat','relax','clinical-review'];
const origins=['lab','library','dailyPlan'];
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.();
const scopeOf=c=>c?c.userId+':'+c.planId:'';
const clone=x=>JSON.parse(JSON.stringify(x));
const ints=(v,max)=>Array.isArray(v)&&v.length<=max+1&&v.every(x=>Number.isInteger(x)&&x>=0&&x<=max);
const result=r=>!!r&&practices.includes(r.practiceId)&&typeof r.completed==='boolean'&&[true,false,null].includes(r.cleanContraction)&&['fullRelease','discomfort','postTension'].every(k=>typeof r[k]==='boolean')&&recs.includes(r.recommendation)&&Number.isFinite(Date.parse(r.at))&&origins.includes(r.origin);
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
 const last=(s['pf-results']||[]).at(-1),check=(s['pf-checkins']||[]).at(-1),sc=s['pf-screening']||{};
 if(!c||c.safety!=='none'||c.flags?.length||c.checkins?.some(x=>x.new_safety_flag))return 'review';
 if(s['pf-flags']?.length||s['pf-overload']?.length||sc.releaseOk==='no'||check?.tension>=7||check?.release==='Difícil'||last?.discomfort||last?.postTension||['relax','clinical-review'].includes(last?.recommendation))return 'relax';
 if(sc.aware!=='ok'||sc.releaseOk!=='si'||sc.comp?.length!==3)return 'awareness';
 return 'ready';
}
let modal=null,scope='',state={},openDay=1,origin='library',lastFocus=null,dirty=0,saved=0,timer=0,inFlight=null,watch=0,generation=0;
function status(text,error=false){const el=modal?.querySelector('[data-pf-status]');if(el){el.textContent=text;el.dataset.error=String(error);}const retry=modal?.querySelector('[data-pf-retry]');if(retry)retry.hidden=!error;}
function notifyChild(){modal?.querySelector('iframe')?.contentWindow?.dispatchEvent(new Event('spm:pelvic-context'));}
async function flush(){
 clearTimeout(timer);const token=generation;
 if(inFlight){await inFlight;if(token===generation&&dirty>saved)return flush();return;}
 if(dirty===saved)return;
 const captured=scope,revision=dirty,payload=clone(state);
 if(scopeOf(ctx())!==captured)throw new Error('Program changed');
 status('Guardando en tu programa…');
 const request=window.SPM_PELVIC_RECORDS.save(payload,captured,openDay);inFlight=request;
 try{await request;if(token!==generation||scope!==captured)return;saved=revision;status('Guardado en tu programa ✓');}
 catch(error){if(token===generation&&scope===captured)status('No se pudo guardar. Conserva esta pantalla y reintenta.',true);throw error;}
 finally{if(inFlight===request)inFlight=null;}
 if(token===generation&&dirty>saved)return flush();
}
function write(k,v){
 if(!modal||scopeOf(ctx())!==scope||!validValue(k,v))return false;
 state[k]=clone(v);dirty++;status('Cambios pendientes de guardar…');
 clearTimeout(timer);timer=setTimeout(()=>flush().catch(()=>{}),700);notifyChild();return true;
}
function dispose(){
 generation++;clearTimeout(timer);clearInterval(watch);timer=watch=0;
 modal?.close();modal?.remove();modal=null;delete window.SPM_PELVIC_LAB_HOST;
 state={};scope='';dirty=saved=0;inFlight=null;lastFocus?.focus?.();
}
async function close(){if(!modal)return;try{await flush();}catch{return false;}dispose();return true;}
function shell(){
 lastFocus=document.activeElement;modal=document.createElement('dialog');modal.className='spm-pf-modal';modal.setAttribute('aria-label','Piso Pélvico SPM');
 const back=origin==='dailyPlan'?'Volver a Hoy':origin==='erectile'?'Volver a DE':'Volver a mi programa';
 modal.innerHTML='<div class="spm-pf-shell"><header><button type="button" data-pf-close>← '+back+'</button><span data-pf-status role="status">Cargando tu progreso…</span><button type="button" data-pf-retry hidden>Reintentar guardado</button></header><main data-pf-body></main></div>';
 document.body.appendChild(modal);modal.showModal();modal.querySelector('[data-pf-close]').onclick=close;
 modal.querySelector('[data-pf-retry]').onclick=()=>flush().catch(()=>{});
 modal.addEventListener('cancel',e=>{e.preventDefault();close();});
 let previous=restriction(ctx(),state);
 watch=setInterval(()=>{const c=ctx();if(scopeOf(c)!==scope){dispose();return;}const next=restriction(c,state);if(next!==previous){previous=next;notifyChild();}},500);
}
async function load(opts){
 if(modal&&!(await close()))return false;
 const c=ctx();if(!c)return false;
 scope=scopeOf(c);openDay=Number.isInteger(opts.day)&&opts.day>=1&&opts.day<=28?opts.day:Math.min(28,Math.max(1,c.day||1));origin=['dailyPlan','erectile','library'].includes(opts.origin)?opts.origin:'library';
 dirty=saved=0;state={};shell();const token=++generation,captured=scope;
 try{const value=await window.SPM_PELVIC_RECORDS.read(captured);if(token!==generation||scopeOf(ctx())!==captured)return false;if(!validState(value))throw new Error('Invalid saved state');state=clone(value);status('Progreso conectado a tu programa');return true;}
 catch{if(token!==generation)return false;status('No pudimos recuperar tu progreso.',false);modal.querySelector('[data-pf-body]').innerHTML='<section class="spm-pf-choice"><p>Reintenta para continuar con tu información guardada.</p><button type="button" data-pf-load>Volver a cargar</button></section>';modal.querySelector('[data-pf-load]').onclick=()=>opts.hub?openHub(opts):open(opts);return false;}
}
function showLab(){
 const token=generation;
 window.SPM_PELVIC_LAB_HOST={
  getState:()=>token===generation?clone(state):{},write:(k,v)=>token===generation&&write(k,v),close:()=>token===generation?close():Promise.resolve(false),
  getContext:()=>({day:openDay,origin,restriction:token===generation?restriction(ctx(),state):'review'}),
 };
 const frame=document.createElement('iframe');frame.title='Pelvic Floor Lab · Conciencia y relajación';frame.allow='autoplay';frame.src='pelvic-floor-lab/index.html?v=20261003-pf1';
 modal.querySelector('[data-pf-body]').replaceChildren(frame);
}
async function open(opts={}){if(await load(opts))showLab();}
async function openHub(opts={}){
 if(!await load({...opts,hub:true}))return;
 const route=restriction(ctx(),state),ready=route==='ready';
 const why=route==='review'?'Hay información de seguridad pendiente de revisión. Puedes consultar el contenido educativo; las prácticas quedan en pausa.':route==='relax'?'Tus registros orientan a conciencia y relajación. El entrenamiento de contracciones queda en pausa.':ready?'Has registrado localización, técnica y relajación completas. Puedes continuar el entrenamiento y consultar el Lab como apoyo.':'Empieza por reconocer la musculatura y aprender a soltar. Tu entrenamiento de 28 días conserva su calendario y progreso.';
 modal.querySelector('[data-pf-body]').innerHTML='<section class="spm-pf-choice"><span>SPM · PISO PÉLVICO</span><h1>Dos recursos para tu evolución</h1><p>'+why+'</p><article><small>'+(ready?'EDUCACIÓN Y APOYO':'RECOMENDADO PARA EMPEZAR')+'</small><h2>Conciencia y relajación</h2><p>Pelvic Floor Lab: identifica, respira y coordina con el entrenador SPM.</p><button type="button" data-pf-education>Abrir Pelvic Floor Lab</button></article><article><small>'+(ready?'CONTINUAR TU PRÁCTICA':'PROGRAMA DE ENTRENAMIENTO')+'</small><h2>Entrenamiento progresivo</h2><p>Tu programa interactivo de 7 pasos y calendario de 28 días.</p><button type="button" data-pf-training '+(route==='review'||route==='relax'?'disabled':'')+'>Abrir entrenamiento actual</button></article><p class="spm-pf-small">Una práctica principal por sesión. No necesitas sumar dos rutinas completas.</p></section>';
 modal.querySelector('[data-pf-education]').onclick=showLab;
 modal.querySelector('[data-pf-training]').onclick=async()=>{const r=restriction(ctx(),state);if(['review','relax'].includes(r))return;if(!window.SPM_PELVIC_V2?.open){status('El entrenamiento todavía está cargando. Inténtalo de nuevo.',false);return;}if(await close())window.SPM_PELVIC_V2.open();};
}
let scheduled=false;
function mount(){
 scheduled=false;const plan=document.getElementById('plan');if(!plan||!ctx())return;
 if(!document.getElementById('spmPelvicLabEntry')){const box=document.createElement('section');box.id='spmPelvicLabEntry';box.className='card spm-pf-entry';box.innerHTML='<div><span>SPM · PISO PÉLVICO</span><h3>Conciencia, relajación y entrenamiento</h3><p>Aprende con Pelvic Floor Lab y continúa tu programa de 28 días.</p></div><button type="button" class="btn sec" data-pf-hub>Abrir Piso Pélvico</button>';plan.appendChild(box);box.querySelector('button').onclick=()=>openHub({origin:'library'});}
 document.querySelectorAll('.dayCard').forEach(card=>{const panel=card.querySelector('.pfi-mode-panel');if(!panel||panel.querySelector('[data-pf-lab]'))return;const b=document.createElement('button');b.type='button';b.className='btn sec';b.dataset.pfLab='1';b.textContent='Conciencia y relajación · Pelvic Floor Lab';b.onclick=()=>open({origin:'dailyPlan',day:Number(card.querySelector('.dayNum')?.textContent)});panel.appendChild(b);});
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(mount);}
const observer=new MutationObserver(schedule);observer.observe(document.getElementById('plan')||document.body,{childList:true,subtree:true});
document.addEventListener('click',e=>{if(e.target.closest('#logoutBtn,#newAssessment')&&modal)dispose();},true);
window.addEventListener('spm:session-change',e=>{if(modal&&e.detail?.userId!==scope.split(':')[0])dispose();});
window.addEventListener('spm:open-lab',e=>{if(['pelvic','pelvic-floor'].includes(e.detail?.lab))openHub(e.detail||{});});
window.addEventListener('pagehide',()=>{clearTimeout(timer);});
const style=document.createElement('style');style.textContent='.spm-pf-modal{padding:0;border:1px solid #31545c;border-radius:20px;background:#08151c;color:#edf8f6;width:min(1120px,calc(100vw - 12px));height:94dvh;max-width:100%;max-height:96dvh;overflow:hidden}.spm-pf-modal::backdrop{background:#020a10ec}.spm-pf-shell{height:100%;display:flex;flex-direction:column}.spm-pf-shell>header{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;padding:9px 12px;border-bottom:1px solid #31545c}.spm-pf-shell>header button,.spm-pf-choice button{min-height:44px;border-radius:10px;border:1px solid #42616a;background:#17343e;color:#eef8f6;padding:9px 13px;cursor:pointer}.spm-pf-shell>header span{font-size:11px;color:#88cdbb}.spm-pf-shell>header span[data-error=true]{color:#e5be76}.spm-pf-shell>main{flex:1;min-height:0;overflow:auto}.spm-pf-shell iframe{width:100%;height:100%;border:0;display:block;background:#08151c}.spm-pf-choice{padding:24px;max-width:850px;margin:auto}.spm-pf-choice>span,.spm-pf-choice small,.spm-pf-entry span{color:#d8ba75;font-size:10px;letter-spacing:.09em;font-weight:800}.spm-pf-choice h1{font-size:30px;line-height:1.2}.spm-pf-choice p{line-height:1.6;color:#afc3c7}.spm-pf-choice article{padding:20px;border:1px solid #31545c;border-radius:16px;margin-top:14px;background:#10252e}.spm-pf-choice h2{font-size:23px;margin:8px 0}.spm-pf-choice button{background:#7ee1c5;color:#06221b;font-weight:800}.spm-pf-choice button:disabled{opacity:.5;cursor:not-allowed}.spm-pf-small{font-size:13px}.spm-pf-entry{display:flex;align-items:center;justify-content:space-between;gap:16px}.spm-pf-entry p{color:var(--muted)}[data-pf-lab]{margin-top:12px;width:100%}@media(max-width:600px){.spm-pf-entry{flex-direction:column;align-items:stretch}.spm-pf-choice{padding:18px}.spm-pf-shell>header span{max-width:48%}}';document.head.appendChild(style);
window.SPM_PELVIC_LAB={open,close,flush,validState,restriction};window.SPM_PELVIC_HUB={open:openHub};schedule();
})();
