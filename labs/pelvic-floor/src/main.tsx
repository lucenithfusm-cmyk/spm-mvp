import {createRoot} from 'react-dom/client';
import {PelvicLab} from './components/PelvicLab';
import './styles.css';
import {host} from './lib/pf-host';
createRoot(document.getElementById('root')!).render(host ? <PelvicLab /> :
  <main className="pf-app"><section className="pf-main"><div className="pf-card">
    <div className="pf-kicker">SPM · Pelvic Floor Lab</div>
    <h1>Continúa desde tu programa</h1>
    <p>Abre Piso Pélvico dentro de SPM Central para conservar tu progreso.</p>
    <a className="pf-btn pf-btn-gold" href="../live.html">Abrir SPM Central</a>
  </div></section></main>);
