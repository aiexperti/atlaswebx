# CircleCI Build Troubleshooting

## Error: "Class extends value undefined is not a constructor or null"

### Problem
This error occurs when Node.js version is incompatible with electron-builder or other dependencies.

### Solution 1: Updated Node.js Version (Recommended)

I've updated `.circleci/config.yml` to use Node.js 20.11.0:

```yaml
- run:
    name: Install Node.js 20
    command: |
      choco install nodejs --version=20.11.0 -y --force
      refreshenv
```

### Solution 2: Use Docker with Wine (Faster Alternative)

Instead of native Windows builds, use Docker with Wine:

```bash
# Rename current config
mv .circleci/config.yml .circleci/config-windows-native.yml

# Use Docker config
mv .circleci/config-alternative.yml .circleci/config.yml
```

The Docker method:
- ✅ Faster builds (no Windows VM startup)
- ✅ Pre-configured environment
- ✅ Uses Wine to build Windows executables
- ✅ More reliable

### Solution 3: Lock Dependency Versions

Update `package.json` to use exact versions:

```json
{
  "devDependencies": {
    "electron": "27.0.0",
    "electron-builder": "24.13.3"
  }
}
```

Remove `^` to prevent automatic updates.

## Common CircleCI Errors

### 1. "npm ERR! code ELIFECYCLE"

**Cause**: Build script failed
**Fix**: Check the build logs for specific errors

```bash
# Test locally first
npm install
npm run build:win
```

### 2. "Out of memory"

**Cause**: Not enough resources
**Fix**: Increase resource class in config.yml

```yaml
build-windows:
  executor:
    name: win/default
    size: large  # Changed from medium
```

### 3. "Permission denied"

**Cause**: File permissions issue
**Fix**: Add permission step

```yaml
- run:
    name: Fix permissions
    command: chmod -R 755 .
```

### 4. "Module not found"

**Cause**: Dependencies not installed
**Fix**: Clear cache and reinstall

```yaml
- run:
    name: Clear npm cache
    command: npm cache clean --force

- run:
    name: Install Dependencies
    command: npm install --legacy-peer-deps
```

## Testing Configurations

### Test Current Config Locally

```bash
# Validate CircleCI config
circleci config validate

# Run local build (requires CircleCI CLI)
circleci local execute --job build-windows
```

### Install CircleCI CLI

```bash
# macOS
brew install circleci

# Windows
choco install circleci-cli

# Verify
circleci version
```

## Recommended Configuration

Based on your error, here's the recommended setup:

### Option A: Docker + Wine (Fastest)

```yaml
jobs:
  build-windows:
    docker:
      - image: electronuserland/builder:wine
    steps:
      - checkout
      - run: npm install --legacy-peer-deps
      - run: npm run build:win
      - store_artifacts:
          path: dist
```

**Pros**: Fast, reliable, pre-configured
**Cons**: Uses Wine (not native Windows)

### Option B: Native Windows with Node 20

```yaml
jobs:
  build-windows:
    executor:
      name: win/default
      size: medium
    steps:
      - checkout
      - run: choco install nodejs --version=20.11.0 -y --force
      - run: npm install -g npm@10.2.5
      - run: npm install --legacy-peer-deps
      - run: npm run build:win
```

**Pros**: True Windows build
**Cons**: Slower, more expensive credits

## Current Fix Applied

I've updated your `.circleci/config.yml` with:

1. ✅ Node.js 20.11.0 (compatible version)
2. ✅ npm 10.2.5 (latest stable)
3. ✅ `--legacy-peer-deps` flag
4. ✅ npm cache clear

## Next Steps

1. **Commit the updated config**:
```bash
git add .circleci/config.yml
git commit -m "Fix Node.js version for CircleCI build"
git push
```

2. **Monitor the build**:
   - Go to CircleCI dashboard
   - Watch the new build start
   - Check if it completes successfully

3. **If still fails**, try Docker method:
```bash
mv .circleci/config.yml .circleci/config-native.yml
mv .circleci/config-alternative.yml .circleci/config.yml
git add .circleci/
git commit -m "Switch to Docker-based Windows build"
git push
```

## Support Resources

- **CircleCI Docs**: https://circleci.com/docs/
- **Electron Builder**: https://www.electron.build/multi-platform-build
- **Node.js Versions**: https://nodejs.org/en/about/releases/

## Debug Commands

Add these to your config for debugging:

```yaml
- run:
    name: Debug Info
    command: |
      node --version
      npm --version
      npm list electron
      npm list electron-builder
```

---

**The fix has been applied!** Push the updated config and try again. 🚀
