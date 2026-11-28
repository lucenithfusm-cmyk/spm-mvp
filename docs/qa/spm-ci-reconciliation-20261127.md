# Reconciliación de CI de las correcciones SPM — 27 de noviembre de 2026

Actualizado el **28 de noviembre de 2026 a las 06:07 UTC**. Este informe distingue el CI de la publicación inicial, las correcciones locales de pruebas y los resultados que todavía requieren una nueva ejecución en GitHub Actions.

## Estado de la publicación analizada

El [PR borrador #85](https://github.com/lucenithfusm-cmyk/spm-mvp/pull/85) utiliza la rama `fix/spm-technical-20261127`.

La ejecución inicial corresponde exactamente al commit remoto **`8075d4bd3ca66353c2004d3148a9bb9863daa872`**, árbol **`582fba7aa2afd15a81cf3d6ab22a9b3e73a7a779`**. Se consultaron sus 21 ejecuciones de workflows: **5 terminaron correctamente y 16 fallaron**. Son ejecuciones, no casos de prueba; incluyen los eventos `push` y `pull_request`.

El commit posterior **`287b9b182640dc10908aedafe1ff0bf6cf231449`** contiene la política pública necesaria para cargar el visor y la corrección del panel de voz. Sus equivalencias locales son commit `b6690f41e62d228705af9557569ec9de82637f71`, árbol `1441952f723ef921d3bd38f78c61c11197abfbac`. El paquete de reconciliación descrito aquí se preparó sobre ese estado y todavía no tenía commit remoto al redactar este informe. Los resultados iniciales no describen el resultado final del PR.

El [registro JSON sanitizado](spm-ci-publication-result-20261127.json) conserva SHA, enlaces de las ejecuciones, clasificación de fallos, resultados y límites. No contiene credenciales, enlaces firmados de acceso ni cabeceras de herramientas.

## Resultados comprobados

Estas suites se solapan. **No se deben sumar sus cantidades.**

| Verificación | Resultado | Alcance |
| --- | --- | --- |
| Node en el [workflow principal del PR inicial](https://github.com/lucenithfusm-cmyk/spm-mvp/actions/runs/46114166212) | **729/729**, cero fallos | TAP descargado del artifact de GitHub; la etapa Node terminó correctamente aunque después falló Vitest. |
| Vitest en esa publicación inicial | **126 aprobadas, 1 fallida, 127 en total** | Una expectativa histórica asignaba al día 10 una respiración de Control que el catálogo ya sitúa en el 11. |
| Vitest completo tras corregir esa expectativa | **127/127**, 8 archivos | `cd labs/breathing && npx vitest run`. No cambia el calendario del producto. |
| Restauración de usuario con todas las capas de `live.html` | **5/5** | `SPM_QA_ALL_LAYERS=1`; incluye mapa, día guardado, perfil detenido, biblioteca separada y cierre explícito. |
| Primera ejecución focal de contratos de los workflows afectados | **261 aprobadas, 1 fallida, 262 en total** | Detectó una incompatibilidad entre dos copias instaladas de JSDOM al observar nodos de otra copia. |
| Repetición de los contratos afectados después de corregir JSDOM | **63/63** | Archivos `daily-practice.test.cjs` y `device-voice-20261127.test.cjs`; no se presenta como una repetición completa de los 262. |
| Contratos focales de los dobles RPC de navegador | **8/8** | Ejecutados en VM: errores, recibos, revisiones, contexto, cierre único, historial coherente y límite del día 28. No son pruebas SQL ni de navegador. |
| Reproducción de Breathing Lab | **45/45 archivos idénticos** | Build Vite aislado, mismo conjunto de rutas relativas y mismo SHA-256 de cada archivo que el dist publicado. |
| Reproducción de Pelvic Floor Lab | **54/54 archivos idénticos** | Misma comparación completa de rutas y hashes. |
| Estructura YAML de workflows modificados | **9/9** | Parseo y presencia de estructura de jobs, incluida la separación del control de producción. |
| Sintaxis de scripts de pruebas y fixtures modificados | **12/12** | `node --check`. |
| Integridad del diff | Correcta | `git diff --check`. |
| Playwright local | **No ejecutado** | El paquete carga, pero el lanzador `/usr/bin/chromium` apunta a un binario inexistente. Los recorridos requieren Actions. |

El artifact Node inicial fue `15250908671`; el ZIP descargado coincide con SHA-256 `3c5b9d481ab931060f3adfe2e0dd2e38a976e6b0bf9ceaa3e28c3e69332287bc`. Su TAP registra 729 aprobadas, cero fallos y una duración de 50.609 segundos.

## Correcciones realizadas

### Dependencias declaradas por los workflows

El fixture compartido de voz utiliza JSDOM 26.1.0 desde las dependencias fijadas de `scripts/qa`. Se añadió su instalación explícita a los workflows de técnica combinada, Stop-Squeeze, semanas 3–4 de Deseo, Focalización, Stop-Start, fuerza pélvica y prácticas diarias. Sus filtros también detectan cambios en el fixture y en el manifiesto o lockfile de QA.

Se corrigieron además dependencias concretas que faltaban en instalaciones limpias:

- El workflow de fuerza pélvica instala `labs/pelvic-floor`, porque sus pruebas compilan código con TypeScript de ese paquete.
- El workflow de prácticas diarias instala `labs/desire`, utilizado por el test de checkpoints.
- El workflow de integración pélvica instala `labs/breathing`, utilizado por su test de puente.

La instalación de la voz en un fixture que ya posee una ventana JSDOM real se realiza dentro de esa misma ventana. Esto mantiene las marcas de los nodos DOM compatibles con `MutationObserver`. Los fixtures de objetos mínimos mantienen su coordinador aislado. Se ejecuta el controlador de voz real en ambos casos.

### Carga completa de scripts en el test de restauración

El harness resuelve URLs relativas y absolutas como el navegador, por lo que `/premium-v2/device-voice-v1.js` deja de duplicar el directorio `premium-v2`. Reproduce `document.currentScript` durante la ejecución y utiliza el contexto global persistente de VM para que los `const` de un script estén disponibles en los siguientes, como sucede con scripts clásicos de una página.

Las respuestas del doble de transporte se clonan. La mutación del plan simulado del servidor deja de alterar por referencia el estado capturado del cliente durante una operación pendiente. Las cinco comprobaciones de restauración conservan sus aserciones y pasan con todas las capas habilitadas.

### Fuente y dist de los Labs

Las únicas modificaciones de producto en este paquete son las consultas de caché de los dos HTML fuente:

- `labs/breathing/index.html`
- `labs/pelvic-floor/index.html`

Ambas usan `device-voice-v1.js?v=20261127-technical`, igual que sus HTML distribuidos. Los builds aislados reproducen todos los archivos distribuidos sin diferencias de contenido.

### Distinción entre agenda histórica y agenda nueva

Los cinco smoke de Deseo que verifican la correspondencia histórica entre día y contenido solicitan expresamente `agenda=legacy` y comprueban `scheduleVersion === 'legacy'`:

- `desire-access-browser.cjs`
- `desire-viewport-access-browser.cjs`
- `desire-calendar-access-browser.cjs`
- `desire-week3-central-browser.cjs`
- `desire-weeks3-4-viewport-browser.cjs`

Se mantienen las comprobaciones de apertura, cambio de programa, guardado, retorno, ausencia de duplicados, visibilidad y geometría. Las pruebas de la agenda nueva siguen usando su versión actual.

El test Vitest del itinerario respiratorio comprueba contenido histórico y ahora lo declara explícitamente. El catálogo `daily-support-plan-v1.js`, idéntico al de la base `c27bbbba0292513b898d0684a30a95cd1e4e6449`, ya asigna la respiración de Control al día 11. El test Node existente de ese catálogo ya esperaba el 11; la expectativa del Lab era la que estaba desactualizada.

Se contrastó también el manifiesto nuevo: en Control, las actividades respiratorias se programan los días **2, 6, 20 y 27**, usando contenido de origen de los días **1, 6, 20 y 27** respectivamente. Corregir la prueba histórica no modifica esos días ni confunde día de contenido y día programado.

### Dobles de transporte para los smoke diarios

`tests/support/daily-fixture.js` implementa `spm_get_program_progress`, `spm_save_activity` y `spm_close_program_day`. Conserva errores simulados, revisiones, recibos, conflictos, respuesta clonada y persistencia de sesión. Sembrar una jornada avanzada incluye los cierres históricos anteriores de forma explícita.

Guardar una actividad no avanza el programa. Solo el cierre explícito añade el día actual, una sola vez. El cierre del día 28 termina el ciclo sin generar el 29. Los errores y las restricciones de contexto continúan siendo observables.

`tests/returning-user-fixture.js` devuelve progreso y los cierres 1–11 para restaurar el día 12. Conserva su carácter de solo lectura y rechaza guardados o cierres.

Las comprobaciones históricas de `daily-entry-browser.cjs` y `daily-practice-browser.cjs` verifican que abrir o guardar no añada cierres y que la acción explícita añada exactamente el día 12. Se mantienen la seguridad y las respuestas sintéticas existentes; no se concede preparación de fuerza artificialmente.

### Smoke de voz y Focalización vigente

El smoke respiratorio usa el controlador real `SPM_VOICE` con un doble del API nativo que conserva una emisión activa hasta que el coordinador la cancela. Comprueba la solicitud desde el botón, el texto completo aprobado, cancelación, exclusión entre narraciones y cancelación al cambiar de pantalla. Mantiene las comprobaciones de video, geometría, tres anchos, movimiento reducido, errores de medio, guardado con reintento, biblioteca y pausa de seguridad.

Este mecanismo comprueba solicitudes al API y comportamiento de la interfaz. **No mide sonido audible ni la calidad de una voz del sistema operativo.**

El mismo smoke tenía selectores y requisitos del tutorial React de Focalización que ya no correspondían al wrapper táctil existente en la base. Se actualizó el recorrido a las sesiones vigentes: las lecciones I2/I3 registran aprendizaje y dejan la práctica íntima sin realizar como `null`; Focalización II verifica elección de modalidad, inicio explícito, pasos manuales y ausencia de un registro completado al salir antes de terminar. No se modificó la elegibilidad clínica del producto.

El workflow conserva el typecheck y el build del código React archivado, enviando su salida a `RUNNER_TEMP`. Así no sustituye el wrapper táctil distribuido. La guardia de `git diff` y los tests del módulo táctil siguen activos. Ese build archivado no se ejecutó localmente porque sus dependencias no estaban instaladas; Actions mantiene su instalación explícita.

## Fallos de producto y fallos ajenos a este paquete

El [workflow móvil de Deseo semana 2](https://github.com/lucenithfusm-cmyk/spm-mvp/actions/runs/46114166182) mostró un defecto real: el panel fijo `aside.spm-device-voice` interceptaba el botón `.nav [data-act="next"]` en el día 8 a 390×844. Se preservó ese smoke. La corrección de producto del panel pertenece al commit posterior `287b9b1`; este paquete no sustituye el clic por una activación forzada.

El [workflow Published SPM release QA](https://github.com/lucenithfusm-cmyk/spm-mvp/actions/runs/46114166285) solicita `https://spm-premium-staging.vercel.app/premium-v2/live.html` y espera `#ageCard`. Ese alias de producción mantiene la pausa intencional. La ejecución no verifica el preview de este PR y falló esperando una pantalla que la pausa oculta.

Se corrigió su alcance en `.github/workflows/production-release-qa.yml`, ahora denominado **SPM source and published release QA**. El job `commercial-source` conserva el mismo test comercial local y se ejecuta en `pull_request` y `workflow_dispatch`. El job `published` se ejecuta solamente mediante `workflow_dispatch`; conserva las seis órdenes de navegador, la URL de producción y todas sus aserciones. No se añadió un disparador `push` a main. La auditoría publicada debe dirigirse deliberadamente al entorno que ya está sirviendo la versión a verificar.

**Que el job Published se omita en un PR no certifica que el programa esté activo ni que la auditoría de producción haya pasado.** La comprobación local del PR y la auditoría manual de la versión publicada aparecen como jobs distintos. La pausa sigue vigente; si se solicita manualmente el recorrido de un programa activo mientras esa pausa continúa, sus aserciones mantienen el fallo correspondiente. No se reactivó producción ni se alteraron pagos.

## Cierre pendiente de la verificación

Para declarar el resultado del PR hace falta consultar las ejecuciones del **commit remoto final**, después de publicar este paquete y las demás correcciones concurrentes. El estado del commit inicial, la sintaxis local, los tests DOM y la revisión manual del preview son evidencias distintas.

Quedan pendientes la ejecución de los smoke modificados en Actions y la revisión de sus resultados. La verificación independiente SQL/RLS pertenece a sus suites de PostgreSQL; los dobles descritos aquí solo reproducen transporte y contratos para probar la interfaz. Ninguna de estas acciones aplicó una migración a la base alojada.
