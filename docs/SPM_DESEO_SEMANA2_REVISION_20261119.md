# SPM Digital Wellness · Deseo · Semana 2 (días 8–14)

**Estado:** prototipo funcional para revisión visual y clínica; NO fusionado con la web principal.

## Contenido

- `index.html` + `styles.css` + `app.js` + `assets/d8.webp` ... `d14.webp`: las siete imágenes aprobadas se conservan completas como pantalla inicial, con zonas táctiles, halo, botones de audio, indicadores de selección, navegación y registro en navegador de prueba.
- Cada día incluye tres pantallas: imagen visual (o revisión para día 14), práctica clínica y registro/cierre. Las guías usan la voz estándar disponible en el dispositivo en español, sin crear ni duplicar archivos MP3.
- `desire-week2-bridge-v1.js` y `.css`: **adaptador de integración preparado, no habilitado en SPM Central**; requiere revisión y publicación posterior.
- `tests/week2.test.cjs`: pruebas con registros sintéticos para rutas, navegación, selección, datos y separación del día 14.

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
2. Los registros reales se guardarán únicamente tras habilitar el adaptador, usando los mecanismos existentes de `SPM_DESIRE_RECORDS` y `SPM_DAILY_PRACTICE` con el contexto de usuario y día verificado.
3. Nunca se marca el cuestionario del día 14 mediante una interacción de Deseo. La lámina «Semana 2 completada» es ilustrativa hasta que el checkpoint oficial haya sido confirmado.
4. Las imágenes originales fueron convertidas sin recortes a WebP para optimización. No se redibujaron.
5. La vista independiente registra selecciones solo en `localStorage` del navegador donde se abre, sin enviar información a cuentas reales ni APIs.

## Pruebas

```bash
node --check app.js
node --check desire-week2-bridge-v1.js
node --test tests/week2.test.cjs
```

**Nota:** revisar cuidadosamente en un iPhone/Safari antes de autorizar sustitución en la rama principal. Las pantallas previas aprobadas deben mantenerse como fallback de seguridad hasta que la ruta diaria haya sido probada.
