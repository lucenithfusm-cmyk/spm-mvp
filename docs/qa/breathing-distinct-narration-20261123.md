# Respiración · sin bocina duplicada y con voces propias de la comparación

Fecha: 23 de noviembre de 2026.
Rama de revisión: `fix/spm-audio-fullscreen-20261120`.
PR: https://github.com/lucenithfusm-cmyk/spm-mvp/pull/84
Base remota: `f9884e8fabd65c99a825e133d6679741103bf162`.

## Solicitud vigente

Después de comprobar la bocina superior, la propietaria pidió retirarla porque repetía el audio del botón de explicación. Solicitó narraciones distintas al seleccionar pecho o abdomen en el día 3, y reemplazar los controles de animación del día 6 por un audio con las indicaciones para acomodarse. Esta solicitud sustituye el comportamiento de la bocina superior descrito en `breathing-controls-20261123.md`.

## Experiencia resultante

- Se retira la bocina de la cabecera de todas las pantallas de Respiración: recorridos diarios y biblioteca. Se conservan marca, progreso, contador e índice de la biblioteca.
- Los botones de contenido «Escuchar explicación», «Escuchar el recordatorio» y «Escuchar instrucción» conservan sus grabaciones aprobadas y su apariencia dorada. Seguridad tiene su explicación en el contenido.
- En la primera pantalla del día 3, cada opción de comparación inicia su propio audio y el efecto visual. Tocar otra opción sustituye la voz anterior; volver a tocar la misma opción la reproduce de nuevo. La explicación general sigue en su botón independiente.
- Se eliminan los botones Activar/Pausar/Reanudar animación de los recorridos. La ilustración de comparación responde a los dos selectores; las ilustraciones independientes presentan un efecto automático breve. La voz nunca arranca por entrar en una pantalla.
- El efecto sin controles dura un ciclo ilustrativo de cuatro segundos y termina. En las imágenes independientes espera a que la imagen haya cargado y al menos la mitad esté visible, para que el efecto no se agote antes de llegar a ella en el móvil. Sus rótulos indican expansión/regreso ilustrativos, sin dar un nuevo ritmo de respiración. La preferencia de movimiento reducido conserva la imagen estática. Ocultar la página o consultar seguridad cancela la animación y cualquier inicio pendiente.
- En la preparación de «Suelta y regula», debajo de la imagen aparece «Escuchar audio». Lee las indicaciones «Acomódate antes de empezar» y sustituye la tarjeta abierta que repetía ese título y texto. La transcripción sigue disponible en «Leer explicación», cerrada inicialmente. El recordatorio clínico del día conserva su botón y su grabación distinta.
- La primera práctica de Erección conserva su guía extendida únicamente en su primera etapa activa; se retira también mientras se consulta Seguridad. Sus controles y los de narración nativa se detienen mutuamente antes de reproducir.

## Narraciones nuevas

Se usa la misma voz existente del programa: **Lenny – Clear & Professional**, verificada como activa en el catálogo de HeyGen. Idioma español, velocidad de generación 0,95, reproducción 1×. Se generó una sola toma de cada guion; los MP3 descargados se conservan sin edición.

| Acción | Identificador | Guion exacto | Duración medida |
| --- | --- | --- | --- |
| Torácica · pecho | `comparison.chest` | Observa el pecho y los hombros. Se mueven pecho y hombros. Ritmo rápido y corto. Acompaña estrés y tensión. | 8,307 s |
| Diafragmática · abdomen | `comparison.diaphragm` | Observa el abdomen. Se mueve el abdomen. Ritmo lento, exhalación larga. Favorece calma y control. | 8,281 s |
| Escuchar audio para acomodarte | `instruction.prepare` | Acomódate antes de empezar. Espalda apoyada, hombros sueltos. Sin esfuerzo ni ruido: suave es suficiente. Respirar lento debe sentirse cómodo. Si aparece mareo o malestar, detente y respira normal. | 15,047 s |

La procedencia, ajustes, guiones, duraciones, SHA256 y tiempos de palabras están en `labs/breathing/src/assets/audio/practical-guidance-manifest.json`. Son MP3 mono, 44,1 kHz y 128 kbps. Los tres se decodificaron completos sin errores. La comprobación de texto usa los tiempos devueltos por HeyGen; no equivale a una escucha humana independiente, que no estuvo disponible durante la generación.

Se conservan los 22 audios originales y las dos instrucciones diarias. Los nuevos clips usan el mismo reproductor exclusivo: no se superponen a otros audios, video o pacer. Si falla un archivo, se mantiene la lectura del mismo texto con la voz estándar del dispositivo, como en el comportamiento previo.

## Límites del cambio

No se modifica el calendario, los tiempos/ciclos del pacer, las reglas sin pausa, las asignaciones ni el guardado en Central. Las interacciones de explicación y comparación no registran una sesión ni completan el día. Las imágenes y videos originales se conservan.

## Verificación y entrega

La suite comprueba ausencia de bocina superior, explicaciones de contenido sin el control duplicado, selección con voz propia, parada al cambiar/navegar, controles de animación ausentes, efecto breve automático, movimiento reducido, seguridad y conservación del guardado. Los clips nuevos se verifican contra sus SHA256 y guiones; las pruebas previas de exclusión de audio y fallback siguen activas.

Verificación local completada: **151 pruebas aprobadas** —106 del módulo, 20 del bridge y 25 del visor—, TypeScript y build de Respiración aprobados, 29 medios originales con SHA256 intactos y sintaxis del script de navegador válida. Comandos: `npm run typecheck`, `npx vitest run`, `npm run build`, `sha256sum --check media-sha256.txt`, pruebas Node del bridge y del visor, y `node --check tests/breathing-lab-browser.cjs`. La inspección móvil del despliegue se registra en la PR, separada del estado del CI general.

Versión de carga: `20261123-breathing-narration2`. Entrega en la rama de revisión y en `spm-premium-staging`, del equipo `lucenithfusm-cmyk`, según la autorización vigente. La PR permanece en borrador; los enlaces temporales de acceso no se incluyen en el repositorio público.
