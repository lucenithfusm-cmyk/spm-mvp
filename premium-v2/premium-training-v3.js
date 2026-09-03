(()=>{
'use strict';
const SB_URL='https://jogirmziqjlsttbbarcx.supabase.co';
const SB_KEY='sb_publishable_jXmxa5K6ThK9C8DPIxmVVQ_mbuLWVaf';
const db=window.supabase?.createClient?window.supabase.createClient(SB_URL,SB_KEY):null;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

const css=`
.spmx-btn{margin-top:14px;width:100%;border:0;border-radius:14px;padding:13px 16px;font:800 14px/1.2 inherit;cursor:pointer;color:#fff;background:linear-gradient(135deg,#1477ff,#16c5c8);box-shadow:0 10px 26px rgba(16,123,255,.22)}
.spmx-btn:hover{filter:brightness(1.06)}
.spmx{position:fixed;inset:0;z-index:9999;background:rgba(2,10,18,.86);backdrop-filter:blur(12px);display:grid;place-items:center;padding:14px;color:#eef8ff}
.spmx-card{width:min(980px,98vw);max-height:94vh;overflow:auto;border:1px solid rgba(102,210,255,.22);border-radius:24px;background:linear-gradient(180deg,#071923,#071116);box-shadow:0 35px 90px rgba(0,0,0,.45)}
.spmx-head{position:sticky;top:0;z-index:4;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px;background:rgba(7,18,24,.94);border-bottom:1px solid rgba(255,255,255,.08);backdrop-filter:blur(10px)}
.spmx-head b{font-size:16px}.spmx-close{border:0;background:#102732;color:white;width:36px;height:36px;border-radius:50%;font-size:20px;cursor:pointer}
.spmx-main{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr);gap:18px;padding:18px}
.spmx-stage{min-height:520px;border-radius:20px;overflow:hidden;position:relative;background:radial-gradient(circle at 50% 35%,#153649 0,#081923 48%,#061117 100%);display:grid;place-items:center}
.spmx-copy{padding:10px 4px 6px}.spmx-kicker{display:inline-block;color:#65dff0;font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.spmx-copy h2{font-size:28px;line-height:1.08;margin:8px 0 10px}.spmx-copy p{color:#c8d7df;line-height:1.55}.spmx-note{margin-top:12px;padding:12px 14px;border-radius:14px;background:#0d232c;border:1px solid rgba(255,255,255,.08);color:#d8edf3;font-size:13px;line-height:1.45}.spmx-warn{background:#2b2114;border-color:#6b5126;color:#ffe4b4}.spmx-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.spmx-action{border:0;border-radius:12px;padding:12px 15px;font:800 14px inherit;cursor:pointer}.spmx-primary{background:#39cfd2;color:#042027}.spmx-secondary{background:#102832;color:#e8fbff}.spmx-progress{height:6px;background:#10242e;overflow:hidden;border-radius:99px;margin-top:14px}.spmx-progress i{display:block;height:100%;width:0;background:#39cfd2;transition:width .3s ease}.spmx-timer{font-size:54px;font-weight:900;letter-spacing:-.04em}.spmx-phase{font-size:18px;font-weight:900;margin-top:4px}.spmx-sub{font-size:13px;color:#afd0dc;margin-top:4px}.spmx-options{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.spmx-opt{border:1px solid #1e4554;background:#0b2029;color:#eaf8fd;border-radius:12px;padding:11px;text-align:left;cursor:pointer}.spmx-opt.sel{border-color:#49d7da;background:#103238}.spmx-anatomy-label{font-size:12px;font-weight:800;fill:#d8faff}.spmx svg{width:min(520px,95%);height:auto;overflow:visible}.spmx-human{fill:#163241;stroke:#4f8ca5;stroke-width:2}.spmx-shirt{fill:#123e58}.spmx-skin{fill:#c88b67}.spmx-chair{fill:#132a35}.spmx-lung{fill:#e3656f;opacity:.88;stroke:#ff9da4;stroke-width:1.5}.spmx-diaphragm{fill:none;stroke:#58d7dd;stroke-width:8;stroke-linecap:round;filter:drop-shadow(0 0 7px #2cc7d1)}.spmx-abd{fill:#4bd8d6;opacity:.12;stroke:#64f0eb;stroke-width:2}.spmx-air{fill:none;stroke:#79e8f4;stroke-width:5;stroke-linecap:round;stroke-dasharray:12 11;animation:spmxFlow 1.15s linear infinite}.spmx-pelvis{fill:none;stroke:#f1d2ad;stroke-width:12;opacity:.75}.spmx-pf{fill:#d85f65;stroke:#ffb0b4;stroke-width:2;transform-origin:260px 346px;transition:transform .9s cubic-bezier(.2,.8,.2,1),opacity .5s}.spmx-pf-glow{fill:#39d3c9;opacity:.12;transition:opacity .5s}.spmx-overlay{opacity:0;transition:opacity .6s}.spmx-stage[data-view="anatomy"] .spmx-overlay,.spmx-stage[data-view="guided"] .spmx-overlay{opacity:1}.spmx-stage[data-breath="in"] .spmx-diaphragm{animation:spmxDiaDown 4s ease-in-out forwards}.spmx-stage[data-breath="in"] .spmx-abd{animation:spmxAbdExpand 4s ease-in-out forwards}.spmx-stage[data-breath="in"] .spmx-lung{animation:spmxLungFill 4s ease-in-out forwards}.spmx-stage[data-breath="out"] .spmx-diaphragm{animation:spmxDiaUp 6s ease-in-out forwards}.spmx-stage[data-breath="out"] .spmx-abd{animation:spmxAbdBack 6s ease-in-out forwards}.spmx-stage[data-breath="out"] .spmx-lung{animation:spmxLungBack 6s ease-in-out forwards}.spmx-stage[data-pelvic="contract"] .spmx-pf{transform:translateY(-18px) scaleY(.82);}.spmx-stage[data-pelvic="contract"] .spmx-pf-glow{opacity:.5}.spmx-stage[data-pelvic="relax"] .spmx-pf{transform:translateY(0) scaleY(1)}
@keyframes spmxFlow{to{stroke-dashoffset:-46}}
@keyframes spmxDiaDown{to{transform:translateY(20px)}}@keyframes spmxDiaUp{from{transform:translateY(20px)}to{transform:translateY(0)}}
@keyframes spmxAbdExpand{to{transform:scaleX(1.13);transform-origin:center}}@keyframes spmxAbdBack{from{transform:scaleX(1.13);transform-origin:center}to{transform:scaleX(1);transform-origin:center}}
@keyframes spmxLungFill{to{transform:scale(1.06);transform-origin:center}}@keyframes spmxLungBack{from{transform:scale(1.06);transform-origin:center}to{transform:scale(1);transform-origin:center}}
@media(max-width:760px){.spmx-main{grid-template-columns:1fr}.spmx-stage{min-height:390px}.spmx-copy h2{font-size:23px}.spmx-card{max-height:96vh}.spmx-timer{font-size:46px}}
`;
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

function speak(text){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='es-CO';u.rate=.86;u.pitch=1;const voices=speechSynthesis.getVoices();u.voice=voices.find(v=>/es-CO/i.test(v.lang))||voices.find(v=>/^es/i.test(v.lang))||null;speechSynthesis.speak(u)}catch(e){}}
function humanSvg(kind){
 const anatomy=kind==='breathing'?`
 <g class="spmx-overlay">
  <path class="spmx-lung" d="M229 178 C205 185 196 225 205 270 C214 302 235 299 250 277 L250 186 C243 180 236 177 229 178Z"/>
  <path class="spmx-lung" d="M291 178 C315 185 324 225 315 270 C306 302 285 299 270 277 L270 186 C277 180 284 177 291 178Z"/>
  <path class="spmx-diaphragm" d="M205 292 Q260 326 315 292"/>
  <ellipse class="spmx-abd" cx="260" cy="324" rx="72" ry="55"/>
  <path class="spmx-air" d="M260 105 L260 166"/>
  <text x="330" y="250" class="spmx-anatomy-label">Pulmones</text><line x1="320" y1="247" x2="298" y2="247" stroke="#d8faff"/>
  <text x="327" y="308" class="spmx-anatomy-label">Diafragma</text><line x1="320" y1="305" x2="302" y2="302" stroke="#d8faff"/>
 </g>`:`
 <g class="spmx-overlay">
  <path class="spmx-pelvis" d="M205 285 Q184 312 205 356 M315 285 Q336 312 315 356 M205 285 Q260 262 315 285 M205 356 Q260 380 315 356"/>
  <ellipse class="spmx-pf-glow" cx="260" cy="350" rx="58" ry="28"/>
  <path class="spmx-pf" d="M210 346 Q260 380 310 346 Q260 328 210 346Z"/>
  <text x="329" y="350" class="spmx-anatomy-label">Piso pélvico</text><line x1="320" y1="347" x2="307" y2="347" stroke="#d8faff"/>
 </g>`;
 return `<svg viewBox="0 0 520 520" role="img" aria-label="Demostración clínica animada">
 <ellipse cx="260" cy="485" rx="165" ry="16" fill="#020b10" opacity=".45"/>
 <rect class="spmx-chair" x="178" y="348" width="164" height="28" rx="12"/><rect class="spmx-chair" x="195" y="370" width="14" height="105" rx="7"/><rect class="spmx-chair" x="311" y="370" width="14" height="105" rx="7"/>
 <circle class="spmx-skin" cx="260" cy="93" r="43"/><path class="spmx-shirt" d="M196 151 Q260 126 324 151 L342 330 Q260 356 178 330Z"/><path class="spmx-human" d="M198 170 Q164 203 178 310 M322 170 Q356 203 342 310" fill="none"/><path class="spmx-human" d="M216 338 L205 466 M304 338 L315 466" fill="none" stroke-width="28" stroke-linecap="round"/>
 <path class="spmx-skin" d="M185 300 Q182 318 198 326"/><path class="spmx-skin" d="M335 300 Q338 318 322 326"/>
 ${anatomy}
 </svg>`;
}

const flows={
 breathing:{title:'Respiración diafragmática',day:3,steps:[
  {k:'intro',t:'Hoy vamos a trabajar respiración diafragmática',p:'Esta práctica busca ayudarte a bajar la activación corporal, reducir tensión y prepararte para entrenar otras habilidades sexuales con mayor calma.',note:'La demostración dura pocos minutos. Después continuarás por tu cuenta y regresarás a SPM al terminar.',view:'person'},
  {k:'prep',t:'Primero prepara tu postura',p:'Siéntate en un lugar cómodo y tranquilo. Apoya ambos pies, deja la espalda en posición neutra, afloja hombros y mandíbula. Coloca una mano sobre el pecho y otra sobre el abdomen.',note:'El abdomen debe moverse más que el pecho. No intentes llenar los pulmones al máximo.',view:'person'},
  {k:'anatomy',t:'Mira qué ocurre al respirar',p:'Al inhalar lentamente por la nariz, el diafragma desciende y el abdomen se expande suavemente. En la exhalación el diafragma asciende y el abdomen vuelve de forma natural.',note:'La respiración será lenta y cómoda; nunca forzada.',view:'anatomy'},
  {k:'demo',t:'Demostración: observa primero',p:'Vamos a realizar dos ciclos completos. Inhala por la nariz durante 4 segundos, pausa 2 segundos sin hacer fuerza y exhala lentamente por la boca durante 6 segundos.',note:'Si notas mareo, detente, respira normalmente y descansa. No fuerces las repeticiones.',view:'guided'},
  {k:'guided',t:'Ahora hazlo conmigo',p:'Realizaremos tres ciclos juntos siguiendo el contador y la animación. Mantén hombros y pecho tranquilos y permite que el movimiento se concentre en el abdomen.',note:'Después continuarás de forma autónoma durante 3–5 minutos, o el tiempo indicado en tu plan.',view:'guided'},
  {k:'solo',t:'Ahora continúa tú',p:'Ya conoces la técnica. Continúa por tu cuenta durante 3–5 minutos a un ritmo cómodo. Puedes volver a reproducir esta demostración siempre que lo necesites.',note:'Cuando termines, regresa a SPM y pulsa “He terminado mi ejercicio”.',view:'person'},
  {k:'finish',t:'¿Cómo te sentiste?',p:'Registra tu experiencia para que SPM pueda seguir tu progreso.',view:'person'}
 ]},
 pelvic:{title:'Piso pélvico',day:6,steps:[
  {k:'intro',t:'Hoy vamos a trabajar conciencia del piso pélvico',p:'Aprender a identificar, activar suavemente y relajar por completo estos músculos puede apoyar el control y la función sexual. En esta primera fase importa más la técnica que la fuerza.',note:'Primero verás una demostración, luego haremos varios ciclos juntos y después continuarás por tu cuenta.',view:'person'},
  {k:'prep',t:'Prepara la postura',p:'Siéntate cómodo, con ambos pies apoyados, espalda neutra y abdomen, glúteos y muslos relajados. Respira normalmente durante todo el ejercicio.',note:'No debes contener la respiración ni apretar glúteos o abdomen.',view:'person'},
  {k:'anatomy',t:'Identifica qué músculo vamos a trabajar',p:'El piso pélvico forma una base muscular en la parte inferior de la pelvis. Para reconocerlo, imagina que intentas evitar la salida de gases y elevar suavemente el periné hacia dentro y arriba.',note:'No practiques rutinariamente deteniendo el chorro de orina. Esa referencia puede servir para reconocer la zona, no como entrenamiento habitual.',view:'anatomy'},
  {k:'demo',t:'Observa la contracción y la relajación',p:'La contracción es suave: el piso pélvico se eleva hacia dentro y arriba. Mantén 2 segundos y después relaja completamente durante 6 segundos. La relajación es parte esencial del ejercicio.',note:'Si aparece dolor, presión pélvica o aumento de tensión, detén las contracciones y consulta si persiste.',view:'guided'},
  {k:'guided',t:'Ahora hazlo conmigo',p:'Haremos cinco repeticiones: contrae suavemente 2 segundos y relaja por completo 6 segundos. Sigue respirando con normalidad.',note:'Busca precisión y relajación completa, no una contracción máxima.',view:'guided'},
  {k:'solo',t:'Ahora continúa tú',p:'Continúa por tu cuenta con 5 repeticiones adicionales, manteniendo 2 segundos de contracción suave y 6 segundos de relajación completa.',note:'Cuando termines, regresa a SPM y pulsa “He terminado mi ejercicio”.',view:'person'},
  {k:'finish',t:'¿Cómo se sintió el ejercicio?',p:'Cuéntanos si pudiste identificar y relajar el músculo con facilidad.',view:'person'}
 ]}
};

let modal=null, state=null, timer=null;
function openTraining(type){
 const f=flows[type];state={type,idx:0,choice:null};
 modal=document.createElement('div');modal.className='spmx';modal.innerHTML=`<div class="spmx-card"><div class="spmx-head"><b>SPM Premium · ${f.title}</b><button class="spmx-close" aria-label="Cerrar">×</button></div><div class="spmx-main"><div class="spmx-stage" data-view="person">${humanSvg(type)}<div style="position:absolute;left:18px;bottom:18px;background:rgba(4,16,23,.78);padding:10px 12px;border-radius:12px"><div class="spmx-timer" style="font-size:34px">—</div><div class="spmx-phase">Demostración</div><div class="spmx-sub">Visual + voz sincronizadas</div></div></div><div class="spmx-copy"></div></div></div>`;
 document.body.appendChild(modal);$('.spmx-close',modal).onclick=closeTraining;renderStep();
}
function closeTraining(){if(timer)clearTimeout(timer);timer=null;try{speechSynthesis.cancel()}catch(e){};modal?.remove();modal=null;state=null}
function renderStep(){
 const f=flows[state.type],s=f.steps[state.idx],copy=$('.spmx-copy',modal),stage=$('.spmx-stage',modal);stage.dataset.view=s.view||'person';delete stage.dataset.breath;delete stage.dataset.pelvic;
 const isLast=s.k==='finish';copy.innerHTML=`<span class="spmx-kicker">Paso ${state.idx+1} de ${f.steps.length}</span><h2>${s.t}</h2><p>${s.p}</p>${s.note?`<div class="spmx-note ${/mareo|dolor|consulta/i.test(s.note)?'spmx-warn':''}">${s.note}</div>`:''}<div class="spmx-progress"><i style="width:${((state.idx+1)/f.steps.length)*100}%"></i></div><div class="spmx-actions"></div>`;
 const actions=$('.spmx-actions',copy);
 if(s.k==='demo'||s.k==='guided'){
  const b=document.createElement('button');b.className='spmx-action spmx-primary';b.textContent=s.k==='demo'?'▶ Ver demostración':'▶ Empezar práctica acompañada';b.onclick=()=>runCycles(s.k);actions.appendChild(b);
 }else if(s.k==='solo'){
  const replay=document.createElement('button');replay.className='spmx-action spmx-secondary';replay.textContent='↻ Volver a ver demostración';replay.onclick=()=>{state.idx=Math.max(0,state.idx-2);renderStep()};actions.appendChild(replay);
  const b=document.createElement('button');b.className='spmx-action spmx-primary';b.textContent='He terminado mi ejercicio';b.onclick=nextStep;actions.appendChild(b);
 }else if(isLast){renderFinish(actions)} else {
  const b=document.createElement('button');b.className='spmx-action spmx-primary';b.textContent='Continuar';b.onclick=nextStep;actions.appendChild(b);
 }
 speak(`${s.t}. ${s.p} ${s.note||''}`);
}
function nextStep(){state.idx=Math.min(state.idx+1,flows[state.type].steps.length-1);renderStep()}
function wait(ms){return new Promise(r=>{timer=setTimeout(r,ms)})}
async function countdown(sec,label,phase){const stage=$('.spmx-stage',modal),t=$('.spmx-timer',modal),p=$('.spmx-phase',modal);p.textContent=label;if(state.type==='breathing')stage.dataset.breath=phase||'';else stage.dataset.pelvic=phase||'';for(let i=sec;i>0;i--){t.textContent=i+' s';await wait(1000)}t.textContent='✓'}
async function breathCycle(n,total){speak(`Ciclo ${n} de ${total}. Inhala lentamente por la nariz.`);await countdown(4,'Inhala por la nariz','in');speak('Pausa suave. Sin hacer fuerza.');await countdown(2,'Pausa','hold');speak('Exhala lentamente por la boca.');await countdown(6,'Exhala por la boca','out');}
async function pelvicCycle(n,total){speak(`Repetición ${n} de ${total}. Contrae suavemente y eleva.`);await countdown(2,'Eleva y contrae','contract');speak('Relaja por completo y continúa respirando.');await countdown(6,'Relaja completamente','relax');}
async function runCycles(kind){
 const actions=$('.spmx-actions',modal);$$('button',actions).forEach(b=>b.disabled=true);const total=state.type==='breathing'?(kind==='demo'?2:3):(kind==='demo'?2:5);
 try{for(let i=1;i<=total;i++){if(!modal)return;if(state.type==='breathing')await breathCycle(i,total);else await pelvicCycle(i,total)}$('.spmx-phase',modal).textContent='Bloque completado';$('.spmx-timer',modal).textContent='✓';const b=document.createElement('button');b.className='spmx-action spmx-primary';b.textContent='Continuar';b.onclick=nextStep;actions.innerHTML='';actions.appendChild(b);speak('Muy bien. Bloque completado. Cuando estés listo, continúa.')}catch(e){}
}
function renderFinish(actions){
 const wrap=document.createElement('div');wrap.style.width='100%';wrap.innerHTML=`<div class="spmx-options"><button class="spmx-opt" data-v="muy_bien">Me sentí muy bien</button><button class="spmx-opt" data-v="bien">Bien</button><button class="spmx-opt" data-v="dificil">Me costó</button><button class="spmx-opt" data-v="molestia">Tuve molestia/mareo</button></div><div class="spmx-actions"><button class="spmx-action spmx-primary" id="spmxSave">Guardar y continuar en SPM</button></div>`;actions.appendChild(wrap);$$('.spmx-opt',wrap).forEach(b=>b.onclick=()=>{$$('.spmx-opt',wrap).forEach(x=>x.classList.remove('sel'));b.classList.add('sel');state.choice=b.dataset.v});$('#spmxSave',wrap).onclick=saveFinish;
}
async function saveFinish(){
 const btn=$('#spmxSave',modal);btn.disabled=true;btn.textContent='Guardando…';
 try{if(db){const {data:{session}}=await db.auth.getSession();if(session?.user){const {data:plans}=await db.from('plans').select('id').eq('user_id',session.user.id).eq('status','active').order('created_at',{ascending:false}).limit(1);const plan=plans?.[0];if(plan){const f=flows[state.type];await db.from('activity_completions').upsert({user_id:session.user.id,plan_id:plan.id,day_number:f.day,module_key:`premium_${state.type}_v3`,metric_value:state.choice==='muy_bien'?10:state.choice==='bien'?8:state.choice==='dificil'?5:state.choice==='molestia'?2:null,metadata:{experience:state.choice,version:'premium-training-v3'},completed_at:new Date().toISOString()},{onConflict:'plan_id,day_number,module_key'})}}}
 window.dispatchEvent(new CustomEvent('spm:premium-training-complete',{detail:{type:state.type,experience:state.choice}}));btn.textContent='Guardado ✓';setTimeout(closeTraining,650);
 }catch(e){btn.disabled=false;btn.textContent='Guardar y continuar en SPM';const n=document.createElement('div');n.className='spmx-note spmx-warn';n.textContent='No pudimos guardar el registro. Puedes cerrar y volver a intentarlo.';btn.parentElement.appendChild(n)}
}
function decorate(){
 $$('.dayCard').forEach(card=>{const txt=(card.textContent||'').toLowerCase();let type=null;if(txt.includes('respiración y regulación'))type='breathing';if(txt.includes('piso pélvico'))type='pelvic';if(!type||card.dataset.spmx)return;card.dataset.spmx='1';const b=document.createElement('button');b.className='spmx-btn';b.type='button';b.textContent=type==='breathing'?'▶ Iniciar respiración guiada Premium':'▶ Iniciar piso pélvico guiado Premium';b.onclick=e=>{e.preventDefault();e.stopPropagation();openTraining(type)};card.appendChild(b)})
}
const grid=document.getElementById('dayGrid');if(grid){const obs=new MutationObserver(()=>requestAnimationFrame(decorate));obs.observe(grid,{childList:true,subtree:true});decorate()}else document.addEventListener('DOMContentLoaded',decorate);
})();