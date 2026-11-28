// Interaction and parent-frame protocol checks with a small, synthetic DOM surface.
// These checks execute the actual app; mobile layout and audible speech need browser QA.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const dir=path.resolve(__dirname,'../premium-v2/desire-week3-v1');
const source=fs.readFileSync(path.join(dir,'app.js'),'utf8');
const screens=JSON.parse(fs.readFileSync(path.join(dir,'screens.json'),'utf8'));
const narrationSource=fs.readFileSync(path.join(dir,'narration.js'),'utf8');
const narration=require(path.join(dir,'narration.js'));
const plain=value=>JSON.parse(JSON.stringify(value));
const settle=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve();};
const STORE='spm-desire-week3-tactile-preview-v1';

function harness(options={}){
 const central=options.central??false,assigned=options.day||16,sid='test-week3-session';
 const callbacks={},messages=[],timeouts=new Map(),storage=new Map(options.saved?[[STORE,JSON.stringify(options.saved)]]:[]);
 let sequence=0,storageAccesses=0,fetchResolve;
 function node(){const classes=new Set();return {dataset:{},innerHTML:'',textContent:'',hidden:false,focus(){},
  classList:{add:v=>classes.add(v),remove:v=>classes.delete(v),contains:v=>classes.has(v)},
  querySelector(){return null},insertAdjacentHTML(_where,html){this.innerHTML+=html}};}
 const app=node(),toast=node(),overlay=node();
 for(const [key,el] of [['app',app],['overlay',overlay]])el.addEventListener=(event,fn)=>callbacks[key+'_'+event]=fn;
 const location={origin:'https://spm.test',pathname:'/premium-v2/desire-week3-v1/index.html',protocol:'https:',
  search:central?'?spm=central&day='+assigned+'&sid='+sid:options.query||'',reload(){}};
 const document={hidden:false,querySelector:q=>q==='#app'?app:q==='#toast'?toast:q==='#resourceOverlay'?overlay:null,
  addEventListener:(name,fn)=>callbacks['document_'+name]=fn};
 const window={location,document,scrollTo(){},addEventListener:(name,fn)=>callbacks['window_'+name]=fn};
 const parent={postMessage:(data,targetOrigin)=>messages.push({...plain(data),targetOrigin})};
 window.parent=central&&!options.invalidParent?parent:window;
 if(!options.delayedData)window.SPM_WEEK3_SCREENS=plain(screens);
 const spoken=[];
 const speechSynthesis={cancel(){},getVoices:()=>[],speak:u=>spoken.push(u.text)};
 window.speechSynthesis=speechSynthesis;
 const sandbox={window,document,location,history:{replaceState(){}},URLSearchParams,Date,Math,Promise,Object,Array,Set,Map,Number,String,JSON,Intl,
  speechSynthesis,SpeechSynthesisUtterance:class{constructor(text){this.text=text}},
  addEventListener:(name,fn)=>callbacks['window_'+name]=fn,
  setTimeout:(fn,delay)=>{const id=++sequence;timeouts.set(id,{fn,delay});return id},clearTimeout:id=>timeouts.delete(id),
  setInterval:()=>++sequence,clearInterval(){},
  fetch:()=>new Promise(resolve=>{fetchResolve=resolve})};
 Object.defineProperty(sandbox,'localStorage',{get(){storageAccesses++;if(options.noStorage)throw Error('Storage unavailable');return {getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}}});
 require('./helpers/device-voice-fixture.cjs').installOn(window,sandbox.SpeechSynthesisUtterance);
 if(!options.withoutNarration)vm.runInNewContext(narrationSource,sandbox,{filename:'desire-week3-v1/narration.js'});
 vm.runInNewContext(source,sandbox,{filename:'desire-week3-v1/app.js'});
 function markup(id,attribute='data-control',where=app){const escaped=id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const match=where.innerHTML.match(new RegExp('<[^>]*'+attribute+'="'+escaped+'"[^>]*>'));assert(match,'Visible control '+id);return match[0];}
 function click(id,kind='control',where=app){
  const attr='data-'+kind,tag=markup(id,attr,where);assert(!/\sdisabled(?:[\s=>])/.test(tag),'Enabled control '+id);
  const el={dataset:{[kind]:String(id)},classList:{contains:c=>c==='day-card'}};
  const target={closest:q=>{
   if(kind==='action'&&(q==='[data-action]'||q==='button[data-action]'||q==='[data-action="'+id+'"]'))return el;
   if(kind==='control'&&(q==='button[data-control]'||q==='[data-control]'))return el;
   if(kind==='day'&&q==='[data-day]')return el;
   return null;
  }};
  callbacks[(where===overlay?'overlay':'app')+'_click']({target});
 }
 function input(id,value,kind='text'){
  markup(id);const selector=kind==='range'?'input[type=range][data-control]':'textarea[data-control]';
  const box={querySelector:()=>null,insertAdjacentHTML(){}};
  const el={dataset:{control:id},value:String(value),matches:q=>q===selector,
   closest:q=>q==='[data-control]'||q===selector?el:q==='.scale-box'?box:null};
  callbacks.app_input({target:el});return el.value;
 }
 function message(type,values={},overrides={}){
  const event={origin:location.origin,source:parent,data:{type,sid,day:assigned,...plain(values)},...overrides};
  callbacks.window_message?.(event);
 }
 const init=(values={})=>message('SPM_WEEK3_INIT',{record:{id:'central-record-'+assigned,practiceId:{15:'intimacy-ladder',16:'sensate-1',17:'foreplay-rhythm',18:'communicate-limits',19:'sensate-2',20:'context-design',21:'week-review'}[assigned]},history:[],program:{conditions:[],ranking:[],details:{},detailNotes:{}},safety:{pressure:3,acute:false,review:false},...values});
 const fireTimeout=delay=>{const timers=[...timeouts].filter(([,timer])=>timer.delay===delay);assert(timers.length,'Scheduled timeout '+delay);for(const [id,timer] of timers){timeouts.delete(id);timer.fn()}};
 return {app,toast,overlay,messages,spoken,storage,init,message,fireTimeout,location,
  ready:settle,state:()=>window.SPM_WEEK3_REVIEW?.getState(),screen:()=>app.innerHTML.match(/data-screen="([^"]+)"/)?.[1]||null,
  click:(id)=>click(id),action:id=>click(id,'action'),day:d=>click(String(d),'day'),input,
  modalClose:()=>click('close','action',overlay),
  detail:(channel,text)=>{markup(channel,'data-detail',overlay);callbacks.overlay_input({target:{dataset:{detail:channel},value:text}})},
  fetchData:async data=>{fetchResolve({ok:true,json:async()=>plain(data)});await settle()},
  storageAccesses:()=>storageAccesses,
  programChanges:()=>messages.filter(x=>x.type==='SPM_WEEK3_CHANGE'),
  completes:()=>messages.filter(x=>x.type==='SPM_WEEK3_COMPLETE'),
  isPressed:id=>markup(id).includes('aria-pressed="true"')};
}

