const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('premium-v2/erection-day9-touch-v1.js');
const css=read('premium-v2/erection-day9-touch-v1.css');
const bridge=read('premium-v2/erection-day9-bridge-v1.js');
const preview=read('premium-v2/revision-ereccion-dia24.html');
function touch(){const c={window:{addEventListener(){}}};vm.runInNewContext(js,c);return c.window.SPM_ED_DAY9_TOUCH}
function clinical(){
 const c={window:{addEventListener(){}},document:{body:{}},MutationObserver:class {observe(){}}};
 vm.runInNewContext(read('premium-v2/erection-practice-v1.js'),c);
 return c.window.SPM_ERECTION_PRACTICE;
}
test('Día 24: las tres láminas visuales 864x1536 se conservan como fondos táctiles',()=>{
 for(let i=1;i<=3;i++){
  const file='premium-v2/assets/erection-day9/spm-de-day9-screen-0'+i+'.webp';
  const buf=fs.readFileSync(path.join(root,file));
  assert.ok(buf.length>200000,file);
  assert.equal(buf.toString('ascii',0,4),'RIFF');
  assert.equal(buf.toString('ascii',8,12),'WEBP');
  assert.equal(touch().images[i-1],'/'+file);
 }
 assert.equal(touch().images.length,3);
 assert.match(css,/aspect-ratio:864\/1536/);
 assert.match(js,/spm-ed9-artwork/);
 assert.match(preview,/erection-day9-touch-v1.css/);
});
test('Pantalla 1: botones Escuchar guía, Anterior y Comenzar práctica',()=>{
 assert.match(js,/hit\(\[184,666,669,760\],'audio'/);
 assert.match(js,/hit\(\[38,1340,351,1444\],'back'/);
 assert.match(js,/hit\(\[355,1340,834,1444\],'next'/);
 assert.match(js,/m\.page=Math\.min\(3,Math\.max\(1,next\)\)/);
});
test('Pantalla 2: cuatro pasos completos, tocables y con narración independiente',()=>{
 const api=touch();
 assert.deepEqual([...api.steps],['Mantén la calma','Ajusta el estímulo','Prueba otra posición','Haz una pausa breve']);
 assert.equal(api.guides.length,3);
 assert.match(js,/for\(let i=0;i<4;i\+\+\)hits\+=hit\(STEP_HITS\[i\]/);
 assert.match(js,/speak\(m,STEPS\[i\]\[2\],'step-'\+i\)/);
 assert.match(js,/m\.stepsHeard\.push\(i\)/);
});
test('Pantalla 3: cinco estrategias excluyentes y guardado con alerta centrada',()=>{
 const api=touch();
 assert.deepEqual([...api.strategies],['calm','stimulus','position','pause','sequence']);
 assert.deepEqual([...api.fields],['erectionResponseStrategy']);
 assert.match(js,/m\.strategy=key/);
 assert.match(js,/if\(!m\.strategy\)\{warn\(m,/);
 assert.match(js,/SPM_ERECTION_TOUCH_VIEW\?\.warn\?\.\(m\.host,text\)/);
 const modal=read('premium-v2/erection-fullscreen-v1.js');
 const style=read('premium-v2/erection-fullscreen-v1.css');
 assert.match(modal,/role="alertdialog"/);
 assert.match(style,/\.spm-er-alert-layer/);
 assert.match(style,/place-items:center/);
 assert.match(style,/background:rgba\(2,19,35,.55\)/);
});
test('Narración del dispositivo en español: no se introduce voz no aprobada',()=>{
 const api=touch();
 assert.equal(api.voiceMode,'device-default');
 assert.equal(api.guides.length,3);
 assert.match(js,/new window\.SpeechSynthesisUtterance\(text\)/);
 assert.match(js,/utterance\.lang='es-CO'/);
 assert.match(js,/window\.speechSynthesis\.speak\(utterance\)/);
 assert.doesNotMatch(js,/new window\.Audio\(|voices\.find\(|utterance\.voice\s*=/);
});
test('Controlador Día 24 guarda la sesión 9 con alcance de usuario y regresa a Hoy',()=>{
 assert.match(bridge,/Number\(c\.day\)!==24/);
 assert.match(bridge,/c\.primary!=='erection'/);
 assert.match(bridge,/scope\(c\)!==s/);
 assert.match(bridge,/SPM_DAILY_RECORDS\.read\(s,24\)/);
 assert.match(bridge,/saved\.erectionLesson===9/);
 assert.match(bridge,/calendarDay:24/);
 assert.ok(bridge.includes("saveActivity('main',{...record,day:24,erectionLesson:9},s,24)"));
 assert.match(js,/erectionPracticeVersion:1,day:m\.calendarDay,erectionLesson:9/);
 assert.match(js,/erectionResponseStrategy:m\.strategy/);
 assert.match(js,/erectionPlanStepsHeard:m\.stepsHeard\.slice\(\)/);
 assert.match(js,/save:onSave,onBack,scope/);
 assert.match(js,/m\.onBack\(\)/);
 assert.doesNotMatch(js,/localStorage\./);
});
test('Validación de sesión 9 acepta una estrategia y rechaza datos ajenos',()=>{
 const model=clinical();
 const good={source:'erection-practice-v1',erectionPracticeVersion:1,day:24,erectionLesson:9,confirmed:true,anxiety:null,confidence:null,erectionResponseStrategy:'pause',erectionPlanStepsHeard:[0,2]};
 assert.equal(model.valid(good,24),true);
 assert.equal(model.valid({...good,erectionResponseStrategy:'invalid'},24),false);
 assert.equal(model.valid({...good,erectionPlanStepsHeard:[0,0]},24),false);
 assert.equal(model.valid({...good,erectionLesson:8},24),false);
 assert.equal(model.valid({...good,day:21},24),false);
 const day21={source:'erection-practice-v1',erectionPracticeVersion:1,day:21,erectionLesson:8,confirmed:true,anxiety:null,confidence:null,erectionFavorablePositions:['de_lado'],erectionLessFavorablePosition:null,erectionChosenStrategy:'pause',erectionPracticeStarted:false,erectionOptionalTimerSeconds:0};
 assert.equal(model.valid(day21,21),true,'validación anterior de Día 21 debe permanecer funcional');
});
test('Calendario 28 días: novena sesión abierta; Día 27 reservado; evaluaciones 14/28',()=>{
 const ctx={window:{}};vm.runInNewContext(read('premium-v2/erection-ten-schedule-v1.js'),ctx);
 const schedule=ctx.window.SPM_ERECTION_10_SCHEDULE;
 assert.equal(schedule.integrated,9);
 assert.equal(schedule.isReady(24),true);
 assert.equal(schedule.isReady(27),false);
 assert.deepEqual([...schedule.evaluationDays],[14,28]);
 const registry=read('premium-v2/spm-active-module-release-v1.js');
 assert.match(registry,/24:Object\.freeze/);
 assert.match(registry,/module:'SPM_ED_DAY9_TOUCH',bridge:'SPM_ERECTION_DAY9_BRIDGE'/);
 const live=read('premium-v2/live.html');
 const review=read('premium-v2/program-review-v1.js');
 const revHtml=read('premium-v2/revision-programas-28-dias.html');
 for(const name of ['erection-day9-touch-v1.js','erection-day9-bridge-v1.js']){
  assert.ok(live.includes(name));assert.ok(review.includes(name));
 }
 assert.ok(live.indexOf('erection-day9-bridge-v1.js')<live.indexOf('daily-practice-v1.js'));
 assert.ok(live.includes('erection-day9-touch-v1.css'));
 assert.ok(revHtml.includes('erection-day9-touch-v1.css'));
 assert.ok(read('vercel.json').includes('program-paused.html'));
});