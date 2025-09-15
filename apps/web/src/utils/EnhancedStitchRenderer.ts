/**
 * Enhanced Stitch Renderer with Advanced Quality and Anti-aliasing
 * Provides high-quality rendering for all 25 stitch types
 */

import { advancedMemoryManager } from './AdvancedMemoryManager';
import { advancedPerformanceMonitor } from './AdvancedPerformanceMonitor';

export interface StitchPoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

export interface StitchConfig {
  type: string;
  color: string;
  thickness: number;
  opacity: number;
  threadType?: string;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  antiAliasing?: boolean;
  shadow?: boolean;
  highlight?: boolean;
}

export interface RenderOptions {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  enableCaching?: boolean;
  enableLOD?: boolean;
}

export class EnhancedStitchRenderer {
  private static instance: EnhancedStitchRenderer;
  private qualitySettings = {
    low: { samples: 1, blur: 0, shadow: false },
    medium: { samples: 2, blur: 0.5, shadow: true },
    high: { samples: 4, blur: 1, shadow: true },
    ultra: { samples: 8, blur: 2, shadow: true }
  };

  private constructor() {}

  public static getInstance(): EnhancedStitchRenderer {
    if (!EnhancedStitchRenderer.instance) {
      EnhancedStitchRenderer.instance = new EnhancedStitchRenderer();
    }
    return EnhancedStitchRenderer.instance;
  }

  /**
   * Render a stitch with enhanced quality
   */
  public renderStitch(
    points: StitchPoint[],
    config: StitchConfig,
    options: RenderOptions
  ): void {
    if (points.length < 2) return;

    const startTime = performance.now();
    const quality = config.quality || 'high';
    const settings = this.qualitySettings[quality];
    
    // Check cache first
    const cacheKey = this.generateCacheKey(points, config, options);
    if (options.enableCaching) {
      const cached = advancedMemoryManager.getCachedStitch(cacheKey);
      if (cached) {
        options.context.putImageData(cached, options.offsetX || 0, options.offsetY || 0);
        return;
      }
    }

    // Set up high-quality rendering
    this.setupHighQualityRendering(options.context, config, settings);
    
    // Apply transformations
    this.applyTransformations(options.context, options);
    
    // Render based on stitch type
    this.renderByType(points, config, options.context, settings);
    
    // Cache the result
    if (options.enableCaching && options.canvas) {
      const imageData = options.context.getImageData(
        0, 0, options.canvas.width, options.canvas.height
      );
      advancedMemoryManager.cacheStitch(cacheKey, imageData, 2);
    }
    
    // Record performance
    const renderTime = performance.now() - startTime;
    advancedPerformanceMonitor.recordRenderTime(renderTime);
  }

  /**
   * Set up high-quality rendering context
   */
  private setupHighQualityRendering(
    ctx: CanvasRenderingContext2D,
    config: StitchConfig,
    settings: any
  ): void {
    ctx.save();
    
    // Enable anti-aliasing
    if (config.antiAliasing !== false) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    
    // Set line properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = config.thickness;
    ctx.globalAlpha = config.opacity;
    
    // Apply thread type effects
    this.applyThreadTypeEffects(ctx, config);
  }

  /**
   * Apply thread type visual effects
   */
  private applyThreadTypeEffects(ctx: CanvasRenderingContext2D, config: StitchConfig): void {
    const threadType = config.threadType || 'cotton';
    
    switch (threadType) {
      case 'silk':
        ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        ctx.shadowBlur = 2;
        break;
      case 'metallic':
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        ctx.shadowBlur = 3;
        break;
      case 'glow':
        ctx.shadowColor = config.color;
        ctx.shadowBlur = 5;
        break;
      case 'variegated':
        // Create gradient effect
        const gradient = ctx.createLinearGradient(0, 0, 100, 100);
        gradient.addColorStop(0, config.color);
        gradient.addColorStop(0.5, this.adjustBrightness(config.color, 20));
        gradient.addColorStop(1, this.adjustBrightness(config.color, -20));
        ctx.strokeStyle = gradient;
        return;
      default:
        ctx.strokeStyle = config.color;
    }
  }

