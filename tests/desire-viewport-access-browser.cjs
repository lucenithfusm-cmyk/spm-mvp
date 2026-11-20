// Mobile regression for the real reviewed Desire entry. Synthetic review-only state.
// It catches a screen mounted below the activity cards but never scrolled into view.
const {chromium,webkit}=require('playwright');
const base=process.env.SPM_TEST_BASE||'http://127.0.0.1:4173/premium-v2/';
(async()=>{
 const browser=process.env.SPM_BROWSER==='webkit'?await webkit.launch({headless:true}):await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox']});
 let failed=0;
 try{
 for(const day of Array.from({length:14},(_,i)=>i+1)){
  const p=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  try{
   await p.goto(base+'revision-programas-28-dias.html?programa=desire&dia='+day,{waitUntil:'domcontentloaded',timeout:30000});
   await p.locator('#reviewProgram:not([disabled])').waitFor({timeout:30000});
   const trigger=p.locator('#spmDailySession [data-daily-open="main"]');
   await trigger.waitFor({timeout:10000});
   await trigger.click();
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
   const result=await p.evaluate(selector=>{
     const node=document.querySelector(selector),rect=node?.getBoundingClientRect();
     const active=document.querySelector('#spmDailyWorkspace');
     return {scrollY:window.scrollY,innerHeight:window.innerHeight,rectTop:Math.round(rect?.top??-1),rectBottom:Math.round(rect?.bottom??-1),workTop:Math.round(active?.getBoundingClientRect().top??-1),activeElement:document.activeElement?.id,day:window.SPM_RESOURCE_CONTEXT?.().day,legacy:document.querySelectorAll('.spm-desire-modal[open]').length};
   },selector);
   if(day===8){
    // Reopening must attach to the current workspace, including after the
    // frame's home action rebuilds Today. While full-screen, Today is covered:
    // exercise duplicate activation through the same public launcher used by
    // its button; never force a click through the active practice. After exit,
    // reopen through the visible Today button. No patient account is involved.
    for(const mode of ['while-open','after-frame-home']){
     const previousSrc=await p.locator(selector).getAttribute('src');
     if(mode==='after-frame-home'){
      await p.frameLocator(selector).locator('.topbar [data-act="home"]').click();
      await p.locator(selector).waitFor({state:'detached',timeout:10000});
      await p.locator('#spmDailySession [data-daily-open="main"]').click();
     }else{
      await p.evaluate(()=>window.SPM_DAILY_PRACTICE.launch('main'));
     }
     await p.waitForFunction(({selector,previousSrc})=>{
      const frame=document.querySelector(selector);
      return frame&&frame.getAttribute('src')!==previousSrc;
     },{selector,previousSrc},{timeout:10000});
     const content=p.frameLocator(selector);
     await content.locator('.pill').filter({hasText:'Día 8 · Deseo'}).waitFor({timeout:10000});
     await content.locator('.image-screen').waitFor({state:'visible'});
     await p.waitForFunction(selector=>{
      const rect=document.querySelector(selector)?.getBoundingClientRect();
      return rect&&rect.top>=-30&&rect.top<window.innerHeight*.6&&rect.bottom>0;
     },selector,{timeout:5000});
     const reopened=await p.evaluate(selector=>({
      frames:document.querySelectorAll('.spm-ds-week2-root iframe').length,
      roots:document.querySelectorAll('.spm-ds-week2-root').length,
      legacy:document.querySelectorAll('.spm-desire-modal[open]').length,
      day:window.SPM_RESOURCE_CONTEXT?.().day,
      active:window.SPM_DAILY_PRACTICE.active?.()
     }),selector);
     if(reopened.frames!==1||reopened.roots!==1||reopened.legacy!==0||reopened.day!==day||reopened.active?.day!==day||reopened.active?.id!=='main'){
      throw Error('Reopening left a duplicate, detached or stale daily session: '+JSON.stringify(reopened));
     }
     console.log(JSON.stringify({day,reopen:mode,ready:true,visible:true}));
    }
   }
   const ok=!errors.length&&result.day===day&&result.legacy===0&&result.rectTop>=-30&&result.rectTop<Math.round(result.innerHeight*.6)&&result.rectBottom>0;
   if(!ok)failed++;
   console.log(JSON.stringify({day,ok,...result,errors:errors.slice(0,4)}));
  }catch(e){failed++;console.log(JSON.stringify({day,FAIL:String(e.message).slice(0,600),errors:errors.slice(0,4)}));}
  await p.close();
 }
 }finally{await browser.close();}
 if(failed){console.error('VISIBLE ACCESS FAILURES: '+failed);process.exitCode=1}else console.log('PASS mobile Desire opening and viewport visibility days 1-14');
})().catch(e=>{console.error(e);process.exitCode=1});
