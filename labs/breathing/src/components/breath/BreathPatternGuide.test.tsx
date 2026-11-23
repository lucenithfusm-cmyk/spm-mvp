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
const originalIntersectionObserver = window.IntersectionObserver;

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
  vi.useRealTimers();
  if (originalHidden) Object.defineProperty(document, 'hidden', originalHidden);
  else delete (document as unknown as Record<string, unknown>).hidden;
  window.matchMedia = originalMedia;
  window.IntersectionObserver = originalIntersectionObserver;
});
const running = () => container.querySelector('figure')!.getAttribute('data-running');
const toggle = async () => act(async () => container.querySelector('button')!.click());
const render = async (props: BreathPatternGuideProps) => act(async () => root.render(<StrictMode><BreathPatternGuide {...props} /></StrictMode>));

function mockIntersectionObserver() {
  const observers: FakeObserver[] = [];
  class FakeObserver {
    target: Element | null = null;
    disconnect = vi.fn();
    constructor(private callback: IntersectionObserverCallback, readonly options?: IntersectionObserverInit) { observers.push(this); }
    observe(element: Element) { this.target = element; }
    emit(ratio: number) {
      this.callback([{ target: this.target, isIntersecting: ratio > 0, intersectionRatio: ratio } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
    emitMeasuredIntersection() {
      const rect = this.target!.getBoundingClientRect();
      const bottomMargin = Number.parseFloat(this.options?.rootMargin?.split(' ')[2] ?? '0');
      const rootBottom = window.innerHeight + bottomMargin;
      this.emit(Math.max(0, Math.min(rect.bottom, rootBottom) - Math.max(rect.top, 0)) / rect.height);
    }
  }
  window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
  return observers;
}

async function loadOriginalImage() {
  const image = container.querySelector('img')!;
  Object.defineProperty(image, 'complete', { configurable: true, value: true });
  Object.defineProperty(image, 'naturalWidth', { configurable: true, value: 1536 });
  await act(async () => image.dispatchEvent(new Event('load')));
}

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

test('a control-free automatic guide plays one four-second visual effect and stops without replaying on rerender', async () => {
  vi.useFakeTimers();
  const changed = vi.fn();
  const props = { mode: 'diaphragm', autoPlay: true, showControls: false, onRunningChange: changed } as const;
  await render(props);
  expect(running()).toBe('true');
  expect(container.querySelector('button')).toBeNull();
  expect(container.querySelector('figure')!.style.getPropertyValue('--bl-pattern-cycle')).toBe('4000ms');
  expect(container.textContent).toContain('Expansión ilustrativa');
  expect(container.textContent).not.toContain('Inhala ·');
  expect(changed).toHaveBeenCalledTimes(1);
  await act(async () => vi.advanceTimersByTime(3999));
  expect(running()).toBe('true');
  await act(async () => vi.advanceTimersByTime(1));
  expect(running()).toBe('false');
  expect(changed).toHaveBeenLastCalledWith(false);
  await render(props);
  await act(async () => vi.advanceTimersByTime(8000));
  expect(running()).toBe('false');
  expect(container.querySelector('button')).toBeNull();
  expect(changed).toHaveBeenCalledTimes(2);
});

test('a repeated selection restarts the whole brief effect and replaces its previous stop timer', async () => {
  vi.useFakeTimers();
  const props = { mode: 'chest', activationKey: 0, showControls: false } as const;
  await render(props);
  expect(running()).toBe('false');
  await render({ ...props, activationKey: 1 });
  expect(running()).toBe('true');
  expect(container.querySelector('button')).toBeNull();
  await act(async () => vi.advanceTimersByTime(3000));
  const firstVisual = container.querySelector('.bl-pattern-visual');
  await render({ ...props, activationKey: 2 });
  expect(container.querySelector('.bl-pattern-visual')).not.toBe(firstVisual);
  await act(async () => vi.advanceTimersByTime(1500));
  expect(running()).toBe('true');
  await act(async () => vi.advanceTimersByTime(2500));
  expect(running()).toBe('false');
  await render({ ...props, mode: 'diaphragm', activationKey: 3 });
  expect(running()).toBe('true');
  await act(async () => vi.advanceTimersByTime(4000));
  expect(running()).toBe('false');
  expect(container.querySelector('button')).toBeNull();
});

test.each(['hidden', 'reduced', 'suspended'] as const)('an automatic request blocked by %s stays static after the block clears', async block => {
  vi.useFakeTimers();
  hidden = block === 'hidden'; reduced = block === 'reduced';
  const props = { mode: 'diaphragm', autoPlay: true, showControls: false } as const;
  await render({ ...props, suspended: block === 'suspended' });
  expect(running()).toBe('false');
  expect(container.querySelector('button')).toBeNull();
  await act(async () => {
    hidden = false; document.dispatchEvent(new Event('visibilitychange'));
    reduced = false; media.dispatchEvent(new Event('change'));
  });
  await render({ ...props, suspended: false });
  await act(async () => vi.advanceTimersByTime(5000));
  expect(running()).toBe('false');
});

test('safety and unmount cancel the automatic visual timer without a delayed callback', async () => {
  vi.useFakeTimers();
  const changed = vi.fn();
  const props = { mode: 'diaphragm', autoPlay: true, showControls: false, onRunningChange: changed } as const;
  await render(props);
  await act(async () => vi.advanceTimersByTime(1000));
  await render({ ...props, suspended: true });
  expect(running()).toBe('false');
  const calls = changed.mock.calls.length;
  await render({ ...props, suspended: false });
  await act(async () => vi.advanceTimersByTime(5000));
  expect(running()).toBe('false');
  expect(changed).toHaveBeenCalledTimes(calls);
  await act(async () => root.render(<></>));
  await render(props);
  expect(running()).toBe('true');
  await act(async () => root.render(<></>));
  const unmountCalls = changed.mock.calls.length;
  await act(async () => vi.advanceTimersByTime(5000));
  expect(changed).toHaveBeenCalledTimes(unmountCalls);
});

test('automatic motion waits for half of the loaded image to be visible and never replays on scroll', async () => {
  vi.useFakeTimers();
  const observers = mockIntersectionObserver();
  const changed = vi.fn();
  await render({ mode: 'diaphragm', autoPlay: true, showControls: false, onRunningChange: changed });
  const observer = observers.at(-1)!;
  expect(observer.target).toBe(container.querySelector('.bl-pattern-visual'));
  expect(running()).toBe('false');
  await loadOriginalImage();
  await act(async () => observer.emit(.49));
  await act(async () => vi.advanceTimersByTime(10000));
  expect(running()).toBe('false');
  expect(changed).not.toHaveBeenCalled();
  await act(async () => observer.emit(.5));
  expect(running()).toBe('true');
  expect(observer.disconnect).toHaveBeenCalled();
  await act(async () => vi.advanceTimersByTime(4000));
  expect(running()).toBe('false');
  await act(async () => { observer.emit(0); observer.emit(1); });
  expect(running()).toBe('false');
  expect(changed).toHaveBeenCalledTimes(2);
});

test('a visible automatic guide waits for the original image to finish loading', async () => {
  const observers = mockIntersectionObserver();
  await render({ mode: 'diaphragm', autoPlay: true, showControls: false });
  await act(async () => observers.at(-1)!.emit(1));
  expect(running()).toBe('false');
  await loadOriginalImage();
  expect(running()).toBe('true');
});

test('automatic motion excludes the image area covered by the route footer', async () => {
  const observers = mockIntersectionObserver();
  const footerHeight = 71;
  await act(async () => root.render(<StrictMode><div className="bl-route-shell">
    <BreathPatternGuide mode="diaphragm" autoPlay showControls={false} />
    <footer className="bl-route-footer" ref={node => {
      if (node) node.getBoundingClientRect = () => new DOMRect(0, window.innerHeight - footerHeight, 320, footerHeight);
    }} />
  </div></StrictMode>));
  const observer = observers.at(-1)!;
  // An implicit root belongs to the outer page, so its margin cannot exclude an iframe footer.
  expect(observer.options?.root).toBe(observer.target!.ownerDocument);
  expect(observer.options?.rootMargin).toBe('0px 0px -71px 0px');
  // At a 509px viewport this is 356.609–545.94: only 81.391/189.331px are uncovered.
  let top = window.innerHeight - 152.391;
  observer.target!.getBoundingClientRect = () => new DOMRect(0, top, 284, 189.331);
  await loadOriginalImage();
  await act(async () => observer.emitMeasuredIntersection());
  expect(running()).toBe('false');
  top -= 30;
  await act(async () => observer.emitMeasuredIntersection());
  expect(running()).toBe('true');
});

test.each(['suspended', 'hidden', 'reduced'] as const)('%s cancels an automatic request still waiting for the image to enter view', async block => {
  const observers = mockIntersectionObserver();
  const props = { mode: 'diaphragm', autoPlay: true, showControls: false } as const;
  await render(props);
  const observer = observers.at(-1)!;
  await loadOriginalImage();
  if (block === 'suspended') await render({ ...props, suspended: true });
  else await act(async () => {
    if (block === 'hidden') { hidden = true; document.dispatchEvent(new Event('visibilitychange')); }
    else { reduced = true; media.dispatchEvent(new Event('change')); }
  });
  expect(observer.disconnect).toHaveBeenCalled();
  await act(async () => {
    hidden = false; document.dispatchEvent(new Event('visibilitychange'));
    reduced = false; media.dispatchEvent(new Event('change'));
  });
  await render({ ...props, suspended: false });
  await act(async () => observer.emit(1));
  expect(running()).toBe('false');
});

test('explicit selections start immediately and cancel an automatic visibility wait', async () => {
  const observers = mockIntersectionObserver();
  const props = { mode: 'diaphragm', activationKey: 0, autoPlay: true, showControls: false } as const;
  await render(props);
  const observer = observers.at(-1)!;
  expect(running()).toBe('false');
  await render({ ...props, mode: 'chest', activationKey: 1 });
  expect(running()).toBe('true');
  expect(observer.disconnect).toHaveBeenCalled();
  expect(container.querySelector('img')!.naturalWidth).toBe(0);
  await act(async () => root.render(<></>));
  await act(async () => observer.emit(1));
  expect(container.querySelector('figure')).toBeNull();
});
