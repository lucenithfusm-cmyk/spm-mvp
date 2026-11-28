# Revisión editorial y funcional de contenido SPM · 27/11/2026

## Resultado y alcance real

Se aplicaron correcciones de texto, guiones y decisiones de formulario. Los trece ejemplos E01–E13 tienen trazabilidad de texto íntegro antes/después. Se conservaron las técnicas, dosis, escalas y recursos aprobados. Las correcciones no habilitan compras ni publican una implementación.

El inventario principal parte del export de agenda `spm-20261127-v1`: **6 rutas, 168 jornadas, 585 apariciones y 141 identidades únicas de contenido**. De ellas, **137 tienen enlaces a paquetes de texto fuente revisados**; cuatro videos de la agenda siguen sin una transcripción completa localizada. Se revisaron **171 paquetes de fuente**, con **6.948 fragmentos de texto español**, **350 referencias modificadas** y **6.598 conservadas**. Además de las identidades de agenda, se enlazan **69 unidades complementarias** de entrada, estados, ayudas y microcápsulas. La extracción terminó sin errores. Un fragmento puede ser una etiqueta, un guion, un bloque HTML completo o una plantilla compartida: estas cifras no cuentan actividades nuevas ni cambios editoriales independientes. No son un porcentaje de aprobación visual, audiovisual o clínica del producto.

La base para el antes/después es `c27bbbba0292513b898d0684a30a95cd1e4e6449`. Los paquetes incluyen hash SHA256 de la fuente actual. Las repeticiones de una fuente compartida se enlazan por identidad; no se redactó una copia diferente para cada aparición. La matriz de seis rutas corresponde al programa base. Las tres variantes de motivos, incluida Erección con Deseo secundario, tienen una matriz adicional de 84 filas en `../spm-agenda-20261127-mixed-matrix.md` y pruebas en `../spm-agenda-20261127-review.md`; no se confunde con una séptima ruta base.

### Evidencia entregada

| Archivo | Contenido y uso |
|---|---|
| `active-corpus.json` | Identidades y asignaciones de agenda, fuentes y claves, textos íntegros antes/después, estado revisado/conservado, objetivo, acción, registro, modalidad, cierre y comprobación pendiente. |
| `active-corpus-matrix.md` | Tabla legible por identidad de contenido y número de apariciones. |
| `active-corpus-summary.json` | Cifras reproducibles y errores de extracción. |
| `E01-E13-full-text.json` | Las nueve guías completas de Conexión afectadas por E01–E09, los tres resúmenes E10–E12 y el cue E13. No son sólo citas recortadas del anexo. |
| `connection-guides-review.json` | Las treinta unidades título/guía/práctica de los diez días de Conexión, incluidas las conservadas. |
| `connection-cue-changes.json` | Siete cambios completos de cues y su razón. |
| `cross-route-changes.json` | Setenta y un cambios adicionales íntegros de otras rutas y recursos; complementa al inventario, no cuenta todas las modificaciones técnicas. |
| `onboarding-review.json` | Veinte paquetes de entrada: flujo efectivo, decisiones y 816 referencias de texto antes/después o conservadas; incluye los últimos ajustes de Map/Plan/Progreso en HTML. |
| `continuity-review.json` y `.md` | Veintidós paquetes, 417 referencias fuente, las 14 microcápsulas EP y 28 pares de ayudas, con revisión de imágenes y decisiones documentadas. |
| `lab-ui-changes.json` | Ocho correcciones finales de texto JSX en Respiración y Piso pélvico, con antes/después exactos. |
| `insights-es-visual-review.json` | Lectura visual íntegra de los cuatro PNG españoles y hash de cada imagen; documenta su incongruencia pendiente con el guion. |
| `editorial-targeted-tests.tap` | 103 pruebas automatizadas focalizadas aprobadas. |
| `onboarding-tests.tap` | 46 pruebas de entrada, intermedios, retorno y estado comercial aprobadas. |
| `breathing-react-tests.log`, `labs-final-tests.tap` | 42 pruebas React de Respiración y 13 de laboratorio/demo/recursos, tras los últimos builds. |
| `breathing-final-build.log`, `pelvic-final-build.log` | Builds finales de fuentes y distribución sincronizados. |
| `sensate-tests.tap` | 28 pruebas aprobadas tras el ajuste de cierre de Focalización. |
| `coverage-gaps.json` | Pendientes específicos, fuente y siguiente comprobación. |

