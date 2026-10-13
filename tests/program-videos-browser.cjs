const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}:undefined,args:['--no-sandbox']});
 const errors=[];let checks=0;
 const scripts=['spm-video-library.js','program-videos-v1.js','spm-resources-content.js','spm-resources.js','ejaculatory-control.js','erectile-function-route.js','desire-lab-bridge-v1.js','sensate-lab-bridge-v1.js'];
 const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="spm-resources.css"><style>body{background:#07171f;color:#eef8f6;margin:0;font-family:system-ui}</style></head><body><h1>Revisión con datos ficticios</h1><div id="profileTitle">Control eyaculatorio</div><section id="plan"></section><script>window.testContext={userId:'test',planId:'test',day:12,primary:'erection',secondary:'desire',motives:['erection','desire'],answers:{},safety:'none',flags:[],completed:[],checkins:[]};window.SPM_RESOURCE_CONTEXT=()=>window.testContext;window.testWrites=[];window.SPM_RESOURCE_RECORDS={read:async()=>[],save:async x=>testWrites.push(x)};window.SPM_DESIRE_RECORDS=window.SPM_SENSATE_RECORDS={read:async()=>({}),save:async x=>testWrites.push(x)};localStorage.setItem('spm_ec_intro_heard','1');</script>${scripts.map(s=>`<script src="${s}"></script>`).join('')}</body></html>`;
 for(const width of [390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900},ignoreHTTPSErrors:true});page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/__program-video-review.html',r=>r.fulfill({body:html,contentType:'text/html'}));
  await page.goto('http://127.0.0.1:4173/premium-v2/__program-video-review.html');
  const before=await page.evaluate(()=>JSON.stringify(testContext));
  for(const lab of ['sensate','desire']){
   await page.evaluate(lab=>window[lab==='sensate'?'SPM_SENSATE_LAB':'SPM_DESIRE_LAB'].open({origin:'library'}),lab);
   const iframe=page.locator(`.spm-${lab}-modal iframe`),frame=await (await iframe.elementHandle()).contentFrame();
   if(lab==='desire')await frame.getByRole('button',{name:'Biblioteca',exact:true}).first().click();
   await frame.waitForSelector(`[data-program-videos="${lab}"] video`);
   assert.equal(await frame.locator(`[data-program-videos="${lab}"] video`).count(),lab==='sensate'?4:1);checks++;
   assert(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));checks++;
   // An actual shared resource must resolve from the parent base, never the nested lab folder.
   assert.match(await frame.locator('[data-video-key="sensory-focus"] video').getAttribute('src'),/spm-media\/videos\/sensory-focus.mp4$/);checks++;
   await frame.locator('[data-program-videos]').evaluate(e=>e.scrollIntoView({block:'start'}));
   await page.screenshot({path:`/tmp/spm-${lab}-${width}.png`});
   await page.evaluate(lab=>window[lab==='sensate'?'SPM_SENSATE_LAB':'SPM_DESIRE_LAB'].flush(),lab);
   const writesBeforeVideo=await page.evaluate(()=>testWrites.length);
   const video=frame.locator('[data-video-key="sensory-focus"] video');
   await video.evaluate(v=>v.play());
   await frame.waitForFunction(()=>document.querySelector('[data-video-key="sensory-focus"] video').currentTime>0);
   assert.equal(await page.evaluate(()=>testWrites.length),writesBeforeVideo);checks++;
   await page.evaluate(lab=>window[lab==='sensate'?'SPM_SENSATE_LAB':'SPM_DESIRE_LAB'].close(),lab);
  }
  await page.evaluate(()=>SPM_EJACULATORY_CONTROL.open(12));
  await page.waitForSelector('#ecProgram [data-program-videos="ejaculation"]');
  assert.equal(await page.locator('#ecProgram [data-video-key]').count(),3);checks++;
  await page.locator('.ecClose').click();
  for(const day of (width===390?Array.from({length:28},(_,i)=>i+1):[12])){
   await page.evaluate(day=>SPM_ERECTILE_FUNCTION.open(day,{origin:'dailyPlan'}),day);
   assert.equal(await page.locator('#spmDeModal [data-video-key]').count(),5);checks++;
   assert.equal(await page.locator('#deKicker').textContent(),`Día ${day} de 28`);checks++;
  }
  await page.locator('.deClose').click();
  await page.evaluate(()=>SPM_RESOURCES.open('confidence',12));
  await page.waitForSelector('[data-program-videos="anxiety"]');
  assert.equal(await page.locator('[data-program-videos="anxiety"] video').count(),5);checks++;
  const sr=page.locator('.sr-dialog');assert(await sr.evaluate(e=>e.scrollWidth<=e.clientWidth+2));checks++;
  await page.locator('[data-sr-close]').click();
  assert.equal(await page.evaluate(()=>JSON.stringify(testContext)),before);checks++;
  assert(await page.evaluate(()=>testWrites.every(x=>Object.keys(x).every(k=>k.startsWith('spm-')))));checks++;
  await page.close();
 }
 await browser.close();assert.deepEqual(errors,[]);console.log(`${checks} browser checks passed at 390, 768 and 1440 px; no day or completion changes.`);
})().catch(e=>{console.error(e);process.exit(1)});
