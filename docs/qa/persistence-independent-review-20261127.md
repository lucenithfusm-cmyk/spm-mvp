# Revisión independiente de persistencia SPM · 27/11/2026

## Dictamen actualizado tras corrección

**Los dos hallazgos reproducidos quedaron corregidos y cubiertos por regresiones.** La tanda final pasa **28/28**: 16 casos SQL y 12 de `app-live`/Coach contra PostgreSQL local. No quedan bloqueos adicionales identificados en este alcance. Este dictamen permite integrar el cambio revisable; no certifica un despliegue alojado ni sustituye las pruebas de concurrencia con conexiones independientes.

A petición de root, la revisión inicial pasó a corrección acotada: se modificaron `supabase/sql/spm-atomic-progress-body.sql` y `tests/atomic-progress-database.test.cjs`, y se regeneró la migración mediante `scripts/qa/build-progress-migration.cjs`. No se modificó `app-live.js` desde esta revisión y no hubo acciones remotas.

- `daily_practice` rechaza todo UPDATE autenticado, incluido `SET metadata=metadata`. La inserción exige exactamente la metadata derivada de su cierre real; fecha, revisión y métrica se fijan desde el servidor. El replay legítimo continúa por la RPC de cierre.
- `spm_guard_receipt` exige identidad, operación, request y result canónicos de la fila real. Se comprueban metadata y revisión; fecha de recibo se deriva del guardado. Rechaza revisiones falsas, resultados falsos, request alterado, operación de otro registro y cambios/borrado del recibo.
- `spm_save_activity` normaliza solo los campos administrados por servidor antes de guardar/comparar el request (`operationId`, `_recordRevision`, versión y proyección `completed`). Conserva íntegros los campos clínicos y permite reproducir un recibo previo aunque exista una edición posterior.
- No se incorporaron bypass mediante GUC ni nuevas funciones `SECURITY DEFINER`. Se mantienen RLS y ejecución como invocador.

El log final está en `persistence-independent-fixed-20261127.tap`; los resultados iniciales y las dos reproducciones anteriores se conservan junto a este informe. Las secciones siguientes describen el hallazgo original y su razonamiento, antes de la corrección.

## Alcance y dictamen inicial

Revisión de las RPC de progreso, triggers, RLS/grants añadidos y el adaptador real `app-live.js`. No se modificó código de producto, no se ejecutó migración remota y no se consultaron datos de pacientes. La prueba usa PGlite/PostgreSQL local con roles y usuarios sintéticos, más JSDOM para el adaptador cliente; no representa Auth/PostgREST de un despliegue alojado.

Las dos suites focales revisadas pasan **20/20** en la ejecución inicial. Se conservaron las comprobaciones de seis rutas por 28 días, siete regresiones legacy sin requisitos, decisión voluntaria, seguridad, escalas, null/0, idempotencia, rollback, RLS de cuenta ajena y anónimo, respuesta perdida, reingreso y respuesta tardía de otra sesión. El test de dos solicitudes usa un solo motor PGlite y el harness serializa transporte; no equivale a una prueba de dos conexiones PostgreSQL independientes ni a contención alojada.

**Dictamen inicial: dos hallazgos concretos de integridad de escritura directa pendientes de corregir antes de dar por cerrado ese contrato.** No se encontró en estas pruebas acceso a datos de otra cuenta ni salto de jornada por dichos hallazgos. Los cierres canónicos y el avance quedaron intactos en la reproducción. Ambos problemas afectan a registros derivados que el servidor permite insertar o modificar directamente.

## P2 corregido · El resumen de un día cerrado acepta contenido ajeno al cierre canónico

**Ubicación:** `supabase/sql/spm-atomic-progress-body.sql`, `spm_guard_activity`, rama `new.module_key='daily_practice'`.

La guarda comprueba plan/usuario y que exista un cierre con el `operationId` suministrado. Después devuelve `new` sin exigir que la metadata sea la derivación exacta del cierre ni impedir un UPDATE de la fila histórica.

**Reproducción verificada:** con rol `authenticated` y un plan propio, cerrar voluntariamente el día 1 por `spm_close_program_day`; leer su `operation_id`; actualizar la fila `activity_completions` de ese día conservando ese ID pero usando:

