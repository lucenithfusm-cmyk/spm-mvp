// @vitest-environment jsdom
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { BreathPatternGuide, type BreathPatternGuideProps } from './BreathPatternGuide';

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
const render = async (props: BreathPatternGuideProps) => act(async () => root.render(<StrictMode><BreathPatternGuide {...props} /></StrictMode>));

test('a standalone guide has clear activate, pause and resume controls and resets on a mode-only change', async () => {
  await render({ mode: 'chest' });
  expect(running()).toBe('false');
  expect(container.querySelector('button')!.textContent).toBe('Activar guía visual');
  await toggle(); expect(running()).toBe('true');
  expect(container.querySelector('button')!.textContent).toBe('Pausar animación');
  await toggle(); expect(running()).toBe('false');
  expect(container.querySelector('button')!.textContent).toBe('Reanudar animación');
  await toggle(); expect(running()).toBe('true');
  await render({ mode: 'diaphragm' });
  expect(running()).toBe('false');
  expect(container.querySelector('img')!.src).toContain('respiracion-diafragmatica-premium.jpg');
  expect(container.querySelector('button')!.textContent).toBe('Activar guía visual');
  expect(container.textContent).toContain('Observa la zona del abdomen.');
  expect(container.textContent).toContain('Guía visual ilustrativa · respira a tu ritmo');
  expect(container.textContent).not.toContain('Ver movimiento');
});

test('each selection starts or restarts the illustration, including the selected mode, without an initial start button', async () => {
  const changed = vi.fn();
  const props = { mode: 'diaphragm', activationKey: 0, onRunningChange: changed } as const;
  await render(props);
  expect(running()).toBe('false');
  expect(container.querySelector('button')).toBeNull();
  await render({ ...props, activationKey: 1 });
  expect(running()).toBe('true');
  expect(container.querySelector('button')!.getAttribute('aria-pressed')).toBe('true');
  expect(container.querySelector('button')!.getAttribute('aria-label')).toBe('Pausar animación de abdomen y costillas bajas');
  const firstVisual = container.querySelector('.bl-pattern-visual');
  const firstCaption = container.querySelector('.bl-pattern-reading');
  await render({ ...props, activationKey: 1 });
  expect(container.querySelector('.bl-pattern-visual')).toBe(firstVisual);
  expect(changed).toHaveBeenCalledTimes(1);
  await render({ ...props, activationKey: 2 });
  expect(running()).toBe('true');
  expect(container.querySelector('.bl-pattern-visual')).not.toBe(firstVisual);
  expect(container.querySelector('.bl-pattern-reading')).not.toBe(firstCaption);
  await toggle(); expect(running()).toBe('false');
  expect(changed).toHaveBeenLastCalledWith(false);
  await render({ ...props, activationKey: 3 });
  expect(running()).toBe('true');
  await render({ ...props, mode: 'chest', activationKey: 4 });
  expect(running()).toBe('true');
  expect(container.querySelector('img')!.src).toContain('respiracion-toracica-premium.jpg');
  expect(changed).toHaveBeenLastCalledWith(true);
  await render({ ...props, activationKey: 4 });
  expect(running()).toBe('false');
});

test('hidden pages consume pending selections and do not restart on visibility or pageshow, with listeners removed on unmount', async () => {
  const changed = vi.fn();
  const props = { mode: 'diaphragm', activationKey: 0, onRunningChange: changed } as const;
  await render(props);
  await render({ ...props, activationKey: 1 });
  expect(running()).toBe('true');
  await act(async () => { hidden = true; document.dispatchEvent(new Event('visibilitychange')); });
  expect(running()).toBe('false');
  await render({ ...props, activationKey: 2 });
  await act(async () => { hidden = false; document.dispatchEvent(new Event('visibilitychange')); });
  expect(running()).toBe('false');
  await render({ ...props, activationKey: 3 });
  expect(running()).toBe('true');
  await act(async () => window.dispatchEvent(new Event('pagehide')));
  expect(running()).toBe('false');
  await act(async () => window.dispatchEvent(new Event('pageshow')));
  expect(running()).toBe('false');
  await act(async () => root.render(<></>));
  const calls = changed.mock.calls.length;
  await act(async () => {
    hidden = true; document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('pagehide'));
    reduced = true; media.dispatchEvent(new Event('change'));
  });
  expect(changed).toHaveBeenCalledTimes(calls);
});

test('safety suspension pauses immediately and navigation does not replay an old selection', async () => {
  const props = { mode: 'chest', activationKey: 0 } as const;
  await render(props);
  await render({ ...props, activationKey: 1 });
  expect(running()).toBe('true');
  await render({ ...props, activationKey: 1, suspended: true });
  expect(running()).toBe('false');
  expect(container.querySelector('button')!.disabled).toBe(true);
  await render({ ...props, activationKey: 2, suspended: true });
  await render({ ...props, activationKey: 2, suspended: false });
  expect(running()).toBe('false');
  expect(container.querySelector('button')!.textContent).toBe('Reanudar animación');
  await render({ ...props, activationKey: 3 });
  expect(running()).toBe('true');
  await act(async () => root.render(<></>));
  await render({ ...props, activationKey: 3 });
  expect(running()).toBe('false');
  expect(container.querySelector('button')).toBeNull();
});

test('reduced motion blocks selection requests and requires a fresh action after the preference changes', async () => {
  reduced = true;
  const props = { mode: 'chest', activationKey: 0 } as const;
  await render(props);
  await render({ ...props, activationKey: 1 });
  expect(running()).toBe('false');
  expect(container.textContent).toContain('preferencia de movimiento reducido');
  await act(async () => { reduced = false; media.dispatchEvent(new Event('change')); });
  expect(running()).toBe('false');
  await render({ ...props, activationKey: 2 });
  expect(running()).toBe('true');
  await act(async () => { reduced = true; media.dispatchEvent(new Event('change')); });
  expect(running()).toBe('false');
  expect(container.querySelector('button')!.disabled).toBe(true);
  await render({ ...props, activationKey: 3 });
  await act(async () => { reduced = false; media.dispatchEvent(new Event('change')); });
  expect(running()).toBe('false');
  await render({ ...props, activationKey: 4 });
  expect(running()).toBe('true');
});

test('a standalone guide still explains its static reduced-motion state', async () => {
  reduced = true;
  await render({ mode: 'chest' });
  expect(container.querySelector('button')!.disabled).toBe(true);
  expect(running()).toBe('false');
  await act(async () => { reduced = false; media.dispatchEvent(new Event('change')); });
  expect(container.querySelector('button')!.disabled).toBe(false);
  await toggle(); expect(running()).toBe('true');
  await act(async () => { reduced = true; media.dispatchEvent(new Event('change')); });
  expect(running()).toBe('false');
  expect(container.querySelector('button')!.disabled).toBe(true);
});

test('controlled playback remains pausable even if its parent has not yet acknowledged the pause', async () => {
  const changed = vi.fn();
  const props = { mode: 'chest', running: true, onRunningChange: changed } as const;
  await render(props);
  expect(running()).toBe('true');
  await toggle(); expect(running()).toBe('false');
  expect(changed).toHaveBeenLastCalledWith(false);
  await render(props); expect(running()).toBe('false');
  await render({ ...props, running: false });
  await render(props); expect(running()).toBe('true');
  await act(async () => { hidden = true; document.dispatchEvent(new Event('visibilitychange')); });
  await act(async () => { hidden = false; document.dispatchEvent(new Event('visibilitychange')); });
  expect(running()).toBe('false');
});
