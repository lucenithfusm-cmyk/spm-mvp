# SPM: revisión de Deseo y recorrido de 28 días

## Base y alcance

Esta revisión parte del commit publicado `98808db9b88eb5dc68b4d7aff8f639b2761867e4`, contenido en `fix/private-assessment-preview-20261111`. La rama `main` no representa esa base publicada.

- Mejora la jerarquía tipográfica de Deseo: títulos blancos, más grandes y en negrilla; nombres de deseo espontáneo y responsivo destacados.
- La tarjeta exterior de Deseo del día 1 tiene un único botón: «Iniciar mi práctica de hoy». Las indicaciones y el registro permanecen dentro de la práctica.
- El registro exterior de Deseo abre su práctica guiada y no usa la confirmación genérica para marcarla como terminada.
- Al volver, se abre la siguiente práctica pendiente. Las sesiones pausadas o interrumpidas recuperan su tiempo activo y su identificación.
- Añade `premium-v2/revision-programas-28-dias.html`, con selección de seis rutas y 28 días. Usa perfiles de ejemplo y registros en memoria, separados por programa y día.
- Conserva el contenido clínico, el calendario, las restricciones de seguridad, los archivos de medios y los assets anteriores. La recuperación es un recurso transversal del calendario existente.

## Verificación

- 46 pruebas de entrada diaria y progreso de Deseo aprobadas.
- 26 pruebas de práctica diaria aprobadas.
- 4 pruebas del visor aprobadas; cubren las 168 combinaciones, almacenamiento aislado, escrituras obsoletas y cierre de laboratorios.
- TypeScript y compilación de producción de Deseo correctos.
- Los 10 archivos anteriores de la compilación se conservan; se agregan únicamente los dos assets nuevos y se actualiza su índice.

## Continuidad y despliegue

Guardar esta revisión en una rama de Git y desplegar su commit exacto en el proyecto Vercel `spm-premium-staging` como preview. Revisar estado READY y recorrido antes de publicar para pacientes. No enviar un comprimido completo ni volcar base64 o paquetes en el chat.

Entrada del visor: `/premium-v2/revision-programas-28-dias.html?programa=desire&dia=1`.

El visor conserva los requisitos de progresión de los ejercicios; no constituye una cuenta de paciente ni modifica registros de usuarios reales.

## Pendientes ajenos a esta entrega

El informe previo describía un paquete local posterior con 254 audios, recetario y otros cambios. El commit local `409925aaf06dfe37f1e3352ec947b243757674d3` no se encontró en el repositorio remoto. Esta revisión no afirma incorporar ese paquete: conserva los archivos existentes y los cambios específicos enumerados arriba.

La comprobación especial del día 1 sigue exigiendo presencia y exploración. No se ha cambiado la regla de finalización de los otros días para exigir todos los candidatos del motor: ese cambio requeriría coordinar su secuencia completa y sus pruebas.
