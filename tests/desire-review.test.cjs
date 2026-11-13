const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');
const root=path.resolve(__dirname,'..');
const legacyPrograms=['index.html','live-v4.html','live-stable.html'];
function inspectRedirect(file,suffix=''){
  const dom=new JSDOM(fs.readFileSync(path.join(root,'premium-v2',file),'utf8'),{url:'https://spm.test/premium-v2/'+file+suffix});
  const document=dom.window.document,url=new URL(dom.window.location.href),redirects=[];
  const fallback=document.querySelector('a').getAttribute('href');
  const location={search:url.search,hash:url.hash,replace:target=>redirects.push(target)};
  for(const script of document.scripts){
    assert.equal(script.hasAttribute('src'),false,'legacy entry must not load old applications');
    vm.runInNewContext(script.textContent,{document,location,URLSearchParams});
  }
  return{document,redirects,fallback,close:()=>dom.window.close()};
}
for(const file of legacyPrograms)test(file+' forwards to the current program while preserving query and hash',()=>{
  for(const suffix of ['','?day=14&returnTo=%2F28-dias#plan','?next=https%3A%2F%2Fexample.test#section']){
    const h=inspectRedirect(file,suffix);try{
      const target='/premium-v2/live.html'+suffix;
      assert.deepEqual(h.redirects,[target]);
      assert.equal(h.document.querySelector('a').getAttribute('href'),target);
      assert.equal(h.fallback,'/premium-v2/live.html');
      assert.equal(h.document.querySelector('meta[name="robots"]').content,'noindex,nofollow');
      assert.equal(h.document.querySelector('#plan'),null);
    }finally{h.close();}
  }
});
test('the old Desire reviewer forwards every valid day to the single current reviewer',()=>{
  for(const parameter of ['dia','day'])for(let day=1;day<=28;day++){
    const h=inspectRedirect('revision-deseo-dia-1.html','?'+parameter+'='+day);try{
      const target='/premium-v2/revision-programas-28-dias.html?programa=desire&dia='+day;
      assert.deepEqual(h.redirects,[target]);
      assert.equal(h.document.querySelector('a').getAttribute('href'),target);
      assert.equal(h.fallback,'/premium-v2/revision-programas-28-dias.html?programa=desire&dia=1');
      assert.equal(h.document.querySelector('meta[name="robots"]').content,'noindex,nofollow');
    }finally{h.close();}
  }
});
test('the old Desire reviewer normalizes invalid days and never accepts another destination',()=>{
  const examples=[
    ['',1],['?v=3',1],['?dia=0',1],['?dia=29',1],['?dia=-2',1],['?dia=1.5',1],['?dia=1e1',1],
    ['?dia=01',1],['?day=Infinity',1],['?dia=14abc',1],['?dia=%2F%2Fexample.test',1],
    ['?dia=14&day=20',14],['?dia=invalid&day=28',28],['?programa=erection&dia=2#other',2]
  ];
  for(const [suffix,day]of examples){
    const h=inspectRedirect('revision-deseo-dia-1.html',suffix);try{
      assert.deepEqual(h.redirects,['/premium-v2/revision-programas-28-dias.html?programa=desire&dia='+day]);
    }finally{h.close();}
  }
});
