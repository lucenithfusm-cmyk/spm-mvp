# SPM Central — actividades diarias y revisión de seguridad

## Corrección

La vista Hoy trataba cualquier recomendación de revisión profesional como una pausa completa, incluyendo las revisiones educativas. El aviso no mostraba el motivo. Además, bienestar aparecía como texto y ciertos recursos de biblioteca podían adelantar el calendario.

La comprobación ahora es por actividad. La revisión no urgente permite formularios educativos, controles y hábitos permitidos; las prácticas restringidas muestran la indicación y opciones de consulta. Una señal urgente conserva la pausa. No se borran respuestas, banderas clínicas ni datos de cuentas.

Días 7, 14, 21 y 28 conservan revisiones ligeras. Ante revisión clínica no urgente, los pilares usan la revisión educativa del día; EP conserva sus controles específicos D14/D28. Abrir, consultar o guardar un recurso no completa la jornada. El cierre explícito comprueba los registros requeridos del usuario, plan y día; los apoyos opcionales no son una barrera al cierre.

## Distribución conservada e integrada

| Programa | Asignación |
| --- | --- |
| Ruta principal | Lección o sesión del día según Performance Map; 28 días |
| Control eyaculatorio | Sesiones 1, 3, 5; 8, 10, 12; 15, 17, 19; 22, 24, 26; controles 14 y 28 |
| Respiración guiada | 3, 6, 10, 13, 17, 20, 24, 27 |
| Focalización sensorial | 4, 8, 12, 16, 19, 23, 26 |
| Piso pélvico | Día 6; apoyo condicionado y opcional 12, 19, 24. En EP, día 24 usa la alternativa de control ya programada. Se conserva la adaptación propia del laboratorio. |
| Recuperación, confianza, comunicación | Integradas en las lecciones existentes 11/25, 13 y 18, sin una segunda tarjeta cuando el pilar ya las incluye |
| Bienestar | Una microacción opcional por día: nutrición → movimiento → sueño; 10/9/9 acciones en el ciclo. Guía de tres pasos y registro persistido. |
| Biblioteca | Programas completos disponibles para consulta; no adelanta días |

El calendario desplegable y Hoy consultan la misma lista de actividades. Recuperación abre una historia por sesión; la biblioteca conserva todas. La conexión desde DE abre la ficha de comunicación correspondiente en lugar de un destino inexistente.

## Verificación

- Matriz de 168 combinaciones: 28 días × seis rutas principales; máximo cuatro tarjetas, sin IDs repetidos, un hábito de bienestar diario.
- Navegador a 390/768/1440 px: apertura, retorno, persistencia tras recarga, fallo/reintento, aislamiento de rutas, checkpoints, límite D28 y no avance desde biblioteca.
- Reproducción del día 14 con aviso de revisión: guardar revisión y completar el día sin borrar el aviso.
- Señal urgente: muestra motivo, permite consulta de biblioteca y rechaza guardar/completar prácticas.
- Todas las pruebas de datos usan registros ficticios e interceptan el cliente de datos; no verifican los datos particulares de una cuenta real.
- Vista previa de Vercel del commit `8b4f380`: 706 comprobaciones aprobadas en navegador, incluidas las 168 combinaciones de ruta y día.
- La prueba de restauración se actualizó para comprobar que guardar en biblioteca no avanza la jornada y que el cierre explícito exige los registros diarios. Verificada con todas las capas Premium y con la ruta heredada.

Archivos de pruebas: `tests/daily-practice.test.cjs`, `tests/daily-support-plan.test.cjs`, `tests/daily-safety-calendar-browser.cjs`, `tests/daily-entry-browser.cjs`, `tests/daily-practice-browser.cjs` y pruebas existentes de los puentes de programas.

Estado: correcciones publicadas en vista previa para revisión de la usuaria. No fusionar en producción antes de esa revisión.

## Autorización de sincronización

El 16 de octubre de 2026 la usuaria autorizó explícitamente guardar estas correcciones en `lucenithfusm-cmyk/spm-mvp` y actualizar únicamente la vista previa de Vercel. Se conserva el PR 26 en borrador para su revisión antes de publicar producción.
