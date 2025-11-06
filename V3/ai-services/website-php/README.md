# PHP Backend for Lenoir.app

Complete PHP backend system for authentication, subscriptions, and credit management.

## 📁 File Structure

```
website-php/
├── config.php                          # Configuration
├── auth.php                            # Authentication class
├── jwt.php                             # JWT implementation
├── database.sql                        # Database schema
├── api/
│   ├── auth/
│   │   ├── signup.php                  # POST /api/auth/signup
│   │   ├── login.php                   # POST /api/auth/login
│   │   └── verify.php                  # POST /api/auth/verify
│   ├── credits/
│   │   ├── index.php                   # GET /api/credits
│   │   └── use.php                     # POST /api/credits/use
│   └── subscription/
│       ├── index.php                   # GET /api/subscription
│       └── create-checkout.php         # POST /api/subscription/create-checkout
├── webhook/
│   └── stripe.php                      # POST /webhook/stripe
└── README.md                           # This file
```

## 🚀 Installation

### 1. Upload Files to Server

Upload all files to your web server at `lenoir.app`:

```bash
# Via FTP/SFTP
/public_html/
  ├── config.php
  ├── auth.php
  ├── jwt.php
  ├── api/
  ├── webhook/
  └── ...
```

### 2. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Run the database.sql file
mysql -u root -p < database.sql
```

Or use phpMyAdmin:
1. Open phpMyAdmin
2. Create database `lenoir_db`
3. Import `database.sql`

### 3. Configure Settings

Edit `config.php`:

```php
// Database
define('DB_HOST', 'localhost');
define('DB_NAME', 'lenoir_db');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');

// JWT Secret (generate random string)
define('JWT_SECRET', 'your-super-secret-jwt-key');

// Stripe Keys
define('STRIPE_SECRET_KEY', 'sk_live_...');
define('STRIPE_PUBLISHABLE_KEY', 'pk_live_...');
define('STRIPE_WEBHOOK_SECRET', 'whsec_...');

// Stripe Price IDs (from Stripe Dashboard)
define('STRIPE_PRICE_PRO', 'price_...');
define('STRIPE_PRICE_ENTERPRISE', 'price_...');
```

### 4. Install Stripe PHP Library

```bash
composer require stripe/stripe-php
```

Or download manually from: https://github.com/stripe/stripe-php

### 5. Setup Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://lenoir.app/webhook/stripe.php`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret to `config.php`

### 6. Configure .htaccess (Optional)

For clean URLs:

```apache
# .htaccess
RewriteEngine On
RewriteRule ^api/(.*)$ api/$1.php [L]
```

## 📡 API Endpoints

### Authentication

**Sign Up**
```bash
POST https://lenoir.app/api/auth/signup.php
Content-Type: application/json

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
    "plan": "free",
    "credits": 10
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 2592000000
}
```

**Login**
```bash
POST https://lenoir.app/api/auth/login.php
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Verify Token**
```bash
POST https://lenoir.app/api/auth/verify.php
Authorization: Bearer {token}
```

### Credits

**Get Credits**
```bash
GET https://lenoir.app/api/credits/index.php
Authorization: Bearer {token}

Response:
{
  "credits": 500,
  "plan": "pro"
}
```

**Use Credits**
```bash
POST https://lenoir.app/api/credits/use.php
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 3,
  "metadata": {
    "model": "gpt-4",
    "messageId": "msg_123"
  }
}

Response:
{
  "success": true,
  "remainingCredits": 497,
  "used": 3
}
```

### Subscription

**Get Subscription**
```bash
GET https://lenoir.app/api/subscription/index.php
Authorization: Bearer {token}

Response:
{
  "plan": "pro",
  "planName": "Pro",
  "credits": 500,
  "price": 9,
  "status": "active",
  "renewsAt": "2025-11-27 00:00:00"
}
```

**Create Checkout Session**
```bash
POST https://lenoir.app/api/subscription/create-checkout.php
Authorization: Bearer {token}
Content-Type: application/json

{
  "plan": "pro"
}

Response:
{
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_..."
}
```

## 🔐 Security

### HTTPS Required
All API calls must use HTTPS in production.

### CORS Configuration
Update `config.php` to restrict origins:

```php
// Only allow your domain
header('Access-Control-Allow-Origin: https://lenoir.app');
```

### JWT Secret
Generate a strong random secret:

```bash
openssl rand -base64 32
```

### Database Security
- Use strong passwords
- Limit database user permissions
- Enable SSL for database connections

## 🧪 Testing

### Test Authentication
```bash
curl -X POST https://lenoir.app/api/auth/signup.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Test Credits
```bash
curl https://lenoir.app/api/credits/index.php \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Database Maintenance

### View Users
```sql
SELECT id, email, plan, credits FROM users;
```

### View Credit Usage
```sql
SELECT u.email, SUM(ch.amount) as total_used
FROM credit_history ch
JOIN users u ON ch.user_id = u.id
WHERE ch.type = 'usage'
GROUP BY u.email;
```

### Monthly Revenue
```sql
SELECT 
  DATE_FORMAT(created_at, '%Y-%m') as month,
  COUNT(*) as subscriptions,
  SUM(CASE WHEN plan = 'pro' THEN 9 WHEN plan = 'enterprise' THEN 49 ELSE 0 END) as revenue
FROM subscriptions
WHERE status = 'active'
GROUP BY month;
```

## 🐛 Troubleshooting

### "Database connection failed"
- Check database credentials in `config.php`
- Ensure MySQL is running
- Verify database exists

### "Invalid token"
- Check JWT_SECRET matches
- Token may be expired
- Verify Authorization header format

### "Stripe webhook failed"
- Verify webhook secret
- Check endpoint URL
- Review Stripe webhook logs

## 📝 Deployment Checklist

- [ ] Upload all files
- [ ] Create database
- [ ] Configure config.php
- [ ] Install Stripe library
- [ ] Setup Stripe webhook
- [ ] Test all endpoints
- [ ] Enable HTTPS
- [ ] Set production Stripe keys
- [ ] Configure CORS
- [ ] Setup monitoring

## 🔄 Updates

To update:
1. Backup database
2. Upload new files
3. Run any new SQL migrations
4. Test thoroughly

## 📞 Support

For issues, check:
- PHP error logs
- Database logs
- Stripe webhook logs
- Browser console

## 🎯 Next Steps

1. **Frontend**: Create login/signup pages
2. **Pricing Page**: Display plans with Stripe checkout
3. **Dashboard**: Show user credits and usage
4. **Deep Link**: Implement `lenoir://auth?token=xxx`
5. **Analytics**: Track user behavior

Your PHP backend is ready for production! 🚀
