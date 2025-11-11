#!/bin/bash

# AtlaswebX - Publish to GitHub Script
# Usage: ./publish-to-github.sh YOUR_GITHUB_USERNAME

set -e  # Exit on error

echo "🚀 AtlaswebX - Publishing to GitHub"
echo "===================================="
echo ""

# Check if GitHub username is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your GitHub username"
    echo ""
    echo "Usage: ./publish-to-github.sh YOUR_GITHUB_USERNAME"
    echo ""
    echo "Example: ./publish-to-github.sh johndoe"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="atlaswebx"
BRANCH="v4"

echo "📋 Configuration:"
echo "   GitHub Username: $GITHUB_USERNAME"
echo "   Repository Name: $REPO_NAME"
echo "   Branch: $BRANCH"
echo ""

# Confirm with user
read -p "Continue with these settings? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled by user"
    exit 1
fi

echo ""
echo "📦 Step 1: Adding all changes..."
git add .

echo "✅ Changes staged"
echo ""

echo "💾 Step 2: Committing changes..."
git commit -m "Initial commit: AtlaswebX Browser with AI features

Features:
- Complete browser with tabs and navigation
- AI Assistant powered by GPT-4o-mini
- Custom wallpapers from folder
- Auto-save settings
- Context menu with essential actions
- Custom user agent (Chrome 142)
- Comprehensive documentation
- MIT License
- Contributing guidelines
- Security policy

Technical Stack:
- Electron
- Node.js
- OpenAI GPT-4o-mini
- Custom UI with modern design
- IPC communication
- BrowserView for tabs

Documentation:
- Complete README with setup instructions
- Quick start guide
- API key migration guide
- Troubleshooting guides
- Contributing guidelines
- Code of conduct
- Security policy" || echo "⚠️  No changes to commit (already committed)"

echo "✅ Changes committed"
echo ""

echo "🔗 Step 3: Updating remote..."
# Remove old remote if exists
git remote remove origin 2>/dev/null || true

# Add new GitHub remote
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

echo "✅ Remote updated to: https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo ""

echo "⬆️  Step 4: Pushing to GitHub..."
echo "   This may take a moment..."
echo ""

# Push to GitHub
git push -u origin $BRANCH

echo ""
echo "✅ Successfully published to GitHub!"
echo ""
echo "🎉 Your repository is now live at:"
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "📝 Next steps:"
echo "   1. Visit your repository on GitHub"
echo "   2. Add a description and topics"
echo "   3. Enable Issues and Discussions"
echo "   4. Create a release (v1.0.0)"
echo "   5. Share your project!"
echo ""
echo "🌟 Don't forget to add these topics:"
echo "   electron, browser, ai, gpt-4, javascript, nodejs"
echo ""
