# SPM — Preparación del entorno de revisión

## Estado

Cambios preparados y comprobados localmente después de la entrega inicial. La usuaria dio posteriormente autorización expresa para publicar el código, los calendarios, los inventarios completos y los informes de QA en la rama pública de revisión, junto con un PR borrador y un preview de Vercel. El bloqueo anterior quedó resuelto y la subida de los objetos fue aceptada. Este documento describe la preparación; la validación HTTP y visual alojada debe registrarse tras el deployment.

## Protección de archivos del deployment

El sitio estático tenía un fallback `filesystem` sin exclusiones para la documentación interna, los informes de QA, los scripts o el SQL. Se añadieron dos capas:

1. `.vercelignore` excluye del deployment los directorios raíz `docs`, `tests`, `scripts`, `labs`, `.github` y `supabase`.
2. Dos reglas terminales de `vercel.json`, situadas antes de las rutas de aplicación y de `filesystem`, responden 404 para esos espacios de nombres.
3. El navegador carga `premium-v2/assessment-policy.js`, una copia exacta del archivo canónico del backend, generada con `node scripts/qa/sync-public-assessment-policy.cjs`. Una prueba exige igualdad byte por byte para impedir divergencias de reglas entre ambos consumidores.

Los módulos compilados que se ejecutan en el navegador están en `premium-v2/breathing-lab`, `premium-v2/desire-lab` y `premium-v2/pelvic-floor-lab`. Las exclusiones del directorio fuente `/labs/` no los afectan. Las reglas anteriores de pausa comercial y el acceso al visor se conservan.

Estas protecciones afectan a los archivos cargados y servidos por Vercel. **No hacen privados los archivos de un repositorio público.** La publicación de los inventarios completos en GitHub cuenta con autorización expresa de la usuaria.

### Comprobación local

`tests/deployment-source-boundary.test.cjs` comprueba la precedencia de las denegaciones, los archivos internos realmente versionados, la excepción exacta de la política pública, las dependencias del visor, la existencia de los módulos distribuidos y las exclusiones con la semántica de patrones Git. También preserva las rutas de pausa.

La tanda focal inicial junto con las regresiones de módulos y retorno a Hoy aprobó **19/19**, sin fallos ni omisiones. Evidencia: `spm-preview-boundary-20261127.tap`. Esta tanda incluye cinco pruebas nuevas; sus otros catorce casos ya pertenecían a la suite anterior. No se suma como si fueran diecinueve casos adicionales únicos.

La primera comprobación alojada detectó que Vercel devolvía 404 para la antigua política bajo `supabase/functions/_shared`, aunque la excepción pasaba la simulación local de patrones. El visor mostraba su error de carga. Se sustituyó esa dependencia por la copia pública exacta dentro de `premium-v2` y se excluyó todo el árbol backend. La regresión local de publicación y continuidad aprobó **16/16**, incluyendo la nueva comprobación de identidad de la política. El resultado HTTP efectivo debe verificarse en el deployment corregido.

**Pendiente:** comprobar las respuestas HTTP 404, la exclusión efectiva de archivos y la carga visual del visor en un deployment autorizado. La prueba local de configuración no se presenta como una prueba HTTP alojada.

## Entrada sintética para la revisión visual

Ruta: `/premium-v2/revision-programas-28-dias.html`.

El visor usa un usuario y planes ficticios, con registros y almacenamiento en memoria. No carga `app-live.js` ni los clientes de Auth o pagos. Puede descargar vídeos públicos del almacenamiento de medios. Recargar la página borra los registros de prueba.

