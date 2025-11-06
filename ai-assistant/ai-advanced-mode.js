/**
 * AI Advanced Mode - Complete UI Transformation System
 * Powered by GPT-5 for radical page redesigns and data extraction
 */

class AIAdvancedMode {
    constructor() {
        this.apiHandler = null;
        this.webEditor = null;
        this.engine = null;
    }

    /**
     * Initialize with API and Web Editor
     */
    initialize(apiHandler, webEditor) {
        this.apiHandler = apiHandler;
        this.webEditor = webEditor;
        
        // Initialize AI Engine for design workflow
        this.engine = new AIEngine();
        this.engine.initialize(apiHandler);
        
        console.log('🚀 Advanced Mode initialized with AI Engine');
    }

    /**
     * Process message in Advanced Mode - Multi-step cascading workflow
     * Creates a TWIN TAB with the transformed UI
     */
    async processAdvancedMessage(message, tab) {
        console.log('🚀 [ADVANCED MODE] Processing:', message);
        
        try {
            // Check if this is an analysis request (first step)
            const isAnalysisRequest = this.isAnalysisRequest(message);
            
            if (isAnalysisRequest) {
                // First step: Analyze and highlight the page
                const context = await this.webEditor.getPageContext();
                if (context.error) throw new Error('Failed to get page context: ' + context.error);
                return await this.analyzeAndHighlight(message, context);
            }

            // Get page context
            const context = await this.webEditor.getPageContext();
            if (context.error) throw new Error('Failed to get page context: ' + context.error);
            
            // Use AI Engine for transformation
            console.log('🎨 Using AI Engine for transformation...');
            const result = await this.engine.transform(message, context);
            
            return {
                ...result,
                mode: 'advanced',
                twinCreated: result.success
            };
            
        } catch (error) {
            console.error('❌ [ADVANCED MODE] Error:', error);
            await this.hideHaloEffect();
            return {
                success: false,
                error: error.message,
                mode: 'advanced'
            };
        }
    }

    /**
     * Show halo effect around the page
     */
    async showHaloEffect() {
        const { ipcRenderer } = require('electron');
        const code = `
            (function() {
                // Remove existing halo
                document.getElementById('ai-halo-effect')?.remove();
                
                // Create halo overlay
                const halo = document.createElement('div');
                halo.id = 'ai-halo-effect';
                halo.style.cssText = \`
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    z-index: 999998;
                    box-shadow: inset 0 0 100px 20px rgba(59, 130, 246, 0.3);
                    animation: halo-pulse 2s ease-in-out infinite;
                \`;
                
                const style = document.createElement('style');
                style.textContent = \`
                    @keyframes halo-pulse {
                        0%, 100% { box-shadow: inset 0 0 100px 20px rgba(59, 130, 246, 0.3); }
                        50% { box-shadow: inset 0 0 150px 30px rgba(139, 92, 246, 0.4); }
                    }
                \`;
                document.head.appendChild(style);
                document.body.appendChild(halo);
            })();
        `;
        await ipcRenderer.invoke('ai-execute-action', code);
    }

    /**
     * Hide halo effect
     */
    async hideHaloEffect() {
        const { ipcRenderer } = require('electron');
        const code = `document.getElementById('ai-halo-effect')?.remove();`;
        await ipcRenderer.invoke('ai-execute-action', code);
    }

