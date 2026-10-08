(()=>{
'use strict';
const MEDIA='https://jogirmziqjlsttbbarcx.supabase.co/storage/v1/object/public/spm-media/videos/';
const LOCAL='assets/videos/';
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
function play(v){if(window.SPM_NATIVE_VIDEO?.open)return window.SPM_NATIVE_VIDEO.open(v.url,v.title);const p=document.createElement('video');p.src=v.url;p.controls=true;p.autoplay=true;p.playsInline=true;p.style='position:fixed;z-index:1300;inset:5%;width:90%;height:90%;background:#000';p.onclick=()=>{};document.body.appendChild(p);p.onended=()=>p.remove();}
function card(v){return `<article class="spmVideoCard"><div><span class="stepBadge">${esc(v.tag)}</span><h3>${esc(v.title)}</h3><p class="micro">${esc(v.desc)}</p><small>${esc(v.duration)}</small></div><button class="btn pri spmPlay" data-key="${esc(v.key)}" type="button">▶ Ver video</button></article>`;}
// Inline recommendations are scoped to the active authenticated plan and the
// day's main task. The full video library remains available independently.
const VIDEO_ROUTES={
 'dr-vascular':['erection'],
 'dr-metabolic':['erection','desire','wellbeing'],
 'dr-medications':['erection','ejaculation','desire','confidence','anxiety','wellbeing'],
 'dr-performance-anxiety':['erection','confidence','anxiety'],
 'dr-low-desire':['desire'],
 'breathing-guided':['erection','ejaculation','desire','confidence','anxiety','wellbeing'],
 'anxiety-regulation':['erection','ejaculation','desire','confidence','anxiety','wellbeing'],
 'performance-anxiety':['erection','ejaculation','desire','confidence','anxiety'],
 'mental-preparation':['erection','ejaculation','desire','confidence','anxiety'],
 'anticipatory-failure':['erection','ejaculation','desire','confidence','anxiety'],
 'sensory-focus':['erection','ejaculation','desire','confidence','anxiety','wellbeing'],
 'partner-communication':['erection','ejaculation','desire','confidence','anxiety','wellbeing']
};
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function scopedVideo(key,ctx){
 if(!ctx?.userId||!ctx?.planId||ctx.safety==='urgent')return null;
 const routes=[ctx.primary,ctx.secondary,...(Array.isArray(ctx.motives)?ctx.motives:[])].map(norm);
 if(!routes.some(r=>VIDEO_ROUTES[key]?.includes(r)))return null;
 return videos.find(v=>v.key===key)||null;
}
function pickVideo({title='',practice=''}={},ctx){
 if(!ctx?.userId||!ctx?.planId||ctx.safety==='urgent')return null;
 // The day's title and main practice determine relevance. Reading the entire
 // day card would also match unrelated secondary examples and generic tips.
 const t=norm([title,practice].join(' '));
 const rules=[
  [/foco sensorial|focalizacion sensorial|contacto sensorial/, 'sensory-focus'],
  [/comunicacion|conversacion con (la )?pareja|hablar con (la )?pareja/, 'partner-communication'],
  [/anticipar (el )?fracaso|anticipacion del fracaso/, 'anticipatory-failure'],
  [/preparacion mental|antes del encuentro/, 'mental-preparation'],
  [/ereccion.{0,40}ansiedad|ansiedad.{0,40}ereccion|firmeza.{0,40}ansiedad/, 'dr-performance-anxiety'],
  [/ansiedad de rendimiento|modo examen/, 'performance-anxiety'],
  [/bajo deseo|reactivacion del deseo|deseo responsivo|activacion del deseo/, 'dr-low-desire'],
  [/vascular|circulacion|perfusi(o|ó)n/, 'dr-vascular'],
  [/metabol|diabetes|colesterol/, 'dr-metabolic'],
  [/medicament|farmac/, 'dr-medications'],
  [/regulacion de ansiedad/, 'anxiety-regulation'],
  [/respiracion|respirar|inhala|exhala/, 'breathing-guided']
 ];
 for(const [pattern,key] of rules){if(pattern.test(t)){const video=scopedVideo(key,ctx);if(video)return video;}}
 return null;
}
function dayActivity(card){
 return {
  title:card.querySelector('.dayTop h4')?.textContent||'',
  practice:card.querySelector('.lessonFlow .lesson:nth-child(2) p')?.textContent||''
 };
}
function bind(root=document){root.querySelectorAll('.spmPlay:not([data-bound])').forEach(b=>{b.dataset.bound='1';b.onclick=()=>{const v=videos.find(x=>x.key===b.dataset.key);if(v)play(v)}})}
function mountLibrary(){const plan=document.getElementById('plan');if(!plan||document.getElementById('spmVideoLibrary'))return;const box=document.createElement('div');box.className='card';box.id='spmVideoLibrary';box.innerHTML=`<span class="stepBadge">Biblioteca SPM</span><h2>Videos guiados</h2><p class="micro">Todos los videos se reproducen dentro de SPM. Puedes volver a ellos cuando necesites recordar una técnica.</p><div class="spmVideoGrid">${videos.map(card).join('')}</div>`;plan.appendChild(box);bind(box)}
function decorateDays(){
 const ctx=typeof window.SPM_RESOURCE_CONTEXT==='function'?window.SPM_RESOURCE_CONTEXT():null;
 document.querySelectorAll('.dayCard').forEach(card=>{
  const video=pickVideo(dayActivity(card),ctx);
  const existing=card.querySelector('.spmPlay[data-spm-inline="1"]');
  if(!video){existing?.remove();return;}
  if(existing?.dataset.key===video.key)return;
  existing?.remove();
  const b=document.createElement('button');b.type='button';b.className='btn sec sm spmPlay';
  b.dataset.spmInline='1';b.dataset.key=video.key;b.textContent='▶ Ver video SPM';
  card.appendChild(b);bind(card);
 });
}
const style=document.createElement('style');style.textContent='.spmVideoGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:16px}.spmVideoCard{border:1px solid var(--line);border-radius:16px;padding:16px;background:#08171b;display:flex;flex-direction:column;justify-content:space-between;gap:14px}.spmVideoCard h3{margin:10px 0 6px}.spmVideoCard .btn{align-self:flex-start}';document.head.appendChild(style);
function run(){mountLibrary();decorateDays();bind()}
document.addEventListener('DOMContentLoaded',()=>{run();new MutationObserver(run).observe(document.body,{childList:true,subtree:true})});window.SPM_VIDEO_LIBRARY=videos;window.SPM_VIDEO_ROUTING={pickVideo,dayActivity};
})();