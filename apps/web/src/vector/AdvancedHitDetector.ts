/**
 * 🎯 Advanced Hit Detector - Robust Hit Detection System
 * 
 * Fixes anchor point hit detection issues by providing:
 * - Multi-level hit detection
 * - Visual feedback for hit areas
 * - Tolerance-based selection
 * - Performance optimization
 */

import { VectorPoint, VectorPath, BoundingBox } from './VectorStateManager';

export interface Point2D {
  x: number;
  y: number;
}

export interface HitDetectionOptions {
  tolerance: number;
  zoom: number;
  showHitAreas: boolean;
  multiSelect: boolean;
  priority: 'anchor' | 'control' | 'path' | 'shape';
}

export interface HitResult {
  type: 'anchor' | 'control' | 'path' | 'shape' | 'none';
  target: {
    shapeId?: string;
    pointIndex?: number;
    controlType?: 'in' | 'out';
    pathSegment?: number;
  };
  distance: number;
  confidence: number;
  visualFeedback: HitVisualization;
}

export interface HitVisualization {
  type: 'circle' | 'rectangle' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  opacity: number;
  stroke?: {
    color: string;
    width: number;
  };
}

export interface HitArea {
  type: 'anchor' | 'control' | 'path';
  bounds: BoundingBox;
  priority: number;
  data: any;
}

export class AdvancedHitDetector {
  private static instance: AdvancedHitDetector;
  
  // Hit area cache for performance
  private hitAreaCache: Map<string, HitArea[]> = new Map();
  private lastZoom: number = 1;
  private lastTolerance: number = 10;
  
  // Visual feedback settings
  private visualFeedbackEnabled: boolean = true;
  private hitAreaVisualizations: Map<string, HitVisualization> = new Map();
  
  // Performance tracking
  private hitDetectionStats = {
    totalHits: 0,
    averageDetectionTime: 0,
    cacheHits: 0,
    lastDetectionTime: 0
  };

  private constructor() {}

  public static getInstance(): AdvancedHitDetector {
    if (!AdvancedHitDetector.instance) {
      AdvancedHitDetector.instance = new AdvancedHitDetector();
    }
    return AdvancedHitDetector.instance;
  }

  /**
   * Main hit detection method
   */
  public detectHit(
    point: Point2D,
    shapes: VectorPath[],
    options: HitDetectionOptions
  ): HitResult {
    const startTime = performance.now();
    
    try {
      // Update tolerance based on zoom
      const effectiveTolerance = this.calculateEffectiveTolerance(options.tolerance, options.zoom);
      
      // Check cache first
      const cacheKey = this.generateCacheKey(shapes, effectiveTolerance);
      let hitAreas = this.hitAreaCache.get(cacheKey);
      
      if (!hitAreas) {
        hitAreas = this.generateHitAreas(shapes, effectiveTolerance);
        this.hitAreaCache.set(cacheKey, hitAreas);
      } else {
        this.hitDetectionStats.cacheHits++;
      }
      
      // Find closest hit
      const closestHit = this.findClosestHit(point, hitAreas, effectiveTolerance);
      
      // Generate visual feedback
      const visualFeedback = this.generateVisualFeedback(closestHit, options);
      
      // Update stats
      const detectionTime = performance.now() - startTime;
      this.updateHitDetectionStats(detectionTime);
      
      return {
        type: closestHit?.type || 'none',
        target: closestHit?.target || {},
        distance: closestHit?.distance || Infinity,
        confidence: closestHit?.confidence || 0,
        visualFeedback
      };
      
    } catch (error) {
      console.error('Hit detection error:', error);
      return {
        type: 'none',
        target: {},
        distance: Infinity,
        confidence: 0,
        visualFeedback: this.createEmptyVisualFeedback()
      };
    }
  }

