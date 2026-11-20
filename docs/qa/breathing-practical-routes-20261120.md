# Respiración diafragmática · dos recorridos prácticos

Fecha: 20 de noviembre de 2026. Rama de revisión: `fix/spm-audio-fullscreen-20261120`.
PR: https://github.com/lucenithfusm-cmyk/spm-mvp/pull/84
Base de esta iteración: árbol de la revisión `4345259593762a77a12a5f48034cd42dc4722945`.

## Solicitud y alcance

La propietaria confirmó que los audios ya se escuchan y aclaró que su nueva petición corresponde a **Respiración diafragmática**, no a Pelvic Floor Lab. Quiere que las actividades prácticas que antes solo se encontraban en la biblioteca también aparezcan en las rutas, en una o dos sesiones visuales, conservando los recursos aprobados.

Esta iteración reorganiza solo Respiración y sus accesos de revisión. Conserva la biblioteca de 18 pantallas, los archivos originales de imágenes, narraciones y videos, y los cambios anteriores de Pelvic y Deseo. Se entrega en la rama y el proyecto de revisión autorizados; no se fusiona en `main`.

## Recorridos

| Etapa | A · Reconoce y respira | B · Suelta y regula |
| --- | --- | --- |
| 1 | Alternar imágenes torácica/diafragmática y observar su movimiento | Soltar mandíbula, hombros y abdomen con tarjetas seleccionables |
| 2 | Observar las manos en pecho y abdomen, elegir lo percibido y revisar tres señales | Percibir el movimiento del abdomen y revisar las tres señales de autoverificación |
| 3 | Preparación del día y demostración original; completa en día 3, opcional en las demás sesiones A | Contexto asignado del día; conserva el video de regulación del día 20 |
| 4 | Una sola práctica respiratoria original y su registro | Una sola práctica respiratoria original y su registro |

La imagen original permanece como base. Una capa SVG anima únicamente la región del pecho o del abdomen, con flechas y rótulos. El control permite iniciar y pausar; no hay reproducción automática. La leyenda indica que el movimiento es ilustrativo y que la persona respira a su ritmo. El ciclo visual no modifica el temporizador clínico ni la cadencia del pacer. El modo de movimiento reducido conserva una vista estática.

Las selecciones son temporales dentro de la sesión. No certifican técnica, no crean resultados clínicos ni cambian competencias. La observación ofrece indicaciones descriptivas para evitar forzar el aire. La biblioteca conserva sus contenidos y navegación originales.

## Calendario y práctica final conservados

El catálogo de presentación lee la actividad de Central. No modifica `daily-support-plan-v1.js` ni crea nuevas asignaciones.

| Día | Asignación | Recorrido | Práctica final original |
| --- | --- | --- | --- |
| 1, solo asignación inicial de Erección | `breath-start` | B | `rescue`, 3 ciclos, sin pausa |
| 3 | `breath-learn` | A | `core-426`, 5 ciclos, sin pausa |
| 6 | `breath-release` | B | `pelvic-release`, 60 segundos |
| 10 | `breath-two` | A | `session-2`, 120 segundos |
| 13 | `breath-rescue` | B | `rescue`, 3 ciclos, sin pausa |
| 17 | `breath-arousal` | A | `arousal`, 60 segundos |
| 20 | `breath-regulate` | B | `downregulate`, 60 segundos |
| 24 | `breath-consolidate` | A | `session-2`, 120 segundos |
| 27 | `breath-autonomy` | B | `session-2`, 120 segundos |

Se conserva la opción original de finalizar cuando la persona haya realizado la práctica y registrar los segundos efectivos. La preparación no incorpora el pacer adicional de la pantalla de mano en abdomen, ni añade la sesión de cinco minutos de la biblioteca.

## Audio y navegación

Se reutilizan las narraciones aprobadas de comparación, localización, autoverificación, liberación y contexto. El botón Escuchar sigue reactivando explícitamente la voz si estaba silenciada. Las transcripciones están disponibles en «Leer explicación». Los controles conservan tamaño táctil, dorado y halo.

La etapa final utiliza `instruction.daily.4-6` en las prácticas sin pausa (días 1, 3 y 13) y `instruction.daily.flexible` en las demás. En los rescates, esto precisa la instrucción de acuerdo con el pacer ya existente; no altera sus tres ciclos.

El audio especial aprobado de la primera práctica de Erección se muestra solo en su primera etapa y se detiene al retirarla. La voz, el video y el pacer se detienen al navegar, salir u ocultar la página. La ilustración también se pausa al abrir seguridad; no se reanuda automáticamente al volver. El check-in pendiente permanece montado durante esa consulta.

La sesión diaria ocupa todo el viewport disponible del dispositivo. Conserva el botón del programa para volver y el estado de guardado. El contenido puede desplazarse en pantallas pequeñas, con navegación táctil fija al borde inferior. La biblioteca mantiene su marco previo.

## Guardado y restricciones

`PracticeBlock` se extrajo sin cambios de comportamiento. Guardar conserva el identificador estable durante los reintentos, los segundos efectivos, comodidad, mareo y preferencia sin pausa. Se persiste en Central, se espera `flush()` y después se registra la actividad diaria. Los errores permanecen visibles y permiten reintentar sin duplicar la sesión.

