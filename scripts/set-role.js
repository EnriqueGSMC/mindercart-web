// FILE: scripts/set-role.js
// Uso:
//   node scripts/set-role.js user@email.com BUYER
// Requiere:
//   export GOOGLE_APPLICATION_CREDENTIALS="ruta/a/serviceAccount.json"
// o tener credenciales por defecto en tu máquina.

const admin = require("firebase-admin");

function die(msg) {
  console.error("ERROR:", msg);
  process.exit(1);
}

async function main() {
  const email = process.argv[2];
  const role = process.argv[3];

  if (!email) die("Falta email. Ej: node scripts/set-role.js user@email.com BUYER");
  if (!role) die("Falta role. Ej: node scripts/set-role.js user@email.com BUYER");

  if (!admin.apps.length) admin.initializeApp();

  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { role });

  console.log(`OK: ${email} => role=${role} (uid=${user.uid})`);
  console.log("IMPORTANTE: cerrar sesión y volver a iniciar para refrescar el token.");
}

main().catch((e) => die(e.message || String(e)));