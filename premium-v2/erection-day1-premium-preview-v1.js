(function installErectionDay1Premium(){
'use strict';
if(window.SPM_ERECTION_DAY1_PREMIUM)return;
const original=window.SPM_ERECTION_PRACTICE;
if(!original)return;
const previousOpen=original.open.bind(original),previousStop=original.stop.bind(original),previousPause=original.pause.bind(original);
const day=1;
const ehsAudio='/premium-v2/assets/audio/erection/erection-day-1-ehs-20261113.mp3';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const texts=[
'Bienvenido al primer día de Erección y firmeza. Hoy vamos a establecer tu punto de partida y a conocer el mecanismo de la respuesta eréctil. Después podrás realizar una primera práctica breve. No necesitas provocar ni demostrar una erección.',
'Recuerda una experiencia real y reciente. Mira las descripciones de firmeza y elige la que corresponda. Cero significa ausencia de respuesta; No evaluable significa que no tuviste una experiencia que puedas valorar. Son opciones distintas. No hagas una prueba de erección para responder.',
'La excitación puede aumentar el flujo sanguíneo hacia los tejidos eréctiles del pene. Nervios, vasos sanguíneos y estado de salud influyen en este proceso. La firmeza puede variar y una sola experiencia no define tu capacidad.',
'Hoy vas a entrenar el inicio de la activación sexual sin examinar tu rigidez. Si te resulta cómodo, reserva tres a cinco minutos en privado y elige un estímulo erótico que te resulte agradable, como un recuerdo, una fantasía o contacto genital suave y voluntario. Permanece atento al estímulo, no a comprobar si la erección funciona. Si te descubres evaluando la firmeza, regresa al estímulo con calma. Puede aparecer una respuesta corporal o no. Si sientes presión o incomodidad, detente. Puedes omitir la actividad.',
'Hoy registraste la firmeza de una experiencia previa y, si lo elegiste, entrenaste la atención a un estímulo erótico sin comprobar continuamente la rigidez. El objetivo de la práctica es desarrollar esta habilidad, no provocar una erección inmediata. La evaluación inicial se guarda una sola vez y tu ruta de veintiocho días continúa sin cambios.'
];
const titles=['Mi punto de partida','Reconoce tu firmeza','Comprende tu respuesta','Activa tu respuesta eréctil','Tu primer paso'];
let current=null,token=0,player=null,speech=null,timer=null;
function stopAudioOnly(){
try{player?.pause();player=null;}catch(_){}
try{window.speechSynthesis?.cancel();speech=null;}catch(_){}
}
function stopMedia(){
stopAudioOnly();
if(timer!==null){clearInterval(timer);timer=null;}
if(current?.running){current.seconds+=Math.floor((Date.now()-current.timerSince)/1000);current.running=false;}
}
function stop(){
token++;current=null;stopMedia();
}
function pause(){stopMedia();}
function context(){return window.SPM_RESOURCE_CONTEXT?.();}
function allowed(c){const a=window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(x=>x.id==='main');return c?.primary==='erection'&&Number(c.day)===day&&a?.kind==='erection'&&window.SPM_DAILY_PRACTICE?.restricted?.(c,a)===false;}
function matches(s){
return current===s&&s.token===token&&context()?.userId+':'+context()?.planId===s.scope&&Number(context()?.day)===day&&allowed(context())&&s.host.isConnected;
}
function play(s){
if(!matches(s))return;
stopAudioOnly();const index=s.page;
if(index===1){
  player=new Audio(ehsAudio);
  player.onended=()=>{if(matches(s))setStatus(s,'Guía terminada. Selecciona tu firmeza cuando quieras.');};
  player.onerror=()=>{if(matches(s))speak(s,texts[index]);};
  player.play().catch(()=>speak(s,texts[index]));
  setStatus(s,'Escuchando la guía de firmeza…');return;
}
speak(s,texts[index]);
}
function speak(s,value){
if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){setStatus(s,'La voz de este dispositivo no está disponible; abre «Leer indicaciones».');return;}
const u=new SpeechSynthesisUtterance(value);u.lang='es-CO';u.rate=0.94;u.pitch=1;
const voices=window.speechSynthesis.getVoices?.()||[];
u.voice=voices.find(v=>/^es[-_]/i.test(v.lang)&&/female|mujer|femenina|latina|colombia/i.test(v.name))||voices.find(v=>/^es[-_]/i.test(v.lang))||null;
speech=u;u.onend=()=>{if(matches(s))setStatus(s,'Guía finalizada.');};
u.onerror=()=>{if(matches(s))setStatus(s,'No se pudo reproducir la guía; puedes leerla en el desplegable.');};
try{window.speechSynthesis.speak(u);setStatus(s,'Reproduciendo indicaciones…');}catch(_){setStatus(s,'No se pudo iniciar el audio. Abre «Leer indicaciones».');}
}
function setStatus(s,msg){const t=s.host.querySelector('[data-de1-status]');if(t)t.textContent=msg;}
function colors(){
if(document.getElementById('spmDeDay1PremiumStyle'))return;
const el=document.createElement('style');el.id='spmDeDay1PremiumStyle';
el.textContent=`
#spmDailyWorkspace .spm-de1{--ink:#10343b;--gold:#cfa349;--teal:#026b6b;color:var(--ink);font:inherit;width:min(620px,100%);margin:8px auto 24px;overflow:hidden;border-radius:26px;background:#f4fafb;box-shadow:0 20px 54px #0007}
.spm-de1 *{box-sizing:border-box}
.spm-de1 .de1-head{padding:22px 22px 13px;background:linear-gradient(130deg,#f7fdfe,#d3e8ec);border-bottom:1px solid #b6cfd3}
.spm-de1 .de1-brand{display:flex;justify-content:space-between;align-items:center;gap:10px;font-weight:850;color:#065451;font-size:13px;letter-spacing:.04em}
.spm-de1 .de1-chip{font-size:11px;background:#005c60;color:white;border-radius:999px;padding:7px 12px}
.spm-de1 .de1-head h2{font-size:clamp(27px,6vw,37px);line-height:1.12;color:#0d343c;margin:20px 0 8px;font-weight:850}
.spm-de1 .de1-prog{display:flex;gap:7px;margin-top:20px}.spm-de1 .de1-prog span{flex:1;height:5px;background:#b7d5d8;border-radius:10px}.spm-de1 .de1-prog span.on{background:#047277}
.spm-de1 .de1-body{padding:18px 20px 22px;background:radial-gradient(circle at 90% 0,#cfe5e9,#f7fbfc 65%)}
.spm-de1 .de1-hero{background:#e8f5f5;border-radius:22px;overflow:hidden;border:1px solid #d3e8e8;margin:0 0 14px}
.spm-de1 .de1-hero svg{width:100%;max-height:270px;height:auto;display:block}
.spm-de1 .de1-hero figcaption{font-weight:700;color:#204a4f;font-size:15px;padding:10px 15px}
.spm-de1 .de1-sub{color:#475f66;font-size:16px;line-height:1.5;margin:6px 0 17px}
.spm-de1 .de1-toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:14px 0}
.spm-de1 button{touch-action:manipulation}
.spm-de1 .de1-audio,.spm-de1 .de1-next,.spm-de1 .de1-back,.spm-de1 .de1-option{min-height:48px;border-radius:14px;font:inherit;cursor:pointer}
.spm-de1 .de1-audio{background:#e5f1f0;color:#075952;border:1px solid #5a9693;font-weight:750;padding:12px 16px}
.spm-de1 details{margin-bottom:16px}.spm-de1 summary{color:#45616b;font-size:14px;cursor:pointer}.spm-de1 details p{color:#355660;font-size:15px;line-height:1.6}
.spm-de1 .de1-firmness img{width:100%;height:auto;display:block;border-radius:12px}.spm-de1 .de1-firmness{margin:6px 0 16px}
.spm-de1 .de1-choices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:14px 0}
.spm-de1 .de1-option{border:1px solid #acd2d2;background:white;padding:12px 9px;font-size:14px;color:#11464c}
.spm-de1 .de1-option[aria-pressed=true]{background:#00636a;color:white;outline:2px solid #d5a648;font-weight:800}
.spm-de1 .de1-option strong{font-size:20px;display:block}.spm-de1 .de1-choices[data-kind=action]{grid-template-columns:1fr}
.spm-de1 .de1-flow{background:white;border-radius:18px;border:1px solid #d3e2e5;padding:18px;display:grid;gap:12px;text-align:center}
.spm-de1 .de1-flow svg{width:100%;height:auto;max-height:230px}.spm-de1 .de1-flow span{font-size:14px;color:#42616b}
.spm-de1 .de1-timer{display:flex;gap:10px;align-items:center;justify-content:space-between;background:#e6f4f3;padding:15px;border-radius:16px}
.spm-de1 .de1-timer output{font-size:25px;color:#035d60;font-weight:800;font-variant-numeric:tabular-nums}
.spm-de1 .de1-timer button{border:1px solid #116d72;border-radius:9px;background:white;color:#116368;padding:9px 15px}
.spm-de1 .de1-notice{background:#eef6f7;color:#355f64;border-radius:12px;padding:13px;margin:14px 0;font-size:13px;line-height:1.5}
.spm-de1 .de1-footer{display:flex;gap:10px;margin-top:20px}.spm-de1 .de1-next,.spm-de1 .de1-back{padding:14px 17px;font-weight:800}
.spm-de1 .de1-next{flex:1;color:#fff;background:linear-gradient(120deg,#128789,#00555a);border:0}
.spm-de1 .de1-back{color:#0f5a5e;background:#fff;border:1px solid #a4cccb}
.spm-de1 .de1-next:disabled{opacity:.46;cursor:not-allowed}
.spm-de1 .de1-fine{margin-top:12px;color:#617780;font-size:12px}
.spm-de1 :is(button,summary):focus-visible{outline:3px solid #be9344;outline-offset:3px}
@media(max-width:420px){.spm-de1 .de1-body{padding:14px}.spm-de1 .de1-head{padding:20px 15px}.spm-de1 .de1-choices{gap:5px}.spm-de1 .de1-option{font-size:12px}.spm-de1 .de1-footer{gap:6px}}
`;
document.head.appendChild(el);
}
function flowArt(){
return `<svg viewBox="0 0 480 240" xmlns="http://www.w3.org/2000/svg" aria-label="Esquema educativo de flujo de sangre hacia los tejidos eréctiles" role="img">
<defs><linearGradient id="de1g" x2="0.9" y2="1"><stop stop-color="#3c9eaa"/><stop offset="1" stop-color="#073d59"/></linearGradient></defs>
<rect width="480" height="240" fill="#e5f2f4" rx="18"/>
<path d="M55 120h116" stroke="#ca7059" stroke-width="19" stroke-linecap="round"/>
<path d="M55 120h116" stroke="#f7a38f" stroke-width="7" stroke-linecap="round" stroke-dasharray="8 9"/>
<path d="M170 120c32-45 55-60 104-60" stroke="#cc6657" stroke-width="15" stroke-linecap="round" fill="none"/>
<path d="M170 120c32 45 55 60 104 60" stroke="#cc6657" stroke-width="15" stroke-linecap="round" fill="none"/>
<rect x="270" y="29" width="158" height="182" rx="68" fill="url(#de1g)" opacity=".94"/>
<path d="M309 59v122M347 56v127M382 62v118" stroke="#a5d1d5" stroke-width="19" stroke-linecap="round" opacity=".8"/>
<circle cx="127" cy="120" r="8" fill="#ffd27c"/><circle cx="202" cy="94" r="7" fill="#ffd27c"/><circle cx="202" cy="145" r="7" fill="#ffd27c"/>
<text x="38" y="208" fill="#31555e" font-family="Arial" font-size="15">Flujo arterial</text>
<text x="282" y="225" fill="#31555e" font-family="Arial" font-size="14">Tejido eréctil</text>
</svg>`;
}
function introArt(){
return `<svg viewBox="0 0 480 290" xmlns="http://www.w3.org/2000/svg" aria-label="Imagen educativa de bienestar masculino" role="img">
<defs><linearGradient id="de1i" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c8e8ec"/><stop offset="1" stop-color="#f3fafb"/></linearGradient></defs>
<rect width="480" height="290" rx="20" fill="url(#de1i)"/>
<circle cx="290" cy="96" r="38" fill="#b0bfc1"/><path d="M207 272c2-102 35-130 83-130 50 0 83 35 85 130" fill="#29576a"/>
<path d="M246 200h91" stroke="#a8dfe1" stroke-width="7" opacity=".7"/>
<path d="M299 205v61" stroke="#d6a75e" stroke-width="6" stroke-linecap="round"/>
<path d="M299 233c-21-4-36-13-45-30M299 233c20-4 34-13 43-30" stroke="#d6a75e" stroke-width="4" fill="none"/>
<circle cx="300" cy="239" r="14" fill="#f0bd6d" opacity=".65"/>
<text x="35" y="59" fill="#075f63" font-family="Arial" font-size="15" font-weight="bold">SPM · SALUD SEXUAL</text>
<text x="35" y="85" fill="#174e58" font-family="Arial" font-size="13">Tu respuesta es única.</text>
<text x="35" y="105" fill="#174e58" font-family="Arial" font-size="13">Comienza sin exigencias.</text>
</svg>`;
}
function optionsMarkup(s){
const selections=[['4','4','Erección completa'],['3','3','Permite penetración'],['2','2','Rigidez insuficiente'],['1','1','Aumento de tamaño'],['0','0','Sin respuesta'],['na','—','No evaluable']];
return `<div role="group" aria-label="Selecciona tu firmeza" class="de1-choices">`+selections.map(([val,large,label])=>`<button type="button" class="de1-option" data-de1-ehs="${val}" aria-pressed="${s.ehs===val}"><strong>${large}</strong>${label}</button>`).join('')+'</div>';
}
function actionMarkup(s){
const a=[['imagery','Recuerdo o fantasía sexual voluntaria'],['contact','Contacto genital suave y voluntario'],['skip','Prefiero omitir la práctica hoy']];
return `<div role="group" aria-label="Selecciona tu primera práctica" class="de1-choices" data-kind="action">`+a.map(([k,label])=>`<button type="button" class="de1-option" data-de1-action="${k}" aria-pressed="${s.action===k}">${esc(label)}</button>`).join('')+'</div>';
}
function observationMarkup(s){
return `<div data-de1-attention ${s.action==='skip'?'hidden':''} style="margin-top:16px">
<strong style="display:block;font-size:14px;color:#15535b">Registro breve de la habilidad (opcional)</strong>
<p style="margin:5px 0;font-size:13px;color:#466873">¿Cómo fue mantenerte atento al estímulo sin comprobar la firmeza?</p>
<div class="de1-choices" data-kind="action">
${[['present','Pude mantener la atención'],['returned','Noté vigilancia y volví al estímulo'],['difficult','Me costó dejar de comprobar']].map(([k,label])=>`<button type="button" class="de1-option" data-de1-attention-option="${k}" aria-pressed="${s.attention===k}">${esc(label)}</button>`).join('')}
</div></div>`;
}
function markup(s){
const h=`<div class="de1-head"><div class="de1-brand"><span>SPM <span style="color:#bb944d">|</span> ERECCIÓN Y FIRMEZA</span><span class="de1-chip">DÍA 1</span></div><h2>${titles[s.page]}</h2><div class="de1-prog" aria-label="Paso ${s.page+1} de 5">${Array.from({length:5},(_,i)=>`<span class="${i<=s.page?'on':''}"></span>`).join('')}</div></div>`;
let body='';
if(s.page===0)body=`<figure class="de1-hero">${introArt()}<figcaption>Conoce tu respuesta sin convertirla en un examen.</figcaption></figure><p class="de1-sub">Hoy reconocerás tu firmeza inicial y tendrás una primera práctica eréctil opcional.</p>`;
if(s.page===1)body=`<p class="de1-sub">Recuerda una experiencia reciente. No necesitas provocar una erección para medirla.</p><div class="de1-firmness">${window.SPM_FIRMNESS_GUIDE?.html()||`<img src="/premium-v2/assets/images/erection/response-firmness-spm-20261113.jpg" alt="Escala visual de firmeza">`}</div>${optionsMarkup(s)}<p class="de1-fine">«0 · Sin respuesta» y «No evaluable» son situaciones distintas.</p>`;
if(s.page===2)body=`<div class="de1-flow">${flowArt()}<strong>Excitación → flujo sanguíneo → firmeza</strong><span>El estado vascular y nervioso, el estímulo y el contexto influyen en la respuesta. No es una prueba de tu cuerpo.</span></div>`;
if(s.page===3)body=`<p class="de1-sub"><strong>Objetivo clínico:</strong> entrenar el inicio de la activación sexual y mantener la atención en un estímulo erótico, sin evaluar la firmeza.</p>${actionMarkup(s)}${observationMarkup(s)}<div class="de1-timer"><span>Tiempo opcional · 3–5 min</span><output data-de1-clock>00:00</output><button type="button" data-de1-timer>${s.running?'Pausar':'Iniciar'}</button></div><p class="de1-notice">Esta práctica no promete aumentar la oxigenación ni mejorar la rigidez de inmediato. Puedes omitirla sin perder tu evaluación ni tu progreso.</p>`;
if(s.page===4)body=`<div class="de1-flow" style="padding:32px 16px"><div style="font-size:56px;color:#078678">✓</div><strong>Tu punto de partida quedó identificado.</strong><span>Firmeza recordada: <b>${s.ehs==='na'?'No evaluable':esc(s.ehs)}</b></span><span>${s.action==='skip'?'Hoy preferiste omitir la práctica erótica.':s.action?'Has practicado una habilidad de atención durante la excitación.':'La práctica erótica sigue siendo opcional.'}</span></div><p class="de1-notice">El registro de firmeza corresponde a una experiencia previa, no a la práctica de hoy.</p>`;
return `<section class="spm-de1" data-spm-de1><div>${h}</div><div class="de1-body"><div class="de1-toolbar"><button type="button" class="de1-audio" data-de1-audio>🔊 Escuchar guía</button><span style="color:#6e8a8b;font-size:12px">Paso ${s.page+1} / 5</span></div><details><summary>Leer indicaciones</summary><p>${esc(texts[s.page])}</p></details>${body}<div class="de1-footer">${s.page>0?'<button type="button" class="de1-back" data-de1-back>Anterior</button>':'<button type="button" class="de1-back" data-de1-exit>Volver</button>'}<button type="button" class="de1-next" data-de1-next ${s.saving?'disabled':''}>${s.page===4?'Guardar y finalizar':s.page===0?'Iniciar práctica':'Siguiente'}</button></div><p role="status" aria-live="polite" data-de1-status></p></div></section>`;
}
function paint(s){
if(!matches(s))return;
stopMedia();s.host.innerHTML=markup(s);
window.SPM_FIRMNESS_GUIDE?.bind(s.host);
s.host.querySelector('[data-de1-exit]')?.addEventListener('click',()=>{stop();window.SPM_DAILY_PRACTICE.open();});
s.host.querySelector('[data-de1-audio]')?.addEventListener('click',()=>play(s));
s.host.querySelector('[data-de1-back]')?.addEventListener('click',()=>{s.page--;paint(s)});
s.host.querySelector('[data-de1-next]')?.addEventListener('click',()=>next(s));
s.host.querySelectorAll('[data-de1-ehs]').forEach(b=>b.addEventListener('click',()=>{s.ehs=b.dataset.de1Ehs;s.host.querySelectorAll('[data-de1-ehs]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
s.host.querySelectorAll('[data-de1-action]').forEach(b=>b.addEventListener('click',()=>{s.action=b.dataset.de1Action;s.host.querySelectorAll('[data-de1-action]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const q=s.host.querySelector('[data-de1-attention]');if(q)q.hidden=s.action==='skip';}));
s.host.querySelectorAll('[data-de1-attention-option]').forEach(b=>b.addEventListener('click',()=>{s.attention=b.dataset.de1AttentionOption;s.host.querySelectorAll('[data-de1-attention-option]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
s.host.querySelector('[data-de1-timer]')?.addEventListener('click',()=>{if(!matches(s))return;if(s.running){updateTimer(s);s.running=false;if(timer!==null){clearInterval(timer);timer=null;}updateTimer(s);return;}s.running=true;s.timerSince=Date.now();timer=setInterval(()=>updateTimer(s),1000);updateTimer(s);});
}
function updateTimer(s){
if(s.running){s.seconds+=Math.floor((Date.now()-s.timerSince)/1000);s.timerSince=Date.now();}
const out=s.host.querySelector('[data-de1-clock]');if(out)out.textContent=String(Math.floor(s.seconds/60)).padStart(2,'0')+':'+String(s.seconds%60).padStart(2,'0');
const btn=s.host.querySelector('[data-de1-timer]');if(btn)btn.textContent=s.running?'Pausar':'Iniciar';
}
function next(s){
if(!matches(s)||s.saving)return;
if(s.page===1&&s.ehs===null){setStatus(s,'Selecciona tu firmeza o No evaluable.');return;}
if(s.page===4)return save(s);
s.page++;paint(s);
}
async function save(s){
if(!matches(s)||s.saving||s.ehs===null)return;
s.saving=true;const btn=s.host.querySelector('[data-de1-next]');if(btn)btn.disabled=true;setStatus(s,'Guardando tu registro inicial…');
const choice=s.ehs==='na'?null:Number(s.ehs);
const record={...s.prior,source:'erection-practice-v1',erectionPracticeVersion:1,day:1,
 activity:'Reconoce tu punto de partida',confirmed:true,anxiety:Number.isInteger(s.prior.anxiety)?s.prior.anxiety:null,confidence:Number.isInteger(s.prior.confidence)?s.prior.confidence:null,
 date:new Date().toISOString(),ehs:choice,ehsEvaluable:s.ehs!=='na',
 deDay1PreviewVersion:2,initialPracticeChoice:s.action||'skip',initialPracticeSeconds:s.seconds,initialPracticeAttention:s.action==='skip'?'skipped':s.attention||null};
if(!original.valid(record,1)){s.saving=false;btn.disabled=false;setStatus(s,'Revisa tu selección antes de guardar.');return;}
try{
 await window.SPM_DAILY_PRACTICE.saveActivity('main',record,s.scope,1);
 if(matches(s)){stop();window.SPM_DAILY_PRACTICE.open();}
}catch(e){if(matches(s)){s.saving=false;btn.disabled=false;setStatus(s,'No pudimos guardar. Revisa tu conexión y vuelve a intentarlo.');}}
}
async function openDay1(a){
stop();
const c=context(),scope=c?.userId+':'+c?.planId,host=document.getElementById('spmDailyWorkspace');
if(!c||!allowed(c)||!host?.isConnected||window.SPM_DAILY_PRACTICE?.active?.()?.id!=='main')return false;
colors();const s={token,scope,host,page:0,ehs:null,action:null,attention:null,seconds:0,running:false,timerSince:0,saving:false,prior:{}};current=s;
host.innerHTML='<section class="spm-de1" style="padding:28px">Recuperando tu punto de partida…</section>';
try{
const r=await window.SPM_DAILY_RECORDS.read(scope,1);
if(!matches(s))return false;
s.prior=r?.main&&typeof r.main==='object'?{...r.main}:{};
if(s.prior.ehsEvaluable===true&&Number.isInteger(s.prior.ehs)&&s.prior.ehs>=0&&s.prior.ehs<=4)s.ehs=String(s.prior.ehs);
else if(s.prior.erectionPracticeVersion===1&&s.prior.ehs===null&&s.prior.ehsEvaluable===false)s.ehs='na';
paint(s);return true;
}catch(e){if(matches(s))host.innerHTML='<section class="spm-de1" style="padding:25px"><p>No pudimos recuperar tu registro. Vuelve a Hoy e intenta nuevamente.</p><button type="button" class="de1-back" data-de1-retry>Volver a Hoy</button></section>',host.querySelector('[data-de1-retry]').onclick=()=>{stop();window.SPM_DAILY_PRACTICE.open();};return false;}
}
original.open=function(a){const c=context();return c?.primary==='erection'&&Number(c.day)===1&&a?.id==='main'&&a?.kind==='erection'?openDay1(a):previousOpen(a);};
original.stop=function(){stop();return previousStop();};
original.pause=function(){pause();return previousPause();};
window.SPM_ERECTION_DAY1_PREMIUM={version:'preview-1',scope:'existing-er-1-only',stop,pause,openDay1};
})();