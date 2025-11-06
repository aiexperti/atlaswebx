# CircleCI Setup for Atlasweb Windows Builds

This guide will help you set up CircleCI to automatically build Windows versions of Atlasweb.

## Prerequisites

1. **CircleCI Account**: Sign up at https://circleci.com
2. **Bitbucket Repository**: Your code is already on Bitbucket ✅
3. **CircleCI Connected to Bitbucket**: Link your Bitbucket account

## Step 1: Connect CircleCI to Bitbucket

1. Go to https://circleci.com/signup/
2. Click **"Sign Up with Bitbucket"**
3. Authorize CircleCI to access your Bitbucket repositories
4. Select the `lenoir-openai` workspace

## Step 2: Add Your Project to CircleCI

1. In CircleCI dashboard, click **"Projects"**
2. Find `lenoir-openai/atlas2`
3. Click **"Set Up Project"**
4. CircleCI will detect the `.circleci/config.yml` file
5. Click **"Start Building"**

## Step 3: Configuration Files

### ✅ Already Created:

1. **`.circleci/config.yml`** - CircleCI pipeline configuration
2. **`package.json`** - Updated with build scripts

### What the Pipeline Does:

- ✅ Checks out your code
- ✅ Installs Node.js on Windows
- ✅ Installs dependencies
- ✅ Builds Windows executable (.exe)
- ✅ Creates NSIS installer
- ✅ Creates portable version
- ✅ Stores artifacts for download

## Step 4: Build Outputs

After each successful build, CircleCI will create:

### Windows Builds:
- **NSIS Installer**: `Atlasweb-Setup-1.0.0.exe` (installable)
- **Portable**: `Atlasweb-1.0.0.exe` (no installation needed)

### Download Location:
- Go to CircleCI → Your Project → Latest Build
- Click **"Artifacts"** tab
- Download the Windows builds

## Step 5: Trigger a Build

### Automatic Triggers:
Every time you push to Bitbucket:
```bash
git add .
git commit -m "Update Atlasweb"
git push
```

CircleCI will automatically:
1. Detect the push
2. Start building
3. Create Windows executables
4. Store them as artifacts

### Manual Trigger:
1. Go to CircleCI dashboard
2. Select your project
3. Click **"Trigger Pipeline"**
4. Select branch: `v4`
5. Click **"Trigger Pipeline"**

## Step 6: Build Status

Monitor your builds:
- **CircleCI Dashboard**: https://app.circleci.com/pipelines/bitbucket/lenoir-openai/atlas2
- **Build Status Badge**: Add to README

```markdown
[![CircleCI](https://circleci.com/bb/lenoir-openai/atlas2.svg?style=svg)](https://circleci.com/bb/lenoir-openai/atlas2)
```

## Advanced Configuration

### Build for Multiple Platforms

Uncomment in `.circleci/config.yml`:

```yaml
workflows:
  version: 2
  build-all-platforms:
    jobs:
      - build-windows
      - build-macos    # Uncomment for macOS
      - build-linux    # Uncomment for Linux
```

### Environment Variables

If you need API keys or secrets:

1. Go to CircleCI → Project Settings
2. Click **"Environment Variables"**
3. Add variables:
   - `OPENAI_API_KEY`
   - `CSC_LINK` (for code signing)
   - `CSC_KEY_PASSWORD` (for code signing)

### Code Signing (Optional)

For production releases, add code signing:

1. Get a code signing certificate
2. Add to CircleCI environment variables
3. Update `package.json`:

```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "${CSC_KEY_PASSWORD}",
  "target": ["nsis", "portable"]
}
```

## Local Testing

Test the build locally before pushing:

```bash
# Install dependencies
npm install

# Build for Windows (on Windows machine)
npm run build:win

# Build for macOS (on Mac)
npm run build:mac

# Build for Linux
npm run build:linux
```

## Troubleshooting

### Build Fails on Windows

**Issue**: Node.js installation fails
**Solution**: CircleCI will auto-install via Chocolatey

### Missing Icons

**Issue**: Build complains about missing icons
**Solution**: Create icon files or remove icon references:

```json
"win": {
  "target": ["nsis", "portable"]
  // Remove: "icon": "icons/icon.ico"
}
```

### Build Takes Too Long

**Issue**: Build exceeds free tier limits
**Solution**: 
- Use CircleCI's free tier: 2,500 credits/week
- Optimize by building only on tagged releases

## Cost Optimization

### Build Only on Tags

Update `.circleci/config.yml`:

```yaml
workflows:
  version: 2
  build-all-platforms:
    jobs:
      - build-windows:
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
```

Then create releases:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Next Steps

1. ✅ Push your code to Bitbucket
2. ✅ Connect CircleCI to your repository
3. ✅ Watch the first build complete
4. ✅ Download your Windows executable
5. ✅ Test the application
6. ✅ Share with users!

## Support

- **CircleCI Docs**: https://circleci.com/docs/
- **Electron Builder**: https://www.electron.build/
- **CircleCI Community**: https://discuss.circleci.com/

---

**Ready to build?** Push your code and watch CircleCI create your Windows application! 🚀
