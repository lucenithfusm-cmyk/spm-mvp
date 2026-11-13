#!/usr/bin/env python3
"""Build seven complete stories from the approved patient clips and Doctor takes."""
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RATE = 44100
DATE = '20261113'
CUTS = {'condom': (5.56, 5.84), 'before': (7.95, 8.23),
        'during': (6.90, 7.07), 'early': (5.50, 5.87),
        'urge': (6.94, 7.21), 'partner': (5.45, 5.88), 'next': (7.02, 7.17)}
GAP = bytes(round(.22 * RATE) * 2)


def decode(path):
    return subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(path),
                                    '-f', 's16le', '-ac', '1', '-ar', str(RATE), '-'])


def seconds(pcm):
    return len(pcm) / (RATE * 2)


def normalized(text):
    return re.findall(r'\w+', text.lower(), flags=re.UNICODE)


def main():
    narration = json.loads((ROOT / 'docs/qa/recovery-doctor-narration-20261113.json').read_text())
    # The provider's aligned words must cover exactly the submitted text.
    for entry in narration['entries']:
        actual = ' '.join(word['text'] for word in entry['original_words'])
        assert normalized(actual) == normalized(entry['text']), entry['file']

    public, sources = {}, []
    for scenario, (cut, resume) in CUTS.items():
        patient_path = ROOT / f'premium-v2/assets/audio/recovery-patient-{scenario}-es.mp3'
        patient = decode(patient_path)
        doctors = sorted((entry for entry in narration['entries'] if entry['scenario'] == scenario),
                         key=lambda entry: entry['turn'])
        assert len(doctors) == 2
        parts = [patient[:round(cut * RATE) * 2], decode(ROOT / doctors[0]['file']),
                 patient[round(resume * RATE) * 2:], decode(ROOT / doctors[1]['file'])]
        assert all(len(part) > RATE for part in parts), scenario
        cues, offset = [], 0.0
        for index, part in enumerate(parts):
            cues.append(round(offset, 6))
            offset += seconds(part) + (seconds(GAP) if index < 3 else 0)
        combined = GAP.join(parts)
        relative = f'assets/audio/recovery-story-{scenario}-es-{DATE}.mp3'
        target = ROOT / 'premium-v2' / relative
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(RATE),
                        '-ac', '1', '-i', 'pipe:0', '-c:a', 'libmp3lame', '-b:a', '128k',
                        '-write_xing', '1', str(target)], input=combined, check=True)
        measured = seconds(decode(target))
        assert abs(measured - seconds(combined)) < .03, scenario
        public[scenario] = {'src': relative, 'cues': cues, 'duration': round(measured, 6)}
        sources.append({'scenario': scenario, 'patient': str(patient_path.relative_to(ROOT)),
                        'patientSha256': hashlib.sha256(patient_path.read_bytes()).hexdigest(),
                        'patientSourceRanges': [[0, cut], [resume, seconds(patient)]],
                        'doctorTakes': [{**entry, 'sha256': hashlib.sha256((ROOT / entry['file']).read_bytes()).hexdigest()}
                                        for entry in doctors],
                        'gapSeconds': seconds(GAP), 'rate': RATE, 'playbackRate': 1,
                        **public[scenario], 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})
        print(f'{scenario}: {measured:.2f}s; cues {cues}; {target.stat().st_size} bytes')

    script = "// Complete recorded Spanish stories; cues mark patient, doctor, patient, doctor.\n"
    script += 'window.SPM_RECOVERY_STORY_AUDIO=' + json.dumps(public, ensure_ascii=False, indent=2) + ';\n'
    (ROOT / 'premium-v2/recovery-story-audio-v1.js').write_text(script)
    (ROOT / f'docs/qa/recovery-story-audio-{DATE}.json').write_text(json.dumps({
        'date': '2026-11-13', 'voice': narration['voice'], 'voiceId': narration['voiceId'],
        'generationSpeed': narration['speed'], 'review': 'Decoded every source and final MP3; provider aligned words match each exact Doctor script. No audio listening API was available.',
        'stories': sources}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
