# MinderCart — CHECKPOINT / HANDOFF

## Punto estable actual
**Tag oficial / base estable:**
`mindercart-baseline-listas-por-categoria-ok`

## Ramas de trabajo
- `main` = estable / testers
- `testing` = pruebas / cambios nuevos

## Cómo volver al punto bueno
```bash
git checkout main
git reset --hard mindercart-baseline-listas-por-categoria-ok
rmdir /s /q .next
npm run build
```

## Objetivo del producto
MinderCart debe resolver 3 cosas:
- **Mi Lista**: recordar y agregar rápido
- **Carrito**: revisar faltantes y completar
- **De Compras**: ejecutar la compra sin perderse

## Estado funcional aprobado
### Mi Lista
- flujo base funcionando
- alta de artículos funcionando
- coincidencias por artículo funcionando
- alta de artículo nuevo funcionando
- ventana de artículo aprobada
- artículos agrupados por **categoría**
- encabezados por categoría visibles
- categorías en el orden oficial de MinderCart
- artículos en orden alfabético dentro de cada categoría
- si una categoría queda vacía, su encabezado desaparece

### Carrito
- categorías y artículos funcionando
- checkboxes funcionando
- renglón azul clarito cuando está marcado
- modal de categoría estable
- recorrido por frecuentes y categorías funcionando bien
- artículos agrupados por **categoría**
- encabezados por categoría visibles
- categorías en el orden oficial de MinderCart
- artículos en orden alfabético dentro de cada categoría
- si una categoría queda vacía, su encabezado desaparece

### De Compras
- flujo base restaurado y bueno
- artículos con `+`
- al tocar arriba bajan a la lista de abajo
- al tocar abajo regresan arriba
- botón **Agregar a esta compra** funcionando
- búsqueda por artículo funcionando
- coincidencias funcionando
- alta de artículo nuevo funcionando
- guardado a la compra actual funcionando
- ajustes visuales del modal aprobados
- teclado se oculta correctamente al seleccionar coincidencia
- teclado se oculta correctamente al tocar **Agregar artículo**
- el botón **Agregar a esta compra** quedó abajo de la lista
- artículos agrupados por **categoría**
- encabezados por categoría visibles
- categorías en el orden oficial de MinderCart
- artículos en orden alfabético dentro de cada categoría
- el agrupado aplica tanto arriba como abajo
- si una categoría queda vacía en un bloque, su encabezado desaparece

### Historial
- funcionando

### Configuración
- funcionando

### Branding / UI general
- Branding **MinderCart**
- Header azul marino fijo
- Avatar/logo nuevo en fondo blanco
- Enfoque móvil
- Footer contextual aprobado por módulo

## Pendiente
- exportación de **WhatsApp** agrupada por categoría
- exportación de **PDF** agrupada por categoría
- seguir haciendo cambios nuevos solo en `testing`

## Reglas de trabajo
- Solo cambios puntuales
- No tocar nada no pedido
- No usar versiones anteriores ni zips viejos como base
- Trabajar solo sobre el checkpoint bueno o sobre archivos actuales subidos
- Antes de cambiar algo, declarar qué archivo(s) se van a tocar
- Un solo zip por cambio
- El zip debe traer solo `src/`
- Si falla build, corregir solo ese error o revertir solo ese intento
- No hacer features nuevos sobre la estable; usar `testing`

## Logística de parches
Formato:
`mindercart_<descripcion_corta>_patch_vNN.zip`

Ejemplos:
- `mindercart_instore_add_to_this_purchase_ui_patch_v19.zip`
- `mindercart_instore_category_grouping_patch_v28.zip`
- `mindercart_my_list_category_grouping_patch_v30.zip`
- `mindercart_cart_category_grouping_render_fix_patch_v41.zip`

Regla:
- se entrega **un solo zip**
- el zip trae **solo `src/`**
- se copia sobre:
  - `C:\dev\mindercart-web`

## Rutas principales
- `src/app/page.tsx` → **Mi Lista**
- `src/app/general-list/page.tsx` → **Carrito**
- `src/app/in-store/page.tsx` → **De Compras**
- `src/app/history/page.tsx` → **Historial**
- `src/app/settings/page.tsx` → **Configuración**
- `src/app/shopping-list/page.tsx` → redirección a **Carrito**

## Árbol resumido
```text
C:\dev\mindercart-web
└─ src
   ├─ app
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
         ├─ types.ts
         └─ hooks.ts
```

## Archivos importantes
- `src/app/page.tsx`
- `src/app/general-list/page.tsx`
- `src/app/in-store/page.tsx`
- `src/components/mindercart/Shell.tsx`
- `src/lib/mindercart/storage.ts`
- `src/lib/mindercart/seed-items.ts`
- `src/lib/mindercart/i18n.ts`
- `src/lib/mindercart/types.ts`
- `src/lib/mindercart/hooks.ts`

## Archivos críticos
- `src/app/page.tsx`
- `src/app/general-list/page.tsx`
- `src/app/in-store/page.tsx`

## Catálogo base
### Categorías oficiales
- Frutas y Verduras
- Carnes, Pollo y Pescados
- Lácteos y Refrigerados
- Panadería y Tortillería
- Abarrotes
- Bebidas
- Congelados
- Limpieza y Hogar
- Farmacia, Bebé y Cuidado Personal
- Mascotas
- Cajas y Salida
- Otro / Temporal

### Unidades oficiales
- pza
- paquete
- caja
- lata
- botella
- frasco
- bolsa
- rollo
- docena
- g
- kg
- oz
- lb
- ml
- l
- gal

### Tiendas base
- HEB
- Costco
- Sam's

## Lógica congelada
### Compras frecuentes
- Global por artículo
- No por tienda
- Un artículo entra a **Compras frecuentes** si cumple:
  - 3 compras reales o más
  - última compra dentro de los últimos 60 días

## Estado de Git
### Branches
- `main` = estable
- `testing` = pruebas

### Tags importantes
- `mindercart-baseline-limpia-carrito-ok`
- `mindercart-baseline-agregar-a-esta-compra-ok`
- `mindercart-baseline-de-compras-categorias-ok`
- `mindercart-baseline-listas-por-categoria-ok`

## Flujo recomendado desde ahora
### Para revisar o entregar estable
```bash
git checkout main
```

### Para hacer cambios nuevos
```bash
git checkout testing
```

### Cuando algo en testing quede aprobado
```bash
git checkout main
git merge testing
git push origin main
```

### Cuando se quiera congelar una versión aprobada
```bash
git tag -a NOMBRE_DEL_CHECKPOINT -m "Stable checkpoint approved"
git push origin NOMBRE_DEL_CHECKPOINT
```

## Instrucción recomendada para un nuevo chat
```text
Cambio puntual solamente.

Checkpoint base obligatorio:
mindercart-baseline-listas-por-categoria-ok

Rama de trabajo:
testing

No uses versiones anteriores.
No arregles nada más.
Dime primero qué archivo vas a tocar.
Entrégame un solo zip con src.
```

## Nota final
Si algo vuelve a romper un módulo:
1. restaurar solo el archivo del módulo desde `mindercart-baseline-listas-por-categoria-ok`
2. limpiar `.next`
3. correr `npm run build`
4. volver a intentar el cambio en `testing`