    /**
     * Update progress bar in URL bar
     */
    async updateProgress(percent, message) {
        console.log(`📊 Progress: ${percent}% - ${message}`);
        
        // Update URL bar with progress
        const urlBar = document.getElementById('url-bar');
        if (urlBar) {
            // Create or update progress bar
            let progressBar = document.getElementById('ai-progress-bar');
            if (!progressBar) {
                progressBar = document.createElement('div');
                progressBar.id = 'ai-progress-bar';
                progressBar.style.cssText = `
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                    transition: width 0.3s ease;
                    border-radius: 0 2px 2px 0;
                    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                `;
                urlBar.style.position = 'relative';
                urlBar.appendChild(progressBar);
            }
            progressBar.style.width = `${percent}%`;
            
            // Update placeholder with message
            urlBar.placeholder = message;
            
            // Remove when complete
            if (percent >= 100) {
                setTimeout(() => {
                    progressBar?.remove();
                    urlBar.placeholder = 'Search or enter URL';
                }, 1000);
            }
        }
        
        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    /**
     * Extract page data using ai-dom-analyzer
     */
    async extractPageData(context) {
        // Use the comprehensive analysis from context
        const extracted = [];
        
        try {
            // Combine different types of content
            const allItems = [
                ...(context.layout?.cards || []),
                ...(context.content?.headings?.h2 || []),
                ...(context.content?.headings?.h3 || []),
                ...(context.interactive?.links || []).slice(0, 30),
                ...(context.media?.images || []).slice(0, 20)
            ];
            
            // Group related content into items
            const itemMap = new Map();
            
            allItems.forEach(item => {
                const key = item.selector || item.text?.substring(0, 50);
                if (!itemMap.has(key)) {
                    itemMap.set(key, {
                        title: item.text || '',
                        link: item.href || item.attributes?.href || '',
                        image: item.src || item.attributes?.src || '',
                        description: ''
                    });
                }
            });
            
            // Convert to array
            itemMap.forEach(item => {
                if (item.title || item.link || item.image) {
                    extracted.push(item);
                }
            });
            
            return extracted.slice(0, 50); // Limit to 50
            
        } catch (error) {
            console.error('Data extraction failed:', error);
            return [];
        }
    }

    /**
     * Check if message is requesting analysis (first step)
     */
    isAnalysisRequest(message) {
        const msg = message.toLowerCase();
        // If no specific transformation keywords, treat as analysis
        const transformKeywords = ['transform', 'change', 'redesign', 'rewrite', 'convert', 'make it', 'create'];
        const hasTransformKeyword = transformKeywords.some(kw => msg.includes(kw));
        
        // First message or analysis keywords
        return !hasTransformKeyword || msg.includes('analyze') || msg.includes('explain') || msg.includes('show me');
    }

    /**
     * Analyze page and highlight sections
     */
    async analyzeAndHighlight(message, context) {
        console.log('🔍 Analyzing page structure...');
        
        // Highlight page sections
        await this.highlightPageSections(context);
        
        // Build analysis report
        const analysis = this.buildAnalysisReport(context);
        
        return {
            success: true,
            message: analysis,
            mode: 'advanced',
            isAnalysis: true
        };
    }

    /**
     * Highlight different sections of the page
     */
    async highlightPageSections(context) {
        const { ipcRenderer } = require('electron');
        
        const highlightCode = `
            (function() {
                // Remove any existing highlights
                document.querySelectorAll('.ai-highlight-overlay').forEach(el => el.remove());
                
                const style = document.createElement('style');
                style.textContent = \`
                    .ai-highlight-overlay {
                        position: absolute !important;
                        pointer-events: none !important;
                        border: 2px solid !important;
                        z-index: 999999 !important;
                        box-sizing: border-box !important;
                    }
                    .ai-highlight-label {
                        position: absolute !important;
                        top: -24px !important;
                        left: 0 !important;
                        background: rgba(0,0,0,0.8) !important;
                        color: white !important;
                        padding: 4px 8px !important;
                        font-size: 12px !important;
                        font-weight: bold !important;
                        border-radius: 4px !important;
                        pointer-events: none !important;
                    }
                \`;
                document.head.appendChild(style);
                
                // Highlight sections with different colors
                const sections = [
                    { selector: 'header, [role="banner"]', color: '#3b82f6', label: 'Header' },
                    { selector: 'nav, [role="navigation"]', color: '#8b5cf6', label: 'Navigation' },
                    { selector: 'main, [role="main"]', color: '#10b981', label: 'Main Content' },
                    { selector: 'article', color: '#f59e0b', label: 'Article' },
                    { selector: 'aside, [role="complementary"]', color: '#ec4899', label: 'Sidebar' },
                    { selector: 'footer, [role="contentinfo"]', color: '#6366f1', label: 'Footer' }
                ];
                
                sections.forEach(({ selector, color, label }) => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach((el, index) => {
                        const rect = el.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0) {
                            const overlay = document.createElement('div');
                            overlay.className = 'ai-highlight-overlay';
                            overlay.style.cssText = \`
                                top: \${rect.top + window.scrollY}px;
                                left: \${rect.left + window.scrollX}px;
                                width: \${rect.width}px;
                                height: \${rect.height}px;
                                border-color: \${color} !important;
                            \`;
                            
                            const labelEl = document.createElement('div');
                            labelEl.className = 'ai-highlight-label';
                            labelEl.textContent = label + (elements.length > 1 ? \` \${index + 1}\` : '');
                            labelEl.style.background = color;
                            overlay.appendChild(labelEl);
                            
                            document.body.appendChild(overlay);
                        }
                    });
                });
                
                // Auto-remove after 10 seconds
                setTimeout(() => {
                    document.querySelectorAll('.ai-highlight-overlay').forEach(el => el.remove());
                }, 10000);
            })();
        `;
        
        await ipcRenderer.invoke('ai-execute-action', highlightCode);
    }

    /**
     * Build detailed analysis report
     */
    buildAnalysisReport(context) {
        const report = [];
        
        report.push('🔍 **Page Analysis Complete**\n');
        report.push(`**URL:** ${context.url}`);
        report.push(`**Title:** ${context.title}`);
        report.push(`**Page Type:** ${context.pageType?.join(', ') || 'Generic'}\n`);
        
        // Structure analysis
        report.push('📐 **Page Structure:**');
        if (context.structure?.semantic?.header?.length > 0) {
            report.push(`- Header sections: ${context.structure.semantic.header.length}`);
        }
        if (context.structure?.semantic?.nav?.length > 0) {
            report.push(`- Navigation menus: ${context.structure.semantic.nav.length}`);
        }
        if (context.structure?.semantic?.main?.length > 0) {
            report.push(`- Main content areas: ${context.structure.semantic.main.length}`);
        }
        if (context.structure?.semantic?.aside?.length > 0) {
            report.push(`- Sidebars: ${context.structure.semantic.aside.length}`);
        }
        if (context.structure?.semantic?.footer?.length > 0) {
            report.push(`- Footer sections: ${context.structure.semantic.footer.length}`);
        }
        report.push('');
        
        // Content analysis
        report.push('📝 **Content:**');
        const h1Count = context.content?.headings?.h1?.length || 0;
        const h2Count = context.content?.headings?.h2?.length || 0;
        const h3Count = context.content?.headings?.h3?.length || 0;
        report.push(`- Headings: ${h1Count} H1, ${h2Count} H2, ${h3Count} H3`);
        report.push(`- Paragraphs: ${context.content?.paragraphs?.length || 0}`);
        report.push(`- Links: ${context.interactive?.links?.length || 0}`);
        report.push('');
        
        // Media analysis
        report.push('🎨 **Media:**');
        report.push(`- Images: ${context.media?.images?.length || 0}`);
        report.push(`- Videos: ${context.media?.videos?.length || 0}`);
        report.push('');
        
        // Layout analysis
        report.push('🎯 **Layout Patterns:**');
        if (context.layout?.cards?.length > 0) {
            report.push(`- Card components: ${context.layout.cards.length}`);
        }
        if (context.layout?.grid?.length > 0) {
            report.push(`- Grid layouts: ${context.layout.grid.length}`);
        }
        if (context.layout?.flex?.length > 0) {
            report.push(`- Flexbox layouts: ${context.layout.flex.length}`);
        }
        report.push('');
        
        report.push('✨ **Highlighted sections are visible on the page for 10 seconds.**\n');
        report.push('💡 **Next:** Tell me how you want to transform this page!');
        report.push('Examples: "Transform into modern cards", "Make it minimal", "Dark mode dashboard"');
        
        return report.join('\n');
    }

    /**
     * Build complete transformed HTML from actions
     */
    async buildTransformedHTML(parsedResponse, originalContext, extractedData = null) {
        let transformedHTML = '';
        
        // Use provided extracted data or extract if action specified
        if (!extractedData) {
            const extractAction = parsedResponse.actions?.find(a => a.type === 'extractData');
            if (extractAction) {
                console.log('📦 Extracting data from original page...');
                extractedData = await this.extractDataFromPage(extractAction, originalContext);
                console.log('✅ Extracted data:', extractedData);
            }
        }
        
        // Step 2: Look for rewritePage action
        const rewriteAction = parsedResponse.actions?.find(a => a.type === 'rewritePage');
        
        if (rewriteAction && rewriteAction.value) {
            // Use the AI-generated HTML template
            transformedHTML = rewriteAction.value;
            
            // Step 3: Populate template with extracted data
            if (extractedData && extractedData.length > 0) {
                transformedHTML = this.populateTemplate(transformedHTML, extractedData);
            }
        } else {
            // Fallback: use original HTML with modifications
            transformedHTML = originalContext.bodyHtml || originalContext.html;
        }
        
        // Apply palette if present
        const paletteAction = parsedResponse.actions?.find(a => a.type === 'palette');
        let paletteCSS = '';
        if (paletteAction && paletteAction.value) {
            try {
                const palette = typeof paletteAction.value === 'string' 
                    ? JSON.parse(paletteAction.value) 
                    : paletteAction.value;
                const vars = Object.entries(palette).map(([k,v]) => `--ai-${k}: ${v};`).join(' ');
                paletteCSS = `:root { ${vars} }`;
            } catch (e) {}
        }
        
        // Apply globalCss if present
        const globalCssAction = parsedResponse.actions?.find(a => a.type === 'globalCss');
        const globalCSS = globalCssAction?.value || '';
        
        // Build complete standalone HTML document with ALL resources
        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="AI-transformed page with modern design">
    <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;">
    <title>${originalContext.title} - AI Transformed</title>
    
    <!-- TailwindCSS via CDN -->
    <script src="https://cdn.tailwindcss.com" crossorigin="anonymous"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '${paletteAction?.value?.primary || '#3b82f6'}',
                        accent: '${paletteAction?.value?.accent || '#8b5cf6'}',
                    }
                }
            }
        }
    </script>
    
    <!-- Google Fonts - Inter & Poppins -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" crossorigin="anonymous">
    
    <!-- Font Awesome 6 - Complete Icon Library -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" />
    
    <!-- Animate.css -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" crossorigin="anonymous" />
    
    <!-- AOS (Animate On Scroll) -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" crossorigin="anonymous">
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js" crossorigin="anonymous"></script>
    
    <style>
        /* CSS Variables from AI Palette */
        :root {
            ${paletteCSS.replace(':root {', '').replace('}', '')}
            --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-heading: 'Poppins', sans-serif;
        }
        
        /* Global Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html {
            scroll-behavior: smooth;
        }
        
        body {
            font-family: var(--font-primary);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background: var(--ai-background, #ffffff);
            color: var(--ai-text, #1a1a1a);
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-heading);
            font-weight: 700;
        }
        
        /* Custom AI Styles */
        ${globalCSS}
        
        /* Smooth Hover Effects */
        .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        /* Gradient Text */
        .gradient-text {
            background: linear-gradient(135deg, var(--ai-primary, #3b82f6), var(--ai-accent, #8b5cf6));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        /* Glass Effect */
        .glass {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        /* Loading Animation */
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
        
        .skeleton {
            animation: shimmer 2s infinite;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 1000px 100%;
        }
    </style>
</head>
<body>
    ${transformedHTML}
    
    <!-- AI Watermark Badge -->
    <div class="fixed bottom-6 right-6 z-50 group">
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer">
            <i class="fas fa-wand-magic-sparkles text-xl"></i>
            <span class="font-bold text-sm">AI Transformed</span>
        </div>
    </div>
    
    <!-- Initialize Libraries -->
    <script>
        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                offset: 100
            });
        }
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('skeleton');
                            observer.unobserve(img);
                        }
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
        }
        
        console.log('✨ AI Transformed Page - Powered by Advanced Mode');
    </script>
