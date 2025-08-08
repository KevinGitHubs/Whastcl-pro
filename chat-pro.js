const uid = crypto.randomUUID().slice(-8);
const activeChannel = location.hash.slice(1);
const channels = JSON.parse(localStorage.getItem('channels')||'{}');
const c = channels[activeChannel];
if(!c){alert('Channel tidak ditemukan');location.href='index.html';}

document.getElementById('chatTitle').textContent=c.name;

function encrypt(msg){
  return btoa(msg); // simple encode
}
function decrypt(str){
  return atob(str);
}

function renderChat(){
  const box=document.getElementById('messages');
  box.innerHTML='';
  (c.msgs||[]).forEach(m=>{
    const div=document.createElement('div');
    div.className='msg '+(m.sender===uid?'sent':'received');
    let content=m.type==='text'?decrypt(m.text):m.data;
    if(m.type==='voice')content=`<audio controls src="${m.data}"></audio>`;
    if(m.type==='file')content=`<a href="${m.data}" target="_blank" style="color:#00ffc8">📁 ${m.name}</a>`;
    const left=Math.max(0,300-Math.floor((Date.now()-m.ts)/1000));
    const isAnn=activeChannel==='announcement';
    div.innerHTML=`
      ${isAnn?`<div class="msg-name">${m.sender}</div>`:''}
      ${content}
      <div class="timer">${left}s</div>
      ${isAnn?`
        <div class="actions">
          <span class="love-btn" onclick="like(${m.id})">❤️ ${m.likes||0}</span>
          <span class="comment-toggle" onclick="toggleComment(${m.id})">💬</span>
        </div>
        <div class="comment-box" id="comment-${m.id}">
          <input placeholder="Komentar…" onkeypress="sendComment(event,${m.id})"/>
          <div class="comment-list" id="clist-${m.id}">${(m.comments||[]).map(c=>`<div>${c}</div>`).join('')}</div>
        </div>`:''}
    `;
    box.appendChild(div);
  });
  box.scrollTop=box.scrollHeight;
}
function like(id){
  const m=c.msgs.find(m=>m.id===id);
  if(m){m.likes=(m.likes||0)+1;localStorage.setItem('channels',JSON.stringify(channels));renderChat();}
}
function toggleComment(id){
  const box=document.getElementById(`comment-${m.id}`);
  box.style.display=box.style.display==='block'?'none':'block';
}
function sendComment(e,id){
  if(e.key!=='Enter')return;
  const val=e.target.value.trim();if(!val)return;
  const m=c.msgs.find(m=>m.id===id);
  if(m){m.comments=m.comments||[];m.comments.push(val);e.target.value='';localStorage.setItem('channels',JSON.stringify(channels));renderChat();}
}
function sendText(){
  const val=document.getElementById('msgInput').value.trim();
  if(!val)return;
  if(c.adminOnly){alert('Hanya admin');return;}
  c.msgs.push({type:'text',text:encrypt(val),sender:uid,ts:Date.now(),id:Date.now()});
  localStorage.setItem('channels',JSON.stringify(channels));
  renderChat();
}
function recordVoice(){
  navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
    const rec=new MediaRecorder(stream),chunks=[];
    rec.ondataavailable=e=>chunks.push(e.data);
    rec.onstop=()=>{
      const url=URL.createObjectURL(new Blob(chunks,{type:'audio/webm'}));
      c.msgs.push({type:'voice',data:url,sender:uid,ts:Date.now(),id:Date.now()});
      localStorage.setItem('channels',JSON.stringify(channels));
      renderChat();
    };
    rec.start();setTimeout(()=>rec.stop(),5000);
  });
}
function attachFile(){
  const inp=document.createElement('input');inp.type='file';inp.accept='*/*';
  inp.onchange=()=>{
    const file=inp.files[0];if(!file)return;
    const url=URL.createObjectURL(file);
    c.msgs.push({type:'file',data:url,name:file.name,sender:uid,ts:Date.now(),id:Date.now()});
    localStorage.setItem('channels',JSON.stringify(channels));
    renderChat();
  };
  inp.click();
}
function copyLink(){
  navigator.clipboard.writeText(`${location.origin}${location.pathname}#${activeChannel}`);
  alert('Tautan salin ke clipboard!');
}
setInterval(()=>{c.msgs=c.msgs.filter(m=>Date.now()-m.ts<5*60*1000);localStorage.setItem('channels',JSON.stringify(channels));renderChat();},1000);
renderChat();
