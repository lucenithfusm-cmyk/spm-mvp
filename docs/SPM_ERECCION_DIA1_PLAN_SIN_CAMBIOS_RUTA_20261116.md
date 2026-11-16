# SPM · Erección y firmeza — Día 1 · Revisión clínica y visual, sin modificar rutas
Fecha: 16 de noviembre de 2026. **Estado: propuesta independiente, NO publicada, sin conexión a Hoy.**

## Punto de partida
Se revisaron los pantallazos actuales de los días 1 y 2. El día 1 presenta una evaluación de firmeza con lámina médica EHS educativa; el día 2 registra contextos (espontáneo/despertar, individual y pareja). La estructura de 28 días y el motor transversal permanecen INTACTOS.

## Objetivo de la modificación interna
Convertir el día 1 en cinco pantallas premium, empleando la metodología visual del módulo **Focalización** (una imagen aprobada funciona como pantalla, zonas HTML táctiles superpuestas, bocina, secuencia, registro). **No usar sus actividades clínicas**.

1. **Pantalla de entrada:** preservar «Reconoce tu punto de partida», audio breve y botón de inicio.
2. **Evaluación:** conservar lámina médica de firmeza de SPM, grados 4–1; las opciones 0 y «No evaluable» son distintas. Basarse solo en experiencia reciente, sin inducir nueva erección.
3. **Comprender el mecanismo vascular:** lámina educativa realista sobre flujo sanguíneo y respuesta eréctil, explicada en audio, sin exigir lectura.
4. **Mi primera acción específica:** ensayo erótico breve **opcional** de 2–3 min, en privacidad y sin objetivo de firmeza, basado en un recuerdo o fantasía elegida por el adulto, o posibilidad de omitir sin penalización. Solo introducción y práctica, no una segunda EHS. Reservar el entrenamiento eréctil estructurado para su día original; revisar posibles solapamientos antes de integrarlo.
5. **Cierre:** mostrar «Tu primer paso está hecho» y guardar el valor EHS inicial mediante la misma actividad `main` y el sistema de registros ya existente.

## Separación clínica
- La **EHS inicial** se mide antes de cualquier práctica y no se repite el mismo día.
- Una práctica guiada breve NO garantiza oxigenación peneana ni aumento inmediato de firmeza. La recomendación de actividad física regular y control de factores vasculares pertenece al programa transversal y no se repite aquí.
- La práctica del día 1 es de bienvenida/iniciación, NO sustituye ni duplica las sesiones posteriores más extensas de entrenamiento eréctil, recuperación, focalización o fortalecimiento.
- Ningún usuario debe ser obligado a estimularse sexualmente para completar una medición o avanzar.
- Se mantienen señales de alarma y restricciones médicas del motor SPM.

## Integración futura, circunscrita al día 1
**NO cambiar:** `SPM_DAILY_SUPPORT`, `SPM_DAILY_RESOURCES`, `SPM_MODULES`, calendario, cadencias pélvicas, asignación de Movimiento/Nutrición/Focalización/Respiración, validación de días 2–28.
Usar los campos guardados por `SPM_ERECTION_PRACTICE` (`erectionPracticeVersion:1`, `day:1`, `ehs`, `ehsEvaluable`, `confirmed`, `anxiety`, `confidence`) y persistir únicamente `main` a través de `SPM_DAILY_PRACTICE.saveActivity`.
Cualquier campo nuevo para indicar práctica opcional debe ser no bloqueante y compatible con registros previos.
No activar la interfaz nueva si no se han cargado sus recursos gráficos o audios; no dejar imágenes rotas ni botones inertes.

## Narraciones
Los cinco guiones completos y el esquema de interacción están codificados en `premium-v2/erection-day1-content-draft.js`. Antes de grabar, revisar lenguaje clínico, tono adulto y voz final. La grabación EHS ya presente se conserva hasta sustituirla por otra aprobada.

## Fuentes revisadas
- `premium-v2/erection-practice-v1.js`: sesión del día 1 y registro real de firmeza.
- `premium-v2/firmness-guide-v1.js`: lámina EHS original.
- `premium-v2/sensate-premium-v1.js`: patrón de pantallas visuales y controles táctiles.
- Guía EAU (2026): historia sexual, rigidez de erecciones y valoración de factores de riesgo son parte del abordaje de DE.

**Este borrador NO es una orden de reestructurar ruta ni autoriza desplegar cambios en producción.**

## Estado técnico de prueba (actualizado)

Se creó `premium-v2/erection-day1-premium-preview-v1.js` y se incorporó exclusivamente a `premium-v2/live.html` **de esta rama de revisión**. El script intercepta únicamente la apertura de `SPM_ERECTION_PRACTICE.open` para la actividad principal del **día 1**. Las demás 27 jornadas y los apoyos transversales continúan con las funciones originales.

- Pantallas táctiles provisionales (5): introducción, selección EHS, explicación vascular, primera acción opcional y cierre.
- El audio de EHS utiliza el MP3 original del día 1; los otros cuatro son síntesis provisional según la voz disponible en el dispositivo, todavía no locuciones premium aprobadas.
- La lámina médica original conserva su control de ampliación.
- El registro se guarda con el identificador original `main`; los datos EHS mantienen los valores y semántica previos.
- La imagen fotográfica de portada y la lámina anatómica premium definitivas **todavía no están incorporadas a este prototipo**. Los dibujos SVG de la vista preliminar no reemplazan las imágenes aprobadas.
- Pruebas programáticas: compilación JavaScript, rutas de los días 2–28 inalteradas, campos de validación y función `supports` originales intactos, sin referencias a rutas transversales, y orden correcto de carga.
- **Pendiente:** revisión clínica de la microacción, revisión visual en móvil, calidad de audios, validación con usuario de prueba y posterior decisión sobre una integración definitiva. No existe publicación en producción.

**Advertencia:** un despliegue de vista preliminar en Vercel no equivale a aprobación clínica ni a que la nueva experiencia esté publicada para los pacientes.
