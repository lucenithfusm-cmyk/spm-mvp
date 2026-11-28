/* SPM · Deseo D1. Audio y accesibilidad táctil. Test no destructivo. */
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const touch=read('premium-v2/desire-day1-touch-v1.js');
const styles=read('premium-v2/desire-day1-touch-v1.css');
const review=read('premium-v2/desire-day1-review/index.html');
assert.match(review,/src="\.\.\/desire-day1-touch-v1\.js/,'the reviewer loads the same current controller');
const reviewContent=review+'\n'+touch;
const source=read('labs/desire/src/components/desire/DesireCycle.tsx');
const curr=read('labs/desire/src/lib/desire-curriculum.ts');
test('Los audios nombran exactamente los botones de la imagen aprobada',()=>{
  for(const s of [touch,source,reviewContent]){
    assert.match(s,/toca directamente «Me dan ganas»/);
    assert.match(s,/toca directamente «Me voy conectando»/);
    assert.match(s,/Escucha ambas opciones/);
    assert.doesNotMatch(s,/pulsa Se parece a mí hoy/i);
  }
});
test('Narraciones adultas con ejemplos variados y sin telas ni tazas',()=>{
  for(const s of [touch,source,reviewContent]){
    assert.match(s,/hormigueo suave/);
    assert.match(s,/acaricia lentamente su cabello/);
    assert.doesNotMatch(s,/taza tibia|tela suave sobre tus manos/);
  }
  assert.match(curr,/escalofrío placentero/);
  assert.match(touch,/escalofrío placentero/);
  assert.match(touch,/el roce de los labios durante un beso/);
  assert.equal((touch.match(/acaricia lentamente su cabello/g)||[]).length,1);
});
test('Las cinco pantallas incluyen zonas funcionales visibles antes de interactuar',()=>{
  for(const action of ['audio','form','step','stimulus','start','observe','repeat','saveFirst','saveFinal']){
    assert.match(touch,new RegExp("data-ds1-act|hit\\("));
    assert.ok(styles.includes('[data-ds1-act="'+action+'"]'),action+' debe tener halo');
  }
  assert.doesNotMatch(styles,/\[data-ds1-act="score"\]::before/); // ni círculos ni escalas con halo
  assert.match(styles,/@keyframes spm-ds1-invite/);
  assert.match(styles,/prefers-reduced-motion:reduce/);
  assert.match(review,/@keyframes spm-ds1-invite/);
});
test('Guarda sesiones originales sin crear un segundo programa',()=>{
  assert.match(touch,/presence-5/);
  assert.match(touch,/explore-new-stimulus/);
  assert.match(touch,/SPM_DESIRE_DAY1_TOUCH/);
  assert.match(read('premium-v2/desire-day1-bridge-v1.js'),/Number\(mainAssignment\(c\)\?\.sourceDay\|\|c.day\)===1/);
});
