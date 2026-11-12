(()=>{
'use strict';
const KEY='spm_free_assessment_v2',LEGACY_KEY='spm_free_assessment_v1',LEGACY_RECEIPT='spm_free_assessment_receipt_v1';
const RETENTION_MS=7*24*60*60*1000;
const $=s=>document.querySelector(s);
const lang=()=>window.SPM_LANGUAGE?.get?.()||'es';
const t=(es,en)=>lang()==='en'?en:es;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let api=null,draft=null,result=null,record=null,expiryTimer=null,stage='landing',busy=false,storageAvailable=true,returning=false;
let readyAudio=null,readyAudioAttempted=false;
const READY_AUDIO_PAUSED='spm_assessment_ready_audio_paused';
function removeLegacy(){try{sessionStorage.removeItem(LEGACY_KEY);sessionStorage.removeItem(LEGACY_RECEIPT)}catch{}}
function clear(){
 clearTimeout(expiryTimer);expiryTimer=null;draft=null;result=null;record=null;
 try{localStorage.removeItem(KEY)}catch{storageAvailable=false}removeLegacy();
}
function expire(){
 if(!record||Date.now()<record.expiresAt||busy)return false;
 clear();window.SPM_INSIGHTS_PREVIEW?.close();window.SPM_COMMERCIAL_PREVIEW?.close();window.SPM_COMMERCIAL_GATE_PREVIEW?.close();
 if(api)renderLanding();return true;
}
function scheduleExpiry(){clearTimeout(expiryTimer);if(record)expiryTimer=setTimeout(expire,Math.max(0,record.expiresAt-Date.now()))}
function persist(){
 try{localStorage.setItem(KEY,JSON.stringify(record));storageAvailable=true}catch{storageAvailable=false}
 scheduleExpiry();
}
function loadDraft(){
 let raw=null;record=null;draft=null;
 try{raw=localStorage.getItem(KEY);storageAvailable=true}catch{storageAvailable=false}
 if(raw){
  try{const saved=JSON.parse(raw);if(saved.version===2&&saved.draft?.version===1&&Number.isFinite(saved.expiresAt)&&Number.isFinite(saved.savedAt)&&saved.expiresAt===saved.savedAt+RETENTION_MS&&saved.expiresAt>Date.now())record=saved}catch{}
  if(!record){clear();return}
 }else{
  // Preserve a draft from the former tab-only entry once, then remove that copy.
  try{const old=JSON.parse(sessionStorage.getItem(LEGACY_KEY)||'null');if(old?.version===1){const now=Date.now();record={version:2,savedAt:now,expiresAt:now+RETENTION_MS,draft:old,receipt:JSON.parse(sessionStorage.getItem(LEGACY_RECEIPT)||'null')};persist()}}catch{}
 }
 removeLegacy();draft=record?.draft||null;scheduleExpiry();
}
function saveProgress(value){
 if(expire())return;
 const changed=JSON.stringify(draft)!==JSON.stringify(value);
 const answersChanged=draft&&JSON.stringify([draft.motives,draft.answers])!==JSON.stringify([value.motives,value.answers]);
 const now=Date.now();record={version:2,savedAt:changed||!record?now:record.savedAt,expiresAt:changed||!record?now+RETENTION_MS:record.expiresAt,draft:value,receipt:answersChanged?null:record?.receipt||null};
 draft=value;persist();
}
const priorities={
 erection:['Respuesta eréctil','Erectile response','Comprender tu respuesta eréctil y reconocer los hábitos y situaciones que la acompañan.','Understand your erectile response and recognize the habits and situations around it.'],
 ejaculation:['Control eyaculatorio','Ejaculatory control','Reconocer cómo aumenta tu excitación y trabajar la regulación de tu ritmo.','Recognize how your arousal rises and work on regulating your pace.'],
 desire:['Deseo y excitación','Desire and arousal','Identificar qué facilita tu deseo y qué puede estar frenándolo.','Identify what supports your desire and what may be holding it back.'],
 confidence:['Confianza y ansiedad de rendimiento','Confidence and performance anxiety','Trabajar la presión por rendir y la confianza durante la intimidad.','Work on performance pressure and confidence during intimacy.'],
 wellbeing:['Bienestar y conexión','Wellbeing and connection','Dar espacio a la comunicación, las sensaciones y el disfrute compartido.','Make room for communication, sensations and shared enjoyment.'],
 lifestyle:['Hábitos protectores y prevención','Protective habits and prevention','Priorizar los hábitos cotidianos que tienen mayor margen de trabajo en tu perfil.','Prioritize the everyday habits with the greatest room for work in your profile.']
};
function temporaryNote(){return storageAvailable?t('Tu borrador se guarda en este navegador hasta 7 días desde tu último avance. Puedes borrarlo desde el inicio. Si cambias de navegador o borras sus datos, no podrás recuperarlo aquí.','Your draft is saved in this browser for up to 7 days after your last progress. You can delete it from the start page. If you change browsers or clear browser data, you cannot recover it here.'):t('Tu navegador no permite guardar el borrador para otra visita. Mantén esta página abierta para continuar.','Your browser cannot save the draft for another visit. Keep this page open to continue.')}
function surface(html){stopMotivation();$('#authScreen').hidden=true;$('#appScreen').hidden=true;const el=$('#spmGuestSurface');el.hidden=false;el.innerHTML=html;window.scrollTo({top:0,behavior:'instant'});const heading=el.querySelector('h1,h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}}
function button(label,id,secondary=false){return `<button type="button" id="${id}" class="spmGuestButton${secondary?' secondary':''}">${label}</button>`}
function note(){return `<p class="spmGuestNote">${t('Mayores de 18 años. Orientación educativa; no sustituye una valoración médica.','For adults 18+. Educational guidance; not a substitute for medical evaluation.')}</p>`}

function privacyHTML(){return `<aside class="spmGuestPrivacyCard"><b>${t('Tu privacidad importa.','Your privacy matters.')}</b><p>${t('Tu evaluación y tu programa son privados. Tus respuestas y tu progreso no se muestran a otros usuarios. El acceso a tu programa está protegido por tu cuenta.','Your assessment and program are private. Other users cannot see your answers or progress. Access to your program is protected by your account.')}</p></aside>`}
function priceNote(){return `<p class="spmGuestPriceNote"><b>$149.000 COP</b> <span>${t('Un único pago. Sin mensualidades, anualidades ni cobros recurrentes.','One payment. No monthly, annual or recurring charges.')}</span></p>`}
function closeLayers(){stopMotivation();window.SPM_INSIGHTS_PREVIEW?.close();window.SPM_COMMERCIAL_PREVIEW?.close();window.SPM_COMMERCIAL_GATE_PREVIEW?.close()}
function assessmentActions(){return `<details class="spmGuestAssessmentActions"><summary>${t('¿Quieres corregir o añadir algo a tu evaluación?','Want to correct or add something to your assessment?')}</summary><div>${button(t('Editar mis respuestas','Edit my answers'),'spmGuestReview',true)}${button(t('Empezar el test de nuevo','Start the assessment over'),'spmGuestRestart',true)}</div></details>`}
function bindAssessmentActions(){$('#spmGuestReview')?.addEventListener('click',reviewAssessment);$('#spmGuestRestart')?.addEventListener('click',restartAssessment)}
function reviewAssessment(){if(busy||expire()||!draft)return;closeLayers();returning=false;stage='assessment';api.review(draft)}
function restartAssessment(){
 if(busy||expire())return;closeLayers();stage='restart';
 surface(`<section class="spmGuestAccount"><h1>${t('¿Quieres empezar una nueva evaluación?','Start a new assessment?')}</h1><p class="spmGuestLead">${t('Se borrará el borrador de este navegador para que puedas responder desde cero. Esto no elimina un programa ya activado ni cancela un pago.','This browser’s draft will be cleared so you can answer from the beginning. This does not delete an activated program or cancel a payment.')}</p>${button(t('Sí, empezar desde cero','Yes, start from the beginning'),'spmGuestRestartConfirm')}${button(t('Conservar mi evaluación','Keep my assessment'),'spmGuestRestartCancel',true)}</section>`);
 $('#spmGuestRestartConfirm').onclick=()=>{if(busy)return;clear();returning=false;stage='assessment';api.start(null)};
 $('#spmGuestRestartCancel').onclick=()=>{if(result)renderResult();else renderLanding()};
}
function previewHTML(){
 const p=priorities[result.primary]||priorities.lifestyle,a=draft?.answers||{};
 const low=id=>Number.isFinite(Number(a[id]))&&Number(a[id])>=1&&Number(a[id])<=2;
 const high=id=>Number(a[id])>=4&&Number(a[id])<=5;
 const signals=[];
 if(high('c_monitor')||high('c_fail'))signals.push([t('Presión por el desempeño','Performance pressure'),t('Indicas que vigilar tu respuesta o pensar en fallar aparece con frecuencia. Es un área que tu ruta puede ayudarte a explorar.','You report frequent monitoring of your response or thoughts about failure. Your pathway can help you explore this area.')]);
 if(low('d_desire')||low('d_init'))signals.push([t('Deseo e interés sexual','Sexual desire and interest'),t('Tus respuestas reflejan menor satisfacción con tu deseo o poco interés en iniciar intimidad. Tu ruta puede incluir actividades para comprenderlo.','Your answers reflect lower satisfaction with desire or little interest in initiating intimacy. Your pathway can include activities to understand it.')]);
 if(high('l_stress'))signals.push([t('Estrés cotidiano','Everyday stress'),t('Señalas que el estrés afecta con frecuencia tu energía, ánimo o intimidad. Lo tendremos en cuenta al organizar tus apoyos.','You report that stress often affects your energy, mood or intimacy. We will take this into account when organizing your support activities.')]);
 if(low('l_sleep'))signals.push([t('Descanso','Rest'),t('Indicas que no siempre consigues un sueño suficiente y reparador. Es un hábito que conviene observar dentro de tu proceso.','You report that adequate, restorative sleep is not consistent. This is a habit to observe during your journey.')]);
 if(['unsure','no_control','hard_to_relax'].includes(a.pf_awareness))signals.push([t('Conciencia del piso pélvico','Pelvic floor awareness'),t('Has señalado dificultad para identificar, controlar o relajar estos músculos. Tu respuesta orienta el aprendizaje; no permite determinar por sí sola su tono muscular.','You reported difficulty identifying, controlling or relaxing these muscles. This guides learning; it cannot determine muscle tone on its own.')]);
 if(!signals.length&&result.secondary&&priorities[result.secondary]){const q=priorities[result.secondary];signals.push([t(q[0],q[1]),t(q[2],q[3])])}
 return `<div class="spmGuestPriority"><span>${t('ÁREA PRINCIPAL PARA EXPLORAR','MAIN AREA TO EXPLORE')}</span><h2>${esc(t(p[0],p[1]))}</h2><p>${esc(t(p[2],p[3]))}</p></div>${signals.length?`<section class="spmGuestSignals"><h2>${t('Lo que sugieren tus respuestas','What your answers suggest')}</h2><ul>${signals.slice(0,2).map(([title,copy])=>`<li><b>${esc(title)}</b><p>${esc(copy)}</p></li>`).join('')}</ul></section>`:''}<p class="spmGuestReassure">${t('Este primer vistazo identifica áreas para trabajar según lo que nos contaste. No confirma causas ni constituye un diagnóstico.','This first look identifies areas to work on based on what you told us. It does not confirm causes or constitute a diagnosis.')}</p>`;
}
function includedHTML(){return `<section class="spmGuestIncluded"><h2>${t('Al activar tu programa, accedes a:','When you activate your program, you get:')}</h2><ul><li><span aria-hidden="true">🔒</span> ${t('Tu interpretación educativa ampliada y tu Performance Map™.','Your expanded educational interpretation and Performance Map™.')}</li><li><span aria-hidden="true">🔒</span> ${t('Tu ruta de 28 días: qué practicar cada día, con actividades guiadas, videos y biblioteca.','Your 28-day pathway: what to practice each day, with guided activities, videos and a library.')}</li><li><span aria-hidden="true">🔒</span> ${t('Registro de prácticas y evaluaciones de seguimiento para observar tu evolución.','Practice records and follow-up assessments to observe your progress.')}</li></ul></section>`}

// First completion and return visits share one continuous, audiovisual offer.
const returnMessages={
 erection:['Entrena tu firmeza. Trabaja tu confianza.','Train for firmness. Work on confidence.','Firmeza','Firmness'],
 ejaculation:['Conoce tu excitación. Entrena tu ritmo.','Know your arousal. Practice your pace.','Control del ritmo','Pace control'],
 desire:['Dale espacio a tu deseo. Sin presión.','Make room for desire. Without pressure.','Deseo','Desire'],
 confidence:['Practica calma. Conecta con el momento.','Practice calm. Connect with the moment.','Calma y confianza','Calm and confidence'],
 wellbeing:['Explora tus sensaciones. Cuida tu conexión.','Explore sensations. Nurture connection.','Placer y conexión','Pleasure and connection'],
 lifestyle:['Activa hábitos que cuidan de ti.','Build habits that support you.','Bienestar','Wellbeing']
};
function returnFocus(){
 const selected=(draft?.motives||[]).map(k=>k==='optimization'?'lifestyle':k).filter(k=>returnMessages[k]);
 const key=selected.includes(result.primary)?result.primary:(selected[0]||result.primary);
 return {key: returnMessages[key]?key:'lifestyle',selected};
}
function motivationText(){return t('Tu evaluación ya está lista. Ya diste el primer paso: conocerte mejor. Ahora puedes pasar a la acción con una ruta de veintiocho días, prácticas guiadas y herramientas para trabajar tu confianza. Un paso cada día, a tu ritmo.','Your assessment is ready. You have already taken the first step: understanding yourself better. Now you can put that insight into practice with a twenty eight day pathway, guided activities, and tools to work on your confidence. One step each day, at your own pace.')}
function motivationHTML(){return `<div class="spmGuestMotivation"><audio id="spmGuestMotivationAudio" preload="none" src="assets/audio/assessment-ready-v1-${lang()==='en'?'en':'es'}.mp3"></audio><button type="button" id="spmGuestMotivationToggle" aria-controls="spmGuestMotivationAudio" data-state="idle"><span class="spmGuestAudioIcon" aria-hidden="true">▶︎</span><span><b data-audio-label>${t('Escucha este mensaje para ti','Listen to a message for you')}</b><small>${t('Un impulso para empezar · 14 s','A little encouragement · 16 s')}</small></span><span class="spmGuestAudioWave" aria-hidden="true"><i></i><i></i><i></i><i></i></span></button><details class="spmGuestTranscript"><summary>${t('Leer mensaje','Read message')}</summary><p>${motivationText()}</p></details></div>`}
function stopMotivation(){const audio=readyAudio;if(audio){audio.pause();audio.currentTime=0}readyAudio=null}
function bindMotivation(){
 const audio=$('#spmGuestMotivationAudio'),control=$('#spmGuestMotivationToggle');if(!audio||!control)return;readyAudio=audio;let request=0;
 const draw=state=>{control.dataset.state=state;control.querySelector('.spmGuestAudioIcon').textContent=state==='playing'?'Ⅱ':state==='loading'?'…':'▶︎';control.querySelector('[data-audio-label]').textContent=state==='playing'?t('Pausar mensaje','Pause message'):state==='loading'?t('Preparando audio…','Loading audio…'):t('Escucha este mensaje para ti','Listen to a message for you');};
 const play=async()=>{
  const attempt=++request;draw('loading');
  try{await audio.play();if(readyAudio!==audio||attempt!==request||document.hidden||!audio.isConnected){audio.pause();return}draw('playing')}
  catch{if(readyAudio===audio&&attempt===request)draw('idle')}
 };
 control.onclick=()=>{
  if(control.dataset.state==='playing'||control.dataset.state==='loading'){request++;audio.pause();draw('idle');try{sessionStorage.setItem(READY_AUDIO_PAUSED,'1')}catch{}}
  else{try{sessionStorage.removeItem(READY_AUDIO_PAUSED)}catch{}play()}
 };
 audio.addEventListener('ended',()=>{if(readyAudio===audio)draw('idle')});
 audio.addEventListener('pause',()=>{request++;if(readyAudio===audio)draw('idle')});
 audio.addEventListener('error',()=>{if(readyAudio===audio){draw('idle');control.querySelector('[data-audio-label]').textContent=t('Reintentar audio','Retry audio')}});
 let paused=false;try{paused=sessionStorage.getItem(READY_AUDIO_PAUSED)==='1'}catch{}
 // One attempt per page visit. A blocked autoplay never intercepts an unrelated click.
 if(returning&&!readyAudioAttempted&&!paused&&!document.hidden){readyAudioAttempted=true;play()}
}
function returnExperienceHTML(){
 const {key,selected}=returnFocus(),message=returnMessages[key];
 const keywords=[...new Set([key,...selected])].slice(0,3).map(k=>`<span>${esc(t(returnMessages[k][2],returnMessages[k][3]))}</span>`).join('');
 return `<section class="spmGuestResult spmGuestReturn spmGuestUnified" data-focus="${key}">
  <header class="spmGuestReturnHero"><img src="assets/commercial-cinema/spm-new-beginning-v1.webp" width="1586" height="992" fetchpriority="high" alt="${t('Un hombre adulto avanza al aire libre, con la luz del amanecer.','An adult man walks outdoors in the morning light.')}"><div class="spmGuestReturnCopy"><span class="spmGuestReadyBadge"><span aria-hidden="true">✓</span> ${t('Tu evaluación ya está lista.','Your assessment is ready.')}</span><h1>${esc(t(message[0],message[1]))}</h1><p>${t('Una ruta para ti. Un paso cada día.','A pathway for you. One step each day.')}</p><div class="spmGuestReturnKeywords" aria-label="${t('Lo que quieres trabajar','What you want to work on')}">${keywords}</div></div></header>
  <div class="spmGuestReturnBody">${motivationHTML()}${safetyHTML()}
   <div class="spmGuestReturnPurchase">${priceNote()}<button type="button" id="spmGuestOffer" class="spmGuestButton" data-guest-start>${t('Iniciar mi programa →','Start my program →')}</button></div>
   <section class="spmGuestEvaluation" aria-label="${t('Tu orientación inicial','Your initial guidance')}"><h2>${t('Esto es lo que vamos a trabajar contigo.','Here is what we will work on with you.')}</h2>${previewHTML()}</section>
   <section class="spmGuestReturnBenefits" aria-label="${t('Lo que incluye tu programa','What your program includes')}">
    <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5ZM9 3v16m6-14v16"/></svg><b>${t('Conócete','Understand')}</b><span>Performance Map™</span></div>
    <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="4"/><path d="m10 8 6 4-6 4V8Z"/></svg><b>${t('Practica','Practice')}</b><span>${t('Guías, videos y biblioteca','Guides, videos & library')}</span></div>
    <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 4v16h17M8 16v-4m5 4V9m5 7V5"/></svg><b>${t('Observa tu avance','Track progress')}</b><span>${t('28 días + seguimiento','28 days + follow-ups')}</span></div>
   </section>
   <div id="spmGuestCommercial"></div>
   <section id="spmGuestCheckout" class="spmGuestCheckout" aria-label="${t('Pago de tu programa','Program payment')}" hidden></section>
   ${assessmentActions()}<footer class="spmGuestReturnFooter"><span>${t('Orientación educativa, no un diagnóstico.','Educational guidance, not a diagnosis.')}</span></footer>
   <div class="spmGuestStartBar"><div><b>$149.000 COP</b><small>${t('Pago único · Sin suscripciones','One payment · No subscriptions')}</small></div><button type="button" class="spmGuestButton" data-guest-start>${t('Iniciar mi programa →','Start my program →')}</button></div>
  </div></section>`;
}

function renderLanding(){
 stage='landing';surface(`<section class="spmGuestLanding spmGuestLandingFocused" aria-label="${t('SPM Digital Wellness · Evaluación gratuita','SPM Digital Wellness · Free assessment')}"><div class="spmGuestIntro"><h1>${t('Conócete. Entrena. Avanza a tu ritmo.','Understand yourself. Practice. Move at your pace.')}</h1><p class="spmGuestLead">${t('Responde unas preguntas y descubre por dónde empezar tu bienestar sexual.','Answer a few questions and discover where to start with your sexual wellbeing.')}</p>${button(t('EMPEZAR MI EVALUACIÓN GRATUITA','START MY FREE ASSESSMENT'),'spmGuestStart')}<div class="spmGuestFacts"><span>${t('Gratis','Free')}</span><span>${t('Sin registro','No sign-up')}</span><span>${t('En pocos minutos','In a few minutes')}</span></div><p class="spmGuestPrivacyStatement"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></svg>${t('Tu evaluación es privada.','Your assessment is private.')}</p></div><figure class="spmGuestHero spmGuestEntryPhoto"><img src="assets/commercial-cinema/spm-new-beginning-v1.webp" width="1586" height="992" fetchpriority="high" alt="${t('Un hombre adulto, solo y tranquilo, mira hacia la luz desde una terraza.','An adult man, alone and calm, looks toward the light from a terrace.')}"></figure></section><footer class="spmGuestEntryFooter"><span>${t('Para mayores de 18 años. Orientación educativa.','For adults 18+. Educational guidance.')}</span>${draft?button(t('Borrar este borrador y empezar de nuevo','Clear this draft and start again'),'spmGuestClear',true):''}</footer>`);
 $('#spmGuestStart').onclick=()=>{if(expire())return;returning=draft?.stage==='result';stage='assessment';api.start(draft)};
 $('#spmGuestClear')?.addEventListener('click',restartAssessment);
}
function safetyHTML(){
 if(!result)return'';const urgent=result.urgent.length>0,ids=urgent?result.urgent:result.review;if(!ids.length)return'';
 const questions=window.ENGINE.assessment.questions;
 return `<aside class="spmGuestSafety ${urgent?'urgent':''}" role="status"><h2>${urgent?t('Tu seguridad va primero.','Your safety comes first.'):t('Hay información que conviene revisar.','Some information needs a review.')}</h2><p>${urgent?t('Tus respuestas incluyen una señal que requiere valoración médica urgente antes de continuar con un programa de entrenamiento.','Your answers include a signal that needs urgent medical assessment before continuing with a training program.'):t('Tus respuestas incluyen información que conviene revisar con un profesional antes de avanzar con actividades de mayor intensidad.','Your answers include information to review with a professional before progressing to higher-intensity activities.')}</p><p>${t('Señales que marcaste en la evaluación:','Items you marked in the assessment:')}</p><ul>${ids.map(id=>{const q=questions.find(x=>x.id===id);return q?`<li>${esc(lang()==='en'?(q.prompt_en||q.prompt_es):q.prompt_es)}</li>`:''}).join('')}</ul></aside>`;
}
function renderResult(){
 stage='result';closeLayers();
 if(!result.urgent.length){surface(returnExperienceHTML());window.SPM_COMMERCIAL_GATE_PREVIEW.mount($('#spmGuestCommercial'));bindAssessmentActions();bindMotivation();return}
 surface(`<section class="spmGuestResult"><span class="spmGuestEyebrow">${t('TU ORIENTACIÓN INICIAL · GRATUITA','YOUR INITIAL GUIDANCE · FREE')}</span><h1>${returning?t('Tu evaluación ya está lista.','Your assessment is ready.'):t('Hemos analizado tus respuestas.','We have reviewed your answers.')}</h1>${returning?`<p class="spmGuestLead">${t('Ya completaste el test. Tu siguiente paso es activar tu ruta de 28 días; también puedes revisar tus respuestas o hacer una nueva evaluación antes de decidir.','You have completed the assessment. Your next step is to activate your 28-day pathway; you can also review your answers or take a new assessment before deciding.')}</p>`:''}${safetyHTML()}${result.urgent.length?'':`${previewHTML()}${includedHTML()}<p class="spmGuestLead">${t('Comprender tu punto de partida es el comienzo. Descubre cómo convertirlo en una práctica diaria, paso a paso y a tu ritmo.','Understanding your starting point is the beginning. Discover how to turn it into daily practice, step by step and at your pace.')}</p>${priceNote()}${button(t('Descubrir mi programa de 28 días','Discover my 28-day program'),'spmGuestOffer')}`}${assessmentActions()}<p class="spmGuestNote">${temporaryNote()}</p>${note()}${button(t('Volver al inicio','Back to the start'),'spmGuestHome',true)}</section>`);
 $('#spmGuestOffer')?.addEventListener('click',openOffer);$('#spmGuestHome').onclick=renderLanding;bindAssessmentActions();
}
function openOffer(){if(expire()||!result||result.urgent.length)return;renderResult()}
function focusCheckout(){const host=$('#spmGuestCheckout');if(!host)return;host.scrollIntoView({block:'start',behavior:'instant'});const heading=host.querySelector('h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}}
function paymentSurface(html){stopMotivation();window.SPM_COMMERCIAL_PREVIEW?.close();const host=$('#spmGuestCheckout');if(!host)return;host.hidden=false;host.innerHTML=html;focusCheckout()}
function startPayment(){
 if(busy||expire()||!result||result.urgent.length)return;
 const host=$('#spmGuestCheckout');if(host&&!host.hidden){focusCheckout();return}
 if(record?.receipt?.assessmentId)renderSaved(true);else renderAccount();
}
function renderAccount(mode='signup'){
 if(!result||result.urgent.length)return;stage='account';
 paymentSurface(`<section class="spmGuestAccount"><span class="spmGuestEyebrow">${t('ACTIVA TU SIGUIENTE PASO','ACTIVATE YOUR NEXT STEP')}</span><h2>${t('Prepara tu pago seguro.','Prepare your secure payment.')}</h2><p class="spmGuestLead">${t('Elige el correo y la contraseña con los que entrarás a tu programa. Continuarás al pago seguro con Wompi.','Choose the email and password you will use to access your program. Continue to secure payment with Wompi.')}</p><div class="spmGuestAccountPrice"><b>$149.000 COP</b><span>${t('Pago único · 28 días · Sin mensualidades ni anualidades','One payment · 28 days · No monthly or annual fees')}</span></div><form id="spmGuestAccountForm"><label for="spmGuestEmail">${t('Correo electrónico','Email address')}</label><input id="spmGuestEmail" type="email" autocomplete="email" required><label for="spmGuestPassword">${t('Contraseña','Password')}</label><input id="spmGuestPassword" type="password" minlength="6" autocomplete="${mode==='signup'?'new-password':'current-password'}" required><p class="spmGuestNote">${t('Mínimo 6 caracteres. Al continuar, asocias esta evaluación a tu cuenta para conservarla.','At least 6 characters. Continuing links this assessment to your account so you can keep it.')}</p><button class="spmGuestButton" type="submit">${mode==='signup'?t('Crear mi acceso y pagar con Wompi','Create my access and pay with Wompi'):t('Entrar y pagar con Wompi','Sign in and pay with Wompi')}</button></form><p id="spmGuestAuthStatus" class="spmGuestAuthStatus" role="status" aria-live="polite"></p>${button(mode==='signup'?t('Ya tengo cuenta','I already have an account'):t('Crear una cuenta nueva','Create a new account'),'spmGuestAccountMode',true)}<p class="spmGuestNote">${t('La evaluación es gratuita. Crear una cuenta no realiza ningún cobro.','The assessment is free. Creating an account does not charge you.')}</p></section>`);
 $('#spmGuestAccountMode').onclick=()=>{if(!busy)renderAccount(mode==='signup'?'signin':'signup')};
 $('#spmGuestAccountForm').onsubmit=async e=>{
  e.preventDefault();if(busy||expire())return;const form=e.currentTarget;if(!form.reportValidity())return;
  busy=true;const controls=[...form.querySelectorAll('input,button')];controls.forEach(c=>c.disabled=true);const status=$('#spmGuestAuthStatus');status.textContent=t('Preparando tu cuenta…','Preparing your account…');
  try{
   const response=await api.authenticate(mode,$('#spmGuestEmail').value.trim(),$('#spmGuestPassword').value);
   if(response.error)throw response.error;
   $('#spmGuestPassword').value='';
   if(!response.data?.session){status.textContent=t('Revisa tu correo para confirmar la cuenta. Después, vuelve a esta pestaña y elige «Ya tengo cuenta» para guardar tu evaluación. No se ha realizado ningún cobro.','Check your email to confirm your account. Then return to this tab and choose “I already have an account” to save your assessment. You have not been charged.');return}
   status.textContent=t('Guardando tu evaluación…','Saving your assessment…');await api.save(record?.receipt||{});renderSaved(true);
  }catch(error){status.textContent=t('No pudimos completar este paso. Tu evaluación sigue disponible en esta pestaña. Comprueba los datos o vuelve a intentarlo.','We could not complete this step. Your assessment is still available in this tab. Check your details or try again.');}
  finally{busy=false;controls.forEach(c=>c.disabled=false);expire()}
 };
}
function renderSaved(autoContinue=false){
 stage='saved';paymentSurface(`<section class="spmGuestAccount"><h2>${t('Tu siguiente paso: el pago seguro.','Your next step: secure payment.')}</h2>${priceNote()}<button type="button" id="spmGuestPay" class="spmGuestButton" disabled>${t('Pagar con Wompi · $149.000 COP','Pay with Wompi · $149.000 COP')}</button><p id="spmGuestPaymentState" class="spmGuestNote" role="status">${t('Comprobando disponibilidad de pago…','Checking payment availability…')}</p></section>`);
 const pay=$('#spmGuestPay'),status=$('#spmGuestPaymentState');
 window.SPM_PAYMENTS?.configuration().then(config=>{
  if(stage!=='saved'||!pay.isConnected)return;
  if(!config.ready){status.textContent=t('El pago aún no está habilitado. Tu evaluación está guardada; no se ha realizado ningún cobro.','Payment is not enabled yet. Your assessment is saved; you have not been charged.');return}
  status.textContent=config.environment==='test'?t('Modo de prueba: no se cobra dinero real. Disponible para cuentas de prueba autorizadas.','Test mode: no real money is charged. Available to authorized test accounts.'):t('Al confirmar el pago, accedes a tu bienvenida y evaluación personalizada.','After payment is confirmed, open your welcome and personalized assessment.');
  pay.disabled=false;if(config.environment==='test')pay.textContent=t('Probar el pago con Wompi','Test payment with Wompi');if(autoContinue)pay.click();
 }).catch(()=>{status.textContent=t('No pudimos comprobar el pago ahora. Tu evaluación sigue guardada. Vuelve a intentar más tarde.','We could not check payment availability. Your assessment is saved. Please try again later.');});
 pay.onclick=async()=>{if(busy)return;stopMotivation();busy=true;pay.disabled=true;try{await api.checkout(record?.receipt||{});}catch(error){if(error.message==='sign_in_required'){renderAccount('signin');return}status.textContent=t('No se pudo abrir el pago. Tu evaluación se conserva. Reintenta; no se ha realizado ningún cobro desde esta pantalla.','Could not open checkout. Your assessment is saved. Retry; this screen has not charged you.');pay.disabled=false;}finally{busy=false;}};
}
function translateChrome(){document.documentElement.lang=lang();document.querySelectorAll('[data-guest-es]').forEach(el=>el.textContent=el.dataset[lang()==='en'?'guestEn':'guestEs']);document.querySelectorAll('[data-guest-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.guestLang===lang())))}
window.SPM_GUEST_ENTRY={
 sectionLabel(key){const labels={goal:['Tu objetivo','Your goal'],lifestyle:['Hábitos','Lifestyle'],health:['Salud general','General health'],pelvic_floor:['Piso pélvico','Pelvic floor'],safety:['Seguridad','Safety'],erection:['Respuesta eréctil','Erectile response'],ejaculation:['Control eyaculatorio','Ejaculatory control'],desire:['Deseo y excitación','Desire and arousal'],confidence:['Confianza','Confidence'],wellbeing:['Bienestar y conexión','Wellbeing and connection']};const pair=labels[key];return pair?t(...pair):key.replaceAll('_',' ')},
 ready(handle){api=handle;loadDraft();translateChrome();returning=draft?.stage==='result';if(returning){stage='assessment';api.start(draft)}else renderLanding()},
 review:reviewAssessment,
 restart:restartAssessment,
 showResult(){if(!busy&&result)renderResult()},
 progress:saveProgress,
 receipt(value){if(record){record.receipt=value;persist()}},
 complete(value){if(expire()||!draft)return;result=value;closeLayers();renderResult()}
};
document.addEventListener('click',e=>{
 if(e.target.closest('.spmOfferFilm'))stopMotivation();
 const buy=e.target.closest('[data-guest-start],.spmGate .startPay');if(!buy||!result)return;e.preventDefault();e.stopImmediatePropagation();startPayment();
},true);
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('[data-guest-lang]').forEach(b=>b.onclick=()=>{if(!busy)window.SPM_LANGUAGE.set(b.dataset.guestLang)});
});
window.addEventListener('spm:languagechange',()=>{
 translateChrome();if(!api)return;
 if(stage==='assessment'){api.refresh();return}
 if(stage==='landing')renderLanding();else if(stage==='result')renderResult();else if(stage==='offer'){window.SPM_COMMERCIAL_GATE_PREVIEW.close();openOffer()}else if(stage==='account'){const mode=$('#spmGuestPassword')?.autocomplete==='current-password'?'signin':'signup';renderResult();renderAccount(mode)}else if(stage==='saved'){renderResult();renderSaved()}else if(stage==='restart')restartAssessment();
});
window.addEventListener('focus',expire);
document.addEventListener('visibilitychange',()=>{if(document.hidden)readyAudio?.pause();else expire()});
window.addEventListener('pagehide',stopMotivation);
window.addEventListener('storage',e=>{
 if(busy||(e.key!==KEY&&e.key!==null))return;
 loadDraft();result=null;window.SPM_INSIGHTS_PREVIEW?.close();window.SPM_COMMERCIAL_PREVIEW?.close();window.SPM_COMMERCIAL_GATE_PREVIEW?.close();
 if(api)renderLanding();
});
})();
