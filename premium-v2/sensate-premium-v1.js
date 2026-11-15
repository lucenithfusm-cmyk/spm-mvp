(()=>{
'use strict';
// Premium interface for the existing Sensate Focus clinical curriculum.
// State and medical progress stay with the existing SPM_SENSATE_LAB_HOST.
const root=document.getElementById('sensatePremium');
function host(){try{return window.parent!==window?window.parent.SPM_SENSATE_LAB_HOST:null}catch{return null}}
const api=host();
if(!root||!api){if(root)root.innerHTML='<p class="offline">Abre Focalización sensorial desde tu programa SPM.</p>';return}
const KEY='spm-sensate-records';
const PREFIX='../assets/sensate-premium/';
const SCENES={intro:'spm-sensate-intro-matte.webp',seated:'spm-sensate-seated-matte.webp',forearm:'spm-sensate-forearm-matte.webp',release:'spm-sensate-release-matte.webp',partner:'spm-sensate-partner-forearm-matte.webp'};
const SCENE_ALT={intro:'Persona relajada observando su respiración',seated:'Hombre sentado de costado en postura cómoda',forearm:'Autoexploración del contacto en el antebrazo',release:'Hombre dejando ir tensión corporal',partner:'Contacto de pareja consentido en el antebrazo, sin estimulación genital'};
const PHASES={
 'sf-solo':[
  ['Llegar al cuerpo','Siéntate o recuéstate. Afloja mandíbula, hombros y abdomen. Observa el apoyo de tu cuerpo.',60],
  ['Respirar','Respira a tu ritmo; nota el contacto con la superficie. No retengas el aire.',60],
  ['Explorar el tacto','Apoya una mano sobre el antebrazo, incluso sobre la ropa. Observa temperatura, presión y textura.',120],
  ['Volver a sentir','Si aparece distracción o autoevaluación, reconoce el pensamiento y vuelve a una sensación cómoda.',60],
  ['Cerrar','Detén el contacto y observa cómo está tu cuerpo. No necesitas conseguir una respuesta sexual.',60]
 ],
 'sf-focus-1':[
  ['Llegar juntos','Ambos han decidido participar. Acomódense y acuerden que cualquiera puede pedir una pausa.',60],
  ['A toca · B recibe','A explora manos, brazos, espalda, cuello o piernas de B. Sin contacto genital ni con el pecho. Perciban temperatura, textura, presión y ritmo.',300],
  ['Pausa breve','Retiren el contacto. Observen qué sensaciones permanecen en la piel.',30],
  ['B toca · A recibe','Cambien los turnos. Exploren por curiosidad, sin buscar excitación ni un resultado.',300],
  ['Cierre compartido','Hagan una pausa cómoda. Agradezcan el encuentro sin evaluarse mutuamente.',60]
 ],
 'sf-focus-2':[
  ['Volver a lo conocido','Comiencen con el contacto no genital que ya practicaron en Focus I.',120],
  ['Explorar opcionalmente','Solo si ambos lo desean y se sienten cómodos, pueden incluir zonas erógenas. No hay objetivo de penetración u orgasmo.',240],
  ['Variar el estímulo','Cambien una cosa: ritmo, presión o zona. Noten cómo cambia la sensación.',120],
  ['Pausa y regulación','Bajen el ritmo o interrumpan el contacto si alguien lo desea.',60],
  ['Cerrar sin expectativas','Terminen cuando lo prefieran. La práctica no tiene que conducir a ninguna actividad sexual.',60]
 ],
 'sf-focus-2-solo':[
  ['Reconecta con tu cuerpo','Acomódate. Nota cómo cambia tu respiración y deja que la atención llegue a tu piel.',60],
  ['Explora sensaciones','Recorre con suavidad las zonas de contacto que te resulten agradables; presta atención a temperatura, presión y textura.',120],
  ['Amplía libremente','Si te apetece, explora zonas más sensibles a tu ritmo, sin buscar una respuesta sexual concreta.',120],
  ['Cambia el ritmo','Prueba un contacto diferente y observa cómo varían las sensaciones. Puedes disminuir la intensidad o hacer una pausa.',60],
  ['Integra lo que sentiste','Detén el contacto. Observa tu cuerpo y reconoce la sensación que te resultó más agradable.',60]
 ],
 'sf-communication':[
  ['Respira y observa','Siéntate o recuéstate y nota una sensación corporal cómoda.',60],
  ['Más lento','Ensaya en voz alta o mentalmente: «Más lento».',30],
  ['Así está bien','Ensaya: «Así está bien». Identifica cuándo te resulta cómoda esa frase.',30],
  ['Prefiero otro contacto','Ensaya: «Prefiero otro contacto». Pedir un cambio es parte del cuidado.',30],
  ['Pausa','Ensaya: «Pausa». Vuelve a la respiración y a la sensación de apoyo.',60]
 ],
 'sf-recovery':[
  ['Reconocer lo ocurrido','Si la firmeza cambió o apareció presión, observa lo que sucedió sin calificarte.',60],
  ['Reducir la exigencia','Vuelve a contacto no genital, o al apoyo de tu cuerpo si estás solo.',90],
  ['Respirar con naturalidad','Observa temperatura, textura y respiración; no intentes comprobar la erección.',90],
  ['Elegir con libertad','Puedes continuar con un contacto cómodo, cambiar de actividad o terminar.',60],
  ['Cerrar sin examen','Un cambio de firmeza no invalida la práctica. Registra cómo te sentiste.',60]
 ]
};
const LABELS={'sf-solo':'Presencia individual','sf-focus-1':'Focalización I · Contacto no genital','sf-focus-2':'Focalización II · En pareja','sf-focus-2-solo':'Focalización II · Individual','sf-communication':'Comunicación sin presión','sf-recovery':'Recuperar calma y conexión'};
const INTRO='Focalización sensorial no es una prueba de desempeño. El objetivo es volver a percibir temperatura, presión, textura y ritmo del contacto. No necesitas lograr erección, penetración, orgasmo ni una duración concreta. Puedes practicar a solas o, con consentimiento, en pareja.';
const PREP='Busca un lugar tranquilo, privado y sin interrupciones. Acomódate y elige la práctica individual o en pareja. En pareja, verifiquen que los dos quieran participar y recuerden que cualquiera puede pedir una pausa o terminar cuando lo necesite. Focus I es contacto no genital, sin pecho ni genitales. Puedes practicar sin meta de erección, penetración ni orgasmo.';
const PREP_FOCUSII='Busca un lugar privado, donde puedas relajarte. Elige si practicarás individualmente o en pareja. Explora el contacto a tu propio ritmo: puedes variar la intensidad, detenerte o hacer una pausa. En pareja, ambos participan voluntariamente y respetan sus límites.';
const FOCUSII_WELCOME='Bienvenido a Focalización Sensorial II. Esta práctica busca ampliar tu atención a las sensaciones y ayudarte a disfrutar el contacto sin vigilar tu rendimiento. Exploraremos nuevos ritmos y estímulos, con pausas y libertad para detenernos. No necesitas conseguir una erección, un tiempo determinado ni un resultado específico. Si esta práctica no te resulta cómoda, puedes omitirla hoy y continuar con tu programa.';
const FOCUSII_WELCOME_DESIRE='Bienvenido a Sensate Focus II. Hoy explorarás nuevas sensaciones, la cercanía y las respuestas de tu cuerpo sin exigir que el deseo aparezca de inmediato. Comenzaremos con el contacto que te resulte agradable, ampliaremos los estímulos a tu ritmo y observaremos lo que despierta interés y disfrute. Tu objetivo es explorar y conectar, no alcanzar un resultado determinado.';
const CLOSING='Llegaste al cierre. Registra qué tan presente y cómodo te sentiste, si hubo presión o distracción, y si apareció molestia o dolor. No necesitas un resultado perfecto. El objetivo es observar tu experiencia y repetir a tu ritmo.';
const CLOSING_FOCUSII='Has llegado al final de Focus II. Lo importante no fue lograr una respuesta sexual, sino explorar sensaciones sin presión. Elige cómo te sentiste y qué notaste. Si hubo dolor, detén el contacto y busca orientación si persiste. Guarda tu práctica cuando termines.';
const API_NOTE='<details class="more"><summary>Aplicaciones clínicas del recurso original</summary><p><b>Firmeza:</b> un cambio en la erección no invalida la práctica. Puedes volver al contacto no genital.</p><p><b>Deseo responsivo:</b> el deseo puede aparecer después del contacto, o no aparecer; ambas respuestas son válidas.</p><p><b>Control eyaculatorio:</b> observar sensaciones puede ayudarte a reconocer cambios de excitación sin convertirlos en una prueba de tiempo.</p></details>';
const META=api.getContext();
const isDaily=META.mode==='daily';
const assigned=META.activity||null;
const safeText=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readRecords(){try{const rows=JSON.parse(api.getState()[KEY]||'[]');return Array.isArray(rows)?rows:[]}catch{return[]}}
function canPractice(){const c=api.getContext();return c?.restriction==='none'&&(!isDaily||(c.activity&&Number(c.activity.day)===Number(c.day)))}
let id=isDaily?(assigned?.practiceId||'sf-solo'):'sf-focus-1';
if(!PHASES[id])id='sf-solo';
let screen=0,phase=0,selectedMode=null,explainPhase=0,explainingAll=false,guideSetupHeard=false,consent=false,performed=false,saved=false,busy=false,hasPain=false;
let t=0,timer=0,running=false,voiceActive=false,entryId=null,error='',notification='',guideStarted=false,guideDone=false,phaseElapsed=0,halfwayNoted=false;
let data={presenceBefore:5,pressureBefore:5,presenceAfter:5,pressureAfter:5,enjoyment:5,partnerComfort:7,comfort:'',ease:'',attention:'',repeat:'',discomfort:'',usefulStimuli:[],monitoringIntrusions:0,notes:'',focus2Rating:null,focus2Noted:[]};const touched=new Set();
const isPartner=()=>id==='sf-focus-1'||id==='sf-focus-2';
const isFocusII=()=>id==='sf-focus-2'||id==='sf-focus-2-solo';
const originalDay=Number(META.day)||1;
const existing=isDaily?readRecords().find(r=>r&&r.day===originalDay&&r.completed===true&&r.origin==='dailyPlan'):null;
if(existing){entryId=existing.id||null;notification='Hay un registro previo de focalización en este día; comprobaré si ya está completado en tu programa.';}

function clockText(n){const x=Math.max(0,Math.floor(n));return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0')}
function stopClock(){if(timer){clearInterval(timer);timer=0}running=false}
function stopAudio(){window.speechSynthesis?.cancel?.();voiceActive=false;explainingAll=false;root.querySelectorAll('[data-audio]').forEach(el=>el.classList.remove('playing'))}
function speech(text,done,control){
 window.speechSynthesis?.cancel?.();voiceActive=false;
 root.querySelectorAll('[data-audio]').forEach(el=>el.classList.remove('playing'));
 const activeControl=()=>control?root.querySelector(control):root.querySelector('[data-act=audio]');
 if(!window.speechSynthesis||typeof SpeechSynthesisUtterance==='undefined'){
  notification='El audio no está disponible; lee las instrucciones desplegables.';
  return false;
 }
 const utter=new SpeechSynthesisUtterance(text);utter.lang='es-CO';utter.rate=.96;
 const voices=window.speechSynthesis.getVoices?.()||[];
 const match=voices.find(v=>v.lang?.toLowerCase()==='es-co')||voices.find(v=>v.lang?.toLowerCase().startsWith('es'));
 if(match)utter.voice=match;
 voiceActive=true;
 utter.onend=()=>{voiceActive=false;root.querySelectorAll('[data-audio]').forEach(el=>el.classList.remove('playing'));if(typeof done==='function')done()};
 utter.onerror=()=>{voiceActive=false;root.querySelectorAll('[data-audio]').forEach(el=>el.classList.remove('playing'))};
 try{window.speechSynthesis.speak(utter);activeControl()?.classList.add('playing');return true}
 catch{voiceActive=false;notification='No pude iniciar el audio; abre «Leer instrucciones».';return false}
}
function modeTitle(){return selectedMode==='partner'?'En pareja':'Individual'}
function explanatoryText(i=explainPhase){const p=PHASES[id][i];return 'Paso '+(i+1)+' de cinco. '+p[0]+'. '+p[1]}
function autoGuideIntro(){if(isFocusII())return 'Vas a realizar Focus II en modalidad '+(isPartner()?'en pareja':'individual')+'. Son cinco momentos guiados. Escucha cada indicación, practica sin prisa y pulsa Siguiente paso cuando quieras avanzar. El cronómetro es opcional, no marca un tiempo obligatorio. Puedes pausar, escuchar de nuevo o terminar en cualquier momento. El silencio permite sentir, no es un fallo del audio.';return 'Vas a realizar una práctica '+(isPartner()?'en pareja':'individual')+' de cinco acciones. Cada paso tendrá una instrucción hablada y aproximadamente un minuto para practicar en silencio. El silencio forma parte de la guía: no significa que el programa se haya pausado ni terminado. Después escucharás automáticamente el paso siguiente. Puedes pausar, repetir o adelantar cuando lo necesites.'}
function stepAudio(){return 'Paso '+(phase+1)+' de cinco. '+PHASES[id][phase][0]+'. '+PHASES[id][phase][1]}
function explainStep(i){stopAudio();explainPhase=i;notification='';render();speech(explanatoryText(i),null,'[data-act="explainstep"][data-value="'+i+'"]')}
function explainAll(){stopAudio();explainingAll=true;let pos=0;function speakNext(){if(!explainingAll||screen!==2)return;if(pos>=5){explainingAll=false;render();return}explainPhase=pos;render();const current=pos++;if(!speech(explanatoryText(current),speakNext,'[data-act="explainstep"][data-value="'+current+'"]')){explainingAll=false;notification='Puedes consultar cada paso en «Leer el paso seleccionado».';render()}}speakNext()}
function guideTick(){
 if(!running||screen!==3)return;
 phaseElapsed++;t++;
 const elapsed=root.querySelector('[data-guide-elapsed]');if(elapsed)elapsed.textContent=clockText(t);
 if(isFocusII()){const phaseTime=root.querySelector('[data-guide-phase-elapsed]');if(phaseTime)phaseTime.textContent=clockText(phaseElapsed);return;} // No forced phase transitions in Focus II.
 const left=root.querySelector('[data-guide-left]');if(left)left.textContent=clockText(Math.max(0,60-phaseElapsed));
 const progressBar=root.querySelector('[data-guide-bar]');if(progressBar)progressBar.style.width=Math.min(100,phaseElapsed/60*100)+'%';
 if(phaseElapsed>=60)advanceGuide();
}
function armGuideTimer(){if(timer)clearInterval(timer);timer=setInterval(guideTick,1000)}
function startGuide(){
 if(!canPractice()){error='La práctica está en pausa por una indicación de seguridad.';render();return}
 if(!selectedMode){error='Elige práctica individual o en pareja en la preparación.';render();return}
 if(guideDone){phase=0;phaseElapsed=0;t=0;guideDone=false;performed=false}
 running=true;guideStarted=true;halfwayNoted=false;error='';notification='';
 render();speech(stepAudio(),null,'[data-act=repeataudio]');armGuideTimer();
}
function pauseGuide(){
 if(!running)return;
 stopClock();stopAudio();notification='Pausada. Cuando quieras, pulsa Reanudar.';
 render();
}
function resumeGuide(){
 if(!guideStarted||guideDone){startGuide();return}
 if(!canPractice()){error='La práctica está en pausa por seguridad.';render();return}
 running=true;error='';notification='';render();speech(stepAudio(),null,'[data-act=repeataudio]');armGuideTimer();
}
function advanceGuide(){
 if(!guideStarted)return;
 const wasRunning=running;
 stopAudio();
 if(phase>=4){
  stopClock();guideDone=true;phaseElapsed=60;
  notification='Terminaste los cinco pasos. Confirma que realizaste la práctica para evaluar tu experiencia.';
  render();return;
 }
 phase++;phaseElapsed=0;notification='';render();
 if(wasRunning)speech(stepAudio(),null,'[data-act=repeataudio]');
}
function jumpGuide(n){
 if(!guideStarted||!Number.isInteger(n)||n<0||n>4)return;
 const wasRunning=running;stopAudio();phase=n;phaseElapsed=0;guideDone=false;notification='';render();
 if(wasRunning)speech(stepAudio(),null,'[data-act=repeataudio]');
}
function audioText(){if(screen===0)return isDaily&&assigned?.practiceId==='sf-focus-2'?(META.profile==='desire'?FOCUSII_WELCOME_DESIRE:FOCUSII_WELCOME):INTRO;if(screen===1)return isFocusII()?PREP_FOCUSII:PREP;if(screen===2)return explanatoryText();if(screen===3)return guideStarted?stepAudio():autoGuideIntro();return isFocusII()?CLOSING_FOCUSII:CLOSING}
function resetType(next){
 stopAudio();stopClock();id=next;selectedMode=(next==='sf-solo'||next==='sf-focus-2-solo'||next==='sf-communication'||next==='sf-recovery')?'individual':'partner';
 phase=0;phaseElapsed=0;t=0;explainPhase=0;guideStarted=false;guideDone=false;
 consent=selectedMode==='partner';performed=false;error='';notification='';screen=2;render();
}
function selectBranch(branch){
 if(!['individual','partner'].includes(branch))return;
 if(!canPractice()){error='La práctica física está en pausa por indicación de seguridad.';render();return}
 const next=branch==='individual'?(assigned?.practiceId==='sf-focus-2'?'sf-focus-2-solo':assigned?.practiceId==='sf-communication'?'sf-communication':assigned?.practiceId==='sf-recovery'?'sf-recovery':'sf-solo'):(assigned?.practiceId==='sf-focus-2'?'sf-focus-2':'sf-focus-1');
 resetType(next);
}
function go(next){stopAudio();stopClock();notification='';error='';screen=Math.max(0,Math.min(4,next));render()}
function sceneForCurrentStep(){
 if(isPartner()&&[1,2,3].includes(phase))return 'partner';
 if(id==='sf-communication'&&phase===1)return 'seated';
 return phase===0?'seated':phase===1?'intro':phase===2?'forearm':'release';
}
function scene(key,kind=''){
 const which=SCENES[key]?key:'seated';
 return '<figure class="sensate-scene '+kind+'"><img src="'+PREFIX+SCENES[which]+'" alt="'+safeText(SCENE_ALT[which])+'" loading="eager" decoding="async"></figure>';
}
function hero(){
 if(screen===2||screen===3)return '';
 return scene(screen===0?'intro':screen===1?'seated':'release',screen===4?'scene-closure':'');
}
function audioControls(){
 if(screen===2||screen===3)return '';
 const label=screen===0?'Escuchar introducción':screen===1?'Escuchar preparación':'Escuchar guía de cierre';
 return '<div class="sensate-instruction"><button type="button" data-act="audio" data-audio class="audio-control" aria-label="'+label+'">🔊 '+label+'</button><details class="more"><summary>Leer instrucciones</summary><p>'+safeText(audioText())+'</p></details>'+(screen===0&&isDaily&&assigned?.practiceId==='sf-focus-2'&&['erection','ejaculation'].includes(META.profile)?'<button type="button" data-act="skip" class="secondary">Omitir esta práctica por hoy</button>':'')+'</div>';
}
function progress(){return '<div class="progress-rail" role="progressbar" aria-label="Progreso del recorrido" aria-valuemin="0" aria-valuemax="5" aria-valuenow="'+(screen+1)+'"><i style="width:'+((screen+1)*20)+'%"></i></div>'}
function selection(){return '<div class="mode-picker"><p class="eyebrow">Elige cómo practicar</p>'+
  ['sf-solo','sf-focus-1','sf-focus-2','sf-focus-2-solo','sf-communication','sf-recovery'].map(key=>'<button type="button" data-act="mode" data-value="'+key+'" class="mode-card'+(id===key?' selected':'')+'">'+safeText(LABELS[key])+'</button>').join('')+'</div>'}
function introScreen(){
 const focus2=isDaily&&assigned?.practiceId==='sf-focus-2';
 const heading=focus2?(META.profile==='desire'?'Sensate Focus II':'Focalización Sensorial II'):'Conecta con tus sensaciones';
 const lead=focus2?'Explora nuevas sensaciones sin exigencias, a tu propio ritmo.':'Una práctica para estar presente, reducir la presión y recuperar el disfrute del contacto.';
 return '<section class="card intro-card'+(focus2?' focusii-welcome':'')+'"><p class="eyebrow">SPM · FOCALIZACIÓN SENSORIAL</p><h2>'+heading+'</h2><p>'+lead+'</p>'+
 (focus2?scene('partner','intro-visual'):scene('intro','intro-visual'))+'<div class="sensate-values">'+(focus2?'<span>◌ Explorar el tacto</span><span>◌ Descubrir nuevos estímulos</span><span>◌ Conectar sin presión</span>':'<span>◌ Más conciencia corporal</span><span>◌ Menos ansiedad</span><span>◌ Más conexión y disfrute</span>')+'</div></section>'+(focus2?'':API_NOTE);
}
function range(name,label,lo,hi){return '<label class="range"><span>'+label+' <strong data-val="'+name+'">'+data[name]+'</strong>/10</span><input type="range" min="0" max="10" step="1" data-field="'+name+'" value="'+data[name]+'" aria-label="'+label+'"><small>'+lo+' <span>'+hi+'</span></small></label>'}
function prepScreen(){
 return '<section class="card prep-card"><p class="eyebrow">'+(isDaily?'DÍA '+originalDay+' · '+safeText(assigned?.title||'Focalización'):'PREPARA TU PRÁCTICA')+'</p>'+
 '<h2>Prepárate</h2><p>'+(isFocusII()?'Un espacio tranquilo. Sin prisas. Tú eliges cómo explorar.':'Busca un lugar tranquilo, evita interrupciones y adopta una postura cómoda.')+'</p>'+scene('seated','prep-visual')+
 '<h3 class="mode-heading">¿Cómo realizarás la práctica?</h3>'+
 '<div class="mode-branch" role="group" aria-label="Elige práctica individual o en pareja">'+
 '<button type="button" data-act="branch" data-value="individual" class="mode-photo" aria-label="Elegir práctica individual"><img src="'+PREFIX+SCENES.seated+'" alt="Hombre sentado relajado"><span>Individual</span></button>'+
 '<button type="button" data-act="branch" data-value="partner" class="mode-photo" aria-label="Elegir práctica en pareja"><img src="'+PREFIX+SCENES.partner+'" alt="Pareja adulta compartiendo un contacto cómodo"><span>En pareja</span></button></div>'+
 '<p class="notice">'+(isFocusII()?'En pareja, ambos deciden participar y cualquiera puede pedir una pausa.':'En pareja: la participación de ambos debe ser voluntaria y cualquiera puede pedir una pausa o terminar en cualquier momento. No necesitas marcar otra casilla.')+'</p>'+
 (isFocusII()?'<details class="more"><summary>Leer indicaciones de preparación</summary><p>'+safeText(PREP_FOCUSII)+'</p></details>':'<details class="more"><summary>Mis indicaciones de preparación</summary><div class="two-ranges">'+range('presenceBefore','Presencia antes de empezar','Disperso','Presente')+range('pressureBefore','Presión antes de empezar','Baja','Alta')+'</div></details>')+'</section>';
}
const GUIDE_LABELS={
 'sf-solo':['Acomódate','Respira','Explora','Percibe','Cierra'],
 'sf-focus-2-solo':['Conecta','Explora','Amplía','Varía','Integra'],
 'sf-focus-1':['Acomódense','A toca','Hagan pausa','B toca','Cierren'],
 'sf-focus-2':['Retomen','Exploren','Varíen','Pausen','Cierren'],
 'sf-communication':['Respira','Más lento','Así está bien','Otro contacto','Pausa'],
 'sf-recovery':['Reconoce','Reduce presión','Respira','Elige','Cierra']
};
function labelForPhase(i){return (GUIDE_LABELS[id]||GUIDE_LABELS['sf-solo'])[i]}
function wave(active=false){
 return '<div class="wave-stage '+(active?'moving':'')+'" aria-hidden="true"><svg viewBox="0 0 500 95" width="100%" height="74" preserveAspectRatio="none">'+
 [0,1,2,3,4].map((n)=>'<path class="wave-line wave-'+n+'" fill="none" stroke="currentColor" stroke-width="'+(n===2?'1.9':'1.05')+'" opacity="'+(.27+n*.12)+'" d="M0 '+(46+n*2)+' C45 '+(38+n*2)+' 65 '+(60-n*3)+' 104 '+(48+n*2)+' S170 '+(10+n*4)+' 211 '+(46+n)+' S294 '+(88-n*5)+' 335 '+(45+n*2)+' S402 '+(28+n*3)+' 440 '+(46+n)+' S480 '+(47+n)+' 500 '+(47+n)+'"></path>').join('')+'</svg></div>';
}
function focusIIExplainScreen(){
 const mode=isPartner()?'En pareja':'Individual';
 return '<section class="card focusii-explain" aria-label="Focus II · explicación '+mode+'">'+
 '<p class="eyebrow">SENSATE FOCUS II · '+mode.toUpperCase()+' · 3 / 5</p>'+
 '<h2>Explora nuevas sensaciones</h2><p>Escucha y descubre cada paso antes de comenzar.</p>'+
 '<div class="focusii-visual">'+scene(isPartner()?'partner':'forearm','focusii-cover')+'</div>'+
 '<h3 class="focusii-heading">Tu práctica guiada</h3>'+
 '<div class="focusii-step-list">'+PHASES[id].map((p,i)=>'<button type="button" data-act="explainstep" data-audio data-value="'+i+'" class="focusii-step '+(explainPhase===i?'chosen':'')+'" aria-label="Escuchar paso '+(i+1)+': '+safeText(labelForPhase(i))+'"><span class="number">'+(i+1)+'</span><span>'+safeText(labelForPhase(i))+'</span><span aria-hidden="true" class="focusii-small-speaker">🔊</span></button>').join('')+'</div>'+
 '<button type="button" data-act="explainall" data-audio class="focusii-listen" '+(explainingAll?'disabled':'')+'><span class="focusii-speaker" aria-hidden="true">🔊</span>'+(explainingAll?'Reproduciendo guía…':'Escuchar los 5 pasos')+'</button>'+
 '<details class="more"><summary>Leer instrucción seleccionada</summary><p>'+safeText(explanatoryText())+'</p></details>'+
 '<p class="compact-footnote">En la siguiente pantalla realizarás los pasos a tu ritmo. No hay tiempo obligatorio.</p></section>';
}
function focusIIPracticeScreen(){
 const current=PHASES[id][phase];
 const status=guideDone?'Puedes registrar tu experiencia.':running?'Escucha, explora y avanza cuando lo desees.':guideStarted?'Pausada. Reanuda cuando quieras.':'Escucha cada paso y practica sin prisa.';
 const imageKey=isPartner()?(phase===0?'seated':'partner'):(phase===2?'forearm':phase===3?'release':'seated');
 return '<section class="card focusii-practice" aria-label="Focus II práctica '+modeTitle()+'">'+
 '<p class="eyebrow">SENSATE FOCUS II · '+modeTitle().toUpperCase()+' · 4 / 5</p>'+
 '<h2>Ahora, ponlo en práctica</h2>'+
 '<button type="button" data-act="guideintro" data-audio class="focusii-listen focusii-instruction"><span class="focusii-speaker" aria-hidden="true">🔊</span>Escuchar cómo funciona</button>'+
 '<div class="focusii-phase-nav" aria-label="Fases de la práctica">'+PHASES[id].map((stepData,i)=>'<button type="button" data-act="phase" data-value="'+i+'" '+(!guideStarted?'disabled':'')+' class="'+(phase===i?'current':i<phase?'complete':'')+'" aria-label="Ir al paso '+(i+1)+': '+safeText(labelForPhase(i))+'">'+(i+1)+'</button>').join('')+'</div>'+
 '<p class="focusii-phase-count">Paso '+(phase+1)+' de 5</p><h3 class="focusii-active-title">'+safeText(labelForPhase(phase))+'</h3>'+
 scene(imageKey,'focusii-active-photo')+
 '<p class="focusii-action">'+safeText(current[1])+'</p>'+
 '<button type="button" data-act="repeataudio" data-audio class="focusii-listen" '+(!guideStarted?'disabled':'')+'><span class="focusii-speaker" aria-hidden="true">🔊</span>Repetir indicación</button>'+
 '<div class="focusii-timing"><span>Tiempo transcurrido <small>(apoyo opcional)</small></span><strong data-guide-elapsed>'+clockText(t)+'</strong><small>En este paso: <span data-guide-phase-elapsed>'+clockText(phaseElapsed)+'</span></small></div>'+
 '<p class="focusii-status" role="status">'+safeText(status)+'</p>'+
 (!guideStarted||guideDone?'<button type="button" data-act="startguide" class="gold full primary-guide">'+(guideDone?'↻ Volver a practicar':'▶ Iniciar práctica guiada')+'</button>':
 running?'<button type="button" data-act="pauseguide" class="gold full primary-guide">⏸ Pausar práctica</button>':
 '<button type="button" data-act="resumeguide" class="gold full primary-guide">▶ Reanudar práctica</button>')+
 '<div class="focusii-guide-actions"><button type="button" data-act="nextphase" class="secondary" '+(!guideStarted||guideDone?'disabled':'')+'>Siguiente paso →</button>'+
 '<button type="button" data-act="performed" class="secondary" '+(!guideStarted?'disabled':'')+'>✓ Terminar y evaluar</button></div>'+
 '<details class="more"><summary>Leer cómo se realiza</summary><p>'+safeText(current[1])+'</p></details>'+
 '<p class="compact-footnote">Puedes pausar, cambiar el ritmo o terminar cuando quieras. No hay una respuesta obligatoria.</p></section>';
}
function focusIICloseScreen(){
 const choices=[['0','Ausente'],['1','Bajo'],['2','Aceptable'],['3','Satisfactorio'],['4','Muy bien']];
 const noticed=['Más calma','Más conexión','Menos presión'];
 return '<section class="card focusii-close"><p class="eyebrow">SENSATE FOCUS II · 5 / 5</p>'+
 '<h2>Cierre de tu práctica</h2><p>Registra cómo te sentiste, sin convertirlo en una evaluación de rendimiento.</p>'+
 '<div class="focusii-register"><h3>¿Cómo estuvo tu bienestar?</h3><div class="focusii-rating" role="group" aria-label="Califica tu bienestar de cero a cuatro">'+choices.map(([v,label])=>'<button type="button" data-act="focus2rating" data-value="'+v+'" aria-pressed="'+(data.focus2Rating===Number(v))+'" class="'+(data.focus2Rating===Number(v)?'chosen':'')+'"><b>'+v+'</b><small>'+label+'</small></button>').join('')+'</div>'+
 '<h3>Hoy noté</h3><div class="focusii-noted">'+noticed.map(v=>'<button type="button" data-act="focus2noticed" data-value="'+v+'" aria-pressed="'+data.focus2Noted.includes(v)+'" class="'+(data.focus2Noted.includes(v)?'chosen':'')+'">'+v+'</button>').join('')+'</div></div>'+
 '<div class="focusii-clinical">'+
 chipField('comfort','Me sentí',[['comodo','Cómodo'],['neutro','Neutro'],['tenso','Tenso']])+
 chipField('discomfort','¿Molestia o dolor?',[['ninguna','No'],['molestia','Molestia'],['dolor','Dolor']])+'</div>'+
 (data.discomfort==='dolor'?'<p class="warning">Evita el contacto que causó dolor. Si persiste o reaparece, busca valoración profesional.</p>':'')+
 '<details class="more"><summary>Registro complementario (opcional)</summary>'+
 chipField('ease','La práctica fue',[['facil','Fácil'],['intermedia','Intermedia'],['dificil','Difícil']])+
 chipField('attention','Mi atención',[['conexion','Conecté'],['distraccion','Me distraje'],['ansiedad','Sentí ansiedad']])+
 chipField('repeat','Quiero repetir',[['si','Sí'],['aun_no','Aún no']])+
 '<div class="two-ranges">'+range('presenceAfter','Presencia','Disperso','Presente')+range('pressureAfter','Presión','Baja','Alta')+range('enjoyment','Disfrute','Bajo','Alto')+(isPartner()?range('partnerComfort','Comodidad de tu pareja','Baja','Alta'):'')+'</div><textarea data-field="notes" maxlength="700" placeholder="Algo que quieras recordar…">'+safeText(data.notes)+'</textarea></details>'+
 '<p class="focusii-close-foot">Exploraste sensaciones. Eso ya forma parte de tu aprendizaje.</p></section>';
}

function explainScreen(){
 if(isFocusII())return focusIIExplainScreen();
 const explanation=isPartner()?'En pareja · Focus '+(isFocusII()?'II':'I'):(isFocusII()?'Individual · Focus II':'Individual');
 return '<section class="card sensate-explain" aria-label="Práctica explicativa '+explanation+'">'+
 '<span class="eyebrow">SPM · '+explanation.toUpperCase()+' · 3 / 5</span><h2>Práctica guiada</h2>'+
 '<p>Escucha el paso a paso antes de comenzar. Toca cualquier recuadro para escuchar su indicación.</p>'+
 '<div class="explain-stage">'+scene(isPartner()?'partner':'seated','soft-backdrop')+
 '<div class="explain-options" role="group" aria-label="Cinco explicaciones interactivas">'+PHASES[id].map((p,i)=>
 '<button type="button" data-act="explainstep" data-value="'+i+'" class="explain-row '+(explainPhase===i?'chosen':'')+'" aria-label="Escuchar paso '+(i+1)+': '+safeText(labelForPhase(i))+'">'+
 '<span class="number">'+(i+1)+'</span><span class="explain-label">'+safeText(labelForPhase(i))+'</span><span class="small-sound" aria-hidden="true">◖))</span></button>').join('')+'</div></div>'+
 wave(explainingAll)+
 '<button type="button" data-act="explainall" class="gold full" '+(explainingAll?'disabled':'')+'>▶ '+(explainingAll?'Reproduciendo guía…':'Escuchar los cinco pasos')+'</button>'+
 '<details class="more"><summary>Leer el paso seleccionado</summary><p>'+safeText(explanatoryText())+'</p></details>'+

 '<p class="compact-footnote">Las ilustraciones acompañan la explicación. En la siguiente pantalla realizarás la práctica con audio y pausas.</p></section>';
}
function practiceScreen(){
 if(isFocusII())return focusIIPracticeScreen();
 const p=PHASES[id][phase],timeLeft=guideDone?0:Math.max(0,60-phaseElapsed);
 const state=guideDone?'Los cinco pasos terminaron. Puedes evaluar lo que sentiste.':running?'Práctica activa. El silencio entre indicaciones es para explorar a tu ritmo.':guideStarted?'Práctica pausada. Puedes reanudar en cualquier momento.':'Al iniciar escucharás el paso 1. Cada acción dura aproximadamente un minuto y la siguiente comenzará con audio.';
 return '<section class="card sensate-practice" aria-label="Práctica en curso '+modeTitle()+'">'+
 '<p class="eyebrow">SPM · '+modeTitle().toUpperCase()+' · 4 / 5</p><h2>Práctica en curso</h2>'+
 '<button type="button" class="info-audio" data-act="guideintro">🔊 Escuchar cómo funciona esta práctica</button>'+
 '<details class="more"><summary>¿Por qué hay silencios?</summary><p>'+safeText(autoGuideIntro())+'</p></details>'+
 '<div class="practice-steps">'+PHASES[id].map((stepData,i)=>'<button type="button" data-act="phase" data-value="'+i+'" '+(!guideStarted?'disabled':'')+' class="'+(i===phase?'current':i<phase?'complete':'')+'" aria-label="Ver paso '+(i+1)+': '+safeText(labelForPhase(i))+'">'+(i+1)+'</button>').join('')+'</div>'+
 wave(running)+
 '<div class="current-activity"><span>Paso '+(phase+1)+' de 5</span><h3>'+safeText(labelForPhase(phase))+'</h3>'+
 scene(isPartner()?(phase===0?'seated':'partner'):sceneForCurrentStep(),'practicing')+
 '<p>'+safeText(p[1])+'</p></div>'+
 '<div class="phase-clocks"><div><small>Tiempo restante del paso</small><b data-guide-left>'+clockText(timeLeft)+'</b></div><div><small>Tiempo transcurrido</small><b data-guide-elapsed>'+clockText(t)+'</b></div></div>'+
 '<div class="phase-progress" aria-label="Progreso de la fase"><i data-guide-bar style="width:'+Math.min(100,phaseElapsed*100/60)+'%"></i></div>'+
 '<p class="practice-state" role="status">'+safeText(state)+'</p>'+
 (!guideStarted||guideDone?'<button type="button" data-act="startguide" class="gold full primary-guide">'+(guideDone?'↺ Repetir la práctica':'▶ Iniciar práctica')+'</button>':
 running?'<button type="button" data-act="pauseguide" class="gold full primary-guide">⏸ Pausar</button>':
 '<button type="button" data-act="resumeguide" class="gold full primary-guide">▶ Reanudar</button>')+
 '<div class="guide-secondary"><button type="button" data-act="repeataudio" class="secondary" '+(!guideStarted?'disabled':'')+'>🔊 Repetir instrucción</button>'+
 '<button type="button" data-act="nextphase" class="secondary" '+(!guideStarted||guideDone?'disabled':'')+'>Siguiente paso</button></div>'+
 '<button type="button" data-act="performed" class="secondary full" '+(!guideStarted?'disabled':'')+'>✓ Finalizar y evaluar mi práctica</button>'+
 '<p class="compact-footnote">El reloj es un apoyo, no una prueba. No tienes que continuar si algo resulta incómodo.</p></section>';
}
function chipField(name,title,options){return '<fieldset class="chips"><legend>'+title+'</legend>'+options.map(x=>'<label class="'+(data[name]===x[0]?'chosen':'')+'"><input type="radio" name="'+name+'" data-field="'+name+'" value="'+x[0]+'" '+(data[name]===x[0]?'checked':'')+'><span>'+x[1]+'</span></label>').join('')+'</fieldset>'}
function closeScreen(){if(isFocusII())return focusIICloseScreen();return '<section class="card"><h2>¿Cómo te fue?</h2><p>Registra tu experiencia sin exigirte resultados perfectos.</p>'+
  chipField('comfort','Me sentí',[['comodo','Cómodo'],['neutro','Neutro'],['tenso','Tenso']])+
  chipField('ease','La práctica fue',[['facil','Fácil'],['intermedia','Intermedia'],['dificil','Difícil']])+
  chipField('attention','Noté',[['conexion','Conexión'],['distraccion','Distracción'],['ansiedad','Ansiedad']])+
  chipField('repeat','Quiero repetir',[['si','Sí'],['aun_no','Aún no']])+
  chipField('discomfort','¿Hubo molestia o dolor?',[['ninguna','No'],['molestia','Molestia'],['dolor','Dolor']])+
  (data.discomfort==='dolor'?'<p class="warning">Detén el contacto que causa dolor. Si persiste o reaparece, busca valoración profesional.</p>':'')+
  '<details class="more"><summary>Medidas clínicas de la práctica</summary><div class="two-ranges">'+range('presenceAfter','Presencia al terminar','Disperso','Presente')+range('pressureAfter','Presión al terminar','Baja','Alta')+range('enjoyment','Disfrute','Bajo','Alto')+(isPartner()?range('partnerComfort','Comodidad de tu pareja','Incómoda','Cómoda'):'')+'</div></details>'+
  '<p class="eyebrow">Contacto más fácil de sentir (opcional)</p><div class="stimuli">'+['Caricia lenta','Presión firme','Roce suave','Calor de la mano','Espalda','Brazos','Cuello','Manos','Piernas'].map(s=>'<button type="button" class="'+(data.usefulStimuli.includes(s)?'picked':'')+'" data-act="stimulus" data-value="'+safeText(s)+'">'+safeText(s)+'</button>').join('')+'</div>'+
  '<details class="more"><summary>Añadir una observación</summary><textarea data-field="notes" maxlength="700" placeholder="Algo que quieras recordar…">'+safeText(data.notes)+'</textarea></details>'+
  '<div class="result-preview">Presencia '+data.presenceBefore+' → '+data.presenceAfter+' · Presión '+data.pressureBefore+' → '+data.pressureAfter+'</div>'+
  '<p class="note">Cada práctica te ayuda a reconocer sensaciones a tu ritmo, sin necesidad de comparar resultados.</p>'+
  ''+
  ''+'</section>';
}
function footer(){
 const back='<button type="button" data-act="back" class="secondary" '+(screen===0?'disabled':'')+'>Anterior</button>';
 if(screen===0)return '<div class="foot">'+back+'<span>1 / 5</span><button type="button" data-act="next" class="gold">Comenzar</button></div>';
 if(screen===1)return '<div class="foot">'+back+'<span>2 / 5</span><button type="button" class="gold" disabled>Elige tu práctica</button></div>';
 if(screen===2)return '<div class="foot">'+back+'<span>3 / 5</span><button type="button" data-act="next" class="gold">Continuar</button></div>';
 if(screen===3)return '<div class="foot">'+back+'<span>4 / 5</span><button type="button" data-act="next" class="gold" '+(!performed?'disabled':'')+'>Evaluar</button></div>';
 return '<div class="foot">'+back+'<span>5 / 5</span><button type="button" data-act="'+(saved?'close':'save')+'" class="gold" '+(busy?'disabled':'')+'>'+(saved?'Finalizar':busy?'Guardando…':'Guardar experiencia')+'</button></div>';
}
function render(){
 const c=api.getContext(),restricted=c?.restriction!=='none';
 const title=isDaily?safeText(assigned?.title||LABELS[id]):safeText(LABELS[id]);
 root.innerHTML='<div class="layout'+(isFocusII()?' focusii-theme':'')+'"><header><div class="brand"><b>SPM</b><small>FOCALIZACIÓN SENSORIAL</small></div>'+
 '<div class="header-actions"><button type="button" data-act="library" class="subtle" title="Biblioteca">Biblioteca</button><button type="button" data-act="close" class="close" aria-label="Cerrar">×</button></div></header>'+progress()+
 '<main><p class="meta">'+(isDaily?'DÍA '+originalDay+' / 28 · ':'BIBLIOTECA · ')+title+'</p>'+
 (restricted?'<p class="warning">El programa indica una pausa de seguridad. Puedes consultar el contenido, pero no practicar ni guardar la sesión hasta que corresponda.</p>':'')+
 (screen===0?introScreen():screen===1?prepScreen():screen===2?explainScreen():screen===3?practiceScreen():closeScreen())+audioControls()+
 (error?'<p class="warning" role="alert">'+safeText(error)+'</p>':'')+
 (notification?'<p class="notify" role="status">'+safeText(notification)+'</p>':'')+
 '</main>'+footer()+'</div>';
}
function readValue(el){const key=el.dataset.field;if(!key)return;if(key==='consent'){consent=el.checked;return}if(['pressureBefore','presenceBefore','presenceAfter','pressureAfter','enjoyment','partnerComfort'].includes(key)){data[key]=Number(el.value);touched.add(key);const label=root.querySelector('[data-val="'+key+'"]');if(label)label.textContent=data[key];return}if(key==='notes'){data.notes=el.value;return}data[key]=el.value;}
function recommendation(){if(data.discomfort==='dolor')return 'reduce-pressure';if(data.pressureAfter>=7||data.monitoringIntrusions>=4)return 'reduce-pressure';if(isPartner()&&['presenceAfter','pressureAfter','enjoyment','partnerComfort'].every(k=>touched.has(k))&&data.presenceAfter>=7&&data.pressureAfter<=3&&data.enjoyment>=6&&data.partnerComfort>=6)return 'progress';return 'repeat'}
async function save(){error='';notification='';if(saved){notification='Esta práctica ya está guardada.';render();return}if(busy)return;
if(!canPractice()){error='Tu programa indica una pausa de seguridad. No es posible registrar esta práctica.';render();return}
if(!performed){error='Primero confirma que realizaste la práctica guiada.';render();return}
if(isPartner()&&!consent){error='Para una práctica en pareja, ambos deben haber aceptado participar.';render();return}
const missing=(isFocusII()?['comfort','discomfort']:['comfort','ease','attention','repeat','discomfort']).find(x=>!data[x]);
if(missing){error=isFocusII()?'Elige cómo te sentiste y si hubo molestias.':'Selecciona cómo te sentiste, dificultad, atención, ganas de repetir y molestias.';render();return}
if(isFocusII()&&data.focus2Rating===null){error='Elige un valor de 0 a 4 para registrar tu bienestar.';render();return}
if(isDaily){try{if(await api.isDailyCompleted?.()){saved=true;notification='Esta práctica ya está completada en tu programa. No se duplicó.';render();return;}}catch{error='No pude comprobar si la actividad estaba guardada. Reintenta sin modificar datos.';render();return;}}
busy=true;render();
try{
 const rows=readRecords(),day=Number(api.getContext().day),entry={
  id:entryId||(entryId=(window.crypto?.randomUUID?.()||'sensate-'+Date.now()+'-'+Math.floor(Math.random()*100000))),
  day,origin:isDaily?'dailyPlan':'library',practiceId:id,completed:true,savedAt:new Date().toISOString(),
  presenceBefore:isFocusII()?null:data.presenceBefore,presenceAfter:isFocusII()&&!touched.has('presenceAfter')?null:data.presenceAfter,
  pressureBefore:isFocusII()?null:data.pressureBefore,pressureAfter:isFocusII()&&!touched.has('pressureAfter')?null:data.pressureAfter,
  enjoyment:isFocusII()&&!touched.has('enjoyment')?null:data.enjoyment,monitoringIntrusions:data.monitoringIntrusions,
  partnerComfort:isPartner()?isFocusII()&&!touched.has('partnerComfort')?null:data.partnerComfort:null,
  usefulStimuli:data.usefulStimuli.slice(),recommendation:recommendation(),
  difficulty:data.ease,discomfort:data.discomfort,comfort:data.comfort,attention:data.attention,wantsRepeat:data.repeat,notes:data.notes.trim(),...(isFocusII()?{focus2Rating:data.focus2Rating,focus2Noted:data.focus2Noted.slice(),modality:selectedMode}: {})
 };
 const index=rows.findIndex(x=>x.id===entry.id);if(index>=0)rows[index]=entry;else rows.push(entry);
 if(!api.write(KEY,JSON.stringify(rows)))throw Error('session');
 await api.flush();
 if(isDaily){const ok=await api.recordDaily();if(ok===false)throw Error('daily')}
 saved=true;notification='Experiencia guardada en tu programa SPM ✓';
}catch(e){error='No se pudo guardar o completar la actividad. Tus respuestas permanecen aquí para reintentar.'}
finally{busy=false;render()}
}

root.addEventListener('click',e=>{
 const button=e.target.closest('[data-act]');if(!button||button.disabled)return;
 const act=button.dataset.act;
 if(act==='audio'){if(voiceActive)stopAudio();else speech(audioText());return}
 if(act==='close'||act==='skip'){stopAudio();stopClock();void api.close();return}
 if(act==='library'){stopAudio();stopClock();if(isDaily){void api.openLibrary();return}go(0);return}
 if(act==='back'){if(screen>0)go(screen-1);return}
 if(act==='branch'){selectBranch(button.dataset.value);return}
 if(act==='mode'){resetType(button.dataset.value);return}
 if(act==='next'){
  if(screen===0){go(1);return}
  if(screen===1){error='Elige Individual o En pareja para empezar.';render();return}
  if(screen===2){go(3);return}
  if(screen===3&&performed){go(4);return}
  return;
 }
 if(act==='explainstep'){explainStep(Number(button.dataset.value));return}
 if(act==='explainall'){explainAll();return}
 if(act==='guideintro'){if(voiceActive)stopAudio();else speech(autoGuideIntro(),null,'[data-act=guideintro]');return}
 if(act==='startguide'){startGuide();return}
 if(act==='pauseguide'){pauseGuide();return}
 if(act==='resumeguide'){resumeGuide();return}
 if(act==='repeataudio'){if(voiceActive)stopAudio();else if(guideStarted)speech(stepAudio(),null,'[data-act=repeataudio]');return}
 if(act==='phase'){jumpGuide(Number(button.dataset.value));return}
 if(act==='nextphase'){advanceGuide();return}
 if(act==='refocus'){
  data.monitoringIntrusions++;
  notification='Regresa a una sensación cómoda: temperatura, textura o presión.';
  render();return
 }
 if(act==='pressure'){jumpGuide(0);notification='Vuelvan a un contacto no genital y un ritmo cómodo.';render();return}
 if(act==='performed'){
  if(!guideStarted)return;
  performed=true;stopClock();stopAudio();
  notification='Práctica confirmada. Puedes registrar cómo te sentiste.';
  render();return;
 }
 if(act==='focus2rating'){const v=Number(button.dataset.value);if(Number.isInteger(v)&&v>=0&&v<=4){data.focus2Rating=v;root.querySelectorAll('[data-act=focus2rating]').forEach(b=>{b.classList.toggle('chosen',Number(b.dataset.value)===v);b.setAttribute('aria-pressed',String(Number(b.dataset.value)===v))});}return}
 if(act==='focus2noticed'){const v=button.dataset.value;data.focus2Noted=data.focus2Noted.includes(v)?data.focus2Noted.filter(x=>x!==v):data.focus2Noted.concat(v);root.querySelectorAll('[data-act=focus2noticed]').forEach(b=>{b.classList.toggle('chosen',data.focus2Noted.includes(b.dataset.value));b.setAttribute('aria-pressed',String(data.focus2Noted.includes(b.dataset.value)))});return}
 if(act==='stimulus'){
  const v=button.dataset.value;
  data.usefulStimuli=data.usefulStimuli.includes(v)?data.usefulStimuli.filter(x=>x!==v):data.usefulStimuli.concat(v);
  button.classList.toggle('picked',data.usefulStimuli.includes(v));return
 }
 if(act==='save'){void save();return}
});
root.addEventListener('input',e=>{const el=e.target.closest('[data-field]');if(el)readValue(el)});
root.addEventListener('change',e=>{const el=e.target.closest('[data-field]');if(el){readValue(el);if(el.type==='radio'){el.closest('fieldset')?.querySelectorAll('label').forEach(label=>label.classList.toggle('chosen',label.querySelector('input')?.checked===true));if(el.name==='discomfort'&&el.value==='dolor'){notification='Detén el contacto que causa dolor y consulta si persiste.';if(isFocusII())render()};}}});
if(isDaily){Promise.resolve().then(()=>api.isDailyCompleted?.()).then(v=>{if(v===true){saved=true;notification='Esta actividad ya está completada en tu programa. No se duplicará.';render();}}).catch(()=>{});}
window.addEventListener('pagehide',()=>{stopAudio();stopClock()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)pauseGuide()});
window.addEventListener('spm:sensate-context',()=>{if(!canPractice()&&running){pauseGuide();return}stopAudio();render()});
render();
})();