import { useEffect, useRef, useState } from 'react';
export function DoctorDesireVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { const video=ref.current; const pause=()=>video?.pause(); const hidden=()=>{if(document.hidden)pause();}; document.addEventListener('visibilitychange',hidden); return ()=>{pause();document.removeEventListener('visibilitychange',hidden);}; }, []);
  return <details className="dz-card dz-doctor-video" onToggle={e=>{if(!e.currentTarget.open)ref.current?.pause();}}><summary>Doctor SPM · Comprende tu deseo</summary><p>Conoce los factores que pueden influir en el deseo sexual.</p><video ref={ref} controls playsInline preload="metadata" aria-label="Doctor SPM sobre el bajo deseo" src="../assets/videos/dr-spm-low-desire.mp4" onError={()=>setFailed(true)} />{failed && <p role="status">No se pudo cargar el video. Vuelve a abrirlo cuando tengas conexión.</p>}</details>;
}
