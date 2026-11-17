const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const artDir=path.join(root,'premium-v2/assets/erection-day1');
const moduleSource=fs.readFileSync(path.join(root,'premium-v2/erection-day1-touch-v1.js'),'utf8');
const live=fs.readFileSync(path.join(root,'premium-v2/live.html'),'utf8');
const daily=fs.readFileSync(path.join(root,'premium-v2/erection-practice-v1.js'),'utf8');
const bridge=fs.readFileSync(path.join(root,'premium-v2/erection-day1-bridge-v1.js'),'utf8');
const style=fs.readFileSync(path.join(root,'premium-v2/erection-day1-touch-v1.css'),'utf8');
test('seis imágenes originales aprobadas, íntegras en formato WebP',()=>{
 for(let n=1;n<=6;n++){
  const name=`spm-de-day1-screen-0${n}.webp`;
  const data=fs.readFileSync(path.join(artDir,name));
  assert.ok(data.length>145000,`${name} debe existir y conservar detalles`);
  assert.equal(data.toString('ascii',0,4),'RIFF');
  assert.equal(data.toString('ascii',8,12),'WEBP');
  assert.match(moduleSource,/spm-de-day1-screen-0/);
 }
});
test('reemplazo sólo en día 1 sin alterar el resto de Erección y firmeza',()=>{
 assert.match(bridge,/Number\(c\.day\)!==1/);
 assert.match(bridge,/saveActivity\('main',record,scope,1\)/);
 assert.match(daily,/const practiceDays=new Set\(\[1,2,3,4,5\]\)/);
 assert.match(daily,/if\(Number\(day\)===2\)return/);
 assert.match(daily,/if\(Number\(day\)===3\)return/);
 assert.match(daily,/if\(Number\(day\)===4\)return/);
 assert.match(live,/erection-day1-touch-v1\.css/);
 assert.match(live,/erection-day1-touch-v1\.js/);
 assert.match(live,/erection-day1-bridge-v1\.js/);
 assert.equal(live.split('erection-day1-touch-v1.js').length-1,1);
});
test('audio original de escala sin cortes y audios táctiles propios por pantalla',()=>{
 assert.match(moduleSource,/erection-day-1-ehs-20261113\.mp3/);
 assert.doesNotMatch(moduleSource,/currentTime\s*=\s*[1-9]/);
 for(const key of ['intro','ehs','science','practice','review','end','blood','nerves','emotions'])assert.ok(moduleSource.includes(key));
 // Las tres narraciones se generan con claves dinámicas ('step'+i), no con literales step0/1/2.
 assert.match(moduleSource,/const STEPS=\[/);
 assert.match(moduleSource,/audio:'step'\+i/);
 assert.match(moduleSource,/SpeechSynthesisUtterance/);
 assert.match(moduleSource,/window\.speechSynthesis\?\.cancel/);
 assert.match(style,/\.spm-ed1-hit\.audio/);
});
test('la EHS exige selección real y distingue 0 de No evaluable',()=>{
 assert.match(moduleSource,/if\(next===3&&m\.ehs===null\)/);
 assert.match(moduleSource,/m\.ehs==='na'\?null:Number\(m\.ehs\)/);
 assert.match(moduleSource,/ehsEvaluable:m\.ehs!=='na'/);
 assert.match(moduleSource,/El nivel 4 dibujado en la imagen es un ejemplo visual/);
});
test('registro explícito y sin falsos completados, confirmación solamente después de guardar',()=>{
 assert.match(moduleSource,/m\.outcome===null/);
 assert.match(moduleSource,/attentionPracticeCompleted:m\.outcome!=='omitted'/);
 assert.match(moduleSource,/await m\.save\(record\)/);
 assert.match(moduleSource,/showSuccess\(m\)/);
 assert.match(moduleSource,/data-ed1-success-close/);
 assert.match(moduleSource,/onBack\(\)/);
});
test('las rutas comerciales siguen pausadas',()=>{
 const routes=fs.readFileSync(path.join(root,'vercel.json'),'utf8');
 assert.match(routes,/program-paused\.html/);
 assert.doesNotMatch(live,/wompi.*activate|activate.*wompi/i);
});
test('pantalla 5: ningún chulito fijo, solo círculo azul en la opción marcada',()=>{
 assert.match(moduleSource,/if\(m\.outcome!==null\)/);
 assert.match(moduleSource,/OUTCOMES\.indexOf\(m\.outcome\)/);
 assert.match(moduleSource,/data-ed1-radio/);
 assert.match(moduleSource,/radioCenters=\[\[821,640\]/);
 assert.match(style,/\.spm-ed1-radio-check/);
 assert.match(style,/pointer-events:none/);
});

test('EHS-4 de la pantalla 2 está copiada como recurso propio e independiente',()=>{
 const image=fs.readFileSync(path.join(artDir,'spm-de-day1-ehs4-guide.jpg'));
 const original=fs.readFileSync(path.join(root,'premium-v2/assets/images/erection/response-firmness-spm-20261113.jpg'));
 assert.ok(image.length>100000);
 assert.equal(image.compare(original),0);
 assert.ok(moduleSource.includes("const GUIDE_IMAGE='/premium-v2/assets/erection-day1/spm-de-day1-ehs4-guide.jpg'"));
 assert.doesNotMatch(moduleSource,/SPM_FIRMNESS_GUIDE|assets\\/images\\/erection/);
 assert.match(moduleSource,/data-ed1-ehs-dialog/);
 assert.match(moduleSource,/action==='open-ehs'/);
 assert.match(moduleSource,/action==='close-ehs'/);
 assert.match(moduleSource,/ehsEvaluable:m\\.ehs!=='na'/);
});
