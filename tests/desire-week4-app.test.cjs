// Executes the real week-4 application against a minimal DOM, with no patient data.
// Layout and audible device speech remain browser/device checks.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const dir=path.resolve(__dirname,'../premium-v2/desire-week4-v1');
const code=fs.readFileSync(path.join(dir,'app.js'),'utf8');
const coreCode=fs.readFileSync(path.join(dir,'core.js'),'utf8');
const core=require(path.join(dir,'core.js'));
const screens=require(path.join(dir,'screens.json'));
const catalog=require(path.join(dir,'catalog.json'));
const clone=v=>JSON.parse(JSON.stringify(v));
const STORE='spm-desire-week4-tactile-preview-v1';
const settle=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve()};
function harness(options={}){
 const callbacks={},messages=[],timeouts=new Map(),spoken=[];
 const central=!!options.central,assigned=options.day||23,sid='week4-test-session-1234';
 const storage=new Map(options.saved?[[STORE,JSON.stringify(options.saved)]]:[]);let n=0,storageAccesses=0;
 function node(){let classes=new Set();return{innerHTML:'',textContent:'',hidden:false,dataset:{},focus(){},querySelector(){return null},querySelectorAll(){return[]},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},addEventListener(){}};}
 const app=node(),overlay=node(),toast=node();
 app.addEventListener=(event,fn)=>callbacks['app_'+event]=fn;overlay.addEventListener=(event,fn)=>callbacks['overlay_'+event]=fn;
 const location={origin:'https://spm.test',pathname:'/premium-v2/desire-week4-v1/index.html',search:central?`?spm=central&day=${assigned}&sid=${sid}`:options.query||'',reload(){}};
 const document={hidden:false,activeElement:null,querySelector:q=>q==='#app'?app:q==='#resourceOverlay'?overlay:q==='#toast'?toast:null,querySelectorAll:()=>[],addEventListener:(e,f)=>callbacks['document_'+e]=f,createTextNode:s=>({textContent:s})};
 const parent={postMessage:(data,origin)=>messages.push({...clone(data),targetOrigin:origin})};
 const window={location,document,scrollTo(){},SPM_WEEK4_SCREENS:clone(screens),SPM_WEEK4_CATALOG:clone(catalog),addEventListener:(e,f)=>callbacks['window_'+e]=f};
 window.parent=central&&!options.invalidParent?parent:window;
 const speechSynthesis={getVoices:()=>[],cancel(){},speak:u=>spoken.push(u.text)};window.speechSynthesis=speechSynthesis;
 const sandbox={window,document,location,history:{replaceState(){}},Date,Math,Promise,URLSearchParams,Object,Array,Set,Map,Number,String,JSON,Intl,
  SpeechSynthesisUtterance:class{constructor(text){this.text=text}},speechSynthesis,
  setTimeout:(fn,delay)=>{const id=++n;timeouts.set(id,{fn,delay});return id},clearTimeout:id=>timeouts.delete(id),setInterval:()=>++n,clearInterval(){},addEventListener:(e,f)=>callbacks['window_'+e]=f};
 Object.defineProperty(sandbox,'localStorage',{get(){storageAccesses++;if(options.noStorage)throw Error('storage off');return{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}}});
 vm.runInNewContext(coreCode,sandbox);vm.runInNewContext(code,sandbox);
 const escapeRx=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 function markup(id,kind='control',where=app){const m=where.innerHTML.match(new RegExp('<[^>]*data-'+kind+'="'+escapeRx(id)+'"[^>]*>'));assert(m,'Visible '+kind+' '+id);return m[0]}
 function click(id,kind='control',where=app){const tag=markup(id,kind,where);assert(!/\sdisabled(?:[\s=>])/.test(tag),'Enabled '+id);const key=kind.replace(/-([a-z])/g,(_,x)=>x.toUpperCase());const el={dataset:{[key]:String(id)},classList:{contains:x=>x==='day-card'}};const val=tag.match(/data-value="([^"]*)"/);if(val)el.dataset.value=val[1];
  const target={matches:()=>false,closest:q=>(q===`[data-${kind}]`||q===`button[data-${kind}]`||q===`[data-${kind}="${id}"]`)?el:null};callbacks[(where===overlay?'overlay':'app')+'_click']({target});}
 function input(id,value,kind='text',where=app){markup(id,kind==='runner-metric'?'runner-metric':kind==='runner-check'?'runner-check':kind==='resource-field'?'resource-field':'control',where);const dataset=kind==='runner-metric'?{runnerMetric:id}:kind==='runner-check'?{runnerCheck:id}:kind==='resource-field'?{resourceField:id}:{control:id};const el={dataset,value:String(value),checked:value===true,matches:q=>kind==='range'?q==='input[type=range][data-control]':q==='textarea[data-control]',closest:()=>null,setAttribute(){}};callbacks[(where===overlay?'overlay':'app')+'_input']({target:el});}
 function message(type,data={},override={}){callbacks.window_message?.({origin:location.origin,source:parent,data:{type,sid,day:assigned,...clone(data)},...override});}
 const init=(data={})=>message('SPM_WEEK4_INIT',{record:{id:'central-'+assigned,practiceId:core.IDS[assigned]},history:[],program:{hasPartner:'no',continuity:{goals:[],keep:'',space:''}},state:{checkins:[]},safety:{acute:false,review:false,pressure:3,phase2Allowed:false},day22Candidates:[],assignedPractice:catalog.practices['responsive-window'],...data});
 return {app,overlay,toast,messages,spoken,storage,init,message,ready:settle,state:()=>clone(window.SPM_WEEK4_REVIEW.getState()),pending:()=>window.SPM_WEEK4_REVIEW.pending(),
  screen:()=>app.innerHTML.match(/data-screen="([^"]+)"/)?.[1]||null,
  click:id=>click(id),action:id=>click(id,'action'),day:d=>click(String(d),'day'),input:(id,v,kind='text')=>input(id,v,kind),
  modal:id=>click(id,'modal-action',overlay),resource:id=>click(id,'resource',overlay),resourceChoice:(id,value)=>{const escaped=escapeRx(id);const re=new RegExp('<[^>]*data-resource-choice="'+escaped+'"[^>]*data-value="'+escapeRx(value)+'"[^>]*>');const tag=overlay.innerHTML.match(re);assert(tag,'Resource choice '+id+'/'+value);callbacks.overlay_click({target:{closest:q=>q==='[data-resource-choice]'?{dataset:{resourceChoice:id,value}}:null}})},
  resourceInput:(id,v)=>input(id,v,'resource-field',overlay),runnerInput:(id,v)=>input(id,v,'runner-metric',overlay),runnerCheck:(id,v)=>input(id,v,'runner-check',overlay),
  saved:()=>JSON.parse(storage.get(STORE)),storageAccesses:()=>storageAccesses,
  timeout:delay=>{for(const [id,t]of [...timeouts])if(t.delay===delay){timeouts.delete(id);t.fn();}},
  narrative:id=>window.SPM_WEEK4_REVIEW.narration(id)};
}

