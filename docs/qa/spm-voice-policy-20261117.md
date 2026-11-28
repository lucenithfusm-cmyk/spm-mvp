# SPM · Política vigente de voz, 27 de noviembre de 2026

La orden actual de Lucenith sustituye la decisión de 17/11 reproducida abajo. Todas las narraciones deben usar la voz estándar del dispositivo, sin filtro de nombre, género ni proveedor, incluido el contenido hablado de videos. No existe una excepción vigente para Lenny ni para un personaje.

Implementación: `device-voice-v1.js`, coordinador compartido por pantallas e iframes de igual origen. Español `es-CO` por defecto, sin asignar `voice`. Recuperación por elección explícita de variante/voz expuesta por el dispositivo, texto equivalente, reintento por gesto, cancelación por generación y reanudación desde párrafo. Escuchar no escribe progreso.

El inventario y la matriz `spm-voice-20261127-*` distinguen migración de controles, guiones existentes y piezas audiovisuales pendientes de transcripción/material fuente. Las pruebas de eventos no acreditan audio audible ni Safari/iOS o Android reales. Mantener los resultados no comprobados expresos.

---

## Historia (política sustituida, no vigente)

# SPM Digital Wellness · Política de narración aprobada

**Decisión de dirección clínica y editorial, 17 de noviembre de 2026.**

- Voz de marca para nuevas narraciones: **Lenny — Clear & Professional** (referencia aprobada en `labs/breathing/src/assets/audio/lenny-manifest.json`, HeyGen Voice ID `050c403a43e047c796f8a6257ed2533e`). Utilizarla únicamente si se puede generar/recuperar la voz legítima y verificar el resultado.
- **Alternativa autorizada:** voz estándar en español elegida por el dispositivo/navegador, con `SpeechSynthesisUtterance` y **sin seleccionar voces por nombre o género**.
- No introducir por defecto **Rocío, Sofía ni otras voces femeninas de proveedor** como reemplazo de Lenny. Una voz solicitada para una escena o personaje concreto **no es autorización de uso en todos los módulos**.
- Respetar las voces de personajes o las excepciones expresamente aprobadas (por ejemplo, la voz femenina de **Dra. SPM** en sus intervenciones); no alterar sus recursos existentes al modificar una guía de otra actividad.
- No reutilizar un audio solo porque su día antiguo coincida: verificar que la narración corresponde al tema clínico de la actividad nueva.
- Mantener narraciones completas, sin cortar frases ni modificar su ritmo por programación; verificar la escucha en el teléfono.
- No cambiar imágenes aprobadas ni incorporar voces nuevas sin indicación de la usuaria.

## Implementación inmediata · Erección y firmeza, Día 15

Se retira de la ejecución el audio `erection-day15-stimuli-20261117.mp3` (Rocío, no aprobado para esta actividad). La **pantalla principal y el visor de revisión** utilizan exclusivamente la voz estándar del dispositivo en español `es-CO`. La pista anterior se conserva como archivo histórico, **no se reproduce ni es fuente de respaldo**. No se altera el guardado, la selección táctil, el calendario, las prácticas transversales ni la pausa comercial.

**Nota de procedencia:** el manifiesto original documenta Lenny, pero la conexión actual con HeyGen no devolvió esa voz en los catálogos públicos o privados consultados en esta revisión. No simular que otra voz es Lenny.