</body>
</html>`;

        
        return fullHTML;
    }

    /**
     * Create a twin tab with the transformed HTML
     * Writes to temp file and opens in new tab
     */
    async createTwinTab(originalContext, transformedHTML) {
        const { ipcRenderer } = require('electron');
        
        // Send HTML to main process to write temp file
        const result = await ipcRenderer.invoke('ai-create-twin-tab', {
            html: transformedHTML,
            title: originalContext.title + ' - AI Twin'
        });
        
        if (result.success) {
            console.log('✅ Twin tab created:', result.filePath);
        } else {
            console.error('❌ Failed to create twin tab:', result.error);
        }
    }

    /**
     * Build Advanced Mode prompt - emphasizes complete transformations
     */
    buildAdvancedPrompt(instruction, context) {
        return `🚀 ADVANCED MODE - GPT-5 Web Transformation System

You are an ELITE web transformation AI powered by GPT-5. You MUST create COMPLETELY NEW HTML from scratch.

🚨 CRITICAL RULES:
1. **NEVER return original HTML** - You must create 100% NEW HTML code
2. **ALWAYS use rewritePage action** - This is MANDATORY for transformations
3. **Design from scratch** - Imagine you're building a new website
4. **Use modern frameworks** - TailwindCSS classes, Font Awesome icons
5. **Make it beautiful** - Professional design, not a copy of the original

