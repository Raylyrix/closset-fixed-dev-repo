// Advanced path operations similar to Photoshop
// Union, intersection, difference, exclusion, etc.

import { Point2D, BoundingBox, pointInPolygon, calculateBoundingBox } from './vectorMath';

export interface PathOperation {
  type: 'union' | 'intersection' | 'difference' | 'exclusion' | 'xor';
  path1: Point2D[];
  path2: Point2D[];
}

export interface PathSegment {
  start: Point2D;
  end: Point2D;
  control1?: Point2D;
  control2?: Point2D;
}

// Convert path points to segments
export function pointsToSegments(points: Point2D[], closed: boolean = false): PathSegment[] {
  const segments: PathSegment[] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    segments.push({
      start: points[i],
      end: points[i + 1]
    });
  }
  
  if (closed && points.length > 2) {
    segments.push({
      start: points[points.length - 1],
      end: points[0]
    });
  }
  
  return segments;
}

// Find intersection points between two line segments
export function lineIntersection(
  p1: Point2D, p2: Point2D,
  p3: Point2D, p4: Point2D
): Point2D | null {
  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;
  const x4 = p4.x, y4 = p4.y;
  
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  if (Math.abs(denom) < 1e-10) {
    return null; // Lines are parallel
  }
  
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

// Calculate path union (combine two paths)
export function pathUnion(path1: Point2D[], path2: Point2D[]): Point2D[] {
  // Simple implementation - merge bounding boxes
  const bbox1 = calculateBoundingBox(path1);
  const bbox2 = calculateBoundingBox(path2);
  
  const unionBbox = {
    x: Math.min(bbox1.x, bbox2.x),
    y: Math.min(bbox1.y, bbox2.y),
    width: Math.max(bbox1.x + bbox1.width, bbox2.x + bbox2.width) - Math.min(bbox1.x, bbox2.x),
    height: Math.max(bbox1.y + bbox1.height, bbox2.y + bbox2.height) - Math.min(bbox1.y, bbox2.y)
  };
  
  // Create a simple rectangular path for union
  return [
    { x: unionBbox.x, y: unionBbox.y },
    { x: unionBbox.x + unionBbox.width, y: unionBbox.y },
    { x: unionBbox.x + unionBbox.width, y: unionBbox.y + unionBbox.height },
    { x: unionBbox.x, y: unionBbox.y + unionBbox.height }
  ];
}

// Calculate path intersection
export function pathIntersection(path1: Point2D[], path2: Point2D[]): Point2D[] {
  const bbox1 = calculateBoundingBox(path1);
  const bbox2 = calculateBoundingBox(path2);
  
  const intersectionBbox = {
    x: Math.max(bbox1.x, bbox2.x),
    y: Math.max(bbox1.y, bbox2.y),
    width: Math.min(bbox1.x + bbox1.width, bbox2.x + bbox2.width) - Math.max(bbox1.x, bbox2.x),
    height: Math.min(bbox1.y + bbox1.height, bbox2.y + bbox2.height) - Math.max(bbox1.y, bbox2.y)
  };
  
  if (intersectionBbox.width <= 0 || intersectionBbox.height <= 0) {
    return []; // No intersection
  }
  
  return [
    { x: intersectionBbox.x, y: intersectionBbox.y },
    { x: intersectionBbox.x + intersectionBbox.width, y: intersectionBbox.y },
    { x: intersectionBbox.x + intersectionBbox.width, y: intersectionBbox.y + intersectionBbox.height },
    { x: intersectionBbox.x, y: intersectionBbox.y + intersectionBbox.height }
  ];
}

// Calculate path difference (path1 - path2)
export function pathDifference(path1: Point2D[], path2: Point2D[]): Point2D[] {
  // For now, return path1 as-is
  // In a full implementation, this would calculate the actual difference
  return [...path1];
}

// Calculate path exclusion (path1 XOR path2)
export function pathExclusion(path1: Point2D[], path2: Point2D[]): Point2D[] {
  const union = pathUnion(path1, path2);
  const intersection = pathIntersection(path1, path2);
  
  if (intersection.length === 0) {
    return union;
  }
  
  // Return union minus intersection
  return union.filter(point => !pointInPolygon(point, intersection));
}

// Offset path (expand or contract)
export function offsetPath(points: Point2D[], offset: number): Point2D[] {
  if (points.length < 2) return points;
  
  const result: Point2D[] = [];
  
  for (let i = 0; i < points.length; i++) {
    const prev = i === 0 ? points[points.length - 1] : points[i - 1];
    const current = points[i];
    const next = i === points.length - 1 ? points[0] : points[i + 1];
    
    // Calculate perpendicular vector
    const angle1 = Math.atan2(current.y - prev.y, current.x - prev.x);
    const angle2 = Math.atan2(next.y - current.y, next.x - current.x);
    const bisectorAngle = (angle1 + angle2) / 2;
    
    const offsetX = Math.cos(bisectorAngle + Math.PI / 2) * offset;
    const offsetY = Math.sin(bisectorAngle + Math.PI / 2) * offset;
    
    result.push({
      x: current.x + offsetX,
      y: current.y + offsetY
    });
  }
  
  return result;
}

// Simplify path by removing redundant points
export function simplifyPath(points: Point2D[], tolerance: number = 1): Point2D[] {
  if (points.length <= 2) return points;
  
  const result: Point2D[] = [points[0]];
  
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const current = points[i];
    const next = points[i + 1];
    
    // Calculate angle change
    const angle1 = Math.atan2(current.y - prev.y, current.x - prev.x);
    const angle2 = Math.atan2(next.y - current.y, next.x - current.x);
    const angleDiff = Math.abs(angle1 - angle2);
    
    // Keep point if angle change is significant
    if (angleDiff > tolerance * 0.1) {
      result.push(current);
    }
  }
  
  result.push(points[points.length - 1]);
  return result;
}

