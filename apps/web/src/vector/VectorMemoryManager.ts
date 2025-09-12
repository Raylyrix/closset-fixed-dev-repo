/**
 * 🎯 Vector Memory Manager - Memory Leak Prevention System
 * 
 * Fixes memory management issues by providing:
 * - Automatic cleanup
 * - Resource pooling
 * - Memory monitoring
 * - Garbage collection triggers
 */

import { EventEmitter } from 'events';

export interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  memoryUsage: number; // Percentage
  leakCount: number;
  cleanupCount: number;
}

export interface ResourcePool<T> {
  items: T[];
  maxSize: number;
  createFn: () => T;
  resetFn: (item: T) => void;
  destroyFn: (item: T) => void;
}

export interface CleanupTask {
  id: string;
  priority: number;
  task: () => void;
  scheduledTime: number;
  interval?: number;
}

export interface MemoryThreshold {
  warning: number; // Percentage
  critical: number; // Percentage
  emergency: number; // Percentage
}

export class VectorMemoryManager extends EventEmitter {
  private static instance: VectorMemoryManager;
  
  // Resource pools
  private resourcePools: Map<string, ResourcePool<any>> = new Map();
  
  // Cleanup tasks
  private cleanupTasks: Map<string, CleanupTask> = new Map();
  private cleanupScheduler: number | null = null;
  
  // Memory monitoring
  private memoryMonitor: number | null = null;
  private memoryStats: MemoryStats = {
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
    memoryUsage: 0,
    leakCount: 0,
    cleanupCount: 0
  };
  
  // Memory thresholds
  private thresholds: MemoryThreshold = {
    warning: 70,
    critical: 85,
    emergency: 95
  };
  
  // Cleanup intervals
  private readonly CLEANUP_INTERVAL = 5000; // 5 seconds
  private readonly MEMORY_CHECK_INTERVAL = 1000; // 1 second
  
  // Event types
  public static readonly EVENTS = {
    MEMORY_WARNING: 'memory:warning',
    MEMORY_CRITICAL: 'memory:critical',
    MEMORY_EMERGENCY: 'memory:emergency',
    CLEANUP_STARTED: 'cleanup:started',
    CLEANUP_COMPLETED: 'cleanup:completed',
    LEAK_DETECTED: 'leak:detected'
  };

  private constructor() {
    super();
    this.setMaxListeners(50);
    this.startMemoryMonitoring();
    this.startCleanupScheduler();
  }

  public static getInstance(): VectorMemoryManager {
    if (!VectorMemoryManager.instance) {
      VectorMemoryManager.instance = new VectorMemoryManager();
    }
    return VectorMemoryManager.instance;
  }

  /**
   * Create a resource pool
   */
  public createResourcePool<T>(
    name: string,
    maxSize: number,
    createFn: () => T,
    resetFn: (item: T) => void,
    destroyFn: (item: T) => void
  ): void {
    const pool: ResourcePool<T> = {
      items: [],
      maxSize,
      createFn,
      resetFn,
      destroyFn
    };
    
    this.resourcePools.set(name, pool);
  }

  /**
   * Get item from resource pool
   */
  public getFromPool<T>(poolName: string): T | null {
    const pool = this.resourcePools.get(poolName) as ResourcePool<T>;
    if (!pool) {
      console.warn(`Resource pool '${poolName}' not found`);
      return null;
    }
    
    if (pool.items.length > 0) {
      return pool.items.pop()!;
    }
    
    // Create new item if pool is empty
    return pool.createFn();
  }

  /**
   * Return item to resource pool
   */
  public returnToPool<T>(poolName: string, item: T): void {
    const pool = this.resourcePools.get(poolName) as ResourcePool<T>;
    if (!pool) {
      console.warn(`Resource pool '${poolName}' not found`);
      return;
    }
    
    if (pool.items.length < pool.maxSize) {
      pool.resetFn(item);
      pool.items.push(item);
    } else {
      // Pool is full, destroy the item
      pool.destroyFn(item);
    }
  }

  /**
   * Schedule cleanup task
   */
  public scheduleCleanup(
    id: string,
    task: () => void,
    priority: number = 1,
    interval?: number
  ): void {
    const cleanupTask: CleanupTask = {
      id,
      priority,
      task,
      scheduledTime: Date.now(),
      interval
    };
    
    this.cleanupTasks.set(id, cleanupTask);
  }

  /**
   * Cancel cleanup task
   */
  public cancelCleanup(id: string): void {
    this.cleanupTasks.delete(id);
  }

