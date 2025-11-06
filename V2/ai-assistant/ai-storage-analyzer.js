/**
 * AI Storage Analyzer - Comprehensive Browser Storage Analysis
 * Analyzes localStorage, sessionStorage, IndexedDB, cookies, and cache
 * This module runs in the renderer process
 */

class AIStorageAnalyzer {
    constructor() {
        this.storageData = {
            localStorage: {},
            sessionStorage: {},
            cookies: [],
            indexedDB: {},
            cacheStorage: {}
        };
    }

    /**
     * Capture all storage data from the page
     */
    async captureAllStorage() {
        const { ipcRenderer } = require('electron');
        
        try {
            const result = await ipcRenderer.invoke('ai-execute-action', `
                (async function() {
                    const data = {
                        localStorage: {},
                        sessionStorage: {},
                        cookies: [],
                        indexedDB: {},
                        cacheStorage: {}
                    };

                    // Capture localStorage
                    try {
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            const value = localStorage.getItem(key);
                            try {
                                data.localStorage[key] = JSON.parse(value);
                            } catch {
                                data.localStorage[key] = value;
                            }
                        }
                    } catch (e) {
                        data.localStorageError = e.message;
                    }

                    // Capture sessionStorage
                    try {
                        for (let i = 0; i < sessionStorage.length; i++) {
                            const key = sessionStorage.key(i);
                            const value = sessionStorage.getItem(key);
                            try {
                                data.sessionStorage[key] = JSON.parse(value);
                            } catch {
                                data.sessionStorage[key] = value;
                            }
                        }
                    } catch (e) {
                        data.sessionStorageError = e.message;
                    }

                    // Capture cookies
                    try {
                        data.cookies = document.cookie.split(';').map(cookie => {
                            const [name, ...valueParts] = cookie.trim().split('=');
                            return {
                                name: name.trim(),
                                value: valueParts.join('=').trim()
                            };
                        }).filter(c => c.name);
                    } catch (e) {
                        data.cookiesError = e.message;
                    }

                    // Capture IndexedDB
                    try {
                        if (window.indexedDB && window.indexedDB.databases) {
                            const databases = await window.indexedDB.databases();
                            
                            for (const dbInfo of databases) {
                                try {
                                    const db = await new Promise((resolve, reject) => {
                                        const request = window.indexedDB.open(dbInfo.name);
                                        request.onsuccess = () => resolve(request.result);
                                        request.onerror = () => reject(request.error);
                                        request.onblocked = () => reject(new Error('Database blocked'));
                                    });

                                    const storeNames = Array.from(db.objectStoreNames);
                                    data.indexedDB[dbInfo.name] = {
                                        version: db.version,
                                        stores: {}
                                    };

                                    for (const storeName of storeNames) {
                                        try {
                                            const transaction = db.transaction(storeName, 'readonly');
                                            const store = transaction.objectStore(storeName);
                                            
                                            const storeData = await new Promise((resolve, reject) => {
                                                const request = store.getAll();
                                                request.onsuccess = () => resolve(request.result);
                                                request.onerror = () => reject(request.error);
                                            });

                                            data.indexedDB[dbInfo.name].stores[storeName] = {
                                                count: storeData.length,
                                                data: storeData.slice(0, 100) // Limit to first 100 items
                                            };
                                        } catch (storeError) {
                                            data.indexedDB[dbInfo.name].stores[storeName] = {
                                                error: storeError.message
                                            };
                                        }
                                    }

                                    db.close();
                                } catch (dbError) {
                                    data.indexedDB[dbInfo.name] = {
                                        error: dbError.message
                                    };
                                }
                            }
                        }
                    } catch (e) {
                        data.indexedDBError = e.message;
                    }

                    // Capture Cache Storage
                    try {
                        if (window.caches) {
                            const cacheNames = await window.caches.keys();
                            
                            for (const cacheName of cacheNames) {
                                const cache = await window.caches.open(cacheName);
                                const requests = await cache.keys();
                                
                                data.cacheStorage[cacheName] = {
                                    count: requests.length,
                                    urls: requests.slice(0, 50).map(req => req.url)
                                };
                            }
                        }
                    } catch (e) {
                        data.cacheStorageError = e.message;
                    }

                    return data;
                })();
            `);

            if (result.success && result.result) {
                this.storageData = result.result;
                return result.result;
            }

            return { error: 'Failed to capture storage' };
        } catch (error) {
            console.error('Failed to capture storage:', error);
            return { error: error.message };
        }
    }