// Smooth path using moving average
export function smoothPath(points: Point2D[], windowSize: number = 3): Point2D[] {
  if (points.length < windowSize) return points;
  
  const result: Point2D[] = [];
  
  for (let i = 0; i < points.length; i++) {
    let sumX = 0;
    let sumY = 0;
    let count = 0;
    
    for (let j = Math.max(0, i - Math.floor(windowSize / 2)); 
         j <= Math.min(points.length - 1, i + Math.floor(windowSize / 2)); 
         j++) {
      sumX += points[j].x;
      sumY += points[j].y;
      count++;
    }
    
    result.push({
      x: sumX / count,
      y: sumY / count
    });
  }
  
  return result;
}

// Convert path to smooth curves
export function pathToCurves(points: Point2D[], tension: number = 0.5): PathSegment[] {
  if (points.length < 2) return [];
  
  const segments: PathSegment[] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    
    // Calculate control points for smooth curve
    const prev = i > 0 ? points[i - 1] : null;
    const afterNext = i < points.length - 2 ? points[i + 2] : null;
    
    const control1 = calculateControlPoint(prev, current, next, tension, 'out');
    const control2 = calculateControlPoint(current, next, afterNext, tension, 'in');
    
    segments.push({
      start: current,
      end: next,
      control1,
      control2
    });
  }
  
  return segments;
}

// Calculate control point for smooth curves
function calculateControlPoint(
  prev: Point2D | null,
  current: Point2D,
  next: Point2D | null,
  tension: number,
  direction: 'in' | 'out'
): Point2D {
  if (!prev && !next) return current;
  
  let angle: number;
  let distance: number;
  
  if (direction === 'out') {
    if (next) {
      angle = Math.atan2(next.y - current.y, next.x - current.x);
      distance = Math.sqrt((next.x - current.x) ** 2 + (next.y - current.y) ** 2) * tension;
    } else {
      angle = Math.atan2(current.y - prev!.y, current.x - prev!.x);
      distance = Math.sqrt((current.x - prev!.x) ** 2 + (current.y - prev!.y) ** 2) * tension;
    }
  } else {
    if (prev) {
      angle = Math.atan2(current.y - prev.y, current.x - prev.x);
      distance = Math.sqrt((current.x - prev.x) ** 2 + (current.y - prev.y) ** 2) * tension;
    } else {
      angle = Math.atan2(next!.y - current.y, next!.x - current.x);
      distance = Math.sqrt((next!.x - current.x) ** 2 + (next!.y - current.y) ** 2) * tension;
    }
  }
  
  return {
    x: current.x + Math.cos(angle) * distance,
    y: current.y + Math.sin(angle) * distance
  };
}

// Check if two paths overlap
export function pathsOverlap(path1: Point2D[], path2: Point2D[]): boolean {
  const bbox1 = calculateBoundingBox(path1);
  const bbox2 = calculateBoundingBox(path2);
  
  return !(bbox1.x + bbox1.width < bbox2.x || 
           bbox2.x + bbox2.width < bbox1.x || 
           bbox1.y + bbox1.height < bbox2.y || 
           bbox2.y + bbox2.height < bbox1.y);
}

// Calculate path area (for closed paths)
export function calculatePathArea(points: Point2D[]): number {
  if (points.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  
  return Math.abs(area) / 2;
}

// Calculate path perimeter
export function calculatePathPerimeter(points: Point2D[], closed: boolean = false): number {
  if (points.length < 2) return 0;
  
  let perimeter = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  
  if (closed && points.length > 2) {
    const dx = points[0].x - points[points.length - 1].x;
    const dy = points[0].y - points[points.length - 1].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  
  return perimeter;
}
