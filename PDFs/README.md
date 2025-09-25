为每个子文件夹添加一个 `meta.json`，用于在 GitHub Pages 中渲染表格。

示例结构：

```
PDFs/
  LLM/
    meta.json
    some-paper.pdf
  Vision/
    meta.json
    xxxxx.pdf
```

meta.json 示例：

```
[
  {
    "title": "Attention Is All You Need",
    "filename": "attention.pdf",         
    "year": 2017,
    "venue": "NeurIPS",
    "affiliations": ["Google"],
    "github_repo": "https://github.com/tensorflow/tensor2tensor",
    "arxiv": "https://arxiv.org/abs/1706.03762"
  }
]
```

字段说明：

- `title`：论文题名
- `filename` 或 `pdf`：同目录下 PDF 文件名或绝对链接
- `year`：年份
- `venue`：期刊/会议（也支持 `journal`/`conference` 字段）
- `affiliations`：单位/公司数组（也支持 `orgs`/`companies` 字段）
- `github_repo`：对应的 GitHub 仓库地址（用于获取 star 数）
- `arxiv`：对应的 arXiv 页面链接（如 `https://arxiv.org/abs/1706.03762`）
- `remark`：备注文字（也支持同义字段 `note`/`comment`）
- `data`：数据集链接（同义字段 `data_url`/`dataset`/`dataset_url`）。若你把非 GitHub 链接误填在 `github_repo` 中，页面也会将其作为“数据”链接展示。
 


