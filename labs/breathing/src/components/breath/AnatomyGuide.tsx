import { useEffect, useRef, useState } from 'react';
import source from '@/assets/respiracion-anatomica.mp4.asset.json';
import compatible from '@/assets/respiracion-anatomica.webm.asset.json';
import poster from '@/assets/anatomy-poster.jpg.asset.json';
import { anatomyTime } from '@/lib/breath-anatomy';
import type { Phase } from '@/lib/breath-timing';

// Keep the visual beside the timer even if loading is slow. H.264 is preferred on iOS.
export function AnatomyGuide({ phase, progress, active }: { phase: Phase; progress: number; active: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [format, setFormat] = useState<'mp4'|'webm'>('mp4');
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [allowMotion, setAllowMotion] = useState(false);
  const staticMode = reduced && !allowMotion;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(media.matches);
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    const element = video.current;
    if (!element || !ready || staticMode || document.hidden || element.seeking) return;
    element.pause();
    const target = active ? anatomyTime(phase, progress) : .001;
    if(Math.abs(element.currentTime-target)>.035)element.currentTime=target;
  }, [phase, progress, active, ready, staticMode]);
  useEffect(() => {
    const element = video.current;if(!element)return;
    // The user's start gesture also primes inline decoding on mobile Safari.
    const prime=()=>{if(!staticMode&&!error)element.play()?.then(()=>element.pause()).catch(()=>{});};
    const pause=()=>element.pause();
    window.addEventListener('spm:breath-start',prime);window.addEventListener('pagehide',pause);
    return()=>{pause();window.removeEventListener('spm:breath-start',prime);window.removeEventListener('pagehide',pause);};
  }, [attempt,format,staticMode,error]);
  const retry=()=>{setError(false);setReady(false);setFormat('mp4');setAttempt(n=>n+1);};
  return <figure className="bl-anatomy" data-visual-state={error?'error':staticMode?'static':ready?'ready':'loading'}>
    {staticMode || error ? <img src={poster.url} alt="Diafragma y abdomen en reposo" /> : <video key={`${format}-${attempt}`} ref={video} src={format==='mp4'?source.url:compatible.url} muted playsInline preload="auto" poster={poster.url} aria-label="Guía anatómica sincronizada" onLoadedMetadata={()=>setReady(true)} onError={()=>{setReady(false);if(format==='mp4')setFormat('webm');else setError(true);}} />}
    <figcaption>Guía visual · diafragma y abdomen</figcaption>
    {staticMode && <button type="button" className="bl-link" onClick={()=>setAllowMotion(true)}>Activar video de guía</button>}
    {error && <div className="bl-anatomy-status" role="status">No se pudo cargar el video. <button type="button" className="bl-link" onClick={retry}>Reintentar video</button></div>}
  </figure>;
}
