// SPM: verifica que el experimento Día 1 no modifique rutas ni días 2-28.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('premium-v2/erection-day1-premium-preview-v1.js','utf8');
const html=fs.readFileSync('premium-v2/live.html','utf8');
const old={open:a=>({oldDay:true,a}),supports:()=>true,valid:()=>true,stop:()=>true,pause:()=>true};
const origSupports=old.supports,origValid=old.valid;
let day=2;
const fake={SPM_ERECTION_PRACTICE:old,SPM_RESOURCE_CONTEXT:()=>({primary:'erection',day})};
vm.runInNewContext(src,{window:fake,console,setInterval,clearInterval,setTimeout,clearTimeout});
assert.equal(fake.SPM_ERECTION_DAY1_PREMIUM.scope,'existing-er-1-only');
for(let d=2;d<=28;d++){day=d;assert.equal(old.open({id:'main',kind:'erection'}).oldDay,true,'Día '+d+' modificado');}
day=1;assert.equal(old.open({id:'secondary',kind:'erection'}).oldDay,true,'Módulo secundario alterado');
assert.equal(old.supports,origSupports);assert.equal(old.valid,origValid);
assert.ok(!/SPM_DAILY_SUPPORT|SPM_DAILY_RESOURCES|SPM_PELVIC_LAB|SPM_SENSATE_LAB|SPM_BREATHING_LAB|SPM_MODULES\s*=/.test(src),'Referencia transversal inesperada');
const b=html.indexOf('erection-practice-v1.js'),p=html.indexOf('erection-day1-premium-preview-v1.js'),a=html.indexOf('daily-practice-v1.js');
assert.ok(b>=0&&p>b&&a>p,'La carga de scripts no respeta el orden esperado');
console.log('SPM: Día 1 aislado, días 2-28 y rutas transversales intactas.');
