// @vitest-environment jsdom
import {beforeEach,test,expect,vi} from 'vitest';
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {SensateLab} from './SensateLab';
const state:Record<string,string>={};const flush=vi.fn(),recordDaily=vi.fn(),close=vi.fn();let context:any={day:18},hasRecordDaily=true;
vi.mock('../lib/central',()=>({centralContext:()=>context,host:()=>({flush,close,...(hasRecordDaily?{recordDaily}:{})}),centralStorage:{getItem:(k:string)=>state[k]??null,setItem:(k:string,v:string)=>{state[k]=v;}}}));
beforeEach(()=>{
 Object.keys(state).forEach(k=>delete state[k]);context={day:18,mode:'library'};hasRecordDaily=true;
 flush.mockReset().mockResolvedValue(undefined);recordDaily.mockReset().mockResolvedValue(true);close.mockReset().mockResolvedValue(true);
});
test('result has no debug JSON; failed save retries without duplicating records',async()=>{
 window.scrollTo=vi.fn();(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
 state['spm-sensate-state']=JSON.stringify({step:14});const el=document.createElement('div');document.body.append(el);const root=createRoot(el);
 await act(async()=>root.render(<SensateLab initialOrigin="lab"/>));
 expect(el.querySelector('pre')).toBeNull();expect(el.textContent).toContain('Resultado');
 const save=()=>Array.from(el.querySelectorAll('button')).find(b=>b.textContent==='Guardar registro')!;
 flush.mockRejectedValueOnce(Error('offline'));await act(async()=>save().click());expect(el.textContent).toContain('No se pudo guardar');
 flush.mockResolvedValue(undefined);await act(async()=>save().click());expect(el.textContent).toContain('Guardado en tu programa');
 const records=JSON.parse(state['spm-sensate-records']);expect(records).toHaveLength(1);expect(records[0].day).toBe(18);expect(records[0].completed).toBe(false);
 expect(recordDaily).not.toHaveBeenCalled();expect(close).not.toHaveBeenCalled();
 await act(async()=>root.unmount());el.remove();
});

test('daily record failures keep the experience open; retry records once before closing',async()=>{
 window.scrollTo=vi.fn();(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
 context={day:18,mode:'daily',activity:{day:18,title:'Preparación individual',summary:'A tu ritmo.',steps:[3],practiceId:'sf-solo'}};
 const el=document.createElement('div');document.body.append(el);const root=createRoot(el);
 const save=()=>Array.from(el.querySelectorAll('button')).find(b=>b.textContent==='Guardar y volver a Hoy')!;
 try{
  await act(async()=>root.render(<SensateLab initialOrigin="dailyPlan"/>));
  expect(recordDaily).not.toHaveBeenCalled();
  flush.mockRejectedValueOnce(Error('offline'));await act(async()=>save().click());
  expect(recordDaily).not.toHaveBeenCalled();expect(el.textContent).toContain('No se pudo guardar');expect(close).not.toHaveBeenCalled();
  recordDaily.mockResolvedValueOnce(false);await act(async()=>save().click());
  expect(recordDaily).toHaveBeenCalledTimes(1);expect(el.textContent).toContain('No se pudo guardar');expect(close).not.toHaveBeenCalled();
  await act(async()=>save().click());
  expect(recordDaily).toHaveBeenCalledTimes(2);expect(close).toHaveBeenCalledTimes(1);
  expect(flush.mock.invocationCallOrder[1]).toBeLessThan(recordDaily.mock.invocationCallOrder[0]!);
  expect(recordDaily.mock.invocationCallOrder[1]).toBeLessThan(close.mock.invocationCallOrder[0]!);
  const records=JSON.parse(state['spm-sensate-records']);expect(records).toHaveLength(1);expect(records[0]).toMatchObject({day:18,practiceId:'sf-solo',completed:true});
  expect(el.textContent).toContain('Registro guardado en tu programa.');
 }finally{await act(async()=>root.unmount());el.remove();}
});

test('leaving a daily activity without saving does not record it',async()=>{
 window.scrollTo=vi.fn();(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
 context={day:18,mode:'daily',activity:{day:18,title:'Preparación individual',summary:'A tu ritmo.',steps:[3],practiceId:'sf-solo'}};
 const el=document.createElement('div');document.body.append(el);const root=createRoot(el);
 try{
  await act(async()=>root.render(<SensateLab initialOrigin="dailyPlan"/>));
  await act(async()=>Array.from(el.querySelectorAll('button')).find(b=>b.textContent==='← Atrás')!.click());
  expect(close).toHaveBeenCalledTimes(1);expect(flush).not.toHaveBeenCalled();expect(recordDaily).not.toHaveBeenCalled();
 }finally{await act(async()=>root.unmount());el.remove();}
});

test('a daily host without recordDaily preserves saving and returning',async()=>{
 window.scrollTo=vi.fn();(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;hasRecordDaily=false;
 context={day:18,mode:'daily',activity:{day:18,title:'Preparación individual',summary:'A tu ritmo.',steps:[3],practiceId:'sf-solo'}};
 const el=document.createElement('div');document.body.append(el);const root=createRoot(el);
 try{
  await act(async()=>root.render(<SensateLab initialOrigin="dailyPlan"/>));
  await act(async()=>Array.from(el.querySelectorAll('button')).find(b=>b.textContent==='Guardar y volver a Hoy')!.click());
  expect(flush).toHaveBeenCalledTimes(1);expect(recordDaily).not.toHaveBeenCalled();expect(close).toHaveBeenCalledTimes(1);
  expect(el.textContent).toContain('Registro guardado en tu programa.');
 }finally{await act(async()=>root.unmount());el.remove();}
});
test('review allows educational screens while keeping guided practice paused',async()=>{
 window.scrollTo=vi.fn();(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
 const el=document.createElement('div');document.body.append(el);const root=createRoot(el);
 state['spm-sensate-state']=JSON.stringify({step:0});await act(async()=>root.render(<SensateLab initialOrigin="lab" practiceAllowed={false}/>));expect(el.textContent).toContain('Más sensación.');
 for(let i=0;i<5;i++)await act(async()=>Array.from(el.querySelectorAll('button')).find(b=>b.textContent==='Siguiente →')!.click());
 expect(el.textContent).toContain('La guía práctica está en pausa');expect(el.textContent).not.toContain('Iniciar guía');await act(async()=>root.unmount());el.remove();
});

for(const focus of [1,2])test(`daily Focus ${focus} can be explicitly completed without running the optional clock`,async()=>{
 window.scrollTo=vi.fn();(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;flush.mockResolvedValue(undefined);
 Object.keys(state).forEach(k=>delete state[k]);
 context={day:19,mode:'daily',activity:{day:19,title:'Focalización',summary:'Practica a tu ritmo.',steps:[2,3,4,5,6],practiceId:'sf-focus-1',optionalProgression:true}};
 if(focus===2)state['spm-sensate-records']=JSON.stringify([{practiceId:'sf-focus-1',completed:true,partnerComfort:8,pressureAfter:2,recommendation:'progress'}]);
 const el=document.createElement('div');document.body.append(el);const root=createRoot(el);
 const button=(text:string)=>Array.from(el.querySelectorAll('button')).find(b=>b.textContent===text)!;
 try{
  await act(async()=>root.render(<SensateLab initialOrigin="dailyPlan"/>));
  for(let i=0;i<3;i++)await act(async()=>button('Continuar →').click());
  expect(el.textContent).toContain('La guía práctica está en pausa');
  expect(button('Ya realicé la práctica')).toBeUndefined();
  await act(async()=>(el.querySelector('.sf-check input') as HTMLInputElement).click());
  if(focus===2){
   await act(async()=>Array.from(el.querySelectorAll('button')).find(b=>b.textContent?.includes('Elegir Focus II'))!.click());
   for(let i=0;i<3;i++)await act(async()=>button('Continuar →').click());
  }
  expect(button('Iniciar guía')).toBeTruthy();expect(button('Continuar →').disabled).toBe(true);
  expect(el.querySelector('.sf-ring strong')?.textContent).toBe(focus===1?'1:00':'2:00');
  await act(async()=>button('Ya realicé la práctica').click());
  expect(button('Continuar →').disabled).toBe(false);
  await act(async()=>button('Continuar →').click());
  await act(async()=>button('Guardar y volver a Hoy').click());
  const record=JSON.parse(state['spm-sensate-records']).at(-1);
  expect(record.completed).toBe(true);expect(record.practiceId).toBe(`sf-focus-${focus}`);expect(record.day).toBe(19);
 }finally{await act(async()=>root.unmount());el.remove();context={day:18};}
});
