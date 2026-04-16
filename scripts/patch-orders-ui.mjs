// FILE: scripts/patch-orders-ui.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const targets = [
  path.join(ROOT, "src", "app", "orders", "[orderId]", "page.frozenCopy.tsx"),
  path.join(ROOT, "src", "app", "orders", "[orderId]", "page.frozen.tsx"),
];

function backup(filePath) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const bak = `${filePath}.bak.${ts}`;
  fs.copyFileSync(filePath, bak);
  return bak;
}

function replaceAll(content, re, replacement, label) {
  const before = content;
  const after = content.replace(re, replacement);
  const changed = before !== after;
  return { after, changed, label };
}

function ensureCssSuccessButton(content) {
  if (content.includes(".cc-btn--success")) return content;

  // Insert after cc-btn--danger if exists; otherwise append to end of style block.
  const dangerRe = /(\.cc-btn--danger\s*\{[\s\S]*?\}\s*)/m;
  if (dangerRe.test(content)) {
    return content.replace(
      dangerRe,
      `$1\n        .cc-btn--success {\n          background: #16a34a;\n          color: #fff;\n          border-color: transparent;\n        }\n`
    );
  }

  // Fallback: append at end (safe)
  return (
    content +
    `\n\n/* injected */\n.cc-btn--success { background: #16a34a; color: #fff; border-color: transparent; }\n`
  );
}

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`- SKIP (not found): ${filePath}`);
    return;
  }

  const original = fs.readFileSync(filePath, "utf8");
  let content = original;

  const bak = backup(filePath);

  const ops = [];

  // Text changes (ES + EN)
  ops.push(
    replaceAll(content, /Cerrar compra/g, "Finalizar compra", "label: Cerrar compra -> Finalizar compra")
  );
  content = ops.at(-1).after;

  ops.push(
    replaceAll(content, /Cerrar la compra/g, "Finalizar la compra", "confirm: Cerrar la compra -> Finalizar la compra")
  );
  content = ops.at(-1).after;

  ops.push(
    replaceAll(content, /\bClose purchase\b/g, "Finalize purchase", "en: Close purchase -> Finalize purchase")
  );
  content = ops.at(-1).after;

  // Close purchase button style: primary -> danger near requestClosePurchase(pending)
  ops.push(
    replaceAll(
      content,
      /className="cc-btn cc-btn--primary"(?=[\s\S]{0,400}requestClosePurchase\(pending\))/g,
      'className="cc-btn cc-btn--danger"',
      "style: close purchase button primary->danger"
    )
  );
  content = ops.at(-1).after;

  // Bought modal title: "Comprado" -> "Carrito de compras"
  ops.push(
    replaceAll(content, /title="Comprado"/g, 'title="Carrito de compras"', 'title: "Comprado" -> "Carrito de compras"')
  );
  content = ops.at(-1).after;

  ops.push(
    replaceAll(
      content,
      /{lang === "en" \? "Bought" : "Comprado"}/g,
      '{lang === "en" ? "Shopping cart" : "Carrito de compras"}',
      "sheet title: Bought/Comprado -> Shopping cart/Carrito"
    )
  );
  content = ops.at(-1).after;

  // Confirm bought button label + style
  ops.push(
    replaceAll(
      content,
      /{lang === "en" \? "Confirm bought" : "Confirmar comprado"}/g,
      '{lang === "en" ? "In cart?" : "¿Ya en el Carrito?"}',
      "confirm bought label -> In cart?/¿Ya en el Carrito?"
    )
  );
  content = ops.at(-1).after;

  ops.push(
    replaceAll(
      content,
      /className="cc-btn cc-btn--primary"(?=[\s\S]{0,400}confirmBought\(\))/g,
      'className="cc-btn cc-btn--success"',
      "style: confirmBought button primary->success"
    )
  );
  content = ops.at(-1).after;

  // Ensure CSS exists for success button
  content = ensureCssSuccessButton(content);

  const changed = content !== original;
  fs.writeFileSync(filePath, content, "utf8");

  console.log(`\nPatched: ${filePath}`);
  console.log(`Backup : ${bak}`);
  console.log("Changes:");
  for (const op of ops) {
    if (op.changed) console.log(`  ✅ ${op.label}`);
  }
  if (!changed) console.log("  ℹ️ No changes needed (already patched).");
}

for (const t of targets) patchFile(t);

console.log("\nDone.");