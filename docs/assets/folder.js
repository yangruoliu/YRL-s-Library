(async function(){
  const cfg = window.SITE_CONFIG || {}; 
  const owner = cfg.owner; const repo = cfg.repo; const branch = cfg.branch || 'main';
  const usp = new URLSearchParams(location.search);
  const name = usp.get('name') || '';
  const titleEl = document.getElementById('folder-title');
  const messageEl = document.getElementById('message');
  const tableWrap = document.getElementById('table-wrap');
  const tbody = document.getElementById('papers-body');

  function setMessage(text){ if(messageEl){ messageEl.textContent = text; } }
  function clearMessage(){ if(messageEl){ messageEl.textContent = ''; } }

  if(!name){ setMessage('缺少子目录参数。'); return; }
  titleEl.textContent = name;

  // Fetch meta.json from the folder
  const raw = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/PDFs/${encodeURIComponent(name)}/meta.json`;

  try{
    const res = await fetch(raw, { cache: 'no-cache' });
    if(res.status === 404){ setMessage('未找到 meta.json，请在该子目录添加 meta.json。'); return; }
    if(!res.ok){ throw new Error(`加载 meta.json 失败: ${res.status}`); }
    const data = await res.json();
    let rows = Array.isArray(data) ? data : (data.items || []);
    // Defensive: filter out falsy or non-object entries
    rows = rows.filter(x => x && typeof x === 'object');
    if(!rows.length){ setMessage('当前目录暂无条目。'); return; }
    clearMessage();
    render(rows);
  }catch(err){
    setMessage(`加载失败：${err.message}`);
  }

  async function getRepoStars(repoUrl){
    try{
      if(!repoUrl){ return ''; }
      const m = repoUrl.match(/github.com\/(.+?)\/(.+?)(?:\.|\/|$)/i);
      if(!m){ return ''; }
      const r = await fetch(`https://api.github.com/repos/${m[1]}/${m[2]}`, { headers: { 'Accept': 'application/vnd.github+json' } });
      if(!r.ok){ return ''; }
      const j = await r.json();
      return j.stargazers_count ?? '';
    }catch{ return ''; }
  }

  async function render(items){
    tableWrap.hidden = false;
    // resolve stars concurrently but limit concurrency for performance (simple batch)
    const batched = [];
    const batchSize = 8;
    for(let i=0;i<items.length;i+=batchSize){ batched.push(items.slice(i,i+batchSize)); }
    const results = [];
    for(const group of batched){
      const stars = await Promise.all(group.map(x=>getRepoStars(x.github_repo)));
      results.push(...stars);
    }
    const frag = document.createDocumentFragment();
    items.forEach((it, idx)=>{
      try {
        const tr = document.createElement('tr');
        const pdfHrefRaw = it.pdf || it.file || it.filename;
        const pdfHref = typeof pdfHrefRaw === 'string' ? pdfHrefRaw.trim() : pdfHrefRaw;
        const pdfUrl = pdfHref ? toFileUrl(pdfHref) : '';
        const ghRaw = it.github_repo || it.github || '';
        const ghUrl = typeof ghRaw === 'string' ? ghRaw.trim() : ghRaw;
        const axRaw = it.arxiv || it.arxiv_url || '';
        const arxivUrl = typeof axRaw === 'string' ? axRaw.trim() : axRaw;
        const remark = it.remark || it.note || it.comment || '';
        tr.innerHTML = `
          <td>${linkOrText(it.title || it.name || pdfHref, pdfUrl)}</td>
          <td>${escapeHtml(it.year)}</td>
          <td>${escapeHtml(it.venue || it.journal || it.conference)}</td>
          <td>${results[idx] || ''}</td>
          <td>${ghUrl ? `<a href="${escapeAttr(ghUrl)}" target="_blank" rel="noopener">GitHub</a>` : ''}</td>
          <td>${arxivUrl ? `<a href="${escapeAttr(arxivUrl)}" target="_blank" rel="noopener">arXiv</a>` : ''}</td>
          <td>${joinTags(it.affiliations || it.orgs || it.companies)}</td>
          <td>${escapeHtml(remark)}</td>
        `;
        frag.appendChild(tr);
      } catch (e) {
        console.error('渲染条目失败', { index: idx, item: it, error: e });
      }
    });
    tbody.appendChild(frag);
  }

  function toFileUrl(href){
    // absolute links remain as-is
    if(/^https?:\/\//i.test(href)) return href;
    const mode = (window.SITE_CONFIG && window.SITE_CONFIG.linkMode) || 'repo';
    if(mode === 'raw'){
      return `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/PDFs/${encodeURIComponent(name)}/${encodeURIComponent(href)}`;
    }
    // default repo (blob) view
    return `https://github.com/${owner}/${repo}/blob/${encodeURIComponent(branch)}/PDFs/${encodeURIComponent(name)}/${encodeURIComponent(href)}`;
  }
  function escapeHtml(v){ if(v===0) return '0'; if(!v && v!==0) return ''; return String(v).replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[s])); }
  function escapeAttr(v){ return escapeHtml(v).replace(/"/g,'&quot;'); }
  function linkOrText(text, href){ if(!href) return escapeHtml(text||''); return `<a href="${href}" target="_blank" rel="noopener">${escapeHtml(text||href)}</a>`; }
  function joinTags(list){
    if(!list) return '';
    const arr = Array.isArray(list) ? list : String(list).split(/[,;、]/).map(s=>s.trim()).filter(Boolean);
    return arr.map(x=>`<span class="tag">${escapeHtml(x)}</span>`).join('');
  }
})();


