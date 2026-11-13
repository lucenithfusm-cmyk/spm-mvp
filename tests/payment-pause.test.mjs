import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
import * as wompi from '../supabase/functions/_shared/wompi-policy.mjs';

const ORIGIN='https://spm-premium-staging.vercel.app';
const BASE='https://jogirmziqjlsttbbarcx.supabase.co/functions/v1/spm-payments';
const runtime=readFileSync(new URL('../supabase/functions/_shared/runtime.ts',import.meta.url),'utf8');
const entry=readFileSync(new URL('../supabase/functions/spm-payments/index.ts',import.meta.url),'utf8');
const stripImports=source=>source.replace(/^import .*;\n/gm,'').replace(/^export /gm,'');
const ORDER='12345678-1234-4234-8234-123456789abc';
function harness({signedIn=true,paused=true}={}){
 const calls={admin:0,auth:0,reads:[],writes:[],outbound:[]};
 const order={id:ORDER,user_id:'fixture-user',reference:'SPM28-fixture',environment:'prod',status:'PENDING',transaction_id:'fixture-transaction-123',amount_in_cents:wompi.AMOUNT,currency:'COP',plan_id:null};
 const tx={id:order.transaction_id,reference:order.reference,status:'APPROVED',amount_in_cents:wompi.AMOUNT,currency:'COP'};
 const db={
  auth:{getUser:async()=>{calls.auth++;return {data:{user:signedIn?{id:'fixture-user'}:null},error:null};}},
  from(table){
   const read={table,filters:[]};calls.reads.push(read);
   const q={select(fields){read.fields=fields;return q;},eq(k,v){read.filters.push([k,v]);return q;},order(){return q;},limit:async()=>({data:[{id:order.id}],error:null}),maybeSingle:async()=>({data:{...order},error:null}),single:async()=>({data:{...order},error:null})};
   return q;
  },
  async rpc(name,args){calls.writes.push({name,args});order.status=args.p_transaction.status;order.plan_id='existing-approved-plan';return {error:null};}
 };
 const values={WOMPI_MODE:'prod',WOMPI_PROD_PUBLIC_KEY:'pub_prod_test_fixture',WOMPI_PROD_PRIVATE_KEY:'prv_prod_test_fixture',WOMPI_PROD_INTEGRITY_SECRET:'unit-test-integrity',WOMPI_PROD_EVENTS_SECRET:'unit-test-event',SUPABASE_URL:'https://fixture.invalid',SUPABASE_SERVICE_ROLE_KEY:'unit-test-service-role'};
 let handler;
 const source=entry.replace('const PURCHASES_PAUSED=true;','const PURCHASES_PAUSED='+paused+';');
 const code=stripTypeScriptTypes(stripImports(runtime)+'\n'+stripImports(source));
 vm.runInNewContext(code,{Request,Response,URL,AbortSignal,TextEncoder,crypto,questions:[],SPM_ASSESSMENT_POLICY:{},...wompi,
  Deno:{env:{get:name=>values[name]},serve:fn=>{handler=fn;}},
  createClient:()=>{calls.admin++;return db;},
  fetch:async(url)=>{calls.outbound.push(String(url));return new Response(JSON.stringify({data:tx}),{headers:{'Content-Type':'application/json'}});}
 });
 const request=(path,{method='POST',body={},origin=ORIGIN,token=true}={})=>{
  const headers={'Content-Type':'application/json'};if(origin)headers.Origin=origin;if(token)headers.Authorization='Bearer unit-test-user-token';
  return handler(new Request(BASE+path,{method,headers,...(!['GET','HEAD','OPTIONS'].includes(method)?{body:typeof body==='string'?body:JSON.stringify(body)}:{})}));
 };
 return {calls,order,tx,request};
}
test('paused public config is explicit, uncached and never reveals credentials',async()=>{
 const h=harness(),r=await h.request('/config',{method:'GET',token:false});
 assert.equal(r.status,200);assert.equal(r.headers.get('Cache-Control'),'no-store');
 const body=await r.json();assert.equal(body.ready,false);assert.equal(body.paused,true);assert.equal(body.environment,'prod');assert.equal(body.amountInCents,14900000);
 assert(!JSON.stringify(body).includes('test_fixture'));assert.equal(h.calls.admin,0);assert.equal(h.calls.outbound.length,0);
});
test('new checkout is denied before authentication, body parsing, reads or writes, including an old signed-in tab',async()=>{
 for(const token of [false,true]){
  const h=harness(),r=await h.request('/checkout',{token,body:'not-json'});
  assert.equal(r.status,503);assert.deepEqual(await r.json(),{error:'payments_paused',paused:true});
  assert.equal(h.calls.admin,0);assert.equal(h.calls.auth,0);assert.deepEqual(h.calls.reads,[]);assert.deepEqual(h.calls.writes,[]);assert.deepEqual(h.calls.outbound,[]);
 }
});
test('pause preserves origin restrictions and CORS preflight',async()=>{
 const h=harness();
 assert.equal((await h.request('/checkout',{origin:'https://untrusted.invalid'})).status,403);
 assert.equal((await h.request('/checkout',{method:'OPTIONS'})).status,204);
 assert.equal(h.calls.admin,0);
});
test('paid user can still recover the latest existing order while purchases are paused',async()=>{
 const h=harness(),r=await h.request('/latest');
 assert.equal(r.status,200);assert.deepEqual(await r.json(),{orderId:ORDER});
 assert(h.calls.reads[0].filters.some(([k,v])=>k==='user_id'&&v==='fixture-user'));
 assert.deepEqual(h.calls.writes,[]);
});
test('existing order status still verifies an in-flight payment and preserves authenticated ownership',async()=>{
 const h=harness(),r=await h.request('/status',{body:{orderId:ORDER}});
 assert.equal(r.status,200);const body=await r.json();assert.equal(body.status,'APPROVED');assert.equal(body.planId,'existing-approved-plan');
 assert(h.calls.reads[0].filters.some(([k,v])=>k==='user_id'&&v==='fixture-user'));
 assert.equal(h.calls.outbound.length,1);assert.equal(h.calls.writes.length,1);assert.equal(h.calls.writes[0].name,'spm_confirm_wompi_transaction');
});
test('valid provider webhook can still reconcile a payment started before the pause',async()=>{
 const h=harness();const event={event:'transaction.updated',environment:'prod',timestamp:1794590000,data:{transaction:h.tx},signature:{properties:['transaction.id','transaction.status','transaction.amount_in_cents']}};
 event.signature.checksum=await wompi.sha256(h.tx.id+h.tx.status+h.tx.amount_in_cents+event.timestamp+'unit-test-event');
 const r=await h.request('/webhook/prod',{body:event,origin:null,token:false});
 assert.equal(r.status,200);assert.deepEqual(await r.json(),{received:true});assert.equal(h.calls.writes.length,1);assert.equal(h.calls.writes[0].name,'spm_confirm_wompi_transaction');
});
test('pause does not weaken webhook authentication or existing-order authentication',async()=>{
 const h=harness({signedIn:false});
 assert.equal((await h.request('/webhook/prod',{body:{},origin:null,token:false})).status,401);
 assert.equal((await h.request('/status',{body:{orderId:ORDER}})).status,401);
 assert.deepEqual(h.calls.outbound,[]);assert.deepEqual(h.calls.writes,[]);
});
test('single pause switch can restore readiness while preserving normal checkout authentication',async()=>{
 const h=harness({paused:false,signedIn:false}),r=await h.request('/config',{method:'GET'});
 const body=await r.json();assert.equal(body.ready,true);assert.equal(body.paused,false);
 const checkout=await h.request('/checkout');assert.equal(checkout.status,401);assert.deepEqual(await checkout.json(),{error:'sign_in_required'});
});
