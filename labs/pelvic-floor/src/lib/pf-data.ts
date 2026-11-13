// SPM Pelvic Floor Lab — contenido y IDs de audio estables.
// Los IDs de audio NO deben cambiar: se usan para enlazar los MP3 oficiales (voz Lenny, HeyGen).

export type FloorState = 'rest' | 'up' | 'hold' | 'down' | 'breathe';

export type Phase = { key: string; label: string; sec: number; cue: string; state: FloorState; audioId: string };

export type Screen = { id: string; audioId: string; kicker: string; title: string; lead: string; trainer: string; steps: string[] };

// Los índices e IDs se conservan; el Lab diario trabaja sin contracciones.
export const SCREENS: Screen[] = [
  {
    "id": "welcome",
    "audioId": "pf.s01.welcome",
    "kicker": "Tu práctica diaria",
    "title": "Empieza por sentir y soltar",
    "lead": "Una guía directa para percibir, respirar y soltar, sin contracciones.",
    "trainer": "Vamos a empezar por una acción sencilla. Siéntate o recuéstate con apoyo y deja los muslos y los glúteos sueltos. Observa en la imagen dónde está el piso pélvico, en la base de la pelvis. Después abre la guía para percibir, respirar y soltar. Este laboratorio diario no incluye contracciones ni ejercicios de fuerza. Elige un ritmo cómodo, sin buscar una sensación especial ni una mejoría inmediata. Al terminar, registra lo que realmente notaste. Puedes abrir la explicación cuando quieras; no necesitas recorrer todas las pantallas para practicar.",
    "steps": [
      "Apoya el cuerpo",
      "Observa la zona",
      "Abre tu guía"
    ]
  },
  {
    "id": "map",
    "audioId": "pf.s02.map",
    "kicker": "Mapa visual",
    "title": "Observa la zona en movimiento",
    "lead": "Toca un estado y observa. La imagen es una referencia, no una medición.",
    "trainer": "Toca los botones para observar la zona en reposo, durante la respiración y al soltar. La imagen muestra una referencia, no una medición de tu cuerpo. Observa la base de la pelvis sin contraer ni empujar. Deja que el aire entre y salga con comodidad. Puede que no notes un movimiento claro, y eso no significa que debas hacer más fuerza. Al soltar, permite que la zona descanse, sin buscar llevarla hacia abajo. Puedes volver a reposo en cualquier momento. Aquí estamos aprendiendo a observar, no haciendo una prueba de fuerza.",
    "steps": [
      "Elige un estado",
      "Observa sin imitar",
      "Vuelve al reposo"
    ]
  },
  {
    "id": "awareness",
    "audioId": "pf.s03.awareness",
    "kicker": "Ubicación",
    "title": "Ubica el piso pélvico",
    "lead": "Observa la base de la pelvis y nota el apoyo del cuerpo.",
    "trainer": "Primero observa la base de la pelvis en la imagen. El piso pélvico está en la parte inferior de la pelvis. Siéntate con apoyo y nota el contacto del cuerpo con la superficie. No necesitas contraer para localizar la zona. Respira con naturalidad y observa si percibes apoyo, tensión o ninguna sensación clara. Puedes ampliar la imagen o volver a mirarla sin hacer ningún movimiento. Si no logras identificar la zona, indícalo sin forzar. No practiques cortando el chorro de orina. El objetivo de este paso es orientarte y reconocer qué puedes percibir hoy.",
    "steps": [
      "Mira la base de la pelvis",
      "Nota el apoyo",
      "Sin contraer ni empujar"
    ]
  },
  {
    "id": "breath",
    "audioId": "pf.s04.breath",
    "kicker": "Guía a tu ritmo",
    "title": "Percibe, respira y suelta",
    "lead": "Practica a tu ritmo. Sin contracciones, sin tiempo mínimo.",
    "trainer": "Acomódate con el cuerpo apoyado. Primero percibe el contacto de la pelvis con la superficie, sin buscar una sensación especial. Después deja que la respiración entre y salga con comodidad, sin profundizarla, retener el aire ni empujar. Al soltar, afloja donde puedas y permite que la zona quede en reposo. Aquí no hay contracciones. Usa los pasos de la pantalla a tu propio ritmo. El cronómetro es orientativo y no hay un tiempo mínimo. Cuando hayas practicado, elige terminar y registra tu respuesta. No hace falta sentir un cambio. Si aparece dolor, mareo o malestar, detén la práctica.",
    "steps": [
      "Percibe el apoyo",
      "Respira con comodidad",
      "Suelta sin forzar"
    ]
  },
  {
    "id": "relax-first",
    "audioId": "pf.s05.relax",
    "kicker": "Antes de practicar",
    "title": "Comprueba cómo te sientes",
    "lead": "Marca lo que notes. No necesitas hacer una prueba para responder.",
    "trainer": "Antes de practicar, revisa cómo te encuentras. Marca si hay dolor, tensión persistente, dificultad para soltar o síntomas urinarios nuevos o que empeoran. No intentes resolver una molestia haciendo fuerza. Si no sabes si logras relajar la zona, elige no lo sé. No necesitas hacer una contracción para contestar. La pantalla te mostrará la orientación compatible con tus respuestas. La respiración y la relajación también deben ser cómodas: no las fuerces. Si aparece una señal que requiere valoración, consulta con un profesional. Observar y detenerse a tiempo forma parte del cuidado.",
    "steps": [
      "Reconoce las señales",
      "Marca lo que aplique",
      "Consulta si hace falta"
    ]
  },
  {
    "id": "technique",
    "audioId": "pf.s06.technique",
    "kicker": "Acomódate",
    "title": "Prepara una posición cómoda",
    "lead": "Apoya el cuerpo, reduce el esfuerzo y respira con comodidad.",
    "trainer": "Elige una posición que te resulte cómoda, sentado o recostado con apoyo. Deja descansar los pies o las piernas sobre una superficie. Afloja los glúteos y los muslos sin intentar colocarlos de una manera perfecta. Observa si aprietas la mandíbula o empujas con el abdomen, y reduce ese esfuerzo si puedes. Respira normalmente, sin retener el aire. Mira la zona resaltada en la imagen: no necesitas moverla ni contraerla. Si una posición molesta, cámbiala o detén la práctica. Cuando estés cómodo, abre la guía de percepción, respiración y relajación.",
    "steps": [
      "Busca apoyo",
      "Afloja el esfuerzo",
      "Respira normalmente"
    ]
  },
  {
    "id": "guided",
    "audioId": "pf.s07.guided",
    "kicker": "Recorrido guiado",
    "title": "Sigue la guía a tu ritmo",
    "lead": "Tres pasos sencillos. Tú eliges cuándo pasar al siguiente.",
    "trainer": "Inicia la guía cuando estés acomodado. En percibe, nota el apoyo del cuerpo y observa la zona resaltada. En respira, deja que el aire entre y salga de forma cómoda, sin seguir una cuenta obligatoria. En suelta, reduce el esfuerzo que puedas y permite el reposo, sin empujar. La imagen cambia con cada paso para ayudarte a orientarte; no tienes que imitar un movimiento. Puedes avanzar, repetir el recorrido o pausar. Pausar no registra una práctica. El cronómetro no establece una meta. Cuando hayas practicado a tu ritmo, elige terminar y responde según lo que realmente notaste.",
    "steps": [
      "Inicia cuando estés cómodo",
      "Avanza a tu ritmo",
      "Registra tu respuesta"
    ]
  },
  {
    "id": "coordination",
    "audioId": "pf.s08.coordination",
    "kicker": "Coordinación respiratoria",
    "title": "Acompaña tu respiración",
    "lead": "Acompaña el paso del aire, sin contraer ni retener la respiración.",
    "trainer": "Vamos a coordinar la atención con la respiración, sin contraer. Acomódate y nota el apoyo del cuerpo. Mientras entra el aire, observa la sensación que aparezca, sin hacer la respiración más profunda. Mientras sale, afloja donde te resulte cómodo y deja la zona en reposo. No necesitas notar que el piso pélvico se mueve. Si aparece una preocupación, vuelve al contacto con la superficie o al paso del aire. No retengas la respiración ni empujes hacia abajo. Puedes utilizar la guía visual a tu propio ritmo y detenerte si aparece malestar.",
    "steps": [
      "Nota el paso del aire",
      "No cambies su profundidad",
      "Permite el reposo"
    ]
  },
  {
    "id": "fine-control",
    "audioId": "pf.s09.fine",
    "kicker": "Atención y liberación",
    "title": "Elige un apoyo para soltar",
    "lead": "Una sensación sencilla puede ayudarte a volver al momento presente.",
    "trainer": "Elige un apoyo sencillo para tu atención. Puede ser el contacto de las manos, el peso del cuerpo sobre la superficie o un sonido del ambiente. Quédate con esa referencia mientras respiras de forma natural. Si notas tensión, observa si puedes reducir un poco el esfuerzo, sin obligarte a sentir relajación. Si no notas un cambio, también puedes registrarlo. Esta práctica no incluye contracciones rápidas ni sostenidas. Puedes volver al apoyo que elegiste cada vez que te distraigas. No hay una duración que tengas que alcanzar: termina de manera intencional cuando hayas practicado a tu ritmo.",
    "steps": [
      "Elige una sensación",
      "Vuelve a ella con calma",
      "Sin exigir un cambio"
    ]
  },
  {
    "id": "transfer",
    "audioId": "pf.s10.transfer",
    "kicker": "En tu día a día",
    "title": "Suelta en situaciones cotidianas",
    "lead": "Reconoce el esfuerzo que no necesitas y afloja con comodidad.",
    "trainer": "Elige una situación cotidiana y observa cómo está tu cuerpo. Puede ser después de estar sentado, al prepararte para una actividad o en un momento de intimidad. Nota si aprietas los glúteos, retienes el aire o sostienes tensión sin necesitarla. Afloja con comodidad y vuelve a respirar. No se trata de mantener el piso pélvico contraído durante el día. Tampoco practiques interrumpiendo el chorro de orina. Quédate con una acción pequeña que puedas recordar: observar, respirar y soltar sin forzar. Si aparece una molestia, detente y busca orientación según tu situación.",
    "steps": [
      "Elige un momento",
      "Observa la tensión",
      "Afloja donde puedas"
    ]
  },
  {
    "id": "overload",
    "audioId": "pf.s11.overload",
    "kicker": "Cuidado",
    "title": "Reconoce cuándo parar",
    "lead": "La comodidad guía la práctica. No necesitas terminar si algo molesta.",
    "trainer": "Revisa cómo te sentiste durante la práctica y después de ella. Marca si notaste pesadez, dolor, ardor, dificultad para soltar, más urgencia para orinar o tensión en otras zonas. No hace falta terminar un recorrido si aparece una molestia. Detén la práctica y no fuerces la respiración ni empujes para intentar soltar. Si la señal persiste, es nueva o te preocupa, busca orientación profesional. Registrar lo ocurrido ayuda a elegir el siguiente paso; no es una prueba que tengas que aprobar. La práctica diaria se adapta a lo que puedes hacer con comodidad hoy.",
    "steps": [
      "Reconoce la molestia",
      "Detén la práctica",
      "Pide orientación"
    ]
  },
  {
    "id": "library",
    "audioId": "pf.s12.library",
    "kicker": "Biblioteca",
    "title": "Elige una práctica",
    "lead": "Abre directamente lo que quieras practicar o revisar.",
    "trainer": "Elige la tarjeta que necesitas hoy: ubicar la zona, percibir y soltar, acompañar la respiración o revisar las señales de malestar. Cada tarjeta te lleva directamente a su guía, sin recorrer las demás pantallas. Todo el laboratorio se centra en conciencia, relajación y coordinación respiratoria; no incluye entrenamiento de fuerza. Las sesiones de contracción, cuando están indicadas, pertenecen a otro módulo del programa. Escuchar una explicación o mirar una imagen no registra una práctica. Cuando realmente la hayas realizado, completa su respuesta y vuelve a tu plan.",
    "steps": [
      "Elige una tarjeta",
      "Abre la guía",
      "Vuelve a tu plan"
    ]
  },
  {
    "id": "progression",
    "audioId": "pf.s13.plan",
    "kicker": "Continuidad",
    "title": "Practica sin exigirte avanzar",
    "lead": "Observa y repite según tu situación, sin exigirte un resultado.",
    "trainer": "No tienes que pasar de relajación a fuerza dentro de este laboratorio. Aquí puedes seguir practicando cómo percibir la zona, respirar con comodidad y reducir esfuerzo sin empujar. Algunos días notarás más y otros menos; no necesitas convertirlo en una prueba de rendimiento. Si hay dificultad o molestias, revisa la postura, detente o busca orientación según lo que ocurra. Repetir una guía no es fallar. Este laboratorio se integra con tu plan de SPM y no crea un segundo calendario. Las sesiones de contracción indicadas se mantienen en su módulo separado.",
    "steps": [
      "Observa",
      "Repite si es cómodo",
      "Revisa si hay molestias"
    ]
  },
  {
    "id": "progress",
    "audioId": "pf.s14.progress",
    "kicker": "Tu registro",
    "title": "Registra cómo quedaste",
    "lead": "Responde según tu experiencia. No hay valores elegidos por ti.",
    "trainer": "Tómate un momento para registrar lo que notaste. Elige tu nivel de tensión y cómo fue soltar la zona. No hay una respuesta correcta ni necesitas mostrar una mejoría. Si no sabes cómo describirlo, puedes volver a observar con calma antes de guardar. Tus registros anteriores te ayudan a reconocer diferencias entre prácticas; una sola respuesta no establece un diagnóstico. En el programa, el registro se guarda en tu cuenta. Guardar esta observación no completa por sí solo un día de tu ruta. Para cerrar la actividad de hoy, vuelve al plan y utiliza su confirmación.",
    "steps": [
      "Elige tu respuesta",
      "Guarda la observación",
      "Vuelve a tu plan"
    ]
  },
  {
    "id": "safety",
    "audioId": "pf.s15.safety",
    "kicker": "Orientación",
    "title": "Decide cuándo consultar",
    "lead": "La educación acompaña el cuidado; algunas señales necesitan valoración.",
    "trainer": "Este laboratorio ofrece educación y práctica guiada; no sustituye una valoración profesional. Si aparece dolor pélvico, perineal, testicular o al eyacular, dificultad marcada para soltar, síntomas urinarios nuevos o empeoramiento de tus síntomas, detén la práctica y consulta. La sangre en orina o semen, la fiebre, el dolor que no cede u otros síntomas nuevos o intensos también necesitan valoración. Si no puedes orinar, tienes dolor abdominal intenso o dolor testicular repentino e intenso, busca atención médica inmediata. Si tienes dudas persistentes o las molestias afectan tu vida diaria, busca orientación. No fuerces una práctica para comprobar si el problema desaparece. Puedes conservar la información educativa mientras se revisa tu situación.",
    "steps": [
      "Revisa las señales",
      "Detente si hace falta",
      "Busca valoración"
    ]
  },
  {
    "id": "close",
    "audioId": "pf.s16.close",
    "kicker": "Para continuar",
    "title": "Elige tu siguiente paso",
    "lead": "Quédate con lo que reconociste y con lo que quieras seguir observando.",
    "trainer": "Antes de salir, piensa qué reconociste hoy y qué te gustaría seguir observando. Puede ser el apoyo del cuerpo, la respiración, una tensión que aparece o la facilidad para soltar. No necesitas haberlo dominado ni sentir un cambio inmediato. La práctica personal se sostiene con atención y sin exceso, como una habilidad que se sigue cuidando. Vuelve a tu plan para continuar cuando corresponda, o abre la biblioteca si quieres repasar una explicación. Si notaste molestias o dificultades persistentes, el siguiente paso puede ser consultar. Elige según tu situación y conserva un ritmo cómodo.",
    "steps": [
      "Reconoce lo que notaste",
      "Elige qué observar",
      "Continúa a tu ritmo"
    ]
  }
];

