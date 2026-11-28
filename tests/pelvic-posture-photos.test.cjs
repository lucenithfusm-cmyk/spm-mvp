const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const lab='premium-v2/pelvic-floor-lab',page=read(lab+'/index.html');
const script=page.match(/<script type="module"[^>]*src="([^"]+)"/);
assert.ok(script,'el HTML declara el bundle actual');
const bundlePath=path.join(lab,script[1]),bundle=read(bundlePath);
const builtPhoto=posture=>{
 const match=bundle.match(new RegExp('spm-posture-'+posture+'-20261113(?:-[A-Za-z0-9_-]+)?\\.webp'));
 assert.ok(match,posture+' tiene un recurso emitido por el build');
 return path.join(path.dirname(bundlePath),match[0]);
};
test('Las posturas usan fotos SPM y conservan la selección accesible',()=>{
 const tsx=read('labs/pelvic-floor/src/components/PelvicLab.tsx');
 assert.match(tsx,/import seatedPosture/);assert.match(tsx,/import reclinedPosture/);
 assert.doesNotMatch(tsx,/svg viewBox="0 0 180 112"/);
 assert.match(tsx,/const seated = posture === 'seated'/);
 assert.match(tsx,/<img[^>]*src=\{seated \? seatedPosture : reclinedPosture\}/);
 for(const posture of ['seated','reclined'])assert.ok(fs.existsSync(path.join(root,builtPhoto(posture))));
 assert.match(tsx,/aria-pressed=\{posture === item.id\}/);assert.match(tsx,/onClick=\{\(\) => setPosture\(item.id\)\}/);
});
test('Las dos fotos del build son WebP y conservan exactamente los bytes aprobados de fuente',()=>{
 for(const posture of ['seated','reclined']){
  const source=fs.readFileSync(path.join(root,'labs/pelvic-floor/src/assets','spm-posture-'+posture+'-20261113.webp'));
  const built=fs.readFileSync(path.join(root,builtPhoto(posture)));
  assert.equal(built.toString('ascii',0,4),'RIFF');assert.equal(built.toString('ascii',8,12),'WEBP');
  assert.equal(crypto.createHash('sha256').update(built).digest('hex'),crypto.createHash('sha256').update(source).digest('hex'));
 }
});
test('La web carga sus recursos vigentes y conserva la pausa pública',()=>{
 const style=page.match(/<link rel="stylesheet" crossorigin href="([^"]+)"/);assert.ok(style);
 assert.ok(fs.existsSync(path.join(root,lab,style[1])));
 assert.match(read('premium-v2/pelvic-lab-bridge-v1.js'),/pelvic-floor-lab\/index\.html/);
 assert.match(read('premium-v2/live.html'),/pelvic-lab-bridge-v1.js\?v=[\w-]+/);
 assert.match(read('premium-v2/program-paused.html'),/Estamos afinando tu experiencia/);
});