🔥 YOUR MISSION:
- Take the CONTENT from the original page (titles, images, text)
- Create a COMPLETELY NEW DESIGN using modern web standards
- Build BEAUTIFUL layouts with Tailwind, gradients, shadows, animations
- Make it look like a professional designer created it

🎨 AVAILABLE RESOURCES (Already loaded in twin tab):
- **TailwindCSS** - Use utility classes: bg-blue-500, text-white, flex, grid, etc.
- **Font Awesome Icons** - Use: <i class="fas fa-icon-name"></i>
- **Lucide Icons** - Use: <i data-lucide="icon-name"></i>
- **Inter Font** - Modern, professional font (already set as default)
- **Animate.css** - Use: animate__animated animate__fadeIn, etc.
- **Utility Classes** - .container, .card, .btn, .btn-primary, .grid, .grid-2, .grid-3, .space-y-4, etc.

📊 CURRENT PAGE ANALYSIS:
- URL: ${context.url}
- Title: ${context.title}
- Domain: ${context.domain}
- Viewport: ${context.viewport?.width}x${context.viewport?.height}
- Screenshot: ${context.screenshot ? 'AVAILABLE - Use for layout analysis' : 'Not available'}

🎯 DOM STRUCTURE (Top 50 elements):
${context.domStructure ? context.domStructure.slice(0, 50).map(el => 
    `${'  '.repeat(el.depth)}${el.selector} [${el.tag}]${el.text ? ' - "' + el.text.substring(0, 40) + '"' : ''}`
).join('\n') : 'Not available'}

