# Find Your Bitbucket Username

For API token authentication, you need your **Bitbucket username** (not email).

## Quick Check:

1. Go to: https://bitbucket.org/account/settings/
2. Look at the URL or the "Username" field
3. Your username is what appears in the URL: `https://bitbucket.org/YOUR_USERNAME/`

## Current Configuration:

I've set the username to: **`lenoir`**

If this is incorrect, update it in `push-to-atlas.sh` on line 19:
```bash
BB_USERNAME="your-actual-username"
```

## Common Usernames:

- If you own the `lenoir-openai` workspace: username might be `lenoir` or similar
- If someone else owns it: you need your personal username
- Check your profile: https://bitbucket.org/account/settings/

## After Confirming Username:

Run:
```bash
./push-to-atlas.sh
```
