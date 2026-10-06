const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
const source = fs.readFileSync('src/app/settings/page.tsx', 'utf8');
const tree = ts.createSourceFile('settings.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let setupBranch;
function visit(node) {
  if (ts.isConditionalExpression(node) && node.condition.getText(tree) === 'voiceToken'
      && node.whenTrue.getText(tree).includes('data-testid="siri-initial-setup"')) setupBranch = node;
  ts.forEachChild(node, visit);
}
visit(tree);
assert.ok(setupBranch, 'Setup must be gated by a newly available private connection');
assert.equal(setupBranch.whenFalse.getText(tree), 'null');
const setup = setupBranch.whenTrue.getText(tree);
for (const label of ['Copiar valor completo de Authorization', 'Copy complete Authorization value',
  'Instalar para Siri en español (testing)', 'Install English Siri shortcut (testing)',
  'Ayuda técnica', 'Technical help', 'uso diario', 'daily use', 'Terminar configuración', 'Finish setup']) {
  assert.ok(setup.includes(label), `${label} must remain inside setup-only branch`);
}
assert.ok(!setup.includes('onRevokeVoiceAccess()'), 'Revoke must remain available outside setup');
assert.ok(setup.includes('setVoiceToken("")'), 'Finish hides setup without revoking access');
assert.ok(!setup.includes('setVoiceEnabled(false)'), 'Finish must not disable existing shortcuts');
assert.ok(source.includes('Copia tu conexión con el botón de abajo'));
let spanish;
function findSpanish(node) {
  if (ts.isJsxElement(node) && node.openingElement.getText(tree).includes('data-testid="siri-spanish-simple-setup"')) spanish = node;
  ts.forEachChild(node, findSpanish);
}
findSpanish(tree);
assert.ok(spanish, 'Spanish testing setup must have its own simple branch');
let copyButtons = 0;
let steps = 0;
function countSpanish(node) {
  if (ts.isJsxElement(node) && node.openingElement.tagName.getText(tree) === 'button') copyButtons++;
  if (ts.isJsxElement(node) && node.openingElement.tagName.getText(tree) === 'li') steps++;
  ts.forEachChild(node, countSpanish);
}
countSpanish(spanish);
assert.equal(copyButtons, 1);
assert.equal(steps, 3);
const simple = spanish.getText(tree);
assert.ok(simple.includes('Bearer ${voiceToken}'), 'Copy must include the full Authorization connection');
assert.ok(simple.includes('fcbff51af45341cfbb4528d1096cffc1'));
assert.ok(simple.includes('di “Mi Lista”'));
assert.ok(!simple.includes('value={voiceToken}') && !simple.includes('Authorization'));
assert.ok(!source.includes('Copy your connection using the button below'));
const revoke = source.slice(source.indexOf('async function onRevokeVoiceAccess()'), source.indexOf('async function copyVoiceValue'));
assert.ok(revoke.indexOf('window.confirm') < revoke.indexOf('fetch('));
assert.ok(revoke.includes('Todos los atajos') && revoke.includes('All shortcuts'));
console.log('PASS: setup-only instructions/copy/install in both languages, finish preserves access, revoke confirms first');
