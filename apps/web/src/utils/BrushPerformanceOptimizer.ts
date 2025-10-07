import { BrushEngine, BrushSettings, BrushPoint } from './BrushEngine';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  brushStrokesPerSecond: number;
  canvasSize: { width: number; height: number };
  lastUpdate: number;
}

export class BrushPerformanceOptimizer {
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    brushStrokesPerSecond: 0,
    canvasSize: { width: 0, height: 0 },
    lastUpdate: Date.now()
  };

  private frameCount = 0;
  private lastFpsUpdate = Date.now();
  private strokeCount = 0;
  private lastStrokeUpdate = Date.now();

  // Performance monitoring
  updateMetrics(canvas: HTMLCanvasElement): PerformanceMetrics {
    const now = Date.now();
    this.frameCount++;

    // FPS calculation
    if (now - this.lastFpsUpdate >= 1000) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    // Frame time (estimate)
    this.metrics.frameTime = 1000 / Math.max(this.metrics.fps, 1);

    // Memory usage (rough estimate)
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      this.metrics.memoryUsage = Math.round(memInfo.usedJSHeapSize / 1024 / 1024); // MB
    }

    // Brush strokes per second
    if (now - this.lastStrokeUpdate >= 1000) {
      this.metrics.brushStrokesPerSecond = Math.round(
        (this.strokeCount * 1000) / (now - this.lastStrokeUpdate)
      );
      this.strokeCount = 0;
      this.lastStrokeUpdate = now;
    }

    // Canvas size
    this.metrics.canvasSize = {
      width: canvas.width,
      height: canvas.height
    };

    this.metrics.lastUpdate = now;
    return { ...this.metrics };
  }

  recordBrushStroke(): void {
    this.strokeCount++;
  }

  // Adaptive quality based on performance
  getAdaptiveQuality(currentFps: number, targetFps: number = 60): {
    brushDetail: number;
    textureResolution: number;
    smoothingQuality: number;
  } {
    const fpsRatio = currentFps / targetFps;

    if (fpsRatio > 0.9) {
      // High performance - maximum quality
      return {
        brushDetail: 1.0,
        textureResolution: 1.0,
        smoothingQuality: 1.0
      };
    } else if (fpsRatio > 0.7) {
      // Good performance - high quality
      return {
        brushDetail: 0.9,
        textureResolution: 0.9,
        smoothingQuality: 0.9
      };
    } else if (fpsRatio > 0.5) {
      // Medium performance - balanced quality
      return {
        brushDetail: 0.7,
        textureResolution: 0.7,
        smoothingQuality: 0.7
      };
    } else {
      // Low performance - reduced quality
      return {
        brushDetail: 0.5,
        textureResolution: 0.5,
        smoothingQuality: 0.5
      };
    }
  }

  // Brush stroke batching for performance
  createBrushStrokeBatch(
    strokes: Array<{ points: BrushPoint[]; settings: BrushSettings }>
  ): {
    batchedStrokes: Array<{ points: BrushPoint[]; settings: BrushSettings }>;
    estimatedRenderTime: number;
  } {
    // Group strokes by similar settings for batching
    const batches: Map<string, Array<{ points: BrushPoint[]; settings: BrushSettings }>> = new Map();

    strokes.forEach(stroke => {
      const key = `${stroke.settings.shape.type}-${stroke.settings.texture.pattern}-${stroke.settings.blendMode}`;
      if (!batches.has(key)) {
        batches.set(key, []);
      }
      batches.get(key)!.push(stroke);
    });

    // Estimate render time based on complexity
    let totalEstimatedTime = 0;
    const batchedStrokes: Array<{ points: BrushPoint[]; settings: BrushSettings }> = [];

    batches.forEach((batchStrokes) => {
      batchStrokes.forEach(stroke => {
        const pointCount = stroke.points.length;
        const complexity = this.calculateStrokeComplexity(stroke.settings);
        const estimatedTime = pointCount * complexity * 0.1; // Rough estimate in ms
        totalEstimatedTime += estimatedTime;
        batchedStrokes.push(stroke);
      });
    });

    return {
      batchedStrokes,
      estimatedRenderTime: totalEstimatedTime
    };
  }

  private calculateStrokeComplexity(settings: BrushSettings): number {
    let complexity = 1;

    // Shape complexity
    switch (settings.shape.type) {
      case 'circle': complexity *= 1; break;
      case 'square': complexity *= 1.1; break;
      case 'diamond': complexity *= 1.2; break;
      case 'triangle': complexity *= 1.3; break;
      case 'star': complexity *= 1.5; break;
    }

    // Texture complexity
    switch (settings.texture.pattern) {
      case 'solid': complexity *= 1; break;
      case 'noise': complexity *= 1.5; break;
      case 'bristles': complexity *= 2; break;
      case 'canvas': complexity *= 1.8; break;
      case 'paper': complexity *= 1.6; break;
    }

    // Dynamics complexity
    if (settings.stabilization.enabled) complexity *= 1.3;
    if (settings.dynamics.scattering.amount > 0) complexity *= 1.2;

    return complexity;
  }

  // Memory management
  optimizeMemoryUsage(engine: BrushEngine, maxMemoryMB: number = 100): {
    shouldClearCache: boolean;
    recommendedCanvasSize: { width: number; height: number };
  } {
    const currentMemory = this.metrics.memoryUsage;
    const shouldClearCache = currentMemory > maxMemoryMB * 0.8;

    // Recommend canvas size based on memory usage
    let recommendedSize = { width: 2048, height: 2048 };
    if (currentMemory > maxMemoryMB * 0.6) {
      recommendedSize = { width: 1024, height: 1024 };
    }
    if (currentMemory > maxMemoryMB * 0.8) {
      recommendedSize = { width: 512, height: 512 };
    }

    return {
      shouldClearCache,
      recommendedCanvasSize: recommendedSize
    };
  }

  // WebGL acceleration detection and setup
  setupWebGLAcceleration(canvas: HTMLCanvasElement): {
    isWebGLAvailable: boolean;
    webGLContext: WebGLRenderingContext | null;
    recommendedRenderer: 'canvas' | 'webgl';
  } {
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl && gl instanceof WebGLRenderingContext) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';

        // Check if it's a software renderer (less performant)
        const isSoftwareRenderer = renderer.toLowerCase().includes('software') ||
                                  renderer.toLowerCase().includes('swiftshader');

        return {
          isWebGLAvailable: true,
          webGLContext: gl,
          recommendedRenderer: isSoftwareRenderer ? 'canvas' : 'webgl'
        };
      }
    } catch (error) {
      console.warn('WebGL setup failed:', error);
    }

    return {
      isWebGLAvailable: false,
      webGLContext: null,
      recommendedRenderer: 'canvas'
    };
  }

  // Performance profiling
  startProfiling(): () => PerformanceMetrics {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    let operationCount = 0;

    return () => {
      const endTime = performance.now();
      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

      return {
        fps: this.metrics.fps,
        frameTime: endTime - startTime,
        memoryUsage: Math.round((endMemory - startMemory) / 1024 / 1024),
        brushStrokesPerSecond: operationCount / ((endTime - startTime) / 1000),
        canvasSize: this.metrics.canvasSize,
        lastUpdate: Date.now()
      };
    };
  }

  // Automatic optimization suggestions
  getOptimizationSuggestions(metrics: PerformanceMetrics): string[] {
    const suggestions: string[] = [];

    if (metrics.fps < 30) {
      suggestions.push('Consider reducing brush size or complexity');
      suggestions.push('Enable stabilization for smoother strokes');
      suggestions.push('Reduce canvas resolution if possible');
    }

    if (metrics.memoryUsage > 80) {
      suggestions.push('Clear brush cache periodically');
      suggestions.push('Reduce texture resolution');
      suggestions.push('Limit undo history size');
    }

    if (metrics.brushStrokesPerSecond > 100) {
      suggestions.push('Consider batching brush strokes');
      suggestions.push('Reduce scattering count for complex brushes');
    }

    if (metrics.frameTime > 16.67) { // > 60fps frame time
      suggestions.push('Optimize brush rendering pipeline');
      suggestions.push('Use WebGL acceleration if available');
    }

    return suggestions;
  }
}

// Global performance monitor
export const brushPerformanceMonitor = new BrushPerformanceOptimizer();
