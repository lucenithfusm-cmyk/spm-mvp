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
 4:{id:'sensate-prepare',title:'Preparación y atención corporal',summary:'Conoce los pasos, ponte cómodo y observa las sensaciones de tu cuerpo a tu ritmo.',steps:[1,2,3],minutes:4,practiceId:'sf-solo'},
 8:{id:'sensate-first',title:'Focalización I · primer contacto',summary:'Contacto no genital por turnos, solo si ambos desean participar. También puedes elegir preparación individual.',steps:[2,3,4,5,6],minutes:15,practiceId:'sf-focus-1'},
 12:{id:'sensate-presence',title:'Presencia corporal individual',summary:'Baja el ritmo y presta atención a las sensaciones de tu cuerpo. Observa qué te ayuda a conectar.',steps:[3],minutes:3,practiceId:'sf-solo'},
 16:{id:'sensate-repeat',title:'Focalización I · repetir con comodidad',summary:'Repite el contacto no genital y registra presencia, presión y comodidad.',steps:[2,3,4,5,6],minutes:15,practiceId:'sf-focus-1'},
 19:{id:'sensate-progress',title:'Focalización · repetir o progresar',summary:'Repite Focus I. Focus II solo se ofrece tras una práctica cómoda y si ambos lo desean hoy.',steps:[2,3,4,5,6],minutes:15,practiceId:'sf-focus-1',optionalProgression:true},
 23:{id:'sensate-communicate',title:'Comunicación y conexión',summary:'Practica las cuatro frases de comunicación y vuelve a las sensaciones corporales.',steps:[12,3],minutes:3,practiceId:'sf-communication'},
 26:{id:'sensate-consolidate',title:'Consolidar una práctica cómoda',summary:'Repite la práctica sensorial que resulte cómoda, sin obligación de avanzar.',steps:[2,3,4,5,6],minutes:15,practiceId:'sf-focus-1',optionalProgression:true}
};
const routes={breathing:['erection','ejaculation','desire','confidence','anxiety','wellbeing','lifestyle','optimization','mixed'],sensate:['erection','ejaculation','desire','confidence','anxiety','wellbeing','lifestyle','optimization','mixed']};
const firstErectionPractice={id:'breath-start',title:'Mi primera práctica: respira y suelta',summary:'Suelta mandíbula, hombros y abdomen. Después, sigue la guía de respiración a tu ritmo y registra cómo te sentiste.',steps:[6,10],minutes:2};
function relevant(lab,c){return !!c&&routes[lab]?.some(x=>c.primary===x||c.secondary===x||c.motives?.includes(x));}
function activity(lab,day,c){
 const n=Number(day),first=lab==='breathing'&&n===1&&c?.primary==='erection';
 const item=first?firstErectionPractice:({breathing,sensate})[lab]?.[n];
 return item&&relevant(lab,c)?{...item,steps:[...item.steps],day:n,lab,...(first?{guide:window.SPM_PELVIC_GUIDANCE?.firstPractice?.(),optional:c.completed?.includes(1)===true}:{})}:null;
}
function assignments(day,c){return ['breathing','sensate'].map(lab=>activity(lab,day,c)).filter(Boolean);}
window.SPM_DAILY_SUPPORT={activity,assignments,relevant};
})();
