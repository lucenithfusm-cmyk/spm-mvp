// Run while serving the repository at 127.0.0.1:4173. Synthetic patients only.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('../labs/breathing/node_modules/typescript');
const content={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../labs/breathing/src/lib/breath-data.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,content);
const approvedText=Object.fromEntries([
 ...require('../labs/breathing/src/assets/audio/daily-instructions-manifest.json').entries.map(({id,text})=>[id,text]),
 ...require('../labs/breathing/src/assets/audio/practical-guidance-manifest.json').entries.map(({id,text})=>[id,text]),
 ...content.exports.trainerLines.map((text,index)=>['screen.'+String(index+1).padStart(2,'0'),text]),
]);
function installSensateDailyFixture(){
 const clone=value=>JSON.parse(JSON.stringify(value));
 const state=window.testSensateDaily={rows:{},writes:[],failRead:false};
 const context=()=>window.SPM_RESOURCE_CONTEXT();
 const assignment=(c=context())=>{const a=window.SPM_DAILY_SUPPORT.activity('sensate',Number(c.day),c);return a?{...a,kind:'sensate'}:null;};
 const verify=(scope,day)=>{const c=context();if(scope!==c.userId+':'+c.planId||Number(day)!==Number(c.day))throw Error('Daily fixture context changed');};
 window.SPM_DAILY_RECORDS={read:async(scope,day)=>{
  verify(scope,day);if(state.failRead)throw Error('Daily progress unavailable');
  return clone(state.rows[scope]?.[day]||{});
 }};
 window.SPM_DAILY_PRACTICE={
  contentAssignment:(kind,c)=>kind==='sensate'?assignment(c):null,
  assignments:()=>{const a=assignment();return a?[a]:[];},
  active:()=>null,
  saveActivity:async(id,data,scope,day)=>{
   verify(scope,day);const a=assignment();
   if(!a||a.id!==id||data?.confirmed!==true||data.source!=='sensate-lab')throw Error('Invalid daily Sensate confirmation');
   const scopeRows=state.rows[scope]??={};const rows=scopeRows[day]??={};
   const row={completed:true,data:clone(data)};rows[id]=row;
   state.writes.push({id,data:clone(data),scope,day});return clone(row);
  }
 };
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
 let checks=0;const errors=[];
 const scripts=['device-voice-v1.js','practice-audio-v1.js','pelvic-guidance-v1.js','checkpoint-audio-v1.js','daily-support-plan-v1.js','spm-video-library.js','program-videos-v1.js','ejaculatory-control.js','desire-lab-bridge-v1.js','breathing-lab-bridge-v1.js','sensate-lab-bridge-v1.js'];
 const html=`<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"></head><body><h1>Datos ficticios</h1><section id="plan"><div class="dayCard"><span class="dayNum">10</span><div class="dayBody"></div></div></section><script>window.testContext={userId:'test',planId:'plan1',day:10,scheduleVersion:'legacy',primary:'erection',secondary:'desire',motives:['erection','desire'],answers:{},safety:'none',flags:[],completed:[],checkins:[]};window.SPM_RESOURCE_CONTEXT=()=>testContext;window.testWrites=[];window.testState={};window.sensateState={};window.failSave=false;window.SPM_BREATHING_RECORDS={read:async()=>testState,save:async(state,scope,day)=>{if(failSave)throw Error('offline');testState=state;testWrites.push({state,scope,day});}};window.SPM_SENSATE_RECORDS={read:async()=>sensateState,save:async(state,scope,day)=>{sensateState=state;testWrites.push({state,scope,day});}};window.SPM_DESIRE_RECORDS={read:async()=>({}),save:async()=>{}};localStorage.setItem('spm_ec_intro_heard','1');localStorage.setItem('spmb-step','17');</script>${scripts.map(s=>`<script src="${s}"></script>`).join('')}</body></html>`;
 const create=async width=>{
  const page=await browser.newPage({viewport:{width,height:950},ignoreHTTPSErrors:true});page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  // Observe native speech requests from real controls. This does not claim audible
  // playback: keep each utterance active until the real coordinator cancels it.
  await page.addInitScript(()=>{
   const speech=window.__spmSpeech={spoken:[],events:[],active:null,cancels:0};
   Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class{constructor(text){this.text=text;}}});
   Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
    paused:false,getVoices:()=>[],addEventListener(){},resume(){this.paused=false;},
    cancel(){speech.cancels++;speech.events.push({type:'cancel',active:speech.active});speech.active=null;},
    speak(utterance){speech.events.push({type:'speak',activeBefore:speech.active,text:utterance.text});speech.spoken.push(utterance.text);speech.active=utterance.text;queueMicrotask(()=>utterance.onstart?.());}
   }});
  });
  await page.route('**/__breathing-review.html',r=>r.fulfill({body:html,contentType:'text/html'}));await page.goto('http://127.0.0.1:4173/premium-v2/__breathing-review.html');return page;
 };
 const frame=async(page,lab)=>{await page.locator(`.spm-${lab}-modal iframe`).waitFor();return (await page.locator(`.spm-${lab}-modal iframe`).elementHandle()).contentFrame();};
 const day=async(page,n)=>page.evaluate(n=>{testContext.day=n;document.querySelector('.dayNum').textContent=n;dispatchEvent(new Event('spm:resourcecontext'));},n);
 const close=async(page,lab)=>page.evaluate(lab=>window['SPM_'+lab.toUpperCase()+'_LAB'].close(),lab);
 const noHeaderVoice=async f=>{assert.equal(await f.locator('.bl-top .bl-voice-toggle,.bl-top .bl-voice-play,.bl-top .bl-audio,.bl-top [aria-label="Activar audio"],.bl-top [aria-label="Silenciar audio"],.bl-top [aria-label="Escuchar explicación de esta pantalla"]').count(),0);checks++;};
 const routeStage=async(f,n)=>{await f.locator(`.bl-route-shell[data-route-stage="${n}"]`).waitFor();assert.equal((await f.locator('.bl-counter').textContent()).replace(/\s/g,''),n+'/4');checks++;await noHeaderVoice(f);};
 const continueRoute=async(f,n)=>{await f.locator('.bl-route-footer').getByRole('button',{name:'Continuar',exact:true}).click();await routeStage(f,n);};
 const reachPractice=async f=>{await routeStage(f,1);for(let n=2;n<=4;n++)await continueRoute(f,n);await f.locator('.bl-pacer').waitFor();};
 const playingVoiceText=async(f,text)=>{
  assert.ok(text,'expected approved narration text');
  await f.waitForFunction(expected=>{
   const speech=window.top.__spmSpeech,full=document.querySelector('[data-voice-text]')?.textContent;
   return window.SPM_VOICE?.state==='playing'&&speech.active&&expected.replace(/\s+/g,' ').trim().startsWith(speech.active)&&full===expected;
  },text);
  assert.equal(await f.locator('audio[data-breath-audio]').count(),0,'narration uses device voice');
  assert.equal(await f.evaluate(()=>window.top.__spmSpeech.events.filter(e=>e.type==='speak').every(e=>e.activeBefore===null)),true,'previous narration stops before another starts');
  checks+=3;
 };
 const playingVoice=async(f,id)=>playingVoiceText(f,approvedText[id]);
 const voiceStopped=async f=>f.waitForFunction(()=>window.top.__spmSpeech.active===null&&!window.SPM_VOICE.speaking);
 const startNarration=async(f,id,label='Escuchar explicación')=>{
  const before=await f.evaluate(()=>window.top.__spmSpeech.spoken.length);
  await f.locator('.bl-route-main').getByRole('button',{name:label,exact:true}).click();await playingVoice(f,id);
  assert.equal(await f.evaluate(()=>window.top.__spmSpeech.spoken.length),before+1,'the listening button starts the narration');checks++;
  const button=f.locator('.bl-route-main .bl-audio[aria-pressed="true"]:visible');assert.equal(await button.count(),1);assert.match((await button.textContent()).trim(),/^Detener/);checks+=2;
 };
 const stopNarration=async(f,label='Escuchar explicación')=>{
  await f.locator('.bl-route-main .bl-audio[aria-pressed="true"]:visible').click();
  await voiceStopped(f);
  assert.equal(await f.locator('.bl-route-main .bl-audio[aria-pressed="true"]:visible').count(),0);assert.equal(await f.locator('.bl-route-main').getByRole('button',{name:label,exact:true}).getAttribute('aria-pressed'),'false');checks+=2;
 };
 const verifyNarration=async(f,id,label)=>{await startNarration(f,id,label);await stopNarration(f,label);};
 const verifyIllustrationMotion=async(f,{automatic=false}={})=>{
  if(automatic){
   await f.locator('.bl-pattern-visual').scrollIntoViewIfNeeded();
   await f.waitForFunction(()=>{
    const visual=document.querySelector('.bl-pattern-visual'),image=visual?.querySelector('.bl-pattern-original');
    if(!visual||!image?.complete||image.naturalWidth<=0)return false;
    const footer=document.querySelector('.bl-route-footer'),visibleBottom=footer?Math.min(innerHeight,footer.getBoundingClientRect().top):innerHeight;
    const r=visual.getBoundingClientRect(),width=Math.max(0,Math.min(r.right,innerWidth)-Math.max(r.left,0)),height=Math.max(0,Math.min(r.bottom,visibleBottom)-Math.max(r.top,0));
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
  await playingVoice(f,'comparison.'+mode);
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
  await verifyNarration(f,'screen.02');
  await verifyPattern(f,'diaphragm','respiracion-diafragmatica-premium.jpg');
  await verifyPattern(f,'chest','respiracion-toracica-premium.jpg');
  await verifyPattern(f,'diaphragm','respiracion-diafragmatica-premium.jpg');await finishIllustration(f);
  await continueRoute(f,2);assert.equal(await f.locator('.bl-pacer').count(),0);await verifyNarration(f,'screen.03');await f.getByRole('button',{name:'Abdomen',exact:true}).click();assert.equal(await f.getByRole('button',{name:'Abdomen',exact:true}).getAttribute('aria-pressed'),'true');await f.getByRole('status').filter({hasText:'Observa cómo sube y baja la mano del abdomen'}).waitFor();checks+=3;
  await continueRoute(f,3);await f.locator('[data-daily-assignment]').waitFor();assert.equal(await f.locator('.bl-pacer').count(),0);assert.match(await f.locator('.bl-route-media video').getAttribute('src'),/Audio_Corregido/);await f.locator('.bl-route-media video').evaluate(v=>v.play());await f.waitForFunction(()=>document.querySelector('.bl-route-media video').currentTime>0);checks+=3;
  await startNarration(f,'screen.04','Escuchar el recordatorio');assert.equal(await f.locator('.bl-route-media video').evaluate(video=>video.paused),true);checks++;await stopNarration(f,'Escuchar el recordatorio');
  assert.equal(await page.evaluate(()=>JSON.parse(testState['spmb-sessions']).length),1,'preparation does not create an extra breathing session');checks++;
  await continueRoute(f,4);await f.locator('.bl-pacer').waitFor();await verifyNarration(f,'instruction.daily.4-6','Escuchar instrucción');assert.equal(await f.locator('.bl-pacer-heading b').textContent(),'4·6');assert.equal(await f.getByRole('button',{name:'Siguiente',exact:true}).count(),0);checks+=2;await close(page,'breathing');
  await day(page,6);await page.evaluate(()=>SPM_BREATHING_LAB.open({origin:'dailyPlan'}));f=await frame(page,'breathing');await f.locator('.bl-route-shell[data-route-assignment="breath-release"]').waitFor();await routeStage(f,1);await verifyNarration(f,'screen.07');
  await continueRoute(f,2);await verifyIllustrationMotion(f,{automatic:true});await verifyNarration(f,'screen.06');await finishIllustration(f);assert.equal(await f.locator('.bl-pacer').count(),0);checks++;
  await continueRoute(f,3);await verifyIllustrationMotion(f,{automatic:true});await verifyNarration(f,'screen.10','Escuchar el recordatorio');
  assert.equal(await f.getByRole('heading',{name:'Acomódate antes de empezar',exact:true}).count(),0);
  const preparation=f.getByRole('button',{name:'Escuchar audio para acomodarte',exact:true});assert.equal((await preparation.textContent()).trim(),'Escuchar audio');assert.equal(await preparation.locator('..').locator('details').getAttribute('open'),null);
  const preparationBelow=await preparation.evaluate(button=>document.querySelector('.bl-pattern-guide').getBoundingClientRect().bottom<=button.getBoundingClientRect().top+1);assert.equal(preparationBelow,true);checks+=4;
  await verifyNarration(f,'instruction.prepare','Escuchar audio para acomodarte');await finishIllustration(f);await continueRoute(f,4);await verifyNarration(f,'instruction.daily.flexible','Escuchar instrucción');
  await f.locator('.bl-route-library').getByRole('button',{name:'Ver señales de seguridad',exact:true}).click();await verifyNarration(f,'screen.17');await close(page,'breathing');
  await page.locator('[data-breathing-guided]').click();f=await frame(page,'breathing');await f.locator('.bl-pacer').waitFor();await noHeaderVoice(f);await f.getByRole('button',{name:'Abrir índice',exact:true}).click();assert.equal(await f.locator('.bl-drawer li').count(),18);checks++;await close(page,'breathing');
  await day(page,12);await page.evaluate(()=>SPM_BREATHING_LAB.open({origin:'dailyPlan'}));f=await frame(page,'breathing');await f.locator('.bl-route-shell[data-daily-journey="education"]').waitFor();await noHeaderVoice(f);await f.getByRole('heading',{name:'Explora la respiración con calma',exact:true}).waitFor();await f.getByRole('status').filter({hasText:'Hoy no tienes una sesión de respiración asignada'}).waitFor();assert.equal(await f.locator('.bl-pacer').count(),0);assert.equal(await f.getByRole('button',{name:'Continuar',exact:true}).count(),0);checks+=2;await close(page,'breathing');
  // The shipped tactile Focus I lessons teach now and preserve an unperformed
  // intimate practice as null. The retired React tutorial is not this route.
  // This isolated host supplies the daily contracts consulted before any save.
  await page.evaluate(installSensateDailyFixture);
  for(const [scheduledDay,session] of [[12,3],[8,2]]){
   await day(page,scheduledDay);const prior=await page.evaluate(()=>JSON.parse(sensateState['spm-sensate-records']||'[]').length);
   await page.evaluate(()=>SPM_SENSATE_LAB.open({origin:'dailyPlan'}));f=await frame(page,'sensate');
   const art='.spm-s'+session+'-artwork-screen';await f.locator(art).waitFor();
   assert.equal(await f.getByRole('heading',{name:'Biblioteca',exact:true}).count(),0);checks++;
   for(let screen=1;screen<=4;screen++){
    assert.match(await f.locator(art).getAttribute('aria-label'),new RegExp('pantalla '+screen+' de 4'));checks++;
    if(screen<4)await f.locator('[data-act="next"]:visible').click();
   }
   assert.equal(await f.locator('[data-act="startguide"]').count(),0,'learning does not pretend to start an intimate practice');
   assert.equal(await page.evaluate(()=>JSON.parse(sensateState['spm-sensate-records']||'[]').length),prior,'navigation alone never records completion');checks+=2;
   if(session===3){
    await page.evaluate(()=>{testSensateDaily.failRead=true;});await f.locator('[data-act="save"]:visible').click();
    await f.getByRole('alert').filter({hasText:'No pude comprobar si la actividad estaba guardada'}).waitFor();
    assert.equal(await page.evaluate(()=>JSON.parse(sensateState['spm-sensate-records']||'[]').length),prior);
    assert.equal(await page.evaluate(()=>testSensateDaily.writes.length),0);
    assert.equal(await page.locator('.spm-sensate-modal').isVisible(),true);checks+=3;
    await page.evaluate(()=>{testSensateDaily.failRead=false;});
   }
   // Saving returns to Hoy through the real host and removes this iframe.
   // Assert the durable result, not the transient overlay inside that frame.
   await f.locator('[data-act="save"]:visible').click();await page.locator('.spm-sensate-modal').waitFor({state:'detached'});
   const saved=await page.evaluate(()=>JSON.parse(sensateState['spm-sensate-records']||'[]'));
   assert.equal(saved.length,prior+1,'explicit save writes exactly one learning record');checks++;
   const record=saved.at(-1);
   assert.equal(record.practiceId,'sf-i-'+session);assert.equal(record.day,scheduledDay);assert.equal(record.completed,true);assert.equal(record.lessonCompleted,true);assert.equal(record.intimatePracticeCompleted,null);checks+=5;
   const daily=await page.evaluate(async()=>{const c=SPM_RESOURCE_CONTEXT(),a=SPM_DAILY_PRACTICE.contentAssignment('sensate');return{rows:await SPM_DAILY_RECORDS.read(c.userId+':'+c.planId,c.day),id:a.id,writes:testSensateDaily.writes.filter(x=>x.day===c.day)};});
   assert.deepEqual(Object.keys(daily.rows),[daily.id]);assert.equal(daily.rows[daily.id].completed,true);assert.equal(daily.writes.length,1,'learning confirms its daily activity once');checks+=3;
   assert.equal(await page.evaluate(()=>testContext.day),scheduledDay);assert.equal(await page.evaluate(()=>testContext.completed.length),0);checks+=2;
  }
  // Focus II is voluntary and has no prerequisite gate in the approved module.
  // Its own modality, explicit start and manual steps still govern completion.
  await day(page,19);await page.evaluate(()=>SPM_SENSATE_LAB.open({origin:'dailyPlan'}));f=await frame(page,'sensate');
  await f.locator('.spm-f2-artwork').waitFor();const beforeFocus=await page.evaluate(()=>JSON.parse(sensateState['spm-sensate-records']).length);
  await f.locator('[data-act="next"]:visible').click();await f.locator('[data-act="next"]:visible').click();
  await f.getByRole('alert').filter({hasText:'Elige Individual o En pareja'}).waitFor();checks++;
  await f.locator('[data-act="branch"][data-value="individual"]').click();await f.locator('[data-act="next"]:visible').click();
  assert.equal(await f.locator('[data-act="nextphase"]').isDisabled(),true);await f.locator('[data-act="next"]:visible').click();
  await f.getByRole('alert').filter({hasText:'Inicia los pasos'}).waitFor();checks+=2;await close(page,'sensate');
  assert.equal(await page.evaluate(()=>JSON.parse(sensateState['spm-sensate-records']).length),beforeFocus,'early exit cannot create a completed practice');checks++;
  assert.equal(await page.evaluate(()=>testSensateDaily.writes.filter(x=>x.day===19).length),0,'early exit never confirms the daily activity');checks++;
  await page.evaluate(()=>SPM_SENSATE_LAB.open({origin:'dailyPlan'}));f=await frame(page,'sensate');await f.locator('.spm-f2-artwork').waitFor();
  await f.locator('[data-act="next"]:visible').click();await f.locator('[data-act="branch"][data-value="partner"]').click();await f.locator('[data-act="next"]:visible').click();
  await f.locator('[data-act="f2toggle"]').click();for(let step=0;step<4;step++)await f.locator('[data-act="nextphase"]').click();
  await f.locator('[data-act="next"]:visible').click();await f.locator('[data-act="next"]:visible').click();
  await f.locator('[data-act="approvedchoice"][data-field="comfort"][data-value="comodo"]').click();await f.locator('[data-act="approvedchoice"][data-field="discomfort"][data-value="ninguna"]').click();
  await f.locator('[data-act="save"]:visible').click();await page.locator('.spm-sensate-modal').waitFor({state:'detached'});
  const focus=await page.evaluate(()=>JSON.parse(sensateState['spm-sensate-records']).at(-1));
  assert.equal(focus.practiceId,'sf-focus-2');assert.equal(focus.modality,'partner');assert.equal(focus.completed,true);assert.equal(focus.day,19);assert.equal(await page.evaluate(()=>testContext.completed.length),0);checks+=5;
  assert.equal(await page.evaluate(()=>JSON.parse(sensateState['spm-sensate-records']).length),beforeFocus+1);
  assert.equal(await page.evaluate(()=>testSensateDaily.writes.filter(x=>x.day===19).length),1,'Focus II confirms its daily activity once without closing the day');checks+=2;
  await page.close();
 }
 const page=await create(390);await day(page,1);
 // Exercise the real checkpoint and cross-frame coordinator through the device API.
 const firstGuideText=await page.evaluate(()=>SPM_PELVIC_GUIDANCE.firstPractice().script);
 await page.evaluate(()=>SPM_BREATHING_LAB.open({origin:'dailyPlan'}));
 let f=await frame(page,'breathing');await routeStage(f,1);await f.locator('.spm-first-breath-audio').waitFor();assert.equal(await f.locator('.bl-route-main .bl-audio:visible').count(),0);checks++;
 assert.equal(await f.locator('.spm-first-breath-audio audio').count(),0);await f.locator('.spm-first-breath-audio [data-checkpoint-audio-toggle]').click();await playingVoiceText(f,firstGuideText);
 await continueRoute(f,2);await voiceStopped(f);assert.equal(await f.locator('.spm-first-breath-audio').count(),0);checks+=2;await startNarration(f,'screen.06');
 await f.locator('.bl-route-footer').getByRole('button',{name:'Atrás',exact:true}).click();await routeStage(f,1);await voiceStopped(f);await f.locator('.spm-first-breath-audio').waitFor();assert.equal(await f.locator('.spm-first-breath-audio [data-checkpoint-audio-toggle]').getAttribute('aria-pressed'),'false');checks++;await close(page,'breathing');assert.equal(await page.evaluate(()=>testWrites.length),0);checks++;
 await day(page,10);await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-breathing-daily]').click();f=await frame(page,'breathing');await f.locator('.bl-pattern-guide[data-reduced-motion="true"][data-running="false"]').waitFor();await f.getByRole('button',{name:'Torácica · pecho',exact:true}).click();await f.locator('.bl-pattern-guide[data-mode="chest"][data-reduced-motion="true"][data-running="false"]').waitFor();assert.equal(await f.locator('.bl-pattern-moving-zone').evaluate(el=>getComputedStyle(el).animationName),'none');checks++;await routeStage(f,1);await continueRoute(f,2);assert.equal(await f.locator('.bl-pattern-guide').getAttribute('data-running'),'false');assert.equal(await f.locator('.bl-pattern-moving-zone').evaluate(el=>getComputedStyle(el).animationName),'none');checks+=2;await continueRoute(f,3);await continueRoute(f,4);await f.locator('.bl-anatomy[data-visual-state="static"]').waitFor();await f.getByRole('button',{name:'Activar video de guía'}).click();await f.locator('.bl-anatomy[data-visual-state="ready"]').waitFor();checks++;await close(page,'breathing');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.route('**/respiracion-anatomica*',r=>r.abort());await page.locator('[data-breathing-daily]').click();f=await frame(page,'breathing');await reachPractice(f);await f.locator('.bl-anatomy[data-visual-state="error"] img').waitFor();await f.getByRole('button',{name:'Reintentar video'}).waitFor();assert.equal(await f.locator('.bl-pacer').count(),1);checks++;await close(page,'breathing');await page.unroute('**/respiracion-anatomica*');
 await page.evaluate(()=>{testContext.safety='review';return SPM_BREATHING_LAB.open({origin:'dailyPlan'});});f=await frame(page,'breathing');await routeStage(f,1);for(let stage=2;stage<=4;stage++)await continueRoute(f,stage);await f.getByText(/Tu programa requiere revisión/).waitFor();assert.equal(await f.locator('.bl-pacer').count(),0);assert.equal(await f.locator('.bl-route-instructions .bl-audio').count(),0);checks+=2;await close(page,'breathing');
 await browser.close();assert.deepEqual(errors,[]);console.log(`${checks} checks passed: content narration without header speakers, narrated comparison tabs, brief automatic illustrations, preparation audio, exclusive first-day guide, four daily stages, full viewport, daily isolation, 3 viewports, real video playback, save retry, explicit Focus II start, library and safety. Device speech requests were observed with a native API double; audible OS playback was not measured.`);
})().catch(e=>{console.error(e);process.exit(1)});