  /**
   * Force immediate cleanup
   */
  public forceCleanup(): void {
    this.emit(VectorMemoryManager.EVENTS.CLEANUP_STARTED);
    
    try {
      // Clean up resource pools
      this.cleanupResourcePools();
      
      // Run cleanup tasks
      this.runCleanupTasks();
      
      // Force garbage collection if available
      this.forceGarbageCollection();
      
      this.memoryStats.cleanupCount++;
      this.emit(VectorMemoryManager.EVENTS.CLEANUP_COMPLETED);
      
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Get current memory statistics
   */
  public getMemoryStats(): MemoryStats {
    return { ...this.memoryStats };
  }

  /**
   * Set memory thresholds
   */
  public setThresholds(thresholds: Partial<MemoryThreshold>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    this.memoryMonitor = window.setInterval(() => {
      this.checkMemoryUsage();
    }, this.MEMORY_CHECK_INTERVAL);
  }

  /**
   * Start cleanup scheduler
   */
  private startCleanupScheduler(): void {
    this.cleanupScheduler = window.setInterval(() => {
      this.runScheduledCleanup();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Check memory usage and trigger cleanup if needed
   */
  private checkMemoryUsage(): void {
    if (!(performance as any).memory) {
      return; // Memory API not available
    }
    
    const memory = (performance as any).memory;
    const used = memory.usedJSHeapSize;
    const total = memory.totalJSHeapSize;
    const limit = memory.jsHeapSizeLimit;
    
    this.memoryStats = {
      usedJSHeapSize: used,
      totalJSHeapSize: total,
      jsHeapSizeLimit: limit,
      memoryUsage: (used / limit) * 100,
      leakCount: this.memoryStats.leakCount,
      cleanupCount: this.memoryStats.cleanupCount
    };
    
    // Check thresholds and trigger appropriate actions
    if (this.memoryStats.memoryUsage >= this.thresholds.emergency) {
      this.emit(VectorMemoryManager.EVENTS.MEMORY_EMERGENCY, this.memoryStats);
      this.forceCleanup();
    } else if (this.memoryStats.memoryUsage >= this.thresholds.critical) {
      this.emit(VectorMemoryManager.EVENTS.MEMORY_CRITICAL, this.memoryStats);
      this.forceCleanup();
    } else if (this.memoryStats.memoryUsage >= this.thresholds.warning) {
      this.emit(VectorMemoryManager.EVENTS.MEMORY_WARNING, this.memoryStats);
    }
  }

  /**
   * Run scheduled cleanup tasks
   */
  private runScheduledCleanup(): void {
    const now = Date.now();
    
    for (const [id, task] of this.cleanupTasks) {
      if (now >= task.scheduledTime) {
        try {
          task.task();
          
          // Reschedule if interval is specified
          if (task.interval) {
            task.scheduledTime = now + task.interval;
          } else {
            this.cleanupTasks.delete(id);
          }
        } catch (error) {
          console.error(`Cleanup task '${id}' failed:`, error);
          this.cleanupTasks.delete(id);
        }
      }
    }
  }

  /**
   * Run all cleanup tasks immediately
   */
  private runCleanupTasks(): void {
    for (const [id, task] of this.cleanupTasks) {
      try {
        task.task();
      } catch (error) {
        console.error(`Cleanup task '${id}' failed:`, error);
      }
    }
  }

  /**
   * Clean up resource pools
   */
  private cleanupResourcePools(): void {
    for (const [name, pool] of this.resourcePools) {
      // Destroy excess items
      while (pool.items.length > pool.maxSize) {
        const item = pool.items.pop()!;
        pool.destroyFn(item);
      }
    }
  }

  /**
   * Force garbage collection if available
   */
  private forceGarbageCollection(): void {
    if (typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }

  /**
   * Detect memory leaks
   */
  public detectLeaks(): void {
    const currentStats = this.getMemoryStats();
    const previousStats = this.memoryStats;
    
    // Simple leak detection based on memory growth
    if (currentStats.usedJSHeapSize > previousStats.usedJSHeapSize * 1.1) {
      this.memoryStats.leakCount++;
      this.emit(VectorMemoryManager.EVENTS.LEAK_DETECTED, {
        current: currentStats,
        previous: previousStats
      });
    }
  }

  /**
   * Create canvas pool
   */
  public createCanvasPool(name: string, maxSize: number = 10): void {
    this.createResourcePool(
      name,
      maxSize,
      () => document.createElement('canvas'),
      (canvas) => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        canvas.width = 0;
        canvas.height = 0;
      },
      (canvas) => {
        canvas.width = 0;
        canvas.height = 0;
      }
    );
  }

  /**
   * Create image data pool
   */
  public createImageDataPool(name: string, maxSize: number = 20): void {
    this.createResourcePool(
      name,
      maxSize,
      () => new ImageData(1, 1),
      (imageData) => {
        // Reset image data
        imageData.data.fill(0);
      },
      (imageData) => {
        // ImageData doesn't need explicit cleanup
      }
    );
  }

  /**
   * Create event listener pool
   */
  public createEventListenerPool(name: string, maxSize: number = 50): void {
    this.createResourcePool(
      name,
      maxSize,
      () => ({}),
      (listener) => {
        // Reset listener object
        Object.keys(listener).forEach(key => {
          delete (listener as any)[key];
        });
      },
      (listener) => {
        // Event listeners are cleaned up automatically
      }
    );
  }

  /**
   * Get pool statistics
   */
  public getPoolStats(): Record<string, { size: number; maxSize: number }> {
    const stats: Record<string, { size: number; maxSize: number }> = {};
    
    for (const [name, pool] of this.resourcePools) {
      stats[name] = {
        size: pool.items.length,
        maxSize: pool.maxSize
      };
    }
    
    return stats;
  }

  /**
   * Destroy memory manager and clean up all resources
   */
  public destroy(): void {
    // Stop monitoring
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
      this.memoryMonitor = null;
    }
    
    if (this.cleanupScheduler) {
      clearInterval(this.cleanupScheduler);
      this.cleanupScheduler = null;
    }
    
    // Clean up all resource pools
    for (const [name, pool] of this.resourcePools) {
      for (const item of pool.items) {
        pool.destroyFn(item);
      }
    }
    this.resourcePools.clear();
    
    // Clear cleanup tasks
    this.cleanupTasks.clear();
    
    // Remove all event listeners
    this.removeAllListeners();
  }
}

export default VectorMemoryManager;

