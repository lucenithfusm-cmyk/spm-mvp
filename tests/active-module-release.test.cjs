const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const live=read('premium-v2/live.html'),review=read('premium-v2/program-review-v1.js');
const reviewHtml=read('premium-v2/revision-programas-28-dias.html');
const today=read('premium-v2/daily-practice-v1.js'),legacy=read('premium-v2/erectile-function-route.js');
const release=read('premium-v2/spm-active-module-release-v1.js');
const deReview=read('premium-v2/de-review.html'),routes=read('vercel.json');
const active=/^(?:erection-practice-v1|erection-day1-touch-v1|erection-day1-bridge-v1|erection-day2-touch-v1|erection-day2-bridge-v1|spm-active-module-release-v1|daily-practice-v1)\.js/;
const appScripts=[...live.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]).filter(v=>active.test(v));
const reviewScripts=[...review.matchAll(/'([^']+\.js(?:\?v=[^']+)?)'/g)].map(m=>m[1]).filter(v=>active.test(v));
test('Programa real y visor de 28 días usan exactamente los mismos siete controladores aprobados',()=>{
 assert.equal(appScripts.length,7);
 assert.deepEqual(reviewScripts,appScripts);
 assert.ok(appScripts.indexOf('spm-active-module-release-v1.js?v=20261116-central1')>appScripts.indexOf('erection-day2-bridge-v1.js?v=20261116-d2-tactil-v1'));
 assert.equal(appScripts.at(-1),'daily-practice-v1.js?v=20261116-central1');
});
test('Los dos recorridos tienen los estilos de las versiones vigentes',()=>{
 for(const css of ['erection-day1-touch-v1.css','erection-day2-touch-v1.css','spm-approved-entry-v1.css']){
  assert.ok(live.includes(css),css+' no está en Live');
  assert.ok(reviewHtml.includes(css),css+' no está en revisión');
 }
 for(const day of [1,2])assert.ok(release.includes('spm-de-day'+day+'-screen-01.webp'));
 assert.match(release,/screens:6/);assert.match(release,/screens:4/);
});
test('Hoy muestra miniatura real y una sola actividad vigente',()=>{
 assert.match(today,/SPM_ACTIVE_MODULE_RELEASE\?\.resolve\(c,a\)/);
 assert.match(today,/SPM_ACTIVE_MODULE_RELEASE\?\.ready\?\.\(c,a\)/);
 assert.match(today,/data-spm-active-release/);
 assert.match(today,/Iniciar \$\{activeRelease.screens\} pantallas táctiles/);
 assert.match(today,/sesión interactiva actual no se pudo cargar/);
 assert.match(release,/activity\?\.id!=='main'/);
});
test('Día 1 y 2 no pueden abrir el formulario antiguo del calendario',()=>{
 assert.match(legacy,/if\(c\?\.primary==='erection'&&\[1,2\]\.includes\(target\)/);
 assert.match(legacy,/window\.SPM_DAILY_PRACTICE\.open\(\)/);
 assert.match(legacy,/obsolete\.style\.display='none'/);
 assert.match(legacy,/legacySave\.style\.display='none'/);
 assert.match(deReview,/location\.assign\('revision-ereccion-dia'\+d\+'\.html'\)/);
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