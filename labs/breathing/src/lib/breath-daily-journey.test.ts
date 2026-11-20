import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, test } from 'vitest';
import type { DailyActivity } from './central';
import { getDailyBreathingJourney } from './breath-daily-journey';

const window = {} as { SPM_DAILY_SUPPORT: { activity: (lab: string, day: number, context: object) => DailyActivity | null } };
runInNewContext(readFileSync(new URL('../../../../premium-v2/daily-support-plan-v1.js', import.meta.url), 'utf8'), { window });
const assignment = (day: number, primary = 'erection') => window.SPM_DAILY_SUPPORT.activity('breathing', day, { primary });

test('presentation routes cover the real assignments without changing the shared calendar or source steps', () => {
  for (const primary of ['erection', 'ejaculation', 'desire']) {
    const assignedDays: number[] = [];
    for (let day = 1; day <= 28; day++) {
      const activity = assignment(day, primary);
      const before = JSON.stringify(activity);
      const journey = getDailyBreathingJourney(activity);
      expect(JSON.stringify(activity)).toBe(before);
      if (activity) {
        assignedDays.push(day);
        expect(journey).not.toBeNull();
        expect(journey!.practice.step).toBe(activity.steps.at(-1));
        expect(journey!.stages).toHaveLength(4);
      } else expect(journey).toBeNull();
    }
    expect(assignedDays).toEqual(primary === 'erection' ? [1, 3, 6, 10, 13, 17, 20, 24, 27] : [3, 6, 10, 13, 17, 20, 24, 27]);
  }
});

test.each([
  [1, 'release', { step: 10, id: 'rescue', cycles: 3, lockNoHold: true }],
  [3, 'recognize', { step: 4, id: 'core-426', cycles: 5, showBelly: true, lockNoHold: true }],
  [6, 'release', { step: 9, id: 'pelvic-release', durationSec: 60, showBelly: true }],
  [10, 'recognize', { step: 11, id: 'session-2', durationSec: 120 }],
  [13, 'release', { step: 10, id: 'rescue', cycles: 3, lockNoHold: true }],
  [17, 'recognize', { step: 8, id: 'arousal', durationSec: 60 }],
  [20, 'release', { step: 7, id: 'downregulate', durationSec: 60 }],
  [24, 'recognize', { step: 11, id: 'session-2', durationSec: 120 }],
  [27, 'release', { step: 11, id: 'session-2', durationSec: 120 }],
] as const)('day %s keeps its assigned practice identity, timing and retention rule', (day, variant, practice) => {
  const journey = getDailyBreathingJourney(assignment(day))!;
  expect(journey.variant).toBe(variant);
  expect(journey.practice).toEqual(practice);
  expect(journey.instructionAudioId).toBe([1, 3, 13].includes(day) ? 'instruction.daily.4-6' : 'instruction.daily.flexible');
  expect(journey.fullDemonstration).toBe(day === 3);
  expect(journey.regulationVideo).toBe(day === 20);
});

test('unknown assignments and unsupported final steps cannot silently select another practice', () => {
  const activity = assignment(3)!;
  expect(getDailyBreathingJourney({ ...activity, id: 'future-assignment' })).toBeNull();
  expect(getDailyBreathingJourney({ ...activity, id: 'toString' })).toBeNull();
  expect(getDailyBreathingJourney({ ...activity, steps: [] })).toBeNull();
  expect(getDailyBreathingJourney({ ...activity, steps: [3, 12] })).toBeNull();
});

test('malformed assignments are rejected without throwing or using their untrusted day', () => {
  const valid = assignment(3)!;
  for (const malformed of [
    undefined, null, [], {}, 3, 'breath-learn',
    { ...valid, steps: null }, { ...valid, steps: '3,4' }, { ...valid, steps: [3, '4'] },
    { ...valid, day: 0 }, { ...valid, day: 29 }, { ...valid, day: 3.5 }, { ...valid, day: NaN },
    { ...valid, title: null }, { ...valid, summary: {} }, { ...valid, minutes: Infinity },
  ]) expect(getDailyBreathingJourney(malformed)).toBeNull();
});
