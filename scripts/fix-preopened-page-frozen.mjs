// FILE: scripts/fix-preopened-page-frozen.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const filePath = path.join(ROOT, "src", "app", "purchases", "page.frozen.tsx");

if (!fs.existsSync(filePath)) {
  console.error("No se encontró:", filePath);
  process.exit(1);
}

const original = fs.readFileSync(filePath, "utf8");

// Backup
const ts = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = `${filePath}.bak.${ts}`;
fs.copyFileSync(filePath, backupPath);

// Remover cualquier bloque/línea relacionada a preOpened (incluye about:blank opener)
const lines = original.split(/\r?\n/);
const out = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Quita cualquier línea que mencione preOpened
  if (line.includes("preOpened")) continue;

  // Quita líneas típicas de opener/null (por si quedaron separadas)
  if (line.includes('window.open("about:blank"') || line.includes("window.open('about:blank'")) continue;
  if (line.includes(".opener") && line.includes("null")) continue;

  out.push(line);
}

const patched = out.join("\n");
fs.writeFileSync(filePath, patched, "utf8");

console.log("✅ Parche aplicado:", filePath);
console.log("🧷 Backup creado :", backupPath);
console.log("👉 Ahora corre: npm run build");