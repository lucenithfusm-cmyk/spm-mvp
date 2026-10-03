import { centralStorage, centralContext } from '@/lib/central';
// SPM cadence layer: the central engine evaluates before Day 1; this Lab reuses that data and asks at most a 1–3 question micro-check.
import { clampDay, type DesireState } from './desire-data';
const lsSet = (k: string, v: string) => { try { centralStorage.setItem(k, v); } catch { /* blocked/quota */ } };
const lsGet = (k: string) => { try { return centralStorage.getItem(k); } catch { return null; } };

export type Domain = 'frequency' | 'fantasies' | 'accelBrakes' | 'relationship' | 'erections' | 'health';
export type AssessmentEntry = { date: string; module: string; kind: 'full' | 'micro' | 'checkpoint' };
export const CADENCE = { day: 'spm-program-day', log: 'spm-assessment-log', map: 'spm-performance-map' };
const RECENT_DAYS = 30;
const todayStr = () => new Date().toISOString().slice(0, 10);

export const domainOf: Partial<Record<keyof DesireState, Domain>> = {
  freqBefore: 'frequency', freqNow: 'frequency', fantasiesNow: 'fantasies', fantasiesTrend: 'fantasies', fantasyFreq: 'fantasies',
  stimuli: 'accelBrakes', accelerators: 'accelBrakes', brakes: 'accelBrakes', barriers: 'accelBrakes', pressure: 'accelBrakes',
  rel: 'relationship', morning: 'erections', night: 'erections', quality: 'erections', maintain: 'erections', health: 'health',
};

/** Data present = stamped recently, or carried in from the pre-Day-1 SPM evaluation. */
export function known(s: DesireState & { domainsAt?: Record<string, string> }, d: Domain): boolean {
  const at = s.domainsAt?.[d];
  if (at) return (Date.now() - new Date(at).getTime()) / 864e5 <= RECENT_DAYS;
  switch (d) {
    case 'frequency': return false;
    case 'fantasies': return !!(s.fantasiesNow || s.fantasyFreq);
    case 'accelBrakes': return s.stimuli.length + s.accelerators.length + s.brakes.length + s.barriers.length > 0;
    case 'relationship': return false;
    case 'erections': return !!(s.morning || s.night || s.quality);
    case 'health': return s.health.length > 0;
  }
}

/** Only domains that actually change the practice decision: safety (health), drivers and brakes. Max 3. */
export const decisionDomains: Domain[] = ['health', 'accelBrakes'];
export function microQuestions(s: DesireState): ('health' | 'stimuli' | 'pressure')[] {
  const q: ('health' | 'stimuli' | 'pressure')[] = [];
  if (!known(s, 'health')) q.push('health');
  if (!known(s, 'accelBrakes')) q.push('stimuli', 'pressure');
  return q.slice(0, 3);
}

export function readLog(): AssessmentEntry[] { try { const v = JSON.parse(lsGet(CADENCE.log) || '[]'); return Array.isArray(v) ? v.filter((e) => e && typeof e.date === 'string' && typeof e.module === 'string') : []; } catch { return []; } }
export function logAssessment(kind: AssessmentEntry['kind']) {
  lsSet(CADENCE.log, JSON.stringify([...readLog(), { date: todayStr(), module: 'desire', kind }]));
}
export function programDay(): number { return clampDay(centralContext().day); }

/** Whether a micro-check block may run today. Never a full evaluation from dailyPlan. */
export function canMicroCheck(day: number): { ok: boolean; reason: string } {
  if (day === 14 || day === 28) return { ok: false, reason: `Día ${day}: usamos el checkpoint central de SPM, sin evaluación adicional.` };
  const t = readLog().filter((e) => e.date === todayStr());
  if (t.some((e) => e.module === 'anxiety')) return { ok: false, reason: 'Hoy ya hubo evaluación de Ansiedad/Confianza: hoy solo entrenamos.' };
  if (t.length) return { ok: false, reason: 'Hoy ya hubo un bloque de evaluación: hoy solo entrenamos.' };
  return { ok: true, reason: '' };
}

/** Merge a Performance Map published by the central SPM engine (pre-Day-1 evaluation), if present. */
export function readPerformanceMap(): Partial<DesireState> | null {
  try { const r = lsGet(CADENCE.map); const v = r ? JSON.parse(r) : null; return v && typeof v === 'object' && !Array.isArray(v) ? v : null; } catch { return null; }
}

