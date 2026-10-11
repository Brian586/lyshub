import { launch, sleep } from './cdp.mjs';
const B = 'http://127.0.0.1:8770', O = process.env.TEMP || '.', X = 'C:/src/General Graphics/kodi';  // test uploads: the Kodi marketing kit
const p = await launch();
await p.go(`${B}/admin/index.html?emulator=1`, 3000);
await p.eval(`(()=>{const f=document.getElementById('signin-form'); f.email.value='admin@lyshub.test'; f.password.value='Kodi-test-2026'; f.requestSubmit();})()`);
await p.waitFor(`document.querySelectorAll('.project-row').length > 0`);
const RESUME = process.argv[2] === 'resume';
if (!RESUME) {
await p.go(`${B}/admin/edit.html`, 3000);
await p.waitFor(`!document.querySelector('[data-state=app]').hidden`);
const desc = `Kodi is a property management system for Kenyan landlords and letting agencies: a tenant app for iPhone and Android, and a web admin panel for the office.

**For tenants:** see what is owed and pay it by M-Pesa in seconds, with part payments and an instant receipt. Report a fault, follow it until the fundi is done, read the lease and chat with the caretaker.

**For landlords and agencies:** a rent roll, invoices and M-Pesa payment tracking, arrears to chase, maintenance requests, tenants, leases and units, and occupancy reports, all in one panel.

Built by Lyshub Technologies in Mombasa. Call 0768 871 004 or email info@lyshub.com for a free demo.`;
await p.eval(`(()=>{const f=document.getElementById('project-form'); const set=(n,v)=>{f.elements[n].value=v; f.elements[n].dispatchEvent(new Event('input'))};
 set('title','Kodi'); set('tag','Software Product · App & Web'); set('client','Lyshub Technologies (own product)'); set('location','Mombasa, Kenya'); set('website','lyshub.com');
 set('shortDescription','Property management for Kenyan landlords: a tenant app for rent by M-Pesa, repairs and leases, plus a web admin panel for the office.');
 set('description', ${JSON.stringify(desc)}); f.elements.published.checked = true; f.elements.order.value = 1;})()`);
await p.setFiles('#cover-input', [`${X}/assets/kodi-cover-1920x1080.png`]);
await p.waitFor(`document.getElementById('cover-preview').classList.contains('has-image')`);
await p.eval(`document.getElementById('save-btn').click()`);
await p.waitFor(`document.getElementById('save-status').classList.contains('ok')`, 20000);
console.log('saved:', await p.eval(`document.getElementById('save-status').textContent`), await p.eval('location.search'));
const files = ['kodi-app-flyer-4x5-1080x1350.png','kodi-app-flyer-9x16-1080x1920.png','kodi-app-flyer-1x1-1080x1080.png','kodi-app-flyer-a4-2000x2800.png',
  'kodi-admin-flyer-4x5-1080x1350.png','kodi-admin-flyer-9x16-1080x1920.png','kodi-admin-flyer-1x1-1080x1080.png',
  'kodi-promo-16x9-web-1280x720.mp4','kodi-promo-9x16-web-720x1280.mp4','kodi-promo-4x5-web-720x900.mp4'].map(f=>`${X}/export/${f}`);
const t0 = Date.now();
await p.setFiles('#media-input', files);
await p.waitFor(`document.querySelectorAll('#media-rows .media-row select').length === ${files.length} || document.querySelector('#media-rows .err')`, 300000);
console.log('uploads in', Math.round((Date.now()-t0)/1000), 's; errors:', await p.eval(`[...document.querySelectorAll('#media-rows .err')].map(e=>e.textContent).join(' | ')`));
}
await p.go(`${B}/admin/edit.html?id=kodi`, 4000);
await p.waitFor(`document.querySelectorAll('#media-rows .media-row').length > 0`);
console.log('rows:', await p.eval(`[...document.querySelectorAll('#media-rows .media-row')].map(r=>r.querySelector('input')?.value+' / '+r.querySelector('select')?.value+' / '+r.querySelector('.small')?.textContent).join(' || ')`));
await p.shot(`${O}/6-editor.png`);
// Public
await p.go(`${B}/projects.html?emulator=1`, 5000);
console.log('public cards:', await p.eval(`[...document.querySelectorAll('#projects-list .project-card h3')].map(h=>h.textContent).join(', ')`));
await p.shot(`${O}/7-public-list.png`);
await p.go(`${B}/project-details.html?projectId=kodi&emulator=1`, 5000);
console.log('kit cards:', await p.eval(`[...document.querySelectorAll('.media-card h3')].map(h=>h.textContent + ' [' + [...h.parentElement.querySelectorAll('.media-sizes button')].map(b=>b.textContent).join(', ') + ']').join(' ; ')`));
await p.shot(`${O}/8-detail.png`);
await p.eval(`[...document.querySelectorAll('.media-card')].find(c=>c.querySelector('h3').textContent.includes('Promo')).querySelector('.media-open').click()`);
await p.waitFor(`document.querySelector('.media-card video') && document.querySelector('.media-card video').readyState >= 2`, 60000);
await sleep(1500);
console.log('video:', await p.eval(`(()=>{const v=document.querySelector('.media-card video'); return v.videoWidth+'x'+v.videoHeight+' dur '+v.duration.toFixed(1)+' t='+v.currentTime.toFixed(1)})()`));
await p.eval(`document.querySelector('.media-card video').scrollIntoView({block:'center'})`);
await p.shot(`${O}/9-video.png`, false);
console.log('logs:', p.logs.join('\n'));
p.close();
