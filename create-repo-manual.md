# Create Bitbucket Repository Manually

Since the API authentication is having issues, let's create the repository manually (takes 30 seconds):

## Steps:

### 1. Go to Bitbucket
Visit: https://bitbucket.org/repo/create

### 2. Fill in the form:
- **Workspace**: Select `lenoir-openai` from dropdown
- **Project**: Leave as default or select existing project
- **Repository name**: `atlas`
- **Access level**: ✅ **Private repository**
- **Include a README?**: ❌ **No** (we already have code)
- **Include .gitignore?**: ❌ **No** (we already have one)

### 3. Click "Create repository"

### 4. After creation, run:
```bash
./push-to-atlas.sh
```

---

## Alternative: If Repository Already Exists

If the repository `atlas` already exists in the `lenoir-openai` workspace but you don't have access:

1. Check your workspace membership:
   - Go to: https://bitbucket.org/lenoir-openai/workspace/settings/members
   - Make sure you're listed as a member with write access

2. Or ask the workspace admin to:
   - Add you as a member
   - Give you write permission to the `atlas` repository

---

## After Repository is Ready

Once the repository exists and you have access, simply run:

```bash
./push-to-atlas.sh
```

And press `y` when prompted!
