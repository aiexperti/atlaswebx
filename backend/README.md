# Atlasweb Backend API Proxy

This backend keeps your OpenAI API key secure on the server.

## 📁 Files:

- `api-proxy.php` - Main proxy endpoint
- `config.example.php` - Configuration template
- `.htaccess` - Apache security settings
- `README.md` - This file

## 🚀 Quick Setup:

### 1. Upload to Your Server

Upload the `backend/` folder to your web server:
```
yourserver.com/
└── backend/
    ├── api-proxy.php
    ├── config.example.php
    ├── .htaccess
    └── README.md
```

### 2. Create Configuration File

```bash
# Copy the example config
cp config.example.php config.php

# Edit with your API key
nano config.php
```

**config.php:**
```php
<?php
define('OPENAI_API_KEY', 'sk-your-actual-api-key-here');
?>
```

### 3. Set Permissions

```bash
# Make directories writable for logs
mkdir rate_limit
chmod 755 rate_limit
chmod 644 api-proxy.php
chmod 600 config.php  # Protect config file
```

### 4. Test the Endpoint

```bash
curl -X POST https://yourserver.com/backend/api-proxy.php \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

## 🔧 Update Your Electron App

Find your OpenAI API call in your Electron app and update it:

### Before (Insecure):
```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        model: 'gpt-4',
        messages: messages
    })
});
```

### After (Secure):
```javascript
const response = await fetch('https://yourserver.com/backend/api-proxy.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        model: 'gpt-4',
        messages: messages
    })
});
```

## 🔒 Security Features:

### ✅ Built-in Features:
- **Rate Limiting**: 100 requests per hour per IP
- **Request Validation**: Checks for valid JSON and required fields
- **Error Logging**: Logs errors to `error.log`
- **Usage Logging**: Tracks API usage in `usage.log`
- **CORS Protection**: Configure allowed origins
- **Config Protection**: `.htaccess` blocks access to sensitive files

### 🛡️ Additional Security (Recommended):

#### 1. Use Environment Variables (Best Practice)

Instead of `config.php`, use environment variables:

**On your server:**
```bash
# Add to ~/.bashrc or /etc/environment
export OPENAI_API_KEY="sk-your-key-here"
```

**Or in Apache virtual host:**
```apache
<VirtualHost *:80>
    SetEnv OPENAI_API_KEY "sk-your-key-here"
</VirtualHost>
```

#### 2. Restrict CORS

In `api-proxy.php`, change:
```php
header('Access-Control-Allow-Origin: *');
```

To:
```php
header('Access-Control-Allow-Origin: https://yourdomain.com');
```

#### 3. Add HTTPS

Always use HTTPS in production. Get free SSL with Let's Encrypt:
```bash
sudo certbot --apache
```

## 📊 Rate Limiting:

Default limits:
- **100 requests per hour** per IP address
- Blocked IPs must wait 1 hour
- Automatic cleanup of old request logs

To adjust limits, edit `api-proxy.php`:
```php
// Change this line:
if (count($rateLimit['requests']) >= 100) {
// To your desired limit:
if (count($rateLimit['requests']) >= 500) {
```

## 📝 Monitoring:

### View Usage Logs:
```bash
tail -f usage.log
```

### View Error Logs:
```bash
tail -f error.log
```

### Check Rate Limits:
```bash
ls -la rate_limit/
```

## 🧪 Testing:

### Test with cURL:
```bash
# Simple test
curl -X POST https://yourserver.com/backend/api-proxy.php \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"Hi"}]}'

# Test rate limiting (run 101 times)
for i in {1..101}; do
  curl -X POST https://yourserver.com/backend/api-proxy.php \
    -H "Content-Type: application/json" \
    -d '{"model":"gpt-4","messages":[{"role":"user","content":"Test"}]}'
  echo "Request $i"
done
```

## 🐛 Troubleshooting:

### "API key not configured"
- Check that `config.php` exists
- Verify the API key is correct
- Check file permissions: `chmod 600 config.php`

### "Rate limit exceeded"
- Wait 1 hour or clear rate limit files:
  ```bash
  rm -rf rate_limit/*
  ```

### "Failed to connect to OpenAI API"
- Check server internet connection
- Verify cURL is installed: `php -m | grep curl`
- Check error.log for details

### CORS errors in browser
- Update CORS headers in `api-proxy.php`
- Make sure `.htaccess` is loaded (Apache only)

## 📦 Deployment Options:

### Shared Hosting (cPanel, etc.)
1. Upload via FTP/SFTP
2. Create `config.php` via File Manager
3. Set permissions via File Manager
4. Done!

### VPS (DigitalOcean, Linode, etc.)
1. SSH into server
2. Upload files: `scp -r backend/ user@server:/var/www/html/`
3. Set permissions
4. Configure Apache/Nginx
5. Enable HTTPS

### Serverless (Vercel, Netlify)
Convert to serverless function format (see their docs)

## 💰 Cost Estimation:

- **Hosting**: $5-10/month (shared hosting)
- **OpenAI API**: Pay per token used
- **SSL Certificate**: Free (Let's Encrypt)

## 🔄 Updates:

To update the proxy:
1. Backup current `config.php`
2. Upload new `api-proxy.php`
3. Restore `config.php`
4. Test endpoint

## 📞 Support:

If you encounter issues:
1. Check `error.log`
2. Verify PHP version (7.4+ required)
3. Ensure cURL extension is enabled
4. Check file permissions

---

**Your API key is now secure!** 🔒
