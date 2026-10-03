(()=>{'use strict';
if(window.SPM_SENSATE_LAB)return;
const keys=['spm-sensate-state','spm-sensate-records'];
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.(),scopeOf=c=>c?c.userId+':'+c.planId:'',clone=x=>JSON.parse(JSON.stringify(x));
const restriction=c=>!c||c.safety==='urgent'?'urgent':c.safety!=='none'||c.flags?.length||c.checkins?.some(x=>x.new_safety_flag)?'review':'none';
function relevant(c){return !!c && ['erection','ejaculation','desire','confidence','anxiety','wellbeing'].some(x=>c.primary===x||c.secondary===x||c.motives?.includes(x));}
function validState(s){return !!s&&typeof s==='object'&&!Array.isArray(s)&&JSON.stringify(s).length<700000&&Object.entries(s).every(([k,v])=>keys.includes(k)&&typeof v==='string'&&v.length<350000);}
let modal=null,scope='',state={},day=1,origin='library',dirty=0,saved=0,timer=0,watch=0,flight=null,generation=0,lastFocus=null;
function status(text,error=false){const el=modal?.querySelector('[data-sensate-status]');if(el){el.textContent=text;el.dataset.error=String(error);}const retry=modal?.querySelector('[data-sensate-retry]');if(retry)retry.hidden=!error;}
function notify(){modal?.querySelector('iframe')?.contentWindow?.dispatchEvent(new Event('spm:sensate-context'));}
async function flush(){
 clearTimeout(timer);const token=generation;
 if(flight){await flight;if(token===generation&&dirty>saved)return flush();return;}
 if(dirty===saved)return;
 const captured=scope,revision=dirty,payload=clone(state);
 if(scopeOf(ctx())!==captured)throw Error('Program changed');
 status('Guardando en tu programa…');const request=window.SPM_SENSATE_RECORDS.save(payload,captured,day);flight=request;
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
function dispose(){generation++;clearTimeout(timer);clearInterval(watch);modal?.close();modal?.remove();modal=null;delete window.SPM_SENSATE_LAB_HOST;state={};scope='';dirty=saved=0;flight=null;lastFocus?.focus?.();}
async function close(){if(!modal)return true;modal.querySelector('iframe')?.contentWindow?.dispatchEvent(new Event('pagehide'));try{await flush();}catch{return false;}dispose();return true;}
async function open(opts={}){
 if(modal&&!await close())return false;
 const c=ctx();if(!c)return false;
 scope=scopeOf(c);day=Math.min(28,Math.max(1,Number(c.day)||1));origin=['erectile','ejaculation','dailyPlan'].includes(opts.origin)?opts.origin:'library';state={};dirty=saved=0;
 lastFocus=document.activeElement;modal=document.createElement('dialog');modal.className='spm-sensate-modal';modal.setAttribute('aria-label','Focalización sensorial SPM');
 modal.innerHTML='<header><button type="button" data-sensate-close>← Volver a '+(origin==='erectile'?'DE':origin==='ejaculation'?'EP':'mi programa')+'</button><span role="status" data-sensate-status>Cargando tu progreso…</span><button type="button" data-sensate-retry hidden>Reintentar guardado</button></header><main></main>';
 document.body.appendChild(modal);modal.showModal();modal.querySelector('[data-sensate-close]').onclick=close;modal.querySelector('[data-sensate-retry]').onclick=()=>flush().catch(()=>{});modal.addEventListener('cancel',e=>{e.preventDefault();close();});
 const token=++generation,captured=scope;
 let lastRestriction=restriction(c);
 watch=setInterval(()=>{const current=ctx();if(scopeOf(current)!==scope || Number(current?.day || 1)!==day){dispose();return;}const r=restriction(current);if(lastRestriction!==r){lastRestriction=r;notify();}},300);
 try{
  const value=await window.SPM_SENSATE_RECORDS.read(captured);if(token!==generation||scopeOf(ctx())!==captured)return false;if(!validState(value))throw Error('Invalid state');state=clone(value);
  window.SPM_SENSATE_LAB_HOST={flush,close,openControl:async()=>{if(await close())window.SPM_EJACULATORY_CONTROL?.open?.(day);},getState:()=>token===generation&&scopeOf(ctx())===captured?clone(state):{},write:(k,v)=>token===generation&&write(k,v),getContext:()=>({day,origin,restriction:token===generation&&scopeOf(ctx())===captured?restriction(ctx()):'urgent'})};
  const frame=document.createElement('iframe');frame.title='Focalización sensorial · Focalización sensorial';frame.allow='autoplay';frame.src='sensate-lab/index.html?origin='+(['dailyPlan','erectile','ejaculation'].includes(origin)?'dailyPlan':'library');modal.querySelector('main').replaceChildren(frame);status('Progreso conectado a tu programa');return true;
 }catch{if(token!==generation)return false;status('No pudimos recuperar tu progreso. Vuelve a intentarlo.',true);modal.querySelector('[data-sensate-retry]').onclick=()=>open(opts);return false;}
}
let scheduled=false;
function mount(){
 scheduled=false;const plan=document.getElementById('plan'),c=ctx();if(!plan||!c)return;
 let box=document.getElementById('spmSensateLabEntry');if(!box){box=document.createElement('section');box.id='spmSensateLabEntry';box.className='card';box.innerHTML='<span>SPM · FOCALIZACIÓN SENSORIAL</span><h3>Focalización sensorial</h3><p data-sensate-reason></p><button type="button" class="btn sec">Abrir programa de Focalización sensorial</button>';plan.appendChild(box);box.querySelector('button').onclick=()=>open({origin:'library'});}
 const text=relevant(c)?'Apoyo para tu ruta: practica focalización sensorial junto a tu programa principal, conservando el mismo día y progreso.':'Explora los recursos de focalización sensorial cuando los necesites.';const p=box.querySelector('p');if(p.textContent!==text)p.textContent=text;
 plan.querySelectorAll('.dayCard').forEach(card=>{const existing=card.querySelector('[data-sensate-daily]');if(!relevant(c)){existing?.remove();return;}if(existing)return;const b=document.createElement('button');b.type='button';b.className='btn sec';b.dataset.sensateDaily='1';b.textContent='Focalización sensorial · apoyo para hoy';b.onclick=()=>open({origin:c.primary==='erection'?'erectile':c.primary==='ejaculation'?'ejaculation':'dailyPlan'});card.appendChild(b);});
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(mount);}}
new MutationObserver(schedule).observe(document.getElementById('plan')||document.body,{subtree:true,childList:true});
window.addEventListener('spm:open-lab',e=>{if(['sensate','sensate-focus','focalizacion'].includes(e.detail?.lab))open(e.detail||{});});
document.addEventListener('click',e=>{if(e.target.closest('#logoutBtn,#newAssessment')&&modal)dispose();},true);
window.addEventListener('spm:session-change',()=>{if(modal&&scopeOf(ctx())!==scope)dispose();schedule();});
const style=document.createElement('style');style.textContent='.spm-sensate-modal{padding:0;border:1px solid #31545c;border-radius:18px;background:#07171f;color:#eef8f6;width:min(1120px,calc(100vw - 12px));height:94dvh;max-height:96dvh;overflow:hidden}.spm-sensate-modal[open]{display:flex;flex-direction:column}.spm-sensate-modal::backdrop{background:#020a10ed}.spm-sensate-modal>header{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;padding:10px;border-bottom:1px solid #31545c}.spm-sensate-modal button{min-height:44px;background:#17343e;border:1px solid #42616a;border-radius:10px;color:#eef8f6;padding:8px 12px}.spm-sensate-modal>header span{font-size:12px;color:#a3d3c7}.spm-sensate-modal>main{flex:1;min-height:0}.spm-sensate-modal iframe{width:100%;height:100%;border:0}#spmSensateLabEntry>span{color:#d8ba75;font-size:11px;letter-spacing:.1em}[data-sensate-daily]{margin-top:12px}';document.head.appendChild(style);
window.SPM_SENSATE_LAB={open,close,flush,validState,relevant,restriction};schedule();
})();
