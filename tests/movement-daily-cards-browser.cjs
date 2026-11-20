// Responsive smoke test against the actual card, audio and daily-practice scripts.
// The isolated fixture has no authentication, patient account or external writes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium,webkit}=require('playwright');
const {scripts,bootstrap}=require('./support/movement-daily-fixture.cjs');
const base=process.env.SPM_BASE_URL||'http://127.0.0.1:4173';
const engine=process.env.SPM_BROWSER||'chrome';
const out=process.env.SPM_SCREENSHOT_DIR||path.join('test-artifacts','movement-'+engine);
const sizes=[{name:'small-phone',width:360,height:740},{name:'iphone',width:390,height:844},{name:'desktop',width:1280,height:900}];
const days=[2,5,8,11,14,23];
const fixture='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="style.css"><style>body{margin:0}#plan{max-width:960px;margin:auto;padding:12px;box-sizing:border-box}</style></head><body><main id="plan"></main>'+scripts.map(file=>'<script src="'+file+'"></script>').join('')+'</body></html>';
async function geometry(page,selector){
 const state=await page.locator(selector).evaluate(image=>{
  const r=image.getBoundingClientRect(),css=getComputedStyle(image);
  return {width:r.width,height:r.height,left:r.left,right:r.right,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,fit:css.objectFit,overflow:document.documentElement.scrollWidth-innerWidth};
 });
 assert.ok(state.naturalWidth>0&&state.naturalHeight>0,'Artwork must load');
 assert.ok(state.width>0&&state.height>0,'Artwork must have a visible size');
 assert.ok(Math.abs(state.width/state.height-state.naturalWidth/state.naturalHeight)<.015,'Artwork ratio must stay complete, without cropping');
 assert.equal(state.fit,'contain');assert.ok(state.left>=-1&&state.right<=page.viewportSize().width+1,'Artwork remains inside viewport');
 assert.ok(state.overflow<=1,'No horizontal document overflow');
 return state;
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await (engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{headless:true}:{headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox']});
 const results=[];
 try{
  for(const size of sizes)for(const day of days){
   const page=await browser.newPage({viewport:{width:size.width,height:size.height}}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.route('**/__movement-qa.html',route=>route.fulfill({contentType:'text/html',body:fixture}));
   await page.addInitScript(bootstrap,{day});
   await page.goto(base+'/premium-v2/__movement-qa.html');
   await page.waitForFunction(()=>window.SPM_DAILY_PRACTICE&&document.querySelector('#spmDailyStatus')?.textContent!=='Recuperando tus actividades guardadas…');
   await page.evaluate(()=>window.SPM_DAILY_PRACTICE.open({focus:false}));
   const preview=page.locator('[data-movement-preview]');
   await preview.scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>{const img=document.querySelector('[data-movement-preview] img');return img?.complete&&img.naturalWidth>0;});
   const before=await geometry(page,'[data-movement-preview] img');
   await preview.click();
   const panel=page.locator('[data-wellness-session]');await panel.waitFor();
   await page.waitForFunction(()=>{const img=document.querySelector('.spm-movement-art');return img?.complete&&img.naturalWidth>0;});
   const opened=await geometry(page,'.spm-movement-art');
   assert.equal(await panel.getAttribute('data-movement-card'),'mov.'+String([2,5,8,11,14,17,20,23,26].indexOf(day)+1).padStart(2,'0'));
   await panel.locator('[data-spm-speak]').click();
   assert.equal(await panel.locator('[data-spm-speak]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.evaluate(()=>window.SPM_MOVEMENT_QA.spoken.length),1);
   await panel.locator('[data-spm-speak]').click();
   await panel.locator('summary').click();assert.ok(await panel.locator('li').count()>=2);
   if(day===2||day===14){await panel.screenshot({path:path.join(out,`day-${day}-${size.name}.png`)});}
   await panel.locator('[data-wellness-return]').click();
   assert.equal(await page.locator('[data-wellness-session]').count(),0);
   assert.equal(await page.evaluate(()=>window.SPM_MOVEMENT_QA.writes.length),0);
   await preview.click();await page.locator('[data-wellness-done]').click();
   await page.waitForFunction(()=>window.SPM_MOVEMENT_QA.writes.length===1);
   const saved=await page.evaluate(()=>({day:window.SPM_MOVEMENT_QA.context.day,completed:window.SPM_MOVEMENT_QA.context.completed,writes:window.SPM_MOVEMENT_QA.writes}));
   assert.equal(saved.day,day);assert.equal(saved.completed.length,0);assert.equal(saved.writes[0][3],day);
   assert.deepEqual(errors,[]);
   results.push({day,viewport:size.name,preview:before,opened,saved:true});await page.close();
  }
 }finally{await browser.close();}
 fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({engine,cases:results.length,results},null,2));
 console.log(`${engine}: ${results.length} responsive Movimiento journeys passed (complete artwork, audio, return and save).`);
})().catch(error=>{console.error(error);process.exitCode=1;});
