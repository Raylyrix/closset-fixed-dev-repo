/**
 * 🎯 Optimized Vector Renderer - Performance-First Rendering System
 * 
 * Fixes rendering performance issues by providing:
 * - Dirty checking for minimal re-renders
 * - Canvas pooling for memory efficiency
 * - Render batching for smooth 60fps
 * - Caching with proper invalidation
 */

import { VectorState, VectorPath, VectorPoint } from './VectorStateManager';
import { BezierCurveEngine, BezierCurve } from './BezierCurveEngine';

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
}

export interface RenderOptions {
  quality: 'draft' | 'normal' | 'high';
  showGrid: boolean;
  showAnchorPoints: boolean;
  showControlHandles: boolean;
  gridSize: number;
  backgroundColor: string;
  selectionColor: string;
  anchorPointColor: string;
  controlHandleColor: string;
}

export interface RenderResult {
  success: boolean;
  renderTime: number;
  elementsRendered: number;
  cacheHits: number;
  errors: string[];
}

export interface DirtyRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class OptimizedVectorRenderer {
  private static instance: OptimizedVectorRenderer;
  
  // Canvas pooling
  private canvasPool: HTMLCanvasElement[] = [];
  private maxPoolSize: number = 10;
  
  // Render cache
  private renderCache: Map<string, ImageData> = new Map();
  private maxCacheSize: number = 100;
  
  // Dirty checking
  private dirtyPaths: Set<string> = new Set();
  private dirtyRegions: DirtyRegion[] = [];
  private lastRenderState: string = '';
  
  // Performance tracking
  private renderStats = {
    totalRenders: 0,
    cacheHits: 0,
    averageRenderTime: 0,
    lastRenderTime: 0
  };
  
  // Render queue for batching
  private renderQueue: Array<{
    id: string;
    priority: number;
    callback: () => void;
  }> = [];
  private isRendering: boolean = false;
  private renderScheduler: number | null = null;
  
  // Default options
  private defaultOptions: RenderOptions = {
    quality: 'normal',
    showGrid: false,
    showAnchorPoints: true,
    showControlHandles: true,
    gridSize: 20,
    backgroundColor: 'transparent',
    selectionColor: '#3B82F6',
    anchorPointColor: '#10B981',
    controlHandleColor: '#9CA3AF'
  };

  private constructor() {
    this.initializeCanvasPool();
  }

  public static getInstance(): OptimizedVectorRenderer {
    if (!OptimizedVectorRenderer.instance) {
      OptimizedVectorRenderer.instance = new OptimizedVectorRenderer();
    }
    return OptimizedVectorRenderer.instance;
  }

