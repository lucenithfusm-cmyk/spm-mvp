import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { SensateLab } from './components/SensateLab';
import { host, centralContext } from './lib/central';
import './styles.css';
function App(){const [restriction,setRestriction]=useState(centralContext().restriction);useEffect(()=>{const sync=()=>setRestriction(centralContext().restriction);window.addEventListener('spm:sensate-context',sync);return ()=>window.removeEventListener('spm:sensate-context',sync);},[]);return !host()?<main>Abre Focalización sensorial desde tu sesión de SPM Central.</main>:restriction==='urgent'?<main className="sf-shell"><p>Tu programa requiere revisión antes de continuar esta práctica. Vuelve a SPM Central.</p></main>:<SensateLab practiceAllowed={restriction==='none'} initialOrigin={centralContext().origin==='library'?'lab':'dailyPlan'}/>;}
createRoot(document.getElementById('root')!).render(<App/>);