export type DailyPhase = { key: string; label: string; cue: string; state: FloorState; audioId: string };
// El cambio de paso es intencional: sin cuenta respiratoria, dosis ni avance por tiempo.
export const DAILY_PHASES: DailyPhase[] = [
  { key: 'percibe', label: 'Percibe', cue: 'Nota el contacto del cuerpo con la superficie. No necesitas sentir un movimiento.', state: 'rest', audioId: 'pf.cue.percibe' },
  { key: 'respira', label: 'Respira', cue: 'Deja que el aire entre y salga con comodidad, sin profundizarlo ni retenerlo.', state: 'breathe', audioId: 'pf.cue.respira' },
  { key: 'suelta', label: 'Suelta', cue: 'Afloja donde puedas y permite el reposo. Sin contraer ni empujar.', state: 'down', audioId: 'pf.cue.suelta' },
];

export const RED_FLAGS = [
  'Dolor pélvico, perineal, testicular o al eyacular',
  'Dificultad marcada para relajar o sensación de tensión constante',
  'Urgencia urinaria nueva o en aumento',
  'Ardor o dolor al orinar, o dificultad nueva para iniciar el chorro',
  'Tus síntomas empeoran con las contracciones',
];

// Señales de alarma (valoración profesional). Separadas de los motivos de reevaluación.
export const ALARM_SIGNS = [...RED_FLAGS, 'Sangre en orina o en semen', 'Otros síntomas nuevos o intensos que te preocupen (fiebre, dolor que no cede)'];
export const REEVAL_REASONS = [
  'Sin cambios percibidos tras varias semanas de práctica constante',
  'Pérdidas de orina que afectan tu vida diaria',
  'Dudas persistentes sobre si estás contrayendo o empujando',
];

