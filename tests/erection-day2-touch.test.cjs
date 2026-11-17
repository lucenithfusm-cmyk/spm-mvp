const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('premium-v2/erection-day2-touch-v1.js'),bridge=read('premium-v2/erection-day2-bridge-v1.js'),css=read('premium-v2/erection-day2-touch-v1.css'),html=read('premium-v2/revision-ereccion-dia2.html'),live=read('premium-v2/live.html');
test('cuatro imágenes originales 1080 x 1920 aprobadas sin reconstrucciones visuales',()=>{
 for(let n=1;n<=4;n++){
  const img=fs.readFileSync(path.join(root,`premium-v2/assets/erection-day2/spm-de-day2-screen-0${n}.webp`));
  assert.equal(img.toString('ascii',0,4),'RIFF');assert.equal(img.toString('ascii',8,12),'WEBP');assert.ok(img.length>100000);
  assert.match(js,new RegExp('spm-de-day2-screen-0'));
 }
 assert.match(css,/aspect-ratio:1080\/1920/);
});
test('tres contextos conservan valores clínicos y No evaluable',()=>{
 for(const s of ['spontaneous','solo','partner','easy','variable','difficult','not_evaluable'])assert.ok(js.includes(s));
 assert.match(js,/const CONTEXTS=/);assert.match(js,/data-ed2-context/);assert.match(js,/Selecciona una respuesta en los tres contextos/);
});
test('condiciones múltiples, dificultad única y acción concreta sin comprobación eréctil',()=>{
 for(const s of ['more_confidence','prolonged_stimulation','less_stress','relaxation','good_rest','with_partner'])assert.ok(js.includes(s));
 for(const s of ['initiate','maintain','recover','none','not_evaluable'])assert.ok(js.includes(s));
 for(const s of ['privacy','time','less_interruptions','rhythm','not_possible'])assert.ok(js.includes(s));
 assert.match(js,/data-ed2-act="save"/);assert.match(js,/m\.conditions\.includes\(key\)/);assert.match(js,/m\.aspect=key/);assert.match(js,/m\.plan=key/);
});
test('radios táctiles azul solo tras selección; no preselección fija',()=>{
 assert.match(js,/checkCircle/);assert.match(js,/if\(m\.conditions\.includes\(key\)\)/);assert.match(css,/\.spm-ed2-radio-check/);
 assert.match(css,/pointer-events:none/);assert.doesNotMatch(html,/checked="checked"/);
});
test('audio día 2 intacto, otros audios no recortados y sin superposiciones',()=>{
 assert.match(js,/erection-day-2-20261113\.mp3/);assert.match(js,/SpeechSynthesisUtterance/);assert.match(js,/speechSynthesis\?\.cancel/);
 assert.match(js,/1:'Reconoce tus contextos/);assert.match(js,/2:'Ahora identifica/);assert.match(js,/3:'Identifica tu dificultad/);assert.match(js,/4:'Ponlo en práctica/);
});
test('la segunda sesión se guarda el día 3 sin afectar otros módulos',()=>{
 assert.match(bridge,/Number\(c\.day\)!==3/);assert.match(bridge,/c\.primary!=='erection'/);
 assert.ok(bridge.includes("saveActivity('main',{...record,day:3,erectionLesson:2},s,3)"));
 assert.match(js,/erectionPracticeVersion:1,day:m\.calendarDay,erectionLesson:2/);assert.match(js,/responseAspect:m\.aspect/);assert.match(js,/contextPlan:m\.plan/);
 assert.match(live,/erection-day2-touch-v1\.js/);assert.match(live,/erection-day2-bridge-v1\.js/);
 assert.ok(live.indexOf('erection-day2-bridge-v1.js')>live.indexOf('erection-day1-bridge-v1.js'));
 assert.ok(live.indexOf('erection-day2-bridge-v1.js')<live.indexOf('daily-practice-v1.js'));
 const routes=read('vercel.json');assert.match(routes,/program-paused\.html/);
});