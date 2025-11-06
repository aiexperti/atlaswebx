#!/bin/bash

# Git Setup Script for Bitbucket
# This script reads configuration from git-config.json and sets up the repository

CONFIG_FILE="git-config.json"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Error: $CONFIG_FILE not found!"
    echo "Please create the configuration file first."
    exit 1
fi

# Check if jq is installed (for JSON parsing)
if ! command -v jq &> /dev/null; then
    echo "⚠️  Warning: 'jq' is not installed. Installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install jq
    else
        echo "❌ Error: Homebrew not found. Please install jq manually:"
        echo "   brew install jq"
        exit 1
    fi
fi

echo "🔧 Reading configuration from $CONFIG_FILE..."

# Parse JSON config
GIT_USER_NAME=$(jq -r '.git.user.name' "$CONFIG_FILE")
GIT_USER_EMAIL=$(jq -r '.git.user.email' "$CONFIG_FILE")
REMOTE_NAME=$(jq -r '.git.remote.name' "$CONFIG_FILE")
REMOTE_URL=$(jq -r '.git.remote.url' "$CONFIG_FILE")
DEFAULT_BRANCH=$(jq -r '.git.branch.default' "$CONFIG_FILE")
BITBUCKET_USERNAME=$(jq -r '.bitbucket.username' "$CONFIG_FILE")
BITBUCKET_APP_PASSWORD=$(jq -r '.bitbucket.app_password' "$CONFIG_FILE")

# Validate configuration
if [ "$GIT_USER_NAME" == "YOUR_NAME" ] || [ "$GIT_USER_NAME" == "null" ]; then
    echo "❌ Error: Please update git.user.name in $CONFIG_FILE"
    exit 1
fi

if [ "$REMOTE_URL" == "https://bitbucket.org/YOUR_USERNAME/lenoir-ai-browser.git" ] || [ "$REMOTE_URL" == "null" ]; then
    echo "❌ Error: Please update git.remote.url in $CONFIG_FILE"
    exit 1
fi

echo "✅ Configuration validated"
echo ""

# Configure Git user
echo "👤 Configuring Git user..."
git config user.name "$GIT_USER_NAME"
git config user.email "$GIT_USER_EMAIL"
echo "   Name: $GIT_USER_NAME"
echo "   Email: $GIT_USER_EMAIL"
echo ""

# Check if remote already exists
if git remote get-url "$REMOTE_NAME" &> /dev/null; then
    echo "⚠️  Remote '$REMOTE_NAME' already exists. Updating URL..."
    git remote set-url "$REMOTE_NAME" "$REMOTE_URL"
else
    echo "🔗 Adding remote repository..."
    git remote add "$REMOTE_NAME" "$REMOTE_URL"
fi
echo "   Remote: $REMOTE_NAME"
echo "   URL: $REMOTE_URL"
echo ""

# Set default branch
echo "🌿 Setting default branch to '$DEFAULT_BRANCH'..."
git branch -M "$DEFAULT_BRANCH"
echo ""

# Offer to push
echo "📤 Ready to push to Bitbucket!"
echo ""
read -p "Do you want to push now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Pushing to $REMOTE_NAME/$DEFAULT_BRANCH..."
    
    # If app password is provided, use it for authentication
    if [ "$BITBUCKET_APP_PASSWORD" != "YOUR_APP_PASSWORD" ] && [ "$BITBUCKET_APP_PASSWORD" != "null" ]; then
        # Create authenticated URL
        AUTH_URL=$(echo "$REMOTE_URL" | sed "s|https://|https://${BITBUCKET_USERNAME}:${BITBUCKET_APP_PASSWORD}@|")
        git push -u "$AUTH_URL" "$DEFAULT_BRANCH"
    else
        echo "⚠️  No app password configured. You'll be prompted for credentials..."
        git push -u "$REMOTE_NAME" "$DEFAULT_BRANCH"
    fi
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to Bitbucket!"
        echo "🌐 View your repository at: $REMOTE_URL"
    else
        echo ""
        echo "❌ Push failed. Please check your credentials and try again."
        echo ""
        echo "💡 Tip: Create a Bitbucket App Password at:"
        echo "   https://bitbucket.org/account/settings/app-passwords/"
    fi
else
    echo "⏭️  Skipped push. You can push manually later with:"
    echo "   git push -u $REMOTE_NAME $DEFAULT_BRANCH"
fi

echo ""
echo "✨ Git setup complete!"
