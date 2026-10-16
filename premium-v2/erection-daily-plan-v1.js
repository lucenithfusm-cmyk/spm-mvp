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
const erectionDesire={"2": {"title": "Deseo · Tu patrón y tus contextos", "summary": "Completa el mapa de influencia 0–10."}, "5": {"title": "Deseo · Aceleradores y frenos", "summary": "Selecciona aceleradores y frenos y guarda sugerencias."}, "7": {"title": "Deseo · Síntesis semana 1", "summary": "Ordena tu lista de excitación (máx. 5) y elige foco."}, "10": {"title": "Deseo · Reactivación II: repertorio", "summary": "Prueba una idea nueva del repertorio y regístrala."}, "11": {"title": "Deseo · Si hoy no aparece el deseo", "summary": "Plan de recuperación: detener exigencia y elegir algo agradable."}, "12": {"title": "Deseo · Planifica tu ventana", "summary": "Diseña una ventana de activación con duración flexible."}, "15": {"title": "Deseo · Escalera de intimidad", "summary": "Elige el peldaño cómodo de hoy."}, "17": {"title": "Deseo · Ritmo y juego previo", "summary": "Explora ritmo; aumenta solo si hay interés, reduce con presión."}, "21": {"title": "Deseo · Revisión semana 3", "summary": "Revisa tu diario y escribe qué funcionó."}, "22": {"title": "Deseo · Tus mejores activadores", "summary": "Se eligen según tus registros, no al azar."}, "25": {"title": "Deseo · Plan si-entonces", "summary": "Escribe 3 planes \"si… entonces…\"."}, "26": {"title": "Deseo · Objetivos de continuidad", "summary": "Elige hasta 2 objetivos de continuidad (distinto del plan de 3 acciones)."}};
const desireBase=[2,5,10,12,15,17,22,26],desireExtra=[7,11,21,25];
function lowDesire(c){return c.secondary==='desire'||c.motives?.includes('desire')||[1,2].includes(Number(c.answers?.d_desire))||c.answers?.h_medeffect==='desire';}
function erectionDesireActivity(day,c){return desireBase.includes(day)||(lowDesire(c)&&desireExtra.includes(day))?{id:'de-desire-'+day,kind:'desire',...erectionDesire[day],label:'DESEO · ACTIVIDAD DE HOY'}:null;}
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
 if([7,14,21,28].includes(day))extra.push({id:'de-confidence-'+day,kind:'confidence',title:'Confianza · revisión de la semana '+Math.ceil(day/7),summary:'Recuerda una experiencia o habilidad de esta semana y registra la evidencia que te ayuda a confiar. Deja sin evaluar lo que no aplique; no necesitas provocar una respuesta sexual.',label:'CONFIANZA · EVIDENCIA PERSONAL'});
 if(videos[day]){
  const key=videos[day],v=window.SPM_VIDEO_LIBRARY?.find(x=>x.key===key);
  if(v)extra.push({id:'de-video-'+key,kind:'video',videoKey:key,title:'Video · '+v.title,summary:v.desc+' Al terminar, anota una idea para tu proceso.',label:'VIDEO DE HOY',duration:v.duration});
 }
 const scheduledDesire=erectionDesireActivity(day,c);
 if(scheduledDesire)extra.push(scheduledDesire);
 const unique=new Map([...support,...extra].map(a=>[a.id,a]));
 return {main,support:[...unique.values()]};
}
window.SPM_ERECTION_DAILY={compose,desireActivity};
})();
