// Mobile regression for the real reviewed Desire entry. Synthetic review-only state.
// It catches a screen mounted below the activity cards but never scrolled into view.
const {chromium,webkit}=require('playwright');
const base=process.env.SPM_TEST_BASE||'http://127.0.0.1:4173/premium-v2/';
(async()=>{
 const browser=process.env.SPM_BROWSER==='webkit'?await webkit.launch({headless:true}):await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox']});
 let failed=0;
 try{
 for(const day of [1,2,3,4,5,6,7,8]){
  const p=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  try{
   await p.goto(base+'revision-programas-28-dias.html?programa=desire&dia='+day,{waitUntil:'domcontentloaded',timeout:30000});
   await p.locator('#reviewProgram:not([disabled])').waitFor({timeout:30000});
   const trigger=p.locator('#spmDailySession [data-daily-open="main"]');
   await trigger.waitFor({timeout:10000});
   await trigger.click();
   const selector=day<=3?'#spmDailyWorkspace [data-ds'+day+'-page]':day<=7?'#spmDailyWorkspace .spm-ds-week1-root':'.spm-desire-modal[open]';
   await p.locator(selector).waitFor({state:'visible',timeout:10000});
   await p.waitForTimeout(200);
   const result=await p.evaluate(selector=>{
     const node=document.querySelector(selector),rect=node?.getBoundingClientRect();
     const active=document.querySelector('#spmDailyWorkspace');
     return {scrollY:window.scrollY,innerHeight:window.innerHeight,rectTop:Math.round(rect?.top??-1),rectBottom:Math.round(rect?.bottom??-1),workTop:Math.round(active?.getBoundingClientRect().top??-1),activeElement:document.activeElement?.id,day:window.SPM_RESOURCE_CONTEXT?.().day};
   },selector);
   const ok=!errors.length&&result.day===day&&(day===8||result.rectTop>=-30&&result.rectTop<Math.round(result.innerHeight*.6)&&result.rectBottom>0);
   if(!ok)failed++;
   console.log(JSON.stringify({day,ok,...result,errors:errors.slice(0,4)}));
  }catch(e){failed++;console.log(JSON.stringify({day,FAIL:String(e.message).slice(0,600),errors:errors.slice(0,4)}));}
  await p.close();
 }
 }finally{await browser.close();}
 if(failed){console.error('VISIBLE ACCESS FAILURES: '+failed);process.exitCode=1}else console.log('PASS mobile Desire opening and viewport visibility days 1-8');
})().catch(e=>{console.error(e);process.exitCode=1});
