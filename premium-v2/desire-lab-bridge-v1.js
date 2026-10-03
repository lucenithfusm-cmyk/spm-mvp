(()=>{'use strict';
if(window.SPM_DESIRE_LAB)return;
const keys=['spm-desire-state','spm-desire-profile','spm-desire-step','spm-desire-origin','spm-desire-today','spm-desire-program','spm-desire-ctx','spm-assessment-log'];
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.(),scopeOf=c=>c?c.userId+':'+c.planId:'',clone=x=>JSON.parse(JSON.stringify(x));
const restriction=c=>!c||c.safety==='urgent'?'urgent':c.safety!=='none'||c.flags?.length||c.checkins?.some(x=>x.new_safety_flag)?'review':'none';
function relevant(c){return !!(c&&(c.primary==='desire'||c.secondary==='desire'||c.motives?.includes('desire')));}
function validState(s){return !!s&&typeof s==='object'&&!Array.isArray(s)&&JSON.stringify(s).length<700000&&Object.entries(s).every(([k,v])=>keys.includes(k)&&typeof v==='string'&&v.length<350000);}
let modal=null,scope='',state={},day=1,origin='library',dirty=0,saved=0,timer=0,watch=0,flight=null,generation=0,lastFocus=null;
function status(text,error=false){const el=modal?.querySelector('[data-desire-status]');if(el){el.textContent=text;el.dataset.error=String(error);}const retry=modal?.querySelector('[data-desire-retry]');if(retry)retry.hidden=!error;}
function notify(){modal?.querySelector('iframe')?.contentWindow?.dispatchEvent(new Event('spm:desire-context'));}
async function flush(){
 clearTimeout(timer);const token=generation;
 if(flight){await flight;if(token===generation&&dirty>saved)return flush();return;}
 if(dirty===saved)return;
 const captured=scope,revision=dirty,payload=clone(state);
 if(scopeOf(ctx())!==captured)throw Error('Program changed');
 status('Guardando en tu programa…');const request=window.SPM_DESIRE_RECORDS.save(payload,captured,day);flight=request;
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
function dispose(){generation++;clearTimeout(timer);clearInterval(watch);modal?.close();modal?.remove();modal=null;delete window.SPM_DESIRE_LAB_HOST;state={};scope='';dirty=saved=0;flight=null;lastFocus?.focus?.();}
async function close(){if(!modal)return true;modal.querySelector('iframe')?.contentWindow?.dispatchEvent(new Event('pagehide'));try{await flush();}catch{return false;}dispose();return true;}
async function open(opts={}){
 if(modal&&!await close())return false;
 const c=ctx();if(!c)return false;
 scope=scopeOf(c);day=Math.min(28,Math.max(1,Number(c.day)||1));origin=['erectile','ejaculation','dailyPlan'].includes(opts.origin)?opts.origin:'library';state={};dirty=saved=0;
 lastFocus=document.activeElement;modal=document.createElement('dialog');modal.className='spm-desire-modal';modal.setAttribute('aria-label','Deseo SPM');
 modal.innerHTML='<header><button type="button" data-desire-close>← Volver a '+(origin==='erectile'?'DE':origin==='ejaculation'?'EP':'mi programa')+'</button><span role="status" data-desire-status>Cargando tu progreso…</span><button type="button" data-desire-retry hidden>Reintentar guardado</button></header><main></main>';
 document.body.appendChild(modal);modal.showModal();modal.querySelector('[data-desire-close]').onclick=close;modal.querySelector('[data-desire-retry]').onclick=()=>flush().catch(()=>{});modal.addEventListener('cancel',e=>{e.preventDefault();close();});
 const token=++generation,captured=scope;
 let lastRestriction=restriction(c);
 watch=setInterval(()=>{const current=ctx();if(scopeOf(current)!==scope || Number(current?.day || 1)!==day){dispose();return;}const r=restriction(current);if(lastRestriction!==r){lastRestriction=r;notify();}},300);
 try{
  const value=await window.SPM_DESIRE_RECORDS.read(captured);if(token!==generation||scopeOf(ctx())!==captured)return false;if(!validState(value))throw Error('Invalid state');state=clone(value);
  window.SPM_DESIRE_LAB_HOST={getState:()=>token===generation&&scopeOf(ctx())===captured?clone(state):{},write:(k,v)=>token===generation&&write(k,v),getContext:()=>({day,origin,restriction:token===generation&&scopeOf(ctx())===captured?restriction(ctx()):'urgent'})};
  const frame=document.createElement('iframe');frame.title='Deseo · Conoce y explora tu deseo';frame.allow='autoplay';frame.src='desire-lab/index.html?origin='+(['dailyPlan','erectile','ejaculation'].includes(origin)?'dailyPlan':'library');modal.querySelector('main').replaceChildren(frame);status('Progreso conectado a tu programa');return true;
 }catch{if(token!==generation)return false;status('No pudimos recuperar tu progreso. Vuelve a intentarlo.',true);modal.querySelector('[data-desire-retry]').onclick=()=>open(opts);return false;}
}
let scheduled=false;
function mount(){
 scheduled=false;const plan=document.getElementById('plan'),c=ctx();if(!plan||!c)return;
 let box=document.getElementById('spmDesireLabEntry');if(!box){box=document.createElement('section');box.id='spmDesireLabEntry';box.className='card';box.innerHTML='<span>SPM · DESEO</span><h3>Conoce y explora tu deseo</h3><p data-desire-reason></p><button type="button" class="btn sec">Abrir programa de Deseo</button>';plan.appendChild(box);box.querySelector('button').onclick=()=>open({origin:'library'});}
 const text=relevant(c)?'Apoyo para tu ruta: trabaja el deseo junto a tu programa principal, conservando el mismo día y progreso.':'Explora los recursos de deseo cuando los necesites.';const p=box.querySelector('p');if(p.textContent!==text)p.textContent=text;
 plan.querySelectorAll('.dayCard').forEach(card=>{const existing=card.querySelector('[data-desire-daily]');if(!relevant(c)){existing?.remove();return;}if(existing)return;const b=document.createElement('button');b.type='button';b.className='btn sec';b.dataset.desireDaily='1';b.textContent='Deseo · apoyo para hoy';b.onclick=()=>open({origin:c.primary==='erection'?'erectile':c.primary==='ejaculation'?'ejaculation':'dailyPlan'});card.appendChild(b);});
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(mount);}}
new MutationObserver(schedule).observe(document.getElementById('plan')||document.body,{subtree:true,childList:true});
window.addEventListener('spm:open-lab',e=>{if(['desire','low-desire','desire-activation','deseo'].includes(e.detail?.lab))open(e.detail||{});});
document.addEventListener('click',e=>{if(e.target.closest('#logoutBtn,#newAssessment')&&modal)dispose();},true);
window.addEventListener('spm:session-change',()=>{if(modal&&scopeOf(ctx())!==scope)dispose();schedule();});
const style=document.createElement('style');style.textContent='.spm-desire-modal{padding:0;border:1px solid #31545c;border-radius:18px;background:#07171f;color:#eef8f6;width:min(1120px,calc(100vw - 12px));height:94dvh;max-height:96dvh;overflow:hidden}.spm-desire-modal[open]{display:flex;flex-direction:column}.spm-desire-modal::backdrop{background:#020a10ed}.spm-desire-modal>header{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;padding:10px;border-bottom:1px solid #31545c}.spm-desire-modal button{min-height:44px;background:#17343e;border:1px solid #42616a;border-radius:10px;color:#eef8f6;padding:8px 12px}.spm-desire-modal>header span{font-size:12px;color:#a3d3c7}.spm-desire-modal>main{flex:1;min-height:0}.spm-desire-modal iframe{width:100%;height:100%;border:0}#spmDesireLabEntry>span{color:#d8ba75;font-size:11px;letter-spacing:.1em}[data-desire-daily]{margin-top:12px}';document.head.appendChild(style);
window.SPM_DESIRE_LAB={open,close,flush,validState,relevant,restriction};schedule();
})();
