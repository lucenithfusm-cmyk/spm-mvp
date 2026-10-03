import { createRoot } from 'react-dom/client';
import { DesireLab } from './components/desire/DesireLab';
import { host } from './lib/central';
import './styles.css';
createRoot(document.getElementById('root')!).render(host() ? <DesireLab /> : <main style={{padding:32,color:'#eef8f6',background:'#07171f',minHeight:'100vh'}}><h1>Deseo SPM</h1><p>Abre este programa desde tu sesión de SPM Central para recuperar tu avance.</p></main>);
