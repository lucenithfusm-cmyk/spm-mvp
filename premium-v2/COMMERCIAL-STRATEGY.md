# Estrategia comercial de SPM Premium

## Posicionamiento central

SPM no vende una promesa de perfección ni presenta una evaluación educativa como diagnóstico. Su propuesta es convertir señales dispersas de la experiencia sexual en una ruta clara, práctica y medible de 28 días.

La idea que debe comprender el usuario antes de ver el precio es:

> “SPM conectó elementos de mi experiencia que yo veía por separado, identificó un punto de partida útil y tiene una forma concreta de ayudarme a trabajarlo.”

## Secuencia de conversión

1. **Anticipación antes de la evaluación**
   - Explicar que se conectarán respuesta física, control, confianza, hábitos y conexión.
   - Aclarar desde el inicio que la evaluación es educativa y no diagnóstica.

2. **Progreso durante la evaluación**
   - Mostrar que SPM está construyendo una lectura integrada sin revelar puntuaciones prematuras.
   - Evitar interrupciones comerciales o presión de compra mientras el usuario responde.

3. **Reconocimiento posterior a la evaluación**
   - Nombrar la prioridad inicial del usuario.
   - Explicar, con lenguaje condicional, qué podría significar ese patrón.
   - Mostrar que existen factores relacionados y definir un primer objetivo concreto.

4. **Mecanismo de valor**
   - Performance Map™: ordena prioridades, factores y fortalezas.
   - Programa adaptativo de 28 días: transforma la lectura en práctica progresiva.
   - Daily Coach: sostiene registros, continuidad y ajustes.

5. **Oferta**
   - Presentar el programa personalizado SPM de 28 días por US$39.
   - La prueba piloto no forma parte de la oferta: es únicamente el entorno interno usado por la propietaria para validar avances.
   - Mientras se integra la pasarela, mantener un control interno de activación simulada claramente separado del mensaje comercial.

6. **Entrega**
   - Después de activar, llevar al usuario al Performance Map™ y al Día 1.
   - No crear una ruptura entre lo prometido en la oferta y lo que recibe en el programa.

## Reglas clínicas y éticas

- Usar “podría”, “sugiere”, “orientación” y “prioridad educativa”; no afirmar causas médicas.
- No prometer curación, resultados garantizados ni plazos clínicos.
- Mantener visible que SPM no diagnostica, no prescribe y no sustituye atención profesional.
- Una señal urgente bloquea la compra y prioriza valoración médica.
- Una señal de revisión profesional se muestra antes de la oferta y limita las actividades según seguridad.
- No usar vergüenza, miedo, urgencia artificial, temporizadores ni escasez ficticia.

## Jerarquía del mensaje posterior a la evaluación

1. Esto entendió SPM de tu caso.
2. Esta es tu prioridad inicial.
3. Esto podría estar ocurriendo y estos factores se relacionan.
4. Este será el primer objetivo del programa.
5. Así funcionan el mapa, el plan y el acompañamiento.
6. Este es el precio y así se activa.

## Pieza cinematográfica final

- Se presenta después de completar el cuestionario y antes del resultado preliminar.
- Utiliza animación abstracta para conectar señales, formar el Performance Map™ y construir la ruta de 28 días.
- La narración corresponde a la voz masculina del entrenador SPM: seria, varonil y contundente.
- El Dr. SPM no aparece ni narra esta pieza. Su avatar y su voz se reservan para intervenciones clínicas donde tenga presencia visual.
- El guion final no repite el proceso de análisis: convierte la comprensión acumulada en una decisión de inicio.
- La narración no incluye advertencias clínicas. Los avisos necesarios permanecen breves y discretos fuera del video, en la pantalla de resultado o activación.
- Los subtítulos permanecen disponibles durante toda la experiencia.
- La animación puede omitirse y respeta la preferencia de movimiento reducido.
- No presenta precio ni promesas terapéuticas; cierra con una invitación directa a activar la ruta personalizada y comenzar el Día 1.

### Montaje visual de valor

La escena central utiliza una ráfaga de microdemostraciones de 1–2 segundos, tomadas de herramientas reales del programa:

1. Construcción del Performance Map™.
2. Plato SPM como muestra de las tarjetas de nutrición.
3. Una tarjeta fotográfica de movimiento o ejercicio.
4. Velocímetro de excitación y movimiento de la aguja hacia la zona de atención.
5. Entrenamiento guiado de piso pélvico.
6. Seguimiento EHS 1–4.
7. Historias guiadas con paciente y Dr. SPM como muestra del contenido, sin cambiar la voz narradora del entrenador SPM.
8. Calendario y registro de progreso del programa de 28 días.

El montaje debe sentirse rápido y aspiracional, no como una demostración extensa. Ninguna microescena revela una lección completa: muestra variedad, interactividad y profundidad para aumentar el deseo de acceder al programa.

## Medición del embudo

| Evento | Qué permite evaluar |
|---|---|
| `offer_view` | Usuarios que llegan a la lectura comercial |
| `cta_create_program` | Resonancia del resultado y deseo de continuar |
| `checkout_view` | Usuarios que ven precio y condiciones |
| `checkout_back` | Fricción o dudas después de ver la oferta |
| `program_activation_test` | Finalización de la activación interna simulada; no equivale a una venta |

Cada evento conserva idioma, prioridad inicial y estado de seguridad para poder analizar el embudo sin registrar respuestas clínicas individuales.

## Criterios para aprobar la prueba interna

- El mensaje funciona en español e inglés.
- La prioridad mostrada coincide con el resultado de la evaluación.
- Las alertas urgentes bloquean correctamente la activación.
- El precio aparece únicamente después de explicar relevancia y mecanismo.
- Mobile no oculta contenido ni impide volver al resultado.
- La activación lleva al Performance Map™ y permite comenzar el Día 1.
- Los eventos se registran una sola vez por acción y sin respuestas clínicas.