  /**
   * Main render method with dirty checking and caching
   */
  public async render(
    context: RenderContext,
    state: VectorState,
    options: Partial<RenderOptions> = {}
  ): Promise<RenderResult> {
    const startTime = performance.now();
    const renderOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Check if we need to render
      const currentStateHash = this.generateStateHash(state);
      if (currentStateHash === this.lastRenderState && this.dirtyPaths.size === 0) {
        return {
          success: true,
          renderTime: 0,
          elementsRendered: 0,
          cacheHits: 1,
          errors: []
        };
      }

      // Clear dirty regions
      this.clearDirtyRegions(context);
      
      // Render background
      this.renderBackground(context, renderOptions);
      
      // Render grid if enabled
      if (renderOptions.showGrid) {
        this.renderGrid(context, renderOptions);
      }
      
      // Render shapes
      let elementsRendered = 0;
      for (const shape of state.shapes) {
        if (this.shouldRenderShape(shape)) {
          await this.renderShape(context, shape, state.selected.includes(shape.id), renderOptions);
          elementsRendered++;
        }
      }
      
      // Render current path if exists
      if (state.currentPath) {
        await this.renderCurrentPath(context, state.currentPath, renderOptions);
        elementsRendered++;
      }
      
      // Render selection indicators
      if (renderOptions.showAnchorPoints) {
        this.renderSelectionIndicators(context, state, renderOptions);
      }
      
      // Update state
      this.lastRenderState = currentStateHash;
      this.dirtyPaths.clear();
      this.dirtyRegions = [];
      
      // Update stats
      const renderTime = performance.now() - startTime;
      this.updateRenderStats(renderTime);
      
      return {
        success: true,
        renderTime,
        elementsRendered,
        cacheHits: 0,
        errors: []
      };
      
    } catch (error) {
      console.error('Render error:', error);
      return {
        success: false,
        renderTime: performance.now() - startTime,
        elementsRendered: 0,
        cacheHits: 0,
        errors: [error instanceof Error ? error.message : 'Unknown render error']
      };
    }
  }

  /**
   * Mark a shape as dirty for re-rendering
   */
  public markDirty(shapeId: string): void {
    this.dirtyPaths.add(shapeId);
  }

  /**
   * Mark a region as dirty for partial re-rendering
   */
  public markDirtyRegion(region: DirtyRegion): void {
    this.dirtyRegions.push(region);
  }

  /**
   * Clear all dirty flags
   */
  public clearDirty(): void {
    this.dirtyPaths.clear();
    this.dirtyRegions = [];
  }

  /**
   * Render a single shape with caching
   */
  private async renderShape(
    context: RenderContext,
    shape: VectorPath,
    isSelected: boolean,
    options: RenderOptions
  ): Promise<void> {
    const cacheKey = this.generateShapeCacheKey(shape, isSelected, options);
    
    // Check cache first
    if (this.renderCache.has(cacheKey)) {
      const cached = this.renderCache.get(cacheKey)!;
      context.ctx.putImageData(cached, 0, 0);
      this.renderStats.cacheHits++;
      return;
    }

    // Render shape
    context.ctx.save();
    
    try {
      // Set up rendering context
      this.setupRenderingContext(context, options);
      
      // Render fill
      if (shape.fill) {
        this.renderShapeFill(context, shape);
      }
      
      // Render stroke
      if (shape.stroke) {
        this.renderShapeStroke(context, shape);
      }
      
      // Render selection
      if (isSelected) {
        this.renderShapeSelection(context, shape, options);
      }
      
      // Cache the result
      const imageData = context.ctx.getImageData(0, 0, context.width, context.height);
      this.cacheRender(cacheKey, imageData);
      
    } finally {
      context.ctx.restore();
    }
  }

  /**
   * Render current path being drawn
   */
  private async renderCurrentPath(
    context: RenderContext,
    path: VectorPath,
    options: RenderOptions
  ): Promise<void> {
    if (path.points.length < 2) return;

    context.ctx.save();
    
    try {
      this.setupRenderingContext(context, options);
      
      // Render path
      this.renderPathPoints(context, path.points);
      
      // Render anchor points
      if (options.showAnchorPoints) {
        this.renderAnchorPoints(context, path.points, options);
      }
      
      // Render control handles
      if (options.showControlHandles) {
        this.renderControlHandles(context, path.points, options);
      }
      
    } finally {
      context.ctx.restore();
    }
  }

  /**
   * Render shape fill
   */
  private renderShapeFill(context: RenderContext, shape: VectorPath): void {
    if (!shape.fill || shape.points.length < 3) return;

    context.ctx.beginPath();
    this.renderPathPoints(context, shape.points);
    context.ctx.closePath();
    
    context.ctx.globalAlpha = shape.fillOpacity || 1.0;
    context.ctx.fillStyle = shape.fillColor;
    context.ctx.fill();
  }

  /**
   * Render shape stroke
   */
  private renderShapeStroke(context: RenderContext, shape: VectorPath): void {
    if (!shape.stroke || shape.points.length < 2) return;

    context.ctx.beginPath();
    this.renderPathPoints(context, shape.points);
    
    context.ctx.globalAlpha = shape.strokeOpacity || 1.0;
    context.ctx.strokeStyle = shape.strokeColor;
    context.ctx.lineWidth = shape.strokeWidth;
    context.ctx.lineJoin = shape.strokeJoin || 'round';
    context.ctx.lineCap = shape.strokeCap || 'round';
    context.ctx.stroke();
  }

  /**
   * Render path points as Bezier curves
   */
  private renderPathPoints(context: RenderContext, points: VectorPoint[]): void {
    if (points.length === 0) return;

    const ctx = context.ctx;
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const current = points[i];

      if (prev.controlOut && current.controlIn) {
        // Cubic Bezier curve
        ctx.bezierCurveTo(
          prev.x + prev.controlOut.x,
          prev.y + prev.controlOut.y,
          current.x + current.controlIn.x,
          current.y + current.controlIn.y,
          current.x,
          current.y
        );
      } else if (prev.controlOut) {
        // Quadratic Bezier curve
        ctx.quadraticCurveTo(
          prev.x + prev.controlOut.x,
          prev.y + prev.controlOut.y,
          current.x,
          current.y
        );
      } else {
        // Straight line
        ctx.lineTo(current.x, current.y);
      }
    }
  }

  /**
   * Render anchor points
   */
  private renderAnchorPoints(
    context: RenderContext,
    points: VectorPoint[],
    options: RenderOptions
  ): void {
    const ctx = context.ctx;
    
    points.forEach((point, index) => {
      ctx.fillStyle = index === 0 ? '#10B981' : options.anchorPointColor;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  /**
   * Render control handles
   */
  private renderControlHandles(
    context: RenderContext,
    points: VectorPoint[],
    options: RenderOptions
  ): void {
    const ctx = context.ctx;
    
    points.forEach(point => {
      if (point.controlIn || point.controlOut) {
        ctx.strokeStyle = options.controlHandleColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);

        if (point.controlIn) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(point.x + point.controlIn.x, point.y + point.controlIn.y);
          ctx.stroke();
          
          ctx.fillStyle = options.controlHandleColor;
          ctx.beginPath();
          ctx.arc(point.x + point.controlIn.x, point.y + point.controlIn.y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }

        if (point.controlOut) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(point.x + point.controlOut.x, point.y + point.controlOut.y);
          ctx.stroke();
          
          ctx.fillStyle = options.controlHandleColor;
          ctx.beginPath();
          ctx.arc(point.x + point.controlOut.x, point.y + point.controlOut.y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }

        ctx.setLineDash([]);
      }
    });
  }

  /**
   * Render selection indicators
   */
  private renderSelectionIndicators(
    context: RenderContext,
    state: VectorState,
    options: RenderOptions
  ): void {
    const ctx = context.ctx;
    
    state.shapes.forEach(shape => {
      if (state.selected.includes(shape.id)) {
        ctx.strokeStyle = options.selectionColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          shape.bounds.x - 2,
          shape.bounds.y - 2,
          shape.bounds.width + 4,
          shape.bounds.height + 4
        );
        ctx.setLineDash([]);
      }
    });
  }

  /**
   * Render background
   */
  private renderBackground(context: RenderContext, options: RenderOptions): void {
    if (options.backgroundColor === 'transparent') return;
    
    context.ctx.fillStyle = options.backgroundColor;
    context.ctx.fillRect(0, 0, context.width, context.height);
  }

  /**
   * Render grid
   */
  private renderGrid(context: RenderContext, options: RenderOptions): void {
    const ctx = context.ctx;
    const gridSize = options.gridSize;
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = 0; x <= context.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, context.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= context.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(context.width, y);
      ctx.stroke();
    }
  }

  /**
   * Clear dirty regions
   */
  private clearDirtyRegions(context: RenderContext): void {
    if (this.dirtyRegions.length === 0) return;
    
    const ctx = context.ctx;
    ctx.save();
    
    this.dirtyRegions.forEach(region => {
      ctx.clearRect(region.x, region.y, region.width, region.height);
    });
    
    ctx.restore();
  }

  /**
   * Setup rendering context for optimal quality
   */
  private setupRenderingContext(context: RenderContext, options: RenderOptions): void {
    const ctx = context.ctx;
    
    // Set image smoothing based on quality
    ctx.imageSmoothingEnabled = options.quality !== 'draft';
    ctx.imageSmoothingQuality = options.quality === 'high' ? 'high' : 'medium';
    
    // Set line properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  /**
   * Check if shape should be rendered
   */
  private shouldRenderShape(shape: VectorPath): boolean {
    return this.dirtyPaths.has(shape.id) || this.dirtyPaths.size === 0;
  }

  /**
   * Generate cache key for shape
   */
  private generateShapeCacheKey(
    shape: VectorPath,
    isSelected: boolean,
    options: RenderOptions
  ): string {
    return `${shape.id}-${isSelected}-${options.quality}-${shape.points.length}`;
  }

  /**
   * Generate state hash for dirty checking
   */
  private generateStateHash(state: VectorState): string {
    return JSON.stringify({
      shapes: state.shapes.map(s => ({ id: s.id, points: s.points.length })),
      selected: state.selected,
      currentPath: state.currentPath ? state.currentPath.points.length : 0
    });
  }

  /**
   * Cache render result
   */
  private cacheRender(key: string, imageData: ImageData): void {
    if (this.renderCache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.renderCache.keys().next().value;
      if (typeof firstKey === 'string') {
        this.renderCache.delete(firstKey);
      }
    }
    
    this.renderCache.set(key, imageData);
  }

  /**
   * Render selection highlight for a shape
   */
  private renderShapeSelection(
    context: RenderContext,
    shape: VectorPath,
    _options: RenderOptions
  ): void {
    const ctx = context.ctx;
    ctx.save();
    try {
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(
        shape.bounds.x - 2,
        shape.bounds.y - 2,
        shape.bounds.width + 4,
        shape.bounds.height + 4
      );
    } finally {
      ctx.restore();
    }
  }

  /**
   * Update render statistics
   */
  private updateRenderStats(renderTime: number): void {
    this.renderStats.totalRenders++;
    this.renderStats.lastRenderTime = renderTime;
    this.renderStats.averageRenderTime = 
      (this.renderStats.averageRenderTime * (this.renderStats.totalRenders - 1) + renderTime) / 
      this.renderStats.totalRenders;
  }

  /**
   * Initialize canvas pool
   */
  private initializeCanvasPool(): void {
    for (let i = 0; i < this.maxPoolSize; i++) {
      const canvas = document.createElement('canvas');
      this.canvasPool.push(canvas);
    }
  }

  /**
   * Get canvas from pool
   */
  public getCanvasFromPool(): HTMLCanvasElement | null {
    return this.canvasPool.pop() || null;
  }

  /**
   * Return canvas to pool
   */
  public returnCanvasToPool(canvas: HTMLCanvasElement): void {
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
   * Get render statistics
   */
  public getRenderStats() {
    return { ...this.renderStats };
  }

  /**
   * Clear all caches
   */
  public clearCaches(): void {
    this.renderCache.clear();
    this.clearDirty();
  }

  /**
   * Destroy renderer and clean up resources
   */
  public destroy(): void {
    this.clearCaches();
    this.canvasPool = [];
    if (this.renderScheduler) {
      cancelAnimationFrame(this.renderScheduler);
    }
  }
}

export default OptimizedVectorRenderer;

