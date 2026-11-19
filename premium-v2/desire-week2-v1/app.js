/* SPM Digital Wellness · Deseo · Semana 2 · Días 8–14.
 * Ruta clínica original: labs/desire/src/lib/desire-curriculum.ts.
 * Las siete láminas aprobadas son el fondo intacto; solo se añaden capas táctiles.
 * Fuera de SPM Central, esta página es una prueba local sin datos clínicos reales.
 */
(()=>{'use strict';
const DAYS=[8,9,10,11,12,13,14],STORE='spm-desire-week2-preview-v1';
const url=new URLSearchParams(location.search),CENTRAL=url.get('spm')==='central',DAY=Number(url.get('day')),SID=url.get('sid')||'';
const VALID=CENTRAL&&DAYS.includes(DAY)&&SID.length>=8&&SID.length<128&&window.parent!==window;
const ART=window.SPM_WEEK2_ASSETS||{8:'assets/d8.webp',9:'assets/d9.webp',10:'assets/d10.webp',11:'assets/d11.webp',12:'assets/d12.webp',13:'assets/d13.webp',14:'assets/d14.webp'};
const NAMES={8:'Reactivación I',9:'Autoexploración por tu canal',10:'Reactivación II · Repertorio',11:'Si hoy no aparece el deseo',12:'Planifica tu ventana',13:'Confianza para volver a sentir',14:'Revisión de la semana 2'};
const PRACTICES={8:'responsive-window',9:'@channel',10:'repertoire-try',11:'no-desire-today',12:'activation-plan',13:'evidence-confidence',14:'week-review'};
const CHANNELS=[['visual','Miradas o estímulos visuales'],['tactile','Contacto o texturas'],['auditory','Palabras o voces'],['fantasy','Imaginación o recuerdos'],['foreplay','Ritmo y juego previo'],['context','Ambiente o entorno']];
const IDEAS=[['ver','Ver: observar un detalle atractivo'],['tocar','Tocar: explorar una textura cómoda'],['escuchar','Escuchar: una voz o música'],['hablar','Hablar: expresar algo agradable'],['previo','Ritmo: dar más tiempo sin prisa'],['novedad','Novedad: cambiar un detalle sencillo']];
const PLEASANT=[['rest','Descansar'],['music','Escuchar música'],['talk','Conversar con calma'],['alone','Tiempo tranquilo a solas'],['contact','Contacto suave, si apetece']];
const COVERS={
8:{options:[['calm','Calma',43,820,408,180],['near','Cercanía',472,820,414,180],['privacy','Privacidad',43,1015,408,215],['time','Tiempo para mí',472,1015,414,215]],audio:[190,340,563,83],note:[210,1314,645,69],cta:[72,1432,800,111]},
9:{options:[['privacy','Privacidad',43,756,408,183],['time','Tiempo sin prisa',474,756,414,183],['rest','Descanso',43,960,408,236],['quiet','Menos distracciones',474,960,414,236]],audio:[190,290,563,87],note:[214,1291,640,73],cta:[72,1416,800,105]},
10:{options:[['less','Más tranquilo',57,1160,278,100],['equal','Igual',347,1160,244,100],['more','Con más tensión',600,1160,290,100]],audio:[190,292,563,83],note:[213,1323,640,70],cta:[72,1434,800,111]},
11:{options:[['contact','Caricias suaves',43,732,842,100],['talk','Conversación tranquila',43,841,842,96],['ambience','Ambiente agradable',43,948,842,95],['imagine','Fantasía o imaginación',43,1051,842,99],['near','Mirada y cercanía',43,1164,842,98]],audio:[190,310,563,86],note:[213,1308,641,78],cta:[72,1434,800,111]},
12:{options:[['calm','Calma',41,725,280,204],['safe','Seguridad',631,725,280,204],['curiosity','Curiosidad',41,984,281,211],['near','Conexión',631,984,280,211]],audio:[188,291,563,84],note:[210,1279,644,77],cta:[72,1429,800,111]},
13:{options:[['privacy','Buscar privacidad',44,770,843,132],['quiet','Reducir distracciones',44,908,843,137],['time','Darme tiempo sin prisa',44,1054,843,140]],audio:[187,300,563,88],note:[214,1286,639,91],cta:[75,1432,796,113]},
14:{options:[],audio:[190,293,563,85],note:[211,1293,641,71],cta:[72,1432,800,109]}}
;
const SPEECH={
8:['Hoy explorarás cómo puede aparecer el interés durante una experiencia agradable elegida por ti. A veces llega después de empezar, poco a poco. Elige una condición que te ayude y luego un estímulo que quieras explorar. No necesitas provocar una respuesta.','Prepara un momento privado y elige una sola experiencia agradable. Observa si aparece comodidad, curiosidad o interés. Puedes terminar en cualquier momento, sin comprobar rendimiento.','Al terminar, observa qué te resultó cómodo y qué cambiarías. Si no apareció interés también es una observación válida.'],
9:['Hoy vas a reconocer tu canal personal de exploración. Ver, tocar, escuchar, imaginar y cuidar el entorno son opciones diferentes; no existe un canal correcto para todos. Tus preferencias previas pueden orientar la elección.','Elige la práctica relacionada con el canal que hoy más te apetezca. Sigue la indicación correspondiente a tu ritmo y registra cómo te sentiste.','Compara el interés antes y después, si deseas hacerlo. Anota un detalle concreto, como un ritmo, palabra, imagen o textura.'],
10:['Hoy vas a probar una sola idea diferente de tu repertorio. No se trata de examinar el rendimiento ni de forzar una respuesta. La imagen de tensión es una ilustración, no una medida automática.','Selecciona una idea: ver, tocar, escuchar, hablar, cambiar el ritmo o introducir una novedad pequeña. Pruébala a tu ritmo; recuerda que puedes detenerte.','¿Qué utilidad tuvo para ti esa idea? Registra un valor de cero a diez o indica no evaluable. Escribe lo que repetirías o cambiarías.'],
11:['Si hoy no aparece deseo sexual, puedes elegir algo agradable que sí te apetezca. No tienes que buscar excitación ni obligarte a continuar una experiencia.','Observa si hay presión. Escoge descanso, música, conversación o un momento privado. Si prefieres no hacer nada, también puedes registrar esa elección.','Al terminar, observa tu presión antes y después, si te resulta útil. Recuerda una opción de bienestar que quieras conservar.'],
12:['Hoy planificarás una ventana flexible: un momento con energía, privacidad y una experiencia agradable elegida por ti. El mapa corporal de esta lámina es solo un recordatorio de escuchar tu comodidad, no una sesión repetida de conciencia corporal.','Decide cuándo, dónde y con qué condiciones estarías a gusto. Puedes elegir un estímulo y reducir interrupciones. Si compartes el momento con alguien, hace falta acuerdo mutuo.','Registra cómo esperabas sentirte y cómo fue la experiencia si llegaste a realizarla. Puedes adaptar, posponer o dejar el plan para otro día.'],
13:['Hoy recordarás tres momentos reales de curiosidad, interés o conexión, incluso si fueron pequeños. Reconocer esas evidencias ayuda a elegir qué detalles repetir.','Recuerda qué estaba ocurriendo y qué te ayudó en cada uno de tres momentos. Puede ser una conversación, una mirada, un contacto agradable o una situación.','Elige una sola señal que te gustaría recuperar. Valora tu confianza de cero a diez, si deseas hacerlo. No es una prueba de desempeño.'],
14:['La revisión del día catorce consiste en observar lo vivido y decidir qué mantener y qué ajustar. La evaluación comparativa oficial pertenece a tu programa principal y no se reemplaza por esta lámina.','Recuerda lo que te ayudó y aquello que prefieres adaptar. Tus respuestas sirven para decidir en qué quieres concentrarte la próxima semana.','Guarda tu reflexión y luego realiza el seguimiento del día catorce cuando corresponda. La imagen de semana completada se mostrará como cierre solo cuando la evaluación oficial esté registrada.']};
const CHANNEL_SCRIPT={visual:'Puedes observar una imagen, mirada o gesto que te resulte atractivo o curioso, sin buscar un resultado.',tactile:'Percibe una textura, temperatura o contacto en manos o brazos que te resulte agradable. Detente si hay molestia.',auditory:'Escucha una voz, música o palabra agradable; presta atención al tono y al ritmo.',fantasy:'Recuerda o imagina una escena elegida por ti, sin exigirte sentir algo.',foreplay:'Si tienes interés y comodidad, observa cómo te resulta un ritmo más lento o una pausa; con otra persona siempre debe haber acuerdo.',context:'Prepara luz, privacidad, silencio o un ambiente que te resulte acogedor. Observa tu experiencia sin meta.'};
// La guía general vive solo en su botón; cada opción aporta un mensaje propio.
const COVER_CHOICE_SPEECH={
 8:{
  calm:'Baja el ritmo y date unos minutos sin nada que resolver.',
  near:'La cercanía puede ser una conversación o una compañía que te resulte cómoda.',
  privacy:'Elige un espacio donde te sientas a gusto y puedas evitar interrupciones.',
  time:'Reserva unos minutos para ti y decide cómo quieres usarlos.'
 },
 9:{
  privacy:'Busca un lugar donde no tengas que estar pendiente de quién llega.',
  time:'Deja margen para detenerte, cambiar de idea o continuar cuando te apetezca.',
  rest:'Puedes descansar primero y retomar la exploración cuando tengas ganas.',
  quiet:'Silencia las notificaciones y aparta lo que hoy te distraiga.'
 },
 10:{
  less:'Puedes mantener el ritmo que te está resultando cómodo.',
  equal:'Sentirte igual también es válido; observa sin intentar cambiarlo.',
  more:'Puedes hacer una pausa o elegir una propuesta más sencilla.'
 },
 11:{
  contact:'Explora un contacto suave en la mano o el brazo, solo si te resulta agradable.',
  talk:'Comparte una palabra, un recuerdo o algo que te gustaría expresar.',
  ambience:'Ajusta la luz, la temperatura o el sonido a tu gusto.',
  imagine:'Trae a tu imaginación una escena que tú elijas, sin buscar un resultado.',
  near:'Una mirada o estar cerca pueden ser suficientes, si ambos se sienten cómodos.'
 },
 12:{
  calm:'Piensa en un momento en el que puedas bajar el ritmo.',
  safe:'Elige un entorno donde puedas expresar lo que quieres y poner tus límites.',
  curiosity:'Deja espacio para descubrir qué te llama la atención.',
  near:'Puede ser un momento contigo mismo o compartido de común acuerdo.'
 },
 13:{
  privacy:'Busca un espacio propio para recordar lo vivido con tranquilidad.',
  quiet:'Aparta por un momento las pantallas y otras interrupciones.',
  time:'Deja que aparezcan los recuerdos a su ritmo; no necesitas encontrarlos enseguida.'
 }
};
const blank=()=>({choice:[],note:'',stimulus:'',channel:'',idea:'',pleasant:'',moment:'',place:'',conditions:'',memory1:'',memory2:'',memory3:'',next:'',good:'',adjust:'',repeat:'',metricBefore:null,metricAfter:null,utility:null,confidence:null,expected:null,actual:null,timer:{elapsed:0,running:false,anchor:0,started:false},completed:false,checkpoint:false,page:1});
const fresh=()=>Object.fromEntries(DAYS.map(d=>[d,blank()]));
let data=fresh(),chosenDay=DAYS.includes(Number(url.get('dia')))?Number(url.get('dia')):0,ready=!CENTRAL,closing=false,pending=false,timeoutId=0,voices=null;
try{if(!CENTRAL){const prior=JSON.parse(localStorage.getItem(STORE)||'null');if(prior&&typeof prior==='object')for(const d of DAYS){const b=prior[d];if(b&&typeof b==='object')data[d]={...blank(),...b,timer:{...blank().timer,...b.timer,running:false,anchor:0}}}}}catch{}
if(CENTRAL){if(VALID)chosenDay=DAY;else chosenDay=-1;}
const app=document.querySelector('#app'),toast=document.querySelector('#toast');
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const pos=(x,y,w,h)=>`left:${(x/941*100).toFixed(3)}%;top:${(y/1672*100).toFixed(3)}%;width:${(w/941*100).toFixed(3)}%;height:${(h/1672*100).toFixed(3)}%;`;
const sayNotification=message=>{toast.textContent=message;toast.classList.add('show');clearTimeout(timeoutId);timeoutId=setTimeout(()=>toast.classList.remove('show'),3900)};
function transmit(type,more={}){if(VALID)window.parent.postMessage({type,sid:SID,day:DAY,...more},location.origin)}
function save(){if(CENTRAL){if(ready&&!closing&&DAYS.includes(chosenDay))transmit('SPM_WEEK2_CHANGE',{record:data[chosenDay]});return;}try{localStorage.setItem(STORE,JSON.stringify(data))}catch{}}
function stopVoice(){try{window.speechSynthesis?.cancel()}catch{}voices=null}
function speak(text){if(!text)return;try{if(!('speechSynthesis'in window)){sayNotification('La voz del dispositivo no está disponible. Puedes seguir las indicaciones escritas.');return}window.speechSynthesis.cancel();const m=new SpeechSynthesisUtterance(text);m.lang='es-CO';m.rate=.92;m.pitch=1;const all=window.speechSynthesis.getVoices();m.voice=all.find(x=>x.lang==='es-CO')||all.find(x=>x.lang.startsWith('es'))||null;voices=m;m.onerror=()=>{};window.speechSynthesis.speak(m)}catch{sayNotification('No fue posible iniciar la voz del dispositivo. Usa la guía escrita.')}}
function topbar(day){return `<header class="topbar"><button class="iconback" data-act="home" aria-label="Volver a tus actividades">‹</button><div class="brand">SPM<small>DIGITAL WELLNESS</small></div><div class="pill">Día ${day} · Deseo</div></header>`}
function nav(day,page){return `<nav class="nav" aria-label="Navegación de las pantallas"><button type="button" data-act="back">‹ ${page===1?'Salir':'Anterior'}</button><span class="count">${page} / 3</span><button class="next" data-act="next">${page===3?'Guardar':'Siguiente'} ›</button></nav>`}
function home(){return `<section class="intro"><div class="eyebrow">SPM DIGITAL WELLNESS · DESEO</div><h1>Semana 2</h1><p>Entrenar · días 8 al 14. Siete prácticas distintas, a tu ritmo.</p></section><section class="daygrid">${DAYS.map(day=>`<button class="daycard" data-act="go" data-day="${day}"><img src="${ART[day]}" alt="" loading="lazy"><span><b>Día ${day}<br>${esc(NAMES[day])}</b><small>${data[day].completed?'✓ Registro local de revisión guardado':'Abrir pantallas táctiles y escuchar guía'}</small></span><span class="arrow">›</span></button>`).join('')}</section><p class="footnote">Versión de revisión independiente. Los registros de esta vista se guardan solo en tu navegador, no en una cuenta de paciente.</p>`}
function hit(act,label,coords,value='',classes=''){return `<button type="button" class="hit ${classes}" style="${pos(...coords)}" data-act="${esc(act)}" data-value="${esc(value)}" aria-label="${esc(label)}" aria-pressed="${classes.includes('select')?String(data[chosenDay].choice.includes(value)):'false'}"></button>`}
function cover(day){
 const state=data[day],screen=COVERS[day],title=(day===14&&!state.checkpoint)?'Vista de referencia del cierre':'';
 let bits=`<div class="image-screen"><img src="${ART[day]}" alt="Pantalla visual aprobada del día ${day}, con tarjetas y controles táctiles accesibles superpuestos" draggable="false">`;
 bits+=hit('audio','Escuchar guía del día '+day,screen.audio,'','audio');
 for(const [id,label,x,y,w,h] of screen.options)bits+=hit('choice',label,[x,y,w,h],id,'select '+(day===11?'cover-checkbox ':'')+(state.choice.includes(id)?'active':''));
 if(day===10)bits+=`<div class="image-tip" style="${pos(240,1055,460,56)}">Escalas ilustrativas · registra tus valores reales después</div>`;
 if(day===11)bits+=`<div class="image-tip" style="${pos(50,690,840,38)}">Solo si te apetece. También puedes elegir descanso.</div>`;
 if(day===14&&!state.checkpoint)bits+=`<div class="demo-badge">Vista ilustrativa del cierre. El seguimiento oficial del día 14 aún no se ha confirmado.</div>`;
 if(day===13)bits+=`<div class="image-tip" style="${pos(95,704,750,52)}">Recuerda 3 experiencias reales de interés en la siguiente pantalla.</div>`;
 if(day!==14)bits+=`<input class="image-input" maxlength="400" data-field="note" value="${esc(state.note)}" style="${pos(...screen.note)}" aria-label="Nota personal para el día ${day}" placeholder="Escribe una observación breve…">`;
 bits+=hit('next','Continuar con la práctica clínica del día '+day,screen.cta,'','');
 return bits+'</div>';
}
function title(day,heading,sub){return `<section class="custom-head"><div class="top-mini"><strong>SPM · DESEO · DÍA ${day}</strong></div><h1>${esc(heading)}</h1><p>${esc(sub)}</p></section>`}
function panel(content){return `<section class="panel">${content}</section>`}
function speaker(day,page){return `<button class="speaker" data-act="audio"><span class="pulse">🔊</span> Escuchar indicaciones de este paso</button><details class="info"><summary>Leer guía clínica (opcional)</summary><p>${esc(SPEECH[day][Math.min(2,page-1)])}</p></details>`}
function select(items,field,multi=false){const value=data[chosenDay][field];return `<div class="choices ${items.length===4?'cols2':''}">${items.map(([id,label])=>`<button type="button" class="choice ${multi?(value||[]).includes(id)?'on':'':value===id?'on':''}" data-act="select" data-field="${field}" data-value="${id}" data-multi="${multi?'yes':'no'}" aria-pressed="${multi?(value||[]).includes(id):value===id}">${esc(label)}</button>`).join('')}</div>`}
function field(name,label,placeholder='',kind='textarea'){const v=data[chosenDay][name]??'';return `<label class="field"><span>${esc(label)}</span>${kind==='input'?`<input data-field="${name}" value="${esc(v)}" maxlength="400" placeholder="${esc(placeholder)}">`:kind==='datetime'?`<input type="datetime-local" data-field="${name}" value="${esc(v)}">`:`<textarea data-field="${name}" maxlength="400" placeholder="${esc(placeholder)}" rows="2">${esc(v)}</textarea>`}</label>`}
function nums(name,label){const v=data[chosenDay][name];return `<section class="field"><span>${esc(label)} · <b>${v===null?'N/A':v+'/10'}</b></span><div class="nums" role="group" aria-label="${esc(label)}">${Array.from({length:11},(_,i)=>`<button type="button" data-act="number" data-field="${name}" data-value="${i}" class="num ${v===i?'on':''}" aria-pressed="${v===i}">${i}</button>`).join('')}<button type="button" class="num ${v===null?'on':''}" data-act="number" data-field="${name}" data-value="NA" aria-pressed="${v===null}">N/A</button></div></section>`}
function clockText(seconds){const s=Math.round(Math.min(900,Math.max(0,seconds)));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function timer(){const t=data[chosenDay].timer,limit=chosenDay===10?600:chosenDay===12?600:300;return `<section class="timerbox"><div class="eyebrow">Reloj orientativo · puedes terminar antes</div><div class="clock" data-clock>${clockText(t.elapsed)}</div><div class="progressbar"><i data-progress style="width:${Math.min(100,100*t.elapsed/limit)}%"></i></div><div class="timeractions"><button class="primary" data-act="${t.running?'pause':'start'}">${t.running?'⏸ Pausar':t.started?'▶ Continuar':'▶ Iniciar'}</button><button data-act="reset">↺ Reiniciar</button></div></section>`}
function dynamic2(day){let body='';
 if(day===8)body=title(day,'Explora una experiencia agradable','El interés puede surgir poco a poco durante algo cómodo que tú eliges.')+panel(`${speaker(day,2)}<h2>Elige una sola experiencia</h2>${select([['music','Escuchar música'],['touch','Notar una textura o caricia en la mano'],['image','Observar una imagen agradable'],['conversation','Conversar o estar cerca si ambos quieren']],'stimulus')}<p>Tu elección es voluntaria. No necesitas sentir deseo ni comprobar tu respuesta.</p>`)+panel(timer());
 if(day===9)body=title(day,'Tu canal personal','Escoge una práctica según tus preferencias y tus registros.')+panel(`${speaker(day,2)}<h2>¿Qué canal te apetece?</h2>${select(CHANNELS,'channel')}<p>${esc(CHANNEL_SCRIPT[data[day].channel]||'Cada canal es diferente. Elige uno para escuchar una guía breve.')}</p><button class="speaker" data-act="channel-audio">🔊 Escuchar mi canal</button>`)+panel(timer());
 if(day===10)body=title(day,'Una idea diferente','Hoy se prueba una sola propuesta del repertorio, a tu ritmo.')+panel(`${speaker(day,2)}<h2>Elige una idea</h2>${select(IDEAS,'idea')}<p>La práctica busca reconocer si esta idea te sirve, no alcanzar una respuesta específica.</p>`)+panel(timer());
 if(day===11)body=title(day,'Hoy puedo elegir sin presión','Si el interés está bajo, el bienestar y el descanso siguen siendo opciones válidas.')+panel(`${speaker(day,2)}<h2>Lo que sí me apetece</h2>${select(PLEASANT,'pleasant')}<button type="button" class="choice ${data[day].pleasant==='none'?'on':''}" data-act="select" data-field="pleasant" data-value="none">Nada por ahora; prefiero descansar</button>`)+panel(nums('metricBefore','Presión al empezar (menor = más calma)'));
 if(day===12)body=title(day,'Planifica tu ventana','Un espacio flexible para explorar, sin convertirlo en una obligación.')+panel(`${speaker(day,2)}${field('moment','¿En qué momento podrías estar a gusto?','Ejemplo: una tarde tranquila','input')}${field('place','¿Dónde estarías cómodo?','Un lugar privado y tranquilo','input')}${select([['privacy','Más privacidad'],['quiet','Menos pantallas'],['time','Tiempo sin prisa'],['rest','Descansar antes']],'conditions')}${field('stimulus','Un estímulo que quizá quieras incluir','Música, conversación o contacto cómodo','input')}<p>Si el momento no te apetece cuando llegue, puedes cambiarlo o dejarlo para después.</p>`);
 if(day===13)body=title(day,'Tres señales de interés','Recuerda experiencias reales en las que sentiste curiosidad, conexión o interés.')+panel(`${speaker(day,2)}${field('memory1','Recuerdo 1','Qué pasó y qué ayudó')}${field('memory2','Recuerdo 2','Qué pasó y qué ayudó')}${field('memory3','Recuerdo 3','Qué pasó y qué ayudó')}<p>Puede ser una mirada, una conversación, una imagen o un contacto agradable. No necesitas haber tenido actividad sexual.</p>`);
 if(day===14)body=title(day,'Revisión de la semana 2','Observa qué te funcionó y decide qué mantener o ajustar.')+panel(`${speaker(day,1)}<h2>Lo que observaste</h2>${field('good','Una cosa que te ayudó','Ejemplo: más privacidad')}${field('repeat','Una práctica que repetirías','Ejemplo: una conversación tranquila')}${field('adjust','Algo que adaptarías','Ejemplo: reducir distracciones')}<div class="info">Esta reflexión no sustituye el cuestionario de seguimiento del día 14, que continúa independiente en SPM Central.</div>`);
 return `<main class="custom">${body}</main>`;
}
function dynamic3(day){let body='';
 if(day===8)body=title(day,'¿Qué descubriste hoy?','Observa cómo fue tu experiencia, sin examen.')+panel(`${speaker(day,3)}${nums('metricAfter','Interés al empezar o durante la experiencia')}${field('next','¿Qué repetirías o adaptarías?','Algo agradable o neutral es un hallazgo válido')}`);
 if(day===9)body=title(day,'Registra tu canal','Puedes elegir N/A cuando no haya datos para comparar.')+panel(`${speaker(day,3)}${nums('metricBefore','Deseo antes')}${nums('metricAfter','Deseo después')}${field('next','Un detalle que recuerdes','Un ritmo, sonido, imagen, palabra o textura')}`);
 if(day===10)body=title(day,'¿Te sirvió esta idea?','La utilidad es personal; cualquier respuesta es válida.')+panel(`${speaker(day,3)}${nums('utility','Utilidad de la idea elegida')}${field('next','¿Qué repetirías o cambiarías?','Una palabra es suficiente')}`);
 if(day===11)body=title(day,'Sin exigencias, con cuidado','Registra cómo te sentiste, sin evaluar el desempeño.')+panel(`${speaker(day,3)}${nums('metricAfter','Presión al terminar (menor = más calma)')}${field('next','Una cosa agradable que quieras recordar','Opcional')}`);
 if(day===12)body=title(day,'Tu ventana es flexible','No tienes que realizarla hoy ni seguirla si no te apetece.')+panel(`${speaker(day,3)}${nums('expected','Deseo esperado (opcional)')}${nums('actual','Deseo real, si ya ocurrió')}${field('next','Qué conservarías o cambiarías','Si no lo probaste: “por ahora solo lo planifiqué”')}`);
 if(day===13)body=title(day,'Tu confianza se construye','Recuerda una señal pequeña que merezca la pena recuperar.')+panel(`${speaker(day,3)}${nums('confidence','Confianza que percibes hoy')}${field('next','Un detalle que te gustaría recuperar','Un gesto, mirada, palabra o contexto')}`);
 if(day===14)body=title(day,'Tu evaluación sigue en SPM','Guarda esta reflexión sin reemplazar el cuestionario oficial.')+panel(`${speaker(day,2)}${field('next','Qué me gustaría mantener en la semana 3','Una práctica o condición concreta')}${data[day].checkpoint?'<div class="info">El seguimiento oficial del día 14 aparece registrado. Puedes ver el cierre visual.</div>':'<div class="info">El seguimiento oficial se realiza desde la tarjeta de evaluación del día 14 en Hoy. Puedes abrirlo de forma segura desde aquí, después de guardar tu reflexión.</div>'}<button type="button" class="speaker" data-act="checkpoint">📋 Abrir evaluación oficial del día 14</button>`);
 return `<main class="custom"><div class="content">${body.includes('custom-head')?'':title(day,'Tu registro','')}</div>${body}<div class="content">${day===14?'':panel('<span class="eyebrow">Tu registro es privado</span><p>Puedes continuar cuando lo desees. No necesitas completar un tiempo fijo.</p>')}</div></main>`;
}
function renderDay(day){const state=data[day],page=state.page;let body='';
 if(day===14){if(page===1)body=dynamic2(14);else if(page===2)body=dynamic3(14);else body=cover(14)}
 else if(page===1)body=cover(day);else if(page===2)body=dynamic2(day);else body=dynamic3(day);
 app.innerHTML=topbar(day)+body+nav(day,page);
}
function render(resetScroll=true){if(chosenDay===-1){app.innerHTML='<div class="intro">Esta sesión no es válida. Regresa a SPM Central.</div>';return}app.innerHTML=chosenDay===0?home():topbar(chosenDay)+(chosenDay===14?(data[14].page===3?cover(14):data[14].page===1?dynamic2(14):dynamic3(14)):(data[chosenDay].page===1?cover(chosenDay):data[chosenDay].page===2?dynamic2(chosenDay):dynamic3(chosenDay)))+nav(chosenDay,data[chosenDay].page);if(resetScroll)requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}))}
function setDay(day){if(CENTRAL){if(day===0){if(!closing){closing=true;pauseAll();transmit('SPM_WEEK2_CLOSE',{record:data[DAY]})}return}if(day!==DAY)return}if(day!==0&&!DAYS.includes(day))return;pauseAll();chosenDay=day;render();save()}
function pauseAll(){stopVoice();if(!DAYS.includes(chosenDay))return;const t=data[chosenDay].timer;if(t.running){tick();t.running=false}}
function tick(){if(!DAYS.includes(chosenDay))return;const t=data[chosenDay].timer;if(!t.running)return;const now=Date.now();const delta=Math.min(5,Math.max(0,(now-t.anchor)/1000));t.anchor=now;t.elapsed=Math.min(900,t.elapsed+delta);const el=app.querySelector('[data-clock]'),p=app.querySelector('[data-progress]');if(el)el.textContent=clockText(t.elapsed);if(p)p.style.width=Math.min(100,t.elapsed/300*100)+'%';if(t.elapsed>=900){t.running=false;save()}}
setInterval(tick,250);
function pickChannelFromProgram(program,state){const ranking=Array.isArray(program?.ranking)?program.ranking:[];
 const mapper={'partner-visual':'visual',touch:'tactile',words:'auditory',massage:'tactile',fantasy:'fantasy',foreplay:'foreplay',ambience:'context'};
 for(const id of ranking){if(mapper[id])return mapper[id]}
 const details=program?.details||{};
 for(const key of ['visual','tactile','verbal','fantasy','context']){if(Array.isArray(details[key])&&details[key].length)return key==='verbal'?'auditory':key}
 const stimuli=Array.isArray(state?.stimuli)?state.stimuli:[];
 for(const id of stimuli){if(['visual','tactile','auditory','fantasy','context','foreplay'].includes(id))return id}
 return '';
}
function next(){if(!DAYS.includes(chosenDay)||pending)return;const day=chosenDay,d=data[day];pauseAll();if(d.page<3){d.page++;render();save();return}finish()}
function finish(){const day=chosenDay,d=data[day];if(pending)return;
 if(day===13&&![d.memory1,d.memory2,d.memory3].some(x=>String(x).trim())){sayNotification('Anota al menos un recuerdo de interés o curiosidad.');return}
 if(day===8&&!d.stimulus){sayNotification('Elige una experiencia voluntaria para reconocer tu interés.');return}
 if(day===9&&!d.channel){sayNotification('Elige un canal personal para esta práctica.');return}
 if(day===10&&!d.idea){sayNotification('Elige una idea del repertorio para explorar.');return}
 if(day===11&&!d.pleasant){sayNotification('Elige la opción que hoy sí te resulte cómoda, incluso descansar.');return}
 if(day===12&&!String(d.moment).trim()){sayNotification('Escribe un momento que te gustaría reservar, aunque después lo adaptes.');return}
 if(day===14&&!String(d.good+d.repeat+d.adjust+d.next).trim()){sayNotification('Anota al menos una observación de esta semana.');return}
 pending=true;d.completed=true;save();
 if(CENTRAL){transmit('SPM_WEEK2_COMPLETE',{record:d,practiceId:day===9?(d.channel||'@channel'):PRACTICES[day]});sayNotification('Guardando en tu programa SPM…');}
 else{pending=false;sayNotification('Tu actividad de revisión local quedó registrada.');if(day===14&&!d.checkpoint){d.page=2;render();sayNotification('Recuerda realizar la evaluación oficial del día 14 en SPM Central.');}else setDay(0)}
}
function choose(act,field,value,multi=false){const s=data[chosenDay];if(multi){const set=new Set(Array.isArray(s[field])?s[field]:[]);if(set.has(value))set.delete(value);else set.add(value);s[field]=[...set]}else s[field]=value;save();render(false)}
app.addEventListener('click',event=>{const b=event.target?.closest?.('button[data-act]');if(!b)return;const act=b.dataset.act,value=b.dataset.value,field=b.dataset.field;
 if(act==='go'){setDay(Number(b.dataset.day));return}
 if(act==='home'){setDay(0);return}
 if(!DAYS.includes(chosenDay)||!ready)return;
 const day=chosenDay,s=data[day];
 if(act==='back'){pauseAll();if(s.page===1)setDay(0);else{s.page--;render();save()}return}
 if(act==='next'){next();return}
 if(act==='audio'){speak(SPEECH[day][Math.min(2,s.page-1)]);return}
 if(act==='choice'){
  choose(act,'choice',value,true);
  if(!s.choice.includes(value)){stopVoice();return}
  const opt=COVERS[day].options.find(x=>x[0]===value);
  if(opt)speak(COVER_CHOICE_SPEECH[day]?.[value]||opt[1]);
  return;
 }
 if(act==='select'){choose(act,field,value,b.dataset.multi==='yes');return}
 if(act==='channel-audio'){speak(CHANNEL_SCRIPT[s.channel]||'Selecciona un canal para escuchar la indicación.');return}
 if(act==='number'){s[field]=value==='NA'?null:Number(value);save();render(false);return}
 if(act==='start'){const t=s.timer;t.started=true;t.running=true;t.anchor=Date.now();render(false);save();speak('Puedes explorar a tu propio ritmo. El cronómetro es orientativo y puedes detenerte en cualquier momento.');return}
 if(act==='pause'){tick();s.timer.running=false;save();render(false);return}
 if(act==='reset'){s.timer={elapsed:0,anchor:0,running:false,started:false};save();render(false);return}
 if(act==='checkpoint'){if(day!==14)return;if(CENTRAL){pauseAll();transmit('SPM_WEEK2_CHECKPOINT',{record:s});sayNotification('Preparando el seguimiento oficial del día 14…')}else sayNotification('La evaluación oficial se abre desde Hoy en SPM Central. Esta es una revisión independiente.');return}
});
app.addEventListener('input',event=>{const e=event.target,field=e?.dataset?.field;if(!DAYS.includes(chosenDay)||!field||!Object.hasOwn(data[chosenDay],field))return;data[chosenDay][field]=String(e.value).slice(0,400);save()});
window.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAll()});window.addEventListener('pagehide',pauseAll);
if(CENTRAL){if(!VALID){render();return}
 app.innerHTML='<div class="intro"><h1>Recuperando tu práctica de Deseo…</h1><p>Conectando con SPM Central.</p></div>';
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==window.parent||event.data?.sid!==SID||event.data?.day!==DAY)return;const m=event.data;
 if(m.type==='SPM_WEEK2_INIT'){
  if(ready)return;
  data[DAY]={...blank(),...(m.record&&typeof m.record==='object'?m.record:{}),timer:{...blank().timer,...(m.record?.timer||{}),running:false,anchor:0}};
  if(DAY===9&&!data[DAY].channel)data[DAY].channel=pickChannelFromProgram(m.program,m.state);
  if(DAY===14)data[DAY].checkpoint=m.checkpoint===true;
  data[DAY].page=1;chosenDay=DAY;ready=true;render();}
 else if(m.type==='SPM_WEEK2_ERROR'){pending=false;data[DAY].completed=false;sayNotification(m.message||'No se pudo guardar. Tu pantalla permanece abierta para reintentar.');}
 else if(m.type==='SPM_WEEK2_DONE'){pending=false;sayNotification('Tu actividad se registró en SPM Central.');}
 });transmit('SPM_WEEK2_READY');
}else{render()}
window.SPM_DESIRE_WEEK2_TEST={get state(){return JSON.parse(JSON.stringify(data))},openDay:day=>setDay(day),clinicalIds:PRACTICES,channels:CHANNELS,ideas:IDEAS};
})();
