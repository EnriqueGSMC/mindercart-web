Handoff completo para arrancar otro chat en MinderCart:

Última actualización:
11 de julio de 2026

Base estable actual en testing:
mindercart-testing-freeze-v356

Release actual en main:
mindercart-main-release-v356

Comandos para volver exactamente al punto estable en testing:

git checkout testing
git reset --hard mindercart-testing-freeze-v356
rmdir /s /q .next
npm run build

Comandos para volver exactamente al release de main:

git checkout main
git reset --hard mindercart-main-release-v356
rmdir /s /q .next
npm run build

Estado actual confirmado:

testing quedó congelado en la rama:
mindercart-testing-freeze-v356

testing apunta al commit:
e604b84

commit del parche en testing:
e604b84 mindercart_my_list_remove_double_click_guard_patch_v356

main quedó actualizado al release:
mindercart-main-release-v356

main apunta al commit:
99976c2

commit de merge en main:
99976c2 merge testing freeze v356 into main

Backup previo útil de main:
mindercart-main-backup-before-v342

testing y main están alineados funcionalmente en v356
testing y main compilan correctamente
build de producción aprobado con Next.js 16.1.6

validación crítica heredada de v355:
prueba en Vercel Testing aprobada con 220 artículos
agregado masivo inmediato
sin bloqueo
sin errores
sin pérdida de datos
sin duplicados

validación de v356:
build aprobado
testing freeze creado
main actualizado
main release creado
no quedó documentada en este handoff una prueba específica posterior en Vercel del bloqueo visual;
si se desea cerrar también esa evidencia, hacer un smoke test breve:
presionar Quitar repetidamente en una lista extensa
y confirmar que solo se elimina un artículo

Hito de producto / marca:

Fecha importante:
22 de junio de 2026

MinderCart™
Serial Number USPTO:
99898962

MinderCart pasó de ser concepto a solicitud oficial ante la USPTO.
Esto ya debe influir en la toma de decisiones:
menos experimento visual,
más claridad,
más consistencia,
más sensación de producto serio.

Regla oficial actual de producto sobre grupos:

una cuenta = un solo contexto de grupo

esa cuenta puede estar en uno de estos estados:
- individual, sin grupo
- titular de un grupo
- integrante de un grupo

si una misma persona quiere otro grupo para otro contexto
por ejemplo familia y negocio
debe crear otra cuenta con otro correo/usuario

por ahora NO se soportan múltiples grupos por una misma cuenta
y NO se debe cambiar esa lógica en esta etapa

Resumen de lo ya funcional:

De Compras:
categorías correctas según idioma
WhatsApp por tienda con categorías y orden alfabético
botones WhatsApp/PDF ajustados
visual de artículos con origen de lista:
ejemplo:
Arroz (Paella)
estilo visual del origen de lista más ligero y pequeño, alineado con Carrito

PDF:
header refinado
avatar integrado
categorías
orden alfabético
checkboxes
visual móvil alineada con impresión

Configuración / Tiendas:
modal corregido para iPhone

Footer azul:
traducido según idioma
carrito superior removido del header
contador del carrito visible en footer
badge más grande y legible

Mi Lista:
campo principal dice Necesito / I need

Mis Listas:
funcional dentro de Mi Lista
crear, editar, borrar
abrir lista
agregar artículos a Mi Lista
confirmación para renombrar lista
artículos agregados desde Mis Listas muestran origen tipo:
Arroz (Paella)
al borrar una lista, también se limpian de Mi Lista los artículos ligados a esa lista
al abrir una lista creada, las palomitas ya no dependen de artículos normales de Mi Lista
ejemplo correcto:
si existe Arroz en Mi Lista normal, eso no marca Arroz dentro de Paella
pueden convivir en Mi Lista:
Arroz (Paella)
Arroz
agregado masivo desde listas personalizadas grandes optimizado en v355
prueba aprobada con 220 artículos:
agregado inmediato,
sin bloqueo,
sin errores,
sin duplicados
protección contra doble eliminación agregada en v356
al quitar un artículo:
- se bloquean temporalmente los botones Quitar
- el artículo afectado muestra Quitando… / Removing…
- se evita que un segundo clic alcance al artículo que sube a la misma posición
- el bloqueo se libera después de que la lista actualizada ya fue renderizada

