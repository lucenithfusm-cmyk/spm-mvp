import { DoctorDesireVideo } from './DoctorDesireVideo';
import { centralStorage, centralContext } from '@/lib/central';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, VolumeX, BookOpen, CalendarDays, ShieldAlert, Sparkles } from 'lucide-react';
import trainer from '@/assets/spm-trainer.jpg';
import {
  initialState, STORAGE, screens, audioId, cueId, videoSlots, stimuliOpts, zoneOpts, fantasyOpts, healthOpts, barrierOpts, accelOpts, brakeOpts, partnerOpts, actionOpts,
  perMonth, freqChange, evaluate, recText, buildProfile, metricsD0, metricLabels, library,
  normalizeState, clampDay, type DesireState, type Origin, type Unit, type Metrics, type MetricsN, type CheckIn,
} from '@/lib/desire-data';
import { microQuestions, canMicroCheck, logAssessment, programDay, readPerformanceMap, domainOf } from '@/lib/desire-cadence';
import { interpret, practices, adapt, adaptText, adherence, type TodayCard } from '@/lib/desire-engine';
import { CycleView, PracticeSheet, todayFor, resources, UrgentCard, NumSlider, type CycleCtx } from './DesireCycle';
import { BodyMap } from './BodyMap';
import { loadProgram, saveProgram, baselineMetrics, loadCtx, saveCtx, type Program } from '@/lib/desire-program';
import { deltas } from '@/lib/desire-engine';

const fixedViews = new Set(['today', 'sensate', 'context', 'route', 'micro', 'cycle', 'progress28']);
/** Validates numeric screens (1–20) and known view names; null = unknown (caller shows a visible fallback). */
export function parseView(x: unknown): View | null {
  if (x === null || x === undefined) return null;
  const v = String(x);
  if (/^\d+$/.test(v)) { const n = +v; return n >= 1 && n <= 20 ? n : null; }
  if (v.startsWith('s:')) return parseView(v.slice(2));
  if (fixedViews.has(v)) return v;
  if (v.startsWith('day:')) return `day:${clampDay(v.slice(4))}`;
  if (v.startsWith('r:')) return resources.some((r) => r[0] === v) ? v : null;
  if (v.startsWith('p:')) return practices[v.slice(2)] ? v : null;
  return null;
}
const lsSet = (k: string, v: string) => { try { centralStorage.setItem(k, v); } catch { /* blocked/quota */ } };

type View = number | string;

import { Quote, Cue, Trainer, Slider, Chips, Seg, Card, VideoSlot, Spark, unitOpts, triOpts, SIGN } from './ui';

