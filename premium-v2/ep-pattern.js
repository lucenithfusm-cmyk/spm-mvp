window.openEpPattern = function ({host,lesson,prior={},save,exit,profile}) {
 const modal=document.createElement('dialog');
 modal.className='ep-pattern';
 host.append(modal);
 modal.showModal();
 const groups=[
  ['Con descanso adecuado','Cuando me siento físicamente bien','Con baja presión o estrés','Con buena conexión y confianza'],
  ['Con estrés o ansiedad','Tras consumo de alcohol','Con cansancio o falta de sueño','Cuando siento presión por el desempeño']
 ];
 const selected=groups.map((options,i)=>new Set(options.filter(label=>prior[i?'worse':'better']?.includes(label))));
 let page=0;
 function leave(){window.SPM_PRACTICE_AUDIO.stop(modal);modal.remove();exit();}
 modal.oncancel=e=>{e.preventDefault();leave();};
 function draw(){
  window.SPM_PRACTICE_AUDIO.stop(modal);
  modal.innerHTML='<section class="ep-stage"><button class="ep-close" aria-label="Volver a Hoy">×</button></section>';
  const stage=modal.firstChild;
  stage.querySelector('button').onclick=leave;
  stage.dataset.page=page;
  if(page===0&&profile&&profile!=='ejaculation'){const owner=document.createElement('span');owner.className='confidence-owner';owner.textContent='Confianza y ansiedad de desempeño';stage.append(owner);}
  function place(el,x,y,w,h){el.style.cssText+=';position:absolute;left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%';stage.append(el);}
  function control(label,x,y,w,h,run,cls){const b=document.createElement('button');b.type='button';b.className=cls;b.setAttribute('aria-label',label);b.onclick=run;place(b,x,y,w,h);return b;}
  const guide=document.createElement('div');
  guide.className='ep-voice';
  guide.innerHTML=window.SPM_PRACTICE_AUDIO.button(page?lesson.practice_es:lesson.learn_es,page?'Escuchar guía':'Escuchar indicación');
  if(page<2)place(guide,...(page?[4,16,43,6]:[9,67.5,82,9]));
  if(page===0)control('Abrir actividad',9,80,82,9,()=>{page++;draw();},'ep-hit');
  if(page===1){
   groups.forEach((options,g)=>options.forEach((label,i)=>{
    const chosen=selected[g];
    const b=control(label,i%2?50.7:4.2,(g?62.4:38.8)+Math.floor(i/2)*7.55,45.8,7.2,()=>{
     if(chosen.has(label))chosen.delete(label);
     else if(chosen.size<2)chosen.add(label);
     else return warn('Ya elegiste dos. Toca una opción marcada para cambiarla.');
     b.setAttribute('aria-pressed',String(chosen.has(label)));
    },'ep-option');
    b.dataset.group=g;b.textContent=label;b.setAttribute('aria-pressed',String(chosen.has(label)));
   }));
   control('Continuar',20,81.4,60,7,async event=>{
    if(selected.some(options=>options.size!==2))return warn('Selecciona dos contextos favorables y dos desfavorables para continuar.');
    if(stage.inert)return;
    stage.inert=true;
    modal.oncancel=e=>e.preventDefault();
    const [better,worse]=selected.map(options=>[...options]);
    try{
     const record={better,worse,reflection:'Favorables: '+better.join(' · ')+' | Desfavorables: '+worse.join(' · '),confirmed:true};
     if(prior.measure!==undefined)record.measure=prior.measure;
     if(await save(record)===false)throw Error();
     window.SPM_PRACTICE_AUDIO.stop(modal);
     modal.remove();
    }catch{
     stage.inert=false;
     modal.oncancel=e=>{e.preventDefault();leave();};
     warn('No se pudo guardar. Intenta nuevamente.');
    }
   },'ep-hit');
  }
  function warn(text){
   if(stage.querySelector('.ep-alert'))return;
   const previousFocus=document.activeElement;
   const msg=document.createElement('button');
   msg.type='button';
   msg.className='ep-alert';
   msg.setAttribute('role','alert');
   msg.textContent=text+' · Toca la pantalla para continuar.';
   stage.append(msg);
   modal.addEventListener('click',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    msg.remove();
    if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
   },{capture:true,once:true});
   msg.focus();
  }

 }
 draw();
};
