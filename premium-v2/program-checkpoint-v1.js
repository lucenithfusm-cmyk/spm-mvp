(()=>{'use strict';
// Educational self-report, scoped to the active account and plan. No diagnostic score.
const metrics=[['firmness','Firmeza, si pudiste observarla'],['control','Control eyaculatorio, si pudiste observarlo'],['desire','Interés o deseo sexual'],['confidence','Confianza'],['comfort','Comodidad durante la intimidad'],['sleep','Descanso'],['skill','Claridad sobre cómo practicar']];
const scaleLabels=['Ausencia','Bajo','Aceptable','Satisfactorio','Sin dificultades'];
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.(),scope=c=>c?c.userId+':'+c.planId:'';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const message14='Llevas dos semanas aprendiendo a reconocer tu cuerpo y sus respuestas. Los cambios pueden ser graduales y variar entre personas. No observar todavía una mejoría no significa por sí solo que estés perdiendo el tiempo. Revisemos tu comodidad y lo que has aprendido para ajustar el proceso, sin forzar ni prometer resultados.';
const message28='Estos 28 días son un ciclo inicial de aprendizaje, no una fecha límite para cambiar tu respuesta sexual. Conserva las prácticas que te resultaron cómodas y útiles, y repítelas con constancia según tu plan. El progreso puede variar; no necesitas provocar una respuesta sexual para demostrarlo. Si la dificultad persiste, empeora o te preocupa, consulta para valorar sus causas y si necesitas tratamiento adicional.';
const care='SPM complementa tu cuidado de la salud. No reemplaza una valoración médica ni tu tratamiento. Si tienes un medicamento prescrito para la función eréctil u otra condición, participar en el programa no es motivo para suspenderlo ni cambiar su dosis. Cualquier ajuste debe acordarse con el profesional que te lo indique.';
const narrations={"1": "Vamos a conocer tu punto de partida. Busca un momento tranquilo y piensa en cómo te has sentido durante los últimos siete días. En cada aspecto, elige la opción que describa tu experiencia: cero, ausencia; uno, bajo; dos, aceptable; tres, satisfactorio; cuatro, sin dificultades. No es un examen ni una meta que debas alcanzar. Solo valora la firmeza, el control eyaculatorio o la comodidad si has podido observarlos. Si no tuviste ocasión o un aspecto no aplica, elige «No evaluable o no aplica». Esa opción es distinta de cero y no cuenta como una dificultad. No necesitas tener una relación sexual ni hacer una prueba para responder. Si ya tenías un registro con la escala anterior, lo conservaremos; responde de nuevo con esta escala. Puedes añadir notas si quieres; no son obligatorias. Al terminar, pulsa «Guardar mi punto de partida». Puedes volver a escuchar la explicación y continuar tus actividades a tu ritmo. Este registro es educativo, no un diagnóstico. Mantén las indicaciones de tus profesionales y no cambies tus medicamentos por este programa.", "14": "Llevas dos semanas aprendiendo a reconocer tu cuerpo y sus respuestas. Los cambios pueden ser graduales y variar entre personas. No observar todavía una mejoría no significa por sí solo que estés perdiendo el tiempo. Revisemos tu comodidad y lo que has aprendido para ajustar el proceso, sin forzar ni prometer resultados. Busca un momento tranquilo y piensa en cómo te has sentido durante los últimos siete días. En cada aspecto, elige la opción que describa tu experiencia: cero, ausencia; uno, bajo; dos, aceptable; tres, satisfactorio; cuatro, sin dificultades. No es un examen ni una meta que debas alcanzar. Solo valora la firmeza, el control eyaculatorio o la comodidad si has podido observarlos. Si no tuviste ocasión o un aspecto no aplica, elige «No evaluable o no aplica». Esa opción es distinta de cero y no cuenta como una dificultad. No necesitas tener una relación sexual ni hacer una prueba para responder. Si ya tenías un registro con la escala anterior, lo conservaremos; responde de nuevo con esta escala. Puedes añadir notas si quieres; no son obligatorias. Al terminar, pulsa «Guardar mi seguimiento». Podrás consultar tus respuestas junto a las de tu punto de partida. Este registro es educativo, no un diagnóstico. Mantén las indicaciones de tus profesionales y no cambies tus medicamentos por este programa.", "28": "Estos 28 días son un ciclo inicial de aprendizaje, no una fecha límite para cambiar tu respuesta sexual. Conserva las prácticas que te resultaron cómodas y útiles, y repítelas con constancia según tu plan. El progreso puede variar; no necesitas provocar una respuesta sexual para demostrarlo. Si la dificultad persiste, empeora o te preocupa, consulta para valorar sus causas y si necesitas tratamiento adicional. Busca un momento tranquilo y piensa en cómo te has sentido durante los últimos siete días. En cada aspecto, elige la opción que describa tu experiencia: cero, ausencia; uno, bajo; dos, aceptable; tres, satisfactorio; cuatro, sin dificultades. No es un examen ni una meta que debas alcanzar. Solo valora la firmeza, el control eyaculatorio o la comodidad si has podido observarlos. Si no tuviste ocasión o un aspecto no aplica, elige «No evaluable o no aplica». Esa opción es distinta de cero y no cuenta como una dificultad. No necesitas tener una relación sexual ni hacer una prueba para responder. Si ya tenías un registro con la escala anterior, lo conservaremos; responde de nuevo con esta escala. Puedes añadir notas si quieres; no son obligatorias. Al terminar, pulsa «Guardar mi evaluación». Tu informe final estará disponible aunque prefieras dejar esta evaluación para después. Este registro es educativo, no un diagnóstico. Mantén las indicaciones de tus profesionales y no cambies tus medicamentos por este programa."};
function scaleMax(data){return data?.checkpointVersion===2?4:data?.checkpointVersion===1?10:null;}
function valid(data){
 const max=scaleMax(data);
 if(max===null||data.checkpointVersion===2&&data.scaleMax!==4)return false;
 if(!metrics.every(([k])=>Object.hasOwn(data.metrics||{},k)&&(data.metrics[k]===null||Number.isInteger(data.metrics[k])&&data.metrics[k]>=0&&data.metrics[k]<=max)))return false;
 if(typeof data.reflection!=='string'||data.reflection.length>2000||typeof data.continuity!=='string'||data.continuity.length>2000)return false;
 return !data.legacyCheckpoint||data.checkpointVersion===2&&data.legacyCheckpoint.checkpointVersion===1&&valid(data.legacyCheckpoint);
}
function legacySnapshot(prior){
 const original=prior?.checkpointVersion===1?prior:prior?.legacyCheckpoint;
 if(original?.checkpointVersion!==1||!valid(original))return null;
 const result={checkpointVersion:1,metrics:Object.fromEntries(metrics.map(([k])=>[k,original.metrics[k]])),reflection:original.reflection,continuity:original.continuity};
 for(const key of ['milestone','submittedDay','at'])if(Object.hasOwn(original,key))result[key]=original[key];
 return result;
}
function comparison(rows){
 const versions=new Set([1,14,28].filter(d=>valid(rows[d])).map(d=>scaleMax(rows[d])));
 const mixed=versions.size>1?'<p data-checkpoint-mixed-scales>Las respuestas se registraron con escalas diferentes y no se comparan directamente.</p>':'';
 const headers=[1,14,28].map(d=>'<th scope="col">Día '+d+(valid(rows[d])?' <small>Escala 0–'+scaleMax(rows[d])+'</small>':'')+'</th>').join('');
 const body=metrics.map(([key,label])=>'<tr><th scope="row">'+esc(label)+'</th>'+[1,14,28].map(d=>'<td>'+(valid(rows[d])&&rows[d].metrics[key]!==null?rows[d].metrics[key]+'/'+scaleMax(rows[d]):'Sin dato / no evaluable')+'</td>').join('')+'</tr>').join('');
 return mixed+'<div class="spm-checkpoint-table"><table><caption>Tu evolución percibida</caption><thead><tr><th scope="col">Aspecto</th>'+headers+'</tr></thead><tbody>'+body+'</tbody></table></div><p>Autorregistros educativos, no escalas clínicas ni una medida objetiva. No se reemplazan datos faltantes por cero ni se interpreta una ausencia de registro como falta de mejoría.</p>';
}
function archivedRecords(rows){
 const items=[1,14,28].filter(d=>valid(rows[d])&&rows[d].legacyCheckpoint);
 if(!items.length)return '';
 return '<details class="spm-checkpoint-archive"><summary>Ver registros anteriores · escala 0–10</summary>'+items.map(d=>{
  const r=rows[d].legacyCheckpoint;
  return '<h4>Día '+d+' · Registro anterior conservado</h4><dl>'+metrics.map(([k,label])=>'<div><dt>'+esc(label)+'</dt><dd>'+(r.metrics[k]===null?'No evaluable / no aplica':r.metrics[k]+'/10')+'</dd></div>').join('')+'</dl>'+(r.reflection?'<p>'+esc(r.reflection)+'</p>':'')+(r.continuity?'<p>'+esc(r.continuity)+'</p>':'');
 }).join('')+'</details>';
}
let cachedScope='',cachedRows={},requestId=0;
function assignment(c){
 const day=Number(c.day),known=scope(c)===cachedScope?cachedRows:{};
 if(day!==1&&day<14)return null;
 if(day>14&&day<28&&valid(known[14]))return null;
 return {id:'program-checkpoint',kind:'program-checkpoint',milestone:day===1?1:day<28?14:28,optional:true,optionalLabel:'SEGUIMIENTO · OPCIONAL',title:day===1?'Mi punto de partida':day===28?'Mi informe final y evaluación opcional':day===14?'Seguimiento · Día 14':'Recordatorio · Seguimiento del día 14',summary:day===28?'Consulta tu informe con la información disponible, aunque no hayas completado las evaluaciones.': 'Escucha la explicación y elige cómo te has sentido. Puedes hacerlo a tu ritmo.'};
}
async function readRows(captured,day){
 const rows={};
 if(window.SPM_DAILY_RECORDS.readCheckpoints){
  const stored=await window.SPM_DAILY_RECORDS.readCheckpoints(captured);
  for(const item of [...stored].sort((a,b)=>a.day_number-b.day_number)){const r=item.metadata,m=r?.milestone||item.day_number;if([1,14,28].includes(m)&&valid(r)&&item.day_number<=day)rows[m]=r;}
 }else{for(const d of [1,14,28].filter(d=>d<=day)){const data=await window.SPM_DAILY_RECORDS.read(captured,d);rows[d]=data['program-checkpoint'];}}
 if(scope(ctx())===captured&&Number(ctx()?.day)===day){cachedScope=captured;cachedRows=rows;}return rows;
}
function titleFor(milestone){return milestone===1?'Mi punto de partida':milestone===14?'Mi seguimiento · Día 14':'Mi evaluación · Día 28';}
function stopAudio(){window.SPM_CHECKPOINT_AUDIO?.stop(document.getElementById('spmDailyWorkspace'));}
function audioMarkup(milestone){
 const text=narrations[milestone],src='/premium-v2/assets/audio/checkpoint/checkpoint-'+milestone+'-v2.mp3';
 return window.SPM_CHECKPOINT_AUDIO?.markup({src,text,label:'Escuchar explicación'})||'<details><summary>Leer explicación</summary><p>'+esc(text)+'</p></details>';
}
async function open(activity,edit=false){
 const c=ctx(),captured=scope(c),day=Number(c?.day);if(!c||day!==1&&(day<14||day>28))return;const milestone=day===1?1:day<28?14:28;
 const host=document.getElementById('spmDailyWorkspace');if(!host)return;
 stopAudio();const token=++requestId;
 host.innerHTML='<p role="status">Recuperando tus seguimientos…</p>';
 const loading=host.firstElementChild,activeAtOpen=window.SPM_DAILY_PRACTICE?.active?.();
 const current=()=>token===requestId&&scope(ctx())===captured&&Number(ctx()?.day)===day&&host.isConnected&&document.getElementById('spmDailyWorkspace')===host;
 let rows={};
 try{rows=await readRows(captured,day);if(!current()||!host.contains(loading))return;}
 catch{if(current()&&host.contains(loading))host.innerHTML='<p role="status">No pudimos cargar tus seguimientos. Vuelve a abrir esta actividad para reintentar; no se han cambiado tus datos.</p>';return;}
 const prior=valid(rows[milestone])?rows[milestone]:null;
 if((prior||day===28)&&!edit){showReport(rows,day,captured);return;}
 const oldScale=prior?.checkpointVersion===1;
 const options=(k)=>'<option value="">Selecciona</option><option value="na" '+(prior?.metrics[k]===null?'selected':'')+'>No evaluable / no aplica</option>'+scaleLabels.map((label,i)=>'<option value="'+i+'" '+(!oldScale&&prior?.metrics[k]===i?'selected':'')+'>'+i+' · '+esc(label)+'</option>').join('');
 const legend='<section class="spm-checkpoint-scale-wrap" aria-label="Significado de la escala"><h4>Tu escala · 0 a 4</h4><ol class="spm-checkpoint-scale" start="0">'+scaleLabels.map((label,i)=>'<li><b>'+i+'</b><span>'+esc(label)+'</span></li>').join('')+'</ol></section>';
 const fields='<div class="spm-checkpoint-fields">'+metrics.map(([k,label])=>'<label><span>'+esc(label)+'</span><select name="'+k+'" required>'+options(k)+'</select></label>').join('')+'</div>';
 const notes='<details class="spm-checkpoint-notes"><summary>Notas opcionales</summary><label>¿Qué has aprendido, qué ha sido útil o qué te ha costado?<textarea name="reflection" maxlength="2000" rows="3">'+esc(prior?.reflection)+'</textarea></label><label>'+(day===28?'Tu plan de continuidad: ¿qué vas a mantener y cuándo?':'¿Qué práctica cómoda quieres mantener o qué necesitas revisar?')+'<textarea name="continuity" maxlength="2000" rows="3">'+esc(prior?.continuity)+'</textarea></label></details>';
 const legacyNote=oldScale?'<details class="spm-checkpoint-archive"><summary>Tu registro anterior</summary><p>Tu respuesta de 0 a 10 se conservará. Elige de nuevo cada respuesta con la escala actual de 0 a 4; las cifras anteriores no se convierten automáticamente.</p></details>':'';
 host.innerHTML='<form class="spm-daily-work" data-program-checkpoint><h3>'+titleFor(milestone)+'</h3>'+audioMarkup(milestone)+legend+legacyNote+fields+notes+'<div class="spm-daily-actions"><button type="submit" class="btn pri">'+(milestone===1?'Guardar mi punto de partida':milestone===14?'Guardar mi seguimiento':'Guardar mi evaluación')+'</button><button type="button" class="btn sec" data-checkpoint-cancel>Volver a mis actividades</button></div><p role="status" data-checkpoint-status></p></form>';
 const form=host.querySelector('form');let saving=false;
 window.SPM_CHECKPOINT_AUDIO?.bind(form);
 form.querySelector('[data-checkpoint-cancel]').onclick=()=>{if(!saving){stopAudio();requestId++;window.SPM_DAILY_PRACTICE.open();}};
 form.onsubmit=async e=>{
  e.preventDefault();if(saving||!current()||!form.isConnected||!host.contains(form)||!form.reportValidity())return;
  const values=new FormData(form),record={checkpointVersion:2,scaleMax:4,milestone,submittedDay:day,metrics:Object.fromEntries(metrics.map(([k])=>[k,values.get(k)==='na'?null:/^[0-4]$/.test(values.get(k)||'')?Number(values.get(k)):undefined])),reflection:String(values.get('reflection')||''),continuity:String(values.get('continuity')||''),at:new Date().toISOString()};
  const legacy=legacySnapshot(prior);if(legacy)record.legacyCheckpoint=legacy;
  if(!valid(record)){form.querySelector('[data-checkpoint-status]').textContent='Revisa tus respuestas y elige una opción de 0 a 4 o «No evaluable / no aplica».';return;}
  saving=true;const button=form.querySelector('button[type=submit]'),cancel=form.querySelector('[data-checkpoint-cancel]');button.disabled=true;cancel.disabled=true;stopAudio();
  try{
   await window.SPM_DAILY_PRACTICE.saveActivity(activity.id,record,captured,day);
   if(scope(ctx())!==captured||Number(ctx()?.day)!==day||activeAtOpen&&window.SPM_DAILY_PRACTICE?.active?.()!==activeAtOpen)return;
   rows[milestone]=record;cachedScope=captured;cachedRows=rows;
   window.SPM_DAILY_PRACTICE.open({focus:false});showReport(rows,day,captured);
  }catch{
   if(current()&&form.isConnected){saving=false;button.disabled=false;cancel.disabled=false;form.querySelector('[data-checkpoint-status]').textContent='No se pudo guardar. Tus respuestas siguen aquí; revisa tu conexión y reintenta.';}
  }
 };
 host.scrollIntoView({block:'start'});
}
function showReport(rows,day,captured){
 if(scope(ctx())!==captured||Number(ctx()?.day)!==day)return;const milestone=day===1?1:day<28?14:28;
 const host=document.getElementById('spmDailyWorkspace');if(!host)return;stopAudio();
 host.innerHTML='<section class="spm-daily-work" data-program-report><h3>'+(day===28?'Tu informe final · SPM 28 días':day===1?'Tu punto de partida':'Tu seguimiento · Día '+day)+'</h3>'+([1,14,28].some(d=>d<=day&&!valid(rows[d]))?'<p>No contamos con todas tus evaluaciones de seguimiento. Tu informe reúne la información disponible; no podemos establecer una comparación completa de tu evolución. Esto no significa que no hayas progresado.</p>':'')+comparison(rows)+archivedRecords(rows)+Object.values(rows).filter(r=>valid(r)&&r.submittedDay&&r.submittedDay!==r.milestone).map(r=>'<p>Seguimiento previsto para el día '+r.milestone+', respondido el día '+r.submittedDay+'. Refleja cómo te encontrabas al responder.</p>').join('')+'<h4>Lo que reconoces de tu proceso</h4><p>'+esc(rows[milestone]?.reflection||'No añadiste una reflexión.')+'</p><h4>Tu continuidad</h4><p>'+esc(rows[milestone]?.continuity||'Elige una práctica cómoda que quieras sostener y un momento realista para realizarla.')+'</p><p>'+(milestone===14?message14:day===28?message28:'Tu punto de partida quedó guardado. Volveremos a revisarlo en los días 14 y 28.')+'</p><p>'+care+'</p><button type="button" class="btn pri" data-checkpoint-back>Volver a mis actividades</button> <button type="button" class="btn sec" data-checkpoint-edit>Completar o revisar evaluación (opcional)</button> <button type="button" class="btn sec" data-checkpoint-copy>Copiar mi informe</button><p role="status"></p></section>';
 host.querySelector('[data-checkpoint-back]').onclick=()=>window.SPM_DAILY_PRACTICE.open();
 host.querySelector('[data-checkpoint-edit]').onclick=()=>open({id:'program-checkpoint',title:titleFor(milestone)},true);
 host.querySelector('[data-checkpoint-copy]').onclick=async()=>{try{await navigator.clipboard.writeText(host.querySelector('[data-program-report]').innerText);host.querySelector('[role=status]').textContent='Informe copiado.';}catch{host.querySelector('[role=status]').textContent='Puedes seleccionar el texto del informe y copiarlo manualmente.';}};
 host.scrollIntoView({block:'start'});
}

const style=document.createElement('style');style.id='spmCheckpointStyles';style.textContent=`
.spm-daily-work[data-program-checkpoint]{border:0;background:#0a1d25;padding:clamp(18px,3vw,32px);gap:28px;min-width:0;font-size:17px}
[data-program-checkpoint]>h3{font-size:clamp(26px,4vw,32px);line-height:1.3;margin:0;color:#fff}
.spm-checkpoint-scale-wrap>h4{font-size:18px;margin:0 0 16px;color:#e8d7b4}
.spm-checkpoint-scale{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px;padding:0;margin:0;list-style:none}
.spm-checkpoint-scale li{display:flex;flex-direction:column;gap:6px;line-height:1.45;min-width:0}.spm-checkpoint-scale b{color:#e0bd7b;font-size:24px}.spm-checkpoint-scale span{color:#d7e3e6;font-size:16px}
.spm-checkpoint-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:26px 28px}
.spm-checkpoint-fields label{gap:10px!important;min-width:0;align-content:start}.spm-checkpoint-fields label>span{font-weight:650;line-height:1.5}
.spm-checkpoint-fields select{display:block;width:100%;min-height:52px;padding:12px;font:inherit;color:#eef8f6;border:1px solid #718881;border-radius:10px;background:#10272e;box-sizing:border-box}
[data-program-checkpoint] :is(select,textarea,button,summary):focus-visible{outline:3px solid #d8ba75;outline-offset:4px}
.spm-checkpoint-notes,.spm-checkpoint-archive{min-width:0}.spm-checkpoint-notes>summary,.spm-checkpoint-archive>summary{color:#d9c294!important;cursor:pointer;padding:8px 0;font-size:16px}
.spm-checkpoint-notes label{margin-top:22px}.spm-checkpoint-notes textarea{box-sizing:border-box;max-width:100%;font:inherit}
.spm-checkpoint-table{overflow-x:auto}.spm-checkpoint-table table{width:100%;text-align:left;border-collapse:collapse;font-size:16px;line-height:1.6}.spm-checkpoint-table th,.spm-checkpoint-table td{padding:12px 14px;border-bottom:1px solid #71888155}.spm-checkpoint-table th small{display:block;white-space:nowrap;font-weight:400;color:#c7d5d8}.spm-checkpoint-table caption{text-align:left;font-size:20px;font-weight:700;margin:0 0 16px}
.spm-checkpoint-archive dl>div{display:flex;gap:20px;justify-content:space-between;padding:10px 0}.spm-checkpoint-archive dd{margin:0;white-space:nowrap}
@media(max-width:600px){.spm-checkpoint-fields{grid-template-columns:1fr;gap:24px}.spm-checkpoint-scale{grid-template-columns:1fr;gap:10px}.spm-checkpoint-scale li{flex-direction:row;align-items:center;gap:16px}.spm-checkpoint-scale b{min-width:24px;font-size:22px}.spm-checkpoint-scale span{font-size:16px}}
`;document.head.appendChild(style);
let fetched='';
window.addEventListener('spm:resourcecontext',async()=>{
 const c=ctx(),key=scope(c)+':'+c?.day;if(!c||!window.SPM_DAILY_RECORDS.readCheckpoints||key===fetched)return;fetched=key;
 try{await readRows(scope(c),Number(c.day));if(scope(ctx())===scope(c)&&Number(ctx()?.day)===Number(c.day))window.dispatchEvent(new Event('spm:resourcecontext'));}catch{if(fetched===key)fetched='';}
});
window.SPM_PROGRAM_CHECKPOINT={open,valid,comparison,metrics,scaleLabels,scaleMax,narrations,message14,message28,assignment,readRows};
})();
