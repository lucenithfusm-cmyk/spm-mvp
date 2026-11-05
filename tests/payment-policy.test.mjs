import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sha256,verifyEvent,validTransaction,checkoutURL,AMOUNT} from '../supabase/functions/_shared/wompi-policy.mjs';
const secret='unit-test-event-secret';
async function event(){const e={event:'transaction.updated',environment:'test',timestamp:1793880000,data:{transaction:{id:'1234-test-5678',amount_in_cents:AMOUNT,currency:'COP',reference:'SPM28-fixture',status:'APPROVED'}},signature:{properties:['transaction.id','transaction.status','transaction.amount_in_cents']}};e.signature.checksum=await sha256('1234-test-5678APPROVED'+AMOUNT+e.timestamp+secret);return e;}
test('valid signed Wompi event is accepted, altered status/amount/signature/environment is rejected',async()=>{
 const good=await event();assert.equal(await verifyEvent(good,'test',secret),true);
 for(const mutate of [e=>e.data.transaction.status='DECLINED',e=>e.data.transaction.amount_in_cents=1,e=>e.signature.checksum='0'.repeat(64),e=>e.environment='prod',e=>e.signature.properties=['transaction.__proto__.x']]){const e=structuredClone(good);mutate(e);assert.equal(await verifyEvent(e,'test',secret),false);}
 assert.equal(await verifyEvent(good,'prod',secret),false);assert.equal(await verifyEvent(good,'test',''),false);
});
test('unsigned reference and currency still require exact server-side transaction match',async()=>{
 const e=await event(),order={environment:'test',reference:'SPM28-fixture',amount_in_cents:AMOUNT,currency:'COP'};
 assert.equal(validTransaction(order,e.data.transaction,'test'),true);
 for(const patch of [{currency:'USD'},{reference:'OTHER'},{amount_in_cents:149000},{status:'approved'},{id:'../../merchant'}])assert.equal(validTransaction(order,{...e.data.transaction,...patch},'test'),false);
 assert.equal(validTransaction({...order,environment:'prod'},e.data.transaction,'test'),false);
});
test('checkout is fixed COP 149,000, uniquely referenced, signed with expiration and never exposes secret',async()=>{
 const order={environment:'test',reference:'SPM28-fixture',expires_at:'2026-11-05T21:00:00.000Z'},integrity='unit-test-integrity';
 const url=new URL(await checkoutURL(order,'pub_test_fixture',integrity,'https://spm.test/premium-v2/payment-return.html?order=fixture'));
 assert.equal(url.origin,'https://checkout.wompi.co');assert.equal(url.searchParams.get('amount-in-cents'),'14900000');assert.equal(url.searchParams.get('currency'),'COP');
 assert.equal(url.searchParams.get('signature:integrity'),await sha256(order.reference+AMOUNT+'COP'+order.expires_at+integrity));assert(!url.toString().includes(integrity));
 await assert.rejects(checkoutURL(order,'pub_prod_fixture',integrity,'https://spm.test'));
 await assert.rejects(checkoutURL(order,'pub_test_fixture','','https://spm.test'));
});
