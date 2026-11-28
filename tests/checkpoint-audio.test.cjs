// Current voice policy replaces historical recording-first assertions.
const {test}=require('node:test'),assert=require('node:assert/strict');
const {setup,read}=require('./helpers/device-voice-fixture.cjs');
function mount(h,text='Valora de cero a cuatro o No aplica.'){
 h.w.eval(read('premium-v2/practice-audio-v1.js'));h.w.eval(read('premium-v2/checkpoint-audio-v1.js'));
 const section=h.w.document.createElement('section');section.innerHTML=h.w.SPM_CHECKPOINT_AUDIO.markup({src:'historical.mp3',text});h.owner.append(section);h.w.SPM_CHECKPOINT_AUDIO.bind(section);return section;
}
test('checkpoint transcript is complete before playing and old src is never used',()=>{
 const h=setup();try{const node=mount(h);assert.equal(node.querySelector('details').open,false);assert.match(node.querySelector('details').textContent,/cero a cuatro o No aplica/);assert.equal(node.querySelector('audio'),null);assert.equal(h.calls.length,0);node.querySelector('button').click();assert.equal(h.calls.length,1);assert.equal(h.calls[0].voice,null);}finally{h.close();}
});
test('checkpoint pause, paragraph resume and completion update its real control',()=>{
 const h=setup();try{const node=mount(h),button=node.querySelector('button');button.click();h.calls[0].onstart();assert.match(button.textContent,/Pausar/);button.click();assert.equal(h.voice.paused,true);assert.match(button.textContent,/Reanudar desde este párrafo/);button.click();assert.equal(h.calls.length,2);h.calls[1].onend();assert.match(button.textContent,/Escuchar explicación/);}finally{h.close();}
});
test('checkpoint failure opens text with retry; another section cannot stop the active owner',()=>{
 const h=setup();try{const first=mount(h),second=mount(h,'Otra explicación.');second.querySelector('button').click();h.w.SPM_CHECKPOINT_AUDIO.stop(first);assert.equal(h.voice.state,'preparing');h.calls[0].onerror({error:'network'});assert.equal(second.querySelector('details').open,true);assert.match(second.querySelector('button').textContent,/Reintentar/);assert.equal(h.calls.length,1);}finally{h.close();}
});
