/**
 * InkStitch Algorithm Integration
 * Ports key algorithms from InkStitch Python code to TypeScript
 */

import { AdvancedStitch, ThreadProperties, FabricProperties } from './AdvancedEmbroideryEngine';
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';

export interface Point {
  x: number;
  y: number;
}

export interface LineString {
  points: Point[];
}

export interface Polygon {
  exterior: LineString;
  holes: LineString[];
}

export interface MultiPolygon {
  polygons: Polygon[];
}

export interface Geometry {
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';
  coordinates: Point[] | LineString | Polygon | MultiPolygon;
}

export interface FillStitchParams {
  thread: ThreadProperties;
  density: number;
  angle: number;
  offset: number;
  underlay: boolean;
  underlayDensity: number;
  underlayAngle: number;
  expand: number;
  inset: number;
}

export interface SatinStitchParams {
  thread: ThreadProperties;
  density: number;
  angle: number;
  width: number;
  underlay: boolean;
  underlayDensity: number;
  underlayAngle: number;
  rungSpacing: number;
  zigzagSpacing: number;
}

export interface ContourFillParams {
  thread: ThreadProperties;
  density: number;
  angle: number;
  offset: number;
  contourSpacing: number;
  skipLast: boolean;
}

export interface TartanFillParams {
  thread: ThreadProperties;
  density: number;
  angle: number;
  offset: number;
  tartanPattern: string;
  stripeWidth: number;
  stripeSpacing: number;
}

export class InkStitchIntegration {
  private static readonly PIXELS_PER_MM = 3.7795275591; // 96 DPI
  private static readonly MIN_STITCH_LENGTH = 0.1; // mm
  private static readonly MAX_STITCH_LENGTH = 10.0; // mm