Carrito:
artículos con origen de lista se muestran arriba como:
Arroz (Paella)
categorías y orden alfabético conservados
la sección “Algo te hace falta?” ya no debe marcar como seleccionado un artículo normal solo porque exista uno con origen de lista
caso objetivo:
si existe Arroz (Paella), abajo Arroz debe poder quedar libre para agregarse como artículo normal separado
el botón de terminar categoría quedó reacomodado para no perderse con el footer azul

Historial:
puedes abrir una compra pasada por fecha
ver los artículos comprados
entrar al modo Comprar de nuevo
seleccionar artículos con checkbox
agregar seleccionados a Mi Lista
hacer recompra completa sin duplicar artículos
mostrar confirmación antes de ejecutar la recompra completa

Grupo / Plan grupal / Settings:
crear grupo pide nombre
el nombre del grupo no acepta vacío ni solo espacios
la creación de grupo quedó más clara en copy y mensajes
la invitación pendiente funciona
aceptar invitación funciona
owner e integrante comparten datos correctamente
artículos y listas creados por un integrante se reflejan correctamente para el owner
los artículos personalizados volvieron a mostrarse
los artículos personalizados ya no dependen de varios refresh para cargar
los artículos personalizados en Settings ya salen en orden alfabético
el integrante que ya pertenece a un grupo ya no ve:
Crear grupo
Invitar integrante
el bloque de grupo en Settings ya distingue mejor estados:
individual
invitación pendiente
titular
integrante
el estado visual falso inicial en Settings quedó corregido
cuando ya pertenece a grupo, el bloque quedó más claro:
Grupo: [nombre]
Administras este grupo.
o
Grupo: [nombre]
Perteneces a este grupo.

Idioma / preferencias visuales:
el cambio de idioma ya se persiste inmediatamente desde Settings
ya no depende de submit oculto
al navegar entre módulos el idioma ya se conserva
al cerrar sesión ya no se pierde:
- idioma
- tienda preferida
- tamaño de fuente

Shell / menú hamburguesa:
la primera franja azul superior debe mantenerse limpia como identidad de marca
logo
MinderCart
tagline
menú

la segunda franja azul del módulo tampoco debe tocarse salvo autorización explícita

por ahora el rol Titular / Integrante ya se ve en dos lugares:
- Settings
- menú hamburguesa

en el menú hamburguesa el bloque aprobado actual es:
renglón 1 izquierda:
Grupo: [nombre]
con el nombre del grupo en negritas
renglón 1 derecha:
Rol: Titular
o
Rol: Integrante
con Titular / Integrante en negritas
renglón 2:
Titular:
Administras este grupo.
Integrante:
Eres parte de este grupo.

no mover por ahora grupo/rol a la primera franja azul

Secuencia reciente importante de Settings / Grupo / Shell:

v338
restauración quirúrgica de lógica familiar/grupal sobre base moderna
objetivo:
recuperar invitación pendiente
aceptar invitación
quitar integrante
base:
src/app/settings/page.tsx

v340
build fix para settings al quitar dependencia de exports inexistentes en storage

v341
restauración de visualización de artículos personalizados basada en itemsMaster

v342
type fix del seed para artículos personalizados
freeze bueno:
mindercart-testing-freeze-v342
commit:
f0c36ed

v343
ajuste de hidratación para artículos personalizados
ya no requieren varios refresh para aparecer
freeze:
mindercart-testing-freeze-v343
commit:
c19415f
main release correspondiente:
mindercart-main-release-v343
commit:
731916e

