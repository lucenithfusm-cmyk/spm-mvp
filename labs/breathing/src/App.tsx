import { useEffect, useState } from 'react';
import { BreathingLab } from './components/BreathingLab';
import { host, centralContext } from './lib/central';
export function App(){const [restriction,setRestriction]=useState(centralContext().restriction);useEffect(()=>{const sync=()=>setRestriction(centralContext().restriction);window.addEventListener('spm:breathing-context',sync);return ()=>window.removeEventListener('spm:breathing-context',sync);},[]);return !host()?<main>Abre Respiración diafragmática desde tu sesión de SPM Central.</main>:<BreathingLab practiceAllowed={restriction==='none'}/>;}
