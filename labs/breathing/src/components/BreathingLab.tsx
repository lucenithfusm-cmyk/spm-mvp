import { centralStorage, centralContext } from '@/lib/central';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Menu, X, Volume2, VolumeX, ShieldAlert, Wind, HeartPulse, Library, CalendarDays, Activity, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import trainer from '@/assets/spm-trainer.jpg';
import toracicImg from '@/assets/respiracion-toracica-premium.jpg.asset.json';
import diaphragmaticImg from '@/assets/respiracion-diafragmatica-premium.jpg.asset.json';
import { screens, trainerLines, library, plan, weeks, PATTERN_426, type Session, type Competency } from '@/lib/breath-data';
import { AUDIO_IDS, hasAudio, playAudio, stopAudio, setAudioMuted } from '@/lib/breath-audio';
import { useBreathAudio } from '@/lib/use-breath-audio';
import { BreathPacer } from '@/components/breath/BreathPacer';
import { DemoVideo } from '@/components/breath/DemoVideo';

const K = { step: 'spmb-step', origin: 'spmb-origin', noHold: 'spmb-nohold', sessions: 'spmb-sessions', plan: 'spmb-plan' };
const COMPETENCY_KEY = 'spm_breathing_competency_v1';
function read<T>(k: string, f: T): T { try { const v = centralStorage.getItem(k); return v ? (JSON.parse(v) as T) : f; } catch { return f; } }

