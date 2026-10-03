import { useEffect, useRef, useState } from 'react';
export function DoctorDesireVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { const video=ref.current; const pause=()=>video?.pause(); const hidden=()=>{if(document.hidden)pause();}; document.addEventListener('visibilitychange',hidden); return ()=>{pause();document.removeEventListener('visibilitychange',hidden);}; }, []);
  return <section className="dz-doctor-video" aria-label="Doctor SPM · Comprende tu deseo"><h3>Doctor SPM · Comprende tu deseo</h3><div className="dz-doctor-video-body"><video ref={ref} controls playsInline preload="metadata" aria-label="Doctor SPM sobre el bajo deseo" src="../assets/videos/dr-spm-low-desire.mp4" onError={()=>setFailed(true)} />{failed && <div className="dz-video-error" role="status"><p>No pudimos cargar el video.</p><button type="button" className="dz-btn ghost" onClick={()=>{setFailed(false);ref.current?.load();}}>Reintentar</button></div>}</div></section>;
}