v344
pulido de copy del flujo de nombre del grupo
sirvió como paso intermedio de claridad

v345
reconocimiento de miembro activo
integrante ya no debe ver crear grupo / invitar integrante

v346
claridad final del estado de grupo en Settings
evita estado falso inicial
elimina error técnico crudo visible al usuario
simplifica el bloque de grupo para titular e integrante
freeze bueno:
mindercart-testing-freeze-v346
commit:
e5eb735
main release correspondiente:
mindercart-main-release-v346
commit:
1974889

v347
experimento de mostrar contexto de grupo en la primera franja azul del Shell
resultado:
rechazado por UX
se veía menos limpio
exhibía demasiado el retraso de sesión/grupo
NO tomar como base

v348
reversión conceptual del experimento del Shell
resultado:
la decisión de producto fue dejar la primera franja azul limpia
NO usar v347 como base futura

v349
primer intento de mostrar grupo / rol dentro del menú hamburguesa
resultado:
dirección correcta
copy y layout todavía intermedios
no tomarlo como freeze final

v350
type fix del Shell para compilar el bloque de grupo / rol dentro del menú

v351
ajuste final aprobado del bloque de grupo / rol dentro del menú hamburguesa
freeze:
mindercart-testing-freeze-v351
commit:
869152b
main release correspondiente:
mindercart-main-release-v351
commit:
48ad87a

v352
persistencia inmediata de idioma desde Settings
el cambio de idioma ya no depende de submit oculto
al navegar entre módulos se conserva correctamente

v353
logout conserva preferencias visuales
al cerrar sesión ya no se pierde:
- idioma
- tienda preferida
- tamaño de fuente

v354
artículos personalizados en Settings ahora salen en orden alfabético
freeze:
mindercart-testing-freeze-v354
commit:
confirmar SHA exacto con:
git rev-parse --short mindercart-testing-freeze-v354
main release correspondiente:
mindercart-main-release-v354
commit:
fbe2fd4

v355
parche de rendimiento para agregado masivo desde listas personalizadas grandes
nombre del commit en testing:
mindercart_saved_lists_mass_add_performance_patch_v355

archivos modificados:
src/app/page.tsx
src/lib/mindercart/storage.ts

diagnóstico confirmado:
page.tsx llamaba addQuickNeed una vez por cada artículo seleccionado
cada addQuickNeed hacía múltiples lecturas completas del estado
cada artículo provocaba una escritura completa en localStorage
cada escritura emitía CHANGE_EVENT
hooks.ts respondía a cada evento leyendo nuevamente todo el estado

con más de 200 artículos, el flujo anterior podía provocar:
- cientos de readState()
- cientos de JSON.stringify()
- cientos de localStorage.setItem()
- cientos de CHANGE_EVENT
- bloqueo aparente de la interfaz
- errores después de una operación parcialmente completada

solución implementada:
se agregó una operación masiva específica en storage.ts
procesa todos los artículos en memoria
hace una sola lectura inicial
hace una sola escritura final
emite un solo evento
addQuickNeed individual se conserva para los flujos de un solo artículo
page.tsx sustituyó únicamente el forEach masivo por una llamada a la nueva función

freeze bueno actual:
mindercart-testing-freeze-v355
commit:
0b2ca36

release actual en main:
mindercart-main-release-v355
commit:
a6d4efe

validación en Vercel Testing:
se generó una lista temporal de 220 artículos
Seleccionar todo + Agregar seleccionados a Mi Lista fue prácticamente inmediato
la app no se bloqueó
no mostró error
los 220 artículos quedaron agregados
después de recargar siguieron guardados
al volver a abrir la lista aparecieron como Ya está en Mi Lista
al quitar cinco y volver a seleccionar todo, agregó únicamente esos cinco
no creó duplicados
agregar un artículo individual siguió funcionando
editar unidad/cantidad, quitarlo y volverlo a agregar conservó los cambios

