const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('premium-v2/erection-day3-touch-v1.js');
const css=read('premium-v2/erection-day3-touch-v1.css');
const bridge=read('premium-v2/erection-day3-bridge-v1.js');
const review=read('premium-v2/revision-ereccion-dia3.html');
const original=read('premium-v2/erection-practice-v1.js');
const manifest=read('premium-v2/spm-active-module-release-v1.js');
const program=read('premium-v2/daily-practice-v1.js');
const routes=read('vercel.json');
test('tres imágenes aprobadas intactas en formato WebP, aspecto 864×1536',()=>{
 for(const i of [1,2,3]){
  const img=fs.readFileSync(path.join(root,`premium-v2/assets/erection-day3/spm-de-day3-screen-0${i}.webp`));
  assert.equal(img.toString('ascii',0,4),'RIFF');assert.equal(img.toString('ascii',8,12),'WEBP');assert.ok(img.length>110000);
 }
 assert.match(src,/const IMAGES=\[1,2,3\]/);
 assert.match(css,/aspect-ratio:864\/1536/);
});
test('selección de zona única, No identifico tensión sin respuesta inventada',()=>{
 for(const key of ['jaw','shoulders','abdomen','none'])assert.ok(src.includes(`'${key}'`));
 assert.match(src,/m\.area=v/);assert.match(src,/spm-ed3-check/);
 assert.match(src,/tensionAreas:\[m\.area\]/);
 assert.match(src,/if\(!m\.area\)/);
});
test('ancla sensorial única y No lo identifiqué válido y seguro',()=>{
 for(const key of ['hands','support','sound','unknown'])assert.ok(src.includes(`'${key}'`));
 assert.match(src,/m\.anchor=v/);assert.match(src,/sensoryAnchor:m\.anchor/);
 assert.match(original,/const anchors=\['hands','support','sound','unknown'\]/);
 assert.match(src,/if\(!m\.anchor\)/);
});
test('tres audios de pantalla, MP3 día 3 original, tres pasos hablados',()=>{
 assert.match(src,/erection-day-3-20261113\.mp3/);
 assert.match(src,/SpeechSynthesisUtterance/);assert.match(src,/speechSynthesis\?\.cancel/);
 assert.match(src,/const GUIDE=\{/);assert.match(src,/const STEPS=\[/);
 assert.match(src,/speak\(m,'step'\+n,STEPS\[n\]\)/);
 assert.match(css,/\.spm-ed3-hit\.audio/);
});
test('cronómetro de un minuto opcional: no condición de guardado',()=>{
 assert.match(src,/60000/);assert.match(src,/function toggleTimer\(m\)/);
 assert.match(src,/window\.setInterval\(\(\)=>timerUI\(m\),250\)/);
 assert.match(src,/seconds:m\.timerUsed\?/);
 assert.doesNotMatch(src,/if\(!m\.timerUsed\).*return/);
});
test('persistencia clínica existente con regreso a Hoy tras éxito',()=>{
 assert.match(bridge,/Number\(c\.day\)!==3/);
 assert.match(bridge,/SPM_DAILY_PRACTICE\.saveActivity\('main',record,scope,3\)/);
 assert.match(src,/erectionPracticeVersion:1,day:3/);
 assert.match(src,/await m\.save\(record\)/);
 assert.match(src,/try\{m\.onBack\(\)\}/);
 assert.match(review,/onBack:showToday/);
 assert.match(manifest,/screens:3/);
 assert.match(program,/SPM_ACTIVE_MODULE_RELEASE\?\.resolve\(c,a\)/);
 assert.match(routes,/program-paused\.html/);
});