import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { contextKey, host, load, readContext, save, useHostContext, type HostContext } from '@/lib/pf-host';
import { setSequenceActive, useSequenceActive, hasAudio, playAudio, pauseAudio, resumeAudio, stopAudio, preloadCues, useAudioState } from '@/lib/pf-audio';
import anatomy from '@/assets/pelvic-anatomy.jpg';
import trainerImg from '@/assets/spm-trainer.jpg';
import {
  SCREENS, DAILY_PHASES, RED_FLAGS, ALARM_SIGNS, REEVAL_REASONS, OVERLOAD_SIGNS, PRACTICES, REC_LABEL, recommendDaily,
  type FloorState, type PracticeResult,
} from '@/lib/pf-data';

/* All health records remain in the authenticated host. Historical keys and results
   retain their meaning; the daily Lab never writes strength-readiness screening. */
const K = { step: 'pf-step', origin: 'pf-origin', assign: 'pf-assignment', results: 'pf-results', daily: 'pf-daily-result', flags: 'pf-flags', overload: 'pf-overload', screen: 'pf-screening', checkins: 'pf-checkins', cfg: 'pf-demo-config' };
type Origin = 'lab' | 'library' | 'dailyPlan';
type StoredResult = PracticeResult & { at: string; origin: Origin };
type Checkin = { at: string; tension: number; release: string };
type WideView = { state: FloorState; label: string };
const URGENT = 'Si no puedes orinar, tienes dolor abdominal intenso o dolor testicular repentino e intenso, busca atención médica inmediata.';
const GUIDE_STEPS = ['Acomódate', 'Observa la zona', 'Sigue la guía', 'Registra tu respuesta'];
const DAILY_LIBRARY = [
  { id: 'lib.percibe', step: 3, tag: 'Práctica diaria', name: 'Percibe, respira y suelta' },
  { id: 'lib.localiza', step: 2, tag: 'Ubicación', name: 'Reconoce la zona' },
  { id: 'lib.contrae', step: 6, tag: 'Guía a tu ritmo', name: 'Sigue el recorrido visual' },
  { id: 'lib.coord', step: 7, tag: 'Coordinación sin contracción', name: 'Acompaña tu respiración' },
  { id: 'lib.rapidas', step: 8, tag: 'Atención y liberación', name: 'Elige un apoyo para soltar' },
  { id: 'lib.exceso', step: 10, tag: 'Cuidado', name: 'Reconoce cuándo parar' },
];

function AudioCue({ id }: { id: string }) {
  const has = hasAudio(id), active = useSequenceActive(), audio = useAudioState();
  const status = audio.id === id ? audio.status : 'idle';
  const text = active ? 'Pausa la guía para escuchar' : !has ? 'Audio no disponible' : status === 'playing' ? 'Pausar explicación'
    : status === 'paused' ? 'Continuar explicación' : status === 'loading' ? 'Pausar carga de audio' : status === 'error' ? 'Reintentar audio' : 'Escuchar la guía';
  return <div className="pf-audio" data-audio-id={id} data-audio-status={status}>
    <button type="button" disabled={!has || active} onClick={() => {
      if (status === 'playing' || status === 'loading') pauseAudio();
      else if (status === 'paused') void resumeAudio();
      else void playAudio(id);
    }}><span aria-hidden="true">{status === 'playing' || status === 'loading' ? 'Ⅱ' : '▶'}</span>{text}</button>
    {status === 'error' && <span role="status">Puedes reintentar o abrir el texto.</span>}
  </div>;
}

function Trainer({ text, audioId }: { text: string; audioId: string }) {
  return <section className="pf-trainer" aria-label="Guía del entrenador SPM">
    <img src={trainerImg} alt="Entrenador SPM" loading="lazy" />
    <div className="pf-trainer-main"><span className="pf-kicker">Te acompaño paso a paso</span><AudioCue id={audioId} /></div>
    <details className="pf-transcript"><summary>Leer la explicación</summary><p>{text}</p></details>
  </section>;
}

/* The original anatomy image and localized SVG remain. State always comes from
   the current manual phase; pausing returns it to rest. This is not biofeedback. */
const STATE_CAP: Record<FloorState, string> = {
  rest: 'Reposo · observa el apoyo, sin esfuerzo',
  breathe: 'Respiración cómoda · sin retener el aire',
  up: 'Referencia de activación', hold: 'Referencia de sostén',
  down: 'Liberación · vuelve al reposo, sin empujar',
};
function Anatomy({ state, label, onWide }: { state: FloorState; label?: string; onWide?: () => void }) {
  const gradientId = useId().replace(/:/g, '');
  return <div className="pf-anatomy-wrap" data-floor-state={state}>
    <div className="pf-anat">
      <img src={anatomy} alt="Pelvis masculina con la zona del piso pélvico resaltada en la base" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><radialGradient id={gradientId} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="var(--pf-teal)" stopOpacity=".95" /><stop offset="100%" stopColor="var(--pf-teal)" stopOpacity="0" /></radialGradient></defs>
        <line className={`pf-restline st-${state}`} x1="36" y1="45.5" x2="64" y2="45.5" />
        <g className={`pf-floor st-${state}`}><ellipse cx="50" cy="45.5" rx="13" ry="5.5" fill={`url(#${gradientId})`} /><path d="M39 43 Q50 50 61 43" fill="none" stroke="var(--pf-teal)" strokeWidth=".6" strokeLinecap="round" /></g>
        <g className={`pf-dir st-${state}`} fill="none" stroke="var(--pf-gold)" strokeWidth=".6" strokeLinecap="round" strokeLinejoin="round">
          <path className="a-up" d="M50 38.5 V34 M48 36 L50 34 L52 36" />
          <path className="a-down" d="M50 52 V56.5 M48 54.5 L50 56.5 L52 54.5 M44 53 L41.5 55 M56 53 L58.5 55" />
        </g>
      </svg>
      <div className="pf-anat-label"><span className="pf-chip pf-chip-teal">{label ?? 'Base de la pelvis'}</span>{onWide && <button type="button" className="pf-chip" onClick={onWide}>Ampliar imagen</button>}</div>
    </div>
    <p className="pf-anat-cap" aria-live="polite">{STATE_CAP[state]}</p>
  </div>;
}

