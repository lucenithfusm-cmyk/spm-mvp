const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {PGlite}=require(process.env.SPM_PGLITE_PATH||'@electric-sql/pglite');
const {validDailyRecord}=require('./helpers/valid-daily-record.cjs');
const root=path.resolve(__dirname,'..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'spm-pg-'));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'supabase/functions/_shared/question-catalog.json')));
const answers=Object.fromEntries(catalog.map(q=>[q.id,q.type==='boolean'?false:q.type.startsWith('scale5')?3:q.type==='text'?'Dato sintético de QA':(q.options?.find(x=>['none','no','na','unsure'].includes(x.value))||q.options?.[0])?.value]));
answers.pf_awareness='unsure';answers.pf_tension=1;answers.h_followup='none';delete answers.h_medeffect;delete answers.h_mednames;delete answers.h_medchange;
let db;
const uuid=()=>crypto.randomUUID();
async function admin(){await db.exec("reset role; select set_config('request.jwt.claim.sub','',false); select set_config('request.jwt.claim.role','',false);");}
async function asUser(user){await db.exec('reset role;');await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role','authenticated',false)",[user]);await db.exec('set role authenticated;');}
async function plan(route,version='spm-20261127-v1',options={}){await admin();const uid=uuid(),aid=uuid(),mid=uuid(),pid=uuid();await db.query('insert into auth.users values($1)',[uid]);await db.query('insert into public.assessments(id,user_id,motives,answers) values($1,$2,$3,$4)',[aid,uid,options.motives||[route],JSON.stringify({...answers,...options.answers})]);await db.query('insert into public.performance_maps(id,user_id,assessment_id,primary_domain,secondary_domain,safety_level,safety_flags) values($1,$2,$3,$4,$5,$6,$7)',[mid,uid,aid,route,options.secondary||null,options.safety||'none',JSON.stringify(options.flags||[])]);await db.query('insert into public.plans(id,user_id,assessment_id,performance_map_id,route_key,schedule_version) values($1,$2,$3,$4,$5,$6)',[pid,uid,aid,mid,route,version]);await db.query('insert into public.spm_program_access(plan_id,user_id) values($1,$2)',[pid,uid]);return{uid,aid,mid,pid,version,route};}
async function scalar(sql,params=[]){return (await db.query(sql,params)).rows[0].value;}
async function definition(p,day){return scalar('select public.spm_day_definition($1,$2) value',[p.pid,day]);}
async function save(p,day,item,extra={},revision=0,op=uuid()){
 const base=validDailyRecord(item,day,{omittedDE01:extra.activityStatus==='omitted'&&item.kind==='erection'&&Number(item.erectionLesson)===1});
 const metadata={...base,scheduleVersion:p.version,...extra,...(extra.answers?{answers:{...base.answers,...extra.answers}}:{})};
 return scalar('select public.spm_save_activity($1,$2,$3,$4,$5,$6,$7) value',[p.pid,day,item.id,JSON.stringify(metadata),p.version,revision,op]);
}
async function close(p,day,revision=day-1,op=uuid(),confirm=true){return scalar('select public.spm_close_program_day($1,$2,$3,$4,$5,$6) value',[p.pid,day,p.version,revision,op,confirm]);}
async function fill(p,day){const d=await definition(p,day);for(const a of d.items.filter(x=>!x.optional))await save(p,day,a);return d;}
async function advance(p,to){for(let day=1;day<to;day++){await fill(p,day);await close(p,day);}}
test.before(async()=>{db=new PGlite(dir);await db.exec(fs.readFileSync(path.join(__dirname,'support/progress-schema.sql'),'utf8'));
 const original=fs.readFileSync(path.join(root,'supabase/migrations/202611050001_wompi_orders.sql'),'utf8');await db.exec(original.slice(original.indexOf('create or replace function public.spm_complete_missing_answers')));
 const identity=fs.readFileSync(path.join(root,'supabase/migrations/202611050002_paid_access_release_gate.sql'),'utf8');await db.exec(identity.slice(identity.indexOf('create or replace function public.spm_protect_plan_identity')));
 await db.exec(fs.readFileSync(path.join(root,'supabase/migrations/20261109222705_safety_answer_correction.sql'),'utf8'));
 const migration=fs.readdirSync(path.join(root,'supabase/migrations')).find(f=>f.endsWith('_spm_versioned_agenda_atomic_progress.sql'));await db.exec(fs.readFileSync(path.join(root,'supabase/migrations',migration),'utf8'));});
test.after(async()=>{await db.close();fs.rmSync(dir,{recursive:true,force:true});});

test('las seis rutas completan 28 jornadas con el SQL real, sin día 29',async()=>{
 for(const route of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
  const p=await plan(route);await asUser(p.uid);
  for(let day=1;day<=28;day++){await fill(p,day);const r=await close(p,day);assert.equal(r.plan.current_day,Math.min(day+1,28));assert.equal(Number(r.plan.revision),day);assert.equal(r.plan.cycle_status,day===28?'completed':'open');}
  const state=await scalar('select public.spm_get_program_progress($1) value',[p.pid]);assert.equal(state.closures.length,28);assert.equal(state.plan.cycle_status,'completed');assert.equal(state.plan.status,'completed');
 }
});
test('regresiones legacy: los siete días sin requisitos cierran sin inventar realizaciones',async()=>{
 for(const [route,days] of [['erection',[16,19]],['ejaculation',[16]],['confidence',[16,19]],['lifestyle',[16,19]]]){
  const p=await plan(route,'legacy');await asUser(p.uid);await advance(p,Math.max(...days)+1);
  for(const day of days){const state=await scalar('select to_jsonb(d) value from public.spm_day_closures d where plan_id=$1 and day_number=$2',[p.pid,day]);assert.equal(state.reason,'voluntary',route+day);assert.equal(state.realized_count,0);}
 }
});
test('jornada voluntaria exige confirmación, conserva omisión y permite cero, algunas o todas las opcionales',async()=>{
 for(const count of [0,1,100]){const p=await plan('wellbeing');await asUser(p.uid);const d=await definition(p,1);assert.ok(d.items.every(x=>x.optional));await assert.rejects(close(p,1,0,uuid(),false),/SPM_VOLUNTARY_CONFIRMATION_REQUIRED/);let n=0;for(const a of d.items.slice(0,count)){await save(p,1,a);n++;}const r=await close(p,1);assert.equal(r.closure.realized_count,n);}
 const p=await plan('wellbeing');await asUser(p.uid);const a=(await definition(p,1)).items[0];await save(p,1,a,{completed:false,activityStatus:'omitted'});const r=await close(p,1);assert.equal(r.closure.realized_count,0);const saved=await scalar("select metadata value from public.activity_completions where plan_id=$1 and module_key like 'resource:daily_activity:%'",[p.pid]);assert.equal(saved.completed,false);assert.equal(saved.activityStatus,'omitted');
});
test('catálogo ausente, requisito pendiente, versión incorrecta y pausa urgente no producen cierre',async()=>{
 const p=await plan('erection');await asUser(p.uid);await assert.rejects(close(p,1),/SPM_REQUIRED_ACTIVITY_PENDING/);const a=(await definition(p,1)).items[0];await assert.rejects(save(p,1,a,{assignmentId:'otra-actividad'}),/SPM_ACTIVITY_VERSION_CONFLICT/);await assert.rejects(close(p,0),/SPM_PLAN_REVISION_CONFLICT|check constraint|SPM_INVALID_DAY/);
 const urgent=await plan('wellbeing','spm-20261127-v1',{safety:'urgent',flags:['s_cardiac']});await asUser(urgent.uid);await assert.rejects(close(urgent,1),/SPM_SAFETY_PAUSE/);
 const missing=await plan('wellbeing','spm-20261127-v1',{answers:{s_cardiac:null}});await asUser(missing.uid);await assert.rejects(close(missing,1),/SPM_ASSESSMENT_PENDING/);
 const unknown=await plan('erection','spm-20261127-v1',{safety:'unknown'});await asUser(unknown.uid);const restricted=(await definition(unknown,1));assert.equal(restricted.safety,'review');await assert.rejects(save(unknown,1,restricted.items[0]),/SPM_ACTIVITY_UNAVAILABLE/);await assert.rejects(close(unknown,1),/SPM_SAFETY_PAUSE/);
 await admin();await db.query("update public.plans set schedule_version='unknown' where id=$1",[p.pid]);await asUser(p.uid);await assert.rejects(close(p,1),/SPM_PLAN_REVISION_CONFLICT|SPM_AGENDA_UNAVAILABLE/);
});
test('DE01 permite EHS omitido y decisión de no practicar sin sumarla como realizada',async()=>{
 const p=await plan('erection');await asUser(p.uid);const a=(await definition(p,1)).items[0];await save(p,1,a,{completed:false,activityStatus:'omitted',completionAccepted:true,attentionPracticeCompleted:false,ehs:null,ehsStatus:'omitted',ehsEvaluable:null,ehsOmitted:true});const r=await close(p,1);assert.equal(r.closure.realized_count,0);assert.equal(r.plan.current_day,2);
});
test('reintento y dos solicitudes de cierre tienen un solo efecto; reuse distinto de operación se rechaza',async()=>{
 const p=await plan('wellbeing');await asUser(p.uid);const op=uuid(),first=await close(p,1,0,op),again=await close(p,1,0,op);assert.deepEqual(again.closure,first.closure);assert.equal(again.plan.current_day,2);
 const pair=await Promise.all([close(p,1,0,uuid()),close(p,1,0,uuid())]);for(const r of pair)assert.equal(r.plan.current_day,2);
 await assert.rejects(close(p,2,1,op),/SPM_OPERATION_CONFLICT/);
 assert.equal(await scalar('select count(*)::int value from public.spm_day_closures where plan_id=$1',[p.pid]),1);
});
test('guardado idempotente, conflicto entre ediciones y null/0 permanecen distintos',async()=>{
 const p=await plan('wellbeing');await asUser(p.uid);const a=(await definition(p,1)).items[0],op=uuid(),extra={answers:{pleasure:0,intimacy:null}};
 const first=await save(p,1,a,extra,0,op),again=await save(p,1,a,extra,0,op);assert.deepEqual(first,again);assert.equal(first.metadata.answers.pleasure,0);assert.equal(first.metadata.answers.intimacy,null);
 await assert.rejects(save(p,1,a,{answers:{pleasure:5}},0,uuid()),/SPM_RECORD_REVISION_CONFLICT/);await assert.rejects(save(p,1,a,{answers:{pleasure:5}},0,op),/SPM_OPERATION_CONFLICT/);
 await save(p,1,a,{answers:{pleasure:3}},1);const oldReplay=await save(p,1,a,extra,0,op);assert.deepEqual(oldReplay,first);
});
test('fallo de actualización revierte cierre y avance en la misma transacción',async()=>{
 const p=await plan('wellbeing');await admin();await db.exec("create function public.qa_fail_update() returns trigger language plpgsql as $$ begin raise exception 'QA_INJECTED_FAILURE'; end $$; create trigger qa_fail_update before update on public.plans for each row execute function public.qa_fail_update();");await asUser(p.uid);await assert.rejects(close(p,1),/QA_INJECTED_FAILURE/);assert.equal(await scalar('select count(*)::int value from public.spm_day_closures where plan_id=$1',[p.pid]),0);assert.equal(await scalar('select current_day value from public.plans where id=$1',[p.pid]),1);await admin();await db.exec('drop trigger qa_fail_update on public.plans; drop function public.qa_fail_update();');
});
test('RLS y disparadores rechazan cuenta ajena, anónimo y escrituras que saltan el cierre',async()=>{
 const a=await plan('wellbeing'),b=await plan('desire');await asUser(a.uid);assert.equal((await db.query('select id from public.plans where id=$1',[b.pid])).rows.length,0);await assert.rejects(scalar('select public.spm_get_program_progress($1) value',[b.pid]),/SPM_PLAN_ACCESS_DENIED/);
 await assert.rejects(db.query('update public.plans set current_day=9 where id=$1',[a.pid]),/SPM_USE_ATOMIC_DAY_CLOSE/);
 await assert.rejects(db.query("insert into public.activity_completions(user_id,plan_id,day_number,module_key,metadata) values($1,$2,1,'daily_practice','{}')",[a.uid,a.pid]),/SPM_USE_ATOMIC_DAY_CLOSE/);
 await assert.rejects(db.query("update public.performance_maps set safety_level='none' where id=$1",[a.mid]),/SPM_ASSIGNED_INPUTS_SERVER_MANAGED/);
 await admin();await db.exec('set role anon;');await assert.rejects(scalar('select public.spm_get_program_progress($1) value',[a.pid]),/permission denied/);await admin();
});
test('la persistencia sobre disco sobrevive cerrar y reabrir PostgreSQL, con ciclo final recuperable',async()=>{
 const p=await plan('wellbeing');await asUser(p.uid);await close(p,1);await db.close();db=new PGlite(dir);await asUser(p.uid);const state=await scalar('select public.spm_get_program_progress($1) value',[p.pid]);assert.equal(state.plan.current_day,2);assert.equal(state.closures.length,1);
});

test('registros inválidos no se convierten en realizados; EHS, Conexión y checkpoint conservan sus escalas',async()=>{
 const p=await plan('erection');await asUser(p.uid);const a=(await definition(p,1)).items[0];
 await assert.rejects(save(p,1,a,{ehs:5,ehsEvaluable:true,ehsStatus:'recorded'}),/SPM_INVALID_ACTIVITY_RECORD/);
 await assert.rejects(save(p,1,a,{activityStatus:null}),/SPM_INVALID_ACTIVITY_RECORD/);
 await assert.rejects(save(p,1,a,{scheduledDay:2}),/SPM_INVALID_ACTIVITY_RECORD/);
 await assert.rejects(save(p,1,a,{attentionPracticeOutcome:'omitted',completed:true}),/SPM_INVALID_ACTIVITY_RECORD/);
 const q=await plan('wellbeing');await asUser(q.uid);const items=(await definition(q,1)).items,cn=items.find(x=>x.kind==='connection'),checkpoint=items.find(x=>x.kind==='program-checkpoint');
 await assert.rejects(save(q,1,cn,{answers:{score0:11}}),/SPM_INVALID_ACTIVITY_RECORD/);
 const valid=await save(q,1,cn,{answers:{score0:0,score1:null}});assert.equal(valid.metadata.answers.score0,0);assert.equal(valid.metadata.answers.score1,null);
 const scores={firmness:0,control:null,desire:4,confidence:3,comfort:2,sleep:1,skill:null};await save(q,1,checkpoint,{metrics:scores});
 await assert.rejects(save(q,1,checkpoint,{metrics:{...scores,desire:5}},1),/SPM_INVALID_ACTIVITY_RECORD/);
 assert.equal((await close(q,1)).closure.realized_count,2);
});
test('el catálogo de evaluación vacío o malformado bloquea el cierre sin fingir carga completa',async()=>{
 const p=await plan('wellbeing');await admin();const original=await scalar("select manifest value from public.spm_agenda_versions where version='assessment-20261127'");
 try{for(const bad of [{questions:[]},{questions:null},{}]){await admin();await db.query("update public.spm_agenda_versions set manifest=$1 where version='assessment-20261127'",[JSON.stringify(bad)]);await asUser(p.uid);await assert.rejects(close(p,1),/SPM_CATALOG_UNAVAILABLE/);}}
 finally{await admin();await db.query("update public.spm_agenda_versions set manifest=$1 where version='assessment-20261127'",[JSON.stringify(original)]);}
});
test('la recuperación y corrección de seguridad existentes siguen funcionando por su RPC de servidor',async()=>{
 const p=await plan('wellbeing','spm-20261127-v1',{answers:{h_has_condition:null}});await asUser(p.uid);
 const before=await scalar('select answers value from public.assessments where id=$1',[p.aid]);
 const params=[p.uid,p.pid,JSON.stringify(before),JSON.stringify({...before,h_has_condition:false}),JSON.stringify({total:50,scores:{wellbeing:50},safety_level:'none',safety_flags:[]})];
 await assert.rejects(db.query('select public.spm_complete_missing_answers($1,$2,$3,$4,$5)',params),/permission denied/);
 await db.exec('reset role; set role service_role;');await db.query('select public.spm_complete_missing_answers($1,$2,$3,$4,$5)',params);await asUser(p.uid);assert.deepEqual((await definition(p,1)).missing,[]);
 const q=await plan('erection','spm-20261127-v1',{answers:{s_cardiac:true,s_penile:true},safety:'urgent',flags:['s_cardiac','s_penile']});await asUser(q.uid);const prior=await scalar('select answers value from public.assessments where id=$1',[q.aid]);
 await assert.rejects(db.query('select public.spm_correct_safety_mistake($1,$2,$3,$4)',[q.uid,q.pid,'s_cardiac',JSON.stringify(prior)]),/permission denied/);
 await db.exec('reset role; set role service_role;');await db.query('select public.spm_correct_safety_mistake($1,$2,$3,$4)',[q.uid,q.pid,'s_cardiac',JSON.stringify(prior)]);await asUser(q.uid);
 const after=await scalar('select public.spm_get_program_progress($1) value',[q.pid]);assert.equal(after.plan.current_day,1);assert.equal(Number(after.plan.revision),0);assert.equal(after.context.safety,'review');assert.equal(after.closures.length,0);
 await assert.rejects(db.query("update public.performance_maps set safety_level='none' where id=$1",[q.mid]),/SPM_ASSIGNED_INPUTS_SERVER_MANAGED/);
});

test('el resumen daily_practice de un cierre es inmutable, incluso ante UPDATE idéntico y operación válida',async()=>{
 const p=await plan('wellbeing');await asUser(p.uid);const op=uuid(),closed=await close(p,1,0,op);
 const before=await scalar("select to_jsonb(a) value from public.activity_completions a where plan_id=$1 and module_key='daily_practice'",[p.pid]);
 for(const statement of [
  'metadata=metadata',
  `metadata=jsonb_set(metadata,'{dayStatus}','"open"')`,
  `metadata=jsonb_set(metadata,'{realizedCount}','999')`,
  `metadata=jsonb_set(metadata,'{scheduleVersion}','"other"')`,
  'record_revision=900',
  'metric_value=900',
  "completed_at='2000-01-01T00:00:00Z'"
 ])await assert.rejects(db.query("update public.activity_completions set "+statement+" where plan_id=$1 and module_key='daily_practice'",[p.pid]),/SPM_DAY_CLOSURE_HISTORY_PROTECTED/);
 await assert.rejects(db.query("insert into public.activity_completions(user_id,plan_id,day_number,module_key,metadata) values($1,$2,1,'daily_practice',$3)",[p.uid,p.pid,JSON.stringify({...before.metadata,dayStatus:'open',realizedCount:999})]),/SPM_INVALID_DAY_CLOSURE_SUMMARY/);
 const after=await scalar("select to_jsonb(a) value from public.activity_completions a where plan_id=$1 and module_key='daily_practice'",[p.pid]);assert.deepEqual(after,before);
 const replay=await close(p,1,0,op);assert.deepEqual(replay.closure,closed.closure);assert.equal(replay.plan.current_day,2);assert.equal(Number(replay.plan.revision),1);
});

test('recibos directos exigen resultado y petición canónicos y no canjean la operación de otra actividad',async()=>{
 const p=await plan('wellbeing');await asUser(p.uid);const items=(await definition(p,1)).items,a=items.find(x=>x.kind==='connection'),other=items.find(x=>x.id!==a.id),op=uuid();
 const metadata={...validDailyRecord(a,1),scheduleVersion:p.version};
 const row=(await db.query('insert into public.activity_completions(user_id,plan_id,day_number,module_key,metadata,record_revision) values($1,$2,1,$3,$4,1) returning metadata,record_revision',[p.uid,p.pid,'resource:daily_activity:'+a.id,JSON.stringify({...metadata,operationId:op})])).rows[0];
 const request={plan:p.pid,day:1,activity:a.id,metadata,version:p.version,revision:0},result={ok:true,metadata:row.metadata,recordRevision:1};
 const receipt=(req=request,res=result,id=a.id,operation=op)=>db.query('insert into public.spm_activity_receipts(user_id,plan_id,operation_id,day_number,activity_id,request,result) values($1,$2,$3,1,$4,$5,$6)',[p.uid,p.pid,operation,id,JSON.stringify(req),JSON.stringify(res)]);
 for(const bad of [{...result,recordRevision:900},{...result,ok:false},{...result,metadata:{...row.metadata,completed:false}},{...result,metadata:{...row.metadata,operationId:uuid()}}])await assert.rejects(receipt(request,bad),/SPM_INVALID_RECEIPT/);
 for(const bad of [{...request,plan:uuid()},{...request,day:2},{...request,activity:other.id},{...request,version:'legacy'},{...request,revision:900},{...request,metadata:{...metadata,confirmed:false}},{...request,metadata:{...metadata,_recordRevision:900}}])await assert.rejects(receipt(bad),/SPM_INVALID_RECEIPT/);
 await assert.rejects(receipt(request,result,other.id),/SPM_INVALID_RECEIPT/);
 await assert.rejects(receipt(request,result,a.id,uuid()),/SPM_INVALID_RECEIPT/);
 assert.equal(await scalar('select count(*)::int value from public.spm_activity_receipts where plan_id=$1',[p.pid]),0);
 await receipt();const replay=await scalar('select public.spm_save_activity($1,1,$2,$3,$4,0,$5) value',[p.pid,a.id,JSON.stringify(metadata),p.version,op]);assert.deepEqual(replay,result);assert.equal(Number(row.record_revision),1);
 const otherMetadata={...validDailyRecord(other,1),scheduleVersion:p.version,operationId:op};
 await assert.rejects(db.query('insert into public.activity_completions(user_id,plan_id,day_number,module_key,metadata,record_revision) values($1,$2,1,$3,$4,1)',[p.uid,p.pid,'resource:daily_activity:'+other.id,JSON.stringify(otherMetadata)]),/SPM_OPERATION_ALREADY_USED/);
 await assert.rejects(db.query("update public.spm_activity_receipts set result=jsonb_set(result,'{recordRevision}','900') where operation_id=$1",[op]),/permission denied/);
 await assert.rejects(db.query('delete from public.spm_activity_receipts where operation_id=$1',[op]),/permission denied/);
});

test('la RPC normaliza solo campos de servidor antes de crear y repetir un recibo verificable',async()=>{
 const p=await plan('wellbeing');await asUser(p.uid);const a=(await definition(p,1)).items.find(x=>x.kind==='connection'),op=uuid();
 const input={...validDailyRecord(a,1),scheduleVersion:'client-value',operationId:uuid(),_recordRevision:900,completed:false};
 const call=()=>scalar('select public.spm_save_activity($1,1,$2,$3,$4,0,$5) value',[p.pid,a.id,JSON.stringify(input),p.version,op]);
 const first=await call(),again=await call();assert.deepEqual(again,first);assert.equal(first.recordRevision,1);assert.equal(first.metadata.operationId,op);assert.equal(first.metadata.scheduleVersion,p.version);assert.equal(first.metadata._recordRevision,1);assert.equal(first.metadata.completed,true);
 assert.deepEqual(first.metadata.answers,input.answers);
 const receipt=await scalar('select to_jsonb(r) value from public.spm_activity_receipts r where operation_id=$1',[op]);
 assert.equal(receipt.request.metadata.operationId,undefined);assert.equal(receipt.request.metadata._recordRevision,undefined);assert.equal(receipt.request.metadata.scheduleVersion,p.version);assert.equal(receipt.request.revision,0);assert.deepEqual(receipt.result,first);
});
