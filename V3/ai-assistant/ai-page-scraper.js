/**
 * AI Page Scraper - Comprehensive Page Data Extraction
 * Captures ALL page data including XHR/fetch requests, storage, cookies, and application state
 * This module runs in the BrowserView context (injected via executeJavaScript)
 */

(function() {
    'use strict';

    // Global storage for captured data
    window.__aiPageData = {
        networkRequests: [],
        xhrRequests: [],
        fetchRequests: [],
        websockets: [],
        localStorage: {},
        sessionStorage: {},
        cookies: [],
        indexedDB: {},
        applicationState: {},
        jsonData: [],
        apiResponses: [],
        initialized: false,
        startTime: Date.now()
    };

    /**
     * Initialize all monitoring systems
     */
    function initializeMonitoring() {
        if (window.__aiPageData.initialized) {
            console.log('🔍 AI Page Scraper already initialized');
            return;
        }

        console.log('🚀 Initializing AI Page Scraper...');
        
        interceptXHR();
        interceptFetch();
        interceptWebSocket();
        captureStorage();
        captureCookies();
        captureApplicationState();
        monitorDOMChanges();
        
        window.__aiPageData.initialized = true;
        console.log('✅ AI Page Scraper initialized successfully');
    }

    /**
     * Intercept XMLHttpRequest to capture all XHR requests
     */
    function interceptXHR() {
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this.__aiRequestData = {
                method,
                url,
                timestamp: Date.now(),
                type: 'xhr'
            };
            return originalOpen.apply(this, [method, url, ...args]);
        };

        XMLHttpRequest.prototype.send = function(body) {
            const requestData = this.__aiRequestData || {};
            requestData.body = body;
            requestData.headers = {};

            // Capture response
            this.addEventListener('load', function() {
                try {
                    const response = {
                        ...requestData,
                        status: this.status,
                        statusText: this.statusText,
                        responseURL: this.responseURL,
                        responseType: this.responseType,
                        responseText: this.responseText,
                        duration: Date.now() - requestData.timestamp
                    };

                    // Try to parse JSON responses
                    if (this.responseType === '' || this.responseType === 'text') {
                        try {
                            response.parsedJSON = JSON.parse(this.responseText);
                            window.__aiPageData.jsonData.push({
                                source: 'xhr',
                                url: requestData.url,
                                data: response.parsedJSON,
                                timestamp: Date.now()
                            });
                        } catch (e) {
                            // Not JSON, that's okay
                        }
                    }

                    window.__aiPageData.xhrRequests.push(response);
                    window.__aiPageData.networkRequests.push(response);
                    
                    console.log('📡 XHR captured:', requestData.method, requestData.url);
                } catch (e) {
                    console.error('Failed to capture XHR response:', e);
                }
            });

            this.addEventListener('error', function() {
                window.__aiPageData.xhrRequests.push({
                    ...requestData,
                    error: true,
                    status: this.status,
                    duration: Date.now() - requestData.timestamp
                });
            });

            return originalSend.apply(this, arguments);
        };
    }

    /**
     * Intercept Fetch API to capture all fetch requests
     */
    function interceptFetch() {
        const originalFetch = window.fetch;

        window.fetch = async function(...args) {
            const [resource, config] = args;
            const url = typeof resource === 'string' ? resource : resource.url;
            const method = config?.method || 'GET';
            
            const requestData = {
                type: 'fetch',
                url,
                method,
                headers: config?.headers || {},
                body: config?.body,
                timestamp: Date.now()
            };

            try {
                const response = await originalFetch.apply(this, args);
                
                // Clone response to read it without consuming
                const clonedResponse = response.clone();
                
                const responseData = {
                    ...requestData,
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    url: response.url,
                    duration: Date.now() - requestData.timestamp
                };

                // Try to parse response body
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const jsonData = await clonedResponse.json();
                        responseData.parsedJSON = jsonData;
                        
                        window.__aiPageData.jsonData.push({
                            source: 'fetch',
                            url,
                            data: jsonData,
                            timestamp: Date.now()
                        });
                        
                        window.__aiPageData.apiResponses.push({
                            url,
                            method,
                            data: jsonData,
                            timestamp: Date.now()
                        });
                    } else {
                        responseData.responseText = await clonedResponse.text();
                    }
                } catch (e) {
                    // Could not parse body
                }

                window.__aiPageData.fetchRequests.push(responseData);
                window.__aiPageData.networkRequests.push(responseData);
                
                console.log('🌐 Fetch captured:', method, url);
                
                return response;
            } catch (error) {
                window.__aiPageData.fetchRequests.push({
                    ...requestData,
                    error: true,
                    errorMessage: error.message,
                    duration: Date.now() - requestData.timestamp
                });
                throw error;
            }
        };
    }

    /**
     * Intercept WebSocket connections
     */
    function interceptWebSocket() {
        const OriginalWebSocket = window.WebSocket;

        window.WebSocket = function(url, protocols) {
            const ws = new OriginalWebSocket(url, protocols);
            
            const wsData = {
                type: 'websocket',
                url,
                protocols,
                timestamp: Date.now(),
                messages: []
            };

            ws.addEventListener('open', () => {
                wsData.state = 'open';
                console.log('🔌 WebSocket opened:', url);
            });

            ws.addEventListener('message', (event) => {
                try {
                    let data = event.data;
                    try {
                        data = JSON.parse(event.data);
                        window.__aiPageData.jsonData.push({
                            source: 'websocket',
                            url,
                            data,
                            timestamp: Date.now()
                        });
                    } catch (e) {
                        // Not JSON
                    }
                    
                    wsData.messages.push({
                        type: 'received',
                        data,
                        timestamp: Date.now()
                    });
                } catch (e) {
                    console.error('Failed to capture WebSocket message:', e);
                }
            });

            ws.addEventListener('close', () => {
                wsData.state = 'closed';
                wsData.closedAt = Date.now();
            });

            ws.addEventListener('error', (error) => {
                wsData.error = true;
                wsData.errorMessage = error.message;
            });

            // Intercept send
            const originalSend = ws.send;
            ws.send = function(data) {
                try {
                    let parsedData = data;
                    try {
                        parsedData = JSON.parse(data);
                    } catch (e) {
                        // Not JSON
                    }
                    
                    wsData.messages.push({
                        type: 'sent',
                        data: parsedData,
                        timestamp: Date.now()
                    });
                } catch (e) {
                    console.error('Failed to capture WebSocket send:', e);
                }
                
                return originalSend.apply(this, arguments);
            };

            window.__aiPageData.websockets.push(wsData);
            
            return ws;
        };
    }

    /**
     * Capture all storage data (localStorage, sessionStorage)
     */
    function captureStorage() {
        try {
            // Capture localStorage
            window.__aiPageData.localStorage = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                
                // Try to parse JSON values
                try {
                    window.__aiPageData.localStorage[key] = JSON.parse(value);
                } catch (e) {
                    window.__aiPageData.localStorage[key] = value;
                }
            }

            // Capture sessionStorage
            window.__aiPageData.sessionStorage = {};
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                const value = sessionStorage.getItem(key);
                
                try {
                    window.__aiPageData.sessionStorage[key] = JSON.parse(value);
                } catch (e) {
                    window.__aiPageData.sessionStorage[key] = value;
                }
            }

            console.log('💾 Storage captured:', 
                Object.keys(window.__aiPageData.localStorage).length, 'localStorage items,',
                Object.keys(window.__aiPageData.sessionStorage).length, 'sessionStorage items'
            );
        } catch (e) {
            console.error('Failed to capture storage:', e);
        }
    }

    /**
     * Capture all cookies
     */
    function captureCookies() {
        try {
            const cookies = document.cookie.split(';').map(cookie => {
                const [name, ...valueParts] = cookie.trim().split('=');
                const value = valueParts.join('=');
                
                return {
                    name: name.trim(),
                    value: value.trim()
                };
            }).filter(c => c.name);

            window.__aiPageData.cookies = cookies;
            console.log('🍪 Cookies captured:', cookies.length, 'cookies');
        } catch (e) {
            console.error('Failed to capture cookies:', e);
        }
    }

    /**
     * Capture application state from common frameworks
     */
    function captureApplicationState() {
        try {
            const state = {};

            // React
            if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                state.react = {
                    detected: true,
                    version: window.React?.version
                };
            }

            // Redux
            if (window.__REDUX_DEVTOOLS_EXTENSION__) {
                state.redux = {
                    detected: true
                };
            }

            // Vue
            if (window.__VUE__) {
                state.vue = {
                    detected: true,
                    version: window.Vue?.version
                };
            }

            // Angular
            if (window.ng) {
                state.angular = {
                    detected: true
                };
            }

            // jQuery
            if (window.jQuery || window.$) {
                state.jquery = {
                    detected: true,
                    version: window.jQuery?.fn?.jquery || window.$?.fn?.jquery
                };
            }

            // Check for common global state objects
            const commonStateKeys = ['__INITIAL_STATE__', '__PRELOADED_STATE__', '__STATE__', 'APP_STATE', 'appState'];
            commonStateKeys.forEach(key => {
                if (window[key]) {
                    try {
                        state[key] = JSON.parse(JSON.stringify(window[key]));
                    } catch (e) {
                        state[key] = 'Could not serialize';
                    }
                }
            });

            window.__aiPageData.applicationState = state;
            console.log('🎯 Application state captured:', Object.keys(state).length, 'frameworks detected');
        } catch (e) {
            console.error('Failed to capture application state:', e);
        }
    }

    /**
     * Monitor DOM changes for dynamic content
     */
    function monitorDOMChanges() {
        try {
            const observer = new MutationObserver((mutations) => {
                // Track significant DOM changes
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(node => {
                            // Check for script tags with JSON data
                            if (node.tagName === 'SCRIPT' && node.type === 'application/json') {
                                try {
                                    const jsonData = JSON.parse(node.textContent);
                                    window.__aiPageData.jsonData.push({
                                        source: 'script-tag',
                                        data: jsonData,
                                        timestamp: Date.now()
                                    });
                                } catch (e) {
                                    // Not valid JSON
                                }
                            }
                        });
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            console.log('👀 DOM monitoring started');
        } catch (e) {
            console.error('Failed to start DOM monitoring:', e);
        }
    }

    /**
     * Capture IndexedDB data
     */
    async function captureIndexedDB() {
        try {
            const databases = await window.indexedDB.databases();
            const dbData = {};

            for (const dbInfo of databases) {
                try {
                    const db = await new Promise((resolve, reject) => {
                        const request = window.indexedDB.open(dbInfo.name);
                        request.onsuccess = () => resolve(request.result);
                        request.onerror = () => reject(request.error);
                    });

                    const storeNames = Array.from(db.objectStoreNames);
                    dbData[dbInfo.name] = {
                        version: db.version,
                        stores: {}
                    };

                    for (const storeName of storeNames) {
                        const transaction = db.transaction(storeName, 'readonly');
                        const store = transaction.objectStore(storeName);
                        
                        const data = await new Promise((resolve, reject) => {
                            const request = store.getAll();
                            request.onsuccess = () => resolve(request.result);
                            request.onerror = () => reject(request.error);
                        });

                        dbData[dbInfo.name].stores[storeName] = data;
                    }

                    db.close();
                } catch (e) {
                    console.error('Failed to read IndexedDB:', dbInfo.name, e);
                }
            }

            window.__aiPageData.indexedDB = dbData;
            console.log('🗄️ IndexedDB captured:', Object.keys(dbData).length, 'databases');
        } catch (e) {
            console.error('Failed to capture IndexedDB:', e);
        }
    }

    /**
     * Get all captured data
     */
    function getAllCapturedData() {
        // Update storage and cookies before returning
        captureStorage();
        captureCookies();
        
        return {
            ...window.__aiPageData,
            capturedAt: Date.now(),
            duration: Date.now() - window.__aiPageData.startTime,
            summary: {
                networkRequests: window.__aiPageData.networkRequests.length,
                xhrRequests: window.__aiPageData.xhrRequests.length,
                fetchRequests: window.__aiPageData.fetchRequests.length,
                websockets: window.__aiPageData.websockets.length,
                jsonDataPoints: window.__aiPageData.jsonData.length,
                localStorageKeys: Object.keys(window.__aiPageData.localStorage).length,
                sessionStorageKeys: Object.keys(window.__aiPageData.sessionStorage).length,
                cookies: window.__aiPageData.cookies.length,
                indexedDBs: Object.keys(window.__aiPageData.indexedDB).length
            }
        };
    }

    /**
     * Reset all captured data
     */
    function resetCapturedData() {
        window.__aiPageData = {
            networkRequests: [],
            xhrRequests: [],
            fetchRequests: [],
            websockets: [],
            localStorage: {},
            sessionStorage: {},
            cookies: [],
            indexedDB: {},
            applicationState: {},
            jsonData: [],
            apiResponses: [],
            initialized: true,
            startTime: Date.now()
        };
        console.log('🔄 Captured data reset');
    }

    // Expose API
    window.__aiPageScraper = {
        initialize: initializeMonitoring,
        getData: getAllCapturedData,
        reset: resetCapturedData,
        captureIndexedDB: captureIndexedDB
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMonitoring);
    } else {
        initializeMonitoring();
    }

    console.log('✅ AI Page Scraper module loaded');
})();