export function BreathingLab({ practiceAllowed = false }: { practiceAllowed?: boolean }) {
  const [step, setStep] = useState(0);
  const [origin, setOrigin] = useState<'library' | null>(null);
  const [menu, setMenu] = useState(false);
  const [noHold, setNoHold] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [planDone, setPlanDone] = useState<number[]>([]);
  const [competency, setCompetency] = useState<Competency>({ technique: false, tolerance: false });
  const [loaded, setLoaded] = useState(false);
  const audio = useBreathAudio();
  useEffect(() => {
    const hidden = () => { if (document.hidden) stopAudio(); };
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('pagehide', stopAudio);
    return () => { stopAudio(); document.removeEventListener('visibilitychange', hidden); window.removeEventListener('pagehide', stopAudio); };
  }, []);

  useEffect(() => {
    const s = read(K.step, 0);
    setStep(typeof s === 'number' && s >= 0 && s < screens.length ? s : 0);
    setOrigin(read(K.origin, null)); setNoHold(read(K.noHold, false));
    setSessions(read(K.sessions, [])); setPlanDone(read(K.plan, []));
    const savedCompetency = read<Partial<Competency>>(COMPETENCY_KEY, {});
    setCompetency({ technique: savedCompetency.technique === true, tolerance: savedCompetency.tolerance === true });
    setLoaded(true);
  }, []);
  useEffect(() => { if (!loaded) return; centralStorage.setItem(K.step, JSON.stringify(step)); centralStorage.setItem(K.origin, JSON.stringify(origin)); }, [step, origin, loaded]);
  useEffect(() => { if (loaded) centralStorage.setItem(K.noHold, JSON.stringify(noHold)); }, [noHold, loaded]);
  useEffect(() => { if (loaded) centralStorage.setItem(K.sessions, JSON.stringify(sessions)); }, [sessions, loaded]);
  useEffect(() => { if (loaded) centralStorage.setItem(K.plan, JSON.stringify(planDone)); }, [planDone, loaded]);
  useEffect(() => { if (loaded) centralStorage.setItem(COMPETENCY_KEY, JSON.stringify(competency)); }, [competency, loaded]);

  const go = (n: number, fromLibrary = false) => {
    stopAudio();
    setStep(Math.max(0, Math.min(screens.length - 1, n)));
    setOrigin(fromLibrary ? 'library' : null); setMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const save = (s: Session) => setSessions((prev) => [{ ...s, day: centralContext().day }, ...prev].slice(0, 60));
  const scr = screens[step] ?? screens[0];
  const pct = ((step + 1) / screens.length) * 100;
  const practice = (id: string, extra: Partial<React.ComponentProps<typeof BreathPacer>> = {}) => (
    !practiceAllowed ? <div className="bl-note" role="status">Tu programa requiere revisión antes de iniciar prácticas. Puedes consultar la explicación y las recomendaciones de seguridad.</div> : <PracticeBlock key={`${step}-${id}`} id={id} noHold={noHold} setNoHold={setNoHold} onSave={save} goSafety={() => go(16)} {...extra} />
  );

  return (
    <div className="bl-shell">
      <div className="bl-central-day">Día {centralContext().day} de 28 · Tu programa SPM</div>
      <header className="bl-top">
        <button className="bl-brand" onClick={() => go(0)} aria-label="Inicio">
          <span className="bl-mark"><Wind size={17} /></span>
          <span className="bl-brand-text">SPM <b>Breathing Lab</b><small>REGULACIÓN AUTONÓMICA</small></span>
        </button>
        <div className="bl-top-right">
          <Button variant="ghost" size="icon" className="bl-icon" aria-label={audio.muted ? 'Activar audio' : 'Silenciar audio'} title={audio.muted ? 'Activar audio' : 'Silenciar audio'} aria-pressed={audio.muted} onClick={() => setAudioMuted(!audio.muted)}>{audio.muted ? <VolumeX size={19} /> : <Volume2 size={19} />}</Button>
          <span className="bl-counter">{String(step + 1).padStart(2, '0')}<i>/</i>{screens.length}</span>
          <button className="bl-icon" onClick={() => setMenu(true)} aria-label="Abrir índice"><Menu size={21} /></button>
        </div>
        <div className="bl-progress"><span style={{ width: `${pct}%` }} /></div>
      </header>
      {audio.error && <p className="bl-audio-error" role="alert">{audio.error}</p>}

      {menu && (
        <div className="bl-drawer" role="dialog" aria-label="Índice del módulo">
          <div className="bl-drawer-head"><span>ÍNDICE</span><button className="bl-icon" onClick={() => setMenu(false)} aria-label="Cerrar"><X size={21} /></button></div>
          <ol>
            {screens.map((s, i) => (
              <li key={i}><button className={i === step ? 'on' : ''} onClick={() => go(i)}><em>{String(i + 1).padStart(2, '0')}</em>{s.title}</button></li>
            ))}
          </ol>
        </div>
      )}

      <main className="bl-main" key={step}>
        {origin === 'library' && (
          <button className="bl-back-lib" onClick={() => go(13)}><ArrowLeft size={16} /> Volver a la biblioteca</button>
        )}
        <p className="bl-kicker"><span />{scr.kicker}</p>
        <h1 className="bl-h1">{scr.title}</h1>

        {step === 0 && <Welcome onStart={() => go(1)} />}
        <Trainer n={step + 1} text={trainerLines[step] ?? ""} />

        {step === 1 && <Compare />}
        {step === 2 && <Locate onPractice={() => go(4)} />}
        {step === 3 && (<><DemoVideo /><ul className="bl-bullets"><li>Espalda apoyada, hombros sueltos.</li><li>Inhala por la nariz: el abdomen avanza, el pecho casi quieto.</li><li>Exhala lento por nariz o labios entreabiertos.</li><li>Sin esfuerzo ni ruido: suave es suficiente.</li></ul></>)}
        {step === 4 && practice('core-426', { showBelly: true, cycles: 5 })}
        {step === 5 && <HandFeedback>{practice('hand-feedback', { showBelly: true, cycles: 5 })}</HandFeedback>}
        {step === 6 && <Relax />}
        {step === 7 && (<><p className="bl-p">Con una exhalación más larga que la inhalación, el sistema nervioso tiende a pasar a un modo de calma. No hace falta respirar profundo: basta con respirar lento.</p><DemoVideo kind="regulation" />{practice('downregulate', { durationSec: 60 })}</>)}
        {step === 8 && (<><div className="bl-steps"><Num n={1} t="Detén o baja el estímulo" d="Antes de que la activación sea demasiado alta." /><Num n={2} t="Respira bajo y lento" d="Abdomen, no pecho. Exhalación larga." /><Num n={3} t="Suelta la pelvis" d="Deja que glúteos y piso pélvico se aflojen." /><Num n={4} t="Espera el descenso" d="Continúa solo cuando notes calma y control." /></div>{practice('arousal', { durationSec: 60 })}</>)}
        {step === 9 && (<><div className="bl-note teal"><b>Clave:</b> al inhalar el piso pélvico desciende ligeramente de forma natural; al exhalar, en lugar de apretar, deja que se ablande. No empujes ni contengas.</div>{practice('pelvic-release', { showBelly: true, durationSec: 60 })}</>)}
        {step === 10 && (<><p className="bl-p">Tres respiraciones lentas sin retención. Úsala en cualquier momento: antes de una conversación difícil, en un pico de ansiedad o de activación.</p>{practice('rescue', { cycles: 3, lockNoHold: true })}</>)}
        {step === 11 && practice('session-2', { durationSec: 120 })}
        {step === 12 && practice('session-5', { durationSec: 300 })}
        {step === 13 && <LibraryView open={(s) => go(s, true)} />}
        {step === 14 && <PlanView practiceAllowed={practiceAllowed} done={planDone} toggle={(d) => d === centralContext().day && practiceAllowed && setPlanDone((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]))} competency={competency} setCompetency={setCompetency} />}
        {step === 15 && <ProgressView sessions={sessions} planDone={planDone} competency={competency} clear={() => setSessions([])} goLibrary={() => go(13)} />}
        {step === 16 && <Safety />}
        {step === 17 && <Closing onLibrary={() => go(13)} onPlan={() => go(14)} />}
      </main>

      <footer className="bl-foot">
        <button className="bl-btn ghost" onClick={() => go(step - 1)} disabled={step === 0}><ArrowLeft size={16} /> Atrás</button>
        <span>{scr.kicker}</span>
        <button className="bl-btn teal" onClick={() => go(step + 1)} disabled={step === screens.length - 1}>Siguiente <ArrowRight size={16} /></button>
      </footer>
    </div>
  );
}

