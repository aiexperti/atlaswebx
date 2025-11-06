/**
 * AI Enhancer - GPT-5 Codex Extraction Layer
 * Completely separate from standard AI workflow
 * Specialized for intelligent content extraction and enhancement
 */

class AIEnhancer {
    constructor() {
        this.apiKey = null;
        this.isProcessing = false;
    }

    /**
     * Initialize with API key (checks localStorage and .env)
     */
    initialize(apiKey) {
        // If no API key provided, try to load from localStorage and .env
        if (!apiKey) {
            console.log('🔍 No API key provided, trying to load from storage...');
            try {
                const aiSettings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
                const generalSettings = JSON.parse(localStorage.getItem('lenoir-settings') || '{}');
                
                // Check localStorage first, then .env file
                apiKey = aiSettings.openaiKey || generalSettings.openaiKey || process.env.OPENAI_API_KEY;
                
                const source = aiSettings.openaiKey ? 'localStorage' : 
                              (generalSettings.openaiKey ? 'lenoir-settings' : 
                              (process.env.OPENAI_API_KEY ? '.env file' : 'none'));
                
                console.log('🔑 API key source:', source);
                console.log('🔑 API key found:', apiKey ? 'Yes' : 'No');
            } catch (e) {
                console.error('❌ Failed to load API key:', e);
            }
        }
        
        if (apiKey) {
            this.apiKey = apiKey;
            console.log('✨ AI Enhancer initialized with API key, length:', this.apiKey.length);
        } else {
            throw new Error('API key is required. Please add your OpenAI API key in Settings or .env file.');
        }
    }

