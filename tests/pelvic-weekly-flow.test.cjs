const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../labs/breathing/node_modules/jsdom');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const DAYS=[3,10,17,24],DOMAINS=['erection','ejaculation','desire','confidence','wellbeing','lifestyle'];
test('calendar: exactly one Lab per week across all six domains; strength remains separate',()=>{
 const w={SPM_RESOURCE_CONTENT:{scenarios:[]},SPM_VIDEO_LIBRARY:[],SPM_ERECTION_DAILY:{lowDesire:()=>false},SPM_VIDEO_ACTIONS:{summary:()=>''}};
 new Function('window',read('premium-v2/daily-resource-plan-v1.js'))(w);
 for(const primary of DOMAINS){
  const labDays=[],strengthDays=[];
  for(let day=1;day<=28;day++){
   const result=w.SPM_DAILY_RESOURCES.compose({id:'main',kind:'worksheet'},[],{primary,day,answers:{}});
   const all=[result.main,...result.support],labs=all.filter(a=>a.id==='pelvic-daily-lab'),strength=all.filter(a=>a.pelvicIntent==='scheduled');
   assert.ok(labs.length<=1,'No duplicated Lab for '+primary+' day '+day);
   if(labs.length){labDays.push(day);assert.equal(labs[0].pelvicIntent,'daily-relax');assert.equal(labs[0].optional,true);}
   if(strength.length){strengthDays.push(day);assert.ok(strength.every(a=>a.pelvicPreference==='classic'));}
  }
  assert.deepEqual(labDays,DAYS,primary);
  assert.equal(strengthDays.length,['erection','ejaculation'].includes(primary)?8:0,primary);
 }
});
function lesson(day,restriction='relax'){
 const dom=new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>',{url:'https://spm.test/premium-v2/pelvic-floor-lab/index.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,store={},accepted=[];const ctx={day,origin:'dailyPlan',intent:'daily-relax',activityId:'pelvic-daily-lab',restriction};
 let now=0,tick=null,interval=0;
 Object.defineProperty(w.performance,'now',{value:()=>now,configurable:true});
 w.setInterval=fn=>{tick=fn;return ++interval};
 w.clearInterval=()=>{tick=null};
 w.HTMLMediaElement.prototype.play=async function(){};w.HTMLMediaElement.prototype.pause=function(){};
 w.SPM_PELVIC_LAB_HOST={
  getContext:()=>({...ctx}),
  getState:()=>JSON.parse(JSON.stringify(store)),
  write:(k,v)=>{store[k]=JSON.parse(JSON.stringify(v));return true},
  onResult:r=>{accepted.push(r);return true},
  close:async()=>true
 };
 w.eval(read('premium-v2/pelvic-floor-lab/pelvic-weekly-flow-v1.js'));
 const button=selector=>{const el=w.document.querySelector(selector);assert.ok(el,'Missing selector '+selector);return el};
 const click=selector=>button(selector).click();
 const advance=ms=>{now=ms;tick?.();};
 return {w,ctx,store,accepted,button,click,advance,close:()=>dom.window.close()};
}
test('first weekly training: recognition GIF, audio affordance, survey, posture, automatic cues and closing',async()=>{
 const h=lesson(3);try{
  assert.match(h.button('.pf-weekly-card').textContent,/Reconoce la zona/);
  assert.ok(h.button('[data-action="audio-intro"]'));assert.match(h.button('.pf-weekly-media img:last-child').getAttribute('src'),/relaxation-animation\.webp/);
  h.click('[data-action="continue-recognition"]');assert.match(h.button('.pf-weekly-card').textContent,/Reconoces la zona/);
  h.click('[data-choice="awareness"][data-value="yes"]');h.click('[data-action="to-position"]');
  assert.match(h.button('.pf-weekly-card').textContent,/Acomódate y empieza/);
  assert.equal(h.w.document.querySelectorAll('[data-posture]').length,2);
  h.click('[data-action="start"]');
  assert.match(h.button('[data-active-phase]').textContent,/Percibe/);
  assert.equal(h.w.document.querySelectorAll('.pf-weekly-phase.on').length,1);
  h.advance(13000);assert.equal(h.button('[data-active-phase]').textContent,'Respira');
  h.advance(37000);assert.equal(h.button('[data-active-phase]').textContent,'Suelta');
  assert.equal(h.accepted.length,0,'automatic phases alone never complete the practice');
  h.advance(55000);assert.match(h.button('.pf-weekly-card h1').textContent,/Reconoce cuándo parar/);
  h.click('[data-choice="stop"][data-value="none"]');h.click('[data-choice="release"][data-value="yes"]');
  h.click('[data-action="save"]');await Promise.resolve();
  assert.equal(h.accepted.length,1);assert.equal(h.accepted[0].weekly.week,1);assert.equal(h.accepted[0].weekly.recognition,'yes');
  assert.equal(h.accepted[0].cleanContraction,null);assert.equal(h.accepted[0].intent,'daily-relax');
  assert.match(h.button('.pf-weekly-card h1').textContent,/Práctica registrada/);
 }finally{h.close()}
});
for(const [day,expected,choice,key] of [[10,'¿Qué notaste?',null,null],[17,'Elige un apoyo para soltar','hands','anchor'],[24,'¿Qué puedo percibir?','support','perception']]){
 test('weekly '+day+' begins at posture and ends with '+expected,async()=>{
  const h=lesson(day);try{
   assert.match(h.button('.pf-weekly-card h1').textContent,/Acomódate y empieza/);
   assert.equal(h.w.document.querySelector('[data-action="continue-recognition"]'),null);
   h.click('[data-action="start"]');h.advance(55000);
   assert.equal(h.button('.pf-weekly-card h1').textContent,expected);
   if(key)h.click('[data-choice="'+key+'"][data-value="'+choice+'"]');
   for(const name of ['release','discomfort','tension'])h.click('[data-choice="'+name+'"][data-value="'+(name==='release'?'yes':'no')+'"]');
   h.click('[data-action="save"]');await Promise.resolve();
   assert.equal(h.accepted.length,1);assert.equal(h.accepted[0].weekly.week,DAYS.indexOf(day)+1);
   if(key)assert.equal(h.accepted[0].weekly[key],choice);
  }finally{h.close()}
 });
}
test('weekly practice is blocked on safety review and cannot register',()=>{
 const h=lesson(3,'review');try{assert.match(h.button('.pf-weekly-card').textContent,/Práctica en pausa/i);assert.equal(h.w.document.querySelector('[data-action="start"]'),null);assert.equal(h.accepted.length,0)}finally{h.close()}
});
test('the previous daily Lab surface is replaced and the public site stays paused',()=>{
 const html=read('premium-v2/pelvic-floor-lab/index.html'),calendar=read('premium-v2/daily-resource-plan-v1.js'),today=read('premium-v2/daily-practice-v1.js');
 assert.match(html,/pelvic-weekly-flow-v1\.js/);assert.match(calendar,/labDays=\[3,10,17,24\]/);
 assert.doesNotMatch(calendar,/Lab has a different purpose from the contraction module\. It stays/);
 assert.match(today,/pelvicIntent\(a\)==='scheduled'\?window\.SPM_PELVIC_GUIDANCE/);
 assert.match(read('premium-v2/program-paused.html'),/Estamos afinando tu experiencia/);
});
