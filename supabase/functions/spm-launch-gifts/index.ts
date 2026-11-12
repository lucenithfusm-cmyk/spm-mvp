// Prepared integration: disabled until a verified sender and delivery service are supplied.
import {admin,env,json} from '../_shared/runtime.ts';
import {RECIPE_SHA256,sendGift} from '../_shared/recipe-gift.mjs';
async function authorized(req:Request,secret:string){
 if(secret.length<32)return false;
 const digest=async(s:string)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
 const [a,b]=await Promise.all([digest(req.headers.get('authorization')||''),digest('Bearer '+secret)]);
 return a.reduce((v,x,i)=>v|(x^b[i]),0)===0;
}
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return json({error:'method_not_allowed'},405);
 if(!await authorized(req,env('SPM_GIFT_WORKER_SECRET')))return json({error:'unauthorized'},401);
 const key=env('RESEND_API_KEY'),sender=env('SPM_GIFT_FROM');
 if(env('SPM_RECIPE_GIFT_ENABLED')!=='true'||!key||!sender)return json({error:'delivery_not_configured'},503);
 try{
  const db=admin();
  const {data:pdf,error}=await db.storage.from('spm-private-gifts').download('launch-v1/Recetario_SPM.pdf');
  if(error||!pdf)throw Error('asset_unavailable');
  const bytes=new Uint8Array(await pdf.arrayBuffer());
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
  if(digest!==RECIPE_SHA256)throw Error('asset_changed');
  let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));
  const content=btoa(binary);
  const claim=await db.rpc('spm_claim_recipe_gift',{p_sender:sender});
  if(claim.error)throw Error('claim_failed');
  const gift=claim.data?.[0];if(!gift)return json({processed:0});
  const [order,access]=await Promise.all([
   db.from('spm_payment_orders').select('status,environment').eq('id',gift.order_id).eq('user_id',gift.user_id).single(),
   db.from('spm_program_access').select('status').eq('plan_id',gift.plan_id).eq('user_id',gift.user_id).single()
  ]);
  if(order.error||access.error)throw Error('eligibility_unavailable');
  const eligible=order.data.status==='APPROVED'&&order.data.environment==='prod'&&access.data.status==='active';
  const result=eligible?await sendGift(gift,content,key):{state:'cancelled',reason:'access_not_active'};
  const update=await db.from('spm_recipe_deliveries').update({state:result.state,provider_id:result.providerId||null,last_error:result.reason||null,accepted_at:result.state==='accepted'?new Date().toISOString():null,lease_until:null})
   .eq('id',gift.id).eq('lease_token',gift.lease_token);
  if(update.error)throw Error('receipt_not_saved');
  // Provider acceptance is not a promise that the mailbox delivered it.
  return json({processed:1,state:result.state});
 }catch{return json({error:'delivery_pending',retryable:true},503);}
});
