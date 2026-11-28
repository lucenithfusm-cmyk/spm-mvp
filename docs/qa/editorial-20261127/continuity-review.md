# Revisión adicional de continuidad · 27/11/2026

## Alcance leído

Se leyeron los estados de Hoy/agenda, guardado, cierre, salida, error y recuperación; el visor sintético; DailyCoach y sus controles; las 14 guías de microcápsulas EP con transcripción; y 28 pares de ayudas cotidianas/individuales. `continuity-review.json` conserva las claves exactas, la fuente y sus hashes. La extracción hace trazable esta lectura, sin convertir automáticamente otros candidatos AST en contenido revisado.

## Cambios concretos

19 cambios textuales adicionales: 4 estados/descripciones de Hoy, 4 guías EP (con su transcripción) y 11 ayudas. Se matizan resultados demasiado seguros y se admite ausencia de experiencia o cambios. No se cambian técnicas, dosis, zonas, escalas, restricciones ni requisitos de cierre.

La inspección de las 14 imágenes originales encontró titulares integrados distintos de los títulos/guías revisados. La presentación conserva los bytes de la ilustración y el formato 9:16, y muestra un título HTML legible, Escuchar/Detener y transcripción. El encuadre superior excluye la frase antigua; no se declara que un cambio de alt haya corregido los píxeles.

DailyCoach tenía respuestas preseleccionadas. El defecto se reportó a root, que implementó selecciones explícitas, No evaluable→null, validación sin Number(vacío)→0 e idempotencia del registro. El guardado del check-in y el cierre de la jornada permanecen separados. Las pruebas de esa implementación se documentan en el grupo backend/app.

## Evidencia

- `continuity-changes.json`: 19 pares exactos antes/después de este grupo.
- `continuity-review.json`: paquetes leídos, revisados sin cambio o modificados, fuentes y14 títulos bitmap antes/después.
- `tests/editorial-continuity-20261127.test.cjs`: 14 guías/transcripciones y bytes originales; 14 carteles HTML 9:16, controles de voz y ausencia de guardados al escuchar.
- `continuity-tests.tap`: 98/98 casos aprobados, 0 fallos y 0 omitidos; 96 casos existentes de agenda/Hoy/visor más 2 nuevos que recorren las 14 cápsulas.

## Verificación visual y límite

Las14 imágenes originales se examinaron visualmente con view_image. La presentación nueva necesita cotejo de render en el preview cloud que prepara root: no hay binario Chromium local operativo. El DOM y la equivalencia de guion/texto sí tienen prueba automática. La reproducción audible física y los 12 videos con guion pendiente siguen documentados por el grupo de voz.

## Paquetes

| Paquete | Fuente | Entradas |
|---|---|---:|
| continuity-today-states | premium-v2/daily-practice-v1.js | 189 |
| continuity-daily-advice | premium-v2/daily-practice-v1.js | 56 |
| continuity-agenda-states | premium-v2/agenda-v2.js | 16 |
| continuity-program-recovery | premium-v2/program-recovery-v1.js | 21 |
| continuity-reviewer-states | premium-v2/program-review-v1.js | 47 |
| continuity-app-persistence | premium-v2/app-live.js | 58 |
| continuity-live-coach-controls | premium-v2/live.html | 1 |
| continuity-free-assessment-coach-controls | premium-v2/free-assessment.html | 1 |
| continuity-ep-capsule-1 | premium-v2/daily-practice-v1.js | 2 |
| continuity-ep-capsule-3 | premium-v2/daily-practice-v1.js | 2 |
| continuity-ep-capsule-5 | premium-v2/daily-practice-v1.js | 2 |
| continuity-ep-capsule-7 | premium-v2/daily-practice-v1.js | 2 |
| continuity-ep-capsule-9 | premium-v2/daily-practice-v1.js | 2 |
| continuity-ep-capsule-11 | premium-v2/daily-practice-v1.js | 2 |
| continuity-ep-capsule-13 | premium-v2/daily-practice-v1.js | 2 |
| continuity-ep-capsule-15 | premium-v2/daily-practice-v1.js | 2 |
| continuity-ep-capsule-17 | premium-v2/daily-practice-v1.js | 2 |
| continuity-ep-capsule-19 | premium-v2/daily-practice-v1.js | 2 |
| continuity-ep-capsule-21 | premium-v2/daily-practice-v1.js | 2 |
| continuity-ep-capsule-23 | premium-v2/daily-practice-v1.js | 2 |
| continuity-ep-capsule-25 | premium-v2/daily-practice-v1.js | 2 |
| continuity-ep-capsule-27 | premium-v2/daily-practice-v1.js | 2 |

Las entradas compartidas pueden contener etiquetas o ramas de una misma pantalla. No se suman como nuevas actividades ni como duración del programa.
