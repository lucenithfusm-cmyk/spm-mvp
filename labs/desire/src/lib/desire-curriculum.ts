// SPM Desire 28-day curriculum (ENTENDER 1–7 · ENTRENAR 8–14 · APLICAR 15–21 · CONSOLIDAR 22–28).
// Each day: Aprender → Practicar → Medir → Aplicar → Completar. Pure data, auditable; no dependencies.
import type { Practice } from './desire-engine';

export type Phase = 'ENTENDER' | 'ENTRENAR' | 'APLICAR' | 'CONSOLIDAR';
export type CurriculumDay = {
  day: number; phase: Phase; title: string; objective: string;
  learn: string; practice: string; measure: string; apply: string; complete: string;
  practiceId: string;            // catalog id, or a dynamic token resolved by the engine ('@channel', '@best')
  resources: string[];           // resource view ids (r:*) or lab screens (s:N)
  desireSpecific: boolean;       // true for the 14 Desire-specific days from SPM Master
  checkpoint?: 'D14' | 'D28' | undefined;
};

export const phaseOf = (d: number): Phase => (d <= 7 ? 'ENTENDER' : d <= 14 ? 'ENTRENAR' : d <= 21 ? 'APLICAR' : 'CONSOLIDAR');
const D = (day: number, title: string, objective: string, learn: string, practice: string, measure: string, apply: string, practiceId: string, resources: string[], desireSpecific = false, checkpoint?: 'D14' | 'D28'): CurriculumDay =>
  ({ day, phase: phaseOf(day), title, objective, learn, practice, measure, apply, complete: 'Registra cómo fue y marca el día cuando lo sientas cerrado. Abrir el día no lo completa.', practiceId, resources, desireSpecific, checkpoint });

