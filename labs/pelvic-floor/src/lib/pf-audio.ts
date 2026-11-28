// Current policy 2026-11-27: one standard device voice, approved text preserved.
import { useSyncExternalStore } from 'react';
import approvedTexts from './pf-narration-texts.json';
export type AudioKind = 'narration' | 'cue';
export const AUDIO_MANIFEST = Object.fromEntries(Object.entries(approvedTexts).map(([id, text]) => [id, {text, kind: id.includes('.cue.') ? 'cue' : 'narration'}]));
export const hasAudio = (id: string) => !!AUDIO_MANIFEST[id];
export type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
type State = {id: string | null; status: AudioStatus};
let state: State = {id: null, status: 'idle'};
const subs = new Set<() => void>();
function set(value: State) { state = value; subs.forEach(f => f()); }
let token = 0;
export function preloadCues() { /* Device voices are loaded by the common coordinator; no recordings. */ }
export async function playAudio(id: string): Promise<boolean> {
 const entry = AUDIO_MANIFEST[id]; if (!entry) return false;
 stopAudio(); const request = token;
 set({id, status: 'loading'});
 if (!window.SPM_VOICE) { set({id, status: 'error'}); return false; }
 return window.SPM_VOICE.listen(entry.text, {lang: 'es-CO',
  onstate: ({state: value}) => { if (request !== token) return; const status = ({preparing:'loading',playing:'playing',paused:'paused',error:'error',ended:'idle',stopped:'idle'} as Record<string,AudioStatus>)[value] || 'idle'; set({id,status}); },
  oncancel: () => { if (request === token) set({id:null,status:'idle'}); },
 });
}
export function pauseAudio() { window.SPM_VOICE?.pause(); }
export async function resumeAudio() { window.SPM_VOICE?.resume(); }
export function stopAudio() { token++; if (state.id && state.status !== 'idle') window.SPM_VOICE?.cancel(); set({id:null,status:'idle'}); }
export function useAudioState(): State { return useSyncExternalStore(f => {subs.add(f);return () => subs.delete(f);}, () => state, () => state); }
let sequenceActive = false;
const seqSubs = new Set<() => void>();
export function setSequenceActive(value: boolean) {
  sequenceActive = value; seqSubs.forEach(f => f());
}
export function useSequenceActive() {
  return useSyncExternalStore(f => { seqSubs.add(f); return () => seqSubs.delete(f); }, () => sequenceActive);
}
