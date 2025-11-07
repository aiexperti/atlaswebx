<?php
/**
 * Server Diagnostic Script
 * Upload this to your server and access it via browser
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Backend Diagnostic</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #fff; }
        .success { color: #0f0; }
        .error { color: #f00; }
        .warning { color: #ff0; }
        .section { margin: 20px 0; padding: 15px; background: #2a2a2a; border-radius: 5px; }
        h2 { color: #4a9eff; }
        pre { background: #000; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🔧 Backend Diagnostic Tool</h1>
    
    <div class="section">
        <h2>1. PHP Version</h2>
        <?php
        $phpVersion = phpversion();
        $minVersion = '7.4';
        if (version_compare($phpVersion, $minVersion, '>=')) {
            echo "<span class='success'>✅ PHP $phpVersion (OK)</span>";
        } else {
            echo "<span class='error'>❌ PHP $phpVersion (Need $minVersion or higher)</span>";
        }
        ?>
    </div>
    
    <div class="section">
        <h2>2. cURL Extension</h2>
        <?php
        if (function_exists('curl_init')) {
            echo "<span class='success'>✅ cURL is installed</span><br>";
            $curlVersion = curl_version();
            echo "<pre>";
            echo "Version: " . $curlVersion['version'] . "\n";
            echo "SSL Version: " . $curlVersion['ssl_version'] . "\n";
            echo "Protocols: " . implode(', ', $curlVersion['protocols']) . "\n";
            echo "</pre>";
        } else {
            echo "<span class='error'>❌ cURL is NOT installed</span><br>";
            echo "<p>Install with: <code>sudo apt-get install php-curl</code></p>";
        }
        ?>
    </div>
    
    <div class="section">
        <h2>3. config.php File</h2>
        <?php
        $configPath = __DIR__ . '/config.php';
        if (file_exists($configPath)) {
            echo "<span class='success'>✅ config.php exists</span><br>";
            
            require_once $configPath;
            
            if (defined('OPENAI_API_KEY')) {
                $key = OPENAI_API_KEY;
                $keyLength = strlen($key);
                $keyPrefix = substr($key, 0, 7);
                
                if ($keyLength > 20 && strpos($key, 'sk-') === 0) {
                    echo "<span class='success'>✅ API key looks valid</span><br>";
                    echo "Key length: $keyLength characters<br>";
                    echo "Key prefix: $keyPrefix...<br>";
                } else {
                    echo "<span class='error'>❌ API key format looks wrong</span><br>";
                    echo "Key length: $keyLength characters<br>";
                    echo "Expected format: sk-...<br>";
                }
            } else {
                echo "<span class='error'>❌ OPENAI_API_KEY not defined in config.php</span>";
            }
        } else {
            echo "<span class='error'>❌ config.php does NOT exist</span><br>";
            echo "<p>Create it with:</p>";
            echo "<pre>&lt;?php\ndefine('OPENAI_API_KEY', 'sk-your-key-here');\n?&gt;</pre>";
        }
        ?>
    </div>
    
    <div class="section">
        <h2>4. File Permissions</h2>
        <?php
        $files = ['api-proxy.php', 'config.php', '.htaccess'];
        foreach ($files as $file) {
            $path = __DIR__ . '/' . $file;
            if (file_exists($path)) {
                $perms = substr(sprintf('%o', fileperms($path)), -4);
                echo "$file: <span class='success'>$perms</span><br>";
            } else {
                echo "$file: <span class='warning'>Not found</span><br>";
            }
        }
        ?>
    </div>
    
    <div class="section">
        <h2>5. Internet Connectivity</h2>
        <?php
        if (function_exists('curl_init')) {
            $ch = curl_init('https://www.google.com');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_NOBODY, true);
            $result = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
            
            if ($httpCode == 200 || $httpCode == 301) {
                echo "<span class='success'>✅ Can reach internet</span>";
            } else {
                echo "<span class='error'>❌ Cannot reach internet</span><br>";
                echo "Error: $error<br>";
                echo "HTTP Code: $httpCode";
            }
        }
        ?>
    </div>
    
    <div class="section">
        <h2>6. OpenAI API Test</h2>
        <?php
        if (function_exists('curl_init') && file_exists($configPath)) {
            require_once $configPath;
            
            if (defined('OPENAI_API_KEY')) {
                $apiKey = OPENAI_API_KEY;
                
                $ch = curl_init('https://api.openai.com/v1/chat/completions');
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST => true,
                    CURLOPT_HTTPHEADER => [
                        'Authorization: Bearer ' . $apiKey,
                        'Content-Type: application/json'
                    ],
                    CURLOPT_POSTFIELDS => json_encode([
                        'model' => 'gpt-4o-mini',
                        'messages' => [
                            ['role' => 'user', 'content' => 'Say "test successful" in 2 words']
                        ],
                        'max_tokens' => 10
                    ]),
                    CURLOPT_TIMEOUT => 30,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1  // Force HTTP/1.1
                ]);
                
                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $error = curl_error($ch);
                curl_close($ch);
                
                if ($httpCode == 200) {
                    echo "<span class='success'>✅ OpenAI API is working!</span><br>";
                    $data = json_decode($response, true);
                    if (isset($data['choices'][0]['message']['content'])) {
                        echo "Response: " . $data['choices'][0]['message']['content'];
                    }
                } else {
                    echo "<span class='error'>❌ OpenAI API failed</span><br>";
                    echo "HTTP Code: $httpCode<br>";
                    if ($error) {
                        echo "cURL Error: $error<br>";
                    }
                    echo "<pre>" . htmlspecialchars(substr($response, 0, 500)) . "</pre>";
                }
            } else {
                echo "<span class='warning'>⚠️  Skipped (no API key)</span>";
            }
        } else {
            echo "<span class='warning'>⚠️  Skipped (requirements not met)</span>";
        }
        ?>
    </div>
    
    <div class="section">
        <h2>7. Server Information</h2>
        <pre><?php
        echo "Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
        echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
        echo "Script Path: " . __DIR__ . "\n";
        echo "PHP SAPI: " . php_sapi_name() . "\n";
        ?></pre>
    </div>
    
    <div class="section">
        <h2>📋 Summary</h2>
        <?php
        $issues = [];
        
        if (!function_exists('curl_init')) {
            $issues[] = "Install cURL: sudo apt-get install php-curl";
        }
        
        if (!file_exists($configPath)) {
            $issues[] = "Create config.php with your API key";
        }
        
        if (empty($issues)) {
            echo "<span class='success'>✅ Everything looks good!</span><br>";
            echo "<p>Your backend should be working. Test it with:</p>";
            echo "<pre>curl -X POST https://atlaswebx.com/backend/api-proxy.php \\
  -H \"Content-Type: application/json\" \\
  -d '{\"model\":\"gpt-4\",\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}'</pre>";
        } else {
            echo "<span class='error'>❌ Issues found:</span><br><ul>";
            foreach ($issues as $issue) {
                echo "<li>$issue</li>";
            }
            echo "</ul>";
        }
        ?>
    </div>
    
    <p style="margin-top: 40px; color: #666;">
        ⚠️ <strong>Security:</strong> Delete this file after testing!<br>
        <code>rm test-server.php</code>
    </p>
</body>
</html>
