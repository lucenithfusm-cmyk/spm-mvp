// SPM desire decision layer: evaluate → interpret → assign → practice → measure → adapt. Pure, browser-local, non-diagnostic.
import { curriculum, extraPractices } from './desire-curriculum';
import { evaluate, freqChange, fantasyOpts, metricsD0, barrierOpts, healthOpts, stimuliOpts, clampDay, type DesireState, type Metrics, type MetricsN } from './desire-data';

export type Role = 'driver' | 'modifier' | 'transfer';
export type Practice = { id: string; title: string; duration: string; metric: keyof Metrics | 'local'; metricLabel: string; steps: string[]; note?: string; link?: string; safe: boolean;
  purpose?: string; prep?: string; observe?: string; exit?: string; partnerVariant?: string; reflective?: boolean; requires?: string; resourceLinks?: string[]; fields?: [string, string][]; timer?: { seconds: number; phases: string[] } };

export const practices: Record<string, Practice> = {
  'visual-explore': { id: 'visual-explore', title: 'Autoexploración visual guiada', duration: '10–15 min', metric: 'desire', metricLabel: 'Deseo antes / después', safe: true,
    steps: ['Elige un lugar privado y acomódate. Prepara una imagen, una lectura con escenas que te atraigan o un recuerdo que quieras explorar.', 'Observa un detalle cada vez: una expresión, un color, una actitud o el ambiente de la escena. Nota qué llama tu atención y qué te resulta agradable.', 'Si te distraes, vuelve al detalle elegido. Puedes cambiar de imagen o recuerdo si prefieres explorar otra opción.', 'Al terminar, observa cómo te sentiste y qué detalle te gustaría recordar. Puedes anotarlo en Tu reflexión y registrar cómo estás después de la experiencia.'] },
  'sensory-focus': { id: 'sensory-focus', title: 'Focalización sensorial con contacto lento', duration: '15 min', metric: 'satisfaction', metricLabel: 'Disfrute / sensación', safe: true,
    steps: ['Acomódate y comienza con contacto suave en una zona no genital, como manos, brazos, cuello o espalda. Puedes hacerlo tú mismo o acordarlo con tu pareja.', 'Mueve la mano despacio. Observa la temperatura de la piel, su textura y cómo cambia la sensación al variar suavemente la presión.', 'Si recuerdas zonas agradables de tu mapa, dedica más atención a las que puedas explorar con comodidad. Con pareja, expresen qué contacto prefieren.', 'Al terminar, identifica una zona, un ritmo o una presión que te haya gustado. La práctica consiste en atender a las sensaciones, sin buscar una erección o un orgasmo.'] },
  'verbal-script': { id: 'verbal-script', title: 'Estímulo verbal y guion de comunicación', duration: '10 min', metric: 'desire', metricLabel: 'Deseo antes / después', safe: false,
    steps: ['Elige una voz, una frase o un tono que te resulte agradable. Puedes usar un audio, una lectura o un recuerdo y prestar atención a las palabras y a la forma de decirlas.', 'Piensa qué te gustaría escuchar o expresar. Si lo haces individualmente, escribe una frase para ti. Si quieres compartirlo, pregunta a tu pareja qué le gusta escuchar.', 'Antes de probar palabras nuevas juntos, acuerden cuáles les resultan cómodas y cuáles prefieren evitar. Usen sólo lo que ambos quieran.', 'Observa qué palabras o tonos despertaron interés o cercanía. Al terminar puedes anotarlos en Tu reflexión y registrar cómo te sentiste.'] },
  'fantasy-private': { id: 'fantasy-private', title: 'Imaginación y fantasía privada', duration: '10 min', metric: 'fantasies', metricLabel: 'Frecuencia de fantasías', safe: true,
    steps: ['Busca privacidad y una postura cómoda. Recuerda o imagina una escena que te resulte atractiva; puede partir de una lectura, una imagen o un recuerdo.', 'Presta atención a un detalle: el ambiente, una voz, el ritmo o una sensación. Observa qué te gusta de esa escena y permite que cambie si lo prefieres.', 'Al terminar, identifica qué detalle te gustaría recordar. Puedes escribir una observación breve en Tu reflexión sin describir la escena completa.'], note: 'Puedes mantener la fantasía privada; compartirla o llevarla a la práctica es una elección aparte.' },
  'responsive-window': { id: 'responsive-window', title: 'Contexto favorable + ventana de activación', duration: '20 min, 2 veces por semana', metric: 'desire', metricLabel: 'Deseo que aparece al empezar', safe: true,
    steps: ['Prepara un momento con privacidad y pocas interrupciones. Puedes consultar Condiciones y rutina previa para elegir qué te ayuda a estar cómodo.', 'Si te apetece explorar, elige un contacto o estímulo agradable, como una caricia, música o una imagen. Con pareja, acuerden la propuesta y el interés de ambos.', 'Mientras exploras, presta atención a la experiencia y observa si aparece comodidad, curiosidad o deseo. Puedes ajustar el estímulo según cómo te resulte.', 'Decide si quieres seguir explorando o cerrar la experiencia, según lo que te esté aportando. Al terminar, anota qué preparaste y qué notaste, haya aparecido deseo o no.'] },
  'reconnect-gradual': { id: 'reconnect-gradual', title: 'Reconexión gradual sin cuotas', duration: 'Semana completa', metric: 'frequency', metricLabel: 'Frecuencia y disfrute', safe: false,
    steps: ['Piensa qué momento de cercanía te gustaría compartir durante esta semana: una conversación tranquila, un abrazo o un contacto que ambos quieran.', 'Propón un encuentro y acuerden qué les apetece. El encuentro puede quedarse en esa forma de cercanía.', 'Durante la semana, observa si disfrutas esos momentos y si te apetece repetirlos. Aumenta su frecuencia sólo cuando el disfrute y el interés acompañen.', 'Hoy puedes anotar la propuesta en Tu reflexión. Al final de la semana, registra cómo fueron la frecuencia y el disfrute para decidir qué quieres mantener.'] },
  'pleasure-lowpressure': { id: 'pleasure-lowpressure', title: 'Placer con baja presión', duration: '15 min', metric: 'satisfaction', metricLabel: 'Disfrute / satisfacción', safe: true,
    steps: ['Elige una sensación que te resulte agradable, como el contacto suave en las manos o los brazos. Acomódate y lleva la atención a esa zona.', 'Explora despacio, con pausas para notar la temperatura, la textura y la presión. Mantén el contacto que te guste y ajusta lo que resulte incómodo.', 'Si aparece dolor o malestar, detén la práctica y anota lo ocurrido para comentarlo con un profesional.', 'Al terminar, recuerda qué momento resultó agradable. Puedes escribirlo en Tu reflexión y registrar cómo fue el disfrute.'] },
  'micro-regulation': { id: 'micro-regulation', title: 'Microregulación: respiración y presión baja', duration: '3–5 min diarios', metric: 'pressure', metricLabel: 'Presión por rendimiento', safe: true,
    steps: ['Acomódate sentado o recostado. Toma aire con comodidad y suéltalo despacio, dejando que la salida dure un poco más que la entrada, sin forzar el ritmo.', 'Al soltar el aire, afloja los hombros, la mandíbula y la zona pélvica, sin apretar ni hacer fuerza. Nota si puedes dejar el cuerpo más suelto.', 'Si aparece una exigencia como tengo que rendir, reconócela y vuelve a la respiración. Al terminar, observa cómo se siente la presión y qué te ayudó a volver al momento.'], link: 'Puedes encontrar más prácticas de respiración en el programa de Confianza.' },
  'lifestyle-modifiers': { id: 'lifestyle-modifiers', title: 'Modificadores: sueño, movimiento, nutrición', duration: 'Hábito semanal', metric: 'energy', metricLabel: 'Energía / ánimo', safe: true,
    steps: ['Revisa cómo fue tu descanso esta semana. Piensa qué ajuste concreto te ayudaría a mantener un horario regular y reducir las pantallas antes de dormir.', 'Revisa también cómo te moviste y cómo organizaste tus comidas. Sigue el movimiento que corresponda a tu hábito o recurso SPM y busca horarios de comida regulares; considera reducir el alcohol, especialmente de noche.', 'En Estrategias puedes consultar las ideas de apoyo. Elige los ajustes que quieras llevar a tu semana y escríbelos en Tu reflexión con un momento concreto para realizarlos.', 'Durante la semana, observa cómo te sientes de energía y ánimo. Al volver a practicar, revisa qué ajuste pudiste mantener y cuál necesitas adaptar.'] },
  'connection-talk': { id: 'connection-talk', title: 'Conversación y conexión', duration: '15 min', metric: 'closeness', metricLabel: 'Comunicación / cercanía', safe: true,
    steps: ['Elige un momento tranquilo, fuera de una situación íntima. Si quieres conversar con tu pareja, pregunta si le viene bien hablar; también puedes hacer la práctica por escrito para ti.', 'Expresa algo que hayas notado y algo que te ayude: por ejemplo, yo noto que me distraigo cuando estoy cansado; a mí me ayuda tener un rato sin interrupciones.', 'Si conversan, pregunta qué ayuda a la otra persona a sentirse cerca y escucha su respuesta. Elijan una idea que ambos quieran probar.', 'En Descubre qué excita a tu pareja puedes anotar los hallazgos o usar la alternativa individual. Vuelve a la práctica y registra cómo te sentiste al expresar tus ideas.'], note: 'La alternativa individual permite preparar lo que te gustaría comunicar.' },
};

