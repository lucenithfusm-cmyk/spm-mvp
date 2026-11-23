// Run while serving the repository at 127.0.0.1:4173. Synthetic patients only.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
 let checks=0;const errors=[];
 const scripts=['pelvic-guidance-v1.js','checkpoint-audio-v1.js','daily-support-plan-v1.js','spm-video-library.js','program-videos-v1.js','ejaculatory-control.js','desire-lab-bridge-v1.js','breathing-lab-bridge-v1.js','sensate-lab-bridge-v1.js'];
 const html=`<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"></head><body><h1>Datos ficticios</h1><section id="plan"><div class="dayCard"><span class="dayNum">10</span><div class="dayBody"></div></div></section><script>window.testContext={userId:'test',planId:'plan1',day:10,primary:'erection',secondary:'desire',motives:['erection','desire'],answers:{},safety:'none',flags:[],completed:[],checkins:[]};window.SPM_RESOURCE_CONTEXT=()=>testContext;window.testWrites=[];window.testState={};window.sensateState={};window.failSave=false;window.SPM_BREATHING_RECORDS={read:async()=>testState,save:async(state,scope,day)=>{if(failSave)throw Error('offline');testState=state;testWrites.push({state,scope,day});}};window.SPM_SENSATE_RECORDS={read:async()=>sensateState,save:async(state,scope,day)=>{sensateState=state;testWrites.push({state,scope,day});}};window.SPM_DESIRE_RECORDS={read:async()=>({}),save:async()=>{}};localStorage.setItem('spm_ec_intro_heard','1');localStorage.setItem('spmb-step','17');</script>${scripts.map(s=>`<script src="${s}"></script>`).join('')}</body></html>`;
 const create=async width=>{const page=await browser.newPage({viewport:{width,height:950},ignoreHTTPSErrors:true});page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));await page.route('**/__breathing-review.html',r=>r.fulfill({body:html,contentType:'text/html'}));await page.goto('http://127.0.0.1:4173/premium-v2/__breathing-review.html');return page;};
 const frame=async(page,lab)=>{await page.locator(`.spm-${lab}-modal iframe`).waitFor();return (await page.locator(`.spm-${lab}-modal iframe`).elementHandle()).contentFrame();};
 const day=async(page,n)=>page.evaluate(n=>{testContext.day=n;document.querySelector('.dayNum').textContent=n;dispatchEvent(new Event('spm:resourcecontext'));},n);
 const close=async(page,lab)=>page.evaluate(lab=>window['SPM_'+lab.toUpperCase()+'_LAB'].close(),lab);
 const noHeaderVoice=async f=>{assert.equal(await f.locator('.bl-top .bl-voice-toggle,.bl-top .bl-voice-play,.bl-top .bl-audio,.bl-top [aria-label="Activar audio"],.bl-top [aria-label="Silenciar audio"],.bl-top [aria-label="Escuchar explicación de esta pantalla"]').count(),0);checks++;};
 const routeStage=async(f,n)=>{await f.locator(`.bl-route-shell[data-route-stage="${n}"]`).waitFor();assert.equal((await f.locator('.bl-counter').textContent()).replace(/\s/g,''),n+'/4');checks++;await noHeaderVoice(f);};
 const continueRoute=async(f,n)=>{await f.locator('.bl-route-footer').getByRole('button',{name:'Continuar',exact:true}).click();await routeStage(f,n);};
 const reachPractice=async f=>{await routeStage(f,1);for(let n=2;n<=4;n++)await continueRoute(f,n);await f.locator('.bl-pacer').waitFor();};
 const playingRecording=async(f,src)=>{
  await f.waitForFunction(src=>{const audio=document.querySelector('audio[data-breath-audio]');return audio?.getAttribute('src')===src&&!audio.paused&&!audio.muted&&audio.volume>0&&audio.currentTime>0;},src);
  checks++;
 };
 const startNarration=async(f,src,label='Escuchar explicación')=>{
  await f.locator('.bl-route-main').getByRole('button',{name:label,exact:true}).click();await playingRecording(f,src);
  const button=f.locator('.bl-route-main .bl-audio[aria-pressed="true"]:visible');assert.equal(await button.count(),1);assert.match((await button.textContent()).trim(),/^Detener/);checks+=2;
 };
 const stopNarration=async(f,label='Escuchar explicación')=>{
  await f.locator('.bl-route-main .bl-audio[aria-pressed="true"]:visible').click();
  await f.waitForFunction(()=>document.querySelector('audio[data-breath-audio]')?.paused===true);
  assert.equal(await f.locator('.bl-route-main .bl-audio[aria-pressed="true"]:visible').count(),0);assert.equal(await f.locator('.bl-route-main').getByRole('button',{name:label,exact:true}).getAttribute('aria-pressed'),'false');checks+=2;
 };
 const verifyNarration=async(f,src,label)=>{await startNarration(f,src,label);await stopNarration(f,label);};
 const verifyIllustrationMotion=async(f,{automatic=false}={})=>{
  if(automatic){
   await f.locator('.bl-pattern-visual').scrollIntoViewIfNeeded();
   await f.waitForFunction(()=>{
    const visual=document.querySelector('.bl-pattern-visual'),image=visual?.querySelector('.bl-pattern-original');
    if(!visual||!image?.complete||image.naturalWidth<=0)return false;
    const r=visual.getBoundingClientRect(),width=Math.max(0,Math.min(r.right,innerWidth)-Math.max(r.left,0)),height=Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(r.top,0));
    return r.width>0&&r.height>0&&width*height/(r.width*r.height)>=.5;
   });checks++;
  }
  await f.locator('.bl-pattern-guide[data-running="true"]').waitFor();assert.equal(await f.locator('.bl-pattern-toggle').count(),0);checks++;
  const zone=f.locator('.bl-pattern-moving-zone');assert.equal(await zone.evaluate(el=>getComputedStyle(el).animationPlayState),'running');assert.equal(await zone.evaluate(el=>getComputedStyle(el).animationIterationCount),'1');
  const initial=await zone.evaluate(el=>getComputedStyle(el).transform);await f.waitForFunction(initial=>getComputedStyle(document.querySelector('.bl-pattern-moving-zone')).transform!==initial,initial);checks+=3;
 };
 const finishIllustration=async f=>{
  await f.locator('.bl-pattern-guide[data-running="false"]').waitFor({timeout:6000});
  const zone=f.locator('.bl-pattern-moving-zone');assert.equal(await zone.evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
  const stable=await zone.evaluate(el=>new Promise(resolve=>{const before=getComputedStyle(el).transform;requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(getComputedStyle(el).transform===before)));}));assert.equal(stable,true);checks+=2;
 };
 const verifyPattern=async(f,mode,file)=>{
  await f.getByRole('button',{name:mode==='chest'?'Torácica · pecho':'Diafragmática · abdomen',exact:true}).click();
  const guide=f.locator(`.bl-pattern-guide[data-mode="${mode}"]`);await guide.waitFor();
  await f.locator(`.bl-pattern-guide[data-mode="${mode}"][data-running="true"]`).waitFor();assert.equal(await guide.locator('.bl-pattern-original').getAttribute('src'),'./media/'+file);
  await verifyIllustrationMotion(f);
  await guide.locator('.bl-pattern-original').evaluate(img=>img.decode());checks+=2;
  await playingRecording(f,'audio/comparison-'+mode+'-20261123.mp3');assert.equal(await f.locator('audio[data-breath-audio]').count(),1);checks++;
 };
 for(const width of [390,768,1440]){
  const page=await create(width);const before=await page.evaluate(()=>JSON.stringify(testContext));
  await page.locator('[data-breathing-daily]').click();let f=await frame(page,'breathing');
  await f.locator('.bl-route-shell[data-route-assignment="breath-two"]').waitFor();await routeStage(f,1);assert.equal(await f.getByRole('button',{name:'Abrir índice',exact:true}).count(),0);assert.equal(await f.locator('.bl-pacer').count(),0);checks+=2;
  const fullViewport=await page.evaluate(()=>{const r=document.querySelector('.spm-breathing-modal[open]').getBoundingClientRect();return Math.abs(r.left)<1&&Math.abs(r.top)<1&&Math.abs(r.width-innerWidth)<1&&Math.abs(r.height-innerHeight)<1;});assert.equal(fullViewport,true);
  const filledFrame=await f.evaluate(()=>{const r=document.querySelector('.bl-route-shell').getBoundingClientRect(),root=document.documentElement;return Math.abs(r.width-root.clientWidth)<2&&r.height>=innerHeight-1&&root.scrollWidth<=innerWidth+2;});assert.equal(filledFrame,true);checks+=2;
  for(let stage=2;stage<=4;stage++){await continueRoute(f,stage);if(stage<4)assert.equal(await f.locator('.bl-pacer').count(),0);if(stage===3)await f.locator('[data-daily-assignment]').waitFor();}checks+=2;
  await f.locator('.bl-anatomy[data-visual-state="ready"]').waitFor();const video=f.locator('.bl-anatomy video');assert.match(await video.getAttribute('src'),/\.mp4/);checks++;
  const geometry=await f.evaluate(()=>{const a=document.querySelector('.bl-halo-wrap').getBoundingClientRect(),b=document.querySelector('.bl-anatomy').getBoundingClientRect();return {side:a.right<=b.left+1,overflow:document.documentElement.scrollWidth>innerWidth+2};});assert.equal(geometry.side,true);assert.equal(geometry.overflow,false);checks+=2;
  await f.getByRole('button',{name:'Iniciar',exact:true}).click();await f.waitForFunction(()=>document.querySelector('.bl-anatomy video').currentTime>2.5&&document.querySelector('.bl-anatomy video').videoWidth>0);checks++;
  await f.locator('.bl-pacer').scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/daily-breathing-${width}.png`});
  await f.getByRole('button',{name:'Ya realicé la práctica · Registrar',exact:true}).click();await f.locator('.bl-pacer[data-running="false"]').waitFor();
  await page.evaluate(()=>failSave=true);await f.getByRole('button',{name:'Guardar registro',exact:true}).click();await f.getByRole('alert').filter({hasText:'No se pudo guardar'}).waitFor();checks++;
  await page.evaluate(()=>failSave=false);await f.getByRole('button',{name:'Guardar registro',exact:true}).click();await f.getByRole('button',{name:'Guardado en tu programa',exact:true}).waitFor();
  const records=await page.evaluate(()=>JSON.parse(testState['spmb-sessions']));assert.equal(records.length,1);assert.equal(records[0].day,10);assert.equal(await page.evaluate(()=>JSON.stringify(testContext)),before);assert.ok(await page.evaluate(()=>testWrites.every(x=>x.scope==='test:plan1'&&x.day===10)));checks+=4;
  await f.getByRole('button',{name:'Volver a Hoy',exact:true}).click();await page.locator('.spm-breathing-modal').waitFor({state:'detached'});checks++;
  await day(page,3);await page.evaluate(()=>SPM_BREATHING_LAB.open({origin:'dailyPlan'}));f=await frame(page,'breathing');await f.locator('.bl-route-shell[data-route-assignment="breath-learn"]').waitFor();await routeStage(f,1);
  assert.equal(await f.locator('.bl-pacer').count(),0);assert.equal(await f.locator('.bl-pattern-guide').getAttribute('data-running'),'false');assert.equal(await f.locator('.bl-pattern-toggle').count(),0);checks+=3;
  await verifyNarration(f,'./media/screen.02.mp3');
  await verifyPattern(f,'diaphragm','respiracion-diafragmatica-premium.jpg');
  await verifyPattern(f,'chest','respiracion-toracica-premium.jpg');
  await verifyPattern(f,'diaphragm','respiracion-diafragmatica-premium.jpg');await finishIllustration(f);
  await continueRoute(f,2);assert.equal(await f.locator('.bl-pacer').count(),0);await verifyNarration(f,'./media/screen.03.mp3');await f.getByRole('button',{name:'Abdomen',exact:true}).click();assert.equal(await f.getByRole('button',{name:'Abdomen',exact:true}).getAttribute('aria-pressed'),'true');await f.getByRole('status').filter({hasText:'Observa cómo sube y baja la mano del abdomen'}).waitFor();checks+=3;
  await continueRoute(f,3);await f.locator('[data-daily-assignment]').waitFor();assert.equal(await f.locator('.bl-pacer').count(),0);assert.match(await f.locator('.bl-route-media video').getAttribute('src'),/Audio_Corregido/);await f.locator('.bl-route-media video').evaluate(v=>v.play());await f.waitForFunction(()=>document.querySelector('.bl-route-media video').currentTime>0);checks+=3;
  await startNarration(f,'./media/screen.04.mp3','Escuchar el recordatorio');assert.equal(await f.locator('.bl-route-media video').evaluate(video=>video.paused),true);checks++;await stopNarration(f,'Escuchar el recordatorio');
  assert.equal(await page.evaluate(()=>JSON.parse(testState['spmb-sessions']).length),1,'preparation does not create an extra breathing session');checks++;
  await continueRoute(f,4);await f.locator('.bl-pacer').waitFor();await verifyNarration(f,'audio/daily-instructions-4-6-20261113.mp3','Escuchar instrucción');assert.equal(await f.locator('.bl-pacer-heading b').textContent(),'4·6');assert.equal(await f.getByRole('button',{name:'Siguiente',exact:true}).count(),0);checks+=2;await close(page,'breathing');
  await day(page,6);await page.evaluate(()=>SPM_BREATHING_LAB.open({origin:'dailyPlan'}));f=await frame(page,'breathing');await f.locator('.bl-route-shell[data-route-assignment="breath-release"]').waitFor();await routeStage(f,1);await verifyNarration(f,'./media/screen.07.mp3');
  await continueRoute(f,2);await verifyIllustrationMotion(f,{automatic:true});await verifyNarration(f,'./media/screen.06.mp3');await finishIllustration(f);assert.equal(await f.locator('.bl-pacer').count(),0);checks++;
  await continueRoute(f,3);await verifyIllustrationMotion(f,{automatic:true});await verifyNarration(f,'./media/screen.10.mp3','Escuchar el recordatorio');
  assert.equal(await f.getByRole('heading',{name:'Acomódate antes de empezar',exact:true}).count(),0);
  const preparation=f.getByRole('button',{name:'Escuchar audio para acomodarte',exact:true});assert.equal((await preparation.textContent()).trim(),'Escuchar audio');assert.equal(await preparation.locator('..').locator('details').getAttribute('open'),null);
  const preparationBelow=await preparation.evaluate(button=>document.querySelector('.bl-pattern-guide').getBoundingClientRect().bottom<=button.getBoundingClientRect().top+1);assert.equal(preparationBelow,true);checks+=4;
  await verifyNarration(f,'audio/prepare-comfort-20261123.mp3','Escuchar audio para acomodarte');await finishIllustration(f);await continueRoute(f,4);await verifyNarration(f,'audio/daily-instructions-flexible-20261113.mp3','Escuchar instrucción');
  await f.locator('.bl-route-library').getByRole('button',{name:'Ver señales de seguridad',exact:true}).click();await verifyNarration(f,'./media/screen.17.mp3');await close(page,'breathing');
  await page.locator('[data-breathing-guided]').click();f=await frame(page,'breathing');await f.locator('.bl-pacer').waitFor();await noHeaderVoice(f);await f.getByRole('button',{name:'Abrir índice',exact:true}).click();assert.equal(await f.locator('.bl-drawer li').count(),18);checks++;await close(page,'breathing');
  await day(page,12);await page.evaluate(()=>SPM_BREATHING_LAB.open({origin:'dailyPlan'}));f=await frame(page,'breathing');await f.locator('.bl-route-shell[data-daily-journey="education"]').waitFor();await noHeaderVoice(f);await f.getByRole('heading',{name:'Explora la respiración con calma',exact:true}).waitFor();await f.getByRole('status').filter({hasText:'Hoy no tienes una sesión de respiración asignada'}).waitFor();assert.equal(await f.locator('.bl-pacer').count(),0);assert.equal(await f.getByRole('button',{name:'Continuar',exact:true}).count(),0);checks+=2;await close(page,'breathing');
  await page.evaluate(()=>SPM_SENSATE_LAB.open({origin:'dailyPlan'}));f=await frame(page,'sensate');await f.locator('[data-daily-assignment]').waitFor();assert.equal((await f.locator('.sf-count').textContent()).replace(/\s/g,''),'1/1');assert.equal(await f.getByRole('heading',{name:'Biblioteca',exact:true}).count(),0);checks+=2;
  await f.getByRole('button',{name:'Guardar y volver a Hoy',exact:true}).click();await page.locator('.spm-sensate-modal').waitFor({state:'detached'});assert.equal(await page.evaluate(()=>JSON.parse(sensateState['spm-sensate-records']).at(-1).practiceId),'sf-solo');assert.equal(await page.evaluate(()=>testContext.completed.length),0);checks+=2;
  await day(page,8);await page.evaluate(()=>SPM_SENSATE_LAB.open({origin:'dailyPlan'}));f=await frame(page,'sensate');await f.locator('[data-daily-assignment]').waitFor();for(let i=0;i<3;i++)await f.getByRole('button',{name:'Continuar →',exact:true}).click();assert.equal(await f.getByRole('button',{name:'Iniciar guía',exact:true}).count(),0);assert.equal(await f.getByRole('button',{name:'Continuar →',exact:true}).isDisabled(),true);checks+=2;
  await f.getByRole('checkbox',{name:/Ambos deseamos/}).check();await f.getByRole('button',{name:'Iniciar guía',exact:true}).click();for(let i=0;i<5;i++)await f.getByRole('button',{name:'Siguiente fase',exact:true}).click();await f.getByRole('button',{name:'Continuar →',exact:true}).click();await f.getByRole('button',{name:'Guardar y volver a Hoy',exact:true}).click();await page.locator('.spm-sensate-modal').waitFor({state:'detached'});assert.equal(await page.evaluate(()=>JSON.parse(sensateState['spm-sensate-records']).at(-1).completed),true);checks++;
  await day(page,19);await page.evaluate(()=>SPM_SENSATE_LAB.open({origin:'dailyPlan'}));f=await frame(page,'sensate');await f.locator('[data-daily-assignment]').waitFor();await f.getByRole('checkbox',{name:/Ambos deseamos/}).check();assert.equal(await f.getByRole('button',{name:/Elegir Focus II/}).count(),0);await f.getByRole('button',{name:'Elegir preparación individual',exact:true}).click();assert.equal((await f.locator('.sf-count').textContent()).replace(/\s/g,''),'1/2');checks+=2;await close(page,'sensate');
  await page.evaluate(()=>sensateState['spm-sensate-records']=JSON.stringify([{practiceId:'sf-focus-1',completed:true,partnerComfort:8,pressureAfter:2,recommendation:'progress'}]));await page.evaluate(()=>SPM_SENSATE_LAB.open({origin:'dailyPlan'}));f=await frame(page,'sensate');await f.locator('[data-daily-assignment]').waitFor();assert.equal(await f.getByRole('button',{name:/Elegir Focus II/}).count(),0);await f.getByRole('checkbox',{name:/Ambos deseamos/}).check();await f.getByRole('button',{name:/Elegir Focus II/}).click();for(let i=0;i<2;i++)await f.getByRole('button',{name:'Continuar →',exact:true}).click();await f.getByRole('heading',{name:'Focalización sensorial II · progresión opcional'}).waitFor();checks+=2;await close(page,'sensate');
  await page.close();
 }
 const page=await create(390);await day(page,1);
 // Exercise the real checkpoint controller with a local recording; no dependency on HeyGen availability.
 await page.evaluate(()=>{const guide=SPM_PELVIC_GUIDANCE.firstPractice();SPM_PELVIC_GUIDANCE.firstPractice=()=>({...guide,audioSrc:new URL('breathing-lab/media/screen.07.mp3',location.href).href});return SPM_BREATHING_LAB.open({origin:'dailyPlan'});});
 let f=await frame(page,'breathing');await routeStage(f,1);await f.locator('.spm-first-breath-audio').waitFor();assert.equal(await f.locator('.bl-route-main .bl-audio:visible').count(),0);checks++;
 const firstGuideAudio=await f.locator('.spm-first-breath-audio audio').elementHandle();await f.locator('.spm-first-breath-audio [data-checkpoint-audio-toggle]').click();await f.waitForFunction(()=>{const audio=document.querySelector('.spm-first-breath-audio audio');return audio&&!audio.paused&&audio.currentTime>0;});
 await continueRoute(f,2);assert.equal(await firstGuideAudio.evaluate(audio=>audio.paused&&audio.currentTime===0),true);assert.equal(await f.locator('.spm-first-breath-audio').count(),0);checks+=2;await startNarration(f,'./media/screen.06.mp3');
 await f.locator('.bl-route-footer').getByRole('button',{name:'Atrás',exact:true}).click();await routeStage(f,1);await f.waitForFunction(()=>document.querySelector('audio[data-breath-audio]')?.paused===true);await f.locator('.spm-first-breath-audio').waitFor();assert.equal(await f.locator('.spm-first-breath-audio audio').evaluate(audio=>audio.paused),true);checks++;await close(page,'breathing');assert.equal(await page.evaluate(()=>testWrites.length),0);checks++;
 await day(page,10);await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-breathing-daily]').click();f=await frame(page,'breathing');await f.locator('.bl-pattern-guide[data-reduced-motion="true"][data-running="false"]').waitFor();await f.getByRole('button',{name:'Torácica · pecho',exact:true}).click();await f.locator('.bl-pattern-guide[data-mode="chest"][data-reduced-motion="true"][data-running="false"]').waitFor();assert.equal(await f.locator('.bl-pattern-moving-zone').evaluate(el=>getComputedStyle(el).animationName),'none');checks++;await routeStage(f,1);await continueRoute(f,2);assert.equal(await f.locator('.bl-pattern-guide').getAttribute('data-running'),'false');assert.equal(await f.locator('.bl-pattern-moving-zone').evaluate(el=>getComputedStyle(el).animationName),'none');checks+=2;await continueRoute(f,3);await continueRoute(f,4);await f.locator('.bl-anatomy[data-visual-state="static"]').waitFor();await f.getByRole('button',{name:'Activar video de guía'}).click();await f.locator('.bl-anatomy[data-visual-state="ready"]').waitFor();checks++;await close(page,'breathing');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.route('**/respiracion-anatomica*',r=>r.abort());await page.locator('[data-breathing-daily]').click();f=await frame(page,'breathing');await reachPractice(f);await f.locator('.bl-anatomy[data-visual-state="error"] img').waitFor();await f.getByRole('button',{name:'Reintentar video'}).waitFor();assert.equal(await f.locator('.bl-pacer').count(),1);checks++;await close(page,'breathing');await page.unroute('**/respiracion-anatomica*');
 await page.evaluate(()=>{testContext.safety='review';return SPM_BREATHING_LAB.open({origin:'dailyPlan'});});f=await frame(page,'breathing');await routeStage(f,1);for(let stage=2;stage<=4;stage++)await continueRoute(f,stage);await f.getByText(/Tu programa requiere revisión/).waitFor();assert.equal(await f.locator('.bl-pacer').count(),0);assert.equal(await f.locator('.bl-route-instructions .bl-audio').count(),0);checks+=2;await close(page,'breathing');
 await browser.close();assert.deepEqual(errors,[]);console.log(`${checks} checks passed: content narration without header speakers, narrated comparison tabs, brief automatic illustrations, preparation audio, exclusive first-day guide, four daily stages, full viewport, daily isolation, 3 viewports, real video playback, save retry, consent, library and safety.`);
})().catch(e=>{console.error(e);process.exit(1)});
