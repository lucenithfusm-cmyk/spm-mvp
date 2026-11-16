# SPM · Erección y firmeza — Día 1: seis pantallas táctiles

La interfaz usa las seis imágenes aprobadas como superficies táctiles de alta resolución; no hay formulario paralelo. Las imágenes fueron transcodificadas a WebP de calidad 98 conservando todas sus dimensiones y sin recortar; originales disponibles en el paquete de entrega.

## Alcance
- **Solo perfil erección, día 1, actividad principal**. Sin alterar semanas 2–4 ni los demás dominios.
- Pantalla 1: comenzar. Pantalla 2: firmeza 0–4 o No evaluable, enlazada directamente a `SPM_FIRMNESS_GUIDE.open`. Pantalla 3: explicación. Pantalla 4: escucha y práctica. Pantalla 5: registro de experiencia. Pantalla 6: confirmación después de guardar y vuelta a Hoy.
- Guardado mediante `SPM_DAILY_PRACTICE.saveActivity('main', record, scope, 1)` y validador existente `SPM_ERECTION_PRACTICE.valid`; NO almacenamiento paralelo ni modificación de calendario.
- Si la persona prefiere no realizar la práctica, no queda registrada como completada.
- Seguridad: se conserva `SPM_DAILY_PRACTICE.restricted`, los flags clínicos y el contexto de usuario.
- Accesibilidad: áreas táctiles semánticas, foco y confirmación visual, halos moderados, encuadre `contain`.

## Audio
Los seis guiones se encuentran en `erection-day1-touch-v1.js`. La bocina reproduce temporalmente síntesis del navegador en español, activada por toque. `AUDIO_FILES` está vacío: todavía **no se han verificado ni alojado los MP3 premium**. Sustituir únicamente tras validar voz, audición, y alojamiento SPM. No se incrustan URLs de terceros.

## Verificación
Prueba móvil automatizada aislada de las seis pantallas, selección de EHS, acceso al visor existente, persistencia, No evaluable, omisión voluntaria y retorno a Hoy: aprobada. `node tests/erection-day1-touch.test.cjs` verifica assets, rutas e integración estática. Requiere comprobación manual final en iOS Safari y con usuario real antes de fusionar a producción. Mantener la pausa comercial.
