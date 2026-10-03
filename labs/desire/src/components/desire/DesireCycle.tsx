import { centralContext } from '@/lib/central';
// 28-day cycle, recovered resources (A1–F) and full practice sheets with guided timer. Browser-local only.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Pause, Play, RotateCcw, ShieldAlert, Square, X } from 'lucide-react';
import { Card, Chips, Cue, Quote, Seg } from './ui';
import { curriculum } from '@/lib/desire-curriculum';
import { practices, generateToday, personalLines, rankItems, rankLabel, type TodayCard, type TodayOpts } from '@/lib/desire-engine';
import { metricLabels, fantasyOpts, evaluate, type DesireState, type Metrics } from '@/lib/desire-data';
import { cueId } from '@/lib/desire-data';
import {
  bestActivators, baselineMetrics, canCompleteDay, continuity, dayStatus, freezeBaseline, metricKeys, moveRank, sensateGate, upsertSession, weekStats, pendingAttempt,
  type Num, type Program, type Session,
} from '@/lib/desire-program';

export type CycleCtx = {
  s: DesireState; up: <K extends keyof DesireState>(k: K, v: DesireState[K]) => void;
  prog: Program; setProg: (f: (p: Program) => Program) => void;
  origin: string; programDay: number; clinical: boolean; centralBlocked: boolean;
  go: (v: string | number, o?: string) => void;
  openPractice: (id: string, o: string, day?: number) => void;
  openResource: (r: string) => void;
};

export function todayOpts(s: DesireState, p: Program): TodayOpts {
  const clinical = evaluate(s).rec === 'clinical-review';
  return { hasPartner: p.hasPartner === 'yes' ? true : p.hasPartner === 'no' ? false : undefined, sensateIOk: sensateGate(p, s, clinical).ok, best: bestActivators(p), ranking: p.ranking, acute: p.acute || s.health.includes('acute'), baseline: baselineMetrics(p), sessions: p.sessions,
    personal: { details: p.details, conditions: p.conditions, accel: p.map.accel, brake: p.map.brake, influence: p.influence, nextPractice: p.nextPractice } };
}
export const todayFor = (s: DesireState, p: Program, day: number): TodayCard[] => generateToday(s, day, todayOpts(s, p));

export function NumSlider({ label, value, onChange, low = 'Bajo', high = 'Alto' }: { label: string; value: Num; onChange: (v: Num) => void; low?: string; high?: string }) {
  return (
    <div className="dz-slider">
      <span className="dz-slider-top"><span>{label}</span><b>{value === null ? 'N/A' : <>{value}<small>/10</small></>}</b></span>
      <input type="range" min={0} max={10} value={value ?? 5} className={value === null ? 'na' : ''} onChange={(e) => onChange(+e.target.value)} aria-label={label} />
      <span className="dz-slider-ends"><small>{low}</small><button type="button" className="dz-na" aria-pressed={value === null} onClick={() => onChange(value === null ? 5 : null)}>{value === null ? 'Dar valor' : 'N/A / omitir'}</button><small>{high}</small></span>
    </div>
  );
}
function Text({ label, value, onChange, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return <label className="dz-field"><span>{label}</span><textarea className="dz-input" rows={rows} maxLength={400} value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}
export function UrgentCard() {
  return <div className="dz-alert" role="alert"><ShieldAlert size={18} /><p><b>Primero, tu seguridad.</b> Indicaste pensamientos de hacerte daño o un malestar muy intenso. Las prácticas quedan en pausa. Busca ayuda profesional urgente hoy: servicio de emergencias local o una línea de crisis de tu país. No estás solo.</p></div>;
}

const fmt = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
const resLabel = (r: string) => resources.find((x) => x[0] === r)?.[1] ?? (r.startsWith('s:') ? `Pantalla ${r.slice(2)} del recorrido` : r === 'progress28' ? 'Progreso 28 días' : r === 'sensate' ? 'Sensate Focus (explicación)' : r === 'context' ? 'Contexto favorable' : r);

/** Measurement input with the correct scale: fantasies 0–4 (frequency labels), monthly frequency as count, otherwise 0–10. N/A allowed. */
function Measure({ metric, label, value, onChange }: { metric: string; label: string; value: Num; onChange: (v: Num) => void }) {
  if (metric === 'fantasies') return <label className="dz-field"><span>{label}</span><select className="dz-input" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : +e.target.value)}><option value="">N/A / sin responder</option>{fantasyOpts.map((f, i) => <option key={f} value={i}>{f}</option>)}</select></label>;
  if (metric === 'frequency') return <label className="dz-field"><span>{label} (veces al mes)</span><input className="dz-input" type="number" min={0} max={60} placeholder="N/A" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Math.max(0, Math.min(60, +e.target.value || 0)))} /></label>;
  return <NumSlider label={label} value={value} onChange={onChange} />;
}

/** Full educational sheet + guided timer + session diary.
 * Completed only when the timer finishes in the foreground, or with an explicit confirmation for untimed practices.
 * Pause saves and is restored (active time only); leaving while running = interrupted; restart after completion = new attempt id. */
