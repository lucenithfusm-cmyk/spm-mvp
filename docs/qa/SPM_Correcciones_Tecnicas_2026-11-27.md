# SPM — Correcciones técnicas del 27 de noviembre de 2026

## Estado de la entrega

Implementación preparada en la rama local `fix/spm-technical-20261127` sobre el commit `c27bbbba0292513b898d0684a30a95cd1e4e6449`. El alcance es una versión de revisión: nueva agenda, persistencia y cierre, voz, continuidad y edición de los textos disponibles. La migración de base de datos se entrega para revisión; no se ha aplicado al proyecto de producción. La pausa comercial se mantiene.

**Autorización explícita de publicación recibida:** la usuaria autorizó publicar el código corregido, los calendarios, los inventarios completos y los informes de QA en la rama pública `fix/spm-technical-20261127`, junto con un PR borrador y un preview de Vercel. Los bloqueos anteriores quedan documentados como antecedentes; la subida de los objetos ya se aceptó y se verificó por sus SHA. El resultado alojado y sus comprobaciones se comunican en el PR y en la entrega de publicación. La autorización no incluye fusionar en `main`, migrar producción ni reabrir cobros.

**No es una certificación de reapertura comercial.** Se distinguen las pruebas automáticas locales, la revisión visual del entorno publicado y las verificaciones que necesitan un backend aislado o dispositivos físicos. Los pendientes concretos están al final de este informe.

Fuente de trabajo: `SPM_Plan_de_Ajustes_2026-11-27.zip`, SHA-256 `543f94eb443fcb41b13d64b2ac708737ae9e00e3d6de1ee8971efbb2d65972f3`. Se aplicó la precedencia de la instrucción maestra y sus anexos actuales. La prioridad histórica de Lenny fue sustituida por la voz estándar del dispositivo. La base del repositorio coincidía con la indicada por el paquete.

## 1. Agenda y experiencia de Hoy

`agenda-manifest-20261127.js` define las seis rutas y las 168 jornadas de la nueva versión `spm-20261127-v1`. `agenda-v2.js` y el compositor real de Hoy construyen la experiencia desde esa definición. Se separan prioridad visual y requisito: una principal puede ser voluntaria, todos los apoyos son opcionales y los recursos explorables quedan fuera del contador de requisitos.

La variante Erección con Deseo secundario sigue la agenda de 28 días del paquete. Control con Deseo y Confianza con Deseo tienen distribuciones explícitas y un máximo de un apoyo destacado. El informe de agenda incluye las tres matrices mixtas completas y los escenarios de seguridad/elegibilidad. Las historias de recuperación se ofrecen por pertinencia; no se obliga a inventar una experiencia para completar la jornada.

Los registros conservan identidad de asignación y contenido, versión, día fuente y día programado. Los adaptadores de Deseo, Respiración y Focalización reciben el contexto correcto sin modificar globalmente el día del plan. Biblioteca no cierra jornadas. El contenido desplazado conserva acceso e identidad.

Los planes existentes permanecen en `legacy`; los planes nuevos usan la agenda nueva. El servidor dispone de los manifiestos de ambas versiones, incluidas las variantes históricas por ruta, deseo secundario, seguridad y fuerza. No se renumeran registros ni se marcan retrospectivamente actividades como realizadas.

**Decisión conservada:** Focalización II permanece en el día 19, antes de I4/I5 en los días 23/26. Determinar si II exige las cinco sesiones I es una decisión clínica pendiente expresamente identificada en el encargo. La implementación no inventa esa regla ni cambia la secuencia.

## 2. Cierre, guardado y restauración

La operación `spm_close_program_day` comprueba propiedad, acceso, plan, versión, revisión, jornada, seguridad y requisitos contra el catálogo protegido del servidor. Inserta el cierre y avanza el plan en una misma transacción. Una jornada válida sin requisitos necesita confirmación voluntaria; una agenda ausente, mal formada o no cargada no se trata como una jornada vacía válida.

Se cubren los siete cierres históricos defectuosos: Erección 16/19, Control 16, Confianza 16/19 y Hábitos 16/19. La ausencia de prácticas realizadas se conserva como tal. El día 28 produce `cycle_status=completed` y un plan completado; no genera un día 29 ni exige un nuevo cierre al reingresar.

`spm_save_activity` guarda cada actividad con revisión optimista y un identificador de operación. Repetir una solicitud cuya respuesta se perdió recupera el mismo recibo. Dos ediciones incompatibles no se pisan silenciosamente. El adaptador conserva el intento original mientras su resultado es incierto; abrir de nuevo permite consultar el registro canónico antes de cambiar las respuestas.

