const {test}=require('node:test');
const assert=require('node:assert/strict');
const {setup,read,tick}=require('./helpers/device-voice-fixture.cjs');
test('standard Spanish voice is not assigned by name or gender; no autoplay on load/voiceschanged',()=>{
 const h=setup({voices:[{name:'Sofía',lang:'es-CO',default:true,voiceURI:'sofia'},{name:'Male',lang:'es-ES',voiceURI:'male'}]});try{
  assert.equal(h.calls.length,0);h.setVoices([]);assert.equal(h.calls.length,0);
  h.voice.listen('Erección, pene y eyaculación. Escala cero a cuatro. No aplica.',{owner:h.owner});
  assert.equal(h.calls.length,1);assert.equal(h.calls[0].voice,null);assert.equal(h.calls[0].lang,'es-CO');assert.equal(h.calls[0].pitch,1);
  h.setVoices([{name:'Nueva voz',lang:'es-CO',voiceURI:'new'}]);assert.equal(h.calls.length,1);
 }finally{h.close();}
});
test('empty first voice inventory still attempts default, then finishes without writing progress',()=>{
 const h=setup();try{let ended=0;h.voice.listen('Lee o escucha esta guía.',{onend(){ended++;}});h.calls[0].onstart();assert.equal(h.voice.state,'playing');h.calls[0].onend();assert.equal(ended,1);assert.equal(h.voice.speaking,false);assert.equal(h.voice.state,'ended');assert.equal(h.w.localStorage.length,0);}finally{h.close();}
});
test('canceling or replacing a long narration invalidates saved late callbacks and queued paragraphs',()=>{
 const h=setup();try{let ended=0;h.voice.listen(('Texto para observar. ').repeat(80),{owner:h.owner,onend(){ended++;}});const old=h.calls[0],late=old.onend;h.voice.listen('Guía nueva.',{owner:h.owner});assert.equal(h.calls.length,2);late();assert.equal(h.calls.length,2);assert.equal(ended,0);assert.equal(h.calls[1].text,'Guía nueva.');h.voice.cancel();assert.equal(h.voice.state,'idle');}finally{h.close();}
});
test('long text retains complete order and punctuation across native chunks',()=>{
 const h=setup();try{const text=('Primera observación: pene, firmeza y respiración. ').repeat(35)+'No aplica.';h.voice.listen(text);let n=0;while(h.voice.state!=='ended'){const u=h.calls[n++];assert.ok(u);u.onstart();u.onend();assert.ok(n<100);}assert.equal(h.calls.map(u=>u.text).join(' '),text.trim());}finally{h.close();}
});
test('pause cancels one fragment and resume restarts that paragraph with an honest label',()=>{
 const h=setup();try{h.voice.listen('Primer párrafo.\nSegundo párrafo.');h.calls[0].onstart();const late=h.calls[0].onend;h.voice.pause();assert.equal(h.voice.state,'paused');assert.match(h.w.document.querySelector('[data-voice-toggle]').textContent,/Reanudar desde este párrafo/);late();assert.equal(h.calls.length,1);h.voice.resume();assert.equal(h.calls[1].text,'Primer párrafo.');h.calls[1].onend();assert.equal(h.calls[2].text,'Segundo párrafo.');}finally{h.close();}
});
test('API unavailable provides complete readable text and does not disable form actions',()=>{
 const h=setup({missing:true});try{h.owner.innerHTML='<button id="save">Guardar</button>';const text='La guía completa se puede leer sin escuchar.';assert.equal(h.voice.listen(text,{owner:h.owner}),false);assert.equal(h.voice.state,'error');assert.equal(h.w.document.querySelector('[data-voice-text]').textContent,text);assert.equal(h.owner.querySelector('button').disabled,false);}finally{h.close();}
});
test('not-allowed error and start watchdog give explicit recovery without retrying automatically',()=>{
 const h=setup();try{h.voice.listen('Guía');h.calls[0].onerror({error:'not-allowed'});assert.equal(h.voice.state,'error');assert.equal(h.calls.length,1);assert.match(h.w.document.querySelector('[data-voice-status]').textContent,/Pulsa Reintentar/);h.voice.retry();assert.equal(h.calls.length,2);for(const fn of [...h.timers.values()])fn();assert.equal(h.voice.state,'error');assert.match(h.w.document.querySelector('[data-voice-status]').textContent,/no llegó a iniciarse/);}finally{h.close();}
});
test('legacy onerror cleanup does not hide recovery, while a session change still removes the failed owner',()=>{
 const h=setup();try{
  h.voice.speak({text:'Guía completa para leer o reintentar.',onerror(){h.voice.cancel();}},{owner:h.owner});
  h.calls[0].onerror({error:'language-unavailable'});
  assert.equal(h.voice.state,'error');assert.equal(h.w.document.querySelector('.spm-device-voice').hidden,false);
  assert.equal(h.w.document.querySelector('[data-voice-text]').textContent,'Guía completa para leer o reintentar.');
  const details=h.w.document.querySelector('.spm-device-voice > details'),recovery=h.w.document.querySelector('[data-voice-recovery]');
  assert.equal(details.open,false);assert.equal(recovery.open,false);assert.equal(h.calls.length,1);
  details.querySelector('summary').click();recovery.querySelector('summary').click();
  assert.equal(details.open,true);assert.equal(recovery.open,true);assert.equal(h.calls.length,1);
  h.w.dispatchEvent(new h.w.Event('spm:session-change'));assert.equal(h.voice.state,'idle');assert.equal(h.w.document.querySelector('.spm-device-voice').hidden,true);
 }finally{h.close();}
});

