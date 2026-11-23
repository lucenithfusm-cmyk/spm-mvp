import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ShieldAlert, Volume2, Wind } from 'lucide-react';
import { host, type DailyActivity } from '@/lib/central';
import { type Session } from '@/lib/breath-data';
import { getDailyBreathingJourney, isDailyBreathingAssignment } from '@/lib/breath-daily-journey';
import { hasAudio, playAudio, setAudioMuted, stopAudio } from '@/lib/breath-audio';
import { claimPlayback } from '@/lib/breath-playback';
import { useBreathAudio } from '@/lib/use-breath-audio';
import manifest from '@/assets/audio/lenny-manifest.json';
import dailyInstructions from '@/assets/audio/daily-instructions-manifest.json';
import practicalGuidance from '@/assets/audio/practical-guidance-manifest.json';
import { BreathPatternGuide } from './BreathPatternGuide';
import { DemoVideo } from './DemoVideo';
import { PracticeBlock } from './PracticeBlock';

type Props = {
  assignment: DailyActivity | null;
  day: number;
  practiceAllowed: boolean;
  noHold: boolean;
  setNoHold: (value: boolean) => void;
  onSave: (session: Session) => Promise<void>;
};
type Observation = 'chest' | 'abd' | 'both';
const handChecks = [
  'La mano del abdomen sube al inhalar',
  'El pecho se mantiene casi quieto',
  'Al exhalar el abdomen baja sin empujar',
] as const;
const releaseZones = [
  { key: 'jaw', title: 'Mandíbula', detail: 'Labios juntos, dientes separados, lengua suave en el paladar.' },
  { key: 'shoulders', title: 'Hombros', detail: 'Súbelos al inhalar y déjalos caer al exhalar. Repite dos veces.' },
  { key: 'abd', title: 'Abdomen', detail: 'Deja de “meter barriga”. Permite que se expanda libremente.' },
] as const;
const transcript = (id: string) => [...manifest.entries, ...dailyInstructions.entries, ...practicalGuidance.entries].find(entry => entry.id === id)?.text ?? '';

function Narration({ id, label = 'Escuchar explicación', ariaLabel }: { id: string; label?: string; ariaLabel?: string }) {
  const audio = useBreathAudio();
  const playing = audio.id === id;
  return (
    <section className="bl-route-audio" data-narration={id}>
      <button type="button" className="bl-audio" aria-label={ariaLabel ? playing ? 'Detener audio para acomodarte' : ariaLabel : undefined} aria-pressed={playing} disabled={!hasAudio(id)} onClick={() => {
        if (playing) stopAudio();
        else { if (audio.muted) setAudioMuted(false); playAudio(id); }
      }}>
        <Volume2 size={24} aria-hidden="true" />{playing ? label === 'Escuchar instrucción' ? 'Detener instrucción' : 'Detener voz' : label}
      </button>
      <details className="bl-route-transcript"><summary>Leer explicación</summary><p>{transcript(id)}</p></details>
    </section>
  );
}

function HandCheck({ selected, toggle }: { selected: number[]; toggle: (index: number) => void }) {
  return (
    <section className="bl-route-card">
      <h2 className="bl-route-subtitle">Autoverificación</h2>
      <p>Marca las observaciones que reconozcas durante esta práctica.</p>
      <div className="bl-route-choices" role="group" aria-label="Observaciones de la respiración">
        {handChecks.map((text, index) => (
          <button type="button" className={`bl-route-choice ${selected.includes(index) ? 'on' : ''}`} aria-pressed={selected.includes(index)} key={text} onClick={() => toggle(index)}>
            <span className="bl-route-check" aria-hidden="true">{selected.includes(index) && <Check size={18} />}</span>{text}
          </button>
        ))}
      </div>
    </section>
  );
}

