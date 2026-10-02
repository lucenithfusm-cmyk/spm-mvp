# SPM — Sexual Performance Management

SPM is a bilingual (English/Spanish) sexual-wellness MVP for adults 18+.

## MVP 2.0

Version 2.0 adds:

- A redesigned professional responsive interface.
- A structured 19-question self-assessment.
- Six scoring domains: erection reliability, ejaculatory control, desire/arousal, confidence/focus, sexual wellbeing, and lifestyle/recovery.
- A safety screen for age restriction, possible priapism, exertional warning symptoms, and significant genital pain/injury.
- An overall SPM Score plus two prioritized domains.
- A personalized 28-day wellness action plan based on the two lowest-scoring domains.
- Daily check-ins for confidence, satisfaction, stress, sleep, and adherence.
- Basic progress tracking saved locally in the browser.
- English/Spanish language switching.
- A US$39 plan offer placeholder for future checkout integration.

## Privacy in the prototype

Assessment answers and check-ins are stored only in the visitor's browser using `localStorage`. The current MVP has no account system or backend database.

## Important scope

SPM 2.0 is an educational sexual-wellness prototype. It does not diagnose conditions, prescribe medications, provide emergency care, or establish medical clearance.

## Deployment

The site is static and can be hosted directly with GitHub Pages. The production entry point is `index.html` on the `main` branch after the V2 pull request is merged.

## Next commercial milestones

1. Connect checkout/payment.
2. Add user authentication and secure backend persistence.
3. Add analytics and conversion events.
4. Add consent/privacy/terms pages.
5. Add email delivery and retention flows.
6. Validate scoring and program content before commercial launch.
