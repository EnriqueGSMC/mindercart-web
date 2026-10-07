# MINDERCART — CHECKPOINT / HANDOFF MAESTRO

## ESTADO AUTORITATIVO ACTUAL — 6 OCTUBRE 2026, revisión para promoción

Este bloque PREVALECE sobre todos los estados/adendas conservados debajo. No ejecutar pendientes históricos como actuales.

### Git y alcance

- Repo C:\dev\mindercart-web, testing **9db5185**, selección plantillas por host, deployment confirmado. Inglés simplificado publicado antes en **9598643**. Ambos implementados/publicados en testing.
- Main local **0efee51**; no fetch ni promoción en esta revisión. Comparación antes de edición documental: **34 commits, 30 archivos, 2009 inserciones / 285 eliminaciones**. Main es ancestro de testing. Incluye Siri/API, parser bilingüe/notas, sync/protección eliminaciones, dictado revisado, acceso/recuperación, bienvenida/navegación y configuración por dispositivo.
- Freeze **mindercart-testing-siri-refresh-checkpoint -> f3ec5de** NO incluye 9598643/9db5185. Tags anteriores auth aaee114, bilingüe 4e3873c, inglés f665756 intactos; nombres completos abajo. No mover tags. No nuevo freeze/respaldo main en esta sesión.
- Antes de editar solo estaba modificado handoff. Historial/cambios preexistentes preservados. Edición solo guía/handoff, no código/commit/push/merge.

### Instalación y atajos

- Español **Mi Lista**, pregunta **Pega aquí lo que copiaste.** Inglés **My List**, **Paste what you copied here.** Usuario nuevo NO renombra.
- AMBOS idiomas ya tienen tres pasos: copiar, instalar, pegar/agregar. Único copiar debajo, luego instalar. Instalar NO copia; copiar incluye Bearer. No pedir ni reproducir secretos.
- Terminar oculta guía/token sin revocar; acceso activo muestra estado/revocación confirmada. No revocar por renombrar. Siri: nombre solo, esperar pregunta, dictar; siguiente artículo / next item, nota / note.
- Idiomas app/Siri/dictado independientes. App selecciona por SU idioma, NO detecta Siri. Selector específico Siri propuesto, NO implementado; no añadir de oficio.

| Entorno | Mi Lista | My List |
| --- | --- | --- |
| Testing | https://www.icloud.com/shortcuts/fcbff51af45341cfbb4528d1096cffc1 | https://www.icloud.com/shortcuts/3f932f78e3de4f4e92c4b23f414afb96 |
| Producción | https://www.icloud.com/shortcuts/bf4a799da2af4e2b977dfe5d764e656d | https://www.icloud.com/shortcuts/11a53bc6cc874379ae2b72605170ec96 |

- shortcut-links.ts selecciona hosts exactos testing mindercart-web-git-testing-enrique-sanchezs-projects.vercel.app / producción mindercart-web.vercel.app; otros null. Destino /api/voice/add-items de SU host. Promover código NO cambia copias/snapshots.
- Producción preparada desde respaldos PENDIENTE cambiando SOLO URL; usuario confirmó ambos, inglés por captura también. NO prueba end-to-end producción.
- Inventario local más reciente: personales Mi Lista Personal Testing / My List Personal Testing conectados; respaldos Mi Lista plantilla / My List Template PENDIENTE; plantillas producción publicadas Mi Lista / My List PENDIENTE. No confundir/borrar personales. Renombrar local no altera snapshot.
- Agregar a MinderCart / Shopping Voice y enlaces anteriores históricos, no distribuir.

### Validaciones y decisiones

- Propietario validó ambos idiomas, notas/varios, app cerrada, actualización automática y refresh sano. Fallo ejecutando PENDIENTE no fue fallo personal.
- Esposa recuperó contraseña (Spam), entró y reportó instalación Siri anterior; no prueba autónoma completa nuevas plantillas/permisos/aislamiento.
- Login existente/cuenta nueva -> Mi Lista probados. Mantener barras azules, acceso compacto, mostrar/ocultar, recuperación, iniciar azul izquierda / crear claro derecha.
- Bienvenida única -> Empezar -> /auth. Usuario pidió ORDEN, no prohibir navegar. AccessGate NO bloquea recuperación Firebase. No reintroducir pantalla blanca Comprobando/Reintentar ni gate global; autenticación cloud permanece.
- En revisión pasaron siete scripts: auth-entry-regression, siri-setup-ui-regression, siri-shortcut-links-regression, voice-device-regression, voice-english-regression, voice-sync-regression, live-language-regression. Build pasó al preparar 9db5185; no recompilado por edición documental. Tests no certifican producción ni sustituyen teléfono.
- Guía actualizada: tres pasos, nombres/enlaces, límites y pendientes. Historial marcado NO operativo.

### Próximos pasos

1. Usuario decide publicar documentos; comandos separados, no git add . ni commit automático handoff.
2. Confirmar Firebase Admin Vercel Production SIN secretos. No verificado localmente; no asumir fallo/éxito.
3. Con autorización explícita, respaldar main vigente y promover conjunto testing sin rediseños adicionales.
4. Tras deployment main: prueba controlada sesión/manual/tres pasos/permisos/nota/varios/app abierta-cerrada/actualización/persistencia/destino; luego ampliar testers. Aislamiento solo cuentas/grupos independientes; familia comparte por diseño.
5. Pendientes: recuperación nueva UI/Spam, persistencia idioma tras preferencias, instalación autónoma nuevas plantillas otro iPhone y Android real (solo teclado, no Assistant/Gemini). No declararlos validados.

---

# HISTORIAL ANTERIOR — NO REFERENCIA OPERATIVA ACTUAL

# ESTADO VIGENTE — 6 OCTUBRE 2026 (America/Chicago)

## Preparación posterior: plantillas producción (integración local, sin promoción a main)

- Inglés sencillo se publicó en testing con `9598643`; usuario confirmó deployment. El freeze `f3ec5de` sigue intacto y no incluye ese commit.
- Usuario duplicó respaldos sin conexión y cambió SOLO la URL a `https://mindercart-web.vercel.app/api/voice/add-items`. Español PENDIENTE/URL confirmados por usuario; inglés además confirmado por captura. Método/encabezados/cuerpo no se reconfiguraron.
- Snapshot producción **Mi Lista**: `https://www.icloud.com/shortcuts/bf4a799da2af4e2b977dfe5d764e656d`; **My List**: `https://www.icloud.com/shortcuts/11a53bc6cc874379ae2b72605170ec96`. No credenciales privadas solicitadas.
- Durante publicación, personales testing se renombraron a **Mi Lista Personal Testing / My List Personal Testing**; nombres **Mi Lista / My List** quedaron temporalmente en las plantillas de producción PENDIENTE. No ejecutar estas plantillas como si fueran personales ya configurados. No borrar personales.
- A petición del usuario se integró localmente `src/lib/voice/shortcut-links.ts`: hostname exacto producción selecciona snapshots producción; hostname exacto testing mantiene fcbff…/3f932…; otros hosts no ofrecen plantilla fija. Settings conserva los tres pasos de ambos idiomas y selecciona enlace es/en del entorno. Pruebas de selección de enlaces, guía y dispositivo pasan.
- Esta integración todavía requiere commit/deployment en testing y autorización posterior para promover main. No afirmar prueba end-to-end en producción ni despliegue main. Verificar API/env/reglas de producción y primer uso con cuenta de prueba antes de distribuir ampliamente a testers.

## Adenda posterior al freeze: inglés simplificado (cambio local pendiente de publicación)

El usuario autorizó terminar los pendientes ingleses. `src/app/settings/page.tsx` ahora ofrece en testing **My List** con el enlace `https://www.icloud.com/shortcuts/3f932f78e3de4f4e92c4b23f414afb96`, tres pasos aprobados y un único botón **Copy connection** debajo; copia la conexión completa con Bearer. Se ocultan en testing la clave suelta y las guías largas anteriores también en inglés. La rama española no cambió. No se modificaron atajos personales, autenticación, endpoint ni main. Tests de configuración y dispositivo pasan. Esta adenda sustituye los pendientes de implementación inglesa descritos abajo; la publicación Git/deployment y verificación en teléfono aún deben confirmarse. El freeze f3ec5de NO contiene este cambio. Documentación pública y preparación de producción siguen pendientes.

Este bloque sustituye como referencia operativa todos los estados y planes anteriores de este documento. Se conserva íntegro el historial debajo: sus nombres, enlaces, restricciones y pendientes pueden haber quedado obsoletos. No ejecutar instrucciones antiguas sin compararlas con este bloque.

## 1. Punto exacto de continuación y Git

- Repo: `C:\dev\mindercart-web`; rama `testing`.
- HEAD, `testing` y `origin/testing` verificados localmente: **f3ec5de**, `fix: keep welcome order without blocking app navigation`.
- Freeze actual: **mindercart-testing-siri-refresh-checkpoint -> f3ec5de**. El usuario creó el tag anotado, lo subió a GitHub y mostró su verificación. Siri en su iPhone y refresh manual validados; actualización de instalación inglesa pendiente.
- Otros checkpoints publicados: `mindercart-testing-auth-checkpoint -> aaee114`; `mindercart-testing-siri-bilingual-checkpoint -> 4e3873c`; `mindercart-testing-siri-en-validated -> f665756`. No mover ni sobrescribir estos tags.
- `main` y `origin/main` locales siguen en **0efee51**. No se hizo fetch para esta actualización; no afirmar estado remoto más reciente. No se promovieron estos cambios a producción.
- Antes de editar este handoff, `git status --short` solo mostraba `M MINDERCART_CHECKPOINT_HANDOFF.md`. No había código pendiente. El documento tenía modificaciones extensas preexistentes que se preservan.
- El freeze actual congela código, NO atajos locales ni snapshots de iCloud. Esta actualización documental es posterior al tag y todavía no está incluida en un commit/tag.

## 2. Decisiones del usuario: no volver a interpretar de más

- El usuario pidió **orden de módulos**, NO prohibir navegación sin sesión. No reinstalar un gate de autenticación ni esperar a Firebase para mostrar toda la app.
- Conservar diseño: barras azules arriba con logo/nombre y sección, barra azul abajo. En acceso la inferior no tiene iconos.
- Acceso compacto: correo, contraseña, mostrar/ocultar, **Iniciar sesión azul a la izquierda / Crear cuenta claro a la derecha**, recuperación de contraseña. No volver a separar registro en otro modo o esconderlo debajo de una pantalla larga.
- No agregar rediseños, selecciones o pasos no acordados. Usuario exige facilidad de uso para personas no técnicas y pocas palabras; comprobar primero antes de cambiar.
- Cambios técnicos se hacen localmente; usuario ejecuta commit/push/tag. Entregar cada comando Git en bloque separado para evitar que al copiar se concatenen. No usar `git add .` ni incluir este handoff en commits de código sin decisión explícita.

## 3. Bienvenida y acceso: funcionamiento actual

- Una sola bienvenida en la raíz `/`, recordada por `mindercart.onboardingSeen.v1` en ese navegador, no por cuenta.
- Textos originales conservados: (1) **Agrega lo que necesitas en segundos** / Anota artículos en cualquier momento, antes de olvidarlos; (2) **Crea y reutiliza tus propias listas** / Guarda listas para compras semanales, recetas u ocasiones especiales; (3) **Compra más rápido, organizado por categoría** / Pasa menos tiempo buscando y regresando por los mismos pasillos. También existe su traducción inglesa.
- Botón **Empezar** marca bienvenida vista y lleva a **/auth**. Inicio de sesión o creación exitosa llevan a **Mi Lista**. El modal antiguo duplicado de `src/app/page.tsx` fue retirado.
- `src/components/mindercart/AccessGate.tsx` conserva el nombre por compatibilidad, pero ahora SOLO organiza bienvenida/navegación. NO usa `useAuthSession`, NO tiene lista de rutas protegidas, NO redirige invitados automáticamente a /auth al navegar, NO bloquea durante `loading` o errores de sesión. Recuperación Firebase sigue en segundo plano.
- La pantalla `/auth` mantiene selector de idioma ya existente, textos bilingües, scroll propio `height: 100dvh; overflow-y: auto`, campos legibles y botones juntos.
- El usuario confirmó físicamente inicio de sesión existente y creación de cuenta nueva: ambos abren Mi Lista. No repetir sin motivo.
- Firebase `auth/invalid-credential` y cuenta existente tienen mensajes comprensibles mediante `src/lib/firebase/auth-messages.ts`; no mostrar errores crudos. Recuperación pide confirmación, muestra progreso, respuesta condicional de existencia de cuenta y aviso Spam; timeout 15 segundos con limpieza.
- Cuenta de esposa sí existía. Correo de recuperación llegaba a Spam; cambió contraseña y pudo entrar el 4 de octubre. NO afirmar que Firebase no mandaba correos ni borrar/recrear su cuenta. Validación completa de recuperación desde la nueva interfaz todavía no fue reportada con detalle.
- Comprobación automática de existencia de correo para habilitar botones fue discutida y **se dejó sin implementar**, por protección contra enumeración y ambigüedad de credenciales. No crear cuenta automáticamente al fallar login.
- Bienvenida posterior al acceso con elección lista/Siri fue propuesta, pero **no implementada ni pendiente obligatoria aprobada**. No introducirla de oficio.

## 4. Incidente de refresh y resolución final (no confundir con Siri)

- El gate añadido en `9f30771` bloqueaba toda la app mientras Firebase recuperaba sesión; de ahí pantalla blanca «Comprobando tu sesión…» y a veces Reintentar. El plazo de 8 segundos es aviso, no espera obligatoria.
- `auth-context.tsx` y `client.ts` no cambiaron respecto a `4e3873c`; no se probó causa específica de la demora del SDK/red en el iPhone. El gate hizo visible y bloqueante una espera que antes no ocultaba toda la pantalla.
- Se preparó un arreglo visual con barras y distinción demora/error, compiló, pero fue **sustituido antes de commit** por la corrección solicitada: retirar el bloqueo, no disimularlo. No restaurar esa pantalla de espera.
- `f3ec5de` elimina ese gate de sesión. Conserva autenticación, protección de operaciones cloud y lógica de sincronización; no se modificaron reglas Firebase ni API Siri.
- Después del deployment el usuario ejecutó **My List**, el artículo apareció inmediatamente sin refresh, luego hizo refresh manual y confirmó que todo estaba bien. Esta corrección está validada en su iPhone.

## 5. Atajos y enlaces: separar personal, respaldo y snapshot publicado

| Elemento | Nombre / enlace | Estado |
| --- | --- | --- |
| Español personal | **Mi Lista** | Conexión privada; probado y funcional; nunca compartir |
| Español respaldo local | **Mi Lista plantilla** | Texto PENDIENTE; sin conexión; conservar |
| Inglés personal | **My List** | Conexión privada; probado y funcional; nunca compartir |
| Inglés respaldo local | **My List Template** | Texto PENDIENTE; sin conexión; conservar |
| Snapshot público español | https://www.icloud.com/shortcuts/fcbff51af45341cfbb4528d1096cffc1 | Publicado con nombre **Mi Lista**; ya enlazado por testing |
| Snapshot público inglés NUEVO | https://www.icloud.com/shortcuts/3f932f78e3de4f4e92c4b23f414afb96 | Usuario lo preparó como **My List** sin conexión; todavía NO enlazado por la app |
| Inglés todavía enlazado en app | https://www.icloud.com/shortcuts/ace6e4d0434f4efba7eda56db89376ea | **Shopping Voice**, guía larga anterior; pendiente sustitución |

- `Agregar a MinderCart`, `Shopping Voice` y las plantillas con nombres anteriores son históricos. Se autorizó borrar los personales antiguos solo tras verificar sus reemplazos. Usuario confirmó los renombrados y funcionamiento; no afirmar confirmación individual de cada borrado posterior si no la dio.
- El respaldo antiguo **MinderCart English Template** se duplicó para crear My List Template; no hay confirmación de que ese respaldo antiguo adicional se haya borrado. No pedir nuevas duplicaciones innecesarias.
- Al preparar los snapshots se renombró temporalmente el personal a Mi Lista Personal / My List Personal. El usuario luego devolvió **Mi Lista / My List** a los personales y llamó plantilla/Template a los respaldos. Nombres locales actuales no alteran el nombre guardado en snapshots anteriores de iCloud.
- Hubo una prueba inglesa fallida por ejecutar la copia **PENDIENTE**, no por romper Siri. Tras usar el personal configurado volvió a funcionar. No confundir plantilla sin conexión con copia funcional.
- Importación española: **Pega aquí lo que copiaste.** Inglesa: **Paste what you copied here.** Usuario editó ambas preguntas. Respuesta predeterminada vacía; bloque PENDIENTE en copias compartibles. La conexión completa incluye Bearer y se copia desde la app; no pedirla por chat.
- Atajos: Texto -> Dictar texto -> POST URL fija a `https://mindercart-web-git-testing-enrique-sanchezs-projects.vercel.app/api/voice/add-items`; único Authorization con variable Texto; JSON `utterance` con salida del dictado; sin Vista rápida/Mostrar.
- Español Dictar texto **Español (México)** confirmado por captura. Inglés no cambiar idioma de dictado por renombrar: conservar el de la plantilla inglesa. Siri, app y dictado son ajustes independientes.
- No enviar estos enlaces testing a producción. Los renombrados personales no son pasos de instalación para un usuario nuevo: el snapshot debe instalarse directamente con su nombre definitivo.

## 6. Guía sencilla española ya implementada; inglés todavía pendiente

- Commit **be5d49b**: `fix: simplify Spanish Siri setup and publish Mi Lista template`, incluido en el freeze actual.
- En español recién activado, testing muestra **Configura Siri en 3 pasos**: (1) Copia tu conexión con el botón de abajo; (2) Toca Instalar atajo; (3) Pega tu conexión y toca Agregar atajo.
- Debajo, en ese orden: **Copiar conexión**, **Instalar atajo**. Un único botón copiar; copia `Bearer ${voiceToken}`, no clave suelta. No mostrar la clave ni las instrucciones técnicas largas en esa rama española testing.
- «Tu conexión es privada. No la compartas.» / «Para usarlo: activa Siri, di “Mi Lista” y espera a que te pida qué agregar.»
- Configuración aparece solo cuando voiceToken recién generado está disponible. Acceso previamente activo no muestra instalación/copia; Terminar configuración oculta token/guía sin revocar; Revocar conserva confirmación. No revocar para renombrar o borrar un atajo viejo.
- Inglés sigue intacto con guía anterior y Shopping Voice. Texto propuesto: **Set up Siri in 3 steps**; **Copy your connection using the button below.**; **Tap Install shortcut.**; **Paste your connection and tap Add Shortcut.**; botones **Copy connection / Install shortcut**; **Your connection is private. Don’t share it.**; **To use it: activate Siri, say “My List”, and wait for it to ask what to add.**
- Esta actualización inglesa fue propuesta, pero no hay implementación ni autorización inequívoca posterior que permita asumirla realizada. Confirmar alcance con usuario antes de editar; enlace nuevo ya disponible arriba. Español no cambiar.
- `docs/GUIA_DICTADO_IPHONE_ANDROID.md` todavía tiene nombres/enlaces antiguos. Pendiente alinear esa guía y las ramas técnicas históricas de Settings cuando se autorice; no tratarlas como guía vigente de nombres.

## 7. Pruebas físicas confirmadas, 5–6 octubre

- Siri y dictado en español: desde Atajos Leche nota cacao -> producto/nota correctos; con Siri Pan nota integral -> correcto.
- «Huevos siguiente artículo manzanas siguiente artículo arroz» -> tres artículos separados (Manzana normalizado por catálogo). Aparecieron solos, sin refresh.
- Con app cerrada, prueba Tomate nota prueba cerrada -> usuario confirmó funcionamiento. No requiere app abierta para enviar, sí internet y conexión vigente; desbloqueo/permisos pueden depender del iPhone. No prometer operación offline.
- Inglés: «Milk note vanilla next item apples next item rice» -> usuario confirmó todo en orden.
- Nuevos nombres: **Mi Lista**, Siri español, artículo llegó a app; **My List**, Siri inglés, Milk note chocolate llegó. Tras ordenar nombres y usar personal correcto, My List volvió a funcionar. Última prueba además confirmó artículo inmediato y refresh manual sano.
- Varios artículos: español **siguiente artículo**; inglés **next item**. Notas: **nota / note**. Activar Siri -> decir solo nombre -> esperar solicitud -> dictar productos. No nombre y productos juntos.
- Usuario informó instalación de Siri en iPhone de esposa el 5 de octubre y el 6 observó que guía larga/copia duplicada y nombre MinderCart complicaban uso. Eso NO certifica automáticamente todos los casos de permisos, separación de cuentas y actualización sin refresh. Nuevas plantillas Mi Lista/My List no tienen instalación independiente completa reportada en ese teléfono.

