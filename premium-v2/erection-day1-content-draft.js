/* SPM · Erección y firmeza, Día 1 · Contrato clínico de actividad, NO conectado a la ruta actual.
 * 16/11/2026. No importar a live.html sin aprobar la versión táctil y verificar seguridad/persistencia.
 * La evaluación EHS existente se mantiene; esta propuesta no cambia calendario ni rutas transversales.
 */
(function(){'use strict';if(window.SPM_ERECTION_DAY1_DRAFT)return;
const spec={
  "module": "erection",
  "day": 1,
  "version": "2026-11-16-review",
  "status": "propuesta-clinica-sin-activar",
  "title": "Reconoce tu punto de partida",
  "existingAssessment": {
    "tool": "SPM_FIRMNESS_GUIDE",
    "display": "Grados 4, 3, 2, 1 con lámina médica ampliable; grado 0 sin respuesta y opción No evaluable",
    "source": "experiencia real reciente, sin provocar respuesta para evaluarla",
    "required": true,
    "persistentFields": [
      "erectionPracticeVersion",
      "day",
      "ehs",
      "ehsEvaluable",
      "confirmed",
      "anxiety",
      "confidence"
    ]
  },
  "screens": [
    {
      "id": "inicio",
      "title": "Mi punto de partida",
      "purpose": "Presentar el objetivo, informar que habrá una evaluación y una acción breve",
      "visual": "imagen aprobada Día 1, sin rediseñar el motivo principal",
      "actions": [
        "Iniciar práctica",
        "Escuchar introducción"
      ],
      "audio": "Hoy vas a reconocer la respuesta eréctil con la que comienzas. Primero utilizarás una experiencia reciente para identificar tu firmeza. Después podrás realizar un primer ejercicio breve, sin exigirte alcanzar una erección."
    },
    {
      "id": "ehs",
      "title": "Reconoce tu firmeza",
      "purpose": "Evaluación inicial — conservar el valor clínico",
      "visual": "lámina médica original de firmeza, ampliable",
      "actions": [
        "Ampliar lámina",
        "Elegir 4,3,2,1,0 o No evaluable",
        "Siguiente"
      ],
      "audio": "Recuerda una experiencia real reciente. Mira la lámina y elige la descripción que mejor representa tu firmeza. Cero significa sin respuesta. No evaluable significa que no tienes una experiencia suficiente para valorar. No necesitas provocar una erección ahora."
    },
    {
      "id": "mecanismo",
      "title": "La respuesta eréctil es vascular",
      "purpose": "Explicar visualmente el llenado vascular sin dar otra evaluación",
      "visual": "anatomía médica realista con vasos/cuerpos cavernosos superpuestos; no inventar cambios fisiológicos instantáneos",
      "actions": [
        "Escuchar guía",
        "Siguiente"
      ],
      "audio": "La excitación favorece la relajación del músculo liso del pene y el aumento del flujo de sangre hacia sus tejidos eréctiles. La firmeza puede variar según salud vascular, estímulos, nervios y contexto. Por eso trabajaremos habilidades y factores modificables a lo largo de tu ruta."
    },
    {
      "id": "accion",
      "title": "Primera práctica eréctil",
      "purpose": "Introducción opcional y breve a reconocer la excitación sin medición; no sustituye el entrenamiento completo de días posteriores",
      "visual": "imagen adulta de privacidad y bienestar sexual, no usar las fotografías de Focalización ni Movimiento",
      "actions": [
        "Escuchar instrucciones",
        "Cronómetro opcional",
        "Realicé la práctica",
        "Prefiero omitirla hoy"
      ],
      "audio": "Si te sientes cómodo, reserva dos o tres minutos en privado. Puedes evocar una fantasía o recuerdo erótico de tu elección, sin realizar un examen de firmeza. Permite que aparezca o no excitación y termina cuando lo prefieras. Si la actividad genera presión, incomodidad o no te interesa hoy, omítela. Esta práctica no busca forzar una erección ni promete aumentar la oxigenación inmediatamente."
    },
    {
      "id": "cierre",
      "title": "Tu primer paso está hecho",
      "purpose": "Guardar línea de base y cierre de práctica sin repetir evaluación EHS",
      "visual": "pantalla premium de confirmación, sin comparar EHS antes/después",
      "actions": [
        "Guardar y finalizar",
        "Volver a Hoy"
      ],
      "audio": "Ya reconociste tu punto de partida. Una respuesta aislada no define tu capacidad sexual. Continuaremos entrenando progresivamente las habilidades propias de Erección y firmeza. Tu resultado inicial queda registrado y puedes volver a Hoy."
    }
  ],
  "optionalMicroAction": {
    "durationMinutes": "2–3",
    "required": false,
    "choices": [
      "realizada",
      "omitida"
    ],
    "doesNotRepeatEhs": true,
    "doesNotCompleteTransversal": true
  },
  "constraints": {
    "doNotEdit": [
      "modules.js",
      "daily-resource-plan-v1.js",
      "daily-support-plan-v1.js",
      "adaptive-daily-plan-v2.js",
      "daily-progression-v3.js",
      "pelvic scheduling",
      "other 27 day lessons"
    ],
    "entry": "SPM_DAILY_PRACTICE current main activity, same ID main",
    "singleSave": "SPM_DAILY_PRACTICE.saveActivity('main', record, scope, 1)",
    "security": "Use the current engine safety/restriction gate before opening erotic practice; never clear flags",
    "voices": "Narrations text ready; existing Day 1 EHS MP3 is retained; new final MP3 need review",
    "visual": "Conserve the seven previously approved cover images outside the route until final graphic integration"
  }
};
window.SPM_ERECTION_DAY1_DRAFT=Object.freeze(spec);
})();