const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');
test('public review uses all 28 real daily assignments with isolated in-memory records',async()=>{
 const d=new JSDOM(fs.readFileSync('premium-v2/revision-deseo-dia-1.html','utf8'),{runScripts:'dangerously',url:'https://spm.test/premium-v2/revision-deseo-dia-1.html'});
 await new Promise(r=>d.window.addEventListener('DOMContentLoaded',r,{once:true}));
 const w=d.window,picker=w.document.getElementById('day');assert.equal(picker.options.length,28);
 assert.equal(w.document.getElementById('prev').disabled,true);
 await w.SPM_DESIRE_RECORDS.save({'spm-desire-ctx':'test'},'review:review');
 for(let day=1;day<=28;day++){await w.SPM_REVIEW_SELECT_DAY(day);assert.equal(w.SPM_RESOURCE_CONTEXT().day,day);}
 assert.equal(w.document.getElementById('next').disabled,true);
 assert.equal((await w.SPM_DESIRE_RECORDS.read())['spm-desire-ctx'],'test');assert.equal(w.localStorage.length,0);
 await assert.rejects(w.SPM_DAILY_RECORDS.save('main',{},'other:plan',28));
 const html=w.document.documentElement.outerHTML;assert(!html.includes('supabase-js'));assert(html.includes('daily-practice-v1.js'));assert(html.includes('desire-lab-bridge-v1.js'));d.window.close();
});
