# CHECKPOINT MINDERCART - 2026-04-16

## 1. Estado actual
- Proyecto nuevo separado: `C:\dev\mindercart-web`
- La app original de compras **no fue modificada**
- MinderCart ya tiene un **esqueleto MVP limpio**
- El build local ya pasa correctamente

## 2. Build actual
Último resultado:
- `npm run build` = OK

Rutas activas actuales:
- `/`
- `/shopping-list`
- `/general-list`
- `/in-store`
- `/history`
- `/settings`

## 3. Decisión clave de arquitectura
MinderCart se está construyendo como **proyecto separado**, reutilizando la base técnica de la app anterior, pero **sin tocar sus procesos ni su operación**.

### Regla actual
- La app anterior sigue intacta en:
  - `C:\dev\compras-web`
- MinderCart vive en:
  - `C:\dev\mindercart-web`

## 4. Legado movido fuera del proyecto nuevo
Para evitar contaminar MinderCart con lógica del negocio anterior, se movió el legado fuera del proyecto nuevo.

Ubicación de legado:
- `C:\dev\mindercart-legacy`

Ahí quedó guardado el código viejo retirado del proyecto nuevo.

## 5. Estado real actual de `src/app`
Dentro de `src/app` quedaron únicamente:

### Archivos base
- `cc-theme.css`
- `favicon.ico`
- `globals.css`
- `layout.tsx`
- `page.tsx`

### Rutas activas del MVP
- `shopping-list/page.tsx`
- `general-list/page.tsx`
- `in-store/page.tsx`
- `history/page.tsx`
- `settings/page.tsx`

## 6. Decisiones funcionales ya tomadas
### 6.1 MVP confirmado
El MVP de MinderCart queda con estas pantallas:
- Home / Quick Add
- Shopping List
- General List
- In Store
- History
- Settings

### 6.2 Campos mínimos del artículo
Se acordó manejar estos campos simples:
- artículo
- unidad
- cantidad
- tienda

### 6.3 General List entra desde el MVP
Se decidió que **General List sí forma parte del MVP**, porque es clave para ayudar a la usuaria a recordar cosas antes de salir de compras.

### 6.4 La lista abierta debe ser una sola
MinderCart debe trabajar con **una sola lista vigente / abierta**, consolidada.

## 7. Qué ya está hecho
- Proyecto nuevo creado
- Dependencias instaladas
- Git inicializado
- Rutas empresariales viejas retiradas del App Router
- Build limpio logrado
- Esqueleto navegable del MVP creado

## 8. Qué NO se debe hacer
- No volver a mezclar lógica de:
  - proveedores
  - órdenes
  - recepciones
  - sucursales
  - compras corporativas
- No tocar la app anterior para avanzar MinderCart
- No volver a meter legado empresarial dentro de `src/app`

## 9. Siguiente paso recomendado
### Prioridad siguiente
Construir el **Home / Quick Add real**

Con estos campos:
- artículo
- unidad
- cantidad
- tienda

Y empezar a definir el modelo mínimo de datos del MVP.

## 10. Modelo mínimo sugerido para el MVP
### `items_master`
- id
- name
- unit
- defaultStore
- active

### `needs`
- id
- itemId nullable
- freeText
- quantity
- unit
- store
- status
- createdAt

### `general_list_items`
- id
- itemId nullable
- name
- unit
- quantity
- store
- active
- lastUsedAt

### `active_shopping_list_items`
- id
- itemId nullable
- name
- unit
- quantity
- store
- checked
- sourceTypes
- sourceRefs

## 11. Comandos útiles
### Build
```bat
cd /d C:\dev\mindercart-web
rmdir /s /q .next
npm run build

## Avance nuevo
- Se creó la base local de MinderCart con:
  - `src/components/mindercart/Shell.tsx`
  - `src/lib/mindercart/types.ts`
  - `src/lib/mindercart/storage.ts`
- El flujo MVP ya quedó montado con localStorage:
  - Home / Quick Add
  - Shopping List
  - General List
  - In Store
  - History
  - Settings
- Build local: OK