export const curriculum: CurriculumDay[] = [
  D(1, 'Tu punto de partida', 'Leer tu perfil previo y entender las dos formas del deseo', 'Deseo espontáneo ("me dan ganas") y responsivo ("me voy conectando"). Ninguno es mejor.', 'Explora las dos formas y elige cuál se parece más a ti hoy.', 'Confirma tu línea base (se congela).', 'Observa esta semana cuándo aparece el interés.', 'concept-forms', ['r:concepts', 'progress28', 's:2', 's:4']),
  D(2, 'Tu patrón y tus contextos', 'Ver qué influye en tu deseo', 'El deseo responde al contexto: descanso, estrés, conexión, estímulos.', 'Completa el mapa de influencia 0–10.', 'Influencia de cada factor (N/A permitido).', 'Detecta un contexto que te ayudó.', 'pattern-observe', ['r:influence', 's:3']),
  D(3, 'Respirar y soltar presión', 'Una rutina breve antes de cualquier intimidad', 'La presión activa la alerta y frena el deseo.', 'Rutina: soltar presión → respirar cómodo → elegir conexión.', 'Presión antes/después.', 'Usa la rutina una vez antes de dormir.', 'breath-routine', ['r:conditions']),
  D(4, 'Atención sin examen', 'Practicar presencia sin evaluarte', 'Observar no es examinarse: la atención curiosa baja la exigencia.', 'Práctica guiada de presencia: 5 minutos.', 'Presión antes/después.', 'Nota un momento del día en que estuviste presente.', 'presence-5', []),
  D(5, 'Aceleradores y frenos', 'Construir tu mapa y elegir prioridades', 'Lo que suma (aceleradores) y lo que resta (frenos) se combinan.', 'Selecciona aceleradores y frenos y guarda sugerencias.', 'Cuántos aceleradores/frenos reconoces.', 'Elige un freno pequeño a reducir mañana.', 'map-select', ['r:map', 's:13'], true),
  D(6, 'Conciencia corporal', 'Reconocer zonas y soltar tensión (sin Kegels automáticos)', 'El cuerpo tenso percibe menos.', 'Recorrido corporal con tu mapa de zonas.', 'Comodidad corporal antes/después.', 'Suelta hombros y mandíbula dos veces hoy.', 'body-awareness', ['s:7']),
  D(7, 'Síntesis semana 1', 'Ordenar tu repertorio y elegir foco para la semana 2', 'Lo que ya sabes de ti es la base del entrenamiento.', 'Ordena tu lista de excitación (máx. 5) y elige foco.', 'Reflexión escrita.', 'Comparte o guarda tu foco.', 'week-review', ['r:ranking', 'r:details']),
  D(8, 'Reactivación I', 'Deseo responsivo sin obligación', 'Las ganas pueden llegar después de empezar, si el contexto ayuda.', 'Ventana de activación breve, sin meta.', 'Deseo que aparece al empezar.', 'Repite si fue cómoda; si no, ajusta contexto.', 'responsive-window', ['r:concepts'], true),
  D(9, 'Autoexploración por tu canal', 'Explorar el canal más relevante de tu perfil', 'Cada persona tiene canales distintos: ver, tocar, escuchar, fantasía.', 'Práctica del canal prioritario de tu ranking.', 'Deseo antes/después.', 'Anota zonas, ritmo o detalles que te gustaron.', '@channel', ['r:details', 's:6']),
  D(10, 'Reactivación II: repertorio', 'Ampliar ideas según tu perfil', 'Variar estímulos mantiene la atención erótica.', 'Prueba una idea nueva del repertorio y regístrala.', 'Utilidad de la idea (0–10).', 'Guarda las que sirvieron.', 'repertoire-try', ['r:ideas'], true),
  D(11, 'Si hoy no aparece el deseo', 'Flexibilidad y recuperación sin culpa', 'Un día sin deseo no es un fracaso: es información.', 'Plan de recuperación: detener exigencia y elegir algo agradable.', 'Presión antes/después.', 'Usa la frase: "hoy solo cercanía".', 'no-desire-today', ['r:strategies']),
  D(12, 'Planifica tu ventana', 'Momento, privacidad, energía y contexto', 'El deseo responsivo agradece un terreno preparado.', 'Diseña una ventana de activación con duración flexible.', 'Deseo esperado vs. real.', 'Agenda la ventana sin obligarte a usarla.', 'activation-plan', ['r:conditions'], true),
  D(13, 'Confianza para volver a sentir', 'Evidencias reales y cambios con la edad', 'Tu sexualidad evoluciona: más contexto no es menos deseo.', 'Escribe 3 evidencias propias de interés reciente.', 'Confianza (0–10).', 'Relee tus evidencias antes de una ventana.', 'evidence-confidence', ['r:age', 's:2'], true),
  D(14, 'Checkpoint semana 2', 'Revisión central de SPM y adaptación', 'SPM compara con tu línea base y ajusta la ruta.', 'Checkpoint central (en lab: simulación rotulada).', 'Métricas del checkpoint.', 'Recibe tu ruta adaptada.', 'week-review', ['s:17'], false, 'D14'),
  D(15, 'Escalera de intimidad', 'Avanzar solo según comodidad y consentimiento', 'Cercanía → contacto sensual → mayor erotismo → actividad más amplia. No hay avance automático.', 'Elige el peldaño cómodo de hoy.', 'Presión y comodidad.', 'Quédate o baja de peldaño cuando quieras.', 'intimacy-ladder', ['r:ladder'], true),
  D(16, 'Sensate Focus I', 'Contacto no genital, atención a la sensación', 'Tocar sin objetivo devuelve el foco al placer.', 'Sesión guiada (individual o en pareja).', 'Disfrute antes/después.', 'Anota qué sensación fue agradable.', 'sensate-1', ['sensate'], true),
  D(17, 'Ritmo y juego previo', 'Juego previo consciente', 'Más tiempo y ritmo variable suelen facilitar la excitación.', 'Explora ritmo; aumenta solo si hay interés, reduce con presión.', 'Disfrute antes/después.', 'Mantén un ritmo que te resultó agradable.', 'foreplay-rhythm', ['r:ideas']),
  D(18, 'Comunicar deseo y límites', 'Expresar gustos y límites (pareja opcional)', 'Hablar de lo que gusta y no gusta crea seguridad.', 'Guion de conversación o escrito individual.', 'Cercanía antes/después.', 'Usa una frase en primera persona.', 'communicate-limits', ['r:partner'], true),
  D(19, 'Sensate Focus II', 'Ampliar solo si la fase I fue cómoda y registrada', 'Se amplía el contacto gradualmente, sin metas.', 'Fase II, o repetir/adaptar fase I sin castigo.', 'Disfrute antes/después.', 'Registra si ampliar fue cómodo.', 'sensate-2', ['sensate'], true),
  D(20, 'Diseña tu contexto favorable', 'Combinar tus hallazgos', 'Tu contexto ideal mezcla tus mejores aceleradores.', 'Diseña y prueba un contexto con tus hallazgos.', 'Deseo antes/después.', 'Guarda el contexto para repetirlo.', 'context-design', ['context', 'r:conditions'], true),
  D(21, 'Revisión semana 3', 'Síntesis de experiencias sin cuestionario completo', 'Mirar lo vivido consolida el aprendizaje.', 'Revisa tu diario y escribe qué funcionó.', 'Reflexión escrita.', 'Elige qué llevar a la semana 4.', 'week-review', ['progress']),
  D(22, 'Tus mejores activadores', 'Repetir los 2 con mejor utilidad registrada', 'Repetir lo que funcionó afianza el aprendizaje.', 'Se eligen según tus registros, no al azar.', 'Deseo antes/después.', 'Nota si siguen funcionando.', '@best', ['progress'], true),
  D(23, 'Flexibilidad sexual', 'Cambiar guiones rígidos', 'No hay una única forma correcta de intimidad.', 'Transforma una expectativa rígida en una flexible.', 'Presión antes/después.', 'Prueba un guion distinto sin rendimiento.', 'flex-script', []),
  D(24, 'Tu curva de deseo real', 'Revisar deseo, curiosidad, apertura, disfrute, presión, conexión', 'Tu evolución real, con tus datos, sin metas ajenas.', 'Revisa tus registros y valora la curva.', 'Seis valores 0–10 (N/A permitido).', 'Identifica qué la hizo subir o bajar.', 'desire-curve', ['progress'], true),
  D(25, 'Plan si-entonces', 'Prevenir abandono ante cansancio, presión o menos interés', 'Planificar la respuesta evita dejarlo todo.', 'Escribe 3 planes "si… entonces…".', 'Confianza en el plan.', 'Ten el plan a mano.', 'if-then', ['r:strategies']),
  D(26, 'Objetivos de continuidad', 'Elegir hasta 2 objetivos y qué mantener o espaciar', 'Mantener es también una meta.', 'Elige hasta 2 objetivos de continuidad (distinto del plan de 3 acciones).', 'Reflexión escrita.', 'Decide qué mantener y qué espaciar.', 'continuity-goals', ['r:continuity', 's:16']),
  D(27, 'Ensayo autónomo', 'Usar tus mejores facilitadores y contexto', 'Ya conoces tu terreno: pruébalo por tu cuenta.', 'Ensayo libre con tus facilitadores.', 'Deseo antes/después.', 'Registra qué mantener.', 'autonomous-rehearsal', ['r:details'], true),
  D(28, 'Cierre y comparación', 'Comparar con tu línea base congelada y decidir continuidad', 'SPM compara datos reales: mantenimiento, otro ciclo adaptado o revisión profesional.', 'Checkpoint central (en lab: simulación rotulada).', 'Comparación con línea base.', 'Recibe tu recomendación de continuidad.', 'final-compare', ['s:17', 'progress', 's:18'], true, 'D28'),
];

