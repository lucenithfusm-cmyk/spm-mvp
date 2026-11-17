const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('premium-v2/erection-day5-touch-v1.js');
const css=read('premium-v2/erection-day5-touch-v1.css');
const bridge=read('premium-v2/erection-day5-bridge-v1.js');
test('Día 12 conserva tres láminas aprobadas como fondos táctiles 1080x1920',()=>{
 for(let n=1;n<=3;n++){
  const f='premium-v2/assets/erection-day5/spm-de-day5-screen-0'+n+'.webp';
  const buf=fs.readFileSync(path.join(root,f));
  assert.ok(buf.length>90000);
  assert.equal(buf.toString('ascii',0,4),'RIFF');
  assert.equal(buf.toString('ascii',8,12),'WEBP');
 }
 assert.match(js,/spm-de-day5-screen-0/);
 assert.match(css,/aspect-ratio:1080\/1920/);
 assert.match(js,/data-ed5-action/);
});
test('facilitadores 3, inhibidores 2, desconocido exclusivo, ajuste único',()=>{
 for(const key of ['contact','imagination','anticipation','novelty','rhythm','privacy','connection','solo','unknown'])assert.ok(js.includes("'"+key+"'"));
 for(const key of ['pressure','rush','fatigue','stress','communicate','observe'])assert.ok(js.includes("'"+key+"'"));
 assert.ok(js.includes('length>=3'));
 assert.ok(js.includes('length>=2'));
 assert.ok(js.includes("if(key==='unknown')"));
 assert.match(js,/m\.facilitators\.filter\(v=>v!=='unknown'\)/);
 assert.match(js,/m\.inhibitors\.filter\(v=>v!=='unknown'\)/);
 assert.match(js,/m\.adjustment=key/);
});
test('bocinas por pantalla y segmentos del audio original del día 5',()=>{
 assert.ok(js.includes('erection-day-5-20261113.mp3'));
 assert.ok(js.includes('const AUDIO_SECTIONS=[[0,17],[17,33],[33,49.76325]]'));
 assert.match(js,/audio\.play\(\)/);
 assert.match(js,/loadedmetadata/);
 assert.match(js,/if\(audio\.currentTime>=end-0\.08\)/);
 assert.match(js,/window\.speechSynthesis\?\.cancel/);
 assert.match(css,/\.spm-ed5-hit\.audio\.playing/);
});
test('registro central y regreso manual a Hoy en día 12, sin alterar otros módulos',()=>{
 assert.match(bridge,/Number\(c\.day\)!==12/);
 assert.match(bridge,/c\.primary!=='erection'/);
 assert.match(bridge,/erectionLesson:5/);
 assert.ok(bridge.includes("saveActivity('main',{...record,day:12,erectionLesson:5},s,12)"));
 assert.match(js,/erectionPracticeVersion:1,day:m\.calendarDay,erectionLesson:5/);
 assert.match(js,/erectionFacilitators:m\.facilitators\.slice\(\)/);
 assert.match(js,/microAdjustment:m\.adjustment/);
 assert.match(js,/m\.onBack\(\)/);
 const ctx={window:{addEventListener:()=>{}}};vm.runInNewContext(js,ctx);
 assert.equal(ctx.window.SPM_ED_DAY5_TOUCH.images.length,3);
 assert.deepEqual([...ctx.window.SPM_ED_DAY5_TOUCH.fields],['erectionFacilitators','erectionInhibitors','microAdjustment']);
});
test('solo se activa la sesión 5, calendario y pausa comercial conservados',()=>{
 const schedule=read('premium-v2/erection-ten-schedule-v1.js');
 const clinical=read('premium-v2/erection-practice-v1.js');
 const release=read('premium-v2/spm-active-module-release-v1.js');
 const live=read('premium-v2/live.html'),review=read('premium-v2/program-review-v1.js');
 assert.match(schedule,/const integrated=5;/);
 assert.match(clinical,/if\(lesson===5\)return selection\(record\.erectionFacilitators/);
 assert.match(release,/12:Object\.freeze/);
 for(const file of ['erection-day5-touch-v1.js','erection-day5-bridge-v1.js']){
  assert.ok(live.includes(file));assert.ok(review.includes(file));
 }
 assert.ok(live.indexOf('erection-day5-bridge-v1.js')<live.indexOf('daily-practice-v1.js'));
 const routes=read('vercel.json');assert.ok(routes.includes('program-paused.html'));
});
