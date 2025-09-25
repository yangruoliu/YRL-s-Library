param(
    [string]$Message,
    [string]$Remote = "origin"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-Info([string]$text) {
    Write-Host $text -ForegroundColor Cyan
}

function Write-Warn([string]$text) {
    Write-Host $text -ForegroundColor Yellow
}

try {
    # Move to the repo root (script directory)
    if ($PSScriptRoot) {
        Set-Location -Path $PSScriptRoot
    }

    # Ensure git is available
    git --version | Out-Null

    # Determine current branch
    $branch = (git rev-parse --abbrev-ref HEAD).Trim()
    if ([string]::IsNullOrWhiteSpace($branch) -or $branch -eq "HEAD") {
        throw "当前处于分离的 HEAD 状态，请先检出一个分支后再同步。"
    }

    Write-Info "当前分支: $branch"

    # Stage all changes
    git add -A

    # Commit if there are changes
    $status = git status --porcelain
    if (-not [string]::IsNullOrWhiteSpace($status)) {
        if (-not $Message) {
            $Message = "sync: " + (Get-Date).ToString("yyyy-MM-dd HH:mm")
        }
        Write-Info "提交更改..."
        git commit -m "$Message" | Out-Null
    } else {
        Write-Warn "没有需要提交的本地更改。"
    }

    # Pull latest with rebase
    Write-Info "从远程拉取并 rebase ($Remote/$branch)..."
    $pullOutput = & git pull --rebase $Remote $branch 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Warn $pullOutput
        throw "拉取时发生冲突或错误。请解决冲突后再次运行。若要放弃 rebase，请执行 'git rebase --abort'。"
    }

    # Push to remote
    Write-Info "推送到 $Remote/$branch..."
    $pushOutput = & git push $Remote $branch 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Warn $pushOutput
        throw "推送失败。请检查远程权限或网络后重试。"
    }

    Write-Host "同步完成 ✅" -ForegroundColor Green
    exit 0
}
catch {
    Write-Error $_.Exception.Message
    exit 1
}


