# Agenda, cierre y adaptadores SPM · revisión técnica 27/11/2026

## Estado y alcance

Implementación local de la agenda `spm-20261127-v1`, su compositor común, Hoy, el visor de revisión y los adaptadores afectados por cambios de día. La agenda previa continúa disponible como `legacy`. La selección de versión de un plan y la transacción de cierre pertenecen al adaptador y al servidor; este trabajo no migra planes productivos ni afirma que una prueba en el visor persista datos de una cuenta real.

Fuente de instrucciones: `SPM_Plan_de_Ajustes_2026-11-27/SPM_Instruccion_Maestra_2026-11-27.md`, `agenda/decisiones_y_transformaciones.md`, calendario detallado, destino de contenidos y anexos del paquete entregado. Base de código inspeccionada: `c27bbbba0292513b898d0684a30a95cd1e4e6449`.

La secuencia clínica de Focalización se conserva: I en 4, 8 y 12; II en 19; I en 23 y 26. Esta secuencia sigue pendiente de revisión clínica. No se han creado técnicas ni aumentado su dosis para acomodar la agenda.

## Entregables principales

| Archivo | Función |
|---|---|
| `premium-v2/agenda-manifest-20261127.js` | Manifest que carga el navegador. |
| `docs/qa/spm-agenda-20261127-manifest.json` | Fuente revisable de seis rutas, tres variantes, identidad, roles, condiciones, recursos y explicaciones. |
| `premium-v2/agenda-v2.js` | Resuelve la versión y selecciona contenido existente sin cambiar la cuenta, plan ni día globales. |
| `premium-v2/daily-practice-v1.js` | Hoy, recursos compactos, estado de cada registro, apertura de actividades, cierre explícito y decisión común de cierre. |
| `docs/qa/spm-agenda-legacy-manifest.json` | 72 combinaciones reales de ruta, Deseo secundario, seguridad y preparación para fuerza; requisitos y catálogo completo en `routes` y `allRoutes`. |
| `docs/qa/spm-record-validation-20261127.json` | Esquemas extraídos del código vigente de DE, Conexión, checkpoint y discriminadores de cierre. Incluye hashes de las fuentes. |
| `tests/helpers/valid-daily-record.cjs` | Registros mínimos sintéticos seleccionados de los esquemas reales, para pruebas UI y PostgreSQL. |
| `docs/qa/spm-connection-contract-legacy.json` | Snapshot del contrato de Conexión en la base de código, sin copiar ni modificar datos de usuarios. |
| `docs/qa/spm-agenda-20261127-mixed-matrix.md` | Matriz de los 84 días de las tres variantes mixtas, con contenido de origen, rol y condiciones. |
| `docs/qa/spm-agenda-20261127-tests.tap` | Resultado completo del grupo de pruebas de esta entrega. |

Los scripts `scripts/qa/export-legacy-agenda.cjs` y `scripts/qa/export-record-validation.cjs` regeneran los manifiestos de respaldo a partir de los componentes reales. `scripts/qa/enrich-agenda-manifest.cjs` añade al manifest nuevo los discriminadores de interacción y categoría necesarios para reproducir la política de seguridad.

## Composición y cambios de prioridad

Cada día nuevo tiene una principal y como máximo un apoyo visible. Los apoyos, hábitos, fuerza y mediciones de seguimiento conservan su voluntariedad. Las explicaciones audiovisuales se abren dentro de la actividad correspondiente y no generan otra tarea ni requisito de reproducción. Los contenidos desplazados conservan su fuente y acceso a biblioteca; no se acumulan como tareas posteriores.

| Ruta base | Principales requeridas | Principales voluntarias | Días con apoyo definido | Explicaciones integradas |
|---|---:|---:|---:|---:|
| Erección | 16 | 12 | 15 | 2 |
| Control eyaculatorio | 21 | 7 | 12 | 3 |
| Deseo | 16 | 12 | 11 | 3 |
| Confianza | 19 | 9 | 12 | 3 |
| Conexión / wellbeing | 19 | 9 | 8 | 4 |
| Hábitos / lifestyle | 4 | 24 | 6 | 2 |

Los apoyos condicionados pueden estar definidos sin mostrarse hasta que la persona solicite el caso correspondiente. El número de tarjetas no se interpreta como dosis clínica.

Las diez sesiones DE conservan 1, 3, 6, 9, 12, 15, 18, 21, 24 y 27. Las doce sesiones EP conservan 1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24 y 26. La oferta de Conexión conserva sus contenidos y discriminadores de origen. No se hace una fusión de escalas ni instrumentos.

