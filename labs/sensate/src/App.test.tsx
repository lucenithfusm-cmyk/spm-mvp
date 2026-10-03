// @vitest-environment jsdom
import {test,expect,vi} from 'vitest';
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
let restriction='none';
vi.mock('./lib/central',()=>({host:()=>({}),centralContext:()=>({restriction,origin:'library'}),centralStorage:{getItem:()=>null,setItem:()=>{}}}));
test.each(['none','review','urgent'])('educational access remains available with %s context',async(level)=>{
 restriction=level;window.scrollTo=vi.fn();(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;const el=document.createElement('div');const root=createRoot(el);
 await act(async()=>root.render(<App/>));expect(el.textContent).toContain('Más sensación.');expect(el.textContent).not.toContain('Vuelve a SPM Central.');
 for(let i=0;i<5;i++)await act(async()=>Array.from(el.querySelectorAll('button')).find(b=>b.textContent==='Siguiente →')!.click());
 expect(el.textContent?.includes('Iniciar guía')).toBe(level==='none');await act(async()=>root.unmount());
});