test('standalone opens all seven days and restores an unfinished individual route without completing it',async()=>{
 const h=harness();await h.ready();assert.equal((h.app.innerHTML.match(/class="day-card"/g)||[]).length,7);
 h.day(18);assert.equal(h.screen(),'d18_01');h.click('communication_route-solo');h.click('primary');
 h.input('like_phrase','Me gustan las caricias lentas.');h.input('avoid_phrase','Hoy prefiero evitar las prisas.');h.click('primary');
 assert.equal(h.screen(),'d18_03a');h.input('partner_solo','Preparé mis ideas.');
 const saved=JSON.parse(h.storage.get(STORE));assert.equal(saved.session[18].status,'draft');assert.equal(saved.session[18].before,null);
 const restored=harness({query:'?dia=18',saved});await restored.ready();assert.equal(restored.screen(),'d18_03a');
 assert.equal(restored.state().session[18].fields.partner_solo,'Preparé mis ideas.');assert.equal(restored.state().session[18].status,'draft');
 restored.action('home');assert.equal((restored.app.innerHTML.match(/class="day-card"/g)||[]).length,7);
});

test('unavailable local storage cannot prevent opening, navigation or explicit completion in review',async()=>{
 const h=harness({noStorage:true});await h.ready();h.day(17);h.click('primary');h.click('primary');h.click('primary');
 assert.equal(h.screen(),'d17_04');h.click('primary');assert.equal(h.state().session[17].status,'draft');
 h.click('confirm');h.click('primary');assert.equal(h.state().session[17].status,'completed');
 assert(h.app.innerHTML.includes('Semana 3'));assert(h.storageAccesses()>0);
});

