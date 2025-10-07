/**
 * AI-Powered Performance Manager for Closset
 * Intelligently manages memory, CPU, and rendering performance
 */

interface PerformanceMetrics {
  memory: number;
  cpu: number;
  frameRate: number;
}

interface PerformanceEntry {
  timestamp: number;
  memory: number;
  cpu: number;
  frameRate: number;
}

type OptimizationSeverity = 'high' | 'medium' | 'low';

class AIPerformanceManager {
  private memoryThreshold = 0.9; // 90% memory threshold
  private cpuThreshold = 0.8; // 80% CPU threshold
  private frameRateThreshold = 20; // Minimum acceptable FPS
  private isMonitoring = false;
  private performanceHistory: PerformanceEntry[] = [];
  private optimizationStrategies = new Map<string, Record<OptimizationSeverity, () => void>>();
  private memoryCleanupQueue: (() => void)[] = [];
  private monitorInterval?: ReturnType<typeof setInterval>;
  private memoryInterval?: ReturnType<typeof setInterval>;
  private lastFrameTime?: number;
  // Puff protection: avoid nuking puff textures immediately after an update
  private lastPuffEventAt?: number;
  private puffGraceMs = 600; // grace window after puff update

  constructor() {
    this.initializeOptimizationStrategies();
    this.startMonitoring();
    // Listen for puff updates to establish a short grace period where we skip aggressive cleanup
    try {
      window.addEventListener('puff-updated', () => {
        this.lastPuffEventAt = Date.now();
      });
    } catch {}
  }

  private initializeOptimizationStrategies(): void {
    // Memory optimization strategies
    this.optimizationStrategies.set('memory', {
      high: () => this.aggressiveMemoryCleanup(),
      medium: () => this.moderateMemoryCleanup(),
      low: () => this.lightMemoryCleanup()
    });

    // CPU optimization strategies
    this.optimizationStrategies.set('cpu', {
      high: () => this.reduceSimulationQuality(0.5),
      medium: () => this.reduceSimulationQuality(0.7),
      low: () => this.reduceSimulationQuality(0.9)
    });

    // Rendering optimization strategies
    this.optimizationStrategies.set('rendering', {
      high: () => this.reduceRenderingQuality(0.3),
      medium: () => this.reduceRenderingQuality(0.6),
      low: () => this.reduceRenderingQuality(0.8)
    });
  }

  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorInterval = setInterval(() => {
      this.analyzePerformance();
    }, 10000); // Check every 10 seconds

