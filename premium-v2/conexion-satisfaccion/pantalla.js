(() => {
  'use strict';
  const {activities,dimensions}=window.SPM_CONNECTION_CONTENT;
  const days=Object.keys(activities).map(Number), storageKey='conexion-satisfaccion';
  const supports={erection:[7,19],ejaculation:[10,16],desire:[13,24],confidence:[7,21],anxiety:[7,21],lifestyle:[19,24],optimization:[19,24],mixed:[13,21]};
  function compose(main,support,c){
    const a=activities[c.day];if(!a)return {main,support};
    const entry={kind:'connection',title:a.title,summary:a.practice,label:'CONEXIÓN Y SATISFACCIÓN SEXUAL'};
    if(c.primary==='wellbeing')return {main:{...entry,id:storageKey,optional:Number(c.day)===28},support};
    if(supports[c.primary]?.includes(Number(c.day)))return {main,support:[...support,{...entry,id:storageKey,optional:true,optionalLabel:'CONEXIÓN Y SATISFACCIÓN SEXUAL · OPCIONAL'}]};
    return {main,support};
  }
  const visible=(a,d)=>a.fields.filter(f=>(!f.when||d.mode===f.when)&&(d.mode!=='No aplica'||f.key==='mode'));
  const isScore=v=>v===null||Number.isInteger(v)&&v>=0&&v<=10;
  const valueLabel=v=>v===null?'No aplica':isScore(v)?v+'/10':'Sin registrar';
  function complete(day,r){
    const a=activities[day],d=r?.answers;if(!a||r?.connectionDay!==Number(day)||!d)return false;
    if(a.max && (d.topics?.length!==a.max || new Set(d.topics).size!==a.max || !d.topics.every(v=>a.topics.some(o=>o.label===v))))return false;
    return visible(a,d).every(f=>{
      const v=d[f.key];if(f.optional&&(v===undefined||v===''))return true;
      if(f.values==='scale')return isScore(v);
      if(f.values==='chosen')return d.topics?.includes(v);
      return f.values?f.values.includes(v):typeof v==='string'&&v.trim().length>0&&v.length<=400;
    });
  }
  function el(tag,cls='',text){const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  function button(label,fn,cls=''){const b=el('button',cls,label);b.type='button';b.onclick=fn;return b;}
  // Artwork and touch targets share the same midpoint as the viewport changes.
  function verticalPosition(percent){
    if(percent<=50)return 'calc(var(--cx-seam) * '+(percent/50)+')';
    const lower=(percent-50)/50;
    return 'calc(var(--cx-seam) * '+(1-lower)+' + '+(lower*100)+'%)';
  }
  function place(parent,n,[x,y,w,h]){
    Object.assign(n.style,{left:x+'%',width:w+'%',top:verticalPosition(y),bottom:'calc(100% - '+verticalPosition(y+h)+')'});
    n.classList.add('cx-placed');parent.append(n);return n;
  }
  function open({host,day,prior,baseline,save,exit,draftScope}){
    day=Number(day);const a=activities[day],audio=window.SPM_PRACTICE_AUDIO;
    const data=structuredClone(prior?.connectionDay===day?prior.answers:{});
    const draftKey=day===13 && draftScope ? 'spm-conexion-ritmo:'+draftScope : null;
    if(draftKey){
      try{const draft=JSON.parse(sessionStorage.getItem(draftKey));if(draft?.base===(prior?.revision||'')&&draft.answers)Object.assign(data,draft.answers);}catch{}
    }
    const modal=el('dialog','cx-dialog'),stage=el('section','cx-stage'),tools=el('div','cx-tools'),sheet=el('dialog','cx-sheet'),content=el('div','cx-content');
    modal.setAttribute('aria-label','Día '+day+' · '+a.title);sheet.append(content);modal.append(tools,stage,sheet);host.append(modal);modal.showModal();
    const source=window.SPM_CONNECTION_IMAGES?.[day]||'conexion-satisfaccion/d'+day+'.webp';
    for(const half of ['top','bottom']){
      const band=el('div','cx-band cx-band-'+half),img=el('img','cx-art');
      img.alt='';img.src=source;band.append(img);stage.append(band);
    }
    const voice=button('',null,'cx-voice');voice.tabIndex=-1;voice.setAttribute('aria-hidden','true');voice.dataset.spmDeviceVoice='true';modal.append(voice);
    const say=text=>{audio.stop();voice.dataset.spmSpeak=text;voice.click();};
    let busy=false,ctx,trigger;
    function tone(freq){
      try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
        ctx ||= new AC();const at=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain();
        osc.frequency.value=freq;gain.gain.setValueAtTime(.024,at);gain.gain.exponentialRampToValueAtTime(.001,at+.09);osc.connect(gain);gain.connect(ctx.destination);osc.start(at);osc.stop(at+.095);
      }catch{}
    }
    const observer=new MutationObserver(()=>{if(!modal.isConnected){observer.disconnect();if(ctx&&ctx.state!=='closed')ctx.close().catch(()=>{});}});
    observer.observe(host.getRootNode(),{childList:true,subtree:true});
    function remove(){audio.stop(modal);modal.remove();}
    function leave(){if(!busy){remove();exit();}}
    function closeSheet(){if(busy)return;audio.stop(modal);sheet.close();trigger?.focus({preventScroll:true});}
    modal.oncancel=e=>{e.preventDefault();leave();};sheet.oncancel=e=>{e.preventDefault();e.stopPropagation();closeSheet();};
    function panel(title){
      content.replaceChildren();const header=el('header','cx-head'),h=el('h2','',title);h.id='cx-panel-title';sheet.setAttribute('aria-labelledby',h.id);
      header.append(el('small','','DÍA '+day+' DE 28'),h,button('Cerrar',closeSheet,'cx-close'));content.append(header);
      if(!sheet.open){trigger=document.activeElement;sheet.showModal();}sheet.scrollTop=0;
    }
    function hit(label,rect,fn,cls=''){const b=button(label,fn,'cx-hit '+cls);b.setAttribute('aria-label',label);return place(stage,b,rect);}
    tools.append(button('‹ Volver',leave));
    const guide=button('◖))  Guía',null,'cx-audio');guide.dataset.spmSpeak=a.guide;guide.dataset.spmDeviceVoice='true';guide.dataset.audioLabel='Escuchar guía';guide.setAttribute('aria-label','Escuchar guía');
    if(a.guideOverlay){
      guide.replaceChildren();
      const icon=el('span','cx-guide-icon');icon.setAttribute('aria-hidden','true');
      guide.append(icon,el('b','','Escuchar guía'));guide.classList.add('cx-guide-main','cx-pulse');
      place(stage,guide,a.guideOverlay);
    }else if(a.speaker){guide.classList.add('cx-hit','cx-pulse');place(stage,guide,a.speaker);}else tools.append(guide);
    tools.append(button('Leer guía',()=>{panel('Guía de la actividad');content.append(el('p','',a.guide));}));
    const topicButtons=[],scoreButtons=[];
    function update(){for(const [b,v] of topicButtons)b.setAttribute('aria-pressed',String((data.topics||[]).includes(v)));for(const [b,k] of scoreButtons)b.textContent=data[k]===undefined?'Elegir ›':valueLabel(data[k]);}
    function choose(o){
      const selected=data.topics||[],had=selected.includes(o.label);
      data.topics=had?selected.filter(v=>v!==o.label):a.multi?[...selected,o.label]:[o.label];
      if(data.explore&&!data.topics.includes(data.explore))delete data.explore;
      update();tone(had?340:530);if(had)audio.stop();else say(o.cue);return true;
    }
    a.topics?.forEach((o,i)=>{
      let rect=a.rects?.[i];if(!rect){const [x,y,w,h,cols]=a.grid,rows=Math.ceil(a.topics.length/cols);rect=[x+i%cols*w/cols,y+Math.floor(i/cols)*h/rows,w/cols,h/rows];}
      if(day===10){hit('Escuchar: '+o.label,rect,()=>say(o.cue),'cx-listen');}
      else if(day===13){
        const key=['preferences','timing','closeness'][i];
        rhythmButton(o.label,rect,key,o.cue);
      }else topicButtons.push([hit(o.label,rect,()=>choose(o),'cx-topic'),o.label]);
    });
    if([21,24].includes(day)){hit('Volver al recorrido',[0,0,12,7],leave);hit('Ir a Hoy',[87,0,13,7],leave);}
    if(day===28)hit('Volver al recorrido',[0,0,12,7],leave);
    if(day===7)hit('Explorar mis preferencias',[41,61,18,13],()=>form('preference'));
    function rhythmButton(title,rect,key,cue){
      const b=hit(title,rect,()=>{
        panel(title);
        const item=a.fields.find(f=>f.key===key);
        content.append(el('p','',cue));say(cue);
        const editor=el('form','cx-form'),label=el('label','cx-field'),input=el('textarea');
        input.name=key;input.value=data[key]||'';input.rows=3;input.maxLength=400;input.required=!item.optional;
        label.append(el('span','',item.label),input);editor.append(label);
        const submit=el('button','cx-primary','Guardar y volver');submit.type='submit';editor.append(submit);content.append(editor);
        editor.onsubmit=e=>{
          e.preventDefault();const value=input.value.trim();
          if(!value && input.required){input.setCustomValidity('Escribe tu respuesta.');input.reportValidity();input.oninput=()=>input.setCustomValidity('');return;}
          data[key]=value;
          if(key==='other'&&value)data.mode='En pareja';
          if(!data.mode)data.mode='Individual';
          if(draftKey){try{sessionStorage.setItem(draftKey,JSON.stringify({base:prior?.revision||'',answers:data}));}catch{}}
          b.classList.toggle('cx-answered',!!value);closeSheet();tone(540);
        };
      },'cx-detail');
      b.classList.toggle('cx-answered',!!data[key]);
    }
    if(day===13){
      rhythmButton('Mi ritmo',[17,51,24,11],'rhythm','Piensa en el tiempo que necesitas para sentir deseo y en el ritmo que disfrutas durante el encuentro.');
      rhythmButton('Su ritmo',[59,51,24,11],'other','Si tienes pareja, recuerda qué te ha dicho sobre el ritmo que disfruta. Puedes dejar este apartado en blanco.');
      rhythmButton('Nuestro punto de encuentro',[29,66,43,7.5],'agreement','Anota un acuerdo que respete los ritmos de ambos. Si haces la actividad a solas, anota qué quieres respetar de tu propio ritmo.');
    }
    if(day===16)hit('Escribir mi frase',[14,77,80,8],()=>form('enjoy'));
    if(day===28)hit('Escribir mi reflexión',[8,73,84,8.7],()=>form('reflection'));
    function pickScore(k,label){
      panel(label);content.append(el('p','','Elige un valor de 0 a 10 o selecciona «No aplica».'));const grid=el('div','cx-numbers');content.append(grid);
      for(const v of [...Array(11).keys(),null]){
        const b=button(v===null?'No aplica':v,()=>{data[k]=v;update();closeSheet();tone(520);say(label+'. '+valueLabel(v).replace('/10',' de diez')+'.');});
        b.setAttribute('aria-pressed',String(data[k]===v));grid.append(b);
      }
    }
    if(day===1||day===28){
      const final=day===28,box=el('div','cx-ratings'+(final?' cx-final':'')),head=el('div','cx-rating-head');
      head.append(el('strong','',final?'Mi experiencia · 0–10':'Valora hoy tu experiencia · 0–10'));if(final)head.append(el('span','','Día 1'),el('span','','Hoy'));box.append(head);
      dimensions.forEach((label,i)=>{const k='score'+i,b=button('',()=>pickScore(k,label),'cx-row');b.setAttribute('aria-label','Valorar '+label);b.append(el('strong','',label));if(final)b.append(el('span','',valueLabel(baseline?.[k])));const span=el('span','cx-value');b.append(span);box.append(b);scoreButtons.push([span,k]);});
      place(stage,box,final?[2.3,38.5,95.4,29]:[2,43.4,96,38.3]);
    }
    update();
    function form(focusKey){
      panel(a.title);content.append(el('p','cx-instruction',a.practice));const f=el('form','cx-form');content.append(f);
      if(day===10){
        const group=el('fieldset','cx-pair');
        group.append(el('legend','','Mis dos elecciones'));
        for(let i=0;i<2;i++){
          const select=el('select'),label=el('label','cx-field');
          select.name='choice'+i;select.required=true;
          const empty=el('option','','Elegir…');empty.value='';select.append(empty);
          for(const o of a.topics){
            const option=el('option','',o.label);option.value=o.label;option.disabled=data.topics?.[1-i]===o.label;select.append(option);
          }
          select.value=data.topics?.[i]||'';
          select.onchange=()=>{
            data.topics||=[];data.topics[i]=select.value;
            if(!data.topics.includes(data.explore))delete data.explore;
            form(select.name);
          };
          label.append(el('span','',i?'Segunda opción':'Primera opción'),select);group.append(label);
        }
        f.append(group);
      }
      for(const item of visible(a,data)){
        const k=item.key,label=el('label','cx-field');label.append(el('span','',item.label+(item.optional?' · opcional':'')));
        let input;
        if(!item.values){input=el('textarea');input.maxLength=400;input.rows=2;input.value=data[k]||'';input.oninput=()=>{data[k]=input.value;};}
        else{
          input=el('select');const empty=el('option','','Elegir…');empty.value='';input.append(empty);
          const vals=item.values==='scale'?[...Array(11).keys(),null]:item.values==='chosen'?(data.topics||[]).filter(Boolean):item.values;
          for(const v of vals){const o=el('option','',v===null?'No aplica':v);o.value=v===null?'na':v;input.append(o);}
          input.value=data[k]===null?'na':data[k]??'';
          input.onchange=()=>{if(input.value==='')delete data[k];else data[k]=item.values==='scale'?(input.value==='na'?null:Number(input.value)):input.value;update();tone(470);if(k==='mode')form('mode');};
        }
        input.name=k;input.required=!item.optional;label.append(input);f.append(label);
      }
      const err=el('p','cx-error');err.setAttribute('role','alert');const finishLabel=day===13?'Finalizar actividad':'Guardar y finalizar';const submit=el('button','cx-primary',finishLabel);submit.type='submit';f.append(err,submit);
      f.onsubmit=async e=>{
        e.preventDefault();if(busy)return;
        const answers={};if(data.topics?.length&&data.mode!=='No aplica')answers.topics=[...data.topics];
        for(const item of visible(a,data))if(Object.hasOwn(data,item.key)){const v=data[item.key];answers[item.key]=typeof v==='string'?v.trim():v;}
        const record={connectionDay:day,answers,confirmed:true};
        if(!complete(day,record)){err.textContent=a.max?'Elige dos formas de intimidad para continuar.':'Completa las respuestas pendientes.';return;}
        busy=true;submit.disabled=true;submit.textContent='Guardando…';audio.stop(modal);
        if(day===13)record.revision=crypto.randomUUID();
        try{await save(record);if(draftKey){try{sessionStorage.removeItem(draftKey);}catch{}}remove();}catch{busy=false;submit.disabled=false;submit.textContent=finishLabel;err.textContent='No se pudo guardar. Tus respuestas siguen aquí. Vuelve a intentarlo.';}
      };
      if(focusKey)f.elements.namedItem(focusKey)?.focus();
    }
    if(a.back)hit('Anterior',a.back,leave);
    if(day===10 || day===13){
      const title=day===10?'Elegir mis dos opciones':'Finalizar';
      place(stage,button(title,()=>{tone(650);form();},'cx-action-main'),a.next);
      if(day===10){
        place(stage,el('p','cx-listen-hint','Toca cada imagen para escuchar su explicación.'),[2.4,66.7,95.2,13.6]);
      }
    }else hit(day===28?'Finalizar':'Continuar con mi práctica',a.next,()=>{tone(650);form();},'cx-pulse');
  }
  window.SPM_CONNECTION={days,storageKey,compose,open,complete};
})();
