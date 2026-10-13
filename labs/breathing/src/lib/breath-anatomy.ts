import type { Phase } from './breath-timing';
// Source motion verified at 0, 6 and 14 s. No free-running loop: seek from pacer time.
export function anatomyTime(phase: Phase, progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  return phase === 'inhale' ? 6 * t : phase === 'hold' ? 6 : 6 + 8 * t;
}
