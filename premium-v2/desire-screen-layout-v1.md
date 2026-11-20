# Deseo · vista completa de las semanas 3 y 4

## Comportamiento

Al abrir una práctica de los días 15–28 desde Central, el visor ocupa todo el espacio disponible del navegador. La agenda deja de verse alrededor de la práctica y recupera su desplazamiento al cerrar el visor. Las barras del navegador y del sistema operativo siguen bajo el control del dispositivo.

En el visor, el diseño aprobado llega a ambos bordes del móvil. No se repiten la marca, el día ni la barra de estado encima de la lámina. La información de esa cabecera sigue disponible para las tecnologías de asistencia.

La fotografía se adapta al espacio vertical disponible y conserva su encuadre completo. Los textos, las escalas y los botones mantienen sus proporciones y posiciones relativas. En una pantalla especialmente baja, el contenido puede desplazarse verticalmente para no ocultar controles ni reducir la fotografía por debajo de 100 píxeles.

El botón de opciones abre la navegación auxiliar, las guías y los controles adicionales existentes. El consentimiento requerido de la práctica en pareja abre ese panel automáticamente. La nota de repetición de la fase I permanece visible sobre la práctica; las respuestas, los temporizadores, el audio y el guardado siguen perteneciendo a la aplicación de cada semana.

## Archivos

- `desire-week3-bridge-v1.css` y `desire-week4-bridge-v1.css`: superficie completa del visor en Central.
- `desire-screen-layout-v1.js` y `.css`: composición adaptable, posición de controles y panel de opciones.
- `desire-photo-layout-v1.js`: geometría de las bandas fotográficas de las 64 pantallas y variantes.
- `desire-photo-v1/`: catorce fotografías completas y procedencia de los dos encuadres ampliados.
- `desire-week3-v1/index.html` y `desire-week4-v1/index.html`: carga compartida de presentación antes de las aplicaciones existentes.

## Geometría

Las láminas aprobadas tienen un lienzo lógico de 864 × 1536. Su banda superior y su banda inferior conservan la escala determinada por el ancho del dispositivo. La banda fotográfica central absorbe la diferencia de altura. El mapa transforma las coordenadas verticales de los controles con las mismas tres bandas; sus coordenadas horizontales se conservan.

Las fotografías usan `object-fit: contain`. Una copia desenfocada de la misma fotografía completa el fondo cuando la proporción del espacio difiere de la imagen original. No se estira la lámina completa ni se recortan caras y manos para llenar el marco.

Al cambiar una lámina en el futuro, hay que actualizar su banda en el mapa junto con las coordenadas de sus controles. La variante `d18_03a` conserva la escena individual de escritura del día 21.

## Verificación

```sh
node --test tests/desire-week3-*.test.cjs tests/desire-week4-*.test.cjs tests/desire-weeks3-4-*.test.cjs
node tests/desire-week3-mobile-browser.cjs
node tests/desire-week3-central-browser.cjs
node tests/desire-weeks3-4-viewport-browser.cjs
```

El workflow `desire-week3-touch-qa.yml` ejecuta las pruebas de navegador en Chrome y WebKit, con registros sintéticos aislados. Comprueba las 64 pantallas a 390 × 844, 320 × 568 y 390 × 650, y conserva capturas de los encuadres, las opciones y la entrada desde Central para revisión visual.
