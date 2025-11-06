#!/bin/bash

# Interactive Configuration Script for Bitbucket Setup

CONFIG_FILE="git-config.json"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔧 Bitbucket Configuration Setup${NC}"
echo ""
echo "This script will help you configure your Bitbucket credentials."
echo ""

# Get user information
echo -e "${BLUE}Git User Information:${NC}"
read -p "Enter your full name: " GIT_NAME
read -p "Enter your email: " GIT_EMAIL
echo ""

# Get Bitbucket information
echo -e "${BLUE}Bitbucket Information:${NC}"
read -p "Enter your Bitbucket username: " BB_USERNAME
read -p "Enter your Bitbucket workspace (usually same as username): " BB_WORKSPACE
read -p "Enter repository name [lenoir-ai-browser]: " REPO_SLUG
REPO_SLUG=${REPO_SLUG:-lenoir-ai-browser}
echo ""

# Get App Password
echo -e "${BLUE}Bitbucket App Password:${NC}"
echo "Paste your App Password (it will be hidden):"
read -s APP_PASSWORD
echo ""
echo ""

# Privacy setting
echo -e "${BLUE}Repository Privacy:${NC}"
read -p "Make repository private? (y/n) [y]: " IS_PRIVATE_INPUT
IS_PRIVATE_INPUT=${IS_PRIVATE_INPUT:-y}
if [[ $IS_PRIVATE_INPUT =~ ^[Yy]$ ]]; then
    IS_PRIVATE="true"
else
    IS_PRIVATE="false"
fi
echo ""

# Description
read -p "Repository description [Lenoir AI Browser - AI-powered browser with glassmorphism UI]: " DESCRIPTION
DESCRIPTION=${DESCRIPTION:-Lenoir AI Browser - AI-powered browser with glassmorphism UI}
echo ""

# Create the config file
echo -e "${BLUE}📝 Creating configuration file...${NC}"

cat > "$CONFIG_FILE" << EOF
{
  "git": {
    "user": {
      "name": "$GIT_NAME",
      "email": "$GIT_EMAIL"
    },
    "branch": {
      "default": "main"
    }
  },
  "bitbucket": {
    "workspace": "$BB_WORKSPACE",
    "repo_slug": "$REPO_SLUG",
    "username": "$BB_USERNAME",
    "app_password": "$APP_PASSWORD",
    "is_private": $IS_PRIVATE,
    "description": "$DESCRIPTION"
  }
}
EOF

echo -e "${GREEN}✅ Configuration saved to $CONFIG_FILE${NC}"
echo ""
echo "Summary:"
echo "  Name: $GIT_NAME"
echo "  Email: $GIT_EMAIL"
echo "  Workspace: $BB_WORKSPACE"
echo "  Repository: $REPO_SLUG"
echo "  Private: $IS_PRIVATE"
echo ""
echo -e "${GREEN}Ready to proceed!${NC}"
echo ""
read -p "Run setup now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}🚀 Running Bitbucket setup...${NC}"
    echo ""
    ./setup-bitbucket.sh
else
    echo ""
    echo "You can run the setup later with:"
    echo "  ./setup-bitbucket.sh"
fi
