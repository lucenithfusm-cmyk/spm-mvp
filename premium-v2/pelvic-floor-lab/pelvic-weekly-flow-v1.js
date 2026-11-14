/* SPM Pelvic Floor Lab · cuatro encuentros semanales.
   Capa de práctica guiada integrada por el bridge autenticado. La biblioteca
   original permanece intacta; no sustituye ni registra sesiones de fuerza. */
(()=>{
'use strict';
if(window.__SPM_PELVIC_WEEKLY_V1__)return;
const parent=(()=>{try{return window.parent?.SPM_PELVIC_LAB_HOST}catch{return null}})();
const context=parent?.getContext?.();
const DAYS=[3,10,17,24];
if(!parent||context?.origin!=='dailyPlan'||context?.intent!=='daily-relax'||context?.activityId!=='pelvic-daily-lab'||!DAYS.includes(context.day))return;
const root=document.getElementById('root');
if(!root)return;
const entryContext={day:context.day,activityId:context.activityId,origin:context.origin,intent:context.intent};
const week=DAYS.indexOf(context.day)+1;
const titleByWeek=['Reconoce cuándo parar','¿Qué notaste?','Elige un apoyo para soltar','¿Qué puedo percibir?'];
const PHASES=[
 {label:'Percibe',seconds:12,cue:'Nota el contacto de tu pelvis con el apoyo. Sin apretar ni buscar un movimiento.',audio:'pf.cue.percibe.mp3',state:'rest'},
 {label:'Respira',seconds:24,cue:'Respira a tu propio ritmo, sin retener el aire. Deja suave el abdomen.',audio:'pf.cue.respira.mp3',state:'breathe'},
 {label:'Suelta',seconds:18,cue:'Afloja la mandíbula, los glúteos y la base de la pelvis. No empujes.',audio:'pf.cue.suelta.mp3',state:'down'},
];
const TOTAL=PHASES.reduce((a,p)=>a+p.seconds,0)*1000; // Orientativo: tiempos de guía, no una dosis clínica.
const escaped=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const all={stage:week===1?'intro':'position',posture:'seated',awareness:null,anchor:null,perception:null,stopFlags:[],release:null,discomfort:null,tension:null,started:false,interrupted:false,saved:false,week,elapsed:0,since:null,timer:null,phase:-1,error:''};
const images={anatomy:'./assets/pelvic-anatomy-Be2oguaa.jpg',animation:'./assets/spm-pelvic-relaxation-animation.webp',seated:'./assets/spm-posture-seated-20261113.webp',reclined:'./assets/spm-posture-reclined-20261113.webp'};
const audio=new Audio();audio.preload='auto';audio.hidden=true;audio.setAttribute('aria-hidden','true');
const box=document.createElement('section');box.id='spmWeeklyFlow';box.className='pf-weekly-flow';box.setAttribute('aria-label','Pelvic Floor Lab · práctica semanal');
const style=document.createElement('style');style.id='spmWeeklyFlowStyles';style.textContent=`
html,body{min-height:100%;background:#061a22}
.pf-weekly-flow{position:fixed;inset:0;z-index:1000;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;background:radial-gradient(120% 50% at 50% -10%,#143f46 0%,#061a22 70%);color:#f2f7f5;font-family:Montserrat,system-ui,-apple-system,sans-serif;line-height:1.5;scrollbar-gutter:stable}
.pf-weekly-flow *{box-sizing:border-box}
.pf-weekly-wrap{max-width:820px;margin:0 auto;padding:16px 14px calc(50px + env(safe-area-inset-bottom))}
.pf-weekly-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 4px 18px;color:#e1f2ed}
.pf-weekly-brand{display:flex;gap:12px;align-items:center}.pf-weekly-brand>span{display:grid;place-items:center;width:46px;height:46px;border:1px solid #c5a46c;border-radius:50%;font-size:14px;font-weight:800;color:#c5a46c}.pf-weekly-brand b{font-size:19px}.pf-weekly-brand small{display:block;font-size:11px;color:#d1b580;font-weight:800;letter-spacing:.08em}
.pf-weekly-week{color:#dfc58f;font-size:12px;white-space:nowrap}
.pf-weekly-card{padding:clamp(16px,4vw,30px);background:linear-gradient(150deg,#092c33,#081e29);border:1px solid #32575a;border-radius:22px;box-shadow:0 10px 30px #0003;margin-bottom:16px}
.pf-weekly-card h1,.pf-weekly-card h2{font-size:clamp(24px,6vw,35px);line-height:1.2;margin:0 0 13px;font-weight:750}.pf-weekly-card h3{font-size:20px;margin:10px 0}.pf-weekly-card p{margin:8px 0 14px;font-size:15px;color:#d1e2dc}
.pf-weekly-kicker{font-size:12px;font-weight:800;letter-spacing:.09em;color:#c5a46c;margin-bottom:8px}
.pf-weekly-btn{display:inline-flex;justify-content:center;align-items:center;min-height:50px;gap:8px;background:#163940;border:1px solid #688784;border-radius:14px;color:#eff8f4;padding:12px 16px;font-family:inherit;font-size:16px;font-weight:700;line-height:1.4;cursor:pointer;text-align:center}
.pf-weekly-btn.primary{background:#c5a46c;color:#092029;border-color:#c5a46c}.pf-weekly-btn.alt{background:#163940}.pf-weekly-btn:disabled{opacity:.45;cursor:not-allowed}.pf-weekly-btn:focus-visible,.pf-weekly-option:focus-visible{outline:3px solid #e4c788;outline-offset:3px}
.pf-weekly-buttons{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.pf-weekly-buttons .pf-weekly-btn{flex:1;min-width:140px}.pf-weekly-btn.wide{display:flex;width:100%}
.pf-weekly-image{display:block;width:100%;height:auto;max-height:390px;object-fit:contain;object-position:center;border-radius:14px;background:#081925;border:1px solid #34575d}
.pf-weekly-media{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:center;margin:14px 0}
.pf-weekly-media .pf-weekly-image{height:clamp(190px,40vw,340px)}
.pf-weekly-audio{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:14px;margin:16px 0;border:1px solid #c5a46c90;border-radius:15px;background:#122d34}.pf-weekly-audio .pf-weekly-btn{min-height:46px}
.pf-weekly-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:12px 0}.pf-weekly-option{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;background:#09212a;border:2px solid #365057;border-radius:16px;padding:10px;min-width:0;color:white;font-family:inherit;font-size:18px;font-weight:700;line-height:1.3;cursor:pointer}.pf-weekly-option.on{border-color:#d9b76e;box-shadow:inset 0 0 0 1px #d9b76e}.pf-weekly-option img{width:100%;height:auto;aspect-ratio:4/5;object-fit:contain;border-radius:10px}.pf-weekly-check{position:absolute;top:15px;right:15px;width:28px;height:28px;background:#0b2430;border:2px solid #c5a46c;border-radius:50%;display:grid;place-items:center}.pf-weekly-option.on .pf-weekly-check{background:#c5a46c;color:#071e23}
.pf-weekly-answers{display:grid;gap:10px}.pf-weekly-choice{display:flex;align-items:center;gap:12px;min-height:52px;width:100%;padding:12px;border-radius:14px;border:1px solid #456f70;background:#09252c;color:#f2f7f4;font-family:inherit;font-size:16px;font-weight:600;line-height:1.3;text-align:left;cursor:pointer}.pf-weekly-choice.on{background:#1b4848;border-color:#d1ad6b}.pf-weekly-choice .dot{height:20px;width:20px;flex:none;border:2px solid #95afaa;border-radius:50%}.pf-weekly-choice.on .dot{background:#d6b573;border-color:#d6b573;box-shadow:inset 0 0 0 4px #1b4848}
.pf-weekly-recognition-animation{max-height:265px;max-width:210px;margin:12px auto;object-fit:contain}.pf-weekly-scene{position:relative;display:grid;place-items:center;margin:8px auto 18px;max-width:470px}.pf-weekly-scene .pf-weekly-image{max-height:460px}.pf-weekly-scene .tag{position:absolute;left:20px;bottom:20px;padding:9px 16px;background:#061e29d9;border:1px solid #69e5d5;border-radius:12px;color:#73e5d5;font-size:19px;font-weight:800}
.pf-weekly-phases{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:20px 0}.pf-weekly-phase{padding:14px 5px;border:1px solid #31595c;border-radius:12px;text-align:center;color:#f3f6f5;background:#082028;font-size:17px;font-weight:700}.pf-weekly-phase.on{border-color:#56c9bb;background:#154348;color:#71f0dc}.pf-weekly-phase.done{border-color:#af9263;color:#c5a46c}
.pf-weekly-time{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:14px;border:1px solid #365c5f;border-radius:12px;margin:16px 0}.pf-weekly-time strong{font-size:25px;font-variant-numeric:tabular-nums;color:#dfc27c}
.pf-weekly-alert{background:#422523;border:1px solid #bf7755;padding:14px;border-radius:12px;color:#ffdfcf!important;font-size:14px!important}.pf-weekly-note{font-size:13px!important;color:#b4c9c4!important}.pf-weekly-survey{border-top:1px solid #355759;margin-top:18px;padding-top:17px}.pf-weekly-survey h3{font-size:17px}
.pf-weekly-status{min-height:0;margin:15px 0;color:#e8c38a;font-size:14px}
@media(max-width:440px){.pf-weekly-wrap{padding:10px 10px calc(24px + env(safe-area-inset-bottom))}.pf-weekly-card{padding:16px 13px}.pf-weekly-media{gap:7px}.pf-weekly-media .pf-weekly-image{height:230px}.pf-weekly-option{font-size:15px;padding:7px}.pf-weekly-phases{gap:5px}.pf-weekly-phase{font-size:15px;padding:11px 4px}.pf-weekly-brand b{font-size:16px}.pf-weekly-brand>span{width:40px;height:40px;font-size:12px}.pf-weekly-week{font-size:11px}}
@media(prefers-reduced-motion:reduce){.pf-weekly-flow *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
`;
const head=()=>`<header class="pf-weekly-head"><div class="pf-weekly-brand"><span>SPM</span><div><b>Pelvic Floor Lab</b><small>CONCIENCIA · RELAJACIÓN</small></div></div><span class="pf-weekly-week">SEMANA ${week} / 4</span></header>`;
const button=(action,label,variant='primary',disabled=false)=>`<button type="button" class="pf-weekly-btn ${variant}" data-action="${action}" ${disabled?'disabled':''}>${escaped(label)}</button>`;
const choices=(name,items,value)=>`<div class="pf-weekly-answers" role="group" aria-label="${escaped(name)}">${items.map(([key,label])=>`<button type="button" class="pf-weekly-choice ${(Array.isArray(value)?value.includes(key):value===key)?'on':''}" data-choice="${name}" data-value="${key}" aria-pressed="${Array.isArray(value)?value.includes(key):value===key}"><span class="dot" aria-hidden="true"></span><span>${escaped(label)}</span></button>`).join('')}</div>`;
function current(){try{const ctx=parent?.getContext?.();return !!ctx&&ctx.day===entryContext.day&&ctx.activityId===entryContext.activityId&&ctx.origin===entryContext.origin&&ctx.intent===entryContext.intent&&ctx.restriction!=='review';}catch{return false}}
function stopVoice(){audio.pause();try{audio.currentTime=0}catch{};audio.removeAttribute('src');}
function speak(file){
 stopVoice();audio.src=`./audio/pf/${file}`;audio.play().catch(()=>{
  const info=box.querySelector('[data-audio-message]');if(info)info.textContent='La voz no pudo reproducirse. Sigue la indicación visible.';
 });
}
function cue(){const p=PHASES[all.phase];if(p)speak(p.audio)}
function time(v){const n=Math.max(0,Math.ceil(v/1000));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`}
function phaseFor(ms){let sum=0;for(let i=0;i<PHASES.length;i++){sum+=PHASES[i].seconds*1000;if(ms<sum)return i;}return PHASES.length-1;}
function elapsed(){return all.elapsed+(all.since===null?0:Math.max(0,performance.now()-all.since))}
function pause(){if(all.since!==null){all.elapsed=Math.min(TOTAL,elapsed());all.since=null;}clearInterval(all.timer);all.timer=null;audio.pause();if(all.stage==='guided'&&all.elapsed<TOTAL)updateGuide();}
function updateGuide(){
 if(all.stage!=='guided')return;
 const value=Math.min(TOTAL,elapsed());
 if(value>=TOTAL){pause();all.interrupted=false;all.stage='evaluation';all.error='';render();return;}
 const idx=phaseFor(value);
 if(idx!==all.phase){all.phase=idx;cue();}
 const p=PHASES[idx],start=PHASES.slice(0,idx).reduce((x,y)=>x+y.seconds*1000,0),remain=(start+p.seconds*1000)-value;
 const active=box.querySelector('[data-active-phase]');if(active)active.textContent=p.label;
 const phrase=box.querySelector('[data-cue-text]');if(phrase)phrase.textContent=p.cue;
 const rem=box.querySelector('[data-remaining]');if(rem)rem.textContent=time(remain);
 const count=box.querySelector('[data-elapsed]');if(count)count.textContent=time(value);
 for(const [i,node] of box.querySelectorAll('[data-phase-index]').entries()){node.classList.toggle('on',i===idx);node.classList.toggle('done',i<idx);node.setAttribute('aria-current',i===idx?'step':'false');}
 const pauseBtn=box.querySelector('[data-action="pause-resume"]');if(pauseBtn)pauseBtn.textContent=all.since===null?'Reanudar guía':'Pausar guía';
}
function run(){
 if(!current()){all.error='La sesión cambió. Vuelve a Hoy para conservar tu programa.';render();return;}
 if(all.stage!=='guided'){all.stage='guided';all.elapsed=0;all.phase=-1;all.started=true;render();}
 if(all.since!==null)return;
 all.since=performance.now();updateGuide();
 all.timer=setInterval(updateGuide,200);
}
function section(inner){box.innerHTML=`<div class="pf-weekly-wrap">${head()}<main class="pf-weekly-card" aria-live="polite">${inner}${all.error?`<p class="pf-weekly-alert" role="alert">${escaped(all.error)}</p>`:''}</main><div class="pf-weekly-status" role="status" data-audio-message></div></div>`;box.scrollTop=0;}
function showIntro(){section(`<div class="pf-weekly-kicker">PRÁCTICA GUIADA 1 · RECONOCIMIENTO</div><h1>Reconoce la zona</h1><p>Observa la base de la pelvis: el piso pélvico se encuentra debajo de los órganos pélvicos. Estas imágenes te orientan; no miden el movimiento de tu cuerpo.</p><div class="pf-weekly-media"><img class="pf-weekly-image" src="${images.anatomy}" alt="Pelvis masculina con zona pélvica resaltada"><img class="pf-weekly-image" src="${images.animation}" alt="Animación de relajación del piso pélvico con flechas de liberación hacia abajo"></div><div class="pf-weekly-audio"><b>Escucha cómo reconocer la zona</b>${button('audio-intro','▶ Escuchar','alt')}</div><p class="pf-weekly-note">No contraigas ni empujes para encontrarla. Si no la reconoces aún, podrás indicarlo.</p><div class="pf-weekly-buttons">${button('continue-recognition','Continuar →')}</div>`);}
function showRecognition(){section(`<div class="pf-weekly-kicker">PRÁCTICA GUIADA 1 · RECONOCIMIENTO</div><h1>¿Reconoces la zona?</h1><p>Observa el movimiento ilustrativo y elige lo que describe tu experiencia. No tienes que contraer.</p><img class="pf-weekly-image pf-weekly-recognition-animation" src="${images.animation}" alt="Animación del piso pélvico al relajarse">${choices('awareness',[['yes','Sí, puedo ubicarla'],['unsure','Tengo dudas'],['no','Todavía no la reconozco']],all.awareness)}<div class="pf-weekly-buttons">${button('to-position','Continuar a la postura', 'primary',!all.awareness)}</div>`);}
function showPosition(){section(`<div class="pf-weekly-kicker">SEMANA ${week} · PREPARACIÓN</div><h1>Acomódate y empieza</h1><p>Elige una postura con apoyo y deja libres los músculos del abdomen y los glúteos.</p><div class="pf-weekly-options" role="group" aria-label="Elige postura">${[['seated','Sentado',images.seated],['reclined','Recostado',images.reclined]].map(([k,label,img])=>`<button type="button" class="pf-weekly-option ${all.posture===k?'on':''}" data-posture="${k}" aria-pressed="${all.posture===k}"><img src="${img}" alt="${label} con uniforme SPM" loading="eager"><span>${label}</span><span class="pf-weekly-check" aria-hidden="true">${all.posture===k?'✓':''}</span></button>`).join('')}</div><p>${all.posture==='seated'?'Apoya la espalda y ambos pies; deja los muslos y glúteos sueltos.':'Apoya la cabeza y la espalda. Flexiona las rodillas y apoya ambos pies.'}</p><p class="pf-weekly-note">Comenzaremos con una guía automática de ${TOTAL/1000} segundos: percibir, respirar y soltar. Respira naturalmente, sin seguir un ritmo impuesto.</p><div class="pf-weekly-buttons">${button('start','Iniciar práctica guiada')}</div>`);}
function showGuided(){section(`<div class="pf-weekly-kicker">SEMANA ${week} · GUÍA AUTOMÁTICA</div><h1>Percibe · Respira · Suelta</h1><p>Las tres indicaciones se activan solas, en secuencia. Puedes pausar cuando lo necesites.</p><div class="pf-weekly-scene"><img class="pf-weekly-image" src="${images.anatomy}" alt="Pelvis masculina; zona de conciencia y relajación"><span class="tag" data-active-phase>Percibe</span></div><div class="pf-weekly-phases" aria-label="Pasos automáticos">${PHASES.map((p,i)=>`<div class="pf-weekly-phase" data-phase-index="${i}">${p.label}</div>`).join('')}</div><h3 data-cue-text></h3><div class="pf-weekly-time"><span>Tiempo restante del paso<br><strong data-remaining>00:12</strong></span><span>Tiempo transcurrido<br><strong data-elapsed>00:00</strong></span></div><p class="pf-weekly-note">Percibe 12 s · Respira 24 s · Suelta 18 s. Son tiempos de orientación, no una prueba ni una dosis obligatoria.</p><div class="pf-weekly-buttons">${button('pause-resume','Pausar guía','alt')}${button('stop','Detener por malestar','alt')}</div><div class="pf-weekly-status" data-audio-message role="status"></div>`);updateGuide();}
function yesNo(name,question,value){return `<div class="pf-weekly-survey"><h3>${escaped(question)}</h3>${choices(name,[['yes','Sí'],['no','No']],value)}</div>`}
function showEvaluation(){
 const parts=[];
 if(week===1){parts.push(`<p>Reconoce señales de sobrecarga como en la biblioteca de Pelvic Floor Lab. Marca lo que notaste; no necesitas provocar ninguna sensación.</p>${choices('stop',[['none','No identifiqué señales de sobrecarga'],['fatigue','Fatiga o pesadez perineal'],['pain','Dolor o ardor'],['cant_relax','No logro soltar'],['urinary','Más urgencia o frecuencia urinaria'],['tension','Tensión en mandíbula, cadera o zona lumbar'],['dizzy','Mareo o falta de aire']],all.stopFlags)}`);}
 else if(week===3)parts.push(`<p>Elige una referencia sencilla a la que puedas volver cuando necesites soltar tensión.</p>${choices('anchor',[['hands','El contacto de mis manos'],['body','El peso del cuerpo sobre el apoyo'],['sound','Un sonido del ambiente'],['unclear','Todavía no identifico un apoyo']],all.anchor)}`);
 else if(week===4)parts.push(`<p>¿Qué percibiste durante esta práctica? No hay respuestas correctas.</p>${choices('perception',[['support','Noto el apoyo del cuerpo'],['tension','Noto tensión o esfuerzo'],['unclear','Todavía no reconozco una sensación clara']],all.perception)}`);
 else parts.push(`<p>Responde según tu experiencia real, sin exigirte una mejoría.</p>`);
 parts.push(yesNo('release','¿Pudiste dejar la zona en reposo?',all.release));
 if(week!==1)parts.push(yesNo('discomfort','¿Apareció dolor o molestia?',all.discomfort));
 if(week!==1)parts.push(yesNo('tension','¿Sentiste más tensión al terminar?',all.tension));
 const ready=all.release!==null&&(week===1?all.stopFlags.length>0:all.discomfort!==null&&all.tension!==null)&&(week!==3||all.anchor!==null)&&(week!==4||all.perception!==null);
 section(`<div class="pf-weekly-kicker">SEMANA ${week} · CIERRE</div><h1>${titleByWeek[week-1]}</h1>${parts.join('')}<div class="pf-weekly-buttons">${button('save','Guardar mi práctica','primary',!ready)}</div><p class="pf-weekly-note">Tus respuestas no son un diagnóstico. El día solo se confirma cuando vuelves a «Hoy».</p>`);
}
function showSaved(){section(`<div class="pf-weekly-kicker">SEMANA ${week} · REALIZADA</div><h1>Práctica registrada ✓</h1><p>Terminaste «Percibe, respira y suelta». No necesitas conseguir una sensación especial, repetir ni hacer ejercicios de fuerza.</p><p>Vuelve a «Hoy» para confirmar la actividad en tu recorrido de 28 días.</p><div class="pf-weekly-buttons">${button('return','Volver a Hoy')}</div>`);}
function showInterrupted(){section(`<div class="pf-weekly-kicker">SEGURIDAD · PAUSA</div><h1>Has detenido la práctica</h1><p>Respira con naturalidad y descansa. Si aparece dolor, mareo, dificultad urinaria o tensión que empeora, suspende la práctica y solicita valoración según los síntomas.</p><p class="pf-weekly-note">No se marcará esta actividad como realizada; tu progreso previo permanece igual.</p><div class="pf-weekly-buttons">${button('return','Volver a Hoy','primary')}${button('retry','Volver a prepararme','alt')}</div>`);}
function blocked(){section(`<div class="pf-weekly-kicker">PRÁCTICA EN PAUSA</div><h1>Revisa primero tu indicación de seguridad</h1><p>Tu programa ha señalado que conviene revisar información de salud antes de practicar. Puedes consultar la biblioteca; esta sesión no se registra.</p><div class="pf-weekly-buttons">${button('return','Volver a Hoy')}</div>`);}
function render(){if(!current()){pause();stopVoice();all.stage='blocked';}switch(all.stage){case'intro':showIntro();break;case'recognition':showRecognition();break;case'position':showPosition();break;case'guided':showGuided();break;case'evaluation':showEvaluation();break;case'saved':showSaved();break;case'interrupted':showInterrupted();break;default:blocked();}}
function choose(name,value){
 if(name==='awareness')all.awareness=value;
 else if(name==='anchor')all.anchor=value;
 else if(name==='perception')all.perception=value;
 else if(name==='release'||name==='discomfort'||name==='tension')all[name]=value;
 else if(name==='stop')all.stopFlags=value==='none'?['none']:all.stopFlags.includes(value)?all.stopFlags.filter(x=>x!==value):[...all.stopFlags.filter(x=>x!=='none'),value];
 render();
}
async function saveResult(){
 if(!current()||!all.started||all.interrupted||all.elapsed<TOTAL-250||all.release===null){all.error='Finaliza la secuencia y responde la evaluación antes de guardar.';render();return;}
 const flags=all.stopFlags,discomfort=week===1?flags.some(x=>['pain','dizzy','fatigue','urinary'].includes(x)):all.discomfort==='yes',postTension=week===1?flags.includes('tension')||flags.includes('cant_relax'):all.tension==='yes',fullRelease=all.release==='yes';
 const note={week,recognition:all.awareness||null,anchor:all.anchor||null,perception:all.perception||null,stopSignals:week===1?flags:[],posture:all.posture};
 const result={practiceId:'percibe',completed:true,cleanContraction:null,fullRelease,discomfort,postTension,recommendation:discomfort||postTension||!fullRelease?'relax':'repeat',at:new Date().toISOString(),origin:'dailyPlan',day:entryContext.day,activityId:'pelvic-daily-lab',intent:'daily-relax',weekly:note};
 try{
  const state=parent.getState?.()||{},prior=Array.isArray(state['pf-results'])?state['pf-results']:[];
  const recent=[...prior,result].slice(-60);
  if(parent.write('pf-results',recent)!==true||parent.write('pf-daily-result',result)!==true)throw Error('No se pudo preparar el registro');
  if(parent.onResult(result)!==true)throw Error('El programa no aceptó el registro de esta sesión');
  all.saved=true;all.stage='saved';all.error='';render();
 }catch{all.error='No pudimos guardar tu respuesta. Reintenta; la actividad no ha avanzado.';render();}
}
function handle(e){
 const choice=e.target.closest('[data-choice]');if(choice){choose(choice.dataset.choice,choice.dataset.value);return;}
 const posture=e.target.closest('[data-posture]');if(posture){all.posture=posture.dataset.posture;render();return;}
 const act=e.target.closest('[data-action]')?.dataset.action;if(!act)return;
 if(act==='audio-intro'){if(audio.src?.endsWith('pf.s03.awareness-20261113-v2.mp3')&&!audio.paused){audio.pause();return;}speak('pf.s03.awareness-20261113-v2.mp3');return;}
 if(act==='continue-recognition'){stopVoice();all.stage='recognition';render();return;}
 if(act==='to-position'){if(all.awareness){all.stage='position';render();}return;}
 if(act==='start'){run();return;}
 if(act==='pause-resume'){if(all.since!==null)pause();else run();return;}
 if(act==='stop'){pause();all.interrupted=true;all.stage='interrupted';render();return;}
 if(act==='save'){void saveResult();return;}
 if(act==='retry'){all.stage='position';all.elapsed=0;all.started=false;all.phase=-1;all.interrupted=false;render();return;}
 if(act==='return'){pause();stopVoice();void parent.close?.();return;}
}
// Initialize only after the authenticated host and weekly activity have been verified.
box.addEventListener('click',handle);
document.head.appendChild(style);document.body.appendChild(audio);document.body.appendChild(box);window.dispatchEvent(new Event('spm:pelvic-pause'));root.style.display='none';
window.__SPM_PELVIC_WEEKLY_V1__={week,day:entryContext.day,phases:PHASES.map(({label,seconds})=>({label,seconds})),pause};
window.addEventListener('pagehide',()=>{pause();stopVoice();},{once:true});
window.addEventListener('spm:pelvic-pause',()=>{pause();stopVoice();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
render();
})();