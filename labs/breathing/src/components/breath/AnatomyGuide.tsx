import { useEffect, useRef, useState } from 'react';
import source from '@/assets/respiracion-anatomica.mp4.asset.json';
import compatible from '@/assets/respiracion-anatomica.webm.asset.json';
import poster from '@/assets/anatomy-poster.jpg.asset.json';
import { anatomyTime } from '@/lib/breath-anatomy';
import type { Phase } from '@/lib/breath-timing';

export function AnatomyGuide({ phase, progress, active, onFailure }: { phase: Phase; progress: number; active: boolean; onFailure: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(media.matches);
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    const element = video.current;
    if (!element || !ready || reduced || document.hidden) return;
    element.pause();
    if (!element.seeking) element.currentTime = active ? anatomyTime(phase, progress) : 0;
  }, [phase, progress, active, ready, reduced]);
  useEffect(() => {
    const element = video.current;
    if (!element || !ready || reduced) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const seeking = () => { clearTimeout(timeout); timeout = setTimeout(onFailure, 1500); };
    const seeked = () => clearTimeout(timeout);
    element.addEventListener('seeking', seeking); element.addEventListener('seeked', seeked);
    return () => { element.pause(); clearTimeout(timeout); element.removeEventListener('seeking', seeking); element.removeEventListener('seeked', seeked); };
  }, [ready, reduced, onFailure]);
  return <figure className="bl-anatomy">
    {reduced ? <img src={poster.url} alt="Diafragma y abdomen en reposo" /> : <video ref={video} muted playsInline preload="auto" poster={poster.url} aria-label="Guía anatómica sincronizada" onLoadedData={() => setReady(true)} onError={onFailure}>
      <source src={compatible.url} type="video/webm" /><source src={source.url} type="video/mp4" />
    </video>}
    <figcaption>Diafragma y abdomen{reduced ? ' · imagen fija' : ''}</figcaption>
  </figure>;
}
