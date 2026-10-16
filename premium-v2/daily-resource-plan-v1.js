(()=>{'use strict';
// Existing lessons keep their day and identity. Only complementary resources are added.
// Eight short video slots alternate with the shared breathing/sensate calendar.
const confidence={1:'performance-anxiety',2:'anxiety-regulation',7:'anticipatory-failure',9:'sensory-focus',14:'mental-preparation',18:'partner-communication',21:'performance-anxiety',28:'mental-preparation'};
const wellbeing={1:'dr-metabolic',2:'dr-vascular',7:'anxiety-regulation',9:'sensory-focus',14:'performance-anxiety',18:'partner-communication',21:'dr-medications',28:'mental-preparation'};
const videos={
 ejaculation:{...confidence,21:'dr-medications'},
 desire:{1:'dr-low-desire',2:'dr-metabolic',7:'anticipatory-failure',9:'sensory-focus',14:'performance-anxiety',18:'partner-communication',21:'dr-medications',28:'mental-preparation'},
 confidence,anxiety:confidence,wellbeing,lifestyle:wellbeing,optimization:wellbeing,mixed:confidence
};
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
  // Two Lab sessions per week, never on EP's 1/3/5 training days.
  support=support.filter(a=>a.kind!=='pelvic');
  const slot=([2,6].indexOf((day-1)%7+1));
  if(slot>=0){
   const pelvic={kind:'pelvic',title:`Piso pélvico · semana ${Math.ceil(day/7)} · sesión ${slot+1}/2`,summary:'Realiza la sesión del laboratorio adaptada a tu perfil: conciencia, relajación o coordinación según tu evolución. Respeta sus indicaciones; no añadas fuerza por tu cuenta.',label:'PISO PÉLVICO · SESIÓN PROGRAMADA'};
   if(main.kind==='pelvic'||(c.primary==='erection'&&day===6))main={...main,...pelvic};
   else support.push({...pelvic,id:'support-pelvic',optional:true,optionalLabel:'SESIÓN PROGRAMADA · SEGÚN TU PERFIL'});
  }
 }
 if(story){
  support=support.filter(a=>a.kind!=='recovery');
  const activity={kind:'recovery',scenario:story.scenario,title:`Recuperación · historia ${story.index}/7 · ${story.title}`,summary:'Mira la historieta de hoy y recorre sus escenas. Elige una idea para manejar la situación sin presión; no necesitas reproducirla físicamente.',label:'RECUPERACIÓN · HISTORIA DE HOY'};
  if(main.kind==='recovery')main={...main,...activity};else support.push({...activity,id:'recovery-'+story.scenario});
 }
 return {main,support};
}
function compose(main,support,c){
 if(!c)return {main,support};
 ({main,support}=cadence(main,support,c));
 if(c.primary==='erection'||!videos[c.primary])return {main,support};
 const day=Number(c.day),extra=[],key=videos[c.primary][day],video=window.SPM_VIDEO_LIBRARY?.find(v=>v.key===key);
 if(video)extra.push({id:'route-video-'+key,kind:'video',videoKey:key,title:'Video · '+video.title,summary:video.desc+' Al terminar, anota una idea para tu proceso.',label:'VIDEO DE HOY',duration:video.duration});
 // Desire is already the main practice on its own route. Add its existing sessions
 // to other routes only when this is an expressed secondary priority.
 const desireRelevant=c.primary!=='desire'&&(c.secondary==='desire'||c.motives?.includes('desire'));
 const desire=desireRelevant?window.SPM_ERECTION_DAILY?.desireActivity(day,'route'):null;
 if(desire&&!support.some(a=>a.kind==='desire'))extra.push(desire);
 const unique=new Map([...support,...extra].map(a=>[a.id,a]));
 return {main,support:[...unique.values()]};
}
window.SPM_DAILY_RESOURCES={compose,recoveryFor};
})();
