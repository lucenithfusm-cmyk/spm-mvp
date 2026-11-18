'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const controller=read('premium-v2/desire-day2-touch-v1.js');
const bridge=read('premium-v2/desire-day2-bridge-v1.js');
const css=read('premium-v2/desire-day2-touch-v1.css');
const review=read('premium-v2/desire-day2-review/index.html');
const clone=v=>JSON.parse(JSON.stringify(v));
const wait=()=>new Promise(resolve=>setTimeout(resolve,20));
function environment(){
 const voiced=[];
 const host={isConnected:true,innerHTML:'',handlers:{},draft:'',contains:()=>true,addEventListener(k,cb){this.handlers[k]=cb;},
  querySelector(s){if(s==='.spm-ds2-status')return {set textContent(v){host.status=v}};
   if(s==='.spm-ds2-session')return {scrollIntoView(){}};
   if(s==='[data-ds2-editor]')return {value:host.draft,focus(){}};
   if(s?.startsWith('[data-ds2-factor="'))return {dataset:{}};
   return {focus(){}};},
  click(action,value=''){const target={dataset:{ds2Action:action,ds2Value:value},closest(q){return q==='[data-ds2-action]'?target:null;}};this.handlers.click?.({target});},
  chooseSlider(id,value){const target={dataset:{ds2Factor:id},value:String(value),closest(q){return q==='[data-ds2-factor]'?target:null;}};this.handlers.input?.({target});this.handlers.change?.({target});},
  saveField(v){this.draft=v;this.click('save-field');}
 };
 const speech={cancel(){},speak(u){voiced.push(u.text);u.onend?.();}};
 const document={hidden:false,addEventListener(){},querySelector(){return null;},getElementById:id=>id==='spmDailyWorkspace'?host:null};
 const window={speechSynthesis:speech,SpeechSynthesisUtterance:class{constructor(t){this.text=t;}},addEventListener(){}};
 const sandbox={window,document,AbortController,Date,JSON,console,setTimeout,clearTimeout};
 vm.runInNewContext(controller,sandbox);
 return {host,window,document,sandbox,voiced};
}
function baseline(){return {'spm-desire-program':JSON.stringify({v:2,influence:{},detailNotes:{keep:'original'},sessions:[{id:'other-d6',day:6,practiceId:'other',status:'completed'}],dayDone:{'6':'old'}})};}
async function mount(env,start=baseline()){
 let state=clone(start),callbacks=[],backs=0;
 await env.window.SPM_DESIRE_DAY2_TOUCH.mount({host:env.host,storage:{read:async()=>clone(state),save:async s=>{state=clone(s);}},onCompleted:async v=>{callbacks.push(clone(v));},onBack(){backs++;}});
 return {get value(){return clone(state);},get program(){return JSON.parse(state['spm-desire-program']);},get callbacks(){return callbacks;},get backs(){return backs;}};
}
function fillMap(host){for(const [k,n] of [['stress',8],['tired',3],['partner',null],['visual',0]]){if(n===null)host.click('na',k);else host.chooseSlider(k,n);}host.click('next');
 for(const [k,n]of [['touch',10],['novelty',null],['mood',5]]){if(n===null)host.click('na',k);else host.chooseSlider(k,n);}host.click('next');}
function goToMap(host){host.click('next');host.click('choose','closeness');host.click('next');}
function goToEnd(host){goToMap(host);fillMap(host);host.click('detail','privacy');host.click('detail','time');host.click('next');host.click('choose','partner');}
const readP=o=>JSON.parse(o['spm-desire-program']);

