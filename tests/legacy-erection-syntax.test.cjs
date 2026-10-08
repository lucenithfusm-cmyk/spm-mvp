const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

test('legacy erection route loads as valid JavaScript',()=>{
 const file=path.join(__dirname,'../premium-v2/erection-route.js');
 const source=fs.readFileSync(file,'utf8');
 assert.doesNotThrow(()=>new vm.Script(source,{filename:file}));
});
test('legacy HTML actually references the repaired route',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../premium-v2/index.html'),'utf8');
 assert.match(html,/src="erection-route\.js"/);
});
