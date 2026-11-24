// @vitest-environment jsdom
import { act, StrictMode, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import type { DailyActivity } from '@/lib/central';
import { playAudio, setAudioMuted, stopAudio } from '@/lib/breath-audio';
import { claimPlayback } from '@/lib/breath-playback';
import { DailyBreathingJourney } from './DailyBreathingJourney';

const close = vi.fn(), openLibrary = vi.fn(), onSave = vi.fn(), setNoHold = vi.fn();
let audioState: { muted: boolean; id: string | null; error: string | null };
let root: Root | undefined, element: HTMLDivElement | undefined;
vi.mock('@/lib/central', () => ({ host: () => ({ close, openLibrary }) }));
vi.mock('@/lib/breath-audio', () => ({ hasAudio: () => true, playAudio: vi.fn(), stopAudio: vi.fn(), setAudioMuted: vi.fn() }));
vi.mock('@/lib/breath-playback', () => ({ claimPlayback: vi.fn() }));
vi.mock('@/lib/use-breath-audio', () => ({ useBreathAudio: () => audioState }));
vi.mock('./DemoVideo', () => ({ DemoVideo: ({ kind = 'final' }: { kind?: string }) => <div data-demo-video={kind} /> }));
vi.mock('./PracticeBlock', () => ({
  PracticeBlock: ({ id, onSave: save, goSafety }: { id: string; onSave: (value: object) => Promise<void>; goSafety: () => void }) => {
    const [finished, setFinished] = useState(false);
    return <section data-practice={id}><button onClick={() => setFinished(true)}>Finalizar guía de prueba</button>{finished && <><button onClick={goSafety}>Revisar seguridad desde registro</button><button onClick={() => void save({ practice: id, seconds: 0.25, comfort: 4, dizzy: false, noHold: true, date: '2026-11-20T12:00:00Z' })}>Guardar registro de prueba</button></>}</section>;
  },
}));

const activity = (day = 3): DailyActivity => {
  const entries: Record<number, [string, number[]]> = { 1: ['breath-start', [6, 10]], 3: ['breath-learn', [3, 4]], 6: ['breath-release', [9]], 10: ['breath-two', [11]], 13: ['breath-rescue', [10]], 17: ['breath-arousal', [8]], 20: ['breath-regulate', [7]], 24: ['breath-consolidate', [11]], 27: ['breath-autonomy', [11]] };
  const [id, steps] = entries[day];
  return { id, day, steps, title: 'Actividad de respiración', summary: 'Observa a tu ritmo.', minutes: 2 };
};
beforeEach(() => {
  vi.useRealTimers();
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  window.scrollTo = vi.fn();
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  close.mockReset().mockResolvedValue(true); openLibrary.mockReset().mockResolvedValue(true);
  onSave.mockReset().mockResolvedValue(undefined); setNoHold.mockReset();
  vi.mocked(stopAudio).mockReset(); vi.mocked(playAudio).mockReset().mockReturnValue(true);
  vi.mocked(setAudioMuted).mockReset(); vi.mocked(claimPlayback).mockReset();
  audioState = { muted: false, id: null, error: null };
});
afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined; element?.remove(); element = undefined;
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  vi.useRealTimers();
});
async function mount(assignment: DailyActivity | null = activity(), day = assignment?.day ?? 3, practiceAllowed = true, strict = false) {
  element = document.createElement('div'); document.body.append(element); root = createRoot(element);
  const journey = <DailyBreathingJourney assignment={assignment} day={day} practiceAllowed={practiceAllowed} noHold setNoHold={setNoHold} onSave={onSave} />;
  await act(async () => root!.render(strict ? <StrictMode>{journey}</StrictMode> : journey));
}
const button = (text: string) => Array.from(element!.querySelectorAll('button')).find(node => node.textContent === text)!;
async function click(text: string) { await act(async () => button(text).click()); }
const stage = () => element!.querySelector('.bl-route-shell')?.getAttribute('data-route-stage');
const narrationButton = (id: string) => element!.querySelector<HTMLButtonElement>(`[data-narration="${id}"] .bl-audio`)!;
async function listen(id: string) { await act(async () => narrationButton(id).click()); }
function expectNoHeaderVoice() {
  const header = element!.querySelector('.bl-route-header')!;
  expect(header.querySelectorAll('button')).toHaveLength(1);
  expect(header.querySelector('button')!.getAttribute('aria-label')).toBe('Inicio de la actividad');
  expect(header.querySelector('.bl-voice-toggle,.bl-voice-play,.bl-audio')).toBeNull();
}
async function rerender(assignment: DailyActivity = activity(), day = assignment.day, practiceAllowed = true) {
  await act(async () => root!.render(<DailyBreathingJourney assignment={assignment} day={day} practiceAllowed={practiceAllowed} noHold setNoHold={setNoHold} onSave={onSave} />));
}

