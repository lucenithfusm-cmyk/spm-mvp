# SPM Digital Wellness · Deseo · Semana 2 (días 8–14)

**Estado:** diseño aprobado por la propietaria el 19 de noviembre de 2026, con ajuste solicitado de los audios iniciales e integración autorizada en la web.

## Contenido

- `index.html` + `styles.css` + `app.js` + `assets/d8.webp` ... `d14.webp`: las siete imágenes aprobadas se conservan completas como pantalla inicial, con zonas táctiles, halo, botones de audio, indicadores de selección, navegación y registro en navegador de prueba.
- Cada día incluye tres pantallas: imagen visual (o revisión para día 14), práctica clínica y registro/cierre. Las guías usan la voz estándar disponible en el dispositivo en español, sin crear ni duplicar archivos MP3.
- `desire-week2-bridge-v1.js` y `.css`: adaptador habilitado después del puente de la semana 1 en SPM Central y en la revisión de programas. Las entradas desde Hoy y calendario reconocen y muestran la pantalla táctil de la semana 2.
- `tests/desire-week2-touch.test.cjs`: pruebas con registros sintéticos para rutas, navegación, selección, datos y separación del día 14.

## Ajuste de audio aprobado

La guía de la primera pantalla conserva la indicación general de cada día. Las opciones de los días 8–12 reproducen únicamente un mensaje breve y específico; ya no concatenan la primera frase de esa guía. Se incluye el día 13 para resolver el ejemplo de «tres momentos» señalado durante la revisión.

Al explorar las 23 opciones, cada una aporta una indicación propia. Al cambiar de opción se interrumpe la voz anterior; al desmarcarla se detiene la voz sin repetir una confirmación. El botón de guía permite volver a escuchar la explicación completa cuando el usuario lo decide. Las imágenes y las guías de las pantallas 2 y 3 se conservan.

La versión de recursos `20261119-w2-audio2` actualiza el código de la revisión, la entrada diaria, el puente y el audio de la aplicación.

## Ruta clínica verificada

| Día | Contenido original en el programa | Interacción preparada |
|--|--|--|
| 8 | Reactivación I (`responsive-window`) | Preparar contexto, explorar una experiencia agradable, observar interés sin meta |
| 9 | Autoexploración por canal (`@channel`) | Selección personalizada por ranking de preferencias, práctica de un canal y deseo antes/después |
| 10 | Reactivación II: repertorio (`repertoire-try`) | Elegir y probar una idea diferente, utilidad 0–10 o N/A |
| 11 | Si hoy no aparece deseo (`no-desire-today`) | Elegir bienestar sin presión, presión antes/después opcional |
| 12 | Planifica tu ventana (`activation-plan`) | Momento, lugar, privacidad/ambiente, estímulo y seguimiento flexible |
| 13 | Confianza para volver a sentir (`evidence-confidence`) | Tres recuerdos reales de interés, confianza y detalle a recuperar |
| 14 | Revisión de la semana 2 (`week-review`) | Reflexión de la semana; **el cuestionario oficial del día 14 sigue intacto e independiente** |

La fuente clínica consultada es `labs/desire/src/lib/desire-curriculum.ts` y sus prácticas originales; los días 8–13 se implementan con el código de práctica original, no con títulos clínicos inferidos de los diseños. Algunas imágenes iniciales se usan como entrada visual a una práctica que continúa en las pantallas 2 y 3. Esto evita alterar el contenido clínico aprobado.

## Criterios de protección

1. Los días 1–7 aprobados, otros programas, cadencias transversales y pausas comerciales no se modifican.
2. La vista integrada utiliza los mecanismos existentes de `SPM_DESIRE_RECORDS` y `SPM_DAILY_PRACTICE` con el contexto de usuario y día verificado. La revisión general conserva sus cuentas sintéticas aisladas.
3. Nunca se marca el cuestionario del día 14 mediante una interacción de Deseo. La lámina «Semana 2 completada» es ilustrativa hasta que el checkpoint oficial haya sido confirmado.
4. Las imágenes originales fueron convertidas sin recortes a WebP para optimización. No se redibujaron.
5. La vista independiente registra selecciones solo en `localStorage` del navegador donde se abre, sin enviar información a cuentas reales ni APIs.

## Pruebas

```bash
node --check premium-v2/desire-week2-v1/app.js
node --check premium-v2/desire-week2-bridge-v1.js
node --test tests/desire-week2-touch.test.cjs
node tests/desire-week2-mobile-browser.cjs
node tests/desire-viewport-access-browser.cjs
node tests/desire-calendar-access-browser.cjs
```

Las pruebas de navegador usan Playwright, un servidor estático local, registros sintéticos y motores Chrome/WebKit. La comprobación de audio verifica el texto enviado a la voz del dispositivo, la cancelación y la ausencia de repeticiones; no equivale a una escucha en un iPhone físico.

La publicación conserva las redirecciones de pausa comercial de `vercel.json`. La revisión está disponible en `/premium-v2/revision-programas-28-dias.html?programa=desire&dia=8` y la vista independiente en `/premium-v2/desire-week2-v1/index.html`.
