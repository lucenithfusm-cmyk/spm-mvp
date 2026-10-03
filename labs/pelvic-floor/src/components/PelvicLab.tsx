import { useCallback, useEffect, useRef, useState } from 'react';
import { host, load, save, useRestriction } from '@/lib/pf-host';
import { setSequenceActive, useSequenceActive, hasAudio, playAudio, pauseAudio, resumeAudio, stopAudio, preloadCues, useAudioState } from '@/lib/pf-audio';
import anatomy from '@/assets/pelvic-anatomy.jpg';
import trainerImg from '@/assets/spm-trainer.jpg';
import {
  SCREENS, RED_FLAGS, ALARM_SIGNS, REEVAL_REASONS, OVERLOAD_SIGNS, LIBRARY, PRACTICES, STAGES, ROUTES, REC_LABEL,
  buildPhases, recommend,
  type FloorState, type Phase, type PelvicPracticeConfig, type PracticeId, type PracticeResult, type RouteKey,
} from '@/lib/pf-data';

/* ---------- authenticated SPM program state ---------- */
const K = { step: 'pf-step', origin: 'pf-origin', assign: 'pf-assignment', results: 'pf-results', daily: 'pf-daily-result', flags: 'pf-flags', overload: 'pf-overload', screen: 'pf-screening', checkins: 'pf-checkins', cfg: 'pf-demo-config' };
type Origin = 'lab' | 'library' | 'dailyPlan';
type StoredResult = PracticeResult & { at: string; origin: Origin };
type Checkin = { at: string; tension: number; release: string };
type Screening = { aware: string | null; comp: string[]; releaseOk: 'si' | 'no' | 'nose' | null };
/* ---------- audio: official SPM voice (Lenny) local MP3s by stable ID (see lib/pf-audio) ---------- */
function AudioCue({ id }: { id: string }) {
  const has = hasAudio(id);
  const sequenceActive = useSequenceActive();
  const a = useAudioState();
  const mine = a.id === id;
  const st = mine ? a.status : 'idle';
  const onClick = () => {
    if (st === 'playing' || st === 'loading') pauseAudio();
    else if (st === 'paused') void resumeAudio();
    else void playAudio(id);
  };
  const label = st === 'playing' ? '❚❚' : st === 'loading' ? '…' : '▶';
  const aria = st === 'playing' ? 'Pausar' : st === 'paused' ? 'Continuar' : 'Escuchar al entrenador';
  const text = sequenceActive ? 'Pausa la práctica para escuchar' : !has ? 'Voz oficial pendiente · sigue el texto'
    : st === 'playing' ? 'Pausar' : st === 'paused' ? 'Continuar' : st === 'loading' ? 'Cargando voz…'
    : st === 'error' ? 'No se pudo reproducir · toca para reintentar' : 'Escuchar';
  return (
    <div className="pf-audio" data-audio-id={id} data-audio-status={st}>
      <button disabled={!has || sequenceActive} aria-label={aria} onClick={onClick}>{label}</button>
      <span role={st === 'error' ? 'alert' : undefined}>{text}</span>
    </div>
  );
}

function Trainer({ text, audioId }: { text: string; audioId: string }) {
  return (
    <div className="pf-trainer">
      <img src={trainerImg} alt="Entrenador SPM" loading="lazy" />
      <div>
        <div className="pf-kicker">Entrenador SPM</div>
        <p>{text}</p>
        <AudioCue id={audioId} />
      </div>
    </div>
  );
}

/* ---------- anatomy with localized pelvic-floor animation ---------- */
const STATE_CAP: Record<FloorState, string> = {
  rest: 'Reposo · posición de partida',
  breathe: 'Inhala · el piso pélvico desciende y se abre',
  up: 'Activa · elevación suave hacia adentro y arriba',
  hold: 'Sostén · elevación suave, respirando',
  down: 'Suelta · regreso completo a reposo',
};
function Anatomy({ state, amp = 1, label, onWide }: { state: FloorState; amp?: number | undefined; label?: string | undefined; onWide?: (() => void) | undefined }) {
  return (
    <div>
      <div className="pf-anat" style={{ ['--pf-amp' as string]: amp }}>
        <img src={anatomy} alt="Pelvis masculina con el piso pélvico resaltado" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs>
            <radialGradient id="pfGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--pf-teal)" stopOpacity=".95" />
              <stop offset="100%" stopColor="var(--pf-teal)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <line className={`pf-restline st-${state}`} x1="36" y1="45.5" x2="64" y2="45.5" />
          <g className={`pf-floor st-${state}`}>
            <ellipse cx="50" cy="45.5" rx="13" ry="5.5" fill="url(#pfGlow)" />
            <path d="M39 43 Q50 50 61 43" fill="none" stroke="var(--pf-teal)" strokeWidth=".6" strokeLinecap="round" />
          </g>
          <g className={`pf-dir st-${state}`} fill="none" stroke="var(--pf-gold)" strokeWidth=".6" strokeLinecap="round" strokeLinejoin="round">
            <path className="a-up" d="M50 38.5 V34 M48 36 L50 34 L52 36" />
            <path className="a-down" d="M50 52 V56.5 M48 54.5 L50 56.5 L52 54.5 M44 53 L41.5 55 M56 53 L58.5 55" />
          </g>
        </svg>
        <div className="pf-anat-label">
          {label ? <span className="pf-chip pf-chip-teal">{label}</span> : <span />}
          {onWide && <button className="pf-chip" onClick={onWide}>⤢ Vista amplia</button>}
        </div>
      </div>
      <p className="pf-anat-cap" aria-live="polite">{STATE_CAP[state]}</p>
    </div>
  );
}

