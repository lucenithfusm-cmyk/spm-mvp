# Estado de publicación de la revisión técnica SPM

## Autorización expresa recibida

La usuaria autorizó expresamente publicar el código corregido, los calendarios, los inventarios completos de textos y voz y los informes de QA en la rama `fix/spm-technical-20261127` del repositorio público `lucenithfusm-cmyk/spm-mvp`, y crear el PR borrador y el preview de Vercel. El bloqueo de autorización quedó resuelto: la subida de los objetos se aceptó y sus SHA coinciden con los archivos locales.

La rama ya está publicada y el [PR #85](https://github.com/lucenithfusm-cmyk/spm-mvp/pull/85) permanece como borrador. Vercel generó el preview del proyecto `spm-premium-staging`; después de corregir la carga de una dependencia se completaron recorridos reales del visor sintético. El resultado alojado y sus límites se documentan en [la revisión del preview](spm-hosted-preview-review-20261127.md) y en el PR. Esta autorización no incluye fusionar en `main`, aplicar la migración a producción o reabrir cobros.

Los apartados siguientes conservan exclusivamente el registro histórico previo a esta publicación; no describen un bloqueo actual.

## Trabajo conservado

La implementación está confirmada mediante commits locales en la rama `fix/spm-technical-20261127`. La suite completa aprobó 718/718 y la verificación focal posterior de aplicación/reingreso aprobó 17/17. El paquete entregado contiene los archivos cambiados, una lista explícita de eliminaciones y un Git bundle incremental respecto de `c27bbbba0292513b898d0684a30a95cd1e4e6449`.

## Registro del bloqueo anterior por revisión automática

Destino propuesto: repositorio **público** `lucenithfusm-cmyk/spm-mvp`, rama de revisión nueva, sin modificar `main`.

Se comprobó mediante el conector que el propietario del repositorio coincide con el usuario conectado y que tiene permisos de administración y escritura. También se releyeron las secciones 1 y 2 del documento aportado, que señalan el repositorio y una rama de revisión.

La revisión automática permitió crear un objeto de código para `premium-v2/restore-rescue-v1.js` tras esa comprobación. No se añadió a ninguna rama remota. Posteriormente rechazó los intentos de subir `onboarding-review.json` y `spm-agenda-20261127-manifest.json`, porque considera que los inventarios completos contienen material interno y exige autorización explícita del usuario para hacerlo público. Se detuvieron las demás escrituras externas; no se buscó otra vía de publicación.

El envío por Git local también carece de credenciales, por lo que la conexión de GitHub es la vía disponible para publicar una vez resuelta la autorización. No se creó un pull request ni se generó un deployment de revisión. No se aplicó ninguna migración alojada ni se activaron cobros.

## Alcance de la autorización que se solicitó

Autorizar la publicación del **código corregido, los calendarios/manifiestos, los inventarios completos de textos y voz, los informes y los resultados de QA** en la rama `fix/spm-technical-20261127` del repositorio público `lucenithfusm-cmyk/spm-mvp`, junto con un pull request borrador y un preview de revisión en el proyecto existente `spm-premium-staging` de Vercel.

La consecuencia señalada por la revisión automática es que los inventarios y su trazabilidad quedarían públicamente accesibles a través del repositorio. Esta autorización no incluye la aplicación de la migración a producción ni la reapertura comercial.

La validación alojada de Supabase requiere además un entorno aislado. No se creó una rama con coste, no se asumió consentimiento para cargos y no se usaron datos de pacientes para suplir esa prueba.

## Continuación del trabajo

Tras la respuesta «Chat continuemos con las tareas», se verificaron de nuevo la cuenta, la propiedad y los permisos del repositorio, la ausencia de la rama remota y el proyecto de preview. La revisión automática volvió a rechazar el primer intento de subida del inventario `onboarding-review.json`: indicó que autorizar correcciones y continuar las tareas no constituye autorización expresa para publicar su contenido completo en el repositorio público. No se subió ningún objeto nuevo en esta continuación ni se intentó otra vía.

Se completó el trabajo local independiente del bloqueo: configuración para excluir del deployment los informes, scripts y SQL, reglas HTTP de denegación que conservan la política pública usada por el visor, comprobaciones focales y preparación de la validación aislada. El detalle y los límites figuran en `spm-preview-preparation-20261127.md`. Esta protección web no cambia la visibilidad del repositorio GitHub ni resuelve por sí misma la autorización pendiente.