type Cand = { id: string; role: Role; w: number; detected: string; why: string };
const lbl = (opts: readonly (readonly [string, string, ...unknown[]])[], ids: string[]) => ids.map((i) => opts.find((o) => o[0] === i)?.[1]).filter(Boolean) as string[];

export function interpret(s: DesireState) {
  const e = evaluate(s);
  const st = new Set(s.stimuli), c: Cand[] = [];
  const fIdx = fantasyOpts.indexOf(s.fantasyFreq);
  const ch = freqChange(s);
  const stressBrake = s.barriers.includes('stress') || s.barriers.includes('pressure') || s.brakes.some((b) => ['Miedo a fallar', 'Autoexigencia', 'Estrés laboral', 'Preocupaciones'].includes(b));
  if (st.has('visual')) c.push({ id: 'visual-explore', role: 'driver', w: 3, detected: 'El estímulo visual está entre tus aceleradores.', why: 'Usar un acelerador que ya funciona facilita que el deseo aparezca.' });
  if (st.has('tactile') || st.has('slow') || st.has('zones') || s.zones.length) c.push({ id: 'sensory-focus', role: 'driver', w: 3 + (st.has('slow') ? 1 : 0), detected: `Respondes al contacto${s.zones.length ? ` (${s.zones.length} zonas marcadas)` : ''}${st.has('slow') ? ', sobre todo lento' : ''}.`, why: 'La atención sensorial amplifica la excitación y baja la presión.' });
  if (st.has('verbal') || st.has('auditory')) c.push({ id: 'verbal-script', role: 'driver', w: 2, detected: 'Las palabras o la voz te activan.', why: 'Es un canal de estímulo que puede cultivarse, solo o en pareja con consentimiento.' });
  if (s.fantasiesNow === 'yes' || fIdx >= 2) c.push({ id: 'fantasy-private', role: 'driver', w: 2 + (ch !== null && ch <= -25 ? 1 : 0), detected: 'Conservas fantasías sexuales.', why: 'Tu imaginación sigue activa: es un recurso interno de deseo.' });
  if (s.baseline.desire <= 4 || s.fantasiesTrend === 'down' || (fIdx >= 0 && fIdx <= 1)) c.push({ id: 'responsive-window', role: 'driver', w: 3, detected: 'Tu deseo parece más responsivo que espontáneo.', why: 'Muchas veces las ganas llegan después de empezar, si el contexto ayuda.' });
  if (s.enjoyment === 'no' || s.enjoyment === 'sometimes' || s.baseline.satisfaction <= 4) c.push({ id: 'pleasure-lowpressure', role: 'driver', w: 4, detected: 'El disfrute está bajo o es irregular.', why: 'Sin disfrute el deseo pierde motivo; primero recuperamos el placer.' });
  if (ch !== null && ch <= -25) c.push({ id: 'reconnect-gradual', role: 'transfer', w: 3, detected: `Tu frecuencia bajó ${Math.abs(ch)}% respecto a antes.`, why: 'Reconectar gradualmente evita la presión de "recuperar" de golpe.' });
  if (stressBrake || s.pressure >= 6 || s.baseline.stress >= 7) c.push({ id: 'micro-regulation', role: 'modifier', w: 2 + (s.pressure >= 6 ? 1 : 0) + (s.baseline.stress >= 7 ? 1 : 0), detected: 'El estrés o la presión por rendir funcionan como freno.', why: 'La presión activa el sistema de alerta, que apaga el deseo.' });
  const tired = s.barriers.includes('tired') || s.health.includes('fatigue') || s.health.includes('sleep') || s.baseline.energy <= 4 || s.baseline.sleep <= 4;
  if (tired) c.push({ id: 'lifestyle-modifiers', role: 'modifier', w: 2 + (s.baseline.energy <= 3 ? 1 : 0), detected: 'Cansancio, sueño o baja energía están presentes.', why: 'Sin energía el cuerpo prioriza descansar antes que desear.' });
  if (s.rel.communication <= 4 || s.rel.closeness <= 4) c.push({ id: 'connection-talk', role: 'transfer', w: 3, detected: 'La comunicación o la cercanía están bajas.', why: 'La conexión emocional es uno de los principales aceleradores del deseo.' });
  if (!c.some((x) => x.role === 'driver')) c.push({ id: 'responsive-window', role: 'driver', w: 1, detected: 'Aún no hay aceleradores claros.', why: 'Crear un contexto favorable es el mejor punto de partida.' });

  const clinical = e.rec === 'clinical-review';
  const pool = (clinical ? c.filter((x) => practices[x.id]!.safe) : c).sort((a, b) => b.w - a.w);
  if (clinical && !pool.some((x) => x.id === 'micro-regulation')) pool.push({ id: 'micro-regulation', role: 'modifier', w: 1, detected: 'Mientras esperas la valoración, conviene bajar la presión.', why: 'Prácticas suaves y de baja presión, sin exigencias de rendimiento.' });
  if (clinical && !pool.some((x) => x.id === 'sensory-focus')) pool.push({ id: 'sensory-focus', role: 'driver', w: 0, detected: 'Un contacto lento y sin objetivo mantiene la conexión con tu cuerpo.', why: 'Es una práctica suave, compatible con esperar la valoración.' });
  const chosen: Cand[] = [];
  for (const r of ['driver', 'modifier', 'transfer'] as Role[]) { const x = pool.find((p) => p.role === r && !chosen.some((q) => q.id === p.id)); if (x) chosen.push(x); }
  for (const x of pool) { if (chosen.length >= 3) break; if (!chosen.some((q) => q.id === x.id)) chosen.push(x); }
  const priorities = chosen.slice(0, 3);

  const desireDrivers = [...lbl(stimuliOpts, s.stimuli), ...s.accelerators];
  const desireModifiers = [...lbl(barrierOpts, s.barriers), ...s.brakes, ...lbl(healthOpts, s.health.filter((h) => ['fatigue', 'sleep', 'mood', 'postmeal'].includes(h)))];
  const desireStrengths = [
    s.fantasiesNow === 'yes' || fIdx >= 2 ? 'Fantasías activas' : '', s.enjoyment === 'yes' ? 'Disfrutas cuando hay actividad' : '',
    s.rel.closeness >= 7 ? 'Buena cercanía emocional' : '', s.rel.communication >= 7 ? 'Buena comunicación sexual' : '',
    s.accelerators.length >= 2 ? 'Aceleradores identificados' : '', s.baseline.confidence >= 7 ? 'Confianza sexual' : '',
  ].filter(Boolean);
  const primary = priorities[0], secondary = priorities[1];
  return {
    evaluation: e, priorities,
    desireDrivers, desireModifiers, desireStrengths,
    primaryTrainingTarget: primary ? practices[primary.id]!.title : '',
    secondaryTrainingTarget: secondary ? practices[secondary.id]!.title : '',
    assignedPractices: priorities.map((p) => p.id),
    clinicalReviewReason: clinical ? e.reasons : [],
    nextAction: clinical ? 'Agenda una valoración médica y mantén solo prácticas suaves.' : primary ? `Comienza hoy: ${practices[primary.id]!.title}.` : 'Completa tu evaluación.',
  };
}

