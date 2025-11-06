#!/bin/bash

# Bitbucket API Setup Script
# This script uses Bitbucket REST API 2.0 to create and configure repositories

CONFIG_FILE="git-config.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Bitbucket API Setup Script${NC}"
echo ""

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Error: $CONFIG_FILE not found!${NC}"
    echo "Please create the configuration file first:"
    echo "  cp git-config.example.json git-config.json"
    echo "  # Then edit git-config.json with your credentials"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  Installing 'jq' for JSON parsing...${NC}"
    if command -v brew &> /dev/null; then
        brew install jq
    else
        echo -e "${RED}❌ Error: Homebrew not found. Please install jq manually:${NC}"
        echo "   brew install jq"
        exit 1
    fi
fi

echo -e "${BLUE}🔧 Reading configuration...${NC}"

# Parse JSON config
GIT_USER_NAME=$(jq -r '.git.user.name' "$CONFIG_FILE")
GIT_USER_EMAIL=$(jq -r '.git.user.email' "$CONFIG_FILE")
DEFAULT_BRANCH=$(jq -r '.git.branch.default' "$CONFIG_FILE")
WORKSPACE=$(jq -r '.bitbucket.workspace' "$CONFIG_FILE")
REPO_SLUG=$(jq -r '.bitbucket.repo_slug' "$CONFIG_FILE")
USERNAME=$(jq -r '.bitbucket.username' "$CONFIG_FILE")
APP_PASSWORD=$(jq -r '.bitbucket.app_password' "$CONFIG_FILE")
IS_PRIVATE=$(jq -r '.bitbucket.is_private' "$CONFIG_FILE")
DESCRIPTION=$(jq -r '.bitbucket.description' "$CONFIG_FILE")

# Validate configuration
if [ "$GIT_USER_NAME" == "YOUR_NAME" ] || [ "$GIT_USER_NAME" == "null" ]; then
    echo -e "${RED}❌ Error: Please update git.user.name in $CONFIG_FILE${NC}"
    exit 1
fi

if [ "$WORKSPACE" == "YOUR_WORKSPACE_NAME" ] || [ "$WORKSPACE" == "null" ]; then
    echo -e "${RED}❌ Error: Please update bitbucket.workspace in $CONFIG_FILE${NC}"
    echo "Your workspace is usually your username or team name"
    exit 1
fi

if [ "$APP_PASSWORD" == "YOUR_APP_PASSWORD" ] || [ "$APP_PASSWORD" == "null" ]; then
    echo -e "${RED}❌ Error: Please update bitbucket.app_password in $CONFIG_FILE${NC}"
    echo "Create one at: https://bitbucket.org/account/settings/app-passwords/"
    exit 1
fi

echo -e "${GREEN}✅ Configuration validated${NC}"
echo ""

# Configure Git user
echo -e "${BLUE}👤 Configuring Git user...${NC}"
git config user.name "$GIT_USER_NAME"
git config user.email "$GIT_USER_EMAIL"
echo "   Name: $GIT_USER_NAME"
echo "   Email: $GIT_USER_EMAIL"
echo ""

# Check if repository exists via API
echo -e "${BLUE}🔍 Checking if repository exists...${NC}"
REPO_CHECK=$(curl -s -u "$USERNAME:$APP_PASSWORD" \
    "https://api.bitbucket.org/2.0/repositories/$WORKSPACE/$REPO_SLUG")

REPO_EXISTS=$(echo "$REPO_CHECK" | jq -r '.type' 2>/dev/null)

if [ "$REPO_EXISTS" == "repository" ]; then
    echo -e "${GREEN}✅ Repository already exists${NC}"
    REPO_URL="https://bitbucket.org/$WORKSPACE/$REPO_SLUG.git"
else
    echo -e "${YELLOW}📦 Creating new repository via Bitbucket API...${NC}"
    
    # Create repository using Bitbucket API 2.0
    CREATE_RESPONSE=$(curl -s -u "$USERNAME:$APP_PASSWORD" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"scm\": \"git\",
            \"is_private\": $IS_PRIVATE,
            \"description\": \"$DESCRIPTION\",
            \"project\": {
                \"key\": \"LENOIR\"
            }
        }" \
        "https://api.bitbucket.org/2.0/repositories/$WORKSPACE/$REPO_SLUG")
    
    # Check if creation was successful
    CREATED_TYPE=$(echo "$CREATE_RESPONSE" | jq -r '.type' 2>/dev/null)
    
    if [ "$CREATED_TYPE" == "repository" ]; then
        echo -e "${GREEN}✅ Repository created successfully!${NC}"
        REPO_URL=$(echo "$CREATE_RESPONSE" | jq -r '.links.clone[] | select(.name=="https") | .href')
        echo "   URL: $REPO_URL"
    else
        ERROR_MSG=$(echo "$CREATE_RESPONSE" | jq -r '.error.message' 2>/dev/null)
        echo -e "${RED}❌ Failed to create repository${NC}"
        echo "Error: $ERROR_MSG"
        echo ""
        echo "Response: $CREATE_RESPONSE"
        exit 1
    fi
fi

echo ""

# Set up remote
REMOTE_URL="https://$USERNAME:$APP_PASSWORD@bitbucket.org/$WORKSPACE/$REPO_SLUG.git"

if git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}⚠️  Remote 'origin' already exists. Updating URL...${NC}"
    git remote set-url origin "$REMOTE_URL"
else
    echo -e "${BLUE}🔗 Adding remote repository...${NC}"
    git remote add origin "$REMOTE_URL"
fi
echo "   Remote: origin"
echo "   Workspace: $WORKSPACE"
echo "   Repository: $REPO_SLUG"
echo ""

# Set default branch
echo -e "${BLUE}🌿 Setting default branch to '$DEFAULT_BRANCH'...${NC}"
git branch -M "$DEFAULT_BRANCH"
echo ""

# Push to Bitbucket
echo -e "${BLUE}📤 Ready to push to Bitbucket!${NC}"
echo ""
read -p "Do you want to push now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🚀 Pushing to Bitbucket...${NC}"
    
    if git push -u origin "$DEFAULT_BRANCH" 2>&1; then
        echo ""
        echo -e "${GREEN}✅ Successfully pushed to Bitbucket!${NC}"
        echo -e "${GREEN}🌐 View your repository at:${NC}"
        echo "   https://bitbucket.org/$WORKSPACE/$REPO_SLUG"
        echo ""
        
        # Update remote URL to remove password from git config
        CLEAN_URL="https://bitbucket.org/$WORKSPACE/$REPO_SLUG.git"
        git remote set-url origin "$CLEAN_URL"
        echo -e "${BLUE}🔒 Remote URL cleaned (password removed from git config)${NC}"
    else
        echo ""
        echo -e "${RED}❌ Push failed${NC}"
        echo ""
        echo "Troubleshooting:"
        echo "1. Check your app password permissions (needs Repository: Write)"
        echo "2. Verify your workspace name is correct"
        echo "3. Try creating the repository manually first"
    fi
else
    echo -e "${YELLOW}⏭️  Skipped push. You can push manually later with:${NC}"
    echo "   git push -u origin $DEFAULT_BRANCH"
fi

echo ""
echo -e "${GREEN}✨ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  • Configure branch permissions in Bitbucket"
echo "  • Add collaborators if needed"
echo "  • Set up CI/CD pipelines (optional)"
