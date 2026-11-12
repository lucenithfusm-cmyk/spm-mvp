# Obsequio de lanzamiento: estado y activación

Estado: código preparado; no desplegado, sin envíos activados. La página diaria y sus tarjetas sí están publicadas. No se ha cambiado el pago ni la activación del programa.

Archivo identificado: `Recetario_SPM.pdf`, 1.806.512 bytes, 15 páginas, 12 preparaciones.
SHA-256: `1e732d27a659e7af9232fb7140634d120023875d13c79bb1ad5cfabb78e5fdb3`.
Identidad del documento: `libfile_fde3_f-68e6a6e38c2c819180135fb5e1ee5aa6_e5eac49243f08191b379c72f64a855df`.

## Regla preparada

- Primeros 50 usuarios únicos con pago Wompi de producción aprobado y acceso activo, ordenados por verificación del pago. Una persona recibe un obsequio aunque haga varias compras.
- Los pagos sandbox, pendientes, rechazados o anulados no habilitan envíos.
- Reserva transaccional con contador permanente: no se abre un cupo adicional por borrar una cuenta.
- Se conserva el mismo destinatario, remitente y PDF durante los reintentos para evitar duplicados.
- El correo incluye solo el obsequio; no incluye evaluación, objetivo sexual, respuestas ni progreso.
- El PDF permanece en un bucket privado y se adjunta al mensaje. No hay enlace público al recetario.
- Una falla del correo no bloquea el programa ni modifica el estado de un pago.
- Si no se puede reconciliar la respuesta del proveedor dentro de su ventana de deduplicación, se solicita revisión interna y no se reenvía a ciegas.

## Correo preparado

**Asunto:** Tu detalle de bienvenida a SPM

Qué bueno que ya formas parte de SPM.

Como uno de nuestros primeros 50 compradores, recibes de obsequio el Recetario SPM con 12 preparaciones prácticas. Lo encontrarás adjunto a este correo.

Elige una opción que disfrutes y adáptala a tus necesidades y restricciones alimentarias. Un paso cada día, a tu ritmo.

Equipo SPM Digital Wellness

## Pendiente para activar

1. Confirmar el remitente de SPM y conectar un proveedor de correo transaccional. El adaptador preparado usa Resend; si ya existe otro proveedor, adaptar el envío a ese servicio. No abrir una suscripción sin autorización.
2. Verificar el dominio remitente. Guardar `RESEND_API_KEY`, `SPM_GIFT_FROM` y un secreto aleatorio `SPM_GIFT_WORKER_SECRET` exclusivamente en el servidor.
3. Crear el bucket privado `spm-private-gifts`, subir el PDF exacto a `launch-v1/Recetario_SPM.pdf` y comprobar su hash. No habilitar lectura anónima.
4. Aplicar y verificar `supabase/sql/launch-recipe-gift.sql`, revisar permisos/RLS y registrar la migración con la CLI. Está preparado como SQL, no como una migración ya aplicada.
5. Probar con datos sintéticos concurrencia de los cupos 49–50, compras repetidas, impago, revocación, error del proveedor y reintento. Las pruebas locales cubren el contrato de envío; todavía no validan la cola en una base real.
6. Desplegar `spm-launch-gifts` con la autenticación propia por secreto y gateway apropiado. Programar una invocación protegida cada minuto. El trabajador procesa un correo por invocación. Activar `SPM_RECIPE_GIFT_ENABLED=true` solo al terminar la configuración.
7. Realizar un envío controlado al destinatario acordado, comprobar PDF adjunto y recepción, y luego habilitar la campaña. El estado `accepted` confirma aceptación del proveedor, no recepción en bandeja de entrada.

Referencias técnicas: documentación oficial de Supabase (Sending Emails, Storage) y Resend (Send Email, Idempotency Keys). Resend conserva claves de idempotencia durante 24 horas; el trabajador deja un margen y detiene reintentos a las 23 horas.

Las tarjetas diarias son adaptaciones prácticas independientes del PDF. Su enfoque alimentario sigue NIDDK, Eating, Diet & Nutrition for Erectile Dysfunction: variedad de vegetales, frutas, leguminosas, grasas insaturadas y cereales integrales. No atribuyen a una receta una mejora garantizada de la erección ni del deseo.
