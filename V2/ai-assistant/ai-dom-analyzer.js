/**
 * AI DOM Analyzer - Master HTML/DOM Analysis Engine
 * Extracts structured data, identifies patterns, and understands page structure
 */

class AIDOMAnalyzer {
    constructor() {
        this.parser = new DOMParser();
    }

    /**
     * Master analysis - extract everything from HTML
     */
    analyzeHTML(html) {
        try {
            const doc = this.parser.parseFromString(html, 'text/html');
            
            return {
                structure: this.analyzeStructure(doc),
                content: this.extractContent(doc),
                interactive: this.findInteractiveElements(doc),
                media: this.extractMedia(doc),
                data: this.extractStructuredData(doc),
                layout: this.analyzeLayout(doc),
                metadata: this.extractMetadata(doc)
            };
        } catch (error) {
            console.error('DOM analysis failed:', error);
            return this.getEmptyAnalysis();
        }
    }

    /**
     * Analyze page structure and hierarchy
     */
    analyzeStructure(doc) {
        const structure = {
            semantic: {
                header: this.findElements(doc, 'header, [role="banner"]'),
                nav: this.findElements(doc, 'nav, [role="navigation"]'),
                main: this.findElements(doc, 'main, [role="main"]'),
                article: this.findElements(doc, 'article'),
                section: this.findElements(doc, 'section'),
                aside: this.findElements(doc, 'aside, [role="complementary"]'),
                footer: this.findElements(doc, 'footer, [role="contentinfo"]')
            },
            headings: this.extractHeadingHierarchy(doc),
            landmarks: this.findLandmarks(doc),
            containers: this.findContainers(doc)
        };
        
        return structure;
    }

    /**
     * Extract all content (text, headings, paragraphs)
     */
    extractContent(doc) {
        return {
            title: doc.title || '',
            headings: {
                h1: this.findElements(doc, 'h1'),
                h2: this.findElements(doc, 'h2'),
                h3: this.findElements(doc, 'h3'),
                h4: this.findElements(doc, 'h4'),
                h5: this.findElements(doc, 'h5'),
                h6: this.findElements(doc, 'h6')
            },
            paragraphs: this.findElements(doc, 'p'),
            lists: {
                ordered: this.findElements(doc, 'ol'),
                unordered: this.findElements(doc, 'ul'),
                items: this.findElements(doc, 'li')
            },
            quotes: this.findElements(doc, 'blockquote, q'),
            code: this.findElements(doc, 'code, pre'),
            emphasis: this.findElements(doc, 'strong, b, em, i, mark')
        };
    }

    /**
     * Find all interactive elements
     */
    findInteractiveElements(doc) {
        return {
            buttons: this.findElements(doc, 'button, [role="button"], input[type="button"], input[type="submit"]'),
            links: this.findElements(doc, 'a[href]').map(el => ({
                ...el,
                href: this.getAttr(doc, el.selector, 'href'),
                target: this.getAttr(doc, el.selector, 'target'),
                external: this.isExternalLink(this.getAttr(doc, el.selector, 'href'))
            })),
            forms: this.findElements(doc, 'form').map(el => ({
                ...el,
                action: this.getAttr(doc, el.selector, 'action'),
                method: this.getAttr(doc, el.selector, 'method')
            })),
            inputs: this.findElements(doc, 'input, textarea, select').map(el => ({
                ...el,
                type: this.getAttr(doc, el.selector, 'type'),
                name: this.getAttr(doc, el.selector, 'name'),
                placeholder: this.getAttr(doc, el.selector, 'placeholder'),
                required: this.hasAttr(doc, el.selector, 'required')
            })),
            checkboxes: this.findElements(doc, 'input[type="checkbox"]'),
            radios: this.findElements(doc, 'input[type="radio"]'),
            selects: this.findElements(doc, 'select'),
            textareas: this.findElements(doc, 'textarea')
        };
    }

