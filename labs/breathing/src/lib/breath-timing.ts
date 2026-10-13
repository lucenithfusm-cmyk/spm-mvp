import type { Pattern } from './breath-data';
export type Phase = 'inhale' | 'hold' | 'exhale';
export function sessionLength(pattern: Pattern, durationSec: number | undefined, cycles: number) {
  const length = pattern.inhale + pattern.hold + pattern.exhale;
  return durationSec ? Math.ceil(durationSec / length) * length : cycles * length;
}
export function phaseAt(seconds: number, pattern: Pattern) {
  const length = pattern.inhale + pattern.hold + pattern.exhale;
  const position = seconds % length;
  const phase: Phase = position < pattern.inhale ? 'inhale' : position < pattern.inhale + pattern.hold ? 'hold' : 'exhale';
  const offset = phase === 'inhale' ? position : phase === 'hold' ? position - pattern.inhale : position - pattern.inhale - pattern.hold;
  const progress = offset / pattern[phase];
  return { phase, left: Math.ceil(pattern[phase] - offset), progress, scale: phase === 'inhale' ? .62 + .38 * progress : phase === 'hold' ? 1 : 1 - .38 * progress };
}
export function advancePractice(elapsedMs: number, deltaMs: number, active: boolean, visible: boolean, totalSec: number) {
  return Math.min(totalSec * 1000, elapsedMs + (active && visible ? Math.max(0, deltaMs) : 0));
}
