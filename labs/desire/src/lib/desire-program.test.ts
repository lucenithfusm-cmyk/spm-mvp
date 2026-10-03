import { describe, expect, it } from 'vitest';
import { curriculum } from './desire-curriculum';
import { generateToday, practices, interpret } from './desire-engine';
import { initialState, evaluate, type DesireState } from './desire-data';
import { bestActivators, canCompleteDay, dayStatus, freezeBaseline, initialProgram, migrateProgram, moveRank, sensateIOk, upsertSession, type Session } from './desire-program';

const S = (o: Partial<DesireState>): DesireState => ({ ...initialState, ...o });
const sess = (o: Partial<Session>): Session => ({ id: 'x', day: 1, date: '2026-10-03', practiceId: 'presence-5', variant: 'solo', status: 'completed', activeSec: 300, metricKey: 'pressure', before: null, after: null, reflection: '', ...o });

describe('curriculum', () => {
  it('has 28 distinct days in 4 phases, every practice resolvable', () => {
    expect(curriculum).toHaveLength(28);
    expect(new Set(curriculum.map((d) => d.title)).size).toBe(28);
    expect(new Set(curriculum.map((d) => d.objective)).size).toBe(28);
    expect([...new Set(curriculum.map((d) => d.phase))]).toEqual(['ENTENDER', 'ENTRENAR', 'APLICAR', 'CONSOLIDAR']);
    for (const d of curriculum) if (!d.practiceId.startsWith('@')) expect(practices[d.practiceId], d.practiceId).toBeTruthy();
    expect(curriculum.filter((d) => d.desireSpecific).map((d) => d.day)).toEqual([5, 8, 10, 12, 13, 15, 16, 18, 19, 20, 22, 24, 27, 28]);
  });
  it('generateToday uses the day: days 1/8/16/22/28 differ for the same profile, max 3', () => {
    const s = S({ stimuli: ['visual', 'tactile'], pressure: 7 });
    const mains = [1, 8, 16, 22, 28].map((d) => generateToday(s, d, { best: ['visual-explore'] }));
    for (const m of mains) expect(m.length).toBeLessThanOrEqual(3);
    expect(new Set(mains.map((m) => m[0]!.practiceId)).size).toBe(5);
  });
  it('sensate II requires completed phase I', () => {
    expect(generateToday(S({}), 19, { sensateIOk: false })[0]!.practiceId).toBe('sensate-1');
    expect(generateToday(S({}), 19, { sensateIOk: true })[0]!.practiceId).toBe('sensate-2');
    expect(sensateIOk(upsertSession(initialProgram, sess({ practiceId: 'sensate-1', status: 'paused' })))).toBe(false);
  });
  it('no partner-only tasks without partner; acute blocks everything', () => {
    const s = S({ freqBefore: { value: 3, unit: 'week' }, freqNow: { value: 1, unit: 'month' } });
    expect(generateToday(s, 10, { hasPartner: false }).some((c) => c.practiceId === 'reconnect-gradual')).toBe(false);
    expect(generateToday(s, 10, { acute: true })).toEqual([]);
  });
});

