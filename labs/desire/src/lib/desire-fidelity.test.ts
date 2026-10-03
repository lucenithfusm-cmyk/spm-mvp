import { describe, expect, it } from 'vitest';
import { generateToday, adapt, adherence, deltas, personalLines, practices, normalizeRankId } from './desire-engine';
import { initialState, normalizeState, clampDay, type DesireState, type MetricsN } from './desire-data';
import { baselineMetrics, continuity, freezeBaseline, initialProgram, migrateProgram, pendingAttempt, sensateGate, upsertSession, type Session } from './desire-program';
import { curriculum } from './desire-curriculum';

const S = (o: Partial<DesireState> = {}): DesireState => ({ ...initialState, ...o });
const sess = (o: Partial<Session>): Session => ({ id: 'x', day: 1, date: '2026-10-03', practiceId: 'presence-5', variant: 'solo', status: 'completed', activeSec: 300, metricKey: 'pressure', before: null, after: null, reflection: '', ...o });
const N = (o: Partial<MetricsN>): MetricsN => ({ desire: null, frequency: null, fantasies: null, erections: null, energy: null, closeness: null, satisfaction: null, pressure: null, ...o });

describe('1 ranking ids + profile', () => {
  it('legacy Spanish label and new id both drive Day 9', () => {
    expect(generateToday(S(), 9, { ranking: ['Ver a mi pareja (si aplica)'], hasPartner: true })[0]!.practiceId).toBe('visual-explore');
    expect(generateToday(S(), 9, { ranking: ['partner-visual'], hasPartner: true })[0]!.practiceId).toBe('visual-explore');
  });
  it('changing priority changes the main practice', () => {
    expect(generateToday(S(), 9, { ranking: ['fantasy', 'touch'] })[0]!.practiceId).toBe('fantasy-private');
    expect(generateToday(S(), 9, { ranking: ['touch', 'fantasy'] })[0]!.practiceId).toBe('sensory-focus');
    expect(generateToday(S(), 9, { ranking: ['words'] })[0]!.whyAssigned).toMatch(/puesto 1 es «Palabras sugerentes»/);
  });
  it('migration maps labels to ids and keeps preferences beyond top 5', () => {
    const m = migrateProgram({ ranking: ['Masajes', 'Fantasías', 'touch', 'words', 'foreplay', 'ambience'], rankPrefs: ['other'] });
    expect(m.ranking).toEqual(['massage', 'fantasy', 'touch', 'words', 'foreplay']);
    expect(m.rankPrefs).toContain('ambience');
    expect(m.rankPrefs).toContain('other');
    expect(normalizeRankId('Otras')).toBe('other');
  });
  it('details / brakes / nextPractice feed selection and visible personalization', () => {
    expect(generateToday(S(), 9, { personal: { details: { verbal: ['Susurros', 'Tono de voz'] } } })[0]!.practiceId).toBe('verbal-script');
    const c = generateToday(S({ pressure: 2 }), 3, { personal: { brake: ['Miedo a fallar'] } });
    expect(c.find((x) => x.practiceId === 'micro-regulation')?.whyAssigned).toMatch(/Miedo a fallar/);
    const t = generateToday(S({ pressure: 2 }), 10, { hasPartner: false, personal: { nextPractice: 'talk' } });
    expect(t.find((x) => x.practiceId === 'communicate-limits')?.whyAssigned).toMatch(/individual/);
    const L = personalLines('sensory-focus', S({ zones: ['neck'] }), { details: { tactile: ['Caricias lentas', 'Presión'] } });
    expect(L.join()).toMatch(/Caricias lentas, Presión/);
    expect(personalLines('context-design', S({ accelerators: ['Novedad'] }), { conditions: ['Más tiempo'], accel: ['Descanso'] }).join()).toMatch(/Más tiempo.*Descanso, Novedad/s);
  });
});

