const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..','premium-v2');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const js=['erectile-function-route.js','erectile-function-premium.js','erectile-library-v3.js','erectile-guided-v3.js','erectile-central-v3.js','recovery-story-premium-v4.js','recovery-story-extra-v1.js','spm-resources-content.js','spm-resources.js'];
for(const f of js){const c=read(f);assert.doesNotThrow(()=>new Function(c),f+' must parse');}
const lib=read('erectile-library-v3.js');
for(let d=1;d<=28;d++) assert(new RegExp('\\b'+d+':\\{title:').test(lib),'DE library missing day '+d);
const route=read('erectile-function-route.js');
assert(route.includes("0:{t:'Nivel 0'")&&route.includes("4:{t:'Nivel 4'"),'SPM 0-4 firmness scale missing');
assert(route.includes('SPM_FIRMNESS_GUIDE')&&route.includes("bind($('deContent'))"),'shared visual firmness reference not wired');
assert(!/speechSynthesis|SpeechSynthesisUtterance/.test(route),'browser TTS remains in DE route');
assert(!/app\.heygen\.com/.test(route),'external HeyGen URLs remain in active DE route');
for(const f of ['erectile-function-premium.js','erectile-guided-v3.js','erectile-central-v3.js']){
 const c=read(f);assert(!/speechSynthesis|SpeechSynthesisUtterance/.test(c),'browser TTS remains in '+f);
}
const central=read('erectile-central-v3.js');
for(const s of ["dailyPlan","library","'lab'","SPM_DE_GUIDED_V3","SPM_RESOURCES","spm_de_result_v3","spm:de-return"]) assert(central.includes(s),'central DE integration missing '+s);
const live=read('live.html');
for(const s of ['spm-resources-content.js','spm-resources.js','recovery-story-premium-v4.js','recovery-story-extra-v1.js','erectile-library-v3.js','erectile-guided-v3.js','erectile-central-v3.js']) assert(live.includes(s),'live.html missing '+s);
const videos=read('spm-video-library.js');
for(const f of ['dr-spm-vascular-content.mp4','dr-spm-metabolic-content.mp4','dr-spm-medications-content.mp4','dr-spm-performance-anxiety-content.mp4']){assert(videos.includes(f),'video library missing '+f);assert(fs.existsSync(path.join(root,'assets','videos',f)),'video asset missing '+f);}
const app=read('app-live.js');assert(app.includes('SPM_RESOURCE_CONTEXT')&&app.includes('SPM_RESOURCE_RECORDS'),'resource integration surface missing');
const review=read('de-review.html');assert(review.includes('revision-programas-28-dias.html?programa=erection')&&review.includes('location.replace'),'historical DE reviewer must forward to the maintained program review');
console.log('DE integration QA OK: 28/28 content, syntax, origins, resources, internal videos and maintained reviewer.');