    /**
     * Analyze localStorage data
     */
    analyzeLocalStorage() {
        const analysis = {
            totalKeys: Object.keys(this.storageData.localStorage).length,
            totalSize: 0,
            jsonKeys: [],
            stringKeys: [],
            numberKeys: [],
            booleanKeys: [],
            arrayKeys: [],
            objectKeys: [],
            largestItems: []
        };

        Object.entries(this.storageData.localStorage).forEach(([key, value]) => {
            const size = JSON.stringify(value).length;
            analysis.totalSize += size;

            const type = typeof value;
            
            if (Array.isArray(value)) {
                analysis.arrayKeys.push({ key, length: value.length, size });
            } else if (type === 'object' && value !== null) {
                analysis.objectKeys.push({ key, keys: Object.keys(value).length, size });
            } else if (type === 'string') {
                analysis.stringKeys.push({ key, length: value.length, size });
            } else if (type === 'number') {
                analysis.numberKeys.push({ key, value, size });
            } else if (type === 'boolean') {
                analysis.booleanKeys.push({ key, value, size });
            }

            analysis.largestItems.push({ key, size, type });
        });

        // Sort largest items
        analysis.largestItems.sort((a, b) => b.size - a.size);
        analysis.largestItems = analysis.largestItems.slice(0, 10);

        return analysis;
    }

    /**
     * Analyze sessionStorage data
     */
    analyzeSessionStorage() {
        const analysis = {
            totalKeys: Object.keys(this.storageData.sessionStorage).length,
            totalSize: 0,
            keys: []
        };

        Object.entries(this.storageData.sessionStorage).forEach(([key, value]) => {
            const size = JSON.stringify(value).length;
            analysis.totalSize += size;
            analysis.keys.push({
                key,
                type: typeof value,
                size
            });
        });

        return analysis;
    }

    /**
     * Analyze cookies
     */
    analyzeCookies() {
        const analysis = {
            total: this.storageData.cookies.length,
            byDomain: {},
            httpOnly: [],
            secure: [],
            sameSite: []
        };

        this.storageData.cookies.forEach(cookie => {
            // Try to extract domain from cookie name patterns
            const domain = this.extractDomainFromCookie(cookie);
            if (domain) {
                analysis.byDomain[domain] = (analysis.byDomain[domain] || 0) + 1;
            }
        });

        return analysis;
    }

    /**
     * Analyze IndexedDB
     */
    analyzeIndexedDB() {
        const analysis = {
            totalDatabases: Object.keys(this.storageData.indexedDB).length,
            databases: []
        };

        Object.entries(this.storageData.indexedDB).forEach(([name, db]) => {
            if (db.error) {
                analysis.databases.push({
                    name,
                    error: db.error
                });
            } else {
                const storeCount = Object.keys(db.stores || {}).length;
                let totalRecords = 0;

                Object.values(db.stores || {}).forEach(store => {
                    if (store.count) {
                        totalRecords += store.count;
                    }
                });

                analysis.databases.push({
                    name,
                    version: db.version,
                    stores: storeCount,
                    totalRecords
                });
            }
        });

        return analysis;
    }

    /**
     * Search storage for specific data
     */
    searchStorage(keyword) {
        const results = {
            localStorage: [],
            sessionStorage: [],
            cookies: [],
            indexedDB: []
        };

        const lowerKeyword = keyword.toLowerCase();

        // Search localStorage
        Object.entries(this.storageData.localStorage).forEach(([key, value]) => {
            const valueStr = JSON.stringify(value).toLowerCase();
            if (key.toLowerCase().includes(lowerKeyword) || valueStr.includes(lowerKeyword)) {
                results.localStorage.push({ key, value });
            }
        });

        // Search sessionStorage
        Object.entries(this.storageData.sessionStorage).forEach(([key, value]) => {
            const valueStr = JSON.stringify(value).toLowerCase();
            if (key.toLowerCase().includes(lowerKeyword) || valueStr.includes(lowerKeyword)) {
                results.sessionStorage.push({ key, value });
            }
        });

        // Search cookies
        this.storageData.cookies.forEach(cookie => {
            if (cookie.name.toLowerCase().includes(lowerKeyword) || 
                cookie.value.toLowerCase().includes(lowerKeyword)) {
                results.cookies.push(cookie);
            }
        });

        // Search IndexedDB
        Object.entries(this.storageData.indexedDB).forEach(([dbName, db]) => {
            if (dbName.toLowerCase().includes(lowerKeyword)) {
                results.indexedDB.push({ database: dbName, match: 'name' });
            }

            if (db.stores) {
                Object.entries(db.stores).forEach(([storeName, store]) => {
                    if (storeName.toLowerCase().includes(lowerKeyword)) {
                        results.indexedDB.push({ 
                            database: dbName, 
                            store: storeName, 
                            match: 'store name' 
                        });
                    }

                    if (store.data) {
                        const dataStr = JSON.stringify(store.data).toLowerCase();
                        if (dataStr.includes(lowerKeyword)) {
                            results.indexedDB.push({ 
                                database: dbName, 
                                store: storeName, 
                                match: 'data' 
                            });
                        }
                    }
                });
            }
        });

        return results;
    }