El barrido genérico inicial de 18.305 candidatos se retiró del entregable principal: mezclaba código, rutas, duplicados y archivos no efectivos. Se conserva fuera del repositorio como auxiliar de trabajo. No se utiliza como evidencia de revisión integral.

## Cambios E01–E13

| Ejemplo | Cambio aplicado | Fuente y comprobación |
|---|---|---|
| E01 · Conexión1 | Nombra las cuatro dimensiones y su escala0–10, No aplica y prioridad. La guía describe los controles y el guardado reales. | `conexion-satisfaccion/guiones.js`; prueba distingue0, null/No aplica y dato ausente. |
| E02 · Conexión4 | Usa los tres campos reales: preferencia, cambio reconocido y necesidad. No exige aceptar emocionalmente el cambio. | Guía completa y campos de `actividades.js`. |
| E03 · Conexión7 | Recuerdo concreto de zona/contacto; permite nombrar estimulación del pene cuando corresponde. Termina en preferencia y límite, sin exigir una experiencia nueva. | Guía y cuatro cues; se conservan campos. |
| E04 · Conexión10 | Modalidad individual desde el inicio; cuatro imágenes y dos opciones propias, sin obligar a realizar una. Compartir con pareja sigue siendo opcional. | Guía y selección de dos opciones conservada. |
| E05 · Conexión13 | Selección Individual/En pareja visible antes del mapa. Su ritmo recoge sólo lo expresado por la otra persona. Se explica el guardado de una respuesta y el cierre total. | `pantalla.js/css`; prueba no infiere pareja por escribir y no abre formulario ajeno en modo individual. |
| E06 · Conexión16 | Ejemplo explícito de comunicación sobre estimulación del pene, sin técnica añadida ni obligación de compartirlo. | Guía y campos Disfruto/Me gustaría/Prefiero evitar. |
| E07 · Conexión19 | Acción elegida y sentimiento real o imaginado separados; no da por realizada una acción. | Guía y formulario existentes. |
| E08 · Conexión21 | Diferencia cuerpo, emoción y necesidad; permite sensibilidad en el pene si corresponde. No aplica evita los campos siguientes. | Prueba de No aplica sin requisitos ocultos. |
| E09 · Conexión28 | Cambios o ausencia de cambios válidos. Compara sólo las cuatro dimensiones equivalentes con día1, cuando hay registro. Comunicación es una pregunta opcional de hoy. | Prueba de cuatro Sin registrar sin línea base y de No aplica/0. |
| E10 · Deseo18 | El resumen describe preparación concreta de guion, deseos y límites, individual o compartido a elección. | `erection-daily-plan-v1.js`; se conserva el número de campos. |
| E11 · Deseo19 | Se elimina «sin castigo». La elección de FocalizaciónII o repetición/adaptación deI remite a sus guías existentes. | Resumen y motor de Deseo; no se cambia orden clínico ni dosis. |
| E12 · revisiónDeseo21 | Útil/no útil/no valorable, sin exigir éxito. Se actualizan resumen, narración y catálogos JS/JSON/TS relacionados. | `desire-week3-v1` y `desire-curriculum.ts`; registros históricos propios se conservan. |
| E13 · cueConexión13 | Necesidades de cercanía y ritmo propios; no atribuir respuesta a la pareja. El cue original del día10 conserva su función de recuerdo de disfrute. | `actividades.js`; prueba verifica que ya no son literales iguales. |

Los diez esquemas de campos, opciones, límites y topics de Conexión se contrastaron contra HEAD por el agente de agenda: no se cambiaron requerimientos ni escalas históricas. La selección de modalidad del día13 ya existía en el esquema; la corrección la hace visible antes de responder y elimina inferencias de pareja.

