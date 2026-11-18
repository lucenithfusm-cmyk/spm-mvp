'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const text=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const controller=text('premium-v2/desire-day2-touch-v1.js');
const bridge=text('premium-v2/desire-day2-bridge-v1.js');
const css=text('premium-v2/desire-day2-touch-v1.css');
const review=text('premium-v2/desire-day2-review/index.html');
const clone=x=>JSON.parse(JSON.stringify(x));
function env(){
 const voices=[],host={isConnected:true,innerHTML:'',handlers:{},contains:()=>true,
  addEventListener(k,handler){this.handlers[k]=handler;},
  querySelector(q){if(q==='.spm-ds2-status')return {set textContent(s){host.lastMessage=s;}};if(q==='.spm-ds2-session'&&host.innerHTML.includes('spm-ds2-session'))return {scrollIntoView(){}};if(q==='[data-ds2-page]'&&host.innerHTML.includes('data-ds2-page'))return {};return null;},
  click(action,value){const el={dataset:{ds2Action:action,ds2Value:value},closest(sel){return sel==='[data-ds2-action]'?el:null}};this.handlers.click?.({target:el});}
 };
 const speech={cancel(){},speak(u){voices.push(u.text);u.onend?.();}};
 const doc={hidden:false,addEventListener(){},getElementById:id=>id==='spmDailyWorkspace'?host:null,querySelector:()=>null};
 const w={speechSynthesis:speech,SpeechSynthesisUtterance:class{constructor(t){this.text=t;}},addEventListener(){}};
 const sandbox={window:w,document:doc,AbortController,Date,JSON,performance:{now:()=>42},setTimeout,clearTimeout,console,Promise};
 vm.runInNewContext(controller,sandbox,{filename:'desire-day2-touch-v1.js'});
 return {w,host,doc,sandbox,voices};
}
function records(){return {'spm-desire-program':JSON.stringify({v:2,detailNotes:{keep:'preserve'},sessions:[{id:'other-day',day:6,practiceId:'other',status:'completed'}],dayDone:{6:'saved'}})}};
async function mount(e,initial=records()){
 let data=clone(initial),back=0,completed=[];
 await e.w.SPM_DESIRE_DAY2_TOUCH.mount({host:e.host,
   storage:{read:async()=>clone(data),save:async(v)=>{data=clone(v)}},
   onBack:()=>back++,onCompleted:async r=>completed.push(r)
 });
 return {get data(){return clone(data)},get back(){return back},get completed(){return completed}};
}
const program=x=>JSON.parse(x['spm-desire-program']);
const flush=()=>new Promise(r=>setTimeout(r,20));