  /**
   * Generate hit areas for all shapes
   */
  private generateHitAreas(shapes: VectorPath[], tolerance: number): HitArea[] {
    const hitAreas: HitArea[] = [];
    
    shapes.forEach(shape => {
      // Generate anchor point hit areas
      shape.points.forEach((point, index) => {
        hitAreas.push({
          type: 'anchor',
          bounds: this.createAnchorHitBounds(point, tolerance),
          priority: 100, // Highest priority
          data: {
            shapeId: shape.id,
            pointIndex: index,
            point
          }
        });
        
        // Generate control handle hit areas
        if (point.controlIn) {
          hitAreas.push({
            type: 'control',
            bounds: this.createControlHitBounds(point, 'in', tolerance),
            priority: 90,
            data: {
              shapeId: shape.id,
              pointIndex: index,
              controlType: 'in',
              point
            }
          });
        }
        
        if (point.controlOut) {
          hitAreas.push({
            type: 'control',
            bounds: this.createControlHitBounds(point, 'out', tolerance),
            priority: 90,
            data: {
              shapeId: shape.id,
              pointIndex: index,
              controlType: 'out',
              point
            }
          });
        }
      });
      
      // Generate path segment hit areas
      for (let i = 0; i < shape.points.length - 1; i++) {
        hitAreas.push({
          type: 'path',
          bounds: this.createPathSegmentHitBounds(shape.points[i], shape.points[i + 1], tolerance),
          priority: 50,
          data: {
            shapeId: shape.id,
            pathSegment: i,
            startPoint: shape.points[i],
            endPoint: shape.points[i + 1]
          }
        });
      }
    });
    
    return hitAreas;
  }

  /**
   * Find closest hit to the given point
   */
  private findClosestHit(
    point: Point2D,
    hitAreas: HitArea[],
    tolerance: number
  ): HitResult | null {
    let closestHit: HitResult | null = null;
    let minDistance = Infinity;
    
    for (const hitArea of hitAreas) {
      const distance = this.calculateDistanceToHitArea(point, hitArea);
      
      if (distance <= tolerance && distance < minDistance) {
        const confidence = this.calculateConfidence(distance, tolerance, hitArea);
        
        closestHit = {
          type: hitArea.type as 'anchor' | 'control' | 'path' | 'shape' | 'none',
          target: {
            shapeId: hitArea.data.shapeId,
            pointIndex: hitArea.data.pointIndex,
            controlType: hitArea.data.controlType,
            pathSegment: hitArea.data.pathSegment
          },
          distance,
          confidence,
          visualFeedback: this.createEmptyVisualFeedback() // Will be filled later
        };
        
        minDistance = distance;
      }
    }
    
    return closestHit;
  }

  /**
   * Calculate distance from point to hit area
   */
  private calculateDistanceToHitArea(point: Point2D, hitArea: HitArea): number {
    const bounds = hitArea.bounds;
    
    switch (hitArea.type) {
      case 'anchor':
        return this.distanceToPoint(point, {
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height / 2
        });
        
      case 'control':
        return this.distanceToPoint(point, {
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height / 2
        });
        
      case 'path':
        return this.distanceToLineSegment(
          point,
          hitArea.data.startPoint,
          hitArea.data.endPoint
        );
        
      default:
        return Infinity;
    }
  }

  /**
   * Calculate confidence score for hit
   */
  private calculateConfidence(distance: number, tolerance: number, hitArea: HitArea): number {
    const normalizedDistance = Math.min(distance / tolerance, 1);
    const baseConfidence = 1 - normalizedDistance;
    const priorityBonus = hitArea.priority / 100;
    
    return Math.min(baseConfidence + priorityBonus, 1);
  }

  /**
   * Generate visual feedback for hit result
   */
  private generateVisualFeedback(hit: HitResult | null, options: HitDetectionOptions): HitVisualization {
    if (!hit || hit.type === 'none') {
      return this.createEmptyVisualFeedback();
    }
    
    if (!options.showHitAreas) {
      return this.createEmptyVisualFeedback();
    }
    
    switch (hit.type) {
      case 'anchor':
        return this.createAnchorVisualFeedback(hit);
      case 'control':
        return this.createControlVisualFeedback(hit);
      case 'path':
        return this.createPathVisualFeedback(hit);
      default:
        return this.createEmptyVisualFeedback();
    }
  }

  /**
   * Create anchor point hit bounds
   */
  private createAnchorHitBounds(point: VectorPoint, tolerance: number): BoundingBox {
    const radius = Math.max(tolerance, 8); // Minimum 8px radius
    return {
      x: point.x - radius,
      y: point.y - radius,
      width: radius * 2,
      height: radius * 2
    };
  }

