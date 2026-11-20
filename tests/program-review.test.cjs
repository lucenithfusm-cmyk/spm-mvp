const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,ResourceLoader,VirtualConsole}=require('../labs/desire/node_modules/jsdom');
const root=path.resolve(__dirname,'..');
const wait=()=>new Promise(resolve=>setTimeout(resolve,15));
class LocalResources extends ResourceLoader{
  fetch(url){const parsed=new URL(url);if(parsed.hostname!=='spm.test')return null;const file=path.resolve(root,'.'+parsed.pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return null;return Promise.resolve(fs.readFileSync(file));}
}
async function harness(query='?programa=desire&dia=1'){
  const errors=[],observers=[],console=new VirtualConsole();console.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM(fs.readFileSync(path.join(root,'premium-v2/revision-programas-28-dias.html'),'utf8'),{
    url:'https://spm.test/premium-v2/revision-programas-28-dias.html'+query,runScripts:'dangerously',resources:new LocalResources(),pretendToBeVisual:true,virtualConsole:console,
    beforeParse(w){
      w.__originalStorage=w.localStorage;w.__originalStorage.setItem('spm_de_records','real-origin-record');
      w.HTMLElement.prototype.scrollIntoView=function(){};
      const Observer=w.MutationObserver;w.MutationObserver=class extends Observer{constructor(fn){super(fn);observers.push(this);}};
      w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
      w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.load=function(){};w.HTMLMediaElement.prototype.play=async function(){};
      w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
      w.speechSynthesis={cancel(){},getVoices(){return[];},speak(){},addEventListener(){}};w.SpeechSynthesisUtterance=function(text){this.text=text;};
      w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
    }
  });
  while(!dom.window.SPM_PROGRAM_REVIEW)await wait();
  assert.equal(await dom.window.SPM_PROGRAM_REVIEW.ready,true,'review boots with real local renderers');
  await wait();return{w:dom.window,errors,close:()=>{observers.forEach(observer=>observer.disconnect());dom.window.close();}};
}
test('existing day-19 DE, EP and Deseo links automatically open real Focus II screens',async()=>{
 for(const program of ['desire','erection','ejaculation']){
  const h=await harness('?programa='+program+'&dia=19');
  try{
   const {w}=h;
   await new Promise(resolve=>setTimeout(resolve,260));
   assert.equal(w.SPM_RESOURCE_CONTEXT().day,19);
   assert.equal(w.document.querySelector('#reviewFocusII').hidden,false);
   assert.equal(w.document.querySelector('#reviewOpenFocusII').disabled,false);
   const modal=w.document.querySelector('.spm-sensate-modal[open]');
   assert.ok(modal,'day-19 Focus II must be directly visible for '+program);
   assert.ok(modal.querySelector('iframe[src*="sensate-lab/index.html"]'));
   assert.equal(w.SPM_SENSATE_LAB_HOST.getContext().activity.practiceId,'sf-focus-2');
   assert.equal(w.SPM_SENSATE_LAB_HOST.getContext().profile,program);
   assert.deepEqual(h.errors,[]);
  }finally{h.close()}
 }
});

test('day-19 manual Focus II review button opens the same session and preserves test-only context',async()=>{
 const h=await harness('?programa=desire&dia=18');
 try{
  const {w}=h;
  assert.equal(w.document.querySelector('#reviewFocusII').hidden,true);
  await w.SPM_PROGRAM_REVIEW.select('desire',19);
  const button=w.document.querySelector('#reviewOpenFocusII');
  assert.equal(button.disabled,false);
  assert.equal(w.document.querySelector('#reviewFocusII').hidden,false);
  button.click();
  await new Promise(resolve=>setTimeout(resolve,100));
  assert.ok(w.document.querySelector('.spm-sensate-modal[open] iframe'), 'manual action must display the Focus II practice');
  assert.equal(w.SPM_RESOURCE_CONTEXT().userId,'review-only');
  assert.equal(w.SPM_RESOURCE_CONTEXT().day,19);
 }finally{h.close()}
});

test('direct breathing review opens the real voice library with isolated example records',async()=>{
 const h=await harness('?programa=desire&dia=1&abrir=respiracion');
 try{
  const {w}=h;await new Promise(resolve=>setTimeout(resolve,240));
  assert.ok(w.document.querySelector('.spm-breathing-modal[open] iframe'));
  assert.equal(w.SPM_BREATHING_LAB_HOST.getContext().mode,'library');
  assert.equal(w.SPM_RESOURCE_CONTEXT().userId,'review-only');
  assert.equal(w.__originalStorage.getItem('spm_de_records'),'real-origin-record');
 }finally{h.close();}
});

test('direct weekly Pelvic review uses the assigned activity and retains the daily result flow',async()=>{
 const h=await harness('?programa=desire&dia=3&abrir=pelvic-lab');
 try{
  const {w}=h;await new Promise(resolve=>setTimeout(resolve,240));
  assert.ok(w.document.querySelector('.spm-pf-modal[open] iframe'));
  const c=w.SPM_PELVIC_LAB_HOST.getContext();
  assert.equal(c.day,3);assert.equal(c.origin,'dailyPlan');
  assert.equal(c.activityId,'pelvic-daily-lab');assert.equal(c.intent,'daily-relax');
  assert.equal(w.SPM_DAILY_PRACTICE.active().id,'pelvic-daily-lab');
  assert.equal(w.SPM_RESOURCE_CONTEXT().userId,'review-only');
 }finally{h.close();}
});

test('all five Focus I sessions can be opened directly from review links with active patient-style screens',async()=>{
 const sessions=[[4,'sf-i-1'],[8,'sf-i-2'],[12,'sf-i-3'],[23,'sf-i-4'],[26,'sf-i-5']];
 for(const [day,id] of sessions){
  const h=await harness('?programa=desire&dia='+day+'&abrir=focalizacion');
  try{
   const w=h.w;
   await new Promise(resolve=>setTimeout(resolve,240));
   const modal=w.document.querySelector('.spm-sensate-modal[open]');
   assert.ok(modal,'Focus I should auto-open on day '+day);
   assert.equal(w.SPM_SENSATE_LAB_HOST.getContext().day,day);
   assert.equal(w.SPM_SENSATE_LAB_HOST.getContext().activity.practiceId,id);
   assert.match(w.document.querySelector('#reviewOpenFocusII').textContent,/Focus I/);
   assert.equal(w.SPM_RESOURCE_CONTEXT().userId,'review-only');
   assert.deepEqual(h.errors,[]);
  }finally{h.close()}
 }
});

test('all six domains offer five voluntary Focus I practices, one direct Focus II and the independent day-16 video',async()=>{
 const focusI=new Map([[4,'sf-i-1'],[8,'sf-i-2'],[12,'sf-i-3'],[23,'sf-i-4'],[26,'sf-i-5']]);
 const h=await harness('?programa=desire&dia=16');
 try{
  const {w}=h;
  for(const program of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
   await w.SPM_PROGRAM_REVIEW.select(program,16);
   const c=w.SPM_RESOURCE_CONTEXT(),v=w.SPM_DAILY_PRACTICE.assignments().filter(a=>a.kind==='video'&&a.videoKey==='sensory-focus');
   assert.equal(v.length,1,'only one sensory video on day 16 in '+program);
   assert.equal(w.SPM_DAILY_SUPPORT.activity('sensate',16,c),null,'day 16 does not repeat Focus I in '+program);
   for(const [day,practiceId] of focusI){
    const act=w.SPM_DAILY_SUPPORT.activity('sensate',day,c);
    assert.equal(act.practiceId,practiceId);
    assert.equal(act.optional,true);
    assert.equal(w.SPM_DAILY_PRACTICE.restricted({...c,safety:'urgent'},({...act,kind:'sensate'})),false);
   }
   const focusII=w.SPM_DAILY_SUPPORT.activity('sensate',19,c);
   assert.equal(focusII.practiceId,'sf-focus-2');
   assert.equal(focusII.optional,true);
  }
  assert.deepEqual(h.errors,[]);
 }finally{h.close()}
});

test('all six real programs expose 28 review days with guarded controls and no patient clients',async()=>{
  const h=await harness();try{
    const {w}=h;assert.equal(w.document.querySelector('#reviewProgram').options.length,6);assert.equal(w.document.querySelector('#reviewDay').options.length,28);
    assert.equal(w.document.querySelector('#reviewPrevious').disabled,true);
    for(const route of w.SPM_PROGRAM_REVIEW.programs){
      for(let day=1;day<=28;day++){
        assert.equal(await w.SPM_PROGRAM_REVIEW.select(route.id,day),true);await wait();
        const c=w.SPM_RESOURCE_CONTEXT(),a=w.SPM_DAILY_PRACTICE.assignments();
        assert.equal(c.primary,route.id);assert.equal(c.day,day);assert.ok(a.length>=2);assert.equal(a[0].id,'main');assert.ok(a.every(x=>x.title));
        assert.match(w.document.querySelector('#spmDailySession').textContent,new RegExp('DÍA '+day+' DE 28'));
      }
      assert.equal(w.document.querySelector('#reviewNext').disabled,true);
    }
    assert.equal([...w.document.scripts].some(s=>/supabase|auth-safe|payments|app-live/.test(s.src)),false);
    assert.deepEqual(h.errors,[]);
  }finally{h.close();}
});
test('review isolates programs and daily records, rejects stale writes, and preserves real-origin storage',async()=>{
  const h=await harness();try{
    const {w}=h,c=w.SPM_RESOURCE_CONTEXT(),scope=c.userId+':'+c.planId;
    assert.equal(w.localStorage.getItem('spm_de_records'),null);
    w.localStorage.setItem('spm_de_records','review-only');w.sessionStorage.setItem('test','example');
    await w.SPM_DAILY_RECORDS.save('example',{value:'one'},scope,1);
    await w.SPM_DESIRE_RECORDS.save({'spm-desire-ctx':'example'},scope,1);
    await w.SPM_PROGRAM_REVIEW.select('desire',2);
    assert.equal(Object.keys(await w.SPM_DAILY_RECORDS.read(scope,2)).length,0);
    await assert.rejects(w.SPM_DAILY_RECORDS.save('stale',{},scope,1));
    await assert.rejects(w.SPM_DESIRE_RECORDS.save({},scope,1));
    await w.SPM_PROGRAM_REVIEW.select('erection',1);
    assert.equal(w.localStorage.getItem('spm_de_records'),null);assert.equal(w.sessionStorage.getItem('test'),null);
    assert.equal((await w.SPM_DESIRE_RECORDS.read())['spm-desire-ctx'],undefined);
    await assert.rejects(w.SPM_DESIRE_RECORDS.save({},scope,1));
    await w.SPM_PROGRAM_REVIEW.select('desire',1);
    assert.equal((await w.SPM_DAILY_RECORDS.read(scope,1)).example.value,'one');assert.equal(w.localStorage.getItem('spm_de_records'),'review-only');
    assert.equal(w.__originalStorage.getItem('spm_de_records'),'real-origin-record');
    assert.deepEqual(h.errors,[]);
  }finally{h.close();}
});
test('a failed lab close prevents navigation; successful navigation closes actual legacy modals',async()=>{
  const h=await harness();try{
    const {w}=h,original=w.SPM_DESIRE_LAB.close;w.SPM_DESIRE_LAB.close=async()=>false;
    assert.equal(await w.SPM_PROGRAM_REVIEW.select('erection',8),false);w.SPM_DESIRE_LAB.close=original;
    assert.equal(w.SPM_RESOURCE_CONTEXT().primary,'desire');assert.equal(w.SPM_RESOURCE_CONTEXT().day,1);
    assert.equal(w.document.querySelector('#reviewProgram').value,'desire');assert.equal(w.document.querySelector('#reviewDay').value,'1');
    await w.SPM_PROGRAM_REVIEW.select('erection',9);await wait();
    await w.SPM_DAILY_PRACTICE.launch('main');await wait();assert.ok(w.document.querySelector('[data-ed4-session]'));
    assert.equal(w.document.querySelector('#spmDeModal.on'),null,'no se utiliza el modal DE obsoleto');
    assert.equal(await w.SPM_PROGRAM_REVIEW.select('ejaculation',1),true);await wait();assert.equal(w.document.querySelector('[data-ed4-session]'),null);
    await w.SPM_DAILY_PRACTICE.launch('main');const premium=w.document.querySelector('#spmSqueezeV1');assert.ok(premium&&!premium.hidden);assert.ok(premium.shadowRoot.querySelector('#stage img'));assert.equal(w.document.querySelector('#spmEcModal.on'),null);
    assert.equal(await w.SPM_PROGRAM_REVIEW.select('ejaculation',8),true);await wait();
     assert.equal(w.document.querySelector('#spmSqueezeV1').hidden,true);
     await w.SPM_DAILY_PRACTICE.launch('main');
     const secondWeek=w.document.querySelector('#spmStartStopV2');assert.ok(secondWeek&&!secondWeek.hidden);
     assert.equal(await w.SPM_PROGRAM_REVIEW.select('ejaculation',14),true);await wait();
     assert.equal(w.document.querySelector('#spmEcModal.on'),null);assert.equal(secondWeek.hidden,true);
    await w.SPM_DAILY_PRACTICE.launch('main');assert.ok(w.document.querySelector('#epAssessModal.on'));
    assert.equal(await w.SPM_PROGRAM_REVIEW.select('confidence',2),true);await wait();assert.equal(w.document.querySelector('#epAssessModal.on'),null);
    await w.SPM_DAILY_PRACTICE.launch('main');assert.ok(w.document.querySelector('#spmDailyWorkspace [name="reflection"]'));
    assert.deepEqual(h.errors,[]);
  }finally{h.close();}
});
test('invalid query choices normalize safely and completion stays within the selected example day',async()=>{
  const h=await harness('?programa=unknown&dia=999');try{
    const {w}=h,c=w.SPM_RESOURCE_CONTEXT(),scope=c.userId+':'+c.planId;
    assert.equal(c.primary,'desire');assert.equal(c.day,1);
    assert.equal(new URL(w.location.href).searchParams.get('dia'),'1');
    assert.equal(await w.SPM_PROGRAM_REVIEW.select('desire',29),false);
    assert.equal(await w.SPM_PROGRAM_REVIEW.select('unknown',1),false);
    await assert.rejects(w.SPM_COMPLETE_DAILY_PRACTICE(1,'other:plan'));
    await w.SPM_COMPLETE_DAILY_PRACTICE(1,scope);await w.SPM_COMPLETE_DAILY_PRACTICE(1,scope);
    assert.equal(w.SPM_RESOURCE_CONTEXT().day,1);assert.equal(w.SPM_RESOURCE_CONTEXT().completed.join(','),'1');
    await w.SPM_PROGRAM_REVIEW.select('desire',28);assert.equal(w.document.querySelector('#reviewNext').disabled,true);
    assert.deepEqual(h.errors,[]);
  }finally{h.close();}
});
test('review recovers a midpoint answered on day 18 and isolates its version 2 values by program',async()=>{
  const h=await harness('?programa=desire&dia=18');try{
    const {w}=h,c=w.SPM_RESOURCE_CONTEXT(),scope=c.userId+':'+c.planId;
    await w.SPM_PROGRAM_CHECKPOINT.open({id:'program-checkpoint',title:'Seguimiento'});
    const form=w.document.querySelector('[data-program-checkpoint]');assert.ok(form);
    for(const select of form.querySelectorAll('select'))select.value=select.name==='control'?'na':'3';
    await form.onsubmit({preventDefault(){}});await wait();
    const rows=await w.SPM_DAILY_RECORDS.readCheckpoints(scope);
    assert.equal(rows.length,1);assert.equal(rows[0].day_number,18);assert.equal(rows[0].metadata.milestone,14);
    assert.equal(rows[0].metadata.checkpointVersion,2);assert.equal(rows[0].metadata.scaleMax,4);assert.equal(rows[0].metadata.metrics.control,null);
    await assert.rejects(w.SPM_DAILY_RECORDS.readCheckpoints('another:plan'));
    assert.equal(await w.SPM_PROGRAM_REVIEW.select('desire',19),true);await wait();
    assert.equal(w.SPM_DAILY_PRACTICE.assignments().some(item=>item.kind==='program-checkpoint'),false,'answered midpoint does not return as a reminder');
    await w.SPM_PROGRAM_CHECKPOINT.open({id:'program-checkpoint',title:'Seguimiento'});
    assert.ok(w.document.querySelector('[data-program-report]'));assert.match(w.document.body.textContent,/respondido el día 18/);
    assert.equal(w.document.querySelector('[data-program-checkpoint]'),null);
    await w.SPM_PROGRAM_REVIEW.select('erection',19);await wait();const other=w.SPM_RESOURCE_CONTEXT();
    assert.equal((await w.SPM_DAILY_RECORDS.readCheckpoints(other.userId+':'+other.planId)).length,0);
    await w.SPM_PROGRAM_REVIEW.select('desire',28);await wait();
    await w.SPM_PROGRAM_CHECKPOINT.open({id:'program-checkpoint',title:'Informe'});
    assert.match(w.document.querySelector('[data-program-report]').textContent,/3\s*\/\s*4/);
    assert.equal((await w.SPM_DAILY_RECORDS.readCheckpoints(scope)).length,1);assert.equal(w.SPM_RESOURCE_CONTEXT().day,28);
    assert.deepEqual(h.errors,[]);
  }finally{h.close();}
});

test('day 28 closing audio stays separate from navigation and opens the final report without extra records',async()=>{
  const h=await harness('?programa=erection&dia=28');try{
    const {w}=h,api=w.SPM_DAILY_PRACTICE,c=w.SPM_RESOURCE_CONTEXT(),scope=c.userId+':'+c.planId;
    for(const activity of api.assignments().filter(item=>!item.optional))await api.saveActivity(activity.id,{confirmed:true});
    await w.document.querySelector('#spmDailyComplete').onclick();await wait();
    const closing=w.document.querySelector('#spmDailyClosing');assert.ok(closing);
    assert.ok(closing.querySelector('[data-program-closing]'));
    assert.equal(closing.querySelector('[data-checkpoint-audio] audio').getAttribute('src'),'/premium-v2/assets/audio/checkpoint/program-closing-20261113.mp3');
    closing.querySelector('[data-spm-speak]').click();
    assert.equal(w.document.querySelector('#spmDailyClosing'),closing,'the daily advice speaker must not navigate away');
    const before=JSON.stringify(await w.SPM_DAILY_RECORDS.read(scope,28));
    closing.querySelector('[data-closing-report]').click();await wait();
    const report=w.document.querySelector('[data-program-report]');assert.ok(report);
    assert.ok(report.querySelector('[data-program-closing]'));
    assert.equal(w.document.querySelector('#spmDailyClosing'),null);
    assert.equal(JSON.stringify(await w.SPM_DAILY_RECORDS.read(scope,28)),before);
    assert.equal((await w.SPM_DAILY_RECORDS.readCheckpoints(scope)).length,0,'the report does not require or invent evaluations');
    assert.equal(w.SPM_RESOURCE_CONTEXT().day,28);
    assert.equal(w.SPM_RESOURCE_CONTEXT().completed.join(','),'28');
    assert.deepEqual(h.errors,[]);
  }finally{h.close();}
});

test('Erección distribuye diez sesiones aprobadas, sin formulario antiguo y con evaluaciones independientes',async()=>{
 const h=await harness('?programa=erection&dia=1');
 try{
  const {w}=h,api=w.SPM_DAILY_PRACTICE;
  const sessions=[[1,1,6],[3,2,4],[6,3,3],[9,4,3],[12,5,3],[15,6,1],[18,7,3],[21,8,3],[24,9,3],[27,10,2]];
  assert.deepEqual(Array.from(w.SPM_ERECTION_10_SCHEDULE.days),sessions.map(([day])=>day));
  assert.equal(w.SPM_ERECTION_10_SCHEDULE.integrated,10);
  for(const [day,lesson,count] of sessions){
   await w.SPM_PROGRAM_REVIEW.select('erection',day);await wait();
   const c=w.SPM_RESOURCE_CONTEXT(),main=api.assignments()[0];
   assert.equal(main.kind,'erection');assert.equal(main.erectionLesson,lesson);
   const release=w.SPM_ACTIVE_MODULE_RELEASE.resolve(c,main);
   assert.ok(release);assert.equal(release.screens,count);
   const activity=w.document.querySelector('[data-activity="main"]');
   assert.ok(activity.querySelector('[data-daily-open]'));
   await api.launch('main');await wait();
   assert.ok(w.document.querySelector('.spm-ed'+lesson+'-session.spm-er-fullscreen[data-screen="1"]'),'la actividad '+lesson+' se abre desde Hoy el día '+day);
   assert.equal(w.document.querySelector('[data-erection-form]'),null,'sin formularios de la rama antigua');
  }
  for(const day of [2,4,5,7,8,10,11,13,14,16,17,19,20,22,23,25,26,28]){
   await w.SPM_PROGRAM_REVIEW.select('erection',day);await wait();
   const main=api.assignments()[0],card=w.document.querySelector('[data-activity="main"]');
   assert.equal(main.kind,'erection-support-day');
   assert.equal(card.dataset.erectionTransversal,'true');
   assert.equal(card.querySelector('[data-daily-open]'),null);
   assert.equal(w.document.querySelector('[data-erection-form]'),null);
   assert.equal(w.SPM_ERECTION_10_SCHEDULE.lessonFor(day),null);
   assert.equal(w.SPM_ACTIVE_MODULE_RELEASE.resolve(w.SPM_RESOURCE_CONTEXT(),main),null);
   if([14,28].includes(day))assert.ok(api.assignments().some(a=>a.kind==='program-checkpoint'));
  }
  assert.deepEqual(h.errors,[]);
 }finally{h.close()}
});
test('Una restricción posterior cierra la sesión táctil del día 6 e impide un guardado vencido',async()=>{
 const h=await harness('?programa=erection&dia=6');
 try{
  const {w}=h,originalContext=w.SPM_RESOURCE_CONTEXT,c=originalContext(),scope=c.userId+':'+c.planId;
  await w.SPM_DAILY_PRACTICE.launch('main');await wait();
  assert.ok(w.document.querySelector('[data-ed3-session]'));
  w.SPM_RESOURCE_CONTEXT=()=>({...originalContext(),safety:'urgent'});
  w.dispatchEvent(new w.Event('spm:resourcecontext'));await wait();
  assert.equal(w.document.querySelector('[data-ed3-session]'),null);
  assert.ok(w.document.querySelector('[data-daily-safety]'));
  assert.equal(w.SPM_DAILY_PRACTICE.restricted(w.SPM_RESOURCE_CONTEXT(),'main'),true);
  await assert.rejects(w.SPM_DAILY_PRACTICE.saveActivity('main',{confirmed:true},scope,6));
  assert.equal(Object.keys(await w.SPM_DAILY_RECORDS.read(scope,6)).length,0);
  assert.deepEqual(h.errors,[]);
 }finally{h.close()}
});
test('Una carga lenta no abre ni descarta la sesión táctil actual de día 3',async()=>{
 const h=await harness('?programa=erection&dia=1');
 try{
  const {w}=h,read=w.SPM_DAILY_RECORDS.read;let resolveRead;
  w.SPM_DAILY_RECORDS.read=()=>new Promise(resolve=>{resolveRead=resolve});
  await w.SPM_PROGRAM_REVIEW.select('erection',3);await wait();
  assert.equal(w.document.querySelector('[data-activity="main"] [data-daily-open]').disabled,true);
  await w.SPM_DAILY_PRACTICE.launch('main');
  assert.equal(w.document.querySelector('[data-ed2-session]'),null);
  w.SPM_DAILY_RECORDS.read=read;resolveRead({});await wait();
  assert.equal(w.document.querySelector('[data-activity="main"] [data-daily-open]').disabled,false);
  await w.SPM_DAILY_PRACTICE.launch('main');await wait();
  assert.ok(w.document.querySelector('[data-ed2-session]'));
  assert.equal(w.document.querySelector('[data-erection-form]'),null);
  assert.deepEqual(h.errors,[]);
 }finally{h.close()}
});
test('Día 6 mantiene su sesión propia y la fuerza pélvica como apoyo independiente',async()=>{
 const h=await harness('?programa=erection&dia=6');
 try{
  const {w}=h,api=w.SPM_DAILY_PRACTICE,c=w.SPM_RESOURCE_CONTEXT(),scope=c.userId+':'+c.planId;
  const main=api.assignments().find(a=>a.id==='main');
  assert.equal(main.kind,'erection');assert.equal(main.erectionLesson,3);
  const strength=api.assignments().find(a=>a.kind==='pelvic'&&a.pelvicIntent==='scheduled');
  assert.ok(strength);assert.equal(strength.optional,true);assert.notEqual(strength.id,'main');
  assert.equal(api.assignments().some(a=>a.id==='pelvic-daily-lab'),false);
  await api.launch('main');await wait();
  assert.ok(w.document.querySelector('[data-ed3-session]'));
  await w.SPM_PROGRAM_REVIEW.select('erection',3);await wait();
  assert.ok(api.assignments().some(a=>a.id==='pelvic-daily-lab'));
  assert.equal(Object.keys(await w.SPM_DAILY_RECORDS.read(scope,6)).length,0);
  assert.deepEqual(h.errors,[]);
 }finally{h.close()}
});
test('DE day one includes an actionable body-release and no-hold breathing practice with Lenny guidance',async()=>{
  const h=await harness('?programa=erection&dia=1');try{
    const {w}=h,api=w.SPM_DAILY_PRACTICE,c=w.SPM_RESOURCE_CONTEXT(),scope=c.userId+':'+c.planId;
    const activity=api.assignments().find(a=>a.id==='breath-start');assert.ok(activity);assert.equal(activity.optional,false);assert.equal(activity.steps.join(','),'6,10');
    const card=w.document.querySelector('[data-activity="breath-start"]');assert.match(card.textContent,/Mi primera práctica: respira y suelta/);
    assert.equal(card.querySelector('audio'),null,'la narración de Respira y suelta permanece dentro de la práctica');
    await api.launch('breath-start');assert.ok(w.document.querySelector('.spm-breathing-modal[open] iframe'));
    assert.equal(w.SPM_BREATHING_LAB_HOST.getContext().activity.id,'breath-start');assert.equal(w.SPM_BREATHING_LAB_HOST.getContext().activity.steps.join(','),'6,10');
    assert.equal(Object.keys(await w.SPM_DAILY_RECORDS.read(scope,1)).length,0);assert.equal(w.SPM_RESOURCE_CONTEXT().day,1);
    await w.SPM_BREATHING_LAB.close();await w.SPM_PROGRAM_REVIEW.select('ejaculation',1);await wait();
    assert.equal(api.assignments().some(a=>a.id==='breath-start'),false);assert.deepEqual(h.errors,[]);
  }finally{h.close();}
});

test('Con alerta de revisión los días transversales siguen disponibles sin activar el módulo antiguo',async()=>{
 const h=await harness('?programa=erection&dia=4');
 try{
  const {w}=h,originalContext=w.SPM_RESOURCE_CONTEXT;
  w.SPM_RESOURCE_CONTEXT=()=>({...originalContext(),safety:'review'});
  for(const day of [4,5,6]){
   await w.SPM_PROGRAM_REVIEW.select('erection',day);await wait();
   const main=w.SPM_DAILY_PRACTICE.assignments().find(a=>a.id==='main');
   assert.equal(main.kind,day===6?'erection':'erection-support-day');
   assert.equal(w.SPM_DAILY_PRACTICE.restricted(w.SPM_RESOURCE_CONTEXT(),main),day===6);
   await w.SPM_DAILY_PRACTICE.launch('main');await wait();
   assert.equal(w.document.querySelector('[data-erection-form]'),null);
   assert.equal(w.document.querySelector('[data-ed3-session]'),null);
   const c=w.SPM_RESOURCE_CONTEXT();
   assert.equal(c.safety,'review');
   assert.equal(Object.keys(await w.SPM_DAILY_RECORDS.read(c.userId+':'+c.planId,day)).length,0);
  }
  assert.deepEqual(h.errors,[]);
 }finally{h.close()}
});
test('DE day two opens the real seven-step strength interface with the unmodified review profile',async()=>{
 const h=await harness('?programa=erection&dia=2');try{
  const {w}=h,api=w.SPM_DAILY_PRACTICE;
  assert.equal(w.SPM_RESOURCE_CONTEXT().answers.pf_awareness,'good_control');
  const strength=api.assignments().find(a=>a.kind==='pelvic'&&a.pelvicIntent==='scheduled');
  assert.ok(strength);assert.equal(strength.pelvicPreference,'classic');
  assert.equal(api.assignments().some(a=>a.id==='pelvic-daily-lab'),false);
  const button=w.document.querySelector('[data-activity="'+strength.id+'"] [data-daily-open]');
  assert.ok(button);
  button.click();await new Promise(r=>setTimeout(r,80));
  const trainer=w.document.querySelector('#spmPelvicV2:not([hidden])');
  assert.ok(trainer,'day-2 button opens the seven-step strength trainer');
  assert.equal(trainer.querySelector('.pv2-main').classList.contains('pv2-cover-page'),true);assert.match(trainer.querySelector('.pv2-cover-crop img').getAttribute('src'),/8c01592d-7a59-434e-a0b6-11a7497a0b0d/);
  assert.equal(trainer.querySelectorAll('[data-step]').length,7);
  assert.equal(w.document.querySelector('.spm-pf-modal[open] iframe'),null,'Pelvic Floor Lab must not be mounted');
  assert.equal(w.SPM_PELVIC_LAB_HOST,undefined);
  assert.deepEqual(h.errors,[]);
  w.SPM_PELVIC_V2.close();
 }finally{h.close();}
});

test('EP pre-activity speaker explains repetition in the correct 28-day sessions, without changing cadence',async()=>{
  const h=await harness('?programa=ejaculation&dia=1');
  try {
    const {w}=h;
    const sample=[
      [1,'tres sesiones','compresión'],[3,'repetición','Stop.?Squeeze'],[5,'repetición','Stop.?Squeeze'],
      [8,'Stop.?Start','sin compresión'],[10,'repites','sin compresión'],
      [12,'repites','sin compresión'],
      [15,'Semana tres','piso pélvico'],[17,'repites','técnica combinada'],
      [22,'Semana cuatro','Stop.?Squeeze'],[24,'Semana cuatro','Stop.?Start'],[26,'Semana cuatro','técnica combinada']
    ];
    for(const [day,needle,topic] of sample){
      assert.equal(await w.SPM_PROGRAM_REVIEW.select('ejaculation',day),true);
      await wait();
      const main=w.document.querySelector('#spmDailySession [data-activity="main"]');
      assert.ok(main,'main activity visible on day '+day);
      const speaker=main.querySelector('[data-spm-speak]');
      assert.ok(speaker,'pre-activity voice present on day '+day);
      const voice=speaker.getAttribute('data-spm-speak');
      assert.match(voice,new RegExp(needle,'i'),'repetition explanation on day '+day);
      assert.match(voice,new RegExp(topic,'i'),'technique-specific voice on day '+day);
      if(day===1)assert.match(voice,/tres sesiones/i);
      else {
       assert.doesNotMatch(voice,/tres sesiones|sesión \d de tres|bocina/i,'avoid repeated weekly cadence and speaker instructions');
       assert.ok(voice.length<550,'focused pre-activity instruction without redundant introductions');
      }
      assert.equal(speaker.dataset.audioLabel,'Escuchar indicación');
    }
    const weeks=[1,8,15,22];
    for(const start of weeks){
      const sessionDays=Object.keys(w.SPM_EJACULATORY_CONTROL.schedule).filter(d=>Number(d)>=start&&Number(d)<start+7);
      assert.equal(sessionDays.length,3,'three total technique sessions in week starting '+start);
    }
    assert.deepEqual(h.errors,[]);
  } finally {h.close()}
});

test('days 15/17/19 open pelvic-floor combined rather than obsolete EP modal; week four order is Squeeze, Start, Combined',async()=>{
 const h=await harness('?programa=ejaculation&dia=15');
 try{
  const w=h.w,planned=[[15,'combined'],[17,'combined'],[19,'combined'],[22,'squeeze'],[24,'startstop'],[26,'combined']];
  for(const [day,tech] of planned){
   assert.equal(await w.SPM_PROGRAM_REVIEW.select('ejaculation',day),true);await wait();
   assert.equal(w.SPM_EJACULATORY_CONTROL.schedule[day].tech,tech);
   await w.SPM_DAILY_PRACTICE.launch('main');
   const selector={combined:'#spmCombinedV1',squeeze:'#spmSqueezeV1',startstop:'#spmStartStopV2'}[tech];
   const modal=w.document.querySelector(selector);
   assert.ok(modal&&!modal.hidden,day+' must open '+tech+' premium UI');
   assert.equal(w.document.querySelector('#spmEcModal.on'),null,'obsolete EP modal not opened');
   assert.match(modal.shadowRoot.querySelector('#stage img')?.getAttribute('src')||'',/combinada-intro|stop-squeeze|stop-start/);
  }
  assert.equal(await w.SPM_PROGRAM_REVIEW.select('ejaculation',27),true);
  assert.ok(w.document.querySelector('#spmCombinedV1').hidden,'combined UI closes on day change');
  assert.deepEqual(h.errors,[]);
 }finally{h.close()}
});
test('las actividades reprogramadas 2, 3 y 4 se abren en días 3, 6 y 9 sin formularios antiguos',async()=>{
 for(const [day,lesson,count] of [[3,2,4],[6,3,3],[9,4,3]]){
  const h=await harness('?programa=erection&dia='+day);
  try{
   const {w}=h,main=w.SPM_DAILY_PRACTICE.assignments().find(a=>a.id==='main');
   assert.equal(main.kind,'erection');assert.equal(main.erectionLesson,lesson);
   assert.equal(w.SPM_ACTIVE_MODULE_RELEASE.resolve(w.SPM_RESOURCE_CONTEXT(),main).screens,count);
   await w.SPM_DAILY_PRACTICE.launch('main');await wait();
   assert.ok(w.document.querySelector('.spm-ed'+lesson+'-session[data-screen="1"]'));
   assert.equal(w.document.querySelector('[data-erection-form]'),null);
   assert.deepEqual(h.errors,[]);
  }finally{h.close()}
 }
});
test('El Día 1 mantiene su cierre tras guardar y solo vuelve a Hoy mediante el CTA',async()=>{
 const h=await harness('?programa=erection&dia=1');
 try{
  const {w}=h,doc=w.document;
  await w.SPM_DAILY_PRACTICE.launch('main');await wait();
  const touch=selector=>{const el=doc.querySelector(selector);assert.ok(el,'Falta control '+selector);el.click();};
  assert.ok(doc.querySelector('.spm-ed1-session.spm-er-fullscreen[data-screen="1"]'));
  touch('[data-ed1-act="next"]');
  touch('[data-ed1-act="ehs"][data-value="3"]');
  touch('[data-ed1-act="next"]');
  touch('[data-ed1-act="next"]');
  touch('[data-ed1-act="next"]');
  touch('[data-ed1-act="outcome"][data-value="returned"]');
  touch('[data-ed1-act="save"]');
  await wait();await wait();
  const overlay=doc.querySelector('.spm-ed1-success-overlay');
  assert.ok(overlay,'La pantalla 6 debe aparecer después del guardado');
  const c=w.SPM_RESOURCE_CONTEXT(),saved=await w.SPM_DAILY_RECORDS.read(c.userId+':'+c.planId,1);
  assert.equal(saved.main.completed,true);
  assert.equal(saved.main.ehs,3);
  await new Promise(resolve=>setTimeout(resolve,1850));
  assert.equal(doc.querySelector('.spm-ed1-success-overlay'),overlay,'La pantalla 6 no debe cerrarse sola');
  touch('[data-ed1-success-close]');await wait();
  assert.equal(doc.querySelector('.spm-ed1-success-overlay'),null);
  assert.match(doc.querySelector('#spmDailySession').textContent,/Registrada|registrada|Volver a abrir/);
  assert.equal(w.SPM_RESOURCE_CONTEXT().day,1);
  assert.deepEqual(h.errors,[]);
 }finally{h.close()}
});