function Trainer({ n, text }: { n: number; text: string }) {
  const id = AUDIO_IDS.screen(n);
  const available = hasAudio(id);
  const audio = useBreathAudio();
  const playing = audio.id === id;
  useEffect(() => () => stopAudio(), []);
  return (
    <section className="bl-trainer">
      <img src={trainer} alt="Entrenador SPM" loading="lazy" />
      <div>
        <span className="bl-trainer-name">ENTRENADOR SPM</span>
        <p>“{text}”</p>
        <Button variant="ghost" className="bl-audio" disabled={!available || audio.muted} onClick={() => { if (playing) stopAudio(); else playAudio(id); }}>
          {available ? <Volume2 size={15} /> : <VolumeX size={15} />} {available ? (playing ? 'Detener voz' : 'Escuchar') : 'Voz oficial pendiente'}
        </Button>
      </div>
    </section>
  );
}

function PracticeBlock({ id, noHold, setNoHold, onSave, goSafety, ...rest }: { id: string; noHold: boolean; setNoHold: (v: boolean) => void; onSave: (s: Session) => void; goSafety: () => void } & Partial<React.ComponentProps<typeof BreathPacer>>) {
  const [secs, setSecs] = useState(0);
  const [comfort, setComfort] = useState(4);
  const [dizzy, setDizzy] = useState(false);
  const [saved, setSaved] = useState(false);
  const finish = useCallback((s: number) => { setSecs(s); setSaved(false); }, []);
  return (
    <section className="bl-practice">
      <BreathPacer pattern={PATTERN_426} noHold={noHold} onNoHold={setNoHold} onFinish={finish} {...rest} />
      {secs > 0 && (
        <div className="bl-checkin">
          <h3>¿Cómo te sentiste?</h3>
          <div className="bl-scale">
            {[1, 2, 3, 4, 5].map((v) => (<button key={v} className={comfort === v ? 'on' : ''} onClick={() => setComfort(v)}>{v}</button>))}
          </div>
          <div className="bl-scale-legend"><span>Incómodo</span><span>Muy cómodo</span></div>
          <label className="bl-toggle"><input type="checkbox" checked={dizzy} onChange={(e) => setDizzy(e.target.checked)} /><span className="bl-switch" /><span>Noté mareo, falta de aire u hormigueo</span></label>
          {dizzy && (
            <div className="bl-note warn"><ShieldAlert size={16} /> Detente y respira normal. Prueba el modo <b>sin pausa</b> y con menos intensidad. <button className="bl-link" onClick={goSafety}>Ver señales de seguridad</button></div>
          )}
          <button className="bl-btn teal wide" disabled={saved} onClick={() => { onSave({ date: new Date().toISOString(), practice: id, seconds: secs, comfort, dizzy, noHold }); setSaved(true); if (dizzy) setNoHold(true); }}>
            {saved ? (<><Check size={16} /> Guardado en este dispositivo</>) : 'Guardar registro'}
          </button>
        </div>
      )}
    </section>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <>
      <section className="bl-hero">
        <img src={trainer} alt="Entrenador SPM" />
        <div className="bl-hero-copy">
          <span className="bl-hero-index">MÓDULO · RESPIRACIÓN DIAFRAGMÁTICA</span>
          <h2>Respira <em>más lento</em>,<br />responde con más calma.</h2>
          <p>La respiración es la única función automática que también puedes dirigir. Usarla bien ayuda a bajar la activación, soltar tensión y recuperar control.</p>
          <button className="bl-btn gold" onClick={onStart}>Comenzar <ArrowRight size={16} /></button>
        </div>
      </section>
      <div className="bl-grid3">
        <Feature icon={<Wind size={18} />} t="Diafragma" d="Aprende a mover el aire desde el abdomen." />
        <Feature icon={<HeartPulse size={18} />} t="Regulación" d="Exhalaciones largas para bajar intensidad." />
        <Feature icon={<Activity size={18} />} t="Aplicación" d="Rescate, pausas y piso pélvico relajado." />
      </div>
      <p className="bl-foot-note">18 pantallas · 10–15 min · tus registros se guardan solo en este dispositivo.</p>
    </>
  );
}

