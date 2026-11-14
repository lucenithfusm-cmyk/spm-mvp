const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'premium-v2/ejaculatory-startstop-v2.js'),'utf8');
const legacy=fs.readFileSync(path.join(root,'premium-v2/ejaculatory-control.js'),'utf8');
const posters=[1,2,3,4,5].map(i=>'premium-v2/assets/ep/stop-start/step-'+i+'.webp');
const wait=()=>new Promise(r=>setTimeout(r,15));
function harness(initialDay=1,initialPrimary='ejaculation'){
 const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,events={saved:[],reads:[],home:0},ctx={userId:'qa-user',planId:'qa-plan',primary:initialPrimary,day:initialDay,safety:'none',flags:[],checkins:[]};
 w.SPM_RESOURCE_CONTEXT=()=>({...ctx});
 w.SPM_DAILY_RECORDS={async read(scope,day){events.reads.push([scope,day]);if(scope!=='qa-user:qa-plan')throw Error('wrong plan');return{};}};
 w.SPM_DAILY_PRACTICE={
  restricted:()=>false,
  assignments:c=>[{id:'main',kind:c.primary==='ejaculation'?'ejaculation':'erection'}],
  async saveActivity(id,record,scope,day){events.saved.push({id,record,scope,day});if(scope!=='qa-user:qa-plan'||day!==ctx.day)throw Error('wrong session');},
  open(){events.home++}
 };
 w.speechSynthesis={cancel(){},getVoices(){return[]},speak(){}};
 w.SpeechSynthesisUtterance=function(t){this.text=t};
 w.matchMedia=()=>({matches:false,addEventListener(){}});
 w.eval(source);
 const host=w.document.querySelector('#spmStartStopV2'),ui=host.shadowRoot,api=w.SPM_STARTSTOP_V2;
 return {w,dom,host,ui,api,ctx,events,close(){api?.close(false);w.close()}};
}
test('approved five images are independent valid WebP assets and navigation is real',()=>{
 for(const file of posters){
  const b=fs.readFileSync(path.join(root,file));assert.ok(b.length>10000,file);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');
 }
 assert.equal((source.match(/assets\/ep\/stop-start\/step-\d.webp/g)||[]).length,5);
 assert.doesNotMatch(source,/data:image\/webp;base64/);
 const h=harness();try{
  assert.equal(h.host.hidden,true);
  assert.deepEqual([...h.api.scheduledDays],[1,3,5,22]);
  assert.equal(h.api.open(1,{origin:'dailyPlan'}),true);
  assert.equal(h.host.hidden,false);
  assert.match(h.ui.querySelector('#stage img').src,/step-1\.webp$/);
  assert.match(h.ui.querySelector('#voiceHint').textContent,/Activa la bocina/);
  for(let i=1;i<5;i++){h.ui.querySelector('#next').click();assert.match(h.ui.querySelector('#stage img').src,new RegExp('step-'+(i+1)+'\\.webp$')); }
  assert.match(h.ui.querySelector('#next').textContent,/Finalizar y volver a Hoy/);
  assert.ok(h.ui.querySelector('#listen'));
 }finally{h.close()}
});
test('moving needle, timer, stop registration and real 28-day save remain connected',async()=>{
 const h=harness();try{
  assert.equal(h.api.open(1,{origin:'dailyPlan'}),true);await wait();
  h.ui.querySelector('#next').click();
  const scale=h.ui.querySelector('.adjust');scale.value='8';scale.dispatchEvent(new h.w.Event('input',{bubbles:true}));
  assert.equal(h.ui.querySelector('.gauge').getAttribute('aria-valuenow'),'8');
  assert.equal(h.ui.querySelector('[data-arousal]').textContent,'8');
  h.ui.querySelector('#next').click();h.ui.querySelector('#next').click();
  assert.equal(h.ui.querySelector('#timer').textContent,'00:00');
  assert.equal(h.ui.querySelector('#registerBtn').disabled,true);
  h.ui.querySelector('#timerBtn').click();assert.equal(h.ui.querySelector('#registerBtn').disabled,false);
  h.ui.querySelector('#registerBtn').click();
  assert.equal(h.ui.querySelector('#count').textContent,'1');
  h.ui.querySelector('#next').click();
  h.ui.querySelector('#feeling').value='mejor';
  h.ui.querySelector('#saveBtn').click();await wait();
  assert.equal(h.events.saved.length,1);
  assert.equal(h.events.saved[0].id,'main');assert.equal(h.events.saved[0].scope,'qa-user:qa-plan');
  assert.equal(h.events.saved[0].day,1);
  assert.equal(h.events.saved[0].record.tech,'startstop');
  assert.equal(h.events.saved[0].record.stops,1);
  assert.equal(h.events.saved[0].record.arousal,8);
  assert.equal(h.ui.querySelector('#saveBtn').disabled,true);
  h.ui.querySelector('#next').click();assert.equal(h.host.hidden,true);assert.equal(h.events.home,1);
 }finally{h.close()}
});
test('no direct unauthorized save and no silent completion of a session without practicing',async()=>{
 const h=harness();try{
  assert.equal(h.api.open(1,{origin:'dailyPlan'}),true);await wait();
  for(let i=0;i<4;i++)h.ui.querySelector('#next').click();
  h.ui.querySelector('#feeling').value='similar';h.ui.querySelector('#saveBtn').click();await wait();
  assert.equal(h.events.saved.length,0);assert.match(h.ui.querySelector('#saveStatus').textContent,/Inicia primero/);
  h.api.close(false);
  h.ctx.day=2;assert.equal(h.api.open(1,{origin:'dailyPlan'}),false);
  h.ctx.day=1;h.ctx.safety='review';assert.equal(h.api.open(1,{origin:'dailyPlan'}),false);
  h.ctx.safety='none';h.ctx.primary='erection';assert.equal(h.api.open(1,{origin:'dailyPlan'}),false);
  assert.equal(h.api.open(8,{origin:'dailyPlan'}),false);
  assert.equal(h.events.saved.length,0);
 }finally{h.close()}
});
test('four Start/Stop sessions retain all squeeze and combined slots in 28-day schedule',()=>{
 const m=legacy.match(/const SCHEDULE=(\{[^;]+\});/);assert.ok(m);
 const schedule=Function('return '+m[1])();
 assert.deepEqual(Object.entries(schedule).filter(([,x])=>x.tech==='startstop').map(([day])=>Number(day)),[1,3,5,22]);
 assert.deepEqual(Object.entries(schedule).filter(([,x])=>x.tech==='squeeze').map(([day])=>Number(day)),[8,10,12,24]);
 assert.deepEqual(Object.entries(schedule).filter(([,x])=>x.tech==='combined').map(([day])=>Number(day)),[15,17,19,26]);
 assert.match(legacy,/SPM_STARTSTOP_V2/,'legacy entry routes to approved module');
});
