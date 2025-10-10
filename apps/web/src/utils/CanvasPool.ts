/**
 * CanvasPool - Prevents canvas memory leaks by reusing canvas instances
 * Optimized for both low-end and high-end devices
 */

interface CanvasSize {
  width: number;
  height: number;
}

interface CanvasConfig {
  willReadFrequently?: boolean;
  alpha?: boolean;
  desynchronized?: boolean;
  imageSmoothingEnabled?: boolean;
  imageSmoothingQuality?: 'low' | 'medium' | 'high';
}

class CanvasPool {
  private pools: Map<string, HTMLCanvasElement[]> = new Map();
  private inUse: Set<HTMLCanvasElement> = new Set();
  private maxPoolSize: number = 10; // Maximum canvases to keep in pool
  private defaultConfig: CanvasConfig = {
    willReadFrequently: true,
    alpha: true,
    desynchronized: false,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
  };

  constructor() {
    console.log('🎨 CanvasPool initialized');
  }

  private getSizeKey(size: CanvasSize): string {
    return `${size.width}x${size.height}`;
  }

  private getPool(size: CanvasSize): HTMLCanvasElement[] {
    const key = this.getSizeKey(size);
    if (!this.pools.has(key)) {
      this.pools.set(key, []);
    }
    return this.pools.get(key)!;
  }

  private configureCanvas(canvas: HTMLCanvasElement, config: CanvasConfig = {}): void {
    const ctx = canvas.getContext('2d', {
      willReadFrequently: config.willReadFrequently ?? this.defaultConfig.willReadFrequently,
      alpha: config.alpha ?? this.defaultConfig.alpha,
      desynchronized: config.desynchronized ?? this.defaultConfig.desynchronized
    });

    if (ctx) {
      (ctx as CanvasRenderingContext2D).imageSmoothingEnabled = config.imageSmoothingEnabled ?? this.defaultConfig.imageSmoothingEnabled!;
      (ctx as CanvasRenderingContext2D).imageSmoothingQuality = config.imageSmoothingQuality ?? this.defaultConfig.imageSmoothingQuality!;
      (ctx as CanvasRenderingContext2D).lineCap = 'round';
      (ctx as CanvasRenderingContext2D).lineJoin = 'round';
      (ctx as CanvasRenderingContext2D).globalCompositeOperation = 'source-over';
      (ctx as CanvasRenderingContext2D).globalAlpha = 1.0;
    }
  }

  getCanvas(size: CanvasSize, config?: CanvasConfig): HTMLCanvasElement {
    const pool = this.getPool(size);
    
    // Try to reuse existing canvas from pool
    let canvas = pool.pop();
    
    if (!canvas) {
      // Create new canvas if pool is empty
      canvas = document.createElement('canvas');
      canvas.width = size.width;
      canvas.height = size.height;
      console.log('🎨 CanvasPool: Created new canvas', this.getSizeKey(size));
    } else {
      console.log('🎨 CanvasPool: Reused canvas from pool', this.getSizeKey(size));
    }

    // Configure canvas context
    this.configureCanvas(canvas, config);
    
    // Clear canvas content
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Mark as in use
    this.inUse.add(canvas);
    
    return canvas;
  }

  returnCanvas(canvas: HTMLCanvasElement): void {
    if (!this.inUse.has(canvas)) {
      console.warn('🎨 CanvasPool: Attempted to return canvas not in use');
      return;
    }

    // Remove from in-use set
    this.inUse.delete(canvas);
    
    // Clear canvas content
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get size key for this canvas
    const sizeKey = this.getSizeKey({ width: canvas.width, height: canvas.height });
    const pool = this.getPool({ width: canvas.width, height: canvas.height });
    
    // Only return to pool if pool isn't full
    if (pool.length < this.maxPoolSize) {
      pool.push(canvas);
      console.log('🎨 CanvasPool: Returned canvas to pool', sizeKey);
    } else {
      // Dispose canvas if pool is full
      canvas.width = 0;
      canvas.height = 0;
      console.log('🎨 CanvasPool: Disposed canvas (pool full)', sizeKey);
    }
  }

  // Create a temporary canvas for one-time operations
  createTemporaryCanvas(size: CanvasSize, config?: CanvasConfig): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    this.configureCanvas(canvas, config);
    return canvas;
  }

  // Get pool statistics
  getStats(): {
    totalPools: number;
    totalCanvases: number;
    canvasesInUse: number;
    poolDetails: Array<{ size: string; count: number }>;
  } {
    let totalCanvases = 0;
    const poolDetails: Array<{ size: string; count: number }> = [];

    for (const [size, pool] of this.pools) {
      totalCanvases += pool.length;
      poolDetails.push({ size, count: pool.length });
    }

    return {
      totalPools: this.pools.size,
      totalCanvases,
      canvasesInUse: this.inUse.size,
      poolDetails
    };
  }

  // Clear all pools (useful for memory cleanup)
  clearPools(): void {
    console.log('🎨 CanvasPool: Clearing all pools');
    
    // Dispose all canvases in pools
    for (const pool of this.pools.values()) {
      for (const canvas of pool) {
        canvas.width = 0;
        canvas.height = 0;
      }
    }
    
    this.pools.clear();
    this.inUse.clear();
  }

  // Force cleanup for low memory situations
  emergencyCleanup(): void {
    console.log('🎨 CanvasPool: Emergency cleanup triggered');
    this.clearPools();
  }
}

// Export singleton instance
export const canvasPool = new CanvasPool();

// Export types
export type { CanvasSize, CanvasConfig };
export default canvasPool;