## 8. Validación técnica y pendientes prioritarios

- Builds Next/TypeScript pasaron en los cambios de acceso, guía española y retiro del bloqueo. `tests/auth-entry-regression.cjs` verifica navegación aun con sesión loading/error, acceso compacto, errores bilingües y recuperación. `tests/siri-setup-ui-regression.cjs` verifica tres pasos/único copiar/conexión completa/enlace español/ocultación sin revocar; `voice-device-regression.cjs` pasó al simplificar español.
- Tests parser y sync previos siguen como referencia; no afirmar que todos se ejecutaron nuevamente en la última edición documental. No mediciones reales de latencia SDK/red ni prueba Android física.
- Prioridad 1: si usuario autoriza, actualizar **solo inglés** a los tres pasos y enlace My List; comprobar instalación del nuevo snapshot, sin duplicar personales.
- Prioridad 2: prueba autónoma de usuario nuevo con esposa, usando SOLO instrucciones visibles: sesión/recuperación, idioma Siri español, copiar SU conexión, instalar Mi Lista, pegar, permisos, invocación, un artículo/nota/varios, app abierta/cerrada, sin refresh y destino de cuenta/grupo correcto. No guiar por fuera para ocultar problemas de usabilidad. Confirmar ausencia en la cuenta del esposo solo si cuentas/grupos independientes.
- Pendiente idioma: Firebase no revela idioma Siri a la app. Se propuso preguntar idioma antes de instalar, pero **NO implementado**. Hoy se selecciona guía por idioma de la app; advertir límite y acordar solución antes de introducir selector nuevo.
- Pendiente verificar persistencia del idioma elegido en /auth tras cargar preferencias cloud; no se confirmó prueba final. Pendiente recuperación desde nueva UI incluyendo feedback/Spam.
- Pendiente alinear documentación pública; Android: únicamente dictado teclado, NO Siri ni integración Assistant/Gemini validada.
- Después de esas pruebas: checkpoint nuevo solo si se pide. Main/producción requieren autorización y plantillas con endpoint correcto; no promover ahora.

## 9. Reglas para continuar sin regresiones

No volver a reconstruir atajos personales ni pedir secretos. Antes de diagnosticar un fallo preguntar nombre exacto y si esa copia dice PENDIENTE. No contar como fallo artículos escondidos al final de lista. No revocar conexiones funcionales ni cambiar idiomas si el caso ya funciona. No reinstalar control que prohíba navegar: usuario explicó explícitamente que solo quiere orden de módulos. Mantener todos los cambios de diseño acotados y confirmados; comunicar hechos comprobados, límites y acciones pendientes por separado.

---

# HISTORIAL CONSERVADO — ESTADOS ANTERIORES, NO REFERENCIA OPERATIVA

## Actualización histórica del 2 de octubre

2 de octubre de 2026, cierre de sesión aproximadamente 21:52 (America/Chicago).

Este archivo conserva el historial acumulado. El bloque siguiente es el estado vigente; los bloques anteriores cronológicamente que siguen debajo son históricos y no deben usarse como instrucciones actuales.

> **Regla de lectura:** prevalece ACTUALIZACIÓN AUTORITATIVA — 2 OCTUBRE 2026. Testing está en `93544ad`, después del freeze inglés `f665756`. Main sigue en `0efee51` (v405). No se promovió Siri a producción. No inventar una siguiente versión numerada: los últimos commits usan mensajes descriptivos.

# ACTUALIZACIÓN AUTORITATIVA — 2 OCTUBRE 2026

### Corrección posterior al cierre: interfaz de activación (sin publicar aún)

El usuario detectó que Settings ya activado mostraba “Copia tu conexión con el botón de abajo” sin tener disponible el botón. No era un error del usuario: las instrucciones no estaban condicionadas a la disponibilidad de la conexión. A petición del usuario se corrigieron AMBOS idiomas: sin activar, botón Activar; recién activado con voiceToken, instrucciones/copiar/instalar y Terminar configuración; acceso previamente activo sin voiceToken, solo estado y Revocar. Terminar oculta el token en memoria y la guía, sin API ni revocación; confirmación advierte que no vuelve a mostrarse. Revocar tiene confirmación bilingüe antes de DELETE. No se modifican credenciales ni atajos funcionales. `tests/siri-setup-ui-regression.cjs` verifica la rama JSX de configuración y confirmación. Estos cambios son posteriores a 93544ad y requieren commit/deployment propio; no asumir que ya están visibles en testing.

## Estado Git y despliegue

- Repositorio: `C:\dev\mindercart-web`, rama `testing`.
- HEAD comprobado: `93544ad` — `fix: install Spanish Siri shortcut with final invocation name`. Usuario confirmó deployment Ready y que el botón español abre Agregar a MinderCart; NO volvió a instalar ni copiar credenciales.
- Referencias locales comprobadas de `main` y `origin/main`: `0efee51` — `merge: promote v405 to main`. No se hizo fetch en esta actualización. No promover a main sin autorización y validaciones pendientes.
- Freeze inglés publicado por el usuario: `mindercart-testing-siri-en-validated` -> `f665756`. Este tag NO incluye arreglos posteriores; no moverlo ni sustituirlo.
- Otros freezes relevantes: v413 `88fa68e`, v415 `1e5b2bf`, v417 `1fa5ec2`, v419 `11365d6` (voz compacta en español).
- Commits posteriores recientes: `a4ee193` escucha de cambios Siri; `030b1a0` instrucciones bilingües; `aca6547` ayuda por dispositivo; `df17f86` instrucciones españolas; `0d6fd09` recuperación de sincronización visible; `e345664` plantilla española limpia; `93544ad` enlace español con nombre definitivo.
- Este handoff ya tenía grandes modificaciones del usuario antes de esta edición. Se preserva el historial; no hacer add/commit automático ni incluirlo con otros cambios sin petición expresa.

## Atajos del iPhone: inventario final, no volver a empezar

La captura enviada al cierre muestra cuatro atajos de MinderCart, más Nuevo atajo ajeno a esta tarea:

| Nombre visible | Uso | Credencial / estado |
| --- | --- | --- |
| Shopping Voice | Uso diario inglés por Siri | Copia privada configurada, validada; no compartir |
| Agregar a MinderCart | Uso diario español por Siri | Copia privada original configurada, validada; no compartir |
| MinderCart Plantilla | Preparación de plantilla española | Texto PENDIENTE, sin credenciales; tres acciones sin Mostrar |
| MinderCart English Témpl… | Plantilla inglesa anterior local | Texto PENDIENTE confirmado; el nombre completo y paridad con el enlace final no se verificaron en esta última captura |

El usuario confirmó que restauró los nombres. La captura muestra la plantilla española local como **MinderCart Plantilla**, no Plantilla ES: registrar lo visible y NO pedir otro renombrado innecesario. El nombre de una copia local puede diferir del snapshot publicado.

Se eliminaron copias de prueba: la plantilla privada española recién instalada, MinderCart English Test, Shopping Test y MinderCart Plantilla 1. No reconstruirlas ni pedir recuperar sus claves. Los dos atajos superiores funcionales se conservan intactos.

Durante preparación del enlace español se renombró temporalmente el original a Agregar a MinderCart Espera para liberar el nombre; se publicó la plantilla sin clave como Agregar a MinderCart y luego se devolvió el nombre al original. Estos pasos son SOLO de preparación del desarrollador, NO del usuario nuevo.

## Enlaces públicos finales (testing exclusivamente)

- Español, nombre publicado **Agregar a MinderCart**: https://www.icloud.com/shortcuts/850dfff0a8af4419bed750ad182534e0
- Inglés, nombre publicado **Shopping Voice**: https://www.icloud.com/shortcuts/ace6e4d0434f4efba7eda56db89376ea
- Ambos enlaces están en `src/app/settings/page.tsx` y documentados en `docs/GUIA_DICTADO_IPHONE_ANDROID.md`.
- End point fijo de las plantillas: `https://mindercart-web-git-testing-enrique-sanchezs-projects.vercel.app/api/voice/add-items`. NO sirven para producción por promover simplemente el código a main.
- Settings ofrece instalación solo en ese hostname exacto de testing. Enlaces anteriores 0cf4…, aa0e…, 2935…, 9d277…, cb0afa…, e5fcd…, a5fdb…, 7da263… son iteraciones históricas, no distribuir.
- Usuario nuevo NO renombra atajos ni arma encabezados/JSON. Los enlaces ya llevan los nombres de invocación definitivos.

## Flujo final para usuarios nuevos

1. Iniciar sesión con SU cuenta en testing y comprobar agregado manual; seleccionar español o English en la app.
2. Configuración -> Agregar con Siri -> Activar acceso para Siri. Copiar **valor completo de Authorization** mientras se muestra. La conexión se muestra solo al activarla; no solicitar claves por chat.
3. Tocar instalación del idioma elegido -> Configurar atajo -> pegar conexión en Texto -> Agregar atajo. No pegar enlace iCloud, no Omitir configuración.
4. Primera ejecución desde el recuadro en Atajos (no tres puntos). Autorizar reconocimiento de voz, conexión a MinderCart y envío del texto a testing; son permisos distintos y pueden aparecer en ejecuciones sucesivas. Dictar un producto cuando escuche y guardar silencio. Esta prueba inicial NO necesita Siri.
5. Uso diario: activar Siri, decir SOLO **Agregar a MinderCart** o **Shopping Voice**, esperar que pida el texto y después dictar. Ejemplos: Leche nota fría / Milk note cold. No decir nombre y producto todos seguidos.
6. Revisar Mi Lista/My List incluyendo final de lista. Esperar hasta 20 segundos si hace falta. Antes de repetir, verificar que no exista ya: reintentos con transcripciones diferentes pueden producir variantes.

App, Siri y Dictar texto tienen idiomas independientes. Siri del usuario estaba en inglés y reconoció Agregar a MinderCart; NO obligar a cambiar idioma si ya funciona. Inglés se validó con Shopping Voice; nombres anteriores Add to MinderCart / MinderCart Voice no resultaron fiables para este usuario.

## Estructura de plantillas y seguridad

- Tres acciones: Texto (PENDIENTE en plantilla, conexión privada en copia instalada) -> Dictar texto -> Obtener contenido de URL.
- URL fija, POST; SOLO un encabezado Authorization (variable amarilla del bloque Texto). Cuerpo JSON con utterance en minúsculas y variable del micrófono producida por Dictar texto.
- La variable del dictado tiene en algunas copias un nombre visual que empieza https://mindercart-web…; se confirmó con Revelar acción que era la salida de Dictar texto. No asumir que es URL literal ni reconfigurar solo por esa etiqueta.
- Importación: pregunta asociada Texto -> Texto, instrucciones para copiar Authorization, respuesta predeterminada VACÍA. Nunca preguntar Encabezados como diccionario al usuario.
- Plantillas finales sin Mostrar / Vista rápida; usar esa acción solo temporalmente para diagnosticar respuestas y luego retirarla.
- Credencial privada se pegó antes en conversación y capturas. No reproducirla en handoff, herramientas ni respuestas. Rotación recomendada anteriormente; usuario decidió continuar sin rotar. No afirmar que se revocó, no forzar revocación ni invalidar atajos actuales.

## Diagnóstico real y resultados confirmados

- Inglés: plantilla final instalada desde iCloud y ejecutada con Siri; producto con nota apareció inmediatamente sin refresh ni pantalla técnica.
- Español: plantilla limpia anterior se instaló correctamente y agregó desde Atajos. El enlace FINAL con nombre Agregar a MinderCart solo se comprobó desde Settings; falta instalación final independiente en otro iPhone.
- Original Agregar a MinderCart dio **La conexión de red se perdió** en Obtener contenido de URL, tanto por Siri como directamente. Inglés y plantilla española sí guardaban. Captura reveló un encabezado adicional VACÍO (marcadores Clave/Texto). Se quitó SOLO ese encabezado; siguiente ejecución agregó. Evidencia apunta a esa fila como causa observada, sin afirmar cómo se creó ni generalizar un fallo del servidor.
- No cambiaron `src/lib/voice/server.ts` ni la ruta add-items desde v419 durante estos últimos trabajos. Pruebas locales Leche nota cacao/chocolate/vainilla pasaron. Comprobación externa del endpoint no fue concluyente (TLS/herramienta), NO contarla como caída.
- Se retiró Mostrar del original; Siri volvió a funcionar en dos pasos. Hubo una prueba que necesitó refresh con Siri superpuesto a Mi Lista.
- Usuario borró la lista larga y advirtió que varios artículos considerados ausentes estaban abajo: NO clasificar todos esos casos como fallos de sincronización.
- Después de desplegar `0d6fd09`, con Mi Lista vacía abierta, Siri -> Agregar a MinderCart -> Leche nota avellana apareció **inmediatamente sin refresh**. Confirmación del usuario. Esto valida ese escenario en su iPhone, no en todos los dispositivos.

## Cambios técnicos relevantes

- v419: micrófono compacto en el mismo renglón del buscador; mismo flujo manual de sugerencias/selección. No reintroducir panel grande ni Revisar productos. Voz dentro de Mi Lista sigue siendo un producto por vez; notas allí se editan con flujo manual/teclado, distinto de Siri.
- v420 parser bilingüe nota/note y siguiente artículo/next item; nombres de catálogo inglés/español; notas literales, sin traducción. Separar notas por marcador explícito, no solo y/and.
- v421 hooks recargan `readState()` en cambios locales para aplicar localización inmediata del nombre, sin cambiar notas.
- Sincronización protege borrados pendientes y variantes por nota/unidad/proveedor (voiceItemIdentity). No restaurar snapshot viejo encima de productos Siri combinados.
- `watchPendingVoiceItems` escucha snapshot confirmado de servidor del workspace individual o familiar. Ahora entrega el payload directamente al merge local, evitando una segunda resolución bootstrap que podía competir con una lectura anterior. Esto es protección implementada, no causa demostrada del fallo de teléfono.
- Respaldo: consulta servidor cada 15 segundos SOLO mientras documento visible, también en focus/visibility; timeout 8 segundos, sin lecturas solapadas, limpieza al desmontar y no aplica respuesta tardía. Conserva ediciones locales; puede añadir hasta cuatro lecturas/minuto visible por suscripción. No prometer consumo cero ni que sea instantáneo siempre.
- Settings distingue iPhone/iPad, Android y desconocido con `src/lib/voice/device-platform.ts`, incluyendo iPad con UA de escritorio. Selector manual disponible; presentación, no seguridad. Siri solo para iOS con sesión; Android solo ayuda teclado; desktop/desconocido solicita elección.
- No integración Android con Assistant/Gemini, no claves Siri para Android. No Android real disponible; NO afirmar validación física. Detección/ramas cubiertas en tests, verificación visual por usuario todavía pendiente.

## Verificaciones y límites

- Builds Next pasaron tras cambios. Tests: `voice-sync-regression.cjs` (incluye respaldo visible, pausa oculto, limpieza, dedup y familia), `voice-english-regression.cjs`, `live-language-regression.cjs`, `voice-device-regression.cjs` pasaron en trabajo técnico reciente.
- Último cambio de enlace/instrucciones compiló y `git diff --check` pasó.
- No hay validación exhaustiva de conflictos simultáneos multi-dispositivo ni consumo Firestore. No confundir el freeze inglés con freeze de HEAD actual: todavía NO se creó tag nuevo para 93544ad.

## Siguiente trabajo, limitado y en orden

1. NO repetir pruebas del usuario que ya fueron confirmadas ni crear más copias. Dos atajos de uso diario y dos plantillas locales están identificados.
2. Prueba de usuario nuevo en otro iPhone y cuenta independiente: instalación desde Settings español, permisos, invocación final sin renombrar, producto con nota, aparición sin refresh, persistencia tras cerrar/abrir. Confirmar cuenta/grupo correcto y ausencia en otra cuenta independiente.
3. Repetir instalación final inglesa en ese dispositivo; next item / siguiente artículo con dos productos y notas separadas. Evitar confundir dictado mal reconocido con bug parser.
4. Verificar Settings iPhone/Android y ambos idiomas usando selector; prueba real Android pendiente si se consigue dispositivo.
5. Tras validaciones, freeze nuevo de testing si usuario lo pide. Luego preparar promoción autorizada y plantillas de PRODUCCIÓN con endpoint correcto; no reutilizar enlaces testing en main.

## Colaboración y lecciones de esta sesión

Usuario trabajó aproximadamente 13:00–21:52 y expresó cansancio y pérdida de confianza por instrucciones repetidas y cambios de nombres. Mantener una acción clara por turno en teléfono. Decir explícitamente cuál copia, por nombre y contenido seguro; jamás pedir foto de clave. Diagnosticar con evidencia, no inferir URL/clave distinta porque un atajo falla. El encabezado vacío fue una diferencia visible concreta.

El usuario pidió flujo sencillo para personas no técnicas: copiar conexión -> instalar -> pegar -> permisos -> usar. No agregar renombrado ni edición de acciones al usuario final. Nunca decir que todo terminó si quedan pruebas independientes pendientes. No usar nuevo dispositivo como excusa para rehacer configuraciones del teléfono actual.

---

---

# ACTUALIZACIÓN AUTORITATIVA v403–v405

## A. ESTADO OFICIAL VIGENTE

### Testing congelado y aprobado

```text
Etiqueta:
mindercart-testing-v405

Commit corto:
e000f15

SHA completo:
e000f1521d09c0b181ce23ce2e3f0ac2e4b03025

Mensaje:
fix: enable mobile scrolling in cart categories v405
```

La rama `testing` y `origin/testing` quedaron sincronizadas en `e000f15`. El usuario confirmó en dispositivo móvil el comportamiento correcto de v403, v404 y v405 antes de cada freeze.

### Puntos congelados recientes

```text
v403
Etiqueta: mindercart-testing-v403
Commit: 7eb258b036fcb510b9809c032d68eec339045a81
Mensaje: fix: improve mobile stability and cloud recovery v403

v404
Etiqueta: mindercart-testing-v404
Commit: e8965a89a4d84ec9b83a96143fccb27f40e1a967
Mensaje: fix: preserve newer local changes during cloud bootstrap v404

v405
Etiqueta: mindercart-testing-v405
Commit: e000f1521d09c0b181ce23ce2e3f0ac2e4b03025
Mensaje: fix: enable mobile scrolling in cart categories v405
```

### Producción actual

```text
Etiqueta:
mindercart-production-v402

Commit main:
bcb9928e1c250f52d9a2e6c5f86dbb4719ae75e8
```

`main` y `origin/main` continúan en producción v402. Los cambios v403–v405 **no se han promovido todavía a main**. Los testers que usan el enlace de producción siguen usando v402 hasta que se autorice la promoción.

### Estado local

```text
Rama activa:
testing

Código:
sincronizado con origin/testing en e000f15

Documento local pendiente:
MINDERCART_CHECKPOINT_HANDOFF.md
```

El handoff se mantiene como documentación local separada. No incluirlo accidentalmente mediante `git add .` ni `git add -A`.

### Siguiente versión disponible

```text
v406
```

No iniciar v406 sin reporte concreto, diagnóstico previo, confirmación del archivo oficial actual y autorización expresa `ok adelante`.

---

## B. HISTORIAL CONFIRMADO v403–v405

### v403 — Auditoría de estabilidad, Firebase y sincronización

Origen:
- durante una demostración de producción v402 la aplicación se congeló varias veces;
- Configuración mostró un proceso o mensaje de espera que impedía avanzar con normalidad;
- se realizó auditoría estática antes de modificar.

Hallazgos confirmados:
- consultas Firebase sin límite de espera;
- `Verificando tu grupo...` podía quedar pendiente indefinidamente;
- búsqueda de invitaciones de grupo ejecutada de forma secuencial por familia;
- serialización completa y repetida del estado en el hilo principal;
- la firma de sincronización contenía prácticamente una copia completa de los datos y duplicaba el respaldo pendiente;
- cada escritura local provocaba una lectura y parseo inmediato del mismo estado.

Cambios implementados:
- límites de espera para autenticación, lectura y escritura Firebase;
- salida controlada de estados de espera;
- consulta de invitaciones procesada en lotes pequeños;
- firma compacta de sincronización compatible con respaldos anteriores;
- el evento local entrega el estado recién escrito y evita releerlo inmediatamente;
- respaldo pendiente conservado si falla temporalmente la nube.

