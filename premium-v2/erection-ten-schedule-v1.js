/* SPM Digital Wellness · Erección y firmeza · 10 intervenciones en 28 días.
 * Solo las sesiones con material clínico aprobado se pueden abrir.
 * Días 14 y 28: evaluaciones del programa, independientes de esta ruta.
 * Las prácticas transversales se asignan desde SPM Central, no se duplican aquí.
 */
(()=>{'use strict';
if(window.SPM_ERECTION_10_SCHEDULE)return;
const days=Object.freeze([1,3,6,9,12,15,18,21,24,27]);
const evaluationDays=Object.freeze([14,28]);
const approved=Object.freeze([
 'Reconoce tu punto de partida',
 'Reconoce tus contextos',
 'Reconoce y suelta la tensión',
 'Vuelve a las sensaciones',
 'Reconoce lo que te ayuda',
 'Activa tu respuesta con estímulos que funcionan'
]);
const integrated=6;
const isDay=n=>Number.isInteger(Number(n))&&Number(n)>=1&&Number(n)<=28;
function lessonFor(day){if(!isDay(day))return null;const i=days.indexOf(Number(day));return i<0?null:i+1;}
function dayFor(lesson){const n=Number(lesson);return Number.isInteger(n)&&n>=1&&n<=10?days[n-1]:null;}
function slot(day){
 const lesson=lessonFor(day);if(lesson===null)return null;
 return Object.freeze({day:dayFor(lesson),lesson,ready:lesson<=integrated,
  title:approved[lesson-1]||'Actividad '+lesson+' · pendiente de integración'});
}
const isReady=day=>slot(day)?.ready===true;
function phase(day){
 if(!isDay(day))return 'invalid';
 if(evaluationDays.includes(Number(day)))return 'evaluation';
 const item=slot(day);return item?(item.ready?'ready':'pending'):'transversal';
}
window.SPM_ERECTION_10_SCHEDULE=Object.freeze({
 version:'2026-11-17-10x28-v3-dia15',days,evaluationDays,integrated,
 lessonFor,dayFor,slot,isReady,phase
});
})();
