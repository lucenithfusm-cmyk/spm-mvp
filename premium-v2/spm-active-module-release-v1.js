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
 12:Object.freeze({key:'erection-lesson5',version:'2026-11-17-approved3',screens:3,title:'Reconoce lo que te ayuda',preview:'/premium-v2/assets/erection-day5/spm-de-day5-screen-01.webp',module:'SPM_ED_DAY5_TOUCH',bridge:'SPM_ERECTION_DAY5_BRIDGE'})
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
window.SPM_ACTIVE_MODULE_RELEASE=Object.freeze({version:'2026-11-17-10x28-current2',erection,connections,resolve,ready,status});
})();