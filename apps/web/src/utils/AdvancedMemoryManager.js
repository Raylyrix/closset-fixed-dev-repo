/**
 * Advanced Memory Manager for Embroidery Tool
 * Handles memory optimization, caching, and leak prevention
 */
export class AdvancedMemoryManager {
    constructor() {
        this.stitchCache = new Map();
        this.textureCache = new Map();
        this.renderCache = new Map();
        this.maxCacheSize = 50 * 1024 * 1024; // 50MB
        this.currentCacheSize = 0;
        this.gcThreshold = 0.8; // 80% memory usage triggers GC
        this.gcCount = 0;
        this.lastGcTime = 0;
        this.cleanupInterval = null;
        this.startCleanupInterval();
    }
    static getInstance() {
        if (!AdvancedMemoryManager.instance) {
            AdvancedMemoryManager.instance = new AdvancedMemoryManager();
        }
        return AdvancedMemoryManager.instance;
    }
    /**
     * Cache a stitch rendering result
     */
    cacheStitch(key, imageData, priority = 1) {
        const size = imageData.width * imageData.height * 4; // RGBA
        this.addToCache(this.stitchCache, key, imageData, size, priority);
    }
    /**
     * Get a cached stitch
     */
    getCachedStitch(key) {
        return this.getFromCache(this.stitchCache, key);
    }
    /**
     * Cache a texture
     */
    cacheTexture(key, texture, priority = 2) {
        const size = texture.width * texture.height * 4; // RGBA
        this.addToCache(this.textureCache, key, texture, size, priority);
    }
    /**
     * Get a cached texture
     */
    getCachedTexture(key) {
        return this.getFromCache(this.textureCache, key);
    }
    /**
     * Cache a render context
     */
    cacheRenderContext(key, context, priority = 3) {
        const canvas = context.canvas;
        const size = canvas.width * canvas.height * 4; // RGBA
        this.addToCache(this.renderCache, key, context, size, priority);
    }
    /**
     * Get a cached render context
     */
    getCachedRenderContext(key) {
        return this.getFromCache(this.renderCache, key);
    }
    /**
     * Add item to cache with size management
     */
    addToCache(cache, key, data, size, priority) {
        // Remove existing entry if it exists
        if (cache.has(key)) {
            const existing = cache.get(key);
            this.currentCacheSize -= existing.size;
            cache.delete(key);
        }
        // Check if we need to free memory
        if (this.currentCacheSize + size > this.maxCacheSize) {
            this.performGarbageCollection();
        }
        // Add new entry
        const entry = {
            data,
            timestamp: Date.now(),
            accessCount: 0,
            size,
            priority
        };
        cache.set(key, entry);
        this.currentCacheSize += size;
    }
    /**
     * Get item from cache with access tracking
     */
    getFromCache(cache, key) {
        const entry = cache.get(key);
        if (!entry)
            return null;
        // Update access statistics
        entry.accessCount++;
        entry.timestamp = Date.now();
        return entry.data;
    }
    /**
     * Perform garbage collection based on LRU and priority
     */
    performGarbageCollection() {
        console.log('🧹 Performing memory garbage collection...');
        // Collect all entries with their scores
        const allEntries = [];
        for (const [key, entry] of this.stitchCache.entries()) {
            allEntries.push({ cache: this.stitchCache, key, entry });
        }
        for (const [key, entry] of this.textureCache.entries()) {
            allEntries.push({ cache: this.textureCache, key, entry });
        }
        for (const [key, entry] of this.renderCache.entries()) {
            allEntries.push({ cache: this.renderCache, key, entry });
        }
        // Sort by score (lower score = more likely to be removed)
        allEntries.sort((a, b) => {
            const scoreA = this.calculateScore(a.entry);
            const scoreB = this.calculateScore(b.entry);
            return scoreA - scoreB;
        });
        // Remove entries until we're under the threshold
        const targetSize = this.maxCacheSize * this.gcThreshold;
        let removedSize = 0;
        for (const { cache, key, entry } of allEntries) {
            if (this.currentCacheSize - removedSize <= targetSize)
                break;
            cache.delete(key);
            removedSize += entry.size;
        }
        this.currentCacheSize -= removedSize;
        this.gcCount++;
        this.lastGcTime = Date.now();
        console.log(`🧹 GC completed: removed ${removedSize} bytes, ${this.gcCount} total GCs`);
    }
    /**
     * Calculate cache entry score (lower = more likely to be removed)
     */
    calculateScore(entry) {
        const age = Date.now() - entry.timestamp;
        const ageScore = age / (1000 * 60 * 5); // 5 minutes = 1 point
        const accessScore = 1 / (entry.accessCount + 1); // More accesses = lower score
        const priorityScore = 1 / entry.priority; // Higher priority = lower score
        const sizeScore = entry.size / (1024 * 1024); // Larger size = higher score
        return ageScore + accessScore + priorityScore + sizeScore;
    }
    /**
     * Start periodic cleanup
     */
    startCleanupInterval() {
        this.cleanupInterval = setInterval(() => {
            const memoryUsage = this.getMemoryStats();
            if (memoryUsage.usedMemory / memoryUsage.totalMemory > this.gcThreshold) {
                this.performGarbageCollection();
            }
        }, 30000); // Check every 30 seconds
    }
    /**
     * Stop cleanup interval
     */
    dispose() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.clearAllCaches();
    }
    /**
     * Clear all caches
     */
    clearAllCaches() {
        this.stitchCache.clear();
        this.textureCache.clear();
        this.renderCache.clear();
        this.currentCacheSize = 0;
    }
    /**
     * Get memory statistics
     */
    getMemoryStats() {
        const stitchCacheSize = Array.from(this.stitchCache.values())
            .reduce((sum, entry) => sum + entry.size, 0);
        const textureCacheSize = Array.from(this.textureCache.values())
            .reduce((sum, entry) => sum + entry.size, 0);
        const renderCacheSize = Array.from(this.renderCache.values())
            .reduce((sum, entry) => sum + entry.size, 0);
        return {
            totalMemory: this.maxCacheSize,
            usedMemory: this.currentCacheSize,
            freeMemory: this.maxCacheSize - this.currentCacheSize,
            stitchCacheSize,
            textureCacheSize,
            renderCacheSize,
            gcCount: this.gcCount,
            lastGcTime: this.lastGcTime
        };
    }
    /**
     * Force garbage collection
     */
    forceGarbageCollection() {
        this.performGarbageCollection();
    }
    /**
     * Set cache size limit
     */
    setCacheSizeLimit(limit) {
        this.maxCacheSize = limit;
        if (this.currentCacheSize > this.maxCacheSize) {
            this.performGarbageCollection();
        }
    }
    /**
     * Get cache hit rate
     */
    getCacheHitRate() {
        const stitchHits = Array.from(this.stitchCache.values())
            .reduce((sum, entry) => sum + entry.accessCount, 0);
        const textureHits = Array.from(this.textureCache.values())
            .reduce((sum, entry) => sum + entry.accessCount, 0);
        const renderHits = Array.from(this.renderCache.values())
            .reduce((sum, entry) => sum + entry.accessCount, 0);
        return {
            stitch: stitchHits,
            texture: textureHits,
            render: renderHits
        };
    }
}
// Export singleton instance
export const advancedMemoryManager = AdvancedMemoryManager.getInstance();
