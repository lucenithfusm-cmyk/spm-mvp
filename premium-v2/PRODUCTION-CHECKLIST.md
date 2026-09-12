# SPM Premium production checklist

## Insight funnel
- [x] Four approved Spanish Insight visual assets stored in-repository
- [x] Four Spanish male voice MP3 files stored in-repository
- [x] Four English male voice MP3 files stored in-repository
- [x] Browser speech synthesis removed from Insight flow
- [x] HTML5 audio playback with iOS autoplay fallback
- [x] Shared ES/EN language state added
- [ ] Four final English visual posters matching Spanish premium design
- [ ] iPhone/Safari QA of all four Insights
- [ ] Android/Chrome QA of all four Insights

## Bilingual product
- [ ] Auth and onboarding ES/EN
- [ ] Full adaptive assessment ES/EN
- [ ] Safety messages ES/EN
- [ ] Preliminary result and commercial close ES/EN
- [ ] Performance Map ES/EN
- [ ] 28-day plan ES/EN
- [ ] Day 14 checkpoint ES/EN
- [ ] Day 28 report and maintenance ES/EN
- [ ] Video library voiceover/subtitles/on-screen copy ES/EN

## Cross-device
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] iPad/tablet
- [ ] Desktop Safari/Chrome/Edge
- [ ] Reduced bandwidth/media loading test

## Scale and persistence
- [ ] Move critical progress persistence away from browser-only localStorage
- [ ] Validate Supabase RLS and per-user data isolation
- [ ] Review database indexes and query patterns
- [ ] Review Auth rate limits and production SMTP
- [ ] Concurrency/load test before launch
- [ ] Validate retry/recovery behavior under transient network failure
