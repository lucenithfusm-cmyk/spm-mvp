# SPM — Legal Launch Checklist Colombia
Updated: 2026-10-06
Status: PRE-LAUNCH / review branch only

## 1. Operating model
Initial launch can be operated by an individual (persona natural comerciante). This does not create a separate legal person.

Before accepting payments:
- Complete/update Registro Mercantil as persona natural comerciante if the activity is carried on professionally as commerce.
- Confirm/update RUT and NIT with the applicable economic activity.
- Confirm tax responsibilities and whether electronic invoicing is required.
- Define the bank/payment-gateway holder and ensure the checkout identifies the same legal provider.
- Confirm local/municipal tax obligations with the accountant.

## 2. Public provider identity — REQUIRED BEFORE LAUNCH
Replace every placeholder with:
- Full legal name of provider.
- NIT.
- Judicial-notice / business contact address.
- Contact phone.
- PQR / customer-service email.
- Billing/support information where applicable.

Do not launch the checkout while these fields remain incomplete.

## 3. Regulatory position
Current intended-use position:
SPM is an educational digital sexual-wellness platform for adults. It organizes self-reported information into educational priorities and provides progressive learning, guided practices and personal tracking. It does not diagnose disease, prescribe medication, modify treatment, provide emergency care or promise a physiological outcome.

Claims to avoid in public advertising/product copy:
- "diagnoses erectile dysfunction / premature ejaculation / low desire"
- "treats/cures erectile dysfunction"
- "medical treatment"
- "prescribes medication"
- "clinically guarantees..."
- disease-prevention or disease-treatment claims unless later supported by the appropriate regulatory pathway

Preferred public language:
- sexual wellness
- education and self-awareness
- performance skills
- guided training
- personal progress tracking
- confidence, connection and pacing

INVIMA: a sanitary registration is not assumed merely because SPM is software. Device status depends on intended use. If intended use changes toward diagnosis, prevention, monitoring, treatment or physiological modification, re-evaluate classification before release. An optional formal classification/non-obligation consultation may be used for additional certainty.

## 4. Legal pages — CREATED IN THIS BRANCH
- public-web/privacy.html
- public-web/terms.html
- public-web/refunds.html
- public-web/cookies.html
- public-web/sensitive-data-consent.html
- public-web/health-disclaimer.html

All are bilingual ES/EN and linked from the public website footer.

## 5. Sensitive-data consent — MUST BECOME OPERATIONAL
Before processing health or sexual-life information for personalization:
- Present a separate, explicit opt-in.
- Link to Privacy Policy and Sensitive Data Authorization.
- State that the information is sensitive and that the user is not obliged to provide it.
- Record user/account, timestamp, text/policy version and consent source.
- Do not pre-check the box.
- Define behavior if the user refuses consent (e.g. cannot generate personalized map/program, but can still view public educational resources).

## 6. Data-protection safeguards
- Keep sexual/health answers out of advertising pixels and remarketing payloads.
- Do not send Performance Map™, scores, medication data, intimate notes or assessment answers to advertising platforms.
- Implement role-based access.
- Keep production and support access auditable.
- Maintain a processor/vendor inventory.
- Define deletion/retention rules.
- Maintain incident-response procedures.
- Define international transfer/transmission safeguards for cloud vendors.

## 7. Commerce / checkout
Before payment confirmation show:
- Provider identity.
- Exact service description.
- Total price, taxes/charges where applicable.
- Currency.
- Duration/access period.
- Activation timing.
- Material technical requirements.
- Terms, Privacy Policy and Refund/Withdrawal Policy.
- Explicit request/acknowledgment if digital service begins immediately after payment.
- Order summary before final confirmation.
- Purchase confirmation afterward.

Retain evidence of the terms/policy version accepted.

## 8. PQR / customer service
Before launch:
- Enable a functioning PQR/contact channel.
- Generate or retain proof of submission date/time.
- Avoid requiring intimate information for ordinary billing/support cases.
- Publish the provider's support email.
- Add a visible link to the Colombian consumer-protection authority where legally required.

## 9. Age
- Adults 18+ only.
- Add age confirmation at registration/activation.
- Do not design the service or marketing toward minors.

## 10. Intellectual property
Recommended before broad paid launch:
- Trademark clearance and filing for SPM with SIC.
- Register relevant software/content with DNDA.
- Keep licenses/ownership evidence for videos, images, audio, avatar/voice assets and third-party materials.

## 11. Before moving this branch toward production
LEGAL GATE:
- [ ] Provider identity completed
- [ ] RUT/NIT/activity confirmed
- [ ] Tax/invoicing status confirmed
- [ ] PQR channel operational
- [ ] Sensitive-data consent integrated into actual assessment flow
- [ ] Consent version logging tested
- [ ] Checkout legal acceptance and immediate-activation language tested
- [ ] Cookies/tracking inventory audited
- [ ] No intimate data reaches ad/marketing tools
- [ ] ES/EN links work on mobile and desktop
- [ ] Public claims reviewed against intended use
- [ ] Trademark/DNDA decision recorded
- [ ] Final Colombian legal review completed before paid public launch

This checklist is an implementation aid and does not replace individualized legal or tax advice.