resultado:
v355 aprobado
build aprobado
testing freeze creado
main actualizado
main release creado

v356
protección contra doble eliminación en Mi Lista

nombre del commit en testing:
mindercart_my_list_remove_double_click_guard_patch_v356

archivo modificado:
src/app/page.tsx

problema observado:
en listas extensas,
al quitar un artículo individual,
la interfaz podía tardar aproximadamente 1–2 segundos en reacomodar las filas

riesgo UX:
después de desaparecer la primera fila,
el siguiente artículo podía subir a la misma posición
y un segundo clic rápido podía alcanzar su botón Quitar

diagnóstico:
el retraso provenía del flujo individual completo:
lectura del estado,
eliminación,
serialización,
escritura,
evento de cambio,
nueva lectura,
agrupación,
ordenamiento y renderizado

objetivo puntual de v356:
proteger la interacción
sin modificar la persistencia
sin cambiar storage.ts
sin tocar el agregado masivo v355

solución implementada:
- bloqueo inmediato con useRef para impedir una segunda ejecución
- estado removingActiveItemId para identificar el artículo en proceso
- deshabilitación temporal de todos los botones Quitar
- texto Quitando… / Removing… en el artículo afectado
- atenuación temporal de los demás botones
- liberación del bloqueo después de que el artículo desaparece del estado
  y transcurren dos requestAnimationFrame
- liberación segura también en caso de error

qué NO cambió:
- removeActiveItem
- storage.ts
- hooks.ts
- addQuickNeeds
- Mis Listas
- edición de artículos
- cantidades
- unidades
- tiendas
- orden alfabético
- Firebase
- Shell
- otros módulos

freeze actual:
mindercart-testing-freeze-v356
commit:
e604b84

release actual en main:
mindercart-main-release-v356
commit:
99976c2

build:
aprobado con Next.js 16.1.6

resultado:
v356 congelado en testing
v356 promovido a main
main release v356 creado

nota importante:
v356 protege contra el doble clic accidental,
pero no pretende eliminar el tiempo real de 1–2 segundos
que puede tomar el reacomodo de una lista muy grande.
Si más adelante se quiere reducir ese tiempo,
debe abrirse un diagnóstico de rendimiento separado
y no mezclarse con la protección UX ya aprobada.

Decisiones de producto ya tomadas y que NO deben reabrirse sin razón fuerte:

1.
una cuenta = un solo grupo como máximo

2.
si una persona quiere otro grupo para otro contexto
debe usar otra cuenta

3.
la primera franja azul del header debe quedar limpia
no poner ahí grupo/rol por ahora

4.
la segunda franja azul del módulo tampoco debe tocarse
salvo autorización explícita

5.
el lugar actual aprobado para mostrar con más claridad si eres Titular o Integrante es:
- Settings
- menú hamburguesa

6.
los cambios deben seguir siendo quirúrgicos y de un módulo por turno

7.
cuando un diagnóstico confirme que una corrección requiere dos archivos coordinados,
por ejemplo page.tsx + storage.ts,
solo hacerlo con autorización explícita
y limitando el cambio al flujo exacto aprobado

Definición actual para futura edición de artículos con lápiz:

todavía NO está implementado
pero la definición funcional acordada hasta ahora es esta:

Artículos base:
no se editan globalmente

Artículos personalizados:
sí pueden editarse globalmente,
pero solo desde Settings > Artículos personalizados

Lápiz dentro de una lista:
debe editar solo la ocurrencia en esa lista
no el artículo maestro

la edición en lista debe afectar únicamente:
- nombre visible en esa lista
- nota opcional de esa lista

la nota debe pertenecer a la ocurrencia del artículo dentro de la lista,
no al catálogo base ni al personalizado maestro

