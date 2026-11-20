// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { BreathPatternGuide } from './BreathPatternGuide';

let container: HTMLDivElement;
let root: Root;
let hidden = false;
let reduced = false;
let media: EventTarget;
const originalHidden = Object.getOwnPropertyDescriptor(document, 'hidden');
const originalMedia = window.matchMedia;

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  hidden = false; reduced = false;
  media = new EventTarget();
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  window.matchMedia = vi.fn(() => ({
    get matches() { return reduced; },
    addEventListener: media.addEventListener.bind(media),
    removeEventListener: media.removeEventListener.bind(media),
  } as MediaQueryList));
  container = document.createElement('div'); document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount()); container.remove();
  if (originalHidden) Object.defineProperty(document, 'hidden', originalHidden);
  else delete (document as unknown as Record<string, unknown>).hidden;
  window.matchMedia = originalMedia;
});
const running = () => container.querySelector('figure')!.getAttribute('data-running');
const toggle = async () => act(async () => container.querySelector('button')!.click());

test('the illustration starts paused, plays on request and resets when comparing the other area', async () => {
  await act(async () => root.render(<BreathPatternGuide mode="chest" />));
  expect(running()).toBe('false');
  await toggle(); expect(running()).toBe('true');
  await act(async () => root.render(<BreathPatternGuide mode="diaphragm" />));
  expect(running()).toBe('false');
  expect(container.querySelector('img')!.src).toContain('respiracion-diafragmatica-premium.jpg');
  await toggle(); expect(running()).toBe('true');
  await toggle(); expect(running()).toBe('false');
});

test('hiding the page pauses the visual without restarting it on return or leaking listeners', async () => {
  const changed = vi.fn();
  await act(async () => root.render(<BreathPatternGuide mode="diaphragm" onRunningChange={changed} />));
  await toggle(); expect(running()).toBe('true');
  await act(async () => { hidden = true; document.dispatchEvent(new Event('visibilitychange')); });
  expect(running()).toBe('false');
  await act(async () => { hidden = false; document.dispatchEvent(new Event('visibilitychange')); });
  expect(running()).toBe('false');
  await act(async () => root.render(<></>));
  const calls = changed.mock.calls.length;
  await act(async () => { hidden = true; document.dispatchEvent(new Event('visibilitychange')); });
  expect(changed).toHaveBeenCalledTimes(calls);
});

test('reduced-motion preference prevents playback and stops an already running demonstration', async () => {
  reduced = true;
  await act(async () => root.render(<BreathPatternGuide mode="chest" />));
  expect(container.querySelector('button')!.disabled).toBe(true);
  expect(running()).toBe('false');
  await act(async () => { reduced = false; media.dispatchEvent(new Event('change')); });
  expect(container.querySelector('button')!.disabled).toBe(false);
  await toggle(); expect(running()).toBe('true');
  await act(async () => { reduced = true; media.dispatchEvent(new Event('change')); });
  expect(running()).toBe('false');
  expect(container.querySelector('button')!.disabled).toBe(true);
});
