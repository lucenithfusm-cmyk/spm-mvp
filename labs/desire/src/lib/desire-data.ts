// SPM Desire Activation Lab — content, stable IDs and evaluation logic (browser-local only).
export type Unit = 'week' | 'month' | 'year';
export type Tri = 'yes' | 'no' | 'unsure' | '';
export type Origin = 'lab' | 'library' | 'dailyPlan' | 'route' | 'cycle';
export type Recommendation = 'continue' | 'continue-review-modifiers' | 'clinical-review';
export type Metrics = { desire: number; frequency: number; fantasies: number; erections: number; energy: number; closeness: number; satisfaction: number; pressure: number };
export type MetricsN = Record<keyof Metrics, number | null>; // null = N/A / sin dato
export type CheckIn = { day: 'D0' | 'D14' | 'D28'; date: string; metrics: MetricsN; accelUseful: string[]; brakesActive: string[] };

export type DesireState = {
  baseline: { desire: number; energy: number; mood: number; stress: number; sleep: number; confidence: number; satisfaction: number };
  freqBefore: { value: number; unit: Unit }; freqNow: { value: number; unit: Unit };
  fantasiesNow: Tri; fantasiesTrend: '' | 'down' | 'same' | 'up'; enjoyment: '' | 'yes' | 'no' | 'sometimes';
  stimuli: string[]; tasks: boolean[]; favorableNote: string; consent: boolean;
  zones: string[];
  fantasyFreq: string; fantasyContentChanged: Tri;
  health: string[];
  morning: Tri; night: Tri; quality: '' | 'down' | 'same' | 'up'; maintain: Tri; onset: '' | '<3m' | '3-12m' | '>1y' | 'unknown';
  rel: { communication: number; closeness: number; satisfaction: number; connection: number }; talked: string;
  barriers: string[]; pressure: number;
  accelerators: string[]; brakes: string[]; context: string; weekly: string;
  partner: string[];
  distress: boolean; otherClinical: boolean;
  actions: string[];
  checkins: CheckIn[];
  practiceLog: Record<string, { done: number; before: number | null; after: number | null }>;
  domainsAt?: Record<string, string>;
};

export const initialState: DesireState = {
  baseline: { desire: 5, energy: 5, mood: 5, stress: 5, sleep: 5, confidence: 5, satisfaction: 5 },
  freqBefore: { value: 2, unit: 'week' }, freqNow: { value: 2, unit: 'month' },
  fantasiesNow: '', fantasiesTrend: '', enjoyment: '',
  stimuli: [], tasks: [false, false, false], favorableNote: '', consent: false,
  zones: [], fantasyFreq: '', fantasyContentChanged: '', health: [],
  morning: '', night: '', quality: '', maintain: '', onset: '',
  rel: { communication: 5, closeness: 5, satisfaction: 5, connection: 5 }, talked: '',
  barriers: [], pressure: 4, accelerators: [], brakes: [], context: '', weekly: '', partner: [],
  distress: false, otherClinical: false, actions: [], checkins: [], practiceLog: {},
};

export const STORAGE = { state: 'spm-desire-state', profile: 'spm-desire-profile', step: 'spm-desire-step', origin: 'spm-desire-origin', today: 'spm-desire-today' };

export const screens = [
  'Bienvenida', 'Qué es el deseo', 'Mitos y realidades', 'Cómo te sientes hoy', 'Frecuencia sexual', 'Qué te excita', 'Zonas y estímulos', 'Fantasías', 'Salud general', 'Función eréctil y deseo',
  'Relación y comunicación', 'Barreras al deseo', 'Mapa personal del deseo', 'Con tu pareja', 'Revisión profesional', 'Plan de acción', 'Seguimiento', 'Mensaje final', 'Progreso', 'Biblioteca',
];
const slug = ['welcome', 'what-is-desire', 'myths', 'baseline', 'frequency', 'arousal', 'zones', 'fantasies', 'health', 'erectile', 'relationship', 'barriers', 'desire-map', 'partner', 'review', 'action-plan', 'follow-up', 'closing', 'progress', 'reminder'];
// Stable audio IDs for future Lenny assets (no browser TTS).
export const audioId = (n: number) => `des.s${String(n).padStart(2, '0')}.${slug[n - 1]}`;
export const cueId = (name: string) => `des.cue.${name}`;

