// SPM Pelvic Floor Lab — motor de audio local (voz oficial Lenny, HeyGen).
// Un solo <audio> reutilizado: se activa con el gesto del usuario (iOS) y garantiza
// que nunca suenen dos pistas a la vez (narración y cues no se mezclan).
// Sin TTS del navegador. Sin archivo = silencio + texto visible.
import { useSyncExternalStore } from 'react';

export type AudioKind = 'narration' | 'cue';
type Entry = { src: string; kind: AudioKind; duration: number };

// Duraciones de los MP3 locales (segundos). Narrativos ya a 0.95x desde HeyGen; cues a 1x.
const N = (id: string, d: number): [string, Entry] => [id, { src: `audio/pf/${id}.mp3`, kind: 'narration', duration: d }];
const C = (id: string, d: number): [string, Entry] => [id, { src: `audio/pf/${id}.mp3`, kind: 'cue', duration: d }];

export const AUDIO_MANIFEST: Record<string, Entry> = Object.fromEntries([
  N('pf.s01.welcome', 7.57551), N('pf.s02.map', 7.88898), N('pf.s03.awareness', 8.724898), N('pf.s04.breath', 5.773061),
  N('pf.s05.relax', 6.661224), N('pf.s06.technique', 7.209796), N('pf.s07.guided', 6.817959), N('pf.s08.coordination', 6.086531),
  N('pf.s09.fine', 6.060408), N('pf.s10.transfer', 7.836735), N('pf.s11.overload', 6.452245), N('pf.s12.library', 6.582857),
  N('pf.s13.plan', 7.340408), N('pf.s14.progress', 4.780408), N('pf.s15.safety', 4.884898), N('pf.s16.close', 5.407347),
  C('pf.cue.percibe', 0.940408), C('pf.cue.respira', 1.07102), C('pf.cue.suelta', 1.018776), C('pf.cue.exhala-eleva', 1.410612),
  C('pf.cue.inhala-suelta', 1.541224), C('pf.cue.rapida', 0.809796), C('pf.cue.suelta-rapida', 1.018776), C('pf.cue.contrae', 1.227755),
  C('pf.cue.sosten', 1.044898), C('pf.cue.suelta-total', 1.619592),
]);

export const hasAudio = (id: string) => !!AUDIO_MANIFEST[id];

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
type State = { id: string | null; status: AudioStatus };
let state: State = { id: null, status: 'idle' };
const subs = new Set<() => void>();
function set(s: State) { state = s; subs.forEach((f) => f()); }

let el: HTMLAudioElement | null = null;
let token = 0;
function getEl() {
  if (el || typeof window === 'undefined') return el;
  el = new Audio();
  el.preload = 'auto'; el.hidden = true; el.dataset.pfPlayer = '1'; document.body.appendChild(el);
  el.addEventListener('ended', () => { if (state.status === 'playing') set({ id: state.id, status: 'idle' }); });
  el.addEventListener('error', () => { if (state.id && state.status !== 'idle') set({ id: state.id, status: 'error' }); });
  return el;
}

let preloaded = false;
export function preloadCues() {
  if (preloaded || typeof window === 'undefined') return; preloaded = true;
  for (const [, e] of Object.entries(AUDIO_MANIFEST)) {
    if (e.kind !== 'cue') continue;
    const a = new Audio(); a.preload = 'auto'; a.src = e.src; a.load();
  }
}

/** Reproduce un ID. Detiene cualquier otra pista. Devuelve false si no existe o play() falla. */
export async function playAudio(id: string): Promise<boolean> {
  const e = AUDIO_MANIFEST[id]; const a = getEl();
  if (!e || !a) return false;
  const my = ++token;
  a.pause();
  a.src = e.src; a.playbackRate = 1; a.currentTime = 0;
  set({ id, status: 'loading' });
  try {
    await a.play();
    if (my !== token) return false;
    set({ id, status: 'playing' }); return true;
  } catch {
    if (my !== token) return false;
    set({ id, status: 'error' }); return false;
  }
}
export function pauseAudio() { if (el && ['playing', 'loading'].includes(state.status)) { token++; el.pause(); set({ id: state.id, status: 'paused' }); } }
export async function resumeAudio() {
  const a = getEl(); if (!a || state.status !== 'paused') return;
  const my = ++token;
  try { await a.play(); if (my === token) set({ id: state.id, status: 'playing' }); }
  catch { if (my === token) set({ id: state.id, status: 'error' }); }
}
export function stopAudio() {
  token++;
  if (el) { el.pause(); try { el.currentTime = 0; } catch { /* ignore */ } }
  if (state.status !== 'idle' || state.id) set({ id: null, status: 'idle' });
}

export function useAudioState(): State {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => state, () => state);
}

let sequenceActive = false;
const seqSubs = new Set<() => void>();
export function setSequenceActive(value: boolean) {
  sequenceActive = value; seqSubs.forEach(f => f());
}
export function useSequenceActive() {
  return useSyncExternalStore(f => { seqSubs.add(f); return () => seqSubs.delete(f); }, () => sequenceActive);
}
