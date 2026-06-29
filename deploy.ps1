param([string]$msg = "Update site")

Set-Location $PSScriptRoot

git add -A
git commit -m $msg
git push origin main
git push gitlab main

Write-Host "`n✅ Задеплоено! Vercel обновится через ~1 минуту." -ForegroundColor Green
