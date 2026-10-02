(()=>{
'use strict';
const KEY='spm_free_assessment_v2',LEGACY_KEY='spm_free_assessment_v1',LEGACY_RECEIPT='spm_free_assessment_receipt_v1';
const RETENTION_MS=7*24*60*60*1000;
const $=s=>document.querySelector(s);
const lang=()=>window.SPM_LANGUAGE?.get?.()||'es';
const t=(es,en)=>lang()==='en'?en:es;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let api=null,draft=null,result=null,record=null,expiryTimer=null,stage='landing',busy=false,storageAvailable=true;
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
function surface(html){$('#authScreen').hidden=true;$('#appScreen').hidden=true;const el=$('#spmGuestSurface');el.hidden=false;el.innerHTML=html;window.scrollTo({top:0,behavior:'instant'});const heading=el.querySelector('h1,h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}}
function button(label,id,secondary=false){return `<button type="button" id="${id}" class="spmGuestButton${secondary?' secondary':''}">${label}</button>`}
function note(){return `<p class="spmGuestNote">${t('Mayores de 18 años. Orientación educativa; no sustituye una valoración médica.','For adults 18+. Educational guidance; not a substitute for medical evaluation.')}</p>`}
function renderLanding(){
 stage='landing';surface(`<div class="spmGuestLanding"><div class="spmGuestIntro"><span class="spmGuestEyebrow">${t('TU PRIMER PASO ES GRATIS','YOUR FIRST STEP IS FREE')}</span><h1>${t('Tu bienestar sexual empieza por conocerte.','Sexual wellbeing starts with understanding yourself.')}</h1><p class="spmGuestLead">${t('Explora tu erección, control, deseo y confianza. Descubre qué áreas conviene trabajar primero con una evaluación adaptada a ti.','Explore your erections, control, desire and confidence. Discover which areas to work on first with an assessment tailored to you.')}</p><div class="spmGuestFacts"><span>${t('Gratis','Free')}</span><span>${t('Sin registro','No sign-up')}</span><span>${t('A tu ritmo','At your pace')}</span></div>${button(draft?t('Retomar mi evaluación','Resume my assessment'):t('Comenzar mi evaluación gratuita','Start my free assessment'),'spmGuestStart')}<p class="spmGuestPrivacy">${t('Empieza sin correo ni contraseña. Tú decides después si quieres activar tu programa de 28 días.','Start without an email or password. Decide afterward whether to activate your 28-day program.')}</p><p class="spmGuestNote">${temporaryNote()}</p>${draft?button(t('Borrar esta evaluación y empezar de nuevo','Clear this assessment and start again'),'spmGuestClear',true):''}${note()}</div><figure class="spmGuestHero"><img src="assets/commercial-cinema/spm-confident-moment-v3.webp" width="1586" height="992" alt="${t('Un hombre adulto sonríe con confianza, arropado en la cama junto a su pareja.','An adult man smiles confidently, covered by the bedding beside his partner.')}"><span class="spmGuestBrand">SPM</span><figcaption>${t('Un espacio para ti.<br>Un primer paso hacia lo que buscas.','A space for you.<br>A first step toward what you want.')}</figcaption></figure></div>`);
 $('#spmGuestStart').onclick=()=>{if(expire())return;stage='assessment';api.start(draft)};
 $('#spmGuestClear')?.addEventListener('click',()=>{clear();renderLanding()});
}
function safetyHTML(){
 if(!result)return'';const urgent=result.urgent.length>0,ids=urgent?result.urgent:result.review;if(!ids.length)return'';
 const questions=window.ENGINE.assessment.questions;
 return `<aside class="spmGuestSafety ${urgent?'urgent':''}" role="status"><h2>${urgent?t('Tu seguridad va primero.','Your safety comes first.'):t('Hay información que conviene revisar.','Some information needs a review.')}</h2><p>${urgent?t('Tus respuestas incluyen una señal que requiere valoración médica urgente antes de continuar con un programa de entrenamiento.','Your answers include a signal that needs urgent medical assessment before continuing with a training program.'):t('Tus respuestas incluyen información que conviene revisar con un profesional antes de avanzar con actividades de mayor intensidad.','Your answers include information to review with a professional before progressing to higher-intensity activities.')}</p><p>${t('Señales que marcaste en la evaluación:','Items you marked in the assessment:')}</p><ul>${ids.map(id=>{const q=questions.find(x=>x.id===id);return q?`<li>${esc(lang()==='en'?(q.prompt_en||q.prompt_es):q.prompt_es)}</li>`:''}).join('')}</ul></aside>`;
}
function renderResult(){
 stage='result';const p=priorities[result.primary]||priorities.lifestyle;
 surface(`<section class="spmGuestResult"><span class="spmGuestEyebrow">${t('TU ORIENTACIÓN INICIAL · GRATUITA','YOUR INITIAL GUIDANCE · FREE')}</span><h1>${t('Ya tienes un punto de partida.','You have a starting point.')}</h1>${safetyHTML()}${result.urgent.length?'':`<div class="spmGuestPriority"><span>${t('TU PRIORIDAD EDUCATIVA','YOUR EDUCATIONAL PRIORITY')}</span><h2>${esc(t(p[0],p[1]))}</h2><p>${esc(t(p[2],p[3]))}</p></div><p class="spmGuestLead">${t('Este es el primer vistazo a tu ruta. Tu programa de 28 días organiza qué practicar, en qué orden y cómo seguir tu evolución.','This is a first look at your path. Your 28-day program organizes what to practice, in what order and how to track your progress.')}</p>${button(t('Descubrir mi programa de 28 días','Discover my 28-day program'),'spmGuestOffer')}<p class="spmGuestReassure">${t('Tu evaluación ya está lista. Da el siguiente paso con un plan para ti.','Your assessment is ready. Take the next step with a plan for you.')}</p>`}<p class="spmGuestNote">${temporaryNote()}</p>${note()}${button(t('Volver al inicio','Back to the start'),'spmGuestHome',true)}</section>`);
 $('#spmGuestOffer')?.addEventListener('click',openOffer);$('#spmGuestHome').onclick=renderLanding;
}
function openOffer(){if(expire()||!result||result.urgent.length)return;stage='offer';window.SPM_COMMERCIAL_GATE_PREVIEW.open()}
function renderAccount(mode='signup'){
 if(!result||result.urgent.length)return;stage='account';
 window.SPM_COMMERCIAL_PREVIEW?.close();window.SPM_COMMERCIAL_GATE_PREVIEW?.close();
 surface(`<section class="spmGuestAccount"><span class="spmGuestEyebrow">${t('ACTIVA TU SIGUIENTE PASO','ACTIVATE YOUR NEXT STEP')}</span><h1>${t('Conserva tu punto de partida.','Keep your starting point.')}</h1><p class="spmGuestLead">${t('Tu evaluación ya está lista. Crea tu cuenta para guardarla y preparar el acceso a tu programa SPM.','Your assessment is ready. Create your account to save it and prepare access to your SPM program.')}</p><div class="spmGuestAccountPrice"><b>US$39</b><span>${t('Pago único · Programa completo de 28 días','One-time payment · Complete 28-day program')}</span></div><form id="spmGuestAccountForm"><label for="spmGuestEmail">${t('Correo electrónico','Email address')}</label><input id="spmGuestEmail" type="email" autocomplete="email" required><label for="spmGuestPassword">${t('Contraseña','Password')}</label><input id="spmGuestPassword" type="password" minlength="6" autocomplete="${mode==='signup'?'new-password':'current-password'}" required><p class="spmGuestNote">${t('Mínimo 6 caracteres. Al continuar, asocias esta evaluación a tu cuenta para conservarla.','At least 6 characters. Continuing links this assessment to your account so you can keep it.')}</p><button class="spmGuestButton" type="submit">${mode==='signup'?t('Crear cuenta y guardar mi evaluación','Create account and save my assessment'):t('Entrar y guardar mi evaluación','Sign in and save my assessment')}</button></form><p id="spmGuestAuthStatus" class="spmGuestAuthStatus" role="status" aria-live="polite"></p>${button(mode==='signup'?t('Ya tengo cuenta','I already have an account'):t('Crear una cuenta nueva','Create a new account'),'spmGuestAccountMode',true)}${button(t('Volver a mi programa','Back to my program'),'spmGuestBackOffer',true)}<p class="spmGuestNote">${t('La evaluación es gratuita. Crear una cuenta no realiza ningún cobro.','The assessment is free. Creating an account does not charge you.')}</p></section>`);
 $('#spmGuestAccountMode').onclick=()=>{if(!busy)renderAccount(mode==='signup'?'signin':'signup')};$('#spmGuestBackOffer').onclick=()=>{if(!busy)openOffer()};
 $('#spmGuestAccountForm').onsubmit=async e=>{
  e.preventDefault();if(busy||expire())return;const form=e.currentTarget;if(!form.reportValidity())return;
  busy=true;const controls=[...form.querySelectorAll('input,button')];controls.forEach(c=>c.disabled=true);const status=$('#spmGuestAuthStatus');status.textContent=t('Preparando tu cuenta…','Preparing your account…');
  try{
   const response=await api.authenticate(mode,$('#spmGuestEmail').value.trim(),$('#spmGuestPassword').value);
   if(response.error)throw response.error;
   $('#spmGuestPassword').value='';
   if(!response.data?.session){status.textContent=t('Revisa tu correo para confirmar la cuenta. Después, vuelve a esta pestaña y elige «Ya tengo cuenta» para guardar tu evaluación. No se ha realizado ningún cobro.','Check your email to confirm your account. Then return to this tab and choose “I already have an account” to save your assessment. You have not been charged.');return}
   status.textContent=t('Guardando tu evaluación…','Saving your assessment…');await api.save(record?.receipt||{});renderSaved();
  }catch(error){status.textContent=t('No pudimos completar este paso. Tu evaluación sigue disponible en esta pestaña. Comprueba los datos o vuelve a intentarlo.','We could not complete this step. Your assessment is still available in this tab. Check your details or try again.');}
  finally{busy=false;controls.forEach(c=>c.disabled=false);expire()}
 };
}
function renderSaved(){stage='saved';surface(`<section class="spmGuestAccount"><span class="spmGuestEyebrow">${t('EVALUACIÓN GUARDADA','ASSESSMENT SAVED')}</span><h1>${t('Tu punto de partida ya está en tu cuenta.','Your starting point is now in your account.')}</h1><p class="spmGuestLead">${t('El siguiente paso será activar tu programa completo de 28 días por US$39.','The next step will be to activate your complete 28-day program for US$39.')}</p><div class="spmGuestSafety"><b>${t('Versión de revisión · pagos desactivados','Review version · payments disabled')}</b><p>${t('El pago todavía no está disponible en esta versión. No se ha realizado ningún cobro ni activado un programa de pago.','Payment is not yet available in this version. You have not been charged and no paid program has been activated.')}</p></div>${button(t('Volver a ver mi programa','View my program again'),'spmGuestBackOffer',true)}</section>`);$('#spmGuestBackOffer').onclick=openOffer}
function translateChrome(){document.documentElement.lang=lang();document.querySelectorAll('[data-guest-es]').forEach(el=>el.textContent=el.dataset[lang()==='en'?'guestEn':'guestEs']);document.querySelectorAll('[data-guest-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.guestLang===lang())))}
window.SPM_GUEST_ENTRY={
 sectionLabel(key){const labels={goal:['Tu objetivo','Your goal'],lifestyle:['Hábitos','Lifestyle'],health:['Salud general','General health'],pelvic_floor:['Piso pélvico','Pelvic floor'],safety:['Seguridad','Safety'],erection:['Respuesta eréctil','Erectile response'],ejaculation:['Control eyaculatorio','Ejaculatory control'],desire:['Deseo y excitación','Desire and arousal'],confidence:['Confianza','Confidence'],wellbeing:['Bienestar y conexión','Wellbeing and connection']};const pair=labels[key];return pair?t(...pair):key.replaceAll('_',' ')},
 ready(handle){api=handle;loadDraft();translateChrome();renderLanding()},
 progress:saveProgress,
 receipt(value){if(record){record.receipt=value;persist()}},
 complete(value){if(expire()||!draft)return;result=value;window.SPM_INSIGHTS_PREVIEW?.close();window.SPM_COMMERCIAL_PREVIEW?.close();renderResult()}
};
document.addEventListener('click',e=>{
 const buy=e.target.closest('.spmGate .startPay');if(!buy||!result)return;e.preventDefault();e.stopImmediatePropagation();renderAccount();
},true);
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('[data-guest-lang]').forEach(b=>b.onclick=()=>{if(!busy)window.SPM_LANGUAGE.set(b.dataset.guestLang)});
});
window.addEventListener('spm:languagechange',()=>{
 translateChrome();if(!api)return;
 if(stage==='assessment'){api.refresh();return}
 if(stage==='landing')renderLanding();else if(stage==='result')renderResult();else if(stage==='offer'){window.SPM_COMMERCIAL_GATE_PREVIEW.close();openOffer()}else if(stage==='account')renderAccount();else if(stage==='saved')renderSaved();
});
window.addEventListener('focus',expire);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)expire()});
window.addEventListener('storage',e=>{
 if(busy||(e.key!==KEY&&e.key!==null))return;
 loadDraft();result=null;window.SPM_INSIGHTS_PREVIEW?.close();window.SPM_COMMERCIAL_PREVIEW?.close();window.SPM_COMMERCIAL_GATE_PREVIEW?.close();
 if(api)renderLanding();
});
})();
