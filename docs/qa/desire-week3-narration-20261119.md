# Deseo · Semana 3 · revisión de narración

Fuente: paquete `SPM_Deseo_Semana03_Dias15-21`, sus guías y `PANTALLAS_TEXTOS_Y_AUDIOS.json`, contrastados con `labs/desire/src/lib/desire-curriculum.ts` y las reglas existentes de sesiones. No se modifican los JSON ni los PNG originales.

## API y cobertura

`premium-v2/desire-week3-v1/narration.js` exporta el mismo mapa mediante `window.SPM_DESIRE_WEEK3_NARRATION` y `module.exports`: `{screenId: {controlId: texto}}`. Las claves corresponden al manifiesto de controles original.

Incluye 33 guías de pantalla y 42 mensajes para opciones, modalidades, conceptos, fases y pasos. La guía orienta el paso actual; cada control aporta su indicación propia. Se separaron especialmente los textos duplicados de D16 (zonas y cierres), D19 (preparación y fases), D20 (selección y pasos) y D21 (entrada, diario y estado vacío). El cierre de D18 funciona tanto para la conversación como para la alternativa individual.

## Reproducción

- Reproducir sólo por una acción deliberada, con voz estándar del dispositivo en español.
- Detener la voz anterior antes de otro mensaje. Desmarcar una opción detiene la voz y permanece silencioso.
- No concatenar una guía general al texto de una opción. Los controles deshabilitados no narran.
- Escalas, N/A, confirmaciones y la respuesta clínica `comfortable` no tienen una narración de confirmación: conservan su etiqueta accesible.
- `audio-guide` siempre puede repetirse manualmente. La narración no inicia, completa ni amplía automáticamente la actividad.

## Significado conservado

Fase I mantiene contacto no genital y sólo zonas accesibles con comodidad. Fase II conserva interés actual, acuerdo en pareja y posibilidad de volver o parar, sin metas de erección u orgasmo. Los botones de ritmo no imponen BPM ni movimientos automáticos. El cronómetro sigue siendo opcional y ascendente.

El texto de D19 en pausa sólo corresponde al fallback permitido a fase I; no sustituye la pausa de Central, la alerta aguda ni la alternativa clínica `presence-5`. La narración no habilita el gate ni modifica registros.

La integración debe mantener `comfort` numérico separado de `comfortable` Sí/No/N/A, D21 como reflexión sin checkpoint y las métricas opcionales sin valores inventados.

## Integración en la continuación de semana 3

La continuación sobre `c64dea1` carga `narration.js` antes de `app.js`. `narration(screen)` consulta la guía de la pantalla y `smallAudio(control, screen)` consulta el mensaje específico del control. Los radios de modalidad, cercanía y ruta, las opciones de ritmo/contexto y los controles de fase usan esa misma tabla. Si el archivo no está disponible o el identificador es desconocido, se conserva el respaldo de texto que ya tenía la aplicación.

Se resuelven los duplicados completos entre D16_03/D16_04, D20_01/D20_02 y D21_01/D21_02, incluida la variante D21_02a. También se separan los cierres que antes repetían instrucciones anteriores de D18, D19 y D21. En la alternativa individual de D18, el cierre dice «al expresar o escribir lo que quieres» y no presupone una conversación en pareja.

Las respuestas clínicas de comodidad Sí/No/N/A permanecen sin narración añadida. Las selecciones pronuncian sólo su mensaje breve; desmarcar una opción no genera otro audio. La guía del pie y la bocina de la imagen pronuncian el mismo texto específico del paso. No hay narración automática al entrar ni se inicia o completa una práctica por escuchar.

Los enlaces de ayuda usan `index.html` para conservar el host real de la revisión. Se mantiene el menú estático y la recuperación de arranque existente. No se modifican las 33 imágenes, el puente de Central ni sus reglas de guardado.

## Validación local de esta integración

- `node --check` de `app.js` y `narration.js`: aprobado.
- `node --test tests/desire-week3-app.test.cjs tests/desire-week3-bridge.test.cjs`: 32 aprobadas, 0 fallidas.
- Las pruebas nuevas ejercitan la voz solicitada por botones reales, la separación de guías repetidas, el cierre individual de D18, los 33 identificadores de pantalla y 42 mensajes de control, el silencio de desmarcado/respuestas clínicas y el respaldo cuando falta la tabla.
- Esta comprobación observa solicitudes de voz. La audición real y el recorrido visual en móvil requieren revisión en navegador y dispositivo; no se declaran aprobados por estas pruebas.
