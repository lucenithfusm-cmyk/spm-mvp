const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');
test('no-account review switches all 28 days, keeps only in-memory demo progress, and limits navigation',async()=>{
 const html=fs.readFileSync('premium-v2/revision-deseo-dia-1.html','utf8');
 const d=new JSDOM(html,{runScripts:'dangerously',url:'https://spm.test/premium-v2/revision-deseo-dia-1.html'});
 await new Promise(r=>d.window.addEventListener('DOMContentLoaded',r,{once:true}));
 const w=d.window,h=w.SPM_DESIRE_LAB_HOST,picker=w.document.getElementById('day');
 assert.equal(picker.options.length,28);assert.equal(h.getContext().day,1);
 assert.equal(w.document.getElementById('prev').disabled,true);
 h.write('spm-desire-ctx','{"pDay":1}');
 for(let day=2;day<=28;day++){w.document.getElementById('next').click();assert.equal(h.getContext().day,day);assert.match(w.document.querySelector('iframe').src,new RegExp('reviewDay='+day+'$'));}
 assert.equal(w.document.getElementById('next').disabled,true);
 picker.value='1';picker.dispatchEvent(new w.Event('change'));assert.equal(h.getContext().day,1);
 assert.equal(h.getState()['spm-desire-ctx'],'{"pDay":1}');assert.equal(w.localStorage.length,0);
 assert.equal(h.write('auth','not-allowed'),false);d.window.close();
});
