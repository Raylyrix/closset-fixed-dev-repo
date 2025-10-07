/**
 * PERFORMANCE OPTIMIZER
 * 
 * Aggressive performance optimizations for drawing operations
 * Designed to work on low-end devices while maintaining quality on high-end devices
 */

interface PerformanceConfig {
  targetFPS: number;
  maxTextureUpdatesPerSecond: number;
  maxCanvasRedrawsPerSecond: number;
  enableAggressiveOptimizations: boolean;
  deviceTier: 'low' | 'medium' | 'high';
}

class PerformanceOptimizer {
  private config: PerformanceConfig;
  private lastTextureUpdate = 0;
  private lastCanvasRedraw = 0;
  private frameCount = 0;
  private lastFPSUpdate = 0;
  private currentFPS = 60;

  constructor() {
    this.config = this.detectDeviceCapabilities();
    console.log(`🚀 PerformanceOptimizer initialized for ${this.config.deviceTier} device`);
  }

  private detectDeviceCapabilities(): PerformanceConfig {
    // Simple device detection based on available APIs and memory
    const deviceMemory = (navigator as any).deviceMemory || 4; // Default to 4GB
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType || '4g';

    let deviceTier: 'low' | 'medium' | 'high' = 'medium';

    if (deviceMemory <= 2 || hardwareConcurrency <= 2 || effectiveType === 'slow-2g' || effectiveType === '2g') {
      deviceTier = 'low';
    } else if (deviceMemory >= 8 && hardwareConcurrency >= 8 && effectiveType === '4g') {
      deviceTier = 'high';
    }

    return {
      targetFPS: deviceTier === 'low' ? 30 : deviceTier === 'medium' ? 45 : 60,
      maxTextureUpdatesPerSecond: deviceTier === 'low' ? 2 : deviceTier === 'medium' ? 4 : 8,
      maxCanvasRedrawsPerSecond: deviceTier === 'low' ? 2 : deviceTier === 'medium' ? 4 : 10,
      enableAggressiveOptimizations: deviceTier === 'low',
      deviceTier
    };
  }

  /**
   * Throttle texture updates based on device capabilities
   */
  canUpdateTexture(): boolean {
    const now = Date.now();
    const minInterval = 1000 / this.config.maxTextureUpdatesPerSecond;
    
    if (now - this.lastTextureUpdate >= minInterval) {
      this.lastTextureUpdate = now;
      return true;
    }
    return false;
  }

  /**
   * Throttle canvas redraws based on device capabilities
   */
  canRedrawCanvas(): boolean {
    const now = Date.now();
    const minInterval = 1000 / this.config.maxCanvasRedrawsPerSecond;
    
    if (now - this.lastCanvasRedraw >= minInterval) {
      this.lastCanvasRedraw = now;
      return true;
    }
    return false;
  }

  /**
   * Get optimal canvas size based on device capabilities
   */
  getOptimalCanvasSize(): { width: number; height: number } {
    switch (this.config.deviceTier) {
      case 'low':
        return { width: 512, height: 512 };
      case 'medium':
        return { width: 1024, height: 1024 };
      case 'high':
        return { width: 2048, height: 2048 };
      default:
        return { width: 1024, height: 1024 };
    }
  }

  /**
   * Get optimal texture quality settings
   */
  getTextureQualitySettings() {
    switch (this.config.deviceTier) {
      case 'low':
        return {
          generateMipmaps: false,
          anisotropy: 1,
          minFilter: 'LinearFilter' as const,
          magFilter: 'LinearFilter' as const
        };
      case 'medium':
        return {
          generateMipmaps: true,
          anisotropy: 4,
          minFilter: 'LinearMipmapLinearFilter' as const,
          magFilter: 'LinearFilter' as const
        };
      case 'high':
        return {
          generateMipmaps: true,
          anisotropy: 16,
          minFilter: 'LinearMipmapLinearFilter' as const,
          magFilter: 'LinearFilter' as const
        };
    }
  }

  /**
   * Update FPS tracking
   */
  updateFPS(): void {
    this.frameCount++;
    const now = Date.now();
    
    if (now - this.lastFPSUpdate >= 1000) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.lastFPSUpdate = now;
      
      // Adjust performance based on actual FPS
      if (this.currentFPS < this.config.targetFPS * 0.8) {
        this.enableEmergencyOptimizations();
      }
    }
  }

  /**
   * Enable emergency optimizations when FPS drops
   */
  private enableEmergencyOptimizations(): void {
    console.log('🚨 FPS dropped below target, enabling emergency optimizations');
    this.config.maxTextureUpdatesPerSecond = Math.max(1, this.config.maxTextureUpdatesPerSecond * 0.5);
    this.config.maxCanvasRedrawsPerSecond = Math.max(1, this.config.maxCanvasRedrawsPerSecond * 0.5);
  }

  /**
   * Get current performance config
   */
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Force garbage collection hint (for supported browsers)
   */
  forceGarbageCollection(): void {
    if (this.config.enableAggressiveOptimizations) {
      // @ts-ignore - This is a non-standard API
      if (window.gc) {
        // @ts-ignore
        window.gc();
        console.log('🗑️ Forced garbage collection');
      }
    }
  }

  /**
   * Optimize canvas context settings for performance
   */
  getOptimalCanvasContextOptions(): CanvasRenderingContext2DSettings {
    return {
      willReadFrequently: false, // Better performance for drawing
      alpha: true,
      desynchronized: true // Better performance
    };
  }

  /**
   * Check if aggressive optimizations should be enabled
   */
  shouldUseAggressiveOptimizations(): boolean {
    return this.config.enableAggressiveOptimizations || this.currentFPS < this.config.targetFPS * 0.9;
  }
}

export const performanceOptimizer = new PerformanceOptimizer();


