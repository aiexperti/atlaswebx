# 🚀 Bitbucket Quick Start (API Method)

## One-Time Setup (5 minutes)

### Step 1: Copy Config File
```bash
cp git-config.example.json git-config.json
```

### Step 2: Get Your App Password
1. Go to: https://bitbucket.org/account/settings/app-passwords/
2. Click **"Create app password"**
3. Name: `Lenoir API Access`
4. Permissions: ✅ Repositories (Read, Write, Admin)
5. Copy the password (starts with `ATBB...`)

### Step 3: Edit Config
Open `git-config.json` and fill in:

```json
{
  "git": {
    "user": {
      "name": "Your Name",           ← Your name
      "email": "you@email.com"       ← Your email
    },
    "branch": {
      "default": "main"
    }
  },
  "bitbucket": {
    "workspace": "your-username",    ← Your Bitbucket username
    "repo_slug": "lenoir-ai-browser",
    "username": "your-username",     ← Same as workspace
    "app_password": "ATBBxxxxxxxx",  ← Paste your app password
    "is_private": true,
    "description": "Lenoir AI Browser - AI-powered browser with glassmorphism UI"
  }
}
```

### Step 4: Run Setup
```bash
./setup-bitbucket.sh
```

Press `y` when asked to push.

## Done! 🎉

Your repository is now on Bitbucket at:
`https://bitbucket.org/YOUR_USERNAME/lenoir-ai-browser`

---

## Future Commits

After the initial setup, use normal git commands:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push
```

---

## Need Help?

- **App Password Issues**: Make sure it has Admin permission
- **Workspace Not Found**: Use your exact Bitbucket username
- **Push Failed**: Check your internet connection and credentials

Full documentation: See `GIT-SETUP-README.md`