Abrir, navegar, elegir observaciones, consultar seguridad o salir no completa automáticamente la actividad. Asignaciones desconocidas o malformadas, otro día y restricciones de Central impiden montar el pacer. No hay nuevas tablas, campos de paciente ni cambios en la base de datos.

## Validación local

- TypeScript y build Vite de Respiración aprobados.
- 70 pruebas del módulo aprobadas: calendario real, parámetros de las prácticas, preparación sin pacer adicional, narración, movimiento reducido, pausas, restricciones, guardado y reintentos.
- 19 pruebas del bridge de Respiración aprobadas: privacidad, contexto, persistencia, retorno, modo diario/biblioteca y audio de primera práctica limitado a la preparación.
- 25 pruebas del visor de revisión aprobadas: incluye lanzamientos diarios reales en días 3 y 6, y día sin asignación sin abrir una biblioteca como sustitución.
- Los 29 medios originales del manifiesto conservan su SHA256 (`sha256sum --check media-sha256.txt`). Se regeneran únicamente JavaScript, CSS e índice HTML del build de Respiración.
- Prueba de navegador existente adaptada a las cuatro etapas, imágenes y pausa, pantalla completa, reproducción y guardado. Sintaxis de `tests/breathing-lab-browser.cjs` aprobada; su ejecución automatizada se reserva al CI con Chromium disponible.
- Revisión de diferencias sin errores de espacios.

Comandos: `npm run typecheck`, `npx vitest run` y `npm run build` en `labs/breathing`; `node --test tests/breathing-lab-bridge.test.cjs` y `node --test tests/program-review.test.cjs` en la raíz. El harness de revisión usa JSDOM 26.1.0, la versión fijada por ambos labs; en este entorno se comparte la instalación local de esa dependencia, sin cambiar los manifiestos ni el lockfile.

Esta validación es dirigida. No declara aprobado todo el CI del repositorio: la iteración anterior documentó seis fallos preexistentes fuera de este cambio. La evidencia del despliegue y la inspección móvil se registra en la PR.

## Inspección interactiva del preview

Build funcional comprobado: `f7663a2d60a03859c815220b429fc061e0a2104f`, proyecto `spm-premium-staging`, equipo `lucenithfusm-cmyk`, Vercel READY. Se usaron exclusivamente perfiles sintéticos del visor.

| Caso | Resultado observado |
| --- | --- |
| Sesión A, día 3, 390 × 844 | Imagen original de 1536 px decodificada; alternancia de abdomen y pecho; el movimiento CSS cambia la transformación y se pausa al cambiar de imagen. |
| Narración A | `screen.02.mp3` terminó a 9,30 s sin error; la instrucción final 4–6 avanzó a 10,83 s sin error. |
| Observación | La elección Abdomen y la primera señal quedan seleccionadas y muestran una indicación descriptiva. No hay pacer en preparación. |
| Demostración | Video original `SPM_Respiracion_Lenny_Audio_Corregido.mp4` cargado, reproducido hasta 5,71 s y pausado, sin error. |
| Práctica A | Una sola guía con ritmo 4·6. Finalización manual tras 14 s efectivos, consulta de seguridad y retorno conservan el check-in; Guardar muestra confirmación. |
| Salida | Volver a Hoy elimina el modal de Respiración. |
| Sesión B, día 6, 320 × 568 | Tarjetas seleccionables, tres observaciones, voces `screen.07` y `screen.06` sin error. Avanzar detiene la narración; no hay pacer en las tres primeras etapas. |
| Práctica B | Un solo pacer final, ritmo original 4·2·6; sin desbordamiento horizontal. |
| Biblioteca | El acceso desde la sesión B abre la biblioteca y su índice conserva las 18 pantallas. |

La inspección detectó una barra de desplazamiento de la página subyacente que restaba ancho en el visor. El ajuste posterior bloquea únicamente ese desplazamiento mientras el modal diario está abierto, ocupa `100vw`, usa una barra interior oscura y elimina el contorno visual del título enfocado por navegación. La comprobación del build final se registra en la PR. Estas observaciones corresponden al navegador remoto; no se presentan como una nueva escucha física en el dispositivo de la propietaria, quien ya había confirmado el funcionamiento de los audios.

## Accesos de revisión

- A: `/premium-v2/revision-programas-28-dias.html?programa=desire&dia=3&abrir=respiracion-ruta`
- B: `/premium-v2/revision-programas-28-dias.html?programa=desire&dia=6&abrir=respiracion-ruta`
- Visor móvil: `/tests/experience-mobile-review.html?module=breathing-daily&day=3`
- Biblioteca: conserva `abrir=respiracion`.

El acceso diario usa la asignación real de `SPM_DAILY_PRACTICE` y su lanzador, con datos sintéticos de revisión. No abre sesiones de pacientes.

## Referencias para revisar las indicaciones descriptivas

- Guy’s and St Thomas’ NHS, [Abdominal breathing](https://www.guysandstthomas.nhs.uk/health-information/abdominal-breathing): observación con una mano en pecho y otra en abdomen, relajación de hombros y movimiento sin esfuerzo.
- NHS, [Breathing exercises for stress](https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/): postura cómoda y respiración suave sin forzar.

Estas referencias apoyan la redacción de observación y comodidad. No se importaron sus pautas de duración o frecuencia; el calendario, los tiempos y las reglas del programa existente se conservan.
