# Bitbucket Project Selection

When creating or accessing a repository in Bitbucket, you may be asked to choose a **Project**.

## What is a Bitbucket Project?

Projects are a way to organize multiple repositories in a workspace. Think of it like folders for your repos.

## Options:

### Option 1: Use Existing Project (Recommended)
If the `lenoir-openai` workspace already has projects:
- Choose an existing project from the dropdown
- Common names: "Main", "Production", "Development", etc.
- Or choose the project that makes sense for Atlas

### Option 2: Create New Project
If you want to create a new project:
- **Project name**: `Lenoir` or `Atlas` or `AI Browser`
- **Project key**: `LEN` or `ATL` (2-3 letters, uppercase)
- **Description**: "Lenoir AI Browser Projects"

### Option 3: No Project
Some workspaces allow repositories without projects:
- Look for "No project" or "None" option
- This is fine for simple setups

## For the Atlas Repository:

Since you're working with `lenoir-openai/atlas`, I recommend:
- **If a project exists**: Choose the existing one
- **If creating new**: 
  - Name: `Lenoir AI`
  - Key: `LEN`
  - Description: `AI-powered browser and tools`

## After Choosing Project:

The repository will be created/updated, then you can run:
```bash
./sync-and-push.sh
```

This will pull any existing content and merge it with your local changes.