describe('2 baseline + adaptation', () => {
  it('partial baseline survives and diffs only where both exist', () => {
    const p = freezeBaseline(initialProgram, { desire: 3, pressure: 7, closeness: null });
    const b = baselineMetrics(p)!;
    expect(b.desire).toBe(3); expect(b.closeness).toBeNull();
    expect(deltas(b, N({ desire: 5, closeness: 8 }))).toEqual({ desire: 2 });
    expect(baselineMetrics(freezeBaseline(initialProgram, {}))).toBeNull();
  });
  it('no baseline → insufficient, never substitutes current state', () => {
    const s = S({ checkins: [{ day: 'D14', date: '', metrics: N({ desire: 9 }), accelUseful: [], brakesActive: [] }] });
    expect(adapt(s, null)!.mode).toBe('insufficient');
    expect(adapt(s, null)!.deltas).toEqual({});
  });
  it('completed sessions count for adherence, paused/interrupted do not', () => {
    const ids = ['presence-5'];
    expect(adherence(S(), ids, [{ practiceId: 'presence-5', status: 'paused' }, { practiceId: 'presence-5', status: 'interrupted' }])).toBe(0);
    expect(adherence(S(), ids, [{ practiceId: 'presence-5', status: 'completed' }])).toBe(33);
    expect(adherence(S({ practiceLog: { 'presence-5': { done: 1, before: 1, after: 2 } } }), ids, [{ practiceId: 'presence-5', status: 'completed' }])).toBe(67);
  });
  it('single favorable point is not maintenance', () => {
    let p = freezeBaseline(initialProgram, { desire: 3, satisfaction: 3 });
    expect(continuity(p, false, N({ desire: 6, satisfaction: 6 })).kind).toBe('adapted');
    for (const i of [1, 2, 3]) p = upsertSession(p, sess({ id: 'c' + i }));
    expect(continuity(p, false, N({ desire: 6, satisfaction: 6 })).kind).toBe('maintenance');
    expect(continuity(p, false, N({ desire: 6 })).kind).toBe('adapted');
    expect(continuity(initialProgram, false, N({ desire: 6 })).kind).toBe('insufficient');
  });
});

describe('3 metrics + attempts', () => {
  it('labels that are not Metrics keys are local', () => {
    for (const id of ['map-select', 'evidence-confidence', 'if-then', 'activation-plan', 'desire-curve', 'continuity-goals']) expect(practices[id]!.metric).toBe('local');
    expect(practices['fantasy-private']!.metric).toBe('fantasies');
    expect(migrateProgram({ sessions: [sess({ id: 'a', metricKey: 'desire' })] }).sessions[0]!.metricKey).toBe('desire');
  });
  it('paused attempt is restorable with active time; upsert is idempotent', () => {
    let p = upsertSession(initialProgram, sess({ id: 'a', day: 19, practiceId: 'sensate-1', status: 'paused', activeSec: 42 }));
    p = upsertSession(p, sess({ id: 'a', day: 19, practiceId: 'sensate-1', status: 'paused', activeSec: 42 }));
    expect(p.sessions).toHaveLength(1);
    expect(pendingAttempt(p, 'sensate-1', 19)!.activeSec).toBe(42);
    expect(pendingAttempt(p, 'sensate-1', 18)).toBeUndefined();
  });
});

describe('4 sensate gate', () => {
  const s = S({ pressure: 3 });
  it('requires completed + comfortable===true; numbers, N/A or absence never open; pressure blocks', () => {
    expect(sensateGate(upsertSession(initialProgram, sess({ practiceId: 'sensate-1' })), s, false).ok).toBe(false);
    expect(sensateGate(upsertSession(initialProgram, sess({ practiceId: 'sensate-1', comfort: 10 })), s, false).ok).toBe(false);
    expect(sensateGate(upsertSession(initialProgram, sess({ practiceId: 'sensate-1', comfortable: null })), s, false).ok).toBe(false);
    expect(sensateGate(upsertSession(initialProgram, sess({ practiceId: 'sensate-1', comfortable: false, comfort: 9 })), s, false).ok).toBe(false);
    const ok = upsertSession(initialProgram, sess({ practiceId: 'sensate-1', comfortable: true, comfort: 2 }));
    expect(sensateGate(ok, s, false).ok).toBe(true);
    expect(sensateGate(ok, S({ pressure: 8 }), false).ok).toBe(false);
    expect(sensateGate(ok, s, true).ok).toBe(false);
    expect(sensateGate(upsertSession(initialProgram, sess({ practiceId: 'sensate-1', comfortable: true, status: 'paused' })), s, false).ok).toBe(false);
  });
  it('migration keeps comfort number and does not infer comfortable', () => {
    const p = migrateProgram({ sessions: [{ id: 'a', day: 16, practiceId: 'sensate-1', status: 'completed', comfort: 8 }, { id: 'b', day: 16, practiceId: 'sensate-1', status: 'completed', comfortable: 'yes' }] });
    expect(p.sessions[0]!.comfort).toBe(8); expect(p.sessions[0]!.comfortable).toBeUndefined();
    expect(p.sessions[1]!.comfortable).toBeNull();
    expect(sensateGate(p, s, false).ok).toBe(false);
  });
  it('engine never returns sensate-2 with stale flag and pressure 9', () => {
    const ids = (x: any, d: number, o: any) => generateToday(x, d, o).map((c) => c.practiceId);
    expect(ids({ ...S({}), pressure: 9 }, 19, { sensateIOk: true })).not.toContain('sensate-2');
    expect(ids({ ...S({}), pressure: 9 }, 22, { sensateIOk: true, best: ['sensate-2', 'visual-explore'] })).not.toContain('sensate-2');
    expect(ids({ ...S({}), pressure: 2, health: ['acute'] }, 19, { sensateIOk: true })).not.toContain('sensate-2');
  });
  it('day 22 keeps both best activators, then modifier, max 3', () => {
    const st = { ...S({}), pressure: 8, rel: { ...S({}).rel, communication: 2 } };
    const r = generateToday(st, 22, { best: ['visual-explore', 'fantasy-private'], hasPartner: true }).map((c) => c.practiceId);
    expect(r.slice(0, 2)).toEqual(['visual-explore', 'fantasy-private']);
    expect(r.length).toBeLessThanOrEqual(3);
    expect(r[2]).toBe('micro-regulation');
    const one = generateToday(st, 22, { best: ['visual-explore'], hasPartner: true });
    expect(one[0]!.whyAssigned).toMatch(/Solo hay 1 activador/);
  });
});

