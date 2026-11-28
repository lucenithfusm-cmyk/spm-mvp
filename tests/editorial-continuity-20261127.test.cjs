const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');
const {harness,wait}=require('./helpers/reviewer-harness.cjs');
const file='premium-v2/daily-practice-v1.js',source=fs.readFileSync(file,'utf8');
const capsules=s=>JSON.parse(s.split('\n').find(x=>x.startsWith('const epCapsules=')).slice('const epCapsules='.length,-1));
const current=capsules(source),baseline=capsules(cp.execFileSync('git',['show','c27bbbba0292513b898d0684a30a95cd1e4e6449:'+file],{encoding:'utf8',maxBuffer:3000000}));
test('all 14 EP capsule scripts match their written narration and preserve the original artwork bytes',()=>{
 assert.deepEqual(Object.keys(current).map(Number),Array.from({length:14},(_,i)=>i*2+1));
 for(const [day,html]of Object.entries(current)){
  const now=JSDOM.fragment(html),old=JSDOM.fragment(baseline[day]);
  assert.equal(now.querySelector('img').getAttribute('src'),old.querySelector('img').getAttribute('src'),'artwork '+day);
  assert.equal(now.querySelector('[data-ep-play]').dataset.script,now.querySelector('details p').textContent,'spoken/written '+day);
  assert.ok(now.querySelector('img').alt.trim());
 }
});
// DOM contracts do not certify the final visual alignment of text and artwork.
test('all 14 optional EP capsules retain full-image geometry, revised titles and explicit voice controls without creating a record',async()=>{
 const h=await harness('?programa=ejaculation&dia=1');
 try{
  const w=h.w,spoken=[];w.SPM_VOICE={supported:true,cancel(){},speak:u=>spoken.push(u.text)};
  for(const [day,html]of Object.entries(current)){
   await w.SPM_PROGRAM_REVIEW.select('ejaculation',Number(day));await wait(10);
   const d=w.document,poster=d.querySelector('.spm-ep-poster'),original=JSDOM.fragment(html);
   assert.ok(poster,'capsule '+day);assert.match(d.querySelector('.spm-ep-entry style').textContent,/\.spm-ep-poster\{[^}]*aspect-ratio:9\/16/);
   assert.equal(poster.querySelector('.spm-ep-title').textContent,original.querySelector('img').alt);
   const art=poster.querySelector('.spm-ep-art'),image=art.querySelector('img[alt=""]'),style=d.querySelector('.spm-ep-entry style').textContent;
   assert.ok(image);assert.equal(image.getAttribute('src'),original.querySelector('img').getAttribute('src'));
   assert.match(style,/\.spm-ep-art img\{[^}]*object-fit:contain/);assert.doesNotMatch(style,/height:49%|\.spm-ep-art::after|linear-gradient/);
   const [x,y,width,height]=art.dataset.epTitleBox.split(',').map(Number),iw=Number(image.getAttribute('width')),ih=Number(image.getAttribute('height'));
   assert.ok(x>=0&&x+width<=iw,'title within image width '+day);
   assert.ok(y>=ih*.4&&y+height<ih*.75,'bounded title zone above playback row '+day);
   assert.ok(height<ih*.3,'no half-image replacement '+day);
   assert.equal(art.style.getPropertyValue('--ep-title-top'),`${y/ih*100}%`);
   const play=poster.closest('button[data-ep-play]'),guide=d.querySelector('.spm-ep-capsule details p');
   assert.ok(play);assert.equal(play.querySelector('.spm-ep-control').previousElementSibling,poster);
   assert.equal(play.dataset.script,guide.textContent);assert.match(play.textContent,/Escuchar guía/);assert.match(play.textContent,/Detener guía/);
   const before=await w.SPM_DAILY_RECORDS.read('review-only:review-ejaculation',Number(day));poster.click();assert.equal(spoken.at(-1),guide.textContent);assert.equal(play.getAttribute('aria-pressed'),'true');play.click();assert.equal(play.getAttribute('aria-pressed'),'false');
   assert.deepEqual(JSON.parse(JSON.stringify(await w.SPM_DAILY_RECORDS.read('review-only:review-ejaculation',Number(day)))),JSON.parse(JSON.stringify(before)));
   assert.equal(w.SPM_DAILY_PRACTICE.assignments().some(a=>/capsule/i.test(a.id)),false);
  }
 }finally{h.close();}
});
