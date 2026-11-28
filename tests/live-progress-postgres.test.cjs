const test=require('node:test'),assert=require('node:assert/strict');
const {backend,plain}=require('./helpers/live-postgres-harness.cjs');
const {validDailyRecord}=require('./helpers/valid-daily-record.cjs');
let b;test.before(async()=>{b=await backend()});test.after(async()=>{await b.close()});
const scope=w=>{const c=w.SPM_RESOURCE_CONTEXT();return c.userId+':'+c.planId};
const assigned=w=>w.SPM_DAILY_PRACTICE.assignments(w.SPM_RESOURCE_CONTEXT()).find(x=>!x.optional)||w.SPM_DAILY_PRACTICE.assignments(w.SPM_RESOURCE_CONTEXT())[0];

test('app-live → PostgreSQL: cierre voluntario confirmado y restauración desde otra sesión',async()=>{
 const p=await b.createPlan(),h=await b.app(p);
 try{await assert.rejects(h.w.SPM_COMPLETE_DAILY_PRACTICE(1,scope(h.w)),/Confirma/);await h.w.SPM_COMPLETE_DAILY_PRACTICE(1,scope(h.w),{confirmVoluntary:true});assert.equal(h.w.SPM_RESOURCE_CONTEXT().day,2);assert.equal((await b.state(p)).closures[0].realized_count,0);
  const reopened=await b.app(p);try{assert.equal(reopened.w.SPM_RESOURCE_CONTEXT().day,2);assert.deepEqual(plain(reopened.w.SPM_RESOURCE_CONTEXT().completed),[1]);assert.deepEqual(reopened.errors,[])}finally{reopened.close()}
 }finally{h.close()}
});
test('respuesta perdida tras guardar: reintentar recupera el mismo recibo y revisión',async()=>{
 const p=await b.createPlan('erection'),h=await b.app(p);
 try{const a=assigned(h.w),r=validDailyRecord(a,1,{omittedDE01:true}),key=scope(h.w);h.hook('spm_save_activity',()=>({data:null,error:{message:'Network disconnected after commit'}}));
  await assert.rejects(h.w.SPM_DAILY_RECORDS.save(a.id,{...r,completedAt:'2026-11-27T12:00:00Z'},key,1),/confirmar el guardado/);const saved=await h.w.SPM_DAILY_RECORDS.save(a.id,{...r,completedAt:'2026-11-27T12:00:03Z'},key,1);assert.equal(saved.recordRevision,1);assert.equal(saved.metadata.ehs,null);assert.equal(saved.metadata.completed,false);assert.equal(saved.metadata.completedAt,'2026-11-27T12:00:00Z');
  const calls=h.requests.filter(x=>x.name==='spm_save_activity');assert.equal(calls[0].request.p_operation_id,calls[1].request.p_operation_id);
  await h.w.SPM_COMPLETE_DAILY_PRACTICE(1,key);assert.equal((await b.state(p)).closures[0].realized_count,0);
 }finally{h.close()}
});
test('respuesta perdida tras cerrar: el reintento avanza exactamente una jornada',async()=>{
 const p=await b.createPlan(),h=await b.app(p);
 try{const key=scope(h.w);h.hook('spm_close_program_day',()=>({data:null,error:{message:'Network disconnected after commit'}}));await assert.rejects(h.w.SPM_COMPLETE_DAILY_PRACTICE(1,key,{confirmVoluntary:true}),/confirmar el guardado/);assert.equal(h.w.SPM_RESOURCE_CONTEXT().day,1);assert.equal((await b.state(p)).plan.current_day,2);
  await h.w.SPM_COMPLETE_DAILY_PRACTICE(1,key,{confirmVoluntary:true});const state=await b.state(p);assert.equal(state.plan.current_day,2);assert.equal(Number(state.plan.revision),1);assert.equal(state.closures.length,1);assert.equal(h.w.SPM_RESOURCE_CONTEXT().day,2);
 }finally{h.close()}
});
test('dos sesiones: la edición desactualizada se rechaza y se recupera antes de guardar de nuevo',async()=>{
 const p=await b.createPlan('erection'),a=await b.app(p),c=await b.app(p);
 try{const item=assigned(a.w),one=validDailyRecord(item,1),two={...one,anxiety:4};await a.w.SPM_DAILY_RECORDS.save(item.id,one,scope(a.w),1);
  await assert.rejects(c.w.SPM_DAILY_RECORDS.save(item.id,two,scope(c.w),1),/otra pestaña/);await c.w.SPM_DAILY_RECORDS.read(scope(c.w),1);const updated=await c.w.SPM_DAILY_RECORDS.save(item.id,two,scope(c.w),1);assert.equal(updated.recordRevision,2);assert.equal(updated.metadata.anxiety,4);
 }finally{a.close();c.close()}
});
test('la respuesta tardía de guardado no cruza cuentas ni restaura datos ajenos',async()=>{
 const p=await b.createPlan('erection'),other=await b.createPlan(),h=await b.app(p);let release,started;const committed=new Promise(r=>started=r);
 try{const item=assigned(h.w),record=validDailyRecord(item,1);h.hook('spm_save_activity',result=>new Promise(resolve=>{release=()=>resolve(result);started()}));const pending=h.w.SPM_DAILY_RECORDS.save(item.id,record,scope(h.w),1);await committed;await h.switchTo(other);release();await assert.rejects(pending,/cuenta o el programa cambió/);assert.equal(h.w.SPM_RESOURCE_CONTEXT().planId,other.plan);assert.equal(h.w.SPM_RESOURCE_CONTEXT().day,1);assert.equal(h.w.document.getElementById('spmRestoreOverlay'),null);assert.deepEqual(plain(h.w.SPM_RESOURCE_CONTEXT().completed),[]);
 }finally{release?.();h.close()}
});
test('salir y entrar en la misma cuenta invalida lecturas anteriores por sesión',async()=>{
 const p=await b.createPlan(),h=await b.app(p);let release,started;const reached=new Promise(r=>started=r);
 try{const key=scope(h.w);h.hook('table:activity_completions',result=>new Promise(resolve=>{release=()=>resolve(result);started()}));const pending=h.w.SPM_DAILY_RECORDS.read(key,1);await reached;await h.switchTo(null);assert.equal(h.w.document.getElementById('profileTitle').textContent,'—');await h.switchTo(p);release();await assert.rejects(pending,/cuenta o el programa cambió/);assert.equal(h.w.SPM_RESOURCE_CONTEXT().day,1);
 }finally{release?.();h.close()}
});
test('registros de Biblioteca persisten separados y nunca cierran el día',async()=>{
 const p=await b.createPlan('desire'),h=await b.app(p);
 try{await h.w.SPM_SAVE_MODULE({day:1,moduleKey:'qa-reading',metadata:{confirmed:true}});assert.equal(h.w.SPM_RESOURCE_CONTEXT().day,1);assert.equal((await b.state(p)).closures.length,0);await assert.rejects(h.w.SPM_COMPLETE_DAILY_PRACTICE(1,scope(h.w)),/falta guardar|registro de la práctica/i);assert.deepEqual(h.errors,[])}finally{h.close()}
});