| Caso | Recorrido |
|---|---|
| Conexión 1 → 28 | Abrir `?programa=wellbeing&dia=1`, registrar cuatro valores distintos incluyendo cero y «No aplica» y guardar. Cambiar a 28 mediante el selector Día sin recargar; comprobar que los cuatro valores iniciales se recuperan exactamente. |
| Conexión 28 sin línea base | Abrir `?programa=wellbeing&dia=28` en una navegación nueva; deben aparecer valores «Sin registrar». Cerrar voluntariamente debe terminar el ciclo sin día 29. |
| Conexión 13 | Abrir `?programa=wellbeing&dia=13`; comprobar modalidad visible Individual/En pareja, explicación de «Su ritmo» individual, guardado parcial y finalización explícita. |
| Cápsulas de Control | Abrir `?programa=ejaculation&dia=1` y el recurso «Abrir cápsula»; comprobar texto completo, voz, detener y volver. Repetir títulos largos en días 15, 23 y 25. |
| Erección 1 | Abrir `?programa=erection&dia=1`; comprobar imágenes, controles visibles y separación entre EHS cero, No aplica y omisión. |
| Variante mixta | Abrir `?programa=erection&dia=13&secundario=desire`; comprobar identidades y máximo de un apoyo. |
| Agenda anterior | Añadir `agenda=legacy`; no inferir la asignación de una actividad nueva a partir de un enlace histórico. |

La presentación de las cápsulas de Control aún requiere aprobación visual: mantiene los bytes originales, pero muestra solo el 49 % superior de su arte para sustituir el titular integrado por texto HTML. Esto no equivale a conservar el encuadre completo. No se afirma que el recorte esté aprobado.

## Límite del aislamiento

La pausa redirige `live.html`, pero **no todo el sitio está desconectado del backend principal**. `payment-return.html` conserva su acceso de recuperación para compradores y carga clientes del proyecto principal; `app-live.js` y `payments-v1.js` siguen configurados para ese proyecto. No se inició sesión ni se probaron pagos contra él.

La revisión visual debe entrar por el visor sintético. Una futura comprobación de Auth y persistencia exige una rama Supabase separada y una entrada configurada expresamente para esa rama, sin fallback al proyecto principal. Las pruebas locales de PGlite no sustituyen ese recorrido.

## Preparación local de la migración aislada

El SQL canónico ocupa 2.798.172 bytes y su INSERT legacy excede por sí solo los límites de consulta anunciados por los conectores. Se añadió `scripts/qa/split-progress-migration.cjs`, que genera partes fuera de `supabase/migrations` y conserva el archivo canónico intacto.

La salida revisada tiene ocho consultas, todas menores de 900.000 bytes; la mayor ocupa 895.380. El catálogo legacy se divide en tres grupos de 24, 27 y 21 contextos completos. El generador rechaza estructura inesperada, archivos de salida existentes y destinos dentro del historial de migraciones.

La prueba focal `tests/progress-migration-parts.test.cjs` aprobó **6/6**. Ejecuta el archivo canónico y las partes en dos PostgreSQL locales independientes y compara íntegramente cuatro catálogos, 72 contextos de 28 días, funciones, triggers, RLS, políticas, permisos y columnas. También comprueba el rechazo de una base con planes y de una instalación incompleta. El resumen de ejecución es `spm-migration-parts-20261127.json`.

Esta preparación no aplica SQL a ningún servidor. Las partes son únicamente para una rama aislada vacía, sin clientes conectados hasta finalizar. Cada llamada tiene su propia transacción; no se promete atomicidad global. La comprobación de planes vacíos no acredita la identidad de una rama. El procedimiento exige comprobar el destino y todos los valores de los catálogos antes de habilitar pruebas autenticadas.

## Referencias de configuración

- [Archivos excluidos mediante `.vercelignore`](https://vercel.com/docs/deployments/vercel-ignore).
- [Corrección oficial de resolución de `.vercelignore` en deployments Git](https://vercel.com/changelog/january-2023).
- [Configuración de `routes` en `vercel.json`](https://vercel.com/docs/project-configuration/vercel-json#routes).
- [Contrato de rutas: pathname, orden y estado HTTP](https://vercel.com/docs/build-output-api/configuration#source-route).
