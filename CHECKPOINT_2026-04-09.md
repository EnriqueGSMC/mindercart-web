# CHECKPOINT - 2026-04-09

## Estado actual
- Proyecto local: `C:\dev\compras-web`
- Git inicializado localmente
- Commit/tag estable: `stable-2026-04-01`
- Build local: OK
- Preview deploy en Vercel: OK

## Preview actual
- URL preview activa:
  `https://compras-k0iah5mgw-enrique-sanchezs-projects.vercel.app`

## Ya funciona
- Basic / Needs:
  - búsqueda con `co`, `coca`, `coca 6`
  - ya aparecen artículos correctamente
- Compras / En tienda:
  - Alta rápida funcional
  - Unidad con opciones
  - Categoría visible
  - ya no aparece lista duplicada de “No comprados”
- WhatsApp: OK
- PDF: OK
- Vercel preview: ya abre

## Archivos activos importantes
- `src/app/needs/NeedsClient.tsx`
- `src/app/orders/[orderId]/QuickAddToOrderDialog.tsx`
- `src/app/orders/[orderId]/page.frozenCopy.tsx`
- `src/app/orders/[orderId]/page.tsx`
- `src/app/api/products/search-store/route.ts`
- `src/app/api/products/search/route.ts`
- `src/app/basic/recibir/page.tsx`
- `src/lib/firebase/admin.ts`

## Cambios clave ya hechos
- `page.tsx` de orders quedó apuntando directo a:
  - `export { default } from "./page.frozenCopy";`
- `search-store` se usa para búsqueda mejorada
- `NeedsClient.tsx` quedó deduplicando por nombre
- `page.frozenCopy.tsx` quedó sin bloque final de “No comprados”
- `QuickAddToOrderDialog.tsx` volvió a ser el modal correcto
- `firebase/admin.ts` ya usa variables:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`
  y deja `FIREBASE_SERVICE_ACCOUNT_PATH` solo como fallback local
- `basic/recibir/page.tsx` ajustado para:
  - conservar “quién entrega”
  - botón “Regresar”

## Deploy / Vercel
- Proyecto Vercel enlazado: `compras-web`
- Preview deploy funcionando
- Variables cargadas en Vercel
- Producción aún no publicada con `vercel --prod`

## Pendientes
- Seguir pruebas en iPhone / Android
- Validar flujo completo de Basic / Recibir
- Confirmar login/Firebase Auth en preview
- Decidir cuándo arrancar módulo dashboard admin:
  - usuarios
  - proveedores
  - categorías
  - unidades
  - artículos

## Comandos útiles
```bat
cd C:\dev\compras-web
npm run build
vercel --logs