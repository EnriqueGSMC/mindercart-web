# MinderCart — CHECKPOINT / HANDOFF

## Estado estable actual
**Tag recomendado / base estable:**
`mindercart-baseline-limpia-carrito-ok`

## Comandos para volver al punto bueno
```bash
git checkout main
git reset --hard mindercart-baseline-limpia-carrito-ok
rmdir /s /q .next
npm run build
```

## Objetivo del producto
MinderCart debe resolver 3 cosas:
- **Mi Lista**: recordar y agregar rápido
- **Carrito**: revisar faltantes y completar
- **De Compras**: ejecutar la compra sin perderse

## Reglas de trabajo que ya quedaron definidas
- Solo cambios puntuales
- No tocar nada no pedido
- No usar versiones anteriores ni zips viejos como base
- Trabajar solo sobre el checkpoint bueno o sobre archivos actuales subidos
- Antes de cambiar algo, declarar qué archivo(s) se van a tocar
- Un solo zip por cambio
- Si falla build, corregir solo ese error o revertir solo ese intento
- No hacer features nuevos sobre la estable; usar versión de pruebas

## Estado funcional aprobado al cierre de este chat
### Aprobado / bueno
- Branding **MinderCart**
- Header azul marino fijo
- Avatar/logo nuevo en fondo blanco
- Enfoque móvil
- Footer contextual aprobado por módulo
- **Carrito**:
  - categorías y artículos funcionando
  - checkboxes funcionando
  - renglón azul clarito cuando está marcado
  - modal de categoría estable
- **De Compras**:
  - flujo base restaurado y bueno
  - artículos con `+`
  - al tocar arriba bajan a la lista de abajo
  - al tocar abajo regresan arriba
- Categorías actualizadas
- Unidades limpiadas
- Catálogo base limpio
- Tiendas base: **HEB**, **Costco**, **Sam's**
- Versión limpia / baseline funcional ya respaldada
- Inglés/base limpia previa integrada en el baseline bueno

### NO aprobado / pendiente
- **Agregar a esta compra** en **De Compras**
  - se intentó
  - no quedó estable
  - no debe considerarse implementado
  - cualquier intento fallido de este feature debe descartarse
- Flujo de versión estable vs. versión de pruebas todavía no configurado en GitHub/Vercel

## Cambio pendiente principal
### Feature pendiente
**Agregar a esta compra** en **De Compras**

### Lógica acordada
Dentro de **De Compras**, estando en una tienda:
- Debe existir **Agregar a esta compra**
- No debe abrir captura manual directa
- Debe funcionar **igual que Mi Lista**
- Escribes **2 letras**
- Busca en la base de artículos de MinderCart
- Muestra coincidencias
- Si eliges una coincidencia:
  - abre la ventana de artículo
  - ahí ajustas:
    - artículo
    - cantidad
    - unidad
    - categoría
- Si no hay coincidencias:
  - aparece **Agregar artículo**
  - abre la misma ventana de artículo como en **Mi Lista**

### Restricciones explícitas para este feature
- No tocar footer
- No tocar header
- No tocar botón de regresar arriba
- No tocar flujo del `+`
- No tocar `storage.ts` en la primera fase
- No tocar ningún otro archivo en la primera fase
- Primera fase debe ser **solo UI**
- La versión estable no debe arriesgarse; hacerlo sobre versión de pruebas

## Base de datos / catálogo definidos
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

## Lógica de Compras frecuentes congelada
- Global por artículo
- No por tienda
- Un artículo entra a **Compras frecuentes** si cumple:
  - **3 compras reales o más**
  - **última compra dentro de los últimos 60 días**

## Rutas principales
- `src/app/page.tsx` → **Mi Lista**
- `src/app/general-list/page.tsx` → **Carrito**
- `src/app/in-store/page.tsx` → **De Compras**
- `src/app/history/page.tsx` → **Historial**
- `src/app/settings/page.tsx` → **Configuración**

## Archivos importantes
- `src/components/mindercart/Shell.tsx`
- `src/lib/mindercart/storage.ts`
- `src/lib/mindercart/seed-items.ts`
- `src/lib/mindercart/i18n.ts`
- `src/lib/mindercart/types.ts`
- `src/lib/mindercart/hooks.ts`

## Árbol resumido del proyecto relevante
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

## Qué archivo se considera crítico
- `src/app/in-store/page.tsx`
  - No tocarlo sin partir del checkpoint bueno
  - Fue donde se rompió el feature de **Agregar a esta compra**

## Procedimiento recomendado para el siguiente chat
### 1) Confirmar base estable
Usar esta como verdad:
`mindercart-baseline-limpia-carrito-ok`

### 2) No trabajar sobre estable
Primero configurar:
- `main` = estable
- `testing` = pruebas

### 3) Para retomar el feature pendiente
Primera instrucción recomendada en nuevo chat:

```text
Cambio puntual solamente.

Objetivo:
Fase 1 UI de "Agregar a esta compra" en De Compras.

Archivo autorizado:
- src/app/in-store/page.tsx

No tocar:
- footer
- header
- botón de regresar arriba
- flujo del +
- storage.ts
- ningún otro archivo

Trabaja solo sobre el checkpoint:
mindercart-baseline-limpia-carrito-ok

No uses versiones anteriores.
No arregles nada más.
Dime primero qué archivo vas a tocar.
Entrégame un solo zip.
```

## Estado de Git al cierre
Tags existentes:
- `checkpoint-carrito-estable-2026-04-22`
- `mindercart-baseline-limpia`
- `mindercart-baseline-limpia-en-v1`
- `mindercart-baseline-limpia-carrito-ok`

## Nota final
Si algo vuelve a romper **De Compras**:
1. restaurar solo `src/app/in-store/page.tsx` desde `mindercart-baseline-limpia-carrito-ok`
2. limpiar `.next`
3. correr `npm run build`
4. volver a intentar el feature en rama de pruebas

## Estado estable actual
**Tag recomendado / base estable:**
`mindercart-baseline-agregar-a-esta-compra-ok`

## Comandos para volver al punto bueno
```bash
git checkout main
git reset --hard mindercart-baseline-agregar-a-esta-compra-ok
rmdir /s /q .next
npm run build
