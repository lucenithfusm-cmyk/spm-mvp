const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('premium-v2/erection-day8-touch-v1.js');
const css=read('premium-v2/erection-day8-touch-v1.css');
const bridge=read('premium-v2/erection-day8-bridge-v1.js');
const page=read('premium-v2/revision-ereccion-dia21.html');
const ctx={window:{addEventListener(){}}};
vm.runInNewContext(js,ctx);
const touch=ctx.window.SPM_ED_DAY8_TOUCH;
test('Día 21: tres láminas premium originales optimizadas, sin imágenes ajenas',()=>{
 for(let i=1;i<=3;i++){
  const path='premium-v2/assets/erection-day8/spm-de-day8-screen-0'+i+'.webp';
  const buf=fs.readFileSync(root+'/'+path);
  assert.ok(buf.length>200000);
  assert.equal(buf.toString('ascii',0,4),'RIFF');
  assert.equal(buf.toString('ascii',8,12),'WEBP');
  assert.equal(touch.images[i-1],'/'+path);
 }
 assert.equal(touch.images.length,3);
 assert.match(css,/aspect-ratio:1080\/1920/);
 assert.match(js,/spm-ed8-artwork/);
 assert.match(page,/erection-day8-touch-v1\.css/);
});
test('Tres narraciones completas, voz estándar del dispositivo sin Rocío/Sofía',()=>{
 assert.equal(touch.voiceMode,'device-default');
 assert.equal(touch.guides.length,3);
 assert.match(touch.guides[0],/Esta es una habilidad que podrás utilizar/);
 assert.match(touch.guides[1],/evitar posiciones incómodas o dolorosas/);
 assert.match(touch.guides[2],/continúa con las actividades de hoy/);
 assert.match(js,/new window\.SpeechSynthesisUtterance\(GUIDES\[m\.page-1\]\)/);
 assert.match(js,/window\.speechSynthesis\.speak\(u\)/);
 assert.doesNotMatch(js,/new window\.Audio\(|\.voice\s*=\s*voices\.find\(/);
 assert.match(js,/stopVoice\(m\);pauseTimer\(m\);m\.page=/);
 const clinical=read('premium-v2/erection-practice-v1.js');
 assert.match(clinical,/\[6,7,8\]\.includes\(lesson\)\?null/);
});
test('Pantalla 1: iniciar práctica y cronómetro opcional, sin tiempo mínimo',()=>{
 assert.match(js,/hit\(\[575,1492,1046,1620\],'timer'/);
 assert.match(js,/hit\(\[30,1492,561,1620\],'practice'/);
 assert.match(js,/setInterval\(\(\)=>/);
 assert.match(js,/clearInterval\(m\.timer\)/);
 assert.match(js,/m\.started=true/);
 assert.match(js,/m\.seconds=0/);
 assert.match(js,/erectionPracticeStarted:Boolean\(m\.started\)/);
 assert.match(js,/erectionOptionalTimerSeconds:m\.seconds/);
 assert.doesNotMatch(js,/if\(!m\.started\)\{alertRequired/);
 assert.doesNotMatch(js,/if\(m\.seconds<\d+\)/);
});
test('Pantalla 2: varias posiciones favorables, desconocido exclusivo, menos favorable opcional',()=>{
 assert.deepEqual([...touch.favorable],['tu_encima','pareja_encima','de_lado','sentado','de_pie','otra','no_evaluable']);
 assert.deepEqual([...touch.unfavorable],['tu_encima','pareja_encima','de_lado','sentado','de_pie','otra']);
 assert.match(js,/if\(key==='no_evaluable'\)m\.favorable=/);
 assert.match(js,/m\.favorable=\[\.\.\.m\.favorable\.filter\(k=>k!=='no_evaluable'\),key\]/);
 assert.match(js,/m\.unfavorable==='no_identificada'/);
 assert.match(js,/data-ed8-select/);
 assert.match(js,/m\.unfavorable=BAD_KEYS\.includes\(value\)\?value:null/);
 assert.match(js,/erectionFavorablePositions:m\.favorable\.slice\(\)/);
 assert.match(js,/erectionLessFavorablePosition:m\.unfavorable\|\|null/);
 assert.match(js,/if\(next>m\.page&&m\.page===2&&!m\.favorable\.length\)/);
});
test('Pantalla 3: una sola estrategia, aviso centrado si falta respuesta',()=>{
 assert.deepEqual([...touch.strategies],['maintain_stimulus','favor_position','switch_position','pause','observe']);
 assert.match(js,/m\.strategy=key/);
 assert.match(js,/erectionChosenStrategy:m\.strategy/);
 assert.match(js,/if\(!m\.strategy\)\{alertRequired/);
 assert.match(js,/SPM_ERECTION_TOUCH_VIEW\?\.warn\?\.\(m\.host,txt\)/);
 const modal=read('premium-v2/erection-fullscreen-v1.js');
 const modalCss=read('premium-v2/erection-fullscreen-v1.css');
 assert.match(modal,/role="alertdialog"/);
 assert.match(modalCss,/\.spm-er-alert-layer/);
 assert.match(modalCss,/place-items:center/);
 assert.match(modalCss,/background:rgba\(2,19,35,.55\)/);
});
test('Guardado real en Hoy del Día 21 y regreso sin avanzar a otro día',()=>{
 assert.match(bridge,/Number\(c\.day\)!==21/);
 assert.match(bridge,/c\.primary!=='erection'/);
 assert.match(bridge,/SPM_DAILY_RECORDS\.read\(s,21\)/);
 assert.match(bridge,/saved\.erectionLesson===8/);
 assert.match(bridge,/calendarDay:21/);
 assert.match(bridge,/erectionLesson:8/);
 assert.ok(bridge.includes("saveActivity('main',{...record,day:21,erectionLesson:8},s,21)"));
 assert.match(js,/erectionPracticeVersion:1,day:m\.calendarDay,erectionLesson:8/);
 assert.match(js,/m\.onBack\(\)/);
 assert.doesNotMatch(js,/localStorage\./);
 const clinical=read('premium-v2/erection-practice-v1.js');
 assert.match(clinical,/if\(lesson===8\)return Array\.isArray\(record\.erectionFavorablePositions\)/);
 assert.match(clinical,/positionStrategies\.includes\(record\.erectionChosenStrategy\)/);
 assert.match(clinical,/record\.erectionLessFavorablePosition==null/);
});
test('Octava sesión en Día 21; 14/28 son evaluaciones y la pausa comercial se conserva',()=>{
 const ctx={window:{}};vm.runInNewContext(read('premium-v2/erection-ten-schedule-v1.js'),ctx);
 const schedule=ctx.window.SPM_ERECTION_10_SCHEDULE;
 assert.equal(schedule.integrated,8);
 assert.equal(schedule.isReady(21),true);
 assert.equal(schedule.isReady(24),false);
 assert.deepEqual([...schedule.evaluationDays],[14,28]);
 const released=read('premium-v2/spm-active-module-release-v1.js');
 assert.match(released,/21:Object\.freeze/);
 assert.match(released,/module:'SPM_ED_DAY8_TOUCH',bridge:'SPM_ERECTION_DAY8_BRIDGE'/);
 const live=read('premium-v2/live.html');
 const reviewer=read('premium-v2/program-review-v1.js');
 const reviewerHtml=read('premium-v2/revision-programas-28-dias.html');
 for(const p of ['erection-day8-touch-v1.js','erection-day8-bridge-v1.js']){
  assert.ok(live.includes(p));
  assert.ok(reviewer.includes(p));
 }
 assert.ok(live.indexOf('erection-day8-bridge-v1.js')<live.indexOf('daily-practice-v1.js'));
 assert.ok(live.includes('erection-day8-touch-v1.css'));
 assert.ok(reviewerHtml.includes('erection-day8-touch-v1.css'));
 assert.ok(read('vercel.json').includes('program-paused.html'));
});
