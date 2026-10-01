const puppeteer=require('puppeteer-core'),assert=require('assert');
(async()=>{
 const executable=process.env.CHROME_BIN||'/usr/bin/google-chrome';
 const browser=await puppeteer.launch({headless:true,executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
 const errors=[];
 async function load(viewport){
  const page=await browser.newPage();await page.setViewport(viewport);
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));page.on('console',m=>{if(m.type()==='error')errors.push('console:'+m.text())});
  await page.goto('http://127.0.0.1:4173/premium-v2/de-review.html',{waitUntil:'networkidle0'});
  await page.waitForSelector('#dayGrid .dayCard');
  assert.equal(await page.$$eval('#dayGrid .dayCard',x=>x.length),28,'must render 28 DE interventions');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert(overflow<=3,'horizontal overflow '+overflow+'px at '+viewport.width);
  return page;
 }
 for(const vp of [{width:375,height:812},{width:390,height:844},{width:1440,height:900}]){
  const page=await load(vp);await page.close();
 }
 const page=await load({width:390,height:844});
 await page.click('[data-day="1"]');await page.waitForSelector('#spmDeModal.on');
 assert.equal(await page.$$eval('#deEhs [data-ehs]',x=>x.length),6,'firmness scale should show 0-4 plus not evaluable');
 assert(await page.$('#deOpenFirmnessReference'),'visual firmness reference button missing');
 await page.click('.deClose');
 await page.evaluate(()=>window.SPM_ERECTILE_FUNCTION.open(4,{origin:'dailyPlan'}));await page.waitForSelector('#spmDeModal.on');
 assert((await page.$eval('#deReturn',e=>e.textContent)).includes('Volver a Hoy'),'dailyPlan return label missing');
 await page.waitForSelector('.deRestore');assert(await page.$('[data-de-guided]'),'guided session action missing on monitoring');
 await page.click('[data-de-guided]');await page.waitForSelector('.deg:not([hidden])');
 assert((await page.$eval('#degTitle',e=>e.textContent)).toLowerCase().includes('modo examen'),'guided monitoring title mismatch');
 await page.click('.degClose');await page.click('.deClose');
 await page.evaluate(()=>window.SPM_ERECTILE_FUNCTION.open(20,{origin:'library'}));await page.waitForSelector('#spmDeModal.on');
 assert((await page.$eval('#deReturn',e=>e.textContent)).includes('Volver a Biblioteca'),'library return label missing');
 await page.waitForSelector('[data-de-recovery]');await page.click('[data-de-recovery]');await page.waitForSelector('.sr-dialog[open]');
 assert(await page.evaluate(()=>!!window.SPM_RECOVERY_MICROSTORY_V2),'recovery microstory layer not loaded');
 await page.keyboard.press('Escape').catch(()=>{});
 await page.evaluate(()=>{document.querySelector('.sr-dialog [data-sr-close]')?.click()});
 await page.evaluate(()=>{document.querySelector('#spmDeModal .deClose')?.click()});
 const videoButton=await page.$('[data-dev2-video="vascular"]');assert(videoButton,'vascular Doctor SPM internal video missing');
 await videoButton.click();await page.waitForSelector('#spmVideoModal.on');
 assert((await page.$eval('#spmVpVideo',v=>v.getAttribute('src')||'')).includes('dr-spm-vascular.mp4'),'vascular video is not using internal MP4');
 await page.close();await browser.close();
 if(errors.length)throw new Error('Browser errors: '+errors.join(' | '));
 console.log('DE Premium V3 browser QA OK: 375x812, 390x844, desktop, 28 days, firmness scale, origins, guided session, recovery resource, internal video.');
})().catch(e=>{console.error(e);process.exit(1)});