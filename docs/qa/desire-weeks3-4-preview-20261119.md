# Deseo · Semanas 3 y 4 · Vista web comprobada

Fecha: 19 de noviembre de 2026.

## Estado

La vista de revisión está desplegada y lista para la revisión de Lucenith. La autorización explícita recibida en este chat resolvió el bloqueo de subida. No se ha hecho push a GitHub, merge a main ni promoción a producción.

- Proyecto: `spm-premium-staging`.
- Equipo: `lucenithfusm-cmyk`.
- Deployment final: `dpl_8mAyyeKnXtD47wGQUcv9xzPLYfZ1`.
- Estado verificado: `READY`; target de preview (`null` en la API), sin alias de producción.
- Commit de código desplegado: `8e57acc9db016ecbb0d7db4e9519494a13004bc2`.
- URL sin token: https://spm-premium-staging-92oax4i9k-lucenithfusm-cmyk.vercel.app/premium-v2/desire-weeks3-4-review/index.html
- Enlace temporal creado mediante Vercel; se entrega por chat. No se guarda el token en el repositorio.
- 89 archivos de la vista cargados por SHA1, aproximadamente 9,6 MB.

La vista conserva las rutas de pausa comercial. Los recursos anteriores que no cambiaron se resuelven mediante GET/HEAD hacia el deployment inmutable de la base `752c3bad`, después de `handle: filesystem`. Esa configuración de vista previa está en el paquete temporal de despliegue; no modifica el `vercel.json` del repositorio.

## Comprobación real en navegador

La primera vista de prueba fue `dpl_B3VaoLVBGsYPr5n9fgnxNyW3UwLZ`. Se verificaron los catorce accesos de los días 15–28 y la carga de sus imágenes. El único cambio posterior fue el encuadre CSS de las dos portadas del menú: 34% en escritorio y 36% en móvil. El resto de los archivos conserva exactamente sus SHA1.

Sobre el deployment final se comprobó el menú corregido, el acceso mediante el enlace temporal y la integración con SPM Central:

- El enlace temporal abre sin pedir inicio de sesión; los enlaces internos y recursos mantienen el acceso.
- La semana 3 abre su menú y sus pantallas sin quedar detenida en el mensaje inicial.
- Día 15: selección «Cercanía», recarga y recuperación de la selección. En Central, guardar, volver a Hoy y reabrir conserva el borrador y no marca la práctica como completada.
- Día 27: selección de estímulo, escritura de una condición de prueba, apertura y cierre del panel «Condiciones y rutina previa». El cronómetro inició, se pausó en 00:31 y conservó 00:31 después de recargar; la elección y el texto también se conservaron.
- Día 22 en Central: sin historial suficiente aparece la práctica asignada «Focalización sensorial con contacto lento». Se abre su ficha real con modalidad, escala propia y pasos.
- Día 28 autónomo: «Ver mi informe en SPM» explica correctamente que la revisión independiente no tiene una cuenta conectada.
- Día 28 dentro de Central: el mismo control guarda el borrador, vuelve a Hoy y abre «Tu informe final · SPM 28 días». Los valores ausentes aparecen como «Sin dato / no evaluable» y no se crea ni completa una evaluación.
- No se observaron errores de aplicación en los registros del navegador de esta comprobación. Se excluyeron mensajes propios de la extensión del navegador.

Se utilizaron únicamente datos de prueba dentro del perfil de revisión; no se modificaron cuentas reales de pacientes.

## Evidencia y límites

La verificación de código previa terminó con **125 pruebas aprobadas, 0 fallidas y 0 omitidas**. Sus resultados se conservan en el paquete de implementación entregado y en el informe de preparación.

Se inspeccionaron visualmente el menú, la pantalla inicial y selección del día 15, y la selección de estímulo/condición del día 27. La comprobación geométrica previa cubre los controles de las 31 pantallas de semana 4 a 320, 390 y 490 px.

La bocina se accionó sin error de aplicación. No se ha certificado auditivamente la voz del dispositivo, ni se ha realizado una sesión en un iPhone/Safari físico. La usuaria revisará el encuadre y la voz en su dispositivo antes de la publicación definitiva.

## Siguiente paso

Recibir las observaciones o la aprobación del recorrido. Corregir los puntos que indique Lucenith y publicar en el repositorio y en SPM únicamente tras su aprobación.
