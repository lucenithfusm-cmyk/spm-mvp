# SPM Digital Wellness · Deseo · Día 2 — integración clínica completa

Fecha: 18 de noviembre de 2026. Paquete original: `SPM_Deseo_Dia02_Paquete_Final_6_Pantallas(1).zip`.

## Material aprobado y orden

Se conservan exactamente las imágenes originales proporcionadas, sin reconstrucción ni recortes:

1. `screen-01.jpg` (864 × 1536) — portada original «Tu patrón y tus contextos», 3 tarjetas intro y comenzar.
2. `screen-02.png` (941 × 1672) — seis opciones sobre qué se reconoce hoy.
3. `screen-03.png` (941 × 1672) — Mapa de influencia: estrés, cansancio, conexión con pareja, estímulos visuales.
4. `screen-04.png` (941 × 1672) — Mapa de influencia: contacto físico, novedad/variedad, estado de ánimo.
5. `screen-05.png` (941 × 1672) — recordar lugar, sentimiento, situación y elegir uno o dos detalles de contexto.
6. `screen-06.png` (941 × 1672) — elegir acción y reflexión opcional; guardar y continuar.

Se añadieron **dos GIFs transparentes de destellos secuenciales**, `brain-orbit-cover.gif` y `brain-orbit-context.gif`, alineados con los iconos del cerebro existentes. Las imágenes originales de usuario se conservan idénticas en bytes. Las tarjetas y barras de acción tienen un halo previo sutil; jamás se crea un anillo sobre los pequeños circulitos de selección ni en los puntajes. Se respeta `prefers-reduced-motion`.

## Fidelidad clínica

El currículo fuente `labs/desire/src/lib/desire-curriculum.ts` define Día 2 «Tu patrón y tus contextos» con `practiceId=pattern-observe`, recurso `r:influence` y `s:3`. El mapa de origen `labs/desire/src/components/desire/DesireCycle.tsx` utiliza exactamente siete claves: `stress`, `tired`, `partner`, `visual`, `touch`, `novelty` y `mood`. Las escalas son **cuánto influye** (0=nada, 10=mucho), **no** positivo/negativo y **no** intensidad de deseo. N/A se persiste como `null`. No hay valores preseleccionados ni se fuerza el 5 por defecto; el N/A debe pulsarse explícitamente para considerar respondido un factor. La elección de un valor sólo cambia su propia clave del mapa.

El recorrido no deja completar el día sin pasar por los siete factores. Una valoración puede ser N/A. Contextos realmente recordados y reflexión son opcionales: no se exige inventar experiencias favorables, y se ofrece una decisión explícita «Aún no identifico un detalle» para continuar sin inventar contenido. Las opciones de acción se conservan de la versión táctil aprobada; se preserva su voz estándar del dispositivo en es-CO y la segmentación de audios por botón. Se mantiene el recurso bibliotecario original; esta actualización no modifica la sesión de Aceleradores y Frenos del Día 5.

## Persistencia y seguridad

- El puente previo `premium-v2/desire-day2-bridge-v1.js` sigue intacto: sólo activa la experiencia en `primary=desire`, `day=2`, `origin=dailyPlan` y mantiene permisos y restricciones clínicas.
- Respuestas y contexto se guardan en `spm-desire-program.detailNotes.desireDay2TouchV2`; los siete valores se guardan en **`spm-desire-program.influence`** con sus mismas claves.
- Al pulsar «Guardar y continuar» se registra la sesión original `pattern-observe`, conservando los valores anteriores `before/after` si hay registro previo y evitando duplicidad. Se conserva `detailNotes.desireDay2TouchV1` sin borrar la historia.
- Al salir anticipadamente se guarda el avance, pero **no** se marca el día como completado. No se altera Día 1, Día 3, los otros 25 días, programas transversales, pasarela o pausa comercial.
- El visor independiente `premium-v2/desire-day2-review/index.html` utiliza únicamente `sessionStorage` de prueba separado de pacientes.

## QA

`node --test tests/desire-day2-touch.test.cjs`: 11 pruebas cubren imágenes y GIFs, validación de opciones, bloqueo del mapa, todos los rangos y N/A, notas y límites, guardado sin duplicados, conservación de datos previos, salida anticipada, biblioteca y seguridad. Se debe revisar adicionalmente la interacción táctil, la voz estándar y la estética en el teléfono antes de considerar la revisión visual definitivamente aprobada.