  /**
   * Create control handle hit bounds
   */
  private createControlHitBounds(
    point: VectorPoint,
    controlType: 'in' | 'out',
    tolerance: number
  ): BoundingBox {
    const control = controlType === 'in' ? point.controlIn : point.controlOut;
    if (!control) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    const radius = Math.max(tolerance, 6); // Slightly smaller than anchor points
    return {
      x: point.x + control.x - radius,
      y: point.y + control.y - radius,
      width: radius * 2,
      height: radius * 2
    };
  }

  /**
   * Create path segment hit bounds
   */
  private createPathSegmentHitBounds(
    start: VectorPoint,
    end: VectorPoint,
    tolerance: number
  ): BoundingBox {
    const minX = Math.min(start.x, end.x) - tolerance;
    const minY = Math.min(start.y, end.y) - tolerance;
    const maxX = Math.max(start.x, end.x) + tolerance;
    const maxY = Math.max(start.y, end.y) + tolerance;
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * Create anchor point visual feedback
   */
  private createAnchorVisualFeedback(hit: HitResult): HitVisualization {
    return {
      type: 'circle',
      x: 0, // Will be set by caller
      y: 0, // Will be set by caller
      radius: 8,
      color: '#10B981',
      opacity: 0.8,
      stroke: {
        color: '#ffffff',
        width: 2
      }
    };
  }

  /**
   * Create control handle visual feedback
   */
  private createControlVisualFeedback(hit: HitResult): HitVisualization {
    return {
      type: 'circle',
      x: 0, // Will be set by caller
      y: 0, // Will be set by caller
      radius: 6,
      color: '#9CA3AF',
      opacity: 0.8,
      stroke: {
        color: '#ffffff',
        width: 1
      }
    };
  }

  /**
   * Create path segment visual feedback
   */
  private createPathVisualFeedback(hit: HitResult): HitVisualization {
    return {
      type: 'line',
      x: 0, // Will be set by caller
      y: 0, // Will be set by caller
      color: '#3B82F6',
      opacity: 0.6,
      stroke: {
        color: '#3B82F6',
        width: 2
      }
    };
  }

  /**
   * Create empty visual feedback
   */
  private createEmptyVisualFeedback(): HitVisualization {
    return {
      type: 'circle',
      x: 0,
      y: 0,
      radius: 0,
      color: 'transparent',
      opacity: 0
    };
  }

  /**
   * Calculate effective tolerance based on zoom
   */
  private calculateEffectiveTolerance(tolerance: number, zoom: number): number {
    return Math.max(tolerance / zoom, 4); // Minimum 4px tolerance
  }

  /**
   * Generate cache key for hit areas
   */
  private generateCacheKey(shapes: VectorPath[], tolerance: number): string {
    return `${shapes.map(s => s.id).join(',')}-${tolerance}`;
  }

  /**
   * Calculate distance between two points
   */
  private distanceToPoint(p1: Point2D, p2: Point2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate distance from point to line segment
   */
  private distanceToLineSegment(
    point: Point2D,
    lineStart: Point2D,
    lineEnd: Point2D
  ): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) {
      return this.distanceToPoint(point, lineStart);
    }
    
    let param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }
    
    return this.distanceToPoint(point, { x: xx, y: yy });
  }

  /**
   * Update hit detection statistics
   */
  private updateHitDetectionStats(detectionTime: number): void {
    this.hitDetectionStats.totalHits++;
    this.hitDetectionStats.lastDetectionTime = detectionTime;
    this.hitDetectionStats.averageDetectionTime = 
      (this.hitDetectionStats.averageDetectionTime * (this.hitDetectionStats.totalHits - 1) + detectionTime) / 
      this.hitDetectionStats.totalHits;
  }

  /**
   * Clear hit area cache
   */
  public clearCache(): void {
    this.hitAreaCache.clear();
  }

  /**
   * Get hit detection statistics
   */
  public getStats() {
    return { ...this.hitDetectionStats };
  }

  /**
   * Set visual feedback enabled
   */
  public setVisualFeedbackEnabled(enabled: boolean): void {
    this.visualFeedbackEnabled = enabled;
  }

  /**
   * Destroy hit detector and clean up resources
   */
  public destroy(): void {
    this.clearCache();
    this.hitAreaVisualizations.clear();
  }
}

export default AdvancedHitDetector;

