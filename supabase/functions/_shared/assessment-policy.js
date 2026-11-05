(function(root){
'use strict';
// Shared data validation; the questions and clinical flags remain the approved catalog.
const motives=['erection','ejaculation','desire','confidence','wellbeing','optimization'];
function visible(q,a){return !q.show_if||a[q.show_if.id]===q.show_if.equals;}
function valid(q,v){
 if(q.type==='boolean')return typeof v==='boolean';
 if(q.type==='text')return typeof v==='string'&&v.trim().length>0&&v.length<=2000;
 if(q.type.startsWith('scale5'))return Number.isInteger(v)&&v>=1&&v<=5;
 return q.options?.some(o=>o.value===v)||false;
}
function queue(questions,selected){
 const sections=new Set(['goal','lifestyle','health','pelvic_floor','safety']);
 selected.filter(k=>motives.includes(k)&&k!=='optimization').forEach(k=>sections.add(k));
 if(selected.includes('optimization'))['confidence','wellbeing','desire'].forEach(k=>sections.add(k));
 return questions.filter(q=>sections.has(q.section));
}
function missing(questions,selected,answers){return queue(questions,selected).filter(q=>visible(q,answers)&&!valid(q,answers[q.id]));}
function score(questions,selected,answers){
 const qs=queue(questions,selected).filter(q=>visible(q,answers)),domains={};
 for(const q of qs){if(!q.domain||!valid(q,answers[q.id]))continue;let v=Number(answers[q.id]);if(!Number.isFinite(v))continue;if(q.type==='scale5_reverse')v=6-v;const w=q.weight||1;domains[q.domain]??={sum:0,w:0};domains[q.domain].sum+=(v-1)*25*w;domains[q.domain].w+=w;}
 const scores=Object.fromEntries(Object.entries(domains).map(([k,v])=>[k,Math.round(v.sum/v.w)]));
 const core=['erection','ejaculation','desire','confidence','wellbeing','lifestyle'].filter(k=>scores[k]!=null),ranked=[...core].sort((a,b)=>scores[a]-scores[b]);
 let primary=ranked[0]||'lifestyle';if(selected.includes('optimization')&&scores[primary]>65)primary='lifestyle';
 const urgent=qs.filter(q=>q.safety==='urgent'&&answers[q.id]===true).map(q=>q.id),review=qs.filter(q=>q.safety==='review'&&answers[q.id]===true).map(q=>q.id);
 return {scores,primary,secondary:ranked[1]||null,total:Math.round(core.reduce((sum,k)=>sum+scores[k],0)/(core.length||1)),urgent,review};
}
function fillMissing(questions,selected,original,patch){
 if(!patch||typeof patch!=='object'||Array.isArray(patch)||Object.keys(patch).length>100)throw Error('Invalid answers');
 const next={...original};const qs=queue(questions,selected);
 // Fill parents first, so conditional follow-up questions can be completed in one form.
 for(const q of qs){if(!Object.hasOwn(patch,q.id))continue;
  if(valid(q,original[q.id])||!visible(q,next)||!valid(q,patch[q.id]))throw Error('Only missing answers may be completed');
  next[q.id]=patch[q.id];
 }
 if(Object.keys(patch).some(k=>!qs.some(q=>q.id===k)))throw Error('Unknown question');
 return next;
}
function preserveSafety(computed,previous={}){
 const flags=[...new Set([...(previous.safety_flags||[]),...computed.urgent,...computed.review])];
 const level=previous.safety_level==='urgent'||computed.urgent.length?'urgent':previous.safety_level==='review'||flags.length?'review':'none';
 return {safety_level:level,safety_flags:flags};
}
const api={motives,valid,visible,queue,missing,score,fillMissing,preserveSafety};root.SPM_ASSESSMENT_POLICY=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
