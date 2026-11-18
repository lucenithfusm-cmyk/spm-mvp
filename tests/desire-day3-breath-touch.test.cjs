'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
const txt=x=>fs.readFileSync(path.join(ROOT,x),'utf8');
const controller=txt('premium-v2/desire-day3-touch-v1.js'),css=txt('premium-v2/desire-day3-touch-v1.css'),bridge=txt('premium-v2/desire-day3-bridge-v1.js'),review=txt('premium-v2/desire-day3-review/index.html');
const clone=x=>JSON.parse(JSON.stringify(x));
const initial=()=>({'spm-desire-program':JSON.stringify({v:2,detailNotes:{keep:'prior'},sessions:[{id:'day2',day:2,practiceId:'pattern-observe',status:'completed'}],dayDone:{2:'existing'}})});
const prog=d=>JSON.parse(d['spm-desire-program']);
const flush=()=>new Promise(r=>setTimeout(r,18));
function env(){let now=0,interval=null;const voices=[];
 const host={isConnected:true,innerHTML:'',handlers:{},lastMessage:'',clock:'',contains:()=>true,
  addEventListener(type,callback){this.handlers[type]=callback;},
  querySelector(s){if(s==='.spm-ds3-status')return {set textContent(v){host.lastMessage=v}};
   if(s==='[data-ds3-clock]')return {set textContent(v){host.clock=v}};
   if(s==='[data-ds3-progress]')return {setAttribute(n,v){host.progress=v}};
   if(s==='[data-ds3-phase-label]')return {set textContent(v){host.phase=v}};
   if(s==='[data-ds3-active]')return {set textContent(v){host.active=v}};
   if(s==='[data-ds3-page]')return {dataset:{}};
   if(s==='.spm-ds3-session')return {scrollIntoView(){}};
   return null;},
  click(action,value){const el={dataset:{ds3Action:action,ds3Value:value},closest(q){return q==='[data-ds3-action]'?el:null}};this.handlers.click?.({target:el});},
  changeScore(key,value){const el={dataset:{ds3Score:key},value,closest(q){return q==='[data-ds3-score]'?el:null}};this.handlers.change?.({target:el});}
 };
 const speech={cancel(){},speak(u){voices.push(u.text);u.onend?.();}};
 const doc={hidden:false,addEventListener(){},querySelector(){return null},getElementById(){return host}};
 const w={speechSynthesis:speech,SpeechSynthesisUtterance:class{constructor(t){this.text=t;}},addEventListener(){}};
 const sandbox={window:w,document:doc,AbortController,Date,JSON,Promise,performance:{now:()=>now},
  setInterval(f){interval=f;return 12},clearInterval(){interval=null},setTimeout,clearTimeout,console};
 vm.runInNewContext(controller,sandbox);
 return {w,host,doc,voices,advance(seconds){now+=1000*seconds;interval?.();},time(){return now},stop(){w.SPM_DESIRE_DAY3_TOUCH.stop()}};
}
async function mount(e,starting=initial()){
 let data=clone(starting),back=0,completed=[];
 await e.w.SPM_DESIRE_DAY3_TOUCH.mount({host:e.host,storage:{read:async()=>clone(data),save:async x=>{data=clone(x)}},valid:()=>true,
  onBack:()=>{back++},onCompleted:async r=>completed.push(r)});
 return {get data(){return clone(data)},get back(){return back},get completed(){return completed}};
}
function toBreath(e){e.host.click('choose','embrace');e.host.click('next','forward');e.host.click('choose','hug');e.host.click('next','forward');assert.match(e.host.innerHTML,/data-ds3-page="3"/);}

