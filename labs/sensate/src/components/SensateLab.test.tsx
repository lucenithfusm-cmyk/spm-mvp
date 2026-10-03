// @vitest-environment jsdom
import {test,expect,vi} from 'vitest';
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {SensateLab} from './SensateLab';
const state:Record<string,string>={};const flush=vi.fn();
vi.mock('../lib/central',()=>({centralContext:()=>({day:18}),host:()=>({flush,close:vi.fn()}),centralStorage:{getItem:(k:string)=>state[k]??null,setItem:(k:string,v:string)=>{state[k]=v;}}}));
test('result has no debug JSON; failed save retries without duplicating records',async()=>{
 window.scrollTo=vi.fn();(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
 state['spm-sensate-state']=JSON.stringify({step:14});const el=document.createElement('div');document.body.append(el);const root=createRoot(el);
 await act(async()=>root.render(<SensateLab initialOrigin="lab"/>));
 expect(el.querySelector('pre')).toBeNull();expect(el.textContent).toContain('Resultado');
 const save=()=>Array.from(el.querySelectorAll('button')).find(b=>b.textContent==='Guardar registro')!;
 flush.mockRejectedValueOnce(Error('offline'));await act(async()=>save().click());expect(el.textContent).toContain('No se pudo guardar');
 flush.mockResolvedValue(undefined);await act(async()=>save().click());expect(el.textContent).toContain('Guardado en tu programa');
 const records=JSON.parse(state['spm-sensate-records']);expect(records).toHaveLength(1);expect(records[0].day).toBe(18);expect(records[0].completed).toBe(false);
 await act(async()=>root.unmount());el.remove();
});
test('review allows educational screens while keeping guided practice paused',async()=>{
 window.scrollTo=vi.fn();(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
 const el=document.createElement('div');document.body.append(el);const root=createRoot(el);
 state['spm-sensate-state']=JSON.stringify({step:0});await act(async()=>root.render(<SensateLab initialOrigin="lab" practiceAllowed={false}/>));expect(el.textContent).toContain('Más sensación.');
 for(let i=0;i<5;i++)await act(async()=>Array.from(el.querySelectorAll('button')).find(b=>b.textContent==='Siguiente →')!.click());
 expect(el.textContent).toContain('La guía práctica está en pausa');expect(el.textContent).not.toContain('Iniciar guía');await act(async()=>root.unmount());el.remove();
});
