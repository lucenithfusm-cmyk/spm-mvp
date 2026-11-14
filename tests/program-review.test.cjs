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
    await w.SPM_PROGRAM_REVIEW.select('erection',7);await wait();
    await w.SPM_DAILY_PRACTICE.launch('main');assert.ok(w.document.querySelector('#spmDeModal.on'));
    assert.equal(await w.SPM_PROGRAM_REVIEW.select('ejaculation',1),true);await wait();assert.equal(w.document.querySelector('#spmDeModal.on'),null);
    await w.SPM_DAILY_PRACTICE.launch('main');assert.ok(w.document.querySelector('#spmEcModal.on'));
    assert.equal(await w.SPM_PROGRAM_REVIEW.select('ejaculation',14),true);await wait();assert.equal(w.document.querySelector('#spmEcModal.on'),null);
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

test('erection days 1–5 open the recorded inline practice and save only its explicit responses',async()=>{
  const h=await harness('?programa=erection&dia=1');try{
    const {w}=h,api=w.SPM_DAILY_PRACTICE;
    for(const day of [1,2,3,4,5]){
      if(day!==1){await w.SPM_PROGRAM_REVIEW.select('erection',day);await wait();}
      const c=w.SPM_RESOURCE_CONTEXT(),scope=c.userId+':'+c.planId,card=w.document.querySelector('[data-activity="main"]');
      assert.equal(card.dataset.directPractice,'erection');
      assert.equal(card.querySelector('[data-daily-confirm]'),null,'no unchecked shortcut to completion');
      assert.equal(card.querySelector('[data-spm-speak]'),null,'no competing outer narration');
      await assert.rejects(api.saveActivity('main',{confirmed:true}),/Completa las acciones/);
      await api.launch('main');
      const panel=w.document.querySelector('[data-erection-practice]'),form=panel.querySelector('form');
      assert.equal(w.document.querySelector('#spmDeModal.on'),null);
      assert.equal(w.document.querySelector('#spmDailySession').dataset.focusedPractice,'erection');
      assert.equal(panel.querySelector('audio').getAttribute('src'),day===1?'/premium-v2/assets/audio/erection/erection-day-1-ehs-20261113.mp3':'/premium-v2/assets/audio/erection/erection-day-'+day+'-20261113.mp3');
      assert.equal(panel.querySelector('[data-checkpoint-audio-transcript]').open,false);
      assert.equal(form.elements.namedItem('anxiety').value,'');assert.equal(form.elements.namedItem('confidence').value,'');
      if(day===1)form.querySelector('[name="ehs"][value="na"]').checked=true;
      if(day===2){
        form.elements.namedItem('context-spontaneous').value='not_evaluable';
        form.elements.namedItem('context-solo').value='variable';
        form.elements.namedItem('context-partner').value='difficult';
        form.querySelector('[name="responseAspect"][value="maintain"]').checked=true;
      }
      if(day===3){
        form.querySelector('[name="tensionArea"][value="none"]').checked=true;
        form.querySelector('[name="sensoryAnchor"][value="hands"]').checked=true;
        assert.equal(panel.querySelector('[data-erection-time]').textContent,'00:00');
      }
      if(day===4){
        form.querySelector('[name="attentionSense"][value="temperature"]').checked=true;
        form.querySelector('[name="practiceExperience"][value="no_checking"]').checked=true;
        assert.equal(panel.querySelector('[data-erection-time]').textContent,'00:00');
      }
      if(day===5){
        form.querySelector('[name="erectionFacilitators"][value="privacy"]').checked=true;
        form.querySelector('[name="erectionInhibitors"][value="pressure"]').checked=true;
        form.querySelector('[name="microAdjustment"][value="time"]').checked=true;
      }
      form.elements.namedItem('confirmed').checked=true;
      form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await wait();
      const records=await w.SPM_DAILY_RECORDS.read(scope,day);
      assert.equal(Object.keys(records).join(','),'main');
      assert.equal(records.main.completed,true);assert.equal(records.main.anxiety,null);assert.equal(records.main.confidence,null);
      assert.equal(w.SPM_RESOURCE_CONTEXT().day,day);assert.equal(w.SPM_RESOURCE_CONTEXT().completed.length,0);
      assert.equal(w.document.querySelector('[data-erection-practice]'),null);
      assert.equal(w.document.querySelector('#spmDailySession').dataset.focusedPractice,undefined);
      assert.ok(w.document.querySelector('#spmDailyWorkspace [data-spm-next]'),'save returns to available activities');
      assert.equal(w.document.querySelector('#spmDailyComplete').disabled,true,'other required activities remain pending');
      if(day===1){assert.equal(records.main.ehs,null);assert.equal(records.main.ehsEvaluable,false);}
      if(day===2)assert.equal(records.main.contexts.solo,'variable');
      if(day===3){assert.equal(records.main.seconds,null);assert.equal(records['breath-learn'],undefined);assert.ok(api.nextActivities().some(a=>a.id==='breath-learn'));}
      if(day===4){assert.equal(records.main.seconds,null);assert.equal(records.main.practiceExperience,'no_checking');assert.ok(api.nextActivities().some(a=>a.id==='sensate-prepare'));assert.ok(api.nextActivities().some(a=>a.id==='recovery-condom'));}
      if(day===5){assert.equal(records.main.microAdjustment,'time');assert.equal(records.main.erectionFacilitators.join(','),'privacy');assert.ok(api.nextActivities().some(a=>a.id==='de-desire-5'));}
      api.open();await api.launch('main');
      const reopened=w.document.querySelector('[data-erection-form]');
      assert.equal(reopened.elements.namedItem('confirmed').checked,false,'reopening does not manufacture a new confirmation');
      if(day===1)assert.equal(reopened.querySelector('[name="ehs"][value="na"]').checked,true);
    }
    assert.deepEqual(h.errors,[]);
  }finally{h.close();}
});