const P = (id: string, title: string, duration: string, metric: Practice['metric'], metricLabel: string, safe: boolean, steps: string[], x: Partial<Practice> = {}): Practice => ({ id, title, duration, metric, metricLabel, safe, steps, ...x });
const exitTxt = 'Puedes detenerte en cualquier momento. Detenerte no cuenta como fallo.';
export const extraPractices: Record<string, Practice> = {
  'concept-forms': P('concept-forms', 'Las dos formas del deseo', '5 min', 'desire', 'Interés hoy (0–10)', true, ['Lee "Me dan ganas" y "Me voy conectando".', 'Elige cuál se parece más a tu experiencia actual.', 'No hay obligación ni forma correcta.'], { reflective: true, purpose: 'Comprender que el deseo responsivo es normal.', observe: 'Qué forma reconoces en ti.' }),
  'pattern-observe': P('pattern-observe', 'Tu patrón y contextos', '5–8 min', 'desire', 'Interés hoy (0–10)', true, ['Completa el mapa de influencia.', 'Recuerda una ocasión en que el deseo apareció: ¿qué había alrededor?'], { reflective: true, purpose: 'Ver la influencia del contexto.', observe: 'Factores con más influencia.' }),
  'breath-routine': P('breath-routine', 'Rutina previa: soltar → respirar → conectar', '5 min', 'pressure', 'Presión (0–10, menor = más calma)', true, ['Soltar presión: nombra la exigencia y déjala ir.', 'Respirar cómodo: exhalación más larga que la inhalación, sin forzar.', 'Elegir conexión: decide a qué prestar atención agradable.'], { timer: { seconds: 300, phases: ['Soltar presión', 'Respirar cómodo', 'Elegir conexión'] }, purpose: 'Bajar la alerta antes de la intimidad.', prep: 'Lugar tranquilo, postura cómoda.', observe: 'Cambio de presión.' }),
  'presence-5': P('presence-5', 'Explora sin exigencia', '05:00', 'pressure', 'Presión (0–10, menor = más calma)', true, ['Presencia: llega al momento.', 'Curiosidad: observa sin juzgar.', 'Contacto: nota tu piel, temperatura y respiración.', 'Sin meta de rendimiento.'], { timer: { seconds: 300, phases: ['Presencia', 'Curiosidad', 'Contacto', 'Sin meta'] }, partnerVariant: 'Con pareja (opcional): misma práctica, tomados de la mano o sentados juntos, sin buscar nada más.', purpose: 'Entrenar atención sin examen.', prep: 'Privacidad, móvil en silencio.', observe: 'Cuánto te exigiste.' }),
  'map-select': P('map-select', 'Mapa de aceleradores y frenos', '8 min', 'desire', 'Claridad de tu mapa (0–10)', true, ['Selecciona aceleradores y frenos.', 'Guarda tus sugerencias.'], { reflective: true, purpose: 'Saber qué suma y qué resta.', observe: 'Freno más fácil de reducir.' }),
  'body-awareness': P('body-awareness', 'Conciencia corporal y soltar tensión', '05:00', 'satisfaction', 'Comodidad corporal (0–10)', true, ['Recorre el cuerpo desde la cabeza.', 'Detente en las zonas de tu mapa.', 'Suelta tensión al exhalar. No es un ejercicio de Kegel ni de fuerza.'], { timer: { seconds: 300, phases: ['Cabeza y cuello', 'Pecho y espalda', 'Abdomen y pelvis', 'Piernas'] }, purpose: 'Percibir más con menos tensión.', observe: 'Zonas agradables.' }),
  'week-review': P('week-review', 'Síntesis y foco', '10 min', 'desire', 'Interés hoy (0–10)', true, ['Relee lo registrado.', 'Escribe qué funcionó y qué no.', 'Elige el foco siguiente.'], { reflective: true, purpose: 'Consolidar lo aprendido.', observe: 'Patrones repetidos.' }),
  'repertoire-try': P('repertoire-try', 'Probar una idea del repertorio', '10–15 min', 'desire', 'Deseo antes / después', true, ['Elige una idea del repertorio (ver, tocar, escuchar, hablar, juego previo, novedad).', 'Pruébala sin meta.', 'Marca su utilidad.'], { purpose: 'Ampliar opciones.', observe: 'Qué idea ayudó.' }),
  'no-desire-today': P('no-desire-today', 'Hoy no aparece: recuperación', '5 min', 'pressure', 'Presión (0–10, menor = más calma)', true, ['Detén la exigencia: "hoy no tiene que pasar nada".', 'Elige algo agradable: descanso, cercanía, conversación.', 'Retoma otro día sin culpa.'], { reflective: true, purpose: 'Flexibilidad ante días sin deseo.', observe: 'Cómo cambió la presión.' }),
  'activation-plan': P('activation-plan', 'Planificar tu ventana de activación', '10 min', 'desire', 'Deseo esperado (0–10)', true, ['Momento: ¿cuándo tienes más energía?', 'Privacidad: ¿cómo evitar interrupciones?', 'Contexto: ¿qué acelerador incluir?', 'Duración flexible; usarla es opcional.'], { reflective: true, purpose: 'Preparar el terreno.', observe: 'Diferencia esperado/real.' }),
  'evidence-confidence': P('evidence-confidence', 'Evidencias de interés', '8 min', 'desire', 'Confianza (0–10)', true, ['Escribe 3 momentos recientes de interés o curiosidad.', 'Reconoce qué necesitas hoy (más tiempo, contexto, estímulo).', 'Adaptarte no es rendirte.'], { reflective: true, purpose: 'Recuperar confianza con datos propios.' }),
  'intimacy-ladder': P('intimacy-ladder', 'Escalera de intimidad sin presión', 'Libre', 'pressure', 'Presión (0–10, menor = más calma)', true, ['Elige el peldaño cómodo hoy.', 'Quédate ahí, o baja si aparece presión.', 'Subir requiere comodidad y consentimiento, nunca es automático.'], { reflective: true, purpose: 'Graduar la intimidad.', observe: 'Comodidad en cada peldaño.' }),
  'sensate-1': P('sensate-1', 'Sensate Focus I · contacto no genital', '05:00', 'satisfaction', 'Disfrute (0–10)', true, ['Zonas no genitales: manos, brazos, espalda, cuello.', 'Atención a temperatura, presión y textura.', 'Sin objetivo de excitación.'], { timer: { seconds: 300, phases: ['Manos y brazos', 'Hombros y cuello', 'Espalda', 'Cierre y respiración'] }, partnerVariant: 'En pareja: turnos, uno toca y otro recibe. Acuerden poder parar.', purpose: 'Recuperar el placer sin exigencia.', observe: 'Sensaciones agradables.' }),
  'sensate-2': P('sensate-2', 'Sensate Focus II · contacto ampliado', '05:00', 'satisfaction', 'Disfrute (0–10)', false, ['Solo si la fase I fue cómoda y está registrada.', 'Amplía gradualmente las zonas, incluyendo las de tu mapa.', 'Sigue sin metas de erección ni orgasmo.'], { timer: { seconds: 300, phases: ['Repaso fase I', 'Ampliar', 'Pausa', 'Cierre'] }, partnerVariant: 'En pareja: consentimiento antes de ampliar, cada uno puede parar.', requires: 'sensate-1', purpose: 'Ampliar gradualmente, solo si resulta cómodo.', observe: 'Comodidad al ampliar.' }),
  'foreplay-rhythm': P('foreplay-rhythm', 'Ritmo y juego previo consciente', '10 min', 'satisfaction', 'Disfrute (0–10)', false, ['Varía el ritmo: más lento, pausas.', 'Aumenta solo si hay interés.', 'Reduce si aparece presión.'], { purpose: 'Dar tiempo a la excitación.', observe: 'Ritmo agradable.' }),
  'communicate-limits': P('communicate-limits', 'Comunicar deseo y límites', '10–15 min', 'closeness', 'Cercanía (0–10)', true, ['Elige un momento neutral.', 'Una cosa que te gusta, una que no.', 'Pregunta con curiosidad, sin juicio.'], { partnerVariant: 'Si no tienes pareja o no quieres involucrarla: escríbelo para ti.', purpose: 'Seguridad y claridad.', observe: 'Cercanía tras hablar.' }),
  'context-design': P('context-design', 'Diseñar contexto favorable', '15 min', 'desire', 'Deseo antes / después', true, ['Combina 2–3 hallazgos: acelerador, condición, ambiente.', 'Prueba el contexto sin meta.', 'Guarda lo que funcionó.'], { purpose: 'Unir lo aprendido.' }),
  'flex-script': P('flex-script', 'Flexibilidad sexual', '8 min', 'pressure', 'Presión (0–10, menor = más calma)', true, ['Escribe una expectativa rígida ("tiene que…").', 'Transfórmala en flexible ("puede…").', 'Imagina un guion distinto sin rendimiento.'], { reflective: true, purpose: 'Quitar rigidez.' }),
  'desire-curve': P('desire-curve', 'Tu curva de deseo real', '8 min', 'desire', 'Deseo hoy (0–10)', true, ['Revisa tu progreso.', 'Valora deseo, curiosidad, apertura, disfrute, presión y conexión.'], { reflective: true, purpose: 'Ver tu evolución con datos propios.' }),
  'if-then': P('if-then', 'Plan si-entonces', '10 min', 'pressure', 'Confianza en el plan (0–10)', true, ['Si estoy cansado, entonces…', 'Si siento presión, entonces…', 'Si baja el interés, entonces…'], { reflective: true, purpose: 'Prevenir abandono.' }),
  'continuity-goals': P('continuity-goals', 'Objetivos de continuidad', '8 min', 'desire', 'Interés hoy (0–10)', true, ['Elige hasta 2 objetivos.', 'Decide qué mantener y qué espaciar.'], { reflective: true }),
  'autonomous-rehearsal': P('autonomous-rehearsal', 'Ensayo autónomo', '15 min', 'desire', 'Deseo antes / después', true, ['Usa tu contexto y facilitadores favoritos.', 'Sin guía y sin meta.', 'Registra qué mantener.'], { purpose: 'Autonomía.' }),
  'final-compare': P('final-compare', 'Cierre del ciclo', '10 min', 'desire', 'Deseo hoy (0–10)', true, ['Revisa la comparación con tu línea base.', 'Lee la recomendación de continuidad.', 'Nunca se repite el ciclo 1 automáticamente.'], { reflective: true }),
};
for (const p of Object.values(extraPractices)) p.exit ??= exitTxt;