test('31 screens retain all original variants, usable controls and their web assets',()=>{
 assert.equal(screens.length,31);assert.equal(screens.filter(s=>!s.alternate).length,28);
 for(const s of screens){assert(fs.existsSync(path.join(dir,s.file)),s.id+' asset');assert(s.controls.some(c=>c.id==='audio-guide'));assert(s.controls.some(c=>c.id==='primary'));for(const c of s.controls){for(const k of ['x','y','width','height'])assert(Number.isFinite(c.normalized[k]),s.id+' '+c.id);assert(c.normalized.x>=0&&c.normalized.y>=0);}}
});
test('all seven days open without storage and no data is manufactured in alternative routes',async()=>{
 const h=harness({noStorage:true});await h.ready();assert.equal((h.app.innerHTML.match(/class="day-card"/g)||[]).length,7);
 for(const d of core.DAYS){h.day(d);assert(h.screen().startsWith('d'+d+'_'));h.action('home');}
 h.day(24);assert.equal(h.screen(),'d24_01a');assert.deepEqual(h.state().archive,[]);assert.equal(h.state().sessions[24].before,null);
 h.action('home');h.day(28);h.click('primary');assert.match(h.overlay.innerHTML,/no hay una cuenta/);h.modal('close');assert.equal(h.screen(),'d28_02a');
});
test('day 24 records six independent nullable values and never creates before/after',async()=>{
 const h=harness();await h.ready();h.day(24);h.click('primary');h.input('metric-extra.desire-scale',0,'range');h.input('metric-extra.curiosity-scale',3,'range');h.click('metric-extra.curiosity-na');h.click('primary');h.input('metric-extra.openness-scale',4,'range');h.input('metric-extra.enjoyment-scale',6,'range');h.click('primary');h.input('metric-extra.pressure-scale',2,'range');h.input('metric-extra.connection-scale',5,'range');h.click('primary');assert.equal(h.state().sessions[24].status,'draft');h.click('confirm');h.click('primary');const s=h.state().sessions[24];assert.equal(s.status,'completed');assert.deepEqual(s.extra,{desire:0,curiosity:null,openness:4,enjoyment:6,pressure:2,connection:5});assert.equal(s.before,null);assert.equal(s.after,null);assert.equal(s.localAfter,null);
});
test('plans preserve all composed text within 400 and never overwrite a manual final reflection',async()=>{
 const h=harness();await h.ready();h.day(25);h.click('primary');h.input('if_tired','a'.repeat(120));h.input('if_pressure','b'.repeat(120));h.click('primary');h.input('if_low_interest','c'.repeat(120));h.click('primary');const s=h.state().sessions[25];assert(s.fields.reflection.length<=400);assert(s.fields.reflection.includes('a'.repeat(120)));assert(s.fields.reflection.includes('c'.repeat(120)));h.input('reflection','Mi propia versión final');const saved=h.saved();const restored=harness({query:'?dia=25',saved});await restored.ready();restored.action('back');restored.action('next');assert.equal(restored.state().sessions[25].fields.reflection,'Mi propia versión final');assert.equal(restored.state().sessions[25].reflectionSource,'manual');
});
test('continuity permits one or two exact goals, preserves 300-character notes and separate personal actions',async()=>{
 const h=harness();await h.ready();h.day(26);h.click('primary');h.click('continuity_goals-goal_1');h.click('continuity_goals-goal_2');h.click('continuity_goals-goal_3');assert.deepEqual(h.state().program.continuity.goals,catalog.continuityGoals.slice(0,2));h.click('continuity_goals-goal_1');assert.deepEqual(h.state().program.continuity.goals,[catalog.continuityGoals[1]]);h.click('primary');h.input('continuity_keep','k'.repeat(300));h.input('continuity_space','s'.repeat(300));h.click('personal_plan');for(const id of ['stress','stimuli','talk','food'])h.resourceChoice('action',id);assert.deepEqual(h.state().program.actions,['stress','stimuli','talk']);h.modal('close');assert.equal(h.state().program.continuity.keep.length,300);assert.equal(h.state().program.continuity.space.length,300);assert.equal(h.state().program.continuity.goals.length,1);
});
test('day 22 executes a real assigned practice, keeps one attempt and requires explicit confirmation',async()=>{
 const h=harness();await h.ready();h.day(22);h.click('primary');assert.equal(h.screen(),'d22_02a');h.click('primary');assert.match(h.overlay.innerHTML,/Contexto favorable/);const id=h.state().sessions[22].id;h.runnerInput('before',0);h.modal('runner-next');for(let i=0;i<catalog.practices['responsive-window'].steps.length;i++)h.modal('runner-next');h.runnerInput('after',4);h.modal('runner-finish');assert.equal(h.state().sessions[22].runnerCompleted,false);h.runnerCheck('confirm',true);h.modal('runner-finish');assert.equal(h.screen(),'d22_04');h.input('reflection','Privacidad y tiempo');h.click('primary');const s=h.state().sessions[22];assert.equal(s.id,id);assert.equal(s.practiceId,'responsive-window');assert.equal(s.before,0);assert.equal(s.after,4);assert.equal(s.status,'completed');assert.equal(h.state().archive.length,0);
});
test('fantasy and frequency records preserve their own metric ranges in the day 22 runner',async()=>{
 for(const [pid,max] of [['fantasy-private',4],['reconnect-gradual',60]]){
  const h=harness({central:true,day:22,noStorage:true});await h.ready();h.init({program:{hasPartner:'yes',continuity:{goals:[],keep:'',space:''}},day22Candidates:[catalog.practices[pid]],assignedPractice:catalog.practices[pid]});h.click('primary');h.click('primary');if(pid==='fantasy-private')assert.match(h.overlay.innerHTML,/<select data-runner-metric="before">/);else{assert.match(h.overlay.innerHTML,/max="60"/);assert(!h.overlay.innerHTML.includes('data-value="solo"'));h.runnerCheck('partnerConsent',true);}
  h.runnerInput('before',max);h.modal('runner-next');for(let i=0;i<catalog.practices[pid].steps.length;i++)h.modal('runner-next');h.runnerInput('after',max);h.runnerCheck('confirm',true);h.modal('runner-finish');h.click('primary');const m=h.messages.find(x=>x.type==='SPM_WEEK4_COMPLETE');assert.equal(m.record.practiceId,pid);assert.equal(m.record.before,max);assert.equal(m.record.after,max);assert.equal(h.storageAccesses(),0);
 }
});
test('central validates origin/session, avoids preview storage, protects duplicate saves and recovers same attempt',async()=>{
 const h=harness({central:true,day:23,noStorage:true});await h.ready();assert.equal(h.messages[0].type,'SPM_WEEK4_READY');h.message('SPM_WEEK4_INIT',{}, {origin:'https://other.test'});assert.equal(h.screen(),null);h.init();h.click('primary');h.input('demand_phrase','Tengo que rendir');h.input('flexible_phrase','Puedo elegir');h.click('primary');h.click('primary');h.click('confirm');h.click('primary');const sent=h.messages.filter(x=>x.type==='SPM_WEEK4_COMPLETE');assert.equal(sent.length,1);h.click('primary');assert.equal(h.messages.filter(x=>x.type==='SPM_WEEK4_COMPLETE').length,1);h.message('SPM_WEEK4_ERROR',{message:'Error simulado'});h.click('primary');assert.equal(h.messages.filter(x=>x.type==='SPM_WEEK4_COMPLETE').length,2);assert.equal(h.messages.at(-1).record.id,sent[0].record.id);assert.equal(h.storageAccesses(),0);
});
test('day 28 report handoff saves step 2 without completing or faking checkpoint data',async()=>{
 const h=harness({central:true,day:28});await h.ready();h.init();h.click('primary');const m=h.messages.at(-1);assert.equal(m.type,'SPM_WEEK4_EXIT_TO_TODAY');assert.equal(m.reason,'report');assert.equal(m.record.step,2);assert.equal(m.record.status,'draft');assert.equal(m.record.confirm,false);assert.equal(h.messages.filter(x=>x.type==='SPM_WEEK4_COMPLETE').length,0);
});
test('audio is distributed without duplicated whole introductions on days 24 and 26',async()=>{
 const h=harness();await h.ready();assert.notEqual(h.narrative('d24_02'),h.narrative('d24_03'));assert.notEqual(h.narrative('d26_01'),h.narrative('d26_02'));assert(h.narrative('d25_01').length<h.narrative('d25_02').length);h.day(23);h.click('audio-guide');h.click('primary');h.click('audio-guide');assert.equal(h.spoken.length,2);assert.notEqual(h.spoken[0],h.spoken[1]);
});
test('best activators exclude local/pressure/reflections and never manufacture a second suggestion',()=>{
 const rows=[{id:'a',status:'completed',practiceId:'fantasy-private',metricKey:'fantasies',before:1,after:3},{id:'b',status:'completed',practiceId:'flex-script',metricKey:'pressure',before:7,after:2},{id:'c',status:'completed',practiceId:'final-compare',metricKey:'local',before:1,after:10}];assert.deepEqual(core.bestIds(rows,catalog.practices,()=>true),['fantasy-private']);assert.deepEqual(core.bestIds([],catalog.practices,()=>true),[]);
});
test('touch expansion never overlaps another control at 320, 390 or 490 pixels',()=>{
 for(const width of [320,390,490])for(const screen of screens){
  const rectangles=screen.controls.map(c=>({id:c.id,...core.hitGeometry(c,screen.controls,width).rect}));
  for(let i=0;i<rectangles.length;i++)for(let j=i+1;j<rectangles.length;j++){
   const a=rectangles[i],b=rectangles[j];const overlapX=Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x);const overlapY=Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y);
   assert(!(overlapX>1e-9&&overlapY>1e-9),`${width}px ${screen.id}: ${a.id} overlaps ${b.id}`);
  }
 }
});
test('blocked historic top activators are not filled from lower-ranked practices',()=>{
 const rows=[['visual-explore',9],['fantasy-private',3],['sensory-focus',2]].map(([practiceId,after],i)=>({id:String(i),practiceId,status:'completed',before:0,after}));
 assert.deepEqual(core.bestIds(rows,catalog.practices,p=>p.id!=='visual-explore'&&p.id!=='fantasy-private'),[]);
});
test('day 22 monthly frequency can retain a decimal without silently rounding it',async()=>{
 const h=harness({central:true,day:22});await h.ready();h.init({program:{hasPartner:'yes',continuity:{goals:[],keep:'',space:''}},day22Candidates:[catalog.practices['reconnect-gradual']],assignedPractice:catalog.practices['reconnect-gradual']});h.click('primary');h.click('primary');h.runnerInput('before',3.5);assert.equal(h.state().sessions[22].before,3.5);
});
