# Punto 8: instrucciones claras y práctica al ritmo del usuario

## Alcance y criterio aprobado

Revisión de Deseo, días 1–28, y los apoyos compartidos que aparecen en ese recorrido. El usuario aclaró que el beneficio y la experiencia de la actividad importan más que su duración: no debe existir un tiempo mínimo para completarla.

## Cambios

- Reescritas las 28 fichas y las instrucciones de 34 prácticas de Deseo: preparación concreta, acciones ordenadas, recursos por su nombre y reflexión sobre lo que resultó útil.
- Narración de instrucciones y texto de Deseo comparten los mismos pasos. Se conserva audio primero y texto desplegable.
- El mapa de influencia y otros recursos se pueden abrir durante una práctica, con regreso al mismo intento. La navegación guarda una pausa y conserva el tiempo activo.
- Deseo requiere confirmación explícita para completar. El tiempo transcurrido se consulta opcionalmente; no existe cuenta regresiva obligatoria ni finalización automática por tiempo.
- Respiración permite cerrar y registrar durante la guía. Focalización permite confirmar la experiencia sin esperar los relojes. Se conservan consentimiento, progresión y restricciones por el estado del programa.
- Nutrición mantiene la preparación para mañana y el recetario del día 1. El cierre confirma que se revisó la preparación.
- Sueño y Movimiento ofrecen pasos concretos, con duración flexible. Movimiento admite tiempo no medido (`null`) y tiempos fraccionarios.
- Recuperación explica lectura/escucha, ensayo de respuesta y guardado. Se retiraron avisos médicos generales repetidos de las actividades revisadas.
- Las fotografías de Movimiento se presentan con el recorte existente; las instrucciones actuales se leen en HTML, sin los tiempos impresos de las fichas anteriores.
- Se conservan escalas y registros existentes. Las otras escalas quedan para la revisión de sus respectivos módulos.

## Validación

- TypeScript: Deseo, Respiración y Focalización correctos.
- Deseo: 65 pruebas, incluida entrada de los 28 días, confirmación sin duración mínima, ausencia de autocompletado por tiempo y regreso desde el mapa.
- Respiración: 22 pruebas, incluida finalización durante la guía y pausa al ocultarse la página.
- Focalización: 7 pruebas, incluidos Focus I/II sin activar el reloj y consentimiento requerido.
- Integración del programa diario, apoyos, puente de Deseo y revisión: 46 pruebas.
- Movimiento y restricciones: 21 pruebas, incluidos tiempo fraccionario, no medido y cero explícito.
- Recuperación: comprobación DOM de siete historias en español e inglés, apertura del ejercicio y guardado del escenario/día correspondientes.
- Sintaxis de los scripts modificados y revisión del diff sin errores.

Los tres laboratorios se reconstruyen desde sus fuentes. Se retiran los archivos JavaScript anteriores y se actualizan las referencias de carga en el programa y la página de revisión.