Archivos modificados:

```text
src/app/settings/page.tsx
src/components/mindercart/Shell.tsx
src/lib/firebase/auth-context.tsx
src/lib/firebase/load-user-data.ts
src/lib/firebase/save-user-data.ts
src/lib/firebase/shared-list-actions.ts
src/lib/firebase/operation-timeout.ts
src/lib/mindercart/hooks.ts
src/lib/mindercart/storage.ts
src/lib/mindercart/compact-signature.ts
```

Validación:
- build Next.js 16.1.6 y TypeScript correctos;
- inicio desde onboarding y autenticación correctos;
- navegación por todos los módulos correcta;
- Configuración dejó de bloquearse;
- minimización, regreso y actualización de la aplicación correctos;
- congelado como `mindercart-testing-v403`.

### v404 — Prioridad de cambios locales frente a una copia anterior de Firebase

Reporte reproducido:
- el usuario eliminó varios artículos manualmente de Mi Lista;
- al cambiar rápidamente a Carrito, De Compras, Historial o Configuración, algunos artículos reaparecieron;
- el número se reducía en sucesivos intentos, confirmando una condición de carrera.

Causa confirmada:
- la eliminación local era correcta;
- la sincronización esperaba aproximadamente 900 ms;
- al cambiar de módulo, el bootstrap podía aplicar una copia anterior de Firebase antes de procesar el snapshot local pendiente;
- la nube restauraba temporal o persistentemente artículos ya eliminados.

Corrección:
- antes de aplicar datos de Firebase, el bootstrap revisa el snapshot local pendiente del usuario;
- si el snapshot local es más reciente que `cloudState.updatedAt`, se conserva la información del teléfono;
- posteriormente ese snapshot se sincroniza hacia Firebase;
- la nube ya no puede revivir artículos eliminados mediante una copia anterior.

Archivo modificado:

```text
src/lib/firebase/use-user-bootstrap.ts
```

Validación real:
- se agregaron cuatro artículos;
- se esperó, minimizó y regresó a la aplicación;
- se eliminaron todos;
- se recorrieron inmediatamente Carrito, De Compras, Historial y Configuración;
- al volver a Mi Lista no reapareció ninguno;
- actualización completa y reapertura correctas;
- congelado como `mindercart-testing-v404`.

### v405 — Scroll móvil en las categorías de Carrito

Reporte confirmado:
- al abrir una categoría extensa, por ejemplo `Frutas y Verduras`, el gesto desplazaba el contenido situado detrás de la ventana;
- la lista superior de artículos no podía recorrerse hasta el final.

Causa:
- la capa exterior de categorías usaba `pointerEvents: none`;
- no estaba limitada entre el encabezado de Carrito y las acciones inferiores;
- el contenedor interno no ocupaba explícitamente el espacio flexible disponible.

Corrección:
- medición dinámica del borde inferior del encabezado;
- medición dinámica del borde superior del footer de acciones o navegación inferior;
- overlay limitado al viewport útil y receptor de eventos táctiles;
- tarjeta con altura disponible completa;
- lista interior con `flex: 1`, `minHeight: 0`, `overflowY: auto` y desplazamiento táctil contenido;
- título de categoría y botón `Terminar con esta Categoría` permanecen accesibles.

Archivo modificado:

```text
src/app/general-list/page.tsx
```

Validación real:
- build y TypeScript correctos;
- scroll probado en móvil;
- acceso al final de una categoría extensa confirmado;
- la pantalla de fondo dejó de desplazarse;
- congelado como `mindercart-testing-v405`.

---

## C. ESTADO FUNCIONAL VIGENTE

### Sincronización y persistencia

- Los cambios locales pendientes tienen prioridad sobre una copia cloud anterior.
- Eliminar artículos y cambiar inmediatamente de módulo no debe hacerlos reaparecer.
- Firebase cuenta con límites de espera para evitar estados indefinidos.
- El snapshot pendiente se conserva para reintento ante fallas temporales.
- La firma compacta reduce memoria y duplicación en el teléfono.

### Configuración

- La sesión debe resolver o salir del estado de espera.
- La verificación de grupo tiene límite y acción `Reintentar` en caso de error.
- Los artículos personalizados continúan visibles en Configuración.

### Carrito

- Los artículos personalizados activos forman parte de `itemsMaster` y aparecen dentro de su categoría.
- La ausencia reportada por un tester no se reprodujo en testing v404/v405; el usuario confirmó que sí aparecen.
- `Compras frecuentes` depende del historial, mínimo y ventana temporal definidos en el módulo; un artículo personalizado no entra ahí sólo por ser creado.
- Las categorías extensas cuentan con scroll interno funcional en móvil.
- El contenido situado detrás de la ventana de categoría no debe desplazarse.
- El editor de artículo conserva nota, botones `Regresar / Guardar` y viewport aprobado previamente.

### Mi Lista

- Crear y eliminar artículos actualiza el catálogo y la lista activa.
- Las eliminaciones confirmadas deben persistir al cambiar de módulo, actualizar y reabrir.
- No se modificó el diseño de Mi Lista durante v403–v405.

---

## D. PRUEBAS CRÍTICAS ACUMULADAS v403–v405

### Estabilidad general

1. iniciar sesión;
2. navegar repetidamente entre todos los módulos;
3. entrar varias veces a Configuración;
4. minimizar y regresar;
5. actualizar la página;
6. confirmar ausencia de congelamientos y esperas indefinidas.

### Eliminaciones y prioridad local

1. agregar cuatro artículos;
2. esperar unos segundos;
3. eliminarlos uno por uno;
4. cambiar inmediatamente entre Carrito, De Compras, Historial y Configuración;
5. regresar a Mi Lista;
6. actualizar completamente;
7. cerrar y reabrir;
8. confirmar que ningún artículo eliminado reaparezca.

### Catálogo personalizado

1. crear un artículo con nombre único;
2. asignar categoría;
3. confirmar presencia en Configuración;
4. abrir la categoría correspondiente en Carrito;
5. confirmar que aparezca;
6. recordar que `Compras frecuentes` requiere historial suficiente.

### Scroll de categorías de Carrito

1. abrir `Frutas y Verduras` u otra categoría extensa;
2. desplazarse hasta el último artículo;
3. confirmar que el fondo permanezca inmóvil;
4. marcar y desmarcar artículos;
5. terminar la categoría;
6. repetir con letra normal, grande y extragrande cuando sea posible;
7. repetir en iPhone y Android.

---

## E. RECUPERACIÓN Y VERIFICACIÓN

```bat
git show --no-patch --oneline mindercart-testing-v403
git show --no-patch --oneline mindercart-testing-v404
git show --no-patch --oneline mindercart-testing-v405
git show --no-patch --oneline mindercart-production-v402
```

Resultados esperados:

```text
mindercart-testing-v403 -> 7eb258b
mindercart-testing-v404 -> e8965a8
mindercart-testing-v405 -> e000f15
mindercart-production-v402 -> bcb9928
```

Para restaurar o comparar, usar siempre las etiquetas. Antes de cualquier operación destructiva, respaldar cambios locales y confirmar la rama. Nunca ejecutar `reset --hard` con trabajo local pendiente.

---

## F. ARRANQUE DEL SIGUIENTE CHAT

```text
Fuente oficial actual:
C:\dev\mindercart-web

Testing congelado:
mindercart-testing-v405

Testing commit:
e000f15

Testing SHA completo:
e000f1521d09c0b181ce23ce2e3f0ac2e4b03025

Producción actual:
mindercart-production-v402

Main commit:
bcb9928

Siguiente versión disponible:
v406

Pendiente principal:
- decidir y ejecutar la promoción del bloque probado v403–v405 a main;
- ejecutar build después del merge;
- crear etiqueta de producción correspondiente;
- verificar Vercel Ready y repetir pruebas en mindercart.com;
- continuar registrando reportes reales de beta.

Reglas:
- testers de producción continúan en main v402 hasta promoción explícita;
- diagnosticar antes de modificar;
- usar archivos oficiales actuales del repositorio, no copias temporales;
- no mezclar módulos;
- no tocar MINDERCART_CHECKPOINT_HANDOFF.md en commits de código salvo instrucción expresa;
- entregar ZIP consecutivo en Downloads;
- build, commit, push, prueba real y freeze en ese orden.
```

---

# ACTUALIZACIÓN AUTORITATIVA ANTERIOR v394–v402

La sección siguiente se conserva íntegramente como registro del estado anterior. Sus referencias a v402 como estado vigente fueron sustituidas por la actualización autoritativa v403–v405 anterior.


## A. ESTADO OFICIAL VIGENTE

### Testing congelado

```text
Etiqueta:
mindercart-testing-v402

Commit corto:
9e0bb0e

SHA completo:
9e0bb0e2a2ea99275e21b9334ad0641d6dfdc263
```

La rama `testing` y `origin/testing` apuntan al mismo commit `9e0bb0e`.

### Producción actual

```text
Etiqueta:
mindercart-production-v402

Commit de integración en main:
bcb9928

SHA completo:
bcb9928e1c250f52d9a2e6c5f86dbb4719ae75e8
```

La rama `main` y `origin/main` apuntan al mismo commit `bcb9928`.

La promoción se realizó mediante merge no fast-forward:

```text
merge: promote v402 to main
```

El build local de producción terminó correctamente después del merge:

```text
Next.js 16.1.6
Compiled successfully
TypeScript terminado correctamente
Rutas dinámicas generadas correctamente
```

El push de `main` y la etiqueta `mindercart-production-v402` quedaron confirmados. La confirmación visual posterior de Vercel en estado `Ready` y la repetición final de los flujos en `mindercart.com` deben registrarse por separado; no afirmarlas sin evidencia.

### Estado local al cerrar v402

```text
Rama activa:
testing

testing:
sincronizada con origin/testing

main:
sincronizada con origin/main

Documento local pendiente:
MINDERCART_CHECKPOINT_HANDOFF.md
```

El archivo de handoff se mantiene como documentación local separada y no se mezcla automáticamente con commits de código.

### Siguiente versión disponible

```text
v403
```

No iniciar `v403` sin un reporte concreto, diagnóstico previo, archivo actual exacto y autorización `ok adelante`.

---

## B. HISTORIAL CONFIRMADO v394–v402

### v394 — Nota arriba en el editor de Mi Lista

```text
Commit:
c1b1437d836b3838351eea1df59ade4ff2034b8c

Mensaje:
ux: move item note field to top v394
```

- Se movió `Nota o preferencia (opcional)` al primer campo del modal del artículo.
- El objetivo fue mantener visible el dato prioritario incluso con texto grande en iPhone.
- Archivo afectado: `src/app/page.tsx`.

### v395 — Accesibilidad inicial del modal en iPhone

```text
Commit:
131548186b8fdf0527c642673e1264eccd810e53

Mensaje:
fix: keep item modal accessible on iPhone v395
```

- El modal del artículo pasó a renderizarse mediante portal.
- Esta versión resolvió accesibilidad básica, pero colocó el modal por encima de las franjas azules y fue reemplazada por v396.

### v396 — Modal de Mi Lista dentro del viewport útil

```text
Commit:
2d6e4cabfede49c3540c6bb9b9739aaf1f33d6ec

Mensaje:
fix: keep item modal within app viewport v396
```

- El modal de Mi Lista se limitó dinámicamente entre el encabezado completo y la navegación inferior.
- Se conservaron visibles las dos franjas azules.
- Se mantuvo scroll interno para pantallas pequeñas y escalas de letra mayores.
- El usuario confirmó el comportamiento correcto en testing.

### v397 — Intento intermedio en Mis Listas, reemplazado

```text
Commit:
6ebb28440504e550db02fe332e5f7921a48d4fad

Mensaje:
fix: keep saved-list item modal below header v397
```

- Intentó usar la primera tarjeta blanca del editor como referencia vertical.
- Esa referencia no correspondía al borde inferior real de la segunda franja azul.
- No resolvió visualmente el problema y no debe reutilizarse como patrón.
- Fue corregido y reemplazado por v398.

### v398 — Modal de Mis Listas debajo de la segunda franja azul

```text
Commit:
960c3d4f216e42dba0d4b25b6148a1537ce1cc85

Etiqueta:
mindercart-testing-v398

Mensaje:
fix: anchor saved-list modal below second header band v398
```

- El modal de edición dentro de Mis Listas toma directamente el borde inferior del segundo bloque del encabezado.
- Se eliminó la referencia equivocada a la tarjeta blanca.
- Mi Lista conservó su cálculo independiente.
- El usuario confirmó el resultado en testing.

### v399 — Nota editable y viewport dinámico en Carrito

```text
Commit:
82e27217832e87cf095daae5e677f4af9dee4283

Mensaje:
fix: add note and fit cart item editor v399
```

- Se agregó `Nota o preferencia (opcional)` como primer campo del editor de Carrito.
- La nota se carga al editar, puede modificarse y se guarda nuevamente con el artículo.
- Se sustituyeron offsets fijos por medición dinámica del borde inferior de la segunda franja azul y del borde superior de la navegación inferior.
- Se conservó scroll interno con letra normal y grande.
- Archivo afectado: `src/app/general-list/page.tsx`.

### v400 — Editor de Carrito más compacto y botones uniformes

```text
Commit:
396cdaff5a1b3cd43433b641980169f9ea3438af

Mensaje:
style: compact cart item editor v400
```

- Se eliminó la frase explicativa redundante debajo del nombre del artículo.
- El encabezado quedó más compacto.
- Los botones inferiores adoptaron las proporciones aprobadas de Mi Lista.
- Botón izquierdo: `Regresar`, fondo blanco.
- Botón derecho: `Guardar`, fondo azul.

### v401 — Eliminación del botón Cerrar en Carrito

```text
Commit:
c099e19fd3d64683b3f974ca380b89687e0f4d19

Mensaje:
style: remove redundant cart close button v401
```

- Se eliminó únicamente el botón superior `Cerrar`.
- `Regresar` conserva la salida sin guardar.
- `Guardar` conserva la actualización del artículo.
- El diff confirmado fue de 16 líneas eliminadas y ningún otro cambio.

### v402 — Texto general y botón Guardar en Mi Lista

```text
Commit testing:
9e0bb0e2a2ea99275e21b9334ad0641d6dfdc263

Etiqueta testing:
mindercart-testing-v402

Commit main:
bcb9928e1c250f52d9a2e6c5f86dbb4719ae75e8

Etiqueta producción:
mindercart-production-v402
```

- La frase específica `No está en la lista. Puedes agregarlo.` fue reemplazada por una frase válida tanto al crear como al editar:

```text
ES: Completa o ajusta el artículo según tus necesidades.
EN: Complete or adjust the item to suit your needs.
```

- El botón derecho del modal cambió de `Agregar / Add` a `Guardar / Save`.
- No se modificaron campos, posición, persistencia ni lógica de confirmación.
- El usuario confirmó el resultado en testing.
- Se congeló testing y se promovió el bloque completo a main.

---

## C. ESTADO FUNCIONAL ACTUALIZADO DE LOS MÓDULOS TOCADOS

### Mi Lista

- Nota o preferencia aparece como primer campo del editor.
- El mismo modal sirve para crear y editar artículos.
- Texto de apoyo general aprobado en español e inglés.
- Botones inferiores uniformes: `Regresar` y `Guardar`.
- Modal limitado dinámicamente debajo de las dos franjas azules y por encima de la navegación inferior.
- Scroll interno disponible en pantallas pequeñas y con letra grande.

### Mis Listas

- El modal del artículo comienza debajo del borde inferior real de la segunda franja azul.
- Las dos franjas azules permanecen visibles.
- El cálculo de Mis Listas está separado del comportamiento de Mi Lista.
- No reutilizar la referencia intermedia de v397 basada en una tarjeta del contenido.

### Carrito

- Nota o preferencia aparece como primer campo al editar un artículo.
- La nota existente se carga y los cambios se guardan.
- El modal comienza debajo de la segunda franja azul y termina antes de la navegación inferior.
- Scroll interno disponible.
- Encabezado compacto sin frase redundante ni botón `Cerrar`.
- Botones inferiores: `Regresar` en blanco y `Guardar` en azul, con las mismas proporciones de Mi Lista.

---

## D. ARCHIVOS DELICADOS MODIFICADOS EN v394–v402

```text
src/app/page.tsx
src/app/general-list/page.tsx
```

Para el próximo cambio:

1. confirmar si ocurre en Mi Lista, Mis Listas o Carrito;
2. solicitar el archivo actual exacto;
3. comparar hash con la rama activa;
4. diagnosticar antes de modificar;
5. declarar qué se tocará y qué quedará intacto;
6. esperar `ok adelante`;
7. entregar ZIP consecutivo con la ruta interna correcta;
8. ejecutar build, diff, commit y push;
9. probar en dispositivo real;
10. congelar únicamente después de confirmación del usuario.

No modificar simultáneamente Mi Lista y Mis Listas solo porque comparten `src/app/page.tsx`. Cada cambio debe quedar condicionado al módulo solicitado.

---

## E. PRUEBAS CRÍTICAS NUEVAS

### Modal de Mi Lista

- agregar artículo nuevo;
- editar artículo existente;
- confirmar frase general en ambos casos;
- confirmar botón `Guardar` en ambos casos;
- verificar nota como primer campo;
- confirmar las dos franjas azules visibles;
- verificar `Regresar` y `Guardar`;
- repetir con letra normal, grande y extragrande;
- repetir en iPhone y Android;
- repetir en español e inglés.

### Modal de Mis Listas

- abrir una lista guardada;
- agregar o editar un artículo;
- confirmar que el modal comienza debajo de la segunda franja azul;
- confirmar que Mi Lista no cambia;
- verificar scroll y botones con letra normal y grande.

### Editor de Carrito

- abrir artículo con nota;
- editar la nota;
- guardar;
- volver a abrir y confirmar persistencia;
- verificar `Regresar` sin guardar;
- confirmar ausencia de la frase redundante;
- confirmar ausencia del botón `Cerrar`;
- confirmar botones iguales en proporción;
- confirmar franjas azules visibles;
- comprobar scroll completo y navegación inferior visible;
- repetir en español, inglés, iPhone, Android y escalas de fuente disponibles.

---

## F. RECUPERACIÓN Y VERIFICACIÓN v402

### Verificar referencias sin modificar archivos

```bat
git rev-parse mindercart-testing-v402^{}
git rev-parse mindercart-production-v402^{}
git show --no-patch --oneline mindercart-testing-v402
git show --no-patch --oneline mindercart-production-v402
```

Resultados esperados:

```text
testing v402:
9e0bb0e2a2ea99275e21b9334ad0641d6dfdc263

production v402:
bcb9928e1c250f52d9a2e6c5f86dbb4719ae75e8
```

Antes de cualquier restauración destructiva, guardar o respaldar cambios locales y confirmar la rama exacta. No ejecutar `reset --hard` con trabajo local pendiente.

### Punto intermedio adicional

```text
mindercart-testing-v398
960c3d4f216e42dba0d4b25b6148a1537ce1cc85
```

Este punto conserva la corrección aprobada de Mis Listas antes de los cambios posteriores de Carrito y copy de Mi Lista.

---

## G. ARRANQUE DEL SIGUIENTE CHAT

```text
Trabajaremos desde:

testing freeze:
mindercart-testing-v402

testing commit:
9e0bb0e

testing SHA completo:
9e0bb0e2a2ea99275e21b9334ad0641d6dfdc263

production release:
mindercart-production-v402

main commit:
bcb9928

main SHA completo:
bcb9928e1c250f52d9a2e6c5f86dbb4719ae75e8

siguiente versión disponible:
v403

v394–v402 cerraron:
- nota como primer campo en Mi Lista;
- modal de Mi Lista dentro del viewport útil;
- modal de Mis Listas debajo de la segunda franja azul;
- nota editable en Carrito;
- modal de Carrito entre header y navegación inferior;
- encabezado compacto de Carrito;
- botones Regresar / Guardar uniformes;
- eliminación del botón Cerrar redundante;
- frase general de creación/edición en Mi Lista;
- botón Guardar en Mi Lista;
- build aprobado;
- freeze de testing;
- promoción a main;
- etiqueta de producción.

Pendiente:
- confirmar Vercel main v402 Ready;
- repetir Mi Lista, Mis Listas y Carrito en mindercart.com;
- continuar beta privada y registrar reportes reales.

Testers reales:
usan main.

Primero diagnóstico.
Usar únicamente archivos actuales exactos.
No ZIP sin “ok adelante”.
No mezclar módulos.
```

