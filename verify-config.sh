#!/bin/bash

# Configuration Verification Script

CONFIG_FILE="git-config-atlas.json"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Verifying Configuration${NC}"
echo ""

if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ $CONFIG_FILE not found${NC}"
    exit 1
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq not installed. Installing...${NC}"
    brew install jq
fi

echo -e "${BLUE}Configuration Details:${NC}"
echo ""

# Extract values
NAME=$(jq -r '.git.user.name' "$CONFIG_FILE")
EMAIL=$(jq -r '.git.user.email' "$CONFIG_FILE")
BRANCH=$(jq -r '.git.branch.default' "$CONFIG_FILE")
WORKSPACE=$(jq -r '.bitbucket.workspace' "$CONFIG_FILE")
REPO=$(jq -r '.bitbucket.repo_slug' "$CONFIG_FILE")
TOKEN=$(jq -r '.bitbucket.api_token' "$CONFIG_FILE")
PRIVATE=$(jq -r '.bitbucket.is_private' "$CONFIG_FILE")
USE_EXISTING=$(jq -r '.bitbucket.use_existing_repo' "$CONFIG_FILE")

# Display
echo "Git User:"
echo "  Name: $NAME"
echo "  Email: $EMAIL"
echo ""
echo "Repository:"
echo "  Workspace: $WORKSPACE"
echo "  Repository: $REPO"
echo "  Branch: $BRANCH"
echo "  URL: https://bitbucket.org/$WORKSPACE/$REPO"
echo ""
echo "Settings:"
echo "  Private: $PRIVATE"
echo "  Use Existing: $USE_EXISTING"
echo ""

# Validate
ERRORS=0

if [ "$NAME" == "YOUR_NAME" ] || [ "$NAME" == "null" ]; then
    echo -e "${RED}❌ Name not set${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Name configured${NC}"
fi

if [ "$EMAIL" == "YOUR_EMAIL@example.com" ] || [ "$EMAIL" == "null" ]; then
    echo -e "${RED}❌ Email not set${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Email configured${NC}"
fi

if [ "$TOKEN" == "PASTE_YOUR_API_TOKEN_HERE" ] || [ "$TOKEN" == "null" ]; then
    echo -e "${RED}❌ API token not set${NC}"
    ERRORS=$((ERRORS + 1))
else
    # Check token format
    if [[ $TOKEN == ATATT* ]]; then
        echo -e "${GREEN}✅ API token configured (format looks correct)${NC}"
    else
        echo -e "${YELLOW}⚠️  API token set but format unexpected${NC}"
    fi
fi

if [ "$WORKSPACE" == "lenoir-openai" ]; then
    echo -e "${GREEN}✅ Workspace configured${NC}"
else
    echo -e "${YELLOW}⚠️  Workspace: $WORKSPACE${NC}"
fi

if [ "$REPO" == "atlas" ]; then
    echo -e "${GREEN}✅ Repository configured${NC}"
else
    echo -e "${YELLOW}⚠️  Repository: $REPO${NC}"
fi

echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Configuration is valid!${NC}"
    echo ""
    echo "Ready to run:"
    echo -e "${BLUE}  cp git-config-atlas.json git-config.json${NC}"
    echo -e "${BLUE}  ./setup-bitbucket-token.sh${NC}"
else
    echo -e "${RED}❌ Please fix $ERRORS error(s) in $CONFIG_FILE${NC}"
fi