// Slots for existing SPM library videos. src stays null until the real asset is linked — nothing is simulated.
export const videoSlots: Record<string, { id: string; path: string; src: string | null; title: string }> = {
  health: { id: 'spm.video.metabolic-health', path: 'library/health/metabolic', src: null, title: 'Salud metabólica y medicamentos' },
  stress: { id: 'spm.video.anxiety-stress', path: 'library/performance-anxiety/stress', src: null, title: 'Ansiedad y estrés' },
  desire: { id: 'spm.video.desire-education', path: 'library/desire/education', src: null, title: 'Cómo funciona el deseo' },
};

export const stimuliOpts = [['visual', 'Estímulos visuales'], ['tactile', 'Táctiles'], ['auditory', 'Auditivos'], ['fantasy', 'Fantasías / imaginación'], ['foreplay', 'Juego previo'], ['slow', 'Contacto lento'], ['zones', 'Zonas erógenas'], ['context', 'Contexto / ambiente'], ['verbal', 'Estímulo verbal']] as const;
export const zoneOpts = [['neck', 'Cuello / orejas', 50, 17], ['chest', 'Pecho / pezones', 50, 31], ['back', 'Espalda', 30, 36], ['abdomen', 'Abdomen', 50, 43], ['genital', 'Zona genital', 50, 54], ['glutes', 'Glúteos', 70, 52], ['thighs', 'Muslos', 42, 65], ['massage', 'Masajes', 26, 24], ['other', 'Otras', 74, 24]] as const;
export const fantasyOpts = ['Nunca', 'Rara vez', 'A veces', 'Frecuente', 'Muy frecuente'];
export const healthOpts = [['fatigue', 'Cansancio o fatiga de energía'], ['postmeal', 'Somnolencia después de comer'], ['strength', 'Disminución de la fuerza física'], ['muscle', 'Pérdida de masa muscular'], ['fat', 'Aumento de grasa corporal'], ['weight', 'Aumento de peso'], ['mood', 'Cambios de humor, tristeza o irritabilidad'], ['work', 'Menor rendimiento en el trabajo'], ['interest', 'Menor interés en actividades deportivas / cotidianas'], ['sleep', 'Problemas del sueño'], ['height', 'Sensación de pérdida de estatura'], ['hair', 'Caída notable del vello corporal'], ['meds', 'Uso o cambio reciente de medicamentos'], ['rapid', 'Cambio marcado del deseo en poco tiempo'], ['other', 'Otros']] as const;
export const barrierOpts = [['stress', 'Estrés'], ['tired', 'Cansancio / falta de sueño'], ['routine', 'Rutina / monotonía'], ['conflict', 'Conflictos'], ['meds', 'Medicamentos'], ['alcohol', 'Alcohol / sustancias'], ['health', 'Salud general'], ['pressure', 'Presión por rendimiento'], ['age', 'Cambios relacionados con la edad'], ['other', 'Otros']] as const;
export const accelOpts = ['Tiempo sin prisa', 'Juego previo largo', 'Contacto lento', 'Ambiente cuidado', 'Fantasía / imaginación', 'Estímulo visual', 'Palabras / voz', 'Descanso previo', 'Novedad', 'Cercanía emocional', 'Humor y complicidad', 'Actividad física'];
export const brakeOpts = ['Estrés laboral', 'Cansancio', 'Rutina', 'Discusiones', 'Pantallas antes de dormir', 'Alcohol', 'Miedo a fallar', 'Falta de privacidad', 'Prisa', 'Preocupaciones', 'Dolor o malestar', 'Autoexigencia'];
export const partnerOpts = [['talk', 'Hablar sin juicio'], ['newstim', 'Explorar nuevos estímulos'], ['foreplay', 'Más juego previo'], ['contexts', 'Diferentes contextos / ambientes'], ['consent', 'Consentimiento e interés mutuo'], ['discover', 'Descubrir qué aumenta el deseo de tu pareja']] as const;
export const actionOpts = [['stress', 'Reducir estrés / mejorar sueño'], ['stimuli', 'Incorporar nuevos estímulos'], ['talk', 'Hablar con mi pareja'], ['foreplay', 'Más tiempo de juego previo'], ['fantasy', 'Explorar fantasías'], ['food', 'Mejorar alimentación'], ['exercise', 'Realizar actividad física'], ['context', 'Crear contexto favorable'], ['other', 'Otra acción']] as const;