---

# HISTORIAL ACUMULADO HASTA v393

La sección siguiente se conserva íntegra como registro histórico. Sus campos de “estado actual”, “siguiente versión” y “punto estable” fueron sustituidos por la actualización autoritativa v402 anterior.

---

# 1. ESTADO OFICIAL ACTUAL

## Base estable en testing

```text
mindercart-testing-freeze-v393
```

Este freeze es acumulativo e incluye toda la base anterior, la protección contra el ciclo de Mis Listas de `v387`, la deduplicación de bootstrap de `v388`, la deduplicación de guardados cloud de `v389`, la accesibilidad del onboarding móvil de `v390`, la confirmación al abandonar una lista nueva sin guardar de `v391`–`v392` y el cierre de sesión seguro con espera cloud limitada de `v393`.

## Release actual en main

```text
mindercart-main-release-v393
```

`main` fue actualizado mediante merge desde `testing` después de validar en el deployment correcto de `testing` la protección de listas nuevas y el cierre de sesión seguro de `v393`. El build y TypeScript del merge quedaron aprobados. La confirmación final del deployment `Ready` de `main v393` todavía debe registrarse antes de afirmarla.

## Estado confirmado por el usuario

- `v381`–`v383` cerraron la landing pública, el Google Form y el soporte.
- `v384` creó la Política de Privacidad pública bilingüe.
- `v385` creó los Términos de Uso públicos bilingües.
- La beta privada comenzó a recibir testers reales.
- Un tester reportó que Mi Lista mostraba éxito al agregar `Jitomate`, pero el artículo no aparecía.
- Se diagnosticó una regresión entre la identidad anticipada de artículos personalizados y la protección `missing_custom_item`.
- `v386` permite una identidad determinística nueva únicamente en captura directa.
- `v386` conserva la protección para referencias inválidas provenientes de listas guardadas.
- Mi Lista ya no muestra éxito cuando storage devuelve `added: false`.
- La corrección fue validada en navegador de computadora.
- La corrección fue validada en iPhone usando el deployment correcto de `testing`.
- El build de producción quedó aprobado.
- TypeScript quedó aprobado.
- Se creó y publicó `mindercart-testing-freeze-v386`.
- Se promovió `testing` a `main`.
- Se creó y publicó `mindercart-main-release-v386`.
- Los testers reales usan `main`.
- El alias antiguo `e-testing.vercel.app` devolvió `DEPLOYMENT_NOT_FOUND`; no usarlo como URL de prueba.
- Para pruebas de `testing`, usar la URL vigente mostrada dentro del deployment de Vercel.
- Un tester con más de 200 artículos personalizados reportó que no podía entrar a sus listas guardadas.
- Se diagnosticó un ciclo de sincronización entre `syncSavedListItemsToCatalog()`, `writeState()`, `CHANGE_EVENT` y la recarga de Mis Listas.
- `v387` evita escribir y emitir `CHANGE_EVENT` cuando el catálogo final es idéntico al estado original.
- El tester afectado confirmó en el deployment correcto de `testing` que volvió a ver sus listas.
- El build de producción y TypeScript quedaron aprobados para `v387`.
- Se creó y publicó `mindercart-testing-freeze-v387`.
- Se promovió `testing` a `main`.
- Se creó y publicó `mindercart-main-release-v387`.
- La confirmación del deployment `Ready` y la repetición final del caso en `main` no quedaron pegadas en el chat; no afirmarlas sin evidencia posterior.
- Se reportó una congelación perceptible al iniciar y cerrar sesión durante pruebas repetidas.
- `v388` deduplica resoluciones de bootstrap simultáneas para el mismo usuario.
- El login quedó rápido y restauró correctamente idioma, artículos personalizados y Mis Listas.
- Al cambiar idioma y cerrar sesión inmediatamente todavía se observó una espera superior a 25 segundos.
- Se diagnosticó superposición entre el guardado automático de `Shell.tsx` y el guardado obligatorio de logout.
- `v389` deduplica guardados cloud idénticos que están simultáneamente en curso.
- Se conserva el guardado seguro previo al logout y la protección contra pérdida de datos.
- El usuario confirmó que login/logout funcionan mejor en `testing`.
- El deployment de `testing` correspondiente a `d5aab83` quedó `Ready`.
- Build y TypeScript quedaron aprobados para `v388`, `v389` y el merge a `main`.
- Se creó y publicó `mindercart-testing-freeze-v389`.
- Se promovió `testing` a `main`.
- Se creó y publicó `mindercart-main-release-v389`.
- El deployment de `main` correspondiente a `48ace74` quedó confirmado como `Ready`.
- Una tester que usa `main` como invitada quedó bloqueada por el onboarding: con letra grande, el botón `Empezar` quedaba detrás de la navegación inferior.
- Se confirmó que el problema no dependía de login ni de datos de usuario, sino de la ubicación del modal dentro del contenedor desplazable de `Mi Lista` frente a la navegación fija del layout.
- `v390` importa `createPortal` desde `react-dom` y renderiza únicamente el onboarding directamente en `document.body`.
- `v390` no modifica textos, login, storage, listas ni ningún otro modal.
- Build de producción y TypeScript quedaron aprobados para `v390` y para el merge a `main`.
- El deployment de `testing` correspondiente a `b5444f7` quedó `Ready`.
- La corrección se validó en un iPhone real usando el dominio individual del deployment en navegación privada.
- La tester confirmó que la bienvenida apareció por encima de toda la interfaz y que pudo presionar `Empezar`.
- Se creó y publicó `mindercart-testing-freeze-v390`.
- Se promovió `testing` a `main` mediante el merge `8a3fc5e`.
- Se creó y publicó `mindercart-main-release-v390`.
- La confirmación final del deployment `Ready` de `main v390` y la repetición del caso en el dominio principal quedaron pendientes al cerrar este documento; no afirmarlas sin evidencia posterior.
- Al crear una lista personalizada nueva, el enlace `Regresar a Mis Listas` descartaba el nombre y los artículos sin advertencia.
- `v391` agrega confirmación únicamente cuando una lista nueva contiene nombre o artículos sin guardar.
- Una lista nueva completamente vacía puede cerrarse sin confirmación.
- `v392` mejora la redacción bilingüe y separa visualmente la pregunta de la advertencia.
- El usuario validó en `testing` que cancelar conserva el borrador y aceptar descarta la lista.
- Durante pruebas repetidas de idioma y cuentas se volvió a observar una espera larga al cerrar sesión.
- Se confirmó que `v389` deduplica guardados idénticos, pero no limita una petición cloud individual lenta.
- `v393` crea antes del logout un snapshot local compatible con la recuperación de sincronización pendiente de `Shell.tsx`.
- `v393` limita a 6 segundos la espera visible del guardado cloud cuando existe ese respaldo recuperable.
- Si el navegador no puede crear el respaldo, se conserva el comportamiento seguro anterior y se espera el guardado completo.
- El usuario confirmó en `testing` que cambio de idioma, logout, login y restauración de datos funcionaron correctamente.
- Build y TypeScript quedaron aprobados para `v391`, `v392`, `v393` y el merge a `main`.
- Se creó y publicó `mindercart-testing-freeze-v393`.
- Se promovió `testing` a `main` mediante el merge `5866770`.
- Se creó y publicó `mindercart-main-release-v393`.
- La confirmación final del deployment `Ready` de `main v393` está pendiente; no afirmarla sin evidencia posterior.

## SHAs confirmados

```text
v381 testing:
1a4fa0f

v382 testing:
a614ec9

v383 testing:
88b7202

v384 testing:
3068d2b

v385 testing:
01fff55

v386 testing:
e67cc87

testing freeze v386:
e67cc87428365291b15c6af1c11afbcfa8b4356b

main release merge v386:
d9cfe8e

v387 testing:
c364f27

testing freeze v387:
c364f27a61cb7f618b511d4a02a5d734e2eb6760

main release merge v387:
b40ab5a832ec7db1bf6e18e15a0e26846a896a6b

v388 testing:
3920807

v388 testing SHA completo:
392080739982efd1450ab1cf4e6730dd8e6642b9

v389 testing:
d5aab83

testing freeze v389:
d5aab83ff8a5ae37eddcc312fb79527c6b07767d

main release merge v389:
48ace7479bf03e5ae1c4850b3859d0eee4209ad0

v390 testing:
b5444f7

testing freeze v390:
b5444f7b81d9a52555839cc8c6c3a361111c82ee

main release merge v390:
8a3fc5e9eb64c6e1c02e9e0a9fa934e421677376

v391 testing:
58f4732

v392 testing:
db98264

v393 testing:
1a6a4fd

testing freeze v393:
1a6a4fdd46444b70b08421b66ac5996605aae716

main release merge v393:
5866770e4b75a088a2978c1de0d7b8677dfd74ed
```

El SHA completo del merge/release de `main v386` no quedó pegado en el chat.

No inventarlo.

Ramas confirmadas:

```text
testing:
1a6a4fd

mindercart-testing-freeze-v393:
1a6a4fdd46444b70b08421b66ac5996605aae716

main:
5866770

mindercart-main-release-v393:
5866770e4b75a088a2978c1de0d7b8677dfd74ed
```

## Estado local al cerrar el bloque

```text
Rama activa:
testing

Código:
/src sincronizado con origin/testing

Documento pendiente local:
MINDERCART_CHECKPOINT_HANDOFF.md
```

El handoff se maneja como documentación separada; no mezclarlo con parches de código.

# 2. COMANDOS PARA VOLVER AL PUNTO ESTABLE

## Restaurar testing exactamente a v393

```bat
git checkout testing
git reset --hard mindercart-testing-freeze-v393
rmdir /s /q .next
npm run build
```

## Restaurar main exactamente al release v393

```bat
git checkout main
git reset --hard mindercart-main-release-v393
rmdir /s /q .next
npm run build
```

## Verificar ramas remotas y SHAs

```bat
git branch -a
git ls-remote --heads origin mindercart-testing-freeze-v393
git ls-remote --heads origin mindercart-main-release-v393
git rev-parse --short mindercart-testing-freeze-v393
git rev-parse --short mindercart-main-release-v393
```

Resultados esperados:

```text
mindercart-testing-freeze-v393:
1a6a4fdd46444b70b08421b66ac5996605aae716

mindercart-main-release-v393:
5866770e4b75a088a2978c1de0d7b8677dfd74ed
```

## Vercel

Los testers usan el deployment de `main`.

Para pruebas de `testing`:

- abrir el deployment correspondiente al commit deseado;
- confirmar estado `Ready`;
- copiar la URL desde `Visit` o desde `Domains`;
- no reutilizar aliases que devuelvan `DEPLOYMENT_NOT_FOUND`;
- un refresh no puede reparar un alias roto.

# 3. SIGUIENTE VERSIÓN DISPONIBLE

```text
v394
```

`v394` queda disponible para la siguiente corrección aprobada basada en uso real de testers.

No iniciar `v394` por anticipación ni para agregar funciones nuevas.

Antes de cualquier cambio de código:

```bat
git checkout testing
git status
git pull --ff-only origin testing
```

La base correcta debe mostrar:

```text
testing:
1a6a4fd o un commit documental posterior que no modifique /src
```

Después:

1. reproducir el problema;
2. confirmar la URL/deployment probado;
3. localizar el bloque exacto;
4. subir los archivos actuales exactos;
5. diagnóstico;
6. esperar `ok adelante`.

# 4. SIGUIENTE BLOQUE OFICIAL DE TRABAJO

La landing, el formulario, el soporte, Privacidad y Términos quedaron cerrados en `v381`–`v385`.

La beta privada está en operación y `v386`–`v393` cerraron problemas reales de captura, Mis Listas, onboarding y rendimiento de autenticación/sincronización.

El siguiente bloque recomendado es:

```text
Continuar la beta privada con observación controlada
```

## Objetivos inmediatos

- confirmar que los testers de `main` reciben `v387`;
- repetir la prueba de artículos personalizados:
  - agregar;
  - refresh;
  - eliminar;
  - volver a agregar;
- registrar cada reporte con:
  - dispositivo;
  - idioma;
  - URL utilizada;
  - versión/deployment;
  - pasos exactos;
  - resultado esperado;
  - resultado real;
  - captura;
- revisar solicitudes del Google Form;
- seleccionar la primera cohorte operativa;
- usar la hoja maestra de testers;
- enviar aceptación, espera y seguimiento;
- preparar feedback después de cada compra;
- completar tres compras reales por hogar;
- priorizar bloqueadores y regresiones antes de ideas nuevas.

## Recursos operativos ya preparados

```text
Formulario de captación:
https://forms.gle/hBYo5seaTRWJS47v6

Soporte:
mindercartapp@gmail.com

Starter Kit:
MinderCart_Beta_Tester_Starter_Kit.xlsx
```

El Starter Kit incluye:

- Dashboard;
- tabla de testers;
- mensajes WhatsApp en español e inglés;
- plan operativo de beta.

## Regla de producción y pruebas

```text
Testers reales:
main

Diagnóstico previo:
testing
```

No confundir:

- URL individual de deployment;
- URL estable de rama;
- dominio/alias de producción.

## Lo que no debe mezclarse todavía

- billing;
- precios definitivos;
- voz;
- Siri;
- Alexa;
- smartwatch;
- rediseño grande;
- cambios no relacionados con reportes reales;
- promesa de colaboración Familiar completamente conflict-safe.

## Pendiente técnico-comercial

Todavía falta una matriz formal de conflictos simultáneos multi-dispositivo antes de prometer colaboración Familiar completamente conflict-safe.

Este pendiente no bloquea la beta privada controlada.

# 5. PLAN OFICIAL DE CORTO PLAZO

Orden actualizado:

1. Completar Nota por ocurrencia en Mis Listas.
2. Implementar Modo De Compras Compacto.
3. Corregir persistencia, restore e identidad de Mis Listas.
4. Implementar onboarding bilingüe de primera visita.
5. Implementar landing bilingüe y solicitud de beta.
6. Publicar Política de Privacidad.
7. Publicar Términos de Uso.
8. Preparar y ejecutar beta privada con medición.
9. Corregir problemas reales detectados durante la beta.
10. Completar matriz formal multi-dispositivo y probar planes Individual/Familiar.
11. Implementar billing únicamente después de validar disposición de pago.

## Estado del plan

### Pasos 1–7

```text
COMPLETADOS
```

### Paso 8 — Beta privada

```text
EN CURSO
```

Completado:

- landing;
- formulario;
- privacidad;
- términos;
- soporte;
- infocard de captación;
- mensajes de WhatsApp;
- Starter Kit en Excel;
- tabla maestra de testers;
- plan por cohortes;
- primeras invitaciones y testers reales.

Pendiente:

- seleccionar 15–25 hogares totales;
- iniciar primera cohorte formal de 8–10;
- formulario de feedback por compra;
- completar tres compras reales;
- consolidar métricas.

### Paso 9 — Correcciones basadas en beta

```text
EN CURSO
```

Correcciones cerradas:

```text
v386 — captura directa de artículo personalizado
v387 — ciclo de sincronización al abrir Mis Listas con catálogo grande
v388 — deduplicación de bootstrap simultáneo
v389 — deduplicación de guardados cloud simultáneos
v390 — onboarding móvil por encima de la navegación fija
```

No convertir cada sugerencia en nueva función.

Prioridad:

1. pérdida de datos;
2. falso mensaje de éxito;
3. flujo principal bloqueado;
4. regresión;
5. confusión repetida;
6. mejora futura.

### Paso 10 — Validación de planes y colaboración

```text
PENDIENTE
```

### Paso 11 — Billing

```text
PENDIENTE
```

No construir billing antes de validar uso, retención y disposición real de pago.

# 6. HITO DE MARCA

## MinderCart™

Fecha importante:

```text
22 de junio de 2026
```

Serial Number USPTO:

```text
99898962
```

MinderCart pasó de concepto a solicitud oficial ante la USPTO.

Esto debe influir en decisiones futuras:

- menos experimento visual;
- más claridad;
- más consistencia;
- más sensación de producto serio;
- evitar regresiones de idioma, persistencia o identidad;
- mantener la marca limpia en header, PDF, WhatsApp y landing.

Mensajes aprobados:

```text
EN: Never forget what to buy
ES: Nunca olvides qué comprar
```

Mensaje de apoyo:

```text
Add what you need in seconds, anytime, anywhere.
```

---

# 7. PRINCIPIO CENTRAL DE PRODUCTO

MinderCart debe combinar:

```text
la rapidez y claridad de una lista de papel
+
la memoria, automatización, reutilización y colaboración de una app
```

La lista de papel sigue siendo un competidor real porque:

- es compacta;
- muestra muchos renglones;
- se consulta de un vistazo;
- no exige navegar;
- funciona bien durante la compra.

MinderCart debe superar al papel sin perder su densidad y claridad.

---

# 8. REGLAS OFICIALES DE GRUPO

Regla principal:

```text
una cuenta = un solo contexto de grupo
```

Estados permitidos:

- individual, sin grupo;
- titular de un grupo;
- integrante de un grupo.

Si una persona necesita otro grupo para otro contexto, por ejemplo familia y negocio, debe usar otra cuenta con otro correo/usuario.

Por ahora:

- no se soportan múltiples grupos por cuenta;
- no reabrir esta decisión sin una razón fuerte;
- no añadir roles avanzados;
- no añadir permisos complejos;
- no añadir billing grupal antes de validar el modelo.

---

# 9. ESTADO FUNCIONAL GENERAL

## De Compras

Funciona:

- categorías según idioma;
- agrupación por tienda;
- artículos pendientes y comprados;
- marcar y desmarcar;
- mover de tienda;
- mover a Para Después;
- eliminar;
- agregar artículos durante la compra;
- notas por ocurrencia;
- origen de lista;
- WhatsApp;
- PDF;
- finalizar compra;
- envío a historial;
- vista compacta;
- escala de fuente;
- título PDF bilingüe.

## Mi Lista

Funciona:

- captura principal `Necesito / I need`;
- artículos normales;
- artículos provenientes de Mis Listas;
- convivencia de ocurrencias separadas;
- cantidades;
- unidades;
- tiendas;
- notas;
- protección contra doble eliminación;
- agregado masivo optimizado;
- persistencia después de recarga;
- captura directa de artículos personalizados nuevos desde el primer intento;
- validación real del resultado de storage antes de mostrar éxito;
- ausencia de mensaje verde falso cuando una operación es rechazada.

## Mis Listas

Funciona:

- crear;
- editar;
- renombrar;
- borrar;
- abrir;
- selección individual;
- seleccionar todos;
- agregar seleccionados a Mi Lista;
- listas grandes;
- origen `sourceListName`;
- nota por ocurrencia;
- identidad exacta por ocurrencia;
- compatibilidad con listas antiguas sin nota;
- vista compacta al abrir una lista;
- sincronización de cambios mediante `CHANGE_EVENT`;
- relectura entre pestañas mediante `storage`;
- restore cloud después de logout/login;
- cambios pendientes protegidos frente a refresh;
- eliminación con refresh inmediato;
- identidad bilingüe por `itemKey`;
- compatibilidad `Leche / Milk`;
- identidad estable de artículos personalizados desde el primer intento;
- compatibilidad con listas antiguas sin `itemKey`.

## Carrito

Funciona:

- artículos por categoría;
- orden alfabético;
- origen de lista;
- notas;
- diferencias entre artículo normal y artículo proveniente de una lista;
- acciones para completar categorías;
- posición ajustada para no quedar oculta por el footer.

## Historial

Funciona:

- abrir compra pasada;
- ver fecha y tienda;
- ver artículos;
- notas por ocurrencia;
- comprar de nuevo;
- selección parcial;
- recompra completa;
- evitar duplicados conforme a identidad de ocurrencia;
- confirmación antes de recompra completa;
- Compras frecuentes.

## Configuración

Funciona:

- cuenta;
- login;
- logout;
- recuperación de contraseña;
- idioma;
- tienda preferida;
- tamaño de fuente;
- perfiles de tienda;
- artículos personalizados;
- grupo;
- invitaciones;
- miembros;
- migración local inicial.

## Shell / navegación

Aprobado:

- primera franja azul limpia;
- logo;
- MinderCart;
- tagline;
- menú;
- segunda franja azul del módulo sin cambios no autorizados;
- grupo/rol dentro de Settings y menú hamburguesa;
- footer azul;
- contador del carrito;
- carrito superior removido del header.

## Onboarding

Funciona:

