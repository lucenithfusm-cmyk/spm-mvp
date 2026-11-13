// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BreathingLab } from './BreathingLab';
import type { CentralContext } from '@/lib/central';

const state: Record<string, string> = {};
const flush = vi.fn(), recordDaily = vi.fn(), close = vi.fn();
let context: CentralContext, hasRecordDaily = true;
let root: Root | undefined, el: HTMLDivElement | undefined;

vi.mock('@/lib/central', () => ({
  centralContext: () => context,
  host: () => ({ flush, close, ...(hasRecordDaily ? { recordDaily } : {}) }),
  centralStorage: {
    getItem: (key: string) => state[key] ?? null,
    setItem: (key: string, value: string) => { state[key] = value; },
  },
}));
vi.mock('@/lib/breath-audio', () => ({
  AUDIO_IDS: { screen: (n: number) => `screen.${n}` }, hasAudio: () => false,
  playAudio: vi.fn(), stopAudio: vi.fn(), setAudioMuted: vi.fn(),
}));
vi.mock('@/lib/use-breath-audio', () => ({
  useBreathAudio: () => ({ muted: false, id: null, error: null }),
}));
vi.mock('@/components/breath/DemoVideo', () => ({ DemoVideo: () => null }));
vi.mock('@/components/breath/BreathPacer', () => ({
  BreathPacer: ({ onFinish }: { onFinish: (seconds: number) => void }) =>
    <button onClick={() => onFinish(0.25)}>Confirmar experiencia de prueba</button>,
}));

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  window.scrollTo = vi.fn();
  Object.keys(state).forEach(key => delete state[key]);
  flush.mockReset().mockResolvedValue(undefined);
  recordDaily.mockReset().mockResolvedValue(true);
  close.mockReset().mockResolvedValue(true);
  hasRecordDaily = true;
  context = {
    day: 3, origin: 'dailyPlan', restriction: 'none', mode: 'daily',
    activity: { id: 'breath-3', day: 3, title: 'Respiración', summary: 'A tu ritmo.', steps: [4], minutes: 2 },
  };
});
afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined; el?.remove(); el = undefined;
});
async function mount() {
  el = document.createElement('div'); document.body.append(el); root = createRoot(el);
  await act(async () => root!.render(<BreathingLab practiceAllowed />));
}
const button = (text: string) => Array.from(el!.querySelectorAll('button')).find(b => b.textContent === text)!;
const click = async (text: string) => { await act(async () => button(text).click()); };

test('daily confirmation flushes the session before recording the central activity', async () => {
  await mount();
  expect(recordDaily).not.toHaveBeenCalled();
  await click('Confirmar experiencia de prueba');
  expect(recordDaily).not.toHaveBeenCalled();
  await click('Guardar registro');
  expect(flush).toHaveBeenCalledTimes(1);
  expect(recordDaily).toHaveBeenCalledTimes(1);
  expect(flush.mock.invocationCallOrder[0]).toBeLessThan(recordDaily.mock.invocationCallOrder[0]!);
  expect(JSON.parse(state['spmb-sessions']!)).toMatchObject([{ day: 3, practice: 'core-426', seconds: 0.25 }]);
  expect(el!.textContent).toContain('Guardado en tu programa');
  expect(close).not.toHaveBeenCalled();
});

test('flush and daily-record failures keep the experience open and retry without duplicate sessions', async () => {
  await mount(); await click('Confirmar experiencia de prueba');
  flush.mockRejectedValueOnce(Error('offline'));
  await click('Guardar registro');
  expect(recordDaily).not.toHaveBeenCalled();
  expect(el!.textContent).toContain('No se pudo guardar');
  recordDaily.mockResolvedValueOnce(false);
  await click('Guardar registro');
  expect(recordDaily).toHaveBeenCalledTimes(1);
  expect(el!.textContent).toContain('No se pudo guardar');
  expect(el!.textContent).not.toContain('Guardado en tu programa');
  expect(close).not.toHaveBeenCalled();
  await click('Guardar registro');
  expect(recordDaily).toHaveBeenCalledTimes(2);
  expect(JSON.parse(state['spmb-sessions']!)).toHaveLength(1);
  expect(el!.textContent).toContain('Guardado en tu programa');
  expect(close).not.toHaveBeenCalled();
});

test('library saves never record a daily activity', async () => {
  context = { day: 3, origin: 'library', restriction: 'none', mode: 'library', launchStep: 4 };
  await mount(); await click('Confirmar experiencia de prueba'); await click('Guardar registro');
  expect(flush).toHaveBeenCalledTimes(1);
  expect(recordDaily).not.toHaveBeenCalled();
  expect(el!.textContent).toContain('Guardado en tu programa');
});

test('returning to Today before saving never records a daily activity', async () => {
  await mount(); await click('Volver a Hoy');
  expect(close).toHaveBeenCalledTimes(1);
  expect(flush).not.toHaveBeenCalled();
  expect(recordDaily).not.toHaveBeenCalled();
});

test('an older daily host without recordDaily keeps the existing save behavior', async () => {
  hasRecordDaily = false;
  await mount(); await click('Confirmar experiencia de prueba'); await click('Guardar registro');
  expect(flush).toHaveBeenCalledTimes(1);
  expect(recordDaily).not.toHaveBeenCalled();
  expect(el!.textContent).toContain('Guardado en tu programa');
});
