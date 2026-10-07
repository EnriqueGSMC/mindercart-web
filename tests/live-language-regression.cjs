const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const assert = require('node:assert/strict');
const listeners = new Map();
const effects = [];
let rendered;
let language = 'en';
const raw = { id: 'milk', name: 'Leche', note: 'cold', quantity: '1' };
const react = {
  useState: (initial) => [initial, (value) => { if (typeof value === 'object') rendered = value; }],
  useEffect: (effect) => effects.push(effect),
};
const moduleOutput = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/mindercart/hooks.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, {
  module: moduleOutput, exports: moduleOutput.exports,
  require: (id) => id === 'react' ? react : {
    CHANGE_EVENT: 'changed',
    readState: () => ({ settings: { language }, activeShoppingListItems: [{ ...raw, name: language === 'en' ? 'Milk' : 'Leche' }] }),
  },
  window: {
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  },
});
moduleOutput.exports.useMinderCartState();
const cleanup = effects[0]();
assert.equal(rendered.activeShoppingListItems[0].name, 'Milk');
listeners.get('changed')({ detail: { activeShoppingListItems: [raw] } });
assert.equal(rendered.activeShoppingListItems[0].name, 'Milk', 'Live cloud event must not display the raw Spanish name');
assert.equal(rendered.activeShoppingListItems[0].note, 'cold');
assert.equal(rendered.activeShoppingListItems.length, 1);
language = 'es';
listeners.get('changed')({ detail: { activeShoppingListItems: [{ ...raw, name: 'Milk' }] } });
assert.equal(rendered.activeShoppingListItems[0].name, 'Leche');
cleanup();
assert.equal(listeners.size, 0);
console.log('PASS: live updates use localized state in English and Spanish without changing notes or duplicating products');
