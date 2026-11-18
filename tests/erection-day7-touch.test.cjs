const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('premium-v2/erection-day7-touch-v1.js');
const css=read('premium-v2/erection-day7-touch-v1.css');
const bridge=read('premium-v2/erection-day7-bridge-v1.js');
const preview=read('premium-v2/revision-ereccion-dia18.html');
const fullscreen=read('premium-v2/erection-fullscreen-v1.js');
const fullscreenCSS=read('premium-v2/erection-fullscreen-v1.css');
const ctx={window:{addEventListener(){}}};vm.runInNewContext(js,ctx);
const touch=ctx.window.SPM_ED_DAY7_TOUCH;
test('Día 18 conserva exactamente las tres imágenes aprobadas del antiguo Día 7',()=>{
 for(let n=1;n<=3;n++){
  const name='premium-v2/assets/erection-day7/spm-de-day7-screen-0'+n+'.jpg';
  const image=fs.readFileSync(path.join(root,name));
  assert.ok(image.length>250000);
  assert.equal(image[0],0xff);assert.equal(image[1],0xd8);
  assert.equal(touch.images[n-1],'/'+name);
  assert.ok(preview.includes('spm-de-day7-screen-0'+n+'.jpg')||preview.includes("screen-0'+n+'.jpg"));
 }
 assert.equal(touch.images.length,3);
 assert.match(css,/aspect-ratio:864\/1536/);
 assert.match(js,/spm-ed7-artwork/);
});
test('Pantalla 1 permite varios avances, empezando es excluyente; pantallas 2 y 3 son únicas',()=>{
 assert.deepEqual([...touch.fields],['erectionProgress','erectionConfidenceStatement','erectionNextStep']);
 assert.deepEqual([...touch.options.advances],['contextos','tension','ayuda','estimulos','empezando']);
 assert.deepEqual([...touch.options.confidence],['sin_perfeccion','calma','entrenarse','condiciones','presion']);
 assert.deepEqual([...touch.options.nextStep],['repetir_contexto','mas_tiempo','menos_estres','mantener_estimulo','observar_patron']);
 assert.match(js,/if\(key==='empezando'\)m\.advances=/);
 assert.match(js,/\.filter\(v=>v!=='empezando'\)/);
 assert.match(js,/m\.confidence=key/);
 assert.match(js,/m\.nextStep=key/);
 assert.match(js,/refreshSelections\(m\)/);
});
test('Advertencias de selección faltante son modales centrados y accesibles, no solo mensajes inferiores',()=>{
 assert.match(js,/SPM_ERECTION_TOUCH_VIEW\?\.warn\?\.\(m\.host,text\)/);
 assert.match(js,/if\(m\.page===1&&!m\.advances\.length\)\{required/);
 assert.match(js,/if\(m\.page===2&&!m\.confidence\)\{required/);
 assert.match(js,/if\(!m\.nextStep\)\{required/);
 assert.match(fullscreen,/role="alertdialog"/);
 assert.match(fullscreen,/aria-modal="true"/);
 assert.match(fullscreenCSS,/\.spm-er-alert-layer\{/);
 assert.match(fullscreenCSS,/place-items:center/);
 assert.match(fullscreenCSS,/background:rgba\(2,19,35,.55\)/);
 assert.match(preview,/role="alertdialog"/);
 assert.match(preview,/class="spm-ed18-alert-layer"/);
 assert.match(preview,/background:rgba\(2,19,35,.60\)/);
 assert.match(preview,/overlay\.querySelector\('#spm-ed18-alert-message'\)\.textContent/);
 assert.match(preview,/data-ed18-alert-close/);
 assert.match(preview,/button\.focus\(\{preventScroll:true\}\)/);
});
test('Tres guías con voz predeterminada del dispositivo; ninguna voz de proveedor se impone',()=>{
 assert.equal(touch.voiceMode,'device-default');
 assert.equal(touch.guides.length,3);
 assert.match(touch.guides[0],/progreso/);
 assert.match(touch.guides[1],/confianza/);
 assert.match(touch.guides[2],/siguiente paso/);
 assert.match(js,/new window\.SpeechSynthesisUtterance\(GUIDES\[key-1\]\)/);
 assert.match(js,/window\.speechSynthesis\.speak\(u\)/);
 assert.match(js,/speechSynthesis\?\.cancel/);
 assert.doesNotMatch(js,/new window\.Audio\(|voices\.find\(|u\.voice=/);
 assert.doesNotMatch(preview,/new Audio\(|voices\.find\(|u\.voice=/);
});
test('La sesión 7 se guarda exclusivamente en Día 18 del usuario actual y vuelve a Hoy',()=>{
 assert.match(bridge,/Number\(c\.day\)!==18/);
 assert.match(bridge,/c\.primary!=='erection'/);
 assert.match(bridge,/scope\(c\)!==s/);
 assert.match(bridge,/SPM_DAILY_RECORDS\.read\(s,18\)/);
 assert.match(bridge,/erectionLesson:7/);
 assert.match(bridge,/calendarDay:18/);
 assert.ok(bridge.includes("saveActivity('main',{...record,day:18,erectionLesson:7},s,18)"));
 assert.match(js,/erectionPracticeVersion:1,day:m\.calendarDay,erectionLesson:7/);
 assert.match(js,/erectionProgress:m\.advances\.slice\(\)/);
 assert.match(js,/erectionConfidenceStatement:m\.confidence/);
 assert.match(js,/erectionNextStep:m\.nextStep/);
 assert.match(js,/m\.onBack\(\)/);
 assert.doesNotMatch(js,/localStorage\./);
 const clinical=read('premium-v2/erection-practice-v1.js');
 assert.match(clinical,/if\(lesson===7\)return Array\.isArray\(record\.erectionProgress\)/);
 assert.match(clinical,/record\.erectionProgress\.includes\('empezando'\)/);
 assert.match(clinical,/confidenceIdeas\.includes\(record\.erectionConfidenceStatement\)/);
 assert.match(clinical,/nextSteps\.includes\(record\.erectionNextStep\)/);
});
test('Diez sesiones, evaluación días 14/28 y acceso comercial pausado sin cambios',()=>{
 const sch=read('premium-v2/erection-ten-schedule-v1.js');
 const state={window:{}};vm.runInNewContext(sch,state);
 const s=state.window.SPM_ERECTION_10_SCHEDULE;
 assert.equal(s.integrated,7);assert.equal(s.isReady(18),true);assert.equal(s.isReady(21),false);
 assert.deepEqual([...s.evaluationDays],[14,28]);
 const live=read('premium-v2/live.html'),review=read('premium-v2/program-review-v1.js'),reviewHtml=read('premium-v2/revision-programas-28-dias.html');
 const released=read('premium-v2/spm-active-module-release-v1.js');
 assert.match(released,/18:Object\.freeze/);
 assert.match(released,/module:'SPM_ED_DAY7_TOUCH',bridge:'SPM_ERECTION_DAY7_BRIDGE'/);
 for(const file of ['erection-day7-touch-v1.js','erection-day7-bridge-v1.js']){
  assert.ok(live.includes(file));assert.ok(review.includes(file));
 }
 assert.ok(live.indexOf('erection-day7-bridge-v1.js')<live.indexOf('daily-practice-v1.js'));
 assert.ok(live.includes('erection-day7-touch-v1.css'));
 assert.ok(reviewHtml.includes('erection-day7-touch-v1.css'));
 assert.ok(read('vercel.json').includes('program-paused.html'));
});