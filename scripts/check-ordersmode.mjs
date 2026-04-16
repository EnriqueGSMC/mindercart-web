// =======================================================
// FILE: scripts/check-ordersmode.mjs
// =======================================================
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET = path.join(ROOT, "src", "app");

// Excluir rutas que legítimamente contienen /orders/ por ser páginas del módulo
const EXCLUDE_DIRS = new Set([
  path.join(TARGET, "orders"),
  path.join(TARGET, "api"),
]);

const ALLOWED_EXT = new Set([".ts", ".tsx", ".js", ".jsx"]);

function isUnderExcludedDir(p) {
  for (const ex of EXCLUDE_DIRS) {
    if (p === ex) return true;
    if (p.startsWith(ex + path.sep)) return true;
  }
  return false;
}

function walk(dir, out = []) {
  if (isUnderExcludedDir(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next" || e.name.startsWith(".")) continue;
      walk(full, out);
    } else if (e.isFile()) {
      const ext = path.extname(e.name);
      if (ALLOWED_EXT.has(ext)) out.push(full);
    }
  }
  return out;
}

function getLineCol(text, idx) {
  let line = 1;
  let lastNl = -1;
  for (let i = 0; i < idx; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
      lastNl = i;
    }
  }
  return { line, col: idx - lastNl };
}

function isCommentedLine(lineText, col1Based) {
  // Si antes de la columna hay un //, lo consideramos comentario (heurística).
  const i = col1Based - 1;
  const prefix = lineText.slice(0, Math.max(0, i));
  const slash = prefix.lastIndexOf("//");
  if (slash === -1) return false;
  // si hay 'http://' antes, no cuenta como comentario
  const http = prefix.lastIndexOf("http://");
  const https = prefix.lastIndexOf("https://");
  return slash > http && slash > https;
}

function checkFile(filePath) {
  const rel = path.relative(ROOT, filePath);
  const text = fs.readFileSync(filePath, "utf8");
  const hits = [];

  const needle = "/orders/";
  let idx = 0;

  while (true) {
    idx = text.indexOf(needle, idx);
    if (idx === -1) break;

    const { line, col } = getLineCol(text, idx);
    const lines = text.split("\n");
    const lineText = lines[line - 1] ?? "";

    // ignore marker para casos especiales
    if (lineText.includes("ordersMode-ok")) {
      idx += needle.length;
      continue;
    }

    if (isCommentedLine(lineText, col)) {
      idx += needle.length;
      continue;
    }

    // Ventana alrededor del match para detectar si ya está protegido
    const winStart = Math.max(0, idx - 250);
    const winEnd = Math.min(text.length, idx + 250);
    const windowText = text.slice(winStart, winEnd);

    const hasOrdersMode = windowText.includes("ordersMode=");
    const usesHelper = windowText.includes("buildOrdersUrl(") || windowText.includes("ensureOrdersModeCopy(");

    if (!hasOrdersMode && !usesHelper) {
      hits.push({ rel, line, col, sample: lineText.trim().slice(0, 180) });
    }

    idx += needle.length;
  }

  return hits;
}

const files = fs.existsSync(TARGET) ? walk(TARGET) : [];
let problems = [];

for (const f of files) {
  problems = problems.concat(checkFile(f));
}

if (problems.length) {
  console.error("\n❌ Found /orders/ links without ordersMode=copy (or without helper):\n");
  for (const p of problems) {
    console.error(`- ${p.rel}:${p.line}:${p.col}  ${p.sample}`);
  }
  console.error(
    "\nFix: use buildOrdersUrl(...) OR append &ordersMode=copy. " +
      "If intentional, add `// ordersMode-ok` on that line.\n"
  );
  process.exit(1);
}

console.log("✅ check-ordersmode: OK");


// =======================================================
// FILE: package.json (PATCH: añade script)
// =======================================================
// {
//   "scripts": {
//     "check:ordersmode": "node scripts/check-ordersmode.mjs"
//   }
// }


// =======================================================
// USO (ejemplo) en: src/app/purchases/page.experimental.tsx
// =======================================================
//
// import { buildOrdersUrl } from "@/lib/urls";
//
// const url = buildOrdersUrl({ orderId, branch, mode: "BUYING", from: "purchases" });
// r.push(url);
//
// =======================================================