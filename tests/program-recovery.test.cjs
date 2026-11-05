const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
const policy=require('../supabase/functions/_shared/assessment-policy.js'),questions=require('../supabase/functions/_shared/question-catalog.json');
const read=f=>fs.readFileSync('premium-v2/'+f,'utf8');
function complete(motives=['erection']){const answers={};for(const q of policy.queue(questions,motives)){if(!policy.visible(q,answers))continue;answers[q.id]=q.type==='boolean'?false:q.type.startsWith('scale5')?3:q.type==='text'?'No recuerdo':q.options[0].value;}return answers;}
test('missing conditional health information gets its own recovery path, distinct from a positive flag',()=>{
 const answers=complete();answers.h_has_condition=true;answers.s_penile=true;
 const pending=policy.missing(questions,['erection'],answers);assert(pending.some(q=>q.id==='h_control_status'));
 const patch={};for(const q of pending)patch[q.id]=q.type==='boolean'?false:q.type==='text'?'Condición reportada':q.options[0].value;
 const result=policy.fillMissing(questions,['erection'],answers,patch);assert.equal(policy.missing(questions,['erection'],result).length,0);
 const computed=policy.score(questions,['erection'],result),safety=policy.preserveSafety(computed,{safety_level:'review',safety_flags:['s_penile']});
 assert.equal(safety.safety_level,'review');assert(safety.safety_flags.includes('s_penile'));assert.equal(result.s_penile,true);
 assert.throws(()=>policy.fillMissing(questions,['erection'],answers,{s_penile:false}),/Only missing/);
 assert.throws(()=>policy.fillMissing(questions,['erection'],answers,{unknown:'a'}),/Unknown/);
});
test('missing safety answer accepts false explicitly and new true answers raise the original urgent flag',()=>{
 const answers=complete();delete answers.s_cardiac;
 assert.equal(policy.missing(questions,['erection'],answers).length,1);
 const no=policy.fillMissing(questions,['erection'],answers,{s_cardiac:false});assert.equal(policy.missing(questions,['erection'],no).length,0);
 const yes=policy.fillMissing(questions,['erection'],answers,{s_cardiac:true});assert.deepEqual(policy.score(questions,['erection'],yes).urgent,['s_cardiac']);
 assert.equal(policy.preserveSafety(policy.score(questions,['erection'],no),{safety_level:'urgent',safety_flags:['s_cardiac']}).safety_level,'urgent');
});
function harness(){
 const dom=new JSDOM('<section id="map"><div class="mapHero"></div></section><button id="navPlan"></button>',{url:'https://spm.test',runScripts:'outside-only'}),w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 w.ENGINE={assessment:{questions}};w.SPM_ASSESSMENT_POLICY=policy;
 const c={userId:'user',planId:'plan',day:15,primary:'erection',secondary:'desire',motives:['erection'],answers:complete(),safety:'review',flags:['s_penile'],completed:[1,2],checkins:[]};delete c.answers.h_has_condition;
 w.SPM_RESOURCE_CONTEXT=()=>c;const saves=[];let fail=false;
 w.SPM_PROGRAM_REPAIR={save:async(patch,scope)=>{if(fail)throw Error('Offline');saves.push({patch,scope});c.answers={...c.answers,...patch};}};
 w.eval(read('program-recovery-v1.js'));w.eval(read('program-welcome-v1.js'));
 return {w,c,saves,setFail:()=>fail=true,close:()=>w.close()};
}
test('recovery opens where the user is blocked, saves explicit missing answers and preserves day/history/flags',async()=>{
 const h=harness();try{
 const {w,c}=h;assert.match(w.document.querySelector('#spmProgramWelcome').textContent,/2 días con práctica registrada/);
 w.document.querySelector('[data-complete-missing]').click();const input=w.document.querySelector('#repair-h_has_condition');assert(input);input.value='false';input.dispatchEvent(new w.Event('change'));
 w.document.querySelector('#spmRecoveryDialog form').dispatchEvent(new w.Event('submit',{cancelable:true}));await new Promise(r=>setImmediate(r));
 assert.equal(h.saves.length,1);assert.deepEqual(JSON.parse(JSON.stringify(h.saves[0])),{patch:{h_has_condition:false},scope:'user:plan'});assert.equal(c.day,15);assert.deepEqual(c.completed,[1,2]);assert.deepEqual(c.flags,['s_penile']);assert.equal(w.document.querySelector('#spmRecoveryDialog'),null);
 }finally{h.close();}
});
test('failed recovery retains answers and offers retry; welcome never claims new patients have practised',async()=>{
 const h=harness();try{
 h.c.completed=[];h.w.SPM_PROGRAM_WELCOME.mount();assert.match(h.w.document.querySelector('#spmProgramWelcome').textContent,/Tus prácticas de entrenamiento comienzan ahora/);
 h.setFail();h.w.SPM_PROGRAM_RECOVERY.open();const input=h.w.document.querySelector('#repair-h_has_condition');input.value='false';input.dispatchEvent(new h.w.Event('change'));
 h.w.document.querySelector('#spmRecoveryDialog form').dispatchEvent(new h.w.Event('submit',{cancelable:true}));await new Promise(r=>setImmediate(r));
 assert.equal(input.value,'false');assert.match(h.w.document.querySelector('#spmRecoveryDialog [role=status]').textContent,/Tus respuestas siguen aquí/);assert.equal(h.w.document.querySelector('#spmRecoveryDialog [type=submit]').disabled,false);assert.equal(h.c.day,15);assert.equal(h.saves.length,0);
 }finally{h.close();}
});
test('EP checkpoint offers not evaluable / no existing PEDT score, records no invented values, separates accounts',async()=>{
 const dom=new JSDOM('<span id="profileTitle">Control eyaculatorio</span>',{url:'https://spm.test',runScripts:'outside-only'}),w=dom.window;let c={userId:'one',planId:'a',day:28};const saves=[];
 const observers=[],Observer=w.MutationObserver;w.MutationObserver=class extends Observer{constructor(callback){super(callback);observers.push(this)}};
 w.SPM_RESOURCE_CONTEXT=()=>c;w.SPM_EP_RECORDS={read:async()=>[],save:async(record,scope)=>saves.push({record,scope})};w.alert=m=>{throw Error(m)};
 try{w.eval(read('ejaculatory-control-router.js'));await w.SPM_EP_ASSESSMENT.open(28);w.document.querySelector('#epAEvaluable [data-v="0"]').click();w.document.querySelector('#epANoPedt').click();w.document.querySelector('#epASave').click();await new Promise(r=>setImmediate(r));assert.equal(saves.length,1);assert.equal(saves[0].record.pedt_score,null);assert.equal(saves[0].record.ielt_seconds,null);assert.equal(w.SPM_EP_ASSESSMENT.records().length,1);c={userId:'two',planId:'b',day:28};assert.equal(w.SPM_EP_ASSESSMENT.records().length,0);}finally{observers.forEach(x=>x.disconnect());w.close();}
});
