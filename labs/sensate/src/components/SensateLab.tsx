import { useEffect, useRef, useState } from 'react';
import trainer from '../../../pelvic-floor/src/assets/spm-trainer.jpg';
import { centralStorage, centralContext, host } from '../lib/central';

type Origin = 'dailyPlan' | 'library' | 'lab';
type Rec = 'repeat' | 'progress' | 'reduce-pressure' | 'recovery';
type Phase = { name: string; secs: number; cue: string };

const STEPS = [
  'Bienvenida', 'Qué es', 'Reglas', 'Preparación', 'Focus I', 'Guía I', 'Cierre I', 'Focus II',
  'Guía II', 'Firmeza', 'Deseo responsivo', 'Control eyaculatorio', 'Comunicación', 'Biblioteca', 'Resultado',
];

const G1: Phase[] = [
  { name: 'Llegar', secs: 60, cue: 'Respiren a su ritmo. Nadie tiene que lograr nada.' },
  { name: 'A toca · B recibe', secs: 300, cue: 'Contacto no genital. Nota temperatura, presión, textura y ritmo.' },
  { name: 'Pausa breve', secs: 30, cue: 'Suelten las manos. Noten qué quedó en la piel.' },
  { name: 'B toca · A recibe', secs: 300, cue: 'Intercambio. Quien toca, toca por curiosidad, no para provocar.' },
  { name: 'Cierre compartido', secs: 60, cue: 'Quietud. Una mano apoyada. Solo observar.' },
];
const G2: Phase[] = [
  { name: 'Volver a lo conocido', secs: 120, cue: 'Empiecen con el contacto no genital de Focus I.' },
  { name: 'Exploración opcional', secs: 240, cue: 'Solo si ambos lo desean: incluir zonas erógenas, sin meta.' },
  { name: 'Cambio de estímulo', secs: 120, cue: 'Cambien ritmo, presión o zona. Observen la diferencia.' },
  { name: 'Pausa y ritmo', secs: 60, cue: 'Bajen el ritmo. Pausa de contacto si alguien lo pide.' },
  { name: 'Cierre', secs: 60, cue: 'Termina aquí. No es la antesala obligatoria de nada.' },
];

const REASONS = [
  ['Presión / vigilancia', 'Notaste que observas tu desempeño durante el encuentro.'],
  ['Deseo responsivo', 'Las ganas pueden aparecer después de empezar el contacto.'],
  ['Baja conexión', 'Recuperar contacto sin exigencias fortalece el vínculo.'],
  ['Miedo a perder firmeza', 'Practicar sin meta reduce la amenaza del “¿y si baja?”.'],
  ['Reconexión sensorial', 'Volver a sentir el cuerpo más allá del rendimiento.'],
];
const STIMULI = ['Caricia lenta', 'Presión firme', 'Roce suave', 'Calor de la mano', 'Espalda', 'Brazos', 'Cuello', 'Manos', 'Piernas'];

const KEY = 'spm-sensate-state';
const REC_KEY = 'spm-sensate-records';