test('three user-approved original 9:16 JPEG images and animation reference are packaged',()=>{
 for(let n=1;n<=3;n++){const b=fs.readFileSync(path.join(ROOT,'premium-v2/assets/desire-day3/screen-0'+n+'.jpg'));assert.ok(b.length>360000);assert.equal(b[0],255);assert.equal(b[1],216);}
 const gif=fs.readFileSync(path.join(ROOT,'premium-v2/assets/desire-day3/breathing-animation-reference.gif'));assert.equal(gif.toString('ascii',0,3),'GIF');
 assert.match(controller,/\/premium-v2\/assets\/desire-day3\/screen-0/);
});
test('page 1 and page 2: full-row choice, named audio, navigation and validation',async t=>{
 const e=env(),m=await mount(e);t.after(()=>e.stop());
 assert.match(e.host.innerHTML,/data-ds3-page="1"/);assert.equal((e.host.innerHTML.match(/data-ds3-action="choose"/g)||[]).length,4);
 e.host.click('next','forward');assert.match(e.host.lastMessage,/Elige el tipo de cercanía/);
 e.host.click('audio','guide');assert.match(e.voices.at(-1),/cercanía/);
 e.host.click('choose','trust');assert.match(e.voices.at(-1),/acompañado/);
 e.host.click('next','forward');assert.match(e.host.innerHTML,/data-ds3-page="2"/);
 e.host.click('next','forward');assert.match(e.host.lastMessage,/Elige qué te gustaría intentar/);
 e.host.click('choose','solo');assert.match(e.voices.at(-1),/estás solo/);
 e.host.click('back');assert.match(e.host.innerHTML,/data-ds3-page="1"/);
 e.host.click('next','forward');e.host.click('next','forward');assert.match(e.host.innerHTML,/data-ds3-page="3"/);
 await flush();assert.equal(prog(m.data).detailNotes.keep,'prior');
});
test('real 05:00 countdown, phase changes, pause, resume, and restart',async t=>{
 const e=env();await mount(e);t.after(()=>e.stop());toBreath(e);
 assert.match(e.host.innerHTML,/05:00/);
 e.host.click('timer','play');assert.match(e.host.innerHTML,/data-running="true"/);
 e.advance(100);assert.equal(e.host.clock,'03:20');assert.match(e.host.phase,/Respirar cómodo/);
 e.host.click('timer','pause');const paused=e.host.clock;e.advance(90);assert.equal(e.host.clock,paused);
 e.host.click('timer','play');e.advance(200);assert.equal(e.host.clock,'00:00');assert.match(e.host.lastMessage,/Terminaste los cinco minutos/);
 assert.ok(e.voices.some(v=>v.includes('piso pélvico')));
 e.host.click('timer','reset');assert.match(e.host.innerHTML,/05:00/);assert.match(e.host.innerHTML,/data-running="false"/);
});
test('valid completion saves active seconds, pressure measures, and existing sessions',async t=>{
 const e=env(),m=await mount(e);t.after(()=>e.stop());toBreath(e);
 e.host.click('timer','play');e.advance(300);e.host.changeScore('before','7');e.host.changeScore('after','3');
 e.host.click('finish');await flush();
 const p=prog(m.data),s=p.sessions.find(x=>x.day===3&&x.practiceId==='breath-routine');
 assert.equal(m.back,1);assert.equal(m.completed.length,1);assert.equal(s.activeSec,300);assert.equal(s.before,7);assert.equal(s.after,3);
 assert.equal(s.status,'completed');assert.equal(p.dayDone[2],'existing');assert.ok(p.dayDone[3]);
 assert.equal(p.sessions.filter(x=>x.day===3).length,1);
});
test('finishing early registers actual time instead of inventing five minutes',async t=>{
 const e=env(),m=await mount(e);t.after(()=>e.stop());toBreath(e);e.host.click('timer','play');e.advance(45);e.host.click('finish');await flush();
 const s=prog(m.data).sessions.find(x=>x.day===3);assert.equal(s.activeSec,45);assert.equal(s.before,null);assert.equal(s.after,null);assert.equal(m.back,1);
});
test('leaving incomplete pauses and stores remaining time without completing day',async t=>{
 const e=env(),m=await mount(e);t.after(()=>e.stop());toBreath(e);e.host.click('timer','play');e.advance(40);e.host.click('exit');await flush();
 const p=prog(m.data);assert.equal(m.back,1);assert.ok(!p.sessions.some(s=>s.day===3));
 const s=JSON.parse(p.detailNotes.desireDay3TouchV1);assert.equal(s.timer.remaining,260);assert.equal(s.timer.started,true);
});
test('existing completed breath-routine is not duplicated',async t=>{
 const e=env(),prior=initial(),p=prog(prior);p.sessions.push({id:'legacy-breath',day:3,practiceId:'breath-routine',status:'completed',activeSec:123});prior['spm-desire-program']=JSON.stringify(p);
 const m=await mount(e,prior);t.after(()=>e.stop());assert.match(e.host.innerHTML,/data-ds3-page="3"/);
 const rows=prog(m.data).sessions.filter(x=>x.day===3);assert.equal(rows.length,1);
});
test('timer buttons exist on original circles but have NO circular halo; large bars retain pre-touch halo',()=>{
 assert.match(css,/\.spm-ds3-hit--timer::before/);assert.match(css,/content:none!important/);
 assert.doesNotMatch(css,/\.spm-ds3-hit--choose::after/);assert.match(css,/\.spm-ds3-hit--choose/);
 assert.match(css,/@keyframes spm-ds3-pulse/);assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(controller,/data-ds3-clock/);assert.match(controller,/data-ds3-progress/);
});
test('original breath-routine, voice device and scoped bridge preserve other days',async t=>{
 assert.match(controller,/breath-routine/);assert.match(controller,/es-CO/);assert.match(bridge,/Number\(c.day\)===3/);
 assert.match(review,/datos simulados/);assert.doesNotMatch(review,/supabase\.co|wompi\.co/);
 const e=env();t.after(()=>e.stop());let fallbacks=0;const state={userId:'test',planId:'x',primary:'desire',day:3};
 e.w.SPM_RESOURCE_CONTEXT=()=>state;
 e.w.SPM_DAILY_PRACTICE={assignments:()=>[{id:'main',kind:'desire'}],restricted:()=>false,active:()=>({id:'main',day:state.day,scope:'test:x'}),saveActivity:async()=>({ok:true}),open(){}};
 e.w.SPM_DESIRE_RECORDS={read:async()=>initial(),save:async()=>{}};
 e.w.SPM_DESIRE_LAB={open:async()=>{fallbacks++;return 'old'},close:async()=>true};
 vm.runInNewContext(bridge,{...e.w,window:e.w,document:e.doc,console,AbortController,Date,JSON,Promise,setTimeout,clearTimeout});
 assert.equal(await e.w.SPM_DESIRE_LAB.open({origin:'library'}),'old');
 state.day=4;assert.equal(await e.w.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),'old');
 state.day=3;assert.equal(await e.w.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),true);assert.equal(fallbacks,2);
 e.w.SPM_DAILY_PRACTICE.restricted=()=>true;assert.equal(await e.w.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),false);
});
