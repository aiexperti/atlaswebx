# 🚀 Quick Start - Backend Setup (5 Minutes)

## Step 1: Configure Your API Key (1 min)

```bash
cd backend/
cp config.example.php config.php
nano config.php
```

**Add your OpenAI API key:**
```php
<?php
define('OPENAI_API_KEY', 'sk-your-actual-key-here');
?>
```

Save and exit (Ctrl+X, Y, Enter)

## Step 2: Upload to Your Server (2 min)

### Option A: Automatic (Recommended)
```bash
./deploy.sh
```
Follow the prompts!

### Option B: Manual Upload

**Via FTP/SFTP:**
1. Open FileZilla or your FTP client
2. Upload entire `backend/` folder to your server
3. Place in: `/public_html/backend/` or `/var/www/html/backend/`

**Via SSH:**
```bash
scp -r backend/ user@yourserver.com:/var/www/html/
```

## Step 3: Set Permissions (30 sec)

SSH into your server:
```bash
ssh user@yourserver.com
cd /var/www/html/backend/
chmod 644 api-proxy.php
chmod 600 config.php
chmod 644 .htaccess
mkdir rate_limit
chmod 755 rate_limit
```

## Step 4: Test It (30 sec)

```bash
curl -X POST https://yourserver.com/backend/api-proxy.php \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"Hello!"}]}'
```

**Expected response:**
```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you today?"
    }
  }]
}
```

✅ **If you see this, your backend is working!**

## Step 5: Update Your Electron App (1 min)

Find your OpenAI API call and change:

**From:**
```javascript
'https://api.openai.com/v1/chat/completions'
```

**To:**
```javascript
'https://yourserver.com/backend/api-proxy.php'
```

**Remove the Authorization header!**

## 🎉 Done!

Your API key is now secure on the server!

## 📊 Monitor Usage:

```bash
# View logs
ssh user@yourserver.com
cd /var/www/html/backend/
tail -f usage.log
tail -f error.log
```

## 🔧 Troubleshooting:

### "API key not configured"
- Check `config.php` exists
- Verify API key is correct
- Check file permissions: `chmod 600 config.php`

### "Permission denied"
```bash
chmod 755 /var/www/html/backend/
chmod 644 api-proxy.php
chmod 600 config.php
```

### CORS errors
Edit `api-proxy.php` line 13:
```php
header('Access-Control-Allow-Origin: https://yourdomain.com');
```

## 🔒 Security Checklist:

- [ ] API key in `config.php` (not in code)
- [ ] `config.php` has 600 permissions
- [ ] HTTPS enabled on server
- [ ] CORS restricted to your domain
- [ ] Rate limiting enabled
- [ ] Monitoring logs regularly

## 💰 Hosting Recommendations:

**Cheap & Easy:**
- **Namecheap Shared Hosting** - $2/month
- **Hostinger** - $2/month
- **DigitalOcean** - $5/month

**Free Options:**
- **InfinityFree** - Free PHP hosting
- **000webhost** - Free with ads

## 📚 Full Documentation:

- `README.md` - Complete setup guide
- `update-electron-app.md` - Code examples
- `deploy.sh` - Automated deployment

---

**Need help?** Check the full README.md or ask for assistance!