## Otras correcciones concretas

### DE01: medición voluntaria y decisión de práctica

El formulario táctil y el alternativo distinguen tres respuestas sin inferirlas de un vacío:

| Decisión de EHS | `ehs` | `ehsEvaluable` | `ehsOmitted` | `ehsStatus` |
|---|---:|---|---|---|
| Nivel0 elegido | 0 | true | false | recorded |
| No evaluable elegido | null | false | false | not_evaluable |
| Continuar sin puntuar | null | null | true | omitted |

La omisión de la práctica de atención guarda `attentionPracticeCompleted:false`, `completed:false`, `activityStatus:'omitted'` y `completionAccepted:true`: acepta el registro de una decisión, no suma una práctica realizada. No se exige cronómetro. Un fallo de guardado conserva respuestas y no muestra éxito. Los registros históricos de EHS0/No evaluable sin el contrato nuevo siguen siendo válidos según su esquema.

El formulario alternativo1–5 separa sesión de día de calendario. Las sesiones6–10 no usan un formulario alternativo incompleto: abren los controladores táctiles vigentes. Las pruebas de fallback del agente de agenda pasan22/22 y están incluidas en la suite focalizada de103.

### Ausencia de cambios y modalidades

Confianza13 permite No identifico cambios y Aún no puedo valorarlo, exclusivas respecto a las opciones positivas, y conserva la escala de confianza0–4. Confianza24 ofrece Otra respuesta con esas alternativas; no las convierte en un cero. Deseo13 y21 aceptan ausencia de experiencia, utilidad o valoración. Los catálogos duplicados JS/JSON y la fuente TypeScript mantienen la misma redacción. DE7 deja de presuponer avances; DE4 sólo atribuye realización si la persona la realizó. El catálogo alternativo de Erección conserva coherencia con los módulos táctiles.

### Recursos y cierres

En Respiración, las referencias de uno/cinco minutos no prometen cambios por duración. El final hablado dice «Terminó la guía. Respira con naturalidad y registra solo lo que realizaste». Las18 líneas narradas toman la fuente de texto actual; los manifiestos de grabación históricos permanecen como procedencia. La demostración final conserva su transcripción publicada, dividida en seis frases, y se inventaría por separado de los videos sin guion.

El cierre de FocalizaciónI dice que terminó la guía y condiciona el registro a la práctica realmente realizada; admite ausencia de cambios. No se cambiaron sus pasos, zonas, tiempos ni requisitos clínicos. La introducción de técnicas EP evita presumir que las sesiones anteriores se realizaron. Se retiró una frase de cierre repetida de Start/Stop, manteniendo todas las instrucciones y dosis.

Los seguimientos14/28 se describen como voluntarios; el informe sigue disponible con los registros existentes. La página de pausa distingue una compra vigente aún no iniciada de un programa ya iniciado: conserva el avance y los registros existentes. El regalo continúa siendo el recetario de12 preparaciones y no se presenta como el ebook premium. Las rutas de cobro permanecen pausadas.

## Ampliación completada: entrada, continuidad y controles de laboratorios

La revisión adicional cubre texto disponible en el repositorio; no se deja onboarding o microcápsulas como una dependencia externa. `onboarding-review.json` registra 20 paquetes, 816 referencias, 79 modificadas y 737 conservadas. Se comprobaron las cargas desde `live.html` y `free-assessment.html`, el cuestionario efectivo después de aplicar `health-intake-v2.js`, la bienvenida, los cuatro intermedios, orientación y resultado, borradores de invitado, estados de cuenta, presentación comercial, pausa y retorno de pago. Los cuatro PNG de intermedios tienen su propia evidencia visual y siguen pendientes de arte.

