import { describe, expect, test } from 'vitest';
import { claimPlayback, registerPlayback } from './breath-playback';
import { AUDIO_IDS, audioFiles, playAudio, stopAudio, getAudioState, setAudioMuted } from './breath-audio';
import manifest from '../assets/audio/lenny-manifest.json';

describe('Exclusive SPM playback', () => {
  test('video, narration and practice never remain active together', () => {
    const video = {}, practice = {};
    let videoPaused = false, practicePaused = false;
    const cleanVideo = registerPlayback(video, () => { videoPaused = true; });
    const cleanPractice = registerPlayback(practice, () => { practicePaused = true; });
    claimPlayback(practice);
    expect(videoPaused).toBe(true);
    expect(practicePaused).toBe(false);
    claimPlayback(video);
    expect(practicePaused).toBe(true);
    cleanVideo(); cleanPractice();
  });
  test('exit unregisters playback listeners', () => {
    let calls = 0;
    const unregister = registerPlayback({}, () => { calls++; });
    unregister(); claimPlayback({});
    expect(calls).toBe(0);
  });
  test('Lenny MP3 stop pauses once and detaches callbacks', () => {
    const previous = globalThis.window;
    const sounds = [];
    class FakeAudio {
      constructor() { this.pauses = 0; sounds.push(this); }
      play() { return Promise.resolve(); }
      pause() { this.pauses++; }
    }
    globalThis.window = { Audio: FakeAudio };
    audioFiles['test.lenny'] = '/test-lenny.mp3';
    let ended = 0;
    try {
      expect(playAudio('test.lenny', () => { ended++; })).toBe(true);
      stopAudio(); stopAudio();
      expect(sounds[0].pauses).toBe(1);
      expect(sounds[0].onended).toBe(null);
      expect(ended).toBe(1);
    } finally { delete audioFiles['test.lenny']; globalThis.window = previous; }
  });
  test('missing official MP3 remains silent', () => {
    expect(playAudio(AUDIO_IDS.practice('missing-approved-mp3'))).toBe(false);
  });
  test('all 22 exact approved IDs preserve Lenny provenance and speed', () => {
    expect(manifest.entries.map(e => e.id)).toEqual([
      ...Array.from({ length: 18 }, (_, i) => AUDIO_IDS.screen(i + 1)),
      'cue.inhale', 'cue.hold', 'cue.exhale', 'cue.done',
    ]);
    expect(manifest.voiceId).toBe('050c403a43e047c796f8a6257ed2533e');
    expect(manifest.generationSpeed).toBe(0.95);
    for (const entry of manifest.entries) expect(audioFiles[entry.id]).toBe(entry.url);
  });
  test('mute stops active audio and prevents new cues', () => {
    const previous = globalThis.window;
    const sounds = [];
    class FakeAudio { constructor() { this.pauses = 0; sounds.push(this); } play() { return Promise.resolve(); } pause() { this.pauses++; } }
    globalThis.window = { Audio: FakeAudio };
    try {
      setAudioMuted(false); playAudio('cue.inhale'); setAudioMuted(true);
      expect(sounds[0].pauses).toBe(1);
      expect(playAudio('cue.exhale')).toBe(false);
      expect(sounds.length).toBe(1);
      expect(getAudioState().id).toBe(null);
    } finally { setAudioMuted(false); globalThis.window = previous; }
  });
  test('real play rejection reports error without stale playback', async () => {
    const previous = globalThis.window;
    class FailedAudio { play() { return Promise.reject(new Error('decoder')); } pause() {} }
    globalThis.window = { Audio: FailedAudio };
    try {
      playAudio('cue.inhale'); await Promise.resolve();
      expect(getAudioState().error).toContain('No se pudo reproducir');
      expect(getAudioState().id).toBe(null);
    } finally { stopAudio(); globalThis.window = previous; }
  });
});
