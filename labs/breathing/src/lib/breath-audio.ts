import { claimPlayback, registerPlayback } from './breath-playback';
import manifest from '@/assets/audio/lenny-manifest.json';
import dailyInstructions from '@/assets/audio/daily-instructions-manifest.json';
import practicalGuidance from '@/assets/audio/practical-guidance-manifest.json';
import { trainerLines } from './breath-data';
// Current policy 2026-11-27: standard device voice for every narration.
// Historical manifests provide approved text and provenance; URLs are not played.
export const audioFiles: Record<string, string> = {
  ...Object.fromEntries(manifest.entries.map(({ id, url }) => [id, url])),
  ...Object.fromEntries(dailyInstructions.entries.map(({ id, url }) => [id, url])),
  ...Object.fromEntries(practicalGuidance.entries.map(({ id, url }) => [id, url])),
};
const audioText: Record<string, string> = { ...Object.fromEntries([
  ...manifest.entries,
  ...dailyInstructions.entries,
  ...practicalGuidance.entries,
].map(({ id, text }) => [id, text])),
 // The current screen copy is the narration source; historical recordings remain provenance.
 ...Object.fromEntries(trainerLines.map((text, index) => [`screen.${String(index + 1).padStart(2, '0')}`, text])),
 'cue.done': 'Terminó la guía. Respira con naturalidad y registra solo lo que realizaste.',
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

let generation = 0;
let active = false;
const audioOwner = {};
registerPlayback(audioOwner, stopAudio);
export function hasAudio(id: string) { return Boolean(audioText[id]); }
export function stopAudio() {
 generation++; const wasActive = active; active = false;
 if (wasActive) window.SPM_VOICE?.cancel();
 update({ id: null });
}
/** Playback never marks a practice done. onEnd concerns narration only. */
export function playAudio(id: string, onEnd?: () => void, owner: object = audioOwner): boolean {
 if (state.muted || typeof window === 'undefined') return false;
 const text = audioText[id];
 if (!text) { update({ error: 'La guía de voz no está disponible. Puedes seguir el texto.' }); return false; }
 claimPlayback(owner); stopAudio(); const token = generation; active = true;
 update({ id, error: null });
 const voice = window.SPM_VOICE;
 if (!voice) { active = false; update({ id: null, error: 'La voz no está disponible. Puedes seguir las indicaciones escritas.' }); return false; }
 return voice.listen(text, {lang: 'es-CO',
  onstate: ({state: status, message}) => { if (token !== generation) return; if (status === 'error') { active = false; update({id: null, error: message}); } },
  onend: () => { if (token !== generation) return; active = false; update({ id: null }); onEnd?.(); },
  oncancel: () => { if (token !== generation) return; active = false; update({ id: null }); },
 });
}
