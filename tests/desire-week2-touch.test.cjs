const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
const bridgeSrc=fs.readFileSync(path.join(root,'desire-week2-bridge-v1.js'),'utf8');
function appTest(){
 const handlers={},writes=new Map(),app={innerHTML:'',addEventListener:(type,fn)=>handlers[type]=fn,querySelector:()=>null};
 const toast={textContent:'',classList:{add(){},remove(){}}};
 const document={querySelector:selector=>selector==='#app'?app:selector==='#toast'?toast:null};
 const localStorage={getItem:key=>writes.get(key)||null,setItem:(key,value)=>writes.set(key,value)};
 const window={parent:null,location:{search:'',origin:'https://review.test'},addEventListener(){},speechSynthesis:{cancel(){},speak(){},getVoices(){return []}},scrollTo(){}};
 window.parent=window;
 const sandbox={window,document,location:window.location,localStorage,URLSearchParams,Date,Math,Number,JSON,String,Object,Set,Array,SpeechSynthesisUtterance:function(t){this.text=t},setTimeout:()=>3,clearTimeout(){},setInterval(){},requestAnimationFrame(){}};
 vm.runInNewContext(source,sandbox,{filename:'app.js'});
 function act(name,more={}){assert(handlers.click,'click handler');const dataset={act:name,...more};handlers.click({target:{dataset,closest(){return {dataset}}}})}
 function input(field,value){handlers.input({target:{dataset:{field},value}})}
 return {app,window,act,input,writes};
}
test('review renders original image screens with a day-specific clinical activity (8–14)',()=>{
 const h=appTest();assert.match(h.app.innerHTML,/Semana 2/);
 for(let day=8;day<=14;day++){
  h.act('go',{day:String(day)});
  assert.match(h.app.innerHTML,new RegExp('Día '+day));
  const preview=h.window.SPM_DESIRE_WEEK2_TEST.state[day];assert.equal(preview.page,1);
  if(day<14){assert.match(h.app.innerHTML,new RegExp('assets/d'+day+'.webp'));h.act('next');}
  else assert.match(h.app.innerHTML,/Revisión de la semana 2/);
  assert.match(h.app.innerHTML,day===8?/Explora una experiencia agradable/:day===9?/Tu canal personal/:day===10?/Una idea diferente/:day===11?/Hoy puedo elegir sin presión/:day===12?/Planifica tu ventana/:day===13?/Tres señales de interés/:/Revisión de la semana 2/);
  h.act('home');
 }
});
test('days 8–13 are functional, selectable and record independently without coercive scoring',()=>{
 const h=appTest();const selections={8:['stimulus','music'],9:['channel','tactile'],10:['idea','ver'],11:['pleasant','rest'],12:null,13:null};
 for(let d=8;d<=13;d++){
  h.act('go',{day:String(d)});
  h.act('next');
  if(selections[d])h.act('select',{field:selections[d][0],value:selections[d][1]});
  if(d===12)h.input('moment','Mañana con privacidad');
  if(d===13)h.input('memory1','Recuerdo una conversación');
  h.act('next');
  h.act('number',{field:d===11?'metricAfter':d===10?'utility':'confidence',value:'NA'});
  h.act('next');
  assert.equal(h.window.SPM_DESIRE_WEEK2_TEST.state[d].completed,true);
  assert.match(h.app.innerHTML,/Semana 2/);
 }
 const records=h.window.SPM_DESIRE_WEEK2_TEST.state;
 assert.equal(records[9].channel,'tactile');assert.equal(records[11].pleasant,'rest');assert.equal(records[12].moment,'Mañana con privacidad');
});
test('day 14 never pretends the official checkpoint is recorded',()=>{
 const h=appTest();h.act('go',{day:'14'});
 assert.doesNotMatch(h.app.innerHTML,/100%/);
 h.input('good','Hablar sin presión');h.act('next');
 assert.match(h.app.innerHTML,/evaluación oficial del día 14/);
 h.act('checkpoint');assert.match(h.app.innerHTML,/evaluación oficial/);
 h.act('next');assert.match(h.app.innerHTML,/Vista ilustrativa del cierre/);
 assert.equal(h.window.SPM_DESIRE_WEEK2_TEST.state[14].checkpoint,false);
});
function bridgeTest(day=9){
 let currentDay=day,primary='desire',saveCount=0,completed=0;
 let records={'spm-desire-program':JSON.stringify({sessions:[],dayDone:{},detailNotes:{},ranking:['massage'],details:{tactile:['Caricias lentas']}}),'spm-desire-state':JSON.stringify({stimuli:['tactile']})};
 const messages=[],handlers={},host={isConnected:true,replaceChildren(e){this.child=e},querySelector(){return null}};
 const win={location:{origin:'https://spm.test'},crypto:{randomUUID:()=> 'week2-test-session-1234'},SPM_RESOURCE_CONTEXT:()=>({userId:'user-qa',planId:'plan-qa',day:currentDay,primary}),
  SPM_DESIRE_RECORDS:{read:async()=>structuredClone(records),save:async v=>{records=structuredClone(v);saveCount++}},
  SPM_DESIRE_LAB:{open:async()=>{messages.push({type:'legacy'});return true},close:async()=>true,validState:()=>true},
  SPM_DAILY_RECORDS:{read:async()=>({})},
  SPM_DAILY_PRACTICE:{assignments:()=>[{id:'main',kind:'desire'},{id:'checkpoint14',kind:'program-checkpoint'}],restricted:()=>false,active:()=>({id:'main',scope:'user-qa:plan-qa',day:currentDay}),saveActivity:async()=>{completed++;return true},open:()=>{},showContinuation(){},launch:()=>{}},
  addEventListener:(e,f)=>handlers[e]=f,removeEventListener:(e,f)=>{if(handlers[e]===f)delete handlers[e]}
 };
 let frame;
 const document={querySelector:()=>null,getElementById:id=>id==='spmDailyWorkspace'?host:null,createElement:tag=>{
  const e={tag,isConnected:true,children:[],setAttribute(){},remove(){this.isConnected=false},append(v){this.children.push(v)}};
  if(tag==='iframe'){e.contentWindow={postMessage(data){messages.push(data)}};frame=e};return e;
 }};
 const sandbox={window:win,document,location:win.location,Math,Number,Date,Set,Object,Array,String,Promise,JSON,clearTimeout,setTimeout,encodeURIComponent};
 vm.runInNewContext(bridgeSrc,sandbox,{filename:'week2-bridge.js'});
 const msg=(type,record)=>handlers.message({origin:win.location.origin,source:frame.contentWindow,data:{type,sid:'week2-test-session-1234',day:currentDay,record}});
 return {win,host,messages,record:()=>JSON.parse(records['spm-desire-program']),get completed(){return completed},get saves(){return saveCount},setDay:d=>{currentDay=d},setPrimary:p=>{primary=p},msg};
}
const tick=()=>new Promise(r=>setTimeout(r,30));
test('central week 2 bridge respects route, day-9 channel and saves real practiceId',async()=>{
 const h=bridgeTest();assert.equal(await h.win.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),true);assert(h.host.child.children[0].src.includes('day=9'));
 h.msg('SPM_WEEK2_READY');await tick();assert(h.messages.some(x=>x.type==='SPM_WEEK2_INIT'));
 h.msg('SPM_WEEK2_COMPLETE',{channel:'tactile',next:'Manos',metricBefore:4,metricAfter:5,timer:{elapsed:90}});await tick();
 const p=h.record();assert.equal(h.completed,1);assert.equal(p.sessions[0].practiceId,'sensory-focus');assert.equal(p.dayDone[9].length,10);assert.equal(p.sessions[0].activeSec,90);
});
test('bridge safely delegates days 1–7 and protects checkpoint data',async()=>{
 const h=bridgeTest(8);h.setDay(3);assert.equal(await h.win.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),true);assert(h.messages.some(x=>x.type==='legacy'));
 const k=bridgeTest(14);assert.equal(await k.win.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),true);k.msg('SPM_WEEK2_READY');await tick();
 k.msg('SPM_WEEK2_COMPLETE',{good:'Menos exigencia',checkpoint:true,next:'Tiempo',timer:{elapsed:0}});await tick();
 assert.equal(k.completed,1);const p=k.record();assert.equal(p.sessions[0].practiceId,'week-review');assert.equal(JSON.parse(p.detailNotes.desireWeek2TouchDay14).checkpoint,false);assert(!('checkpoint14'in p.dayDone));
});