- primera visita por navegador/dispositivo;
- aparición después de hidratación;
- soporte para invitado y usuario autenticado;
- español e inglés;
- fondo bloqueado mientras está abierto;
- prioridad visual sobre la navegación inferior;
- botón `Empezar / Get started`;
- persistencia local de completado;
- contenido aprobado sobre captura rápida, creación y reutilización de listas y compra más rápida por categoría.


## Landing pública / beta

Funciona:

- ruta pública `/beta`;
- diseño responsive;
- inglés y español;
- selector de idioma;
- logo real de MinderCart;
- propuesta de valor;
- tres beneficios centrales;
- explicación de Mi Lista, Mis Listas y De Compras;
- simulación visual de lista por categoría;
- scroll en computadora y teléfono;
- navegación inferior oculta únicamente en `/beta`;
- CTA de solicitud de beta;
- Google Form público;
- soporte visible;
- botón para copiar `mindercartapp@gmail.com`;
- Privacidad activa;
- Términos activo.

## Política de Privacidad

Funciona:

- ruta pública `/privacy`;
- inglés y español;
- selector de idioma;
- logo y marca MinderCart;
- enlace para volver a `/beta`;
- explicación de información de cuenta;
- explicación del contenido de listas y preferencias;
- almacenamiento local;
- sincronización mediante Firebase;
- información del formulario de beta;
- listas compartidas;
- retención y eliminación;
- seguridad;
- derechos y solicitudes;
- menores de 13 años;
- contacto de soporte;
- botón para copiar `mindercartapp@gmail.com`;
- scroll en computadora y teléfono;
- navegación inferior oculta únicamente en `/privacy`.

## Términos de Uso

Funciona:

- ruta pública `/terms`;
- inglés y español;
- selector de idioma;
- logo y marca MinderCart™;
- enlace para volver a `/beta`;
- aceptación de los Términos;
- elegibilidad;
- beta privada;
- cuentas y seguridad;
- uso permitido;
- conductas prohibidas;
- contenido del usuario;
- grupos y listas compartidas;
- servicios de terceros;
- propiedad intelectual;
- solicitud federal de marca pendiente;
- reseñas honestas;
- disponibilidad y cambios;
- suspensión y terminación;
- exclusión de garantías;
- limitación de responsabilidad;
- contacto de soporte;
- botón para copiar `mindercartapp@gmail.com`;
- scroll completo;
- navegación inferior oculta únicamente en `/terms`.

---

# 10. HISTORIAL DE VERSIONES RELEVANTE

## v338

Restauración quirúrgica de lógica familiar/grupal sobre base moderna.

Archivo principal:

```text
src/app/settings/page.tsx
```

Objetivos:

- invitación pendiente;
- aceptar invitación;
- quitar integrante;
- recuperar flujo grupal sin rehacer Settings.

## v340

Build fix de Settings al quitar dependencia de exports inexistentes en `storage.ts`.

## v341

Restauración de visualización de artículos personalizados basada en `itemsMaster`.

## v342

Type fix del seed para artículos personalizados.

Freeze:

```text
mindercart-testing-freeze-v342
```

Commit:

```text
f0c36ed
```

## v343

Ajuste de hidratación para artículos personalizados.

Resultado:

- ya no requieren varios refresh;
- freeze `mindercart-testing-freeze-v343`;
- commit `c19415f`;
- main release `mindercart-main-release-v343`;
- main commit `731916e`.

## v344

Pulido de copy para nombre del grupo.

## v345

Reconocimiento de miembro activo.

El integrante dejó de ver acciones exclusivas del titular.

## v346

Claridad final del estado de grupo en Settings.

Resultado:

- evita estado falso inicial;
- elimina error técnico crudo;
- distingue titular e integrante;
- freeze `mindercart-testing-freeze-v346`;
- commit `e5eb735`;
- main release `mindercart-main-release-v346`;
- main commit `1974889`.

## v347

Experimento de grupo/rol en la primera franja azul.

Resultado:

```text
RECHAZADO
```

No usar como base.

## v348

Reversión conceptual de v347.

Decisión:

```text
mantener la primera franja azul limpia
```

## v349

Primer intento de grupo/rol dentro del menú hamburguesa.

Dirección correcta, copy/layout intermedios.

## v350

Type fix del Shell.

## v351

Bloque aprobado de grupo/rol en menú hamburguesa.

Freeze:

```text
mindercart-testing-freeze-v351
```

Commit:

```text
869152b
```

Main release:

```text
mindercart-main-release-v351
```

Main commit:

```text
48ad87a
```

## v352

Persistencia inmediata del idioma desde Settings.

El idioma dejó de depender de un submit oculto.

## v353

Logout conserva:

- idioma;
- tienda preferida;
- tamaño de fuente.

## v354

Artículos personalizados en Settings ordenados alfabéticamente.

Freeze:

```text
mindercart-testing-freeze-v354
```

Main release:

```text
mindercart-main-release-v354
```

Main commit:

```text
fbe2fd4
```

## v355

Parche:

```text
mindercart_saved_lists_mass_add_performance_patch_v355
```

Archivos:

```text
src/app/page.tsx
src/lib/mindercart/storage.ts
```

Problema:

- agregado artículo por artículo;
- múltiples lecturas;
- múltiples escrituras;
- múltiples eventos;
- bloqueo con listas grandes.

Solución:

- `addQuickNeeds`;
- una lectura;
- procesamiento en memoria;
- una escritura;
- un evento.

Validación real:

- 220 artículos;
- agregado prácticamente inmediato;
- sin bloqueo;
- sin error;
- sin pérdida;
- sin duplicados;
- persistencia después de recarga.

Testing commit:

```text
0b2ca36
```

Freeze:

```text
mindercart-testing-freeze-v355
```

Main commit:

```text
a6d4efe
```

Main release:

```text
mindercart-main-release-v355
```

## v356

Parche:

```text
mindercart_my_list_remove_double_click_guard_patch_v356
```

Archivo:

```text
src/app/page.tsx
```

Solución:

- lock inmediato con `useRef`;
- `removingActiveItemId`;
- botones Quitar temporalmente deshabilitados;
- `Quitando… / Removing…`;
- liberación después del render y dos `requestAnimationFrame`;
- liberación segura en error.

Testing commit:

```text
e604b84
```

Freeze:

```text
mindercart-testing-freeze-v356
```

Main merge:

```text
99976c2
```

Main release:

```text
mindercart-main-release-v356
```

## v357

Fundación de tipos para Nota por ocurrencia.

Archivo:

```text
src/lib/mindercart/types.ts
```

Cambios:

- `note?: string` en `GeneralListItem`;
- `note?: string` en `ActiveShoppingListItem`;
- no se convirtió la nota en atributo global del catálogo.

Commit:

```text
02c2a53
```

Parche:

```text
mindercart_item_occurrence_note_types_foundation_patch_v357
```

## v358

Fundación de almacenamiento de notas.

Archivo:

```text
src/lib/mindercart/storage.ts
```

Cambios principales:

- nota en upsert de Mi Lista;
- nota en identidad de artículo activo;
- nota en `addQuickNeed`;
- nota en `addQuickNeeds`;
- nota en `addGeneralSelections`;
- nota al eliminar una ocurrencia.

Commit:

```text
7e92ec0
```

Freeze intermedio:

```text
mindercart-testing-freeze-v358
```

## v359

UI de nota por ocurrencia en Mi Lista.

Archivo:

```text
src/app/page.tsx
```

Cambios:

- `DraftItem.note?: string`;
- captura de nota;
- máximo 80 caracteres;
- visualización debajo del artículo;
- 10/10 pruebas funcionales aprobadas.

Commit:

```text
f182423
```

Freeze intermedio:

```text
mindercart-testing-freeze-v359
```

## v360

Reconciliación de `storage.ts` después de conflicto entre main/testing.

Parche:

```text
mindercart_storage_main_note_reconciliation_patch_v360
```

Objetivo:

- conservar lógica previa de artículos personalizados;
- conservar todas las incorporaciones de notas;
- no aceptar versiones completas de un lado sin revisar.

Merge commit:

```text
104e0fc17b36e71ef99ad718b93a9e48b321b994
```

## v361

Notas en Carrito.

Archivo:

```text
src/app/general-list/page.tsx
```

Cambios:

- nota debajo del renglón;
- nota en encabezado/modal relevante.

Commit:

```text
7508977
```

Parche:

```text
mindercart_item_occurrence_note_cart_display_patch_v361
```

## v362

Notas en De Compras.

Archivo:

```text
src/app/in-store/page.tsx
```

Cambios:

- identidad sensible a nota;
- visualización;
- mover;
- eliminar;
- merge correcto por ocurrencia.

Parche:

```text
mindercart_item_occurrence_note_in_store_patch_v362
```

## v363

Agregar artículo durante la compra con nota.

Archivo:

```text
src/app/in-store/page.tsx
```

Cambios:

- campo bilingüe;
- máximo 80;
- matching por nota;
- guardado de nota.

Parche:

```text
mindercart_item_occurrence_note_add_to_purchase_patch_v363
```

## v364

Notas y branding en WhatsApp.

Archivo:

```text
src/app/in-store/page.tsx
```

Footer aprobado:

```text
──────────────
Powered by MinderCart
Never forget what to buy.
```

Parche:

```text
mindercart_item_occurrence_note_whatsapp_branding_patch_v364
```

Commit probable observado:

```text
89b4a28
```

No tratar ese SHA como confirmado sin Git.

## v365

Notas y branding en PDF.

Archivo:

```text
src/lib/mindercart/storage.ts
```

Cambios:

- nota en segundo renglón;
- footer de marca.

Commit:

```text
f467736
```

Parche:

```text
mindercart_item_occurrence_note_pdf_branding_patch_v365
```

## v366

Notas en Historial y recompra.

Archivo:

```text
src/app/history/page.tsx
```

Cambios:

- visualización de nota;
- recompra sensible a nota;
- indicador de ya existente sensible a ocurrencia.

Parche:

```text
mindercart_item_occurrence_note_history_patch_v366
```

SHA exacto no documentado.

## v367

Compras frecuentes.

Archivo:

```text
src/app/general-list/page.tsx
```

Reglas:

- mínimo 3 compras finalizadas;
- compra más reciente dentro de 60 días;
- cálculo global entre tiendas;
- variantes de nota separadas;
- máximo una ocurrencia por compra;
- orden por frecuencia, recencia y nombre.

Parche:

```text
mindercart_frequent_purchases_history_patch_v367
```

## v368

Conteo en Compras frecuentes.

Archivo:

```text
src/app/general-list/page.tsx
```

Texto:

```text
ES: 1 vez / N veces
EN: 1 time / N times
```

Parche:

```text
mindercart_frequent_purchases_count_display_patch_v368
```

## v369

Vista compacta sticky al abrir una lista guardada.

Archivo:

```text
src/app/page.tsx
```

Cambios:

- encabezado sticky;
- filas compactas;
- checkbox, nombre, cantidad/unidad/tienda;
- nombres con ellipsis;
- estado En Mi Lista compacto;
- agregado masivo conservado.

Testing commit:

```text
09d5b7f
```

Freeze:

```text
mindercart-testing-freeze-v369
```

Main merge:

```text
e76c025
```

Main release v369 fue indicado, pero la confirmación explícita de la rama no quedó pegada en el chat.

## v370

Nota por ocurrencia dentro de Mis Listas.

Archivo:

```text
src/app/page.tsx
```

Parche:

```text
mindercart_saved_lists_item_occurrence_note_patch_v370
```

Cambios:

- captura de nota en crear/editar lista;
- máximo 80;
- nota en localStorage de Mis Listas;
- visualización en editor;
- visualización en lista abierta;
- propagación a Mi Lista;
- identidad:
  - nombre normalizado;
  - categoría;
  - unidad;
  - tienda;
  - nota;
- cantidad excluida de identidad;
- compatibilidad con listas antiguas sin nota.

Build fix puntual:

```ts
.map((item): SavedListDraftItem | null => {
```

Testing commit:

```text
c1a19a8
```

Resultado:

```text
VALIDADO EN VERCEL TESTING
```

## v371

Modo De Compras Compacto.

Archivo:

```text
src/app/in-store/page.tsx
```

Parche:

```text
mindercart_in_store_compact_shopping_view_patch_v371
```

Cambios:

- contenedor continuo por categoría;
- filas compactas;
- badge de marcar;
- nombre y cantidad alineados;
- nota en segunda línea solo cuando existe;
- botón Mover reducido;
- pendientes en blanco;
- comprados en azul suave;
- todas las funciones anteriores conservadas.

Testing commit:

```text
50efdd4
```

Resultado:

```text
VALIDADO EN VERCEL TESTING
```

## v372

Legibilidad del modo compacto.

Archivo:

```text
src/app/in-store/page.tsx
```

Parche:

```text
mindercart_in_store_compact_readability_patch_v372
```

Cambios:

- nombre `15 → 17`;
- nota `11 → 13`;
- cantidad/unidad `12 → 14`;
- Mover `12 → 13`;
- categoría `12 → 13`;
- eliminado:
  - `Para agregar ahorita`;
  - `To add right now`.

Resultado:

```text
VALIDADO EN VERCEL TESTING
```

SHA exacto pendiente de Git.

## v373

Protección de preferencias durante bootstrap cloud.

Archivo:

```text
src/lib/firebase/use-user-bootstrap.ts
```

Parche:

```text
mindercart_bootstrap_preserve_live_settings_patch_v373
```

Problema:

- el primer cambio de idioma podía ser sobrescrito por un `coreState` cloud que terminaba de cargar;
- la segunda selección sí permanecía.

Diagnóstico confirmado:

- `settings/page.tsx` enviaba el idioma correcto;
- `storage.ts` guardaba correctamente;
- `hooks.ts` releía correctamente;
- `useUserBootstrap()` aplicaba después un estado cloud anterior mediante `writeState()`.

Solución:

- capturar preferencias al iniciar bootstrap;
- releer preferencias cuando termina;
- detectar cambios por campo;
- conservar únicamente los campos modificados durante la espera:
  - idioma;
  - tienda preferida;
  - tamaño de fuente;
- mantener la restauración normal de nube para campos no modificados.

Resultado:

```text
VALIDADO EN VERCEL TESTING
```

SHA exacto pendiente de Git.

## v374

Título localizado en PDF.

Archivo:

```text
src/lib/mindercart/storage.ts
```

Parche:

```text
mindercart_pdf_localized_title_patch_v374
```

Problema:

- el PDF en inglés mostraba `Lista de Compras`.

Cambio:

```text
ES: Lista de Compras
EN: Shopping List
```

Se conservó:

- diseño;
- logo;
- fecha;
- categorías;
- unidades;
- notas;
- footer;
- branding;
- almacenamiento;
- WhatsApp.

Resultado:

```text
VALIDADO EN VERCEL TESTING
```

Checkpoint:

```text
mindercart-testing-freeze-v374
```

Release:

```text
mindercart-main-release-v374
```

SHA exacto pendiente de Git.


## v375

Sincronización interna de Mis Listas.

Archivo:

```text
src/app/page.tsx
```

Parche:

```text
mindercart_saved_lists_sync_patch_v375
```

Problema:

- Mis Listas se escribía en `localStorage`;
- otros procesos podían restaurar o reemplazar los datos;
- la pantalla no siempre releía el contenido después del cambio.

Cambios:

- importación de `CHANGE_EVENT`;
- `writeSavedListsToBrowser()` emite `CHANGE_EVENT`;
- la hidratación de Mis Listas escucha:
  - `CHANGE_EVENT`;
  - evento nativo `storage`;
- se conserva la clave:

```text
mindercart.savedLists.v1
```

Testing commit:

```text
0650d82
```

Resultado:

```text
VALIDADO EN VERCEL TESTING
```

## v376

Protección de cambios pendientes durante sincronización cloud.

Archivo:

```text
src/components/mindercart/Shell.tsx
```

Parche:

```text
mindercart_pending_cloud_sync_patch_v376
```

Cambios principales:

- snapshot pendiente por `uid`;
- snapshot incluye:
  - `coreState`;
  - `savedLists`;
  - firma;
  - fecha de creación;
- escrituras cloud serializadas;
- retry después de refresh o siguiente cambio;
- recuperación de cambios locales pendientes;
- limpieza del snapshot después de guardar correctamente.

Clave/prefijo local:

```text
mindercart.pendingCloudSync.v1.
```

Pruebas reales:

- crear lista;
- cerrar sesión;
- volver a entrar;
- abrir lista;
- eliminar;
- refresh inmediato;
- confirmar que no reaparece.

Testing commit:

```text
c6cdd3e
```

Resultado:

```text
VALIDADO EN VERCEL TESTING
```

## v377

Identidad bilingüe en Mis Listas.

Archivos:

```text
src/app/page.tsx
src/lib/mindercart/storage.ts
```

Parche:

```text
mindercart_saved_lists_bilingual_identity_patch_v377
```

Problema:

- una lista guardada podía conservar `Leche`;
- después de cambiar a inglés, Mi Lista mostraba `Milk`;
- la UI comparaba nombres literales;
- el catálogo ya conocía ambos nombres, pero Mis Listas no conservaba `itemKey`.

Solución:

- `DraftItem` y `SavedListDraftItem` aceptan `itemKey`;
- las sugerencias conservan `itemKey`;
- las listas guardadas persisten `itemKey`;
- la identidad compara primero `itemKey`;
- nombres se usan como compatibilidad;
- listas antiguas intentan resolver `itemKey` mediante:
  - `name`;
  - `nameEs`;
  - `nameEn`;
- `addQuickNeeds()` acepta y respeta `itemKey`.

Testing commit:

```text
6a1de73
```

Resultado:

```text
VALIDADO EN VERCEL TESTING
```

Prueba confirmada:

```text
Leche en español
→ cambiar a inglés
→ agregar desde Mis Listas
→ Milk en Mi Lista
→ estado In My List correcto
```

## v378

Identidad estable para artículos personalizados desde el primer intento.

Archivos:

```text
src/app/page.tsx
src/lib/mindercart/storage.ts
```

Parche:

```text
mindercart_custom_saved_item_identity_patch_v378
```

Problema:

- un artículo personalizado nuevo podía aparecer y desaparecer en el primer intento;
- el primer guardado podía entrar sin `itemKey`;
- el catálogo generaba la identidad después;
- un segundo intento ya funcionaba porque la identidad estaba registrada.

Solución:

- nueva función:

```text
resolveTrackedItemKey()
```

- reutiliza la lógica existente del catálogo;
- asigna `itemKey` al abrir el draft personalizado;
- garantiza `itemKey` al guardar una ocurrencia;
- completa identidad de listas antiguas sin cambiar nombres personalizados.

Testing commit:

```text
1ba5c0d
```

Freeze:

```text
mindercart-testing-freeze-v378
```

Freeze SHA:

```text
1ba5c0d18047b431eb881e4feb442fc6a5b3fefc
```

Main merge:

```text
434c208
```

Main release:

```text
mindercart-main-release-v378
```

Resultado:

```text
VALIDADO EN VERCEL TESTING
BUILD Y TYPESCRIPT APROBADOS
PROMOVIDO A MAIN
```

Pruebas confirmadas:

- artículo personalizado en inglés;
- agregado desde lista guardada;
- permanece desde el primer intento;
- refresh inmediato;
- eliminar;
- volver a agregar una sola vez.

## v379

Onboarding de primera visita.

Archivo:

```text
src/app/page.tsx
```

Parche:

```text
mindercart_first_visit_onboarding_patch_v379
```

Objetivo:

- explicar MinderCart a un usuario nuevo;
- no depender del login;
- no tocar dominio, Firebase ni persistencia cloud.

Implementación:

- clave local `mindercart.onboardingSeen.v1`;
- aparece una sola vez por navegador/dispositivo;
- se activa después de la hidratación;
- evita un flash de la app antes de comprobar la bandera;
- bloquea el scroll de fondo;
- queda por encima de la navegación inferior;
- funciona para invitados y autenticados;
- botón `Empezar / Get started`.

Mensaje principal:

```text
EN: Welcome to MinderCart
ES: Bienvenido a MinderCart
```

Tagline:

```text
EN: Never forget what to buy.
ES: Nunca olvides qué comprar.
```

El SHA exacto individual de `v379` no quedó pegado en el chat.

No inventarlo.

Resultado:

```text
VALIDADO EN VERCEL TESTING
```

## v380

Refinamiento del copy del onboarding.

Archivo:

```text
src/app/page.tsx
```

Parche:

```text
mindercart_onboarding_copy_refinement_patch_v380
```

Alcance:

```text
12 líneas de copy modificadas
0 cambios de lógica
0 cambios de diseño
0 cambios de almacenamiento
0 cambios de Firebase
```

