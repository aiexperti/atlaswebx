/**
 * AI Engine - Advanced Design & Transformation System
 * Handles complete workflow for creating beautiful, modern web designs
 */

class AIEngine {
    constructor() {
        this.apiHandler = null;
        this.domAnalyzer = null;
        this.popup = null;
        this.isProcessing = false;
        this.currentContext = null;
        this.currentAnalysis = null;
    }

    /**
     * Initialize the engine
     */
    initialize(apiHandler) {
        this.apiHandler = apiHandler;
        this.domAnalyzer = new AIDOMAnalyzer();
        this.popup = new AIPopup();
        console.log('🎨 AI Engine initialized with popup');
    }

    /**
     * Check if request is for analysis only
     */
    isAnalysisRequest(message) {
        const msg = message.toLowerCase();
        const transformKeywords = ['transform', 'change', 'redesign', 'rewrite', 'convert', 'make it', 'create'];
        const hasTransformKeyword = transformKeywords.some(kw => msg.includes(kw));
        return !hasTransformKeyword || msg.includes('analyze') || msg.includes('explain') || msg.includes('show me');
    }

    /**
     * Main transformation workflow
     */
    async transform(userRequest, pageContext) {
        if (this.isProcessing) {
            return { success: false, error: 'Engine is already processing' };
        }

        this.isProcessing = true;
        this.currentContext = pageContext;
        this.userRequest = userRequest;
        console.log('🚀 AI Engine: Starting transformation workflow');

        try {
            // Step 1: Show visual feedback
            await this.showProcessingEffects();
            await this.updateProgress(0, 'Initializing AI Engine...');

            // Step 2: Analyze page structure (10%)
            await this.updateProgress(10, 'Analyzing page structure...');
            const analysis = await this.analyzePage(pageContext);
            console.log('📊 Analysis complete:', analysis);

            // Step 3: Extract content data (30%)
            await this.updateProgress(30, 'Extracting content...');
            const extractedData = await this.extractContent(pageContext, analysis);
            console.log('📦 Extracted', extractedData.length, 'items');
            
            // Store analysis and data
            this.currentAnalysis = { ...analysis, itemCount: extractedData.length };
            
            // Step 4: Show analysis window and wait for user
            await this.hideProcessingEffects();
            await this.updateProgress(40, 'Analysis complete!');
            
            const { ipcRenderer } = require('electron');
            
            // Check if AI Enhance is enabled
            const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
            const aiEnhanceEnabled = !!settings.aiEnhance;
            
            // Show analysis window
            await ipcRenderer.invoke('ai-show-analysis', this.currentAnalysis);
            
            // Wait for user action
            return new Promise((resolve) => {
                // Listen for Next button
                ipcRenderer.once('analysis-next', async () => {
                    // Auto-enhance if enabled, otherwise show data
                    if (aiEnhanceEnabled) {
                        console.log('✨ AI Enhance is ON - auto-enhancing...');
                        resolve(await this.enhanceWithAI(extractedData));
                    } else {
                        resolve(await this.showExtractedData(extractedData));
                    }
                });
                
                // Listen for Redo button
                ipcRenderer.once('analysis-redo', async () => {
                    this.isProcessing = false;
                    resolve(await this.transform(userRequest, pageContext));
                });
            });

            // Step 4: Generate design concept (50%)
            await this.updateProgress(50, 'Generating design concept...');
            const designConcept = await this.generateDesign(userRequest, analysis, extractedData);
            console.log('🎨 Design concept created');

            // Step 5: Build HTML with design (70%)
            await this.updateProgress(70, 'Building beautiful UI...');
            const html = await this.buildHTML(designConcept, extractedData, pageContext);
            console.log('🏗️ HTML built');

            // Step 6: Create twin tab (90%)
            await this.updateProgress(90, 'Opening transformed page...');
            await this.createTwinTab(html, pageContext.title);

            // Step 7: Complete (100%)
            await this.updateProgress(100, 'Transformation complete!');
            await this.hideProcessingEffects();

            this.isProcessing = false;
            return {
                success: true,
                message: '✨ Transformation complete! Check the new tab.',
                designConcept,
                itemCount: extractedData.length
            };

        } catch (error) {
            console.error('❌ AI Engine error:', error);
            await this.hideProcessingEffects();
            this.isProcessing = false;
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Show extracted data window
     */
    async showExtractedData(extractedData) {
        const { ipcRenderer } = require('electron');
        
        // Show extracted data window
        await ipcRenderer.invoke('ai-show-extracted-data', {
            extractedData,
            analysis: this.currentAnalysis
        });
        
        // Wait for user action
        return new Promise((resolve) => {
            // Listen for Continue button
            ipcRenderer.once('extracted-data-next', async () => {
                resolve(await this.continueTransformation(extractedData));
            });
            
            // Listen for Back button - go back to analysis
            ipcRenderer.once('extracted-data-back', async () => {
                this.isProcessing = false;
                resolve(await this.transform(this.userRequest, this.currentContext));
            });
            
            // Listen for Enhance button - AI enhancement
            ipcRenderer.once('extracted-data-enhance', async () => {
                resolve(await this.enhanceWithAI(extractedData));
            });
        });
    }

    /**
     * Enhance extracted data using dedicated AI Enhancer (GPT-5 Codex)
     */
    async enhanceWithAI(extractedData) {
        try {
            console.log('✨ Routing to AI Enhancer (separate layer)...');
            
            // Get API key from API handler (settings only)
            const apiKey = this.apiHandler.settings.openaiKey;
            const source = this.apiHandler.settings.openaiKey ? 'API handler' : 'none';
            
            console.log('🔑 API key source:', source);
            console.log('🔑 Passing API key to enhancer:', apiKey ? 'Available' : 'Missing');
            
            if (!apiKey) {
                throw new Error('OpenAI API key not configured. Please add your API key in Settings.');
            }
            
            // Use dedicated AI Enhancer with API key
            const enhancer = new AIEnhancer();
            const result = await enhancer.enhance(this.currentContext, apiKey);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            console.log('✅ AI Enhancer completed:', result.data.length, 'items');
            
            // Show enhanced data in window
            return await this.showExtractedData(result.data);
            
        } catch (error) {
            console.error('❌ AI Enhancement failed:', error);
            
            // Fall back to original data
            alert('AI enhancement failed: ' + error.message + '\n\nContinuing with original data.');
            return await this.continueTransformation(extractedData);
        }
    }

    /**
     * OLD METHOD - Keeping for reference but not used
     */
    async enhanceWithAI_OLD(extractedData) {
        const { ipcRenderer } = require('electron');
        
        try {
            await this.showProcessingEffects();
            await this.updateProgress(50, '🧠 GPT-5 Codex analyzing page...');
            
            console.log('🧠 Starting GPT-5 Codex extraction...');
            console.log('🔧 API Handler:', this.apiHandler ? 'Available' : 'Missing');
            
            if (!this.apiHandler) {
                throw new Error('API Handler not initialized');
            }
            
            // Get the full page HTML for better extraction
            const pageHTML = this.currentContext.html || this.currentContext.bodyHtml || '';
            const pageURL = this.currentContext.url || '';
            
            // Build specialized extraction prompt
            const prompt = `You are an expert web scraper and data extraction specialist. Extract ALL meaningful content from this webpage.

PAGE URL: ${pageURL}
PAGE TITLE: ${this.currentContext.title}

HTML CONTENT (analyze the full structure):
${pageHTML.substring(0, 50000)}

EXTRACTION REQUIREMENTS:
1. Extract ALL articles, videos, products, posts, or content items
2. For each item find: title, image URL, link URL, description, author, date, category
3. Remove duplicates (same title or URL)
4. Remove navigation links, ads, and UI elements
5. Prioritize content with images
6. Infer missing data from context
7. Categorize items by topic

RESPOND WITH VALID JSON ONLY (no markdown, no explanation):
{
  "items": [
    {
      "title": "exact title text",
      "image": "full image URL or empty string",
      "link": "full link URL or empty string",
      "description": "brief description or summary",
      "author": "author name if found",
      "date": "publication date if found",
      "category": "inferred category (news, tech, video, product, etc)",
      "priority": 1-10
    }
  ],
  "metadata": {
    "totalFound": 0,
    "categories": [],
    "pageType": "news|blog|ecommerce|video|social",
    "summary": "brief description of what was extracted"
  }
}

IMPORTANT: Return ONLY valid JSON. No markdown code blocks. No explanations.`;

            console.log('📤 Sending to GPT-5 Codex...');
            console.log('📝 Prompt length:', prompt.length, 'characters');
            await this.updateProgress(60, '🔍 Analyzing page structure...');
            
            // Use GPT-5 Codex for superior structured extraction
            console.log('🔑 Calling API with model: gpt-5-codex');
            const response = await this.apiHandler.callAI(prompt, {
                model: 'gpt-5-codex',
                useResponsesAPI: true,
                reasoning_effort: 'medium',
                reasoning_summary: 'auto',
                json_format: true
            });
            console.log('✅ Response received, length:', response?.length || 0);
            
            console.log('📥 Received response, parsing...');
            await this.updateProgress(70, '📦 Processing extracted data...');
            
            let enhanced;
            try {
                enhanced = JSON.parse(response);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                // Try to extract JSON from response
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    enhanced = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Could not parse AI response as JSON');
                }
            }
            
            const extractedItems = enhanced.items || [];
            
            console.log('✅ GPT-4 Turbo extracted', extractedItems.length, 'items');
            console.log('📊 Metadata:', enhanced.metadata);
            console.log('📝 Summary:', enhanced.metadata?.summary);
            
            await this.updateProgress(80, 'Enhancement complete!');
            await this.hideProcessingEffects();
            
            // Show enhanced data in new window
            return await this.showExtractedData(extractedItems);
            
        } catch (error) {
            console.error('❌ AI enhancement failed:', error);
            await this.hideProcessingEffects();
            
            // Fall back to original data
            alert('AI enhancement failed: ' + error.message + '\n\nContinuing with original data.');
            return await this.continueTransformation(extractedData);
        }
    }

    /**
     * Continue transformation after analysis approval
     */
    async continueTransformation(extractedData) {
        try {
            await this.showProcessingEffects();
            
            // Step 5: Generate design concept (60%)
            await this.updateProgress(60, 'Generating design concept...');
            const designConcept = await this.generateDesign('transform', this.currentAnalysis, extractedData);
            console.log('🎨 Design concept created');

            // Step 6: Build HTML with design (80%)
            await this.updateProgress(80, 'Building beautiful UI...');
            const html = await this.buildHTML(designConcept, extractedData, this.currentContext);
            console.log('🏗️ HTML built');

            // Step 7: Create twin tab (95%)
            await this.updateProgress(95, 'Opening transformed page...');
            await this.createTwinTab(html, this.currentContext.title);

            // Step 8: Complete (100%)
            await this.updateProgress(100, 'Transformation complete!');
            await this.hideProcessingEffects();

            this.isProcessing = false;
            return {
                success: true,
                message: '✨ Transformation complete! Check the new tab.',
                designConcept,
                itemCount: extractedData.length
            };

        } catch (error) {
            console.error('❌ Transformation error:', error);
            await this.hideProcessingEffects();
            this.isProcessing = false;
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Analyze page structure and content
     */
    async analyzePage(pageContext) {
        const analysis = {
            pageType: pageContext.pageType || [],
            contentTypes: [],
            layoutPatterns: [],
            colorScheme: 'light',
            primaryContent: null
        };

        // Detect content types
        if (pageContext.media?.images?.length > 5) analysis.contentTypes.push('image-heavy');
        if (pageContext.media?.videos?.length > 0) analysis.contentTypes.push('video');
        if (pageContext.content?.paragraphs?.length > 10) analysis.contentTypes.push('text-heavy');
        if (pageContext.layout?.cards?.length > 0) analysis.contentTypes.push('card-based');

        // Detect layout patterns
        if (pageContext.layout?.grid?.length > 0) analysis.layoutPatterns.push('grid');
        if (pageContext.layout?.flex?.length > 0) analysis.layoutPatterns.push('flex');

        // Determine primary content
        if (analysis.contentTypes.includes('image-heavy')) {
            analysis.primaryContent = 'visual';
        } else if (analysis.contentTypes.includes('text-heavy')) {
            analysis.primaryContent = 'article';
        } else {
            analysis.primaryContent = 'mixed';
        }

        return analysis;
    }

    /**
     * Extract content from page
     */
    async extractContent(pageContext, analysis) {
        const items = [];
        const seen = new Set();

        console.log('🔍 Starting universal content extraction...');

        // STRATEGY 1: Use site-specific data if available (YouTube, etc.)
        if (pageContext.youtubeData?.videos) {
            console.log('🎬 Using YouTube-specific extraction');
            pageContext.youtubeData.videos.forEach(video => {
                if (seen.has(video.link)) return;
                seen.add(video.link);
                
                items.push({
                    title: video.title,
                    image: video.thumbnail,
                    link: video.link,
                    description: video.views || '',
                    type: 'youtube-video'
                });
            });
            console.log('✅ Added', items.length, 'YouTube videos');
        }

        // STRATEGY 2: Smart pairing - Match images with nearby links
        if (pageContext.allImages && pageContext.allLinks) {
            console.log('🔗 Pairing images with links...');
            
            // Create a map of links by their text
            const linkMap = new Map();
            pageContext.allLinks.forEach(link => {
                linkMap.set(link.text.toLowerCase(), link);
            });
            
            // Try to pair images with links
            pageContext.allImages.forEach(img => {
                if (!img.src || seen.has(img.src)) return;
                
                // Find matching link by alt text or aria-label
                const searchText = (img.alt || img['aria-label'] || '').toLowerCase();
                const matchingLink = linkMap.get(searchText);
                
                if (matchingLink) {
                    seen.add(img.src);
                    items.push({
                        title: img.alt || matchingLink.text,
                        image: img.src,
                        link: matchingLink.href,
                        description: '',
                        type: 'paired-content'
                    });
                }
            });
            
            console.log('✅ Paired', items.filter(i => i.type === 'paired-content').length, 'items');
        }

        // STRATEGY 3: Add standalone images (relaxed criteria)
        if (pageContext.allImages) {
            pageContext.allImages.forEach(img => {
                if (!img.src || seen.has(img.src)) return;
                
                // Skip tiny images (likely icons) but be more lenient
                if (img.width < 40 || img.height < 40) return;
                
                // Skip data URLs and SVGs (too large)
                if (img.src.startsWith('data:') || img.src.endsWith('.svg')) return;
                
                seen.add(img.src);
                items.push({
                    title: img.alt || 'Image',
                    image: img.src,
                    link: '',
                    description: '',
                    type: 'image'
                });
            });
            
            console.log('✅ Added', items.filter(i => i.type === 'image').length, 'standalone images');
        }

        // STRATEGY 4: Add standalone links with text
        if (pageContext.allLinks) {
            pageContext.allLinks.forEach(link => {
                if (!link.href || seen.has(link.href)) return;
                if (!link.text || link.text.length < 5) return; // Skip short links
                
                seen.add(link.href);
                items.push({
                    title: link.text,
                    image: '',
                    link: link.href,
                    description: link.title || '',
                    type: 'link'
                });
            });
            
            console.log('✅ Added', items.filter(i => i.type === 'link').length, 'standalone links');
        }

        // STRATEGY 5: Fallback to DOM analyzer data if needed
        if (items.length < 10) {
            console.log('⚠️ Low item count, using fallback extraction...');
            
            // Extract from cards
            (pageContext.layout?.cards || []).forEach(card => {
                const key = card.text?.substring(0, 50) || card.href;
                if (!key || seen.has(key)) return;
                
                seen.add(key);
                items.push({
                    title: card.text || card.title || '',
                    image: card.image || '',
                    link: card.href || '',
                    description: card.description || '',
                    type: 'card'
                });
            });
            
            console.log('✅ Added', items.filter(i => i.type === 'card').length, 'cards from fallback');
        }

        console.log('📦 Extracted items breakdown:', {
            total: items.length,
            withImages: items.filter(i => i.image).length,
            withLinks: items.filter(i => i.link).length,
            withBoth: items.filter(i => i.image && i.link).length
        });

        return items.slice(0, 100); // Increased limit
    }

    /**
     * Generate design concept using AI
     */
    async generateDesign(userRequest, analysis, extractedData) {
        const prompt = this.buildDesignPrompt(userRequest, analysis, extractedData);
        
        try {
            const response = await this.apiHandler.callAI(prompt);
            const design = JSON.parse(response);
            return design;
        } catch (error) {
            console.error('Failed to parse AI design:', error);
            // Fallback to default modern design
            return this.getDefaultDesign(analysis);
        }
    }

    /**
     * Build design prompt for AI
     */
    buildDesignPrompt(userRequest, analysis, extractedData) {
        const sampleData = extractedData.slice(0, 3);
        
        return `You are a professional web designer. Create a modern, beautiful design concept.

USER REQUEST: "${userRequest}"

PAGE ANALYSIS:
- Content Type: ${analysis.primaryContent}
- Has ${extractedData.length} items to display
- Layout Patterns: ${analysis.layoutPatterns.join(', ') || 'standard'}

SAMPLE DATA (first 3 items):
${JSON.stringify(sampleData, null, 2)}

RESPOND WITH JSON ONLY:
{
  "theme": {
    "primary": "#3b82f6",
    "accent": "#8b5cf6",
    "background": "#f8fafc",
    "text": "#1e293b"
  },
  "layout": "grid" | "masonry" | "list" | "cards",
  "style": "modern" | "minimal" | "bold" | "elegant",
  "cardDesign": {
    "imagePosition": "top" | "left" | "background",
    "showDescription": true,
    "showMeta": true,
    "hoverEffect": "lift" | "scale" | "glow"
  },
  "typography": {
    "headingSize": "text-4xl" | "text-5xl" | "text-6xl",
    "bodySize": "text-base" | "text-lg"
  }
}`;
    }

    /**
     * Get default design if AI fails
     */
    getDefaultDesign(analysis) {
        return {
            theme: {
                primary: '#3b82f6',
                accent: '#8b5cf6',
                background: '#f8fafc',
                text: '#1e293b'
            },
            layout: 'grid',
            style: 'modern',
            cardDesign: {
                imagePosition: 'top',
                showDescription: true,
                showMeta: true,
                hoverEffect: 'lift'
            },
            typography: {
                headingSize: 'text-5xl',
                bodySize: 'text-base'
            }
        };
    }

    /**
     * Build complete HTML from design concept
     */
    async buildHTML(design, data, pageContext) {
        const { theme, layout, style, cardDesign, typography } = design;

        // Generate cards HTML
        const cardsHTML = data.map((item, index) => {
            return this.generateCard(item, index, cardDesign, theme);
        }).join('\n');

        // Build complete page
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;">
    <title>${pageContext.title} - AI Transformed</title>
    
    <script src="https://cdn.tailwindcss.com" crossorigin="anonymous"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '${theme.primary}',
                        accent: '${theme.accent}',
                    }
                }
            }
        }
    </script>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" crossorigin="anonymous" />
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', sans-serif;
            background: ${theme.background};
            color: ${theme.text};
        }
        h1, h2, h3 { font-family: 'Poppins', sans-serif; }
        .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
    </style>
