# 🐛 Backend Debugging Guide

## Error: "Failed to connect to OpenAI API"

This error means the PHP backend can't reach OpenAI. Here's how to fix it:

## 🔧 Step 1: Upload Diagnostic Tool

Upload `test-server.php` to your server:
```bash
scp backend/test-server.php user@atlaswebx.com:/path/to/backend/
```

Then visit in your browser:
```
https://atlaswebx.com/backend/test-server.php
```

This will show you **exactly** what's wrong!

## 🔍 Step 2: Common Issues

### Issue 1: config.php Missing or Wrong

**Check if config.php exists:**
```bash
ssh user@atlaswebx.com
cd /path/to/backend/
cat config.php
```

**Should look like:**
```php
<?php
define('OPENAI_API_KEY', 'sk-proj-...');
?>
```

**Fix:**
```bash
nano config.php
# Add your API key
# Save: Ctrl+X, Y, Enter
chmod 600 config.php
```

### Issue 2: cURL Not Installed

**Test:**
```bash
php -m | grep curl
```

**Fix:**
```bash
# Ubuntu/Debian
sudo apt-get install php-curl
sudo systemctl restart apache2

# CentOS
sudo yum install php-curl
sudo systemctl restart httpd
```

### Issue 3: SSL Certificate Issues

**Symptoms:** cURL error about SSL certificate

**Fix:** Update CA certificates:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install ca-certificates
sudo update-ca-certificates

# CentOS
sudo yum update ca-certificates
```

### Issue 4: Firewall Blocking Outbound Connections

**Test:**
```bash
curl https://api.openai.com/v1/models
```

If this fails, your server firewall is blocking outbound HTTPS.

**Fix:** Contact your hosting provider to allow outbound HTTPS connections.

## 🆕 Step 3: Try Improved Version

I created an improved version with better error messages:

**Rename current file:**
```bash
mv api-proxy.php api-proxy-old.php
```

**Upload new version:**
```bash
scp backend/api-proxy-v2.php user@atlaswebx.com:/path/to/backend/api-proxy.php
```

**Test again:**
```bash
./test-backend.sh
```

The new version will show detailed error information!

## 📊 Step 4: Check Error Logs

```bash
ssh user@atlaswebx.com
cd /path/to/backend/
tail -f error.log
```

Then test your backend and watch the logs in real-time.

## 🧪 Step 5: Manual Test

SSH into your server and test directly:

```bash
cd /path/to/backend/

# Test 1: Check PHP
php -v

# Test 2: Check cURL
php -r "echo (function_exists('curl_init') ? 'cURL OK' : 'cURL MISSING');"

# Test 3: Check config
php -r "require 'config.php'; echo 'Key: ' . substr(OPENAI_API_KEY, 0, 7) . '...';"

# Test 4: Test OpenAI directly
php -r '
$ch = curl_init("https://api.openai.com/v1/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . OPENAI_API_KEY,
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "model" => "gpt-4",
    "messages" => [["role" => "user", "content" => "Hi"]]
]));
$response = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "HTTP Code: $code\n";
echo "Response: " . substr($response, 0, 200) . "\n";
if (curl_error($ch)) {
    echo "Error: " . curl_error($ch) . "\n";
}
'
```

## 🔒 Step 6: Check API Key

Make sure your API key is valid:

1. Go to https://platform.openai.com/api-keys
2. Check if your key is active
3. Check if you have credits/billing set up
4. Try creating a new key if needed

## 📋 Checklist:

- [ ] `test-server.php` shows all green checkmarks
- [ ] `config.php` exists with correct API key
- [ ] cURL is installed: `php -m | grep curl`
- [ ] Can reach internet: `curl https://google.com`
- [ ] Can reach OpenAI: `curl https://api.openai.com/v1/models`
- [ ] API key is valid on OpenAI dashboard
- [ ] File permissions correct: `chmod 600 config.php`
- [ ] Error logs checked: `tail -f error.log`

## 🆘 Still Not Working?

If you've tried everything above, the issue might be:

1. **Hosting Provider Restrictions**
   - Some shared hosting blocks outbound API calls
   - Contact support to allow HTTPS to api.openai.com

2. **PHP Configuration**
   - Check `php.ini` for `allow_url_fopen = On`
   - Check `php.ini` for `disable_functions` (shouldn't include curl_*)

3. **Server Location**
   - Some countries block OpenAI
   - May need a VPS in a different location

## 💡 Quick Test Commands:

```bash
# All-in-one diagnostic
ssh user@atlaswebx.com 'cd /path/to/backend && \
  echo "=== PHP Version ===" && php -v && \
  echo "=== cURL ===" && php -m | grep curl && \
  echo "=== Config ===" && ls -la config.php && \
  echo "=== Internet ===" && curl -I https://google.com && \
  echo "=== OpenAI ===" && curl -I https://api.openai.com'
```

---

**Most Common Fix:** Just create `config.php` with your API key! 🔑
