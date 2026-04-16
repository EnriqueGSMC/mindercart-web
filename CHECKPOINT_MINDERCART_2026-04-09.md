# MinderCart Checkpoint - 2026-04-09

## Estado actual
- Proyecto nuevo: C:\dev\mindercart-web
- Build local: OK
- La app original NO fue modificada
- Ya existe esqueleto MVP navegable

## Rutas nuevas creadas
- /
- /shopping-list
- /general-list
- /in-store
- /history
- /settings

## Decisiones importantes
- MinderCart va en proyecto separado
- MVP incluye:
  - Home / Quick Add
  - Shopping List
  - General List con checkbox
  - In Store
  - History
  - Settings
- Campos mínimos del artículo:
  - artículo
  - unidad
  - cantidad
  - tienda

## Legado
- Código viejo sacado para no contaminar build
- No tocar la app anterior

## Siguiente paso
- limpiar rutas heredadas que sigan dentro de src/app
- empezar Home/Quick Add real
- definir modelo mínimo de datos de MinderCart