La variante DE + Deseo usa el calendario especificado. En el día 21 mantiene DE08 como principal y una única revisión C21 voluntaria; no añade la revisión D21. En el día 13 ofrece el contenido CN13 y no agrega D13. Las variantes EP + Deseo y Confianza + Deseo incorporan apoyos existentes sólo en plazas de apoyo libres: EP, D05 en día 5 y D15 en día 15; Confianza, D05 en día 5 y D22 en día 22. No sustituyen la técnica principal ni agregan un segundo apoyo.

Decisiones de integración que requieren conservar su trazabilidad:

- El seguimiento intermedio aparece como recordatorio compacto y voluntario en días 15–27. Su identidad de contenido sigue siendo el hito 14; el guardado conserva el día real de envío. Se puede ocultar el recordatorio y no bloquea cierre.
- Confianza origen 6 usa la alternativa neutral de atención ya existente. La elegibilidad para fuerza no transforma esa principal en contracciones; fuerza permanece como recurso opcional independiente.
- Las historias de recuperación abren el `scenario` asignado. El renderer antes recalculaba el caso sólo a partir del día global; ahora recibe el discriminador de la asignación.
- Las revisiones históricas propias de Deseo 13/21 y las compartidas de Confianza no se declaran equivalentes. Los registros previos se conservan; no se copian respuestas entre instrumentos.

## Identidad y adaptación de pantallas

`id` sigue siendo un identificador persistible de actividad, con el formato `^[a-z0-9-]{1,60}$`. Un ID diario como `main` no basta para identificar el contenido. Las asignaciones nuevas conservan además:

- `contentId` y `contentVersion`: contenido y revisión.
- `assignmentId` y `scheduleVersion`: instancia de esa agenda.
- `sourceActivityId` y `sourceDay`: origen real del renderer o currículo.
- `scheduledDay`: jornada real en que se ofrece y guarda.
- Discriminadores existentes, por ejemplo `connectionDay`, `erectionLesson`, `confidenceDay`, `practiceId`, `pelvicIntent` y `scenario`.

El cierre nuevo exige coincidencia exacta de versión, instancia, contenido y día programado. `scheduledDay` no acepta un número serializado como texto. Un campo `activityKind` presente y vacío tampoco representa una actividad válida. Los registros legacy mantienen sus IDs y no necesitan campos que no existían cuando se guardaron.

| Ejemplo probado | Contenido de origen | Jornada de guardado |
|---|---|---:|
| Confianza nueva, día 11 | C12, `confidenceDay: 12` | 11 |
| Control, día 11 | Conexión de origen 10, `connectionDay: 10` | 11 |
| Deseo, día 28 | D26, currículo `continuity-goals` | 28 |
| DE + Deseo, día 16 | D18 | 16 |

Las pruebas abren las pantallas reales y el iframe vigente. El contexto global permanece en el día programado. Los puentes de Deseo capturan cuenta, plan, día, versión e instancia al abrir. Una respuesta tardía de un iframe anterior no puede completar otra asignación, aunque coincidan cuenta, plan y número de día. El historial de sesiones de Deseo mantiene el día fuente y añade el día programado; el registro diario queda en la jornada real.

La comparación final de Conexión busca su baseline por la identidad de la actividad inicial en el mismo plan. No presupone que cualquier registro del día 1 sea el baseline correcto.

## Cierre, omisiones y persistencia

`SPM_DAILY_PRACTICE.closeDecision(context, records, {recordsLoaded:true})` es una decisión de lectura común para Hoy y el adaptador. Comprueba agenda válida, registros recuperados, evaluación pendiente, restricciones y registros requeridos. Una carga fallida o una versión desconocida no se interpreta como día vacío.

Un día con cero requisitos puede cerrarse con cero, una o todas las actividades opcionales realizadas. Hoy pide confirmación explícita. No fabrica registros realizados para justificar el avance. Los siete casos de regresión son DE 16/19, EP 16, Confianza 16/19 y Hábitos 16/19; todos se verifican en la agenda legacy y la política también se prueba en todas las jornadas voluntarias nuevas.

El cierre espera escrituras diarias pendientes. Cuando el módulo abierto tiene guardado de borrador, usa su propia operación de cierre y detiene el avance si falla. Una prueba DOM provoca el fallo de guardado de D18 dentro de DE + Deseo día 16, comprueba que el iframe y el día siguen abiertos, y confirma que el reintento guarda el borrador y cierra sin contabilizar una práctica realizada. Las respuestas de formularios que no tienen guardado de borrador requieren confirmación de descarte antes de abandonar el día.

