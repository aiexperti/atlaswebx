#!/bin/bash

# Fix code signing issue

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔧 Fixing Code Signing Issue${NC}"
echo ""

echo -e "${BLUE}Changes:${NC}"
echo "  ✅ Set CSC_IDENTITY_AUTO_DISCOVERY=false"
echo "  ✅ Removed sign: false (causes issues)"
echo "  ✅ Added cross-env for environment variables"
echo "  ✅ Updated signing configuration"
echo "  ✅ Removed macOS and Linux builds (Windows only)"
echo "  ✅ Simplified CircleCI workflow"
echo ""

git status --short

echo ""
read -p "Commit and push this fix? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}📝 Committing...${NC}"
    
    git add package.json .circleci/config.yml
    
    git commit -m "Fix code signing error and simplify to Windows-only builds

- Add CSC_IDENTITY_AUTO_DISCOVERY=false environment variable
- Remove problematic sign:false configuration
- Add cross-env for cross-platform compatibility
- Update signing configuration to prevent auto-discovery
- Remove macOS and Linux build configurations (Windows only)
- Simplify CircleCI workflow to build-windows-only
- This fixes: Cannot use 'in' operator to search for 'file' in undefined"
    
    echo ""
    echo -e "${BLUE}🚀 Pushing...${NC}"
    git push
    
    echo ""
    echo -e "${GREEN}✅ Done!${NC}"
    echo ""
    echo "Monitor build at:"
    echo -e "${YELLOW}https://app.circleci.com/pipelines/bitbucket/lenoir-openai/atlas2${NC}"
else
    echo ""
    echo -e "${YELLOW}Cancelled${NC}"
fi
