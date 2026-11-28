const fs=require('node:fs'),path=require('node:path');
const h=require('../../tests/helpers/agenda-harness.cjs')();
const out={version:'legacy',generatedFrom:'actual legacyAssignments in daily-practice-v1.js',routes:{},allRoutes:{}};
for(const route of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle'])for(const secondary of [null,'desire'])for(const safety of ['none','review','urgent'])for(const strength of [false,true]){
 const name=route+(secondary?'-desire':'')+'-'+safety+(strength?'-strength':'');
 out.routes[name]={};out.allRoutes[name]={};
 for(let day=1;day<=28;day++){
  const c=h.makeContext(route,day,{scheduleVersion:'legacy',secondary,motives:[route,...(secondary?['desire']:[])],safety});if(strength)c.answers={...c.answers,pf_awareness:'good_control',pf_tension:1};h.setContext(c);
  const all=h.window.SPM_DAILY_PRACTICE.legacyAssignments(c).map(a=>({id:a.id,kind:a.kind,title:a.title,optional:a.optional===true,interaction:a.lesson?.interaction||null,confidenceDay:a.confidenceDay||null,connectionDay:a.kind==='connection'?Number(a.connectionDay||day):null,erectionLesson:a.erectionLesson||null,scenario:a.scenario||null,videoKey:a.videoKey||null,practiceId:a.practiceId||null,pelvicIntent:a.pelvicIntent||null,tipId:a.tip?.id||null,wellnessCategory:a.tip?.category||null,condition:a.pelvicIntent==='scheduled'?'strength':null}));
  out.allRoutes[name][day]=all;out.routes[name][day]=all.filter(a=>!a.optional);
 }
}
fs.writeFileSync(path.resolve(__dirname,'../../docs/qa/spm-agenda-legacy-manifest.json'),JSON.stringify(out,null,2)+'\n');
console.log('Exported',Object.keys(out.routes).length,'legacy route/secondary/safety variants');
