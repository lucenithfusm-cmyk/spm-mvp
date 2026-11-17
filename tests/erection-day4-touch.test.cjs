const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('premium-v2/erection-day4-touch-v1.js');
const css=read('premium-v2/erection-day4-touch-v1.css');
const bridge=read('premium-v2/erection-day4-bridge-v1.js');
const review=read('premium-v2/revision-ereccion-dia4.html');
const live=read('premium-v2/live.html');
const release=read('premium-v2/spm-active-module-release-v1.js');
const clinical=read('premium-v2/erection-practice-v1.js');
test('tres láminas originales preservadas como imágenes WebP sin redibujar',()=>{
 for(let n=1;n<=3;n++){
  const name=`premium-v2/assets/erection-day4/spm-de-day4-screen-0${n}.webp`;
  const b=fs.readFileSync(path.join(root,name));
  assert.ok(b.length>100000);
  assert.equal(b.toString('ascii',0,4),'RIFF');
  assert.equal(b.toString('ascii',8,12),'WEBP');
 }
 assert.match(js,/spm-de-day4-screen-0/);
 assert.match(css,/aspect-ratio:1080\/1920/);
});
test('zonas táctiles y guías de pantalla y de los tres pasos con pulso',()=>{
 for(const v of ['temperature','contact','rhythm','returned','difficult','no_checking'])assert.ok(js.includes(v));
 assert.match(js,/data-ed4-action/);
 assert.match(js,/data-ed4-audio/);
 assert.match(js,/const STEPS=\[/);
 assert.match(js,/talk\(m,'step'\+index,STEPS\[index\]\)/);
 assert.match(js,/SpeechSynthesisUtterance/);
 assert.match(js,/speechSynthesis\?\.cancel/);
 assert.match(js,/if\(m\.sense===v\)over\+=marker/);
 assert.match(js,/if\(m\.result===v\)over\+=marker/);
 assert.match(css,/\.spm-ed4-check/);
 assert.match(css,/pointer-events:none/);
 assert.match(css,/\.spm-ed4-hit\.audio\.playing/);
});
test('el cronómetro es opcional, visible, con pausa y límite de cinco minutos',()=>{
 assert.match(js,/const MAX_MS=300000/);
 assert.match(js,/data-ed4-timer-output/);
 assert.match(js,/timerUsed\?Math.min\(300/);
 assert.match(js,/if\(m\.timerStart!==null\)\{pauseTimer\(m\);clockUI\(m\);return\}/);
 assert.match(js,/seconds:m\.timerUsed\?/);
});
test('la cuarta sesión se guarda el día 9 sin marcar acciones ajenas',()=>{
 assert.match(clinical,/if\(lesson===4\)return senses\.includes\(record\.attentionSense\)/);
 assert.match(bridge,/Number\(c\.day\)!==9/);
 assert.match(bridge,/c\.primary!=='erection'/);
 assert.ok(bridge.includes("saveActivity('main',{...record,day:9,erectionLesson:4},s,9)"));
 assert.match(js,/erectionPracticeVersion:1,day:m\.calendarDay,erectionLesson:4/);
 assert.match(js,/attentionSense:m\.sense,practiceExperience:m\.result/);
 assert.match(js,/if\(!m\.result\)/);
 assert.match(js,/if\(m\.host\.isConnected\)\{try\{m\.onBack\(\)\}/);
 assert.match(review,/spm-review:day9/);
 assert.match(review,/Datos simulados/);
});
test('única ruta actual y versiones de días anteriores intactas',()=>{
 for(const s of ['erection-day4-touch-v1.css','erection-day4-touch-v1.js','erection-day4-bridge-v1.js'])assert.match(live,new RegExp(s.replace('.','\\.')));
 assert.ok(live.indexOf('erection-day4-bridge-v1.js')>live.indexOf('erection-day2-bridge-v1.js'));
 assert.ok(live.indexOf('erection-day4-bridge-v1.js')<live.indexOf('daily-practice-v1.js'));
 for(const n of [1,3,6,9])assert.match(release,new RegExp(n+':Object\\.freeze'));
 assert.match(release,/9:Object\.freeze/);
 const routes=read('vercel.json');assert.match(routes,/program-paused\.html/);
});
test('La sesión 4 se abre el día 9 desde Hoy y la revisión general',()=>{
 const central=read('premium-v2/program-review-v1.js');
 const html=read('premium-v2/revision-programas-28-dias.html');
 const old=read('premium-v2/erectile-function-route.js');
 assert.match(central,/erection-day4-touch-v1\.js\?v=20261117-erection10x28-v1/);
 assert.match(central,/erection-day4-bridge-v1\.js\?v=20261117-erection10x28-v1/);
 assert.match(html,/erection-day4-touch-v1\.css\?v=20261117-approved3/);
 assert.ok(old.includes("if(c?.primary==='erection'&&window.SPM_DAILY_PRACTICE?.open)"));
 assert.ok(old.includes('const slot=window.SPM_ERECTION_10_SCHEDULE?.slot(d)'));
});
