const {test}=require('node:test'),assert=require('node:assert/strict');
const sample={id:'gift-1',sender:'SPM <hello@example.test>',recipient:'buyer@example.test',first_attempt_at:new Date().toISOString()};
test('a gift contains the PDF and no questionnaire/profile information',async()=>{
 const {payload,MESSAGE}=await import('../supabase/functions/_shared/recipe-gift.mjs');
 const body=payload({...sample,answers:{private:'never send'}},'PDF_BYTES');
 assert.deepEqual(body.to,[sample.recipient]);assert.equal(body.attachments[0].filename,'Recetario_SPM.pdf');
 assert(!JSON.stringify(body).includes('never send'));assert(MESSAGE.includes('primeros 50'));assert.throws(()=>payload({},''));
});
test('retries use the same idempotency key and exact email payload',async()=>{
 const {sendGift}=await import('../supabase/functions/_shared/recipe-gift.mjs');const calls=[];
 const provider=async(url,opts)=>{calls.push({url,opts});return new Response(JSON.stringify({id:'message-1'}));};
 const first=await sendGift(sample,'PDF_BYTES','test-secret',provider),second=await sendGift(sample,'PDF_BYTES','test-secret',provider);
 assert.equal(first.state,'accepted');assert.deepEqual(first,second);
 assert.equal(calls[0].opts.headers['Idempotency-Key'],calls[1].opts.headers['Idempotency-Key']);assert.equal(calls[0].opts.body,calls[1].opts.body);
});
test('uncertain delivery after the deduplication window is never blindly resent',async()=>{
 const {sendGift}=await import('../supabase/functions/_shared/recipe-gift.mjs');let calls=0;
 const result=await sendGift({...sample,first_attempt_at:new Date(Date.now()-24*3600000).toISOString()},'PDF','key',async()=>{calls++;});
 assert.equal(result.state,'review');assert.equal(calls,0);
});
test('timeouts and retryable failures stay pending; sender errors require review',async()=>{
 const {sendGift}=await import('../supabase/functions/_shared/recipe-gift.mjs');
 assert.equal((await sendGift(sample,'PDF','key',async()=>{throw Error('timeout')})).state,'pending');
 for(const status of [429,500,503])assert.equal((await sendGift(sample,'PDF','key',async()=>new Response('',{status}))).state,'pending');
 assert.equal((await sendGift(sample,'PDF','key',async()=>new Response('',{status:403}))).state,'review');
});