function PathSteps({ current }: { current: number }) {
  return <ol className="pf-action-path" aria-label="Pasos de la práctica">{GUIDE_STEPS.map((label, index) =>
    <li key={label} className={index === current ? 'on' : index < current ? 'done' : ''} aria-current={index === current ? 'step' : undefined}><span>{index + 1}</span>{label}</li>)}</ol>;
}

type PracticePosture = 'seated' | 'reclined';
function PosturePicture({ posture }: { posture: PracticePosture }) {
  return <svg viewBox="0 0 180 112" aria-hidden="true" className="pf-posture-picture" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path className="pf-posture-support" d={posture === 'seated' ? 'M65 29 V76 H110 M69 76 V102 M106 76 V102 M36 104 H151' : 'M12 94 H168 M18 94 V104 M161 94 V104'} />
    {posture === 'seated' ? <>
      <circle className="pf-posture-person" cx="77" cy="19" r="10" />
      <path className="pf-posture-person" d="M76 39 L74 67 H109 L118 98 H138 M85 43 L94 60 H111" />
      <path className="pf-posture-contact" d="M67 43 V67 M119 104 H141" />
    </> : <>
      <path className="pf-posture-cushion" d="M16 88 Q31 82 47 88 V94 H16 Z" />
      <circle className="pf-posture-person" cx="31" cy="76" r="10" />
      <path className="pf-posture-person" d="M53 88 H92 L117 54 L147 89 H162 M58 78 L82 78 L94 85" />
      <path className="pf-posture-contact" d="M52 95 H94 M145 96 H165" />
    </>}
  </svg>;
}

/* A manual comparison illustrates comfortable breathing without setting a pace,
   a dose or a measured muscle state. Pausing always restores the neutral image. */
function BreathingCompanion({ active }: { active: boolean }) {
  const [phase, setPhase] = useState<'rest' | 'inhale' | 'exhale'>('rest');
  const titleId = useId();
  useEffect(() => { if (!active) setPhase('rest'); }, [active]);
  const current = active ? phase : 'rest';
  return <details className="pf-details pf-breath-companion" onToggle={event => { if (!event.currentTarget.open) setPhase('rest'); }}>
    <summary>Ver cómo acompaña la respiración</summary>
    <div className="pf-breath-layout" data-breath-phase={current}>
      <svg className="pf-breath-diagram" viewBox="0 0 220 232" role="img" aria-labelledby={titleId}>
        <title id={titleId}>{current === 'inhale' ? 'Al entrar aire, las costillas se amplían, el diafragma desciende y el piso pélvico se alarga suavemente.' : current === 'exhale' ? 'El diafragma y el piso pélvico vuelven hacia el reposo al salir el aire, sin apretar.' : 'Esquema del tronco con las costillas, el diafragma y el piso pélvico en reposo.'}</title>
        <path className="pf-breath-body" d="M82 12 L78 26 Q47 30 45 55 L52 123 Q48 155 61 193 L76 219 M138 12 L142 26 Q173 30 175 55 L168 123 Q172 155 159 193 L144 219" />
        <path className="pf-breath-midline" d="M110 35 V168" />
        <g className="pf-breath-ribs">
          <path d="M101 44 Q76 42 62 54 M101 57 Q75 55 60 67 M101 70 Q76 68 62 80 M119 44 Q144 42 158 54 M119 57 Q145 55 160 67 M119 70 Q144 68 158 80" />
        </g>
        <path className="pf-breath-diaphragm" d="M63 94 Q110 57 157 94 Q110 72 63 94 Z" />
        <path className="pf-breath-pelvis" d="M60 155 Q68 177 86 178 M160 155 Q152 177 134 178 M86 178 L93 197 M134 178 L127 197" />
        <path className="pf-breath-floor" d="M70 179 Q110 197 150 179 Q110 207 70 179 Z" />
        <circle className="pf-breath-dot-ribs" cx="176" cy="66" r="4" />
        <circle className="pf-breath-dot-diaphragm" cx="176" cy="100" r="4" />
        <circle className="pf-breath-dot-floor" cx="176" cy="186" r="4" />
      </svg>
      <div className="pf-breath-explanation">
        <span className="pf-kicker">Esquema orientativo</span>
        <h3 aria-live="polite">{current === 'inhale' ? 'Inhala suave' : current === 'exhale' ? 'Exhala sin apretar' : active ? 'Observa y compara' : 'En pausa · reposo'}</h3>
        <ul className="pf-breath-key">
          <li><i className="pf-breath-key-ribs" aria-hidden="true" /><span><b>Costillas</b>{current === 'inhale' ? 'Se amplían suavemente.' : current === 'exhale' ? 'Vuelven hacia el reposo.' : 'Acompañan la respiración.'}</span></li>
          <li><i className="pf-breath-key-diaphragm" aria-hidden="true" /><span><b>Diafragma</b>{current === 'inhale' ? 'Desciende con la entrada de aire.' : current === 'exhale' ? 'Regresa al dejar salir el aire.' : 'Se mueve al entrar y salir aire.'}</span></li>
          <li><i className="pf-breath-key-floor" aria-hidden="true" /><span><b>Piso pélvico</b>{current === 'inhale' ? 'Puede alargarse y ablandarse.' : current === 'exhale' ? 'Vuelve al reposo, sin apretar.' : 'Acompaña el movimiento, sin esfuerzo.'}</span></li>
        </ul>
      </div>
    </div>
    <div className="pf-breath-choices" role="group" aria-label="Compara las fases de una respiración cómoda">
      <button type="button" aria-pressed={current === 'inhale'} disabled={!active} onClick={() => setPhase('inhale')}><span aria-hidden="true">↔</span>Inhala suave</button>
      <button type="button" aria-pressed={current === 'exhale'} disabled={!active} onClick={() => setPhase('exhale')}><span aria-hidden="true">↩</span>Exhala sin apretar</button>
    </div>
    <p className="pf-small">Toca para comparar. Respira a tu ritmo, sin empujar ni retener el aire.</p>
  </details>;
}

