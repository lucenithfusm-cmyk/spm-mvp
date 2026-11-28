// Synthetic program context. These tests never connect to a patient account.
const scripts=['device-voice-v1.js','engine.js','modules.js','practice-audio-v1.js','wellness-daily-tip-v1.js','daily-practice-v1.js'];
function bootstrap({day=2,primary='lifestyle',initialRecords={}}={}){
 const w=window;
 const c={userId:'movement-qa',planId:'movement-plan',primary,day,secondary:null,motives:[primary],answers:{},safety:'none',flags:[],checkins:[],completed:[]};
 const qa=w.SPM_MOVEMENT_QA={context:c,writes:[],opens:[],spoken:[],utterances:[],cancels:0,failSave:false};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLMediaElement.prototype.pause=function(){};
 w.HTMLMediaElement.prototype.load=function(){};
 w.SPM_RESOURCE_CONTEXT=()=>c;
 w.SPM_DAILY_RECORDS={read:async()=>JSON.parse(JSON.stringify(initialRecords)),save:async(...args)=>{if(qa.failSave)throw Error('Synthetic save failure');qa.writes.push(args);}};
 w.SPM_RESOURCES={restricted:context=>context.safety!=='none'||context.flags.length>0,open:(...args)=>qa.opens.push(args)};
 Object.defineProperty(w,'speechSynthesis',{configurable:true,value:{getVoices:()=>[],speak:utterance=>{qa.spoken.push(utterance.text);qa.utterances.push(utterance);utterance.onstart?.();},cancel:()=>{qa.cancels++;}}});
 w.SpeechSynthesisUtterance=function(text){this.text=text;};
}
module.exports={scripts,bootstrap};
