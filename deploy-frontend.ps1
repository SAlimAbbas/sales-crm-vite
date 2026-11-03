# Deploy frontend script for Windows PowerShell
$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying exportersworldsportal.site Frontend..." -ForegroundColor Cyan

# 1. Build
Write-Host "🔨 Building production bundle..." -ForegroundColor Yellow
npm.cmd run build

# 2. Archive
Write-Host "📋 Creating deployment archive..." -ForegroundColor Yellow
Set-Location -Path "dist"
tar -czf ../frontend-deploy.tar.gz *
Set-Location -Path ".."

# 3. Upload
Write-Host "📤 Uploading archive to server..." -ForegroundColor Yellow
scp -P 65002 frontend-deploy.tar.gz u597814446@193.203.186.174:~/frontend-deploy.tar.gz

# 4. Extract on server
Write-Host "📦 Extracting files on server..." -ForegroundColor Yellow
ssh -p 65002 u597814446@193.203.186.174 "cd domains/exportersworldsportal.site/public_html && cp .htaccess .htaccess.backup 2>/dev/null || true && cp index.php index.php.backup 2>/dev/null || true && rm -rf assets/ 2>/dev/null || true && rm -f app.html vite.svg index.html 2>/dev/null || true && tar -xzf ~/frontend-deploy.tar.gz && if [ -f index.html ]; then mv index.html app.html; fi && if [ -f .htaccess.backup ]; then cp .htaccess.backup .htaccess && rm -f .htaccess.backup; fi && if [ -f index.php.backup ]; then cp index.php.backup index.php && rm -f index.php.backup; fi && rm -f ~/frontend-deploy.tar.gz"

# 5. Cleanup
Remove-Item -Path "frontend-deploy.tar.gz" -ErrorAction SilentlyContinue

Write-Host "✅ Frontend deployed successfully to https://exportersworldsportal.site!" -ForegroundColor Green
