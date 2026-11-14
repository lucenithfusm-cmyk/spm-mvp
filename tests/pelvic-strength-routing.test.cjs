const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');
const read=name=>fs.readFileSync(path.join(__dirname,'../premium-v2',name),'utf8');
function view(ctx){
 const html=read('pelvic-floor-lab/index.html');
 const dom=new JSDOM(html,{url:'https://spm.test/premium-v2/pelvic-floor-lab/index.html',runScripts:'dangerously',beforeParse:w=>{
  if(ctx)w.SPM_PELVIC_LAB_HOST={getContext:()=>ctx};
 }});
 const scripts=[...dom.window.document.querySelectorAll('script[src]')].map(n=>n.getAttribute('src'));
 dom.window.close();return scripts;
}
test('the weekly Pelvic Floor Lab mounts exactly one application, not a React copy behind it',()=>{
 for(const day of [3,10,17,24]){
  const scripts=view({day,origin:'dailyPlan',intent:'daily-relax',activityId:'pelvic-daily-lab'});
  assert.equal(scripts.filter(x=>x.includes('pelvic-weekly-flow-v1.js')).length,1);
  assert.equal(scripts.filter(x=>x.includes('index-pf-postures-20261113.js')).length,0);
 }
});
test('the educational Library still has its original React app, without the weekly overlay',()=>{
 const scripts=view({day:2,origin:'library',intent:'library',activityId:null});
 assert.equal(scripts.filter(x=>x.includes('index-pf-postures-20261113.js')).length,1);
 assert.equal(scripts.filter(x=>x.includes('pelvic-weekly-flow-v1.js')).length,0);
});
test('the original seven-step strength route is active and old competing overlays are unlinked',()=>{
 const live=read('live.html'),review=read('program-review-v1.js'),classic=read('pelvic-module-rebuild-v2.js'),bridge=read('pelvic-lab-bridge-v1.js');
 assert.doesNotMatch(live,/<script src="pelvic-interactive-v1\.js"/);
 assert.doesNotMatch(live,/<script src="pelvic-fidelity-v2\.js"/);
 assert.match(live,/pelvic-guided-v3-hotfix\.js\?v=20261114-classic1/);
 assert.match(review,/pelvic-module-rebuild-v2\.js\?v=20261114-classic1/);
 assert.match(classic,/window\.SPM_PELVIC_V2=\{open,close\}/);
 assert.match(classic,/source:'pelvic-classic-v2'/);
 assert.match(bridge,/data-pf-training/);
 assert.match(bridge,/Programa interactivo de 7 pasos/);
 assert.match(bridge,/const strengthAvailable=ready&&!!scheduled/);
 assert.match(bridge,/SPM_DAILY_PRACTICE\?\.launch\?\.\(assigned\.id\)/);
 assert.match(bridge,/document\.getElementById\('spmPelvicLabEntry'\)\?\.remove\(\)/);
 assert.match(bridge,/document\.querySelectorAll\('\[data-pf-lab\]'\)/);
});
test('the classic strength timer remains separate from Lab results and requires readiness',()=>{
 const classic=read('pelvic-module-rebuild-v2.js');
 assert.match(classic,/function sessionValid\(\)/);
 assert.match(classic,/readiness\?readiness\(\)/);
 assert.match(classic,/timerState\?\.block!=='done'/);
 assert.match(classic,/guidedResult\|\|=\{source:'pelvic-classic-v2'/);
 assert.match(read('program-paused.html'),/Estamos afinando tu experiencia/);
});

test('DE pelvic entries use the guarded classic strength selector rather than the Lab',()=>{
 const central=read('erectile-central-v3.js'),legacy=read('erectile-function-route.js'),review=read('program-review-v1.js'),live=read('live.html');
 assert.match(central,/if\(kind==='pelvic'\)\{/);
 assert.match(central,/window\.SPM_PELVIC_HUB\.open\(\{origin:'erectile',day\}\)/);
 assert.doesNotMatch(central,/kind==='pelvic'&&currentOrigin\(\)==='dailyPlan'&&window\.SPM_PELVIC_LAB/);
 assert.match(legacy,/window\.SPM_PELVIC_HUB\.open\(\{origin:'erectile',day\}\)/);
 assert.doesNotMatch(legacy,/SPM_PELVIC_FLOOR\?\.open/);
 assert.match(live,/erectile-central-v3\.js\?v=20261114-pelvic-entry2/);
 assert.match(review,/erectile-central-v3\.js\?v=20261114-pelvic-entry2/);
});
