# MinderCart — CHECKPOINT / HANDOFF

## Estado estable actual
**Tag recomendado / base estable:**
`mindercart-baseline-agregar-a-esta-compra-ok`

## Ramas recomendadas
- `main` = estable / testers
- `testing` = pruebas / cambios nuevos

## Comandos para volver al punto bueno
```bash
git checkout main
git reset --hard mindercart-baseline-agregar-a-esta-compra-ok
rmdir /s /q .next
npm run build

prueba testing vercel
