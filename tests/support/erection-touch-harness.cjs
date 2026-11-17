// Approved touch controllers and actual adapters; explicit calendar expectations.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('../../labs/desire/node_modules/jsdom');
const days=[1,3,6,9],clone=value=>JSON.parse(JSON.stringify(value));
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
function saved(lesson,extra={}){
 const fields={1:{ehs:null,ehsEvaluable:false,attentionPracticeOutcome:'omitted',attentionPracticeCompleted:false},
  2:{contexts:{spontaneous:'not_evaluable',solo:'not_evaluable',partner:'not_evaluable'},responseAspect:'not_evaluable'},
  3:{tensionAreas:['none'],sensoryAnchor:'hands',finalFeeling:'',seconds:null},
  4:{attentionSense:'contact',practiceExperience:'no_checking',finalFeeling:'',seconds:null}};
 return{erectionPracticeVersion:1,erectionLesson:lesson,day:days[lesson-1],confirmed:true,anxiety:null,confidence:null,...fields[lesson],...extra};
}
function harness(lesson=1,prior){
 const errors=[],console=new VirtualConsole();console.on('jsdomError',error=>errors.push(error.message));
 const dom=new JSDOM('<main id="plan"><section id="spmDailySession"><div id="spmDailyWorkspace"></div></section></main>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:console});
 const w=dom.window,day=days[lesson-1],c={userId:'qa',planId:'plan',primary:'erection',day,safety:'none',flags:[],checkins:[],completed:[]};
 const activity={id:'main',kind:'erection',erectionLesson:lesson};
 let assignments=[activity],active={id:'main',scope:'qa:plan',day},opens=0,nativeCalls=0,cancels=0,breathingCalls=0,completionCalls=0,directWrites=0,now=0,intervalId=0;
 const db=prior?{[day]:{main:clone(prior)}}:{},reads=[],writes=[],attempts=[],played=[],media=new WeakMap(),intervals=new Map();
 const state=element=>{if(!media.has(element))media.set(element,{paused:true,time:0});return media.get(element);};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 Object.defineProperty(w.performance,'now',{value:()=>now});
 w.setInterval=callback=>{intervals.set(++intervalId,callback);return intervalId;};w.clearInterval=id=>intervals.delete(id);
 Object.defineProperty(w.HTMLMediaElement.prototype,'paused',{configurable:true,get(){return state(this).paused;}});
 Object.defineProperty(w.HTMLMediaElement.prototype,'currentTime',{configurable:true,get(){return state(this).time;},set(value){state(this).time=value;}});
 w.HTMLMediaElement.prototype.play=function(){state(this).paused=false;played.push(this);return Promise.resolve();};
 w.HTMLMediaElement.prototype.pause=function(){state(this).paused=true;};w.HTMLMediaElement.prototype.load=function(){};
 w.speechSynthesis={speak(){nativeCalls++;},cancel(){cancels++;},getVoices(){return[];},addEventListener(){}};w.SpeechSynthesisUtterance=function(text){this.text=text;};
 w.SPM_RESOURCE_CONTEXT=()=>c;w.SPM_PRACTICE_AUDIO={stop(){}};w.SPM_PROGRAM_VIDEOS={pause(){}};
 w.SPM_BREATHING_LAB={open(){breathingCalls++;}};w.SPM_COMPLETE_DAILY_PRACTICE=async()=>{completionCalls++;};
 w.SPM_DAILY_RECORDS={read:async(scope,number)=>{reads.push({scope,day:number});return clone(db[number]||{});},save:async()=>{directWrites++;}};
 w.SPM_DAILY_PRACTICE={assignments:()=>assignments,active:()=>active,restricted:()=>c.safety!=='none'||c.flags.length>0||c.checkins.some(row=>row.new_safety_flag),
  open(){opens++;w.SPM_ERECTION_PRACTICE.stop();active=null;w.document.getElementById('spmDailyWorkspace')?.replaceChildren();},
  async saveActivity(id,metadata,scope,number){
   const write={id,metadata:clone(metadata),scope,day:number};attempts.push(write);
   if(h.failSave)throw Error('offline');
   assert.equal(w.SPM_ERECTION_PRACTICE.valid(metadata,number),true,'touch record satisfies the authoritative validator');
   writes.push(write);db[number]={...(db[number]||{}),[id]:clone(metadata)};return{ok:true};
  }};
 const h={w,c,lesson,day,activity,db,reads,writes,attempts,played,errors,failSave:false,
  host:()=>w.document.getElementById('spmDailyWorkspace'),panel:()=>w.document.querySelector(`[data-ed${lesson}-session]`),
  setAssignments:value=>{assignments=value;},setActive:value=>{active=value;},
  counts:()=>({opens,nativeCalls,cancels,breathingCalls,completionCalls,directWrites}),
  advance(ms){now+=ms;for(const callback of intervals.values())callback();},
  selector(action,value){return `[data-ed${lesson}-${lesson<=2?'act':'action'}="${action}"]${value===undefined?'':`[data-value="${value}"]`}`;},
  el(action,value){return h.host().querySelector(h.selector(action,value));},
  touch(action,value){const el=h.el(action,value);assert.ok(el,h.selector(action,value));assert.equal(el.disabled,false);el.click();return el;},
  async open(){active={id:'main',scope:c.userId+':'+c.planId,day:c.day};return h.api.open(activity);},
  context(key,value){const el=h.host().querySelector(`[data-ed2-context="${key}"]`);assert.ok(el);el.value=value;el.dispatchEvent(new w.Event('change',{bubbles:true}));},
  close(){w.SPM_ERECTION_PRACTICE?.stop();w.close();}
 };
 const scripts=['checkpoint-audio-v1.js','firmness-guide-v1.js','erection-practice-v1.js','erection-fullscreen-v1.js'];
 for(let n=1;n<=4;n++)scripts.push(`erection-day${n}-touch-v1.js`,`erection-day${n}-bridge-v1.js`);
 for(const file of scripts)w.eval(fs.readFileSync(path.join(__dirname,'../../premium-v2',file),'utf8'));
 h.api=w.SPM_ERECTION_PRACTICE;return h;
}
function answer(h,{ehs='na',outcome='omitted'}={}){
 if(h.lesson===1){h.touch('next');h.touch('ehs',ehs);h.touch('next');h.touch('next');h.touch('next');h.touch('outcome',outcome);}
 if(h.lesson===2){for(const key of ['spontaneous','solo','partner'])h.context(key,'not_evaluable');h.touch('next');h.touch('condition','good_rest');h.touch('next');h.touch('aspect','not_evaluable');h.touch('next');h.touch('plan','privacy');}
 if(h.lesson===3){h.touch('area','none');h.touch('next');h.touch('next');h.touch('anchor','hands');}
 if(h.lesson===4){h.touch('sense','contact');h.touch('next');h.touch('next');h.touch('result','no_checking');}
}
function assertOnlyMain(h){assert.equal(h.writes.length,1);assert.equal(h.writes[0].id,'main');assert.equal(h.writes[0].scope,'qa:plan');assert.equal(h.writes[0].day,h.day);assert.equal(h.c.day,h.day);assert.deepEqual(h.c.completed,[]);for(const key of ['breathingCalls','completionCalls','directWrites'])assert.equal(h.counts()[key],0);assert.deepEqual(h.errors,[]);}
module.exports={harness,answer,saved,assertOnlyMain,days,tick,clone,deferred};
