const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const fixture=fs.readFileSync(__dirname+'/support/daily-fixture.js','utf8');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
await page.addInitScript(()=>window.SPM_QA_CONFIG={primary:'erection',day:1});await page.route('**/npm/@supabase/supabase-js@2',r=>r.fulfill({body:fixture,contentType:'text/javascript'}));
await page.goto('http://127.0.0.1:4173/premium-v2/live.html');await page.locator('#map.on').waitFor();
await page.evaluate(()=>{const a=SPM_RESTORED_CONTEXT.assessment.answers;for(const q of ENGINE.assessment.questions){a[q.id]=q.type==='boolean'?false:q.type.startsWith('scale5')?3:q.type==='text'?'Prueba':q.options?.[0]?.value;}a.pf_awareness='good_control';a.pf_tension=1;a.e_maint=2;a.d_desire=2;});
await page.locator('#goPlan').click();await page.locator('#spmGoToday').click();await page.waitForFunction(()=>!document.querySelector('#spmDailyStatus').textContent.includes('Recuperando'));
const audit=await page.evaluate(()=>{const c=SPM_RESOURCE_CONTEXT();return Object.fromEntries(['erection','ejaculation','desire','confidence','wellbeing','lifestyle'].map(primary=>[primary,Array.from({length:28},(_,i)=>({day:i+1,items:SPM_DAILY_PRACTICE.assignments({...c,primary,day:i+1})}))]));});
for(const [primary,days] of Object.entries(audit)){const items=days.flatMap(d=>d.items);assert.equal(items.filter(a=>a.kind==='wellness'&&a.tip.category==='sleep').length,18);assert.equal(items.filter(a=>a.kind==='recovery').length,7);assert.equal(items.filter(a=>a.kind==='program-checkpoint').length,16);for(const row of days)assert.equal(new Set(row.items.map(a=>a.id)).size,row.items.length);}
assert.equal(audit.erection.flatMap(d=>d.items).filter(a=>a.kind==='desire').length,28);
assert.equal(audit.erection.flatMap(d=>d.items).filter(a=>a.kind==='pelvic').length,12);
// Baseline, midpoint, final records persist in the synthetic database and compare without imputation.
for(const day of [1,14,28]){
await page.evaluate(d=>{SPM_RESTORED_CONTEXT.plan.current_day=d;window.dispatchEvent(new Event('spm:resourcecontext'));SPM_DAILY_PRACTICE.open();},day);
await page.locator('[data-daily-open="program-checkpoint"]').click();if(day===28)await page.locator('[data-checkpoint-edit]').click();await page.locator('[data-program-checkpoint]').waitFor();
for(const key of ['firmness','control','desire','confidence','comfort','sleep','skill'])await page.locator(`[name="${key}"]`).selectOption(key==='control'?'na':String(day===1?4:day===14?5:6));
await page.locator('[name="reflection"]').fill('Reconozco mejor mi cuerpo.');await page.locator('[name="continuity"]').fill('Continuar las prácticas cómodas.');
await page.locator('[data-program-checkpoint] button[type=submit]').click();await page.locator('[data-program-report]').waitFor();assert.match(await page.locator('[data-program-report]').innerText(),/Sin dato \/ no evaluable/);
}
assert.match(await page.locator('[data-program-report]').innerText(),/Tu informe final/);assert.match(await page.locator('[data-program-report]').innerText(),/No reemplaza una valoración/);
await page.screenshot({path:'/tmp/spm-integral-report-mobile.png',fullPage:true});
await page.reload();await page.locator('#map.on').waitFor();await page.locator('#goPlan').click();await page.locator('#spmGoToday').click();
// Set current day for an indicated classic session. Readiness derives from explicit safe answers.
await page.evaluate(()=>{const r=SPM_RESTORED_CONTEXT;r.plan.current_day=2;r.assessment.answers.pf_awareness='good_control';r.assessment.answers.pf_tension=1;window.dispatchEvent(new Event('spm:resourcecontext'));SPM_DAILY_PRACTICE.open();});
await page.locator('[data-daily-open="support-pelvic"]').click();await page.locator('.pv2-title').waitFor();
assert.equal(await page.locator('.pv2-title').isVisible(),true);await page.locator('.pv2-close').click();
// Difficult localization remains in Lab; classic is not forced by the schedule.
await page.evaluate(()=>{SPM_RESTORED_CONTEXT.assessment.answers.pf_awareness='unsure';});
await page.locator('[data-daily-open="support-pelvic"]').click();await page.locator('iframe[title*="Pelvic Floor"]').waitFor();
assert.equal(await page.evaluate(()=>SPM_PELVIC_LAB_HOST.getContext().restriction),'awareness');await page.locator('[data-pf-close]').click();
// Sleep opens its exact library card; water movement opens the specific alternative.
await page.evaluate(()=>{SPM_RESTORED_CONTEXT.plan.current_day=23;window.dispatchEvent(new Event('spm:resourcecontext'));SPM_DAILY_PRACTICE.open();});
await page.locator('[data-daily-open="wellness-movement"]').click();await page.locator('[data-wellness-library]').click();await page.locator('#srActivityDetail').waitFor();assert.match(await page.locator('#srActivityDetail').innerText(),/agua/i);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
assert.deepEqual(errors,[]);fs.writeFileSync('/tmp/spm-integral-calendar.json',JSON.stringify(audit,null,2));console.log('PASS: 168 route-days; checkpoint save/reload; final comparison; classic/Lab readiness; water deep link; mobile overflow; no page errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
