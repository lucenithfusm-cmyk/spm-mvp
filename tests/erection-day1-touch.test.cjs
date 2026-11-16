/* SPM Erección, día 1: salvaguardas contra rutas duplicadas. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),get=p=>fs.readFileSync(path.join(root,p));
const js=get('premium-v2/erection-day1-touch-v1.js').toString('utf8');
const live=get('premium-v2/live.html').toString('utf8');
assert.match(js,/SPM_FIRMNESS_GUIDE\.open\(button\)/,'La lámina EHS enlaza con el visor existente');
assert.match(js,/SPM_DAILY_PRACTICE\.saveActivity\('main',record,s\.scope,1\)/,'El progreso reutiliza el guardado de Hoy');
assert.match(js,/s\.ehs==='na'\?null:s\.ehs/,'No evaluable distinto de cero');
assert.match(js,/s\.feedback==='not_done'/,'Sin práctica no hay sesión completada');
assert.match(js,/c\.primary!=='erection'/,'Sin alterar otros dominios');
assert.match(js,/Number\(c\.day\)!==1/,'Solo se modifica día 1');
assert.ok(live.includes('erection-day1-touch-v1.js'),'Capa táctil vinculada en live');
assert.ok(live.indexOf('erection-day1-touch-v1.js')>live.indexOf('erection-practice-v1.js'),'El contrato existente se carga antes');
assert.ok(live.indexOf('erection-day1-touch-v1.js')<live.indexOf('daily-practice-v1.js'),'Hoy carga después de la capa táctil');
for(let day=1;day<=6;day++){const p='premium-v2/assets/erection-day1/dia1-'+String(day).padStart(2,'0')+'.webp';const buf=get(p);assert.equal(buf.subarray(0,4).toString(),'RIFF',p);assert.equal(buf.subarray(8,12).toString(),'WEBP',p);assert.ok(buf.length>100000,p);}
console.log('OK: SPM Erección Día 1 — seis imágenes, EHS, seguridad, único acceso y progreso');