El guardado diario consume la metadata normalizada y la revisión devueltas por el adaptador. El estado visual se actualiza sólo si sigue vigente el contexto capturado. La transacción del servidor vuelve a calcular los requisitos desde su manifest confiable; la decisión del navegador no es una autorización de servidor.

DE01 distingue `ehsStatus: recorded`, `not_evaluable` y `omitted`. Omitir EHS no es cero ni No evaluable. Una decisión de omitir atención válida puede satisfacer el registro de cierre con `completionAccepted:true`, `completed:false` y `activityStatus:'omitted'`. `recordComplete` sigue siendo falso: no se contabiliza como actividad realizada. Se verifica mediante la pantalla táctil real.

Un día o ciclo previamente cerrado conserva `alreadyClosed:true` aunque después aparezca una alerta o falte una carga. La etiqueta final no desaparece ni habilita prácticas restringidas. En día 28 no se genera día 29: el adaptador usa el estado de ciclo cerrado.

## Validez histórica y fallback DE

Se compararon en una VM las fuentes de Conexión de la base del repositorio y las actuales. Los diez esquemas de campos, valores permitidos, temas y cantidades máximas son idénticos. `mode` de CN13 ya era requerido antes de esta entrega; el cambio adelanta la elección visible y evita inferir que alguien está en pareja sólo por haber escrito texto. La función `complete()` no cambia. No se añadió un requisito retroactivo ni se reescribió un registro histórico. La prueba y el snapshot documentan esa comparación. Si se identifica otro contrato productivo anterior, necesita su fuente concreta para incorporar compatibilidad sin inferir datos.

En el fallback conservado de DE existía una confusión previa: `supports` y `valid` ya relacionaban días con sesiones, pero el formulario genérico seguía usando el día calendario como número de sesión. La prueba aislada del commit base tuvo **8/22 aprobadas y 14 fallidas**. Ahora `lesson` selecciona campos y contenido, y `day` identifica lectura y guardado. Las cinco primeras sesiones usan los mismos campos originales en sus días reales; las sesiones 6–10 requieren sus controladores táctiles aprobados y no abren un formulario genérico incompleto. Los 22 casos se conservan y pasan, con las expectativas de calendario y voz actualizadas.

## Verificación

El grupo final se ejecuta con Node y JSDOM sobre el código real local y los recursos de iframe compilados, sin clientes ni cuentas de pacientes. El entorno sustituye APIs nativas de media y diálogo necesarias para la ejecución automatizada. Esto verifica selección, DOM, flujo, persistencia del adaptador de revisión y rechazo de respuestas vencidas; no certifica audio físico, comportamiento Safari/iOS ni durabilidad Supabase alojada.

Comando reproducible:

```sh
node --test --test-force-exit --test-reporter=tap \
  tests/agenda-v2.test.cjs tests/agenda-v2-dom.test.cjs \
  tests/daily-practice.test.cjs tests/program-review.test.cjs \
  tests/active-module-release.test.cjs tests/daily-support-plan.test.cjs \
  tests/erection-practice.test.cjs tests/erection-ten-schedule.test.cjs \
  tests/breathing-lab-bridge.test.cjs \
  tests/desire-week1-touch.test.cjs tests/desire-week2-touch.test.cjs \
  tests/desire-week3-bridge.test.cjs tests/desire-week4-bridge.test.cjs
```

**Resultado observado: 207/207 pruebas aprobadas, 0 fallidas, 0 omitidas.** El TAP completo registra la ejecución final.

Cobertura del grupo:

| Grupo | Casos |
|---|---:|
| Agenda y DOM nuevos | 25 |
| Hoy y visor legacy, con expectativas explícitas | 71 |
| Controladores activos, apoyos, calendario DE y puente respiración | 35 |
| Formulario DE conservado y validación | 22 |
| Puentes Deseo semanas 1–4 | 54 |
| **Total sin contar duplicados** | **207** |

La prueba del compositor recorre **672 combinaciones**: seis rutas × presencia/ausencia de Deseo secundario × preparación para fuerza × 28 días. Los fixtures sintéticos de **1.221 asignaciones** nuevas y legacy satisfacen los validadores reales. Se comprueban explícitamente identidad errónea, actividad incompleta, estado desconocido, catálogo ausente, registros no recuperados, evaluación incompleta, alerta urgente, fuente 6 independiente de fuerza y DE01 omitido.

