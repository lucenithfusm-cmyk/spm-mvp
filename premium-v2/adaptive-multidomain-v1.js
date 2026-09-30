(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const LABEL_TO_DOMAIN={
 'Rendimiento eréctil':'erection','Control eyaculatorio':'ejaculation','Deseo y excitación':'desire',
 'Confianza y ansiedad de desempeño':'confidence','Confianza sexual':'confidence',
 'Satisfacción y conexión':'wellbeing','Base de rendimiento':'lifestyle','Optimización y hábitos protectores':'lifestyle'
};
const CAT={
 erection:[
  {id:'de.attention',title:'Atención sin examen',why:'Reducir la vigilancia constante sobre la firmeza.',metric:'vigilancia y confianza',phase:[1,2,3,4]},
  {id:'de.recovery',title:'Recuperación de firmeza',why:'Entrenar qué hacer cuando la respuesta fluctúa.',metric:'capacidad de recuperación',phase:[2,3,4]},
  {id:'de.sensate',title:'Focalización sensorial',why:'Volver a sensaciones sin perseguir una erección perfecta.',metric:'presencia y presión',phase:[2,3,4]},
  {id:'de.context',title:'Condiciones que favorecen la respuesta',why:'Trabajar contexto, estímulo, privacidad y tiempo.',metric:'respuesta percibida',phase:[1,2]},
  {id:'de.preencounter',title:'Preparación preencuentro',why:'Llegar con menos presión y una intención clara.',metric:'confianza preencuentro',phase:[3,4]}
 ],
 ejaculation:[
  {id:'ep.scale',title:'Escala de excitación 0–10',why:'Reconocer antes el ascenso de excitación.',metric:'reconocimiento del umbral',phase:[1,2]},
  {id:'ep.startstop',title:'Start–Stop guiado',why:'Practicar anticipación y pausa antes del límite.',metric:'control percibido',phase:[2,3,4]},
  {id:'ep.rhythm',title:'Control de ritmo e intensidad',why:'Regular sin depender siempre de detenerse.',metric:'modulación continua',phase:[2,3,4]},
  {id:'ep.partner',title:'Transferencia y señal de pausa',why:'Aplicar habilidades con comunicación y consentimiento.',metric:'control y confianza',phase:[3,4]}
 ],
 desire:[
  {id:'des.accelerators',title:'Mapa de aceleradores y frenos',why:'Identificar qué despierta y qué apaga el deseo.',metric:'aceleradores útiles',phase:[1,2]},
  {id:'des.responsive',title:'Deseo responsivo',why:'Explorar activación gradual sin exigir ganas al inicio.',metric:'deseo antes/después',phase:[1,2,3]},
  {id:'des.stimuli',title:'Exploración de estímulos',why:'Descubrir estímulos visuales, táctiles, verbales y contextuales útiles.',metric:'respuesta por estímulo',phase:[1,2,3]},
  {id:'des.context',title:'Ventana favorable al deseo',why:'Crear mejores condiciones de tiempo, energía y privacidad.',metric:'facilidad de activación',phase:[2,3]},
  {id:'des.sensate',title:'Focalización sensorial',why:'Recuperar curiosidad y placer sin meta obligatoria.',metric:'disfrute y presión',phase:[2,3,4]},
  {id:'des.partner',title:'Conexión y comunicación',why:'Explorar en pareja solo lo consensuado y útil para ambos.',metric:'cercanía y satisfacción',phase:[3,4]}
 ],
 confidence:[
  {id:'anx.anchor',title:'Ancla atencional',why:'Salir del modo examen y volver a una sensación concreta.',metric:'vigilancia antes/después',phase:[1,2,3,4]},
  {id:'anx.reframe',title:'Reencuadre de presión',why:'Sustituir reglas rígidas por expectativas funcionales.',metric:'presión percibida',phase:[1,2]},
  {id:'anx.evidence',title:'Confianza basada en evidencia',why:'Construir confianza con experiencias reales, no afirmaciones vacías.',metric:'confianza',phase:[2,3,4]},
  {id:'anx.exposure',title:'Exposición gradual',why:'Practicar en niveles manejables sin convertirlo en examen.',metric:'ansiedad anticipatoria',phase:[3,4]},
  {id:'anx.preencounter',title:'Preparación mental preencuentro',why:'Llegar con menos comprobación y más presencia.',metric:'presión preencuentro',phase:[3,4]}
 ],
 wellbeing:[
  {id:'wb.communication',title:'Comunicación sexual',why:'Reducir presión y mejorar conexión.',metric:'comodidad al comunicar',phase:[2,3,4]},
  {id:'wb.sensate',title:'Focalización y conexión',why:'Priorizar disfrute y presencia.',metric:'satisfacción y conexión',phase:[2,3,4]},
  {id:'wb.intimacy',title:'Escalera de intimidad',why:'Avanzar gradualmente según comodidad y deseo.',metric:'presencia y disfrute',phase:[3,4]}
 ],
 lifestyle:[
  {id:'life.sleep',title:'Sueño y recuperación',why:'Trabajar un modificador que influye en energía, estrés y respuesta sexual.',metric:'sueño y energía',phase:[1,2,3,4]},
  {id:'life.movement',title:'Movimiento SPM',why:'Apoyar salud general y cardiometabólica con actividad segura.',metric:'actividad y energía',phase:[1,2,3,4]},
  {id:'life.nutrition',title:'Nutrición SPM',why:'Mejorar patrón vascular/metabólico de forma gradual.',metric:'adherencia al objetivo nutricional',phase:[1,2,3,4]}
 ]
};
const SHARED=[
 {id:'shared.breathing',title:'Respiración diafragmática',why:'Regular activación y tensión antes de una práctica.',metric:'tensión antes/después',phase:[1,2,3,4]},
 {id:'shared.pelvic',title:'Piso pélvico inteligente',why:'Coordinar y relajar antes de fortalecer cuando corresponda.',metric:'facilidad para relajar',phase:[1,2,3,4]},
 {id:'shared.recovery',title:'Recuperación después de una caída',why:'Evitar que una fluctuación se convierta en un ciclo de presión.',metric:'recuperación y confianza',phase:[2,3,4]}
];
function parseScores(){
 const out={};
 $$('.domain').forEach(d=>{
   const name=$('.domainHead b',d)?.textContent?.trim(),val=Number(($('.domainHead span',d)?.textContent||'').replace('/100',''));
   const k=LABEL_TO_DOMAIN[name];if(k&&Number.isFinite(val))out[k]=val;
 });
 return out;
}
function currentDay(){return Number(window.SPM_CURRENT_DAY||document.documentElement.dataset.spmCurrentDay||1)||1}
function phaseFor(day){return Math.max(1,Math.min(4,Math.ceil(day/7)))}
function currentPrimary(){
 const t=$('#profileTitle')?.textContent?.trim()||'';return LABEL_TO_DOMAIN[t]||'lifestyle';
}
function chooseDomains(scores,primary){
 const arr=Object.entries(scores).sort((a,b)=>a[1]-b[1]);
 const selected=[primary];
 for(const [k,v] of arr){if(k===primary)continue;if(selected.length>=3)break;const pv=scores[primary];if(v<=60 || (Number.isFinite(pv)&&v-pv<=18))selected.push(k)}
 return [...new Set(selected)];
}
function pickFor(domain,phase,day,offset=0){
 const list=(CAT[domain]||[]).filter(x=>x.phase.includes(phase));if(!list.length)return null;
 return list[(day+offset)%list.length];
}
function sharedPick(phase,day,domains){
 const preferred=domains.includes('confidence')?'shared.breathing':domains.includes('erection')?'shared.recovery':domains.includes('ejaculation')?'shared.breathing':'shared.pelvic';
 const valid=SHARED.filter(x=>x.phase.includes(phase));
 return valid.find(x=>x.id===preferred)||valid[day%valid.length]||null;
}
function buildToday(){
 const day=currentDay(),phase=phaseFor(day),scores=parseScores(),primary=currentPrimary(),domains=chooseDomains(scores,primary);
 const items=[];
 const p=pickFor(primary,phase,day,0);if(p)items.push({...p,domain:primary,role:'driver principal'});
 if(domains[1]){const s=pickFor(domains[1],phase,day,1);if(s)items.push({...s,domain:domains[1],role:'driver secundario'})}
 const sh=sharedPick(phase,day,domains);if(sh&&!items.some(x=>x.id===sh.id))items.push({...sh,domain:'shared',role:'modificador'});
 return {day,phase,primary,domains,scores,items:items.slice(0,3)};
}
function cardHTML(x,i){return `<article class="spm-md-task" data-practice="${x.id}"><div class="spm-md-num">${i+1}</div><div><small>${x.role}</small><h4>${x.title}</h4><p>${x.why}</p><div class="spm-md-meta"><span>Mediremos: ${x.metric}</span><span>Origen: Hoy en SPM</span></div></div><button type="button" class="btn pri spm-md-start">Comenzar</button></article>`}
function render(){
 const hero=$('#spmTodayHero');if(!hero)return;const plan=buildToday();
 let box=$('#spmMultidomainToday',hero);if(!box){box=document.createElement('div');box.id='spmMultidomainToday';hero.appendChild(box)}
 box.innerHTML=`<div class="spm-md-head"><div><div class="spm-today-kicker">RUTA ADAPTATIVA</div><h3>Hoy SPM combina lo que más necesitas trabajar.</h3><p>Tu driver principal guía el día, pero los déficits secundarios también aportan prácticas cuando son relevantes. No necesitas trabajarlo todo a la vez.</p></div><span class="spm-md-chip">${plan.domains.length} áreas activas</span></div><div class="spm-md-grid">${plan.items.map(cardHTML).join('')}</div>`;
 $$('.spm-md-start',box).forEach((b,i)=>b.onclick=()=>{
   const x=plan.items[i];localStorage.setItem('spm_today_assignment_v1',JSON.stringify({...x,day:plan.day,origin:'dailyPlan',assignedAt:new Date().toISOString()}));
   window.dispatchEvent(new CustomEvent('spm:open-assigned-practice',{detail:{...x,day:plan.day,origin:'dailyPlan'}}));
   b.textContent='Asignada ✓';
 });
 localStorage.setItem('spm_multidomain_today_v1',JSON.stringify({...plan,generatedAt:new Date().toISOString()}));
}
function decorateDayCards(){
 const plan=buildToday();
 $$('.dayCard').forEach(c=>{
   const d=Number($('.dayNum',c)?.textContent||0);if(d!==plan.day)return;
   let tag=$('.spm-md-domains',c);if(!tag){tag=document.createElement('div');tag.className='spm-md-domains';($('.dayBody',c)||c).prepend(tag)}
   tag.innerHTML='<b>Áreas que SPM está integrando hoy</b>'+plan.domains.map(k=>`<span>${k}</span>`).join('');
 });
}
function refresh(){render();decorateDayCards()}
document.addEventListener('click',e=>{if(e.target.closest('#navPlan,#goPlan,.phaseBtn,.doneBtn,#coachSave'))setTimeout(refresh,280)});
window.addEventListener('spm:adaptation',()=>setTimeout(refresh,180));
document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,1300),{once:true});setTimeout(refresh,2100);
const st=document.createElement('style');st.textContent=`
.spm-md-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-top:18px;padding-top:16px;border-top:1px solid var(--line)}.spm-md-head h3{margin:3px 0 5px}.spm-md-head p{margin:0;color:var(--muted);line-height:1.45}.spm-md-chip{white-space:nowrap;padding:6px 9px;border:1px solid rgba(120,225,196,.35);border-radius:999px;color:#78e1c4;font-size:11px;font-weight:900}.spm-md-grid{display:grid;gap:9px;margin-top:12px}.spm-md-task{display:grid;grid-template-columns:34px 1fr auto;gap:10px;align-items:center;padding:12px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.025)}.spm-md-num{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#1e766e;color:#fff;font-weight:900}.spm-md-task small{color:#78e1c4;text-transform:uppercase;font-size:9px;font-weight:900;letter-spacing:.08em}.spm-md-task h4{margin:2px 0 4px}.spm-md-task p{margin:0;color:var(--muted);font-size:12px;line-height:1.4}.spm-md-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.spm-md-meta span,.spm-md-domains span{font-size:10px;padding:4px 7px;border-radius:999px;background:rgba(120,225,196,.08);color:#bfeadd}.spm-md-domains{margin:0 0 12px;padding:10px;border-radius:12px;background:rgba(120,225,196,.06)}.spm-md-domains b{display:block;margin-bottom:7px}.spm-md-domains span{display:inline-block;margin:2px 4px 2px 0}@media(max-width:720px){.spm-md-head{flex-direction:column}.spm-md-task{grid-template-columns:32px 1fr}.spm-md-task .spm-md-start{grid-column:1/-1;width:100%}}`;
document.head.appendChild(st);
window.SPM_MULTIDOMAIN_ENGINE_V1={buildToday,refresh};
})();