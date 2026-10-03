# MinderCart: guía básica de dictado

## Antes de empezar

Usa siempre la misma versión de MinderCart para configurar y probar: un atajo configurado en testing envía los artículos a testing. Inicia sesión en la cuenta correcta y comprueba que puedes agregar un producto manualmente.

## iPhone: si el atajo ya funciona

No necesitas configurarlo otra vez ni revocar el acceso.

1. Abre Atajos y toca **Agregar a MinderCart** para ejecutarlo. Los tres puntos sirven para editarlo.
2. Di los productos, por ejemplo: «leche, huevos y arroz».
3. Deja de hablar y espera. **No pulses el botón rojo de detener**, porque cancela la ejecución.
4. Regresa a MinderCart y abre **Mi Lista**.

Para notas, usa esta frase:

> Agua mineral nota naranja, siguiente artículo agua mineral nota toronja, siguiente artículo coca.

Debe agregar Agua Mineral con nota naranja, otra Agua Mineral con nota toronja y Coca sin nota. La nota termina al decir **siguiente artículo**. No uses solamente «y» para separar productos después de una nota: esa palabra puede formar parte de la nota.

## iPhone: instalar el atajo listo (testing)

No necesitas crear acciones, encabezados ni campos JSON.

1. En MinderCart **testing**, inicia sesión y entra en **Configuración → Agregar con Siri**. Si aún no está activado, activa el acceso.
2. Toca **Copiar valor completo de Authorization** mientras tu conexión esté visible. Es privada: no la envíes a nadie.
3. Toca **Instalar para Siri en español (testing)** y después **Configurar atajo**. Pega la conexión en el campo Texto y toca **Agregar atajo**. No elijas **Omitir configuración** ni pegues el enlace de iCloud.
4. **Primera prueba, sin Siri:** en Atajos toca el recuadro instalado (**Agregar a MinderCart**), no sus tres puntos. Autoriza reconocimiento de voz, conexión y envío de texto a la dirección de testing de MinderCart cuando el iPhone lo solicite. Cuando escuche, di «Leche nota fría» y espera en silencio. Regresa a **Mi Lista** para comprobar el producto. No necesitas renombrar ni editar el atajo. Si ya existe un atajo funcional con ese nombre, consérvalo: no necesitas reinstalarlo ni revocar su conexión.
5. **Uso diario en español:** activa Siri, di solo «Agregar a MinderCart», espera a que pida el texto y entonces di «Leche nota fría». Guarda silencio y vuelve a Mi Lista. Son dos pasos separados; no necesitas abrir Atajos cada vez. Si el producto no aparece, espera unos segundos y refresca una vez antes de repetir el dictado.

Los idiomas de la app, Siri y Dictar texto son independientes. Agregar a MinderCart volvió a funcionar incluso con Siri en inglés tras eliminar un encabezado vacío del atajo original; no se requirió cambiar claves ni idioma de Siri. Se retiró su Vista rápida y, tras desplegar la recuperación de sincronización, Leche nota avellana apareció inmediatamente con Siri superpuesto a Mi Lista, sin refresh. Algunos artículos anteriormente considerados ausentes estaban al final de la lista: no se deben contar como fallos confirmados. La versión limpia anterior se instaló y agregó desde Atajos; la plantilla española ahora enlazada fue revisada (PENDIENTE, POST, un único Authorization, JSON utterance y sin Mostrar). Su instalación final e invocación con el nombre Agregar a MinderCart en otro iPhone siguen pendientes. No confundir la validación del atajo original con la prueba independiente de la plantilla final.

