// Run from the repository root: node tests/voice-sync-regression.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');

function load(path, imports, extra = '', globals = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(path, 'utf8') + extra, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(source, {
    module, exports: module.exports,
    require: (id) => imports[id] ?? require(id),
    ...globals,
  });
  return module.exports;
}

const identity = load('src/lib/voice/item-identity.ts', {});
const signatures = load('src/lib/mindercart/compact-signature.ts', {});
const removed = { id: 'old', itemKey: 'pan', name: 'Pan Ahogada', note: '', unit: 'pza', store: 'HEB' };
const orange = { id: 'orange', itemKey: 'agua', name: 'Agua Mineral', note: 'naranja', unit: 'pza', store: 'HEB' };
const grapefruit = { ...orange, id: 'grapefruit', note: 'toronja' };
let state = { activeShoppingListItems: [], generalListItems: [], itemsMaster: [], settings: {} };
const savedLists = [];
const pending = { uid: 'u', coreState: state, savedLists, createdAt: 100 };
pending.signature = signatures.compactJsonSignature({ coreState: state, savedLists });
let raw = JSON.stringify(pending);
const bootstrap = load('src/lib/firebase/use-user-bootstrap.ts', {
  react: {},
  '@/lib/firebase/auth-context': {},
  '@/lib/firebase/resolve-user-bootstrap': {},
  '@/lib/firebase/save-user-data': {},
  '@/lib/voice/item-identity': identity,
  '@/lib/mindercart/compact-signature': signatures,
  '@/lib/mindercart/storage': { readState: () => state, writeState: (next) => { state = next; } },
}, '\nexport { hasPendingCloudSnapshot, applyPendingVoiceItemsToLocal };', {
  window: { localStorage: { getItem: () => raw } },
});

// Siri's newer timestamp must not replace a locally emptied list with old rows.
const remote = {
  updatedAt: 200,
  voiceUpdatedAt: 200,
  pendingVoiceItems: [orange, grapefruit],
  coreState: {
    activeShoppingListItems: [removed, orange, grapefruit],
    generalListItems: [removed, orange, grapefruit],
    itemsMaster: [],
  },
};
assert.equal(bootstrap.hasPendingCloudSnapshot('u'), true);
assert.equal(bootstrap.hasPendingCloudSnapshot('other-user'), false);
bootstrap.applyPendingVoiceItemsToLocal(remote);
assert.equal(state.activeShoppingListItems.length, 2);
assert.equal(state.activeShoppingListItems.some((row) => row.id === 'old'), false);
assert.equal(state.activeShoppingListItems[0].note, 'naranja');
assert.equal(state.activeShoppingListItems[1].note, 'toronja');
bootstrap.applyPendingVoiceItemsToLocal(remote);
assert.equal(state.activeShoppingListItems.length, 2, 'Repeated refresh must not duplicate rows');

const save = load('src/lib/firebase/save-user-data.ts', {
  'firebase/firestore': {}, './client': {}, './operation-timeout': {},
  '@/lib/mindercart/compact-signature': signatures,
  '@/lib/voice/item-identity': identity,
}, '\nexport { mergePendingVoiceItems };');
const outgoing = save.mergePendingVoiceItems({ coreState: state }, remote);
assert.equal(outgoing.coreState.activeShoppingListItems.length, 2);
assert.equal(outgoing.coreState.activeShoppingListItems.some((row) => row.id === 'old'), false);
assert.equal(outgoing.pendingVoiceItems.length, 0);

raw = JSON.stringify({ ...pending, signature: 'invalid' });
assert.equal(bootstrap.hasPendingCloudSnapshot('u'), false);
raw = null;
assert.equal(bootstrap.hasPendingCloudSnapshot('u'), false);
console.log('PASS: pending deletion survives newer Siri timestamp, note variants, repeated refresh and outgoing save');