si después se implementa el lápiz en Mi Lista,
la fila debe verse más limpia que hoy
y eliminar el botón grande “Quitar” del renglón
pero la acción de eliminar debe seguir existiendo dentro del flujo del lápiz
por ejemplo dentro de modal / bottom sheet

Problema de rendimiento reportado por tester con listas grandes:

Tema original:
usuario con lista personalizada de más de 200 artículos

Síntoma original:
al seleccionar muchos artículos de una lista tipo QUINCENA y agregarlos a Mi Lista
la app tardaba mucho
podía parecer bloqueada
en un caso tardó alrededor de 2 minutos y sí agregó
en otro caso tardó varios minutos y mostró error

Estado actual:
RESUELTO en v355

Diagnóstico técnico confirmado:
- page.tsx ejecutaba addQuickNeed artículo por artículo
- addQuickNeed hacía lecturas y recorridos completos por cada artículo
- upsertGeneralListItem provocaba otra lectura completa
- writeState serializaba y guardaba todo el estado por cada artículo
- emitChange disparaba CHANGE_EVENT por cada artículo
- hooks.ts respondía a cada evento con otro readState completo

Corrección:
operación masiva con una sola lectura,
procesamiento completo en memoria,
una sola escritura,
un solo evento,
y una sola actualización final de la interfaz

Validación:
prueba real en Vercel Testing con 220 artículos
resultado inmediato
sin bloqueo
sin error
sin pérdida de datos
sin duplicados

Pendiente menor detectado después de v355:

Estado:
RESUELTO funcionalmente en v356

Situación original:
en una lista extensa de más de 200 artículos,
al quitar un artículo individual desde el listado principal,
la interfaz podía tardar aproximadamente 1–2 segundos en actualizar y reacomodar las filas.

Riesgo UX original:
si el usuario volvía a hacer clic después de que la primera fila desaparecía,
el siguiente artículo podía ocupar la misma posición
y existía riesgo de eliminarlo accidentalmente.

Corrección:
v356 agregó un bloqueo inmediato y visual
para que una sola acción de quitar no pueda alcanzar al siguiente artículo.

Alcance:
la corrección protege la interacción,
pero no modifica el costo interno de eliminar y volver a renderizar una lista grande.

Pendiente futuro opcional:
solo si testers consideran molesto el tiempo de 1–2 segundos,
hacer un diagnóstico independiente de rendimiento de eliminación individual.
No reabrir v356 ni mezclar ese análisis con nota por artículo,
modo compacto,
voz u otros módulos.


Calibración estratégica de producto — 11 de julio de 2026:

Documento creado:
MinderCart_Documento_General_Calibracion_Estrategica_2026-07-11.docx

Principio central:
MinderCart debe combinar
la rapidez y claridad de una lista de papel
con la memoria,
automatización,
reutilización
y colaboración de una app.

Competidor real observado:
muchos usuarios siguen usando una hoja de papel
porque ofrece una lista compacta,
renglón por renglón,
visible de un vistazo
y fácil de consultar durante la compra.

Líneas estratégicas acordadas para análisis:

1) Nota o preferencia por ocurrencia de artículo

Ejemplo:
Sparkling water
Cherry

La nota debe pertenecer a la ocurrencia del artículo dentro de una lista,
no necesariamente al artículo maestro global.

Objetivo:
permitir especificaciones como:
- Cherry
- Orange
- sin azúcar
- tamaño familiar
- marca preferida
- maduro
- para la receta del domingo

Decisión funcional todavía por cerrar:
si dos ocurrencias con notas diferentes deben mantenerse como renglones separados
aunque compartan artículo,
unidad y tienda.

Dirección recomendada:
mismo artículo + misma unidad + misma tienda + misma nota
puede acumular cantidad

mismo artículo + nota diferente
debe conservarse como ocurrencia separada

La nota idealmente debe acompañar el flujo:
lista guardada
→ Mi Lista
→ De Compras
→ Historial

