const {test}=require('node:test'),assert=require('node:assert/strict');
const {setup,read}=require('./helpers/device-voice-fixture.cjs');
function film(missing=false,lang='es'){
 const h=setup({missing});h.w.matchMedia=()=>({matches:false});h.w.SPM_LANG=lang;
 h.w.HTMLMediaElement.prototype.play=function(){return Promise.resolve()};h.w.setInterval=()=>1;h.w.clearInterval=()=>{};
 h.w.eval(read('premium-v2/commercial-journey-v1.js'));h.w.SPM_COMMERCIAL_PREVIEW.cinematic();
 h.$=selector=>h.w.document.querySelector(selector);return h;
}
for(const lang of ['es','en'])test('commercial '+lang+': no autoplay, full approved text, and ordered scene passages',()=>{
 const h=film(false,lang);try{
  assert.equal(h.calls.length,0);assert.equal(h.$('audio'),null);assert.equal(h.$('.spmFilmTranscript div').children.length,8);
  assert.equal(h.$('.spmJFinalBtn').hidden,false,'commercial continuation never requires listening');
  const text=h.$('.spmFilmTranscript div').textContent;
  h.$('.spmFilmAudio').click();
  for(let n=0;n<40&&h.voice.speaking;n++){const item=h.calls.at(-1);item.onstart();item.onend();}
  assert.equal(h.voice.state,'ended');assert.equal(h.$('[data-film-position]').textContent,'8 / 8');
  assert.equal(h.calls.map(u=>u.text).join('').replace(/\s/g,''),text.replace(/\s/g,''));
  assert.ok(h.calls.every(u=>u.voice===null&&u.lang===(lang==='es'?'es-CO':'en-US')));
  assert.ok(h.w.document.querySelectorAll('.spmBurst img').length>=26,'approved imagery remains');
 }finally{h.close()}
});
test('commercial pause repeats current paragraph and closing invalidates continuation',()=>{
 const h=film();try{
  h.$('.spmFilmAudio').click();const first=h.calls[0];first.onstart();h.$('.spmFilmPause').click();
  assert.equal(h.voice.state,'paused');assert.match(h.$('.spmFilmPause').textContent,/este párrafo/);
  h.$('.spmFilmPause').click();assert.equal(h.calls.at(-1).text,first.text);const late=h.calls.at(-1).onend;
  h.$('.spmFilmSkip').click();late();assert.equal(h.$('.spmJourney'),null);assert.equal(h.voice.state,'idle');assert.equal(h.calls.length,2);
 }finally{h.close()}
});
test('commercial text navigation and continuation stay usable without speech API',()=>{
 const h=film(true);try{
  h.$('.spmFilmAudio').click();assert.match(h.$('.spmFilmAudioState').textContent,/no está disponible/);
  h.$('[data-film-next]').click();assert.equal(h.$('[data-film-position]').textContent,'2 / 8');
  assert.equal(h.$('.spmJFinalBtn').hidden,false);h.$('.spmFilmSkip').click();assert.equal(h.$('.spmJourney'),null);
 }finally{h.close()}
});
