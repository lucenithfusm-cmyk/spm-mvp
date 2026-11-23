import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { Pause, Play } from 'lucide-react';
import chestImage from '@/assets/respiracion-toracica-premium.jpg.asset.json';
import diaphragmImage from '@/assets/respiracion-diafragmatica-premium.jpg.asset.json';
import './breath-pattern-guide.css';

export type BreathPatternMode = 'chest' | 'diaphragm';
export type BreathPatternGuideProps = {
  mode: BreathPatternMode;
  /** Start/restart on each positive counter change after mount, including the same mode. */
  activationKey?: number;
  /** Request one animation once the loaded image is half visible. Blocked requests are discarded. */
  autoPlay?: boolean;
  /** Pause while a parent route or safety panel hides the guide; never auto-resume. */
  suspended?: boolean;
  /** Omit for internal controls; otherwise pair with onRunningChange. */
  running?: boolean;
  onRunningChange?: (running: boolean) => void;
  /** Without controls, each activation is one brief visual cycle and stops automatically. */
  showControls?: boolean;
  className?: string;
};

const ART = {
  chest: {
    src: chestImage.url,
    title: 'Pecho y hombros',
    alt: 'Ilustración de un torso masculino con el pecho y los hombros resaltados en dorado.',
    cue: 'Observa la zona del pecho.',
    centerY: 265, radiusX: 350, radiusY: 230,
  },
  diaphragm: {
    src: diaphragmImage.url,
    title: 'Abdomen y costillas bajas',
    alt: 'Ilustración de un torso masculino con el abdomen y las costillas bajas resaltados en turquesa.',
    cue: 'Observa la zona del abdomen.',
    centerY: 590, radiusX: 270, radiusY: 235,
  },
} as const;

// This bounds the illustrative effect, not a breathing exercise or pacer rhythm.
const BRIEF_VISUAL_MS = 4000;