test('StrictMode setup does not close the activity, start narration or create a record', async () => {
  await mount(activity(), 3, true, true);
  expect(stage()).toBe('1'); expect(close).not.toHaveBeenCalled(); expect(openLibrary).not.toHaveBeenCalled();
  expect(playAudio).not.toHaveBeenCalled(); expect(onSave).not.toHaveBeenCalled();
  await click('Continuar'); expect(stage()).toBe('2'); expect(close).not.toHaveBeenCalled();
});

test.each([
  { day: 3, ids: ['screen.02', 'screen.03', 'screen.04', 'instruction.daily.4-6'] },
  { day: 6, ids: ['screen.07', 'screen.06', 'screen.10', 'instruction.daily.flexible'] },
])('day $day keeps its content narration in all four stages without a header speaker', async ({ day, ids }) => {
  await mount(activity(day));
  expect(playAudio).not.toHaveBeenCalled();
  for (let index = 0; index < ids.length; index++) {
    expectNoHeaderVoice();
    expect(narrationButton(ids[index]).closest('header')).toBeNull();
    expect(narrationButton(ids[index]).getAttribute('aria-pressed')).toBe('false');
    await listen(ids[index]);
    expect(playAudio).toHaveBeenLastCalledWith(ids[index]);
    if (index < ids.length - 1) {
      vi.mocked(stopAudio).mockClear();
      await click('Continuar');
      expect(stopAudio).toHaveBeenCalled();
    }
  }
  expect(onSave).not.toHaveBeenCalled();
});

test('content narration unmutes on an explicit tap, reflects playback and stops without a duplicate header control', async () => {
  audioState = { muted: true, id: null, error: null };
  await mount();
  expectNoHeaderVoice();
  await listen('screen.02');
  expect(setAudioMuted).toHaveBeenCalledWith(false);
  expect(playAudio).toHaveBeenCalledWith('screen.02');
  expect(vi.mocked(setAudioMuted).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(playAudio).mock.invocationCallOrder[0]);
  audioState = { muted: false, id: 'screen.02', error: null };
  await rerender();
  expectNoHeaderVoice();
  expect(narrationButton('screen.02').textContent).toBe('Detener voz');
  expect(narrationButton('screen.02').getAttribute('aria-pressed')).toBe('true');
  vi.mocked(stopAudio).mockClear(); vi.mocked(playAudio).mockClear();
  await listen('screen.02');
  expect(stopAudio).toHaveBeenCalledTimes(1); expect(playAudio).not.toHaveBeenCalled();
  audioState = { muted: false, id: null, error: null };
  await rerender();
  expect(narrationButton('screen.02').textContent).toBe('Escuchar explicación');
  expect(onSave).not.toHaveBeenCalled();
});

test('unrelated phase cues do not mark the content explanation as playing', async () => {
  audioState = { muted: false, id: 'cue.inhale', error: null };
  await mount();
  expectNoHeaderVoice();
  expect(narrationButton('screen.02').getAttribute('aria-pressed')).toBe('false');
  await listen('screen.02');
  expect(playAudio).toHaveBeenCalledWith('screen.02');
});

