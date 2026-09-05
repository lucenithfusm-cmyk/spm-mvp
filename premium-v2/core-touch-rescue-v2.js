(()=>{
'use strict';
if(window.SPM_CORE_TOUCH_RESCUE_V2)return;
window.SPM_CORE_TOUCH_RESCUE_V2=true;

const style=document.createElement('style');
style.textContent=`#appScreen button,#authScreen button,#appScreen input,#appScreen select,#appScreen textarea{touch-action:manipulation!important;-webkit-tap-highlight-color:rgba(112,221,194,.18)}#appScreen button:not(:disabled),#authScreen button:not(:disabled){pointer-events:auto!important;position:relative;z-index:2}`;
document.head.appendChild(style);

const ROOTS=['#ageCard','#motiveCard','#quizCard','.side','#map','#coach','#progressPanel','#authScreen'];
let lastRescue=0;
let assessmentCount=0;
let historyReady=false;

function visible(el){
  if(!el||el.disabled)return false;
  const r=el.getBoundingClientRect();
  if(!r.width||!r.height)return false;
  const cs=getComputedStyle(el);
  return cs.display!=='none'&&cs.visibility!=='hidden'&&cs.pointerEvents!=='none';
}

function candidates(){
  return [...document.querySelectorAll(ROOTS.map(r=>`${r} button:not(:disabled),${r} [role="button"]`).join(','))].filter(visible);
}

function underPoint(x,y){
  const stack=document.elementsFromPoint?.(x,y)||[];
  for(const node of stack){
    const btn=node.closest?.('button:not(:disabled),[role="button"]');
    if(btn&&ROOTS.some(r=>btn.closest(r))&&visible(btn))return btn;
  }
  return candidates().find(el=>{const r=el.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom})||null;
}

function pointFromEvent(e){
  const t=e.changedTouches?.[0]||e.touches?.[0];
  if(t)return {x:t.clientX,y:t.clientY};
  if(Number.isFinite(e.clientX)&&Number.isFinite(e.clientY))return {x:e.clientX,y:e.clientY};
  return null;
}

function advanceAge(value){
  const age=document.getElementById('ageCard');
  const motive=document.getElementById('motiveCard');
  if(!age||!motive||age.hidden)return false;
  if(String(value)==='1'){
    age.hidden=true;
    motive.hidden=false;
    motive.scrollIntoView?.({block:'start',behavior:'auto'});
  }else{
    const status=document.getElementById('status');
    if(status){status.className='notice warn globalStatus';status.textContent='SPM Premium está disponible únicamente para mayores de 18 años.';status.hidden=false;}
  }
  return true;
}

function invoke(el,event){
  if(!el)return false;
  if(el.matches?.('[data-age]'))return advanceAge(el.dataset.age);
  try{
    if(typeof el.onclick==='function'){
      el.onclick.call(el,event);
      return true;
    }
    el.click?.();
    return true;
  }catch(err){console.error('SPM core interaction rescue',err);return false;}
}

function rescue(e){
  const p=pointFromEvent(e);if(!p)return;
  const el=underPoint(p.x,p.y);if(!el)return;
  if(invoke(el,e)){
    lastRescue=Date.now();
    if(e.cancelable)e.preventDefault();
    e.stopImmediatePropagation?.();
  }
}

window.addEventListener('touchend',rescue,{capture:true,passive:false});
window.addEventListener('pointerup',rescue,{capture:true,passive:false});
window.addEventListener('click',e=>{
  const ageBtn=e.target?.closest?.('[data-age]');
  if(ageBtn){
    if(advanceAge(ageBtn.dataset.age)){
      if(e.cancelable)e.preventDefault();
      e.stopImmediatePropagation?.();
      return;
    }
  }
  if(Date.now()-lastRescue<500){
    if(e.cancelable)e.preventDefault();
    e.stopImmediatePropagation?.();
  }
},{capture:true});

function bindAgeGate(){
  document.querySelectorAll('#ageCard [data-age]').forEach(btn=>{
    if(btn.dataset.spmGateBound)return;
    btn.dataset.spmGateBound='1';
    btn.type='button';
    const go=e=>{
      if(advanceAge(btn.dataset.age)){
        if(e?.cancelable)e.preventDefault();
        e?.stopImmediatePropagation?.();
      }
    };
    btn.addEventListener('pointerdown',go,{capture:true,passive:false});
    btn.addEventListener('touchstart',go,{capture:true,passive:false});
    btn.addEventListener('click',go,{capture:true});
  });
}

function showHistoryMessage(text,kind='good'){
  const status=document.getElementById('status');
  if(!status)return;
  status.className=`notice ${kind} globalStatus`;
  status.textContent=text;
  status.hidden=false;
}

function enforceAssessmentLimit(){
  const btn=document.getElementById('newAssessment');
  if(!btn)return;
  if(assessmentCount>=2){
    btn.hidden=true;
    btn.disabled=true;
    btn.setAttribute('aria-hidden','true');
  }else{
    btn.hidden=false;
    btn.disabled=false;
    btn.removeAttribute('aria-hidden');
  }
}

function bindNewAssessmentGuard(){
  const btn=document.getElementById('newAssessment');
  if(!btn||btn.dataset.spmHistoryBound)return;
  btn.dataset.spmHistoryBound='1';
  btn.addEventListener('click',e=>{
    if(!historyReady)return;
    if(assessmentCount>=2){
      if(e.cancelable)e.preventDefault();
      e.stopImmediatePropagation?.();
      showHistoryMessage('Ya tienes dos evaluaciones guardadas. SPM conserva ambas y bloquea nuevas reevaluaciones para proteger tu historial y tus planes.','warn');
      return;
    }
    // Returning adults do not repeat the age gate when starting their one allowed reevaluation.
    setTimeout(()=>{
      const age=document.getElementById('ageCard');
      const motive=document.getElementById('motiveCard');
      if(age&&motive){age.hidden=true;motive.hidden=false;}
    },0);
  },{capture:true});
}

function routeReturningUserToProgram(){
  if(assessmentCount<1)return;
  const age=document.getElementById('ageCard');
  if(age)age.hidden=true;
  const motive=document.getElementById('motiveCard');
  const quiz=document.getElementById('quizCard');
  if(motive)motive.hidden=true;
  if(quiz)quiz.hidden=true;

  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    const planBtn=document.getElementById('navPlan');
    const dayGrid=document.getElementById('dayGrid');
    if(planBtn&&!planBtn.disabled&&dayGrid&&dayGrid.children.length){
      planBtn.click();
      clearInterval(timer);
      showHistoryMessage(assessmentCount>=2?'Tus dos evaluaciones y tu programa están conservados. Se cargó tu plan más reciente.':'Tu evaluación y tu programa anterior se cargaron correctamente.');
    }else if(tries>=20){
      clearInterval(timer);
    }
  },250);
}

async function initHistoryGuard(){
  // core-touch-rescue loads before Supabase; wait for the client library without blocking the app.
  let tries=0;
  while(!window.supabase&&tries<40){await new Promise(r=>setTimeout(r,100));tries++;}
  if(!window.supabase)return;
  try{
    const db=window.supabase.createClient('https://jogirmziqjlsttbbarcx.supabase.co','sb_publishable_jXmxa5K6ThK9C8DPIxmVVQ_mbuLWVaf');
    const {data:{session}}=await db.auth.getSession();
    if(!session?.user)return;
    const {count,error}=await db.from('assessments').select('id',{count:'exact',head:true}).eq('user_id',session.user.id).eq('status','completed');
    if(error)throw error;
    assessmentCount=count||0;
    historyReady=true;
    enforceAssessmentLimit();
    bindNewAssessmentGuard();
    routeReturningUserToProgram();
  }catch(err){
    console.error('SPM assessment history guard',err);
  }
}

function init(){bindAgeGate();bindNewAssessmentGuard();initHistoryGuard();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
new MutationObserver(()=>{bindAgeGate();bindNewAssessmentGuard();if(historyReady)enforceAssessmentLimit();}).observe(document.documentElement,{childList:true,subtree:true});
})();