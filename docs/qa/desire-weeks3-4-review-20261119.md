# Deseo · Semanas 3 y 4 · Preparación de revisión

Fecha: 19 de noviembre de 2026.

> Actualización: la vista web ya está desplegada y comprobada. Ver `desire-weeks3-4-preview-20261119.md`. Las secciones siguientes conservan el estado de preparación anterior a la autorización completa.

## Estado de entrega

El montaje y sus pruebas de código están preparados. No se ha subido este conjunto a GitHub ni a Vercel, ni se ha publicado en la web. La revisión visual de la usuaria y la comprobación de la URL real permanecen pendientes.

- Base publicada identificada: `752c3bad0c0a0f866a8158cc80fad53a696259e4` (`main`, halos de días 11–13 y audio del día 14).
- Continuación local recuperada de semana 3: `c64dea1b91b66b14337079aa049e58be4af22d44`.
- Rama de trabajo: `fix/deseo-semanas3-4-review-20261119`.
- Repositorio de destino existente: `lucenithfusm-cmyk/spm-mvp`.
- Proyecto de vistas de prueba existente: `spm-premium-staging`, equipo `lucenithfusm-cmyk`.
- Índice de las dos semanas: `premium-v2/desire-weeks3-4-review/index.html`.
- Revisión de SPM Central: `premium-v2/revision-programas-28-dias.html?programa=desire&dia=15`.

No se han alterado las rutas de pausa comercial de `vercel.json`, los pagos, las evaluaciones oficiales ni el contenido aprobado de otros programas.

## Semana 3 recuperada

Se conservan las 33 imágenes del montaje anterior: 28 pantallas principales y 5 variantes. El arranque presenta los siete días desde el HTML, carga los datos y la aplicación en orden y ofrece reintento. Los enlaces de ayuda permanecen dentro del host de revisión.

El HTML autocontenido entregado anteriormente dependía por completo de ejecutar JavaScript para reemplazar el mensaje inicial. Sus scripts no tenían un error de sintaxis universal. La hipótesis de un visor móvil que no ejecuta scripts es compatible con el bloqueo comunicado, pero no se ha demostrado en el teléfono de la usuaria. Por ello se debe entregar y comprobar una URL web real, no presentar otro HTML descargable como si fuera esa verificación.

Se reincorporó la tabla ya preparada de 33 guías y 42 mensajes breves. D16, D20 y D21 ya no reutilizan la misma introducción completa en pasos sucesivos; D18 admite el cierre individual sin presuponer una conversación de pareja. Cada botón reproduce su indicación; cambiar de pantalla detiene la voz anterior.

El puente conserva el aislamiento por usuario, plan y día, las condiciones de Focalización II, la repetición de fase I bajo el día asignado y el guardado idempotente. Volver sin confirmar guarda un borrador, sin completar la actividad.

## Semana 4 implementada

Fuente aportada: `SPM_Deseo_Semana04_Dias22-28(1).zip`.

SHA-256 del ZIP: `e5887a102c25245de81b41dd8b0a90645765b9bb17473c94c564fbb40afacdb0`.

Se integraron 28 pantallas principales y 3 variantes, con 204 controles del manifiesto. Las 31 imágenes se conservaron como diseños originales y se optimizaron a WebP de 1080 × 1920. Los controles reales se superponen a sus posiciones; los halos mantienen la geometría visual y las áreas táctiles ampliadas quedan limitadas por los controles vecinos.

