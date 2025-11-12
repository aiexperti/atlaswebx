# AtlaswebX Website

Official website for AtlaswebX - AI-Powered Web Browser

## 🌐 Live Site

**Domain**: atlaswebx.com (to be configured)

## 📁 Files

- `index.html` - Main landing page
- `style.css` - Styles and responsive design
- `script.js` - Interactive features and animations
- `README.md` - This file

## 🚀 Deployment Options

### Option 1: GitHub Pages (Free)

1. **Create gh-pages branch**:
```bash
git checkout --orphan gh-pages
git rm -rf .
cp -r website/* .
git add .
git commit -m "Deploy website"
git push origin gh-pages
```

2. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: Deploy from branch
   - Branch: gh-pages → / (root)
   - Save

3. **Custom Domain**:
   - Add `CNAME` file with: `atlaswebx.com`
   - Configure DNS:
     ```
     A     @     185.199.108.153
     A     @     185.199.109.153
     A     @     185.199.110.153
     A     @     185.199.111.153
     CNAME www   aiexperti.github.io
     ```

### Option 2: Netlify (Recommended)

1. **Connect Repository**:
   - Go to https://netlify.com
   - New site from Git
   - Connect GitHub
   - Select repository

2. **Build Settings**:
   - Build command: (leave empty)
   - Publish directory: `website`

3. **Custom Domain**:
   - Domain settings → Add custom domain
   - Enter: `atlaswebx.com`
   - Follow DNS configuration

### Option 3: Vercel

1. **Import Project**:
   - Go to https://vercel.com
   - Import Git Repository
   - Select repository

2. **Settings**:
   - Root Directory: `website`
   - Framework: Other

3. **Custom Domain**:
   - Settings → Domains
   - Add: `atlaswebx.com`

### Option 4: Cloudflare Pages

1. **Create Project**:
   - Go to Cloudflare Pages
   - Connect GitHub
   - Select repository

2. **Build Settings**:
   - Build output: `website`

3. **Custom Domain**:
   - Custom domains → Set up
   - Add: `atlaswebx.com`

## 🎨 Customization

### Images Needed

Create and add these images to the `website/` folder:

1. **logo.png** (200x200px)
   - AtlaswebX logo
   - Transparent background
   - PNG format

2. **favicon.png** (32x32px)
   - Browser favicon
   - PNG format

3. **screenshot.png** (1200x800px)
   - Main browser screenshot
   - Hero section
   - High quality

4. **screenshot-browser.png** (800x600px)
   - Browser interface
   - Clean and clear

5. **screenshot-ai.png** (800x600px)
   - AI assistant sidebar
   - Show conversation

6. **screenshot-settings.png** (800x600px)
   - Settings page
   - Customization options

7. **og-image.png** (1200x630px)
   - Social media preview
   - Twitter/Facebook cards

### Colors

Current theme (can be changed in `style.css`):
```css
--primary-color: #667eea;    /* Purple */
--secondary-color: #764ba2;  /* Dark purple */
--accent-color: #f093fb;     /* Pink */
```

### Content

Edit `index.html` to update:
- Hero title and description
- Features list
- Download links
- Documentation links
- Footer information

## 📊 Analytics (Optional)

### Google Analytics

Add before `</head>` in `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Plausible Analytics (Privacy-friendly)

Add before `</head>`:
```html
<script defer data-domain="atlaswebx.com" src="https://plausible.io/js/script.js"></script>
```

## 🔧 Features

### Included

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Smooth scrolling
- ✅ Animated sections
- ✅ Mobile menu
- ✅ OS detection for download button
- ✅ SEO optimized
- ✅ Social media meta tags
- ✅ Fast loading
- ✅ Accessible

### Interactive Elements

- Hamburger menu for mobile
- Smooth scroll to sections
- Hover effects on cards
- Animated elements on scroll
- Active nav highlighting
- Download button tracking

## 🎯 SEO Optimization

### Meta Tags

Already included:
- Title and description
- Keywords
- Open Graph (Facebook)
- Twitter Cards
- Canonical URL

### Sitemap

Create `sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://atlaswebx.com/</loc>
    <lastmod>2025-11-12</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

### robots.txt

Create `robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://atlaswebx.com/sitemap.xml
```

## 📱 Mobile Responsive

Breakpoints:
- Desktop: > 768px
- Tablet: 768px
- Mobile: < 768px

All sections adapt to screen size.

## 🚀 Performance

### Optimization Tips

1. **Compress images**:
   - Use WebP format
   - Optimize with TinyPNG
   - Max 200KB per image

2. **Minify files**:
   ```bash
   # CSS
   npx cssnano style.css style.min.css
   
   # JS
   npx terser script.js -o script.min.js
   ```

3. **Enable caching**:
   - Add `.htaccess` for Apache
   - Or configure in Netlify/Vercel

4. **CDN**:
   - Cloudflare (free)
   - Automatic with Netlify/Vercel

## 🔒 Security

### HTTPS

All hosting options provide free SSL:
- GitHub Pages: Automatic
- Netlify: Automatic
- Vercel: Automatic
- Cloudflare: Automatic

### Headers

Add security headers (in Netlify `_headers` file):
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
```

## 📈 Launch Checklist

- [ ] Add all images (logo, screenshots, favicon)
- [ ] Update download links to actual releases
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Add analytics (optional)
- [ ] Test on mobile devices
- [ ] Test all links
- [ ] Optimize images
- [ ] Create sitemap
- [ ] Submit to Google Search Console
- [ ] Share on social media

## 🆘 Troubleshooting

### Images not loading

- Check file paths are correct
- Ensure images are in `website/` folder
- Use relative paths: `./image.png`

### Custom domain not working

- Wait 24-48 hours for DNS propagation
- Check DNS records are correct
- Clear browser cache
- Try incognito mode

### Mobile menu not working

- Check JavaScript is loaded
- Check console for errors
- Ensure `script.js` is linked correctly

## 📞 Support

- **GitHub**: https://github.com/aiexperti/atlaswebx
- **Issues**: https://github.com/aiexperti/atlaswebx/issues
- **Discussions**: https://github.com/aiexperti/atlaswebx/discussions

---

**Status**: Ready for deployment  
**Version**: 1.0.0  
**Last Updated**: November 12, 2025
