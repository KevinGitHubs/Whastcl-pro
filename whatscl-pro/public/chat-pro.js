const uid = crypto.randomUUID().slice(-8);
const activeChannel = location.hash.slice(1);
let isAdmin = localStorage.getItem('admin') === 'true';

document.getElementById('chatTitle').textContent = activeChannel;

/* enkripsi ringan */
async function encrypt(msg) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode('whatscl-secret'), 'AES-GCM', false, ['encrypt']);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(msg));
  return { iv: [...iv], cipher: [...new Uint8Array(cipher)] };
}
async function decrypt(obj) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode('whatscl-secret'), 'AES-GCM', false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(obj.iv) }, key, new Uint8Array(obj.cipher));
  return new TextDecoder().decode(plain);
}
async function sendText() {
  const val = document.getElementById('msgInput').value.trim();
  if (!val) return;
  const enc = await encrypt(val);
  await fetch('/.netlify/functions/store', { method: 'POST', body: JSON.stringify({ channel: activeChannel, cipher: enc }) });
  document.getElementById('msgInput').value = '';
  loadMsgs();
}
async function loadMsgs() {
  const res = await fetch(`/.netlify/functions/store?channel=${activeChannel}`);
  const data = await res.json();
  const box = document.getElementById('messages');
  box.innerHTML = '';
  data.forEach(async m => {
    const div = document.createElement('div');
    div.className = 'msg received';
    div.innerHTML = await decrypt(m.cipher);
    box.appendChild(div);
  });
}
loadMsgs();