export type TodayCard = { title: string; whyAssigned: string; practiceId: string; durationOrScope: string; targetMetric: string; origin: 'dailyPlan'; role?: Role; day?: number; observe?: string };
export type Personal = { details?: Record<string, string[]>; conditions?: string[]; accel?: string[]; brake?: string[]; influence?: Record<string, number | null>; nextPractice?: string };
export type TodayOpts = { hasPartner?: boolean | undefined; sensateIOk?: boolean; best?: string[]; ranking?: string[]; acute?: boolean; baseline?: MetricsN | null | undefined; sessions?: SessionLite[]; personal?: Personal };
export type SessionLite = { practiceId: string; status: string };

/** Stable ranking IDs (B P7). Legacy Spanish labels are normalized to these ids. */
export const rankItems: [string, string, string | null][] = [
  ['partner-visual', 'Ver a mi pareja (si aplica)', 'visual-explore'], ['touch', 'Tocar / ser tocado', 'sensory-focus'], ['words', 'Palabras sugerentes', 'verbal-script'],
  ['massage', 'Masajes', 'sensory-focus'], ['fantasy', 'Fantasías', 'fantasy-private'], ['foreplay', 'Juego previo prolongado', 'foreplay-rhythm'],
  ['ambience', 'Ambientes específicos', 'context-design'], ['other', 'Otras', null],
];
export const rankLabel = (id: string) => rankItems.find((r) => r[0] === id)?.[1] ?? id;
export const normalizeRankId = (x: string) => rankItems.find((r) => r[0] === x || r[1] === x)?.[0] ?? x;
const partnerOnly = new Set(['reconnect-gradual']);
const stimChannel: Record<string, string> = { visual: 'visual-explore', tactile: 'sensory-focus', slow: 'sensory-focus', zones: 'sensory-focus', foreplay: 'foreplay-rhythm', verbal: 'verbal-script', auditory: 'verbal-script', fantasy: 'fantasy-private', context: 'context-design' };
const detailChannel: Record<string, string> = { visual: 'visual-explore', tactile: 'sensory-focus', verbal: 'verbal-script', fantasy: 'fantasy-private', context: 'context-design' };
const pressureBrakes = ['Estrés', 'Presión', 'Miedo a fallar', 'Estrés laboral', 'Autoexigencia', 'Preocupaciones'];

