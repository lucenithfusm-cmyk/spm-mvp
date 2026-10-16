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
function compose(main,support,c){
 if(!c||c.primary==='erection'||!videos[c.primary])return {main,support};
 const day=Number(c.day),extra=[],key=videos[c.primary][day],video=window.SPM_VIDEO_LIBRARY?.find(v=>v.key===key);
 if(video)extra.push({id:'route-video-'+key,kind:'video',videoKey:key,title:'Video · '+video.title,summary:video.desc+' Al terminar, anota una idea para tu proceso.',label:'VIDEO DE HOY',duration:video.duration});
 // Desire is already the main practice on its own route. Add its existing sessions
 // to other routes only when this is an expressed secondary priority.
 const desireRelevant=c.primary!=='desire'&&(c.secondary==='desire'||c.motives?.includes('desire'));
 const desire=desireRelevant?window.SPM_ERECTION_DAILY?.desireActivity(day,'route'):null;
 if(desire&&!support.some(a=>a.kind==='desire'))extra.push(desire);
 // The day-25 if/then worksheet keeps its place; the matching recovery story
 // must also be reachable on routes where it was only mentioned in text.
 if(day===25&&main.kind!=='recovery'&&!support.some(a=>a.kind==='recovery'))extra.push({id:'route-recovery-25',kind:'recovery',title:'Recuperación · prepararte para la próxima vez',summary:'Abre la historia de hoy y elige una idea para tu plan si-entonces, sin exigirte un resultado.',label:'RECUPERACIÓN · HISTORIA DE HOY'});
 const unique=new Map([...support,...extra].map(a=>[a.id,a]));
 return {main,support:[...unique.values()]};
}
window.SPM_DAILY_RESOURCES={compose};
})();
