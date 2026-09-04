(()=>{
'use strict';
const E=window.ENGINE;
if(!E?.assessment?.questions||window.SPM_HEALTH_INTAKE_V2)return;
const q=E.assessment.questions;
const removeIds=new Set(['h_meds','h_mednames','h_medchange','h_medeffect','h_followup']);
const first=q.findIndex(x=>removeIds.has(x.id));
const kept=q.filter(x=>!removeIds.has(x.id));
const HEALTH=[
 {id:'h_has_condition',type:'boolean',section:'health',prompt_es:'¿Tienes actualmente alguna condición de salud o enfermedad diagnosticada?',prompt_en:'Do you currently have any diagnosed health condition or disease?'},
 {id:'h_control_status',type:'single',section:'health',show_if:{id:'h_has_condition',equals:true},prompt_es:'En términos generales, ¿cómo está actualmente esa condición de salud?',prompt_en:'Overall, how well controlled is that health condition?',options:[{value:'controlled',es:'Está bien controlada y tengo seguimiento',en:'It is well controlled and I have follow-up'},{value:'partial',es:'Está parcialmente controlada',en:'It is partially controlled'},{value:'uncontrolled',es:'No está bien controlada actualmente',en:'It is not well controlled currently'},{value:'unsure',es:'No estoy seguro de qué tan controlada está',en:'I am not sure how well controlled it is'}]},
 {id:'h_condition_names',type:'text',section:'health',show_if:{id:'h_has_condition',equals:true},prompt_es:'¿Qué condición o condiciones de salud tienes?',prompt_en:'What health condition or conditions do you have?',placeholder_es:'Ejemplo: hipertensión, diabetes, colesterol alto, ansiedad, enfermedad prostática…'},
 {id:'h_cv',type:'boolean',section:'health',show_if:{id:'h_has_condition',equals:true},prompt_es:'¿Alguna de tus condiciones es cardiovascular, como hipertensión, enfermedad coronaria, arritmia o enfermedad vascular?',prompt_en:'Is any of your conditions cardiovascular, such as hypertension, coronary disease, arrhythmia, or vascular disease?'},
 {id:'h_metabolic',type:'boolean',section:'health',show_if:{id:'h_has_condition',equals:true},prompt_es:'¿Tienes diabetes, prediabetes, colesterol o triglicéridos altos, sobrepeso u otra condición metabólica?',prompt_en:'Do you have diabetes, prediabetes, high cholesterol or triglycerides, overweight, or another metabolic condition?'},
 {id:'h_hormonal',type:'boolean',section:'health',show_if:{id:'h_has_condition',equals:true},prompt_es:'¿Tienes alguna condición hormonal o endocrina diagnosticada, por ejemplo alteraciones de testosterona, tiroides o prolactina?',prompt_en:'Do you have a diagnosed hormonal or endocrine condition, for example involving testosterone, thyroid, or prolactin?'},
 {id:'h_urologic',type:'boolean',section:'health',show_if:{id:'h_has_condition',equals:true},prompt_es:'¿Tienes alguna condición urológica o prostática diagnosticada?',prompt_en:'Do you have a diagnosed urologic or prostate condition?'},
 {id:'h_mental',type:'boolean',section:'health',show_if:{id:'h_has_condition',equals:true},prompt_es:'¿Tienes ansiedad, depresión u otra condición de salud mental diagnosticada que pueda estar afectando tu bienestar o tu vida sexual?',prompt_en:'Do you have diagnosed anxiety, depression, or another mental health condition that may be affecting your wellbeing or sexual life?'},
 {id:'h_cv_event',type:'boolean',section:'health',show_if:{id:'h_has_condition',equals:true},prompt_es:'¿Has tenido un infarto, angina, stent, cirugía cardíaca, accidente cerebrovascular u otro evento cardiovascular importante?',prompt_en:'Have you had a heart attack, angina, stent, cardiac surgery, stroke, or another major cardiovascular event?',safety:'review'},
 {id:'h_meds',type:'boolean',section:'health',prompt_es:'¿Tomas actualmente algún medicamento de forma regular o frecuente?',prompt_en:'Do you currently take any medication regularly or frequently?'},
 {id:'h_mednames',type:'text',section:'health',show_if:{id:'h_meds',equals:true},prompt_es:'¿Qué medicamento(s) tomas actualmente?',prompt_en:'What medication(s) are you currently taking?',placeholder_es:'Escribe los nombres si los recuerdas. No suspendas ni cambies medicamentos por tu cuenta.'},
 {id:'h_medchange',type:'single',section:'health',show_if:{id:'h_meds',equals:true},prompt_es:'¿Has notado algún cambio en tu función sexual desde que empezaste alguno de estos medicamentos o desde que cambiaron su dosis?',prompt_en:'Have you noticed any change in sexual function since starting any of these medications or changing their dose?',options:[{value:'yes',es:'Sí',en:'Yes'},{value:'no',es:'No',en:'No'},{value:'unsure',es:'No estoy seguro',en:'I am not sure'},{value:'na',es:'No aplica',en:'Not applicable'}]},
 {id:'h_medeffect',type:'single',section:'health',show_if:{id:'h_medchange',equals:'yes'},prompt_es:'¿Qué cambio has notado principalmente?',prompt_en:'What change have you mainly noticed?',options:[{value:'desire',es:'Menor deseo sexual',en:'Lower sexual desire'},{value:'erection',es:'Dificultad para lograr o mantener la erección',en:'Difficulty getting or maintaining an erection'},{value:'ejaculation',es:'Cambios en la eyaculación',en:'Changes in ejaculation'},{value:'orgasm',es:'Dificultad para llegar al orgasmo',en:'Difficulty reaching orgasm'},{value:'other',es:'Otro cambio',en:'Another change'}]}
];
const insertAt=Math.max(0,first);
kept.splice(insertAt,0,...HEALTH);
E.assessment.questions=kept;

const byPrompt=new Map(HEALTH.map(x=>[x.prompt_es,x]));
function userKey(){const u=(document.getElementById('who')?.textContent||'anon').trim().toLowerCase();return 'spm_health_profile_v2_'+u.replace(/[^a-z0-9@._-]/g,'_')}
function load(){try{return JSON.parse(localStorage.getItem(userKey())||'{}')}catch(e){return {}}}
function save(v){try{localStorage.setItem(userKey(),JSON.stringify(v))}catch(e){}}
function currentQuestion(){const p=document.querySelector('#qbox .qtitle')?.textContent?.trim();return p?byPrompt.get(p):null}
function optionValue(question,label){if(question.type==='boolean')return /^sí$/i.test(label.trim());const o=(question.options||[]).find(x=>x.es===label.trim());return o?o.value:label.trim()}

document.addEventListener('click',e=>{
 const opt=e.target.closest('#qbox .opt');
 if(opt){const cq=currentQuestion();if(cq){const label=opt.textContent.trim(),h=load();h[cq.id]=optionValue(cq,label);save(h)}}
 if(e.target.closest('#navMap')||e.target.closest('#goMap'))setTimeout(decorateMap,120);
 if(e.target.closest('#qNext'))setTimeout(decorateMap,700);
});
document.addEventListener('input',e=>{
 if(!e.target.matches('#qbox textarea.assessmentText'))return;
 const cq=currentQuestion();if(!cq)return;const h=load();h[cq.id]=e.target.value;save(h);
});

function educationText(h){
 const parts=[];
 if(h.h_cv)parts.push('La salud cardiovascular influye en la circulación y puede relacionarse con cambios en la calidad de la erección.');
 if(h.h_metabolic)parts.push('La diabetes, el exceso de peso y las alteraciones de colesterol o triglicéridos pueden afectar progresivamente la salud vascular y sexual.');
 if(h.h_hormonal)parts.push('Las condiciones hormonales pueden influir en deseo, energía y respuesta sexual y conviene mantener su seguimiento médico.');
 if(h.h_mental)parts.push('La ansiedad, la depresión y el estrés pueden modificar deseo, excitación, erección y control sexual.');
 if(h.h_urologic)parts.push('Las condiciones urológicas o prostáticas pueden modificar la experiencia sexual y deben mantenerse bajo seguimiento profesional.');
 if(!parts.length)parts.push('Algunas condiciones de salud pueden influir en la función sexual, por lo que su control forma parte del cuidado integral.');
 if(h.h_control_status==='uncontrolled'||h.h_control_status==='partial')parts.push('Como indicas que el control no es óptimo, SPM priorizará educación en hábitos saludables y te recordará mantener seguimiento médico.');
 parts.push('SPM no modifica tratamientos ni reemplaza una valoración médica. No suspendas medicamentos por tu cuenta.');
 return parts.join(' ');
}
function speak(text){if(!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='es-CO';u.rate=.94;const vs=speechSynthesis.getVoices(),v=vs.find(x=>/es[-_]CO/i.test(x.lang))||vs.find(x=>/^es/i.test(x.lang));if(v)u.voice=v;speechSynthesis.speak(u)}
function decorateMap(){
 const map=document.getElementById('map');if(!map?.classList.contains('on'))return;
 const h=load(),existing=document.getElementById('spmHealthEducation');
 if(h.h_has_condition!==true){existing?.remove();return}
 const target=map.querySelector('.mapHero');if(!target)return;
 const text=educationText(h),status=h.h_control_status==='controlled'?'CONDICIÓN REPORTADA · CONTROLADA':h.h_control_status==='uncontrolled'?'CONDICIÓN REPORTADA · REQUIERE MEJOR CONTROL':'SALUD GENERAL Y FUNCIÓN SEXUAL';
 const names=(h.h_condition_names||'').trim();
 const card=existing||document.createElement('div');card.id='spmHealthEducation';card.className='card';card.innerHTML=`<span class="stepBadge">${status}</span><h3>Tu salud general también forma parte del plan</h3>${names?`<p class="micro"><b>Condición(es) reportada(s):</b> ${names.replace(/[<>]/g,'')}</p>`:''}<p>${text}</p><div class="mini"><small>Intervención educativa SPM</small><p>Durante el programa se reforzarán sueño, actividad física, alimentación cardiometabólica, manejo del estrés, peso saludable y reducción de tabaco/alcohol cuando corresponda.</p></div><p><button type="button" class="btn sec" id="spmHealthAudio">🔊 Escuchar esta explicación</button></p>`;
 if(!existing)target.insertAdjacentElement('afterend',card);
 card.querySelector('#spmHealthAudio').onclick=()=>speak(text+' Durante el programa se reforzarán hábitos que favorecen tu salud general y sexual.');
}
window.SPM_HEALTH_INTAKE_V2={questions:HEALTH,decorateMap,load};
setTimeout(decorateMap,900);
})();