function Feature({ icon, t, d }: { icon: React.ReactNode; t: string; d: string }) {
  return <div className="bl-card bl-feature"><span className="bl-ico">{icon}</span><h3>{t}</h3><p>{d}</p></div>;
}

function Compare() {
  return (
    <div className="bl-grid2">
      <div className="bl-card bl-compare dim">
        <span className="bl-tag">TORÁCICA</span>
        <img className="bl-compare-visual" src={toracicImg.url} alt="Ilustración de respiración torácica: torso masculino con pecho y hombros resaltados en dorado, señal de que el movimiento sube hacia el pecho" width={1536} height={1024} loading="lazy" />
        <ul><li>Se mueven pecho y hombros</li><li>Ritmo rápido y corto</li><li>Acompaña estrés y tensión</li></ul>
      </div>
      <div className="bl-card bl-compare">
        <span className="bl-tag teal">DIAFRAGMÁTICA</span>
        <img className="bl-compare-visual" src={diaphragmaticImg.url} alt="Ilustración de respiración diafragmática: torso masculino con énfasis visual en el movimiento del abdomen, resaltado en turquesa" width={1536} height={1024} loading="lazy" />
        <ul><li>Se mueve el abdomen</li><li>Ritmo lento, exhalación larga</li><li>Favorece calma y control</li></ul>
      </div>
    </div>
  );
}

