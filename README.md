# YRL-s-Library
远程托管最近读的论文：）
最好是能监督我好好读论文！！
在线预览：https://yangruoliu.github.io/YRL-s-Library/

> 在线预览（GitHub Pages）：[https://yangruoliu.github.io/YRL-s-Library/](https://yangruoliu.github.io/YRL-s-Library/)
> 需要在仓库 Settings → Pages 启用：Source 选 Deploy from a branch，Branch 选 main，Folder 选 /docs。

## 一键同步到远程

已添加以下脚本，便于将本地改动一键推送到远程：

- `sync.ps1`: PowerShell 脚本（自动 add/commit/pull --rebase/push）
- `sync.bat`: Windows 批处理封装（双击即可运行 `sync.ps1`）

### 快速使用

- 方式一（推荐）：在资源管理器中双击 `sync.bat`。
- 方式二（PowerShell）：

```powershell
./sync.ps1 -Message "更新笔记"
```

不传 `-Message` 时，会使用当前时间生成默认提交信息，例如：

```powershell
./sync.ps1
```

脚本行为：

1. `git add -A`
2. 若有变更：`git commit -m <Message>`（无变更则跳过）
3. `git pull --rebase origin <当前分支>`
4. `git push origin <当前分支>`

若 `pull --rebase` 出现冲突：

```bash
git status
# 解决冲突后
git add <已解决的文件>
git rebase --continue
# 如需放弃本次 rebase
git rebase --abort
```

完成后再次运行 `sync.bat` 或 `./sync.ps1`。

提示：本仓库是从 `origin` 克隆而来（`git remote -v` 可查看），默认具备推送权限即可正常使用。

## GitHub Pages 展示 PDFs 目录与清单

已在 `docs/` 目录下添加静态站点：

- `docs/index.html`：自动列出 `PDFs/` 下的子文件夹。
- `docs/folder.html`：根据子文件夹内的 `meta.json` 渲染论文清单表格。
- `docs/assets/*.js|*.css`：样式与脚本。

数据放置方式：

- 在仓库根目录创建 `PDFs/` 目录。
- 每个子文件夹（例如 `PDFs/LLM/`）内，放置 `meta.json` 与实际 PDF 文件。
- `meta.json` 为一个数组，条目示例见 `PDFs/sample/meta.json`，字段包括：
  - `title`：论文题名
  - `filename` 或 `pdf`：同目录下 PDF 文件名或绝对链接
  - `year`：年份
  - `venue`（或 `journal`/`conference`）：期刊或会议
  - `authors`：作者数组
  - `affiliations`（或 `orgs`/`companies`）：单位/公司数组
  - `github_repo`：对应 GitHub 仓库地址（用于获取 Star 数）

启用 GitHub Pages：

1. 打开仓库 Settings → Pages。
2. Source 选择 `Deploy from a branch`。
3. Branch 选择 `main`，目录选择 `/docs`，保存。
4. 稍等片刻，访问仓库 Pages 地址（通常为 `https://<用户名>.github.io/YRL-s-Library/`）。

注意：页面脚本默认使用配置 `owner=yangruoliu`、`repo=YRL-s-Library`、`branch=main` 读取内容；如改名或使用 Fork，可编辑 `docs/index.html` 与 `docs/folder.html` 顶部的 `window.SITE_CONFIG`。