function YesNo({ q, value, onChange }: { q: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return <fieldset className="pf-yn"><legend>{q}</legend><div className="pf-seg">
    <button type="button" aria-pressed={value === true} className={value === true ? 'on' : ''} onClick={() => onChange(true)}>Sí</button>
    <button type="button" aria-pressed={value === false} className={value === false ? 'on' : ''} onClick={() => onChange(false)}>No</button>
  </div></fieldset>;
}

/* A self-paced guide, not a new prescribed series. The elapsed clock is optional
   information only: no minimum, no countdown and no automatic completion. */
function useDailyGuide() {
  const [index, setIndex] = useState(0), [playing, setPlaying] = useState(false), [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0), [audioError, setAudioError] = useState(false);
  const clock = useRef({ playing: false, since: 0, total: 0 }), version = useRef(0), indexRef = useRef(0);
  const pause = useCallback(() => {
    version.current++;
    if (clock.current.playing) clock.current.total += Math.max(0, performance.now() - clock.current.since);
    clock.current.playing = false;
    setElapsed(clock.current.total); setPlaying(false); stopAudio(); setSequenceActive(false);
  }, []);
  const speak = (i: number) => {
    const token = ++version.current;
    setAudioError(false);
    void playAudio(DAILY_PHASES[i]!.audioId).then(ok => { if (token === version.current) setAudioError(!ok); });
  };
  const start = () => {
    if (clock.current.playing) return;
    clock.current.playing = true; clock.current.since = performance.now();
    setStarted(true); setPlaying(true); setSequenceActive(true); speak(indexRef.current);
  };
  const change = (i: number) => {
    indexRef.current = i; setIndex(i);
    if (clock.current.playing) speak(i);
  };
  const reset = () => { pause(); clock.current.total = 0; indexRef.current = 0; setIndex(0); setElapsed(0); setStarted(false); setAudioError(false); };
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setElapsed(clock.current.total + Math.max(0, performance.now() - clock.current.since)), 250);
    return () => window.clearInterval(timer);
  }, [playing]);
  useEffect(() => {
    preloadCues();
    const hide = () => { if (document.hidden) pause(); };
    window.addEventListener('pagehide', pause); window.addEventListener('spm:pelvic-pause', pause); document.addEventListener('visibilitychange', hide);
    return () => { version.current++; clock.current.playing = false; stopAudio(); setSequenceActive(false); window.removeEventListener('pagehide', pause); window.removeEventListener('spm:pelvic-pause', pause); document.removeEventListener('visibilitychange', hide); };
  }, [pause]);
  return { index, playing, started, elapsed, audioError, pause, start, change, reset, phase: DAILY_PHASES[index]!, state: (playing ? DAILY_PHASES[index]!.state : 'rest') as FloorState };
}

