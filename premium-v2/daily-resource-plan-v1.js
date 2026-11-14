(()=>{'use strict';
// Explicit video membership and day: one video at most per day. Shared domains use the same key.
const all=['erection','ejaculation','desire','confidence','wellbeing','lifestyle'];
const videoPlan=[
 [1,'dr-performance-anxiety',all],
 [2,'dr-vascular',['erection','desire','wellbeing','lifestyle']],
 [3,'breathing-guided',all],
 [7,'anticipatory-failure',all],
 [9,'dr-metabolic',['erection','desire','wellbeing','lifestyle']],
 [10,'anxiety-regulation',all],
 [14,'performance-anxiety',all],
 [16,'sensory-focus',all],
 [18,'partner-communication',all],
 [21,'dr-medications',all],
 [23,'dr-low-desire',['erection','desire','confidence','wellbeing','lifestyle']],
 [28,'mental-preparation',all]
];
function videoFor(day,c){const primary=({anxiety:'confidence',optimization:'wellbeing',mixed:'confidence'})[c.primary]||c.primary;return videoPlan.find(([d,key,routes])=>d===Number(day)&&(routes.includes(primary)||(key==='dr-low-desire'&&primary==='ejaculation'&&window.SPM_ERECTION_DAILY?.lowDesire(c))))?.[1];}
function pelvicDays(c){
 // The separate contraction module keeps exactly two potential sessions weekly.
 // Eligibility is verified from the patient's saved readiness before execution.
 return Array.from({length:28},(_,i)=>i+1).filter(d=>[2,6].includes((d-1)%7+1));
}
// Seven distinct educational stories, shared by all routes. Today opens only
// the assigned story; Library keeps all seven available without advancing a day.
const recoveryDays=[4,8,11,15,18,22,25];
const recoveryOrder={
 erection:['condom','during','before','urge','partner','early','next'],
 ejaculation:['before','urge','early','condom','partner','during','next'],
 desire:['before','partner','during','condom','early','urge','next']
};
function recoveryFor(day,primary){
 const index=recoveryDays.indexOf(Number(day));if(index<0)return null;
 const scenario=(recoveryOrder[primary]||recoveryOrder.desire)[index];
 const story=window.SPM_RESOURCE_CONTENT?.scenarios?.find(s=>s.id===scenario);
 return story?{scenario,index:index+1,title:story.title.es}:null;
}
function cadence(main,support,c){
 const day=Number(c.day),story=recoveryFor(day,c.primary);
 if(['erection','ejaculation'].includes(c.primary)){
  // Two sessions in the separate contraction module, never on EP's 1/3/5 days.
  support=support.filter(a=>a.kind!=='pelvic');
  const days=pelvicDays(c),slot=days.indexOf(day),weekly=days.length/4;
  if(slot>=0){
   const pelvic={kind:'pelvic',title:'Tu sesión de contracciones de piso pélvico',summary:'Abre el módulo de entrenamiento. Primero se comprueba que la técnica y la relajación estén preparadas.',pelvicIntent:'scheduled',pelvicPreference:'classic',optional:true,optionalLabel:`SEGÚN TU PREPARACIÓN / PAUTA · SESIÓN ${slot%weekly+1}/${weekly} DE LA SEMANA ${Math.ceil(day/7)}`};
   if(main.kind==='pelvic'||(c.primary==='erection'&&day===6))main={...main,...pelvic};
   else support.push({...pelvic,id:'support-pelvic'});
  }
 }
 if(story){
  support=support.filter(a=>a.kind!=='recovery');
  const activity={kind:'recovery',scenario:story.scenario,title:`Recuperación · historia ${story.index}/7 · ${story.title}`,summary:'Lee o escucha las cuatro escenas de la historia de hoy. Abre «Practicar y guardar mi respuesta», elige qué harías y registra si la idea te resultó útil.',label:'RECUPERACIÓN · HISTORIA DE HOY'};
  if(main.kind==='recovery')main={...main,...activity};else support.push({...activity,id:'recovery-'+story.scenario});
 }
 // Un Lab semanal en los seis dominios; no confundirlo con el módulo de fuerza.
 const primary=({anxiety:'confidence',optimization:'wellbeing',mixed:'confidence'})[c.primary]||c.primary;
 const labDays=[3,10,17,24];
 support=support.filter(a=>a.kind!=='pelvic'||a.pelvicIntent==='scheduled');
 if(!['erection','ejaculation'].includes(c.primary)&&main.kind==='pelvic'&&!main.pelvicIntent)
   main={...main,kind:'confidence',title:'Atención y calma corporal',summary:'Practica una pausa de atención sin apretar ni forzar.'};
 const week=labDays.indexOf(day);
 if(all.includes(primary)&&week>=0)support.push({
   id:'pelvic-daily-lab',kind:'pelvic',title:`Pelvic Floor Lab · Semana ${week+1}`,
   summary:'Guía semanal de conciencia, respiración y relajación, con audio y cierre personal.',
   pelvicIntent:'daily-relax',pelvicPreference:'lab',optional:true,optionalLabel:`LAB SEMANAL · SESIÓN ${week+1}/4`
 });
 return {main,support};
}
function compose(main,support,c){
 if(!c)return {main,support};
 ({main,support}=cadence(main,support,c));
 const day=Number(c.day),extra=[],key=videoFor(day,c),video=window.SPM_VIDEO_LIBRARY?.find(v=>v.key===key);
 if(video)extra.push({id:(c.primary==='erection'?'de-video-':'route-video-')+key,kind:'video',videoKey:key,title:'Video · '+video.title,summary:window.SPM_VIDEO_ACTIONS?.summary(key)||'Escucha la acción que acompaña al video.',label:'VIDEO DE HOY',duration:video.duration});
 // Desire is already the main practice on its own route. Add its existing sessions
 // to other routes only when this is an expressed secondary priority.
 const desireRelevant=!['desire','erection'].includes(c.primary)&&window.SPM_ERECTION_DAILY?.lowDesire(c);
 const desire=desireRelevant&&[5,15,22].includes(day)?window.SPM_ERECTION_DAILY?.desireActivity(day,'route'):null;
 if(desire&&!support.some(a=>a.kind==='desire'))extra.push(desire);
 const unique=new Map([...support,...extra].map(a=>[a.id,a]));
 return {main,support:[...unique.values()]};
}
window.SPM_DAILY_RESOURCES={compose,recoveryFor,videoFor,videoPlan,pelvicDays};
})();
