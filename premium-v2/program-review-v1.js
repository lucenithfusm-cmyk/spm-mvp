(()=>{
'use strict';
// This standalone reviewer never loads authentication, payment or patient-data clients.
const programs=Object.freeze([
  {id:'desire',label:'Deseo',profile:'Deseo'},
  {id:'erection',label:'Erección y firmeza',profile:'Rendimiento eréctil'},
  {id:'ejaculation',label:'Control eyaculatorio',profile:'Control eyaculatorio'},
  {id:'confidence',label:'Confianza y ansiedad de desempeño',profile:'Confianza'},
  {id:'wellbeing',label:'Satisfacción y conexión',profile:'Satisfacción y conexión'},
  {id:'lifestyle',label:'Hábitos y bienestar',profile:'Hábitos y bienestar'}
]);
const clone=value=>JSON.parse(JSON.stringify(value));
const $=id=>document.getElementById(id);
const validProgram=value=>programs.some(p=>p.id===value);
const validDay=value=>/^(?:[1-9]|1\d|2[0-8])$/.test(String(value));
const params=new URLSearchParams(location.search);
let program=validProgram(params.get('programa'))?params.get('programa'):'desire';
let day=validDay(params.get('dia'))?Number(params.get('dia')):1;
// Open Focus II directly on day 19, and Focus I when a session-specific review link requests it.
const focalDays=new Set([4,8,12,19,23,26]);
const initialFocusII=params.has('programa')&&focalDays.has(day)&&(day===19||params.get('abrir')==='focalizacion');
const initialLab=params.get('abrir');
let focusing=false;
let busy=true,ready=false;
const states=new Map();
function createState(id){return {
  context:{userId:'review-only',planId:'review-'+id,day:1,primary:id,secondary:null,motives:[id],answers:{pf_awareness:'good_control',pf_tension:1},safety:'none',flags:[],checkins:[],completed:[]},
  daily:Object.create(null),modules:{DESIRE:{'spm-desire-state':JSON.stringify({health:['none'],stimuli:['tactile']})}},resource:[],ep:[],local:new Map(),session:new Map()
};}
function current(){if(!states.has(program))states.set(program,createState(program));return states.get(program);}
function context(){const c=current().context;c.day=day;return c;}
function scope(){const c=context();return c.userId+':'+c.planId;}
function assertScope(expected){if(expected!==scope())throw Error('Esta prueba pertenece a otro programa.');}
function assertDay(value){if(Number(value)!==day)throw Error('Esta prueba pertenece a otro día.');}
function storage(kind){return Object.freeze({
  get length(){return current()[kind].size;},
  key(index){return [...current()[kind].keys()][Number(index)]??null;},
  getItem(key){return current()[kind].get(String(key))??null;},
  setItem(key,value){current()[kind].set(String(key),String(value));},
  removeItem(key){current()[kind].delete(String(key));},
  clear(){current()[kind].clear();}
});}
function status(text,error=false){$('reviewStatus').textContent=text;$('reviewStatus').dataset.error=String(error);}
function controls(){
  $('reviewProgram').value=program;$('reviewDay').value=String(day);
  for(const id of ['reviewProgram','reviewDay','reviewReset'])$(id).disabled=busy||!ready;
  $('reviewPrevious').disabled=busy||!ready||day===1;$('reviewNext').disabled=busy||!ready||day===28;
}
function updateUrl(){const url=new URL(location.href);url.searchParams.set('programa',program);url.searchParams.set('dia',String(day));history.replaceState(null,'',url);}
function focusIIControls(){
 const box=$('reviewFocusII'),btn=$('reviewOpenFocusII');
 if(!box||!btn)return;
 const selected=window.SPM_DAILY_SUPPORT?.activity('sensate',day,context());
 const available=!!selected&&(selected.practiceId==='sf-focus-2'||/^sf-i-[1-5]$/.test(selected.practiceId));
 box.hidden=!available;
 btn.disabled=!available||busy||!ready||focusing;
 const heading=box.querySelector('strong');
 if(heading&&available)heading.textContent=selected.title+' · Día '+day;
 if(available)btn.textContent=selected.practiceId==='sf-focus-2'?'▶ Abrir Focus II':'▶ Abrir Focus I';
 const explanation=box.querySelector('p');
 if(available&&explanation)explanation.textContent=selected.practiceId==='sf-focus-2'?'Explora ocho imágenes originales en seis etapas, con opción individual o en pareja.':'Abre las pantallas táctiles con audio de la sesión asignada, a tu propio ritmo.';
}
async function openFocusII(){
 if(busy||!ready||focusing||!focalDays.has(day))return false;
 const activity=window.SPM_DAILY_SUPPORT?.activity('sensate',day,context());
 if(!activity||!(activity.practiceId==='sf-focus-2'||/^sf-i-[1-5]$/.test(activity.practiceId))||!window.SPM_SENSATE_LAB?.open){status('No pudimos encontrar la práctica de focalización asignada a este día.',true);return false;}
 focusing=true;focusIIControls();
 try{
  const opened=await window.SPM_SENSATE_LAB.open({origin:'dailyPlan',day});
  if(opened!==true){status('No pudimos abrir la focalización de hoy. Usa el botón para reintentar.',true);return false;}
  status(activity.title+' · Día '+day+' · Pantallas táctiles y audios habilitados.');
  return true;
 }catch{
  status('No pudimos abrir la práctica de focalización. Usa el botón para reintentar.',true);
  return false;
 }finally{focusing=false;focusIIControls();}
}
async function openReviewLab(name){
  if(busy||!ready||!['respiracion','pelvic-lab'].includes(name))return false;
  try{
    if(!await closeActivities())return false;
    if(name==='respiracion'){
      const opened=await window.SPM_BREATHING_LAB?.open({origin:'library'});
      if(opened!==true)throw Error('Breathing unavailable');
      status('Respiración diafragmática · Revisión de voz y bocinas');
    }else{
      const assigned=window.SPM_DAILY_PRACTICE?.assignments?.().find(activity=>activity.id==='pelvic-daily-lab');
      if(assigned)await window.SPM_DAILY_PRACTICE.launch(assigned.id);
      else await window.SPM_PELVIC_LAB?.open({origin:'library',day});
      if(!document.querySelector('.spm-pf-modal[open]'))throw Error('Pelvic Lab unavailable');
      status('Pelvic Floor Lab · Revisión de bocinas');
    }
    return true;
  }catch{
    status('No pudimos abrir la práctica. Puedes volver a intentarlo desde Biblioteca completa.',true);
    return false;
  }
}
function render(){
  const selected=programs.find(p=>p.id===program);$('profileTitle').textContent=selected.profile;
  window.SPM_CURRENT_DAY=day;document.documentElement.dataset.spmCurrentDay=String(day);
  document.title=selected.label+' · Día '+day+' · Revisión SPM';
  controls();updateUrl();window.dispatchEvent(new Event('spm:resourcecontext'));
  window.SPM_DAILY_PRACTICE?.open({focus:false});status(selected.label+' · Día '+day+' de 28 · Perfil de ejemplo');
  focusIIControls();
}
async function closeActivities(){
  for(const name of ['SPM_DESIRE_LAB','SPM_SENSATE_LAB','SPM_BREATHING_LAB','SPM_PELVIC_LAB']){
    if(window[name]?.close&&await window[name].close()===false)return false;
  }
  window.SPM_STARTSTOP_V2?.close?.(false);
  window.SPM_SQUEEZE_V1?.close?.(false);
  window.SPM_COMBINED_V1?.close?.(false);
  window.SPM_FIRMNESS_GUIDE?.close();
  window.SPM_SLEEP_LIBRARY_V1?.close();window.SPM_WELLNESS_LIBRARY_V1?.close?.();if(window.SPM_PELVIC_V2?.close()===false)return false;
  // These legacy modules expose their safe close action as a button, not as an API.
  for(const selector of ['#spmDeModal.on .deClose','#spmEcModal.on .ecClose','#epAssessModal.on #epAClose','.deg:not([hidden]) .degClose','dialog[open] [data-sr-close]','dialog[open] [data-wellness-close]'])document.querySelector(selector)?.click();
  window.SPM_ERECTION_PRACTICE?.stop();window.SPM_PRACTICE_AUDIO?.stop();window.SPM_PROGRAM_VIDEOS?.pause();window.SPM_TECHNIQUE_CLIPS?.pause();window.speechSynthesis?.cancel();
  document.querySelectorAll('audio,video').forEach(media=>media.pause());
  // Never discard a lab whose own close/save operation did not finish.
  return !document.querySelector('dialog[open],#spmDeModal.on,#spmEcModal.on,#epAssessModal.on')&&!document.querySelector('#spmStartStopV2:not([hidden]),#spmSqueezeV1:not([hidden]),#spmCombinedV1:not([hidden])');
}
async function select(nextProgram,nextDay,reset=false){
  if(!ready||busy)return false;
  if(!validProgram(nextProgram)||!validDay(nextDay)){controls();status('Elige un programa y un día del 1 al 28.',true);return false;}
  busy=true;controls();
  try{
    if(!await closeActivities()){status('Cierra la actividad abierta y termina su guardado antes de cambiar de día.',true);return false;}
    const changed=program!==nextProgram;
    if(reset)states.delete(nextProgram);
    program=nextProgram;day=Number(nextDay);
    if(changed||reset)window.dispatchEvent(new CustomEvent('spm:session-change',{detail:{userId:'review-only-reset'}}));
    render();return true;
  }catch{status('No se pudo cambiar de día. La prueba actual se conserva; vuelve a intentarlo.',true);return false;}
  finally{busy=false;controls();focusIIControls();}
}
function installRecords(){
  window.SPM_RESOURCE_CONTEXT=()=>clone(context());
  for(const name of ['DESIRE','SENSATE','BREATHING','PELVIC'])window['SPM_'+name+'_RECORDS']={
    read:async(expected=scope())=>{assertScope(expected);return clone(current().modules[name]||{});},
    save:async(value,expected,expectedDay=day)=>{assertScope(expected);assertDay(expectedDay);current().modules[name]=clone(value);}
  };
  window.SPM_DAILY_RECORDS={
    read:async(expected,readDay)=>{assertScope(expected);if(!validDay(readDay))throw Error('Día inválido.');return clone(current().daily[Number(readDay)]||{});},
    readCheckpoints:async(expected)=>{assertScope(expected);return Object.entries(current().daily).filter(([,items])=>items['program-checkpoint']).map(([d,items])=>({day_number:Number(d),metadata:clone(items['program-checkpoint'])})).sort((a,b)=>a.day_number-b.day_number);},
    save:async(id,value,expected,saveDay)=>{assertScope(expected);assertDay(saveDay);current().daily[day]??=Object.create(null);current().daily[day][id]=clone(value);}
  };
  window.SPM_RESOURCE_RECORDS={
    read:async()=>clone(current().resource),
    save:async(value,expected)=>{assertScope(expected);assertDay(value.day);const rows=current().resource,index=rows.findIndex(r=>r.id===value.id);if(index<0)rows.push(clone(value));else rows[index]=clone(value);}
  };
  window.SPM_SAVE_MODULE=async({day:saveDay,moduleKey,metricValue=null,metadata={}})=>{
    const expected=scope();assertScope(expected);assertDay(saveDay);
    const value={id:'module:'+moduleKey+':'+saveDay,day:saveDay,moduleKey,metricValue,metadata:clone(metadata)};
    const rows=current().resource,index=rows.findIndex(r=>r.id===value.id);if(index<0)rows.push(value);else rows[index]=value;
    return {ok:true};
  };
  window.SPM_EP_RECORDS={
    read:async(expected)=>{assertScope(expected);return clone(current().ep);},
    save:async(value,expected)=>{assertScope(expected);assertDay(value.day);const rows=current().ep,index=rows.findIndex(r=>r.day===value.day);if(index<0)rows.push(clone(value));else rows[index]=clone(value);}
  };
  window.SPM_COMPLETE_DAILY_PRACTICE=async(completedDay,expected)=>{assertScope(expected);assertDay(completedDay);const c=context();if(!c.completed.includes(day))c.completed.push(day);};
}
const scripts=[
  'engine.js','modules.js?v=20261113-closing1','pelvic-guidance-v1.js?v=20261114-circle-halo-welcome4','daily-support-plan-v1.js?v=20261115-sensate-focus1-five-direct6','practice-audio-v1.js?v=20261113-recovery-audio1','spm-video-library.js?v=20261113-video-audio2','program-videos-v1.js?v=20261113-video-audio2','spm-inline-video-player.js?v=20261113-video-audio2',
  'firmness-guide-v1.js?v=20261113-firmness-1','spm-resources-content.js?v=20261113-instructions1','spm-resources.js?v=20261113-firmness-1','spm-visual-cards-staging-v4.js?v=20261113-instructions1','spm-nutrition-premium-images-v1.js',
  'nutrition-daily-cards-v1.js?v=20261113-instructions1','sleep-library-v1.js?v=20261113-recovery-audio1','wellness-library-v1.js?v=20261113-gift1','wellness-daily-tip-v1.js?v=20261120-movement-cards1',
  'recovery-story-premium-v4.js?v=20261113-instructions1','recovery-story-extra-v1.js?v=20261113-instructions1','recovery-media-local-staging-v4.js','recovery-story-audio-v1.js?v=20261113-recovery-audio2','recovery-audio-controller-staging-v10.js?v=20261113-recovery-audio2',
  'technique-microclips.js','ejaculatory-startstop-v2.js?v=20261114-ep-combined-premium1','ejaculatory-squeeze-v1.js?v=20261114-ep-combined-premium1','ejaculatory-combined-v1.js?v=20261114-ep-combined-premium1','ejaculatory-control.js?v=20261114-ep-combined-premium1','ejaculatory-control-router.js','erectile-function-route.js?v=20261117-erection10x28-v1','erectile-function-premium.js?v=20261113-closing1',
  'erectile-platform-v2.js','erectile-library-v3.js?v=20261114-pelvic-entry2','erectile-guided-v3.js','erectile-central-v3.js?v=20261114-pelvic-entry2',
  'pelvic-module-rebuild-v2.js?v=20261114-circle-halo-welcome4','pelvic-guided-v3-hotfix.js?v=20261114-classic1','pelvic-lab-bridge-v1.js?v=20261120-audio-fullscreen1','pelvic-strength-readiness-v1.js?v=20261114-pelvic-adaptive6','desire-lab-bridge-v1.js?v=20261119-deseo-calendario-r3','sensate-lab-bridge-v1.js?v=20261116-focusii-direct-today-v2','breathing-lab-bridge-v1.js?v=20261120-audio-fullscreen1',
  'erection-daily-plan-v1.js?v=20261117-erection10x28-v1','daily-resource-plan-v1.js?v=20261117-erection10x28-v1','checkpoint-audio-v1.js?v=20261113-checkpoint2','spm-checkpoint-touch-v1.js?v=20261118-checkpoint-touch-v1','program-checkpoint-v1.js?v=20261118-checkpoint-touch-v1','erection-ten-schedule-v1.js?v=20261118-dia27-prevencion-v1','erection-practice-v1.js?v=20261118-dia27-prevencion-v1',
  'erection-fullscreen-v1.js?v=20261117-er-fullscreen-cierre1',
  'erection-day1-touch-v1.js?v=20261117-d1-cierre-manual1','erection-day1-bridge-v1.js?v=20261116-approved6-v2',
  'erection-day2-touch-v1.js?v=20261117-erection10x28-v1','erection-day2-bridge-v1.js?v=20261117-erection10x28-v1',
  'erection-day3-touch-v1.js?v=20261117-erection10x28-v1','erection-day3-bridge-v1.js?v=20261117-erection10x28-v1',
  'erection-day4-touch-v1.js?v=20261117-erection10x28-v1','erection-day4-bridge-v1.js?v=20261117-erection10x28-v1',
   'erection-day5-touch-v1.js?v=20261117-day12-3clips-tactil-v2','erection-day5-bridge-v1.js?v=20261117-day12-3clips-tactil-v2',
   'erection-day6-touch-v1.js?v=20261117-day15-voz-dispositivo-v2','erection-day6-bridge-v1.js?v=20261117-day15-stimuli-v1',
   'erection-day7-touch-v1.js?v=20261117-dia18-progreso-alertas-v1','erection-day7-bridge-v1.js?v=20261117-dia18-progreso-alertas-v1',
   'erection-day8-touch-v1.js?v=20261117-dia21-sostener-v1','erection-day8-bridge-v1.js?v=20261117-dia21-sostener-v1',
   'erection-day9-touch-v1.js?v=20261117-dia24-recuperacion-v1','erection-day9-bridge-v1.js?v=20261117-dia24-recuperacion-v1',
    'erection-day10-touch-v1.js?v=20261118-dia27-prevencion-v1','erection-day10-bridge-v1.js?v=20261118-dia27-prevencion-v1',
  'spm-active-module-release-v1.js?v=20261118-dia27-prevencion-v1','daily-practice-v1.js?v=20261120-movement-cards1',
  'desire-day1-touch-v1.js?v=20261120-audio-fullscreen1','desire-day1-bridge-v1.js?v=20261119-deseo-access-r2',
  'desire-day2-touch-v1.js?v=20261120-audio-fullscreen1','desire-day2-bridge-v1.js?v=20261119-deseo-access-r2',
  'desire-day3-touch-v1.js?v=20261120-audio-fullscreen1','desire-day3-bridge-v1.js?v=20261119-deseo-access-r2','desire-week1-bridge-v1.js?v=20261120-audio-fullscreen1',
  'desire-week2-bridge-v1.js?v=20261120-audio-fullscreen1',
  'desire-week3-bridge-v1.js?v=20261119-w34-fullscreen1',
  'desire-week4-v1/catalog.js?v=20261119-w4-review1',
  'desire-week4-bridge-v1.js?v=20261119-w34-fullscreen1'
];
async function boot(){
  try{
    // Isolate legacy per-device progress on this page only. Never read real browser records.
    Object.defineProperty(window,'localStorage',{value:storage('local'),configurable:false});
    Object.defineProperty(window,'sessionStorage',{value:storage('session'),configurable:false});
    installRecords();window.SPM_LANG='es';
    for(const p of programs){const option=document.createElement('option');option.value=p.id;option.textContent=p.label;$('reviewProgram').append(option);}
    for(let n=1;n<=28;n++){const option=document.createElement('option');option.value=String(n);option.textContent='Día '+n;$('reviewDay').append(option);}
    controls();$('profileTitle').textContent=programs.find(p=>p.id===program).profile;
    for(const src of scripts)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=()=>reject(Error(src));document.body.append(script);});
    ready=true;busy=false;render();
    $('reviewOpenFocusII').onclick=()=>void openFocusII();
    if(['respiracion','pelvic-lab'].includes(initialLab))setTimeout(()=>{void openReviewLab(initialLab);},120);
    else if(initialFocusII)setTimeout(()=>{void openFocusII();},120);
    $('reviewProgram').onchange=e=>select(e.target.value,day);
    $('reviewDay').onchange=e=>select(program,e.target.value);
    $('reviewPrevious').onclick=()=>select(program,day-1);$('reviewNext').onclick=()=>select(program,day+1);
    $('reviewReset').onclick=()=>select(program,day,true);
    return true;
  }catch{busy=false;ready=false;controls();status('No pudimos preparar esta revisión. Recarga la página para intentarlo de nuevo.',true);return false;}
}
window.SPM_PROGRAM_REVIEW={programs,select,openFocusII,openReviewLab,ready:boot()};
})();
