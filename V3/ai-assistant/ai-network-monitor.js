/**
 * AI Network Monitor - Advanced Network Request Analysis
 * Provides detailed analysis and filtering of network requests
 * This module runs in the renderer process
 */

class AINetworkMonitor {
    constructor() {
        this.requests = [];
        this.filters = {
            type: null, // 'xhr', 'fetch', 'websocket'
            status: null, // 200, 404, etc.
            method: null, // 'GET', 'POST', etc.
            contentType: null // 'application/json', etc.
        };
    }

    /**
     * Inject monitoring script into the page
     */
    async injectMonitoring() {
        const { ipcRenderer } = require('electron');
        
        try {
            // Read the scraper script
            const fs = require('fs');
            const path = require('path');
            const scraperPath = path.join(__dirname, 'ai-page-scraper.js');
            const scraperCode = fs.readFileSync(scraperPath, 'utf8');
            
            // Inject into page
            await ipcRenderer.invoke('ai-execute-action', scraperCode);
            
            console.log('✅ Network monitoring injected into page');
            return { success: true };
        } catch (error) {
            console.error('Failed to inject network monitoring:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all captured network data from the page
     */
    async getCapturedData() {
        const { ipcRenderer } = require('electron');
        
        try {
            const result = await ipcRenderer.invoke('ai-execute-action', `
                (function() {
                    if (window.__aiPageScraper) {
                        return window.__aiPageScraper.getData();
                    }
                    return { error: 'Scraper not initialized' };
                })();
            `);
            
            if (result.success && result.result) {
                this.requests = result.result.networkRequests || [];
                return result.result;
            }
            
            return { error: 'Failed to get captured data' };
        } catch (error) {
            console.error('Failed to get captured data:', error);
            return { error: error.message };
        }
    }

    /**
     * Filter requests by criteria
     */
    filterRequests(criteria) {
        let filtered = [...this.requests];

        if (criteria.type) {
            filtered = filtered.filter(r => r.type === criteria.type);
        }

        if (criteria.status) {
            filtered = filtered.filter(r => r.status === criteria.status);
        }

        if (criteria.method) {
            filtered = filtered.filter(r => r.method?.toUpperCase() === criteria.method.toUpperCase());
        }

        if (criteria.contentType) {
            filtered = filtered.filter(r => {
                const ct = r.headers?.['content-type'] || r.responseType;
                return ct && ct.includes(criteria.contentType);
            });
        }

        if (criteria.url) {
            filtered = filtered.filter(r => r.url && r.url.includes(criteria.url));
        }

        return filtered;
    }

    /**
     * Get all JSON API responses
     */
    getJSONResponses() {
        return this.requests.filter(r => r.parsedJSON);
    }

    /**
     * Get all failed requests
     */
    getFailedRequests() {
        return this.requests.filter(r => r.error || r.status >= 400);
    }

    /**
     * Get requests by domain
     */
    getRequestsByDomain(domain) {
        return this.requests.filter(r => {
            try {
                const url = new URL(r.url);
                return url.hostname.includes(domain);
            } catch {
                return false;
            }
        });
    }

    /**
     * Get API endpoints (common patterns)
     */
    getAPIEndpoints() {
        const apiPatterns = ['/api/', '/v1/', '/v2/', '/graphql', '/rest/', '.json'];
        
        return this.requests.filter(r => {
            return apiPatterns.some(pattern => r.url?.includes(pattern));
        });
    }

    /**
     * Analyze request patterns
     */
    analyzePatterns() {
        const analysis = {
            totalRequests: this.requests.length,
            byType: {},
            byMethod: {},
            byStatus: {},
            domains: new Set(),
            apiEndpoints: [],
            averageDuration: 0,
            slowestRequests: []
        };

        // Count by type
        this.requests.forEach(r => {
            analysis.byType[r.type] = (analysis.byType[r.type] || 0) + 1;
            analysis.byMethod[r.method] = (analysis.byMethod[r.method] || 0) + 1;
            analysis.byStatus[r.status] = (analysis.byStatus[r.status] || 0) + 1;
            
            try {
                const url = new URL(r.url);
                analysis.domains.add(url.hostname);
            } catch {}
        });

        // Calculate average duration
        const durations = this.requests.filter(r => r.duration).map(r => r.duration);
        if (durations.length > 0) {
            analysis.averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        }

        // Find slowest requests
        analysis.slowestRequests = [...this.requests]
            .filter(r => r.duration)
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10)
            .map(r => ({
                url: r.url,
                method: r.method,
                duration: r.duration,
                status: r.status
            }));

        // Get API endpoints
        analysis.apiEndpoints = this.getAPIEndpoints().map(r => ({
            url: r.url,
            method: r.method,
            hasJSON: !!r.parsedJSON
        }));

        analysis.domains = Array.from(analysis.domains);

        return analysis;
    }

    /**
     * Export requests as HAR (HTTP Archive) format
     */
    exportAsHAR() {
        const har = {
            log: {
                version: '1.2',
                creator: {
                    name: 'AI Network Monitor',
                    version: '1.0'
                },
                entries: this.requests.map(r => ({
                    startedDateTime: new Date(r.timestamp).toISOString(),
                    time: r.duration || 0,
                    request: {
                        method: r.method || 'GET',
                        url: r.url,
                        httpVersion: 'HTTP/1.1',
                        headers: this.formatHeaders(r.headers),
                        queryString: [],
                        cookies: [],
                        headersSize: -1,
                        bodySize: r.body ? r.body.length : 0
                    },
                    response: {
                        status: r.status || 0,
                        statusText: r.statusText || '',
                        httpVersion: 'HTTP/1.1',
                        headers: this.formatHeaders(r.headers),
                        cookies: [],
                        content: {
                            size: r.responseText ? r.responseText.length : 0,
                            mimeType: r.headers?.['content-type'] || 'text/plain',
                            text: r.responseText || ''
                        },
                        redirectURL: '',
                        headersSize: -1,
                        bodySize: r.responseText ? r.responseText.length : 0
                    },
                    cache: {},
                    timings: {
                        send: 0,
                        wait: r.duration || 0,
                        receive: 0
                    }
                }))
            }
        };

        return har;
    }

    /**
     * Format headers for HAR export
     */
    formatHeaders(headers) {
        if (!headers) return [];
        
        if (Array.isArray(headers)) return headers;
        
        return Object.entries(headers).map(([name, value]) => ({
            name,
            value: String(value)
        }));
    }

    /**
     * Get summary statistics
     */
    getSummary() {
        const data = {
            total: this.requests.length,
            successful: this.requests.filter(r => r.status >= 200 && r.status < 300).length,
            failed: this.requests.filter(r => r.error || r.status >= 400).length,
            pending: this.requests.filter(r => !r.status).length,
            xhr: this.requests.filter(r => r.type === 'xhr').length,
            fetch: this.requests.filter(r => r.type === 'fetch').length,
            websocket: this.requests.filter(r => r.type === 'websocket').length,
            jsonResponses: this.requests.filter(r => r.parsedJSON).length
        };

        return data;
    }

    /**
     * Search requests by keyword
     */
    searchRequests(keyword) {
        const lowerKeyword = keyword.toLowerCase();
        
        return this.requests.filter(r => {
            return (
                r.url?.toLowerCase().includes(lowerKeyword) ||
                r.method?.toLowerCase().includes(lowerKeyword) ||
                r.responseText?.toLowerCase().includes(lowerKeyword) ||
                JSON.stringify(r.parsedJSON || {}).toLowerCase().includes(lowerKeyword)
            );
        });
    }

    /**
     * Get unique domains
     */
    getUniqueDomains() {
        const domains = new Set();
        
        this.requests.forEach(r => {
            try {
                const url = new URL(r.url);
                domains.add(url.hostname);
            } catch {}
        });

        return Array.from(domains);
    }

    /**
     * Reset monitoring data
     */
    async reset() {
        const { ipcRenderer } = require('electron');
        
        try {
            await ipcRenderer.invoke('ai-execute-action', `
                (function() {
                    if (window.__aiPageScraper) {
                        window.__aiPageScraper.reset();
                        return { success: true };
                    }
                    return { error: 'Scraper not initialized' };
                })();
            `);
            
            this.requests = [];
            console.log('🔄 Network monitoring data reset');
        } catch (error) {
            console.error('Failed to reset monitoring:', error);
        }
    }

    /**
     * Start continuous monitoring (poll for new data)
     */
    startContinuousMonitoring(interval = 5000) {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        this.monitoringInterval = setInterval(async () => {
            await this.getCapturedData();
        }, interval);

        console.log('🔄 Continuous monitoring started');
    }

    /**
     * Stop continuous monitoring
     */
    stopContinuousMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            console.log('⏹️ Continuous monitoring stopped');
        }
    }
}

// Export for use in renderer
if (typeof window !== 'undefined') {
    window.AINetworkMonitor = AINetworkMonitor;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AINetworkMonitor;
}
