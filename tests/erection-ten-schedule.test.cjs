const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function schedule(){const context={window:{}};vm.runInNewContext(read('premium-v2/erection-ten-schedule-v1.js'),context);return context.window.SPM_ERECTION_10_SCHEDULE;}
const expected=[1,3,6,9,12,15,18,21,24,27];
test('diez sesiones distribuidas en 28 días; evaluaciones independientes 14 y 28',()=>{
 const s=schedule();assert.equal(JSON.stringify(s.days),JSON.stringify(expected));
 assert.equal(JSON.stringify(s.evaluationDays),'[14,28]');assert.equal(s.integrated,5);
 for(let i=0;i<expected.length;i++){assert.equal(s.dayFor(i+1),expected[i]);assert.equal(s.lessonFor(expected[i]),i+1);assert.equal(s.phase(expected[i]),i<5?'ready':'pending');}
 for(const d of [2,4,5,7,8,10,11,13,14,16,17,19,20,22,23,25,26,28]){
  assert.equal(s.lessonFor(d),null);assert.equal(s.phase(d),[14,28].includes(d)?'evaluation':'transversal');
 }
 assert.equal(s.dayFor(11),null);assert.equal(s.isReady(12),true);
});
test('las sesiones 1–4 usan la nueva agenda, registros independientes y conservan los recursos',()=>{
 const daily=read('premium-v2/daily-practice-v1.js'),practice=read('premium-v2/erection-practice-v1.js');
 assert.ok(daily.includes('erectionLesson:slot.lesson'));
 assert.ok(daily.includes("kind:'erection-support-day'"));
 assert.ok(daily.includes('data-erection-transversal'));
 assert.ok(daily.includes('allowNoRequired'));
  assert.ok(practice.includes('const approvedDays=new Map([[1,1],[3,2],[6,3],[9,4],[12,5]])'));
 assert.ok(practice.includes('if(record.erectionLesson!==lesson)return false'));
 for(const [lesson,day] of [[2,3],[3,6],[4,9],[5,12]]){
  const bridge=read('premium-v2/erection-day'+lesson+'-bridge-v1.js');
  assert.ok(bridge.includes('Number(c.day)!=='+day));
  assert.ok(bridge.includes('erectionLesson:'+lesson));
  assert.ok(bridge.includes('calendarDay:'+day));
 }
});
test('la ruta heredada queda fuera de Hoy y mantiene evaluaciones y recursos transversales',()=>{
 const legacy=read('premium-v2/erectile-function-route.js'),res=read('premium-v2/daily-resource-plan-v1.js');
 const checkpoints=read('premium-v2/program-checkpoint-v1.js'),live=read('premium-v2/live.html'),review=read('premium-v2/program-review-v1.js');
 assert.ok(legacy.includes("if(c?.primary==='erection'&&window.SPM_DAILY_PRACTICE?.open)"));
 assert.ok(res.includes("if(main.kind==='pelvic')main={...main,...pelvic}"));
 assert.ok(checkpoints.includes('14'));assert.ok(checkpoints.includes('28'));
 assert.ok(live.includes('erection-ten-schedule-v1.js'));assert.ok(review.includes('erection-ten-schedule-v1.js'));
 assert.ok(read('vercel.json').includes('program-paused.html'));
});
