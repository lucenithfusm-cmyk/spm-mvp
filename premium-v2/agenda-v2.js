/* SPM 27/11/2026. A versioned selection of existing activities, never a second curriculum. */
(()=>{'use strict';
const VERSION='spm-20261127-v1',LEGACY_VERSION='legacy';
const aliases={anxiety:'confidence',mixed:'confidence',optimization:'wellbeing'};
const routeOf=c=>aliases[c?.primary]||c?.primary;
const versionOf=c=>c?.scheduleVersion||c?.schedule_version||LEGACY_VERSION;
const scopeOf=c=>c?.userId&&c?.planId?`${c.userId}:${c.planId}`:'';
const sourceDay=a=>Number(a?.sourceDay||a?.day);
const requests=new Map();let legacy=null;
function lowDesire(c){return c?.secondary==='desire'||c?.motives?.includes('desire')||window.SPM_ERECTION_DAILY?.lowDesire?.(c)===true;}
function register(composer){legacy=composer;}
function error(code,reason,c){return {ok:false,code,reason,version:versionOf(c),route:routeOf(c),day:Number(c?.day),assignments:[],required:[],resources:[]};}
function requested(c,scenario){return c?.recoveryCase===scenario||c?.recoveryRequests?.includes(scenario)||requests.get(scopeOf(c)+':'+c?.day)?.has(scenario)===true;}
function requestRecovery(c,scenario){if(!scopeOf(c)||typeof scenario!=='string')return false;const key=scopeOf(c)+':'+c.day;const selected=requests.get(key)||new Set();selected.add(scenario);requests.set(key,selected);return true;}
function selection(c){
 const manifest=window.SPM_AGENDA_MANIFEST,route=routeOf(c),day=Number(c?.day);
 const mixed=lowDesire(c)&&manifest?.variants?.[route+'-desire'];
 return (mixed||manifest?.routes?.[route])?.[day]||null;
}
function hydrate(spec,c){
 if(!spec)return null;
 // Select source content without changing the signed-in plan/day. Clinical eligibility
 // is evaluated separately against c; the neutral source context is not a permission.
 const source={...c,userId:'spm-content-catalog',planId:spec.sourceRoute,answers:{...c.answers,pf_awareness:'unsure',pf_tension:1},primary:spec.sourceRoute,day:spec.sourceDay,secondary:null,motives:[spec.sourceRoute],safety:'none',flags:[],checkins:[],completed:[],scheduleVersion:LEGACY_VERSION};
 let item=legacy(source).find(a=>a.id===spec.sourceActivityId);
 if(spec.kind==='pelvic'&&spec.pelvicIntent==='scheduled')item={kind:'pelvic',pelvicIntent:'scheduled',pelvicPreference:'classic',title:spec.title,summary:'Sesión opcional de contracción y relajación según tu preparación guardada.'};
 if(!item)throw Error('Falta el contenido '+spec.catalogCode);
 if(spec.confidenceDay&&!item.confidenceDay)throw Error('No se cargó la pantalla de Confianza '+spec.confidenceDay);
 if(spec.kind==='connection'&&!window.SPM_CONNECTION)throw Error('No se cargó Conexión');
 if(spec.kind==='sensate'&&!window.SPM_DAILY_SUPPORT)throw Error('No se cargó Focalización');
 const identity={...spec,scheduleVersion:VERSION,scheduledDay:Number(c.day),sourceDay:Number(spec.sourceDay),contentVersion:spec.contentVersion};
 // source ID, content ID and assignment ID remain independently available even
 // where the legacy renderer still calls its daily slot "main".
 return {...item,...identity,title:spec.title,connectionDay:spec.connectionDay||(spec.kind==='connection'?spec.sourceDay:undefined),optional:spec.optional===true,
  label:spec.role==='primary'?'TU PRÁCTICA PRINCIPAL':spec.role==='support'?'UN APOYO SEGÚN TU NECESIDAD':'RECURSO OPCIONAL',
  optionalLabel:spec.role==='primary'?'PRÁCTICA PRINCIPAL · VOLUNTARIA':'APOYO · VOLUNTARIO',
  integratedExplanations:[]};
}
function resolve(c){
 if(!c||!scopeOf(c)||!Number.isInteger(Number(c.day))||Number(c.day)<1||Number(c.day)>28)return error('context-invalid','No pudimos identificar tu plan y su jornada.',c);
 if(!window.SPM_MODULES?.days?.find(x=>Number(x.d)===Number(c.day)))return error('catalog-unavailable','No se pudo cargar el catálogo de actividades. Recarga para reintentar.',c);
 if(!legacy)return error('composer-unavailable','No se pudo preparar la agenda. Recarga para reintentar.',c);
 const catalogs=[window.SPM_DAILY_SUPPORT?.assignments,window.SPM_DAILY_RESOURCES?.compose,window.SPM_WELLNESS_DAILY_TIP_V1?.tipsFor,window.SPM_PROGRAM_CHECKPOINT?.assignment,window.SPM_CONFIDENCE_TOUCH?.compose,window.SPM_CONNECTION?.compose,window.SPM_ERECTION_DAILY?.compose,window.SPM_ERECTION_10_SCHEDULE?.slot,window.SPM_PROGRAM_RECOVERY?.pending,window.SPM_PROGRAM_RECOVERY?.blocks,window.SPM_ASSESSMENT_POLICY?.missing];
 if(catalogs.some(fn=>typeof fn!=='function')||!window.ENGINE?.assessment?.questions?.length||!window.SPM_VIDEO_LIBRARY?.length)return error('catalog-unavailable','No se pudo cargar una parte de tu agenda. Recarga para reintentar.',c);
 const version=versionOf(c);
 if(version===LEGACY_VERSION){
  const all=legacy(c);
  if(!all.length)return error('catalog-unavailable','No se pudo cargar tu agenda anterior. Recarga para reintentar.',c);
  return {ok:true,version,route:routeOf(c),day:Number(c.day),assignments:all,required:all.filter(a=>!a.optional),resources:[],conditionalSupport:null};
 }
 if(version!==VERSION)return error('version-unknown','Esta versión del plan necesita actualizarse antes de continuar. Tus registros se conservan.',c);
 if(window.SPM_AGENDA_MANIFEST?.version!==VERSION)return error('manifest-unavailable','No se cargó la versión de tu agenda. Recarga para reintentar.',c);
 const selected=selection(c);if(!selected?.primary)return error('day-unavailable','La jornada no está definida en esta versión de tu plan.',c);
 try{
  const main=hydrate(selected.primary,c),support=hydrate(selected.support,c),resources=selected.resources.filter(a=>a.condition!=='strength'||window.SPM_DAILY_RESOURCES?.strengthEligible?.(c)===true).map(a=>hydrate(a,c));
  const eligibleSupport=!support||support.condition!=='recovery-request'||requested(c,support.scenario);
  const shown=[main,...(support&&eligibleSupport?[support]:[])];
  for(const spec of selected.explanations){const host=spec.hostRole==='primary'?main:support;if(host)host.integratedExplanations.push(hydrate(spec,c));}
  const visibleIds=new Set(shown.map(a=>a.contentId));
  const compact=resources.filter(a=>!visibleIds.has(a.contentId));
  const assignments=[...shown,...compact];
  if(new Set(assignments.map(a=>a.id)).size!==assignments.length||new Set(assignments.map(a=>a.contentId)).size!==assignments.length)throw Error('Hay contenido duplicado en esta jornada.');
  return {ok:true,version,route:routeOf(c),day:Number(c.day),assignments,required:shown.filter(a=>!a.optional),resources:compact,conditionalSupport:support&&!eligibleSupport?support:null};
 }catch(e){return error('content-unavailable','No se pudo preparar una actividad de esta jornada. Recarga para reintentar.',c);}
}
function metadata(a){return a?.scheduleVersion===VERSION?{scheduleVersion:VERSION,contentVersion:a.contentVersion,contentId:a.contentId,assignmentId:a.assignmentId,sourceActivityId:a.sourceActivityId,sourceDay:a.sourceDay,scheduledDay:a.scheduledDay,role:a.role}:{};}
function matches(a,record){return a?.scheduleVersion!==VERSION||record?.scheduleVersion===VERSION&&record?.assignmentId===a.assignmentId&&record?.contentId===a.contentId&&record?.contentVersion===a.contentVersion&&record?.scheduledDay===a.scheduledDay;}
window.SPM_AGENDA=Object.freeze({VERSION,LEGACY_VERSION,register,resolve,selection,versionOf,routeOf,sourceDay,metadata,matches,requestRecovery,requested});
})();
