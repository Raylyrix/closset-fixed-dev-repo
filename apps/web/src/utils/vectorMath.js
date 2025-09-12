// Advanced vector mathematics and Bezier curve algorithms
// Photoshop-like vector operations and calculations
// Calculate distance between two points
export function distance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}
// Calculate angle between two points
export function angle(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}
// Calculate midpoint between two points
export function midpoint(p1, p2) {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
    };
}
// Calculate perpendicular vector
export function perpendicular(p1, p2, distance = 1) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0)
        return { x: 0, y: 0 };
    return {
        x: (-dy / len) * distance,
        y: (dx / len) * distance
    };
}
// Calculate control points for smooth curves
export function calculateSmoothControlPoints(prev, current, next, tension = 0.5) {
    const controlIn = { x: 0, y: 0 };
    const controlOut = { x: 0, y: 0 };
    if (prev && next) {
        // Both neighbors exist - create smooth curve
        const prevAngle = angle(prev, current);
        const nextAngle = angle(current, next);
        const avgAngle = (prevAngle + nextAngle) / 2;
        const dist1 = distance(prev, current) * tension;
        const dist2 = distance(current, next) * tension;
        controlIn.x = current.x - Math.cos(avgAngle) * dist1;
        controlIn.y = current.y - Math.sin(avgAngle) * dist1;
        controlOut.x = current.x + Math.cos(avgAngle) * dist2;
        controlOut.y = current.y + Math.sin(avgAngle) * dist2;
    }
    else if (prev) {
        // Only previous point exists
        const dist = distance(prev, current) * tension;
        const angle = Math.atan2(current.y - prev.y, current.x - prev.x);
        controlIn.x = current.x - Math.cos(angle) * dist;
        controlIn.y = current.y - Math.sin(angle) * dist;
        controlOut.x = current.x + Math.cos(angle) * dist;
        controlOut.y = current.y + Math.sin(angle) * dist;
    }
    else if (next) {
        // Only next point exists
        const dist = distance(current, next) * tension;
        const angle = Math.atan2(next.y - current.y, next.x - current.x);
        controlIn.x = current.x - Math.cos(angle) * dist;
        controlIn.y = current.y - Math.sin(angle) * dist;
        controlOut.x = current.x + Math.cos(angle) * dist;
        controlOut.y = current.y + Math.sin(angle) * dist;
    }
    return { controlIn, controlOut };
}
// Calculate control points for symmetric curves
export function calculateSymmetricControlPoints(prev, current, next, tension = 0.5) {
    const { controlIn, controlOut } = calculateSmoothControlPoints(prev, current, next, tension);
    // Make control points symmetric
    const dist = distance(controlIn, current);
    const angle = Math.atan2(controlOut.y - current.y, controlOut.x - current.x);
    return {
        controlIn: {
            x: current.x - Math.cos(angle) * dist,
            y: current.y - Math.sin(angle) * dist
        },
        controlOut: {
            x: current.x + Math.cos(angle) * dist,
            y: current.y + Math.sin(angle) * dist
        }
    };
}
// Calculate control points for auto curves (Photoshop-like)
export function calculateAutoControlPoints(prev, current, next, tension = 0.5) {
    if (!prev && !next) {
        return { controlIn: current, controlOut: current };
    }
    if (!prev) {
        return calculateSmoothControlPoints(null, current, next, tension);
    }
    if (!next) {
        return calculateSmoothControlPoints(prev, current, null, tension);
    }
    // Calculate the angle between the incoming and outgoing vectors
    const inAngle = Math.atan2(current.y - prev.y, current.x - prev.x);
    const outAngle = Math.atan2(next.y - current.y, next.x - current.x);
    // Calculate the angle bisector
    const bisectorAngle = (inAngle + outAngle) / 2;
    // Calculate distances
    const inDist = distance(prev, current) * tension;
    const outDist = distance(current, next) * tension;
    return {
        controlIn: {
            x: current.x - Math.cos(bisectorAngle) * inDist,
            y: current.y - Math.sin(bisectorAngle) * inDist
        },
        controlOut: {
            x: current.x + Math.cos(bisectorAngle) * outDist,
            y: current.y + Math.sin(bisectorAngle) * outDist
        }
    };
}
// Calculate bounding box for a set of points
export function calculateBoundingBox(points) {
    if (points.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }
    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;
    for (const point of points) {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
    }
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}
// Check if a point is inside a polygon
export function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
            (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
            inside = !inside;
        }
    }
    return inside;
}
// Calculate path length
export function calculatePathLength(points) {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
        length += distance(points[i - 1], points[i]);
    }
    return length;
}
// Simplify path using Douglas-Peucker algorithm
export function simplifyPath(points, tolerance = 1) {
    if (points.length <= 2)
        return points;
    const first = points[0];
    const last = points[points.length - 1];
    let maxDistance = 0;
    let maxIndex = 0;
    for (let i = 1; i < points.length - 1; i++) {
        const distance = pointToLineDistance(points[i], first, last);
        if (distance > maxDistance) {
            maxDistance = distance;
            maxIndex = i;
        }
    }
    if (maxDistance > tolerance) {
        const left = simplifyPath(points.slice(0, maxIndex + 1), tolerance);
        const right = simplifyPath(points.slice(maxIndex), tolerance);
        return [...left.slice(0, -1), ...right];
    }
    else {
        return [first, last];
    }
}
// Calculate distance from point to line
function pointToLineDistance(point, lineStart, lineEnd) {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    if (lenSq === 0)
        return distance(point, lineStart);
    const param = dot / lenSq;
    let xx, yy;
    if (param < 0) {
        xx = lineStart.x;
        yy = lineStart.y;
    }
    else if (param > 1) {
        xx = lineEnd.x;
        yy = lineEnd.y;
    }
    else {
        xx = lineStart.x + param * C;
        yy = lineStart.y + param * D;
    }
    return distance(point, { x: xx, y: yy });
}
// Snap point to grid
export function snapToGrid(point, gridSize) {
    return {
        x: Math.round(point.x / gridSize) * gridSize,
        y: Math.round(point.y / gridSize) * gridSize
    };
}
// Snap point to another point
export function snapToPoint(point, snapPoints, snapDistance = 10) {
    for (const snapPoint of snapPoints) {
        if (distance(point, snapPoint) < snapDistance) {
            return snapPoint;
        }
    }
    return point;
}
// Calculate curve through points using Catmull-Rom spline
export function calculateCatmullRomSpline(points, tension = 0.5) {
    if (points.length < 2)
        return points;
    if (points.length === 2)
        return points;
    const result = [];
    const segments = points.length - 1;
    for (let i = 0; i < segments; i++) {
        const p0 = i === 0 ? points[0] : points[i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = i === segments - 1 ? points[i + 1] : points[i + 2];
        const segmentPoints = calculateCatmullRomSegment(p0, p1, p2, p3, tension);
        result.push(...segmentPoints);
    }
    return result;
}
// Calculate a single Catmull-Rom segment
function calculateCatmullRomSegment(p0, p1, p2, p3, tension) {
    const result = [];
    const steps = 20; // Number of points per segment
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const point = catmullRomInterpolate(p0, p1, p2, p3, t, tension);
        result.push(point);
    }
    return result;
}
// Catmull-Rom interpolation
function catmullRomInterpolate(p0, p1, p2, p3, t, tension) {
    const t2 = t * t;
    const t3 = t2 * t;
    const x = 0.5 * ((2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
    const y = 0.5 * ((2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
    return { x, y };
}