| Flujo y fuente | Decisión aplicada o conservada |
|---|---|
| `program-welcome-v1.js` | Describe guías para explorar y registrar; las actividades y los seguimientos se presentan como decisiones de la persona. No promete mejoría por completar 28 días. |
| `evaluation-refresh-v1.js`, `MOMENTS.es` | Explica cómo las respuestas orientan la ruta. Se eliminan formulaciones que prometían salir del ensayo y error o una personalización más amplia que la selección real de recursos. Guion y mensaje escrito coinciden; esto no modifica los textos incrustados en PNG. |
| `health-intake-v2.js`, `engine.js` | Se mantienen preguntas, IDs, pesos y escalas. El campo de medicamentos explica que puede escribir «No recuerdo». La pregunta `e_loss` tiene un pendiente clínico concreto descrito más abajo. |
| `assessment-app-v3.js`, `guest-entry-v1.js`, `commercial-conversion-v1.js` | Las metas de conexión y disfrute incluyen modalidad individual o compartida. No se presupone pareja ni se atribuyen preferencias a otra persona. «Área prioritaria» sustituye un tecnicismo; la ausencia de alertas se expresa como información registrada en el cuestionario. |
| `live.html`, `free-assessment.html`, `app-live.js` | El mapa orienta la ruta; Hoy contiene actividad principal, apoyo cuando corresponda y recursos. El cierre se confirma después de guardarse. «Jornadas cerradas» distingue el calendario de prácticas realizadas. Al final se consultan registros disponibles y se elige qué prioridad cuidar, sin promesa de evolución. |
| `payment-return.js`, `program-paused.html` | Preservan el historial de una compra real. No empezar y haber empezado tienen mensajes distintos; no se reinicia el avance del comprador existente. La aprobación sigue dependiendo del servidor. |
| Control de acceso, idioma y manifiesto histórico de audio | Revisados sin cambio editorial cuando no contienen prosa propia. No se confunden redirección, referencia de grabación y guía hablada actual. |

Los textos de la presentación comercial se revisaron en su contexto de fuente. `vercel.json` mantiene la pausa en las rutas públicas correspondientes. Las funciones antiguas de sesión autenticada dentro de `assessment-app-v3.js` no se presentan como el controlador actual de `live.html`; `returning-user-router-v3.js` se leyó, pero no se localizó una carga efectiva en los HTML/JS actuales y se clasifica como legado.

La revisión de continuidad aporta 22 paquetes y 417 referencias (273 conservadas), incluidos estados de Hoy, agenda, recuperación, visor, guardado y errores, las 14 microcápsulas EP y 28 pares de consejos. Diecinueve cambios textuales reducen certeza injustificada o permiten ausencia de experiencia. Las 14 imágenes de cápsulas se inspeccionaron: sus titulares integrados diferían de las guías. La presentación conserva los bytes y la composición completa de cada imagen, ajustada con contain en un lienzo 9:16. Solo la caja medida del titular antiguo recibe el título revisado en HTML; no se recorta la ilustración ni se aplica un fundido. Se mantienen el logo, el día, el icono y la onda de reproducción y la cinta inferior. El póster y la etiqueta Escuchar/Detener forman un único botón y la transcripción permanece debajo. Las 14 fuentes y sus cajas se inspeccionaron el 28/11/2026; donde el texto estaba sobre fondo ilustrado, el fondo se cubre únicamente dentro de la caja tipográfica. El cotejo del nuevo render en navegador queda pendiente del nuevo preview; una prueba DOM no lo acredita.

DailyCoach tenía valores preseleccionados que podían parecer observaciones de la persona. La corrección de root exige decisiones explícitas, conserva `0` como respuesta y guarda No evaluable como `null`; no cierra la jornada al guardar el registro. El inventario conserva sus mensajes y controles completos, mientras las pruebas de idempotencia y persistencia pertenecen al informe técnico integrado.

Por último, se leyó la prosa JSX de los laboratorios Deseo, Respiración y Piso pélvico, además de sus guiones. Ocho correcciones finales eliminan dos frases que atribuían una mejoría al usuario, reemplazan «voz oficial pendiente» por «guía escrita disponible», ajustan mensajes de almacenamiento al programa SPM y aclaran que no hay respuestas preseleccionadas. «Borrar registro demo» pasa a «Borrar registros de Respiración»; no se cambia lo que hace el control. Las técnicas, las dosis y las escalas no se alteran. Las fuentes y los bundles de Respiración y Piso pélvico se compilaron juntos después de estos cambios.

