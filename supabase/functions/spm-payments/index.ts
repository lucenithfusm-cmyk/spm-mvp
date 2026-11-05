import {admin,env,cors,json,userFor,bodyFor,uuid} from '../_shared/runtime.ts';
import {AMOUNT,CURRENCY,verifyEvent,validTransaction,checkoutURL} from '../_shared/wompi-policy.mjs';
import '../_shared/assessment-policy.js';
import questions from '../_shared/question-catalog.json' with {type:'json'};
const policy=(globalThis as any).SPM_ASSESSMENT_POLICY;
function config(environment:string){
 if(!['test','prod'].includes(environment))return null;
 const prefix='WOMPI_'+environment.toUpperCase()+'_';
 const value={environment,publicKey:env(prefix+'PUBLIC_KEY'),privateKey:env(prefix+'PRIVATE_KEY'),integrity:env(prefix+'INTEGRITY_SECRET'),events:env(prefix+'EVENTS_SECRET')};
 return value.publicKey.startsWith('pub_'+environment+'_')&&value.privateKey.startsWith('prv_'+environment+'_')&&value.integrity&&value.events?value:null;
}
async function transaction(id:string,c:NonNullable<ReturnType<typeof config>>){
 if(!/^[a-zA-Z0-9-]{5,100}$/.test(id))throw Error('Invalid transaction');
 const base=c.environment==='prod'?'https://production.wompi.co/v1':'https://sandbox.wompi.co/v1';
 const response=await fetch(base+'/transactions/'+encodeURIComponent(id),{headers:{Authorization:'Bearer '+c.privateKey},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('Could not verify transaction');
 return (await response.json()).data;
}
async function confirm(db:ReturnType<typeof admin>,order:any,tx:any,environment:string){
 if(!validTransaction(order,tx,environment))throw Error('Transaction mismatch');
 const {error}=await db.rpc('spm_confirm_wompi_transaction',{p_order_id:order.id,p_environment:environment,p_transaction:{id:tx.id,reference:tx.reference,amount_in_cents:tx.amount_in_cents,currency:tx.currency,status:tx.status}});
 if(error)throw Error('Could not record transaction');
}
async function webhook(req:Request,environment:string){
 if(req.method!=='POST')return json({error:'method_not_allowed'},405);
 const c=config(environment);if(!c)return json({error:'not_configured'},503);
 const event=await bodyFor(req);
 if(!await verifyEvent(event,environment,c.events))return json({error:'invalid_signature'},401);
 // Verify with Wompi too: reference/currency are not guaranteed to be signed properties.
 const tx=await transaction(event.data.transaction.id,c),db=admin();
 const {data:order,error}=await db.from('spm_payment_orders').select('*').eq('reference',tx.reference).eq('environment',environment).maybeSingle();
 if(error)throw Error('Order lookup failed');
 if(!order)return json({received:true,ignored:true}); // Other merchant products / pre-existing links.
 await confirm(db,order,tx,environment);return json({received:true});
}
Deno.serve(async(req:Request)=>{
 const path=new URL(req.url).pathname;
 try{
  const hook=path.match(/\/webhook\/(test|prod)$/);if(hook)return await webhook(req,hook[1]);
  const headers=cors(req);if(!headers)return json({error:'origin_not_allowed'},403);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  const mode=env('WOMPI_MODE'),c=config(mode);
  if(path.endsWith('/config')&&req.method==='GET')return json({ready:!!c,environment:c?mode:'off',amountInCents:AMOUNT,currency:CURRENCY},200,headers);
  if(req.method!=='POST')return json({error:'method_not_allowed'},405,headers);
  const db=admin(),user=await userFor(req,db);if(!user)return json({error:'sign_in_required'},401,headers);
  const body=await bodyFor(req);
  if(path.endsWith('/latest')){
   const {data,error}=await db.from('spm_payment_orders').select('id').eq('user_id',user.id).eq('environment','prod').order('created_at',{ascending:false}).limit(1);
   if(error)throw Error('Order lookup failed');return json({orderId:data?.[0]?.id||null},200,headers);
  }
  if(path.endsWith('/status')){
   if(!uuid(body.orderId))return json({error:'invalid_order'},400,headers);
   const {data:order,error}=await db.from('spm_payment_orders').select('*').eq('id',body.orderId).eq('user_id',user.id).maybeSingle();
   if(error)throw Error('Order lookup failed');if(!order)return json({error:'order_not_found'},404,headers);
   const orderConfig=config(order.environment);
   // A redirect ID is only a hint; it cannot activate access by itself.
   if(orderConfig&&(body.transactionId||order.transaction_id)){
    const id=body.transactionId||order.transaction_id;
    try{await confirm(db,order,await transaction(id,orderConfig),order.environment);}catch{return json({error:'verification_pending',retryable:true},503,headers);}
   }
   const {data:fresh,error:readError}=await db.from('spm_payment_orders').select('id,status,environment,plan_id,reference').eq('id',order.id).single();
   if(readError)throw Error('Status lookup failed');return json({orderId:fresh.id,status:fresh.status,environment:fresh.environment,planId:fresh.environment==='prod'?fresh.plan_id:null,reference:fresh.reference},200,headers);
  }
  if(!path.endsWith('/checkout'))return json({error:'not_found'},404,headers);
  if(!c)return json({error:'payments_unavailable'},503,headers);
  if(mode==='test'&&!env('SPM_PAYMENT_TESTER_IDS').split(',').map(x=>x.trim()).includes(user.id))return json({error:'test_access_required'},403,headers);
  if(!uuid(body.assessmentId)||!uuid(body.mapId))return json({error:'assessment_required'},400,headers);
  if(mode==='prod'){
   const {data:active,error}=await db.from('spm_program_access').select('plan_id').eq('user_id',user.id).eq('status','active').limit(1);
   if(error)throw Error('Access lookup failed');if(active?.length)return json({alreadyActive:true,planId:active[0].plan_id},200,headers);
  }
  const [a,m]=await Promise.all([
   db.from('assessments').select('*').eq('id',body.assessmentId).eq('user_id',user.id).single(),
   db.from('performance_maps').select('*').eq('id',body.mapId).eq('assessment_id',body.assessmentId).eq('user_id',user.id).single()
  ]);
  if(a.error||m.error||!a.data||!m.data)return json({error:'assessment_not_found'},404,headers);
  if(!a.data.motives?.length||a.data.motives.some((k:string)=>!policy.motives.includes(k))||policy.missing(questions,a.data.motives,a.data.answers).length)return json({error:'assessment_incomplete'},409,headers);
  const profile=policy.score(questions,a.data.motives,a.data.answers),safety=policy.preserveSafety(profile,m.data);
  if(safety.safety_level==='urgent')return json({error:'review_safety_first'},409,headers);
  const origin=req.headers.get('origin')!;
  const expired=await db.from('spm_payment_orders').update({status:'EXPIRED'}).eq('user_id',user.id).eq('environment',mode).eq('status','PENDING').lt('expires_at',new Date().toISOString());
  if(expired.error)throw Error('Order expiry failed');
  let {data:order,error:pendingError}=await db.from('spm_payment_orders').select('*').eq('user_id',user.id).eq('environment',mode).eq('status','PENDING').maybeSingle();
  if(pendingError)throw Error('Order lookup failed');
  if(order&&(order.assessment_id!==a.data.id||order.performance_map_id!==m.data.id))return json({pendingOrder:true,orderId:order.id},200,headers);
  if(!order){
   const {count,error}=await db.from('spm_payment_orders').select('id',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',new Date(Date.now()-86400000).toISOString());
   if(error)throw Error('Order count failed');if((count||0)>=10)return json({error:'too_many_attempts'},429,headers);
   const id=crypto.randomUUID(),expires=new Date(Date.now()+3600000).toISOString();
   const created=await db.from('spm_payment_orders').insert({id,user_id:user.id,assessment_id:a.data.id,performance_map_id:m.data.id,environment:mode,reference:'SPM28-'+id,amount_in_cents:AMOUNT,currency:CURRENCY,expires_at:expires,profile_snapshot:{...profile,...safety}}).select().single();
   if(created.error?.code==='23505'){
    const concurrent=await db.from('spm_payment_orders').select('*').eq('user_id',user.id).eq('environment',mode).eq('status','PENDING').single();if(concurrent.error)throw Error('Order conflict');order=concurrent.data;
   }else if(created.error)throw Error('Order creation failed');else order=created.data;
  }
  // Reuse an in-flight order, avoiding a second charge from double clicks or another tab.
  const redirect=new URL('/premium-v2/payment-return.html',origin);redirect.searchParams.set('order',order.id);
  return json({orderId:order.id,environment:mode,checkoutUrl:await checkoutURL(order,c.publicKey,c.integrity,redirect.toString())},200,headers);
 }catch{return json({error:'temporarily_unavailable',retryable:true},503,cors(req)||{});}
});
