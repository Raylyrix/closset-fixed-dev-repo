/**
 * 🎯 Bezier Curve Engine - Robust Mathematics for Vector Tools
 * 
 * Fixes Bezier curve calculation issues by providing:
 * - Validated control point calculations
 * - Curve validation and repair
 * - Smooth curve generation
 * - Mathematical error prevention
 */

import { VectorPoint, BoundingBox } from './VectorStateManager';

export interface Point2D {
  x: number;
  y: number;
}

export interface CurveConstraints {
  maxControlLength: number;
  minControlLength: number;
  smoothness: number; // 0-1, where 1 is perfectly smooth
  tension: number; // 0-1, where 1 is maximum tension
}

export interface ValidatedControlPoints {
  controlIn: Point2D;
  controlOut: Point2D;
  isValid: boolean;
  warnings: string[];
}

export interface CurveValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  repairedPoints?: VectorPoint[];
}

export interface BezierCurve {
  start: Point2D;
  control1: Point2D;
  control2: Point2D;
  end: Point2D;
  isValid: boolean;
}

export class BezierCurveEngine {
  private static readonly DEFAULT_CONSTRAINTS: CurveConstraints = {
    maxControlLength: 100,
    minControlLength: 5,
    smoothness: 0.8,
    tension: 0.5
  };

  private static readonly EPSILON = 1e-10; // For floating point comparisons
  private static readonly MAX_CURVE_ANGLE = Math.PI * 0.95; // Prevent extreme curves