function Locate({ onPractice }: { onPractice: () => void }) {
  const [ans, setAns] = useState<'chest' | 'abd' | 'both' | null>(null);
  const fb = { chest: 'Es lo más habitual con tensión. En las siguientes pantallas llevarás el movimiento hacia el abdomen.', abd: 'Muy bien: ya usas el diafragma. Ahora trabajaremos el ritmo y la exhalación larga.', both: 'Buen punto de partida. El objetivo es que el abdomen guíe y el pecho acompañe casi quieto.' };
  return (
    <section className="bl-card">
      <ol className="bl-ol"><li>Siéntate o recuéstate cómodo.</li><li>Una mano en el pecho, otra sobre el ombligo.</li><li>Respira como siempre durante 3–4 respiraciones.</li></ol>
      <h3 className="bl-q">¿Qué mano se mueve más?</h3>
      <div className="bl-choices">
        {([['chest', 'Pecho'], ['abd', 'Abdomen'], ['both', 'Las dos por igual']] as const).map(([k, l]) => (
          <button key={k} className={ans === k ? 'on' : ''} onClick={() => setAns(k)}>{l}</button>
        ))}
      </div>
      {ans && (<div className="bl-note teal">{fb[ans]} <button className="bl-link" onClick={onPractice}>Ir a practicar</button></div>)}
    </section>
  );
}

function HandFeedback({ children }: { children: React.ReactNode }) {
  const [c, setC] = useState<Record<string, boolean>>({});
  const items = ['La mano del abdomen sube al inhalar', 'El pecho se mantiene casi quieto', 'Al exhalar el abdomen baja sin empujar'];
  return (
    <>
      {children}
      <section className="bl-card">
        <h3 className="bl-q">Autoverificación</h3>
        {items.map((t) => (
          <button key={t} className={`bl-check ${c[t] ? 'on' : ''}`} onClick={() => setC((p) => ({ ...p, [t]: !p[t] }))}><span>{c[t] && <Check size={14} />}</span>{t}</button>
        ))}
         {Object.values(c).filter(Boolean).length === 3 && <div className="bl-note teal">Patrón diafragmático observado. Sigue comprobando que el ritmo sea cómodo; la integración dependerá de tu evolución.</div>}
      </section>
    </>
  );
}

function Relax() {
  const zones = [
    { k: 'jaw', t: 'Mandíbula', d: 'Labios juntos, dientes separados, lengua suave en el paladar.' },
    { k: 'shoulders', t: 'Hombros', d: 'Súbelos al inhalar y déjalos caer al exhalar. Repite dos veces.' },
    { k: 'abd', t: 'Abdomen', d: 'Deja de “meter barriga”. Permite que se expanda libremente.' },
  ];
  const [on, setOn] = useState<string[]>([]);
  return (
    <div className="bl-stack">
      {zones.map((z, i) => (
        <button key={z.k} className={`bl-zone ${on.includes(z.k) ? 'on' : ''}`} onClick={() => setOn((p) => (p.includes(z.k) ? p.filter((x) => x !== z.k) : [...p, z.k]))}>
          <em>{i + 1}</em><div><h3>{z.t}</h3><p>{z.d}</p></div><span className="bl-zone-check">{on.includes(z.k) ? <Check size={16} /> : null}</span>
        </button>
      ))}
      {on.length === 3 && <div className="bl-note teal"><Sparkles size={16} /> Cuerpo listo. La exhalación larga ahora será más fácil.</div>}
    </div>
  );
}

function Num({ n, t, d }: { n: number; t: string; d: string }) {
  return <div className="bl-num"><em>{n}</em><div><h3>{t}</h3><p>{d}</p></div></div>;
}

function LibraryView({ open }: { open: (step: number) => void }) {
  return (
    <div className="bl-stack">
      <details className="bl-card">
        <summary className="min-h-11 cursor-pointer content-center text-spm-gold">Respiración diafragmática guiada · SPM Central</summary>
        <DemoVideo kind="guided" />
      </details>
      <Button variant="ghost" className="bl-lib-item" onClick={() => open(7)}>
        <span className="bl-ico"><Play size={16} /></span>
        <div><h3>Respiración para regulación de ansiedad</h3><p>Video guiado · regulación</p></div>
        <ChevronRight size={18} />
      </Button>
      {library.map((p) => (
        <button key={p.id} className="bl-lib-item" onClick={() => open(p.step)}>
          <span className="bl-ico"><Library size={16} /></span>
          <div><h3>{p.name}</h3><p>{p.desc}</p></div>
          <em>{p.minutes}</em><ChevronRight size={18} />
        </button>
      ))}
    </div>
  );
}

