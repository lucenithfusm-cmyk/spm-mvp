const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,'premium-v2',p),'utf8');
const keys=['firmness','control','desire','confidence','comfort','sleep','skill'];
function testHarness(){
 const d=new JSDOM('<div id="plan"><div id="spmDailyWorkspace"></div></div>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=d.window; w.HTMLElement.prototype.scrollIntoView=function(){};
 const c={userId:'u-demo',planId:'p-demo',day:14,primary:'erection'};
 const rows={1:{checkpointVersion:2,scaleMax:4,milestone:1,submittedDay:1,metrics:Object.fromEntries(keys.map(x=>[x,x==='control'?null:2])),reflection:'Inicio',continuity:'Mi compromiso'}};
 const writes=[];
 w.SPM_RESOURCE_CONTEXT=()=>c;
 w.SPM_DAILY_RECORDS={read:async(_,day)=>rows[day]?{'program-checkpoint':rows[day]}:{},readCheckpoints:async()=>Object.entries(rows).map(([day,metadata])=>({day_number:Number(day),metadata}))};
 w.SPM_DAILY_PRACTICE={open:()=>{},active:()=>null,saveActivity:async(id,record,scope,day)=>{
   assert.equal(id,'program-checkpoint');assert.equal(scope,'u-demo:p-demo');assert.equal(day,c.day);
   writes.push(JSON.parse(JSON.stringify(record)));rows[day]=JSON.parse(JSON.stringify(record));return true;
 }};
 for(const src of ['erection-fullscreen-v1.js','spm-checkpoint-touch-v1.js','checkpoint-audio-v1.js','program-checkpoint-v1.js'])w.eval(read(src));
 return{w,c,rows,writes,close:()=>w.close()};
}
function score(w,key,value){const button=w.document.querySelector('[data-ck-action="score"][data-metric="'+key+'"][data-value="'+value+'"]');assert.ok(button,'touch target '+key+':'+value);button.click();}
function fillFirst(w,v){for(const k of keys.slice(0,4))score(w,k,k==='control'?5:v)}
function fillSecond(w,v){for(const k of keys.slice(4))score(w,k,v)}
async function chooseDay(h,day){h.c.day=day;await h.w.SPM_PROGRAM_CHECKPOINT.open({id:'program-checkpoint',kind:'program-checkpoint'},true);}

test('Días 14 y 28 conservan las cuatro imágenes originales y siete indicadores de 0 a 4 o NA',()=>{
 const js=read('spm-checkpoint-touch-v1.js'),css=read('spm-checkpoint-touch-v1.css');
 for(const d of [14,28])for(const n of [1,2]){
  const p='assets/checkpoint-erection/day'+d+'-screen-0'+n+'.jpg';
  const image=fs.readFileSync(path.join(root,'premium-v2',p));
  assert.ok(image.length>300000);
  assert.equal(image[0],0xff);assert.equal(image[1],0xd8);
  assert.ok(js.includes(p));
 }
 assert.match(css,/aspect-ratio:864\/1536/);
 assert.match(js,/const vals=\[0,1,2,3,4,null\]/);
 assert.match(js,/m\.metrics\[k\]=vals\[index\]/);
 assert.match(js,/No evaluable \/ no aplica/);
});
test('Día 14: dos láminas y selección obligatoria; guarda en el formulario e informe originales',async()=>{
 const h=testHarness();try{
  await chooseDay(h,14);const {w}=h;
  const hiddenForm=w.document.querySelector('[data-program-checkpoint]');
  assert.ok(hiddenForm,'Original form remains in DOM');assert.equal(hiddenForm.style.display,'none');
  assert.ok(w.document.querySelector('[data-spm-checkpoint-touch][data-checkpoint-day="14"]'));
  assert.equal(w.document.querySelector('[data-checkpoint-screen]').getAttribute('data-checkpoint-screen'),'1');
  w.document.querySelector('[data-ck-action="next"]').click();
  assert.ok(w.document.querySelector('[data-spm-er-alert]'),'Missing selections trigger centred alert');
  w.document.querySelector('[data-spm-er-close]').click();
  fillFirst(w,3);w.document.querySelector('[data-ck-action="next"]').click();
  assert.equal(w.document.querySelector('[data-checkpoint-screen]').getAttribute('data-checkpoint-screen'),'2');
  fillSecond(w,4);
  const fields=w.document.querySelectorAll('[data-ck-note]');assert.equal(fields.length,2);
  fields[0].value='Me ayudó reconocer contextos';fields[0].dispatchEvent(new w.Event('input',{bubbles:true}));
  fields[1].value='Continuaré observando';fields[1].dispatchEvent(new w.Event('input',{bubbles:true}));
  w.document.querySelector('[data-ck-action="save"]').click();await new Promise(r=>setTimeout(r,15));
  assert.equal(h.writes.length,1);
  assert.equal(h.writes[0].checkpointVersion,2);
  assert.equal(h.writes[0].metrics.control,null);
  assert.equal(h.writes[0].metrics.firmness,3);
  assert.equal(h.writes[0].metrics.sleep,4);
  assert.equal(h.writes[0].reflection,'Me ayudó reconocer contextos');
  assert.ok(w.document.querySelector('[data-program-report]'),'Existing report is displayed on save');
  assert.match(w.document.querySelector('[data-program-report]').textContent,/Tu evolución percibida/);
 }finally{h.close()}
});
test('Día 28: preview with available report, then saves only one checkpoint with continuity',async()=>{
 const h=testHarness();try{
  const {w}=h;h.rows[14]={checkpointVersion:2,scaleMax:4,milestone:14,submittedDay:14,metrics:Object.fromEntries(keys.map(k=>[k,3])),reflection:'Avances',continuity:'Mi rutina'};
  await chooseDay(h,28);
  fillFirst(w,3);w.document.querySelector('[data-ck-action="next"]').click();
  fillSecond(w,4);
  w.document.querySelectorAll('[data-ck-note]').forEach((t,i)=>{t.value=i?'Cada sábado':'Practicar la calma';t.dispatchEvent(new w.Event('input',{bubbles:true}))});
  w.document.querySelector('[data-ck-action="report"]').click();
  const modal=w.document.querySelector('.spm-ck-report-card');assert.ok(modal);
  assert.match(modal.textContent,/Vista previa sin guardar/);
  assert.match(modal.textContent,/Día 1/);assert.match(modal.textContent,/Día 14/);assert.match(modal.textContent,/Día 28/);
  assert.equal(h.writes.length,0,'Preview is never saved');
  w.document.querySelector('[data-ck-close-report]').click();
  w.document.querySelector('[data-ck-action="save"]').click();await new Promise(r=>setTimeout(r,15));
  assert.equal(h.writes.length,1);assert.equal(h.writes[0].milestone,28);
  assert.equal(h.writes[0].reflection,'Practicar la calma');assert.equal(h.writes[0].continuity,'Cada sábado');
  assert.match(w.document.querySelector('[data-program-report]').textContent,/Lo aprendido continúa contigo/);
  assert.match(w.document.querySelector('[data-program-report]').textContent,/4\/4/);
 }finally{h.close()}
});
test('No introduce una segunda base de datos ni voces de proveedor',()=>{
 const js=read('spm-checkpoint-touch-v1.js'),base=read('program-checkpoint-v1.js');
 assert.doesNotMatch(js,/localStorage\.|new window\.Audio\(|\.voice\s*=/);
 assert.match(js,/window\.speechSynthesis\.speak\(u\)/);
 assert.match(base,/legacySnapshot\(prior\)/);
 assert.match(base,/comparison\(available\)/);
 assert.match(base,/archivedRecords\(available\)/);
 assert.match(base,/window\.SPM_DAILY_PRACTICE\.saveActivity\(activity\.id,record,captured,day\)/);
 assert.match(base,/form\.style\.display='none'/);
});