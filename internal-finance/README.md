# SPM Digital Wellness · Administración financiera privada
Estado: preparación no publicada. Fecha: 2026-10-08.

## Separación de productos y arquitectura
- `public-web/index.html`: sitio público SPM con historia, áreas, recursos educativos, preguntas frecuentes y políticas.
- `public-web/admin/index.html`: interfaz administrativa privada, sin enlace desde la web pública.
- `public-web/admin/ledger-core.js`: cálculo y CSV del panel financiero.
- `internal-finance/sql/001_finance_ledger_v1.sql`: migración RLS no pública, **NO ejecutada**.
- `premium-v2/`, `spm-central/`: experiencia del usuario, evaluación, Performance Map, 28 días y contenido comercial, **sin datos financieros administrativos**.

## Garantías que deben verificarse antes de publicar
1. No añadir accesos al panel en menús, footer, evaluaciones ni programas de usuario.
2. Ruta /admin/ con autenticación de la titular y verificación de rol específica vía servidor/RLS.
   **No equivale a ocultar el enlace:** el URL será técnicamente descubrible, pero ningún dato podrá consultarse sin autorización.
3. Para protección adicional evaluar acceso por subdominio `admin.` y reglas de protección de acceso de Vercel.
   Las funciones que consultan o gestionan dinero deben verificar identidad/rol en servidor, no solo cliente.
4. Mantener `service_role`, secretos de Wompi y credenciales bancarias fuera de código público; nunca almacenar PIN ni contraseña de Nequi.
5. Aplicar migraciones solo en una base Supabase de pruebas después de backup y revisión RLS.
6. Registrar ventas SOLO por backend con firma de webhook verificada; confirmar identificador, referencia, COP y valor del pedido; idempotencia obligatoria.
7. Completar paginación y cálculos de más de 1.000 movimientos antes de cierre fiscal.
8. Registrar comisiones, reservas, gastos, aportes y retiros de la propietaria en secciones separadas.
9. Reservas son presupuestación; retiro personal de la propietaria NO es nómina laboral ni gasto del programa por sí mismo.
10. No desplegar sitio público hasta finalizar políticas legales, teléfono/domicilio y revisión de contenido.
11. Esta rama parte de `feat/legal-colombia-v1`, no de `main`; reconciliar cuidadosamente las diferencias del código del programa.
12. El sitio web no está aún vinculado a un proyecto Vercel independiente; NO asumir que las URL de Premium staging son la web institucional.
13. Las pruebas automatizadas del frontend no sustituyen QA de autenticación real, permisos RLS, protección de acceso, integración Wompi y banca.

## Wompi y cuenta receptora
- Vinculación tentativa inicial a Nequi propio (persona natural, cuenta activa a nombre de la titular).
- Posible cambio posterior a cuenta de ahorros Bancolombia exclusiva, sujeto a validación y proceso de Wompi.
- No asumir que dos cuentas puedan operar como receptoras simultáneas. Confirmar soporte y tiempo del cambio.
- El primer desembolso de personas naturales puede tardar ~30 días tras primera transacción aunque la cuenta tenga antigüedad suficiente.
- La cuenta con débitos de crédito automáticos no debe utilizarse para el recaudo.

## Condición de publicación
No fusionar a `main`, no desplegar en producción ni ejecutar SQL hasta verificar y aprobar el flujo administrativo privado con cuentas de prueba.
