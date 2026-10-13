(()=>{'use strict';
if(window.SPM_BREATHING_LAB)return;
const keys=['spmb-step','spmb-origin','spmb-nohold','spmb-sessions','spmb-plan','spm_breathing_competency_v1'];
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.(),scopeOf=c=>c?c.userId+':'+c.planId:'',clone=x=>JSON.parse(JSON.stringify(x));
const restriction=c=>!c||c.safety==='urgent'?'urgent':c.safety!=='none'||c.flags?.length||c.checkins?.some(x=>x.new_safety_flag)?'review':'none';
function relevant(c){return !!c && ['erection','ejaculation','desire'].some(x=>c.primary===x||c.secondary===x||c.motives?.includes(x));}
function validState(s){
 try{
  if(!s||typeof s!=='object'||Array.isArray(s)||JSON.stringify(s).length>100000)return false;
  return Object.entries(s).every(([k,v])=>{
   if(!keys.includes(k)||typeof v!=='string')return false;const x=JSON.parse(v);
   if(k==='spmb-step')return Number.isInteger(x)&&x>=0&&x<18;
   if(k==='spmb-origin')return x===null||x==='library';
   if(k==='spmb-nohold')return typeof x==='boolean';
   if(k==='spmb-plan')return Array.isArray(x)&&x.length<=28&&x.every(d=>Number.isInteger(d)&&d>=1&&d<=28);
   if(k==='spm_breathing_competency_v1')return !!x&&typeof x.technique==='boolean'&&typeof x.tolerance==='boolean';
   return Array.isArray(x)&&x.length<=60&&x.every(r=>r&&typeof r.date==='string'&&Number.isFinite(Date.parse(r.date))&&typeof r.practice==='string'&&Number.isFinite(r.seconds)&&r.seconds>=0&&r.seconds<=600&&Number.isFinite(r.comfort)&&r.comfort>=1&&r.comfort<=5&&typeof r.dizzy==='boolean'&&typeof r.noHold==='boolean'&&(r.day===undefined||Number.isInteger(r.day)&&r.day>=1&&r.day<=28));
  });
 }catch{return false;}
}
let modal=null,scope='',state={},day=1,origin='library',launchStep=null,activity=null,mode='library',dirty=0,saved=0,timer=0,watch=0,flight=null,generation=0,lastFocus=null,returnToDesire=false;
function status(text,error=false){const el=modal?.querySelector('[data-breathing-status]');if(el){el.textContent=text;el.dataset.error=String(error);}const retry=modal?.querySelector('[data-breathing-retry]');if(retry)retry.hidden=!error;}
function notify(){modal?.querySelector('iframe')?.contentWindow?.dispatchEvent(new Event('spm:breathing-context'));}
async function flush(){
 clearTimeout(timer);const token=generation;
 if(flight){await flight;if(token===generation&&dirty>saved)return flush();return;}
 if(dirty===saved)return;
 const captured=scope,revision=dirty,payload=clone(state);
 if(scopeOf(ctx())!==captured)throw Error('Program changed');
 status('Guardando en tu programa…');const request=window.SPM_BREATHING_RECORDS.save(payload,captured,day);flight=request;
 try{await request;if(token!==generation||scope!==captured)return;saved=revision;status('Guardado en tu programa ✓');}
 catch(e){if(token===generation)status('No se pudo guardar. Conserva esta pantalla y reintenta.',true);throw e;}
 finally{if(flight===request)flight=null;}
 if(token===generation&&dirty>saved)return flush();
}
function write(k,v){
 if(!modal||scopeOf(ctx())!==scope||!keys.includes(k)||typeof v!=='string')return false;
 const next={...state,[k]:v};if(!validState(next))return false;if(state[k]===v)return true;
 state=next;dirty++;status('Cambios pendientes de guardar…');clearTimeout(timer);timer=setTimeout(()=>flush().catch(()=>{}),600);return true;
}
function dispose(){window.SPM_PROGRAM_VIDEOS?.unmount(modal?.querySelector('iframe')?.contentDocument?.body);generation++;clearTimeout(timer);clearInterval(watch);modal?.close();modal?.remove();modal=null;delete window.SPM_BREATHING_LAB_HOST;state={};scope='';dirty=saved=0;flight=null;lastFocus?.focus?.();}
async function close(resume=true){if(!modal)return true;modal.querySelector('iframe')?.contentWindow?.dispatchEvent(new Event('pagehide'));try{await flush();}catch{return false;}const back=returnToDesire;dispose();if(back&&resume!==false)window.SPM_DESIRE_LAB?.open({origin:"dailyPlan"});return true;}
async function open(opts={}){
 if(modal&&!await close(false))return false;
 const c=ctx();if(!c)return false;returnToDesire=opts.returnToDesire===true;
 scope=scopeOf(c);day=Math.min(28,Math.max(1,Number(c.day)||1));origin=['erectile','ejaculation','desire','dailyPlan'].includes(opts.origin)?opts.origin:'library';state={};dirty=saved=0;
 mode=origin==='library'?'library':'daily';launchStep=mode==='library'&&opts.practice==='guided'?11:null;activity=mode==='daily'?window.SPM_DAILY_SUPPORT?.activity('breathing',Number(opts.day)||day,c)||null:null;
 lastFocus=document.activeElement;modal=document.createElement('dialog');modal.className='spm-breathing-modal';modal.setAttribute('aria-label','Respiración diafragmática SPM');
 modal.innerHTML='<header><button type="button" data-breathing-close>← Volver a '+(origin==='erectile'?'DE':origin==='ejaculation'?'EP':origin==='desire'?'Deseo':'mi programa')+'</button><span role="status" data-breathing-status>Cargando tu progreso…</span><button type="button" data-breathing-retry hidden>Reintentar guardado</button></header><main></main>';
 document.body.appendChild(modal);modal.showModal();modal.querySelector('[data-breathing-close]').onclick=close;modal.querySelector('[data-breathing-retry]').onclick=()=>flush().catch(()=>{});modal.addEventListener('cancel',e=>{e.preventDefault();close();});
 const token=++generation,captured=scope;
 let lastRestriction=restriction(c);
 watch=setInterval(()=>{const current=ctx();if(scopeOf(current)!==scope || Number(current?.day || 1)!==day){dispose();return;}const r=restriction(current);if(lastRestriction!==r){lastRestriction=r;notify();}},300);
 try{
  const value=await window.SPM_BREATHING_RECORDS.read(captured);if(token!==generation||scopeOf(ctx())!==captured)return false;if(!validState(value))throw Error('Invalid state');state=clone(value);
  window.SPM_BREATHING_LAB_HOST={flush,close,openControl:async()=>{if(await close())window.SPM_EJACULATORY_CONTROL?.open?.(day);},getState:()=>token===generation&&scopeOf(ctx())===captured?clone(state):{},write:(k,v)=>token===generation&&write(k,v),openLibrary:async()=>{if(await close(false))return open({origin:'library'});return false;},getContext:()=>({day,origin,mode,activity,launchStep,restriction:token===generation&&scopeOf(ctx())===captured?restriction(ctx()):'urgent'})};
  const frame=document.createElement('iframe');frame.title='Respiración diafragmática · Respiración diafragmática';frame.allow='autoplay';frame.src='breathing-lab/index.html?v=20261013-daily1&origin='+(['dailyPlan','erectile','ejaculation'].includes(origin)?'dailyPlan':'library');modal.querySelector('main').replaceChildren(frame);status('Progreso conectado a tu programa');return true;
 }catch{if(token!==generation)return false;status('No pudimos recuperar tu progreso. Vuelve a intentarlo.',true);modal.querySelector('[data-breathing-retry]').onclick=()=>open(opts);return false;}
}
let scheduled=false;
function mount(){
 scheduled=false;const plan=document.getElementById('plan'),c=ctx();if(!plan||!c)return;
 let box=document.getElementById('spmBreathingLabEntry');if(!box){box=document.createElement('section');box.id='spmBreathingLabEntry';box.className='card';box.innerHTML='<span>SPM · RESPIRACIÓN DIAFRAGMÁTICA</span><h3>Biblioteca de respiración diafragmática</h3><p data-breathing-reason></p><button type="button" class="btn sec">Explorar biblioteca completa</button><button type="button" class="btn sec" data-breathing-guided>Abrir práctica con cronómetro y video</button>';plan.appendChild(box);box.querySelector('button').onclick=()=>open({origin:'library'});box.querySelector('[data-breathing-guided]').onclick=()=>open({origin:'library',practice:'guided'});}
 const text=relevant(c)?'Apoyo para tu ruta: practica respiración diafragmática junto a tu programa principal, conservando el mismo día de tu plan de 28 días. Úsala en los días indicados o cuando necesites este recurso.':'Explora los recursos de respiración diafragmática cuando los necesites.';const p=box.querySelector('p');if(p.textContent!==text)p.textContent=text;
 plan.querySelectorAll('.dayCard').forEach(card=>{
  const d=Number(card.querySelector('.dayNum')?.textContent||c.day),a=window.SPM_DAILY_SUPPORT?.activity('breathing',d,c),existing=card.querySelector('[data-breathing-daily]');
  if(!a){existing?.remove();return;}const b=existing||document.createElement('button');b.type='button';b.className='btn sec';b.dataset.breathingDaily='1';
  const label=a.title+' · '+a.minutes+' min';if(b.textContent!==label)b.textContent=label;b.disabled=d!==Number(c.day);b.title=b.disabled?'Actividad del día '+d:'Abrir la actividad asignada';
  b.onclick=()=>open({origin:'dailyPlan',day:d});if(!existing)(card.querySelector('.dayBody')||card).appendChild(b);
 });
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(mount);}}
new MutationObserver(schedule).observe(document.getElementById('plan')||document.body,{subtree:true,childList:true});
window.addEventListener('spm:open-lab',e=>{if(['breathing','diaphragmatic-breathing','respiracion'].includes(e.detail?.lab))open(e.detail||{});});
document.addEventListener('click',e=>{if(e.target.closest('#logoutBtn,#newAssessment')&&modal)dispose();},true);
window.addEventListener('spm:session-change',()=>{if(modal&&scopeOf(ctx())!==scope)dispose();schedule();});
const style=document.createElement('style');style.textContent='.spm-breathing-modal{padding:0;border:1px solid #31545c;border-radius:18px;background:#07171f;color:#eef8f6;width:min(1120px,calc(100vw - 12px));height:94dvh;max-height:96dvh;overflow:hidden}.spm-breathing-modal[open]{display:flex;flex-direction:column}.spm-breathing-modal::backdrop{background:#020a10ed}.spm-breathing-modal>header{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;padding:10px;border-bottom:1px solid #31545c}.spm-breathing-modal button{min-height:44px;background:#17343e;border:1px solid #42616a;border-radius:10px;color:#eef8f6;padding:8px 12px}.spm-breathing-modal>header span{font-size:12px;color:#a3d3c7}.spm-breathing-modal>main{flex:1;min-height:0}.spm-breathing-modal iframe{width:100%;height:100%;border:0}#spmBreathingLabEntry>span{color:#d8ba75;font-size:11px;letter-spacing:.1em}[data-breathing-daily]{margin-top:12px}';document.head.appendChild(style);
window.addEventListener('spm:resourcecontext',schedule);
window.SPM_BREATHING_LAB={open,close,flush,validState,relevant,restriction};schedule();
})();
