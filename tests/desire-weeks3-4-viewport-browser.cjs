// Real browser geometry for all 64 approved screens, plus real Central exit.
// The exhaustive fixtures use the existing same-origin parent-frame protocol
// with synthetic draft records. They never connect to a patient account.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { screens, fixtureFor } = require('./desire-weeks3-4-layout-fixtures.cjs');
const engine = process.env.SPM_BROWSER || 'chrome';
const base = new URL(process.env.SPM_CENTRAL_TEST_BASE || 'http://127.0.0.1:4173/premium-v2/');
const artifacts = path.join(process.env.SPM_SCREENSHOT_DIR || 'test-artifacts/desire-weeks3-4-' + engine, 'viewport');
const hostUrl = new URL('../tests/desire-layout-host.html', base);
const viewports = [{ width: 390, height: 844 }, { width: 320, height: 568 }, { width: 390, height: 650 }];
const portraitShots = new Set(Array.from({ length: 14 }, (_, index) => `d${index + 15}_01`));
fs.mkdirSync(artifacts, { recursive: true });

function hostDocument(screen) {
  const fixture = fixtureFor(screen);
  const src = new URL(`desire-week${screen.week}-v1/index.html?spm=central&day=${screen.day}&sid=${fixture.sid}`, base).href;
  const json = JSON.stringify({ fixture, src, week: screen.week }).replaceAll('<', '\\u003c');
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}iframe{display:block;position:fixed;inset:0;width:100%;height:100%;border:0}</style></head><body><iframe id="practice" title="Práctica sintética para comprobar el diseño"></iframe><script>
  const config=${json},frame=document.querySelector('#practice');window.__layoutMessages=[];
  addEventListener('message',event=>{
    if(event.source!==frame.contentWindow||event.origin!==location.origin||event.data?.sid!==config.fixture.sid)return;
    window.__layoutMessages.push(event.data.type);
    if(event.data.type==='SPM_WEEK'+config.week+'_READY')frame.contentWindow.postMessage(config.fixture,location.origin);
  });frame.src=config.src;
  </script></body></html>`;
}

async function getFrame(page, selector) {
  const handle = await page.locator(selector).elementHandle();
  const frame = await handle.contentFrame();
  assert(frame, 'the practice iframe has a browser document');
  return frame;
}

async function settleLayout(frame) {
  await frame.locator('.portrait[data-spm-layout="bands"]').waitFor({ state: 'visible', timeout: 15000 });
  for (const selector of ['.portrait .backdrop', '.spm-desire-photo-image']) {
    await frame.locator(selector).evaluate(async img => {
      if (!img.complete) await new Promise((resolve, reject) => { img.addEventListener('load', resolve, { once: true }); img.addEventListener('error', reject, { once: true }); });
      if (!img.naturalWidth || !img.naturalHeight) throw Error('The original screen or complete illustration did not load.');
    });
  }
  await frame.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

function geometry() {
  const rect = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; };
  const portrait = document.querySelector('.portrait'), box = rect(portrait);
  const photo = document.querySelector('.spm-desire-photo-image');
  const visible = el => {
    const r = rect(el), s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) !== 0 && r.width > 3 && r.height > 3 && s.clipPath === 'none' && s.clip === 'auto';
  };
  const controls = [...portrait.querySelectorAll('.spm-layer')].map(el => {
    const r = rect(el), x = r.x + r.width / 2, y = r.y + r.height / 2;
    const interactive = el.matches('button,input,textarea') || !!el.querySelector('button,input,textarea');
    const hit = x >= 0 && x < innerWidth && y >= 0 && y < innerHeight ? document.elementFromPoint(x, y) : null;
    return { id: el.dataset.control || el.querySelector('[data-control]')?.dataset.control || el.className, ...r, interactive, inViewport: !!hit, hit: !interactive || !hit || hit === el || el.contains(hit) };
  });
  return {
    width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth,
    app: rect(document.querySelector('#app')), portrait: box, controls,
    photo: { ...rect(photo), fit: getComputedStyle(photo).objectFit, naturalWidth: photo.naturalWidth, naturalHeight: photo.naturalHeight },
    duplicateHeadings: [...document.querySelectorAll('.statusbar > span,.meta')].filter(visible).map(el => el.textContent),
    border: ['Top', 'Right', 'Bottom', 'Left'].map(side => parseFloat(getComputedStyle(portrait)['border' + side + 'Width'])),
    radius: parseFloat(getComputedStyle(portrait).borderTopLeftRadius),
    footerHidden: document.querySelector('.screen-footer[data-desire-panel]')?.hidden === true
  };
}

async function checkGeometry(frame, label, viewport) {
  await frame.evaluate(() => scrollTo(0, 0));
  await settleLayout(frame);
  const result = await frame.evaluate(geometry);
  assert.equal(result.width, viewport.width, label + ': frame uses the available width');
  assert.equal(result.height, viewport.height, label + ': frame uses the available height');
  assert(Math.abs(result.portrait.x) <= 2 && Math.abs(result.portrait.y) <= 2, label + ': artwork starts at the viewport edge');
  assert(Math.abs(result.portrait.width - result.width) <= 2, label + ': artwork fills the viewport width');
  assert(result.portrait.height >= result.height - 2, label + ': artwork covers the available height');
  if (viewport.width === 390 && viewport.height === 844) assert(Math.abs(result.portrait.height - result.height) <= 2, label + ': normal portrait viewport needs no outer frame or extra page height');
  assert(result.scrollWidth <= result.width + 2, label + ': no horizontal scrolling');
  assert.deepEqual(result.border, [0, 0, 0, 0], label + ': no portrait border');
  assert.equal(result.radius, 0, label + ': no card corners around the screen');
  assert.deepEqual(result.duplicateHeadings, [], label + ': no second brand/day heading above the approved artwork');
  assert(['contain', 'cover'].includes(result.photo.fit), label + ': illustration keeps its original proportions');
  if (result.photo.fit === 'cover') {
    assert(result.photo.width / result.photo.height <= result.photo.naturalWidth / result.photo.naturalHeight + .01,
      label + ': a filled photo frame keeps the entire source height, without cutting the head or hands vertically');
  }
  assert(result.photo.naturalWidth > 0 && result.photo.naturalHeight > 0, label + ': illustration is loaded');
  assert(result.photo.width > 0 && result.photo.height >= 90, label + ': illustration remains visible at short heights');
  assert.equal(result.footerHidden, true, label + ': secondary controls do not add permanent page height');
  const outside = result.controls.filter(r => r.width <= 0 || r.height <= 0 || r.x < result.portrait.x - 2 || r.y < result.portrait.y - 2 || r.right > result.portrait.right + 2 || r.bottom > result.portrait.bottom + 2);
  assert.deepEqual(outside.map(r => r.id), [], label + ': every original control stays inside the screen');
  assert.deepEqual(result.controls.filter(r => !r.hit).map(r => r.id), [], label + ': visible control centres remain tappable');
  const primary = frame.locator('.portrait [data-control="primary"]');
  if (await primary.count()) {
    await primary.scrollIntoViewIfNeeded();
    const r = await primary.boundingBox();
    assert(r && r.height > 0, label + ': main action remains reachable');
    await primary.click({ trial: true });
    await frame.evaluate(() => scrollTo(0, 0));
  }
  await frame.locator('.statusbar [data-action="home"]').click({ trial: true });
  return { screen: label, width: result.width, height: result.height, portraitHeight: result.portrait.height, controls: result.controls.length };
}

async function checkOptions(frame, label, screenshotPage) {
  const toggle = frame.locator('[data-desire-options]'), panel = frame.locator('.screen-footer[data-desire-panel]');
  assert.equal(await toggle.getAttribute('aria-label'), 'Opciones de la práctica');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  const before = await frame.evaluate(() => (window.SPM_WEEK3_REVIEW || window.SPM_WEEK4_REVIEW).getState());
  await toggle.click();
  await panel.waitFor({ state: 'visible' });
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(await panel.getAttribute('role'), 'dialog');
  assert.equal(await panel.locator('.quick button').count(), 3, label + ': previous, guide and next actions remain available');
  await panel.locator('.quick [data-action="back"]').click({ trial: true });
  if (screenshotPage) await screenshotPage.screenshot({ path: path.join(artifacts, 'options-panel-390x844.png') });
  await panel.locator('[data-desire-options-close]').click();
  await panel.waitFor({ state: 'hidden' });
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(await toggle.evaluate(el => document.activeElement === el), true, label + ': closing restores focus');
  await toggle.click();
  await panel.waitFor({ state: 'visible' });
  await panel.locator('[data-desire-options-close]').press('Escape');
  await panel.waitFor({ state: 'hidden' });
  assert.deepEqual(await frame.evaluate(() => (window.SPM_WEEK3_REVIEW || window.SPM_WEEK4_REVIEW).getState()), before, label + ': options do not change clinical answers or completion');
}

(async () => {
  const browser = engine === 'webkit' ? await webkit.launch({ headless: true }) : await chromium.launch({ headless: true, executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: viewports[0], isMobile: true, hasTouch: true });
  const page = await context.newPage(), errors = [], results = [];
  page.on('pageerror', error => errors.push({ url: page.url(), message: error.message }));
  try {
    await page.route('**/tests/desire-layout-host.html*', route => {
      const screen = screens.find(item => item.id === new URL(route.request().url()).searchParams.get('screen'));
      assert(screen, 'known geometry fixture');
      return route.fulfill({ status: 200, contentType: 'text/html', body: hostDocument(screen) });
    });
    for (const screen of screens) {
      await page.setViewportSize(viewports[0]);
      const url = new URL(hostUrl); url.searchParams.set('screen', screen.id);
      await page.goto(url.href, { waitUntil: 'domcontentloaded' });
      const frame = await getFrame(page, '#practice');
      await frame.locator(`.portrait[data-screen="${screen.id}"][data-spm-layout="bands"]`).waitFor({ timeout: 15000 });
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        results.push(await checkGeometry(frame, screen.id, viewport));
        if (viewport.height === 844 && portraitShots.has(screen.id) || viewport.height === 650 && screen.id === 'd16_01') {
          await page.screenshot({ path: path.join(artifacts, `${screen.id}-${viewport.width}x${viewport.height}.png`) });
        }
        if (viewport.height === 844) await checkOptions(frame, screen.id, screen.id === 'd15_01' ? page : null);
      }
      assert.equal(await page.evaluate(() => window.__layoutMessages.some(type => /_COMPLETE$/.test(type))), false, screen.id + ': geometry never completes an activity');
    }

    // Moving the required partner checkbox into Options must not hide consent
    // or replace the separate confirmation of current willingness.
    await page.setViewportSize(viewports[0]);
    const consentUrl = new URL(hostUrl); consentUrl.searchParams.set('screen', 'd19_01');
    await page.goto(consentUrl.href, { waitUntil: 'domcontentloaded' });
    const consentFrame = await getFrame(page, '#practice');
    await settleLayout(consentFrame);
    await consentFrame.locator('[data-control="primary"]').click();
    assert.equal(await consentFrame.locator('.portrait').getAttribute('data-screen'), 'd19_01', 'current willingness is still required');
    await consentFrame.locator('[data-control="ready"]').click();
    await settleLayout(consentFrame);
    await consentFrame.locator('[data-control="primary"]').click();
    await consentFrame.locator('.portrait[data-screen="d19_02"][data-spm-layout="bands"]').waitFor();
    await consentFrame.locator('[data-control="variant-partner"]').click();
    const consentPanel = consentFrame.locator('.screen-footer[data-desire-panel]');
    await consentPanel.waitFor({ state: 'visible' });
    const consent = consentPanel.locator('[data-partner-consent]');
    assert.equal(await consent.isChecked(), false, 'partner consent starts unanswered');
    await consentPanel.locator('.quick [data-action="next"]').click();
    assert.equal(await consentFrame.locator('.portrait').getAttribute('data-screen'), 'd19_02', 'opening Options does not grant consent');
    await consent.check();
    assert.equal(await consentFrame.evaluate(() => window.SPM_WEEK3_REVIEW.getState().session[19].partnerConsent), true);
    await consentPanel.locator('[data-desire-options-close]').click();
    await consentPanel.waitFor({ state: 'hidden' });
    assert.equal(await consentFrame.locator('.portrait').evaluate(el => el.inert), false, 'closing the consent panel releases the practice');
    const consentRecord = await consentFrame.evaluate(() => window.SPM_WEEK3_REVIEW.getState().session[19]);
    assert.equal(consentRecord.step, 2); assert.equal(consentRecord.status, 'draft'); assert.equal(consentRecord.confirm, false);
    await consentFrame.locator('[data-control="primary"]').click();
    await consentFrame.locator('.portrait[data-screen="d19_03"][data-spm-layout="bands"]').waitFor();
    assert.equal(await page.evaluate(() => window.__layoutMessages.some(type => /_COMPLETE$/.test(type))), false);

    // The existing resource dialog owns focus while open. Closing it must
    // restore the week 4 portrait rather than leave a hidden inert panel.
    const guideUrl = new URL(hostUrl); guideUrl.searchParams.set('screen', 'd27_02');
    await page.goto(guideUrl.href, { waitUntil: 'domcontentloaded' });
    const guideFrame = await getFrame(page, '#practice');
    await settleLayout(guideFrame);
    await guideFrame.locator('[data-desire-options]').click();
    await guideFrame.locator('.screen-footer[data-desire-panel]').waitFor({ state: 'visible' });
    await guideFrame.locator('.screen-footer [data-action="guide-text"]').click();
    await guideFrame.locator('#resourceOverlay .modal-card').waitFor({ state: 'visible' });
    await guideFrame.locator('.screen-footer[data-desire-panel]').waitFor({ state: 'hidden' });
    assert.equal(await guideFrame.locator('.guide-transcript').innerText() !== '', true);
    await guideFrame.locator('#resourceOverlay [data-modal-action="close"]').first().click();
    await guideFrame.locator('#resourceOverlay').waitFor({ state: 'hidden' });
    assert.equal(await guideFrame.locator('.portrait').evaluate(el => el.inert), false);
    assert.equal(await guideFrame.locator('[data-desire-options]').getAttribute('aria-expanded'), 'false');
    await guideFrame.locator('[data-control="primary"]').click({ trial: true });
    const guideRecord = await guideFrame.evaluate(() => window.SPM_WEEK4_REVIEW.getState().sessions[27]);
    assert.equal(guideRecord.step, 2); assert.equal(guideRecord.status, 'draft'); assert.equal(guideRecord.confirm, false);

    // Integration uses the real isolated reviewer, not the geometry parent.
    await page.setViewportSize(viewports[0]);
    await page.goto(new URL('revision-programas-28-dias.html?agenda=legacy&programa=desire&dia=15', base).href, { waitUntil: 'domcontentloaded' });
    await page.locator('#reviewDay:not([disabled])').waitFor({ timeout: 30000 });
    assert.equal(await page.evaluate(() => window.SPM_RESOURCE_CONTEXT().scheduleVersion), 'legacy');
    for (const day of [15, 22, 27, 28]) {
      if (await page.locator('#reviewDay').inputValue() !== String(day)) await page.locator('#reviewDay').selectOption(String(day));
      await page.waitForFunction(day => window.SPM_RESOURCE_CONTEXT?.().day === day && !document.querySelector('#reviewDay').disabled, day);
      await page.locator('#spmDailySession [data-daily-open="main"]').click();
      const root = `.spm-ds-week${day <= 21 ? 3 : 4}-root`, selector = root + ' iframe';
      await page.locator(selector).waitFor({ state: 'visible' });
      const frame = await getFrame(page, selector);
      await settleLayout(frame);
      const host = await page.locator(root).evaluate(el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return { top: r.top, left: r.left, width: r.width, height: r.height, position: s.position, border: s.borderTopWidth, radius: s.borderRadius, documentOverflow: getComputedStyle(document.documentElement).overflowY }; });
      assert.equal(host.position, 'fixed');
      assert(Math.abs(host.top) <= 1 && Math.abs(host.left) <= 1);
      assert(Math.abs(host.width - 390) <= 1 && Math.abs(host.height - 844) <= 1, `Central day ${day}: no surrounding card`);
      assert.equal(host.border, '0px'); assert.equal(host.radius, '0px'); assert.equal(host.documentOverflow, 'hidden');
      assert.equal(await frame.evaluate(() => (window.SPM_WEEK3_REVIEW || window.SPM_WEEK4_REVIEW).day()), day);
      await checkGeometry(frame, 'central-day-' + day, viewports[0]);
      if (day === 15) await page.screenshot({ path: path.join(artifacts, 'central-fullscreen-390x844.png') });
      await frame.locator('.statusbar [data-action="home"]').click();
      await page.locator(root).waitFor({ state: 'detached' });
      const state = await page.evaluate(async day => {
        const c = window.SPM_RESOURCE_CONTEXT();
        if (c.userId !== 'review-only' || c.planId !== 'review-desire') throw Error('Only isolated review records may be inspected.');
        return { day: c.day, daily: await window.SPM_DAILY_RECORDS.read(c.userId + ':' + c.planId, day), overflow: getComputedStyle(document.documentElement).overflowY };
      }, day);
      assert.equal(state.day, day);
      assert.notEqual(state.daily.main?.completed, true, 'returning from a draft does not complete the activity');
      assert.notEqual(state.overflow, 'hidden', 'Central scrolling is restored after exit');
      await page.locator('#spmDailySession [data-daily-open="main"]').click({ trial: true });
    }
    const beforeReport = await page.evaluate(async () => {
      const c = window.SPM_RESOURCE_CONTEXT();
      return window.SPM_DAILY_RECORDS.readCheckpoints(c.userId + ':' + c.planId);
    });
    await page.locator('#spmDailySession [data-daily-open="main"]').click();
    const reportFrame = await getFrame(page, '.spm-ds-week4-root iframe');
    await settleLayout(reportFrame);
    await reportFrame.locator('[data-control="primary"]').click();
    await page.locator('.spm-ds-week4-root').waitFor({ state: 'detached' });
    await page.locator('[data-program-report]').waitFor({ state: 'visible' });
    assert.match(await page.locator('[data-program-report] h3').innerText(), /Tu informe final/);
    const afterReport = await page.evaluate(async () => {
      const c = window.SPM_RESOURCE_CONTEXT(), scope = c.userId + ':' + c.planId;
      return { day: c.day, checkpoints: await window.SPM_DAILY_RECORDS.readCheckpoints(scope), daily: await window.SPM_DAILY_RECORDS.read(scope, 28) };
    });
    assert.equal(afterReport.day, 28);
    assert.deepEqual(afterReport.checkpoints, beforeReport, 'opening the report never creates or completes an evaluation');
    assert.notEqual(afterReport.daily.main?.completed, true, 'opening the report preserves a draft');
    await page.locator('[data-checkpoint-back]').click();
    await page.locator('#spmDailySession [data-daily-open="main"]').click({ trial: true });
    assert.equal(results.length, 64 * viewports.length);
    assert.deepEqual(errors, [], 'no browser exceptions during geometry or exit');
    const summary = { result: 'PASS', browser: engine, screens: 64, viewportChecks: results.length, viewports, centralDays: [15, 22, 27, 28], optionsPanels: 64, partnerConsentPanel: true, week4ResourceReturn: true, day28ReportWithoutEvaluation: true, browserErrors: errors.length, geometry: results };
    fs.writeFileSync(path.join(artifacts, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify({ ...summary, geometry: undefined }));
  } catch (error) {
    fs.writeFileSync(path.join(artifacts, 'failure.txt'), String(error.stack || error));
    await page.screenshot({ path: path.join(artifacts, 'failure.png'), fullPage: true }).catch(() => {});
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