test('six approved complete images, one unmodified 864x1536 cover and five 941x1672 portraits',()=>{
 const assets=['screen-01.jpg','screen-02.png','screen-03.png','screen-04.png','screen-05.png','screen-06.png'];
 for(const a of assets){const p=path.join(ROOT,'premium-v2/assets/desire-day2',a);assert.ok(fs.statSync(p).size>350000,a);}
 assert.match(controller,/screen-06\.png/);assert.match(controller,/DIMENSIONS=\[\[864,1536\]/);assert.match(review,/6 pantallas originales/);
});
test('real GIF orbit assets are animated, image-backed, no radio-circle halos',()=>{
 for(const a of ['brain-orbit-cover.gif','brain-orbit-context.gif']){const b=fs.readFileSync(path.join(ROOT,'premium-v2/assets/desire-day2',a));assert.equal(b.subarray(0,3).toString(),'GIF');assert.ok(b.length>2000);}
 assert.match(controller,/brain-orbit-cover\.gif/);assert.match(controller,/brain-orbit-context\.gif/);
 assert.match(css,/\.spm-ds2-orbit-gif/);assert.match(css,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(css,/spm-ds2-radio|hit--choose::after|\.spm-ds2-hit--na::before/);
 assert.match(css,/\.spm-ds2-hit--choose\[aria-pressed="true"\]::before/);
});
test('cover has 3 voice-enabled cards; six-screen selection enforces a centered alert',async()=>{
 const e=environment();await mount(e);
 assert.match(e.host.innerHTML,/data-ds2-page="1"/);assert.equal((e.host.innerHTML.match(/data-ds2-action="intro"/g)||[]).length,3);
 e.host.click('intro','1');assert.match(e.voiced.at(-1),/siete factores/);
 e.host.click('next');assert.match(e.host.innerHTML,/data-ds2-page="2"/);
 assert.equal((e.host.innerHTML.match(/data-ds2-action="choose"/g)||[]).length,6);
 e.host.click('next');assert.match(e.host.innerHTML,/role="alertdialog"/);assert.match(e.host.innerHTML,/Selecciona una opción para avanzar/);
 e.host.click('dismiss');e.host.click('choose','unclear');e.host.click('next');assert.match(e.host.innerHTML,/data-ds2-page="3"/);
});
test('map part 1 cannot be skipped; zeros and explicit N/A count as answers',async()=>{
 const e=environment();await mount(e);goToMap(e.host);
 assert.equal((e.host.innerHTML.match(/type="range"/g)||[]).length,4);
 e.host.click('next');assert.match(e.host.innerHTML,/Valora cada factor de este mapa/);
 e.host.click('dismiss');e.host.chooseSlider('stress',0);e.host.chooseSlider('tired',10);e.host.click('na','partner');e.host.chooseSlider('visual',6);e.host.click('next');assert.match(e.host.innerHTML,/data-ds2-page="4"/);
});
test('map part 2 cannot be skipped; all seven clinical keys persist 0–10 / null only',async()=>{
 const e=environment(),m=await mount(e);goToMap(e.host);
 fillMap(e.host);assert.match(e.host.innerHTML,/data-ds2-page="5"/);
 await wait();const p=m.program;
 assert.deepEqual(JSON.parse(JSON.stringify(p.influence)),{stress:8,tired:3,partner:null,visual:0,touch:10,novelty:null,mood:5});
 assert.equal(Object.keys(p.influence).length,7);assert.equal(p.sessions.length,1,'Not complete before final CTA');
});
test('context offers three editable real details and max two suggestions; no fabricated positive experience',async()=>{
 const e=environment(),m=await mount(e);goToMap(e.host);fillMap(e.host);
 e.host.click('field','where');assert.match(e.host.innerHTML,/role="dialog"/);e.host.saveField('En un lugar tranquilo');
 e.host.click('field','feeling');e.host.saveField('Con curiosidad');
 e.host.click('field','happening');e.host.saveField('Conversábamos');
 e.host.click('detail','privacy');e.host.click('detail','connection');e.host.click('detail','rest');assert.match(e.host.innerHTML,/máximo de dos/);
 e.host.click('dismiss');e.host.click('next');assert.match(e.host.innerHTML,/data-ds2-page="6"/);
 await wait();const note=JSON.parse(m.program.detailNotes.desireDay2TouchV2);
 assert.equal(note.context.where,'En un lugar tranquilo');assert.equal(note.details.length,2);
});
test('context without a recalled moment permits explicit deferral, never invents details',async()=>{
 const e=environment(),m=await mount(e);goToMap(e.host);fillMap(e.host);
 e.host.click('next');assert.match(e.host.innerHTML,/Aún no identifico un detalle/);
 e.host.click('defer-context');assert.match(e.host.innerHTML,/data-ds2-page="6"/);
 await wait();assert.equal(JSON.parse(m.program.detailNotes.desireDay2TouchV2).contextDeferred,true);
});
test('final action is required; 7 map factors and session pattern-observe saved idempotently',async()=>{
 const e=environment(),m=await mount(e);goToEnd(e.host);
 e.host.click('audio','guide');assert.match(e.voiced.at(-1),/Ponlo en práctica|ponlo en práctica/);
 e.host.click('field','reflection');e.host.saveField('Quiero recuperar privacidad y conversación.');
 e.host.click('save');await wait();const p=m.program;
 assert.equal(m.backs,1);assert.equal(m.callbacks.length,1);assert.equal(p.detailNotes.keep,'original');
 assert.equal(p.sessions.filter(s=>s.day===2&&s.practiceId==='pattern-observe').length,1);
 assert.equal(p.sessions[1].metricKey,'desire');assert.equal(p.sessions[1].before,null);assert.equal(p.sessions[1].after,null);
 assert.equal(p.dayDone['6'],'old');assert.ok(p.dayDone['2']);
 assert.match(p.sessions[1].reflection,/Estrés: 8/);assert.match(p.sessions[1].reflection,/Privacidad/);
 assert.equal(p.influence.partner,null);assert.equal(p.influence.touch,10);
});
test('upgrades existing completed two-screen Day 2 without duplicating the session or deleting prior data',async()=>{
 const e=environment();let old=readP(baseline());old.sessions.push({id:'legacy-d2',day:2,practiceId:'pattern-observe',status:'completed',before:4,after:5,reflection:'Original'});old.detailNotes.desireDay2TouchV1=JSON.stringify({factor:'closeness',plan:'partner',completed:true});
 const m=await mount(e,{'spm-desire-program':JSON.stringify(old)});
 assert.match(e.host.innerHTML,/data-ds2-page="1"/);
 e.host.click('next');e.host.click('next');fillMap(e.host);e.host.click('detail','rest');e.host.click('next');e.host.click('save');await wait();
 assert.equal(m.program.sessions.filter(s=>s.day===2&&s.practiceId==='pattern-observe').length,1);
 const row=m.program.sessions.find(s=>s.id==='legacy-d2');assert.equal(row.before,4);assert.equal(row.after,5);
 assert.equal(m.program.detailNotes.desireDay2TouchV1,old.detailNotes.desireDay2TouchV1);
});
test('exit before completion saves progress but never marks the clinical day completed',async()=>{
 const e=environment(),m=await mount(e);e.host.click('next');e.host.click('choose','no_pressure');e.host.click('exit');await wait();
 assert.equal(m.backs,1);assert.equal(m.program.sessions.filter(s=>s.day===2).length,0);
 assert.equal(JSON.parse(m.program.detailNotes.desireDay2TouchV2).factor,'no_pressure');
});
test('bridge intercepts only dailyPlan Desire Day 2, obeys clinical restriction',async()=>{
 const e=environment(),ctx={userId:'test',planId:'pilot',day:2,primary:'desire'};let oldCount=0,store=baseline();
 e.window.SPM_RESOURCE_CONTEXT=()=>ctx;
 e.window.SPM_DAILY_PRACTICE={assignments:()=>[{id:'main',kind:'desire'}],restricted:()=>false,active:()=>({id:'main',scope:'test:pilot',day:ctx.day}),saveActivity:async()=>{},open(){}};
 e.window.SPM_DESIRE_RECORDS={read:async()=>clone(store),save:async x=>{store=clone(x)}};
 e.window.SPM_DESIRE_LAB={open:async()=>{oldCount++;return 'legacy';},close:async()=>true};
 vm.runInNewContext(bridge,e.sandbox);
 assert.equal(await e.window.SPM_DESIRE_LAB.open({origin:'library'}),'legacy');ctx.day=3;
 assert.equal(await e.window.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),'legacy');ctx.day=2;
 assert.equal(await e.window.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),true);
 assert.match(e.host.innerHTML,/data-ds2-page="1"/);
 assert.equal(oldCount,2);
 e.window.SPM_DAILY_PRACTICE.restricted=()=>true;
 assert.equal(await e.window.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),false);
});
