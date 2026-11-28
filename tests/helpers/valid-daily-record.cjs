// Synthetic QA records only. Values are selected from the exported source schemas.
// The exporter and agenda tests verify these against the real browser validators.
const schema=require('../../docs/qa/spm-record-validation-20261127.json');
function validDailyRecord(item,scheduledDay,{omittedDE01=false}={}){
 const sourceDay=Number(item.sourceDay||scheduledDay),e=schema.erection.enums;
 const r={completed:true,activityStatus:'completed',confirmed:true,activityKind:item.kind,day:scheduledDay,
  ...(item.scenario?{scenario:item.scenario}:{}),...(item.assignmentId?{scheduleVersion:'spm-20261127-v1',assignmentId:item.assignmentId,contentId:item.contentId,contentVersion:item.contentVersion,scheduledDay,sourceDay,contentDay:sourceDay}:{} )};
 if(item.kind==='erection'&&item.erectionLesson){
  const lesson=Number(item.erectionLesson);Object.assign(r,{erectionPracticeVersion:1,erectionLesson:lesson,day:sourceDay,anxiety:null,confidence:null});
  const choose=name=>e[name][0];
  const values={
   1:{ehs:null,ehsEvaluable:omittedDE01?null:false,ehsOmitted:omittedDE01,ehsStatus:omittedDE01?'omitted':'not_evaluable',completionAccepted:true,attentionPracticeOutcome:omittedDE01?'omitted':'maintained',attentionPracticeCompleted:!omittedDE01,completed:!omittedDE01,activityStatus:omittedDE01?'omitted':'completed'},
   2:{contexts:Object.fromEntries(e.contexts.map(k=>[k,'not_evaluable'])),responseAspect:'not_evaluable'},
   3:{tensionAreas:['none'],sensoryAnchor:choose('anchors'),finalFeeling:'',seconds:null},
   4:{attentionSense:choose('senses'),practiceExperience:choose('experiences'),finalFeeling:'',seconds:null},
   5:{erectionFacilitators:['unknown'],erectionInhibitors:['unknown'],microAdjustment:choose('adjustments')},
   6:{erectionStimuli:[choose('stimuli')]},
   7:{erectionProgress:['empezando'],erectionConfidenceStatement:choose('confidenceIdeas'),erectionNextStep:choose('nextSteps')},
   8:{erectionFavorablePositions:['no_evaluable'],erectionLessFavorablePosition:null,erectionChosenStrategy:choose('positionStrategies')},
   9:{erectionResponseStrategy:choose('responseStrategies'),erectionPlanStepsHeard:[]},
   10:{warningSignals:['none'],preventionStrategy:choose('preventionStrategies')}
  };Object.assign(r,values[lesson]);
 }
 if(item.kind==='connection'){
  const day=Number(item.connectionDay||sourceDay),a=schema.connection.days[day];if(!a)throw Error('No source Connection schema for '+day);
  const answers={};if(a.maxTopics)answers.topics=a.topics.slice(0,a.maxTopics);
  for(const f of a.fields){if(f.optional||f.when&&answers.mode!==f.when||answers.mode==='No aplica'&&f.key!=='mode')continue;answers[f.key]=f.values==='scale'?null:f.values==='chosen'?answers.topics?.[0]:Array.isArray(f.values)?(f.key==='mode'&&f.values.includes('No aplica')?'No aplica':f.values[0]):'Dato sintético QA';}
  Object.assign(r,{connectionDay:day,answers});
 }
 if(item.kind==='program-checkpoint')Object.assign(r,{checkpointVersion:2,scaleMax:4,milestone:Number(item.sourceDay||scheduledDay)===1?1:scheduledDay===28?28:14,submittedDay:scheduledDay,metrics:Object.fromEntries(schema.checkpoint.metrics.map(k=>[k,null])),reflection:'',continuity:''});
 if(item.kind==='pelvic'&&item.pelvicIntent)r.pelvicResult={...schema.pelvic[item.pelvicIntent],completed:true,day:scheduledDay,activityId:item.id,intent:item.pelvicIntent};
 if(item.tip?.id||item.wellnessId||item.tipId)r.tipId=item.tip?.id||item.wellnessId||item.tipId;
 return r;
}
module.exports={validDailyRecord,schema};
