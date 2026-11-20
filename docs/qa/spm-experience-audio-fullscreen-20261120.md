# SPM · Respiración, bocinas y Deseo 1–14

Fecha: 20 de noviembre de 2026.
Base verificada: main `293f9392413f34ea61bfc46e8af9496eef69035c` (Movimiento publicado, PR #83).
Rama de trabajo: `fix/spm-audio-fullscreen-20261120`.
Preview revisado: commit `69394cf62bda53d913859b621ea4f36c2a2751e9`, [PR #84](https://github.com/lucenithfusm-cmyk/spm-mvp/pull/84).

## Solicitud

- Restaurar la voz de respiración diafragmática.
- Hacer más visibles las bocinas de Respiración y Pelvic Floor Lab con tamaño mayor, dorado y halo.
- Ampliar Deseo días 1–14 a la pantalla disponible del dispositivo, conservando las imágenes aprobadas y sus acciones.

## Cambios implementados

### Respiración

En la versión base revisada, el control superior de silencio deshabilita los botones Escuchar mientras los videos conservan su audio. Se reprodujo este comportamiento en el navegador de revisión. No se afirma que esa fuera la secuencia exacta ocurrida en el teléfono de la usuaria.

Los botones Escuchar ahora reactivan la narración explícitamente. El control superior muestra Voz activa o Sin voz. El reproductor reutiliza un elemento de audio y conserva las grabaciones aprobadas. Si falla un archivo, utiliza el mismo guion con voz estándar del dispositivo en es-CO, sin seleccionar voces por nombre o género. Se conservan velocidad, exclusión con videos, silencio y cierre al navegar. Se regeneró el build de Respiración.

### Bocinas

Respiración: controles de narración de 56–62 px y bocina superior con estado visible. Pelvic Floor Lab: biblioteca y sesiones semanales con botones dorados de 62–64 px, iconos de 28 px, halo suave, foco visible y movimiento reducido. Las sesiones semanales indican pausar o continuar según el estado real. Los audios y la secuencia clínica se conservan.

La revisión compacta detectó una superposición del nombre y la bocina dentro de un iframe de 250 px de ancho. En visores de 300 px o menos, el encabezado de Respiración distribuye la marca y los controles en dos filas. Se regeneró el build con este ajuste de estilo.

### Deseo

Días 1–3: superficie fija del tamaño del viewport, sin marco exterior. Imagen y zonas táctiles mantienen proporciones. El desplazamiento interno conserva su posición al seleccionar en la misma pantalla y vuelve arriba al cambiar de pantalla.

Días 4–14: iframe de pantalla completa, eliminadas las restas de 95/150 px y los bordes de tarjeta. Los visores comienzan por la imagen aprobada y mantienen navegación y controles en la misma superficie. Los dispositivos de poca altura pueden desplazar el contenido para alcanzar todas las acciones. No se alteraron imágenes ni contenidos clínicos.

Se actualizaron referencias de caché y la revisión del día 1 carga el mismo controlador que Central. Hay accesos de revisión para respiracion y pelvic-lab; este último usa la actividad semanal asignada y conserva su flujo de resultados. `tests/experience-mobile-review.html` permite inspeccionar 390×844, 320×568 y 390×650 sin cuentas reales.

## Validación

### Pruebas dirigidas

- Respiración: 36 pruebas de componentes/controlador aprobadas; TypeScript y build aprobados.
- Bridge de Respiración: 17 pruebas aprobadas.
- Bridge Pelvic Floor Lab: 21 pruebas aprobadas.
- Sesiones semanales Pelvic: 11 pruebas aprobadas.
- Deseo días 1–14: 32 pruebas existentes aprobadas y 3 nuevas de desplazamiento aprobadas.
- Revisión Central: 21 pruebas existentes y 2 nuevas de accesos directos aprobadas.
- Total de los grupos dirigidos ejecutados localmente: 143 pruebas aprobadas. Este total no representa la aprobación de todos los workflows del repositorio.
- Los 29 recursos originales del manifiesto de Respiración conservan su SHA256.
- Verificación de diferencias sin errores de espacios.

### Comprobación del preview

Se comprobó el preview del commit `69394cf62bda53d913859b621ea4f36c2a2751e9` en navegador remoto, con viewports móviles de revisión. Los resultados siguientes corresponden a ese entorno; no constituyen una prueba física en iPhone.

| Área | Evidencia observada |
| --- | --- |
| Respiración: narración | El MP3 `screen01` avanzó hasta 8,67 s y terminó a 10,42 s sin error del medio. |
| Respiración: silencio y reactivación | Tras silenciar, Escuchar permaneció habilitado. Al pulsarlo, el control superior cambió a Voz activa y el medio se reprodujo. |
| Pelvic Floor Lab: sesión semanal | La introducción del día 3 se reprodujo completa, con duración de 20,53 s y sin error del medio. El botón midió 64 px. Al pausar a 5,33 s mostró Continuar explicación. |
| Pelvic Floor Lab: biblioteca | El botón de narración midió 62 px; se verificaron el gradiente dorado y el halo. |
| Deseo: superficie móvil | Las raíces de los días 1, 2, 4, 8 y 14 se situaron en `(0, 0)` y ocuparon los 390 × 844 px del viewport de revisión. |
| Deseo: dispositivo compacto | El día 2 permitió navegar en 320 × 568 px. |
| Deseo: salir y reabrir | En el día 8, Salir eliminó el iframe de la práctica, con recuento final de cero. Reabrir desde Hoy volvió a mostrar la práctica correctamente. |
| Deseo: día 14 | Se verificó la navegación desde la reflexión hacia la pantalla «Tu evaluación sigue en SPM» y después a la imagen aprobada. El cuestionario oficial independiente no se abrió ni se marcó como completado. |

El avance, la finalización y los estados de reproducción verifican el comportamiento del medio en el navegador de revisión. La salida audible de la bocina de un iPhone físico sigue pendiente. El mecanismo alternativo de voz estándar del dispositivo está cubierto por las pruebas dirigidas; no se presenta aquí como una comprobación de escucha en ese dispositivo.

### CI y prueba de reapertura

La primera revisión del CI del commit `69394cf` mostró cuatro workflows aprobados y siete fallidos; el despliegue de Vercel finalizó correctamente. El CI global no está completamente aprobado. Se contrastaron los fallos con la base: Focalización Premium, separación de fuerza/Lab y current-module release ya fallaban en `293f939`. Las comprobaciones exclusivas de PR para restauración, daily/media y Pelvic integration ya fallaban en PR #83, cuyo head `bd7acf06` comparte exactamente el árbol `ef633d4ad98819670d44434b6cf643c6c35fd902` con esa base. Sus fallos coinciden: errores `null.src` del harness de microclips, diferencia del build de Sensate y desincronización de seis rutas de Pelvic. El build de Respiración no presenta diferencia en ese gate. Estos seis fallos son anteriores a los ajustes; se conservan documentados sin ampliar aquí el alcance de implementación. El séptimo fallo, relacionado con la nueva pantalla completa, se corrige como sigue.

La prueba móvil de Deseo en Chrome y WebKit alcanzó el día 8 y falló en `while-open`: intentaba pulsar el botón de Hoy que la nueva práctica de pantalla completa cubre. Se ajustó únicamente `tests/desire-viewport-access-browser.cjs` para activar la reapertura mediante `SPM_DAILY_PRACTICE.launch('main')`, el mismo lanzador público de ese botón. El caso posterior a Salir conserva la salida y reapertura por la interfaz visible.

La prueba mantiene las verificaciones de un nuevo `src`, contenido del día y visibilidad. Añade la garantía de una sola raíz y un solo iframe, ningún modal legado abierto y contexto activo `main` del día 8. La comprobación DOM con el harness real, la sintaxis de JavaScript y la verificación de diferencias pasaron. La próxima corrida del workflow fullscreen debe comprobar la prueba ajustada en Chrome y WebKit; todavía no se registra como aprobada.

## Límites y continuación

La inspección visual y la navegación del preview nuevo se completaron para los casos indicados arriba. La escucha física en iPhone y la siguiente corrida de la prueba fullscreen permanecen pendientes. Chromium local no pudo iniciar porque el entorno rechazó su operación de socket; las comprobaciones visuales se realizaron en el navegador remoto.

El 20 de noviembre de 2026 la propietaria autorizó expresamente subir estos ajustes, incluidos código, estilos, pruebas y documentación, a una rama de revisión de su repositorio público lucenithfusm-cmyk/spm-mvp y desplegarlos en spm-premium-staging, del equipo lucenithfusm-cmyk. El destino y la cuenta propietaria y administradora están verificados.

Entrega autorizada: publicar una rama de revisión en lucenithfusm-cmyk/spm-mvp; crear un preview en spm-premium-staging del equipo lucenithfusm-cmyk; verificar visualmente los tres cambios; entregar enlaces de revisión. Mantener el flujo habitual de aprobación visual antes de fusionar en main.