Copy final aprobado en inglés:

```text
Add what you need in seconds
Capture items anytime, before you forget.

Create and reuse your own lists
Save lists for weekly shopping, recipes, or special occasions.

Shop faster, organized by category
Spend less time searching and backtracking through the store.
```

Copy final aprobado en español:

```text
Agrega lo que necesitas en segundos
Anota artículos en cualquier momento, antes de olvidarlos.

Crea y reutiliza tus propias listas
Guarda listas para compras semanales, recetas u ocasiones especiales.

Compra más rápido, organizado por categoría
Pasa menos tiempo buscando y regresando por los mismos pasillos.
```

Testing commit:

```text
42c11c7
```

Freeze:

```text
mindercart-testing-freeze-v380
```

Freeze SHA:

```text
42c11c70a452d56d444c84420121a18f110e0f26
```

Main merge:

```text
4ca52c9
```

Main release:

```text
mindercart-main-release-v380
```

Main release SHA:

```text
4ca52c90d099ea9bb21ca5471c1fcee17be49e99
```

Resultado:

```text
VALIDADO EN VERCEL TESTING
APROBADO EN INGLÉS Y ESPAÑOL
BUILD APROBADO
PROMOVIDO A MAIN
```

## v381

Fundación de landing pública para beta privada.

Archivos nuevos:

```text
src/app/beta/layout.tsx
src/app/beta/page.tsx
```

Parche:

```text
mindercart_private_beta_landing_foundation_patch_v381
```

Objetivo:

- crear una landing pública sin reemplazar la aplicación;
- mantener la app en `/`;
- publicar la landing inicialmente en `/beta`;
- no tocar Firebase, login, storage, onboarding ni Mi Lista.

Implementación:

- metadata propia;
- ruta `/beta`;
- navegación inferior oculta solo en `/beta`;
- espacio inferior de la app eliminado solo en `/beta`;
- logo y colores oficiales;
- selector `English / Español`;
- beneficios centrales;
- explicación de Mi Lista, Mis Listas y De Compras;
- beta gratuita y por invitación;
- soporte:
  - `mindercartapp@gmail.com`;
- privacidad y términos como próximos pasos.

Testing commit:

```text
1a4fa0f
```

Resultado inicial:

```text
BUILD Y TYPESCRIPT APROBADOS
RUTA /beta GENERADA
```

Hallazgos en prueba:

- el scroll no funcionaba;
- el CTA por `mailto:` no era confiable en computadora;
- la simulación mostraba una letra `M` en lugar del logo real.

Estos hallazgos se corrigieron en `v382` y `v383`.

## v382

Corrección de usabilidad de la landing.

Archivo:

```text
src/app/beta/page.tsx
```

Parche:

```text
mindercart_beta_scroll_guidance_and_preview_logo_patch_v382
```

Cambios:

- restauración de scroll vertical;
- altura automática del documento;
- `overflow` visible para la estructura global dentro de `/beta`;
- logo real `/mindercart-avatar.png` en la simulación;
- texto temporal de orientación sobre el cuestionario por correo.

Testing commit:

```text
a614ec9
```

Resultado:

```text
SCROLL APROBADO EN COMPUTADORA Y TELÉFONO
LOGO REAL APROBADO
```

La orientación por correo y el uso de `mailto:` se retiraron posteriormente porque no funcionaban de forma consistente en navegadores de escritorio.

## v383

Conexión del formulario público y soporte independiente de `mailto:`.

Archivo:

```text
src/app/beta/page.tsx
```

Parche:

```text
mindercart_beta_form_cta_and_support_email_patch_v383
```

Google Form público:

```text
https://forms.gle/hBYo5seaTRWJS47v6
```

Cambios:

- eliminación total de `mailto:`;
- eliminación del cuestionario preparado dentro del correo;
- eliminación de las frases de orientación debajo de los botones;
- los dos CTA de beta abren el Google Form en otra pestaña;
- soporte cambia a:
  - `Copy support email`;
  - `Copiar correo de soporte`;
- copia:
  - `mindercartapp@gmail.com`;
- confirmación temporal:
  - `Email copied`;
  - `Correo copiado`;
- footer conserva el correo visible;
- scroll y logo real permanecen.

Testing commit:

```text
88b7202
```

Freeze:

```text
mindercart-testing-freeze-v383
```

Freeze SHA:

```text
88b72028047172bc9b30f499ce82637d58ae9758
```

Main merge:

```text
19cd6e1
```

Main release:

```text
mindercart-main-release-v383
```

Resultado:

```text
FORMULARIO PÚBLICO APROBADO
RESPUESTAS RECIBIDAS
COPY SUPPORT EMAIL APROBADO
BUILD Y TYPESCRIPT APROBADOS
PROMOVIDO A MAIN
```

Pruebas confirmadas:

- formulario abre desde computadora;
- formulario abre desde teléfono;
- respuesta de prueba enviada;
- respuesta visible en la cuenta administradora;
- botón de soporte copia el correo;
- navegación inferior ausente en `/beta`;
- app normal conserva navegación;
- footer completo visible;
- español e inglés disponibles.

## v384

Política de Privacidad pública bilingüe.

Archivos:

```text
src/app/beta/page.tsx
src/app/privacy/layout.tsx
src/app/privacy/page.tsx
```

Parche:

```text
mindercart_public_privacy_policy_patch_v384
```

Objetivo:

- publicar una Política de Privacidad accesible desde la landing;
- mantener la aplicación principal sin cambios;
- no mezclar Términos, Firebase, billing, login ni storage.

Implementación:

- nueva ruta `/privacy`;
- metadata propia;
- navegación inferior oculta solo en `/privacy`;
- selector English / Español;
- logo y branding de MinderCart;
- enlace de regreso a `/beta`;
- explicación de:
  - información de cuenta;
  - contenido de listas y preferencias;
  - almacenamiento local;
  - sincronización con Firebase;
  - formulario de beta;
  - listas compartidas;
  - retención;
  - seguridad;
  - derechos y solicitudes;
  - menores de 13 años;
- soporte mediante:
  - `mindercartapp@gmail.com`;
- botón para copiar el correo;
- enlace Privacy / Privacidad activado en `/beta`;
- Terms / Términos permanece como próximo paso.

Testing commit:

```text
3068d2b
```

Freeze:

```text
mindercart-testing-freeze-v384
```

Main merge:

```text
fd05275
```

Main release:

```text
mindercart-main-release-v384
```

Resultado:

```text
RUTA /privacy APROBADA
PRIVACY CONECTADA DESDE /beta
COMPUTADORA E iPHONE APROBADOS
BUILD Y TYPESCRIPT APROBADOS
PROMOVIDO A MAIN
```

Pruebas confirmadas:

- `/privacy` aparece en el build;
- Privacy / Privacidad abre desde `/beta`;
- scroll completo;
- inglés y español;
- navegación inferior ausente en `/privacy`;
- navegación inferior presente en `/`;
- build aprobado;
- TypeScript aprobado.

## v385

Términos de Uso públicos bilingües.

Archivos:

```text
src/app/beta/page.tsx
src/app/terms/layout.tsx
src/app/terms/page.tsx
```

Parche:

```text
mindercart_public_terms_of_use_patch_v385
```

Objetivo:

- publicar Términos de Uso accesibles desde la landing;
- mantener Privacy sin cambios;
- mantener la aplicación principal sin cambios;
- no mezclar Firebase, billing, login ni storage.

Implementación:

- nueva ruta `/terms`;
- metadata propia;
- navegación inferior oculta solo en `/terms`;
- selector English / Español;
- logo y branding de MinderCart;
- enlace de regreso a `/beta`;
- explicación de:
  - aceptación;
  - elegibilidad;
  - beta privada;
  - cuentas y seguridad;
  - uso permitido;
  - conductas prohibidas;
  - contenido del usuario;
  - grupos y listas compartidas;
  - servicios de terceros;
  - propiedad intelectual;
  - reseñas honestas;
  - disponibilidad;
  - suspensión y terminación;
  - garantías;
  - limitación de responsabilidad;
  - cambios;
  - contacto;
- uso correcto de `MinderCart™`;
- aclaración de que la solicitud federal de marca está pendiente;
- no se usa `®`;
- enlace Terms / Términos activado en `/beta`;
- Privacy / Privacidad permanece activo.

Testing commit:

```text
01fff55
```

Freeze:

```text
mindercart-testing-freeze-v385
```

Main merge:

```text
c4eb130
```

Main release:

```text
mindercart-main-release-v385
```

Resultado:

```text
RUTA /terms APROBADA
TERMS CONECTADO DESDE /beta
PRIVACY CONSERVADA
BUILD Y TYPESCRIPT APROBADOS
PROMOVIDO A MAIN
```

Pruebas confirmadas:

- `/terms` aparece en el build;
- Terms / Términos abre desde `/beta`;
- scroll completo;
- inglés y español;
- uso de MinderCart™;
- solicitud federal pendiente;
- no se usa `®`;
- copia del correo de soporte;
- navegación inferior ausente en `/terms`;
- navegación inferior presente en `/`;
- build aprobado;
- TypeScript aprobado.

## v386

Corrección de captura directa de artículos personalizados y eliminación de falso mensaje de éxito.

Archivos:

```text
src/app/page.tsx
src/lib/mindercart/storage.ts
```

Parche:

```text
mindercart_custom_quick_add_false_success_fix_patch_v386
```

Problema reportado por tester:

```text
Escribir Jitomate
→ seleccionar Frutas y Verduras
→ seleccionar cantidad/unidad
→ agregar
→ mensaje: “Jitomate agregado a la lista”
→ Jitomate no aparecía en Mi Lista
```

Diagnóstico:

- `page.tsx` asignaba anticipadamente un `itemKey` mediante `resolveTrackedItemKey()`;
- para un artículo personalizado nuevo, ese `itemKey` todavía no existía en `itemsMaster`;
- `storage.ts` activaba la protección:
  - `missing_custom_item`;
- la operación devolvía `added: false`;
- `page.tsx` usaba `addQuickNeed()` y recibía únicamente el estado;
- la UI ignoraba el rechazo y mostraba éxito falso.

Relación histórica:

- `v378` introdujo identidad estable desde el primer draft;
- la intención era correcta para Mis Listas;
- el flujo directo de Mi Lista quedó afectado por una protección demasiado amplia.

Solución:

- `storage.ts` permite una identidad determinística recién creada únicamente cuando:
  - es captura directa;
  - no existe `sourceListName`;
  - el `requestedItemKey` coincide con `makeItemKey(name)`;
- referencias inválidas provenientes de listas guardadas siguen bloqueadas;
- `page.tsx` usa `addQuickNeedWithResult()`;
- la UI muestra éxito únicamente cuando:
  - `result.added === true`;
- si storage rechaza, se muestra un error real.

Testing commit:

```text
e67cc87
```

Freeze:

```text
mindercart-testing-freeze-v386
```

Freeze SHA:

```text
e67cc87428365291b15c6af1c11afbcfa8b4356b
```

Main merge:

```text
d9cfe8e
```

Main release:

```text
mindercart-main-release-v386
```

Resultado:

```text
JITOMATE AGREGADO CORRECTAMENTE
CAPTURA PERSONALIZADA RESTAURADA
MENSAJE DE ÉXITO VALIDADO CONTRA STORAGE
BUILD Y TYPESCRIPT APROBADOS
PROMOVIDO A MAIN
```

Pruebas confirmadas:

- deployment correcto de `testing`;
- navegador de computadora;
- iPhone;
- artículo `Jitomate`;
- aparición inmediata en Mi Lista;
- build aprobado;
- TypeScript aprobado;
- testers usan `main`.

Hallazgo de infraestructura separado:

```text
e-testing.vercel.app
→ 404 DEPLOYMENT_NOT_FOUND
```

Regla:

- no diagnosticar código usando una URL rota;
- confirmar siempre commit, estado `Ready` y dominio del deployment;
- para `testing`, copiar la URL vigente desde Vercel;
- un refresh no corrige un alias roto.

## v387

Protección contra ciclo de sincronización al abrir Mis Listas con un catálogo grande de artículos personalizados.

Archivo:

```text
src/lib/mindercart/storage.ts
```

Parche:

```text
mindercart_saved_lists_catalog_sync_loop_guard_patch_v387
```

Problema reportado por tester:

```text
Cuenta con más de 200 artículos personalizados
→ los artículos personalizados seguían presentes
→ al intentar entrar a Mis Listas, la app no permitía verlas
```

Diagnóstico:

- `page.tsx` carga `mindercart.savedLists.v1` y llama a `syncSavedListItemsToCatalog()` con todos los artículos guardados;
- una misma identidad podía aparecer en distintas ocurrencias con tienda, unidad o categoría diferente;
- `syncSavedListItemsToCatalog()` marcaba `changed = true` por cambios intermedios;
- aunque el catálogo final quedara idéntico al estado inicial, se ejecutaba `writeState()`;
- `writeState()` emitía `CHANGE_EVENT`;
- `page.tsx` releía Mis Listas y volvía a ejecutar la sincronización;
- con un catálogo grande, el ciclo podía bloquear la entrada a Mis Listas.

Solución:

- comparar el `itemsMaster` final con el `itemsMaster` original antes de escribir;
- si ambos son idénticos, devolver el estado sin ejecutar `writeState()`;
- evitar la emisión innecesaria de `CHANGE_EVENT`;
- conservar las sincronizaciones que sí producen un cambio final real.

Testing commit:

```text
c364f27
```

Freeze:

```text
mindercart-testing-freeze-v387
```

Freeze SHA:

```text
c364f27a61cb7f618b511d4a02a5d734e2eb6760
```

Main merge:

```text
b40ab5a
```

Main merge SHA completo:

```text
b40ab5a832ec7db1bf6e18e15a0e26846a896a6b
```

Main release:

```text
mindercart-main-release-v387
```

Resultado confirmado:

```text
EL TESTER AFECTADO VOLVIÓ A VER SUS LISTAS EN TESTING
BUILD Y TYPESCRIPT APROBADOS
FREEZE PUBLICADO
PROMOVIDO A MAIN
MAIN RELEASE PUBLICADO
```

Pruebas y evidencia confirmadas:

- deployment de `testing` correspondiente a `c364f27`;
- prueba realizada por el tester afectado;
- cuenta con más de 200 artículos personalizados;
- Mis Listas volvió a abrir y mostrar sus listas;
- build de producción aprobado en `testing`;
- build de producción aprobado después del merge en `main`;
- TypeScript aprobado en ambos builds;
- push de `testing`, freeze, `main` y main release confirmado por Git.

Pendiente de confirmación posterior:

- deployment de `main` asociado a `b40ab5a` en estado `Ready`;
- repetición final del caso del tester desde `main`.

## v388

Deduplicación de resoluciones de bootstrap simultáneas durante el inicio de sesión.

Archivo:

```text
src/lib/firebase/resolve-user-bootstrap.ts
```

Parche:

```text
mindercart_bootstrap_inflight_dedup_patch_v388
```

Problema:

- `AppShell` ejecutaba `useUserBootstrap()`;
- Settings ejecutaba simultáneamente otra llamada a `resolveUserBootstrap()`;
- ambas rutas podían leer los mismos datos individuales o familiares al iniciar sesión;
- la duplicación aumentaba la latencia perceptible, especialmente con cuentas grandes.

Solución:

- mantener un mapa temporal por `uid` con la promesa de resolución en curso;
- compartir esa promesa entre llamadas simultáneas para el mismo usuario;
- eliminar la entrada al finalizar;
- no conservar caché permanente ni datos obsoletos.

Testing commit:

```text
3920807
```

Testing SHA completo:

```text
392080739982efd1450ab1cf4e6730dd8e6642b9
```

Resultado confirmado:

- deployment correcto de `testing`;
- inicio de sesión rápido;
- idioma restaurado;
- artículos personalizados presentes;
- Mis Listas abrió correctamente;
- refresh y persistencia aprobados;
- build y TypeScript aprobados.

## v389

Deduplicación de guardados cloud idénticos simultáneos durante cambios recientes y logout.

Archivo:

```text
src/lib/firebase/save-user-data.ts
```

Parche:

```text
mindercart_cloud_save_inflight_dedup_patch_v389
```

Problema:

- cambiar idioma dispara sincronización automática desde `Shell.tsx`;
- cerrar sesión inmediatamente ejecutaba otro `saveUserData()` completo;
- ambas rutas podían resolver workspace y escribir el mismo payload simultáneamente;
- logout espera el guardado seguro antes de cerrar;
- el usuario observó una espera superior a 25 segundos en ese escenario.

Solución:

- construir una firma temporal con usuario, payload y destino solicitado;
- compartir la misma promesa cuando un guardado idéntico ya está en curso;
- eliminar la entrada al terminar;
- conservar el guardado previo al logout;
- conservar la protección contra pérdida de datos.

Testing commit:

```text
d5aab83
```

Freeze:

```text
mindercart-testing-freeze-v389
```

Freeze SHA:

```text
d5aab83ff8a5ae37eddcc312fb79527c6b07767d
```

Main merge:

```text
48ace74
```

Main merge SHA completo:

```text
48ace7479bf03e5ae1c4850b3859d0eee4209ad0
```

Main release:

```text
mindercart-main-release-v389
```

Resultado confirmado:

```text
LOGIN Y LOGOUT MEJORARON
PREFERENCIAS Y DATOS CONSERVADOS
BUILD Y TYPESCRIPT APROBADOS
TESTING FREEZE PUBLICADO
PROMOVIDO A MAIN
MAIN RELEASE PUBLICADO
DEPLOYMENT DE MAIN READY
```

Pruebas confirmadas:

- login;
- logout;
- cambiar idioma y cerrar sesión;
- volver a iniciar sesión;
- artículos personalizados;
- Mis Listas;
- persistencia después de refresh;
- deployment de `testing` en estado `Ready`;
- deployment de `main` para `48ace74` en estado `Ready`.

## v390

Corrección puntual del onboarding móvil bloqueado por la navegación inferior.

Archivo:

```text
src/app/page.tsx
```

Parche:

```text
mindercart_onboarding_portal_patch_v390
```

Problema:

- una tester invitada que usa `main` no podía continuar desde `Mi Lista`;
- la bienvenida crecía con el tamaño de letra;
- el botón `Empezar` quedaba fuera del área útil y detrás de la navegación fija;
- el modal estaba renderizado dentro del contenedor desplazable de `AppShell`;
- no era un problema de login ni de datos.

Solución:

- importar `createPortal` desde `react-dom`;
- renderizar únicamente el onboarding mediante `createPortal(..., document.body)`;
- conservar el overlay, scroll interno, textos y persistencia local existentes;
- no modificar otros modales ni ningún flujo de listas, storage o autenticación.

Testing commit:

```text
b5444f7
```

Freeze:

```text
mindercart-testing-freeze-v390
```

Freeze SHA:

```text
b5444f7b81d9a52555839cc8c6c3a361111c82ee
```

Main merge:

```text
8a3fc5e
```

Main merge SHA completo:

```text
8a3fc5e9eb64c6e1c02e9e0a9fa934e421677376
```

Main release:

```text
mindercart-main-release-v390
```

Resultado confirmado:

```text
BUILD Y TYPESCRIPT APROBADOS
DEPLOYMENT DE TESTING READY
VALIDADO EN IPHONE REAL
BOTÓN EMPEZAR ACCESIBLE
TESTING FREEZE PUBLICADO
PROMOVIDO A MAIN
MAIN RELEASE PUBLICADO
```

Pendiente de confirmación:

- deployment de `main v390` en estado `Ready`;
- repetición final del caso en el dominio principal.

## v391–v392

Protección contra pérdida accidental de una lista personalizada nueva.

Archivo:

```text
src/app/page.tsx
```

Problema:

- una lista nueva podía tener nombre y artículos agregados;
- `Regresar a Mis Listas` navegaba directamente;
- el borrador se perdía sin advertencia.

Solución:

- confirmar únicamente cuando la lista nueva tiene nombre o artículos sin guardar;
- cancelar conserva al usuario dentro del editor con el borrador intacto;
- aceptar regresa y descarta el borrador;
- una lista nueva vacía regresa sin preguntar;
- mensaje bilingüe con pregunta y consecuencia separadas por una línea.

Commits de testing:

```text
v391: 58f4732
v392: db98264
```

Resultado confirmado:

```text
BUILD Y TYPESCRIPT APROBADOS
DEPLOYMENT DE TESTING READY
FLUJO VALIDADO POR EL USUARIO
```

## v393

Cierre de sesión seguro con espera cloud limitada.

Archivo:

