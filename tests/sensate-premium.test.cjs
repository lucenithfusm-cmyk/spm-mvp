const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../labs/sensate/node_modules/jsdom');
const root=path.resolve(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'premium-v2/sensate-premium-v1.js'),'utf8');
const wait=()=>new Promise(r=>setTimeout(r,30));
function harness({day=8,practiceId='sf-focus-1',restriction='none',mode='daily',saved=[],recordDailyOk=true}={}){
 const dom=new JSDOM('<!doctype html><html lang="es"><body><div id="sensatePremium"></div></body></html>',{url:'https://spm.test/premium-v2/sensate-lab/index.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,records={ 'spm-sensate-records':JSON.stringify(saved)},writes=[],outcomes=[],spoken=[],clocks=new Map(),cfg={day,origin:mode==='daily'?'dailyPlan':'library',mode,restriction,activity:mode==='daily'?{day,practiceId,title:'Focalización sensorial asignada',optionalProgression:true}:null};
 const api={
  getContext(){return cfg},
  getState(){return {...records}},
  write(k,v){writes.push([k,v]);records[k]=v;return true},
  async flush(){outcomes.push('flush')},
  async recordDaily(){outcomes.push('recordDaily');return typeof recordDailyOk==='function'?recordDailyOk():recordDailyOk},
  async isDailyCompleted(){return false},
  async close(){outcomes.push('close');return true},
  async openLibrary(){outcomes.push('library');return true}
 };
 Object.defineProperty(w,'parent',{value:{SPM_SENSATE_LAB_HOST:api},configurable:true});
 let timerId=0;
 w.setInterval=(cb,ms)=>{const i=++timerId;clocks.set(i,{cb,ms});return i};
 w.clearInterval=i=>{clocks.delete(i)};
 w.speechSynthesis={cancel(){},getVoices(){return []},speak(utter){spoken.push(utter.text)}};
 w.SpeechSynthesisUtterance=function(text){this.text=text};
 w.eval(ui);
 const page=w.document.querySelector('#sensatePremium');
 function click(act){const el=page.querySelector('[data-act="'+act+'"]');assert.ok(el,'missing action '+act);el.click();return el}
 function choose(name,value){
  const input=page.querySelector('input[type=radio][name="'+name+'"][value="'+value+'"]');
  assert.ok(input,'missing '+name+' '+value);input.checked=true;input.dispatchEvent(new w.Event('change',{bubbles:true}));
 }
 function tick(seconds){for(let n=0;n<seconds;n++)for(const [key,val] of [...clocks]){if(clocks.has(key))val.cb()}}
 return {w,dom,page,api,records,writes,outcomes,spoken,cfg,click,choose,tick,close(){w.close()}};
}
test('Premium is an actual replacement of the old Sensate entry; original clinical library source is retained',()=>{
 const index=fs.readFileSync(path.join(root,'premium-v2/sensate-lab/index.html'),'utf8');
 assert.match(index,/sensate-premium-v1\.js/);
 assert.match(index,/sensate-premium-v1\.css/);
 assert.doesNotMatch(index,/index-C1hXctr7\.js/);
 const clinical=fs.readFileSync(path.join(root,'labs/sensate/src/components/SensateLab.tsx'),'utf8');
 for(const label of ['Focalización sensorial I','Focalización sensorial II','Comunicación mínima','Presencia corporal individual','sf-focus-1','sf-focus-2'])assert.match(clinical,new RegExp(label));
 for(const name of ['intro','seated','forearm','release','partner-forearm']){
  const f=fs.readFileSync(path.join(root,'premium-v2/assets/sensate-premium/spm-sensate-'+name+'-matte.webp'));
  assert.ok(f.length>15000);assert.equal(f.toString('ascii',0,4),'RIFF');
 }
 const css=fs.readFileSync(path.join(root,'premium-v2/sensate-premium-v1.css'),'utf8');
 assert.match(css,/\.sensate-scene/);
 assert.match(css,/\.guide-stepper/);
});
test('Seven transversal days and routes remain assigned by original SPM daily-support curriculum',()=>{
 const source=fs.readFileSync(path.join(root,'premium-v2/daily-support-plan-v1.js'),'utf8');
 for(const day of [4,8,12,16,19,23,26])assert.match(source,new RegExp('\\b'+day+':\\{id:\\x27sensate-'));
 for(const route of ['erection','ejaculation','desire','confidence','anxiety','wellbeing','lifestyle','optimization','mixed'])assert.ok(source.includes("'"+route+"'"));
});
test('Focus I is partner-consent-gated, uses existing non-genital sequence and needs explicit completion before saving',async()=>{
 const h=harness();
 try{
  assert.match(h.page.textContent,/Focalización sensorial/i);
  assert.ok(h.page.querySelector('[data-act=audio]'),'functional voice control');
  h.click('next');assert.ok(h.page.querySelector('[data-field=consent]'));
  h.click('next');assert.match(h.page.textContent,/Ambos deben aceptar participar/);
  const consent=h.page.querySelector('[data-field=consent]');consent.checked=true;consent.dispatchEvent(new h.w.Event('change',{bubbles:true}));
  h.click('next');assert.equal(h.page.querySelectorAll('[data-act=audio]').length,0,'no duplicated audio controls in guide');
  h.click('startguide');assert.match(h.spoken[0],/Paso 1/);
  h.click('nextphase');assert.match(h.page.textContent,/A toca/);
  assert.match(h.page.textContent,/Sin contacto genital ni con el pecho|No hay obligación/i);
  h.click('next');
  assert.equal(h.page.querySelector('[data-act=next]').disabled,true,'cannot evaluate before confirming practice');
  assert.equal(h.writes.length,0);
  h.click('performed');h.click('next');
  h.choose('comfort','comodo');h.choose('ease','intermedia');h.choose('attention','conexion');h.choose('repeat','si');h.choose('discomfort','ninguna');
  h.click('save');await wait();
  assert.ok(h.page.textContent.includes('Experiencia guardada'));
  assert.equal(h.writes.length,1);
  assert.ok(h.outcomes.includes('recordDaily'));
  const rows=JSON.parse(h.records['spm-sensate-records']);
  assert.equal(rows.length,1);assert.equal(rows[0].day,8);assert.equal(rows[0].practiceId,'sf-focus-1');
  assert.equal(rows[0].completed,true);assert.equal(rows[0].comfort,'comodo');assert.equal(rows[0].difficulty,'intermedia');
  assert.equal(rows[0].recommendation,'repeat','Focus II is not inferred from default ratings');
 }finally{h.close()}
});
test('Solo activity works without partner consent and can be recorded only after action',async()=>{
 const h=harness({day:4,practiceId:'sf-solo'});
 try{
  h.click('next');assert.equal(h.page.querySelector('[data-field=consent]'),null);
  h.click('next');h.click('startguide');h.click('nextphase');h.click('nextphase');assert.match(h.page.textContent,/antebrazo/i);
  h.click('performed');h.click('next');
  for(const [name,value] of [['comfort','neutro'],['ease','facil'],['attention','distraccion'],['repeat','si'],['discomfort','ninguna']])h.choose(name,value);
  h.click('save');await wait();
  assert.equal(h.writes.length,1);const rows=JSON.parse(h.records['spm-sensate-records']);
  assert.equal(rows[0].practiceId,'sf-solo');assert.equal(rows[0].day,4);
  assert.equal(rows[0].origin,'dailyPlan');
 }finally{h.close()}
});
test('Focus II only enabled after a completed, comfortable Focus I; communication retains all four existing phrases',()=>{
 const a=harness({mode:'library'});
 try{
  const button=a.page.querySelector('[data-act=mode][data-value=sf-focus-2]');
  assert.ok(button);assert.equal(button.disabled,true);
 }finally{a.close()}
 const completed={day:8,completed:true,practiceId:'sf-focus-1',partnerComfort:8,pressureAfter:2,recommendation:'progress'};
 const b=harness({mode:'library',saved:[completed]});
 try{
  const button=b.page.querySelector('[data-act=mode][data-value=sf-focus-2]');
  assert.equal(button.disabled,false);
  button.click();assert.match(b.page.textContent,/Focus II/);
  assert.match(ui,/Más lento/);assert.match(ui,/Así está bien/);assert.match(ui,/Prefiero otro contacto/);assert.match(ui,/Pausa/);
 }finally{b.close()}
});
test('Safety review pauses physical practice without erasing educational content',()=>{
 const h=harness({restriction:'review'});
 try{
  h.click('next');assert.match(h.page.textContent,/está en pausa por una indicación de seguridad/i);
  h.click('next');assert.match(h.page.textContent,/La práctica está en pausa/);
  assert.equal(h.writes.length,0);
 }finally{h.close()}
});
test('Failure to complete the SPM daily save never claims success; retry updates same sensate record',async()=>{
 let tries=0;const h=harness({day:12,practiceId:'sf-solo',recordDailyOk:()=>++tries>1});
 try{
  h.click('next');h.click('next');h.click('startguide');h.click('performed');h.click('next');
  for(const [name,value] of [['comfort','tenso'],['ease','dificil'],['attention','ansiedad'],['repeat','aun_no'],['discomfort','molestia']])h.choose(name,value);
  h.click('save');await wait();
  assert.match(h.page.textContent,/No se pudo guardar/);
  assert.doesNotMatch(h.page.textContent,/Experiencia guardada en tu programa SPM ✓/);
  h.click('save');await wait();
  assert.match(h.page.textContent,/Experiencia guardada en tu programa SPM/);
  assert.equal(JSON.parse(h.records['spm-sensate-records']).length,1);
  assert.equal(tries,2);
 }finally{h.close()}
});
test('Existing sensory-focus video is kept only in its standalone library/day 16 slot, not replayed inside Focus',()=>{
 const source=fs.readFileSync(path.join(root,'premium-v2/spm-video-library.js'),'utf8');
 const plan=fs.readFileSync(path.join(root,'premium-v2/daily-resource-plan-v1.js'),'utf8');
 assert.doesNotMatch(ui,/sensory-focus\.mp4|Ver el video educativo SPM · Foco sensorial/);
 assert.match(source,/\{key:'sensory-focus',title:'Foco sensorial: volver a las sensaciones'/);
 assert.match(plan,/\[16,'sensory-focus',all\]/);
 assert.match(ui,/temperature|temperatura/i);
});
test('Day 16 Focus I stays required while its standalone video is accessible but optional',()=>{
 const d=new JSDOM('<!doctype html><body></body>',{url:'https://spm.test',runScripts:'outside-only'}),w=d.window;
 try{
  w.SPM_VIDEO_LIBRARY=[{key:'sensory-focus',title:'Foco sensorial: volver a las sensaciones',duration:'1:09'}];
  w.SPM_VIDEO_ACTIONS={summary:()=>''};
  w.eval(fs.readFileSync(path.join(root,'premium-v2/daily-resource-plan-v1.js'),'utf8'));
  const c={primary:'desire',day:16,safety:'none',flags:[],checkins:[],answers:{}};
  const {main,support}=w.SPM_DAILY_RESOURCES.compose({id:'main',kind:'sensate',title:'Focalización sensorial I'},[],c);
  assert.equal(main.kind,'sensate');
  const video=support.find(a=>a.kind==='video');
  assert.ok(video,'existing day 16 video stays accessible in Today');
  assert.equal(video.videoKey,'sensory-focus');
  assert.equal(video.optional,true,'video must not be an additional mandatory daily exercise');
  assert.match(video.optionalLabel,/COMPLEMENTARIO/);
  assert.equal(support.filter(a=>a.videoKey==='sensory-focus').length,1,'no duplicate video activity');
 }finally{d.window.close()}
});



test('automatic narration starts on tap Iniciar and advances through the five original timed phases',()=>{
 const h=harness({day:4,practiceId:'sf-solo'});
 try{
  h.click('next');h.click('next');
  const stage=h.page;
  assert.ok(stage.querySelector('[data-act=startguide]'));
  assert.equal(h.spoken.length,0,'no narration starts before user interaction');
  assert.match(stage.querySelector('.sensate-scene img').getAttribute('src'),/seated/);
  h.click('startguide');
  assert.match(h.spoken[0],/Paso 1 de 5/);
  assert.match(h.spoken[0],/Siéntate o recuéstate/);
  assert.equal(stage.querySelector('[data-act=pauseguide]')!==null,true);
  h.tick(60);
  assert.match(stage.querySelector('.step-information h3').textContent,/Respirar/);
  assert.match(h.spoken.at(-1),/Paso 2 de 5/);
  h.click('pauseguide');
  const count=h.spoken.length;
  h.tick(120);
  assert.match(stage.querySelector('.step-information h3').textContent,/Respirar/,'paused guide must not advance');
  h.click('resumeguide');
  assert.equal(h.spoken.length,count+1);
  h.tick(60);
  assert.match(stage.querySelector('.step-information h3').textContent,/Explorar el tacto/);
  assert.match(stage.querySelector('.sensate-scene img').getAttribute('src'),/forearm/);
  h.tick(120+60+60);
  assert.match(stage.textContent,/Guía terminada/);
  assert.equal(stage.querySelector('[data-act=next]').disabled,true);
  h.click('performed');
  assert.equal(stage.querySelector('[data-act=next]').disabled,false,'the patient must confirm real practice');
 }finally{h.close()}
});
test('partner phase displays non-genital consented touch; all five scenes are descriptive and never poster buttons',()=>{
 const h=harness();
 try{
  h.click('next');
  const consent=h.page.querySelector('[data-field=consent]');consent.checked=true;consent.dispatchEvent(new h.w.Event('change',{bubbles:true}));
  assert.match(h.page.querySelector('.sensate-scene img').getAttribute('src'),/partner/);
  h.click('next');h.click('startguide');h.tick(60);
  assert.match(h.page.querySelector('.sensate-scene img').getAttribute('src'),/partner/);
  assert.match(h.page.querySelector('.step-brief').textContent,/Sin contacto genital ni con el pecho/);
  assert.equal(h.page.querySelectorAll('.voice-hotspot').length,0);
  assert.equal(h.page.querySelectorAll('[data-act=audio]').length,0,'autoplay voice uses the main start button, not two audio buttons');
  h.click('pauseguide');
  assert.equal(h.page.querySelector('[data-act=resumeguide]')!==null,true);
 }finally{h.close()}
});
test('an active guide pauses on app background, and manual phase steps do not store completion by themselves',()=>{
 const h=harness({day:12,practiceId:'sf-solo'});
 try{
  h.click('next');h.click('next');h.click('startguide');
  Object.defineProperty(h.w.document,'hidden',{configurable:true,get:()=>true});
  h.w.document.dispatchEvent(new h.w.Event('visibilitychange'));
  assert.ok(h.page.querySelector('[data-act=resumeguide]'));
  h.tick(100);assert.match(h.page.querySelector('.step-information h3').textContent,/Llegar al cuerpo/);
  assert.equal(h.writes.length,0);
  h.click('resumeguide');h.click('nextphase');
  assert.equal(h.writes.length,0);
 }finally{h.close()}
});
