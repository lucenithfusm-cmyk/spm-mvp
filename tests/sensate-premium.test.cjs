const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../labs/sensate/node_modules/jsdom');
const root=path.resolve(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'premium-v2/sensate-premium-v1.js'),'utf8');
const wait=()=>new Promise(r=>setTimeout(r,30));
function harness({day=8,practiceId='sf-focus-1',restriction='none',mode='daily',saved=[],recordDailyOk=true}={}){
 const dom=new JSDOM('<!doctype html><html lang="es"><body><div id="sensatePremium"></div></body></html>',{url:'https://spm.test/premium-v2/sensate-lab/index.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,records={ 'spm-sensate-records':JSON.stringify(saved)},writes=[],outcomes=[],cfg={day,origin:mode==='daily'?'dailyPlan':'library',mode,restriction,activity:mode==='daily'?{day,practiceId,title:'Focalización sensorial asignada',optionalProgression:true}:null};
 const api={
  getContext(){return cfg},
  getState(){return {...records}},
  write(k,v){writes.push([k,v]);records[k]=v;return true},
  async flush(){outcomes.push('flush')},
  async recordDaily(){outcomes.push('recordDaily');return typeof recordDailyOk==='function'?recordDailyOk():recordDailyOk},
  async isDailyCompleted(){return false},
  async close(){outcomes.push('close');return true},
  async openLibrary(){outcomes.push('library');return true}
 };
 Object.defineProperty(w,'parent',{value:{SPM_SENSATE_LAB_HOST:api},configurable:true});
 w.speechSynthesis={cancel(){},getVoices(){return []},speak(){}};
 w.SpeechSynthesisUtterance=function(text){this.text=text};
 w.eval(ui);
 const page=w.document.querySelector('#sensatePremium');
 function click(act){const el=page.querySelector('[data-act="'+act+'"]');assert.ok(el,'missing action '+act);el.click();return el}
 function choose(name,value){
  const input=page.querySelector('input[type=radio][name="'+name+'"][value="'+value+'"]');
  assert.ok(input,'missing '+name+' '+value);input.checked=true;input.dispatchEvent(new w.Event('change',{bubbles:true}));
 }
 return {w,dom,page,api,records,writes,outcomes,cfg,click,choose,close(){w.close()}};
}
test('Premium is an actual replacement of the old Sensate entry; original clinical library source is retained',()=>{
 const index=fs.readFileSync(path.join(root,'premium-v2/sensate-lab/index.html'),'utf8');
 assert.match(index,/sensate-premium-v1\.js/);
 assert.match(index,/sensate-premium-v1\.css/);
 assert.doesNotMatch(index,/index-C1hXctr7\.js/);
 const clinical=fs.readFileSync(path.join(root,'labs/sensate/src/components/SensateLab.tsx'),'utf8');
 for(const label of ['Focalización sensorial I','Focalización sensorial II','Comunicación mínima','Presencia corporal individual','sf-focus-1','sf-focus-2'])assert.match(clinical,new RegExp(label));
 for(const name of ['inicio','preparacion','guia','cierre']){
  const f=fs.readFileSync(path.join(root,'premium-v2/assets/sensate-premium/focalizacion-'+name+'.webp'));
  assert.ok(f.length>15000);assert.equal(f.toString('ascii',0,4),'RIFF');
 }
});
test('Seven transversal days and routes remain assigned by original SPM daily-support curriculum',()=>{
 const source=fs.readFileSync(path.join(root,'premium-v2/daily-support-plan-v1.js'),'utf8');
 for(const day of [4,8,12,16,19,23,26])assert.match(source,new RegExp('\\b'+day+':\\{id:\\x27sensate-'));
 for(const route of ['erection','ejaculation','desire','confidence','anxiety','wellbeing','lifestyle','optimization','mixed'])assert.ok(source.includes("'"+route+"'"));
});
test('Focus I is partner-consent-gated, uses existing non-genital sequence and needs explicit completion before saving',async()=>{
 const h=harness();
 try{
  assert.match(h.page.textContent,/Focalización sensorial/i);
  assert.ok(h.page.querySelector('[data-act=audio]'),'functional voice control');
  h.click('next');assert.ok(h.page.querySelector('[data-field=consent]'));
  h.click('next');assert.match(h.page.textContent,/Ambos deben aceptar participar/);
  const consent=h.page.querySelector('[data-field=consent]');consent.checked=true;consent.dispatchEvent(new h.w.Event('change',{bubbles:true}));
  h.click('next');h.click('nextphase');assert.match(h.page.textContent,/A toca/);
  assert.match(h.page.textContent,/Sin contacto genital ni con el pecho|No hay obligación/i);
  h.click('next');
  assert.match(h.page.textContent,/Marca «Ya realicé esta práctica»/);
  assert.equal(h.writes.length,0);
  h.click('performed');h.click('next');
  h.choose('comfort','comodo');h.choose('ease','intermedia');h.choose('attention','conexion');h.choose('repeat','si');h.choose('discomfort','ninguna');
  h.click('save');await wait();
  assert.ok(h.page.textContent.includes('Experiencia guardada'));
  assert.equal(h.writes.length,1);
  assert.ok(h.outcomes.includes('recordDaily'));
  const rows=JSON.parse(h.records['spm-sensate-records']);
  assert.equal(rows.length,1);assert.equal(rows[0].day,8);assert.equal(rows[0].practiceId,'sf-focus-1');
  assert.equal(rows[0].completed,true);assert.equal(rows[0].comfort,'comodo');assert.equal(rows[0].difficulty,'intermedia');
  assert.equal(rows[0].recommendation,'repeat','Focus II is not inferred from default ratings');
 }finally{h.close()}
});
test('Solo activity works without partner consent and can be recorded only after action',async()=>{
 const h=harness({day:4,practiceId:'sf-solo'});
 try{
  h.click('next');assert.equal(h.page.querySelector('[data-field=consent]'),null);
  h.click('next');h.click('nextphase');h.click('nextphase');assert.match(h.page.textContent,/antebrazo/i);
  h.click('performed');h.click('next');
  for(const [name,value] of [['comfort','neutro'],['ease','facil'],['attention','distraccion'],['repeat','si'],['discomfort','ninguna']])h.choose(name,value);
  h.click('save');await wait();
  assert.equal(h.writes.length,1);const rows=JSON.parse(h.records['spm-sensate-records']);
  assert.equal(rows[0].practiceId,'sf-solo');assert.equal(rows[0].day,4);
  assert.equal(rows[0].origin,'dailyPlan');
 }finally{h.close()}
});
test('Focus II only enabled after a completed, comfortable Focus I; communication retains all four existing phrases',()=>{
 const a=harness({mode:'library'});
 try{
  const button=a.page.querySelector('[data-act=mode][data-value=sf-focus-2]');
  assert.ok(button);assert.equal(button.disabled,true);
 }finally{a.close()}
 const completed={day:8,completed:true,practiceId:'sf-focus-1',partnerComfort:8,pressureAfter:2,recommendation:'progress'};
 const b=harness({mode:'library',saved:[completed]});
 try{
  const button=b.page.querySelector('[data-act=mode][data-value=sf-focus-2]');
  assert.equal(button.disabled,false);
  button.click();assert.match(b.page.textContent,/Focus II/);
  assert.match(ui,/Más lento/);assert.match(ui,/Así está bien/);assert.match(ui,/Prefiero otro contacto/);assert.match(ui,/Pausa/);
 }finally{b.close()}
});
test('Safety review pauses physical practice without erasing educational content',()=>{
 const h=harness({restriction:'review'});
 try{
  h.click('next');assert.match(h.page.textContent,/está en pausa por una indicación de seguridad/i);
  h.click('next');assert.match(h.page.textContent,/La práctica está en pausa/);
  assert.equal(h.writes.length,0);
 }finally{h.close()}
});
test('Failure to complete the SPM daily save never claims success; retry updates same sensate record',async()=>{
 let tries=0;const h=harness({day:12,practiceId:'sf-solo',recordDailyOk:()=>++tries>1});
 try{
  h.click('next');h.click('next');h.click('performed');h.click('next');
  for(const [name,value] of [['comfort','tenso'],['ease','dificil'],['attention','ansiedad'],['repeat','aun_no'],['discomfort','molestia']])h.choose(name,value);
  h.click('save');await wait();
  assert.match(h.page.textContent,/No se pudo guardar/);
  assert.doesNotMatch(h.page.textContent,/Experiencia guardada en tu programa SPM ✓/);
  h.click('save');await wait();
  assert.match(h.page.textContent,/Experiencia guardada en tu programa SPM/);
  assert.equal(JSON.parse(h.records['spm-sensate-records']).length,1);
  assert.equal(tries,2);
 }finally{h.close()}
});
test('Original SPM video is attached as an optional library resource, never a completion control',()=>{
 assert.match(ui,/sensory-focus\.mp4/);assert.match(ui,/Ver el video educativo SPM/);
 assert.match(ui,/Verlo no registra una práctica/);
 assert.match(ui,/temperature|temperatura/i);
});
