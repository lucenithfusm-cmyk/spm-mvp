const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const live=read('premium-v2/live.html'),review=read('premium-v2/program-review-v1.js');
const reviewHtml=read('premium-v2/revision-programas-28-dias.html');
const today=read('premium-v2/daily-practice-v1.js'),legacy=read('premium-v2/erectile-function-route.js');
const release=read('premium-v2/spm-active-module-release-v1.js');
const deReview=read('premium-v2/de-review.html'),routes=read('vercel.json');
const active=/^(?:erection-practice-v1|erection-day1-touch-v1|erection-day1-bridge-v1|erection-day2-touch-v1|erection-day2-bridge-v1|erection-day3-touch-v1|erection-day3-bridge-v1|erection-day4-touch-v1|erection-day4-bridge-v1|spm-active-module-release-v1|daily-practice-v1)\.js/;
const appScripts=[...live.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]).filter(v=>active.test(v));
const reviewScripts=[...review.matchAll(/'([^']+\.js(?:\?v=[^']+)?)'/g)].map(m=>m[1]).filter(v=>active.test(v));
test('Programa real y visor de 28 días usan exactamente los mismos once controladores aprobados',()=>{
 assert.equal(appScripts.length,11);
 assert.deepEqual(reviewScripts,appScripts);
 assert.ok(appScripts.indexOf('spm-active-module-release-v1.js?v=20261117-erection10x28-v1')>appScripts.indexOf('erection-day4-bridge-v1.js?v=20261117-erection10x28-v1'));
 assert.equal(appScripts.at(-1),'daily-practice-v1.js?v=20261117-erection10x28-v1');
});
test('Los dos recorridos tienen los estilos de las versiones vigentes',()=>{
 for(const css of ['erection-day1-touch-v1.css','erection-day2-touch-v1.css','erection-day3-touch-v1.css','erection-day4-touch-v1.css','spm-approved-entry-v1.css']){
  assert.ok(live.includes(css),css+' no está en Live');
  assert.ok(reviewHtml.includes(css),css+' no está en revisión');
 }
 for(const lesson of [1,2,3,4])assert.ok(release.includes('spm-de-day'+lesson+'-screen-01.webp'));
 assert.match(release,/screens:6/);assert.match(release,/screens:4/);assert.match(release,/screens:3/);
});
test('Hoy muestra miniatura real y una sola actividad vigente',()=>{
 assert.match(today,/SPM_ACTIVE_MODULE_RELEASE\?\.resolve\(c,a\)/);
 assert.match(today,/SPM_ACTIVE_MODULE_RELEASE\?\.ready\?\.\(c,a\)/);
 assert.match(today,/data-spm-active-release/);
 assert.match(today,/Iniciar \$\{activeRelease.screens\} pantallas táctiles/);
 assert.match(today,/sesión interactiva actual no se pudo cargar/);
 assert.match(release,/activity\?\.id!=='main'/);
});
test('La ruta antigua de 28 ejercicios no se abre en ningún día',()=>{
 assert.ok(legacy.includes("if(c?.primary==='erection'&&window.SPM_DAILY_PRACTICE?.open)"));
 assert.match(legacy,/window\.SPM_DAILY_PRACTICE\.open\(\)/);
 assert.match(legacy,/obsolete\.style\.display='none'/);
 assert.match(legacy,/legacySave\.style\.display='none'/);
 assert.ok(deReview.includes("location.replace('revision-programas-28-dias.html?programa=erection&dia=1'"));
});
test('Focalización y demás módulos conservan sus rutas y pausas',()=>{
 const sensate=read('premium-v2/daily-support-plan-v1.js');
 assert.match(sensate,/\b4:\{id:'sensate-prepare'/);
 for(const key of ['sensate','breathing','pelvicAwareness','pelvicStrength','desire','ejaculation','startStop','stopSqueeze','combined','nutrition','sleep'])assert.ok(release.includes(key+':'));
 assert.match(live,/sensate-lab-bridge-v1\.js/);
 assert.match(live,/pelvic-lab-bridge-v1\.js/);
 assert.match(live,/ejaculatory-control\.js/);
 assert.match(routes,/program-paused\.html/);
 assert.match(routes,/must-revalidate/);
});

test('La lámina EHS reutilizada y su visor médico se conservan en la versión aprobada',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const artwork=path.resolve(root,'premium-v2/assets/images/erection/response-firmness-spm-20261113.jpg');
 assert.ok(fs.statSync(artwork).size>100000,'la imagen EHS original debe estar disponible');
 const guide=read('premium-v2/firmness-guide-v1.js');
 const day1=read('premium-v2/erection-day1-touch-v1.js');
 const previous=read('premium-v2/erectile-function-route.js');
 assert.match(guide,/response-firmness-spm-20261113\.jpg/);
 assert.match(guide,/SPM_FIRMNESS_GUIDE=\{src,levels,html,bind,open,close\}/);
 assert.match(day1,/GUIDE_IMAGE/);
 assert.match(day1,/data-ed1-ehs-dialog/);
 assert.match(day1,/ehsEvaluable/);
 assert.match(previous,/function ehsHtml\(/);
 assert.match(previous,/if\(type==='final'\)return ehsHtml\(\)/);
});
test('No se borra el botón de sincronización del calendario; se oculta solo para los días sustituidos',()=>{
 const app=read('premium-v2/app-live.js');
 const route=read('premium-v2/erectile-function-route.js');
 assert.match(app,/class="btn pri doneBtn"/);
 assert.match(app,/card\.querySelector\('\.doneBtn'\)\.textContent='Completado ✓'/);
 assert.ok(route.includes('const slot=window.SPM_ERECTION_10_SCHEDULE?.slot(d)'));
 assert.match(route,/legacySave\.style\.display='none'/);
 assert.match(route,/obsolete\.style\.display='none'/);
 assert.doesNotMatch(route,/area\.replaceChildren\(button,note\)/);
});

test('Erección días 1–4: los cuatro recursos funcionan en pantalla completa con alerta accesible en todos los recorridos',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const readCurrent=p=>fs.readFileSync(path.join(root,p),'utf8');
 const ux=readCurrent('premium-v2/erection-fullscreen-v1.js');
 const css=readCurrent('premium-v2/erection-fullscreen-v1.css');
 assert.ok(css.includes('position:fixed!important'));
 assert.ok(css.includes('height:100dvh!important'));
 assert.ok(css.includes('.spm-er-alert-layer'));
 assert.ok(ux.includes('role="alertdialog"'));
 assert.ok(ux.includes('aria-modal="true"'));
 for(const n of [1,2,3,4]){
  const c=readCurrent('premium-v2/erection-day'+n+'-touch-v1.js');
  const direct=readCurrent('premium-v2/revision-ereccion-dia'+n+'.html');
  assert.ok(c.includes('spm-er-fullscreen'));
  assert.ok(c.includes('SPM_ERECTION_TOUCH_VIEW?.warn'));
  assert.ok(c.includes('SPM_ERECTION_TOUCH_VIEW?.resetScroll'));
  assert.ok(direct.includes('erection-fullscreen-v1.js'));
  assert.ok(direct.includes('erection-fullscreen-v1.css'));
 }
 assert.ok(live.includes('erection-fullscreen-v1.js'));
 assert.ok(live.includes('erection-fullscreen-v1.css'));
 assert.ok(review.includes('erection-fullscreen-v1.js'));
 assert.ok(reviewHtml.includes('erection-fullscreen-v1.css'));
 assert.ok(routes.includes('erection-fullscreen-v1'));
});

test('Fullscreen móvil conserva ancho completo y desplazamiento vertical',()=>{
 const css=read('premium-v2/erection-fullscreen-v1.css');
 assert.match(css,/position:fixed!important/);
 assert.match(css,/height:100dvh!important/);
 assert.match(css,/overflow-y:auto!important/);
 assert.match(css,/max-width:540px!important/);
 assert.doesNotMatch(css,/56\.25dvh/);
});