📋 INTERACTIVE CONTENT:
- Buttons: ${context.buttons?.length || 0} found
- Links: ${context.links?.length || 0} found  
- Images: ${context.domStructure?.filter(el => el.tag === 'IMG').length || 0} found
- Forms: ${context.domStructure?.filter(el => el.tag === 'FORM').length || 0} found

💬 USER REQUEST: "${instruction}"

🎯 MANDATORY WORKFLOW:

**STEP 1: CREATE NEW HTML (REQUIRED)**
You MUST use the "rewritePage" action with COMPLETELY NEW HTML:
- Start with: <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
- Add header: <h1 class="text-6xl font-black text-gray-900 mb-8">
- Create grid: <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
- Add sample cards with images, titles, descriptions
- Use Tailwind classes: rounded-2xl, shadow-xl, hover:scale-105, etc.
- Add placeholder: <!-- DATA_ITEMS --> for real content

**STEP 2: EXAMPLE STRUCTURE**
<div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-12">
  <div class="max-w-7xl mx-auto">
    <h1 class="text-6xl font-black mb-4"><i class="fas fa-sparkles"></i> Title</h1>
    <div class="grid grid-cols-3 gap-8">
      <!-- 2-3 sample cards here -->
      <!-- DATA_ITEMS -->
    </div>
  </div>
