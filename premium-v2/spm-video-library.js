(()=>{
'use strict';
const MEDIA='https://jogirmziqjlsttbbarcx.supabase.co/storage/v1/object/public/spm-media/videos/';
const LOCAL='assets/videos/';
// One action per video, reused by Today and every library player.
const actions={
 'dr-performance-anxiety':{
  title:'Vuelve a una sensación cómoda',
  context:'Al terminar el video, dedica un minuto a practicar cómo volver tu atención al presente.',
  steps:[
   'Siéntate en un lugar cómodo y apoya ambos pies en el suelo.',
   'Observa el contacto de tus pies con el suelo o de tu espalda con la silla. Respira a tu ritmo mientras notas esa sensación.',
   'Si aparece un pensamiento como «¿lo estaré haciendo bien?», vuelve con suavidad a esa misma sensación. Puedes usar este gesto durante tu práctica de hoy.'
  ],
  note:'El objetivo es practicar dónde pones tu atención. No necesitas comprobar tu erección ni provocar una respuesta sexual.'
 },
 'dr-vascular':{
  title:'Prepara tu próximo control de salud',
  context:'Al terminar el video, revisa qué información ya tienes para cuidar tu salud vascular.',
  steps:[
   'Revisa si tienes pendiente un control de presión arterial o una consulta que ya te hayan indicado.',
   'Si está pendiente, identifica dónde solicitarlo y reserva un momento para hacerlo. Si ya tienes cita, deja a mano los resultados o registros que llevarás.',
   'En esa consulta, comenta también tus dudas sobre la erección. Si no tienes un control indicado y este tema te preocupa, pide orientación a tu profesional.'
  ],
  note:'No necesitas medir tu presión ahora ni subir información médica al programa.'
 },
 'breathing-guided':{
  title:'Ensaya la respiración del video',
  context:'Cuando tengas indicada tu práctica de respiración, vuelve al tramo de demostración y acompáñalo solo mientras te resulte cómodo.',
  steps:[
   'Siéntate con la espalda apoyada y los hombros cómodos. Coloca una mano sobre el abdomen, sin presionarlo.',
   'Reproduce la demostración y respira suavemente. Observa el movimiento del abdomen sin intentar llenarlo al máximo.',
   'Mantén un ritmo cómodo para ti, sin retener el aire ni forzar la respiración. Después vuelve a respirar como lo haces habitualmente.'
  ],
  note:'Si aparece mareo o incomodidad, detén el ejercicio y vuelve a tu respiración natural.'
 },
 'anticipatory-failure':{
  title:'Vuelve de la anticipación al presente',
  context:'Usa estos pasos cuando aparezca una preocupación por lo que podría ocurrir durante tu práctica.',
  steps:[
   'Si aparece un pensamiento como «va a salir mal», reconócelo con una frase breve: «Estoy anticipando un resultado».',
   'Mira a tu alrededor y elige un detalle concreto, como un color, una textura o un sonido.',
   'Dedica unos instantes a observar ese detalle y después retoma lo que estabas haciendo, a tu ritmo.'
  ],
  note:'Puedes volver al presente aunque el pensamiento siga apareciendo; no tienes que eliminarlo para continuar.'
 },
 'dr-metabolic':{
  title:'Prepara un momento de descanso',
  context:'Lleva el cuidado de tus hábitos a una acción sencilla antes de tu próximo periodo de descanso.',
  steps:[
   'Deja preparado un espacio cómodo para descansar y reduce una interrupción que puedas controlar, como las notificaciones del teléfono.',
   'Aparta la pantalla durante unos minutos y baja la intensidad de la luz si puedes.',
   'Usa ese rato para una actividad tranquila que te resulte agradable, como leer unas páginas o escuchar música suave.'
  ],
  note:'Adapta esta preparación a tu horario y mantén las indicaciones de salud que ya tengas.'
 },
 'anxiety-regulation':{
  title:'Haz una pausa para soltar tensión',
  context:'Prueba esta pausa al terminar el video o cuando hoy notes tensión en tu cuerpo.',
  steps:[
   'Detén por un momento lo que estás haciendo y encuentra una postura cómoda.',
   'Deja descansar las manos y afloja los hombros y la mandíbula, sin forzarlos.',
   'Observa unas respiraciones a tu ritmo. Después retoma tu actividad despacio.'
  ],
  note:'No necesitas sentir calma inmediata para dar por terminada la pausa.'
 },
 'performance-anxiety':{
  title:'Empieza sin ponerte a prueba',
  context:'Antes de comenzar tu práctica prevista, prepara la forma en que vas a prestar atención.',
  steps:[
   'Recuérdate esta frase: «Hoy puedo explorar sin tener que demostrar nada».',
   'Elige una sensación cómoda a la que puedas volver, como el apoyo de tu cuerpo o el contacto con tu ropa.',
   'Si empiezas a evaluar cómo respondes, vuelve a esa sensación y continúa a tu ritmo. Puedes hacer una pausa cuando lo necesites.'
  ],
  note:'Esta acción acompaña la práctica que tengas indicada; no añade una prueba de rendimiento.'
 },
 'sensory-focus':{
  title:'Observa un contacto sencillo',
  context:'En tu práctica sensorial prevista, dedica unos instantes a reconocer un contacto que te resulte cómodo.',
  steps:[
   'Busca un lugar tranquilo y apoya suavemente una mano sobre tu antebrazo, por encima de la ropa si lo prefieres.',
   'Observa una cualidad a la vez: la temperatura, la presión suave o la textura de la piel o de la tela.',
   'Si te distraes, vuelve a esa cualidad. Cambia o detén el contacto si deja de resultarte cómodo.'
  ],
  note:'Puedes hacerlo por tu cuenta. El objetivo es prestar atención al contacto, sin buscar excitación ni medir tu respuesta.'
 },
 'partner-communication':{
  title:'Ensaya cómo pedir un ritmo cómodo',
  context:'Después del video, practica una forma clara y amable de expresar lo que necesitas.',
  steps:[
   'En un momento tranquilo, ensaya en voz baja: «Me gustaría ir más despacio y decirnos qué nos resulta cómodo».',
   'Si decides compartirlo con tu pareja, hazlo sin prisas y escucha también su preferencia.',
   'Acuerden que cualquiera puede pedir una pausa o cambiar de idea. Si hoy estás por tu cuenta, basta con ensayar la frase.'
  ],
  note:'La conversación puede ocurrir fuera de un encuentro íntimo; no obliga a iniciar ninguna actividad.'
 },
 'dr-medications':{
  title:'Prepara una pregunta sobre tu tratamiento',
  context:'Si usas medicamentos o suplementos y tienes dudas sobre su relación con tu función sexual, prepara tu próxima consulta.',
  steps:[
   'Localiza los nombres de los medicamentos y suplementos que utilizas, o conserva una foto de sus envases para tu consulta.',
   'Ensaya esta pregunta: «¿Alguno de mis tratamientos podría influir en mi función sexual y qué opciones tenemos?».',
   'Coméntalo con tu profesional y mantén el tratamiento como te lo indicaron hasta recibir orientación.'
  ],
  note:'No suspendas medicamentos ni cambies la dosis por tu cuenta. Si no utilizas ningún tratamiento, no necesitas preparar una lista.'
 },
 'dr-low-desire':{
  title:'Prepara un espacio sin exigencias',
  context:'Antes de tu práctica prevista, prepara un entorno que te permita estar cómodo y tener menos interrupciones.',
  steps:[
   'Busca unos minutos con privacidad y aparta una distracción, como las notificaciones del teléfono.',
   'Acomódate y elige un detalle que te resulte agradable: una temperatura cómoda, una tela suave o una música que te guste.',
   'Permítete estar en ese momento sin comprobar si aparece deseo. Puedes adaptar o terminar la práctica según tu comodidad.'
  ],
  note:'No necesitas tener pareja ni sentir deseo de inmediato para preparar este espacio.'
 },
 'mental-preparation':{
  title:'Prepara un encuentro con menos presión',
  context:'Usa estos pasos antes de un encuentro que desees tener. Si no tienes uno previsto, puedes ensayar cómo expresarías tu preferencia.',
  steps:[
   'Elige una condición que te ayude a estar más cómodo: disponer de tiempo, tener privacidad o ir despacio.',
   'Prepara esa condición y, si hay pareja, coméntala antes de comenzar: «Me gustaría que tuviéramos tiempo para ir a nuestro ritmo».',
   'Recuerda que pueden adaptar el plan o hacer una pausa. Un acuerdo inicial puede cambiar si cambia la comodidad de cualquiera.'
  ],
  note:'El objetivo es cuidar las condiciones del encuentro, sin exigirte un resultado sexual concreto.'
 }
};
const videos=[
 {key:'dr-vascular',title:'Salud vascular y función eréctil',tag:'Dr. SPM · Clínica',duration:'0:55',url:LOCAL+'dr-spm-vascular-content.mp4',desc:'Explica por qué la circulación sanguínea es clave para la erección y cómo los factores cardiovasculares pueden influir en la respuesta sexual.'},
 {key:'dr-metabolic',title:'Salud metabólica y función sexual',tag:'Dr. SPM · Clínica',duration:'0:51',url:LOCAL+'dr-spm-metabolic-content.mp4',desc:'Relaciona salud metabólica, hábitos y función sexual desde una perspectiva educativa y preventiva.'},
 {key:'dr-medications',title:'Medicamentos y función sexual',tag:'Dr. SPM · Seguridad',duration:'0:49',url:LOCAL+'dr-spm-medications-content.mp4',desc:'Aclara que algunos tratamientos pueden influir en deseo, erección o eyaculación y que no deben suspenderse ni modificarse por cuenta propia.'},
 {key:'dr-performance-anxiety',title:'Erección, estrés y ansiedad de rendimiento',tag:'Dr. SPM · Clínica',duration:'0:50',url:LOCAL+'dr-spm-performance-anxiety-content.mp4',desc:'Explica cómo la vigilancia del desempeño puede interferir con la respuesta eréctil y cómo volver a las sensaciones.'},
 {key:'dr-low-desire',title:'Bajo deseo sexual: factores que pueden influir',tag:'Dr. SPM · Clínica',duration:'0:55',url:LOCAL+'dr-spm-low-desire.mp4',desc:'Presenta de forma clara los factores físicos, emocionales, relacionales y médicos que pueden modificar el deseo sexual.'},
 {key:'breathing-guided',title:'Respiración diafragmática guiada',tag:'Ejercicio guiado',duration:'1:03',url:MEDIA+'breathing-guided.mp4',desc:'Sesión guiada para aprender postura, respiración abdominal y ritmo respiratorio.'},
 {key:'anxiety-regulation',title:'Respiración para regulación de ansiedad',tag:'Recurso complementario',duration:'0:43',url:MEDIA+'anxiety-regulation.mp4',desc:'Recurso breve para reconocer tensión, relajar hombros y recuperar una respiración más tranquila.'},
 {key:'performance-anxiety',title:'Ansiedad de rendimiento: salir del modo examen',tag:'Preparación mental',duration:'1:17',url:MEDIA+'performance-anxiety.mp4',desc:'Ayuda a reducir la autoevaluación constante y volver a la presencia, la respiración y las sensaciones.'},
 {key:'mental-preparation',title:'Preparación mental antes del encuentro íntimo',tag:'Preparación mental',duration:'1:15',url:MEDIA+'mental-preparation.mp4',desc:'Rutina breve para disminuir anticipación, tensión y presión de rendimiento antes del encuentro íntimo.'},
 {key:'anticipatory-failure',title:'Dejar de anticipar el fracaso',tag:'Entrenamiento mental',duration:'1:16',url:MEDIA+'anticipatory-failure.mp4',desc:'Recurso para reconocer pensamientos anticipatorios y recuperar una respuesta más centrada en el presente.'},
 {key:'sensory-focus',title:'Foco sensorial: volver a las sensaciones',tag:'Foco sensorial',duration:'1:09',url:MEDIA+'sensory-focus.mp4',desc:'Entrena la atención en sensaciones corporales agradables sin convertir la experiencia en una evaluación del rendimiento.'},
 {key:'partner-communication',title:'Comunicación con la pareja sin presión',tag:'Comunicación',duration:'1:11',url:MEDIA+'partner-communication.mp4',desc:'Orientación para hablar de la experiencia sexual reduciendo presión, expectativas rígidas y sensación de examen.'}
];
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
for(const video of videos)video.action=actions[video.key];
function actionFor(key){return videos.find(video=>video.key===key)?.action||null;}
function actionSummary(key){const action=actionFor(key);return action?'Ponlo en práctica: '+action.title+'.':'';}
function actionNarration(key){const action=actionFor(key);return action?[action.title+'.',action.context,...action.steps.map((step,index)=>['Primero.','Segundo.','Tercero.'][index]+' '+step),action.note].filter(Boolean).join(' '):'';}
function actionMarkup(key){
 const action=actionFor(key);if(!action)return '';
 return `<section class="spm-video-action" data-video-action="${esc(key)}" aria-label="${esc('Ponlo en práctica: '+action.title)}"><h4 class="spm-video-action-kicker">Ponlo en práctica</h4><h5 class="spm-video-action-title">${esc(action.title)}</h5>${window.SPM_PRACTICE_AUDIO?.button(actionNarration(key),'Escuchar acción: '+action.title,{compact:true,src:'/premium-v2/assets/audio/video-actions/'+key+'.mp3'})||''}<details data-video-action-transcript><summary>Leer instrucciones</summary><div class="spm-video-action-transcript"><p class="spm-video-action-context">${esc(action.context)}</p><ol>${action.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol>${action.note?`<p class="spm-video-action-note">${esc(action.note)}</p>`:''}</div></details></section>`;
}
function installActionStyles(doc=document){
 if(doc.getElementById('spmVideoActionStyles'))return;
 const css=doc.createElement('style');css.id='spmVideoActionStyles';css.textContent=`
 .spm-video-action{box-sizing:border-box;min-width:0;margin:24px 0 0;padding:24px 0 0;border-top:1px solid #c5a46c66;text-align:left;color:#e8eef0;font:400 17px/1.7 system-ui,-apple-system,"Segoe UI",sans-serif;overflow-wrap:anywhere}
 .spm-video-action .spm-video-action-kicker{margin:0 0 10px;color:#d8ba75;font-size:14px;line-height:1.4;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
 .spm-video-action .spm-video-action-title{margin:0 0 14px;color:#fff;font-size:clamp(20px,3vw,24px);font-weight:750;line-height:1.35}
 .spm-video-action p.spm-video-action-context,.spm-video-action p.spm-video-action-note{max-width:65ch;margin:0;font-size:inherit;line-height:1.7;color:#c9d7dc}
 .spm-video-action ol{display:grid;gap:16px;max-width:65ch;margin:20px 0;padding-left:1.6em}
 .spm-video-action li{padding-left:7px;line-height:1.7}.spm-video-action li::marker{color:#d8ba75;font-weight:800}
 .spm-video-action p.spm-video-action-note{font-size:15px;color:#b6c9d1}
 .spm-video-action details{margin-top:16px}.spm-video-action details>summary{width:fit-content;padding:8px 0;cursor:pointer;color:#d9c294;font-size:15px;line-height:1.5}.spm-video-action details>summary:focus-visible{outline:3px solid #d8ba75;outline-offset:4px;border-radius:4px}.spm-video-action-transcript{padding:16px 0 0}
 .spmVideoCard .spm-video-action-preview{margin:8px 0 0;color:#ddc693;font-size:15px;line-height:1.6}
 @media(max-width:540px){.spm-video-action{font-size:16px;padding-top:20px;margin-top:20px}.spm-video-action ol{gap:14px}}
 `;doc.head.appendChild(css);
}
installActionStyles();
window.SPM_VIDEO_ACTIONS={forVideo:actionFor,summary:actionSummary,narration:actionNarration,markup:actionMarkup,installStyles:installActionStyles};
function play(v){if(window.SPM_NATIVE_VIDEO?.open)return window.SPM_NATIVE_VIDEO.open(v.url,v.title);const p=document.createElement('video');p.src=v.url;p.controls=true;p.autoplay=true;p.playsInline=true;p.style='position:fixed;z-index:1300;inset:5%;width:90%;height:90%;background:#000';p.onclick=()=>{};document.body.appendChild(p);p.onended=()=>p.remove();}
function card(v){return `<article class="spmVideoCard"><div><span class="stepBadge">${esc(v.tag)}</span><h3>${esc(v.title)}</h3><small>${esc(v.duration)}</small>${v.action?`<p class="spm-video-action-preview">${esc(actionSummary(v.key))}</p>`:''}</div><button class="btn pri spmPlay" data-key="${esc(v.key)}" type="button">▶ Ver video</button></article>`;}
function pickVideo(text){const t=(text||'').toLowerCase();if(t.includes('vascular')||t.includes('circulación')||t.includes('circulacion'))return videos.find(v=>v.key==='dr-vascular');if(t.includes('metabó')||t.includes('metabo')||t.includes('diabetes')||t.includes('colesterol'))return videos.find(v=>v.key==='dr-metabolic');if(t.includes('medicament')||t.includes('fármaco')||t.includes('farmaco'))return videos.find(v=>v.key==='dr-medications');if(t.includes('bajo deseo')||t.includes('deseo sexual'))return videos.find(v=>v.key==='dr-low-desire');if((t.includes('erección')||t.includes('ereccion')||t.includes('firmeza'))&&t.includes('ansiedad'))return videos.find(v=>v.key==='dr-performance-anxiety');if(t.includes('foco sensorial')||t.includes('sensaciones'))return videos.find(v=>v.key==='sensory-focus');if(t.includes('comunicación')||t.includes('comunicacion')||t.includes('pareja'))return videos.find(v=>v.key==='partner-communication');if(t.includes('anticip')||t.includes('fracaso'))return videos.find(v=>v.key==='anticipatory-failure');if(t.includes('antes del encuentro')||t.includes('preparación mental')||t.includes('preparacion mental'))return videos.find(v=>v.key==='mental-preparation');if(t.includes('ansiedad de rendimiento')||t.includes('modo examen'))return videos.find(v=>v.key==='performance-anxiety');if(t.includes('ansiedad')||t.includes('regulación')||t.includes('regulacion'))return videos.find(v=>v.key==='anxiety-regulation');if(t.includes('respiración')||t.includes('respiracion'))return videos.find(v=>v.key==='breathing-guided');return null;}
function bind(root=document){root.querySelectorAll('.spmPlay:not([data-bound])').forEach(b=>{b.dataset.bound='1';b.onclick=()=>{const v=videos.find(x=>x.key===b.dataset.key);if(v)play(v)}})}
function mountLibrary(){const plan=document.getElementById('plan');if(!plan||document.getElementById('spmVideoLibrary'))return;const box=document.createElement('div');box.className='card';box.id='spmVideoLibrary';box.innerHTML=`<span class="stepBadge">Biblioteca SPM</span><h2>Videos guiados</h2><p class="micro">Todos los videos se reproducen dentro de SPM. Puedes volver a ellos cuando necesites recordar una técnica.</p><div class="spmVideoGrid">${videos.map(card).join('')}</div>`;plan.appendChild(box);bind(box)}
function decorateDays(){document.querySelectorAll('.dayCard').forEach(c=>{
 // Select from the lesson itself. Profile labels and injected resource buttons
 // must never turn unrelated lessons into low-desire video assignments.
 const body=c.querySelector('.dayBody'),text=[c.querySelector('.dayTop h4')?.textContent,...[...c.querySelectorAll('.lessonFlow .lesson p')].map(p=>p.textContent)].filter(Boolean).join(' ');
 const v=pickVideo(text);let b=c.querySelector('button.spmPlay');
 if(!v||!body){b?.remove();delete c.dataset.spmVideoDecorated;return;}
 if(!b){b=document.createElement('button');b.type='button';b.className='btn sec sm spmPlay';}
 c.dataset.spmVideoDecorated='1';b.dataset.key=v.key;
 const label='▶ '+v.title;if(b.textContent!==label)b.textContent=label;
 if(b.parentElement!==body)body.appendChild(b);bind(c);
})}
const style=document.createElement('style');style.textContent='.spmVideoGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:16px}.spmVideoCard{border:1px solid var(--line);border-radius:16px;padding:16px;background:#08171b;display:flex;flex-direction:column;justify-content:space-between;gap:14px}.spmVideoCard h3{margin:10px 0 6px}.spmVideoCard .btn{align-self:flex-start}';document.head.appendChild(style);
function run(){mountLibrary();decorateDays();bind()}
function start(){run();new MutationObserver(run).observe(document.body,{childList:true,subtree:true});}
window.SPM_VIDEO_LIBRARY=videos;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
