# SPM — Revisión del preview alojado

## Entorno y trazabilidad

La revisión autorizada se publica en la rama `fix/spm-technical-20261127` del repositorio público `lucenithfusm-cmyk/spm-mvp`, mediante el [PR borrador #85](https://github.com/lucenithfusm-cmyk/spm-mvp/pull/85).

La primera revisión visual satisfactoria se realizó en el commit remoto `287b9b182640dc10908aedafe1ff0bf6cf231449`, árbol `1441952f723ef921d3bd38f78c61c11197abfbac`, deployment `dpl_AXD3szuyVQZNYsdRH4JToz3e34SY` de `spm-premium-staging`. Corresponde al commit local `b6690f41e62d228705af9557569ec9de82637f71` por identidad del árbol completo.

Entrada: `/premium-v2/revision-programas-28-dias.html`. Navegador Chromium de escritorio, con acciones reales sobre los controles y observación del DOM visible. Se utilizaron únicamente registros sintéticos en memoria. No se inició sesión, no se probaron cobros y no se escribieron datos de pacientes. Los enlaces temporales de acceso no se incluyen en este documento público.

## Problemas encontrados y corregidos

1. El deployment inicial `8075d4b` devolvía 404 para la política compartida bajo `/supabase/functions/_shared/assessment-policy.js`; el visor presentaba su mensaje de error de carga. Se creó la copia pública exacta en `/premium-v2/assessment-policy.js`, con regresión de igualdad byte por byte, y se conservó la exclusión completa de `/supabase/`. En el deployment corregido se verificaron 200 para la política pública y 404 para su antigua ruta backend.
2. El panel fijo de voz podía interceptar la navegación móvil al expandirse automáticamente después del watchdog. Ahora se integra en el flujo de la actividad o iframe que inicia la voz y solo abre sus detalles por acción explícita. La tanda focal de voz y consumidores aprobó 42/42; el smoke móvil de Actions aporta una comprobación distinta, que debe acreditarse por separado.

## Recorridos observados

| Caso | Resultado visible |
|---|---|
| Carga del visor | Se habilitaron los selectores Programa/Día y se presentó la agenda 27/11 con práctica principal y apoyo voluntario. |
| Conexión día 1 | Se eligieron Placer `0`, Intimidad `No aplica`, Satisfacción personal `7` y Conexión corporal `3`, con prioridad Conexión corporal. «Guardar y finalizar» confirmó «Realizada y guardada». |
| Conexión 1 → 28, sin recarga | Los cuatro valores de Día 1 se recuperaron exactamente: `0/10`, `No aplica`, `7/10`, `3/10`. La columna Hoy permaneció sin responder. |
| Conexión 28, cierre voluntario | El botón abrió una confirmación explícita. Al aceptarla apareció «Ciclo de 28 jornadas cerrado» y el mensaje final. El selector permaneció en 28 y Siguiente quedó deshabilitado. |
| Conexión 28, navegación nueva | Al recargar y abrir la actividad, las cuatro dimensiones de Día 1 mostraron «Sin registrar». La falta de línea base no se convirtió en cero ni en No aplica. |
| Conexión 13, modalidad individual | La modalidad Individual/En pareja era visible. «Su ritmo» explicó que en Individual se registran preferencias propias; no solicitó una respuesta inventada de la pareja. |
| Conexión 13, guardado parcial | «Mi ritmo» guardó una reflexión sintética. Al volver a Hoy continuó `0 de 1 registros de cierre guardados` y el cierre permaneció deshabilitado. |
| Conexión 13, finalización explícita | Al reabrir, la reflexión persistía. Tras completar una decisión y pulsar «Finalizar actividad», apareció `1 de 1` y se habilitó el cierre. |
| Erección día 1, navegación y voz | Se abrió la práctica de seis pantallas, se solicitó la introducción y se avanzó mediante el botón visible sin interceptación del panel. |
| Erección día 1, escala | El estado inicial no tenía selección. Elegir 0 mostró «NIVEL 0 SELECCIONADO»; No evaluable desmarcó 0 y mostró su explicación propia; Continuar sin puntuar permitió avanzar. Al volver, apareció «Valoración omitida», sin cero ni respuesta No evaluable seleccionados. |

## Límites de esta evidencia

Estos recorridos acreditan el comportamiento observado del visor y su persistencia sintética durante la sesión, no Auth/PostgREST alojados ni una migración de producción. La validación de SQL y del adaptador real contra PostgreSQL local está documentada por separado.

La voz de este navegador cloud devolvió el estado de recuperación «No disponible» en algunos intentos. Se comprobó que el texto y la navegación seguían disponibles; no se acredita reproducción acústica, timbre ni calidad de voz en un dispositivo físico. Safari iOS y Chrome Android físicos siguen pendientes.

## Revisión consolidada de las cápsulas y HTTP

El commit remoto `ced7a2ad731387ecabf0fb31cbbf53f3e6ad9b1b`, árbol `c63ebd30871c40e37dfcdd761d3cee1cdd2f30cd`, se desplegó como `dpl_FZgx9ReERMnabcNJc8DaF4SjdFeD` y alcanzó READY. Su árbol es idéntico al commit local `bf2015873ecd164a4d8c2af1c8fcde48c29aa0c7`. La nueva revisión cambia la presentación EP, actualiza las pruebas y sus dependencias y regenera las huellas de los inventarios.

Se inspeccionaron en el navegador cloud las cápsulas de los días **1, 5, 15, 19, 23 y 25**. En las seis, la imagen se presentó completa en su proporción original dentro del lienzo 9:16. Se observaron el logo, el indicador de día, la ilustración, el icono y la onda de reproducción y la cinta inferior. Los títulos revisados quedaron íntegros dentro de su caja, incluidos el margen reducido del día 19 y el titular del día 5. No se observó invasión del control de reproducción. Las cajas opacas de sustitución son visibles; cubren exclusivamente el área del titular original, incluido su fondo cuando el texto estaba sobre la ilustración.

En el día 1, pulsar el póster activó la solicitud de voz y «Leer narración» mostró la guía completa. El estado «No disponible» del dispositivo mantuvo el panel cerrado y el texto accesible. «Volver a Hoy» permitió cerrar las cápsulas y cambiar de día. No se declara reproducción acústica aprobada. Los otros ocho carteles tienen inspección de fuente y pruebas DOM, pero no se presentan como ocho recorridos visuales adicionales.

La comprobación HTTP inicial aprobó **24/24** en `287b9b1`: once recursos 200 con MIME y SHA-256 exactos, diez rutas internas 404 y tres entradas que conservan la página de pausa. El delta de `ced7a2a` aprobó **8/8**: nuevo JavaScript EP, visor y política 200 con huellas exactas, tres rutas internas 404 y dos entradas de pausa. La configuración de deployment, la política y el coordinador de voz permanecen idénticos entre ambos commits. Estas tandas se solapan y no se suman como controles independientes.

- [HTTP completo del primer preview corregido](spm-http-preview-287b9b.json).
- [HTTP del delta consolidado](spm-http-preview-ced7a2a.json).
- [34 pruebas focales de publicación, continuidad y visor](spm-prepublish-focused.tap).

Los inventarios regenerados mantienen 171 paquetes y 6.948 referencias españolas; las huellas de sus 171 fuentes coinciden con el código local publicado. Esa identidad no sustituye las verificaciones pendientes de vídeo, audio físico, backend alojado o arte de Insights.
