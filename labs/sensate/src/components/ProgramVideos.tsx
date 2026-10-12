import { useEffect, useRef } from 'react';
type VideoHost = Window & { SPM_PROGRAM_VIDEOS?: { mount(root: HTMLElement, route: string): () => void } };
export function ProgramVideos({ route }: { route: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    try { return (window.parent as VideoHost).SPM_PROGRAM_VIDEOS?.mount(ref.current, route); }
    catch { return; }
  }, [route]);
  return <div ref={ref} />;
}