test('two original 9:16 image blobs present, unmodified paths',()=>{
 const names=['screen-01.jpg','screen-02.jpg'];
 for(const name of names){
  const b=fs.readFileSync(path.join(ROOT,'premium-v2/assets/desire-day2',name));
  assert.ok(b.length>300000);assert.equal(b[0],255);assert.equal(b[1],216);
 }
 assert.match(controller,/\/premium-v2\/assets\/desire-day2\/screen-0/);
});
test('halos exist before interaction on audio, all selections and save',()=>{
 assert.match(css,/\.spm-ds2-hit::before/);
 assert.match(css,/@keyframes spm-ds2-invite/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(css,/\.spm-ds2-hit--choose::after|spm-ds2-radio/); // los círculos originales NO llevan aureolas adicionales
 assert.match(css,/\.spm-ds2-hit--choose::before/); // la barra completa sí conserva halo previo
 assert.match(css,/\.spm-ds2-hit--save::before/);
});
test('first screen: selection persists, audio is Spanish, validation precedes continuing',async()=>{
 const e=env(),m=await mount(e);
 assert.match(e.host.innerHTML,/data-ds2-page="1"/);
 assert.equal((e.host.innerHTML.match(/data-ds2-action="choose"/g)||[]).length,6);
 e.host.click('next','next');assert.match(e.host.lastMessage,/Selecciona qué suele favorecer/);
 e.host.click('audio','guide');assert.match(e.voices.at(-1),/identificar lo que suele favorecer tu deseo/);
 e.host.click('choose','fantasy');assert.match(e.voices.at(-1),/Fantasías o pensamientos eróticos/);
 assert.match(e.host.innerHTML,/aria-pressed="true"/);
 e.host.click('next','next');assert.match(e.host.innerHTML,/data-ds2-page="2"/);
 assert.equal((e.host.innerHTML.match(/data-ds2-action="choose"/g)||[]).length,4);
 await flush();
 assert.equal(program(m.data).detailNotes.keep,'preserve');
});
test('second screen: saves one original pattern-observe session and no fictitious 0–10 values',async()=>{
 const e=env(),m=await mount(e);
 e.host.click('choose','closeness');e.host.click('next','next');
 e.host.click('save','save');assert.match(e.host.lastMessage,/Selecciona qué quieres intentar/);
 e.host.click('choose','partner');e.host.click('save','save');
 await flush();
 const p=program(m.data);
 assert.equal(m.back,1);assert.equal(m.completed.length,1);
 assert.equal(m.completed[0].day,2);
 assert.equal(p.detailNotes.keep,'preserve');
 assert.equal(JSON.parse(p.detailNotes.desireDay2TouchV1).factor,'closeness');
 assert.equal(JSON.parse(p.detailNotes.desireDay2TouchV1).plan,'partner');
 assert.equal(p.sessions.filter(s=>s.day===2&&s.practiceId==='pattern-observe').length,1);
 const s=p.sessions.find(s=>s.day===2);
 assert.equal(s.status,'completed');assert.equal(s.metricKey,'desire');assert.equal(s.before,null);assert.equal(s.after,null);
 assert.ok(p.sessions.find(s=>s.id==='other-day'));
 assert.equal(p.dayDone[6],'saved');assert.ok(p.dayDone[2]);
});
test('reopen and resave is idempotent; existing legacy completed pattern-observe is preserved',async()=>{
 const e=env(),initial=records();
 let saved=clone(initial);
 const storage={read:async()=>clone(saved),save:async o=>{saved=clone(o)}};
 async function start(){return e.w.SPM_DESIRE_DAY2_TOUCH.mount({host:e.host,storage,onBack:()=>{},onCompleted:async()=>{}})}
 await start();e.host.click('choose','privacy');e.host.click('next','next');e.host.click('choose','myself');e.host.click('save','save');await flush();
 await start();e.host.click('save','save');await flush();
 let list=program(saved).sessions.filter(s=>s.day===2&&s.practiceId==='pattern-observe');assert.equal(list.length,1);
 const old=program(saved);old.sessions.push({id:'legacy-completed',day:2,practiceId:'pattern-observe',status:'completed',before:6,after:7,reflection:'Original'});saved={'spm-desire-program':JSON.stringify(old)};
 await start();e.host.click('save','save');await flush();
 const current=program(saved);assert.equal(current.sessions.find(s=>s.id==='legacy-completed').reflection,'Original');
 assert.equal(current.sessions.length,3); // original touch + separately pre-existing legacy remains unchanged
});
test('back and exit keep options without marking session completed',async()=>{
 const e=env(),m=await mount(e);
 e.host.click('choose','unclear');e.host.click('next','next');e.host.click('choose','observe');
 e.host.click('back');assert.match(e.host.innerHTML,/data-ds2-page="1"/);
 e.host.click('exit');await flush();assert.equal(m.back,1);
 assert.ok(!program(m.data).sessions.some(s=>s.day===2));
 assert.equal(JSON.parse(program(m.data).detailNotes.desireDay2TouchV1).plan,'observe');
});
test('bridge intercepts only Desire day 2 dailyPlan and obeys safety',async()=>{
 const e=env(),state={userId:'review',planId:'trial',primary:'desire',day:2};
 let fallbacks=0,centralSave=0;
 e.w.SPM_RESOURCE_CONTEXT=()=>state;
 e.w.SPM_DAILY_PRACTICE={assignments:()=>[{id:'main',kind:'desire'}],restricted:()=>false,active:()=>({id:'main',day:state.day,scope:'review:trial'}),saveActivity:async()=>{centralSave++},open(){}};
 let data=records();
 e.w.SPM_DESIRE_RECORDS={read:async()=>clone(data),save:async x=>{data=clone(x)}};
 e.w.SPM_DESIRE_LAB={open:async()=>{fallbacks++;return 'legacy'},close:async()=>true};
 vm.runInNewContext(bridge,e.sandbox);
 assert.equal(await e.w.SPM_DESIRE_LAB.open({origin:'library'}),'legacy');
 state.day=3;assert.equal(await e.w.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),'legacy');
 state.day=2;assert.equal(await e.w.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),true);
 assert.equal(fallbacks,2);assert.match(e.host.innerHTML,/data-ds2-page="1"/);
 e.host.click('choose','no_pressure');e.host.click('next','next');e.host.click('choose','observe');e.host.click('save','save');await flush();
 assert.equal(centralSave,1);
 state.day=2;e.w.SPM_DAILY_PRACTICE.restricted=()=>true;
 assert.equal(await e.w.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),false);
});
test('no infantilizing examples, preserves names of image options and mock review isolated',()=>{
 assert.doesNotMatch(controller,/tela suave|taza tibia|se parece a mí hoy/i);
 for(const s of ['Sentirme tranquilo y sin presión','Contacto afectivo y cercanía','Fantasías o pensamientos eróticos','Caricias o estimulación','Tiempo a solas o conmigo','Todavía no lo tengo claro','Dedicar unos minutos a conectar conmigo','Buscar un momento sin prisa con mi pareja','Explorar un estímulo que me resulte agradable','Solo observar sin exigirme respuesta'])assert.ok(controller.includes(s),s);
 assert.match(review,/no modifica pagos ni actividades de pacientes/i);
 assert.match(review,/sessionStorage/);
});