</div>

**STEP 3: WHAT TO INCLUDE**
- Modern gradients (bg-gradient-to-r from-blue-500 to-purple-600)
- Shadows (shadow-xl, shadow-2xl)
- Rounded corners (rounded-2xl, rounded-3xl)
- Hover effects (hover:scale-105, hover:shadow-2xl)
- Icons (fas fa-heart, fas fa-star)
- Proper spacing (p-8, gap-8, mb-8)
- Responsive (grid-cols-1 md:grid-cols-3)

🔥 ADVANCED ACTION TYPES:
- extractData: Capture all content (value = JSON config with selectors and fields)
- rewritePage: Replace ENTIRE body HTML (value = complete HTML string with modern design)
- globalCss: Add persistent CSS (value = modern CSS with flexbox, grid, animations)
- palette: Apply color theme (value = JSON with background, surface, text, primary, accent)
- javascript: Execute custom JS for advanced interactions

📐 DESIGN GUIDELINES:
- Use modern CSS: flexbox, grid, gradients, shadows, backdrop-filter
- Responsive: mobile-first, fluid layouts
- Typography: modern font stacks, proper hierarchy
- Spacing: generous padding/margins, breathing room
- Colors: cohesive palettes, proper contrast
- Animations: subtle, smooth transitions

✨ RESPONSE FORMAT (JSON only, no other text):
{
  "explanation": "Clear description of transformation",
  "actions": [
    {
      "type": "extractData|rewritePage|globalCss|palette|javascript",
      "selector": "CSS selector (for extractData) or omit",
      "value": "JSON config, HTML string, or CSS/JS code",
      "description": "What this action does"
    }
  ],
  "saveAsRule": false
}

🎨 EXAMPLE TRANSFORMATIONS:

Request: "Transform into modern card grid"
{
  "explanation": "Creating beautiful Tailwind card grid with sample data to preview design",
  "actions": [
    {
      "type": "palette",
      "value": "{\"background\":\"#f8fafc\",\"surface\":\"#ffffff\",\"text\":\"#1e293b\",\"primary\":\"#3b82f6\",\"accent\":\"#8b5cf6\"}",
      "description": "Modern light theme"
    },
    {
      "type": "rewritePage",
      "value": "<div class='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-6'><div class='max-w-7xl mx-auto'><h1 class='text-5xl font-black text-gray-900 mb-4 flex items-center gap-4'><i class='fas fa-th-large text-blue-500'></i>Content Gallery</h1><p class='text-gray-600 mb-12 text-lg'>Beautifully transformed with AI</p><div class='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'><div class='bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 animate__animated animate__fadeInUp'><img src='https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400' class='w-full h-56 object-cover'/><div class='p-6'><h3 class='text-2xl font-bold text-gray-900 mb-3'>Sample Article Title</h3><p class='text-gray-600 mb-4'>This is a preview of how your content will look with beautiful modern design and Tailwind styling.</p><div class='flex items-center justify-between'><span class='text-sm text-gray-500'><i class='fas fa-user mr-2'></i>Author Name</span><a href='#' class='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors'><i class='fas fa-arrow-right mr-2'></i>Read</a></div></div></div><div class='bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 animate__animated animate__fadeInUp' style='animation-delay:0.1s'><img src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400' class='w-full h-56 object-cover'/><div class='p-6'><h3 class='text-2xl font-bold text-gray-900 mb-3'>Another Great Post</h3><p class='text-gray-600 mb-4'>Each card features smooth animations, hover effects, and professional spacing for the best user experience.</p><div class='flex items-center justify-between'><span class='text-sm text-gray-500'><i class='fas fa-clock mr-2'></i>5 min read</span><a href='#' class='bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors'><i class='fas fa-eye mr-2'></i>View</a></div></div></div><!-- DATA_ITEMS --></div></div></div>",
      "description": "Complete Tailwind layout with sample cards showing the design"
    }
  ],
  "saveAsRule": false
}