describe('5 recovered content', () => {
  it('desire curve has six fields; continuity max 2; mood levels migrate', () => {
    expect(practices['desire-curve']!.fields!.map((f) => f[0])).toEqual(['desire', 'curiosity', 'openness', 'enjoyment', 'pressure', 'connection']);
    expect(migrateProgram({ continuity: { goals: ['a', 'b', 'c'] } }).continuity.goals).toHaveLength(2);
    const m = migrateProgram({ moodLevels: { fatigue: 0, sadness: null, x: 'bad' }, mood: ['Tristeza'] });
    expect(m.moodLevels['fatigue']).toBe(0); expect(m.moodLevels['sadness']).toBeNull(); expect(m.mood).toEqual(['Tristeza']);
    expect(curriculum[25]!.resources).toContain('r:continuity');
    for (const id of ['map-select', 'pattern-observe', 'intimacy-ladder', 'repertoire-try']) expect(practices[id]!.resourceLinks?.length).toBeGreaterThan(0);
    for (const id of ['visual-explore', 'sensory-focus', 'verbal-script', 'fantasy-private', 'responsive-window', 'reconnect-gradual', 'pleasure-lowpressure', 'micro-regulation', 'lifestyle-modifiers', 'connection-talk']) { const p = practices[id]!; expect(p.purpose && p.prep && p.observe && p.exit, id).toBeTruthy(); expect(p.steps.length).toBeGreaterThan(1); }
  });
});

describe('6 robustness', () => {
  it('days never crash', () => {
    for (const d of [2.5, NaN, Infinity, -3, 999, '7', 'abc', null]) expect(() => generateToday(S(), d)).not.toThrow();
    expect(clampDay(2.5)).toBe(3); expect(clampDay(NaN)).toBe(1); expect(clampDay(999)).toBe(28); expect(clampDay(Infinity)).toBe(1);
    expect(migrateProgram({ labDay: 'x', sessions: [sess({ id: 'z', day: 1e9 as number })] }).sessions[0]!.day).toBe(28);
  });
  it('DesireState normalizer tolerates null / bad shapes and keeps good data', () => {
    expect(normalizeState(null).freqBefore).toEqual(initialState.freqBefore);
    const n = normalizeState({ freqBefore: null, freqNow: { value: 3, unit: 'month' }, checkins: [null, { day: 'D14', metrics: { desire: 4, pressure: 'x' } }, { day: 'D99' }], stimuli: 'bad', zones: ['neck', 3], practiceLog: { a: { done: 2 } }, baseline: null });
    expect(n.freqBefore).toEqual(initialState.freqBefore); expect(n.freqNow).toEqual({ value: 3, unit: 'month' });
    expect(n.checkins).toHaveLength(1); expect(n.checkins[0]!.metrics.desire).toBe(4); expect(n.checkins[0]!.metrics.pressure).toBeNull();
    expect(n.stimuli).toEqual([]); expect(n.zones).toEqual(['neck']); expect(n.practiceLog['a']!.done).toBe(2);
    const merged = normalizeState({ stimuli: ['visual'] }, normalizeState({ zones: ['chest'], stimuli: ['tactile'] }));
    expect(merged.zones).toEqual(['chest']); expect(merged.stimuli).toEqual(['visual']);
    expect(() => adapt(n, null)).not.toThrow();
  });
});