## Decisiones de redundancia

| Caso | Decisión y flujo resultante | Registros y límite de la resolución |
|---|---|---|
| Deseo18: conversación, ficha, video e historia | Una principal de preparación del guion. El video queda como explicación opcional y la historia early como escenario diferenciado, también opcional. | No se declara integrada la narración del video: falta guion completo. La respuesta de recuperación mantiene identidad y no completa la conversación. |
| Deseo13: dos reflexiones sobre evidencia | La nueva agenda usa Confianza13 como principal única. El guion de la fuente Deseo admite experiencias diversas y permanece conservado para recursos/histórico. | Los tres textos del Deseo antiguo no se copian a las selecciones de Confianza: no se demuestra equivalencia de campos. |
| Deseo19: dos entradas FocalizaciónII | Una identidad de práctica asignada en la agenda vigente; carácter voluntario visible. | No se cuentan dos sesiones por abrir accesos de la misma familia. La modalidad y la secuencia clínica no se alteran. |
| Erección+Deseo21: dos revisiones semanales | Principal Erección sesión8; un apoyo opcional Confianza21. No se añade una segunda revisiónDeseo21. | Se conservan identificadores y observaciones históricas originales; no se imputa una respuesta a otra dimensión. Ver matriz y test de variante en informe de agenda. |
| Respiración/video en días3 y10 | Separación de práctica y explicación según la nueva agenda. No se conservan obligaciones duplicadas por abrir un video. En Deseo3 el video respiratorio es explicación opcional. | El texto de una acción posterior al video no es su transcripción. Pendiente comparar el contenido audiovisual completo antes de declarar fusión semántica. |
| Conexión10/13 | Conservar ambos con objetivo distinto: recuerdo del disfrute10; necesidades/ritmo13. | Sólo cambia el cue duplicado. No cambian campos, escalas o datos. |
| Seguimientos14/28 y recordatorios | Voluntarios, con acceso persistente y recordatorio compacto del14 cuando falta. | Ninguna falta equivale a0 ni exige completar para avanzar. Cierre diario real lo cubre la capa de agenda/persistencia. |
| Recursos semanales, técnicas EP e historias | Conservar consolidaciones y escenarios diferenciados. Se leyeron los siete casos de recuperación y las tres técnicas EP; se conservan sus parámetros. | Una sesión nueva mantiene su propio registro. Coincidencia temática o de imagen no justifica borrar contenido ni equiparar métricas. |

## Verificación realizada

| Grupo | Resultado y evidencia |
|---|---|
| Decisiones editoriales, DE01, fallback, Deseo, recetario y Pélvico | 103/103 en `editorial-targeted-tests.tap`. |
| Focalización tras el ajuste de cierre | 28/28 en `sensate-tests.tap`. |
| Entrada, intermedios, orientación y retorno de pago | 46/46 en `onboarding-tests.tap`. |
| Respiración React, después de las últimas correcciones JSX | 42/42 en `breathing-react-tests.log`. |
| Pélvico, demostración y recursos finales | 13/13 en `labs-final-tests.tap`. |
| Continuidad y las 14 microcápsulas | 98/98 en `continuity-tests.tap`. |
| Suite integrada del equipo | 718/718, cero fallos y cero omitidos, en `../spm-full-suite-20261127.tap`. |

Estos grupos se solapan y no se suman como pruebas únicas. La tanda focal de app/retorno posterior a las últimas redacciones HTML se informa en `../spm-app-final-20261127.tap` y en el informe técnico integrado.

La prueba DE01 utiliza el coordinador de voz real sin motor nativo; comprueba acceso a transcripción y decisiones sin escuchar ni esperar. El flujo pélvico monta React real y conserva pruebas de pausa/tiempo, rechazo de guardado, contexto de día, seguridad y acceso a 16 pantallas; su voz nativa es simulada. Las fotografías del build se resuelven desde el HTML actual y se comparan por SHA256 exacto con las fuentes. Se verifica software; no se acredita sonido audible ni una cuenta en producción.