    /**
     * Main enhancement workflow
     */
    async enhance(pageContext, apiKey) {
        if (this.isProcessing) {
            return { success: false, error: 'Enhancement already in progress' };
        }

        this.isProcessing = true;
        console.log('🧠 Starting AI Enhancement with GPT-5 Codex...');

        try {
            this.initialize(apiKey);

            // Step 1: Show visual feedback
            await this.showEnhancementUI();

            // Step 2: Extract with GPT-5 Codex (now returns HTML or items)
            const result = await this.extractWithCodex(pageContext);

            // Step 3: Show results in new window
            await this.hideEnhancementUI();
            
            // If we got HTML, display it directly
            if (result.html) {
                await this.showHTMLWindow(result.html, result.metadata);
                this.isProcessing = false;
                return {
                    success: true,
                    html: result.html,
                    metadata: result.metadata,
                    message: `✨ Created beautiful page with ${result.metadata?.totalItems || 'many'} items`
                };
            } else {
                // Fallback to items display
                await this.showResultsWindow(result.items);
                this.isProcessing = false;
                return {
                    success: true,
                    data: result.items,
                    message: `✨ Enhanced ${result.items?.length || 0} items with AI`
                };
            }

        } catch (error) {
            console.error('❌ Enhancement failed:', error);
            await this.hideEnhancementUI();
            this.isProcessing = false;
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Extract content using GPT-5 Codex
     */
    async extractWithCodex(pageContext) {
        console.log('🔍 Extracting with GPT-5 Codex...');

        const pageURL = pageContext.url || '';
        const pageTitle = pageContext.title || '';
        
        // Use already extracted data from DOM scraper
        const allImages = pageContext.allImages || [];
        const allLinks = pageContext.allLinks || [];
        const youtubeData = pageContext.youtubeData?.videos || [];
        
        console.log('📊 Available data:', {
            images: allImages.length,
            links: allLinks.length,
            youtubeVideos: youtubeData.length
        });

        // Build specialized extraction prompt with Tailwind CSS template
        const prompt = `You are an expert web designer and content curator powered by GPT-5 Codex. Create a beautiful, modern HTML page with Tailwind CSS.

PAGE URL: ${pageURL}
PAGE TITLE: ${pageTitle}

EXTRACTED IMAGES (${allImages.length} total, showing first 50):
${JSON.stringify(allImages.slice(0, 50), null, 2)}

EXTRACTED LINKS (${allLinks.length} total, showing first 50):
${JSON.stringify(allLinks.slice(0, 50), null, 2)}

${youtubeData.length > 0 ? `
YOUTUBE VIDEOS (${youtubeData.length} total):
${JSON.stringify(youtubeData, null, 2)}
` : ''}

YOUR TASK:
1. Process ALL content (${youtubeData.length} videos, ${allImages.length} images, ${allLinks.length} links)
2. Create a stunning, modern HTML page using Tailwind CSS
3. Design should be:
   - Clean and minimalist
   - Modern gradient backgrounds
   - Card-based layout with hover effects
   - Responsive grid (1-3 columns)
   - Beautiful typography
   - Smooth animations
   - Professional color scheme (purple/blue gradients)
4. Include ALL items (no limit)
5. Remove only duplicates and navigation elements
6. Add categories, tags, and visual hierarchy
7. Include search/filter UI if many items
8. Make it look like a premium content discovery platform

RESPOND WITH VALID JSON ONLY:
{
  "html": "<!DOCTYPE html><html>... complete HTML with Tailwind CSS CDN ...",
  "metadata": {
    "totalItems": 0,
    "categories": [],
    "pageType": "news|blog|ecommerce|video|social",
    "designStyle": "modern|minimal|vibrant|dark"
  }
}

DESIGN REQUIREMENTS:
- Use Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
- Modern gradient backgrounds (purple, blue, pink)
- Card components with hover:scale-105 transitions
- Glassmorphism effects (backdrop-blur)
- Beautiful shadows and rounded corners
- Responsive grid layout
- Professional typography
- Icons (use Unicode or simple SVG)
- Dark theme with vibrant accents

IMPORTANT: Return ONLY valid JSON with complete HTML. No markdown blocks.`;

        // Call GPT-5 Codex
        const response = await this.callGPT5Codex(prompt);

        // Parse response
        let result;
        try {
            result = JSON.parse(response);
        } catch (parseError) {
            console.error('❌ JSON parse error:', parseError);
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not parse AI response as JSON');
            }
        }

        // Check if we got HTML or items
        if (result.html) {
            console.log('✅ GPT-5 Codex generated HTML page');
            console.log('📊 Metadata:', result.metadata);
            return { html: result.html, metadata: result.metadata };
        } else {
            // Fallback to items format
            const items = result.items || [];
            console.log('✅ GPT-5 Codex extracted', items.length, 'items');
            console.log('📊 Metadata:', result.metadata);
            return { items: items, metadata: result.metadata };
        }
    }

    /**
     * Call GPT-5 Codex API directly
     */
    async callGPT5Codex(prompt) {
        console.log('📤 Calling GPT-5 Codex API...');

        const OpenAI = require('openai');
        const OpenAIClient = OpenAI && OpenAI.default ? OpenAI.default : OpenAI;
        const client = new OpenAIClient({ 
            apiKey: this.apiKey,
            dangerouslyAllowBrowser: true
        });

        const requestParams = {
            model: 'gpt-5-codex',
            input: prompt,
            reasoning: {
                effort: 'medium',
                summary: 'auto'
            },
            text: {
                format: { type: 'json_object' }
            },
            max_output_tokens: 16000, // Increased for more items
            store: true,
            include: [
                'reasoning.encrypted_content',
                'web_search_call.action.sources'
            ]
        };

        console.log('🔄 Request params:', {
            model: requestParams.model,
            reasoning: requestParams.reasoning,
            max_tokens: requestParams.max_output_tokens
        });

        const response = await client.responses.create(requestParams);
        console.log('✅ Response received');
        console.log('📦 Response structure:', {
            hasOutputText: !!response.output_text,
            hasOutput: !!response.output,
            hasChoices: !!response.choices,
            hasText: !!response.text,
            keys: Object.keys(response)
        });

        // Try multiple extraction methods
        
        // Method 1: Direct output_text
        if (response.output_text) {
            console.log('✅ Using output_text');
            return response.output_text;
        }

        // Method 2: choices array (standard OpenAI format)
        if (response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
            const choice = response.choices[0];
            if (choice.message?.content) {
                console.log('✅ Using choices[0].message.content');
                return choice.message.content;
            }
            if (choice.text) {
                console.log('✅ Using choices[0].text');
                return choice.text;
            }
        }

        // Method 3: output array
        if (response.output && Array.isArray(response.output)) {
            const textParts = [];
            for (const item of response.output) {
                if (item.content && Array.isArray(item.content)) {
                    for (const contentItem of item.content) {
                        if (contentItem.type === 'output_text' && contentItem.text) {
                            textParts.push(contentItem.text);
                        } else if (contentItem.text) {
                            textParts.push(contentItem.text);
                        }
                    }
                } else if (item.text) {
                    textParts.push(item.text);
                }
            }
            if (textParts.length) {
                console.log('✅ Using output array, parts:', textParts.length);
                return textParts.join('\n');
            }
        }

        // Method 4: Direct text field
        if (response.text) {
            console.log('✅ Using direct text field');
            return response.text;
        }

        // Log full response for debugging
        console.error('❌ Could not extract text. Full response:', JSON.stringify(response, null, 2));
        throw new Error('Could not extract text from GPT-5 Codex response');
    }

    /**
     * Show enhancement UI (halo + progress)
     */
    async showEnhancementUI() {
        const { ipcRenderer } = require('electron');
        
        // Show halo effect
        const haloCode = `
            (function() {
                document.getElementById('ai-enhance-halo')?.remove();
                const halo = document.createElement('div');
                halo.id = 'ai-enhance-halo';
                halo.style.cssText = \`
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    pointer-events: none; z-index: 999998;
                    box-shadow: inset 0 0 100px 20px rgba(245, 158, 11, 0.4);
                    animation: enhance-pulse 2s ease-in-out infinite;
                \`;
                const style = document.createElement('style');
                style.textContent = '@keyframes enhance-pulse { 0%, 100% { box-shadow: inset 0 0 100px 20px rgba(245, 158, 11, 0.4); } 50% { box-shadow: inset 0 0 150px 30px rgba(239, 68, 68, 0.5); } }';
                document.head.appendChild(style);
                document.body.appendChild(halo);
            })();
        `;
        await ipcRenderer.invoke('ai-execute-action', haloCode);

        // Show progress bar
        const urlBar = document.getElementById('url-bar');
        if (urlBar) {
            let progressBar = document.getElementById('ai-enhance-progress');
            if (!progressBar) {
                progressBar = document.createElement('div');
                progressBar.id = 'ai-enhance-progress';
                progressBar.style.cssText = `
                    position: absolute; bottom: 0; left: 0; height: 3px;
                    background: linear-gradient(90deg, #f59e0b, #ef4444);
                    width: 0%; transition: width 0.3s ease;
                    box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
                `;
                urlBar.style.position = 'relative';
                urlBar.appendChild(progressBar);
            }
            progressBar.style.width = '30%';
            urlBar.placeholder = '🧠 GPT-5 Codex analyzing...';
        }
    }

    /**
     * Hide enhancement UI
     */
    async hideEnhancementUI() {
        const { ipcRenderer } = require('electron');
        
        console.log('🧹 Cleaning up enhancement UI...');
        
        // Remove halo from the active tab
        const cleanupCode = `
            (function() {
                const halo = document.getElementById('ai-enhance-halo');
                if (halo) {
                    halo.remove();
                    console.log('✅ Halo removed');
                }
                // Also remove any animation styles
                const styles = document.querySelectorAll('style');
                styles.forEach(style => {
                    if (style.textContent.includes('enhance-pulse')) {
                        style.remove();
                        console.log('✅ Animation style removed');
                    }
                });
            })();
        `;
        await ipcRenderer.invoke('ai-execute-action', cleanupCode);

        // Complete progress
        const progressBar = document.getElementById('ai-enhance-progress');
        const urlBar = document.getElementById('url-bar');
        if (progressBar && urlBar) {
            progressBar.style.width = '100%';
            urlBar.placeholder = '✨ Enhancement complete!';
            setTimeout(() => {
                progressBar?.remove();
                urlBar.placeholder = 'Search or enter URL';
                console.log('✅ Progress bar removed');
            }, 1000);
        }
        
        console.log('✅ Enhancement UI cleanup complete');
    }

    /**
     * Show beautiful HTML page in a new window
     */
    async showHTMLWindow(html, metadata) {
        const { ipcRenderer } = require('electron');
        
        console.log('🎨 Opening beautiful HTML page...');
        console.log('📊 Metadata:', metadata);
        
        // Send HTML to main process to open in new window
        ipcRenderer.send('show-enhanced-html', {
            html: html,
            metadata: metadata,
            title: `✨ Enhanced: ${metadata?.pageType || 'Content'}`
        });
    }

    /**
     * Show extracted results in a new window (fallback)
     */
    async showResultsWindow(extractedData) {
        const { ipcRenderer } = require('electron');
        
        console.log('📊 Showing', extractedData.length, 'items in results window');
        
        // Organize by category
        const categories = {
            images: extractedData.filter(item => item.image && item.image.length > 0),
            videos: extractedData.filter(item => item.category === 'video' || item.link?.includes('youtube') || item.link?.includes('vimeo')),
            links: extractedData.filter(item => item.link && item.link.length > 0),
            text: extractedData.filter(item => item.title && item.title.length > 0)
        };
        
        await ipcRenderer.invoke('ai-show-extracted-data', {
            extractedData: extractedData,
            analysis: {
                itemCount: extractedData.length,
                categories: Object.keys(categories).filter(k => categories[k].length > 0),
                summary: `GPT-5 Codex extracted ${extractedData.length} items with complete metadata`
            }
        });
    }
}
