#!/bin/bash

# CircleCI Setup Helper Script

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔧 CircleCI Setup for Atlasweb${NC}"
echo ""

echo -e "${BLUE}Step 1: Checking files...${NC}"

# Check if CircleCI config exists
if [ -f ".circleci/config.yml" ]; then
    echo -e "${GREEN}✅ CircleCI config found${NC}"
else
    echo -e "${YELLOW}⚠️  CircleCI config not found${NC}"
    exit 1
fi

# Check if package.json has build scripts
if grep -q "build:win" package.json; then
    echo -e "${GREEN}✅ Build scripts configured${NC}"
else
    echo -e "${YELLOW}⚠️  Build scripts not found${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Installing electron-builder locally...${NC}"
npm install --save-dev electron-builder

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Commit and push to Bitbucket:"
echo "   ${YELLOW}git add .${NC}"
echo "   ${YELLOW}git commit -m \"Add CircleCI pipeline for Windows builds\"${NC}"
echo "   ${YELLOW}git push${NC}"
echo ""
echo "2. Set up CircleCI:"
echo "   • Go to: ${YELLOW}https://circleci.com${NC}"
echo "   • Sign up with Bitbucket"
echo "   • Add project: ${YELLOW}lenoir-openai/atlas2${NC}"
echo "   • Click 'Start Building'"
echo ""
echo "3. Monitor builds:"
echo "   • Dashboard: ${YELLOW}https://app.circleci.com/pipelines/bitbucket/lenoir-openai/atlas2${NC}"
echo ""
echo "4. Download builds:"
echo "   • Go to latest build → Artifacts tab"
echo "   • Download Windows executables"
echo ""
echo -e "${GREEN}Full guide: CIRCLECI-SETUP.md${NC}"
