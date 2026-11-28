# SPM · Voz estándar del dispositivo · implementación y QA

Fecha: 27/11/2026. Referencia comparada: `c27bbbba0292513b898d0684a30a95cd1e4e6449`. Alcance: anexo 01, §§1–3 y criterios A01–A08; cambio técnico acotado de la salida del flujo pélvico semanal. No es una aprobación acústica ni una certificación de producción.

## Resultado

La narración de texto se centraliza en `premium-v2/device-voice-v1.js`. La configuración inicial no asigna una voz, solicita `es-CO` para español y conserva el idioma del contenido inglés. No busca nombres, género o proveedor; una voz estándar femenina es válida. Solo la recuperación elegida por la persona puede seleccionar otra variante española o una voz disponible en su equipo.

Se ejecutaron **361 pruebas locales, con cero fallos en las tres tandas registradas**: 76 de contrato e integración, 247 de pantallas y regresión, y 38 del controlador Respiración. Los tests usan código real de aplicación y eventos nativos sintéticos; los casos React se compilan desde las fuentes actuales. No se escuchó audio de un móvil real. Estas cifras se refieren a las tandas de voz; la suite global tiene un reporte independiente.

La demo final de respiración se implementó con seis frases que coinciden exactamente con el `FINAL_TRANSCRIPT` publicado en la referencia. Cada escena muestra un fotograma original y texto, permite escuchar, pausar, repetir el párrafo, detener y avanzar voluntariamente. El final del audio no avanza la escena ni acredita una práctica. El vídeo original completo sigue accesible como movimiento silenciado. Falta cotejar acústicamente el texto contra la pista original y caracterizar cualquier ambiente útil.

**Doce vídeos de Biblioteca permanecen como dependencias concretas de material fuente**. Sus descripciones y actividades posteriores no son transcripciones. Se conserva el vídeo original disponible; no se reemplaza una narración completa por un resumen. Por ello la migración de toda voz incrustada sigue parcial y el criterio A06 no se da por aceptado.

## Coordinación y comportamiento

- Un propietario y una generación gobiernan cada narración. Iniciar otra guía invalida los callbacks y fragmentos anteriores. Se cancela al cambiar contexto/cuenta/día, cerrar u ocultar una actividad, salir de la página o retirar su iframe, incluso sin `pagehide`.
- Los iframes del mismo origen reciben un cliente del coordinador de la página. No crean otra cola nativa. El reproductor común y el de checkpoints son adaptadores de esa misma API.
- La voz empieza con escuchar/reanudar o con la activación explícita de señales. `voiceschanged`, abrir una página, restaurar sesión y cambiar de día no reproducen voz. La lista inicial vacía no bloquea el intento estándar.
- La espera de inicio termina en ocho segundos si no llega `onstart`. No hay un corte máximo arbitrario de la duración completa. Los fragmentos conservan palabras, puntuación y orden; solo un `onend` vigente inicia el siguiente.
- Pausar cancela el fragmento actual. Reanudar lo repite y el control informa «Reanudar desde este párrafo». No se promete continuación exacta por palabra ni sincronía labial.
- Ante error, el texto completo, el reintento y las opciones de recuperación siguen visibles. Se maneja ausencia de API, rechazo por activación, idioma/voz no disponibles, red, hardware y salida ocupada, con mensajes breves. Los callbacks antiguos que cancelaban dentro de `onerror` ya no ocultan el panel común.
- Reproducir medios con sonido cancela la voz; la voz pausa medios con sonido. Un vídeo silenciado o marcado como no verbal no cancela la narración que ilustra.
- No se incorpora proveedor TTS, micrófono, lectura automática de respuestas personales ni escritura de progreso desde el coordinador. La voz ofrecida por el navegador puede ser local o remota; no se promete funcionamiento sin conexión.

## Superficies y procedencia

El inventario contiene **90 archivos fuente, 279 puntos candidatos de llamada y 965 textos candidatos enlazados al corpus editorial activo**. Cada entrada registra llamador, línea, texto o claves de texto, control, identidad de agenda cuando se puede resolver, alternativa escrita, hash antes/después y estado de QA. Las piezas audiovisuales incluyen fuente, pista incrustada observada, guion disponible y dependencia. Se analizaron con `ffprobe` 17 vídeos locales; tener una pista AAC prueba audio incrustado, no por sí solo voz, música o equivalencia.

Estos son conteos de trazabilidad estática. No equivalen al número de frases narradas, no prueban que un candidato legado sea alcanzable y no sustituyen el recorrido de seis rutas por 28 días. Los vínculos heurísticos ruta/día se complementan con las identidades reales del manifiesto de agenda y los `content_units` del corpus editorial. La superficie DE antigua que despacha `spm:de-audio-request` está clasificada como evento legado protegido, sin reactivar su reproducción; su rótulo y metadato ya reflejan voz estándar.

Las familias migradas incluyen bienvenida y retorno ES/EN, presentación comercial, insights, controlador común, checkpoints, recuperación y personajes, Erección 1–10, Deseo 1–3/semanas 1–4 y Lab, Conexión, Confianza, control eyaculatorio y sus técnicas, Focalización, recursos pélvicos/fortalecimiento, Respiración y sus cues, y actividades escritas posteriores a los vídeos. Las pantallas táctiles añaden lectura de guías debajo del arte aprobado. Los scripts, imágenes y grabaciones históricos se conservan como procedencia; su presencia no implica que una grabación siga autorizada para reproducción activa.