/** Day-9 channel choice from real data: ranking (by priority) → detailed channel selections → screen-6 stimuli. */
export function pickChannel(s: DesireState, o: TodayOpts, ok: (id: string) => boolean): { id: string; why: string } {
  for (const [i, r] of (o.ranking ?? []).map(normalizeRankId).entries()) {
    const it = rankItems.find((x) => x[0] === r), ch = it?.[2];
    if (ch && ok(ch)) return { id: ch, why: `En tu lista de excitación, el puesto ${i + 1} es «${it![1]}»${r === 'partner-visual' && o.hasPartner !== true ? ' (versión individual)' : ''}.` };
  }
  const det = Object.entries(o.personal?.details ?? {}).filter(([k, v]) => detailChannel[k] && v.length).sort((a, b) => b[1].length - a[1].length)[0];
  if (det && ok(detailChannel[det[0]]!)) return { id: detailChannel[det[0]]!, why: `Marcaste detalles concretos: ${det[1].slice(0, 3).join(', ')}.` };
  const st = s.stimuli.find((k) => stimChannel[k] && ok(stimChannel[k]!));
  if (st) return { id: stimChannel[st]!, why: `Elegiste «${stimuliOpts.find((x) => x[0] === st)?.[1] ?? st}» como estímulo que te activa.` };
  return { id: 'sensory-focus', why: 'Aún no hay un canal preferido registrado: empezamos por contacto lento.' };
}