Antes de implementar,
definir por separado si también debe aparecer en:
- WhatsApp
- PDF
- recompra
- sugerencias
- voz

2) Modo de compra compacto

Problema:
la pantalla de compra actual puede ocupar demasiado espacio vertical
comparada con una lista de papel.

Objetivo:
mostrar más artículos visibles por pantalla
sin perder legibilidad ni facilidad táctil.

Dirección recomendada:
- encabezados de categoría delgados
- un renglón principal por artículo
- cantidad y unidad alineadas a la derecha
- segundo renglón pequeño solo cuando exista nota
- toda la fila como área táctil
- acciones secundarias fuera del cuerpo principal
- artículo comprado atenuado o tachado
- evitar tarjetas grandes por cada artículo

Posible configuración:
- vista Compacta
- vista Cómoda

Decisión por validar con testers:
si De Compras debe abrir por defecto en modo Compacto.

Principio UX:
densidad visual no significa botones pequeños.
La fila puede ser compacta
y al mismo tiempo conservar una zona táctil segura.

3) Uso práctico del teléfono dentro del supermercado

Problema observado:
caminar,
empujar el carrito,
tomar productos
y sostener el teléfono
no siempre es cómodo.

Respuestas de producto posibles:
- modo táctil más simple y compacto
- soporte del teléfono en el carrito
- filas completas seleccionables
- mantener la posición visual después de marcar
- evitar acciones peligrosas junto al gesto principal
- eventual experiencia de reloj inteligente

4) Captura por voz dentro de MinderCart

Primera etapa recomendada:
botón de micrófono dentro de la app.

Ejemplos:
“Agrega dos paquetes de sparkling water, nota cherry.”
“Necesito leche, huevos, café y servilletas.”

La voz debería poder extraer:
- artículo
- cantidad
- unidad
- nota
- tienda cuando se mencione

Antes de implementar voz:
cerrar primero el modelo de datos de nota,
ocurrencia,
duplicados
y destino de lista.

5) Voz durante la compra

Posible modo explícito:
Iniciar compra por voz

Comandos potenciales:
- Marcar
- Siguiente
- Repetir
- Omitir
- ¿Qué sigue?

No mantener escucha permanente sin una sesión claramente activada.
El supermercado es ruidoso
y existe riesgo de acciones incorrectas.

6) Siri

Dirección futura:
integración mediante una capa nativa iOS
y acciones del sistema.

Posibles acciones:
- agregar artículo
- agregar varios artículos
- abrir Mi Lista
- abrir lista por tienda
- consultar siguiente artículo

La app web por sí sola puede ofrecer voz dentro de la interfaz,
pero una integración profunda con Siri
probablemente requerirá una capa nativa.
Antes de implementar,
volver a verificar la documentación oficial vigente de Apple.

7) Alexa

Pendiente estratégico:
crear una integración propia de MinderCart,
no depender ciegamente de una lista externa.

Dirección considerada:
Skill propia de MinderCart
con vinculación segura de cuenta
y escritura directa sobre la lista del usuario o grupo.

Ejemplos:
“Alexa, dile a MinderCart que agregue leche.”
“Alexa, pregunta a MinderCart qué necesito comprar.”

Antes de implementar:
volver a verificar las capacidades y políticas oficiales vigentes de Amazon,
porque las integraciones de listas pueden cambiar.

8) Requisito arquitectónico para asistentes

Siri,
Alexa
y otros asistentes
no pueden depender exclusivamente del localStorage de un navegador.

Se requiere una fuente cloud autenticada
y una API o capa de servicio segura para:
- consultar lista
- agregar artículo
- actualizar artículo
- marcar artículo
- identificar usuario
- identificar grupo
- evitar comandos duplicados
- registrar origen de la acción

9) Orden estratégico recomendado

Fase 1:
definir Nota por ocurrencia
y Modo Compra Compacta

Fase 2:
prototipo y prueba con usuarios que hoy usan papel