const coachFields=['sleep','stress','confidence','desire','outcome','sexualActivity','completed','newFlag'];
function fillCoach(w,patch={}){const values={sleep:'0',stress:'na',confidence:'na',desire:'0',outcome:'na',sexualActivity:'0',completed:'0',newFlag:'0',...patch};for(const [id,value]of Object.entries(values))w.document.getElementById(id).value=value;}
async function checkins(p){return b.act(p.user,async()=>(await b.db.query('select * from public.daily_checkins where plan_id=$1',[p.plan])).rows);}

test('Coach exige respuestas explícitas: abrir y guardar vacío no fabrica observaciones',async()=>{
 const p=await b.createPlan(),h=await b.app(p);
 try{for(const id of coachFields)assert.equal(h.w.document.getElementById(id).value,'',id);await h.w.document.getElementById('coachSave').onclick();assert.match(h.w.document.getElementById('status').textContent,/Elige una respuesta/);assert.equal((await checkins(p)).length,0);assert.equal(h.w.SPM_RESOURCE_CONTEXT().day,1);assert.equal((await b.state(p)).closures.length,0);assert.deepEqual(h.errors,[]);}finally{h.close()}
});

test('Coach conserva cero, no evaluable y no realizado sin cerrar la jornada ni promediar null',async()=>{
 const p=await b.createPlan(),h=await b.app(p);
 try{fillCoach(h.w);await h.w.document.getElementById('coachSave').onclick();const rows=await checkins(p);assert.equal(rows.length,1);assert.equal(rows[0].sleep,0);assert.equal(rows[0].desire,0);assert.equal(rows[0].stress,null);assert.equal(rows[0].confidence,null);assert.equal(rows[0].outcome,null);assert.equal(rows[0].practice_completed,false);assert.equal(rows[0].sexual_activity,false);assert.equal(rows[0].decision_code,null);assert.equal(h.w.document.getElementById('stConf').textContent,'—');assert.equal(h.w.document.getElementById('stOutcome').textContent,'—');assert.equal(h.w.document.querySelector('#chart [data-missing]').textContent,'—');assert.equal(h.w.SPM_RESOURCE_CONTEXT().day,1);assert.equal((await b.state(p)).closures.length,0);assert.deepEqual(h.errors,[]);}finally{h.close()}
});

