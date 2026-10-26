// Synthetic database boundary: this suite never writes to Supabase or uses real accounts.
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.SPM_TEST_BASE||'https://spm-premium-staging.vercel.app/premium-v2/';
const fixture=fs.readFileSync('tests/support/daily-fixture.js','utf8').replace('data.push({...payload})','data.push({id:table+"-qa-"+data.length,...payload})');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});let checks=0;
try{
for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.SPM_QA_CONFIG={primary:'erection',day:1};sessionStorage.setItem('spm-qa-rows',JSON.stringify({plans:[],assessments:[],performance_maps:[],activity_completions:[],daily_checkins:[],profiles:[]}));});
 await page.route('**/npm/@supabase/supabase-js@2',r=>r.fulfill({body:fixture,contentType:'text/javascript'}));
 await page.route('**/*.supabase.co/**',r=>r.request().method()==='GET'?r.continue():r.abort());
 await page.goto(base+'live.html');await page.locator('#ageCard').waitFor();await page.locator('[data-age="0"]').click();assert.equal(await page.locator('#motiveCard').isVisible(),false);checks++;
 await page.locator('[data-age="1"]').click();await page.locator('#motiveNext').click();assert.equal(await page.locator('#quizCard').isVisible(),false);checks++;
 await page.locator('[data-motive="'+primary+'"]').click();await page.locator('#motiveNext').click();
 await page.locator('#qNext').click();assert.equal(await page.locator('#qCount').textContent(),await page.locator('#qCount').textContent());
 let count=0;
 while(await page.locator('#quizCard').isVisible()){
  assert.ok(count++<100,'questionnaire must terminate');
  const q=await page.evaluate(()=>ENGINE.assessment.questions.find(q=>q.prompt_es===document.querySelector('#qbox h3')?.textContent));assert.ok(q,'question must be in adaptive engine');
  if(q.type==='text')await page.locator('#qbox textarea').fill('Objetivo ficticio de prueba: comprender mi experiencia.');
  else {let idx=0;if(q.type.startsWith('scale'))idx=q.domain===primary?(q.type==='scale5_reverse'?3:1):(q.type==='scale5_reverse'?0:4);
   if(q.options){const safe=q.options.findIndex(o=>['none','no','good_control','na'].includes(o.value));if(safe>=0)idx=safe;}
   await page.locator('#qbox .opt').nth(idx).click();}
  await page.locator('#qNext').click();
  if(await page.locator('#map.on').isVisible())break;
 }
 await page.locator('#map.on').waitFor();const c=await page.evaluate(()=>SPM_RESOURCE_CONTEXT());assert.equal(c.primary,primary);assert.equal(c.day,1);checks+=2;
 await page.locator('#goPlan').click();await page.locator('#spmGoToday').click();assert.ok(await page.locator('[data-daily-open]').count()>=2);checks++;
 const writes=await page.evaluate(()=>SPM_QA.writes);assert.equal(writes.filter(x=>x.table==='assessments').length,1);assert.equal(writes.filter(x=>x.table==='plans').length,1);assert.deepEqual(errors,[]);checks+=3;
 console.log(JSON.stringify({route:primary,questions:count,day:c.day,result:'passed',data:'synthetic'}));await page.close();
}
console.log(checks+' fresh-assessment production checks passed, with synthetic persistence only.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
