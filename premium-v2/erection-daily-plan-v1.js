(()=>{'use strict';
// The erection route adds a concrete resource to its existing 28-day lesson.
// Breathing and sensate retain their shared cadence; EP never uses this composer.
const videos={1:'dr-performance-anxiety',2:'dr-vascular',7:'anticipatory-failure',9:'dr-metabolic',14:'performance-anxiety',18:'partner-communication',21:'dr-medications',28:'mental-preparation'};
// These are the same days and objectives already used by the Desire curriculum.
const desire={
 5:{title:'Deseo · mapa de aceleradores y frenos',summary:'En el programa de Deseo, identifica lo que facilita tu interés y lo que lo frena. Elige un cambio pequeño para tu contexto.'},
 15:{title:'Deseo · escalera de intimidad sin presión',summary:'Abre la práctica de este día y elige un nivel cómodo de cercanía. La participación de la pareja y cualquier progresión son opcionales.'},
 22:{title:'Deseo · tus mejores activadores',summary:'Repite la práctica de deseo seleccionada a partir de tu perfil y tus registros. Observa qué sigue ayudándote, sin exigirte un resultado.'}
};
const reflective=new Set(['baseline','contexts','stimuli','patternReview','pattern','confidence','branch','partner','planner','vascular','best','flexibility','progress','ifthen','nextCycle']);
function desireActivity(day,prefix='de'){return desire[day]?{id:prefix+'-desire-'+day,kind:'desire',...desire[day],label:'DESEO · ACTIVIDAD DE HOY'}:null;}
function compose(main,support,c,level){
 if(c.primary!=='erection')return {main,support};
 const day=Number(c.day),spec=window.SPM_DE_LIBRARY?.days?.()[day]||window.SPM_DE_LIBRARY_V3?.days?.[day];
 main={...main,label:'ERECCIÓN Y FIRMEZA · PRÁCTICA PRINCIPAL'};
 // Only retrospective/educational work is accessible under non-urgent review.
 // Do not open the full exercise modal or erase the clinical flag in this mode.
 if(level==='review'&&spec&&reflective.has(spec.tool))main={...main,kind:'worksheet',title:spec.title,summary:'Revisa el contenido educativo y registra lo que has observado. Las prácticas físicas mantienen su indicación de seguridad.',lesson:{title_es:spec.title,learn_es:spec.learn,practice_es:'A partir de lo que ya has vivido y del contenido anterior, escribe qué reconoces en ti y qué te gustaría aclarar. No realices una prueba física para completar este registro.',measure_es:spec.measure,apply_es:'Conserva tu reflexión para el seguimiento. Esta actividad educativa no sustituye la revisión profesional ni autoriza las prácticas que siguen en pausa.',interaction:'review'}};
 const extra=[];
 if(videos[day]){
  const key=videos[day],v=window.SPM_VIDEO_LIBRARY?.find(x=>x.key===key);
  if(v)extra.push({id:'de-video-'+key,kind:'video',videoKey:key,title:'Video · '+v.title,summary:v.desc+' Al terminar, anota una idea para tu proceso.',label:'VIDEO DE HOY',duration:v.duration});
 }
 if(desire[day])extra.push(desireActivity(day));
 if(day===6)extra.push({id:'support-pelvic',kind:'pelvic',title:'Piso pélvico · práctica guiada de conciencia y relajación',summary:'Abre el laboratorio para realizar la práctica asignada a este día. La adaptación del programa decide qué es adecuado para tu perfil.',optional:true,optionalLabel:'PISO PÉLVICO · SEGÚN TU PERFIL'});
 if([11,25].includes(day))extra.push({id:'de-recovery-'+day,kind:'recovery',title:day===11?'Recuperación · una pausa sin alarma':'Recuperación · prepararte para la próxima vez',summary:'Abre la historia de hoy, recorre sus escenas y elige una idea para tu plan de recuperación.',label:'RECUPERACIÓN · HISTORIA DE HOY'});
 const unique=new Map([...support,...extra].map(a=>[a.id,a]));
 return {main,support:[...unique.values()]};
}
window.SPM_ERECTION_DAILY={compose,desireActivity};
})();