export function DesireLab() {
  const [s, setS] = useState<DesireState>(initialState);
  const [view, setView] = useState<View>(1);
  const [origin, setOrigin] = useState<Origin>('lab');
  const [loaded, setLoaded] = useState(false);
  const [ciDay, setCiDay] = useState<'D14' | 'D28'>('D14');
  const [ci, setCi] = useState<MetricsN | null>(null);
  const [ciAccel, setCiAccel] = useState<string[]>([]);
  const [ciBrakes, setCiBrakes] = useState<string[]>([]);
  const [today, setToday] = useState<TodayCard[]>([]);
  const [day, setDay] = useState(centralContext().day);
  const [central, setCentral] = useState(centralContext);
  useEffect(() => { const sync = () => setCentral(centralContext()); window.addEventListener('spm:desire-context', sync); return () => window.removeEventListener('spm:desire-context', sync); }, []);
  const [cadenceNote, setCadenceNote] = useState('');
  const [prog, setProgS] = useState<Program>(() => loadProgram());
  const setProg = (f: (p: Program) => Program) => setProgS((p) => { const n = f(p); saveProgram(n); return n; });
  const [pDay, setPDay] = useState(1);
  const [retDay, setRetDay] = useState(1);
  const [retPractice, setRetPractice] = useState('');
  const [wantP, setWantP] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [microQ, setMicroQ] = useState<ReturnType<typeof microQuestions>>([]);
  useEffect(() => { try { const t = centralStorage.getItem(STORAGE.today); if (t) setToday(JSON.parse(t)); } catch { /* ignore */ } }, []);

  useEffect(() => {
    try {
      const raw = centralStorage.getItem(STORAGE.state);
      const q = new URLSearchParams(window.location.search);
      const qo = q.get('origin') as Origin | null;
      let parsed: unknown = null; try { parsed = raw ? JSON.parse(raw) : null; } catch { parsed = null; }
      let base: DesireState = normalizeState(parsed);
      const pm = qo === 'dailyPlan' ? readPerformanceMap() : null;
      if (pm) base = normalizeState(pm, base);
      setS(base);
      const nc = loadCtx(); setPDay(nc.pDay); setRetDay(nc.retDay); setRetPractice(nc.retPractice);
      const bad = () => { setNotice('No encontramos esa sección: te llevamos a la Biblioteca.'); setView(20); };
      const st = centralStorage.getItem(STORAGE.step);
      const o = centralStorage.getItem(STORAGE.origin) as Origin | null;
      const qp = q.get('practice');
      if (qo === 'dailyPlan') enterDaily(base, qp);
      else if (qo === 'library') { setOrigin('library'); if (qp) { if (practices[qp]) setView(`p:${qp}`); else bad(); } else if (q.get('resource')) { const v = parseView(q.get('resource')); if (v !== null) setView(v); else bad(); } else setView(20); }
      else if (q.get('view')) { const v = parseView(q.get('view')); if (v !== null) setView(v); else bad(); }
      else if (st) { const v = parseView(st); setView(v ?? 1); if (o && ['lab', 'library', 'dailyPlan', 'route', 'cycle'].includes(o)) setOrigin(o); if (o === 'dailyPlan') setDay(programDay()); }
      // Entry params are consumed once; reload then restores the saved view/origin/practice context.
      if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { centralStorage.setItem(STORAGE.state, JSON.stringify(s)); } catch { /* storage blocked */ }
    try { const r = interpret(s);
    lsSet(STORAGE.profile, JSON.stringify({ ...buildProfile(s), desireDrivers: r.desireDrivers, desireModifiers: r.desireModifiers, desireStrengths: r.desireStrengths, primaryTrainingTarget: r.primaryTrainingTarget, secondaryTrainingTarget: r.secondaryTrainingTarget, assignedPractices: r.assignedPractices, clinicalReviewReason: r.clinicalReviewReason, nextAction: r.nextAction, adaptation: adapt(s, baselineMetrics(prog), prog.sessions), stimulusDetails: prog.details, stimulusNotes: prog.detailNotes, arousalRanking: prog.ranking, arousalPreferences: prog.rankPrefs, influence: prog.influence, desireMap: prog.map, favorableConditions: prog.conditions, partnerTask: prog.partnerTask, medications: prog.meds, moodEnergy: prog.mood, hasPartner: prog.hasPartner }));
    } catch { /* ignore */ }
  }, [s, loaded, prog]);
  useEffect(() => {
    if (!loaded) return;
    lsSet(STORAGE.step, String(view));
    lsSet(STORAGE.origin, origin);
    saveCtx({ pDay, retDay, retPractice });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view, origin, loaded, pDay, retDay, retPractice]);

  const up = <K extends keyof DesireState>(k: K, v: DesireState[K]) => setS((p) => {
    const d = domainOf[k];
    return { ...p, [k]: v, ...(d ? { domainsAt: { ...p.domainsAt, [d]: new Date().toISOString() } } : {}) };
  });
  // dailyPlan: SPM already evaluated before Day 1 → reuse profile, go straight to the assigned practice; micro-check only if a decision-changing datum is missing and cadence allows.
  function enterDaily(st: DesireState, want?: string | null) {
    const d = programDay(); setDay(d); setPDay(d); setOrigin('dailyPlan');
    const mq = microQuestions(st), gate = canMicroCheck(d);
    if (mq.length && gate.ok) { setMicroQ(mq); setWantP(want ?? null); setCadenceNote(''); setView('micro'); return; }
    setCadenceNote(mq.length ? `${gate.reason} Usamos solo prácticas suaves hasta completar tu perfil.` : '');
    startToday(st, mq.length > 0, d, want);
  }
  function startToday(st: DesireState, safeOnly = false, d = day, want?: string | null) {
    const pg = loadProgram();
    let c = todayFor(st, pg, d);
    if (safeOnly) c = c.filter((x) => practices[x.practiceId]!.safe);
    setToday(c); lsSet(STORAGE.today, JSON.stringify(c));
    const pick = (want && c.find((x) => x.practiceId === want)) || c[0];
    setPDay(d);
    setView(pick ? `p:${pick.practiceId}` : 'today');
  }
  const ev = useMemo(() => evaluate(s), [s]);
  const change = freqChange(s);
  const go = (v: View, o: Origin = 'lab') => { setOrigin(o); setView(v); };
  const openFrom = (v: View, o: Origin) => { setOrigin(o); setView(v); };
  const n = typeof view === 'number' ? view : 0;

  const series = useMemo(() => {
    const bm = baselineMetrics(prog);
    const rest = ['D14', 'D28'].map((d) => s.checkins.find((c) => c.day === d)).filter(Boolean) as CheckIn[];
    return bm ? [{ day: 'D0', date: prog.baseline!.at, metrics: bm, accelUseful: [], brakesActive: [] } as CheckIn, ...rest] : rest;
  }, [s, prog]);
  const hasBase = !!baselineMetrics(prog);
  const emptyM = Object.fromEntries(metricLabels.map(([k]) => [k, null])) as MetricsN;
  const latest: CheckIn = series[series.length - 1] ?? { day: 'D0', date: '', metrics: emptyM, accelUseful: [], brakesActive: [] };

  const saveCheckin = () => {
    const m = ci; if (!m || Object.values(m).every((v) => v === null)) return;
    const rec: CheckIn = { day: ciDay, date: new Date().toISOString().slice(0, 10), metrics: m, accelUseful: ciAccel, brakesActive: ciBrakes };
    up('checkins', [...s.checkins.filter((c) => c.day !== ciDay), rec]);
    setProg((p) => ({ ...p, checkpoints: { ...p.checkpoints, [ciDay]: { at: new Date().toISOString(), source: 'central' } } }));
  };

  const route = useMemo(() => interpret(s), [s]);
  const adaptation = useMemo(() => adapt(s, baselineMetrics(prog), prog.sessions), [s, prog]);
  const genToday = () => { const c = todayFor(s, prog, day); setToday(c); lsSet(STORAGE.today, JSON.stringify(c)); };
  const openPractice = (id: string, o: Origin, d?: number) => { setPDay(clampDay(d ?? (o === 'dailyPlan' ? day : centralContext().day))); if (o === 'cycle' && d) setRetDay(clampDay(d)); setRetPractice(''); openFrom(`p:${id}`, o); };
  const clinical = ev.rec === 'clinical-review' || central.restriction !== 'none';
  const ctx: CycleCtx = { s, up, prog, setProg, origin, programDay: day, clinical, centralBlocked: central.restriction !== 'none', go: (v, o) => { const pv = parseView(v) ?? 20; if (typeof pv === 'string' && pv.startsWith('day:')) setRetDay(clampDay(pv.slice(4))); setView(pv); if (o) setOrigin(o as Origin); },
    openResource: (r) => { const pv = parseView(r); if (pv === null) return; setRetPractice(String(view)); setView(pv); }, openPractice: (id, o, d) => openPractice(id, o as Origin, d) };
  const isCycle = typeof view === 'string' && (view === 'cycle' || view === 'progress28' || view.startsWith('day:') || view.startsWith('r:'));
  const pid = typeof view === 'string' && view.startsWith('p:') ? view.slice(2) : '';
  const heading = isCycle ? (view === 'cycle' ? 'Mi ciclo de 28 días' : view === 'progress28' ? 'Progreso 28 días' : String(view).startsWith('day:') ? `Día ${clampDay(String(view).slice(4))}` : resources.find((r) => r[0] === view)?.[1] ?? 'Recurso') : pid ? practices[pid]?.title ?? 'Práctica' : view === 'route' ? 'Tu ruta SPM' : typeof view === 'number' ? screens[view - 1] : view === 'today' ? 'Hoy' : view === 'micro' ? 'Antes de empezar' : view === 'sensate' ? 'Sensate Focus' : 'Contexto favorable';

  let body: ReactNode = null;
  switch (view) {
    case 1: body = (<>
      <div className="dz-hero">
        <img src={trainer} alt="" />
        <div>
          <span className="dz-eyebrow">SPM Desire Activation Lab</span>
          <h1>Reactiva tu <em>deseo sexual</em></h1>
          <p>El deseo no es un interruptor que se enciende solo. Se comprende, se facilita y se cultiva. En este laboratorio vas a conocer tu patrón, sin etiquetas ni diagnósticos.</p>
          <button className="dz-btn gold" onClick={() => go(2)}>Comenzar <ArrowRight size={16} /></button>
        </div>
      </div>
      <div className="dz-grid3">
        {[['Comprende', 'Cómo funciona tu deseo hoy'], ['Explora', 'Qué lo acelera y qué lo frena'], ['Cultiva', 'Un plan propio y su evolución']].map(([t, d], i) => <Card key={t}><span className="dz-num">0{i + 1}</span><h3>{t}</h3><p>{d}</p></Card>)}
      </div>
      <Quote>El deseo no se exige: se le prepara el terreno.</Quote>
      <Trainer id={audioId(1)} title="Bienvenido" text="Vamos a trabajar a tu ritmo. Aquí no hay respuestas correctas, solo información útil sobre ti." />
    </>); break;
    case 2: body = (<>
      <p className="dz-lead">El deseo es <em>dinámico</em>: nace de la interacción entre cuerpo, mente y contexto.</p>
      <div className="dz-grid3">{[['Cuerpo', 'Energía, sueño, hormonas, salud general.'], ['Mente', 'Estado de ánimo, estrés, atención, fantasías.'], ['Contexto', 'Relación, ambiente, tiempo, privacidad.']].map(([t, d]) => <Card key={t}><h3>{t}</h3><p>{d}</p></Card>)}</div>
      <div className="dz-grid2">
        <Card className="accent"><span className="dz-eyebrow">Deseo espontáneo</span><h3>Aparece "de la nada"</h3><p>Un pensamiento o una imagen despiertan las ganas antes de cualquier estímulo.</p></Card>
        <Card className="accent"><span className="dz-eyebrow">Deseo responsivo</span><h3>Aparece al empezar</h3><p>Las ganas surgen después del contacto, la cercanía o la estimulación. Es igual de válido.</p></Card>
      </div>
      <p className="dz-note">La sexualidad cambia con la edad y las etapas de la vida. Adaptarse no es perder.</p>
      <Cue id={cueId('responsive-desire')}>Piensa en una ocasión en que las ganas llegaron después de empezar.</Cue>
      <VideoSlot slot="desire" />
    </>); break;
    case 3: body = (<div className="dz-myths">
      {[['Si no tengo ganas, algo anda mal.', 'El deseo fluctúa. Muchas veces depende del cansancio, el estrés o el contexto.'], ['El deseo solo es espontáneo.', 'El deseo responsivo es frecuente y aparece al iniciar el contacto.'], ['Con la edad se pierde el deseo.', 'Cambia su forma: puede necesitar más tiempo o estímulo, no desaparece por sí mismo.']].map(([m, r]) => (
        <Card key={m}><span className="dz-tag bad">Mito</span><h3>{m}</h3><span className="dz-tag good">Realidad</span><p>{r}</p></Card>
      ))}
    </div>); break;
    case 4: body = (<>
      <p className="dz-lead">Tu línea de base. Responde cómo te sientes <em>hoy</em>.</p>
      <div className="dz-grid2">
        {([['desire', 'Deseo actual'], ['energy', 'Energía general'], ['mood', 'Estado de ánimo'], ['stress', 'Estrés'], ['sleep', 'Calidad del sueño'], ['confidence', 'Confianza sexual'], ['satisfaction', 'Satisfacción general']] as const).map(([k, l]) => (
          <Card key={k}><Slider label={l} value={s.baseline[k]} onChange={(v) => up('baseline', { ...s.baseline, [k]: v })} /></Card>
        ))}
      </div>
      <p className="dz-saved"><Check size={14} /> Guardado en tu programa SPM</p>
    </>); break;
    case 5: {
      const F = ({ k, title }: { k: 'freqBefore' | 'freqNow'; title: string }) => (
        <Card><span className="dz-eyebrow">{title}</span>
          <div className="dz-freq">
            <input type="number" min={0} max={99} inputMode="numeric" value={s[k].value} aria-label={`${title} cantidad`} onChange={(e) => up(k, { ...s[k], value: Math.max(0, Math.min(99, +e.target.value || 0)) })} />
            <span>veces por</span>
          </div>
          <Seg label="Unidad" value={s[k].unit} opts={unitOpts} onChange={(u) => up(k, { ...s[k], unit: u })} />
          <small className="dz-muted">≈ {perMonth(s[k]).toFixed(1)} al mes</small>
        </Card>
      );
      body = (<>
        <div className="dz-grid2">{F({ k: "freqBefore", title: "Antes de los cambios" })}{F({ k: "freqNow", title: "Actualmente" })}</div>
        <Card className="dz-result"><span className="dz-eyebrow">Cambio orientativo</span>
          <strong>{change === null ? '—' : `${change > 0 ? '+' : ''}${change}%`}</strong>
          <p>{change === null ? 'Indica una frecuencia previa para comparar.' : change <= -50 ? 'Descenso marcado respecto a antes. Es un dato para observar, no un diagnóstico.' : change < 0 ? 'Descenso moderado. Suele relacionarse con contexto, energía o rutina.' : 'Frecuencia estable o mayor que antes.'}</p>
        </Card>
        <Card>
          <Seg label="¿Tienes fantasías sexuales actualmente?" value={s.fantasiesNow} opts={triOpts as [DesireState['fantasiesNow'], string][]} onChange={(v) => up('fantasiesNow', v)} />
          <Seg label="Respecto a antes, tus fantasías han…" value={s.fantasiesTrend} opts={[['down', 'Disminuido'], ['same', 'Igual'], ['up', 'Aumentado']]} onChange={(v) => up('fantasiesTrend', v)} />
          <Seg label="Cuando hay actividad sexual, ¿la disfrutas?" value={s.enjoyment} opts={[['yes', 'Sí'], ['no', 'No'], ['sometimes', 'A veces']]} onChange={(v) => up('enjoyment', v)} />
        </Card>
      </>);
    } break;
    case 6: body = (<>
      <p className="dz-lead">¿Qué suele <em>encender</em> tu excitación? Marca todo lo que aplique.</p>
      <Chips opts={stimuliOpts} value={s.stimuli} onChange={(v) => up('stimuli', v)} />
      <Card><span className="dz-eyebrow">Tarea de la semana</span>
        {['Observa qué aumenta tu excitación', 'Identifica las zonas o estímulos más activos', 'Registra el contexto que te resulta favorable'].map((t, i) => (
          <label key={t} className="dz-check"><input type="checkbox" checked={s.tasks[i]} onChange={(e) => up('tasks', s.tasks.map((x, j) => (j === i ? e.target.checked : x)))} /><span>{i + 1}. {t}</span></label>
        ))}
        <textarea className="dz-input" maxLength={300} placeholder="Nota breve: ¿qué contexto te ayudó?" value={s.favorableNote} onChange={(e) => up('favorableNote', e.target.value)} />
      </Card>
      <label className="dz-check consent"><input type="checkbox" checked={s.consent} onChange={(e) => up('consent', e.target.checked)} /><span>Si la exploración involucra a tu pareja, será con su consentimiento e interés mutuo.</span></label>
      <Cue id={cueId('observe-arousal')}>Observa sin juzgar. Solo registra lo que notas.</Cue>
    </>); break;
    case 7: body = (<div className="dz-bodymap-wrap">
      <BodyMap value={s.zones} onChange={(zones) => up('zones', zones)} />
      <div>
        <p className="dz-lead">Toca las zonas o formas de contacto que te resultan <em>más receptivas</em>.</p>
        <Chips opts={zoneOpts.map(([a, b]) => [a, b] as const)} value={s.zones} onChange={(v) => up('zones', v)} />
        <p className="dz-note">Cada persona es distinta, y las preferencias cambian con el tiempo. Tu selección se guarda en tu programa SPM.</p>
      </div>
    </div>); break;
    case 8: body = (<>
      <Card><span className="dz-eyebrow">¿Con qué frecuencia tienes fantasías sexuales?</span>
        <div className="dz-scale5">{fantasyOpts.map((f) => <button key={f} className={s.fantasyFreq === f ? 'on' : ''} aria-pressed={s.fantasyFreq === f} onClick={() => up('fantasyFreq', f)}>{f}</button>)}</div>
      </Card>
      <Card><Seg label="¿Ha cambiado su contenido en los últimos años?" value={s.fantasyContentChanged} opts={triOpts as [DesireState['fantasyContentChanged'], string][]} onChange={(v) => up('fantasyContentChanged', v)} /></Card>
      <p className="dz-note">Una fantasía puede mantenerse privada. Tenerla no te obliga a compartirla ni a realizarla.</p>
    </>); break;
    case 9: body = (<>
      <p className="dz-lead">En los <em>últimos meses</em>, ¿has notado…?</p>
      <Chips opts={healthOpts} value={s.health} onChange={(v) => up('health', v)} />
      <label className="dz-check urgent"><input type="checkbox" checked={s.health.includes('acute')} onChange={(e) => up('health', e.target.checked ? [...s.health, 'acute'] : s.health.filter((x) => x !== 'acute'))} /><span>Tristeza intensa la mayor parte de los días o pensamientos de hacerte daño</span></label>
      {ev.urgent && <div className="dz-alert"><ShieldAlert size={18} /><p>Lo que describes merece atención pronto. Si sientes que puedes hacerte daño, busca ayuda inmediata en urgencias o en la línea de emergencias de tu país. Si no es inmediato, pide cita con un profesional de salud esta semana.</p></div>}
      {!ev.urgent && s.health.length > 0 && <Card className="dz-result"><span className="dz-eyebrow">Lectura prudente</span><p>{recText[ev.rec][1]}</p></Card>}
      <p className="dz-muted small">Esta lista no diagnostica ningún déficit. Solo ayuda a ver si varias señales se combinan.</p>
      <VideoSlot slot="health" />
    </>); break;
    case 10: body = (<>
      <p className="dz-lead">Contrastar la función eréctil ayuda a entender qué está influyendo. <em>No es un diagnóstico.</em></p>
      <Card>
        <Seg label="¿Menos erecciones espontáneas por la mañana?" value={s.morning} opts={triOpts as [DesireState['morning'], string][]} onChange={(v) => up('morning', v)} />
        <Seg label="¿Menos erecciones espontáneas por la noche?" value={s.night} opts={triOpts as [DesireState['night'], string][]} onChange={(v) => up('night', v)} />
        <Seg label="Calidad / firmeza" value={s.quality} opts={[['down', 'Disminuyó'], ['same', 'Igual'], ['up', 'Mejoró']]} onChange={(v) => up('quality', v)} />
        <Seg label="¿Dificultad nueva para mantener la erección?" value={s.maintain} opts={triOpts as [DesireState['maintain'], string][]} onChange={(v) => up('maintain', v)} />
        <Seg label="¿Desde cuándo?" value={s.onset} opts={[['<3m', '< 3 meses'], ['3-12m', '3–12 meses'], ['>1y', '> 1 año'], ['unknown', 'No sé']]} onChange={(v) => up('onset', v)} />
      </Card>
    </>); break;
    case 11: body = (<>
      <div className="dz-grid2">
        {([['communication', 'Comunicación sexual'], ['closeness', 'Cercanía emocional'], ['satisfaction', 'Satisfacción sexual'], ['connection', 'Conexión / complicidad']] as const).map(([k, l]) => (
          <Card key={k}><Slider label={l} value={s.rel[k]} onChange={(v) => up('rel', { ...s.rel, [k]: v })} /></Card>
        ))}
      </div>
      <Card><Seg label="¿Has hablado con tu pareja sobre el bajo deseo?" value={s.talked} opts={[['yes', 'Sí'], ['partly', 'Un poco'], ['no', 'No'], ['nopartner', 'Sin pareja']]} onChange={(v) => up('talked', v)} /></Card>
      <Cue id={cueId('talk-no-blame')}>Habla en primera persona: "yo noto", "a mí me ayuda".</Cue>
    </>); break;
    case 12: body = (<>
      <p className="dz-lead">¿Qué está <em>frenando</em> tu deseo ahora?</p>
      <Chips opts={barrierOpts} value={s.barriers} onChange={(v) => up('barriers', v)} />
      <Card><Slider label="Presión por rendimiento que sientes" value={s.pressure} onChange={(v) => up('pressure', v)} low="Nada" high="Mucha" /></Card>
      {(s.barriers.includes('stress') || s.barriers.includes('pressure')) && <VideoSlot slot="stress" />}
    </>); break;
    case 13: body = (<>
      <p className="dz-lead">Los aceleradores son situaciones que aumentan tu deseo; los frenos son las que lo disminuyen. Elige cuáles reconoces en ti.</p>
      <div className="dz-grid2">
        <Card className="accel"><span className="dz-eyebrow">3 aceleradores</span><Chips opts={accelOpts} value={s.accelerators} onChange={(v) => up('accelerators', v)} max={3} /></Card>
        <Card className="brake"><span className="dz-eyebrow">3 frenos</span><Chips opts={brakeOpts} value={s.brakes} onChange={(v) => up('brakes', v)} max={3} /></Card>
      </div>
      <Card>
        <label className="dz-field"><span>Contexto en el que te sientes más receptivo</span><input className="dz-input" maxLength={140} value={s.context} onChange={(e) => up('context', e.target.value)} placeholder="Ej.: fin de semana, descansado, sin prisa" /></label>
        <label className="dz-field"><span>¿Qué quieres incorporar esta semana?</span><input className="dz-input" maxLength={140} value={s.weekly} onChange={(e) => up('weekly', e.target.value)} placeholder="Ej.: una noche sin pantallas" /></label>
      </Card>
      <Card className="dz-result"><span className="dz-eyebrow">Tu mapa</span>
        <p><b>Aceleran:</b> {s.accelerators.join(' · ') || '—'}<br /><b>Frenan:</b> {s.brakes.join(' · ') || '—'}<br /><b>Contexto:</b> {s.context || '—'}</p>
      </Card>
    </>); break;
    case 14: body = (<>
      <p className="dz-lead">Si tienes pareja, el deseo también se <em>construye en conjunto</em>.</p>
      <Chips opts={partnerOpts} value={s.partner} onChange={(v) => up('partner', v)} />
      <p className="dz-note">Compartir fantasías es opcional. Todo lo que exploren juntos parte del consentimiento y del interés mutuo.</p>
      <Cue id={cueId('partner-curiosity')}>Pregunta con curiosidad: ¿qué te gustaría probar?</Cue>
    </>); break;
    case 15: body = (<>
      <Card><span className="dz-eyebrow">Señales adicionales</span>
        <label className="dz-check"><input type="checkbox" checked={s.distress} onChange={(e) => up('distress', e.target.checked)} /><span>El cambio en mi deseo me genera malestar significativo</span></label>
        <label className="dz-check"><input type="checkbox" checked={s.otherClinical} onChange={(e) => up('otherClinical', e.target.checked)} /><span>He notado otros síntomas clínicos nuevos</span></label>
      </Card>
      <Card className={`dz-result rec-${ev.rec}`}><span className="dz-eyebrow">Recomendación SPM</span><h3>{recText[ev.rec][0]}</h3><p>{recText[ev.rec][1]}</p>
        {ev.reasons.length > 0 && <ul>{ev.reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
      </Card>
      {ev.urgent && <div className="dz-alert"><ShieldAlert size={18} /><p>Por lo que indicaste, prioriza atención profesional pronto. Si hay riesgo inmediato, acude a urgencias.</p></div>}
      <p className="dz-note">SPM no diagnostica. Te ayuda a reconocer cuándo conviene una valoración médica.</p>
      <button className="dz-btn gold" onClick={() => go('route')}><Sparkles size={16} /> Ver Tu ruta SPM</button>
    </>); break;
    case 16: body = (<>
      <p className="dz-lead">Elige <em>3 acciones</em> para las próximas semanas.</p>
      <Chips opts={actionOpts} value={s.actions} onChange={(v) => up('actions', v)} max={3} />
      <p className="dz-muted">{s.actions.length}/3 seleccionadas</p>
      <button className="dz-btn ghost" onClick={() => go('route')}><Sparkles size={16} /> Tu ruta SPM asignada</button>
    </>); break;
    case 17: {
      const m = ci ?? emptyM;
      const setM = (k: keyof Metrics, v: number | null) => setCi({ ...m, [k]: v });
      const dl = deltas(baselineMetrics(prog), latest.metrics);
      const central = origin === 'dailyPlan' && (day === 14 || day === 28);
      body = (<>
        <Card className="accent"><span className="dz-eyebrow">Seguimiento en SPM Central</span><p>Los controles de los días 14 y 28 se realizan en tu programa principal. Aquí puedes consultar tus registros de Deseo.</p></Card>
        <Card><span className="dz-eyebrow">Inicio vs actual ({latest.day})</span>
          {adaptation && <div className={`dz-adapt mode-${adaptation.mode}`}><span className="dz-eyebrow">Adaptación {adaptation.day} · {adaptation.mode}</span><p>{adaptText[adaptation.mode]}</p>
            <p className="dz-muted small">Adherencia (prácticas completadas): {adaptation.adherence}% · Aceleradores usados: {adaptation.accelUsed.join(', ') || '—'} · Frenos que disminuyeron: {adaptation.brakesReduced.join(', ') || '—'}</p>
            <p><b>Sugerencia revisable de prácticas:</b> {adaptation.practices.map((id) => practices[id]!.title).join(' · ')}</p></div>}
          {!hasBase && <p className="dz-muted">Sin línea base congelada: sin comparación. Confírmala en Progreso.</p>}
          {hasBase && <table className="dz-table"><tbody>{metricLabels.map(([k, l]) => { const a0 = series[0]!.metrics[k], b0 = latest.day === 'D0' ? null : latest.metrics[k], d = latest.day === 'D0' ? undefined : dl[k]; return <tr key={k}><td>{l}</td><td>{a0 ?? 'N/A'}</td><td>{b0 ?? 'N/A'}</td><td className={d === undefined ? '' : d > 0 ? 'up' : d < 0 ? 'down' : ''}>{d === undefined ? 'sin comparación' : d > 0 ? `↑ ${d}` : d < 0 ? `↓ ${d}` : '='}</td></tr>; })}</tbody></table>}
        </Card>
      </>);
    } break;
    case 18: body = (<>
      <p className="dz-lead">Tu sexualidad también <em>evoluciona</em>.</p>
      <div className="dz-evolve">
        <Card><span className="dz-eyebrow">Antes</span><p>Podía bastar menos estímulo para sentir ganas.</p></Card>
        <ArrowRight className="dz-evolve-arrow" />
        <Card className="accent"><span className="dz-eyebrow">Ahora</span><p>Puede hacer falta más contexto, tiempo o estimulación.</p></Card>
      </div>
      <p className="dz-note">Eso no equivale automáticamente a perder el deseo. Aprender a adaptarte evita interpretar cambios normales como una pérdida total.</p>
      <Quote>Adaptarte no es rendirte; es aprender cómo responde tu deseo hoy.</Quote>
      <Trainer id={audioId(18)} title="Sigue cultivándolo" text="Tu deseo se transforma contigo. Lo que aprendiste aquí te acompaña en cada etapa." />
    </>); break;
    case 19: body = (<>
      <p className="dz-lead">Tendencias, <em>no calificaciones</em>.</p>
      <div className="dz-grid3">
        {(['desire', 'frequency', 'fantasies', 'closeness', 'satisfaction', 'pressure'] as (keyof Metrics)[]).map((k) => {
          const [, l, max] = metricLabels.find((x) => x[0] === k)!;
          const pts = series.map((c) => [c.day, c.metrics[k]] as const), vals = pts.filter(([, v]) => typeof v === 'number').map(([, v]) => v as number);
          return <Card key={k} className="dz-chart"><span className="dz-eyebrow">{l}</span>{vals.length ? <Spark values={vals} max={max} /> : <p className="dz-muted small">Sin datos</p>}<small className="dz-muted">{pts.map(([d, v]) => `${d}: ${v ?? 'N/A'}`).join(' · ')}</small></Card>;
        })}
      </div>
      {!hasBase && <p className="dz-note">Aún no hay línea base confirmada: el progreso aparece con datos reales. <button className="dz-btn ghost" onClick={() => go('progress28')}>Confirmar línea base</button></p>}
      {series.length === 1 && <p className="dz-muted">Registra tus controles del día 14 y 28 en Seguimiento para ver la tendencia.</p>}
    </>); break;
    case 20: body = (<>
      <Card className="dz-reminder"><CalendarDays /><div><h3>Recordatorio</h3><p>Vuelve el día 14 y el día 28 para registrar tu evolución. {s.weekly && <>Esta semana: <b>{s.weekly}</b>.</>}</p></div></Card>
      <span className="dz-eyebrow">Biblioteca de prácticas</span>
      <div className="dz-lib">{library.map(([t, target]) => <button key={t} onClick={() => openFrom(target as View, 'library')}><BookOpen size={16} /><span>{t}</span><ArrowRight size={14} /></button>)}</div>
      <span className="dz-eyebrow">Conoce y explora tu deseo</span>
      <div className="dz-lib">{resources.map(([id, t]) => <button key={id} onClick={() => openFrom(id, 'library')}><BookOpen size={16} /><span>{t}</span><ArrowRight size={14} /></button>)}</div>
      <span className="dz-eyebrow">Prácticas guiadas del ciclo</span>
      <div className="dz-lib">{['presence-5', 'breath-routine', 'body-awareness', 'sensate-1', 'sensate-2', 'intimacy-ladder', 'communicate-limits', 'flex-script', 'if-then', ...Object.keys(practices).filter((k) => ['visual-explore', 'sensory-focus', 'verbal-script', 'fantasy-private', 'responsive-window', 'micro-regulation', 'lifestyle-modifiers', 'connection-talk', 'pleasure-lowpressure'].includes(k))].map((id) => <button key={id} onClick={() => openPractice(id, 'library')}><BookOpen size={16} /><span>{practices[id]!.title}</span><ArrowRight size={14} /></button>)}</div>
      <button className="dz-btn ghost" onClick={() => enterDaily(s)}><CalendarDays size={16} /> Mi práctica de hoy</button>
    </>); break;
    case 'today': body = (<>
      <p className="dz-lead">Hoy en <em>SPM</em> · Día {day}</p>
      <p className="dz-muted">SPM ya te conoce: hoy entrenamos con lo que nos contaste.</p>
      {cadenceNote && <p className="dz-note">{cadenceNote}</p>}
      {(prog.acute || s.health.includes('acute')) && <UrgentCard />}
      <button className="dz-btn ghost" onClick={() => go(`day:${day}`, origin)}>Ver el Día {day} completo</button>
      
      {today.length > 0 ? <div className="dz-route">{today.map((c) => (
        <Card key={c.practiceId} className="accent"><span className="dz-eyebrow">{c.durationOrScope}</span><h3>{c.title}</h3><p>{c.whyAssigned}</p><small className="dz-muted">Observamos: {c.targetMetric}</small>
          <button className="dz-btn gold" onClick={() => openPractice(c.practiceId, 'dailyPlan')}>Comenzar práctica <ArrowRight size={16} /></button></Card>
      ))}</div> : <div className="dz-lib">
        {([['Sensate Focus · 15 min', 'sensate'], ['Revisa tus aceleradores y frenos', 13], ['Registro rápido de cómo te sientes', 4]] as [string, View][]).map(([t, v]) => <button key={t} onClick={() => openFrom(v, 'dailyPlan')}><Sparkles size={16} /><span>{t}</span><ArrowRight size={14} /></button>)}
      </div>}
      <button className="dz-btn ghost" onClick={() => go(20)}>Ir al laboratorio completo</button>
    </>); break;
    case 'micro': body = (<>
      <p className="dz-lead">SPM ya te conoce. Solo {microQ.length === 1 ? 'un dato' : `${microQ.length} datos`} para elegir bien tu práctica de hoy.</p>
      {microQ.includes('health') && <Card><span className="dz-eyebrow">Salud general</span><p>¿Notas alguno de estos cambios recientes?</p><Chips opts={healthOpts} value={s.health} onChange={(v) => up('health', v)} /><button className="dz-btn ghost" onClick={() => up('health', ['none'])}>Ninguno</button></Card>}
      {microQ.includes('stimuli') && <Card><span className="dz-eyebrow">Aceleradores</span><p>¿Qué suele encender tu deseo?</p><Chips opts={stimuliOpts} value={s.stimuli} onChange={(v) => up('stimuli', v)} max={3} /></Card>}
      {microQ.includes('pressure') && <Card><Slider label="Presión por rendir estos días" value={s.pressure} onChange={(v) => up('pressure', v)} /></Card>}
      <button className="dz-btn gold" onClick={() => { logAssessment('micro'); startToday(s, false, day, wantP); setWantP(null); }}>Ir a mi práctica <ArrowRight size={16} /></button>
    </>); break;
    case 'sensate': body = (<>
      <p className="dz-lead">Contacto sin objetivo: atención a la <em>sensación</em>, no al resultado.</p>
      <ol className="dz-steps">{['Acuerden un tiempo tranquilo, sin prisa y sin la meta de tener relaciones.', 'Turnos de 10 minutos: uno toca, el otro recibe y solo observa.', 'Empiecen por zonas no genitales: manos, espalda, brazos.', 'Describan qué se sintió agradable, sin evaluar.', 'Si no tienes pareja, practica autocontacto consciente con la misma actitud.'].map((t) => <li key={t}>{t}</li>)}</ol>
      <Cue id={cueId('sensate-attention')}>Lleva la atención a la temperatura, la presión y la textura.</Cue>
    </>); break;
    case 'route': body = (<>
      <p className="dz-lead">Tu evaluación ya nos dio información útil. Ahora <em>SPM la convierte en acciones concretas</em>.</p>
      <p className="dz-muted">Hoy no necesitas trabajar todo. Empezaremos por lo que parece más relevante para ti.</p>
      {route.evaluation.rec === 'clinical-review' && <div className="dz-alert"><ShieldAlert size={18} /><p><b>Conviene una valoración médica.</b> {route.clinicalReviewReason.join(' ')} Mientras tanto, SPM limita tu ruta a prácticas suaves y de baja presión.</p></div>}
      <h3 className="dz-sub">Esto es lo que SPM va a trabajar contigo</h3>
      <div className="dz-route">{route.priorities.map((p, i) => { const pr = practices[p.id]!; const log = s.practiceLog[p.id]; return (
        <Card key={p.id} className="accent dz-prio"><span className="dz-eyebrow">Prioridad {i + 1} · {p.role === 'driver' ? 'Driver principal' : p.role === 'modifier' ? 'Modificador' : 'Transferencia'}</span>
          <dl><dt>Qué detectamos</dt><dd>{p.detected}</dd><dt>Por qué importa</dt><dd>{p.why}</dd><dt>Práctica asignada</dt><dd><b>{pr.title}</b> · {pr.duration}</dd><dt>Qué vamos a observar</dt><dd>{pr.metricLabel}</dd></dl>
          {log && <small className="dz-saved"><Check size={14} /> Realizada {log.done} {log.done === 1 ? 'vez' : 'veces'}</small>}
          <button className="dz-btn gold" onClick={() => openPractice(p.id, 'route')}>Comenzar práctica <ArrowRight size={16} /></button>
        </Card>); })}</div>
      {route.desireStrengths.length > 0 && <Card><span className="dz-eyebrow">Tus fortalezas</span><p>{route.desireStrengths.join(' · ')}</p></Card>}
      <Card><span className="dz-eyebrow">Siguiente paso</span><p>{route.nextAction}</p>{adaptation && <p className="dz-muted small">Último seguimiento ({adaptation.day}): {adaptText[adaptation.mode]} · Adherencia {adherence(s, route.assignedPractices)}%</p>}</Card>
      <div className="dz-row"><button className="dz-btn ghost" onClick={() => go('today', 'dailyPlan')}><CalendarDays size={16} /> Ver Hoy en SPM</button><button className="dz-btn ghost" onClick={() => go(16)}>Continuar al plan personal <ArrowRight size={16} /></button></div>
    </>); break;
    case 'context': body = (<>
      <p className="dz-lead">Prepara el terreno: el deseo responde al <em>contexto</em>.</p>
      <div className="dz-grid2">{['Tiempo sin prisa', 'Privacidad asegurada', 'Descanso previo', 'Ambiente cuidado (luz, temperatura)', 'Menos pantallas antes', 'Momento sin preocupaciones pendientes'].map((t) => <Card key={t}><p>{t}</p></Card>)}</div>
      <Card><label className="dz-field"><span>Mi contexto favorable</span><input className="dz-input" maxLength={140} value={s.context} onChange={(e) => up('context', e.target.value)} /></label></Card>
    </>); break;
  }

  if (isCycle) body = <CycleView view={String(view)} ctx={ctx} />;
  if (pid && practices[pid]) {
    const pri = route.priorities.find((x) => x.id === pid), tc = today.find((x) => x.practiceId === pid);
    body = <PracticeSheet key={`${pid}-${pDay}`} pid={pid} day={pDay} ctx={ctx} why={tc?.whyAssigned ?? (pri ? `${pri.detected} ${pri.why}` : undefined)} />;
  }
  if (pid && !practices[pid]) body = <p className="dz-muted">Esta práctica no existe. <button className="dz-btn ghost" onClick={() => go(20)}>Ir a Biblioteca</button></p>;
  const audio = typeof view === 'number' ? audioId(view) : cueId(view);
  return (
    <div className="dz">
      <header className="dz-top">
        <div className="dz-brand"><span className="dz-mark">S</span><span>SPM<small>DESIRE ACTIVATION LAB</small></span></div>
        {typeof view === 'number' && <span className="dz-count"><b>{String(view).padStart(2, '0')}</b> / 20</span>}
      </header>
      <nav className="dz-tabs" aria-label="Secciones">
        {([['cycle', 'Mi ciclo 28 días'], ['today', 'Hoy'], [20, 'Biblioteca'], ['progress28', 'Progreso'], [1, 'Recorrido 20 pantallas']] as [View, string][]).map(([v, l]) =>
          <button key={l} className={view === v ? 'on' : ''} onClick={() => { setRetPractice(''); setNotice(''); if (v === 'today') { origin === 'dailyPlan' ? go('today', 'dailyPlan') : ( (setToday(todayFor(s, prog, centralContext().day)), setDay(centralContext().day), go('today', 'dailyPlan'))); } else go(v, origin === 'dailyPlan' ? 'dailyPlan' : 'lab'); }}>{l}</button>)}
      </nav>
      {typeof view === 'number' && <div className="dz-progress"><span style={{ width: `${(view / 20) * 100}%` }} /></div>}
      <main className="dz-main" data-audio-id={audio}>
        {notice && <p className="dz-note" role="status">{notice}</p>}
        {retPractice && retPractice !== String(view) && <button className="dz-back" onClick={() => { const r = retPractice; setRetPractice(''); setView(r); }}><ArrowLeft size={16} /> Volver a la práctica</button>}
        {origin !== 'lab' && !(retPractice && retPractice !== String(view)) && (
          <button className="dz-back" onClick={() => origin === 'library' ? go(20, 'library') : origin === 'route' ? go('route') : origin === 'cycle' ? go(`day:${retDay}`) : go('today', 'dailyPlan')}>
            <ArrowLeft size={16} /> {origin === 'library' ? 'Volver a Biblioteca' : origin === 'route' ? 'Volver a Tu ruta SPM' : origin === 'cycle' ? `Volver al Día ${retDay}` : 'Volver a Hoy'}
          </button>
        )}
        {view !== 1 && <h2 className="dz-h">{heading}</h2>}
        <section className="dz-body" key={String(view)}>{(view === 1 || view === 20) && <DoctorDesireVideo />}{body}</section>
      </main>
      {origin === 'lab' && typeof view === 'number' && (
        <nav className="dz-foot" aria-label="Navegación del laboratorio">
          <button disabled={n <= 1} onClick={() => go(n - 1)}><ArrowLeft size={16} /> Anterior</button>
          <span>{screens[n - 1]}</span>
          <button disabled={n >= 20} onClick={() => go(n + 1)}>Siguiente <ArrowRight size={16} /></button>
        </nav>
      )}
      <footer className="dz-sitefoot">SPM · Salud sexual masculina · Contenido educativo, no diagnóstico</footer>
    </div>
  );
}

