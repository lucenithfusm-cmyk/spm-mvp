const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');
const root=path.resolve(__dirname,'..'),src=fs.readFileSync(path.join(root,'premium-v2/ejaculatory-squeeze-v1.js'),'utf8'),legacy=fs.readFileSync(path.join(root,'premium-v2/ejaculatory-control.js'),'utf8');
const wait=()=>new Promise(resolve=>setTimeout(resolve,20));
function harness(day=8){
 const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,ctx={userId:'qa-squeeze',planId:'ep-plan',day,primary:'ejaculation',safety:'none',flags:[],checkins:[]},saves=[],home=[];
 w.HTMLMediaElement.prototype.pause=function(){this.dataset.paused='yes'};
 w.SPM_RESOURCE_CONTEXT=()=>({...ctx});
 w.SPM_DAILY_RECORDS={async read(s,d){assert.equal(s,'qa-squeeze:ep-plan');return{}}};
 w.SPM_DAILY_PRACTICE={restricted:()=>false,assignments:()=>[{id:'main',kind:'ejaculation'}],async saveActivity(id,v,scope,d){assert.equal(scope,'qa-squeeze:ep-plan');assert.equal(d,ctx.day);saves.push({id,v,scope,d})},open(x){home.push(x)}};
 w.speechSynthesis={cancel(){},getVoices(){return[]},speak(){}};
 w.SpeechSynthesisUtterance=function(v){this.text=v};
 w.eval(src);
 const api=w.SPM_SQUEEZE_V1,host=w.document.querySelector('#spmSqueezeV1'),ui=host.shadowRoot;
 return{w,api,host,ui,ctx,saves,home,close(){api.close(false);w.close()}};
}
test('five original posters and five-second technique clip are real, independent assets',()=>{
 for(let i=1;i<=5;i++){
  const f=fs.readFileSync(path.join(root,'premium-v2/assets/ep/stop-squeeze/step-'+i+'.webp'));
  assert.ok(f.length>20000);assert.equal(f.toString('ascii',0,4),'RIFF');assert.equal(f.toString('ascii',8,12),'WEBP');
 }
 const mp4=fs.readFileSync(path.join(root,'premium-v2/assets/videos/techniques/stop-squeeze.mp4'));
 const offset=mp4.indexOf('mvhd');assert.ok(offset>0);const timescale=mp4.readUInt32BE(offset+16);
 const seconds=mp4.readUInt32BE(offset+20)/timescale;assert.ok(seconds>4.5&&seconds<6,'real MP4 duration is approximately five seconds');
 const h=harness();try{assert.deepEqual([...h.api.scheduledDays],[8,10,12,24])}finally{h.close()}
});
test('third page preserves all five source illustrations around video and fourth page offers a closed recap',()=>{
 const h=harness();try{
  assert.equal(h.api.open(8,{origin:'dailyPlan'}),true);
  assert.match(h.ui.querySelector('#stage img').src,/step-1\.webp$/);
  h.ui.querySelector('#next').click();assert.match(h.ui.querySelector('#stage img').src,/step-2\.webp$/);
  h.ui.querySelector('#next').click();
  const stage=h.ui.querySelector('#stage'),slices=stage.querySelectorAll('.squeeze-step-visual'),clip=stage.querySelector('#squeezeDemo');
  assert.equal(slices.length,2,'the original artwork is divided only between steps three and four');
  for(const visual of slices)assert.match(visual.querySelector('img').src,/stop-squeeze\/step-3\.webp$/);
  assert.ok(clip&&clip.controls&&clip.hasAttribute('playsinline'));
  assert.match(clip.getAttribute('src'),/stop-squeeze\.mp4$/);
  assert.equal(stage.children[1].querySelector('#squeezeDemo'),clip);
  assert.equal(stage.lastElementChild,slices[1]);
  h.ui.querySelector('#next').click();
  assert.equal(h.ui.querySelector('#squeezeDemo'),null);
  assert.match(h.ui.querySelector('#stage img').src,/step-4\.webp$/);
  const recap=h.ui.querySelector('details.squeeze-mini-demo'),mini=recap?.querySelector('#squeezeDemoMini');
  assert.ok(recap&&!recap.open,'on page four the video is an optional closed support');
  assert.ok(mini?.controls&&mini.hasAttribute('playsinline'));
  assert.equal(mini.preload,'none');
  h.ui.querySelector('#next').click();assert.match(h.ui.querySelector('#stage img').src,/step-5\.webp$/);
 }finally{h.close()}
});
test('moving the needle, timer, stop button and patient-day recording work for Stop Squeeze',async()=>{
 const h=harness();try{
  assert.equal(h.api.open(8,{origin:'dailyPlan'}),true);await wait();
  h.ui.querySelector('#next').click();const slider=h.ui.querySelector('.adjust');slider.value='7';slider.dispatchEvent(new h.w.Event('input',{bubbles:true}));
  assert.equal(h.ui.querySelector('.gauge').getAttribute('aria-valuenow'),'7');
  h.ui.querySelector('#next').click();h.ui.querySelector('#next').click();
  const reg=h.ui.querySelector('#registerBtn');assert.equal(reg.disabled,true);
  h.ui.querySelector('#timerBtn').click();reg.click();assert.equal(h.ui.querySelector('#count').textContent,'1');
  h.ui.querySelector('#next').click();h.ui.querySelector('#feeling').value='similar';h.ui.querySelector('#saveBtn').click();await wait();
  assert.equal(h.saves.length,1);assert.equal(h.saves[0].id,'main');
  assert.equal(h.saves[0].v.tech,'squeeze');assert.equal(h.saves[0].v.stops,1);assert.equal(h.saves[0].v.arousal,7);assert.equal(h.saves[0].d,8);
  assert.equal(h.ui.querySelector('#saveBtn').disabled,true);
  h.ui.querySelector('#next').click();assert.equal(h.host.hidden,true);assert.equal(h.home.length,1);
 }finally{h.close()}
});
test('clinical routing preserves the approved mixed fourth week and refuses unsafe access',()=>{
 const h=harness();try{
  h.ctx.day=9;assert.equal(h.api.open(8,{origin:'dailyPlan'}),false);
  h.ctx.day=8;h.ctx.safety='review';assert.equal(h.api.open(8,{origin:'dailyPlan'}),false);
  h.ctx.safety='none';h.ctx.primary='erection';assert.equal(h.api.open(8,{origin:'dailyPlan'}),false);
  const m=legacy.match(/const SCHEDULE=(\{[^;]+\});/);assert.ok(m);
  const schedule=Function('return ('+m[1]+')')();
  assert.deepEqual(Object.entries(schedule).filter(([,x])=>x.tech==='squeeze').map(([n])=>Number(n)),[8,10,12,24]);
  assert.deepEqual(Object.entries(schedule).filter(([,x])=>x.tech==='combined').map(([n])=>Number(n)),[15,17,19,26]);
  assert.match(legacy,/SPM_SQUEEZE_V1/,'Squeeze slots route to approved new module');
 }finally{h.close()}
});
test('patient program and 28-day reviewer load premium Stop-Squeeze before the unified control router',()=>{
 const live=fs.readFileSync(path.join(root,'premium-v2/live.html'),'utf8');
 const review=fs.readFileSync(path.join(root,'premium-v2/program-review-v1.js'),'utf8');
 for(const html of [live,review]){
  const squeeze=html.indexOf('ejaculatory-squeeze-v1.js'),router=html.indexOf('ejaculatory-control.js');
  assert.ok(squeeze>0,'Stop-Squeeze module must be loaded');
  assert.ok(router>squeeze,'Stop-Squeeze must load before unified control router');
 }
 assert.match(legacy,/selected\.tech==='squeeze'\)return window\.SPM_SQUEEZE_V1\?\.open\?\./);
 assert.match(legacy,/selected\.tech==='startstop'\)return window\.SPM_STARTSTOP_V2\?\.open\?\./);
});
