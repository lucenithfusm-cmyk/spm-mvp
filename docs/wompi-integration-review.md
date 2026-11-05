# SPM: integración de pago, bienvenida y recuperación de evaluaciones

Estado al 5 de noviembre de 2026: código de revisión. No es una confirmación de que los pagos estén habilitados ni de que se haya recibido dinero.

## Recorrido preparado

1. `premium-v2/free-assessment.html`: evaluación directa, sin usuario ni contraseña. Conserva el cierre audiovisual aprobado y muestra cuatro insights después de 4, 8, 12 y 16 respuestas únicas.
2. La compra presenta **$149.000 COP, pago único**. El texto de valor está inmediatamente después de «Tu ritmo. Tu control». El video mantiene el botón grande de reproducción, con pulso y respeto a movimiento reducido.
3. Al elegir comprar, se crea o se utiliza la cuenta para conservar la evaluación. Crear la cuenta no cobra ni activa un plan.
4. El servidor crea una orden única, fija el valor y firma el enlace de Wompi. Reutiliza una orden pendiente para evitar duplicados.
5. El regreso de Wompi muestra pendiente, no aprobado, prueba aprobada o pago confirmado. La URL del navegador por sí sola no activa acceso.
6. El servidor comprueba firma de eventos, ambiente, referencia, moneda e importe y consulta la transacción directamente en Wompi. Solo una aprobación de producción puede crear acceso comercial. La confirmación en la base de datos es atómica e idempotente.
7. `premium-v2/live.html` conserva el programa moderno completo. La bienvenida incluye interpretación educativa, áreas de trabajo, objetivos, instrucciones, avance real y la nota de cuidado de salud acordada.

La antigua grabación comercial aún menciona US$39. Se conserva por la autorización de mantenerla si la voz no podía corregirse; la interfaz y el cobro usan COP 149.000. No presentar la grabación como actualizada.

## Salidas de los bloqueos

- Respuestas faltantes: «Completar lo pendiente y continuar», con las preguntas concretas y seguimiento condicional. Solo se completan respuestas ausentes; no se reescriben respuestas válidas ni se eliminan alertas positivas.
- Error al guardar: conserva el formulario y ofrece reintento; el día no avanza.
- Señal de salud: conserva la indicación, explica el motivo y ofrece recursos educativos permitidos. Completar datos no equivale a autorización médica.
- Fallo de restauración: «Reintentar acceso», con tiempo máximo de espera por consulta.
- Cuenta sin plan: evaluación gratuita o comprobación de la compra asociada a la misma cuenta.
- Seguimiento EP: «No evaluable hoy» y «No cuento con una puntuación PEDT» evitan exigir una medida inexistente. No se inventa una escala. Los registros se guardan por usuario y plan; no se reutilizan datos anónimos de otro paciente.

La inspección de los datos confirmó una alerta de salud guardada en el plan del día 15. No se borró ni se modificó ningún dato de esas cuentas.

## Despliegue necesario

Proyecto Supabase: `jogirmziqjlsttbbarcx`. Proyecto Vercel existente: `spm-premium-staging`.

1. Aplicar `supabase/migrations/202611050001_wompi_orders.sql`. Es aditiva y no altera los planes existentes. La primera solicitud de aplicación venció sin confirmación; se verificó que las tablas nuevas todavía no existían.
2. Desplegar `spm-payments` y `spm-program-recovery` con sus archivos compartidos. `verify_jwt=false` permite recibir webhooks; checkout, consulta y recuperación verifican usuario con `auth.getUser` y propiedad del registro en el código.
3. Configurar secretos según `supabase/.env.example`, comenzando con `WOMPI_MODE=test`, los identificadores de cuentas de prueba y los orígenes exactos permitidos. No escribir llaves privadas en el chat, HTML, Git o variables públicas.
4. En Wompi configurar las URL de eventos separadas:
   - Sandbox: `https://jogirmziqjlsttbbarcx.supabase.co/functions/v1/spm-payments/webhook/test`
   - Producción: `https://jogirmziqjlsttbbarcx.supabase.co/functions/v1/spm-payments/webhook/prod`
5. Probar pago aprobado, pendiente, rechazado, callback manipulado, referencia e importe incorrectos, webhook repetido y cambio de cuenta. Un pago sandbox no crea un plan comercial.
6. Antes de publicar el nuevo flujo comercial, aplicar `202611050002_paid_access_release_gate.sql` junto con el frontend unificado. Esta migración conserva todos los planes anteriores como accesos existentes e impide que un navegador cree planes sin un pago confirmado. No aplicarla antes del cambio de frontend: el antiguo formulario privado aún intentaba crear planes directamente.
7. Cambiar a producción solo después de las pruebas. Verificar con un pago real autorizado y el movimiento bancario el abono; una prueba sandbox no demuestra un abono real.

Las claves privadas, la configuración de eventos, la transacción Wompi y el abono bancario continúan pendientes de verificación. La sesión de navegador de Wompi dejó de responder durante la configuración anterior. No se pulsó crear enlace ni se realizó un cobro.

## Validación reproducible

Ejecutar `node scripts/build-assessment-catalog.cjs --check` para comprobar que el catálogo del servidor coincide con las preguntas aprobadas. No editar el catálogo generado a mano.

Los tests de `commercial-approved`, `insight-cadence`, `daily-practice`, `returning-user-restore`, `payment-policy` y `program-recovery` verifican el recorrido gratuito, las cadencias, los recursos de 28 días, el guardado de avance, la firma de pago y la recuperación sin borrar alertas. La restauración también se prueba cargando todos los módulos con `SPM_QA_ALL_LAYERS=1`.

La verificación de interfaz en un navegador móvil real, las funciones desplegadas y la base de datos siguen siendo gates de lanzamiento; los tests locales no sustituyen esas comprobaciones.

Fuentes técnicas: [Wompi Checkout](https://docs.wompi.co/docs/colombia/widget-checkout-web/), [eventos](https://docs.wompi.co/docs/colombia/eventos/), [transacciones](https://docs.wompi.co/docs/colombia/transacciones/) y [Supabase Auth en Edge Functions](https://supabase.com/docs/guides/functions/auth-legacy-jwt).