Las funciones nuevas usan `SECURITY INVOKER`. Las políticas de acceso y los triggers protegen los manifiestos, recibos, cierres, identidad del plan y pertenencia de los registros. Las pruebas comprueban usuario propietario, otro usuario y sesión anónima, además de intentos directos de saltarse el cierre. Las funciones existentes para completar respuestas y corregir una señal de seguridad siguen funcionando bajo su contexto autorizado; un usuario autenticado no puede imitar ese privilegio con una actualización directa.

`app-live.js` restaura `current_day`, cierres y estado del ciclo desde el servidor. Ya no deduce el avance como el máximo día de cualquier registro más uno. Un cambio de cuenta o una nueva sesión invalida las respuestas asíncronas anteriores y limpia formularios, métricas, contexto y voz. El antiguo restaurador alternativo ya no puede reconstruir un avance incompatible.

**Historial incompleto:** la migración solo transforma cierres explícitos históricos (`daily_practice`). No inventa cierres a partir de `current_day`. Si existen huecos incompatibles, informa `SPM_PROGRESS_RECONCILIATION_REQUIRED` y conserva los datos para revisión. Se debe cuantificar ese caso con acceso autorizado antes de aplicar la migración a producción.

## 3. Respuestas válidas y Daily Coach

DE01 distingue una selección de EHS, cero y «No evaluable». Permite la salida aprobada de omisión sin contarla como una práctica realizada. Los datos de seguimiento general —siete aspectos, 0–4— y las cuatro dimensiones de Conexión —0–10— conservan instrumentos distintos. No se convierten escalas ni se mezclan sus promedios.

El Daily Coach ya no presenta sueño, estrés, confianza, deseo, resultado o práctica realizada como si la persona los hubiera contestado. Los campos parten vacíos. Cada escala admite una selección explícita de 0–10 o «No evaluable o no aplica», que se persiste como `null`. Los promedios excluyen los valores ausentes. Una comparación no evaluable no genera una conclusión de mejora ni se interpreta como cero.

El guardado del Coach tiene un UUID estable durante un reintento. Si el servidor insertó el registro pero se perdió la respuesta, el segundo intento recupera ese mismo registro mediante su identificador y verifica los datos. El botón no permite dos solicitudes simultáneas. Guardar el Coach no cierra ni avanza la jornada, y cambiar de cuenta borra todas las respuestas del formulario.

La evaluación inicial todavía contiene una pregunta de pérdida de erección durante penetración (`e_loss`) cuya escala no representa «No aplica». Modificar ese instrumento y su puntuación requiere una decisión explícita; no se alteraron los pesos ni se fabricó una equivalencia numérica.

## 4. Voz y material audiovisual

`device-voice-v1.js` coordina la reproducción de Central y sus iframes. Usa el español del dispositivo sin fijar nombre, género ni proveedor. Requiere una acción de la persona, mantiene lectura disponible y permite detener, pausar, repetir y recuperarse de incompatibilidades. Generaciones y propietarios impiden que callbacks viejos reanuden una narración o que dos superficies compitan.

Se migraron los consumidores de voz de Hoy, seguimientos, recuperación, bienvenida, presentación comercial, Insights, visores táctiles y Labs. Se conservaron los textos completos y las imágenes de origen. Las señales de fuerza pélvica parten desactivadas y requieren activación explícita. La dosis y el temporizador permanecen separados de la voz; escuchar un audio completo no es requisito de guardado o cierre.

La demo final de Respiración incluye seis segmentos del `FINAL_TRANSCRIPT` publicado, seis fotogramas originales, avance manual y texto íntegro. El movimiento original sigue disponible silenciado. Está comprobada la correspondencia con el texto publicado, pero no la equivalencia acústica con toda la pista original ni la preservación de un ambiente sonoro útil.

El inventario distingue **doce vídeos de Biblioteca con narración original aún pendiente de conversión**. No se localizaron sus guiones completos, subtítulos o pistas separadas en los materiales accesibles. Los textos de las acciones posteriores al vídeo no se utilizaron como si fueran sus transcripciones. Cada pieza y su dependencia figuran en el inventario de voz.

## 5. Revisión editorial y conservación de la oferta

El inventario editorial español reúne **171 paquetes y 6.948 referencias de texto**: 350 referencias modificadas y 6.598 conservadas tras revisión. Son fragmentos de fuentes y plantillas, no actividades ni cambios independientes. Se revisaron guías completas, títulos, instrucciones, opciones, estados, errores y transcripciones de las fuentes actuales. La documentación editorial conserva texto completo, ruta de origen, huella del archivo, cambios antes/después y casos revisados sin cambios. Incluye las guías E01–E13, los campos reales de Conexión, las redundancias de Deseo, microcápsulas de Control, ayudas de cierre, onboarding, evaluación, resultados, recuperación y material comercial retenido.

Los cambios precisan el referente sexual cuando corresponde, presentan las modalidades individuales existentes y permiten describir ausencia de cambios. No añaden técnicas, repeticiones, intensidades, frecuencias ni cambios de medicación. Se conservaron los esquemas de los formularios de Conexión y los límites de sus escalas.

