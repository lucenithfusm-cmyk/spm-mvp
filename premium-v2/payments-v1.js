(()=>{
'use strict';
const BASE='https://jogirmziqjlsttbbarcx.supabase.co/functions/v1';
async function request(path,db,body){
 const headers={'Content-Type':'application/json'};
 if(db){const {data}=await db.auth.getSession();if(!data?.session?.access_token)throw Error('sign_in_required');headers.Authorization='Bearer '+data.session.access_token;}
 const response=await fetch(BASE+'/'+path,{method:body?'POST':'GET',headers,...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
 let result;try{result=await response.json()}catch{throw Error('temporarily_unavailable')}
 if(!response.ok)throw Error(result.error||'temporarily_unavailable');return result;
}
window.SPM_PAYMENTS={
 configuration:()=>request('spm-payments/config'),
 async checkout(db,receipt){
  const result=await request('spm-payments/checkout',db,{assessmentId:receipt.assessmentId,mapId:receipt.mapId});
  if(result.alreadyActive){location.assign('live.html?welcome=1');return;}
  if(result.pendingOrder){location.assign('payment-return.html?order='+encodeURIComponent(result.orderId));return;}
  const url=new URL(result.checkoutUrl);
  if(url.origin!=='https://checkout.wompi.co'||!['test','prod'].includes(result.environment))throw Error('invalid_checkout');
  location.assign(url.toString());
 },
 status:(db,orderId,transactionId)=>request('spm-payments/status',db,{orderId,transactionId}),
 latest:db=>request('spm-payments/latest',db,{}),
 completeMissing:(db,planId,answers)=>request('spm-program-recovery',db,{planId,answers})
};
})();