function PracticeFlow({ context, onResult, flags, priorDiscomfort, onReturn, returnLabel, onSafety }: {
  context: HostContext | null; onResult: (r: PracticeResult, startedContext: HostContext | null) => boolean;
  flags: boolean; priorDiscomfort: boolean; onReturn: () => void; returnLabel: string; onSafety: () => void;
}) {
  const [stage, setStage] = useState<'pre' | 'run' | 'post' | 'result'>('pre');
  const [posture, setPosture] = useState<PracticePosture>('seated');
  const [release, setRelease] = useState<boolean | null>(null), [discomfort, setDiscomfort] = useState<boolean | null>(null), [tension, setTension] = useState<boolean | null>(null);
  const [interrupted, setInterrupted] = useState(false), [result, setResult] = useState<PracticeResult | null>(null), [error, setError] = useState('');
  const startContext = useRef<HostContext | null>(null), submitted = useRef(false);
  const guide = useDailyGuide();
  const activeContext = () => !!context && context.restriction !== 'review' && contextKey(readContext()) === contextKey(context) && readContext()?.restriction !== 'review';
  const begin = () => {
    if (!activeContext()) { setError('Vuelve a tu plan para abrir esta práctica con tu sesión actual.'); return; }
    startContext.current = readContext(); setError(''); setStage('run'); guide.start();
  };
  const finish = (wasInterrupted: boolean) => {
    if (!guide.started) return;
    guide.pause(); setInterrupted(wasInterrupted); setStage('post'); setError('');
  };
  const again = () => { guide.reset(); submitted.current = false; setStage('pre'); setRelease(null); setDiscomfort(null); setTension(null); setInterrupted(false); setResult(null); setError(''); };
  const ready = release !== null && discomfort !== null && tension !== null;
  const submit = () => {
    if (!ready || submitted.current) return;
    const base = { practiceId: 'percibe' as const, completed: guide.started && !interrupted, cleanContraction: null, fullRelease: release, discomfort, postTension: tension };
    const value: PracticeResult = { ...base, recommendation: recommendDaily(base, { flags, priorDiscomfort }) };
    if (!activeContext() || contextKey(startContext.current) !== contextKey(readContext()) || !onResult(value, startContext.current)) {
      setError('No se pudo registrar tu respuesta en esta sesión. Tus respuestas siguen aquí. Reintenta o vuelve a tu plan si cambió el día.'); return;
    }
    submitted.current = true; setResult(value); setStage('result'); setError('');
  };
  if (stage === 'pre') return <section className="pf-practice" data-stage="pre" data-practice="percibe">
    <PathSteps current={0} />
    <div className="pf-practice-entry"><div className="pf-card pf-preparation">
      <h2>Acomódate y empieza</h2>
      <div className="pf-posture-options" role="group" aria-label="Elige una postura cómoda">
        {([{ id: 'seated', label: 'Sentado' }, { id: 'reclined', label: 'Recostado' }] as const).map(item => <button type="button" key={item.id} className={posture === item.id ? 'on' : ''} aria-pressed={posture === item.id} onClick={() => setPosture(item.id)}><PosturePicture posture={item.id} /><span>{item.label}</span><i aria-hidden="true">{posture === item.id ? '✓' : ''}</i></button>)}
      </div>
      <p className="pf-posture-cue" role="status">{posture === 'seated' ? 'Apoya la espalda y los pies. Deja los muslos y glúteos sueltos.' : 'Apoya la cabeza y la espalda. Dobla las rodillas con comodidad y apoya los pies.'}</p>
      <ol className="pf-instructions"><li>Observa la zona resaltada, sin contraer.</li><li>Deja entrar y salir el aire con comodidad.</li></ol>
      <button type="button" className="pf-btn pf-btn-gold pf-full" onClick={begin}>Comenzar mi práctica</button><p className="pf-small">A tu ritmo · sin tiempo mínimo</p>
    </div><Anatomy state="rest" label="Observa la zona" /></div>{error && <p className="pf-alert" role="alert">{error}</p>}
    <details className="pf-details"><summary>Antes de empezar</summary><p>No practiques al orinar. No empujes ni fuerces la respiración. Si aparece dolor, mareo o malestar, detén la práctica.</p></details>
  </section>;
  if (stage === 'run') {
    const seconds = Math.floor(guide.elapsed / 1000), clock = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    return <section className="pf-practice" data-stage="run" data-practice="percibe" data-playing={guide.playing}>
      <PathSteps current={2} /><div className="pf-card pf-seq">
        <Anatomy state={guide.state} label={guide.playing ? guide.phase.label : 'En pausa · reposo'} />
        <div className="pf-phase-buttons" aria-label="Elige el paso de tu guía">{DAILY_PHASES.map((phase, i) => <button type="button" key={phase.key} className={guide.index === i ? 'on' : ''} aria-pressed={guide.index === i} onClick={() => guide.change(i)}><span>{i + 1}</span>{phase.label}</button>)}</div>
        <h2 className="pf-phase">{guide.playing ? guide.phase.label : 'En pausa'}</h2>
        <p className="pf-cue" aria-live="polite" data-audio-id={guide.phase.audioId}>{guide.playing ? guide.phase.cue : 'Deja la zona en reposo. Continúa cuando te resulte cómodo.'}</p>
        <div className="pf-clock"><span>Tiempo orientativo</span><output aria-label="Tiempo de práctica" data-elapsed={seconds}>{clock}</output><span>Sin mínimo</span></div>
        {guide.audioError && <p className="pf-alert" role="status">El audio no pudo reproducirse. Puedes seguir el texto o pausar y continuar para reintentarlo.</p>}
        <div className="pf-ctrls"><button type="button" className="pf-btn pf-btn-gold" onClick={guide.playing ? guide.pause : guide.start}>{guide.playing ? 'Pausar guía' : 'Continuar guía'}</button><button type="button" className="pf-btn pf-btn-ghost" onClick={() => guide.change((guide.index + 1) % DAILY_PHASES.length)}>{guide.index === DAILY_PHASES.length - 1 ? 'Repetir recorrido' : `Pasar a ${DAILY_PHASES[guide.index + 1]!.label.toLowerCase()}`}</button></div>
        <p className="pf-small pf-visual-note">Representación orientativa. No necesitas notar ni imitar el movimiento.</p>
        <BreathingCompanion active={guide.playing} />
      </div>
      <button type="button" className="pf-btn pf-btn-teal pf-full pf-finish" onClick={() => finish(false)}>Terminé mi práctica a mi ritmo</button>
      <button type="button" className="pf-back pf-stop" onClick={() => finish(true)}>Interrumpir y registrar una dificultad</button>
    </section>;
  }
  if (stage === 'post') return <section className="pf-card pf-response" data-stage="post">
    <PathSteps current={3} /><h2>{interrupted ? 'Registra lo que ocurrió' : '¿Qué notaste?'}</h2>
    <p className="pf-small">No necesitas sentir una mejoría. Elige tus respuestas.</p>
    {interrupted && <p className="pf-alert">La práctica quedó interrumpida y no contará como realizada.</p>}
    <YesNo q="¿Pudiste dejar la zona en reposo?" value={release} onChange={setRelease} />
    <YesNo q="¿Apareció dolor o molestia?" value={discomfort} onChange={setDiscomfort} />
    <YesNo q="¿Sentiste más tensión al terminar?" value={tension} onChange={setTension} />
    {error && <p className="pf-alert" role="alert">{error}</p>}
    <button type="button" className="pf-btn pf-btn-gold pf-full" disabled={!ready} onClick={submit}>{error ? 'Reintentar registro' : 'Registrar mi respuesta'}</button>
  </section>;
  const value = result!;
  const caution = value.recommendation === 'relax' || value.recommendation === 'clinical-review';
  return <section className={`pf-card pf-result ${caution ? 'pf-result-caution' : ''}`} data-stage="result" data-rec={value.recommendation}>
    <span className="pf-result-symbol" aria-hidden="true">{value.completed ? '✓' : 'Ⅱ'}</span><h2>{value.completed ? 'Tu respuesta está preparada' : 'Tu observación está preparada'}</h2>
    <p>{value.recommendation === 'clinical-review' ? 'Las molestias coinciden con señales previas. Detén la práctica y busca valoración profesional.' : value.recommendation === 'relax' ? 'No fuerces una sensación de relajación. Descansa y busca orientación si la dificultad o la molestia persiste.' : 'Puedes seguir observando a tu ritmo, sin exigirte una sensación concreta ni añadir fuerza.'}</p>
    <p className="pf-small">{value.completed && context?.origin === 'dailyPlan' ? 'Vuelve a Hoy para guardar y confirmar esta actividad en tu ruta.' : !value.completed ? 'Vuelve a tu programa para guardar la observación. Esta interrupción no completa una actividad de tu ruta.' : 'Vuelve a tu programa para guardar. Este registro no completa por sí solo un día de tu ruta.'}</p>
    <div className="pf-ctrls"><button type="button" className="pf-btn pf-btn-gold" onClick={onReturn}>{returnLabel}</button>{caution ? <button type="button" className="pf-btn pf-btn-ghost" onClick={onSafety}>Ver cuándo consultar</button> : <button type="button" className="pf-btn pf-btn-ghost" onClick={again}>Volver a la guía</button>}</div>
  </section>;
}