export const perMonth = (f: { value: number; unit: Unit }) => (f.unit === 'week' ? f.value * 4.33 : f.unit === 'year' ? f.value / 12 : f.value);
export const freqChange = (s: DesireState) => {
  const b = perMonth(s.freqBefore), n = perMonth(s.freqNow);
  if (b <= 0) return null;
  return Math.round(((n - b) / b) * 100);
};

export type Evaluation = { rec: Recommendation; reasons: string[]; urgent: boolean };
export function evaluate(s: DesireState): Evaluation {
  const h = new Set(s.health), reasons: string[] = [];
  const ch = freqChange(s);
  const markedDrop = (ch !== null && ch <= -50) || h.has('rapid') || (s.baseline.desire <= 3 && s.fantasiesTrend === 'down');
  const spontLoss = s.morning === 'yes' || s.night === 'yes';
  const physical = ['strength', 'muscle', 'hair', 'fat', 'height', 'fatigue'].filter((k) => h.has(k)).length;
  const moodSleep = ['mood', 'sleep', 'interest', 'work'].filter((k) => h.has(k)).length;
  const erectileChange = s.quality === 'down' || s.maintain === 'yes';
  const meds = h.has('meds') || s.barriers.includes('meds');
  const recentOnset = s.onset === '<3m' || s.onset === '3-12m';
  if (meds) reasons.push('Cambio en el deseo o la función sexual junto a uso o cambio de medicamentos. No suspendas ni cambies medicación por tu cuenta.');
  if (markedDrop && (spontLoss || physical + moodSleep >= 2)) reasons.push('Caída marcada del deseo combinada con otros cambios físicos o de ánimo.');
  if (spontLoss && physical >= 2) reasons.push('Menos erecciones espontáneas junto a cambios en fuerza, masa muscular, vello u otros.');
  if (erectileChange && recentOnset) reasons.push('Cambio reciente e importante en la función eréctil.');
  if (h.has('rapid')) reasons.push('Cambio brusco del deseo en poco tiempo.');
  if (spontLoss && erectileChange && physical + moodSleep >= 2) reasons.push('Menos erecciones espontáneas y cambio de firmeza junto a varios síntomas físicos o de ánimo: el patrón puede justificar valoración médica y estudios según criterio profesional.');
  if ((h.has('fatigue') && h.has('sleep') || s.baseline.energy <= 2) && physical >= 2) reasons.push('Cansancio o sueño marcados combinados con otros síntomas físicos.');
  if (s.distress) reasons.push('El cambio te genera malestar significativo.');
  if (s.otherClinical) reasons.push('Aparición de otros síntomas clínicos nuevos.');
  const urgent = s.health.includes('acute');
  if (urgent || reasons.length) return { rec: 'clinical-review', reasons, urgent };
  const mild = s.health.filter((k) => k !== 'other').length > 0 || s.barriers.length > 0 || erectileChange || (ch !== null && ch < -25);
  return mild ? { rec: 'continue-review-modifiers', reasons: ['Hay factores leves o de contexto (estrés, sueño, rutina, energía) que conviene revisar.'], urgent } : { rec: 'continue', reasons: [], urgent };
}

export const recText: Record<Recommendation, [string, string]> = {
  continue: ['Continúa el laboratorio', 'No aparecen señales clínicas relevantes. Sigue explorando tu patrón y registra tu evolución.'],
  'continue-review-modifiers': ['Continúa y revisa modificadores', 'Sigue con las prácticas y presta atención a sueño, estrés, energía y contexto. Si persisten o aumentan, consulta.'],
  'clinical-review': ['Conviene una valoración médica', 'La combinación de señales puede justificar una valoración médica y estudios según criterio profesional. SPM no diagnostica.'],
};

