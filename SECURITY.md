# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of AtlaswebX seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:
- Open a public GitHub issue
- Discuss the vulnerability in public forums, social media, or other public channels

### Please DO:
1. **Email us directly** at security@atlaswebx.com (or create a private security advisory on GitHub)
2. **Provide detailed information** including:
   - Type of vulnerability
   - Full paths of source file(s) related to the vulnerability
   - Location of the affected source code (tag/branch/commit or direct URL)
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the issue, including how an attacker might exploit it

### What to expect:
- **Acknowledgment**: We'll acknowledge receipt of your vulnerability report within 48 hours
- **Updates**: We'll send you regular updates about our progress
- **Timeline**: We aim to patch critical vulnerabilities within 7 days
- **Credit**: With your permission, we'll publicly credit you for the discovery

## Security Best Practices for Users

### API Keys
- Never commit your `.env` file to version control
- Use environment variables for sensitive data
- Rotate API keys regularly
- Use separate API keys for development and production

### Electron Security
- Keep Electron and dependencies up to date
- Don't disable security features without understanding the implications
- Be cautious when loading remote content
- Validate and sanitize user input

### Building from Source
- Only download from official sources
- Verify checksums when available
- Review code changes in pull requests before merging

## Known Security Considerations

### WebView Security
- WebViews are sandboxed by default
- Remote content is loaded in isolated contexts
- Node integration is disabled in WebViews

### API Communication
- All API requests use HTTPS
- API keys are stored securely using electron-store
- No sensitive data is logged

### Auto-Updates
- Currently, auto-updates are not implemented
- Manual updates are recommended from official releases only

## Security Updates

Security updates will be released as patch versions and announced via:
- GitHub Security Advisories
- Release notes
- Project README

## Scope

This security policy applies to:
- The AtlaswebX application
- Official plugins and extensions
- Backend services (if applicable)

Out of scope:
- Third-party websites accessed through the browser
- User-installed extensions
- Modified or forked versions

## Bug Bounty Program

We currently do not have a bug bounty program, but we deeply appreciate security researchers who responsibly disclose vulnerabilities.

## Contact

For security concerns, contact:
- **Email**: security@atlaswebx.dev
- **GitHub**: Create a private security advisory

For general questions, use GitHub Issues or Discussions.

---

Thank you for helping keep AtlaswebX and our users safe!