describe('5 QA profiles + extra → different prudent routes, max 3', () => {
  const profiles: Record<string, DesireState> = {
    visualTactileStress: S({ stimuli: ['visual', 'tactile'], barriers: ['stress'], pressure: 8 }),
    responsivePartner: S({ baseline: { ...initialState.baseline, desire: 3 }, rel: { communication: 3, closeness: 3, satisfaction: 5, connection: 4 } }),
    lowFreqFantasies: S({ freqBefore: { value: 3, unit: 'week' }, freqNow: { value: 1, unit: 'month' }, fantasiesNow: 'yes', fantasyFreq: 'Frecuente' }),
    erectionPhysical: S({ morning: 'yes', night: 'yes', quality: 'down', health: ['strength', 'muscle', 'hair'] }),
    medsSudden: S({ health: ['meds', 'rapid'] }),
    noData: S({}),
    highStress: S({ pressure: 10, baseline: { ...initialState.baseline, stress: 10 } }),
  };
  it('routes', () => {
    const r = Object.fromEntries(Object.entries(profiles).map(([k, s]) => [k, interpret(s)]));
    for (const x of Object.values(r)) expect(x.assignedPractices.length).toBeLessThanOrEqual(3);
    expect(r['erectionPhysical']!.evaluation.rec).toBe('clinical-review');
    expect(r['medsSudden']!.evaluation.rec).toBe('clinical-review');
    for (const k of ['erectionPhysical', 'medsSudden']) expect(r[k]!.assignedPractices.every((id) => practices[id]!.safe)).toBe(true);
    expect(r['highStress']!.assignedPractices).toContain('micro-regulation');
    const keys = new Set(Object.values(r).slice(0, 5).map((x) => x.assignedPractices.join() + x.evaluation.rec + x.clinicalReviewReason.join()));
    expect(keys.size).toBe(5);
    expect(evaluate(S({ health: ['postmeal'] })).rec).not.toBe('clinical-review');
    expect(JSON.stringify(r)).not.toMatch(/déficit|testosterona baja/i);
  });
});

describe('program persistence', () => {
  it('migrates garbage without throwing and keeps sessions, dedupes ids', () => {
    expect(migrateProgram('nope').sessions).toEqual([]);
    const m = migrateProgram({ sessions: [sess({ id: 'a' }), sess({ id: 'a', after: 3 }), { bad: 1 }], ranking: ['1', '2', '3', '4', '5', '6'], influence: { stress: 0, x: 'bad' } });
    expect(m.sessions).toHaveLength(1);
    expect(m.ranking).toHaveLength(5);
    expect(m.influence['stress']).toBe(0);
    expect(m.influence['x']).toBeNull();
  });
  it('baseline freezes and null ≠ 0', () => {
    const p = freezeBaseline(initialProgram, { desire: 0, pressure: null }, '2026-10-01');
    expect(p.baseline!.metrics.desire).toBe(0);
    expect(p.baseline!.metrics.pressure).toBeNull();
    const p2 = freezeBaseline(upsertSession(p, sess({})), { desire: 9 });
    expect(p2.baseline!.metrics.desire).toBe(0);
  });
  it('idempotent sessions, no auto-completed day', () => {
    let p = upsertSession(initialProgram, sess({ id: 's1', status: 'paused' }));
    p = upsertSession(p, sess({ id: 's1', status: 'paused' }));
    expect(p.sessions).toHaveLength(1);
    expect(dayStatus(p, 1)).toBe('in-progress');
    expect(canCompleteDay(p, 1, 'lab', 1)).toBe(false);
    p = upsertSession(p, sess({ id: 's1', status: 'completed' }));
    expect(canCompleteDay(p, 1, 'lab', 1)).toBe(true);
    expect(canCompleteDay(p, 1, 'dailyPlan', 2)).toBe(false);
    expect(dayStatus(p, 1)).toBe('in-progress');
    expect(dayStatus(initialProgram, 5)).toBe('pending');
  });
  it('ranking moves and best activators use real data', () => {
    expect(moveRank(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b']);
    expect(moveRank(['a'], 0, -1)).toEqual(['a']);
    let p = upsertSession(initialProgram, sess({ id: '1', practiceId: 'visual-explore', metricKey: 'desire', before: 3, after: 7 }));
    p = upsertSession(p, sess({ id: '2', practiceId: 'sensate-1', metricKey: 'satisfaction', before: 4, after: 5 }));
    p = upsertSession(p, sess({ id: '3', practiceId: 'fantasy-private', metricKey: 'fantasies', before: null, after: 9 }));
    expect(bestActivators(p)).toEqual(['visual-explore', 'sensate-1']);
  });
});

