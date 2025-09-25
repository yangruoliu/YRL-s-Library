# YRL-s-Library
远程托管最近读的论文：）
最好是能监督我好好读论文！！

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