(async function(){
  const cfg = window.SITE_CONFIG || {}; 
  const owner = cfg.owner; const repo = cfg.repo; const branch = cfg.branch || 'main';
  const messageEl = document.getElementById('message');
  const listEl = document.getElementById('folders');

  function setMessage(text){ if(messageEl){ messageEl.textContent = text; } }
  function clearMessage(){ if(messageEl){ messageEl.textContent = ''; } }

  const api = `https://api.github.com/repos/${owner}/${repo}/contents/PDFs?ref=${encodeURIComponent(branch)}`;
  try{
    let dirs = [];
    // Prefer reading from repository tree API; fallback to manifest; finally show basic instructions
    let res = await fetch(api, { headers: { 'Accept': 'application/vnd.github+json' } });
    if(res.ok){
      const items = await res.json();
      dirs = (items||[]).filter(x=>x && x.type === 'dir').map(x=>({ name: x.name }));
    } else {
      // Fallback: try manifest PDFs/index.json served via raw.githubusercontent
      const manifest = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/PDFs/index.json`;
      res = await fetch(manifest, { cache: 'no-cache' });
      if(res.ok){
        const j = await res.json();
        const names = Array.isArray(j) ? j : (j && j.folders) || [];
        dirs = names.filter(Boolean).map(n=>({ name: n }));
      } else if(res.status === 404) {
        setMessage('未找到 PDFs 目录。请在仓库根目录新建 PDFs/ 并添加子文件夹。');
        return;
      } else {
        throw new Error(`GitHub API 错误: ${res.status}`);
      }
    }
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