    // Monitor memory less frequently
    this.memoryInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // Check every 30 seconds
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.monitorInterval) clearInterval(this.monitorInterval);
    if (this.memoryInterval) clearInterval(this.memoryInterval);
  }

  private async analyzePerformance(): Promise<void> {
    try {
      const performance = await this.getPerformanceMetrics();
      this.performanceHistory.push({
        timestamp: Date.now(),
        ...performance
      });

      // Keep only last 60 seconds of history
      this.performanceHistory = this.performanceHistory.slice(-60);

      // AI-driven optimization decisions
      this.makeOptimizationDecisions(performance);
    } catch (error) {
      console.warn('Performance monitoring error:', error);
    }
  }

  private async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const memory = await this.getMemoryUsage();
    const cpu = await this.getCPUUsage();
    const frameRate = this.getFrameRate();
    
    return { memory, cpu, frameRate };
  }

  private async getMemoryUsage(): Promise<number> {
    const perf: any = performance as any;
    if (perf && perf.memory) {
      const used = perf.memory.usedJSHeapSize;
      const total = perf.memory.totalJSHeapSize;
      return total ? used / total : 0;
    }
    return 0;
  }

  private async getCPUUsage(): Promise<number> {
    // Estimate CPU usage based on frame timing
    const entries = performance.getEntriesByType('measure');
    const recentEntries = entries.filter(entry => 
      Date.now() - entry.startTime < 1000
    );
    
    if (recentEntries.length === 0) return 0;
    
    const totalTime = recentEntries.reduce((sum, entry) => sum + entry.duration, 0);
    return Math.min(totalTime / 1000, 1); // Normalize to 0-1
  }

  private getFrameRate(): number {
    // Simple FPS estimation
    const now = performance.now();
    if (!this.lastFrameTime) {
      this.lastFrameTime = now;
      return 60;
    }
    
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;
    return Math.min(1000 / delta, 60);
  }

  private makeOptimizationDecisions(metrics: PerformanceMetrics): void {
    const { memory, cpu, frameRate } = metrics;
    
    // Memory optimization
    if (memory > this.memoryThreshold) {
      const severity: OptimizationSeverity = memory > 0.95 ? 'high' : memory > 0.85 ? 'medium' : 'low';
      this.optimizationStrategies.get('memory')?.[severity]();
      this.logOptimization('memory', severity, memory);
    }

    // CPU optimization
    if (cpu > this.cpuThreshold) {
      const severity: OptimizationSeverity = cpu > 0.9 ? 'high' : cpu > 0.8 ? 'medium' : 'low';
      this.optimizationStrategies.get('cpu')?.[severity]();
      this.logOptimization('cpu', severity, cpu);
    }

    // Rendering optimization
    if (frameRate < this.frameRateThreshold) {
      const severity: OptimizationSeverity = frameRate < 15 ? 'high' : frameRate < 25 ? 'medium' : 'low';
      this.optimizationStrategies.get('rendering')?.[severity]();
      this.logOptimization('rendering', severity, frameRate);
    }
  }

  private async checkMemoryUsage(): Promise<void> {
    const memory = await this.getMemoryUsage();
    if (memory > 0.98) {
      // Critical memory usage - immediate cleanup
      await this.emergencyMemoryCleanup();
    } else if (memory > 0.90) {
      // High memory usage - moderate cleanup
      this.moderateMemoryCleanup();
    } else if (memory > 0.85) {
      // Moderate memory usage - light cleanup
      this.lightMemoryCleanup();
    }
  }

  private aggressiveMemoryCleanup(): void {
    console.log('🧹 AI Performance: Aggressive memory cleanup');
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }

    // Clear texture cache (skip if within puff grace)
    if (!this.withinPuffGrace()) this.clearTextureCache();
    
    // Clear unused layers (skip if within puff grace)
    if (!this.withinPuffGrace()) this.clearUnusedLayers();
    
    // Clear performance history
    this.performanceHistory = this.performanceHistory.slice(-10);
  }

  private moderateMemoryCleanup(): void {
    console.log('🧹 AI Performance: Moderate memory cleanup');
    
    // Clear texture cache (skip if within puff grace)
    if (!this.withinPuffGrace()) this.clearTextureCache();
    
    // Clear old performance data
    this.performanceHistory = this.performanceHistory.slice(-30);
  }

  private lightMemoryCleanup(): void {
    console.log('🧹 AI Performance: Light memory cleanup');
    
    // Clear only very old data
    this.performanceHistory = this.performanceHistory.slice(-50);
  }

  private async emergencyMemoryCleanup(): Promise<void> {
    console.warn('🚨 AI Performance: Emergency memory cleanup');
    
    // Force garbage collection
    if ((window as any).gc) {
      (window as any).gc();
    }

    // Clear all caches (respect puff grace)
    if (!this.withinPuffGrace()) {
      this.clearTextureCache();
      this.clearUnusedLayers();
    }
    
    // Clear performance history
    this.performanceHistory = [];
    
    // Dispatch cleanup event
    window.dispatchEvent(new CustomEvent('emergencyMemoryCleanup'));
  }

  private clearTextureCache(): void {
    // This will be called by the texture manager
    // Signal downstream to preserve puff resources
    window.dispatchEvent(new CustomEvent('clearTextureCache', { detail: { preservePuff: true } }));
  }

  private clearUnusedLayers(): void {
    // This will be called by the layer manager
    window.dispatchEvent(new CustomEvent('clearUnusedLayers', { detail: { preservePuff: true } }));
  }

  private reduceSimulationQuality(factor: number): void {
    console.log(`🎯 AI Performance: Reducing simulation quality to ${factor * 100}%`);
    window.dispatchEvent(new CustomEvent('reduceSimulationQuality', { 
      detail: { factor } 
    }));
  }

  private reduceRenderingQuality(factor: number): void {
    console.log(`🎨 AI Performance: Reducing rendering quality to ${factor * 100}%`);
    window.dispatchEvent(new CustomEvent('reduceRenderingQuality', { 
      detail: { factor, preservePuff: true } 
    }));
  }

  private logOptimization(type: string, severity: OptimizationSeverity, value: number): void {
    console.log(`🤖 AI Performance: ${type} optimization (${severity}) - Value: ${(value * 100).toFixed(1)}%`);
  }

  // Returns true if we are within the grace window after a puff update
  private withinPuffGrace(): boolean {
    if (!this.lastPuffEventAt) return false;
    const dt = Date.now() - this.lastPuffEventAt;
    return dt >= 0 && dt < this.puffGraceMs;
  }

  public getPerformanceReport(): { memory: number; cpu: number; frameRate: number; status: string } | null {
    const recent = this.performanceHistory.slice(-10);
    if (recent.length === 0) return null;

    const avgMemory = recent.reduce((sum, entry) => sum + entry.memory, 0) / recent.length;
    const avgCPU = recent.reduce((sum, entry) => sum + entry.cpu, 0) / recent.length;
    const avgFPS = recent.reduce((sum, entry) => sum + entry.frameRate, 0) / recent.length;

    return {
      memory: avgMemory,
      cpu: avgCPU,
      frameRate: avgFPS,
      status: this.getPerformanceStatus(avgMemory, avgCPU, avgFPS)
    };
  }

  private getPerformanceStatus(memory: number, cpu: number, fps: number): string {
    if (memory > 0.9 || cpu > 0.9 || fps < 15) return 'critical';
    if (memory > 0.8 || cpu > 0.8 || fps < 25) return 'warning';
    if (memory > 0.7 || cpu > 0.7 || fps < 35) return 'moderate';
    return 'good';
  }
}

// Export singleton instance
export const aiPerformanceManager = new AIPerformanceManager();
export default aiPerformanceManager;