function PlanView({ practiceAllowed, done, toggle, competency, setCompetency }: { practiceAllowed: boolean; done: number[]; toggle: (d: number) => void; competency: Competency; setCompetency: React.Dispatch<React.SetStateAction<Competency>> }) {
  return (
    <div className="bl-stack">
       <p className="bl-note teal">Estás en el día {centralContext().day} de tu plan SPM. Solo puedes registrar la práctica de hoy. Este registro no completa automáticamente el día de tu programa principal.</p>
       <p className="bl-p">Estos 28 días son una etapa de aprendizaje, conciencia corporal y adquisición de habilidades, no una carrera por automatizar todo. Practica en días seleccionados según tu evolución y el plan asignado por SPM; marca solo los días en que practiques.</p>
       <section className="bl-card">
         <h3 className="bl-q">Checkpoint · técnica y tolerancia</h3>
         <p className="bl-week-task">Valida cada punto cuando corresponda. Aprender rápido permite integrar antes; si necesitas más tiempo, sigue practicando la respiración como habilidad específica.</p>
         <label className="bl-toggle"><input type="checkbox" checked={competency.technique} onChange={(e) => setCompetency((p) => ({ ...p, technique: e.target.checked }))} /><span className="bl-switch" /><span>Técnica diafragmática correcta y sin esfuerzo</span></label>
         <label className="bl-toggle"><input type="checkbox" checked={competency.tolerance} onChange={(e) => setCompetency((p) => ({ ...p, tolerance: e.target.checked }))} /><span className="bl-switch" /><span>Buena tolerancia, sin mareo ni malestar</span></label>
         <div className="bl-note teal">{competency.technique && competency.tolerance ? 'Técnica validada: queda disponible para integración según tu evolución y el plan asignado por SPM. No implica una práctica diaria.' : 'Sigue observando técnica y comodidad. No hay un ritmo único ni obligación de practicar todos los días.'}</div>
       </section>
      {weeks.map((w, wi) => (
        <section key={w} className="bl-card">
          <h3 className="bl-week"><CalendarDays size={15} /> {w}</h3>
          <p className="bl-week-task">{plan[wi * 7]?.task}</p>
          <div className="bl-days">
            {plan.slice(wi * 7, wi * 7 + 7).map((d) => (
              <button key={d.day} disabled={d.day !== centralContext().day || !practiceAllowed} aria-current={d.day === centralContext().day ? "date" : undefined} aria-label={`Día ${d.day}: ${d.task}`} title={d.task} className={`${d.rest ? 'rest' : ''} ${done.includes(d.day) ? 'on' : ''}`} onClick={() => toggle(d.day)}>
                {done.includes(d.day) ? <Check size={13} /> : d.day}
              </button>
            ))}
          </div>
          {wi < 3 && <small className="bl-rest-note">Día {wi * 7 + 7}: descanso</small>}
           {wi === 3 && <small className="bl-rest-note">Día 28: revisión; sesión opcional</small>}
        </section>
      ))}
      <p className="bl-p">La preparación habitual antes del entrenamiento corresponde sobre todo a la futura etapa de mantenimiento. Con la técnica dominada, SPM podrá combinarla con piso pélvico, atención, regulación, focalización y otras habilidades en rutinas más avanzadas.</p>
    </div>
  );
}