test('Coach con respuesta perdida recupera el mismo UUID y un único registro persistido al reintentar',async()=>{
 const p=await b.createPlan(),h=await b.app(p);
 try{fillCoach(h.w,{confidence:'0',outcome:'0',stress:'0'});h.w.document.getElementById('note').value='Observación sintética';h.hook('table:daily_checkins',()=>({data:null,error:{message:'Network disconnected after commit'}}));await h.w.document.getElementById('coachSave').onclick();assert.match(h.w.document.getElementById('status').textContent,/No pudimos confirmar/);assert.equal(h.w.document.getElementById('note').value,'Observación sintética');assert.equal((await checkins(p)).length,1);await h.w.document.getElementById('coachSave').onclick();assert.match(h.w.document.getElementById('status').textContent,/Registro de hoy guardado/);const calls=h.requests.filter(x=>x.name==='table:daily_checkins'&&x.request.insert);assert.equal(calls.length,2);assert.equal(calls[0].request.insert.id,calls[1].request.insert.id);assert.equal((await checkins(p)).length,1);assert.equal(h.w.document.getElementById('stChecks').textContent,'1');assert.equal(h.w.document.getElementById('stConf').textContent,'0.0');assert.equal(h.w.SPM_RESOURCE_CONTEXT().day,1);assert.deepEqual(h.errors,[]);}finally{h.close()}
});

test('Coach no conserva respuestas ni aplica una confirmación tardía después de cambiar de cuenta',async()=>{
 const p=await b.createPlan(),other=await b.createPlan(),h=await b.app(p);let release,started;const committed=new Promise(r=>started=r);
 try{fillCoach(h.w,{confidence:'4'});h.hook('table:daily_checkins',result=>new Promise(resolve=>{release=()=>resolve(result);started()}));const pending=h.w.document.getElementById('coachSave').onclick();await committed;await h.switchTo(other);for(const id of coachFields)assert.equal(h.w.document.getElementById(id).value,'',id);assert.equal(h.w.document.getElementById('coachSave').disabled,false);release();await pending;assert.equal(h.w.SPM_RESOURCE_CONTEXT().planId,other.plan);assert.equal(h.w.document.getElementById('coachDecision').textContent,'');assert.equal(h.w.document.getElementById('stChecks').textContent,'0');assert.equal((await checkins(other)).length,0);assert.deepEqual(h.errors,[]);}finally{release?.();h.close()}
});

test('reintentar un resumen semanal no duplica el Coach; cada jornada cuenta una vez y null sigue sin puntuación',async()=>{
 const p=await b.createPlan(),h=await b.app(p);
 const review=()=>b.act(p.user,async()=>(await b.db.query('select * from public.weekly_reviews where plan_id=$1',[p.plan])).rows[0]);
 try{h.w.document.getElementById('coachDay').value='7';fillCoach(h.w,{completed:'1',confidence:'0'});h.hook('table:weekly_reviews',()=>({data:null,error:{message:'Network disconnected after weekly commit'}}));await h.w.document.getElementById('coachSave').onclick();assert.match(h.w.document.getElementById('status').textContent,/Registro de hoy guardado.*resumen semanal/);await h.w.document.getElementById('coachSave').onclick();assert.equal((await checkins(p)).length,1);assert.equal((await review()).adherence_pct,14);assert.equal(Number((await review()).confidence_avg),0);assert.equal((await review()).outcome_avg,null);
  h.w.document.getElementById('note').value='Segunda observación explícita del mismo día';await h.w.document.getElementById('coachSave').onclick();assert.equal((await checkins(p)).length,2);assert.equal((await review()).adherence_pct,14);assert.equal((await review()).summary.checkins,1);assert.equal(h.w.SPM_RESOURCE_CONTEXT().day,1);assert.deepEqual(h.errors,[]);
 }finally{h.close()}
});