test('central waits for its authenticated parent and never reads or writes review storage',async()=>{
 const h=harness({central:true,noStorage:true});await h.ready();assert.equal(h.screen(),null);
 assert.equal(h.messages[0].type,'SPM_WEEK3_READY');assert.equal(h.messages[0].day,16);assert.equal(h.messages[0].targetOrigin,'https://spm.test');
 for(const invalid of [{origin:'https://unrelated.test'},{source:{}},{data:{type:'SPM_WEEK3_INIT',sid:'wrong-session',day:16}},{data:{type:'SPM_WEEK3_INIT',sid:'test-week3-session',day:17}}]){
  h.message('SPM_WEEK3_INIT',{},invalid);assert.equal(h.screen(),null);
 }
 h.init();assert.equal(h.screen(),'d16_01');h.click('variant-solo');h.click('primary');
 assert.equal(h.screen(),'d16_02');assert.equal(h.programChanges().at(-1).record.day,16);assert.equal(h.storageAccesses(),0);
});

test('central initialization arriving before screen data still opens the assigned day when data arrives',async()=>{
 const h=harness({central:true,day:20,delayedData:true});h.init();assert.equal(h.screen(),null);
 await h.fetchData(screens);assert.equal(h.screen(),'d20_01');assert.equal(h.state().session[20].before,null);
 h.message('SPM_WEEK3_INIT',{record:{day:20,step:4,confirm:true}});assert.equal(h.screen(),'d20_01','duplicate initialization does not overwrite current progress');
});

test('central connection timeout offers a usable retry and rejects standalone central-mode URLs',async()=>{
 const h=harness({central:true});await h.ready();h.fireTimeout(10000);assert.match(h.app.innerHTML,/Reintentar/);
 const sent=h.messages.length;h.action('retry');assert.equal(h.messages[sent].type,'SPM_WEEK3_READY');h.init();assert.equal(h.screen(),'d16_01');
 const invalid=harness({central:true,invalidParent:true});await invalid.ready();assert.match(invalid.app.innerHTML,/Regresa a SPM Central/);assert.equal(invalid.messages.length,0);
});

test('unanswered scales and comfort stay distinct from selected zero and explicit N/A',async()=>{
 const h=harness();await h.ready();h.day(16);assert.equal(h.state().session[16].before,null);assert.equal(h.isPressed('metric-before-na'),false);
 h.input('metric-before-scale',0,'range');assert.equal(h.state().session[16].before,0);h.click('metric-before-na');assert.equal(h.state().session[16].before,null);assert.equal(h.isPressed('metric-before-na'),true);
 h.click('primary');h.click('primary');h.click('primary');assert.equal(h.screen(),'d16_04');
 for(const id of ['comfortable-true','comfortable-false','comfortable-null'])assert.equal(h.isPressed(id),false);
 assert.equal(h.state().session[16].comfortableAnswered,false);h.click('comfortable-null');assert.equal(h.state().session[16].comfortable,null);assert.equal(h.state().session[16].comfortableAnswered,true);assert.equal(h.isPressed('comfortable-null'),true);
});

test('repeating phase I on assigned day 19 retains day 19 and the real day 16 history',async()=>{
 const old={id:'previous-day16',day:16,practiceId:'sensate-1',status:'completed',comfortable:false,comfort:10};
 const h=harness({central:true,day:19});await h.ready();h.init({history:[old]});assert.equal(h.screen(),'d19_00a');
 h.click('primary');assert.equal(h.screen(),'d16_01');assert.equal(h.state().session[19].practiceId,'sensate-1');assert.equal(h.state().session[19].day,19);
 h.click('primary');h.click('primary');h.click('primary');h.click('comfortable-true');h.click('confirm');h.click('primary');
 const sent=h.completes().at(-1);assert.equal(sent.day,19);assert.equal(sent.record.day,19);assert.equal(sent.record.practiceId,'sensate-1');assert.equal(sent.record.comfortable,true);
 assert.deepEqual(h.state().archive,[old]);assert.equal(h.state().session[16].status,'draft');
});

test('phase II current readiness and partner consent are required before progressing',async()=>{
 const h=harness({central:true,day:19});await h.ready();h.init({history:[{id:'prior',day:16,practiceId:'sensate-1',status:'completed',comfortable:true}]});assert.equal(h.screen(),'d19_01');
 h.click('primary');assert.equal(h.screen(),'d19_01');h.click('ready');h.click('primary');assert.equal(h.screen(),'d19_02');
 h.click('variant-partner');h.click('primary');assert.equal(h.screen(),'d19_02');assert.match(h.toast.textContent,/ambos/);
 h.click('variant-solo');h.click('primary');assert.equal(h.screen(),'d19_03');
});

