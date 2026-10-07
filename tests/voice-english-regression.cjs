const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const assert = require('node:assert/strict');
const moduleOutput = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/voice/parse-utterance.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, {
  module: moduleOutput, exports: moduleOutput.exports,
  require: () => ({ DEFAULT_CATEGORY_VALUE: 'Otro', DEFAULT_UNIT_VALUE: 'pza', UNIT_CATALOG: [] }),
});
const parse = moduleOutput.exports.parseVoiceUtterance;
const catalog = [
  { itemKey: 'water', name: 'Agua Mineral', nameEs: 'Agua Mineral', nameEn: 'Sparkling Water' },
  { itemKey: 'milk', name: 'Leche', nameEs: 'Leche', nameEn: 'Milk' },
];
const items = parse('Sparkling water note strawberry, next item sparkling water note lime, next item two milk', catalog);
assert.equal(items.length, 3);
assert.equal(items[0].itemKey, 'water');
assert.equal(items[0].isCustom, false);
assert.equal(items[0].note, 'strawberry');
assert.equal(items[1].note, 'lime');
assert.equal(items[2].itemKey, 'milk');
assert.equal(items[2].quantity, '2');
assert.equal(parse('milk note sugar free and lactose free', catalog)[0].note, 'sugar free and lactose free');
assert.equal(parse('Add to my list milk and sparkling water', catalog).length, 2);
assert.equal(parse('I need milk', catalog)[0].itemKey, 'milk');
const spanish = parse('Agua mineral nota naranja, siguiente artículo agua mineral nota toronja, siguiente artículo leche', catalog);
assert.equal(spanish.length, 3);
assert.equal(spanish[0].note, 'naranja');
assert.equal(spanish[1].note, 'toronja');
console.log('PASS: English names, quantities, note/next item and Spanish compatibility');
