#!/bin/bash

# Deployment script for backend API proxy
# This helps you upload the backend to your server

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Backend Deployment Helper${NC}"
echo ""

# Check if config.php exists
if [ ! -f "config.php" ]; then
    echo -e "${YELLOW}⚠️  config.php not found${NC}"
    echo ""
    echo "Creating config.php from example..."
    cp config.example.php config.php
    echo ""
    echo -e "${YELLOW}📝 Please edit config.php and add your OpenAI API key:${NC}"
    echo ""
    echo "  nano config.php"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo -e "${GREEN}✅ config.php found${NC}"
echo ""

# Ask for server details
echo -e "${BLUE}Server Details:${NC}"
echo ""
read -p "Server hostname (e.g., yourserver.com): " SERVER_HOST
read -p "SSH username: " SSH_USER
read -p "Remote path (e.g., /var/www/html/backend): " REMOTE_PATH

echo ""
echo -e "${BLUE}Deployment Summary:${NC}"
echo "  Server: $SSH_USER@$SERVER_HOST"
echo "  Path: $REMOTE_PATH"
echo ""

read -p "Continue with deployment? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}📦 Creating deployment package...${NC}"

# Create temp directory
TEMP_DIR=$(mktemp -d)
cp api-proxy.php "$TEMP_DIR/"
cp config.php "$TEMP_DIR/"
cp .htaccess "$TEMP_DIR/"
cp README.md "$TEMP_DIR/"

echo -e "${GREEN}✅ Package created${NC}"
echo ""

# Upload via SCP
echo -e "${BLUE}📤 Uploading to server...${NC}"

# Create remote directory if it doesn't exist
ssh "$SSH_USER@$SERVER_HOST" "mkdir -p $REMOTE_PATH"

# Upload files
scp -r "$TEMP_DIR"/* "$SSH_USER@$SERVER_HOST:$REMOTE_PATH/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files uploaded successfully${NC}"
else
    echo -e "${RED}❌ Upload failed${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Setting permissions...${NC}"

# Set permissions on server
ssh "$SSH_USER@$SERVER_HOST" << EOF
cd $REMOTE_PATH
chmod 755 .
chmod 644 api-proxy.php
chmod 600 config.php
chmod 644 .htaccess
chmod 644 README.md
mkdir -p rate_limit
chmod 755 rate_limit
touch error.log usage.log
chmod 644 error.log usage.log
EOF

echo -e "${GREEN}✅ Permissions set${NC}"
echo ""

# Clean up
rm -rf "$TEMP_DIR"

# Test endpoint
echo -e "${BLUE}🧪 Testing endpoint...${NC}"
echo ""

# Construct URL
if [[ $REMOTE_PATH == /var/www/html/* ]]; then
    # Extract path after /var/www/html/
    URL_PATH=${REMOTE_PATH#/var/www/html/}
    TEST_URL="https://$SERVER_HOST/$URL_PATH/api-proxy.php"
else
    echo "Please test manually at your backend URL"
    TEST_URL=""
fi

if [ ! -z "$TEST_URL" ]; then
    echo "Testing: $TEST_URL"
    echo ""
    
    RESPONSE=$(curl -s -X POST "$TEST_URL" \
        -H "Content-Type: application/json" \
        -d '{"model":"gpt-4","messages":[{"role":"user","content":"Hi"}]}' \
        -w "\nHTTP_CODE:%{http_code}")
    
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
    
    if [ "$HTTP_CODE" == "200" ]; then
        echo -e "${GREEN}✅ Backend is working!${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend returned HTTP $HTTP_CODE${NC}"
        echo "Response: $RESPONSE"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Test your backend:"
echo "   curl -X POST $TEST_URL \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"model\":\"gpt-4\",\"messages\":[{\"role\":\"user\",\"content\":\"Test\"}]}'"
echo ""
echo "2. Update your Electron app to use:"
echo "   $TEST_URL"
echo ""
echo "3. See update-electron-app.md for code examples"
echo ""
echo -e "${YELLOW}📝 Remember to:${NC}"
echo "  - Enable HTTPS on your server"
echo "  - Restrict CORS in production"
echo "  - Monitor usage.log and error.log"
echo ""
