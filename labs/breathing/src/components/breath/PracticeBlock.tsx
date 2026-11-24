import { useCallback, useRef, useState } from 'react';
import { Check, ShieldAlert } from 'lucide-react';
import { PATTERN_426, type Session } from '@/lib/breath-data';
import { BreathPacer } from './BreathPacer';

export function PracticeBlock({ id, noHold, setNoHold, onSave, goSafety, ...rest }: { id: string; noHold: boolean; setNoHold: (v: boolean) => void; onSave: (s: Session) => Promise<void>; goSafety: () => void } & Partial<React.ComponentProps<typeof BreathPacer>>) {
  const recordId = useRef<string | null>(null);
  const [secs, setSecs] = useState<number | null>(null);
  const [comfort, setComfort] = useState(4);
  const [dizzy, setDizzy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const finish = useCallback((s: number) => { recordId.current = null; setSecs(s); setSaved(false); }, []);
  return (
    <section className="bl-practice">
      <p className="bl-p">Usa el ritmo y la guía como apoyo para notar tu respiración. Puedes cerrar la práctica cuando la hayas realizado y registrar cómo te sentiste.</p>
      <BreathPacer pattern={PATTERN_426} noHold={noHold} onNoHold={setNoHold} onFinish={finish} {...rest} />
      {secs !== null && (
        <div className="bl-checkin">
          <h3>¿Cómo te sentiste?</h3>
          <div className="bl-scale">
            {[1, 2, 3, 4, 5].map((v) => (<button key={v} className={comfort === v ? 'on' : ''} onClick={() => setComfort(v)}>{v}</button>))}
          </div>
          <div className="bl-scale-legend"><span>Incómodo</span><span>Muy cómodo</span></div>
          <label className="bl-toggle"><input type="checkbox" checked={dizzy} onChange={(e) => setDizzy(e.target.checked)} /><span className="bl-switch" /><span>Noté mareo, falta de aire u hormigueo</span></label>
          {dizzy && (
            <div className="bl-note warn"><ShieldAlert size={16} /> Detente y respira normal. Prueba el modo <b>sin pausa</b> y con menos intensidad. <button className="bl-link" onClick={goSafety}>Ver señales de seguridad</button></div>
          )}
          <button className="bl-btn teal wide" disabled={saved || saving} onClick={async () => { setSaving(true);setError('');recordId.current ||= crypto.randomUUID();try { await onSave({ id: recordId.current, date: new Date().toISOString(), practice: id, seconds: secs, comfort, dizzy, noHold: noHold || !!rest.lockNoHold }); setSaved(true); if (dizzy) setNoHold(true); } catch {setError('No se pudo guardar. Reintenta antes de salir.');} finally {setSaving(false);} }}>
            {saved ? (<><Check size={16} /> Guardado en tu programa</>) : saving ? 'Guardando…' : 'Guardar registro'}
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      )}
    </section>
  );
}