/* ---------- Dosificación histórica: preservada para lectura y compatibilidad ---------- */
// Las acciones del Lab diario no ejecutan estas series de contracción.
export type PracticeMode = 'relax' | 'contract' | 'coord' | 'quick' | 'sustained';
export type PelvicPracticeConfig = {
  mode: PracticeMode;
  contractionSec: number;
  releaseSec: number;
  reps: number;
  intensityLabel: 'suave' | 'moderada'; // máxima: bloqueada
  cueSet: string;
};
export type PracticeId = 'percibe' | 'contrae' | 'coord' | 'rapidas' | 'sostenidas';
export type Practice = { id: PracticeId; name: string; step: number; strengthening: boolean; demo: PelvicPracticeConfig };

// Valores DEMO — ejemplo para revisión interna, NO prescripción.
export const PRACTICES: Record<PracticeId, Practice> = {
  percibe: { id: 'percibe', name: 'Percibe · Respira · Suelta', step: 3, strengthening: false, demo: { mode: 'relax', contractionSec: 4, releaseSec: 6, reps: 4, intensityLabel: 'suave', cueSet: 'relax.standard' } },
  contrae: { id: 'contrae', name: 'Contrae · Sostén · Suelta', step: 6, strengthening: true, demo: { mode: 'contract', contractionSec: 3, releaseSec: 6, reps: 6, intensityLabel: 'suave', cueSet: 'contract.standard' } },
  coord: { id: 'coord', name: 'Exhala + activa · Inhala + suelta', step: 7, strengthening: true, demo: { mode: 'coord', contractionSec: 4, releaseSec: 5, reps: 5, intensityLabel: 'suave', cueSet: 'coord.standard' } },
  rapidas: { id: 'rapidas', name: 'Breves · reacción', step: 8, strengthening: true, demo: { mode: 'quick', contractionSec: 1, releaseSec: 2, reps: 8, intensityLabel: 'suave', cueSet: 'quick.standard' } },
  sostenidas: { id: 'sostenidas', name: 'Sostenidas · resistencia', step: 8, strengthening: true, demo: { mode: 'sustained', contractionSec: 5, releaseSec: 10, reps: 4, intensityLabel: 'suave', cueSet: 'sustained.standard' } },
};

