// Browser-safe exclusive playback coordination; no network or speech synthesis.
const participants = new Map<object, () => void>();
export function registerPlayback(owner: object, pause: () => void) {
  participants.set(owner, pause);
  return () => { participants.delete(owner); };
}
export function claimPlayback(owner: object) {
  for (const [other, pause] of participants) if (other !== owner) pause();
}
