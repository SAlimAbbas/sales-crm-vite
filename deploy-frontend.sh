#!/bin/bash

# Load configuration
if [ -f "deploy-config.sh" ]; then
    source deploy-config.sh
else
    echo "❌ deploy-config.sh not found!"
    exit 1
fi

echo "🚀 Deploying exportersworldscrm.site Frontend (using SCP)..."

# Build production version
echo "🔨 Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "📦 Build completed successfully!"

# Create deployment archive
echo "📋 Creating deployment archive..."
cd dist
tar -czf ../frontend-deploy.tar.gz .
cd ..

if [ ! -f "frontend-deploy.tar.gz" ]; then
    echo "❌ Failed to create archive!"
    exit 1
fi

echo "📤 Uploading to server (this may take a minute)..."
echo "Target: ${SSH_USER}@${SSH_HOST}"

# Upload archive
scp -P ${SSH_PORT} frontend-deploy.tar.gz ${SSH_USER}@${SSH_HOST}:~/frontend-deploy.tar.gz

if [ $? -ne 0 ]; then
    echo "❌ Upload failed!"
    rm -f frontend-deploy.tar.gz
    exit 1
fi

echo "📦 Extracting files on server..."

# Extract on server
ssh -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} << 'ENDSSH'
# Navigate to public_html
cd domains/exportersworldscrm.site/public_html

# Backup Laravel files
echo "Backing up Laravel files..."
cp .htaccess .htaccess.backup 2>/dev/null || true
cp index.php index.php.backup 2>/dev/null || true
cp robots.txt robots.txt.backup 2>/dev/null || true
cp favicon.ico favicon.ico.backup 2>/dev/null || true

# Remove old React files only
echo "Removing old React files..."
rm -rf assets/ 2>/dev/null || true
rm -f app.html 2>/dev/null || true
rm -f vite.svg 2>/dev/null || true
rm -f index.html 2>/dev/null || true

# Extract new files
echo "Extracting new React build..."
tar -xzf ~/frontend-deploy.tar.gz

# Rename index.html to app.html
if [ -f index.html ]; then
    echo "Renaming index.html to app.html..."
    mv index.html app.html
fi

# Restore Laravel files if they were overwritten
if [ -f .htaccess.backup ]; then
    cp .htaccess.backup .htaccess
    rm -f .htaccess.backup
fi
if [ -f index.php.backup ]; then
    cp index.php.backup index.php
    rm -f index.php.backup
fi
if [ -f robots.txt.backup ]; then
    cp robots.txt.backup robots.txt
    rm -f robots.txt.backup
fi
if [ -f favicon.ico.backup ]; then
    cp favicon.ico.backup favicon.ico
    rm -f favicon.ico.backup
fi

# Cleanup
rm -f ~/frontend-deploy.tar.gz

echo "✅ Files extracted successfully!"
ENDSSH

if [ $? -ne 0 ]; then
    echo "❌ Server operations failed!"
    rm -f frontend-deploy.tar.gz
    exit 1
fi

# Cleanup local archive
rm -f frontend-deploy.tar.gz

echo ""
echo "✅ Frontend deployed successfully!"
echo "🌐 Visit: https://exportersworldscrm.site"