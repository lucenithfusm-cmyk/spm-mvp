const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
module.exports=function agendaHarness(){
const ROOT=path.resolve(__dirname,'../..');
const noop=()=>{};
const node=()=>({dataset:{},style:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},appendChild:noop,append:noop,prepend:noop,addEventListener:noop,setAttribute:noop,removeAttribute:noop,querySelector:()=>null,querySelectorAll:()=>[],remove:noop,replaceChildren:noop});
const document={readyState:'loading',head:node(),body:node(),documentElement:node(),createElement:node,querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,addEventListener:noop};
const storage={getItem:()=>null,setItem:noop,removeItem:noop};
let activeContext=null;
const sandbox={console,document,location:{search:'',pathname:'/premium-v2/live.html',href:'https://example.test/premium-v2/live.html'},localStorage:storage,sessionStorage:storage,MutationObserver:class{observe(){} disconnect(){}},IntersectionObserver:class{observe(){} disconnect(){} unobserve(){}},setTimeout:()=>0,setInterval:()=>0,clearTimeout:noop,clearInterval:noop,requestAnimationFrame:()=>0,addEventListener:noop,dispatchEvent:noop,Event:class{},CustomEvent:class{},URL,URLSearchParams,structuredClone,Date,Map,Set,Promise,performance:{now:()=>0},SPM_RESOURCE_CONTEXT:()=>activeContext};
sandbox.window=sandbox; sandbox.globalThis=sandbox;
const context=vm.createContext(sandbox);
const sources=[];
function load(file,transform){let code=fs.readFileSync(path.join(ROOT,file),'utf8');sources.push({file,sha256:crypto.createHash('sha256').update(code).digest('hex'),instrumented:!!transform}); if(transform)code=transform(code);vm.runInContext(code,context,{filename:file,timeout:2000});}
const scripts=[
'premium-v2/engine.js','premium-v2/health-intake-v2.js','premium-v2/modules.js','supabase/functions/_shared/assessment-policy.js','premium-v2/pelvic-guidance-v1.js','premium-v2/daily-support-plan-v1.js','premium-v2/spm-video-library.js','premium-v2/spm-resources-content.js','premium-v2/spm-resources.js','premium-v2/nutrition-daily-cards-v1.js','premium-v2/sleep-library-v1.js','premium-v2/wellness-daily-tip-v1.js','premium-v2/ejaculatory-control.js','premium-v2/erectile-library-v3.js','premium-v2/erectile-central-v3.js','premium-v2/pelvic-strength-readiness-v1.js','premium-v2/erection-daily-plan-v1.js','premium-v2/daily-resource-plan-v1.js','premium-v2/program-recovery-v1.js','premium-v2/program-checkpoint-v1.js','premium-v2/erection-ten-schedule-v1.js','premium-v2/erection-practice-v1.js','premium-v2/confianza-nuevas/activities.js','premium-v2/confianza-nuevas/day1.js','premium-v2/confianza-nuevas/screen.js','premium-v2/conexion-satisfaccion/guiones.js','premium-v2/conexion-satisfaccion/actividades.js','premium-v2/conexion-satisfaccion/pantalla.js','premium-v2/ep-bloque/screen.js'];
for(const f of scripts)load(f);

load('premium-v2/agenda-manifest-20261127.js');load('premium-v2/agenda-v2.js');load('premium-v2/daily-practice-v1.js');
const baseAnswers=Object.fromEntries(sandbox.ENGINE.assessment.questions.map(q=>[q.id,q.type==='boolean'?false:q.type.startsWith('scale5')?3:q.type==='text'?'Dato sintético':(q.options?.find(o=>['none','no','na','unsure'].includes(o.value))||q.options?.[0])?.value]));
baseAnswers.h_followup='none';baseAnswers.pf_awareness='unsure';baseAnswers.pf_tension=1;delete baseAnswers.h_medeffect;delete baseAnswers.h_mednames;delete baseAnswers.h_medchange;
const makeContext=(primary='erection',day=1,extra={})=>({userId:'qa-agenda-user',planId:'qa-agenda-plan',day,primary,secondary:null,motives:[primary],answers:{...baseAnswers},safety:'none',flags:[],completed:Array.from({length:day-1},(_,i)=>i+1),checkins:[],scheduleVersion:'spm-20261127-v1',...extra});
return {window:sandbox,context,makeContext,setContext:c=>{activeContext=c;},sources};
};
