const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function harness(options={}){
 const store=new Map(options.hint?[['spm_program_return_v1','1']]:[]),calls=[],destinations=[];
 const context={AbortSignal,window:{},localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)},location:{replace:url=>destinations.push(url)}};
 vm.runInNewContext(fs.readFileSync('premium-v2/program-entry-v1.js','utf8'),context);
 const db={auth:{getSession:async()=>({data:{session:options.user?{user:{id:options.user}}:null}})},from:table=>{calls.push(['from',table]);const q={abortSignal:()=>q,select:field=>{calls.push(['select',field]);return q},eq:(key,value)=>{calls.push(['eq',key,value]);return q},limit:async n=>{calls.push(['limit',n]);if(options.throws)throw Error('offline');return {data:options.paid?[{plan_id:'plan'}]:[],error:options.error?Error('offline'):null}}};return q}};
 return {api:context.window.SPM_PROGRAM_ENTRY,db,store,calls,destinations};
}
for(const scenario of [
 {name:'new visitor',expected:false},
 {name:'buyer with expired session',hint:true,expected:true},
 {name:'authenticated buyer',user:'buyer',paid:true,expected:true},
 {name:'new authenticated account',user:'new',expected:false},
 {name:'another unpaid account on a remembered device',user:'new',hint:true,expected:false},
 {name:'access check error never resells to an authenticated user',user:'buyer',error:true,expected:true},
 {name:'network failure never resells to an authenticated user',user:'buyer',throws:true,expected:true}
])test(scenario.name,async()=>{const h=harness(scenario);assert.equal(await h.api.redirect(h.db),scenario.expected);assert.equal(h.destinations.length,scenario.expected?1:0);if(scenario.expected)assert.equal(h.destinations[0],'live.html');if(!scenario.user)assert.equal(h.calls.length,0);else{assert(h.calls.some(x=>x[0]==='eq'&&x[1]==='user_id'&&x[2]===scenario.user));assert(h.calls.some(x=>x[0]==='eq'&&x[1]==='status'&&x[2]==='active'));}if(scenario.paid)assert.equal(h.store.get('spm_program_return_v1'),'1');if(scenario.user&&!scenario.paid&&!scenario.error&&!scenario.throws)assert.equal(h.store.has('spm_program_return_v1'),false)});
test('entry script loads before assessment, private app and confirmed payment handlers',()=>{for(const [page,app] of [['free-assessment.html','assessment-app-v3.js'],['live.html','app-live.js'],['payment-return.html','payment-return.js']]){const text=fs.readFileSync('premium-v2/'+page,'utf8');assert(text.indexOf('program-entry-v1.js')>=0);assert(text.indexOf('program-entry-v1.js')<text.indexOf(app));}});
