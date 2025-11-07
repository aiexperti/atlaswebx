<?php
/**
 * Configuration file for API Proxy
 * 
 * IMPORTANT: 
 * 1. Rename this file to config.php
 * 2. Add config.php to .gitignore
 * 3. Never commit config.php to version control
 */

// Your OpenAI API Key
define('OPENAI_API_KEY', 'sk-your-api-key-here');

// Optional: Add authentication token
define('APP_SECRET', 'your-secret-key-for-token-verification');

// Optional: Rate limiting settings
define('RATE_LIMIT_ENABLED', true);
define('RATE_LIMIT_MAX_REQUESTS', 100); // Per hour
define('RATE_LIMIT_WINDOW', 3600); // 1 hour in seconds

// Optional: Logging
define('USAGE_LOGGING_ENABLED', true);

?>
