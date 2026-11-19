// SPM Desire week 2 · real mobile browser smoke test using synthetic local state.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base=process.env.SPM_TEST_BASE||'http://127.0.0.1:4173/premium-v2/desire-week2-v1/';
(async()=>{
 const browser=process.env.SPM_BROWSER==='webkit'
  ?await webkit.launch({headless:true})
  :await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const config={
 8:{field:'stimulus',value:'music'},
 9:{field:'channel',value:'tactile'},
 10:{field:'idea',value:'escuchar'},
 11:{field:'pleasant',value:'rest'},
 };
 let screens=0;
 try{
  await page.goto(base+'index.html',{waitUntil:'domcontentloaded',timeout:25000});
  await page.locator('.daycard').first().waitFor();
  assert.equal(await page.locator('.daycard').count(),7);
  for(let day=8;day<=14;day++){
   await page.locator('.daycard[data-day="'+day+'"]').click();
   await page.locator('.pill').waitFor();
   assert.match(await page.locator('.pill').innerText(),new RegExp('Día '+day));
   const choice=config[day];
   if(day<14){
    await page.locator('.image-screen img').waitFor();
    const loaded=await page.locator('.image-screen img').evaluate(img=>img.complete&&img.naturalWidth>0);
    assert.equal(loaded,true,'original approved image for day '+day+' loads');
    const firstCard=page.locator('.image-screen .hit.select').first();
    assert(await firstCard.count()>0);
    await firstCard.click();
    assert.equal(await firstCard.getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('.hit.audio').count(),1);
    await page.locator('.nav [data-act="next"]').click();
    await page.locator('.custom-head').waitFor();
    if(choice)await page.locator('[data-act="select"][data-field="'+choice.field+'"][data-value="'+choice.value+'"]').click();
    if(day===12)await page.locator('input[data-field="moment"]').fill('Mañana con privacidad');
    if(day===13)await page.locator('textarea[data-field="memory1"]').fill('Una conversación tranquila');
    await page.locator('.nav [data-act="next"]').click();
    await page.locator('.custom-head').waitFor();
    assert.equal(await page.locator('.nav .count').innerText(),'3 / 3');
    await page.locator('.nav [data-act="next"]').click();
    await page.locator('.daycard').first().waitFor();
    assert.equal(await page.locator('.daycard[data-day="'+day+'"] small').innerText(),'✓ Registro local de revisión guardado');
   } else {
    assert.equal(await page.locator('.image-screen').count(),0,'day 14 begins with reflection, not deceptive 100% image');
    await page.locator('textarea[data-field="good"]').fill('Aprendí a darme tiempo');
    await page.locator('.nav [data-act="next"]').click();
    await page.locator('[data-act="checkpoint"]').waitFor();
    await page.locator('[data-act="checkpoint"]').click();
    await page.locator('.nav [data-act="next"]').click();
    await page.locator('.image-screen').waitFor();
    assert.equal(await page.locator('.image-screen .demo-badge').count(),1,'week 2 completion visual remains illustrative until official checkpoint');
    await page.locator('.topbar [data-act="home"]').click();
    await page.locator('.daycard').first().waitFor();
   }
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3);
   assert.equal(overflow,false,'no horizontal scrolling');
   screens++;
  }
  assert.deepEqual(errors,[],'no uncaught JS browser errors');
  console.log(JSON.stringify({result:'PASS',browser:process.env.SPM_BROWSER||'chrome',mobileDays:screens,images:6,checkpoint:'independent',browserErrors:errors.length}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
