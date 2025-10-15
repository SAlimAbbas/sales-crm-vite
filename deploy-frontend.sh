#!/bin/bash

# Load configuration
if [ -f "deploy-config.sh" ]; then
    source deploy-config.sh
else
    echo "❌ deploy-config.sh not found!"
    echo "Create it with your SSH details:"
    echo ""
    echo "SSH_USER=\"u597814446\""
    echo "SSH_HOST=\"193.203.186.174\""
    echo "SSH_PORT=\"65002\""
    echo "REMOTE_PATH=\"domains/exportersworldscrm.site/public_html\""
    exit 1
fi

echo "🚀 Deploying exportersworldscrm.site Frontend..."

# Build production version
echo "🔨 Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "📦 Build completed successfully!"

# Create temporary directory
echo "📋 Preparing deployment package..."
rm -rf dist-deploy
mkdir -p dist-deploy
cp -r dist/* dist-deploy/

# Deploy to server
echo "📤 Uploading to server..."
echo "Target: ${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}"

rsync -avz --delete -e "ssh -p ${SSH_PORT}" \
    --exclude='.htaccess' \
    --exclude='index.php' \
    --exclude='robots.txt' \
    --exclude='storage' \
    dist-deploy/ ${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}/

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    rm -rf dist-deploy
    exit 1
fi

# Rename index.html to app.html on server
echo "🔄 Renaming index.html to app.html..."
ssh -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} "cd ${REMOTE_PATH} && if [ -f index.html ]; then mv index.html app.html; fi"

# Cleanup
rm -rf dist-deploy

echo "✅ Frontend deployed successfully!"
echo "🌐 Visit: https://exportersworldscrm.site"