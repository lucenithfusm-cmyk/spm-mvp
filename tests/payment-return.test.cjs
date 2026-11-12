const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
async function harness(result,url='https://spm.test/premium-v2/payment-return.html?order=11111111-1111-4111-8111-111111111111&id=1234-transaction'){
 const dom=new JSDOM(fs.readFileSync('premium-v2/payment-return.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url,runScripts:'outside-only'}),w=dom.window,requests=[];
 w.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'u'}}}})}})};
 w.SPM_PAYMENTS={status:async(...args)=>{requests.push(args);return result}};w.eval(fs.readFileSync('premium-v2/program-entry-v1.js','utf8'));w.eval(fs.readFileSync('premium-v2/payment-return.js','utf8'));await new Promise(r=>setImmediate(r));return {w,requests,close:()=>w.close()};
}
test('only a server-confirmed production approval with a plan offers the private welcome',async()=>{
 for(const [status,environment,planId,expected] of [['APPROVED','prod','plan',true],['APPROVED','prod',null,false],['APPROVED','test',null,false],['PENDING','prod',null,false],['DECLINED','prod',null,false],['VOIDED','prod',null,false]]){
  const h=await harness({status,environment,planId,reference:'fixture'});try{assert.equal(!!h.w.document.querySelector('a[href="live.html?welcome=1"]'),expected);assert.equal(h.requests.length,1);assert.equal(h.w.localStorage.getItem('spm_program_return_v1')==='1',expected);}finally{h.close();}
 }
});
test('an approved-looking URL alone never unlocks the program or skips server lookup',async()=>{
 const h=await harness({},'https://spm.test/premium-v2/payment-return.html?id=1234&status=APPROVED');try{assert.equal(h.requests.length,0);assert.equal(h.w.document.querySelector('a[href="live.html?welcome=1"]'),null);assert.match(h.w.document.querySelector('#paymentMessage').textContent,/no incluye una compra válida/);}finally{h.close();}
});
