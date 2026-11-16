/* SPM · Erección y firmeza · Semana 1 | Contrato clínico/UX 2026-11-16
 * Etapa 1: MANIFIESTO + NARRACIONES. NO reemplaza aún la interfaz.
 * Etapa 2 (otro chat): montar las siete imágenes como pantallas táctiles sobre este contrato.
 * Los activos visuales se entregan en el ZIP; aún NO se han copiado a assets/erection-week1.
 * No crear plan paralelo ni mecanismo alternativo de avance; usar SPM_DAILY_PRACTICE.
 */
(function(){
'use strict';
if(window.SPM_ERECTION_WEEK1_BLUEPRINT)return;
const DAYS={
  "1": {
    "day": 1,
    "title": "Reconoce tu punto de partida",
    "short": "Mi punto de partida",
    "duration": "3–5 min",
    "goal": "Registrar una experiencia reciente sin exigir una nueva erección",
    "hero": "dia-01.png",
    "steps": [
      {
        "title": "Suelta la tensión",
        "instruction": "Acomódate. Afloja mandíbula, hombros y abdomen.",
        "audio": "Acomódate en una posición cómoda. Afloja mandíbula, hombros y abdomen. Deja entrar y salir el aire sin esfuerzo."
      },
      {
        "title": "Recuerda una experiencia",
        "instruction": "Piensa en una experiencia reciente; no intentes provocar una erección.",
        "audio": "Recuerda una situación reciente, natural y suficiente para valorar cómo respondió tu erección. No necesitas hacer una prueba nueva."
      },
      {
        "title": "Elige tu firmeza",
        "instruction": "Selecciona una respuesta de 0 a 4, o No evaluable.",
        "audio": "Elige el nivel de firmeza de aquella experiencia entre cero y cuatro. Si no hubo una experiencia que puedas valorar, pulsa No evaluable."
      }
    ],
    "intro": "Bienvenido a Erección y firmeza. Vamos a reconocer tu punto de partida, sin ponerte a prueba.",
    "close": "Esta información servirá para personalizar tu programa. No es un examen ni una calificación.",
    "controls": [
      {
        "id": "firmness",
        "type": "single",
        "label": "Firmeza de una experiencia reciente",
        "options": [
          {
            "value": 0,
            "label": "0 · Sin respuesta eréctil"
          },
          {
            "value": 1,
            "label": "1 · Aumento de tamaño sin erección"
          },
          {
            "value": 2,
            "label": "2 · Hay rigidez, insuficiente para penetración"
          },
          {
            "value": 3,
            "label": "3 · Permite penetración, sin firmeza completa"
          },
          {
            "value": 4,
            "label": "4 · Erección completa"
          },
          {
            "value": "na",
            "label": "No evaluable"
          }
        ],
        "required": true
      }
    ],
    "resources": [
      {
        "key": "firmness",
        "api": "SPM_FIRMNESS_GUIDE",
        "mode": "reuse"
      }
    ],
    "checks": [
      "No forzar una erección para medirla",
      "Guardar No evaluable como dato distinto de 0"
    ]
  },
  "2": {
    "day": 2,
    "title": "Descubre tu patrón",
    "short": "Tres contextos",
    "duration": "4 min",
    "goal": "Reconocer cómo varía la respuesta y modificar un factor controlable",
    "hero": "dia-02.png",
    "steps": [
      {
        "title": "Revisa tus contextos",
        "instruction": "Compara al despertar, a solas y en pareja.",
        "audio": "Recuerda situaciones que ya hayas vivido: al despertar, a solas y con pareja. Si alguna no ocurrió, márcala como No evaluable."
      },
      {
        "title": "Identifica dónde cambia",
        "instruction": "Reconoce si lo más difícil es iniciar, mantener o recuperar.",
        "audio": "Observa si la dificultad aparece al iniciar, mantener o recuperar la respuesta eréctil. No es necesario volver a comprobarla."
      },
      {
        "title": "Haz un ajuste real",
        "instruction": "Elige y realiza un cambio: privacidad, tiempo o menos interrupciones.",
        "audio": "Elige algo que puedas modificar ahora. Reserva un espacio privado, silencia una distracción o elimina la prisa. Realiza ese cambio y luego guarda."
      }
    ],
    "intro": "Tu erección puede variar según el contexto. Hoy mirarás lo que ya conoces y harás un ajuste sencillo y real.",
    "close": "La variación entre contextos ayuda a orientar el entrenamiento, pero no establece por sí sola una causa médica.",
    "controls": [
      {
        "id": "contexts",
        "type": "matrix",
        "label": "Contextos ya vividos",
        "rows": [
          {
            "id": "spontaneous",
            "label": "Espontánea o al despertar"
          },
          {
            "id": "solo",
            "label": "A solas"
          },
          {
            "id": "partner",
            "label": "En pareja"
          }
        ],
        "options": [
          {
            "value": "easy",
            "label": "Fácil"
          },
          {
            "value": "variable",
            "label": "Variable"
          },
          {
            "value": "difficult",
            "label": "Difícil"
          },
          {
            "value": "not_evaluable",
            "label": "No evaluable"
          }
        ],
        "required": true
      },
      {
        "id": "responseAspect",
        "type": "single",
        "label": "Momento con mayor dificultad",
        "options": [
          {
            "value": "initiate",
            "label": "Iniciar"
          },
          {
            "value": "maintain",
            "label": "Mantener"
          },
          {
            "value": "recover",
            "label": "Recuperar"
          },
          {
            "value": "none",
            "label": "Sin dificultad clara"
          },
          {
            "value": "not_evaluable",
            "label": "No evaluable"
          }
        ],
        "required": true
      },
      {
        "id": "adjustment",
        "type": "single",
        "label": "Cambio que realizaste hoy",
        "options": [
          {
            "value": "privacy",
            "label": "Privacidad"
          },
          {
            "value": "time",
            "label": "Más tiempo"
          },
          {
            "value": "interruptions",
            "label": "Sin interrupciones"
          },
          {
            "value": "none",
            "label": "No fue posible hoy"
          }
        ],
        "required": true
      }
    ],
    "resources": [],
    "checks": [
      "Nunca solicitar experiencia sexual nueva",
      "No convertir contexto en diagnóstico"
    ]
  },
  "3": {
    "day": 3,
    "title": "Suelta la alerta",
    "short": "Respira y regula",
    "duration": "3–5 min",
    "goal": "Reducir tensión corporal y dirigir la atención a una sensación cómoda",
    "hero": "dia-03.png",
    "steps": [
      {
        "title": "Afloja la tensión",
        "instruction": "Deja sueltos mandíbula, hombros y abdomen.",
        "audio": "Apoya la espalda y reconoce tu mandíbula, hombros y abdomen. Afloja cada zona, una a la vez, sin apretar."
      },
      {
        "title": "Respira sin forzar",
        "instruction": "Puedes inhalar 4 y exhalar 6, o seguir tu ritmo natural.",
        "audio": "Si es cómodo para ti, inhala suavemente cuatro segundos y exhala seis. Si no, continúa con tu respiración natural. No retengas el aire."
      },
      {
        "title": "Vuelve a una sensación",
        "instruction": "Elige manos, apoyo del cuerpo o un sonido.",
        "audio": "Dirige la atención al apoyo del cuerpo, al contacto de tus manos o a un sonido. Vuelve allí cuando te distraigas. No busques provocar una erección."
      }
    ],
    "intro": "Una práctica de regulación para sentirte más presente, no para conseguir rigidez en el momento.",
    "close": "Observa qué cambió en tu tensión. Si aparece mareo, dolor o malestar, detén la práctica.",
    "controls": [
      {
        "id": "tensionAreas",
        "type": "multi",
        "label": "¿Dónde notaste tensión?",
        "options": [
          {
            "value": "jaw",
            "label": "Mandíbula"
          },
          {
            "value": "shoulders",
            "label": "Hombros"
          },
          {
            "value": "abdomen",
            "label": "Abdomen"
          },
          {
            "value": "none",
            "label": "No identifico tensión"
          }
        ],
        "required": true
      },
      {
        "id": "sensoryAnchor",
        "type": "single",
        "label": "Ancla de atención",
        "options": [
          {
            "value": "hands",
            "label": "Mis manos"
          },
          {
            "value": "support",
            "label": "Apoyo del cuerpo"
          },
          {
            "value": "sound",
            "label": "Un sonido"
          }
        ],
        "required": true
      },
      {
        "id": "timer",
        "type": "timer",
        "label": "Cronómetro opcional",
        "required": false
      }
    ],
    "resources": [
      {
        "key": "breathing",
        "api": "SPM_BREATHING_LAB",
        "mode": "optional-existing"
      },
      {
        "key": "pelvic-awareness",
        "api": "SPM_PELVIC_LAB",
        "mode": "weekly-existing-optional"
      }
    ],
    "checks": [
      "El ritmo 4/6 es opcional",
      "No duplicar el Pelvic Floor Lab del día 3"
    ]
  },
  "4": {
    "day": 4,
    "title": "Deja de comprobar",
    "short": "Vuelve a sentir",
    "duration": "5 min",
    "goal": "Entrenar el retorno a sensaciones en vez de vigilar la firmeza",
    "hero": "dia-04.png",
    "steps": [
      {
        "title": "Elige un contacto",
        "instruction": "Apoya la mano sobre el antebrazo, o un contacto consentido.",
        "audio": "Coloca una mano sobre el antebrazo o elige otro contacto agradable y cómodo. Si participa tu pareja, acuerden antes lo que ambos desean."
      },
      {
        "title": "Nota lo que sientes",
        "instruction": "Observa temperatura, presión o textura.",
        "audio": "Presta atención a la temperatura, la presión o la textura de ese contacto. No necesitas evaluar la respuesta eréctil."
      },
      {
        "title": "Regresa si te distraes",
        "instruction": "Cuando aparezca la comprobación, vuelve a la sensación.",
        "audio": "Si surge la pregunta sobre tu erección, reconoce el pensamiento y regresa al contacto elegido. Puedes repetirlo tantas veces como necesites."
      }
    ],
    "intro": "Hoy practicarás una habilidad útil durante la intimidad: dirigir tu atención hacia lo que sientes.",
    "close": "La práctica puede terminar aunque no aparezca ninguna erección. Lo importante es haber entrenado la atención.",
    "controls": [
      {
        "id": "attentionSense",
        "type": "single",
        "label": "Sensación elegida",
        "options": [
          {
            "value": "temperature",
            "label": "Temperatura"
          },
          {
            "value": "contact",
            "label": "Contacto"
          },
          {
            "value": "rhythm",
            "label": "Ritmo"
          },
          {
            "value": "texture",
            "label": "Textura"
          }
        ],
        "required": true
      },
      {
        "id": "practiceExperience",
        "type": "single",
        "label": "¿Pudiste volver a la sensación?",
        "options": [
          {
            "value": "returned",
            "label": "Sí"
          },
          {
            "value": "difficult",
            "label": "Con dificultad"
          },
          {
            "value": "no_checking",
            "label": "No apareció comprobación"
          }
        ],
        "required": true
      },
      {
        "id": "timer",
        "type": "timer",
        "label": "Cronómetro opcional",
        "required": false
      }
    ],
    "resources": [
      {
        "key": "sensate",
        "api": "SPM_SENSATE_LAB",
        "mode": "existing-optional"
      }
    ],
    "checks": [
      "No duplicar sesión 1 de Focalización I",
      "Sin objetivo de penetración"
    ]
  },
  "5": {
    "day": 5,
    "title": "Ajusta lo que te ayuda",
    "short": "Prepara las condiciones",
    "duration": "4 min",
    "goal": "Aplicar una modificación concreta al ambiente, basada en experiencias conocidas",
    "hero": "dia-05.png",
    "steps": [
      {
        "title": "Elige un facilitador",
        "instruction": "Privacidad, contacto, conexión, ritmo o anticipación.",
        "audio": "Recuerda qué condiciones te han favorecido: privacidad, contacto, conexión, ritmo o anticipación. Elige las que realmente reconoces."
      },
      {
        "title": "Retira un obstáculo",
        "instruction": "Identifica prisa, cansancio, distracciones o presión.",
        "audio": "Ahora reconoce un obstáculo: prisa, cansancio, distracciones o presión por rendir. No hay respuestas correctas."
      },
      {
        "title": "Haz el cambio hoy",
        "instruction": "Silencia, prepara un espacio, reserva tiempo o expresa una preferencia.",
        "audio": "Elige solo una condición que puedas cambiar. Hazlo hoy: silencia el teléfono, reserva tiempo o expresa una preferencia sin presión."
      }
    ],
    "intro": "No hay un único ambiente para todas las personas. Vamos a encontrar qué condición vale la pena cambiar para ti.",
    "close": "Haber preparado una condición favorable es la acción de hoy; no tienes que probar ninguna erección.",
    "controls": [
      {
        "id": "erectionFacilitators",
        "type": "multi",
        "maxSelections": 3,
        "label": "Lo que te facilita",
        "options": [
          {
            "value": "contact",
            "label": "Contacto"
          },
          {
            "value": "imagination",
            "label": "Imaginación"
          },
          {
            "value": "anticipation",
            "label": "Anticipación"
          },
          {
            "value": "novelty",
            "label": "Novedad"
          },
          {
            "value": "rhythm",
            "label": "Ritmo"
          },
          {
            "value": "privacy",
            "label": "Privacidad"
          },
          {
            "value": "connection",
            "label": "Conexión"
          },
          {
            "value": "solo",
            "label": "Tiempo a solas"
          },
          {
            "value": "unknown",
            "label": "Aún no lo identifico"
          }
        ],
        "required": true
      },
      {
        "id": "erectionInhibitors",
        "type": "multi",
        "maxSelections": 2,
        "label": "Lo que te frena",
        "options": [
          {
            "value": "pressure",
            "label": "Presión"
          },
          {
            "value": "rush",
            "label": "Prisa"
          },
          {
            "value": "fatigue",
            "label": "Cansancio"
          },
          {
            "value": "stress",
            "label": "Estrés"
          },
          {
            "value": "privacy",
            "label": "Falta de privacidad"
          },
          {
            "value": "unknown",
            "label": "Aún no lo identifico"
          }
        ],
        "required": true
      },
      {
        "id": "microAdjustment",
        "type": "single",
        "label": "Cambio elegido",
        "options": [
          {
            "value": "privacy",
            "label": "Privacidad"
          },
          {
            "value": "time",
            "label": "Más tiempo"
          },
          {
            "value": "rhythm",
            "label": "Cambiar ritmo"
          },
          {
            "value": "communicate",
            "label": "Comunicar preferencia"
          },
          {
            "value": "observe",
            "label": "Seguir observando"
          }
        ],
        "required": true
      }
    ],
    "resources": [],
    "checks": [
      "El cierre requiere acción real o 'no fue posible'",
      "No sugerir prueba de erección"
    ]
  },
  "6": {
    "day": 6,
    "title": "Reconoce tu piso pélvico",
    "short": "Conciencia antes que fuerza",
    "duration": "Según sesión indicada",
    "goal": "Abrir el módulo pélvico que corresponda, sin duplicar ejercicios",
    "hero": "dia-06.png",
    "steps": [
      {
        "title": "Reconoce la zona",
        "instruction": "Acomódate y comprueba cómo está la tensión.",
        "audio": "El piso pélvico participa en la función sexual. Primero reconoce la zona y acomoda tu cuerpo con tranquilidad."
      },
      {
        "title": "Suelta sin empujar",
        "instruction": "Relaja mandíbula, abdomen y glúteos.",
        "audio": "Deja sueltos mandíbula, abdomen y glúteos. No aprietes ni empujes para provocar una erección."
      },
      {
        "title": "Sigue tu sesión indicada",
        "instruction": "Relajación o contracción/fuerza únicamente si corresponde.",
        "audio": "El programa abrirá la práctica indicada por tu evaluación. Si te corresponde relajación, evita añadir fuerza. Si corresponde entrenamiento de contracción, sigue sus instrucciones y detente si hay dolor."
      }
    ],
    "intro": "No todos los hombres necesitan fortalecer el piso pélvico. Tu evaluación determina cuál sesión corresponde.",
    "close": "Guarda solo la sesión realizada. No agregues repeticiones ni abras ambas modalidades el mismo día.",
    "controls": [
      {
        "id": "pelvicRoute",
        "type": "routing",
        "label": "Sesión según elegibilidad",
        "options": [
          {
            "value": "relax",
            "label": "Conciencia y relajación"
          },
          {
            "value": "strength",
            "label": "Contracción y fuerza"
          },
          {
            "value": "defer",
            "label": "Revisión clínica antes de practicar"
          }
        ],
        "required": true
      }
    ],
    "resources": [
      {
        "key": "pelvic",
        "api": "SPM_PELVIC_LAB.openScheduled",
        "mode": "existing-only"
      }
    ],
    "checks": [
      "Pelvic Floor Lab: una vez por semana",
      "Contracción/fuerza: hasta dos sesiones semanales según preparación",
      "No abrir dos módulos pélvicos para una misma actividad",
      "No desactivar señales de seguridad"
    ]
  },
  "7": {
    "day": 7,
    "title": "Quédate con lo que funciona",
    "short": "Repite tu mejor recurso",
    "duration": "5 min",
    "goal": "Repetir una habilidad real y registrar un avance no centrado en rigidez",
    "hero": "dia-07.png",
    "steps": [
      {
        "title": "Elige tu mejor recurso",
        "instruction": "Regulación, atención o ajuste del ambiente.",
        "audio": "Piensa en la práctica que más te ayudó esta semana: soltar tensión, volver a una sensación o preparar mejores condiciones."
      },
      {
        "title": "Practícalo otra vez",
        "instruction": "Repite la habilidad, sin buscar provocar una erección.",
        "audio": "Repite ahora esa habilidad durante un momento. No te exigimos demostrar una erección más firme para valorar lo aprendido."
      },
      {
        "title": "Registra cómo te sentiste",
        "instruction": "Calma, presencia, confianza o aún no lo sé.",
        "audio": "Elige cómo te sentiste. Quizás hubo más calma, más presencia o más confianza. Si todavía no identificas cambios, también está bien: guarda esa respuesta."
      }
    ],
    "intro": "La semana termina entrenando, no rellenando otra encuesta. Repite una habilidad que ya conozcas.",
    "close": "Tu primera semana nos ayuda a escoger mejor la siguiente. Puedes continuar practicando las estrategias que te sirvan.",
    "controls": [
      {
        "id": "chosenTool",
        "type": "single",
        "label": "Recurso que repetiste",
        "options": [
          {
            "value": "regulation",
            "label": "Regulación"
          },
          {
            "value": "attention",
            "label": "Atención sensorial"
          },
          {
            "value": "environment",
            "label": "Ajuste del ambiente"
          },
          {
            "value": "pelvic",
            "label": "Piso pélvico (solo si fue indicado)"
          }
        ],
        "required": true
      },
      {
        "id": "result",
        "type": "single",
        "label": "¿Qué reconociste?",
        "options": [
          {
            "value": "calm",
            "label": "Más calma"
          },
          {
            "value": "present",
            "label": "Más presencia"
          },
          {
            "value": "confidence",
            "label": "Más confianza"
          },
          {
            "value": "uncertain",
            "label": "Todavía no lo sé"
          }
        ],
        "required": true
      }
    ],
    "resources": [
      {
        "key": "review",
        "api": "SPM_DE_LIBRARY_V3.days[7]",
        "mode": "reuse-results-only"
      }
    ],
    "checks": [
      "Mostrar únicamente prácticas de la semana y seguras",
      "Evitar otro cuestionario de EHS/IIEF completo",
      "Finalizar guarda y vuelve a Hoy"
    ]
  }
};
const assetPrefix='/premium-v2/assets/erection-week1/';
// Los nombres de imágenes son contratos; los archivos físicos se cargarán en la etapa táctil.
const acceptedImages=Object.freeze(Object.fromEntries(Object.values(DAYS).map(d=>[d.day,assetPrefix+d.hero])));
const approvedTransverse=Object.freeze({
  breathing:'SPM_BREATHING_LAB',pelvic:'SPM_PELVIC_LAB.openScheduled',
  sensate:'SPM_SENSATE_LAB',movement:'SPM_RESOURCES.open',
  firmness:'SPM_FIRMNESS_GUIDE'
});
// Las grabaciones antiguas NO se presentan como narraciones nuevas; sus guiones difieren.
const oldAudioReferences=Object.freeze(Object.fromEntries([1,2,3,4,5,6].map(day=>
 [day,'/premium-v2/assets/audio/erection/erection-day-'+day+(day===1?'-ehs':'')+'-20261113.mp3'])));
// Cuando estén las nuevas grabaciones, añadir rutas en AUDIO_FILES. Hasta entonces,
// los textos se pueden escuchar mediante síntesis de voz nativa desde un toque del usuario.
const AUDIO_FILES=Object.freeze({});
let activeAudio=null;
const stop=()=>{try{activeAudio?.pause();activeAudio=null;}catch(_){ }try{window.speechSynthesis?.cancel();}catch(_){ }};
function getAudioText(day,part){const d=DAYS[Number(day)];if(!d)return '';
 if(part==='intro')return d.intro;if(part==='close')return d.close;
 if(Number.isInteger(part)&&part>=0&&part<d.steps.length)return d.steps[part].audio;
 return d.intro+' '+d.steps.map(s=>s.audio).join(' ')+' '+d.close;}
function play(day,part='intro',onEnd){const d=DAYS[Number(day)];if(!d)return false;const text=getAudioText(day,part);if(!text)return false;
 stop();const key=day+':'+String(part),path=AUDIO_FILES[key];
 if(path){const a=new Audio(path);activeAudio=a;a.onended=()=>{activeAudio=null;onEnd?.();};a.onerror=()=>{activeAudio=null;speak(text,onEnd);};a.play().catch(()=>speak(text,onEnd));return true;}
 return speak(text,onEnd);
}
function speak(text,onEnd){if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window))return false;
 const utter=new SpeechSynthesisUtterance(text);utter.lang='es-CO';utter.rate=0.94;utter.pitch=1;
 const voices=window.speechSynthesis.getVoices?.()||[];
 const spanish=voices.filter(v=>/^es([_-]|$)/i.test(v.lang));
 utter.voice=spanish.find(v=>/colombia|latinoam|natural|neural|premium/i.test(v.name))||spanish[0]||null;
 utter.onend=()=>onEnd?.();utter.onerror=()=>onEnd?.();
 try{window.speechSynthesis.speak(utter);return true;}catch(_){return false;}
}
function get(day){return DAYS[Number(day)]||null;}
function validDay(day){return Number.isInteger(Number(day))&&Number(day)>=1&&Number(day)<=7;}
// El usuario nunca debe marcar una práctica como realizada sin el guardado de Hoy.
function saveViaToday(day,record){const c=window.SPM_RESOURCE_CONTEXT?.();
 if(!c||Number(c.day)!==Number(day)||c.primary!=='erection')return Promise.reject(Error('No corresponde al día o perfil actual'));
 if(window.SPM_DAILY_PRACTICE?.restricted?.(c,'main'))return Promise.reject(Error('Práctica restringida por evaluación de seguridad'));
 const scope=c.userId+':'+c.planId;
 return window.SPM_DAILY_PRACTICE.saveActivity('main',record,scope,Number(day));
}
function returnToToday(){stop();return window.SPM_DAILY_PRACTICE?.open?.({focus:true})||false;}
window.SPM_ERECTION_WEEK1_BLUEPRINT=Object.freeze({version:'1.0',days:DAYS,get,validDay,images:acceptedImages,
 oldAudioReferences,transverse:approvedTransverse,getAudioText,play,stop,saveViaToday,returnToToday,
 state:'blueprint-awaiting-tactile-integration',clinicalScope:'erection-week1-only'});
})();
