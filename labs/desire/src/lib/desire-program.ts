import { centralStorage, centralContext } from '@/lib/central';
// SPM Desire 28-day program state: frozen baseline, sessions diary, detailed map/ranking, recovered resources.
// Stored under spm-desire-program; never deletes legacy spm-desire-* keys. Pure helpers are unit-tested.
import { practices, normalizeRankId } from './desire-engine';
import { clampDay, type DesireState, type Metrics, type MetricsN } from './desire-data';

export const PROGRAM_KEY = 'spm-desire-program';
export type Num = number | null; // null = sin dato / N/A (distinto de 0)
export type SessionStatus = 'completed' | 'paused' | 'interrupted';
export type Session = { id: string; day: number; date: string; practiceId: string; variant: 'solo' | 'partner'; status: SessionStatus; activeSec: number; metricKey: keyof Metrics | 'local'; metricLabel?: string; before: Num; after: Num; reflection: string; comfort?: Num; comfortable?: boolean | null; ready?: boolean; extra?: Record<string, Num> };
export type Baseline = { at: string; metrics: Record<keyof Metrics, Num> };
export type Program = {
  v: 2;
  baseline: Baseline | null;
  sessions: Session[];
  dayDone: Record<string, string>;
  labDay: number;
  hasPartner: 'yes' | 'no' | 'na';
  influence: Record<string, Num>;
  details: Record<string, string[]>; detailNotes: Record<string, string>;
  ranking: string[]; rankPrefs: string[];
  map: { accel: string[]; brake: string[]; suggestions: string };
  conditions: string[]; routineStep: number;
  partnerTask: { moment: string; findings: string; agreed: string; consent: boolean; solo: string };
  ideasLog: Record<string, Num>;
  age: { still: string; needs: string; helps: string };
  meds: string[]; medsChange: string;
  mood: string[]; acute: boolean;
  ladder: number;
  nextPractice: string;
  checkpoints: Record<string, { at: string; source: 'central' | 'lab-sim' }>;
  moodLevels: Record<string, Num>;
  continuity: { goals: string[]; keep: string; space: string };
};

export const metricKeys: (keyof Metrics)[] = ['desire', 'frequency', 'fantasies', 'erections', 'energy', 'closeness', 'satisfaction', 'pressure'];
export const initialProgram: Program = {
  v: 2, baseline: null, sessions: [], dayDone: {}, labDay: 1, hasPartner: 'na', influence: {}, details: {}, detailNotes: {},
  ranking: [], rankPrefs: [], map: { accel: [], brake: [], suggestions: '' }, conditions: [], routineStep: 0,
  partnerTask: { moment: '', findings: '', agreed: '', consent: false, solo: '' }, ideasLog: {}, age: { still: '', needs: '', helps: '' },
  meds: [], medsChange: '', mood: [], acute: false, ladder: 0, nextPractice: '', checkpoints: {}, moodLevels: {}, continuity: { goals: [], keep: '', space: '' },
};

