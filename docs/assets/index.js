(async function(){
  const cfg = window.SITE_CONFIG || {}; 
  const owner = cfg.owner; const repo = cfg.repo; const branch = cfg.branch || 'main';
  const messageEl = document.getElementById('message');
  const listEl = document.getElementById('folders');

  function setMessage(text){ if(messageEl){ messageEl.textContent = text; } }
  function clearMessage(){ if(messageEl){ messageEl.textContent = ''; } }

  const api = `https://api.github.com/repos/${owner}/${repo}/contents/PDFs?ref=${encodeURIComponent(branch)}`;
  try{
    const res = await fetch(api, { headers: { 'Accept': 'application/vnd.github+json' } });
    if(res.status === 404){
      setMessage('未找到 PDFs 目录。请在仓库根目录新建 PDFs/ 并添加子文件夹。');
      return;
    }
    if(!res.ok){ throw new Error(`GitHub API 错误: ${res.status}`); }
    const items = await res.json();
    const dirs = (items||[]).filter(x=>x && x.type === 'dir');
    if(!dirs.length){ setMessage('PDFs 目录为空，添加一些子文件夹吧。'); return; }
    clearMessage();
    dirs.sort((a,b)=>a.name.localeCompare(b.name,'zh-Hans-CN'));
    for(const d of dirs){
      const a = document.createElement('a');
      a.href = `./folder.html?name=${encodeURIComponent(d.name)}`;
      a.innerHTML = `<div class="card"><div class="name">${d.name}</div><div class="meta">点击查看清单</div></div>`;
      listEl.appendChild(a);
    }
  }catch(err){
    setMessage(`加载失败：${err.message}`);
  }
})();


