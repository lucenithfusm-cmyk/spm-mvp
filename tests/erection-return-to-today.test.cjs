const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const day1=read('premium-v2/erection-day1-touch-v1.js'),day2=read('premium-v2/erection-day2-touch-v1.js');
const review1=read('premium-v2/revision-ereccion-dia1.html'),review2=read('premium-v2/revision-ereccion-dia2.html');
const live=read('premium-v2/live.html'),routes=read('vercel.json');
test('Día 1 conserva la pantalla 6 hasta el toque final',()=>{
 assert.match(day1,/await m\.save\(record\)/);
 assert.match(day1,/showSuccess\(m\)/);
 assert.doesNotMatch(day1,/autoTimer|setTimeout\(exit,/);
 assert.match(day1,/data-ed1-success-close/);
 assert.match(day1,/addEventListener\('click',exit\)/);
 assert.match(day1,/if\(returned\)return/);
 assert.match(day1,/try\{m\.onBack\(\)\}/);
});
test('Día 2 retorna sin comprobar m.valid después de guardar',()=>{
 assert.match(day2,/saved=await m\.save\(record\)/);
 assert.match(day2,/saved===false\|\|saved\?\.ok===false/);
 assert.doesNotMatch(day2,/await m\.save\(record\);if\(!m\.valid\(\)\)return/);
 assert.match(day2,/try\{m\.onBack\(\)\}/);
 assert.match(day2,/Number\(c\.day\)!==m\.calendarDay/);
});
test('Las revisiones simulan Hoy, en lugar de reiniciar automáticamente',()=>{
 for(const [text,day] of [[review1,1],[review2,3]]){
  assert.match(text,/onBack:showToday/);
  assert.match(text,new RegExp('HOY · DÍA '+day));
  assert.match(text,/Revisar las pantallas otra vez/);
 }
});
test('Día 1 usa EHS-4 propio y el acceso público sigue pausado',()=>{
 assert.match(routes,/program-paused\.html/);
 const central=read('premium-v2/program-review-v1.js');
 for(const [lesson,directReview]of [[1,review1],[2,review2]]){
  const name='erection-day'+lesson+'-touch-v1.js',url=[...live.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]).find(v=>v.startsWith(name+'?v='));
  assert.equal(url,name+'?v=20261127-technical');assert.ok(central.includes("'"+url+"'"));assert.ok(directReview.includes('src="'+url+'"'));
 }
 assert.match(live,/erection-day1-bridge-v1\.js/);
 assert.match(live,/erection-day2-bridge-v1\.js/);
});
test('Guardar días 1 a 4 no desmonta la pantalla antes del retorno propio del módulo',()=>{
 const central=read('premium-v2/daily-practice-v1.js');
 assert.match(central,/function touchOwnsExit\(c,a\)/);
 assert.ok(central.includes('SPM_ERECTION_10_SCHEDULE?.isReady(c.day)===true'));
 assert.match(central,/if\(!keepTouchOpen\)render\(\)/);
 assert.match(central,/active\?\.id===id&&!keepTouchOpen/);
});
