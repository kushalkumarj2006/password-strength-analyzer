/**
 * wordlist.js - Manages loading and querying the breach database
 * Uses xato-net-10-million-passwords-100000.txt (100,000 real breached passwords)
 */

const BreachDB = (function() {
    let breachedPasswords = new Set();
    let isLoaded = false;
    let totalCount = 0;
    let loadingProgress = 0;
    let dbStatusListeners = [];

    // IndexedDB configuration for caching
    const DB_NAME = 'BreachDatabase';
    const STORE_NAME = 'passwords';
    const DB_VERSION = 1;

    async function initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }

    async function loadFromCache(db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get('passwordSet');
            
            request.onsuccess = () => {
                if (request.result && request.result.data) {
                    const cached = new Set(JSON.parse(request.result.data));
                    if (cached.size > 1000) {
                        resolve(cached);
                    } else {
                        reject(new Error('Cache too small'));
                    }
                } else {
                    reject(new Error('No cache found'));
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async function saveToCache(db, passwordSet) {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const data = JSON.stringify([...passwordSet]);
        store.put({ id: 'passwordSet', data: data });
    }

    async function loadFromFile(onProgress) {
        try {
            const response = await fetch('xato-net-10-million-passwords-100000.txt');
            if (!response.ok) throw new Error(`HTTP ${response.status}: File not found. Make sure the file is in the same folder.`);
            
            const text = await response.text();
            const lines = text.split('\n');
            const passwordSet = new Set();
            
            for (let i = 0; i < lines.length; i++) {
                const pwd = lines[i].trim().toLowerCase();
                if (pwd && pwd.length >= 4) {
                    passwordSet.add(pwd);
                }
                if (onProgress && i % 10000 === 0) {
                    onProgress((i / lines.length) * 100);
                }
            }
            
            return passwordSet;
        } catch (error) {
            console.error('File load error:', error);
            throw error;
        }
    }

    function addStatusListener(callback) {
        dbStatusListeners.push(callback);
    }

    function notifyStatus(status, message, data = {}) {
        dbStatusListeners.forEach(cb => cb({ status, message, ...data }));
    }

    async function loadBreachDatabase(onProgress) {
        try {
            notifyStatus('loading', 'Loading breach database...');
            
            // Try IndexedDB cache first
            const db = await initIndexedDB();
            const cachedSet = await loadFromCache(db).catch(() => null);
            
            if (cachedSet && cachedSet.size > 10000) {
                breachedPasswords = cachedSet;
                totalCount = breachedPasswords.size;
                isLoaded = true;
                notifyStatus('success', `✅ Loaded ${totalCount.toLocaleString()} passwords from cache!`, { count: totalCount });
                return true;
            }
            
            // Load from file
            notifyStatus('loading', 'Loading xato-net-10-million-passwords-100000.txt (first time - will cache)...');
            const passwordSet = await loadFromFile(onProgress);
            breachedPasswords = passwordSet;
            totalCount = breachedPasswords.size;
            isLoaded = true;
            
            // Save to cache
            await saveToCache(db, breachedPasswords);
            notifyStatus('success', `✅ Loaded ${totalCount.toLocaleString()} unique passwords! Cached for next time.`, { count: totalCount });
            return true;
            
        } catch (error) {
            console.error('Failed to load breach database:', error);
            loadFallbackDatabase();
            return false;
        }
    }

    function loadFallbackDatabase() {
        const fallback = [
            '123456', 'password', '12345678', 'qwerty', '123456789', '12345', '1234', '111111',
            '1234567', 'dragon', '123123', 'baseball', 'abc123', 'football', 'monkey', 'letmein',
            '696969', 'shadow', 'master', '666666', 'qwertyuiop', '123321', 'mustang'
        ];
        fallback.forEach(p => breachedPasswords.add(p));
        totalCount = breachedPasswords.size;
        isLoaded = true;
        notifyStatus('warning', `⚠️ Using fallback (${totalCount} passwords). Place xato-net-10-million-passwords-100000.txt in the same folder.`, { count: totalCount });
    }

    function isPasswordBreached(password) {
        if (!isLoaded) return false;
        return breachedPasswords.has(password.toLowerCase());
    }

    function getTotalCount() {
        return totalCount;
    }

    function isReady() {
        return isLoaded;
    }

    // Public API
    return {
        load: loadBreachDatabase,
        isBreached: isPasswordBreached,
        getCount: getTotalCount,
        isReady: isReady,
        onStatus: addStatusListener
    };
})();
