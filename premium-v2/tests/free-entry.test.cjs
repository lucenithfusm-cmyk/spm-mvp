const {JSDOM}=require('jsdom');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.resolve(__dirname,'..');
const files=['spm-language-core-v1.js','guest-entry-v1.js','engine.js','health-intake-v2.js','modules.js','app-live.js','commercial-conversion-v1.js','commercial-offer-v2.js'];
const DRAFT_KEY='spm_free_assessment_v2',DAY=24*60*60*1000;
async function setup(language='es',saved={},options={}){
 const html=fs.readFileSync(path.join(dir,'free-assessment.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
 const dom=new JSDOM(html,{url:'https://test.example/premium-v2/free-assessment.html',runScripts:'outside-only'});
 const w=dom.window,queries=[],authCalls=[];let session=null,now=options.now??Date.now();w.Date.now=()=>now;
 for(const [k,v]of Object.entries(saved))w.localStorage.setItem(k,v);w.localStorage.setItem('spm_lang',language);
 for(const [k,v]of Object.entries(options.sessionSaved||{}))w.sessionStorage.setItem(k,v);
 if(options.blockStorage){for(const method of ['getItem','setItem','removeItem']){const original=w.Storage.prototype[method];w.Storage.prototype[method]=function(key,...args){if(this===w.localStorage&&key===DRAFT_KEY)throw new Error('Storage unavailable');return original.call(this,key,...args)}}}
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollTo=()=>{};w.setInterval=()=>0;w.setTimeout=()=>0;
 w.matchMedia=()=>({matches:true});w.HTMLFormElement.prototype.reportValidity=()=>true;
 w.supabase={createClient:()=>({auth:{
  getSession:async()=>{authCalls.push('getSession');return{data:{session}}},onAuthStateChange:()=>({}),
  signUp:async credentials=>{authCalls.push('signup');session=options.confirmEmail?null:{user:{id:'test-user',email:credentials.email}};return{data:{session}}},
  signInWithPassword:async credentials=>{authCalls.push('signin');session={user:{id:'test-user',email:credentials.email}};return{data:{session}}},
  getUser:async()=>{authCalls.push('getUser');return{data:{user:session?.user||null},error:session?null:Error('No session')}}
 },from(table){
   return {
    upsert:async row=>{queries.push({table,kind:'upsert',row});return{error:null}},
    insert(row){
     queries.push({table,kind:'insert',row});
     return {select(){return {single:async()=>({data:{id:table+'-test-id'},error:null})}}};
    }
   };
  }
 })};
 for(const f of files){if(options.legacy&&f==='health-intake-v2.js')delete w.SPM_GUEST_ENTRY;w.eval(fs.readFileSync(path.join(dir,f),'utf8'))}
 await new Promise(resolve=>setImmediate(resolve));
 return{w,dom,queries,authCalls,q:s=>w.document.querySelector(s),all:s=>[...w.document.querySelectorAll(s)],saved:()=>Object.fromEntries(Object.entries(w.localStorage)),advance:ms=>{now+=ms}};
}
function begin(t,motive='erection'){
 t.q('#spmGuestStart').click();t.q('[data-age="1"]').click();t.q('[data-motive="'+motive+'"]').click();t.q('#motiveNext').click();
}
function answer(t,{urgent=false,review=false,condition=false,medications=false,goodErection=false}={}){
 const prompt=t.q('#qbox .qtitle').textContent;
 const q=t.w.ENGINE.assessment.questions.find(q=>q.prompt_es===prompt||q.prompt_en===prompt);assert(q,prompt);
 if(q.type==='text'){const el=t.q('#qbox textarea');el.value='Prueba ficticia';el.dispatchEvent(new t.w.Event('input',{bubbles:true}))}
 else{
  let index=q.id==='h_medchange'?1:0;
  if(q.type==='boolean')index=(urgent&&q.id==='s_cardiac'||review&&q.id==='s_penile'||condition&&q.id==='h_has_condition'||medications&&q.id==='h_meds')?1:0;
  else if(q.type.startsWith('scale'))index=q.domain==='erection'?(q.type==='scale5_reverse'?(goodErection?0:3):(goodErection?4:1)):2;
  t.all('#qbox .opt')[index].click();
 }
 t.q('#qNext').click();return q.id;
}
function finish(t,opts){let count=0;while(!t.q('.spmGuestResult')){assert(++count<90,'questionnaire must finish');answer(t,opts)}return count}
(async()=>{
 const legacy=await setup('es',{}, {legacy:true});assert.equal(legacy.q('#authScreen').hidden,false);assert.deepEqual(legacy.authCalls,['getSession']);assert.equal(legacy.queries.length,0);legacy.dom.window.close();console.log('PASS existing signed-in entry retains its original auth gate');
 for(const language of ['es','en']){
  const t=await setup(language);assert.equal(t.q('#authScreen').hidden,true);assert(t.q('#spmGuestStart'));assert.equal(t.authCalls.length,0,'entry must not request or create a session');
  begin(t);for(let n=0;n<5;n++)answer(t);
  const at=t.q('#qbox .qtitle').textContent,saved=t.saved();assert.equal(t.queries.length,0);assert.equal(t.authCalls.length,0);
  assert(!Object.keys(t.w.localStorage).some(k=>k.includes('health_profile')),'guest health answers must not leak to persistent anon storage');
  const resumed=await setup(language,saved);resumed.q('#spmGuestStart').click();assert.equal(resumed.q('#qbox .qtitle').textContent,at,'refresh resumes the same question');finish(resumed);
  assert(resumed.q('.spmGuestPriority').textContent.includes(language==='es'?'Respuesta eréctil':'Erectile response'));
  assert.equal(resumed.q('#dayGrid').children.length,0,'no detailed plan generated before purchase');assert.equal(resumed.q('#navPlan').disabled,true);
  assert.equal(resumed.queries.length,0,'free result must not write private data remotely');assert.equal(resumed.authCalls.length,0);
  resumed.q('#spmGuestOffer').click();assert(resumed.q('.spmGate'));assert.equal(resumed.all('.spmOfferReview').length,2);assert.equal(resumed.all('.spmOfferPaths li').length,6);
  resumed.q('.startPay').click();assert(resumed.q('#spmGuestAccountForm'));assert(!resumed.q('.spmPayment'),'guest flow cannot reach the old test-unlock path');
  resumed.q('#spmGuestEmail').value='fake@example.invalid';resumed.q('#spmGuestPassword').value='not-a-real-password';
  await resumed.q('#spmGuestAccountForm').onsubmit({preventDefault(){},currentTarget:resumed.q('#spmGuestAccountForm')});
  assert(resumed.q('.spmGuestAccount').textContent.includes(language==='es'?'EVALUACIÓN GUARDADA':'ASSESSMENT SAVED'));
  assert.equal(resumed.queries.filter(x=>x.table==='assessments').length,1);assert.equal(resumed.queries.filter(x=>x.table==='performance_maps').length,1);
  assert(resumed.queries.every(x=>x.table!=='plans'),'creating an account cannot activate a paid plan');
  const record=resumed.queries.find(x=>x.table==='assessments').row;assert.equal(record.user_id,'test-user');assert(Object.keys(record.answers).length>20);
  resumed.q('#spmGuestBackOffer').click();resumed.q('.startPay').click();resumed.q('#spmGuestAccountMode').click();resumed.q('#spmGuestEmail').value='fake@example.invalid';resumed.q('#spmGuestPassword').value='not-a-real-password';
  await resumed.q('#spmGuestAccountForm').onsubmit({preventDefault(){},currentTarget:resumed.q('#spmGuestAccountForm')});
  assert.equal(resumed.queries.filter(x=>x.table==='assessments').length,1,'retries reuse the same saved assessment');
  t.dom.window.close();resumed.dom.window.close();console.log('PASS',language,'free entry, resume, preliminary result, approved offer, deferred account, authenticated save and no unpaid plan');
 }
 for(const flag of ['urgent','review']){
  const t=await setup();begin(t);finish(t,{[flag]:true});assert(t.q('.spmGuestSafety'));assert(t.q('.spmGuestSafety li').textContent.length>20,'show the safety flag without requiring payment');
  if(flag==='urgent'){assert(!t.q('#spmGuestOffer'));assert(!t.q('#spmGuestAccountForm'))}else{assert(t.q('#spmGuestOffer'));t.q('#spmGuestOffer').click();assert(t.q('.spmSafety.review'))}
  assert.equal(t.queries.length,0);t.dom.window.close();console.log('PASS',flag,'safety is visible before signup or payment');
 }
 const c=await setup('es',{}, {confirmEmail:true});begin(c);finish(c);c.q('#spmGuestOffer').click();c.q('.startPay').click();c.q('#spmGuestEmail').value='fake@example.invalid';c.q('#spmGuestPassword').value='not-a-real-password';
 await c.q('#spmGuestAccountForm').onsubmit({preventDefault(){},currentTarget:c.q('#spmGuestAccountForm')});assert.equal(c.queries.length,0,'unconfirmed account cannot receive medical data');assert(c.q('#spmGuestAuthStatus').textContent.includes('confirmar'));assert(!c.w.localStorage.getItem(DRAFT_KEY).includes('not-a-real-password'));c.dom.window.close();console.log('PASS email confirmation retains the local draft without sending answers');
 const conditional=await setup();begin(conditional);const ids=[];while(!conditional.q('.spmGuestResult'))ids.push(answer(conditional,{condition:true,medications:true}));assert(ids.includes('h_condition_names'));assert(ids.includes('h_mednames'));assert(!ids.includes('h_medeffect'));conditional.dom.window.close();console.log('PASS conditional health and medication questions retain their existing rules');
 const clock=1800000000000;
 const draftTest=await setup('es',{}, {now:clock});begin(draftTest);for(let n=0;n<5;n++)answer(draftTest);
 const question=draftTest.q('#qbox .qtitle').textContent,stored=draftTest.saved(),envelope=JSON.parse(stored[DRAFT_KEY]);
 assert.equal(envelope.expiresAt,clock+7*DAY);assert.equal(draftTest.w.sessionStorage.length,0);draftTest.dom.window.close();
 const day3=await setup('es',stored,{now:clock+3*DAY});assert(day3.q('#spmGuestStart').textContent.includes('Retomar'));day3.q('#spmGuestStart').click();assert.equal(day3.q('#qbox .qtitle').textContent,question);assert.equal(JSON.parse(day3.saved()[DRAFT_KEY]).expiresAt,envelope.expiresAt,'opening and resuming alone must not extend retention');
 const before=JSON.parse(day3.saved()[DRAFT_KEY]).draft.answers;
 day3.w.SPM_GUEST_ENTRY.receipt({userId:'test-user',assessmentId:'old-answer-set'});
 day3.q('#qBack').click();const previousPrompt=day3.q('#qbox .qtitle').textContent,previousQuestion=day3.w.ENGINE.assessment.questions.find(q=>q.prompt_es===previousPrompt);const choices=day3.all('#qbox .opt');const different=choices.find(b=>!b.classList.contains('sel'));assert(different);different.click();
 const edited=JSON.parse(day3.saved()[DRAFT_KEY]);assert.notEqual(edited.draft.answers[previousQuestion.id],before[previousQuestion.id]);assert.equal(edited.receipt,null,'changed answers cannot reuse an earlier account transfer');assert.equal(edited.expiresAt,clock+10*DAY,'an actual advance renews the seven-day window');assert.equal(Object.keys(day3.saved()).filter(k=>k.startsWith('spm_free_')).length,1,'one record replaces earlier answers');assert.equal(day3.queries.length,0);assert.equal(day3.authCalls.length,0);day3.dom.window.close();
 console.log('PASS fresh browser session after three days, same question, no passive renewal, changed answers replace the single local draft');
 for(const elapsed of [7*DAY,10*DAY]){const expired=await setup('es',stored,{now:clock+elapsed});assert(!expired.saved()[DRAFT_KEY]);assert(!expired.q('#spmGuestClear'));assert(expired.q('#spmGuestStart').textContent.includes('Comenzar'));assert.equal(expired.queries.length,0);expired.dom.window.close()}
 const openTab=await setup('es',stored,{now:clock+6*DAY});openTab.q('#spmGuestStart').click();openTab.advance(DAY);openTab.w.dispatchEvent(new openTab.w.Event('focus'));assert(!openTab.saved()[DRAFT_KEY]);assert.equal(openTab.q('#appScreen').hidden,true);assert(openTab.q('#spmGuestStart').textContent.includes('Comenzar'));openTab.dom.window.close();
 console.log('PASS expired drafts are removed on return and on resuming an already-open tab');
 const clearTest=await setup('en',stored,{now:clock+DAY});clearTest.q('#spmGuestClear').click();assert(!clearTest.saved()[DRAFT_KEY]);assert(clearTest.q('#spmGuestStart').textContent.includes('Start'));assert(clearTest.q('#spmGuestSurface').textContent.includes('7 days'));clearTest.dom.window.close();
 const oldDraft=JSON.stringify(envelope.draft);const migrated=await setup('es',{}, {now:clock,sessionSaved:{spm_free_assessment_v1:oldDraft}});assert(migrated.saved()[DRAFT_KEY]);assert.equal(migrated.w.sessionStorage.length,0);migrated.q('#spmGuestStart').click();assert.equal(migrated.q('#qbox .qtitle').textContent,question);migrated.dom.window.close();
 const blocked=await setup('es',{}, {blockStorage:true});assert(blocked.q('#spmGuestSurface').textContent.includes('no permite guardar'));begin(blocked);finish(blocked);assert(blocked.q('.spmGuestResult'));assert.equal(blocked.queries.length,0);blocked.dom.window.close();
 const corrupt=await setup('es',{[DRAFT_KEY]:'{broken'});assert(!corrupt.saved()[DRAFT_KEY]);assert(corrupt.q('#spmGuestStart'));corrupt.dom.window.close();
 console.log('PASS delete action, bilingual retention notice, old-tab migration and storage-unavailable fallback');
 const personalized=await setup();begin(personalized);finish(personalized);const initialScore=Number(personalized.q('#scoreValue').textContent),initialPriority=personalized.q('.spmGuestPriority h2').textContent;
 const sampleBytes=Buffer.byteLength(personalized.saved()[DRAFT_KEY]);personalized.q('#spmGuestHome').click();personalized.q('#spmGuestClear').click();begin(personalized);finish(personalized,{goodErection:true});assert(Number(personalized.q('#scoreValue').textContent)>initialScore);assert.notEqual(personalized.q('.spmGuestPriority h2').textContent,initialPriority);assert.equal(Object.keys(personalized.saved()).filter(k=>k.startsWith('spm_free_')).length,1);assert.equal(personalized.queries.length,0);personalized.dom.window.close();
 console.log('PASS different answers recalculate score and priority without accumulating visitor records; sample draft bytes:',sampleBytes);
})().catch(e=>{console.error(e);process.exitCode=1});
