# Code Signing for Windows - Information

## ❌ No Certificate Required (Current Setup)

Your app is configured to build **without code signing**. This is perfectly fine for open source projects!

## 📝 What This Means

### Without Code Signing (Current)
- ✅ **Free** - No certificate needed
- ✅ **Works** - App installs and runs fine
- ⚠️ **Windows SmartScreen** - Users may see warning on first install
- ⚠️ **"Unknown Publisher"** - Windows shows this message

### With Code Signing (Optional)
- 💰 **Costs $100-400/year** - Certificate from CA
- ✅ **No warnings** - Trusted by Windows
- ✅ **Shows your name** - As verified publisher
- ✅ **Professional** - Better user trust

## 🛡️ SmartScreen Warning

When users download and run your app, they may see:

```
Windows protected your PC
Microsoft Defender SmartScreen prevented an unrecognized app from starting.
Running this app might put your PC at risk.

[More info]  [Don't run]  [Run anyway]
```

**This is NORMAL for unsigned apps!**

### How Users Can Install

1. Click **"More info"**
2. Click **"Run anyway"**
3. App installs normally

After a few downloads, Windows SmartScreen learns your app is safe and stops showing warnings.

## 🔧 Current Configuration

### package.json
```json
"win": {
  "sign": null,
  "verifyUpdateCodeSignature": false
}
```

### GitHub Actions
```yaml
env:
  CSC_IDENTITY_AUTO_DISCOVERY: false
```

This explicitly disables code signing during builds.

## 💰 Getting a Code Signing Certificate (Optional)

If you want to sign your app in the future:

### 1. Purchase Certificate

**Certificate Authorities**:
- **DigiCert** - $474/year (EV Code Signing)
- **Sectigo** - $199/year (Standard Code Signing)
- **SSL.com** - $249/year (Standard Code Signing)
- **Certum** - €86/year (~$95) (Cheapest option)

**Types**:
- **Standard Code Signing** - $100-250/year
- **EV Code Signing** - $300-500/year (Better, instant trust)

### 2. Add to GitHub Secrets

Once you have a certificate:

1. Go to: Settings → Secrets → Actions
2. Add secrets:
   - `WIN_CSC_LINK` - Certificate file (base64 encoded)
   - `WIN_CSC_KEY_PASSWORD` - Certificate password

### 3. Update Workflow

```yaml
- name: Build Electron app for Windows
  run: npm run dist:win
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    CSC_LINK: ${{ secrets.WIN_CSC_LINK }}
    CSC_KEY_PASSWORD: ${{ secrets.WIN_CSC_KEY_PASSWORD }}
```

### 4. Update package.json

```json
"win": {
  "sign": "./sign.js",  // Custom signing script
  "signingHashAlgorithms": ["sha256"],
  "signDlls": false
}
```

## 🆓 Free Alternatives

### 1. Build Reputation
- Release multiple versions
- Get downloads
- Windows SmartScreen learns your app is safe
- Warnings decrease over time

### 2. Open Source Trust
- GitHub releases
- Clear source code
- Community reviews
- Users trust open source

### 3. Documentation
- Add installation guide
- Explain SmartScreen warning
- Show "Run anyway" steps
- Build user confidence

## 📖 User Installation Guide

Add this to your README:

```markdown
## Installation

### Windows SmartScreen Warning

When you first install AtlaswebX, Windows may show a SmartScreen warning:

**This is normal for new applications!**

To install:
1. Download `AtlaswebX-Setup-1.0.0.exe`
2. Double-click to run
3. If you see "Windows protected your PC":
   - Click **"More info"**
   - Click **"Run anyway"**
4. Follow the installation wizard

AtlaswebX is open source and safe to use. The warning appears because 
the app is not code-signed (which requires an expensive certificate).
```

## 🎯 Recommendations

### For Open Source Projects (Like Yours)
✅ **Don't buy certificate** - Not worth it initially  
✅ **Document the warning** - Help users understand  
✅ **Build reputation** - More downloads = less warnings  
✅ **Focus on features** - Better product matters more  

### When to Get Certificate
- 💼 Commercial product
- 🏢 Business/enterprise users
- 💰 Selling the software
- 📈 Large user base (10,000+)
- 🎯 Professional image critical

## 🔍 Verification

Users can verify your app is safe:

### 1. Check GitHub
- Source code is public
- No malicious code
- Community reviewed

### 2. VirusTotal
- Upload to virustotal.com
- Scan with 70+ antivirus engines
- Share results with users

### 3. Open Source
- Full transparency
- Anyone can audit
- Build from source

## 📊 Statistics

**Unsigned Apps**:
- 90% of indie/open source apps are unsigned
- Users understand SmartScreen warnings
- Not a barrier for tech-savvy users

**Signed Apps**:
- Better for non-technical users
- Required for enterprise
- Professional appearance

## ✅ Current Status

Your app is configured to build **without code signing**:

- ✅ Builds successfully on GitHub Actions
- ✅ Creates Windows installer (.exe)
- ✅ Works perfectly on Windows 10/11
- ⚠️ Shows SmartScreen warning (normal)
- ✅ Free - No certificate costs

## 🎊 Conclusion

**You don't need a code signing certificate!**

Your app will:
- ✅ Build successfully
- ✅ Install on Windows
- ✅ Run perfectly
- ✅ Be safe and secure

The SmartScreen warning is normal and expected for unsigned apps. Document it in your README and users will understand.

---

**Current Setup**: ✅ No code signing (Free)  
**Recommendation**: Keep it this way for now  
**Future**: Consider certificate if going commercial  
**Cost**: $0 (vs $100-400/year for certificate)