| Día | Actividad | Implementación principal |
| --- | --- | --- |
| 22 | Tus mejores activadores | Prácticas reales aptas a partir de registros; ficha con guion y escala propios; ruta asignada si faltan datos. Nunca se guarda `@best`. |
| 23 | Flexibilidad sexual | Exigencia y alternativa, presión antes/después, reflexión editable conservada al reabrir. |
| 24 | Tu curva de deseo real | Seis registros independientes: deseo, curiosidad, apertura, disfrute, presión y conexión; datos ausentes siguen siendo `null`. |
| 25 | Plan si-entonces | Tres alternativas reunidas en una reflexión de hasta 400 caracteres; sin truncamiento silencioso. |
| 26 | Objetivos de continuidad | Hasta dos objetivos, mantener/espaciar y plan de tres acciones separado. |
| 27 | Ensayo autónomo | Estímulo y condición elegidos, pasos guiados, cronómetro opcional y deseo antes/después. |
| 28 | Cierre y continuidad | Historial real, objetivos y acceso al informe oficial después de guardar el borrador; cierre «Lo aprendido continúa contigo». |

El catálogo procede de las 34 fichas del motor y currículo aprobados. El puente se carga después del catálogo en `live.html` y en el revisor. Los días 24, 25, 26 y 28 mantienen medidas locales; no se mezclan con los checkpoints oficiales ni se modifica la línea base congelada.

El día 22 conserva escalas específicas: fantasías 0–4, frecuencia mensual 0–60 —incluidos decimales— y las demás escalas correspondientes 0–10. El mismo intento conserva su identificador, su práctica y sus segundos activos. Las restricciones se comprueban nuevamente al guardar.

Los recursos adicionales del laboratorio guardan el borrador antes de abrirse y refrescan los datos al regresar. En el día 28, «Ver mi informe en SPM» guarda primero, vuelve a Hoy y abre la actividad `program-checkpoint` ya asignada cuando la API y el mismo contexto siguen disponibles. Abrirla no crea ni completa una evaluación.

## Validación realizada

- `node --test tests/desire*.test.cjs`: **125 aprobadas, 0 fallidas, 0 omitidas**.
- Se preparó la dependencia de pruebas `jsdom@26.1.0` en el entorno local; no se cambiaron dependencias del producto ni archivos de bloqueo.
- De las pruebas nuevas de semana 4, 14 comprueban el visor y 31 el puente. Seis conectan el código real del visor y del puente mediante sus mensajes; no son una simulación de datos de pacientes.
- La asignación de prácticas del día 22 se contrastó con `interpret()` de la fuente clínica en 68 casos, incluidos canales y desempates.
- Se verificaron los 31 diseños de semana 4 a anchos 320, 390 y 490 px: cero solapamientos entre áreas táctiles ampliadas.
- Las 64 pantallas de las dos semanas tienen su imagen y sus controles dentro del marco normalizado.
- Comprobación de sintaxis de 11 scripts y `git diff --check`: correctas.

Las primeras pruebas amplias detectaron dos suites que no podían iniciar por ausencia de `jsdom`; al preparar la versión del lockfile, la ejecución completa anterior terminó correctamente. No son fallos del programa pendientes.

## Comprobaciones pendientes

No se ha certificado el aspecto visual mediante navegador real, la voz audible de iPhone/Safari ni la carga de la URL de despliegue. Chromium local no pudo arrancar en este entorno y el navegador remoto no pudo conectarse al servidor local. Las pruebas de código y geometría no sustituyen esas comprobaciones.

La revisión automática rechazó subir `app.js` al proyecto Vercel. Se recuperó la autorización histórica de la usuaria para ese proyecto, pero el revisor automático volvió a rechazarla porque exigía la autorización dentro del chat actual. No se intentó eludir el rechazo mediante otro servicio o mecanismo de subida.

## Continuación al autorizar la vista web

1. Subir los archivos de esta copia a una vista de prueba del proyecto Vercel existente; no publicar `main` ni promover producción.
2. Verificar la URL real, apertura de los catorce días, selección, recursos, navegación y guardado. Confirmar visualmente el encuadre de las zonas táctiles y revisar la voz disponible.
3. Entregar los enlaces de semanas 3 y 4 para revisión de la usuaria.
4. Publicar en el repositorio y en SPM únicamente después de su aprobación de contenido y experiencia.

La pausa comercial vigente permanece separada de esta revisión.