</head>
<body>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-16 px-6">
        <div class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-16 animate__animated animate__fadeInDown">
                <h1 class="${typography.headingSize} font-black text-gray-900 mb-4">
                    <i class="fas fa-sparkles text-${theme.primary.replace('#', '')} mr-4"></i>
                    ${pageContext.title}
                </h1>
                <p class="text-xl text-gray-600">Beautifully transformed with AI • ${data.length} items</p>
            </div>
            
            <!-- Content Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${cardsHTML}
            </div>
        </div>
    </div>
    
    <!-- AI Badge -->
    <div class="fixed bottom-6 right-6 z-50">
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform">
            <i class="fas fa-wand-magic-sparkles"></i>
            <span class="font-bold">AI Transformed</span>
        </div>
    </div>
</body>
</html>`;

        return html;
    }

    /**
     * Generate individual card HTML
     */
    generateCard(item, index, cardDesign, theme) {
        const delay = index * 0.05;
        const imageHTML = item.image ? `
            <div class="w-full h-56 overflow-hidden bg-gray-200">
                <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover" onerror="this.parentElement.style.display='none'">
            </div>
        ` : '';

        return `
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden hover-lift animate__animated animate__fadeInUp" style="animation-delay: ${delay}s">
            ${imageHTML}
            <div class="p-6">
                <h3 class="text-2xl font-bold text-gray-900 mb-3">${item.title || 'Untitled'}</h3>
                ${item.description ? `<p class="text-gray-600 mb-4 line-clamp-3">${item.description}</p>` : ''}
                ${item.link ? `
                    <a href="${item.link}" class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                        <span>View More</span>
                        <i class="fas fa-arrow-right"></i>
                    </a>
                ` : ''}
            </div>
        </div>
        `;
    }

    /**
     * Create twin tab with transformed HTML
     */
    async createTwinTab(html, title) {
        const { ipcRenderer } = require('electron');
        const result = await ipcRenderer.invoke('ai-create-twin-tab', {
            html: html,
            title: title + ' - AI Twin'
        });
        
        if (!result.success) {
            throw new Error('Failed to create twin tab: ' + result.error);
        }
    }

    /**
     * Show processing visual effects
     */
    async showProcessingEffects() {
        const { ipcRenderer } = require('electron');
        const code = `
            (function() {
                document.getElementById('ai-halo-effect')?.remove();
                const halo = document.createElement('div');
                halo.id = 'ai-halo-effect';
                halo.style.cssText = \`
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    pointer-events: none; z-index: 999998;
                    box-shadow: inset 0 0 100px 20px rgba(59, 130, 246, 0.3);
                    animation: halo-pulse 2s ease-in-out infinite;
                \`;
                const style = document.createElement('style');
                style.textContent = '@keyframes halo-pulse { 0%, 100% { box-shadow: inset 0 0 100px 20px rgba(59, 130, 246, 0.3); } 50% { box-shadow: inset 0 0 150px 30px rgba(139, 92, 246, 0.4); } }';
                document.head.appendChild(style);
                document.body.appendChild(halo);
            })();
        `;
        await ipcRenderer.invoke('ai-execute-action', code);
    }

    /**
     * Hide processing effects
     */
    async hideProcessingEffects() {
        const { ipcRenderer } = require('electron');
        await ipcRenderer.invoke('ai-execute-action', 'document.getElementById("ai-halo-effect")?.remove();');
    }

    /**
     * Update progress bar
     */
    async updateProgress(percent, message) {
        console.log(`📊 ${percent}% - ${message}`);
        
        const urlBar = document.getElementById('url-bar');
        if (urlBar) {
            let progressBar = document.getElementById('ai-progress-bar');
            if (!progressBar) {
                progressBar = document.createElement('div');
                progressBar.id = 'ai-progress-bar';
                progressBar.style.cssText = `
                    position: absolute; bottom: 0; left: 0; height: 3px;
                    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                    transition: width 0.3s ease; border-radius: 0 2px 2px 0;
                    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                `;
                urlBar.style.position = 'relative';
                urlBar.appendChild(progressBar);
            }
            progressBar.style.width = `${percent}%`;
            urlBar.placeholder = message;
            
            if (percent >= 100) {
                setTimeout(() => {
                    progressBar?.remove();
                    urlBar.placeholder = 'Search or enter URL';
                }, 1000);
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
    }
}