test('a same-day safety refresh restores the overview and cannot save a detached erection practice',async()=>{
  const h=await harness('?programa=erection&dia=3');try{
    const {w}=h,originalContext=w.SPM_RESOURCE_CONTEXT,c=originalContext(),scope=c.userId+':'+c.planId;
    await w.SPM_DAILY_PRACTICE.launch('main');
    const form=w.document.querySelector('[data-erection-form]');
    form.querySelector('[name="tensionArea"][value="none"]').checked=true;
    form.querySelector('[name="sensoryAnchor"][value="hands"]').checked=true;
    form.elements.namedItem('confirmed').checked=true;
    w.SPM_RESOURCE_CONTEXT=()=>({...originalContext(),safety:'urgent'});
    w.dispatchEvent(new w.Event('spm:resourcecontext'));await wait();
    assert.equal(form.isConnected,false);
    assert.equal(w.document.querySelector('#spmDailySession').dataset.focusedPractice,undefined);
    assert.ok(w.document.querySelector('[data-daily-safety]'));
    assert.equal(w.document.querySelector('[data-activity="main"] [data-daily-open]').textContent,'Ver indicación y opciones');
    form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await wait();
    assert.equal(Object.keys(await w.SPM_DAILY_RECORDS.read(scope,3)).length,0);
    assert.equal(w.SPM_RESOURCE_CONTEXT().day,3);assert.deepEqual(h.errors,[]);
  }finally{h.close();}
});

test('a slow daily-record load cannot open and then discard an erection response form',async()=>{
  const h=await harness('?programa=erection&dia=1');try{
    const {w}=h,read=w.SPM_DAILY_RECORDS.read;let resolveRead;
    w.SPM_DAILY_RECORDS.read=()=>new Promise(resolve=>{resolveRead=resolve;});
    await w.SPM_PROGRAM_REVIEW.select('erection',2);await wait();
    assert.equal(w.document.querySelector('[data-activity="main"] [data-daily-open]').disabled,true);
    await w.SPM_DAILY_PRACTICE.launch('main');
    assert.equal(w.document.querySelector('[data-erection-form]'),null);
    assert.match(w.document.querySelector('#spmDailyStatus').textContent,/recuperando tus registros/);
    w.SPM_DAILY_RECORDS.read=read;resolveRead({});await wait();
    assert.equal(w.document.querySelector('[data-activity="main"] [data-daily-open]').disabled,false);
    await w.SPM_DAILY_PRACTICE.launch('main');
    assert.ok(w.document.querySelector('[data-erection-form]'));
    assert.deepEqual(h.errors,[]);
  }finally{h.close();}
});

