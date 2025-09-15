/**
 * Enhanced Memory Manager
 * Fixes critical memory leaks and implements proper cache management
 */
export class EnhancedMemoryManager {
    constructor() {
        this.stitchCache = new Map();
        this.layerCache = new Map();
        this.maxCacheSize = 50 * 1024 * 1024; // 50MB
        this.maxCacheEntries = 1000;
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes
        this.cleanupInterval = 30 * 1000; // 30 seconds
        this.cleanupTimer = null;
        this.isCleaning = false;
        this.startCleanupTimer();
    }
    // Stitch Cache Management
    setStitchCache(key, imageData) {
        const size = this.calculateImageDataSize(imageData);
        // Check if we need to make room
        this.ensureCacheSpace(size);
        const entry = {
            data: imageData,
            timestamp: Date.now(),
            accessCount: 0,
            size
        };
        this.stitchCache.set(key, entry);
    }
    getStitchCache(key) {
        const entry = this.stitchCache.get(key);
        if (!entry)
            return null;
        // Check TTL
        if (Date.now() - entry.timestamp > this.cacheTTL) {
            this.stitchCache.delete(key);
            return null;
        }
        // Update access count
        entry.accessCount++;
        return entry.data;
    }
    // Layer Cache Management
    setLayerCache(key, imageData) {
        const size = this.calculateImageDataSize(imageData);
        // Check if we need to make room
        this.ensureCacheSpace(size);
        const entry = {
            data: imageData,
            timestamp: Date.now(),
            accessCount: 0,
            size
        };
        this.layerCache.set(key, entry);
    }
    getLayerCache(key) {
        const entry = this.layerCache.get(key);
        if (!entry)
            return null;
        // Check TTL
        if (Date.now() - entry.timestamp > this.cacheTTL) {
            this.layerCache.delete(key);
            return null;
        }
        // Update access count
        entry.accessCount++;
        return entry.data;
    }
    // Cache Space Management
    ensureCacheSpace(requiredSize) {
        const currentSize = this.getTotalCacheSize();
        if (currentSize + requiredSize > this.maxCacheSize) {
            this.cleanupCache(requiredSize);
        }
    }
    cleanupCache(requiredSize) {
        if (this.isCleaning)
            return;
        this.isCleaning = true;
        try {
            // Sort entries by access count and timestamp (LRU)
            const allEntries = [
                ...Array.from(this.stitchCache.entries()).map(([key, entry]) => ({ key, entry, type: 'stitch' })),
                ...Array.from(this.layerCache.entries()).map(([key, entry]) => ({ key, entry, type: 'layer' }))
            ].sort((a, b) => {
                // Sort by access count (ascending) then by timestamp (ascending)
                if (a.entry.accessCount !== b.entry.accessCount) {
                    return a.entry.accessCount - b.entry.accessCount;
                }
                return a.entry.timestamp - b.entry.timestamp;
            });
            let freedSize = 0;
            let removedCount = 0;
            // Remove least recently used entries until we have enough space
            for (const { key, entry, type } of allEntries) {
                if (freedSize >= requiredSize && removedCount >= 10)
                    break; // Remove at least 10 entries or enough space
                freedSize += entry.size;
                removedCount++;
                if (type === 'stitch') {
                    this.stitchCache.delete(key);
                }
                else {
                    this.layerCache.delete(key);
                }
            }
            console.log(`🧹 Cache cleanup: freed ${freedSize} bytes, removed ${removedCount} entries`);
        }
        finally {
            this.isCleaning = false;
        }
    }
    // Memory Statistics
    getMemoryStats() {
        const used = this.getTotalCacheSize();
        const total = this.maxCacheSize;
        const percentage = (used / total) * 100;
        const isHealthy = percentage < 80;
        const cacheEntries = this.stitchCache.size + this.layerCache.size;
        const cacheSize = used;
        return {
            used,
            total,
            percentage,
            isHealthy,
            cacheEntries,
            cacheSize
        };
    }
    getTotalCacheSize() {
        let total = 0;
        for (const entry of this.stitchCache.values()) {
            total += entry.size;
        }
        for (const entry of this.layerCache.values()) {
            total += entry.size;
        }
        return total;
    }
    calculateImageDataSize(imageData) {
        return imageData.width * imageData.height * 4; // RGBA = 4 bytes per pixel
    }
    // Cleanup Timer
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.performScheduledCleanup();
        }, this.cleanupInterval);
    }
    performScheduledCleanup() {
        if (this.isCleaning)
            return;
        const stats = this.getMemoryStats();
        // Cleanup if memory usage is high or cache is large
        if (stats.percentage > 70 || stats.cacheEntries > this.maxCacheEntries * 0.8) {
            this.cleanupCache(0); // Cleanup without specific size requirement
        }
    }
    // Manual Cleanup
    clearAllCaches() {
        this.stitchCache.clear();
        this.layerCache.clear();
        console.log('🧹 All caches cleared');
    }
    clearExpiredEntries() {
        const now = Date.now();
        let removedCount = 0;
        // Clear expired stitch cache entries
        for (const [key, entry] of this.stitchCache.entries()) {
            if (now - entry.timestamp > this.cacheTTL) {
                this.stitchCache.delete(key);
                removedCount++;
            }
        }
        // Clear expired layer cache entries
        for (const [key, entry] of this.layerCache.entries()) {
            if (now - entry.timestamp > this.cacheTTL) {
                this.layerCache.delete(key);
                removedCount++;
            }
        }
        console.log(`🧹 Cleared ${removedCount} expired cache entries`);
    }
    // Configuration
    setMaxCacheSize(size) {
        this.maxCacheSize = size;
    }
    setMaxCacheEntries(entries) {
        this.maxCacheEntries = entries;
    }
    setCacheTTL(ttl) {
        this.cacheTTL = ttl;
    }
    // Cleanup
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        this.clearAllCaches();
    }
}
// Singleton instance
export const enhancedMemoryManager = new EnhancedMemoryManager();
