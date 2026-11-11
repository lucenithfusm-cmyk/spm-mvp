const fs=require('node:fs'),assert=require('node:assert/strict'),{test}=require('node:test');
const {JSDOM}=require('jsdom');
const KEY='spm_free_assessment_v2';
function harness(saved,language='es',media={}){
 const dom=new JSDOM(fs.readFileSync('premium-v2/free-assessment.html','utf8'),{url:'https://spm.test/premium-v2/free-assessment.html',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,intervals=[];
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollTo=function(){};w.setTimeout=()=>1;w.setInterval=f=>{intervals.push(f);return intervals.length};
 let plays=0;const playing=new WeakSet();
 Object.defineProperty(w.HTMLMediaElement.prototype,'paused',{get(){return !playing.has(this)}});
 w.HTMLMediaElement.prototype.play=function(){plays++;if(media.blockAutoplay&&plays===1)return Promise.reject(new w.DOMException('Autoplay blocked','NotAllowedError'));playing.add(this);this.dispatchEvent(new w.Event('play'));return Promise.resolve()};
 w.HTMLMediaElement.prototype.pause=function(){if(playing.delete(this))this.dispatchEvent(new w.Event('pause'))};
 if(media.previouslyPaused)w.sessionStorage.setItem('spm_assessment_ready_audio_paused','1');
 w.SPM_LANGUAGE={get:()=>language,set:next=>{language=next;w.dispatchEvent(new w.Event('spm:languagechange'))}};
 w.supabase={createClient:()=>({auth:{onAuthStateChange:()=>{},getUser:async()=>({data:{user:null}})},from:()=>{throw Error('Anonymous flow must not write patient records')}})};
 let checkoutCalls=0;w.SPM_PAYMENTS={configuration:async()=>({ready:true,environment:'prod'}),checkout:async()=>{checkoutCalls++}};
 if(saved)w.localStorage.setItem(KEY,saved);
 for(const file of ['guest-entry-v1.js','engine.js','health-intake-v2.js','modules.js','evaluation-refresh-v1.js','commercial-journey-v1.js','commercial-conversion-v1.js','assessment-app-v3.js'])w.eval(fs.readFileSync('premium-v2/'+file,'utf8'));
 w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
 // JSDOM also schedules its own event; the real page boots only once.
 w.document.addEventListener('DOMContentLoaded',e=>e.stopImmediatePropagation(),{capture:true,once:true});
 const $=s=>w.document.querySelector(s),record=()=>JSON.parse(w.localStorage.getItem(KEY));
 function finish(overrides={}){let n=0;while(!$('#quizCard').hidden){assert(++n<100);const q=w.ENGINE.assessment.questions.find(q=>q.prompt_es===$('#qbox h3').textContent);if(q.type==='text'){const e=$('#qbox textarea');e.value='Synthetic QA';e.dispatchEvent(new w.Event('input'))}else{const buttons=[...w.document.querySelectorAll('#qbox .opt')];const index=(q.type||'').startsWith('scale')?(overrides[q.id]??3)-1:0;buttons[index].click()}$('#qNext').click();if($('.spmPoster'))$('.spmPoster').click()}}
 return {w,$,record,finish,plays:()=>plays,checkoutCalls:()=>checkoutCalls,close:()=>{w.dispatchEvent(new w.Event('pagehide'));w.close()},watch:()=>intervals.forEach(f=>f())};
}
function completed(motives=['erection','confidence','desire']){const h=harness();h.$('#spmGuestStart').click();h.$('[data-age="1"]').click();for(const k of motives)h.$('[data-motive="'+k+'"]').click();h.$('#motiveNext').click();h.finish({c_fail:5,l_stress:5,l_sleep:2,d_desire:1});return h}
test('first assessment shows supported partial guidance, not the offer or detailed scores',()=>{
 const h=completed();try{assert(h.$('.spmGuestResult'));assert.match(h.$('.spmGuestResult').textContent,/Hemos analizado tus respuestas/);assert.match(h.$('.spmGuestSignals').textContent,/Presión por el desempeño/);assert.match(h.$('.spmGuestSignals').textContent,/Deseo e interés sexual/);assert.match(h.$('.spmGuestResult').textContent,/Sin mensualidades, anualidades ni cobros recurrentes/);assert(!h.$('.spmGuestResult #domainGrid'));h.$('#map').classList.add('on');h.watch();assert(!h.$('.spmGate'),'Legacy watchers must not cover the initial guidance');assert.equal(h.checkoutCalls(),0);}finally{h.close()}
});
test('returning completed visitor keeps the next step and can review, correct, or restart safely',()=>{
 const first=completed(),saved=first.w.localStorage.getItem(KEY);first.close();const h=harness(saved);
 try{assert.match(h.$('.spmGuestReadyBadge').textContent,/Tu evaluación ya está lista/);assert(h.$('#spmGuestOffer'));assert.equal(h.$('.spmGuestReturnDetails').open,false);assert.equal(h.$('.spmGuestAssessmentActions').open,false);assert.equal(h.$('.spmGuestReturn #spmGuestHome'),null);const answers=h.record().draft.answers;h.$('.spmGuestAssessmentActions summary').click();h.$('#spmGuestReview').click();assert.equal(h.$('#motiveCard').hidden,false);assert.deepEqual(h.record().draft.answers,answers);assert.equal(h.$('[data-motive="erection"]').getAttribute('aria-pressed'),'true');h.$('#motiveNext').click();h.finish({c_fail:1,l_stress:1,l_sleep:5,d_desire:5});assert(!/Presión por el desempeño/.test(h.$('.spmGuestSignals').textContent));h.$('#spmGuestRestart').click();h.$('#spmGuestRestartCancel').click();assert(h.$('.spmGuestResult'));h.$('#spmGuestRestart').click();h.$('#spmGuestRestartConfirm').click();assert.equal(h.$('#ageCard').hidden,false);assert.deepEqual(h.record().draft.answers,{});assert.equal(h.record().receipt,null);assert.equal(h.checkoutCalls(),0);}finally{h.close()}
});
test('saved pre-payment return allows correction and invalidates the old assessment receipt',async()=>{
 const first=completed(),r=first.record();r.receipt={userId:'qa',assessmentId:'old-assessment',mapId:'old-map'};first.close();const h=harness(JSON.stringify(r));
 try{assert(h.$('#spmGuestPay'));assert(h.$('#spmGuestReview'));assert(h.$('#spmGuestRestart'));assert.match(h.$('.spmGuestAccount').textContent,/Tu evaluación ya está lista/);await new Promise(resolve=>setImmediate(resolve));assert.equal(h.$('#spmGuestPay').disabled,false);h.$('#spmGuestReview').click();assert.equal(h.record().receipt.assessmentId,'old-assessment');h.$('[data-motive="desire"]').click();assert.equal(h.record().receipt,null);assert.equal(h.checkoutCalls(),0);}finally{h.close()}
});
test('offer avoids duplicate reassessment CTAs; privacy is visible only on the first welcome',()=>{
 const fresh=harness();try{assert.match(fresh.$('.spmGuestPrivacyStatement').textContent,/evaluación es privada/);fresh.$('#spmGuestStart').click();assert.equal(fresh.$('#ageCard .spmGuestPrivacyCard'),null);assert.match(fresh.$('#ageCard').textContent,/orientación inicial/);assert(fresh.$('#ageCard [data-age="1"]'));assert(fresh.$('#ageCard [data-age="0"]'));}finally{fresh.close()}
 const h=completed();try{h.$('#spmGuestOffer').click();assert(h.$('.spmOfferFilm'));assert.match(h.$('.spmOfferPurchasePrice').textContent,/Sin mensualidades ni anualidades/);assert.equal(h.$('[data-guest-review]'),null);assert(h.$('.spmGuestPostSteps'));assert.equal(h.w.document.querySelectorAll('.spmGuestPostSteps').length,1);assert(h.$('.spmGuestPostSteps').compareDocumentPosition(h.$('.spmOfferPurchase'))&h.w.Node.DOCUMENT_POSITION_FOLLOWING);assert.equal(h.$('[data-guest-restart]'),null);h.$('[data-guest-result]').click();assert(!h.$('.spmGate'));assert(h.$('.spmGuestResult'));h.$('#spmGuestOffer').click();h.$('.startPay').click();assert(h.$('#spmGuestAccountForm'));assert.equal(h.$('#spmGuestReview'),null);assert.equal(h.$('#spmGuestRestart'),null);}finally{h.close()}
});
test('urgent flags remain visible and cannot be bypassed by reopening the assessment',()=>{
 const first=completed(),r=first.record();r.draft.answers.s_cardiac=true;r.receipt={assessmentId:'old-assessment'};first.close();const h=harness(JSON.stringify(r));
 try{assert(h.$('.spmGuestSafety.urgent'));assert(!h.$('#spmGuestOffer'));assert(!h.$('#spmGuestPay'));assert(h.$('#spmGuestReview'));assert.equal(h.$('#spmGuestMotivationAudio'),null);assert.equal(h.plays(),0);assert.equal(h.checkoutCalls(),0);}finally{h.close()}
});
test('English return screen retains review, privacy and one-time payment information',()=>{
 const first=completed(),saved=first.w.localStorage.getItem(KEY);first.close();const h=harness(saved,'en');
 try{assert.match(h.$('.spmGuestResult').textContent,/Your assessment is ready/);assert.match(h.$('.spmGuestResult').textContent,/No monthly, annual or recurring charges/);assert.equal(h.$('#spmGuestReview').textContent,'Edit my answers');assert.match(h.$('#spmGuestMotivationAudio').src,/-en\.mp3$/);assert.equal(h.$('.spmGuestPrivacyCard'),null);}finally{h.close()}
});

test('returning without a valid session goes to sign-in before checkout',async()=>{
 const first=completed(),r=first.record();r.receipt={userId:'qa',assessmentId:'old-assessment',mapId:'old-map'};first.close();const h=harness(JSON.stringify(r));
 try{await new Promise(resolve=>setImmediate(resolve));h.$('#spmGuestPay').click();await new Promise(resolve=>setImmediate(resolve));assert(h.$('#spmGuestAccountForm'));assert.equal(h.$('#spmGuestPassword').autocomplete,'current-password');assert.equal(h.checkoutCalls(),0);}finally{h.close()}
});

test('return messaging follows the selected goal in all six domains without changing answers',()=>{
 for(const [motive,focus,word] of [['erection','erection','firmeza'],['ejaculation','ejaculation','ritmo'],['desire','desire','deseo'],['confidence','confidence','calma'],['wellbeing','wellbeing','sensaciones'],['optimization','lifestyle','hábitos']]){
  const first=completed([motive]),r=first.record();first.close();const h=harness(JSON.stringify(r));
  try{assert.equal(h.$('.spmGuestReturn').dataset.focus,focus);assert(h.$('.spmGuestReturn h1').textContent.includes(word));assert.equal(h.$('.spmGuestReturnKeywords').children.length,1);assert.deepEqual(h.record().draft.answers,r.draft.answers);assert.equal(h.checkoutCalls(),0)}finally{h.close()}
 }
});

test('blocked autoplay leaves a working play control and never steals the next click',async()=>{
 const first=completed(),saved=first.w.localStorage.getItem(KEY);first.close();const h=harness(saved,'es',{blockAutoplay:true});
 try{
  await new Promise(resolve=>setImmediate(resolve));assert.equal(h.plays(),1);const audio=h.$('#spmGuestMotivationAudio'),control=h.$('#spmGuestMotivationToggle');assert.equal(control.dataset.state,'idle');assert(audio.paused);
  h.$('.spmGuestReturnDetails summary').click();assert.equal(h.plays(),1);assert(h.$('.spmGuestReturnDetails').open);
  control.click();await new Promise(resolve=>setImmediate(resolve));assert.equal(h.plays(),2);assert.equal(control.dataset.state,'playing');assert(!audio.paused);
  control.click();assert(audio.paused);assert.equal(h.w.sessionStorage.getItem('spm_assessment_ready_audio_paused'),'1');
  control.click();await new Promise(resolve=>setImmediate(resolve));assert(!audio.paused);h.$('#spmGuestOffer').click();assert(audio.paused);assert(h.$('.spmOfferFilm'));
  h.$('[data-guest-result]').click();await new Promise(resolve=>setImmediate(resolve));assert.equal(h.plays(),3,'Returning from the offer must not autoplay again');assert(h.$('#spmGuestMotivationAudio').paused);
 }finally{h.close()}
});

test('audio pauses on backgrounding, review and page exit, and respects a previous pause',async()=>{
 const first=completed(),saved=first.w.localStorage.getItem(KEY);assert.equal(first.plays(),0);first.close();const h=harness(saved);
 try{await new Promise(resolve=>setImmediate(resolve));const audio=h.$('#spmGuestMotivationAudio');assert(!audio.paused);Object.defineProperty(h.w.document,'hidden',{configurable:true,value:true});h.w.document.dispatchEvent(new h.w.Event('visibilitychange'));assert(audio.paused);Object.defineProperty(h.w.document,'hidden',{configurable:true,value:false});h.w.document.dispatchEvent(new h.w.Event('visibilitychange'));assert.equal(h.plays(),1);h.$('#spmGuestMotivationToggle').click();await new Promise(resolve=>setImmediate(resolve));assert(!audio.paused);h.$('#spmGuestReview').click();assert(audio.paused)}finally{h.close()}
 const quiet=harness(saved,'es',{previouslyPaused:true});try{await new Promise(resolve=>setImmediate(resolve));assert.equal(quiet.plays(),0);quiet.$('#spmGuestMotivationToggle').click();await new Promise(resolve=>setImmediate(resolve));const audio=quiet.$('#spmGuestMotivationAudio');assert(!audio.paused);quiet.w.dispatchEvent(new quiet.w.Event('pagehide'));assert(audio.paused)}finally{quiet.close()}
});
