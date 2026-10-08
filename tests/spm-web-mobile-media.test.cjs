const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'../public-web');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('no expired media, external temporary JWT, or out-of-publish references in the institutional home',()=>{
 assert.doesNotMatch(html,/d2jqrm6oza8nb6\.cloudfront\.net|_jwt=/i);
 assert.doesNotMatch(html,/src=["']\.\.\/premium-v2\//);
 const sources=[...html.matchAll(/\b(?:src|data-src-es|data-src-en)=["']([^"']+)["']/g)].map(m=>m[1]);
 assert.ok(sources.length>=10);
 for(const src of sources){
   if(/^(https?:|data:)/i.test(src))continue;
   const p=path.resolve(root,src.split(/[?#]/)[0]);
   assert.ok(p.startsWith(root+path.sep),'media escaped publish directory: '+src);
   assert.ok(fs.existsSync(p),'missing media: '+src);
 }
});
test('bilingual assets persist and image references resolve',()=>{
 for(const n of ['hero-reflective.webp','about-connection.webp','new-beginning.webp','confident-moment.webp','your-pace-es.webp','your-pace-en.webp']){
  assert.ok(fs.statSync(path.join(root,'assets/site',n)).size>10000,n);
 }
 assert.match(html,/data-src-en="assets\/site\/your-pace-en\.webp"/);
 assert.match(html,/data-src-es="assets\/site\/your-pace-es\.webp"/);
});
test('educational SPM videos have permanent paths and do not preload large files',()=>{
 const videos=[...html.matchAll(/<video\s+[^>]*>/g)].map(m=>m[0]);
 assert.equal(videos.length,3);
 for(const tag of videos){
  assert.match(tag,/preload="none"/);
  const pathValue=tag.match(/src="([^"]+)"/)?.[1];
  assert.ok(pathValue&&fs.existsSync(path.join(root,pathValue)),pathValue);
 }
});
test('unavailable commercial cinematic is not presented as playable, original approved file not substituted',()=>{
 assert.doesNotMatch(html,/id="spmCinema"[^>]*src=/);
 assert.match(html,/data-i18n="cinemaSoonLabel"/);
 assert.match(html,/Presentación audiovisual SPM/);
});
test('responsive iPhone typography and CTA are explicit and accessible',()=>{
 assert.match(html,/\.hero h1\{font-size:clamp\(34px,9\.5vw,42px\)/);
 assert.match(html,/\.actions \.btn\.pri\{padding:10px 13px/);
 assert.match(html,/object-position:48% center/);
});
test('inline website script has valid JavaScript',()=>{
 for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){
  assert.doesNotThrow(()=>new vm.Script(m[1]));
 }
});