export function buildPhases(c: PelvicPracticeConfig): Phase[] {
  switch (c.mode) {
    case 'relax': return [
      { key: 'percibe', label: 'Percibe', sec: c.contractionSec, cue: 'Nota el contacto de la pelvis con la silla.', state: 'rest', audioId: 'pf.cue.percibe' },
      { key: 'respira', label: 'Respira', sec: c.contractionSec, cue: 'Inhala lento: la base de la pelvis desciende y se abre.', state: 'breathe', audioId: 'pf.cue.respira' },
      { key: 'suelta', label: 'Suelta', sec: c.releaseSec, cue: 'Exhala y deja ir cualquier tensión.', state: 'down', audioId: 'pf.cue.suelta' },
    ];
    case 'coord': return [
      { key: 'exhala', label: 'Exhala + activa', sec: c.contractionSec, cue: 'Exhala por la boca y eleva suavemente.', state: 'up', audioId: 'pf.cue.exhala-eleva' },
      { key: 'inhala', label: 'Inhala + suelta', sec: c.releaseSec, cue: 'Inhala por la nariz, el piso pélvico desciende.', state: 'breathe', audioId: 'pf.cue.inhala-suelta' },
    ];
    case 'quick': return [
      { key: 'rapida', label: 'Breve', sec: c.contractionSec, cue: 'Contrae y suelta como un parpadeo.', state: 'up', audioId: 'pf.cue.rapida' },
      { key: 'suelta', label: 'Suelta', sec: c.releaseSec, cue: 'Relaja del todo.', state: 'down', audioId: 'pf.cue.suelta-rapida' },
    ];
    default: return [
      { key: 'contrae', label: 'Contrae', sec: 2, cue: 'Eleva suave, hacia adentro y arriba.', state: 'up', audioId: 'pf.cue.contrae' },
      { key: 'sosten', label: 'Sostén', sec: c.contractionSec, cue: 'Mantén sin apnea. Glúteos quietos.', state: 'hold', audioId: 'pf.cue.sosten' },
      { key: 'suelta', label: 'Suelta', sec: c.releaseSec, cue: 'Suelta por completo. Siente cómo vuelve a reposo.', state: 'down', audioId: 'pf.cue.suelta-total' },
    ];
  }
}