function ProgressView({ sessions, planDone, competency, clear, goLibrary }: { sessions: Session[]; planDone: number[]; competency: Competency; clear: () => void; goLibrary: () => void }) {
  const mins = Math.round(sessions.reduce((a, s) => a + s.seconds, 0) / 60);
  const avg = sessions.length ? (sessions.reduce((a, s) => a + s.comfort, 0) / sessions.length).toFixed(1) : '—';
  const dizzy = sessions.filter((s) => s.dizzy).length;
  const name = (id: string) => library.find((l) => l.id === id)?.name ?? id;
  return (
    <div className="bl-stack">
      <div className="bl-stats">
        <div><strong>{sessions.length}</strong><span>sesiones</span></div>
        <div><strong>{mins}</strong><span>minutos</span></div>
        <div><strong>{avg}</strong><span>confort medio</span></div>
         <div><strong>{planDone.length}/28</strong><span>días registrados</span></div>
      </div>
       {competency.technique && competency.tolerance && <div className="bl-note teal">Técnica validada: queda disponible para integración según tu evolución y el plan asignado por SPM; no se vuelve diaria automáticamente.</div>}
      {dizzy > 0 && <div className="bl-note warn"><ShieldAlert size={16} /> {dizzy} sesión(es) con mareo o malestar. Mantén el modo sin pausa y consulta si se repite.</div>}
      <section className="bl-card">
        <h3 className="bl-q">Registro reciente</h3>
        {sessions.length === 0 ? (
          <p className="bl-muted">Aún no hay sesiones. <button className="bl-link" onClick={goLibrary}>Elige una práctica</button></p>
        ) : (
          <ul className="bl-log">
            {sessions.slice(0, 8).map((s, i) => (
              <li key={i}><span>{new Date(s.date).toLocaleDateString('es', { day: '2-digit', month: 'short' })}</span><b>{name(s.practice)}</b><em>{Math.round(s.seconds / 6) / 10} min · {s.comfort}/5{s.noHold ? ' · sin pausa' : ''}{s.dizzy ? ' · ⚠' : ''}</em></li>
            ))}
          </ul>
        )}
        {sessions.length > 0 && <button className="bl-link" onClick={clear}>Borrar registro demo</button>}
      </section>
      <p className="bl-foot-note">Registro demo local: no sale de este dispositivo.</p>
    </div>
  );
}

function Safety() {
  return (
    <div className="bl-stack">
      <div className="bl-note warn big"><ShieldAlert size={18} /><div><b>Detén la práctica</b> y respira de forma normal si notas: mareo, visión borrosa, hormigueo en manos o labios, falta de aire importante, dolor u opresión en el pecho, palpitaciones marcadas o cualquier malestar.</div></div>
      <section className="bl-card">
        <h3 className="bl-q">Cómo practicar con seguridad</h3>
        <ul className="bl-bullets">
          <li>No fuerces el volumen de aire: lento no significa profundo.</li>
          <li>No hiperventiles ni encadenes respiraciones rápidas.</li>
          <li>Si las pausas te incomodan, usa siempre el modo sin pausa.</li>
          <li>Practica sentado o recostado, nunca conduciendo ni en el agua.</li>
        </ul>
      </section>
      <div className="bl-note teal">Si los síntomas persisten, se repiten o tienes una condición respiratoria o cardíaca, consulta con tu profesional de salud. Ante dolor torácico intenso o dificultad respiratoria grave, busca atención urgente. Este módulo es educativo y no sustituye una valoración clínica.</div>
    </div>
  );
}

function Closing({ onLibrary, onPlan }: { onLibrary: () => void; onPlan: () => void }) {
   const items = ['Respirar con el abdomen, no con el pecho', 'Ciclo 4·2·6 (o 4·6 sin pausa)', 'Soltar mandíbula, hombros, abdomen y pelvis', 'Rescate de 3 respiraciones cuando lo necesites', '28 días para aprender y adquirir habilidades a tu ritmo'];
  return (
    <div className="bl-stack">
      <section className="bl-card">
        {items.map((t) => <div key={t} className="bl-closing-item"><Check size={16} /> {t}</div>)}
      </section>
      <div className="bl-grid2">
        <button className="bl-btn gold wide" onClick={onPlan}>Empezar el plan</button>
        <button className="bl-btn ghost wide" onClick={onLibrary}>Ir a la biblioteca</button>
      </div>
    </div>
  );
}