test('watchdog recovery stays in normal flow and preserves explicit disclosure choices',()=>{
 const h=setup();try{
  h.owner.innerHTML='<img alt="Ilustración original"><nav><button type="button">Siguiente</button></nav>';
  const next=h.owner.querySelector('button');let navigation=0;next.onclick=()=>navigation++;
  h.voice.listen('Guía completa para leer o escuchar.',{owner:h.owner});
  const panel=h.w.document.querySelector('.spm-device-voice'),details=panel.querySelector('details'),recovery=panel.querySelector('[data-voice-recovery]');
  assert.equal(h.w.getComputedStyle(panel).position,'static');assert.equal(h.w.getComputedStyle(panel).zIndex,'');
  assert.equal(panel.parentElement,h.w.document.body);assert.equal(h.owner.nextElementSibling,panel);
  for(const fn of [...h.timers.values()])fn();
  assert.equal(h.voice.state,'error');assert.equal(details.open,false);assert.equal(recovery.open,false);
  assert.equal(panel.querySelector('[data-voice-summary]').getAttribute('aria-live'),'polite');
  details.querySelector('summary').click();
  const text=panel.querySelector('[data-voice-text]').closest('details');text.querySelector('summary').click();
  assert.equal(text.open,true);assert.equal(panel.querySelector('[data-voice-text]').textContent,'Guía completa para leer o escuchar.');
  recovery.querySelector('summary').click();assert.equal(recovery.open,true);
  recovery.querySelector('summary').click();details.querySelector('summary').click();
  h.setVoices([{name:'Español local',lang:'es-ES',voiceURI:'local'}]);
  assert.equal(details.open,false);assert.equal(recovery.open,false);assert.equal(h.calls.length,1);
  next.click();assert.equal(navigation,1);assert.equal(next.disabled,false);
  details.querySelector('summary').click();panel.querySelector('[data-voice-toggle]').click();
  assert.equal(h.calls.length,2);h.calls[1].onstart();panel.querySelector('[data-voice-toggle]').click();
  assert.equal(h.voice.state,'paused');panel.querySelector('[data-voice-toggle]').click();
  assert.equal(h.calls.length,3);panel.querySelector('[data-voice-stop]').click();
  assert.equal(h.voice.state,'idle');assert.equal(panel.hidden,true);
 }finally{h.close();}
});

