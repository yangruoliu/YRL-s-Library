#!/usr/bin/env bash
set -euo pipefail

# Move to the repo root (script directory)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

REMOTE="origin"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ -z "$BRANCH" || "$BRANCH" == "HEAD" ]]; then
  echo "当前处于分离的 HEAD 状态，请先检出一个分支后再同步。" >&2
  exit 1
fi

MSG=${1:-}
if [[ -z "${MSG}" ]]; then
  MSG="sync: $(date '+%Y-%m-%d %H:%M')"
fi

info()  { printf '\033[36m%s\033[0m\n' "$*"; }
warn()  { printf '\033[33m%s\033[0m\n' "$*"; }
error() { printf '\033[31m%s\033[0m\n' "$*"; }

info "当前分支: $BRANCH"

# Stage changes
git add -A

# Commit if there are changes
if [[ -n "$(git status --porcelain)" ]]; then
  info "提交更改..."
  git commit -m "$MSG" >/dev/null
else
  warn "没有需要提交的本地更改。"
fi

# Pull with rebase
info "从远程拉取并 rebase ($REMOTE/$BRANCH)..."
if ! git pull --rebase "$REMOTE" "$BRANCH"; then
  error "拉取时发生冲突或错误。请解决冲突后再次运行。若要放弃 rebase，请执行 'git rebase --abort'。"
  exit 1
fi

# Push
info "推送到 $REMOTE/$BRANCH..."
if ! git push "$REMOTE" "$BRANCH"; then
  error "推送失败。请检查远程权限或网络后重试。"
  exit 1
fi

printf '\033[32m%s\033[0m\n' "同步完成 ✅"
