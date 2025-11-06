# Simple PHP Backend - Just Login & Credits

No payment processing - you handle that separately.

## 📁 Files You Need

```
lenoir.app/
├── simple-config.php           # Configuration
├── auth.php                    # Authentication (reuse existing)
├── jwt.php                     # JWT tokens (reuse existing)
├── simple-database.sql         # Simple database (3 tables only)
└── api/
    ├── auth/
    │   ├── signup.php          # Create account
    │   ├── login.php           # Login
    │   └── verify.php          # Verify token
    └── credits/
        ├── index.php           # Get credits
        ├── use.php             # Use credits
        └── add.php             # Add credits (after payment)
```

## 🚀 Quick Setup

### 1. Upload Files
Upload to your server via FTP/cPanel

### 2. Create Database
```sql
-- Run simple-database.sql
mysql -u root -p < simple-database.sql
```

### 3. Configure
Edit `simple-config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'lenoir_db');
define('DB_USER', 'your_user');
define('DB_PASS', 'your_password');
define('JWT_SECRET', 'random-secret-key');
```

## 📡 API Endpoints

### Sign Up
```bash
POST https://lenoir.app/api/auth/signup.php
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "credits": 0
  },
  "token": "eyJhbGci..."
}
```

### Login
```bash
POST https://lenoir.app/api/auth/login.php
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Credits
```bash
GET https://lenoir.app/api/credits/index.php
Authorization: Bearer {token}

Response:
{
  "credits": 500
}
```

### Use Credits
```bash
POST https://lenoir.app/api/credits/use.php
Authorization: Bearer {token}
{
  "amount": 3,
  "metadata": {"model": "gpt-4"}
}
```

### Add Credits (After Your Payment)
```bash
POST https://lenoir.app/api/credits/add.php
Authorization: Bearer {token}
{
  "amount": 500,
  "note": "Purchased 500 credits"
}
```

## 💡 How You Handle Payment

**Your Payment Flow:**
```
1. User buys credits on your website
   (You use PayPal, Stripe, or whatever)

2. After successful payment, call:
   POST /api/credits/add.php
   {
     "amount": 500,
     "note": "PayPal payment #12345"
   }

3. Credits added to user account

4. User can use credits in app
```

## 🎯 Simple Workflow

**User Journey:**
```
1. Sign up → GET 0 credits
2. Buy credits on website (your payment system)
3. Credits added via API
4. Login to app
5. Use AI features (credits deducted)
```

## 📊 Database Tables

**Only 3 tables:**
- `users` - Email, password, credits
- `sessions` - JWT tokens
- `credit_history` - Usage tracking (optional)

**No payment tables!** You handle that separately.

## 🔐 Security

- ✅ JWT authentication
- ✅ Password hashing
- ✅ SQL injection protection
- ✅ CORS headers
- ✅ Token expiration

## 🧪 Test It

```bash
# Sign up
curl -X POST https://lenoir.app/api/auth/signup.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get token from response, then:
curl https://lenoir.app/api/credits/index.php \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ✅ That's It!

**What this gives you:**
- User accounts (email/password)
- JWT authentication
- Credit system
- Usage tracking

**What you handle:**
- Payment processing (PayPal, Stripe, etc.)
- Adding credits after payment
- Pricing/plans
- Refunds

Simple and clean! 🎉
