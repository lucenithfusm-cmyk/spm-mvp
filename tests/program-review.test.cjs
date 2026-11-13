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
    await w.SPM_PROGRAM_REVIEW.select('erection',1);await wait();
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