test('a blocked final practice has no instruction control while safety keeps its own content narration', async () => {
  await mount(activity(), 3, false);
  await click('Continuar'); await click('Continuar'); await click('Continuar');
  expectNoHeaderVoice();
  expect(element!.querySelector('.bl-route-instructions')).toBeNull();
  expect(element!.querySelector('.bl-route-content .bl-audio')).toBeNull();
  expect(playAudio).not.toHaveBeenCalled();
  await click('Ver señales de seguridad');
  expectNoHeaderVoice();
  expect(narrationButton('screen.17').closest('.bl-route-safety')).not.toBeNull();
  await listen('screen.17'); expect(playAudio).toHaveBeenLastCalledWith('screen.17');
  await click('Volver a la actividad');
  expectNoHeaderVoice(); expect(element!.querySelector('.bl-route-instructions')).toBeNull();
  expect(element!.querySelector('[data-practice]')).toBeNull(); expect(onSave).not.toHaveBeenCalled();
});

test('starting the approved external first-practice guide stops native voice and other playback', async () => {
  await mount(activity(1));
  expectNoHeaderVoice(); await listen('screen.07'); expect(playAudio).toHaveBeenCalledWith('screen.07');
  vi.mocked(stopAudio).mockClear(); vi.mocked(claimPlayback).mockClear();
  await act(async () => window.dispatchEvent(new Event('spm:breathing-stop-audio')));
  expect(stopAudio).toHaveBeenCalledTimes(1); expect(claimPlayback).toHaveBeenCalledTimes(1);
  expect(onSave).not.toHaveBeenCalled();
});

test('narration shows its button before a closed transcript and keeps the instruction stop label', async () => {
  await mount();
  const narration = element!.querySelector('.bl-route-audio')!;
  expect(narration.firstElementChild?.tagName).toBe('BUTTON');
  expect(narration.querySelector('summary')!.textContent).toBe('Leer explicación');
  expect(narration.querySelector('details')!.open).toBe(false);
  await click('Continuar'); await click('Continuar'); await click('Continuar');
  audioState = { muted: false, id: 'instruction.daily.4-6', error: null };
  await act(async () => root!.render(<DailyBreathingJourney assignment={activity()} day={3} practiceAllowed noHold setNoHold={setNoHold} onSave={onSave} />));
  expect(button('Detener instrucción')).toBeTruthy();
  await click('Detener instrucción'); expect(stopAudio).toHaveBeenCalled();
});

test('a malformed assignment cannot render its title or displace the authoritative Central day', async () => {
  const malformed = { ...activity(), day: 999, title: 'Invalid assignment title', summary: 'Invalid assignment summary', steps: null } as unknown as DailyActivity;
  await mount(malformed, 3);
  expect(element!.querySelector('.bl-central-day')!.textContent).toBe('Día 3 de 28 · Actividad asignada');
  expect(element!.textContent).not.toContain('Invalid assignment');
  expect(element!.textContent).not.toContain('999');
  expect(element!.querySelector('[data-practice]')).toBeNull(); expect(button('Continuar')).toBeUndefined();
  expect(onSave).not.toHaveBeenCalled();
});