Se completaron typecheck y build de Deseo, Respiración y Piso pélvico. Después de los ocho últimos cambios JSX, Respiración produce `index-jG_XMQk8.js` y Piso pélvico `index-UtNoVM_L.js`. Las pruebas de recursos no dependen del nombre minificado de una función ni del hash anterior del bundle. Los hashes de los 171 paquetes corresponden a las fuentes finales, incluidas las últimas redacciones HTML y las URLs de caché.

Para reproducir continuidad y corpus: `node scripts/qa/export-continuity-editorial.cjs` y después `node scripts/build-active-editorial-inventory-20261127.cjs`. Se excluyen CSS, rutas, teclas de control y fragmentos de atributos HTML de la extracción de UI. Las claves fuente y textos íntegros permanecen en los JSON; el conteo no sustituye las decisiones de revisión.

## Pendientes expresos para la entrega integrada

1. **Secuencia clínica de Focalización.** Focalización II del día 19 precede a I4/I5 de los días 23/26. Fuente: anexo 02, sección 6, y `agenda/decisiones_y_transformaciones.md`. Se conserva la secuencia hasta decisión del responsable clínico; no se inventa una frecuencia o técnica nueva.
2. **Aplicabilidad del cuestionario inicial.** `engine.js` pregunta `e_loss`: «¿Con qué frecuencia pierdes firmeza antes o poco después de la penetración?». Usa escala 1–5 con peso 1,1 y ambos controladores de evaluación requieren respuesta para avanzar. No ofrece No aplica para ausencia de experiencia de penetración. Resolverlo exige decidir cómo omitir ese dato y calcular el resultado, preservando la distinción entre ausencia y puntuación. Se señala el problema y se conservan escala/peso; no se asigna un cero ni se altera el algoritmo por edición.
3. **Videos sin guion íntegro.** Los cuatro IDs de agenda `sensory-focus`, `partner-communication`, `anxiety-regulation` y `breathing-guided` no tienen una transcripción completa localizada. Los resúmenes y acciones de `SPM_VIDEO_ACTIONS` no la sustituyen. El informe de voz detalla los 12 videos de Biblioteca con esa dependencia. La demostración final de Respiración sí tiene seis frases publicadas, conservadas y narradas; no se usa como sustituto de los otros videos ni se afirma cotejo acústico del original.
4. **Cuatro PNG de intermedios incompatibles con su mensaje actual.** `assets/insights/insight-1-es.png` a `insight-4-es.png` se inspeccionaron visualmente. Conservan titulares sobre rendimiento mental, circulación, control y resultados, distintos de los mensajes actuales de evaluación/ruta; incluyen promesas como «Resultados duraderos». El texto visible completo y SHA256 están en `insights-es-visual-review.json`. Corregir JavaScript o alt no cambia esos píxeles. Queda pendiente la fuente editable o una especificación aprobada de arte revisado que respete las pantallas. No se declara resuelta esta incongruencia.
5. **Resto del arte y uso real.** Las fuentes de texto y las imágenes examinadas no equivalen a una inspección visual de cada variante. Por ejemplo, el bitmap histórico de Confianza24 conserva su título mientras controles y guía admiten ausencia de cambios. Quedan el cotejo visual móvil de DE01, Conexión13, Confianza13/24 y presentación completa de cápsulas, escucha física por dispositivo y retorno/guardado/cierre con cuenta autorizada. El reporte del preview debe aportar esa evidencia específica.
6. **Idioma.** La revisión principal es española. Se preservaron pares bilingües; no se declara revisión integral del recorrido inglés.

Por estos límites, el estado es **correcciones aplicadas y revisión trazable de la fuente española disponible de agenda, recursos, entrada, continuidad y laboratorios, con dependencias precisas de arte/video y decisiones clínicas**. No equivale a validación clínica, audiovisual completa o funcionamiento productivo ya acreditado.