La revisión de los cuatro PNG españoles de Insights detectó texto incrustado distinto del guion usado por el producto, con promesas que no quedan corregidas cambiando solo el JavaScript. Su transcripción visual y SHA-256 están documentados. El arte aprobado no se declara corregido ni equivalente hasta resolver esa discrepancia. La revisión editorial integral acreditada corresponde al español; la traducción inglesa necesita una revisión equivalente si se mantiene como una experiencia ofrecida al público.

Se conserva el regalo original de **12 recetas** y el precio de **COP 149.000**. El ebook premium permanece separado. Los mensajes de espera y retorno de pago ahora distinguen un programa aún no iniciado de uno en curso: conservar el avance existente no implica reiniciarlo en el día 1. La pausa de cobros permanece activa.

## 6. Evidencia y límites de las pruebas

La evidencia incluye pruebas del compositor real, formularios y adaptadores de la aplicación, así como ejecución de las funciones SQL en **PostgreSQL local mediante PGlite**. Las pruebas SQL aplican la migración, ejercitan roles, RLS, triggers, rollback y reapertura de almacenamiento persistido. La integración carga el `app-live.js` entregado y ejecuta sus operaciones contra esas funciones SQL.

La capa de transporte y los eventos de autenticación de esa integración son dobles de prueba deterministas. PGlite no acredita Supabase Auth, PostgREST, concurrencia de varias conexiones remotas ni una sesión física en otro dispositivo. Tampoco acredita sonido audible. El reviewer usa datos sintéticos en memoria y se identifica como tal; no es evidencia de guardado remoto.

La tanda completa de pruebas Node de la implementación principal, anterior a las protecciones adicionales del preview, aprobó **718/718**, con **0 fallos y 0 casos omitidos**. Incluye **16 pruebas SQL** y **12 pruebas del adaptador real `app-live.js` contra PostgreSQL local**. Las tandas de agenda, voz y editorial se solapan con este total; sus cifras no se suman como si fueran casos únicos. El log íntegro se conserva en `spm-full-suite-20261127.tap`.

La verificación adicional de los componentes de Respiración aprobó **42/42 pruebas Vitest**, y los tres Labs modificados pasaron comprobación de tipos y compilación. La revisión independiente de persistencia detectó y corrigió dos vías de alteración de registros derivados: el resumen histórico del cierre y un recibo con revisión ficticia. Las regresiones y su dictamen final están en `persistence-independent-review-20261127.md`.

Después de las últimas cuatro redacciones HTML se ejecutó otra tanda focal de aplicación y reingreso: **17/17**, también sin fallos ni omisiones (`spm-app-final-20261127.tap`). Estos casos se solapan con la suite principal.

Después de la autorización expresa se publicaron la rama, el PR borrador #85 y un preview de Vercel. La suite Node de la primera publicación aprobó **729/729**; en el código consolidado `ced7a2a` aprobó **733/733**, sin fallos ni omisiones, junto con **127/127 Vitest**. La revisión del preview corrigió una política de evaluación que no se servía y un panel de voz que podía interceptar navegación móvil. En el navegador cloud ya se verificaron Conexión 1→28, ausencia de línea base, cierre voluntario del ciclo, guardado parcial/final de Conexión 13 y los tres estados de EHS en Erección 1. Los smoke móviles de Deseo semanas 2 y 3–4 aprobaron Chrome y WebKit en `ced7a2a`. Los commits comprobados, las comprobaciones de CI y los límites están en los informes enlazados. Esta evidencia no certifica el backend alojado ni sonido físico.

Para reproducir las pruebas principales:

```sh
npm ci --prefix scripts/qa
npm ci --prefix labs/desire
npm ci --prefix labs/breathing
npm ci --prefix labs/pelvic-floor
NODE_PATH="$PWD/scripts/qa/node_modules" node --test --test-reporter=tap --test-force-exit tests/*.test.cjs
```

La migración se regenera con `node scripts/qa/build-progress-migration.cjs`. Su archivo contiene los manifiestos protegidos y ocupa 2.798.172 bytes. Se añadió un generador local de ocho partes, todas menores de 900.000 bytes, destinado exclusivamente a una rama de QA vacía. La prueba focal aprobó **6/6** y comprobó en dos PostgreSQL locales independientes la igualdad íntegra de catálogos, funciones, triggers, RLS, permisos y columnas respecto del SQL canónico. Las partes conservan los 72 contextos legacy de 28 días. Cada parte tiene una transacción propia; el conjunto no ofrece atomicidad entre llamadas ni se considera preparado para producción. No se aplicó a ningún servicio alojado.

## 7. Documentación de apoyo

### Preparación adicional del preview

