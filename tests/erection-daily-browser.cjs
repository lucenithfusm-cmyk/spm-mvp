const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const fixture=fs.readFileSync(path.join(__dirname,'support/daily-fixture.js'),'utf8');
const base=process.env.SPM_TEST_BASE||'http://127.0.0.1:4173/premium-v2/';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,proxy:process.env.SPM_TEST_BASE&&process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined,args:['--no-sandbox']});let checks=0;
 async function pageFor(day,width=390,safety='none'){
  const page=await browser.newPage({viewport:{width,height:844},ignoreHTTPSErrors:true});page.setDefaultTimeout(15000);
  page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));
  await page.addInitScript(c=>window.SPM_QA_CONFIG=c,{primary:'erection',day,safety,flags:safety==='review'?['h_cv_event']:safety==='urgent'?['s_cardiac']:[]});
  await page.route('**/npm/@supabase/supabase-js@2',r=>r.fulfill({body:fixture,contentType:'text/javascript'}));
  await page.goto(base+'live.html'+(process.env.SPM_TEST_QUERY||''));await page.locator('#map.on').waitFor();await page.locator('#goPlan').click();await page.locator('#spmGoToday').click();await page.waitForFunction(()=>!document.querySelector('#spmDailyStatus').textContent.includes('Recuperando'));return page;
 }
 async function clean(page){assert.deepEqual(page.errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);checks+=2;await page.close();}
 try{
  const p=await pageFor(1);
  const matrix=await p.evaluate(()=>{const c=SPM_RESOURCE_CONTEXT();return Array.from({length:28},(_,i)=>{const day=i+1,items=SPM_DAILY_PRACTICE.assignments({...c,day});return {day,items,agenda:SPM_DAILY_AGENDA_ITEMS(day),title:SPM_DE_LIBRARY.days()[day].title};});});
  for(const row of matrix){
   assert.ok(row.items.length>=3&&row.items.length<=5);if(row.day!==6)assert.equal(row.items[0].title,row.title);else assert.equal(row.items[0].kind,'pelvic');
   assert.ok(row.items.filter(a=>a.kind!=='wellness').length>=2);assert.equal(row.items.filter(a=>a.kind==='wellness').length,1);
   assert.equal(new Set(row.items.map(a=>a.id)).size,row.items.length);assert.ok(row.items.every(a=>row.agenda.some(text=>text.startsWith(a.title))));checks+=6;
  }
  const days=kind=>matrix.filter(row=>row.items.some(a=>a.kind===kind)).map(row=>row.day);
  assert.deepEqual(days('desire'),[5,15,22]);assert.deepEqual(days('breathing'),[3,6,10,13,17,20,24,27]);assert.deepEqual(days('sensate'),[4,8,12,16,19,23,26]);assert.deepEqual(days('pelvic'),[2,6,9,13,16,20,23,27]);assert.deepEqual(days('recovery'),[4,8,11,15,18,22,25]);assert.deepEqual(days('video'),[1,2,7,9,14,18,21,28]);checks+=6;
  const habits=matrix.map(r=>r.items.find(a=>a.kind==='wellness').tip.category);assert.deepEqual(habits,Array.from({length:28},(_,i)=>['nutrition','movement','sleep'][i%3]));checks++;
  // Exact pre-change EP comparison is enabled for the implementation audit.
  if(process.env.SPM_EP_BASELINE){const before=JSON.parse(fs.readFileSync(process.env.SPM_EP_BASELINE,'utf8')).ep;const ep=await p.evaluate(()=>{const c=SPM_RESOURCE_CONTEXT();return Array.from({length:28},(_,i)=>SPM_DAILY_PRACTICE.assignments({...c,primary:'ejaculation',day:i+1}));});assert.deepEqual(ep,before);checks++;}
  await p.locator('[data-daily-open="de-video-dr-performance-anxiety"]').click();const video=p.locator('[data-daily-video] video');
  const h264=await video.evaluate(v=>!!v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'));
  assert.ok(h264||!process.env.CI,'Chrome CI must verify actual H.264 playback');
  if(h264)await p.waitForFunction(()=>document.querySelector('[data-daily-video] video').readyState>=1);
  else{const media=await p.request.get(new URL(await video.getAttribute('src'),base).href,{headers:{Range:'bytes=0-4095'}});assert.equal(media.status(),206);assert.equal((await media.body()).length,4096);console.log('Local Chromium lacks H.264: verified the actual MP4 range response; Chrome CI verifies playback.');}
  assert.equal(await video.getAttribute('controls'),'');assert.match(await video.getAttribute('src'),/dr-spm-performance-anxiety-content\.mp4$/);assert.equal(await p.evaluate(()=>SPM_RESOURCE_CONTEXT().day),1);checks+=3;
  if(h264)await video.evaluate(v=>v.play());await p.locator('[data-daily-view="library"]').click();assert.equal(await video.evaluate(v=>v.paused),true);checks++;
  await p.locator('[data-daily-view="today"]').click();await p.locator('[data-daily-open="de-video-dr-performance-anxiety"]').click();
  await p.locator('[name=reflection]').fill('Volver a las sensaciones y reducir la vigilancia.');await p.locator('[name=confirmed]').check();await p.locator('#spmDailyWorkspace button[type=submit]').click();await p.locator('[data-activity="de-video-dr-performance-anxiety"] .spm-daily-saved').waitFor();
  assert.equal(await p.evaluate(()=>SPM_RESOURCE_CONTEXT().day),1);assert.equal(await p.locator('#spmDailyComplete').isDisabled(),true);checks+=2;
  await p.reload();await p.locator('#map.on').waitFor();await p.locator('#goPlan').click();await p.locator('#spmGoToday').click();await p.locator('[data-activity="de-video-dr-performance-anxiety"] .spm-daily-saved').waitFor();checks++;
  await p.screenshot({path:'/tmp/spm-erection-day1.png',fullPage:true});await clean(p);
  for(const [day,title,width] of [[5,'Mapa de aceleradores y frenos',390],[15,'Escalera de intimidad sin presión',768],[22,null,1440]]){
   const page=await pageFor(day,width);
   await page.evaluate(()=>SPM_QA.rows.activity_completions.push({user_id:'qa-user',plan_id:'qa-plan',day_number:1,module_key:'resource:desire_lab_state',metadata:{state:{'spm-desire-state':JSON.stringify({health:['none'],stimuli:['touch']})}}}));
   await page.locator(`[data-daily-open="de-desire-${day}"]`).click();const f=page.frameLocator('.spm-desire-modal iframe');await f.locator('.dz-tabs').waitFor();
   if(title)await f.getByRole('heading',{name:title,exact:true}).waitFor();
   assert.equal(await page.evaluate(()=>SPM_DESIRE_LAB_HOST.getContext().day),day);assert.equal(await f.locator('.dz-tabs button').count(),1);assert.equal(await page.evaluate(()=>SPM_RESOURCE_CONTEXT().day),day);checks+=3;
   await page.locator('[data-desire-close]').click();await page.locator('.spm-desire-modal').waitFor({state:'detached'});await clean(page);
  }
  const breath=await pageFor(3);await breath.locator('[data-daily-open="breath-learn"]').click();await breath.frameLocator('.spm-breathing-modal iframe').locator('body').waitFor();assert.equal(await breath.evaluate(()=>SPM_BREATHING_LAB_HOST.getContext().activity.id),'breath-learn');checks++;await breath.evaluate(()=>SPM_BREATHING_LAB.close());await clean(breath);
  const pelvic=await pageFor(6);await pelvic.locator('[data-daily-open="main"]').click();await pelvic.frameLocator('.spm-pf-modal iframe').locator('.pf-count').waitFor();assert.equal(await pelvic.evaluate(()=>SPM_PELVIC_LAB_HOST.getContext().day),6);checks++;await pelvic.locator('[data-pf-close]').click();await clean(pelvic);
  const focus=await pageFor(16);await focus.locator('[data-daily-open="sensate-repeat"]').click();await focus.frameLocator('.spm-sensate-modal iframe').locator('body').waitFor();assert.equal(await focus.evaluate(()=>SPM_SENSATE_LAB_HOST.getContext().activity.practiceId),'sf-focus-1');checks++;await focus.evaluate(()=>SPM_SENSATE_LAB.close());await clean(focus);
  const recovery=await pageFor(11);await recovery.locator('[data-daily-open="main"]').click();await recovery.waitForFunction(()=>document.querySelector('#deActivity').textContent==='Protocolo de recuperación de firmeza');assert.equal(await recovery.locator('#deContent > :first-child').getAttribute('class'),'deRestore');checks++;
  await recovery.locator('#deReturn').click();await recovery.locator('[data-daily-open="recovery-before"]').click();await recovery.locator('#srScenario .sr-scene').waitFor();assert.equal(await recovery.locator('[data-scenario="before"]').isVisible(),false);checks++;await clean(recovery);
  const partner=await pageFor(18,768);await partner.locator('[data-daily-open="de-video-partner-communication"]').click();assert.match(await partner.locator('[data-daily-video] video').getAttribute('src'),/partner-communication\.mp4$/);assert.equal(await partner.locator('[data-daily-video] h3').textContent(),'Comunicación con la pareja sin presión');checks+=2;await clean(partner);
  const review=await pageFor(5,390,'review');await review.locator('[data-daily-open="main"]').click();await review.locator('[name=reflection]').fill('Reconozco mis facilitadores y dudas para el seguimiento.');await review.locator('[name=confirmed]').check();await review.locator('#spmDailyWorkspace button[type=submit]').click();await review.locator('[data-activity="main"] .spm-daily-saved').waitFor();assert.equal(await review.evaluate(()=>SPM_RESOURCE_CONTEXT().safety),'review');assert.equal(await review.locator('[data-activity="de-desire-5"] .spm-daily-paused').count(),1);checks+=2;await clean(review);
  const urgent=await pageFor(1,390,'urgent');await urgent.locator('[data-daily-open="de-video-dr-performance-anxiety"]').click();assert.equal(await urgent.locator('[data-daily-video]').count(),0);assert.equal(await urgent.locator('#spmDailyComplete').isDisabled(),true);checks+=2;await clean(urgent);
  console.log(`${checks} erection daily-route checks passed: 28 days, all program handoffs, video persistence and clinical gates.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
