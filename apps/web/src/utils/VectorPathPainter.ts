/**
 * 🎨 Vector Path Painter
 * 
 * Utility for applying brush, puff print, and embroidery effects along vector paths
 * When vector mode is active, tools will follow existing vector paths instead of freehand drawing
 */

import { vectorStore } from '../vector/vectorState';
import { VectorPath, VectorPoint } from '../vector/VectorStateManager';

export interface PathPaintingOptions {
  tool: 'brush' | 'puffPrint' | 'embroidery';
  color: string;
  size: number;
  opacity: number;
  pressure?: number;
  spacing?: number;
  stitchType?: string;
  threadType?: string;
  thickness?: number;
}

export class VectorPathPainter {
  /**
   * Sample points along a vector path for smooth painting
   */
  static samplePathPoints(path: VectorPath, spacing: number = 2): VectorPoint[] {
    if (!path.points || path.points.length < 2) {
      return path.points || [];
    }

    const sampledPoints: VectorPoint[] = [];
    
    for (let i = 0; i < path.points.length - 1; i++) {
      const currentPoint = path.points[i];
      const nextPoint = path.points[i + 1];
      
      // Add current point
      sampledPoints.push(currentPoint);
      
      // Calculate distance between points
      const dx = nextPoint.x - currentPoint.x;
      const dy = nextPoint.y - currentPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Add intermediate points based on spacing
      if (distance > spacing) {
        const steps = Math.floor(distance / spacing);
        for (let j = 1; j < steps; j++) {
          const t = j / steps;
          const interpolatedPoint: VectorPoint = {
            x: currentPoint.x + dx * t,
            y: currentPoint.y + dy * t,
            type: currentPoint.type || 'corner',
            controlIn: currentPoint.controlIn,
            controlOut: currentPoint.controlOut,
            selected: false,
            locked: false,
            visible: true
          };
          sampledPoints.push(interpolatedPoint);
        }
      }
    }
    
    // Add the last point
    if (path.points.length > 0) {
      sampledPoints.push(path.points[path.points.length - 1]);
    }
    
    return sampledPoints;
  }

