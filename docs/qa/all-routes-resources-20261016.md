# SPM — recursos diarios en todas las rutas

## Alcance y punto de partida

Solicitud: extender a Bajo Deseo y a todas las rutas la distribución de recursos y videos durante 28 días; mantener Biblioteca completa y la progresión aprobada. La historia verificada es: Hoy → actividad asignada → programa o video correcto → registro por usuario, plan y día → regreso a Hoy; Biblioteca → consulta libre → mismo día y progreso.

La vista previa del commit `ad2b107abc03cc1ca9cf0ffcfd7a81af49e88fac` tenía los 12 videos en Biblioteca, todos con respuesta HTTP 200 y tipo video/mp4. Sus 12 botones abrían el recurso correcto. Sin embargo, solo Erección y firmeza asignaba videos explícitos en Hoy; EP, Deseo, confianza, bienestar y hábitos no tenían ninguna tarjeta diaria de video. La historia del día 25 tampoco se abría como actividad en varias rutas generales.

## Distribución

Se conservan las 28 actividades principales y todos los apoyos anteriores. Erección y firmeza conserva exactamente su agenda. En las otras rutas se añaden ocho videos cortos, alternados con los días de respiración y focalización:

| Día | Control eyaculatorio | Bajo Deseo | Ansiedad / confianza | Bienestar / hábitos |
| --- | --- | --- | --- | --- |
| 1 | Ansiedad de rendimiento | Bajo deseo: factores que influyen | Ansiedad de rendimiento | Salud metabólica |
| 2 | Regulación de ansiedad | Salud metabólica | Regulación de ansiedad | Salud vascular |
| 7 | Dejar de anticipar el fracaso | Dejar de anticipar el fracaso | Dejar de anticipar el fracaso | Regulación de ansiedad |
| 9 | Foco sensorial | Foco sensorial | Foco sensorial | Foco sensorial |
| 14 | Preparación mental | Ansiedad de rendimiento | Preparación mental | Ansiedad de rendimiento |
| 18 | Comunicación sin presión | Comunicación sin presión | Comunicación sin presión | Comunicación sin presión |
| 21 | Medicamentos y función sexual | Medicamentos y función sexual | Repasar ansiedad de rendimiento | Medicamentos y función sexual |
| 28 | Preparación mental para continuidad | Preparación mental para continuidad | Preparación mental para continuidad | Preparación mental para continuidad |

- Respiración mantiene los días 3, 6, 10, 13, 17, 20, 24 y 27, con su demostración, cronómetro y video existentes.
- Focalización mantiene los días 4, 8, 12, 16, 19, 23 y 26, con adaptación por comodidad, consentimiento y práctica previa.
- Piso pélvico conserva sus días y condiciones. EP mantiene su alternativa de control del día 24.
- Recuperación dispone de una historia asignada en los días 11 y 25. El resto de las historias queda disponible en Biblioteca.
- Si Deseo es una prioridad secundaria, sus sesiones existentes de los días 5, 15 y 22 se añaden como apoyo, sin reemplazar EP ni la práctica principal. Bajo Deseo conserva su currículo propio; no recibe una segunda copia de esas sesiones.
- Nutrición, movimiento y sueño siguen rotando todos los días (10, 9 y 9 recomendaciones respectivamente), con las condiciones ya existentes.

Las jornadas presentan entre dos y cuatro tarjetas; no se intenta realizar todos los programas cada día. Los videos de la tabla aparecen como «Video de hoy». Ver un video por sí solo no registra una actividad ni adelanta el día: se conserva la confirmación explícita y el registro separado. Los checkpoints principales de los días 14 y 28 permanecen en su lugar.

## Biblioteca

La navegación Hoy / Biblioteca completa permanece visible en todas las rutas. Biblioteca conserva los 12 videos del catálogo y los programas completos: Deseo, respiración, focalización, piso pélvico, recuperación, confianza y bienestar. También se amplía la colección contextual de videos dentro de los programas completos de EP, Deseo, Erección y confianza.

Las pantallas abiertas como práctica diaria no montan la colección completa de videos. Al pasar de un programa completo a una sesión diaria se descargan esos reproductores; al volver a Biblioteca se restaura la colección. Así no se añaden todos los videos a una sola jornada.

## Evidencia de verificación

- Comparación exacta con la vista previa anterior: 168 combinaciones ruta/día. Al excluir las nuevas tarjetas, todas las asignaciones anteriores coinciden; las 28 de Erección coinciden completas.
- 1.293 comprobaciones de integración de recursos con esa comparación: agenda y Hoy coinciden, bienestar diario, Biblioteca, apertura de los 12 videos, apoyo de Deseo dentro de EP sin cambiar de ruta, recuperación D25, fallo de guardado, reintento y restauración.
- 26 pruebas del currículo y adaptación de Deseo: 28 días únicos, cuatro fases, prácticas resolubles, checkpoints, progresión sensorial, preferencias y persistencia.
- 61 comprobaciones de práctica diaria; 706 de calendario y condiciones de seguridad; 224 de Erección. Pruebas de colecciones de video en móvil, tableta y escritorio.
- Los controles de seguridad siguen vigentes: los recursos educativos permitidos no eliminan señales ni desbloquean prácticas físicas pendientes de revisión.
- El navegador local no incorpora H.264. El gate de Chrome en GitHub Actions exige reproducción real de los 12 videos de Biblioteca y de los recursos integrados en los laboratorios.
- Datos de pruebas sintéticos con el cliente de datos interceptado; no se consultan ni modifican cuentas reales. Consultar Biblioteca y reproducir videos no completa ni avanza días.

Cambios limitados a la rama del PR 26 y a una vista previa, para revisión antes de publicar en producción.