export function buildProfile(s: DesireState) {
  const e = evaluate(s);
  const pick = (ids: string[]) => s.stimuli.filter((x) => ids.includes(x));
  return {
    desireBaseline: s.baseline.desire,
    sexualFrequencyBefore: s.freqBefore, sexualFrequencyNow: s.freqNow,
    fantasiesFrequency: s.fantasyFreq, fantasiesTrend: s.fantasiesTrend,
    morningErections: s.morning, nightErections: s.night,
    erectionQualityTrend: s.quality, erectionMaintenanceTrend: s.maintain,
    accelerators: s.accelerators, brakes: s.brakes,
    visualStimuli: pick(['visual', 'fantasy']), tactileStimuli: pick(['tactile', 'slow', 'foreplay', 'zones']), verbalStimuli: pick(['verbal', 'auditory']),
    erogenousZones: s.zones, favorableContexts: [s.context, s.favorableNote].filter(Boolean),
    partnerHelpfulFactors: s.partner,
    moodEnergySignals: s.health.filter((k) => ['fatigue', 'postmeal', 'mood', 'sleep', 'interest', 'work'].includes(k)),
    healthReviewSignals: s.health.filter((k) => ['strength', 'muscle', 'fat', 'weight', 'height', 'hair', 'meds', 'rapid', 'other', 'acute'].includes(k)),
    relationshipScores: s.rel,
    recommendation: e.rec,
  };
}

export function metricsD0(s: DesireState): Metrics {
  const fi = fantasyOpts.indexOf(s.fantasyFreq);
  let er = 7 - (s.morning === 'yes' ? 2 : 0) - (s.night === 'yes' ? 1 : 0) - (s.quality === 'down' ? 2 : 0) + (s.quality === 'up' ? 1 : 0);
  er = Math.max(0, Math.min(10, er));
  return {
    desire: s.baseline.desire, frequency: Math.round(perMonth(s.freqNow) * 10) / 10, fantasies: fi < 0 ? 0 : fi,
    erections: er, energy: Math.round((s.baseline.energy + s.baseline.mood) / 2), closeness: Math.round((s.rel.closeness + s.rel.communication) / 2),
    satisfaction: s.baseline.satisfaction, pressure: s.pressure,
  };
}

export const metricLabels: [keyof Metrics, string, number][] = [
  ['desire', 'Nivel de deseo', 10], ['frequency', 'Frecuencia (al mes)', 30], ['fantasies', 'Fantasías (0–4)', 4], ['erections', 'Erecciones espontáneas / firmeza', 10],
  ['energy', 'Energía / ánimo', 10], ['closeness', 'Comunicación / cercanía', 10], ['satisfaction', 'Disfrute / satisfacción', 10], ['pressure', 'Presión por rendimiento', 10],
];

export const library = [
  ['Mapa aceleradores / frenos', 13], ['Autoexploración', 6], ['Zonas erógenas', 7], ['Fantasías', 8], ['Contexto favorable', 'context'], ['Sensate Focus', 'sensate'], ['Comunicación', 11], ['Plan personal', 16], ['Revisión de barreras', 12],
] as const;

