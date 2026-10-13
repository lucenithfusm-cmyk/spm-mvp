const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}:undefined,args:['--no-sandbox']});
 let checks=0;const errors=[];
 const scripts=['spm-video-library.js','program-videos-v1.js','ejaculatory-control.js','desire-lab-bridge-v1.js','breathing-lab-bridge-v1.js'];
 const html=`<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"></head><body><h1>Datos ficticios</h1><section id="plan"><div class="dayCard"></div></section><script>window.testContext={userId:'test',planId:'plan1',day:12,primary:'erection',secondary:'desire',motives:['erection','desire'],answers:{},safety:'none',flags:[],completed:[],checkins:[]};window.SPM_RESOURCE_CONTEXT=()=>testContext;window.testWrites=[];window.testState={};window.SPM_BREATHING_RECORDS={read:async()=>testState,save:async(state,scope,day)=>{testState=state;testWrites.push({state,scope,day});}};window.SPM_DESIRE_RECORDS={read:async()=>({}),save:async()=>{}};localStorage.setItem('spm_ec_intro_heard','1');localStorage.setItem('spmb-step','17');</script>${scripts.map(s=>`<script src="${s}"></script>`).join('')}</body></html>`;
 for(const width of [390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900},ignoreHTTPSErrors:true});page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/__breathing-review.html',r=>r.fulfill({body:html,contentType:'text/html'}));await page.goto('http://127.0.0.1:4173/premium-v2/__breathing-review.html');
  const before=await page.evaluate(()=>JSON.stringify(testContext));
  await page.locator('[data-breathing-daily]').click();
  let frame=await(await page.locator('.spm-breathing-modal iframe').elementHandle()).contentFrame();
  await frame.getByText('Tu respiración cambia la respuesta del cuerpo',{exact:true}).waitFor();checks++;
  const go=async n=>{await frame.getByRole('button',{name:'Abrir índice',exact:true}).click();await frame.locator('.bl-drawer li button').nth(n).click();};
  await go(1);await frame.locator('.bl-compare-visual').last().scrollIntoViewIfNeeded();
  await frame.waitForFunction(()=>[...document.querySelectorAll('.bl-compare-visual')].every(i=>i.complete&&i.naturalWidth>0));checks++;
  assert(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));checks++;
  await page.screenshot({path:`/tmp/breathing-${width}.png`});
  await go(3);const demo=frame.locator('video').first();await demo.evaluate(v=>v.play());await frame.waitForFunction(()=>document.querySelector('video').currentTime>0);assert.match(await demo.getAttribute('src'),/Audio_Corregido/);checks++;
  await go(4);await frame.getByRole('button',{name:'Iniciar',exact:true}).click();await frame.locator('[data-running="true"]').waitFor();await frame.getByRole('button',{name:'Pausar',exact:true}).click();await frame.locator('[data-running="false"]').waitFor();checks++;
  await go(14);assert.equal(await frame.locator('.bl-days button').count(),28);assert.equal(await frame.locator('.bl-days button:enabled').count(),1);assert.match(await frame.locator('.bl-days button:enabled').getAttribute('aria-label'),/^Día 12:/);await frame.locator('.bl-days button:enabled').click();checks+=3;
  await page.evaluate(()=>SPM_BREATHING_LAB.flush());assert.equal(await page.evaluate(()=>testState['spmb-plan']),'[12]');assert.equal(await page.evaluate(()=>JSON.stringify(testContext)),before);checks+=2;
  await page.locator('[data-breathing-close]').click();await page.evaluate(()=>SPM_EJACULATORY_CONTROL.open(12));await page.locator('#ecBreathing').click();await page.locator('.spm-breathing-modal iframe').waitFor();assert.equal(await page.evaluate(()=>SPM_BREATHING_LAB_HOST.getContext().origin),'ejaculation');checks++;await page.locator('[data-breathing-close]').click();await page.locator('.ecClose').click();
  await page.evaluate(()=>SPM_DESIRE_LAB.open());await page.locator('[data-desire-breathing]').click();await page.locator('.spm-breathing-modal iframe').waitFor();assert.equal(await page.locator('.spm-desire-modal').count(),0);checks++;await page.locator('[data-breathing-close]').click();await page.locator('.spm-desire-modal iframe').waitFor();checks++;await page.evaluate(()=>SPM_DESIRE_LAB.close());
  await page.evaluate(()=>{testContext.safety='review';return SPM_BREATHING_LAB.open();});frame=await(await page.locator('.spm-breathing-modal iframe').elementHandle()).contentFrame();await frame.locator('.bl-top').waitFor();await go(4);assert.equal(await frame.locator('.bl-pacer').count(),0);await frame.getByText(/Tu programa requiere revisión/).waitFor();checks++;
  await page.evaluate(()=>SPM_BREATHING_LAB.close());await page.close();
 }
 await browser.close();assert.deepEqual(errors,[]);console.log(`${checks} breathing browser checks passed: mobile/tablet/desktop, media, route links, persistence, day and safety.`);
})().catch(e=>{console.error(e);process.exit(1)});
