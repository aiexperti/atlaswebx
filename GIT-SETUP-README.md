# Git Setup for Bitbucket (API-Based)

This guide will help you configure and push your Lenoir AI Browser project to Bitbucket using the Bitbucket REST API 2.0.

## Quick Start

### 1. Configure Your Credentials

First, copy the example config:
```bash
cp git-config.example.json git-config.json
```

Then edit `git-config.json` with your information:

```json
{
  "git": {
    "user": {
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "branch": {
      "default": "main"
    }
  },
  "bitbucket": {
    "workspace": "johndoe",
    "repo_slug": "lenoir-ai-browser",
    "username": "johndoe",
    "app_password": "ATBBxxxxxxxxxx",
    "is_private": true,
    "description": "Lenoir AI Browser - AI-powered browser with glassmorphism UI"
  }
}
```

### 2. Create a Bitbucket App Password

For secure API authentication, create an App Password:

1. Go to [Bitbucket App Passwords](https://bitbucket.org/account/settings/app-passwords/)
2. Click **Create app password**
3. Label: `Lenoir API Access`
4. **Required Permissions:**
   - ✅ **Repositories: Read**
   - ✅ **Repositories: Write**
   - ✅ **Repositories: Admin** (to create repos via API)
5. Click **Create**
6. **Copy the password** (you won't see it again!)
7. Paste it in `git-config.json` under `bitbucket.app_password`

### 3. Find Your Workspace Name

Your workspace is usually:
- Your Bitbucket **username** (for personal repos)
- Your **team name** (for team repos)

You can find it in the URL when you're logged into Bitbucket:
`https://bitbucket.org/YOUR_WORKSPACE/`

### 4. Run the Setup Script

```bash
./setup-bitbucket.sh
```

The script will:
- ✅ Configure your Git user name and email
- ✅ **Create the repository via Bitbucket API** (if it doesn't exist)
- ✅ Add the Bitbucket remote
- ✅ Set the default branch to `main`
- ✅ Push your code to Bitbucket
- ✅ Clean up credentials from git config

### 5. Manual Push (Alternative)

If you prefer to push manually:

```bash
# Configure Git user
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add remote
git remote add origin https://bitbucket.org/yourusername/lenoir-ai-browser.git

# Set default branch
git branch -M main

# Push to Bitbucket
git push -u origin main
```

## Configuration File Reference

### `git-config.json`

| Field | Description | Example |
|-------|-------------|---------|
| `git.user.name` | Your full name for commits | `"John Doe"` |
| `git.user.email` | Your email for commits | `"john@example.com"` |
| `git.branch.default` | Default branch name | `"main"` |
| `bitbucket.workspace` | Your workspace/username | `"johndoe"` |
| `bitbucket.repo_slug` | Repository name (URL-friendly) | `"lenoir-ai-browser"` |
| `bitbucket.username` | Your Bitbucket username | `"johndoe"` |
| `bitbucket.app_password` | Bitbucket App Password | `"ATBBxxxxxxxx"` |
| `bitbucket.is_private` | Make repository private | `true` or `false` |
| `bitbucket.description` | Repository description | `"Your project description"` |

## Security Notes

⚠️ **Important:**
- `git-config.json` is in `.gitignore` and will NOT be committed
- Never share your App Password
- Use App Passwords instead of your account password
- You can revoke App Passwords anytime from Bitbucket settings

## Troubleshooting

### "jq: command not found"

Install jq using Homebrew:
```bash
brew install jq
```

### Authentication Failed

1. Verify your Bitbucket username is correct
2. Ensure your App Password is valid
3. Check that the repository URL is correct
4. Try creating a new App Password

### Remote Already Exists

If you see "remote origin already exists":
```bash
git remote remove origin
./setup-bitbucket.sh
```

### Repository Already Exists

The script will detect if the repository already exists and skip creation.

### API Permission Errors

If you get "403 Forbidden" or permission errors:
1. Ensure your App Password has **Admin** permission
2. Verify your workspace name is correct
3. Check that your username matches the workspace owner

### Push Rejected

If your push is rejected:
```bash
# Pull first, then push
git pull origin main --rebase
git push -u origin main
```

## What's Next?

After pushing to Bitbucket:
- 🌐 View your repository at the URL shown
- 👥 Add collaborators in repository settings
- 🔒 Configure branch permissions
- 🔄 Set up CI/CD pipelines (optional)

## Files Created

- `git-config.json` - Your credentials (not committed)
- `git-config.example.json` - Template file (committed)
- `setup-bitbucket.sh` - **NEW: API-based setup script** ⭐
- `setup-git.sh` - Legacy setup script (deprecated)
- `GIT-SETUP-README.md` - This guide

## What's Different with the API Approach?

✅ **Automatic repository creation** - No need to manually create repos in Bitbucket  
✅ **Better security** - Credentials are cleaned from git config after push  
✅ **More control** - Set privacy, description, and other settings via config  
✅ **Error handling** - Better feedback on what went wrong  
✅ **Modern approach** - Uses Bitbucket REST API 2.0

---

**Need Help?** Check the [Bitbucket Documentation](https://support.atlassian.com/bitbucket-cloud/docs/)
