# SPM Breathing Lab

Approved 18-screen Lovable curriculum, imported from commit `22d3feb13f6e2e8ebfe0443b85d25487be51a48a`.

Central owns authenticated persistence and the current day (1–28). This module never reads browser-local demo progress or completes the main daily task. Practice records include the Central day. The learning calendar only permits recording today's practice; breathing remains an optional/selective supporting skill. Clinical restrictions disable guided practice while leaving explanations available.

The approved Lenny narration, corrected demonstration (38.4 seconds, H.264/AAC), anatomical pacing clips and premium comparisons are stored in `public/media`. The two existing Central breathing/regulation videos retain their canonical catalog URLs. The Vite build publishes to `premium-v2/breathing-lab`, with relative URLs suitable for GitHub Pages.

Run `npm ci`, `npm run typecheck`, `npm run build`, and `npx vitest run` here. Bridge/persistence tests: `node --test tests/breathing-lab-bridge.test.cjs` from the repository root. The responsive browser test uses synthetic accounts and requires Playwright, an HTTP server on port 4173 and `CHROME_BIN`.
