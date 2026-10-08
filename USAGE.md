# Publicación de SPM Digital Wellness — sitio institucional

## Qué se va a publicar
Se publica únicamente la carpeta `public-web/`: web institucional, historia, áreas, recursos educativos, mitos y realidades, contenidos aprobados y accesos privados separados. **No se publica el código ni el expediente clínico de `premium-v2/`**, ni el contenido de `internal-finance/` o `internal-site/`.

### Entorno
- Hospedaje propuesto: **Netlify Free**, compatible con uso comercial dentro de los límites del plan.
- Repositorio: `lucenithfusm-cmyk/spm-mvp`.
- Rama de despliegue: `site/spm-public-v1` (sitio institucional, NO `main`).
- Publish directory: `public-web` (definido también en `netlify.toml`).
- Framework: sitio HTML estático. No build command.
- Nombre del subdominio sugerido (sujeto a disponibilidad): `spmdigitalwellness.netlify.app`.
- Dominio propio propuesto: `spmdigitalwellness.com` + `www.spmdigitalwellness.com`, requiere compra y configuración DNS.
- Importante: NO enlazar todavía evaluación/checkout de SPM Central, porque faltan verificación legal y activación segura.

## Cómo conectar Netlify (requiere acción de la propietaria)
1. Abrir https://app.netlify.com/ y crear/iniciar sesión con su cuenta.
2. Elegir **Add new project** → **Import an existing project** → **GitHub**.
3. Autorizar el repositorio `lucenithfusm-cmyk/spm-mvp`.
4. En los ajustes elegir rama de producción `site/spm-public-v1` — **no** `main`.
5. Directorio base vacío (raíz del repositorio); publish directory `public-web`.
6. Build command vacío. Revisar `netlify.toml`.
7. Crear el proyecto como privado/inicialmente restringido si la UI lo ofrece; revisar URL, diseño, textos y archivos antes de hacer visible el sitio al público.
8. Cuando esté revisado, permitir acceso público para que lo descubran buscadores. El plan gratuito limita consumos; monitorizar 300 créditos mensuales y que no esté habilitada recarga automática.
9. Configurar DNS y SSL cuando se compre el dominio; después Google Search Console y sitemap.xml con dominio definitivo.

## Tu gestión privada (NO usar ni crear claves dentro del repo)
- Página de edición: `/admin/editor.html`. Puedes redactar y guardar borradores, seleccionar publicación, añadir portada o video por enlace.
- Contenido público: `/contenidos.html` (solo artículos `published`).
- Finanzas privadas: `/admin/index.html`.
- La URL administrativa existe, pero **no hay acceso a los datos** sin autenticación + autorización específica en Supabase; no se enlaza desde el sitio público.
- El editor usa temporalmente el proyecto Supabase existente de SPM y está deshabilitado hasta ejecutar y verificar la migración `internal-site/sql/001_editorial_cms_v1.sql` y asignar tu UID de editor desde el servidor.
- Las finanzas también requieren su propia migración y rol; no integrar pagos hasta Wompi y QA de seguridad.
- La autenticación/permiso nunca debe simularse ocultando botones.

## Pendientes obligatorios antes de venta
- Completar las políticas legales con información del proveedor y canales de contacto.
- SIM/teléfono exclusivo de SPM y domicilio válido de notificaciones.
- Desbloquear evaluación y CTA comercial solo tras comprobación de consentimiento y seguridad.
- Wompi y automatización de comprobantes; no cobros reales hasta resolver obligaciones tributarias con contadora.
- SPM Central sigue como producto independiente; sus datos sensibles NO pasan al sitio institucional.

## Indexación en Google
- Publicar un dominio no garantiza indexación ni posición en búsquedas.
- Verificar propiedad del dominio en Google Search Console, enviar sitemap una vez establecida la URL canónica.
- No generar sitemap con URL provisional si no se conoce el dominio; corregir al adoptar el dominio final.
- `robots.txt` bloquea recomendaciones al crawler para `/admin/`, pero **no es una medida de seguridad**.
