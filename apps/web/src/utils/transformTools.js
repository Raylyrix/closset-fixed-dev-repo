// Advanced transform tools similar to Photoshop
// Scale, rotate, skew, perspective, etc.
// Create transform handles for a selection
export function createTransformHandles(bounds) {
    const handles = [];
    // Corner handles
    handles.push({
        type: 'corner',
        position: { x: bounds.x, y: bounds.y },
        bounds: { x: bounds.x - 4, y: bounds.y - 4, width: 8, height: 8 },
        active: false
    });
    handles.push({
        type: 'corner',
        position: { x: bounds.x + bounds.width, y: bounds.y },
        bounds: { x: bounds.x + bounds.width - 4, y: bounds.y - 4, width: 8, height: 8 },
        active: false
    });
    handles.push({
        type: 'corner',
        position: { x: bounds.x, y: bounds.y + bounds.height },
        bounds: { x: bounds.x - 4, y: bounds.y + bounds.height - 4, width: 8, height: 8 },
        active: false
    });
    handles.push({
        type: 'corner',
        position: { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        bounds: { x: bounds.x + bounds.width - 4, y: bounds.y + bounds.height - 4, width: 8, height: 8 },
        active: false
    });
    // Edge handles
    handles.push({
        type: 'edge',
        position: { x: bounds.x + bounds.width / 2, y: bounds.y },
        bounds: { x: bounds.x + bounds.width / 2 - 4, y: bounds.y - 4, width: 8, height: 8 },
        active: false
    });
    handles.push({
        type: 'edge',
        position: { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
        bounds: { x: bounds.x + bounds.width / 2 - 4, y: bounds.y + bounds.height - 4, width: 8, height: 8 },
        active: false
    });
    handles.push({
        type: 'edge',
        position: { x: bounds.x, y: bounds.y + bounds.height / 2 },
        bounds: { x: bounds.x - 4, y: bounds.y + bounds.height / 2 - 4, width: 8, height: 8 },
        active: false
    });
    handles.push({
        type: 'edge',
        position: { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
        bounds: { x: bounds.x + bounds.width - 4, y: bounds.y + bounds.height / 2 - 4, width: 8, height: 8 },
        active: false
    });
    // Center handle
    handles.push({
        type: 'center',
        position: { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 },
        bounds: { x: bounds.x + bounds.width / 2 - 4, y: bounds.y + bounds.height / 2 - 4, width: 8, height: 8 },
        active: false
    });
    return handles;
}
// Scale points around a center point
export function scalePoints(points, scaleX, scaleY, center) {
    return points.map(point => ({
        x: center.x + (point.x - center.x) * scaleX,
        y: center.y + (point.y - center.y) * scaleY
    }));
}
// Rotate points around a center point
export function rotatePoints(points, angle, center) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return points.map(point => {
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        return {
            x: center.x + dx * cos - dy * sin,
            y: center.y + dx * sin + dy * cos
        };
    });
}
// Skew points
export function skewPoints(points, skewX, skewY, center) {
    return points.map(point => {
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        return {
            x: point.x + dy * Math.tan(skewX),
            y: point.y + dx * Math.tan(skewY)
        };
    });
}
// Apply perspective transform
export function perspectiveTransform(points, perspective, center) {
    return points.map(point => {
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0)
            return point;
        const factor = 1 / (1 + perspective * distance / 1000);
        return {
            x: center.x + dx * factor,
            y: center.y + dy * factor
        };
    });
}
// Flip points horizontally
export function flipPointsHorizontally(points, center) {
    return points.map(point => ({
        x: center.x - (point.x - center.x),
        y: point.y
    }));
}
// Flip points vertically
export function flipPointsVertically(points, center) {
    return points.map(point => ({
        x: point.x,
        y: center.y - (point.y - center.y)
    }));
}
// Apply transform to points
export function applyTransform(points, transform) {
    let result = [...points];
    if (transform.params.scaleX !== undefined || transform.params.scaleY !== undefined) {
        result = scalePoints(result, transform.params.scaleX || 1, transform.params.scaleY || 1, transform.center);
    }
    if (transform.params.rotation !== undefined) {
        result = rotatePoints(result, transform.params.rotation, transform.center);
    }
    if (transform.params.skewX !== undefined || transform.params.skewY !== undefined) {
        result = skewPoints(result, transform.params.skewX || 0, transform.params.skewY || 0, transform.center);
    }
    if (transform.params.perspective !== undefined) {
        result = perspectiveTransform(result, transform.params.perspective, transform.center);
    }
    if (transform.params.flipX) {
        result = flipPointsHorizontally(result, transform.center);
    }
    if (transform.params.flipY) {
        result = flipPointsVertically(result, transform.center);
    }
    return result;
}
// Calculate transform matrix
export function calculateTransformMatrix(transform) {
    const { center, params } = transform;
    const matrix = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ];
    // Translation to origin
    const translateToOrigin = [
        1, 0, -center.x,
        0, 1, -center.y,
        0, 0, 1
    ];
    // Translation back
    const translateBack = [
        1, 0, center.x,
        0, 1, center.y,
        0, 0, 1
    ];
    // Scale matrix
    const scale = [
        params.scaleX || 1, 0, 0,
        0, params.scaleY || 1, 0,
        0, 0, 1
    ];
    // Rotation matrix
    const cos = Math.cos(params.rotation || 0);
    const sin = Math.sin(params.rotation || 0);
    const rotation = [
        cos, -sin, 0,
        sin, cos, 0,
        0, 0, 1
    ];
    // Skew matrix
    const skewX = Math.tan(params.skewX || 0);
    const skewY = Math.tan(params.skewY || 0);
    const skew = [
        1, skewX, 0,
        skewY, 1, 0,
        0, 0, 1
    ];
    // Combine matrices (simplified)
    return multiplyMatrices(multiplyMatrices(multiplyMatrices(translateBack, multiplyMatrices(rotation, multiplyMatrices(scale, translateToOrigin))), skew), matrix);
}
// Multiply two 3x3 matrices
function multiplyMatrices(a, b) {
    const result = new Array(9);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            result[i * 3 + j] = 0;
            for (let k = 0; k < 3; k++) {
                result[i * 3 + j] += a[i * 3 + k] * b[k * 3 + j];
            }
        }
    }
    return result;
}
// Apply matrix transform to point
export function applyMatrixTransform(point, matrix) {
    return {
        x: matrix[0] * point.x + matrix[1] * point.y + matrix[2],
        y: matrix[3] * point.x + matrix[4] * point.y + matrix[5]
    };
}
// Reset transform
export function resetTransform() {
    return {
        id: `transform_${Date.now()}`,
        type: 'scale',
        center: { x: 0, y: 0 },
        params: {
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            skewX: 0,
            skewY: 0,
            perspective: 0,
            flipX: false,
            flipY: false
        },
        active: true
    };
}
// Copy transform
export function copyTransform(transform) {
    return {
        ...transform,
        id: `transform_${Date.now()}`,
        params: { ...transform.params }
    };
}
// Interpolate between two transforms
export function interpolateTransforms(start, end, t) {
    return {
        id: `transform_${Date.now()}`,
        type: start.type,
        center: {
            x: start.center.x + (end.center.x - start.center.x) * t,
            y: start.center.y + (end.center.y - start.center.y) * t
        },
        params: {
            scaleX: (start.params.scaleX || 1) + ((end.params.scaleX || 1) - (start.params.scaleX || 1)) * t,
            scaleY: (start.params.scaleY || 1) + ((end.params.scaleY || 1) - (start.params.scaleY || 1)) * t,
            rotation: (start.params.rotation || 0) + ((end.params.rotation || 0) - (start.params.rotation || 0)) * t,
            skewX: (start.params.skewX || 0) + ((end.params.skewX || 0) - (start.params.skewX || 0)) * t,
            skewY: (start.params.skewY || 0) + ((end.params.skewY || 0) - (start.params.skewY || 0)) * t,
            perspective: (start.params.perspective || 0) + ((end.params.perspective || 0) - (start.params.perspective || 0)) * t,
            flipX: t > 0.5 ? end.params.flipX : start.params.flipX,
            flipY: t > 0.5 ? end.params.flipY : start.params.flipY
        },
        active: true
    };
}
