// ============================================================================
// FILE: DEBUG.md   (CREAR NUEVO en la raíz: C:\dev\compras-web\DEBUG.md)
// ============================================================================
/*
# Quick debug (Compras Web App)

## 1) Network
- F12 > Network > filtra "/api/"
- Revisa status:
  - 401: sin sesión/token
  - 403: sesión OK pero rol/permiso incorrecto
  - 500: backend error
- Abre Response: normalmente trae `{ error: "..." }`

## 2) Cuando un botón “no hace nada”
- ¿Salió request al API?
  - NO: handler no corre o hay excepción previa (Console).
  - SÍ: revisa status y Response.

## 3) Firebase login: auth/network-request-failed
- Revisa conexión, VPN, firewall, adblock.
- Prueba abrir en incognito (sin extensiones).
- Prueba otra red (hotspot) para descartar bloqueo.
*/