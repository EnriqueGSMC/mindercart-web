// Actual bootstrap/save functions; in-memory browser and Firestore only.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
function load(file, imports, globals = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: id => { if (id in imports) return imports[id]; throw new Error('Unexpected import: ' + id); }, ...globals });
  return module.exports;
}
const identity = load('src/lib/voice/item-identity.ts', {});
const signatures = load('src/lib/mindercart/compact-signature.ts', {});
const base = { itemKey: 'base', name: 'Base' };
const original = { itemKey: 'original', name: 'Original custom' };
const voice = { itemKey: 'coca', name: 'Coca', unit: 'pza', store: 'HEB', note: '' };
function checkShellStartup() {
  const file = 'src/components/mindercart/Shell.tsx';
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let effect;
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'React.useEffect' && node.arguments[0]?.getText(source).includes('const currentSnapshot: PendingCloudSyncSnapshot')) effect = node.arguments[0].getText(source);
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(effect, 'Use actual Shell autosave effect');
  const ref = x => ({ current: x });
  let scheduled = 0, snapshots = [];
  const resolution = { hasCloudData: true, error: null, workspaceType: 'individual', familyId: null, cloudState: { updatedAt: 200 } };
  const context = {
    session: { status: 'authenticated', user: { uid: 'u' } }, bootstrap: { status: 'loading', resolution },
    state: { itemsMaster: [base, original] },
    syncTimeoutRef: ref(null), queuedSyncSnapshotRef: ref(null), baselineSignatureRef: ref(''), lastSavedSignatureRef: ref(''), lastUidRef: ref(''),
    readSavedListsSnapshot: () => [{ name: 'Cloud list' }],
    buildCloudSyncSignature: (state, savedLists) => signatures.compactJsonSignature({ coreState: state, savedLists }),
    hasPendingCloudSnapshot: () => false,
    readPendingCloudSyncSnapshot: () => { throw new Error('Unscoped pending must not be replayed'); },
    applyPendingCloudSyncSnapshot: () => { throw new Error('Must not apply unknown origin'); },
    writePendingCloudSyncSnapshot: x => snapshots.push(x), startCloudSync: () => {},
    CLOUD_SYNC_DEBOUNCE_MS: 900,
    window: { clearTimeout: () => {}, setTimeout: () => { scheduled++; return 1; } },
  };
  vm.createContext(context);
  vm.runInContext(ts.transpileModule('globalThis.runShellEffect = ' + effect, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context);
  context.runShellEffect();
  context.bootstrap.status = 'ready';
  context.runShellEffect();
  context.runShellEffect();
  assert.equal(scheduled, 0, 'Loading and unchanged cloud baseline must not autosave');
  context.state = { itemsMaster: [base, original, voice] };
  context.runShellEffect();
  assert.equal(scheduled, 1);
  assert.equal(snapshots[0].workspaceType, 'individual');
  assert.equal(snapshots[0].familyId, null);
  assert.equal(snapshots[0].baseUpdatedAt, '200');
  resolution.workspaceType = 'family'; resolution.familyId = 'f';
  context.runShellEffect();
  assert.equal(scheduled, 1, 'Changing workspace must reset baseline without publishing prior workspace');
  resolution.error = 'Load failed';
  context.state = { itemsMaster: [] };
  context.runShellEffect();
  assert.equal(scheduled, 1, 'Failed cloud load must not schedule a save');
  console.log('PASS: Shell startup baseline, unchanged load, scoped edit, workspace switch and load-error guard');
}
async function bootstrapCase(marker, workspaceType = 'individual', withVoice = true) {
  let local = { itemsMaster: [base], generalListItems: [], activeShoppingListItems: [], settings: {} };
  let localLists = [];
  const effects = [], writes = [];
  const cloud = { updatedAt: 200, coreState: { ...local, itemsMaster: [base, original, voice], generalListItems: [voice], activeShoppingListItems: [voice] }, savedLists: [{ name: 'Original list' }], pendingVoiceItems: withVoice ? [voice] : [] };
  const pending = { uid: 'u', createdAt: 300, coreState: local, savedLists: [], ...marker };
  pending.signature = signatures.compactJsonSignature({ coreState: pending.coreState, savedLists: pending.savedLists });
  const raw = JSON.stringify(pending);
  const react = { useEffect: f => effects.push(f), useRef: x => ({ current: x }), useState: x => [x, () => {}] };
  const hook = load('src/lib/firebase/use-user-bootstrap.ts', {
    react,
    '@/lib/firebase/auth-context': { useAuthSession: () => ({ enabled: true, status: 'authenticated', user: { uid: 'u' } }) },
    '@/lib/firebase/resolve-user-bootstrap': { resolveUserBootstrap: async () => ({ uid: 'u', hasCloudData: true, cloudState: cloud, workspaceType, familyId: workspaceType === 'family' ? 'f' : null }) },
    '@/lib/firebase/save-user-data': { saveUserData: async input => writes.push(input) },
    '@/lib/firebase/load-user-data': { watchPendingVoiceItems: () => () => {} },
    '@/lib/voice/item-identity': identity,
    '@/lib/mindercart/compact-signature': signatures,
    '@/lib/mindercart/storage': { CHANGE_EVENT: 'changed', readState: () => local, writeState: state => { local = state; } },
  }, {
    window: { localStorage: { getItem: () => raw, setItem: (key, value) => { localLists = JSON.parse(value); }, removeItem: () => {}, }, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => {} },
    document: { visibilityState: 'visible', addEventListener: () => {}, removeEventListener: () => {} },
    CustomEvent: function () {},
  });
  hook.useUserBootstrap();
  effects.forEach(f => f());
  for (let i = 0; i < 15; i++) await Promise.resolve();
  return { local, localLists, writes, raw };
}
async function main() {
  checkShellStartup();
  for (const createdAt of [100, 300]) {
    const result = await bootstrapCase({ createdAt });
    assert.ok(result.local.itemsMaster.some(x => x.itemKey === 'original'), 'Legacy pending must not erase cloud custom catalog');
    assert.equal(result.localLists[0].name, 'Original list');
    assert.ok(result.writes[0].data.coreState.itemsMaster.some(x => x.itemKey === 'original'));
  }
  const noVoice = await bootstrapCase({}, 'individual', false);
  assert.ok(noVoice.local.itemsMaster.some(x => x.itemKey === 'original'));
  assert.equal(noVoice.writes.length, 0);
  const switched = await bootstrapCase({ workspaceType: 'family', familyId: 'f', baseUpdatedAt: '50' });
  assert.ok(switched.local.itemsMaster.some(x => x.itemKey === 'original'), 'Family pending must not block individual cloud');
  const scoped = await bootstrapCase({ workspaceType: 'individual', familyId: null, baseUpdatedAt: '50' });
  assert.equal(scoped.local.itemsMaster.some(x => x.itemKey === 'original'), false, 'Proven local deletion must remain deleted');
  assert.equal(scoped.localLists.length, 0, 'Proven local list deletion must remain deleted');
  assert.equal(scoped.local.itemsMaster.filter(x => x.itemKey === 'coca').length, 1);
  console.log('PASS: old/new legacy pending, cloud catalog/list baseline, scope mismatch, legitimate deletions and Siri');

  let activeFamily = 'f', writes = [], reads = [];
  const save = load('src/lib/firebase/save-user-data.ts', {
    'firebase/firestore': {
      getFirestore: () => ({}), doc: (db, ...parts) => parts.join('/'),
      getDoc: async () => ({ exists: () => true, data: () => ({ familyMembership: { status: 'active', familyId: activeFamily } }) }),
      runTransaction: async (db, callback) => callback({
        get: async ref => { reads.push(ref); return { exists: () => true, data: () => ref.startsWith('users/') ? { familyMembership: activeFamily ? { status: 'active', familyId: activeFamily } : { status: 'inactive' } } : { coreState: { itemsMaster: [original] } } }; },
        set: (ref, payload) => writes.push({ ref, payload }),
      }),
    },
    './client': { clientApp: () => ({}) }, './operation-timeout': { withOperationTimeout: async p => p },
    '@/lib/voice/item-identity': identity, '@/lib/mindercart/compact-signature': signatures,
  });
  const input = { uid: 'u', workspaceType: 'family', familyId: 'f', data: { coreState: { itemsMaster: [original] }, savedLists: [] } };
  activeFamily = null;
  await assert.rejects(save.saveUserData(input), /workspace changed/);
  assert.equal(writes.length, 0);
  activeFamily = 'g';
  await assert.rejects(save.saveUserData(input), /workspace changed/);
  await assert.rejects(save.saveUserData({ ...input, workspaceType: 'individual', familyId: null }), /workspace changed/);
  assert.equal(writes.length, 0);
  activeFamily = 'f';
  await save.saveUserData(input);
  assert.equal(writes[0].ref, 'families/f/workspace/core');
  activeFamily = null;
  await save.saveUserData({ ...input, workspaceType: 'individual', familyId: null });
  assert.equal(writes[1].ref, 'users/u');
  console.log('PASS: atomic membership guard rejects destination drift; valid individual/family saves succeed');
  console.log('NO_NETWORK_NO_FIREBASE_WRITES');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
