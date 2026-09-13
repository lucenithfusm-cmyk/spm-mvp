const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const root=__dirname+'/../premium-v2/';
const delay=()=>new Promise(r=>setTimeout(r,45));
function setup(initial=[]){
 const dom=new JSDOM('<section id="plan"><div class="dayCard"><span class="dayNum">14</span><div class="interactive"></div></div></section><section id="map"></section><section id="progressPanel"></section>',{url:'https://spm.test/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 let user='one',fail=false,hook=null;const cloud=[...initial];
 w.SPM_RESOURCE_CONTEXT=()=>({userId:user,planId:'plan',day:14,primary:'erection',motives:['erection'],safety:'none',answers:{},flags:[],checkins:[],completed:[]});
 w.SPM_RESOURCE_RECORDS={read:async()=>cloud.filter(r=>r.user===user),save:async(r,scope)=>{if(scope!==user+':plan')throw Error('Changed account');if(hook)return hook(r);if(fail)throw Error('offline');cloud.push({...r,user})}};
 for(const f of ['spm-language-core-v1.js','spm-resources-content.js','spm-resources.js'])w.eval(fs.readFileSync(root+f,'utf8'));
 return {w,cloud,dom,user:v=>user=v,fail:v=>fail=v,hook:v=>hook=v};
}
test('EHS is 1–4, absent erection is separate, arousal must be explicitly selected',()=>{
 const a=setup(),v=a.w.SPM_RESOURCES.validate,b={kind:'response',day:1,at:new Date().toISOString(),context:'',arousal:7};
 for(let ehs=1;ehs<=4;ehs++)assert.ok(v({...b,ehs}));
 assert.ok(!v({...b,ehs:0}));assert.ok(v({...b,ehs:null,noErection:true}));assert.ok(!v({...b,ehs:2,arousal:null}));assert.ok(!v({...b,ehs:2,arousal:11}));a.dom.window.close();
});
test('all ES/EN panels, food/activity cards and seven recovery scenarios render',async()=>{
 const a=setup();await delay();
 for(const lang of ['es','en']){a.w.SPM_LANGUAGE.set(lang);for(const kind of ['response','confidence','nutrition','movement','recovery','history']){a.w.SPM_RESOURCES.open(kind,14);for(const b of a.w.document.querySelectorAll('[data-food],[data-activity],[data-scenario]'))b.click();assert.doesNotMatch(a.w.document.querySelector('dialog').textContent,/undefined|NaN/);}}
 assert.equal(a.w.SPM_RESOURCE_CONTENT.scenarios.length,7);a.dom.window.close();
});
test('empty response does not save; no erection and actual zero arousal persist',async()=>{
 const a=setup();await delay();a.w.SPM_RESOURCES.open('response',14);const d=a.w.document;d.querySelector('#srSave').click();await delay();assert.equal(a.cloud.length,0);d.querySelector('[data-ehs=none]').click();d.querySelector('[role=slider]').dispatchEvent(new a.w.KeyboardEvent('keydown',{key:'Home',bubbles:true}));d.querySelector('#srSave').click();await delay();assert.equal(a.cloud.length,1);assert.equal(a.cloud[0].ehs,null);assert.equal(a.cloud[0].arousal,0);a.dom.window.close();
});
test('offline records persist across account switches and retries',async()=>{
 const a=setup();await delay();a.fail(true);a.w.SPM_RESOURCES.open('response',3);const d=a.w.document;d.querySelector('[data-ehs="2"]').click();d.querySelector('[data-delta="1"]').click();d.querySelector('#srSave').click();await delay();assert.equal(JSON.parse(a.w.localStorage.getItem('spm_resources_v1:one:plan'))[0].pending,true);
 a.user('two');a.w.SPM_RESOURCES.refresh();assert.match(d.querySelector('#map').textContent,/0 autorregistros/);a.user('one');a.w.SPM_RESOURCES.refresh();await delay();assert.match(d.querySelector('#map').textContent,/1 autorregistros/);a.fail(false);a.w.SPM_RESOURCES.open('history',3);d.querySelector('#srRetry').click();await delay();assert.equal(a.cloud.length,1);assert.equal(JSON.parse(a.w.localStorage.getItem('spm_resources_v1:one:plan'))[0].pending,false);a.dom.window.close();
});
test('retry rejection after account change cannot send remaining entries as next user',async()=>{
 const a=setup();await delay();a.fail(true);for(let i=0;i<2;i++){a.w.SPM_RESOURCES.open('response',3);a.w.document.querySelector('[data-ehs="2"]').click();a.w.document.querySelector('[data-delta="1"]').click();a.w.document.querySelector('#srSave').click();await delay();}
 let calls=0,release;a.hook(()=>{calls++;return new Promise((_,reject)=>release=reject)});a.w.SPM_RESOURCES.open('history',3);a.w.document.querySelector('#srRetry').click();await delay();a.user('two');a.w.SPM_RESOURCES.refresh();release(Error('offline'));await delay();assert.equal(calls,1);assert.match(a.w.document.querySelector('#map').textContent,/0 autorregistros/);a.dom.window.close();
});
test('one hundred refreshes do not duplicate nodes or mutate an unchanged DOM',async()=>{
 const a=setup();await delay();const html=a.w.document.body.innerHTML;for(let i=0;i<100;i++)a.w.SPM_RESOURCES.refresh();assert.equal(a.w.document.body.innerHTML,html);assert.equal(a.w.document.querySelectorAll('.sr-day').length,1);a.dom.window.close();
});
test('movement respects safety alerts and missing safety context',()=>{
 const a=setup(),r=a.w.SPM_RESOURCES,c={safety:'none',answers:{},flags:[],checkins:[]};assert.equal(r.restricted(c),false);
 for(const patch of [{safety:'urgent'},{safety:'review'},{safety:undefined},{answers:{h_cv_event:true}},{answers:{h_has_condition:true,h_control_status:'unsure'}},{checkins:[{new_safety_flag:true}]}])assert.equal(r.restricted({...c,...patch}),true);assert.equal(r.restricted(null),true);a.dom.window.close();
});
test('rotation preserves checkpoints, varies resources and excludes restricted movement',()=>{
 const a=setup(),r=a.w.SPM_RESOURCES,c={safety:'none',answers:{},flags:[],primary:'desire',motives:['desire']};const x=Array.from({length:28},(_,i)=>r.recommend(i+1,c,[]));assert.ok(new Set(x).size>=6);for(const d of [7,14,21,28])assert.equal(x[d-1],'history');for(let d=1;d<=28;d++)assert.notEqual(r.recommend(d,{...c,safety:'review'},[]),'movement');assert.equal(r.recommend(12,c,[{kind:'recovery',day:11,help:'notyet'}]),'recovery');a.dom.window.close();
});
test('confidence permits behavioural evidence without inventing numerical confidence',async()=>{
 const a=setup();await delay();a.w.SPM_RESOURCES.open('confidence',7);a.w.document.querySelector('[data-evidence]').click();a.w.document.querySelector('#srSave').click();await delay();assert.equal(a.cloud.length,1);assert.equal(a.cloud[0].before,null);assert.equal(a.cloud[0].during,null);assert.equal(a.cloud[0].after,null);a.dom.window.close();
});
test('all content pairs are bilingual and movement rejects invalid activity or dose',()=>{
 const a=setup();function visit(o){if(o&&typeof o==='object'){if('es'in o)assert.ok(o.es&&o.en);else Object.values(o).forEach(visit)}}visit(a.w.SPM_RESOURCE_CONTENT);const v=a.w.SPM_RESOURCES.validate,b={kind:'movement',day:3,at:new Date().toISOString(),activity:'walk',minutes:15,effort:3,energy:'easy',tolerance:'comfortable'};assert.ok(v(b));for(const p of [{minutes:0},{minutes:301},{effort:11},{activity:'unknown'}])assert.ok(!v({...b,...p}));a.dom.window.close();
});
test('new modules introduce neither MutationObservers nor repeating JS timers',()=>{for(const f of ['spm-resources.js','spm-breathing-visual.js'])assert.doesNotMatch(fs.readFileSync(root+f,'utf8'),/new MutationObserver|setInterval\(/)});
