(()=>{
const days=[4,7,9,13,14,18,20,25,27];
const titles=['Atención sin examen','Revisión de la semana 1','Escala de excitación','Confianza basada en evidencia personal','Revisión intermedia','Comunicación que reduce la presión','Plan para una experiencia sexual','Prevención de recaídas','Ensayo autónomo'];
const audioY=[37,33,32,31.5,33.6,34.3,31,31,31];
const finishY=[89,89.5,90,86,86,88.5,89,89,89];
const labels={
 4:['Respiración','Contacto','Sensaciones'],
 7:['He notado algún avance','Identifiqué mejor mis disparadores','Me sentí más tranquilo y en control','Aún hay aspectos por reforzar'],
 13:['Mayor control del tiempo','Menos ansiedad o presión','Más tranquilidad y disfrute','Mejor conexión con mi pareja'],
 14:['< 1 min','1–2 min','2–5 min','> 5 min'],
 18:['Hablar antes de la relación sobre lo que me ayuda','Expresar durante el encuentro lo que siento y necesito','Acordar juntos un ritmo, pausas o cambios si lo necesito'],
 20:['Preparar un ambiente tranquilo y sin prisas','Enfocarme en las sensaciones','Conversar con mi pareja sobre lo que me ayuda','Aplicar las técnicas de control que he practicado'],
 25:['Estrés o cansancio acumulado','Falta de descanso adecuado','Consumo excesivo de alcohol','Pensamientos de presión o fracaso'],
 27:['Consolidar el control del tiempo de eyaculación','Disfrutar más de las sensaciones y la conexión','Sentirme más seguro y confiado en mi desempeño']
};
function open({host,day,prior={},save,exit,profile}){
 if(window.SPM_CONFIDENCE_NEW?.days.includes(day))return window.SPM_CONFIDENCE_NEW.open({host,day,prior,save,exit});
 const index=days.indexOf(day);if(index<0)return;
 const dialog=document.createElement('dialog');dialog.className='ep-block';
 const stage=document.createElement('section');stage.className='ep-canvas';
 stage.setAttribute('aria-label',titles[index]);stage.style.backgroundImage='url(ep-bloque/d'+day+'.webp)';
 host.append(dialog);dialog.append(stage);dialog.showModal();
 if(profile!=='ejaculation'){const owner=document.createElement('span');owner.className='confidence-owner';owner.textContent='Confianza y ansiedad de desempeño';stage.append(owner);}
 const answers=structuredClone(prior.answers||{}),groups=new Set();
 let timer=null,end=0,remaining=prior.secondsRemaining??300,busy=false;
 function close(){clearInterval(timer);window.SPM_PRACTICE_AUDIO.stop(dialog);dialog.remove();}
 dialog.oncancel=e=>{e.preventDefault();if(!busy){close();exit();}};
 function place(el,x,y,w,h){Object.assign(el.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});stage.append(el);return el;}
 function btn(name,x,y,w,h,fn,cls='hit'){
  const el=document.createElement('button');el.type='button';el.className=cls;el.setAttribute('aria-label',name);el.onclick=fn;return place(el,x,y,w,h);
 }
 function notice(message,photo=false){
  const layer=document.createElement('button');layer.className='ep-notice';layer.type='button';const card=document.createElement('span');card.setAttribute('role','alert');card.textContent=message;
  if(photo){const img=new Image();img.src='ep-bloque/ehs.jpg';img.alt='Guía visual de firmeza';card.prepend(img);}
  layer.append(card);dialog.append(layer);const previous=document.activeElement;layer.focus();layer.onclick=()=>{layer.remove();previous?.focus();};
 }
 const speaker=document.createElement('div');speaker.className='ep-speaker';
 speaker.innerHTML=window.SPM_PRACTICE_AUDIO.button(EP_DAY_VOICE[day],'Escuchar guía');
 place(speaker,5,audioY[index],day===4?49:45,6.5);
 // El controlador original mantiene una sola narración activa por documento.
 const instruction=document.createElement('button');instruction.type='button';instruction.hidden=true;
 dialog.append(instruction);
 function narrate(text){
  window.SPM_PRACTICE_AUDIO.stop();
  instruction.dataset.spmSpeak=text;
  instruction.click();
 }
 function options(key,items,rect,multi=false,style='',onChange){
  groups.add(key);
  const controls=items.map((name,i)=>{
   const b=btn(String(name),...rect(i),()=>{
    if(multi){const set=new Set(answers[key]||[]);if(set.has(name))set.delete(name);else set.add(name);answers[key]=[...set];}
    else answers[key]=name;
    paint();onChange?.(name);
    if(!multi||answers[key].includes(name))narrate(epChoiceSpeech(key,name,i));
    else window.SPM_PRACTICE_AUDIO.stop();
   },'choice '+style);
   if(style.includes('solid'))b.textContent=name;return b;
  });
  function paint(){controls.forEach((b,i)=>b.setAttribute('aria-pressed',String(multi?(answers[key]||[]).includes(items[i]):answers[key]===items[i])));}
  paint();
 }
 function scale(y,label,neutral=false){
  options(label,[0,1,2,3,4],i=>neutral?[8+i*18,y,12.5,5.6]:[5+i*18,y,18,8.6],false,neutral?'solid number':'');
 }
 const row=(y,h,step)=>i=>[6,y+i*step,88,h];
 const grid=y=>i=>[5+(i%2)*45.5,y+Math.floor(i/2)*7.9,44,7.3];
 if(day===4){
  options('focus',labels[4],i=>[4.7+i*31,51.3,29.5,14.5]);groups.delete('focus');
  const display=document.createElement('output');display.className='ep-time';place(display,41,69.8,33,6.6);
  const toggle=btn('Iniciar práctica',16,78.8,68,8.3,()=>{
   if(!remaining)return;
   if(end){window.SPM_PRACTICE_AUDIO.stop();tick();end=0;clearInterval(timer);}
   else{end=Date.now()+remaining*1000;timer=setInterval(tick,200);
    const focusIndex=labels[4].indexOf(answers.focus);
    narrate((remaining===300?"Comienza la práctica. ":"Retoma la práctica. ")+EP_CHOICE_VOICE.focus[Math.max(0,focusIndex)]);}
   update();
  },'timer-action');
  function update(){display.textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');toggle.textContent=!remaining?'Práctica completada':end?'Pausar práctica':remaining<300?'Reanudar práctica':'Iniciar práctica';toggle.setAttribute('aria-label',toggle.textContent);toggle.disabled=!remaining;}
  function tick(){if(end)remaining=Math.max(0,Math.ceil((end-Date.now())/1000));if(!remaining){end=0;clearInterval(timer);}update();}
  update();
 }
 if(day===7){options('semana',labels[7],row(47,4.8,5.4));scale(77.5,'progreso');}
 if(day===9){
  const dial=document.createElement('div');dial.className='dial';place(dial,24.4,43.7,51.2,11.1);const pointer=document.createElement('i');dial.append(pointer);
  function angle(n){pointer.hidden=n===undefined;pointer.style.transform='rotate('+(-78+15.6*n)+'deg)';}
  angle(answers.excitacion);
  options('excitacion',Array.from({length:11},(_,i)=>i),i=>[6.9+i*7.84,55.25,7.7,4.1],false,'solid level',angle);
  options('EHS',[1,2,3,4],i=>[6.5+22.1*i,70,20.8,17]);btn('Ver EHS',72,65.6,21,4.2,()=>{notice('Toca para volver a la actividad.',true);narrate('La escala EHS describe cuatro grados de firmeza. Cierra esta lámina y toca cada imagen para escuchar su explicación.');});
 }
 if(day===13){options('avances',labels[13],grid(47),true);scale(74,'confianza',true);}
 if(day===14){
  options('IELT',labels[14],i=>[4+i*23.3,51.7,22.6,8.7],false,'solid');
  const na=btn('No evaluable',34,60,32,2.4,()=>{answers.IELT='No evaluable';narrate('No evaluable esta semana. Puedes registrar tu experiencia global sin indicar un tiempo.');stage.querySelectorAll('.choice.solid').forEach(b=>b.setAttribute('aria-pressed','false'));na.setAttribute('aria-pressed','true');},'na');na.textContent='No evaluable';na.setAttribute('aria-pressed',String(answers.IELT==='No evaluable'));
  stage.addEventListener('click',e=>{if(e.target.matches('.choice.solid'))na.setAttribute('aria-pressed','false');});scale(71.8,'experiencia');
 }
 if(day===18){options('comunicacion',labels[18],i=>[4.2+i*31,50.4,30.7,18.1],false,'solid');scale(76.5,'comodidad');}
 if(day===20){options('prioridad',labels[20],row(46.6,5,5.3));scale(76.5,'preparacion');}
 if(day===25){options('situaciones',labels[25],grid(46.7),true);options('estrategia',['Respiración y relajación','Ejercicios de piso pélvico','Focalizarme en las sensaciones y el disfrute'],i=>[5+i*30,73.7,29.7,12.1]);}
 if(day===27){options('objetivo',labels[27],row(47.3,6,6.5));scale(75.7,'preparacion');}
 btn(day===4?'Siguiente':'Guardar y '+([9,18,27].includes(day)?'finalizar':'continuar'),12,finishY[index],76,7.6,async()=>{
  if(busy)return;
  if(day===4&&end){remaining=Math.max(0,Math.ceil((end-Date.now())/1000));end=0;clearInterval(timer);}
  if([...groups].some(k=>answers[k]===undefined||Array.isArray(answers[k])&&!answers[k].length))return notice('Selecciona una respuesta en cada sección para continuar.');
  busy=true;stage.inert=true;
  try{await save({answers,confirmed:true,...(day===4?{secondsRemaining:remaining,activeSec:300-remaining}:{})});close();}
  catch{stage.inert=false;busy=false;notice('No se pudo guardar. Toca para reintentar.');}
 });
}
function compose(main,support,c){
 const day=Number(c.day);
 const extraTitle=window.SPM_CONFIDENCE_NEW?.titles[window.SPM_CONFIDENCE_NEW.days.indexOf(day)];
 const title=extraTitle||(day===2?'Tu patrón real':titles[days.indexOf(day)]);
 if(!title)return {main,support};
 const tag=a=>({...a,title,confidenceDay:day,summary:'Abre la actividad guiada de hoy.',label:'CONFIANZA Y ANSIEDAD DE DESEMPEÑO'});
 const own=['confidence','anxiety','mixed','wellbeing','lifestyle','optimization'].includes(c.primary);
 if(own||(!extraTitle&&c.primary==='ejaculation')){
  if(main.kind==='sensate'){
   const lab=window.SPM_DAILY_SUPPORT?.activity('sensate',day,c);
   if(lab&&!support.some(a=>a.id===lab.id))support=[...support,{...lab,kind:'sensate'}];
   main={id:'main',kind:'worksheet',lesson:window.SPM_MODULES?.days.find(d=>d.d===day)};
  }
  main=tag(main);
 }else{
  support=support.map(a=>a.kind==='confidence'&&day!==14?tag(a):a);
  if(c.primary==='desire'&&day===13&&!support.some(a=>a.confidenceDay))
   support.push(tag({id:'support-confidence',kind:'confidence',optional:true}));
 }
 return {main,support};
}
window.SPM_CONFIDENCE_TOUCH={days,titles,open,compose};
})();
