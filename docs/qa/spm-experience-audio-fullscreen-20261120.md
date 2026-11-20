# SPM · Respiración, bocinas y Deseo 1–14

Fecha: 20 de noviembre de 2026.
Base verificada: main `293f9392413f34ea61bfc46e8af9496eef69035c` (Movimiento publicado, PR #83).
Rama de trabajo: `fix/spm-audio-fullscreen-20261120`.

## Solicitud

- Restaurar la voz de respiración diafragmática.
- Hacer más visibles las bocinas de Respiración y Pelvic Floor Lab con tamaño mayor, dorado y halo.
- Ampliar Deseo días 1–14 a la pantalla disponible del dispositivo, conservando las imágenes aprobadas y sus acciones.

## Cambios implementados

### Respiración

En la versión publicada, el control superior de silencio deshabilita los botones Escuchar mientras los videos conservan su audio. Se reprodujo este comportamiento en el navegador de revisión. No se afirma que esa fuera la secuencia exacta ocurrida en el teléfono de la usuaria.

Los botones Escuchar ahora reactivan la narración explícitamente. El control superior muestra Voz activa o Sin voz. El reproductor reutiliza un elemento de audio y conserva las grabaciones aprobadas. Si falla un archivo, utiliza el mismo guion con voz estándar del dispositivo en es-CO, sin seleccionar voces por nombre o género. Se conservan velocidad, exclusión con videos, silencio y cierre al navegar. Se regeneró el build de Respiración.

### Bocinas

Respiración: controles de narración de 56–62 px y bocina superior con estado visible. Pelvic Floor Lab: biblioteca y sesiones semanales con botones dorados de 62–64 px, iconos de 28 px, halo suave, foco visible y movimiento reducido. Las sesiones semanales indican pausar o continuar según el estado real. Los audios y la secuencia clínica se conservan.

### Deseo

Días 1–3: superficie fija del tamaño del viewport, sin marco exterior. Imagen y zonas táctiles mantienen proporciones. El desplazamiento interno conserva su posición al seleccionar en la misma pantalla y vuelve arriba al cambiar de pantalla.

Días 4–14: iframe de pantalla completa, eliminadas las restas de 95/150 px y los bordes de tarjeta. Los visores comienzan por la imagen aprobada y mantienen navegación y controles en la misma superficie. Los dispositivos de poca altura pueden desplazar el contenido para alcanzar todas las acciones. No se alteraron imágenes ni contenidos clínicos.

Se actualizaron referencias de caché y la revisión del día 1 carga el mismo controlador que Central. Hay accesos de revisión para respiracion y pelvic-lab; este último usa la actividad semanal asignada y conserva su flujo de resultados. `tests/experience-mobile-review.html` permite inspeccionar 390×844, 320×568 y 390×650 sin cuentas reales.

## Validación

- Respiración: 36 pruebas de componentes/controlador aprobadas; TypeScript y build aprobados.
- Bridge de Respiración: 17 pruebas aprobadas.
- Bridge Pelvic Floor Lab: 21 pruebas aprobadas.
- Sesiones semanales Pelvic: 11 pruebas aprobadas.
- Deseo días 1–14: 32 pruebas existentes aprobadas y 3 nuevas de desplazamiento aprobadas.
- Revisión Central: 21 pruebas existentes y 2 nuevas de accesos directos aprobadas.
- Total de los grupos enfocados: 143 pruebas aprobadas.
- Los 29 recursos originales del manifiesto de Respiración conservan su SHA256.
- Verificación de diferencias sin errores de espacios.

## Límites y continuación

La reproducción física en iPhone y la inspección visual de la versión nueva siguen pendientes. Chromium local no pudo iniciar porque el entorno rechazó su operación de socket. El navegador remoto permitió comprobar el fallo de silencio en la versión ya publicada, pero aún no contiene estos cambios nuevos.

El 20 de noviembre de 2026 la propietaria autorizó expresamente subir estos ajustes, incluidos código, estilos, pruebas y documentación, a una rama de revisión de su repositorio público lucenithfusm-cmyk/spm-mvp y desplegarlos en spm-premium-staging, del equipo lucenithfusm-cmyk. El destino y la cuenta propietaria y administradora están verificados.

Entrega autorizada: publicar una rama de revisión en lucenithfusm-cmyk/spm-mvp; crear un preview en spm-premium-staging del equipo lucenithfusm-cmyk; verificar visualmente los tres cambios; entregar enlaces de revisión. Mantener el flujo habitual de aprobación visual antes de fusionar en main.
