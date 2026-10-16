const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.SPM_TEST_BASE||'http://127.0.0.1:4173/premium-v2/';
const fixture=fs.readFileSync(path.join(__dirname,'support/daily-fixture.js'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,proxy:process.env.SPM_TEST_BASE&&process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined,args:['--no-sandbox']});let checks=0;
 const pages=[];
 async function pageFor(primary,day,width=390){
  const page=await browser.newPage({viewport:{width,height:844},ignoreHTTPSErrors:true});pages.push(page);page.setDefaultTimeout(12000);
  page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));
  await page.addInitScript(c=>window.SPM_QA_CONFIG=c,{primary,day});
  await page.route('**/npm/@supabase/supabase-js@2',r=>r.fulfill({body:fixture,contentType:'text/javascript'}));
  await page.goto(base+'live.html');await page.locator('#map.on').waitFor();await page.locator('#goPlan').click();await page.locator('#spmGoToday').click();await page.locator('#spmDailySession').waitFor();await page.waitForFunction(()=>!document.querySelector('#spmDailyStatus').textContent.includes('Recuperando'));return page;
 }
 async function confirm(page,id){await page.locator(`[data-daily-confirm="${id}"]`).click();await page.locator('#spmDailyWorkspace input[type=checkbox]').check();await page.locator('#spmDailyWorkspace button[type=submit]').click();await page.waitForFunction(id=>!!document.querySelector(`[data-activity="${id}"] .spm-daily-saved`),id);}
 try{
  // Real page + all enhancement layers; the database boundary uses synthetic records only.
  for(const [primary,width] of [['erection',390],['ejaculation',768],['desire',1440],['confidence',390],['lifestyle',768]]){
   const p=await pageFor(primary,12,width);assert.equal(await p.locator('#dayGrid').isVisible(),false);assert.equal(await p.locator('#spmDesireLabEntry').isVisible(),false);checks+=2;
   assert.equal(await p.locator('#spmDailyComplete').isDisabled(),true);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);checks+=2;
   await p.locator('[data-daily-open="main"]').click();
   if(primary==='erection'){
    await p.locator('#spmDeModal.on').waitFor();assert.equal(await p.locator('#deKicker').textContent(),'Día 12 de 28');assert.equal(await p.locator('#deNext').isVisible(),false);checks+=2;
    await p.evaluate(()=>SPM_QA.failNext=true);await p.locator('#deSave').click();await p.waitForFunction(()=>document.querySelector('#deSave').textContent.includes('Reintentar'));assert.equal(await p.evaluate(()=>SPM_RESOURCE_CONTEXT().day),12);checks++;
    await p.locator('#deSave').click();await p.waitForFunction(()=>document.querySelector('#deSave').textContent==='Guardado ✓');assert.equal(await p.evaluate(()=>SPM_RESOURCE_CONTEXT().day),12);assert.equal(await p.evaluate(()=>SPM_RESOURCE_CONTEXT().completed.length),0);checks+=2;
    await p.locator('#deReturn').click();await p.locator('#spmDailySession').waitFor();assert.equal(await p.locator('#dayGrid').isVisible(),false);checks++;
    await confirm(p,'sensate-presence');await p.locator('#spmDailyComplete').click();await p.waitForFunction(()=>SPM_RESOURCE_CONTEXT().day===13);assert.equal(await p.evaluate(()=>SPM_RESOURCE_CONTEXT().completed.join(',')),'12');checks++;
    const rows=await p.evaluate(()=>SPM_QA.rows.activity_completions);assert.equal(rows.filter(r=>r.module_key==='daily_practice').length,1);assert.equal(rows.filter(r=>r.module_key.startsWith('resource:daily_activity:')).length,2);checks+=2;
    await p.reload();await p.locator('#map.on').waitFor();await p.locator('#goPlan').click();await p.locator('#spmGoToday').click();await p.waitForFunction(()=>SPM_RESOURCE_CONTEXT().day===13);assert.equal(await p.locator('[data-daily-open="breath-rescue"]').count(),1);checks++;
   }else if(primary==='ejaculation'){
    await p.locator('#spmEcModal.on #ecTeach.on').waitFor();assert.equal(await p.locator('#ecTechTitle').textContent(),'Stop–Squeeze');assert.equal(await p.locator('#ecProgram').isVisible(),false);checks+=2;
    await p.locator('#ecGoPractice').click();await p.locator('#ecFinish').click();await p.waitForFunction(()=>document.querySelector('#ecFinish').textContent==='Guardado ✓');assert.equal(await p.evaluate(()=>SPM_RESOURCE_CONTEXT().day),12);checks++;
    await p.locator('.ecClose').click();await p.locator('#spmDailySession').waitFor();
   }else if(primary==='desire'){
    const frame=p.frameLocator('.spm-desire-modal iframe');await frame.locator('.dz-tabs').waitFor();assert.equal(await frame.locator('.dz-tabs button').count(),1);assert.equal(await frame.getByRole('button',{name:'Recorrido 20 pantallas',exact:true}).count(),0);checks+=2;
    assert.equal(await p.evaluate(()=>SPM_DESIRE_LAB_HOST.getContext().day),12);checks++;
    await p.locator('[data-desire-close]').click();await p.locator('.spm-desire-modal').waitFor({state:'detached'});
   }else{
    const frame=p.frameLocator('.spm-sensate-modal iframe');await frame.locator('body').waitFor();assert.equal(await p.evaluate(()=>SPM_SENSATE_LAB_HOST.getContext().activity.day),12);checks++;
    await p.evaluate(()=>SPM_SENSATE_LAB.close());
   }
   await p.screenshot({path:`/tmp/spm-today-${primary}-${width}.png`});
   await p.locator('[data-daily-view="library"]').click();assert.equal(await p.locator('#spmDesireLabEntry').isVisible(),true);await p.locator('[data-daily-view="today"]').click();checks++;
   assert.deepEqual(p.errors,[]);checks++;await p.close();
  }
  // Daily pelvic entry is a single approved practice, not the 16-screen curriculum.
  const pelvic=await pageFor('confidence',6);await pelvic.locator('[data-daily-open="main"]').click();const pf=pelvic.frameLocator('.spm-pf-modal iframe');await pf.locator('.pf-count').waitFor();assert.equal(await pf.locator('.pf-count').textContent(),'DÍA 6');assert.ok((await pf.locator('.pf-main').textContent()).includes('Percibe'));assert.equal(await pf.getByRole('button',{name:'Siguiente →',exact:true}).count(),0);checks+=3;
  await pelvic.locator('[data-pf-close]').click();await pelvic.locator('#spmDailySession').waitFor();await pelvic.close();
  // Both checkpoints remain reachable from the actual assigned day.
  for(const day of [14,28]){const ep=await pageFor('ejaculation',day);await ep.locator('[data-daily-open="main"]').click();await ep.locator('#epATitle').waitFor();assert.ok((await ep.locator('#epATitle').textContent()).includes('Día '+day));assert.equal(await ep.evaluate(()=>SPM_RESOURCE_CONTEXT().day),day);checks+=2;await ep.close();}
  // Generic days have a real response form, with persisted responses and no automatic advance.
  const p=await pageFor('confidence',2);await p.locator('[data-daily-open="main"]').click();await p.locator('[name=reflection]').fill('Reconocí mis contextos y mi patrón.');await p.locator('[name=measure]').fill('No evaluable');await p.locator('[name=confirmed]').check();await p.locator('#spmDailyWorkspace button[type=submit]').click();await p.locator('[data-activity="main"] .spm-daily-saved').waitFor();assert.equal(await p.evaluate(()=>SPM_RESOURCE_CONTEXT().day),2);checks++;
  await p.reload();await p.locator('#map.on').waitFor();await p.locator('#goPlan').click();await p.locator('#spmGoToday').click();await p.locator('[data-daily-open="main"]').click();assert.equal(await p.locator('[name=reflection]').inputValue(),'Reconocí mis contextos y mi patrón.');checks++;
  await p.evaluate(()=>{SPM_RESTORED_CONTEXT.map.safety_level='urgent';dispatchEvent(new Event('spm:resourcecontext'));});assert.equal(await p.locator('[data-activity="main"] .spm-daily-paused').count(),1);checks++;
  const before=await p.evaluate(()=>SPM_QA.writes.length);assert.equal(await p.evaluate(async()=>{try{await SPM_DAILY_PRACTICE.saveActivity('main');return false;}catch{return true;}}),true);assert.equal(await p.evaluate(()=>SPM_QA.writes.length),before);checks+=2;
  await p.close();
  // Day 28 remains capped and records closure only once.
  const end=await pageFor('lifestyle',28);await confirm(end,'main');await confirm(end,'route-video-mental-preparation');await end.locator('#spmDailyComplete').click();await end.waitForFunction(()=>SPM_RESOURCE_CONTEXT().completed.includes(28));assert.equal(await end.evaluate(()=>SPM_RESOURCE_CONTEXT().day),28);checks++;
  await end.close();console.log(`${checks} daily-practice browser checks passed.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