Fase 3:
captura por voz dentro de MinderCart

Fase 4:
consolidar API y persistencia cloud para integraciones externas

Fase 5:
Siri,
Alexa
y eventualmente reloj inteligente

Regla:
no implementar nota,
modo compacto,
voz,
Siri
y Alexa
en un solo parche.
Cada tema requiere definición,
diagnóstico,
archivo actual exacto,
prueba
y freeze independiente.


Pendientes / temas abiertos recomendados:

1) Handoff
actualizar siempre el handoff después de cada freeze/release importante
especialmente cuando cambie testing/main

2) Sesión / Bootstrap
seguir evaluando si “Revisando sesión” tarda demasiado
la idea es que la app se sienta cada vez menos “prototipo”
y más producto estable

3) Mi Lista / lápiz / notas
antes de tocar código, terminar de aterrizar visual y funcionalmente:
modal
copy
campos
qué sí edita
qué no edita
y en qué módulo arranca primero

4) Carrito:
seguir validando con calma el flujo fino de “Algo te hace falta?”
casos a verificar con testers:
marcar
desmarcar
borrar luego en Mi Lista
convivencia entre:
Arroz (Paella)
Arroz
si algo no cuadra, revisar con mucho cuidado:
src/app/general-list/page.tsx
src/lib/mindercart/storage.ts

5) Mostrar origen sourceListName en más módulos:
hoy ya funciona en:
Mi Lista
Carrito
De Compras
pendiente potencial:
Historial más completo
eventualmente WhatsApp / PDF

6) Historial:
seguir puliendo UX visual si hiciera falta
verificar con calma que la armonía visual quede 100% consistente con Carrito

7) Footer móvil:
ya se mejoró el badge y hubo revisión de toque
conviene seguir validando con testers que el tap en footer quede fino en iPhone/Android

8) Comercialización / producto:
seguir reforzando la línea fuerte:
ahorro de tiempo
recompra
listas reutilizables
claridad del hogar
producto serio y confiable
pensar go live lo más pronto posible desde una base estable

9) Eliminación individual en listas grandes:
riesgo de doble clic accidental resuelto en v356
protección implementada en:
src/app/page.tsx

pendiente futuro opcional:
si testers consideran molesto el tiempo de 1–2 segundos,
hacer diagnóstico separado de rendimiento
sin modificar la protección v356

10) Calibración estratégica:
definir antes de tocar código:
- nota por ocurrencia
- reglas de duplicados con notas diferentes
- propagación de nota entre módulos
- modo De Compras compacto
- captura por voz dentro de la app
- arquitectura cloud para Siri/Alexa

documento rector:
MinderCart_Documento_General_Calibracion_Estrategica_2026-07-11.docx

Archivos delicados:

src/lib/mindercart/storage.ts
src/app/in-store/page.tsx
src/app/settings/page.tsx
src/app/layout.tsx
src/app/page.tsx
src/app/history/page.tsx
src/components/mindercart/Shell.tsx
src/app/general-list/page.tsx
src/lib/mindercart/hooks.ts

Archivos especialmente propensos a regresiones:

src/app/in-store/page.tsx
src/lib/mindercart/storage.ts
src/app/page.tsx
src/app/layout.tsx
src/app/history/page.tsx
src/app/general-list/page.tsx
src/app/settings/page.tsx
src/components/mindercart/Shell.tsx
src/lib/mindercart/hooks.ts

Reglas de trabajo obligatorias:

hacer solo cambios puntuales
trabajar sobre un solo archivo por turno cuando sea posible
usar únicamente el archivo actual que yo suba
no usar tags viejos salvo que yo lo pida
no usar zips viejos
no reconstruir el archivo
no rehacer el módulo
no generar zip hasta que yo diga ok adelante

Antes de editar:

