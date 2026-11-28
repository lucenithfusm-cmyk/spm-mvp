// End-to-end week 3 entry and persistence in the isolated Central reviewer.
// The reviewer supplies in-memory records; no authentication or patient API is loaded.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const engine = process.env.SPM_BROWSER || 'chrome';
const base = process.env.SPM_CENTRAL_TEST_BASE || 'http://127.0.0.1:4173/premium-v2/';
const artifacts = process.env.SPM_SCREENSHOT_DIR || path.join('test-artifacts', 'desire-week3-' + engine);
const selector = '#spmDailyWorkspace .spm-ds-week3-root iframe';
const practice = { 15: 'intimacy-ladder', 16: 'sensate-1', 17: 'foreplay-rhythm', 18: 'communicate-limits', 19: 'sensate-2', 20: 'context-design', 21: 'week-review' };
fs.mkdirSync(artifacts, { recursive: true });

(async () => {
  const browser = engine === 'webkit'
    ? await webkit.launch({ headless: true })
    : await chromium.launch({ headless: true, executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  let frame;
  const control = id => frame.locator('[data-control="' + id + '"]');
  const press = id => control(id).click();
  const next = () => press('primary');
  async function snapshot(day) {
    return page.evaluate(async day => {
      const c = window.SPM_RESOURCE_CONTEXT();
      if (c.userId !== 'review-only' || c.planId !== 'review-desire') throw Error('The test may only use isolated review records.');
      const scope = c.userId + ':' + c.planId;
      const bundle = await window.SPM_DESIRE_RECORDS.read(scope);
      return {
        program: JSON.parse(bundle['spm-desire-program'] || '{}'),
        state: JSON.parse(bundle['spm-desire-state'] || '{}'),
        daily: await window.SPM_DAILY_RECORDS.read(scope, day),
        context: c
      };
    }, day);
  }
  async function chooseDay(day) {
    await page.locator('#reviewDay:not([disabled])').waitFor();
    if (await page.locator('#reviewDay').inputValue() !== String(day)) await page.locator('#reviewDay').selectOption(String(day));
    await page.waitForFunction(day => window.SPM_RESOURCE_CONTEXT?.().day === day && !document.querySelector('#reviewDay').disabled, day);
  }
  async function open(day) {
    await page.locator('#spmDailySession [data-daily-open="main"]').click();
    await page.locator(selector).waitFor({ state: 'visible', timeout: 15000 });
    frame = page.frameLocator(selector);
    // The duplicate visual heading is hidden by the fullscreen layout; its
    // accessible text and the assigned application day must still be correct.
    await frame.locator('.daypill').filter({ hasText: 'Día ' + day + ' · Deseo' }).waitFor({ state: 'attached', timeout: 15000 });
    assert.equal(await frame.locator('#app').evaluate(() => window.SPM_WEEK3_REVIEW.day()), day);
    await frame.locator('.portrait[data-spm-layout="bands"]').waitFor({ state: 'visible' });
    await page.waitForFunction(selector => {
      const r = document.querySelector(selector)?.getBoundingClientRect();
      return r && r.top >= -30 && r.top < innerHeight * .6 && r.bottom > 0;
    }, selector, { timeout: 10000 });
    assert.equal(await page.locator('.spm-desire-modal[open]').count(), 0, 'only the new assigned practice is open');
    assert.equal(await frame.locator('#app').evaluate(() => localStorage.getItem('spm-desire-week3-tactile-preview-v1')), null, 'Central does not use the standalone preview store');
  }
  async function screen(id) {
    await frame.locator('.portrait[data-screen="' + id + '"]').waitFor();
    await frame.locator('.backdrop').evaluate(async img => {
      if (!img.complete) await new Promise((resolve, reject) => { img.addEventListener('load', resolve, { once: true }); img.addEventListener('error', reject, { once: true }); });
      if (!img.naturalWidth) throw Error('The approved screen did not load.');
    });
  }
  async function complete(day) {
    await press('confirm'); await next();
    await page.locator(selector).waitFor({ state: 'detached', timeout: 15000 });
    const saved = await snapshot(day);
    assert.equal(saved.daily.main?.completed, true, 'day ' + day + ': daily activity completed');
    assert.equal(saved.daily.main.practiceId, practice[day]);
    assert.equal(saved.daily.main.desireWeek3TouchVersion, 1);
    assert(saved.program.dayDone?.[day], 'day ' + day + ': program day completed');
    const sessions = (saved.program.sessions || []).filter(s => s.day === day && s.status === 'completed');
    assert(sessions.length > 0, 'day ' + day + ': real program session was added');
    assert.equal(sessions.at(-1).practiceId, practice[day]);
    assert.equal(JSON.parse(saved.program.detailNotes['desireWeek3TouchDay' + day]).day, day);
    return saved;
  }

  try {
    // Enter at day 15 and switch within the reviewer. Its direct day-19 URL
    // intentionally opens a separate, previously approved focalization module.
    await page.goto(base + 'revision-programas-28-dias.html?agenda=legacy&programa=desire&dia=15', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('#reviewProgram:not([disabled])').waitFor({ timeout: 30000 });
    assert.equal(await page.evaluate(() => window.SPM_RESOURCE_CONTEXT().scheduleVersion), 'legacy');
    await page.evaluate(async () => {
      const c = window.SPM_RESOURCE_CONTEXT();
      if (c.userId !== 'review-only' || c.planId !== 'review-desire') throw Error('Refusing to seed a non-review context.');
      const scope = c.userId + ':' + c.planId, bundle = await window.SPM_DESIRE_RECORDS.read(scope);
      const state = JSON.parse(bundle['spm-desire-state'] || '{}');
      await window.SPM_DESIRE_RECORDS.save({ ...bundle, 'spm-desire-state': JSON.stringify({ ...state, pressure: 3 }) }, scope, c.day);
    });

    let firstDay15;
    for (let day = 15; day <= 21; day++) {
      await chooseDay(day); await open(day); await screen('d' + day + '_01');
      await page.screenshot({ path: path.join(artifacts, 'central-day' + day + '.png'), fullPage: true });
      if (day === 16) await press('variant-solo');
      if (day === 18) await press('communication_route-solo');
      if (day === 19) {
        const current = await snapshot(day);
        assert(current.program.sessions.some(s => s.day === 16 && s.practiceId === 'sensate-1' && s.status === 'completed' && s.comfortable === true), 'phase II uses the actual saved phase I record');
        assert.equal(current.state.pressure, 3);
        await press('ready');
      }
      await next(); await screen('d' + day + '_02');
      if (day === 15) await press('ladder-0');
      if (day === 18) {
        await control('like_phrase').fill('Me gusta conversar con calma.');
        await control('avoid_phrase').fill('Prefiero evitar las prisas.');
      }
      if (day === 19) await press('variant-solo');
      if (day === 20) { await press('context_details-time'); await press('context_details-privacy'); }
      await next(); await screen(day === 18 ? 'd18_03a' : 'd' + day + '_03');
      if (day === 18) await control('partner_solo').fill('Una idea individual, sin enviar mensajes.');
      if (day === 21) {
        await control('reflection_keep').fill('Conservaré la calma.');
        await control('reflection_adapt').fill('Adaptaré el horario.');
      }
      await next(); await screen('d' + day + '_04');
      if (day === 15) await control('reflection').fill('Primer registro de cercanía.');
      if (day === 16) await press('comfortable-true');
      if (day === 20) {
        await control('context').fill('Privacidad y tiempo sin prisa.');
        await control('reflection').fill('Borrador que quiero conservar.');
        await frame.locator('.statusbar [data-action="home"]').click();
        await page.locator(selector).waitFor({ state: 'detached', timeout: 15000 });
        const draft = await snapshot(day);
        assert.equal(draft.daily.main?.completed, undefined, 'closing a draft does not complete the daily activity');
        assert.equal((draft.program.sessions || []).some(s => s.day === 20), false, 'closing a draft does not create a completed session');
        assert.equal(JSON.parse(draft.program.detailNotes.desireWeek3TouchDay20).fields.reflection, 'Borrador que quiero conservar.');
        await open(day); await screen('d20_04');
        assert.equal(await control('reflection').inputValue(), 'Borrador que quiero conservar.');
        assert.equal(await control('context').inputValue(), 'Privacidad y tiempo sin prisa.');
      }
      if (day === 21) {
        await control('reflection_next').fill('Repetir lo que me resulta agradable.');
        await press('metric-local_after-na');
      }
      const saved = await complete(day);
      if (day === 15) firstDay15 = structuredClone(saved.program.sessions.find(s => s.day === 15));
      if (day === 16) assert.equal(saved.program.sessions.find(s => s.day === 16).comfortable, true);
      if (day === 21) {
        const review = saved.program.sessions.find(s => s.day === 21);
        assert.equal(review.metricKey, 'local'); assert.equal(review.after, null);
        assert.equal(saved.daily['program-checkpoint'], undefined, 'week-three reflection adds no official checkpoint');
      }
    }

    // A second explicit attempt adds a new diary entry without replacing the first.
    await chooseDay(15); await open(15); await screen('d15_01');
    await next(); await press('ladder-0'); await next(); await next();
    await screen('d15_04'); await control('reflection').fill('Segundo registro independiente.');
    const repeated = await complete(15), entries = repeated.program.sessions.filter(s => s.day === 15);
    assert.equal(entries.length, 2); assert.deepEqual(entries[0], firstDay15);
    assert.notEqual(entries[0].id, entries[1].id);
    assert.equal(entries[1].reflection, 'Segundo registro independiente.');
    assert.equal(repeated.program.sessions.length, 8, 'seven days plus one independent repeat');
    assert.deepEqual(errors, [], 'Central integration has no uncaught browser errors');
    const summary = { result: 'PASS', browser: engine, centralDays: 7, completedSessions: 8, draftCloseReopen: true, repeatPreservesOriginal: true, storage: 'isolated-review-records', browserErrors: errors.length };
    fs.writeFileSync(path.join(artifacts, 'central-summary.json'), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary));
  } catch (error) {
    fs.writeFileSync(path.join(artifacts, 'central-failure.txt'), String(error.stack || error));
    await page.screenshot({ path: path.join(artifacts, 'central-failure.png'), fullPage: true }).catch(() => {});
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
