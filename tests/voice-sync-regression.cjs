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
const pending = { uid: 'u', coreState: state, savedLists, createdAt: 100, workspaceType: 'individual', familyId: null, baseUpdatedAt: '50' };
pending.signature = signatures.compactJsonSignature({ coreState: state, savedLists });
let raw = JSON.stringify(pending);
const bootstrap = load('src/lib/firebase/use-user-bootstrap.ts', {
  react: {},
  '@/lib/firebase/auth-context': {},
  '@/lib/firebase/resolve-user-bootstrap': {},
  '@/lib/firebase/save-user-data': {},
  '@/lib/firebase/load-user-data': {},
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
assert.equal(bootstrap.hasPendingCloudSnapshot('u', 'individual'), true);
assert.equal(bootstrap.hasPendingCloudSnapshot('other-user', 'individual'), false);
assert.equal(bootstrap.hasPendingCloudSnapshot('u', 'family', 'f'), false);
raw = JSON.stringify({ ...pending, workspaceType: undefined, baseUpdatedAt: undefined });
assert.equal(bootstrap.hasPendingCloudSnapshot('u', 'individual'), false, 'Unscoped legacy marker must not block cloud loading');
raw = JSON.stringify(pending);
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
assert.equal(bootstrap.hasPendingCloudSnapshot('u', 'individual'), false);
raw = null;
assert.equal(bootstrap.hasPendingCloudSnapshot('u', 'individual'), false);
console.log('PASS: pending deletion survives newer Siri timestamp, note variants, repeated refresh and outgoing save');

let notifySnapshot;
let watchedPath;
let unsubscribed = false;
let intervalCallback;
let intervalCleared = false;
let serverReads = 0;
let serverData = remote;
const listeners = new Map();
const browserDocument = {
  visibilityState: 'visible',
  addEventListener: (name, callback) => listeners.set(name, callback),
  removeEventListener: (name) => listeners.delete(name),
};
const live = load('src/lib/firebase/load-user-data.ts', {
  'firebase/firestore': {
    getFirestore: () => ({}),
    doc: (_db, ...path) => path.join('/'),
    getDocFromServer: async () => { serverReads++; return { data: () => serverData }; },
    onSnapshot: (reference, _options, callback) => {
      watchedPath = reference;
      notifySnapshot = callback;
      return () => { unsubscribed = true; };
    },
  },
  './client': { clientApp: () => ({}) },
  './operation-timeout': { withOperationTimeout: (promise) => promise },
}, '', {
  window: {
    setInterval: (callback, delay) => { assert.equal(delay, 15000); intervalCallback = callback; return 1; },
    clearInterval: () => { intervalCleared = true; },
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  },
  document: browserDocument,
});
let notifications = 0;
const stop = live.watchPendingVoiceItems('u', () => { notifications++; });
assert.equal(watchedPath, 'users/u');
const emit = (data, metadata = {}) => notifySnapshot({
  data: () => data,
  metadata: { fromCache: false, hasPendingWrites: false, ...metadata },
});
emit(remote, { fromCache: true });
emit(remote, { hasPendingWrites: true });
assert.equal(notifications, 0);
emit(remote);
emit(remote);
assert.equal(notifications, 1, 'Duplicate snapshots must not trigger a save loop');
emit({ ...remote, pendingVoiceItems: [] });
assert.equal(notifications, 1, 'Acknowledgment must not refresh bootstrap');
emit({ ...remote, updatedAt: 300 });
assert.equal(notifications, 2, 'A later Siri addition must refresh automatically');
stop();
assert.equal(unsubscribed, true);
assert.equal(intervalCleared, true);
assert.equal(listeners.size, 0);
const stopFamily = live.watchPendingVoiceItems({ uid: 'u', workspaceType: 'family', familyId: 'f' }, () => {});
assert.equal(watchedPath, 'families/f/workspace/core');
stopFamily();
console.log('PASS: live Siri notifications, cache filtering, deduplication, cleanup and family workspace');

(async () => {
  let recovered;
  const stopRecovery = live.watchPendingVoiceItems('u', (data) => { recovered = data; });
  browserDocument.visibilityState = 'hidden';
  intervalCallback();
  await new Promise(setImmediate);
  assert.equal(serverReads, 0, 'Hidden pages must not poll');
  browserDocument.visibilityState = 'visible';
  intervalCallback();
  await new Promise(setImmediate);
  assert.equal(recovered, remote, 'Siri overlay must recover without focus event');
  recovered = undefined;
  intervalCallback();
  await new Promise(setImmediate);
  assert.equal(recovered, undefined, 'Unchanged pending snapshot must not loop');
  serverData = { ...remote, updatedAt: 400 };
  intervalCallback();
  stopRecovery();
  await new Promise(setImmediate);
  assert.equal(recovered, undefined, 'A read finishing after cleanup must be ignored');
  console.log('PASS: visible server recovery, hidden pause, deduplication and late-read cleanup');
})().catch((error) => { console.error(error); process.exitCode = 1; });
