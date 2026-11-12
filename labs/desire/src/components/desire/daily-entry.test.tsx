// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { DesireLab } from './DesireLab';
import { initialState, STORAGE } from '@/lib/desire-data';
import { generateToday } from '@/lib/desire-engine';
let root: Root | undefined;
const click = async (text: string) => { const b=Array.from(document.querySelectorAll('button')).find(b=>b.textContent?.includes(text)); expect(b).toBeTruthy(); await act(async()=>b!.click()); };
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(async () => { vi.useRealTimers(); if(root) await act(async()=>root!.unmount()); root=undefined; document.body.innerHTML=''; });
describe('Paid daily Desire entry',()=>{
 it.each(Array.from({length:28},(_,i)=>i+1))('opens day %s practice without introductory video, including replayed mount',async(day)=>{
  const state: Record<string,string> = {[STORAGE.state]:JSON.stringify({...initialState,health:['none'],stimuli:['touch']}),[STORAGE.step]:'1'};
  Object.defineProperty(window,'parent',{configurable:true,value:{SPM_DESIRE_LAB_HOST:{getContext:()=>({day,origin:'dailyPlan',restriction:'none'}),getState:()=>state,write:(k:string,v:string)=>{state[k]=v;return true;}}}});
  window.history.replaceState(null,'','/'); window.scrollTo=vi.fn();
  document.body.innerHTML='<div id="root"></div>';root=createRoot(document.getElementById('root')!);
  await act(async()=>root!.render(<StrictMode><DesireLab /></StrictMode>));
  const expected=generateToday({...initialState,health:['none'],stimuli:['touch']},day)[0]!;
  expect(document.body.textContent).toContain(expected.title);
  expect(document.body.textContent).toContain(`Día ${day}`);
  expect(document.querySelector('video')).toBeNull();
  if(day === 1) {
    expect(document.body.textContent).toContain('Las dos formas del deseo');
    expect(document.querySelector('.dz-timer')).toBeNull();
    const choose = document.querySelector('[aria-label="Se parece a mí hoy: Me dan ganas"]') as HTMLButtonElement;
    await act(async()=>choose.click());
    expect(document.body.textContent).toContain('Reconoce lo que despierta tu interés');
    expect(document.querySelector('.dz-steps')?.textContent).toContain('recuerda una situación reciente');
    expect(document.querySelector('[aria-label="Las dos formas del deseo"]')).toBeNull();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Instrucciones de la actividad');
    await click('Cambiar mi elección');
    await act(async()=>(document.querySelector('[aria-label="Se parece a mí hoy: Me voy conectando"]') as HTMLButtonElement).click());
    expect(document.body.textContent).toContain('Crea espacio para conectar');
    expect(document.querySelector('.dz-steps')?.textContent).toContain('sostener una taza tibia');
    expect(document.querySelector('.dz-timer')).toBeNull();
    const saved=JSON.parse(state['spm-desire-program']!);
    expect(saved.detailNotes.form).toBe('resp');
    expect(saved.sessions).toHaveLength(0);
    vi.useFakeTimers();
    await click('Iniciar mi práctica');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Práctica en curso');
    expect(document.querySelector('.dz-clock')?.textContent).toBe('05:00');
    expect(document.querySelector('[aria-label="Las dos formas del deseo"]')).toBeNull();
    await act(async()=>vi.advanceTimersByTime(300000));
    expect(document.querySelector('.dz-timer')).toBeNull();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Registra tu experiencia');
    await click('Guardar y continuar');
    expect(document.body.textContent).toContain('Ahora amplía tus posibilidades');
    const follow = Array.from(document.querySelectorAll('button')).find(b=>b.textContent?.includes('Explorar otro estímulo'))!;
    await act(async()=>follow.click());
    expect(document.querySelector('.dz-steps')?.textContent).toContain('diferente al de la primera práctica');
    expect(document.body.textContent).toContain('Ampliar tus posibilidades de disfrute');
    await click('Iniciar mi práctica');
    expect(document.querySelector('.dz-clock')?.textContent).toBe('03:00');
    await click('Ya terminé');
    const confirm = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await act(async()=>confirm.click());
    await click('Guardar y continuar');
    expect(document.body.textContent).toContain('Actividad completada');
    expect(JSON.parse(state['spm-desire-program']!).sessions.filter((s:any)=>s.status==='completed')).toHaveLength(2);
    vi.useRealTimers();
  } else {
    expect(document.querySelector('.dz-steps li')).not.toBeNull();
    expect(document.querySelector('.dz-timer')).toBeNull();
    await click('Iniciar mi práctica');
    expect(document.querySelector('.dz-timer')).not.toBeNull();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Práctica en curso');
    await click('Volver a las instrucciones');
    expect(document.querySelector('.dz-timer')).toBeNull();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Instrucciones de la actividad');
  }
  expect(document.querySelector('.dz-foot')).toBeNull();
 });
 it('day one begins with five minutes of practice',()=>{
  const first=generateToday(initialState,1)[0]!;
  expect(first.practiceId).toBe('presence-5');
 });
});