test('completion waits for the host, recovers from a save failure and retries the same record',async()=>{
 const h=harness({central:true,day:18});await h.ready();h.init();h.click('communication_route-solo');h.click('primary');
 h.input('like_phrase','Contacto tranquilo');h.click('primary');h.click('primary');h.click('primary');assert.equal(h.completes().length,0);
 h.click('confirm');h.click('primary');assert.equal(h.completes().length,1);const recordId=h.completes()[0].record.id;
 h.click('primary');assert.equal(h.completes().length,1,'double click cannot submit twice while saving');
 h.message('SPM_WEEK3_ERROR',{message:'Prueba de fallo de guardado'});assert.equal(h.state().session[18].status,'draft');assert.equal(h.state().session[18].fields.like_phrase,'Contacto tranquilo');
 h.click('primary');assert.equal(h.completes().length,2);assert.equal(h.completes()[1].record.id,recordId);
 h.message('SPM_WEEK3_DONE');assert.match(h.toast.textContent,/registrada/);assert.equal(h.storageAccesses(),0);
});

test('lost completion or close replies release the waiting state without losing the draft',async()=>{
 const h=harness({central:true,day:17});await h.ready();h.init();h.click('primary');h.click('primary');h.click('primary');h.input('reflection','Pausa agradable');h.click('confirm');h.click('primary');
 const first=h.completes()[0].record;h.fireTimeout(15000);assert.equal(h.state().session[17].fields.reflection,'Pausa agradable');assert.equal(h.state().session[17].status,'draft');
 h.click('primary');assert.equal(h.completes().length,2);assert.equal(h.completes()[1].record.id,first.id);
 h.message('SPM_WEEK3_ERROR',{message:'Puede reintentar'});h.action('home');assert.equal(h.messages.at(-1).type,'SPM_WEEK3_CLOSE');
 h.fireTimeout(15000);h.action('back');assert.equal(h.screen(),'d17_03');assert.equal(h.state().session[17].fields.reflection,'Pausa agradable');
});

test('editing a per-channel note preserves typed clinical preferences and unrelated program fields',async()=>{
 const program={conditions:['Mejor descanso'],ranking:['massage','words'],details:{visual:['Miradas'],tactile:['Caricias lentas'],custom:['Conservar']},detailNotes:{visual:'Texto anterior',unrelated:'Conservar'},context:'Lugar tranquilo'};
 const h=harness({central:true,day:21});await h.ready();h.init({program});h.click('primary');h.click('primary');assert.equal(h.screen(),'d21_03');
 h.click('details');h.detail('visual','Preferencia actual');h.modalClose();h.click('primary');h.input('metric-local_after-scale',0,'range');h.click('confirm');h.click('primary');
 const sent=h.completes().at(-1);assert.deepEqual(sent.program.details,program.details);assert.deepEqual(sent.program.conditions,program.conditions);assert.deepEqual(sent.program.ranking,program.ranking);assert.equal(sent.program.context,program.context);
 assert.equal(sent.program.detailNotes.visual,'Preferencia actual');assert.equal(sent.program.detailNotes.unrelated,'Conservar');assert.deepEqual(sent.programChanged,['detailNotes']);assert.equal(sent.record.localAfter,0);assert.equal(sent.record.after,null);
});

test('daily context selections do not overwrite prior conditions and aggregate reflection remains bounded',async()=>{
 const h=harness({central:true,day:20});await h.ready();h.init({program:{conditions:['Mejor descanso','Más tiempo'],ranking:['massage'],details:{},detailNotes:{}}});
 h.click('primary');for(const id of ['context_details-time','context_details-privacy','context_details-rest'])h.click(id);
 h.click('context_details-ambience');assert.equal(h.state().session[20].choices.context_details.length,3);h.click('primary');h.click('primary');
 h.input('context','Luz suave');h.click('confirm');h.click('primary');const sent=h.completes().at(-1);
 assert.deepEqual(sent.program.conditions,['Mejor descanso','Más tiempo']);assert.deepEqual(sent.programChanged,['context']);
 const q=harness();await q.ready();q.day(18);q.click('communication_route-solo');q.click('primary');q.input('like_phrase','a'.repeat(350));q.input('avoid_phrase','b'.repeat(200));
 q.click('primary');q.input('partner_solo','c'.repeat(100));q.click('primary');q.input('reflection','d'.repeat(100));
 assert.equal(Object.values(q.state().session[18].fields).join('').length,400);
});

