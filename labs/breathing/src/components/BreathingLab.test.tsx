// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BreathingLab } from './BreathingLab';
import type { CentralContext } from '@/lib/central';
import { playAudio, stopAudio, setAudioMuted } from '@/lib/breath-audio';

const state: Record<string, string> = {};
const flush = vi.fn(), recordDaily = vi.fn(), close = vi.fn();
let context: CentralContext, hasRecordDaily = true;
let audioState: { muted: boolean; id: string | null; error: string | null };
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
  AUDIO_IDS: { screen: (n: number) => `screen.${n}` }, hasAudio: (id: string) => ['instruction.daily.4-6', 'instruction.daily.flexible'].includes(id),
  playAudio: vi.fn(), stopAudio: vi.fn(), setAudioMuted: vi.fn(),
}));
vi.mock('@/lib/use-breath-audio', () => ({
  useBreathAudio: () => audioState,
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
  vi.mocked(playAudio).mockReset().mockReturnValue(true);
  vi.mocked(stopAudio).mockReset(); vi.mocked(setAudioMuted).mockReset();
  audioState = { muted: false, id: null, error: null };
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

for (const [day, step, audioId, middleStep] of [
  [3, 4, 'instruction.daily.4-6', 'Usa el ritmo como apoyo: inhala durante cuatro segundos y exhala durante seis, sin pausa entre ambos. Repite a tu ritmo.'],
  [10, 11, 'instruction.daily.flexible', 'Respira con comodidad y observa cómo se mueve el abdomen. Usa la guía como apoyo y nota si te ayuda a soltar tensión.'],
] as const) test(`day ${day} narrates the current instructions and keeps the practice duration flexible`, async () => {
  context = {
    day, origin: 'dailyPlan', restriction: 'none', mode: 'daily',
    activity: { id: `breath-${day}`, day, title: 'Respiración', summary: 'A tu ritmo.', steps: [step], minutes: 2 },
  };
  await mount();
  expect(Array.from(el!.querySelectorAll('.bl-main ol li'), li => li.textContent)).toEqual([
    'Pulsa «Iniciar» y sigue la guía visual.',
    middleStep,
    'Cuando hayas realizado la práctica, pulsa «Ya realicé la práctica · Registrar». Indica cómo te sentiste y pulsa «Guardar registro».',
  ]);
  expect(el!.textContent).not.toMatch(/cinco ciclos|dos minutos|cinco minutos|pausa dos/i);
  const listen = button('Escuchar instrucción');
  expect(listen).toBeTruthy(); expect(listen.disabled).toBe(false); expect(listen.getAttribute('aria-pressed')).toBe('false');
  await click('Escuchar instrucción');
  expect(playAudio).toHaveBeenCalledTimes(1); expect(vi.mocked(playAudio).mock.calls[0]?.[0]).toBe(audioId);
  expect(flush).not.toHaveBeenCalled(); expect(recordDaily).not.toHaveBeenCalled(); expect(JSON.parse(state['spmb-sessions']!)).toEqual([]);
  audioState = { muted: false, id: audioId, error: null };
  await act(async () => root!.render(<BreathingLab practiceAllowed />));
  expect(button('Detener instrucción').getAttribute('aria-pressed')).toBe('true');
  await click('Detener instrucción'); expect(stopAudio).toHaveBeenCalled();
  await click('Confirmar experiencia de prueba'); await click('Guardar registro');
  expect(JSON.parse(state['spmb-sessions']!)).toMatchObject([{ day, seconds: 0.25 }]);
  expect(recordDaily).toHaveBeenCalledTimes(1); expect(close).not.toHaveBeenCalled();
});

test('the new instruction button respects the existing mute setting', async () => {
  audioState = { muted: true, id: null, error: null };
  await mount();
  expect(button('Escuchar instrucción').disabled).toBe(true);
  await click('Escuchar instrucción'); expect(playAudio).not.toHaveBeenCalled();
  expect(recordDaily).not.toHaveBeenCalled();
});
