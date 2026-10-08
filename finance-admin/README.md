# SPM Central — Administración financiera privada (borrador)
Fecha: 2026-10-08. Rama: feat/spm-private-finance-ledger-v1
**NO INTEGRADO A MAIN. NO PUBLICADO. NO HABILITADO EN SUPABASE.**

## Objetivo
Separar ingresos por ventas de SPM, reembolsos, comisiones de la pasarela,
abonos bancarios, gastos del negocio, aportes personales, retiros de la propietaria y reservas.
Diseñado para operación como persona natural; los retiros NO son nómina.

## Componentes
- `finance-admin/index.html`: panel privado, inicio de sesión Supabase, resúmenes por año,
  movimiento de caja, reserva porcentual ajustable y exportación CSV.
- `finance-admin/ledger-core.js`: cálculos puros en COP, año comercial de Colombia, CSV seguro.
- `finance-admin/sql/001_finance_ledger_v1.sql`: migración de esquema (no aplicada).
- `tests/spm-finance-core.test.cjs`: pruebas de ingresos, reintegros, conciliación,
  retiros, año Bogotá, permisos, CSV.
- `.github/workflows/spm-finance-qa.yml`: CI Node 22.

## Reglas del registro
- **Ventas brutas:** pagos aprobados por Wompi, no el valor neto consignado al banco.
- **Reembolsos:** por separado, reducen ventas netas; no se duplican con salidas de banco.
- **Comisiones de la pasarela:** se muestran, pero NO se restan nuevamente de un desembolso ya neto.
- **Desembolsos al banco:** son flujos de caja, NO ventas adicionales.
- **Aportes personales:** flujos de capital, NO ventas de SPM.
- **Retiros de la titular:** movimientos de patrimonio, NO salario ni gasto del negocio.
- **Reservas:** asignaciones operativas de liquidez, NO costos deducibles, impuesto ni transferencia efectiva.
- **Cálculo del saldo:** parte de movimientos registrados del año y NO reemplaza el extracto de banco.
- No almacenar respuestas sexuales, diagnósticos ni otros datos clínicos en las tablas financieras.
- Solo dueño/admin privado visualiza finanzas. No se muestra en rutas públicas.

## Seguridad / activación futura
1. Respaldar y revisar el proyecto Supabase con quien administra la plataforma.
2. Aplicar la migración primero en entorno de prueba; NUNCA aplicar por accidente a producción.
3. Registrar el UID Supabase de la titular en spm_finance_admins usando una operación con
   privilegios de servidor; no crear interfaces públicas de autopromoción de administradores.
4. Auditar las políticas de RLS. El browser puede LEER ventas pero NO crearlas ni alterarlas.
5. Configurar backend seguro para webhooks Wompi: validar `X-Event-Checksum`/firma,
   confirmar moneda COP, importe exacto del pedido y referencia única antes de contabilizar/activar.
   Secretos Wompi y `service_role` **solo** en el servidor. Separar sandbox/producción.
6. Implementar idempotencia usando payment_provider + provider_payment_id.
7. Conciliar desembolsos (incluido primer payout de Wompi para personas naturales, que puede tardar
   30 días) con el extracto de la cuenta exclusiva SPM.
8. Hacer prueba de transacciones aprobadas, rechazadas, pendientes, duplicadas, reembolsos
   parciales/totales, contracargos, retrasos, cierre de año, acceso denegado y restauración.
9. Agregar paginación/agregados SQL fiables para más de 1.000 registros antes de considerar el
   panel apto como cierre anual. El panel avisa si llega a ese límite.
10. La contadora debe revisar la clasificación de ingresos, IVA y obligaciones de facturación.
    No utilizar el saldo en pantalla como determinación tributaria automática.

## Bancolombia/Wompi
La usuaria quiere abrir una cuenta nueva para operaciones personales y dedicar su cuenta
Bancolombia antigua a Wompi. No se transfiere un "salario" formal a ella misma como persona
natural; puede registrar retiro de titular con comprobante y conciliación.

## Límites actuales
- No se han guardado ventas ni movimientos reales y no se ha aplicado migración.
- Falta cuenta administradora, proveedor de pagos, cuenta bancaria receptora y webhook.
- Sin aprobación para merge en main ni publicación; el PR debe permanecer en borrador.
