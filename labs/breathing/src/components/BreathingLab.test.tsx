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
  AUDIO_IDS: { screen: (n: number) => `screen.${String(n).padStart(2, '0')}` },
  hasAudio: (id: string) => /^screen\.(?:0[1-9]|1[0-8])$/.test(id) || ['instruction.daily.4-6', 'instruction.daily.flexible'].includes(id),
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
    activity: { id: 'breath-learn', day: 3, title: 'Respiración', summary: 'A tu ritmo.', steps: [3, 4], minutes: 2 },
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
const advanceToPractice = async () => { for (let stage = 0; stage < 3; stage++) await click('Continuar'); };

test('daily confirmation flushes the session before recording the central activity', async () => {
  await mount();
  expect(recordDaily).not.toHaveBeenCalled();
  await advanceToPractice();
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
  await mount(); if (context.mode === 'daily') await advanceToPractice(); await click('Confirmar experiencia de prueba');
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
  await mount(); if (context.mode === 'daily') await advanceToPractice(); await click('Confirmar experiencia de prueba'); await click('Guardar registro');
  expect(flush).toHaveBeenCalledTimes(1);
  expect(recordDaily).not.toHaveBeenCalled();
  expect(el!.textContent).toContain('Guardado en tu programa');
});

test('returning to Today before saving never records a daily activity', async () => {
  await mount(); await click('Atrás');
  expect(close).toHaveBeenCalledTimes(1);
  expect(flush).not.toHaveBeenCalled();
  expect(recordDaily).not.toHaveBeenCalled();
});

test('an older daily host without recordDaily keeps the existing save behavior', async () => {
  hasRecordDaily = false;
  await mount(); if (context.mode === 'daily') await advanceToPractice(); await click('Confirmar experiencia de prueba'); await click('Guardar registro');
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
    activity: { id: day === 3 ? 'breath-learn' : 'breath-two', day, title: 'Respiración', summary: 'A tu ritmo.', steps: day === 3 ? [3, step] : [step], minutes: 2 },
  };
  await mount(); await advanceToPractice();
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

test('an explicit instruction tap restores previously muted narration without an upper speaker', async () => {
  audioState = { muted: true, id: null, error: null };
  await mount(); await advanceToPractice();
  expect(button('Escuchar instrucción').disabled).toBe(false);
  expect(el!.querySelector('.bl-voice-toggle,.bl-voice-play,.bl-voice-label')).toBeNull();
  expect(el!.querySelector('.bl-top .bl-audio')).toBeNull();
  await click('Escuchar instrucción');
  expect(setAudioMuted).toHaveBeenCalledWith(false);
  expect(playAudio).toHaveBeenCalledWith('instruction.daily.4-6');
  expect(recordDaily).not.toHaveBeenCalled();
});

test('all eighteen library screens retain content narration and navigation without header voice controls', async () => {
  context = { day: 3, origin: 'library', restriction: 'none', mode: 'library', launchStep: 0 };
  await mount();
  for (let step = 0; step < 18; step++) {
    const header = el!.querySelector('.bl-top')!;
    expect(el!.querySelector('.bl-voice-toggle,.bl-voice-play,.bl-voice-label')).toBeNull();
    expect(header.querySelector('.bl-audio')).toBeNull();
    expect(Array.from(header.querySelectorAll('button'), control => control.getAttribute('aria-label'))).toEqual(['Inicio', 'Abrir índice']);
    expect(header.querySelector('.bl-counter')?.textContent).toBe(`${String(step + 1).padStart(2, '0')}/18`);
    const explanation = el!.querySelector<HTMLButtonElement>('.bl-main .bl-trainer .bl-audio')!;
    expect(explanation.textContent?.trim()).toBe('Escuchar');
    expect(explanation.disabled).toBe(false);
    if (step < 17) await act(async () => el!.querySelector<HTMLButtonElement>('.bl-foot .bl-btn.teal')!.click());
  }
  expect(playAudio).not.toHaveBeenCalled();
  expect(flush).not.toHaveBeenCalled();
  expect(recordDaily).not.toHaveBeenCalled();
  expect(JSON.parse(state['spmb-sessions']!)).toEqual([]);
  expect(context.day).toBe(3);
});

test('the library explanation button unmutes, plays its current recording and stops without saving', async () => {
  context = { day: 3, origin: 'library', restriction: 'none', mode: 'library', launchStep: 1 };
  audioState = { muted: true, id: null, error: null };
  await mount();
  const explanation = () => el!.querySelector<HTMLButtonElement>('.bl-main .bl-trainer .bl-audio')!;
  expect(playAudio).not.toHaveBeenCalled();
  expect(explanation().getAttribute('aria-pressed')).toBe('false');
  await act(async () => explanation().click());
  expect(setAudioMuted).toHaveBeenCalledWith(false);
  expect(playAudio).toHaveBeenCalledExactlyOnceWith('screen.02');
  audioState = { muted: false, id: 'screen.02', error: null };
  await act(async () => root!.render(<BreathingLab practiceAllowed />));
  expect(explanation().textContent?.trim()).toBe('Detener voz');
  expect(explanation().getAttribute('aria-pressed')).toBe('true');
  vi.mocked(stopAudio).mockClear();
  await act(async () => explanation().click());
  expect(stopAudio).toHaveBeenCalledTimes(1);
  expect(flush).not.toHaveBeenCalled();
  expect(recordDaily).not.toHaveBeenCalled();
  expect(JSON.parse(state['spmb-sessions']!)).toEqual([]);
});
