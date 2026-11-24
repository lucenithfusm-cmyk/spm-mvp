import { claimPlayback, registerPlayback } from './breath-playback';
import manifest from '@/assets/audio/lenny-manifest.json';
import dailyInstructions from '@/assets/audio/daily-instructions-manifest.json';
import practicalGuidance from '@/assets/audio/practical-guidance-manifest.json';
// SPM official voice: Lenny — Clear & Professional (HeyGen, voice 050c403a43e047c796f8a6257ed2533e, 0.95x).
// The approved HeyGen assets and exact IDs are preserved in lenny-manifest.json.
// Prefer the approved recordings. If playback fails, read the same approved text
// with the device's standard Spanish voice (policy approved on 2026-11-17).
export const audioFiles: Record<string, string> = {
  ...Object.fromEntries(manifest.entries.map(({ id, url }) => [id, url])),
  ...Object.fromEntries(dailyInstructions.entries.map(({ id, url }) => [id, url])),
  ...Object.fromEntries(practicalGuidance.entries.map(({ id, url }) => [id, url])),
};
const audioText: Record<string, string> = Object.fromEntries([
  ...manifest.entries,
  ...dailyInstructions.entries,
  ...practicalGuidance.entries,
].map(({ id, text }) => [id, text]));

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
let player: HTMLAudioElement | null = null;
let playerWindow: Window | null = null;
let utterance: SpeechSynthesisUtterance | null = null;
let utteranceWindow: Window | null = null;
let currentEnd: (() => void) | undefined;
let generation = 0;
const useDeviceVoice = new Set<string>();
let voiceWindow: Window | null = null;
const audioOwner = {};
registerPlayback(audioOwner, stopAudio);

export function hasAudio(id: string) {
  return Boolean(audioFiles[id]);
}

export function stopAudio() {
  generation++;
  const previous = current;
  const previousUtterance = utterance;
  const synthesis = utteranceWindow?.speechSynthesis;
  const notify = currentEnd;
  current = null;
  utterance = null;
  utteranceWindow = null;
  currentEnd = undefined;
  if (previous) { previous.pause(); previous.onended = null; previous.onerror = null; }
  if (previousUtterance) {
    previousUtterance.onend = null; previousUtterance.onerror = null;
    try { synthesis?.cancel(); } catch { /* A closing document can revoke speech access. */ }
  }
  update({ id: null });
  notify?.();
}

function deviceVoice(id: string, token: number): boolean {
  if (token !== generation || state.muted) return false;
  const synthesis = window.speechSynthesis;
  if (!audioText[id] || !synthesis || typeof window.SpeechSynthesisUtterance !== 'function') return false;
  try {
    const spoken = new window.SpeechSynthesisUtterance(audioText[id]);
    spoken.lang = 'es-CO'; spoken.rate = 1; spoken.pitch = 1; spoken.volume = 1;
    // No voice name or gender is forced: keep the device's standard Spanish voice.
    utterance = spoken; utteranceWindow = window;
    spoken.onend = () => { if (token === generation && utterance === spoken) stopAudio(); };
    spoken.onerror = () => {
      if (token !== generation || utterance !== spoken) return;
      stopAudio();
      update({ error: 'No se pudo iniciar la voz. Pulsa de nuevo el botón de audio para escuchar la guía.' });
    };
    synthesis.cancel();
    if (synthesis.paused) synthesis.resume();
    synthesis.speak(spoken);
    return true;
  } catch {
    if (utterance) { utterance.onend = null; utterance.onerror = null; }
    utterance = null; utteranceWindow = null;
    return false;
  }
}

function mediaPlayer(): HTMLAudioElement {
  // Reuse the element activated by the first tap. WebKit grants playback
  // permission per element; replacing it for every breathing phase loses that.
  if (!player || playerWindow !== window) {
    player?.remove?.();
    player = new window.Audio(); playerWindow = window;
    player.preload = 'auto'; player.hidden = true;
    player.setAttribute?.('data-breath-audio', '');
    player.setAttribute?.('aria-hidden', 'true');
    if (player.nodeType === 1) document.body.appendChild(player);
  }
  return player;
}

/** Start on the user's tap; keep recorded narration, video and phase cues exclusive. */
export function playAudio(id: string, onEnd?: () => void, owner: object = audioOwner): boolean {
  const src = audioFiles[id];
  if (state.muted || typeof window === 'undefined') return false;
  if (voiceWindow !== window) { useDeviceVoice.clear(); voiceWindow = window; }
  if (!src) { update({ error: 'Audio oficial no disponible. Puedes seguir el texto.' }); return false; }
  claimPlayback(owner);
  stopAudio();
  const token = generation;
  currentEnd = onEnd;
  update({ id, error: null });
  if (useDeviceVoice.has(id) && deviceVoice(id, token)) return true;
  let failed = false;
  const fail = () => {
    if (failed || token !== generation) return;
    failed = true;
    if (current) { current.onended = null; current.onerror = null; current.pause(); current = null; }
    useDeviceVoice.add(id);
    if (deviceVoice(id, token)) return;
    stopAudio();
    update({ error: 'No se pudo reproducir la voz. Reintenta escuchar o continúa con la guía visual.' });
  };
  try {
    const a = mediaPlayer();
    a.src = src; a.playbackRate = 1; a.muted = false; a.defaultMuted = false; a.volume = 1;
    current = a;
    a.onended = () => { if (token === generation && current === a) stopAudio(); };
    a.onerror = fail;
    a.play()?.catch(fail);
  } catch { fail(); }
  return true;
}