/** Silent illustration only: no prescribed cadence, audio or patient storage. */
export function BreathPatternGuide({ mode, activationKey, autoPlay = false, suspended = false, running, onRunningChange, showControls = true, className = '' }: BreathPatternGuideProps) {
  const [localRunning, setLocalRunning] = useState(false);
  const [userPaused, setUserPaused] = useState(() => suspended
    || (typeof document !== 'undefined' && document.hidden)
    || (typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
  const [hasStarted, setHasStarted] = useState(!!running);
  const [activeMode, setActiveMode] = useState(mode);
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const change = useRef(onRunningChange);
  change.current = onRunningChange;
  const lastMode = useRef(mode);
  const lastRunning = useRef(running);
  // A request inherited after navigation is consumed on mount, not replayed.
  const lastActivation = useRef(activationKey);
  const mountActivation = useRef(autoPlay);
  const mountCleanup = useRef<(() => void) | null>(null);
  const visual = useRef<HTMLDivElement>(null);
  const latest = useRef({ mode, activationKey, suspended, visible, reduced });
  latest.current = { mode, activationKey, suspended, visible, reduced };
  const uid = `bl-pattern-${useId().replace(/[^a-z0-9_-]/gi, '')}`;
  const art = ART[mode];
  const requested = running ?? localRunning;
  const moving = requested && !userPaused && visible && !reduced && !suspended && activeMode === mode;
  const visualKey = `${mode}:${activationKey ?? 'manual'}`;

  const cancelMountActivation = () => {
    mountActivation.current = false;
    mountCleanup.current?.(); mountCleanup.current = null;
  };
  const pause = () => {
    cancelMountActivation();
    setLocalRunning(false); setUserPaused(true); change.current?.(false);
  };
  const start = () => {
    cancelMountActivation();
    setActiveMode(mode); setUserPaused(false); setLocalRunning(true); setHasStarted(true); change.current?.(true);
  };
  useEffect(() => {
    if (!mountActivation.current) return;
    if (suspended || !visible || document.hidden || reduced) { cancelMountActivation(); return; }
    const element = visual.current;
    // Older browsers and DOM-only test environments keep the immediate fallback.
    if (!element || typeof window.IntersectionObserver !== 'function') { start(); return; }
    const original = element.querySelector('img');
    // IntersectionObserver otherwise counts pixels covered by the sticky route footer.
    const footer = element.closest('.bl-route-shell')?.querySelector('.bl-route-footer');
    const footerHeight = Math.max(0, Math.ceil(footer?.getBoundingClientRect().height ?? 0));
    let inView = false;
    let loaded = !original || (original.complete && original.naturalWidth > 0);
    let disposed = false;
    const attempt = () => {
      if (disposed || !mountActivation.current) return;
      const current = latest.current;
      if (current.suspended || !current.visible || document.hidden || current.reduced
        || current.mode !== mode || current.activationKey !== activationKey) {
        cancelMountActivation(); return;
      }
      if (inView && loaded) start();
    };
    const observer = new window.IntersectionObserver(entries => {
      const entry = entries.find(item => item.target === element);
      if (!entry) return;
      inView = entry.isIntersecting && entry.intersectionRatio >= .5;
      attempt();
    }, { threshold: .5, rootMargin: `0px 0px ${-footerHeight}px 0px` });
    const imageLoaded = () => { loaded = !!original?.naturalWidth; attempt(); };
    const imageFailed = () => cancelMountActivation();
    const cleanup = () => {
      disposed = true; observer.disconnect();
      original?.removeEventListener('load', imageLoaded);
      original?.removeEventListener('error', imageFailed);
    };
    mountCleanup.current = cleanup;
    original?.addEventListener('load', imageLoaded);
    original?.addEventListener('error', imageFailed);
    observer.observe(element);
    return () => {
      cleanup();
      if (mountCleanup.current === cleanup) mountCleanup.current = null;
    };
  }, []);
  useEffect(() => {
    if (!moving || showControls) return;
    const timer = window.setTimeout(pause, BRIEF_VISUAL_MS);
    return () => window.clearTimeout(timer);
  }, [moving, visualKey, showControls]);
  useEffect(() => {
    if (lastRunning.current !== running) {
      lastRunning.current = running;
      if (running === undefined) return;
      if (running && visible && !document.hidden && !reduced && !suspended) {
        setActiveMode(mode); setUserPaused(false); setHasStarted(true);
      } else pause();
    }
  }, [running, visible, reduced, suspended]);
  useEffect(() => {
    if (lastMode.current !== mode) {
      lastMode.current = mode;
      setHasStarted(false); pause();
    }
  }, [mode]);
  useEffect(() => {
    if (lastActivation.current === activationKey) return;
    lastActivation.current = activationKey;
    if (activationKey === undefined || !Number.isFinite(activationKey) || activationKey <= 0) {
      setHasStarted(false); pause(); return;
    }
    // A blocked request is consumed now; returning to the page requires another tap.
    if (suspended || !visible || document.hidden || reduced) { pause(); return; }
    start();
  }, [activationKey, mode, suspended, visible, reduced]);
  useEffect(() => { if (suspended) pause(); }, [suspended]);
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
    if (reduced || !visible || document.hidden || suspended) return;
    start();
  };
  const action = moving ? 'Pausar animación' : hasStarted ? 'Reanudar animación' : 'Activar guía visual';

  return <figure className={`bl-pattern-guide ${className}`.trim()} data-mode={mode} data-running={moving} data-reduced-motion={reduced}
    data-brief={!showControls} style={showControls ? undefined : { '--bl-pattern-cycle': `${BRIEF_VISUAL_MS}ms` } as CSSProperties}>
    <div className="bl-pattern-visual" ref={visual} key={visualKey}>
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
        <div className="bl-pattern-reading" key={visualKey} aria-hidden="true">
          <span className="bl-pattern-inhale">{showControls ? 'Inhala · observa la expansión' : 'Expansión ilustrativa'}</span>
          <span className="bl-pattern-exhale">{showControls ? 'Exhala · observa el regreso' : 'Regreso ilustrativo'}</span>
          <span className="bl-pattern-paused">{art.cue}</span>
        </div>
        {showControls && (activationKey === undefined || hasStarted) && <button type="button" className="bl-pattern-toggle" onClick={toggle} aria-pressed={moving}
          aria-label={`${reduced ? 'Guía visual estática' : action} de ${art.title.toLowerCase()}`} disabled={reduced || suspended}>
          {moving ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {reduced ? 'Vista estática' : action}
        </button>}
      </div>
      <p>Guía visual ilustrativa · respira a tu ritmo</p>
      {reduced && <small>La animación está pausada según tu preferencia de movimiento reducido.</small>}
    </figcaption>
  </figure>;
}
