import { useEffect, useState } from 'react';
import { SensateLab } from './components/SensateLab';
import { host, centralContext } from './lib/central';
export function App(){const [restriction,setRestriction]=useState(centralContext().restriction);useEffect(()=>{const sync=()=>setRestriction(centralContext().restriction);window.addEventListener('spm:sensate-context',sync);return ()=>window.removeEventListener('spm:sensate-context',sync);},[]);return !host()?<main>Abre Focalización sensorial desde tu sesión de SPM Central.</main>:<SensateLab practiceAllowed={restriction==='none'} initialOrigin={centralContext().origin==='library'?'lab':'dailyPlan'}/>;}
