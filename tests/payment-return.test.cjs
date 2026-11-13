const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
async function harness(result,url='https://spm.test/premium-v2/payment-return.html?order=11111111-1111-4111-8111-111111111111&id=1234-transaction',configuration={paused:false}){
 const dom=new JSDOM(fs.readFileSync('premium-v2/payment-return.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url,runScripts:'outside-only'}),w=dom.window,requests=[],configurationRequests=[];
 w.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'u'}}}})}})};
 w.SPM_PAYMENTS={status:async(...args)=>{requests.push(args);return result},configuration:async()=>{configurationRequests.push('config');if(configuration instanceof Error)throw configuration;return configuration;}};w.eval(fs.readFileSync('premium-v2/program-entry-v1.js','utf8'));w.eval(fs.readFileSync('premium-v2/payment-return.js','utf8'));await new Promise(r=>setImmediate(r));return {w,requests,configurationRequests,close:()=>w.close()};
}
test('only a server-confirmed production approval with a plan offers the private welcome',async()=>{
 for(const [status,environment,planId,expected] of [['APPROVED','prod','plan',true],['APPROVED','prod',null,false],['APPROVED','test',null,false],['PENDING','prod',null,false],['DECLINED','prod',null,false],['VOIDED','prod',null,false]]){
  const h=await harness({status,environment,planId,reference:'fixture'});try{assert.equal(!!h.w.document.querySelector('a[href="live.html?welcome=1"]'),expected);assert.equal(h.requests.length,1);assert.equal(h.configurationRequests.length,expected?1:0);assert.equal(h.w.localStorage.getItem('spm_program_return_v1')==='1',expected);}finally{h.close();}
 }
});
test('a verified paid buyer sees the pause reassurance and notice without an immediate welcome',async()=>{
 const h=await harness({status:'APPROVED',environment:'prod',planId:'plan',reference:'fixture'},undefined,{paused:true});
 try{assert.equal(h.w.document.querySelector('h1').textContent,'Tu pago está confirmado.');assert.match(h.w.document.querySelector('#paymentMessage').textContent,/Tu compra seguirá vigente/);assert.match(h.w.document.querySelector('#paymentMessage').textContent,/día 1, con tus 28 días completos disponibles/);assert.equal(h.w.document.querySelector('a[href="program-paused.html"]').textContent,'Ver el aviso del programa');assert.equal(h.w.document.querySelector('a[href="live.html?welcome=1"]'),null);assert.equal(h.w.localStorage.getItem('spm_program_return_v1'),'1');assert.equal(h.configurationRequests.length,1);}finally{h.close();}
});
test('a failed pause lookup preserves a verified payment and access without claiming the program is ready',async()=>{
 const h=await harness({status:'APPROVED',environment:'prod',planId:'plan',reference:'fixture'},undefined,new Error('temporarily_unavailable'));
 try{assert.equal(h.w.document.querySelector('h1').textContent,'Tu pago está confirmado.');assert.match(h.w.document.querySelector('#paymentMessage').textContent,/Confirmamos tu pago/);assert.match(h.w.document.querySelector('#paymentMessage').textContent,/Tu compra sigue vigente/);assert.ok(h.w.document.querySelector('a[href="live.html?welcome=1"]'));assert.equal(h.w.localStorage.getItem('spm_program_return_v1'),'1');assert.equal(h.w.document.querySelector('#paymentActions button'),null);}finally{h.close();}
});
test('an approved-looking URL alone never unlocks the program or skips server lookup',async()=>{
 const h=await harness({},'https://spm.test/premium-v2/payment-return.html?id=1234&status=APPROVED');try{assert.equal(h.requests.length,0);assert.equal(h.w.document.querySelector('a[href="live.html?welcome=1"]'),null);assert.match(h.w.document.querySelector('#paymentMessage').textContent,/no incluye una compra válida/);}finally{h.close();}
});