  /**
   * Generate fill stitch using InkStitch auto-fill algorithm
   */
  static generateFillStitch(
    shape: Polygon,
    params: FillStitchParams
  ): AdvancedStitch[] {
    try {
      const startTime = performance.now();
      
      // Validate input
      if (!shape || !shape.exterior || !shape.exterior.points.length) {
        throw new Error('Invalid shape for fill stitch generation');
      }
      
      // Calculate stitch parameters
      const stitchLength = this.calculateStitchLength(params.density);
      const angle = params.angle * Math.PI / 180; // Convert to radians
      
      // Generate fill pattern
      const fillPattern = this.generateFillPattern(shape, stitchLength, angle, params);
      
      // Convert to advanced stitches
      const stitches = this.convertPatternToStitches(fillPattern, params.thread, 'fill');
      
      // Add underlay if requested
      if (params.underlay) {
        const underlayStitches = this.generateUnderlayStitches(shape, params);
        stitches.unshift(...underlayStitches);
      }
      
      // Track performance
      const duration = performance.now() - startTime;
      performanceMonitor.trackMetric('fill_stitch_generation', duration, 'ms', 'embroidery', 'InkStitchIntegration');
      
      return stitches;
      
    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'InkStitchIntegration', function: 'generateFillStitch' },
        ErrorSeverity.MEDIUM,
        ErrorCategory.EMBROIDERY
      );
      return [];
    }
  }

  /**
   * Generate satin column using InkStitch satin algorithm
   */
  static generateSatinColumn(
    rails: LineString[],
    rungs: LineString[],
    params: SatinStitchParams
  ): AdvancedStitch[] {
    try {
      const startTime = performance.now();
      
      // Validate input
      if (!rails || rails.length < 2) {
        throw new Error('Satin column requires at least 2 rails');
      }
      
      if (!rungs || rungs.length === 0) {
        throw new Error('Satin column requires at least 1 rung');
      }
      
      // Generate satin pattern
      const satinPattern = this.generateSatinPattern(rails, rungs, params);
      
      // Convert to advanced stitches
      const stitches = this.convertPatternToStitches(satinPattern, params.thread, 'satin');
      
      // Add underlay if requested
      if (params.underlay) {
        const underlayStitches = this.generateSatinUnderlay(rails, rungs, params);
        stitches.unshift(...underlayStitches);
      }
      
      // Track performance
      const duration = performance.now() - startTime;
      performanceMonitor.trackMetric('satin_stitch_generation', duration, 'ms', 'embroidery', 'InkStitchIntegration');
      
      return stitches;
      
    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'InkStitchIntegration', function: 'generateSatinColumn' },
        ErrorSeverity.MEDIUM,
        ErrorCategory.EMBROIDERY
      );
      return [];
    }
  }

  /**
   * Generate contour fill using InkStitch contour algorithm
   */
  static generateContourFill(
    shape: Polygon,
    params: ContourFillParams
  ): AdvancedStitch[] {
    try {
      const startTime = performance.now();
      
      // Generate contour pattern
      const contourPattern = this.generateContourPattern(shape, params);
      
      // Convert to advanced stitches
      const stitches = this.convertPatternToStitches(contourPattern, params.thread, 'contour');
      
      // Track performance
      const duration = performance.now() - startTime;
      performanceMonitor.trackMetric('contour_fill_generation', duration, 'ms', 'embroidery', 'InkStitchIntegration');
      
      return stitches;
      
    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'InkStitchIntegration', function: 'generateContourFill' },
        ErrorSeverity.MEDIUM,
        ErrorCategory.EMBROIDERY
      );
      return [];
    }
  }

  /**
   * Generate tartan fill using InkStitch tartan algorithm
   */
  static generateTartanFill(
    shape: Polygon,
    params: TartanFillParams
  ): AdvancedStitch[] {
    try {
      const startTime = performance.now();
      
      // Generate tartan pattern
      const tartanPattern = this.generateTartanPattern(shape, params);
      
      // Convert to advanced stitches
      const stitches = this.convertPatternToStitches(tartanPattern, params.thread, 'tartan');
      
      // Track performance
      const duration = performance.now() - startTime;
      performanceMonitor.trackMetric('tartan_fill_generation', duration, 'ms', 'embroidery', 'InkStitchIntegration');
      
      return stitches;
      
    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'InkStitchIntegration', function: 'generateTartanFill' },
        ErrorSeverity.MEDIUM,
        ErrorCategory.EMBROIDERY
      );
      return [];
    }
  }

  /**
   * Generate meander fill using InkStitch meander algorithm
   */
  static generateMeanderFill(
    shape: Polygon,
    params: FillStitchParams
  ): AdvancedStitch[] {
    try {
      const startTime = performance.now();
      
      // Generate meander pattern
      const meanderPattern = this.generateMeanderPattern(shape, params);
      
      // Convert to advanced stitches
      const stitches = this.convertPatternToStitches(meanderPattern, params.thread, 'meander');
      
      // Track performance
      const duration = performance.now() - startTime;
      performanceMonitor.trackMetric('meander_fill_generation', duration, 'ms', 'embroidery', 'InkStitchIntegration');
      
      return stitches;
      
    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'InkStitchIntegration', function: 'generateMeanderFill' },
        ErrorSeverity.MEDIUM,
        ErrorCategory.EMBROIDERY
      );
      return [];
    }
  }

  /**
   * Optimize stitch placement for better quality
   */
  static optimizeStitchPlacement(stitches: AdvancedStitch[]): AdvancedStitch[] {
    try {
      const startTime = performance.now();
      
      // Sort stitches by color and type for better thread management
      const sortedStitches = this.sortStitchesForOptimization(stitches);
      
      // Optimize stitch order to minimize jumps
      const optimizedStitches = this.optimizeStitchOrder(sortedStitches);
      
      // Add jump stitches where needed
      const finalStitches = this.addJumpStitches(optimizedStitches);
      
      // Track performance
      const duration = performance.now() - startTime;
      performanceMonitor.trackMetric('stitch_optimization', duration, 'ms', 'embroidery', 'InkStitchIntegration');
      
      return finalStitches;
      
    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'InkStitchIntegration', function: 'optimizeStitchPlacement' },
        ErrorSeverity.LOW,
        ErrorCategory.EMBROIDERY
      );
      return stitches;
    }
  }

  // Private helper methods

  private static calculateStitchLength(density: number): number {
    // Convert density to stitch length
    const baseLength = 2.0; // mm
    const densityFactor = 1.0 / Math.max(density, 0.1);
    return Math.max(this.MIN_STITCH_LENGTH, Math.min(this.MAX_STITCH_LENGTH, baseLength * densityFactor));
  }

  private static generateFillPattern(
    shape: Polygon,
    stitchLength: number,
    angle: number,
    params: FillStitchParams
  ): LineString[] {
    const patterns: LineString[] = [];
    
    // Calculate bounding box
    const bounds = this.calculateBounds(shape);
    
    // Generate parallel lines
    const lineSpacing = stitchLength * 0.8; // Slightly overlap stitches
    const lines = this.generateParallelLines(bounds, lineSpacing, angle);
    
    // Clip lines to shape
    for (const line of lines) {
      const clippedLine = this.clipLineToPolygon(line, shape);
      if (clippedLine && clippedLine.points.length > 1) {
        patterns.push(clippedLine);
      }
    }
    
    return patterns;
  }

  private static generateSatinPattern(
    rails: LineString[],
    rungs: LineString[],
    params: SatinStitchParams
  ): LineString[] {
    const patterns: LineString[] = [];
    
    // Ensure we have exactly 2 rails
    if (rails.length !== 2) {
      throw new Error('Satin column requires exactly 2 rails');
    }
    
    const rail1 = rails[0];
    const rail2 = rails[1];
    
    // Generate satin stitches between rails
    for (const rung of rungs) {
      const satinLine = this.generateSatinLine(rail1, rail2, rung, params);
      if (satinLine && satinLine.points.length > 1) {
        patterns.push(satinLine);
      }
    }
    
    return patterns;
  }

  private static generateContourPattern(
    shape: Polygon,
    params: ContourFillParams
  ): LineString[] {
    const patterns: LineString[] = [];
    
    // Generate contour lines
    const contourSpacing = params.contourSpacing || 1.0;
    const contours = this.generateContourLines(shape, contourSpacing);
    
    for (const contour of contours) {
      if (contour.points.length > 1) {
        patterns.push(contour);
      }
    }
    
    return patterns;
  }

  private static generateTartanPattern(
    shape: Polygon,
    params: TartanFillParams
  ): LineString[] {
    const patterns: LineString[] = [];
    
    // Generate tartan stripes
    const stripes = this.generateTartanStripes(shape, params);
    
    for (const stripe of stripes) {
      if (stripe.points.length > 1) {
        patterns.push(stripe);
      }
    }
    
    return patterns;
  }

  private static generateMeanderPattern(
    shape: Polygon,
    params: FillStitchParams
  ): LineString[] {
    const patterns: LineString[] = [];
    
    // Generate meander lines (organic, flowing pattern)
    const meanderLines = this.generateMeanderLines(shape, params);
    
    for (const line of meanderLines) {
      if (line.points.length > 1) {
        patterns.push(line);
      }
    }
    
    return patterns;
  }

  private static convertPatternToStitches(
    patterns: LineString[],
    thread: ThreadProperties,
    type: string
  ): AdvancedStitch[] {
    const stitches: AdvancedStitch[] = [];
    
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const stitch = this.createAdvancedStitch(pattern, thread, type, i);
      stitches.push(stitch);
    }
    
    return stitches;
  }

  private static createAdvancedStitch(
    pattern: LineString,
    thread: ThreadProperties,
    type: string,
    index: number
  ): AdvancedStitch {
    return {
      id: `stitch_${type}_${index}_${Date.now()}`,
      type: type as any,
      points: pattern.points.map(p => ({ x: p.x, y: p.y, z: 0 })),
      thread,
      fabric: {
        type: 'cotton',
        color: '#ffffff',
        weave: 'plain',
        stretch: 0.1,
        thickness: 0.5,
        roughness: 0.5,
        normalMap: 'cotton_normal'
      },
      density: 1.0,
      tension: 1.0,
      direction: 0,
      length: this.calculateLineLength(pattern),
      width: thread.thickness,
      height: thread.thickness * 0.5,
      shadowOffset: { x: 0, y: 0, z: 0 },
      normal: { x: 0, y: 0, z: 1 },
      uv: pattern.points.map((_, i) => ({ u: i / (pattern.points.length - 1), v: 0 })),
      material: {
        albedo: thread.color,
        normal: 'thread_normal',
        roughness: thread.roughness,
        metallic: thread.metallic ? 1.0 : 0.0,
        emission: thread.glowIntensity > 0 ? thread.color : '#000000',
        ao: 'thread_ao',
        height: thread.thickness * 0.1
      }
    };
  }

  private static calculateBounds(shape: Polygon): { minX: number; minY: number; maxX: number; maxY: number } {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (const point of shape.exterior.points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    
    return { minX, minY, maxX, maxY };
  }

  private static generateParallelLines(
    bounds: { minX: number; minY: number; maxX: number; maxY: number },
    spacing: number,
    angle: number
  ): LineString[] {
    const lines: LineString[] = [];
    
    // Calculate line count
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const diagonal = Math.sqrt(width * width + height * height);
    const lineCount = Math.ceil(diagonal / spacing);
    
    // Generate lines
    for (let i = 0; i < lineCount; i++) {
      const offset = i * spacing;
      const line = this.generateLineAtOffset(bounds, offset, angle);
      if (line) {
        lines.push(line);
      }
    }
    
    return lines;
  }

  private static generateLineAtOffset(
    bounds: { minX: number; minY: number; maxX: number; maxY: number },
    offset: number,
    angle: number
  ): LineString | null {
    // Calculate line endpoints
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    
    const length = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 1.5;
    
    const startX = centerX - cos * length / 2 + sin * offset;
    const startY = centerY - sin * length / 2 - cos * offset;
    const endX = centerX + cos * length / 2 + sin * offset;
    const endY = centerY + sin * length / 2 - cos * offset;
    
    return {
      points: [
        { x: startX, y: startY },
        { x: endX, y: endY }
      ]
    };
  }

  private static clipLineToPolygon(line: LineString, polygon: Polygon): LineString | null {
    // Simple line-polygon intersection
    // In a full implementation, this would use proper geometric algorithms
    const points: Point[] = [];
    
    for (let i = 0; i < line.points.length - 1; i++) {
      const start = line.points[i];
      const end = line.points[i + 1];
      
      // Check if both points are inside polygon
      if (this.pointInPolygon(start, polygon) && this.pointInPolygon(end, polygon)) {
        points.push(start, end);
      } else if (this.pointInPolygon(start, polygon) || this.pointInPolygon(end, polygon)) {
        // One point is inside, find intersection
        const intersection = this.findLinePolygonIntersection(start, end, polygon);
        if (intersection) {
          points.push(intersection);
        }
      }
    }
    
    return points.length > 1 ? { points } : null;
  }

  private static pointInPolygon(point: Point, polygon: Polygon): boolean {
    // Ray casting algorithm
    let inside = false;
    const x = point.x;
    const y = point.y;
    
    for (let i = 0, j = polygon.exterior.points.length - 1; i < polygon.exterior.points.length; j = i++) {
      const xi = polygon.exterior.points[i].x;
      const yi = polygon.exterior.points[i].y;
      const xj = polygon.exterior.points[j].x;
      const yj = polygon.exterior.points[j].y;
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  private static findLinePolygonIntersection(
    start: Point,
    end: Point,
    polygon: Polygon
  ): Point | null {
    // Find intersection with polygon boundary
    // This is a simplified implementation
    for (let i = 0; i < polygon.exterior.points.length; i++) {
      const p1 = polygon.exterior.points[i];
      const p2 = polygon.exterior.points[(i + 1) % polygon.exterior.points.length];
      
      const intersection = this.lineIntersection(start, end, p1, p2);
      if (intersection) {
        return intersection;
      }
    }
    
    return null;
  }

  private static lineIntersection(
    p1: Point, p2: Point,
    p3: Point, p4: Point
  ): Point | null {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    const x4 = p4.x, y4 = p4.y;
    
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-10) return null;
    
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }
    
    return null;
  }

  private static generateSatinLine(
    rail1: LineString,
    rail2: LineString,
    rung: LineString,
    params: SatinStitchParams
  ): LineString | null {
    // Generate satin line between rails
    const points: Point[] = [];
    
    // Find intersection points with rails
    const intersection1 = this.findLineIntersection(rung, rail1);
    const intersection2 = this.findLineIntersection(rung, rail2);
    
    if (intersection1 && intersection2) {
      // Generate satin stitches between intersections
      const stitchCount = Math.ceil(this.calculateDistance(intersection1, intersection2) / params.density);
      
      for (let i = 0; i <= stitchCount; i++) {
        const t = i / stitchCount;
        const x = intersection1.x + t * (intersection2.x - intersection1.x);
        const y = intersection1.y + t * (intersection2.y - intersection1.y);
        points.push({ x, y });
      }
    }
    
    return points.length > 1 ? { points } : null;
  }

  private static findLineIntersection(line1: LineString, line2: LineString): Point | null {
    if (line1.points.length < 2 || line2.points.length < 2) return null;
    
    for (let i = 0; i < line1.points.length - 1; i++) {
      for (let j = 0; j < line2.points.length - 1; j++) {
        const intersection = this.lineIntersection(
          line1.points[i], line1.points[i + 1],
          line2.points[j], line2.points[j + 1]
        );
        if (intersection) return intersection;
      }
    }
    
    return null;
  }

  private static calculateDistance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private static calculateLineLength(line: LineString): number {
    let length = 0;
    for (let i = 0; i < line.points.length - 1; i++) {
      length += this.calculateDistance(line.points[i], line.points[i + 1]);
    }
    return length;
  }

  private static generateContourLines(shape: Polygon, spacing: number): LineString[] {
    // Generate contour lines by offsetting the polygon boundary
    const contours: LineString[] = [];
    
    // Start with the exterior boundary
    contours.push(shape.exterior);
    
    // Generate offset contours
    let currentOffset = spacing;
    const maxOffset = this.calculateMaxOffset(shape);
    
    while (currentOffset < maxOffset) {
      const offsetContour = this.offsetPolygon(shape, currentOffset);
      if (offsetContour) {
        contours.push(offsetContour);
      }
      currentOffset += spacing;
    }
    
    return contours;
  }

  private static calculateMaxOffset(shape: Polygon): number {
    // Calculate maximum offset based on polygon size
    const bounds = this.calculateBounds(shape);
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    return Math.min(width, height) / 4;
  }

  private static offsetPolygon(shape: Polygon, offset: number): LineString | null {
    // Simple polygon offset implementation
    // In a full implementation, this would use proper geometric algorithms
    const points: Point[] = [];
    
    for (let i = 0; i < shape.exterior.points.length; i++) {
      const prev = shape.exterior.points[(i - 1 + shape.exterior.points.length) % shape.exterior.points.length];
      const curr = shape.exterior.points[i];
      const next = shape.exterior.points[(i + 1) % shape.exterior.points.length];
      
      // Calculate offset point
      const offsetPoint = this.calculateOffsetPoint(prev, curr, next, offset);
      points.push(offsetPoint);
    }
    
    return points.length > 2 ? { points } : null;
  }

  private static calculateOffsetPoint(prev: Point, curr: Point, next: Point, offset: number): Point {
    // Calculate offset point for polygon offset
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    
    const nx1 = -dy1 / len1;
    const ny1 = dx1 / len1;
    const nx2 = -dy2 / len2;
    const ny2 = dx2 / len2;
    
    const nx = (nx1 + nx2) / 2;
    const ny = (ny1 + ny2) / 2;
    const len = Math.sqrt(nx * nx + ny * ny);
    
    return {
      x: curr.x + (nx / len) * offset,
      y: curr.y + (ny / len) * offset
    };
  }

  private static generateTartanStripes(shape: Polygon, params: TartanFillParams): LineString[] {
    // Generate tartan stripe pattern
    const stripes: LineString[] = [];
    
    // Generate horizontal stripes
    const bounds = this.calculateBounds(shape);
    const stripeWidth = params.stripeWidth || 2.0;
    const stripeSpacing = params.stripeSpacing || 4.0;
    
    for (let y = bounds.minY; y < bounds.maxY; y += stripeSpacing) {
      const stripe = {
        points: [
          { x: bounds.minX, y },
          { x: bounds.maxX, y }
        ]
      };
      stripes.push(stripe);
    }
    
    // Generate vertical stripes
    for (let x = bounds.minX; x < bounds.maxX; x += stripeSpacing) {
      const stripe = {
        points: [
          { x, y: bounds.minY },
          { x, y: bounds.maxY }
        ]
      };
      stripes.push(stripe);
    }
    
    return stripes;
  }

  private static generateMeanderLines(shape: Polygon, params: FillStitchParams): LineString[] {
    // Generate organic, flowing meander pattern
    const lines: LineString[] = [];
    
    // This is a simplified meander implementation
    // In a full implementation, this would use more sophisticated algorithms
    const bounds = this.calculateBounds(shape);
    const spacing = this.calculateStitchLength(params.density);
    
    let y = bounds.minY;
    while (y < bounds.maxY) {
      const line = this.generateMeanderLine(bounds, y, spacing);
      if (line) {
        lines.push(line);
      }
      y += spacing;
    }
    
    return lines;
  }

  private static generateMeanderLine(
    bounds: { minX: number; minY: number; maxX: number; maxY: number },
    y: number,
    spacing: number
  ): LineString | null {
    const points: Point[] = [];
    const width = bounds.maxX - bounds.minX;
    const segments = Math.ceil(width / spacing);
    
    for (let i = 0; i <= segments; i++) {
      const x = bounds.minX + (i / segments) * width;
      const offset = Math.sin((i / segments) * Math.PI * 4) * spacing * 0.3;
      points.push({ x, y: y + offset });
    }
    
    return points.length > 1 ? { points } : null;
  }

  private static generateUnderlayStitches(shape: Polygon, params: FillStitchParams): AdvancedStitch[] {
    // Generate underlay stitches
    const underlayParams = {
      ...params,
      density: params.underlayDensity || params.density * 2,
      angle: params.underlayAngle || params.angle + 90
    };
    
    return this.generateFillStitch(shape, underlayParams);
  }

  private static generateSatinUnderlay(
    rails: LineString[],
    rungs: LineString[],
    params: SatinStitchParams
  ): AdvancedStitch[] {
    // Generate satin underlay
    const underlayParams = {
      ...params,
      density: params.underlayDensity || params.density * 2,
      angle: params.underlayAngle || params.angle + 90
    };
    
    return this.generateSatinColumn(rails, rungs, underlayParams);
  }

  private static sortStitchesForOptimization(stitches: AdvancedStitch[]): AdvancedStitch[] {
    // Sort stitches by color, then by type, then by position
    return stitches.sort((a, b) => {
      // First by color
      if (a.thread.color !== b.thread.color) {
        return a.thread.color.localeCompare(b.thread.color);
      }
      
      // Then by type
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      
      // Then by position (left to right, top to bottom)
      const aCenter = this.calculateCenter(a);
      const bCenter = this.calculateCenter(b);
      
      if (Math.abs(aCenter.y - bCenter.y) > 1) {
        return aCenter.y - bCenter.y;
      }
      
      return aCenter.x - bCenter.x;
    });
  }

  private static calculateCenter(stitch: AdvancedStitch): Point {
    const x = stitch.points.reduce((sum, p) => sum + p.x, 0) / stitch.points.length;
    const y = stitch.points.reduce((sum, p) => sum + p.y, 0) / stitch.points.length;
    return { x, y };
  }

  private static optimizeStitchOrder(stitches: AdvancedStitch[]): AdvancedStitch[] {
    // Optimize stitch order to minimize jumps
    const optimized: AdvancedStitch[] = [];
    const remaining = [...stitches];
    
    // Start with the first stitch
    if (remaining.length > 0) {
      optimized.push(remaining.shift()!);
    }
    
    // Greedily select the closest remaining stitch
    while (remaining.length > 0) {
      const lastStitch = optimized[optimized.length - 1];
      const lastPoint = lastStitch.points[lastStitch.points.length - 1];
      
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      for (let i = 0; i < remaining.length; i++) {
        const stitch = remaining[i];
        const firstPoint = stitch.points[0];
        const distance = this.calculateDistance(lastPoint, firstPoint);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }
      
      optimized.push(remaining.splice(closestIndex, 1)[0]);
    }
    
    return optimized;
  }

  private static addJumpStitches(stitches: AdvancedStitch[]): AdvancedStitch[] {
    // Add jump stitches between distant stitches
    const result: AdvancedStitch[] = [];
    
    for (let i = 0; i < stitches.length; i++) {
      result.push(stitches[i]);
      
      if (i < stitches.length - 1) {
        const current = stitches[i];
        const next = stitches[i + 1];
        
        const currentEnd = current.points[current.points.length - 1];
        const nextStart = next.points[0];
        
        const distance = this.calculateDistance(currentEnd, nextStart);
        
        // Add jump stitch if distance is too large
        if (distance > 5.0) { // 5mm threshold
          const jumpStitch = this.createJumpStitch(currentEnd, nextStart);
          result.push(jumpStitch);
        }
      }
    }
    
    return result;
  }

  private static createJumpStitch(start: Point, end: Point): AdvancedStitch {
    return {
      id: `jump_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'running-stitch',
      points: [start, end],
      thread: {
        type: 'polyester',
        color: '#000000',
        thickness: 0.1,
        twist: 0,
        sheen: 0,
        roughness: 1.0,
        metallic: false,
        glowIntensity: 0,
        variegationPattern: ''
      },
      fabric: {
        type: 'cotton',
        color: '#ffffff',
        weave: 'plain',
        stretch: 0.1,
        thickness: 0.5,
        roughness: 0.5,
        normalMap: 'cotton_normal'
      },
      density: 1.0,
      tension: 1.0,
      direction: 0,
      length: this.calculateDistance(start, end),
      width: 0.1,
      height: 0.05,
      shadowOffset: { x: 0, y: 0, z: 0 },
      normal: { x: 0, y: 0, z: 1 },
      uv: [{ u: 0, v: 0 }, { u: 1, v: 0 }],
      material: {
        albedo: '#000000',
        normal: 'thread_normal',
        roughness: 1.0,
        metallic: 0.0,
        emission: '#000000',
        ao: 'thread_ao',
        height: 0.05
      }
    };
  }
}

export default InkStitchIntegration;
