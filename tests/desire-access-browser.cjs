const { chromium, webkit } = require('playwright');
const assert=require('node:assert/strict');
// Exercise the historical Desire day-to-content mapping explicitly.
const base=process.env.SPM_TEST_BASE||'https://spm-premium-staging.vercel.app/premium-v2/';
(async()=>{
  const browser=process.env.SPM_BROWSER==='webkit'?await webkit.launch({headless:true}):await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox']});
  let failures=0;
  try {
    for(const day of [1,2,3,4,5,6,7,8]){
      const p=await browser.newPage({viewport:{width:390,height:844}});
      const errors=[],responses=[];
      p.on('pageerror',e=>errors.push('JS '+e.message));
      p.on('console',e=>{if(e.type()==='error')errors.push('CONSOLE '+e.text().slice(0,280))});
      p.on('response',r=>{if(r.status()>=400&&/desire|premium|live/.test(r.url()))responses.push(r.status()+' '+r.url().slice(-160))});
      try{
        const res=await p.goto(base+'revision-programas-28-dias.html?agenda=legacy&programa=desire&dia='+day,{waitUntil:'domcontentloaded',timeout:45000});
        await p.locator('#reviewProgram:not([disabled])').waitFor({timeout:50000});
        assert.equal(await p.evaluate(()=>window.SPM_RESOURCE_CONTEXT().scheduleVersion),'legacy');
        const initial=await p.evaluate(()=>{
          const ctx=window.SPM_RESOURCE_CONTEXT?.(),a=window.SPM_DAILY_PRACTICE?.assignments?.(ctx)?.find(x=>x.id==='main');
          return {lab:!!window.SPM_DESIRE_LAB,day1:!!window.SPM_DESIRE_DAY1_BRIDGE,day2:!!window.SPM_DESIRE_DAY2_BRIDGE,day3:!!window.SPM_DESIRE_DAY3_BRIDGE,week1:!!window.SPM_DESIRE_WEEK1_BRIDGE,week2:!!window.SPM_DESIRE_WEEK2_BRIDGE,records:!!window.SPM_DESIRE_RECORDS,reviewReady:window.SPM_PROGRAM_REVIEW?.ready,day:ctx?.day,assignment:a?.kind,active:window.SPM_DAILY_PRACTICE?.active?.()};
        });
        const action=p.locator('[data-daily-open="main"]');
        await action.waitFor({timeout:5000});
        await action.click();
        await p.waitForTimeout(1400);
        const after=await p.evaluate(()=>({
          roots:document.querySelectorAll('.spm-ds-week1-root iframe').length,
          week2:document.querySelectorAll('.spm-ds-week2-root iframe').length,
          desireModals:document.querySelectorAll('.spm-desire-modal[open]').length,
          status:document.querySelector('#spmDailyStatus')?.textContent?.slice(0,350),
          workspace:document.querySelector('#spmDailyWorkspace')?.innerHTML?.slice(0,450),
          active:window.SPM_DAILY_PRACTICE?.active?.(),
        }));
        if(day>=4&&day<=7&&after.roots===1){
          const f=p.frameLocator('.spm-ds-week1-root iframe').locator('#app');
          try {await f.locator('.custom-head,.art').first().waitFor({timeout:7000});}
          catch(e){after.frameFailure=String(e.message).slice(0,500);}
          after.frameText=(await f.innerText({timeout:4000}).catch(()=>'' )).slice(0,280);
        }
        if(day===8&&after.week2===1){
          const f=p.frameLocator('.spm-ds-week2-root iframe').locator('#app');
          try {await f.locator('.image-screen').waitFor({timeout:7000});}
          catch(e){after.frameFailure=String(e.message).slice(0,500);}
          after.frameText=(await f.innerText({timeout:4000}).catch(()=>'' )).slice(0,280);
        }
        const legacyCount=await p.locator('[data-ds'+day+'-page]').count();
        const ok=day===8?after.week2===1&&!after.frameFailure&&/Día 8/.test(after.frameText):day>=4&&day<=7?after.roots===1&&!after.frameFailure&&!/Recuperando tu práctica/.test(after.frameText):legacyCount>0;
        if(!ok)failures++;
        console.log(JSON.stringify({day,status:res.status(),ok,initial,after,errors:errors.slice(0,8),failed:responses.slice(0,8)}));
      }catch(e){failures++;console.log(JSON.stringify({day,FAIL:String(e.message).slice(0,850),errors:errors.slice(0,8),failed:responses.slice(0,8)}));}
      await p.close();
    }

    // Regression for the actual review workflow: select another program, then Deseo,
    // and open a session on the same page (not just a fresh link).
    for(const day of [1,4,6,7,8]){
      const p=await browser.newPage({viewport:{width:390,height:844}});
      const errors=[];p.on('pageerror',e=>errors.push(e.message));
      try{
        await p.goto(base+'revision-programas-28-dias.html?agenda=legacy&programa=erection&dia='+day,{waitUntil:'domcontentloaded'});
        await p.locator('#reviewProgram:not([disabled])').waitFor({timeout:50000});
        await p.locator('#reviewProgram').selectOption('desire');
        await p.waitForTimeout(500);
        const selection=await p.evaluate(()=>({context:SPM_RESOURCE_CONTEXT(),status:document.querySelector('#reviewStatus')?.textContent,program:document.querySelector('#reviewProgram')?.value,disabled:document.querySelector('#reviewProgram')?.disabled}));
        assert.equal(selection.context.scheduleVersion,'legacy');
        const button=p.locator('[data-daily-open="main"]');
        await button.waitFor({timeout:5000});await button.click();
        await p.waitForTimeout(900);
        if(day===8)await p.frameLocator('.spm-ds-week2-root iframe').locator('.pill').filter({hasText:'Día 8 · Deseo'}).waitFor({timeout:7000});
        const open=await p.evaluate(()=>({week:document.querySelectorAll('.spm-ds-week1-root iframe').length,week2:document.querySelectorAll('.spm-ds-week2-root iframe').length,first:document.querySelectorAll('[data-ds1-page],[data-ds2-page],[data-ds3-page]').length,modal:document.querySelectorAll('.spm-desire-modal[open]').length,workspace:document.querySelector('#spmDailyWorkspace')?.innerHTML?.slice(0,300),status:document.querySelector('#spmDailyStatus')?.textContent?.slice(0,200)}));
        const ok=selection.context?.primary==='desire'&&selection.program==='desire'&&(day===8?open.week2===1:day>=4&&day<=7?open.week===1:open.first===1);
        if(!ok)failures++;
        console.log(JSON.stringify({switchFrom:'erection',day,ok,selection,open,errors:errors.slice(0,4)}));
      }catch(e){failures++;console.log(JSON.stringify({switchFrom:'erection',day,FAIL:String(e.message).slice(0,700),errors}));}
      await p.close();
    }

    // A real user may open a practice in a different module before switching to Deseo.
    for(const previous of ['erection','wellbeing','ejaculation']){
      const p=await browser.newPage({viewport:{width:390,height:844}});
      const errors=[];p.on('pageerror',e=>errors.push(e.message));
      try{
        await p.goto(base+'revision-programas-28-dias.html?agenda=legacy&programa='+previous+'&dia=4',{waitUntil:'domcontentloaded'});
        await p.locator('#reviewProgram:not([disabled])').waitFor({timeout:50000});
        const b=p.locator('[data-daily-open="main"]');
        if(await b.count())await b.click();await p.waitForTimeout(400);
        const before=await p.evaluate(async()=>{const c=SPM_RESOURCE_CONTEXT();return{modal:document.querySelectorAll('dialog[open]').length,session:document.querySelector('#spmDailySession')?.innerHTML?.slice(0,90),records:await SPM_DAILY_RECORDS.read(c.userId+':'+c.planId,c.day)}});
        if(previous==='ejaculation'){
          // The native EP dialog must be dismissed before a person can use the
          // review controls underneath it. selectOption alone bypasses that UI.
          const practice=p.locator('dialog.ep-block[open]');await practice.waitFor();
          await p.keyboard.press('Escape');await practice.waitFor({state:'detached'});
          const returned=await p.evaluate(async()=>{const c=SPM_RESOURCE_CONTEXT();return{primary:c.primary,day:c.day,records:await SPM_DAILY_RECORDS.read(c.userId+':'+c.planId,c.day)}});
          assert.equal(returned.primary,previous);assert.equal(returned.day,4);
          assert.deepEqual(returned.records,before.records,'leaving the unfinished practice does not save or complete it');
        }
        await p.locator('#reviewProgram').selectOption('desire');
        await p.waitForFunction(()=>SPM_RESOURCE_CONTEXT().primary==='desire'&&SPM_RESOURCE_CONTEXT().day===4);
        const selection=await p.evaluate(()=>({context:SPM_RESOURCE_CONTEXT(),program:document.querySelector('#reviewProgram')?.value,status:document.querySelector('#reviewStatus')?.textContent}));
        assert.equal(selection.context.scheduleVersion,'legacy');
        assert.equal(selection.program,'desire');
        await p.locator('[data-daily-open="main"]').click();
        await p.waitForTimeout(700);
        const ok=selection.context?.primary==='desire'&&await p.locator('.spm-ds-week1-root iframe').count()===1;
        if(!ok)failures++;
        console.log(JSON.stringify({switchAfterPractice:previous,ok,before,selection,errors:errors.slice(0,3)}));
      }catch(e){failures++;console.log(JSON.stringify({switchAfterPractice:previous,FAIL:String(e.message).slice(0,800),errors}));}
      await p.close();
    }
    console.log('Access smoke failed days: '+failures);
  } finally {await browser.close();}
  if(failures)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