test('the narration table covers the actual 33 screens and 42 concise interactive messages',()=>{
 assert.equal(Object.keys(narration).length,33);
 let choices=0;
 for(const screen of screens){
  const mapped=narration[screen.id];assert(mapped,'Narration for '+screen.id);assert(mapped['audio-guide'].trim().length>8);
  for(const [id,text] of Object.entries(mapped)){
   assert(screen.controls.some(c=>c.id===id),'Existing screen control '+screen.id+':'+id);
   if(id!=='audio-guide'){choices++;assert(text.split(/\s+/).length<=45,'Concise message '+screen.id+':'+id);}
  }
 }
 assert.equal(choices,42);
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
 assert(html.indexOf('src="narration.js')<html.indexOf('src="app.js'),'Narration is loaded before app');
 assert(!html.includes('spm-premium-staging.vercel.app'),'Review help stays on its actual host');
});

test('guides remain specific across the previously repeated day 16, 20 and 21 steps',async()=>{
 for(const {day,step,first,second,history=[]} of [
  {day:16,step:3,first:'d16_03',second:'d16_04'},
  {day:20,step:1,first:'d20_01',second:'d20_02'},
  {day:21,step:1,first:'d21_01',second:'d21_02',history:[{id:'prior-day15',day:15,practiceId:'intimacy-ladder',status:'completed'}]},
  {day:21,step:1,first:'d21_01',second:'d21_02a'}
 ]){
  const h=harness({central:true,day});await h.ready();h.init({record:{step},history});
  assert.equal(h.spoken.length,0,'No automatic guide on entry');assert.equal(h.screen(),first);h.click('audio-guide');
  const before=h.spoken.at(-1);assert.equal(before,narration[first]['audio-guide']);
  h.click('primary');assert.equal(h.screen(),second);h.click('audio-guide');
  const after=h.spoken.at(-1);assert.equal(after,narration[second]['audio-guide']);assert.notEqual(after,before);
  h.action('speak');assert.equal(h.spoken.at(-1),after,'Footer guide uses the same specific step');
  assert.equal(h.completes().length,0,'Listening never completes a practice');
 }
});

test('the day 18 solo route and closure never require a conversation with a partner',async()=>{
 const h=harness({central:true,day:18});await h.ready();h.init();
 h.click('communication_route-solo');assert.equal(h.spoken.at(-1),narration.d18_01['communication_route-solo']);
 h.click('primary');h.click('primary');assert.equal(h.screen(),'d18_03a');h.click('audio-guide');
 assert.equal(h.spoken.at(-1),narration.d18_03a['audio-guide']);assert.match(h.spoken.at(-1),/a solas/);
 h.click('primary');assert.equal(h.screen(),'d18_04');h.click('audio-guide');
 assert.equal(h.spoken.at(-1),narration.d18_04['audio-guide']);assert.match(h.spoken.at(-1),/expresar o escribir/);
 assert.doesNotMatch(h.spoken.at(-1),/Si conversan|pregunta qué prefiere la otra|escucha su respuesta/i);
 assert.equal(h.state().session[18].route,'solo');assert.equal(h.state().session[18].status,'draft');
});

test('choice and phase buttons use their own brief guide; deselection and clinical answers stay silent',async()=>{
 const h=harness();await h.ready();h.day(16);h.click('variant-solo');
 assert.equal(h.spoken.at(-1),narration.d16_01['variant-solo']);
 h.click('triad-0-0');assert.equal(h.spoken.at(-1),narration.d16_01['triad-0-0']);
 h.click('primary');h.click('sensate1_phases-sensate1_phases_1');
 assert.equal(h.spoken.at(-1),narration.d16_02['sensate1_phases-sensate1_phases_1']);
 h.click('primary');h.click('primary');const count=h.spoken.length;
 h.click('comfortable-true');h.click('comfortable-null');h.click('confirm');
 assert.equal(h.spoken.length,count,'Clinical answers and confirmation do not add narration');
 const q=harness();await q.ready();q.day(20);q.click('primary');q.click('context_details-time');
 assert.equal(q.spoken.at(-1),narration.d20_02['context_details-time']);const selected=q.spoken.length;
 q.click('context_details-time');assert.equal(q.spoken.length,selected,'Deselection stays silent');
});

test('missing optional narration data preserves a usable guide and control fallback',async()=>{
 const h=harness({withoutNarration:true});await h.ready();h.day(17);h.click('audio-guide');
 assert(h.spoken.at(-1).includes('contacto que te resulte agradable'));
 h.click('primary');h.click('rhythm_cues-slower');assert(h.spoken.at(-1).trim().length>0);
 assert.equal(h.screen(),'d17_02');assert.equal(h.state().session[17].status,'draft');
});
