# Recovery story audio and day 3 sleep narration

Date: 2026-11-13

## Requested changes

- Sleep day 3 (`sl-horario-02`): narrate the existing introduction only. Omit the second section beginning “Si quieres acostarte antes, elige para esta noche…”. The Today speaker, detailed card and Library use the same exception. Written content and all other sleep narration remain unchanged.
- Restore both Doctor SPM interventions in all seven recovery stories.

## Root cause and correction

The shared instruction narrator captured every media `play` event and called `speechSynthesis.cancel()` even when it owned no narration. Recovery starts a muted Doctor video when the doctor's utterance begins. That video event canceled the utterance; Recovery treated `onerror` as successful completion and advanced to the next patient recording.

The instruction narrator now cancels only an utterance it owns. A deliberate click to start a new instruction still replaces the active voice. Recovery advances a spoken turn on `onend`, not on an error or a silent synthesis state. A failed turn stops the story and offers retry. The watchdog does not interrupt active or pending speech.

## Complete recorded stories

Live verification exposed a second dependency: native browser speech was unavailable in the test browser, including for an independent Sleep instruction. Spanish Recovery therefore now prefers one complete MP3 per story. Each contains the two original patient segments and both Doctor interventions, in order. Four measured cue times synchronize the story cards and decorative video. Pause and resume operate on the same audio element; only its `ended` event completes playback.

The fourteen Doctor takes use Lenny — Clear & Professional, the existing program narration voice, in Spanish at the previously used generation speed of 0.95 and playback rate of 1. Approved Doctor scripts are unchanged. Provider-aligned words match the exact submitted text. The source takes, provenance, measured cue times and reproducible assembly script are retained in the repository. The original patient files remain byte-identical.

`scripts/build-recovery-story-audio.py` builds the seven MP3s and `recovery-story-audio-v1.js`. English and the legacy Spanish path without a recording manifest keep their original voice path.

## Coverage

Every story contains four ordered turns: patient, Doctor SPM, patient, Doctor SPM.

| Scenario | Spanish title | Erection day | Ejaculation day | Desire / other routes day |
| --- | --- | ---: | ---: | ---: |
| condom | La perdí al colocar el preservativo | 4 | 15 | 15 |
| before | La perdí antes de penetrar | 11 | 4 | 4 |
| during | La perdí durante la penetración | 8 | 22 | 11 |
| early | Eyaculé antes de lo que quería | 22 | 11 | 18 |
| urge | Sentí que iba a eyacular y entré en ansiedad | 15 | 8 | 22 |
| partner | Mi pareja notó lo que pasó | 18 | 18 | 8 |
| next | Ahora temo que vuelva a ocurrir | 25 | 25 | 25 |

## Verification before deployment

- `tests/recovery-audio.test.cjs`: 23 passing integration/regression tests with the real two controllers and simulated speech/media. Covers all seven recorded stories without any speech API, all seven legacy sequences, pause/resume, ownership, MP3 and speech errors, English queue cleanup, and missing speech completion.
- `tests/daily-practice.test.cjs`: 32 passing, including the actual text submitted to speech synthesis from all three Sleep entry points and unchanged narration for the other cards.
- `tests/program-review.test.cjs`: 5 passing.
- `tests/program-videos.test.cjs`: 5 passing.
- `tests/video-actions.test.cjs`: 14 passing behavioral checks. Its separate existing media-byte fixture check could not run because `docs/qa/video-action-audio-20261113.json` is not materialized in this sparse checkout; no related source or media was changed.
- Live range requests returned HTTP 206, expected MIME types and valid file signatures for all seven patient MP3s and both recovery videos.
- JavaScript syntax checks and `git diff --check` passed.

The regression suite simulates media events; it is not a listening test on an iPhone. No audio-listening API was available for a subjective voice-quality review. All source and assembled MP3s were decoded, measured and checked against their manifests. No patient records, story scripts, existing voice assets, questionnaires, practice clocks or practice-completion rules were changed.
