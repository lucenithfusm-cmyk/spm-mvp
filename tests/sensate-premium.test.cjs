const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../scripts/qa/node_modules/jsdom');
const root=path.resolve(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'premium-v2/sensate-premium-v1.js'),'utf8');
const pause=()=>new Promise(resolve=>setTimeout(resolve,35));

function harness({day=8,practiceId='sf-focus-1',profile='erection',restriction='none',mode='daily',saved=[],recordDailyOk=true}={}){
 const dom=new JSDOM('<!doctype html><html lang="es"><body><div id="sensatePremium"></div></body></html>',{url:'https://spm.test/premium-v2/sensate-lab/index.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,records={'spm-sensate-records':JSON.stringify(saved)},writes=[],calls=[],closeArgs=[],spoken=[],clock=new Map();
 const cfg={day,origin:mode==='daily'?'dailyPlan':'library',mode,restriction,profile,activity:mode==='daily'?{day,practiceId,title:'Actividad sensorial asignada'}:null};
 let timerId=0,active=null;
 const host={
  getContext:()=>cfg,
  getState:()=>({...records}),
  write(k,v){writes.push({k,v});records[k]=v;return true},
  async flush(){calls.push('flush')},
  async recordDaily(){calls.push('recordDaily');return typeof recordDailyOk==='function'?recordDailyOk():recordDailyOk},
  async isDailyCompleted(){return false},
  async close(resume=true){calls.push('close');closeArgs.push(resume);return true},
  async openLibrary(){calls.push('library');return true}
 };
 Object.defineProperty(w,'parent',{value:{SPM_SENSATE_LAB_HOST:host},configurable:true});
 w.setInterval=(cb,ms)=>{let id=++timerId;clock.set(id,{cb,ms});return id};
 w.clearInterval=id=>{clock.delete(id)};
 w.speechSynthesis={cancel(){},getVoices(){return []},speak(utter){spoken.push(utter.text);active=utter}};
 w.SpeechSynthesisUtterance=function(text){this.text=text};
 w.eval(require('./helpers/device-voice-fixture.cjs').read('premium-v2/device-voice-v1.js'));
 w.eval(ui);
 const page=w.document.querySelector('#sensatePremium');
 const byAct=(act)=>page.querySelector('[data-act="'+act+'"]');
 function click(act){const b=byAct(act);assert.ok(b,'missing '+act);assert.equal(b.disabled,false,'disabled '+act);b.click();return b}
 function choose(name,value){const input=page.querySelector('input[name="'+name+'"][value="'+value+'"]');assert.ok(input,'missing '+name+'='+value);input.checked=true;input.dispatchEvent(new w.Event('change',{bubbles:true}))}
 function tick(n){for(let i=0;i<n;i++)for(const [id,obj] of [...clock]){if(clock.has(id))obj.cb()}}
 function branch(value){const b=page.querySelector('[data-act="branch"][data-value="'+value+'"]');assert.ok(b,'missing mode '+value);b.click();}
 function advanceToPractice(value='individual'){click('next');branch(value);click('next');}
 return {w,page,cfg,host,records,writes,calls,closeArgs,spoken,click,choose,tick,branch,advanceToPractice,utter(){return active},finishAudio(){for(let n=0;n<30&&w.SPM_VOICE.speaking;n++)active?.onend?.()},close(){w.close()}};
}

test('original Focus curriculum, transversal days and approved medical scene assets remain intact',()=>{
 const original=fs.readFileSync(path.join(root,'labs/sensate/src/components/SensateLab.tsx'),'utf8');
 for(const value of ['Focalización sensorial I','Focalización sensorial II','Comunicación mínima','sf-focus-1','sf-focus-2'])assert.match(original,new RegExp(value));
 const d=fs.readFileSync(path.join(root,'premium-v2/daily-support-plan-v1.js'),'utf8');
 for(const day of [4,8,12,19,23,26])assert.match(d,new RegExp('\\b'+day+':\\{id:\\x27sensate-'));
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
 for(const day of [4,8,12,19,23,26]){
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
  assert.match(h.spoken.at(-1),/Explorar el tacto/);
  assert.match(h.spoken.at(-1),/antebrazo/);
  assert.equal(h.page.querySelectorAll('[data-act=audio]').length,0,'not a duplicated second speaker');
  h.click('explainall');
  assert.match(h.spoken.at(-1),/Llegar al cuerpo/);
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
  assert.match(h.spoken.at(-1),/Llegar al cuerpo/);
  h.tick(59);assert.match(h.page.textContent,/Acomódate/);
  assert.equal(h.spoken.length,before+1,'no repeated narration during the silent interval');
  h.tick(1);assert.match(h.spoken.at(-1),/Respirar/);
  assert.match(h.page.querySelector('.current-activity h3').textContent,/Respira/);
  h.click('pauseguide');const count=h.spoken.length;
  h.tick(70);assert.equal(h.spoken.length,count);
  assert.match(h.page.querySelector('.current-activity h3').textContent,/Respira/);
  h.click('resumeguide');assert.match(h.spoken.at(-1),/Respirar/);
  h.click('nextphase');
  assert.match(h.spoken.at(-1),/Explorar el tacto/);
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

test('Focus I: cinco sesiones independientes, la primera conserva cinco imágenes originales táctiles y las demás no cambian',async()=>{
 const cases=[
  [4,'sf-i-1','individual','Conecta con tus sensaciones','Siente el apoyo'],
  [8,'sf-i-2','individual','Descubre lo que te gusta','Llega a tu cuerpo'],
  [12,'sf-i-3','partner','Conecta sin presión','Acuerden un encuentro libre'],
  [23,'sf-i-4','partner','Comunica lo que disfrutas','Observa qué disfrutas'],
  [26,'sf-i-5','partner','Integra y disfruta','Empiecen con calma']
 ];
 const assets=['01_Conecta_con_tus_sensaciones','02_Tu_practica_individual','03_Tu_practica_guiada','04_Llevalo_a_tu_vida','05_Cierre_de_tu_practica'];
 for(const asset of assets){
  const bytes=fs.readFileSync(path.join(root,'premium-v2/assets/sensate-premium/spm-focus-i-s1-'+asset+'.webp'));
  assert.ok(bytes.length>160000,'Imagen aprobada completa '+asset);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
 }
 const signatures=new Set();
 for(const [day,practiceId,mode,title,firstStep] of cases){
  const h=harness({day,practiceId,profile:'desire',restriction:'review'});
  const isS1=practiceId==='sf-i-1',otherLesson=['sf-i-2','sf-i-3','sf-i-4','sf-i-5'].includes(practiceId);
  try{
   assert.ok(h.page.querySelector('.sf-matte'));
   assert.match(h.page.textContent,new RegExp(title));
   if(isS1){
    assert.match(h.page.querySelector('.spm-s1-artwork').getAttribute('style'),/s1-01_Conecta_con_tus_sensaciones\.webp/);
    assert.ok(h.page.querySelector('[data-act=approvedread]'));
    assert.equal(h.page.querySelectorAll('[data-act=s1concept]').length,3);
   }
   h.click('audio');assert.ok(h.spoken.at(-1).length>60);
   signatures.add(h.spoken.at(-1));
   h.click('next');
   assert.equal(h.page.querySelectorAll('[data-act=branch]').length,isS1||practiceId==='sf-i-2'?1:0);
   if(isS1)assert.match(h.page.querySelector('.spm-s1-artwork').getAttribute('style'),/s1-02_Tu_practica_individual\.webp/);
   h.click('next');
   assert.match(h.page.textContent,otherLesson?/3 \/ 4/:/3 \/ 5/);
   assert.equal(h.page.querySelectorAll('[data-act=explainstep]').length,5);
   assert.match(h.page.textContent,new RegExp(firstStep));
   if(isS1){
    assert.match(h.page.querySelector('.spm-s1-artwork').getAttribute('style'),/s1-03_Tu_practica_guiada\.webp/);
    h.page.querySelector('[data-act=explainstep][data-value="0"]').click();
    assert.match(h.spoken.at(-1),new RegExp(firstStep));
    h.click('explainall');assert.match(h.spoken.at(-1),new RegExp(firstStep));
   }
   h.click('next');
   if(isS1){
    assert.match(h.page.querySelector('.spm-s1-artwork').getAttribute('style'),/s1-04_Llevalo_a_tu_vida\.webp/);
    const audio=h.page.querySelector('[data-act=s1task][data-value=tarea]');
    assert.ok(audio);
    audio.click();assert.match(h.spoken.at(-1),/Llévalo a tu vida/);
    h.click('next');
    assert.match(h.page.querySelector('.spm-s1-artwork').getAttribute('style'),/s1-05_Cierre_de_tu_practica\.webp/);
    assert.equal(h.page.querySelectorAll('[data-act=focus2rating]').length,5);
   }else if(otherLesson){
    assert.ok(h.page.querySelector(practiceId==='sf-i-5'?'.spm-s5-artwork-screen':practiceId==='sf-i-4'?'.spm-s4-artwork-screen':practiceId==='sf-i-3'?'.spm-s3-artwork-screen':'.spm-s2-artwork-screen'));
    assert.equal(h.page.querySelector('[data-act=startguide]'),null);
   }
   assert.match(h.page.textContent,otherLesson?/4 \/ 4/:/5 \/ 5/);
   h.click('save');await pause();
   assert.equal(h.writes.length,1);
   const record=JSON.parse(h.records['spm-sensate-records'])[0];
   assert.equal(record.day,day);assert.equal(record.practiceId,practiceId);assert.equal(record.completed,true);
   assert.equal(record.wellbeingRating,null);assert.equal(record.pressureAfter,null);assert.equal(record.modality,mode);
   if(isS1){assert.equal(record.lessonCompleted,true);assert.equal(record.intimatePracticeCompleted,null)}
  }finally{h.close()}
 }
 assert.equal(signatures.size,5,'cada sesión conserva su propia bienvenida');
});

test('Focus II: ocho imágenes aprobadas sin pérdida, seis etapas y sin duplicar Focalización I',()=>{
 const images=['01_Introduccion','02_Elige_modalidad','03A_Guia_individual','03B_Guia_en_pareja','04A_Practica_individual','04B_Practica_en_pareja','05_Registro_bienestar','06_Cierre_y_guardado'];
 for(const image of images){
  const file=path.join(root,'premium-v2/assets/sensate-premium/spm-focus2-'+image+'.webp');
  const bytes=fs.readFileSync(file);
  assert.ok(bytes.length>185000,'imagen íntegra '+image);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
 }
 const css=fs.readFileSync(path.join(root,'premium-v2/sensate-premium-v1.css'),'utf8');
 assert.match(css,/\.spm-f2-artwork/);
 assert.match(css,/@keyframes spm-f2-audio-invite/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 const h=harness({day:19,practiceId:'sf-focus-2'});
 try{
  assert.ok(h.page.querySelector('.spm-f2-artwork'));
  assert.match(h.page.querySelector('.spm-f2-artwork').getAttribute('style'),/spm-focus2-01_Introduccion.webp/);
  assert.match(h.page.textContent,/1 \/ 6/);
  assert.ok(h.page.querySelector('[data-act=audio][data-audio]'));
  assert.equal(h.page.querySelectorAll('[data-act=f2concept]').length,3);
  h.click('audio');assert.match(h.spoken.at(-1),/Focalización Sensorial II/);
  h.page.querySelector('[data-act=f2concept][data-value=ritmo]').click();
  assert.match(h.spoken.at(-1),/Ritmo/);
  assert.equal(h.page.querySelector('[data-act=f2concept][data-value=ritmo]').getAttribute('aria-pressed'),'true');
  h.click('approvedread');assert.ok(h.page.querySelector('.spm-f2-instructions').hasAttribute('open'));
  h.click('approvedinfo-close');
  h.click('next');
  assert.match(h.page.querySelector('.spm-f2-artwork').getAttribute('style'),/spm-focus2-02_Elige_modalidad.webp/);
  assert.equal(h.page.querySelectorAll('[data-act=branch]').length,2,'modalidades táctiles');
  h.click('next');assert.match(h.page.querySelector('[role=alert]').textContent,/Elige Individual o En pareja/);
  assert.equal(h.writes.length,0,'selección no guarda datos');
 }finally{h.close()}
});

test('Focus II: dos rutas táctiles exclusivas convergen y conservan su progreso sin falsos registros',async()=>{
 for(const mode of ['individual','partner']){
  const h=harness({day:19,practiceId:'sf-focus-2',profile:'desire'});
  const check=(page,filename)=>{
   const art=h.page.querySelector('.spm-f2-artwork');
   assert.ok(art,'lienzo táctil '+page);
   assert.match(art.getAttribute('style'),new RegExp('spm-focus2-'+filename+'.webp'));
   assert.match(art.getAttribute('aria-label'),new RegExp('pantalla '+page+' de 6'));
   const buttons=[...h.page.querySelectorAll('.spm-f2-hit')];
   assert.ok(buttons.length>=3,'botones reales en '+page);
   assert.ok(buttons.every(b=>b.dataset.act&&b.getAttribute('aria-label')));
  };
  try{
   check(1,'01_Introduccion');
   h.click('audio');assert.match(h.spoken.at(-1),/Sensate Focus II/);
   h.click('next');check(2,'02_Elige_modalidad');
   h.branch(mode);
   // One tap opens the selected guide; no extra Continuar.
   check(3,mode==='individual'?'03A_Guia_individual':'03B_Guia_en_pareja');
   assert.equal(h.page.querySelectorAll('[data-act=branch]').length,0,'la modalidad ya está resuelta');
   assert.equal(h.page.querySelectorAll('[data-act=explainstep]').length,5);
   h.page.querySelector('[data-act=explainstep][data-value="4"]').click();
   assert.match(h.spoken.at(-1),mode==='individual'?/Integra lo que sentiste/:/Cerrar sin expectativas/);
   h.click('explainall');
   assert.match(h.spoken.at(-1),mode==='individual'?/Reconecta con tu cuerpo/:/Volver a lo conocido/);
   for(let i=0;i<5;i++)h.finishAudio();
   assert.ok(h.page.querySelector('[data-act=explainall]'));
   h.click('next');check(4,mode==='individual'?'04A_Practica_individual':'04B_Practica_en_pareja');
   assert.ok(h.page.querySelector('[data-act=f2toggle]'),'botón táctil Pausar/Iniciar');
   assert.equal(h.page.querySelector('[data-act=nextphase]').disabled,true,'no avanzar sin iniciar');
   h.click('repeataudio');
   assert.match(h.spoken.at(-1),mode==='individual'?/Reconecta con tu cuerpo/:/Volver a lo conocido/,'escuchar paso sirve aun sin iniciar reloj');
   assert.equal(h.writes.length,0);
   h.click('next');assert.match(h.page.querySelector('[role=alert]').textContent,/Inicia los pasos/);
   assert.equal(h.writes.length,0);
   h.click('f2toggle');
   assert.match(h.spoken.at(-1),mode==='individual'?/Reconecta con tu cuerpo/:/Volver a lo conocido/);
   const count=h.spoken.length;
   h.tick(180);
   assert.equal(h.spoken.length,count,'sin transiciones automáticas, tiempo opcional');
   assert.equal(h.page.querySelector('[data-guide-elapsed]').textContent,'03:00');
   h.click('f2toggle');h.tick(30);
   assert.equal(h.page.querySelector('[data-guide-elapsed]').textContent,'03:00','pausa detiene reloj');
   h.click('f2toggle');assert.ok(h.spoken.length>count);
   for(let k=0;k<4;k++)h.click('nextphase');
   assert.match(h.page.querySelector('.spm-f2-active-step strong').textContent,mode==='individual'?/Integra lo que sentiste/:/Cerrar sin expectativas/);
   h.click('next');check(5,'05_Registro_bienestar');
   assert.equal(h.page.querySelectorAll('[data-act=focus2rating]').length,5);
   assert.equal(h.page.querySelectorAll('[data-act=focus2noticed]').length,3);
   const rating=h.page.querySelector('[data-act=focus2rating][data-value="4"]');rating.click();
   assert.equal(rating.getAttribute('aria-pressed'),'true');
   h.page.querySelector('[data-act=focus2noticed][data-value="Más conexión"]').click();
   assert.equal(h.writes.length,0,'bienestar opcional todavía no guarda');
   h.click('next');check(6,'06_Cierre_y_guardado');
   h.page.querySelector('[data-act=approvedchoice][data-field=comfort][data-value=comodo]').click();
   h.page.querySelector('[data-act=approvedchoice][data-field=discomfort][data-value=ninguna]').click();
   h.click('f2extra');
   assert.ok(h.page.querySelector('.spm-f2-extra').hasAttribute('open'));
   const note=h.page.querySelector('.spm-f2-extra [data-field=notes]');note.value='Ejemplo privado';
   note.dispatchEvent(new h.w.Event('input',{bubbles:true}));
   h.click('f2extraclose');
   h.click('save');await pause();
   assert.equal(h.writes.length,1,'una sola escritura');
   assert.equal(h.calls.filter(v=>v==='recordDaily').length,1);
   assert.equal(h.calls.filter(v=>v==='close').length,1,'Finalizar regresa automáticamente a Hoy');
   const rows=JSON.parse(h.records['spm-sensate-records']);
   assert.equal(rows.length,1,'sin duplicación');
   assert.equal(rows[0].day,19);
   assert.equal(rows[0].practiceId,mode==='individual'?'sf-focus-2-solo':'sf-focus-2');
   assert.equal(rows[0].focus2Rating,4);
   assert.deepEqual(rows[0].focus2Noted,['Más conexión']);
   assert.equal(rows[0].completed,true);
   assert.equal(rows[0].modality,mode);
   assert.equal(rows[0].presenceAfter,null);
   assert.equal(rows[0].pressureAfter,null);
   assert.equal(rows[0].notes,'Ejemplo privado');
   assert.ok(h.page.querySelector('.spm-f2-saved'));
   h.click('close');assert.ok(h.calls.includes('close'));
  }finally{h.close()}
 }
});

test('Focus II: acceso sin prerrequisitos y salida anticipada no simula práctica completada',async()=>{
 for(const profile of ['erection','ejaculation','desire']){
  const h=harness({day:19,practiceId:'sf-focus-2',profile});
  try{
   assert.ok(h.page.querySelector('.spm-f2-artwork'));
   assert.equal(h.page.querySelector('[data-act=skip]'),null);
   h.click('next');
   h.branch('individual');
   h.click('next');
   h.click('next');
   assert.match(h.page.querySelector('[role=alert]').textContent,/Inicia los pasos/);
   assert.equal(h.writes.length,0);
   h.click('close');
   assert.equal(h.writes.length,0);
   assert.equal(h.calls.includes('recordDaily'),false);
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

test('all six SPM routes can open Focus I and II without restriction banners or approval gates',()=>{
 for(const profile of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
  for(const practiceId of ['sf-i-1','sf-focus-2']){
   const h=harness({day:practiceId==='sf-focus-2'?19:4,practiceId,profile,restriction:'urgent'});
   try{
    assert.equal(h.page.querySelector('.warning'),null);
    h.click('next');
    if(practiceId==='sf-i-1')h.click('next');
    else {h.branch('individual');}
    assert.match(h.page.textContent,practiceId==='sf-i-1'?/3 \/ 5/:/3 \/ 6/);
    h.click('next');if(practiceId==='sf-i-1')h.page.querySelector('[data-act=s1task][data-value=tarea]').click();else h.click('f2toggle');
    assert.match(h.page.textContent,practiceId==='sf-i-1'?/4 \/ 5/:/4 \/ 6/);
    assert.equal(h.page.querySelector('.warning'),null);
    assert.equal(h.writes.length,0);
   }finally{h.close()}
  }
 }
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


// Regression coverage: first Focus I session keeps real artwork controls on all
// five pages and a voluntary exit from the guided activity with no fake save.
test('Focalización I sesión 1: 5 lienzos táctiles, navegación, audios y salida sin guardado involuntario',async()=>{
 const h=harness({day:4,practiceId:'sf-i-1'});
 const art=()=>h.page.querySelector('.spm-s1-artwork');
 const expected=['01_Conecta_con_tus_sensaciones','02_Tu_practica_individual','03_Tu_practica_guiada','04_Llevalo_a_tu_vida','05_Cierre_de_tu_practica'];
 try{
  for(let i=0;i<5;i++){
   assert.ok(art(),'pantalla '+(i+1));
   assert.match(art().getAttribute('style'),new RegExp('spm-focus-i-s1-'+expected[i]+'.webp'));
   assert.match(art().getAttribute('aria-label'),new RegExp('pantalla '+(i+1)+' de 5'));
   assert.ok(h.page.querySelectorAll('.spm-approved-hit[data-act]').length>=4);
   assert.ok([...h.page.querySelectorAll('.spm-approved-hit')].every(b=>b.getAttribute('aria-label')));
   if(i<4)h.click('next');
  }
  assert.equal(h.writes.length,0);
  const opt=h.page.querySelector('[data-act=focus2rating][data-value="3"]');opt.click();
  assert.equal(opt.getAttribute('aria-pressed'),'true');
  assert.equal(h.writes.length,0);
  h.click('back');assert.match(art().getAttribute('style'),/s1-04_Llevalo_a_tu_vida/);
  h.click('close');assert.ok(h.calls.includes('close'));
  assert.equal(h.writes.length,0,'salir sin pulsar Volver luego no marca actividad completada');
 }finally{h.close()}
 const done=harness({day:4,practiceId:'sf-i-1'});
 try{
  for(let i=0;i<4;i++)done.click('next');
  done.page.querySelector('[data-act=focus2rating][data-value="4"]').click();
  done.page.querySelector('[data-act=focus2noticed][data-value="Más calma"]').click();
  done.page.querySelector('[data-act=approvedchoice][data-field=comfort][data-value=comodo]').click();
  done.click('save');await pause();
  assert.equal(done.writes.length,1);
  assert.equal(done.calls.filter(x=>x==='recordDaily').length,1);
  const record=JSON.parse(done.records['spm-sensate-records'])[0];
  assert.equal(record.lessonCompleted,true);assert.equal(record.intimatePracticeCompleted,null);
  assert.equal(record.wellbeingRating,4);
  assert.deepEqual(record.focus2Noted,['Más calma']);
  assert.ok(done.calls.includes('close'));
 }finally{done.close()}
});

test('Focalización I sesión 1: secuencia de cinco audios mantiene pausa y cancela al cambiar pantalla',()=>{
 const h=harness({day:4,practiceId:'sf-i-1'});
 const pending=[];const realSet=h.w.setTimeout,realClear=h.w.clearTimeout;
 try{
  h.w.setTimeout=(fn,delay)=>{pending.push({fn,delay});return pending.length+123};
  h.w.clearTimeout=()=>{};
  h.click('next');h.click('next');
  assert.match(h.page.querySelector('.spm-s1-artwork').getAttribute('style'),/s1-03_Tu_practica_guiada/);
  h.click('explainall');const initial=h.spoken.length;
  assert.ok(initial>0);
  h.finishAudio();assert.equal(h.spoken.length,initial);
  assert.equal(pending.at(-1).delay,1600);
  pending.at(-1).fn();assert.equal(h.spoken.length,initial+1);
  h.click('next');const afterExit=h.spoken.length;
  pending.at(-1).fn();assert.equal(h.spoken.length,afterExit);
 }finally{h.w.setTimeout=realSet;h.w.clearTimeout=realClear;h.close()}
});

test('Focalización I sesión 1: estilos táctiles de cinco láminas respetan 941×1672 y audio accesible',()=>{
 const css=fs.readFileSync(path.join(root,'premium-v2/sensate-premium-v1.css'),'utf8');
 assert.match(css,/\.spm-s1-artwork\{[^}]*background-color:#f8e6d5;[^}]*background-size:100% 100%/);
 assert.doesNotMatch(css,/\.spm-s1-artwork\{[^}]*background:[^}]*!important/,"el fondo CSS no debe tapar las cinco imágenes aprobadas");
 assert.match(css,/\.spm-s1-artwork \.spm-approved-hit\[data-audio\]/);
 assert.match(css,/\.spm-s1-artwork \.spm-approved-hit\[aria-pressed="true"\]/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(ui,/const SPM_S1_APPROVED_FILES=\[/);
 assert.match(ui,/if\(id==='sf-i-1'&&screen>=0&&screen<=4\)/);
 assert.doesNotMatch(ui,/if\(id==='sf-i-1'&&screen>=0&&screen<=4\)\{root.innerHTML=spmApprovedScreen\(\)/);
});

test('Focalización I sesión 1: los cinco recursos aprobados son únicos y no mezcla fotografías comerciales',()=>{
 const imageNames=['01_Conecta_con_tus_sensaciones','02_Tu_practica_individual','03_Tu_practica_guiada','04_Llevalo_a_tu_vida','05_Cierre_de_tu_practica'];
 for(const name of imageNames){
  const data=fs.readFileSync(path.join(root,'premium-v2/assets/sensate-premium/spm-focus-i-s1-'+name+'.webp'));
  assert.ok(data.length>160000,'recurso real '+name);
  assert.equal(data.toString('ascii',0,4),'RIFF');
  assert.equal(data.toString('ascii',8,12),'WEBP');
 }
 const html=fs.readFileSync(path.join(root,'premium-v2/sensate-lab/index.html'),'utf8');
 assert.equal(html.split('sensate-premium-v1.js').length-1,1);
 assert.match(html,/20261116-foc-i-s1-close-today-v2/);
 assert.ok(!ui.includes('EXTRA_PHOTOS')&&!ui.includes('commercial-cinema/'));
 const h=harness({day:4,practiceId:'sf-i-1'});
 try{
  for(let i=0;i<5;i++){
   assert.ok(h.page.querySelector('.spm-s1-artwork'));
   assert.equal(h.page.querySelectorAll('.spm-art-prep-entry').length,0);
   assert.equal(h.page.querySelectorAll('.spm-approved-intro').length,0);
   if(i<4)h.click('next');
  }
 }finally{h.close()}
});

test('sesión 2: cuatro láminas, botones táctiles y audio, sin falsa práctica íntima',async()=>{
 for(let i=1;i<=4;i++){
  const bytes=fs.readFileSync(path.join(root,'premium-v2/assets/sensate-premium/spm-focus-i-s2-screen-'+i+'-approved.webp'));
  assert.ok(bytes.length>120000);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
 }
 const h=harness({day:8,practiceId:'sf-i-2'});
 try{
  const check=(number)=>{const el=h.page.querySelector('.spm-s2-artwork-screen');assert.ok(el);assert.match(el.getAttribute('style'),new RegExp('screen-'+number+'-approved.webp'));assert.ok(h.page.querySelectorAll('.spm-s2-hit').length>=5);for(const b of h.page.querySelectorAll('.spm-s2-hit'))assert.ok(b.getAttribute('aria-label')&&b.dataset.act)};
  check(1);h.click('audio');assert.match(h.spoken.at(-1),/zonas de tu cuerpo/);
  h.page.querySelector('[data-act=s2value][data-value=atencion]').click();assert.ok(h.page.querySelector('[data-act=s2value][data-value=atencion]').classList.contains('chosen'));
  h.click('approvedread');assert.ok(h.page.querySelector('.spm-s2-info').open);h.click('approvedinfo-close');
  h.click('next');check(2);h.click('audio');assert.match(h.spoken.at(-1),/solo aprenderás la técnica/);
  assert.ok(h.page.querySelector('[data-act=branch][data-value=individual]'));h.click('next');check(3);
  assert.equal(h.page.querySelectorAll('[data-act=explainstep]').length,5);
  h.page.querySelector('[data-act=explainstep][data-value="3"]').click();assert.match(h.spoken.at(-1),/Reconoce tu excitación/);
  assert.ok(h.page.querySelector('[data-act=explainstep][data-value="3"]').classList.contains('chosen'));
  assert.equal(h.writes.length,0);h.click('next');check(4);
  h.page.querySelector('[data-act=s2task][data-value=contactos]').click();assert.match(h.spoken.at(-1),/dos formas de contacto/);
  h.click('audio');assert.match(h.spoken.at(-1),/Tu tarea es practicar/);
  h.click('save');await pause();
  assert.equal(h.writes.length,1);const record=JSON.parse(h.records['spm-sensate-records'])[0];
  assert.equal(record.lessonCompleted,true);assert.equal(record.intimatePracticeCompleted,null);
  assert.equal(h.calls.filter(x=>x==='recordDaily').length,1);
  assert.ok(h.page.querySelector('.spm-s2-saved-overlay'));h.click('close');assert.ok(h.calls.includes('close'));
 }finally{h.close()}
});


test('sesión 3: cuatro imágenes aprobadas, cinco audios, botones táctiles y guardado de aprendizaje independiente',async()=>{
 for(let i=1;i<=4;i++){
  const file=path.join(root,'premium-v2/assets/sensate-premium/spm-focus-i-s3-screen-'+i+'-approved.jpg');
  const bytes=fs.readFileSync(file);
  assert.ok(bytes.length>380000,'foto íntegra '+i);
  assert.equal(bytes[0],0xff);assert.equal(bytes[1],0xd8);
 }
 const h=harness({day:12,practiceId:'sf-i-3'});
 const assertArt=(i)=>{
  const art=h.page.querySelector('.spm-s3-artwork-screen');
  assert.ok(art,'pantalla '+i);
  assert.match(art.getAttribute('style'),new RegExp('screen-'+i+'-approved.jpg'));
  assert.match(art.getAttribute('aria-label'),new RegExp('pantalla '+i+' de 4'));
  const hits=[...h.page.querySelectorAll('.spm-s3-hit')];
  assert.ok(hits.length>=5,'controles reales sobre la imagen');
  assert.ok(hits.every(b=>b.getAttribute('aria-label')&&b.dataset.act));
 };
 try{
  assertArt(1);
  h.click('audio');
  assert.match(h.spoken.at(-1),/la conexión con tu pareja/);
  h.page.querySelector('[data-act=s3concept][data-value=besos]').click();
  assert.match(h.spoken.at(-1),/Besos/);
  assert.equal(h.page.querySelector('[data-act=s3concept][data-value=besos]').getAttribute('aria-pressed'),'true');
  h.page.querySelector('[data-act=s3concept][data-value=cercania]').click();
  assert.match(h.spoken.at(-1),/Cercanía/);
  h.click('approvedread');assert.ok(h.page.querySelector('.spm-s3-info').hasAttribute('open'));
  h.click('approvedinfo-close');
  h.click('next');assertArt(2);
  assert.equal(h.page.querySelector('[data-act=branch]'),null);
  h.click('audio');assert.match(h.spoken.at(-1),/ambos deben desear participar/i);
  h.page.querySelector('[data-act=s3prep][data-value=libertad]').click();
  assert.match(h.spoken.at(-1),/No hay obligación/);
  h.click('next');assertArt(3);
  assert.equal(h.page.querySelectorAll('[data-act=explainstep]').length,5);
  for(let i=0;i<5;i++){
   const b=h.page.querySelector('[data-act=explainstep][data-value="'+i+'"]');
   assert.ok(b);b.click();
   assert.equal(h.page.querySelector('[data-act=explainstep][data-value="'+i+'"]').getAttribute('aria-pressed'),'true');
  }
  assert.match(h.spoken.at(-1),/Regresen a las sensaciones/);
  assert.equal(h.writes.length,0);
  h.click('next');assertArt(4);
  assert.equal(h.page.querySelector('[data-act=startguide]'),null,'sin práctica cronometrada');
  h.page.querySelector('[data-act=s3task][data-value=volver]').click();
  assert.match(h.spoken.at(-1),/si fallo/);
  h.click('audio');assert.match(h.spoken.at(-1),/Tu tarea en pareja/);
  h.click('back');assertArt(3);h.click('next');assertArt(4);
  h.click('save');await pause();
  assert.equal(h.writes.length,1,'no duplicate');
  const row=JSON.parse(h.records['spm-sensate-records'])[0];
  assert.equal(row.practiceId,'sf-i-3');
  assert.equal(row.day,12);
  assert.equal(row.modality,'partner');
  assert.equal(row.completed,true);
  assert.equal(row.lessonCompleted,true);
  assert.equal(row.intimatePracticeCompleted,null);
  assert.equal(row.lessonFormat,'learn-now-practice-later');
  assert.equal(h.calls.filter(x=>x==='recordDaily').length,1);
  assert.ok(h.page.querySelector('.spm-s3-saved-overlay'));
  h.click('close');assert.ok(h.calls.includes('close'));
 }finally{h.close()}
});


test('sesión 4: cuatro imágenes completas, interacción táctil, audios correctos y finalización única',async()=>{
 for(let i=1;i<=4;i++){
  const bytes=fs.readFileSync(path.join(root,'premium-v2/assets/sensate-premium/spm-focus-i-s4-screen-'+i+'-approved.jpg'));
  assert.ok(bytes.length>390000,'asset JPEG aprobado '+i);
  assert.equal(bytes[0],0xff);assert.equal(bytes[1],0xd8);
 }
 const h=harness({day:23,practiceId:'sf-i-4'});
 const check=(i)=>{
  const art=h.page.querySelector('.spm-s4-artwork-screen');
  assert.ok(art,'lámina funcional '+i);
  assert.match(art.getAttribute('style'),new RegExp('screen-'+i+'-approved.jpg'));
  assert.match(art.getAttribute('aria-label'),new RegExp('pantalla '+i+' de 4'));
  const touches=[...h.page.querySelectorAll('.spm-s4-hit')];
  assert.ok(touches.length>=5,'zonas táctiles reales');
  assert.ok(touches.every(b=>b.dataset.act&&b.getAttribute('aria-label')));
 };
 try{
  check(1);h.click('audio');
  assert.match(h.spoken.at(-1),/expresar lo agradable/);
  for(const [key,label] of [['claridad','Claridad'],['respeto','Respeto'],['conexion','Conexión']]){
   h.page.querySelector('[data-act=s4concept][data-value='+key+']').click();
   assert.match(h.spoken.at(-1),new RegExp(label));
   assert.equal(h.page.querySelector('[data-act=s4concept][data-value='+key+']').getAttribute('aria-pressed'),'true');
  }
  h.click('approvedread');
  assert.equal(h.page.querySelector('.spm-s4-info').hasAttribute('open'),true);
  h.click('approvedinfo-close');
  h.click('next');check(2);
  assert.equal(h.page.querySelector('[data-act=branch]'),null,'sin elección redundante de modalidad');
  h.click('audio');assert.match(h.spoken.at(-1),/hablar de lo que disfrutas/);
  for(const [key,phrase] of [['simple','Exprésalo simple'],['ajuste','Pide ajustes'],['escucha','Escucha también']]){
   h.page.querySelector('[data-act=s4prep][data-value='+key+']').click();
   assert.match(h.spoken.at(-1),new RegExp(phrase));
  }
  h.click('next');check(3);
  assert.equal(h.page.querySelectorAll('[data-act=explainstep]').length,5);
  for(const [idx,phrase] of ['Observa qué disfrutas','Exprésalo con claridad','Pide cambios con suavidad','Escucha la respuesta','Confirma lo que se sintió bien'].entries()){
   h.page.querySelector('[data-act=explainstep][data-value="'+idx+'"]').click();
   assert.match(h.spoken.at(-1),new RegExp(phrase));
   assert.equal(h.page.querySelector('[data-act=explainstep][data-value="'+idx+'"]').getAttribute('aria-pressed'),'true');
  }
  assert.equal(h.writes.length,0,'escuchar no implica registrar práctica íntima');
  h.click('next');check(4);
  assert.equal(h.page.querySelector('[data-act=startguide]'),null,'sin cronometrar tarea de otro momento');
  for(const key of ['frase','observa','calma','ancla']){
   h.page.querySelector('[data-act=s4task][data-value='+key+']').click();
   assert.equal(h.page.querySelector('[data-act=s4task][data-value='+key+']').getAttribute('aria-pressed'),'true');
  }
  h.click('audio');assert.match(h.spoken.at(-1),/En un momento de cercanía/);
  h.click('back');check(3);h.click('next');check(4);
  h.click('save');await pause();
  assert.equal(h.writes.length,1,'sin registros duplicados');
  const rec=JSON.parse(h.records['spm-sensate-records'])[0];
  assert.equal(rec.day,23);assert.equal(rec.practiceId,'sf-i-4');
  assert.equal(rec.modality,'partner');assert.equal(rec.completed,true);
  assert.equal(rec.lessonCompleted,true);
  assert.equal(rec.intimatePracticeCompleted,null);
  assert.equal(rec.lessonFormat,'learn-now-practice-later');
  assert.equal(h.calls.filter(x=>x==='recordDaily').length,1);
  assert.ok(h.page.querySelector('.spm-s4-saved-overlay'));
  h.click('close');assert.ok(h.calls.includes('close'));
 }finally{h.close()}
});


test('sesión 4: audios menos repetitivos y halo en los 18 botones narrados',()=>{
 const css=fs.readFileSync(path.join(root,'premium-v2/sensate-premium-v1.css'),'utf8');
 assert.match(css,/\.spm-s4-artwork-screen \.spm-s4-hit\[data-audio\]\s*\{/);
 assert.match(css,/@keyframes spm-s4-audio-invite/);
 assert.match(css,/\.spm-s4-artwork-screen \.spm-s4-hit\[data-audio\]\.playing/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 const h=harness({day:23,practiceId:'sf-i-4'});
 const assertHaloCount=expected=>{
  const all=[...h.page.querySelectorAll('.spm-s4-hit[data-audio]')];
  assert.equal(all.length,expected,'todos los controles narrados mantienen halo táctil');
  assert.ok(all.every(button=>!button.disabled&&button.getAttribute('aria-label')));
  assert.ok(h.page.querySelector('[data-act=next]:not([data-audio])') || expected===5,'no se añade halo a navegación');
 };
 try{
  assertHaloCount(4);
  h.click('next');assertHaloCount(4);
  h.click('audio');
  const prep=h.spoken.at(-1);
  for(const text of ['Me encantan tus caricias','Acércate más','Espera un momento, quiero disfrutar esta sensación'])assert.ok(prep.includes(text));
  assert.doesNotMatch(prep,/Me gusta así|Más suave/);
  h.click('next');assertHaloCount(5);
  h.page.querySelector('[data-act=explainstep][data-value="2"]').click();
  const step=h.spoken.at(-1);
  assert.match(step,/No te detengas, me encanta/);
  assert.match(step,/Sigue así/);
  assert.doesNotMatch(step,/más suave, más lento/);
  h.click('next');assertHaloCount(5);
  for(const key of ['frase','observa','calma','ancla']){
   const button=h.page.querySelector('[data-act=s4task][data-value="'+key+'"]');
   assert.ok(button.hasAttribute('data-audio'),'cada tarjeta ofrece narración');
   button.click();
   assert.ok(h.spoken.at(-1).length>30);
   assert.ok(h.page.querySelector('[data-act=s4task][data-value="'+key+'"]').classList.contains('chosen'));
  }
  h.click('audio');
  const closing=h.spoken.at(-1);
  assert.match(closing,/Sigue así, me encanta/);
  assert.match(closing,/Quiero que me beses/);
  assert.doesNotMatch(closing,/Me gusta así|Más suave o Más lento/);
  assert.equal(h.writes.length,0,'escuchar audios no marca completada la sesión');
 }finally{h.close()}
});


test('sesión 5: cuatro láminas aprobadas, 18 audios táctiles y guardado seguro sin duplicidad',async()=>{
 for(let i=1;i<=4;i++){
  const img=fs.readFileSync(path.join(root,'premium-v2/assets/sensate-premium/spm-focus-i-s5-screen-'+i+'-approved.jpg'));
  assert.ok(img.length>400000,'fotografía íntegra '+i);
  assert.equal(img[0],0xff);assert.equal(img[1],0xd8);
 }
 const css=fs.readFileSync(path.join(root,'premium-v2/sensate-premium-v1.css'),'utf8');
 assert.match(css,/\.spm-s5-artwork-screen \.spm-s5-hit\[data-audio\]/);
 assert.match(css,/@keyframes spm-s5-audio-invite/);
 assert.match(css,/\.spm-s5-artwork-screen \.spm-s5-hit\[data-audio\]\.playing/);
 const h=harness({day:26,practiceId:'sf-i-5'});
 const check=(n,count)=>{
  const art=h.page.querySelector('.spm-s5-artwork-screen');
  assert.ok(art,'pantalla '+n);
  assert.match(art.getAttribute('style'),new RegExp('screen-'+n+'-approved.jpg'));
  assert.match(art.getAttribute('aria-label'),new RegExp('pantalla '+n+' de 4'));
  const targets=[...h.page.querySelectorAll('.spm-s5-hit')];
  assert.ok(targets.length>=5);
  assert.ok(targets.every(b=>b.dataset.act&&b.getAttribute('aria-label')));
  const audio=targets.filter(b=>b.hasAttribute('data-audio'));
  assert.equal(audio.length,count,'todos los audios se ven e invitan a pulsar');
  assert.ok(audio.every(b=>!b.disabled));
 };
 try{
  check(1,4);h.click('audio');
  assert.match(h.spoken.at(-1),/integrarás lo que te ha ayudado/);
  for(const [key,word] of [['integracion','Integración'],['disfrute','Disfrute'],['conexion','Conexión']]){
   h.page.querySelector('[data-act=s5concept][data-value='+key+']').click();
   assert.match(h.spoken.at(-1),new RegExp(word));
   assert.equal(h.page.querySelector('[data-act=s5concept][data-value='+key+']').getAttribute('aria-pressed'),'true');
  }
  h.click('approvedread');assert.ok(h.page.querySelector('.spm-s5-info').hasAttribute('open'));h.click('approvedinfo-close');
  h.click('next');check(2,4);
  assert.equal(h.page.querySelector('[data-act=branch]'),null,'sin segunda modalidad');
  h.click('audio');assert.match(h.spoken.at(-1),/elijan un momento tranquilo/);
  for(const [key,word] of [['caricia','Retomen una caricia'],['palabras','Digan con calma'],['bienestar','Quédense donde']]){
   h.page.querySelector('[data-act=s5prep][data-value='+key+']').click();
   assert.match(h.spoken.at(-1),new RegExp(word));
  }
  h.click('next');check(3,5);
  assert.equal(h.page.querySelectorAll('[data-act=explainstep]').length,5);
  for(const [i,word] of ['Empiecen con calma','Retomen una caricia agradable','Ajusten con palabras simples','Quédense donde hay bienestar','Cierren y recuerden'].entries()){
   h.page.querySelector('[data-act=explainstep][data-value="'+i+'"]').click();
   assert.match(h.spoken.at(-1),new RegExp(word));
   assert.equal(h.page.querySelector('[data-act=explainstep][data-value="'+i+'"]').getAttribute('aria-pressed'),'true');
  }
  assert.equal(h.writes.length,0,'escuchar no marca realizada la experiencia');
  h.click('next');check(4,5);
  assert.equal(h.page.querySelector('[data-act=startguide]'),null,'la pantalla cronometrada vieja ya no está activa');
  for(const key of ['caricia','frase','tension','ancla']){
   h.page.querySelector('[data-act=s5task][data-value='+key+']').click();
   assert.ok(h.spoken.at(-1).length>35);
   assert.equal(h.page.querySelector('[data-act=s5task][data-value='+key+']').getAttribute('aria-pressed'),'true');
  }
  h.click('audio');assert.match(h.spoken.at(-1),/Cuando estén a gusto/);
  h.click('back');check(3,5);h.click('next');check(4,5);
  h.click('save');await pause();
  assert.equal(h.writes.length,1,'sin registros duplicados');
  const rec=JSON.parse(h.records['spm-sensate-records'])[0];
  assert.equal(rec.day,26);assert.equal(rec.practiceId,'sf-i-5');
  assert.equal(rec.modality,'partner');assert.equal(rec.completed,true);
  assert.equal(rec.lessonCompleted,true);
  assert.equal(rec.intimatePracticeCompleted,null);
  assert.equal(rec.lessonFormat,'learn-now-practice-later');
  assert.equal(h.calls.filter(x=>x==='recordDaily').length,1);
  assert.ok(h.page.querySelector('.spm-s5-saved-overlay'));
  h.click('close');assert.ok(h.calls.includes('close'));
 }finally{h.close()}
});


test('Sesión 1: el botón Cerrar sustituye Volver luego, guarda aprendizaje y retorna a Hoy sin continuación',async()=>{
 const h=harness({day:4,practiceId:'sf-i-1'});
 try{
  for(let i=0;i<4;i++)h.click('next');
  const button=h.page.querySelector('.spm-s1-close-button');
  assert.ok(button,'Existe un control real superpuesto a la quinta lámina');
  assert.equal(button.textContent.trim(),'Cerrar');
  assert.equal(button.dataset.act,'save');
  assert.match(button.getAttribute('aria-label'),/volver a Hoy/);
  button.click();await pause();
  assert.equal(h.writes.length,1);
  assert.equal(h.calls.filter(x=>x==='recordDaily').length,1);
  assert.deepEqual(h.closeArgs,[false],'retorna directamente a Hoy, sin pantalla de continuación');
  const record=JSON.parse(h.records['spm-sensate-records'])[0];
  assert.equal(record.lessonCompleted,true);
  assert.equal(record.intimatePracticeCompleted,null);
 }finally{h.close()}
 const exiting=harness({day:4,practiceId:'sf-i-1'});
 try{
  exiting.click('close');await pause();
  assert.deepEqual(exiting.closeArgs,[false],'también sale directamente a Hoy desde encabezado');
  assert.equal(exiting.writes.length,0,'el cierre anticipado no guarda una actividad');
 }finally{exiting.close()}
});

test('Vista de revisión: Cerrar realmente oculta la sesión y muestra Hoy en vez de dejar el iframe visible',async()=>{
 const html=fs.readFileSync(path.join(root,'premium-v2/revision-focalizacion-i-sesion-1.html'),'utf8');
 const dom=new JSDOM(html,{url:'https://spm.test/premium-v2/revision-focalizacion-i-sesion-1.html',runScripts:'outside-only'});
 try{
  const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script,'la vista de revisión contiene su puente simulado');
  dom.window.eval(script);
  const {document,SPM_SENSATE_LAB_HOST:host}=dom.window;
  assert.equal(document.getElementById('qaToday').hidden,true);
  await host.close(false);
  assert.equal(document.getElementById('qaFrame').hidden,true,'la sesión deja de verse');
  assert.equal(document.getElementById('qaToday').hidden,false,'se presenta Hoy');
  assert.match(document.getElementById('qaStatus').textContent,/Has regresado a Hoy/);
  assert.match(document.querySelector('[data-qa-outcome]').textContent,/sin guardar/);
 }finally{dom.window.close()}
});

test('CSS de sesión 1 tapa el texto Volver luego original con un botón visual Cerrar',()=>{
 const css=fs.readFileSync(path.join(root,'premium-v2/sensate-premium-v1.css'),'utf8');
 assert.match(css,/\.spm-s1-artwork \.spm-approved-hit\.spm-s1-close-button\{/);
 assert.match(css,/\.spm-s1-artwork \.spm-s1-close-button>span\{/);
 assert.match(css,/background:linear-gradient\(110deg,#fce6bd,#e8b252\)!important/);
 assert.doesNotMatch(css,/\.spm-s1-artwork\{[^}]*background:[^}]*!important/);
});
