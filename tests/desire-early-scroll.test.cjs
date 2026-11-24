'use strict';

// Exercise the actual touch controllers with a DOM host that replaces its
// scrolling element on innerHTML, as the browser does. This verifies scroll
// state restoration; rendered viewport geometry needs a browser separately.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function environment(day) {
  const key = `ds${day}Page`;
  let html = '', scene = null;
  const host = {
    isConnected: true,
    handlers: {},
    get innerHTML() { return html; },
    set innerHTML(value) {
      html = value;
      const match = value.match(new RegExp(`data-ds${day}-page="(\\d+)"`));
      scene = match ? { dataset: { [key]: match[1] }, scrollTop: 0, scrollIntoView() {} } : null;
    },
    get scene() { return scene; },
    contains: () => true,
    addEventListener(type, callback) { this.handlers[type] = callback; },
    querySelector(selector) {
      if (selector === `.spm-ds${day}-session` || selector === `[data-ds${day}-page]`) return scene;
      return null;
    },
    querySelectorAll() { return []; },
    click(action, value = '') {
      const act = day === 1 ? 'ds1Act' : `ds${day}Action`;
      const val = day === 1 ? 'ds1Val' : `ds${day}Value`;
      const element = { dataset: { [act]: action, [val]: value }, closest() { return this; } };
      this.handlers.click({ target: element });
    }
  };
  class Utterance { constructor(text) { this.text = text; } }
  const window = {
    speechSynthesis: { cancel() {}, speak() {} },
    SpeechSynthesisUtterance: Utterance,
    addEventListener() {}
  };
  const sandbox = {
    window, document: { hidden: false, addEventListener() {} },
    SpeechSynthesisUtterance: Utterance, AbortController, Date, JSON, console,
    performance: { now: () => 0 },
    setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1, clearInterval() {}
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, `../premium-v2/desire-day${day}-touch-v1.js`), 'utf8'), sandbox);
  return { host, api: window[`SPM_DESIRE_DAY${day}_TOUCH`] };
}

for (const day of [1, 2, 3]) {
  test(`Desire day ${day}: selecting preserves the current scroll; changing screen starts at the top`, async () => {
    const { host, api } = environment(day);
    let bundle = { 'spm-desire-program': JSON.stringify({ detailNotes: {}, sessions: [], dayDone: {} }) };
    assert.equal(await api.mount({ host, storage: { read: async () => bundle, save: async value => { bundle = value; } } }), true);
    if (day === 2) host.click('next');
    const page = host.scene.dataset[`ds${day}Page`];
    const previousScene = host.scene;
    previousScene.scrollTop = 237;
    host.click(day === 1 ? 'form' : 'choose', day === 1 ? 'resp' : day === 2 ? 'closeness' : 'embrace');
    assert.notEqual(host.scene, previousScene, 'a real render replaces the scroll container');
    assert.equal(host.scene.dataset[`ds${day}Page`], page);
    assert.equal(host.scene.scrollTop, 237, 'the below-fold selection stays visible');
    host.click('next');
    assert.equal(host.scene.dataset[`ds${day}Page`], String(Number(page) + 1));
    assert.equal(host.scene.scrollTop, 0, 'the next screen starts at its heading');
    host.scene.scrollTop = 173;
    host.click('back');
    assert.equal(host.scene.dataset[`ds${day}Page`], page);
    assert.equal(host.scene.scrollTop, 0, 'previous-screen navigation also starts at its heading');
    api.stop();
  });
}