// Fidelity patch: local (non-aggregated) metrics where the label is not a Metrics key, and links to the interactive resources each sheet needs.
const patch: Record<string, Partial<Practice>> = {
  'concept-forms': { metric: 'local', resourceLinks: ['r:concepts'] },
  'pattern-observe': { metric: 'local', resourceLinks: ['r:influence'] },
  'map-select': { metric: 'local', resourceLinks: ['r:map', 's:13'] },
  'week-review': { metric: 'local', resourceLinks: ['r:ranking', 'r:details', 'progress28'] },
  'activation-plan': { metric: 'local', resourceLinks: ['r:conditions'] },
  'evidence-confidence': { metric: 'local', resourceLinks: ['r:age'] },
  'intimacy-ladder': { resourceLinks: ['r:ladder'] },
  'repertoire-try': { resourceLinks: ['r:ideas'] },
  'no-desire-today': { resourceLinks: ['r:strategies'] },
  'if-then': { metric: 'local', resourceLinks: ['r:strategies'] },
  'continuity-goals': { metric: 'local', resourceLinks: ['r:continuity'] },
  'desire-curve': { metric: 'local', metricLabel: 'Seis valores 0–10', resourceLinks: ['progress28'], fields: [['desire', 'Deseo'], ['curiosity', 'Curiosidad'], ['openness', 'Apertura'], ['enjoyment', 'Disfrute'], ['pressure', 'Presión'], ['connection', 'Conexión']] },
  'final-compare': { metric: 'local', resourceLinks: ['progress28', 'r:continuity'] },
  'context-design': { resourceLinks: ['context', 'r:conditions'] },
  'communicate-limits': { resourceLinks: ['r:partner'] },
  'breath-routine': { resourceLinks: ['r:conditions'] },
  'presence-5': { resourceLinks: ['r:concepts'] },
  'body-awareness': { resourceLinks: ['s:7'] },
  'sensate-1': { resourceLinks: ['sensate'] }, 'sensate-2': { resourceLinks: ['sensate'] },
  'autonomous-rehearsal': { resourceLinks: ['r:details', 'r:conditions'] },
  'foreplay-rhythm': { resourceLinks: ['r:ideas'] },
};
for (const [id, x] of Object.entries(patch)) Object.assign(extraPractices[id]!, x);

