import { claimPlayback, registerPlayback } from './breath-playback';
import manifest from '@/assets/audio/lenny-manifest.json';
// SPM official voice: Lenny — Clear & Professional (HeyGen, voice 050c403a43e047c796f8a6257ed2533e, 0.95x).
// The approved HeyGen assets and exact IDs are preserved in lenny-manifest.json.
// Missing ID = silence + visible text cue. No browser TTS is used, so a female voice can never play under the male trainer.
export const audioFiles: Record<string, string> = {
  ...Object.fromEntries(manifest.entries.map(({ id, url }) => [id, url])),
};

const initial = { muted: false, id: null as string | null, error: null as string | null };
let state = initial;
const listeners = new Set<() => void>();
export const getAudioState = () => state;
export const getServerAudioState = () => initial;
export const subscribeAudio = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
function update(patch: Partial<typeof state>) { state = { ...state, ...patch }; listeners.forEach((listener) => listener()); }
export function setAudioMuted(muted: boolean) { stopAudio(); update({ muted, error: null }); }

export const AUDIO_IDS = {
  screen: (n: number) => `screen.${String(n).padStart(2, '0')}`,
  cue: (phase: 'inhale' | 'hold' | 'exhale' | 'done') => `cue.${phase}`,
  practice: (id: string) => `practice.${id}.intro`,
};

let current: HTMLAudioElement | null = null;
let currentEnd: (() => void) | undefined;
const audioOwner = {};
registerPlayback(audioOwner, stopAudio);

export function hasAudio(id: string) {
  return Boolean(audioFiles[id]);
}

export function stopAudio() {
  const previous = current;
  const notify = currentEnd;
  current = null;
  currentEnd = undefined;
  if (previous) { previous.pause(); previous.onended = null; previous.onerror = null; }
  update({ id: null });
  notify?.();
}

/** Plays only an approved MP3; missing, muted or rejected audio stays silent with visible state. */
export function playAudio(id: string, onEnd?: () => void, owner: object = audioOwner): boolean {
  const src = audioFiles[id];
  if (state.muted || typeof window === 'undefined') return false;
  if (!src) { update({ error: 'Audio oficial no disponible. Puedes seguir el texto.' }); return false; }
  claimPlayback(owner);
  stopAudio();
  const a = new window.Audio(src);
  a.playbackRate = 1;
  current = a;
  currentEnd = onEnd;
  update({ id, error: null });
  const finish = () => { if (current === a) stopAudio(); };
  const fail = () => { if (current !== a) return; stopAudio(); update({ error: 'No se pudo reproducir la voz. Reintenta escuchar o continúa con la guía visual.' }); };
  a.onended = finish;
  a.onerror = fail;
  a.play().catch(fail);
  return true;
}
