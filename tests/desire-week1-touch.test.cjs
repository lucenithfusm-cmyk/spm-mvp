const {test}=require('node:test'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict');
const bridge=fs.readFileSync(path.join(__dirname,'../premium-v2/desire-week1-bridge-v1.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../premium-v2/desire-week1-v1/index.html'),'utf8');
test('SPM Deseo 4–7: assets, estados, cierre real y aislamiento',async()=>{
 for(const name of ['d4-1','d4-2','d4-3','d5-1','d5-2','d5-3','d6-front','d6-back','d6-anatomia-original']){
  assert(html.includes(name+'.webp'),name+' no enlazado');
  assert(fs.existsSync(path.join(__dirname,'../premium-v2/desire-week1-v1/assets/'+name+'.webp')));
 }
 assert(html.includes('SPM_WEEK1_READY'));
 let day=6,primary='desire',scope='u1:p1',saveCount=0,completeCount=0,legacy=0;
 let data={'spm-desire-program':JSON.stringify({sessions:[],dayDone:{},map:{accel:['Previo'],brake:['Anterior'],suggestions:'Nota anterior'},detailNotes:{}})};
 const ctx=()=>({userId:'u1',planId:'p1',day,primary});
 const activity=()=>({id:'main',scope,day});
 const active=[];
 const host={isConnected:true,replaceChildren(x){this.children=[x]}};
 const createElement=tag=>{
  const el={tag,isConnected:true,setAttribute(){},append(){},remove(){this.isConnected=false}};
  if(tag==='iframe'){el.contentWindow={postMessage(v){active.push(v)}};latest=el;}
  return el;
 };
 let latest;const listeners={};
 const window={location:{origin:'https://spm-premium-staging.vercel.app'},
  crypto:{randomUUID:()=> 'spm-test-session-001'},
  SPM_RESOURCE_CONTEXT:ctx,
  SPM_DAILY_PRACTICE:{assignments:()=>[{id:'main',kind:'desire'}],restricted:()=>false,active:activity,saveActivity:async()=>{completeCount++;return true},open(){return true},showContinuation(){}},
  SPM_DESIRE_RECORDS:{read:async()=>structuredClone(data),save:async(v)=>{data=structuredClone(v);saveCount++}},
  SPM_DESIRE_LAB:{open:async()=>{legacy++;return true},close:async()=>true},
  addEventListener:(name,fn)=>{listeners[name]=fn},
  removeEventListener:(name,fn)=>{if(listeners[name]===fn)delete listeners[name]}
 };
 const document={getElementById:id=>id==='spmDailyWorkspace'?host:null,querySelector:()=>null,createElement};
 vm.runInNewContext(bridge,{window,document,Math,Number,Date,Set,Promise,JSON,clearTimeout,setTimeout,encodeURIComponent,console},{timeout:1000});
 const sleep=()=>new Promise(r=>setTimeout(r,20));
 const msg=(type,record,origin)=>listeners.message({origin:origin||window.location.origin,source:latest.contentWindow,data:{type,sid:'spm-test-session-001',record}});
 assert.equal(await window.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),true);
 assert(latest.src.includes('day=6'));
 msg('SPM_WEEK1_READY');await sleep();assert(active.some(x=>x.type==='SPM_WEEK1_INIT'&&x.day===6));
 msg('SPM_WEEK1_COMPLETE',{before:4,after:8,region:2,view:'back',comfortZone:2,reflection:'Más cómodo',metricTouched:{before:true,after:true},timer:{elapsed:141,started:true},completed:true});await sleep();
 let p=JSON.parse(data['spm-desire-program']);
 assert.equal(completeCount,1);
 assert.equal(p.sessions.filter(x=>x.day===6&&x.practiceId==='body-awareness').length,1);
 assert.equal(p.sessions[0].activeSec,141);assert(p.dayDone[6]);assert(p.detailNotes.desireWeek1TouchDay6.includes('Más cómodo'));
 assert.deepEqual(p.map.accel,['Previo']);assert.deepEqual(p.map.brake,['Anterior']);
 day=3;assert.equal(await window.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),true);assert.equal(legacy,1);
 day=5;assert.equal(await window.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),true);
 msg('SPM_WEEK1_READY');await sleep();msg('SPM_WEEK1_COMPLETE',{accel:['Privacidad','Conexión'],brakes:['Estrés'],note:'Menos interrupciones',completed:true});await sleep();
 p=JSON.parse(data['spm-desire-program']);assert(p.map.accel.includes('Previo'));assert(p.map.accel.includes('Privacidad'));assert(p.map.brake.includes('Estrés'));assert.equal(p.sessions.find(s=>s.day===5).practiceId,'map-select');
 day=7;assert.equal(await window.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),true);
 msg('SPM_WEEK1_READY');await sleep();msg('SPM_WEEK1_COMPLETE',{good:'Más calma',adjust:'Menos estrés',liked:['touch','massage'],ranking:['massage','touch'],next:'Repetir',completed:true});await sleep();
 p=JSON.parse(data['spm-desire-program']);assert.deepEqual(p.ranking,['massage','touch']);assert.equal(p.sessions.filter(s=>s.day===7&&s.practiceId==='week-review').length,1);
 primary='erection';assert.equal(await window.SPM_DESIRE_LAB.open({origin:'dailyPlan'}),true);assert.equal(legacy,2);
 assert(saveCount>=3);assert.equal(completeCount,3);
});