# SPM Central — auditoría funcional de rutas y videos
Fecha: 2026-10-07
Rama: feat/spm-final-route-video-audit-20261007
Base (main): 6194bf60b5a42eac868406e8d2f57e3105564282

## Cambio propuesto para revisión (sin publicar)
- Las sugerencias automáticas de video en el calendario ahora se determinan por el título y la actividad principal del día, no por cualquier texto o nota secundaria de la tarjeta.
- Se comprueba el contexto de programa autenticado (userId y planId), el dominio primario/secundario y los motivos del usuario.
- Las señales urgentes deshabilitan la recomendación automática. La biblioteca completa permanece accesible por separado.
- Cuando cambia una ruta, se reemplaza la sugerencia anterior; si no existe programa activo o corresponde bloquearla, se retira.
- No se cambian scoring, módulos, persistencia, DB, reglas del ciclo de 28 días ni contenido aprobado.

## Pruebas locales sobre el snapshot exacto de main
- Node: 5/5 pruebas de routing (biblioteca, rutas, perfiles mixtos, contexto, seguridad).
- Chromium: 375x812, 390x844 y 1440x900; recomendación, cambio de ruta, limpieza al cerrar plan y seguridad urgente sin errores JS.
- Estructura base: 28 días secuenciales y 4 fases de 7 días.
- Integración HTML: 39 scripts locales enlazados, ninguno ausente.
- D1/D14/D28: los hitos de control se encuentran en el módulo de control eyaculatorio.
- Rotación bienestar: nutrición → movimiento → sueño comprobada en código.
- Pruebas estáticas existentes: nutrition-movement-final y recovery-doctor-final pasan.

## Limitaciones y trabajo pendiente antes de integrar
- NO se han realizado pruebas end-to-end con Supabase, usuarios reales, autenticación, consentimiento ni datos persistidos.
- NO se ha verificado un despliegue de staging ni su comportamiento en dispositivos externos.
- Varios tests de la suite original requieren dependencias que no vienen en el snapshot (jsdom/esbuild); no constituyen un fallo de producto por sí mismos.
- La prueba antigua de DE Premium V3 usa nombres de archivos que ya no existen; revisar o retirar esa prueba obsoleta.
- Auditoría de sintaxis: 80 scripts JS en raíz de premium-v2, dos no parsean: breathing-img-1.js y erection-route.js. Ninguno está referenciado por premium-v2/live.html; erection-route.js aparece en premium-v2/index.html (ruta legada): verificar uso y corregir o retirar sin afectar el Premium actual.
- Pendiente validar por ruta: permisos/consentimiento, sesión, persistencia, recuperación de progreso, integración real de videos externos, prácticas en D1/D14/D28, final de 28 días, móvil/tablet/escritorio, y accesibilidad.

## Condición de integración
No integrar en main ni publicar antes de que se validen el PR, los recorridos end-to-end, la protección del progreso existente y los módulos ya aprobados.
