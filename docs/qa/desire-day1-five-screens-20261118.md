# SPM Digital Wellness — Día 1 de Deseo · cinco pantallas táctiles (18/11/2026)

## Alcance aprobado
- Se conservan **exactamente** las cinco láminas 9:16 (864 × 1536) aportadas por dirección; son cada una la superficie completa de la pantalla, sin tarjetas añadidas, recortes ni rediseño.
- Se habilitan botones invisibles sobre áreas originales, selección accesible, puntuaciones 0–10, audio segmentado, cronómetro visible y opcional, anterior/siguiente, guardado y regreso a "Actividades de hoy".
- Los temporizadores de 5 y 3 minutos pueden pausarse y terminarse antes de la duración sugerida: no se exige un tiempo mínimo.
- Narración original del módulo: contenido aprobado en `labs/desire/src/components/desire/DesireCycle.tsx` y `labs/desire/src/lib/desire-curriculum.ts`; reproducción por `SpeechSynthesisUtterance` estándar en español `es-CO`, sin cambiar la voz del sistema ni generar audio nuevo.
- La secuencia original son dos prácticas: `presence-5` (primera exploración) y `explore-new-stimulus` (segunda exploración).
- Se conserva `spm-desire-program`, con sesiones completadas e identificadores de sesión idempotentes, y la clave adicional `detailNotes.desireDay1TouchV1` para respuestas y posición de las pantallas. No se borra ningún registro existente.
- El puente `desire-day1-bridge-v1.js` intercepta solo `primary=desire`, `day=1` y `origin=dailyPlan`; la biblioteca, el calendario de los días 2–28, erección, eyaculación, focalización y los módulos transversales siguen usando su controlador habitual.
- Se preservan restricciones de seguridad: no se monta la práctica si SPM Daily la considera restringida.
- La prueba independiente `/premium-v2/desire-day1-review/` usa almacenamiento simulado aislado del usuario real y no contiene pagos.

## Recorrido funcional
1. Pantalla 1 — elegir forma de deseo y escuchar explicación / elección.
2. Pantalla 2 — tres áreas con fragmentos narrados de la práctica, iniciar el temporizador de 5 minutos.
3. Pantalla 3 — presión antes/después, qué notó, guardar primera sesión.
4. Pantalla 4 — elegir música, imagen o textura, guía e iniciar temporizador de 3 minutos.
5. Pantalla 5 — comodidad 0–10, repetir sí/tal vez/no, guardar segunda sesión y volver a Hoy.

## Pruebas locales efectuadas
- Comprobación de sintaxis de controladores JavaScript.
- Prueba de navegador Chromium de los 5 pasos: validación de respuesta, selección, pausa/reanudación de temporizadores, guardado de las dos sesiones, regreso a Hoy, persistencia y no duplicación en un segundo guardado.
- Antes de la publicación para pacientes es necesario revisar el despliegue Vercel en móvil (especialmente voz estándar e interacción real con backend). No se declara certificación de otras rutas.

## Recursos
`premium-v2/assets/desire-day1/screen-01.jpg` hasta `screen-05.jpg`: imagen original sin edición. `premium-v2/desire-day1-touch-v1.js`, `.css` y `premium-v2/desire-day1-bridge-v1.js`.
