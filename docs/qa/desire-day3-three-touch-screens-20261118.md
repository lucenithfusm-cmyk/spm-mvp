# SPM · Deseo Día 3: 3 pantallas táctiles y cronómetro real

Fecha de integración: 18 de noviembre de 2026.

## Recursos aprobados, sin recortes

- `premium-v2/assets/desire-day3/screen-01.jpg`: «Conexión y cercanía», cuatro opciones táctiles.
- `premium-v2/assets/desire-day3/screen-02.jpg`: «Ponlo en práctica», cuatro opciones táctiles.
- `premium-v2/assets/desire-day3/screen-03.jpg`: «Tu práctica de 5 minutos», tres etapas, reloj y anatomía ilustrada.
- `premium-v2/assets/desire-day3/breathing-animation-reference.gif`: recurso GIF de referencia estilística aprobado; el programa utiliza la imagen original nítida con animaciones CSS localizadas, para mantener los textos y controles sin pérdida de resolución.

Las fotografías de 864 × 1536 se publican con sus bytes originales. Se colocan capas transparentes *sobre las superficies táctiles de la imagen completa*, no tarjetas nuevas. Solo brillan barras o tarjetas grandes. Los círculos de radio y los botones circulares del reloj no reciben halos adicionales.

## Funcionalidad del día completo

1. Pantalla 1: elegir el tipo de cercanía, escuchar guía y microaudio de opción, Continuar.
2. Pantalla 2: elegir un acto de conexión individual o consensuado, escuchar práctica y microaudio, Guardar y continuar abre la práctica de respiración, no marca el día completado.
3. Pantalla 3: 5 minutos (cuenta atrás real, 300 segundos), controles circulares sobre la imagen de **reiniciar / iniciar-reanudar / pausar**, más botón de Iniciar práctica. `performance.now()` gobierna el tiempo activo; al pausar se congela; en segundo plano se detiene y se conserva el tiempo restante en `detailNotes.desireDay3TouchV1`. Se puede terminar antes sin fingir que transcurrieron cinco minutos. La barra de progreso del aro se actualiza con los segundos reales.
4. Las tres tarjetas del ejercicio reproducen por voz del dispositivo los pasos `Soltar presión`, `Respirar cómodo` y `Elegir conexión`. Durante la práctica se cambia de etapa aproximadamente cada 100 segundos de tiempo activo. El movimiento ilustrado del tórax/pelvis y del aro es sutil, decorativo, y respeta accesibilidad de movimiento reducido.
5. Registro de **presión antes/después 0–10**, opcional y accesible bajo la imagen, conserva N/A como `null` (no inventar puntuaciones). Al finalizar explícitamente, se guarda una sola sesión con `practiceId=breath-routine`, tiempo real `activeSec`, elecciones, presión opcional y `dayDone[3]`.
6. La práctica de respiración implica relajación y consciencia; **no se indica contracción de fuerza del piso pélvico** ni se añade una copia del Pelvic Floor Lab o de Piso Pélvico. No se fuerza una frecuencia respiratoria, apnea ni meta eréctil.

## Aislamiento y conservación

- El adaptador `desire-day3-bridge-v1.js` intercepta solo `primary=desire`, `day=3`, `origin=dailyPlan`, cuando SPM Central lo permite; delega todos los demás días a los puentes existentes.
- Las otras pantallas, audios, calendario, biblioteca y programas de SPM no se modifican.
- El recurso de prueba `/premium-v2/desire-day3-review/index.html` emplea almacenamiento simulado de sesión; no recibe credenciales ni accede a datos reales.
- Se preserva la pausa de acceso público/compras y se mantiene la validación clínica vigente.

## Verificación

`node --test tests/desire-day3-breath-touch.test.cjs`

Pruebas automáticas: cuenta regresiva y fase, pausa, reanudación, reinicio, salir sin completar, registro con tiempo completo, registro temprano con duración real, presión opcional, sesión legacy no duplicada, rutas restringidas, enlaces y halos en barras. Verificación final de escucha/visualización en el teléfono antes de considerarlo certificado clínicamente.
