# SPM Insight media integration

Feature branch: `refresh-assets-fix-v3`

Production requirements covered by this branch:
- four approved SPM Insight Spanish visual assets are stored inside the repository;
- browser `speechSynthesis` is removed from the Insight flow;
- male voice tracks are stored as repository MP3 assets in Spanish and English;
- audio playback uses HTML5 Audio with graceful autoplay fallback for iOS/Safari;
- Insight copy and audio routing support Spanish and English;
- the commercial pilot preloads the Insight assets before the evaluation refresh logic;
- mobile-first rendering uses safe-area support and responsive width constraints.

Remaining before production merge:
- final English visual variants matching the approved Spanish posters;
- full end-to-end bilingual audit of the surrounding SPM UI and commercial screens;
- mobile QA on Safari/iPhone and Chrome/Android;
- production-scale backend review (Supabase RLS, indexes, auth/email limits, concurrency/load test).
