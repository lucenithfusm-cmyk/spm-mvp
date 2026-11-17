const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const day1=read('premium-v2/erection-day1-touch-v1.js'),day2=read('premium-v2/erection-day2-touch-v1.js');
const review1=read('premium-v2/revision-ereccion-dia1.html'),review2=read('premium-v2/revision-ereccion-dia2.html');
const live=read('premium-v2/live.html'),routes=read('vercel.json');
test('Día 1 regresa automáticamente a Hoy tras confirmar guardado y pantalla final',()=>{
 assert.match(day1,/await m\.save\(record\)/);
 assert.match(day1,/showSuccess\(m\)/);
 assert.match(day1,/autoTimer=window\.setTimeout\(exit,1700\)/);
 assert.match(day1,/window\.clearTimeout\(autoTimer\)/);
 assert.match(day1,/if\(returned\)return/);
 assert.match(day1,/try\{m\.onBack\(\)\}/);
});
test('Día 2 retorna sin comprobar m.valid después de guardar',()=>{
 assert.match(day2,/saved=await m\.save\(record\)/);
 assert.match(day2,/saved===false\|\|saved\?\.ok===false/);
 assert.doesNotMatch(day2,/await m\.save\(record\);if\(!m\.valid\(\)\)return/);
 assert.match(day2,/try\{m\.onBack\(\)\}/);
 assert.match(day2,/Number\(c\.day\)!==2/);
});
test('Las revisiones simulan Hoy, en lugar de reiniciar automáticamente',()=>{
 for(const [text,day] of [[review1,1],[review2,2]]){
  assert.match(text,/onBack:showToday/);
  assert.match(text,new RegExp('HOY · DÍA '+day));
  assert.match(text,/Revisar las pantallas otra vez/);
 }
});
test('Día 1 usa EHS-4 propio y el acceso público sigue pausado',()=>{
 assert.match(routes,/program-paused\.html/);
 assert.match(live,/erection-day1-touch-v1\.js\?v=20261117-ehs4-propio1/);
 assert.match(live,/erection-day2-touch-v1\.js\?v=20261116-auto-hoy-1/);
 assert.match(live,/erection-day1-bridge-v1\.js/);
 assert.match(live,/erection-day2-bridge-v1\.js/);
});