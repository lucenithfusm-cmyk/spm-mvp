const {test}=require('node:test'),assert=require('node:assert/strict');
const {harness,wait}=require('./helpers/reviewer-harness.cjs');
test('Today shows one principal and at most one support while resources remain compact',async()=>{
 const h=await harness('?programa=erection&dia=3');try{const w=h.w,host=w.document.querySelector('#spmDailySession');assert.equal(w.SPM_RESOURCE_CONTEXT().scheduleVersion,'spm-20261127-v1');assert.equal(host.querySelectorAll('.spm-daily-activities [data-activity]').length,2);assert.equal(host.querySelectorAll('.spm-daily-section-title').length,2);assert.match(host.textContent,/Tu práctica principal/);assert.match(host.textContent,/Un apoyo según tu necesidad/);assert.match(host.querySelector('.spm-daily-resources summary').textContent,/Recursos que puedes explorar/);assert.equal(host.querySelector('.spm-daily-resources').open,false);}finally{h.close();}
});
test('a voluntary day asks explicitly and closes with zero performed activities',async()=>{
 const h=await harness('?programa=erection&dia=16');try{const w=h.w,button=w.document.querySelector('#spmDailyComplete');assert.equal(button.disabled,false);button.click();await wait();assert.match(w.document.querySelector('.spm-day-confirm').textContent,/aunque no hayas realizado ninguna/);assert.equal(w.SPM_RESOURCE_CONTEXT().completed.includes(16),false);w.document.querySelector('[data-confirm-day]').click();await wait(80);assert.equal(w.SPM_RESOURCE_CONTEXT().completed.includes(16),true);assert.deepEqual(JSON.parse(JSON.stringify(await w.SPM_DAILY_RECORDS.read('review-only:review-erection',16))),{});assert.match(w.document.querySelector('#spmDailyClosing').textContent,/CERRADO/);}finally{h.close();}
});
test('a required activity cannot be bypassed by calling the reviewer closure adapter',async()=>{
 const h=await harness('?programa=confidence&dia=2');try{const w=h.w;assert.equal(w.document.querySelector('#spmDailyComplete').disabled,true);await assert.rejects(w.SPM_COMPLETE_DAILY_PRACTICE(2,'review-only:review-confidence'),/guardar.*registros?/);assert.equal(w.SPM_RESOURCE_CONTEXT().completed.includes(2),false);}finally{h.close();}
});
test('moved Connection day 10 opens its real screen on Control day 11 without changing the plan day',async()=>{
 const h=await harness('?programa=ejaculation&dia=11');try{const w=h.w;await w.SPM_DAILY_PRACTICE.launch('conexion-satisfaccion');assert.equal(w.SPM_RESOURCE_CONTEXT().day,11);assert.equal(w.SPM_DAILY_PRACTICE.active().sourceDay,10);const image=w.document.querySelector('#spmDailyWorkspace img');assert.ok(image);assert.match(image.getAttribute('src'),/d10\.webp/);assert.match(w.document.querySelector('#spmDailyWorkspace').textContent,/Elegir mis dos opciones/);}finally{h.close();}
});
test('moved Confianza source day 12 opens on scheduled day 11',async()=>{
 const h=await harness('?programa=confidence&dia=11');try{const w=h.w;await w.SPM_DAILY_PRACTICE.launch('main');assert.equal(w.SPM_RESOURCE_CONTEXT().day,11);assert.equal(w.SPM_DAILY_PRACTICE.active().sourceDay,12);assert.match(w.document.querySelector('#spmDailyWorkspace .ep-canvas').style.backgroundImage,/confianza-nuevas\/d12\.webp/);}finally{h.close();}
});
test('Desire source day 26 opens on the final scheduled day without a fake context switch',async()=>{
 const h=await harness('?programa=desire&dia=28');try{const w=h.w;await w.SPM_DAILY_PRACTICE.launch('main');const frame=w.document.querySelector('#spmDailyWorkspace iframe');assert.ok(frame);assert.match(frame.src,/desire-week4-v1\/index.html.*day=26/);assert.equal(w.SPM_RESOURCE_CONTEXT().day,28);assert.equal(w.SPM_DAILY_PRACTICE.active().sourceDay,26);}finally{h.close();}
});
test('an integrated Focalización video opens inside the support, not as a second completion task',async()=>{
 const h=await harness('?programa=wellbeing&dia=4');try{const w=h.w,focus=w.SPM_DAILY_PRACTICE.assignments().find(a=>a.kind==='sensate');assert.equal(w.document.querySelector('[data-integrated-explanation]'),null);await w.SPM_DAILY_PRACTICE.launch(focus.id);const modal=w.document.querySelector('.spm-sensate-modal[open]');assert.ok(modal.querySelector('[data-integrated-explanation] video'));assert.equal(modal.querySelector('[data-integrated-explanation] input'),null);assert.equal(w.SPM_DAILY_PRACTICE.assignments().filter(a=>a.kind==='video').length,0);}finally{h.close();}
});
async function weekMessage(w,frame,type,record,extra={}){
 const url=new URL(frame.src),data={type,sid:url.searchParams.get('sid'),day:Number(url.searchParams.get('day')),...(record?{record}:{}),...extra};
 w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:frame.contentWindow,data}));await wait();
}
test('Desire source day 26 saves to scheduled day 28 with its original curriculum identity',async()=>{
 const h=await harness('?programa=desire&dia=28');try{
  const w=h.w,scope='review-only:review-desire';await w.SPM_DAILY_PRACTICE.launch('main');const frame=w.document.querySelector('#spmDailyWorkspace iframe'),messages=[];frame.contentWindow.postMessage=data=>messages.push(data);
  await weekMessage(w,frame,'SPM_WEEK4_READY');const init=messages.find(m=>m.type==='SPM_WEEK4_INIT');assert.ok(init);
  await weekMessage(w,frame,'SPM_WEEK4_COMPLETE',{...init.record,step:4,confirm:true,fields:{reflection:'Dato sintético de QA'},hasStarted:true});
  const saved=(await w.SPM_DAILY_RECORDS.read(scope,28)).main;assert.ok(saved);assert.equal(saved.day,28);assert.equal(saved.sourceDay,26);assert.equal(saved.contentDay,26);assert.equal(saved.scheduledDay,28);assert.equal(saved.contentId,'desire:content_day:26');assert.equal(saved.completed,true);
  const p=JSON.parse((await w.SPM_DESIRE_RECORDS.read(scope))['spm-desire-program']);assert.equal(p.sessions.at(-1).day,26);assert.equal(p.sessions.at(-1).sourceDay,26);assert.equal(p.sessions.at(-1).scheduledDay,28);assert.equal(p.sessions.at(-1).practiceId,'continuity-goals');assert.equal(w.SPM_RESOURCE_CONTEXT().completed.includes(28),false);
 }finally{h.close();}
});
test('a voluntary close flushes the open Desire draft without creating a performed practice',async()=>{
 const h=await harness('?programa=erection&dia=16&secundario=desire');try{
  const w=h.w,scope='review-only:review-erection';await w.SPM_DAILY_PRACTICE.launch('main');const frame=w.document.querySelector('#spmDailyWorkspace iframe'),messages=[];frame.contentWindow.postMessage=data=>messages.push(data);
  await weekMessage(w,frame,'SPM_WEEK3_READY');const init=messages.find(m=>m.type==='SPM_WEEK3_INIT');
  await weekMessage(w,frame,'SPM_WEEK3_CHANGE',{...init.record,step:2,fields:{reflection:'Borrador sintético que se conserva'}});
  w.document.querySelector('#spmDailyComplete').click();await wait();w.document.querySelector('[data-confirm-day]').click();await wait(80);
  const p=JSON.parse((await w.SPM_DESIRE_RECORDS.read(scope))['spm-desire-program']);assert.equal(JSON.parse(p.detailNotes.desireWeek3TouchDay18).fields.reflection,'Borrador sintético que se conserva');assert.equal((p.sessions||[]).length,0);assert.equal((await w.SPM_DAILY_RECORDS.read(scope,16)).main,undefined);assert.equal(w.SPM_RESOURCE_CONTEXT().completed.includes(16),true);assert.equal(w.SPM_RESOURCE_CONTEXT().day,16);
 }finally{h.close();}
});
test('a changed schedule version rejects the old iframe response even when account, plan and day match',async()=>{
 const h=await harness('?programa=desire&dia=28');try{
  const w=h.w,scope='review-only:review-desire';await w.SPM_DAILY_PRACTICE.launch('main');const frame=w.document.querySelector('#spmDailyWorkspace iframe'),messages=[];frame.contentWindow.postMessage=data=>messages.push(data);
  await weekMessage(w,frame,'SPM_WEEK4_READY');const init=messages.find(m=>m.type==='SPM_WEEK4_INIT'),context=w.SPM_RESOURCE_CONTEXT;w.SPM_RESOURCE_CONTEXT=()=>({...context(),scheduleVersion:'legacy'});
  await weekMessage(w,frame,'SPM_WEEK4_COMPLETE',{...init.record,step:4,confirm:true});assert.equal((await w.SPM_DAILY_RECORDS.read(scope,28)).main,undefined);assert.equal((await w.SPM_DESIRE_RECORDS.read(scope))['spm-desire-program'],undefined);
 }finally{h.close();}
});
test('DE01 omitted attention satisfies the saved decision and remains zero performed practices',async()=>{
 const h=await harness('?programa=erection&dia=1');try{
  const w=h.w,scope='review-only:review-erection';await w.SPM_DAILY_PRACTICE.launch('main');const click=q=>{const b=w.document.querySelector(q);assert.ok(b,q);b.click();};
  click('[data-ed1-act="next"]');click('[data-ed1-act="omit-ehs"]');click('[data-ed1-act="next"]');click('[data-ed1-act="next"]');click('[data-ed1-act="outcome"][data-value="omitted"]');click('[data-ed1-act="save"]');await wait(60);
  const r=await w.SPM_DAILY_RECORDS.read(scope,1),a=w.SPM_DAILY_PRACTICE.assignments()[0];assert.equal(r.main.completed,false);assert.equal(r.main.activityStatus,'omitted');assert.equal(r.main.ehs,null);assert.equal(r.main.ehsEvaluable,null);assert.equal(w.SPM_DAILY_PRACTICE.recordSatisfies(a,r),true);assert.equal(w.SPM_DAILY_PRACTICE.recordComplete(a,r),false);assert.equal(w.SPM_DAILY_PRACTICE.closeDecision(w.SPM_RESOURCE_CONTEXT(),r,{recordsLoaded:true}).allowed,true);
 }finally{h.close();}
});


