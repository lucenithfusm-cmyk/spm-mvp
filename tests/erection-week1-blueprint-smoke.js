/* QA estático del contrato – ejecutar en navegador de prueba tras incluir blueprint */
(()=>{'use strict';const d=window.SPM_ERECTION_WEEK1_BLUEPRINT;if(!d)throw Error('Blueprint SPM ausente');
for(let day=1;day<=7;day++){const s=d.get(day);if(!s||s.day!==day||s.steps.length!==3||s.controls.length===0||!d.getAudioText(day,'intro')||!d.getAudioText(day,'close'))throw Error('Incompleto día '+day);
for(let i=0;i<3;i++)if(!d.getAudioText(day,i))throw Error('Audio ausente '+day+'/'+i);
}
console.info('SPM Erección Semana 1: contrato clínico y 35 cues de audio verificados');
})();