/**
 * 🎯 Performance Monitor
 * 
 * Tracks rendering, memory, and user interactions
 */

export interface PerformanceMetrics {
  renderTime: number;
  frameRate: number;
  memoryUsage: number;
  interactionLatency: number;
  toolResponseTime: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private isMonitoring: boolean = false;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private frameTimes: number[] = [];
  
  private constructor() {
    this.metrics = {
      renderTime: 0,
      frameRate: 0,
      memoryUsage: 0,
      interactionLatency: 0,
      toolResponseTime: 0,
      timestamp: Date.now()
    };
  }
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.trackFrameRate();
  }
  
  stopMonitoring(): void {
    this.isMonitoring = false;
  }
  
  private trackFrameRate(): void {
    const trackFrame = (currentTime: number) => {
      if (this.isMonitoring) {
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        this.frameTimes.push(deltaTime);
        if (this.frameTimes.length > 60) {
          this.frameTimes.shift();
        }
        
        this.frameCount++;
        
        if (this.frameTimes.length > 0) {
          const averageFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
          this.metrics.frameRate = 1000 / averageFrameTime;
        }
        
        this.updateMemoryUsage();
        this.metrics.timestamp = currentTime;
        
        requestAnimationFrame(trackFrame);
      }
    };
    
    requestAnimationFrame(trackFrame);
  }
  
  private updateMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
    }
  }
  
  trackRenderTime(component: string, renderFn: () => void): void {
    const startTime = performance.now();
    
    try {
      renderFn();
    } finally {
      const endTime = performance.now();
      this.metrics.renderTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development' && this.metrics.renderTime > 16) {
        console.warn(`Slow render in ${component}: ${this.metrics.renderTime.toFixed(2)}ms`);
      }
    }
  }
  
  trackUserInteraction(interaction: string, startTime: number): void {
    const endTime = performance.now();
    this.metrics.interactionLatency = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development' && this.metrics.interactionLatency > 100) {
      console.warn(`Slow interaction ${interaction}: ${this.metrics.interactionLatency.toFixed(2)}ms`);
    }
  }
  
  trackToolResponse(tool: string, startTime: number): void {
    const endTime = performance.now();
    this.metrics.toolResponseTime = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development' && this.metrics.toolResponseTime > 200) {
      console.warn(`Slow tool response ${tool}: ${this.metrics.toolResponseTime.toFixed(2)}ms`);
    }
  }
  
  trackError(error: Error, context: string): void {
    console.error(`Performance error in ${context}:`, error);
  }
  
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  getHealthScore(): number {
    let score = 100;
    
    if (this.metrics.frameRate < 30) score -= 20;
    if (this.metrics.renderTime > 16) score -= 15;
    if (this.metrics.memoryUsage > 200 * 1024 * 1024) score -= 15;
    if (this.metrics.interactionLatency > 100) score -= 10;
    if (this.metrics.toolResponseTime > 200) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

export const trackRenderTime = (component: string, renderFn: () => void) => 
  performanceMonitor.trackRenderTime(component, renderFn);

export const trackUserInteraction = (interaction: string, startTime: number) => 
  performanceMonitor.trackUserInteraction(interaction, startTime);

export const trackToolResponse = (tool: string, startTime: number) => 
  performanceMonitor.trackToolResponse(tool, startTime);

export const trackError = (error: Error, context: string) => 
  performanceMonitor.trackError(error, context);

export default PerformanceMonitor;