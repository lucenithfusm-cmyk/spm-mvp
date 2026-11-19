const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base='http://127.0.0.1:4173/premium-v2/';
const fixture=fs.readFileSync(path.join(__dirname,'support/daily-fixture.js'),'utf8');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox']});
 let failed=0;
 try{
  for(const day of [1,2,3,4,5,6,7,8]){
   const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(d=>window.SPM_QA_CONFIG={primary:'desire',day:d},day);
   await page.route('**/npm/@supabase/supabase-js@2',route=>route.fulfill({body:fixture,contentType:'text/javascript'}));
   try{
    await page.goto(base+'live.html',{waitUntil:'domcontentloaded',timeout:30000});
    await page.locator('#map.on').waitFor({timeout:25000});
    await page.locator('#goPlan').click();
    const button=page.locator('[data-desire-daily]').first();
    await button.waitFor({timeout:15000});
    await button.click();
    await sleep(900);
    const check=await page.evaluate(()=>({
     context:window.SPM_RESOURCE_CONTEXT?.(),
     dailyView:document.querySelector('#plan')?.dataset.spmDailyView,
     hasCalendarApi:typeof window.SPM_DAILY_PRACTICE?.openDesireFromCalendar==='function',
     first:document.querySelectorAll('#spmDailyWorkspace [data-ds1-page],#spmDailyWorkspace [data-ds2-page],#spmDailyWorkspace [data-ds3-page]').length,
     week1:document.querySelectorAll('#spmDailyWorkspace .spm-ds-week1-root iframe').length,
     legacy:document.querySelectorAll('.spm-desire-modal[open]').length,
     status:document.querySelector('#spmDailyStatus')?.textContent?.slice(0,300)
    }));
    let text='';
    if(day>=4&&day<=7&&check.week1){
      try{text=(await page.frameLocator('.spm-ds-week1-root iframe').locator('#app').innerText({timeout:5000})).slice(0,150);}catch(e){errors.push('iframe '+e.message.slice(0,100));}
    }
    const ok=check.dailyView==='today'&&check.context?.day===day&&check.hasCalendarApi&&(day<=3?check.first===1:day<=7?check.week1===1:check.legacy===1)&&!errors.length;
    if(!ok)failed++;
    console.log(JSON.stringify({day,ok,check,frameText:text,errors}));
   }catch(e){failed++;console.error(JSON.stringify({day,FAIL:e.message.slice(0,650),errors}));}
   await page.close();
  }
 }finally{await browser.close();}
 assert.equal(failed,0,'La entrada de Deseo desde el calendario falló en '+failed+' día(s)');
 console.log('PASS calendar direct entry into Desire days 1–8 with synthetic data; other modules untouched.');
})().catch(e=>{console.error(e);process.exitCode=1});