test('recognition uses four stages, retains observations on back navigation and only saves after the final practice', async () => {
  await mount();
  expect(stage()).toBe('1'); expect(element!.querySelector('[data-route-assignment="breath-learn"]')).not.toBeNull();
  expect(element!.querySelector('[data-practice]')).toBeNull();
  await click('Torácica · pecho'); expect(element!.querySelector('.bl-pattern-guide[data-mode="chest"]')).not.toBeNull();
  await click('Escuchar explicación'); expect(playAudio).toHaveBeenCalledWith('screen.02');
  await click('Continuar'); expect(stage()).toBe('2');
  await click('Abdomen'); await click('La mano del abdomen sube al inhalar');
  await click('Continuar'); expect(stage()).toBe('3');
  expect(element!.querySelector('[data-demo-video="final"]')?.closest('details')).toBeNull();
  expect(element!.querySelector('[data-practice]')).toBeNull();
  await click('Atrás'); expect(button('Abdomen').getAttribute('aria-pressed')).toBe('true');
  expect(button('La mano del abdomen sube al inhalar').getAttribute('aria-pressed')).toBe('true');
  await click('Continuar'); await click('Continuar');
  expect(stage()).toBe('4'); expect(element!.querySelectorAll('[data-practice]')).toHaveLength(1);
  expect(element!.querySelector('[data-practice="core-426"]')).not.toBeNull();
  expect(onSave).not.toHaveBeenCalled(); expect(setNoHold).not.toHaveBeenCalled();
  await click('Escuchar instrucción'); expect(playAudio).toHaveBeenLastCalledWith('instruction.daily.4-6');
  await click('Finalizar guía de prueba'); expect(onSave).not.toHaveBeenCalled();
  await click('Guardar registro de prueba'); expect(onSave).toHaveBeenCalledTimes(1);
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ practice: 'core-426', seconds: 0.25 }));
  expect(close).not.toHaveBeenCalled();
});

test.each([1, 6, 13, 20, 27])('release day %s reuses hand observations without adding a preparation pacer', async day => {
  await mount(activity(day));
  expect(element!.textContent).toContain('Mandíbula, hombros y abdomen');
  await click('Escuchar explicación'); expect(playAudio).toHaveBeenLastCalledWith('screen.07');
  await click('Continuar'); expect(element!.textContent).toContain('Autoverificación');
  expect(element!.textContent).not.toContain('¿Qué mano se mueve más?');
  await click('Escuchar explicación'); expect(playAudio).toHaveBeenLastCalledWith('screen.06');
  expect(element!.querySelector('[data-practice]')).toBeNull();
  await click('Continuar');
  expect(element!.querySelector('[data-demo-video="regulation"]') !== null).toBe(day === 20);
  expect(element!.querySelector('[data-practice]')).toBeNull();
  await click('Continuar'); expect(element!.querySelectorAll('[data-practice]')).toHaveLength(1);
  expect(onSave).not.toHaveBeenCalled(); await click('Volver a Hoy'); expect(close).toHaveBeenCalledTimes(1);
  expect(onSave).not.toHaveBeenCalled();
});

test('release illustrations run once automatically without controls, narration or clinical recording', async () => {
  vi.useFakeTimers();
  await mount(activity(6));
  expect(playAudio).not.toHaveBeenCalled();
  for (const expectedStage of ['2', '3']) {
    await click('Continuar'); expect(stage()).toBe(expectedStage); expectNoHeaderVoice();
    const guide = element!.querySelector('.bl-pattern-guide')!;
    expect(guide.getAttribute('data-running')).toBe('true');
    expect(guide.getAttribute('data-brief')).toBe('true');
    expect(element!.querySelector('.bl-pattern-toggle')).toBeNull();
    expect(element!.querySelector('[data-practice]')).toBeNull();
    expect(playAudio).not.toHaveBeenCalled(); expect(onSave).not.toHaveBeenCalled(); expect(setNoHold).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTime(3999)); expect(guide.getAttribute('data-running')).toBe('true');
    await act(async () => vi.advanceTimersByTime(1)); expect(guide.getAttribute('data-running')).toBe('false');
    await act(async () => vi.advanceTimersByTime(4000)); expect(guide.getAttribute('data-running')).toBe('false');
  }
  expect(playAudio).not.toHaveBeenCalled(); expect(onSave).not.toHaveBeenCalled(); expect(setNoHold).not.toHaveBeenCalled();
});