test('full-screen and dialog activities keep the voice panel after their own content and controls',()=>{
 const h=setup();try{
  h.owner.innerHTML='<section class="spm-er-fullscreen"><img alt="Ilustración original"><nav><button type="button">Siguiente</button></nav></section>';
  const fullscreen=h.owner.firstElementChild,art=fullscreen.firstElementChild,nav=fullscreen.lastElementChild;
  h.voice.listen('Guía de la actividad.',{owner:h.owner});
  const panel=h.w.document.querySelector('.spm-device-voice');
  assert.equal(panel.parentElement,fullscreen);assert.equal(fullscreen.lastElementChild,panel);
  assert.equal(fullscreen.firstElementChild,art);assert.equal(art.nextElementSibling,nav);
  assert.equal(h.w.getComputedStyle(panel).position,'static');
  h.voice.cancel();
  const dialog=h.w.document.createElement('dialog');dialog.open=true;dialog.innerHTML='<button type="button">Escuchar guía</button>';
  h.w.document.body.appendChild(dialog);h.voice.listen('Guía dentro del diálogo.',{owner:dialog.querySelector('button')});
  assert.equal(panel.parentElement,dialog);assert.equal(dialog.lastElementChild,panel);assert.equal(panel.querySelector('details').open,false);
 }finally{h.close();}
});

test('iframe voice controls and transcript stay inside the invoking document with local styling',()=>{
 const h=setup();try{
  const dialog=h.w.document.createElement('dialog');dialog.open=true;
  const frame=h.w.document.createElement('iframe');dialog.appendChild(frame);h.w.document.body.appendChild(dialog);
  const child=frame.contentWindow;child.document.body.innerHTML='<img alt="Ilustración original"><nav><button type="button">Siguiente</button></nav>';
  child.eval(read('premium-v2/device-voice-v1.js'));child.SPM_VOICE.listen('Guía del visor.');
  const panel=child.document.querySelector('.spm-device-voice');
  assert.ok(panel);assert.equal(panel.parentElement,child.document.body);assert.equal(child.document.body.lastElementChild,panel);
  assert.equal(h.w.document.querySelector('.spm-device-voice'),null);assert.equal(child.getComputedStyle(panel).position,'static');
  const styleCount=child.document.head.querySelectorAll('style').length;
  h.setVoices([]);assert.equal(child.document.head.querySelectorAll('style').length,styleCount);
  panel.querySelector('summary').click();panel.querySelector('[data-voice-text]').closest('details').querySelector('summary').click();
  assert.equal(panel.querySelector('[data-voice-text]').textContent,'Guía del visor.');
  panel.querySelector('[data-voice-stop]').click();assert.equal(h.voice.state,'idle');
  assert.equal(panel.parentElement,h.w.document.body);assert.equal(panel.hidden,true);
 }finally{h.close();}
});
test('same-origin iframe shares ownership; muted video cannot cancel its narration',()=>{
 const h=setup();try{const frame=h.w.document.createElement('iframe');h.w.document.body.append(frame);const child=frame.contentWindow;child.eval(read('premium-v2/device-voice-v1.js'));assert.equal(child.SPM_VOICE.forWindow, h.voice.forWindow);child.SPM_VOICE.listen('Guía desde el visor.');assert.equal(h.calls.length,1);const video=child.document.createElement('video');video.muted=true;child.document.body.append(video);video.dispatchEvent(new child.Event('play',{bubbles:true}));assert.equal(h.voice.state,'preparing');video.muted=false;video.dispatchEvent(new child.Event('play',{bubbles:true}));assert.equal(h.voice.state,'idle');}finally{h.close();}
});
test('removing owner or changing session stops narration without resurrecting callbacks',async()=>{
 const h=setup();try{h.voice.listen('Guía',{owner:h.owner});const late=h.calls[0].onend;h.owner.remove();await tick();assert.equal(h.voice.state,'idle');late();assert.equal(h.calls.length,1);h.voice.listen('Otra guía');h.w.dispatchEvent(new h.w.Event('spm:session-change'));assert.equal(h.voice.state,'idle');}finally{h.close();}
});
test('default can be changed only by explicit recovery choice and reset to standard',()=>{
 const h=setup({voices:[{name:'Español local',lang:'es-ES',voiceURI:'local',localService:true}]});try{h.voice.listen('Guía');assert.equal(h.calls[0].voice,null);h.calls[0].onerror({error:'language-unavailable'});const selector=h.w.document.querySelector('[data-voice-selection]');selector.value='local';selector.dispatchEvent(new h.w.Event('change'));assert.equal(h.calls.length,1);h.voice.retry();assert.equal(h.calls[1].voice.voiceURI,'local');selector.value='';selector.dispatchEvent(new h.w.Event('change'));h.voice.retry();assert.equal(h.calls[2].voice,null);}finally{h.close();}
});
test('common practice/checkpoint controls ignore historical src and use only text/standard voice',()=>{
 const h=setup();try{h.w.eval(read('premium-v2/practice-audio-v1.js'));h.w.eval(read('premium-v2/checkpoint-audio-v1.js'));h.owner.innerHTML=h.w.SPM_CHECKPOINT_AUDIO.markup({src:'legacy.mp3',text:'Una escala de cero a cuatro o No aplica.'});h.w.SPM_CHECKPOINT_AUDIO.bind(h.owner);assert.equal(h.owner.querySelector('audio'),null);const b=h.owner.querySelector('button');b.click();assert.equal(h.calls.length,1);assert.match(h.calls[0].text,/No aplica/);h.calls[0].onstart();assert.match(b.textContent,/Pausar/);b.click();assert.equal(h.voice.state,'paused');b.click();assert.equal(h.calls.length,2);}finally{h.close();}
});
test('successive story turns are not mistaken for cancellation; no recorded recovery audio',()=>{
 const h=setup();try{h.owner.innerHTML='<section class="spm-v4"><button class="spm-v4-play">Escuchar historia</button><button class="spm-v4-pause">Pausar</button><p class="spm-v4-status"></p><div class="spm-v4-card patient"><p class="spm-v4-copy">Texto del paciente.</p></div><div class="spm-v4-card doctor"><p class="spm-v4-copy">Respuesta del Doctor SPM.</p></div></section>';h.w.eval(read('premium-v2/recovery-audio-controller-staging-v10.js'));h.owner.querySelector('button').click();h.calls[0].onstart();h.calls[0].onend();assert.equal(h.calls.length,2);assert.equal(h.calls[1].text,'Respuesta del Doctor SPM.');h.calls[1].onend();assert.match(h.owner.textContent,/Historia finalizada/);assert.equal(h.owner.querySelector('audio'),null);}finally{h.close();}
});