La instalación española previa por enlace se probó en el iPhone de desarrollo. [Enlace actual de Agregar a MinderCart sin credenciales ni Vista rápida](https://www.icloud.com/shortcuts/850dfff0a8af4419bed750ad182534e0). La plantilla ya tiene el nombre definitivo; el usuario nuevo no debe renombrarla. La instalación del enlace final en otro iPhone sigue pendiente.

Esta plantilla usa dictado en español y una dirección fija de **testing**. No debe ofrecerse en producción. El botón de instalación solo aparece en el dominio de testing validado.

Si ya tienes un atajo que funciona, no hace falta reinstalarlo ni revocar el acceso. Para probar la plantilla con tu conexión existente, puedes copiar el valor completo de Authorization de tu atajo original (incluido Bearer y el espacio). Si el iPhone pregunta por un atajo del mismo nombre, **Conservar ambos** permite probar una copia sin reemplazar el anterior.

Nunca compartas la copia instalada después de pegar tu conexión. Para distribuir a otros usuarios, usa únicamente el enlace de la plantilla sin credenciales.

## Siri en inglés (testing)

En Configuración, al seleccionar English, el botón de instalación ofrece la [plantilla Shopping Voice en inglés](https://www.icloud.com/shortcuts/ace6e4d0434f4efba7eda56db89376ea). La plantilla no contiene credenciales y no incluye pantallas de Vista rápida. Sigue el mismo procedimiento de copiar tu conexión, configurar el atajo y pegarla. No compartas la copia instalada con tu conexión.

Tras instalar, ejecuta Shopping Voice una vez desde Atajos y autoriza el reconocimiento de voz, la conexión a MinderCart y el envío del texto dictado cuando se soliciten. Ya se instala con el nombre Shopping Voice; no requiere renombrado ni edición. Si ya tienes uno funcional, no reinstales. La instalación desde iCloud y la invocación con Siri se validaron en iPhone: el producto con nota apareció en My List sin refresh manual.

Para usarla sin abrir Atajos:

1. Con Siri en inglés, actívala y di **Shopping Voice**.
2. Espera a que pregunte **What's the text?**.
3. Di **Milk note cold** y guarda silencio.
4. Revisa My List en testing.

Para varios productos, usa **next item**: «Milk note cold, next item eggs». No digas el nombre del atajo y los productos seguidos sin esperar la pregunta de Siri. Las notas no se traducen.

El enlace final se instaló y se probó con Siri en el iPhone de desarrollo, sin Vista rápida y con actualización inmediata de la lista. La prueba independiente en otro iPhone y con otra cuenta sigue pendiente. El intento aislado anterior que no llegó a la lista no tiene causa confirmada. Si no aparece un producto, evita repetirlo inmediatamente para no generar otra variante por diferencias del reconocimiento.

La plantilla escucha English (US) y apunta únicamente a testing. Cambiar el idioma de MinderCart no cambia el idioma de los atajos ya instalados. El enlace en español se conserva por separado.

## Ayuda técnica: configuración manual (solo como respaldo)

En MinderCart, entra en **Configuración → Agregar con Siri**. Activa el acceso y guarda la clave privada mientras se muestra. No la compartas ni la incluyas en capturas.

En la app Atajos de Apple, crea un atajo llamado **Agregar a MinderCart** con estas acciones, en este orden:

1. **Dictar texto**: Español (México); dejar de escuchar **Después de la pausa**.
2. **Obtener contenido de URL**:
   - URL: usa **Copiar URL de conexión** en MinderCart y pégala como texto fijo. No selecciones Texto dictado en este campo.
   - Abre la flecha azul de esta acción y cambia el método a **POST**.
   - Encabezados → Agregar nuevo encabezado: clave **Authorization**; valor **Bearer**, un espacio y tu clave privada. Puedes usar **Copiar valor completo de Authorization** mientras la clave está visible. No pegues una dirección web como valor.
   - Solicitar cuerpo: **JSON**.
   - Agregar nuevo campo → **Texto**: clave **utterance**, en minúsculas. En el valor, selecciona la variable que produce **Dictar texto**. No escribas literalmente «Texto dictado» ni pegues la URL.
3. Para la primera prueba, agrega **Vista rápida**, usando **Contenido de URL**, para ver la respuesta del servidor.

Ejecuta con ▶, dicta «leche» y espera en silencio. Si aparece una solicitud de permiso, comprueba que la dirección es la de tu versión de MinderCart antes de permitir el envío.

Si perdiste la clave, no puede recuperarse desde la pantalla. Revocar y activar otra vez genera una nueva e invalida la anterior: habrá que actualizar el encabezado del atajo. No hagas esto si el atajo existente ya funciona.

## Android: opción disponible actualmente

Configuración detecta Android y muestra únicamente su ayuda de dictado, sin controles de Siri ni instalación de Atajos. En iPhone/iPad muestra la sección Siri para usuarios con sesión iniciada. En computadora o navegador no identificado pide elegir dispositivo. El selector permite corregir la detección o preparar otro teléfono; es una ayuda visual, no un control de seguridad. Verificar ambas selecciones y ambos idiomas; la simulación no sustituye una prueba real en Android.

No hay todavía una integración equivalente con Google Assistant o Gemini. No se necesita activar Siri ni configurar una clave para dictar con el teclado.

1. Abre **Mi Lista** y toca el campo de búsqueda de productos.
2. Si el teclado tiene dictado, toca su micrófono. En Gboard, espera a que esté listo para escuchar.
3. Di **un producto**, revisa el texto y selecciónalo o agrégalo mediante los controles normales de MinderCart.
4. Para una nota, toca el campo de nota del producto, dicta allí y guarda con los controles habituales.

El teclado solo escribe en el campo seleccionado. No agrega varios artículos automáticamente ni interpreta «nota» o «siguiente artículo». Los nombres y la ubicación del micrófono pueden variar según el teclado. Esta guía de Android aún requiere una prueba en un teléfono real.

## Si algo no sale como esperabas

- No aparece ningún producto: comprueba la cuenta y la versión de MinderCart; revisa la respuesta en Vista rápida.
- El dictado se cancela: deja de hablar para terminar; no pulses el botón rojo.
- Se agrega una dirección como nombre o nota: revisa las variables del atajo. Solo utterance debe recibir la salida de Dictar texto.
- Dos sabores deben quedar separados: usa «siguiente artículo» entre ambos productos.
- No compartas la clave privada ni un atajo que la contenga. La plantilla compartida evita armar las acciones, pero el usuario todavía debe pegar su propia conexión y aceptar los permisos del iPhone.

## Lista de aceptación para usuarios nuevos (testing)

Realizar por separado en español y en inglés, idealmente en otro iPhone y con una cuenta independiente (no un grupo familiar compartido):

1. Comprobar que puede agregar manualmente y que está en testing y en su propia cuenta.
2. Activar acceso para Siri y copiar la autorización completa mientras se muestra. Nunca usar la clave de otra persona.
3. Instalar desde Configuración y comprobar que aparece la pregunta de importación con Texto vacío; pegar autorización, no el enlace. Tras instalar, confirmar sin capturas de claves que Texto ya no dice PENDIENTE.
4. Ejecutar una vez desde Atajos y aceptar los permisos iniciales. Verificar un producto con nota.
5. Invocar con Siri en el idioma correspondiente: nombre del atajo, esperar pregunta, producto. Comprobar nota, cantidad, idioma del nombre y aparición sin refresh.
6. Probar dos productos con notas distintas usando siguiente artículo / next item. Verificar que no se mezclan notas ni se duplican renglones por reintentos.
7. Confirmar que los productos aparecen únicamente en el espacio de esa cuenta; no en la cuenta del desarrollador.
8. Cerrar y volver a abrir la app para comprobar persistencia. Registrar permisos, errores y pantallas técnicas sin compartir credenciales.

No se considera probado Android ni producción. No promover a producción con enlaces de testing. El tag inglés congelado permanece intacto; los ajustes posteriores de instrucciones requieren su propio commit.

## Referencias

- [Apple: solicitudes web con Atajos](https://support.apple.com/guide/shortcuts/request-your-first-api-apd58d46713f/ios)
- [Google: escribir con la voz en Android](https://support.google.com/gboard/answer/2781851?co=GENIE.Platform%3DAndroid&hl=es)
