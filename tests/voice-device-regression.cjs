const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const moduleOutput = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/voice/device-platform.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: moduleOutput.exports, module: moduleOutput });
const detect = moduleOutput.exports.detectVoiceDevicePlatform;
assert.equal(detect('Mozilla Android Chrome'), 'android');
assert.equal(detect('Mozilla iPhone Safari'), 'ios');
assert.equal(detect('Mozilla iPad Safari'), 'ios');
assert.equal(detect('Mozilla Macintosh Safari', 5), 'ios');
assert.equal(detect('Mozilla Macintosh Safari', 0), 'unknown');
assert.equal(detect('Mozilla Windows Chrome', 10), 'unknown');
assert.equal(detect(''), 'unknown');
const settings = fs.readFileSync('src/app/settings/page.tsx', 'utf8');
assert.ok(settings.includes('session.status === "authenticated" && voiceDevice === "ios"'));
assert.ok(settings.includes('voiceDevice === "android" ? <details'));
assert.ok(settings.includes('<option value="unknown">'));
assert.ok(settings.includes('<option value="ios">'));
assert.ok(settings.includes('<option value="android">'));
console.log('PASS: device detection, tablet fallback, desktop choice and platform-specific help gates');
