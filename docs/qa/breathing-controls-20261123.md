# Respiración · bocina superior y selección de la guía visual

Fecha: 23 de noviembre de 2026. Rama: `fix/spm-audio-fullscreen-20261120`.
Revisión: https://github.com/lucenithfusm-cmyk/spm-mvp/pull/84
Base remota de esta corrección: `03eb390b9cd014e40174d93ce179b9227cca41b0`.

## Problema observado por la propietaria

En los recorridos de Respiración diafragmática de los días 3 y 6, la bocina superior mostraba «Voz activa», pero su acción solo cambiaba el silencio global: no reproducía una explicación. El botón separado «Ver movimiento» también generaba una expectativa equivocada sobre las imágenes y exigía otro toque después de seleccionar pecho o abdomen.

## Comportamiento corregido

La bocina superior de los recorridos diarios muestra **Escuchar** cuando está disponible. Al tocarla inicia la narración aprobada de la pantalla actual y reactiva la voz si estaba silenciada. Mientras esa narración está en reproducción, muestra **Detener**. Su estado coincide con el del botón de explicación de la misma pantalla; no presenta una señal breve del pacer como si fuera la explicación.

| Pantalla | Día 3 · Reconoce y respira | Día 6 · Suelta y regula |
| --- | --- | --- |
| 1 | `screen.02`, comparación pecho/abdomen | `screen.07`, soltar tensión |
| 2 | `screen.03`, observación con las manos | `screen.06`, mano en el abdomen |
| 3 | `screen.04`, recordatorio y demostración | `screen.10`, recordatorio del día |
| 4 | `instruction.daily.4-6` | `instruction.daily.flexible` |
| Seguridad | `screen.17` | `screen.17` |

Las demás asignaciones utilizan el mismo selector de narración por etapa y el contexto ya definido en el catálogo. Una práctica final restringida no reproduce instrucciones para iniciar la actividad. La explicación de seguridad sigue disponible. No se inicia audio al abrir la sesión.

Los controles conservan el dorado, el halo, el foco de teclado y su superficie táctil. El estilo se vincula a la clase del control para que cambiar su etiqueta accesible no elimine su apariencia.

En la comparación, **Torácica · pecho** y **Diafragmática · abdomen** seleccionan la imagen y activan directamente la animación ilustrativa. Volver a tocar la opción seleccionada también la activa o reinicia. Se elimina «Ver movimiento» y el botón inicial redundante de esta comparación. Después de iniciar se puede pausar o reanudar la animación. Las guías independientes usan «Activar guía visual».

La leyenda dice **Guía visual ilustrativa · respira a tu ritmo**. Se conservan las imágenes originales y su capa gráfica de flechas; no se presenta como video anatómico ni se añade un GIF. El ciclo visual no cambia el ritmo de la práctica. La preferencia de movimiento reducido conserva la vista estática; ocultar la página, navegar o consultar seguridad no provoca una reanudación automática al regresar.

## Exclusión de audios y continuidad

La bocina utiliza el mismo reproductor y coordinador que las demás narraciones: escuchar una explicación pausa el video o la guía respiratoria que estuviera en marcha. Navegar o salir detiene la reproducción.

La primera práctica de Erección conserva su guía extendida original. Su botón notifica al módulo antes de empezar para detener tanto el MP3 nativo como su eventual lectura con voz del dispositivo. A la inversa, tocar la bocina del módulo detiene la guía extendida. La notificación de parada no contiene datos de paciente ni cambia el guardado.

Se conservan el calendario, los identificadores, los ciclos, los tiempos, las reglas sin pausa, los archivos de audio y las imágenes. Esta corrección no modifica Pelvic Floor Lab ni Deseo.

## Validación

TypeScript y build Vite aprobados. Pasaron **126 pruebas locales dirigidas**: 81 del módulo de Respiración, 20 del bridge y 25 del visor de revisión. Los 29 medios originales conservan su SHA256. La sintaxis del script de navegador y la revisión de diferencias también pasan.

Los resultados del preview se registran en la PR, distinguiendo la inspección interactiva de las verificaciones automatizadas que puedan quedar bloqueadas por gates generales del repositorio. Esta entrega no declara aprobado todo el CI global.

Comprobaciones dirigidas:

- TypeScript, suite de Respiración y build Vite.
- Pruebas de la bocina en las cuatro etapas de los días 3 y 6, silencio previo, parada, estado compartido, restricciones y seguridad.
- Pruebas de selección directa de ambas imágenes, cambio de opción mientras la animación está activa, repetición de la misma opción, pausa y movimiento reducido.
- Pruebas del bridge, incluida la exclusión de voz en ambos sentidos en la primera práctica de Erección.
- Pruebas del visor de revisión y comprobación de los 29 medios originales con SHA256.
- Script de navegador actualizado para reproducir desde la bocina, comprobar avance del audio y probar la selección directa de las imágenes; su ejecución y las comprobaciones interactivas se indican separadamente en la PR.

Comandos: `npm run typecheck`, `npx vitest run`, `npm run build` y `sha256sum --check media-sha256.txt` en `labs/breathing`; `node --test tests/breathing-lab-bridge.test.cjs tests/program-review.test.cjs` y `node --check tests/breathing-lab-browser.cjs` en la raíz.

## Entrega de revisión

Se incrementa la versión de carga a `20261123-breathing-controls1` en el bridge y en los accesos del programa y del visor. El build de Respiración utiliza sus nuevos hashes de JavaScript y CSS.

La entrega se realiza en la rama pública de revisión y en el proyecto `spm-premium-staging` del equipo `lucenithfusm-cmyk`, según la autorización vigente. La PR permanece en borrador. Los enlaces temporales para acceder al preview protegido se entregan a la propietaria y no se incluyen en esta documentación pública.
