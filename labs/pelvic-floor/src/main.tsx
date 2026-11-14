import {createRoot} from 'react-dom/client';
import {PelvicLab} from './components/PelvicLab';
import './styles.css';
import {host} from './lib/pf-host';
const ctx=host?.getContext();
const weekly=ctx?.origin==='dailyPlan'&&ctx?.intent==='daily-relax'&&ctx?.activityId==='pelvic-daily-lab'&&[3,10,17,24].includes(ctx.day);
if(weekly){
 const script=document.createElement('script');script.src='./pelvic-weekly-flow-v1.js?v=20261114-pf-split1';document.body.append(script);
}else{
 createRoot(document.getElementById('root')!).render(host ? <PelvicLab /> :
  <main className="pf-app"><section className="pf-main"><div className="pf-card">
   <div className="pf-kicker">SPM · Pelvic Floor Lab</div><h1>Continúa desde tu programa</h1>
   <p>Abre Piso Pélvico dentro de SPM Central para conservar tu progreso.</p>
   <a className="pf-btn pf-btn-gold" href="../live.html">Abrir SPM Central</a>
  </div></section></main>);
}