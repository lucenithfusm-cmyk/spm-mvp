const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('premium-v2/erection-day10-touch-v1.js'),css=read('premium-v2/erection-day10-touch-v1.css'),bridge=read('premium-v2/erection-day10-bridge-v1.js'),review=read('premium-v2/revision-ereccion-dia27.html');
function api(){const ctx={window:{addEventListener(){}}};vm.runInNewContext(js,ctx);return ctx.window.SPM_ED_DAY10_TOUCH;}
function clinical(){const ctx={window:{addEventListener(){}},document:{body:{}},MutationObserver:class{observe(){}}};vm.runInNewContext(read('premium-v2/erection-practice-v1.js'),ctx);return ctx.window.SPM_ERECTION_PRACTICE;}
test('Día 27: dos PNG aprobados conservados como láminas completas de 1080x1920',()=>{
 const touch=api();
 for(let i=1;i<=2;i++){
  const f='premium-v2/assets/erection-day10/spm-de-day10-screen-0'+i+'.webp';
  const bytes=fs.readFileSync(path.join(root,f));
  assert.ok(bytes.length>120000,f);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.equal(touch.images[i-1],'/'+f);
 }
 assert.equal(touch.images.length,2);
 assert.match(css,/aspect-ratio:1080\/1920/);
 assert.match(js,/spm-ed10-artwork/);
 assert.match(review,/erection-day10-touch-v1\.css/);
});
test('Pantalla 1: señales múltiples, No identifico excluyente y guardado sin EHS',()=>{
 const touch=api();
 assert.deepEqual([...touch.signals],['fear_repeat','checking','avoidance','pressure','none']);
 assert.deepEqual([...touch.fields],['warningSignals','preventionStrategy']);
 assert.match(js,/if\(key==='none'\)\{m\.warningSignals=/);
 assert.match(js,/m\.warningSignals\.filter\(x=>x!=='none'\)/);
 assert.match(js,/warningSignals:m\.warningSignals\.slice\(\)/);
 assert.doesNotMatch(js,/ehs\s*:/i);
});
test('Pantalla 2: plan anticipatorio de una opción, sin volver al protocolo de Día 24',()=>{
 const touch=api();
 assert.deepEqual([...touch.strategies],['reframe','refocus','reconnect','consult','maintain']);
 assert.match(js,/m\.preventionStrategy=key/);
 assert.match(js,/preventionStrategy:m\.preventionStrategy/);
 assert.match(touch.guides[0],/Una experiencia aislada no predice necesariamente la siguiente/);
 assert.match(touch.guides[1],/conviene consultar a un profesional de salud/);
 assert.doesNotMatch(touch.guides[1],/plan en cuatro pasos|Prueba otra posición/);
});
test('Guías completas de la fuente con voz nativa, sin sustituir Leni por otra voz comercial',()=>{
 const touch=api();
 assert.equal(touch.guides.length,2);
 assert.equal(touch.voiceMode,'device-default-pending-Leni');
 assert.match(js,/new window\.SpeechSynthesisUtterance\(GUIDES\[m\.page-1\]\)/);
 assert.match(js,/u\.lang='es-CO'/);
 assert.match(js,/window\.speechSynthesis\.speak\(u\)/);
 assert.doesNotMatch(js,/new window\.Audio\(|voices\.find\(|u\.voice\s*=/);
 assert.match(js,/window\.speechSynthesis\?\.cancel/);
});
test('Avisos de respuesta obligatoria centrados, con contexto y botón Entendido',()=>{
 assert.match(js,/SPM_ERECTION_TOUCH_VIEW\?\.warn\?\.\(m\.host,msg\)/);
 assert.match(js,/if\(!m\.warningSignals\.length\)\{required/);
 assert.match(js,/if\(!m\.preventionStrategy\)\{required/);
 assert.match(js,/role="alertdialog" aria-modal="true"/);
 const modal=read('premium-v2/erection-fullscreen-v1.js'),styles=read('premium-v2/erection-fullscreen-v1.css');
 assert.match(modal,/role="alertdialog"/);assert.match(modal,/aria-modal="true"/);
 assert.match(styles,/\.spm-er-alert-layer\{/);assert.match(styles,/place-items:center/);
 assert.match(css,/\.spm-ed10-alert-layer\{/);
});
test('El registro y recuperación del día 27 se limitan al usuario y vuelven a Hoy',()=>{
 assert.match(bridge,/Number\(c\.day\)!==27/);
 assert.match(bridge,/c\.primary!=='erection'/);
 assert.match(bridge,/scope\(c\)!==s/);
 assert.match(bridge,/SPM_DAILY_RECORDS\.read\(s,27\)/);
 assert.match(bridge,/saved\.erectionLesson===10/);
 assert.match(bridge,/calendarDay:27/);
 assert.ok(bridge.includes("saveActivity('main',{...record,day:27,erectionLesson:10},s,27)"));
 assert.match(js,/erectionPracticeVersion:1,day:m\.calendarDay,erectionLesson:10/);
 assert.match(js,/m\.onBack\(\)/);
 assert.doesNotMatch(js,/localStorage\./);
 assert.match(review,/SPM_ED10_REVIEW_ONLY_20261118/);
});
test('Validación clínica comprueba exclusividad y estrategias, sin alterar el registro del día 24',()=>{
 const model=clinical(),good={source:'erection-practice-v1',erectionPracticeVersion:1,day:27,erectionLesson:10,confirmed:true,anxiety:null,confidence:null,warningSignals:['fear_repeat','checking'],preventionStrategy:'reframe'};
 assert.equal(model.valid(good,27),true);
 assert.equal(model.valid({...good,warningSignals:['none']},27),true);
 assert.equal(model.valid({...good,warningSignals:['none','checking']},27),false);
 assert.equal(model.valid({...good,warningSignals:[]},27),false);
 assert.equal(model.valid({...good,preventionStrategy:'invalid'},27),false);
 assert.equal(model.valid({...good,warningSignals:['fear_repeat','fear_repeat']},27),false);
 assert.equal(model.valid({...good,erectionLesson:9},27),false);
 const previous={source:'erection-practice-v1',erectionPracticeVersion:1,day:24,erectionLesson:9,confirmed:true,anxiety:null,confidence:null,erectionResponseStrategy:'pause',erectionPlanStepsHeard:[]};
 assert.equal(model.valid(previous,24),true);
});
test('Se completan 10 sesiones en días 1–27; evaluaciones días 14 y 28 intactas',()=>{
 const ctx={window:{}};vm.runInNewContext(read('premium-v2/erection-ten-schedule-v1.js'),ctx);
 const s=ctx.window.SPM_ERECTION_10_SCHEDULE;
 assert.equal(s.integrated,10);assert.equal(s.isReady(27),true);assert.equal(s.phase(27),'ready');
 assert.deepEqual([...s.evaluationDays],[14,28]);
 const release=read('premium-v2/spm-active-module-release-v1.js');
 assert.match(release,/27:Object\.freeze/);assert.match(release,/module:'SPM_ED_DAY10_TOUCH',bridge:'SPM_ERECTION_DAY10_BRIDGE'/);
 const live=read('premium-v2/live.html'),review=read('premium-v2/program-review-v1.js'),reviewHtml=read('premium-v2/revision-programas-28-dias.html');
 for(const f of ['erection-day10-touch-v1.js','erection-day10-bridge-v1.js']){assert.ok(live.includes(f));assert.ok(review.includes(f))}
 assert.ok(live.indexOf('erection-day10-bridge-v1.js')<live.indexOf('daily-practice-v1.js'));
 assert.match(live,/erection-day10-touch-v1\.css/);assert.match(reviewHtml,/erection-day10-touch-v1\.css/);
 assert.ok(read('premium-v2/program-checkpoint-v1.js').includes('14'));assert.ok(read('premium-v2/program-checkpoint-v1.js').includes('28'));
 assert.ok(read('vercel.json').includes('program-paused.html'));
});
