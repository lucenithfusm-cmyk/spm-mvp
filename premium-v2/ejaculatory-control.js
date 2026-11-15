(()=>{
'use strict';
// Única puerta de entrada a las tres técnicas SPM. La interfaz antigua de control
// eyaculatorio (spmEcModal) queda retirada; los registros clínicos NO se eliminan.
const SCHEDULE={
  1:{week:1,session:1,tech:'squeeze'},
  3:{week:1,session:2,tech:'squeeze'},
  5:{week:1,session:3,tech:'squeeze'},
  8:{week:2,session:1,tech:'startstop'},
  10:{week:2,session:2,tech:'startstop'},
  12:{week:2,session:3,tech:'startstop'},
  15:{week:3,session:1,tech:'combined'},
  17:{week:3,session:2,tech:'combined'},
  19:{week:3,session:3,tech:'combined'},
  22:{week:4,session:1,tech:'squeeze'},
  24:{week:4,session:2,tech:'startstop'},
  26:{week:4,session:3,tech:'combined'}
};
const WEEKS={
  1:['RECONOCER','Stop–Squeeze · 3 sesiones'],
  2:['PROGRESAR','Stop–Start · 3 sesiones'],
  3:['COORDINAR','Activación pélvica combinada · 3 sesiones'],
  4:['CONSOLIDAR','Stop–Squeeze → Stop–Start → Combinada']
};
const PROGRAM_INTRO='Bienvenido a tu ruta de control eyaculatorio de veintiocho días. Tendrás tres sesiones semanales en total, con descansos entre ellas. Primero practicarás Stop Squeeze, que acompaña la parada con una presión suave. En la segunda semana entrenarás Stop Start, sin compresión. La tercera semana incorporarás una activación breve y voluntaria del piso pélvico, seguida de relajación. En la cuarta semana volverás a practicar las tres técnicas para comparar lo que sientes y consolidar tus habilidades. Si una técnica se siente más difícil, no significa necesariamente un retroceso. No fuerces la contracción ni intentes detener a la fuerza una eyaculación inevitable. Ante dolor, suspende el ejercicio.';
function introFor(value){
 const day=Number(value),s=SCHEDULE[day];
 if(!s)return '';
 if(day===1)return PROGRAM_INTRO;
 if(day===22)return 'Semana cuatro: comenzamos la consolidación con Stop–Squeeze. Compara cómo reconoces el momento de parada usando la compresión suave. Al terminar registra dificultad, control y molestias si las hubo.';
 if(day===24)return 'Semana cuatro: ahora repites Stop–Start sin compresión. Compara tu anticipación de la parada con la sesión de Stop–Squeeze; registra tu percepción, no un tiempo perfecto.';
 if(day===26)return 'Semana cuatro: termina con la técnica combinada y una contracción pélvica voluntaria y breve, seguida de relajación. Al concluir verás el balance de las tres técnicas para evaluar qué habilidades has ido consolidando.';
 if(s.tech==='squeeze')return 'Hoy repites Stop–Squeeze. Cada repetición te ayuda a identificar la subida de excitación y anticipar el momento de parar, sin necesidad de apretar más fuerte.';
 if(s.tech==='startstop')return day===8
  ?'Hoy comienzas Stop–Start. Después de aprender la pausa con apoyo, practicarás detener la estimulación sin compresión. Es normal que requiera más atención y paciencia.'
  :'Hoy repites Stop–Start. La dificultad puede variar al entrenar una parada sin compresión; practica la anticipación a tu ritmo.';
 if(day===15)return 'Semana tres: incorporamos la activación consciente del piso pélvico. Reconoce la excitación, pausa antes del punto crítico, contrae suavemente durante dos o tres segundos y suelta por completo. La contracción no es una garantía de frenar el reflejo; omítela si aumenta la urgencia.';
 return 'Hoy repites la técnica combinada con conciencia, contracción pélvica breve y relajación completa. Que una técnica nueva resulte más difícil no implica que hayas perdido tu práctica anterior.';
}
function sessions(){try{const rows=JSON.parse(localStorage.getItem('spm_ec_sessions')||'[]');return Array.isArray(rows)?rows:[]}catch{return []}}
function open(day,opts={}){
 const d=Number(day),slot=SCHEDULE[d];if(!slot)return false;
 if(slot.tech==='squeeze')return window.SPM_SQUEEZE_V1?.open?.(d,opts)===true;
 if(slot.tech==='startstop')return window.SPM_STARTSTOP_V2?.open?.(d,opts)===true;
 if(slot.tech==='combined')return window.SPM_COMBINED_V1?.open?.(d,opts)===true;
 return false;
}
function close(){
 window.SPM_COMBINED_V1?.close?.(false);
 window.SPM_SQUEEZE_V1?.close?.(false);
 window.SPM_STARTSTOP_V2?.close?.(false);
 return true;
}
window.SPM_EJACULATORY_CONTROL={open,close,schedule:SCHEDULE,weeks:WEEKS,sessions,intro:PROGRAM_INTRO,introFor};
})();