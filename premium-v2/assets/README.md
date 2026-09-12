# SPM Premium media assets

Insight images are bundled as lightweight JavaScript data-URI assets so the commercial pilot does not depend on third-party image hosting. Insight audio files are stored as repository MP3 assets in `assets/audio/` and selected by language through `spm-insight-audio-v1.js`.

Do not reintroduce browser `speechSynthesis` for production Insight playback. The user-selected language must choose the matching audio track, and the player must keep a visible/tappable fallback because mobile browsers can block autoplay.
