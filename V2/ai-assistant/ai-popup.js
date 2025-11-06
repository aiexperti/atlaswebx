/**
 * AI Popup - Modal window for showing workflow steps
 */

class AIPopup {
    constructor() {
        this.popup = null;
        this.currentStep = null;
        this.onNext = null;
        this.onRedo = null;
    }

    /**
     * Show analysis results in popup
     */
    showAnalysis(analysisData, onNextCallback, onRedoCallback) {
        this.currentStep = 'analysis';
        this.onNext = onNextCallback;
        this.onRedo = onRedoCallback;

        const content = this.buildAnalysisContent(analysisData);
        this.show('Page Analysis', content, true, true);
    }

    /**
     * Build analysis content HTML
     */
    buildAnalysisContent(data) {
        const { pageType, contentTypes, layoutPatterns, primaryContent, itemCount } = data;

        return `
            <div class="analysis-content">
                <div class="analysis-header">
                    <i class="fas fa-chart-bar"></i>
                    <h3>AI Analysis Complete</h3>
                </div>

                <div class="analysis-section">
                    <div class="section-title">
                        <i class="fas fa-file-alt"></i>
                        Page Information
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Page Type:</span>
                            <span class="value">${pageType?.join(', ') || 'Generic'}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Primary Content:</span>
                            <span class="value">${primaryContent || 'Mixed'}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Items Found:</span>
                            <span class="value">${itemCount || 0} items</span>
                        </div>
                    </div>
                </div>

                <div class="analysis-section">
                    <div class="section-title">
                        <i class="fas fa-layer-group"></i>
                        Content Types
                    </div>
                    <div class="tags">
                        ${contentTypes?.map(type => `
                            <span class="tag tag-blue">
                                <i class="fas fa-check-circle"></i>
                                ${type}
                            </span>
                        `).join('') || '<span class="tag tag-gray">No specific types detected</span>'}
                    </div>
                </div>

                <div class="analysis-section">
                    <div class="section-title">
                        <i class="fas fa-th"></i>
                        Layout Patterns
                    </div>
                    <div class="tags">
                        ${layoutPatterns?.map(pattern => `
                            <span class="tag tag-purple">
                                <i class="fas fa-check-circle"></i>
                                ${pattern}
                            </span>
                        `).join('') || '<span class="tag tag-gray">Standard layout</span>'}
                    </div>
                </div>

                <div class="analysis-section">
                    <div class="section-title">
                        <i class="fas fa-lightbulb"></i>
                        Recommendations
                    </div>
                    <div class="recommendations">
                        ${this.getRecommendations(data).map(rec => `
                            <div class="recommendation">
                                <i class="fas fa-arrow-right"></i>
                                <span>${rec}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get recommendations based on analysis
     */
    getRecommendations(data) {
        const recommendations = [];

        if (data.contentTypes?.includes('image-heavy')) {
            recommendations.push('Grid layout with large images would work well');
        }
        if (data.contentTypes?.includes('text-heavy')) {
            recommendations.push('Clean reader view or article layout recommended');
        }
        if (data.contentTypes?.includes('card-based')) {
            recommendations.push('Modern card design with hover effects');
        }
        if (data.layoutPatterns?.includes('grid')) {
            recommendations.push('Responsive grid system detected');
        }
        if (data.itemCount > 20) {
            recommendations.push('Consider pagination or infinite scroll');
        }

        if (recommendations.length === 0) {
            recommendations.push('Modern, clean design with good spacing');
            recommendations.push('Use gradients and shadows for depth');
        }

        return recommendations;
    }

    /**
     * Show popup window
     */
    show(title, content, showNext = true, showRedo = false) {
        // Remove existing popup
        this.hide();

        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.className = 'ai-popup-overlay';
        overlay.innerHTML = `
            <div class="ai-popup animate__animated animate__fadeInUp">
                <div class="ai-popup-header">
                    <h2>${title}</h2>
                    <button class="ai-popup-close" id="ai-popup-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="ai-popup-body">
                    ${content}
                </div>
                <div class="ai-popup-footer">
                    ${showRedo ? `
                        <button class="ai-popup-btn ai-popup-btn-secondary" id="ai-popup-redo">
                            <i class="fas fa-redo"></i>
                            Redo Analysis
                        </button>
                    ` : ''}
                    ${showNext ? `
                        <button class="ai-popup-btn ai-popup-btn-primary" id="ai-popup-next">
                            Next Step
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.popup = overlay;

        // Add event listeners
        this.attachEventListeners();

        // Add styles if not already added
        this.injectStyles();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const closeBtn = document.getElementById('ai-popup-close');
        const nextBtn = document.getElementById('ai-popup-next');
        const redoBtn = document.getElementById('ai-popup-redo');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.onNext) this.onNext();
                this.hide();
            });
        }

        if (redoBtn) {
            redoBtn.addEventListener('click', () => {
                if (this.onRedo) this.onRedo();
                this.hide();
            });
        }

        // Close on overlay click
        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.hide();
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.popup) {
                this.hide();
            }
        });
    }

    /**
     * Hide popup
     */
    hide() {
        if (this.popup) {
            this.popup.classList.add('animate__fadeOut');
            setTimeout(() => {
                this.popup?.remove();
                this.popup = null;
            }, 300);
        }
    }

    /**
     * Inject popup styles
     */
    injectStyles() {
        if (document.getElementById('ai-popup-styles')) return;

        const style = document.createElement('style');
        style.id = 'ai-popup-styles';
        style.textContent = `
            .ai-popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                padding: 20px;
            }

            .ai-popup {
                background: #ffffff;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 700px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .ai-popup-header {
                padding: 24px 28px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .ai-popup-header h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                color: #ffffff;
            }

            .ai-popup-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                width: 36px;
                height: 36px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-size: 18px;
                transition: all 0.2s;
            }

            .ai-popup-close:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }

            .ai-popup-body {
                padding: 28px;
                overflow-y: auto;
                flex: 1;
            }

            .ai-popup-footer {
                padding: 20px 28px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                background: #f9fafb;
            }

            .ai-popup-btn {
                padding: 12px 24px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                border: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }

            .ai-popup-btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #ffffff;
            }

            .ai-popup-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            }

            .ai-popup-btn-secondary {
                background: #ffffff;
                color: #6b7280;
                border: 2px solid #e5e7eb;
            }

            .ai-popup-btn-secondary:hover {
                background: #f9fafb;
                border-color: #d1d5db;
            }

            /* Analysis Content Styles */
            .analysis-content {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .analysis-header {
                display: flex;
                align-items: center;
                gap: 12px;
                padding-bottom: 16px;
                border-bottom: 2px solid #e5e7eb;
            }

            .analysis-header i {
                font-size: 32px;
                color: #667eea;
            }

            .analysis-header h3 {
                margin: 0;
                font-size: 22px;
                font-weight: 700;
                color: #1f2937;
            }

            .analysis-section {
                background: #f9fafb;
                padding: 20px;
                border-radius: 12px;
                border-left: 4px solid #667eea;
            }

            .section-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 16px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 16px;
            }

            .section-title i {
                color: #667eea;
            }

            .info-grid {
                display: grid;
                gap: 12px;
            }

            .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
            }

            .info-item:last-child {
                border-bottom: none;
            }

            .info-item .label {
                font-weight: 600;
                color: #6b7280;
                font-size: 14px;
            }

            .info-item .value {
                font-weight: 700;
                color: #1f2937;
                font-size: 15px;
            }

            .tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .tag {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
            }

            .tag-blue {
                background: #dbeafe;
                color: #1e40af;
            }

            .tag-purple {
                background: #ede9fe;
                color: #6b21a8;
            }

            .tag-gray {
                background: #f3f4f6;
                color: #6b7280;
            }

            .tag i {
                font-size: 11px;
            }

            .recommendations {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .recommendation {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 12px;
                background: #ffffff;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }

            .recommendation i {
                color: #667eea;
                margin-top: 2px;
                flex-shrink: 0;
            }

            .recommendation span {
                color: #374151;
                font-size: 14px;
                line-height: 1.6;
            }
        `;

        document.head.appendChild(style);
    }
}
