import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { claimPlayback, registerPlayback } from './breath-playback';
import { AUDIO_IDS, audioFiles, playAudio, stopAudio, getAudioState, setAudioMuted } from './breath-audio';
import manifest from '../assets/audio/lenny-manifest.json';
import practicalGuidance from '../assets/audio/practical-guidance-manifest.json';

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
  test('both current daily instructions have separate MP3s and preserve all 22 original recordings', () => {
    const dailyIds = ['instruction.daily.4-6', 'instruction.daily.flexible'];
    expect(Object.keys(audioFiles).sort()).toEqual([...manifest.entries.map(entry => entry.id), ...dailyIds, ...practicalGuidance.entries.map(entry => entry.id)].sort());
    for (const id of dailyIds) {
      expect(audioFiles[id]).toMatch(/\.mp3(?:[?#]|$)/i);
      expect(manifest.entries.some(entry => entry.url === audioFiles[id])).toBe(false);
    }
    expect(audioFiles[dailyIds[0]]).not.toBe(audioFiles[dailyIds[1]]);
    for (const entry of manifest.entries) expect(audioFiles[entry.id]).toBe(entry.url);
  });
  test('the three new guidance recordings preserve the exact scripts, Lenny settings and downloaded MP3 bytes', () => {
    const scripts = {
      'comparison.chest': 'Observa el pecho y los hombros. Se mueven pecho y hombros. Ritmo rápido y corto. Acompaña estrés y tensión.',
      'comparison.diaphragm': 'Observa el abdomen. Se mueve el abdomen. Ritmo lento, exhalación larga. Favorece calma y control.',
      'instruction.prepare': 'Acomódate antes de empezar. Espalda apoyada, hombros sueltos. Sin esfuerzo ni ruido: suave es suficiente. Respirar lento debe sentirse cómodo. Si aparece mareo o malestar, detente y respira normal.',
    };
    const normalize = value => value.normalize('NFC').replace(/[.,:;!?]/g, '').replace(/\s+/g, ' ').trim();
    expect(practicalGuidance.entries.map(entry => entry.id)).toEqual(Object.keys(scripts));
    expect(practicalGuidance.voiceId).toBe(manifest.voiceId);
    expect(practicalGuidance.language).toBe('es');
    expect(practicalGuidance.generationSpeed).toBe(0.95);
    expect(practicalGuidance.playbackRate).toBe(1);
    for (const entry of practicalGuidance.entries) {
      expect(entry.text).toBe(scripts[entry.id]);
      expect(audioFiles[entry.id]).toBe(entry.url);
      expect(entry.url).toMatch(/^audio\/[a-z-]+-20261123\.mp3$/);
      const bytes = readFileSync(new URL('../../public/' + entry.url, import.meta.url));
      expect(bytes.length).toBeGreaterThan(1000);
      expect(bytes.subarray(0, 3).toString() === 'ID3' || bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0).toBe(true);
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(entry.sha256);
      expect(entry.duration).toBeGreaterThanOrEqual(entry.sourceDuration);
      expect(entry.duration - entry.sourceDuration).toBeLessThan(0.1);
      expect(normalize(entry.wordTimestamps.map(word => word.text).join(' '))).toBe(normalize(entry.text));
      expect(entry.wordTimestamps.every((word, index, words) => word.start >= 0 && word.end >= word.start && word.end <= entry.sourceDuration && (!index || word.start + 0.001 >= words[index - 1].end))).toBe(true);
    }
  });
  test('switching comparison narration pauses other media and ignores completion from the prior card', () => {
    const previous = globalThis.window, sounds = [];
    let videoPauses = 0, practicePauses = 0;
    const releaseVideo = registerPlayback({}, () => { videoPauses++; });
    const releasePractice = registerPlayback({}, () => { practicePauses++; });
    class FakeAudio { constructor() { this.pauses = 0; sounds.push(this); } play() { return Promise.resolve(); } pause() { this.pauses++; } }
    globalThis.window = { Audio: FakeAudio };
    try {
      setAudioMuted(false);
      playAudio('comparison.chest');
      expect(videoPauses).toBe(1); expect(practicePauses).toBe(1);
      const oldEnded = sounds[0].onended;
      playAudio('comparison.diaphragm');
      expect(sounds).toHaveLength(1);
      expect(sounds[0].src).toBe(audioFiles['comparison.diaphragm']);
      expect(sounds[0].playbackRate).toBe(1);
      oldEnded();
      expect(getAudioState().id).toBe('comparison.diaphragm');
      claimPlayback({});
      expect(getAudioState().id).toBe(null);
      expect(sounds[0].onended).toBe(null); expect(sounds[0].onerror).toBe(null);
    } finally { releaseVideo(); releasePractice(); stopAudio(); globalThis.window = previous; }
  });
  test.each(practicalGuidance.entries)('$id fallback reads its own exact script and cannot continue after playback is claimed elsewhere', async entry => {
    const previous = globalThis.window, spoken = [];
    let canceled = 0;
    class FailedAudio { play() { return Promise.reject(new Error('media unavailable')); } pause() {} }
    class Utterance { constructor(text) { this.text = text; } }
    globalThis.window = { Audio: FailedAudio, SpeechSynthesisUtterance: Utterance, speechSynthesis: { cancel() { canceled++; }, speak(value) { spoken.push(value); } } };
    try {
      setAudioMuted(false); playAudio(entry.id); await Promise.resolve();
      expect(spoken).toHaveLength(1); expect(spoken[0].text).toBe(entry.text);
      const oldEnd = spoken[0].onend, before = canceled;
      claimPlayback({});
      expect(canceled).toBe(before + 1);
      expect(getAudioState().id).toBe(null); expect(spoken[0].onend).toBe(null); expect(spoken[0].onerror).toBe(null);
      oldEnd();
      expect(spoken).toHaveLength(1); expect(getAudioState().id).toBe(null);
    } finally { stopAudio(); globalThis.window = previous; }
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
  test('successive phase cues reuse the audio element activated by the first tap', () => {
    const previous = globalThis.window, sounds = [], starts = [];
    class MobileAudio {
      constructor() { sounds.push(this); }
      play() { starts.push({ src: this.src, element: this }); return Promise.resolve(); }
      pause() {}
    }
    globalThis.window = { Audio: MobileAudio };
    try {
      setAudioMuted(false);
      for (const phase of ['inhale', 'hold', 'exhale']) playAudio(AUDIO_IDS.cue(phase));
      expect(sounds).toHaveLength(1);
      expect(starts.map(item => item.src)).toEqual(['inhale', 'hold', 'exhale'].map(phase => audioFiles[AUDIO_IDS.cue(phase)]));
      expect(starts.every(item => item.element === sounds[0])).toBe(true);
      expect(sounds[0].muted).toBe(false);
      expect(sounds[0].volume).toBe(1);
      expect(sounds[0].playbackRate).toBe(1);
    } finally { stopAudio(); globalThis.window = previous; }
  });
  test('failed recording reads its exact approved script with the device voice and mute cancels it', async () => {
    const previous = globalThis.window, spoken = [];
    let canceled = 0;
    class FailedAudio { play() { return Promise.reject(new Error('media unavailable')); } pause() {} }
    class Utterance { constructor(text) { this.text = text; this.voice = null; } }
    globalThis.window = { Audio: FailedAudio, SpeechSynthesisUtterance: Utterance, speechSynthesis: { cancel() { canceled++; }, speak(value) { spoken.push(value); } } };
    try {
      setAudioMuted(false); playAudio('screen.01'); await Promise.resolve();
      expect(spoken).toHaveLength(1);
      expect(spoken[0].text).toBe(manifest.entries[0].text);
      expect(spoken[0].lang).toBe('es-CO');
      expect(spoken[0].voice).toBe(null);
      expect(spoken[0].rate).toBe(1);
      expect(getAudioState().id).toBe('screen.01');
      expect(getAudioState().error).toBe(null);
      const before = canceled;
      setAudioMuted(true);
      expect(canceled).toBe(before + 1);
      expect(getAudioState().id).toBe(null);
      expect(playAudio('screen.02')).toBe(false);
      expect(spoken).toHaveLength(1);
    } finally { setAudioMuted(false); globalThis.window = previous; }
  });
  test('retry after device speech is blocked starts directly from the new user tap', async () => {
    const previous = globalThis.window, spoken = [];
    let mediaAttempts = 0;
    class FailedAudio { play() { mediaAttempts++; return Promise.reject(new Error('decode')); } pause() {} }
    class Utterance { constructor(text) { this.text = text; } }
    globalThis.window = { Audio: FailedAudio, SpeechSynthesisUtterance: Utterance, speechSynthesis: { cancel() {}, speak(value) { spoken.push(value); } } };
    try {
      setAudioMuted(false); playAudio('instruction.daily.flexible'); await Promise.resolve();
      spoken[0].onerror({ error: 'not-allowed' });
      expect(getAudioState().error).toContain('Pulsa de nuevo');
      playAudio('instruction.daily.flexible');
      expect(spoken).toHaveLength(2);
      expect(mediaAttempts).toBe(1);
      expect(getAudioState().id).toBe('instruction.daily.flexible');
      expect(getAudioState().error).toBe(null);
    } finally { stopAudio(); globalThis.window = previous; }
  });
  test('an old media rejection cannot cancel the next narration on the reused element', async () => {
    const previous = globalThis.window, spoken = [];
    let rejectFirst, attempts = 0;
    class DeferredAudio {
      play() { return ++attempts === 1 ? new Promise((resolve, reject) => { rejectFirst = reject; }) : Promise.resolve(); }
      pause() {}
    }
    class Utterance { constructor(text) { this.text = text; } }
    globalThis.window = { Audio: DeferredAudio, SpeechSynthesisUtterance: Utterance, speechSynthesis: { cancel() {}, speak(value) { spoken.push(value); } } };
    try {
      setAudioMuted(false); playAudio('screen.01'); playAudio('screen.02');
      rejectFirst(new Error('aborted previous source')); await Promise.resolve();
      expect(getAudioState().id).toBe('screen.02');
      expect(getAudioState().error).toBe(null);
      expect(spoken).toHaveLength(0);
    } finally { stopAudio(); globalThis.window = previous; }
  });
  test('one failed media request cannot start duplicate fallback speech and video stops the fallback', async () => {
    const previous = globalThis.window, spoken = [];
    let media, rejectPlay, ended = 0;
    class FailedAudio {
      constructor() { media = this; }
      play() { return new Promise((resolve, reject) => { rejectPlay = reject; }); }
      pause() {}
    }
    class Utterance { constructor(text) { this.text = text; } }
    globalThis.window = { Audio: FailedAudio, SpeechSynthesisUtterance: Utterance, speechSynthesis: { cancel() {}, speak(value) { spoken.push(value); } } };
    try {
      setAudioMuted(false); playAudio('screen.01', () => { ended++; });
      media.onerror(); rejectPlay(new Error('same media failure')); await Promise.resolve();
      expect(spoken).toHaveLength(1);
      claimPlayback({});
      expect(getAudioState().id).toBe(null);
      expect(spoken[0].onend).toBe(null);
      expect(ended).toBe(1);
    } finally { stopAudio(); globalThis.window = previous; }
  });
});
