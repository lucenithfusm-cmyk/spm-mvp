// Local preview QA only. No real account, transaction or medical record is created.
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const fixture=fs.readFileSync('tests/support/daily-fixture.js','utf8').replace('data.push({...payload})','data.push({id:table+"-qa-"+data.length,...payload})');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});try{
for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','optimization']){
 const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const requests=[];await p.route('**/*.supabase.co/**',r=>{requests.push(r.request().url());return r.abort()});
 await p.goto((process.env.SPM_TEST_BASE||'http://127.0.0.1:4173/premium-v2/')+'evaluacion.html');const f=p;
 assert.equal(await f.locator('#authScreen').isVisible(),false);
 await f.locator('#ageCard').waitFor();await f.locator('[data-age="1"]').click();await f.locator('[data-motive="'+primary+'"]').click();await f.locator('#motiveNext').click();
 const insights=new Set();let n=0;
 while(await f.locator('#quizCard').isVisible()){
  assert.ok(n++<80);await f.waitForTimeout(600);
  if(await f.locator('.spmRefresh').count()){
   insights.add(await f.locator('[data-insight]').getAttribute('data-insight'));
   assert.equal(await f.locator('.spmPoster').evaluate(el=>el.complete&&el.naturalWidth>0),true);
   await f.locator('.spmPosterContinue').click();
  }
  const q=await f.evaluate(()=>ENGINE.assessment.questions.find(q=>q.prompt_es===document.querySelector('#qbox h3')?.textContent));assert.ok(q);
  if(q.type==='text')await f.locator('#qbox textarea').fill('Objetivo ficticio de revisión.');
  else {let i=0;if(q.type.startsWith('scale'))i=q.domain===primary?(q.type==='scale5_reverse'?3:1):(q.type==='scale5_reverse'?0:4);if(q.options){const v=q.options.findIndex(o=>['none','no','good_control','na'].includes(o.value));if(v>=0)i=v;}await f.locator('#qbox .opt').nth(i).click();}
  await f.locator('#qNext').click();if(await f.locator('#map.on').isVisible())break;
 }
 await f.locator('.spmGateHero').waitFor();assert.equal(insights.size,4);await f.locator('.startPay').click();await f.locator('.spmPayment').waitFor();assert.match(await f.locator('.spmPayment').textContent(),/149.000 COP/);
 assert.equal(await f.locator('.pilotUnlock').count(),0);assert.equal(await f.locator('#map').isVisible(),false);assert.deepEqual(requests,[]);assert.deepEqual(errors,[]);
 await f.locator('.backResult').click();assert.equal(await f.locator('.spmGateHero').isVisible(),true);
 console.log(JSON.stringify({primary,insights:insights.size,questions:n,offer:true,anonymous:true,databaseRequests:requests.length,payment:'disabled'}));await p.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
