(()=>{
'use strict';
const KEY='spm_assessment_cadence_v1';
const MICRO_SLOTS={desire:[6,12,19,24],confidence:[8,13,18,25]};
const BLACKOUT=new Set([1,2,3,4,14,28]);
const MAX_MICRO_QUESTIONS=3;
const MIN_DOMAIN_GAP_DAYS=3;
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{"events":[]}')}catch(_){return{events:[]}}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
function history(){try{return JSON.parse(localStorage.getItem('spm_multidomain_history_v1')||'[]')}catch(_){return[]}}
function relevantPracticeCount(domain,day){return history().filter(x=>x.domain===domain&&Number(x.day)<Number(day)).length}
function lastDomainDay(domain){const e=load().events.filter(x=>x.domain===domain).map(x=>Number(x.day)||0);return e.length?Math.max(...e):0}
function sameDayReserved(day){return load().events.some(x=>Number(x.day)===Number(day))}
function isCandidate(day,domain){return (MICRO_SLOTS[domain]||[]).includes(Number(day))}
function canRunMicro(opts){
 const day=Number(opts.day),domain=opts.domain,questions=Number(opts.questions||2);
 if(!domain||BLACKOUT.has(day)||questions>MAX_MICRO_QUESTIONS)return false;
 if(!isCandidate(day,domain)||sameDayReserved(day))return false;
 if(day-lastDomainDay(domain)<MIN_DOMAIN_GAP_DAYS)return false;
 if(relevantPracticeCount(domain,day)<2)return false;
 return true;
}
function reserve(opts){
 const day=Number(opts.day),domain=opts.domain,kind=opts.kind||'micro',questions=Number(opts.questions||2);
 if(kind==='micro'&&!canRunMicro({day,domain,questions}))return{ok:false,reason:'cadence'};
 const s=load();s.events=s.events.filter(x=>!(Number(x.day)===day&&x.domain===domain));
 s.events.push({day,domain,kind,questions,date:new Date().toISOString()});save(s);return{ok:true};
}
function modeFor(opts){
 const origin=opts.origin||'dailyPlan',day=Number(opts.day),domain=opts.domain;
 if(origin==='lab')return'full-lab';
 if(day===14)return'midpoint-core';
 if(day===28)return'final-core';
 if(origin==='dailyPlan'&&canRunMicro({day,domain,questions:2}))return'micro';
 return'practice-first';
}
window.SPM_ASSESSMENT_CADENCE_V1={
 MICRO_SLOTS,BLACKOUT,MAX_MICRO_QUESTIONS,MIN_DOMAIN_GAP_DAYS,canRunMicro,reserve,modeFor,
 policy:{
  initial:'La evaluación completa ocurre antes del Día 1.',
  day1:'No repetir evaluación; empezar con contenido y práctica.',
  daily:'Priorizar actividades. Los micro-checks aparecen solo si pueden cambiar el plan.',
  collision:'Máximo un bloque de evaluación por día. Deseo y confianza nunca se evalúan el mismo día.',
  checkpoints:'Día 14 y Día 28 usan un checkpoint central; no se apilan evaluaciones completas de módulos.'
 }
};
})();