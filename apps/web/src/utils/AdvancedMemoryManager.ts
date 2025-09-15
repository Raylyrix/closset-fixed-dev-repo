/**
 * Advanced Memory Manager for Embroidery Tool
 * Handles memory optimization, caching, and leak prevention
 */

export interface MemoryStats {
  totalMemory: number;
  usedMemory: number;
  freeMemory: number;
  stitchCacheSize: number;
  textureCacheSize: number;
  renderCacheSize: number;
  gcCount: number;
  lastGcTime: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  size: number;
  priority: number;
}

export class AdvancedMemoryManager {
  private static instance: AdvancedMemoryManager;
  private stitchCache = new Map<string, CacheEntry<ImageData>>();
  private textureCache = new Map<string, CacheEntry<HTMLImageElement>>();
  private renderCache = new Map<string, CacheEntry<CanvasRenderingContext2D>>();
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  private currentCacheSize = 0;
  private gcThreshold = 0.8; // 80% memory usage triggers GC
  private gcCount = 0;
  private lastGcTime = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startCleanupInterval();
  }

  public static getInstance(): AdvancedMemoryManager {
    if (!AdvancedMemoryManager.instance) {
      AdvancedMemoryManager.instance = new AdvancedMemoryManager();
    }
    return AdvancedMemoryManager.instance;
  }

  /**
   * Cache a stitch rendering result
   */
  public cacheStitch(key: string, imageData: ImageData, priority: number = 1): void {
    const size = imageData.width * imageData.height * 4; // RGBA
    this.addToCache(this.stitchCache, key, imageData, size, priority);
  }

  /**
   * Get a cached stitch
   */
  public getCachedStitch(key: string): ImageData | null {
    return this.getFromCache(this.stitchCache, key);
  }

  /**
   * Cache a texture
   */
  public cacheTexture(key: string, texture: HTMLImageElement, priority: number = 2): void {
    const size = texture.width * texture.height * 4; // RGBA
    this.addToCache(this.textureCache, key, texture, size, priority);
  }

  /**
   * Get a cached texture
   */
  public getCachedTexture(key: string): HTMLImageElement | null {
    return this.getFromCache(this.textureCache, key);
  }

  /**
   * Cache a render context
   */
  public cacheRenderContext(key: string, context: CanvasRenderingContext2D, priority: number = 3): void {
    const canvas = context.canvas;
    const size = canvas.width * canvas.height * 4; // RGBA
    this.addToCache(this.renderCache, key, context, size, priority);
  }

  /**
   * Get a cached render context
   */
  public getCachedRenderContext(key: string): CanvasRenderingContext2D | null {
    return this.getFromCache(this.renderCache, key);
  }

  /**
   * Add item to cache with size management
   */
  private addToCache<T>(
    cache: Map<string, CacheEntry<T>>,
    key: string,
    data: T,
    size: number,
    priority: number
  ): void {
    // Remove existing entry if it exists
    if (cache.has(key)) {
      const existing = cache.get(key)!;
      this.currentCacheSize -= existing.size;
      cache.delete(key);
    }

    // Check if we need to free memory
    if (this.currentCacheSize + size > this.maxCacheSize) {
      this.performGarbageCollection();
    }

    // Add new entry
    const entry: CacheEntry<T> = {
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
  private getFromCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;

    // Update access statistics
    entry.accessCount++;
    entry.timestamp = Date.now();

    return entry.data;
  }

  /**
   * Perform garbage collection based on LRU and priority
   */
  private performGarbageCollection(): void {
    console.log('🧹 Performing memory garbage collection...');
    
    // Collect all entries with their scores
    const allEntries: Array<{ cache: Map<string, CacheEntry<any>>, key: string, entry: CacheEntry<any> }> = [];
    
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
      if (this.currentCacheSize - removedSize <= targetSize) break;
      
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
  private calculateScore(entry: CacheEntry<any>): number {
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
  private startCleanupInterval(): void {
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
  public dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.clearAllCaches();
  }

  /**
   * Clear all caches
   */
  public clearAllCaches(): void {
    this.stitchCache.clear();
    this.textureCache.clear();
    this.renderCache.clear();
    this.currentCacheSize = 0;
  }

  /**
   * Get memory statistics
   */
  public getMemoryStats(): MemoryStats {
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
  public forceGarbageCollection(): void {
    this.performGarbageCollection();
  }

  /**
   * Set cache size limit
   */
  public setCacheSizeLimit(limit: number): void {
    this.maxCacheSize = limit;
    if (this.currentCacheSize > this.maxCacheSize) {
      this.performGarbageCollection();
    }
  }

  /**
   * Get cache hit rate
   */
  public getCacheHitRate(): { stitch: number, texture: number, render: number } {
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

