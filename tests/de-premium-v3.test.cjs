const {test}=require('node:test'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'../premium-v2'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const live=read('live.html'),scripts=[...live.matchAll(/<script src="([^"]+)"/g)].map(m=>new URL(m[1],'https://spm.test/premium-v2/live.html'));
const active=['erection-ten-schedule-v1.js','erection-practice-v1.js','erection-fullscreen-v1.js','daily-practice-v1.js','recovery-story-premium-v4.js','recovery-story-extra-v1.js','recovery-story-audio-v1.js','recovery-audio-controller-staging-v10.js','spm-resources-content.js','spm-resources.js'];
for(let n=1;n<=4;n++)active.push(`erection-day${n}-touch-v1.js`,`erection-day${n}-bridge-v1.js`);
test('current DE, recovery and resource controllers exist, parse and are loaded exactly once',()=>{
 for(const file of active){assert.doesNotThrow(()=>new Function(read(file)),file);assert.equal(scripts.filter(url=>url.pathname==='/premium-v2/'+file).length,1,file);}
 for(const old of ['recovery-dialogue-v1.js','recovery-microstory-v2.js'])assert.equal(scripts.some(url=>url.pathname.endsWith('/'+old)),false,'retired script must not return');
});
test('DE review redirects to the active daily program and retains the resource integration boundary',()=>{
 assert.ok(read('de-review.html').includes("location.replace('revision-programas-28-dias.html?programa=erection&dia=1'"));
 const route=read('erectile-function-route.js');assert.ok(route.includes("if(c?.primary==='erection'&&window.SPM_DAILY_PRACTICE?.open)"));
 const app=read('app-live.js');for(const key of ['SPM_RESOURCE_CONTEXT','SPM_RESOURCE_RECORDS'])assert.ok(app.includes(key),key);
});
test('approved local doctor videos remain available without external HeyGen links',()=>{
 const videos=read('spm-video-library.js');
 for(const file of ['dr-spm-vascular-content.mp4','dr-spm-metabolic-content.mp4','dr-spm-medications-content.mp4','dr-spm-performance-anxiety-content.mp4']){assert.ok(videos.includes(file),file);assert.ok(fs.statSync(path.join(root,'assets/videos',file)).size>0,file);}
 assert.doesNotMatch(read('erectile-function-route.js'),/app\.heygen\.com/);
});
