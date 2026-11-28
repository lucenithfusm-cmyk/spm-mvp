// Local preview QA only. No real account, transaction or medical record is created.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});try{
for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','optimization']){
 const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const requests=[],paymentRequests=[];await p.route('**/*.supabase.co/**',r=>{requests.push(r.request().url());return r.abort()});
 await p.route(/^https:\/\/(?:[^/]+\.)?wompi\.(?:co|com)\//,r=>{paymentRequests.push(r.request().url());return r.abort()});
 await p.goto((process.env.SPM_TEST_BASE||'http://127.0.0.1:4173/premium-v2/')+'evaluacion.html');const f=p;
 await f.locator('#spmGuestStart').waitFor();
 assert.match(new URL(f.url()).pathname,/\/free-assessment\.html$/);
 assert.equal(await f.locator('#authScreen').isVisible(),false);
 assert.equal(await f.locator('#ageCard').isVisible(),false,'the anonymous welcome precedes the questionnaire');
 assert.equal(await f.locator('#spmGuestAccountForm').count(),0);
 await f.evaluate(()=>{window.__qaCheckoutCalls=0;window.SPM_PAYMENTS.checkout=async()=>{window.__qaCheckoutCalls++;throw Error('Unexpected checkout in anonymous smoke');};});
 await f.locator('#spmGuestStart').click();
 await f.locator('#ageCard').waitFor();await f.locator('[data-age="1"]').click();await f.locator('[data-motive="'+primary+'"]').click();await f.locator('#motiveNext').click();
 const insights=new Set();let n=0;
 while(await f.locator('#quizCard').isVisible()){
  assert.ok(n++<80);
  assert.equal(await f.locator('#spmGuestAccountForm').count(),0,'assessment stays anonymous through its last question');
  const q=await f.evaluate(()=>ENGINE.assessment.questions.find(q=>q.prompt_es===document.querySelector('#qbox h3')?.textContent));assert.ok(q);
  if(q.type==='text')await f.locator('#qbox textarea').fill('Objetivo ficticio de revisión.');
  else {let i=0;if(q.type.startsWith('scale'))i=q.domain===primary?(q.type==='scale5_reverse'?3:1):(q.type==='scale5_reverse'?0:4);if(q.options){const v=q.options.findIndex(o=>['none','no','good_control','na'].includes(o.value));if(v>=0)i=v;}await f.locator('#qbox .opt').nth(i).click();}
  await f.locator('#qNext').click();
  if(await f.locator('.spmRefresh').count()){
   insights.add(await f.locator('.spmPosterWrap[data-insight]').getAttribute('data-insight'));
   await f.waitForFunction(()=>{const image=document.querySelector('.spmPoster');return image?.complete&&image.naturalWidth>0;});
   assert.equal(await f.locator('.spmPoster').evaluate(el=>el.complete&&el.naturalWidth>0),true);
   await f.locator('.spmPosterContinue').click();await f.locator('.spmRefresh').waitFor({state:'detached'});
  }
 }
 await f.locator('.spmGuestReturnHero').waitFor();await f.locator('.spmGateInline .spmGateHero').waitFor();
 assert.deepEqual([...insights].sort(),['1','2','3','4']);assert.equal(await f.locator('#spmGuestAccountForm').count(),0,'the complete result and offer precede account creation');
 assert.match(await f.locator('.spmOfferPurchasePrice').textContent(),/149.000 COP/);
 assert.match(await f.locator('.spmOfferPurchasePrice').textContent(),/Sin mensualidades ni anualidades/);
 await f.locator('.spmGateInline .spmOfferPurchase .startPay').click();await f.locator('#spmGuestCheckout #spmGuestAccountForm').waitFor();
 assert.match(await f.locator('.spmGuestAccountPrice').textContent(),/149.000 COP/);
 assert.match(await f.locator('#spmGuestCheckout').textContent(),/Crear una cuenta no realiza ningún cobro/);
 assert.equal(await f.locator('#spmGuestEmail').inputValue(),'');assert.equal(await f.locator('#spmGuestPassword').inputValue(),'');
 assert.equal(await f.locator('.pilotUnlock,.testUnlock').count(),0);assert.equal(await f.locator('#map').isVisible(),false);
 // Checkout is inline: returning to the offer preserves the same result and
 // repeated purchase CTAs must not create duplicate forms or submit anything.
 await f.locator('.spmGateInline .spmGateHero').scrollIntoViewIfNeeded();assert.equal(await f.locator('.spmGateInline .spmGateHero').isVisible(),true);
 await f.locator('.spmGateInline .spmCTAWrap .startPay').click();assert.equal(await f.locator('#spmGuestAccountForm').count(),1);
 assert.equal(await f.evaluate(()=>window.__qaCheckoutCalls),0);assert.deepEqual(requests,[]);assert.deepEqual(paymentRequests,[]);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({primary,insights:insights.size,questions:n,offer:true,anonymousAssessment:true,accountFormAfterOffer:true,databaseRequests:requests.length,checkoutAttempts:0,paymentRequests:paymentRequests.length,payment:'not-attempted'}));await p.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
