const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const fixture=fs.readFileSync(path.join(__dirname,'support/daily-fixture.js'),'utf8');
const base=process.env.SPM_TEST_BASE||'http://127.0.0.1:4173/premium-v2/';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,proxy:process.env.SPM_TEST_BASE&&process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined,args:['--no-sandbox']});let checks=0;
 async function pageFor(primary,day,width=390){
  const p=await browser.newPage({viewport:{width,height:844},ignoreHTTPSErrors:true});p.setDefaultTimeout(20000);p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));
  await p.addInitScript(c=>window.SPM_QA_CONFIG=c,{primary,day});await p.route('**/npm/@supabase/supabase-js@2',r=>r.fulfill({body:fixture,contentType:'text/javascript'}));
  await p.goto(base+'live.html'+(process.env.SPM_TEST_QUERY||''));await p.locator('#map.on').waitFor();await p.locator('#goPlan').click();await p.locator('#spmGoToday').click();await p.waitForFunction(()=>!document.querySelector('#spmDailyStatus').textContent.includes('Recuperando'));return p;
 }
 async function finish(p){assert.deepEqual(p.errors,[]);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);checks+=2;await p.close();}
 try{
  const baseline=process.env.SPM_ROUTES_BASELINE?JSON.parse(fs.readFileSync(process.env.SPM_ROUTES_BASELINE,'utf8')):null;
  for(const [i,primary] of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle'].entries()){
   const p=await pageFor(primary,1,[390,768,1440][i%3]);
   const matrix=await p.evaluate(()=>{const c=SPM_RESOURCE_CONTEXT();return Array.from({length:28},(_,i)=>{const day=i+1,items=SPM_DAILY_PRACTICE.assignments({...c,day});return {items,agenda:SPM_DAILY_AGENDA_ITEMS(day)};});});
   for(const [index,{items,agenda}] of matrix.entries()){
    assert.ok(items.length>=2&&items.length<=5);assert.equal(items[0].id,'main');assert.equal(items.filter(a=>a.kind==='wellness').length,1);assert.equal(new Set(items.map(a=>a.id)).size,items.length);
    assert.equal(items.find(a=>a.kind==='wellness').tip.category,['nutrition','movement','sleep'][index%3]);assert.ok(items.every(a=>agenda.some(text=>text.startsWith(a.title))));checks+=6;
    if(baseline){assert.deepEqual(items.filter(a=>!a.id.startsWith('route-')),baseline[primary][index]);checks++;}
   }
   assert.deepEqual(matrix.flatMap(({items},i)=>items.some(a=>a.kind==='video')?[i+1]:[]),[1,2,7,9,14,18,21,28]);checks++;
   assert.ok(matrix[10].items.some(a=>a.kind==='recovery'));assert.ok(matrix[24].items.some(a=>a.kind==='recovery'));checks+=2;
   const current=await p.evaluate(()=>({day:SPM_RESOURCE_CONTEXT().day,completed:SPM_RESOURCE_CONTEXT().completed,writes:SPM_QA.writes.length}));
   await p.locator('[data-daily-view="library"]').click();await p.locator('#spmVideoLibrary').waitFor();assert.equal(await p.locator('#spmVideoLibrary [data-key]').count(),12);checks++;
   for(const id of ['spmDesireLabEntry','spmBreathingLabEntry','spmSensateLabEntry','spmPelvicLabEntry','srHub']){assert.equal(await p.locator('#'+id).isVisible(),true);checks++;}
   if(primary==='desire'){
    // All twelve Library buttons must open the real matching asset. CI Chrome
    // also decodes and plays every video; opening one never completes a day.
    const catalog=await p.evaluate(()=>SPM_VIDEO_LIBRARY);
    for(const v of catalog){
     await p.locator(`#spmVideoLibrary [data-key="${v.key}"]`).click();await p.locator('#spmVideoModal.on').waitFor();
     assert.equal(await p.locator('#spmVpTitle').textContent(),v.title);assert.equal(await p.locator('#spmVpVideo').getAttribute('src'),v.url);checks+=2;
     const h264=await p.locator('#spmVpVideo').evaluate(v=>!!v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'));assert.ok(h264||!process.env.CI,'Chrome CI must verify all twelve videos');
     if(h264){await p.locator('#spmVpVideo').evaluate(v=>v.play());await p.waitForFunction(()=>document.querySelector('#spmVpVideo').currentTime>0);checks++;}
     await p.locator('.spmVpClose').click();
    }
   }
   assert.deepEqual(await p.evaluate(()=>({day:SPM_RESOURCE_CONTEXT().day,completed:SPM_RESOURCE_CONTEXT().completed,writes:SPM_QA.writes.length})),current);checks++;
   await p.locator('[data-daily-view="today"]').click();assert.equal(await p.locator('#spmDailySession').isVisible(),true);checks++;
   if(primary==='desire')await p.screenshot({path:'/tmp/spm-desire-resources-day1.png'});
   await finish(p);
  }
  // Desire's daily video is saved independently, survives a reload and handles
  // failure without losing the reflection or marking the main session complete.
  const desire=await pageFor('desire',1);
  await desire.locator('[data-daily-open="route-video-dr-low-desire"]').click();await desire.locator('[name=reflection]').fill('Reconozco cómo influye mi contexto en el deseo.');await desire.locator('[name=confirmed]').check();
  await desire.evaluate(()=>SPM_QA.failNext=true);await desire.locator('#spmDailyWorkspace button[type=submit]').click();await desire.getByText('No se pudo guardar. Conservamos tu respuesta; reintenta.',{exact:true}).waitFor();assert.equal(await desire.locator('[name=reflection]').inputValue(),'Reconozco cómo influye mi contexto en el deseo.');checks++;
  await desire.locator('#spmDailyWorkspace button[type=submit]').click();await desire.locator('[data-activity="route-video-dr-low-desire"] .spm-daily-saved').waitFor();assert.equal(await desire.locator('#spmDailyComplete').isDisabled(),true);checks++;
  await desire.reload();await desire.locator('#map.on').waitFor();await desire.locator('#goPlan').click();await desire.locator('#spmGoToday').click();await desire.locator('[data-activity="route-video-dr-low-desire"] .spm-daily-saved').waitFor();assert.equal(await desire.evaluate(()=>SPM_RESOURCE_CONTEXT().day),1);checks++;
  await finish(desire);
  // Mixed EP + Desire keeps EP's scheduled session and opens just the Desire
  // assignment for the same central day, never the full course or another route.
  const mixed=await pageFor('ejaculation',5);
  assert.equal(await mixed.evaluate(()=>SPM_DAILY_PRACTICE.assignments()[0].kind),'ejaculation');checks++;
  await mixed.evaluate(()=>SPM_QA.rows.activity_completions.push({user_id:'qa-user',plan_id:'qa-plan',day_number:1,module_key:'resource:desire_lab_state',metadata:{state:{'spm-desire-state':JSON.stringify({health:['none'],stimuli:['touch']})}}}));
  await mixed.locator('[data-daily-open="route-desire-5"]').click();const f=mixed.frameLocator('.spm-desire-modal iframe');await f.getByRole('heading',{name:'Mapa de aceleradores y frenos',exact:true}).waitFor();
  assert.equal(await mixed.evaluate(()=>SPM_DESIRE_LAB_HOST.getContext().day),5);assert.equal(await f.locator('.dz-tabs button').count(),1);assert.equal(await mixed.evaluate(()=>SPM_RESOURCE_CONTEXT().primary),'ejaculation');checks+=3;
  await mixed.locator('[data-desire-close]').click();await mixed.locator('.spm-desire-modal').waitFor({state:'detached'});await finish(mixed);
  const recovery=await pageFor('ejaculation',25);await recovery.locator('[data-daily-open="recovery-next"]').click();await recovery.locator('#srScenario .sr-scene').waitFor();assert.equal(await recovery.locator('[data-scenario="next"]').isVisible(),false);assert.equal(await recovery.evaluate(()=>SPM_RESOURCE_CONTEXT().day),25);checks+=2;await finish(recovery);
  console.log(`${checks} resource checks passed across all 168 route-days, mixed priorities, Library and persistence.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
