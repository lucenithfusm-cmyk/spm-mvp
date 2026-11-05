(()=>{
'use strict';
const policy=window.SPM_ASSESSMENT_POLICY,questions=window.ENGINE?.assessment?.questions||[];
const ctx=()=>window.SPM_RESOURCE_CONTEXT?.(),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pending=(c=ctx())=>c&&policy?policy.missing(questions,c.motives||[],c.answers||{}):[];
function notice(c){const items=pending(c);if(!items.length)return '';
 return `<aside class="notice warn" data-missing-assessment><b>Te falta completar parte de tu evaluación</b><p>Hay ${items.length} respuesta${items.length===1?'':'s'} pendiente${items.length===1?'':'s'}. Complétalas aquí para revisar cómo continuar con tu programa. No tienes que empezar de nuevo: conservamos tu día y tus actividades.</p><details><summary>Ver qué falta</summary><ul>${items.map(q=>`<li>${esc(q.prompt_es)}</li>`).join('')}</ul></details><button type="button" class="btn pri" data-complete-missing>Completar lo pendiente y continuar</button></aside>`;
}
function blocks(c,a){
 if(!a)return false;
 const educational=a.kind==='video'||a.kind==='ep-checkpoint'||a.kind==='confidence'||(a.kind==='worksheet'&&['baseline','context','checklist','review','progress','reassessment','script','planner','priorities','reframe','ifthen'].includes(a.lesson?.interaction))||(a.kind==='wellness'&&a.tip.category!=='movement');
 if(educational)return false;
 return pending(c).some(q=>q.section==='safety'||(a.kind==='pelvic'&&q.section==='pelvic_floor')||(a.kind==='wellness'&&a.tip.category==='movement'&&q.section==='health'));
}
function open(){
 const c=ctx();if(!c)return;
 let modal=document.getElementById('spmRecoveryDialog');if(modal)modal.remove();
 modal=document.createElement('dialog');modal.id='spmRecoveryDialog';modal.setAttribute('aria-labelledby','spmRecoveryTitle');
 const original=c.answers||{},draft={},scope=c.userId+':'+c.planId;
 const fields=policy.queue(questions,c.motives||[]).filter(q=>!policy.valid(q,original[q.id]));
 modal.innerHTML=`<header><span>SPM · CONTINUIDAD DE TU PROGRAMA</span><button type="button" data-close aria-label="Cerrar">Cerrar ×</button></header><h2 id="spmRecoveryTitle">Completa lo que falta.</h2><p>Usaremos estas respuestas para completar tu evaluación. Tu ruta y tu día ${c.day} se conservan. Una indicación de revisión profesional ya registrada no se elimina al llenar este formulario.</p><form><div data-fields></div><p data-recovery-status role="status"></p><button type="submit" class="btn pri">Guardar y volver a mi día ${c.day}</button><button type="button" class="btn sec" data-later>Volver sin guardar</button></form>`;
 const form=modal.querySelector('form'),container=modal.querySelector('[data-fields]'),status=modal.querySelector('[role=status]');
 for(const q of fields){
  const field=document.createElement('div');field.className='spm-recovery-field';field.dataset.question=q.id;const id='repair-'+q.id;
  const label=document.createElement('label');label.htmlFor=id;label.textContent=q.prompt_es;field.append(label);
  const input=document.createElement(q.type==='text'?'textarea':'select');input.id=id;input.name=q.id;
  if(q.type==='text'){input.rows=3;input.maxLength=2000;input.placeholder=q.placeholder_es||'Escribe tu respuesta';}
  else{
   input.append(new Option('Selecciona una respuesta',''));
   const opts=q.type==='boolean'?[{value:false,es:'No'},{value:true,es:'Sí'}]:q.type.startsWith('scale5')?[1,2,3,4,5].map((value,i)=>({value,es:['Muy bajo / nunca','Bajo / rara vez','Intermedio','Bueno / frecuente','Muy bueno / casi siempre'][i]})):q.options;
   for(const opt of opts)input.append(new Option(opt.es,String(opt.value)));
  }
  input.addEventListener(q.type==='text'?'input':'change',()=>{
   if(input.value==='')delete draft[q.id];else draft[q.id]=q.type==='boolean'?input.value==='true':q.type.startsWith('scale5')?Number(input.value):input.value;
   update();
  });field.append(input);container.append(field);
 }
 function update(){const answers={...original,...draft};for(const q of fields){const field=container.querySelector(`[data-question="${q.id}"]`),input=field.querySelector('select,textarea');field.hidden=!policy.visible(q,answers);input.disabled=field.hidden;input.required=!field.hidden;}}
 update();
 const close=()=>{modal.close();modal.remove();};modal.querySelector('[data-close]').onclick=close;modal.querySelector('[data-later]').onclick=close;
 form.onsubmit=async e=>{
  e.preventDefault();if(!form.reportValidity())return;
  const latest=ctx();if(!latest||latest.userId+':'+latest.planId!==scope){status.textContent='La sesión cambió. Cierra y vuelve a abrir la evaluación de tu cuenta.';return;}
  const answers={...original,...draft},patch=Object.fromEntries(fields.filter(q=>policy.visible(q,answers)&&Object.hasOwn(draft,q.id)).map(q=>[q.id,draft[q.id]]));
  if(policy.missing(questions,c.motives||[],answers).length){status.textContent='Revisa las preguntas pendientes antes de guardar.';return;}
  const controls=[...modal.querySelectorAll('button,input,select,textarea')];controls.forEach(b=>b.disabled=true);status.textContent='Guardando tus respuestas y recuperando tu programa…';
  try{
   await window.SPM_PROGRAM_REPAIR.save(patch,scope);
   close();window.SPM_DAILY_PRACTICE?.open();
  }catch{status.textContent='No pudimos guardar. Tus respuestas siguen aquí; revisa tu conexión y reintenta. Si completaste la evaluación en otra pestaña, cierra y vuelve a abrir este formulario.';controls.forEach(b=>b.disabled=false);update();}
 };
 document.body.append(modal);modal.showModal();
}
document.addEventListener('click',e=>{if(e.target.closest('[data-complete-missing]'))open();});
const style=document.createElement('style');style.textContent='#spmRecoveryDialog{box-sizing:border-box;width:min(760px,96vw);max-height:92dvh;overflow:auto;background:#0b242d;color:#edf8f6;border:1px solid #51767d;border-radius:24px;padding:clamp(20px,4vw,36px)}#spmRecoveryDialog::backdrop{background:#041015e8}#spmRecoveryDialog header{display:flex;align-items:center;justify-content:space-between;gap:16px}#spmRecoveryDialog header span{font-size:11px;letter-spacing:.12em;color:#7ee1c5}#spmRecoveryDialog p{line-height:1.65;color:#c2d1d4}#spmRecoveryDialog button{min-height:48px;margin:8px 8px 0 0}#spmRecoveryDialog [data-close]{color:#e8f5f2;background:#183842;border:1px solid #42646e;border-radius:10px;padding:10px 14px}.spm-recovery-field{padding:18px 0;border-top:1px solid #294851}.spm-recovery-field[hidden]{display:none}.spm-recovery-field label{display:block;font-weight:650;line-height:1.5;margin-bottom:10px}.spm-recovery-field select,.spm-recovery-field textarea{width:100%;box-sizing:border-box;background:#061b23;color:#f1f8f7;border:1px solid #51747a;border-radius:12px;padding:14px;font:inherit}.spm-recovery-field :focus-visible{outline:3px solid #e4c47f;outline-offset:3px}';document.head.append(style);
window.SPM_PROGRAM_RECOVERY={pending,notice,blocks,open};
})();
