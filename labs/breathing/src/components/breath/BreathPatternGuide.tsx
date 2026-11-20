import { useEffect, useId, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import chestImage from '@/assets/respiracion-toracica-premium.jpg.asset.json';
import diaphragmImage from '@/assets/respiracion-diafragmatica-premium.jpg.asset.json';
import './breath-pattern-guide.css';

export type BreathPatternMode = 'chest' | 'diaphragm';
export type BreathPatternGuideProps = {
  mode: BreathPatternMode;
  /** Omit for internal controls; otherwise pair with onRunningChange. */
  running?: boolean;
  onRunningChange?: (running: boolean) => void;
  showControls?: boolean;
  className?: string;
};

const ART = {
  chest: {
    src: chestImage.url,
    title: 'Pecho y hombros',
    alt: 'Ilustración de un torso masculino con el pecho y los hombros resaltados en dorado.',
    cue: 'Observa el movimiento en el pecho.',
    centerY: 265, radiusX: 350, radiusY: 230,
  },
  diaphragm: {
    src: diaphragmImage.url,
    title: 'Abdomen y costillas bajas',
    alt: 'Ilustración de un torso masculino con el abdomen y las costillas bajas resaltados en turquesa.',
    cue: 'Observa el movimiento en el abdomen.',
    centerY: 590, radiusX: 270, radiusY: 235,
  },
} as const;

/** Silent illustration only: no timer, prescribed cadence, audio or patient storage. */
export function BreathPatternGuide({ mode, running, onRunningChange, showControls = true, className = '' }: BreathPatternGuideProps) {
  const [localRunning, setLocalRunning] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const change = useRef(onRunningChange);
  change.current = onRunningChange;
  const lastMode = useRef(mode);
  const lastRunning = useRef(running);
  const uid = `bl-pattern-${useId().replace(/[^a-z0-9_-]/gi, '')}`;
  const art = ART[mode];
  const requested = running ?? localRunning;
  const moving = requested && !userPaused && visible && !reduced && lastMode.current === mode;

  const pause = () => {
    setLocalRunning(false); setUserPaused(true); change.current?.(false);
  };
  useEffect(() => {
    if (lastMode.current !== mode) {
      lastMode.current = mode;
      setLocalRunning(false); setUserPaused(true); change.current?.(false);
    }
  }, [mode]);
  useEffect(() => {
    if (lastRunning.current !== running) {
      lastRunning.current = running;
      setUserPaused(false);
    }
  }, [running]);
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const visibility = () => { setVisible(!document.hidden); if (document.hidden) pause(); };
    const preference = () => { setReduced(!!media?.matches); if (media?.matches) pause(); };
    const hide = () => { setVisible(false); pause(); };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', hide);
    window.addEventListener('pageshow', visibility);
    media?.addEventListener('change', preference);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', hide);
      window.removeEventListener('pageshow', visibility);
      media?.removeEventListener('change', preference);
    };
  }, []);

  const toggle = () => {
    if (moving) { pause(); return; }
    if (reduced || !visible) return;
    setUserPaused(false); setLocalRunning(true); change.current?.(true);
  };

  return <figure className={`bl-pattern-guide ${className}`.trim()} data-mode={mode} data-running={moving} data-reduced-motion={reduced}>
    <div className="bl-pattern-visual" key={mode}>
      <img className="bl-pattern-original" src={art.src} alt={art.alt} width={1536} height={1024} loading="lazy" />
      <svg className="bl-pattern-overlay" viewBox="0 0 1536 1024" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id={`${uid}-feather`}>
            <stop offset="0" stopColor="white" />
            <stop offset=".64" stopColor="white" />
            <stop offset="1" stopColor="black" />
          </radialGradient>
          <mask id={`${uid}-zone`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024">
            <ellipse cx="780" cy={art.centerY} rx={art.radiusX} ry={art.radiusY} fill={`url(#${uid}-feather)`} />
          </mask>
          <radialGradient id={`${uid}-glow`}>
            <stop offset="0" stopColor="currentColor" stopOpacity=".5" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g mask={`url(#${uid}-zone)`}>
          <image className="bl-pattern-moving-zone" href={art.src} width="1536" height="1024" />
        </g>
        <ellipse className="bl-pattern-glow" cx="780" cy={art.centerY} rx={art.radiusX * .85} ry={art.radiusY * .8} fill={`url(#${uid}-glow)`} />
        {mode === 'chest' ? <>
          <path className="bl-pattern-outline" d="M 500 250 Q 510 125 665 125 M 880 145 Q 1015 155 1020 295" />
          <g className="bl-pattern-arrows bl-pattern-inhale-arrows">
            <path d="M 580 260 L 580 160 M 552 192 L 580 160 L 608 192" />
            <path d="M 950 290 L 950 190 M 922 222 L 950 190 L 978 222" />
          </g>
          <g className="bl-pattern-arrows bl-pattern-exhale-arrows">
            <path d="M 580 160 L 580 260 M 552 228 L 580 260 L 608 228" />
            <path d="M 950 190 L 950 290 M 922 258 L 950 290 L 978 258" />
          </g>
        </> : <>
          <path className="bl-pattern-outline" d="M 600 470 Q 545 585 600 720 M 920 470 Q 975 585 920 720" />
          <g className="bl-pattern-arrows bl-pattern-inhale-arrows">
            <path d="M 650 580 L 535 580 M 570 552 L 535 580 L 570 608" />
            <path d="M 890 580 L 1005 580 M 970 552 L 1005 580 L 970 608" />
          </g>
          <g className="bl-pattern-arrows bl-pattern-exhale-arrows">
            <path d="M 535 580 L 650 580 M 615 552 L 650 580 L 615 608" />
            <path d="M 1005 580 L 890 580 M 925 552 L 890 580 L 925 608" />
          </g>
        </>}
      </svg>
      <span className="bl-pattern-zone-label">{art.title}</span>
    </div>
    <figcaption className="bl-pattern-caption">
      <div className="bl-pattern-caption-row">
        <div className="bl-pattern-reading" aria-hidden="true">
          <span className="bl-pattern-inhale">Inhala · observa la expansión</span>
          <span className="bl-pattern-exhale">Exhala · observa el regreso</span>
          <span className="bl-pattern-paused">{art.cue}</span>
        </div>
        {showControls && <button type="button" className="bl-pattern-toggle" onClick={toggle} aria-pressed={moving}
          aria-label={moving ? `Pausar movimiento de ${art.title.toLowerCase()}` : `Ver movimiento de ${art.title.toLowerCase()}`} disabled={reduced}>
          {moving ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {reduced ? 'Vista estática' : moving ? 'Pausar movimiento' : 'Ver movimiento'}
        </button>}
      </div>
      <p>Movimiento ilustrativo · respira a tu ritmo</p>
      {reduced && <small>La animación está pausada según tu preferencia de movimiento reducido.</small>}
    </figcaption>
  </figure>;
}
