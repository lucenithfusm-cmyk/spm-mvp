const { chromium } = require('playwright');
const base=process.env.SPM_TEST_BASE||'https://spm-premium-staging.vercel.app/premium-v2/';
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox']});
  let failures=0;
  try {
    for(const day of [1,2,3,4,5,6,7,8]){
      const p=await browser.newPage({viewport:{width:390,height:844}});
      const errors=[],responses=[];
      p.on('pageerror',e=>errors.push('JS '+e.message));
      p.on('console',e=>{if(e.type()==='error')errors.push('CONSOLE '+e.text().slice(0,280))});
      p.on('response',r=>{if(r.status()>=400&&/desire|premium|live/.test(r.url()))responses.push(r.status()+' '+r.url().slice(-160))});
      try{
        const res=await p.goto(base+'revision-programas-28-dias.html?programa=desire&dia='+day,{waitUntil:'domcontentloaded',timeout:45000});
        await p.locator('#reviewProgram:not([disabled])').waitFor({timeout:50000});
        const initial=await p.evaluate(()=>{
          const ctx=window.SPM_RESOURCE_CONTEXT?.(),a=window.SPM_DAILY_PRACTICE?.assignments?.(ctx)?.find(x=>x.id==='main');
          return {lab:!!window.SPM_DESIRE_LAB,day1:!!window.SPM_DESIRE_DAY1_BRIDGE,day2:!!window.SPM_DESIRE_DAY2_BRIDGE,day3:!!window.SPM_DESIRE_DAY3_BRIDGE,week1:!!window.SPM_DESIRE_WEEK1_BRIDGE,records:!!window.SPM_DESIRE_RECORDS,reviewReady:window.SPM_PROGRAM_REVIEW?.ready,day:ctx?.day,assignment:a?.kind,active:window.SPM_DAILY_PRACTICE?.active?.()};
        });
        const action=p.locator('[data-daily-open="main"]');
        await action.waitFor({timeout:5000});
        await action.click();
        await p.waitForTimeout(1400);
        const after=await p.evaluate(()=>({
          roots:document.querySelectorAll('.spm-ds-week1-root iframe').length,
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
        const legacyCount=await p.locator('[data-ds'+day+'-page]').count();
        const ok=day>=4&&day<=7?after.roots===1&&!after.frameFailure&&!/Recuperando tu práctica/.test(after.frameText):after.desireModals===1||legacyCount>0;
        if(!ok)failures++;
        console.log(JSON.stringify({day,status:res.status(),ok,initial,after,errors:errors.slice(0,8),failed:responses.slice(0,8)}));
      }catch(e){failures++;console.log(JSON.stringify({day,FAIL:String(e.message).slice(0,850),errors:errors.slice(0,8),failed:responses.slice(0,8)}));}
      await p.close();
    }
    console.log('Access smoke failed days: '+failures);
  } finally {await browser.close();}
  if(failures)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
