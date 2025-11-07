#!/bin/bash

# Quick script to upload fixed backend files

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Uploading Fixed Backend Files${NC}"
echo ""

# Ask for server details
read -p "Server hostname (e.g., atlaswebx.com): " SERVER_HOST
read -p "SSH username: " SSH_USER
read -p "Remote path (e.g., /var/www/html/backend): " REMOTE_PATH

echo ""
echo -e "${BLUE}📤 Uploading files to $SSH_USER@$SERVER_HOST:$REMOTE_PATH${NC}"
echo ""

# Upload fixed files
echo "Uploading api-proxy.php..."
scp api-proxy.php "$SSH_USER@$SERVER_HOST:$REMOTE_PATH/"

echo "Uploading api-proxy-v2.php..."
scp api-proxy-v2.php "$SSH_USER@$SERVER_HOST:$REMOTE_PATH/"

echo "Uploading test-server.php..."
scp test-server.php "$SSH_USER@$SERVER_HOST:$REMOTE_PATH/"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Files uploaded successfully!${NC}"
    echo ""
    echo -e "${BLUE}🧪 Test your backend:${NC}"
    echo ""
    echo "1. Diagnostic tool:"
    echo "   https://$SERVER_HOST${REMOTE_PATH#/var/www/html}/test-server.php"
    echo ""
    echo "2. From terminal:"
    echo "   ./test-backend.sh"
    echo ""
    echo "3. In your app:"
    echo "   npm start"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Upload failed${NC}"
    echo "Check your SSH credentials and try again."
fi
