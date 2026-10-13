import { useEffect, useRef, useState } from 'react';
import poster from '@/assets/breath-demo-poster.jpg';
import finalVideo from '@/assets/SPM_Respiracion_Lenny_Audio_Corregido.mp4.asset.json';
import finalPoster from '@/assets/spm-final-demo-poster.jpg.asset.json';
import { claimPlayback, registerPlayback } from '@/lib/breath-playback';

export const BREATH_VIDEOS = {
  final: finalVideo.url,
  guided: 'https://jogirmziqjlsttbbarcx.supabase.co/storage/v1/object/public/spm-media/videos/breathing-guided.mp4',
  regulation: 'https://jogirmziqjlsttbbarcx.supabase.co/storage/v1/object/public/spm-media/videos/anxiety-regulation.mp4',
};

const FINAL_TRANSCRIPT = 'La respiración diafragmática es una técnica fundamental para reducir la tensión, regular la activación corporal y mejorar la conciencia y el control de tu cuerpo. Pon una mano en el pecho y otra en el abdomen. Inhala lentamente. Exhala lentamente. Nunca fuerces el aire. Respira normal.';

export function DemoVideo({ kind = 'final' }: { kind?: keyof typeof BREATH_VIDEOS }) {
  const video = useRef<HTMLVideoElement>(null);
  const owner = useRef({});
  const [failed, setFailed] = useState(false);
  const title = kind === 'final' ? 'Respiración diafragmática · demostración SPM con Lenny' : kind === 'guided' ? 'Respiración diafragmática guiada' : 'Respiración para regulación de ansiedad';
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
      <video ref={video} src={BREATH_VIDEOS[kind]} poster={kind === 'final' ? finalPoster.url : kind === 'guided' ? poster : undefined}
        className={kind === 'final' ? '!aspect-[512/910] max-h-[65vh]' : undefined}
        aria-label={title} playsInline preload="metadata" controls
        onPlay={() => claimPlayback(owner.current)} onError={() => setFailed(true)} />
      {failed && <p className="bl-video-error" role="status">No se pudo cargar el video. Inténtalo de nuevo más tarde.</p>}
      <figcaption>{kind === 'guided' ? 'Demostración real del entrenador · usa pantalla completa para verla en horizontal' : title}</figcaption>
      {kind === 'final' && <details className="px-4 pb-4 text-sm text-muted-foreground"><summary className="min-h-11 cursor-pointer content-center text-spm-gold">Transcripción del video</summary><p>{FINAL_TRANSCRIPT}</p></details>}
    </figure>
  );
}