test.each([1, 6, 13, 20, 27])('release day %s replaces the open preparation card with its own audio and closed transcript', async day => {
  await mount(activity(day)); await click('Continuar'); await click('Continuar');
  expectNoHeaderVoice();
  expect(Array.from(element!.querySelectorAll('h2')).some(node => node.textContent === 'Acomódate antes de empezar')).toBe(false);
  const section = element!.querySelector('[data-narration="instruction.prepare"]')!;
  const control = narrationButton('instruction.prepare');
  expect(control.textContent).toBe('Escuchar audio');
  expect(control.getAttribute('aria-label')).toBe('Escuchar audio para acomodarte');
  expect(section.querySelector('summary')!.textContent).toBe('Leer explicación');
  expect(section.querySelector('details')!.open).toBe(false);
  expect(section.querySelector('details p')!.textContent).toContain('Espalda apoyada');
  expect(section.previousElementSibling!.matches('.bl-pattern-guide,.bl-route-media')).toBe(true);
  expect(playAudio).not.toHaveBeenCalled(); expect(onSave).not.toHaveBeenCalled();
  await listen('instruction.prepare'); expect(playAudio).toHaveBeenLastCalledWith('instruction.prepare');
  audioState = { muted: false, id: 'instruction.prepare', error: null }; await rerender(activity(day));
  expect(narrationButton('instruction.prepare').getAttribute('aria-pressed')).toBe('true');
  expect(narrationButton('instruction.prepare').getAttribute('aria-label')).toBe('Detener audio para acomodarte');
  vi.mocked(stopAudio).mockClear(); vi.mocked(playAudio).mockClear();
  await listen('instruction.prepare'); expect(stopAudio).toHaveBeenCalledTimes(1); expect(playAudio).not.toHaveBeenCalled();
  expect(onSave).not.toHaveBeenCalled();
});

test.each([10, 17, 24])('recognition day %s keeps the demonstration optional', async day => {
  await mount(activity(day)); await click('Continuar'); await click('Continuar');
  const demo = element!.querySelector('[data-demo-video="final"]')?.closest('details');
  expect(demo).not.toBeNull(); expect(demo!.open).toBe(false);
  expect(element!.querySelector('[data-practice]')).toBeNull();
});

test.each([
  { name: 'restriction', assignment: activity(3), day: 3, allowed: false },
  { name: 'other calendar day', assignment: activity(27), day: 3, allowed: true },
  { name: 'no assignment', assignment: null, day: 3, allowed: true },
  { name: 'unknown assignment', assignment: { ...activity(3), id: 'future-session' }, day: 3, allowed: true },
])('$name permits education but cannot open a pacer or create a result', async item => {
  await mount(item.assignment, item.day, item.allowed);
  expect(element!.querySelector('[role="status"]')).not.toBeNull();
  while (button('Continuar')) await click('Continuar');
  expect(element!.querySelector('[data-practice]')).toBeNull();
  expect(onSave).not.toHaveBeenCalled(); expect(setNoHold).not.toHaveBeenCalled();
});

test('explicit listening restores muted narration; navigation, hiding and exit stop media without recording', async () => {
  audioState = { muted: true, id: null, error: null };
  await mount(); await click('Escuchar explicación');
  expect(setAudioMuted).toHaveBeenCalledWith(false); expect(playAudio).toHaveBeenCalledWith('screen.02');
  vi.mocked(stopAudio).mockClear(); vi.mocked(claimPlayback).mockClear();
  await click('Continuar'); expect(stopAudio).toHaveBeenCalled(); expect(claimPlayback).toHaveBeenCalled();
  vi.mocked(stopAudio).mockClear();
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  await act(async () => document.dispatchEvent(new Event('visibilitychange')));
  expect(stopAudio).toHaveBeenCalled();
  await click('Consultar biblioteca completa'); expect(openLibrary).toHaveBeenCalledTimes(1);
  expect(onSave).not.toHaveBeenCalled();
});

