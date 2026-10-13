export type Pattern = { inhale: number; hold: number; exhale: number };
export const PATTERN_426: Pattern = { inhale: 4, hold: 2, exhale: 6 };

export const screens = [
  { kicker: 'BIENVENIDA', title: 'Tu respiración cambia la respuesta del cuerpo' },
  { kicker: 'FUNDAMENTOS', title: 'Torácica vs diafragmática' },
  { kicker: 'AUTOOBSERVACIÓN', title: 'Reconoce dónde estás respirando' },
  { kicker: 'DEMOSTRACIÓN', title: 'Mira cómo se hace' },
  { kicker: 'PRÁCTICA GUIADA', title: 'Ahora hazlo conmigo' },
  { kicker: 'FEEDBACK', title: 'Mano en el abdomen' },
  { kicker: 'SOLTAR TENSIÓN', title: 'Mandíbula, hombros y abdomen' },
  { kicker: 'REGULACIÓN', title: 'Bajar intensidad y ansiedad' },
  { kicker: 'ACTIVACIÓN ALTA', title: 'Durante la excitación o antes de una pausa' },
  { kicker: 'PISO PÉLVICO', title: 'Exhala y suelta' },
  { kicker: 'RESCATE', title: 'Respiración breve de rescate' },
  { kicker: 'SESIÓN', title: 'Sesión guiada · 2 minutos' },
  { kicker: 'SESIÓN', title: 'Sesión guiada · 5 minutos' },
  { kicker: 'BIBLIOTECA', title: 'Biblioteca de prácticas' },
  { kicker: 'PLAN', title: 'Plan de 28 días' },
  { kicker: 'PROGRESO', title: 'Progreso y check-in' },
  { kicker: 'SEGURIDAD', title: 'Señales para detenerte' },
  { kicker: 'CIERRE', title: 'Lo que te llevas' },
] as const;

export const trainerLines: string[] = [
  'Cuando la respiración se vuelve lenta y baja, el cuerpo recibe una señal de calma. Aquí aprenderás a usarla a tu favor, sin forzar nada.',
  'Respirar solo con el pecho suele acompañar la tensión. Llevar el aire hacia el abdomen permite que el diafragma trabaje y la exhalación se alargue.',
  'Pon una mano en el pecho y otra en el abdomen. Respira normal, sin corregir. Solo observa cuál se mueve más.',
  'Observa el ritmo: el abdomen se expande al inhalar y vuelve suave al exhalar. Hombros y pecho casi quietos.',
  'Vamos juntos: inhala cuatro, pausa dos, exhala seis. Si la pausa te incomoda, quítala. Nunca fuerces el aire.',
  'Tu mano es el mejor sensor. Al inhalar debería subir suavemente; al exhalar, bajar sin empujar.',
  'Separa ligeramente los dientes, deja caer los hombros y afloja el abdomen. La tensión se suelta en la exhalación.',
  'Cuando notes nervios o intensidad alta, alarga la exhalación. Un minuto basta para empezar a notar el cambio.',
  'Si la activación sube rápido, detén el estímulo, respira bajo y lento, y espera a que baje antes de continuar.',
  'Al exhalar, imagina que el piso pélvico se ablanda y desciende. No empujes: solo suelta.',
  'Tres respiraciones lentas, sin pausa. Úsala cuando necesites volver al centro en menos de un minuto.',
  'Dos minutos bastan para practicar esta habilidad en los días elegidos. Siéntate cómodo y sigue el círculo.',
  'Cinco minutos para una regulación más profunda. Si te distraes, vuelve al ritmo sin juzgarte.',
  'Elige la práctica que necesitas en este momento. Siempre puedes volver aquí.',
  'Estos 28 días son para aprender, sentir y ajustar la técnica; no para convertirla en un ritual diario. Tu ritmo depende de tu evolución.',
  'Registra cómo te sientes después de cada sesión. Así verás tu evolución.',
  'Respirar lento debe sentirse cómodo. Si aparece mareo o malestar, detente y respira normal.',
  'Cuando domines la técnica y la toleres bien, quedará disponible para integración según tu evolución y el plan asignado por SPM, no como obligación diaria.',
];

export type Practice = { id: string; step: number; name: string; desc: string; minutes: string };
export const library: Practice[] = [
  { id: 'core-426', step: 4, name: 'Ciclo base 4·2·6', desc: 'El ritmo de entrenamiento principal.', minutes: '1 min' },
  { id: 'hand-feedback', step: 5, name: 'Mano en abdomen', desc: 'Siente el movimiento diafragmático.', minutes: '1 min' },
  { id: 'downregulate', step: 7, name: 'Bajar intensidad', desc: 'Exhalación larga para ansiedad o nervios.', minutes: '1 min' },
  { id: 'arousal', step: 8, name: 'Antes de una pausa', desc: 'Regular la activación alta.', minutes: '1 min' },
  { id: 'pelvic-release', step: 9, name: 'Exhala y suelta', desc: 'Respiración + relajación del piso pélvico.', minutes: '1 min' },
  { id: 'rescue', step: 10, name: 'Rescate', desc: 'Tres respiraciones lentas, sin pausa.', minutes: '30 s' },
  { id: 'session-2', step: 11, name: 'Sesión 2 min', desc: 'Práctica corta en días elegidos.', minutes: '2 min' },
  { id: 'session-5', step: 12, name: 'Sesión 5 min', desc: 'Regulación profunda.', minutes: '5 min' },
];

export type PlanDay = { day: number; rest: boolean; task: string };
const weekTask = [
  'En días elegidos: 2 min · 4·6 sin pausa (4·2·6 si te resulta cómodo). Observa el movimiento.',
  'En días elegidos: 2 min · ajusta el ritmo y comprueba la comodidad. Sin obligación diaria.',
  'Según tu tolerancia: hasta 5 min en días elegidos; rescate solo cuando lo necesites.',
  'Revisa técnica y tolerancia. Si están validadas, puede integrarse en días o entrenamientos seleccionados por SPM.',
];
export const weeks = ['Semana 1 · Aprender el ritmo', 'Semana 2 · Observar y ajustar', 'Semana 3 · Consolidar la habilidad', 'Semana 4 · Revisar e integrar'];
export const plan: PlanDay[] = Array.from({ length: 28 }, (_, i) => {
  const d = i + 1;
  const w = Math.floor(i / 7);
  const rest = d % 7 === 0 && d !== 28;
  return { day: d, rest, task: d === 28 ? 'Revisión de técnica y tolerancia; sesión opcional' : rest ? 'Descanso sugerido: respira normal, sin práctica' : weekTask[w] ?? '' };
});

export type Session = { id?: string; day?: number; date: string; practice: string; seconds: number; comfort: number; dizzy: boolean; noHold: boolean };
export type Competency = { technique: boolean; tolerance: boolean };
