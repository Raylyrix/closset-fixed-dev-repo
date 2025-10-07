/**
 * Advanced Performance Monitor for Embroidery Tool
 * Tracks performance metrics, FPS, memory usage, and rendering statistics
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  renderTime: number;
  memoryUsage: number;
  stitchCount: number;
  cacheHitRate: number;
  gpuMemoryUsage?: number;
  cpuUsage?: number;
  lastUpdate: number;
}

export interface PerformanceThresholds {
  minFPS: number;
  maxFrameTime: number;
  maxMemoryUsage: number;
  maxStitchCount: number;
}

export interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  metrics: PerformanceMetrics;
}

export class AdvancedPerformanceMonitor {
  private static instance: AdvancedPerformanceMonitor;
  private metrics: PerformanceMetrics = {
    fps: 60,
    frameTime: 16.67,
    renderTime: 0,
    memoryUsage: 0,
    stitchCount: 0,
    cacheHitRate: 0,
    lastUpdate: Date.now()
  };

  private thresholds: PerformanceThresholds = {
    minFPS: 30,
    maxFrameTime: 33.33, // 30 FPS
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    maxStitchCount: 1000
  };

  private frameTimes: number[] = [];
  private renderTimes: number[] = [];
  private alerts: PerformanceAlert[] = [];
  private isMonitoring = false;
  private monitoringInterval: ReturnType<typeof setInterval> | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private alertCallbacks: ((alert: PerformanceAlert) => void)[] = [];

  private constructor() {
    this.startMonitoring();
  }

  public static getInstance(): AdvancedPerformanceMonitor {
    if (!AdvancedPerformanceMonitor.instance) {
      AdvancedPerformanceMonitor.instance = new AdvancedPerformanceMonitor();
    }
    return AdvancedPerformanceMonitor.instance;
  }

  /**
   * Start performance monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    
    // Monitor every 100ms
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
      this.checkThresholds();
    }, 100);
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Record frame start
   */
  public recordFrameStart(): number {
    return performance.now();
  }

  /**
   * Record frame end
   */
  public recordFrameEnd(startTime: number): void {
    const frameTime = performance.now() - startTime;
    this.frameTimes.push(frameTime);
    
    // Keep only last 60 frames
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }
    
    this.frameCount++;
  }

  /**
   * Record render time
   */
  public recordRenderTime(renderTime: number): void {
    this.renderTimes.push(renderTime);
    
    // Keep only last 30 renders
    if (this.renderTimes.length > 30) {
      this.renderTimes.shift();
    }
  }

  /**
   * Update stitch count
   */
  public updateStitchCount(count: number): void {
    this.metrics.stitchCount = count;
  }

  /**
   * Update memory usage
   */
  public updateMemoryUsage(usage: number): void {
    this.metrics.memoryUsage = usage;
  }

  /**
   * Update cache hit rate
   */
  public updateCacheHitRate(hitRate: number): void {
    this.metrics.cacheHitRate = hitRate;
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const now = performance.now();
    
    // Calculate FPS
    if (this.frameTimes.length > 0) {
      const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
      this.metrics.fps = 1000 / avgFrameTime;
      this.metrics.frameTime = avgFrameTime;
    }
    
    // Calculate render time
    if (this.renderTimes.length > 0) {
      this.metrics.renderTime = this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length;
    }
    
    this.metrics.lastUpdate = now;
  }

  /**
   * Check performance thresholds
   */
  private checkThresholds(): void {
    const alerts: PerformanceAlert[] = [];
    
    // Check FPS
    if (this.metrics.fps < this.thresholds.minFPS) {
      alerts.push({
        type: 'warning',
        message: `Low FPS detected: ${this.metrics.fps.toFixed(1)} FPS`,
        timestamp: Date.now(),
        metrics: { ...this.metrics }
      });
    }
    
    // Check frame time
    if (this.metrics.frameTime > this.thresholds.maxFrameTime) {
      alerts.push({
        type: 'warning',
        message: `High frame time: ${this.metrics.frameTime.toFixed(2)}ms`,
        timestamp: Date.now(),
        metrics: { ...this.metrics }
      });
    }
    
    // Check memory usage
    if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      alerts.push({
        type: 'error',
        message: `High memory usage: ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB`,
        timestamp: Date.now(),
        metrics: { ...this.metrics }
      });
    }
    
    // Check stitch count
    if (this.metrics.stitchCount > this.thresholds.maxStitchCount) {
      alerts.push({
        type: 'info',
        message: `High stitch count: ${this.metrics.stitchCount} stitches`,
        timestamp: Date.now(),
        metrics: { ...this.metrics }
      });
    }
    
    // Process alerts
    alerts.forEach(alert => {
      this.alerts.push(alert);
      this.alertCallbacks.forEach(callback => callback(alert));
    });
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  /**
   * Get current metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance alerts
   */
  public getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Clear alerts
   */
  public clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Set performance thresholds
   */
  public setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Add alert callback
   */
  public onAlert(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Remove alert callback
   */
  public offAlert(callback: (alert: PerformanceAlert) => void): void {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }

  /**
   * Get performance recommendations
   */
  public getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.metrics.fps < 30) {
      recommendations.push('Consider reducing stitch complexity or enabling performance mode');
    }
    
    if (this.metrics.memoryUsage > 50 * 1024 * 1024) {
      recommendations.push('Consider clearing stitch cache or reducing texture quality');
    }
    
    if (this.metrics.stitchCount > 500) {
      recommendations.push('Consider using Level of Detail (LOD) for distant stitches');
    }
    
    if (this.metrics.cacheHitRate < 0.5) {
      recommendations.push('Cache hit rate is low, consider optimizing stitch patterns');
    }
    
    return recommendations;
  }

  /**
   * Get performance score (0-100)
   */
  public getPerformanceScore(): number {
    let score = 100;
    
    // FPS score (40% weight)
    const fpsScore = Math.min(100, (this.metrics.fps / 60) * 100);
    score = score * 0.6 + fpsScore * 0.4;
    
    // Memory score (30% weight)
    const memoryScore = Math.max(0, 100 - (this.metrics.memoryUsage / this.thresholds.maxMemoryUsage) * 100);
    score = score * 0.7 + memoryScore * 0.3;
    
    // Render time score (20% weight)
    const renderScore = Math.max(0, 100 - (this.metrics.renderTime / 16.67) * 100);
    score = score * 0.8 + renderScore * 0.2;
    
    // Stitch count score (10% weight)
    const stitchScore = Math.max(0, 100 - (this.metrics.stitchCount / this.thresholds.maxStitchCount) * 100);
    score = score * 0.9 + stitchScore * 0.1;
    
    return Math.round(score);
  }

  /**
   * Export performance data
   */
  public exportData(): {
    metrics: PerformanceMetrics;
    alerts: PerformanceAlert[];
    recommendations: string[];
    score: number;
  } {
    return {
      metrics: this.getMetrics(),
      alerts: this.getAlerts(),
      recommendations: this.getRecommendations(),
      score: this.getPerformanceScore()
    };
  }

  /**
   * Reset all metrics
   */
  public reset(): void {
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      renderTime: 0,
      memoryUsage: 0,
      stitchCount: 0,
      cacheHitRate: 0,
      lastUpdate: Date.now()
    };
    
    this.frameTimes = [];
    this.renderTimes = [];
    this.alerts = [];
    this.frameCount = 0;
  }

  /**
   * Dispose of the monitor
   */
  public dispose(): void {
    this.stopMonitoring();
    this.alertCallbacks = [];
    this.reset();
  }
}

// Export singleton instance
export const advancedPerformanceMonitor = AdvancedPerformanceMonitor.getInstance();

