test('the safety panel pauses playback and preserves the unsaved check-in on return', async () => {
  await mount(); await click('Continuar'); await click('Continuar'); await click('Continuar');
  await click('Finalizar guía de prueba');
  vi.mocked(stopAudio).mockClear(); vi.mocked(claimPlayback).mockClear();
  await click('Revisar seguridad desde registro');
  expect(element!.querySelector<HTMLDivElement>('.bl-route-content')!.hidden).toBe(true);
  expect(element!.querySelector('h1')!.textContent).toBe('Señales para detenerte');
  expect(stopAudio).toHaveBeenCalled(); expect(claimPlayback).toHaveBeenCalled(); expect(onSave).not.toHaveBeenCalled();
  await click('Volver a la actividad');
  expect(element!.querySelector<HTMLDivElement>('.bl-route-content')!.hidden).toBe(false);
  expect(button('Guardar registro de prueba')).toBeTruthy(); expect(stage()).toBe('4');
  expect(onSave).not.toHaveBeenCalled();
});

test('opening safety pauses the illustrative movement without resuming it on return', async () => {
  await mount();
  const movement = () => element!.querySelector('.bl-pattern-guide')!.getAttribute('data-running');
  expect(movement()).toBe('false');
  await click('Diafragmática · abdomen'); expect(movement()).toBe('true');
  await click('Ver señales de seguridad'); expect(movement()).toBe('false');
  await click('Volver a la actividad'); expect(movement()).toBe('false');
  expect(onSave).not.toHaveBeenCalled();
});

test('comparison tabs request their own narration and restart the brief illustration even for the same selected ID', async () => {
  vi.useFakeTimers();
  audioState = { muted: true, id: null, error: null };
  await mount();
  const guide = () => element!.querySelector('.bl-pattern-guide')!;
  expectNoHeaderVoice(); expect(element!.querySelector('.bl-pattern-toggle')).toBeNull();
  expect(guide().getAttribute('data-running')).toBe('false');
  expect(playAudio).not.toHaveBeenCalled();
  await click('Diafragmática · abdomen');
  expect(guide().getAttribute('data-mode')).toBe('diaphragm');
  expect(guide().getAttribute('data-running')).toBe('true');
  expect(setAudioMuted).toHaveBeenCalledWith(false);
  expect(playAudio).toHaveBeenLastCalledWith('comparison.diaphragm');
  expect(vi.mocked(setAudioMuted).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(playAudio).mock.invocationCallOrder[0]);
  audioState = { muted: false, id: 'comparison.diaphragm', error: null }; await rerender();
  await click('Torácica · pecho');
  expect(guide().getAttribute('data-mode')).toBe('chest');
  expect(guide().getAttribute('data-running')).toBe('true');
  expect(playAudio).toHaveBeenLastCalledWith('comparison.chest');
  audioState = { muted: false, id: 'comparison.chest', error: null }; await rerender();
  await act(async () => vi.advanceTimersByTime(4000)); expect(guide().getAttribute('data-running')).toBe('false');
  vi.mocked(stopAudio).mockClear();
  await click('Torácica · pecho'); expect(guide().getAttribute('data-running')).toBe('true');
  expect(vi.mocked(playAudio).mock.calls.map(([id]) => id)).toEqual(['comparison.diaphragm', 'comparison.chest', 'comparison.chest']);
  expect(stopAudio).not.toHaveBeenCalled();
  expect(element!.querySelector('.bl-pattern-toggle')).toBeNull();
  expect(narrationButton('screen.02').getAttribute('aria-pressed')).toBe('false');
  await listen('screen.02'); expect(playAudio).toHaveBeenLastCalledWith('screen.02');
  await click('Continuar'); await click('Atrás');
  expect(guide().getAttribute('data-running')).toBe('false');
  expect(stopAudio).toHaveBeenCalled(); expectNoHeaderVoice(); expect(onSave).not.toHaveBeenCalled();
});