```text
src/lib/firebase/auth-actions.ts
```

Problema:

- logout esperaba indefinidamente un guardado completo en Firestore;
- `v389` evitaba duplicados idénticos, pero no una petición individual lenta;
- durante cambios recientes de idioma o datos la interfaz podía parecer congelada.

Solución:

- capturar el estado y Mis Listas antes del logout;
- escribir un snapshot pendiente local compatible con `Shell.tsx`;
- esperar hasta 6 segundos el guardado cloud cuando existe respaldo recuperable;
- continuar el logout si Firebase sigue lento;
- conservar el snapshot para reintento del mismo usuario;
- eliminar el snapshot únicamente cuando el guardado correspondiente termina correctamente;
- si localStorage no permite crear respaldo, esperar el guardado completo como antes.

Testing commit y freeze:

```text
testing: 1a6a4fd
freeze: mindercart-testing-freeze-v393
freeze SHA: 1a6a4fdd46444b70b08421b66ac5996605aae716
```

Main merge y release:

```text
main merge: 5866770
main SHA: 5866770e4b75a088a2978c1de0d7b8677dfd74ed
release: mindercart-main-release-v393
```

Resultado confirmado:

```text
CAMBIO DE IDIOMA CORRECTO
LOGOUT RÁPIDO EN TESTING
LOGIN Y RESTAURACIÓN DE DATOS CORRECTOS
BUILD Y TYPESCRIPT APROBADOS
TESTING FREEZE PUBLICADO
PROMOVIDO A MAIN
MAIN RELEASE PUBLICADO
```

Pendiente:

- confirmar deployment de `main v393` en estado `Ready`.

---

# 11. NOTA POR OCURRENCIA — DEFINICIÓN FINAL IMPLEMENTADA

La nota pertenece a una ocurrencia dentro de una lista o compra.

No pertenece globalmente al artículo maestro.

Ejemplos:

```text
Sparkling Water — Cherry
Sparkling Water — Orange
```

Se mantienen como ocurrencias diferentes.

Regla de identidad aplicada:

```text
mismo artículo
+ misma categoría
+ misma unidad
+ misma tienda
+ misma nota
= misma ocurrencia
```

La cantidad no define identidad.

Una nota diferente conserva un renglón separado.

## Propagación implementada

```text
Mis Listas
→ Mi Lista
→ Carrito
→ De Compras
→ WhatsApp
→ PDF
→ Historial
→ Recompra
```

## Límite actual

```text
80 caracteres
```

## Artículos base y personalizados

- artículos base: no se editan globalmente;
- artículos personalizados: se administran desde Settings;
- nota en lista: modifica solo esa ocurrencia;
- no convertir nota en atributo global del catálogo.

---

# 12. MODO DE COMPRAS COMPACTO — DEFINICIÓN FINAL ACTUAL

Objetivo:

- mostrar más artículos por pantalla;
- mantener legibilidad;
- mantener zona táctil segura;
- acercarse a la claridad de papel;
- no reducir botones hasta hacerlos peligrosos.

Implementado:

- encabezados de categoría delgados;
- un renglón principal por artículo;
- cantidad/unidad a la derecha;
- nota en segunda línea solo cuando existe;
- estructura continua por categoría;
- filas compactas;
- marcado/desmarcado conservado;
- acciones secundarias conservadas;
- escala de fuente visible;
- título redundante eliminado.

No implementado todavía:

- selector Compacta/Cómoda;
- mantener pantalla despierta;
- one-handed mode;
- smartwatch;
- voz durante compra.

No mezclar esos temas con landing, legal o beta.

---

# 12A. ONBOARDING DE PRIMERA VISITA — DEFINICIÓN FINAL

## Propósito

Comunicar en segundos la esencia de MinderCart a una persona que todavía no conoce el producto.

## Regla de aparición

```text
una vez por navegador/dispositivo
```

Clave local:

```text
mindercart.onboardingSeen.v1
```

## Público

- invitado;
- usuario autenticado.

No requiere login.

## Flujo

```text
hidratar app
→ comprobar bandera local
→ mostrar onboarding cuando no existe
→ presionar Empezar / Get started
→ guardar bandera
→ no volver a mostrar
```

Desde `v390`, el modal se renderiza mediante `createPortal(..., document.body)` para evitar que el contenedor desplazable de `AppShell` o la navegación inferior fija oculten el botón en iPhone, pantallas pequeñas o escalas de letra grandes.

## Copy aprobado

### Inglés

```text
Add what you need in seconds
Capture items anytime, before you forget.

Create and reuse your own lists
Save lists for weekly shopping, recipes, or special occasions.

Shop faster, organized by category
Spend less time searching and backtracking through the store.
```

### Español

```text
Agrega lo que necesitas en segundos
Anota artículos en cualquier momento, antes de olvidarlos.

Crea y reutiliza tus propias listas
Guarda listas para compras semanales, recetas u ocasiones especiales.

Compra más rápido, organizado por categoría
Pasa menos tiempo buscando y regresando por los mismos pasillos.
```

## Decisiones de alcance

No mover este estado a Firebase por ahora.

No convertir onboarding en tutorial largo, múltiples pantallas, requisito de registro, flujo ligado a grupo ni campaña comercial compleja.

El objetivo es claridad inmediata, no entrenamiento exhaustivo.

---

# 12B. LANDING DE BETA PRIVADA — DEFINICIÓN ACTUAL

## Ruta

```text
/beta
```

## Propósito

- presentar MinderCart públicamente;
- explicar el valor central;
- captar participantes para la beta;
- mantener la app principal intacta.

## Archivos

```text
src/app/beta/layout.tsx
src/app/beta/page.tsx
```

## Branding

```text
Logo:
/mindercart-avatar.png

Azul principal:
#12245E

Texto azul:
#172554

Fondo azul suave:
#EEF2FF

Línea azul:
#D7DFF5

Texto secundario:
#5C6EA6
```

## Copy central

### Inglés

```text
Never forget what to buy.

Add what you need in seconds.
Create and reuse your own lists.
Shop faster, organized by category.
```

### Español

```text
Nunca olvides qué comprar.

Agrega lo que necesitas en segundos.
Crea y reutiliza tus propias listas.
Compra más rápido, organizado por categoría.
```

## Formulario de beta

```text
https://forms.gle/hBYo5seaTRWJS47v6
```

La solicitud pregunta:

- nombre;
- correo;
- idioma preferido;
- iPhone o Android;
- frecuencia de compras;
- para cuántas personas compra;
- quién participa en la lista;
- cómo prepara actualmente la lista;
- nombre de la app de compras que usa, cuando aplique;
- principal problema;
- razón para querer probar MinderCart.

## Soporte

```text
mindercartapp@gmail.com
```

La landing no depende de una aplicación de correo.

El botón copia el correo al portapapeles.

## Reglas actuales

- landing y app conviven;
- `/beta` no muestra navegación inferior;
- `/` y módulos internos conservan la navegación;
- no usar `AppShell` en la landing;
- no cargar lógica cloud dentro de la landing;
- no almacenar solicitudes en Firebase;
- las solicitudes se administran desde Google Forms;
- privacidad está publicada en `/privacy`;
- términos están publicados en `/terms`.

## Estado legal público

```text
/privacy — COMPLETADO
/terms — COMPLETADO
```

No convertir `/beta` en la portada oficial de MinderCart.com hasta revisar dominio, rutas y experiencia de acceso a la app.

---

# 12C. POLÍTICA DE PRIVACIDAD — DEFINICIÓN ACTUAL

## Ruta

```text
/privacy
```

## Archivos

```text
src/app/privacy/layout.tsx
src/app/privacy/page.tsx
src/app/beta/page.tsx
```

## Estado

```text
COMPLETADO EN v384
```

## Alcance publicado

- información de cuenta;
- datos de listas y preferencias;
- almacenamiento local;
- sincronización con Firebase;
- solicitudes de beta en Google Forms;
- listas compartidas;
- proveedores de servicio;
- retención y eliminación;
- medidas de seguridad;
- derechos y solicitudes;
- menores de 13 años;
- contacto de soporte.

## Soporte

```text
mindercartapp@gmail.com
```

## Reglas

- `/privacy` es pública;
- no requiere login;
- no usa `AppShell`;
- no muestra navegación inferior;
- no modifica datos de la app;
- no crea almacenamiento adicional;
- no altera Firebase;
- no altera el formulario de beta;
- el enlace desde `/beta` está activo;
- Términos se publica por separado en `/terms`.

## Estado legal relacionado

```text
/terms — COMPLETADO EN v385
```

La Política de Privacidad es una versión operativa para la beta privada. Antes de un lanzamiento comercial amplio debe revisarse nuevamente conforme al producto, proveedores y prácticas reales vigentes.

---

# 12D. TÉRMINOS DE USO — DEFINICIÓN ACTUAL

## Ruta

```text
/terms
```

## Archivos

```text
src/app/terms/layout.tsx
src/app/terms/page.tsx
src/app/beta/page.tsx
```

## Estado

```text
COMPLETADO EN v385
```

## Alcance publicado

- aceptación;
- elegibilidad;
- participación en beta privada;
- cuentas y seguridad;
- uso permitido;
- conductas prohibidas;
- contenido e información de compras;
- grupos y listas compartidas;
- servicios de terceros;
- propiedad intelectual;
- feedback;
- reseñas honestas;
- disponibilidad;
- suspensión;
- terminación;
- exclusión de garantías;
- limitación de responsabilidad;
- cambios;
- disposiciones generales;
- contacto.

## Marca

```text
MinderCart™
```

Estado:

```text
Solicitud federal de marca pendiente
USPTO Serial Number 99898962
```

Regla:

- usar `™` cuando corresponda;
- no usar `®` hasta que el registro federal sea concedido oficialmente.

## Soporte

```text
mindercartapp@gmail.com
```

## Reglas

- `/terms` es pública;
- no requiere login;
- no usa `AppShell`;
- no muestra navegación inferior;
- no modifica datos de la app;
- no crea almacenamiento adicional;
- no altera Firebase;
- no altera Privacy;
- el enlace desde `/beta` está activo.

Los Términos son una versión operativa para la beta privada. Antes de un lanzamiento comercial amplio deben revisarse nuevamente conforme al producto, modelo comercial, jurisdicciones y prácticas reales vigentes.


# 12E. PRESENCIA WEB PÚBLICA INDEPENDIENTE — ESTADO ACTUAL

## Proyecto local

```text
C:\dev\mindercart-site
```

Este proyecto es independiente de:

```text
C:\dev\mindercart-web
```

No copiar archivos del sitio público dentro de `mindercart-web` ni modificar `/src` de la app al trabajar en la presencia web.

## Estado confirmado

- proyecto Next.js independiente instalado y compilado;
- portada bilingüe español/inglés;
- rutas estáticas `/`, `/privacy` y `/terms`;
- screenshots reales de `Mi Lista / My List`;
- idioma conservado al navegar a Privacidad y Términos y al regresar;
- diseño responsive para computadora y móvil;
- iconos visualmente coherentes con Mi Lista, Mis Listas y De Compras;
- línea decorativa entre módulos eliminada por no aportar claridad;
- recorrido visual completo en español e inglés mediante capturas reales de la app;
- etiquetas con icono y nombre real del módulo en lugar de números genéricos;
- capturas superpuestas de una lista abierta y del envío por WhatsApp;
- capturas de WhatsApp sanitizadas para no mostrar nombres, fotografías ni conversación personal;
- sección repetitiva de beneficios eliminada en español e inglés;
- build y TypeScript aprobados en la última entrega local;
- dominio adquirido mediante Akky.mx;
- publicación, hosting y conexión final del dominio todavía pendientes.

## Copy actual aprobado

Encabezado del recorrido en español:

```text
DE LA IDEA AL CARRITO
Tus compras organizadas de principio a fin.
```

Módulos y mensajes principales:

```text
Mi Lista — Captura y tendrás todo organizado
Mis Listas — Crea tus propias listas
De Compras — Organiza tus compras por tienda
De Compras — Compra, comparte o divide el recorrido
```

Encabezado equivalente en inglés:

```text
FROM THOUGHT TO CART
Your shopping, organized from start to finish.
```

La versión inglesa replica el recorrido visual con `My List`, `My Lists`, `Shopping`, una lista `Carrot Cake` abierta y un mensaje limpio de WhatsApp.

## Último paquete local entregado

```text
MinderCart_Public_Site_v14_ready.zip
```

El ZIP contiene el proyecto fuente sin `node_modules` ni `.next`.

## Siguiente paso de presencia web

1. revisión final visual y de copy;
2. crear repositorio independiente para `mindercart-site`;
3. desplegar en Vercel como proyecto separado;
4. conectar el dominio adquirido en Akky.mx;
5. verificar HTTPS, español/inglés, Privacidad, Términos y formulario;
6. no sustituir el dominio operativo de la app durante esta etapa.


# 13. PERSISTENCIA ACTUAL CONOCIDA

## Estado central

Clave local:

```text
mindercart_state_v15
```

Archivo principal:

```text
src/lib/mindercart/storage.ts
```

Incluye:

- catálogo;
- Mi Lista;
- De Compras;
- Historial;
- perfiles de tienda;
- settings.

## Mis Listas

Clave local:

```text
mindercart.savedLists.v1
```

Archivo principal de UI y persistencia local:

```text
src/app/page.tsx
```

Estado después de `v375`–`v378`:

- se escribe en `localStorage`;
- se emite `CHANGE_EVENT` después de cada escritura;
- la pantalla escucha `CHANGE_EVENT`;
- la pantalla escucha el evento nativo `storage`;
- `Shell.tsx` incluye `savedLists` dentro del snapshot cloud;
- los cambios pendientes sobreviven a refresh;
- logout/login restaura la lista;
- una eliminación confirmada no reaparece después de refresh inmediato;
- los artículos conservan `itemKey`;
- listas antiguas intentan completar `itemKey`;
- artículos personalizados reciben identidad estable desde el primer guardado.

## Snapshot pendiente de cloud

Archivo:

```text
src/components/mindercart/Shell.tsx
```

Prefijo local:

```text
mindercart.pendingCloudSync.v1.
```

El snapshot pendiente incluye:

- usuario;
- firma;
- `coreState`;
- `savedLists`;
- fecha de creación.

Objetivo:

- no perder cambios durante debounce;
- serializar escrituras;
- recuperar después de refresh;
- reintentar en la siguiente carga o cambio;
- limpiar el snapshot después de guardar correctamente.

Después de `v389`, guardados cloud idénticos que coinciden en el tiempo comparten una sola operación en curso. La entrada temporal se elimina al finalizar y no sustituye el snapshot pendiente.

## Bootstrap cloud

Archivo:

```text
src/lib/firebase/use-user-bootstrap.ts
```

`v373` protege preferencias cambiadas durante la carga:

- idioma;
- tienda preferida;
- tamaño de fuente.

`v376` protege cambios locales pendientes antes de que la nube alcance el nuevo estado.

`v388` comparte la resolución en curso entre llamadas simultáneas para el mismo `uid`, evitando lecturas duplicadas durante el login sin conservar caché permanente.

## Identidad de artículos

Después de `v377`, `v378`, `v386` y `v387`:

- artículos de catálogo usan `itemKey`;
- español e inglés comparten identidad;
- listas antiguas pueden resolver identidad por nombre del catálogo;
- artículos personalizados obtienen una identidad estable desde el primer draft;
- captura directa acepta una identidad determinística nueva;
- referencias inválidas de listas guardadas permanecen bloqueadas;
- la UI comprueba `added` antes de mostrar éxito;
- la sincronización de artículos de Mis Listas no escribe ni emite eventos cuando el catálogo final no cambia;
- el nombre personalizado no se traduce automáticamente;
- nota, unidad, tienda y origen siguen definiendo la ocurrencia conforme a las reglas existentes.

## Riesgo comercial pendiente

Ya existe restore cloud funcional y protección de cambios pendientes.

Todavía falta validar formalmente:

- dos dispositivos editando al mismo tiempo;
- conflictos entre pestañas con cambios simultáneos;
- último escritor vs merge;
- reconexión después de estar offline;
- titular e integrante modificando la misma lista;
- recuperación ante una escritura cloud fallida prolongada.

No prometer todavía:

```text
colaboración Familiar completamente conflict-safe en tiempo real
```

Sí puede probarse en beta privada controlada con expectativas claras.

# 14. ESTRATEGIA DE BETA Y COMERCIALIZACIÓN

## Beta recomendada

```text
15–25 hogares
```

Cada hogar debe completar al menos:

```text
3 compras reales
```


## Estado de captación

```text
Landing:
/beta

Google Form:
https://forms.gle/hBYo5seaTRWJS47v6

Soporte:
mindercartapp@gmail.com
```

El formulario está publicado y ya recibió respuestas de prueba correctamente.

La beta ya comenzó a recibir testers reales.

Hallazgos críticos cerrados:

```text
v386 — falso éxito al agregar artículo personalizado nuevo
v387 — bloqueo al abrir Mis Listas con más de 200 artículos personalizados
v388 — bootstrap duplicado durante login
v389 — guardado cloud duplicado durante logout
```

Estado:

```text
CORREGIDOS Y PUBLICADOS EN MAIN
```

La beta será:

- gratuita;
- solo por invitación;
- selección manual;
- bilingüe;
- con usuarios de iPhone y Android;
- con hogares de distintos tamaños.

## Métricas recomendadas

### Preparación

- tiempo para crear lista de 10 artículos;
- porcentaje agregado desde historial;
- porcentaje agregado desde Mis Listas;
- uso de notas.

### Densidad

- artículos visibles sin scroll;
- distancia de scroll;
- cambios de categoría.

### Ejecución

- tiempo para marcar;
- errores de doble toque;
- artículos olvidados;
- uso de otra lista paralela.

### Retención

- compras finalizadas;
- reutilización semanal;
- regreso a Mis Listas;
- recompra desde historial.

### Reemplazo de papel

- si usó otra lista;
- porcentaje de compras hechas solo con MinderCart;
- percepción de rapidez;
- percepción de confianza.

## Hipótesis de planes

### Individual

Uso personal.

### Familiar

Posible valor:

- Shared Lists;
- un titular;
- hasta cuatro invitados;
- colaboración básica.

Precios históricos propuestos como hipótesis, no como decisión final:

```text
Individual: $0.99 mensual / $9.99 anual
Familiar:   $1.49 mensual / $14.99 anual
```

No implementar billing hasta validar disposición real de pago.

No poner tras paywall:

- modo compacto;
- notas;
- funciones esenciales de compra.

La propuesta pagada natural es coordinación del hogar, sincronización, restore y colaboración confiable.

---

# 15. VOZ, SIRI, ALEXA Y RELOJ

## Decisión estratégica aprobada

La voz se validará primero dentro de MinderCart™. Siri y Alexa se conectarán después a una API cloud común, segura y deduplicada.

No crear dos lógicas independientes para Siri y Alexa.

No conectar asistentes directamente a `localStorage`.

Orden estratégico aprobado:

1. experiencia central sólida;
2. persistencia cloud confiable;
3. voz dentro de MinderCart;
4. validación de uso real con testers;
5. API/capa de servicio segura y deduplicada;
6. Siri mediante App Intents;
7. Alexa mediante Custom Skill y vinculación de cuenta;
8. reloj inteligente.

## Voz dentro de MinderCart

Ejemplos futuros:

```text
Agrega dos paquetes de sparkling water, nota cherry.
Necesito leche, huevos, café y servilletas.
```

La voz deberá interpretar:

- artículo;
- cantidad;
- unidad;
- nota;
- tienda cuando se mencione.

## Primera fase — voz dentro de MinderCart

Objetivo:

- validar si las personas realmente prefieren dictar artículos;
- medir frecuencia de uso;
- detectar errores de reconocimiento en español e inglés;
- validar captura de múltiples artículos en una sola frase;
- confirmar el valor antes de construir integraciones externas.

Experiencia recomendada:

```text
presionar micrófono
→ dictar uno o varios artículos
→ interpretar artículo, cantidad, unidad, nota y tienda
→ mostrar revisión/confirmación
→ guardar mediante la misma lógica segura de Mi Lista
```

Ejemplos:

```text
Agrega leche, huevos y café.
Agrega dos paquetes de agua mineral, nota limón.
Necesito servilletas en Costco.
```

La primera fase no debe:

- escribir directamente en storage saltando las validaciones existentes;
- mostrar éxito antes de confirmar `added === true`;
- convertir la nota en atributo global del catálogo;
- crear duplicados por reintentos del reconocimiento;
- guardar audio sin una razón aprobada y una actualización de privacidad.

