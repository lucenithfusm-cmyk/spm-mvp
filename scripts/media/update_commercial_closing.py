"""Prepare one complete Spanish narration, without splicing or retiming.
Source: https://www.aidocmaker.com/g0/audio?name=cf58d3a181404b379d9fc883e3147629
Voice: Deep. Download the complete 46.9-second file, not the 30-second preview.
The approved script is preserved except for the price-free closing.
Usage: python3 scripts/media/update_commercial_closing.py SOURCE.mp3
"""
from pathlib import Path
import subprocess,sys
root=Path(__file__).resolve().parents[2]
subprocess.run(['ffmpeg','-v','error','-y','-i',sys.argv[1],'-af','loudnorm=I=-16:TP=-1.5:LRA=11','-ar','44100','-ac','1','-b:a','96k',str(root/'premium-v2/assets/audio/commercial-cinematic-v5-es.mp3')],check=True)