  /**
   * Apply canvas transformations
   */
  private applyTransformations(ctx: CanvasRenderingContext2D, options: RenderOptions): void {
    if (options.scale && options.scale !== 1) {
      ctx.scale(options.scale, options.scale);
    }
    
    if (options.offsetX || options.offsetY) {
      ctx.translate(options.offsetX || 0, options.offsetY || 0);
    }
  }

  /**
   * Render stitch based on type
   */
  private renderByType(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    switch (config.type) {
      case 'satin':
        this.renderSatinStitch(points, config, ctx, settings);
        break;
      case 'fill':
        this.renderFillStitch(points, config, ctx, settings);
        break;
      case 'cross':
        this.renderCrossStitch(points, config, ctx, settings);
        break;
      case 'outline':
        this.renderOutlineStitch(points, config, ctx, settings);
        break;
      case 'chain':
        this.renderChainStitch(points, config, ctx, settings);
        break;
      case 'backstitch':
        this.renderBackstitch(points, config, ctx, settings);
        break;
      case 'french-knot':
        this.renderFrenchKnot(points, config, ctx, settings);
        break;
      case 'bullion':
        this.renderBullionStitch(points, config, ctx, settings);
        break;
      case 'lazy-daisy':
        this.renderLazyDaisy(points, config, ctx, settings);
        break;
      case 'feather':
        this.renderFeatherStitch(points, config, ctx, settings);
        break;
      case 'running':
        this.renderRunningStitch(points, config, ctx, settings);
        break;
      case 'stem':
        this.renderStemStitch(points, config, ctx, settings);
        break;
      case 'split':
        this.renderSplitStitch(points, config, ctx, settings);
        break;
      case 'cable':
        this.renderCableStitch(points, config, ctx, settings);
        break;
      case 'herringbone':
        this.renderHerringboneStitch(points, config, ctx, settings);
        break;
      case 'fishbone':
        this.renderFishboneStitch(points, config, ctx, settings);
        break;
      case 'detached-chain':
        this.renderDetachedChain(points, config, ctx, settings);
        break;
      case 'fly':
        this.renderFlyStitch(points, config, ctx, settings);
        break;
      case 'wheat-ear':
        this.renderWheatEarStitch(points, config, ctx, settings);
        break;
      case 'spider-web':
        this.renderSpiderWebStitch(points, config, ctx, settings);
        break;
      case 'brick':
        this.renderBrickStitch(points, config, ctx, settings);
        break;
      case 'seed':
        this.renderSeedStitch(points, config, ctx, settings);
        break;
      case 'coral':
        this.renderCoralStitch(points, config, ctx, settings);
        break;
      case 'turkish':
        this.renderTurkishStitch(points, config, ctx, settings);
        break;
      case 'ribbon':
        this.renderRibbonStitch(points, config, ctx, settings);
        break;
      default:
        this.renderSimpleStitch(points, config, ctx, settings);
    }
    
    ctx.restore();
  }

