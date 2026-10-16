const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const fixture=fs.readFileSync(path.join(__dirname,'support/daily-fixture.js'),'utf8');
const base=process.env.SPM_TEST_BASE||'http://127.0.0.1:4173/premium-v2/';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,proxy:process.env.SPM_TEST_BASE&&process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined,args:['--no-sandbox']});let checks=0;
 async function pageFor(config,width=390){
  const page=await browser.newPage({viewport:{width,height:844},ignoreHTTPSErrors:true});page.setDefaultTimeout(15000);page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));
  await page.addInitScript(c=>window.SPM_QA_CONFIG=c,config);await page.route('**/npm/@supabase/supabase-js@2',r=>r.fulfill({body:fixture,contentType:'text/javascript'}));
  await page.goto(base+'live.html'+(process.env.SPM_TEST_QUERY||''));await page.locator('#map.on').waitFor();await page.locator('#goPlan').click();await page.locator('#spmGoToday').click();await page.waitForFunction(()=>!document.querySelector('#spmDailyStatus').textContent.includes('Recuperando'));return page;
 }
 try{
  const review=await pageFor({primary:'confidence',day:14,safety:'review',flags:['h_cv_event']});
  await review.locator('[data-daily-open="main"]').click();await review.locator('[name=reflection]').fill('Revisé sueño, confianza y adherencia.');await review.locator('[name=confirmed]').check();
  await review.locator('#spmDailyWorkspace button[type=submit]').click();await review.locator('[data-activity="main"] .spm-daily-saved').waitFor();
  assert.equal(await review.locator('#spmDailyComplete').isDisabled(),true);
  await review.locator('[data-daily-open="route-video-mental-preparation"]').click();await review.locator('[name=reflection]').fill('Preparación breve sin exigencia.');await review.locator('[name=confirmed]').check();await review.locator('#spmDailyWorkspace button[type=submit]').click();await review.locator('[data-activity="route-video-mental-preparation"] .spm-daily-saved').waitFor();assert.equal(await review.locator('#spmDailyComplete').isDisabled(),false);assert.equal(await review.locator('[data-activity="wellness-movement"] .spm-daily-paused').count(),1);checks+=2;
  await review.screenshot({path:'/tmp/spm-calendar-day14-review.png'});
  await review.locator('#spmDailyComplete').click();await review.waitForFunction(()=>SPM_RESOURCE_CONTEXT().day===15);assert.equal(await review.evaluate(()=>SPM_RESOURCE_CONTEXT().safety),'review');checks++;
  assert.deepEqual(review.errors,[]);checks++;await review.close();
  for(const [day,category,width] of [[1,'nutrition',390],[2,'movement',768],[3,'sleep',1440]]){
   const p=await pageFor({primary:'lifestyle',day},width);
   await p.locator(`[data-daily-open="wellness-${category}"]`).click();
   assert.equal(await p.locator('[data-wellness-panel="0"]').isVisible(),true);assert.equal(await p.locator('[data-wellness-panel="1"]').isVisible(),false);checks+=2;
   await p.locator('[data-wellness-next]').click();await p.locator('[name=intention]').fill('Lo integraré a mi rutina de hoy.');await p.locator('[data-wellness-next]').click();await p.locator('[name=reflection]').fill('Realicé la acción a mi ritmo.');await p.locator('[name=confirmed]').check();await p.locator('#spmDailyWorkspace button[type=submit]').click();await p.locator(`[data-activity="wellness-${category}"] .spm-daily-saved`).waitFor();
   assert.equal(await p.evaluate(()=>SPM_RESOURCE_CONTEXT().day),day);checks++;
   await p.reload();await p.locator('#map.on').waitFor();await p.locator('#goPlan').click();await p.locator('#spmGoToday').click();await p.locator(`[data-activity="wellness-${category}"] .spm-daily-saved`).waitFor();checks++;
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);assert.deepEqual(p.errors,[]);checks+=2;
   if(day===1){
    const matrix=await p.evaluate(()=>{
     const c=SPM_RESOURCE_CONTEXT(),routes=['erection','ejaculation','desire','confidence','wellbeing','lifestyle'];
     return routes.map(primary=>({primary,days:Array.from({length:28},(_,i)=>SPM_DAILY_PRACTICE.assignments({...c,primary,secondary:null,motives:[primary],day:i+1}).map(a=>({id:a.id,kind:a.kind,optional:!!a.optional,title:a.title})))}));
    });
    for(const r of matrix)for(const items of r.days){assert.ok(items.length>=2&&items.length<=4);assert.equal(items[0].id,'main');assert.equal(items.filter(a=>a.kind==='wellness').length,1);assert.equal(new Set(items.map(a=>a.id)).size,items.length);checks+=4;}
    await p.locator('[data-daily-view="library"]').click();await p.locator('.dayCard').first().locator('.dayTop').click();
    await p.evaluate(()=>document.querySelector('.doneBtn').click());assert.equal(await p.evaluate(()=>SPM_RESOURCE_CONTEXT().day),1);checks++;
    await p.evaluate(()=>SPM_SAVE_MODULE({day:28,moduleKey:'library-test',metadata:{test:true}}));await p.reload();await p.locator('#map.on').waitFor();assert.equal(await p.evaluate(()=>SPM_RESOURCE_CONTEXT().day),1);checks++;
    assert.equal(await p.evaluate(async()=>{try{const c=SPM_RESOURCE_CONTEXT();await SPM_COMPLETE_DAILY_PRACTICE(1,c.userId+':'+c.planId);return false;}catch{return true;}}),true);checks++;
   }
   await p.close();
  }
  const urgent=await pageFor({primary:'confidence',day:14,safety:'urgent',flags:['s_cardiac']});
  await urgent.locator('[data-daily-open="main"]').click();assert.equal(await urgent.locator('#spmDailyWorkspace [data-daily-library]').count(),2);assert.equal(await urgent.locator('#spmDailyComplete').isDisabled(),true);checks+=2;
  assert.equal(await urgent.evaluate(async()=>{try{await SPM_DAILY_PRACTICE.saveActivity('main');return false;}catch{return true;}}),true);checks++;
  await urgent.locator('#spmDailyWorkspace [data-daily-library]').last().click();assert.equal(await urgent.locator('#spmDailyLibraryIntro').isVisible(),true);checks++;await urgent.close();
  const recovery=await pageFor({primary:'ejaculation',day:11});await recovery.locator('[data-daily-open="main"]').click();await recovery.locator('#srScenario .sr-scene').waitFor();assert.equal(await recovery.locator('[data-scenario="early"]').isVisible(),false);assert.ok((await recovery.locator('#srScenario').textContent()).length>200);assert.equal(await recovery.evaluate(()=>SPM_RESOURCE_CONTEXT().day),11);checks+=3;await recovery.close();
  const connection=await pageFor({primary:'erection',day:18});await connection.locator('[data-daily-open="main"]').click();await connection.locator('[data-de-link="connection"]').click();await connection.locator('[name=reflection]').waitFor();assert.match(await connection.locator('#spmDailyWorkspace').textContent(),/Comunicación/);assert.equal(await connection.evaluate(()=>SPM_RESOURCE_CONTEXT().day),18);checks+=2;await connection.close();
  console.log(`${checks} calendar and safety browser checks passed; 168 route-days verified.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
