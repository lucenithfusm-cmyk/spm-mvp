# SPM Premium — staging para revisión

No fusionar a main hasta que Lucenith valide staging. No está aprobado para pacientes nuevos todavía.

## Implementación

- Response Tracker transversal: EHS 1–4, ausencia de erección separada y excitación subjetiva 0–10 con medidor semicircular táctil/teclado. Fecha, día y contexto; historial.
- Confianza antes/durante/después y seis evidencias conductuales. Permite registrar conducta sin inventar cifras de confianza.
- Recuperación: siete situaciones, acciones inmediatas, comunicación, qué evitar, cierre y preparación del siguiente encuentro. Entrenador con elecciones y retroalimentación específicas por situación; respuesta Me ayudó/Parcialmente/No esta vez.
- Plato SPM y seis fichas alimentarias bilingües; siete actividades de movimiento con dosis orientativas, precauciones y registro de esfuerzo/tolerancia. Restricciones de evaluación/checkpoints bloquean las rutinas.
- Un complemento opcional por día, con rotación y adaptación a perfil, alertas y recuperación reciente. Historial en días 7/14/21/28; resúmenes en Performance Map y Progreso. No sustituye el motor original ni sus microacciones.
- Recompensas por registros, evidencia conductual y días completados. Los registros resource:* no cuentan como días completados.
- Demostración respiratoria vectorial funcional reemplaza la imagen dañada; el guion y voz existentes se conservan.
- Cuatro videos Doctor SPM optimizados para eliminar los márgenes blancos incrustados; originales intactos y fallback al original. Reproductor mantiene proporción, sin rotación. Duración y flujo AAC idénticos a los originales.
- ES/EN, controles táctiles, teclado en medidor, foco de diálogo, safe areas, animaciones de movimiento/escenas según visibilidad y reduced-motion.
- Corrección Safari/MutationObserver de c7472e1 conservada. Scoring, oferta/precio, módulos originales e Insights no modificados.

## Archivos principales

Nuevos: premium-v2/spm-resources.js, spm-resources-content.js, spm-resources.css, spm-breathing-visual.js y assets/videos/dr-spm-{vascular,metabolic,medications,performance-anxiety}-content.mp4.

Integración: premium-v2/app-live.js, returning-user-router-v3.js, premium-training-v4.js, spm-inline-video-player.js, live-v4.html, commercial-pilot.html.

Verificación: package.json, package-lock.json, vite.config.mjs, tests/resources.test.cjs, tests/app-integration.test.cjs, tests/mock-api.js, tests/resources-review.html, tests/viewport-review.html. Los fixtures no se copian al sitio de staging.

## Evidencia de esta revisión

- 13 pruebas Node/jsdom: ES/EN, formularios, validación EHS/excitación, guardado y reintento offline, aislamiento entre cuentas, interrupción de reintento tras cambio de usuario, evidencia conductual sin cifras, alertas de movimiento, rotación diaria, 100 refreshes idempotentes, arranque con usuario limpio y restauración con registros previos sin completar días por error.
- Chrome con datos sintéticos: EHS y excitación guardados a 375 px; recuperación con feedback específico y registro; movimiento en EN, ficha bicicleta, registro de minutos/esfuerzo y bloqueo por alerta; video real reproducido a 375/1200 px; demostración respiratoria visible. Recursos revisados también a 768 px.
- Base de datos real, lectura de esquema y políticas: columnas compatibles, RLS activo y políticas por user_id. No se escribieron datos clínicos ni se modificó el esquema.
- Verificación ffprobe de los cuatro videos y comparación SHA-256 del flujo de audio AAC: misma duración y audio idéntico.
- Las comprobaciones con datos sintéticos no prueban autenticación real ni RLS extremo a extremo.

## Pendientes obligatorios antes de main

1. Revisión de Lucenith: estética/anatomía EHS, nuevos textos ES/EN, recuperación, variedad del plan y dosis de movimiento.
2. iPhone/Safari y Android/Chrome físicos: motivos, Continuar, Insights, reproducción, arrastre y ausencia de congelamientos. Las pruebas a ancho móvil en Chrome no equivalen a estas plataformas.
3. Login/registro, recuperación de cuenta y escritura/recarga con una cuenta real de prueba.
4. Recorrido completo de checkpoints y cierre Día 28 con cuenta de prueba; aquí se verifican la integración y filtros, no 28 días reales ni todas las transiciones clínicas.
5. La distribución agrega un complemento opcional al plan existente. Validar clínicamente su frecuencia antes de sustituir actividades principales.

Staging es un frontend separado que conserva el backend del piloto: usar una cuenta de prueba. No se creó otra base de datos.

## Fuentes educativas

- NIDDK: https://www.niddk.nih.gov/health-information/urologic-diseases/erectile-dysfunction/eating-diet-nutrition
- EAU: https://uroweb.org/guidelines/sexual-and-reproductive-health/chapter/management-of-erectile-dysfunction
- OMS: https://www.who.int/news-room/fact-sheets/detail/healthy-diet

Apoyan el enfoque educativo general. Las microescenas y la distribución diaria son contenido del producto pendiente de aprobación clínica, no protocolos individualmente validados.