/** Integer day 1–28; NaN/Infinity/strings/decimals never crash. */
export const clampDay = (x: unknown): number => { const n = Math.round(Number(x)); return Number.isFinite(n) ? Math.min(28, Math.max(1, n)) : 1; };

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const numIn = (x: unknown, d: number, lo = 0, hi = 10) => (typeof x === 'number' && Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : d);
const strArr = (x: unknown) => (Array.isArray(x) ? x.filter((y): y is string => typeof y === 'string') : []);
const pick = <T extends string>(x: unknown, ok: readonly T[], d: T): T => (ok.includes(x as T) ? (x as T) : d);
const freq = (x: unknown, d: { value: number; unit: Unit }) => isObj(x) ? { value: numIn(x['value'], d.value, 0, 99), unit: pick(x['unit'], ['week', 'month', 'year'] as const, d.unit) } : d;
const metricKeysAll: (keyof Metrics)[] = ['desire', 'frequency', 'fantasies', 'erections', 'energy', 'closeness', 'satisfaction', 'pressure'];
const tri = ['yes', 'no', 'unsure', ''] as const;
/** Deep tolerant normalizer for saved state and Performance Map. Keeps every valid field; invalid shapes fall back to defaults. */
export function normalizeState(raw: unknown, base: DesireState = initialState): DesireState {
  if (!isObj(raw)) return { ...base };
  const r = raw, b = isObj(r['baseline']) ? r['baseline'] : {}, rel = isObj(r['rel']) ? r['rel'] : {};
  const str = (k: string, d: string) => (typeof r[k] === 'string' ? (r[k] as string) : d);
  const checkins: CheckIn[] = (Array.isArray(r['checkins']) ? r['checkins'] : []).filter(isObj).filter((c) => c['day'] === 'D14' || c['day'] === 'D28').map((c) => {
    const m = isObj(c['metrics']) ? c['metrics'] : {};
    return { day: c['day'] as 'D14' | 'D28', date: typeof c['date'] === 'string' ? c['date'] : '', metrics: Object.fromEntries(metricKeysAll.map((k) => [k, typeof m[k] === 'number' && Number.isFinite(m[k]) ? m[k] : null])) as MetricsN, accelUseful: strArr(c['accelUseful']), brakesActive: strArr(c['brakesActive']) };
  });
  const pl = isObj(r['practiceLog']) ? r['practiceLog'] : {};
  const practiceLog = Object.fromEntries(Object.entries(pl).filter(([, v]) => isObj(v)).map(([k, v]) => { const o = v as Record<string, unknown>; return [k, { done: numIn(o['done'], 0, 0, 1e4), before: typeof o['before'] === 'number' ? o['before'] : null, after: typeof o['after'] === 'number' ? o['after'] : null }]; }));
  const bb = base.baseline;
  return {
    ...base,
    baseline: { desire: numIn(b['desire'], bb.desire), energy: numIn(b['energy'], bb.energy), mood: numIn(b['mood'], bb.mood), stress: numIn(b['stress'], bb.stress), sleep: numIn(b['sleep'], bb.sleep), confidence: numIn(b['confidence'], bb.confidence), satisfaction: numIn(b['satisfaction'], bb.satisfaction) },
    freqBefore: freq(r['freqBefore'], base.freqBefore), freqNow: freq(r['freqNow'], base.freqNow),
    fantasiesNow: pick(r['fantasiesNow'], tri, base.fantasiesNow), fantasiesTrend: pick(r['fantasiesTrend'], ['', 'down', 'same', 'up'] as const, base.fantasiesTrend),
    enjoyment: pick(r['enjoyment'], ['', 'yes', 'no', 'sometimes'] as const, base.enjoyment),
    stimuli: 'stimuli' in r ? strArr(r['stimuli']) : base.stimuli,
    tasks: Array.isArray(r['tasks']) ? [0, 1, 2].map((i) => (r['tasks'] as unknown[])[i] === true) : base.tasks,
    favorableNote: str('favorableNote', base.favorableNote), consent: typeof r['consent'] === 'boolean' ? r['consent'] : base.consent,
    zones: 'zones' in r ? strArr(r['zones']) : base.zones, fantasyFreq: str('fantasyFreq', base.fantasyFreq), fantasyContentChanged: pick(r['fantasyContentChanged'], tri, base.fantasyContentChanged),
    health: 'health' in r ? strArr(r['health']) : base.health,
    morning: pick(r['morning'], tri, base.morning), night: pick(r['night'], tri, base.night), quality: pick(r['quality'], ['', 'down', 'same', 'up'] as const, base.quality), maintain: pick(r['maintain'], tri, base.maintain),
    onset: pick(r['onset'], ['', '<3m', '3-12m', '>1y', 'unknown'] as const, base.onset),
    rel: { communication: numIn(rel['communication'], base.rel.communication), closeness: numIn(rel['closeness'], base.rel.closeness), satisfaction: numIn(rel['satisfaction'], base.rel.satisfaction), connection: numIn(rel['connection'], base.rel.connection) },
    talked: str('talked', base.talked), barriers: 'barriers' in r ? strArr(r['barriers']) : base.barriers, pressure: numIn(r['pressure'], base.pressure),
    accelerators: 'accelerators' in r ? strArr(r['accelerators']) : base.accelerators, brakes: 'brakes' in r ? strArr(r['brakes']) : base.brakes,
    context: str('context', base.context), weekly: str('weekly', base.weekly), partner: 'partner' in r ? strArr(r['partner']) : base.partner,
    distress: r['distress'] === true || (r['distress'] === undefined && base.distress), otherClinical: r['otherClinical'] === true || (r['otherClinical'] === undefined && base.otherClinical),
    actions: 'actions' in r ? strArr(r['actions']) : base.actions,
    checkins: 'checkins' in r ? checkins : base.checkins, practiceLog: 'practiceLog' in r ? practiceLog : base.practiceLog,
    ...(isObj(r['domainsAt']) ? { domainsAt: Object.fromEntries(Object.entries(r['domainsAt']).filter(([, v]) => typeof v === 'string')) as Record<string, string> } : base.domainsAt ? { domainsAt: base.domainsAt } : {}),
  };
}