/* ---------- Resultado reutilizable por el motor SPM ---------- */
export type Recommendation = 'progress' | 'repeat' | 'relax' | 'clinical-review';
export type PracticeResult = {
  practiceId: PracticeId; completed: boolean;
  cleanContraction: boolean | null; // null en prácticas sin contracción (relajación)
  fullRelease: boolean; discomfort: boolean; postTension: boolean;
  recommendation: Recommendation;
  // Opcionales para conservar la lectura de resultados históricos.
  day?: number; activityId?: string; intent?: 'daily-relax' | 'scheduled' | 'library';
};
export function recommend(r: Omit<PracticeResult, 'recommendation'>, ctx: { flags: boolean; priorDiscomfort: boolean }): Recommendation {
  if (ctx.flags) return r.discomfort ? 'clinical-review' : 'relax';
  if (r.discomfort) return ctx.flags || ctx.priorDiscomfort ? 'clinical-review' : 'relax';
  if (!r.fullRelease || r.postTension) return 'relax';
  if (r.cleanContraction === false || !r.completed) return 'repeat';
  return 'progress';
}
// La práctica diaria no habilita ni recomienda progresión hacia fuerza.
export function recommendDaily(r: Omit<PracticeResult, 'recommendation'>, ctx: { flags: boolean; priorDiscomfort: boolean }): Recommendation {
  const value = recommend(r, ctx);
  return value === 'progress' ? 'repeat' : value;
}
export const REC_LABEL: Record<Recommendation, string> = {
  progress: 'Puede progresar', repeat: 'Repetir esta etapa', relax: 'Volver a relajación', 'clinical-review': 'Sugerir valoración profesional',
};

