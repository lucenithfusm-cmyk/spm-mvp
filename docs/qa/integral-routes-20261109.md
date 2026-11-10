# SPM: ampliación del calendario integral

Implementación sobre la revisión 7593e53. No cambia pagos, cuentas ni respuestas clínicas guardadas.

## Frecuencias en 28 días

| Recurso | Asignación |
|---|---|
| Deseo como ruta principal | 28 tarjetas, una por día |
| Erección con bajo deseo declarado | 28 tarjetas de Deseo, conservando la práctica principal de erección |
| Erección sin bajo deseo declarado | 8 tarjetas: días 2, 5, 10, 12, 15, 17, 22 y 26 |
| Sueño | 18 fichas distintas: días 1, 3, 4, 6, 7, 9, 10, 12, 13, 15, 16, 18, 19, 21, 22, 24, 25 y 27 |
| Nutrición | 10 recomendaciones, cada tres días desde el día 1; acceso a biblioteca y adaptación a restricciones |
| Movimiento | 9 recomendaciones, cada tres días desde el día 2; agua D23 y baile D26, con alternativas según disponibilidad |
| Recuperación | Las siete historias en todos los dominios: días 4, 8, 11, 15, 18, 22 y 25 |
| Piso pélvico DE/EP | 8 sesiones indicadas; DE puede tener 12 según la regla descrita abajo |
| Control eyaculatorio | Se conservan las 12 sesiones, tres por semana, alternadas con piso pélvico |
| Respiración / focalización | Se conservan 8 / 7 asignaciones compartidas |
| Seguimiento | Días 1, 14 y 28 en los seis dominios |

Bienestar puede mostrar hasta dos recomendaciones breves en un día. Nutrición conserva sus fichas completas en biblioteca, según la instrucción más reciente.

## Videos: calendario explícito

| Día | Video | Dominios |
|---|---|---|
| 1 | Erección, estrés y ansiedad | Todos |
| 2 | Salud vascular | Erección, deseo, bienestar, estilo de vida |
| 3 | Respiración diafragmática guiada | Todos |
| 7 | Dejar de anticipar el fracaso | Todos |
| 9 | Salud metabólica | Erección, deseo, bienestar, estilo de vida |
| 10 | Respiración para regular ansiedad | Todos |
| 14 | Salir del modo examen | Todos |
| 16 | Foco sensorial | Todos |
| 18 | Comunicación sin presión | Todos |
| 21 | Medicamentos | Todos |
| 23 | Bajo deseo sexual | Erección, deseo, ansiedad, bienestar, estilo de vida; EP cuando indica bajo deseo |
| 28 | Preparación mental | Todos |

En el motor, `confidence` corresponde a ansiedad/confianza y `lifestyle` a estilo de vida. Las doce piezas tienen asignación; los dos microclips de técnica conservan su ubicación dentro de sus prácticas.

## Reglas de personalización y seguridad

- Bajo deseo en DE: prioridad secundaria o motivo `desire`, respuesta `d_desire` 1–2, o cambio declarado de deseo asociado a medicamentos. Se usa el currículo existente, no una nueva secuencia clínica.
- Tres sesiones pélvicas semanales en DE: dificultad marcada para mantener la erección (`e_maint` 1–2), sin dificultad declarada para relajar ni tensión elevada. Esta regla organiza sesiones y no diagnostica debilidad del piso pélvico. Las sesiones se sitúan en los días semanales 2, 4 y 6; en los demás perfiles DE/EP, 2 y 6.
- Lab y clásico se alternan por sesión. Se consulta el estado guardado del Lab antes de abrir el clásico. Sin reconocimiento/relajación confirmados se mantiene Lab. El reconocimiento y relajación completos declarados en evaluación permiten el clásico desde el inicio si no hay tensión relevante. Dolor, tensión y alertas conservan sus restricciones.
- Las sesiones indicadas DE/EP dejan de ser opcionales. En otros dominios, el apoyo pélvico es requerido cuando existe dificultad declarada de reconocimiento o relajación; no se convierte todo apoyo de biblioteca en entrenamiento obligatorio.
- Una sola rutina pélvica por sesión. Los registros locales del clásico quedan separados por cuenta/plan y los guardados usan el día actual.

## Seguimiento y continuidad

Seguimientos opcionales: no son requisito para completar días ni acceder a prácticas. D14 pendiente genera un recordatorio con acceso para responder después; se conserva el día real de respuesta. D28 permite abrir el informe sin llenar la evaluación, señala la información faltante y conserva las recomendaciones de continuidad. La revisión principal de D14/D28, incluida la evaluación EP, también es opcional.

Formulario educativo uniforme de autorregistro 0–10, sin puntuación diagnóstica. Permite «No evaluable». Guarda en las actividades del usuario y plan actuales. D14 contextualiza el aprendizaje progresivo, sin prometer mejoría ni desestimar síntomas. D28 compara D1/D14/D28, muestra reflexión y plan de continuidad, y permite copiar el informe. Se conserva la evaluación específica de EP.

Si un usuario ya pasó el día 1 antes de esta revisión, no se inventa una línea basal nueva ni se convierten las respuestas iniciales de otra escala: el informe indica datos faltantes. Se mantienen las alertas médicas y la vía de corrección de respuestas marcadas por error.

La continuidad invita a consultar si persisten o empeoran las dificultades y recuerda no suspender medicamentos sin indicación profesional. Referencia de ese recordatorio: NIDDK, Treatment for Erectile Dysfunction, https://www.niddk.nih.gov/health-information/urologic-diseases/erectile-dysfunction/treatment.

## Validación y límites

Pruebas automatizadas de las seis rutas y variantes de deseo/firmeza, fichas únicas, frecuencias semanales, historias, pertenencia de videos, guardado de seguimientos, fallo de conexión, separación de cuentas y protección de seguridad. Se comprobaron los formularios y la comparación con DOM simulado.

La ejecución de Chromium local está bloqueada por permisos de sockets del entorno. La prueba de navegador `tests/integral-routes-browser.cjs` está preparada para CI; no se considera superada hasta ejecutarse allí. Queda pendiente la revisión visual en Safari/iPhone y el recorrido autenticado del despliegue. No es una validación de eficacia clínica ni una certificación de lanzamiento comercial.
