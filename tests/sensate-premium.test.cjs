const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../labs/sensate/node_modules/jsdom');
const root=path.resolve(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'premium-v2/sensate-premium-v1.js'),'utf8');
const pause=()=>new Promise(resolve=>setTimeout(resolve,35));

function harness({day=8,practiceId='sf-focus-1',profile='erection',restriction='none',mode='daily',saved=[],recordDailyOk=true}={}){
 const dom=new JSDOM('<!doctype html><html lang="es"><body><div id="sensatePremium"></div></body></html>',{url:'https://spm.test/premium-v2/sensate-lab/index.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,records={'spm-sensate-records':JSON.stringify(saved)},writes=[],calls=[],spoken=[],clock=new Map();
 const cfg={day,origin:mode==='daily'?'dailyPlan':'library',mode,restriction,profile,activity:mode==='daily'?{day,practiceId,title:'Actividad sensorial asignada'}:null};
 let timerId=0,active=null;
 const host={
  getContext:()=>cfg,
  getState:()=>({...records}),
  write(k,v){writes.push({k,v});records[k]=v;return true},
  async flush(){calls.push('flush')},
  async recordDaily(){calls.push('recordDaily');return typeof recordDailyOk==='function'?recordDailyOk():recordDailyOk},
  async isDailyCompleted(){return false},
  async close(){calls.push('close');return true},
  async openLibrary(){calls.push('library');return true}
 };
 Object.defineProperty(w,'parent',{value:{SPM_SENSATE_LAB_HOST:host},configurable:true});
 w.setInterval=(cb,ms)=>{let id=++timerId;clock.set(id,{cb,ms});return id};
 w.clearInterval=id=>{clock.delete(id)};
 w.speechSynthesis={cancel(){},getVoices(){return []},speak(utter){spoken.push(utter.text);active=utter}};
 w.SpeechSynthesisUtterance=function(text){this.text=text};
 w.eval(ui);
 const page=w.document.querySelector('#sensatePremium');
 const byAct=(act)=>page.querySelector('[data-act="'+act+'"]');
 function click(act){const b=byAct(act);assert.ok(b,'missing '+act);assert.equal(b.disabled,false,'disabled '+act);b.click();return b}
 function choose(name,value){const input=page.querySelector('input[name="'+name+'"][value="'+value+'"]');assert.ok(input,'missing '+name+'='+value);input.checked=true;input.dispatchEvent(new w.Event('change',{bubbles:true}))}
 function tick(n){for(let i=0;i<n;i++)for(const [id,obj] of [...clock]){if(clock.has(id))obj.cb()}}
 function branch(value){const b=page.querySelector('[data-act="branch"][data-value="'+value+'"]');assert.ok(b,'missing mode '+value);b.click();}
 function advanceToPractice(value='individual'){click('next');branch(value);click('next');}
 return {w,page,cfg,host,records,writes,calls,spoken,click,choose,tick,branch,advanceToPractice,utter(){return active},finishAudio(){const a=active;a?.onend?.()},close(){w.close()}};
}

test('original Focus curriculum, transversal days and approved medical scene assets remain intact',()=>{
 const original=fs.readFileSync(path.join(root,'labs/sensate/src/components/SensateLab.tsx'),'utf8');
 for(const value of ['Focalización sensorial I','Focalización sensorial II','Comunicación mínima','sf-focus-1','sf-focus-2'])assert.match(original,new RegExp(value));
 const d=fs.readFileSync(path.join(root,'premium-v2/daily-support-plan-v1.js'),'utf8');
 for(const day of [4,8,12,16,19,23,26])assert.match(d,new RegExp('\\b'+day+':\\{id:\\x27sensate-'));
 for(const name of ['intro','seated','forearm','release','partner-forearm']){
  const buffer=fs.readFileSync(path.join(root,'premium-v2/assets/sensate-premium/spm-sensate-'+name+'-matte.webp'));
  assert.ok(buffer.length>15000);assert.equal(buffer.toString('ascii',0,4),'RIFF');
 }
 const html=fs.readFileSync(path.join(root,'premium-v2/sensate-lab/index.html'),'utf8');
 assert.match(html,/sensate-premium-v1\.js/);
 assert.doesNotMatch(html,/index-C1hXctr7\.js/);
});

test('day 19 assigns only Focus II for DE, EP and desire with no eligibility gate',()=>{
 const source=fs.readFileSync(path.join(root,'premium-v2/daily-support-plan-v1.js'),'utf8');
 const dom=new JSDOM('<!doctype html><body></body>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only'});
 dom.window.eval(source);
 for(const profile of ['erection','ejaculation','desire']){
  const activity=dom.window.SPM_DAILY_SUPPORT.activity('sensate',19,{primary:profile});
  assert.ok(activity,'assigned '+profile);
  assert.equal(activity.practiceId,'sf-focus-2');
  assert.deepEqual([...activity.steps],[2,3,7,8,6]);
  assert.equal(activity.title,profile==='desire'?'Sensate Focus II':'Focalización Sensorial II');
  assert.equal(activity.optionalProgression,undefined);
 }
 for(const day of [4,8,12,16,19,23,26]){
  assert.ok(dom.window.SPM_DAILY_SUPPORT.activity('sensate',day,{primary:'desire'}));
 }
 dom.window.close();
});

test('intro has one playable voice control, the five-screen layout starts at 1/5, and no decorative hotspots',()=>{
 const h=harness();
 try{
  assert.match(h.page.textContent,/Conecta con tus sensaciones/);
  assert.match(h.page.textContent,/1 \/ 5/);
  assert.equal(h.page.querySelectorAll('[data-act=audio]').length,1);
  assert.equal(h.page.querySelectorAll('.voice-hotspot').length,0);
  h.click('audio');assert.match(h.spoken[0],/Focalización sensorial no es una prueba de desempeño/);
  h.click('next');assert.match(h.page.textContent,/2 \/ 5/);
  assert.equal(h.page.querySelectorAll('.mode-photo').length,2);
  assert.equal(h.page.querySelectorAll('[data-field=consent]').length,0);
 }finally{h.close()}
});

test('screen 2 selection opens separate 3/5 explanatory paths directly, no extra checkbox',()=>{
 for(const mode of ['individual','partner']){
  const h=harness();
  try{
   h.click('next');h.branch(mode);
   assert.match(h.page.textContent,/3 \/ 5/);
   assert.equal(h.page.querySelectorAll('[data-act=explainstep]').length,5);
   assert.equal(h.page.querySelectorAll('[data-field=consent]').length,0);
   const mainImage=h.page.querySelector('.explain-stage img');
   assert.ok(mainImage);
   assert.match(mainImage.getAttribute('src'),mode==='partner'?/partner/:/seated/);
   assert.ok(h.page.querySelector('svg .wave-line'),'visible animated wave motif');
   assert.match(h.page.textContent,mode==='partner'?/A toca/:/Acomódate/);
  }finally{h.close()}
 }
});

test('all five full-width explanatory controls speak the corresponding existing clinical instructions',()=>{
 const h=harness();
 try{
  h.click('next');h.branch('individual');
  const card=h.page.querySelector('[data-act=explainstep][data-value="2"]');
  assert.ok(card);card.querySelector('.explain-label').click();
  assert.match(h.spoken.at(-1),/Paso 3 de cinco/);
  assert.match(h.spoken.at(-1),/antebrazo/);
  assert.equal(h.page.querySelectorAll('[data-act=audio]').length,0,'not a duplicated second speaker');
  h.click('explainall');
  assert.match(h.spoken.at(-1),/Paso 1 de cinco/);
  for(let i=0;i<5;i++)h.finishAudio();
  assert.equal(h.page.querySelector('[data-act=explainall]').disabled,false);
  assert.match(h.page.textContent,/Continuar/);
 }finally{h.close()}
});

test('screen 4 alone starts voiced automatic practice, includes silence explanation, and advances every minute',()=>{
 const h=harness({day:4,practiceId:'sf-solo'});
 try{
  h.advanceToPractice('individual');
  assert.match(h.page.textContent,/4 \/ 5/);
  assert.ok(h.page.querySelector('[data-act=guideintro]'));
  h.click('guideintro');
  assert.match(h.spoken.at(-1),/silencio/);
  assert.match(h.spoken.at(-1),/no significa/);
  assert.equal(h.page.querySelector('[data-act=audio]'),null);
  const before=h.spoken.length;
  h.click('startguide');
  assert.equal(h.spoken.length,before+1);
  assert.match(h.spoken.at(-1),/Paso 1 de cinco/);
  h.tick(59);assert.match(h.page.textContent,/Acomódate/);
  assert.equal(h.spoken.length,before+1,'no repeated narration during the silent interval');
  h.tick(1);assert.match(h.spoken.at(-1),/Paso 2 de cinco/);
  assert.match(h.page.querySelector('.current-activity h3').textContent,/Respira/);
  h.click('pauseguide');const count=h.spoken.length;
  h.tick(70);assert.equal(h.spoken.length,count);
  assert.match(h.page.querySelector('.current-activity h3').textContent,/Respira/);
  h.click('resumeguide');assert.match(h.spoken.at(-1),/Paso 2 de cinco/);
  h.click('nextphase');
  assert.match(h.spoken.at(-1),/Paso 3 de cinco/);
  assert.match(h.page.querySelector('.sensate-scene img').getAttribute('src'),/forearm/);
  assert.ok(h.page.querySelector('.wave-stage.moving'));
  assert.equal(h.writes.length,0,'watching or starting practice does not save patient progress');
 }finally{h.close()}
});

test('partner route uses existing non-genital A/B turn instructions in both 3/5 and 4/5',()=>{
 const h=harness();
 try{
  h.advanceToPractice('partner');
  assert.match(h.page.textContent,/4 \/ 5/);
  h.click('startguide');h.tick(60);
  assert.match(h.spoken.at(-1),/A toca/);
  assert.match(h.spoken.at(-1),/Sin contacto genital ni con el pecho/);
  assert.match(h.page.querySelector('.sensate-scene img').getAttribute('src'),/partner/);
  h.click('nextphase');assert.match(h.spoken.at(-1),/Pausa breve/);
  h.click('nextphase');assert.match(h.spoken.at(-1),/B toca/);
  assert.equal(h.page.querySelector('[data-field=consent]'),null);
 }finally{h.close()}
});

test('both modalities use precisely the same screen 5 evaluation and save through existing host',async()=>{
 for(const mode of ['individual','partner']){
  const h=harness({day:mode==='partner'?8:4,practiceId:mode==='partner'?'sf-focus-1':'sf-solo'});
  try{
   h.advanceToPractice(mode);
   h.click('startguide');
   h.click('performed');
   h.click('next');
   assert.match(h.page.textContent,/5 \/ 5/);
   assert.match(h.page.textContent,/¿Cómo te fue/);
   for(const [field,value] of [['comfort','comodo'],['ease','intermedia'],['attention','conexion'],['repeat','si'],['discomfort','ninguna']])h.choose(field,value);
   h.click('save');await pause();
   assert.equal(h.writes.length,1);
   assert.ok(h.calls.includes('flush'));assert.ok(h.calls.includes('recordDaily'));
   const rows=JSON.parse(h.records['spm-sensate-records']);
   assert.equal(rows.length,1);
   assert.equal(rows[0].practiceId,mode==='partner'?'sf-focus-1':'sf-solo');
   assert.equal(rows[0].completed,true);
   assert.match(h.page.textContent,/Experiencia guardada en tu programa/);
   h.click('close');assert.ok(h.calls.includes('close'));
  }finally{h.close()}
 }
});

test('day 19 has one direct Focus II practice without a prior Focus I record or an approval gate',()=>{
 for(const mode of ['individual','partner']){
  const h=harness({day:19,practiceId:'sf-focus-2',saved:[]});
  try{
   assert.match(h.page.textContent,/Focalización Sensorial II/);
   h.click('audio');assert.match(h.spoken.at(-1),/puedes omitirla hoy/i);
   h.click('next');h.branch(mode);
   assert.match(h.page.textContent,/Focus II/i);
   assert.match(h.page.textContent,mode==='partner'?/Retomen/:/Conecta/);
   assert.equal(h.page.querySelector('[data-act=togglefocus]'),null);
   h.click('next');h.click('startguide');
   assert.match(h.spoken.at(-1),mode==='partner'?/contacto no genital/:/Acomódate/);
  }finally{h.close()}
 }
});

test('desire welcomes Sensate Focus II without the DE/EP omission warning; skip does not save a completed session',()=>{
 const desire=harness({day:19,practiceId:'sf-focus-2',profile:'desire'});
 try{
  assert.match(desire.page.textContent,/Sensate Focus II/);
  desire.click('audio');
  assert.match(desire.spoken.at(-1),/deseo/);
  assert.doesNotMatch(desire.spoken.at(-1),/omitirla hoy|no te resulta cómoda/i);
  assert.equal(desire.page.querySelector('[data-act=skip]'),null);
 }finally{desire.close()}
 for(const profile of ['erection','ejaculation']){
  const h=harness({day:19,practiceId:'sf-focus-2',profile});
  try{
   assert.ok(h.page.querySelector('[data-act=skip]'));
   h.click('skip');
   assert.ok(h.calls.includes('close'));
   assert.equal(h.writes.length,0);
   assert.equal(h.calls.includes('recordDaily'),false);
  }finally{h.close()}
 }
});

test('day-19 Focus II keeps individual and partner saves distinct and does not repeat Focus I',async()=>{
 for(const mode of ['individual','partner']){
  const h=harness({day:19,practiceId:'sf-focus-2',profile:'desire'});
  try{
   h.advanceToPractice(mode);
   h.click('startguide');h.click('performed');h.click('next');
   for(const [field,value] of [['comfort','comodo'],['ease','intermedia'],['attention','conexion'],['repeat','si'],['discomfort','ninguna']])h.choose(field,value);
   const rating=h.page.querySelector('[data-act=focus2rating][data-value="3"]');assert.ok(rating);rating.click();
   h.click('save');await pause();
   const records=JSON.parse(h.records['spm-sensate-records']);
   assert.equal(records.length,1);
   assert.equal(records[0].practiceId,mode==='partner'?'sf-focus-2':'sf-focus-2-solo');
   assert.equal(records[0].completed,true);
   assert.ok(h.calls.includes('recordDaily'));
  }finally{h.close()}
 }
});

test('Focus II offers a functional five-screen matte audio-first journey without forced time transitions',()=>{
 for(const mode of ['individual','partner']){
  const h=harness({day:19,practiceId:'sf-focus-2',profile:'desire'});
  try{
   assert.ok(h.page.querySelector('.focusii-theme'));
   assert.match(h.page.textContent,/Sensate Focus II/);
   assert.match(h.page.textContent,/1 \/ 5/);
   h.click('audio');assert.match(h.spoken.at(-1),/Sensate Focus II/);
   h.click('next');assert.match(h.page.textContent,/2 \/ 5/);
   h.branch(mode);assert.match(h.page.textContent,/3 \/ 5/);
   assert.equal(h.page.querySelectorAll('[data-act=explainstep]').length,5);
   assert.equal(h.page.querySelectorAll('[data-act=explainstep][data-audio]').length,5);
   h.page.querySelector('[data-act=explainstep][data-value="4"]').click();
   assert.match(h.spoken.at(-1),/Paso 5 de cinco/);
   h.click('next');assert.match(h.page.textContent,/4 \/ 5/);
   assert.ok(h.page.querySelector('[data-act=guideintro][data-audio]'));
   h.click('startguide');
   const count=h.spoken.length;
   h.tick(180);
   assert.equal(h.spoken.length,count,'Focus II never forces narration/step transitions from optional timer');
   assert.equal(h.page.querySelector('.focusii-active-title').textContent,mode==='partner'?'Retomen':'Conecta');
   assert.match(h.page.querySelector('[data-guide-elapsed]').textContent,/03:00/);
   h.click('pauseguide');
   h.tick(10);
   assert.match(h.page.querySelector('[data-guide-elapsed]').textContent,/03:00/);
   h.click('resumeguide');
   h.click('nextphase');
   assert.equal(h.page.querySelector('.focusii-active-title').textContent,mode==='partner'?'Exploren':'Explora');
   h.click('performed');h.click('next');
   assert.match(h.page.textContent,/5 \/ 5/);
   assert.equal(h.page.querySelectorAll('[data-act=focus2rating]').length,5);
   assert.equal(h.page.querySelectorAll('[data-act=focus2noticed]').length,3);
   assert.equal(h.writes.length,0);
  }finally{h.close()}
 }
});

test('Focus II minimal register saves only entered values and preserves current day and two modality IDs',async()=>{
 for(const mode of ['individual','partner']){
  const h=harness({day:19,practiceId:'sf-focus-2',profile:'erection'});
  try{
   h.advanceToPractice(mode);
   h.click('startguide');h.click('performed');h.click('next');
   h.choose('comfort','comodo');
   h.choose('discomfort','ninguna');
   h.click('save');
   assert.match(h.page.textContent,/valor de 0 a 4/);
   h.page.querySelector('[data-act=focus2rating][data-value="4"]').click();
   h.page.querySelector('[data-act=focus2noticed][data-value="Más calma"]').click();
   h.click('save');await pause();
   assert.equal(h.calls.filter(x=>x==='recordDaily').length,1);
   const rows=JSON.parse(h.records['spm-sensate-records']);
   assert.equal(rows.length,1);
   assert.equal(rows[0].day,19);
   assert.equal(rows[0].practiceId,mode==='individual'?'sf-focus-2-solo':'sf-focus-2');
   assert.equal(rows[0].focus2Rating,4);
   assert.deepEqual(rows[0].focus2Noted,['Más calma']);
   assert.equal(rows[0].presenceBefore,null);
   assert.equal(rows[0].presenceAfter,null);
   assert.equal(rows[0].pressureAfter,null);
   assert.equal(rows[0].partnerComfort,null);
  }finally{h.close()}
 }
});

test('day-23 communication practice remains available independently',()=>{
 const communication=harness({day:23,practiceId:'sf-communication'});
 try{
  communication.click('next');communication.branch('individual');communication.click('explainall');
  assert.match(communication.spoken.at(-1),/Respira y observa/);
  communication.click('next');communication.click('startguide');
  assert.match(communication.spoken.at(-1),/Respira y observa/);
 }finally{communication.close()}
});

test('safety review blocks either physical modality and does not write any progress',()=>{
 const h=harness({restriction:'review'});
 try{
  h.click('next');h.branch('partner');
  assert.match(h.page.textContent,/pausa/);
  assert.match(h.page.textContent,/2 \/ 5/);
  assert.equal(h.writes.length,0);
 }finally{h.close()}
});

test('failed final daily completion keeps the same record for retry and does not claim success',async()=>{
 let attempts=0;
 const h=harness({day:12,practiceId:'sf-solo',recordDailyOk:()=>++attempts>1});
 try{
  h.advanceToPractice('individual');
  h.click('startguide');h.click('performed');h.click('next');
  for(const [field,value] of [['comfort','neutro'],['ease','dificil'],['attention','distraccion'],['repeat','aun_no'],['discomfort','molestia']])h.choose(field,value);
  h.click('save');await pause();
  assert.match(h.page.textContent,/No se pudo guardar/);
  assert.doesNotMatch(h.page.textContent,/Experiencia guardada en tu programa SPM ✓/);
  h.click('save');await pause();
  assert.equal(attempts,2);
  assert.equal(JSON.parse(h.records['spm-sensate-records']).length,1);
 }finally{h.close()}
});

test('standalone video remains day-16 optional, never an embedded focalization duplicate',()=>{
 const video=fs.readFileSync(path.join(root,'premium-v2/spm-video-library.js'),'utf8');
 const daily=fs.readFileSync(path.join(root,'premium-v2/daily-resource-plan-v1.js'),'utf8');
 assert.match(video,/\{key:'sensory-focus',title:/);
 assert.match(daily,/\[16,'sensory-focus',all\]/);
 assert.match(daily,/key==='sensory-focus'\?\{optional:true/);
 assert.doesNotMatch(ui,/sensory-focus\.mp4|Ver el video educativo SPM/);
});
