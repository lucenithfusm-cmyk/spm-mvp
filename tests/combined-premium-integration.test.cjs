const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');
const root=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(root,'premium-v2/ejaculatory-combined-v1.js'),'utf8');
const route=fs.readFileSync(path.join(root,'premium-v2/ejaculatory-control.js'),'utf8');
const wait=()=>new Promise(r=>setTimeout(r,35));
function harness(day=15,data={}){
 const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,ctx={userId:'combined-review',planId:'ep-test',day,primary:'ejaculation',safety:'none',flags:[],checkins:[]},writes=[];
 w.HTMLMediaElement.prototype.pause=function(){};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.SPM_RESOURCE_CONTEXT=()=>({...ctx});
 w.SPM_DAILY_RECORDS={async read(scope,d){assert.equal(scope,'combined-review:ep-test');return data[d]||{}}};
 w.SPM_DAILY_PRACTICE={restricted:()=>false,assignments:()=>[{id:'main',kind:'ejaculation'}],async saveActivity(id,rec,scope,d){writes.push({id,rec,scope,d})},open(){}};
 w.speechSynthesis={cancel(){},getVoices(){return[]},speak(){}};
 w.SpeechSynthesisUtterance=function(t){this.text=t};
 w.eval(require('./helpers/device-voice-fixture.cjs').read('premium-v2/device-voice-v1.js'));w.eval(src);
 const host=w.document.querySelector('#spmCombinedV1'),ui=host?.shadowRoot,api=w.SPM_COMBINED_V1;
 return{w,ctx,api,host,ui,writes,close(){api?.close(false);w.close()}};
}
test('combined trainer is a distinct five-screen premium module using three approved posters and pelvic contraction clip',()=>{
 for(const f of ['combinada-intro.webp','combinada-escala.webp','combinada-pasos.webp']){
  const p=path.join(root,'premium-v2/assets/ep/combined',f);
  const b=fs.readFileSync(p);assert.ok(b.length>20000);assert.equal(b.toString('ascii',0,4),'RIFF');
 }
 const clip=fs.readFileSync(path.join(root,'premium-v2/assets/videos/techniques/pelvic-contraction.mp4'));
 assert.ok(clip.length>10000);
 const h=harness();
 try{
  assert.deepEqual([...h.api.scheduledDays],[15,17,19,26]);
  assert.equal(h.api.open(15,{origin:'dailyPlan'}),true);
  assert.match(h.ui.querySelector('#stage img').getAttribute('src'),/combined\/combinada-intro\.webp/);
  h.ui.querySelector('#next').click();
  assert.match(h.ui.querySelector('#stage img').getAttribute('src'),/combined\/combinada-escala\.webp/);
  assert.ok(h.ui.querySelector('input.adjust'),'arousal range must be interactive');
  h.ui.querySelector('#next').click();
  assert.match(h.ui.querySelector('#stage img').getAttribute('src'),/combined\/combinada-pasos\.webp/);
  const v=h.ui.querySelector('#combinedDemo');assert.ok(v&&v.controls);
  assert.match(v.getAttribute('src'),/pelvic-contraction\.mp4/);
  assert.doesNotMatch(v.getAttribute('src'),/stop-squeeze\.mp4/);
  assert.ok(h.ui.querySelector('#listen'),'speaker must be present on every step');
 }finally{h.close()}
});
test('week 3 practice can register a cycle without requiring timer, evaluate comfort, and save genuine activity',async()=>{
 const h=harness();
 try{
  h.api.open(15,{origin:'dailyPlan'});await wait();
  for(let i=0;i<3;i++)h.ui.querySelector('#next').click();
  const reg=h.ui.querySelector('#registerBtn');
  assert.equal(reg.disabled,false,'stopwatch must remain optional');
  reg.click();assert.equal(h.ui.querySelector('#count').textContent,'1');
  h.ui.querySelector('#next').click();
  const save=h.ui.querySelector('#saveBtn');save.click();
  assert.match(h.ui.querySelector('#saveStatus').textContent,/Responde las cuatro preguntas/);
  for(const [id,value] of [['feeling','similar'],['difficulty','dificil'],['discomfort','ninguna'],['progress','no_seguro']]){
   const input=h.ui.querySelector('#'+id);assert.ok(input);input.value=value;input.dispatchEvent(new h.w.Event('change',{bubbles:true}));
  }
  save.click();await wait();
  assert.equal(h.writes.length,1);
  const record=h.writes[0].rec;
  assert.equal(record.tech,'combined');assert.equal(record.day,15);assert.equal(record.stops,1);
  assert.equal(record.difficulty,'dificil');assert.equal(record.discomfort,'ninguna');
  assert.equal(record.progressPerceived,'no_seguro');
  assert.equal(h.ui.querySelector('#saveBtn').disabled,true);
 }finally{h.close()}
});
test('zero-cycle practice can be confirmed and saved, but not silently without confirmation',async()=>{
 const h=harness();
 try{
  h.api.open(15,{origin:'dailyPlan'});await wait();
  for(let i=0;i<4;i++)h.ui.querySelector('#next').click();
  for(const [id,value] of [['feeling','dificil'],['difficulty','dificil'],['discomfort','molestia'],['progress','todavia_no']]){const select=h.ui.querySelector('#'+id);select.value=value;select.dispatchEvent(new h.w.Event('change',{bubbles:true}));}
  h.ui.querySelector('#saveBtn').click();await wait();
  assert.equal(h.writes.length,0);assert.match(h.ui.querySelector('#saveStatus').textContent,/Confirma/);
  h.ui.querySelector('#prev').click();
  h.ui.querySelector('#confirmPracticeBtn').click();
  h.ui.querySelector('#next').click();
  h.ui.querySelector('#saveBtn').click();await wait();
  assert.equal(h.writes.length,1);assert.equal(h.writes[0].rec.stops,0);
 }finally{h.close()}
});
test('week 4 real-record comparison shows all three techniques and does not invent improvement',async()=>{
 const data={
  1:{main:{day:1,week:1,tech:'squeeze',completed:true,feeling:'similar'}},
  8:{main:{day:8,week:2,tech:'startstop',completed:true,feeling:'dificil'}},
  15:{main:{day:15,week:3,tech:'combined',completed:true,feeling:'dificil',difficulty:'dificil',discomfort:'ninguna'}},
  22:{main:{day:22,week:4,tech:'squeeze',completed:true,feeling:'mejor',difficulty:'intermedia',discomfort:'ninguna'}},
  24:{main:{day:24,week:4,tech:'startstop',completed:true,feeling:'similar',difficulty:'intermedia',discomfort:'ninguna'}}
 };
 const h=harness(26,data);
 try{
  assert.equal(h.api.open(26,{origin:'dailyPlan'}),true);await wait();
  for(let i=0;i<4;i++)h.ui.querySelector('#next').click();
  const balance=h.ui.querySelector('#balance').textContent;
  assert.match(balance,/Stop–Squeeze/);assert.match(balance,/Stop–Start/);assert.match(balance,/Técnica combinada/);
  assert.match(balance,/Última percepción/);
  assert.match(balance,/no se presupone una mejoría/i);
  assert.doesNotMatch(balance,/garantizada|curación asegurada/i);
 }finally{h.close()}
});
test('historical other-tech completion blocks overwrite and safety flags prevent daily entry',async()=>{
 const h=harness(15,{15:{main:{day:15,completed:true,tech:'squeeze',stops:2}}});
 try{
  assert.equal(h.api.open(15,{origin:'dailyPlan'}),true);await wait();
  for(let i=0;i<4;i++)h.ui.querySelector('#next').click();
  assert.equal(h.ui.querySelector('#saveBtn').disabled,true);
  assert.match(h.ui.querySelector('#stage').textContent,/registro previo/);
  assert.equal(h.writes.length,0);
  h.api.close(false);h.ctx.safety='review';
  assert.equal(h.api.open(15,{origin:'dailyPlan'}),false);
  h.ctx.safety='none';h.ctx.primary='erection';
  assert.equal(h.api.open(15,{origin:'dailyPlan'}),false);
 }finally{h.close()}
});
test('single SPM EP router opens week 3 and week 4 premium resources in correct order without legacy UI',()=>{
 const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only'});
 try{
  const w=dom.window,calls=[];
  for(const [key,name] of [['SPM_SQUEEZE_V1','squeeze'],['SPM_STARTSTOP_V2','startstop'],['SPM_COMBINED_V1','combined']])w[key]={open(d){calls.push([d,name]);return true},close(){}};
  w.eval(route);
  const r=w.SPM_EJACULATORY_CONTROL;
  assert.equal(Object.keys(r.schedule).length,12);
  for(const [day,tech] of [[15,'combined'],[17,'combined'],[19,'combined'],[22,'squeeze'],[24,'startstop'],[26,'combined']]){
   assert.equal(r.schedule[day].tech,tech);
   assert.equal(r.open(day,{origin:'library'}),true);
  }
  assert.deepEqual(calls,[[15,'combined'],[17,'combined'],[19,'combined'],[22,'squeeze'],[24,'startstop'],[26,'combined']]);
  assert.equal(w.document.querySelector('#spmEcModal'),null);
  assert.doesNotMatch(route,/function mount\(\)/);
  assert.match(r.weeks[4][1],/Stop–Squeeze.*Stop–Start.*Combinada/);
 }finally{dom.window.close()}
});
