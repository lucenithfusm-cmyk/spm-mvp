# SPM Digital Wellness · Deseo Día 2 · dos pantallas aprobadas

Fecha: 18 de noviembre de 2026

## Alcance y fidelidad

- Pantalla 1: «Identifica lo que despierta tu deseo», seis opciones con selección única, botón «Escuchar guía» y botón «Continuar».
- Pantalla 2: «Ponlo en práctica», cuatro opciones con selección única, botón «Escuchar práctica» y «Guardar y continuar».
- Las imágenes adjuntadas por dirección clínica son **exactamente las superficies completas originales de 864 × 1536 (9:16)**. No se reescribió ningún texto de imagen, no se recortaron ni se convirtieron en tarjetas.
- Las áreas pulsables transparentes están posicionadas en porcentaje sobre la imagen y llevan halos dorados animados **antes de tocar**, incluso en las opciones que no han sido seleccionadas. Las preferencias de movimiento reducido reciben halo fijo sin animación.
- Se usan guías habladas distribuidas (introducción y microguías por opción), **con voz estándar del dispositivo en español colombiano** y sin introducir audios externos. La narración adapta el contenido aprobado del Día 2 de `labs/desire/src/lib/desire-curriculum.ts`, «Tu patrón y tus contextos», y las prácticas de `pattern-observe`.
- Lenguaje adulto, relacionado con sexualidad, caricias, conexión, cercanía, fantasías, privacidad, sin materiales infantiles ni repetición de ejemplos innecesarios. La participación con pareja presupone voluntad y consentimiento mutuo.

## Guardado central

- El puente `premium-v2/desire-day2-bridge-v1.js` intercepta exclusivamente `primary=desire`, Día 2, `origin=dailyPlan`, y hace cumplir el mismo control de permisos, seguridad y aislamiento por cuenta y día.
- El formulario táctil escribe `spm-desire-program.detailNotes.desireDay2TouchV1` y una sesión original `practiceId=pattern-observe`, sin crear nuevas prácticas de calendario ni borrar el progreso del usuario.
- Las dos respuestas elegidas quedan en `detailNotes`; se guarda un resumen en `reflection`.
- La lámina no dispone de escalas 0–10, así que se mantienen `before` y `after` como `null` (sin inventar valores del mapa de influencia). El recurso de mapa original permanece disponible en la biblioteca.
- Se conserva la sesión ya completada si existe y se evita duplicar una misma sesión en reintentos. La finalización requiere pulsar «Guardar y continuar».
- «Anterior»/«Siguiente»/«Finalizar» son botones adicionales bajo la imagen, con retorno a «Actividades de hoy».

## Pruebas

- Ejecutar: `node --test tests/desire-day2-touch.test.cjs`.
- Se cubren imágenes originales, guía, halo previo, elección de seis factores y cuatro acciones, validación, persistencia, reingreso, no duplicación, salida sin completar y restricciones clínicas.
- La versión de prueba en `/premium-v2/desire-day2-review/index.html` usa un almacenamiento simulado aislado en `sessionStorage`, no modifica cuentas ni cobra. Para aprobación final, revisar aspecto, cobertura de áreas pulsables y claridad de voz directamente en teléfono.

## Límites

No modificar Día 1, Focalización, Piso Pélvico, Control Eyaculatorio ni otros módulos; no reactivar compras ni alterar el cuestionario comercial.
