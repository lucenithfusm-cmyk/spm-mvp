// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { DesireLab } from './DesireLab';
import { initialState, STORAGE } from '@/lib/desire-data';
import { generateToday } from '@/lib/desire-engine';
import { initialProgram, PROGRAM_KEY, type Session } from '@/lib/desire-program';
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
  if(day!==1)expect(document.body.textContent).toContain(expected.title);
  expect(document.body.textContent).toContain(`Día ${day}`);
  expect(document.querySelector('video')).toBeNull();
  if(day === 1) {
    expect(document.body.textContent).toContain('Las dos formas del deseo');
    expect(document.querySelector('.dz-timer')).toBeNull();
    const choose = document.querySelector('[aria-label="Se parece a mí hoy: Me dan ganas"]') as HTMLButtonElement;
    await act(async()=>choose.click());
    expect(document.body.textContent).not.toContain('Explora sin exigencia');
    expect(document.querySelector('.dz-steps')?.textContent).toContain('recuerda una situación reciente');
    expect(document.querySelector('[aria-label="Las dos formas del deseo"]')).toBeNull();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Instrucciones de la actividad');
    await click('Cambiar mi elección');
    await act(async()=>(document.querySelector('[aria-label="Se parece a mí hoy: Me voy conectando"]') as HTMLButtonElement).click());
    expect(document.querySelector('.dz-steps')?.closest('details')?.open).toBe(false);
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
    await act(async()=>vi.advanceTimersByTime(10000));
    await click('Pausar');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Registra tu experiencia');
    expect(JSON.parse(state['spm-desire-program']!).sessions[0].status).toBe('paused');
    await click('Volver a la práctica');
    await click('Reanudar');
    await act(async()=>vi.advanceTimersByTime(290000));
    expect(document.querySelector('.dz-timer')).toBeNull();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Registra tu experiencia');
    await click('Guardar y continuar');
    expect(document.body.textContent).toContain('Ahora amplía tus posibilidades');
    const follow = Array.from(document.querySelectorAll('button')).find(b=>b.textContent?.includes('Explorar otro estímulo'))!;
    await act(async()=>follow.click());
    expect(document.querySelector('.dz-steps')?.textContent).toContain('diferente al de la primera práctica');
    expect(document.querySelector('.dz-steps')?.closest('details')?.open).toBe(false);
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
 it('stopping opens the record and continues without completing the exercise',async()=>{
  const state:Record<string,string>={[STORAGE.state]:JSON.stringify({...initialState,health:['none'],stimuli:['touch']})};
  const finishDaily=vi.fn(async()=>true);
  Object.defineProperty(window,'parent',{configurable:true,value:{SPM_DESIRE_LAB_HOST:{getContext:()=>({day:1,origin:'dailyPlan',restriction:'none'}),getState:()=>state,write:(k:string,v:string)=>{state[k]=v;return true;},finishDaily}}});
  window.history.replaceState(null,'','/');window.scrollTo=vi.fn();document.body.innerHTML='<div id="root"></div>';root=createRoot(document.getElementById('root')!);
  await act(async()=>root!.render(<DesireLab/>));
  await act(async()=>(document.querySelector('[aria-label="Se parece a mí hoy: Me dan ganas"]') as HTMLButtonElement).click());
  await click('Iniciar mi práctica');await click('Parar');
  expect(document.activeElement?.getAttribute('aria-label')).toBe('Registra tu experiencia');
  await click('Guardar y continuar');
  expect(finishDaily).toHaveBeenCalledWith(false);
  const sessions=JSON.parse(state['spm-desire-program']!).sessions;
  expect(sessions.every((s:any)=>s.status==='interrupted')).toBe(true);
 });
 it('day one begins with five minutes of practice',()=>{
  const first=generateToday(initialState,1)[0]!;
  expect(first.practiceId).toBe('presence-5');
 });

 const savedSession = (practiceId: string, day = 1, status: Session['status'] = 'completed', activeSec = 300): Session => ({
  id: `${practiceId}-${day}`, practiceId, day, date: '2026-11-12', variant: 'solo', status, activeSec,
  metricKey: 'local', before: 4, after: null, reflection: 'Una sensación cómoda',
 });
 const reopen = async (sessions: Session[], day = 1) => {
  const state: Record<string,string> = {
   [STORAGE.state]: JSON.stringify({...initialState,health:['none'],stimuli:['touch']}),
   [PROGRAM_KEY]: JSON.stringify({...initialProgram,sessions,detailNotes:{form:'resp'}}),
  };
  Object.defineProperty(window,'parent',{configurable:true,value:{SPM_DESIRE_LAB_HOST:{
   getContext:()=>({day,origin:'dailyPlan',restriction:'none'}), getState:()=>state,
   write:(k:string,v:string)=>{state[k]=v;return true;},
  }}});
  window.history.replaceState(null,'','/');window.scrollTo=vi.fn();document.body.innerHTML='<div id="root"></div>';
  root=createRoot(document.getElementById('root')!);
  await act(async()=>root!.render(<StrictMode><DesireLab/></StrictMode>));
  return state;
 };

 it('reopening after day-one presence continues with exploration and preserves the chosen form',async()=>{
  const sessions=[savedSession('presence-5')];
  const state=await reopen(sessions);
  expect(document.querySelector('[aria-label="Las dos formas del deseo"]')).toBeNull();
  expect(document.querySelector('.dz-steps')?.textContent).toContain('diferente al de la primera práctica');
  expect(document.querySelector('.dz-timer')).toBeNull();
  expect(JSON.parse(state[PROGRAM_KEY]!).sessions).toEqual(sessions);
  expect(JSON.parse(state[PROGRAM_KEY]!).detailNotes.form).toBe('resp');
 });

 it('reopening an interrupted exploration recovers active time without completing it or creating another session',async()=>{
  const sessions=[savedSession('presence-5'),savedSession('explore-new-stimulus',1,'interrupted',87)];
  const state=await reopen(sessions);
  expect(document.querySelector('.dz-clock')?.textContent).toBe('01:33');
  expect(Array.from(document.querySelectorAll('button')).some(b=>b.textContent?.includes('Reanudar'))).toBe(true);
  expect(JSON.parse(state[PROGRAM_KEY]!).sessions).toEqual(sessions);
  await click('Reanudar');
  await click('Pausar');
  const saved=JSON.parse(state[PROGRAM_KEY]!);
  expect(saved.sessions).toHaveLength(2);
  expect(saved.sessions[1]).toMatchObject({id:'explore-new-stimulus-1',status:'paused',activeSec:87,reflection:'Una sensación cómoda'});
 });

 it('does not automatically repeat the two day-one exercises after both are complete',async()=>{
  const sessions=[savedSession('presence-5'),savedSession('explore-new-stimulus')];
  const state=await reopen(sessions);
  expect(document.querySelector('[aria-label="Las dos formas del deseo"]')).toBeNull();
  expect(document.querySelector('[aria-label="Instrucciones de la actividad"]')).toBeNull();
  expect(document.querySelector('[aria-label="Práctica en curso"]')).toBeNull();
  expect(JSON.parse(state[PROGRAM_KEY]!).sessions).toEqual(sessions);
 });

 it('opens the first incomplete assigned practice on another day without repeating the completed one',async()=>{
  const assigned=generateToday({...initialState,health:['none'],stimuli:['touch']},2);
  expect(assigned.length).toBeGreaterThan(1);
  const sessions=[savedSession(assigned[0]!.practiceId,2)];
  const state=await reopen(sessions,2);
  expect(document.querySelector('[aria-label="Instrucciones de la actividad"] h3')?.textContent).toBe(assigned[1]!.title);
  expect(JSON.parse(state[PROGRAM_KEY]!).sessions).toEqual(sessions);
 });
});