/** Visible personalization from saved selections. Descriptive only — no clinical claims. */
export function personalLines(pid: string, s: DesireState, p: Personal = {}, hasPartner?: boolean): string[] {
  const d = p.details ?? {}, L: string[] = [];
  const add = (k: string, t: string) => { const v = d[k]; if (v?.length) L.push(`${t}: ${v.join(', ')}.`); };
  if (['sensory-focus', 'sensate-1', 'sensate-2', 'body-awareness', 'foreplay-rhythm', 'pleasure-lowpressure'].includes(pid)) {
    add('tactile', 'Contacto que marcaste (zonas, ritmo, presión)');
    if (s.zones.length) L.push(`Zonas de tu mapa corporal: ${s.zones.length} seleccionadas — dedica más tiempo a ellas${pid === 'sensate-1' ? ' (solo las no genitales en fase I)' : ''}.`);
  }
  if (pid === 'visual-explore') add('visual', 'Detalles visuales que marcaste');
  if (pid === 'verbal-script') add('verbal', 'Lo que te activa escuchar');
  if (pid === 'fantasy-private') add('fantasy', 'Recursos de fantasía que marcaste');
  if (['context-design', 'breath-routine', 'activation-plan', 'responsive-window', 'autonomous-rehearsal'].includes(pid)) {
    if (p.conditions?.length) L.push(`Tus condiciones favorables: ${p.conditions.join(', ')}.`);
    add('context', 'Contexto que marcaste');
    const acc = [...new Set([...(p.accel ?? []), ...s.accelerators])]; if (acc.length) L.push(`Incluye un acelerador tuyo: ${acc.slice(0, 3).join(', ')}.`);
  }
  if (['micro-regulation', 'breath-routine', 'presence-5', 'no-desire-today', 'flex-script'].includes(pid)) {
    const br = [...new Set([...(p.brake ?? []), ...s.brakes])]; if (br.length) L.push(`Freno a observar hoy: ${br[0]}.`);
  }
  if (['communicate-limits', 'connection-talk', 'verbal-script'].includes(pid) && hasPartner !== true) L.push('Sin pareja registrada: usa la variante individual (escribirlo para ti).');
  if (pid === 'communicate-limits' && hasPartner === true && d['partnerFavors']?.length) L.push(`Lo que favorece a tu pareja: ${d['partnerFavors'].join(', ')}.`);
  return L;
}

