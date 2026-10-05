const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const output = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/firebase/auth-messages.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: output.exports, module: output });
for (const lang of ['es', 'en']) {
  for (const code of ['auth/invalid-credential', 'auth/email-already-in-use', 'auth/invalid-email', 'auth/weak-password', 'auth/network-request-failed', 'auth/too-many-requests', 'auth/request-timeout']) {
    const message = output.exports.authErrorMessage({ message: `Firebase: Error (${code}).` }, lang);
    assert.ok(message.length > 20);
    assert.ok(!message.includes('Firebase') && !message.includes('auth/'));
  }
  assert.match(output.exports.passwordResetMessage(lang), /Spam/);
}
const gate = fs.readFileSync('src/components/mindercart/AccessGate.tsx', 'utf8');
assert.ok(gate.includes('if (session.status === "authenticated") return <>{children}{navigation}</>'));
assert.ok(gate.includes('router.replace("/auth")'));
assert.ok(gate.includes('mindercart.onboardingSeen.v1'));
assert.ok(gate.includes('session.error'));
assert.ok(gate.includes('Agrega lo que necesitas en segundos'));
assert.ok(gate.includes('Crea y reutiliza tus propias listas'));
assert.ok(gate.includes('Compra más rápido, organizado por categoría'));
assert.ok(!fs.readFileSync('src/app/page.tsx', 'utf8').includes('onboardingModal'));
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
let status = 'guest';
let path = '/';
const gateModule = { exports: {} };
vm.runInNewContext(ts.transpileModule(gate, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText, {
  exports: gateModule.exports, module: gateModule,
  require(name) {
    if (name === 'react') return React;
    if (name === 'next/navigation') return { usePathname: () => path, useRouter: () => ({ replace() {} }) };
    if (name.includes('auth-context')) return { useAuthSession: () => ({ status, enabled: true, error: null }) };
    if (name.includes('hooks')) return { useMinderCartState: () => ({ settings: { language: 'es' } }) };
    throw Error(name);
  },
});
function renderGate() { return renderToStaticMarkup(React.createElement(gateModule.exports.AccessGate, { children: 'PRIVATE_LIST', navigation: 'PRIVATE_NAV' })); }
assert.ok(!renderGate().includes('PRIVATE_LIST'));
assert.ok(!renderGate().includes('PRIVATE_NAV'));
status = 'loading';
assert.ok(!renderGate().includes('PRIVATE_LIST'));
status = 'authenticated';
assert.ok(renderGate().includes('PRIVATE_LISTPRIVATE_NAV'));
status = 'guest'; path = '/auth';
assert.ok(renderGate().includes('PRIVATE_LIST') && !renderGate().includes('PRIVATE_NAV'));
path = '/privacy';
assert.ok(renderGate().includes('PRIVATE_LIST'));
const auth = fs.readFileSync('src/app/auth/page.tsx', 'utf8');
assert.ok(auth.includes('window.confirm'));
assert.ok(auth.includes('role="status"'));
assert.ok(auth.includes('passwordResetMessage(lang)'));
assert.ok(!auth.includes('AppShell'));
assert.ok(!auth.includes('error.message'));
assert.ok(auth.includes('void run(mode)'));
assert.ok(auth.includes('changeMode("signup")'));
assert.ok(!auth.includes('onClick={() => void run("signup")}'));
assert.ok(auth.includes('¿No tienes cuenta?'));
assert.ok(auth.includes('¿Olvidaste tu contraseña?'));
assert.ok(auth.includes('src="/mindercart-avatar.png"'));
assert.ok(auth.includes('"Sign in" : "Inicio de sesión"'));
assert.ok(auth.includes('<div className="mc-auth-footer" aria-hidden="true" />'));
assert.ok(!auth.includes('<nav') && !auth.includes('setMenuOpen'));
const actions = fs.readFileSync('src/lib/firebase/auth-actions.ts', 'utf8');
assert.ok(actions.includes('auth/request-timeout'));
assert.ok(actions.includes('clearTimeout(timer)'));
console.log('PASS: bilingual auth errors, conditional recovery/spam copy, guest gate and reset feedback guards');