  /**
   * Render satin stitch with enhanced quality
   */
  private renderSatinStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 2) return;

    // Create smooth parallel lines
    const width = config.thickness * 2;
    const numLines = Math.max(1, Math.floor(width / 2));
    
    for (let i = 0; i < numLines; i++) {
      const offset = (i - numLines / 2) * 2;
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y + offset);
      
      for (let j = 1; j < points.length; j++) {
        const angle = this.calculateAngle(points[j-1], points[j]);
        const perpX = Math.cos(angle + Math.PI/2) * offset;
        const perpY = Math.sin(angle + Math.PI/2) * offset;
        
        ctx.lineTo(points[j].x + perpX, points[j].y + perpY);
      }
      
      ctx.stroke();
    }
  }

  /**
   * Render fill stitch with enhanced quality
   */
  private renderFillStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 3) return;

    // Create filled polygon with texture
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Add texture lines
    this.addTextureLines(points, config, ctx);
  }

  /**
   * Render cross stitch with enhanced quality
   */
  private renderCrossStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    const size = Math.max(4, config.thickness * 2);
    
    for (const point of points) {
      const halfSize = size / 2;
      
      // Draw X pattern with enhanced quality
      ctx.beginPath();
      ctx.moveTo(point.x - halfSize, point.y - halfSize);
      ctx.lineTo(point.x + halfSize, point.y + halfSize);
      ctx.moveTo(point.x + halfSize, point.y - halfSize);
      ctx.lineTo(point.x - halfSize, point.y + halfSize);
      ctx.stroke();
    }
  }

  /**
   * Render outline stitch
   */
  private renderOutlineStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
  }

  /**
   * Render chain stitch
   */
  private renderChainStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    const radius = config.thickness / 2;
    
    for (const point of points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Render backstitch
   */
  private renderBackstitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 2) return;

    for (let i = 0; i < points.length - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(points[i].x, points[i].y);
      ctx.lineTo(points[i + 1].x, points[i + 1].y);
      ctx.stroke();
    }
  }

  /**
   * Render French knot
   */
  private renderFrenchKnot(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    const radius = config.thickness;
    
    for (const point of points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Render bullion stitch
   */
  private renderBullionStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    const radius = config.thickness * 1.5;
    
    for (const point of points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Render lazy daisy stitch
   */
  private renderLazyDaisy(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    const size = config.thickness * 2;
    
    for (const point of points) {
      // Draw petal shape
      ctx.beginPath();
      ctx.ellipse(point.x, point.y, size, size/2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Render feather stitch
   */
  private renderFeatherStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 3) return;

    for (let i = 0; i < points.length - 2; i += 2) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2];
      
      // Draw main line
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.stroke();
      
      // Draw feather branches
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2.x + 10, p2.y - 10);
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2.x - 10, p2.y - 10);
      ctx.stroke();
    }
  }

  /**
   * Render running stitch
   */
  private renderRunningStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 2) return;

    // Draw dashed line
    const dashLength = config.thickness * 2;
    const gapLength = config.thickness;
    
    ctx.setLineDash([dashLength, gapLength]);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /**
   * Render stem stitch
   */
  private renderStemStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 2) return;

    // Similar to backstitch but with slight offset
    for (let i = 0; i < points.length - 1; i++) {
      const offset = config.thickness / 4;
      ctx.beginPath();
      ctx.moveTo(points[i].x + offset, points[i].y);
      ctx.lineTo(points[i + 1].x - offset, points[i + 1].y);
      ctx.stroke();
    }
  }

  /**
   * Render split stitch
   */
  private renderSplitStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 3) return;

    // Draw lines that split previous stitches
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      const midX = (prev.x + next.x) / 2;
      const midY = (prev.y + next.y) / 2;
      
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
    }
  }

  /**
   * Render cable stitch
   */
  private renderCableStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 2) return;

    // Draw twisted rope pattern
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      
      // Draw twisted lines
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(midX + 5, midY, p2.x, p2.y);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(midX - 5, midY, p2.x, p2.y);
      ctx.stroke();
    }
  }

  /**
   * Render herringbone stitch
   */
  private renderHerringboneStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 3) return;

    // Draw zigzag pattern
    for (let i = 0; i < points.length - 2; i += 2) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2];
      
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.stroke();
    }
  }

  /**
   * Render fishbone stitch
   */
  private renderFishboneStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 3) return;

    // Draw V-shaped pattern
    for (let i = 0; i < points.length - 2; i += 2) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2];
      
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.stroke();
    }
  }

  /**
   * Render detached chain stitch
   */
  private renderDetachedChain(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    const size = config.thickness * 2;
    
    for (const point of points) {
      // Draw individual chain loops
      ctx.beginPath();
      ctx.arc(point.x, point.y, size/2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /**
   * Render fly stitch
   */
  private renderFlyStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 3) return;

    for (let i = 0; i < points.length - 2; i += 3) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2];
      
      // Draw V with center point
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.stroke();
    }
  }

  /**
   * Render wheat ear stitch
   */
  private renderWheatEarStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 2) return;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      
      // Draw wheat ear pattern
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(midX, midY - 10);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }

  /**
   * Render spider web stitch
   */
  private renderSpiderWebStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 3) return;

    const center = points[0];
    
    // Draw radial lines
    for (let i = 1; i < points.length; i++) {
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    }
    
    // Draw concentric circles
    const maxRadius = Math.max(...points.slice(1).map(p => 
      Math.sqrt((p.x - center.x) ** 2 + (p.y - center.y) ** 2)
    ));
    
    for (let r = 10; r < maxRadius; r += 10) {
      ctx.beginPath();
      ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /**
   * Render brick stitch
   */
  private renderBrickStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    const brickWidth = config.thickness * 3;
    const brickHeight = config.thickness * 2;
    
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const offsetX = (i % 2) * brickWidth / 2;
      
      ctx.fillRect(
        point.x - brickWidth/2 + offsetX,
        point.y - brickHeight/2,
        brickWidth,
        brickHeight
      );
    }
  }

  /**
   * Render seed stitch
   */
  private renderSeedStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    const size = config.thickness;
    
    for (const point of points) {
      // Draw small random stitches
      const angle = Math.random() * Math.PI * 2;
      const length = size + Math.random() * size;
      const endX = point.x + Math.cos(angle) * length;
      const endY = point.y + Math.sin(angle) * length;
      
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }

  /**
   * Render coral stitch
   */
  private renderCoralStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 2) return;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      
      // Draw coral-like branches
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(midX, midY);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      
      // Add side branches
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(midX + 5, midY - 5);
      ctx.moveTo(midX, midY);
      ctx.lineTo(midX - 5, midY + 5);
      ctx.stroke();
    }
  }

  /**
   * Render Turkish stitch
   */
  private renderTurkishStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    const size = config.thickness * 2;
    
    for (const point of points) {
      // Draw Turkish knot
      ctx.beginPath();
      ctx.arc(point.x, point.y, size/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Add decorative elements
      ctx.beginPath();
      ctx.arc(point.x, point.y, size/4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /**
   * Render ribbon stitch
   */
  private renderRibbonStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 2) return;

    const width = config.thickness * 2;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const angle = this.calculateAngle(p1, p2);
      
      // Draw ribbon as wide line
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth = width;
      ctx.stroke();
    }
  }

  /**
   * Render simple stitch (fallback)
   */
  private renderSimpleStitch(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D,
    settings: any
  ): void {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
  }

  /**
   * Add texture lines to fill stitches
   */
  private addTextureLines(
    points: StitchPoint[],
    config: StitchConfig,
    ctx: CanvasRenderingContext2D
  ): void {
    const spacing = config.thickness * 2;
    const bounds = this.calculateBounds(points);
    
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    
    for (let y = bounds.minY; y < bounds.maxY; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(bounds.minX, y);
      ctx.lineTo(bounds.maxX, y);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  /**
   * Calculate angle between two points
   */
  private calculateAngle(p1: StitchPoint, p2: StitchPoint): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  /**
   * Calculate bounds of points
   */
  private calculateBounds(points: StitchPoint[]): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
    
    return { minX, maxX, minY, maxY };
  }

  /**
   * Adjust brightness of color
   */
  private adjustBrightness(color: string, amount: number): string {
    // Simple brightness adjustment
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Generate cache key for stitch
   */
  private generateCacheKey(
    points: StitchPoint[],
    config: StitchConfig,
    options: RenderOptions
  ): string {
    const pointsHash = points.map(p => `${p.x},${p.y}`).join('|');
    return `stitch_${config.type}_${config.color}_${config.thickness}_${pointsHash}`;
  }
}

// Export singleton instance
export const enhancedStitchRenderer = EnhancedStitchRenderer.getInstance();

