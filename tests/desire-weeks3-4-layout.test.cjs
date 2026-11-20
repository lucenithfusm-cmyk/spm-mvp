const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { root, screens } = require('./desire-weeks3-4-layout-fixtures.cjs');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'premium-v2/desire-photo-layout-v1.js'), 'utf8'), sandbox);
const layout = sandbox.window.SPM_DESIRE_PHOTO_LAYOUT;

test('all 64 approved screen variants have a bounded photo band and a real WebP resource', () => {
  assert.equal(screens.length, 64);
  assert.deepEqual(Object.keys(layout).sort(), screens.map(screen => screen.id).sort());
  const photos = new Set();
  for (const screen of screens) {
    const band = layout[screen.id];
    assert(Number.isFinite(band.y) && band.y > 0, screen.id + ': photo starts inside the canvas');
    assert(Number.isFinite(band.height) && band.height > 0 && band.y + band.height < 1536, screen.id + ': full photo band stays inside the canvas');
    const photo = path.resolve(root, `premium-v2/desire-week${screen.week}-v1`, band.src);
    assert(photo.startsWith(path.join(root, 'premium-v2/desire-photo-v1') + path.sep), screen.id + ': scoped photo path');
    const bytes = fs.readFileSync(photo);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', screen.id + ': WebP container exists');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', screen.id + ': WebP image exists');
    photos.add(photo);
  }
  assert.equal(photos.size, 14, 'fourteen daily illustrations are available to the two weeks');
});

test('both viewers load the same photo map and layout assets before their existing application', () => {
  for (const week of [3, 4]) {
    const dir = path.join(root, `premium-v2/desire-week${week}-v1`);
    const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
    for (const file of ['desire-photo-layout-v1.js', 'desire-screen-layout-v1.js', 'desire-screen-layout-v1.css']) {
      assert.equal([...html.matchAll(new RegExp(file.replaceAll('.', '\\.'), 'g'))].length, 1, `week ${week}: a single ${file}`);
      assert(fs.existsSync(path.join(root, 'premium-v2', file)), `week ${week}: ${file} exists`);
    }
    const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)].map(match => match[1].split('?')[0]);
    assert(scripts.indexOf('../desire-photo-layout-v1.js') < scripts.indexOf('../desire-screen-layout-v1.js'));
    assert(scripts.indexOf('../desire-screen-layout-v1.js') < scripts.indexOf('app.js'));
  }
});