function fmt(s: number) { const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}`; }

function useGuide(phases: Phase[], active: boolean) {
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(phases[0].secs);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { if (!active) setRunning(false); }, [active]);
  useEffect(() => { const pause=()=>setRunning(false); const hidden=()=>{if(document.hidden)pause();}; document.addEventListener('visibilitychange',hidden); window.addEventListener('pagehide',pause); return ()=>{document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',pause);}; }, []);
  useEffect(() => {
    if (!running || !active) return;
    const t = setInterval(() => setLeft(l => l - 1), 1000);
    return () => clearInterval(t);
  }, [running, active]);
  useEffect(() => {
    if (left > 0) return;
    if (idx < phases.length - 1) { setIdx(i => i + 1); setLeft(phases[idx + 1].secs); }
    else { setRunning(false); setDone(true); setLeft(0); }
  }, [left, idx, phases]);
  const goto = (i: number) => { setIdx(i); setLeft(phases[i].secs); };
  return {
    idx, left, running, started, done, phase: phases[idx],
    start: () => { setStarted(true); setRunning(true); setDone(false); },
    toggle: () => setRunning(r => !r),
    skip: () => (idx < phases.length - 1 ? goto(idx + 1) : setLeft(0)),
    goto,
    reset: () => { setRunning(false); setStarted(false); setDone(false); goto(0); },
  };
}

function Slider({ label, value, onChange, low, high }: { label: string; value: number; onChange: (n: number) => void; low: string; high: string }) {
  return (
    <label className="sf-slider">
      <span className="sf-slider-head"><b>{label}</b><strong>{value}</strong></span>
      <input type="range" min={0} max={10} value={value} onChange={e => onChange(Number(e.target.value))} aria-label={label} />
      <span className="sf-slider-ends"><i>{low}</i><i>{high}</i></span>
    </label>
  );
}

function Guide({ g, phases, intrusions, onIntrusion, pressureBack }: { g: ReturnType<typeof useGuide>; phases: Phase[]; intrusions: number; onIntrusion: () => void; pressureBack?: () => void }) {
  const [flash, setFlash] = useState('');
  const show = (m: string) => { setFlash(m); setTimeout(() => setFlash(''), 4000); };
  const total = phases[g.idx].secs;
  return (
    <div className="sf-guide">
      <div className="sf-phases">
        {phases.map((p, i) => <span key={p.name} className={i === g.idx ? 'on' : i < g.idx || g.done ? 'past' : ''}>{p.name}</span>)}
      </div>
      <div className="sf-ring" style={{ ['--p' as string]: `${((total - g.left) / total) * 100}%` }}>
        <div><small>{g.done ? 'Completado' : g.phase.name}</small><strong>{fmt(Math.max(g.left, 0))}</strong><small>Fase {g.idx + 1}/{phases.length}</small></div>
      </div>
      <p className="sf-cue" aria-live="polite">{flash || (g.done ? 'Práctica terminada. Agradezcan el contacto, sin evaluar.' : g.phase.cue)}</p>
      <div className="sf-controls">
        {!g.started ? <button className="sf-btn gold" onClick={g.start}>Iniciar guía</button> : !g.done && (
          <>
            <button className="sf-btn gold" onClick={g.toggle}>{g.running ? 'Pausar' : 'Reanudar'}</button>
            <button className="sf-btn ghost" onClick={g.skip}>Siguiente fase</button>
          </>
        )}
        {g.done && <button className="sf-btn ghost" onClick={g.reset}>Repetir guía</button>}
      </div>
      {g.started && !g.done && (
        <div className="sf-controls">
          <button className="sf-btn soft" onClick={() => { onIntrusion(); show('Vuelve a sensación: ¿qué temperatura notas ahora mismo bajo la mano?'); }}>
            Volver a sensación <em>({intrusions})</em>
          </button>
          {pressureBack && <button className="sf-btn soft" onClick={() => { pressureBack(); show('Sube la presión: volvemos a contacto no genital. Está bien.'); }}>Sube la presión</button>}
        </div>
      )}
      <p className="sf-note">Audio guiado de Lenny pendiente para esta práctica: los cues se muestran en texto. Cualquiera puede decir “pausa” en cualquier momento.</p>
    </div>
  );
}

export function SensateLab({ initialOrigin, practiceAllowed = true }: { initialOrigin: Origin; practiceAllowed?: boolean }) {
  const [step, setStep] = useState(0);
  const [origin, setOrigin] = useState<Origin>(initialOrigin);
  const [practiceId, setPracticeId] = useState('sf-focus-1');
  const [presenceBefore, setPB] = useState(5);
  const [pressureBefore, setPrB] = useState(5);
  const [presenceAfter, setPA] = useState(5);
  const [pressureAfter, setPrA] = useState(5);
  const [enjoyment, setEnj] = useState(5);
  const [partnerComfort, setPC] = useState(7);
  const [intrusions, setIntr] = useState(0);
  const [stimuli, setStimuli] = useState<string[]>([]);
  const [firmness, setFirmness] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  const loaded = useRef(false);
  const pendingRecord = useRef<string | null>(null);
  const g1 = useGuide(G1, step === 5 && practiceAllowed);
  const g2 = useGuide(G2, step === 8 && practiceAllowed);

  useEffect(() => {
    try {
      const s = JSON.parse(centralStorage.getItem(KEY) || 'null');
      if (s && initialOrigin === 'lab') { setStep(s.step ?? 0); setPB(s.pb ?? 5); setPrB(s.prb ?? 5); setIntr(s.intr ?? 0); setStimuli(s.st ?? []); }
    } catch { /* ignore */ }
    loaded.current = true;
  }, [initialOrigin]);
  useEffect(() => {
    if (loaded.current) centralStorage.setItem(KEY, JSON.stringify({ step, pb: presenceBefore, prb: pressureBefore, intr: intrusions, st: stimuli }));
  }, [step, presenceBefore, pressureBefore, intrusions, stimuli]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [step]);

  const recommendation: Rec = firmness ? 'recovery'
    : pressureAfter >= 7 || intrusions >= 4 ? 'reduce-pressure'
    : presenceAfter >= 7 && pressureAfter <= 3 && enjoyment >= 6 && partnerComfort >= 6 ? 'progress' : 'repeat';
  const recText: Record<Rec, string> = {
    repeat: 'Repetir la misma práctica: estás construyendo presencia.',
    progress: 'Puedes avanzar a Focus II cuando ambos lo deseen.',
    'reduce-pressure': 'Reducir presión: sesiones más cortas, solo contacto no genital.',
    recovery: 'Practicar recuperación tras un cambio de firmeza antes de progresar.',
  };

  const record = {
    practiceId, completed: practiceId === 'sf-focus-2' ? g2.done : g1.done,
    presenceBefore, presenceAfter, pressureBefore, pressureAfter, enjoyment,
    monitoringIntrusions: intrusions, partnerComfort, usefulStimuli: stimuli, recommendation,
  };
  const save = async () => {
    try {
    const all = JSON.parse(centralStorage.getItem(REC_KEY) || '[]');
    pendingRecord.current ||= crypto.randomUUID();
    const entry = { ...record, id: pendingRecord.current, day: centralContext().day, origin, savedAt: new Date().toISOString() };
    const existing = all.findIndex((item: {id?: string}) => item.id === entry.id);
    if (existing >= 0) all[existing] = entry; else all.push(entry);
    centralStorage.setItem(REC_KEY, JSON.stringify(all));
    await host()?.flush();
    setSaved(true);
    setNotice('Registro guardado en tu programa.');
    } catch { setNotice('No se pudo guardar. Reintenta antes de salir.'); return false; }
    return true;
  };
  const go = (n: number) => { pendingRecord.current = null; setSaved(false); setNotice(''); setStep(Math.max(0, Math.min(STEPS.length - 1, n))); };
  const openFromLibrary = (n: number, id: string) => { setOrigin('library'); setPracticeId(id); go(n); };
  const finishReturn = async () => {
    if (!saved && !await save()) return;
    if (origin === 'library') { go(13); setOrigin('lab'); }
    else if (origin === 'dailyPlan') await host()?.close();
  };
  const toggleStim = (s: string) => setStimuli(x => (x.includes(s) ? x.filter(y => y !== s) : [...x, s]));

  const Why = () => (
    <details className="sf-why">
      <summary>¿Por qué SPM te asignó esta práctica?</summary>
      <ul>{REASONS.map(([t, d]) => <li key={t}><b>{t}.</b> {d}</li>)}</ul>
    </details>
  );

  const screens: Record<number, React.ReactNode> = {
    0: (
      <>
        <section className="sf-hero">
          <img src={trainer} alt="Entrenador SPM" />
          <div>
            <span className="sf-eyebrow">SPM · Sensate Focus Lab</span>
            <h1>Menos examen. <em>Más sensación.</em></h1>
            <p>Una práctica para volver a sentir el contacto sin perseguir un resultado. No hay nada que demostrar.</p>
            <button className="sf-btn gold" onClick={() => go(1)}>Comenzar</button>
          </div>
        </section>
        <Why />
      </>
    ),
    1: (
      <>
        <h2>Qué es Sensate Focus</h2>
        <div className="sf-grid3">
          {[['01', 'Atención', 'Pones la atención en la piel: temperatura, presión, textura, ritmo.'], ['02', 'Sin meta', 'No buscas erección, penetración ni orgasmo. Solo observas.'], ['03', 'Por turnos', 'Una persona toca, la otra recibe. Luego cambian.']].map(([n, t, d]) => (
            <div className="sf-card" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
        <p className="sf-statement">Si aparece el “modo examen”, la práctica no falla: es el momento de volver a la sensación.</p>
      </>
    ),
    2: (
      <>
        <h2>Reglas de la práctica</h2>
        <ul className="sf-rules">
          {['Sin obligación de penetración.', 'Sin obligación de orgasmo.', 'No comprobar la erección ni el desempeño.', 'Parar si aumenta la presión o la incomodidad.', 'Ambos pueden decir “pausa” en cualquier momento.'].map(r => <li key={r}>{r}</li>)}
        </ul>
        <p className="sf-warn">Consentimiento y comodidad siempre mandan sobre cualquier fase de la guía.</p>
      </>
    ),
    3: (
      <>
        <h2>Preparación individual · 2–3 min</h2>
        <div className="sf-grid3">
          <div className="sf-card"><span>Ritmo</span><p>Baja la velocidad de lo que haces. Siéntate o recuéstate.</p></div>
          <div className="sf-card"><span>Cuerpo</span><p>Suelta mandíbula, hombros y abdomen. Nota la respiración si ya está validada por SPM.</p></div>
          <div className="sf-card"><span>Intención</span><p>Elige curiosidad, no rendimiento: “voy a notar qué siento”.</p></div>
        </div>
        <div className="sf-panel">
          <p className="sf-small">Dos marcas rápidas antes de empezar:</p>
          <Slider label="Presencia ahora" value={presenceBefore} onChange={setPB} low="Disperso" high="Presente" />
          <Slider label="Presión ahora" value={pressureBefore} onChange={setPrB} low="Ninguna" high="Mucha" />
        </div>
      </>
    ),
    4: (
      <>
        <h2>Focalización sensorial I · pareja</h2>
        <div className="sf-grid3">
          <div className="sf-card"><span>10–15 min</span><p>Tiempo suficiente para sentir, corto para no cansar.</p></div>
          <div className="sf-card"><span>No genital</span><p>Espalda, brazos, manos, cuello, piernas. Zonas genitales y pecho quedan fuera por ahora.</p></div>
          <div className="sf-card"><span>Turnos</span><p>Una persona toca, la otra recibe. Atención a temperatura, presión, textura y ritmo. Luego intercambian.</p></div>
        </div>
        <Why />
      </>
    ),
    5: (<><h2>Guía interactiva I</h2>{!practiceAllowed ? <p className="sf-warn">Puedes consultar el contenido. La guía práctica está en pausa mientras se revisa la alerta de tu programa.</p> : <Guide g={g1} phases={G1} intrusions={intrusions} onIntrusion={() => setIntr(i => i + 1)} />}</>),
    6: (
      <>
        <h2>Cierre I</h2>
        <div className="sf-panel">
          <Slider label="Presencia" value={presenceAfter} onChange={setPA} low="Disperso" high="Presente" />
          <Slider label="Presión" value={pressureAfter} onChange={setPrA} low="Ninguna" high="Mucha" />
          <Slider label="Disfrute" value={enjoyment} onChange={setEnj} low="Nada" high="Mucho" />
          <Slider label="Comodidad de tu pareja" value={partnerComfort} onChange={setPC} low="Incómoda" high="Cómoda" />
        </div>
        <p className="sf-small">¿Qué contacto fue más fácil de sentir?</p>
        <div className="sf-chips">{STIMULI.map(s => <button key={s} className={stimuli.includes(s) ? 'on' : ''} onClick={() => toggleStim(s)} aria-pressed={stimuli.includes(s)}>{s}</button>)}</div>
      </>
    ),
    7: (
      <>
        <h2>Focalización sensorial II · progresión opcional</h2>
        <div className="sf-grid3">
          <div className="sf-card"><span>Solo si ambos</span><p>Zonas erógenas se incluyen únicamente si las dos personas lo desean.</p></div>
          <div className="sf-card"><span>Sin meta</span><p>Sigue sin haber resultado obligatorio.</p></div>
          <div className="sf-card"><span>No es un paso</span><p>Progresar no significa “ya toca penetración”.</p></div>
        </div>
        <button className="sf-btn ghost" onClick={() => setPracticeId('sf-focus-2')}>{practiceId === 'sf-focus-2' ? '✓ Registrando Focus II' : 'Registrar esta sesión como Focus II'}</button>
      </>
    ),
    8: (<><h2>Guía interactiva II</h2>{!practiceAllowed ? <p className="sf-warn">Puedes consultar el contenido. La guía práctica está en pausa mientras se revisa la alerta de tu programa.</p> : <Guide g={g2} phases={G2} intrusions={intrusions} onIntrusion={() => setIntr(i => i + 1)} pressureBack={() => g2.goto(0)} />}</>),
    9: (
      <>
        <h2>Cuando cambia la firmeza</h2>
        <p className="sf-statement">Un cambio de firmeza no invalida la práctica. Es una sensación más que observar.</p>
        <ul className="sf-rules"><li>Sigan con contacto no genital.</li><li>Respira y vuelve a temperatura y textura.</li><li>La firmeza puede volver o no: la práctica sigue siendo válida.</li></ul>
        <label className="sf-check"><input type="checkbox" checked={firmness} onChange={e => setFirmness(e.target.checked)} /> Hoy hubo un cambio de firmeza que me preocupó</label>
        <p className="sf-small">Conecta con el módulo SPM “Recuperación después de una caída”.</p>
      </>
    ),
    10: (
      <>
        <h2>Sensate Focus y deseo responsivo</h2>
        <p className="sf-statement">No necesitas ganas desde el primer segundo. El deseo puede aparecer <em>después</em> de empezar el contacto.</p>
        <p>Iniciar con disposición, no con urgencia, permite que el cuerpo responda a su ritmo. Si no aparece, también está bien.</p>
      </>
    ),
    11: (
      <>
        <h2>Sensate Focus y control eyaculatorio</h2>
        <p>La atención al cuerpo ayuda a notar antes cómo sube la excitación y a regular el ritmo. No es una técnica de tiempo ni un cronómetro.</p>
        <p className="sf-small">Cuando SPM lo indique, combínalo con la escala de excitación del laboratorio de control.</p>
        <button className="sf-btn ghost" onClick={() => host()?.openControl()}>Abrir escala de excitación →</button>
      </>
    ),
    12: (
      <>
        <h2>Comunicación mínima</h2>
        <div className="sf-phrases">{['Más lento', 'Así está bien', 'Prefiero otro contacto', 'Pausa'].map(p => <span key={p}>“{p}”</span>)}</div>
        <p className="sf-small">Frases cortas, sin explicación. Pedir algo distinto es parte de la práctica.</p>
      </>
    ),
    13: (
      <>
        <h2>Biblioteca</h2>
        <div className="sf-lib">
          {([['Focus I', 'Contacto no genital por turnos', 5, 'sf-focus-1'], ['Focus II', 'Progresión opcional', 8, 'sf-focus-2'], ['Presencia corporal individual', 'Preparación de 2–3 min', 3, 'sf-solo'], ['Recuperación', 'Cuando cambia la firmeza', 9, 'sf-recovery'], ['Comunicación', 'Cuatro frases mínimas', 12, 'sf-communication']] as const).map(([t, d, n, id]) => (
            <button key={id} onClick={() => openFromLibrary(n, id)}><b>{t}</b><span>{d}</span></button>
          ))}
        </div>
      </>
    ),
    14: (
      <>
        <h2>Resultado</h2>
        <div className="sf-result">
          <div><small>Presencia</small><strong>{presenceBefore} → {presenceAfter}</strong></div>
          <div><small>Presión</small><strong>{pressureBefore} → {pressureAfter}</strong></div>
          <div><small>Disfrute</small><strong>{enjoyment}</strong></div>
          <div><small>Modo examen</small><strong>{intrusions}×</strong></div>
        </div>
        <p className="sf-statement">{recText[recommendation]}</p>
        <Why />
        <button className="sf-btn gold" onClick={save} disabled={saved}>{saved ? 'Guardado en tu programa' : 'Guardar registro'}</button>
      </>
    ),
  };

  const finishLabel = origin === 'dailyPlan' ? '← Volver a Hoy' : origin === 'library' ? '← Volver a Biblioteca' : null;

  return (
    <div className="sf-shell">
      <header className="sf-top">
        <span className="sf-brand"><i>S</i>SPM <small>SENSATE FOCUS</small></span>
        <span className="sf-count">{step + 1}<i>/</i>{STEPS.length}</span>
      </header>
      <div className="sf-progress"><span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
      <main className="sf-main">
        <span className="sf-eyebrow">{String(step + 1).padStart(2, '0')} · {STEPS[step]}</span>
        {screens[step]}
        {notice && <p role="status" className="sf-small">{notice}</p>}
        {finishLabel && (
          <div className="sf-return">
            <button className="sf-btn gold" onClick={finishReturn}>Finalizar · {finishLabel}</button>
            {notice && <p className="sf-small">{notice}</p>}
          </div>
        )}
      </main>
      <footer className="sf-foot">
        <button onClick={() => go(step - 1)} disabled={step === 0}>← Anterior</button>
        <span>{STEPS[step]}</span>
        <button onClick={() => go(step + 1)} disabled={step === STEPS.length - 1}>Siguiente →</button>
      </footer>
    </div>
  );
}