export function DailyBreathingJourney({ assignment, day, practiceAllowed, noHold, setNoHold, onSave }: Props) {
  const journey = getDailyBreathingJourney(assignment);
  const validAssignment = journey && isDailyBreathingAssignment(assignment) ? assignment : null;
  const [stage, setStage] = useState(0);
  const [safety, setSafety] = useState(false);
  const [comparison, setComparison] = useState<'chest' | 'diaphragm'>('diaphragm');
  const [comparisonActivation, setComparisonActivation] = useState(0);
  const [observation, setObservation] = useState<Observation | null>(null);
  const [checks, setChecks] = useState<number[]>([]);
  const [released, setReleased] = useState<string[]>([]);
  const audio = useBreathAudio();
  const navigationOwner = useRef({});
  const heading = useRef<HTMLHeadingElement>(null);
  const assignmentKey = `${validAssignment?.id ?? ''}:${validAssignment?.day ?? ''}:${validAssignment?.steps.join(',') ?? ''}:${day}`;
  const allowed = practiceAllowed && validAssignment?.day === day && !!journey;
  const stopMedia = () => { claimPlayback(navigationOwner.current); stopAudio(); };

  useEffect(() => {
    stopMedia(); setStage(0); setSafety(false); setComparison('diaphragm'); setComparisonActivation(0); setObservation(null); setChecks([]); setReleased([]);
  }, [assignmentKey]);
  useEffect(() => {
    const stop = () => { claimPlayback(navigationOwner.current); stopAudio(); };
    const hidden = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('pagehide', stop);
    window.addEventListener('spm:breathing-stop-audio', stop);
    return () => { stop(); document.removeEventListener('visibilitychange', hidden); window.removeEventListener('pagehide', stop); window.removeEventListener('spm:breathing-stop-audio', stop); };
  }, []);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [stage, safety]);

  const move = (next: number) => { stopMedia(); setSafety(false); setStage(Math.max(0, Math.min(3, next))); };
  const leave = () => { stopMedia(); void host()?.close(); };
  const openLibrary = () => { stopMedia(); void host()?.openLibrary(); };
  const showSafety = () => { stopMedia(); setSafety(true); };
  const selectComparison = (mode: 'chest' | 'diaphragm') => {
    setComparison(mode); setComparisonActivation(previous => previous + 1);
    if (audio.muted) setAudioMuted(false);
    playAudio(`comparison.${mode}`);
  };
  const toggleCheck = (index: number) => setChecks(previous => previous.includes(index) ? previous.filter(value => value !== index) : [...previous, index]);
  const title = safety ? 'Señales para detenerte' : !journey ? 'Explora la respiración con calma'
    : stage === 0 ? journey.variant === 'recognize' ? 'Pecho y abdomen' : 'Mandíbula, hombros y abdomen'
      : stage === 1 ? journey.variant === 'recognize' ? 'Observa con tus manos' : 'Mano en el abdomen'
        : stage === 2 ? validAssignment!.title : 'Respira a tu ritmo';
  const practice = journey?.practice;
  const instruction = dailyInstructions.entries.find(entry => entry.id === journey?.instructionAudioId);

  return (
    <div className="bl-shell bl-route-shell" data-daily-journey={journey?.variant ?? 'education'} data-route-stage={stage + 1} data-route-assignment={validAssignment?.id} data-route-safety={safety}>
      <div className="bl-central-day">Día {day} de 28 · Actividad asignada</div>
      <header className="bl-top bl-route-header">
        <button type="button" className="bl-brand" onClick={() => move(0)} aria-label="Inicio de la actividad">
          <span className="bl-mark"><Wind size={18} aria-hidden="true" /></span>
          <span className="bl-brand-text">SPM <b>Breathing Lab</b><small>{journey?.title ?? 'RESPIRACIÓN DIAFRAGMÁTICA'}</small></span>
        </button>
        <div className="bl-top-right">
          {journey && <span className="bl-counter">{stage + 1}<i>/</i>4</span>}
        </div>
      </header>
      {journey && <ol className="bl-route-progress" aria-label="Etapas de la actividad">
        {journey.stages.map((label, index) => <li key={label} data-current={index === stage} data-complete={index < stage} aria-current={index === stage ? 'step' : undefined}><span>{index + 1}</span><span>{label}</span></li>)}
      </ol>}
      {audio.error && <p className="bl-audio-error" role="alert">{audio.error}</p>}

      <main className="bl-main bl-route-main">
        <p className="bl-kicker bl-route-kicker"><span />{safety ? 'SEGURIDAD' : journey ? `${journey.title} · Etapa ${stage + 1} de 4` : 'BIBLIOTECA SPM'}</p>
        <h1 className="bl-h1" ref={heading} tabIndex={-1}>{title}</h1>
        {validAssignment && stage === 2 && !safety && <p className="bl-route-summary" data-daily-assignment>{validAssignment.summary}</p>}
        {!allowed && <section className="bl-note bl-route-restriction" role="status">
          {!assignment ? 'Hoy no tienes una sesión de respiración asignada. Puedes consultar las explicaciones en la biblioteca.'
            : !validAssignment ? 'Esta actividad no tiene una práctica disponible en este recorrido. Puedes consultar la biblioteca.'
              : validAssignment.day !== day ? `Estás consultando el día ${validAssignment.day}. Tu día actual es ${day}; la práctica está deshabilitada.`
              : !practiceAllowed ? 'Tu programa requiere revisión antes de iniciar prácticas. Puedes consultar la explicación y las recomendaciones de seguridad.'
                : 'Esta actividad no tiene una práctica disponible en este recorrido. Puedes consultar la biblioteca.'}
        </section>}

        <div className="bl-route-content" hidden={safety} style={safety ? { display: 'none' } : undefined}>
          {!journey && <><BreathPatternGuide mode="diaphragm" autoPlay showControls={false} suspended={safety} /><Narration id="screen.03" /></>}
          {journey?.variant === 'recognize' && stage === 0 && <>
            <div className="bl-route-tabs" role="group" aria-label="Compara las dos imágenes de respiración">
              <button type="button" className={`bl-route-tab ${comparison === 'chest' ? 'on' : ''}`} aria-pressed={comparison === 'chest'} onClick={() => selectComparison('chest')}>Torácica · pecho</button>
              <button type="button" className={`bl-route-tab ${comparison === 'diaphragm' ? 'on' : ''}`} aria-pressed={comparison === 'diaphragm'} onClick={() => selectComparison('diaphragm')}>Diafragmática · abdomen</button>
            </div>
            <BreathPatternGuide mode={comparison} activationKey={comparisonActivation} showControls={false} suspended={safety} />
            <Narration id="screen.02" />
            <section className="bl-route-card"><h2 className="bl-route-subtitle">{comparison === 'chest' ? 'Observa el pecho y los hombros' : 'Observa el abdomen'}</h2>
              <ul className="bl-bullets">{(comparison === 'chest' ? ['Se mueven pecho y hombros', 'Ritmo rápido y corto', 'Acompaña estrés y tensión'] : ['Se mueve el abdomen', 'Ritmo lento, exhalación larga', 'Favorece calma y control']).map(text => <li key={text}>{text}</li>)}</ul>
            </section>
          </>}
          {journey?.variant === 'release' && stage === 0 && <>
            <Narration id="screen.07" />
            <div className="bl-route-grid" role="group" aria-label="Zonas para soltar tensión">
              {releaseZones.map((zone, index) => <button type="button" className={`bl-route-card bl-route-choice ${released.includes(zone.key) ? 'on' : ''}`} aria-pressed={released.includes(zone.key)} key={zone.key} onClick={() => setReleased(previous => previous.includes(zone.key) ? previous.filter(key => key !== zone.key) : [...previous, zone.key])}>
                <span className="bl-route-number" aria-hidden="true">{index + 1}</span><span><strong>{zone.title}</strong><span className="bl-route-detail">{zone.detail}</span></span><span className="bl-route-check" aria-hidden="true">{released.includes(zone.key) && <Check size={18} />}</span>
              </button>)}
            </div>
          </>}
          {journey && stage === 1 && <>
            <Narration id={journey.variant === 'recognize' ? 'screen.03' : 'screen.06'} />
            <BreathPatternGuide mode="diaphragm" autoPlay showControls={false} suspended={safety} />
            {journey.variant === 'recognize' && <section className="bl-route-card">
              <ol className="bl-ol"><li>Siéntate o recuéstate cómodo.</li><li>Una mano en el pecho, otra sobre el ombligo.</li><li>Respira como siempre durante 3–4 respiraciones.</li></ol>
              <h2 className="bl-route-subtitle">¿Qué mano se mueve más?</h2><div className="bl-route-tabs bl-route-observation" role="group" aria-label="Movimiento que percibes">
                {([['chest', 'Pecho'], ['abd', 'Abdomen'], ['both', 'Las dos por igual']] as const).map(([key, label]) => <button type="button" className={`bl-route-tab ${observation === key ? 'on' : ''}`} aria-pressed={observation === key} key={key} onClick={() => setObservation(key)}>{label}</button>)}
              </div>
              {observation && <p className="bl-note teal" role="status">{observation === 'chest' ? 'Observa el movimiento del pecho y los hombros. En la siguiente práctica, prueba suavemente que el movimiento acompañe al abdomen.' : observation === 'abd' ? 'Observa cómo sube y baja la mano del abdomen. Mantén los hombros sueltos y evita forzar el aire.' : 'Continúa observando sin forzar. Deja que el abdomen se mueva con suavidad y que el pecho acompañe.'}</p>}
            </section>}
            <HandCheck selected={checks} toggle={toggleCheck} />
          </>}
          {journey && stage === 2 && <>
            <Narration id={journey.contextAudioId} label="Escuchar el recordatorio" />
            {practice?.step === 9 && <section className="bl-route-card bl-route-context"><p><b>Clave:</b> al inhalar el piso pélvico desciende ligeramente de forma natural; al exhalar, en lugar de apretar, deja que se ablande. No empujes ni contengas.</p></section>}
            {practice?.step === 8 && <section className="bl-route-card bl-route-context"><ol className="bl-ol"><li><b>Detén o baja el estímulo.</b> Antes de que la activación sea demasiado alta.</li><li><b>Respira bajo y lento.</b> Abdomen, no pecho. Exhalación larga.</li><li><b>Suelta la pelvis.</b> Deja que glúteos y piso pélvico se aflojen.</li><li><b>Espera el descenso.</b> Continúa solo cuando notes calma y control.</li></ol></section>}
            {practice?.step === 7 && <section className="bl-route-card bl-route-context"><p>Con una exhalación más larga que la inhalación, el sistema nervioso tiende a pasar a un modo de calma. No hace falta respirar profundo: basta con respirar lento.</p></section>}
            {practice?.step === 10 && <section className="bl-route-card bl-route-context"><p>Tres respiraciones lentas sin retención. Úsala en cualquier momento: antes de una conversación difícil, en un pico de ansiedad o de activación.</p></section>}
            {journey.fullDemonstration ? <div className="bl-route-media"><DemoVideo /></div>
              : journey.regulationVideo ? <div className="bl-route-media"><DemoVideo kind="regulation" /></div>
                : <BreathPatternGuide mode="diaphragm" autoPlay showControls={false} suspended={safety} />}
            {journey.variant === 'recognize' && !journey.fullDemonstration && <details className="bl-route-card bl-route-demonstration" onToggle={event => { if (!event.currentTarget.open) stopMedia(); }}><summary>Ver demostración otra vez</summary><DemoVideo /></details>}
            {journey.variant === 'release'
              ? <Narration id="instruction.prepare" label="Escuchar audio" ariaLabel="Escuchar audio para acomodarte" />
              : <section className="bl-route-card"><h2 className="bl-route-subtitle">Acomódate antes de empezar</h2><ul className="bl-bullets"><li>Espalda apoyada, hombros sueltos.</li><li>Sin esfuerzo ni ruido: suave es suficiente.</li><li>Respirar lento debe sentirse cómodo. Si aparece mareo o malestar, detente y respira normal.</li></ul></section>}
          </>}
          {journey && stage === 3 && <>
            {allowed && instruction ? <section className="bl-route-card bl-route-instructions"><h2 className="bl-route-subtitle">{instruction.title}</h2><Narration id={instruction.id} label="Escuchar instrucción" /><ol className="bl-ol">{instruction.steps.map(text => <li key={text}>{text}</li>)}</ol></section>
              : <p className="bl-p">Esta práctica permite observar la respiración y reconocer qué te ayuda a soltar tensión, a tu ritmo.</p>}
            {allowed && practice && <PracticeBlock key={`${validAssignment!.id}:${validAssignment!.day}:${practice.id}`} id={practice.id} noHold={noHold} setNoHold={setNoHold} onSave={onSave} goSafety={showSafety} cycles={practice.cycles} durationSec={practice.durationSec} showBelly={practice.showBelly} lockNoHold={practice.lockNoHold} />}
          </>}
        </div>

        {safety && <section className="bl-route-safety bl-route-card" role="region" aria-label="Recomendaciones de seguridad">
          <Narration id="screen.17" />
          <div className="bl-note warn"><ShieldAlert size={20} aria-hidden="true" /><p><b>Detén la práctica</b> y respira de forma normal si notas: mareo, visión borrosa, hormigueo en manos o labios, falta de aire importante, dolor u opresión en el pecho, palpitaciones marcadas o cualquier malestar.</p></div>
          <h2 className="bl-route-subtitle">Cómo practicar con seguridad</h2><ul className="bl-bullets"><li>No fuerces el volumen de aire: lento no significa profundo.</li><li>No hiperventiles ni encadenes respiraciones rápidas.</li><li>Si las pausas te incomodan, usa siempre el modo sin pausa.</li><li>Practica sentado o recostado, nunca conduciendo ni en el agua.</li></ul>
          <p>Si los síntomas persisten, se repiten o tienes una condición respiratoria o cardíaca, consulta con tu profesional de salud. Ante dolor torácico intenso o dificultad respiratoria grave, busca atención urgente. Este módulo es educativo y no sustituye una valoración clínica.</p>
          <button type="button" className="bl-btn ghost" onClick={() => { stopMedia(); setSafety(false); }}>Volver a la actividad</button>
        </section>}
      </main>
      <footer className="bl-foot bl-route-footer">
        <button type="button" className="bl-btn ghost" onClick={() => safety ? (stopMedia(), setSafety(false)) : stage > 0 ? move(stage - 1) : leave()}><ArrowLeft size={18} aria-hidden="true" />Atrás</button>
        {journey && !safety && <span>Etapa {stage + 1} de 4</span>}
        <button type="button" className="bl-btn teal" onClick={() => journey && !safety && stage < 3 ? move(stage + 1) : leave()}>{journey && !safety && stage < 3 ? <>Continuar<ArrowRight size={18} aria-hidden="true" /></> : 'Volver a Hoy'}</button>
      </footer>
      <div className="bl-daily-library bl-route-library"><button type="button" className="bl-link" onClick={openLibrary}>Consultar biblioteca completa</button><button type="button" className="bl-link" onClick={showSafety}>Ver señales de seguridad</button><p>Consultar esta actividad no completa automáticamente el día.</p></div>
    </div>
  );
}
