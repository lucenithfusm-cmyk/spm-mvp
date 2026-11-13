# Práctica inicial de DE y Pelvic Floor Lab diario

## Alcance solicitado

La indicación de producto de la doctora separa dos recursos:

- **Pelvic Floor Lab:** conciencia, relajación y coordinación con la respiración; disponible a diario en DE, EP y deseo/DSH.
- **Módulo de contracción y fuerza:** dos sesiones por cada semana del recorrido, en los perfiles para los que corresponde y con los controles previos de preparación. Esta frecuencia es la pauta del programa solicitada por la doctora, no una recomendación clínica universal.

El día 1 de DE incorpora «Mi primera práctica: respira y suelta». Abre los pasos 6 y 10 del laboratorio de respiración existente: liberación de mandíbula, hombros y abdomen, seguida de una guía sin retención de aire. La duración orientativa no impone un mínimo. El registro de firmeza aprobado permanece separado.

## Comportamiento

El Lab ofrece una entrada directa con cuatro momentos: acomodarse, observar la zona, seguir la guía y registrar la respuesta. La guía manual «Percibe → Respira → Suelta» utiliza la anatomía aprobada, animación localizada, señales cortas de audio y tiempo transcurrido orientativo. La pausa detiene voz y reloj y devuelve la imagen al reposo; no registra una práctica.

Las explicaciones completas quedan desplegables. Se conservaron los 16 IDs e índices de pantalla, las imágenes originales y los datos históricos. Los nuevos recorridos no ejecutan series de contracción, rápidas, sostenidas ni fuerza. Los resultados nuevos usan `practiceId: percibe` y `cleanContraction: null`; no escriben el screening de técnica ni recomiendan progresión a fuerza. Los datos antiguos mantienen su significado.

El Lab diario y el entrenamiento de fuerza aparecen como actividades distintas, también cuando coinciden en el día. La fuerza tiene ocho posiciones potenciales en el recorrido: 2, 6, 9, 13, 16, 20, 23 y 27. La compatibilidad original de preparación se conserva, con prioridad de síntomas, tensión y señales de seguridad. DSH recibe el Lab diario sin una nueva indicación universal de fuerza.

## Registros

Abrir una actividad, escuchar o navegar no cuenta como práctica. El registro de Hoy requiere un resultado fresco de la apertura actual, usuario/plan/día/actividad coherentes, guardado del recurso y confirmación explícita al volver. Los resultados antiguos no completan un día nuevo. Un resultado del Lab no cuenta como fuerza. La interrupción se puede registrar sin marcar la actividad realizada.

El módulo clásico exige la secuencia real y confirmación positiva del guardado antes de entregar su resultado. Navegar a la última pantalla no registra fuerza; un error permite reintentar sin rehacer la serie. El registro manual de días arbitrarios del calendario clásico se sustituyó por la lectura de sesiones guardadas y el retorno a Hoy. Ninguno de estos recursos avanza automáticamente el día central.

## Audio

Se generaron 19 narraciones originales con Lenny (`050c403a43e047c796f8a6257ed2533e`): 16 del Lab y 3 de entrada. Velocidad de generación 0,95; reproducción 1. Los diez cues anteriores permanecen idénticos. Los archivos nuevos tienen nombres versionados.

Procedencia, textos, duraciones, hashes y verificación:

- `labs/pelvic-floor/audio-provenance.json`
- `docs/qa/pelvic-action-audio-20261113.json`

Las 19 pistas pasaron decodificación completa y transcripción independiente. Las variantes del reconocedor se documentan en los manifiestos; no se afirma audición humana.

## Validación técnica

- `npm ci`, `npm run typecheck` y `npm run build` en `labs/pelvic-floor` completados.
- Pruebas de bridge y práctica diaria: 54 casos aprobados, incluidos el flujo real bridge → resultado → fallo/reintento → cierre → confirmación y la separación de registros históricos de Lab y fuerza.
- Interfaz React real con JSDOM: 7 casos aprobados; el cierre fallido conserva la pantalla y pausa audio, reloj y visual.
- Revisor de programas: 12 casos aprobados, con 28 días de cada uno de los seis programas y las nuevas entradas de DE.
- Plan de apoyos y finalización clásica: 6 casos aprobados.
- Integridad del manifiesto, reproductor único, cues e imágenes: 5 casos aprobados.

Los controles de pausa pública y pagos no se modificaron. La publicación se verifica comparando los archivos servidos con sus bytes locales y consultando el estado de pausa del endpoint de configuración de pagos.

## Continuación visual de esta revisión

La preparación permite elegir entre dos posturas ilustradas: sentado con respaldo y pies apoyados, o recostado con cabeza, espalda y pies apoyados y rodillas cómodamente flexionadas. La selección cambia la instrucción breve; se conserva solo mientras está abierta la práctica. En móvil, el botón de inicio aparece antes de la anatomía.

Durante la práctica, un desplegable opcional permite comparar «Inhala suave» y «Exhala sin apretar». El esquema muestra costillas, diafragma y piso pélvico: entrada de aire con expansión suave y descenso; salida de aire con retorno hacia el reposo. No prescribe una cadencia, no solicita contracciones y no mide el cuerpo. La pausa devuelve el esquema al reposo y desactiva sus controles; se respeta la preferencia de movimiento reducido.

La mejora conserva las 19 grabaciones preparadas, el reproductor único, los registros y las restricciones clínicas. Validación de esta continuación: typecheck y build aprobados; 7 casos de flujo React aprobados; 92 pruebas de la integración recuperada aprobadas (incluidos audio y pausa comercial). La revisión visual del despliegue final se documenta después de verificar sus archivos.

## Fuentes clínicas consultadas

Se contrastó la redacción de percepción/relajación, respiración cómoda, ausencia de empuje, descanso entre contracciones y señales de consulta con fuentes oficiales. No se promete una mejoría sexual, un plazo de respuesta ni un diagnóstico a partir de la práctica.

- [NIDDK — Kegel exercises](https://www.niddk.nih.gov/health-information/urologic-diseases/kegel-exercises)
- [University Hospitals Plymouth NHS Trust — Pelvic floor relaxation](https://www.plymouthhospitals.nhs.uk/display-pil/pil-pelvic-floor-relaxation-5338)
- [Gloucestershire Hospitals NHS — Pelvic floor exercises for men](https://www.gloshospitals.nhs.uk/your-visit/patient-information-leaflets/pelvic-floor-exercises-men/)
- [EAU — Chronic pelvic pain management](https://uroweb.org/guidelines/chronic-pelvic-pain/chapter/management)
- [NIDDK — Symptoms and causes of urinary retention](https://www.niddk.nih.gov/health-information/urologic-diseases/urinary-retention/symptoms-causes)
- [NHS — Testicle pain](https://www.nhs.uk/symptoms/testicle-pain/)
