# SPM · Narraciones de referencia · Semana 1 · Erección y firmeza

**Fecha:** 2026-11-16  
**Estado de generación al solicitarlas:** queued, NO verificado como MP3 listo/descargable.  
**Destino:** documentación de la rama de trabajo; no se han conectado audios externos directamente al sitio.

Estas siete solicitudes se crearon con el contenido del archivo `premium-v2/erection-week1-blueprint-v1.js`. Son narraciones completas intro + tres pasos + cierre; las llamadas aisladas y temporizadas se generan con `getAudioText(day, part)`.

| Día | Sesión | Enlace del servicio de voz |
|---|---|---|
| Día 1 | Reconoce tu punto de partida | https://www.aidocmaker.com/g0/audio?name=e36c6dec34774b8fab2137a7a864ef3e |
| Día 2 | Descubre tu patrón | https://www.aidocmaker.com/g0/audio?name=16772d9e2d564b2880c60a50ada3148d |
| Día 3 | Suelta la alerta | https://www.aidocmaker.com/g0/audio?name=1b59d948dcd54e3e98ff0b350e2ea2e2 |
| Día 4 | Deja de comprobar | https://www.aidocmaker.com/g0/audio?name=22e260aefd2d45e09b961bca1fedb31d |
| Día 5 | Ajusta lo que te ayuda | https://www.aidocmaker.com/g0/audio?name=aca46335bbf3476aad255a6ca97e2a02 |
| Día 6 | Reconoce tu piso pélvico | https://www.aidocmaker.com/g0/audio?name=c6ee3ae61dac4640a9c34880fe3b3ee0 |
| Día 7 | Quédate con lo que funciona | https://www.aidocmaker.com/g0/audio?name=48cec55c458b4edb8a97937076249ffe |

## Requisitos antes de integrar
- **Comprobar disponibilidad, calidad, voz, claridad y pronunciación**; estas solicitudes no están verificadas como archivos MP3 finales.
- Confirmar que Dr. SPM, si se identifica expresamente como personaje, tenga voz femenina; la voz generada automáticamente de prueba no ha sido validada con ese criterio.
- Solo publicar rutas de audios MP3 hospedados por SPM; no tratar páginas del servicio como URLs directas de audio en elementos `<audio>`.
- Usar un audio de entrada y clips por paso; evitar que la introducción se repita en cada pantalla.
- El manifiesto incorpora síntesis de voz del navegador con preferencia por voces en español como **solución provisional**. Depende de la disponibilidad del dispositivo y no garantiza voz femenina.
- Preservar locuciones y audios de otros módulos, sin volver a publicar ni duplicar las sesiones existentes.
- No avanzar el día automáticamente al reproducir o finalizar un audio.

## Implementación por otro chat
1. Descargar los audios si ya están disponibles y escucharlos; si no, generar locuciones finales a partir de los 35 fragmentos del manifiesto, en español natural, tono profesional, sin aceleración.
2. Guardar en `premium-v2/assets/audio/erection-week1/`, por ejemplo `dia-01-intro.mp3`, `dia-01-paso-1.mp3`, ..., `dia-01-cierre.mp3`.
3. Actualizar `AUDIO_FILES` en `erection-week1-blueprint-v1.js`, no crear una capa de reproducción paralela.
4. Conectar con las zonas táctiles de las siete pantallas.
5. Verificar en iOS Safari y Android Chrome, particularmente reproducción tras tocar bocina, parada al retroceder, audios no superpuestos, guardado y retorno a Hoy.
