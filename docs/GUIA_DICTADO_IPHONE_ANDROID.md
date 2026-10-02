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
3. Toca **Instalar para Siri (testing)** y después **Configurar atajo**. Pega la conexión en el campo Texto y toca **Agregar atajo**.
4. Ejecuta el atajo instalado (**MinderCart Plantilla**), di un producto y espera en silencio. Permite enviar texto a la dirección de testing de MinderCart cuando el iPhone lo solicite. Regresa a **Mi Lista** para comprobar el producto.

La instalación por enlace se probó en un iPhone y agregó Peras correctamente. [Enlace de la plantilla sin credenciales](https://www.icloud.com/shortcuts/0cf4ad15df9949a998b5465996fc934e).

Esta plantilla usa dictado en español y una dirección fija de **testing**. No debe ofrecerse en producción. El botón de instalación solo aparece en el dominio de testing validado.

Si ya tienes un atajo que funciona, no hace falta reinstalarlo ni revocar el acceso. Para probar la plantilla con tu conexión existente, puedes copiar el valor completo de Authorization de tu atajo original (incluido Bearer y el espacio). Si el iPhone pregunta por un atajo del mismo nombre, **Conservar ambos** permite probar una copia sin reemplazar el anterior.

Nunca compartas la copia instalada después de pegar tu conexión. Para distribuir a otros usuarios, usa únicamente el enlace de la plantilla sin credenciales.

## Siri en inglés (testing)

En Configuración, al seleccionar English, el botón de instalación ofrece la [plantilla Add to MinderCart en inglés](https://www.icloud.com/shortcuts/2935edde59394686a820dbe3f23a6840). La plantilla no contiene credenciales y no incluye pantallas de Vista rápida. Sigue el mismo procedimiento de copiar tu conexión, configurar el atajo y pegarla. No compartas la copia instalada con tu conexión.

Para usarla sin abrir Atajos:

1. Activa Siri y di **Add to MinderCart**.
2. Espera a que pregunte **What's the text?**.
3. Di **Milk note cold** y guarda silencio.
4. Revisa My List en testing.

Para varios productos, usa **next item**: «Milk note cold, next item eggs». No digas el nombre del atajo y los productos seguidos sin esperar la pregunta de Siri. Las notas no se traducen.

El flujo con Siri se probó con una copia instalada. La instalación del enlace final sin vistas rápidas queda pendiente de comprobar. El intento aislado que no llegó a la lista todavía no tiene causa confirmada; no se considera resuelto. Si no aparece un producto, evita repetirlo inmediatamente para no generar otra variante por diferencias del reconocimiento.

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

## Referencias

- [Apple: solicitudes web con Atajos](https://support.apple.com/guide/shortcuts/request-your-first-api-apd58d46713f/ios)
- [Google: escribir con la voz en Android](https://support.google.com/gboard/answer/2781851?co=GENIE.Platform%3DAndroid&hl=es)
