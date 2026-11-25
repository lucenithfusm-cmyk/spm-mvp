(()=>{
const days=Object.keys(CONFIDENCE_ACTIVITIES).map(Number),titles=days.map(d=>CONFIDENCE_ACTIVITIES[d].title);
function open({host,day,prior={},save,exit}){
 const a=CONFIDENCE_ACTIVITIES[day],data=structuredClone(prior.answers||{}),modal=document.createElement('dialog'),stage=document.createElement('section');
 modal.className='ep-block';stage.className='ep-canvas';stage.setAttribute('aria-label',a.title);stage.style.backgroundImage='url(confianza-nuevas/d'+day+'.webp)';modal.append(stage);host.append(modal);modal.showModal();
 let saving=false,started=false,step=0;
 function leave(){window.SPM_PRACTICE_AUDIO.stop(modal);modal.remove();}
 modal.oncancel=e=>{e.preventDefault();if(!saving){leave();exit();}};
 function place(el,x,y,w,h){Object.assign(el.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});stage.append(el);return el;}
 function button(label,x,y,w,h,fn,cls='choice'){const b=document.createElement('button');b.type='button';b.className=cls;b.setAttribute('aria-label',label);b.onclick=()=>fn(b);return place(b,x,y,w,h);}
 const speaker=document.createElement('div');speaker.className='ep-speaker';speaker.innerHTML=SPM_PRACTICE_AUDIO.button(a.guide,'Escuchar guía');place(speaker,5,a.audio,45,6.3);
 const voice=document.createElement('button');voice.hidden=true;modal.append(voice);
 function say(text){SPM_PRACTICE_AUDIO.stop();voice.dataset.spmSpeak=text;voice.click();}
 function warn(text){const layer=document.createElement('button');layer.className='ep-notice';layer.innerHTML='<span role="alert"></span>';layer.firstChild.textContent=text;layer.onclick=()=>layer.remove();modal.append(layer);layer.focus();}
 function editor(label,value,commit){
  const form=document.createElement('form');form.className='conf-editor';form.innerHTML='<label><strong></strong><textarea maxlength="250"></textarea></label><footer><button type="button">Cancelar</button><button>Guardar</button></footer>';
  form.querySelector('strong').textContent=label;const field=form.querySelector('textarea');field.value=value||'';form.querySelector('button').onclick=()=>form.remove();form.onsubmit=e=>{e.preventDefault();commit(field.value.trim());form.remove();};stage.append(form);field.focus();
 }
 const controls=[];
 function pick(items,rects,key,multi=false,solid=false,cues=a.cues){
  items.forEach((label,i)=>{const b=button(label,...rects(i),()=>{
   if(multi){const values=new Set(data[key]||[]);if(values.has(label))values.delete(label);else values.add(label);data[key]=[...values];}else data[key]=label;
   refresh();if(!multi||data[key].includes(label))say(cues[i]);else SPM_PRACTICE_AUDIO.stop();
  },solid?'choice solid':'choice');if(solid)b.textContent=label;controls.push(()=>b.setAttribute('aria-pressed',String(multi?(data[key]||[]).includes(label):data[key]===label)));});refresh();
 }
 function refresh(){controls.forEach(update=>update());}
 if(a.rect){const [x,y,w,h,dy]=a.rect;pick(a.choices,i=>[x,y+dy*i,w,h],'choice',false,day===12);}
 if(day===12){['Preparación y enfoque','Práctica guiada','Cierre y registro'].forEach((text,i)=>button(text,38,76.6+i*2.8,54,2.7,()=>{const j=a.choices.indexOf(data.choice);if(j<0)return warn('Elige tu prioridad para escuchar la ruta.');say([a.cues[j],['Ensaya cómo bajarías el ritmo al notar esa señal.','Vuelve a la respiración cuando aparezca una expectativa.','Lleva la atención a un gesto que te ayude a sentir confianza.'][j],'Recuerda qué te ayudó y guarda tu prioridad.'][i]);}));}
 if(day===15){['Práctica individual','Contexto controlado','Experiencia compartida'].forEach((v,i)=>button(v,4+i*31,41,29,19,()=>say(['Practica a solas, sin prisa.','Prueba la misma habilidad en una situación familiar.','Si ambos se sienten cómodos, traslada la práctica a un momento compartido.'][i])));}
 if(day===21){data.notes||={};a.choices.forEach((v,i)=>{const edit=()=>{say(a.cues[i]);editor(a.cues[i],data.notes[i],value=>{data.notes[i]=value;refresh();});};button(v,3.6+i*32,41,30.5,19,edit);const b=button(a.cues[i],6,66.7+i*6.75,88,6.3,edit);controls.push(()=>b.setAttribute('aria-pressed',String(!!data.notes[i])));});refresh();}
 if(day===26){pick(a.cards,i=>[4.1+i%3*31,46.6+Math.floor(i/3)*13.6,29.8,12.8],'strategies',true);const b=button('Mi compromiso',5,75.5,71,9.5,()=>{data.commit=!data.commit;refresh();if(data.commit)say('Voy a mantener en mi rutina las estrategias que elegí.');},'choice solid');b.textContent='Mi compromiso · Mantener las estrategias que elegí';controls.push(()=>b.setAttribute('aria-pressed',String(!!data.commit)));refresh();}
 if(day===8){pick(a.cards,i=>[7.7,48.9+i*8.1,84.8,7.55],'choice');}
 if(day===10||day===17){pick(a.cards,i=>[5+i*31.4,day===10?56:67.4,28.5,day===10?12.6:17.8],'choice');}
 if(day===17){const r=document.createElement('input');r.type='range';r.min=0;r.max=10;r.value=data.activation??0;r.setAttribute('aria-label','Nivel de activación');const out=document.createElement('output');out.className='conf-output';out.textContent=data.activation===undefined?'Tu nivel de activación':'Activación · '+data.activation;r.oninput=()=>{data.activation=Number(r.value);out.textContent='Activación · '+r.value};r.onchange=()=>say('Tu nivel de activación es '+r.value+' de diez.');place(r,27,53,46,3);place(out,27,56,46,2.6);}
 if(day===5){
  data.factors||={};let column='Facilitadores';const fields=[];
  function panel(){fields.forEach((b,i)=>{const key=i?'Inhibidores':'Facilitadores';const values=Object.keys(data.factors).filter(f=>data.factors[f]===key);b.textContent=values.length?values.join(' · '):'+ Agregar factor';b.setAttribute('aria-pressed',String(column===key));});}
  ['Facilitadores','Inhibidores'].forEach((key,i)=>{const choose=()=>{column=key;panel();say('Toca abajo un factor para colocarlo en '+key.toLowerCase()+'.');};button(key,5+46*i,44,44,9.4,choose);fields.push(button('Agregar a '+key,7.5+46*i,54.7,39,10.4,choose,'choice solid'));});
  const factors=['Buen descanso','Actividad física','Conexión con mi pareja','Estrés','Alcohol','Uso excesivo de pantallas','Pensamientos negativos','Otro factor'];
  function assign(name){if(!name)return;if(data.factors[name]===column)delete data.factors[name];else Object.defineProperty(data.factors,name,{value:column,configurable:true,enumerable:true,writable:true});panel();say(name+(data.factors[name]?' en '+column.toLowerCase():', retirado del mapa')+'.');}
  factors.forEach((v,i)=>button(v,5+i%4*23,68.7+Math.floor(i/4)*8.3,22,7.8,()=>i===7?editor('Escribe tu factor','',assign):assign(v)));panel();
 }
 const guided=day===8||day===10;
 const practice=[8,10,17,23].includes(day);
 const finish=button(practice?'Iniciar práctica':day===22?'Aplicar hoy':'Continuar',11,a.finish,78,7.8,async b=>{
  if(saving)return;
  if(practice&&!started){
   if(day===23&&!data.choice)return warn('Elige una opción para iniciar.');
   started=true;b.className='timer-action';if(guided){data.choice=a.cards[0];refresh();}b.textContent=guided?'Siguiente momento':'Finalizar práctica';b.setAttribute('aria-label',b.textContent);say(guided?a.cues[0]:a.cues[Math.max(0,(a.cards||a.choices).indexOf(data.choice))]);return;
  }
  if(guided&&step<2){step++;data.choice=a.cards[step];refresh();say(a.cues[step]);if(step===2){b.textContent='Finalizar práctica';b.setAttribute('aria-label',b.textContent);}return;}
  if(day===5?!Object.keys(data.factors).length:day===21?!Object.values(data.notes).some(Boolean):day===26?!data.strategies?.length||!data.commit:!practice&&!data.choice)return warn('Completa tu selección para continuar.');
  saving=true;stage.inert=true;try{await save({answers:data,confirmed:true});leave();}catch{saving=false;stage.inert=false;warn('No se pudo guardar. Toca para reintentar.');}
 },'hit');
}
window.SPM_CONFIDENCE_NEW={days,titles,open};
})();