```json
{"dayStatus":"open","reason":"changed-by-direct-api","realizedCount":999,"scheduleVersion":"other"}
```

La base acepta la modificación. `spm_day_closures` y `plans` siguen correctos, pero el resumen legado ya contradice el estado confirmado. La identidad de operación es visible para el dueño legítimo y por sí sola no certifica el contenido.

**Corrección acotada sugerida:** derivar/validar los campos del resumen contra la fila real de cierre; rechazar actualizaciones que alteren el resumen histórico. La inserción desde `spm_advance_closed_day` debe seguir funcionando. Añadir un caso que intente cambiar estado, versión y contador con una operación real y confirme rechazo o normalización canónica.

## P2 corregido · Un recibo directo puede devolver una revisión ficticia

**Ubicación:** `spm_guard_receipt` y la devolución temprana de recibos en `spm_save_activity`.

La guarda verifica que `new.result.metadata` coincida con una actividad real cuyo `operationId`, plan, día e ID de actividad coinciden. No comprueba `result.recordRevision`, `result.ok` ni la coherencia completa de `request` con el registro. Los roles autenticados tienen INSERT en `spm_activity_receipts`.

**Reproducción verificada:** insertar directamente una actividad válida con revisión 1; insertar su recibo con metadata exacta, request construido como el de la RPC y `result.recordRevision=900`; invocar `spm_save_activity` con esa misma operación y request. La respuesta devuelve revisión **900** aunque la fila de actividad conserva revisión **1**.

Esto permite fabricar la confirmación que devuelve la RPC para una operación propia. No modifica otra cuenta ni eleva la revisión real, pero puede desajustar el control de concurrencia del cliente y contradice la garantía de que un recibo representa el resultado persistido.

**Corrección acotada sugerida:** derivar el resultado del recibo de la fila real (`ok`, metadata y revisión) y validar/normalizar la identidad y revisión de su request. No confiar en el resultado aportado por el INSERT. Mantener el replay del recibo original cuando ya existe una edición posterior de la actividad.

## Aspectos comprobados sin nuevos bloqueos

- Las RPC principales son `SECURITY INVOKER`, fijan `search_path=''` y se revoca EXECUTE de PUBLIC/anon. La pertenencia y acceso activo del plan se comprueban; los tests niegan lectura/RPC ajena y ejecución anónima.
- El cierre toma bloqueo del plan y su trigger determina requisitos, seguridad, contador, revisión y siguiente jornada desde el catálogo protegido. La transacción revierte íntegra si falla la actualización del plan.
- La versión de agenda y las identidades de contenido/actividad se validan; no se acepta el array de requisitos del navegador como autoridad.
- El cierre del ciclo queda explícito y no se crea un día 29. El historial faltante produce necesidad de conciliación, sin rellenar realizaciones.
- El adaptador verifica cuenta/plan/día/versión y época de sesión antes y después de escrituras. El reintento de una respuesta perdida reutiliza la operación y el payload original.
- Recursos de Biblioteca y Daily Coach conservan finalidades distintas del cierre. Los cambios de nulabilidad e inserción idempotente de Coach estaban en edición durante la revisión inicial; la tanda final de 28 incluye sus pruebas actuales de null/0, reintento, cambio de cuenta y resumen semanal.

## Evidencia reproducible

- `persistence-independent-initial-20261127.tap`: ejecución local inicial 20/20.
- `independent-db-probes.cjs`: dos reproducciones independientes contra la migración real, solo datos sintéticos locales.
- `persistence-independent-before-probes-20261127.jsonl`: confirma los dos desvíos anteriores; no describe el comportamiento corregido.
- `persistence-independent-fixed-20261127.tap`: ejecución final 28/28 y regresiones que rechazan ambos desvíos.

Los logs se conservan junto a este documento. El script exploratorio original permanece en el directorio scratch padre; sus casos relevantes se incorporaron a las regresiones del repositorio.

Referencias primarias consultadas: [RLS de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), [comportamiento de triggers de PostgreSQL](https://www.postgresql.org/docs/current/trigger-definition.html) y [changelog de Supabase](https://supabase.com/changelog.md). Los hallazgos se basan en las reproducciones locales del código, no en asumir la configuración de un servicio alojado.
