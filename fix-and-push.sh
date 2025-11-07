#!/bin/bash

# Quick script to commit and push CircleCI fixes

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔧 Committing CircleCI Fixes${NC}"
echo ""

echo -e "${BLUE}Changes to commit:${NC}"
echo "  ✅ Updated Node.js to v20.11.0"
echo "  ✅ Added npm cache clear"
echo "  ✅ Added --legacy-peer-deps flag"
echo "  ✅ Updated electron-builder to 24.13.3"
echo "  ✅ Disabled code signing (no certificate needed)"
echo "  ✅ Added icon.png (1024x1024)"
echo "  ✅ Fixed NSIS installer generation"
echo ""

# Show what will be committed
git status --short

echo ""
read -p "Commit and push these changes? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}📝 Committing changes...${NC}"
    
    git add .circleci/config.yml
    git add package.json
    git add CIRCLECI-TROUBLESHOOTING.md
    git add .circleci/config-alternative.yml
    git add BUILD-FIX.md
    git add ICON-SETUP.md
    git add icon.png
    
    git commit -m "Fix CircleCI build: Add icon and fix NSIS installer generation

- Update Node.js to version 20.11.0 for electron-builder compatibility
- Add npm cache clear step
- Use --legacy-peer-deps flag for dependency installation
- Update electron-builder to 24.13.3
- Disable code signing (sign: false) to avoid certificate errors
- Add icon.png (1024x1024) for all platforms
- Explicitly configure NSIS and portable targets
- Add build output listing for debugging
- Add troubleshooting and icon documentation"
    
    echo ""
    echo -e "${BLUE}🚀 Pushing to Bitbucket...${NC}"
    git push
    
    echo ""
    echo -e "${GREEN}✅ Done!${NC}"
    echo ""
    echo "Monitor your build at:"
    echo -e "${YELLOW}https://app.circleci.com/pipelines/bitbucket/lenoir-openai/atlas2${NC}"
    echo ""
    echo "The build should now complete successfully! 🎉"
else
    echo ""
    echo -e "${YELLOW}⏭️  Cancelled. You can commit manually with:${NC}"
    echo "  git add ."
    echo "  git commit -m \"Fix CircleCI build\""
    echo "  git push"
fi