/** Day-aware daily plan: main = curriculum day (resolved by profile), + modifier + transfer from the route. Max 3. */
export function generateToday(s: DesireState, dayIn: unknown = 1, o: TodayOpts = {}): TodayCard[] {
  if (o.acute) return [];
  const day = clampDay(dayIn);
  const r = interpret(s), clinical = r.evaluation.rec === 'clinical-review';
  const cd = curriculum[day - 1]!;
  const pr = o.personal ?? {};
  const s2ok = o.sensateIOk === true && !clinical && !o.acute && !s.health.includes('acute') && s.pressure < 7;
  const ok = (id: string) => !!practices[id] && (!clinical || practices[id]!.safe) && !(o.hasPartner !== true && partnerOnly.has(id)) && (id !== 'sensate-2' || s2ok);
  let main = cd.practiceId, mainWhy = '';
  if (main === '@channel') { const c = pickChannel(s, o, ok); main = c.id; mainWhy = c.why; }
  if (main === '@best') { main = (o.best ?? []).find(ok) ?? r.assignedPractices.find(ok) ?? 'responsive-window'; mainWhy = o.best?.length ? 'Es la práctica con mejor utilidad en tus registros.' : 'Aún no hay registros suficientes: usamos tu ruta asignada.'; }
  if (main === 'sensate-2' && !s2ok) { main = 'sensate-1'; mainWhy = 'La fase II aún no se abre: repetimos la fase I sin castigo.'; }
  if (!ok(main)) main = 'presence-5';
  const ids = [main], whys: Record<string, string> = { [main]: mainWhy };
  if (day === 22) {
    const top = (o.best ?? []).filter(ok).slice(0, 2);
    for (const b of top) if (!ids.includes(b)) ids.push(b);
    if (top.length < 2) whys[main] = `${mainWhy} Solo hay ${top.length} activador${top.length === 1 ? '' : 'es'} con registros útiles y aptos hoy; no completamos con supuestos.`;
  }
  const brakeHit = [...(pr.brake ?? []), ...s.brakes].find((b) => pressureBrakes.includes(b));
  const infl = pr.influence?.['stress'];
  let mod = r.priorities.find((p) => p.role === 'modifier' && ok(p.id))?.id;
  if (!mod && (brakeHit || (typeof infl === 'number' && infl >= 7) || pr.nextPractice === 'brake' || s.pressure >= 6)) {
    mod = 'micro-regulation';
    whys[mod] = brakeHit ? `Marcaste «${brakeHit}» como freno.` : typeof infl === 'number' && infl >= 7 ? `El estrés influye ${infl}/10 en tu deseo.` : pr.nextPractice === 'brake' ? 'Elegiste reducir un freno como siguiente práctica.' : `Tu presión por rendir es ${s.pressure}/10.`;
  }
  if (mod && !ids.includes(mod) && ids.length < 3) ids.push(mod);
  let tr = r.priorities.find((p) => p.role === 'transfer' && ok(p.id) && !ids.includes(p.id))?.id;
  if (!tr && pr.nextPractice === 'talk' && !ids.includes('communicate-limits')) { tr = 'communicate-limits'; whys[tr] = `Elegiste conversar sobre un estímulo útil${o.hasPartner === true ? '' : ' (variante individual)'}.`; }
  if (tr && day >= 8 && ids.length < 3) ids.push(tr);
  const src = adapt(s, o.baseline, o.sessions)?.practices ?? r.assignedPractices;
  for (const x of src) if (ids.length < 2 && ok(x) && !ids.includes(x)) ids.push(x);
  return ids.slice(0, 3).map((id, i) => {
    const p = practices[id]!, pri = r.priorities.find((x) => x.id === id);
    const extra = whys[id] || pri?.detected || '';
    const why = i === 0 ? `Día ${day} · ${cd.phase}: ${cd.objective}.${extra ? ' ' + extra : ''}` : extra || 'Ajustado según tu seguimiento.';
    return { title: p.title, whyAssigned: why, practiceId: id, durationOrScope: p.duration, targetMetric: p.metricLabel, origin: 'dailyPlan', role: i === 0 ? 'driver' : pri?.role ?? 'modifier', day, observe: p.observe ?? p.metricLabel };
  });
}

