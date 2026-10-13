import { expect, test } from 'vitest';
import { anatomyTime } from './breath-anatomy';
import { phaseAt } from './breath-timing';
test('source inhalation maps 0–6 seconds to four seconds of practice', () => {
  expect(anatomyTime('inhale', 0)).toBe(0);
  expect(anatomyTime('inhale', 0.5)).toBe(3);
  expect(anatomyTime('inhale', 1)).toBe(6);
});
test('pause remains on frame six throughout the two-second phase', () => {
  expect(anatomyTime('hold', 0)).toBe(6);
  expect(anatomyTime('hold', 1)).toBe(6);
});
test('source exhalation maps 6–14 seconds to six seconds of practice', () => {
  expect(anatomyTime('exhale', 0)).toBe(6);
  expect(anatomyTime('exhale', 0.5)).toBe(10);
  expect(anatomyTime('exhale', 1)).toBe(14);
});
test('both 4/2/6 and 4/6 begin exhalation at source frame six', () => {
  for (const hold of [2, 0]) {
    const phase = phaseAt(4 + hold, { inhale: 4, hold, exhale: 6 });
    expect(phase.phase).toBe('exhale');
    expect(anatomyTime(phase.phase, phase.progress)).toBe(6);
  }
});