export function PracticeSheet({ pid, day, ctx, why }: { pid: string; day: number; ctx: CycleCtx; why?: string | undefined }) {
  const { prog, setProg, clinical, s } = ctx;
  const pr = practices[pid]!;
  const pend = useMemo(() => pendingAttempt(prog, pid, day), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [sid, setSid] = useState(() => pend?.id ?? `${pid}-d${day}-${Date.now().toString(36)}`);
  const [elapsed, setElapsed] = useState(pend?.activeSec ?? 0);
  const [run, setRun] = useState(false);
  const [variant, setVariant] = useState<'solo' | 'partner'>(pend?.variant ?? 'solo');
  const [before, setBefore] = useState<Num>(pend?.before ?? null);
  const [after, setAfter] = useState<Num>(pend?.after ?? null);
  const [comfort, setComfort] = useState<Num>(pend?.comfort ?? null);
  const [comfortable, setComfortable] = useState<boolean | null>(pend?.comfortable ?? null);
  const [ready, setReady] = useState(pend?.ready === true);
  const [extra, setExtra] = useState<Record<string, Num>>(pend?.extra ?? {});
  const [refl, setRefl] = useState(pend?.reflection ?? '');
  const [confirm, setConfirm] = useState(false);
  const [saved, setSaved] = useState<Session['status'] | null>(pend ? 'paused' : null);
  const total = pr.timer?.seconds ?? 300;
  const acute = prog.acute || s.health.includes('acute');
  const gate = pid === 'sensate-2' ? sensateGate(prog, s, clinical) : { ok: true, reason: '' };
  const blocked = ctx.centralBlocked || acute || (clinical && !pr.safe) || !gate.ok;
  const live = useRef({ run, elapsed, saved, before, after, refl, variant, comfort, comfortable, extra, sid, ready });
  live.current = { run, elapsed, saved, before, after, refl, variant, comfort, comfortable, extra, sid, ready };
  const save = (status: Session['status']) => {
    const l = live.current;
    setProg((p) => upsertSession(p, { id: l.sid, day, date: new Date().toISOString().slice(0, 10), practiceId: pid, variant: l.variant, status, activeSec: l.elapsed, metricKey: pr.metric, metricLabel: pr.metricLabel, before: l.before, after: l.after, reflection: l.refl,
      ...(pid.startsWith('sensate') ? { comfort: l.comfort, comfortable: l.comfortable } : {}), ...(pid === 'sensate-2' && l.ready ? { ready: true } : {}), ...(pr.fields ? { extra: l.extra } : {}) }));
    setSaved(status);
  };
  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => setElapsed((e) => { if (e + 1 >= total) { setRun(false); return total; } return e + 1; }), 1000);
    return () => clearInterval(t);
  }, [run, total]);
  useEffect(() => { if (elapsed >= total && pr.timer && live.current.saved !== 'completed') save('completed'); }, [elapsed]); // eslint-disable-line react-hooks/exhaustive-deps
  // A restriction appearing while running stops the run (recorded as interrupted).
  useEffect(() => { if (blocked && live.current.run) { setRun(false); save('interrupted'); } }, [blocked]); // eslint-disable-line react-hooks/exhaustive-deps
  // Background tab: pause and save (no time accrues while hidden). Leaving while running: interrupted. Explicit pause is kept.
  useEffect(() => {
    const vis = () => { if (document.hidden && live.current.run) { setRun(false); save('paused'); } };
    const leave = () => { const l = live.current; if (l.run && l.saved !== 'completed') save('interrupted'); };
    document.addEventListener('visibilitychange', vis); window.addEventListener('pagehide', leave);
    return () => { document.removeEventListener('visibilitychange', vis); window.removeEventListener('pagehide', leave); leave(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (ctx.centralBlocked) return <Card><h3>Práctica en pausa</h3><p>Revisa la indicación de seguridad en SPM Central antes de continuar. El contenido educativo sigue disponible.</p></Card>;
  if (acute) return <UrgentCard />;
  if (clinical && !pr.safe) return <Card className="accent"><span className="dz-eyebrow">Adaptada</span><p>Mientras está pendiente la valoración profesional, SPM no avanza a esta práctica. Puedes seguir con una práctica suave y con todo el contenido educativo.</p><button className="dz-btn gold" onClick={() => ctx.openPractice('presence-5', ctx.origin, day)}>Ir a Explora sin exigencia</button></Card>;
  if (!gate.ok) return <Card className="accent"><span className="dz-eyebrow">Aún no</span><p>{gate.reason} Repetir la fase I no es un castigo: es parte del proceso.</p><button className="dz-btn gold" onClick={() => ctx.openPractice('sensate-1', ctx.origin, day)}>Hacer {practices['sensate-1']!.title}</button></Card>;

  const phases = pr.timer?.phases ?? [];
  const phase = phases.length ? phases[Math.min(phases.length - 1, Math.floor((elapsed / total) * phases.length))] : '';
  const sessions = prog.sessions.filter((x) => x.practiceId === pid);
  const hasPartner = prog.hasPartner === 'yes' ? true : prog.hasPartner === 'no' ? false : undefined;
  const lines = personalLines(pid, s, { details: prog.details, conditions: prog.conditions, accel: prog.map.accel, brake: prog.map.brake }, hasPartner);
  const mLabel = pr.metricLabel.replace(/ \/ después|\(.*\)/g, '').trim();
  const restart = () => { setRun(false); setElapsed(0); if (live.current.saved === 'completed' || live.current.saved === 'interrupted') { setSid(`${pid}-d${day}-${Date.now().toString(36)}`); setSaved(null); setBefore(null); setAfter(null); setRefl(''); setComfort(null); setExtra({}); setConfirm(false); } };
  const needsReady = pid === 'sensate-2' && !ready;
  return (<>
    {why && <Card className="accent"><span className="dz-eyebrow">Por qué te la asignamos</span><p>{why}</p></Card>}
    <dl className="dz-sheet">
      <dt>Propósito</dt><dd>{pr.purpose ?? pr.metricLabel}</dd>
      <dt>Preparación</dt><dd>{pr.prep ?? 'Un momento tranquilo y privado, sin prisa.'}</dd>
      <dt>Duración</dt><dd>{pr.duration} · breve y opcional, no una obligación</dd>
      <dt>Qué observar</dt><dd>{pr.observe ?? pr.metricLabel}</dd>
    </dl>
    {lines.length > 0 && <Card className="accent"><span className="dz-eyebrow">Personalizado con tus datos</span>{lines.map((l) => <p key={l}>{l}</p>)}</Card>}
    {needsReady ? <Card><span className="dz-eyebrow">Antes de ampliar</span><p>La fase I quedó registrada como cómoda. ¿Hoy te sientes con disposición{hasPartner ? ' y hay consentimiento mutuo' : ''} para ampliar?</p>
      <label className="dz-check"><input type="checkbox" checked={ready} onChange={(e) => setReady(e.target.checked)} /> Sí, hoy quiero ampliar y sé que puedo parar en cualquier momento</label>
      {pend && <p className="dz-muted small">Tienes un intento en pausa ({fmt(pend.activeSec)} activos) que se retomará.</p>}
      <button className="dz-btn ghost" onClick={() => ctx.openPractice('sensate-1', ctx.origin, day)}>Prefiero repetir la fase I</button></Card> : <>
    <ol className="dz-steps">{pr.steps.map((x) => <li key={x}>{x}</li>)}</ol>
    {pr.note && <p className="dz-note">{pr.note}</p>}
    {pr.link && <p className="dz-muted small">{pr.link}</p>}
    {pr.resourceLinks && <div className="dz-lib">{pr.resourceLinks.map((r) => <button key={r} onClick={() => { if (run) { setRun(false); save('paused'); } ctx.openResource(r); }}><ArrowRight size={14} /><span>Abrir: {resLabel(r)}</span></button>)}</div>}
    {pr.partnerVariant && (hasPartner
      ? <Seg label="Variante" value={variant} opts={[['solo', 'Individual'], ['partner', 'En pareja']]} onChange={setVariant} />
      : <p className="dz-muted small">Variante individual. {pr.partnerVariant.startsWith('Si no') ? pr.partnerVariant : ''}</p>)}
    {variant === 'partner' && pr.partnerVariant && <p className="dz-note">{pr.partnerVariant} El consentimiento se renueva en cada momento.</p>}
    <Card className="dz-timer">
      <span className="dz-eyebrow">{pr.timer ? 'Práctica guiada' : 'Temporizador opcional'}</span>
      <div className="dz-clock" aria-live="polite">{fmt(Math.max(0, total - elapsed))}</div>
      {phase && <p className="dz-phase">Fase: <b>{phase}</b></p>}
      <div className="dz-bar"><span style={{ width: `${(elapsed / total) * 100}%` }} /></div>
      <div className="dz-row">
        {!run && elapsed < total && <button className="dz-btn gold" onClick={() => setRun(true)}><Play size={16} /> {elapsed ? 'Reanudar' : 'Iniciar'}</button>}
        {run && <button className="dz-btn ghost" onClick={() => { setRun(false); save('paused'); }}><Pause size={16} /> Pausar</button>}
        <button className="dz-btn ghost" disabled={!elapsed && saved !== 'completed'} onClick={restart}><RotateCcw size={16} /> {saved === 'completed' ? 'Nuevo intento' : 'Reiniciar'}</button>
        <button className="dz-btn ghost" disabled={!elapsed || saved === 'completed'} onClick={() => { setRun(false); save('interrupted'); }}><Square size={16} /> Parar</button>
      </div>
      {pend && elapsed > 0 && saved === 'paused' && !run && <p className="dz-muted small">Retomando tu intento en pausa ({fmt(elapsed)} activos).</p>}
      <Cue id={cueId(pid)}>{phase ? `${phase}. ` : ''}Sin prisa y sin objetivo de rendimiento.</Cue>
    </Card>
    {pr.fields ? <div className="dz-grid2">{pr.fields.map(([k, l]) => <Card key={k}><NumSlider label={l} value={extra[k] ?? null} onChange={(v) => setExtra({ ...extra, [k]: v })} /></Card>)}</div>
      : <div className="dz-grid2">
        <Card><Measure metric={pr.metric} label={`${mLabel} · antes`} value={before} onChange={setBefore} /></Card>
        <Card><Measure metric={pr.metric} label={`${mLabel} · después`} value={after} onChange={setAfter} /></Card>
      </div>}
    {pr.metric === 'local' && <p className="dz-muted small">Esta medida es propia de la práctica: no se mezcla con las tendencias de deseo.</p>}
    {pid.startsWith('sensate') && <Card><NumSlider label="Comodidad durante la práctica" value={comfort} onChange={setComfort} low="Incómodo" high="Muy cómodo" /><div className="dz-field"><span>La fase I me resultó cómoda</span><div className="dz-chips" role="radiogroup" aria-label="La fase I me resultó cómoda">{([[true, 'Sí'], [false, 'No'], [null, 'N/A']] as const).map(([v, l]) => <button key={l} type="button" role="radio" aria-checked={comfortable === v} className={comfortable === v ? 'on' : ''} onClick={() => setComfortable(v)}>{l}</button>)}</div></div><p className="dz-muted small">La cifra de comodidad es solo un registro opcional. La fase II se abre únicamente si confirmas «Sí»; «No» o N/A no la abren.</p></Card>}
    <Card><label className="dz-field"><span>Tu reflexión (opcional)</span><textarea className="dz-input" rows={2} maxLength={400} value={refl} onChange={(e) => setRefl(e.target.value)} /></label></Card>
    <p className="dz-muted small">{pr.exit}</p>
    <div className="dz-row">
      {!pr.timer && saved !== 'completed' && <><label className="dz-check"><input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} /> La realicé (los valores pueden quedar en N/A)</label>
        <button className="dz-btn gold" disabled={!confirm} onClick={() => save('completed')}><Check size={16} /> Guardar como realizada</button></>}
      {saved === 'completed' && <button className="dz-btn gold" onClick={() => save('completed')}><Check size={16} /> Actualizar registro</button>}
    </div>
    </>}
    {saved && <p className="dz-saved"><Check size={14} /> Sesión {saved === 'completed' ? 'completada' : saved === 'paused' ? 'en pausa (guardada)' : 'interrumpida'} · día {day}</p>}
    {sessions.length > 0 && <p className="dz-muted small">Historial: {sessions.filter((x) => x.status === 'completed').length} completadas · {sessions.filter((x) => x.status === 'paused').length} en pausa · {sessions.filter((x) => x.status === 'interrupted').length} interrumpidas</p>}
  </>);
}

const A3a = ['Descanso', 'Conexión', 'Caricias', 'Tiempo', 'Novedad', 'Sentirme deseado'];
const A3b = ['Estrés', 'Presión', 'Cansancio', 'Miedo a fallar', 'Conflictos', 'Distracciones digitales / trabajo'];
const A4 = ['Menos presión', 'Más tiempo', 'Mejor descanso', 'Más conexión', 'Menos distracciones'];
const routine = ['Soltar presión', 'Respirar cómodo', 'Elegir conexión'];
const influenceF: [string, string][] = [['stress', 'Estrés'], ['tired', 'Cansancio'], ['partner', 'Conexión con pareja'], ['visual', 'Estímulos visuales'], ['touch', 'Contacto físico'], ['novelty', 'Novedad / variedad'], ['mood', 'Estado de ánimo']];
const detailGroups: [string, string, string[]][] = [
  ['visual', 'Ver', ['Miradas', 'Ropa', 'Luz', 'Actitud', 'Escenas']],
  ['tactile', 'Tocar', ['Caricias lentas', 'Masajes', 'Contacto piel con piel', 'Zonas', 'Ritmo', 'Presión']],
  ['verbal', 'Escuchar / que te hablen', ['Elogios', 'Tono de voz', 'Susurros', 'Conversación', 'Palabras sugerentes']],
  ['fantasy', 'Fantasías', ['Recuerdos', 'Escenas imaginadas', 'Lecturas', 'Novedad imaginada']],
  ['context', 'Contexto', ['Privacidad', 'Sin interrupciones', 'Cambio de ambiente', 'Juego previo largo']],
  ['partnerFavors', 'Qué favorece a mi pareja', ['Atención plena', 'Iniciativa', 'Comunicación abierta']],
];
const ideas: [string, string, string][] = [
  ['ver', 'Ver', 'Ropa, actitud o escenas que te atraen. Observa sin meta y nota qué detalle suma.'],
  ['tocar', 'Tocar', 'Masajes, caricias y zonas de tu mapa. Varía presión y ritmo.'],
  ['escuchar', 'Escuchar', 'Palabras o voz que te activan. Pruébalo con audio, lectura o recuerdo.'],
  ['hablar', 'Hablar', 'Expresa un gusto en primera persona. Opcional con pareja.'],
  ['previo', 'Juego previo', 'Más tiempo y un ritmo más lento antes de cualquier otra cosa.'],
  ['novedad', 'Novedad', 'Cambia un elemento de la rutina: lugar, hora, orden.'],
];

const medsOpts = ['Antidepresivos', 'Ansiolíticos', 'Presión arterial', 'Finasterida u otros para próstata/cabello', 'Esteroides anabólicos / testosterona', 'Para dormir', 'Otros', 'Ninguno', 'No sé / prefiero no responder'];
const moodOpts = ['Cansancio', 'Falta de motivación', 'Tristeza', 'Irritabilidad', 'Ansiedad', 'Estrés'];
const moodKeys: [string, string][] = [['fatigue', 'Cansancio'], ['motivation', 'Falta de motivación'], ['sadness', 'Tristeza'], ['irritability', 'Irritabilidad'], ['anxiety', 'Ansiedad'], ['stress', 'Estrés']];
const contGoals = ['Mantener mi acelerador más útil', 'Reducir un freno concreto', 'Ventana de activación semanal', 'Sensate Focus de mantenimiento', 'Conversación periódica (opcional con pareja)', 'Rutina previa de respiración', 'Revisar mi curva de deseo cada mes'];
const ladder = ['Cercanía (abrazos, estar juntos)', 'Contacto sensual', 'Mayor erotismo', 'Actividad más amplia'];
const strategies: [string, string][] = [
  ['Salud física', 'Sueño, nutrición y movimiento según tu hábito o recurso SPM. Sin dosis universal.'], ['Manejo del estrés', 'Rutina de respiración y microregulación antes de la intimidad.'],
  ['Estímulos', 'Usa tu lista de excitación ordenada.'], ['Juego previo', 'Más tiempo, ritmo flexible.'], ['Comunicar deseos', 'Una frase en primera persona.'],
  ['Romper rutina', 'Cambia un elemento pequeño.'], ['Ambiente', 'Privacidad, luz, sin pantallas.'], ['Atención a sensaciones', 'Volver al cuerpo cuando la mente se va.'],
];
export const resources: [string, string][] = [
  ['r:concepts', 'Las dos formas del deseo'], ['r:influence', 'Mapa de influencia'], ['r:map', 'Aceleradores y frenos (selección)'], ['r:conditions', 'Condiciones y rutina previa'],
  ['r:details', 'Detalles por canal'], ['r:ideas', 'Ideas / repertorio'], ['r:ranking', 'Tu lista de excitación'], ['r:partner', 'Descubre qué excita a tu pareja'],
  ['r:age', 'Deseo y edad'], ['r:strategies', 'Estrategias'], ['r:meds', 'Medicamentos (contexto)'], ['r:mood', 'Ánimo y energía'], ['r:ladder', 'Escalera de intimidad'],
  ['r:continuity', 'Objetivos de continuidad (máx. 2)'],
];

export function CycleView({ view, ctx }: { view: string; ctx: CycleCtx }): ReactNode {
  const { s, up, prog, setProg, origin, programDay, clinical, go } = ctx;
  const P = (f: (p: Program) => Program) => setProg(f);
  const acute = prog.acute || s.health.includes('acute');
  const [draft, setDraft] = useState<Record<keyof Metrics, Num>>(() => Object.fromEntries(metricKeys.map((k) => [k, null])) as Record<keyof Metrics, Num>);
  const curDay = centralContext().day;

  if (view === 'cycle') return (<>
    <p className="dz-muted">Entender · Entrenar · Aplicar · Consolidar. Cada día: Aprender → Practicar → Medir → Aplicar → Completar. No es un tratamiento ni promete resultados.</p>
    <p className="dz-note">Hoy es el día {curDay} de tu programa SPM. Puedes consultar los 28 días; registrar actividades aquí no completa automáticamente el día en Central.</p>
    {[0, 1, 2, 3].map((w) => (
      <div key={w}><h3 className="dz-sub">Semana {w + 1} · {curriculum[w * 7]!.phase}</h3>
        <div className="dz-cal">{curriculum.slice(w * 7, w * 7 + 7).map((d) => { const st = dayStatus(prog, d.day); return (
          <button key={d.day} className={`st-${st} ${d.day === curDay ? 'now' : ''}`} onClick={() => go(`day:${d.day}`)} aria-label={`Día ${d.day}, ${d.title}, ${st === 'completed' ? 'completado' : st === 'in-progress' ? 'en curso' : 'pendiente'}`}>
            <b>{d.day}</b><span>{d.title}</span><small>{st === 'completed' ? '✓ Completado' : st === 'in-progress' ? 'En curso' : 'Pendiente'}</small>
          </button>); })}</div></div>))}
  </>);

  if (view.startsWith('day:')) {
    const n = Math.min(28, Math.max(1, +view.slice(4) || 1)), d = curriculum[n - 1]!;
    const cards = todayFor(s, prog, n), st = dayStatus(prog, n), canDone = canCompleteDay(prog, n, 'dailyPlan', curDay);
    const readOnly = n !== curDay;
    return (<>
      <span className="dz-eyebrow">Día {n} · {d.phase}{d.desireSpecific ? ' · Específico de Deseo' : ''}</span>
      <p className="dz-lead">{d.title}</p><p className="dz-muted">{d.objective}</p>
      {acute && <UrgentCard />}
      {clinical && <p className="dz-note">Revisión profesional recomendada: el contenido educativo sigue disponible, sin progresión erótica.</p>}
      <dl className="dz-sheet"><dt>1 · Aprender</dt><dd>{d.learn}</dd><dt>2 · Practicar</dt><dd>{d.practice}</dd><dt>3 · Medir</dt><dd>{d.measure}</dd><dt>4 · Aplicar</dt><dd>{d.apply}</dd><dt>5 · Completar</dt><dd>{d.complete}</dd></dl>
      {n === 1 && <Card className="accent"><span className="dz-eyebrow">Línea base</span>{prog.baseline ? <p>Confirmada y congelada el {prog.baseline.at.slice(0, 10)}.</p> : <><p>Confirma tu línea base para poder comparar más adelante. Los valores N/A se guardan como N/A.</p><button className="dz-btn gold" onClick={() => go('progress28')}>Confirmar línea base</button></>}</Card>}
      {d.checkpoint && <Card className="accent"><span className="dz-eyebrow">Checkpoint {d.checkpoint}</span>
        <p>Hoy usamos el checkpoint central de SPM. No hay cuestionario adicional en este módulo.</p></Card>}
      {n === 28 && (() => { const last = [...s.checkins].sort((a, b) => a.day.localeCompare(b.day)).pop(); const c = continuity(prog, clinical, last?.metrics ?? null); return <Card><span className="dz-eyebrow">Continuidad · {({ review: 'revisión profesional', maintenance: 'mantenimiento', adapted: 'ciclo adaptado', insufficient: 'sin comparación' } as const)[c.kind]}</span><p>{c.text}</p></Card>; })()}
      {!acute && <><h3 className="dz-sub">Actividades de hoy (máx. 3)</h3>
        <div className="dz-route">{cards.map((c) => <Card key={c.practiceId} className="accent"><span className="dz-eyebrow">{c.role === 'driver' ? 'Principal' : c.role === 'modifier' ? 'Modificador' : 'Transferencia'} · {c.durationOrScope}</span><h3>{c.title}</h3><p>{c.whyAssigned}</p><small className="dz-muted">Qué observar: {c.observe}</small>
          <button className="dz-btn gold" onClick={() => ctx.openPractice(c.practiceId, origin === 'dailyPlan' ? 'dailyPlan' : 'cycle', n)}>Abrir práctica <ArrowRight size={16} /></button></Card>)}</div></>}
      {d.resources.length > 0 && <><h3 className="dz-sub">Recursos del día</h3><div className="dz-lib">{d.resources.map((r) => { const v = r.startsWith('s:') ? +r.slice(2) : r; const label = resources.find((x) => x[0] === r)?.[1] ?? (r.startsWith('s:') ? `Pantalla ${r.slice(2)} del recorrido` : r === 'progress' ? 'Progreso 28 días' : r === 'sensate' ? 'Sensate Focus' : r === 'context' ? 'Contexto favorable' : r);
        return <button key={r} onClick={() => go(r === 'progress' ? 'progress28' : v)}><ArrowRight size={14} /><span>{label}</span></button>; })}</div></>}
      <div className="dz-row">
        {st === 'completed' ? <p className="dz-saved"><Check size={14} /> Día completado el {prog.dayDone[n]!.slice(0, 10)}</p>
          : readOnly ? <p className="dz-muted small">Vista de revisión: este día no puede completarse hoy.</p>
          : <button className="dz-btn gold" disabled={!canDone} onClick={() => P((p) => ({ ...p, dayDone: { ...p.dayDone, [n]: new Date().toISOString() } }))}><Check size={16} /> Completar día {n}</button>}
        {!canDone && st !== 'completed' && !readOnly && <p className="dz-muted small">Se completa tras registrar una práctica completada de este día.</p>}
      </div>
      <button className="dz-btn ghost" onClick={() => go('cycle')}>Ver calendario</button>
    </>);
  }

  if (view === 'progress28') {
    const ws = weekStats(prog), b = prog.baseline;
    const real = prog.sessions.filter((x) => x.status === 'completed');
    return (<>
      <p className="dz-lead">Tu progreso de <em>28 días</em></p><p className="dz-muted">Solo datos que registraste. Sin calificaciones ni porcentajes de ejemplo.</p>
      <Card><span className="dz-eyebrow">Línea base</span>
        {b ? <><p>Congelada el {b.at.slice(0, 10)}. No cambia con nuevos registros.</p><table className="dz-table"><tbody>{metricLabels.map(([k, l]) => <tr key={k}><td>{l}</td><td>{b.metrics[k] ?? 'N/A'}</td></tr>)}</tbody></table></>
          : <><p>Revisa tus valores de partida (N/A si no aplica) y confírmalos. Hasta entonces no hay comparación.</p>
            {metricLabels.map(([k, l]) => <Measure key={k} metric={k} label={l} value={draft[k]} onChange={(v) => setDraft({ ...draft, [k]: v })} />)}
            <button className="dz-btn gold" disabled={Object.values(draft).every((v) => v === null)} onClick={() => P((p) => freezeBaseline(p, draft))}>Confirmar y congelar línea base</button></>}
      </Card>
      <div className="dz-grid2">{ws.map((w) => <Card key={w.week}><span className="dz-eyebrow">Semana {w.week}</span><p>{w.done}/7 días completados · {w.sessions} prácticas</p>
        <small className="dz-muted">Presión {w.pressure ?? '—'} · Cercanía {w.closeness ?? '—'} · Deseo/apertura {w.desire ?? '—'} · Disfrute {w.satisfaction ?? '—'}</small></Card>)}</div>
      <Card><span className="dz-eyebrow">Diario de sesiones</span>
        {prog.sessions.length ? <table className="dz-table"><tbody>{[...prog.sessions].sort((a, z) => a.day - z.day).map((x) => <tr key={x.id}><td>D{x.day} · {x.date}</td><td>{practices[x.practiceId]?.title ?? x.practiceId}</td><td>{x.status === 'completed' ? 'Completada' : x.status === 'paused' ? 'Pausada' : 'Interrumpida'}</td><td>{x.extra ? 'seis valores' : `${x.metricLabel ?? x.metricKey}: ${x.before ?? 'N/A'}→${x.after ?? 'N/A'}`}{typeof x.comfort === 'number' ? ` · comodidad ${x.comfort}` : ''}</td></tr>)}</tbody></table> : <p>Aún no hay sesiones registradas.</p>}
      </Card>
      {prog.sessions.some((x) => x.extra && x.practiceId === 'desire-curve') && <Card><span className="dz-eyebrow">Tu curva de deseo (registros reales)</span><table className="dz-table"><tbody>{prog.sessions.filter((x) => x.practiceId === 'desire-curve' && x.extra).map((x) => <tr key={x.id}><td>D{x.day} · {x.date}</td><td>{(practices['desire-curve']!.fields ?? []).map(([k, l]) => `${l} ${x.extra![k] ?? 'N/A'}`).join(' · ')}</td></tr>)}</tbody></table></Card>}
      {Object.keys(s.practiceLog).length > 0 && <p className="dz-muted small">Registros anteriores conservados: {Object.entries(s.practiceLog).map(([id, l]) => `${practices[id]?.title ?? id} ×${l.done}`).join(' · ')}</p>}
      <div className="dz-row"><button className="dz-btn gold" onClick={() => go('cycle')}>Continuar plan</button><button className="dz-btn ghost" onClick={() => go(20)}>Biblioteca</button></div>
      {real.length === 0 && <p className="dz-muted small">El progreso aparece cuando completas prácticas.</p>}
    </>);
  }

  switch (view) {
    case 'r:concepts': { const v = prog.detailNotes['form'] ?? ''; return (<>
      <p className="dz-lead">Dos formas del deseo. <em>No hay forma correcta.</em></p>
      <div className="dz-grid2">{[['spont', 'Me dan ganas', 'Deseo espontáneo: aparece antes del contacto.', 'Ves a tu pareja al llegar a casa y sientes interés.'], ['resp', 'Me voy conectando', 'Deseo responsivo: aparece después de empezar, si el contexto ayuda.', 'Empiezan con un abrazo sin intención y poco a poco aparece el interés.']].map(([id, t, d, ex]) =>
        <Card key={id} className={v === id ? 'accent' : ''}><h3>{t}</h3><p>{d}</p><p className="dz-muted small">En la vida real: {ex}</p><button className="dz-btn ghost" aria-pressed={v === id} onClick={() => P((p) => ({ ...p, detailNotes: { ...p.detailNotes, form: id ?? '' } }))}>{v === id ? <><Check size={14} /> Se parece a mí hoy</> : 'Se parece a mí hoy'}</button></Card>)}</div>
      <p className="dz-note">Ambas son normales y pueden alternarse. No estás obligado a sentir ganas para empezar ni a empezar si no quieres.</p>
      <Quote>Despierta la respuesta sexual sin presión.</Quote></>); }
    case 'r:influence': return (<>
      <p className="dz-lead">Cuánto <em>influye</em> cada factor en tu deseo (0–10)</p><p className="dz-muted">Distinto de tu línea base: aquí mides influencia, no estado.</p>
      <div className="dz-grid2">{influenceF.map(([k, l]) => <Card key={k}><NumSlider label={l + (k === 'partner' ? ' (N/A sin pareja)' : '')} value={prog.influence[k] ?? null} onChange={(v) => P((p) => ({ ...p, influence: { ...p.influence, [k]: v } }))} low="Nada" high="Mucho" /></Card>)}</div>
      <p className="dz-saved"><Check size={14} /> Guardado en tu programa SPM</p></>);
    case 'r:map': { const sug = [prog.map.accel[0] && `Incluye "${prog.map.accel[0]}" en tu próxima ventana.`, prog.map.brake[0] && `Reduce un poco "${prog.map.brake[0]}" antes de la intimidad.`].filter(Boolean); return (<>
      <p className="dz-lead">Tu mapa: lo que <em>suma</em> y lo que <em>resta</em></p>
      <p>Los aceleradores son situaciones que aumentan tu deseo; los frenos son las que lo disminuyen. Elige cuáles reconoces en ti.</p>
      <Card className="accel"><span className="dz-eyebrow">Aceleradores</span><Chips opts={A3a} value={prog.map.accel} onChange={(v) => P((p) => ({ ...p, map: { ...p.map, accel: v } }))} /></Card>
      <Card className="brake"><span className="dz-eyebrow">Frenos</span><Chips opts={A3b} value={prog.map.brake} onChange={(v) => P((p) => ({ ...p, map: { ...p.map, brake: v } }))} /></Card>
      {(s.accelerators.length > 0 || s.brakes.length > 0) && <p className="dz-muted small">También en tu mapa del recorrido (pantalla 13, conservado): {[...s.accelerators, ...s.brakes].join(', ')}.</p>}
      {sug.length > 0 && <Card className="accent"><span className="dz-eyebrow">Sugerencias</span>{sug.map((x) => <p key={x}>{x}</p>)}</Card>}
      <Card><Text label="Mis notas sobre el mapa" value={prog.map.suggestions} onChange={(v) => P((p) => ({ ...p, map: { ...p.map, suggestions: v } }))} /></Card></>); }
    case 'r:conditions': return (<>
      <p className="dz-lead">Condiciones que <em>te ayudan</em></p>
      <Card><Chips opts={A4} value={prog.conditions} onChange={(v) => P((p) => ({ ...p, conditions: v }))} /></Card>
      <Card><span className="dz-eyebrow">Rutina previa</span>
        <ol className="dz-routine">{routine.map((r, i) => <li key={r} className={i < prog.routineStep ? 'done' : i === prog.routineStep ? 'now' : ''}>{i < prog.routineStep && <Check size={14} />} {r}</li>)}</ol>
        <div className="dz-row">{prog.routineStep < 3 ? <button className="dz-btn gold" onClick={() => P((p) => ({ ...p, routineStep: p.routineStep + 1 }))}>{prog.routineStep === 0 ? 'Empezar' : 'Siguiente paso'}</button> : <p className="dz-saved"><Check size={14} /> Rutina recorrida</p>}
          <button className="dz-btn ghost" onClick={() => P((p) => ({ ...p, routineStep: 0 }))}>Reiniciar</button>
          <button className="dz-btn ghost" onClick={() => ctx.openPractice('breath-routine', origin === 'library' ? 'library' : 'cycle', curDay)}>Con temporizador</button></div></Card></>);
    case 'r:details': return (<>
      <p className="dz-lead">Detalles concretos <em>por canal</em></p><p className="dz-muted">Los canales son las formas en que recibes estímulos: lo que ves, escuchas, sientes o imaginas. Marca los detalles que favorecen tu deseo; puedes elegir varios y añadir los tuyos.</p>
      {detailGroups.filter(([k]) => k !== 'partnerFavors' || prog.hasPartner === 'yes').map(([k, l, opts]) => <Card key={k}><span className="dz-eyebrow">{l}</span>
        <Chips opts={opts} value={prog.details[k] ?? []} onChange={(v) => P((p) => ({ ...p, details: { ...p.details, [k]: v } }))} />
        <Text label="Propio / otros detalles" value={prog.detailNotes[k] ?? ''} onChange={(v) => P((p) => ({ ...p, detailNotes: { ...p.detailNotes, [k]: v } }))} rows={1} /></Card>)}
      <Card className="accent"><span className="dz-eyebrow">Mi siguiente práctica</span>
        <Seg label="Elige" value={prog.nextPractice} opts={[['accel', 'Usar un acelerador consistente'], ['brake', 'Reducir un freno'], ['talk', 'Conversar sobre un estímulo útil']]} onChange={(v) => P((p) => ({ ...p, nextPractice: v }))} /></Card></>);
    case 'r:ideas': return (<>
      <p className="dz-lead">Ideas para tu <em>repertorio</em></p>
      <div className="dz-grid2">{ideas.map(([k, t, d]) => <Card key={k}><h3>{t}</h3><p>{d}</p><NumSlider label="Utilidad cuando la probé" value={prog.ideasLog[k] ?? null} onChange={(v) => P((p) => ({ ...p, ideasLog: { ...p.ideasLog, [k]: v } }))} low="Nada" high="Mucha" /></Card>)}</div></>);
    case 'r:ranking': { const avail = rankItems.filter(([id]) => id !== 'partner-visual' || prog.hasPartner !== 'no'); return (<>
      <p className="dz-lead">Tu lista de excitación: elige y <em>ordena 1–5</em></p>
      <p className="dz-muted">El orden decide la práctica principal del Día 9. Lo que quede fuera del top 5 se conserva como preferencia.</p>
      <Card><span className="dz-eyebrow">Lo que te gusta</span><Chips opts={avail.map(([id, l]) => [id, l] as const)} value={prog.rankPrefs} onChange={(v) => P((p) => ({ ...p, rankPrefs: v, ranking: p.ranking.filter((x) => v.includes(x)) }))} /></Card>
      <Card><span className="dz-eyebrow">Prioridades (máx. 5)</span>
        <ol className="dz-rank">{prog.ranking.map((r, i) => { const l = rankLabel(r); return <li key={r}><b>{i + 1}</b><span>{l}</span>
          <button aria-label={`Subir ${l}`} disabled={i === 0} onClick={() => P((p) => ({ ...p, ranking: moveRank(p.ranking, i, -1) }))}><ArrowUp size={16} /></button>
          <button aria-label={`Bajar ${l}`} disabled={i === prog.ranking.length - 1} onClick={() => P((p) => ({ ...p, ranking: moveRank(p.ranking, i, 1) }))}><ArrowDown size={16} /></button>
          <button aria-label={`Quitar ${l}`} onClick={() => P((p) => ({ ...p, ranking: p.ranking.filter((x) => x !== r) }))}><X size={16} /></button></li>; })}</ol>
        <div className="dz-chips">{prog.rankPrefs.filter((x) => !prog.ranking.includes(x)).map((x) => <button key={x} disabled={prog.ranking.length >= 5} onClick={() => P((p) => ({ ...p, ranking: [...p.ranking, x].slice(0, 5) }))}>+ {rankLabel(x)}</button>)}</div>
        {!prog.rankPrefs.length && <p className="dz-muted small">Primero marca lo que te gusta.</p>}</Card></>); }
    case 'r:partner': { const t = prog.partnerTask, set = (k: keyof Program['partnerTask'], v: string | boolean) => P((p) => ({ ...p, partnerTask: { ...p.partnerTask, [k]: v } })); return (<>
      <p className="dz-lead">Descubre qué excita a tu pareja · <em>siempre opcional</em></p>
      <Card><Seg label="¿Tienes pareja con quien quieras hacerlo?" value={prog.hasPartner} opts={[['yes', 'Sí'], ['no', 'No / prefiero no'], ['na', 'Sin responder']]} onChange={(v) => P((p) => ({ ...p, hasPartner: v }))} /></Card>
      {prog.hasPartner === 'yes' && <Card><ol className="dz-steps"><li>Busquen un momento tranquilo.</li><li>Curiosidad sin juicio.</li><li>Escucha de verdad.</li><li>Abran nuevas posibilidades, solo con interés mutuo.</li></ol>
        <label className="dz-check"><input type="checkbox" checked={t.consent} onChange={(e) => set('consent', e.target.checked)} /> Lo hablamos con consentimiento mutuo y cualquiera puede parar</label>
        <Text label="Momento elegido" value={t.moment} onChange={(v) => set('moment', v)} rows={1} /><Text label="Hallazgos" value={t.findings} onChange={(v) => set('findings', v)} /><Text label="Qué acordamos probar" value={t.agreed} onChange={(v) => set('agreed', v)} /></Card>}
      <Card><span className="dz-eyebrow">Alternativa individual</span><Text label="Qué me gustaría que supiera una pareja (o yo mismo) sobre lo que me ayuda" value={t.solo} onChange={(v) => set('solo', v)} /></Card></>); }
    case 'r:age': { const a = prog.age, set = (k: keyof Program['age'], v: string) => P((p) => ({ ...p, age: { ...p.age, [k]: v } })); return (<>
      <p className="dz-lead">Tu sexualidad también <em>evoluciona</em></p>
      <p className="dz-muted">Con los años pueden cambiar estímulos, frecuencia, necesidades y disfrute. Adaptar el contexto no significa haber perdido el deseo, ni es un diagnóstico.</p>
      <Card><Text label="Qué estímulos siguen funcionando" value={a.still} onChange={(v) => set('still', v)} /><Text label="Qué necesita más presencia o juego previo" value={a.needs} onChange={(v) => set('needs', v)} /><Text label="Qué situaciones ayudan" value={a.helps} onChange={(v) => set('helps', v)} /></Card>
      <Quote>Adaptarte no es rendirte; es aprender cómo responde tu deseo hoy.</Quote></>); }
    case 'r:strategies': return (<><p className="dz-lead">Estrategias para <em>facilitar</em> el deseo</p><div className="dz-grid2">{strategies.map(([t, d]) => <Card key={t}><h3>{t}</h3><p>{d}</p></Card>)}</div></>);
    case 'r:meds': return (<>
      <p className="dz-lead">Medicamentos: <em>solo contexto</em></p>
      <p className="dz-note">Esta información sirve para conversar con un profesional. SPM no atribuye causas. No suspendas ni cambies ningún tratamiento por tu cuenta. No pedimos dosis.</p>
      <Card><p><strong>¿Tomas alguno de estos medicamentos?</strong></p><Chips opts={medsOpts} value={prog.meds} onChange={(v) => P((p) => ({ ...p, meds: v.includes('Ninguno') && !prog.meds.includes('Ninguno') ? ['Ninguno'] : v.filter((x) => x !== 'Ninguno' || v.length === 1) }))} /></Card>
      <Card><Text label="Opcional: ¿percibiste algún cambio en el tiempo desde que empezó o cambió? (con tus palabras)" value={prog.medsChange} onChange={(v) => P((p) => ({ ...p, medsChange: v }))} /></Card></>);
    case 'r:mood': return (<>
      <p className="dz-lead">Ánimo y <em>energía</em></p><p className="dz-muted">Se guarda en la evaluación; no se pregunta entero cada día.</p>
      <div className="dz-grid2">{moodKeys.map(([k, l]) => <Card key={k}><NumSlider label={l} value={prog.moodLevels[k] ?? null} onChange={(v) => P((p) => ({ ...p, moodLevels: { ...p.moodLevels, [k]: v } }))} low="Nada" high="Mucho" /></Card>)}</div>
      {prog.mood.length > 0 && <Card><span className="dz-eyebrow">Selección anterior (conservada)</span><Chips opts={moodOpts} value={prog.mood} onChange={(v) => P((p) => ({ ...p, mood: v }))} /></Card>}
      <Card><label className="dz-check"><input type="checkbox" checked={prog.acute} onChange={(e) => { const on = e.target.checked; P((p) => ({ ...p, acute: on })); up('health', on ? [...new Set([...s.health, 'acute'])] : s.health.filter((h) => h !== 'acute')); }} /> Tengo pensamientos de hacerme daño, de no querer vivir, o una tristeza que no me deja funcionar</label></Card>
      {acute && <UrgentCard />}</>);
    case 'r:continuity': { const c = prog.continuity, setC = (x: Partial<Program['continuity']>) => P((p) => ({ ...p, continuity: { ...p.continuity, ...x } })); return (<>
      <p className="dz-lead">Objetivos de <em>continuidad</em> · hasta 2</p>
      <p className="dz-muted">Distinto del plan personal de 3 acciones (pantalla 16), que se conserva.</p>
      <Card><Chips opts={contGoals} value={c.goals} onChange={(v) => setC({ goals: v.slice(0, 2) })} max={2} /><p className="dz-muted small">{c.goals.length}/2 elegidos</p></Card>
      <Card><label className="dz-field"><span>Qué mantener</span><textarea className="dz-input" rows={2} maxLength={300} value={c.keep} onChange={(e) => setC({ keep: e.target.value })} /></label>
        <label className="dz-field"><span>Qué espaciar</span><textarea className="dz-input" rows={2} maxLength={300} value={c.space} onChange={(e) => setC({ space: e.target.value })} /></label></Card>
      <button className="dz-btn ghost" onClick={() => go(16)}>Ver plan personal de 3 acciones</button></>); }
    case 'r:ladder': return (<>
      <p className="dz-lead">Escalera de intimidad <em>sin presión</em></p><p className="dz-muted">Elige el peldaño cómodo hoy. No hay avance automático; bajar siempre está bien.</p>
      <ol className="dz-ladder">{ladder.map((l, i) => { const blocked = i > 0 && (clinical || acute) || i > 1 && s.pressure >= 7; return <li key={l}><button aria-pressed={prog.ladder === i} disabled={blocked} className={prog.ladder === i ? 'on' : ''} onClick={() => P((p) => ({ ...p, ladder: i }))}>{i + 1}. {l}{blocked ? ' · en pausa' : ''}</button></li>; })}</ol>
      <p className="dz-note">Subir requiere comodidad y consentimiento. Con revisión profesional pendiente o presión alta, los peldaños superiores quedan en pausa.</p></>);
  }
  return null;
}
export { metricKeys };