export type AdaptMode = 'progress' | 'repeat' | 'change-target' | 'regulate' | 'clinical-review' | 'insufficient';
export const adaptText: Record<AdaptMode, string> = {
  progress: 'Sugerencia revisable: hay mejoras en varios valores; mantenemos lo que funciona.',
  repeat: 'Aún hay poca práctica completada: repetimos la misma ruta.',
  'change-target': 'Practicaste, pero sin cambio claro: proponemos cambiar el objetivo principal.',
  regulate: 'Subió la presión o bajó la energía: priorizamos regulación.',
  'clinical-review': 'Las señales sugieren priorizar una valoración médica.',
  insufficient: 'Sin línea base o sin datos comparables: no hay comparación todavía. Continuamos con la ruta adaptada.',
};
/** Legacy practiceLog (old version) + completed sessions (new diary). They never overlap, so no double count. Paused/interrupted don't count. */
export function adherence(s: DesireState, ids: string[], sessions: SessionLite[] = []) {
  if (!ids.length) return 0;
  const done = ids.reduce((a, id) => a + Math.min(3, (s.practiceLog[id]?.done ?? 0) + sessions.filter((x) => x.practiceId === id && x.status === 'completed').length), 0);
  return Math.round((done / (ids.length * 3)) * 100);
}
/** Diffs only where both baseline and checkpoint have a value. Never substitutes the mutable current state for the frozen baseline. */
export function deltas(base: MetricsN | null | undefined, m: MetricsN): Partial<Record<keyof Metrics, number>> {
  if (!base) return {};
  const o: Partial<Record<keyof Metrics, number>> = {};
  for (const k of Object.keys(m) as (keyof Metrics)[]) { const a = base[k], b = m[k]; if (typeof a === 'number' && typeof b === 'number') o[k] = Math.round((b - a) * 10) / 10; }
  return o;
}
export function adapt(s: DesireState, baseline?: MetricsN | null, sessions: SessionLite[] = []) {
  const last = [...s.checkins].sort((a, b) => a.day.localeCompare(b.day)).pop();
  if (!last) return null;
  const r = interpret(s), ids = r.assignedPractices;
  const adh = adherence(s, ids, sessions);
  const dl = deltas(baseline, last.metrics), has = Object.keys(dl).length > 0;
  const improved = (['desire', 'satisfaction', 'closeness'] as const).filter((k) => (dl[k] ?? 0) >= 1).length + ((dl.pressure ?? 0) <= -1 ? 1 : 0);
  let mode: AdaptMode;
  if (r.evaluation.rec === 'clinical-review') mode = 'clinical-review';
  else if ((dl.pressure ?? 0) >= 2 || (dl.energy ?? 0) <= -2) mode = 'regulate';
  else if (!has) mode = 'insufficient';
  else if (adh < 50) mode = 'repeat';
  else if (improved >= 2) mode = 'progress';
  else mode = 'change-target';
  let next = [...ids];
  if (mode === 'regulate' && !next.includes('micro-regulation')) next = ['micro-regulation', ...next].slice(0, 3);
  if (mode === 'change-target') {
    const fresh = Object.keys(practices).filter((id) => !ids.includes(id) && ['responsive-window', 'sensory-focus', 'fantasy-private'].includes(id));
    if (fresh[0]) next = [fresh[0], ...ids.slice(1)].slice(0, 3);
  }
  if (mode === 'clinical-review') next = ids.filter((id) => practices[id]!.safe);
  const brakesReduced = s.brakes.filter((b) => !last.brakesActive.includes(b));
  return { mode, day: last.day, adherence: adh, practices: next, brakesReduced, accelUsed: last.accelUseful, deltas: dl };
}