  /**
   * Apply brush painting along a vector path
   */
  static paintBrushAlongPath(
    path: VectorPath,
    options: PathPaintingOptions,
    canvas: HTMLCanvasElement
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sampledPoints = this.samplePathPoints(path, options.spacing || 2);
    
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = options.opacity;
    ctx.fillStyle = options.color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw along the path
    for (let i = 0; i < sampledPoints.length - 1; i++) {
      const currentPoint = sampledPoints[i];
      const nextPoint = sampledPoints[i + 1];
      
      ctx.beginPath();
      ctx.lineWidth = options.size;
      ctx.strokeStyle = options.color;
      ctx.moveTo(currentPoint.x, currentPoint.y);
      ctx.lineTo(nextPoint.x, nextPoint.y);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  /**
   * Apply puff print along a vector path
   */
  static paintPuffAlongPath(
    path: VectorPath,
    options: PathPaintingOptions,
    puffCanvas: HTMLCanvasElement,
    displacementCanvas: HTMLCanvasElement,
    createPuffTexture: (x: number, y: number, size: number, opacity: number) => void,
    createDisplacementMap: (x: number, y: number, size: number, opacity: number) => void
  ): void {
    const sampledPoints = this.samplePathPoints(path, options.spacing || 3);
    
    sampledPoints.forEach(point => {
      const x = Math.round(point.x);
      const y = Math.round(point.y);
      createPuffTexture(x, y, options.size, options.opacity);
      createDisplacementMap(x, y, options.size, options.opacity);
    });
  }

  /**
   * Apply embroidery stitches along a vector path
   */
  static paintEmbroideryAlongPath(
    path: VectorPath,
    options: PathPaintingOptions,
    canvas: HTMLCanvasElement
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sampledPoints = this.samplePathPoints(path, options.spacing || 1);
    
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = options.opacity;
    ctx.strokeStyle = options.color;
    ctx.fillStyle = options.color;
    ctx.lineWidth = options.thickness || 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Add thread-like 3D effects
    ctx.shadowColor = options.color;
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // Draw embroidery stitches based on stitch type
    switch (options.stitchType) {
      case 'satin':
        this.drawSatinStitches(ctx, sampledPoints, options);
        break;
      case 'fill':
        this.drawFillStitches(ctx, sampledPoints, options);
        break;
      case 'outline':
        this.drawOutlineStitches(ctx, sampledPoints, options);
        break;
      case 'running':
        this.drawRunningStitches(ctx, sampledPoints, options);
        break;
      default:
        this.drawSatinStitches(ctx, sampledPoints, options);
    }
    
    ctx.restore();
  }

  /**
   * Draw satin stitches (zigzag pattern)
   */
  private static drawSatinStitches(
    ctx: CanvasRenderingContext2D,
    points: VectorPoint[],
    options: PathPaintingOptions
  ): void {
    const stitchLength = 8;
    const amplitude = options.size || 4;
    
    for (let i = 0; i < points.length - 1; i += stitchLength) {
      const startPoint = points[i];
      const endPoint = points[Math.min(i + stitchLength, points.length - 1)];
      
      const dx = endPoint.x - startPoint.x;
      const dy = endPoint.y - startPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const steps = Math.floor(distance / 2);
        for (let j = 0; j < steps; j++) {
          const t = j / steps;
          const x = startPoint.x + dx * t;
          const y = startPoint.y + dy * t;
          const offset = amplitude * Math.sin(t * Math.PI * 4);
          
          ctx.beginPath();
          ctx.moveTo(x - offset, y);
          ctx.lineTo(x + offset, y);
          ctx.stroke();
        }
      }
    }
  }

  /**
   * Draw fill stitches (parallel lines)
   */
  private static drawFillStitches(
    ctx: CanvasRenderingContext2D,
    points: VectorPoint[],
    options: PathPaintingOptions
  ): void {
    const lineSpacing = options.size || 4;
    const bounds = this.calculateBounds(points);
    
    for (let y = bounds.y; y < bounds.y + bounds.height; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(bounds.x, y);
      ctx.lineTo(bounds.x + bounds.width, y);
      ctx.stroke();
    }
  }

  /**
   * Draw outline stitches (continuous line)
   */
  private static drawOutlineStitches(
    ctx: CanvasRenderingContext2D,
    points: VectorPoint[],
    options: PathPaintingOptions
  ): void {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
  }

  /**
   * Draw running stitches (dashed line)
   */
  private static drawRunningStitches(
    ctx: CanvasRenderingContext2D,
    points: VectorPoint[],
    options: PathPaintingOptions
  ): void {
    const dashLength = 6;
    const gapLength = 3;
    
    ctx.setLineDash([dashLength, gapLength]);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash pattern
  }

  /**
   * Calculate bounding box for a set of points
   */
  private static calculateBounds(points: VectorPoint[]): { x: number; y: number; width: number; height: number } {
    if (points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;

    points.forEach(point => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * Get all vector paths from the store
   */
  static getVectorPaths(): VectorPath[] {
    const state = vectorStore.getState();
    return state.shapes || [];
  }

  /**
   * Get selected vector paths
   */
  static getSelectedPaths(): VectorPath[] {
    const state = vectorStore.getState();
    const selectedIds = state.selected || [];
    return state.shapes?.filter(shape => selectedIds.includes(shape.id)) || [];
  }

  /**
   * Check if vector mode is active and has paths
   */
  static hasVectorPaths(): boolean {
    const paths = this.getVectorPaths();
    return paths.length > 0;
  }

  /**
   * Apply painting to all vector paths with current tool
   */
  static paintAllPaths(options: PathPaintingOptions, targetCanvas: HTMLCanvasElement): void {
    const paths = this.getVectorPaths();
    
    paths.forEach(path => {
      switch (options.tool) {
        case 'brush':
          this.paintBrushAlongPath(path, options, targetCanvas);
          break;
        case 'embroidery':
          this.paintEmbroideryAlongPath(path, options, targetCanvas);
          break;
        // Puff print requires additional parameters
      }
    });
  }
}






