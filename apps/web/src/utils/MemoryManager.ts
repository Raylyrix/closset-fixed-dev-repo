/**
 * Memory Management System
 * Handles memory optimization and cleanup
 */

import { performanceMonitor } from './PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from './CentralizedErrorHandler';

export interface MemoryStats {
  used: number;
  total: number;
  limit: number;
  percentage: number;
  isHealthy: boolean;
}

export interface CleanupTask {
  id: string;
  name: string;
  priority: number;
  execute: () => void;
  lastRun: number;
  interval: number;
}

class MemoryManager {
  private cleanupTasks: CleanupTask[] = [];
  private isMonitoring = false;
  private memoryThreshold = 100 * 1024 * 1024; // 100MB
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private canvasPool: HTMLCanvasElement[] = [];
  private imagePool: HTMLImageElement[] = [];
  private maxPoolSize = 10;

  /**
   * Start memory monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 30000); // Every 30 seconds
    
    console.log('🧠 Memory monitoring started');
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    console.log('🧠 Memory monitoring stopped');
  }

  /**
   * Get current memory statistics
   */
  getMemoryStats(): MemoryStats | null {
    if (!('memory' in performance)) return null;
    
    const memory = (performance as any).memory;
    if (!memory) return null;
    
    const used = memory.usedJSHeapSize;
    const total = memory.totalJSHeapSize;
    const limit = memory.jsHeapSizeLimit;
    const percentage = (used / limit) * 100;
    
    return {
      used,
      total,
      limit,
      percentage,
      isHealthy: percentage < 80
    };
  }

  /**
   * Add cleanup task
   */
  addCleanupTask(task: Omit<CleanupTask, 'id' | 'lastRun'>): string {
    const id = `cleanup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cleanupTask: CleanupTask = {
      ...task,
      id,
      lastRun: 0
    };
    
    this.cleanupTasks.push(cleanupTask);
    this.cleanupTasks.sort((a, b) => b.priority - a.priority);
    
    return id;
  }

  /**
   * Remove cleanup task
   */
  removeCleanupTask(id: string): void {
    this.cleanupTasks = this.cleanupTasks.filter(task => task.id !== id);
  }

  /**
   * Force cleanup
   */
  forceCleanup(): void {
    this.performCleanup(true);
  }

  /**
   * Get canvas from pool
   */
  getCanvas(width: number, height: number): HTMLCanvasElement {
    let canvas = this.canvasPool.find(c => c.width === width && c.height === height);
    
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
    } else {
      this.canvasPool = this.canvasPool.filter(c => c !== canvas);
    }
    
    return canvas;
  }

  /**
   * Return canvas to pool
   */
  returnCanvas(canvas: HTMLCanvasElement): void {
    if (this.canvasPool.length < this.maxPoolSize) {
      // Clear canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      this.canvasPool.push(canvas);
    }
  }

  /**
   * Get image from pool
   */
  getImage(): HTMLImageElement {
    let image = this.imagePool.pop();
    
    if (!image) {
      image = new Image();
    }
    
    return image;
  }

  /**
   * Return image to pool
   */
  returnImage(image: HTMLImageElement): void {
    if (this.imagePool.length < this.maxPoolSize) {
      image.src = '';
      image.onload = null;
      image.onerror = null;
      this.imagePool.push(image);
    }
  }

  /**
   * Clear all pools
   */
  clearPools(): void {
    this.canvasPool = [];
    this.imagePool = [];
  }

  /**
   * Get pool statistics
   */
  getPoolStats(): { canvas: number; image: number } {
    return {
      canvas: this.canvasPool.length,
      image: this.imagePool.length
    };
  }

  private performCleanup(force: boolean = false): void {
    try {
      const stats = this.getMemoryStats();
      if (!stats) return;
      
      // Check if cleanup is needed
      const needsCleanup = force || !stats.isHealthy || stats.percentage > 70;
      
      if (!needsCleanup) return;
      
      console.log(`🧹 Performing memory cleanup (${stats.percentage.toFixed(1)}% used)`);
      
      // Run cleanup tasks
      for (const task of this.cleanupTasks) {
        const shouldRun = force || 
          (Date.now() - task.lastRun) > task.interval ||
          stats.percentage > 90;
        
        if (shouldRun) {
          try {
            task.execute();
            task.lastRun = Date.now();
          } catch (error) {
            centralizedErrorHandler.handleError(
              error as Error,
              { component: 'MemoryManager', function: 'performCleanup' },
              ErrorSeverity.LOW,
              ErrorCategory.UNKNOWN
            );
          }
        }
      }
      
      // Force garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }
      
      // Track cleanup performance
      performanceMonitor.trackMetric('memory_cleanup', stats.percentage, 'percent', 'memory');
      
    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'MemoryManager', function: 'performCleanup' },
        ErrorSeverity.MEDIUM,
        ErrorCategory.UNKNOWN
      );
    }
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();

// Export convenience functions
export const getMemoryStats = () => memoryManager.getMemoryStats();
export const addCleanupTask = (task: Omit<CleanupTask, 'id' | 'lastRun'>) => memoryManager.addCleanupTask(task);
export const removeCleanupTask = (id: string) => memoryManager.removeCleanupTask(id);
export const forceCleanup = () => memoryManager.forceCleanup();
export const getCanvas = (width: number, height: number) => memoryManager.getCanvas(width, height);
export const returnCanvas = (canvas: HTMLCanvasElement) => memoryManager.returnCanvas(canvas);
export const getImage = () => memoryManager.getImage();
export const returnImage = (image: HTMLImageElement) => memoryManager.returnImage(image);
export const clearPools = () => memoryManager.clearPools();
export const getPoolStats = () => memoryManager.getPoolStats();

export default memoryManager;
