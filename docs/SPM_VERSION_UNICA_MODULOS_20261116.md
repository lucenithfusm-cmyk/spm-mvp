# SPM Digital Wellness · Regla de versión única

Fecha: 16 de noviembre de 2026.

## Una experiencia vigente para cada módulo

- **Hoy** es el acceso clínico central del programa; los controles aprobados se abren desde la actividad principal asignada, respetando el mismo día, perfil y seguridad. No se crea una segunda actividad ni se marcan prácticas realizadas automáticamente.
- `premium-v2/spm-active-module-release-v1.js` es la fuente única de la versión vigente de los módulos actualizados. Inicialmente registra **Erección y firmeza, día 1** (seis láminas) y **día 2** (cuatro láminas), y describe las conexiones existentes de otros módulos sin cambiar sus calendarios.
- El formulario heredado de estos dos días deja de ser la opción de entrada por calendario/biblioteca. Los enlaces conducen a **Hoy** cuando corresponda, y la vista anterior queda oculta, pero su historial de código sigue disponible para reversión técnica.
- El visor general `revision-programas-28-dias.html` carga los mismos controladores, versiones y estilos que `live.html`; una prueba automática comprueba la paridad.
- Se invalidan las versiones anteriores de scripts por query-version y se revalidan recursos selectivos en Vercel.
- Focalización I/II, respiración, Deseo, piso pélvico (conciencia y fuerza), control eyaculatorio, nutrición y sueño conservan sus propios controladores y asignaciones.

## Regla de publicación de futuras mejoras

1. Crear y aprobar nuevos recursos visuales, audio y controlador dentro del módulo correspondiente.
2. Actualizar **una sola entrada vigente** del registro y sus conectores de **Hoy**, biblioteca y revisión.
3. Retirar u ocultar las entradas obsoletas sin borrar registros de pacientes, historial clínico ni recursos de otros módulos.
4. Probar navegación táctil, persistencia, accesibilidad, frecuencias, permisos, retorno a Hoy y ausencia de duplicaciones.
5. Mantener sincronizados `live.html` y `program-review-v1.js`; la prueba `tests/active-module-release.test.cjs` debe pasar antes de publicar.
6. Actualizar versiones de caché y desplegar. Mantener el acceso comercial y Wompi pausados hasta autorización explícita.

**Alcance de esta implementación:** se retiran de la experiencia de usuario las pantallas antiguas del **día 1 y 2 de Erección y firmeza**, y se establece el mecanismo y control automatizado para repetir la sustitución en módulos posteriores. No equivale a haber reescrito cada módulo existente.