La historia de recuperación distingue turnos con texto e imagen, usando la misma voz estándar. La presentación comercial narra párrafos originales y conserva ilustraciones, con controles de pausa, escena y avance; su CTA sigue disponible sin escuchar. Las descripciones de duración de grabaciones anteriores y la prioridad por género se retiraron de estos flujos.

## Cambios técnicos hallados durante las pruebas

1. El mensaje de error de vídeo compartía clase con el pie de continuación. Abrir un segundo vídeo podía borrar sus controles y causar un error. Ahora el estado multimedia tiene un selector propio; se probaron repetición y reintento.
2. La fragmentación anterior insertaba un espacio antes de algunas comillas de cierre. Ahora el texto completo mantiene su puntuación al recomponer los fragmentos.
3. Desactivar las señales de fuerza pélvica consultaba un `src` ya vaciado y podía dejar hablando la frase. Se cancela de inmediato. Las señales comienzan desactivadas y requieren su botón; el temporizador, los tiempos clínicos y el registro permanecen separados.
4. El flujo pélvico semanal permite pasar a evaluación tras iniciar, sin esperar un mínimo; conserva `guidedSeconds` y `endedEarly`. Interrumpir no emite una realización. Las duraciones originales no se cambian.
5. El punto de entrada del Lab pélvico monta una sola aplicación: flujo semanal en las asignaciones por `sourceDay`, incluida EP18, o React para Biblioteca. Se retiró una carga incondicional duplicada. Los tests ejecutan esa decisión desde el entry real, sin depender del nombre minificado del bundle.

## Compilaciones

Se usan los archivos de dependencias y versiones fijadas del repositorio. Respiración, Deseo y Piso Pélvico pasaron `tsc --noEmit` y build Vite durante el trabajo. Respiración final incluye las correcciones editoriales y la nueva demo; su build es `index-jG_XMQk8.js` y `index-oi2SjPgH.css`. Piso Pélvico usa `index-UtNoVM_L.js`; Deseo usa `index-m4bu1fWk.js`. Los índices y hashes exactos están en el JSON de inventario. El coordinador se carga antes del bundle como script de aplicación; el aviso de Vite de que ese script no se empaqueta es previsto.

Los hashes del inventario se refrescaron después de las últimas compilaciones editoriales. Las tres tandas focales de voz conservan su evidencia de ejecución; la suite completa del reporte general comprueba el snapshot final combinado.

## Matriz de aceptación

| Criterio | Evidencia local | Estado que falta |
|---|---|---|
| A01: voz estándar | Sin asignación de voz por defecto; selección voluntaria y retorno; textos de los adaptadores | Escucha física por dispositivo y superficie |
| A02: disponibilidad | Lista vacía, cambio de voces, sin autoplay, espera limitada | Confirmar comportamiento nativo móvil |
| A03: recuperación | API ausente, rechazo/error, texto, reintento y selector preservado | Errores reales de motor/idioma/hardware |
| A04: exclusividad y salida | Generaciones, cuenta/día, propietario, iframe y medios | Suspensión del proceso en móviles |
| A05: guía larga y pausa | Texto entero, puntuación, repetición del párrafo y callbacks tardíos | Escuchar guía larga completa en iOS y Android |
| A06: voz de vídeo | Demo final y escenas de comercial/recuperación implementadas con texto existente | Doce guiones/fuentes de Biblioteca; cotejo acústico y ambiente útil |
| A07: Conexión 1, 13, 28 | Integración con coordinador y textos disponibles | Escucha real completa y salida en dispositivos objetivo |
| A08: audio no completa | Escuchar/end/error/cancel no guardan; controles explícitos, contexto y seguridad conservados | Recorrido de producción junto a QA de persistencia |

## Cómo reproducir y revisar

El resultado detallado está en `spm-voice-20261127-results.json`, el inventario en `spm-voice-20261127-inventory.json` y las tres salidas completas junto a este documento. Las pruebas Node requieren `NODE_PATH=$PWD/scripts/qa/node_modules` tras la instalación reproducible de `scripts/qa`. No necesitan cuentas de pacientes. Ejecutar los tests indicados en los logs o la suite global del repositorio. El controlador Respiración se verifica con `cd labs/breathing` y `./node_modules/.bin/vitest run src/lib/breath-playback.test.js`. El inventario se regenera con `node scripts/audit-voice-corpus-20261127.cjs`.

Los tests antiguos que exigían Lenny, archivos MP3 activos o nombres concretos de bundles se actualizaron a la decisión vigente. Se mantuvieron las comprobaciones de contenido completo, pausa, cancelación, exclusividad, cuenta/día, seguridad, null, guardado explícito y ausencia de realización por audio. Los activos históricos conservan pruebas de SHA-256 donde ya existían manifiestos.

La política vigente está en `SPM_PROJECT_DECISIONS_MASTER.md` §21 y `docs/qa/spm-voice-policy-20261117.md`. La documentación anterior queda rotulada como historia sustituida, no como regla de reproducción vigente.

Referencias técnicas primarias consultadas: [propiedad `voice`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/voice) y [errores de síntesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisErrorEvent/error). El comportamiento real de activación y audio se acepta mediante pruebas de navegador/dispositivo, no por documentación o simulación únicamente.