Request: "Make this a minimal reader view"
{
  "explanation": "Extracting article content and rebuilding as clean reader",
  "actions": [
    {
      "type": "extractData",
      "selector": "article, .content, main, h1, h2, p, img",
      "value": "{\\"selectors\\":[\\"h1\\",\\"h2\\",\\"h3\\",\\"p\\",\\"img\\"],\\"fields\\":{\\"title\\":\\"h1\\",\\"subtitle\\":\\"h2\\",\\"content\\":\\".content, article\\",\\"images\\":\\"img[src]\\"}}",
      "description": "Extract all article content"
    },
    {
      "type": "palette",
      "value": "{\\"background\\":\\"#fafafa\\",\\"surface\\":\\"#ffffff\\",\\"text\\":\\"#1a1a1a\\",\\"primary\\":\\"#2563eb\\"}",
      "description": "Clean color palette"
    },
    {
      "type": "rewritePage",
      "value": "<div style='max-width:680px;margin:80px auto;padding:40px 24px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif'><article style='background:var(--ai-surface);border-radius:12px;padding:48px;box-shadow:0 1px 3px rgba(0,0,0,0.1)'><h1 style='font-size:2.5rem;font-weight:700;line-height:1.2;margin-bottom:16px;color:var(--ai-text)'>Article Title</h1><p style='font-size:1.125rem;line-height:1.75;color:#666;margin-bottom:32px'>Article content paragraphs...</p></article></div>",
      "description": "Clean reader layout"
    }
  ],
  "saveAsRule": false
}

Request: "Transform into a modern dashboard"
{
  "explanation": "Building modern dashboard with cards and metrics",
  "actions": [
    {
      "type": "extractData",
      "selector": ".metric, .stat, .card, h1, h2, .value",
      "value": "{\\"fields\\":{\\"title\\":\\"h2, h3\\",\\"value\\":\\".value, .number\\",\\"label\\":\\".label\\"}}",
      "description": "Extract metrics and data"
    },
    {
      "type": "palette",
      "value": "{\\"background\\":\\"#0f172a\\",\\"surface\\":\\"#1e293b\\",\\"text\\":\\"#e2e8f0\\",\\"primary\\":\\"#3b82f6\\",\\"accent\\":\\"#10b981\\"}",
      "description": "Dark dashboard theme"
    },
    {
      "type": "rewritePage",
      "value": "<div style='min-height:100vh;background:var(--ai-background);padding:32px'><div style='max-width:1400px;margin:0 auto'><h1 style='font-size:2rem;font-weight:700;color:var(--ai-text);margin-bottom:32px'>Dashboard</h1><div style='display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px'><div style='background:var(--ai-surface);border-radius:12px;padding:24px;border:1px solid rgba(255,255,255,0.1)'><div style='font-size:0.875rem;color:#94a3b8;margin-bottom:8px'>Metric Label</div><div style='font-size:2rem;font-weight:700;color:var(--ai-text)'>1,234</div></div></div></div></div>",
      "description": "Dashboard grid layout"
    }
  ],
  "saveAsRule": false
}

