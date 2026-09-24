const {JSDOM}=require('jsdom');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.resolve(__dirname,'..');
const files=['spm-language-core-v1.js','guest-entry-v1.js','engine.js','health-intake-v2.js','modules.js','app-live.js','commercial-conversion-v1.js','commercial-offer-v2.js'];
async function setup(language='es',saved={},options={}){
 const html=fs.readFileSync(path.join(dir,'free-assessment.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
 const dom=new JSDOM(html,{url:'https://test.example/premium-v2/free-assessment.html',runScripts:'outside-only'});
 const w=dom.window,queries=[],authCalls=[];let session=null;
 w.localStorage.setItem('spm_lang',language);for(const [k,v]of Object.entries(saved))w.sessionStorage.setItem(k,v);
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
 return{w,dom,queries,authCalls,q:s=>w.document.querySelector(s),all:s=>[...w.document.querySelectorAll(s)],saved:()=>Object.fromEntries(Object.entries(w.sessionStorage))};
}
function begin(t,motive='erection'){
 t.q('#spmGuestStart').click();t.q('[data-age="1"]').click();t.q('[data-motive="'+motive+'"]').click();t.q('#motiveNext').click();
}
function answer(t,{urgent=false,review=false,condition=false,medications=false}={}){
 const prompt=t.q('#qbox .qtitle').textContent;
 const q=t.w.ENGINE.assessment.questions.find(q=>q.prompt_es===prompt||q.prompt_en===prompt);assert(q,prompt);
 if(q.type==='text'){const el=t.q('#qbox textarea');el.value='Prueba ficticia';el.dispatchEvent(new t.w.Event('input',{bubbles:true}))}
 else{
  let index=q.id==='h_medchange'?1:0;
  if(q.type==='boolean')index=(urgent&&q.id==='s_cardiac'||review&&q.id==='s_penile'||condition&&q.id==='h_has_condition'||medications&&q.id==='h_meds')?1:0;
  else if(q.type.startsWith('scale'))index=q.domain==='erection'?(q.type==='scale5_reverse'?3:1):2;
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
 await c.q('#spmGuestAccountForm').onsubmit({preventDefault(){},currentTarget:c.q('#spmGuestAccountForm')});assert.equal(c.queries.length,0,'unconfirmed account cannot receive medical data');assert(c.q('#spmGuestAuthStatus').textContent.includes('confirmar'));assert(!c.w.sessionStorage.getItem('spm_free_assessment_v1').includes('not-a-real-password'));c.dom.window.close();console.log('PASS email confirmation retains the local draft without sending answers');
 const conditional=await setup();begin(conditional);const ids=[];while(!conditional.q('.spmGuestResult'))ids.push(answer(conditional,{condition:true,medications:true}));assert(ids.includes('h_condition_names'));assert(ids.includes('h_mednames'));assert(!ids.includes('h_medeffect'));conditional.dom.window.close();console.log('PASS conditional health and medication questions retain their existing rules');
})().catch(e=>{console.error(e);process.exitCode=1});