const arr = (x: unknown): string[] => (Array.isArray(x) ? x.filter((y) => typeof y === 'string') : []);
const num = (x: unknown): Num => (typeof x === 'number' && isFinite(x) ? x : null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const obj = (x: unknown): any => (x && typeof x === 'object' && !Array.isArray(x) ? (x as Record<string, unknown>) : {});
const str = (x: unknown) => (typeof x === 'string' ? x : '');

/** Deep, lossless migration with validation. Unknown/invalid fields fall back to defaults. */
export function migrateProgram(raw: unknown): Program {
  const r = obj(raw), b = obj(r.baseline), bm = obj(b.metrics), pt = obj(r.partnerTask), m = obj(r.map), ag = obj(r.age);
  const recNum = (x: unknown) => Object.fromEntries(Object.entries(obj(x)).map(([k, v]) => [k, num(v)]));
  const recArr = (x: unknown) => Object.fromEntries(Object.entries(obj(x)).map(([k, v]) => [k, arr(v)]));
  const recStr = (x: unknown) => Object.fromEntries(Object.entries(obj(x)).map(([k, v]) => [k, str(v)]));
  const sessions: Session[] = (Array.isArray(r.sessions) ? r.sessions : []).map(obj).filter((x: any) => typeof x.id === 'string' && typeof x.practiceId === 'string').map((x: any) => ({
    id: x.id as string, day: clampDay(x.day), date: str(x.date), practiceId: x.practiceId as string,
    variant: x.variant === 'partner' ? 'partner' : 'solo', status: (['completed', 'paused', 'interrupted'].includes(x.status as string) ? x.status : 'interrupted') as SessionStatus,
    activeSec: Math.max(0, Number(x.activeSec) || 0), metricKey: (metricKeys.includes(x.metricKey as keyof Metrics) || x.metricKey === 'local' ? x.metricKey : 'local') as Session['metricKey'],
    ...(typeof x.metricLabel === 'string' ? { metricLabel: x.metricLabel } : {}),
    before: num(x.before), after: num(x.after), reflection: str(x.reflection),
    ...(x.comfort !== undefined ? { comfort: num(x.comfort) } : {}), ...(x.comfortable !== undefined ? { comfortable: typeof x.comfortable === 'boolean' ? x.comfortable : null } : {}), ...(x.ready === true ? { ready: true } : {}),
    ...(x.extra && typeof x.extra === 'object' ? { extra: recNum(x.extra) } : {}),
  }));
  const dedup = [...new Map(sessions.map((s) => [s.id, s])).values()];
  return {
    ...initialProgram, v: 2,
    baseline: b.at ? { at: str(b.at), metrics: Object.fromEntries(metricKeys.map((k) => [k, num(bm[k])])) as Baseline['metrics'] } : null,
    sessions: dedup, dayDone: recStr(r.dayDone), labDay: clampDay(r.labDay),
    hasPartner: r.hasPartner === 'yes' || r.hasPartner === 'no' ? r.hasPartner : 'na',
    influence: recNum(r.influence), details: recArr(r.details), detailNotes: recStr(r.detailNotes),
    ranking: [...new Set(arr(r.ranking).map(normalizeRankId))].slice(0, 5),
    rankPrefs: [...new Set([...arr(r.rankPrefs), ...arr(r.ranking)].map(normalizeRankId))], // items beyond top 5 stay as preferences
    map: { accel: arr(m.accel), brake: arr(m.brake), suggestions: str(m.suggestions) },
    conditions: arr(r.conditions), routineStep: Math.max(0, Math.min(3, Number(r.routineStep) || 0)),
    partnerTask: { moment: str(pt.moment), findings: str(pt.findings), agreed: str(pt.agreed), consent: pt.consent === true, solo: str(pt.solo) },
    ideasLog: recNum(r.ideasLog), age: { still: str(ag.still), needs: str(ag.needs), helps: str(ag.helps) },
    meds: arr(r.meds), medsChange: str(r.medsChange), mood: arr(r.mood), acute: r.acute === true, ladder: Math.max(0, Math.min(3, Number(r.ladder) || 0)),
    nextPractice: str(r.nextPractice),
    moodLevels: recNum(r.moodLevels),
    continuity: { goals: arr(obj(r.continuity).goals).slice(0, 2), keep: str(obj(r.continuity).keep), space: str(obj(r.continuity).space) },
    checkpoints: Object.fromEntries(Object.entries(obj(r.checkpoints)).map(([k, v]) => { const o = obj(v); return [k, { at: str(o.at), source: o.source === 'central' ? 'central' : 'lab-sim' }]; })),
  } as Program;
}
export function loadProgram(): Program {
  try { return migrateProgram(JSON.parse(centralStorage.getItem(PROGRAM_KEY) || '{}')); } catch { return { ...initialProgram }; }
}
export function saveProgram(p: Program) { try { centralStorage.setItem(PROGRAM_KEY, JSON.stringify(p)); } catch { /* storage full/blocked: keep in memory */ } }

/** Freeze baseline once. Later edits never change it. */
export function freezeBaseline(p: Program, m: Partial<Record<keyof Metrics, Num>>, at = new Date().toISOString()): Program {
  if (p.baseline) return p;
  return { ...p, baseline: { at, metrics: Object.fromEntries(metricKeys.map((k) => [k, m[k] ?? null])) as Baseline['metrics'] } };
}
/** Idempotent upsert by session id — double-clicks never create two sessions. */
export function upsertSession(p: Program, s: Session): Program {
  return { ...p, sessions: [...p.sessions.filter((x) => x.id !== s.id), s] };
}
export type DayStatus = 'pending' | 'in-progress' | 'completed';
export function dayStatus(p: Program, day: number): DayStatus {
  if (p.dayDone[day]) return 'completed';
  return p.sessions.some((s) => s.day === day) ? 'in-progress' : 'pending';
}
/** A day may be completed only with a completed session for that day, and (in dailyPlan) only the received day. */
export function canCompleteDay(p: Program, day: number, origin: string, currentDay: number) {
  if (origin === 'dailyPlan' && day !== currentDay) return false;
  return p.sessions.some((s) => s.day === day && s.status === 'completed');
}
/** Single guard for engine, library and URL entry. Phase I completed AND the person explicitly confirmed comfortable === true (N/A/absent never opens; the 0–10 comfort value is never used), pressure < 7, no clinical review/acute. */
export function sensateGate(p: Program, s: Pick<DesireState, 'pressure' | 'health'>, clinical: boolean): { ok: boolean; reason: string } {
  if (p.acute || s.health.includes('acute')) return { ok: false, reason: 'Hay una alerta activa: primero tu seguridad.' };
  if (clinical) return { ok: false, reason: 'Con revisión profesional pendiente no avanzamos a la fase II.' };
  if (s.pressure >= 7) return { ok: false, reason: `Tu presión por rendir está en ${s.pressure}/10: repetimos la fase I.` };
  const comfy = p.sessions.some((x) => x.practiceId === 'sensate-1' && x.status === 'completed' && x.comfortable === true);
  if (!comfy) return { ok: false, reason: 'La fase II se abre cuando la fase I esté completada y y hayas confirmado que te resultó cómoda.' };
  return { ok: true, reason: '' };
}
export const sensateIOk = (p: Program, s: Pick<DesireState, 'pressure' | 'health'> = { pressure: 0, health: [] }, clinical = false) => sensateGate(p, s, clinical).ok;
/** Pending (explicitly paused) attempt for the same practice/day, to resume with its active time. */
export const pendingAttempt = (p: Program, pid: string, day: number) => [...p.sessions].reverse().find((x) => x.practiceId === pid && x.day === day && x.status === 'paused');
/** Best activators by recorded usefulness (after − before), only completed sessions with real data. */
export function bestActivators(p: Program, n = 2): string[] {
  const agg: Record<string, number[]> = {};
  for (const s of p.sessions) if (s.status === 'completed' && s.before !== null && s.after !== null && s.metricKey !== 'pressure' && s.metricKey !== 'local' && practices[s.practiceId] && !practices[s.practiceId]!.reflective) (agg[s.practiceId] ??= []).push(s.after - s.before);
  return Object.entries(agg).map(([id, v]) => [id, v.reduce((a, b) => a + b, 0) / v.length] as const).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, n).map(([id]) => id);
}
/** Frozen (possibly partial) baseline. N/A stays null; null only if there is no baseline or every value is N/A. */
export const baselineMetrics = (p: Program): MetricsN | null => {
  if (!p.baseline) return null;
  const m = p.baseline.metrics; return metricKeys.some((k) => typeof m[k] === 'number') ? (m as MetricsN) : null;
};
export function moveRank(list: string[], i: number, dir: -1 | 1): string[] {
  const j = i + dir; if (j < 0 || j >= list.length) return list;
  const c = [...list]; [c[i], c[j]] = [c[j]!, c[i]!]; return c;
}
export function weekStats(p: Program) {
  return [0, 1, 2, 3].map((w) => {
    const days = Array.from({ length: 7 }, (_, i) => w * 7 + i + 1);
    const ss = p.sessions.filter((s) => days.includes(s.day) && s.status === 'completed');
    const avg = (k: keyof Metrics) => { const v = ss.filter((s) => s.metricKey === k && s.after !== null).map((s) => s.after!); return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : null; };
    return { week: w + 1, done: days.filter((d) => p.dayDone[d]).length, sessions: ss.length, pressure: avg('pressure'), closeness: avg('closeness'), desire: avg('desire'), satisfaction: avg('satisfaction') };
  });
}
/** Day 28 suggestion (revisable) from real data only. Maintenance needs ≥2 improved comparable values AND ≥3 completed sessions — never a single favorable point. */
export function continuity(p: Program, clinical: boolean, latest: MetricsN | null): { kind: 'review' | 'maintenance' | 'adapted' | 'insufficient'; text: string } {
  if (clinical || p.acute) return { kind: 'review', text: 'Sugerencia revisable: revisión profesional antes de continuar con nuevas prácticas.' };
  const b = baselineMetrics(p);
  const both = (k: keyof Metrics) => (b && latest && typeof b[k] === 'number' && typeof latest[k] === 'number' ? (latest[k] as number) - (b[k] as number) : null);
  const ds = (['desire', 'satisfaction', 'closeness', 'pressure'] as const).map((k) => [k, both(k)] as const).filter(([, v]) => v !== null);
  const done = p.sessions.filter((s) => s.status === 'completed').length;
  if (!ds.length) return { kind: 'insufficient', text: 'Sin comparación: falta línea base o checkpoint con valores comparables. Sugerencia revisable: ciclo adaptado y registrar el checkpoint.' };
  const improved = ds.filter(([k, v]) => (k === 'pressure' ? v! <= -1 : v! >= 1)).length;
  if (improved >= 2 && done >= 3) return { kind: 'maintenance', text: `Sugerencia revisable: ${improved} valores mejoraron respecto a tu línea base con ${done} prácticas completadas → mantenimiento con tus mejores activadores.` };
  return { kind: 'adapted', text: `Sugerencia revisable: ${improved} valor(es) mejoraron y ${done} prácticas completadas; no basta para hablar de mantenimiento → nuevo ciclo adaptado (nunca se repite el ciclo 1 igual).` };
}

export const CTX_KEY = 'spm-desire-ctx';
export type NavCtx = { pDay: number; retDay: number; retPractice: string };
export function loadCtx(): NavCtx {
  try { const o = JSON.parse(centralStorage.getItem(CTX_KEY) || '{}'); return { pDay: clampDay(o.pDay), retDay: clampDay(o.retDay), retPractice: typeof o.retPractice === 'string' ? o.retPractice : '' }; } catch { return { pDay: 1, retDay: 1, retPractice: '' }; }
}
export function saveCtx(c: NavCtx) { try { centralStorage.setItem(CTX_KEY, JSON.stringify(c)); } catch { /* ignore */ } }

