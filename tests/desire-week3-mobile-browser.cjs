// Deseo week 3: real mobile browser journeys with synthetic, local-only records.
// Speech requests are observed; these checks do not claim audible device-voice QA.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const engine = process.env.SPM_BROWSER || 'chrome';
const base = process.env.SPM_TEST_BASE || 'http://127.0.0.1:4173/premium-v2/desire-week3-v1/';
const artifacts = process.env.SPM_SCREENSHOT_DIR || path.join('test-artifacts', 'desire-week3-' + engine);
fs.mkdirSync(artifacts, { recursive: true });

(async () => {
  const browser = engine === 'webkit'
    ? await webkit.launch({ headless: true })
    : await chromium.launch({ headless: true, executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const mobile = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
  const errors = [], seen = new Set();
  let page, audioChoices = 0;

  async function makeContext(extra = {}) {
    const context = await browser.newContext({ ...mobile, ...extra });
    await context.addInitScript(() => {
      const speech = window.__spmSpeech = { spoken: [], events: [], active: null, cancels: 0 };
      Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: class { constructor(text) { this.text = text; } } });
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
        getVoices: () => [],
        cancel() { speech.cancels++; speech.events.push({ type: 'cancel', active: speech.active }); speech.active = null; },
        speak(utterance) { speech.events.push({ type: 'speak', activeBefore: speech.active, text: utterance.text }); speech.spoken.push(utterance.text); speech.active = utterance.text; }
      } });
    });
    return context;
  }

  const state = () => page.evaluate(() => window.SPM_WEEK3_REVIEW.getState());
  const speech = () => page.evaluate(() => window.__spmSpeech);
  const ctl = id => page.locator('[data-control="' + id + '"]');
  const press = id => ctl(id).click();
  const next = () => press('primary');
  async function home() {
    await page.locator('.statusbar [data-action="home"]').click();
    await page.locator('.day-card').first().waitFor();
  }
  async function go(day) {
    await page.locator('.day-card[data-day="' + day + '"]').click();
    await page.locator('.portrait[data-spm-layout="bands"]').waitFor();
  }
  async function previousScreen() {
    const options = page.locator('[data-desire-options]');
    if (await options.getAttribute('aria-expanded') !== 'true') await options.click();
    await page.locator('.screen-footer[data-desire-panel]').waitFor({ state: 'visible' });
    await page.locator('.quick [data-action="back"]').click();
  }
  async function openFirst(day) {
    await go(day);
    while ((await state()).session[day].step > 1) await previousScreen();
  }
  async function settings(values) {
    await page.locator('[data-action="settings"]').click();
    for (const [name, value] of Object.entries(values)) {
      const el = page.locator('[data-setting="' + name + '"]');
      if (name === 'pressure') await el.selectOption(value === null ? '' : String(value));
      else await el.setChecked(value);
    }
    await page.locator('#resourceOverlay [data-action="close"]').last().click();
    await page.locator('.day-card').first().waitFor();
  }
  async function range(id, value) {
    const el = ctl(id);
    await el.focus();
    await el.press('Home');
    for (let i = 0; i < value; i++) await el.press('ArrowRight');
    assert.equal(Number(await el.inputValue()), value, id + ' responds to keyboard-accessible range controls');
  }
  async function observe(id, screenshot = true) {
    await page.locator('.portrait[data-screen="' + id + '"][data-spm-layout="bands"]').waitFor({ timeout: 10000 });
    await page.waitForFunction(() => {
      const img = document.querySelector('.portrait .backdrop');
      return !!img && img.complete && img.naturalWidth > 0;
    });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3), false, id + ': no horizontal overflow');
    const outside = await page.locator('.portrait').evaluate(portrait => {
      const frame = portrait.getBoundingClientRect();
      return [...portrait.querySelectorAll('.spm-layer')].filter(el => {
        const r = el.getBoundingClientRect();
        return r.left < frame.left - 2 || r.top < frame.top - 2 || r.right > frame.right + 2 || r.bottom > frame.bottom + 2;
      }).map(el => el.dataset.control || el.className);
    });
    assert.deepEqual(outside, [], id + ': controls stay inside the approved image');
    seen.add(id);
    if (screenshot) await page.screenshot({ path: path.join(artifacts, id + '.png'), fullPage: true });
    const before = await speech();
    await press('audio-guide');
    const after = await speech();
    assert.equal(after.spoken.length, before.spoken.length + 1, id + ': guide button speaks once');
    assert(after.spoken.at(-1).trim().length > 8, id + ': non-empty step narration');
    assert.equal(after.events.at(-1).activeBefore, null, id + ': prior voice canceled before new narration');
    return after.spoken.at(-1);
  }
  async function choose(id, initialGuide) {
    const before = await speech();
    await press(id);
    const after = await speech();
    assert.equal(after.spoken.length, before.spoken.length + 1, id + ': one concise audio per selection');
    const text = after.spoken.at(-1).trim();
    assert(text.split(/\s+/).length <= 45, id + ': selection audio stays brief');
    assert.notEqual(text, initialGuide, id + ': does not replay the entire initial guide');
    assert.equal(after.events.at(-1).activeBefore, null, id + ': no overlapping narration');
    audioChoices++;
  }
  async function finish(day) {
    await press('confirm');
    await next();
    await page.locator('.day-card').first().waitFor();
    assert.equal((await state()).session[day].status, 'completed', 'day ' + day + ': explicit completion is recorded');
  }

  try {
    // An iPhone file preview that refuses scripts must show an explanation, not an endless loader.
    const noJs = await browser.newContext({ ...mobile, javaScriptEnabled: false });
    const staticPage = await noJs.newPage();
    await staticPage.goto(base + 'index.html', { waitUntil: 'domcontentloaded', timeout: 25000 });
    assert.equal(await staticPage.locator('.day-card').count(), 7, 'static menu remains available before JavaScript');
    const staticText = await staticPage.locator('body').innerText();
    assert.match(staticText, /JavaScript|Safari|navegador/i, 'no-script state explains how to open the interactive version');
    assert.doesNotMatch(staticText, /Preparando (?:tus |las )?pantallas/i, 'no misleading indefinite loading message');
    await staticPage.screenshot({ path: path.join(artifacts, 'no-javascript.png'), fullPage: true });
    await noJs.close();

    const mainContext = await makeContext();
    page = await mainContext.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + 'index.html', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForFunction(() => window.SPM_WEEK3_REVIEW && document.querySelectorAll('.day-card').length === 7);
    await page.screenshot({ path: path.join(artifacts, 'menu.png'), fullPage: true });

    // Empty diary and unavailable phase II are genuine initial states, not example data.
    await go(21); await observe('d21_01'); await next(); await observe('d21_02a'); await home();
    await go(19); await observe('d19_00a');
    assert.equal(await ctl('ready').count(), 0, 'phase II cannot be accepted before its prerequisites');
    await home();

    // Both pressure and clinical-review alternatives retain only the allowed choices.
    await settings({ pressure: 8 });
    await go(15); await observe('d15_01'); await next(); await observe('d15_02a');
    assert.equal(await ctl('ladder-2').isDisabled(), true);
    assert.equal(await ctl('ladder-3').isDisabled(), true);
    await home();
    await settings({ pressure: 3, review: true });
    await openFirst(15); await next(); await observe('d15_02b');
    for (const id of ['ladder-1', 'ladder-2', 'ladder-3']) assert.equal(await ctl(id).isDisabled(), true);
    await home();
    await settings({ review: false, acute: false, pressure: 3 });

    await openFirst(15); await observe('d15_01'); await range('metric-before-scale', 3); await next();
    let guide = await observe('d15_02');
    for (const id of ['ladder-0', 'ladder-1', 'ladder-2', 'ladder-3']) await choose(id, guide);
    await choose('ladder-1', guide); await next(); await observe('d15_03');
    await press('timer-play'); await page.waitForTimeout(1150);
    assert.notEqual(await page.locator('[data-clock]').innerText(), '00:00', 'optional clock advances');
    await next(); await observe('d15_04');
    let record = (await state()).session[15];
    assert.equal(record.running, false, 'changing screens pauses the timer');
    assert(record.elapsed >= 1, 'active seconds are preserved');
    await press('metric-after-na');
    await ctl('reflection').fill('Elegí un abrazo tranquilo.');
    await next();
    assert.equal((await state()).session[15].status, 'draft', 'next alone does not falsely complete the activity');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await observe('d15_04', false);
    record = (await state()).session[15];
    assert.equal(record.fields.reflection, 'Elegí un abrazo tranquilo.', 'draft survives reload');
    assert.equal(record.before, 3); assert.equal(record.after, null, 'N/A remains distinct from zero');
    await finish(15);

    await go(16); guide = await observe('d16_01');
    for (const id of ['triad-0-0', 'triad-0-1', 'triad-0-2']) await choose(id, guide);
    await choose('variant-solo', guide); await next();
    const phase1Guide = await observe('d16_02');
    assert(!phase1Guide.includes('Acomódate en un lugar tranquilo'), 'phase I second screen does not repeat the initial welcome');
    for (let n = 1; n <= 4; n++) await choose('sensate1_phases-sensate1_phases_' + n, phase1Guide);
    await next(); await observe('d16_03');
    await ctl('reflection').fill('Manos y brazos, sin prisa.');
    await next(); await observe('d16_04');
    await press('comfortable-true'); await finish(16);
    assert.equal((await state()).session[16].comfortable, true);

    await go(17); await observe('d17_01'); await press('metric-before-na'); await next();
    guide = await observe('d17_02');
    for (const id of ['rhythm_cues-slower', 'rhythm_cues-pause', 'rhythm_cues-vary']) await choose(id, guide);
    await next(); guide = await observe('d17_03');
    for (const id of ['rhythm_actions-maintain', 'rhythm_actions-simple', 'rhythm_actions-pause']) await choose(id, guide);
    await next(); await observe('d17_04'); await finish(17);

    await go(18); guide = await observe('d18_01'); await choose('communication_route-partner', guide); await next();
    await observe('d18_02');
    await ctl('like_phrase').fill('A mí me gusta conversar con calma.');
    await ctl('avoid_phrase').fill('Hoy prefiero evitar las prisas.');
    await next(); await observe('d18_03');
    await ctl('partner_moment').fill('Después de caminar.');
    await ctl('partner_agreed').fill('Escucharnos sin exigencias.');
    await press('partner_consent');
    await previousScreen();
    await previousScreen();
    await press('communication_route-solo'); await next(); await next();
    await observe('d18_03a'); await ctl('partner_solo').fill('Puedo preparar lo que quiero comunicar.');
    await next(); await observe('d18_04'); await finish(18);
    assert.equal((await state()).session[18].route, 'solo', 'individual route does not require a partner');

    // A comfortable phase I alone does not override high or missing current pressure.
    await settings({ pressure: 7 }); await go(19); await observe('d19_00a', false); await home();
    await settings({ pressure: 3 }); await openFirst(19); await observe('d19_01');
    assert.equal(await ctl('repeat_sensate1').isVisible(), true, 'repeating phase I remains an available choice');
    await next();
    assert.equal(await page.locator('.portrait').getAttribute('data-screen'), 'd19_01', 'current willingness must be confirmed separately');
    await press('ready'); await next(); guide = await observe('d19_02');
    await choose('variant-solo', guide); await next(); guide = await observe('d19_03');
    for (let n = 1; n <= 4; n++) await choose('sensate2_phases-sensate2_phases_' + n, guide);
    await next(); await observe('d19_04');
    await ctl('reflection').fill('Una pausa me ayudó a elegir.'); await finish(19);
    assert.equal((await state()).session[19].practiceId, 'sensate-2');

    await go(20); await observe('d20_01'); await next(); guide = await observe('d20_02');
    for (const id of ['context_details-time', 'context_details-privacy', 'context_details-rest']) await choose(id, guide);
    await press('context_details-ambience');
    assert.equal((await state()).session[20].choices.context_details.length, 3, 'context selection is limited to three details');
    await press('conditions'); await page.locator('#resourceOverlay .modal-card').waitFor();
    await page.locator('[data-resource="conditions"]').first().click();
    await page.locator('#resourceOverlay [data-action="close"]').last().click();
    assert.equal(await page.locator('.portrait').getAttribute('data-screen'), 'd20_02', 'resource returns to the same practice step');
    await next(); guide = await observe('d20_03');
    for (const id of ['steps-0-0', 'steps-0-1', 'steps-0-2']) await choose(id, guide);
    await next(); await observe('d20_04'); await ctl('context').fill('Privacidad, descanso y tiempo sin prisa.');
    await finish(20);

    await openFirst(21); await observe('d21_01', false); await next(); await observe('d21_02');
    await press('diary-15');
    assert.match(await page.locator('#resourceOverlay').innerText(), /Elegí un abrazo tranquilo/, 'journal reads the real local reflection');
    await page.locator('#resourceOverlay [data-action="close"]').last().click();
    await press('progress28');
    assert.match(await page.locator('#resourceOverlay').innerText(), /Día 15/, 'progress displays recorded days');
    await page.locator('#resourceOverlay [data-action="close"]').last().click();
    await next(); await observe('d21_03');
    await ctl('reflection_keep').fill('Conservaré los momentos tranquilos.');
    await ctl('reflection_adapt').fill('Buscaré un momento con menos interrupciones.');
    await press('ranking');
    const rankingChoices = page.locator('[data-resource="ranking"]');
    await rankingChoices.nth(0).click(); await rankingChoices.nth(1).click();
    assert.equal((await state()).program.ranking.length, 2, 'ranking accepts fewer than five preferences');
    await page.locator('[data-resource="rankdown"]').first().click();
    await page.locator('#resourceOverlay [data-action="close"]').last().click();
    await next(); await observe('d21_04');
    await ctl('reflection_next').fill('Repetir una experiencia agradable.');
    await press('metric-local_after-na');
    assert.equal(await page.locator('[data-control*="checkpoint"]').count(), 0, 'day 21 adds no official checkpoint');
    await finish(21);
    const completed = await state();
    for (let d = 15; d <= 21; d++) assert.equal(completed.session[d].status, 'completed');
    assert.equal(completed.session[21].localAfter, null, 'optional local interest remains N/A');
    assert.equal(completed.session[17].before, null, 'unanswered scales were not filled with example values');
    assert.equal(seen.size, 33, 'all 28 principal screens and five conditional variants rendered');

    // Narrow-screen regression and persistence use the same user-created records.
    await page.setViewportSize({ width: 320, height: 568 });
    await openFirst(18); await observe('d18_01', false);
    await page.screenshot({ path: path.join(artifacts, 'mobile-320.png'), fullPage: true });
    await home(); await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.day-card').first().waitFor();
    assert.equal((await state()).session[20].status, 'completed');
    await mainContext.close();

    // The fallback belongs to day 19; it must never falsely complete or replace day 16.
    const repeatContext = await makeContext();
    page = await repeatContext.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + 'index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('.day-card').first().waitFor();
    await settings({ pressure: 3 }); await go(19); await observe('d19_00a', false); await next();
    await observe('d16_01', false); await press('variant-solo'); await next();
    await observe('d16_02', false); await next(); await observe('d16_03', false); await next();
    await observe('d16_04', false); await range('metric-comfort-scale', 9); await press('comfortable-false'); await finish(19);
    const repeated = await state();
    assert.equal(repeated.session[19].practiceId, 'sensate-1');
    assert.equal(repeated.session[19].comfortable, false);
    assert.equal(repeated.session[16].status, 'draft', 'day 16 remains untouched by the day 19 alternative');
    assert(await page.evaluate(() => Boolean(window.SPM_WEEK3_REVIEW.gate())), 'numeric comfort alone does not unlock phase II');
    await page.screenshot({ path: path.join(artifacts, 'phase1-alternative-day19.png'), fullPage: true });
    await repeatContext.close();

    // Browsing modes that deny storage may still open the menu and a practice.
    const deniedContext = await makeContext();
    await deniedContext.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Storage denied for this test', 'SecurityError'); } });
    });
    page = await deniedContext.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + 'index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.SPM_WEEK3_REVIEW && document.querySelectorAll('.day-card').length === 7);
    await go(15); await observe('d15_01', false);
    await deniedContext.close();

    assert.deepEqual(errors, [], 'no uncaught browser JavaScript errors');
    const summary = { result: 'PASS', browser: engine, days: 7, screenVariants: seen.size, audioChoices, mobileWidths: [390, 320], phase1FallbackDay: 19, noJavaScript: 'explained', blockedStorage: 'usable', browserErrors: errors.length };
    fs.writeFileSync(path.join(artifacts, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary));
  } catch (error) {
    fs.writeFileSync(path.join(artifacts, 'failure.txt'), String(error.stack || error));
    if (page && !page.isClosed()) {
      await page.screenshot({ path: path.join(artifacts, 'failure.png'), fullPage: true }).catch(() => {});
    }
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
