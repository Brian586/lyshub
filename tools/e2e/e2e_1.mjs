import { launch, sleep } from './cdp.mjs';
const B = 'http://127.0.0.1:8770';
const O = process.env.TEMP || '.';
const p = await launch();
// Public page, Firestore empty -> built-in list
await p.go(`${B}/projects.html?emulator=1`, 4000);
console.log('public cards:', await p.eval(`document.querySelectorAll('#projects-list .project-card').length`));
await p.shot(`${O}/1-public-fallback.png`, false);
// Admin sign-in screen
await p.go(`${B}/admin/index.html?emulator=1`, 3000);
console.log('state:', await p.eval(`[...document.querySelectorAll('[data-state]')].filter(e=>!e.hidden).map(e=>e.dataset.state).join(',')`));
await p.shot(`${O}/2-signin.png`, false);
// Non-admin
await p.eval(`(()=>{const f=document.getElementById('signin-form'); f.email.value='visitor@lyshub.test'; f.password.value='Kodi-test-2026'; f.requestSubmit();})()`);
await p.waitFor(`!document.querySelector('[data-state=denied]').hidden`);
await p.shot(`${O}/3-denied.png`, false);
await p.eval(`document.querySelector('[data-state=denied] [data-signout]').click()`);
await p.waitFor(`!document.querySelector('[data-state=signin]').hidden`);
// Admin
await p.eval(`(()=>{const f=document.getElementById('signin-form'); f.email.value='admin@lyshub.test'; f.password.value='Kodi-test-2026'; f.requestSubmit();})()`);
await p.waitFor(`!document.querySelector('[data-state=app]').hidden && !document.querySelector('#project-list .skeleton')`);
await p.shot(`${O}/4-admin-empty.png`, false);
await p.eval(`document.getElementById('import-static').click()`);
await p.waitFor(`document.querySelectorAll('.project-row').length > 0`, 30000);
await p.shot(`${O}/5-admin-imported.png`, false);
console.log('rows:', await p.eval(`document.querySelectorAll('.project-row').length`));
console.log('logs:', p.logs.join('\n'));
p.close();