    /**
     * Get storage summary
     */
    getSummary() {
        return {
            localStorage: {
                keys: Object.keys(this.storageData.localStorage).length,
                size: JSON.stringify(this.storageData.localStorage).length
            },
            sessionStorage: {
                keys: Object.keys(this.storageData.sessionStorage).length,
                size: JSON.stringify(this.storageData.sessionStorage).length
            },
            cookies: {
                count: this.storageData.cookies.length
            },
            indexedDB: {
                databases: Object.keys(this.storageData.indexedDB).length
            },
            cacheStorage: {
                caches: Object.keys(this.storageData.cacheStorage).length
            }
        };
    }

    /**
     * Extract user data patterns
     */
    extractUserData() {
        const userData = {
            authentication: {},
            preferences: {},
            session: {},
            cache: {}
        };

        // Common auth patterns
        const authPatterns = ['token', 'auth', 'jwt', 'session', 'user', 'login', 'access'];
        const prefPatterns = ['pref', 'setting', 'config', 'theme', 'lang'];
        
        // Search localStorage
        Object.entries(this.storageData.localStorage).forEach(([key, value]) => {
            const lowerKey = key.toLowerCase();
            
            if (authPatterns.some(p => lowerKey.includes(p))) {
                userData.authentication[key] = this.sanitizeValue(value);
            } else if (prefPatterns.some(p => lowerKey.includes(p))) {
                userData.preferences[key] = value;
            } else {
                userData.cache[key] = this.sanitizeValue(value);
            }
        });

        // Search cookies
        this.storageData.cookies.forEach(cookie => {
            const lowerName = cookie.name.toLowerCase();
            
            if (authPatterns.some(p => lowerName.includes(p))) {
                userData.authentication[cookie.name] = this.sanitizeValue(cookie.value);
            }
        });

        return userData;
    }

    /**
     * Sanitize sensitive values
     */
    sanitizeValue(value) {
        if (typeof value === 'string' && value.length > 50) {
            return value.substring(0, 50) + '... [truncated]';
        }
        return value;
    }

    /**
     * Extract domain from cookie
     */
    extractDomainFromCookie(cookie) {
        // Try to extract domain from cookie name
        const parts = cookie.name.split('_');
        if (parts.length > 1) {
            return parts[0];
        }
        return 'unknown';
    }

    /**
     * Export storage data
     */
    exportData(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.storageData, null, 2);
        } else if (format === 'csv') {
            // Convert to CSV format
            let csv = 'Storage Type,Key,Value,Size\n';
            
            Object.entries(this.storageData.localStorage).forEach(([key, value]) => {
                const valueStr = JSON.stringify(value).replace(/"/g, '""');
                csv += `localStorage,"${key}","${valueStr}",${valueStr.length}\n`;
            });

            Object.entries(this.storageData.sessionStorage).forEach(([key, value]) => {
                const valueStr = JSON.stringify(value).replace(/"/g, '""');
                csv += `sessionStorage,"${key}","${valueStr}",${valueStr.length}\n`;
            });

            return csv;
        }
        
        return this.storageData;
    }

    /**
     * Clear specific storage type
     */
    async clearStorage(type) {
        const { ipcRenderer } = require('electron');
        
        const code = `
            (function() {
                try {
                    if ('${type}' === 'localStorage') {
                        localStorage.clear();
                    } else if ('${type}' === 'sessionStorage') {
                        sessionStorage.clear();
                    } else if ('${type}' === 'cookies') {
                        document.cookie.split(';').forEach(c => {
                            document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
                        });
                    }
                    return { success: true };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            })();
        `;

        return await ipcRenderer.invoke('ai-execute-action', code);
    }

    /**
     * Get storage quota information
     */
    async getStorageQuota() {
        const { ipcRenderer } = require('electron');
        
        try {
            const result = await ipcRenderer.invoke('ai-execute-action', `
                (async function() {
                    if (navigator.storage && navigator.storage.estimate) {
                        const estimate = await navigator.storage.estimate();
                        return {
                            usage: estimate.usage,
                            quota: estimate.quota,
                            usagePercent: (estimate.usage / estimate.quota * 100).toFixed(2)
                        };
                    }
                    return { error: 'Storage API not available' };
                })();
            `);

            return result.success ? result.result : { error: 'Failed to get quota' };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Export for use in renderer
if (typeof window !== 'undefined') {
    window.AIStorageAnalyzer = AIStorageAnalyzer;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIStorageAnalyzer;
}
