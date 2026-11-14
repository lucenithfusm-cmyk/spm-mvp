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
 assert.match(live,/pelvic-guided-v3-hotfix\.js\?v=20261114-circle-halo-welcome4/);
 assert.match(review,/pelvic-module-rebuild-v2\.js\?v=20261114-circle-halo-welcome4/);
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

test('reviewer uses a valid prepared example without relaxing real-patient safety',()=>{
 const review=read('program-review-v1.js'),bridge=read('pelvic-lab-bridge-v1.js');
 assert.match(review,/answers:\{pf_awareness:'good_control',pf_tension:1\}/);
 assert.doesNotMatch(review,/answers:\{pf_awareness:'yes'/);
 assert.match(bridge,/a\.pf_awareness==='hard_to_relax'/);
 assert.match(bridge,/const strengthAvailable=ready&&!!scheduled/);
 assert.match(bridge,/data-pf-library-strength/);
 assert.match(bridge,/data-pf-library-awareness/);
 assert.doesNotMatch(bridge,/data-pf-education/);
 assert.doesNotMatch(bridge,/data-pf-daily/);
});

test('old force training overlays are removed from the current route and cue assets are independent from Lab',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const live=read('live.html'),oldTraining=read('premium-training-v4.js'),fidelity=read('spm-premium-program-fidelity.js'),strength=read('pelvic-module-rebuild-v2.js');
 assert.doesNotMatch(live,/pelvic-premium-router\.js/);
 assert.doesNotMatch(live,/pelvic-interactive-v1\.js|pelvic-fidelity-v2\.js/);
 assert.doesNotMatch(fidelity,/function hookPelvic|function addPelvicCalendar|spmPelvicIntro/);
 assert.match(oldTraining,/if\(type==='pelvic'\)return false/);
 assert.doesNotMatch(strength,/closest\('\.pfi-launch'\)/);
 assert.doesNotMatch(strength,/pelvic-floor-lab\/(?:audio|assets)\//);
 assert.match(strength,/assets\/audio\/pelvic\/strength-cues\/contrae\.mp3/);
 for(const f of ['pelvic-premium-router.js','pelvic-interactive-v1.js','pelvic-fidelity-v2.js'])assert.equal(fs.existsSync(path.join(__dirname,'../premium-v2',f)),false);
});

test('strength welcome includes the approved speaker invitation and Lab guidance remains isolated',()=>{
 const src=read('pelvic-guidance-v1.js');
 assert.match(src,/En cada paso encontrarás una bocina/);
 assert.match(src,/Presiónala cuando quieras escuchar la explicación de la actividad y sus recomendaciones/);
 assert.match(src,/resource2\.heygen\.ai\/text_to_speech/);
 assert.match(src,/pelvic-lab-daily-20261113\.mp3/);
});