test('day six keeps strength separate while day three hosts the one weekly awareness Lab',async()=>{
 const h=await harness('?programa=erection&dia=6');try{
  const {w}=h,api=w.SPM_DAILY_PRACTICE,c=w.SPM_RESOURCE_CONTEXT(),scope=c.userId+':'+c.planId;
  const main=api.assignments().find(a=>a.id==='main');
  assert.equal(main.kind,'pelvic');assert.equal(main.pelvicPreference,'classic');assert.equal(main.pelvicIntent,'scheduled');assert.equal(main.optional,true);
  assert.equal(api.assignments().some(a=>a.id==='pelvic-daily-lab'),false);
  assert.equal(w.document.querySelector('[data-activity="main"] audio').getAttribute('src'),'/premium-v2/assets/audio/pelvic/pelvic-strength-entry-20261113.mp3');
  await api.launch('main');assert.match(w.document.querySelector('#spmPelvicV2:not([hidden]) .pv2-cover-crop img').getAttribute('alt'),/Conoce tu piso pélvico/);assert.equal(w.document.querySelector('.spm-pf-modal[open] iframe'),null);
  w.SPM_PELVIC_V2.close();
  const originalContext=w.SPM_RESOURCE_CONTEXT,originalClassic=w.SPM_PELVIC_V2.open,calls=[];
  w.SPM_RESOURCE_CONTEXT=()=>({...originalContext(),answers:{pf_awareness:'good_control',pf_tension:1,e_maint:1}});
  w.SPM_PELVIC_V2.open=opts=>{calls.push(opts);return true;};
  w.dispatchEvent(new w.Event('spm:resourcecontext'));await wait();
  await api.launch('main');assert.equal(calls.length,1);assert.equal(calls[0].readiness(),'ready');assert.equal(calls[0].intent,'scheduled');
  const originalRead=w.SPM_PELVIC_RECORDS.read;w.SPM_PELVIC_RECORDS.read=async()=>({'pf-overload':[0]});
  await api.launch('main');assert.equal(calls.length,1,'overload keeps strength paused');
  assert.equal(w.document.querySelector('.spm-pf-modal[open] iframe'),null);
  await w.SPM_PELVIC_LAB.close();w.SPM_PELVIC_RECORDS.read=originalRead;w.SPM_PELVIC_V2.open=originalClassic;w.SPM_RESOURCE_CONTEXT=originalContext;
  assert.equal(Object.keys(await w.SPM_DAILY_RECORDS.read(scope,6)).length,0);
  await w.SPM_PROGRAM_REVIEW.select('erection',3);await wait();
  const lab=api.assignments().find(a=>a.id==='pelvic-daily-lab');assert.ok(lab);assert.equal(lab.pelvicIntent,'daily-relax');assert.equal(lab.optional,true);
  const card=w.document.querySelector('[data-activity="pelvic-daily-lab"]');
  assert.equal(card.querySelector('[data-daily-recorded-guide]'),null);assert.equal(card.querySelector('audio'),null);
  assert.equal(card.querySelector('[data-daily-confirm]'),null);
  await api.launch('pelvic-daily-lab');assert.ok(w.document.querySelector('.spm-pf-modal[open] iframe'));
  assert.equal(w.SPM_PELVIC_LAB_HOST.getContext().intent,'daily-relax');
  assert.equal(w.SPM_PELVIC_LAB_HOST.getContext().day,3);
  assert.equal(w.SPM_PELVIC_LAB_HOST.getContext().activityId,'pelvic-daily-lab');
  await w.SPM_PELVIC_LAB.close();
  assert.deepEqual(h.errors.filter(e=>!e.includes('Not implemented: HTMLMediaElement.prototype.pause')),[],'iframe audio stubs are unavailable in JSDOM, not in the real player');
 }finally{h.close();}
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

test('days four and six remain paused under review and day five retains its educational alternative',async()=>{
  const h=await harness('?programa=erection&dia=4');try{
    const {w}=h,originalContext=w.SPM_RESOURCE_CONTEXT;
    w.SPM_RESOURCE_CONTEXT=()=>({...originalContext(),safety:'review'});
    for(const day of [4,5,6]){
      await w.SPM_PROGRAM_REVIEW.select('erection',day);await wait();
      const main=w.SPM_DAILY_PRACTICE.assignments().find(a=>a.id==='main');
      assert.equal(w.SPM_DAILY_PRACTICE.restricted(w.SPM_RESOURCE_CONTEXT(),main),day!==5);
      await w.SPM_DAILY_PRACTICE.launch('main');
      assert.equal(w.document.querySelector('[data-erection-practice]'),null);
      assert.equal(w.document.querySelector('.spm-pf-modal[open]'),null);
      assert.equal(w.document.querySelector('[data-daily-pelvic-guide]'),null);
      if(day===5){assert.equal(main.kind,'worksheet');assert.ok(w.document.querySelector('#spmDailyWorkspace [name="reflection"]'));}
      const c=w.SPM_RESOURCE_CONTEXT();assert.equal(c.safety,'review');assert.equal(Object.keys(await w.SPM_DAILY_RECORDS.read(c.userId+':'+c.planId,day)).length,0);
    }
    assert.deepEqual(h.errors,[]);
  }finally{h.close();}
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
