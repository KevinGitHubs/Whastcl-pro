const uid = crypto.randomUUID().slice(-8);
let channels = JSON.parse(localStorage.getItem('channels') || '{}');
if (!channels.announcement) channels.announcement = { name: '📢 Pemberitahuan', msgs: [], adminOnly: true };
if (!channels.all) channels.all = { name: '💬 All', msgs: [], adminOnly: false };

function renderChannels() {
  const list = document.getElementById('channelList');
  list.innerHTML = '';
  Object.entries(channels).forEach(([id, { name }]) => {
    const div = document.createElement('div');
    div.className = 'channel';
    div.onclick = () => location.href = `chat.html#${id}`;
    div.innerHTML = `
      <img src="assets/logo.png" alt="${name[0]}"/>
      <div class="info">
        <div class="name">${name}</div>
        <div class="preview">${id === 'announcement' ? 'Admin only' : 'Grup umum'}</div>
      </div>
    `;
    list.appendChild(div);
  });
}
function createChannel() {
  const name = prompt('Nama Channel Baru:');
  if (!name) return;
  const id = btoa(name + Date.now()).replace(/[^a-zA-Z0-9]/g, '');
  channels[id] = { name, msgs: [], adminOnly: false };
  localStorage.setItem('channels', JSON.stringify(channels));
  renderChannels();
}
renderChannels();