/* ---------- Ruta educativa (no diagnóstico) ---------- */
export type RouteKey = 'relax' | 'awareness' | 'activation' | 'mixed';
export const ROUTES: Record<RouteKey, { name: string; stage: string; why: string; practices: PracticeId[] }> = {
  relax: { name: 'Relajación · down-training', stage: 'A', why: 'Hay molestias, tensión, dificultad para soltar o síntomas nuevos. Primero soltar; el fortalecimiento queda en pausa.', practices: ['percibe'] },
  awareness: { name: 'Conciencia · coordinación', stage: 'B', why: 'Aún no localizas bien el músculo, aparecen compensaciones o no está confirmada la relajación completa.', practices: ['percibe', 'coord'] },
  activation: { name: 'Activación suave', stage: 'C', why: 'Localizas, contraes sin compensar y sueltas por completo, sin señales de alerta.', practices: ['percibe', 'contrae', 'coord'] },
  mixed: { name: 'Mixta · coordinación funcional', stage: 'D', why: 'Ya dominas activación y relajación de forma consistente.', practices: ['coord', 'rapidas', 'sostenidas', 'percibe'] },
};

export const STAGES = [
  { k: 'A', name: 'Conciencia y relajación', goal: 'Percibir la zona y soltarla por completo con la respiración.', advance: 'Suelta con facilidad y sin molestias en varias prácticas.', repeat: 'La relajación aún se siente incompleta o lenta.', back: 'Es la etapa base: aquí se vuelve siempre que hay molestia.', metric: 'fullRelease · postTension · discomfort' },
  { k: 'B', name: 'Coordinación con respiración', goal: 'Exhalar activando suave e inhalar soltando, sin perder el ritmo.', advance: 'Mantiene la sincronía y respira sin apnea.', repeat: 'Pierde la sincronía o aparecen compensaciones.', back: 'Tensión al terminar o dificultad para soltar.', metric: 'cleanContraction · fullRelease' },
  { k: 'C', name: 'Activación suave (solo si procede)', goal: 'Contracciones suaves o moderadas, limpias, con relajación completa.', advance: 'Contracción limpia + respiración continua + relajación completa + sin molestias.', repeat: 'Contracción con compensaciones o apnea.', back: 'Dolor, tensión posterior o dificultad para soltar.', metric: 'cleanContraction · fullRelease · discomfort · recommendation' },
  { k: 'D', name: 'Transferencia funcional y sexual', goal: 'Elegir cuándo activar y, sobre todo, soltar en situaciones reales.', advance: 'Aplica sin tensión constante y sin síntomas.', repeat: 'Le cuesta soltar tras la situación real.', back: 'Aparece tensión mantenida o molestias.', metric: 'postTension · discomfort · adherencia' },
];

