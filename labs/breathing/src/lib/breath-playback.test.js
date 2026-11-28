import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { claimPlayback, registerPlayback } from './breath-playback';
import { AUDIO_IDS, audioFiles, hasAudio, playAudio, stopAudio, getAudioState, setAudioMuted } from './breath-audio';
import { trainerLines } from './breath-data';
import manifest from '../assets/audio/lenny-manifest.json';
import dailyInstructions from '../assets/audio/daily-instructions-manifest.json';
import practicalGuidance from '../assets/audio/practical-guidance-manifest.json';
function standardVoice() {
 const previous=globalThis.window,calls=[];let active=null,canceled=0;
 globalThis.window={SPM_VOICE:{listen(text,options){active=options;calls.push({text,options});options.onstate?.({state:'playing',message:''});return true;},cancel(){canceled++;const old=active;active=null;old?.oncancel?.();}}};
 setAudioMuted(false);
 return{calls,get canceled(){return canceled;},close(){stopAudio();globalThis.window=previous;}};
}
describe('Exclusive standard-device voice (2026-11-27)',()=>{
 test('video, narration and practice never remain active together',()=>{
  const video={},practice={};let videoPaused=false,practicePaused=false;
  const cleanVideo=registerPlayback(video,()=>{videoPaused=true;}),cleanPractice=registerPlayback(practice,()=>{practicePaused=true;});
  claimPlayback(practice);expect(videoPaused).toBe(true);expect(practicePaused).toBe(false);
  claimPlayback(video);expect(practicePaused).toBe(true);cleanVideo();cleanPractice();
 });
 test('exit unregisters playback listeners',()=>{let calls=0;const unregister=registerPlayback({},()=>{calls++;});unregister();claimPlayback({});expect(calls).toBe(0);});
 test.each([...manifest.entries,...dailyInstructions.entries,...practicalGuidance.entries])('$id uses complete approved text through the shared coordinator',entry=>{
  const h=standardVoice();try{expect(playAudio(entry.id)).toBe(true);expect(h.calls).toHaveLength(1);expect(h.calls[0].text).toBe(entry.id.startsWith('screen.')?trainerLines[Number(entry.id.slice(7))-1]:entry.id==='cue.done'?'Terminó la guía. Respira con naturalidad y registra solo lo que realizaste.':entry.text);expect(h.calls[0].options.lang).toBe('es-CO');expect(getAudioState().id).toBe(entry.id);expect(getAudioState().error).toBe(null);expect(globalThis.window.Audio).toBe(undefined);expect(globalThis.window.speechSynthesis).toBe(undefined);}finally{h.close();}
 });
 test('unknown text does not fabricate narration or attempt a recording',()=>{
  const h=standardVoice();try{expect(hasAudio(AUDIO_IDS.practice('missing'))).toBe(false);expect(playAudio(AUDIO_IDS.practice('missing'))).toBe(false);expect(h.calls).toHaveLength(0);expect(getAudioState().error).toContain('texto');}finally{h.close();}
 });
 test('stop is idempotent and a saved late callback cannot signal completion',()=>{
  const h=standardVoice();let ended=0;try{playAudio('screen.01',()=>{ended++;});const late=h.calls[0].options.onend,before=h.canceled;stopAudio();stopAudio();late();expect(h.canceled-before).toBe(1);expect(ended).toBe(0);expect(getAudioState().id).toBe(null);}finally{h.close();}
 });
 test('a new narration invalidates previous completion and other playback cancels it',()=>{
  const h=standardVoice();let ended=0;try{playAudio('comparison.chest',()=>{ended++;});const late=h.calls[0].options.onend;playAudio('comparison.diaphragm');late();expect(ended).toBe(0);expect(getAudioState().id).toBe('comparison.diaphragm');claimPlayback({});expect(getAudioState().id).toBe(null);}finally{h.close();}
 });
 test('mute stops a cue and suppresses later cues without a completion',()=>{
  const h=standardVoice();try{playAudio('cue.inhale');const before=h.canceled;setAudioMuted(true);expect(h.canceled-before).toBe(1);expect(playAudio('cue.exhale')).toBe(false);expect(h.calls).toHaveLength(1);expect(getAudioState().id).toBe(null);}finally{setAudioMuted(false);h.close();}
 });
 test('errors remain readable and retry needs a new play action',()=>{
  const h=standardVoice();try{playAudio('instruction.daily.flexible');h.calls[0].options.onstate({state:'error',message:'Pulsa Reintentar o lee el texto.'});expect(getAudioState().id).toBe(null);expect(getAudioState().error).toContain('lee el texto');expect(h.calls).toHaveLength(1);playAudio('instruction.daily.flexible');expect(h.calls).toHaveLength(2);expect(getAudioState().error).toBe(null);}finally{h.close();}
 });
 test('without the coordinator the written instructions remain available',()=>{
  const previous=globalThis.window;globalThis.window={};try{expect(playAudio('screen.01')).toBe(false);expect(getAudioState().id).toBe(null);expect(getAudioState().error).toContain('escritas');}finally{stopAudio();globalThis.window=previous;}
 });
 test('natural completion concerns narration only',()=>{
  const h=standardVoice();let ended=0;try{playAudio('cue.done',()=>{ended++;});h.calls[0].options.onend();expect(ended).toBe(1);expect(getAudioState().id).toBe(null);}finally{h.close();}
 });
});
describe('Historical provenance remains available without being played',()=>{
 test('all 27 approved IDs and original URLs remain traceable',()=>{const entries=[...manifest.entries,...dailyInstructions.entries,...practicalGuidance.entries];expect(Object.keys(audioFiles).sort()).toEqual(entries.map(entry=>entry.id).sort());for(const entry of entries)expect(audioFiles[entry.id]).toBe(entry.url);});
 test('practical-guidance original MP3s remain byte identical',()=>{for(const entry of practicalGuidance.entries){const bytes=readFileSync(new URL('../../public/'+entry.url,import.meta.url));expect(createHash('sha256').update(bytes).digest('hex')).toBe(entry.sha256);}});
});
