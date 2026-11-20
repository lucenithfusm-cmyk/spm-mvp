// Run with NODE_PATH pointing to jsdom 26.1.0, as in movement-daily-cards-qa.yml.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const {scripts,bootstrap}=require('./support/movement-daily-fixture.cjs');
const root=path.join(__dirname,'..','premium-v2');
const allDays=[2,5,8,11,14,17,20,23,26],visualDays=[2,5,8,11,14,23];
const tick=()=>new Promise(resolve=>setTimeout(resolve,25));
async function harness(options={}){
 const dom=new JSDOM('<main id="plan"></main>',{url:'https://spm.test/premium-v2/review.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,observers=[],Observer=w.MutationObserver;
 w.MutationObserver=class extends Observer{constructor(fn){super(fn);observers.push(this);}};
 w.eval('('+bootstrap.toString()+')('+JSON.stringify(options)+')');
 for(const file of scripts)w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 await tick();w.SPM_DAILY_PRACTICE.open({focus:false});
 return {w,d:w.document,qa:w.SPM_MOVEMENT_QA,c:w.SPM_MOVEMENT_QA.context,close(){observers.forEach(o=>o.disconnect());w.close();}};
}
test('all six domains retain the nine original Movimiento days and optional assignments',async()=>{
 const h=await harness();try{
  for(const primary of ['erection','ejaculation','desire','confidence','wellbeing','lifestyle']){
   const rows=Array.from({length:28},(_,i)=>h.w.SPM_DAILY_PRACTICE.assignments({...h.c,primary,day:i+1}).filter(a=>a.tip?.category==='movement'));
   assert.deepEqual(rows.flatMap((r,i)=>r.length?[i+1]:[]),allDays);
   assert.ok(rows.every(r=>r.length<=1));
   const movement=rows.flat();
   assert.deepEqual(movement.map(a=>a.tip.id),allDays.map((_,i)=>'mov.'+String(i+1).padStart(2,'0')));
   assert.ok(movement.every(a=>a.optional===true));
   assert.deepEqual(movement.filter(a=>a.tip.image).map(a=>a.tip.day),visualDays);
  }
 }finally{h.close();}
});
test('six approved cards open the complete matching artwork with the existing spoken and written steps',async()=>{
 for(const day of visualDays){
  const h=await harness({day});try{
   const tip=h.w.SPM_WELLNESS_DAILY_TIP_V1.tipsFor(day).find(t=>t.category==='movement');
   const card=h.d.querySelector('[data-activity="wellness-movement"]');
   const image=card.querySelector('img'),expected='assets/movement-daily-cards/day-'+String(day).padStart(2,'0')+'.webp';
   assert.equal(image.getAttribute('src'),expected);assert.ok(image.alt.length>10);
   const bytes=fs.readFileSync(path.join(root,expected));assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
   card.querySelector('[data-daily-open]').click();await tick();
   const panel=h.d.querySelector('[data-wellness-session]');
   assert.equal(panel.querySelector('img').getAttribute('src'),expected);
   assert.deepEqual(Array.from(panel.querySelectorAll('li'),li=>li.textContent),Array.from(tip.steps));
   const audio=panel.querySelector('[data-spm-speak]');
   const narration=tip.steps.map((s,i)=>`Paso ${i+1}. ${s}`).join(' ');
   assert.equal(audio.dataset.spmSpeak,narration);audio.click();assert.equal(h.qa.spoken.at(-1),narration);
   assert.equal(audio.getAttribute('aria-pressed'),'true');audio.click();assert.equal(audio.getAttribute('aria-pressed'),'false');
   assert.equal(h.qa.writes.length,0);
  }finally{h.close();}
 }
});
test('days without recovered art retain usable current instructions and no substitute image',async()=>{
 for(const day of [17,20,26]){
  const h=await harness({day});try{
   const card=h.d.querySelector('[data-activity="wellness-movement"]');assert.equal(card.querySelector('img'),null);
   card.querySelector('[data-daily-open]').click();await tick();
   const panel=h.d.querySelector('[data-wellness-session]');assert.ok(panel);assert.equal(panel.querySelector('img'),null);
   assert.ok(panel.querySelectorAll('li').length>=2);assert.ok(panel.querySelector('[data-spm-speak]'));assert.ok(panel.querySelector('[data-wellness-done]'));
  }finally{h.close();}
 }
});
test('review and urgent flags keep visual movement practice paused before opening or saving',async()=>{
 for(const safety of ['review','urgent'])for(const day of visualDays){
  const h=await harness({day});try{
   h.c.safety=safety;h.c.flags=['s_cardiac'];h.w.dispatchEvent(new h.w.Event('spm:resourcecontext'));await tick();
   const card=h.d.querySelector('[data-activity="wellness-movement"]');
   assert.equal(card.querySelector('img'),null);assert.equal(card.querySelector('[data-spm-speak]'),null);assert.equal(card.querySelector('[data-daily-confirm]'),null);
   assert.match(card.textContent,/Práctica en pausa/);
   card.querySelector('[data-daily-open]').click();await tick();
   assert.equal(h.d.querySelector('[data-wellness-session]'),null);assert.equal(h.d.querySelector('[data-wellness-done]'),null);
   assert.match(h.d.querySelector('#spmDailyWorkspace').textContent,/pausa/);
   await assert.rejects(h.w.SPM_DAILY_PRACTICE.saveActivity('wellness-movement',{confirmed:true}));
   assert.equal(h.qa.writes.length,0);assert.equal(h.qa.spoken.length,0);assert.equal(h.c.day,day);
  }finally{h.close();}
 }
});
test('saving each movement activity records its own day and tip without completing or advancing the day',async()=>{
 for(const [index,day] of allDays.entries()){
  const h=await harness({day});try{
   await h.w.SPM_DAILY_PRACTICE.launch('wellness-movement');
   h.d.querySelector('[data-wellness-done]').click();await tick();
   assert.equal(h.qa.writes.length,1);const [id,data,scope,savedDay]=h.qa.writes[0];
   assert.equal(id,'wellness-movement');assert.equal(data.tipId,'mov.'+String(index+1).padStart(2,'0'));
   assert.equal(data.activityKind,'wellness');assert.equal(data.completed,true);assert.equal(data.confirmed,true);
   assert.equal(scope,'movement-qa:movement-plan');assert.equal(savedDay,day);assert.equal(h.c.day,day);assert.equal(h.c.completed.length,0);
   assert.match(h.d.querySelector('[data-activity="wellness-movement"]').textContent,/Registrada/);
  }finally{h.close();}
 }
});
test('a changed day, account scope or safety state prevents a stale open card from saving',async()=>{
 for(const change of [c=>{c.day=5;},c=>{c.planId='different-plan';},c=>{c.safety='review';}]){
  const h=await harness({day:2});try{
   await h.w.SPM_DAILY_PRACTICE.launch('wellness-movement');const button=h.d.querySelector('[data-wellness-done]');
   change(h.c);button.click();await tick();
   assert.equal(h.qa.writes.length,0);assert.equal(button.disabled,false);
   assert.match(h.d.querySelector('[data-wellness-session] [role="status"]').textContent,/No se pudo guardar/);
  }finally{h.close();}
 }
});
test('the water and dance library links retain their targeted activities without saving',async()=>{
 for(const [day,activityId] of [[23,'swim'],[26,'dance']]){
  const h=await harness({day});try{
   await h.w.SPM_DAILY_PRACTICE.launch('wellness-movement');h.d.querySelector('[data-wellness-library]').click();
   assert.equal(h.qa.opens.length,1);const [category,requestedDay,options]=h.qa.opens[0];
   assert.equal(category,'movement');assert.equal(requestedDay,day);assert.equal(options.activityId,activityId);assert.equal(options.origin,'dailyPlan');assert.equal(h.qa.writes.length,0);
  }finally{h.close();}
 }
});
test('returning without saving stops narration and preserves the pending activity',async()=>{
 const h=await harness({day:2});try{
  await h.w.SPM_DAILY_PRACTICE.launch('wellness-movement');h.d.querySelector('[data-wellness-session] [data-spm-speak]').click();
  h.d.querySelector('[data-wellness-return]').click();await tick();
  assert.equal(h.d.querySelector('[data-wellness-session]'),null);assert.ok(h.qa.cancels>0);assert.equal(h.qa.writes.length,0);
  assert.equal(h.d.querySelector('[data-activity="wellness-movement"] .spm-daily-saved'),null);
 }finally{h.close();}
});
test('failed storage remains retryable and a saved record for a different tip is not shown as current',async()=>{
 const h=await harness({day:5,initialRecords:{'wellness-movement':{completed:true,activityKind:'wellness',tipId:'mov.01'}}});try{
  assert.equal(h.d.querySelector('[data-activity="wellness-movement"] .spm-daily-saved'),null);
  await h.w.SPM_DAILY_PRACTICE.launch('wellness-movement');h.qa.failSave=true;
  const button=h.d.querySelector('[data-wellness-done]');button.click();await tick();
  assert.equal(button.disabled,false);assert.equal(h.qa.writes.length,0);assert.match(h.d.querySelector('[data-wellness-session] [role="status"]').textContent,/No se pudo guardar/);
  h.qa.failSave=false;button.click();await tick();assert.equal(h.qa.writes.length,1);assert.equal(h.qa.writes[0][1].tipId,'mov.02');
 }finally{h.close();}
});
