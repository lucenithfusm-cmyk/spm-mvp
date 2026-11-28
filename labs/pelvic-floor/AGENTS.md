# SPM Pelvic Floor Lab — Central integration

- Approved Lovable source: project d81e944b-ac12-4ed1-b08b-25c0ec4184af, audio commit b570108aa39187075a1a21c081d2e1e8e841ca70.
- The user approved the educational content, 16 screens, interactions, images and visual design on 2026-10-03 UTC and requested active audio and SPM integration.
- Keep the approved `.pf-` styles, anatomy image, trainer and localized SVG animation. Respect reduced motion.
- Build with `npm ci && npm run typecheck && npm run build`. Vite outputs to `premium-v2/pelvic-floor-lab/`; commit the built assets for the static SPM deployment.
- Central requires the same-origin authenticated `SPM_PELVIC_LAB_HOST` bridge. It stores module state in the active user's plan through existing RLS; never use browser localStorage for Lab health data. Lovable's separate review project remains a demo.
- One calendar: the existing 28-day pelvic training remains intact. Lab saves never complete a calendar day or advance it. Clinical review in SPM pauses practices; education remains available. Existing relaxation guards also apply inside the Lab.
- Keep developer simulation and dosage editors out of the Central patient interface. Do not add or change prescribed dosage without clinical approval.
- Current user decision (2026-11-27) supersedes the previous Lenny rule: all narration and cues use the standard device voice through `SPM_VOICE`; preserve approved text. No name/gender selection or new recording provider. Historical audio provenance remains available, not an active playback fallback.
- Audio lives in `public/audio/pf/`; provenance and durations are in `audio-provenance.json`. Asset paths must be relative for the Central subdirectory.
- Use the single shared voice coordinator. Start from an explicit user gesture; stop on pause, reset, navigation, visibility loss and unmount. Narration cannot interrupt a running timed practice. Pause/resume restarts the current paragraph and must say so.
- An interrupted practice must not be marked completed or recommended for progression. Red flags cannot produce a progression recommendation.
