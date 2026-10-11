const A = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo';
const F = 'http://127.0.0.1:8080/v1/projects/lyshub-technologies/databases/(default)/documents';
async function user(email) {
  const r = await (await fetch(A, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: 'Kodi-test-2026', returnSecureToken: true }) })).json();
  return r.localId;
}
const admin = await user('admin@lyshub.test');
const other = await user('visitor@lyshub.test');
const r = await fetch(`${F}/admins/${admin}`, { method: 'PATCH', headers: { 'content-type': 'application/json', Authorization: 'Bearer owner' }, body: JSON.stringify({ fields: { email: { stringValue: 'admin@lyshub.test' } } }) });
console.log('admin', admin, 'other', other, 'admins doc', r.status);
