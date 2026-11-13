# Punto 4: acciones después de los videos

La solicitud sustituye la escritura obligatoria después de cada video por una
acción concreta relacionada con su tema. Se implementó primero el día 1, se
verificó el guardado y luego se amplió el contenido siguiendo el calendario.

## Contenido y alcance

El catálogo `premium-v2/spm-video-library.js` contiene una sola definición de
cada acción: título, contexto, tres pasos y una aclaración breve. La práctica
diaria, las bibliotecas de los programas y el reproductor compartido reutilizan
ese contenido. La biblioteca general presenta el título de la acción y abre el
detalle con el video.

### Corrección de presentación · 13 de noviembre

La indicación posterior de la usuaria prioriza el audio. Cada acción muestra
«Ponlo en práctica», su título y una bocina circular. El contexto, los tres
pasos y la aclaración completa están en «Leer instrucciones», cerrado por
defecto. La bocina reproduce un MP3 propio de la acción con ese mismo contenido.
Las doce grabaciones se generaron a partir de `actionNarration`, con la voz
Rocío de HeyGen Voice, en español. El manifiesto
`video-action-audio-20261113.json` conserva el guion exacto, la procedencia,
la duración medida, los hashes y los tiempos por palabra. La prueba de
correspondencia impide publicar un guion distinto al de su grabación.

La primera prueba en el navegador remoto detectó que la síntesis nativa no
podía reproducirse. Por ello el recurso principal pasó a ser un MP3 servido
por la aplicación, independiente de las voces instaladas en el dispositivo.
La síntesis nativa se conserva como respaldo; si ambos recursos fallan, se
abre el texto con un aviso accesible.

Se retiraron las descripciones extensas de la tarjeta de selección y de la
pantalla diaria del video. Los formularios antiguos de escribir una idea ya no
existen en los archivos activos; las notas históricas se conservan como datos.
La narración se detiene al cambiar de actividad, cerrar el recurso o reproducir
el video. Las bibliotecas dentro de los laboratorios usan el mismo control.

| Día | Video | Acción |
| --- | --- | --- |
| 1 | Erección, estrés y ansiedad de rendimiento | Vuelve a una sensación cómoda |
| 2 | Salud vascular y función eréctil | Prepara tu próximo control de salud |
| 3 | Respiración diafragmática guiada | Ensaya la respiración del video |
| 7 | Dejar de anticipar el fracaso | Vuelve de la anticipación al presente |
| 9 | Salud metabólica y función sexual | Prepara un momento de descanso |
| 10 | Respiración para regulación de ansiedad | Haz una pausa para soltar tensión |
| 14 | Ansiedad de rendimiento: salir del modo examen | Empieza sin ponerte a prueba |
| 16 | Foco sensorial: volver a las sensaciones | Observa un contacto sencillo |
| 18 | Comunicación con la pareja sin presión | Ensaya cómo pedir un ritmo cómodo |
| 21 | Medicamentos y función sexual | Prepara una pregunta sobre tu tratamiento |
| 23 | Bajo deseo sexual: factores que pueden influir | Prepara un espacio sin exigencias |
| 28 | Preparación mental antes del encuentro íntimo | Prepara un encuentro con menos presión |

Las asignaciones por ruta, los días y los identificadores no cambian. Algunas
rutas no incluyen todos estos videos. Esta modificación no implementa todavía
los puntos 5 a 11 de la lista de correcciones.

## Guardado y compatibilidad

- La confirmación indica que se revisaron el video y la acción propuesta. No
  afirma que se realizó la recomendación ni exige una respuesta escrita.
- Al volver a guardar se conserva la metadata anterior, incluidas reflexiones.
- Una lectura pendiente o fallida permite ver el recurso, pero bloquea el
  guardado para evitar reemplazar información que aún no se recuperó.
- El atajo de registro abre el video y su acción. Usa las mismas validaciones
  de cuenta, plan, día e indicación de seguridad.
- Abrir, reproducir o terminar el video no guarda una actividad. Confirmar el
  video tampoco completa ni avanza el día.
- El reproductor compartido identifica el video por su URL, admite las rutas
  clínicas anteriores y limpia la acción al abrir otro recurso.

## Verificación automatizada

`node --test tests/video-actions.test.cjs`: 15 pruebas aprobadas. Incluyen los 12
videos, confirmación sin escritura, notas históricas, fallo y reintento, lectura
fallida, cambios de cuenta/plan/día/seguridad, correspondencia de acciones y
bibliotecas sin escrituras de progreso. La octava prueba cubre la carga tardía
del catálogo en la página de revisión: monta los 12 videos, no duplica la
biblioteca tras nuevos cambios del DOM y abre la acción correspondiente.

La revisión de audio añade controles de texto cerrado por defecto, narración
completa por video, alternancia escuchar/detener, documentos iframe sin
controladores duplicados, parada al navegar, eventos tardíos de voz y apertura
del texto con aviso accesible si el audio falla. Cubre también los archivos
MP3, la correspondencia entre guion y grabación, la alternancia de reproducción,
el final natural, errores de archivo, rechazos de reproducción y el respaldo.
La reproducción y la síntesis se simulan en las pruebas automatizadas.

Los doce archivos se descargaron y conservaron sin modificar. FFprobe confirmó
MP3 mono a 44,1 kHz, con duraciones de 27 a 40 segundos. La secuencia de
caracteres alineada por el proveedor coincide exactamente con los doce guiones.
Estos controles de integridad y reproducción no equivalen a una revisión
auditiva humana de todas las grabaciones.

Las suites existentes `daily-practice`, `program-videos` y `program-review`
suman otras 35 pruebas aprobadas con la corrección de audio. Los tres escenarios de navegador
que rellenaban una reflexión de video se actualizaron al nuevo comportamiento.

## Verificación de la primera versión publicada

En el revisor con perfil de ejemplo, el día 1 muestra la acción, tres pasos y
ningún campo de texto. Una confirmación sin marcar no guarda; marcarla y guardar
registra solo el video y mantiene el día 1. Se revisaron el espacio entre pasos,
la carga del video y la ausencia de desbordamiento horizontal.

Durante esta revisión se detectó que el catálogo cargado después de
DOMContentLoaded no montaba la biblioteca general. El arranque ahora funciona
tanto durante la carga inicial como después de ella.

## Criterio editorial

Las acciones se adaptaron de las descripciones de los videos y la propuesta
recuperada del trabajo anterior. No se presentan como transcripciones ni como
tratamientos autónomos. Las duraciones breves son indicaciones de uso, no dosis
terapéuticas validadas. Respiración y foco sensorial acompañan la práctica
indicada. Medicamentos conserva la instrucción de no modificar tratamientos.

Referencias primarias consultadas para revisar el lenguaje de atención,
comodidad y respiración sin forzar:

- [EAU: Counselling for erectile dysfunction](https://patients.uroweb.org/condition/erectile-dysfunction/all-treatments-ed/counselling-ed)
- [NHS: Breathing exercises for stress](https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/)
- [Guy's and St Thomas' NHS: MBSR exercises](https://www.guysandstthomas.nhs.uk/health-information/mindfulness-based-stress-reduction-mbsr/mbsr-exercises)