function validStep(value: number) { return Number.isInteger(value) && value >= 0 && value < SCREENS.length ? value : 0; }
function sameResult(a: StoredResult, b: StoredResult) { return a.at === b.at && a.day === b.day && a.activityId === b.activityId && a.intent === b.intent && JSON.stringify(a) === JSON.stringify(b); }

export function PelvicLab() {
  const context = useHostContext(), scope = contextKey(context), restriction = context?.restriction ?? 'review';
  const daily = context?.origin === 'dailyPlan';
  const [step, setStep] = useState(() => daily ? 3 : validStep(load(K.step, 0)));
  const [origin, setOrigin] = useState<Origin>(() => daily ? 'dailyPlan' : 'library');
  const [flags, setFlags] = useState<number[]>([]), [overload, setOverload] = useState<number[]>([]);
  const [results, setResults] = useState<StoredResult[]>([]), [checkins, setCheckins] = useState<Checkin[]>([]);
  const [mapState, setMapState] = useState<FloorState>('rest'), [awareness, setAwareness] = useState<string | null>(null), [anchor, setAnchor] = useState<string | null>(null);
  const [relaxObservation, setRelaxObservation] = useState<string | null>(null);
  const [tension, setTension] = useState<number | null>(null), [release, setRelease] = useState(''), [notice, setNotice] = useState('');
  const [wide, setWide] = useState<WideView | null>(null);
  const pendingResult = useRef<{ signature: string; value: StoredResult } | null>(null);
  const mainRef = useRef<HTMLElement>(null), wideRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    stopAudio(); setSequenceActive(false); setWide(null); setNotice(''); pendingResult.current = null;
    setFlags(load(K.flags, [])); setOverload(load(K.overload, [])); setResults(load(K.results, [])); setCheckins(load(K.checkins, []));
    setOrigin(daily ? 'dailyPlan' : 'library'); setStep(daily ? 3 : validStep(load(K.step, 0)));
    setTension(null); setRelease(''); setAwareness(null); setAnchor(null); setRelaxObservation(null);
  }, [scope]);
  useEffect(() => {
    const halt = () => { stopAudio(); setSequenceActive(false); }, hide = () => { if (document.hidden) halt(); };
    window.addEventListener('pagehide', halt); document.addEventListener('visibilitychange', hide);
    return () => { halt(); window.removeEventListener('pagehide', halt); document.removeEventListener('visibilitychange', hide); };
  }, []);
  useEffect(() => { if (restriction === 'review') { stopAudio(); setSequenceActive(false); } }, [restriction]);
  useEffect(() => { if (wide && wideRef.current && !wideRef.current.open) wideRef.current.showModal(); }, [wide]);
  const scr = SCREENS[step] ?? SCREENS[0]!;
  const go = (next: number) => {
    stopAudio(); setSequenceActive(false); setWide(null); setNotice('');
    const value = validStep(next); setStep(value); save(K.step, value); save(K.origin, origin);
    window.scrollTo({ top: 0 }); mainRef.current?.focus();
  };
  const leave = () => { window.dispatchEvent(new Event('spm:pelvic-pause')); stopAudio(); setSequenceActive(false); if (host) void host.close(); else go(0); };
  const returnLabel = daily ? 'Volver a Hoy' : 'Volver a mi programa';
  const saveField = <T,>(key: string, value: T, update: (v: T) => void) => {
    if (!host || contextKey(readContext()) !== scope || !save(key, value)) { setNotice('No se pudo guardar este cambio. Conserva esta pantalla y vuelve a intentarlo.'); return; }
    update(value); setNotice('');
  };
  const onResult = (value: PracticeResult, startedContext: HostContext | null) => {
    const fresh = readContext();
    if (!host || !startedContext || !fresh || fresh.restriction === 'review' || contextKey(startedContext) !== scope || contextKey(fresh) !== scope) return false;
    const signature = JSON.stringify([scope, value]);
    let stored = pendingResult.current?.signature === signature ? pendingResult.current.value : null;
    if (!stored) {
      stored = { ...value, at: new Date().toISOString(), origin, ...(Number.isInteger(startedContext.day) ? { day: startedContext.day } : {}), ...(startedContext.intent ? { intent: startedContext.intent } : {}), ...(typeof startedContext.activityId === 'string' ? { activityId: startedContext.activityId } : {}) };
      pendingResult.current = { signature, value: stored };
    }
    const prior = load<StoredResult[]>(K.results, []), next = prior.some(item => sameResult(item, stored!)) ? prior : [...prior, stored].slice(-60);
    if (!save(K.results, next)) return false;
    if (daily && !save(K.daily, stored)) return false;
    if (daily && stored.completed && host.onResult?.(stored) !== true) return false;
    setResults(next); pendingResult.current = null; return true;
  };
  const flow = () => restriction === 'review' ? <section className="pf-alert" data-practice-blocked="review"><h2>Tu práctica está en pausa</h2><p>La información de seguridad de tu programa necesita revisión. Puedes mirar la anatomía y escuchar las explicaciones.</p><button type="button" className="pf-btn pf-btn-ghost" onClick={() => go(14)}>Ver cuándo consultar</button></section> :
    <PracticeFlow key={`${scope}:${step}`} context={context} onResult={onResult} flags={flags.length > 0 || overload.length > 0} priorDiscomfort={results.slice(-3).some(r => r.discomfort)} onReturn={leave} returnLabel={returnLabel} onSafety={() => go(14)} />;
  const startButton = <button type="button" className="pf-btn pf-btn-gold pf-full" onClick={() => go(3)}>Abrir mi práctica diaria</button>;
  const toggle = (values: number[], i: number) => values.includes(i) ? values.filter(x => x !== i) : [...values, i];
  const observationOptions = [
    { value: 'support', label: 'Noto el apoyo del cuerpo', text: 'Puedes quedarte con ese contacto, sin buscar otra sensación.' },
    { value: 'tension', label: 'Noto tensión o esfuerzo', text: 'Observa si puedes reducir el esfuerzo con comodidad. No empujes.' },
    { value: 'unclear', label: 'No identifico una sensación clara', text: 'Puedes usar la imagen como referencia. No necesitas forzar para sentir algo.' },
  ];

  const body = (() => {
    switch (scr.id) {
      case 'welcome': return <>
        <PathSteps current={0} /><div className="pf-practice-entry"><Anatomy state="rest" label="Empieza por observar" onWide={() => setWide({ state: 'rest', label: 'Base de la pelvis' })} /><section className="pf-card pf-preparation"><h2>Tu objetivo de hoy</h2><p>Percibir la zona, respirar con comodidad y soltar sin forzar.</p>{startButton}<button type="button" className="pf-btn pf-btn-ghost pf-full" onClick={() => go(11)}>Explorar la biblioteca</button></section></div>
        <details className="pf-details"><summary>Qué encontrarás aquí</summary><p>Conciencia, relajación y coordinación respiratoria. Las sesiones de contracción, cuando están indicadas, pertenecen al otro módulo del programa.</p></details>
      </>;
      case 'map': return <>
        <Anatomy state={mapState} label="Toca un estado para observar" onWide={() => setWide({ state: mapState, label: 'Referencia visual' })} />
        <div className="pf-phase-buttons" aria-label="Estados de la zona">{([{ state: 'rest', label: 'Reposo' }, { state: 'breathe', label: 'Respiración' }, { state: 'down', label: 'Liberación' }] as const).map(item => <button type="button" key={item.state} aria-pressed={mapState === item.state} className={mapState === item.state ? 'on' : ''} onClick={() => setMapState(item.state)}>{item.label}</button>)}</div>
        <p className="pf-small pf-visual-note">Observa sin imitar ni empujar. La imagen no mide tu cuerpo.</p>{startButton}
      </>;
      case 'awareness': return <>
        <Anatomy state="rest" label="Base de la pelvis" onWide={() => setWide({ state: 'rest', label: 'Ubica la zona sin contraer' })} />
        <section className="pf-card"><h2>¿Qué puedes percibir ahora?</h2>{observationOptions.map(option => <button type="button" key={option.value} className={`pf-check ${awareness === option.value ? 'on' : ''}`} aria-pressed={awareness === option.value} onClick={() => setAwareness(option.value)}><i aria-hidden="true">{awareness === option.value ? '✓' : ''}</i>{option.label}</button>)}{awareness && <p className="pf-ok" role="status">{observationOptions.find(x => x.value === awareness)?.text}</p>}<p className="pf-small pf-visual-note">Esta observación no es una prueba de contracción ni habilita entrenamiento de fuerza.</p></section>{startButton}
      </>;
      case 'breath': case 'guided': case 'coordination': return flow();
      case 'relax-first': return <>
        <section className="pf-card"><h2>Marca lo que aplique hoy</h2>{RED_FLAGS.map((flag, i) => <button type="button" key={flag} className={`pf-check warn ${flags.includes(i) ? 'on' : ''}`} aria-pressed={flags.includes(i)} onClick={() => saveField(K.flags, toggle(flags, i), setFlags)}><i aria-hidden="true">{flags.includes(i) ? '!' : ''}</i>{flag}</button>)}</section>
        <section className="pf-card"><h2>¿Reconoces que puedes soltar la zona?</h2><p className="pf-small">Observa sin hacer una contracción para comprobarlo.</p><div className="pf-seg">{['Sí', 'No', 'No lo sé'].map(answer => <button type="button" key={answer} aria-pressed={relaxObservation === answer} className={relaxObservation === answer ? 'on' : ''} onClick={() => setRelaxObservation(answer)}>{answer}</button>)}</div>{relaxObservation && <p className="pf-ok" role="status">{relaxObservation === 'Sí' ? 'Conserva la comodidad y no busques hacer más esfuerzo.' : 'No necesitas forzar una sensación. Puedes seguir observando con comodidad y pedir orientación si la dificultad persiste.'}</p>}</section>
        {flags.length > 0 && <p className="pf-alert">No fuerces la práctica. Si hay dolor o síntomas nuevos, busca valoración profesional.</p>}
        <div className="pf-ctrls"><button type="button" className="pf-btn pf-btn-ghost" onClick={() => go(14)}>Revisar cuándo consultar</button><button type="button" className="pf-btn pf-btn-gold" onClick={() => go(3)}>Volver a la guía</button></div>
        <details className="pf-details"><summary>Si no sabes si puedes soltar</summary><p>Puedes indicarlo en tu registro. No hagas una contracción para comprobarlo ni te obligues a notar un cambio.</p></details>
      </>;
      case 'technique': return <>
        <Anatomy state="rest" label="Cuerpo apoyado · sin contraer" />
        <section className="pf-card"><h2>Haz estos ajustes con comodidad</h2><ol className="pf-instructions"><li>Siéntate o recuéstate con apoyo.</li><li>Deja descansar pies, piernas, muslos y glúteos.</li><li>Afloja mandíbula y abdomen sin empujar.</li><li>Respira normalmente. Si algo molesta, cambia de posición o detente.</li></ol>{startButton}</section>
      </>;
      case 'fine-control': return <>
        <fieldset className="pf-card pf-anchor"><legend>Elige un apoyo para tu atención</legend>{[{ id: 'hands', label: 'El contacto de mis manos' }, { id: 'body', label: 'El peso del cuerpo sobre la superficie' }, { id: 'sound', label: 'Un sonido del ambiente' }].map(item => <button type="button" className={`pf-check ${anchor === item.id ? 'on' : ''}`} key={item.id} aria-pressed={anchor === item.id} onClick={() => setAnchor(item.id)}><i aria-hidden="true">{anchor === item.id ? '✓' : ''}</i>{item.label}</button>)}</fieldset>
        {anchor && <p className="pf-ok" role="status">Vuelve a esa referencia cuando te distraigas. No necesitas forzar una sensación.</p>}{flow()}
      </>;
      case 'transfer': return <>
        <section className="pf-card"><h2>Elige un momento cotidiano</h2><div className="pf-options">{['Después de estar sentado', 'Antes de una actividad', 'En un momento de intimidad'].map(label => <details className="pf-details" key={label}><summary>{label}</summary><p>Nota el apoyo del cuerpo y cómo estás respirando. Afloja el esfuerzo que puedas, sin contraer ni empujar.</p></details>)}</div></section>
        <p className="pf-alert">No practiques cortando el chorro de orina.</p>{startButton}
      </>;
      case 'overload': return <>
        <section className="pf-card"><h2>¿Notaste alguna de estas señales?</h2>{OVERLOAD_SIGNS.map((item, i) => <button type="button" className={`pf-check warn ${overload.includes(i) ? 'on' : ''}`} aria-pressed={overload.includes(i)} key={item.t} onClick={() => saveField(K.overload, toggle(overload, i), setOverload)}><i aria-hidden="true">{overload.includes(i) ? '!' : ''}</i><span>{item.t}<small>{item.d}</small></span></button>)}</section>
        {overload.length > 0 ? <p className="pf-alert">Detén la práctica si hay molestias. Si persisten o te preocupan, busca valoración profesional.</p> : <p className="pf-small pf-visual-note">Marca únicamente lo que hayas notado. No hay una respuesta elegida por ti.</p>}
        <button type="button" className="pf-btn pf-btn-gold pf-full" onClick={() => go(14)}>Ver cuándo consultar</button>
      </>;
      case 'library': return <><div className="pf-library-grid">{DAILY_LIBRARY.map(item => <button type="button" className="pf-lib" key={item.id} data-lib-id={item.id} onClick={() => go(item.step)}><span><span className="pf-tag">{item.tag}</span><h2>{item.name}</h2></span><span aria-hidden="true">→</span></button>)}</div><details className="pf-details"><summary>Ver todas las explicaciones</summary><div className="pf-screen-links">{SCREENS.map((screen, i) => <button type="button" key={screen.id} onClick={() => go(i)}>{screen.title}</button>)}</div></details><p className="pf-small pf-visual-note">El entrenamiento de contracciones permanece en su módulo separado.</p></>;
      case 'progression': return <>
        <section className="pf-card"><h2>No tienes que subir de nivel</h2><p>Puedes volver a la misma guía para observar, respirar y soltar. No se añade fuerza ni un calendario nuevo.</p>{startButton}</section>
        <details className="pf-details"><summary>Cómo elegir tu siguiente paso</summary><ol className="pf-instructions"><li>Si la práctica resulta cómoda, puedes volver a ella según tu plan.</li><li>Si cuesta percibir algo, conserva un apoyo sencillo y no fuerces.</li><li>Si hay molestias o dificultad persistente, detente y busca orientación.</li></ol></details>
        <button type="button" className="pf-btn pf-btn-ghost pf-full" onClick={() => go(13)}>Ver mis observaciones</button>
      </>;
      case 'progress': {
        const last = checkins[checkins.length - 1];
        const saveCheckin = () => {
          if (tension === null || !release) return;
          const next = [...load<Checkin[]>(K.checkins, []), { at: new Date().toISOString(), tension, release }].slice(-30);
          if (!host || contextKey(readContext()) !== scope || !save(K.checkins, next)) { setNotice('No se pudo guardar la observación. Tus respuestas siguen aquí para reintentar.'); return; }
          setCheckins(next); setTension(null); setRelease(''); setNotice('Observación preparada. Vuelve a tu programa para guardar; no completa por sí sola una actividad de tu ruta.');
        };
        return <>
          <section className="pf-card"><h2>¿Cuánta tensión notas?</h2><p className="pf-small">0: sin tensión · 10: máxima tensión que percibes</p><div className="pf-rating" aria-label="Nivel de tensión">{Array.from({ length: 11 }, (_, i) => <button type="button" key={i} aria-label={`${i} de 10`} aria-pressed={tension === i} className={tension === i ? 'on' : ''} onClick={() => setTension(i)}>{i}</button>)}</div>
            <fieldset className="pf-yn"><legend>¿Qué tan fácil fue soltar?</legend><div className="pf-seg">{['Fácil', 'Regular', 'Difícil'].map(value => <button type="button" key={value} aria-pressed={release === value} className={release === value ? 'on' : ''} onClick={() => setRelease(value)}>{value}</button>)}</div></fieldset><button type="button" className="pf-btn pf-btn-gold pf-full" disabled={tension === null || !release} onClick={saveCheckin}>Guardar observación</button>
          </section>
          {last && (last.release === 'Difícil' || last.tension >= 7) && <p className="pf-alert">Registraste tensión alta o dificultad para soltar. No fuerces la práctica y considera una valoración profesional.</p>}
          <details className="pf-details"><summary>Mis registros anteriores ({results.length})</summary>{results.length ? <ul className="pf-history" data-results>{results.slice(-8).reverse().map((record, i) => <li key={`${record.at}:${i}`}><b>{PRACTICES[record.practiceId]?.name ?? 'Práctica registrada'}</b><p>{record.completed ? 'Realizada' : 'Interrumpida'}{record.day ? ` · Día ${record.day}` : ''} · {new Date(record.at).toLocaleDateString('es')}</p><small>{record.intent === 'daily-relax' && record.recommendation === 'repeat' ? 'Observación y práctica a tu ritmo' : REC_LABEL[record.recommendation]}</small></li>)}</ul> : <p>Todavía no hay resultados registrados.</p>}</details>
          {checkins.length > 0 && <details className="pf-details"><summary>Mis observaciones ({checkins.length})</summary><ul className="pf-history">{checkins.slice(-8).reverse().map((record, i) => <li key={`${record.at}:${i}`}><b>Tensión {record.tension}/10 · Soltar: {record.release}</b><p>{new Date(record.at).toLocaleDateString('es')}</p></li>)}</ul></details>}
          <p className="pf-small pf-visual-note">Tu registro se guarda en el programa de tu cuenta SPM.</p>
        </>;
      }
      case 'safety': return <>
        <section className="pf-alert pf-urgent"><h2>Atención médica inmediata</h2><p>{URGENT}</p></section>
        <section className="pf-card"><h2>Detén la práctica y busca valoración</h2><ul className="pf-safety-list">{ALARM_SIGNS.map(sign => <li key={sign}>{sign}</li>)}</ul></section>
        <details className="pf-details"><summary>Otros motivos para pedir orientación</summary><ul className="pf-safety-list">{REEVAL_REASONS.map(reason => <li key={reason}>{reason}</li>)}</ul><p>Puede orientarte urología, fisioterapia de piso pélvico u otro profesional de salud según tu situación.</p></details>
        <p className="pf-small pf-visual-note">El laboratorio es educativo y no sustituye una valoración clínica.</p>
      </>;
      case 'close': return <>
        <section className="pf-card"><h2>¿Qué quieres seguir observando?</h2><ul className="pf-instructions"><li>El apoyo y la comodidad del cuerpo.</li><li>Cómo respiras sin retener el aire.</li><li>La tensión que aparece y qué ocurre al soltar.</li></ul><p className="pf-small">No necesitas dominarlo ni sentir un cambio inmediato.</p></section>
        <div className="pf-ctrls"><button type="button" className="pf-btn pf-btn-gold" onClick={leave}>{returnLabel}</button><button type="button" className="pf-btn pf-btn-ghost" onClick={() => go(11)}>Repasar una guía</button></div>
      </>;
      default: return null;
    }
  })();

  return <div className="pf pf-action-lab" data-lab-intent={context?.intent ?? 'library'}>
    <header className="pf-top"><div className="pf-top-in"><button type="button" className="pf-brand" onClick={() => go(0)}><span className="pf-mark">SPM</span><span><b>Pelvic Floor Lab</b><small>CONCIENCIA Y RELAJACIÓN</small></span></button><span className="pf-count">{daily ? `DÍA ${context?.day}` : 'TU ESPACIO DE PRÁCTICA'}</span></div></header>
    <main className="pf-main" ref={mainRef} tabIndex={-1} key={scope} data-screen-id={scr.id} data-screen-index={step}>
      <div className="pf-screen-heading"><span className="pf-kicker">{scr.kicker}</span><h1>{scr.title}</h1><p className="pf-lead">{scr.lead}</p></div>
      <Trainer text={scr.trainer} audioId={scr.audioId} />
      {notice && <p className="pf-alert" role="status">{notice}</p>}{body}
      {!['breath', 'guided', 'coordination', 'fine-control', 'welcome'].includes(scr.id) && <details className="pf-details"><summary>Recordar los pasos</summary><ol className="pf-instructions">{scr.steps.map(item => <li key={item}>{item}</li>)}</ol></details>}
    </main>
    <nav className="pf-nav" aria-label="Navegación del laboratorio"><div className="pf-nav-in"><button type="button" className="pf-btn pf-btn-ghost" onClick={leave}>{returnLabel}</button><button type="button" className="pf-btn pf-btn-ghost" onClick={() => go(step === 11 ? 3 : 11)}>{step === 11 ? 'Mi práctica' : 'Biblioteca'}</button></div></nav>
    {wide && <dialog className="pf-wide" ref={wideRef} aria-label="Vista anatómica ampliada" onCancel={() => setWide(null)} onClose={() => setWide(null)}><Anatomy state={wide.state} label={wide.label} /><div className="pf-side"><h2>Observa la zona</h2><p>Una referencia visual, sin contraer ni empujar.</p><button type="button" className="pf-btn pf-btn-gold pf-full" onClick={() => setWide(null)}>Cerrar imagen</button></div></dialog>}
  </div>;
}