BE BOLD. BE CREATIVE. Transform radically. Use cutting-edge design.
Respond with ONLY the JSON object.`;
    }

    /**
     * Extract data from the original page using ai-dom-analyzer
     */
    async extractDataFromPage(extractAction, context) {
        console.log('📦 Using ai-dom-analyzer for data extraction');
        
        // Use the comprehensive analysis from context (already done by ai-dom-analyzer)
        const extracted = [];
        
        try {
            // Parse extraction config if provided
            let config = {};
            try {
                config = typeof extractAction.value === 'string' 
                    ? JSON.parse(extractAction.value) 
                    : extractAction.value;
            } catch (e) {}
            
            // Use analyzed data from context
            // Combine different types of content
            const allItems = [
                ...(context.layout?.cards || []),
                ...(context.content?.headings?.h2 || []),
                ...(context.content?.headings?.h3 || []),
                ...(context.interactive?.links || []).slice(0, 30),
                ...(context.media?.images || []).slice(0, 20)
            ];
            
            // Group related content into items
            const itemMap = new Map();
            
            allItems.forEach(item => {
                const key = item.selector || item.text?.substring(0, 50);
                if (!itemMap.has(key)) {
                    itemMap.set(key, {
                        title: item.text || '',
                        link: item.href || item.attributes?.href || '',
                        image: item.src || item.attributes?.src || '',
                        description: ''
                    });
                }
            });
            
            // Convert to array
            itemMap.forEach(item => {
                if (item.title || item.link || item.image) {
                    extracted.push(item);
                }
            });
            
            console.log('✅ Extracted', extracted.length, 'items using ai-dom-analyzer');
            return extracted.slice(0, 50); // Limit to 50
            
        } catch (error) {
            console.error('Data extraction failed:', error);
            return [];
        }
    }

    /**
     * Populate HTML template with extracted data
     */
    populateTemplate(templateHTML, extractedData) {
        console.log('🔄 Populating template with', extractedData.length, 'items');
        
        // Find placeholder comments like <!-- DATA_ITEMS --> or {{items}}
        let populatedHTML = templateHTML;
        
        // Generate HTML for each data item with beautiful styling
        const itemsHTML = extractedData.map((item, index) => {
            const imageUrl = item.thumbnail || item.image || '';
            const title = item.title || 'Untitled';
            const description = item.description || '';
            const link = item.link || item.url || '#';
            
            // Create a beautiful card with modern design
            return `
                <div class="card animate__animated animate__fadeInUp" style="
                    animation-delay: ${index * 0.05}s;
                    background: var(--ai-surface, #ffffff);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    transition: all 0.3s ease;
                    cursor: pointer;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                " onmouseover="this.style.transform='translateY(-8px)';this.style.boxShadow='0 12px 24px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'">
                    ${imageUrl ? `
                        <div style="width:100%;height:200px;overflow:hidden;background:#f0f0f0">
                            <img src="${imageUrl}" alt="${title}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.style.display='none'">
                        </div>
                    ` : ''}
                    <div style="padding:20px;flex:1;display:flex;flex-direction:column">
                        <h3 style="font-size:1.25rem;font-weight:700;color:var(--ai-text,#1a1a1a);margin-bottom:12px;line-height:1.4">${title}</h3>
                        ${description ? `<p style="font-size:0.95rem;color:#666;line-height:1.6;margin-bottom:16px;flex:1">${description.substring(0, 150)}${description.length > 150 ? '...' : ''}</p>` : ''}
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto">
                            ${item.author || item.channel ? `<span style="font-size:0.85rem;color:#888"><i class="fas fa-user" style="margin-right:6px"></i>${item.author || item.channel}</span>` : ''}
                            <a href="${link}" style="
                                display:inline-flex;
                                align-items:center;
                                gap:8px;
                                padding:10px 20px;
                                background:var(--ai-primary,#3b82f6);
                                color:white;
                                text-decoration:none;
                                border-radius:8px;
                                font-weight:600;
                                font-size:0.9rem;
                                transition:all 0.2s;
                            " onmouseover="this.style.background='var(--ai-accent,#2563eb)';this.style.transform='scale(1.05)'" onmouseout="this.style.background='var(--ai-primary,#3b82f6)';this.style.transform='scale(1)'">
                                <i class="fas fa-arrow-right"></i>
                                View
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('\n');
        
        // Replace placeholders
        populatedHTML = populatedHTML
            .replace(/<!--\s*DATA_ITEMS\s*-->/gi, itemsHTML)
            .replace(/\{\{items\}\}/gi, itemsHTML)
            .replace(/\{\{data\}\}/gi, itemsHTML);
        
        // If no placeholder found, wrap items in a grid and append
        if (!populatedHTML.includes(itemsHTML)) {
            populatedHTML += `
                <div class="container py-12">
                    <div class="grid grid-3">
                        ${itemsHTML}
                    </div>
                </div>
            `;
        }
        
        return populatedHTML;
    }
}

// Export for use in renderer
if (typeof window !== 'undefined') {
    window.AIAdvancedMode = AIAdvancedMode;
}
