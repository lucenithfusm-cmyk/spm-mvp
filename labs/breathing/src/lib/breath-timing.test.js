import { describe, expect, test } from 'vitest';
import { advancePractice, phaseAt, sessionLength } from './breath-timing';
const base = { inhale: 4, hold: 2, exhale: 6 };
const noHold = { inhale: 4, hold: 0, exhale: 6 };
describe('SPM practice rules', () => {
  test('4·2·6 phases last exactly 4, 2 and 6 seconds', () => {
    expect(phaseAt(0, base)).toMatchObject({ phase: 'inhale', left: 4 });
    expect(phaseAt(4, base)).toMatchObject({ phase: 'hold', left: 2 });
    expect(phaseAt(6, base)).toMatchObject({ phase: 'exhale', left: 6 });
    expect(phaseAt(12, base)).toMatchObject({ phase: 'inhale', left: 4 });
  });
  test('4·6 skips retention', () => {
    expect(phaseAt(4, noHold)).toMatchObject({ phase: 'exhale', left: 6 });
    expect(phaseAt(10, noHold).phase).toBe('inhale');
  });
  for (const pattern of [base, noHold]) for (const duration of [120, 300]) {
    test(`${duration}s session stays exact for hold=${pattern.hold}`, () => {
      expect(sessionLength(pattern, duration, 5)).toBe(duration);
      expect(advancePractice(duration * 1000 - 100, 5000, true, true, duration)).toBe(duration * 1000);
    });
  }
  test('hidden tab never contributes practice time', () => {
    expect(advancePractice(4000, 60000, true, false, 120)).toBe(4000);
  });
  test('pause never contributes practice time', () => {
    expect(advancePractice(4000, 60000, false, true, 120)).toBe(4000);
  });
  test('five base cycles and three rescue cycles retain their lengths', () => {
    expect(sessionLength(base, undefined, 5)).toBe(60);
    expect(sessionLength(noHold, undefined, 3)).toBe(30);
  });
});
