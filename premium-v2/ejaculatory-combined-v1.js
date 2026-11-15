(()=>{
'use strict';
if(window.SPM_COMBINED_V1)return;
const host=document.createElement('div');host.id='spmCombinedV1';host.hidden=true;
const shadow=host.attachShadow({mode:'open'});
shadow.innerHTML='<style>'+"\n:host{--navy:#0f2e4f;--ink:#09213d;--gold:#c5a46c;--forest:#0d736b;--ivory:#f9f6f0;--line:#e4ddce;--bg:#e9eceb}*{box-sizing:border-box}:host{margin:0;background:linear-gradient(145deg,#edf3ef,#ecedf0);font-family:system-ui,-apple-system,'Segoe UI',Arial,sans-serif;color:var(--ink);line-height:1.5}.outer{max-width:730px;margin:auto;padding:clamp(0px,2vw,20px)}.app{background:#fffdf9;min-height:100dvh;box-shadow:0 10px 42px #0f2e4f21;overflow:hidden;border-radius:clamp(0px,2vw,22px)}.top{z-index:10;position:sticky;top:0;background:#fffefaef;backdrop-filter:blur(12px);border-bottom:1px solid var(--line);padding:12px 20px 8px}.topline{display:flex;align-items:center;justify-content:space-between;gap:12px}.topname{font-weight:900;color:var(--navy);font-size:18px}.top small{color:#4a6867}.topright{display:flex;align-items:center;gap:9px;font-size:12px;font-weight:900;color:#425e64;transform:translateY(9px);margin-right:4px}.meter{height:6px;background:#e1e7e6;border-radius:9px;overflow:hidden;margin:9px 0 0}.meter>span{display:block;height:100%;width:20%;background:linear-gradient(90deg,#046a64,#22ad8d);border-radius:9px;transition:width .25s}.voice{width:64px;height:64px;border:0;border-radius:50%;background:radial-gradient(circle at 34% 28%,#f9e8bf 0%,#dcb771 65%,#c4a062 100%);color:#0f2e4f;box-shadow:0 0 0 2px #c5a46c75,0 6px 20px #c5a46c60;cursor:pointer;font-size:30px;animation:voicePulse 2.15s ease-in-out infinite;position:relative;flex:none;isolation:isolate;-webkit-tap-highlight-color:transparent}\n.voice::before{content:'';position:absolute;inset:-5px;border-radius:50%;box-shadow:0 0 19px 8px #dcb773a6,0 0 0 5px #d7b47266;pointer-events:none;animation:voiceGlow 2.15s ease-in-out infinite;z-index:-1}\n.voice.playing{animation:none;background:#d8b97e;box-shadow:0 0 0 3px #c5a46c99,0 0 17px 5px #c5a46c8c}\n.voice.playing::before{animation:none;box-shadow:0 0 16px 5px #c5a46c85}\n.voice:focus-visible{outline:3px solid #074d51;outline-offset:6px}\n@keyframes voicePulse{0%,100%{transform:scale(1)}45%{transform:scale(1.22)}74%{transform:scale(.94)}87%{transform:scale(1.08)}}\n@keyframes voiceGlow{0%,100%{opacity:.38;transform:scale(.92)}48%{opacity:1;transform:scale(1.16)}76%{opacity:.56;transform:scale(1.01)}}\n.voice-hint{margin:11px 0 1px;padding:9px 11px;background:#faf6ed;border:1px solid #e8d7b3;border-radius:12px;font-size:12px;color:#3c5a60;line-height:1.45}\n.voice-hint strong{color:#0f2e4f}.voice-hint[hidden]{display:none}\n@media(max-width:420px){.voice{width:58px;height:58px;font-size:27px}#listen.voice{top:21px;right:21px}.topright{gap:7px;transform:none;margin-right:3px}.topname{font-size:17px}.top{padding-bottom:12px}}\n@media(prefers-reduced-motion:reduce){.voice,.voice::before,.meter>span{animation:none!important;transition:none!important}}\n.stage-shell{position:relative;max-width:560px;margin:0 auto}\n#listen.voice{position:absolute;top:23px;right:21px;z-index:8}\n.stage{max-width:560px;margin:0 auto;padding:10px 14px 32px}.poster{display:block;width:100%;height:auto;border-radius:6px}.slice{position:relative;overflow:hidden;width:100%;border-radius:6px}.slice img{position:absolute;display:block;top:0;left:0;width:100%;height:auto;max-width:none}.subcard{background:#fff;border-radius:20px;box-shadow:0 4px 25px #142f4020;border:1px solid #e7ddcf;padding:18px;margin:14px 0;display:grid;gap:12px}.subcard h3{margin:0;font-size:18px}.tiny{font-size:13px;color:#516b70}.cursive{font-style:italic;color:#6f7269}.gaugeWrap{margin:auto;max-width:480px;width:100%}.gauge{width:100%;height:auto;cursor:pointer;touch-action:none;display:block;outline:0}.gauge:focus-visible{outline:3px solid #c5a46c;outline-offset:3px;border-radius:12px}.gauge-value{font-size:25px;font-weight:900;text-align:center;color:var(--navy);margin:-10px 0 4px}.adjust{accent-color:#c8a04a;width:100%;height:26px;cursor:pointer}.gaugeStatus{font-size:13px;margin-top:0;text-align:center;color:#496365}.risk{color:#a6322c;font-weight:800}.actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.btn{background:var(--gold);color:var(--navy);border:1px solid #bea16b;border-radius:13px;padding:13px 14px;font:700 15px system-ui;min-height:52px;cursor:pointer}.btn.secondary{background:#fff;border-color:#789d93;color:#075857}.btn.dark{background:var(--navy);color:white;border:0}.btn:disabled{opacity:.45;cursor:not-allowed}.timer{font-size:clamp(36px,9vw,60px);font-weight:900;font-variant-numeric:tabular-nums;color:var(--navy);text-align:center;letter-spacing:.02em;background:#f7f3ec;padding:12px;border-radius:17px}.count{font-size:32px;font-weight:900;font-variant-numeric:tabular-nums;color:var(--navy)}.tag{display:inline-block;padding:5px 9px;border-radius:30px;font-weight:750;background:#e7f3ea;color:#126859;font-size:12px}.stops{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.stopDot{border-radius:50%;aspect-ratio:1;background:#eef0ee;border:2px solid #b9c5c4;color:#8da29d;display:grid;place-items:center;font-weight:800;font-size:14px}.stopDot.done{background:var(--forest);border-color:var(--forest);color:white}.field{display:grid;gap:7px}.field label{font-size:14px;color:var(--navy);font-weight:800}.field input,.field select,.field textarea{font:inherit;font-size:16px;border:1px solid #bfcfca;border-radius:11px;padding:11px;color:var(--navy);background:#fff;min-height:46px;width:100%}.field textarea{resize:vertical;min-height:86px}.notice{border-left:4px solid var(--gold);background:#f6f2e8;border-radius:10px;padding:11px 14px;font-size:13px;color:#47626b}.warning{color:#a44435}.nav{position:sticky;z-index:9;bottom:0;display:grid;grid-template-columns:minmax(0,34%) minmax(0,1fr);gap:12px;border-top:1px solid #e6dfd1;background:#fffefaef;backdrop-filter:blur(10px);padding:12px max(14px,env(safe-area-inset-right)) max(13px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left))}.nav .btn{width:100%;font-size:15px;min-width:0;max-width:100%;white-space:normal;overflow-wrap:normal;line-height:1.22}.nav .btn:not(.secondary){background:#c5a46c}.history li{font-size:13px;margin:8px 0}.copyright{font-size:11px;text-align:center;color:#74838b;padding:14px 10px 25px}.hidden{display:none!important}@media(max-width:420px){.outer{padding:0}.stage{padding:6px 8px 25px}.top{padding:9px 12px 7px}.subcard{border-radius:15px;padding:13px;margin:10px 2px}.nav{padding:9px 10px max(12px,env(safe-area-inset-bottom));gap:8px}.nav #next{font-size:14px;padding:10px 7px;line-height:1.2}}\n\n:host{position:fixed;inset:0;z-index:10050;overflow:auto;overscroll-behavior:contain;background:#edf2ed;display:block}\n:host([hidden]){display:none!important}\n.ecV2-exit{display:block;margin:10px 0 0;border:1px solid #d9c28f;background:#fff9ed;color:#0f2e4f;border-radius:999px;padding:8px 14px;font:800 12px system-ui,-apple-system,sans-serif;cursor:pointer;min-height:35px}\n.ecV2-exit:focus-visible{outline:3px solid #05756d}\n"+"\n.squeeze-demonstration video{display:block;width:min(100%,225px);aspect-ratio:9/16;height:auto;max-height:390px;object-fit:contain;background:#132238;border-radius:15px;margin:7px auto 9px;box-shadow:0 10px 25px rgba(15,46,79,.18)}\n.squeeze-demonstration h3{color:#0f2e4f!important}\n.squeeze-demonstration .tiny{line-height:1.6;color:#355568}\n.squeeze-demonstration{background:linear-gradient(145deg,#fffdf9,#f7f2e7);border:1px solid #dbc18b;text-align:center;padding:15px 12px;box-shadow:0 5px 22px #142f4014}\n.squeeze-demonstration h3{font-size:16px;letter-spacing:.01em;color:#0f2e4f}\n.squeeze-demonstration .notice{text-align:left;margin:2px 0}\n.squeeze-step-visual .slice{border-radius:5px}\n.squeeze-mini-demo{margin:12px 2px 4px;padding:9px 12px;border:1px solid #d7c49e;background:#fdf9f1;border-radius:14px;color:#0f2e4f}\n.squeeze-mini-demo summary{cursor:pointer;font-weight:800;font-size:14px;min-height:42px;display:flex;align-items:center;gap:8px;list-style-position:inside}\n.squeeze-mini-demo .squeeze-mini-body{text-align:center;padding:8px 0}\n.squeeze-mini-demo video{display:block;width:min(100%,172px);aspect-ratio:9/16;height:auto;max-height:305px;object-fit:contain;margin:0 auto 9px;border-radius:12px;background:#132238}\n.squeeze-mini-demo p{font-size:12px;line-height:1.5;color:#4f5e67;margin:7px 2px}\n@media(prefers-reduced-motion:reduce){.squeeze-mini-demo *{animation:none!important}}\n"+'</style>'+"<div class=\"outer\"><div class=\"app\"><header class=\"top\"><div class=\"topline\"><div><div class=\"topname\">SPM · Técnica combinada</div><small id=\"stepText\">Paso 1 de 5 · Introducción</small></div><div class=\"topright\"><span id=\"percent\">20%</span></div></div><div class=\"meter\" role=\"progressbar\" aria-label=\"Progreso de la técnica\" aria-valuemin=\"1\" aria-valuemax=\"5\" aria-valuenow=\"1\" id=\"meter\"><span id=\"bar\"></span></div><button class=\"ecV2-exit\" type=\"button\" id=\"exit\" aria-label=\"Volver a Hoy\">← Volver a Hoy</button><p id=\"voiceHint\" class=\"voice-hint\"><strong>🔊 Activa la bocina</strong> para seguir las instrucciones de cada paso.</p></header><div class=\"stage-shell\"><button type=\"button\" class=\"voice\" id=\"listen\" aria-label=\"Escuchar explicación y recomendaciones del paso\" aria-pressed=\"false\" title=\"Toca para escuchar las instrucciones\">🔊</button><main id=\"stage\" class=\"stage\" tabindex=\"-1\" aria-live=\"polite\"></main></div><nav class=\"nav\"><button type=\"button\" id=\"prev\" class=\"btn secondary\">Anterior</button><button type=\"button\" id=\"next\" class=\"btn\">Siguiente</button></nav><footer class=\"copyright\">SPM Digital Wellness · Entrenamiento de control eyaculatorio · 28 días</footer></div></div>";
document.body.appendChild(host);
const combinedCss=document.createElement('style');combinedCss.textContent=".balance-list{display:grid;gap:10px}.balance-item{display:grid;gap:5px;border:1px solid #ddcda9;background:#fbf8f0;border-radius:13px;padding:12px 14px}.balance-item b{color:#0f2e4f}.balance-item span{font-size:13px;color:#35565e}.balance-item small{font-size:12px;color:#597078}";shadow.appendChild(combinedCss);

const POSTERS=["assets/ep/combined/combinada-intro.webp","assets/ep/combined/combinada-escala.webp","assets/ep/combined/combinada-pasos.webp"];
const VOICES=["Semana tres: integra lo aprendido. Ya reconociste el ascenso de la excitación y practicaste la pausa, con y sin compresión. Ahora explorarás una activación breve y consciente del piso pélvico, seguida de una relajación completa. Al aumentar la dificultad es normal que el ejercicio se sienta menos fácil. Esto no significa necesariamente que hayas perdido lo aprendido. Lo importante es consolidar la percepción, la coordinación y tu capacidad de regularte sin forzar resultados.","Reconoce tu punto de partida. Cero significa ausencia de excitación y diez, que el orgasmo o la eyaculación son prácticamente inevitables. Cerca de siete u ocho sobre diez puedes anticipar una pausa, pero cada persona tiene señales diferentes. Prueba mover la escala según lo que sientes. La cifra orienta: no es un objetivo ni un examen.","Para esta práctica, busca un lugar privado, cómodo y tranquilo, sin interrupciones, e inicia la autoestimulación o masturbación. Paso uno: aumenta la excitación de manera gradual y observa tus señales. Paso dos: al acercarte a tu zona alta, aproximadamente siete u ocho sobre diez, reduce el ritmo y detén completamente la estimulación antes del punto de no retorno. Paso tres: activa suavemente el piso pélvico, como una pequeña elevación del periné, durante dos o tres segundos. Respira normalmente, sin apretar el abdomen o los glúteos y sin hacer fuerza. Mira las ilustraciones y el microvideo para identificar la zona. Paso cuatro: suelta por completo la musculatura, continúa respirando y espera a que la excitación disminuya. Si contraer aumenta la urgencia, omite la contracción y prioriza la pausa con relajación. Paso cinco: reanuda gradualmente cuando recuperes sensación de control. Repite según tu tolerancia. No intentes detener a la fuerza una eyaculación inevitable. Si aparece dolor o irritación, suspende la práctica.","Ahora ponlo en práctica. Ajusta tu nivel de excitación según lo que sientes. El cronómetro es opcional. Detén la estimulación oportunamente; prueba una contracción pélvica suave y breve, luego suelta completamente. Registra un ciclo solo si lo realizaste. No mantengas contracciones prolongadas ni contengas el aire. Si la contracción aumenta la urgencia, utiliza solo la pausa, la respiración y la relajación.","Al terminar, evalúa cómo percibiste el control, si el ejercicio fue fácil o difícil y si sentiste molestias o dolor. Señala también si notaste algún cambio o todavía no puedes identificarlo. Una técnica más exigente puede sentirse igual o más difícil aunque se estén entrenando habilidades nuevas. En la cuarta semana volverás a practicar Stop–Start, Stop–Squeeze y la técnica combinada para comparar experiencias sin asumir una mejoría automática."];
const NAMES=['Introducción','Punto de partida','Activa y suelta','Práctica guiada','Tu evaluación'];
const $=q=>shadow.querySelector(q);
let step=0,arousal=5,running=false,elapsed=0,startedAt=0,startMark=0,tick=null,stops=0,sessionSaved=false,voiceActive=false;
let stored=[],origin='library',scope='',day=15,meta={week:3,session:1},sessionStarted=false;
let historyReady=false,historyError=false,recordFeeling='',recordNotes='',recordDifficulty='',recordDiscomfort='',recordProgress='',epoch=0,busy=false,priorRecord=null,cueTimer=null;
const SCHEDULE={15:{week:3,session:1},17:{week:3,session:2},19:{week:3,session:3},26:{week:4,session:3}};
const DAYS_BY_WEEK={3:[15,17,19],4:[1,3,5,8,10,12,15,17,19,22,24,26]};
function rawPhoto(index){return `<img class="poster" src="${POSTERS[index]}" alt="Lámina SPM técnica combinada ${index+1}: ${NAMES[index]}" decoding="async">`}
function imageSlice(index,start,end){const h=1173*(end-start);return `<div class="slice" style="aspect-ratio:660/${h.toFixed(3)}"><img src="${POSTERS[index]}" style="transform:translateY(-${(start*100).toFixed(4)}%)" alt="Ilustración SPM: ${NAMES[index]}" decoding="async"></div>`}
function makeGauge(){const c=['#14976e','#1aa580','#31b68e','#50bd94','#8ac86c','#d5d866','#f7d25f','#f3b94e','#ed8153','#e95b4c'];let seg='',labels='';const cx=150,cy=151,rad=113;for(let i=0;i<10;i++){const ang1=(180-i*18)*Math.PI/180,ang2=(180-(i+1)*18)*Math.PI/180,x1=cx+rad*Math.cos(ang1),y1=cy-rad*Math.sin(ang1),x2=cx+rad*Math.cos(ang2),y2=cy-rad*Math.sin(ang2);seg+=`<path d="M${x1.toFixed(2)} ${y1.toFixed(2)} A${rad} ${rad} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}" stroke="${c[i]}" stroke-width="27" fill="none"/>`;}for(let i=0;i<=10;i++){const a=(180-i*18)*Math.PI/180,r=139,x=cx+r*Math.cos(a),y=cy-r*Math.sin(a)+5;labels+=`<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" fill="${i>=8?'#aa3229':'#0d615d'}" font-size="12.5" font-weight="800" text-anchor="middle">${i}</text>`;}return `<div class="gaugeWrap"><svg class="gauge" viewBox="0 0 300 178" role="slider" tabindex="0" aria-label="Ajustar el nivel de excitación" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${arousal}"><title>Escala 0 a 10. Selecciona tu nivel de excitación moviendo la aguja.</title>${seg}${labels}<line class="needle" x1="150" y1="151" x2="150" y2="58" stroke="#0f2e4f" stroke-width="5.5" stroke-linecap="round"/><circle cx="150" cy="151" r="11" fill="#d1a650" stroke="#fff" stroke-width="3"/></svg><div class="gauge-value">Excitación <span data-arousal>${arousal}</span>/10</div><input class="adjust" type="range" min="0" max="10" step="1" value="${arousal}" aria-label="Nivel de excitación del 0 al 10"><p class="gaugeStatus" data-risk>${arousal>=8?'Zona alta: anticípate antes del punto de no retorno.':arousal<=3?'Observa con calma cómo cambian tus sensaciones.':'Reconoce el ascenso y regula con anticipación.'}</p></div>`}
function secondPage(){return imageSlice(1,0,.39)+`<section class="subcard" aria-label="Escala interactiva"><h3>Prueba tu punto de partida</h3>${makeGauge()}<div class="notice">Aproximadamente entre 7 y 8/10, prepárate para pausar y regular. La cifra es orientativa.</div></section>`+imageSlice(1,.72,1)}
function demoVideo(id,compact=false){return `<video id="${id}" data-squeeze-video controls playsinline preload="${compact?'none':'metadata'}" src="assets/videos/techniques/pelvic-contraction.mp4" poster="assets/videos/techniques/pelvic-contraction.jpg" aria-label="Demostración de contracción del piso pélvico · 5 segundos"></video>`}

function thirdPage(){
 return rawPhoto(2)+
 '<section class="subcard squeeze-demonstration" aria-label="Apoyo visual de activación pélvica"><h3>▶ Observa la activación · 5 segundos</h3><p class="tiny">El microvideo acompaña las ilustraciones; no reemplaza los pasos.</p>'+
 demoVideo('combinedDemo')+
 '<p class="notice">Activa suavemente el piso pélvico por 2–3 segundos y suelta por completo. Evita apretar abdomen o glúteos y contener el aire. Si aumenta la urgencia, prioriza pausa y relajación.</p><p class="tiny squeeze-video-error" hidden role="status">El video no está disponible; utiliza la ilustración y el audio clínico.</p></section>';
}
function pauseDemo(){shadow.querySelectorAll('video[data-squeeze-video]').forEach(v=>v.pause());}
function fourthPage(){
 return '<section class="subcard"><span class="tag">SEMANA '+meta.week+' · PRÁCTICA GUIADA</span><h3>Regula y activa con control</h3><p class="tiny">Pausa antes del punto crítico. Si resulta cómodo, activa el piso pélvico brevemente; después relaja por completo.</p>'+makeGauge()+
 '<div class="timer" id="timer" aria-live="off">00:00</div><div class="actions"><button class="btn" id="timerBtn" type="button">▶ Iniciar</button><button class="btn secondary" id="resetBtn" type="button">↺ Reiniciar</button></div>'+
 '<div class="field"><label>Ayuda opcional para coordinar la contracción</label><button class="btn secondary" id="cueBtn" type="button">▶ Contrae y suelta</button><p class="notice" id="cueStatus" role="status">Respira normalmente. La contracción es suave y breve; este apoyo no es obligatorio para practicar.</p></div>'+
 '<div class="actions" style="align-items:center"><div><div class="tiny">Ciclos realizados</div><div class="count" id="count">'+stops+'</div></div><button type="button" class="btn dark" id="registerBtn">✓ Registrar ciclo</button></div>'+
 '<div id="stopGrid" class="stops">'+Array.from({length:6},(_,i)=>'<span class="stopDot '+(i<stops?'done':'')+'">'+(i<stops?'✓':i+1)+'</span>').join('')+'</div>'+
 '<p class="notice" id="trainingMsg">Una pausa anticipada y una relajación completa cuentan más que el número de ciclos. Ante dolor, detén la práctica.</p><button type="button" class="btn secondary" id="confirmPracticeBtn">✓ Confirmar que realicé la práctica</button><p class="tiny" id="confirmationStatus" role="status"></p></section>'+
 '<details class="squeeze-mini-demo"><summary>▶ Repasar el video · 5 s (opcional)</summary><div class="squeeze-mini-body">'+demoVideo('combinedDemoMini',true)+'<p>Apoyo visual; no registra un ciclo.</p><p class="squeeze-video-error" hidden role="status">No fue posible cargar el video.</p></div></details>';
}
const formatFeeling={mejor:'Mayor control percibido',similar:'Control similar',dificil:'Todavía difícil'};
const formatDifficulty={facil:'Fácil',intermedia:'Intermedia',dificil:'Difícil'};
const formatPain={ninguna:'Sin molestias',molestia:'Molestia',dolor:'Dolor'};
function week4Balance(){
 if(meta.week!==4)return '<p class="notice">Aumentar la dificultad no implica perder lo aprendido. Las repeticiones ayudan a consolidar habilidades; en la semana cuatro podrás contrastar las tres técnicas.</p>';
 const names={squeeze:'Stop–Squeeze',startstop:'Stop–Start',combined:'Técnica combinada'};
 const cards=Object.keys(names).map(tech=>{
  const prior=stored.filter(r=>r.tech===tech&&r.day<22);
  const recent=stored.filter(r=>r.tech===tech&&r.day>=22);
  const latest=recent.at(-1)||prior.at(-1);
  const label=latest?.difficulty?formatDifficulty[latest.difficulty]:latest?.feeling?formatFeeling[latest.feeling]:'Sin autoevaluación comparable';
  const symptom=latest?.discomfort?formatPain[latest.discomfort]:'Sin registro de molestias';
  return '<div class="balance-item"><b>'+names[tech]+'</b><span>'+prior.length+' práctica(s) previas · '+recent.length+' de consolidación</span><small>Última percepción: '+label+' · '+symptom+'</small></div>';
 });
 return '<div class="balance-list">'+cards.join('')+'</div><p class="notice">Compara la anticipación de la pausa, la coordinación y la recuperación, además de lo que percibas en tu vida sexual si hubo oportunidades naturales. No se presupone una mejoría ni se mide únicamente por minutos. Si hubo dolor o dificultades persistentes, solicita una valoración profesional.</p>';
}
function fifthPage(){
 const old=priorRecord?'<p class="notice">Este día ya tiene un registro previo de otra técnica, que se conserva sin modificaciones.</p>':'';
 return '<section class="subcard"><span class="tag">EVALUACIÓN DE TU PRÁCTICA</span><h3>¿Cómo terminaste hoy?</h3><p class="tiny">Responde según tu experiencia. No se espera un resultado perfecto.</p>'+
 '<div class="field"><label for="feeling">Control percibido</label><select id="feeling"><option value="">Selecciona</option><option value="mejor">Mejor que antes</option><option value="similar">Similar a otras prácticas</option><option value="dificil">Todavía me cuesta anticiparme</option></select></div>'+
 '<div class="field"><label for="difficulty">Dificultad de la técnica</label><select id="difficulty"><option value="">Selecciona</option><option value="facil">Fácil</option><option value="intermedia">Intermedia</option><option value="dificil">Difícil</option></select></div>'+
 '<div class="field"><label for="discomfort">¿Experimentaste molestia o dolor?</label><select id="discomfort"><option value="">Selecciona</option><option value="ninguna">No</option><option value="molestia">Sí, molestia</option><option value="dolor">Sí, dolor</option></select></div>'+
 '<div class="field"><label for="progress">¿Notaste algún cambio?</label><select id="progress"><option value="">Selecciona</option><option value="si">Sí, percibo alguna diferencia</option><option value="todavia_no">Todavía no noto cambios</option><option value="no_seguro">No estoy seguro</option></select></div>'+
 '<div class="field"><label for="notes">Observación (opcional)</label><textarea id="notes" rows="2" placeholder="¿Qué aprendiste o qué deseas practicar más?"></textarea></div>'+
 '<p class="tiny">Ciclos realizados: <b>'+stops+'</b> · Excitación final: <b>'+arousal+'/10</b> · Tiempo opcional: <b>'+timeText(elapsed)+'</b></p>'+old+
 '<button id="saveBtn" type="button" class="btn dark" '+(sessionSaved||priorRecord?'disabled':'')+'>'+(priorRecord?'Registro previo conservado':sessionSaved?'✓ Sesión guardada':'Guardar evaluación')+'</button><p id="saveStatus" role="status" class="tiny"></p></section>'+
 '<section class="subcard"><h3>'+(meta.week===4?'Balance de tus cuatro semanas':'Consolidar lo aprendido')+'</h3><div id="balance">'+week4Balance()+'</div></section>'+
 '<section class="subcard"><h3>El aprendizaje es progresivo</h3><p class="tiny">Cuando una técnica incorpora más dificultad, puedes sentir que sigues en el mismo punto. La repetición ayuda a consolidar habilidades, pero el avance no es lineal ni está garantizado. En la semana cuatro compararás las tres técnicas y las experiencias que hayas tenido en tu actividad sexual.</p></section>';
}
function render(){
 pauseDemo();clearCue();
 if(step!==3&&running){elapsed=startMark+(performance.now()-startedAt)/1000;running=false;if(tick)cancelAnimationFrame(tick);tick=null}
 stopVoice();
 $('#stepText').textContent='Paso '+(step+1)+' de 5 · '+NAMES[step];
 $('#percent').textContent=(step+1)*20+'%';$('#bar').style.width=(step+1)*20+'%';$('#meter').setAttribute('aria-valuenow',step+1);
 $('#voiceHint').hidden=step!==0;$('#listen').setAttribute('aria-label','Escuchar la guía del paso '+(step+1));
 $('#prev').disabled=step===0;$('#next').textContent=step===4?'Finalizar':'Siguiente';
 $('#next').setAttribute('aria-label',step===4?'Finalizar y volver a Hoy':'Siguiente paso');
 $('#stage').innerHTML=step===0?rawPhoto(0):step===1?secondPage():step===2?thirdPage():step===3?fourthPage():fifthPage();
 $('#stage').focus({preventScroll:true});
 if(step===1||step===3){
  paintGauges();
  $('#stage').querySelectorAll('.adjust').forEach(input=>input.addEventListener('input',e=>setArousal(e.target.value)));
  $('#stage').querySelectorAll('.gauge').forEach(el=>{
   el.addEventListener('pointerdown',e=>{if(el.setPointerCapture)try{el.setPointerCapture(e.pointerId)}catch{}updatePointer(e,el)});
   el.addEventListener('pointermove',e=>{if(e.buttons)updatePointer(e,el)});
   el.addEventListener('keydown',e=>{let n=arousal;if(['ArrowLeft','ArrowDown'].includes(e.key))n--;else if(['ArrowRight','ArrowUp'].includes(e.key))n++;else if(e.key==='Home')n=0;else if(e.key==='End')n=10;else return;e.preventDefault();setArousal(n);});
  });
 }
 if(step===2||step===3)shadow.querySelectorAll('video[data-squeeze-video]').forEach(video=>{
  video.addEventListener('play',()=>{window.SPM_TECHNIQUE_CLIPS?.pause?.();stopVoice()});
  video.addEventListener('error',()=>{const note=video.closest('.squeeze-demonstration,.squeeze-mini-demo')?.querySelector('.squeeze-video-error');if(note)note.hidden=false;});
 });
 if(step===3){$('#timerBtn').onclick=toggleTimer;$('#resetBtn').onclick=resetTimer;$('#registerBtn').onclick=registerStop;$('#cueBtn').onclick=cuePelvic;$('#confirmPracticeBtn').onclick=()=>{sessionStarted=true;$('#confirmPracticeBtn').textContent='✓ Práctica confirmada';$('#confirmationStatus').textContent='Puedes registrar cómo te sentiste al terminar, aunque no hayas logrado un ciclo.'};updateTimerUI();}
 if(step===4){
  $('#saveBtn').onclick=saveRecord;
  for(const [id,value,cb] of [['feeling',recordFeeling,v=>recordFeeling=v],['difficulty',recordDifficulty,v=>recordDifficulty=v],['discomfort',recordDiscomfort,v=>recordDiscomfort=v],['progress',recordProgress,v=>recordProgress=v],['notes',recordNotes,v=>recordNotes=v]]){
   const el=$('#'+id);el.value=value;el.addEventListener('change',e=>cb(e.target.value));
  }
  if(origin!=='dailyPlan')$('#saveStatus').textContent='Vista educativa: abre la sesión desde Hoy para guardar tu evaluación.';
  else if(historyError)$('#saveStatus').textContent='No se pudieron recuperar tus registros. Regresa a Hoy y reintenta.';
  else if(priorRecord)$('#saveStatus').textContent='Se mantiene el registro anterior sin modificaciones.';
 }
 host.scrollTop=0;
}
function clearCue(){if(cueTimer){clearTimeout(cueTimer);cueTimer=null;}}
function cuePelvic(){
 if(step!==3||sessionSaved)return;
 clearCue();const el=$('#cueStatus');if(!el)return;
 el.textContent='Contrae suavemente el piso pélvico mientras respiras. Evita apretar glúteos o abdomen.';
 cueTimer=setTimeout(()=>{cueTimer=null;const current=$('#cueStatus');if(current&&step===3)current.textContent='Suelta por completo, respira y espera a recuperar una sensación cómoda.';},2600);
}

function setArousal(v){arousal=Math.min(10,Math.max(0,Math.round(Number(v)||0)));paintGauges();shadow.querySelectorAll('.adjust').forEach(x=>x.value=String(arousal));shadow.querySelectorAll('[data-arousal]').forEach(x=>x.textContent=String(arousal));shadow.querySelectorAll('[data-risk]').forEach(x=>x.textContent=arousal>=8?'Zona alta: anticípate antes del punto de no retorno.':arousal<=3?'Observa con calma cómo cambian tus sensaciones.':'Reconoce el ascenso y regula con anticipación.')}
function paintGauges(){shadow.querySelectorAll('.gauge').forEach(svg=>{const a=(180-18*arousal)*Math.PI/180;const x=150+95*Math.cos(a),y=151-95*Math.sin(a);const line=svg.querySelector('.needle');line.setAttribute('x2',String(x));line.setAttribute('y2',String(y));svg.setAttribute('aria-valuenow',String(arousal));svg.setAttribute('aria-valuetext',arousal+' sobre diez')})}
function updatePointer(event,svg){const rect=svg.getBoundingClientRect();const px=(event.clientX-rect.left)*300/rect.width,py=(event.clientY-rect.top)*178/rect.height;const angle=Math.atan2(151-py,px-150)*180/Math.PI;setArousal(Math.round((180-Math.min(180,Math.max(0,angle)))/18))}
function timeText(sec){const s=Math.floor(sec);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function updateTimerUI(){
 const el=$('#timer');if(el)el.textContent=timeText(elapsed);
 const btn=$('#timerBtn');if(btn){btn.textContent=running?'⏸ Pausar':(elapsed>0?'▶ Continuar':'▶ Iniciar');btn.disabled=sessionSaved;}
 const reg=$('#registerBtn');if(reg)reg.disabled=stops>=6||sessionSaved;const confirm=$('#confirmPracticeBtn');if(confirm){confirm.disabled=sessionSaved;confirm.textContent=sessionStarted?'✓ Práctica confirmada':'✓ Confirmar que realicé la práctica';}
 const reset=$('#resetBtn');if(reset)reset.disabled=sessionSaved;
}
function tickTimer(){if(!running)return;elapsed=startMark+(performance.now()-startedAt)/1000;updateTimerUI();tick=requestAnimationFrame(tickTimer)}
function toggleTimer(){if(sessionSaved)return;if(!running)sessionStarted=true;running=!running;if(running){startedAt=performance.now();startMark=elapsed;tickTimer()}else{if(tick)cancelAnimationFrame(tick);tick=null}updateTimerUI()}
function resetTimer(){
 if(sessionSaved)return;clearCue();if(tick)cancelAnimationFrame(tick);
 running=false;elapsed=0;stops=0;sessionStarted=false;updateTimerUI();
 const cc=$('#count');if(cc)cc.textContent=String(stops);
 $('#stopGrid').innerHTML=Array.from({length:6},(_,i)=>'<span class="stopDot">'+(i+1)+'</span>').join('');
 $('#trainingMsg').textContent='Una pausa anticipada y una relajación completa cuentan más que el número de ciclos. Ante dolor, detén la práctica.';
}
function registerStop(){
 if(stops>=6||sessionSaved)return;
 sessionStarted=true;stops++;$('#count').textContent=String(stops);
 $('#stopGrid').innerHTML=Array.from({length:6},(_,i)=>'<span class="stopDot '+(i<stops?'done':'')+'">'+(i<stops?'✓':i+1)+'</span>').join('');
 $('#trainingMsg').textContent=stops>=4?'No necesitas forzar más ciclos. Prioriza una contracción suave seguida de relajación.':'Ciclo '+stops+' registrado. Pausa a tiempo, contrae solo si es cómodo y relaja completamente antes de reanudar.';
 updateTimerUI();
}
async function saveRecord(){
 if(busy||sessionSaved)return;
 const status=$('#saveStatus'),button=$('#saveBtn');
 if(priorRecord){status.textContent='Este día ya tiene una práctica anterior que se conserva sin sobrescribirla.';return;}
 const values={feeling:$('#feeling')?.value,difficulty:$('#difficulty')?.value,discomfort:$('#discomfort')?.value,progress:$('#progress')?.value};
 const missing=Object.keys(values).find(k=>!values[k]);
 if(missing){status.textContent='Responde las cuatro preguntas breves antes de guardar.';$('#'+missing).focus();return;}
 if(origin!=='dailyPlan'){status.textContent='Abre la práctica desde Hoy para registrar la evaluación.';return;}
 if(!sessionStarted){status.textContent='Confirma que realizaste la práctica desde la pantalla guiada. Puedes registrar tu experiencia aunque no hayas completado ningún ciclo.';return;}
 if(!historyReady){status.textContent='No pudimos comprobar tus registros. Regresa a Hoy y vuelve a entrar para reintentar.';return;}
 const c=window.SPM_RESOURCE_CONTEXT?.(),captured=c?.userId+':'+c?.planId;
 if(!c||captured!==scope||Number(c.day)!==day||c.primary!=='ejaculation'||c.safety!=='none'||c.flags?.length||c.checkins?.some(x=>x.new_safety_flag===true)||window.SPM_DAILY_PRACTICE?.restricted?.(c,'main')){
  status.textContent='La sesión o la indicación de seguridad cambió. Regresa a Hoy.';return;
 }
 const assigned=window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(a=>a.id==='main'&&a.kind==='ejaculation');
 if(!assigned||!window.SPM_DAILY_PRACTICE?.saveActivity){status.textContent='La práctica no está asignada o no puede guardarse.';return;}
 const record={day,week:meta.week,session:meta.session,tech:'combined',stops,seconds:Math.floor(elapsed),arousal,feeling:values.feeling,difficulty:values.difficulty,discomfort:values.discomfort,progressPerceived:values.progress,notes:$('#notes').value.trim(),date:new Date().toISOString()};
 busy=true;button.disabled=true;status.textContent='Guardando tu experiencia…';
 try{
  const remote=await window.SPM_DAILY_RECORDS.read(scope,day);
  if(host.hidden||scope!==captured||Number(window.SPM_RESOURCE_CONTEXT?.()?.day)!==day)throw Error('La sesión cambió');
  if(remote?.main?.completed===true){
   priorRecord=remote.main;button.disabled=true;button.textContent='Registro previo conservado';
   status.textContent='Ya había una práctica guardada este día; se conserva sin sobreescribirla.';return;
  }
  await window.SPM_DAILY_PRACTICE.saveActivity('main',record,scope,day);
  if(host.hidden||scope!==captured)return;
  sessionSaved=true;recordFeeling=record.feeling;recordDifficulty=record.difficulty;recordDiscomfort=record.discomfort;recordProgress=record.progressPerceived;recordNotes=record.notes;
  stored=stored.filter(r=>r.day!==day);stored.push({...record,completed:true});
  button.textContent='✓ Sesión guardada';
  status.textContent=values.discomfort==='dolor'?'Guardada. Por el dolor reportado, evita repetir la contracción y consulta si persiste.':'Guardada en tu ruta de 28 días ✓';
  const balance=$('#balance');if(balance)balance.innerHTML=week4Balance();
 }catch{
  if(!priorRecord){button.disabled=false;status.textContent='No fue posible guardar. Tus respuestas permanecen aquí para reintentar.';}
 }finally{busy=false;}
}
function stopVoice(){if(window.speechSynthesis)window.speechSynthesis.cancel();voiceActive=false;$('#listen').classList.remove('playing');$('#listen').setAttribute('aria-pressed','false')}
function speak(){if(voiceActive){stopVoice();return}stopVoice();if(!window.speechSynthesis){alert('Este navegador no permite reproducir voz.');return}const utter=new SpeechSynthesisUtterance(VOICES[step]);utter.lang='es-CO';utter.rate=.95;const v=speechSynthesis.getVoices().find(x=>x.lang.toLowerCase()==='es-co')||speechSynthesis.getVoices().find(x=>x.lang.toLowerCase().startsWith('es'));if(v)utter.voice=v;voiceActive=true;$('#listen').classList.add('playing');$('#listen').setAttribute('aria-pressed','true');utter.onend=utter.onerror=()=>{voiceActive=false;$('#listen').classList.remove('playing');$('#listen').setAttribute('aria-pressed','false')};speechSynthesis.speak(utter)}
function finishAndReturn(){if(origin==='dailyPlan'&&sessionStarted&&!sessionSaved&&!priorRecord&&typeof window.confirm==='function'&&!window.confirm('La sesión aún no está guardada. ¿Quieres salir sin registrar la práctica?'))return;close();}
$('#exit').onclick=()=>close();$('#listen').onclick=speak;$('#prev').onclick=()=>{if(step>0){step--;render()}};$('#next').onclick=()=>{if(step===4){finishAndReturn()}else{step++;render()}};window.addEventListener('pagehide',()=>{stopVoice();if(tick)cancelAnimationFrame(tick)});
async function loadHistory(token){
 const captured=scope,dates=DAYS_BY_WEEK[meta.week]||[day];
 try{
  const today=await window.SPM_DAILY_RECORDS.read(captured,day);
  const previous=await Promise.allSettled(dates.filter(d=>d!==day).map(async d=>({day:d,result:await window.SPM_DAILY_RECORDS.read(captured,d)})));
  const entries=[{day,result:today},...previous.filter(r=>r.status==='fulfilled').map(r=>r.value)];
  if(token!==epoch||host.hidden||captured!==scope)return;
  stored=entries.map(x=>({day:x.day,...x.result?.main})).filter(r=>r.completed===true&&['startstop','squeeze','combined'].includes(r.tech));
  const current=entries.find(x=>x.day===day)?.result?.main;
  priorRecord=current?.completed===true&&current.tech!=='combined'?current:null;
  const mine=current?.completed===true&&current.tech==='combined'?current:null;
  if(mine&&!sessionStarted){
   sessionSaved=true;sessionStarted=true;
   stops=Number(mine.stops)||0;elapsed=Number(mine.seconds)||0;arousal=Number(mine.arousal)||5;
   recordFeeling=mine.feeling||'';recordDifficulty=mine.difficulty||'';recordDiscomfort=mine.discomfort||'';recordProgress=mine.progressPerceived||'';recordNotes=mine.notes||'';
  }
  historyReady=true;historyError=false;if(step===4)render();
 }catch{
  if(token!==epoch||host.hidden)return;historyError=true;historyReady=false;if(step===4)render();
 }
}
function open(targetDay=15,opts={}){
 const d=Number(targetDay);if(!SCHEDULE[d])return false;
 const c=window.SPM_RESOURCE_CONTEXT?.();
 const wantsDaily=opts.origin==='dailyPlan'||opts.origin!=='library'&&c?.primary==='ejaculation'&&Number(c.day)===d;
 if(wantsDaily){
  if(!c||Number(c.day)!==d||c.primary!=='ejaculation'||c.safety!=='none'||c.flags?.length||c.checkins?.some(x=>x.new_safety_flag===true)||window.SPM_DAILY_PRACTICE?.restricted?.(c,'main'))return false;
  const assigned=window.SPM_DAILY_PRACTICE?.assignments?.(c)?.find(a=>a.id==='main'&&a.kind==='ejaculation');if(!assigned)return false;
 }
 if(!host.hidden)close(false);
 step=0;arousal=5;running=false;elapsed=0;startedAt=startMark=0;stops=0;sessionSaved=false;voiceActive=false;sessionStarted=false;recordFeeling='';recordDifficulty='';recordDiscomfort='';recordProgress='';recordNotes='';busy=false;priorRecord=null;clearCue();
 origin=wantsDaily?'dailyPlan':'library';scope=wantsDaily?c.userId+':'+c.planId:'';day=d;meta=SCHEDULE[d];stored=[];historyReady=!wantsDaily;historyError=false;
 ++epoch;host.hidden=false;document.body.style.overflow='hidden';render();
 if(wantsDaily)void loadHistory(epoch);
 return true;
}
function close(returnToDay=true){
 if(host.hidden)return true;pauseDemo();clearCue();stopVoice();if(tick)cancelAnimationFrame(tick);tick=null;running=false;const wasDaily=origin==='dailyPlan';host.hidden=true;document.body.style.overflow='';epoch++;
 if(returnToDay&&wasDaily)window.SPM_DAILY_PRACTICE?.open?.({focus:false});
 return true;
}
window.addEventListener('spm:session-change',()=>{if(!host.hidden)close(false)});
window.addEventListener('spm:resourcecontext',()=>{if(host.hidden||origin!=='dailyPlan')return;const c=window.SPM_RESOURCE_CONTEXT?.();if(!c||scope!==c.userId+':'+c.planId||Number(c.day)!==day||c.primary!=='ejaculation')close(false)});
window.SPM_COMBINED_V1={open,close,scheduledDays:[15,17,19,26]};

})();