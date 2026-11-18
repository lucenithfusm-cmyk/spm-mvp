/* SPM Digital Wellness · Formularios táctiles de seguimiento · Días 14 / 28.
 * La imagen aprobada es la pantalla completa. Se conserva la escala 0–4,
 * el valor null (No evaluable), el guardado existente y el informe clínico.
 */
(()=>{'use strict';
if(window.SPM_CHECKPOINT_TOUCH)return;
const METRICS=[
 ['firmness','Firmeza, si pudiste observarla'],
 ['control','Control eyaculatorio, si pudiste observarlo'],
 ['desire','Interés o deseo sexual'],
 ['confidence','Confianza'],
 ['comfort','Comodidad durante la intimidad'],
 ['sleep','Descanso'],
 ['skill','Claridad sobre cómo practicar']
];
const LABELS=['Ausencia','Bajo','Aceptable','Satisfactorio','Sin dificultades','No evaluable / no aplica'];
const IMAGES={
 14:[1,2].map(n=>'/premium-v2/assets/checkpoint-erection/day14-screen-0'+n+'.jpg'),
 28:[1,2].map(n=>'/premium-v2/assets/checkpoint-erection/day28-screen-0'+n+'.jpg')
};
// Coordenadas originales en el lienzo vertical 864×1536. Cada botón sobre su número.
const GRID={
 14:[[[457,800],[524,800],[591,800],[657,800],[722,800],[790,800]],
     [[457,966],[524,966],[591,966],[657,966],[722,966],[790,966]],
     [[457,1124],[524,1124],[591,1124],[657,1124],[722,1124],[790,1124]],
     [[457,1272],[524,1272],[591,1272],[657,1272],[722,1272],[790,1272]]],
 28:[[[457,791],[524,791],[591,791],[657,791],[723,791],[791,791]],
     [[457,956],[524,956],[591,956],[657,956],[723,956],[791,956]],
     [[457,1108],[524,1108],[591,1108],[657,1108],[723,1108],[791,1108]],
     [[457,1256],[524,1256],[591,1256],[657,1256],[723,1256],[791,1256]]]
};
const GRID_LAST={
 14:[[[447,667],[513,667],[580,667],[647,667],[716,667],[785,667]],
     [[447,800],[513,800],[580,800],[647,800],[716,800],[785,800]],
     [[447,920],[513,920],[580,920],[647,920],[716,920],[785,920]]],
 28:[[[451,634],[516,634],[581,634],[648,634],[716,634],[783,634]],
     [[451,755],[516,755],[581,755],[648,755],[716,755],[783,755]],
     [[451,879],[516,879],[581,879],[648,879],[716,879],[783,879]]]
};
const GUIDES={
 14:[
  'Este es tu seguimiento del día catorce. Piensa en cómo te has sentido durante los últimos siete días. Usa la escala de cero a cuatro: cero, ausencia; uno, bajo; dos, aceptable; tres, satisfactorio; y cuatro, sin dificultades. Si no pudiste observar la firmeza o el control eyaculatorio, marca No evaluable. Esa respuesta es diferente de cero. Completa los cuatro primeros aspectos con lo que ya has vivido, sin hacer una prueba nueva, y pulsa Continuar.',
  'Ahora revisa tu comodidad durante la intimidad, tu descanso y la claridad que tienes sobre cómo practicar. Responde con la misma escala de cero a cuatro o marca No evaluable cuando corresponda. Puedes escribir qué te ha ayudado esta semana y cuál práctica quieres seguir trabajando. Ambas notas son opcionales. Al finalizar, guarda el seguimiento para que forme parte de tu informe de evolución.'
  ],
  28:[
  'Llegaste al día veintiocho. Vas a revisar cómo te encuentras ahora y podrás comparar tus respuestas con las anteriores. Piensa en los últimos siete días y marca la firmeza, el control eyaculatorio, el interés sexual y la confianza usando la escala de cero a cuatro. Si un aspecto no se presentó o no pudiste observarlo, marca No evaluable. Eso es diferente de ausencia. No necesitas provocar una experiencia nueva ni medir tu respuesta. Cuando termines, pulsa Continuar.',
  'Para completar tu evaluación final, marca tu comodidad durante la intimidad, tu descanso y la claridad sobre cómo practicar. Después puedes anotar qué actividad quieres seguir practicando y cuándo la integrarás a tu rutina; estas respuestas abiertas son opcionales. Pulsa Ver mi informe final para revisar una vista previa con los registros disponibles. Al guardar, la evaluación se incorpora a la comparación de los días uno, catorce y veintiocho. Lo aprendido continúa contigo y puede seguir formando parte de tu vida diaria.'
  ]
};
const vals=[0,1,2,3,4,null];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const style=(x1,y1,x2,y2)=>'left:'+(x1/864*100).toFixed(4)+'%;top:'+(y1/1536*100).toFixed(4)+'%;width:'+((x2-x1)/864*100).toFixed(4)+'%;height:'+((y2-y1)/1536*100).toFixed(4)+'%';
const savedValue=(m,k)=>Object.hasOwn(m.metrics,k)?m.metrics[k]:undefined;
let current=null;
function stopSpeech(m){
 if(!m)return;
 try{window.speechSynthesis?.cancel?.()}catch{}
 m.voice=null;
 m.host?.querySelector('[data-ck-action="audio"]')?.classList.remove('playing');
 m.host?.querySelector('[data-ck-action="audio"]')?.setAttribute('aria-pressed','false');
}
function closeReport(m){if(m?.dialog?.isConnected)m.dialog.remove();if(m)m.dialog=null}
function stop(){if(!current)return;const m=current;current=null;stopSpeech(m);closeReport(m);m.events.abort()}
function present(m){return current===m&&m.valid()&&m.root?.isConnected&&m.host.contains(m.root)}
function status(m,txt){const p=m.host.querySelector('[data-ck-status]');if(p)p.textContent=txt||''}
function warn(m,txt){
 if(!window.SPM_ERECTION_TOUCH_VIEW?.warn?.(m.host,txt)){
  // Fallback para entornos de revisión que no tengan el controlador global.
  const overlay=document.createElement('div');overlay.className='spm-checkpoint-warning';
  overlay.innerHTML='<section class="spm-checkpoint-warning-card" role="alertdialog" aria-modal="true" aria-label="Selecciona una respuesta"><strong>Completa esta respuesta</strong><p></p><button type="button">Entendido</button></section>';
  overlay.querySelector('p').textContent=txt;
  overlay.querySelector('button').addEventListener('click',()=>overlay.remove());
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});
  m.root.append(overlay);overlay.querySelector('button').focus({preventScroll:true});
 }
}
function audio(m){
 if(!present(m)||m.saving)return;
 if(m.voice){stopSpeech(m);return}
 if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=='function'){
  status(m,'No está disponible la voz estándar del dispositivo. Puedes seguir las indicaciones de la pantalla.');return;
 }
 try{
  const u=new window.SpeechSynthesisUtterance(GUIDES[m.milestone][m.page-1]);
  u.lang='es-CO';u.rate=1;u.pitch=1;u.volume=1;
  // Se usa la voz estándar del dispositivo, sin forzar nombres o voces ajenas a SPM.
  m.voice=u;
  const b=m.root.querySelector('[data-ck-action="audio"]');b?.classList.add('playing');b?.setAttribute('aria-pressed','true');
  u.onend=()=>{if(m.voice===u)stopSpeech(m)};
  u.onerror=()=>{if(m.voice===u){stopSpeech(m);status(m,'No se pudo reproducir la guía. Vuelve a intentarlo.')}};
  window.speechSynthesis.speak(u);
 }catch{stopSpeech(m);status(m,'No se pudo reproducir la guía.')}
}
function hit(xy,action,label,opts={}){
 return '<button type="button" class="spm-ck-hit'+(opts.selected?' selected':'')+(opts.audio?' audio':'')+'" style="'+style(...xy)+'" data-ck-action="'+esc(action)+'"'+(opts.metric?' data-metric="'+esc(opts.metric)+'"':'')+(opts.index!==undefined?' data-value="'+opts.index+'"':'')+(opts.selected!==undefined?' aria-pressed="'+opts.selected+'"':'')+' aria-label="'+esc(label)+'"></button>';
}
function build(m){
 const day=m.milestone,page=m.page;
 let hits=hit(page===1?[198,255,669,352]:[213,252,657,343],'audio','Escuchar guía de '+(page===1?'la primera':'la segunda')+' pantalla',{audio:true});
 const ids=page===1?METRICS.slice(0,4):METRICS.slice(4);
 const centers=page===1?GRID[day]:GRID_LAST[day];
 ids.forEach(([k,title],ri)=>centers[ri].forEach(([cx,cy],vi)=>{
  const value=vals[vi],selected=savedValue(m,k)===value&&Object.hasOwn(m.metrics,k);
  const mark=vi===5?'No evaluable / no aplica':String(value)+' · '+LABELS[vi];
  hits+=hit([cx-30,cy-32,cx+30,cy+32],'score',title+': '+mark,{metric:k,index:vi,selected});
 }));
 let inputs='';
 if(page===1)hits+=hit([28,1363,838,1492],'next','Continuar a la segunda pantalla');
 else{
  const coords=day===14?[[122,1074,810,1150],[122,1264,810,1344]]:[[60,1017,804,1093],[60,1189,804,1267]];
  const labels=day===14?['¿Qué te ha ayudado esta semana?','¿Qué práctica quieres seguir trabajando?']:['¿Qué actividad quieres seguir practicando?','¿Cuándo la integrarás a tu rutina?'];
  ['reflection','continuity'].forEach((key,i)=>{
   inputs+='<textarea class="spm-ck-note" name="'+key+'" data-ck-note="'+key+'" maxlength="2000" rows="2" placeholder=" " aria-label="'+esc(labels[i])+'" style="'+style(...coords[i])+'">'+esc(m[key])+'</textarea>';
  });
  if(day===28)hits+=hit([156,1297,710,1389],'report','Ver mi informe final disponible');
  hits+=hit(day===14?[25,1389,837,1511]:[25,1397,839,1511],'save',day===14?'Guardar mi seguimiento':'Guardar mi evaluación final');
 }
 const toolbar='<nav class="spm-ck-toolbar" aria-label="Navegación de evaluación"><button type="button" data-ck-action="back">'+(page===1?'← Volver a Hoy':'← Anterior')+'</button><span>Día '+day+' · '+page+' de 2</span>'+(day===28&&page===1?'<button type="button" data-ck-action="report">Ver informe disponible</button>':'<button type="button" data-ck-action="exit">Salir a Hoy</button>')+'</nav>';
 m.host.innerHTML='<section class="spm-ck-session spm-er-fullscreen" data-spm-checkpoint-touch data-checkpoint-day="'+day+'" data-checkpoint-screen="'+page+'"><div class="spm-ck-artwork" role="group" aria-label="Evaluación Día '+day+', pantalla '+page+' de dos"><img src="'+IMAGES[day][page-1]+'" alt="'+(page===1?'Mi evaluación':'Continuación de evaluación')+' día '+day+'" draggable="false">'+hits+inputs+'</div>'+toolbar+'<p data-ck-status class="spm-ck-status" role="status" aria-live="polite"></p></section>';
 m.root=m.host.querySelector('[data-spm-checkpoint-touch]');
 window.SPM_ERECTION_TOUCH_VIEW?.resetScroll?.(m.host);
}
function update(m){
 m.root.querySelectorAll('[data-ck-action="score"]').forEach(btn=>{
  const key=btn.dataset.metric,value=vals[Number(btn.dataset.value)];
  const sel=Object.hasOwn(m.metrics,key)&&m.metrics[key]===value;
  btn.classList.toggle('selected',sel);btn.setAttribute('aria-pressed',String(sel));
 });
}
function validatePage(m,last=false){
 const names=last?METRICS:METRICS.slice(0,4);
 const missing=names.find(([key])=>!Object.hasOwn(m.metrics,key)||m.metrics[key]===undefined);
 if(missing){warn(m,'Selecciona una respuesta de 0 a 4 o «NA» para '+missing[1].toLowerCase()+'. Si no pudiste observarla, «NA» es diferente de cero.');return false}
 return true;
}
function navigate(m,p){if(!present(m)||m.saving)return;
 if(p>m.page&&!validatePage(m))return;
 stopSpeech(m);m.page=Math.max(1,Math.min(2,p));build(m);
}
function snapshot(m){return {metrics:Object.fromEntries(METRICS.map(([k])=>[k,savedValue(m,k)])),reflection:String(m.reflection||''),continuity:String(m.continuity||'')}}
async function save(m){
 if(!present(m)||m.saving||!validatePage(m,true))return;
 stopSpeech(m);m.saving=true;status(m,'Guardando tus respuestas de manera segura…');
 m.root.querySelectorAll('button,textarea').forEach(x=>x.disabled=true);
 try{
  const result=await m.save(snapshot(m));
  if(result===false)throw Error('save-failed');
 }catch{
  if(present(m)){m.saving=false;m.root.querySelectorAll('button,textarea').forEach(x=>x.disabled=false);status(m,'No fue posible guardar. Tus respuestas siguen aquí; vuelve a intentarlo.');}
 }
}
function report(m){
 if(!present(m)||m.saving)return;
 const contents=m.report?.(snapshot(m));if(!contents)return;
 stopSpeech(m);closeReport(m);
 const overlay=document.createElement('div');overlay.className='spm-ck-report-overlay';
 overlay.innerHTML='<section class="spm-ck-report-card" role="dialog" aria-modal="true" aria-label="Vista previa de mi informe"><button type="button" class="spm-ck-close-report" data-ck-close-report>Volver a la evaluación</button><div class="spm-ck-report-inner"></div><button type="button" class="spm-ck-close-report" data-ck-close-report>Volver a mis respuestas</button></section>';
 overlay.querySelector('.spm-ck-report-inner').innerHTML=contents;
 const btn=overlay.querySelector('[data-ck-close-report]');
 const close=()=>{if(!overlay.isConnected)return;window.SPM_CHECKPOINT_AUDIO?.stop?.(overlay);overlay.remove();if(m.dialog===overlay)m.dialog=null;const b=m.root?.querySelector('[data-ck-action="report"]');b?.focus?.({preventScroll:true})};
 overlay.querySelectorAll('[data-ck-close-report]').forEach(x=>x.addEventListener('click',close));
 overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
 overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}else if(e.key==='Tab'&&e.target===overlay){e.preventDefault();btn.focus({preventScroll:true})}});
 document.body.appendChild(overlay);m.dialog=overlay;btn.focus({preventScroll:true});
 window.SPM_CHECKPOINT_AUDIO?.bind?.(overlay);
}
function mount({host,milestone,day,prior,valid=()=>true,save:onSave,onBack=()=>{},report:onReport=()=>''}={}){
 if(!host||![14,28].includes(Number(milestone))||typeof onSave!=='function')return false;
 stop();
 const old=prior&&typeof prior==='object'&&!Array.isArray(prior)?prior:{};
 const metrics={};for(const [k] of METRICS){
  if(old?.checkpointVersion===2&&Object.hasOwn(old.metrics||{},k))metrics[k]=old.metrics[k];
  else if(old?.metrics?.[k]===null)metrics[k]=null; // Legacy NA is safe to preserve; 0–10 values are not mapped.
 }
 const m={host,root:null,day:Number(day),milestone:Number(milestone),page:1,metrics,reflection:String(old.reflection||''),continuity:String(old.continuity||''),save:onSave,valid,onBack,report:onReport,saving:false,voice:null,dialog:null,events:new AbortController()};
 current=m;build(m);
 host.addEventListener('click',e=>{
  if(!present(m)||m.saving)return;
  const b=e.target.closest('[data-ck-action]');if(!b||b.disabled)return;
  const action=b.dataset.ckAction;
  if(action==='score'){
   const k=b.dataset.metric,index=Number(b.dataset.value);
   if(!METRICS.some(([key])=>key===k)||!Number.isInteger(index)||index<0||index>5)return;
   m.metrics[k]=vals[index];update(m);status(m,'');return;
  }
  if(action==='audio'){audio(m);return}
  if(action==='next'){navigate(m,2);return}
  if(action==='back'){if(m.page===1){stopSpeech(m);m.onBack()}else navigate(m,1);return}
  if(action==='exit'){stopSpeech(m);m.onBack();return}
  if(action==='save'){void save(m);return}
  if(action==='report'){report(m)}
 },{signal:m.events.signal});
 host.addEventListener('input',e=>{
  if(!present(m)||m.saving)return;
  const k=e.target?.dataset?.ckNote;
  if(k==='reflection'||k==='continuity')m[k]=String(e.target.value||'').slice(0,2000);
 },{signal:m.events.signal});
 return true;
}
window.addEventListener('pagehide',stop);
window.SPM_CHECKPOINT_TOUCH=Object.freeze({mount,stop,images:IMAGES,metrics:METRICS,voices:'device-default',guides:GUIDES,scaleValues:vals});
})();