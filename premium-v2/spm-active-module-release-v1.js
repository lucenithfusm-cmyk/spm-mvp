/* SPM Digital Wellness · Registro de versiones activas de módulos.
 * Una sola entrada aprobada desde Hoy; el respaldo histórico no se muestra al paciente.
 * Sin acceso a historias clínicas, datos de usuarios ni pagos.
 */
(()=>{'use strict';
if(window.SPM_ACTIVE_MODULE_RELEASE)return;
const erection=Object.freeze({
 1:Object.freeze({key:'erection-day1',version:'2026-11-16-approved6',screens:6,title:'Reconoce tu punto de partida',preview:'/premium-v2/assets/erection-day1/spm-de-day1-screen-01.webp',module:'SPM_ED_DAY1_TOUCH',bridge:'SPM_ERECTION_DAY1_BRIDGE'}),
 3:Object.freeze({key:'erection-lesson2',version:'2026-11-16-approved4',screens:4,title:'Reconoce tus contextos',preview:'/premium-v2/assets/erection-day2/spm-de-day2-screen-01.webp',module:'SPM_ED_DAY2_TOUCH',bridge:'SPM_ERECTION_DAY2_BRIDGE'}),
 6:Object.freeze({key:'erection-lesson3',version:'2026-11-17-approved3',screens:3,title:'Reconoce y suelta la tensión',preview:'/premium-v2/assets/erection-day3/spm-de-day3-screen-01.webp',module:'SPM_ED_DAY3_TOUCH',bridge:'SPM_ERECTION_DAY3_BRIDGE'}),
 9:Object.freeze({key:'erection-lesson4',version:'2026-11-17-approved3',screens:3,title:'Vuelve a las sensaciones',preview:'/premium-v2/assets/erection-day4/spm-de-day4-screen-01.webp',module:'SPM_ED_DAY4_TOUCH',bridge:'SPM_ERECTION_DAY4_BRIDGE'}),
 12:Object.freeze({key:'erection-lesson5',version:'2026-11-17-audio3-tactil-v2',screens:3,title:'Reconoce lo que te ayuda',preview:'/premium-v2/assets/erection-day5/spm-de-day5-screen-01.webp',module:'SPM_ED_DAY5_TOUCH',bridge:'SPM_ERECTION_DAY5_BRIDGE'}),
 15:Object.freeze({key:'erection-lesson6',version:'2026-11-17-voice-device-v2',screens:1,title:'Activa tu respuesta con estímulos que funcionan',preview:'/premium-v2/assets/erection-day6/spm-de-day6-screen-01.webp',module:'SPM_ED_DAY6_TOUCH',bridge:'SPM_ERECTION_DAY6_BRIDGE'}),
 18:Object.freeze({key:'erection-lesson7',version:'2026-11-17-progreso-alertas-v1',screens:3,title:'Reconoce tu progreso',preview:'/premium-v2/assets/erection-day7/spm-de-day7-screen-01.jpg',module:'SPM_ED_DAY7_TOUCH',bridge:'SPM_ERECTION_DAY7_BRIDGE'}),
 21:Object.freeze({key:'erection-lesson8',version:'2026-11-17-sostener-firmeza-v1',screens:3,title:'Sostener la erección sin perseguir firmeza constante',preview:'/premium-v2/assets/erection-day8/spm-de-day8-screen-01.webp',module:'SPM_ED_DAY8_TOUCH',bridge:'SPM_ERECTION_DAY8_BRIDGE'}),
 24:Object.freeze({key:'erection-lesson9',version:'2026-11-17-firmeza-recovery-v1',screens:3,title:'Qué hacer cuando disminuye la firmeza',preview:'/premium-v2/assets/erection-day9/spm-de-day9-screen-01.webp',module:'SPM_ED_DAY9_TOUCH',bridge:'SPM_ERECTION_DAY9_BRIDGE'})
});
const connections=Object.freeze({
 erection:'SPM_ERECTION_PRACTICE',sensate:'SPM_SENSATE_LAB',
 breathing:'SPM_BREATHING_LAB',pelvicAwareness:'SPM_PELVIC_LAB',
 pelvicStrength:'SPM_PELVIC_HUB',desire:'SPM_DESIRE_LAB',
 ejaculation:'SPM_EJACULATORY_CONTROL',startStop:'SPM_STARTSTOP_V2',
 stopSqueeze:'SPM_SQUEEZE_V1',combined:'SPM_COMBINED_V1',
 nutrition:'SPM_NUTRITION_DAILY',sleep:'SPM_SLEEP_LIBRARY_V1'
});
function resolve(context,activity){
 if(context?.primary!=='erection'||activity?.id!=='main'||activity?.kind!=='erection')return null;
 const item=erection[Number(context.day)]||null;
 return item&&window.SPM_ERECTION_10_SCHEDULE?.isReady(context.day)?item:null;
}
function ready(context,activity){
 const released=resolve(context,activity);
 if(!released)return true;
 return !!(window[released.module]&&window[released.bridge]&&window.SPM_ERECTION_PRACTICE?.open);
}
function status(){return Object.freeze(Object.fromEntries(Object.entries(connections).map(([name,api])=>[name,!!window[api]])));}
window.SPM_ACTIVE_MODULE_RELEASE=Object.freeze({version:'2026-11-17-10x28-current6-day24',erection,connections,resolve,ready,status});
})();