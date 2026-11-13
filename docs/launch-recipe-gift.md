# Recetario SPM: entrega vigente en la biblioteca

El recetario se ofrece como obsequio descargable al comienzo de la Biblioteca de Nutrición. El acceso al archivo no depende de un cupo de primeros compradores ni de un formulario de correo.

## Archivo integrado

- PDF para descarga web: [Recetario SPM](https://0dzp02ilnexs1jlo.public.blob.vercel-storage.com/nutrition/20261113/Recetario_SPM.pdf).
- Nombre propuesto al descargar: `Recetario_SPM.pdf`.
- 15 páginas y 12 preparaciones, con guía de compras.
- 4.644.838 bytes. SHA-256: `b8cd08964a835a4dba0451e684fb0209f1ff92c4d716aa72222a8088112be143`.
- La copia web conserva las 15 páginas, sus medidas, instrucciones de dibujo e imágenes de 1055 × 1491 píxeles. Se recomprimieron las imágenes para reducir el peso; el archivo original recuperado se conserva sin modificaciones. Se revisó visualmente la legibilidad de portada, recetas y guía de compras.
- La portada de la tarjeta se renderiza desde la primera página del mismo PDF: `premium-v2/assets/nutrition/recetario-spm-portada.jpg`.

El PDF se aloja en el almacén público `spm-premium-recetario` de este proyecto en Vercel, con una ruta de versión estable. Su URL, peso y hash quedan documentados en `premium-v2/assets/nutrition/recetario-spm.json`. La página no incluye credenciales del almacén.

## Acceso dentro del programa

`premium-v2/spm-resources.js` muestra la tarjeta del obsequio como primer bloque de Nutrición, antes de la guía y de las seis categorías de alimentos. La tarjeta tiene dos enlaces al mismo archivo: **Descargar RECETARIO SPM** y **Abrir PDF (nueva pestaña)**. El segundo permite consultar el documento sin cerrar la biblioteca. El enlace de descarga usa `?download=1` para solicitar el PDF como archivo adjunto, también desde dispositivos móviles.

La biblioteca utiliza este mismo componente para todos los programas y días. La descarga no escribe registros de salud, no marca una actividad como completada y no necesita un servicio de correo.

## Propuesta anterior retirada

La propuesta de enviar el PDF por correo a los primeros 50 compradores fue reemplazada por esta entrega directa. Sus instrucciones de activación ya no forman parte de la entrega vigente. El código histórico de la cola de correo no se invoca desde esta biblioteca.

## Verificación

`tests/nutrition-recipe-download.test.cjs` comprueba los enlaces, los metadatos de la entrega, la posición de la tarjeta, su acceso sin correo y la navegación de las categorías. La publicación debe comprobar además la respuesta del PDF y su identidad con el archivo local.
