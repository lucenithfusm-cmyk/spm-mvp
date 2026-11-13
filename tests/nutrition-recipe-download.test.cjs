// Synthetic program context only. Run: node --test tests/nutrition-recipe-download.test.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');

const repository=path.join(__dirname,'..');
const premium=path.join(repository,'premium-v2');
const recipe=JSON.parse(fs.readFileSync(path.join(premium,'assets/nutrition/recetario-spm.json'),'utf8'));
const foodIds=['vegetables','fruit','protein','pulses','fats','limit'];
const tick=()=>new Promise(resolve=>setTimeout(resolve,25));

async function harness({readFails=false}={}){
 const dom=new JSDOM('<main id="plan"></main>',{
  url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true,
 });
 const w=dom.window,saved=[],observers=[],NativeObserver=w.MutationObserver;
 // No email, purchase eligibility, gift delivery record or completed activities.
 const context={userId:'recipe-test-user',planId:'recipe-test-plan',day:1,primary:'desire',
  answers:{},checkins:[],completed:[],safety:'none',flags:[]};
 w.MutationObserver=class extends NativeObserver{constructor(callback){super(callback);observers.push(this);}};
 w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
 w.HTMLElement.prototype.scrollTo=function(){};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.SPM_RESOURCE_CONTEXT=()=>context;
 w.SPM_RESOURCE_RECORDS={
  read:async()=>{if(readFails)throw Error('Synthetic record-service outage');return [];},
  save:async record=>saved.push(record),
 };
 for(const file of ['spm-resources-content.js','spm-resources.js']){
  w.eval(fs.readFileSync(path.join(premium,file),'utf8'));
 }
 w.SPM_RESOURCES.refresh();
 await tick();
 const open=(origin='wellnessLibrary')=>w.SPM_RESOURCES.open('nutrition',context.day,{origin});
 open();
 return {w,d:w.document,context,saved,open,close:()=>{
  observers.forEach(observer=>observer.disconnect());
  w.close();
 }};
}

function assertGiftFirst(d){
 const home=d.querySelector('.sr-module-home-screen');
 const gift=home?.querySelector('.sr-recipe-gift');
 assert.ok(gift,'Nutrition exposes the recipe gift');
 assert.equal(home.hidden,false,'Nutrition home is visible');
 assert.equal(gift.hidden,false,'The recipe gift is visible');
 assert.equal(home.firstElementChild,gift,'The gift precedes the nutrition introduction and food groups');
 assert.ok(home.querySelector('.sr-nut-hero'),'The existing nutrition introduction is preserved');
 assert.ok(gift.compareDocumentPosition(home.querySelector('.sr-nut-hero'))&4);
 assert.equal(d.querySelectorAll('.sr-recipe-gift').length,1,'There is one recipe card');
 return gift;
}

test('recipe gift is immediately available without an email, eligibility check or cloud records',async()=>{
 for(const readFails of [false,true]){
  const h=await harness({readFails});
  try{
   const gift=assertGiftFirst(h.d);
   assert.match(gift.textContent,/RECETARIO\s+SPM/i);
   assert.equal(gift.querySelector('form,input,select,textarea'),null,'Download requires no form');
   assert.equal(h.d.querySelector('input[type="email"]'),null,'No email collection is introduced');
   assert.doesNotMatch(gift.textContent,/primeros\s+50|first\s+50/i,'The gift has no first-buyers limit');
   assert.equal(h.saved.length,0,'Viewing the gift never records an activity');
   assert.deepEqual(h.context.completed,[],'Viewing the gift does not complete a program day');
  }finally{h.close();}
 }
});

test('download and open links point directly to the existing PDF and the cover is available',async()=>{
 const h=await harness();
 try{
  const gift=assertGiftFirst(h.d);
  const download=gift.querySelector('a[data-recipe-download]');
  const open=gift.querySelector('a[data-recipe-open]');
  assert.ok(download,'A native download link is present');
  assert.ok(open,'A separate mobile-friendly open link is present');
  assert.equal(download.getAttribute('href'),recipe.downloadUrl);
  assert.equal(open.getAttribute('href'),recipe.url);
  assert.equal(download.getAttribute('download'),'Recetario_SPM.pdf');
  assert.notEqual(download.getAttribute('aria-disabled'),'true','The download link is enabled');
  assert.equal(open.target,'_blank');
  assert.ok(open.relList.contains('noopener'));
  const url=new URL(download.href);
  assert.equal(url.protocol,'https:');
  assert.equal(url.hostname,'0dzp02ilnexs1jlo.public.blob.vercel-storage.com');
  assert.equal(url.search,'?download=1','The download uses Content-Disposition without an email or access token');
  assert.equal(new URL(open.href).search,'','The open link uses the inline PDF');
  assert.equal(recipe.contentType,'application/pdf');
  assert.equal(recipe.pages,15);
  assert.equal(recipe.preparations,12);
  const cover=gift.querySelector('img');
  assert.ok(cover,'The gift shows the existing recipe cover');
  assert.ok(cover.alt.trim(),'The cover has alternative text');
  assert.ok(fs.existsSync(path.join(repository,new URL(cover.src).pathname.slice(1))),'The cover file exists');
 }finally{h.close();}
});

test('all six food categories still open and return to the recipe gift without duplicates',async()=>{
 const h=await harness();
 try{
  assertGiftFirst(h.d);
  const categoryIds=()=>Array.from(h.d.querySelectorAll('.sr-nut-grid [data-food]'),card=>card.dataset.food);
  assert.deepEqual(categoryIds(),foodIds);
  for(const id of foodIds){
   h.d.querySelector(`.sr-nut-grid [data-food="${id}"]`).click();
   const detail=h.d.querySelector('#srFoodDetail');
   assert.equal(detail.hidden,false,`${id} detail opens`);
   assert.equal(h.d.querySelector('.sr-module-home-screen').hidden,true,'The home is hidden while reading a category');
   const food=h.w.SPM_RESOURCE_CONTENT.foods.find(item=>item.id===id);
   assert.ok(detail.textContent.includes(food.name.es),`${id} retains its heading`);
   assert.ok(detail.textContent.includes(food.prep.es),`${id} retains its preparation guidance`);
   detail.querySelector('[data-sr-module-home]').click();
   assert.equal(detail.hidden,true,`${id} detail closes`);
   assertGiftFirst(h.d);
   assert.deepEqual(categoryIds(),foodIds,'All six categories remain after returning');
  }
  assert.equal(h.saved.length,0);
 }finally{h.close();}
});

test('reopening Nutrition from the library or daily practice keeps one gift and both links',async()=>{
 const h=await harness();
 try{
  for(const origin of ['wellnessLibrary','dailyPlan','library','wellnessLibrary']){
   h.open(origin);
   assert.equal(h.d.querySelectorAll('dialog').length,1);
   const gift=assertGiftFirst(h.d);
   assert.equal(gift.querySelectorAll('[data-recipe-download]').length,1);
   assert.equal(gift.querySelectorAll('[data-recipe-open]').length,1);
   h.d.querySelector('[data-sr-close]').click();
   assert.equal(h.d.querySelector('dialog'),null);
  }
  assert.equal(h.saved.length,0);
 }finally{h.close();}
});
