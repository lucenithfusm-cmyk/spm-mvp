// SPM Pelvic Floor Lab — contenido y IDs de audio estables.
// Los IDs de audio NO deben cambiar: se usan para enlazar los MP3 oficiales (voz Lenny, HeyGen).

export type FloorState = 'rest' | 'up' | 'hold' | 'down' | 'breathe';

export type Phase = { key: string; label: string; sec: number; cue: string; state: FloorState; audioId: string };

export type Screen = { id: string; audioId: string; kicker: string; title: string; lead: string; trainer: string };

export const SCREENS: Screen[] = [
  { id: 'welcome', audioId: 'pf.s01.welcome', kicker: 'Bienvenida', title: 'Tu piso pélvico, entendido', lead: 'Un grupo de músculos en forma de hamaca que sostiene, controla y participa en la función urinaria, intestinal y sexual.', trainer: 'Aquí no venimos a apretar más. Venimos a sentir, soltar y coordinar. La fuerza llega después.' },
  { id: 'map', audioId: 'pf.s02.map', kicker: 'Mapa funcional', title: 'Cuatro capacidades, no una', lead: 'Un piso pélvico sano no es solo fuerte: sabe tensarse, relajarse, coordinarse y resistir.', trainer: 'En muchos hombres el reto es el exceso de tensión, no la falta de fuerza. Por eso miramos las cuatro.' },
  { id: 'awareness', audioId: 'pf.s03.awareness', kicker: 'Conciencia corporal', title: 'Localiza sin empujar', lead: 'Imagina que detienes suavemente un gas o elevas los testículos unos milímetros. Glúteos, abdomen y mandíbula quedan quietos.', trainer: 'Si sientes que empujas hacia abajo o aprietas las nalgas, para. Busca un movimiento pequeño, hacia adentro y arriba.' },
  { id: 'breath', audioId: 'pf.s04.breath', kicker: 'Respiración + piso pélvico', title: 'Percibe · Respira · Suelta', lead: 'Al inhalar, el diafragma baja y el piso pélvico desciende y se abre. Al exhalar, regresa de forma natural.', trainer: 'Deja que la inhalación abra la base de la pelvis. No hagas nada más que notar.' },
  { id: 'relax-first', audioId: 'pf.s05.relax', kicker: 'Relajación primero', title: 'Cuándo NO hacer Kegels', lead: 'Los Kegels no son para todos. Si hay dolor o dificultad para relajar, fortalecer puede empeorar los síntomas.', trainer: 'Sé honesto con este chequeo. Si algo aplica, tu ruta empieza por soltar, no por apretar.' },
  { id: 'technique', audioId: 'pf.s06.technique', kicker: 'Contracción correcta', title: 'Suave, limpia, sin compensar', lead: 'Una contracción correcta es pequeña: eleva y cierra hacia adentro. La relajación completa es parte del ejercicio.', trainer: 'Trabaja suave o moderado, nunca al máximo. Revisa mandíbula, abdomen y glúteos.' },
  { id: 'guided', audioId: 'pf.s07.guided', kicker: 'Entrenamiento guiado', title: 'Contrae · Sostén · Suelta', lead: 'Sigue el temporizador. La fase de soltar es igual o más larga que la de sostener: ahí está la clave.', trainer: 'Contrae suave, sostén sin apnea y suelta por completo antes de la siguiente repetición.' },
  { id: 'coordination', audioId: 'pf.s08.coordination', kicker: 'Coordinación', title: 'Exhala y eleva, inhala y suelta', lead: 'Sincroniza: exhalas mientras contraes suavemente, inhalas mientras el piso pélvico desciende y se abre.', trainer: 'La respiración marca el ritmo. Si pierdes la sincronía, vuelve solo a respirar.' },
  { id: 'fine-control', audioId: 'pf.s09.fine', kicker: 'Control fino', title: 'Breves vs sostenidas', lead: 'Las contracciones breves entrenan reacción; las sostenidas, resistencia. Ambas terminan en relajación total.', trainer: 'En las rápidas, contrae y suelta como un parpadeo. Sin acumular tensión.' },
  { id: 'transfer', audioId: 'pf.s10.transfer', kicker: 'Transferencia', title: 'Llévalo a la vida real', lead: 'Aplica la conciencia en momentos concretos, con poca intensidad y sin convertirlo en tensión constante.', trainer: 'Más no es mejor. El objetivo es elegir cuándo activar y, sobre todo, saber soltar.' },
  { id: 'overload', audioId: 'pf.s11.overload', kicker: 'Señales de exceso', title: 'Cuándo parar', lead: 'Sobreentrenar el piso pélvico es real. Aprende a reconocer las señales antes de que se vuelvan síntomas.', trainer: 'Si aparece alguna de estas señales, detén el fortalecimiento y vuelve a la relajación.' },
  { id: 'library', audioId: 'pf.s12.library', kicker: 'Biblioteca', title: 'Ejercicios a tu alcance', lead: 'Accede directamente a cada práctica. Al terminar, vuelves aquí con un toque.', trainer: 'Elige según lo que necesites hoy: soltar, coordinar o activar.' },
  { id: 'progression', audioId: 'pf.s13.plan', kicker: 'Progresión SPM', title: 'Cómo evoluciona esta habilidad', lead: 'Cuatro etapas sin fechas fijas. SPM decide cuándo y con qué frecuencia practicas dentro de tu ciclo general.', trainer: 'Avanzas cuando la etapa sale limpia y cómoda. Repetir o volver a soltar también es progresar.' },
  { id: 'progress', audioId: 'pf.s14.progress', kicker: 'Progreso', title: 'Check-in breve', lead: 'Registra cómo te sientes. Todo queda solo en este dispositivo.', trainer: 'Treinta segundos de honestidad valen más que cien repeticiones.' },
  { id: 'safety', audioId: 'pf.s15.safety', kicker: 'Seguridad', title: 'Cuándo consultar', lead: 'Este laboratorio educa y entrena; no diagnostica. Algunas señales merecen valoración profesional.', trainer: 'Consultar a tiempo es parte del entrenamiento, no un fracaso.' },
  { id: 'close', audioId: 'pf.s16.close', kicker: 'Cierre', title: 'Tu siguiente paso', lead: 'Ya sabes sentir, soltar, coordinar y activar con suavidad. Ahora, constancia sin exceso.', trainer: 'Vuelve al plan mañana. Poco, bien hecho y con relajación completa.' },
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

/* ---------- Dosificación configurable (SPM asigna los valores reales) ---------- */
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
};
export function recommend(r: Omit<PracticeResult, 'recommendation'>, ctx: { flags: boolean; priorDiscomfort: boolean }): Recommendation {
  if (ctx.flags) return r.discomfort ? 'clinical-review' : 'relax';
  if (r.discomfort) return ctx.flags || ctx.priorDiscomfort ? 'clinical-review' : 'relax';
  if (!r.fullRelease || r.postTension) return 'relax';
  if (r.cleanContraction === false || !r.completed) return 'repeat';
  return 'progress';
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


