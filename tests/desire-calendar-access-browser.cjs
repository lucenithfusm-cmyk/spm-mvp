const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict');
// These calendar cards use the historical Desire day-to-content mapping.
const base=process.env.SPM_TEST_BASE||'http://127.0.0.1:4173/premium-v2/';
(async()=>{
 const browser=process.env.SPM_BROWSER==='webkit'?await webkit.launch({headless:true}):await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox']});
 let failed=0;
 try{
  for(const day of Array.from({length:14},(_,i)=>i+1)){
   const p=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];
   p.on('pageerror',e=>errors.push(e.message));
   p.on('console',e=>{if(e.type()==='error')errors.push(e.text().slice(0,220))});
   try{
    await p.goto(base+'revision-programas-28-dias.html?agenda=legacy&programa=desire&dia='+day,{waitUntil:'domcontentloaded',timeout:30000});
    await p.locator('#reviewProgram:not([disabled])').waitFor({timeout:30000});
    assert.equal(await p.evaluate(()=>window.SPM_RESOURCE_CONTEXT().scheduleVersion),'legacy');
    // Reproduce the existing calendar card markup injected by app-live.js,
    // keeping the reviewer scoped to an isolated fake account.
    await p.evaluate(()=>{
      const d=window.SPM_RESOURCE_CONTEXT().day,card=document.createElement('div');
      card.className='dayCard';card.innerHTML='<div class="dayTop"><div class="dayNum">'+d+'</div></div><div class="dayBody"></div>';
      document.querySelector('#plan').appendChild(card);
      window.dispatchEvent(new Event('spm:resourcecontext'));
    });
    const trigger=p.locator('.dayCard [data-desire-daily]');
    await trigger.waitFor({state:'attached',timeout:5000});
    // The synthetic .dayCard is not within a visually expanded calendar panel
    // in the standalone reviewer. Trigger the real button event programmatically.
    await trigger.evaluate(el=>el.click());
    const selector=day<=3?'#spmDailyWorkspace [data-ds'+day+'-page]':day<=7?'#spmDailyWorkspace .spm-ds-week1-root':'#spmDailyWorkspace .spm-ds-week2-root iframe';
    await p.locator(selector).waitFor({state:'visible',timeout:10000});
    if(day>=8){
     const content=p.frameLocator(selector);
     await content.locator('.pill').filter({hasText:'Día '+day+' · Deseo'}).waitFor({timeout:10000});
     await content.locator(day===14?'.custom-head':'.image-screen').waitFor({state:'visible'});
    }
    await p.waitForFunction(selector=>{
     const rect=document.querySelector(selector)?.getBoundingClientRect();
     return rect&&rect.top>=-30&&rect.top<window.innerHeight*.6&&rect.bottom>0;
    },selector,{timeout:5000});
    const check=await p.evaluate(selector=>({
      day:window.SPM_RESOURCE_CONTEXT().day,
      view:document.querySelector('#plan')?.dataset.spmDailyView,
      hasApi:typeof window.SPM_DAILY_PRACTICE?.openDesireFromCalendar==='function',
      direct:document.querySelectorAll('#spmDailyWorkspace [data-ds1-page],#spmDailyWorkspace [data-ds2-page],#spmDailyWorkspace [data-ds3-page]').length,
      week1:document.querySelectorAll('#spmDailyWorkspace .spm-ds-week1-root iframe').length,
      week2:document.querySelectorAll('#spmDailyWorkspace .spm-ds-week2-root iframe').length,
      legacy:document.querySelectorAll('.spm-desire-modal[open]').length,
      rectTop:Math.round(document.querySelector(selector)?.getBoundingClientRect().top??-1),
      rectBottom:Math.round(document.querySelector(selector)?.getBoundingClientRect().bottom??-1),
      innerHeight:window.innerHeight,
      status:document.querySelector('#spmDailyStatus')?.textContent?.slice(0,180)
    }),selector);
    const visible=check.rectTop>=-30&&check.rectTop<Math.round(check.innerHeight*.6)&&check.rectBottom>0;
    const ok=check.day===day&&check.view==='today'&&check.hasApi&&(day<=3?check.direct===1:day<=7?check.week1===1:check.week2===1)&&check.legacy===0&&visible&&errors.length===0;
    if(!ok)failed++;
    console.log(JSON.stringify({day,ok,check,errors:errors.slice(0,4)}));
   }catch(e){failed++;console.error(JSON.stringify({day,FAIL:e.message.slice(0,500),errors:errors.slice(0,4)}));}
   await p.close();
  }
 }finally{await browser.close();}
 assert.equal(failed,0,'Calendario → Deseo: '+failed+' fallos');
 console.log('PASS calendario sintético → Deseo 1–14, con botón, puente y visibilidad reales.');
})().catch(e=>{console.error(e);process.exitCode=1});
