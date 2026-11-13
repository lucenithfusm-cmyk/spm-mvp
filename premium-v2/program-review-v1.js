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
let busy=true,ready=false;
const states=new Map();
function createState(id){return {
  context:{userId:'review-only',planId:'review-'+id,day:1,primary:id,secondary:null,motives:[id],answers:{pf_awareness:'yes',pf_tension:1},safety:'none',flags:[],checkins:[],completed:[]},
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
function render(){
  const selected=programs.find(p=>p.id===program);$('profileTitle').textContent=selected.profile;
  window.SPM_CURRENT_DAY=day;document.documentElement.dataset.spmCurrentDay=String(day);
  document.title=selected.label+' · Día '+day+' · Revisión SPM';
  controls();updateUrl();window.dispatchEvent(new Event('spm:resourcecontext'));
  window.SPM_DAILY_PRACTICE?.open({focus:false});status(selected.label+' · Día '+day+' de 28 · Perfil de ejemplo');
}
async function closeActivities(){
  for(const name of ['SPM_DESIRE_LAB','SPM_SENSATE_LAB','SPM_BREATHING_LAB','SPM_PELVIC_LAB']){
    if(window[name]?.close&&await window[name].close()===false)return false;
  }
  window.SPM_SLEEP_LIBRARY_V1?.close();window.SPM_WELLNESS_LIBRARY_V1?.close?.();window.SPM_PELVIC_V2?.close();
  // These legacy modules expose their safe close action as a button, not as an API.
  for(const selector of ['#spmDeModal.on .deClose','#spmEcModal.on .ecClose','#epAssessModal.on #epAClose','.deg:not([hidden]) .degClose','dialog[open] [data-sr-close]','dialog[open] [data-wellness-close]'])document.querySelector(selector)?.click();
  window.SPM_PRACTICE_AUDIO?.stop();window.SPM_PROGRAM_VIDEOS?.pause();window.SPM_TECHNIQUE_CLIPS?.pause();window.speechSynthesis?.cancel();
  document.querySelectorAll('audio,video').forEach(media=>media.pause());
  // Never discard a lab whose own close/save operation did not finish.
  return !document.querySelector('dialog[open],#spmDeModal.on,#spmEcModal.on,#epAssessModal.on');
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
  finally{busy=false;controls();}
}
function installRecords(){
  window.SPM_RESOURCE_CONTEXT=()=>clone(context());
  for(const name of ['DESIRE','SENSATE','BREATHING','PELVIC'])window['SPM_'+name+'_RECORDS']={
    read:async(expected=scope())=>{assertScope(expected);return clone(current().modules[name]||{});},
    save:async(value,expected,expectedDay=day)=>{assertScope(expected);assertDay(expectedDay);current().modules[name]=clone(value);}
  };
  window.SPM_DAILY_RECORDS={
    read:async(expected,readDay)=>{assertScope(expected);if(!validDay(readDay))throw Error('Día inválido.');return clone(current().daily[Number(readDay)]||{});},
    save:async(id,value,expected,saveDay)=>{assertScope(expected);assertDay(saveDay);current().daily[day]??=Object.create(null);current().daily[day][id]=clone(value);}
  };
  window.SPM_RESOURCE_RECORDS={
    read:async()=>clone(current().resource),
    save:async(value,expected)=>{assertScope(expected);assertDay(value.day);const rows=current().resource,index=rows.findIndex(r=>r.id===value.id);if(index<0)rows.push(clone(value));else rows[index]=clone(value);}
  };
  window.SPM_EP_RECORDS={
    read:async(expected)=>{assertScope(expected);return clone(current().ep);},
    save:async(value,expected)=>{assertScope(expected);assertDay(value.day);const rows=current().ep,index=rows.findIndex(r=>r.day===value.day);if(index<0)rows.push(clone(value));else rows[index]=clone(value);}
  };
  window.SPM_COMPLETE_DAILY_PRACTICE=async(completedDay,expected)=>{assertScope(expected);assertDay(completedDay);const c=context();if(!c.completed.includes(day))c.completed.push(day);};
}
const scripts=[
  'engine.js','modules.js','daily-support-plan-v1.js','spm-video-library.js','program-videos-v1.js','spm-inline-video-player.js',
  'spm-resources-content.js','spm-resources.js?v=20261113-recetario1','spm-visual-cards-staging-v4.js','spm-nutrition-premium-images-v1.js',
  'practice-audio-v1.js','nutrition-daily-cards-v1.js','sleep-library-v1.js','wellness-library-v1.js','wellness-daily-tip-v1.js',
  'recovery-story-premium-v4.js','recovery-story-extra-v1.js','recovery-media-local-staging-v4.js','recovery-audio-controller-staging-v10.js',
  'technique-microclips.js','ejaculatory-control.js','ejaculatory-control-router.js','erectile-function-route.js','erectile-function-premium.js',
  'erectile-platform-v2.js','erectile-library-v3.js','erectile-guided-v3.js','erectile-central-v3.js',
  'pelvic-module-rebuild-v2.js','pelvic-guided-v3-hotfix.js','pelvic-lab-bridge-v1.js','desire-lab-bridge-v1.js?v=20261113-visual1','sensate-lab-bridge-v1.js','breathing-lab-bridge-v1.js',
  'erection-daily-plan-v1.js','daily-resource-plan-v1.js','program-checkpoint-v1.js','daily-practice-v1.js'
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
    $('reviewProgram').onchange=e=>select(e.target.value,day);
    $('reviewDay').onchange=e=>select(program,e.target.value);
    $('reviewPrevious').onclick=()=>select(program,day-1);$('reviewNext').onclick=()=>select(program,day+1);
    $('reviewReset').onclick=()=>select(program,day,true);
    return true;
  }catch{busy=false;ready=false;controls();status('No pudimos preparar esta revisión. Recarga la página para intentarlo de nuevo.',true);return false;}
}
window.SPM_PROGRAM_REVIEW={programs,select,ready:boot()};
})();
