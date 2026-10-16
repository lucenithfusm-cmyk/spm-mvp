// Real Central page, intercepted authentication/data, synthetic profiles only.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.SPM_TEST_BASE||'http://127.0.0.1:4173/premium-v2/';
const fixture=fs.readFileSync(path.join(__dirname,'returning-user-fixture.js'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,proxy:process.env.SPM_TEST_BASE&&process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined,args:['--no-sandbox']});let checks=0;
 for(const [primary,width] of [['lifestyle',390],['erection',768],['ejaculation',1440],['desire',390]]){
  const page=await browser.newPage({viewport:{width,height:844},ignoreHTTPSErrors:true});page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let mock=fixture.replace("parent.document.getElementById('route').value",JSON.stringify(primary)).replace("parent.document.getElementById('safety')?.value||'none'","'none'").replace('motives:[primary]','motives:[primary,"desire"]').replace('primary_domain:primary','primary_domain:primary,secondary_domain:"desire"');
  await page.route('**/npm/@supabase/supabase-js@2',r=>r.fulfill({body:mock,contentType:'text/javascript'}));
  await page.goto(base+'live.html?v=20261013-entry2');await page.locator('#map.on').waitFor();await page.locator('#goPlan').click();await page.locator('#plan.on #spmGoToday').waitFor();
  const cta=page.locator('#spmGoToday');await page.waitForFunction(()=>window.SPM_CURRENT_DAY===12&&document.querySelector('#spmGoToday').textContent.includes('Día 12'));
  await page.waitForFunction(()=>document.activeElement?.id==='spmGoToday');await page.screenshot({path:`/tmp/spm-daily-entry-${primary}-${width}.png`});
  const box=await cta.boundingBox();console.log(JSON.stringify({primary,width,ctaTop:box.y,ctaBottom:box.y+box.height,firstPlanChild:await page.locator('#plan').evaluate(p=>p.firstElementChild.id)}));assert.ok(box.y>=await page.locator('.top').evaluate(h=>h.getBoundingClientRect().bottom)&&box.y+box.height<=844,'Daily CTA visible without scrolling');checks++;
  assert.equal(await page.locator('[data-desire-daily]').count(),primary==='desire'?1:0);assert.equal(await page.locator('.dayCard .spmPlay[data-key="dr-low-desire"]').count(),0);assert.ok(await page.locator('#spmDesireLabEntry button').count());checks+=3;
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);checks++;
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await cta.evaluate(b=>getComputedStyle(b,'::before').animationName),'none');checks++;
  // The CTA opens actionable daily tasks, not the legacy text accordion.
  await cta.click();await page.waitForFunction(()=>document.activeElement?.id==='spmDailySession');
  const current=page.locator('#spmDailySession');assert.ok((await current.textContent()).includes('DÍA 12'));assert.ok(await current.locator('[data-daily-open]').count());checks+=2;
  assert.equal(await page.locator('#dayGrid').isVisible(),false);checks++;
  await page.locator('[data-daily-view="library"]').click();assert.equal(await page.locator('#spmDesireLabEntry').isVisible(),true);checks++;
  await page.locator('[data-daily-view="today"]').click();
  const actualDay=await page.evaluate(()=>SPM_RESOURCE_CONTEXT().day);assert.equal(actualDay,12);assert.equal(await page.evaluate(()=>SPM_RESOURCE_CONTEXT().completed.length),0);assert.deepEqual(errors,[]);checks+=3;
  await page.close();
 }
 await browser.close();console.log(`${checks} daily-entry checks passed: initial visibility, profile isolation, correct-day navigation and reduced motion.`);
})().catch(e=>{console.error(e);process.exit(1)});
