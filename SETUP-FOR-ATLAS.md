# Setup for Existing Bitbucket Repository (Atlas)

Since you already have a repository at `https://bitbucket.org/lenoir-openai/atlas`, here's how to push to it:

## Quick Setup

### 1. Use the Pre-configured File

I've created `git-config-atlas.json` with your repository details already filled in:

```bash
cp git-config-atlas.json git-config.json
```

### 2. Edit the Config

Open `git-config.json` and update only these fields:

```json
{
  "git": {
    "user": {
      "name": "Your Name",           ← Update this
      "email": "your@email.com"      ← Update this
    },
    "branch": {
      "default": "v4"                ← Already set to v4
    }
  },
  "bitbucket": {
    "workspace": "lenoir-openai",    ← Already correct
    "repo_slug": "atlas",            ← Already correct
    "api_token": "PASTE_TOKEN_HERE", ← Paste your API token
    "is_private": true,
    "description": "Lenoir AI Browser - Atlas V4",
    "use_existing_repo": true        ← Set to use existing repo
  }
}
```

### 3. Run the Token-Based Setup

```bash
./setup-bitbucket-token.sh
```

This will:
- Configure your Git user
- Connect to your existing `lenoir-openai/atlas` repository
- Set the branch to `v4`
- Push your code
- Clean the token from git config for security

## What's Your API Token?

Your API token is the App Password you mentioned. It looks like: `ATBBxxxxxxxxxx`

If you need to create a new one:
1. Go to: https://bitbucket.org/account/settings/app-passwords/
2. Click "Create app password"
3. Name: `Atlas Access`
4. Permissions: Repository (Read, Write)
5. Copy the token

## Alternative: Manual Setup

If you prefer to do it manually:

```bash
# Configure Git
git config user.name "Your Name"
git config user.email "your@email.com"

# Add remote (with token)
git remote add origin https://x-token-auth:YOUR_TOKEN@bitbucket.org/lenoir-openai/atlas.git

# Set branch to v4
git branch -M v4

# Push
git push -u origin v4

# Clean token from config
git remote set-url origin https://bitbucket.org/lenoir-openai/atlas.git
```

## Summary

Your repository details:
- **Workspace**: `lenoir-openai`
- **Repository**: `atlas`
- **Branch**: `v4`
- **URL**: https://bitbucket.org/lenoir-openai/atlas

Just paste your API token in the config and run `./setup-bitbucket-token.sh`! 🚀