Se añadieron exclusiones del deployment y reglas HTTP terminales para impedir que el sitio sirva informes internos, fuentes de servidor, SQL, scripts, tests o fuentes de Labs. El visor y sus módulos compilados conservan sus recursos; la política pública de evaluación es una copia exacta del módulo canónico, verificada por prueba. La tanda focal inicial aprobó **19/19**; la corrección posterior de publicación y continuidad aprobó **16/16**. En el deployment corregido se confirmaron 200 para la política pública y 404 para su antigua ruta backend, junto con la carga y operación del visor.

El visor usa datos ficticios en memoria. El sitio completo no constituye todavía un entorno de backend aislado: la página de retorno de pago y los clientes de la aplicación siguen apuntando al proyecto principal. La validación real de Auth y persistencia necesita una rama separada y configuración expresa. No se crearon cuentas ni se escribieron datos en ese proyecto.

Se retiró el recorte superior de las cápsulas de Control: las 14 imágenes originales se contienen completas en el lienzo 9:16 y solo se reemplaza la caja medida de cada titular por su texto revisado. Los bytes y los guiones se conservaron. Las cajas y sus límites figuran en el inventario; cuando había un fondo ilustrado bajo las letras, esa zona concreta queda cubierta. La evidencia de render se registra por separado en el informe del preview. La discrepancia de los cuatro Insights continúa pendiente.

La revisión automática había rechazado publicar el inventario completo después de una petición genérica de continuar. La autorización expresa posterior resolvió ese bloqueo. Las exclusiones de Vercel no alteran la visibilidad de los archivos publicados en GitHub.

- [Agenda, escenarios y decisiones](spm-agenda-20261127-review.md)
- [Matriz de las tres variantes mixtas](spm-agenda-20261127-mixed-matrix.md)
- [Implementación y QA de voz](spm-voice-20261127-qa.md)
- [Inventario de voz y vídeos](spm-voice-20261127-inventory.json)
- [Revisión editorial completa](editorial-20261127/EDITORIAL_REVIEW.md)
- [Matriz del corpus activo](editorial-20261127/active-corpus-matrix.md)
- [Discrepancias verificadas en los cuatro Insights](editorial-20261127/insights-es-visual-review.json)
- [Fuente SQL revisable](../../supabase/sql/spm-atomic-progress-body.sql)
- [Suite completa: 718 pruebas](spm-full-suite-20261127.tap)
- [Revisión independiente de persistencia](persistence-independent-review-20261127.md)
- [Estado de publicación y antecedentes de autorización](spm-publication-status-20261127.md)
- [Revisión del preview alojado y límites](spm-hosted-preview-review-20261127.md)
- [Correcciones de integración continua](spm-ci-reconciliation-20261127.md)
- [Preparación del preview, protección de archivos y recorridos pendientes](spm-preview-preparation-20261127.md)
- [Prueba focal de protección y continuidad: 19 casos](spm-preview-boundary-20261127.tap)
- [Resumen de la prueba focal de partición de la migración: 6 casos](spm-migration-parts-20261127.json)

## 8. Pendientes para cerrar la validación y preparar una reapertura

| Pendiente | Resultado necesario |
|---|---|
| Backend aislado de Supabase | Aplicar la migración revisada y completar el recorrido autenticado con cuentas sintéticas; comprobar Auth, transporte, RLS remota, reingreso y operaciones desde sesiones separadas. |
| Doce vídeos con narración original | Obtener o transcribir con verificación los guiones completos y preparar equivalencia visual/textual por segmentos; conservar el sonido no hablado útil cuando sea viable. |
| Demo final de Respiración | Cotejar la pista original completa con el texto publicado y caracterizar el ambiente útil antes de declarar equivalencia audiovisual. |
| Safari/iOS y Chrome/Android físicos | Escuchar, pausar, reanudar y cambiar de pantalla/cuenta en dispositivos reales, incluyendo Conexión 1/13/28; registrar navegador, sistema, fecha y resultado. |
| Focalización II | Resolver si las cinco sesiones de fase I son un requisito previo; después ajustar agenda y validación si corresponde. |
| Evaluación inicial `e_loss` | Definir la representación de «No aplica» sin alterar indebidamente el instrumento y la puntuación histórica. |
| Arte de Insights | Conciliar los cuatro PNG aprobados con la redacción y narración vigentes; el texto incrustado antiguo no está cubierto por el cambio de voz. |
| Traducción inglesa | Completar una revisión editorial equivalente antes de acreditar la experiencia bilingüe. |
| Historial antes de producción | Comprobar los posibles huecos de cierre histórico y revisar la migración/recuperación antes de tocar datos reales. |

La decisión de reapertura comercial queda separada de esta entrega de revisión. No se recomienda reactivar cobros hasta resolver las dependencias materiales y completar la validación del backend y de dispositivos.