Los harness y el visor cargan `health-intake-v2.js` antes de la política de evaluación, como Live. Las respuestas sintéticas cubren el catálogo ampliado; no se interpreta un fixture incompleto como permiso de cierre.

Los tests existentes se actualizaron manteniendo sus comprobaciones de comportamiento: agenda legacy explícita, diez sesiones DE, respiración EP origen 11, Lab EP en 18, conjunto de pasos Focalización I3 ya presente en la base, guía del dispositivo con transcripción, cierre voluntario y apertura del modal táctil vigente. No se eliminan tests para esconder discrepancias.

## Revisión independiente del adaptador y SQL

Se inspeccionaron `premium-v2/app-live.js` y `supabase/sql/spm-atomic-progress-body.sql` sin editarlos desde esta tarea. Se comunicaron al integrador los siguientes hallazgos concretos:

1. El guard de entradas asignadas debía permitir las reparaciones existentes ejecutadas como rol servidor incluso si `auth.uid()` estaba presente. El integrador corrigió la comprobación y probó las funciones existentes, acceso directo denegado y rol servidor con JWT.
2. `activityStatus` nulo y el catálogo de evaluación vacío/malformado necesitaban rechazo explícito; el integrador añadió guardas y pruebas PostgreSQL.
3. Un estado de seguridad desconocido debía conservar la pausa, como la UI, en vez de pasar como `none`. El integrador lo normalizó a `review` y añadió una prueba PostgreSQL.
4. Un reintento tras respuesta perdida debía conservar la misma operación y el mismo payload, aunque el formulario generara otra fecha. El integrador conserva el payload original hasta confirmación/lectura canónica; el test app–PostgreSQL cambia `completedAt` entre intentos y verifica la misma operación, metadata y revisión 1.
5. Se alinearon en UI los estados de realización, tipo de actividad e identidad numérica del día con el contrato del servidor.

El integrador confirmó 20/20 pruebas finales de contratos SQL y app–PostgreSQL después de estas correcciones. Los resultados de PostgreSQL, RLS, idempotencia y la integración app–servidor se reportan en su evidencia correspondiente. El visor de revisión usa registros temporales y no es prueba de esas propiedades.

## Pendientes y límites explícitos

- La secuencia de Focalización indicada arriba necesita decisión clínica. Se conserva sin reordenarla.
- Los doce vídeos del catálogo conservan su reproducción original accesible. No existe en el repositorio una transcripción/narración íntegra separada para todos ellos; no se sustituyó voz clínica por un resumen. La migración íntegra de la narración requiere esas fuentes.
- Las imágenes y pantallas con texto incrustado no quedan corregidas por actualizar un guion o un título. El inventario editorial enumera las piezas que requieren exportación visual aprobada.
- Falta verificar en dispositivos reales la voz instalada, interrupciones, regreso desde segundo plano, navegación móvil y accesibilidad de todos los diálogos.
- La aplicación de la migración en un entorno alojado y las pruebas con cuentas de revisión pertenecen al despliegue posterior. No se modificaron datos productivos desde esta tarea.
- La prueba exhaustiva de composición cubre todos los días y variantes; la prueba DOM de apertura/guardado usa los casos de adaptación descritos. No se afirma haber recorrido manualmente cada pantalla de las 252 instancias nuevas y mixtas.


## Revisión editorial adicional de continuidad

Después de la pasada de 207 casos se revisaron los estados activos de Hoy/agenda, recuperación, guardado, cierre y DailyCoach; las 14 microcápsulas EP y los 28 pares de ayudas de cierre. El detalle de alcance y de las 19 correcciones textuales está en `editorial-20261127/continuity-review.md` y su JSON. La presentación de las cápsulas conserva los bytes de la ilustración, usa formato 9:16 y sustituye el titular integrado antiguo por texto HTML revisado.

La pasada afectada posterior aprobó **98/98 casos**, sin fallos ni omitidos: los 96 casos de agenda/Hoy/visor más 2 nuevos que recorren las 14 cápsulas para verificar guion/transcripción, título visible, formato, controles y ausencia de guardado al escuchar. Evidencia: `editorial-20261127/continuity-tests.tap`. Los conteos corresponden a pasadas distintas y no se suman como casos únicos.

Las 14 imágenes originales se inspeccionaron visualmente. La nueva presentación requiere cotejo de render en el preview cloud de root; el entorno local no dispone de Chromium operativo. Esta nota no acredita escucha física ni sustituye la revisión pendiente de videos.
