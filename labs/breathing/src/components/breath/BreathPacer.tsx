import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Check, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Pattern } from '@/lib/breath-data';
import { AUDIO_IDS, playAudio, stopAudio } from '@/lib/breath-audio';
import { claimPlayback, registerPlayback } from '@/lib/breath-playback';
import { advancePractice, phaseAt, sessionLength, type Phase } from '@/lib/breath-timing';
import { AnatomyGuide } from './AnatomyGuide';

const LABEL: Record<Phase, string> = { inhale: 'INHALA', hold: 'PAUSA', exhale: 'EXHALA' };
const HINT: Record<Phase, string> = {
  inhale: 'El abdomen se expande suave',
  hold: 'Pausa ligera, sin apretar',
  exhale: 'Suelta lento, abdomen y pelvis blandos',
};
type Props = {
  pattern: Pattern; noHold: boolean; onNoHold?: (v: boolean) => void;
  lockNoHold?: boolean; durationSec?: number; cycles?: number; showBelly?: boolean;
  onFinish?: (seconds: number) => void;
};
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function BreathPacer({ pattern, noHold, onNoHold, lockNoHold, durationSec, cycles = 5, showBelly, onFinish }: Props) {
  const p = noHold || lockNoHold ? { ...pattern, hold: 0 } : pattern;
  const length = p.inhale + p.hold + p.exhale;
  const total = sessionLength(p, durationSec, cycles);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [visual, setVisual] = useState(true);
  const elapsedRef = useRef(0);
  const runningRef = useRef(false);
  const lastPhase = useRef<Phase | null>(null);
  const owner = useRef({});
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const pause = () => { runningRef.current = false; setRunning(false); stopAudio(); };
  const reset = () => {
    pause(); elapsedRef.current = 0; setElapsedMs(0); setDone(false); lastPhase.current = null;
  };
  useEffect(() => {
    runningRef.current = false; elapsedRef.current = 0; lastPhase.current = null;
    setElapsedMs(0); setRunning(false); setDone(false); stopAudio();
  }, [p.inhale, p.hold, p.exhale, total]);

  useEffect(() => {
    const stop = () => { runningRef.current = false; setRunning(false); stopAudio(); };
    const unregister = registerPlayback(owner.current, stop);
    const visibility = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', stop);
    return () => {
      runningRef.current = false; stopAudio(); unregister();
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', stop);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    let previous = performance.now();
    const id = window.setInterval(() => {
      if (!runningRef.current) return;
      if (document.hidden) { runningRef.current = false; setRunning(false); stopAudio(); return; }
      const now = performance.now();
      const delta = now - previous;
      previous = now;
      // A suspended/throttled timer is not a supervised breathing session.
      if (delta > 1500) { runningRef.current = false; setRunning(false); stopAudio(); return; }
      const next = advancePractice(elapsedRef.current, delta, runningRef.current, !document.hidden, total);
      elapsedRef.current = next; setElapsedMs(next);
      if (next >= total * 1000) {
        runningRef.current = false; setRunning(false); setDone(true); stopAudio();
        playAudio(AUDIO_IDS.cue('done'), undefined, owner.current);
        finishRef.current?.(total);
        return;
      }
      const phase = phaseAt(next / 1000, p).phase;
      if (lastPhase.current !== phase) {
        lastPhase.current = phase; playAudio(AUDIO_IDS.cue(phase), undefined, owner.current);
      }
    }, 100);
    return () => clearInterval(id);
  }, [running, total, p.inhale, p.hold, p.exhale]);

  const start = () => {
    if (document.hidden) return;
    claimPlayback(owner.current); stopAudio();
    window.dispatchEvent(new Event('spm:breath-start'));
    const elapsed = done ? 0 : elapsedRef.current;
    if (done) { elapsedRef.current = 0; setElapsedMs(0); setDone(false); }
    runningRef.current = true; setRunning(true);
    lastPhase.current = phaseAt(elapsed / 1000, p).phase;
    playAudio(AUDIO_IDS.cue(lastPhase.current), undefined, owner.current);
  };
  const elapsed = elapsedMs / 1000;
  const started = elapsedMs > 0 || running;
  const cur = phaseAt(Math.min(elapsed, total - .001), p);
  const scale = !started || done ? .62 : cur.scale;
  const phases: Phase[] = p.hold ? ['inhale', 'hold', 'exhale'] : ['inhale', 'exhale'];
  const phaseProgress = done ? 100 : started ? cur.progress * 100 : 0;
  const cycleProgress = done ? 100 : ((elapsed % length) / length) * 100;
  const sessionProgress = (elapsed / total) * 100;
  const style = { '--s': scale, '--t': running ? '.1s' : '0s' } as React.CSSProperties;

  return (
    <div className="bl-pacer" data-phase={done ? 'done' : started ? cur.phase : 'idle'} data-running={running}>
      <div className="bl-pacer-heading"><span><Wind size={15} /> RITMO RESPIRATORIO</span><b>{p.inhale}·{p.hold ? `${p.hold}·` : ''}{p.exhale}</b></div>
      <div className="bl-visual-modes" role="group" aria-label="Indicación visual">
        <Button variant={visual ? 'spmGold' : 'outline'} aria-pressed={visual} onClick={() => setVisual(true)}>Guía visual</Button>
        <Button variant={!visual ? 'spmGold' : 'outline'} aria-pressed={!visual} onClick={() => setVisual(false)}>Círculo</Button>
      </div>
      <div className={`bl-pacer-stage${visual ? ' with-anatomy' : ''}`}>
        <div className="bl-halo-wrap" style={style}>
          <div className="bl-halo-glow" /><div className="bl-halo" />
          <svg className="bl-phase-ring" viewBox="0 0 240 240" role="progressbar" aria-label="Progreso de fase" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(phaseProgress)}>
            <circle className="bl-ring-track" cx="120" cy="120" r="110" />
            <circle className="bl-ring-value" cx="120" cy="120" r="110" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - phaseProgress} />
          </svg>
          <div className="bl-halo-core">
            {done ? <><Check size={30} /><strong>Hecho</strong></> : started ? <><strong>{LABEL[cur.phase]}</strong><span className="bl-count" role="timer" aria-label={`${LABEL[cur.phase]} ${cur.left} segundos`}>{cur.left}</span><span className="bl-sub">segundos</span></> : <><strong>LISTO</strong><span className="bl-count">{p.inhale}</span><span className="bl-sub">{p.inhale}·{p.hold ? `${p.hold}·` : ''}{p.exhale}</span></>}
          </div>
        </div>
        {visual ? <AnatomyGuide phase={cur.phase} progress={cur.progress} active={started && !done} /> : showBelly && <BellyFigure scale={scale} running={running} />}
      </div>
      <p className="bl-hint" aria-live="polite">{done ? 'Respira normal unos segundos antes de levantarte.' : started ? HINT[cur.phase] : 'Pulsa iniciar y sigue el círculo.'}</p>
      <div className="bl-phase-labels">
        {phases.map((phase) => <span key={phase} className={started && !done && cur.phase === phase ? 'on' : ''}><em>{p[phase]}<small>s</small></em>{LABEL[phase]}</span>)}
      </div>
      <div className="bl-session-progress">
        <div className="bl-time"><span>Sesión</span><b>{fmt(elapsed)} <em>/ {fmt(total)}</em></b></div>
        <div className="bl-session-bar" role="progressbar" aria-label="Progreso de sesión" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(sessionProgress)}><span style={{ width: `${sessionProgress}%` }} /></div>
        <div className="bl-time"><span>Ciclo {Math.min(Math.floor(elapsed / length) + 1, total / length)} / {total / length}</span><span>{Math.floor(sessionProgress)}%</span></div>
        <div className="bl-cycle-bar" role="progressbar" aria-label="Progreso de ciclo" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(cycleProgress)}><span style={{ width: `${cycleProgress}%` }} /></div>
      </div>
      <div className="bl-controls">
        <Button variant="spmGold" className="bl-btn gold" onClick={running ? pause : start}>{running ? <Pause size={17} /> : <Play size={17} />}{running ? 'Pausar' : done ? 'Repetir' : started ? 'Reanudar' : 'Iniciar'}</Button>
        <Button variant="outline" className="bl-btn ghost" onClick={reset} disabled={!started && !done}><RotateCcw size={16} /> Reiniciar</Button>
      </div>
      {!running && elapsedMs > 0 && !done && onFinish && <Button variant="link" className="bl-link" onClick={() => { pause(); setDone(true); onFinish(Math.floor(elapsed)); }}>Terminar y registrar</Button>}
      {!lockNoHold && onNoHold && <label className="bl-toggle"><input type="checkbox" checked={noHold} onChange={(e) => onNoHold(e.target.checked)} /><span className="bl-switch" /><span>Sin pausa (4·6) — si las retenciones te marean</span></label>}
    </div>
  );
}
function BellyFigure({ scale, running }: { scale: number; running: boolean }) {
  // Only the abdomen shape moves; torso, chest and head stay still.
  const belly = (scale - 0.62) / 0.38; // 0..1
  return (
    <svg className="bl-belly-fig" viewBox="0 0 120 200" aria-hidden="true">
      <circle cx="58" cy="26" r="15" className="fig-line" />
      <path d="M50 41 L50 50 C38 54 36 62 38 76 L42 112 C42 130 44 150 48 172 L74 172 C76 150 74 132 70 118" className="fig-line" />
      <path d="M66 41 L66 50 C74 53 76 60 74 72" className="fig-line" />
      <circle cx="68" cy="66" r="3" className="fig-chest" />
      <g className="bl-belly" style={{ transform: `scaleX(${1 + belly * 0.32})`, transition: running ? 'transform 1s linear' : 'none' }}>
        <path d="M70 84 C84 90 86 112 70 124" className="fig-abd" />
      </g>
      <text x="72" y="140" className="fig-tag">abdomen</text>
      <text x="76" y="62" className="fig-tag dim">pecho</text>
    </svg>
  );
}
