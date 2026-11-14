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
  assert.match(h.button('.pf-weekly-card h1').textContent,/Tu objetivo de esta sesión/);
  assert.ok(h.button('[data-action="audio-intro"]'));assert.ok(h.button('[data-action="audio-zone"]'));assert.match(h.button('.pf-weekly-media img:last-child').getAttribute('src'),/relaxation-animation\.webp/);
  h.click('[data-action="continue-recognition"]');assert.match(h.button('.pf-weekly-card').textContent,/Reconoces la zona/);
  h.click('[data-choice="awareness"][data-value="yes"]');h.click('[data-action="to-position"]');
  assert.match(h.button('.pf-weekly-card').textContent,/Acomódate y empieza/);
  assert.ok(h.button('[data-action="audio-posture"]'));assert.equal(h.w.document.querySelectorAll('[data-posture]').length,2);
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
   assert.match(h.button('.pf-weekly-card h1').textContent,/Tu objetivo de esta sesión/);
   assert.ok(h.button('[data-action="audio-intro"]'));
   h.click('[data-action="continue-recognition"]');
   assert.match(h.button('.pf-weekly-card h1').textContent,/Acomódate y empieza/);
   assert.ok(h.button('[data-action="audio-posture"]'));
   assert.equal(h.w.document.querySelector('[data-action="to-position"]'),null);
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

test('short spoken guidance plays at each stage and a reminder interrupts long silence',()=>{
 const h=lesson(3);try{
  h.click('[data-action="audio-intro"]');
  assert.match(h.w.document.querySelector('audio').src,/0866a25f4275485087bea2d218bf537e/);
  h.click('[data-action="continue-recognition"]');
  h.click('[data-choice="awareness"][data-value="yes"]');h.click('[data-action="to-position"]');
  h.click('[data-action="audio-posture"]');
  assert.match(h.w.document.querySelector('audio').src,/277c349917f246c8999a67329fc7b911/);
  h.click('[data-action="start"]');
  assert.match(h.w.document.querySelector('audio').src,/58adf76160ec4a70aa26875b01cec6cf/);
  h.advance(13000);assert.match(h.w.document.querySelector('audio').src,/3f3dddf3209340bea0fe1f1bf2c6d473/);
  h.advance(28000);assert.match(h.w.document.querySelector('audio').src,/31e4323736fe4372b877fe498e1a188b/);
  h.advance(38000);assert.match(h.w.document.querySelector('audio').src,/857ca74c564b4d9c817c8e251868c46a/);
 }finally{h.close()}
});
test('week-three questionnaire is accessible as soon as the final automatic phase begins',async()=>{
 const h=lesson(17);try{
  h.click('[data-action="continue-recognition"]');h.click('[data-action="start"]');
  assert.equal(h.button('[data-action="to-evaluation"]').disabled,true);
  h.advance(38000);
  assert.equal(h.button('[data-action="to-evaluation"]').disabled,false);
  h.click('[data-action="to-evaluation"]');
  assert.equal(h.button('.pf-weekly-card h1').textContent,'Elige un apoyo para soltar');
  assert.ok(h.button('[data-choice="anchor"][data-value="hands"]'));
  assert.equal(h.button('[data-action="save"]').disabled,true);
  h.click('[data-choice="anchor"][data-value="hands"]');
  for(const name of ['release','discomfort','tension'])h.click('[data-choice="'+name+'"][data-value="'+(name==='release'?'yes':'no')+'"]');
  h.click('[data-action="save"]');await Promise.resolve();
  assert.equal(h.accepted.length,1);
  assert.equal(h.accepted[0].weekly.week,3);
 }finally{h.close()}
});
test('introductory audio exists in every weekly practice and can be read without playing',()=>{
 for(const day of DAYS){
  const h=lesson(day);try{
   assert.ok(h.button('[data-action="audio-intro"]'));
   assert.ok(h.button('.pf-weekly-transcript summary'));
   assert.equal(h.w.document.querySelector('[data-action="audio-posture"]'),null);
   h.click('[data-action="continue-recognition"]');
   if(day===3){
    h.click('[data-choice="awareness"][data-value="unsure"]');h.click('[data-action="to-position"]');
   }
   assert.ok(h.button('[data-action="audio-posture"]'));
   assert.match(h.button('.pf-weekly-transcript').textContent,/Antes de empezar/);
  }finally{h.close()}
 }
});
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
