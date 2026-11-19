// SPM Desire week 2 · real mobile browser smoke test using synthetic local state.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base=process.env.SPM_TEST_BASE||'http://127.0.0.1:4173/premium-v2/desire-week2-v1/';
(async()=>{
 const browser=process.env.SPM_BROWSER==='webkit'
  ?await webkit.launch({headless:true})
  :await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Capture the device-voice requests while exercising the real touch controls.
 // Keep speech active until cancel() so quick switches can expose overlapping audio.
 await page.addInitScript(()=>{
  const speech=window.__spmSpeech={spoken:[],events:[],active:null,cancels:0};
  Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class{constructor(text){this.text=text}}});
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
   getVoices:()=>[],
   cancel(){speech.cancels++;speech.events.push({type:'cancel',active:speech.active});speech.active=null},
   speak(utterance){speech.events.push({type:'speak',activeBefore:speech.active,text:utterance.text});speech.spoken.push(utterance.text);speech.active=utterance.text}
  }});
 });
 const speechState=()=>page.evaluate(()=>window.__spmSpeech);
 const config={
 8:{field:'stimulus',value:'music'},
 9:{field:'channel',value:'tactile'},
 10:{field:'idea',value:'escuchar'},
 11:{field:'pleasant',value:'rest'},
 };
 let screens=0,audioOptions=0;
 try{
  await page.goto(base+'index.html',{waitUntil:'domcontentloaded',timeout:25000});
  await page.locator('.daycard').first().waitFor();
  assert.equal(await page.locator('.daycard').count(),7);
  for(let day=8;day<=14;day++){
   await page.locator('.daycard[data-day="'+day+'"]').click();
   await page.locator('.pill').waitFor();
   assert.match(await page.locator('.pill').innerText(),new RegExp('Día '+day));
   const choice=config[day];
   if(day<14){
    await page.locator('.image-screen img').waitFor();
    const loaded=await page.locator('.image-screen img').evaluate(img=>img.complete&&img.naturalWidth>0);
    assert.equal(loaded,true,'original approved image for day '+day+' loads');
    const guideButton=page.locator('.image-screen .hit.audio');
    assert.equal(await guideButton.count(),1);
    const beforeGuide=await speechState();
    await guideButton.click();
    const afterGuide=await speechState(),guide=afterGuide.spoken.at(-1);
    assert.equal(afterGuide.spoken.length,beforeGuide.spoken.length+1,'guide responds to its own button');
    assert(guide.length>40,'the full initial guide remains available');
    const initialSentence=guide.split(/[.!?]/)[0].trim();
    const optionIds=await page.locator('.image-screen .hit.select').evaluateAll(nodes=>nodes.map(node=>node.dataset.value));
    assert(optionIds.length>0);
    const optionLines=[];
    // A curious user tries every option while the previous narration is active.
    for(const id of optionIds){
     const card=page.locator('.image-screen .hit.select[data-value="'+id+'"]');
     const before=await speechState();
     await card.click();
     assert.equal(await card.getAttribute('aria-pressed'),'true');
     const after=await speechState(),line=after.spoken.at(-1);
     assert.equal(after.spoken.length,before.spoken.length+1,'one audio message per selection');
     assert(!line.includes(initialSentence),'day '+day+' option '+id+' must not repeat the initial instruction');
     assert(line.trim().split(/\s+/).length<=30,'option narration stays brief');
     assert(!optionLines.includes(line),'each option on day '+day+' contributes its own message');
     assert(after.cancels>before.cancels,'changing options stops the previous narration');
     assert.equal(after.events.at(-1).activeBefore,null,'new narration starts after prior speech is canceled');
     optionLines.push(line);audioOptions++;
    }
    for(const id of optionIds){
     const card=page.locator('.image-screen .hit.select[data-value="'+id+'"]');
     const before=await speechState();
     await card.click();
     const after=await speechState();
     assert.equal(await card.getAttribute('aria-pressed'),'false');
     assert.equal(after.spoken.length,before.spoken.length,'deselecting an option is silent');
     assert(after.cancels>before.cancels,'deselecting stops narration');
     assert.equal(after.active,null);
    }
    for(let repeat=0;repeat<2;repeat++){
     const before=await speechState();
     await guideButton.click();
     const after=await speechState();
     assert.equal(after.spoken.length,before.spoken.length+1,'initial guide remains manually repeatable');
     assert.equal(after.spoken.at(-1),guide,'manual replay preserves the complete initial guide');
    }
    await page.locator('.nav [data-act="next"]').click();
    await page.locator('.custom-head').waitFor();
    if(choice)await page.locator('[data-act="select"][data-field="'+choice.field+'"][data-value="'+choice.value+'"]').click();
    if(day===12)await page.locator('input[data-field="moment"]').fill('Mañana con privacidad');
    if(day===13)await page.locator('textarea[data-field="memory1"]').fill('Una conversación tranquila');
    await page.locator('.nav [data-act="next"]').click();
    await page.locator('.custom-head').waitFor();
    assert.equal(await page.locator('.nav .count').innerText(),'3 / 3');
    await page.locator('.nav [data-act="next"]').click();
    await page.locator('.daycard').first().waitFor();
    assert.equal(await page.locator('.daycard[data-day="'+day+'"] small').innerText(),'✓ Registro local de revisión guardado');
   } else {
    assert.equal(await page.locator('.image-screen').count(),0,'day 14 begins with reflection, not deceptive 100% image');
    await page.locator('textarea[data-field="good"]').fill('Aprendí a darme tiempo');
    await page.locator('.nav [data-act="next"]').click();
    await page.locator('[data-act="checkpoint"]').waitFor();
    await page.locator('[data-act="checkpoint"]').click();
    await page.locator('.nav [data-act="next"]').click();
    await page.locator('.image-screen').waitFor();
    assert.equal(await page.locator('.image-screen .demo-badge').count(),1,'week 2 completion visual remains illustrative until official checkpoint');
    await page.locator('.topbar [data-act="home"]').click();
    await page.locator('.daycard').first().waitFor();
   }
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3);
   assert.equal(overflow,false,'no horizontal scrolling');
   screens++;
  }
  assert.deepEqual(errors,[],'no uncaught JS browser errors');
  console.log(JSON.stringify({result:'PASS',browser:process.env.SPM_BROWSER||'chrome',mobileDays:screens,images:6,audioOptions,checkpoint:'independent',browserErrors:errors.length}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
