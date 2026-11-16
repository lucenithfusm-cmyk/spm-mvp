(()=>{'use strict';
// One shared assignment per selected day; library access never changes the assignment.
const breathing={
 3:{id:'breath-learn',title:'Aprender y practicar respiración',summary:'Mira la demostración y usa la guía visual para explorar una respiración cómoda. Registra qué notaste al terminar.',steps:[3,4],minutes:3},
 6:{id:'breath-release',title:'Respirar y soltar el piso pélvico',summary:'Respira suavemente, sin empujar ni apretar. Observa cómo se siente la zona al soltar tensión.',steps:[9],minutes:1},
 10:{id:'breath-two',title:'Respiración guiada',summary:'Sigue un ritmo cómodo y observa qué te ayuda a relajar el abdomen.',steps:[11],minutes:2},
 13:{id:'breath-rescue',title:'Respiraciones para recuperar la calma',summary:'Explora respiraciones suaves sin retener el aire. Vuelve a tu respiración natural cuando quieras terminar.',steps:[10],minutes:1},
 17:{id:'breath-arousal',title:'Respirar durante una pausa',summary:'Ensaya la respiración suave cuando sube la activación, sin forzar el aire.',steps:[8],minutes:1},
 20:{id:'breath-regulate',title:'Bajar intensidad y tensión',summary:'Revisa la explicación y practica a tu ritmo. Observa si al terminar te sientes más tranquilo.',steps:[7],minutes:2},
 24:{id:'breath-consolidate',title:'Consolidar una respiración cómoda',summary:'Repite la sesión guiada con la técnica que te resulte cómoda y registra qué te aportó.',steps:[11],minutes:2},
 27:{id:'breath-autonomy',title:'Respiración autónoma con apoyo visual',summary:'Respira a un ritmo cómodo; usa la guía como apoyo y termina cuando hayas explorado la práctica.',steps:[11],minutes:2}
};
const sensate={
 4:{id:'sensate-prepare',title:'Focalización I · 1/5 · Reconoce tu cuerpo',summary:'Descubre qué es focalización y aprende a sentir tu cuerpo sin exigencias.',steps:[0,1,2,3,4],minutes:8,practiceId:'sf-i-1',modality:'individual',optional:true,optionalLabel:'FOCALIZACIÓN · PRÁCTICA VOLUNTARIA'},
 8:{id:'sensate-first',title:'Focalización I · 2/5 · Descubre lo que te gusta',summary:'Aprende a reconocer tus zonas sensibles, caricias agradables y qué despierta deseo o conexión. Practícalo después.',steps:[0,1,2,4],minutes:5,practiceId:'sf-i-2',modality:'individual',optional:true,optionalLabel:'APRENDE HOY · PRACTICA DESPUÉS'},
 12:{id:'sensate-presence',title:'Focalización I · 3/5 · Conecta sin presión',summary:'Aprende a disfrutar besos y caricias sin miedo al rendimiento; lleva la guía a tu próximo encuentro en pareja.',steps:[0,1,2,4],minutes:5,practiceId:'sf-i-3',modality:'partner',optional:true,optionalLabel:'EN PAREJA · APRENDE HOY, PRACTICA DESPUÉS'},
 19:{id:'sensate-progress',title:'Focalización Sensorial II',summary:'Explora nuevas sensaciones de forma gradual, sin exigencia de rendimiento. Elige modalidad individual o en pareja.',steps:[2,3,7,8,6],minutes:15,practiceId:'sf-focus-2',optional:true,optionalLabel:'FOCALIZACIÓN · PRÁCTICA VOLUNTARIA'},
 23:{id:'sensate-communicate',title:'Focalización I · 4/5 · Comunica lo que disfrutas',summary:'Aprende a expresar lo agradable, pedir cambios con claridad y escuchar a tu pareja sin exigencias.',steps:[0,1,2,4],minutes:5,practiceId:'sf-i-4',modality:'partner',optional:true,optionalLabel:'EN PAREJA · APRENDE HOY, PRACTICA DESPUÉS'},
 26:{id:'sensate-consolidate',title:'Focalización I · 5/5 · Integra y disfruta',summary:'Integra atención, caricias agradables y comunicación sencilla para disfrutar sin exigencias.',steps:[0,1,2,4],minutes:5,practiceId:'sf-i-5',modality:'partner',optional:true,optionalLabel:'EN PAREJA · APRENDE HOY, PRACTICA DESPUÉS'},
};
const routes={breathing:['erection','ejaculation','desire','confidence','anxiety','wellbeing','lifestyle','optimization','mixed'],sensate:['erection','ejaculation','desire','confidence','anxiety','wellbeing','lifestyle','optimization','mixed']};
const firstErectionPractice={id:'breath-start',title:'Mi primera práctica: respira y suelta',summary:'Suelta mandíbula, hombros y abdomen. Después, sigue la guía de respiración a tu ritmo y registra cómo te sentiste.',steps:[6,10],minutes:2};
function relevant(lab,c){return !!c&&routes[lab]?.some(x=>c.primary===x||c.secondary===x||c.motives?.includes(x));}
function activity(lab,day,c){
 const n=Number(day),first=lab==='breathing'&&n===1&&c?.primary==='erection';
 const item=first?firstErectionPractice:({breathing,sensate})[lab]?.[n];
 const titled=lab==='sensate'&&n===19&&c?.primary==='desire'?{...item,title:'Sensate Focus II'}:item;
 return titled&&relevant(lab,c)?{...titled,steps:[...titled.steps],day:n,lab,...(first?{guide:window.SPM_PELVIC_GUIDANCE?.firstPractice?.(),optional:c.completed?.includes(1)===true}:{})}:null;
}
function assignments(day,c){return ['breathing','sensate'].map(lab=>activity(lab,day,c)).filter(Boolean);}
window.SPM_DAILY_SUPPORT={activity,assignments,relevant};
})();