test('external canceled or interrupted speech releases state without reporting a playback failure',()=>{
 const h=setup();try{
  for(const error of ['canceled','interrupted']){
   let ended=0,canceled=0,failed=0;
   h.voice.listen('Guía que puede interrumpirse.',{onend:()=>ended++,oncancel:()=>canceled++,onerror:()=>failed++});
   const item=h.calls.at(-1);item.onstart();item.onerror({error});
   assert.equal(h.voice.state,'idle');assert.equal(canceled,1);assert.equal(ended,0);assert.equal(failed,0);
  }
 }finally{h.close()}
});

test('removing an iframe cancels its voice even when no pagehide event is delivered',async()=>{
 const h=setup();try{
  const frame=h.w.document.createElement('iframe');h.w.document.body.appendChild(frame);
  const child=frame.contentWindow;child.document.body.innerHTML='<section id="child-owner"></section>';
  child.eval(read('premium-v2/device-voice-v1.js'));
  let ended=0;child.SPM_VOICE.listen('Primero.\nSegundo.',{owner:child.document.querySelector('section'),onend:()=>ended++});
  const late=h.calls.at(-1).onend;frame.remove();await tick();late();
  assert.equal(h.voice.state,'idle');assert.equal(ended,0);assert.equal(h.calls.length,1);
 }finally{h.close()}
});