const legacySheet: Record<string, Partial<Practice>> = {
  'visual-explore': { purpose: 'Reconocer qué detalles visuales te resultan agradables.', prep: 'Prepara una imagen, una lectura o un recuerdo en un lugar privado.', observe: 'Qué detalle te interesó y cómo te sentiste.' },
  'sensory-focus': { purpose: 'Explorar sensaciones mediante contacto lento.', prep: 'Elige un lugar con temperatura y postura cómodas.', observe: 'Qué zonas, ritmo y presión te resultaron agradables.' },
  'verbal-script': { purpose: 'Explorar palabras y tonos que te resultan agradables.', prep: 'Elige una frase, un audio o una lectura que quieras explorar.', observe: 'Qué palabras o tonos despertaron interés o cercanía.', partnerVariant: 'Si no tienes pareja o no quieres involucrarla: escribe para ti la frase que te gustaría escuchar o expresar.' },
  'fantasy-private': { purpose: 'Explorar tu imaginación y reconocer lo que te atrae.', prep: 'Busca privacidad y una postura cómoda.', observe: 'La frecuencia de fantasías que quieras registrar.' },
  'responsive-window': { purpose: 'Explorar cómo aparece el interés durante una experiencia elegida.', prep: 'Prepara privacidad, tiempo sin interrupciones y un estímulo agradable.', observe: 'Si apareció comodidad, curiosidad o interés y en qué momento.', resourceLinks: ['r:conditions', 'r:concepts'] },
  'reconnect-gradual': { purpose: 'Planear momentos de cercanía y observar cómo te resultan.', prep: 'Piensa en una propuesta sencilla que quieras compartir.', observe: 'Cómo fueron la frecuencia y el disfrute durante la semana.' },
  'pleasure-lowpressure': { purpose: 'Reconocer sensaciones agradables y el contacto que prefieres.', prep: 'Elige una zona y un contacto que te resulten cómodos.', observe: 'Qué disfrutaste y qué preferiste ajustar.' },
  'micro-regulation': { purpose: 'Practicar una forma de volver a la respiración cuando aparece presión.', prep: 'Busca una postura cómoda para respirar con tranquilidad.', observe: 'Cómo se siente la presión al terminar.', timer: { seconds: 300, phases: ['Respirar 4–6', 'Soltar tensión', 'Dejar pasar el pensamiento'] } },
  'lifestyle-modifiers': { purpose: 'Elegir ajustes de descanso, movimiento y alimentación para tu semana.', prep: 'Recuerda cómo fueron tus hábitos durante los últimos días.', observe: 'Qué cambios pudiste mantener y cómo te sentiste de energía.', resourceLinks: ['r:strategies'] },
  'connection-talk': { purpose: 'Expresar lo que te ayuda a sentir cercanía y escuchar preferencias.', prep: 'Elige un momento tranquilo para conversar o escribir.', observe: 'Cómo te sentiste al comunicar tus ideas.', resourceLinks: ['r:partner'] },
};

Object.assign(practices, extraPractices);
for (const [id, x] of Object.entries(legacySheet)) { const p = practices[id]; if (p) for (const [k, v] of Object.entries(x)) if ((p as Record<string, unknown>)[k] === undefined) (p as Record<string, unknown>)[k] = v; }
for (const p of Object.values(practices)) p.exit ??= 'Cuando termines, puedes anotar qué te resultó útil y qué quieres repetir o adaptar.';