    /**
     * Extract all media elements
     */
    extractMedia(doc) {
        return {
            images: this.findElements(doc, 'img').map(el => {
                const element = doc.querySelector(el.selector);
                if (!element) return { ...el, src: '', alt: '' };
                
                // Try multiple sources for image URL
                let src = element.getAttribute('src') || 
                         element.getAttribute('data-src') ||
                         element.getAttribute('data-lazy-src') ||
                         element.getAttribute('data-original') ||
                         element.getAttribute('data-thumb') ||
                         element.style.backgroundImage?.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1] ||
                         '';
                
                // For YouTube thumbnails
                if (!src && element.closest('ytd-thumbnail, #thumbnail')) {
                    const ytImg = element.closest('ytd-thumbnail, #thumbnail')?.querySelector('img');
                    if (ytImg) {
                        src = ytImg.src || ytImg.getAttribute('data-src') || '';
                    }
                }
                
                return {
                    ...el,
                    src: src,
                    alt: element.getAttribute('alt') || '',
                    width: element.getAttribute('width') || '',
                    height: element.getAttribute('height') || '',
                    loading: element.getAttribute('loading') || ''
                };
            }),
            videos: this.findElements(doc, 'video').map(el => ({
                ...el,
                src: this.getAttr(doc, el.selector, 'src'),
                poster: this.getAttr(doc, el.selector, 'poster'),
                controls: this.hasAttr(doc, el.selector, 'controls')
            })),
            audio: this.findElements(doc, 'audio').map(el => ({
                ...el,
                src: this.getAttr(doc, el.selector, 'src'),
                controls: this.hasAttr(doc, el.selector, 'controls')
            })),
            iframes: this.findElements(doc, 'iframe').map(el => ({
                ...el,
                src: this.getAttr(doc, el.selector, 'src'),
                title: this.getAttr(doc, el.selector, 'title'),
                youtube: this.getAttr(doc, el.selector, 'src')?.includes('youtube'),
                vimeo: this.getAttr(doc, el.selector, 'src')?.includes('vimeo')
            })),
            svg: this.findElements(doc, 'svg'),
            canvas: this.findElements(doc, 'canvas')
        };
    }

    /**
     * Extract structured data (JSON-LD, microdata, etc.)
     */
    extractStructuredData(doc) {
        const data = {
            jsonLd: [],
            microdata: [],
            openGraph: {},
            twitter: {},
            schema: []
        };

        // JSON-LD
        const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
        jsonLdScripts.forEach(script => {
            try {
                data.jsonLd.push(JSON.parse(script.textContent));
            } catch (e) {}
        });

        // Open Graph
        doc.querySelectorAll('meta[property^="og:"]').forEach(meta => {
            const property = meta.getAttribute('property');
            const content = meta.getAttribute('content');
            if (property && content) {
                data.openGraph[property.replace('og:', '')] = content;
            }
        });

        // Twitter Cards
        doc.querySelectorAll('meta[name^="twitter:"]').forEach(meta => {
            const name = meta.getAttribute('name');
            const content = meta.getAttribute('content');
            if (name && content) {
                data.twitter[name.replace('twitter:', '')] = content;
            }
        });

        // Microdata (itemscope, itemprop)
        doc.querySelectorAll('[itemscope]').forEach(item => {
            const type = item.getAttribute('itemtype');
            const props = {};
            item.querySelectorAll('[itemprop]').forEach(prop => {
                const name = prop.getAttribute('itemprop');
                props[name] = prop.textContent?.trim() || prop.getAttribute('content');
            });
            data.microdata.push({ type, properties: props });
        });

        return data;
    }

    /**
     * Analyze layout patterns
     */
    analyzeLayout(doc) {
        return {
            grid: this.findElements(doc, '[class*="grid"], [style*="grid"], [style*="display: grid"]'),
            flex: this.findElements(doc, '[class*="flex"], [style*="flex"], [style*="display: flex"]'),
            cards: this.findElements(doc, '[class*="card"], .card, [class*="item"]'),
            columns: this.findElements(doc, '[class*="col"], [class*="column"]'),
            rows: this.findElements(doc, '[class*="row"]'),
            containers: this.findElements(doc, '[class*="container"], [class*="wrapper"]'),
            sidebars: this.findElements(doc, 'aside, [class*="sidebar"], [class*="side-bar"]'),
            modals: this.findElements(doc, '[role="dialog"], .modal, [class*="modal"]'),
            dropdowns: this.findElements(doc, '[role="menu"], .dropdown, [class*="dropdown"]'),
            tabs: this.findElements(doc, '[role="tablist"], [role="tab"], .tabs, [class*="tab"]'),
            accordions: this.findElements(doc, '[class*="accordion"], [class*="collapse"]')
        };
    }

    /**
     * Extract metadata
     */
    extractMetadata(doc) {
        const meta = {
            charset: '',
            viewport: '',
            description: '',
            keywords: '',
            author: '',
            canonical: '',
            favicon: '',
            language: doc.documentElement.lang || '',
            custom: {}
        };

        // Standard meta tags
        doc.querySelectorAll('meta').forEach(tag => {
            const name = tag.getAttribute('name');
            const property = tag.getAttribute('property');
            const content = tag.getAttribute('content');
            
            if (name === 'description') meta.description = content;
            else if (name === 'keywords') meta.keywords = content;
            else if (name === 'author') meta.author = content;
            else if (name === 'viewport') meta.viewport = content;
            else if (name && content) meta.custom[name] = content;
        });

        // Canonical URL
        const canonical = doc.querySelector('link[rel="canonical"]');
        if (canonical) meta.canonical = canonical.getAttribute('href');

        // Favicon
        const favicon = doc.querySelector('link[rel*="icon"]');
        if (favicon) meta.favicon = favicon.getAttribute('href');

        return meta;
    }

    /**
     * Extract heading hierarchy
     */
    extractHeadingHierarchy(doc) {
        const headings = [];
        doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
            headings.push({
                level: parseInt(h.tagName.substring(1)),
                text: h.textContent?.trim(),
                selector: this.createSelector(h),
                id: h.id || null
            });
        });
        return headings;
    }

    /**
     * Find ARIA landmarks
     */
    findLandmarks(doc) {
        const landmarks = [];
        doc.querySelectorAll('[role]').forEach(el => {
            const role = el.getAttribute('role');
            if (['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'search', 'form'].includes(role)) {
                landmarks.push({
                    role,
                    selector: this.createSelector(el),
                    label: el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')
                });
            }
        });
        return landmarks;
    }

    /**
     * Find container elements
     */
    findContainers(doc) {
        return this.findElements(doc, 'div, section, article, main, aside, nav, header, footer')
            .filter(el => el.text.length > 100) // Only meaningful containers
            .slice(0, 30);
    }

    /**
     * Generic element finder with info extraction
     */
    findElements(doc, selector) {
        const elements = [];
        try {
            doc.querySelectorAll(selector).forEach((el, index) => {
                if (index >= 50) return; // Limit to 50 per type
                
                elements.push({
                    tag: el.tagName.toLowerCase(),
                    selector: this.createSelector(el),
                    text: el.textContent?.trim().substring(0, 150) || '',
                    id: el.id || null,
                    classes: this.getClasses(el),
                    attributes: this.getRelevantAttributes(el)
                });
            });
        } catch (e) {
            console.warn('Failed to find elements:', selector, e);
        }
        return elements;
    }

    /**
     * Create precise CSS selector for element
     */
    createSelector(el) {
        // ID is most specific
        if (el.id) return '#' + el.id;
        
        // Classes (limit to 3 most relevant)
        const classes = this.getClasses(el).slice(0, 3);
        if (classes.length > 0) {
            return el.tagName.toLowerCase() + '.' + classes.join('.');
        }
        
        // Tag with nth-child if needed
        return el.tagName.toLowerCase();
    }

    /**
     * Get element classes as array
     */
    getClasses(el) {
        if (!el.className || typeof el.className !== 'string') return [];
        return el.className.split(' ')
            .filter(c => c && c.length > 0 && c.length < 30)
            .filter(c => !c.match(/^[0-9]/)); // Exclude numeric-only classes
    }

    /**
     * Get relevant attributes
     */
    getRelevantAttributes(el) {
        const attrs = {};
        const relevant = ['href', 'src', 'alt', 'title', 'type', 'name', 'value', 'placeholder', 'data-*', 'aria-*'];
        
        Array.from(el.attributes || []).forEach(attr => {
            if (relevant.some(r => attr.name === r || attr.name.startsWith(r.replace('*', '')))) {
                attrs[attr.name] = attr.value;
            }
        });
        
        return attrs;
    }

    /**
     * Helper: get attribute value
     */
    getAttr(doc, selector, attr) {
        try {
            const el = doc.querySelector(selector);
            return el ? el.getAttribute(attr) : null;
        } catch {
            return null;
        }
    }

    /**
     * Helper: check if attribute exists
     */
    hasAttr(doc, selector, attr) {
        try {
            const el = doc.querySelector(selector);
            return el ? el.hasAttribute(attr) : false;
        } catch {
            return false;
        }
    }

    /**
     * Check if link is external
     */
    isExternalLink(href) {
        if (!href) return false;
        return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
    }

    /**
     * Get empty analysis structure
     */
    getEmptyAnalysis() {
        return {
            structure: { semantic: {}, headings: [], landmarks: [], containers: [] },
            content: { title: '', headings: {}, paragraphs: [], lists: {}, quotes: [], code: [], emphasis: [] },
            interactive: { buttons: [], links: [], forms: [], inputs: [], checkboxes: [], radios: [], selects: [], textareas: [] },
            media: { images: [], videos: [], audio: [], iframes: [], svg: [], canvas: [] },
            data: { jsonLd: [], microdata: [], openGraph: {}, twitter: {}, schema: [] },
            layout: { grid: [], flex: [], cards: [], columns: [], rows: [], containers: [], sidebars: [], modals: [], dropdowns: [], tabs: [], accordions: [] },
            metadata: { charset: '', viewport: '', description: '', keywords: '', author: '', canonical: '', favicon: '', language: '', custom: {} }
        };
    }

    /**
     * Smart content extraction - find main content automatically
     */
    extractMainContent(doc) {
        // Try semantic elements first
        let main = doc.querySelector('main, [role="main"], article');
        
        // Fallback: find largest text container
        if (!main) {
            const candidates = doc.querySelectorAll('div, section');
            let maxLength = 0;
            candidates.forEach(el => {
                const textLength = el.textContent?.trim().length || 0;
                if (textLength > maxLength) {
                    maxLength = textLength;
                    main = el;
                }
            });
        }
        
        return main ? {
            selector: this.createSelector(main),
            text: main.textContent?.trim(),
            html: main.innerHTML
        } : null;
    }

    /**
     * Detect page type (article, product, homepage, etc.)
     */
    detectPageType(analysis) {
        const types = [];
        
        if (analysis.structure.semantic.article.length > 0) types.push('article');
        if (analysis.interactive.forms.length > 0) types.push('form');
        if (analysis.layout.cards.length > 5) types.push('listing');
        if (analysis.media.images.length > 10) types.push('gallery');
        if (analysis.content.headings.h1.length === 1 && analysis.content.paragraphs.length > 5) types.push('blog-post');
        if (analysis.data.openGraph.type === 'product') types.push('product');
        if (analysis.structure.semantic.nav.length > 0 && analysis.structure.semantic.main.length === 0) types.push('homepage');
        
        return types.length > 0 ? types : ['generic'];
    }
}

// Export for use in renderer
if (typeof window !== 'undefined') {
    window.AIDOMAnalyzer = AIDOMAnalyzer;
}
