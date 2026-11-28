const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const routes=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8')).routes;
const pathname=value=>new URL(value,'https://spm.invalid').pathname;
const matching=value=>routes.filter(route=>route.src&&new RegExp(route.src).test(pathname(value)));
const denied=value=>matching(value).find(route=>route.status===404&&route.continue!==true);
const blocked=[
 '/docs/qa/editorial-20261127/active-corpus.json',
 '/docs/qa/spm-agenda-legacy-manifest.json?v=1',
 '/scripts/qa/build-progress-migration.cjs',
 '/tests/support/progress-schema.sql',
 '/labs/breathing/src/lib/breath-audio.ts',
 '/.github/workflows/spm-technical-corrections-qa.yml',
 '/supabase/migrations/20261127203151_spm_versioned_agenda_atomic_progress.sql',
 '/supabase/sql/spm-atomic-progress-body.sql',
 '/supabase/functions/check-payment-status/index.ts',
 '/supabase/functions/_shared/assessment-policy.js',
 '/supabase/functions/_shared/assessment-policy.js.backup',
 '/supabase/functions/_shared/other-policy.js'
];
const publicFiles=[
 '/premium-v2/revision-programas-28-dias.html',
 '/premium-v2/program-review-v1.js',
 '/premium-v2/device-voice-v1.js',
 '/premium-v2/agenda-manifest-20261127.js',
 '/premium-v2/assessment-policy.js',
 '/premium-v2/assessment-policy.js?v=20261127-technical',
 '/premium-v2/breathing-lab/index.html',
 '/premium-v2/desire-lab/index.html',
 '/premium-v2/pelvic-floor-lab/index.html'
];

test('internal reports and server sources are denied before the filesystem fallback',()=>{
 const filesystem=routes.findIndex(route=>route.handle==='filesystem');
 assert.ok(filesystem>=0,'filesystem fallback is explicit');
 for(const name of [...blocked,'/docs','/tests/','/scripts','/labs','/.github','/supabase','/supabase/']){
  const route=denied(name);
  assert.ok(route,name);
  assert.ok(routes.indexOf(route)<filesystem,name+' must be denied before files are served');
  assert.equal(route.continue,undefined,name+' must terminate routing');
 }
});

test('the public scoring policy and shipped reviewer modules remain reachable',()=>{
 for(const name of publicFiles){
  assert.equal(denied(name),undefined,name);
  assert.ok(fs.existsSync(path.join(root,pathname(name))),name+' exists in the shipped tree');
 }
 // Exercise the actual runtime dependency list, not just the fixed examples.
 const review=fs.readFileSync(path.join(root,'premium-v2/program-review-v1.js'),'utf8');
 for(const match of review.matchAll(/['"]((?:\.\.\/)?[^'"\s]+\.(?:js|css)(?:\?[^'"\s]*)?)['"]/g)){
  const url=new URL(match[1],'https://spm.invalid/premium-v2/');
  assert.equal(denied(url.href),undefined,url.pathname);
 }
});

test('all tracked database and audit files stay outside the public HTTP boundary',()=>{
 const files=cp.execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
 const scoped=files.filter(file=>/^(?:docs|tests|scripts|labs|\.github|supabase)\//.test(file));
 assert.ok(scoped.length>100,'exercise the real repository inventory');
 for(const file of scoped) assert.ok(denied('/'+file),file);
});

test('deployment exclusions keep backend sources private while retaining the browser policy copy',()=>{
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'spm-vercelignore-'));
 try{
  cp.execFileSync('git',['init','--quiet',temporary]);
  fs.copyFileSync(path.join(root,'.vercelignore'),path.join(temporary,'.gitignore'));
  const names=[...blocked,...publicFiles].map(value=>pathname(value).slice(1));
  const result=cp.spawnSync('git',['check-ignore','--no-index','--stdin'],{
   cwd:temporary,encoding:'utf8',input:names.join('\n')+'\n'
  });
  assert.equal(result.status,0,result.stderr);
  const excluded=new Set(result.stdout.trim().split('\n'));
  for(const name of blocked) assert.ok(excluded.has(pathname(name).slice(1)),name);
  for(const name of publicFiles) assert.ok(!excluded.has(pathname(name).slice(1)),name);
 }finally{fs.rmSync(temporary,{recursive:true,force:true});}
});

test('the shipped browser policy is byte-for-byte identical to the canonical server policy',()=>{
 assert.deepEqual(fs.readFileSync(path.join(root,'premium-v2/assessment-policy.js')),fs.readFileSync(path.join(root,'supabase/functions/_shared/assessment-policy.js')));
 for(const file of ['premium-v2/live.html','premium-v2/program-review-v1.js']){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  assert.ok(source.includes('assessment-policy.js?v=20261127-technical'),file);
  assert.ok(!source.includes('supabase/functions/_shared/assessment-policy.js'),file+' must not request an excluded backend path');
 }
});

test('existing commercial pause routes remain intact',()=>{
 for(const name of ['/','/index.html','/28-dias','/spm-central/','/premium-v2/live.html','/premium-v2/free-assessment.html','/premium-v2/commercial-pilot.html']){
  assert.ok(matching(name).some(route=>route.dest==='/premium-v2/program-paused.html'),name);
 }
 assert.ok(!matching('/premium-v2/revision-programas-28-dias.html').some(route=>route.dest==='/premium-v2/program-paused.html'));
});
