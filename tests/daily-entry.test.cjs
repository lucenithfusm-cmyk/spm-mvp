const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../labs/breathing/node_modules/jsdom');
const read=name=>fs.readFileSync(path.join(__dirname,'../premium-v2',name),'utf8');
const delay=()=>new Promise(r=>setTimeout(r,50));
function harness(primary='lifestyle'){
 const dom=new JSDOM('<section id="plan"><div id="dayGrid"></div></section>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const observers=[];const w=dom.window,NativeObserver=w.MutationObserver;w.MutationObserver=class extends NativeObserver{constructor(cb){super(cb);observers.push(this)}};w.HTMLElement.prototype.scrollIntoView=function(){};w.matchMedia=()=>({matches:false});
 const c={userId:'qa',planId:'p1',day:12,primary,secondary:'desire',motives:[primary,'desire'],safety:'none',flags:[],checkins:[],completed:[]};
 w.SPM_RESOURCE_CONTEXT=()=>c;w.SPM_DESIRE_RECORDS={read:async()=>({}),save:async()=>{throw Error('No writes expected')}};
 w.eval(read('modules.js'));
 for(const d of w.SPM_MODULES.days){const card=w.document.createElement('article');card.className='dayCard';card.innerHTML=`<div class="dayTop"><span class="dayNum">${d.d}</span><h4>${d.title_es}</h4><span class="tag">Bajo deseo sexual</span></div><div class="dayBody"><div class="lessonFlow"><div class="lesson"><p>${d.learn_es}</p></div></div></div><button data-desire-daily>Deseo · apoyo para hoy</button>`;card.querySelector('.dayTop').onclick=()=>card.classList.toggle('open');w.document.getElementById('dayGrid').append(card);}
 let plays=[];w.SPM_NATIVE_VIDEO={open:(url,title)=>plays.push({url,title})};
 for(const file of ['spm-video-library.js','desire-lab-bridge-v1.js','daily-progression-v3.js'])w.eval(read(file));
 w.dispatchEvent(new w.Event('spm:resourcecontext'));
 return {w,c,plays,close:()=>{observers.forEach(o=>o.disconnect());w.close()}};
}
test('secondary Desire never adds the same module to all daily activities',async()=>{
 for(const route of ['lifestyle','erection','ejaculation']){const h=harness(route);try{await delay();assert.equal(h.w.document.querySelectorAll('[data-desire-daily]').length,0);assert.ok(h.w.document.querySelector('#spmDesireLabEntry button'));}finally{h.close()}}
});
test('primary Desire exposes just its current daily practice inside the day body',async()=>{
 const h=harness('desire');try{await delay();const b=h.w.document.querySelector('[data-desire-daily]');assert.equal(h.w.document.querySelectorAll('[data-desire-daily]').length,1);assert.equal(b.parentElement.className,'dayBody');assert.equal(b.closest('.dayCard').querySelector('.dayNum').textContent,'12');h.c.day=13;h.w.dispatchEvent(new h.w.Event('spm:resourcecontext'));await delay();assert.equal(h.w.document.querySelectorAll('[data-desire-daily]').length,1);assert.match(h.w.document.querySelector('[data-desire-daily]').textContent,/Día 13/);h.c.primary='erection';h.w.dispatchEvent(new h.w.Event('spm:resourcecontext'));await delay();assert.equal(h.w.document.querySelectorAll('[data-desire-daily]').length,0);}finally{h.close()}
});
test('video selection ignores profile labels, stays in the lesson and repairs stale selections',async()=>{
 const h=harness();try{await delay();const d=h.w.document;assert.equal(d.querySelectorAll('.dayCard .spmPlay[data-key="dr-low-desire"]').length,0);assert.ok(d.querySelector('#spmVideoLibrary [data-key="dr-low-desire"]'));
  const card=d.querySelector('.dayCard:nth-child(18)');card.querySelector('.dayTop h4').textContent='Comunicación con la pareja';card.querySelector('.lesson p').textContent='Hablar sin presión.';await delay();assert.equal(card.querySelector('.spmPlay').dataset.key,'partner-communication');assert.equal(card.querySelector('.spmPlay').parentElement.className,'dayBody');card.querySelector('.spmPlay').click();assert.match(h.plays.at(-1).url,/partner-communication\.mp4$/);
  card.querySelector('.dayTop h4').textContent='Bajo deseo sexual';await delay();assert.equal(card.querySelector('.spmPlay').dataset.key,'dr-low-desire');
  card.querySelector('.dayTop h4').textContent='Reflexión personal';await delay();assert.equal(card.querySelector('.spmPlay'),null);
 }finally{h.close()}
});
test('the daily entry opens and focuses the exact Central day without completing it',async()=>{
 const h=harness();try{await delay();const b=h.w.document.querySelector('#spmGoToday');assert.match(b.textContent,/Empieza aquí cada día/);assert.match(b.getAttribute('aria-label'),/Día 12/);assert.equal(b.parentElement.querySelector('h2').compareDocumentPosition(b)&2,2);b.click();await new Promise(r=>setTimeout(r,250));const active=h.w.document.querySelector('.spm-current-day');assert.equal(active.querySelector('.dayNum').textContent,'12');assert.ok(active.classList.contains('open'));assert.equal(h.w.document.activeElement,active);assert.equal(h.c.day,12);assert.deepEqual(h.c.completed,[]);}finally{h.close()}
});
