import { useEffect, useRef, useState } from 'react';
import source from '@/assets/SPM_Respiracion_Lenny_Audio_Corregido.mp4.asset.json';
import poster from '@/assets/spm-final-demo-poster.jpg.asset.json';
import { FINAL_DEMO_SCENES, FINAL_TRANSCRIPT } from '@/lib/final-demo-scenes';
import { claimPlayback, registerPlayback } from '@/lib/breath-playback';

export function FinalDeviceDemo() {
 const root = useRef<HTMLElement>(null), visual = useRef<HTMLVideoElement>(null);
 const owner = useRef({}), generation = useRef(0), active = useRef(false);
 const [index, setIndex] = useState(0), [status, setStatus] = useState('idle'), [message, setMessage] = useState('');
 const [visualPlaying, setVisualPlaying] = useState(false), [failed, setFailed] = useState(false);
 const scene = FINAL_DEMO_SCENES[index];
 function stop() { generation.current++; const owned = active.current; active.current = false; if (owned) window.SPM_VOICE?.cancel(); setStatus('idle'); visual.current?.pause(); setVisualPlaying(false); }
 useEffect(() => {
  const end = (update=true) => { generation.current++; const owned=active.current; active.current=false; if(owned)window.SPM_VOICE?.cancel(); visual.current?.pause(); if(update){setVisualPlaying(false);setStatus('idle');} };
  const release=registerPlayback(owner.current,end), hide=()=>{if(document.hidden)end();};
  document.addEventListener('visibilitychange',hide); const leave=()=>end();window.addEventListener('pagehide',leave);
  return()=>{end(false);release();document.removeEventListener('visibilitychange',hide);window.removeEventListener('pagehide',leave);};
 }, []);
 function listen() {
  const voice=window.SPM_VOICE;
  if(active.current && status==='paused'){voice?.resume();return;}
  if(active.current && (status==='playing'||status==='preparing')){voice?.pause();return;}
  stop(); claimPlayback(owner.current); const token=++generation.current; active.current=true;
  if(!voice){active.current=false;setStatus('error');setMessage('La voz no está disponible. Puedes leer la escena y avanzar a tu ritmo.');return;}
  voice.listen(scene.text,{owner:root.current||undefined,lang:'es-CO',
   onstate:({state,message:copy})=>{if(token!==generation.current)return;setStatus(state);setMessage(copy||'');if(['error','ended','stopped'].includes(state))active.current=false;},
   onend:()=>{if(token!==generation.current)return;active.current=false;setStatus('ended');setMessage('Escena finalizada. Avanza cuando quieras.');},
   oncancel:()=>{if(token!==generation.current)return;active.current=false;setStatus('idle');setMessage('Narración detenida.');},
  });
 }
 function move(delta:number){stop();setMessage('');setIndex(value=>Math.max(0,Math.min(FINAL_DEMO_SCENES.length-1,value+delta)));}
 async function playVisual(){stop();claimPlayback(owner.current);const element=visual.current;if(!element)return;const request=++generation.current;element.muted=true;try{await element.play();if(request!==generation.current||!root.current?.isConnected){element.pause();return;}setVisualPlaying(true);setFailed(false);}catch{if(request!==generation.current)return;setFailed(true);setVisualPlaying(false);}}
 return <figure ref={root} className="bl-video">
  <img src={scene.image} alt={`Demostración de respiración, escena ${index+1}`} className="mx-auto max-h-[55vh] w-auto" />
  <figcaption>Respiración diafragmática · escena {index+1} de {FINAL_DEMO_SCENES.length}</figcaption>
  <div className="space-y-3 p-4">
   <p>{scene.text}</p><p className="text-sm text-muted-foreground">Lee o escucha cada escena y avanza a tu ritmo.</p>
   <div className="flex flex-wrap gap-2">
    <button type="button" className="bl-btn" onClick={listen}>{status==='paused'?'Reanudar desde este párrafo':status==='playing'||status==='preparing'?'Pausar voz':status==='error'?'Reintentar voz':'Escuchar escena'}</button>
    <button type="button" className="bl-btn" onClick={stop} disabled={!active.current}>Detener voz</button>
    <button type="button" className="bl-btn" onClick={()=>move(-1)} disabled={index===0}>Escena anterior</button>
    <button type="button" className="bl-btn" onClick={()=>move(1)} disabled={index===FINAL_DEMO_SCENES.length-1}>Siguiente escena</button>
   </div>
   <p role="status" className="text-sm">{message}</p>
   <details><summary className="min-h-11 cursor-pointer content-center text-spm-gold">Leer narración completa</summary><p>{FINAL_TRANSCRIPT}</p></details>
   <details><summary className="min-h-11 cursor-pointer content-center text-spm-gold">Ver la demostración visual</summary>
    <video ref={visual} src={source.url} poster={poster.url} muted playsInline preload="metadata" className="mx-auto max-h-[55vh] w-auto" aria-label="Demostración visual sin narración" onVolumeChange={()=>{if(visual.current)visual.current.muted=true;}} onPause={()=>setVisualPlaying(false)} onEnded={()=>setVisualPlaying(false)} onError={()=>setFailed(true)} />
    <button type="button" className="bl-btn" onClick={()=>{if(visualPlaying){visual.current?.pause();setVisualPlaying(false);}else void playVisual();}}>{visualPlaying?'Pausar movimiento':'Ver movimiento sin voz'}</button>
    {failed&&<p role="status">No se pudo reproducir el movimiento. Puedes reintentar o seguir las escenas y la guía escrita.</p>}
   </details>
  </div>
 </figure>;
}