dime en corto qué vas a cambiar
confirma qué NO vas a tocar
si necesitas otro archivo, detente y pídemelo
si el archivo actual no contiene el bloque correcto, detente y dímelo
no generes zip hasta que yo diga ok adelante

Flujo de trabajo:

te subo el archivo actual
tú identificas el ajuste puntual
haces solo ese cambio
me entregas:
archivo actualizado
zip con solo src
comandos para probar:
rmdir /s /q .next
npm run build
git add ...
git commit -m "..."
git push origin testing

Regla nueva de operación ya aprendida:
cuando yo diga que ya probé un parche,
asumir que ese parche ya está committeado
y no volver a mandar el camino alterno de “si no está committeado”

Convención de parches:
mindercart_<modulo>_<cambio>_patch_vNN

Numeración actual:

último freeze bueno en testing:
v356

rama:
mindercart-testing-freeze-v356

commit:
e604b84

último release bueno en main:
v356

rama:
mindercart-main-release-v356

commit:
99976c2

últimos intentos no adoptados:
v347
v348

el siguiente parche debe empezar en:
v357

Regla adicional importante:
No mezclar en el mismo turno:

PDF
WhatsApp
Settings / Tiendas
categorías
footer/layout
Mis Listas
Historial
Carrito
De Compras

salvo autorización explícita.

Notas importantes por historial real del proyecto:

ya pasó varias veces que al tocar un archivo delicado se perdió un cambio anterior del mismo archivo
antes de editar:
src/app/page.tsx
src/app/in-store/page.tsx
src/app/history/page.tsx
src/app/general-list/page.tsx
src/lib/mindercart/storage.ts
src/app/settings/page.tsx
src/components/mindercart/Shell.tsx

siempre verificar que se conserven todos los cambios aprobados
no reutilizar archivos viejos del chat
trabajar solo sobre el archivo actual exacto que yo suba en ese turno

Sobre reversión de cambios:
si el objetivo es deshacer completo el último cambio ya empujado,
preferir git revert
si el objetivo es deshacer un cambio no empujado,
puede usarse git reset --hard
si el objetivo es una variación nueva y no reversión exacta,
hacer parche nuevo

Árbol resumido:

C:\dev\mindercart-web
└─ src
   ├─ app
   │  ├─ layout.tsx
   │  ├─ page.tsx
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
      └─ mindercart
         ├─ storage.ts
         ├─ seed-items.ts
         ├─ i18n.ts
         ├─ hooks.ts
         └─ types.ts

Qué hacer al empezar el otro chat:

pegar este handoff
decir cuál es el siguiente cambio puntual
subir el archivo actual exacto del módulo que toca

Si quieres seguir con un pendiente natural, las mejores opciones para el siguiente turno serían:

1.
definir funcionalmente Nota por ocurrencia antes de tocar código:
- dónde se captura
- dónde se muestra
- cuándo diferencia duplicados
- cómo viaja entre Mi Lista, Mis Listas, De Compras e Historial

2.
analizar el archivo actual exacto:
src/app/in-store/page.tsx
para diseñar un Modo Compra Compacta
sin implementar todavía hasta aprobar layout y reglas de interacción

3.
seguir puliendo con calma el flujo fino de Carrito en “Algo te hace falta?”

4.
seguir evaluando la duración de “Revisando sesión” / bootstrap

5.
hacer un smoke test específico de v356 en Vercel:
intentar varios clics rápidos al quitar
y confirmar que únicamente se elimina un artículo

6.
actualizar otra vez el handoff cuando cambie testing/main

Estado de arranque recomendado para el siguiente chat:

testing freeze:
mindercart-testing-freeze-v356
commit:
e604b84

main release:
mindercart-main-release-v356
commit:
99976c2

siguiente versión disponible:
v357

No iniciar un parche nuevo desde archivos del chat.
Cambiar a testing,
confirmar estado limpio,
subir el archivo actual exacto
y hacer diagnóstico antes de editar.