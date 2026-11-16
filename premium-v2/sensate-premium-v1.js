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
// Session 1 has an approved, real photographic five-shot strip in this branch.
// The other sessions deliberately use assets actually included with the repository,
// never missing image URLs. Controls above the photography remain interactive.
const FOCUSI_PHOTO_STEPS={'sf-i-1':'focus-i-day-1-steps.webp'};
// Use adult, calm, photographed environments only; no generic UI screenshots,
// distress scenes or sexual-performance advertising from unrelated modules.
// Eliminar rutas heredadas de fotografías ajenas a Focalización.
// Use only photography specific to Sensate Focalizacion during each guided
// step; never reuse unrelated wellness, performance or promotional pictures.
const STEP_PHOTOS={
 'sf-i-1':['seated','forearm','intro','release','seated'],
 'sf-i-2':['forearm','intro','seated','release','forearm'],
 'sf-i-3':['partner','forearm','seated','release','partner'],
 'sf-i-4':['partner','seated','forearm','release','partner'],
 'sf-i-5':['partner','release','forearm','seated','partner'],
 'sf-focus-2':['partner','forearm','seated','release','partner'],
 'sf-focus-2-solo':['seated','forearm','intro','release','seated']
};
function photoPath(key){return PREFIX+(SCENES[key]||SCENES.intro)}
function stagePhoto(i){
 const strip=FOCUSI_PHOTO_STEPS[id],frame=(i/4*100)+'%';
 const photo=(STEP_PHOTOS[id]||['intro','seated','forearm','release','partner'])[i]||'intro';
 const path=strip?PREFIX+strip:photoPath(photo);
 const shade='linear-gradient(90deg,rgba(6,29,34,.93) 0%,rgba(9,36,45,.87) 34%,rgba(13,46,51,.20) 78%,rgba(13,46,51,.08) 100%)';
 return '<span class="sensate-stage-photo" aria-hidden="true" style="background-image:'+shade+',url(&quot;'+path+'&quot;);background-size:100% 100%,'+(strip?'100% 500%':'cover')+';background-position:center,'+(strip?'center '+frame:'center')+'"></span>';
}
function sessionScene(key,kind){
 if(isNewFocusI()){
  const strip=FOCUSI_PHOTO_STEPS[id],firstPhoto=(STEP_PHOTOS[id]||[key])[0];
  return '<figure class="sensate-scene sensate-session-scene '+kind+'" role="img" aria-label="Práctica de focalización sensorial para adultos">'+
   '<span aria-hidden="true" class="sensate-session-photo" style="background-image:linear-gradient(90deg,rgba(10,43,45,.10),rgba(10,43,45,.06)),url(&quot;'+(strip?PREFIX+strip:photoPath(firstPhoto))+'&quot;);background-size:100% 100%,'+(strip?'100% 500%':'cover')+';background-position:center,'+(strip?'center 0%':'center')+'"></span></figure>';
 }
 return scene(key,kind);
}
const PHASES={
 // Five distinct Focus I sessions, preserving the seven-day Sensate cadence.
 'sf-i-1':[
  ['Siente el apoyo','Siéntate o recuéstate. Nota el contacto de tus pies, espalda o manos con la superficie. Respira con naturalidad.',60],
  ['Recorre tu cuerpo','Observa suavemente hombros, manos y brazos. Reconoce dónde sientes calma o tensión, sin tratar de corregir nada.',60],
  ['Observa un punto','Lleva tu atención al apoyo de las manos sobre tus piernas. Percibe una sola sensación, sin cambiarla ni evaluarla.',60],
  ['Elige una sensación','Nombra mentalmente una sensación concreta y vuelve a ella cuando aparezca una distracción.',60],
  ['Reconoce tu experiencia','Detén el contacto. Identifica qué zona o sensación te resultó más fácil de percibir. No hay nada que demostrar.',60]
 ],
 'sf-i-2':[
  ['Llega a tu cuerpo','Busca privacidad y adopta una postura cómoda. Respira con naturalidad y deja de comprobar cómo estás rindiendo. Vas a conocer qué sensaciones te resultan agradables, no a provocar una respuesta.',60],
  ['Descubre tus zonas sensibles','Con la mano explora, a tu ritmo, brazos, cuello, hombros, pecho, abdomen o muslos. Identifica dónde sientes más comodidad, interés o placer. No existe una zona que deba excitarte.',60],
  ['Cambia la forma de tocar','En una zona agradable, compara una caricia lenta, un roce ligero, una presión suave y una pausa. Nota qué contacto favorece tu conexión o despierta curiosidad.',60],
  ['Reconoce tu excitación','Observa si aparece interés, deseo o excitación y qué contacto pudo acompañarlo. Si no aparece, también es válido: evita comprobar la erección o forzar el placer.',60],
  ['Recuerda tu descubrimiento','Elige mentalmente una zona y una caricia que disfrutaste. Podrás retomarlas en otro momento íntimo; si aparece ansiedad, vuelve a esa sensación sin exigirte resultados.',60]
 ],
 'sf-i-3':[
  ['Acuerden un encuentro libre','Elijan, cuando ambos quieran, un momento de cercanía sin prisa. Pregunten qué contactos son cómodos y acuerden que cualquiera puede cambiar de idea o detenerse; no hay obligación de tener relaciones sexuales.',60],
  ['Empiecen por la cercanía','Si a ambos les agrada, comiencen con un abrazo, una mirada o un beso suave. Nota la temperatura de su piel, su respiración y cómo se siente estar cerca.',60],
  ['Exploren por turnos','Uno acaricia lentamente manos, espalda, brazos o cuello y el otro recibe. Presta atención al ritmo y la presión. Mantengan el contacto no genital en esta etapa y respeten lo que cada uno desea.',60],
  ['Descubran qué los conecta','Cambien de rol si quieren. Perciban el olor del cabello o de la piel, la respiración compartida y los gestos que producen cercanía. Los sonidos no sustituyen el consentimiento: pregúntenlo.',60],
  ['Regresen a las sensaciones','Si aparece el pensamiento “¿y si fallo?”, reconócelo sin discutir con él. Vuelve al beso, la caricia o la respiración que te agradó. Pueden seguir, hacer una pausa o terminar con libertad.',60]
 ],
 'sf-i-4':[
  ['Recuerden lo que sintieron','En un próximo momento juntos, recuerden una caricia, un beso o una sensación agradable. No se evalúen ni comparen el encuentro anterior: cada experiencia puede ser distinta.',60],
  ['Digan qué les gusta','Por turnos, expresen una preferencia concreta y respetuosa: “Me gusta cuando me acaricias despacio” o “Prefiero un beso suave”. No adivinen lo que siente el otro.',60],
  ['Escuchen y comprueben','Quien escucha puede preguntar “¿Así está bien?” y prestar atención a la respiración, los gestos y las respuestas verbales. Si alguien no desea seguir, se detienen.',60],
  ['Prueben un cambio pequeño','Cuando ambos quieran, varíen una sola cosa: presión, velocidad, tipo de caricia o cercanía. Observen qué les genera conexión, disfrute o deseo, sin convertirlo en una prueba.',60],
  ['Lleven la atención al presente','Si surge miedo a perder la erección o a terminar rápido, reconoce el pensamiento y regresa al contacto, al olor de su piel o a la respiración compartida. Puedes pedir un ritmo más tranquilo.',60]
 ],
 'sf-i-5':[
  ['Elijan su propio momento','En el próximo encuentro, acuerden un espacio donde ambos se sientan libres de acercarse, pausar o terminar. El objetivo es disfrutar y conectar, no asegurar una respuesta sexual.',60],
  ['Recuperen lo que les agrada','Recuerden qué besos, caricias, aromas, zonas de contacto o formas de cercanía les gustaron. Comiencen por las que ambos elijan, sin imponer un guion.',60],
  ['Den y reciban atención','Alternen, si lo desean, quién inicia el contacto. Noten calor, respiración, presión agradable y las señales expresadas por cada uno. Pregunten antes de cambiar de zona o intensidad.',60],
  ['Cambien el foco si hay ansiedad','Cuando aparezca “me va a fallar”, evita vigilar la erección o el tiempo. Reconoce el temor y vuelve a una sensación concreta: su beso, su respiración, su piel o una caricia cómoda.',60],
  ['Integren con libertad','Pueden detenerse o continuar con intimidad si ambos lo desean. Reconoce qué te ayudó a estar presente y qué quisieras repetir. No hay un resultado que debas demostrar.',60]
 ],

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
const LABELS={'sf-i-1':'Focus I · Reconoce tu cuerpo','sf-i-2':'Focus I · Descubre sensaciones','sf-i-3':'Focus I · Acércate en pareja','sf-i-4':'Focus I · Comunícate en pareja','sf-i-5':'Focus I · Integra y conecta','sf-solo':'Presencia individual','sf-focus-1':'Focalización I · Contacto no genital','sf-focus-2':'Focalización II · En pareja','sf-focus-2-solo':'Focalización II · Individual','sf-communication':'Comunicación sin presión','sf-recovery':'Recuperar calma y conexión'};
const FOCUSI_DAILY_IDS=['sf-i-1','sf-i-2','sf-i-3','sf-i-4','sf-i-5'];
const FOCUSI_INTROS={
 'sf-i-1':'Bienvenido a Focalización Sensorial I. Esta práctica te ayuda a reconocer tus propias sensaciones, disminuir la tensión y entrenar tu atención. Hoy empezarás individualmente: busca un espacio tranquilo, observa el contacto de tu cuerpo con el entorno y explora suavemente una sensación, sin buscar excitación ni resultados. Escucharás cada paso y podrás avanzar a tu ritmo.',
 'sf-i-2':'Hoy aprenderás a reconocer qué zonas de tu cuerpo y qué formas de contacto te generan comodidad, interés, deseo o excitación. Conocerte te permite disfrutar más conscientemente y dejar de vigilar tu desempeño. Aquí aprenderás cinco pasos y luego podrás llevarlos a tu próximo momento a solas, sin cronómetro ni metas de erección.',
 'sf-i-3':'Esta sesión enseña a llevar la atención desde el rendimiento hacia la conexión con tu pareja. Reconocer el calor de su piel, su respiración, sus besos y sus caricias puede ayudarte a regresar al presente cuando aparezca el miedo a fallar. Aprenderán cinco pasos para un encuentro voluntario, sin exigencias y sin necesidad de practicarlo ahora.',
 'sf-i-4':'La conexión íntima también se aprende comunicando lo que disfrutas. En esta sesión encontrarás cinco pasos para decir qué te gusta, escuchar a tu pareja y ajustar el contacto de común acuerdo. Cuando surja ansiedad de rendimiento, volver a una sensación agradable puede ayudarte a recuperar la atención en el disfrute, sin perseguir un resultado.',
 'sf-i-5':'Hoy integrarás lo aprendido: reconocer qué te atrae, compartirlo con tu pareja y regresar a las sensaciones cuando aparezca la preocupación por la erección o el tiempo. No buscamos controlar la respuesta sexual ni garantizarla; buscamos una experiencia con más presencia, libertad y conexión. Llevarás esta guía a un próximo encuentro.'
};
const FOCUSI_OBJECTIVES={
 'sf-i-2':'Aprende a identificar tus zonas sensibles y los contactos que despiertan interés, conexión o deseo, sin exigirte excitación.',
 'sf-i-3':'Aprende a disfrutar la cercanía y regresar a los besos, caricias y respiración cuando aparezca el temor a fallar.',
 'sf-i-4':'Descubre cómo expresar tus preferencias y enfocar la atención en lo que ambos disfrutan, sin presión por el desempeño.',
 'sf-i-5':'Integra tus descubrimientos en la vida íntima. La meta es disfrutar y conectar, no alcanzar una respuesta sexual determinada.'
};
const FOCUSI_PREP_LESSON='Hoy solo aprenderás la técnica. Busca un momento tranquilo para escuchar las cinco indicaciones. Después puedes realizar la experiencia en privado, a solas o con tu pareja según esta sesión. En pareja, el contacto siempre requiere acuerdo y cualquiera puede hacer una pausa o terminar. No hay obligación de tener relaciones sexuales.';
const FOCUSI_FOLLOWUP={
 'sf-i-3':{previous:'sf-i-2',question:'Desde la sesión anterior, ¿tuviste oportunidad de explorar qué contactos te resultan agradables a solas?'},
 'sf-i-4':{previous:'sf-i-3',question:'¿Pudieron llevar a la vida íntima la propuesta de cercanía sin presión?'},
 'sf-i-5':{previous:'sf-i-4',question:'¿Pudieron conversar sobre lo que disfrutan y probar algún ajuste en pareja?'}
};
const FOCUSI_HOMEWORK={
 'sf-i-2':{
  title:'Conócete en un momento a solas',
  lead:'En un momento privado, elige dos zonas y dos formas de contacto agradables. Observa si despiertan calma, conexión, interés o excitación, sin perseguir una erección.',
  focus:'Una sensación agradable puede ser tu punto de regreso cuando aparezcan pensamientos de rendimiento.',
  audio:'Tu tarea es practicar estos cinco pasos en un momento a solas. Reconoce qué zonas y qué caricias te agradan; observa el deseo o la excitación si aparecen, sin forzarlos. Guarda mentalmente esa referencia para un próximo encuentro. No necesitas informar detalles íntimos al programa.'
 },
 'sf-i-3':{
  title:'Comparte un momento de cercanía',
  lead:'En su próximo encuentro, si ambos lo desean, comiencen con besos, abrazos o caricias no genitales. Presten atención al calor de la piel, la respiración y el contacto.',
  focus:'Si aparece “¿y si fallo?”, reconoce el pensamiento y vuelve a una sensación que estés disfrutando.',
  audio:'Tu tarea en pareja no es demostrar nada. En un momento elegido por ambos, exploren contacto no genital, besos y respiración compartida. Si aparece el miedo a fallar, vuelve a una sensación agradable. Pueden hacer una pausa o terminar cuando quieran.'
 },
 'sf-i-4':{
  title:'Pide y ofrece lo que disfrutan',
  lead:'En un próximo encuentro, compartan una preferencia cada uno. Pregunten cómo se siente el contacto y prueben un pequeño cambio de ritmo o presión, solo si ambos quieren.',
  focus:'Cuando surja ansiedad, regresa a una caricia, un beso o una respiración agradable, no a comprobar tu respuesta sexual.',
  audio:'En su próximo momento íntimo, expresen con respeto una caricia o un beso que disfrutan. Escuchen la respuesta de la otra persona y ajusten el contacto de común acuerdo. La atención se dirige al disfrute compartido, no a examinar el desempeño.'
 },
 'sf-i-5':{
  title:'Lleva la focalización a tu intimidad',
  lead:'En el próximo encuentro, recuperen las sensaciones que les gustaron: besos, caricias, cercanía, olor de la piel o respiración compartida. Cada encuentro puede ser diferente.',
  focus:'Cuando aparezca el miedo al rendimiento, reconoce la preocupación y vuelve suavemente a la sensación presente.',
  audio:'Has aprendido a identificar sensaciones y a compartirlas en pareja. Tu tarea es usar esa atención en próximos encuentros, sin cronómetro ni obligación de tener relaciones sexuales. Cuando aparezca ansiedad, regresa al beso, la caricia o la respiración que disfrutas. El objetivo es conexión y libertad.'
 }
};
const FOCUSI_PREP='Elige un momento privado y cómodo. Sigue las cinco acciones con audio y avanza cuando te resulte natural. No existe un tiempo obligatorio. En pareja, ambos participan voluntariamente y pueden detenerse o cambiar el contacto en cualquier momento.';
const FOCUSI_CLOSE='Terminaste la práctica. Recuerda qué sensación te ayudó a estar presente y qué fue agradable. No necesitas medir una respuesta sexual. Registra cómo te sentiste y vuelve a tu día.';
const FOCUSI_TITLES={
 'sf-i-1':'Reconoce tu cuerpo','sf-i-2':'Descubre lo que te gusta','sf-i-3':'Conecta sin presión',
 'sf-i-4':'Comunica lo que disfrutas','sf-i-5':'Integra y disfruta'
};
const INTRO='Focalización sensorial no es una prueba de desempeño. El objetivo es volver a percibir temperatura, presión, textura y ritmo del contacto. No necesitas lograr erección, penetración, orgasmo ni una duración concreta. Puedes practicar a solas o, con consentimiento, en pareja.';
const PREP='Busca un lugar tranquilo, privado y sin interrupciones. Acomódate y elige la práctica individual o en pareja. En pareja, verifiquen que los dos quieran participar y recuerden que cualquiera puede pedir una pausa o terminar cuando lo necesite. Focus I es contacto no genital, sin pecho ni genitales. Puedes practicar sin meta de erección, penetración ni orgasmo.';
const PREP_FOCUSII='Busca un lugar privado, donde puedas relajarte. Elige si practicarás individualmente o en pareja. Explora el contacto a tu propio ritmo: puedes variar la intensidad, detenerte o hacer una pausa. En pareja, ambos participan voluntariamente y respetan sus límites.';
const FOCUSII_WELCOME='Bienvenido a Focalización Sensorial II. Esta práctica te invita a explorar nuevas sensaciones, reconocer diferentes ritmos de contacto y disfrutar de la conexión sin exigencias. Empieza en un lugar cómodo y sigue los cinco pasos a tu ritmo. Puedes realizarla individualmente o en pareja. La atención está en sentir, no en demostrar un resultado.';
const FOCUSII_WELCOME_DESIRE='Bienvenido a Sensate Focus II. Hoy explorarás nuevas sensaciones, la cercanía y las respuestas de tu cuerpo sin exigir que el deseo aparezca de inmediato. Comenzaremos con el contacto que te resulte agradable, ampliaremos los estímulos a tu ritmo y observaremos lo que despierta interés y disfrute. Tu objetivo es explorar y conectar, no alcanzar un resultado determinado.';
const CLOSING='Llegaste al cierre. Registra qué tan presente y cómodo te sentiste, si hubo presión o distracción, y si apareció molestia o dolor. No necesitas un resultado perfecto. El objetivo es observar tu experiencia y repetir a tu ritmo.';
const CLOSING_FOCUSII='Has llegado al final de Focus II. Lo importante no fue lograr una respuesta sexual, sino explorar sensaciones sin presión. Elige cómo te sentiste y qué notaste. Si hubo dolor, detén el contacto y busca orientación si persiste. Guarda tu práctica cuando termines.';
const API_NOTE='<details class="more"><summary>Aplicaciones clínicas del recurso original</summary><p><b>Firmeza:</b> un cambio en la erección no invalida la práctica. Puedes volver al contacto no genital.</p><p><b>Deseo responsivo:</b> el deseo puede aparecer después del contacto, o no aparecer; ambas respuestas son válidas.</p><p><b>Control eyaculatorio:</b> observar sensaciones puede ayudarte a reconocer cambios de excitación sin convertirlos en una prueba de tiempo.</p></details>';
const META=api.getContext();
const isDaily=META.mode==='daily';
const assigned=META.activity||null;
const safeText=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readRecords(){try{const rows=JSON.parse(api.getState()[KEY]||'[]');return Array.isArray(rows)?rows:[]}catch{return[]}}
// No previous-session gate, medical review banner or test result is needed to begin Focus I/II.
function canPractice(){const c=api.getContext();return !!c&&(!isDaily||(c.activity&&Number(c.activity.day)===Number(c.day)))}
let id=isDaily?(assigned?.practiceId||'sf-solo'):'sf-focus-1';
if(!PHASES[id])id='sf-solo';
let screen=0,phase=0,selectedMode=null,explainPhase=0,explainingAll=false,guideSetupHeard=false,consent=false,performed=false,saved=false,busy=false,hasPain=false;
let explainPauseTimer=0,explainPlaybackToken=0;
let t=0,timer=0,running=false,voiceActive=false,entryId=null,error='',notification='',guideStarted=false,guideDone=false,phaseElapsed=0,halfwayNoted=false;
let followUpResponse=null;
let data={presenceBefore:5,pressureBefore:5,presenceAfter:5,pressureAfter:5,enjoyment:5,partnerComfort:7,comfort:'',ease:'',attention:'',repeat:'',discomfort:'',usefulStimuli:[],monitoringIntrusions:0,notes:'',focus2Rating:null,focus2Noted:[]};const touched=new Set();
const isPartner=()=>id==='sf-focus-1'||id==='sf-focus-2'||['sf-i-3','sf-i-4','sf-i-5'].includes(id);
const isNewFocusI=()=>FOCUSI_DAILY_IDS.includes(id);
const isFocusILesson=()=>isNewFocusI()&&id!=='sf-i-1';
const isModernFocus=()=>isNewFocusI()||isFocusII();
const isFocusII=()=>id==='sf-focus-2'||id==='sf-focus-2-solo';
const originalDay=Number(META.day)||1;
const existing=isDaily?readRecords().find(r=>r&&r.day===originalDay&&r.completed===true&&r.origin==='dailyPlan'):null;
if(existing){followUpResponse=existing.followUp?.response||null;entryId=existing.id||null;notification='Hay un registro previo de focalización en este día; comprobaré si ya está completado en tu programa.';}

function clockText(n){const x=Math.max(0,Math.floor(n));return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0')}
function stopClock(){if(timer){clearInterval(timer);timer=0}running=false}
function stopAudio(){clearTimeout(explainPauseTimer);explainPauseTimer=0;explainPlaybackToken++;window.speechSynthesis?.cancel?.();voiceActive=false;explainingAll=false;root.querySelectorAll('[data-audio]').forEach(el=>el.classList.remove('playing'))}
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
function explanatoryText(i=explainPhase){const p=PHASES[id][i];return p[0]+'. '+p[1]}
function autoGuideIntro(){if(isNewFocusI())return 'Esta sesión de Focalización I tiene cinco acciones guiadas. Escucha cada indicación y practica a tu ritmo. El reloj es un apoyo opcional: tú decides cuándo pasar al siguiente paso. Puedes pausar, repetir la instrucción o terminar cuando quieras. Los silencios te permiten sentir, no son errores del audio.';if(isFocusII())return 'Vas a realizar Focus II en modalidad '+(isPartner()?'en pareja':'individual')+'. Son cinco momentos guiados. Escucha cada indicación, practica sin prisa y pulsa Siguiente paso cuando quieras avanzar. El cronómetro es opcional, no marca un tiempo obligatorio. Puedes pausar, escuchar de nuevo o terminar en cualquier momento. El silencio permite sentir, no es un fallo del audio.';return 'Vas a realizar una práctica '+(isPartner()?'en pareja':'individual')+' de cinco acciones. Cada paso tendrá una instrucción hablada y aproximadamente un minuto para practicar en silencio. El silencio forma parte de la guía: no significa que el programa se haya pausado ni terminado. Después escucharás automáticamente el paso siguiente. Puedes pausar, repetir o adelantar cuando lo necesites.'}
function stepAudio(){return PHASES[id][phase][0]+'. '+PHASES[id][phase][1]}
function explainStep(i){stopAudio();explainPhase=i;notification='';render();speech(explanatoryText(i),null,'[data-act="explainstep"][data-value="'+i+'"]')}
function explainAll(){stopAudio();explainingAll=true;const playback=explainPlaybackToken;let pos=0;function speakNext(){if(playback!==explainPlaybackToken||!explainingAll||screen!==2)return;if(pos>=5){explainingAll=false;render();return}explainPhase=pos;render();const current=pos++;const onFinished=()=>{if(playback!==explainPlaybackToken||!explainingAll)return;if(!isNewFocusI()){speakNext();return;}explainPauseTimer=setTimeout(()=>{explainPauseTimer=0;speakNext()},1600)};if(!speech(explanatoryText(current),onFinished,'[data-act="explainstep"][data-value="'+current+'"]')){explainingAll=false;notification='Puedes consultar cada paso en «Leer el paso seleccionado».';render()}}speakNext()}
function guideTick(){
 if(!running||screen!==3)return;
 phaseElapsed++;t++;
 const elapsed=root.querySelector('[data-guide-elapsed]');if(elapsed)elapsed.textContent=clockText(t);
 if(isModernFocus()){const phaseTime=root.querySelector('[data-guide-phase-elapsed]');if(phaseTime)phaseTime.textContent=clockText(phaseElapsed);return;} // No forced phase transitions in Focus II.
 const left=root.querySelector('[data-guide-left]');if(left)left.textContent=clockText(Math.max(0,60-phaseElapsed));
 const progressBar=root.querySelector('[data-guide-bar]');if(progressBar)progressBar.style.width=Math.min(100,phaseElapsed/60*100)+'%';
 if(phaseElapsed>=60)advanceGuide();
}
function armGuideTimer(){if(timer)clearInterval(timer);timer=setInterval(guideTick,1000)}
function startGuide(){
 if(!canPractice()){error='Esta sesión pertenece a otro día del programa.';render();return}
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
 if(!canPractice()){error='Esta sesión pertenece a otro día del programa.';render();return}
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
function audioText(){if(screen===0)return isNewFocusI()?FOCUSI_INTROS[id]:isDaily&&assigned?.practiceId==='sf-focus-2'?(META.profile==='desire'?FOCUSII_WELCOME_DESIRE:FOCUSII_WELCOME):INTRO;if(screen===1)return isFocusILesson()?FOCUSI_PREP_LESSON:isNewFocusI()?FOCUSI_PREP:isFocusII()?PREP_FOCUSII:PREP;if(screen===2)return explanatoryText();if(screen===3)return guideStarted?stepAudio():autoGuideIntro();return isFocusILesson()?FOCUSI_HOMEWORK[id].audio:isNewFocusI()?FOCUSI_CLOSE:isFocusII()?CLOSING_FOCUSII:CLOSING}
function resetType(next){
 stopAudio();stopClock();id=next;selectedMode=(next==='sf-solo'||next==='sf-focus-2-solo'||['sf-i-1','sf-i-2'].includes(next)||next==='sf-communication'||next==='sf-recovery')?'individual':'partner';
 phase=0;phaseElapsed=0;t=0;explainPhase=0;guideStarted=false;guideDone=false;
 consent=selectedMode==='partner';performed=false;error='';notification='';screen=2;render();
}
function selectBranch(branch){
 if(!['individual','partner'].includes(branch))return;
 if(!canPractice()){error='Esta sesión pertenece a otro día del programa.';render();return}
 if(isDaily&&FOCUSI_DAILY_IDS.includes(assigned?.practiceId)){
   const required=['sf-i-1','sf-i-2'].includes(assigned.practiceId)?'individual':'partner';
   if(branch!==required){error='Esta sesión tiene un recorrido propio. Elige la modalidad que aparece en pantalla.';render();return}
   resetType(assigned.practiceId);return;
 }
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
 return '<div class="sensate-instruction"><button type="button" data-act="audio" data-audio class="audio-control" aria-label="'+label+'">🔊 '+label+'</button><details class="more"><summary>Leer instrucciones</summary><p>'+safeText(audioText())+'</p></details></div>';
}

// Approved photographic SPM screens. The artwork is the screen itself, as in
// Start–Stop: transparent real buttons overlay the approved coordinates.
// Only the first Focus I day uses this specific artwork; the other days retain
// their distinct clinical photographs and routes.
const SPM_APPROVED_ATLAS=PREFIX+'spm-approved-focus-screen-atlas.avif';
function spmApprovedButton(coords,action,label,value,extra=''){
 const rect=coords,px=n=>String(Math.round(n*1000)/1000)+'%';
 const style='left:'+px(rect[0]/941*100)+';top:'+px(rect[1]/1672*100)+';width:'+px((rect[2]-rect[0])/941*100)+';height:'+px((rect[3]-rect[1])/1672*100)+';';
 return '<button type="button" class="spm-approved-hit" data-act="'+action+'" '+(value===undefined?'':'data-value="'+safeText(value)+'"')+' aria-label="'+safeText(label)+'" style="'+style+'" '+extra+'></button>';
}
function spmApprovedScreen(){
 const visual=screen===0?'intro':screen===2?'guide':'practice';
 const atlasPosition=screen===0?'top':screen===2?'center':'bottom';
 let controls='',overlays='';
 if(screen===0){
  controls+=spmApprovedButton([30,45,405,120],'close','Volver a mi programa');
  controls+=spmApprovedButton([52,507,885,626],'audio','Escuchar introducción',undefined,'data-audio');
  controls+=spmApprovedButton([50,652,884,750],'approvedread','Leer instrucciones');
  controls+=spmApprovedButton([540,1475,915,1592],'next','Comenzar mi práctica');
 }
 if(screen===2){
  controls+=spmApprovedButton([27,48,395,120],'close','Volver a mi programa');
  controls+=spmApprovedButton([50,498,883,626],'explainall','Escuchar los cinco pasos',undefined,'data-audio');
  [[37,652,894,802],[37,811,894,960],[37,966,894,1111],[37,1119,894,1262],[37,1273,894,1413]].forEach((r,i)=>{
   controls+=spmApprovedButton(r,'explainstep','Escuchar '+PHASES[id][i][0],i,'data-audio');
  });
  controls+=spmApprovedButton([28,1474,360,1582],'back','Volver a preparación');
  controls+=spmApprovedButton([534,1473,912,1582],'next','Continuar a la práctica');
 }
 if(screen===3){
  controls+=spmApprovedButton([27,50,397,121],'close','Volver a mi programa');
  controls+=spmApprovedButton([40,572,896,691],guideStarted?'repeataudio':'guideintro',guideStarted?'Repetir la indicación':'Escuchar cómo funciona',undefined,'data-audio');
  [[82,208],[239,379],[396,538],[548,698],[715,860]].forEach((x,i)=>{
   controls+=spmApprovedButton([x[0],303,x[1],402],'phase','Ir al paso '+(i+1)+': '+PHASES[id][i][0],i,guideStarted?'':'disabled');
  });
  controls+=spmApprovedButton([30,1500,345,1615],'back','Volver a los cinco pasos');
  // Pantalla 4: el atlas es el recurso visual aprobado de Focalización.
  // No superponer fotografías recicladas de otras actividades.
  if(phase!==0)overlays+='<div class="spm-approved-phase-title"><small>Paso '+(phase+1)+' de 5</small><strong>'+safeText(PHASES[id][phase][0])+'</strong></div>';
  overlays+='<strong class="spm-approved-clock" data-guide-elapsed>'+clockText(t)+'</strong>';
  if(guideStarted&&!guideDone)overlays+='<button type="button" class="spm-approved-pause" data-act="'+(running?'pauseguide':'resumeguide')+'">'+(running?'⏸ Pausar':'▶ Reanudar')+'</button>';
  overlays+='<button type="button" class="spm-approved-skip" data-act="skipguide" aria-label="Saltar actividad e ir al cierre sin marcarla como realizada">Saltar actividad →</button>';
  overlays+='<button type="button" class="spm-approved-next" data-act="approvedadvance">'+(!guideStarted?'Iniciar guía →':phase===4?'Terminar y evaluar →':'Siguiente paso →')+'</button>';
 }
 const caption=screen===0?'Conecta con tus sensaciones · 1 / 5':screen===2?'Tu práctica guiada · 3 / 5 · '+PHASES[id].map(p=>p[0]).join(' · '):'Práctica en curso · 4 / 5 · Paso '+(phase+1)+' · '+PHASES[id][phase][0];
 const extra=(error?'<div class="spm-approved-feedback" role="alert">'+safeText(error)+'</div>':notification?'<div class="spm-approved-feedback" role="status">'+safeText(notification)+'</div>':'');
 return '<div class="layout sf-matte sensate-approved-layout">'+
  '<div class="spm-approved-screen spm-approved-'+visual+'" role="group" aria-label="SPM Focalización sensorial, '+(screen+1)+' de 5" style="background-image:url(&quot;'+SPM_APPROVED_ATLAS+'&quot;);background-position:center '+atlasPosition+';"><span class="spm-approved-sr">'+safeText(caption)+'</span>'+controls+overlays+'</div>'+
  extra+'<dialog class="spm-approved-info" aria-label="Leer instrucciones"><button type="button" data-act="approvedinfo-close" aria-label="Cerrar instrucciones">×</button><h2>Instrucciones</h2><p>'+safeText(audioText())+'</p></dialog></div>';
}


/* Screens 2 and 5: complete premium compositions at the same 941 x 1672
   canvas resolution as approved screens 1/3/4. Controls are the artwork's
   real accessible targets. The approved 3-screen atlas is NOT edited. */
function spmArtworkScreen(){
 const second=screen===1;
 const dayName=isNewFocusI()?'FOCALIZACIÓN I · SESIÓN '+(FOCUSI_DAILY_IDS.indexOf(id)+1)+' DE 5':'FOCALIZACIÓN SENSORIAL';
 const currentCaption=second?'Tu práctica individual':'Cierre de tu práctica';
 const step=second?2:5;
 const url=PREFIX+(second?'spm-focus-session1-screen2-user-20261115.avif':'spm-focus-session1-screen5-user-20261115.avif');
 const footerBack='<button type="button" class="spm-art-nav-back" data-act="back">Anterior</button>';
 const footerAction=second?'<button type="button" class="spm-art-nav-next" data-act="next">Continuar →</button>':
  '<button type="button" class="spm-art-nav-next" data-act="'+(saved||!performed?'close':'save')+'" '+(busy?'disabled':'')+'>'+(saved?'Finalizar':!performed?'Volver luego':busy?'Guardando…':'Guardar experiencia')+'</button>';
 const listen='<button type="button" class="spm-art-listen" data-act="audio" data-audio aria-label="'+(second?'Escuchar preparación':'Escuchar cierre')+'"><span class="spm-art-speaker" aria-hidden="true">🔊</span><span>'+(second?'Escuchar preparación':'Escuchar cierre')+'</span></button>';
 const read='<button type="button" class="spm-art-read" data-act="approvedread">＋ Leer instrucciones</button>';
 const panels=second?
  '<div class="spm-art-content spm-art-content-prep"><div class="spm-art-kicker">'+dayName+'</div>'+
  '<h1>'+(isPartner()?'Tu práctica en pareja':'Tu práctica individual')+'</h1>'+
  '<p>'+(isPartner()?'Elijan un momento cómodo y escuchen juntos las instrucciones de hoy.':'Encuentra un lugar cómodo y escucha las instrucciones de hoy.')+'</p>'+
  listen+read+
  '<button type="button" class="spm-art-photo spm-art-prep-entry" data-act="branch" data-value="'+(isPartner()?'partner':'individual')+'" style="background-image:url(&quot;'+url+'&quot;)" aria-label="Iniciar la práctica '+(isPartner()?'en pareja':'individual')+'"><span>▶ Iniciar mi práctica</span></button></div>':
  '<div class="spm-art-content spm-art-content-close"><div class="spm-art-kicker">'+dayName+'</div>'+
  '<h1>Cierre de tu práctica</h1><p>Reconoce lo que sentiste, sin exigencias.</p>'+listen+read+
  '<div class="spm-art-photo" style="background-image:url(&quot;'+url+'&quot;)" role="img" aria-label="Cierre tranquilo de la práctica"></div>'+
  '<h2>¿Cómo estuvo tu bienestar?</h2><div class="spm-art-rating" role="group" aria-label="Bienestar de 0 a 4">'+
   [['0','Ausente'],['1','Bajo'],['2','Aceptable'],['3','Satisfactorio'],['4','Muy bien']].map(([n,label])=>'<button type="button" data-act="focus2rating" data-value="'+n+'" class="'+(data.focus2Rating===Number(n)?'chosen':'')+'" aria-pressed="'+(data.focus2Rating===Number(n))+'"><b>'+n+'</b><small>'+label+'</small></button>').join('')+
  '</div><h2>Hoy noté</h2><div class="spm-art-chips">'+['Más calma','Más conexión','Menos presión'].map(v=>'<button type="button" data-act="focus2noticed" data-value="'+v+'" class="'+(data.focus2Noted.includes(v)?'chosen':'')+'" aria-pressed="'+data.focus2Noted.includes(v)+'">'+v+'</button>').join('')+'</div>'+
  '<h2>Me sentí</h2><div class="spm-art-chips">'+[['comodo','Cómodo'],['neutro','Neutro'],['tenso','Tenso']].map(([v,t])=>'<button type="button" data-act="approvedchoice" data-field="comfort" data-value="'+v+'" class="'+(data.comfort===v?'chosen':'')+'" aria-pressed="'+(data.comfort===v)+'">'+t+'</button>').join('')+'</div>'+
  '<h2>¿Molestia o dolor?</h2><div class="spm-art-chips">'+[['ninguna','No'],['molestia','Molestia'],['dolor','Dolor']].map(([v,t])=>'<button type="button" data-act="approvedchoice" data-field="discomfort" data-value="'+v+'" class="'+(data.discomfort===v?'chosen':'')+'" aria-pressed="'+(data.discomfort===v)+'">'+t+'</button>').join('')+'</div></div>';
 const feedback=error?'<p class="spm-art-feedback" role="alert">'+safeText(error)+'</p>':notification?'<p class="spm-art-feedback" role="status">'+safeText(notification)+'</p>':'';
 return '<div class="layout sf-matte sensate-approved-layout"><div class="spm-artwork-screen spm-artwork-'+step+'" role="group" aria-label="SPM Focalización sensorial, pantalla '+step+' de 5" style="background-image:url(&quot;'+PREFIX+'focus-screen-'+step+'-canvas.svg&quot;)">'+
  '<span class="spm-art-scrim" aria-hidden="true"></span>'+
  spmApprovedButton([26,46,405,133],'close','Volver a mi programa')+
  '<div class="spm-art-header" aria-hidden="true"><span class="spm-art-back-visual">← Volver a mi programa</span><span class="spm-art-brand"><b>SPM</b><small>FOCALIZACIÓN<br>SENSORIAL</small></span></div>'+ 
  '<div class="spm-art-progress" aria-label="'+step+' de 5" role="progressbar" aria-valuemin="0" aria-valuemax="5" aria-valuenow="'+step+'"><i style="width:'+(step*20)+'%"></i></div>'+
  '<p class="spm-art-meta">'+(isDaily?'DÍA '+originalDay+' / 28':'BIBLIOTECA')+' · FOCALIZACIÓN I · '+step+'/5</p>'+
  '<section class="spm-art-panel">'+panels+'</section><nav class="spm-art-nav" aria-label="Navegar por focalización">'+footerBack+'<span>'+step+' / 5</span>'+footerAction+'</nav>'+
  '</div>'+feedback+
  '<dialog class="spm-approved-info" aria-label="Leer instrucciones"><button type="button" data-act="approvedinfo-close" aria-label="Cerrar instrucciones">×</button><h2>Instrucciones</h2><p>'+safeText(audioText())+'</p></dialog></div>';
}


/* Sesión 2 · cuatro láminas aprobadas como lienzos únicos; zonas HTML táctiles reales. */
const SPM_S2_FILES={0:'spm-focus-i-s2-screen-1-approved.webp',1:'spm-focus-i-s2-screen-2-approved.webp',2:'spm-focus-i-s2-screen-3-approved.webp',4:'spm-focus-i-s2-screen-4-approved.webp'};
const SPM_S2_VALUES={
 atencion:'Atención. Lleva tu mente a lo que percibes ahora, sin evaluarte.',
 sensaciones:'Sensaciones. Observa temperatura, textura, presión y las caricias que te resultan agradables.',
 sinpresion:'Sin presión. No tienes que conseguir una respuesta sexual determinada para aprender de esta actividad.'
};
const SPM_S2_TASKS={
 zonas:'Cuando dispongas de un momento privado, elige dos zonas de tu cuerpo donde el contacto te resulte agradable. Puedes cambiar de idea.',
 contactos:'Prueba dos formas de contacto, como una caricia lenta y un roce ligero. Observa cuál te agrada, sin forzar una respuesta.',
 observa:'Reconoce si aparece calma, interés, deseo o excitación. También es válido que no aparezcan. No necesitas evaluarte.'
};
let spmS2Value='',spmS2Task='',spmS2Step=-1;
function spmS2Hit(rect,action,label,value,opts={}){
 const extras=(opts.audio?' data-audio':'')+(opts.selectable?' aria-pressed="'+String(!!opts.chosen)+'"':'')+(opts.disabled?' disabled':'');
 return spmApprovedButton(rect,action,label,value,extras).replace('class="spm-approved-hit"','class="spm-approved-hit spm-s2-hit'+(opts.chosen?' chosen':'')+'"');
}
function spmApprovedSession2Screen(){
 const page=screen===4?4:screen+1;
 const caption=screen===0?'Descubre lo que te gusta · 1 / 4':
  screen===1?'Tu práctica individual · 2 / 4 · No necesitas realizar la actividad íntima frente a la pantalla.':
  screen===2?'Aprende la técnica · 3 / 4 · '+PHASES[id].map(step=>step[0]).join(' · '):
  'Llévalo a tu vida · 4 / 4 · Guarda lo aprendido, sin afirmar que ya realizaste la experiencia íntima.';
 let hits=spmS2Hit([25,25,446,130],'close','Volver a mi programa');
 if(screen===0){
  hits+=spmS2Hit([99,1150,856,1272],'audio','Escuchar introducción',undefined,{audio:true});
  hits+=spmS2Hit([103,1278,852,1393],'approvedread','Leer instrucciones');
  const values=[['atencion',[31,1405,300,1551],'Atención'],['sensaciones',[319,1405,617,1551],'Sensaciones'],['sinpresion',[636,1405,931,1551],'Sin presión']];
  for(const [key,rect,label] of values)hits+=spmS2Hit(rect,'s2value','Escuchar concepto: '+label,key,{audio:true,selectable:true,chosen:spmS2Value===key});
  hits+=spmS2Hit([31,1557,342,1668],'close','Anterior: volver a mi programa');
  hits+=spmS2Hit([550,1552,923,1667],'next','Comenzar: ir a preparación');
 }else if(screen===1){
  hits+=spmS2Hit([99,1150,855,1270],'audio','Escuchar preparación',undefined,{audio:true});
  hits+=spmS2Hit([102,1279,851,1392],'approvedread','Leer instrucciones de preparación');
  hits+=spmS2Hit([101,1402,876,1545],'branch','Aprender los cinco pasos','individual');
  hits+=spmS2Hit([30,1558,341,1668],'back','Anterior: volver a introducción');
  hits+=spmS2Hit([544,1554,923,1668],'next','Continuar a los cinco pasos');
 }else if(screen===2){
  const rects=[[23,525,921,679],[23,693,921,853],[23,860,921,1020],[23,1035,921,1196],[23,1209,921,1375]];
  for(let i=0;i<5;i++)hits+=spmS2Hit(rects[i],'explainstep','Escuchar paso '+(i+1)+': '+PHASES[id][i][0],i,{audio:true,selectable:true,chosen:spmS2Step===i});
  hits+=spmS2Hit([33,1502,342,1606],'back','Anterior: volver a preparación');
  hits+=spmS2Hit([542,1499,926,1607],'next','Llévalo a tu vida: ver tarea');
 }else{
  const tasks=[['zonas',[118,520,866,680],'Elige dos zonas agradables'],['contactos',[118,682,866,839],'Prueba dos formas de contacto'],['observa',[118,845,866,991],'Observa calma, interés o deseo']];
  for(const [key,rect,label] of tasks)hits+=spmS2Hit(rect,'s2task','Escuchar tarea: '+label,key,{audio:true,selectable:true,chosen:spmS2Task===key});
  hits+=spmS2Hit([75,1278,901,1410],'audio','Escuchar mi tarea',undefined,{audio:true});
  hits+=spmS2Hit([45,1503,342,1606],'back','Anterior: volver a los cinco pasos');
  hits+=spmS2Hit([548,1500,930,1613],saved?'close':'save',saved?'Finalizar: aprendizaje guardado':'Guardar aprendizaje',undefined,{disabled:busy});
 }
 const state=error?'<p class="spm-s2-feedback spm-s2-error" role="alert">'+safeText(error)+'</p>':notification?'<p class="spm-s2-feedback" role="status">'+safeText(notification)+'</p>':'';
 const overlay=screen===4&&(busy||saved)?'<span class="spm-s2-saved-overlay" aria-hidden="true">'+(busy?'Guardando…':'Guardado ✓')+'</span>':'';
 return '<div class="layout sf-matte sensate-approved-layout spm-s2-layout">'+
  '<div class="spm-s2-artwork-screen'+(screen===4?' focusi-takeaway':'')+'" role="group" aria-label="SPM Focalización I, sesión 2, pantalla '+page+' de 4" style="background-image:url(&quot;'+PREFIX+SPM_S2_FILES[screen]+'&quot;)">'+
  '<span class="spm-approved-sr">'+safeText(caption)+'</span>'+hits+overlay+'</div>'+state+
  '<dialog class="spm-approved-info spm-s2-info" aria-label="Leer instrucciones"><button type="button" data-act="approvedinfo-close" aria-label="Cerrar instrucciones">×</button><h2>Instrucciones</h2><p>'+safeText(audioText())+'</p></dialog></div>';
}

function progress(){const total=isFocusILesson()?4:5,current=isFocusILesson()&&screen===4?4:screen+1;return '<div class="progress-rail" role="progressbar" aria-label="Progreso del recorrido" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+current+'"><i style="width:'+(current/total*100)+'%"></i></div>'}
function selection(){return '<div class="mode-picker"><p class="eyebrow">Elige cómo practicar</p>'+
  ['sf-solo','sf-focus-1','sf-focus-2','sf-focus-2-solo','sf-communication','sf-recovery'].map(key=>'<button type="button" data-act="mode" data-value="'+key+'" class="mode-card'+(id===key?' selected':'')+'">'+safeText(LABELS[key])+'</button>').join('')+'</div>'}
function focusIFollowUpCard(){
 const f=FOCUSI_FOLLOWUP[id];if(!f)return '';
 const options=[['yes','Sí'],['not_yet','Aún no'],['prefer_not','Prefiero no responder']];
 return '<section class="sensate-followup" aria-label="Seguimiento opcional de una sesión anterior">'+
 '<strong>Un momento para recordar</strong><p>'+safeText(f.question)+'</p>'+
 '<div class="sensate-followup-options" role="group" aria-label="Respuesta opcional">'+
 options.map(([value,label])=>'<button type="button" data-act="followup" data-value="'+value+'" aria-pressed="'+(followUpResponse===value)+'" class="'+(followUpResponse===value?'chosen':'')+'">'+label+'</button>').join('')+
 '</div><small>Esta pregunta es opcional. No necesitas haber realizado la práctica para continuar.</small></section>';
}
function introScreen(){
 const focus2=isDaily&&assigned?.practiceId==='sf-focus-2';
 const focus1=isNewFocusI();
 const heading=id==='sf-i-1'?'Conecta con tus sensaciones':focus1?FOCUSI_TITLES[id]:focus2?(META.profile==='desire'?'Sensate Focus II':'Focalización Sensorial II'):'Conecta con tus sensaciones';
 const lead=id==='sf-i-1'?'Explora esta práctica con calma, sin presión y a tu ritmo.':isFocusILesson()?FOCUSI_OBJECTIVES[id]:focus1?(assigned?.summary||'Aprende a reconocer tus sensaciones a tu ritmo.'):focus2?'Explora nuevas sensaciones sin exigencias, a tu propio ritmo.':'Una práctica para estar presente, reducir la presión y recuperar el disfrute del contacto.';
 return '<section class="card intro-card'+(focus2?' focusii-welcome':'')+'"><p class="eyebrow">SPM · FOCALIZACIÓN SENSORIAL</p><h2>'+heading+'</h2><p>'+lead+'</p>'+
 audioControls()+(id==='sf-i-1'?scene('seated','intro-visual'):focus1?sessionScene(isPartner()?'partner':'intro','intro-visual'):focus2?scene('partner','intro-visual'):scene('intro','intro-visual'))+(isFocusILesson()?focusIFollowUpCard():'')+'<div class="sensate-values">'+(focus2?'<span>◌ Explorar el tacto</span><span>◌ Descubrir nuevos estímulos</span><span>◌ Conectar sin presión</span>':focus1?'<span>◌ Atención</span><span>◌ Sensaciones</span><span>◌ Sin presión</span>':'<span>◌ Más conciencia corporal</span><span>◌ Menos ansiedad</span><span>◌ Más conexión y disfrute</span>')+'</div></section>'+(focus2||focus1?'':API_NOTE);
}
function range(name,label,lo,hi){return '<label class="range"><span>'+label+' <strong data-val="'+name+'">'+data[name]+'</strong>/10</span><input type="range" min="0" max="10" step="1" data-field="'+name+'" value="'+data[name]+'" aria-label="'+label+'"><small>'+lo+' <span>'+hi+'</span></small></label>'}
function focusIPrepScreen(){
 const solo=['sf-i-1','sf-i-2'].includes(id);
 const label=solo?'Individual':'En pareja';
 const photo=solo?'seated':'partner';
 const copy=isFocusILesson()?'Hoy aprenderás los cinco pasos. No necesitas realizar la actividad íntima frente a la pantalla. Llévala a tu próximo momento cómodo.':solo?'Encuentra un lugar cómodo y escucha las instrucciones de hoy.':'Elijan un momento de conexión. La práctica puede hacerse en su próximo encuentro, cuando ambos quieran.';
 return '<section class="card prep-card focusi-preparation"><p class="eyebrow">FOCALIZACIÓN I · SESIÓN '+(FOCUSI_DAILY_IDS.indexOf(id)+1)+' DE 5</p>'+
 '<h2>Tu práctica '+label.toLowerCase()+'</h2><p>'+copy+'</p>'+
 audioControls()+sessionScene(photo,'focusi-modal-photo')+
 '<button type="button" data-act="branch" data-value="'+(solo?'individual':'partner')+'" class="gold full focusi-start">'+(isFocusILesson()?'▶ Aprender los cinco pasos':'▶ Iniciar mi práctica')+'</button>'+
 '</section>';
}
function prepScreen(){
 if(isNewFocusI())return focusIPrepScreen();
 return '<section class="card prep-card"><p class="eyebrow">'+(isDaily?'DÍA '+originalDay+' · '+safeText(assigned?.title||'Focalización'):'PREPARA TU PRÁCTICA')+'</p>'+
 '<h2>Prepárate</h2><p>'+(isFocusII()?'Un espacio tranquilo. Sin prisas. Tú eliges cómo explorar.':'Busca un lugar tranquilo, evita interrupciones y adopta una postura cómoda.')+'</p>'+audioControls()+scene('seated','prep-visual')+
 '<h3 class="mode-heading">¿Cómo realizarás la práctica?</h3>'+
 '<div class="mode-branch" role="group" aria-label="Elige práctica individual o en pareja">'+
 '<button type="button" data-act="branch" data-value="individual" class="mode-photo" aria-label="Elegir práctica individual"><img src="'+PREFIX+SCENES.seated+'" alt="Hombre sentado relajado"><span>Individual</span></button>'+
 '<button type="button" data-act="branch" data-value="partner" class="mode-photo" aria-label="Elegir práctica en pareja"><img src="'+PREFIX+SCENES.partner+'" alt="Pareja adulta compartiendo un contacto cómodo"><span>En pareja</span></button></div>'+
 '<p class="notice">'+(isFocusII()?'En pareja, ambos deciden participar y cualquiera puede pedir una pausa.':'En pareja: la participación de ambos debe ser voluntaria y cualquiera puede pedir una pausa o terminar en cualquier momento. No necesitas marcar otra casilla.')+'</p>'+
 (isFocusII()?'':'<details class="more"><summary>Mis indicaciones de preparación</summary><div class="two-ranges">'+range('presenceBefore','Presencia antes de empezar','Disperso','Presente')+range('pressureBefore','Presión antes de empezar','Baja','Alta')+'</div></details>')+'</section>';
}
const GUIDE_LABELS={
 'sf-solo':['Acomódate','Respira','Explora','Percibe','Cierra'],
 'sf-focus-2-solo':['Conecta','Explora','Amplía','Varía','Integra'],
 'sf-focus-1':['Acomódense','A toca','Hagan pausa','B toca','Cierren'],
 'sf-focus-2':['Retomen','Exploren','Varíen','Pausen','Cierren'],
 'sf-communication':['Respira','Más lento','Así está bien','Otro contacto','Pausa'],
 'sf-recovery':['Reconoce','Reduce presión','Respira','Elige','Cierra']
};
function labelForPhase(i){return isNewFocusI()?PHASES[id][i][0]:(GUIDE_LABELS[id]||GUIDE_LABELS['sf-solo'])[i]}
function wave(active=false){
 return '<div class="wave-stage '+(active?'moving':'')+'" aria-hidden="true"><svg viewBox="0 0 500 95" width="100%" height="74" preserveAspectRatio="none">'+
 [0,1,2,3,4].map((n)=>'<path class="wave-line wave-'+n+'" fill="none" stroke="currentColor" stroke-width="'+(n===2?'1.9':'1.05')+'" opacity="'+(.27+n*.12)+'" d="M0 '+(46+n*2)+' C45 '+(38+n*2)+' 65 '+(60-n*3)+' 104 '+(48+n*2)+' S170 '+(10+n*4)+' 211 '+(46+n)+' S294 '+(88-n*5)+' 335 '+(45+n*2)+' S402 '+(28+n*3)+' 440 '+(46+n)+' S480 '+(47+n)+' 500 '+(47+n)+'"></path>').join('')+'</svg></div>';
}
function focusIIExplainScreen(){
 const mode=isPartner()?'En pareja':'Individual',focus1=isNewFocusI();
 const phaseTitle=focus1?'FOCALIZACIÓN I · SESIÓN '+(FOCUSI_DAILY_IDS.indexOf(id)+1)+'/5':'FOCALIZACIÓN II · '+mode.toUpperCase();
 return '<section class="card focusii-explain sensate-photo-guide" aria-label="Guía interactiva de cinco pasos, '+mode+'">'+
 '<p class="eyebrow">'+phaseTitle+' · 3 / 5</p>'+
 '<h2>'+(isFocusILesson()?'Aprende la técnica':'Tu práctica guiada')+'</h2>'+
 '<p class="sensate-guide-lead">'+(isFocusILesson()?'Toca cada paso para aprender cómo realizarlo en tu próximo momento íntimo. Puedes escucharlos todos o leerlos a tu ritmo.':'Toca cada paso para escuchar cómo realizarlo. Sin presiones ni tiempos obligatorios.')+'</p>'+
 '<button type="button" data-act="explainall" data-audio class="focusii-listen sensate-play-all" aria-pressed="'+explainingAll+'"><span class="focusii-speaker" aria-hidden="true">🔊</span>'+(explainingAll?'Detener narración':'Escuchar los 5 pasos')+'</button>'+
 '<div class="focusii-step-list" role="group" aria-label="Escuchar cada instrucción">'+PHASES[id].map((p,i)=>'<button type="button" data-act="explainstep" data-audio data-value="'+i+'" class="focusii-step sensate-photo-step '+(explainPhase===i?'chosen':'')+'" aria-label="Escuchar el paso '+(i+1)+': '+safeText(labelForPhase(i))+'">'+
 stagePhoto(i)+'<span class="number" aria-hidden="true">'+(i+1)+'</span><span class="sensate-photo-label">'+safeText(labelForPhase(i))+'</span><span aria-hidden="true" class="focusii-small-speaker">▶</span></button>').join('')+'</div>'+
 '<details class="more"><summary>Leer la instrucción seleccionada</summary><p>'+safeText(explanatoryText())+'</p></details>'+
 '<p class="compact-footnote">'+(isFocusILesson()?'Continúa para llevar la técnica a tu vida. Aquí no habrá cronómetro ni evaluación del rendimiento.':'Continúa para realizar la práctica guiada, con pausas y audio.')+'</p></section>';
}

function focusIIPracticeScreen(){
 const current=PHASES[id][phase];
 const phaseTitle=isNewFocusI()?'FOCALIZACIÓN I · '+(FOCUSI_DAILY_IDS.indexOf(id)+1)+'/5':'SENSATE FOCUS II';
 const status=guideDone?'Puedes registrar tu experiencia.':running?'Explora sin presión y avanza cuando lo desees.':guideStarted?'Pausada. Puedes reanudar.':'Escucha la guía y comienza cuando estés listo.';
 return '<section class="card focusii-practice" aria-label="Práctica guiada '+modeTitle()+'">'+
 '<p class="eyebrow">'+phaseTitle+' · '+modeTitle().toUpperCase()+' · 4 / 5</p>'+
 '<div class="focusii-phase-nav" aria-label="Fases de la práctica">'+PHASES[id].map((stepData,i)=>'<button type="button" data-act="phase" data-value="'+i+'" '+(!guideStarted?'disabled':'')+' class="'+(phase===i?'current':i<phase?'complete':'')+'" aria-label="Ir al paso '+(i+1)+': '+safeText(labelForPhase(i))+'">'+(i+1)+'</button>').join('')+'</div>'+
 '<p class="focusii-phase-count">Paso '+(phase+1)+' de 5</p><h2 class="focusii-active-title">'+safeText(labelForPhase(phase))+'</h2>'+
 (!guideStarted?'<button type="button" data-act="guideintro" data-audio class="focusii-listen focusii-instruction"><span class="focusii-speaker" aria-hidden="true">🔊</span>Escuchar cómo funciona</button>':'<button type="button" data-act="repeataudio" data-audio class="focusii-listen"><span class="focusii-speaker" aria-hidden="true">🔊</span>Escuchar la instrucción</button>')+
 '<p class="sensate-first-cue">'+safeText(current[1])+'</p>'+
 '<div class="focusii-active-photo sensate-practice-photo" role="img" aria-label="Imagen alusiva a la acción '+safeText(labelForPhase(phase))+'">'+stagePhoto(phase)+'</div>'+
 '<div class="focusii-timing"><span>Tiempo transcurrido <small>(opcional)</small></span><strong data-guide-elapsed>'+clockText(t)+'</strong><small>En este paso: <span data-guide-phase-elapsed>'+clockText(phaseElapsed)+'</span></small></div>'+
 '<p class="focusii-status" role="status">'+safeText(status)+'</p>'+
 (!guideStarted||guideDone?'<button type="button" data-act="startguide" class="gold full primary-guide">'+(guideDone?'↻ Volver a practicar':'▶ Iniciar práctica guiada')+'</button>':
 running?'<button type="button" data-act="pauseguide" class="gold full primary-guide">⏸ Pausar práctica</button>':
 '<button type="button" data-act="resumeguide" class="gold full primary-guide">▶ Reanudar práctica</button>')+
 '<div class="focusii-guide-actions"><button type="button" data-act="nextphase" class="secondary" '+(!guideStarted||guideDone?'disabled':'')+'>Siguiente paso →</button>'+
 '<button type="button" data-act="performed" class="secondary" '+(!guideStarted?'disabled':'')+'>✓ Terminar y evaluar</button></div>'+
 '<details class="more"><summary>Leer cómo se realiza</summary><p>'+safeText(current[1])+'</p></details>'+
 '<p class="compact-footnote">Puedes pausar, cambiar el ritmo o terminar cuando quieras.</p></section>';
}

function focusIICloseScreen(){
 const phaseTitle=isNewFocusI()?'FOCALIZACIÓN I · '+(FOCUSI_DAILY_IDS.indexOf(id)+1)+'/5':'SENSATE FOCUS II';
 const choices=[['0','Ausente'],['1','Bajo'],['2','Aceptable'],['3','Satisfactorio'],['4','Muy bien']];
 const noticed=['Más calma','Más conexión','Menos presión'];
 return '<section class="card focusii-close"><p class="eyebrow">'+phaseTitle+' · 5 / 5</p>'+
 '<h2>Cierre de tu práctica</h2><p>Puedes guardar la sesión directamente. Si deseas, registra también cómo te sentiste.</p>'+
 '<div class="focusii-register"><h3>¿Cómo estuvo tu bienestar? <small>(opcional)</small></h3><div class="focusii-rating" role="group" aria-label="Califica tu bienestar de cero a cuatro">'+choices.map(([v,label])=>'<button type="button" data-act="focus2rating" data-value="'+v+'" aria-pressed="'+(data.focus2Rating===Number(v))+'" class="'+(data.focus2Rating===Number(v)?'chosen':'')+'"><b>'+v+'</b><small>'+label+'</small></button>').join('')+'</div>'+
 '<h3>Hoy noté <small>(opcional)</small></h3><div class="focusii-noted">'+noticed.map(v=>'<button type="button" data-act="focus2noticed" data-value="'+v+'" aria-pressed="'+data.focus2Noted.includes(v)+'" class="'+(data.focus2Noted.includes(v)?'chosen':'')+'">'+v+'</button>').join('')+'</div></div>'+
 '<div class="focusii-clinical"><p class="focusii-register-note">Puedes dejar esta sección sin responder.</p>'+
 chipField('comfort','Me sentí',[['comodo','Cómodo'],['neutro','Neutro'],['tenso','Tenso']])+
 chipField('discomfort','¿Molestia o dolor?',[['ninguna','No'],['molestia','Molestia'],['dolor','Dolor']])+'</div>'+
 (data.discomfort==='dolor'?'<p class="compact-footnote">Si el contacto te produce dolor, detén esa acción y busca orientación si persiste.</p>':'')+
 '<details class="more"><summary>Registro complementario (opcional)</summary>'+
 chipField('ease','La práctica fue',[['facil','Fácil'],['intermedia','Intermedia'],['dificil','Difícil']])+
 chipField('attention','Mi atención',[['conexion','Conecté'],['distraccion','Me distraje'],['ansiedad','Sentí ansiedad']])+
 chipField('repeat','Quiero repetir',[['si','Sí'],['aun_no','Aún no']])+
 '<div class="two-ranges">'+range('presenceAfter','Presencia','Disperso','Presente')+range('pressureAfter','Presión','Baja','Alta')+range('enjoyment','Disfrute','Bajo','Alto')+(isPartner()?range('partnerComfort','Comodidad de tu pareja','Baja','Alta'):'')+'</div><textarea data-field="notes" maxlength="700" placeholder="Algo que quieras recordar…">'+safeText(data.notes)+'</textarea></details>'+
 '<p class="focusii-close-foot">Exploraste sensaciones. Eso ya forma parte de tu aprendizaje.</p></section>';
}

function explainScreen(){
 if(isModernFocus())return focusIIExplainScreen();
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
 if(isModernFocus())return focusIIPracticeScreen();
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
function focusIHomeworkScreen(){
 const item=FOCUSI_HOMEWORK[id];
 return '<section class="card focusi-takeaway" aria-label="Tarea para la vida íntima">'+
 '<p class="eyebrow">FOCALIZACIÓN I · SESIÓN '+(FOCUSI_DAILY_IDS.indexOf(id)+1)+' DE 5 · 4 / 4</p>'+
 '<h2>Llévalo a tu vida</h2>'+
 '<div class="focusi-homework-hero" role="img" aria-label="Momento de calma y conexión">'+sessionScene(isPartner()?'partner':'release','homework-photo')+'</div>'+
 '<h3>'+safeText(item.title)+'</h3><p>'+safeText(item.lead)+'</p>'+
 '<div class="focusi-homework-anchor"><strong>Tu ancla sensorial</strong><p>'+safeText(item.focus)+'</p></div>'+
 '<p class="focusi-homework-note">No tienes que practicar ahora ni describir detalles íntimos. Puedes llevar esta propuesta a otro momento, con consentimiento y a tu ritmo. En otra sesión podrás comentar, si quieres, si la pusiste en práctica.</p>'+
 '<p class="focusi-homework-save">Guarda lo aprendido. La experiencia íntima queda para cuando tú decidas.</p></section>';
}
function closeScreen(){if(isFocusILesson())return focusIHomeworkScreen();if(isModernFocus())return focusIICloseScreen();return '<section class="card"><h2>¿Cómo te fue?</h2><p>Registra tu experiencia sin exigirte resultados perfectos.</p>'+
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
 if(isFocusILesson()){
  const back='<button type="button" data-act="back" class="secondary" '+(screen===0?'disabled':'')+'>Anterior</button>';
  if(screen===0)return '<div class="foot">'+back+'<span>1 / 4</span><button type="button" data-act="next" class="gold">Comenzar</button></div>';
  if(screen===1)return '<div class="foot">'+back+'<span>2 / 4</span><button type="button" data-act="next" class="gold">Continuar →</button></div>';
  if(screen===2)return '<div class="foot">'+back+'<span>3 / 4</span><button type="button" data-act="next" class="gold">Llévalo a tu vida →</button></div>';
  return '<div class="foot">'+back+'<span>4 / 4</span><button type="button" data-act="'+(saved?'close':'save')+'" class="gold" '+(busy?'disabled':'')+'>'+(saved?'Finalizar':busy?'Guardando…':'Guardar aprendizaje')+'</button></div>';
 }
 const back='<button type="button" data-act="back" class="secondary" '+(screen===0?'disabled':'')+'>Anterior</button>';
 if(screen===0)return '<div class="foot">'+back+'<span>1 / 5</span><button type="button" data-act="next" class="gold">Comenzar</button></div>';
 if(screen===1)return isNewFocusI()?'<div class="foot">'+back+'<span>2 / 5</span><button type="button" data-act="next" class="gold">Continuar →</button></div>':'<div class="foot">'+back+'<span>2 / 5</span><button type="button" class="gold" disabled>Elige tu práctica</button></div>';
 if(screen===2)return '<div class="foot">'+back+'<span>3 / 5</span><button type="button" data-act="next" class="gold">Continuar</button></div>';
 if(screen===3)return '<div class="foot">'+back+'<span>4 / 5</span><button type="button" data-act="next" class="gold" '+(!performed?'disabled':'')+'>Evaluar</button></div>';
 return '<div class="foot">'+back+'<span>5 / 5</span><button type="button" data-act="'+(saved?'close':'save')+'" class="gold" '+(busy?'disabled':'')+'>'+(saved?'Finalizar':busy?'Guardando…':'Guardar experiencia')+'</button></div>';
}
function render(){
 if(id==='sf-i-2'&&[0,1,2,4].includes(screen)){
  root.innerHTML=spmApprovedSession2Screen();
  return;
 }
 if(id==='sf-i-1'&&[0,2,3].includes(screen)){
  root.innerHTML=spmApprovedScreen();
  return;
 }
 if(id==='sf-i-1'&&[1,4].includes(screen)){
  root.innerHTML=spmArtworkScreen();
  return;
 }
 const c=api.getContext();
 const title=isDaily?safeText(assigned?.title||LABELS[id]):safeText(LABELS[id]);
 root.innerHTML='<div class="layout sf-matte'+(isNewFocusI()?' sensate-day-'+(FOCUSI_DAILY_IDS.indexOf(id)+1):'')+(isFocusII()?' focusii-theme':'')+'"><header><div class="brand"><b>SPM</b><small>FOCALIZACIÓN SENSORIAL</small></div>'+
 '<div class="header-actions">'+(isDaily?'':'<button type="button" data-act="library" class="subtle" title="Biblioteca">Biblioteca</button>')+'<button type="button" data-act="close" class="close sensate-return" aria-label="Volver a mi programa">← Volver a mi programa</button></div></header>'+progress()+
 '<main><p class="meta">'+(isDaily?'DÍA '+originalDay+' / 28 · ':'BIBLIOTECA · ')+title+'</p>'+

 (screen===0?introScreen():screen===1?prepScreen():screen===2?explainScreen():screen===3?practiceScreen():closeScreen())+(screen===4?audioControls():'')+
 (error?'<p class="warning" role="alert">'+safeText(error)+'</p>':'')+
 (notification?'<p class="notify" role="status">'+safeText(notification)+'</p>':'')+
 '</main>'+footer()+'</div>';
}
function readValue(el){const key=el.dataset.field;if(!key)return;if(key==='consent'){consent=el.checked;return}if(['pressureBefore','presenceBefore','presenceAfter','pressureAfter','enjoyment','partnerComfort'].includes(key)){data[key]=Number(el.value);touched.add(key);const label=root.querySelector('[data-val="'+key+'"]');if(label)label.textContent=data[key];return}if(key==='notes'){data.notes=el.value;return}data[key]=el.value;}
function recommendation(){if(data.discomfort==='dolor')return 'reduce-pressure';if(data.pressureAfter>=7||data.monitoringIntrusions>=4)return 'reduce-pressure';if(isPartner()&&['presenceAfter','pressureAfter','enjoyment','partnerComfort'].every(k=>touched.has(k))&&data.presenceAfter>=7&&data.pressureAfter<=3&&data.enjoyment>=6&&data.partnerComfort>=6)return 'progress';return 'repeat'}
async function save(){error='';notification='';if(saved){notification='Esta práctica ya está guardada.';render();return}if(busy)return;
if(!canPractice()){error='Esta sesión pertenece a otro día del programa. Regresa a tu actividad asignada.';render();return}
if(!performed&&!isFocusILesson()){error='Primero confirma que realizaste la práctica guiada.';render();return}
if(!isModernFocus()&&isPartner()&&!consent){error='Para una práctica en pareja, ambos deben haber aceptado participar.';render();return}
const missing=(isModernFocus()?[]:['comfort','ease','attention','repeat','discomfort']).find(x=>!data[x]);
if(missing){error='Selecciona cómo te sentiste, dificultad, atención, ganas de repetir y molestias.';render();return}
if(isDaily){try{if(await api.isDailyCompleted?.()){saved=true;notification='Esta práctica ya está completada en tu programa. No se duplicó.';render();return;}}catch{error='No pude comprobar si la actividad estaba guardada. Reintenta sin modificar datos.';render();return;}}
busy=true;render();
try{
 const rows=readRecords(),day=Number(api.getContext().day),entry={
  id:entryId||(entryId=(window.crypto?.randomUUID?.()||'sensate-'+Date.now()+'-'+Math.floor(Math.random()*100000))),
  day,origin:isDaily?'dailyPlan':'library',practiceId:id,completed:true,savedAt:new Date().toISOString(),
  ...(isFocusILesson()?{lessonCompleted:true,intimatePracticeCompleted:null,lessonFormat:'learn-now-practice-later',followUp:FOCUSI_FOLLOWUP[id]&&followUpResponse?{previousPracticeId:FOCUSI_FOLLOWUP[id].previous,response:followUpResponse}:null}:{}),
  presenceBefore:isModernFocus()?null:data.presenceBefore,presenceAfter:isModernFocus()&&!touched.has('presenceAfter')?null:data.presenceAfter,
  pressureBefore:isModernFocus()?null:data.pressureBefore,pressureAfter:isModernFocus()&&!touched.has('pressureAfter')?null:data.pressureAfter,
  enjoyment:isModernFocus()&&!touched.has('enjoyment')?null:data.enjoyment,monitoringIntrusions:data.monitoringIntrusions,
  partnerComfort:isPartner()?isModernFocus()&&!touched.has('partnerComfort')?null:data.partnerComfort:null,
  usefulStimuli:data.usefulStimuli.slice(),recommendation:isModernFocus()?null:recommendation(),
  difficulty:data.ease,discomfort:data.discomfort||null,comfort:data.comfort,attention:data.attention,wantsRepeat:data.repeat,notes:data.notes.trim(),...(isModernFocus()?{...(isFocusII()?{focus2Rating:data.focus2Rating}:{}),wellbeingRating:data.focus2Rating,focus2Noted:data.focus2Noted.slice(),modality:selectedMode}: {})
 };
 const index=rows.findIndex(x=>x.id===entry.id);if(index>=0)rows[index]=entry;else rows.push(entry);
 if(!api.write(KEY,JSON.stringify(rows)))throw Error('session');
 await api.flush();
 if(isDaily){const ok=await api.recordDaily();if(ok===false)throw Error('daily')}
 saved=true;notification=isFocusILesson()?'Aprendizaje guardado ✓. Lleva la técnica a tu vida cuando quieras.':'Experiencia guardada en tu programa SPM ✓';
}catch(e){error='No se pudo guardar o completar la actividad. Tus respuestas permanecen aquí para reintentar.'}
finally{busy=false;render()}
}

root.addEventListener('click',e=>{
 const button=e.target.closest('[data-act]');if(!button||button.disabled)return;
 const act=button.dataset.act;
 if(id==='sf-i-2'&&act==='s2value'){
  const key=button.dataset.value;if(!Object.prototype.hasOwnProperty.call(SPM_S2_VALUES,key))return;
  if(spmS2Value===key&&voiceActive){stopAudio();return}
  stopAudio();spmS2Value=key;render();speech(SPM_S2_VALUES[key],null,'[data-act="s2value"][data-value="'+key+'"]');return;
 }
 if(id==='sf-i-2'&&act==='s2task'){
  const key=button.dataset.value;if(!Object.prototype.hasOwnProperty.call(SPM_S2_TASKS,key))return;
  if(spmS2Task===key&&voiceActive){stopAudio();return}
  stopAudio();spmS2Task=key;render();speech(SPM_S2_TASKS[key],null,'[data-act="s2task"][data-value="'+key+'"]');return;
 }
 if(act==='approvedread'){const dlg=root.querySelector('.spm-approved-info');if(typeof dlg?.showModal==='function')dlg.showModal();else dlg?.setAttribute('open','');return}
 if(act==='approvedinfo-close'){const dlg=root.querySelector('.spm-approved-info');if(typeof dlg?.close==='function')dlg.close();else dlg?.removeAttribute('open');return}
 if(act==='skipguide'){go(4);if(!performed){notification='Puedes revisar el cierre y volver después a practicar. Esta actividad no se marcará como realizada.';render()}return;}
 if(act==='approvedadvance'){
  if(!guideStarted||guideDone){startGuide();return}
  if(phase<4){advanceGuide();return}
  performed=true;stopClock();stopAudio();go(4);return;
 }
 if(act==='approvedchoice'){
  const f=button.dataset.field,v=button.dataset.value;
  if(!['comfort','discomfort'].includes(f))return;
  if(f==='comfort'&&!['comodo','neutro','tenso'].includes(v))return;
  if(f==='discomfort'&&!['ninguna','molestia','dolor'].includes(v))return;
  data[f]=v;root.querySelectorAll('[data-act=approvedchoice][data-field='+f+']').forEach(b=>{const active=b.dataset.value===v;b.classList.toggle('chosen',active);b.setAttribute('aria-pressed',String(active))});
  if(f==='discomfort'&&v==='dolor'){notification='Si aparece dolor, detén el contacto y busca orientación si persiste.';render()}return;
 }
 if(act==='audio'){if(voiceActive)stopAudio();else speech(audioText());return}
 if(act==='close'||act==='skip'){stopAudio();stopClock();void api.close();return}
 if(act==='library'){stopAudio();stopClock();if(isDaily){void api.openLibrary();return}go(0);return}
 if(act==='back'){if(screen>0)go(isFocusILesson()&&screen===4?2:screen-1);return}
 if(act==='branch'){selectBranch(button.dataset.value);return}
 if(act==='mode'){resetType(button.dataset.value);return}
 if(act==='followup'){
  if(!isFocusILesson()||!FOCUSI_FOLLOWUP[id])return;
  const response=button.dataset.value;if(!['yes','not_yet','prefer_not'].includes(response))return;
  followUpResponse=response;root.querySelectorAll('[data-act=followup]').forEach(el=>{const chosen=el.dataset.value===response;el.classList.toggle('chosen',chosen);el.setAttribute('aria-pressed',String(chosen))});return;
 }
 if(act==='next'){
  if(screen===0){go(1);return}
  if(screen===1){if(isNewFocusI()){selectBranch(['sf-i-1','sf-i-2'].includes(id)?'individual':'partner');return}error='Elige Individual o En pareja para empezar.';render();return}
  if(screen===2){go(isFocusILesson()?4:3);return}
  if(screen===3){go(4);if(!performed){notification='Puedes revisar el cierre y volver después a practicar.';render()}return}
  return;
 }
 if(act==='explainstep'){if(id==='sf-i-2')spmS2Step=Number(button.dataset.value);explainStep(Number(button.dataset.value));return}
 if(act==='explainall'){if(explainingAll){stopAudio();render()}else explainAll();return}
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