## Segunda fase — API cloud común

Antes de conectar Siri o Alexa se requiere una capa de servicio que permita:

- autenticación segura;
- identificación de usuario;
- identificación de grupo/workspace;
- comando idempotente mediante `requestId`;
- deduplicación;
- validación de artículo, cantidad, unidad, nota y tienda;
- registro de origen:
  - `app_voice`;
  - `siri`;
  - `alexa`;
- respuesta real de éxito o rechazo;
- manejo de offline y reintentos;
- auditoría mínima sin almacenar audio por defecto;
- reglas de conflicto multi-dispositivo.

Contrato conceptual futuro:

```text
POST /voice/items
usuario + workspace + requestId + origen + artículos interpretados
→ validar
→ deduplicar
→ guardar
→ responder resultado real por artículo
```

## Tercera fase — Siri

Ruta prevista:

- aplicación o extensión nativa compatible con App Intents;
- acción `Agregar a Mi Lista`;
- parámetros para artículo, cantidad, unidad, nota y tienda;
- soporte para Siri y Atajos;
- confirmación hablada basada en la respuesta real de la API.

Ejemplo futuro:

```text
Siri, agrega dos paquetes de agua mineral a MinderCart, nota limón.
```

La aplicación web actual no ofrece por sí sola la integración completa de App Intents. Esta fase depende de una superficie nativa aprobada.

## Cuarta fase — Alexa

Ruta prevista:

- Custom Skill de MinderCart;
- vinculación segura de cuenta;
- flujo OAuth con autorización robusta;
- intents bilingües;
- endpoint conectado a la misma API de comandos;
- confirmación hablada basada en el resultado real.

Ejemplo futuro:

```text
Alexa, dile a MinderCart que agregue leche, huevos y café.
```

No asumir que MinderCart puede sustituir o sincronizar automáticamente la lista nativa de compras de Alexa sin validar capacidades, permisos y experiencia vigentes.

## Siri / Alexa — requisitos comunes

No pueden depender solo de `localStorage`.

Se requiere:

- cuenta autenticada;
- cloud source of truth;
- API segura;
- deduplicación;
- identificación de usuario;
- identificación de grupo;
- registro de origen;
- reglas de conflicto.

## Criterios para avanzar

Avanzar de voz dentro de la app a la API cuando exista evidencia de:

- uso repetido por testers;
- ahorro de tiempo percibido;
- precisión aceptable en español e inglés;
- demanda real fuera de la app;
- reglas suficientes de identidad y deduplicación.

Priorizar Alexa si el uso dominante ocurre en cocina/hogar mediante altavoz inteligente.

Priorizar Siri si predominan iPhone, Apple Watch y Atajos.

No iniciar Siri y Alexa simultáneamente. Elegir primero una plataforma según evidencia de la beta.

No iniciar estas integraciones antes de cerrar persistencia, restore, API segura, deduplicación y matriz mínima de conflictos.

## Estado actual

```text
ESTRATEGIA APROBADA
IMPLEMENTACIÓN NO INICIADA
NO CONSUME v394
```

---

# 16. ARCHIVOS DELICADOS

```text
src/lib/mindercart/storage.ts
src/lib/mindercart/types.ts
src/lib/mindercart/hooks.ts
src/lib/firebase/use-user-bootstrap.ts
src/lib/firebase/resolve-user-bootstrap.ts
src/lib/firebase/auth-actions.ts
src/lib/firebase/auth-context.tsx
src/app/page.tsx
src/app/in-store/page.tsx
src/app/general-list/page.tsx
src/app/history/page.tsx
src/app/settings/page.tsx
src/app/layout.tsx
src/app/beta/layout.tsx
src/app/beta/page.tsx
src/app/privacy/layout.tsx
src/app/privacy/page.tsx
src/app/terms/layout.tsx
src/app/terms/page.tsx
src/components/mindercart/Shell.tsx
```

## Especialmente propensos a regresiones

```text
src/lib/mindercart/storage.ts
src/app/page.tsx
src/app/in-store/page.tsx
src/app/general-list/page.tsx
src/app/history/page.tsx
src/app/settings/page.tsx
src/components/mindercart/Shell.tsx
src/lib/firebase/use-user-bootstrap.ts
```

Antes de editar cualquiera:

- usar el archivo actual exacto;
- localizar el bloque;
- verificar cambios aprobados anteriores;
- no reconstruirlo;
- no aceptar ciegamente una versión completa durante conflictos;
- comparar antes de reemplazar.

---

# 17. REGLAS DE TRABAJO OBLIGATORIAS

## Regla central

```text
diagnóstico antes de modificar
```

## Fuente de verdad

Trabajar exclusivamente con el archivo actual exacto que el usuario suba en ese turno.

No usar:

- archivos antiguos del chat;
- ZIP anteriores;
- ramas viejas;
- copias históricas;
- archivos “parecidos”.

## Alcance

- un archivo por turno cuando sea posible;
- un módulo por turno;
- no mezclar cambios;
- no rehacer módulos;
- no ampliar alcance sin autorización;
- declarar qué se tocará;
- declarar qué no se tocará;
- detenerse cuando falte un archivo.

## ZIP

No generar ZIP hasta que el usuario escriba:

```text
ok adelante
```

## Antes de editar

Responder en corto:

1. causa o diagnóstico;
2. archivo exacto;
3. cambio puntual;
4. qué se conserva;
5. nombre de parche;
6. esperar `ok adelante`.

## Entrega después de aprobación

Entregar:

- archivo actualizado;
- ZIP con únicamente `/src`;
- nombre del parche;
- resumen del diff;
- comandos de build;
- comandos de commit;
- comandos de push;
- pruebas exactas.

## No afirmar lo que no se ejecutó

No decir:

- build aprobado;
- tests aprobados;
- Vercel aprobado;
- commit creado;
- push realizado;

salvo que exista evidencia o confirmación del usuario.

## Después de prueba

Cuando el usuario confirme que funcionó:

- tratar el parche como probado;
- asumir que ya quedó committeado conforme a la regla operativa;
- no volver a ofrecer la ruta “si no está committeado”;
- pasar a freeze o promoción según corresponda.

## Freeze y main

Después de una validación importante:

- crear freeze en testing;
- promover a main cuando cierre un bloque coherente;
- crear main release;
- actualizar este handoff.

---

# 18. CONVENCIÓN DE PARCHES

Formato:

```text
mindercart_<modulo>_<cambio>_patch_vNN
```

Último parche:

```text
mindercart_onboarding_portal_patch_v390
```

Siguiente número:

```text
v391
```

---

# 19. NO MEZCLAR EN EL MISMO TURNO

Sin autorización explícita, no combinar:

- PDF;
- WhatsApp;
- Settings/Tiendas;
- categorías;
- footer/layout;
- Mis Listas;
- Historial;
- Carrito;
- De Compras;
- auth/bootstrap;
- persistencia cloud;
- grupos.

Cuando dos archivos sean indispensables, explicar primero por qué deben cambiar coordinadamente.

---

# 20. DECISIONES QUE NO DEBEN REABRIRSE SIN RAZÓN FUERTE

1. Una cuenta tiene como máximo un grupo.
2. Otro contexto requiere otra cuenta.
3. La primera franja azul del header queda limpia.
4. La segunda franja azul del módulo no se toca sin autorización.
5. Grupo/rol se muestra en Settings y menú hamburguesa.
6. Nota pertenece a ocurrencia, no al catálogo global.
7. Nota diferente mantiene ocurrencia separada.
8. Cantidad no forma parte de la identidad de ocurrencia.
9. El modo compacto debe conservar legibilidad y área táctil.
10. No mezclar voz, Siri, Alexa, watch y persistencia en un solo parche.
11. No habilitar billing antes de validar disposición de pago.
12. No prometer colaboración Familiar conflict-safe hasta completar la matriz formal multi-dispositivo.

---

# 21. CASOS DE PRUEBA CRÍTICOS ACUMULADOS

## Mis Listas grandes

- crear lista de más de 200 artículos;
- seleccionar todo;
- agregar;
- confirmar una sola operación;
- recargar;
- confirmar persistencia;
- quitar algunos;
- volver a agregar;
- confirmar ausencia de duplicados.

## Doble eliminación

- lista extensa;
- presionar Quitar repetidamente;
- solo un artículo debe eliminarse;
- el siguiente no debe recibir el segundo toque.

## Nota por ocurrencia

- mismo artículo sin nota;
- mismo artículo con nota A;
- mismo artículo con nota B;
- deben convivir;
- misma nota debe acumular conforme a reglas;
- nota debe viajar por todos los módulos.

## Compacto

- nombres largos;
- con/sin nota;
- cantidades largas;
- Mover;
- marcar/desmarcar;
- iPhone/Android;
- tres escalas de fuente;
- español/inglés.

## Bootstrap

- iniciar sesión;
- cambiar idioma inmediatamente;
- primer cambio debe mantenerse;
- repetir con font scale;
- repetir con tienda;
- recargar;
- verificar cloud restore;
- otro navegador sin cambios durante carga.

## Persistencia de Mis Listas

- crear lista;
- cerrar sesión;
- volver a entrar;
- confirmar restore;
- borrar lista;
- refresh inmediato;
- confirmar que no reaparece;
- repetir con lista nueva;
- repetir con lista antigua;
- confirmar que no se requiere una segunda acción.

## Identidad bilingüe

- crear `Leche` desde sugerencia en español;
- cambiar a inglés;
- abrir Mis Listas;
- agregar una sola vez;
- confirmar `Milk` en Mi Lista;
- confirmar `In My List`;
- eliminar;
- volver a agregar;
- repetir en dirección inglés → español.

## Identidad personalizada

- crear artículo personalizado nuevo;
- guardar en Mis Listas;
- agregar una sola vez;
- confirmar que permanece;
- refresh inmediato;
- eliminar;
- volver a agregar una sola vez;
- confirmar que no se traduce;
- repetir con nota distinta.

## Captura directa de artículo personalizado

- escribir `Jitomate`;
- elegir categoría;
- elegir cantidad y unidad;
- agregar;
- confirmar aparición inmediata;
- confirmar que el mensaje de éxito aparece solo después del guardado;
- refresh;
- confirmar persistencia;
- quitar;
- volver a agregar;
- repetir con `Cilantro fresco`;
- repetir con artículo del catálogo;
- repetir español ↔ inglés;
- confirmar que una referencia inválida desde lista guardada sigue bloqueada;
- probar en deployment correcto de `testing`;
- repetir en `main`;
- registrar URL y commit probado.

## Onboarding

- limpiar:

```javascript
localStorage.removeItem("mindercart.onboardingSeen.v1");
location.reload();
```

- confirmar aparición en primera visita;
- confirmar que navegación inferior queda detrás;
- confirmar que no se puede interactuar con el fondo;
- confirmar que el modal está por encima del header y de la navegación inferior;
- confirmar scroll interno con letra grande;
- confirmar que `Empezar / Get started` permanece alcanzable en iPhone;
- presionar `Empezar / Get started`;
- recargar;
- confirmar que no reaparece;
- repetir en español;
- repetir en inglés;
- revisar textos largos en móvil;
- confirmar Mi Lista;
- confirmar Mis Listas;
- confirmar artículos personalizados;
- confirmar que no cambia persistencia cloud.
- para simular primera visita sin crear usuario, usar navegación privada y el dominio individual del deployment;
- no usar el alias permanente de `testing` si ese navegador ya tiene sesión o la bandera local guardada.

## Landing / beta

- abrir `/beta` en computadora;
- abrir `/beta` en teléfono;
- confirmar scroll completo;
- cambiar English / Español;
- confirmar logo real en header y simulación;
- confirmar ausencia de navegación inferior;
- confirmar que `/` conserva navegación inferior;
- abrir formulario desde ambos CTA;
- confirmar que abre:
  - `https://forms.gle/hBYo5seaTRWJS47v6`;
- enviar respuesta de prueba;
- confirmar respuesta en Google Forms;
- presionar `Copy support email / Copiar correo de soporte`;
- confirmar estado `Email copied / Correo copiado`;
- pegar y verificar:
  - `mindercartapp@gmail.com`;
- revisar footer;
- revisar Privacy / Privacidad;
- revisar Terms / Términos;
- ejecutar build y TypeScript.

## Privacidad

- abrir `/privacy` en computadora;
- abrir `/privacy` en iPhone;
- confirmar scroll completo;
- cambiar English / Español;
- confirmar logo;
- confirmar enlace de regreso a `/beta`;
- copiar `mindercartapp@gmail.com`;
- confirmar ausencia de navegación inferior;
- confirmar que `/` conserva navegación inferior;
- abrir Privacy / Privacidad desde `/beta`;
- confirmar que Terms / Términos abre `/terms`;
- ejecutar build;
- confirmar TypeScript;
- confirmar ruta `/privacy` en la salida de Next.js.

## Términos

- abrir `/terms` en computadora;
- abrir `/terms` en iPhone;
- confirmar scroll completo;
- cambiar English / Español;
- confirmar logo;
- confirmar enlace de regreso a `/beta`;
- copiar `mindercartapp@gmail.com`;
- confirmar uso de `MinderCart™`;
- confirmar que se menciona la solicitud federal pendiente;
- confirmar que no se usa `®`;
- confirmar ausencia de navegación inferior;
- confirmar que `/` conserva navegación inferior;
- abrir Terms / Términos desde `/beta`;
- confirmar que Privacy / Privacidad sigue activo;
- ejecutar build;
- confirmar TypeScript;
- confirmar ruta `/terms` en la salida de Next.js.

## PDF

- español: `Lista de Compras`;
- inglés: `Shopping List`;
- notas;
- categorías;
- unidades;
- fecha;
- branding;
- impresión y vista móvil.

---

# 22. ÁRBOL RESUMIDO

```text
C:\dev\mindercart-web
└─ src
   ├─ app
   │  ├─ layout.tsx
   │  ├─ page.tsx
   │  ├─ beta
   │  │  ├─ layout.tsx
   │  │  └─ page.tsx
   │  ├─ privacy
   │  │  ├─ layout.tsx
   │  │  └─ page.tsx
   │  ├─ terms
   │  │  ├─ layout.tsx
   │  │  └─ page.tsx
   │  ├─ general-list
   │  │  └─ page.tsx
   │  ├─ in-store
   │  │  └─ page.tsx
   │  ├─ history
   │  │  └─ page.tsx
   │  ├─ settings
   │  │  └─ page.tsx
   │  ├─ shopping-list
   │  │  └─ page.tsx
   │  └─ globals.css
   ├─ components
   │  └─ mindercart
   │     └─ Shell.tsx
   └─ lib
      ├─ firebase
      │  ├─ use-user-bootstrap.ts
      │  ├─ resolve-user-bootstrap.ts
      │  ├─ save-user-data.ts
      │  ├─ auth-context.tsx
      │  └─ shared-list-actions.ts
      └─ mindercart
         ├─ storage.ts
         ├─ seed-items.ts
         ├─ i18n.ts
         ├─ hooks.ts
         └─ types.ts
```

---

# 23. PROTOCOLO PARA CONFLICTOS DE GIT

Cuando aparezca conflicto, especialmente en:

```text
src/lib/mindercart/storage.ts
src/app/page.tsx
src/app/in-store/page.tsx
```

No ejecutar automáticamente:

```text
git checkout --ours
git checkout --theirs
```

Proceso:

1. detenerse;
2. copiar salida completa;
3. revisar ambos lados;
4. identificar cambios aprobados de cada rama;
5. reconciliar quirúrgicamente;
6. build;
7. pruebas;
8. commit del merge.

Para deshacer:

- cambio empujado: preferir `git revert`;
- cambio local no empujado: puede usarse `git reset --hard`;
- variación nueva: parche nuevo.

---

# 24. CÓMO ARRANCAR EL SIGUIENTE CHAT

Pegar este handoff y decir:

```text
Trabajaremos desde:
testing freeze: mindercart-testing-freeze-v393
testing commit: 1a6a4fd
testing freeze SHA completo: 1a6a4fdd46444b70b08421b66ac5996605aae716
main release: mindercart-main-release-v393
main commit: 5866770
main SHA completo: 5866770e4b75a088a2978c1de0d7b8677dfd74ed
siguiente versión de código disponible: v394

El bloque v391–v393 cerró:
- confirmación antes de abandonar una lista nueva con cambios;
- mensaje bilingüe más claro;
- respaldo recuperable antes de logout;
- espera cloud visible limitada a 6 segundos cuando existe respaldo;
- idioma, artículos y Mis Listas restaurados después de login;
- build aprobado;
- TypeScript aprobado;
- freeze publicado;
- promoción a main;
- main release publicado.

Pendiente:
- confirmar deployment de main v393 Ready.

Testers reales:
usan main.

Testing:
confirmar siempre URL y commit del deployment.
No usar e-testing.vercel.app mientras devuelva DEPLOYMENT_NOT_FOUND.

Landing:
/beta

Formulario:
https://forms.gle/hBYo5seaTRWJS47v6

Privacidad:
/privacy

Términos:
/terms

Soporte:
mindercartapp@gmail.com

El siguiente bloque recomendado es:
continuar beta privada, registrar reportes reales y retomar la publicación independiente de mindercart-site cuando no haya bloqueadores de la app.

Primero diagnóstico.
Usaremos únicamente archivos actuales exactos para cualquier cambio de código.
No ZIP sin “ok adelante”.
No mezclar módulos.
```

Después:

1. confirmar ramas y SHAs;
2. confirmar `git status`;
3. confirmar si el reporte ocurre en `main` o `testing`;
4. registrar URL/deployment;
5. reproducir;
6. clasificar impacto;
7. solicitar archivos actuales exactos;
8. corrección quirúrgica;
9. build;
10. Vercel Testing;
11. freeze;
12. main cuando el arreglo esté validado.

# 25. RESUMEN EJECUTIVO DE ARRANQUE

```text
Producto:
MinderCart

Estado de marca:
Solicitud USPTO activa
Serial 99898962
Usar MinderCart™
No usar ® mientras no exista registro concedido

Dominio:
MinderCart.com
Ya pertenece al usuario

Testing estable:
mindercart-testing-freeze-v393

Testing SHA:
1a6a4fd

Testing freeze SHA completo:
1a6a4fdd46444b70b08421b66ac5996605aae716

Main release:
mindercart-main-release-v393

Main SHA:
5866770e4b75a088a2978c1de0d7b8677dfd74ed

Última versión:
v393

Siguiente versión de código disponible:
v394

Bloque recién cerrado:
Protección de listas nuevas y logout seguro
+ confirmación antes de descartar una lista nueva
+ copy bilingüe claro
+ snapshot local recuperable antes de logout
+ espera cloud limitada a 6 segundos cuando existe respaldo
+ restauración validada después de login
+ build
+ TypeScript
+ freeze
+ promoción a main
+ main release

Pendiente:
+ confirmar deployment main v393 Ready

Testers:
usan main

Testing:
usar deployment Ready del commit correcto
no usar alias roto e-testing.vercel.app

Landing:
/beta

Formulario:
https://forms.gle/hBYo5seaTRWJS47v6

Privacidad:
/privacy

Términos:
/terms

Soporte:
mindercartapp@gmail.com

Beta privada:
EN CURSO

Reportes críticos cerrados:
v386 — falso éxito al agregar Jitomate
v387 — bloqueo al abrir Mis Listas con catálogo personalizado grande
v388 — bootstrap duplicado durante login
v389 — guardado cloud duplicado durante logout
v390 — onboarding móvil bloqueado por la navegación inferior
v391 — lista nueva descartada sin confirmación
v392 — mensaje de salida ambiguo
v393 — logout bloqueado por una petición cloud lenta

Estado:
CORREGIDOS EN v386–v393
PUBLICADO EN MAIN

Siguiente trabajo recomendado:
Continuar captación y primera cohorte
+ registrar dispositivo, idioma, URL y versión
+ tres compras reales
+ feedback
+ priorizar bloqueadores y regresiones

Estrategia futura aprobada:
voz dentro de MinderCart
+ validación con testers
+ API cloud segura y deduplicada
+ elegir Siri o Alexa según evidencia
+ no implementar ambas simultáneamente

Después:
Correcciones pequeñas v394+
+ matriz multi-dispositivo
+ validación Individual / Familiar
+ validación de precio
+ billing

Pendiente técnico-comercial:
Matriz formal de conflictos simultáneos multi-dispositivo.

Regla:
Diagnóstico primero.
Confirmar deployment.
Un archivo actual exacto por turno.
No ZIP sin “ok adelante”.
No mezclar módulos.
No inventar SHA.
```
