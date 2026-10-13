import { useSyncExternalStore } from 'react';
import { getAudioState, getServerAudioState, subscribeAudio } from './breath-audio';
export function useBreathAudio() {
  return useSyncExternalStore(subscribeAudio, getAudioState, getServerAudioState);
}