export const OVERLOAD_SIGNS = [
  { t: 'Fatiga o pesadez perineal', d: 'Sensación de cansancio o peso tras entrenar.' },
  { t: 'Dolor o ardor', d: 'Cualquier dolor durante o después es señal de parar.' },
  { t: 'No logras soltar', d: 'La relajación se siente incompleta o lenta.' },
  { t: 'Más urgencia o frecuencia', d: 'Ir al baño más seguido tras entrenar.' },
  { t: 'Tensión en mandíbula, cadera o lumbar', d: 'Compensaciones que se acumulan.' },
];

export const LIBRARY: { id: string; name: string; tag: string; min: number; step: number; practice?: PracticeId }[] = [
  { id: 'lib.percibe', name: 'Percibe · Respira · Suelta', tag: 'Relajación', min: 3, step: 3, practice: 'percibe' },
  { id: 'lib.localiza', name: 'Localización suave', tag: 'Conciencia', min: 2, step: 2 },
  { id: 'lib.contrae', name: 'Contrae · Sostén · Suelta', tag: 'Activación suave', min: 5, step: 6, practice: 'contrae' },
  { id: 'lib.coord', name: 'Coordinación respiratoria', tag: 'Coordinación', min: 4, step: 7, practice: 'coord' },
  { id: 'lib.rapidas', name: 'Breves y sostenidas', tag: 'Control fino', min: 4, step: 8, practice: 'rapidas' },
  { id: 'lib.exceso', name: 'Chequeo de exceso de tensión', tag: 'Seguridad', min: 1, step: 10 },
];


