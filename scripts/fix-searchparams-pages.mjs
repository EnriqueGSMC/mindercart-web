// FILE: scripts/fix-searchparams-pages.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function ts() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function write(p, s) {
  fs.writeFileSync(p, s, "utf8");
}

function ensureUseClient(code) {
  const trimmed = code.trimStart();
  if (trimmed.startsWith('"use client"') || trimmed.startsWith("'use client'")) return code;
  return `"use client";\n\n${code}`;
}

function makeWrapper(clientFileBase) {
  return `import * as React from "react";
import ${clientFileBase} from "./${clientFileBase}";

export default function Page() {
  return (
    <React.Suspense fallback={<div style={{ padding: 16 }}>Cargando…</div>}>
      <${clientFileBase} />
    </React.Suspense>
  );
}
`;
}

function fixRoute(dirRel, clientBase) {
  const dir = path.join(ROOT, dirRel);
  const pageTsx = path.join(dir, "page.tsx");
  const pageTs = path.join(dir, "page.ts");

  const pagePath = fs.existsSync(pageTsx) ? pageTsx : fs.existsSync(pageTs) ? pageTs : null;
  if (!pagePath) {
    console.log(`- SKIP: No existe page.tsx/page.ts en ${dirRel}`);
    return;
  }

  const code = read(pagePath);

  const hasUseSearchParams = code.includes("useSearchParams");
  const hasUseClient = code.includes('"use client"') || code.includes("'use client'");
  const alreadyWrapper =
    !hasUseClient && !hasUseSearchParams && code.includes(`import ${clientBase} from "./${clientBase}"`);

  if (alreadyWrapper) {
    console.log(`✅ OK: ${dirRel}/page.tsx ya es wrapper`);
    return;
  }

  // Backup del page actual
  const backupPath = `${pagePath}.bak.${ts()}`;
  fs.copyFileSync(pagePath, backupPath);

  // Crear/actualizar Client file
  const clientPath = path.join(dir, `${clientBase}.tsx`);
  if (!fs.existsSync(clientPath)) {
    write(clientPath, ensureUseClient(code));
    console.log(`🧩 Creado: ${dirRel}/${clientBase}.tsx (desde page)`);
  } else {
    // No lo sobreescribimos para no pisar trabajo; solo avisamos
    console.log(`ℹ️ Ya existe: ${dirRel}/${clientBase}.tsx (no se toca)`);
  }

  // Reemplazar page por wrapper SERVER
  write(pageTsx, makeWrapper(clientBase));
  if (pagePath.endsWith("page.ts")) {
    // si existía page.ts, lo dejamos como backup para que no compile
    const moved = `${pageTs}.bak.${ts()}`;
    fs.renameSync(pageTs, moved);
    console.log(`🧷 Movido: ${dirRel}/page.ts -> ${path.basename(moved)}`);
  }

  console.log(`✅ Wrapper listo: ${dirRel}/page.tsx`);
  console.log(`🧷 Backup page: ${backupPath}`);
}

fixRoute("src/app/needs", "NeedsClient");
fixRoute("src/app/scan", "ScanClient");

console.log("\nDone.");