test('a failed draft flush keeps the voluntary day open and the actual activity available for retry',async()=>{
 const h=await harness('?programa=erection&dia=16&secundario=desire');try{
  const w=h.w,scope='review-only:review-erection';await w.SPM_DAILY_PRACTICE.launch('main');
  const frame=w.document.querySelector('#spmDailyWorkspace iframe'),messages=[];frame.contentWindow.postMessage=data=>messages.push(data);
  await weekMessage(w,frame,'SPM_WEEK3_READY');const init=messages.find(m=>m.type==='SPM_WEEK3_INIT');
  await weekMessage(w,frame,'SPM_WEEK3_CHANGE',{...init.record,step:2,fields:{reflection:'Borrador sintético pendiente'}});
  const save=w.SPM_DESIRE_RECORDS.save;w.SPM_DESIRE_RECORDS.save=async()=>{throw Error('Simulated offline');};
  w.document.querySelector('#spmDailyComplete').click();await wait();w.document.querySelector('[data-confirm-day]').click();await wait(80);
  assert.equal(w.SPM_RESOURCE_CONTEXT().completed.includes(16),false);assert.equal((await w.SPM_DAILY_RECORDS.read(scope,16)).main,undefined);assert.ok(frame.isConnected);assert.match(w.document.querySelector('#spmDailyStatus').textContent,/No se pudo guardar el borrador/);
  w.SPM_DESIRE_RECORDS.save=save;w.document.querySelector('#spmDailyComplete').click();await wait();w.document.querySelector('[data-confirm-day]').click();await wait(80);
  assert.equal(w.SPM_RESOURCE_CONTEXT().completed.includes(16),true);assert.equal((await w.SPM_DAILY_RECORDS.read(scope,16)).main,undefined);
 }finally{h.close();}
});


