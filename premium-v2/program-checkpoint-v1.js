(()=>{'use strict';
// Educational self-report, scoped to the active account and plan. No diagnostic score.
const metrics=[['firmness','Firmeza, si pudiste observarla'],['control','Control eyaculatorio, si pudiste observarlo'],['desire','Interés o deseo sexual'],['confidence','Confianza'],['comfort','Comodidad durante la intimidad'],['sleep','Descanso'],['skill','Claridad sobre cómo practicar']];
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.(),scope=c=>c?c.userId+':'+c.planId:'';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const message14='Llevas dos semanas aprendiendo a reconocer tu cuerpo y sus respuestas. Los cambios pueden ser graduales y variar entre personas. No observar todavía una mejoría no significa por sí solo que estés perdiendo el tiempo. Revisemos tu comodidad y lo que has aprendido para ajustar el proceso, sin forzar ni prometer resultados.';
const message28='Estos 28 días son un ciclo inicial de aprendizaje, no una fecha límite para cambiar tu respuesta sexual. Conserva las prácticas que te resultaron cómodas y útiles, y repítelas con constancia según tu plan. El progreso puede variar; no necesitas provocar una respuesta sexual para demostrarlo. Si la dificultad persiste, empeora o te preocupa, consulta para valorar sus causas y si necesitas tratamiento adicional.';
const care='SPM complementa tu cuidado de la salud. No reemplaza una valoración médica ni tu tratamiento. Si tienes un medicamento prescrito para la función eréctil u otra condición, participar en el programa no es motivo para suspenderlo ni cambiar su dosis. Cualquier ajuste debe acordarse con el profesional que te lo indique.';
function valid(data){return data?.checkpointVersion===1&&metrics.every(([k])=>Object.hasOwn(data.metrics||{},k)&&(data.metrics[k]===null||Number.isInteger(data.metrics[k])&&data.metrics[k]>=0&&data.metrics[k]<=10))&&typeof data.reflection==='string'&&data.reflection.length<=2000&&typeof data.continuity==='string'&&data.continuity.length<=2000;}
function comparison(rows){return '<div style="overflow-x:auto"><table style="width:100%;text-align:left"><caption>Tu evolución percibida · 0 a 10</caption><thead><tr><th>Aspecto</th><th>Día 1</th><th>Día 14</th><th>Día 28</th></tr></thead><tbody>'+metrics.map(([key,label])=>'<tr><th>'+esc(label)+'</th>'+[1,14,28].map(d=>'<td>'+(valid(rows[d])&&rows[d].metrics[key]!==null?rows[d].metrics[key]:'Sin dato / no evaluable')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div><p>Autorregistros educativos, no escalas clínicas ni una medida objetiva. No se reemplazan datos faltantes por cero ni se interpreta una ausencia de registro como falta de mejoría.</p>';}
let cachedScope='',cachedRows={};
function assignment(c){
 const day=Number(c.day),known=scope(c)===cachedScope?cachedRows:{};
 if(day!==1&&day<14)return null;
 if(day>14&&day<28&&valid(known[14]))return null;
 return {id:'program-checkpoint',kind:'program-checkpoint',milestone:day===1?1:day<28?14:28,optional:true,optionalLabel:'SEGUIMIENTO · OPCIONAL',title:day===1?'Mi punto de partida':day===28?'Mi informe final y evaluación opcional':day===14?'Seguimiento · Día 14':'Recordatorio · Seguimiento del día 14',summary:day===28?'Consulta tu informe con la información disponible, aunque no hayas completado las evaluaciones.': 'Completar la evaluación nos ayuda a medir tu progreso y preparar tu informe final. Puedes continuar tus prácticas y responderla después.'};
}
async function readRows(captured,day){
 const rows={};
 if(window.SPM_DAILY_RECORDS.readCheckpoints){
  const stored=await window.SPM_DAILY_RECORDS.readCheckpoints(captured);
  for(const item of stored){const r=item.metadata,m=r?.milestone||item.day_number;if([1,14,28].includes(m)&&valid(r)&&item.day_number<=day)rows[m]=r;}
 }else{for(const d of [1,14,28].filter(d=>d<=day)){const data=await window.SPM_DAILY_RECORDS.read(captured,d);rows[d]=data['program-checkpoint'];}}
 if(scope(ctx())===captured){cachedScope=captured;cachedRows=rows;}return rows;
}
async function open(activity,edit=false){
 const c=ctx(),captured=scope(c),day=Number(c?.day);if(day!==1&&(day<14||day>28))return;const milestone=day===1?1:day<28?14:28;
 const host=document.getElementById('spmDailyWorkspace');if(!host)return;
 host.innerHTML='<p role="status">Recuperando tus seguimientos…</p>';
 const current=()=>scope(ctx())===captured&&Number(ctx()?.day)===day&&host.isConnected;
 let rows={};
 try{rows=await readRows(captured,day);if(!current())return;}
 catch{if(current())host.innerHTML='<p role="status">No pudimos cargar tus seguimientos. Vuelve a abrir esta actividad para reintentar; no se han cambiado tus datos.</p>';return;}
 const prior=valid(rows[milestone])?rows[milestone]:null;
 if((prior||day===28)&&!edit){showReport(rows,day,captured);return;}
 host.innerHTML='<form class="spm-daily-work" data-program-checkpoint><h3>'+esc(activity.title)+'</h3><p>'+(milestone===14?message14:day===28?message28:'Este es tu punto de partida. Valora cómo te has sentido últimamente; no necesitas hacer una prueba sexual. Si no puedes valorar algo, elige «No evaluable».')+'</p><p>0 = muy bajo; 10 = muy alto. Responde según tu experiencia, sin metas obligatorias.</p>'+metrics.map(([k,label])=>'<label>'+esc(label)+'<select name="'+k+'" required style="display:block;width:100%;min-height:44px"><option value="">Selecciona</option><option value="na" '+(prior?.metrics[k]===null?'selected':'')+'>No evaluable / no aplica</option>'+Array.from({length:11},(_,i)=>'<option value="'+i+'" '+(prior?.metrics[k]===i?'selected':'')+'>'+i+'</option>').join('')+'</select></label>').join('')+'<label>¿Qué has aprendido, qué ha sido útil o qué te ha costado?<textarea name="reflection" maxlength="2000" rows="3">'+esc(prior?.reflection)+'</textarea></label><label>'+(day===28?'Tu plan de continuidad: ¿qué vas a mantener y cuándo?':'¿Qué práctica cómoda quieres mantener o qué necesitas revisar?')+'<textarea name="continuity" maxlength="2000" rows="3">'+esc(prior?.continuity)+'</textarea></label><p>'+care+'</p><button type="submit" class="btn pri">Guardar y ver '+(day===28?'mi informe final':'mi seguimiento')+'</button><p role="status"></p></form>';
 const form=host.querySelector('form');
 form.onsubmit=async e=>{
  e.preventDefault();if(!form.reportValidity()||!current())return;
  const values=new FormData(form),record={checkpointVersion:1,milestone,submittedDay:day,metrics:Object.fromEntries(metrics.map(([k])=>[k,values.get(k)==='na'?null:Number(values.get(k))])),reflection:String(values.get('reflection')||''),continuity:String(values.get('continuity')||''),at:new Date().toISOString()};
  const button=form.querySelector('button');button.disabled=true;
  try{await window.SPM_DAILY_PRACTICE.saveActivity(activity.id,record,captured,day);if(scope(ctx())!==captured||Number(ctx()?.day)!==day)return;rows[milestone]=record;cachedScope=captured;cachedRows=rows;window.SPM_DAILY_PRACTICE.open({focus:false});showReport(rows,day,captured);}
  catch{button.disabled=false;form.querySelector('[role=status]').textContent='No se pudo guardar. Tus respuestas siguen aquí; revisa tu conexión y reintenta.';}
 };
 host.scrollIntoView({block:'start'});
}
function showReport(rows,day,captured){
 if(scope(ctx())!==captured)return;const milestone=day===1?1:day<28?14:28;
 const host=document.getElementById('spmDailyWorkspace');if(!host)return;
 host.innerHTML='<section class="spm-daily-work" data-program-report><h3>'+(day===28?'Tu informe final · SPM 28 días':'Tu seguimiento · Día '+day)+'</h3>'+([1,14,28].some(d=>d<=day&&!valid(rows[d]))?'<p>No contamos con todas tus evaluaciones de seguimiento. Tu informe reúne la información disponible; no podemos establecer una comparación completa de tu evolución. Esto no significa que no hayas progresado.</p>':'')+comparison(rows)+Object.values(rows).filter(r=>r?.submittedDay&&r.submittedDay!==r.milestone).map(r=>'<p>Seguimiento previsto para el día '+r.milestone+', respondido el día '+r.submittedDay+'. Refleja cómo te encontrabas al responder.</p>').join('')+'<h4>Lo que reconoces de tu proceso</h4><p>'+esc(rows[milestone]?.reflection||'No añadiste una reflexión.')+'</p><h4>Tu continuidad</h4><p>'+esc(rows[milestone]?.continuity||'Elige una práctica cómoda que quieras sostener y un momento realista para realizarla.')+'</p><p>'+(milestone===14?message14:day===28?message28:'Tu punto de partida quedó guardado. Volveremos a revisarlo en los días 14 y 28.')+'</p><p>'+care+'</p><button type="button" class="btn pri" data-checkpoint-back>Volver a mis actividades</button> <button type="button" class="btn sec" data-checkpoint-edit>Completar o revisar evaluación (opcional)</button> <button type="button" class="btn sec" data-checkpoint-copy>Copiar mi informe</button><p role="status"></p></section>';
 host.querySelector('[data-checkpoint-back]').onclick=()=>window.SPM_DAILY_PRACTICE.open();
 host.querySelector('[data-checkpoint-edit]').onclick=()=>open({id:'program-checkpoint',title:'Mi seguimiento · Día '+day},true);
 host.querySelector('[data-checkpoint-copy]').onclick=async()=>{try{await navigator.clipboard.writeText(host.querySelector('[data-program-report]').innerText);host.querySelector('[role=status]').textContent='Informe copiado.';}catch{host.querySelector('[role=status]').textContent='Puedes seleccionar el texto del informe y copiarlo manualmente.';}};
 host.scrollIntoView({block:'start'});
}
let fetched='';
window.addEventListener('spm:resourcecontext',async()=>{
 const c=ctx(),key=scope(c)+':'+c?.day;if(!c||!window.SPM_DAILY_RECORDS.readCheckpoints||key===fetched)return;fetched=key;
 try{await readRows(scope(c),Number(c.day));if(scope(ctx())===scope(c))window.dispatchEvent(new Event('spm:resourcecontext'));}catch{if(fetched===key)fetched='';}
});
window.SPM_PROGRAM_CHECKPOINT={open,valid,comparison,metrics,message14,message28,assignment,readRows};
})();
