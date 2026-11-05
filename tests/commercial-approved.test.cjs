const fs=require('node:fs'),assert=require('node:assert/strict'),{test}=require('node:test');
const {JSDOM}=require('jsdom');
for(const motive of ['erection','ejaculation','desire','confidence','wellbeing','optimization'])test('direct anonymous assessment and audiovisual offer: '+motive,()=>{
 const dom=new JSDOM(fs.readFileSync('premium-v2/free-assessment.html','utf8'),{url:'https://spm.test/premium-v2/free-assessment.html',runScripts:'outside-only'}),w=dom.window;
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollTo=function(){};w.setInterval=()=>1;w.setTimeout=()=>1;w.supabase={createClient:()=>({auth:{onAuthStateChange:()=>{}},from:()=>{throw Error('Anonymous assessment must not write to database')}})};
 try{
 for(const file of ['guest-entry-v1.js','engine.js','health-intake-v2.js','modules.js','commercial-conversion-v1.js','app-live.js'])w.eval(fs.readFileSync('premium-v2/'+file,'utf8'));
 w.document.dispatchEvent(new w.Event('DOMContentLoaded'));const $=s=>w.document.querySelector(s);assert.equal($('#authScreen').hidden,true);assert.equal($('#appScreen').hidden,false);assert.equal($('#ageCard').hidden,false);assert.equal($('#spmGuestStart'),null);
 $('[data-age="1"]').click();$('[data-motive="'+motive+'"]').click();$('#motiveNext').click();let n=0;
 while(!$('#quizCard').hidden){assert(++n<100);const q=w.ENGINE.assessment.questions.find(q=>q.prompt_es===$('#qbox h3').textContent);if(q.type==='text'){const e=$('#qbox textarea');e.value='Prueba';e.dispatchEvent(new w.Event('input'))}else $('#qbox .opt').click();$('#qNext').click()}
 $('#spmGuestOffer').click();assert($('.spmGateVisual'));assert($('.spmOfferFilm'));assert.match($('.spmOfferPlay').textContent,/▶/);assert.match($('.spmOfferPurchasePrice').textContent,/149.000 COP/);assert(!$('.testUnlock'));
 $('.startPay').click();assert(!$('.spmGate'));assert.match($('#spmGuestSurface').textContent,/pagos desactivados/);assert(!$('#spmGuestAccountForm'));
 }finally{dom.window.close()}
});