/* ---------- phase sequencer with play / pause / reset ---------- */
function useSequence(phases: Phase[], reps: number, onDone?: () => void) {
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(0);
  const [rep, setRep] = useState(1);
  const [left, setLeft] = useState(phases[0]!.sec);
  const [done, setDone] = useState(false);
  const ref = useRef({ idx: 0, rep: 1, left: phases[0]!.sec });
  const doneRef = useRef(onDone); doneRef.current = onDone;

  const reset = useCallback(() => {
    setPlaying(false); setDone(false); stopAudio();
    ref.current = { idx: 0, rep: 1, left: phases[0]!.sec }; setIdx(0); setRep(1); setLeft(phases[0]!.sec);
  }, [phases]);
  useEffect(() => { reset(); }, [reset]);

  const [audioErr, setAudioErr] = useState(false);
  const cue = (id: string) => { void playAudio(id).then((ok) => setAudioErr(hasAudio(id) && !ok)); };

  useEffect(() => {
    if (!playing) return;
    setSequenceActive(true);
    const t = setInterval(() => {
      const s = ref.current; s.left = +(s.left - 0.1).toFixed(1);
      if (s.left <= 0) {
        let ni = s.idx + 1, nr = s.rep;
        if (ni >= phases.length) { ni = 0; nr++; }
        if (nr > reps) { setPlaying(false); setDone(true); setLeft(0); doneRef.current?.(); return; }
        s.idx = ni; s.rep = nr; s.left = phases[ni]!.sec; setIdx(ni); setRep(nr); cue(phases[ni]!.audioId);
      }
      setLeft(s.left);
    }, 100);
    const halt = () => setPlaying(false);
    const onVis = () => { if (document.visibilityState === 'hidden') halt(); };
    window.addEventListener('pagehide', halt);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(t); stopAudio(); setSequenceActive(false);
      window.removeEventListener('pagehide', halt);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [playing, phases, reps]);

  useEffect(() => { preloadCues(); }, []);
  const toggle = () => {
    if (playing) { stopAudio(); setPlaying(false); return; }
    // The first play call runs synchronously inside the user's tap (including iOS).
    setAudioErr(false);
    const currentPhase = phases[ref.current.idx]!;
    if (ref.current.left >= currentPhase.sec) cue(currentPhase.audioId);
    setPlaying(true);
  };
  const phase = phases[idx] ?? phases[0]!;
  const state: FloorState = !playing && !done && idx === 0 && left === phase.sec ? 'rest' : done ? 'rest' : phase.state;
  return { playing, toggle, idx, rep, left, phase, done, reset, state, audioErr, pct: 1 - left / phase.sec };
}

function Sequencer({ phases, reps, amp, onDone, title, onWide }: {
  phases: Phase[]; reps: number; amp?: number; onDone?: () => void; title?: string; onWide?: (s: FloorState, label: string) => void;
}) {
  const s = useSequence(phases, reps, onDone);
  return (
    <div className="pf-card pf-seq">
      {title && <div className="pf-kicker" style={{ marginBottom: 10 }}>{title}</div>}
      <Anatomy state={s.state} amp={amp} label={s.done ? 'Completado' : s.phase.label} onWide={onWide ? () => onWide(s.state, s.phase.label) : undefined} />
      <div className="pf-steps">{phases.map((p, i) => <span key={p.key + i} className={i === s.idx && (s.playing || s.left < p.sec) ? 'on' : ''}>{p.label}</span>)}</div>
      <div className="pf-phase">{s.done ? '¡Bien hecho!' : s.phase.label}</div>
      <div className="pf-timer" aria-live="off">{s.done ? '✓' : Math.ceil(s.left)}</div>
      <div className="pf-ring"><span style={{ width: `${s.done ? 100 : s.pct * 100}%` }} /></div>
      <p className="pf-cue" aria-live="polite" data-audio-id={s.phase.audioId}>{s.done ? 'Suelta del todo y respira normal.' : s.phase.cue}</p>
      {s.audioErr && s.playing && <p className="pf-small" role="alert" style={{ marginBottom: 6 }}>No se pudo reproducir la voz · sigue el texto (el temporizador continúa)</p>}
      <p className="pf-small" style={{ marginBottom: 10 }}>Repetición {Math.min(s.rep, reps)} de {reps}</p>
      <div className="pf-ctrls">
        {s.done ? <button className="pf-btn pf-btn-gold" onClick={s.reset}>↺ Repetir</button> : (
          <button className="pf-btn pf-btn-gold" onClick={s.toggle}>{s.playing ? '❚❚ Pausa' : '▶ Iniciar'}</button>
        )}
        <button className="pf-btn pf-btn-ghost" onClick={s.reset}>↺ Reiniciar</button>
      </div>
    </div>
  );
}

const COMP = [{ k: 'mandibula', l: 'Mandíbula suelta' }, { k: 'abdomen', l: 'Abdomen sin empujar' }, { k: 'gluteos', l: 'Glúteos quietos' }];
function CompCheck({ value, onChange, title = 'Check de compensaciones' }: { value: string[]; onChange: (v: string[]) => void; title?: string }) {
  const all = value.length === COMP.length;
  return (
    <div className="pf-card">
      <h3>{title}</h3>
      <p className="pf-small">Marca lo que sí lograste mantener relajado.</p>
      {COMP.map(c => {
        const on = value.includes(c.k);
        return <button key={c.k} className={`pf-check ${on ? 'on' : ''}`} onClick={() => onChange(on ? value.filter(x => x !== c.k) : [...value, c.k])}><i>{on ? '✓' : ''}</i>{c.l}</button>;
      })}
      {value.length > 0 && !all && <div className="pf-alert"><b>Ajusta:</b> baja la intensidad hasta que las tres zonas queden sueltas.</div>}
      {all && <div className="pf-ok">Sin compensaciones. Así se entrena.</div>}
    </div>
  );
}

function YesNo({ q, value, onChange }: { q: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="pf-yn">
      <p>{q}</p>
      <div className="pf-seg"><button className={value === true ? 'on' : ''} onClick={() => onChange(true)}>Sí</button><button className={value === false ? 'on' : ''} onClick={() => onChange(false)}>No</button></div>
    </div>
  );
}

/* ---------- practice flow: pre-check → guided sequence → post-check → result ---------- */
function PracticeFlow({ id, cfg, blocked, onRelax, onWide, onResult, priorDiscomfort, flags, returnLabel, onReturn }: {
  id: PracticeId; cfg: PelvicPracticeConfig; blocked: boolean; onRelax: () => void; onWide: (s: FloorState, l: string) => void;
  onResult: (r: PracticeResult) => void; priorDiscomfort: boolean; flags: boolean; returnLabel: string | null; onReturn: () => void;
}) {
  const p = PRACTICES[id];
  const [stage, setStage] = useState<'pre' | 'run' | 'post' | 'result'>('pre');
  const [pre, setPre] = useState<string[]>([]);
  const [clean, setClean] = useState<boolean | null>(null);
  const [release, setRelease] = useState<boolean | null>(null);
  const [disc, setDisc] = useState<boolean | null>(null);
  const [tens, setTens] = useState<boolean | null>(null);
  const [res, setRes] = useState<PracticeResult | null>(null);
  const [sequenceComplete, setSequenceComplete] = useState(false);
  const phases = useMemoPhases(cfg);
  const hasContraction = cfg.mode !== 'relax';

  if (blocked) return (
    <div className="pf-alert" data-blocked={id}>
      <b>Fortalecimiento en pausa.</b> Tus respuestas indican empezar por relajación. Esta práctica no está disponible por ahora.
      <div style={{ marginTop: 10 }}><button className="pf-btn pf-btn-teal" onClick={onRelax}>Ir a Percibe · Respira · Suelta →</button></div>
    </div>
  );

  if (stage === 'pre') return (
    <div className="pf-card" data-stage="pre">
      <span className="pf-tag">Antes de empezar</span>
      <h3 style={{ marginTop: 4 }}>3 comprobaciones</h3>
      {COMP.map(c => { const on = pre.includes(c.k); return <button key={c.k} className={`pf-check ${on ? 'on' : ''}`} onClick={() => setPre(on ? pre.filter(x => x !== c.k) : [...pre, c.k])}><i>{on ? '✓' : ''}</i>{c.l}</button>; })}
      <button className="pf-btn pf-btn-gold" style={{ width: '100%', marginTop: 14 }} disabled={pre.length < 3} onClick={() => setStage('run')}>{pre.length < 3 ? `Comprueba las 3 zonas (${pre.length}/3)` : 'Empezar práctica'}</button>
    </div>
  );

  if (stage === 'run') return (<>
    <Sequencer phases={phases} reps={cfg.reps} amp={cfg.intensityLabel === 'moderada' ? 1 : 0.6} title={p.name} onWide={onWide} onDone={() => { setSequenceComplete(true); setStage('post'); }} />
    <button className="pf-back" style={{ margin: '10px auto 0' }} onClick={() => setStage('post')}>Terminar y responder →</button>
  </>);

  if (stage === 'post') {
    const ready = release !== null && disc !== null && tens !== null && (!hasContraction || clean !== null);
    const submit = () => {
      const base = { practiceId: id, completed: sequenceComplete, cleanContraction: hasContraction ? clean : null, fullRelease: !!release, discomfort: !!disc, postTension: !!tens };
      const r: PracticeResult = { ...base, recommendation: recommend(base, { flags, priorDiscomfort }) };
      setRes(r); onResult(r); setStage('result');
    };
    return (
      <div className="pf-card" data-stage="post">
        <span className="pf-tag">Después de la práctica</span>
        <h3 style={{ marginTop: 4 }}>¿Cómo fue?</h3>
        {hasContraction && <YesNo q="¿Contracción limpia, respirando sin apnea?" value={clean} onChange={setClean} />}
        <YesNo q="¿Pudiste soltar completamente?" value={release} onChange={setRelease} />
        <YesNo q="¿Apareció dolor o molestia?" value={disc} onChange={setDisc} />
        <YesNo q="¿Sentiste más tensión al terminar?" value={tens} onChange={setTens} />
        <button className="pf-btn pf-btn-gold" style={{ width: '100%', marginTop: 14 }} disabled={!ready} onClick={submit}>Guardar resultado</button>
      </div>
    );
  }

  const rec = res!.recommendation;
  const msg: Record<string, string> = {
    progress: 'Contracción limpia, respiración continua, relajación completa y sin molestias. Esta etapa puede avanzar.',
    repeat: 'Repetir no significa detener el avance: consolidas la técnica y la relajación completa antes de progresar.',
    relax: 'Hoy toca volver a relajación. Soltar bien es la base para todo lo demás.',
    'clinical-review': 'La molestia se repite o coincide con señales de alerta. Para el fortalecimiento y considera una valoración profesional.',
  };
  return (
    <div className={rec === 'progress' || rec === 'repeat' ? 'pf-ok' : 'pf-alert'} data-stage="result" data-rec={rec}>
      <b>{REC_LABEL[rec]}</b><br />{msg[rec]}
      <div className="pf-ctrls" style={{ marginTop: 12, justifyContent: 'flex-start' }}>
        {returnLabel && <button className="pf-btn pf-btn-gold" onClick={onReturn}>{returnLabel}</button>}
        {(rec === 'relax' || rec === 'clinical-review') && id !== 'percibe' && <button className="pf-btn pf-btn-ghost" onClick={onRelax}>Ir a relajación</button>}
        <button className="pf-btn pf-btn-ghost" onClick={() => { setStage('pre'); setSequenceComplete(false); setPre([]); setClean(null); setRelease(null); setDisc(null); setTens(null); }}>↺ Otra vez</button>
      </div>
    </div>
  );
}
function useMemoPhases(cfg: PelvicPracticeConfig) {
  const key = JSON.stringify(cfg);
  const ref = useRef<{ key: string; phases: Phase[] } | null>(null);
  if (!ref.current || ref.current.key !== key) ref.current = { key, phases: buildPhases(cfg) };
  return ref.current.phases;
}

/* ---------- DEMO dosage editor (Lab only) ---------- */
function DemoConfig({ cfg, onChange }: { cfg: PelvicPracticeConfig; onChange: (c: PelvicPracticeConfig) => void }) {
  const opt = (label: string, key: 'contractionSec' | 'releaseSec' | 'reps', vals: number[], unit: string) => (
    <div style={{ marginTop: 10 }}><p className="pf-small" style={{ marginBottom: 6 }}>{label}</p>
      <div className="pf-seg">{vals.map(v => <button key={v} className={cfg[key] === v ? 'on' : ''} onClick={() => onChange({ ...cfg, [key]: v })}>{v}{unit}</button>)}</div></div>
  );
  return (
    <div className="pf-card">
      <span className="pf-dev">DEMO · ejemplo</span>
      <h3 style={{ marginTop: 6 }}>Dosificación de la práctica</h3>
      <p className="pf-small">SPM asigna estos valores según tu evolución. Aquí son solo un ejemplo para revisión.</p>
      <div style={{ marginTop: 10 }}><p className="pf-small" style={{ marginBottom: 6 }}>Intensidad</p>
        <div className="pf-seg">
          <button className={cfg.intensityLabel === 'suave' ? 'on' : ''} onClick={() => onChange({ ...cfg, intensityLabel: 'suave' })}>Suave</button>
          <button className={cfg.intensityLabel === 'moderada' ? 'on' : ''} onClick={() => onChange({ ...cfg, intensityLabel: 'moderada' })}>Moderada</button>
          <button disabled title="Bloqueada">Máxima</button>
        </div></div>
      {opt('Sostén', 'contractionSec', [3, 5], ' s')}
      {opt('Soltar', 'releaseSec', [6, 8, 10], ' s')}
      {opt('Repeticiones', 'reps', [4, 6, 8], '')}
    </div>
  );
}

function computeRoute(flags: number[], overload: number[], sc: Screening, results: StoredResult[]): RouteKey {
  const last = results[results.length - 1];
  if (flags.length || overload.length || sc.releaseOk === 'no' || (last && (last.recommendation === 'relax' || last.recommendation === 'clinical-review'))) return 'relax';
  if (sc.aware !== 'ok' || sc.comp.length < 3 || sc.releaseOk !== 'si') return 'awareness';
  const good = results.filter(r => r.practiceId !== 'percibe' && r.recommendation === 'progress').length;
  return good >= 2 ? 'mixed' : 'activation';
}

/* ======================= MAIN ======================= */
export function PelvicLab() {
  const restriction = useRestriction();
  const [step, setStep] = useState(0);
  const [origin, setOrigin] = useState<Origin>('lab');
  const [assign, setAssign] = useState<PracticeId | null>(null);
  const [today, setToday] = useState(false);
  const [flags, setFlags] = useState<number[]>([]);
  const [overload, setOverload] = useState<number[]>([]);
  const [results, setResults] = useState<StoredResult[]>([]);
  const [daily, setDaily] = useState<StoredResult | null>(null);
  const [sc, setSc] = useState<Screening>({ aware: null, comp: [], releaseOk: null });
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [cfg, setCfg] = useState<PelvicPracticeConfig>(PRACTICES.contrae.demo);
  const [mapSel, setMapSel] = useState(0);
  const [fineMode, setFineMode] = useState<'rapidas' | 'sostenidas'>('rapidas');
  const [tension, setTension] = useState(3);
  const [release, setRelease] = useState('');
  const [wide, setWide] = useState<{ s: FloorState; l: string } | null>(null);

  useEffect(() => {
    setStep(Math.min(load(K.step, 0), SCREENS.length - 1));
    const o = load<Origin | null>(K.origin, 'lab'); setOrigin(o === 'library' || o === 'dailyPlan' ? o : 'lab');
    setAssign(load<PracticeId | null>(K.assign, null));
    setFlags(load(K.flags, [])); setOverload(load(K.overload, [])); setResults(load(K.results, [])); setDaily(load(K.daily, null));
    setSc(load(K.screen, { aware: null, comp: [], releaseOk: null })); setCheckins(load(K.checkins, []));
    setCfg(PRACTICES.contrae.demo);
  }, []);

  const go = (n: number, o: Origin = 'lab', practice: PracticeId | null = null) => {
    stopAudio(); setWide(null); setToday(false);
    setOrigin(o); save(K.origin, o); setAssign(practice); save(K.assign, practice);
    if (practice === 'rapidas' || practice === 'sostenidas') setFineMode(practice);
    setStep(n); save(K.step, n); window.scrollTo({ top: 0 });
  };
  useEffect(() => {
    const halt = () => stopAudio();
    const onVis = () => { if (document.visibilityState === 'hidden') stopAudio(); };
    window.addEventListener('pagehide', halt); document.addEventListener('visibilitychange', onVis);
    return () => { stopAudio(); window.removeEventListener('pagehide', halt); document.removeEventListener('visibilitychange', onVis); };
  }, []);
  const goToday = () => { stopAudio(); setWide(null); setToday(true); window.scrollTo({ top: 0 }); };
  const upd = <T,>(k: string, set: (v: T) => void) => (v: T) => { set(v); save(k, v); };
  const setScreen = upd<Screening>(K.screen, setSc);
  const toggleIn = (arr: number[], i: number) => (arr.includes(i) ? arr.filter(x => x !== i) : [...arr, i]);
  const route = ['review', 'relax'].includes(restriction) ? 'relax' : computeRoute(flags, overload, sc, results);
  const relaxOnly = route === 'relax';
  const scr = SCREENS[step] ?? SCREENS[0]!;
  const openWide = (s: FloorState, l: string) => setWide({ s, l });
  const libIdx = SCREENS.findIndex(s => s.id === 'library');
  const relaxIdx = PRACTICES.percibe.step;
  const returnLabel = origin === 'dailyPlan' ? '← Volver a Hoy' : origin === 'library' ? '← Volver a Biblioteca' : null;
  const doReturn = () => (origin === 'dailyPlan' ? goToday() : go(libIdx));

  const onResult = (r: PracticeResult) => {
    const sr: StoredResult = { ...r, at: new Date().toISOString(), origin: host?.getContext().origin === 'dailyPlan' ? 'dailyPlan' : origin };
    const n = [...results, sr].slice(-60); setResults(n); save(K.results, n);
    if (sr.origin === 'dailyPlan') { setDaily(sr); save(K.daily, sr); }
  };
  const flow = (id: PracticeId, c: PelvicPracticeConfig = PRACTICES[id].demo) => restriction === 'review' ? (
    <div className="pf-alert">Tus prácticas están en pausa mientras se revisa la información de seguridad de tu programa. Puedes continuar leyendo y escuchando al entrenador.</div>
  ) : (
    <PracticeFlow key={id + JSON.stringify(c) + origin} id={id} cfg={c} blocked={relaxOnly && PRACTICES[id].strengthening}
      onRelax={() => go(relaxIdx, origin === 'dailyPlan' ? 'dailyPlan' : origin, origin === 'dailyPlan' ? 'percibe' : null)}
      onWide={openWide} onResult={onResult} flags={flags.length > 0 || overload.length > 0}
      priorDiscomfort={results.slice(-3).some(r => r.discomfort)} returnLabel={returnLabel} onReturn={doReturn} />
  );

  const RouteCard = () => { const r = ROUTES[route]; return (
    <div className="pf-card pf-route" data-route={route}>
      <span className="pf-tag">Recomendación educativa · no es un diagnóstico</span>
      <h3 style={{ marginTop: 6 }}>Ruta sugerida: {r.name}</h3>
      <p className="pf-small">{r.why}</p>
      <p className="pf-small" style={{ marginTop: 8 }}>Prácticas: {r.practices.map(p => PRACTICES[p].name).join(' · ')}</p>
    </div>); };

  const body = (() => {
    switch (scr.id) {
      case 'welcome': return (<>
        <div className="pf-hero">
          <img src={anatomy} alt="" />
          <div>
            <div className="pf-kicker">SPM · Piso pélvico masculino</div>
            <h1>Siente. <em>Suelta.</em> Luego fortalece.</h1>
            <p className="pf-lead" style={{ margin: 0 }}>{scr.lead}</p>
          </div>
        </div>
        <div className="pf-grid2">
          {[['Sostén', 'Vejiga, recto y órganos pélvicos'], ['Continencia', 'Control urinario e intestinal'], ['Función sexual', 'Erección y eyaculación'], ['Estabilidad', 'Trabaja con respiración y core']].map(([t, d]) => (
            <div className="pf-card" key={t}><h3>{t}</h3><p className="pf-small">{d}</p></div>))}
        </div>
        {!host && <div className="pf-card pf-devcard">
          <span className="pf-dev">DEV / LAB</span>
          <h3 style={{ marginTop: 6 }}>Simular asignación de Hoy</h3>
          <p className="pf-small">Abre una práctica como si SPM la enviara desde “Hoy en SPM”. No es UI clínica definitiva.</p>
          <div className="pf-ctrls" style={{ justifyContent: 'flex-start', marginTop: 10 }}>
            {(['percibe', 'contrae', 'coord', 'rapidas'] as PracticeId[]).map(id => <button key={id} className="pf-chip" data-sim={id} onClick={() => go(PRACTICES[id].step, 'dailyPlan', id)}>{PRACTICES[id].name}</button>)}
          </div>
        </div>}
      </>);
      case 'map': {
        const items = [
          { t: 'Tensión', d: 'Activar con precisión, sin compensar.', s: 'hold' as FloorState },
          { t: 'Relajación', d: 'Soltar por completo tras cada esfuerzo.', s: 'down' as FloorState },
          { t: 'Coordinación', d: 'Sincronizar con respiración y movimiento.', s: 'breathe' as FloorState },
          { t: 'Resistencia', d: 'Sostener suave durante más tiempo.', s: 'up' as FloorState },
        ];
        return (<>
          <Anatomy state={items[mapSel]!.s} label={items[mapSel]!.t} />
          <div className="pf-map">{items.map((it, i) => <button key={it.t} className={mapSel === i ? 'on' : ''} onClick={() => setMapSel(i)}><span className="pf-tag">0{i + 1}</span><b>{it.t}</b><small>{it.d}</small></button>)}</div>
        </>);
      }
      case 'awareness': {
        const opts = [
          { k: 'ok', l: 'Siento un leve movimiento hacia adentro y arriba', r: 'Exacto. Esa es la zona. Pequeño y preciso.', good: true },
          { k: 'glut', l: 'Se aprietan mis glúteos', r: 'Relaja las nalgas y reduce el esfuerzo a la mitad.', good: false },
          { k: 'push', l: 'Siento que empujo hacia abajo', r: 'Es la dirección contraria. Para, respira y prueba con la imagen de retener un gas.', good: false },
          { k: 'none', l: 'No noto nada todavía', r: 'Es normal al inicio. Practica Percibe · Respira · Suelta y vuelve a intentarlo.', good: true },
        ];
        const sel = opts.find(o => o.k === sc.aware);
        return (<>
          <Anatomy state={sc.aware === 'ok' ? 'up' : 'rest'} amp={0.5} label="Zona objetivo" onWide={() => openWide('up', 'Zona objetivo')} />
          <div className="pf-card"><h3>Pruébalo una vez, muy suave</h3><p className="pf-small">¿Qué notaste?</p>
            {opts.map(o => <button key={o.k} className={`pf-check ${sc.aware === o.k ? 'on' : ''} ${!o.good ? 'warn' : ''}`} onClick={() => setScreen({ ...sc, aware: o.k })}><i>{sc.aware === o.k ? '•' : ''}</i>{o.l}</button>)}
            {sel && <div className={sel.good ? 'pf-ok' : 'pf-alert'}>{sel.r}</div>}
          </div>
        </>);
      }
      case 'breath': return flow('percibe');
      case 'relax-first': return (<>
        <div className="pf-card"><h3>Chequeo antes de fortalecer</h3><p className="pf-small">Marca lo que aplique hoy.</p>
          {RED_FLAGS.map((f, i) => <button key={i} className={`pf-check warn ${flags.includes(i) ? 'on' : ''}`} onClick={() => upd<number[]>(K.flags, setFlags)(toggleIn(flags, i))}><i>{flags.includes(i) ? '!' : ''}</i>{f}</button>)}
        </div>
        <div className="pf-card"><h3>¿Puedes soltar por completo después de una contracción suave?</h3>
          <div className="pf-seg" style={{ marginTop: 10 }}>{([['si', 'Sí'], ['no', 'No'], ['nose', 'No lo sé']] as const).map(([k, l]) => <button key={k} className={sc.releaseOk === k ? 'on' : ''} onClick={() => setScreen({ ...sc, releaseOk: k })}>{l}</button>)}</div>
          <ul className="pf-list" style={{ marginTop: 10 }}>
            <li><span>{sc.aware === 'ok' ? '✓' : '·'}</span><span>Localización {sc.aware === 'ok' ? 'confirmada' : <button className="pf-link" onClick={() => go(2)}>pendiente · probar</button>}</span></li>
            <li><span>{sc.comp.length === 3 ? '✓' : '·'}</span><span>Sin compensaciones {sc.comp.length === 3 ? 'confirmado' : <button className="pf-link" onClick={() => go(5)}>pendiente · revisar técnica</button>}</span></li>
          </ul>
        </div>
        <RouteCard />
        {relaxOnly && <div className="pf-alert"><b>Fortalecimiento en pausa.</b> Practica Percibe · Respira · Suelta. Si hay dolor o síntomas nuevos, busca una valoración profesional (por ejemplo, urología o fisioterapia de piso pélvico, según el caso).</div>}
      </>);
      case 'technique': return (<>
        <Anatomy state="up" amp={0.6} label="Eleva y cierra" />
        <div className="pf-card"><ul className="pf-list">
          {['Siéntate cómodo, pies apoyados, respira normal.', 'Eleva suave, como retener un gas.', 'Sin apnea: sigue respirando.', 'Suelta del todo y nota la diferencia.'].map((t, i) => <li key={i}><span>0{i + 1}</span>{t}</li>)}
        </ul><p className="pf-small" style={{ marginTop: 10 }}>Intensidad: suave o moderada. La máxima está bloqueada en este módulo.</p></div>
        <CompCheck value={sc.comp} onChange={v => setScreen({ ...sc, comp: v })} />
      </>);
      case 'guided': return (<>
        {!host && origin === 'lab' && !relaxOnly && <DemoConfig cfg={cfg} onChange={upd<PelvicPracticeConfig>(K.cfg, setCfg)} />}
        {flow('contrae', origin === 'lab' ? cfg : PRACTICES.contrae.demo)}
      </>);
      case 'coordination': return flow('coord');
      case 'fine-control': return (<>
        <div className="pf-seg" style={{ marginBottom: 4 }}>
          <button className={fineMode === 'rapidas' ? 'on' : ''} onClick={() => setFineMode('rapidas')}>Breves</button>
          <button className={fineMode === 'sostenidas' ? 'on' : ''} onClick={() => setFineMode('sostenidas')}>Sostenidas</button>
        </div>
        {flow(fineMode)}
      </>);
      case 'transfer': return (<div>
        {[
          ['Al toser, estornudar o levantar peso', 'Una activación breve y suave justo antes del esfuerzo, y luego soltar.'],
          ['En la intimidad', 'Prioriza soltar. Detectar tensión y relajar suele ayudar más que apretar.'],
          ['Sentado mucho tiempo', 'De vez en cuando, una ronda de Percibe · Respira · Suelta.'],
          ['Tras orinar · práctica funcional opcional', 'Algunos hombres notan menos goteo con una contracción suave al terminar. No es necesaria para todos; si la usas, suelta después.'],
        ].map(([t, d]) => <div className="pf-card" key={t}><h3>{t}</h3><p className="pf-small">{d}</p></div>)}
        <div className="pf-alert"><b>Regla de oro:</b> no mantengas el piso pélvico activo todo el día. El exceso de tensión puede interferir con la coordinación, la comodidad o la función.</div>
      </div>);
      case 'overload': return (<>
        <div className="pf-card"><h3>¿Notaste alguna de estas?</h3>
          {OVERLOAD_SIGNS.map((o, i) => { const on = overload.includes(i); return <button key={i} className={`pf-check warn ${on ? 'on' : ''}`} onClick={() => upd<number[]>(K.overload, setOverload)(toggleIn(overload, i))}><i>{on ? '!' : ''}</i><span><b>{o.t}</b><br /><span className="pf-small">{o.d}</span></span></button>; })}
        </div>
        {overload.length > 0
          ? <div className="pf-alert"><b>Fortalecimiento en pausa.</b> Vuelve a relajación. Si persiste o hay dolor, busca una valoración profesional.</div>
          : <div className="pf-ok">Sin señales de exceso hoy.</div>}
      </>);
      case 'library': return (<div>
        {LIBRARY.map(l => { const locked = relaxOnly && !!l.practice && PRACTICES[l.practice].strengthening;
          return <button key={l.id} className="pf-lib" data-lib-id={l.id} onClick={() => go(l.step, 'library', l.practice ?? null)}>
            <span><span className="pf-tag">{l.tag}{locked ? ' · en pausa' : ''}</span><h3 style={{ marginTop: 4 }}>{l.name}</h3><span className="pf-small">{l.min} min</span></span>
            <span style={{ color: locked ? 'var(--pf-warn)' : 'var(--pf-gold)' }}>{locked ? '⏸' : '→'}</span></button>; })}
      </div>);
      case 'progression': return (<>
        <RouteCard />
        <section className="pf-dosage" aria-label="Repetición y frecuencia">
          <div className="pf-kicker">Repetición intencional</div>
          <h2>¿Por qué esta práctica se repite?</h2>
          <p>El piso pélvico aprende por repetición de buena calidad. La meta no es hacer muchas contracciones: es mejorar conciencia, coordinación, técnica y relajación completa. Repetir una práctica no significa que el programa no avance; significa que estás consolidando una habilidad.</p>
          <div className="pf-dosage-frequency">
            <h3>Frecuencia asignada por SPM</h3>
            <p>SPM decide cuándo programar esta práctica según su relevancia, tu evolución y la carga total de entrenamiento. No hay un calendario independiente.</p>
            <ul className="pf-list">
              <li><span>01</span><span>Cuando es relevante y la carga global lo permite, SPM puede asignar <b>hasta 3 sesiones por semana</b>.</span></li>
              <li><span>02</span><span>Con varios módulos intensivos y mucha carga, SPM puede reducirla a <b>2 sesiones por semana</b> y alternarla con otras intervenciones.</span></li>
              <li><span>03</span><span>Si hay dolor, dificultad marcada para relajar, más tensión o señales clínicas, <b>no se aumenta la frecuencia</b>: se prioriza relajación y valoración profesional según el caso.</span></li>
            </ul>
          </div>
        </section>
        {STAGES.map(s => (
          <div className={`pf-card pf-stage ${ROUTES[route].stage === s.k ? 'on' : ''}`} key={s.k}>
            <span className="pf-tag">Etapa {s.k}{ROUTES[route].stage === s.k ? ' · sugerida ahora' : ''}</span>
            <h3 style={{ marginTop: 4 }}>{s.name}</h3>
            <dl>
              <dt>Objetivo</dt><dd>{s.goal}</dd>
              <dt>Para avanzar</dt><dd>{s.advance}</dd>
              <dt>Repetir si</dt><dd>{s.repeat}</dd>
              <dt>Volver a relajación si</dt><dd>{s.back}</dd>
              {!host && <><dt>Devuelve al motor</dt><dd><code>{s.metric}</code></dd></>}
            </dl>
          </div>))}
      </>);
      case 'progress': {
        const saveCheckin = () => { if (!release) return; const n = [...checkins, { at: new Date().toISOString(), tension, release }].slice(-30); setCheckins(n); save(K.checkins, n); setRelease(''); };
        const last = checkins[checkins.length - 1];
        const count = (rec: string) => results.filter(r => r.recommendation === rec).length;
        return (<>
          <div className="pf-grid2">
            <div className="pf-card"><span className="pf-num">{results.length}</span><p className="pf-small">prácticas registradas</p></div>
            <div className="pf-card"><span className="pf-num">{count('progress')}</span><p className="pf-small">listas para progresar</p></div>
          </div>
          {results.length > 0 && <div className="pf-card" data-results><h3>Últimos resultados</h3>
            <ul className="pf-list">{results.slice(-6).reverse().map((r, i) => <li key={i}><span>{r.recommendation === 'progress' ? '↑' : r.recommendation === 'repeat' ? '↻' : '!'}</span><span><b>{PRACTICES[r.practiceId].name}</b><br /><span className="pf-small">{REC_LABEL[r.recommendation]} · {r.origin === 'dailyPlan' ? 'Hoy' : r.origin === 'library' ? 'Biblioteca' : 'Lab'} · {new Date(r.at).toLocaleDateString('es')}</span></span></li>)}</ul></div>}
          <div className="pf-card"><h3>Tensión pélvica hoy: {tension}/10</h3>
            <input className="pf-range" type="range" min={0} max={10} value={tension} onChange={e => setTension(+e.target.value)} aria-label="Nivel de tensión" />
            <h3 style={{ marginTop: 14 }}>¿Qué tan fácil fue soltar?</h3>
            <div className="pf-seg">{['Fácil', 'Regular', 'Difícil'].map(r => <button key={r} className={release === r ? 'on' : ''} onClick={() => setRelease(r)}>{r}</button>)}</div>
            <button className="pf-btn pf-btn-teal" style={{ marginTop: 14, width: '100%' }} disabled={!release} onClick={saveCheckin}>Guardar check-in</button>
          </div>
          {last && (last.release === 'Difícil' || last.tension >= 7) && <div className="pf-alert"><b>Tensión alta o difícil de soltar.</b> Prioriza relajación y considera una valoración profesional.</div>}
          {checkins.length > 0 && <div className="pf-card"><h3>Últimos check-ins</h3>
            <div style={{ display: 'flex', alignItems: 'end', gap: 6, height: 70, marginTop: 10 }}>{checkins.slice(-10).map((c, i) => <span key={i} title={`${c.tension}/10`} style={{ flex: 1, height: `${10 + c.tension * 6}px`, background: 'var(--pf-teal)', borderRadius: 4, opacity: .4 + i * .06 }} />)}</div></div>}
          <p className="pf-small" style={{ marginTop: 12 }}>Tu registro se guarda en el programa de tu cuenta SPM.</p>
        </>);
      }
      case 'safety': return (<>
        <div className="pf-card"><h3>Señales de alarma · busca valoración profesional</h3><ul className="pf-list">
          {ALARM_SIGNS.map((f, i) => <li key={i}><span>!</span>{f}</li>)}</ul>
          <p className="pf-small" style={{ marginTop: 10 }}>Según el caso, puede orientarte urología, fisioterapia de piso pélvico u otro profesional de salud.</p></div>
        <div className="pf-card"><h3>Motivos para reevaluar (no son alarma)</h3><ul className="pf-list">
          {REEVAL_REASONS.map((f, i) => <li key={i}><span>↻</span>{f}</li>)}</ul></div>
        <div className="pf-card"><p className="pf-small">Este laboratorio es educativo y no sustituye una valoración clínica. No diagnostica ni trata enfermedades.</p></div>
      </>);
      case 'close': return (<>
        <div className="pf-card"><ul className="pf-list">
          {['Percibe antes de actuar', 'Relajación completa tras cada contracción', 'Intensidad suave o moderada, nunca máxima', 'Para ante señales de exceso', 'Consulta si hay dolor o síntomas nuevos'].map((t, i) => <li key={i}><span>✓</span>{t}</li>)}</ul></div>
        <div className="pf-ctrls" style={{ marginTop: 16 }}>
          <button className="pf-btn pf-btn-gold" onClick={() => go(SCREENS.findIndex(s => s.id === 'progression'))}>Ver progresión</button>
          <button className="pf-btn pf-btn-ghost" onClick={() => go(libIdx)}>Biblioteca</button>
        </div>
      </>);
      default: return null;
    }
  })();

  const todayView = (
    <main className="pf-main" data-view="today">
      <span className="pf-dev">DEV / LAB · simulación</span>
      <div className="pf-kicker" style={{ marginTop: 10 }}>Hoy en SPM</div>
      <h1>Tu práctica de hoy</h1>
       <p className="pf-small">Frecuencia asignada por SPM · adaptada a tu evolución y a las demás intervenciones.</p>
      <div className="pf-card">
        <span className="pf-tag">Asignada por el motor</span>
        <h3 style={{ marginTop: 4 }}>{assign ? PRACTICES[assign].name : '—'}</h3>
        {daily && daily.practiceId === assign
          ? <div className={daily.recommendation === 'progress' || daily.recommendation === 'repeat' ? 'pf-ok' : 'pf-alert'}>✓ Completada · <b>{REC_LABEL[daily.recommendation]}</b></div>
          : <p className="pf-small">Pendiente.</p>}
      </div>
      {daily && <div className="pf-card"><h3>Resultado entregado al motor</h3><pre className="pf-json">{JSON.stringify(daily, null, 2)}</pre></div>}
      <div className="pf-ctrls" style={{ marginTop: 16 }}>
        {assign && <button className="pf-btn pf-btn-gold" onClick={() => go(PRACTICES[assign].step, 'dailyPlan', assign)}>Abrir práctica</button>}
        <button className="pf-btn pf-btn-ghost" onClick={() => go(0)}>Volver al Lab</button>
      </div>
    </main>
  );

  return (
    <div className="pf">
      <header className="pf-top">
        <div className="pf-top-in">
          <button className="pf-brand" onClick={() => go(0)}><span className="pf-mark">SPM</span><span style={{ textAlign: 'left' }}><b>Pelvic Floor Lab</b><small>PISO PÉLVICO</small></span></button>
          <span className="pf-count">{today ? 'HOY' : <>{String(step + 1).padStart(2, '0')}<i> / </i>{SCREENS.length}</>}</span>
        </div>
        <div className="pf-bar"><span style={{ width: `${((step + 1) / SCREENS.length) * 100}%` }} /></div>
      </header>
      {today ? todayView : (
        <main className="pf-main" key={step + origin}>
          {returnLabel && <button className="pf-back" onClick={doReturn}>{returnLabel}</button>}
          {scr.id !== 'welcome' && <>
            <div className="pf-kicker">{scr.kicker}</div>
            <h1>{scr.title}</h1>
            <p className="pf-lead">{scr.id === 'progress' ? 'Registra cómo te sientes y consulta tu evolución en SPM.' : scr.lead}</p>
          </>}
          {body}
          <Trainer text={scr.trainer} audioId={scr.audioId} />
        </main>
      )}
      <nav className="pf-nav">
        <div className="pf-nav-in">
          {today ? <button className="pf-btn pf-btn-ghost" onClick={() => go(0)}>Volver al Lab</button>
            : returnLabel
              ? <button className="pf-btn pf-btn-gold" onClick={doReturn}>{returnLabel}</button>
              : <>
                <button className="pf-btn pf-btn-ghost" disabled={step === 0} style={{ opacity: step === 0 ? .4 : 1 }} onClick={() => go(step - 1)}>← Atrás</button>
                <button className="pf-btn pf-btn-gold" disabled={step === SCREENS.length - 1} style={{ opacity: step === SCREENS.length - 1 ? .4 : 1 }} onClick={() => go(step + 1)}>{step === 0 ? 'Comenzar' : 'Siguiente'} →</button>
              </>}
        </div>
      </nav>
      {wide && (
        <div className="pf-wide" role="dialog" aria-label="Vista anatómica amplia">
          <Anatomy state={wide.s} amp={0.8} label={wide.l} />
          <div className="pf-side">
            <div className="pf-kicker">Vista amplia</div>
            <p className="pf-small" style={{ margin: '8px 0 14px' }}>Gira el teléfono en horizontal para ver mejor la zona del piso pélvico.</p>
            <button className="pf-btn pf-btn-gold" style={{ width: '100%' }} onClick={() => setWide(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
