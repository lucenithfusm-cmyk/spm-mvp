const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const fixture=fs.readFileSync(path.join(__dirname,'support/daily-fixture.js'),'utf8');
const base=process.env.SPM_TEST_BASE||'http://127.0.0.1:4173/premium-v2/';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});let checks=0;const routes={};
 try{
 for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
  const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(c=>window.SPM_QA_CONFIG=c,{primary,day:1});await p.route('**/npm/@supabase/supabase-js@2',r=>r.fulfill({body:fixture,contentType:'text/javascript'}));
  await p.goto(base+'live.html'+(process.env.SPM_TEST_QUERY||''));await p.locator('#map.on').waitFor();await p.locator('#goPlan').click();await p.locator('#spmGoToday').click();
  const rows=await p.evaluate(()=>{const c=SPM_RESOURCE_CONTEXT();return Array.from({length:28},(_,i)=>({day:i+1,base:SPM_DAILY_PRACTICE.assignments({...c,day:i+1,secondary:null,motives:[c.primary]}),withDesire:SPM_DAILY_PRACTICE.assignments({...c,day:i+1})}));});routes[primary]=rows;
  for(const row of rows){
   assert.equal(row.base.filter(a=>a.kind==='wellness').length,1);assert.equal(new Set(row.base.map(a=>a.id)).size,row.base.length);assert.ok(row.withDesire.length<=5);checks+=3;
  }
  const stories=rows.flatMap(r=>r.base.filter(a=>a.kind==='recovery').map(a=>({day:r.day,...a})));
  assert.equal(stories.length,7);assert.equal(new Set(stories.map(a=>a.scenario)).size,7);checks+=2;
  if(['erection','ejaculation'].includes(primary))for(let week=0;week<4;week++){
   const days=rows.slice(week*7,week*7+7);assert.equal(days.filter(r=>r.base.some(a=>a.kind==='pelvic')).length,2);checks++;
   if(primary==='ejaculation'){assert.equal(days.filter(r=>r.base.some(a=>a.kind==='ejaculation')).length,3);assert.ok(days.every(r=>!r.base.some(a=>a.kind==='pelvic')||!r.base.some(a=>a.kind==='ejaculation')));checks+=2;}
  }
  // Open every assigned story and verify the rendered avatar narrative, not a text worksheet.
  for(const a of stories){
   await p.evaluate(day=>{const previous=SPM_RESOURCE_CONTEXT;window.SPM_RESOURCE_CONTEXT=()=>({...previous(),day});window.dispatchEvent(new Event('spm:resourcecontext'));SPM_DAILY_PRACTICE.open();},a.day);
   await p.locator(`[data-daily-open="${a.id}"]`).click();
   await p.locator(`#srScenario [data-spm-patient-scenario="${a.scenario}"]`).waitFor();
   assert.ok(await p.locator('#srScenario .spm-v4-card').count()>=3);assert.equal(await p.locator('[data-scenario]:visible').count(),0);checks+=2;
   await p.locator('[data-sr-close]').click();
  }
  assert.deepEqual(errors,[]);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);assert.equal(await p.evaluate(()=>SPM_QA.writes.filter(w=>w.table!=='profiles').length),0);checks+=3;
  await p.close();
 }
 if(process.env.SPM_CALENDAR_EXPORT)fs.writeFileSync(process.env.SPM_CALENDAR_EXPORT,JSON.stringify(routes,null,2));
 console.log(`${checks} cadence checks passed: six routes, seven distinct real stories each, pelvic 2/week, EP 3/week, alternation and zero writes.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