  /**
   * Calculate validated control points for a vector point
   */
  public static calculateControlPoints(
    prev: Point2D | null,
    current: Point2D,
    next: Point2D | null,
    constraints: CurveConstraints = BezierCurveEngine.DEFAULT_CONSTRAINTS
  ): ValidatedControlPoints {
    const warnings: string[] = [];
    
    try {
      // Validate input
      if (!this.isValidPoint(current)) {
        return {
          controlIn: current,
          controlOut: current,
          isValid: false,
          warnings: ['Invalid current point']
        };
      }

      // Handle edge cases
      if (!prev && !next) {
        return {
          controlIn: current,
          controlOut: current,
          isValid: true,
          warnings: ['Single point - no control points needed']
        };
      }

      if (!prev) {
        return this.calculateSmoothControlPoints(null, current, next, constraints);
      }

      if (!next) {
        return this.calculateSmoothControlPoints(prev, current, null, constraints);
      }

      // Calculate control points for middle point
      return this.calculateMiddleControlPoints(prev, current, next, constraints);

    } catch (error) {
      return {
        controlIn: current,
        controlOut: current,
        isValid: false,
        warnings: [`Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Calculate control points for smooth curves
   */
  private static calculateSmoothControlPoints(
    prev: Point2D | null,
    current: Point2D,
    next: Point2D | null,
    constraints: CurveConstraints
  ): ValidatedControlPoints {
    const warnings: string[] = [];

    if (!prev && !next) {
      return {
        controlIn: current,
        controlOut: current,
        isValid: true,
        warnings: ['No adjacent points for smooth calculation']
      };
    }

    const target = prev || next!;
    const distance = this.distance(current, target);
    const controlLength = Math.min(
      Math.max(distance * constraints.tension, constraints.minControlLength),
      constraints.maxControlLength
    );

    if (distance < this.EPSILON) {
      warnings.push('Points are too close together');
      return {
        controlIn: current,
        controlOut: current,
        isValid: true,
        warnings
      };
    }

    // Calculate direction vector
    const direction = {
      x: (target.x - current.x) / distance,
      y: (target.y - current.y) / distance
    };

    const controlIn = {
      x: current.x - direction.x * controlLength,
      y: current.y - direction.y * controlLength
    };

    const controlOut = {
      x: current.x + direction.x * controlLength,
      y: current.y + direction.y * controlLength
    };

    return {
      controlIn,
      controlOut,
      isValid: true,
      warnings
    };
  }

  /**
   * Calculate control points for middle points with smooth transitions
   */
  private static calculateMiddleControlPoints(
    prev: Point2D,
    current: Point2D,
    next: Point2D,
    constraints: CurveConstraints
  ): ValidatedControlPoints {
    const warnings: string[] = [];

    // Calculate incoming and outgoing vectors
    const inVector = {
      x: current.x - prev.x,
      y: current.y - prev.y
    };
    const outVector = {
      x: next.x - current.x,
      y: next.y - current.y
    };

    const inDistance = this.magnitude(inVector);
    const outDistance = this.magnitude(outVector);

    if (inDistance < this.EPSILON || outDistance < this.EPSILON) {
      warnings.push('Adjacent points are too close together');
      return {
        controlIn: current,
        controlOut: current,
        isValid: true,
        warnings
      };
    }

    // Normalize vectors
    const inNormalized = {
      x: inVector.x / inDistance,
      y: inVector.y / inDistance
    };
    const outNormalized = {
      x: outVector.x / outDistance,
      y: outVector.y / outDistance
    };

    // Calculate angle between vectors
    const angle = Math.acos(
      Math.max(-1, Math.min(1, inNormalized.x * outNormalized.x + inNormalized.y * outNormalized.y))
    );

    if (angle > this.MAX_CURVE_ANGLE) {
      warnings.push('Curve angle is too sharp');
    }

    // Calculate control lengths based on distances and constraints
    const inControlLength = Math.min(
      Math.max(inDistance * constraints.tension, constraints.minControlLength),
      constraints.maxControlLength
    );
    const outControlLength = Math.min(
      Math.max(outDistance * constraints.tension, constraints.minControlLength),
      constraints.maxControlLength
    );

    // Calculate control points
    const controlIn = {
      x: current.x - inNormalized.x * inControlLength,
      y: current.y - inNormalized.y * inControlLength
    };

    const controlOut = {
      x: current.x + outNormalized.x * outControlLength,
      y: current.y + outNormalized.y * outControlLength
    };

    return {
      controlIn,
      controlOut,
      isValid: true,
      warnings
    };
  }

  /**
   * Validate and repair a vector path
   */
  public static validateAndRepair(path: VectorPoint[]): CurveValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const repairedPoints: VectorPoint[] = [];

    if (!path || path.length === 0) {
      errors.push('Path is empty');
      return { isValid: false, errors, warnings };
    }

    // Validate and repair each point
    for (let i = 0; i < path.length; i++) {
      const point = path[i];
      const repairedPoint = this.repairPoint(point, i, path);
      
      if (repairedPoint.warnings.length > 0) {
        warnings.push(...repairedPoint.warnings.map(w => `Point ${i}: ${w}`));
      }
      
      repairedPoints.push(repairedPoint.point);
    }

    // Validate control point relationships
    for (let i = 0; i < repairedPoints.length; i++) {
      const point = repairedPoints[i];
      
      if (point.controlIn && point.controlOut) {
        const validation = this.validateControlPointPair(point);
        if (!validation.isValid) {
          errors.push(`Point ${i}: ${validation.errors.join(', ')}`);
        }
        if (validation.warnings.length > 0) {
          warnings.push(...validation.warnings.map(w => `Point ${i}: ${w}`));
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      repairedPoints
    };
  }

  /**
   * Repair a single point
   */
  private static repairPoint(point: VectorPoint, index: number, path: VectorPoint[]): {
    point: VectorPoint;
    warnings: string[];
  } {
    const warnings: string[] = [];
    const repaired = { ...point };

    // Validate coordinates
    if (!this.isValidPoint(point)) {
      warnings.push('Invalid coordinates, using fallback');
      repaired.x = 0;
      repaired.y = 0;
    }

    // Validate control points
    if (repaired.controlIn && !this.isValidPoint(repaired.controlIn)) {
      warnings.push('Invalid controlIn point, removing');
      delete repaired.controlIn;
    }

    if (repaired.controlOut && !this.isValidPoint(repaired.controlOut)) {
      warnings.push('Invalid controlOut point, removing');
      delete repaired.controlOut;
    }

    // Ensure control points are relative to the main point
    if (repaired.controlIn) {
      repaired.controlIn = {
        x: repaired.controlIn.x - repaired.x,
        y: repaired.controlIn.y - repaired.y
      };
    }

    if (repaired.controlOut) {
      repaired.controlOut = {
        x: repaired.controlOut.x - repaired.x,
        y: repaired.controlOut.y - repaired.y
      };
    }

    return { point: repaired, warnings };
  }

  /**
   * Validate control point pair
   */
  private static validateControlPointPair(point: VectorPoint): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!point.controlIn || !point.controlOut) {
      return { isValid: true, errors, warnings };
    }

    // Check if control points are too far from the main point
    const inDistance = this.magnitude(point.controlIn);
    const outDistance = this.magnitude(point.controlOut);

    if (inDistance > 1000) {
      errors.push('ControlIn point is too far from main point');
    }
    if (outDistance > 1000) {
      errors.push('ControlOut point is too far from main point');
    }

    // Check if control points are too close
    if (inDistance < 0.1) {
      warnings.push('ControlIn point is very close to main point');
    }
    if (outDistance < 0.1) {
      warnings.push('ControlOut point is very close to main point');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate smooth curve from points
   */
  public static generateSmoothCurve(points: Point2D[]): BezierCurve[] {
    if (points.length < 2) {
      return [];
    }

    const curves: BezierCurve[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      
      // Calculate control points
      const prev = i > 0 ? points[i - 1] : null;
      const next = i < points.length - 2 ? points[i + 2] : null;
      
      const controlPoints = this.calculateControlPoints(prev, start, next);
      
      curves.push({
        start,
        control1: {
          x: start.x + (controlPoints.controlOut.x || 0),
          y: start.y + (controlPoints.controlOut.y || 0)
        },
        control2: {
          x: end.x + (controlPoints.controlIn.x || 0),
          y: end.y + (controlPoints.controlIn.y || 0)
        },
        end,
        isValid: controlPoints.isValid
      });
    }

    return curves;
  }

  /**
   * Calculate bounding box for a curve
   */
  public static calculateCurveBounds(curve: BezierCurve): BoundingBox {
    const points = [curve.start, curve.control1, curve.control2, curve.end];
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * Calculate point on curve at parameter t (0-1)
   */
  public static evaluateCurve(curve: BezierCurve, t: number): Point2D {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    return {
      x: uuu * curve.start.x + 3 * uu * t * curve.control1.x + 3 * u * tt * curve.control2.x + ttt * curve.end.x,
      y: uuu * curve.start.y + 3 * uu * t * curve.control1.y + 3 * u * tt * curve.control2.y + ttt * curve.end.y
    };
  }

  // Utility methods
  private static isValidPoint(point: Point2D): boolean {
    return isFinite(point.x) && isFinite(point.y);
  }

  private static distance(p1: Point2D, p2: Point2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private static magnitude(vector: Point2D): number {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }
}

export default BezierCurveEngine;

