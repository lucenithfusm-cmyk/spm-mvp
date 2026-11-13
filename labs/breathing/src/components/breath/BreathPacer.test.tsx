// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BreathPacer } from './BreathPacer';
import { stopAudio } from '@/lib/breath-audio';

vi.mock('@/lib/breath-audio', () => ({
  AUDIO_IDS: { cue: (name: string) => name }, playAudio: vi.fn(), stopAudio: vi.fn(),
}));
vi.mock('@/lib/breath-playback', () => ({ claimPlayback: vi.fn(), registerPlayback: () => () => {} }));
vi.mock('./AnatomyGuide', () => ({ AnatomyGuide: () => null }));

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

test('explicit completion works during a running guide and preserves a subsecond duration', async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  vi.useFakeTimers(); let now = 0; vi.spyOn(performance, 'now').mockImplementation(() => now);
  const finish = vi.fn(), el = document.createElement('div'); document.body.append(el); const root = createRoot(el);
  const button = (text: string) => Array.from(el.querySelectorAll('button')).find(b => b.textContent === text)!;
  try {
    await act(async () => root.render(<BreathPacer pattern={{ inhale: 4, hold: 0, exhale: 6 }} noHold durationSec={120} onFinish={finish} />));
    expect(button('Ya realicé la práctica · Registrar')).toBeUndefined();
    await act(async () => button('Iniciar').click());
    now = 100; await act(async () => vi.advanceTimersByTime(100));
    expect(el.querySelector('[data-running]')?.getAttribute('data-running')).toBe('true');
    await act(async () => button('Ya realicé la práctica · Registrar').click());
    expect(finish).toHaveBeenCalledTimes(1); expect(finish).toHaveBeenCalledWith(0.1);
    expect(el.querySelector('[data-running]')?.getAttribute('data-running')).toBe('false');
    expect(stopAudio).toHaveBeenCalled();
    now = 5100; await act(async () => vi.advanceTimersByTime(5000));
    expect(finish).toHaveBeenCalledTimes(1);
  } finally { await act(async () => root.unmount()); el.remove(); }
});

test('hiding a running guide still pauses it without completing the practice', async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  vi.useFakeTimers(); let now = 0; vi.spyOn(performance, 'now').mockImplementation(() => now);
  const finish = vi.fn(), el = document.createElement('div'); document.body.append(el); const root = createRoot(el);
  try {
    await act(async () => root.render(<BreathPacer pattern={{ inhale: 4, hold: 0, exhale: 6 }} noHold onFinish={finish} />));
    await act(async () => Array.from(el.querySelectorAll('button')).find(b => b.textContent === 'Iniciar')!.click());
    now = 100; await act(async () => vi.advanceTimersByTime(100));
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    await act(async () => document.dispatchEvent(new Event('visibilitychange')));
    now = 1100; await act(async () => vi.advanceTimersByTime(1000));
    expect(finish).not.toHaveBeenCalled(); expect(el.querySelector('[data-running]')?.getAttribute('data-running')).toBe('false');
  } finally { await act(async () => root.unmount()); el.remove(); Object.defineProperty(document, 'hidden', { configurable: true, value: false }); }
});