test('a completed cycle keeps its closed label when a later safety flag blocks all practice',async()=>{
 const h=await harness('?programa=lifestyle&dia=28');try{
  const w=h.w,context=w.SPM_RESOURCE_CONTEXT;w.SPM_RESOURCE_CONTEXT=()=>({...context(),cycleStatus:'completed',completed:[28],safety:'urgent',flags:['s_cardiac']});
  w.dispatchEvent(new w.Event('spm:resourcecontext'));await wait();w.SPM_DAILY_PRACTICE.open();
  const button=w.document.querySelector('#spmDailyComplete');assert.equal(button.disabled,true);assert.equal(button.textContent,'Ciclo cerrado ✓');assert.match(w.document.querySelector('.spm-daily-count').textContent,/Ciclo de 28 jornadas cerrado/);assert.match(w.document.querySelector('#spmDailyStatus').textContent,/Tu ciclo está cerrado/);
  const c=w.SPM_RESOURCE_CONTEXT();assert.equal(w.SPM_DAILY_PRACTICE.closeDecision(c,{}, {recordsLoaded:true}).allowed,false);assert.ok(w.SPM_DAILY_PRACTICE.assignments(c).every(a=>w.SPM_DAILY_PRACTICE.restricted(c,a)));
 }finally{h.close();}
});
