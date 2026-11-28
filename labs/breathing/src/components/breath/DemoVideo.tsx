import { useEffect, useRef, useState } from 'react';
import poster from '@/assets/breath-demo-poster.jpg';
import finalVideo from '@/assets/SPM_Respiracion_Lenny_Audio_Corregido.mp4.asset.json';
import { FinalDeviceDemo } from './FinalDeviceDemo';
import { claimPlayback, registerPlayback } from '@/lib/breath-playback';

export const BREATH_VIDEOS = {
  final: finalVideo.url,
  guided: 'https://jogirmziqjlsttbbarcx.supabase.co/storage/v1/object/public/spm-media/videos/breathing-guided.mp4',
  regulation: 'https://jogirmziqjlsttbbarcx.supabase.co/storage/v1/object/public/spm-media/videos/anxiety-regulation.mp4',
};


export function DemoVideo({ kind = 'final' }: { kind?: keyof typeof BREATH_VIDEOS }) {
 return kind==='final'?<FinalDeviceDemo/>:<RecordedDemo kind={kind}/>;
}
function RecordedDemo({kind}:{kind:'guided'|'regulation'}) {
  const video = useRef<HTMLVideoElement>(null);
  const owner = useRef({});
  const [failed, setFailed] = useState(false);
  const title = kind === 'guided' ? 'Respiración diafragmática guiada' : 'Respiración para regulación de ansiedad';
  useEffect(() => {
    const element = video.current;
    const pause = () => element?.pause();
    const unregister = registerPlayback(owner.current, pause);
    const visibility = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', pause);
    return () => {
      pause(); unregister();
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', pause);
    };
  }, []);
  return (
    <figure className="bl-video">
      <video ref={video} src={BREATH_VIDEOS[kind]} poster={kind === 'guided' ? poster : undefined}
        aria-label={title} playsInline preload="metadata" controls
        onPlay={() => claimPlayback(owner.current)} onError={() => setFailed(true)} />
      {failed && <p className="bl-video-error" role="status">No se pudo cargar el video. Inténtalo de nuevo más tarde.</p>}
      <figcaption>{kind === 'guided' ? 'Demostración real del entrenador · usa pantalla completa para verla en horizontal' : title}</figcaption>
    </figure>
  );
}
