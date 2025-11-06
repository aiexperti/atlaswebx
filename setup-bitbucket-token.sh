#!/bin/bash

# Bitbucket API Token Setup Script
# Works with API tokens (no username required) and existing repositories

CONFIG_FILE="git-config.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Bitbucket Token-Based Setup${NC}"
echo ""

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Error: $CONFIG_FILE not found!${NC}"
    echo "Please create the configuration file first:"
    echo "  cp git-config.example.json git-config.json"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  Installing 'jq'...${NC}"
    if command -v brew &> /dev/null; then
        brew install jq
    else
        echo -e "${RED}❌ Error: Please install jq: brew install jq${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}🔧 Reading configuration...${NC}"

# Parse config
GIT_USER_NAME=$(jq -r '.git.user.name' "$CONFIG_FILE")
GIT_USER_EMAIL=$(jq -r '.git.user.email' "$CONFIG_FILE")
DEFAULT_BRANCH=$(jq -r '.git.branch.default' "$CONFIG_FILE")
WORKSPACE=$(jq -r '.bitbucket.workspace' "$CONFIG_FILE")
REPO_SLUG=$(jq -r '.bitbucket.repo_slug' "$CONFIG_FILE")
API_TOKEN=$(jq -r '.bitbucket.api_token' "$CONFIG_FILE")
IS_PRIVATE=$(jq -r '.bitbucket.is_private' "$CONFIG_FILE")
DESCRIPTION=$(jq -r '.bitbucket.description' "$CONFIG_FILE")
USE_EXISTING=$(jq -r '.bitbucket.use_existing_repo' "$CONFIG_FILE")

# Validate
if [ "$GIT_USER_NAME" == "YOUR_NAME" ] || [ "$GIT_USER_NAME" == "null" ]; then
    echo -e "${RED}❌ Error: Update git.user.name in $CONFIG_FILE${NC}"
    exit 1
fi

if [ "$WORKSPACE" == "YOUR_WORKSPACE_NAME" ] || [ "$WORKSPACE" == "null" ]; then
    echo -e "${RED}❌ Error: Update bitbucket.workspace in $CONFIG_FILE${NC}"
    exit 1
fi

if [ "$API_TOKEN" == "YOUR_API_TOKEN" ] || [ "$API_TOKEN" == "null" ]; then
    echo -e "${RED}❌ Error: Update bitbucket.api_token in $CONFIG_FILE${NC}"
    echo "Get token at: https://bitbucket.org/account/settings/app-passwords/"
    exit 1
fi

echo -e "${GREEN}✅ Configuration validated${NC}"
echo ""

# Configure Git
echo -e "${BLUE}👤 Configuring Git...${NC}"
git config user.name "$GIT_USER_NAME"
git config user.email "$GIT_USER_EMAIL"
echo "   Name: $GIT_USER_NAME"
echo "   Email: $GIT_USER_EMAIL"
echo ""

# Repository URL
REPO_URL="https://bitbucket.org/$WORKSPACE/$REPO_SLUG.git"
AUTH_URL="https://x-token-auth:$API_TOKEN@bitbucket.org/$WORKSPACE/$REPO_SLUG.git"

# Check if repo exists
echo -e "${BLUE}🔍 Checking repository...${NC}"
REPO_CHECK=$(curl -s -H "Authorization: Bearer $API_TOKEN" \
    "https://api.bitbucket.org/2.0/repositories/$WORKSPACE/$REPO_SLUG")

REPO_EXISTS=$(echo "$REPO_CHECK" | jq -r '.type' 2>/dev/null)

if [ "$REPO_EXISTS" == "repository" ]; then
    echo -e "${GREEN}✅ Repository exists: $WORKSPACE/$REPO_SLUG${NC}"
elif [ "$USE_EXISTING" == "true" ]; then
    echo -e "${RED}❌ Repository not found but use_existing_repo is true${NC}"
    echo "Please check your workspace and repo_slug"
    exit 1
else
    echo -e "${YELLOW}📦 Creating repository via API...${NC}"
    
    CREATE_RESPONSE=$(curl -s -X POST \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"scm\": \"git\",
            \"is_private\": $IS_PRIVATE,
            \"description\": \"$DESCRIPTION\"
        }" \
        "https://api.bitbucket.org/2.0/repositories/$WORKSPACE/$REPO_SLUG")
    
    CREATED_TYPE=$(echo "$CREATE_RESPONSE" | jq -r '.type' 2>/dev/null)
    
    if [ "$CREATED_TYPE" == "repository" ]; then
        echo -e "${GREEN}✅ Repository created!${NC}"
    else
        ERROR_MSG=$(echo "$CREATE_RESPONSE" | jq -r '.error.message' 2>/dev/null)
        echo -e "${RED}❌ Failed to create repository${NC}"
        echo "Error: $ERROR_MSG"
        exit 1
    fi
fi

echo ""

# Setup remote
if git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}⚠️  Updating remote 'origin'...${NC}"
    git remote set-url origin "$AUTH_URL"
else
    echo -e "${BLUE}🔗 Adding remote...${NC}"
    git remote add origin "$AUTH_URL"
fi
echo "   Workspace: $WORKSPACE"
echo "   Repository: $REPO_SLUG"
echo ""

# Set branch
echo -e "${BLUE}🌿 Setting branch to '$DEFAULT_BRANCH'...${NC}"
git branch -M "$DEFAULT_BRANCH"
echo ""

# Push
echo -e "${BLUE}📤 Ready to push!${NC}"
echo ""
read -p "Push to Bitbucket now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🚀 Pushing to Bitbucket...${NC}"
    
    if git push -u origin "$DEFAULT_BRANCH" 2>&1; then
        echo ""
        echo -e "${GREEN}✅ Successfully pushed!${NC}"
        echo -e "${GREEN}🌐 Repository URL:${NC}"
        echo "   $REPO_URL"
        echo ""
        
        # Clean URL (remove token)
        git remote set-url origin "$REPO_URL"
        echo -e "${BLUE}🔒 Token removed from git config${NC}"
    else
        echo ""
        echo -e "${RED}❌ Push failed${NC}"
        echo ""
        echo "Troubleshooting:"
        echo "1. Check token permissions (needs Repository: Write)"
        echo "2. Verify workspace and repo names"
        echo "3. Check if branch already exists"
    fi
else
    echo -e "${YELLOW}⏭️  Skipped. Push later with: git push -u origin $DEFAULT_BRANCH${NC}"
fi

echo ""
echo -e "${GREEN}✨ Setup complete!${NC}"
